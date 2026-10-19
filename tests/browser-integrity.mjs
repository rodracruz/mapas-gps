// Real Chromium integration tests, including a transient photo decode failure.
// Uses a public repository photo as fixture; no private attachment is required.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const base=process.env.REVIEW_BASE_URL||'http://127.0.0.1:4173';
const data=JSON.parse(await readFile(new URL('../data/el-durazno/visual-trails.json',import.meta.url)));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const errors=[];
try{
 for(const [name,mutate,reason] of [
  ['unsupported transform',d=>d.image.transform=[2,0,0,2,0,0],/transformación de imagen/],
  ['mismatched endpoint',d=>d.nodes[0].point=[0,0],/extremos/],
  ['trail without geometry',d=>d.segments=d.segments.filter(s=>s.trailId!=='lomo-vetado'),/fragmentos visibles/],
  ['shortcut through pending label',d=>{
   const [x,y,w,h]=d.gaps[0].bounds,s=d.segments[0];
   s.points=[[x-10,y+h/2],[x+w+10,y+h/2]];
   d.nodes.find(n=>n.id===s.startNodeId).point=s.points[0];
   d.nodes.find(n=>n.id===s.endNodeId).point=s.points[1];
  },/zona pendiente/]
 ]){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const invalid=structuredClone(data);mutate(invalid);
  await page.route('**/data/el-durazno/visual-trails.json',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(invalid)}));
  await page.goto(base+'/revision.html');await page.waitForSelector('#stage.error');
  assert.match(await page.locator('#load-status').textContent(),reason);
  assert.equal(await page.locator('.route').count(),0);
  assert.equal(await page.locator('#download').isDisabled(),true);
  assert.doesNotMatch(await page.locator('#map').getAttribute('viewBox'),/NaN|Infinity/);
  await context.close();console.log('PASS mobile rejects '+name+' before drawing or export');
 }
 const photo=await readFile(new URL('../elh-durazno.jpg',import.meta.url));
 const reference={width:900,height:1100,sha256:data.image.sha256,dataUrl:'data:image/jpeg;base64,'+photo.toString('base64')};
 const embedded='<script id="embedded-reference-photo" type="application/json">'+JSON.stringify(reference)+'</script>';
 let html=await readFile(new URL('../dist/mapas-gps-revision.html',import.meta.url),'utf8');
 html=html.replace(/<script id="embedded-reference-photo" type="application\/json">[\s\S]*?<\/script>/,'').replace('<script type="module">',embedded+'<script type="module">');
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.route(base+'/__review-recovery.html',r=>r.fulfill({contentType:'text/html',body:html}));
 await page.goto(base+'/__review-recovery.html');await page.waitForSelector('#stage[aria-busy="false"]');
 assert.equal(await page.locator('#stage.error').count(),0);
 await page.evaluate(()=>{
  window.photoDecodeAttempts=0;window.revokedPhotoURLs=[];
  const originalDecode=HTMLImageElement.prototype.decode,originalRevoke=URL.revokeObjectURL;
  HTMLImageElement.prototype.decode=function(){
   window.photoDecodeAttempts++;
   if(window.photoDecodeAttempts===1)return Promise.reject(new DOMException('Transient test decode failure','EncodingError'));
   return originalDecode.call(this);
  };
  URL.revokeObjectURL=function(url){window.revokedPhotoURLs.push(url);return originalRevoke.call(this,url);};
 });
 await page.locator('#show-reference-photo').tap();await page.waitForSelector('#source-error:not([hidden])');
 assert.equal(await page.locator('#reference-photo-dialog').evaluate(n=>n.open),false);
 assert.equal(await page.evaluate(()=>window.revokedPhotoURLs.length),1,'failed candidate URL must be revoked');
 await page.locator('#show-reference-photo').tap();await page.waitForSelector('#reference-photo-dialog[open]');
 await page.waitForFunction(()=>document.getElementById('reference-photo-image').naturalWidth===900);
 assert.equal(await page.evaluate(()=>window.photoDecodeAttempts),2,'a retry must decode again');
 assert.equal(await page.locator('#reference-photo-image').evaluate(n=>n.naturalHeight),1100);
 assert.equal(await page.locator('#source-error').isHidden(),true);
 await page.locator('#close-reference-photo').tap();
 assert.equal(await page.locator('#reference-photo-dialog').evaluate(n=>n.open),false);
 await context.close();assert.deepEqual(errors,[]);
 console.log('PASS full-photo retry revokes failed URL, decodes again and opens verified image on mobile');
}finally{await browser.close();}
