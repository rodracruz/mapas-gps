import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
const {sha256}=await import('../review/sha256.mjs').catch(()=>({}));
test('portable SHA-256 matches known vectors, block boundaries and actual photo',async()=>{
 assert.equal(typeof sha256,'function');
 for(const [message,expected] of [['','e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],['abc','ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'],['a'.repeat(1000000),'cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0']])assert.equal(sha256(new TextEncoder().encode(message)),expected);
 for(const size of [55,56,63,64,65,119,120,127,128,129]){const bytes=Uint8Array.from({length:size},(_,i)=>(i*71)%256);assert.equal(sha256(bytes),createHash('sha256').update(bytes).digest('hex'));}
 assert.equal(sha256(await readFile(new URL('../elh-durazno.jpg',import.meta.url))),'c9fde34725691801933b3ba72f887a31677dba305d30f0f938f0ddf81211d018');
});
