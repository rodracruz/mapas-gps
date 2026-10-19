import {sha256} from './sha256.mjs';
export function validateReviewImages(config,frame){
 const fail=()=>{throw new Error('Referencias de imagen inválidas: el plano de los trazados debe conservarse.');};
 if(config?.schemaVersion!==1||config.coordinateFrame?.width!==frame.width||config.coordinateFrame?.height!==frame.height||!Array.isArray(config.sources)||!config.sources.length)fail();
 if(new Set(config.sources.map(s=>s.id)).size!==config.sources.length||!config.sources.some(s=>s.id===config.defaultId))fail();
 for(const s of config.sources){
  if(typeof s.id!=='string'||typeof s.label!=='string'||!/^[-a-zA-Z0-9/_.]+$/.test(s.url)||s.url.includes('..')||!/^[-a-zA-Z0-9]/.test(s.url)||!/^[a-f0-9]{64}$/.test(s.sha256))fail();
  if(!Number.isFinite(s.rasterScale)||s.rasterScale<=0||s.naturalWidth/s.rasterScale!==frame.width||s.naturalHeight/s.rasterScale!==frame.height)fail();
 }
 if(config.sources.find(s=>s.id==='original')?.sha256!==frame.sha256)fail();
 return config;
}
export async function verifyImageBytes(bytes,expected){
 let hash;
 if(globalThis.crypto?.subtle){const input=Uint8Array.from(new Uint8Array(bytes.buffer||bytes,bytes.byteOffset||0,bytes.byteLength));const digest=await crypto.subtle.digest('SHA-256',input);hash=[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');}
 else hash=sha256(bytes instanceof Uint8Array?bytes:new Uint8Array(bytes));
 if(hash!==expected)throw new Error('La imagen cambió: no coincide con la fuente de los trazados.');
}
