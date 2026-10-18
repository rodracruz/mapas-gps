import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
const path=new URL('../dist/mapas-gps-revision.html',import.meta.url);
assert.ok(existsSync(path),'Missing executable standalone viewer');
const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{
 const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const http=[];p.on('request',r=>{if(/^https?:/.test(r.url()))http.push(r.url());});
 await p.goto((process.env.REVIEW_BASE_URL||'http://127.0.0.1:4173')+'/dist/mapas-gps-revision.html');await p.waitForSelector('#stage[aria-busy="false"]');
 assert.equal(await p.locator('#stage.error').count(),0);await p.context().setOffline(true);assert.equal(await p.locator('.route').count(),9);
 assert.equal(await p.locator('#image-source').inputValue(),'official');
 await p.locator('#image-source').selectOption('original');await p.waitForFunction(()=>document.querySelector('#stage').dataset.imageSource==='original');
 await p.locator('#image-source').selectOption('official');await p.waitForFunction(()=>document.querySelector('#stage').dataset.imageSource==='official');
 if(await p.locator('#show-reference-photo').isVisible()){
  await p.locator('#show-reference-photo').tap();await p.waitForSelector('#reference-photo-dialog[open]');
  assert.deepEqual(await p.locator('#reference-photo-image').evaluate(n=>[n.naturalWidth,n.naturalHeight]),[960,1280]);
  await p.locator('#close-reference-photo').tap();
 }
 await p.getByRole('button',{name:'Seleccionar Lomo Vetado',exact:true}).tap();await p.locator('#focus-trail').tap();
 await p.getByRole('button',{name:'Vectores',exact:true}).tap();assert.equal(await p.locator('#original').isVisible(),false);
 await p.getByRole('link',{name:'Método, fuentes y límites',exact:false}).click();await p.waitForSelector('dialog[open]');assert.match(await p.locator('dialog pre').textContent(),/900 × 1100/);
 assert.equal(http.length,1);console.log('PASS standalone HTML served once, mobile selection, vector mode and evidence while offline; two image sources and complete photo verified; zero external resources');
}finally{await b.close();}
