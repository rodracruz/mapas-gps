#!/usr/bin/env python3
"""Reproduce an EXPERIMENTAL sign-to-world display registration, never navigation.

Uses only named route shapes already retained from the official PDF and OSM.
Nearest-curve candidates are not surveyed control points. Three whole routes
train the model; seven other named routes are held out. scipy/numpy versions
are pinned with the existing tracing requirements. No network is accessed.
"""
from pathlib import Path
import argparse
import hashlib
import json
import math
import numpy as np
from scipy.spatial import cKDTree

ROOT = Path(__file__).resolve().parent.parent
TRAINING = ['lomo-vetado', 'papaya', 'calibre-12']
R = 6378137.0
ORIGIN = np.array([-70.5, -33.31])
lat0 = math.radians(float(ORIGIN[1]))
e2 = 6.6943799901413165e-3
N = R / math.sqrt(1 - e2 * math.sin(lat0) ** 2)
M = R * (1 - e2) / (1 - e2 * math.sin(lat0) ** 2) ** 1.5
DEGREES_TO_LOCAL_M = np.array([N * math.cos(lat0), M]) * math.pi / 180


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def mercator(ll):
    ll = np.asarray(ll)
    return np.c_[R * np.deg2rad(ll[:, 0]),
                 R * np.log(np.tan(math.pi / 4 + np.deg2rad(ll[:, 1]) / 2))]


def unproject(xy):
    xy = np.asarray(xy)
    return np.c_[np.rad2deg(xy[:, 0] / R),
                 np.rad2deg(2 * np.arctan(np.exp(xy[:, 1] / R)) - math.pi / 2)]


def local_m(xy):
    return (unproject(xy) - ORIGIN) * DEGREES_TO_LOCAL_M


def resample(points, step):
    points = np.asarray(points, dtype=float)
    distances = np.r_[0, np.cumsum(np.linalg.norm(np.diff(points, axis=0), axis=1))]
    if distances[-1] == 0:
        return points[:1]
    at = np.r_[np.arange(0, distances[-1], step), distances[-1]]
    return np.array([np.interp(at, distances, points[:, i]) for i in range(2)]).T


def design(points, kind):
    x, y = points.T
    if kind == 'affine':
        matrix = np.zeros((2 * len(points), 6))
        matrix[::2, :3] = np.c_[x, y, np.ones(len(points))]
        matrix[1::2, 3:] = np.c_[x, y, np.ones(len(points))]
    else:
        # Image y is negated in fit coordinates: handedness change is explicit.
        matrix = np.zeros((2 * len(points), 4))
        matrix[::2, :] = np.c_[x, -y, np.ones(len(points)), np.zeros(len(points))]
        matrix[1::2, :] = np.c_[y, x, np.zeros(len(points)), np.ones(len(points))]
    return matrix


def apply(points, parameters, kind):
    return (design(points, kind) @ parameters).reshape(-1, 2)


def fit(routes, names, kind):
    # Centroids initialise ICP only; they are not registered as control points.
    source = np.array([routes[name]['p'].mean(0) for name in names])
    target = np.array([routes[name]['g'].mean(0) for name in names])
    parameters = np.linalg.lstsq(design(source, kind), target.ravel(), rcond=None)[0]
    # 24 Mercator metres is approximately 20 local metres here. It is a robust
    # loss transition, not an asserted accuracy, snapping radius or tolerance.
    for iteration in range(100):
        source_groups, target_groups, weight_groups = [], [], []
        for name in names:
            p, g = routes[name]['p'], routes[name]['g']
            q = apply(p, parameters, kind)
            forward, nearest = cKDTree(g).query(q)
            backward, back_nearest = cKDTree(q).query(g)
            source_groups.extend([p, p[back_nearest]])
            target_groups.extend([g[nearest], g])
            # Each route/direction receives equal total baseline weight.
            weight_groups.extend([np.minimum(1, 24 / np.maximum(forward, 1e-9)) / len(p),
                                  np.minimum(1, 24 / np.maximum(backward, 1e-9)) / len(g)])
        pp, gg = np.concatenate(source_groups), np.concatenate(target_groups)
        weights = np.repeat(np.sqrt(np.concatenate(weight_groups)), 2)
        updated = np.linalg.lstsq(design(pp, kind) * weights[:, None],
                                  gg.ravel() * weights, rcond=None)[0]
        change = np.max(np.abs(apply(source, parameters, kind) - apply(source, updated, kind)))
        parameters = updated
        if change < .0001:
            break
    return parameters, iteration + 1


def stats(values):
    return {'medianM': round(float(np.median(values)), 3),
            'p95M': round(float(np.percentile(values, 95)), 3),
            'maxM': round(float(np.max(values)), 3)}


def assess(route, parameters, kind):
    projected = local_m(apply(route['p'], parameters, kind))
    osm = local_m(route['g'])
    forward = cKDTree(osm).query(projected)[0]
    backward = cKDTree(projected).query(osm)[0]
    return {'cartelToOsm': stats(forward), 'osmToCartel': stats(backward),
            'pooledDirections': stats(np.r_[forward, backward]),
            'cartelSampleCount': len(forward), 'osmSampleCount': len(backward),
            'osmWayIds': route['ids']}


def svg_matrix(parameters, kind):
    if kind == 'similarity':
        a, b, e, f = parameters
        # q=(a*x-b*(-y)+e,b*x+a*(-y)+f).
        return [float(a), float(b), float(b), float(-a), float(e), float(f)]
    a, c, e, b, d, f = parameters
    return [float(a), float(b), float(-c), float(-d), float(e), float(f)]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--visual', type=Path, default=ROOT / 'data/el-durazno/continuous-sign-trails.json')
    parser.add_argument('--output', type=Path, default=ROOT / 'data/el-durazno/cartel-registration.json')
    args = parser.parse_args()
    catalog_path = ROOT / 'data/el-durazno/geographic-catalog.json'
    osm_path = ROOT / 'sources/el-durazno-osm.json'
    visual = json.loads(args.visual.read_text())
    catalog = json.loads(catalog_path.read_text())
    osm = json.loads(osm_path.read_text())
    assert visual['coordinateSystem'] == 'image-pixels'
    assert [visual['image'][key] for key in ['width', 'height']] == [2570, 3077]
    assert sha(osm_path) == catalog['sourceSnapshotSha256']
    elements = {element['id']: element for element in osm['elements']}
    origin_mercator = mercator([ORIGIN])[0]
    routes = {}
    for target in catalog['targets']:
        segments = [s for s in visual['segments'] if s['trailId'] == target.get('visualTrailId')]
        if not target['osmWayIds'] or not segments:
            continue
        image_lines = [np.array(segment['points']) * [1, -1] for segment in segments]
        world_lines = []
        for way_id in target['osmWayIds']:
            way = elements[way_id]
            # The catalogue records literal OSM spellings, including typos.
            assert way['tags']['name'] in target['osmNames']
            world_lines.append(mercator([(elements[node]['lon'], elements[node]['lat']) for node in way['nodes']]))
        # Fits use relative Mercator coordinates to avoid large-translation loss
        # of numerical precision; exported SVG translation is absolute Mercator.
        routes[target['id']] = {'p': np.concatenate([resample(line, 2) for line in image_lines]),
                                'g': np.concatenate([resample(line, 2.4) for line in world_lines]) - origin_mercator,
                                'ids': target['osmWayIds']}
    assert len(routes) == 10 and all(name in routes for name in TRAINING)
    # Scoring functions consume absolute Mercator coordinates.
    absolute_routes = {name: dict(route, g=route['g'] + origin_mercator) for name, route in routes.items()}
    models = {}
    for kind in ['similarity', 'affine']:
        parameters, iterations = fit(routes, TRAINING, kind)
        absolute_parameters = parameters.copy()
        if kind == 'similarity':
            absolute_parameters[2:] += origin_mercator
        else:
            absolute_parameters[[2, 5]] += origin_mercator
        models[kind] = {'matrix': svg_matrix(absolute_parameters, kind), 'iterations': iterations,
                        'routeShapeResiduals': {name: dict(assess(absolute_routes[name], absolute_parameters, kind),
                                                         role='fit' if name in TRAINING else 'held-out-route') for name in routes}}
    # Explicit endpoint hypotheses are reported separately, never used as controls.
    # They were selected by same-name route and the two PDF endpoint symbols.
    endpoint_candidates = {
        'papaya-marker-1': 6993096511, 'papaya-marker-2': 6993090732,
        'lomo-vetado-marker-1': 4705608441, 'lomo-vetado-marker-2': 4705608466,
        'calibre-12-marker-1': 4705609090, 'calibre-12-marker-2': 4705608441,
        'parcero-marker-1': 6993096492, 'parcero-marker-2': 4718549998,
        'cebolla-marker-1': 4705617530, 'cebolla-marker-2': 4705617587,
    }
    by_marker = {marker['id']: marker for marker in visual['markers']}
    candidate_checks = []
    svg = models['similarity']['matrix']
    for marker_id, node_id in endpoint_candidates.items():
        marker, node = by_marker[marker_id], elements[node_id]
        x, y = marker['center']
        mx = svg[0] * x + svg[2] * y + svg[4]
        my = svg[1] * x + svg[3] * y + svg[5]
        source_lonlat = [node['lon'], node['lat']]
        distance = np.linalg.norm(local_m([[mx, my]])[0] -
                                  (np.asarray(source_lonlat) - ORIGIN) * DEGREES_TO_LOCAL_M)
        candidate_checks.append({
            'markerId': marker_id, 'trailId': marker['trailId'],
            'imagePixel': marker['center'], 'imageSourceDrawingIndices': marker['sourceDrawingIndices'],
            'osmNodeId': node_id, 'sourceCoordinateLonLat': source_lonlat,
            'sourceUrl': f'https://www.openstreetmap.org/node/{node_id}',
            'queriedAt': catalog['queriedAt'],
            'candidateDifferenceM': round(float(distance), 3),
            'basis': 'Same-name route endpoint and original PDF dot; an endpoint hypothesis, not proof that the dot and OSM node identify the same real place.',
            'acceptedControl': False, 'usedForFit': False, 'independentFieldValidation': False,
        })
    result = {
        'schemaVersion': 1, 'id': 'el-durazno-cartel-registration-experimental-v1',
        'status': 'experimental-not-for-navigation', 'validated': False,
        'acceptedTransform': None, 'transform': None,
        'sourceCoordinateSystem': 'image-pixels',
        'image': visual['image'],
        'experimentalModel': {
            'type': 'similarity-with-image-y-reversal', 'targetCRS': 'EPSG:3857',
            'matrixConvention': '[a,b,c,d,e,f]: X=a*x+c*y+e; Y=b*x+d*y+f. Input image x right/y down; output Mercator metres X east/Y north.',
            'matrix': models['similarity']['matrix'],
            'permittedUse': 'Approximate visual display of original sign artwork over a world map, explicitly labelled experimental.',
            'useForNavigation': False, 'useForGpsSnapping': False,
            'useForGroundDistances': False, 'useForConnections': False,
        },
        'fit': {
            'method': 'Robust symmetric, exact-name-constrained nearest-curve ICP; equal baseline weight per route/direction; centroid initialisation only.',
            'trainingTrailIds': TRAINING, 'heldOutTrailIds': [name for name in routes if name not in TRAINING],
            'imageSampleSpacingPx': 2, 'osmSampleSpacingMercatorM': 2.4,
            'robustLossTransitionMercatorM': 24, 'maximumIterations': 100,
            'geographicControlPoints': [],
            'modelChoice': 'Similarity has fewer degrees of freedom and transfers better to the remote held-out XL/Rock areas than the affine candidate. Affine retained for comparison, not selected.',
        },
        'validation': {
            'status': 'unvalidated', 'independentGeographicCheckPoints': [],
            'independentFieldEvidence': False,
            'residualMeaning': 'Nearest-curve SHAPE DISAGREEMENT of candidate same-name routes, not positional accuracy or ground truth. Whole-route holdouts were not used by the fit but share the same OSM source; they are not independent field validation.',
            'distanceFrame': {'originLonLat': ORIGIN.tolist(), 'degreesToLocalMetres': DEGREES_TO_LOCAL_M.tolist(),
                              'method': 'WGS84 local east/north tangent linearisation at the origin; coordinates inverse-projected from Mercator before measuring.'},
            'scopeLimitations': [
                'No unambiguous geographic control point has been accepted. No surveyed/image-to-field point pair is used.',
                'Exact photograph edition versus the official 2022 PDF is not established.',
                'OSM and sign may differ in route limits, dates and segmentation. XL, Rock N’Roll and Los Saltos have much larger OSM-to-cartel residuals because nominally assigned OSM ways extend beyond the matching sign portion.',
                'Nearest points may correspond to the wrong part of a nearby/parallel curve. Small residuals do not prove correspondence or location.',
                'The training routes cluster in the west/centre; the far north is extrapolation with no named geographic holdout.',
                'Names, graphical crossings and dot symbols do not prove traversable connectivity or direction.',
                'Raster sampling, original map distortions and OSM accuracy are not quantified as independent uncertainty.',
            ],
        },
        'candidateEndpointCorrespondences': candidate_checks,
        'modelComparison': models,
        'sources': [
            {'id': 'native-sign-artwork', 'path': str(args.visual.relative_to(ROOT)), 'sha256': sha(args.visual),
             'url': 'https://www.outlife.cl/wp-content/uploads/2023/04/Mapa_El-Durazno-2022_web.pdf',
             'role': 'Graphical source only; not georeferenced source.'},
            {'id': 'osm-snapshot', 'path': 'sources/el-durazno-osm.json', 'sha256': sha(osm_path),
             'url': catalog['sourceUrl'], 'queriedAt': catalog['queriedAt'],
             'role': 'Candidate geographic route shapes, exact names and way identifiers; not surveyed ground truth.'},
            {'id': 'nominal-associations', 'path': 'data/el-durazno/geographic-catalog.json', 'sha256': sha(catalog_path)},
        ],
        'reproduction': 'python3 scripts/fit-cartel-registration.py',
    }
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'output': str(args.output), 'status': result['status'],
                      'matrix': result['experimentalModel']['matrix'],
                      'training': TRAINING, 'heldOut': result['fit']['heldOutTrailIds']}, ensure_ascii=False))


if __name__ == '__main__':
    main()
