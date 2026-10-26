import {selectMapTrail} from './helpers/route-filter-control.mjs';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import {fromOsmSnapshot} from '../geographic/data.mjs';
import {createPublicDemo} from '../navigation/demo.mjs';
import {bikeMatchingNetwork} from '../geographic/network.mjs';
import {createRouteMatcher} from '../navigation/matcher.mjs';
const base=process.env.GEOGRAPHIC_BASE_URL||'http://127.0.0.1:4183';
const elCatalog=JSON.parse(await readFile('data/el-durazno/geographic-catalog.json'));
const fixes=createPublicDemo(fromOsmSnapshot(JSON.parse(await readFile(elCatalog.sourceSnapshot)),elCatalog)).fixes;
const pkCatalog=JSON.parse(await readFile('data/parquemet/geographic-catalog.json'));
const pkGeo=bikeMatchingNetwork(fromOsmSnapshot(JSON.parse(await readFile(pkCatalog.sourceSnapshot)),pkCatalog));
const pkFeature=pkGeo.features.find(f=>{const p=f.geometry.coordinates[Math.floor(f.geometry.coordinates.length/2)],matcher=createRouteMatcher(pkGeo);let result;for(let i=0;i<4;i++)result=matcher.update({longitude:p[0],latitude:p[1],accuracy:5,timestamp:100000+i*1000},100000+i*1000);return result.status==='probable'&&result.route.id===f.properties.targetId;}),pk=pkFeature.geometry.coordinates[Math.floor(pkFeature.geometry.coordinates.length/2)];
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox'],proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined});
const obstacles='#rider-map-hud,#rider-map-banner,#rider-map-controls,.leaflet-control-attribution,.map-toolbar,.map-source-switch,.map-trails,.map-options,.gps-panel,.route-sheet,.route-filters,.leaflet-control-zoom,.map-notice';
async function visiblePoint(page,label){
 await page.waitForTimeout(150);
 const point=await page.locator('.gps-raw-dot').evaluate((e,selectors)=>{const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return{x,y,visible:x>=5&&y>=5&&x<=innerWidth-5&&y<=innerHeight-5,blocked:!!document.elementFromPoint(x,y)?.closest(selectors)};},obstacles);
 if(!point.visible||point.blocked){await page.screenshot({path:'test-results/gps/blocked.png'});console.log(await page.locator(obstacles).evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>({tag:e.id||e.className,rect:e.getBoundingClientRect().toJSON()}))));}assert.ok(point.visible&&!point.blocked,JSON.stringify({label,point}));
}
try{
 await mkdir('test-results/gps',{recursive:true});
 for(const park of [
  {id:'el-durazno',entry:process.env.GPS_ENTRY||'/mapa-geografico.html',fix:fixes[0],target:'lomo-vetado'},
  {id:'parquemet',entry:process.env.PARK_ENTRY||'/parquemet.html',fix:{longitude:pk[0],latitude:pk[1]},target:pkFeature.properties.targetId}
 ]){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,permissions:['geolocation'],geolocation:{longitude:park.fix.longitude,latitude:park.fix.latitude,accuracy:5}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route(base+'/**',async route=>{const response=await fetch(route.request().url());await route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:Buffer.from(await response.arrayBuffer())});});
  await page.goto(base+park.entry+'#parque='+park.id+'&mapa=1');await page.waitForSelector('#map-card[data-ready=true]');
  if(park.id==='parquemet')assert.equal(await page.locator('#gps-demo').isVisible(),false,'Parquemet never replays the El Durazno demo');
  await page.locator('#gps-toggle').tap();await page.waitForSelector('.gps-raw-dot');await visiblePoint(page,park.id+' initial native fix');
  assert.equal(await page.locator('.gps-raw-dot').evaluate(e=>{const pane=e.closest('.leaflet-pane'),markers=document.querySelector('.leaflet-marker-pane');return Number(getComputedStyle(pane).zIndex)>Number(getComputedStyle(markers).zIndex)&&getComputedStyle(pane).pointerEvents==='none';}),true,'GPS paints above route labels without blocking touches');
  for(let i=1;i<9;i++){const fix=park.id==='el-durazno'?fixes[i]:park.fix;await context.setGeolocation({longitude:fix.longitude,latitude:fix.latitude,accuracy:5+i*.01});await page.waitForTimeout(500);}
  await page.waitForSelector('#gps-status[data-state="probable"][data-route-id="'+park.target+'"]');
  await selectMapTrail(page,park.target);await visiblePoint(page,park.id+' selected sheet');
  for(const [width,height]of [[844,390],[320,568],[390,844]]){
   await page.setViewportSize({width,height});await page.waitForTimeout(400);await visiblePoint(page,park.id+` rotated ${width}x${height}`);
  }
  await page.locator('#gps-center').tap();await visiblePoint(page,park.id+' recenter');
  await page.screenshot({path:`test-results/gps/native-${park.id}.png`});
  await context.setGeolocation({longitude:park.fix.longitude,latitude:park.fix.latitude,accuracy:100});await page.waitForSelector('#gps-status[data-reason="poor-accuracy"]');assert.equal(await page.locator('.gps-snapped-dot').count(),0);await visiblePoint(page,park.id+' coarse reading');
  await page.locator('#gps-toggle').tap();assert.equal(await page.locator('.gps-raw-dot').count(),0);assert.equal(await page.locator('.gps-snapped-dot').count(),0);
  assert.deepEqual(errors,[]);await page.unrouteAll({behavior:'wait'});await context.close();
  const offline=await browser.newContext({viewport:{width:320,height:568},isMobile:true,hasTouch:true,permissions:['geolocation'],geolocation:{longitude:park.fix.longitude,latitude:park.fix.latitude,accuracy:5}}),op=await offline.newPage();
  await op.route('https://tile.openstreetmap.org/**',r=>r.abort());
  await op.route(base+'/**',async r=>{const response=await fetch(r.request().url());await r.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:Buffer.from(await response.arrayBuffer())});});
  await op.goto(base+park.entry+'#parque='+park.id+'&mapa=1');await op.waitForSelector('#map-card[data-ready=true]');await op.locator('#gps-toggle').tap();await op.waitForSelector('.gps-raw-dot');await selectMapTrail(op,park.target);await op.waitForSelector('#gps-panel>#map-notice:not([hidden])');await visiblePoint(op,park.id+' failed map tiles with sheet');
  await op.screenshot({path:`test-results/gps/no-tiles-${park.id}.png`});await op.locator('#gps-toggle').tap();assert.equal(await op.locator('#map-card>#map-notice').count(),1,'warning returns to map after stopping');await op.unrouteAll({behavior:'wait'});await offline.close();
 }
 console.log('PASS native GPS with public coordinates in both parks: probable acquisition, unobscured fix, sheet, rotation, recenter, coarse accuracy, stop, failed tiles and no foreign demo');
}finally{await browser.close();}
