import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
const base=process.env.RIDER_BASE_URL||'http://127.0.0.1:4198';
await mkdir('test-results/rider-services',{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{
 for(const [park,entry]of [['el-durazno','mapa-geografico.html'],['parquemet','parquemet.html']]){
  const catalog=JSON.parse(await readFile(new URL(`../data/${park}/geographic-catalog.json`,import.meta.url))),page=await browser.newPage({viewport:{width:390,height:844}});
  await page.goto(`${base}/${entry}#parque=${park}&vista=encuentros`);await page.waitForSelector('body[data-rider-ready=true]');
  const cards=page.locator('.rider-service-card');assert.equal(await cards.count(),catalog.park.amenities.length);
  for(const [i,amenity]of catalog.park.amenities.entries()){
   assert.equal(await cards.nth(i).locator('a').count(),1,'source must be an evidence link');
   assert.equal(await cards.nth(i).locator('a').getAttribute('href'),amenity.sourceUrl,'source control must link to the recorded amenity evidence');
   assert.match(await cards.nth(i).innerText(),/Ubicación exacta y disponibilidad actual sin confirmar/);
   if(amenity.evidenceType==='official-map-legend')assert.match(await cards.nth(i).innerText(),/Fuente: plano oficial/);
   else {assert.match(await cards.nth(i).innerText(),/Fuente: sitio del parque/);assert.doesNotMatch(await cards.nth(i).innerText(),/Figura en el plano/);}
  }
  await cards.first().scrollIntoViewIfNeeded();await page.screenshot({path:`test-results/rider-services/${park}.png`});await page.close();console.log('PASS service provenance',park);
 }

 const fallback=JSON.parse(await readFile(new URL('../data/el-durazno/geographic-catalog.json',import.meta.url))),p=await browser.newPage();delete fallback.park.amenities[0].sourceUrl;
 // The catalog validator requires provenance on current catalogs. Exercise the
 // view's defensive fallback with a minimal view fixture, without changing it.
 await p.route('**/rider-service-fixture.html',route=>route.fulfill({contentType:'text/html',body:'<main><nav id="bikeride-navigation"><button id="bikeride-map"></button><button id="bikeride-routes"></button><button id="bikeride-meetups"></button><button id="bikeride-profile"></button></nav><section id="park-view"><img id="park-photo" src="/icons/icon192.png"><div id="map-card"></div><button id="open-map"></button><button id="gps-toggle"></button></section></main>'}));
 await p.goto(`${base}/rider-service-fixture.html#parque=el-durazno&vista=encuentros`);
 await p.evaluate(async catalog=>{const {setupCyclingViews}=await import('/rider/views.mjs');window.fixture=setupCyclingViews({catalog,directory:{parks:[]},getGeo:()=>null,getPreview:()=>null,actions:{routeChanged(){}}});},fallback);await p.waitForSelector('body[data-rider-ready=true]');
 assert.equal(await p.locator('.rider-service-card').first().locator('a').getAttribute('href'),fallback.park.sourceUrl);assert.match(await p.locator('.rider-service-card').first().innerText(),/referencia general del parque/);console.log('PASS missing amenity provenance uses an honest park-source fallback');
}finally{await browser.close();}
