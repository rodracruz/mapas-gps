import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
const moduleUrl=new URL('../geographic/label-layout.mjs',import.meta.url);
async function implementation(){assert.ok(existsSync(moduleUrl),'route label placement must account for actual reserved rectangles');return(await import(moduleUrl)).placeRouteLabels;}
const overlap=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
test('labels pack into free mobile map space without a collision fallback',async()=>{
 const place=await implementation(),obstacles=[{x:0,y:0,width:390,height:110},{x:0,y:410,width:390,height:296},{x:0,y:280,width:315,height:115},{x:330,y:120,width:55,height:100}],labels=Array.from({length:8},(_,i)=>({id:String(i),x:170+i,y:110+i*14,width:80,height:29,priority:0}));
 const output=place({width:390,height:706,labels,obstacles});assert.equal(output.size,8);
 const placed=[...output.values()];for(const [i,p]of placed.entries()){assert.ok(p);assert.ok(p.x>=0&&p.y>=0&&p.x+p.width<=390&&p.y+p.height<=706);assert.ok(obstacles.every(o=>!overlap(p,o)));assert.ok(placed.slice(i+1).every(o=>!overlap(p,o)));}
});
test('selected labels take priority and impossible labels are hidden rather than covering a control',async()=>{
 const place=await implementation(),result=place({width:120,height:80,obstacles:[{x:0,y:45,width:120,height:35}],labels:[{id:'secondary',x:60,y:20,width:90,height:30,priority:2},{id:'selected',x:60,y:20,width:90,height:30,priority:0}]});
 assert.ok(result.get('selected'));assert.equal(result.get('secondary'),null);
 const blocked=place({width:100,height:80,obstacles:[{x:0,y:0,width:100,height:80}],labels:[{id:'a',x:50,y:40,width:20,height:20,priority:0}]});assert.equal(blocked.get('a'),null);
});
test('a selected label uses a narrow internal corridor between measured controls',async()=>{
 const place=await implementation(),obstacles=[{x:0,y:0,width:390,height:123.78125},{x:0,y:166,width:390,height:540}],labels=[{id:'selected',x:203,y:150,width:65,height:29,priority:-1}];
 const p=place({width:390,height:706,obstacles,labels}).get('selected');assert.ok(p,'a10px grid must not overlook the safe strip between banner and GPS');assert.ok(p.y>=126.28125&&p.y<=134.5);assert.ok(obstacles.every(o=>!overlap(p,o)));
});
