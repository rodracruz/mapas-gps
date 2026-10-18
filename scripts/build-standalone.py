#!/usr/bin/env python3
"""Bundle the real review viewer, original photo and evidence for offline file:// use."""
from pathlib import Path
import base64,json,re,argparse,hashlib
ap=argparse.ArgumentParser();ap.add_argument("--reference-photo",type=Path);args=ap.parse_args()
root=Path(__file__).resolve().parent.parent
html=(root/'revision.html').read_text()
css=(root/'review/style.css').read_text()
geometry=(root/'review/geometry.mjs').read_text().replace('export function ','function ')
viewer=(root/'review/viewer.js').read_text()
viewer=re.sub(r"^import .*?;\n",'',viewer,flags=re.M)
geometry+='\n'+(root/'review/sha256.mjs').read_text().replace('export function ','function ')
imagesCode=(root/'review/images.mjs').read_text().replace('export function ','function ').replace('export async function ','async function ')
geometry+='\n'+re.sub(r"^import .*?;\n",'',imagesCode,flags=re.M)
data=json.loads((root/'data/el-durazno/visual-trails.json').read_text())
def safe(value):return json.dumps(value,ensure_ascii=False).replace('<','\\u003c')
config=json.loads((root/'data/el-durazno/review-images.json').read_text())
images={source['id']:'data:image/jpeg;base64,'+base64.b64encode((root/source['url']).read_bytes()).decode() for source in config['sources']}
html=html.replace('<link rel="stylesheet" href="./review/style.css">','<style>'+css+'</style>')
html=html.replace('<link rel="icon" href="./icons/icon192.png">','')
html=html.replace('href="./"','href="https://rodracruz.github.io/mapas-gps/"')
html=html.replace('href="./sources/el-durazno-official-2022.jpg"','href="https://www.outlife.cl/wp-content/uploads/2020/07/Mapa_El-Durazno-2022_web_Mesa-de-trabajo-1.jpg"')
extras='<script id="embedded-data" type="application/json">'+safe(data)+'</script>\n'
extras+='<script id="embedded-image-config" type="application/json">'+safe(config)+'</script>\n'
extras+='<script id="embedded-images" type="application/json">'+safe(images)+'</script>\n'
if args.reference_photo:
 from PIL import Image
 raw=args.reference_photo.read_bytes()
 with Image.open(args.reference_photo) as photo:width,height=photo.size;assert photo.format=='JPEG'
 reference={'width':width,'height':height,'sha256':hashlib.sha256(raw).hexdigest(),'dataUrl':'data:image/jpeg;base64,'+base64.b64encode(raw).decode()}
 extras+='<script id="embedded-reference-photo" type="application/json">'+safe(reference)+'</script>\n'

docs={}
for link,path in [('geographic-references.md','docs/evidence/geographic-references.md'),('primer-hito.md','docs/evidence/primer-hito.md')]:
 docs[link]=(root/path).read_text()
extras+='<script id="embedded-docs" type="application/json">'+safe(docs)+'</script>'
extras+='''<dialog id="evidence-dialog" style="max-width:900px;width:92vw;max-height:85dvh;border:1px solid #b9c9b5;border-radius:9px;padding:18px"><button id="close-evidence" autofocus style="float:right;min-width:44px;min-height:44px">Cerrar</button><pre style="white-space:pre-wrap;font:13px/1.7 system-ui;clear:both"></pre></dialog>'''
extraJS='''
const docs=JSON.parse(document.getElementById('embedded-docs').textContent);
for(const a of document.querySelectorAll('a[href^="./docs/evidence/"]')){
 const key=a.getAttribute('href').split('/').pop();a.removeAttribute('target');a.addEventListener('click',e=>{e.preventDefault();document.querySelector('#evidence-dialog pre').textContent=docs[key];document.getElementById('evidence-dialog').showModal();});
}
document.getElementById('close-evidence').onclick=()=>document.getElementById('evidence-dialog').close();
'''
html=html.replace('<script type="module" src="./review/viewer.js"></script>',extras+'<script type="module">\n'+geometry+'\n'+viewer+'\n'+extraJS+'</script>')
out=root/'dist';out.mkdir(exist_ok=True);dest=out/'mapas-gps-revision.html';dest.write_text(html)
print(dest, dest.stat().st_size,'bytes; no HTTP required for the review')
