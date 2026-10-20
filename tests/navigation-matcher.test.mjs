import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fromOsmSnapshot} from '../geographic/data.mjs';

const api=await import('../navigation/matcher.mjs').catch(()=>({}));
const metres=6371008.8*Math.PI/180;
const xy=(x,y)=>[x/metres,y/metres];
const way=(id,points,nodeIds,{targetId=id,name=id}={})=>({type:'Feature',id,properties:{nodeIds,targetId,name},geometry:{type:'LineString',coordinates:points.map(([x,y])=>xy(x,y))}});
const geo=(features)=>({type:'FeatureCollection',metadata:{source:'OpenStreetMap',coordinateSystem:'EPSG:4326',coordinateOrder:'longitude,latitude',visualToGeographicTransform:null},features});
const horizontal=(id='a',y=0,ids=[1,2,3],props)=>way(id,[[-100,y],[0,y],[300,y]],ids,props);
const make=(data=geo([horizontal()]),options)=>{
 assert.equal(typeof api.createRouteMatcher,'function','the pure temporal matcher must be exported');
 return api.createRouteMatcher(data,options);
};
const base=1000000;
const fix=(x,y,t,extra={})=>({longitude:xy(x,y)[0],latitude:xy(x,y)[1],accuracy:4,timestamp:base+t*1000,heading:null,speed:null,...extra});
const at=(m,x,y,t,extra)=>m.update(fix(x,y,t,extra),base+t*1000);
const acquire=(m,y=0)=>[-70,-60,-50].map((x,i)=>at(m,x,y,i)).at(-1);
const junctionNetwork=()=>geo([horizontal(),way('b',[[0,0],[0,200]],[2,4])]);

test('several coherent positions acquire a route and project in geographic metres',()=>{
 const m=make();
 assert.equal(at(m,-80,3,0).status,'searching');
 assert.equal(at(m,-70,3,1).snapped,null);
 const r=at(m,-60,3,2);
 assert.equal(r.status,'probable');assert.equal(r.route.id,'a');assert.equal(r.route.source,'OpenStreetMap');
 assert.ok(Math.abs(r.candidates[0].distanceM-3)<.02);
 assert.ok(Math.abs(r.snapped.latitude)<1e-10);assert.equal(r.snapped.routeId,'a');
 assert.equal(r.raw.latitude,fix(-60,3,2).latitude);assert.equal(r.continuity,'held');
});

test('a burst of correlated positions cannot immediately acquire a trail',()=>{
 const m=make();for(const t of [0,.005,.01])assert.equal(at(m,-70,0,t).status,'searching');
 assert.equal(at(m,-60,0,1).status,'searching');assert.equal(at(m,-50,0,2).status,'probable');
});

test('a burst at an OSM junction cannot immediately change the held trail',()=>{
 const m=make(junctionNetwork());acquire(m);at(m,-5,0,3);
 for(const t of [4,4.005,4.01])assert.notEqual(at(m,0,20,t).route?.id,'b');
 assert.notEqual(at(m,0,28,5).route?.id,'b');
 const r=at(m,0,36,6);assert.equal(r.route.id,'b');assert.equal(r.continuity,'junction-transition');
});

test('a burst away from the held trail cannot immediately escape its hypothesis',()=>{
 const m=make(geo([horizontal(),horizontal('b',55,[4,5,6])]));acquire(m);
 for(const t of [3,3.005,3.01])assert.notEqual(at(m,-40,55,t).route?.id,'b');
 assert.notEqual(at(m,-30,55,4).route?.id,'b');
 assert.equal(at(m,-20,55,5).route.id,'b');
});

test('an initial parallel tie stays ambiguous without a prior or a snapped point',()=>{
 const m=make(geo([horizontal(),horizontal('b',14,[4,5,6])]));
 for(let i=0;i<6;i++){
  const r=at(m,-70+i*10,7,i,{accuracy:10});
  assert.equal(r.status,'ambiguous');assert.equal(r.route,null);assert.equal(r.snapped,null);assert.equal(r.candidates.length,2);
 }
});

test('compatible jitter closer to a parallel route preserves the acquired hypothesis',()=>{
 const m=make(geo([horizontal(),horizontal('b',14,[4,5,6])]));
 assert.equal(acquire(m).route.id,'a');
 for(let i=3;i<10;i++){
  const r=at(m,-50+i*8,12,i,{accuracy:8});
  assert.equal(r.candidates[0].routeId,'b');assert.equal(r.route.id,'a');assert.equal(r.status,'probable');assert.equal(r.continuity,'held');
 }
});

test('a shared OSM junction requires several departing positions before transitioning',()=>{
 const m=make(junctionNetwork());acquire(m);
 const entry=at(m,-5,0,3);assert.equal(entry.junction.nodeId,2);assert.deepEqual(entry.junction.routeIds,['a','b']);
 const first=at(m,0,12,4);assert.equal(first.route.id,'a');assert.equal(first.continuity,'held');
 assert.notEqual(at(m,0,24,5).route?.id,'b');
 const departed=at(m,0,36,6);
 assert.equal(departed.status,'probable');assert.equal(departed.route.id,'b');assert.equal(departed.continuity,'junction-transition');
});

test('one departing sample at a junction does not change the trail',()=>{
 const m=make(junctionNetwork());acquire(m);at(m,-5,0,3);at(m,0,12,4);
 const r=at(m,12,0,5);assert.equal(r.route.id,'a');assert.equal(r.continuity,'held');
});

test('three reliable incompatible positions escape the old hypothesis without inventing a junction',()=>{
 const m=make(geo([horizontal(),horizontal('b',55,[4,5,6])]));acquire(m);
 const one=at(m,-40,55,3);assert.equal(one.snapped,null);assert.notEqual(one.route?.id,'b');
 assert.notEqual(at(m,-30,55,4).route?.id,'b');
 const r=at(m,-20,55,5);assert.equal(r.status,'probable');assert.equal(r.route.id,'b');assert.equal(r.junction,null);assert.equal(r.continuity,'reacquiring');
});

test('a graphical crossing with separate node IDs is never a junction transition',()=>{
 const m=make(geo([horizontal(),way('b',[[0,-100],[0,0],[0,200]],[4,5,6])]));acquire(m);
 assert.equal(at(m,-5,0,3).junction,null);
 for(let i=4;i<=6;i++){
  const r=at(m,0,25+(i-4)*12,i);
  assert.equal(r.junction,null);assert.notEqual(r.continuity,'junction-transition');
 }
 assert.equal(m.snapshot(base+6000).route.id,'b');
});

test('the same target ID on disconnected features cannot switch through the grouping label',()=>{
 const a=horizontal('part-a',0,[1,2,3],{targetId:'same',name:'Same trail'});
 const b=horizontal('part-b',14,[4,5,6],{targetId:'same',name:'Same trail'});
 const m=make(geo([a,b]));assert.equal(acquire(m).route.featureId,'part-a');
 for(let i=3;i<8;i++)assert.equal(at(m,-40+i*8,12,i,{accuracy:8}).route.featureId,'part-a');
 const r=at(m,0,50,8);assert.equal(r.snapped,null);assert.equal(r.junction,null);
});

test('connected features of one target continue through their actual shared OSM node',()=>{
 const a=way('part-a',[[-100,0],[0,0]],[1,2],{targetId:'same'});
 const b=way('part-b',[[0,0],[100,0]],[2,3],{targetId:'same'});
 const m=make(geo([a,b]));acquire(m);
 const r=at(m,15,0,4);assert.equal(r.status,'probable');assert.equal(r.route.id,'same');assert.equal(r.route.featureId,'part-b');
});

test('unnamed OSM context retains its own feature identity and attribution',()=>{
 const m=make(geo([horizontal('osm-way-42',0,[1,2,3],{targetId:null,name:null})]));
 const r=acquire(m);assert.equal(r.route.id,'osm-way-42');assert.equal(r.route.targetId,null);assert.equal(r.route.name,'Camino OSM sin nombre');assert.equal(r.route.source,'OpenStreetMap');
});

test('snapshot ages the last fix, clears the snap, and forces acquisition after an outage',()=>{
 const m=make();acquire(m);
 const old=m.snapshot(base+13001);assert.equal(old.status,'stale');assert.equal(old.snapped,null);
 assert.equal(at(m,-40,0,14).status,'searching');assert.equal(at(m,-30,0,15).status,'searching');
 const r=at(m,-20,0,16);assert.equal(r.status,'probable');assert.equal(r.continuity,'reacquiring');
});

test('an update after a long gap also discards the old continuity even without a snapshot',()=>{
 const m=make();acquire(m);
 const r=at(m,200,0,20);assert.equal(r.status,'searching');assert.equal(r.snapped,null);assert.equal(r.continuity,'reacquiring');
});

test('an already old fix cannot establish or refresh a route',()=>{
 const m=make();acquire(m);
 const r=m.update(fix(-40,0,3),base+14001);assert.equal(r.status,'stale');assert.equal(r.snapped,null);
 assert.equal(at(m,-30,0,15).status,'searching');
});

test('out-of-order and repeated fixes do not contaminate the accepted temporal memory',()=>{
 const m=make();acquire(m);
 for(const t of [1,2]){
  const r=m.update(fix(250,100,t),base+3000);assert.equal(r.status,'invalid');assert.equal(r.snapped,null);
  assert.equal(m.snapshot(base+3000).raw.timestamp,base+2000);
 }
 assert.equal(at(m,-40,0,4).route.id,'a');
});

test('future timestamps cannot acquire or poison subsequent chronological fixes',()=>{
 const m=make();
 assert.equal(m.update(fix(0,0,100),base).status,'invalid');
 assert.equal(acquire(m).status,'probable');
});

test('bad accuracy removes the snap and requires fresh coherent observations',()=>{
 const m=make();acquire(m);
 const bad=at(m,-40,0,3,{accuracy:100});assert.equal(bad.snapped,null);assert.notEqual(bad.status,'probable');
 assert.equal(at(m,-30,0,4).status,'searching');assert.equal(at(m,-20,0,5).status,'searching');assert.equal(at(m,-10,0,6).status,'probable');
});

test('weak observations cannot accumulate reliable evidence for an escape',()=>{
 const m=make(geo([horizontal(),horizontal('b',90,[4,5,6])]));acquire(m);
 for(let t=3;t<7;t++)assert.notEqual(at(m,-40+t*5,90,t,{accuracy:40}).route?.id,'b');
 assert.equal(at(m,10,0,7).route.id,'a');
});

test('a teleport is rejected and a remote route must be acquired anew',()=>{
 const m=make(geo([horizontal(),way('b',[[1000,0],[1500,0]],[4,5]) ]));acquire(m);
 const jump=at(m,1100,0,3);assert.equal(jump.snapped,null);assert.match(jump.reason,/teleport/);assert.notEqual(jump.status,'probable');
 assert.equal(at(m,1110,0,4).status,'searching');assert.equal(at(m,1120,0,5).status,'searching');
 const r=at(m,1130,0,6);assert.equal(r.route.id,'b');assert.equal(r.continuity,'reacquiring');
});

test('heading only helps acquisition when speed and accuracy support it, without assuming way direction',()=>{
 const crossing=geo([horizontal(),way('b',[[0,-100],[0,200]],[4,5])]);
 const slow=make(crossing);for(let i=0;i<4;i++)assert.equal(at(slow,0,0,i,{heading:90,speed:.2}).status,'ambiguous');
 const moving=make(crossing);for(let i=0;i<3;i++)at(moving,0,0,i,{heading:270,speed:3});
 assert.equal(moving.snapshot(base+2000).route.id,'a');
 const poor=make(crossing);for(let i=0;i<4;i++)assert.equal(at(poor,0,0,i,{heading:90,speed:3,accuracy:30}).status,'ambiguous');
});

test('heading cannot discard the physically nearest edge when a target is split into connected ways',()=>{
 const points=[[-100,0],[100,0],[13,100],[13,-100]],props={targetId:'same',name:'Same trail'};
 const split=geo([way('part-a',points.slice(0,2),[1,2],props),way('part-b',points.slice(1),[2,3,4],props)]);
 const unsplit=geo([way('whole',points,[1,2,3,4],props)]);
 for(const data of [split,unsplit,geo([...split.features].reverse())]){
  const m=make(data);
  for(let t=0;t<3;t++){
   const r=at(m,0,0,t,{heading:0,speed:3});
   assert.ok(r.candidates[0].distanceM<.001,'the edge under the fix must remain the component projection');
   assert.equal(r.status,t===2?'probable':'searching');
   if(t===2){assert.equal(r.route.id,'same');assert.ok(Math.abs(r.snapped.longitude)<1e-10);assert.ok(Math.abs(r.snapped.latitude)<1e-10);}
  }
 }
});

test('equally near edges use heading consistently across split and unsplit geometry',()=>{
 const points=[[-100,0],[100,0],[0,100],[0,-100]],props={targetId:'same'};
 const split=geo([way('part-a',points.slice(0,2),[1,2],props),way('part-b',points.slice(1),[2,3,4],props),horizontal('other',0,[5,6,7])]);
 const unsplit=geo([way('whole',points,[1,2,3,4],props),horizontal('other',0,[5,6,7])]);
 for(const data of [split,unsplit]){
  const m=make(data);for(let t=0;t<3;t++)at(m,0,0,t,{heading:0,speed:3});
  const r=m.snapshot(base+2000);assert.equal(r.status,'probable');assert.equal(r.route.id,'same');assert.ok(r.candidates.find(c=>c.routeId==='same').distanceM<.001);
 }
});

test('a heading change cannot invalidate a held component while its nearest edge remains under the fix',()=>{
 const props={targetId:'same'},m=make(geo([way('part-a',[[-100,0],[100,0]],[1,2],props),way('part-b',[[100,0],[17,100],[17,-100]],[2,3,4],props)]));
 for(let t=0;t<3;t++)at(m,0,0,t,{heading:90,speed:3});
 for(let t=3;t<7;t++){
  const r=at(m,0,0,t,{heading:0,speed:3});assert.equal(r.status,'probable');assert.equal(r.route.featureId,'part-a');assert.equal(r.continuity,'held');assert.ok(r.candidates[0].distanceM<.001);
 }
});

test('invalid coordinates do not replace the accepted raw position',()=>{
 const m=make();acquire(m);
 for(const extra of [{latitude:91},{longitude:181},{accuracy:NaN},{accuracy:0},{timestamp:NaN}]){
  const r=m.update(fix(-40,0,3,extra),base+3000);assert.equal(r.status,'invalid');assert.equal(r.snapped,null);
 }
 assert.equal(m.snapshot(base+3000).raw.timestamp,base+2000);
});

test('reset clears the route, raw position, temporal history and acquisition count',()=>{
 const m=make();acquire(m);m.reset();
 const r=m.snapshot(base+3000);assert.equal(r.status,'searching');assert.equal(r.raw,null);assert.equal(r.route,null);assert.equal(r.continuity,'acquiring');
 assert.equal(at(m,-80,0,0).status,'searching');
});

test('outside the available OSM geometry the matcher reports no snapped route',()=>{
 const r=at(make(),0,200,0);assert.equal(r.status,'off-route');assert.equal(r.route,null);assert.equal(r.snapped,null);
});

test('input and returned objects cannot mutate the internal temporal state',()=>{
 const data=geo([horizontal()]),m=make(data);const input=fix(-80,0,0);m.update(input,base);input.longitude=100;
 at(m,-70,0,1);const r=at(m,-60,0,2);r.route.id='altered';r.raw.latitude=80;r.candidates[0].projected.latitude=70;
 data.features[0].geometry.coordinates[0][0]=100;
 const next=at(m,-50,0,3);assert.equal(next.route.id,'a');assert.equal(next.raw.latitude,0);assert.ok(Math.abs(next.snapped.latitude)<1e-10);
});

test('image pixels, approximate registration and swapped coordinate metadata are refused',()=>{
 for(const change of [g=>g.metadata.source='Cartel',g=>g.metadata.coordinateSystem='image-pixels',g=>g.metadata.coordinateOrder='latitude,longitude',g=>g.metadata.visualToGeographicTransform={experimental:true},g=>g.features[0].geometry.coordinates[0]=[400,500]]){
  const bad=geo([horizontal()]);change(bad);assert.throws(()=>make(bad),/OSM|OpenStreetMap|geogr|coorden|registr/i);
 }
});

test('inconsistent shared-node coordinates and missing node identities are refused',()=>{
 const inconsistent=junctionNetwork();inconsistent.features[1].geometry.coordinates[0]=xy(1,0);
 assert.throws(()=>make(inconsistent),/nodo|node/i);
 for(const value of [[1],null,[1,NaN,3]]){
  const bad=geo([horizontal()]);bad.features[0].properties.nodeIds=value;assert.throws(()=>make(bad),/nodo|node/i);
 }
});

test('the actual 79-way OSM snapshot can be matched without changing its coordinates',async()=>{
 const source=JSON.parse(await readFile(new URL('../sources/el-durazno-osm.json',import.meta.url)));
 const catalog=JSON.parse(await readFile(new URL('../data/el-durazno/geographic-catalog.json',import.meta.url)));
 const data=fromOsmSnapshot(source,catalog),original=structuredClone(data),m=make(data);
 const way=data.features.find(f=>f.properties.targetId==='lomo-vetado');
 let result;
 for(let i=60;i<65;i++){
  const [longitude,latitude]=way.geometry.coordinates[i];
  result=m.update({longitude,latitude,accuracy:3,timestamp:base+(i-60)*2000,heading:null,speed:null},base+(i-60)*2000);
 }
 assert.equal(result.status,'probable');assert.equal(result.route.id,'lomo-vetado');assert.equal(result.route.source,'OpenStreetMap');assert.deepEqual(data,original);
});
