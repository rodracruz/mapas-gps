// The full provider attribution must fit the map, not be clipped by its card.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.GEOGRAPHIC_BASE_URL||'http://127.0.0.1:4187';
const bundled=process.env.ATTRIBUTION_BUNDLE==='1';
const out=new URL('../test-results/attribution/',import.meta.url);await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox'],proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined});
const checks=[];
async function readable(page,preview){
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const value=await page.locator('.leaflet-control-attribution').evaluate(node=>{
  const r=n=>n.getBoundingClientRect().toJSON(),map=r(document.getElementById('geo-map')),bounds=r(node),texts=[],walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){if(!walker.currentNode.textContent.trim())continue;const range=document.createRange();range.selectNodeContents(walker.currentNode);texts.push(...[...range.getClientRects()].map(x=>x.toJSON()));}
  const caption=document.querySelector('.map-caption'),badge=document.querySelector('.bikeride-map-badges'),nav=document.getElementById('bikeride-navigation');
  return {map,bounds,texts,scrollWidth:node.scrollWidth,clientWidth:node.clientWidth,font:Number.parseFloat(getComputedStyle(node).fontSize),text:node.textContent,caption:r(caption),badge:r(badge),nav:nav.getClientRects().length?r(nav):null};
 });
 assert.ok(value.font>=9,'Attribution remains legible');
 assert.ok(value.scrollWidth<=value.clientWidth+1,'Attribution cannot overflow its own box');
 for(const r of value.texts)assert.ok(r.left>=value.map.left&&r.right<=value.map.right+1&&r.top>=value.map.top&&r.bottom<=value.map.bottom+1,'Every attribution text fragment remains inside the map');
 assert.match(value.text,/OpenStreetMap contributors/);
 if(preview){assert.ok(value.caption.bottom+4<=value.bounds.top,'Caption and Layers button leave space for the attribution');assert.ok(value.badge.bottom+3<=value.caption.top,'Source badges do not cover the caption');if(value.nav)assert.ok(value.bounds.bottom<=value.nav.top,'Bottom navigation does not cover the attribution');}
 return value;
}
try{
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),p=await ctx.newPage();
 await p.route(base+'/**',async route=>{const r=await fetch(route.request().url());await route.fulfill({status:r.status,headers:Object.fromEntries(r.headers),body:Buffer.from(await r.arrayBuffer())});});
 for(const [park,entry]of [['el-durazno','mapa-geografico.html'],['parquemet','parquemet.html']]){
  await p.goto(base+'/'+(bundled?(park==='el-durazno'?'dist/index.html':'dist/parquemet.html'):entry)+'#parque='+park);await p.waitForSelector('#map-card[data-ready=true]');await p.evaluate(()=>document.fonts.ready);
  for(const width of [320,390,544]){
   await p.setViewportSize({width,height:width===390?595:width===544?830:844});await p.evaluate(()=>scrollTo(0,0));const preview=await readable(p,true);if(park==='el-durazno')assert.match(preview.text,/Cartel © Outlife · ubicación aproximada/);
   await p.screenshot({path:new URL(park+'-'+width+'-preview.png',out).pathname});
   await p.locator('#bikeride-map').click();await p.waitForSelector('#map-card.fullscreen');await readable(p,false);assert.equal(await p.locator('#close-map').isVisible(),true);assert.equal(await p.locator('#gps-toggle').isVisible(),true);await p.screenshot({path:new URL(park+'-'+width+'-full.png',out).pathname});
   if(park==='el-durazno'){await p.locator('#map-source-osm').click();await readable(p,false);}
   await p.locator('#close-map').click();await p.waitForSelector('#map-card:not(.fullscreen)');await readable(p,true);
   if(park==='el-durazno'){await p.locator('#bikeride-map').click();await p.locator('#map-source-cartel').click();await p.locator('#close-map').click();}
   checks.push(park+' '+width+'px: full source text, reserved preview space, full map and source changes');
  }
 }
 await writeFile(new URL('verification.json',out),JSON.stringify({bundled,checks},null,2)+'\n');console.log(JSON.stringify({bundled,checks}));await ctx.close();
}finally{await browser.close();}
