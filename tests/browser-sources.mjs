import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const base=process.env.REVIEW_BASE_URL||'http://127.0.0.1:4173';
const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{
 const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'/revision.html');await p.waitForSelector('#stage[aria-busy="false"]');
 assert.equal(await p.locator('#image-source').count(),1,'source selector is missing');
 assert.equal(await p.locator('#image-source').inputValue(),'official');
 assert.match(await p.locator('#image-source-info').textContent(),/1800 × 2200/);
 const before=await p.locator('.route').first().getAttribute('points');
 await p.locator('#zoom-in').click();const view=await p.locator('#map').getAttribute('viewBox');
 await p.locator('#image-source').selectOption('original');await p.waitForFunction(()=>document.querySelector('#stage').dataset.imageSource==='original');
 assert.match(await p.locator('#image-source-info').textContent(),/900 × 1100/);assert.equal(await p.locator('#map').getAttribute('viewBox'),view);assert.equal(await p.locator('.route').first().getAttribute('points'),before);
 await p.locator('#image-source').selectOption('official');await p.waitForFunction(()=>document.querySelector('#stage').dataset.imageSource==='official');
 const matrices=await p.evaluate(()=>[document.querySelector('#original'),document.querySelector('.route')].map(n=>{const a=n.getScreenCTM();return [a.a,a.b,a.c,a.d,a.e,a.f];}));assert.deepEqual(matrices[0],matrices[1]);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 // A failed source switch must keep the previous verified source and geometry.
 const ctx=await b.newContext();const err=await ctx.newPage();await err.route('**/elh-durazno.jpg',r=>r.fulfill({status:404,body:'missing'}));await err.goto(base+'/revision.html');await err.waitForSelector('#stage[aria-busy="false"]');await err.locator('#image-source').selectOption('original');await err.waitForSelector('#source-error:not([hidden])');assert.equal(await err.locator('#stage').getAttribute('data-image-source'),'official');assert.equal(await err.locator('#image-source').inputValue(),'official');assert.equal(await err.locator('.route').count(),9);await ctx.close();
 assert.deepEqual(errors,[]);console.log('PASS high-resolution source default, switching, frame preservation, mobile layout and failed-switch recovery');
}finally{await b.close();}
