import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const api=await import('../geographic/data.mjs').catch(()=>({}));
const source=JSON.parse(await readFile(new URL('../sources/el-durazno-osm.json',import.meta.url)));
const catalog=JSON.parse(await readFile(new URL('../data/el-durazno/geographic-catalog.json',import.meta.url)));
const nominalWays={
 'subida-buitrera':[[477168992,'Sendero Subida Buitrera']],
 'papaya':[[747369689,'Sendero Papaya']],
 'parcero':[[1003300262,'Sendero Parcero']],
 'mampato':[[478641797,'Sendero Mampato'],[1003300261,'Sendero Mampato']],
 'lomo-vetado':[[477170097,'Sendero Lomo Vetado']],
 'la-bala':[[1003300263,'Sendero la Bala']],
 'cebolla':[[1003300260,'Sendero Cebolla']],
 'los-saltos':[[1003300259,'Ssendero Los Saltos']],
 'xl':[[75311770,'Sendero XL'],[477174835,'Sendero XL']],
 'rock-n-roll':[[1003300257,'Sendero Rock´n Roll']],
 'calibre-12':[[1003300258,'Sendero Calibre 12']]
};
test('all nominally identified OSM ways are attributed only through their explicit written aliases',()=>{
 const geo=api.fromOsmSnapshot(source,catalog);
 assert.equal(catalog.targets.filter(t=>t.status==='osm-identified').length,11);
 assert.equal(geo.features.filter(f=>f.properties.targetId!==null).length,13);
 for(const [targetId,ways] of Object.entries(nominalWays)){
  const target=catalog.targets.find(t=>t.id===targetId);
  assert.deepEqual(target.osmWayIds,ways.map(([id])=>id),targetId);
  assert.deepEqual(target.osmNames,[...new Set(ways.map(([,name])=>name))],targetId);
  assert.deepEqual(geo.features.filter(f=>f.properties.targetId===targetId).map(f=>[f.properties.osmId,f.properties.name]),ways,targetId);
 }
 for(const id of [477170748,477174834,477174836,747368856,1003300264])assert.equal(geo.features.find(f=>f.properties.osmId===id).properties.targetId,null,String(id));
});
test('every geographic way retains every original ordered node and coordinate without joining separate ways',()=>{
 const geo=api.fromOsmSnapshot(source,catalog),nodes=new Map(source.elements.filter(e=>e.type==='node').map(n=>[n.id,n]));
 for(const w of source.elements.filter(e=>e.type==='way')){
  const f=geo.features.find(f=>f.properties.osmId===w.id);
  assert.equal(f.id,'osm-way-'+w.id);assert.equal(f.properties.osmVersion,w.version);assert.equal(f.properties.osmTimestamp,w.timestamp);
  assert.deepEqual(f.properties.nodeIds,w.nodes);assert.deepEqual(f.properties.tags,w.tags||{});
  assert.deepEqual(f.geometry.coordinates,w.nodes.map(id=>[nodes.get(id).lon,nodes.get(id).lat]));
 }
 for(const id of ['mampato','xl'])assert.equal(geo.features.filter(f=>f.properties.targetId===id).length,2);
});
test('converter refuses unnamed, fuzzy or alternative names even when an OSM ID is assigned',()=>{
 for(const mutate of [s=>s.elements.find(e=>e.id===1003300259).tags.name='Sendero Los Saltos',s=>s.elements.find(e=>e.id===1003300257).tags.name='Sendero Rock n Roll',s=>s.elements.find(e=>e.id===1003300263).tags.name='Sendero La Bala',s=>delete s.elements.find(e=>e.id===477170097).tags.name]){const bad=structuredClone(source);mutate(bad);assert.throws(()=>api.fromOsmSnapshot(bad,catalog),/nombre|geogr/i);}
 for(const [targetId,osmId] of [['la-bala',1003300264],['la-bala',477170748],['calibre-12',477174834],['papaya',747368856]]){const bad=structuredClone(catalog);bad.targets.find(t=>t.id===targetId).osmWayIds.push(osmId);assert.throws(()=>api.fromOsmSnapshot(source,bad),/nombre|geogr/i);}
 const missing=structuredClone(source);missing.elements=missing.elements.filter(e=>e.type!=='way'||e.id!==1003300261);assert.throws(()=>api.fromOsmSnapshot(missing,catalog),/geogr/i);
 const bad=api.fromOsmSnapshot(source,catalog);bad.features.find(f=>f.properties.osmId===1003300259).properties.name='Sendero Los Saltos';assert.throws(()=>api.validateGeographic(bad,catalog),/geogr/i);
});
test('geographic paths preserve exact ordered OSM nodes, identities and source versions',()=>{
 assert.equal(typeof api.fromOsmSnapshot,'function');
 const geo=api.fromOsmSnapshot(source,catalog),way=source.elements.find(e=>e.type==='way'&&e.id===477170097),nodes=new Map(source.elements.filter(e=>e.type==='node').map(n=>[n.id,n]));
 const lomo=geo.features.find(f=>f.properties.osmId===477170097);
 assert.deepEqual(lomo.geometry.coordinates,way.nodes.map(id=>[nodes.get(id).lon,nodes.get(id).lat]));
 assert.equal(lomo.geometry.coordinates.length,127);assert.equal(lomo.properties.osmVersion,6);
 assert.equal(lomo.properties.targetId,'lomo-vetado');assert.equal(geo.features.length,79);
 assert.deepEqual(geo.features.map(f=>f.id),source.elements.filter(e=>e.type==='way').map(w=>'osm-way-'+w.id));
});
test('native map rejects pixels, axis reversal, missing OSM nodes and unverified target names',()=>{
 assert.equal(typeof api.validateGeographic,'function');
 const value=api.fromOsmSnapshot(source,catalog);
 for(const mutate of [d=>d.metadata.coordinateSystem='image-pixels',d=>d.features[0].geometry.coordinates[0]=[400,500],d=>d.features[0].geometry.coordinates[0]=[-33.3,-70.5],d=>d.features[0].properties.targetId='starwars']){
  const bad=structuredClone(value);mutate(bad);assert.throws(()=>api.validateGeographic(bad,catalog));
 }
 const bad=structuredClone(source);bad.elements=bad.elements.filter(e=>e.type!=='node'||e.id!==source.elements.find(e=>e.type==='way').nodes[0]);assert.throws(()=>api.fromOsmSnapshot(bad,catalog),/nodo/i);
});
test('La Virgen connection and unnamed ways do not become the requested complete trails',()=>{
 assert.equal(typeof api.fromOsmSnapshot,'function');
 const geo=api.fromOsmSnapshot(source,catalog),connection=geo.features.find(f=>f.properties.osmId===477174834);
 assert.equal(connection.properties.targetId,null);
 assert.equal(geo.features.some(f=>['starwars','la-virgen'].includes(f.properties.targetId)),false);
 for(const id of ['starwars','la-virgen']){const target=catalog.targets.find(t=>t.id===id);assert.equal(target.status,'public-reference');assert.deepEqual(target.osmWayIds,[]);assert.equal(target.geometryImported,false);assert.equal(target.geometry,null);assert.equal(target.embedUrl,undefined);assert.match(target.publicMapUrl,/^https:\/\/www\.trailforks\.com\/trails\//);}
 assert.equal(catalog.visualToGeographicTransform,null);assert.equal(catalog.navigationValidated,false);
});
test('cartographic distance follows every geodesic edge and does not use photograph lengths',()=>{
 assert.equal(typeof api.lineLength,'function');
 assert.ok(Math.abs(api.lineLength([[0,0],[1,0]])-111195.08)<1);
 assert.ok(api.lineLength([[0,0],[0,1],[1,1]])>220000);
 const lomo=api.fromOsmSnapshot(source,catalog).features.find(f=>f.properties.targetId==='lomo-vetado');
 assert.ok(api.lineLength(lomo.geometry.coordinates)>800);assert.ok(api.lineLength(lomo.geometry.coordinates)<3000);
});
test('independent fixed source anchors catch changed node ordering and swapped axes',()=>{
 const lomo=api.fromOsmSnapshot(source,catalog).features.find(f=>f.properties.targetId==='lomo-vetado');
 for(const [index,node,coordinates] of [[0,4705608466,[-70.4923871,-33.3040099]],[63,4705609117,[-70.5005836,-33.3094445]],[126,4705608441,[-70.5036907,-33.3138365]]]){assert.equal(lomo.properties.nodeIds[index],node);assert.deepEqual(lomo.geometry.coordinates[index],coordinates);}
 const subida=api.fromOsmSnapshot(source,catalog).features.find(f=>f.properties.targetId==='subida-buitrera');assert.equal(subida.properties.osmId,477168992);assert.equal(subida.properties.osmVersion,11);assert.equal(subida.geometry.coordinates.length,145);
});
