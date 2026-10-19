#!/usr/bin/env python3
"""Recover the original sign's continuous PDF trail artwork, labels and symbols.

This is source recovery, never interpolation between gaps in a photograph. The
official PDF contains the full route artwork *before* its printed labels and
endpoint marks. Its native Bezier paths are exported without simplification in
the official 2570 x 3077 image coordinate system. The old visible-only dataset is
an input for provenance and remains unchanged.

python scripts/build-continuous-sign.py --pdf /path/to/official-map.pdf
Dependencies: scripts/requirements-tracing.txt. No geographic operation occurs.
"""
from pathlib import Path
import argparse
import hashlib
import html
import importlib.util
import json
import math

import fitz
import numpy as np
from PIL import Image, ImageDraw
from skimage.morphology import skeletonize

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('visible_tracing', ROOT / 'scripts/trace-all-trails.py')
tr = importlib.util.module_from_spec(spec)
spec.loader.exec_module(tr)


def round_values(values):
    return [round(float(v), 5) for v in values]


def native_bounds(rect, factors):
    return round_values([rect.x0 * factors[0], rect.y0 * factors[1],
                         rect.width * factors[0], rect.height * factors[1]])


def color_hex(color):
    return '#' + ''.join(f'{round(c * 255):02x}' for c in color) if color else 'none'


def source_path(index, drawing, factors, trail_id, suffix='route'):
    """Export move/line/cubic/rect primitives, preserving compound subpaths."""
    commands, previous = [], None
    filled = drawing['type'] != 's'

    def point(p):
        return tuple(round_values([p.x * factors[0], p.y * factors[1]]))

    def command(letter, coords):
        commands.append(letter + ' '.join(format(v, '.5f').rstrip('0').rstrip('.') for v in coords))

    def move(p):
        nonlocal previous
        if previous != p:
            if previous is not None and filled:
                commands.append('Z')
            command('M', p)
        previous = p

    for item in drawing['items']:
        if item[0] == 'l':
            a, b = map(point, item[1:])
            move(a)
            command('L', b)
            previous = b
        elif item[0] == 'c':
            a, b, c, d = map(point, item[1:])
            move(a)
            command('C', b + c + d)
            previous = d
        elif item[0] == 're':
            rect, direction = item[1:]
            corners = [rect.tl, rect.tr, rect.br, rect.bl]
            if direction < 0:
                corners.reverse()
            corners = [point(p) for p in corners]
            move(corners[0])
            for p in corners[1:]:
                command('L', p)
            commands.append('Z')
            previous = None
        else:
            raise ValueError(f'Unreviewed primitive {item[0]} in drawing {index}')
    if previous is not None and (filled or drawing['closePath']):
        commands.append('Z')
    return {'id': f'{trail_id}-{suffix}-drawing-{index}', 'trailId': trail_id,
            'd': ''.join(commands), 'fill': color_hex(drawing['fill']),
            'fillRule': 'evenodd' if drawing['even_odd'] else 'nonzero',
            'stroke': color_hex(drawing['color']),
            'strokeWidth': round(float((drawing['width'] or 0) * factors.mean()), 5),
            'lineCap': ['butt', 'round', 'square'][(drawing['lineCap'] or (0, 0, 0))[0]],
            'lineJoin': ['miter', 'round', 'bevel'][int(drawing['lineJoin'] or 0)],
            'sourceDrawingIndices': [index], 'bounds': native_bounds(drawing['rect'], factors),
            'provenance': 'original PDF artwork, transformed only by the documented image scale'}


def label_indices(drawings, plate):
    """Plate followed by white halo/glyphs within its immediate printed bounds."""
    result = [plate]
    allowed = drawings[plate]['rect'] + (-1.6, -1.6, 1.6, 1.6)
    for i in range(plate + 1, min(plate + 30, len(drawings))):
        d = drawings[i]
        if not d['fill'] or min(d['fill']) < .95 or not allowed.contains(d['rect']):
            break
        result.append(i)
    assert len(result) >= 3, f'No glyphs for label drawing {plate}'
    return result


def label_angle(drawing, factors):
    edges = [np.array([[p.x, p.y] for p in item[1:]]) * factors
             for item in drawing['items'] if item[0] == 'l']
    edge = max(edges, key=lambda e: np.linalg.norm(e[1] - e[0]))
    dx, dy = edge[1] - edge[0]
    angle = math.degrees(math.atan2(dy, dx))
    return round((angle + 90) % 180 - 90, 5)


def marker_groups(drawings, indices):
    """Group only overlapping shapes of one pre-identified printed symbol."""
    groups = []
    for index in indices:
        rect = drawings[index]['rect']
        overlaps = [g for g in groups if (g['rect'] + (-.3, -.3, .3, .3)).intersects(rect)]
        if not overlaps:
            groups.append({'indices': [index], 'rect': fitz.Rect(rect)})
        else:
            first = overlaps[0]
            first['indices'].append(index)
            first['rect'] |= rect
            for g in overlaps[1:]:
                first['indices'] += g['indices']
                first['rect'] |= g['rect']
                groups.remove(g)
    return groups


def validate(data, drawings):
    assert data['coordinateSystem'] == 'image-pixels'
    assert data['georeferencing']['transform'] is None
    assert len(data['trails']) == 22
    assert len([t for t in data['trails'] if t.get('category') != 'auxiliary']) == 20
    assert data['connections'] == []
    ids = [t['id'] for t in data['trails']]
    assert len(set(ids)) == 22
    for collection in ('segments', 'routePaths', 'labels', 'markers'):
        assert len({s['id'] for s in data[collection]}) == len(data[collection])
        for feature in data[collection]:
            assert feature['trailId'] in ids
            assert all(0 <= i < len(drawings) for i in feature['sourceDrawingIndices'])
    for segment in data['segments']:
        p = np.array(segment['points'])
        assert p.shape[1] == 2 and len(p) >= 2
        assert np.isfinite(p).all()
        assert (p >= 0).all() and (p[:, 0] <= tr.WIDTH).all() and (p[:, 1] <= tr.HEIGHT).all()
        assert np.linalg.norm(np.diff(p, axis=0), axis=1).max() <= .354
        assert segment['interpolated'] is False
    for marker in data['markers']:
        assert marker['connectionVerified'] is False
        x, y, w, h = marker['bounds']
        assert np.allclose(marker['center'], [x + w / 2, y + h / 2], atol=.00002)
    for trail_id in ids:
        assert any(p['trailId'] == trail_id for p in data['routePaths'])
        assert any(p['trailId'] == trail_id for p in data['labels'])
        assert any(p['trailId'] == trail_id for p in data['markers'])


def verify_svg(data, clean_image, audit_dir):
    """Check our serialized curves against independently painted PDF primitives."""
    attributes = {'fill': 'fill', 'fillRule': 'fill-rule', 'stroke': 'stroke',
                  'strokeWidth': 'stroke-width', 'lineCap': 'stroke-linecap', 'lineJoin': 'stroke-linejoin'}
    marks = sorted([p for collection in ('labels', 'markers') for obj in data[collection] for p in obj['paths']],
                   key=lambda p: p['sourceDrawingIndices'][0])
    svg = '<svg xmlns="http://www.w3.org/2000/svg" width="2570" height="3077" viewBox="0 0 2570 3077"><rect width="2570" height="3077" fill="white"/>'
    for path in data['routePaths'] + marks:
        svg += '<path d="' + path['d'] + '" ' + ' '.join(
            f'{target}="{html.escape(str(path[source]))}"' for source, target in attributes.items()) + '/>'
    svg += '</svg>'
    (audit_dir / 'continuous-clean.svg').write_text(svg)
    svg_doc = fitz.open(stream=svg.encode(), filetype='svg')
    pdf_doc = fitz.open('pdf', svg_doc.convert_to_pdf())
    pix = pdf_doc[0].get_pixmap(alpha=False)
    actual = np.frombuffer(pix.samples, np.uint8).reshape(pix.height, pix.width, 3)
    expected = np.array(clean_image)
    assert actual.shape == expected.shape == (tr.HEIGHT, tr.WIDTH, 3)
    error = abs(actual.astype(float) - expected)
    # Both renders use the original PDF primitives at native image resolution.
    # Allow subpixel antialias/stroke width rounding; no pixel may differ by >32.
    assert not np.any(error > 32), f'SVG differs materially from original primitives: max={error.max()}'
    assert np.sqrt(np.mean(error ** 2)) < .15
    Image.fromarray(actual).save(audit_dir / 'svg-render.png')
    return {'nativeRasterRmsRgb': float(np.sqrt(np.mean(error ** 2))),
            'meanAbsoluteRgb': float(error.mean()), 'maxAbsoluteRgb': float(error.max()),
            'pixelsWithChannelErrorOver32': int(np.any(error > 32, axis=-1).sum()),
            'method': 'serialized SVG versus independent PDF drawing primitives, both 2570x3077'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pdf', required=True, type=Path)
    parser.add_argument('--audit-dir', type=Path, default=Path('/workspace/scratch/continuous-sign'))
    args = parser.parse_args()
    assert tr.digest(args.pdf) == tr.PDF_SHA
    jpg = ROOT / 'sources/el-durazno-official-2022.jpg'
    assert tr.digest(jpg) == tr.JPG_SHA and Image.open(jpg).size == (tr.WIDTH, tr.HEIGHT)
    visible_path = ROOT / 'data/el-durazno/all-visual-trails.json'
    old_sha = tr.digest(visible_path)
    visible = json.loads(visible_path.read_text())
    doc = fitz.open(args.pdf)
    page, drawings = doc[0], doc[0].get_drawings()
    factors = np.array([tr.WIDTH / page.rect.width, tr.HEIGHT / page.rect.height])
    matrix = fitz.Matrix(*(factors * tr.SCALE))
    trails, segments, route_paths, labels, markers, branches = [], [], [], [], [], []
    clean_doc = fitz.open()
    clean = clean_doc.new_page(width=page.rect.width, height=page.rect.height)
    route_shape = clean.new_shape()
    selected_indices = set()
    audit_stats = []

    for tid, name, index, plates, symbols in tr.TRAILS:
        indices = [index] + tr.EXTRA_DRAWINGS.get(tid, [])
        drawing = dict(drawings[index])
        drawing['items'] = [item for idx in indices for item in drawings[idx]['items']]
        drawing['rect'] = fitz.Rect(drawings[index]['rect'])
        for idx in indices:
            drawing['rect'] |= drawings[idx]['rect']
            route_paths.append(source_path(idx, drawings[idx], factors, tid))
        selected_indices.update(indices)
        trail = {'id': tid, 'name': name, 'color': color_hex(drawing['fill'] or drawing['color']),
                 'sourceDrawingIndices': indices, 'sourceContinuity': 'original PDF route artwork, recovered underneath later printing',
                 'photoEvidence': 'Names and relative route layout compared with supplied photograph; exact photo edition unconfirmed',
                 'geographicStatus': 'unvalidated'}
        if tid.startswith('subida-'):
            trail['category'] = 'auxiliary'
        trails.append(trail)
        for ordinal, plate in enumerate(plates, 1):
            label_drawings = label_indices(drawings, plate)
            selected_indices.update(label_drawings)
            r = drawings[plate]['rect']
            bounds = native_bounds(r, factors)
            labels.append({'id': f'{tid}-label-{ordinal}', 'trailId': tid, 'text': name,
                           'center': round_values([(r.x0 + r.x1) / 2 * factors[0], (r.y0 + r.y1) / 2 * factors[1]]),
                           'bounds': bounds, 'angleDeg': label_angle(drawings[plate], factors),
                           'sourceDrawingIndices': label_drawings,
                           'paths': [source_path(i, drawings[i], factors, tid, f'label-{ordinal}') for i in label_drawings],
                           'positionMethod': 'original PDF plate and glyph paths; text metadata is human-read'} )
        for ordinal, group in enumerate(marker_groups(drawings, symbols), 1):
            r, indices_m = group['rect'], sorted(group['indices'])
            selected_indices.update(indices_m)
            symbol = any(any(item[0] == 're' for item in drawings[i]['items']) for i in indices_m)
            hollow = any(drawings[i]['fill'] and min(drawings[i]['fill']) >= .95 for i in indices_m)
            markers.append({'id': f'{tid}-marker-{ordinal}', 'trailId': tid,
                            'kind': 'printed-symbol' if symbol else 'hollow-dot' if hollow else 'solid-dot',
                            'center': round_values([(r.x0 + r.x1) / 2 * factors[0], (r.y0 + r.y1) / 2 * factors[1]]),
                            'bounds': native_bounds(r, factors), 'sourceDrawingIndices': indices_m,
                            'connectionVerified': False, 'connectionInterpretation': 'none; graphic mark only',
                            'paths': [source_path(i, drawings[i], factors, tid, f'marker-{ordinal}') for i in indices_m]})
        source_doc = fitz.open()
        sp = source_doc.new_page(width=page.rect.width, height=page.rect.height)
        shape = sp.new_shape()
        tr.paint(shape, drawing, (0, 0, 0))
        shape.commit()
        pix = sp.get_pixmap(matrix=matrix, clip=drawing['rect'] + (-5, -5, 5, 5), alpha=False)
        pixels = np.frombuffer(pix.samples, np.uint8).reshape(pix.height, pix.width, 3)
        skel = skeletonize(pixels[:, :, 0] < 128)
        yy, xx = np.where(skel)
        local_pixels = set(zip(yy.tolist(), xx.tolist()))
        if drawing['type'] == 's':
            axes = [tr.flatten_stroke(drawing, factors)]
        else:
            axes = [np.array([[(x + pix.x + .5) / tr.SCALE, (y + pix.y + .5) / tr.SCALE]
                              for y, x in chain]) for chain in tr.chains(local_pixels)]
        for ordinal, points in enumerate(axes, 1):
            if len(points) < 2:
                continue
            segments.append({'id': f'{tid}-source-axis-{ordinal:03d}', 'trailId': tid,
                'points': np.round(points, 5).tolist(), 'sourceDrawingIndices': indices,
                'status': 'source-pdf-centerline', 'interpolated': False,
                'observedInPhotograph': 'only where not covered by printing',
                'provenance': 'true PDF stroke' if drawing['type'] == 's' else '4x raster medial axis of original PDF outline before occluding print',
                'navigableConnectivity': 'not established'})
        for (y, x), neighbors in tr.adjacency(local_pixels).items():
            if len(neighbors) >= 3:
                point = [(x + pix.x + .5) / tr.SCALE, (y + pix.y + .5) / tr.SCALE]
                branches.append({'id': f'{tid}-axis-branch-{len(branches)+1}', 'trailId': tid,
                    'center': round_values(point), 'bounds': round_values([point[0] - 1, point[1] - 1, 2, 2]),
                    'kind': 'medial-axis-branch', 'status': 'not-a-verified-trail-junction',
                    'sourceDrawingIndices': indices,
                    'reason': 'Filled artwork is rendered exactly; centerline graph branch is not interpreted or connected to another trail.'})
        audit_stats.append({'trailId': tid, 'sourceDrawingIndices': indices,
                            'axisChains': len(axes), 'vertices': sum(len(a) for a in axes),
                            'maxEdgePx': max(float(np.linalg.norm(np.diff(a, axis=0), axis=1).max()) for a in axes if len(a) > 1),
                            'sourceNativeBounds': native_bounds(drawing['rect'], factors)})
        source_doc.close()
    route_paths.sort(key=lambda p: p['sourceDrawingIndices'][0])
    for path in route_paths:
        source = drawings[path['sourceDrawingIndices'][0]]
        tr.paint(route_shape, source, source['fill'] or source['color'])
    route_shape.commit()
    # Draw all labels and markers *after* the full route layer, preserving their
    # original internal draw order. This is the requested clean map layer order.
    marks_shape = clean.new_shape()
    mark_indices = sorted(selected_indices - {i for t in trails for i in t['sourceDrawingIndices']})
    for index in mark_indices:
        drawing = drawings[index]
        tr.paint(marks_shape, drawing, drawing['fill'] or drawing['color'])
    marks_shape.commit()

    bounds = fitz.Rect(drawings[tr.TRAILS[0][2]]['rect'])
    for t in trails:
        for index in t['sourceDrawingIndices']:
            bounds |= drawings[index]['rect']
    recovered = [{**g, 'status': 'recovered-from-source-pdf', 'interpolated': False,
                   'observedInPhotograph': False,
                   'recovery': 'Original route path exists before the later printed mark in the official PDF; no bridge was added.'}
                 for g in visible['gaps'] if g['kind'] != 'medial-axis-ambiguity']
    data = {'schemaVersion': 1, 'id': 'el-durazno-continuous-source-sign-v1',
        'coordinateSystem': 'image-pixels', 'extent': native_bounds(bounds, factors),
        'image': {'url': 'sources/el-durazno-official-2022.jpg', 'width': tr.WIDTH,
                  'height': tr.HEIGHT, 'sha256': tr.JPG_SHA, 'transform': [1, 0, 0, 1, 0, 0]},
        'sources': [{'id': 'official-pdf-vectors', 'url': 'https://www.outlife.cl/wp-content/uploads/2023/04/Mapa_El-Durazno-2022_web.pdf',
                     'sha256': tr.PDF_SHA, 'page': 1, 'drawingIndexBase': 0},
                    {'id': 'visible-only-predecessor', 'path': 'data/el-durazno/all-visual-trails.json', 'sha256': old_sha}],
        'digitization': {'method': 'Recover native PDF route outlines beneath later printed labels and symbols',
            'pdfToNativeImageScale': factors.tolist(), 'simplificationTolerancePx': 0,
            'coordinateRoundingPx': .00001, 'nativeBezierCurvesPreserved': True,
            'routeRenderGeometry': 'routePaths; exact native curves and fill rules',
            'centerlinePurpose': 'selection and comparison only; medial axis may branch',
            'rasterGridSpacingPx': .25, 'centerlineRasterPixelHalfDiagonalPx': math.sqrt(2) / 8,
            'strokeFlatteningTolerancePx': .025, 'hiddenSpanInterpolation': False,
            'strokeWidthAnisotropyPx': abs(float(factors[0] - factors[1])) * 4,
            'sourceEditionLimit': '2022 official map; correspondence of every photographed segment is not independently established'},
        'georeferencing': {'status': 'unvalidated', 'transform': None},
        'trails': trails, 'segments': segments, 'routePaths': route_paths,
        'labels': labels, 'markers': markers, 'coveredSpans': recovered,
        'uncertainSpans': branches, 'connections': [], 'geographicCorrespondences': []}
    validate(data, drawings)
    assert tr.digest(visible_path) == old_sha, 'Visible-only predecessor must remain unchanged'
    output = ROOT / 'data/el-durazno/continuous-sign-trails.json'
    output.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')
    args.audit_dir.mkdir(parents=True, exist_ok=True)
    pix = clean.get_pixmap(matrix=fitz.Matrix(*factors), alpha=False)
    clean_image = Image.frombytes('RGB', [pix.width, pix.height], pix.samples).crop((0, 0, tr.WIDTH, tr.HEIGHT))
    clean_image.save(args.audit_dir / 'continuous-clean.png')
    svg_validation = verify_svg(data, clean_image, args.audit_dir)
    original = Image.open(jpg).convert('RGB')
    overlay = Image.blend(original, clean_image, .5)
    overlay.save(args.audit_dir / 'continuous-overlay.png')
    panel = Image.new('RGB', (tr.WIDTH * 2, tr.HEIGHT + 50), 'white')
    panel.paste(original, (0, 50))
    panel.paste(clean_image, (tr.WIDTH, 50))
    ImageDraw.Draw(panel).text((10, 10), 'Official image | Original PDF routes before printed labels; labels and points on top', fill='black')
    panel.resize((2056, 1251)).save(args.audit_dir / 'continuous-comparison.png')
    audit = {'sourcePdfSha256': tr.PDF_SHA, 'sourceImageSha256': tr.JPG_SHA,
             'visibleOnlyUnchangedSha256': old_sha, 'outputSha256': tr.digest(output),
             'trails': len(trails), 'legendTrails': 20, 'auxiliaryTrails': 2,
             'routePaths': len(route_paths), 'axisChains': len(segments),
             'vertices': sum(len(s['points']) for s in segments), 'labels': len(labels),
             'markers': len(markers), 'sourceRecoveredOcclusionBoxes': len(recovered),
             'medialAxisBranchesNotInterpreted': len(branches),
             'maxEdgePx': max(s['maxEdgePx'] for s in audit_stats),
             'svgValidation': svg_validation,
             'validation': 'source hashes, route coverage 20+2, explicit pixel system/noGPS, finite in-bounds coordinates, <=0.354px centerline edges, exact source marker centers, no implicit connectivity, predecessor unchanged',
             'perTrail': audit_stats}
    (args.audit_dir / 'audit.json').write_text(json.dumps(audit, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({k: v for k, v in audit.items() if k != 'perTrail'}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
