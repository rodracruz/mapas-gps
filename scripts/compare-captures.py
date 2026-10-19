#!/usr/bin/env python3
"""Arrange real browser screenshots; no curve generation or image enhancement."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
root=Path(__file__).resolve().parent.parent/'docs/evidence/screenshots'
for name in ['starwars','la-virgen','lomo-vetado']:
 imgs=[Image.open(root/f'{name}-{mode}.png').convert('RGB') for mode in ['photo','overlay','vectors']]
 w,h=imgs[0].size
 assert all(im.size==(w,h) for im in imgs)
 canvas=Image.new('RGB',(w*3,h+44),'#f6f7f2');d=ImageDraw.Draw(canvas)
 try:font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',20)
 except OSError:font=ImageFont.load_default()
 for i,(im,label) in enumerate(zip(imgs,['Fotografía original','Superposición: fragmentos y zonas pendientes','Solo vectores en coordenadas de imagen'])):
  canvas.paste(im,(i*w,44));d.text((i*w+15,10),label,fill='#173c30',font=font)
 canvas.save(root/f'{name}-comparacion.png')
print('3 comparison sheets created from actual browser captures')
