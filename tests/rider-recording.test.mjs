import test from 'node:test';
import assert from 'node:assert/strict';
const api=await import('../rider/recording.mjs').catch(()=>({}));
const epoch=1000000, metres=6371008.8*Math.PI/180;
const fix=(x,t,extra={})=>({longitude:x/metres,latitude:0,accuracy:4,timestamp:epoch+t,...extra});
const setup=()=>{let time=epoch;assert.equal(typeof api.createRideRecorder,'function');const r=api.createRideRecorder({now:()=>time});r.start({id:'r',parkId:'p',bikeId:null},time);return {r,at:(x,t,extra)=>{time=epoch+t;return r.ingest(fix(x,t,extra));},clock:t=>time=epoch+t};};
test('records haversine distance and active duration with detached snapshots',()=>{
 const {r,at}=setup();assert.equal(at(0,0),true);assert.equal(at(10,1000),true);
 const s=r.snapshot(epoch+2000);assert.ok(Math.abs(s.distanceM-10)<.001);assert.equal(s.durationMs,2000);assert.ok(Math.abs(s.maxSpeedMps-10)<.001);
 s.segments[0][0].latitude=50;assert.equal(r.snapshot(epoch+2000).segments[0][0].latitude,0);
 const done=r.finish(epoch+3000);assert.equal(done.status,'finished');assert.equal(done.endedAt,epoch+3000);assert.equal(done.durationMs,3000);
 assert.equal(r.snapshot(epoch+10000).durationMs,3000);assert.equal(at(20,4000),false);
});
test('pause and resume exclude paused time and never bridge the route',()=>{
 const {r,at}=setup();at(0,0);at(10,1000);r.pause(epoch+2000);assert.equal(at(100,3000),false);
 assert.equal(r.snapshot(epoch+5000).durationMs,2000);r.resume(epoch+6000);at(1000,6000);at(1010,7000);
 const s=r.finish(epoch+8000);assert.equal(s.durationMs,4000);assert.equal(s.segments.length,2);assert.ok(Math.abs(s.distanceM-20)<.001);
});
test('a gap over 30 seconds starts another segment without a speed or distance bridge',()=>{
 const {r,at}=setup();at(0,0);at(10,1000);at(10000,32000);at(10010,33000);
 const s=r.snapshot(epoch+33000);assert.equal(s.segments.length,2);assert.ok(Math.abs(s.distanceM-20)<.001);
});
test('discarded inaccurate, stale, future, unordered and impossible fixes break continuity',()=>{
 for(const bad of [fix(20,2000,{accuracy:46}),fix(20,-9001),fix(20,7001),fix(20,1000),fix(1000,2000),fix(20,2000,{latitude:91}),fix(20,2000,{accuracy:NaN})]){
  const {r,at,clock}=setup();at(0,0);at(10,1000);clock(2000);assert.equal(r.ingest(bad),false);
  at(10000,3000);at(10010,4000);const s=r.snapshot(epoch+4000);assert.equal(s.segments.length,2);assert.ok(Math.abs(s.distanceM-20)<.001);
 }
});
test('jitter does not accumulate distance while slow coherent progress eventually does',()=>{
 const {r,at}=setup();at(0,0,{accuracy:10});at(1,1000,{accuracy:10});at(-1,2000,{accuracy:10});
 assert.equal(r.snapshot(epoch+2000).distanceM,0);at(6,3000,{accuracy:10});assert.ok(Math.abs(r.snapshot(epoch+3000).distanceM-6)<.001);
});
test('validates commands and rejects backwards time without changing the ride',()=>{
 assert.equal(typeof api.createRideRecorder,'function');const r=api.createRideRecorder();assert.throws(()=>r.pause(epoch));assert.throws(()=>r.start({id:'!',parkId:'p'},epoch));
 r.start({id:'r',parkId:'p'},epoch);assert.throws(()=>r.start({id:'r2',parkId:'p'},epoch));assert.throws(()=>r.pause(epoch-1));assert.throws(()=>r.finish(epoch,'unknown'));
 assert.equal(r.snapshot(epoch).status,'recording');r.finish(epoch,'interrupted');assert.equal(r.snapshot(epoch).status,'interrupted');
});
test('quality limits are inclusive and exactly 30 seconds does not split a segment',()=>{
 const {r,at,clock}=setup();at(0,0,{accuracy:45});at(30,30000,{accuracy:45});assert.equal(r.snapshot(epoch+30000).segments.length,1);
 clock(40001);assert.equal(r.ingest(fix(30,30001)),true);clock(40001);assert.equal(r.ingest(fix(50,45001)),true);
 assert.equal(r.snapshot(epoch+45000).segments.length,1);
});
test('haversine handles a dateline crossing without a globe-spanning jump',()=>{
 const {r,at}=setup();assert.equal(at(0,0,{longitude:179.99999}),true);assert.equal(at(0,1000,{longitude:-179.99997}),true);
 const s=r.snapshot(epoch+1000);assert.ok(s.distanceM>4 && s.distanceM<5);
});
