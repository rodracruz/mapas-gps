import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRiderSession} from '../rider/session.mjs';
import {buildGpx} from '../rider/exports.mjs';
import {createRouteMatcher} from '../navigation/matcher.mjs';
import {fromOsmSnapshot} from '../geographic/data.mjs';
const catalog=JSON.parse(await readFile(new URL('../data/el-durazno/geographic-catalog.json',import.meta.url)));
const network=fromOsmSnapshot(JSON.parse(await readFile(new URL('../'+catalog.sourceSnapshot,import.meta.url))),catalog);
async function exercise(fn,data=network){
 const matcher=createRouteMatcher(data);
 const originalNow=Date.now,originalWindow=globalThis.window;let clock=2000000,listener,current={mode:'gps',result:{}};
 Date.now=()=>clock;globalThis.window={addEventListener(){},removeEventListener(){}};
 const errors=[],session=createRiderSession({parkId:'el-durazno',save:async()=>{},onChange(){},onError:e=>errors.push(e)});
 const emit=(longitude,extra={})=>{clock+=1000;current={mode:'gps',result:matcher.update({latitude:-33.305,longitude,accuracy:5,timestamp:clock,...extra},clock)};listener(current);return current.result;};
 session.connect({snapshot:()=>current,subscribe:fn=>{listener=fn;return()=>{};}});
 try{await session.start();await fn({session,emit,tick:()=>{current={...current,result:matcher.snapshot(clock)};listener(current);},set:next=>{current=next;listener(next);},advance:ms=>clock+=ms});assert.deepEqual(errors,[]);}finally{await session.finish();session.dispose();Date.now=originalNow;globalThis.window=originalWindow;}
}
test('session excludes fresh matcher teleport raw and starts the next accepted reading in a separate segment',()=>exercise(async({session,emit,tick})=>{
 emit(-70.498);assert.equal(emit(-70.488).reason,'teleport-reacquiring');tick();
 assert.deepEqual(session.snapshot().segments.map(s=>s.map(p=>p.longitude)),[[-70.498]],'a rejected fresh raw point must never enter the saved trace');
 assert.doesNotMatch(buildGpx({name:'Synthetic',segments:session.snapshot().segments}),/lon="-70.488"/);
 emit(-70.48801);assert.deepEqual(session.snapshot().segments.map(s=>s.map(p=>p.longitude)),[[-70.498],[-70.48801]]);assert.equal(session.snapshot().distanceM,0);
}));
test('session excludes retained raw rejection and ticks while preserving valid off-network recording, pause timing and demo exclusion',()=>exercise(async({session,emit,tick,advance,set})=>{
 emit(-70.498);assert.equal(emit(-70.498,{accuracy:0}).reason,'invalid-fix');tick();emit(-70.49799);
 assert.deepEqual(session.snapshot().segments.map(s=>s.length),[1,1]);
 await session.pause();const duration=session.snapshot().durationMs;advance(10000);tick();assert.equal(session.snapshot().durationMs,duration);await session.resume();
 advance(40000);assert.equal(emit(-70.6).reason,'outside-network');assert.deepEqual(session.snapshot().segments.map(s=>s.length),[1,1,1]);
 await session.finish();set({mode:'demo',result:{}});await session.start();assert.equal(session.snapshot(),null);
}));

test('session records valid ambiguous raw positions without requiring a probable matched route',()=>exercise(async({session,emit})=>{
 assert.equal(emit(-70.498).status,'ambiguous');assert.equal(emit(-70.49799).status,'ambiguous');assert.equal(session.snapshot().segments[0].length,2);
},{type:'FeatureCollection',metadata:{source:'OpenStreetMap',coordinateSystem:'EPSG:4326',coordinateOrder:'longitude,latitude',visualToGeographicTransform:null},features:['a','b'].map(id=>({type:'Feature',id,properties:{targetId:id,nodeIds:id==='a'?[1,2]:[3,4]},geometry:{type:'LineString',coordinates:[[-70.499,-33.305],[-70.497,-33.305]]}}))}));
