import {createRideRecorder} from './recording.mjs';
// Owns explicit recording only. The existing GPS controller owns the sole watch.
export function createRiderSession({parkId,save,onChange,onError}){
 let recorder=null,gps=null,unsubscribe=null,lastFix=null,rejectedSignal=false,lastSave=0,pending=null,disposed=false;
 const snapshot=()=>recorder?.snapshot()||null;
 function checkpoint(force=false){
  if(!recorder)return Promise.resolve();
  const elapsed=Date.now()-lastSave;
  if(!force&&elapsed<5000){if(!pending)pending=setTimeout(()=>{pending=null;checkpoint(true);},5000-elapsed);return Promise.resolve();}
  clearTimeout(pending);pending=null;lastSave=Date.now();
  const value=snapshot();return save(value).catch(onError);
 }
 function finish(status='finished'){
  if(!recorder)return;
  const value=recorder.finish(Date.now(),status);recorder=null;lastFix=null;clearTimeout(pending);pending=null;
  const result=save(value).catch(onError);onChange();return result;
 }
 function update(next){
  if(recorder&&next.mode!=='gps')finish('interrupted');
  const raw=next.result?.raw;
  const rejected=['invalid-fix','out-of-order','future-fix','stale-fix','poor-accuracy','teleport-reacquiring','signal-unavailable','invalid-clock','clock-before-fix'].includes(next.result?.reason);
  if(recorder&&next.mode==='gps'&&rejected&&!rejectedSignal&&snapshot().status==='recording'){
   // The matcher may retain its previous raw point when it rejects a new input.
   // Break continuity without ingesting that old point or adding paused time.
   const time=Date.now();recorder.pause(time);recorder.resume(time);checkpoint();
  }
  rejectedSignal=rejected;
  if(recorder&&next.mode==='gps'&&raw&&raw.timestamp!==lastFix){lastFix=raw.timestamp;if(snapshot().status==='recording'){recorder.ingest(raw);checkpoint();}}
  onChange();
 }
 const tick=setInterval(()=>{if(recorder)onChange();},1000);
 const pagehide=()=>finish('interrupted');window.addEventListener('pagehide',pagehide);
 return {
  snapshot,gpsSnapshot:()=>gps?.snapshot()||{mode:'off',result:{}},
  connect(value){unsubscribe?.();gps=value;unsubscribe=gps.subscribe(update);update(gps.snapshot());},
  async start(bikeId=null){
   if(disposed||recorder||!gps||gps.snapshot().mode==='demo')return;
   // Starting native GPS emits an off/reset first. Create the recorder afterwards.
   if(gps.snapshot().mode!=='gps')document.getElementById('gps-toggle').click();
   if(gps.snapshot().mode!=='gps')return;
   recorder=createRideRecorder();recorder.start({id:'ride-'+crypto.randomUUID(),parkId,bikeId});lastFix=null;
   await checkpoint(true);onChange();
  },
  async pause(){if(snapshot()?.status!=='recording')return;recorder.pause();await checkpoint(true);onChange();},
  async resume(){if(snapshot()?.status!=='paused'||gps?.snapshot().mode!=='gps')return;recorder.resume();lastFix=gps.snapshot().result?.raw?.timestamp??null;await checkpoint(true);onChange();},
  finish,leave(){return finish('interrupted');},checkpoint,
  dispose(){disposed=true;finish('interrupted');clearInterval(tick);clearTimeout(pending);unsubscribe?.();window.removeEventListener('pagehide',pagehide);}
 };
}
