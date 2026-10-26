// This database is deliberately separate from the existing private map store.
export function defaultRiderState() {
  return {version:1,profile:{name:''},favorites:[],bikes:[],meetups:[],activities:[],downloads:[]};
}

function invalid(path) { throw new TypeError(`Invalid rider state: ${path}`); }
function object(value, path, fields) {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      ![Object.prototype,null].includes(Object.getPrototypeOf(value))) invalid(path);
  if (Object.keys(value).some(key => !fields.includes(key))) invalid(`${path}: unknown field`);
  return value;
}
function text(value, path, limit=160) {
  if (typeof value !== 'string' || value.length > limit || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/u.test(value) || /[\uD800-\uDFFF]/u.test(value)) invalid(path);
  return value;
}
function id(value, path) {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/.test(value)) invalid(path);
  return value;
}
function number(value, path, min=0, max=Number.MAX_SAFE_INTEGER) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) invalid(path);
  return value;
}
function timestamp(value, path) {
  number(value,path,0,8640000000000000);
  if (!Number.isSafeInteger(value)) invalid(path);
  return value;
}
function optional(value, fallback, check) { return value === undefined ? fallback : check(value); }
function nullable(value, check) { return value === null ? null : check(value); }
function date(value, path) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) invalid(path);
  const parsed=new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(+parsed) || parsed.toISOString().slice(0,10)!==value) invalid(path);
  return value;
}
function iso(value,path) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) invalid(path);
  date(value.slice(0,10),path);
  const clock=value.slice(11,19).split(':').map(Number);
  if (clock[0]>23 || clock[1]>59 || clock[2]>59 || !Number.isFinite(Date.parse(value)) || Date.parse(value)<0) invalid(path);
  const offset=value.match(/([+-])(\d{2}):(\d{2})$/);
  if (offset && (+offset[2]>23 || +offset[3]>59)) invalid(path);
  return value;
}
function choice(value,choices,path) { if (!choices.includes(value)) invalid(path); return value; }
function array(value,path,normalize,key) {
  if (!Array.isArray(value)) invalid(path);
  const seen=new Set();
  return Array.from(value,(item,index)=>{
    const result=normalize(item,`${path}[${index}]`);
    if (key) { const identity=key(result); if (seen.has(identity)) invalid(`${path}: duplicate`); seen.add(identity); }
    return result;
  });
}
function fix(value,path) {
  const v=object(value,path,['longitude','latitude','accuracy','timestamp','speed']);
  const result={longitude:number(v.longitude,`${path}.longitude`,-180,180),latitude:number(v.latitude,`${path}.latitude`,-90,90),accuracy:number(v.accuracy,`${path}.accuracy`),timestamp:timestamp(v.timestamp,`${path}.timestamp`)};
  result.speed=optional(v.speed,null,x=>nullable(x,y=>number(y,`${path}.speed`)));
  return result;
}

// Returns a detached, normalized state; invalid data throws rather than being truncated.
export function validateRiderState(value) {
  const v=object(value,'state',['version','profile','favorites','bikes','meetups','activities','downloads']);
  if (v.version!==1) invalid('version');
  const profile=object(v.profile,'profile',['name']);
  return {
    version:1,
    profile:{name:text(profile.name,'profile.name',80)},
    favorites:array(v.favorites,'favorites',(item,p)=>{
      const x=object(item,p,['parkId','trailId']);return {parkId:id(x.parkId,p),trailId:id(x.trailId,p)};
    },x=>JSON.stringify([x.parkId,x.trailId])),
    bikes:array(v.bikes,'bikes',(item,p)=>{
      const x=object(item,p,['id','name','frontPsi','rearPsi','forkModel','notes','serviceDate']);
      return {id:id(x.id,p),name:text(x.name,p),frontPsi:optional(x.frontPsi,null,y=>nullable(y,z=>number(z,p,0,300))),rearPsi:optional(x.rearPsi,null,y=>nullable(y,z=>number(z,p,0,300))),forkModel:optional(x.forkModel,'',y=>text(y,p)),notes:optional(x.notes,'',y=>text(y,p,4000)),serviceDate:optional(x.serviceDate,'',y=>y===''?'':date(y,p))};
    },x=>x.id),
    meetups:array(v.meetups,'meetups',(item,p)=>{
      const x=object(item,p,['id','title','parkId','trailId','meetingPoint','startAt','timezone','status','notes']);
      return {id:id(x.id,p),title:text(x.title,p),parkId:id(x.parkId,p),trailId:optional(x.trailId,null,y=>nullable(y,z=>id(z,p))),meetingPoint:optional(x.meetingPoint,'',y=>text(y,p,500)),startAt:iso(x.startAt,p),timezone:optional(x.timezone,'',y=>text(y,p,100)),status:optional(x.status,'planned',y=>choice(y,['planned','cancelled'],p)),notes:optional(x.notes,'',y=>text(y,p,4000))};
    },x=>x.id),
    activities:array(v.activities,'activities',(item,p)=>{
      const x=object(item,p,['id','parkId','bikeId','startedAt','endedAt','durationMs','distanceM','maxSpeedMps','status','segments']);
      const startedAt=timestamp(x.startedAt,p),endedAt=nullable(x.endedAt,y=>timestamp(y,p));
      if (endedAt!==null && endedAt<startedAt) invalid(p);
      const segments=array(x.segments,`${p}.segments`,(segment,q)=>array(segment,q,fix));
      let previous=-Infinity;
      for (const segment of segments) for (const point of segment) {
        if (point.timestamp<startedAt || point.timestamp<=previous || (endedAt!==null && point.timestamp>endedAt+5000)) invalid(`${p}: point time`);
        previous=point.timestamp;
      }
      return {id:id(x.id,p),parkId:id(x.parkId,p),bikeId:optional(x.bikeId,null,y=>nullable(y,z=>id(z,p))),startedAt,endedAt,durationMs:number(x.durationMs,p),distanceM:number(x.distanceM,p),maxSpeedMps:optional(x.maxSpeedMps,null,y=>nullable(y,z=>number(z,p))),status:choice(x.status,['recording','paused','finished','interrupted'],p),segments};
    },x=>x.id),
    downloads:array(v.downloads,'downloads',(item,p)=>{
      const x=object(item,p,['id','parkId','trailId','createdAt','name','gpx']);
      return {id:id(x.id,p),parkId:id(x.parkId,p),trailId:id(x.trailId,p),createdAt:timestamp(x.createdAt,p),name:text(x.name,p),gpx:text(x.gpx,p,10000000)};
    },x=>x.id)
  };
}

export async function openRiderStore({indexedDB=globalThis.indexedDB,name='bikeride-local-v1'}={}) {
  if (name==='mapas-gps-v1') throw new Error('Protected legacy database');
  if (typeof name!=='string' || !name) throw new TypeError('Invalid database name');
  if (!indexedDB || typeof indexedDB.open!=='function') throw new Error('IndexedDB is unavailable');
  const db=await new Promise((resolve,reject)=>{
    const request=indexedDB.open(name,1);
    let rejected=false;
    request.onupgradeneeded=()=>{request.result.createObjectStore('state');};
    request.onsuccess=()=>{if(rejected)request.result.close();else resolve(request.result);};
    request.onerror=()=>reject(request.error || new Error('Cannot open rider database'));
    request.onblocked=()=>{rejected=true;reject(new Error('Rider database is blocked'));};
  });
  let closed=false;
  db.onversionchange=()=>{closed=true;db.close();};
  function transact(mutator) {
    return new Promise((resolve,reject)=>{
      if (closed) {reject(new Error('Rider store is closed'));return;}
      let tx,result,failure;
      try {
        tx=db.transaction('state',mutator?'readwrite':'readonly');
        tx.oncomplete=()=>resolve(result);
        tx.onabort=()=>reject(failure || tx.error || new Error('Rider transaction aborted'));
        tx.onerror=()=>{}; // Abort determines the final result; never report an uncommitted write.
        const store=tx.objectStore('state'),request=store.get('current');
        request.onsuccess=()=>{
          try {
            const draft=validateRiderState(request.result===undefined?defaultRiderState():request.result);
            if (mutator) {
              const returned=mutator(draft);
              if (returned && typeof returned.then==='function') {
                // Consume an async rejection while rejecting the entire transaction.
                Promise.resolve(returned).catch(()=>{});
                throw new TypeError('Rider update mutator must be synchronous');
              }
              result=validateRiderState(draft);
              store.put(result,'current');
            } else result=draft;
          } catch(error) {failure=error;tx.abort();}
        };
      } catch(error) {if(tx){failure=error;try{tx.abort();}catch{reject(error);}}else reject(error);}
    });
  }
  return {
    read:()=>transact(),
    update:mutator=>typeof mutator==='function'?transact(mutator):Promise.reject(new TypeError('A synchronous mutator is required')),
    close:()=>{closed=true;db.close();}
  };
}
