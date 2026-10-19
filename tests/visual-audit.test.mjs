import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {mkdtemp,copyFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const data=JSON.parse(await readFile(new URL('../data/el-durazno/visual-trails.json',import.meta.url)));
const distance=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);};
const along=(points,p)=>{let best={distance:Infinity,position:0};for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1))),d=distance(p,a,b);if(d<best.distance)best={distance:d,position:i-1+t};}return best;};
test('La Virgen retains both visible zigzag returns in photographed order',()=>{
 const s=data.segments.find(s=>s.id==='la-virgen-s05');
 assert.ok(s,'the visible zigzags need a source-backed fragment, not a pending rectangle');
 // Read independently on the native photograph, before drawing corrected vectors.
 const observations=[[420.5,432.0],[408.5,427.3],[413.5,436.5],[399.0,433.0],[401.0,442.5]];
 let previous=-1;
 for(const p of observations){const hit=along(s.points,p);assert.ok(hit.distance<=1.5,`${p}: ${hit.distance}px`);assert.ok(hit.position>previous,'preserve successive returns, not a shortcut');previous=hit.position;}
});
test('Lomo Vetado follows the photographed upper tip of the small hook',()=>{
 const s=data.segments.find(s=>s.id==='lomo-vetado-s02');
 const tip=[284.0,625.2];
 assert.ok(along(s.points,tip).distance<=1.5,'the hook must reach its visible upper tip before turning down');
});
test('resolved zigzag keeps its historical ID and does not authorize navigation',()=>{
 assert.equal(data.gaps.some(g=>g.id==='virgen-tight-turns'),false);
 const review=data.visualReviews?.find(g=>g.id==='virgen-tight-turns');assert.ok(review);
 assert.equal(review.status,'visually-resolved');assert.equal(review.segmentId,'la-virgen-s05');
 assert.equal(review.geographicConnectionVerified,false);
 assert.deepEqual(data.connections,[]);assert.deepEqual(data.geographicCorrespondences,[]);assert.equal(data.georeferencing.transform,null);
});
test('reviewed correction replay is byte-stable and rejects a changed photo contract before writing',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'mapas-gps-visual-review-'));
 try{
  for(const name of ['visual-trails.json','centerline-samples.json','visual-corrections.json'])await copyFile(new URL('../data/el-durazno/'+name,import.meta.url),join(dir,name));
  const command=new URL('../scripts/apply-visual-corrections.py',import.meta.url).pathname;
  const original=await readFile(join(dir,'visual-trails.json'));
  let result=spawnSync('python3',[command,'--data-dir',dir],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);
  assert.deepEqual(await readFile(join(dir,'visual-trails.json')),original);
  const config=JSON.parse(await readFile(join(dir,'visual-corrections.json')));config.sourceSha256='0'.repeat(64);await writeFile(join(dir,'visual-corrections.json'),JSON.stringify(config));
  result=spawnSync('python3',[command,'--data-dir',dir],{encoding:'utf8'});assert.notEqual(result.status,0);assert.match(result.stderr,/Source photograph hash mismatch/);
  assert.deepEqual(await readFile(join(dir,'visual-trails.json')),original);
 }finally{await rm(dir,{recursive:true,force:true});}
});
