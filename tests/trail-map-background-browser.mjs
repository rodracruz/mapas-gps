import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir,readFile} from 'node:fs/promises';
const base=process.env.GEOGRAPHIC_BASE_URL||'http://127.0.0.1:4179',bundle=process.env.BACKGROUND_BUNDLE==='1';
const parks=[{id:'parquemet',entry:bundle?'/dist/parquemet.html':'/parquemet.html',count:14,trail:'centenario',data:'data/parquemet/visual-cycling-trails.json',image:'sources/parquemet-mapa-oficial.jpg'}, {id:'el-durazno',entry:bundle?'/dist/index.html':'/mapa-geografico.html',count:20,trail:'la-virgen',data:'data/el-durazno/continuous-sign-trails.json',image:'sources/el-durazno-official-2022.jpg'}];
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox'],proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined});
try{
 for(const park of parks){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route(base+'/**',async route=>{try{const r=await fetch(route.request().url());await route.fulfill({status:r.status,headers:Object.fromEntries(r.headers),body:Buffer.from(await r.arrayBuffer())});}catch{await route.abort();}});
  await page.goto(base+park.entry+'#parque='+park.id);await page.waitForSelector('#map-card[data-ready=true]');
  assert.equal(await page.locator(park.id==='parquemet'?'.trail-card:not(.avenue-card) .trail-miniature image':'.trail-miniature image').count(),park.count,'every collapsed route keeps its original map background');assert.equal(await page.locator('.trail-official-preview:not([data-preview-kind=document-crop]) image').count(),park.count);
  const source=JSON.parse(await readFile(park.data));
  for(const preview of await page.locator('.trail-official-preview:not([data-preview-kind=document-crop])').all()){
   const id=await preview.getAttribute('data-official-preview');await page.locator(`[data-trail-summary="${id}"]`).tap();
   const image=preview.locator('image');assert.equal(Number(await image.getAttribute('width')),source.image.width);assert.equal(Number(await image.getAttribute('height')),source.image.height);assert.match(await image.getAttribute('href'),/^blob:/,'verified original bytes are reused');
   const crop=preview.locator('.trail-preview-crop');assert.equal(await crop.getAttribute('overflow'),'hidden');const rect=(await crop.getAttribute('viewBox')).split(' ').map(Number);assert.ok(rect[2]*rect[3]<source.image.width*source.image.height*.6,'crop contains the route neighbourhood, not the whole park');
   const matrices=await preview.evaluate(el=>['image','path'].map(s=>{const m=el.querySelector(s).getScreenCTM();return[m.a,m.b,m.c,m.d,m.e,m.f];}));assert.deepEqual(matrices[0],matrices[1],'original map and route stay aligned');await page.locator(`[data-trail-summary="${id}"]`).tap();
  }
  const src=await page.locator('.trail-official-preview:not([data-preview-kind=document-crop]) image').first().getAttribute('href');const hash=await page.evaluate(async url=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await(await fetch(url)).arrayBuffer())),n=>n.toString(16).padStart(2,'0')).join(''),src);assert.equal(hash,createHash('sha256').update(await readFile(park.image)).digest('hex'),'background is the untouched original image');
  await page.locator(`[data-trail-summary="${park.trail}"]`).tap();await mkdir('test-results/map-background',{recursive:true});await page.screenshot({path:`test-results/map-background/${park.id}-card.png`});await page.locator(`[data-official-preview="${park.trail}"] button`).tap();
  if(park.id==='parquemet'){assert.equal(await page.locator('[data-document-mode="overlay"]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('#document-image').isVisible(),true);assert.ok(Number(await page.locator('#document-image').evaluate(n=>getComputedStyle(n).opacity))>=.85);await page.locator('#document-in').tap();}
  else{await page.waitForFunction(()=>document.querySelector('[data-sign-mode="overlay"]').getAttribute('aria-pressed')==='true');assert.equal(await page.locator('#sign-raster').isVisible(),true);assert.ok(Number(await page.locator('#sign-raster').evaluate(n=>getComputedStyle(n).opacity))>=.85);await page.locator('#sign-zoom-in').tap();}
  await page.screenshot({path:`test-results/map-background/${park.id}-enlarged.png`});assert.deepEqual(errors,[]);await page.unrouteAll({behavior:'wait'});await context.close();
 }
 console.log('PASS34 route previews keep exact original map bytes, nearby crops, aligned curves and map-backed enlargement in both parks');
}finally{await browser.close();}
