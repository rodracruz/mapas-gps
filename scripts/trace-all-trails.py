#!/usr/bin/env python3
"""Reproduce twenty sign trails plus two auxiliary ascents in native image pixels.

No geographic processing, inferred junctions, hidden-span interpolation, smoothing,
or curve simplification is used. Filled PDF outlines are rasterized at 4 samples
per native pixel and skeletonized; the one genuine stroked path (Skills) is
adaptively flattened directly. Later PDF marks, labels, endpoint symbols and
medial-axis branch ambiguities cut the output into independent visible fragments.

python scripts/trace-all-trails.py --pdf /path/to/official-map.pdf
Dependencies are pinned in scripts/requirements-tracing.txt.
"""
from pathlib import Path
import argparse
import colorsys
import hashlib
import json
import math

import fitz
import numpy as np
from PIL import Image, ImageDraw
from skimage.morphology import skeletonize

ROOT = Path(__file__).resolve().parent.parent
PDF_SHA = '9a67123b027197042da8e47d0c6dbe61e800d11e0e7fe01a5d85172b65ef39ab'
JPG_SHA = 'ee124136bc9930ca1928d2df1f79a9810fb4d245c66503a2d4c6ae888aea29af'
WIDTH, HEIGHT, SCALE = 2570, 3077, 4
SOURCE_ID = 'official-pdf-vectors'
# Names were read from real official/sign images and the rendered vector plates.
# Each selected outline was also rendered on top of its original-image crop.
# A plate index identifies the actual glyph/plate evidence, not nearby text.
TRAILS = [
    ('chilling', 'Chilling', 2833, [2839], [2834, 2835, 2836]),
    ('papaya', 'Papaya', 19, [113], [20, 21, 22]),
    ('la-virgen', 'La Virgen', 31, [120, 129], [32, 33, 34]),
    ('parcero', 'Parcero', 23, [147], [24, 25, 26]),
    ('skills', 'Skills', 258, [260], [267, 268, 269, 270, 340, 341, 347]),
    ('mampato', 'Mampato', 67, [348], [68, 69, 342]),
    ('starwars', 'Starwars', 51, [138, 184], [52, 53, 54]),
    ('cactus', 'Cactus', 55, [193], [56, 57, 58]),
    ('lomo-vetado', 'Lomo Vetado', 39, [102], [40, 41, 42]),
    ('la-bala', 'La Bala', 343, [2089], [344, 345, 346, 2096, 2097, 2098, 2099]),
    ('cebolla', 'Cebolla', 15, [155], [16, 17, 18]),
    ('los-saltos', 'Los Saltos', 35, [174], [36, 37, 38]),
    ('el-gringo', 'El Gringo', 47, [200], [48, 49, 50]),
    ('el-duro', 'El Duro', 12, [209], [13, 14]),
    ('xl', 'XL', 4, [227, 231, 235], [5, 6, 7]),
    ('rock-n-roll', 'Rock N’Roll', 8, [90], [9, 10, 11]),
    ('las-nieves', 'Las Nieves', 59, [216], [60, 61, 62]),
    ('calibre-12', 'Calibre12', 43, [163], [44, 45, 46]),
    ('calibre-loco', 'Calibre Loco', 27, [70], [28, 29, 30]),
    ('mordor', 'Mordor', 63, [82], [64, 65, 66]),
    ('subida-cartel', 'Subida', 240, [244, 251, 271], [241, 242, 243]),
    ('subida-e-bike', 'Subida E-Bike', 356, [359, 372], [259, 2837, 2838]),
]
EXTRA_DRAWINGS = {'subida-cartel': [239]}


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def paint(shape, drawing, color):
    for item in drawing['items']:
        if item[0] == 'l':
            shape.draw_line(*item[1:])
        elif item[0] == 'c':
            shape.draw_bezier(*item[1:])
        elif item[0] == 're':
            shape.draw_rect(item[1])
        else:
            raise ValueError(f'Unreviewed PDF primitive {item[0]}')
    if drawing['type'] == 's':
        shape.finish(color=color, width=drawing['width'], closePath=False,
                     lineCap=drawing['lineCap'][0], lineJoin=drawing['lineJoin'])
    else:
        shape.finish(fill=color, color=None, closePath=False,
                     even_odd=bool(drawing['even_odd']))


def adjacency(pixels):
    # Do not add a diagonal shortcut when an orthogonal skeleton pixel intervenes.
    result = {}
    for y, x in pixels:
        neighbors = []
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                q = y + dy, x + dx
                if (dx or dy) and q in pixels:
                    if dx and dy and ((y, x + dx) in pixels or (y + dy, x) in pixels):
                        continue
                    neighbors.append(q)
        result[y, x] = sorted(neighbors)
    return result


def chains(pixels):
    adj = adjacency(pixels)
    visited = set()
    result = []
    starts = sorted(p for p in pixels if len(adj[p]) != 2)
    # Remaining degree-two cycles are explicit closed visual fragments.
    for start in starts + sorted(pixels):
        for neighbor in adj[start]:
            edge = tuple(sorted((start, neighbor)))
            if edge in visited:
                continue
            visited.add(edge)
            path, previous, current = [start, neighbor], start, neighbor
            while len(adj[current]) == 2:
                following = next(q for q in adj[current] if q != previous)
                edge = tuple(sorted((current, following)))
                if edge in visited:
                    break
                visited.add(edge)
                path.append(following)
                previous, current = current, following
            result.append(path)
    return result


def split_by_bounds(points, bounds):
    keep = np.ones(len(points), dtype=bool)
    for x, y, w, h in bounds:
        keep &= ~((points[:, 0] >= x) & (points[:, 0] <= x + w)
                  & (points[:, 1] >= y) & (points[:, 1] <= y + h))
    cuts = np.flatnonzero(np.diff(np.r_[False, keep, False]))
    return [points[a:b] for a, b in zip(cuts[::2], cuts[1::2]) if b - a >= 2]


def consolidate_gaps(gaps, raw_points):
    """Merge overlapping printed masks only when no retained axis sample is lost."""
    protected = np.ones(len(raw_points), dtype=bool)
    for gap in gaps:
        x, y, w, h = gap['bounds']
        protected &= ~((raw_points[:, 0] >= x) & (raw_points[:, 0] <= x + w)
                       & (raw_points[:, 1] >= y) & (raw_points[:, 1] <= y + h))
    protected_points = raw_points[protected]
    result = [dict(g) for g in gaps]
    changed = True
    while changed:
        changed = False
        for i, a in enumerate(result):
            if a['kind'] != 'printed-vector-occlusion':
                continue
            x, y, w, h = a['bounds']
            for j in range(i + 1, len(result)):
                b = result[j]
                if b['kind'] != a['kind'] or b.get('sourceDrawingIndices') != a.get('sourceDrawingIndices'):
                    continue
                xx, yy, ww, hh = b['bounds']
                if x > xx + ww or xx > x + w or y > yy + hh or yy > y + h:
                    continue
                nx, ny, ex, ey = min(x, xx), min(y, yy), max(x + w, xx + ww), max(y + h, yy + hh)
                if np.any((protected_points[:, 0] >= nx) & (protected_points[:, 0] <= ex)
                          & (protected_points[:, 1] >= ny) & (protected_points[:, 1] <= ey)):
                    continue
                a['bounds'] = [round(v, 4) for v in (nx, ny, ex - nx, ey - ny)]
                result.pop(j)
                changed = True
                break
            if changed:
                break
    for ordinal, gap in enumerate(result, 1):
        gap['id'] = f"{gap['trailId']}-gap-{ordinal:03d}"
    return result


def flatten_stroke(drawing, factors):
    def sample_bezier(p, depth=0):
        chord = p[-1] - p[0]
        den = np.linalg.norm(chord)
        flatness = max(abs(chord[0] * (v - p[0])[1] - chord[1] * (v - p[0])[0])
                       / max(den, 1e-12) for v in p[1:3])
        if flatness <= .025 and den <= .35 and max(np.linalg.norm(np.diff(p, axis=0), axis=1)) <= .35:
            return [p[0], p[-1]]
        assert depth < 30
        p01, p12, p23 = (p[:-1] + p[1:]) / 2
        p012, p123 = (p01 + p12) / 2, (p12 + p23) / 2
        mid = (p012 + p123) / 2
        return (sample_bezier(np.array([p[0], p01, p012, mid]), depth + 1)[:-1]
                + sample_bezier(np.array([mid, p123, p23, p[-1]]), depth + 1))
    result = []
    for item in drawing['items']:
        p = np.array([[v.x, v.y] for v in item[1:]]) * factors
        if item[0] == 'c':
            part = sample_bezier(p)
        elif item[0] == 'l':
            n = max(1, math.ceil(np.linalg.norm(p[1] - p[0]) / .35))
            part = np.linspace(p[0], p[1], n + 1).tolist()
        else:
            raise ValueError('Unexpected stroked primitive')
        result.extend(part if not result else part[1:])
    return np.array(result)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--pdf', required=True, type=Path)
    ap.add_argument('--audit-dir', type=Path, default=Path('/workspace/scratch/all-trails'))
    args = ap.parse_args()
    assert digest(args.pdf) == PDF_SHA, 'Unexpected official PDF bytes'
    jpg = ROOT / 'sources/el-durazno-official-2022.jpg'
    assert digest(jpg) == JPG_SHA, 'Unexpected official JPG bytes'
    assert Image.open(jpg).size == (WIDTH, HEIGHT)
    audit = args.audit_dir
    audit.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(args.pdf)
    page, drawings = doc[0], doc[0].get_drawings()
    factors = np.array([WIDTH / page.rect.width, HEIGHT / page.rect.height])
    matrix = fitz.Matrix(*(factors * SCALE))
    by_index = {t[2]: n for n, t in enumerate(TRAILS)}
    for n, trail in enumerate(TRAILS):
        by_index.update({i: n for i in EXTRA_DRAWINGS.get(trail[0], [])})
    palette = [tuple(round(c * 255) for c in colorsys.hsv_to_rgb(n / len(TRAILS), .85, 1))
               for n in range(len(TRAILS))]
    # Categorical repaint preserves PDF draw order. Black represents every other
    # printed vector mark, including white glyphs/halos, icons and dotted paths.
    # A trail sample is visible only if that trail is the final painted object.
    visible_doc = fitz.open()
    vp = visible_doc.new_page(width=page.rect.width, height=page.rect.height)
    shape = vp.new_shape()
    for i, drawing in enumerate(drawings):
        color = palette[by_index[i]] if i in by_index else (0, 0, 0)
        paint(shape, drawing, tuple(v / 255 for v in color))
    shape.commit()
    pix = vp.get_pixmap(matrix=matrix, alpha=False)
    categorical = np.frombuffer(pix.samples, np.uint8).reshape(pix.height, pix.width, 3)
    Image.fromarray(categorical).resize((1285, 1539)).save(audit / 'categorical-visibility.png')
    trails, segments, gaps, nodes, stats = [], [], [], [], []
    base = Image.open(jpg).convert('RGB')
    overview = base.copy()
    overlay_draw = ImageDraw.Draw(overview)
    for ordinal, (tid, name, index, plates, symbols) in enumerate(TRAILS):
        print(f'Tracing {name} (drawing {index})', flush=True)
        drawing = drawings[index]
        source_indices = [index] + EXTRA_DRAWINGS.get(tid, [])
        if len(source_indices) > 1:
            drawing = dict(drawing)
            drawing['items'] = [item for idx in source_indices for item in drawings[idx]['items']]
            drawing['rect'] = fitz.Rect(drawings[index]['rect'])
            for idx in source_indices[1:]:
                drawing['rect'] |= drawings[idx]['rect']
        rgb = drawing['fill'] or drawing['color']
        color = '#' + ''.join(f'{round(v * 255):02x}' for v in rgb)
        trail = {'id': tid, 'name': name, 'color': color, 'sourceDrawingIndex': index,
                 'sourceDrawingIndices': source_indices,
                 'associationEvidence': {'labelDrawingIndices': plates,
                    'method': 'manually read rendered official inline label; isolated vector-over-image comparison',
                    'auditFile': f'{tid}-source-evidence.png'}}
        trails.append(trail)
        if tid.startswith('subida-'):
            trail['category'] = 'auxiliary'
        source_doc = fitz.open()
        sp = source_doc.new_page(width=page.rect.width, height=page.rect.height)
        source_shape = sp.new_shape()
        paint(source_shape, drawing, (0, 0, 0))
        source_shape.commit()
        source_pix = sp.get_pixmap(matrix=matrix, clip=drawing['rect'] + (-5, -5, 5, 5), alpha=False)
        source = np.frombuffer(source_pix.samples, np.uint8).reshape(source_pix.height, source_pix.width, 3)
        skeleton = skeletonize(source[:, :, 0] < 128)
        yy, xx = np.where(skeleton)
        points = np.c_[(xx + source_pix.x + .5) / SCALE, (yy + source_pix.y + .5) / SCALE]
        local_pixels = set(zip(yy.tolist(), xx.tolist()))
        graph = adjacency(local_pixels)
        trail_gaps = []

        def add_gap(bounds, reason, kind, indices=None):
            x, y, w, h = bounds
            x, y = max(0., x), max(0., y)
            w, h = min(w, WIDTH - x), min(h, HEIGHT - y)
            trail_gaps.append({'id': f'{tid}-gap-{len(trail_gaps) + 1:03d}',
                'trailId': tid, 'bounds': [round(v, 4) for v in (x, y, w, h)],
                'reason': reason, 'kind': kind, 'geometry': None, 'status': 'pending',
                'sourceId': SOURCE_ID, **({'sourceDrawingIndices': indices} if indices else {})})

        # Endpoint symbols are small explicit masks. A whole diagonal plate's
        # bounding rectangle can hide a separate nearby bend that is visible;
        # therefore labels use only small boxes over their actual printed footprint.
        for idx in symbols:
            r = drawings[idx]['rect']
            x, y = np.array([r.x0, r.y0]) * factors - .5
            x1, y1 = np.array([r.x1, r.y1]) * factors + .5
            add_gap([x, y, x1 - x, y1 - y],
                    f'Placa/rótulo o símbolo vectorial {idx}: eje oculto; no se interpola.',
                    'printed-label-or-symbol', [idx])
        # All later printed vector marks can occlude an earlier trail, including
        # another trail. Never infer its continuation across that printed mark.
        samples = categorical[yy + source_pix.y, xx + source_pix.x].astype(np.int16)
        visible = np.max(abs(samples - np.array(palette[ordinal])), axis=1) <= 3
        hidden = np.zeros(skeleton.shape, dtype=bool)
        hidden[yy[~visible], xx[~visible]] = True
        # Four-native-pixel tiles retain visible bends alongside diagonal labels.
        # Each pending box bounds only hidden samples within one tile, +0.5px.
        hidden_y, hidden_x = np.where(hidden)
        tile_keys = np.c_[(hidden_y + source_pix.y) // (4 * SCALE),
                          (hidden_x + source_pix.x) // (4 * SCALE)]
        tile_groups = {}
        for key, gy, gx in zip(map(tuple, tile_keys), hidden_y, hidden_x):
            tile_groups.setdefault(key, []).append((gy, gx))
        for key in sorted(tile_groups):
            coords = np.array(tile_groups[key])
            gy, gx = coords[:, 0], coords[:, 1]
            x, y = (gx.min() + source_pix.x) / SCALE - .5, (gy.min() + source_pix.y) / SCALE - .5
            w, h = (gx.max() - gx.min() + 1) / SCALE + 1, (gy.max() - gy.min() + 1) / SCALE + 1
            # Already covered by an explicit label/symbol rectangle.
            if any(x >= g['bounds'][0] and y >= g['bounds'][1]
                   and x + w <= g['bounds'][0] + g['bounds'][2]
                   and y + h <= g['bounds'][1] + g['bounds'][3] for g in trail_gaps):
                continue
            relevant_plates = []
            for idx in plates:
                r = drawings[idx]['rect']
                if x + w >= r.x0 * factors[0] and x <= r.x1 * factors[0] and y + h >= r.y0 * factors[1] and y <= r.y1 * factors[1]:
                    relevant_plates.append(idx)
            reason = ('Placa/rótulo vectorial cubre este tramo del eje; no se interpola.' if relevant_plates
                      else 'Otro elemento vectorial impreso cubre el eje o su borde; continuidad pendiente.')
            add_gap([x, y, w, h], reason, 'printed-vector-occlusion', relevant_plates)
        for (py, px), neighbors in graph.items():
            if len(neighbors) >= 3:
                x, y = (px + source_pix.x + .5) / SCALE, (py + source_pix.y + .5) / SCALE
                if any(g['bounds'][0] <= x <= g['bounds'][0] + g['bounds'][2]
                       and g['bounds'][1] <= y <= g['bounds'][1] + g['bounds'][3] for g in trail_gaps):
                    continue
                add_gap([x - 1, y - 1, 2, 2], 'Bifurcación local del eje medial del outline: no se escoge ni une una rama.',
                        'medial-axis-ambiguity')
        output_chunks = []
        if drawing['type'] == 's':
            raw_paths = [flatten_stroke(drawing, factors)]
        else:
            raw_paths = [np.array([[(x + source_pix.x + .5) / SCALE, (y + source_pix.y + .5) / SCALE]
                                  for y, x in chain]) for chain in chains(local_pixels)]
        trail_gaps = consolidate_gaps(trail_gaps, np.concatenate(raw_paths))
        bounds = [g['bounds'] for g in trail_gaps]
        for path in raw_paths:
            output_chunks.extend(split_by_bounds(path, bounds))
        for j, chunk in enumerate(output_chunks, 1):
            points_out = np.round(chunk, 4).tolist()
            sid = f'{tid}-segment-{j:03d}'
            endpoints = []
            for suffix, point in [('a', points_out[0]), ('b', points_out[-1])]:
                nid = f'{sid}-{suffix}'
                endpoints.append(nid)
                nodes.append({'id': nid, 'point': point, 'connectionVerified': False,
                              'kind': 'visual-fragment-end'})
            segments.append({'id': sid, 'trailId': tid, 'sourceId': SOURCE_ID, 'status': 'visible',
                             'sourceDrawingIndex': index, 'startNodeId': endpoints[0],
                             'endNodeId': endpoints[1], 'points': points_out})
            overlay_draw.line([tuple(v) for v in points_out], fill='#ff2ac3', width=2)
        gaps.extend(trail_gaps)
        native_rect = [drawing['rect'][i] * factors[i % 2] for i in range(4)]
        crop_bounds = [max(0, int(native_rect[0]) - 22), max(0, int(native_rect[1]) - 22),
                       min(WIDTH, math.ceil(native_rect[2]) + 22), min(HEIGHT, math.ceil(native_rect[3]) + 22)]
        original = base.crop(crop_bounds)
        traced = original.copy()
        dd = ImageDraw.Draw(traced)
        for chunk in output_chunks:
            dd.line([(x - crop_bounds[0], y - crop_bounds[1]) for x, y in chunk], fill='#ff2ac3', width=2)
        for gap in trail_gaps:
            x, y, w, h = gap['bounds']
            dd.rectangle([x - crop_bounds[0], y - crop_bounds[1], x + w - crop_bounds[0], y + h - crop_bounds[1]], outline='#ffbb00', width=1)
        panel = Image.new('RGB', (original.width * 2, original.height + 28), 'white')
        panel.paste(original, (0, 28))
        panel.paste(traced, (original.width, 28))
        ImageDraw.Draw(panel).text((4, 6), f'{name} | PDF drawing {index} | original + sampled axis / pending rectangles', fill='black')
        panel.save(audit / f'{tid}-source-evidence.png')
        distances = [np.linalg.norm(np.diff(chunk, axis=0), axis=1) for chunk in output_chunks]
        stats.append({'id': tid, 'sourceDrawingIndex': index, 'sourceNativeBounds': native_rect,
                      'rawSkeletonSamples': len(points), 'finalFragments': len(output_chunks),
                      'finalVertices': sum(len(v) for v in output_chunks), 'pendingRectangles': len(trail_gaps),
                      'finalMaxEdgeLengthPx': max((float(v.max()) for v in distances if len(v)), default=0),
                      'categoricalVisibilityFraction': float(visible.mean()),
                      'labelDrawingIndices': plates})
        source_doc.close()
    data = {'schemaVersion': 1, 'id': 'el-durazno-all-official-visual-trails-v1',
        'coordinateSystem': 'image-pixels',
        'image': {'url': 'sources/el-durazno-official-2022.jpg', 'width': WIDTH, 'height': HEIGHT,
                  'sha256': JPG_SHA, 'transform': [1, 0, 0, 1, 0, 0]},
        'sources': [{'id': SOURCE_ID, 'url': 'https://www.outlife.cl/wp-content/uploads/2023/04/Mapa_El-Durazno-2022_web.pdf',
                     'sha256': PDF_SHA, 'page': 1, 'drawingIndexBase': 0,
                     'method': 'PyMuPDF vector outlines / true stroke, native-image-pixel centerlines'},
                    {'id': 'official-image', 'url': 'sources/el-durazno-official-2022.jpg', 'sha256': JPG_SHA}],
        'digitization': {'method': 'native-image vector-assisted visible-axis tracing',
            'units': 'native official image pixels (2570x3077)', 'workingRasterScale': SCALE,
            'rasterGridSpacingPx': 1 / SCALE, 'rasterPixelHalfDiagonalPx': math.sqrt(2) / (2 * SCALE),
            'simplificationTolerancePx': 0, 'strokeFlatteningTolerancePx': .025,
            'maximumExportedEdgeLengthPx': max(s['finalMaxEdgeLengthPx'] for s in stats),
            'coordinateRoundingPx': .0001, 'requestedTolerancePx': 1,
            'toleranceScope': 'sampling and retained geometry in native pixels; semantic ambiguities remain pending gaps',
            'noGeographicUnits': True, 'hiddenSpanInterpolation': False,
            'pdfToNativeImageScale': factors.tolist(),
            'visibility': 'categorical repaint of all PDF drawings in original order; small pending rectangles bound actual occluded samples',
            'occlusionTileSizePx': 4,
            'rawCenterlineSamples': {s['id']: s['rawSkeletonSamples'] for s in stats}},
        'georeferencing': {'status': 'unvalidated', 'transform': None},
        'trails': trails, 'segments': segments, 'gaps': gaps, 'nodes': nodes,
        'connections': [], 'geographicCorrespondences': []}
    output = ROOT / 'data/el-durazno/all-visual-trails.json'
    output.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')
    overview.save(audit / 'all-trails-overlay.png')
    (audit / 'extraction-audit.json').write_text(json.dumps({
        'pdfSha256': PDF_SHA, 'officialJpgSha256': JPG_SHA, 'trails': stats,
        'trailCount': len(trails), 'legendTrailCount': sum(t.get('category') != 'auxiliary' for t in trails),
        'auxiliaryCount': sum(t.get('category') == 'auxiliary' for t in trails), 'fragmentCount': len(segments),
        'vertexCount': sum(len(s['points']) for s in segments), 'pendingCount': len(gaps),
        'outputSha256': digest(output)}, ensure_ascii=False, indent=2) + '\n')
    print(f'Wrote {len(trails)} trails, {len(segments)} fragments, {len(gaps)} pending rectangles: {output}')


if __name__ == '__main__':
    main()
