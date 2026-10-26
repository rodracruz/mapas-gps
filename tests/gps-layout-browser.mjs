import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const base=process.env.GEOGRAPHIC_BASE_URL||'http://127.0.0.1:4176';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{
 await mkdir('test-results/gps',{recursive:true});
 for(const [width,height]of [[390,844],[844,390],[320,740],[667,375],[320,568]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true}),page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+(process.env.GPS_ENTRY||'/mapa-geografico.html')+'#parque=el-durazno&mapa=1');await page.waitForSelector('#map-card[data-ready="true"]');assert.equal(await page.locator('#gps-privacy').isVisible(),true);await page.locator('#gps-demo').tap();await page.locator('#gps-demo-pause').tap();
  for(let i=0;i<49;i++){
   const point=await page.locator('.gps-raw-dot').evaluate(e=>{const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,front=document.elementFromPoint(x,y);return{x,y,blocked:!!front?.closest('.map-toolbar,.map-source-switch,.map-trails,.map-options,.gps-panel,.route-sheet,.route-filters,.leaflet-control-zoom')};});
   assert.ok(point.x>=0&&point.x<=width&&point.y>=0&&point.y<=height,JSON.stringify({width,height,i,point}));assert.equal(point.blocked,false,JSON.stringify({width,height,i,point}));
   if(await page.locator('#gps-demo-next').isDisabled())break;await page.locator('#gps-demo-next').tap();
  }
  assert.equal(await page.locator('.gps-snapped-dot').getAttribute('fill'),'none','adjusted ring does not hide the original reading');await page.screenshot({path:`test-results/gps/demo-${width}x${height}.png`});
  await page.locator('[data-map-target="lomo-vetado"]').tap();
  const controls=await page.locator('#gps-toggle').evaluate(e=>{const r=e.getBoundingClientRect(),p=e.closest('#gps-panel').getBoundingClientRect(),front=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return{height:r.height,inside:r.y>=p.y&&r.bottom<=p.bottom,reachable:front===e||e.contains(front)};});assert.ok(controls.height>=44&&controls.inside&&controls.reachable,JSON.stringify({width,height,controls}));await page.screenshot({path:`test-results/gps/sheet-${width}x${height}.png`});assert.deepEqual(errors,[]);await context.close();
 }
 // Normal entry creates GPS before filters move into the fullscreen map.
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),p=await ctx.newPage();
 await p.goto(base+(process.env.GPS_ENTRY||'/mapa-geografico.html')+'#parque=el-durazno');await p.waitForSelector('#map-card[data-ready="true"]');await p.locator('#open-map').tap();await p.locator('#gps-demo').tap();await p.locator('#gps-demo-pause').tap();await p.locator('#filter-toggle').tap();await p.waitForTimeout(200);
 assert.equal(await p.locator('.gps-raw-dot').evaluate(e=>{const r=e.getBoundingClientRect();return !!document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('.route-filters,.map-trails,.gps-panel');}),false,'paused demo repositions when filters expand after normal entry');
 await p.locator('#filter-toggle').tap();await p.locator('#map-options summary').tap();await p.locator('#show-context').uncheck();await p.waitForTimeout(200);
 assert.equal(await p.locator('.gps-raw-dot').evaluate(e=>{const r=e.getBoundingClientRect();return !!document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('.map-options,.gps-panel,.route-sheet');}),false,'GPS remains visible when the usable layers menu is expanded');await ctx.close();
 console.log('PASS 49 public positions visible without control overlap at390x844,844x390,320x740,667x375,320x568; hollow adjusted ring, reachable GPS button with trail sheet and paused-demo filter expansion');
}finally{await browser.close();}
