import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root = new URL('../', import.meta.url);
const load = async () => JSON.parse(await readFile(new URL('data/el-durazno/visual-trails.json', root)));
test('visual data exists and preserves original source bytes and dimensions', async () => {
 const data=await load();
 assert.equal(data.coordinateSystem,'image-pixels');
 assert.deepEqual([data.image.width,data.image.height],[900,1100]);
 const hash=createHash('sha256').update(await readFile(new URL(data.image.url,root))).digest('hex');
 assert.equal(hash,data.image.sha256);
 assert.deepEqual(data.image.transform,[1,0,0,1,0,0]);
});
test('only the three named trails; unique fragment IDs and in-bounds finite coordinates', async()=>{
 const d=await load();
 assert.deepEqual(d.trails.map(t=>t.name),['Starwars','La Virgen','Lomo Vetado']);
 const ids=[...d.trails,...d.segments,...d.gaps,...d.nodes].map(x=>x.id);
 assert.equal(new Set(ids).size,ids.length);
 for(const s of d.segments){
  assert.ok(d.trails.some(t=>t.id===s.trailId)); assert.equal(s.status,'visible');
  assert.ok(s.points.length>=2); assert.ok(s.sourceId);
  for(const p of s.points){assert.equal(p.length,2);assert.ok(p.every(Number.isFinite));assert.ok(p[0]>=0&&p[0]<=900&&p[1]>=0&&p[1]<=1100);}
 }
 assert.deepEqual(d.connections,[]); assert.deepEqual(d.geographicCorrespondences,[]);
 assert.equal(d.georeferencing.status,'unvalidated');
 assert.ok(!JSON.stringify(d.segments).includes('latitude'));
});
test('label occlusions are gaps, never connecting geometry',async()=>{
 const d=await load();
 for(const t of d.trails){assert.ok(d.gaps.some(g=>g.trailId===t.id));assert.ok(d.segments.filter(s=>s.trailId===t.id).length>=2);}
 for(const g of d.gaps){assert.ok(g.reason);assert.equal(g.geometry,null);assert.ok(g.bounds.length===4);}
 assert.equal(d.digitization.simplificationTolerancePx,1);
});
test('geographic evidence stays separate and cannot silently become image control points',async()=>{
 const geo=JSON.parse(await readFile(new URL('data/el-durazno/geographic-references.json',root)));
 assert.equal(geo.references.length,10);assert.deepEqual(geo.controlPoints,[]);assert.equal(geo.calibration.transform,null);assert.equal(geo.calibration.useForNavigation,false);
 for(const ref of geo.references){assert.equal(ref.acceptedForCalibration,false);assert.equal(ref.imagePoint,null);assert.ok(geo.sources.some(s=>s.id===ref.sourceId));assert.match(ref.osm.url,/openstreetmap.org\/node\/\d+/);assert.ok(ref.osm.version);assert.equal(ref.coordinate.crs,'EPSG:4326');}
});
