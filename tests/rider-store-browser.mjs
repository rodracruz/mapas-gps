import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const base=process.env.RIDER_BASE_URL||'http://127.0.0.1:4187';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try {
 const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();
 await page.goto(base+'/');
 const result=await page.evaluate(async()=>{
  const {openRiderStore}=await import('/rider/store.mjs');
  const request=r=>new Promise((resolve,reject)=>{r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
  const legacy=await new Promise((resolve,reject)=>{const r=indexedDB.open('mapas-gps-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('maps',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
  await new Promise((resolve,reject)=>{const tx=legacy.transaction('maps','readwrite');tx.objectStore('maps').put({id:'fixture',name:'Public synthetic fixture',blob:new Blob(['fixture'],{type:'text/plain'}),points:[{lat:0,lon:0}],trails:[]});tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error);});
  localStorage.setItem('fixture-sentinel','keep');
  const a=await openRiderStore(),b=await openRiderStore();
  await a.update(d=>{d.profile.name='Fixture';});
  await Promise.all(Array.from({length:20},(_,i)=>(i%2?a:b).update(d=>{d.bikes.push({id:'bike-'+i,name:'Fixture '+i});})));
  const before=await a.read();let invalid=false,asyncInvalid=false,throws=false;
  try{await a.update(d=>{d.profile.name='x'.repeat(81);});}catch{invalid=true;}
  try{await a.update(async d=>{d.profile.name='Unsaved';});}catch{asyncInvalid=true;}
  try{await a.update(d=>{d.bikes=[];throw new Error('Mutator failed');});}catch{throws=true;}
  const after=await b.read();
  const originalTransaction=IDBDatabase.prototype.transaction;
  let abortedTransaction;
  IDBDatabase.prototype.transaction=function(...args){const tx=originalTransaction.apply(this,args);if(args[1]==='readwrite')abortedTransaction=tx;return tx;};
  let storageRejected=false;
  try{await a.update(d=>{d.profile.name='Must not commit';queueMicrotask(()=>abortedTransaction.abort());});}catch{storageRejected=true;}
  finally{IDBDatabase.prototype.transaction=originalTransaction;}
  const afterStorageFailure=await b.read();
  const retained=await request(legacy.transaction('maps').objectStore('maps').get('fixture'));
  legacy.close();a.close();b.close();let closed=false;try{await a.read();}catch{closed=true;}
  return {before,after,afterStorageFailure,storageRejected,invalid,asyncInvalid,throws,closed,legacy:{...retained,blob:await retained.blob.text()},sentinel:localStorage.getItem('fixture-sentinel')};
 });
 assert.equal(result.before.bikes.length,20);assert.deepEqual(result.after,result.before);assert.deepEqual(result.afterStorageFailure,result.before);
 for(const key of ['storageRejected','invalid','asyncInvalid','throws','closed'])assert.equal(result[key],true,key);
 assert.equal(result.legacy.blob,'fixture');assert.equal(result.legacy.name,'Public synthetic fixture');assert.deepEqual(result.legacy.points,[{lat:0,lon:0}]);assert.equal(result.sentinel,'keep');
 await page.reload();
 const reloaded=await page.evaluate(async()=>{const {openRiderStore}=await import('/rider/store.mjs');const s=await openRiderStore();const v=await s.read();s.close();return v;});
 assert.deepEqual(reloaded,result.before);
 console.log('PASS actual IndexedDB: reload, 20 concurrent updates, invalid/async/throw/storage-abort rollback, closed errors, legacy Blob and localStorage preservation');
 await context.close();
}finally{await browser.close();}
