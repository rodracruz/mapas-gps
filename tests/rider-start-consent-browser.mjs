import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.RIDER_BASE_URL||'http://127.0.0.1:4198',out=process.env.RIDER_CONSENT_OUT||'test-results/rider-start-consent';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}),evidence=[],failures=[];
try{
 for(const scenario of ['stop','demo','demo-off','off-demo-off','navigation','control-gps','control-off']){
  const ctx=await browser.newContext({serviceWorkers:'block',viewport:{width:390,height:844}}),page=await ctx.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await ctx.addInitScript(()=>{window.watchCount=0;window.clearCount=0;navigator.geolocation.watchPosition=()=>++window.watchCount;navigator.geolocation.clearWatch=()=>++window.clearCount;});
  try{
   await page.goto(`${base}/mapa-geografico.html#parque=el-durazno&vista=mapa`);await page.waitForSelector('body[data-rider-ready=true]');await page.waitForSelector('#map-card[data-ready=true]');
   const fromOff=['off-demo-off','control-off'].includes(scenario),cancelled=!scenario.startsWith('control');
   if(!fromOff)await page.locator('#gps-toggle').click();
   // A real read/write transaction holds recovery behind queued reads. No clock
   // delay decides whether the request has acquired its native ownership lock.
   await page.evaluate(()=>new Promise((resolve,reject)=>{
    const request=indexedDB.open('bikeride-local-v1');request.onerror=()=>reject(request.error);request.onsuccess=()=>{
     const db=request.result,tx=db.transaction('state','readwrite'),store=tx.objectStore('state');window.blockRecovery=true;
     window.blockerDone=new Promise(done=>{tx.oncomplete=()=>{db.close();done();};});
     const pump=()=>{const read=store.get('current');read.onsuccess=()=>{resolve();if(window.blockRecovery)pump();};};pump();
    };
   }));
   await page.locator('#rider-record-start').click();await page.waitForFunction(async()=>{const locks=await navigator.locks.query();return locks.held.some(lock=>lock.name==='bikeride-local-v1:recording');});
   assert.equal(await page.locator('#rider-record-pause').isVisible(),false,'no recorder before recovery commits');
   if(scenario==='stop')await page.locator('#gps-toggle').click();
   if(scenario.includes('demo')){await page.locator('#gps-demo').click();if(scenario.endsWith('-off'))await page.locator('#gps-demo').click();}
   if(scenario==='navigation')await page.locator('#bikeride-profile').click();
   const before=await page.evaluate(()=>({mode:document.querySelector('#gps-panel').dataset.mode,watches:window.watchCount,clears:window.clearCount}));
   await page.evaluate(async()=>{window.blockRecovery=false;await window.blockerDone;});
   // The start's finally block restores either the ready start action, or a
   // visible recording action. Demo intentionally keeps start disabled.
   await page.waitForFunction(()=>!document.querySelector('#rider-record-pause').hidden||(!document.querySelector('#rider-record-start').disabled)||document.querySelector('#gps-panel').dataset.mode==='demo');
   if(cancelled)await page.waitForFunction(async()=>{const locks=await navigator.locks.query();return !locks.held.some(lock=>lock.name==='bikeride-local-v1:recording');},{},{timeout:3000}).catch(()=>{});
   const after=await page.evaluate(async()=>{
    const {openRiderStore}=await import('/rider/store.mjs'),store=await openRiderStore();const state=await store.read();store.close();
    return {mode:document.querySelector('#gps-panel').dataset.mode,watches:window.watchCount,clears:window.clearCount,activities:state.activities,recording:document.querySelector('#rider-record-state').textContent,locks:(await navigator.locks.query()).held.map(lock=>lock.name)};
   });
   evidence.push({scenario,before,after});await page.screenshot({path:`${out}/${scenario}.png`});
   if(cancelled){
    assert.equal(after.watches,before.watches,scenario+': revoked consent must not start another native watch');assert.equal(after.mode,before.mode,scenario+': preserve the later user mode');assert.deepEqual(after.activities,[],scenario+': canceled request must not create an activity');assert.ok(!after.locks.includes('bikeride-local-v1:recording'),'canceled start must release ownership');assert.equal(after.recording,'Sin grabación');
   }else{
    assert.equal(after.watches,1);assert.equal(after.mode,'gps');assert.equal(after.activities.length,1);assert.equal(after.activities[0].status,'recording');
    await page.locator('#rider-record-finish').click();await page.waitForFunction(()=>!document.querySelector('#rider-record-start').disabled);
   }
   assert.deepEqual(errors,[]);console.log('PASS pending start consent',scenario);
  }catch(error){failures.push({scenario,error:error.message});console.log('FAIL pending start consent',scenario,error.message);}
  finally{await ctx.close();}
 }
}finally{await browser.close();await writeFile(`${out}/evidence.json`,JSON.stringify({failures,evidence},null,2));}
assert.deepEqual(failures,[]);
