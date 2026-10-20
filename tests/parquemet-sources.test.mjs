import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fromOsmSnapshot,lineLength} from '../geographic/data.mjs';
import {validateCatalog} from '../geographic/catalog.mjs';

const bytes=await readFile(new URL('../sources/parquemet-osm.json',import.meta.url));
const source=JSON.parse(bytes);
const catalog=JSON.parse(await readFile(new URL('../data/parquemet/geographic-catalog.json',import.meta.url)));
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
 assert.equal(catalog.sourceSnapshotSha256,'5f804c6b89ceb2e5836429364cf87a8850cdfd57c347bb167d5be08b00dd29db');
 assert.equal(source.originalResponseSha256,'ad252f77463c909acceeee9fe3544a4c14e14d5fe925442933eaa9dbac231294');
 assert.equal(source.osmBaseTimestamp,'2026-10-20T15:03:08Z');
 assert.equal(source.queriedAt,catalog.queriedAt);
 assert.equal(source.url,catalog.sourceUrl);
 assert.equal(new URL(source.url).hostname,'overpass-api.de');
 assert.equal(new URL(source.url).searchParams.get('data'),source.query);
 assert.equal(source.source,'OpenStreetMap');
 assert.equal(source.license,'ODbL-1.0');
 assert.equal(source.elements.filter(e=>e.type==='way').length,33);
 assert.equal(source.elements.filter(e=>e.type==='node').length,1260);
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
 assert.deepEqual(catalog.geographicExtent,[-70.6380693,-33.4306903,-70.6019812,-33.3894875]);
 const piramide=geo.features.find(f=>f.properties.osmId===479774004);
 assert.equal(piramide.properties.osmVersion,9);
 for(const [index,id,coords] of [[0,6938700276,[-70.6019812,-33.3894875]],[48,4728218613,[-70.6035451,-33.3916628]],[96,4728218661,[-70.6070446,-33.3953692]]]){
  assert.equal(piramide.properties.nodeIds[index],id);
  assert.deepEqual(piramide.geometry.coordinates[index],coords);
 }
 assert.equal(catalog.visualToGeographicTransform,null);
 assert.equal(catalog.navigationValidated,false);
});

test('unconfirmed spelling variants remain unassigned context instead of acquiring a geographic route',()=>{
 assert.deepEqual(catalog.targets.filter(t=>t.category==='cycling-trail'&&t.status==='osm-identified').map(t=>t.id),['centenario','cuatro-y-medio','anfiteatro','la-s','torre-5','piramide']);
 for(const [id,osmId,name] of [['zorzal',862880882,'Sendero Ciclista El Zorzal'],['pa-arriba',691091446,"Sendero Ciclista Pa' Arriba"]]){
  const t=catalog.targets.find(t=>t.id===id),f=geo.features.find(f=>f.properties.osmId===osmId);
  assert.equal(t.status,'public-reference');
  assert.deepEqual(t.osmWayIds,[]);
  assert.deepEqual(t.osmNames,[]);
  assert.equal(t.geometryImported,false);
  assert.equal(t.geometry,null);
  assert.equal(t.publicMapUrl,officialUrl);
  assert.equal(f.properties.name,name);
  assert.equal(f.properties.targetId,null);
  assert.equal(f.properties.tags.access,'no');
 }
 const bad=structuredClone(catalog);
 bad.targets.find(t=>t.id==='centenario').osmWayIds.push(862880882);
 assert.throws(()=>fromOsmSnapshot(source,bad),/nombre|geogr/i);
});

test('two primary avenues have literal sourced names and explicit cycling infrastructure in every imported way',()=>{
 assert.deepEqual(catalog.park.primaryTargetIds,['avenida-pedro-bannen','avenida-alberto-mackenna']);
 for(const [id,name,count] of [['avenida-pedro-bannen','Avenida Pedro Bannen',9],['avenida-alberto-mackenna','Avenida Alberto Mackenna',5]]){
  const t=catalog.targets.find(t=>t.id===id);
  assert.equal(t.category,'avenue');
  assert.deepEqual(t.osmNames,[name]);
  assert.equal(t.osmWayIds.length,count);
  assert.equal(t.officialDistanceM,undefined);
  for(const f of geo.features.filter(f=>f.properties.targetId===id)){
   const tags=f.properties.tags;
   assert.equal(f.properties.name,name);
   assert.ok(Object.entries(tags).some(([key,value])=>/^cycleway(?::(?:left|right|both))?$/.test(key)&&['lane','shared_lane'].includes(value)));
   assert.equal(tags.bicycle,undefined);
   assert.equal(tags.access,undefined);
  }
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
