// Real Chromium browser verification. Start `npm run serve` first.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const changedPhoto=Buffer.concat([await readFile(new URL('../sources/el-durazno-official-aligned-2x.jpg',import.meta.url)),Buffer.from('changed source trailer')]);
const base=process.env.REVIEW_BASE_URL||'http://127.0.0.1:4173';
const out=new URL('../docs/evidence/screenshots/',import.meta.url);await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const results=[];const errors=[];
const check=async(name,fn)=>{await fn();results.push(name);console.log('PASS',name);};
async function ready(p){await p.goto(base+'/revision.html');await p.waitForSelector('#stage[aria-busy="false"]');assert.equal(await p.locator('#stage').evaluate(n=>n.classList.contains('error')),false);}
async function alignment(p){return p.evaluate(()=>{
 const image=document.getElementById('original'),line=document.querySelector('.route');
 const a=image.getScreenCTM(),b=line.getScreenCTM();
 return {image:[a.a,a.b,a.c,a.d,a.e,a.f],vector:[b.a,b.b,b.c,b.d,b.e,b.f]};
});}
try{
 const desktop=await browser.newContext({viewport:{width:1440,height:1100},acceptDownloads:true});
 const page=await desktop.newPage();page.on('pageerror',e=>errors.push(e.message));
 await check('load actual photo, 10 fragments and 6 pending regions',async()=>{
  await ready(page);assert.equal(await page.locator('.route').count(),10);assert.equal(await page.locator('.pending').count(),6);
  assert.match(await page.locator('#dataset-status').textContent(),/10 fragmentos/);
  const image=await page.locator('#original').evaluate(n=>({x:n.getAttribute('x'),y:n.getAttribute('y'),width:n.getAttribute('width'),height:n.getAttribute('height')}));
  assert.deepEqual(image,{x:'0',y:'0',width:'900',height:'1100'});
 });
 await page.screenshot({path:new URL('desktop-overlay.png',out).pathname,fullPage:true});
 await check('photo, overlay, vectors, independent opacity and per-trail visibility',async()=>{
  await page.getByRole('button',{name:'Imagen',exact:true}).click();assert.equal(await page.locator('.trail-group').first().isVisible(),false);
  await page.getByRole('button',{name:'Vectores',exact:true}).click();assert.equal(await page.locator('#original').isVisible(),false);assert.equal(await page.locator('.route').first().isVisible(),true);
  await page.getByRole('button',{name:'Superposición',exact:true}).click();
  await page.locator('#photo-opacity').fill('38');await page.locator('#photo-opacity').dispatchEvent('input');assert.equal(await page.locator('#original').evaluate(n=>n.style.opacity),'0.38');
  await page.locator('#vector-opacity').fill('55');await page.locator('#vector-opacity').dispatchEvent('input');assert.equal(await page.locator('#trails').evaluate(n=>n.style.opacity),'0.55');
  await page.getByRole('checkbox',{name:'Mostrar Starwars',exact:true}).uncheck();assert.equal(await page.locator('.trail-group[data-trail="starwars"]').isVisible(),false);
  assert.equal(await page.locator('.pending[data-trail="starwars"]').first().isVisible(),false);
  await page.getByRole('checkbox',{name:'Mostrar Starwars',exact:true}).check();
  await page.locator('#photo-opacity').fill('100');await page.locator('#photo-opacity').dispatchEvent('input');await page.locator('#vector-opacity').fill('90');await page.locator('#vector-opacity').dispatchEvent('input');
 });
 await check('selection, pending explanation and no automatic links',async()=>{
  await page.getByRole('button',{name:'Seleccionar La Virgen',exact:true}).click();assert.equal(await page.locator('#selection-title').textContent(),'La Virgen');
  await page.locator('.pending[data-gap="virgen-label-upper"]').focus();await page.keyboard.press('Enter');assert.match(await page.locator('#selection-detail').textContent(),/No se ha dibujado un tramo/);
  await page.locator('#show-gaps').uncheck();assert.equal(await page.locator('#gaps').isVisible(),false);await page.locator('#show-gaps').check();
 });
 await check('same image/vector transform after anchored zoom, drag and resize',async()=>{
  await page.locator('#fit').click();
  let a=await alignment(page);assert.deepEqual(a.image,a.vector);
  const box=await page.locator('#map').boundingBox();const anchor={x:box.x+box.width*.6,y:box.y+box.height*.45};
  const world=await page.locator('#map').evaluate((n,a)=>{const p=new DOMPoint(a.x,a.y).matrixTransform(n.getScreenCTM().inverse());return {x:p.x,y:p.y};},anchor);
  await page.mouse.move(anchor.x,anchor.y);await page.mouse.wheel(0,-300);
  await page.waitForFunction(()=>document.querySelector('#map').viewBox.baseVal.width<900);
  const screen=await page.locator('#map').evaluate((n,a)=>{const p=new DOMPoint(a.x,a.y).matrixTransform(n.getScreenCTM());return {x:p.x,y:p.y};},world);
  assert.ok(Math.hypot(screen.x-anchor.x,screen.y-anchor.y)<.1,'world point drifted under anchored zoom');
  a=await alignment(page);assert.deepEqual(a.image,a.vector);
  await page.mouse.move(box.x+box.width*.4,box.y+box.height*.6);await page.mouse.down();await page.mouse.move(box.x+box.width*.4+80,box.y+box.height*.6+50,{steps:10});await page.mouse.up();
  a=await alignment(page);assert.deepEqual(a.image,a.vector);
  await page.setViewportSize({width:1000,height:900});a=await alignment(page);assert.deepEqual(a.image,a.vector);
  await page.setViewportSize({width:1440,height:1100});
 });
 await check('editable JSON download contains image pixels and no geographic transform',async()=>{
  const promise=page.waitForEvent('download');await page.locator('#download').click();const d=await promise;assert.equal(d.suggestedFilename(),'el-durazno-trazados-pixeles.json');
  const exported=JSON.parse(await readFile(await d.path(),'utf8'));assert.equal(exported.coordinateSystem,'image-pixels');assert.equal(exported.georeferencing.transform,null);assert.deepEqual(exported.connections,[]);
 });
 await page.locator('#image-source').selectOption('original');await page.waitForFunction(()=>document.querySelector('#stage').dataset.imageSource==='original');
 // Exactly the same viewBox for all three comparisons for each trail.
 for(const [id,name] of [['starwars','Starwars'],['la-virgen','La Virgen'],['lomo-vetado','Lomo Vetado']]){
  await page.getByRole('button',{name:`Seleccionar ${name}`,exact:true}).click();await page.locator('#focus-trail').click();
  for(const [mode,label] of [['photo','Imagen'],['overlay','Superposición'],['vectors','Vectores']]){
   await page.getByRole('button',{name:label,exact:true}).click();await page.locator('#stage').screenshot({path:new URL(`${id}-${mode}.png`,out).pathname});
  }
 }
 await check('malformed data and missing image fail closed with visible explanation',async()=>{
  const ctx=await browser.newContext();let p=await ctx.newPage();
  await p.route('**/data/el-durazno/visual-trails.json',route=>route.fulfill({contentType:'application/json',body:'{"schemaVersion":1,"coordinateSystem":"EPSG:4326"}'}));
  await p.goto(base+'/revision.html');await p.waitForSelector('#stage.error');assert.match(await p.getByRole('alert').textContent(),/Datos de trazado inválidos/);assert.equal(await p.locator('.route').count(),0);
  await ctx.close();
  const ctx2=await browser.newContext();p=await ctx2.newPage();await p.route('**/el-durazno-official-aligned-2x.jpg',route=>route.fulfill({status:404,body:'missing'}));await p.goto(base+'/revision.html');await p.waitForSelector('#stage.error');assert.match(await p.getByRole('alert').textContent(),/imagen de referencia/);assert.equal(await p.locator('#download').isDisabled(),true);await ctx2.close();
  const ctx3=await browser.newContext();p=await ctx3.newPage();await p.route('**/el-durazno-official-aligned-2x.jpg',route=>route.fulfill({status:200,contentType:'image/jpeg',body:Buffer.from('changed image bytes')}));await p.goto(base+'/revision.html');await p.waitForSelector('#stage.error');assert.match(await p.getByRole('alert').textContent(),/no coincide con la fuente/);await ctx3.close();
 });
 await check('HTTP without SubtleCrypto verifies original and rejects changed source bytes',async()=>{
  const ctx=await browser.newContext();await ctx.addInitScript(()=>Object.defineProperty(window,'crypto',{value:{},configurable:true}));const p=await ctx.newPage();await ready(p);
  await p.route('**/el-durazno-official-aligned-2x.jpg',route=>route.fulfill({status:200,contentType:'image/jpeg',body:changedPhoto}));
  await p.reload();await p.waitForSelector('#stage[aria-busy="false"]');assert.equal(await p.locator('#stage.error').count(),1,'changed source must be rejected without SubtleCrypto');assert.match(await p.getByRole('alert').textContent(),/no coincide con la fuente/);await ctx.close();
 });
 const mobile=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const m=await mobile.newPage();m.on('pageerror',e=>errors.push(e.message));await ready(m);
 await check('mobile 390px layout and touch selection',async()=>{
  assert.equal(await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await m.getByRole('button',{name:'Seleccionar Starwars',exact:true}).tap();assert.equal(await m.locator('#selection-title').textContent(),'Starwars');
  await m.locator('#fit').click();await m.locator('#stage').scrollIntoViewIfNeeded();
  await m.getByRole('button',{name:'Seleccionar La Virgen',exact:true}).tap();await m.locator('#stage').scrollIntoViewIfNeeded();
  const point2=await m.locator('.route-hit[data-trail="starwars"]').first().evaluate(n=>{const p=n.points.getItem(Math.floor(n.points.numberOfItems/2));const q=new DOMPoint(p.x,p.y).matrixTransform(n.getScreenCTM());return {x:q.x,y:q.y};});
  await m.touchscreen.tap(point2.x,point2.y);assert.equal(await m.locator('#selection-title').textContent(),'Starwars');
 });
 await check('mobile two-finger pinch, pan and pointer cancellation',async()=>{
  const client=await mobile.newCDPSession(m);const box=await m.locator('#map').boundingBox();
  const x=Math.round(box.x+box.width/2),y=Math.round(box.y+box.height/2);
  const before=await m.locator('#map').getAttribute('viewBox');
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x-40,y,id:1},{x:x+40,y,id:2}]});
  await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-70,y:y+15,id:1},{x:x+70,y:y+15,id:2}]});
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  const after=await m.locator('#map').getAttribute('viewBox');assert.notEqual(after,before);assert.ok(Number(after.split(' ')[2])<Number(before.split(' ')[2]));
  let a=await alignment(m);assert.deepEqual(a.image,a.vector);
  const prev=await m.locator('#map').getAttribute('viewBox');
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+35,y:y+20,id:1}]});await client.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
  assert.notEqual(await m.locator('#map').getAttribute('viewBox'),prev);assert.equal(await m.locator('#map').evaluate(n=>n.classList.contains('dragging')),false);
  a=await alignment(m);assert.deepEqual(a.image,a.vector);assert.equal(await m.locator('#selection-title').textContent(),'Starwars');
 });
 await m.locator('#fit').click();await m.screenshot({path:new URL('mobile-overlay.png',out).pathname,fullPage:true});
 await m.getByRole('button',{name:'Vectores',exact:true}).tap();await m.screenshot({path:new URL('mobile-vectors.png',out).pathname,fullPage:true});
 await check('review preserves stored map blob, calibration, GIS records and localStorage',async()=>{
  await m.evaluate(async()=>{
   localStorage.setItem('sample-installed','1');localStorage.setItem('review-regression-marker','keep');
   const db=await new Promise((res,rej)=>{const r=indexedDB.open('mapas-gps-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('maps',{keyPath:'id'});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});
   await new Promise((res,rej)=>{const t=db.transaction('maps','readwrite');t.objectStore('maps').put({id:'test-private-synthetic',name:'Mapa de prueba sintético',blob:new Blob(['synthetic-image']),width:20,height:30,points:[{px:5,py:8,lat:0,lon:0}],gis:{lines:[{id:'synthetic'}]}});t.oncomplete=res;t.onerror=()=>rej(t.error);});db.close();
  });
  await ready(m);
  const stored=await m.evaluate(async()=>{
   const db=await new Promise(res=>{const r=indexedDB.open('mapas-gps-v1',1);r.onsuccess=()=>res(r.result);});const value=await new Promise(res=>{const r=db.transaction('maps').objectStore('maps').get('test-private-synthetic');r.onsuccess=()=>res(r.result);});db.close();
   return {marker:localStorage.getItem('review-regression-marker'),seed:localStorage.getItem('sample-installed'),name:value.name,blob:await value.blob.text(),points:value.points,gis:value.gis};
  });
  assert.deepEqual(stored,{marker:'keep',seed:'1',name:'Mapa de prueba sintético',blob:'synthetic-image',points:[{px:5,py:8,lat:0,lon:0}],gis:{lines:[{id:'synthetic'}]}});
 });
 await check('legacy app loads its existing sample and opens original image',async()=>{
  const old=await desktop.newPage();await old.goto(base+'/');await old.waitForSelector('.map-card');await old.getByRole('button',{name:'Abrir mapa →',exact:true}).first().click();await old.waitForSelector('#viewer:not(.hidden) #mapImage');assert.equal(await old.locator('#mapImage').isVisible(),true);await old.close();
 });
 await check('no browser runtime errors',async()=>assert.deepEqual(errors,[]));
 await writeFile(new URL('../docs/evidence/browser-results.json',import.meta.url),JSON.stringify({checkedAt:new Date().toISOString(),base,browser:await browser.version(),desktop:[1440,1100],mobile:[390,844],checks:results,errors},null,2)+'\n');
 console.log(`${results.length} browser checks passed`);
}finally{await browser.close();}
