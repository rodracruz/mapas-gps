import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateDataset} from '../review/geometry.mjs';
const d=JSON.parse(await readFile(new URL('../data/el-durazno/all-visual-trails.json',import.meta.url)));
const catalog=JSON.parse(await readFile(new URL('../data/el-durazno/geographic-catalog.json',import.meta.url)));
test('all sign names have editable visible fragments, isolated endpoints and no geographic transform',()=>{
 validateDataset(d);
 assert.deepEqual(d.trails.filter(t=>t.category!=='auxiliary').map(t=>t.id).sort(),catalog.targets.filter(t=>t.visualTrailId).map(t=>t.visualTrailId).sort());
 assert.equal(d.trails.filter(t=>t.category==='auxiliary').length,2);
 assert.equal(d.coordinateSystem,'image-pixels');assert.equal(d.georeferencing.transform,null);assert.deepEqual(d.connections,[]);
 for(const t of d.trails){assert.ok(d.segments.some(s=>s.trailId===t.id));assert.ok(t.associationEvidence.labelDrawingIndices.length);}
});
test('visual geometry belongs to the exact full-resolution source, not the phone photograph or GPS',async()=>{
 const raw=await readFile(new URL('../'+d.image.url,import.meta.url));assert.equal(createHash('sha256').update(raw).digest('hex'),d.image.sha256);
 assert.deepEqual([d.image.width,d.image.height],[2570,3077]);assert.deepEqual(d.image.transform,[1,0,0,1,0,0]);
 const invalid=structuredClone(d);invalid.image.transform=[1,0,0,1,2,0];assert.throws(()=>validateDataset(invalid),/identidad/);
 const gps=structuredClone(d);gps.coordinateSystem='WGS84';assert.throws(()=>validateDataset(gps),/coordenadas de imagen/);
});
test('retained curves have bounded native-pixel sampling and never cross any pending interior',()=>{
 const max=d.digitization.maximumExportedEdgeLengthPx;assert.ok(max<=.354);assert.equal(d.digitization.simplificationTolerancePx,0);assert.equal(d.digitization.hiddenSpanInterpolation,false);
 for(const s of d.segments){
  const gaps=d.gaps.filter(g=>g.trailId===s.trailId);
  for(let i=1;i<s.points.length;i++){
   const a=s.points[i-1],b=s.points[i];assert.ok(Math.hypot(b[0]-a[0],b[1]-a[1])<=max+.0002,s.id+' has an unbounded shortcut');
   const x=(a[0]+b[0])/2,y=(a[1]+b[1])/2;
   for(const g of gaps){const [gx,gy,w,h]=g.bounds;assert.ok(!(x>gx&&x<gx+w&&y>gy&&y<gy+h),s.id+' crosses '+g.id);}
  }
 }
});
