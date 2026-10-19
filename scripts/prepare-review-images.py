#!/usr/bin/env python3
"""Rasterize the official source in the existing review frame without generative upscaling."""
from pathlib import Path
import cv2,numpy as np,json,hashlib
root=Path(__file__).resolve().parent.parent
source=root/'sources/el-durazno-official-2022.jpg'
assert hashlib.sha256(source.read_bytes()).hexdigest()=='ee124136bc9930ca1928d2df1f79a9810fb4d245c66503a2d4c6ae888aea29af'
r=json.loads((root/'data/el-durazno/image-registration.json').read_text())
H=np.array(r['matrix']);scale=2
im=cv2.imread(str(source));aligned=cv2.warpPerspective(im,np.diag([scale,scale,1])@H,(900*scale,1100*scale),flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT,borderValue=(244,247,241))
out=root/'sources/el-durazno-official-aligned-2x.jpg'
cv2.imwrite(str(out),aligned,[cv2.IMWRITE_JPEG_QUALITY,95])
photo=root/'elh-durazno.jpg'
config={'schemaVersion':1,'coordinateFrame':{'width':900,'height':1100},'defaultId':'official','sources':[
 {'id':'official','label':'Mapa oficial · más detalle','url':out.relative_to(root).as_posix(),'naturalWidth':1800,'naturalHeight':2200,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'registration':'data/el-durazno/image-registration.json','rasterScale':2,'note':'Mapa oficial alineado al plano de la foto. El ajuste visual no valida GPS.'},
 {'id':'original','label':'Foto de revisión · 900 × 1100','url':'elh-durazno.jpg','naturalWidth':900,'naturalHeight':1100,'sha256':hashlib.sha256(photo.read_bytes()).hexdigest(),'rasterScale':1,'note':'Fotografía original del repositorio, conservada sin cambios.'}
]}
(root/'data/el-durazno/review-images.json').write_text(json.dumps(config,ensure_ascii=False,indent=2)+'\n')
print(out,out.stat().st_size,'bytes')
