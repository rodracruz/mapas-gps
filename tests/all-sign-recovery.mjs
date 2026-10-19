import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const base=process.env.GEOGRAPHIC_BASE_URL||'http://127.0.0.1:4175';
const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{
 const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await p.route('**/sources/el-durazno-official-2022.jpg',r=>r.abort());
 await p.goto(base+'/mapa-geografico.html#parque=el-durazno');await p.waitForSelector('#map-card[data-ready="true"]');await p.locator('#open-sign').tap();await p.waitForSelector('#sign-retry-source:not([hidden])');
 assert.equal(await p.locator('[data-sign-mode="photo"]').isDisabled(),true);assert.equal(await p.locator('#sign-paths').isVisible(),true);assert.equal(await p.locator('#sign-trails input').count(),20);
 await p.unroute('**/sources/el-durazno-official-2022.jpg');await p.locator('#sign-retry-source').tap();await p.waitForSelector('#sign-raster[href]');assert.equal(await p.locator('[data-sign-mode="photo"]').isDisabled(),false);
 await p.locator('[data-sign-mode="photo"]').tap();assert.equal(await p.locator('#sign-raster').isVisible(),true);assert.equal(await p.locator('#sign-paths').isVisible(),false);
 assert.equal(await p.locator('#sign-trails input').count(),20,'retry does not duplicate paths or controls');
 console.log('PASS unavailable image keeps vectors visible and successfully retries verified raster');
}finally{await b.close();}
