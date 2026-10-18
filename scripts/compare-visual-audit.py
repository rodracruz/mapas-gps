#!/usr/bin/env python3
"""Photographic before/after review at the same image coordinates; no generated detail."""
from pathlib import Path
import hashlib,json,subprocess
from PIL import Image,ImageDraw,ImageFont

root=Path(__file__).resolve().parent.parent
out=root/'docs/evidence/visual-audit';out.mkdir(parents=True,exist_ok=True)
raw=(root/'data/el-durazno/visual-trails.json').read_bytes();data=json.loads(raw)
config=json.loads((root/'data/el-durazno/visual-corrections.json').read_text())
before=json.loads(subprocess.check_output(['git','show','9111b69:data/el-durazno/visual-trails.json'],cwd=root))
photo=Image.open(root/config['sourceImage']).convert('RGB')
assert hashlib.sha256((root/config['sourceImage']).read_bytes()).hexdigest()==config['sourceSha256']
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',16)
small=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',13)
manifest={'coordinateSystem':'image-pixels','frame':[900,1100],'sourceSha256':config['sourceSha256'],'beforeCommit':'9111b69','geometrySha256':hashlib.sha256(raw).hexdigest(),'geographicTransform':None,'panels':[]}
for correction in config['corrections']:
 x,y,w,h=correction['bounds'];crop=[x-8,y-8,x+w+8,y+h+8];zoom=8
 size=((crop[2]-crop[0])*zoom,(crop[3]-crop[1])*zoom)
 original=photo.crop(tuple(crop)).resize(size,Image.Resampling.NEAREST)
 after=next(s for s in data['segments'] if s['id']==correction['segmentId'])
 canvas=Image.new('RGB',(1260,480),'#f6f7f2');draw=ImageDraw.Draw(canvas)
 draw.text((14,12),correction['id']+' · fotografía sin detalle inventado',font=font,fill='#173c30')
 for column,(title,version) in enumerate([('Foto original',None),('Trazado anterior · 9111b69',before),('Trazado corregido',data)]):
  panel=original.copy();lines=ImageDraw.Draw(panel)
  if version:
   for segment in version['segments']:
    if segment['trailId']!=after['trailId']:continue
    color=next(t['color'] for t in data['trails'] if t['id']==segment['trailId'])
    points=[((px-crop[0])*zoom,(py-crop[1])*zoom) for px,py in segment['points']]
    lines.line(points,fill=color,width=2)
  px=column*420+14;draw.text((px,48),title,font=font,fill='#173c30');canvas.paste(panel,(px,84))
 draw.text((14,450),f'Plano 900×1100 · recorte {crop} · 8× por replicación · sin transformación GPS',font=small,fill='#586a5e')
 filename=correction['id']+'-antes-despues.png';canvas.save(out/filename)
 manifest['panels'].append({'correctionId':correction['id'],'cropXYXY':crop,'zoom':zoom,'resampling':'nearest-neighbor','file':filename})
(out/'comparisons.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
assert (root/'data/el-durazno/visual-trails.json').read_bytes()==raw
print('Two source-verified photographic before/after comparisons; geometry unchanged')
