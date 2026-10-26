import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {withGeographicBuildLock} from './helpers/geographic-build-lock.mjs';
test('standalone embeds exact source bytes, local map code and mobile flow without provider iframe',()=>withGeographicBuildLock(async()=>{
 const result=spawnSync('python3',['scripts/build-geographic-standalone.py'],{cwd:new URL('../',import.meta.url),encoding:'utf8'});assert.equal(result.status,0,result.stderr);
 const html=await readFile(new URL('../dist/mapas-gps-parques.html',import.meta.url),'utf8');
 assert.match(html,/const BikerideChrome=/,'standalone includes the real bikeride navigation controller');
 assert.match(html,/data:font\/ttf;base64,/,'Stitch typography is available without external font requests');
 assert.doesNotMatch(html,/href="\.\/geographic\/bikeride\.css"/,'bikeride styles are embedded in standalone');
 assert.doesNotMatch(html,/id="embedded-park-photo"/,'public build excludes private photo data from earlier builds');
 assert.match(html,/id="park-picker"/);assert.match(html,/id="route-sheet"/);assert.doesNotMatch(html,/<iframe|src="\.\/vendor|src="\.\/geographic/);
 const catalog=JSON.parse(html.match(/id="embedded-geographic-catalog"[^>]*>(.*?)<\/script>/s)[1]);
 const bytes=Buffer.from(html.match(/id="embedded-osm-source"[^>]*>(.*?)<\/script>/s)[1],'base64');assert.equal(createHash('sha256').update(bytes).digest('hex'),catalog.sourceSnapshotSha256);
 assert.deepEqual(bytes,await readFile(new URL('../sources/el-durazno-osm.json',import.meta.url)));
 assert.match(html,/href="https:\/\/rodracruz.github.io\/mapas-gps\/"/,'legacy library stays at its existing origin in hosted artifact');
 const sibling=await readFile(new URL('../dist/parquemet.html',import.meta.url),'utf8');assert.match(sibling,/id="embedded-park-catalog"/);assert.doesNotMatch(sibling,/src="\.\/geographic|src="\.\/vendor|<iframe/);const parkCatalog=JSON.parse(sibling.match(/id="embedded-park-catalog"[^>]*>(.*?)<\/script>/s)[1]);assert.equal(parkCatalog.park.id,'parquemet');const parkBytes=Buffer.from(sibling.match(/id="embedded-park-source"[^>]*>(.*?)<\/script>/s)[1],'base64');assert.equal(createHash('sha256').update(parkBytes).digest('hex'),parkCatalog.sourceSnapshotSha256);assert.deepEqual(parkBytes,await readFile(new URL('../'+parkCatalog.sourceSnapshot,import.meta.url)));assert.equal(await readFile(new URL('../dist/index.html',import.meta.url),'utf8'),html);assert.match(sibling,/href="\.\/index.html"/,'sibling returns to executable shared picker');
 assert.match(sibling,/const BikerideChrome=/);assert.match(sibling,/data:font\/ttf;base64,/);
 for(const file of ['LICENSE-Inter.txt','LICENSE-Sora.txt']){
  const notice=(await readFile(new URL('../vendor/fonts/'+file,import.meta.url),'utf8')).trim();
  assert.ok(html.includes(notice),'standalone carries the full font notice '+file);
  assert.ok(sibling.includes(notice),'park standalone carries the full font notice '+file);
 }
 const visual=Buffer.from(sibling.match(/id="embedded-park-visual"[^>]*>(.*?)<\/script>/s)[1],'base64');const registry=JSON.parse(sibling.match(/id="embedded-parks-directory"[^>]*>(.*?)<\/script>/s)[1]);assert.equal(createHash('sha256').update(visual).digest('hex'),registry.parks.find(p=>p.id==='parquemet').visualSha256);assert.deepEqual(visual,await readFile(new URL('../data/parquemet/visual-cycling-trails.json',import.meta.url)));const shared=Buffer.from(sibling.match(/id="embedded-park-shared-visual"[^>]*>(.*?)<\/script>/s)[1],'base64');assert.equal(createHash('sha256').update(shared).digest('hex'),registry.parks.find(p=>p.id==='parquemet').sharedVisualSha256);assert.deepEqual(shared,await readFile(new URL('../data/parquemet/visual-paseo-trails.json',import.meta.url)));const avenues=Buffer.from(sibling.match(/id="embedded-park-avenue-visual"[^>]*>(.*?)<\/script>/s)[1],'base64');assert.equal(createHash('sha256').update(avenues).digest('hex'),registry.parks.find(p=>p.id==='parquemet').avenueVisualSha256);assert.deepEqual(avenues,await readFile(new URL('../data/parquemet/visual-avenues.json',import.meta.url)));assert.match(sibling,/class="document-modes"/);assert.match(html,/const TrailPreview=/);
}));
