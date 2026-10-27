#!/usr/bin/env python3
"""Recover inspected dotted connection artwork; never infer a navigable edge."""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path

import fitz
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SOURCE_SHA = '9a67123b027197042da8e47d0c6dbe61e800d11e0e7fe01a5d85172b65ef39ab'


def extract(pdf):
    if hashlib.sha256(pdf.read_bytes()).hexdigest() != SOURCE_SHA:
        raise ValueError('Official source PDF SHA-256 differs; no extraction performed')
    spec = importlib.util.spec_from_file_location('native_sign', ROOT / 'scripts/build-continuous-sign.py')
    native = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(native)
    base = json.loads((ROOT / 'data/el-durazno/continuous-sign-trails.json').read_text())
    document = fitz.open(pdf)
    page = document[0]
    drawings = page.get_drawings()
    scale = np.array([base['image']['width'] / page.rect.width, base['image']['height'] / page.rect.height])
    paths = []
    # Source selection checked against the printed legend and native page pixels.
    # Each compound object contains separate filled dots, not a continuous axis.
    for role, indices in [('expert-connection-artwork', range(4)),
                          ('connection-artwork', [*range(278, 340), 357, 358])]:
        for index in indices:
            drawing = drawings[index]
            path = native.source_path(index, drawing, scale, 'cartel-context', 'artwork')
            del path['trailId']
            assert drawing['type'] == 'f' and path['stroke'] == 'none'
            assert path['fill'] == ('#e12219' if role.startswith('expert') else '#00953b')
            path['role'] = role
            path['connectionVerified'] = False
            paths.append(path)
    return {'schemaVersion': 1, 'id': 'el-durazno-original-connection-artwork',
            'coordinateSystem': 'image-pixels', 'image': base['image'],
            'source': base['sources'][0], 'simplificationTolerancePx': 0, 'interpolated': False,
            'clipToImage': True, 'connections': [],
            'georeferencing': {'transform': None, 'useForNavigation': False, 'useForGroundDistances': False},
            'interpretation': 'Original dotted artwork labelled Conexiones / Conexiones para expertos. '
                              'No graph, named trail, direction or traversable junction is inferred.',
            'paths': paths}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pdf', type=Path, required=True)
    parser.add_argument('--output', type=Path, default=ROOT / 'data/el-durazno/cartel-context.json')
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    raw = (json.dumps(extract(args.pdf), ensure_ascii=False, indent=2) + '\n').encode()
    if args.check:
        assert args.output.read_bytes() == raw, 'Retained context artwork differs from native PDF extraction'
    else:
        args.output.write_bytes(raw)
    print(f'68 original source drawings; SHA256 {hashlib.sha256(raw).hexdigest()}')
