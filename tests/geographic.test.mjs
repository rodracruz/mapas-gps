import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const api=await import('../geographic/data.mjs').catch(()=>({}));
const source=JSON.parse(await readFile(new URL('../sources/el-durazno-osm.json',import.meta.url)));
const catalog=JSON.parse(await readFile(new URL('../data/el-durazno/geographic-catalog.json',import.meta.url)));
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
