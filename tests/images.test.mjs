import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const api=await import('../review/images.mjs').catch(()=>({}));
const cfg=JSON.parse(await readFile(new URL('../data/el-durazno/review-images.json',import.meta.url)));
const data=JSON.parse(await readFile(new URL('../data/el-durazno/visual-trails.json',import.meta.url)));
test('reference rasters declare the unchanged geometry frame and pinned source hashes',async()=>{
 assert.equal(typeof api.validateReviewImages,'function');assert.equal(api.validateReviewImages(cfg,data.image),cfg);
 for(const source of cfg.sources){const bytes=await readFile(new URL('../'+source.url,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),source.sha256);assert.equal(source.naturalWidth/source.rasterScale,900);assert.equal(source.naturalHeight/source.rasterScale,1100);}
 for(const mutate of [c=>c.coordinateFrame.width=1800,c=>c.sources[0].naturalWidth=900,c=>c.sources[1].sha256='a'.repeat(64),c=>c.defaultId='unknown',c=>c.sources.push(c.sources[0])]){const wrong=structuredClone(cfg);mutate(wrong);assert.throws(()=>api.validateReviewImages(wrong,data.image));}
});
test('reference bytes are verified before display, including changed valid JPEG bytes',async()=>{
 assert.equal(typeof api.verifyImageBytes,'function');const photo=await readFile(new URL('../elh-durazno.jpg',import.meta.url));await api.verifyImageBytes(photo,data.image.sha256);await assert.rejects(()=>api.verifyImageBytes(Buffer.concat([photo,Buffer.from('changed')]),data.image.sha256),/no coincide con la fuente/);
});
