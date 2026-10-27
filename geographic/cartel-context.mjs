import {sha256} from '../review/sha256.mjs';

// Hash pins the additive artifact, without changing any original trail or GPS input.
export const contextArtworkSha256='e59fdc9967ebb5e84362a290b20708f5c72193290cb72a6f22138a8a7545663c';
export function validateContextArtwork(value,base){
 const fail=()=>{throw new Error('Las conexiones gráficas no coinciden con el plano oficial.');};
 if(value?.schemaVersion!==1||value.coordinateSystem!=='image-pixels'||value.image?.width!==base.image.width||value.image?.height!==base.image.height||value.image?.sha256!==base.image.sha256||value.source?.sha256!==base.sources[0]?.sha256||value.clipToImage!==true||value.interpolated!==false||value.simplificationTolerancePx!==0||value.connections?.length!==0||value.georeferencing?.transform!==null||value.georeferencing.useForNavigation!==false||value.georeferencing.useForGroundDistances!==false||!Array.isArray(value.paths))fail();
 const indices=[0,1,2,3,...Array.from({length:62},(_,i)=>i+278),357,358];
 if(value.paths.length!==indices.length||new Set(value.paths.map(p=>p.id)).size!==indices.length)fail();
 for(const [i,p]of value.paths.entries()){
  const expert=i<4;
  if(p.role!==(expert?'expert-connection-artwork':'connection-artwork')||p.fill!==(expert?'#e12219':'#00953b')||p.stroke!=='none'||p.connectionVerified!==false||p.sourceDrawingIndices?.length!==1||p.sourceDrawingIndices[0]!==indices[i]||typeof p.d!=='string'||!p.d.length||!/^[MmLlCcQqSsTtHhVvAaZz0-9eE,.\s+-]+$/.test(p.d)||!Array.isArray(p.bounds)||p.bounds.length!==4||!p.bounds.every(Number.isFinite)||p.bounds[2]<0||p.bounds[3]<0)fail();
 }
 return value;
}
export async function loadContextArtwork(base){
 const embedded=document.getElementById('embedded-cartel-context');let raw;
 if(embedded)raw=embedded.textContent;
 else{const r=await fetch('./data/el-durazno/cartel-context.json');if(!r.ok)throw new Error('No se cargaron las conexiones gráficas del plano.');raw=await r.text();}
 if(sha256(new TextEncoder().encode(raw))!==contextArtworkSha256)throw new Error('Las conexiones gráficas no coinciden con su fuente documentada.');
 return validateContextArtwork(JSON.parse(raw),base);
}
