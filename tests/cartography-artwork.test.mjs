import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {imageToMercator} from '../geographic/cartel.mjs';

test('the official dotted connections are retained as document artwork, never a navigable graph', async()=>{
 const url=new URL('../data/el-durazno/cartel-context.json',import.meta.url);
 assert.ok(existsSync(url),'68 original connection drawings must not disappear from the map');
 const d=JSON.parse(await readFile(url)),base=JSON.parse(await readFile(new URL('../data/el-durazno/continuous-sign-trails.json',import.meta.url)));
 assert.equal(d.coordinateSystem,'image-pixels');assert.deepEqual(d.image,base.image);
 assert.equal(d.source.sha256,base.sources[0].sha256);
 assert.equal(d.simplificationTolerancePx,0);assert.equal(d.interpolated,false);
 assert.deepEqual(d.connections,[]);assert.equal(d.georeferencing.transform,null);
 assert.equal(d.georeferencing.useForNavigation,false);assert.equal(d.georeferencing.useForGroundDistances,false);
 const expected=[0,1,2,3,...Array.from({length:62},(_,i)=>i+278),357,358];
 assert.deepEqual(d.paths.flatMap(p=>p.sourceDrawingIndices),expected);
 assert.equal(d.paths.filter(p=>p.role==='expert-connection-artwork').length,4);
 assert.equal(d.paths.filter(p=>p.role==='connection-artwork').length,64);
 assert.equal(new Set(d.paths.map(p=>p.id)).size,68);
 for(const p of d.paths){assert.ok(p.d.length>0);assert.ok(['#00953b','#e12219'].includes(p.fill));assert.equal(p.stroke,'none');}
 const hash=createHash('sha256').update(await readFile(url)).digest('hex');
 const module=await import('../geographic/cartel-context.mjs');
 assert.equal(module.contextArtworkSha256,hash);assert.equal(module.validateContextArtwork(d,base),d);
 for(const mutate of [x=>x.connections.push({from:'a',to:'b'}),x=>x.georeferencing.useForNavigation=true,x=>x.image.width++,x=>x.source.sha256='0'.repeat(64),x=>x.paths[0].d='<script>',x=>x.paths[0].sourceDrawingIndices=[51]]){
  const bad=structuredClone(d);mutate(bad);assert.throws(()=>module.validateContextArtwork(bad,base));
 }
});

test('the geographic presentation preserves every source segment and separation without introducing topology',async()=>{
 const base=JSON.parse(await readFile(new URL('../data/el-durazno/continuous-sign-trails.json',import.meta.url))),registration=JSON.parse(await readFile(new URL('../data/el-durazno/cartel-registration.json',import.meta.url)));
 const [a,b,c,d,e,f]=registration.experimentalModel.matrix,det=a*d-b*c,scale=Math.hypot(a,b);
 assert.ok(Math.abs(det)>0);assert.ok(Math.abs(a*c+b*d)<1e-10);assert.ok(Math.abs(Math.hypot(c,d)-scale)<1e-10,'one global similarity, no per-route warping');
 let checked=0;
 for(const segment of base.segments){
  let prior=null,priorProjected=null;
  for(const p of segment.points){
   const q=imageToMercator(p,registration),x=q[0]-e,y=q[1]-f,roundtrip=[(d*x-c*y)/det,(-b*x+a*y)/det];
   assert.ok(Math.hypot(roundtrip[0]-p[0],roundtrip[1]-p[1])<1e-8);
   if(prior)assert.ok(Math.abs(Math.hypot(q[0]-priorProjected[0],q[1]-priorProjected[1])-scale*Math.hypot(p[0]-prior[0],p[1]-prior[1]))<1e-8);
   prior=p;priorProjected=q;checked++;
  }
 }
 assert.ok(checked>10000);assert.equal(base.segments.length,95);assert.equal(base.routePaths.length,23);assert.deepEqual(base.connections,[]);
 assert.equal(registration.acceptedTransform,null);assert.equal(registration.validation.status,'unvalidated');assert.equal(registration.experimentalModel.useForNavigation,false);
});
