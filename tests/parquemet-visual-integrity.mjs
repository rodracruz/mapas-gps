import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const base=process.env.GEOGRAPHIC_BASE_URL||'http://127.0.0.1:4178';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox'],proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined});
try{
 for(const kind of ['cycling','avenues'])for(const entry of ['/parquemet.html','/dist/parquemet.html']){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route(base+'/**',async route=>{
   const response=await fetch(route.request().url());let body=Buffer.from(await response.arrayBuffer());const path=new URL(route.request().url()).pathname;
   if(path.endsWith(kind==='cycling'?'/visual-cycling-trails.json':'/visual-avenues.json')){body[100]^=1;}
   if(path===entry&&entry.startsWith('/dist/'))body=Buffer.from(body.toString().replace(new RegExp('(id="embedded-park-'+(kind==='cycling'?'visual':'avenue-visual')+'"[^>]*>)([A-Za-z0-9+/])'),(_,head,letter)=>head+(letter==='A'?'B':'A')));
   const headers=Object.fromEntries(response.headers);delete headers['content-length'];await route.fulfill({status:response.status,headers,body});
  });
  await page.goto(base+entry+'#parque=parquemet');await page.waitForSelector('#map-card[data-ready=true]');assert.match(await page.locator('#app-error').innerText(),/curvas no coinciden/);assert.equal(await page.locator('.trail-official-preview').count(),0);assert.equal(await page.locator('.cycling-label').count(),8,'independent OSM data remains available');await page.locator('#open-park-photo').tap();await page.waitForSelector('#official-dialog[open]');assert.equal(await page.locator('#document-image').isVisible(),true,'original PDF still opens');assert.equal(await page.locator('.document-cycling-trail').count(),0);assert.deepEqual(errors,[]);await page.unrouteAll({behavior:'wait'});await context.close();
 }
 console.log('PASS changed official curves or avenue crop receipts fail closed in source and bundle; independent OSM and original PDF remain available');
}finally{await browser.close();}
