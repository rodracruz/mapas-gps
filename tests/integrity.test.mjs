import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateDataset} from '../review/geometry.mjs';

const data=JSON.parse(await readFile(new URL('../data/el-durazno/visual-trails.json',import.meta.url)));
const changed=mutate=>{const value=structuredClone(data);mutate(value);return value;};

test('rejects image transforms that this image-pixel viewer cannot apply',()=>{
 for(const transform of [[2,0,0,2,0,0],[1,0,0,1,10,0],null,[],[1,0,0,1,0,NaN]]){
  assert.throws(()=>validateDataset(changed(d=>d.image.transform=transform)),/transformación de imagen/);
 }
});

test('fragment ends must match separate, unshared visual nodes',()=>{
 assert.throws(()=>validateDataset(changed(d=>d.nodes[0].point=[0,0])),/extremos/);
 assert.throws(()=>validateDataset(changed(d=>d.segments[0].startNodeId=d.segments[0].endNodeId)),/extremos/);
 const shared=changed(d=>{
  const [first,second]=d.segments;
  second.startNodeId=first.endNodeId;
  second.points[0]=structuredClone(first.points.at(-1));
 });
 assert.throws(()=>validateDataset(shared),/extremos/);
});

test('rejects a selectable trail without visible fragments before fitting its extent',()=>{
 assert.throws(()=>validateDataset(changed(d=>d.segments=d.segments.filter(s=>s.trailId!=='lomo-vetado'))),/fragmentos visibles/);
});

test('rejects an edge across a pending area even when both vertices are outside it',()=>{
 const d=changed(d=>{
  const gap=d.gaps[0],segment=d.segments.find(s=>s.trailId===gap.trailId);
  const [x,y,w,h]=gap.bounds;
  segment.points=[[x-10,y+h/2],[x+w+10,y+h/2]];
  d.nodes.find(n=>n.id===segment.startNodeId).point=structuredClone(segment.points[0]);
  d.nodes.find(n=>n.id===segment.endNodeId).point=structuredClone(segment.points[1]);
 });
 assert.throws(()=>validateDataset(d),/zona pendiente/);
});

test('pending areas retain explicit pending status and known provenance',()=>{
 assert.throws(()=>validateDataset(changed(d=>d.gaps[0].status='resolved')),/Datos de trazado inválidos/);
 assert.throws(()=>validateDataset(changed(d=>d.gaps[0].sourceId='unknown-source')),/Datos de trazado inválidos/);
});
