import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.GEOGRAPHIC_BASE_URL||'http://127.0.0.1:4175';
const sourceBase=process.env.GEOGRAPHIC_SOURCE_BASE_URL||base;
const output=process.env.PARK_IMAGE_OUT||'test-results/park-image';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const evidence=[];
await mkdir(output,{recursive:true});
try{
 for(const [label,origin,entry,park,original]of [
  ['private-el-durazno',base,'/dist/mapas-gps-parques.html','el-durazno',true],
  ['private-parquemet',base,'/dist/parquemet.html','parquemet',false],
  ['source-el-durazno',sourceBase,'/mapa-geografico.html','el-durazno',false],
  ['source-parquemet',sourceBase,'/parquemet.html','parquemet',false]
 ]){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'}),p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(origin+entry+'#parque='+park);await p.waitForSelector('#map-card[data-ready=true]');await p.waitForFunction(()=>document.querySelector('#park-photo').complete&&document.querySelector('#park-photo').naturalWidth>0);
  const natural=park==='el-durazno'?[2570,3077]:[6690,2835];
  // The published bikeride layout uses a compact thumbnail inside a full-width
  // source card. Preserve its dimensions and open the full source with real taps.
  const centerControl=async selector=>{
   await p.locator(selector).evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
   assert.equal(await p.locator(selector).evaluate(e=>{const r=e.getBoundingClientRect(),front=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return e===front||e.contains(front);}),true,'Source control is unobstructed: '+label+' '+selector);
  };
  for(const width of [320,390,768]){
   await p.setViewportSize({width,height:844});
   const source=await p.locator('.park-photo-card').evaluate(card=>{
    const c=card.getBoundingClientRect(),button=card.querySelector('#open-park-photo'),b=button.getBoundingClientRect(),image=card.querySelector('#park-photo');
    return {cardWidth:c.width,button:[b.width,b.height],natural:[image.naturalWidth,image.naturalHeight]};
   });
   assert.ok(source.cardWidth>=width*.85,'The original-source card spans the content');
   assert.ok(source.button.every(size=>size>=44),'The source-map control remains touchable');
   assert.deepEqual(source.button,[84,80],'The existing thumbnail layout is preserved');
   assert.deepEqual(source.natural,natural,'The thumbnail retains the high-resolution original');
   assert.equal(await p.locator('.park-photo-frame').isVisible(),true);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   await centerControl('#open-park-photo');
   if(park==='el-durazno'){
    const arrow=await p.locator('#open-sign>span').evaluate(el=>{const a=el.getBoundingClientRect(),b=el.parentElement.getBoundingClientRect();return {position:getComputedStyle(el).position,inside:a.left>=b.left&&a.right<=b.right&&a.top>=b.top&&a.bottom<=b.bottom,width:a.width,parentWidth:b.width};});
    assert.equal(arrow.position,'static','The inline arrow must not become a page overlay');assert.equal(arrow.inside,true,'The arrow stays inside its own button');assert.ok(arrow.width<arrow.parentWidth);
    evidence.push({label,width,source,arrow});
   }else evidence.push({label,width,source});
   await p.screenshot({path:`${output}/${label}-${width}-source-card.png`});
   await p.locator('#open-park-photo').tap();
   if(park==='el-durazno'){
    await p.waitForSelector('#sign-raster[href]');assert.equal(await p.locator('[data-sign-mode="photo"]').getAttribute('aria-pressed'),'true');assert.equal(await p.locator('#sign-paths').isVisible(),false);
    const before=await p.locator('#sign-svg').getAttribute('viewBox');await p.locator('#sign-zoom-in').tap();assert.notEqual(await p.locator('#sign-svg').getAttribute('viewBox'),before);await p.locator('#close-sign').tap();
    await centerControl('#open-sign');await p.locator('#open-sign').tap();await p.waitForSelector('#sign-dialog[open]');assert.equal(await p.locator('[data-sign-mode="overlay"]').getAttribute('aria-pressed'),'true');await p.locator('#close-sign').tap();
   }else{
    await p.waitForSelector('#official-dialog[open]');await p.waitForFunction(()=>document.querySelector('#document-status').textContent.includes('zoom'));assert.equal(await p.locator('[data-document-mode="photo"]').getAttribute('aria-pressed'),'true');
    const before=await p.locator('#document-svg').getAttribute('viewBox');await p.locator('#document-in').tap();assert.notEqual(await p.locator('#document-svg').getAttribute('viewBox'),before);await p.locator('#official-close').tap();
   }
   if(original){
    await centerControl('#open-original-photo');await p.locator('#open-original-photo').tap();await p.waitForFunction(()=>document.querySelector('#park-original-photo').naturalWidth===960);assert.equal(await p.locator('#park-original-photo').evaluate(n=>n.naturalHeight),1280);await p.locator('#close-park-photo').tap();
   }
   console.log('PASS',label,width+'px: unobstructed real source tap, original dimensions, unchanged thumbnail/card, map enlargement and zoom'+(original?', private960x1280 preserved':''));
  }
  assert.deepEqual(errors,[]);await context.close();
 }
 console.log('PASS both parks in source and private bundles at320/390/768: actual source/arrow taps, enlargement/zoom and preserved private original');
}finally{await browser.close();await writeFile(output+'/verification.json',JSON.stringify(evidence,null,2));}
