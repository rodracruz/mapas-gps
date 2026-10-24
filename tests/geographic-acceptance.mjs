import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
const base=process.env.GEOGRAPHIC_BASE_URL||'http://127.0.0.1:4174';
const out=new URL('../test-results/geographic/',import.meta.url);await mkdir(out,{recursive:true});
const executablePath='/usr/bin/chromium';
const browser=await chromium.launch({executablePath,args:['--no-sandbox'],proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined});
const checks=[];const check=async(name,fn)=>{await fn();checks.push(name);console.log('PASS',name);};
const mapUrl=base+'/mapa-geografico.html#parque=el-durazno&mapa=1&fuente=osm';
async function localAssets(page){await page.route(base+'/**',async route=>{const r=await fetch(route.request().url());await route.fulfill({status:r.status,headers:Object.fromEntries(r.headers),body:Buffer.from(await r.arrayBuffer())});});}
const view=p=>p.locator('#geo-map').getAttribute('data-view');
try{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await context.newPage();await localAssets(page);
 await page.goto(mapUrl);await page.waitForSelector('#map-card[data-ready="true"]');
 await check('real OSM background and thirteen independent native geographic ways load',async()=>{await page.waitForFunction(()=>document.querySelectorAll('.leaflet-tile-loaded').length>=8,{},{timeout:30000});assert.equal(await page.locator('.trail-line').count(),13);assert.equal(await page.locator('iframe').count(),0);await page.screenshot({path:new URL('map-loaded-mobile.png',out).pathname});});
 await check('touching the actual geographic line opens its bottom information',async()=>{
  const point=await page.locator('.route-hit[stroke="#247d87"]').evaluate(n=>{for(let i=1;i<200;i++){const p=n.getPointAtLength(n.getTotalLength()*i/200).matrixTransform(n.getScreenCTM());if(p.x>65&&p.x<innerWidth-35&&p.y>225&&p.y<innerHeight-100&&document.elementFromPoint(p.x,p.y)===n)return {x:p.x,y:p.y};}return null;});assert.ok(point,'a visible point on the real Lomo geometry');await page.touchscreen.tap(point.x,point.y);assert.equal(await page.locator('#sheet-title').innerText(),'Lomo Vetado');assert.equal(await page.locator('#route-sheet').isVisible(),true);
 });
 await check('real two-finger pinch and one-finger pan move the same map',async()=>{
  await page.locator('#close-sheet').tap();const cdp=await context.newCDPSession(page);const before=await view(page);const previousZoom=Number(before.split(',')[2]);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:145,y:380,id:1},{x:235,y:380,id:2}]});
  for(let i=1;i<=6;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:145-i*8,y:380,id:1},{x:235+i*8,y:380,id:2}]});await page.waitForTimeout(35);}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForFunction(z=>Number(document.querySelector('#geo-map').dataset.view.split(',')[2])>z,previousZoom);
  const pinch=await view(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:170,y:385,id:1}]});for(let i=1;i<=6;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:170+i*8,y:385-i*5,id:1}]});await page.waitForTimeout(35);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(500);assert.notEqual(await view(page),pinch);assert.equal(await page.locator('.leaflet-container').count(),1);
 });
 await check('world zoom and return keep one geographic map',async()=>{
  const start=Number((await view(page)).split(',')[2]);for(let zoom=start-1;zoom>=2;zoom--){await page.locator('.leaflet-control-zoom-out').tap();await page.waitForFunction(z=>Number(document.querySelector('#geo-map').dataset.view.split(',')[2])===z,zoom);}
  await page.screenshot({path:new URL('map-world.png',out).pathname});await page.locator('#fit-routes').tap();await page.waitForFunction(()=>Number(document.querySelector('#geo-map').dataset.view.split(',')[2])>=13);assert.equal(await page.locator('.trail-line').count(),13);
 });
 await check('360px mobile and landscape recover the full viewport',async()=>{
  await page.setViewportSize({width:360,height:800});await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);let box=await page.locator('#map-card').boundingBox();assert.equal(Math.round(box.width),360);assert.equal(Math.round(box.height),800);await page.screenshot({path:new URL('map-360.png',out).pathname});
  await page.setViewportSize({width:844,height:390});await page.waitForTimeout(250);box=await page.locator('#map-card').boundingBox();assert.equal(Math.round(box.width),844);assert.equal(Math.round(box.height),390);assert.equal(await page.locator('.leaflet-container').count(),1);
 });await context.close();
 await check('changed snapshot fails closed while base map and park remain available',async()=>{
  const ctx=await browser.newContext(),p=await ctx.newPage();await localAssets(p);await p.route('**/sources/el-durazno-osm.json',r=>r.fulfill({contentType:'application/json',body:'{"altered":true}'}));await p.goto(mapUrl);await p.waitForSelector('#map-card[data-ready="true"]');assert.match(await p.locator('#map-notice').textContent(),/no coinciden/);assert.equal(await p.locator('.trail-line').count(),0);assert.equal(await p.locator('.leaflet-container').count(),1);assert.equal(await p.locator('#download-geojson').isDisabled(),true);await p.locator('[data-map-target="la-virgen"]').click();assert.equal(await p.locator('#sheet-title').textContent(),'La Virgen');await ctx.close();
 });
 await check('missing catalog is an explicit error rather than a blank success',async()=>{
  const ctx=await browser.newContext(),p=await ctx.newPage();await localAssets(p);await p.route('**/geographic-catalog.json',r=>r.fulfill({status:404,body:'missing'}));await p.goto(base+'/mapa-geografico.html');await p.waitForSelector('#app-error:not([hidden])');assert.match(await p.locator('#app-error').innerText(),/información del parque/);assert.equal(await p.locator('.trail-line').count(),0);await ctx.close();
 });
 await check('standalone runs the real mobile flow with embedded data and only online map tiles',async()=>{
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),p=await ctx.newPage();await localAssets(p);const localRequests=[];p.on('request',r=>{if(r.url().startsWith(base))localRequests.push(new URL(r.url()).pathname);});await p.goto(base+'/dist/mapas-gps-parques.html#fuente=osm');await p.getByRole('button',{name:/Explorar El Durazno/}).tap();await p.waitForSelector('#map-card[data-ready="true"]');assert.equal(await p.locator('.trail-line').count(),13);await p.waitForFunction(()=>document.querySelector('#park-photo').naturalWidth===2570);assert.deepEqual([...new Set(localRequests)],['/dist/mapas-gps-parques.html','/dist/sources/el-durazno-official-2022.jpg'],'the same verified JPEG may be reused for the park photo and route backgrounds; no additional data assets are required');await ctx.setOffline(true);await p.locator('#open-map').tap();await p.locator('[data-map-target="lomo-vetado"]').tap();assert.match(await p.locator('#sheet-stats').innerText(),/2,79 km/);await ctx.close();
 });
}finally{await browser.close();}

// A separate local context exercises the genuine legacy service worker and IndexedDB.
const local=await chromium.launch({executablePath,args:['--no-sandbox']});
try{
 await check('legacy Blob, calibration, trails, webCenter and storage survive app→park→app with active SW',async()=>{
  const ctx=await local.newContext(),p=await ctx.newPage();await p.goto(base+'/index.html');await p.waitForSelector('#mapList .map-card');await p.evaluate(async()=>{await navigator.serviceWorker.ready;});await p.reload();await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
  const image=await readFile(new URL('../icons/icon192.png',import.meta.url));await p.locator('#fileInput').setInputFiles({name:'preservation.png',mimeType:'image/png',buffer:image});await p.waitForFunction(()=>window.MapasGPS?.state.current?.name==='preservation');
  await p.evaluate(async()=>{const m=window.MapasGPS.state.current;m.points=[{px:0,py:0,lat:-33.30,lon:-70.50},{px:190,py:0,lat:-33.30,lon:-70.49},{px:0,py:190,lat:-33.31,lon:-70.50}];m.trails=[{id:'fixture',name:'Private test trail',coordinates:[[-70.5,-33.3],[-70.49,-33.31]]}];m.webCenter={lat:-33.305,lon:-70.495};await window.MapasGPS.saveCurrent();localStorage.setItem('preservation-sentinel','keep');});
  const snapshot=()=>p.evaluate(async()=>{const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('mapas-gps-v1',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});const items=await new Promise((resolve,reject)=>{const r=db.transaction('maps').objectStore('maps').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});db.close();return {items:await Promise.all(items.map(async({blob,...rest})=>({...rest,blobType:blob.type,bytes:Array.from(new Uint8Array(await blob.arrayBuffer()))}))),storage:Object.fromEntries(Object.entries(localStorage))};});
  const before=await snapshot();await p.goto(mapUrl);await p.waitForSelector('#map-card[data-ready="true"]');assert.equal(await p.locator('.trail-line').count(),13);assert.equal(await p.evaluate(()=>!!navigator.serviceWorker.controller),true);await p.goto(base+'/index.html');await p.waitForSelector('#mapList .map-card');const after=await snapshot();assert.deepEqual(after,before);await p.locator('.map-card').filter({hasText:'preservation'}).getByRole('button',{name:'Abrir mapa'}).click();await p.waitForFunction(()=>window.MapasGPS.state.current?.name==='preservation');assert.match(await p.locator('#viewerState').innerText(),/Calibrado/);assert.equal(await p.locator('#mapImage').evaluate(n=>n.naturalWidth),192);await ctx.close();
 });
}finally{await local.close();}
await writeFile(new URL('acceptance.json',out),JSON.stringify({checkedOn:new Date().toISOString(),checks},null,2));console.log(`${checks.length} geographic acceptance checks passed`);
