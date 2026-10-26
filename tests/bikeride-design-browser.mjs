// Regression: the large photo/old heading pushed the interactive map out of
// the first screen, unlike the supplied mobile design. Inspect rendered layout.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.GEOGRAPHIC_BASE_URL||'http://127.0.0.1:4187';
const out=new URL('../test-results/bikeride-design/',import.meta.url);await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox'],proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined});
const checks=[];
try{
 const context=await browser.newContext({viewport:{width:390,height:595},deviceScaleFactor:544/390,isMobile:true,hasTouch:true}),page=await context.newPage();
 await page.route(base+'/**',async route=>{const r=await fetch(route.request().url());await route.fulfill({status:r.status,headers:Object.fromEntries(r.headers),body:Buffer.from(await r.arrayBuffer())});});
 for(const [park,entry,count] of [['el-durazno','mapa-geografico.html',21],['parquemet','parquemet.html',26]]){
  await page.goto(base+'/'+entry+'#parque='+park);await page.waitForSelector('#map-card[data-ready=true]');await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:new URL(park+'-reference-size.png',out).pathname});
  const map=await page.locator('#map-card').boundingBox();
  assert.ok(map.y>=340&&map.y<=370,`Interactive map must follow the welcome/park tabs in the first screen; actual y=${map.y}`);
  assert.ok(map.y+map.height<=535,'Map must be visible above the bottom navigation');
  const hero=await page.locator('#bikeride-summary').boundingBox(),tabs=await page.locator('#bikeride-park-switch').boundingBox(),header=await page.locator('.app-header').boundingBox();
  assert.ok(header.height<=65&&hero.y>=79&&hero.y<=81&&hero.y+hero.height<tabs.y&&tabs.y+tabs.height<map.y,'Header → welcome → park tabs → interactive map');
  assert.ok((await page.locator('.park-photo-card').boundingBox()).y>map.y,'Original map remains on the page after the interactive preview');
  assert.equal(await page.locator('.trail-card').count(),count);
  if(park==='parquemet')for(const id of ['avenida-pablo-neruda','camino-rafael-elizalde'])assert.match(await page.locator('[data-trail-summary="'+id+'"] .bikeride-fragment-note').textContent(),/Referencia en tabla oficial/,'A table-only source is not presented as a route crop');
  const node=await page.locator('#geo-map').elementHandle();
  assert.equal(await page.locator('[data-filter-type]').count()>1,true,'Main view presents the supplied horizontal type chips');
  await page.locator('[data-filter-type="'+(park==='parquemet'?'avenue':'park')+'"]').click();
  assert.equal(await node.evaluate(n=>n===document.getElementById('geo-map')),true);assert.equal(await page.locator('#map-card').evaluate(n=>n.getBoundingClientRect().top+scrollY),map.y);
  await page.locator('#filter-reset').click();await page.locator('#bikeride-routes').click();await page.waitForSelector('#rider-rutas:not([hidden])');assert.equal(await page.locator('.rider-route-card').count(),count);await page.goBack();await page.waitForSelector('#park-view:not([hidden])');
  const face=page.locator('.trail-card summary.has-trail-miniature').first(),crop=face.locator('.trail-miniature');
  const f=await face.boundingBox(),c=await crop.boundingBox();assert.ok(c.width>f.width*.9&&c.height>=100,'Official route crop spans the card header');
  const card=face.locator('..');
  assert.equal(await card.locator('.bikeride-card-description').isVisible(),true,'The design keeps the real route description visible before expanding technical details');
  assert.equal(await card.getByRole('button',{name:'Ver ficha técnica',exact:true}).isVisible(),true,'Technical detail action is visible');
  assert.equal(await card.getByRole('button',{name:'Ver en mapa',exact:true}).isVisible(),true,'Actual map action is visible');
  await card.getByRole('button',{name:'Ver ficha técnica',exact:true}).click();assert.equal(await card.locator('.trail-details').isVisible(),true);await card.getByRole('button',{name:'Ver ficha técnica',exact:true}).click();assert.equal(await card.locator('.trail-details').isVisible(),false);
  await page.screenshot({path:new URL(park+'-routes.png',out).pathname});
  await page.locator('#bikeride-map').click();await page.waitForSelector('#map-card.fullscreen');
  assert.equal(await page.locator('#bikeride-navigation').isVisible(),true);assert.equal(await page.locator('#gps-panel').isVisible(),true);await page.locator('#close-map').click();
  await page.locator('#open-map .map-open-label').click();await page.waitForSelector('#map-card.fullscreen');assert.equal(await page.locator('#map-options').getAttribute('open')!==null,true,'Ver capas opens the real Layers menu');await page.locator('#map-options summary').click();await page.locator('#close-map').click();
  checks.push(park+': reference layout, original source preserved, real cards/filters, same map node and full-screen GPS');
 }
 for(const [width,height]of [[320,740],[390,844],[544,830],[844,390]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>scrollTo(0,0));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'No horizontal document overflow');
 }
 await writeFile(new URL('verification.json',out),JSON.stringify({reference:{pixels:[544,830],cssViewport:[390,595],deviceScaleFactor:544/390},checks},null,2));
 console.log(JSON.stringify({checks}));await context.close();
}finally{await browser.close();}
