#!/usr/bin/env python3
"""Compare pending image regions at identical crops. No inferred geometry or enhancement."""
from pathlib import Path
import argparse,hashlib,json,re,textwrap
from PIL import Image,ImageDraw,ImageFont

root=Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser()
parser.add_argument('--output-dir',type=Path,default=root/'docs/evidence/pending')
args=parser.parse_args();args.output_dir.mkdir(parents=True,exist_ok=True)
data_path=root/'data/el-durazno/visual-trails.json'
data_bytes=data_path.read_bytes();data=json.loads(data_bytes)
config=json.loads((root/'data/el-durazno/review-images.json').read_text())
sources={s['id']:s for s in config['sources']};rasters={}
for key in ['original','official']:
 source=sources[key];raw=(root/source['url']).read_bytes()
 assert hashlib.sha256(raw).hexdigest()==source['sha256']
 rasters[key]=Image.open(root/source['url']).convert('RGB')
 assert rasters[key].size==(source['naturalWidth'],source['naturalHeight'])
 assert (source['naturalWidth']/source['rasterScale'],source['naturalHeight']/source['rasterScale'])==(data['image']['width'],data['image']['height'])
font_path='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
font=ImageFont.truetype(font_path,17);small=ImageFont.truetype(font_path,14)
panels_width=460;panel_height=390;zoom=4;padding=20
pages=[];regions=[]
for index,gap in enumerate(data['gaps'],1):
 assert re.fullmatch('[a-z0-9-]+',gap['id'])
 x,y,w,h=gap['bounds']
 left=max(0,x-padding);top=max(0,y-padding)
 right=min(data['image']['width'],x+w+padding);bottom=min(data['image']['height'],y+h+padding)
 crop=[left,top,right,bottom];display_size=((right-left)*zoom,(bottom-top)*zoom)
 assert display_size[0]<=panels_width-20 and display_size[1]<=panel_height
 page=Image.new('RGB',(panels_width*3,550),'#f6f7f2');draw=ImageDraw.Draw(page)
 trail=next(t for t in data['trails'] if t['id']==gap['trailId'])
 draw.text((16,12),f"Zona {index} · {trail['name']} · {gap['id']}",fill='#173c30',font=font)
 for row,text in enumerate(textwrap.wrap(gap['reason'],width=140)):draw.text((16,39+row*20),text,fill='#586a5e',font=small)
 photos=[]
 for key in ['original','official']:
  scale=sources[key]['rasterScale'];native_crop=tuple(int(v*scale) for v in crop)
  photos.append(rasters[key].crop(native_crop).resize(display_size,Image.Resampling.NEAREST))
 overlay=photos[0].copy();lines=ImageDraw.Draw(overlay)
 for segment in data['segments']:
  if segment['trailId']!=gap['trailId']:continue
  points=[((px-left)*zoom,(py-top)*zoom) for px,py in segment['points']]
  lines.line(points,fill=trail['color'],width=3,joint='curve')
 lines.rectangle(((x-left)*zoom,(y-top)*zoom,(x+w-left)*zoom,(y+h-top)*zoom),outline='#b47210',width=3)
 for column,(im,title) in enumerate(zip([*photos,overlay],['Foto original · raster 1×','Oficial alineado · raster 2×','Foto + fragmentos existentes'])):
  px=column*panels_width+12
  draw.text((px,88),title,fill='#173c30',font=font);page.paste(im,(px,118))
 draw.text((16,518),f'Plano 900×1100 px · recorte {crop} · zoom 4× por replicación · sin georreferenciación',fill='#586a5e',font=small)
 name=gap['id']+'-comparacion.png';page.save(args.output_dir/name)
 regions.append({'gapId':gap['id'],'status':gap['status'],'imageCropXYXY':crop,'comparisonFile':name})
 pages.append(page)
contact=Image.new('RGB',(panels_width*3,len(pages)*550),'#f6f7f2')
for i,page in enumerate(pages):contact.paste(page,(0,i*550))
contact.save(args.output_dir/'siete-zonas-comparacion.png')
manifest={'coordinateSystem':'image-pixels','coordinateFrame':[data['image']['width'],data['image']['height']],'geometrySha256':hashlib.sha256(data_bytes).hexdigest(),'displayZoom':zoom,'resampling':'nearest-neighbor; ordinary pixel replication, no generative enhancement','sourceHashes':{key:sources[key]['sha256'] for key in rasters},'registration':'data/el-durazno/image-registration.json','geographicTransform':None,'regions':regions}
(args.output_dir/'comparisons.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
assert data_path.read_bytes()==data_bytes
print(f'{len(pages)} comparable pending crops; source hashes verified; geometry unchanged')
