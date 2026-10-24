import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,readFile} from 'node:fs/promises';
const base=process.env.GEOGRAPHIC_BASE_URL||'http://127.0.0.1:4178',entry=process.env.PREVIEW_ENTRY||'/mapa-geografico.html';
const data=JSON.parse(await readFile('data/el-durazno/continuous-sign-trails.json')),catalog=JSON.parse(await readFile('data/el-durazno/geographic-catalog.json'));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox'],proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined});
let ctx;
try{
 ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route(base+'/**',async route=>{try{const r=await fetch(route.request().url());await route.fulfill({status:r.status,headers:Object.fromEntries(r.headers),body:Buffer.from(await r.arrayBuffer())});}catch{await route.abort();}});
 await page.goto(base+entry+'#parque=el-durazno');await page.waitForSelector('#map-card[data-ready="true"]');await page.waitForSelector('.trail-miniature');
 assert.equal(await page.locator('.trail-miniature').count(),20);assert.equal(await page.locator('.trail-official-preview').count(),20);
 for(const t of catalog.targets.filter(t=>t.visualTrailId)){
  const figure=page.locator(`[data-trail-details="${t.id}"] .trail-official-preview`),expected=data.routePaths.filter(p=>p.trailId===t.visualTrailId).map(p=>p.d);
  assert.deepEqual(await figure.locator('path').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('d'))),expected,t.id+' preserves the exact official curves');assert.equal(await figure.locator('image').count(),0);
 }
 assert.equal(await page.locator('[data-trail-details="subida-buitrera"] .trail-official-preview').count(),0);
 assert.match(await page.locator('.trail-preview-unavailable').textContent(),/aún no tiene un trazado específico/);
 const sizes=await page.locator('.tile-face').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().height));assert.ok(sizes.every(h=>h===176));
 const layout=await page.locator('.has-trail-miniature').evaluateAll(nodes=>nodes.map(n=>{const title=n.querySelector('h3').getBoundingClientRect(),mini=n.querySelector('.trail-miniature').getBoundingClientRect();return {name:n.dataset.trailSummary,separate:title.right<=mini.left+1};}));assert.ok(layout.every(n=>n.separate),JSON.stringify(layout));
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.locator('[data-trail-summary="la-virgen"]').tap();await mkdir('test-results/trail-previews',{recursive:true});await page.screenshot({path:'test-results/trail-previews/el-durazno-expanded-mobile.png'});
 await page.locator('[data-trail-details="la-virgen"] .trail-preview-open').tap();await page.waitForSelector('#sign-dialog[open][data-ready=true]');await page.waitForFunction(()=>document.querySelector('[data-sign-mode="vectors"]').getAttribute('aria-pressed')==='true');assert.equal(await page.locator('[data-sign-select="la-virgen"]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('#sign-raster').getAttribute('hidden'),'');
 await page.locator('#close-sign').tap();await page.locator('[data-trail-summary="la-virgen"]').tap();await page.locator('[data-trail-summary="chilling"]').scrollIntoViewIfNeeded();await page.screenshot({path:'test-results/trail-previews/el-durazno-cards-mobile.png'});
 await page.setViewportSize({width:320,height:740});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);const small=await page.locator('.tile-face').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().height));assert.ok(small.every(h=>h===176));
 assert.deepEqual(errors,[]);console.log('PASS20 exact official route previews, no invented Buitrera illustration, fixed176px cards, mobile390/320 layout and selected vector enlargement');
}finally{if(ctx){await ctx.unrouteAll({behavior:'wait'});await ctx.close();}await browser.close();}
