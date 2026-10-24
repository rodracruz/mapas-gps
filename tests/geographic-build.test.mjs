import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
test('standalone embeds exact source bytes, local map code and mobile flow without provider iframe',async()=>{
 const result=spawnSync('python3',['scripts/build-geographic-standalone.py'],{cwd:new URL('../',import.meta.url),encoding:'utf8'});assert.equal(result.status,0,result.stderr);
 const html=await readFile(new URL('../dist/mapas-gps-parques.html',import.meta.url),'utf8');
 assert.match(html,/id="park-picker"/);assert.match(html,/id="route-sheet"/);assert.doesNotMatch(html,/<iframe|src="\.\/vendor|src="\.\/geographic/);
 const catalog=JSON.parse(html.match(/id="embedded-geographic-catalog"[^>]*>(.*?)<\/script>/s)[1]);
 const bytes=Buffer.from(html.match(/id="embedded-osm-source"[^>]*>(.*?)<\/script>/s)[1],'base64');assert.equal(createHash('sha256').update(bytes).digest('hex'),catalog.sourceSnapshotSha256);
 assert.deepEqual(bytes,await readFile(new URL('../sources/el-durazno-osm.json',import.meta.url)));
 assert.match(html,/href="https:\/\/rodracruz.github.io\/mapas-gps\/"/,'legacy library stays at its existing origin in hosted artifact');
 const sibling=await readFile(new URL('../dist/parquemet.html',import.meta.url),'utf8');assert.match(sibling,/id="embedded-park-catalog"/);assert.doesNotMatch(sibling,/src="\.\/geographic|src="\.\/vendor|<iframe/);const parkCatalog=JSON.parse(sibling.match(/id="embedded-park-catalog"[^>]*>(.*?)<\/script>/s)[1]);assert.equal(parkCatalog.park.id,'parquemet');const parkBytes=Buffer.from(sibling.match(/id="embedded-park-source"[^>]*>(.*?)<\/script>/s)[1],'base64');assert.equal(createHash('sha256').update(parkBytes).digest('hex'),parkCatalog.sourceSnapshotSha256);assert.deepEqual(parkBytes,await readFile(new URL('../sources/parquemet-osm.json',import.meta.url)));assert.equal(await readFile(new URL('../dist/index.html',import.meta.url),'utf8'),html);assert.match(sibling,/href="\.\/index.html"/,'sibling returns to executable shared picker');
 const visual=Buffer.from(sibling.match(/id="embedded-park-visual"[^>]*>(.*?)<\/script>/s)[1],'base64');const registry=JSON.parse(sibling.match(/id="embedded-parks-directory"[^>]*>(.*?)<\/script>/s)[1]);assert.equal(createHash('sha256').update(visual).digest('hex'),registry.parks.find(p=>p.id==='parquemet').visualSha256);assert.deepEqual(visual,await readFile(new URL('../data/parquemet/visual-cycling-trails.json',import.meta.url)));assert.match(sibling,/class="document-modes"/);assert.match(html,/const TrailPreview=/);
});
