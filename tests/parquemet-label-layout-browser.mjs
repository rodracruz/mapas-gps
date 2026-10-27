import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {openMapControls,selectMapTrail} from './helpers/route-filter-control.mjs';
const base=process.env.GEOGRAPHIC_BASE_URL||'http://127.0.0.1:4210',entry=process.env.PARK_ENTRY||'/parquemet.html',out=process.env.LABEL_OUTPUT||'/workspace/artifacts/parquemet-label-layout';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}),results=[];
await mkdir(out,{recursive:true});
try{
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+entry+'#parque=parquemet&vista=mapa');await p.waitForSelector('#map-card[data-ready=true]');
 async function check(name,{allCyclists=false}={}){
  await p.waitForTimeout(160);
  const result=await p.evaluate(()=>{
   const overlaps=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
   const map=document.getElementById('geo-map').getBoundingClientRect(),visible=e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
   const selectors='#rider-map-banner,#rider-map-hud,#rider-map-controls,#gps-panel,#route-sheet,.map-toolbar,.leaflet-control-zoom,.leaflet-control-attribution,.map-notice';
   const controls=[...document.querySelectorAll(selectors)].filter(visible).map(e=>({id:e.id||e.className,rect:e.getBoundingClientRect()}));
   const labels=[...document.querySelectorAll('.cycling-label button,.shared-label button,.avenue-label button')].filter(visible).map(e=>{const rect=e.getBoundingClientRect(),front=document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2);return{name:e.textContent,cycling:e.closest('.cycling-label')!==null,rect:rect.toJSON(),blocked:controls.filter(c=>overlaps(rect,c.rect)).map(c=>c.id),reachable:front===e||e.contains(front),inside:rect.left>=map.left&&rect.right<=map.right&&rect.top>=map.top&&rect.bottom<=map.bottom};});
   return {labels,collisions:labels.flatMap((a,i)=>labels.slice(i+1).filter(b=>overlaps(a.rect,b.rect)).map(b=>[a.name,b.name])),width:innerWidth,height:innerHeight};
  });
  results.push({name,...result});await p.screenshot({path:out+'/'+name+'.png'});await writeFile(out+'/measurements.json',JSON.stringify(results,null,2));
  if(allCyclists)assert.equal(result.labels.filter(l=>l.cycling).length,8,'all eight cyclist names fit in the default390px overview');
  for(const label of result.labels){assert.deepEqual(label.blocked,[],name+': '+label.name+' overlaps '+label.blocked.join(','));assert.ok(label.reachable&&label.inside,name+': '+label.name+' must be tappable inside the map');}
  assert.deepEqual(result.collisions,[],name+': labels must not collide');
 }
 await check('overview-390',{allCyclists:true});
 await p.getByRole('button',{name:'Ver Anfiteatro',exact:true}).tap();assert.equal(await p.locator('#sheet-title').innerText(),'Anfiteatro');await check('selected-390');assert.equal(await p.getByRole('button',{name:'Ver Anfiteatro',exact:true}).isVisible(),true,'selected callout remains visible when a narrow valid slot exists');await p.locator('#close-sheet').tap();
 for(const [width,height]of [[320,568],[844,390],[390,844]]){await p.setViewportSize({width,height});await check('rotated-'+width+'x'+height);}
 await openMapControls(p);await check('drawer-open');await p.locator('#rider-map-more').tap();await check('drawer-closed');
 await openMapControls(p);await p.locator('#filter-toggle').tap();await p.locator('#filter-type').selectOption('avenue');await p.locator('#filter-toggle').tap();await p.locator('#rider-map-more').tap();await check('avenue-filter');
 assert.deepEqual(errors,[]);console.log('PASS Parquemet label placement respects actual mobile controls, rotation, selected trail, drawer and filters');await ctx.close();
}finally{await browser.close();}
