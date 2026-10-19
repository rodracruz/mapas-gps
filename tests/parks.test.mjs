import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const api=await import('../geographic/catalog.mjs').catch(()=>({}));
const catalog=JSON.parse(await readFile(new URL('../data/el-durazno/geographic-catalog.json',import.meta.url)));
const signTargets=[['chilling','Chilling'],['papaya','Papaya'],['la-virgen','La Virgen'],['parcero','Parcero'],['skills','Skills'],['mampato','Mampato'],['starwars','Starwars'],['cactus','Cactus'],['lomo-vetado','Lomo Vetado'],['la-bala','La Bala'],['cebolla','Cebolla'],['los-saltos','Los Saltos'],['el-gringo','El Gringo'],['el-duro','El Duro'],['xl','XL'],['rock-n-roll','Rock N’Roll'],['las-nieves','Las Nieves'],['calibre-12','Calibre 12'],['calibre-loco','Calibre Loco'],['mordor','Mordor']];
test('catalog covers all twenty sign names and preserves the separate Buitrera ascent',()=>{
 assert.equal(catalog.targets.length,21);
 assert.deepEqual(catalog.targets.map(t=>[t.id,t.name]),[['subida-buitrera','Subida Buitrera'],...signTargets]);
 assert.equal(catalog.schemaVersion,1);
 assert.equal(catalog.sourceSnapshotSha256,'b8926fb02ddcc2410850d831312e64a5c51e5aeb9db49ce970a86e418a0df318');
 for(const t of catalog.targets){assert.equal(t.visualTrailId,t.id==='subida-buitrera'?null:t.id);assert.equal(t.elevationGainM,null);assert.equal(t.elevationLossM,null);assert.equal(t.geometry,null);assert.ok(Array.isArray(t.osmNames));}
 const levels=['Principiante','Principiante','Principiante','Principiante','Intermedio','Intermedio','Intermedio','Intermedio','Intermedio','Intermedio','Avanzado','Avanzado','Avanzado','Avanzado','Experto','Experto','Experto','Experto','Experto','Experto'];
 const styles=['Park','Trail','Park','Park','Park','Park','Trail','Trail','Park','Park','Park','Park','Park','Trail','Trail','Trail','Trail','Park','Trail','Park'];
 assert.equal(catalog.targets[0].difficulty,null);
 for(const [i,[id]] of signTargets.entries()){const t=catalog.targets.find(t=>t.id===id);assert.equal(t.difficulty.label,levels[i],id);assert.equal(t.difficulty.style,styles[i],id);assert.match(t.difficulty.sourceUrl,/^https:\/\/www\.outlife\.cl\//);}
});
test('ten sign trails remain public references with no invented geographic geometry',()=>{
 const pending=catalog.targets.filter(t=>t.status==='public-reference');
 assert.deepEqual(pending.map(t=>t.id),['chilling','la-virgen','skills','starwars','cactus','el-gringo','el-duro','las-nieves','calibre-loco','mordor']);
 for(const t of pending){assert.deepEqual(t.osmWayIds,[]);assert.deepEqual(t.osmNames,[]);assert.equal(t.geometryImported,false);assert.equal(t.geometry,null);if(!['la-virgen','starwars'].includes(t.id))assert.equal(t.publicMapUrl,catalog.park.sourceUrl);}
 assert.equal(catalog.targets.find(t=>t.id==='la-virgen').references[0].id,205330);
 assert.equal(catalog.targets.find(t=>t.id==='starwars').references[0].id,76316);
});
test('park catalog supports sourced amenities and primary trails without invented geography',()=>{
 assert.equal(typeof api.validateCatalog,'function','park catalog validator is available');
 assert.equal(api.validateCatalog(catalog),catalog);assert.equal(catalog.park.id,'el-durazno');
 assert.deepEqual(catalog.park.primaryTargetIds,['subida-buitrera','la-virgen']);assert.ok(catalog.park.amenities.length>=4);
 assert.ok(catalog.park.amenities.every(a=>a.sourceUrl.startsWith('https://www.outlife.cl/')));assert.equal(catalog.park.amenities.some(a=>a.id==='estacionamiento'),false);
 for(const id of ['starwars','la-virgen']){const t=catalog.targets.find(t=>t.id===id);assert.equal(t.geometry,null);assert.deepEqual(t.osmWayIds,[]);assert.equal(t.embedUrl,undefined);}
});
test('catalog rejects duplicate trails, unsupported source links and unbacked route assignments',()=>{
 assert.equal(typeof api.validateCatalog,'function');
 for(const mutate of [c=>c.targets.push(c.targets[0]),c=>c.targets[0].publicMapUrl='javascript:alert(1)',c=>c.park.primaryTargetIds.push('missing'),c=>c.targets.find(t=>t.id==='la-virgen').osmWayIds.push(477174834),c=>c.targets[0].osmNames=[],c=>c.targets[0].osmNames=[''],c=>c.targets[0].osmNames=['Sendero Subida Buitrera','Sendero Subida Buitrera'],c=>c.targets[0].visualTrailId='missing trail',c=>c.targets.find(t=>t.id==='la-virgen').osmNames=['La Virgen'],c=>c.targets.find(t=>t.id==='la-virgen').difficulty.style='Expert']){const bad=structuredClone(catalog);mutate(bad);assert.throws(()=>api.validateCatalog(bad));}
});
test('trail details never manufacture personal speed or borrow ascent from another geometry',()=>{
 assert.equal(typeof api.describeTrail,'function');const t=catalog.targets.find(t=>t.id==='la-virgen');const stats=api.describeTrail(t,[]);
 assert.equal(stats.maxSpeed,'Sin registros');assert.equal(stats.elevationGain,'Sin datos');assert.equal(stats.elevationLoss,'Sin datos');assert.equal(stats.distance,'Sin trazado disponible');assert.equal(stats.difficulty,'Principiante');
});
