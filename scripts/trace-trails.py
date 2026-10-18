#!/usr/bin/env python3
"""Reproduce image-pixel centerlines from the pinned official PDF and original photo.
Tool dependencies: requirements-tracing.txt. No generative processing or geographic CRS.
Usage: python scripts/trace-trails.py --pdf /path/to/official-map.pdf
The original and the downloaded official JPG are never modified.
"""
from pathlib import Path
import argparse, hashlib, heapq, json, math
from reviewed_trace_output import publish_reviewed_traces
import cv2
import fitz
import numpy as np
from scipy.ndimage import gaussian_filter, map_coordinates
from skimage.morphology import skeletonize
ROOT=Path(__file__).resolve().parent.parent
ap=argparse.ArgumentParser();ap.add_argument('--pdf',required=True);args=ap.parse_args()
photo=ROOT/'elh-durazno.jpg'
assert hashlib.sha256(photo.read_bytes()).hexdigest()=='c9fde34725691801933b3ba72f887a31677dba305d30f0f938f0ddf81211d018'
registration=json.loads((ROOT/'data/el-durazno/image-registration.json').read_text())
assert hashlib.sha256(Path(args.pdf).read_bytes()).hexdigest()=='9a67123b027197042da8e47d0c6dbe61e800d11e0e7fe01a5d85172b65ef39ab', 'Unexpected official PDF bytes'
pdf=fitz.open(args.pdf);page=pdf[0];drawings=page.get_drawings()
H=np.array(registration['matrix'])@np.diag([2570/page.rect.width,3077/page.rect.height,1])
rgb=cv2.cvtColor(cv2.imread(str(photo)),cv2.COLOR_BGR2RGB).astype(float)
rgb=gaussian_filter(rgb,[.6,.6,0])

def ordered(sk,start,end):
 pixels=set(map(tuple,np.argwhere(sk)))
 a=min(pixels,key=lambda p:(p[1]/3-start[0])**2+(p[0]/3-start[1])**2)
 b=min(pixels,key=lambda p:(p[1]/3-end[0])**2+(p[0]/3-end[1])**2)
 q=[(0,a)];cost={a:0};prev={}
 while q:
  c,p=heapq.heappop(q)
  if p==b:break
  if c!=cost[p]:continue
  for dy in [-1,0,1]:
   for dx in [-1,0,1]:
    v=(p[0]+dy,p[1]+dx)
    if (dy or dx) and v in pixels:
     nc=c+math.hypot(dx,dy)
     if nc<cost.get(v,float('inf')):cost[v]=nc;prev[v]=p;heapq.heappush(q,(nc,v))
 assert b in cost,'Disconnected source; never join automatically'
 path=[b]
 while path[-1]!=a:path.append(prev[path[-1]])
 return np.array([[x/3,y/3] for y,x in reversed(path)])

def rdp(points,tolerance):
 if len(points)<=2:return points
 a,b=points[0],points[-1];d=b-a
 if d@d==0:dist=np.linalg.norm(points-a,axis=1)
 else:
  t=np.clip(((points-a)@d)/(d@d),0,1);dist=np.linalg.norm(points-(a+t[:,None]*d),axis=1)
 i=int(np.argmax(dist))
 if dist[i]>tolerance:return np.vstack([rdp(points[:i+1],tolerance)[:-1],rdp(points[i:],tolerance)])
 return points[[0,-1]]

def center_on_photo(points,color):
 # Local normal search limited to 3 native pixels; cannot change topology.
 tangent=np.gradient(gaussian_filter(points,[3,0]),axis=0)
 normal=np.column_stack([-tangent[:,1],tangent[:,0]])
 normal/=np.maximum(np.linalg.norm(normal,axis=1)[:,None],1e-6)
 if color=='blue':chroma=(rgb[:,:,1]+rgb[:,:,2])/2-rgb[:,:,0]
 else:chroma=rgb[:,:,1]-(rgb[:,:,0]+rgb[:,:,2])/2
 score=chroma-gaussian_filter(chroma,4)
 offsets=np.arange(-3,3.01,.25)
 samples=points[:,None,:]+normal[:,None,:]*offsets[None,:,None]
 values=map_coordinates(score,[samples[:,:,1],samples[:,:,0]],order=1,mode='nearest')
 # Penalize large changes; the registered official path is the prior.
 offsets_found=offsets[np.argmax(values-0.2*offsets[None,:]**2,axis=1)]
 offsets_found=gaussian_filter(offsets_found,3)
 return points+normal*offsets_found[:,None]

trails=[{'id':'starwars','name':'Starwars','color':'#16b7ee','sourceDrawingIndex':51}, {'id':'la-virgen','name':'La Virgen','color':'#35db8c','sourceDrawingIndex':31}, {'id':'lomo-vetado','name':'Lomo Vetado','color':'#d87cff','sourceDrawingIndex':39}]
gaps=[
 {'id':'sw-label-east','trailId':'starwars','bounds':[588,128,56,34],'reason':'Rótulo Starwars del este: eje tapado por letras y placa.'},
 {'id':'sw-label-west','trailId':'starwars','bounds':[334,343,45,50],'reason':'Rótulo Starwars del oeste y pictograma azul: eje oculto.'},
 {'id':'virgen-label-upper','trailId':'la-virgen','bounds':[398,380,47,36],'reason':'Rótulo La Virgen superior: no se interpola bajo las letras.'},
 {'id':'virgen-tight-turns','trailId':'la-virgen','bounds':[397,423,28,21],'reason':'Zigzags muy próximos: el grosor y la resolución impiden separar inequívocamente los vértices.'},
 {'id':'virgen-label-lower','trailId':'la-virgen','bounds':[213,731,49,33],'reason':'Segundo rótulo La Virgen: eje tapado.'},
 {'id':'lomo-label','trailId':'lomo-vetado','bounds':[376,514,64,52],'reason':'Rótulo diagonal Lomo Vetado: eje oculto por letras y placa.'},
 {'id':'lomo-end','trailId':'lomo-vetado','bounds':[290,689,20,20],'reason':'Flecha/extremo azul inferior: centro exacto y relación con conexión punteada pendientes.'}
]
segments=[];nodes=[];raw_counts={};centered_fragments=[]
ends={'starwars':([612,272],[221,561]),'la-virgen':([575,242],[269,770]),'lomo-vetado':([607,376],[298,698])}
for trail in trails:
 d=drawings[trail['sourceDrawingIndex']];doc=fitz.open();p=doc.new_page(width=page.rect.width,height=page.rect.height);s=p.new_shape()
 for item in d['items']:
  if item[0]=='l':s.draw_line(*item[1:])
  elif item[0]=='c':s.draw_bezier(*item[1:])
  else:raise ValueError('Unexpected PDF primitive')
 s.finish(fill=(0,0,0),color=None,closePath=False);s.commit()
 pix=p.get_pixmap(matrix=fitz.Matrix(4,4),alpha=False);a=np.frombuffer(pix.samples,np.uint8).reshape(pix.height,pix.width,3)
 mat=np.diag([3,3,1])@H@np.diag([.25,.25,1])
 w=cv2.warpPerspective(255-a[:,:,0],mat,(2700,3300))
 points=ordered(skeletonize(w>100),*ends[trail['id']]);raw_counts[trail['id']]=len(points)
 # Drop masked intervals BEFORE centering. Never connect across dropped intervals.
 keep=np.ones(len(points),dtype=bool)
 for g in gaps:
  if g['trailId']!=trail['id']:continue
  x,y,ww,hh=g['bounds'];keep &= ~((points[:,0]>=x)&(points[:,0]<=x+ww)&(points[:,1]>=y)&(points[:,1]<=y+hh))
 groups=[];current=[]
 for xy,ok in zip(points,keep):
  if ok:current.append(xy)
  elif current:groups.append(np.array(current));current=[]
 if len(current):groups.append(np.array(current))
 for n,chunk in enumerate(groups,1):
  if len(chunk)<8:continue
  chunk=center_on_photo(chunk,'green' if trail['id']=='la-virgen' else 'blue');simple=rdp(chunk,1)
  points_out=np.round(simple,2).tolist();sid=f"{trail['id']}-s{n:02d}"
  centered_fragments.append({'segmentId':sid,'points':np.round(chunk,4).tolist()})
  ns=[]
  for side,xy in [('a',points_out[0]),('b',points_out[-1])]:
   nid=f'{sid}-{side}';ns.append(nid);nodes.append({'id':nid,'point':xy,'kind':'visual-fragment-end','connectionVerified':False})
  segments.append({'id':sid,'trailId':trail['id'],'sourceId':'photo-and-official-pdf','status':'visible','confidence':'reviewable-visual-match','startNodeId':ns[0],'endNodeId':ns[1],'points':points_out})
for g in gaps:g.update({'geometry':None,'status':'pending','sourceId':'original-photo'})
data={'schemaVersion':1,'id':'el-durazno-visual-v1','coordinateSystem':'image-pixels','image':{'url':'elh-durazno.jpg','width':900,'height':1100,'sha256':hashlib.sha256(photo.read_bytes()).hexdigest(),'transform':[1,0,0,1,0,0]},'sources':[{'id':'original-photo','url':'elh-durazno.jpg'},{'id':'photo-and-official-pdf','url':'https://www.outlife.cl/wp-content/uploads/2023/04/Mapa_El-Durazno-2022_web.pdf','method':'official outline centerline, registered and locally centered on original photo','registrationFile':'image-registration.json','pdfSha256':hashlib.sha256(Path(args.pdf).read_bytes()).hexdigest()}],'digitization':{'method':'source-vector-assisted image tracing','simplificationTolerancePx':1,'localCenteringLimitPx':3,'workingRasterScale':3,'expectedVisualUncertaintyPx':3,'rawCenterlineSamples':raw_counts,'noGeographicUnits':True},'georeferencing':{'status':'unvalidated','transform':None},'trails':trails,'segments':segments,'gaps':gaps,'nodes':nodes,'connections':[],'geographicCorrespondences':[]}
print('Segments',len(segments),'vertices',sum(len(s['points']) for s in segments),'gaps',len(gaps))
publish_reviewed_traces(data,{'coordinateSystem':'image-pixels','fragments':centered_fragments},ROOT/'data/el-durazno',ROOT/'scripts/apply-visual-corrections.py')
print('Reviewed corrections applied successfully before publishing trace files')
