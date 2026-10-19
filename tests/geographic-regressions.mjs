import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const base=process.env.GEOGRAPHIC_BASE_URL||'http://127.0.0.1:4174';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox'],proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined});
const failures=[];
const check=async(name,fn)=>{try{await fn();console.log('PASS',name);}catch(e){failures.push(name+': '+e.message);console.log('FAIL',name,e.message);}};
try{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await context.newPage();
 await page.route(base+'/**',async route=>{const r=await fetch(route.request().url());await route.fulfill({status:r.status,headers:Object.fromEntries(r.headers),body:Buffer.from(await r.arrayBuffer())});});
 await page.goto(base+'/mapa-geografico.html#parque=el-durazno&mapa=1&fuente=osm');await page.waitForSelector('#map-card[data-ready="true"]');await page.locator('[data-map-target="lomo-vetado"]').tap();await page.waitForTimeout(200);
 await check('selected trail keeps attribution unobstructed',async()=>{
  const visible=await page.locator('#map-card a[href="https://www.openstreetmap.org/copyright"]').evaluateAll(nodes=>nodes.some(node=>{const r=node.getBoundingClientRect(),front=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return r.width>0&&r.height>0&&(node===front||node.contains(front));}));assert.equal(visible,true,'a visible attribution link must remain unobstructed by route sheet');
 });
 await check('landscape fit reserves lateral sheet width instead of its height',async()=>{
  await page.setViewportSize({width:844,height:390});await page.waitForTimeout(200);await page.locator('#fit-selected').tap();await page.waitForTimeout(200);const [lat,lon,zoom]=(await page.locator('#geo-map').getAttribute('data-view')).split(',').map(Number);assert.ok(zoom>=12&&lat>-33.34&&lat<-33.27&&lon>-70.53&&lon<-70.47,JSON.stringify({lat,lon,zoom}));
 });
 await check('standalone logo and review links resolve to executable app pages',async()=>{
  await page.goto(base+'/dist/mapas-gps-parques.html#parque=el-durazno');await page.waitForSelector('#map-card[data-ready="true"]');const reviewHref=await page.locator('.park-sources a').last().getAttribute('href');const status=(await fetch(new URL(reviewHref,page.url()))).status;
  await page.locator('.brand').click();assert.deepEqual({brandPath:new URL(page.url()).pathname,reviewStatus:status},{brandPath:'/dist/mapas-gps-parques.html',reviewStatus:200});assert.equal(await page.locator('#park-picker').isVisible(),true);
 });await context.close();
}finally{await browser.close();}
assert.deepEqual(failures,[]);console.log('3 review regression checks passed');
