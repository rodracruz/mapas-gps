import test from 'node:test';
import assert from 'node:assert/strict';
const {gpsViewport}=await import('../geographic/gps-viewport.mjs').catch(()=>({}));

test('GPS uses the largest clear rectangle, including corner controls',()=>{
 assert.equal(typeof gpsViewport,'function');
 for(const [width,height,obstacles]of [
  [390,844,[{x:0,y:0,width:390,height:223},{x:12,y:225,width:150,height:60},{x:12,y:530,width:366,height:302}]],
  [844,390,[{x:0,y:0,width:844,height:175},{x:530,y:175,width:302,height:203},{x:12,y:184,width:150,height:60}]],
  [320,568,[{x:0,y:0,width:320,height:220},{x:12,y:225,width:150,height:60},{x:12,y:330,width:296,height:226}]]
 ]){
  const r=gpsViewport({width,height},obstacles);
  assert.ok(r.width>0&&r.height>0);assert.ok(r.x>=12&&r.y>=12&&r.x+r.width<=width-12&&r.y+r.height<=height-12);
  for(const o of obstacles)assert.ok(r.x+r.width<=o.x-12||r.x>=o.x+o.width+12||r.y+r.height<=o.y-12||r.y>=o.y+o.height+12,JSON.stringify({r,o}));
 }
});
test('GPS viewport is deterministic and ignores hidden/invalid/outside controls',()=>{
 assert.equal(typeof gpsViewport,'function');
 const size={width:390,height:844},expected={x:12,y:12,width:366,height:820};
 assert.deepEqual(gpsViewport(size,[]),expected);
 assert.deepEqual(gpsViewport(size,[{x:0,y:0,width:0,height:30},{x:NaN,y:0,width:20,height:20},{x:500,y:0,width:20,height:20}]),expected);
 assert.equal(gpsViewport({width:0,height:0},[]),null);
 assert.equal(gpsViewport({width:100,height:100},[{x:0,y:0,width:100,height:100}]),null);
});
