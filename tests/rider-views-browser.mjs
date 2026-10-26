import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
const base=process.env.RIDER_BASE_URL||'http://127.0.0.1:4187';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',acceptDownloads:true});
 await context.addInitScript(()=>{window.watchCount=0;window.gpsCallback=null;navigator.geolocation.watchPosition=callback=>{window.watchCount++;window.gpsCallback=callback;return 1;};navigator.geolocation.clearWatch=()=>{window.gpsCallback=null;};});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const ready=async()=>{await page.waitForSelector('#map-card[data-ready=true]',{state:'attached'});await page.waitForSelector('body[data-rider-ready=true]');};
 const state=()=>page.evaluate(async()=>{const {openRiderStore}=await import('/rider/store.mjs');const s=await openRiderStore();const value=await s.read();s.close();return value;});
 const hash=async view=>{await page.evaluate(v=>{location.hash=new URLSearchParams({parque:new URLSearchParams(location.hash.slice(1)).get('parque'),vista:v,...(v==='mapa'?{mapa:'1'}:{})});},view);await page.waitForFunction(v=>document.body.dataset.riderView===v,view);};
 let count=0;
 for(const [entry,park] of [['mapa-geografico.html','el-durazno'],['parquemet.html','parquemet']]){
  await page.goto(`${base}/${entry}#parque=${park}&vista=rutas`);await ready();
  assert.equal(await page.locator('#rider-rutas').isVisible(),true,'direct route explorer is a real view');
  const catalog=JSON.parse(await readFile(`data/${park}/geographic-catalog.json`));
  assert.equal(await page.locator('.rider-route-card').count(),catalog.targets.length);count+=catalog.targets.length;
  assert.equal(await page.evaluate(()=>window.watchCount),0,'navigation is not GPS consent');
  await page.locator('[data-rider-detail]').first().click();await page.waitForSelector('#rider-detalle:not([hidden])');
  assert.match(await page.locator('#rider-detalle').innerText(),/Perfil altimétrico/);assert.match(await page.locator('#rider-detalle').innerText(),/Sin datos/);
  await page.locator('#rider-detalle [data-rider-favorite]').click();await page.waitForFunction(()=>document.querySelector('#rider-detalle [data-rider-favorite]')?.getAttribute('aria-pressed')==='true');
  await page.goBack();await page.waitForSelector('#rider-rutas:not([hidden])');
  for(const v of ['perfil','encuentros','mapa','rutas','mapa','perfil'])await hash(v);
  assert.equal(await page.locator('#geo-map').count(),1);assert.equal(await page.locator('#bikeride-navigation').count(),1);
 }
 assert.equal(count,47);
 await page.locator('#rider-edit-profile').click();await page.locator('#rider-profile-name').fill('Ciclista local');await page.locator('#rider-profile-form button').click();await page.waitForFunction(()=>document.querySelector('#rider-identity-name')?.textContent==='Ciclista local');
 await page.locator('[data-profile-tab=garage]').click();await page.locator('[data-rider-action=new-bike]').click();
 await page.locator('#rider-bike-name').fill('Bici de prueba');await page.locator('#rider-bike-front').fill('22');await page.locator('#rider-bike-form button[type=submit]').click();await page.waitForSelector('[data-bike-id]');
 await page.reload();await ready();assert.equal((await state()).profile.name,'Ciclista local');assert.equal((await state()).bikes[0].frontPsi,22);
 await hash('encuentros');await page.locator('[data-rider-action=new-meetup]').click();await page.locator('#rider-meetup-title').fill('Salida local');await page.locator('#rider-meetup-start').fill('2026-11-01T09:30');await page.locator('#rider-meetup-point').fill('Entrada acordada');await page.locator('#rider-meetup-form button[type=submit]').click();await page.waitForSelector('[data-meetup-id]');
 const icsPromise=page.waitForEvent('download');await page.locator('[data-meetup-export]').click();const ics=await readFile(await (await icsPromise).path(),'utf8');assert.match(ics,/BEGIN:VCALENDAR/);assert.match(ics,/SUMMARY:Salida local/);
 await page.locator('[data-meetup-cancel]').click();await page.waitForFunction(()=>document.querySelector('[data-meetup-id]')?.textContent.includes('Cancelado'));
 await hash('rutas');await page.locator('[data-rider-detail]').first().click();const gpxPromise=page.waitForEvent('download');await page.locator('#rider-detalle [data-rider-gpx]').click();const gpx=await readFile(await (await gpxPromise).path(),'utf8');assert.match(gpx,/<trkseg>/);assert.match(gpx,/<trkpt lat=/);assert.match(gpx,/© OpenStreetMap contributors/);assert.match(gpx,/https:\/\/www.openstreetmap.org\/copyright/);assert.equal((await state()).downloads.length,1);
 await hash('mapa');assert.equal(await page.evaluate(()=>window.watchCount),0);
 await page.locator('#rider-record-start').click();await page.waitForFunction(()=>document.querySelector('#rider-record-pause')?.hidden===false);assert.equal(await page.evaluate(()=>window.watchCount),1);
 await page.evaluate(()=>window.gpsCallback({coords:{longitude:-70.63,latitude:-33.42,accuracy:5,speed:0,heading:null},timestamp:Date.now()}));
 await page.locator('#rider-record-pause').click();assert.equal((await state()).activities[0].status,'paused');await page.locator('#rider-record-resume').click();await page.locator('#rider-record-finish').click();await page.waitForFunction(()=>!document.querySelector('#rider-record-start').hidden);assert.equal((await state()).activities[0].status,'finished');
 await page.locator('#rider-record-start').click();await hash('perfil');await page.waitForFunction(async()=>{const {openRiderStore}=await import('/rider/store.mjs');const s=await openRiderStore();const v=await s.read();s.close();return v.activities.some(a=>a.status==='interrupted');});
 await page.goto(base+'/mapa-geografico.html#parque=el-durazno&vista=mapa&mapa=1');await ready();const before=(await state()).activities.length;await page.locator('#gps-demo').click();await page.waitForFunction(()=>document.querySelector('#gps-panel').dataset.mode==='demo');assert.equal(await page.locator('#rider-record-start').isDisabled(),true);assert.equal((await state()).activities.length,before);await page.locator('#gps-demo').click();
 await mkdir('test-results/rider',{recursive:true});
 for(const viewport of [{width:390,height:844},{width:844,height:390},{width:320,height:640},{width:544,height:780}]){
  await page.setViewportSize(viewport);
  for(const view of ['rutas','detalle','perfil','encuentros','mapa']){
   if(view==='detalle')await page.locator('[data-rider-detail]').first().click();else await hash(view);
   await page.screenshot({path:`test-results/rider/${view}-${viewport.width}x${viewport.height}.png`,fullPage:view!=='mapa'});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${view} has no horizontal overflow`);
  }
 }
 assert.deepEqual(errors,[]);console.log('PASS five views, 47 catalog cards, history, local profile/bike/agenda, GPX/ICS, opt-in recording and demo exclusion; responsive captures');
}finally{await browser.close();}
