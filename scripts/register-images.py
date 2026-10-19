#!/usr/bin/env python3
"""Reproduce visual-only SIFT homography; writes scratch outputs, never modifies originals."""
import cv2,numpy as np,json
from pathlib import Path
import argparse
root=Path(__file__).resolve().parent.parent
ap=argparse.ArgumentParser();ap.add_argument('--output',required=True);args=ap.parse_args()
p=Path(args.output);p.mkdir(parents=True,exist_ok=True)
a=cv2.imread(str(root/'sources/el-durazno-official-2022.jpg'));b=cv2.imread(str(root/'elh-durazno.jpg'))
s=cv2.SIFT_create(nfeatures=15000)
ka,da=s.detectAndCompute(cv2.cvtColor(a,cv2.COLOR_BGR2GRAY),None);kb,db=s.detectAndCompute(cv2.cvtColor(b,cv2.COLOR_BGR2GRAY),None)
m=cv2.BFMatcher().knnMatch(da,db,k=2);good=[v[0] for v in m if len(v)==2 and v[0].distance<.7*v[1].distance]
good=[v for v in good if ka[v.queryIdx].pt[0]>580 and ka[v.queryIdx].pt[1]<2490 and np.linalg.norm((np.array(ka[v.queryIdx].pt)-[578,80])/2.2-np.array(kb[v.trainIdx].pt))<50]
src=np.float32([ka[v.queryIdx].pt for v in good]);dst=np.float32([kb[v.trainIdx].pt for v in good])
H,mask=cv2.findHomography(src,dst,cv2.RANSAC,2.5);inside=mask.ravel()==1
print('matches',len(good),'inliers',sum(inside),'H',H)
np.random.seed(2026);indices=np.random.permutation(np.where(inside)[0]);train=indices[::2];check=indices[1::2]
H2,_=cv2.findHomography(src[train],dst[train],0)
err=np.linalg.norm(cv2.perspectiveTransform(src[check,None],H2)[:,0]-dst[check],axis=1)
print('train',len(train),'check',len(check),'rmse',np.sqrt(np.mean(err**2)),'max',max(err))
warp=cv2.warpPerspective(a,H,(900,1100));cv2.imwrite(str(p/'registered.jpg'),warp);cv2.imwrite(str(p/'registration-blend.jpg'),cv2.addWeighted(b,.5,warp,.5,0))
(p/'registration.json').write_text(json.dumps({'model':'homography','matrix':H.tolist(),'matching':len(good),'inliers':int(sum(inside)),'trainingCount':len(train),'checkCount':len(check),'heldOutRMSEpx':float(np.sqrt(np.mean(err**2))),'heldOutMaxPx':float(max(err)),'sourcePoints':src[inside].tolist(),'targetPoints':dst[inside].tolist()},indent=2))
