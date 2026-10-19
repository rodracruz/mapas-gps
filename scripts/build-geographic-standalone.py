#!/usr/bin/env python3
"""Build the mobile parks app with exact, hash-checked geographic source bytes."""
from pathlib import Path
import base64, hashlib, json, re

root = Path(__file__).resolve().parent.parent
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
modules = []
for path in ['geographic/data.mjs', 'geographic/catalog.mjs', 'review/sha256.mjs', 'geographic/viewer.mjs']:
    text = re.sub(r'^import .*?;\n', '', (root / path).read_text(), flags=re.M)
    modules.append(text.replace('export function ', 'function '))
html = html.replace('<script type="module" src="./geographic/viewer.mjs"></script>', payload + '<script type="module">\n' + '\n'.join(modules) + '\n</script>')
html = html.replace('href="./index.html"', 'href="https://rodracruz.github.io/mapas-gps/"')
html = html.replace('href="./mapa-geografico.html"', 'href="./"')
dest = root / 'dist/mapas-gps-parques.html'
dest.parent.mkdir(exist_ok=True)
dest.write_text(html)
print(f'{dest}: {dest.stat().st_size} bytes; SHA256 {hashlib.sha256(dest.read_bytes()).hexdigest()}')
