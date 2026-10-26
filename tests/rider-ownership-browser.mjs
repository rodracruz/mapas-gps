import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const base=process.env.RIDER_BASE_URL||'http://127.0.0.1:4198',out=process.env.RIDER_OWNERSHIP_OUT||'test-results/rider-ownership';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const ready=async p=>{await p.waitForSelector('body[data-rider-ready=true]');await p.waitForSelector('#map-card[data-ready=true]',{state:'attached'});};
const read=p=>p.evaluate(async()=>{const {openRiderStore}=await import('/rider/store.mjs');const s=await openRiderStore();try{return await s.read();}finally{s.close();}});
const open=async(ctx,view='mapa',park='el-durazno')=>{const p=await ctx.newPage();await p.goto(`${base}/${park==='parquemet'?'parquemet.html':'mapa-geografico.html'}#parque=${park}&vista=${view}`);await ready(p);return p;};
const errors=[];
try{
 const ctx=await browser.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
 ctx.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));
 await ctx.addInitScript(()=>{window.watchCount=0;window.pagehideHandlers=[];const add=window.addEventListener.bind(window);window.addEventListener=(type,fn,...args)=>{if(type==='pagehide')window.pagehideHandlers.push(fn);return add(type,fn,...args);};navigator.geolocation.watchPosition=fn=>{window.fixCallback=fn;return ++window.watchCount;};navigator.geolocation.clearWatch=()=>{};});
 const a=await open(ctx);await a.locator('#rider-record-start').click();await a.waitForFunction(()=>!document.querySelector('#rider-record-pause').hidden);
 const b=await open(ctx,'perfil','parquemet');await b.locator('[data-profile-tab=history]').click();
 assert.equal((await read(b)).activities[0].status,'recording','opening a second tab must not interrupt its live owner');
 assert.equal(await b.locator('[data-activity-delete]').isDisabled(),true);
 console.log('PASS live owner survives second-tab Profile boot');
 await a.locator('#rider-record-pause').click();await a.waitForFunction(()=>!document.querySelector('#rider-record-resume').hidden);await b.reload();await ready(b);await b.locator('[data-profile-tab=history]').click();assert.equal((await read(b)).activities[0].status,'paused');assert.equal(await b.locator('[data-activity-delete]').isDisabled(),true);
 await b.locator('[data-activity-delete]').evaluate(button=>button.onclick());assert.equal((await read(b)).activities.length,1,'transaction guard refuses deletion of an active record');
 await a.screenshot({path:`${out}/owner-paused.png`});
 await b.locator('#bikeride-map').click();await b.locator('#rider-record-start').click();await b.waitForFunction(()=>document.querySelector('#rider-message').textContent.includes('otra pestaña'));
 assert.equal(await b.evaluate(()=>window.watchCount),0,'contender does not start native GPS');assert.equal((await read(b)).activities.length,1);await b.screenshot({path:`${out}/contender.png`});
 console.log('PASS paused owner, transactional delete refusal and competing start');
 await a.locator('#rider-record-finish').click();await a.waitForFunction(()=>!document.querySelector('#rider-record-start').hidden);await b.locator('#rider-record-start').click();await b.waitForFunction(()=>!document.querySelector('#rider-record-pause').hidden);assert.equal((await read(b)).activities.filter(x=>x.status==='recording').length,1);
 console.log('PASS already-open contender can start after release');

 await b.evaluate(()=>window.fixCallback({coords:{latitude:-33.305,longitude:-70.498,accuracy:5,speed:0},timestamp:Date.now()}));
 await b.locator('#rider-record-pause').click();await b.waitForFunction(()=>!document.querySelector('#rider-record-resume').hidden);
 const abandoned=(await read(b)).activities.find(x=>x.status==='paused');assert.equal(abandoned.segments[0].length,1);
 // Omit pagehide finalization to model process death after a confirmed checkpoint.
 await b.evaluate(()=>window.pagehideHandlers.forEach(fn=>window.removeEventListener('pagehide',fn)));await b.close();
 await a.locator('#rider-record-start').click();await a.waitForFunction(()=>!document.querySelector('#rider-record-pause').hidden);
 const recovered=(await read(a)).activities.find(x=>x.id===abandoned.id);assert.equal(recovered.status,'interrupted');assert.deepEqual(recovered.segments,abandoned.segments);
 console.log('PASS already-open survivor recovers abandoned paused trace before claiming a new recording');
 await a.evaluate(()=>window.fixCallback({coords:{latitude:-33.305,longitude:-70.498,accuracy:5,speed:0},timestamp:Date.now()}));await a.locator('#rider-record-pause').click();await a.waitForFunction(()=>!document.querySelector('#rider-record-resume').hidden);
 const crashed=(await read(a)).activities.find(x=>x.status==='paused');await a.evaluate(()=>window.pagehideHandlers.forEach(fn=>window.removeEventListener('pagehide',fn)));await a.close();
 const c=await open(ctx,'perfil');assert.equal(await c.evaluate(()=>window.watchCount),0);const after=(await read(c)).activities.find(x=>x.id===crashed.id);assert.equal(after.status,'interrupted');assert.deepEqual(after.segments,crashed.segments);
 console.log('PASS destination recovers committed trace without restarting GPS');
 await c.locator('[data-profile-tab=history]').click();await c.locator(`[data-activity-id="${crashed.id}"] [data-activity-delete]`).click();await c.waitForFunction(id=>!document.querySelector(`[data-activity-id="${id}"]`),crashed.id);assert.ok(!(await read(c)).activities.some(x=>x.id===crashed.id));

 await c.locator('#bikeride-map').click();await c.locator('#rider-record-start').click();await c.waitForFunction(()=>!document.querySelector('#rider-record-pause').hidden);
 const thief=await open(ctx,'perfil');await thief.evaluate(async()=>{const {recordingLockName}=await import('/rider/ownership.mjs');window.steal=navigator.locks.request(recordingLockName,{steal:true},()=>new Promise(resolve=>{window.unlockStolen=resolve;}));});await thief.waitForFunction(()=>!!window.unlockStolen);
 await c.waitForFunction(()=>document.querySelector('#rider-record-pause').hidden&&document.querySelector('#rider-record-start').disabled);assert.match(await c.locator('#rider-message').innerText(),/registro se detuvo/);await c.screenshot({path:`${out}/ownership-lost.png`});await thief.evaluate(async()=>{unlockStolen();await steal;});
 console.log('PASS revoked native ownership stops recording and shows an honest error');
 await ctx.close();

 // Simultaneous user starts in separate documents must produce one owner/watch.
 const simultaneous=await browser.newContext({serviceWorkers:'block'});
 await simultaneous.addInitScript(()=>{window.watchCount=0;navigator.geolocation.watchPosition=()=>++window.watchCount;navigator.geolocation.clearWatch=()=>{};});
 const first=await open(simultaneous),second=await open(simultaneous,'mapa','parquemet');
 await Promise.all([first.locator('#rider-record-start').click(),second.locator('#rider-record-start').click()]);
 for(const p of [first,second])await p.waitForFunction(()=>!document.querySelector('#rider-record-pause').hidden||document.querySelector('#rider-message').textContent.includes('otra pestaña'));
 assert.equal((await read(first)).activities.length,1);assert.equal((await read(first)).activities[0].status,'recording');assert.equal((await first.evaluate(()=>window.watchCount))+(await second.evaluate(()=>window.watchCount)),1);await simultaneous.close();
 console.log('PASS simultaneous cross-park starts create one recorder and one native watch');

 // Exercise real native lock lifetime against a deliberately queued real IDB
 // checkpoint/finish. No timer decides ownership or ordering.
 const ordered=await browser.newContext({serviceWorkers:'block'}),x=await open(ordered,'perfil'),y=await open(ordered,'perfil');
 for(const p of [x,y])await p.evaluate(async()=>{const {openRiderStore}=await import('/rider/store.mjs');const {createRecordingOwnership,deleteActivity,recordingLockName}=await import('/rider/ownership.mjs');window.s=await openRiderStore();window.o=createRecordingOwnership({store:s});window.removeActivity=deleteActivity;window.lockName=recordingLockName;});
 assert.equal(await x.evaluate(()=>o.acquire()),true);
 await x.evaluate(async()=>{
  window.ride={id:'ordered-ride',parkId:'el-durazno',bikeId:null,startedAt:Date.now()-1000,endedAt:null,durationMs:1000,distanceM:0,maxSpeedMps:null,status:'recording',segments:[]};await o.save(ride,{create:true});
  window.blocked=true;window.blockReady=false;const r=indexedDB.open('bikeride-local-v1');r.onsuccess=()=>{const db=r.result,tx=db.transaction('state','readwrite'),store=tx.objectStore('state');tx.oncomplete=()=>db.close();const pump=()=>{const get=store.get('current');get.onsuccess=()=>{window.blockReady=true;if(window.blocked)pump();};};pump();};
 });await x.waitForFunction(()=>window.blockReady);
 await x.evaluate(()=>{window.writes=Promise.all([o.save({...ride,status:'paused'}),o.save({...ride,status:'finished',endedAt:Date.now()})]);window.releasing=o.release();});
 assert.equal(await y.evaluate(()=>o.acquire()),false,'queued checkpoints and terminal save retain ownership');
 await x.evaluate(async()=>{window.blocked=false;await writes;await releasing;});
 assert.equal(await y.evaluate(()=>o.acquire()),true);assert.equal((await read(y)).activities[0].status,'finished');
 await y.evaluate(async()=>{await s.update(d=>removeActivity(d,'ordered-ride'));await o.release();});
 assert.equal(await x.evaluate(async()=>{try{await o.save({...ride,status:'paused'});return false;}catch{return true;}}),true);assert.deepEqual((await read(y)).activities,[],'a stale owner cannot resurrect a committed deletion');
 // Even while owning the lock, an update cannot recreate a missing ID or
 // overwrite a terminal row; initial creation is an explicit separate action.
 for(const terminal of [false,true]){
  await x.evaluate(async terminal=>{await o.acquire();ride={...ride,id:terminal?'terminal-ride':'missing-ride',status:'recording',endedAt:null};await o.save(ride,{create:true});await s.update(d=>{if(terminal){d.activities[0].status='interrupted';d.activities[0].endedAt=Date.now();}else d.activities=[];});},terminal);
  assert.equal(await x.evaluate(async()=>{try{await o.save({...ride,status:'paused'});return false;}catch{return true;}}),true);await x.evaluate(()=>o.release());
  const saved=(await read(y)).activities;assert.equal(terminal?saved[0].status:saved.length,terminal?'interrupted':0);
  await y.evaluate(()=>s.update(d=>{d.activities=[];}));
 }
 console.log('PASS queued checkpoint/finish/release/delete ordering; missing, terminal and stale-owner guards');
 await ordered.close();

 for(const failure of ['absent','rejected']){
  const unsupported=await browser.newContext({serviceWorkers:'block',viewport:{width:320,height:568}});
  await unsupported.addInitScript(failure=>{Object.defineProperty(navigator,'locks',{value:failure==='absent'?undefined:{request:()=>Promise.reject(new Error('synthetic API failure'))},configurable:true});window.watchCount=0;navigator.geolocation.watchPosition=()=>++window.watchCount;navigator.geolocation.clearWatch=()=>{};},failure);
  const p=await unsupported.newPage();await p.goto(base+'/mapa-geografico.html#parque=el-durazno&vista=perfil');await ready(p);
  await p.evaluate(async()=>{const {openRiderStore}=await import('/rider/store.mjs');const s=await openRiderStore();await s.update(d=>{d.activities.push({id:'preserved-draft',parkId:'el-durazno',bikeId:null,startedAt:1000,endedAt:null,durationMs:1000,distanceM:0,maxSpeedMps:null,status:'paused',segments:[[{latitude:-33.305,longitude:-70.498,accuracy:5,timestamp:1500,speed:null}]]});});s.close();});
  const before=await read(p);await p.reload();await ready(p);assert.deepEqual(await read(p),before);assert.equal(await p.evaluate(()=>window.watchCount),0);await p.locator('[data-profile-tab=history]').click();assert.equal(await p.locator('[data-activity-id=preserved-draft]').count(),1,'unsupported coordination must still display existing local history');
  await p.locator('#bikeride-map').click();assert.equal(await p.locator('#rider-record-start').isDisabled(),true);assert.match(await p.locator('#rider-message').innerText(),/no permite coordinar.*datos se conservan/i);await p.screenshot({path:`${out}/coordination-${failure}.png`});
  await p.locator('#gps-toggle').click();assert.equal(await p.evaluate(()=>window.watchCount),1);assert.deepEqual(await read(p),before);await unsupported.close();console.log('PASS safe coordination fallback',failure);
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();}
