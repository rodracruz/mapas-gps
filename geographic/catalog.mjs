import {lineLength} from './data.mjs';
const permittedHosts=new Set(['www.outlife.cl','www.openstreetmap.org','api.openstreetmap.org','www.trailforks.com','es.wikiloc.com','www.wikiloc.com']);
function validSource(url){try{const u=new URL(url);return u.protocol==='https:'&&permittedHosts.has(u.hostname)&&!u.username&&!u.password;}catch{return false;}}
export function validateCatalog(catalog){
 const fail=()=>{throw new Error('El catálogo del parque no es válido.');};
 if(catalog?.schemaVersion!==1||catalog.coordinateSystem!=='EPSG:4326'||catalog.coordinateOrder!=='longitude,latitude'||catalog.visualToGeographicTransform!==null||catalog.navigationValidated!==false||!Array.isArray(catalog.targets)||!catalog.targets.length)fail();
 const park=catalog.park,ids=new Set(),wayIds=new Set();
 if(!park||!/^[a-z0-9-]+$/.test(park.id)||typeof park.name!=='string'||!validSource(park.sourceUrl)||!Array.isArray(park.amenities)||!Array.isArray(park.primaryTargetIds))fail();
 for(const amenity of park.amenities)if(!amenity.id||!amenity.label||!validSource(amenity.sourceUrl))fail();
 for(const t of catalog.targets){
  if(!/^[a-z0-9-]+$/.test(t.id)||ids.has(t.id)||typeof t.name!=='string'||!/^#[0-9a-f]{6}$/i.test(t.color)||!validSource(t.publicMapUrl)||!Array.isArray(t.osmWayIds)||!Array.isArray(t.osmNames)||t.osmNames.some(name=>typeof name!=='string'||!name.trim())||new Set(t.osmNames).size!==t.osmNames.length||t.geometry!==null)fail();
  if(t.visualTrailId!==null&&t.visualTrailId!==undefined&&!/^[a-z0-9-]+$/.test(t.visualTrailId))fail();
  ids.add(t.id);
  if(t.status==='osm-identified'){if(!t.osmWayIds.length||!t.osmNames.length||t.geometryImported!==true)fail();for(const id of t.osmWayIds){if(!Number.isSafeInteger(id)||wayIds.has(id))fail();wayIds.add(id);}}
  else if(t.status!=='public-reference'||t.osmWayIds.length||t.osmNames.length||t.geometryImported!==false)fail();
  if(t.difficulty&&(!['Principiante','Intermedio','Avanzado','Experto'].includes(t.difficulty.label)||!validSource(t.difficulty.sourceUrl)||(t.difficulty.style!==undefined&&!['Park','Trail'].includes(t.difficulty.style))))fail();
  for(const key of ['elevationGainM','elevationLossM'])if(t[key]!==null&&(!Number.isFinite(t[key])||t[key]<0))fail();
 }
 if(!park.primaryTargetIds.every(id=>ids.has(id))||!validSource(catalog.sourceUrl)||!/^sources\/[a-z0-9-]+\.json$/.test(catalog.sourceSnapshot)||!/^[0-9a-f]{64}$/.test(catalog.sourceSnapshotSha256))fail();
 return catalog;
}
export function describeTrail(target,features){
 const routes=features.filter(f=>f.properties.targetId===target.id);
 const distance=routes.length?routes.reduce((sum,f)=>sum+lineLength(f.geometry.coordinates),0):null;
 const measure=n=>Number.isFinite(n)?Math.round(n).toLocaleString('es-CL')+' m':'Sin datos';
 return {distance:distance===null?'Sin trazado disponible':distance>=1000?(distance/1000).toLocaleString('es-CL',{minimumFractionDigits:2,maximumFractionDigits:2})+' km':Math.round(distance)+' m',difficulty:target.difficulty?.label||'Por confirmar',elevationGain:measure(target.elevationGainM),elevationLoss:measure(target.elevationLossM),maxSpeed:'Sin registros'};
}
