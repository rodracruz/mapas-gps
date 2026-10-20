#!/usr/bin/env python3
"""Bundle a catalog-driven park entry, keeping module lexical scopes separate."""
from pathlib import Path
import base64,hashlib,json,re,shutil
root=Path(__file__).resolve().parent.parent
output=root/'dist';output.mkdir(exist_ok=True)
html=(root/'parquemet.html').read_text()
for path in ['vendor/leaflet/leaflet.css','geographic/style.css']:
 html=html.replace(f'<link rel="stylesheet" href="./{path}">','<style>'+(root/path).read_text()+'</style>')
html=html.replace('<script src="./vendor/leaflet/leaflet.js" defer></script>','<script>'+(root/'vendor/leaflet/leaflet.js').read_text()+'</script>')
catalog=json.loads((root/'data/parquemet/geographic-catalog.json').read_text());document=json.loads((root/'data/parquemet/official-document.json').read_text());directory=json.loads((root/'data/parks.json').read_text())
for p in directory['parks']:
 if p['id']=='el-durazno':p['entry']='./index.html#parque=el-durazno'
source=(root/catalog['sourceSnapshot']).read_bytes();assert hashlib.sha256(source).hexdigest()==catalog['sourceSnapshotSha256']
for asset in ['image','pdf']:
 path=root/document[asset]['path'];assert hashlib.sha256(path.read_bytes()).hexdigest()==document[asset]['sha256'];dest=output/document[asset]['path'];dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(path,dest)
payload=''
for element,value in [('embedded-parks-directory',directory),('embedded-park-catalog',catalog),('embedded-park-document',document)]:
 payload+=f'<script id="{element}" type="application/json">'+json.dumps(value,ensure_ascii=False).replace('<','\\u003c')+'</script>'
payload+='<script id="embedded-park-source" type="application/octet-stream">'+base64.b64encode(source).decode()+'</script>'
modules=[]
for path,namespace,exports,bindings in [
 ('geographic/data.mjs','ParkGeo','fromOsmSnapshot,lineLength',''),
 ('geographic/network.mjs','ParkNetwork','bikeAccessRestricted,bikeMatchingNetwork',''),
 ('geographic/catalog.mjs','ParkCatalog','validateCatalog,describeTrail','const {lineLength}=ParkGeo;'),
 ('review/sha256.mjs','ParkHash','sha256',''),
 ('review/geometry.mjs','ParkGeometry','fitView,zoomView,panView',''),
 ('geographic/parks.mjs','ParkDirectory','loadParkDirectory,parkById',''),
 ('navigation/matcher.mjs','ParkMatcher','createRouteMatcher',''),
 ('navigation/demo.mjs','ParkDemo','createPublicDemo','const {lineLength}=ParkGeo;'),
 ('geographic/gps.mjs','ParkGPS','setupGpsTracking','const {createRouteMatcher}=ParkMatcher;const {createPublicDemo}=ParkDemo;'),
 ('geographic/document.mjs','ParkDocument','setupOfficialDocument','const {fitView,zoomView,panView}=ParkGeometry;'),
 ('geographic/park-viewer.mjs','ParkApp','', 'const {bikeAccessRestricted,bikeMatchingNetwork}=ParkNetwork;const {loadParkDirectory,parkById}=ParkDirectory;const {validateCatalog,describeTrail}=ParkCatalog;const {fromOsmSnapshot}=ParkGeo;const {sha256}=ParkHash;const {setupOfficialDocument}=ParkDocument;const {setupGpsTracking}=ParkGPS;')]:
 code=re.sub(r'^import .*?;\n','',(root/path).read_text(),flags=re.M);code=re.sub(r'\bexport (function|const|let|class) ',r'\1 ',code);code=code.replace('export async function ','async function ')
 modules.append(f'const {namespace}=(()=>{{\n{bindings}\n{code}\nreturn {{{exports}}};\n}})();')
html=html.replace('<script type="module" src="./geographic/park-viewer.mjs"></script>',payload+'<script type="module">\n'+'\n'.join(modules)+'\n</script>')
html=html.replace('href="./index.html"','href="https://rodracruz.github.io/mapas-gps/"').replace('href="./mapa-geografico.html"','href="./index.html"')
dest=output/'parquemet.html';dest.write_text(html);print(f'{dest}: {dest.stat().st_size} bytes; SHA256 {hashlib.sha256(dest.read_bytes()).hexdigest()}')
