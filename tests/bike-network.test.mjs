import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fromOsmSnapshot} from '../geographic/data.mjs';
import {bikeMatchingNetwork} from '../geographic/network.mjs';
test('Parquemet GPS excludes restricted cycling trails and unverified or bicycle-prohibited avenue context',async()=>{
 const catalog=JSON.parse(await readFile('data/parquemet/geographic-catalog.json'));
 const geo=fromOsmSnapshot(JSON.parse(await readFile(catalog.sourceSnapshot)),catalog);
 const copy=structuredClone(geo),matched=bikeMatchingNetwork(geo);
 assert.equal(geo.features.length,116);
 assert.equal(geo.features.filter(f=>f.properties.targetId).length,103);
 assert.equal(matched.features.length,91);
 for(const id of [479769658,691091446,862880882,158170398,480868075,1223734901,1308348019,1308348023,256510467])assert.equal(matched.features.some(f=>f.properties.osmId===id),false);
 for(const [osmId,targetId] of [[691091446,'pa-arriba'],[862880882,'zorzal']])assert.equal(geo.features.find(f=>f.properties.osmId===osmId).properties.targetId,targetId);
 assert.deepEqual(geo,copy);
 assert.ok(matched.features.some(f=>f.properties.targetId==='anfiteatro'),'unrestricted named segments are not falsely all marked closed');
});
test('a future bike prohibition or staircase is excluded even with a matched trail ID',()=>{const geo={metadata:{source:'OpenStreetMap'},features:[{properties:{targetId:'a',tags:{bicycle:'no'}}},{properties:{targetId:'b',tags:{access:'private'}}},{properties:{targetId:'c',tags:{highway:'steps'}}},{properties:{targetId:'d',tags:{bicycle:'designated'}}}]};assert.deepEqual(bikeMatchingNetwork(geo).features.map(f=>f.properties.targetId),['d']);assert.throws(()=>bikeMatchingNetwork({metadata:{source:'PDF'},features:[]}));});
