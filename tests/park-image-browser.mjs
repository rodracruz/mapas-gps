import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const base=process.env.GEOGRAPHIC_BASE_URL||'http://127.0.0.1:4175';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{
 const p=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await p.goto(base+'/dist/mapas-gps-parques.html#parque=el-durazno');await p.waitForFunction(()=>document.querySelector('#park-photo').complete);
 assert.deepEqual(await p.locator('#park-photo').evaluate(n=>[n.naturalWidth,n.naturalHeight]),[2570,3077],'main map uses the high-resolution source instead of the small uploaded photo');
 for(const width of [320,390,768]){await p.setViewportSize({width,height:844});const crop=await p.locator('.park-photo-frame').evaluate(frame=>{const image=frame.querySelector('img'),f=frame.getBoundingClientRect(),i=image.getBoundingClientRect(),s=i.width/image.naturalWidth;return {native:[(f.x-i.x)/s,(f.y-i.y)/s,f.width/s,f.height/s],width:f.width};});assert.ok(crop.width>=width*.85);for(const [i,v]of [580,0,1990,2500].entries())assert.ok(Math.abs(crop.native[i]-v)<2,'focus region preserves the complete drawn map');assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);}
 await p.setViewportSize({width:390,height:844});await p.locator('#open-park-photo').tap();await p.waitForSelector('#sign-raster[href]');assert.equal(await p.locator('[data-sign-mode="photo"]').getAttribute('aria-pressed'),'true');assert.equal(await p.locator('#sign-paths').isVisible(),false);const before=await p.locator('#sign-svg').getAttribute('viewBox');await p.locator('#sign-zoom-in').tap();assert.notEqual(await p.locator('#sign-svg').getAttribute('viewBox'),before);await p.locator('#close-sign').tap();
 await p.locator('#open-original-photo').tap();await p.waitForFunction(()=>document.querySelector('#park-original-photo').naturalWidth===960);assert.equal(await p.locator('#park-original-photo').evaluate(n=>n.naturalHeight),1280);await p.locator('#close-park-photo').tap();
 await mkdir('test-results/park-image',{recursive:true});await p.screenshot({path:'test-results/park-image/high-resolution-mobile.png',fullPage:false});console.log('PASS high-resolution source, native map framing at 320/390/768px, map enlargement/zoom and unchanged private original');
}finally{await browser.close();}
