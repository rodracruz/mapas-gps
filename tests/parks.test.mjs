import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const api=await import('../geographic/catalog.mjs').catch(()=>({}));
const catalog=JSON.parse(await readFile(new URL('../data/el-durazno/geographic-catalog.json',import.meta.url)));
test('park catalog supports sourced amenities and primary trails without invented geography',()=>{
 assert.equal(typeof api.validateCatalog,'function','park catalog validator is available');
 assert.equal(api.validateCatalog(catalog),catalog);assert.equal(catalog.park.id,'el-durazno');
 assert.deepEqual(catalog.park.primaryTargetIds,['subida-buitrera','la-virgen']);assert.ok(catalog.park.amenities.length>=4);
 assert.ok(catalog.park.amenities.every(a=>a.sourceUrl.startsWith('https://www.outlife.cl/')));assert.equal(catalog.park.amenities.some(a=>a.id==='estacionamiento'),false);
 for(const id of ['starwars','la-virgen']){const t=catalog.targets.find(t=>t.id===id);assert.equal(t.geometry,null);assert.deepEqual(t.osmWayIds,[]);assert.equal(t.embedUrl,undefined);}
});
test('catalog rejects duplicate trails, unsupported source links and unbacked route assignments',()=>{
 assert.equal(typeof api.validateCatalog,'function');
 for(const mutate of [c=>c.targets.push(c.targets[0]),c=>c.targets[0].publicMapUrl='javascript:alert(1)',c=>c.park.primaryTargetIds.push('missing'),c=>c.targets.find(t=>t.id==='la-virgen').osmWayIds.push(477174834)]){const bad=structuredClone(catalog);mutate(bad);assert.throws(()=>api.validateCatalog(bad));}
});
test('trail details never manufacture personal speed or borrow ascent from another geometry',()=>{
 assert.equal(typeof api.describeTrail,'function');const t=catalog.targets.find(t=>t.id==='la-virgen');const stats=api.describeTrail(t,[]);
 assert.equal(stats.maxSpeed,'Sin registros');assert.equal(stats.elevationGain,'Sin datos');assert.equal(stats.elevationLoss,'Sin datos');assert.equal(stats.distance,'Sin trazado disponible');assert.equal(stats.difficulty,'Principiante');
});
