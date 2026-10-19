#!/usr/bin/env python3
"""Apply reviewed photo observations. Preserve IDs; never add geographic links."""
import argparse,hashlib,json,math
from pathlib import Path

ROOT=Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser()
parser.add_argument('--data-dir',type=Path,default=ROOT/'data/el-durazno')
args=parser.parse_args();folder=args.data_dir
config=json.loads((folder/'visual-corrections.json').read_text())
data=json.loads((folder/'visual-trails.json').read_text())
dense=json.loads((folder/'centerline-samples.json').read_text())
assert config['coordinateSystem']==data['coordinateSystem']=='image-pixels'
assert config['imageSize']==[data['image']['width'],data['image']['height']]==[900,1100]
assert config['sourceImage']==data['image']['url']=='elh-durazno.jpg'
assert config['sourceSha256']==data['image']['sha256']==hashlib.sha256((ROOT/config['sourceImage']).read_bytes()).hexdigest(),'Source photograph hash mismatch'

def fingerprint(points):
 return hashlib.sha256(json.dumps(points,separators=(',',':')).encode()).hexdigest()

def distance(p,a,b):
 dx,dy=b[0]-a[0],b[1]-a[1]
 t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy or 1)))
 return math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)

def simplify(points):
 if len(points)<=2:return points
 distances=[distance(p,points[0],points[-1]) for p in points]
 i=max(range(len(points)),key=lambda i:distances[i])
 if distances[i]>config['simplificationTolerancePx']:
  return simplify(points[:i+1])[:-1]+simplify(points[i:])
 return [points[0],points[-1]]

def samples(points):
 result=[]
 for a,b in zip(points,points[1:]):
  count=max(1,math.ceil(math.dist(a,b)*5))
  result.extend([[round(a[k]+(b[k]-a[k])*i/count,4) for k in [0,1]] for i in range(count)])
 return result+[points[-1]]

for correction in config['corrections']:
 cid=correction['id'];sid=correction['segmentId']
 applied=next((x for x in data.get('appliedVisualCorrections',[]) if x['id']==cid),None)
 if applied:
  current=next(s for s in data['segments'] if s['id']==sid)
  assert fingerprint(correction)==applied['observationsSha256'],'Edited observations require a new reviewed correction'
  assert fingerprint(current['points'])==applied['afterPointsSha256'],'Applied geometry changed since review'
  continue
 points=correction['points'];x,y,w,h=correction['bounds']
 assert all(len(p)==2 and all(math.isfinite(v) for v in p) and x-1<=p[0]<=x+w+1 and y-1<=p[1]<=y+h+1 for p in points)
 if correction['kind']=='replace-visible-interval':
  segment=next(s for s in data['segments'] if s['id']==sid)
  assert fingerprint(segment['points'])==correction['beforePointsSha256'],'Unexpected predecessor geometry'
  a=segment['points'].index(correction['fromPoint']);b=segment['points'].index(correction['toPoint']);assert a<b
  assert points[0]==segment['points'][a] and points[-1]==segment['points'][b]
  segment['points']=segment['points'][:a]+simplify(points)+segment['points'][b+1:]
  raw=next(s for s in dense['fragments'] if s['segmentId']==sid)
  ia=min(range(len(raw['points'])),key=lambda i:math.dist(raw['points'][i],points[0]))
  ib=min(range(ia+1,len(raw['points'])),key=lambda i:math.dist(raw['points'][i],points[-1]))
  raw['points']=raw['points'][:ia]+samples(points)+raw['points'][ib+1:]
  segment.setdefault('manualCorrectionIds',[]).append(cid)
 elif correction['kind']=='add-visible-fragment':
  assert not any(s['id']==sid for s in data['segments'])
  gap=next(g for g in data['gaps'] if g['id']==correction['resolvesGapId'])
  assert gap['trailId']==correction['trailId'] and gap['bounds']==correction['bounds']
  segment={'id':sid,'trailId':gap['trailId'],'sourceId':'photo-manual-review','status':'visible','confidence':'reviewable-visual-match','startNodeId':sid+'-a','endNodeId':sid+'-b','points':simplify(points)}
  data['segments'].append(segment)
  dense['fragments'].append({'segmentId':sid,'points':samples(points)})
  for suffix,p in [('a',segment['points'][0]),('b',segment['points'][-1])]:
   data['nodes'].append({'id':sid+'-'+suffix,'point':p,'kind':'visual-fragment-end','connectionVerified':False})
  data['gaps'].remove(gap)
  data.setdefault('visualReviews',[]).append({'id':gap['id'],'status':'visually-resolved','segmentId':sid,'bounds':gap['bounds'],'sourceId':'photo-manual-review','reason':correction['reason'],'geographicConnectionVerified':False})
 else:raise ValueError('Unsupported correction')
 data.setdefault('appliedVisualCorrections',[]).append({'id':cid,'segmentId':sid,'observationsSha256':fingerprint(correction),'afterPointsSha256':fingerprint(segment['points'])})

if not any(s['id']=='photo-manual-review' for s in data['sources']):
 data['sources'].append({'id':'photo-manual-review','url':'elh-durazno.jpg','method':'manual observations on original photograph, independently inspected and checked against isolated official PDF contours','correctionsFile':'visual-corrections.json'})
data['digitization']['manualCorrectionsFile']='visual-corrections.json'
dense['manualCorrectionsFile']='visual-corrections.json'
dense['manualSampleCaveat']='Reviewed photo anchors are linearly sampled for simplification checks, not independently measured dense pixels or geographic truth.'
assert data['connections']==[] and data['geographicCorrespondences']==[] and data['georeferencing']['transform'] is None
# All assertions precede writes: an incompatible source/revision leaves files untouched.
(folder/'visual-trails.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
(folder/'centerline-samples.json').write_text(json.dumps(dense,separators=(',',':'))+'\n')
print(f"Reviewed image traces: {len(data['segments'])} fragments / {sum(len(s['points']) for s in data['segments'])} vertices / {len(data['gaps'])} pending")
