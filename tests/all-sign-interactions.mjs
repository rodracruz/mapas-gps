import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const base=process.env.GEOGRAPHIC_BASE_URL||'http://127.0.0.1:4175';
const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const failures=[];
const check=async(name,fn)=>{try{await fn();console.log('PASS',name);}catch(e){failures.push(name+': '+e.message);console.log('FAIL',name,e.message);}};
try{
 const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),p=await ctx.newPage();
 await p.goto(base+'/mapa-geografico.html#parque=el-durazno');await p.waitForSelector('#map-card[data-ready="true"]');await p.locator('#open-sign').tap();await p.waitForSelector('#sign-dialog[data-ready="true"]');await p.locator('[data-sign-mode="vectors"]').tap();
 await check('touching a visual route selects the actual trail',async()=>{const point=await p.locator('#sign-paths polyline[data-trail="starwars"]').first().evaluate(n=>{const q=n.getPointAtLength(n.getTotalLength()*.5).matrixTransform(n.getScreenCTM());return {x:q.x,y:q.y};});await p.touchscreen.tap(point.x,point.y);assert.match(await p.locator('#sign-selection').innerText(),/Starwars/i);});
 await check('visual pan and pinch preserve shared raster/vector coordinate system',async()=>{const cdp=await ctx.newCDPSession(p),box=await p.locator('#sign-stage').boundingBox(),x=box.x+box.width/2,y=box.y+box.height/2;const before=await p.locator('#sign-svg').getAttribute('viewBox');await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x-30,y,id:1},{x:x+30,y,id:2}]});for(let i=1;i<=5;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-30-i*6,y,id:1},{x:x+30+i*6,y,id:2}]});await p.waitForTimeout(30);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.notEqual(await p.locator('#sign-svg').getAttribute('viewBox'),before);const matrices=await p.evaluate(()=>{const a=document.querySelector('#sign-raster').getScreenCTM(),b=document.querySelector('.sign-route').getScreenCTM();return [[a.a,a.b,a.c,a.d,a.e,a.f],[b.a,b.b,b.c,b.d,b.e,b.f]];});assert.deepEqual(matrices[0],matrices[1]);});
 await p.locator('#close-sign').tap();await p.locator('#open-map').tap();await p.locator('[data-map-target="mampato"]').tap();
 await check('a named trail with multiple source ways highlights every independent fragment',async()=>{assert.equal(await p.locator('.selected-route').count(),4);assert.match(await p.locator('#sheet-title').innerText(),/Mampato/);});
 await ctx.close();
}finally{await b.close();}assert.deepEqual(failures,[]);console.log('3 image and multi-fragment interaction checks passed');
