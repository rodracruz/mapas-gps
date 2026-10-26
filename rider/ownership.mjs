// One owner across both park entries. Web Locks are local to this origin.
export const recordingLockName='bikeride-local-v1:recording';
const active=activity=>activity&&['recording','paused'].includes(activity.status);
const issue=message=>Object.assign(new Error(message),{recordingMessage:message});
export const coordinationUnavailable='Este navegador no permite coordinar la grabación entre pestañas. No se grabará ni recuperará una actividad; tus datos se conservan. Puedes consultar el GPS.';
export function deleteActivity(draft,id){
 const value=draft.activities.find(a=>a.id===id);
 if(active(value))throw issue('La actividad sigue abierta en otra pestaña. Finalízala allí antes de eliminarla.');
 draft.activities=draft.activities.filter(a=>a.id!==id);
}
export function createRecordingOwnership({store,locks=globalThis.navigator?.locks,onLost=()=>{}}){
 let lease=null,acquiring=false,queue=Promise.resolve(),supported=typeof locks?.request==='function';
 const owns=token=>lease===token&&!token.failed;
 function recover(token){
  return store.update(d=>{
   if(!owns(token))throw issue('Se perdió la coordinación de la grabación. El registro se detuvo.');
   for(const a of d.activities)if(active(a)){
    a.status='interrupted';
    a.endedAt=a.segments.reduce((end,segment)=>segment.reduce((latest,point)=>Math.max(latest,point.timestamp),end),a.startedAt+a.durationMs);
   }
  });
 }
 async function acquire(){
  if(!supported)throw issue(coordinationUnavailable);
  if(lease||acquiring)return false;
  acquiring=true;let requesting=true;
  try{
   const token=await new Promise((resolve,reject)=>{
    let granted=null;
    const request=locks.request(recordingLockName,{mode:'exclusive',ifAvailable:true},lock=>{
     if(!lock){resolve(null);return;}
     let unlock;const held=new Promise(done=>{unlock=done;});
     granted={unlock,failed:false,id:null,request};lease=granted;resolve(granted);return held;
    });
    Promise.resolve(request).catch(()=>{
     supported=false;
     if(granted&&lease===granted){granted.failed=true;lease=null;onLost(issue('Se perdió la coordinación de la grabación. El registro se detuvo; los datos ya guardados se conservan.'));}
     reject(issue(coordinationUnavailable));
    });
   });
   requesting=false;
   if(!token)return false;
   try{await recover(token);}catch(error){token.failed=true;token.unlock();if(lease===token)lease=null;throw error;}
   return true;
  }catch(error){if(requesting){supported=false;throw issue(coordinationUnavailable);}throw error;}
  finally{acquiring=false;}
 }
 // Capture the lease when queued; a later acquisition cannot authorize old work.
 function save(activity,{create=false}={}){
  const token=lease;
  const operation=queue.then(()=>store.update(d=>{
   if(!token||!owns(token))throw issue('Se perdió la autorización para guardar esta actividad. El registro se detuvo.');
   const index=d.activities.findIndex(a=>a.id===activity.id);
   if(create){
    if(token.id||index!==-1||!active(activity))throw issue('No se pudo iniciar una nueva actividad.');
    token.id=activity.id;d.activities.push(activity);
   }else{
    if(token.id!==activity.id||index===-1||!active(d.activities[index]))throw issue('La actividad ya no está abierta. El registro se detuvo y no se volverá a crear.');
    d.activities[index]=activity;
   }
  }));
  queue=operation.catch(error=>{if(token)token.failed=true;});
  return operation;
 }
 // Keep the native lock until every queued transaction has committed or aborted.
 async function release(){
  const token=lease;await queue;
  if(token&&lease===token){lease=null;token.unlock();await token.request.catch(()=>{});}
 }
 async function initialize(){
  if(supported){
   try{if(await acquire())await release();}
   catch(error){if(supported)throw error;} // API failure still permits read-only history.
  }
  return store.read();
 }
 return {acquire,save,release,initialize,supported:()=>supported};
}
