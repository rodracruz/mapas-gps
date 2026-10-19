#!/usr/bin/env python3
"""Build the mobile parks app with exact, hash-checked geographic source bytes."""
from pathlib import Path
import argparse, base64, hashlib, json, re, shutil, subprocess, sys
from PIL import Image

root = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser()
parser.add_argument('--reference-photo', type=Path)
args = parser.parse_args()
legacy = [sys.executable, str(root / 'scripts/build-standalone.py')]
if args.reference_photo:
    legacy += ['--reference-photo', str(args.reference_photo.resolve())]
subprocess.run(legacy, check=True, capture_output=True)
html = (root / 'mapa-geografico.html').read_text()
for href in ['vendor/leaflet/leaflet.css', 'geographic/style.css']:
    html = html.replace(f'<link rel="stylesheet" href="./{href}">', '<style>' + (root / href).read_text() + '</style>')
vendor = (root / 'vendor/leaflet/leaflet.js').read_text()
html = html.replace('<script src="./vendor/leaflet/leaflet.js" defer></script>', '<script>' + vendor + '</script>')
catalog = json.loads((root / 'data/el-durazno/geographic-catalog.json').read_text())
source = (root / catalog['sourceSnapshot']).read_bytes()
assert hashlib.sha256(source).hexdigest() == catalog['sourceSnapshotSha256'], 'Source snapshot changed'
payload = '<script id="embedded-geographic-catalog" type="application/json">' + json.dumps(catalog, ensure_ascii=False).replace('<', '\\u003c') + '</script>'
payload += '<script id="embedded-osm-source" type="application/octet-stream">' + base64.b64encode(source).decode() + '</script>'
if args.reference_photo:
    raw = args.reference_photo.read_bytes()
    with Image.open(args.reference_photo) as photo:
        assert photo.format == 'JPEG', 'The preserved photograph must be JPEG'
        width, height = photo.size
    photo_data = {'width': width, 'height': height, 'sha256': hashlib.sha256(raw).hexdigest(), 'dataUrl': 'data:image/jpeg;base64,' + base64.b64encode(raw).decode()}
    payload += '<script id="embedded-park-photo" type="application/json">' + json.dumps(photo_data) + '</script>'
visual_path = root / 'data/el-durazno/all-visual-trails.json'
if visual_path.exists():
    payload += '<script id="embedded-all-visual" type="application/json">' + visual_path.read_text().replace('<', '\\u003c') + '</script>'
modules = []
for path in ['geographic/data.mjs', 'geographic/catalog.mjs', 'review/geometry.mjs', 'review/sha256.mjs', 'geographic/sign.mjs', 'geographic/viewer.mjs']:
    text = re.sub(r'^import .*?;\n', '', (root / path).read_text(), flags=re.M)
    modules.append(text.replace('export function ', 'function '))
html = html.replace('<script type="module" src="./geographic/viewer.mjs"></script>', payload + '<script type="module">\n' + '\n'.join(modules) + '\n</script>')
html = html.replace('href="./index.html"', 'href="https://rodracruz.github.io/mapas-gps/"')
html = html.replace('href="./mapa-geografico.html"', 'href="#"')
html = html.replace('href="./revision.html"', 'href="./mapas-gps-revision.html"')
dest = root / 'dist/mapas-gps-parques.html'
dest.parent.mkdir(exist_ok=True)
dest.write_text(html)
source_dir = dest.parent / 'sources'
source_dir.mkdir(exist_ok=True)
shutil.copy2(root / 'sources/el-durazno-official-2022.jpg', source_dir / 'el-durazno-official-2022.jpg')
print(f'{dest}: {dest.stat().st_size} bytes; SHA256 {hashlib.sha256(dest.read_bytes()).hexdigest()}')
