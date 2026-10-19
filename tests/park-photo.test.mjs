import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
test('private build embeds original photograph bytes for the park screen without adding them to source',async()=>{
 const r=spawnSync('python3',['scripts/build-geographic-standalone.py','--reference-photo','elh-durazno.jpg'],{cwd:new URL('../',import.meta.url),encoding:'utf8'});assert.equal(r.status,0,r.stderr);
 const html=await readFile(new URL('../dist/mapas-gps-parques.html',import.meta.url),'utf8');
 const embedded=html.match(/id="embedded-park-photo"[^>]*>(.*?)<\/script>/s);assert.ok(embedded,'park screen has its own original photograph');
 const data=JSON.parse(embedded[1]),bytes=Buffer.from(data.dataUrl.split(',')[1],'base64'),original=await readFile(new URL('../elh-durazno.jpg',import.meta.url));
 assert.deepEqual(bytes,original);assert.equal(data.sha256,createHash('sha256').update(original).digest('hex'));assert.equal(data.width,900);assert.equal(data.height,1100);
 assert.match(html,/id="park-photo" src="\.\/sources\/el-durazno-official-2022\.jpg"/);assert.match(html,/id="open-original-photo"/);assert.match(html,/id="park-photo-dialog"/);
});
