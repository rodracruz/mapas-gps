import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const api=await import('../review/geometry.mjs').catch(()=>({}));
const data=JSON.parse(await readFile(new URL('../data/el-durazno/visual-trails.json',import.meta.url)));
test('validates actual image dataset and rejects geographic coordinates and malformed paths',()=>{
 assert.equal(typeof api.validateDataset,'function');
 assert.equal(api.validateDataset(data),data);
 for(const mutate of [d=>d.coordinateSystem='EPSG:4326',d=>d.segments[0].points[0]=[NaN,5],d=>d.segments[0].points[0]=[901,0],d=>d.segments[0].trailId='missing',d=>d.image.width=0,d=>d.gaps[0].geometry=[[1,2],[2,3]],d=>d.segments.push(d.segments[0])]){
  const bad=structuredClone(data);mutate(bad);assert.throws(()=>api.validateDataset(bad));
 }
});
test('zoom preserves world anchor and pan is reversible',()=>{
 assert.equal(typeof api.zoomView,'function');
 const v=api.fitView(900,1100),a={x:321,y:675};
 const z=api.zoomView(v,.4,a);
 assert.ok(Math.abs((a.x-v.x)/v.width-(a.x-z.x)/z.width)<1e-12);
 assert.ok(Math.abs((a.y-v.y)/v.height-(a.y-z.y)/z.height)<1e-12);
 assert.deepEqual(api.panView(api.panView(v,38,-70),-38,70),v);
 assert.deepEqual(api.zoomView(z,2.5,a),v);
 assert.throws(()=>api.zoomView(v,0,a));
});
test('simplification has not drawn through pending regions',()=>{
 // A missing split would draw a line through an actual label/hairpin region.
 for(const s of data.segments)for(const p of s.points)for(const g of data.gaps.filter(g=>g.trailId===s.trailId)){
  const [x,y,w,h]=g.bounds;
  assert.ok(!(p[0]>x+3&&p[0]<x+w-3&&p[1]>y+3&&p[1]<y+h-3),s.id+' entered '+g.id);
 }
});
test('all dense traced samples remain within the explicit 1px simplification tolerance',async()=>{
 const dense=JSON.parse(await readFile(new URL('../data/el-durazno/centerline-samples.json',import.meta.url)));
 const distance=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);};
 for(const fragment of dense.fragments){
  const s=data.segments.find(s=>s.id===fragment.segmentId);assert.ok(s);
  const max=Math.max(...fragment.points.map(p=>Math.min(...s.points.slice(1).map((b,i)=>distance(p,s.points[i],b)))));
  assert.ok(max<=1.008,`${s.id}: ${max}px exceeds tolerance + rounding`);
 }
});
