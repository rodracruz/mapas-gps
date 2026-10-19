import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const base=process.env.GEOGRAPHIC_BASE_URL||'http://127.0.0.1:4175';
const out=new URL('../test-results/all-sign/',import.meta.url);await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await page.goto(base+'/mapa-geografico.html#parque=el-durazno');await page.waitForSelector('#map-card[data-ready="true"]');
 assert.equal(await page.locator('#park-photo').count(),1,'photograph is on the principal park screen');
 await page.locator('#open-park-photo').tap();await page.waitForSelector('#sign-raster[href]');assert.equal(await page.locator('[data-sign-mode="photo"]').getAttribute('aria-pressed'),'true');await page.locator('#close-sign').tap();
 await page.locator('#open-sign').tap();await page.waitForSelector('#sign-dialog[data-ready="true"]');
 assert.equal(await page.locator('#sign-trails input').count(),20,'every legend trail can be toggled');assert.ok(await page.locator('.sign-route').count()>=20);
 assert.equal(await page.locator('#sign-svg').getAttribute('viewBox'),'0 0 2570 3077');
 await page.locator('[data-sign-mode="vectors"]').tap();assert.equal(await page.locator('#sign-raster').isVisible(),false);
 await page.locator('[data-sign-select="el-gringo"]').tap();assert.match(await page.locator('#sign-selection').textContent(),/El Gringo/);
 const before=await page.locator('#sign-svg').getAttribute('viewBox');await page.locator('#sign-zoom-in').tap();assert.notEqual(await page.locator('#sign-svg').getAttribute('viewBox'),before);
 await page.locator('[data-sign-visible="el-gringo"]').uncheck();assert.equal(await page.locator('.sign-route[data-trail="el-gringo"]:visible').count(),0);
 await page.locator('[data-sign-visible="el-gringo"]').check();await page.locator('#sign-fit').tap();await page.locator('[data-sign-mode="overlay"]').tap();await page.screenshot({path:new URL('all-trails-mobile.png',out).pathname});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.locator('#close-sign').tap();assert.equal(await page.locator('#sign-dialog[open]').count(),0);
 await page.locator('#open-map').tap();assert.equal(await page.locator('.leaflet-container').count(),1,'world map is preserved separately');assert.equal(await page.locator('iframe').count(),0);
 console.log('PASS principal photo, all20 vector trails, visibility, selection, zoom, source alignment and native map preservation');
}finally{await browser.close();}
