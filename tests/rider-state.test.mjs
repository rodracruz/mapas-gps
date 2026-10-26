import test from 'node:test';
import assert from 'node:assert/strict';
const api = await import('../rider/store.mjs').catch(() => ({}));
const state = () => { assert.equal(typeof api.defaultRiderState, 'function'); return api.defaultRiderState(); };
const validate = value => { assert.equal(typeof api.validateRiderState, 'function'); return api.validateRiderState(value); };
const bike = () => ({id:'bike-1',name:'My bike'});
const ride = () => ({id:'ride-1',parkId:'park-1',startedAt:1000,endedAt:null,durationMs:0,distanceM:0,status:'recording',segments:[]});
test('defaults are independent complete version-one states', () => {
 const a=state(), b=state(); a.profile.name='Changed'; a.favorites.push({parkId:'p',trailId:'t'});
 assert.deepEqual(b,{version:1,profile:{name:''},favorites:[],bikes:[],meetups:[],activities:[],downloads:[]});
 assert.deepEqual(validate(b),b);
});
test('validation normalizes omitted optional fields without mutating input',()=>{
 const s=state();s.bikes.push(bike());s.activities.push(ride());
 s.meetups.push({id:'m',title:'Ride',parkId:'p',startAt:'2026-10-26T10:00:00-03:00'});
 const before=structuredClone(s),v=validate(s);assert.deepEqual(s,before);
 assert.deepEqual(v.bikes[0],{id:'bike-1',name:'My bike',frontPsi:null,rearPsi:null,forkModel:'',notes:'',serviceDate:''});
 assert.equal(v.activities[0].bikeId,null);assert.equal(v.activities[0].maxSpeedMps,null);
 assert.equal(v.meetups[0].trailId,null);assert.equal(v.meetups[0].status,'planned');
 v.activities[0].segments.push([]);assert.equal(s.activities[0].segments.length,0);
});
test('rejects unsafe ids, duplicate records, excessive text, impossible dates and invalid schema',()=>{
 for(const change of [s=>s.version=2,s=>s.profile.name='x'.repeat(81),s=>s.bikes=[{...bike(),id:'<script>'}],s=>s.bikes=[bike(),bike()],s=>s.bikes=[{...bike(),frontPsi:-1}],s=>s.bikes=[{...bike(),serviceDate:'2026-02-30'}],s=>s.favorites=[{parkId:'p',trailId:'t'},{parkId:'p',trailId:'t'}],s=>s.meetups=[{id:'m',title:'Ride',parkId:'p',startAt:'2026-02-30T10:00:00Z'}],s=>s.meetups=[{id:'m',title:'Ride',parkId:'p',startAt:'2026-10-26T10:00:00'}]]){
  const s=state();change(s);assert.throws(()=>validate(s),Error);
 }
});
test('rejects invalid activity values and keeps every point of long accepted traces',()=>{
 const s=state();s.activities=[ride()];const fix={longitude:-70,latitude:-33,accuracy:4,timestamp:1000,speed:null};
 for(const bad of [{longitude:181},{latitude:NaN},{accuracy:-1},{timestamp:Infinity},{speed:-1}]){
  s.activities[0].segments=[[{...fix,...bad}]];assert.throws(()=>validate(s),Error);
 }
 s.activities[0].segments=[Array.from({length:20001},(_,i)=>({...fix,timestamp:1000+i}))];
 assert.equal(validate(s).activities[0].segments[0].length,20001);
 s.activities[0].distanceM=NaN;assert.throws(()=>validate(s),Error);
});
test('missing IndexedDB and the protected legacy database fail explicitly',async()=>{
 assert.equal(typeof api.openRiderStore,'function');
 await assert.rejects(api.openRiderStore({indexedDB:null}),/IndexedDB/i);
 await assert.rejects(api.openRiderStore({indexedDB:{},name:'mapas-gps-v1'}),/database|legacy|protected/i);
});
test('rejects malformed downloads and nonmonotonic or negative activity records',()=>{
 for(const change of [s=>s.downloads=[{id:'d',parkId:'p',trailId:'t',createdAt:-1,name:'n',gpx:'<gpx/>'}],s=>s.activities=[{...ride(),durationMs:-1}],s=>s.activities=[{...ride(),maxSpeedMps:-1}],s=>s.activities=[{...ride(),endedAt:999}],s=>s.activities=[{...ride(),segments:[[{longitude:0,latitude:0,accuracy:1,timestamp:1001},{longitude:0,latitude:0,accuracy:1,timestamp:1001}]]}],s=>s.favorites=[{parkId:'p',trailId:'../unsafe'}]]){
  const s=state();change(s);assert.throws(()=>validate(s),Error);
 }
});
