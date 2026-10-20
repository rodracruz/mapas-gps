import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateCatalog} from '../geographic/catalog.mjs';
import {bikeMatchingNetwork} from '../geographic/network.mjs';
import {fromOsmSnapshot} from '../geographic/data.mjs';
import {createHash} from 'node:crypto';
const catalog=JSON.parse(await readFile('data/parquemet/geographic-catalog.json'));
const expected=[['paseo-infancia','Tramo Parque B. de la Infancia',940],['paseo-sentidos','Sendero de los Sentidos',540],['paseo-bellavista','Tramo Bellavista',1000],['paseo-pedro-valdivia','Tramo Pedro de Valdivia',1500],['paseo-piramide','Tramo Pirámide / Jardín Japonés',3700],['paseo-cascada','Tramo La Cascada',1200]];
test('Parquemet includes all six shared-use Paseo entries from the same official edition',()=>{
 assert.equal(validateCatalog(catalog),catalog);const shared=catalog.targets.filter(t=>t.category==='shared-trail');assert.deepEqual(shared.map(t=>[t.id,t.name,t.officialDistanceM]),expected);for(const t of shared){assert.equal(t.visualTrailId,t.id);assert.equal(t.geometry,null);assert.equal(t.operationConfirmed,false);assert.equal(t.officialDistanceSource,'https://mapas.parquemet.cl/doc/MapaParque.pdf');}assert.equal(catalog.targets.filter(t=>t.category==='cycling-trail').length,8);
});
test('shared pedestrian ways without explicit bicycle permission never enter the GPS matcher',()=>{
 const feature=(id,tags,category='shared-trail')=>({properties:{osmId:id,targetId:'paseo-pedro-valdivia',targetCategory:category,tags}}),geo={metadata:{source:'OpenStreetMap'},features:[feature(1,{highway:'pedestrian',bicycle:'designated'}),feature(2,{highway:'pedestrian',bicycle:'no'}),feature(3,{highway:'pedestrian'}),feature(4,{highway:'pedestrian',bicycle:'yes',access:'private'}),feature(5,{highway:'pedestrian',bicycle:'yes',access:'permissive'}),feature(6,{highway:'path'},'cycling-trail')]};assert.deepEqual(bikeMatchingNetwork(geo).features.map(f=>f.properties.osmId),[1,5,6]);
});
test('the fresh atomic receipt preserves all prior objects and binds all six named geographic sets',async()=>{
 const bytes=await readFile(catalog.sourceSnapshot),source=JSON.parse(bytes),old=JSON.parse(await readFile('sources/parquemet-osm.json'));assert.equal(createHash('sha256').update(bytes).digest('hex'),catalog.sourceSnapshotSha256);assert.equal(source.originalResponseSha256,'910f6834bd9f4b49ea81d2e5523123bc69ec95a90ea1b8d4bd7b0ee97602a829');const objects=new Map(source.elements.map(e=>[e.type+e.id,e]));for(const object of old.elements)assert.deepEqual(objects.get(object.type+object.id),object,'old source object remains unchanged');
 const projection=[...objects.values()].filter(e=>e.type!=='relation').sort((a,b)=>a.type.localeCompare(b.type)||a.id-b.id).map(e=>[e.type,e.id,e.version,e.timestamp,e.type==='node'?[e.lon,e.lat]:e.nodes]);assert.equal(createHash('sha256').update(JSON.stringify(projection)).digest('hex'),'27f7f5f0d26e290c811337000f71a030c010d5ecf076c8291d2885c2fdc4e1ed');const geo=fromOsmSnapshot(source,catalog),matching=bikeMatchingNetwork(geo);assert.equal(geo.features.length,106);assert.equal(source.elements.filter(e=>e.type==='node').length,2615);assert.equal(geo.features.filter(f=>f.properties.targetId).length,90);assert.equal(matching.features.length,84);
 const expectedCounts=[1,4,3,7,12,4];for(const [index,[id]]of expected.entries()){const target=catalog.targets.find(t=>t.id===id),features=geo.features.filter(f=>f.properties.targetId===id);assert.equal(features.length,expectedCounts[index]);assert.equal(target.status,'osm-identified');for(const f of features){assert.equal(f.properties.targetCategory,'shared-trail');assert.ok(target.osmNames.includes(f.properties.name));}}
 for(const id of [1308348019,1308348023,256510467]){assert.ok(geo.features.some(f=>f.properties.osmId===id));assert.equal(matching.features.some(f=>f.properties.osmId===id),false);}assert.equal(catalog.visualToGeographicTransform,null);assert.equal(catalog.navigationValidated,false);
});
