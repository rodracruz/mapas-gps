import {createRideRecorder} from './recording.mjs';
// Owns explicit recording only. The existing GPS controller owns the sole watch.
export function createRiderSession({parkId,save,onChange,onError,acquire=async()=>true,release=async()=>{}}){
 let recorder=null,gps=null,unsubscribe=null,lastFix=null,rejectedSignal=false,lastSave=0,pending=null,disposed=false,starting=false,closing=null,startEpoch=0,waitingForOwnership=false,lastMode=null;
 const snapshot=()=>recorder?.snapshot()||null;
 function stopOnError(error){
  recorder=null;lastFix=null;clearTimeout(pending);pending=null;
  closing=Promise.resolve(release()).finally(()=>{closing=null;onChange();});
  onError(error);onChange();
 }
 function checkpoint(force=false,create=false){
  if(!recorder)return Promise.resolve();
  const elapsed=Date.now()-lastSave;
  if(!force&&elapsed<5000){if(!pending)pending=setTimeout(()=>{pending=null;checkpoint(true);},5000-elapsed);return Promise.resolve();}
  clearTimeout(pending);pending=null;lastSave=Date.now();
  return save(snapshot(),{create}).catch(stopOnError);
 }
 function finish(status='finished'){
  startEpoch++;
  if(!recorder)return closing;
  const value=recorder.finish(Date.now(),status);recorder=null;lastFix=null;clearTimeout(pending);pending=null;
  closing=save(value).catch(onError).then(()=>release()).finally(()=>{closing=null;onChange();});onChange();return closing;
 }
 function update(next){
  const changedMode=next.mode!==lastMode;lastMode=next.mode;
  // A later stop/demo choice revokes a request still waiting for ownership.
  // Repeated off snapshots are not new choices when starting from off.
  if(next.mode!=='gps'&&(recorder||(waitingForOwnership&&changedMode)))finish('interrupted');
  const raw=next.result?.raw;
  const rejected=['invalid-fix','out-of-order','future-fix','stale-fix','poor-accuracy','teleport-reacquiring','signal-unavailable','invalid-clock','clock-before-fix'].includes(next.result?.reason);
  if(recorder&&next.mode==='gps'&&rejected&&!rejectedSignal&&snapshot().status==='recording'){
   // Rejections can contain either a retained point or a new rejected raw fix.
   // Break continuity, consume the raw timestamp, and never ingest that result.
   const time=Date.now();recorder.pause(time);recorder.resume(time);checkpoint();
  }
  rejectedSignal=rejected;
  if(rejected&&raw)lastFix=Math.max(lastFix??-Infinity,raw.timestamp);
  if(recorder&&next.mode==='gps'&&!rejected&&raw&&(lastFix===null||raw.timestamp>lastFix)){
   lastFix=raw.timestamp;if(snapshot().status==='recording'){recorder.ingest(raw);checkpoint();}
  }
  onChange();
 }
 const tick=setInterval(()=>{if(recorder)onChange();},1000);
 const pagehide=()=>finish('interrupted');window.addEventListener('pagehide',pagehide);
 return {
  snapshot,gpsSnapshot:()=>gps?.snapshot()||{mode:'off',result:{}},busy:()=>starting||!!closing,stopOnError,
  connect(value){unsubscribe?.();gps=value;unsubscribe=gps.subscribe(update);update(gps.snapshot());},
  async start(bikeId=null){
   if(disposed||recorder||starting||closing||!gps||gps.snapshot().mode==='demo')return;
   starting=true;const epoch=startEpoch;onChange();
   try{
    waitingForOwnership=true;const acquired=await acquire();waitingForOwnership=false;
    if(!acquired)throw Object.assign(new Error('Recording busy'),{recordingMessage:'Hay una actividad abierta en otra pestaña. Finalízala allí y vuelve a intentarlo.'});
    if(disposed||epoch!==startEpoch){await release();return;}
    // Ownership is settled: our own synchronous off/reset must not cancel start.
    // Create the recorder after that native GPS reset.
    if(gps.snapshot().mode!=='gps')document.getElementById('gps-toggle').click();
    if(gps.snapshot().mode!=='gps'){await release();return;}
    recorder=createRideRecorder();recorder.start({id:'ride-'+crypto.randomUUID(),parkId,bikeId});lastFix=null;rejectedSignal=false;
    await checkpoint(true,true);
   }catch(error){if(!recorder)await release();throw error;}finally{waitingForOwnership=false;starting=false;onChange();}
  },
  async pause(){if(snapshot()?.status!=='recording')return;recorder.pause();await checkpoint(true);onChange();},
  async resume(){if(snapshot()?.status!=='paused'||gps?.snapshot().mode!=='gps')return;recorder.resume();lastFix=gps.snapshot().result?.raw?.timestamp??null;await checkpoint(true);onChange();},
  finish,leave(){return finish('interrupted');},checkpoint,
  dispose(){disposed=true;const result=finish('interrupted');clearInterval(tick);clearTimeout(pending);unsubscribe?.();window.removeEventListener('pagehide',pagehide);return result;}
 };
}
