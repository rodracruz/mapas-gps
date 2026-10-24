import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fromOsmSnapshot,lineLength} from '../geographic/data.mjs';
import {validateCatalog} from '../geographic/catalog.mjs';

const bytes=await readFile(new URL('../sources/parquemet-osm.json',import.meta.url));
const source=JSON.parse(bytes);
// Historical receipt: retain its original geometry/version assertions while the
// current catalog adds a fresh atomic Paseo receipt in parquemet-shared tests.
const current=JSON.parse(await readFile(new URL('../data/parquemet/geographic-catalog.json',import.meta.url)));
const oldNodes=source.elements.filter(e=>e.type==='node');
const catalog={...current,targets:current.targets.filter(t=>t.category!=='shared-trail'),sourceSnapshot:'sources/parquemet-osm.json',sourceSnapshotSha256:'4cb185c60c137a15810fb941ca20954bcae6be09487cc27c580617ba156e3e1c',sourceUrl:source.url,queriedAt:source.queriedAt,geographicExtent:[Math.min(...oldNodes.map(n=>n.lon)),Math.min(...oldNodes.map(n=>n.lat)),Math.max(...oldNodes.map(n=>n.lon)),Math.max(...oldNodes.map(n=>n.lat))]};
const geo=fromOsmSnapshot(source,catalog);
const officialUrl='https://mapas.parquemet.cl/doc/MapaParque.pdf';
const officialTrails=[['centenario','Centenario',900],['cuatro-y-medio','4 ½',1000],['anfiteatro','Anfiteatro',700],['la-s','La S',500],['zorzal','Zorzal',500],['pa-arriba','Pa’ arriba',600],['torre-5','Torre 5',800],['piramide','Pirámide',600]];

test('Parquemet preserves exactly eight cyclist names and distances from the supplied PDF edition',()=>{
 assert.equal(validateCatalog(catalog),catalog);
 assert.deepEqual(catalog.targets.filter(t=>t.category==='cycling-trail').map(t=>[t.id,t.name,t.officialDistanceM]),officialTrails);
 assert.equal(catalog.officialMap.sourceUrl,officialUrl);
 assert.equal(catalog.officialMap.sha256,'e7606172479a0fd585f7f3dcb4187556a202778cd647b31f44aaefcf9bd03cf8');
 assert.equal(catalog.officialMap.cyclistTrailCount,8);
 assert.equal(catalog.officialMap.georeferenced,false);
 for(const t of catalog.targets.filter(t=>t.category==='cycling-trail')){
  assert.equal(t.officialDistanceSource,officialUrl);
  assert.equal(t.geometry,null);
  assert.equal(t.difficulty,null);
  assert.equal(t.elevationGainM,null);
  assert.equal(t.elevationLossM,null);
 }
 assert.equal(catalog.targets.some(t=>/pichon/i.test(t.name)),false);
});

test('the scoped OSM receipt is hash-bound and retains node and way versions without contributor metadata',()=>{
 assert.equal(createHash('sha256').update(bytes).digest('hex'),catalog.sourceSnapshotSha256);
 assert.equal(source.originalResponseSha256,'ad252f77463c909acceeee9fe3544a4c14e14d5fe925442933eaa9dbac231294');
 assert.equal(source.osmBaseTimestamp,'2026-10-20T15:03:08Z');
 assert.equal(source.queriedAt,catalog.queriedAt);
 assert.equal(source.url,catalog.sourceUrl);
 assert.equal(new URL(source.url).hostname,'overpass-api.de');
 assert.equal(new URL(source.url).searchParams.get('data'),source.query);
 assert.equal(source.source,'OpenStreetMap');
 assert.equal(source.license,'ODbL-1.0');
 assert.equal(source.elements.filter(e=>e.type==='way').length,62);
 assert.equal(source.elements.filter(e=>e.type==='node').length,1980);
 for(const e of source.elements){
  assert.ok(Number.isSafeInteger(e.version)&&e.version>0);
  assert.ok(Number.isFinite(Date.parse(e.timestamp)));
  assert.equal(e.user,undefined);
  assert.equal(e.uid,undefined);
 }
});

test('all imported coordinates are original ordered OSM nodes and the extent describes those nodes',()=>{
 const nodes=new Map(source.elements.filter(e=>e.type==='node').map(n=>[n.id,n]));
 const used=new Set();
 for(const w of source.elements.filter(e=>e.type==='way')){
  const f=geo.features.find(f=>f.properties.osmId===w.id);
  assert.equal(f.properties.osmVersion,w.version);
  assert.equal(f.properties.osmTimestamp,w.timestamp);
  assert.deepEqual(f.properties.nodeIds,w.nodes);
  assert.deepEqual(f.geometry.coordinates,w.nodes.map(id=>{used.add(id);const n=nodes.get(id);return [n.lon,n.lat];}));
 }
 assert.equal(used.size,nodes.size);
 const values=[...nodes.values()];
 assert.deepEqual(catalog.geographicExtent,[Math.min(...values.map(n=>n.lon)),Math.min(...values.map(n=>n.lat)),Math.max(...values.map(n=>n.lon)),Math.max(...values.map(n=>n.lat))]);
 assert.deepEqual(catalog.geographicExtent,[-70.6380693,-33.4307172,-70.6017231,-33.3894875]);
 // Independently computed from the selected elements in the original Overpass
 // response, before expanding the scoped receipt. This pins every coordinate,
 // ordered way node, object ID, version and timestamp to that original source.
 const projection=[...source.elements].sort((a,b)=>a.type.localeCompare(b.type)||a.id-b.id)
  .map(e=>[e.type,e.id,e.version,e.timestamp,e.type==='node'?[e.lon,e.lat]:e.nodes]);
 assert.equal(createHash('sha256').update(JSON.stringify(projection)).digest('hex'),'5719f4586795a98115fce889bbbf2f19b1bd59838813b70992b73bb80bc2d43b');
 const piramide=geo.features.find(f=>f.properties.osmId===479774004);
 assert.equal(piramide.properties.osmVersion,9);
 for(const [index,id,coords] of [[0,6938700276,[-70.6019812,-33.3894875]],[48,4728218613,[-70.6035451,-33.3916628]],[96,4728218661,[-70.6070446,-33.3953692]]]){
  assert.equal(piramide.properties.nodeIds[index],id);
  assert.deepEqual(piramide.geometry.coordinates[index],coords);
 }
 assert.equal(catalog.visualToGeographicTransform,null);
 assert.equal(catalog.navigationValidated,false);
});

test('all eight official cycling trails acquire their explicitly documented OSM names',()=>{
 assert.deepEqual(catalog.targets.filter(t=>t.category==='cycling-trail'&&t.status==='osm-identified').map(t=>t.id),officialTrails.map(([id])=>id));
 for(const [id,osmId,name] of [['zorzal',862880882,'Sendero Ciclista El Zorzal'],['pa-arriba',691091446,"Sendero Ciclista Pa' Arriba"]]){
  const t=catalog.targets.find(t=>t.id===id),f=geo.features.find(f=>f.properties.osmId===osmId);
  assert.equal(t.status,'osm-identified');
  assert.deepEqual(t.osmWayIds,[osmId]);
  assert.deepEqual(t.osmNames,[name]);
  assert.equal(t.geometryImported,true);
  assert.equal(t.geometry,null);
  assert.equal(t.publicMapUrl,'https://www.openstreetmap.org/way/'+osmId);
  assert.equal(f.properties.name,name);
  assert.equal(f.properties.targetId,id);
  assert.equal(f.properties.tags.access,'no');
  assert.match(t.accessNote,/access=no/);
  assert.equal(t.operationConfirmed,false);
  assert.equal(t.unassignedOsmReferences,undefined);
 }
 const bad=structuredClone(catalog);
 bad.targets.find(t=>t.id==='centenario').osmWayIds.push(862880882);
 assert.throws(()=>fromOsmSnapshot(source,bad),/nombre|geogr/i);
});

test('cycling trails are primary and all nine secondary avenues have explicit cycling infrastructure per assigned way',()=>{
 assert.deepEqual(catalog.park.primaryTargetIds,['centenario','cuatro-y-medio']);
 const avenues=[['avenida-pedro-bannen','Avenida Pedro Bannen',9],['avenida-alberto-mackenna','Avenida Alberto Mackenna',5],['avenida-abate-molina','Avenida Abate Molina',8],['avenida-carlos-martner','Avenida Carlos Martner',5],['avenida-carlos-reed','Avenida Carlos Reed',5],['avenida-claudio-gay','Avenida Claudio Gay',2],['avenida-federico-albert','Avenida Federico Albert',1],['avenida-manuel-zanartu','Avenida Manuel Zañartu',1],['avenida-la-montana','Avenida La Montaña',4]];
 assert.equal(catalog.targets.filter(t=>t.category==='avenue').length,avenues.length);
 for(const [id,name,count] of avenues){
  const t=catalog.targets.find(t=>t.id===id);
  assert.equal(t.category,'avenue');
  assert.deepEqual(t.osmNames,[name]);
  assert.equal(t.osmWayIds.length,count);
  assert.equal(t.officialDistanceM,undefined);
  for(const f of geo.features.filter(f=>f.properties.targetId===id)){
   const tags=f.properties.tags;
   assert.equal(f.properties.name,name);
   assert.ok(Object.entries(tags).some(([key,value])=>/^cycleway(?::(?:left|right|both))?$/.test(key)&&['lane','shared_lane'].includes(value)));
   assert.ok(!['no','private'].includes(tags.bicycle));
   assert.ok(!['no','private'].includes(tags.access));
  }
 }
});

test('unverified La Montaña segment and bicycle-prohibited Gabriela Mistral remain inspectable context',()=>{
 assert.deepEqual(geo.features.filter(f=>f.properties.targetId===null).map(f=>f.properties.osmId),[158170398,480868075,1223734901]);
 const mountain=geo.features.find(f=>f.properties.osmId===1223734901);
 assert.equal(mountain.properties.name,'Avenida La Montaña');
 assert.equal(mountain.properties.tags.bicycle,undefined);
 assert.equal(mountain.properties.tags.cycleway,undefined);
 for(const id of [158170398,480868075]){
  const f=geo.features.find(f=>f.properties.osmId===id);
  assert.equal(f.properties.name,'Avenida Gabriela Mistral');
  assert.equal(f.properties.tags.bicycle,'no');
 }
});

test('restricted sections and official reference distances remain distinct from route extent or current operation',()=>{
 assert.deepEqual(geo.features.filter(f=>['no','private'].includes(f.properties.tags.access)).map(f=>f.properties.osmId),[479769658,691091446,862880882]);
 const anfiteatro=geo.features.filter(f=>f.properties.targetId==='anfiteatro');
 assert.equal(anfiteatro.length,6);
 assert.equal(anfiteatro.filter(f=>f.properties.tags.access==='no').length,1);
 const centenario=catalog.targets.find(t=>t.id==='centenario');
 const osmLength=geo.features.filter(f=>f.properties.targetId===centenario.id).reduce((sum,f)=>sum+lineLength(f.geometry.coordinates),0);
 assert.ok(osmLength>609&&osmLength<610);
 assert.equal(centenario.officialDistanceM,900);
 assert.equal(catalog.park.operationConfirmed,false);
 assert.ok(catalog.targets.every(t=>t.operationConfirmed===false));
 for(const a of catalog.park.amenities){
  assert.equal(a.sourceUrl,officialUrl);
  assert.equal(a.evidenceType,'official-map-legend');
  assert.equal(a.operationConfirmed,false);
  assert.equal(a.coordinates,undefined);
  assert.equal(a.openingHours,undefined);
 }
});
