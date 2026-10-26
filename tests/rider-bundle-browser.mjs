import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const base=process.env.RIDER_BUNDLE_URL||'http://127.0.0.1:4193/dist';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{
 for(const [entry,park,count]of [['index.html','el-durazno',21],['parquemet.html','parquemet',26]]){
  const ctx=await browser.newContext({serviceWorkers:'block'}),page=await ctx.newPage(),errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/\.mjs(?:\?|$)|fonts\.google|tailwind|cdn\./.test(r.url()))external.push(r.url());});
  await ctx.addInitScript(()=>{window.watchCount=0;navigator.geolocation.watchPosition=()=>++window.watchCount;navigator.geolocation.clearWatch=()=>{};});
  await page.goto(`${base}/${entry}#parque=${park}&vista=rutas`);await page.waitForSelector('body[data-rider-ready=true]');await page.waitForSelector('#map-card[data-ready=true]',{state:'attached'});assert.equal(await page.locator('.rider-route-card').count(),count);
  await page.locator('#bikeride-profile').click();await page.locator('#rider-edit-profile').click();await page.locator('#rider-profile-name').fill('Prueba autónoma');await page.locator('#rider-profile-form button').click();await page.waitForFunction(()=>!document.querySelector('#rider-editor').open);
  await page.locator('#bikeride-meetups').click();await page.locator('[data-rider-action=new-meetup]').click();await page.locator('#rider-meetup-title').fill('Agenda autónoma');await page.locator('#rider-meetup-start').fill('2026-11-02T10:00');await page.locator('#rider-meetup-form button[type=submit]').click();await page.waitForSelector('[data-meetup-export]');const ics=page.waitForEvent('download');await page.locator('[data-meetup-export]').click();assert.match((await ics).suggestedFilename(),/\.ics$/);
  await page.locator('#bikeride-map').click();await page.locator('#rider-record-start').click();await page.waitForFunction(()=>!document.querySelector('#rider-record-pause').hidden,{},{timeout:3000});await page.locator('#rider-record-pause').click();await page.waitForFunction(()=>!document.querySelector('#rider-record-resume').hidden);await page.locator('#rider-record-finish').click();await page.waitForFunction(()=>!document.querySelector('#rider-record-start').hidden);
  const result=await page.evaluate(async()=>{const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('bikeride-local-v1');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});const state=await new Promise((resolve,reject)=>{const r=db.transaction('state').objectStore('state').get('current');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});db.close();return state;});assert.equal(result.profile.name,'Prueba autónoma');assert.equal(result.activities[0].status,'finished');assert.equal(result.meetups.length,1);assert.deepEqual(errors,[]);assert.deepEqual(external,[]);await ctx.close();
 }
 console.log('PASS both standalone bundles: embedded modules/fonts, 47 cards, profile/agenda/ICS and recording/pause/finish persistence with no module/CDN requests');
}finally{await browser.close();}
