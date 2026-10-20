import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, mkdtemp, writeFile, rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const data=await readFile(new URL('../data/parquemet/visual-avenues.json',import.meta.url),'utf8').then(JSON.parse).catch(()=>null);
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const expected=[
 ['avenida-pedro-bannen','Av. Pedro Bannen','< Av. Pedro Bannen >'],
 ['avenida-alberto-mackenna','Av. Alberto Mackenna','Av. Alberto Mackenna »'],
 ['avenida-abate-molina','Av. Abate Molina','< Av. Abate Molina >'],
 ['avenida-carlos-martner','Av. Carlos Martner','< Av. Carlos Martner >'],
 ['avenida-carlos-reed','Av. Carlos Reed','< Av. Carlos Reed >'],
 ['avenida-claudio-gay','Av. Claudio Gay','Av. Claudio Gay »'],
 ['avenida-federico-albert','Av. Federico Albert','« Av. Federico Albert'],
 ['avenida-manuel-zanartu','Av. Manuel Zañartu','< Av. Manuel Zañartu >'],
 ['avenida-la-montana','Av. La Montaña','< Av. La Montaña >'],
 ['avenida-gabriela-mistral','Av. Gabriela Mistral','Av. Gabriela Mistral >'],
];
function receipt(){assert.ok(data,'original-map avenue crop records must exist');return data;}
function contains(outer,inner){return inner[0]>=outer[0]&&inner[1]>=outer[1]&&inner[0]+inner[2]<=outer[0]+outer[2]&&inner[1]+inner[3]<=outer[1]+outer[3];}

test('avenue views bind the retained PDF and unchanged original image',async()=>{
 const d=receipt();
 for(const source of [d.source,d.image]){
  const raw=await readFile(join(root,source.path));
  assert.equal(source.sha256,sha256(raw));
  assert.equal(source.bytes,raw.length);
 }
 assert.equal(d.coordinateSystem,'document-pixels');
 assert.deepEqual([d.image.width,d.image.height],[6690,2835]);
 assert.deepEqual(d.transform,[1,0,0,1,0,0]);
 assert.equal(d.georeferencing.transform,null);
 assert.equal(d.georeferencing.useForNavigation,false);
});

test('reviewed map crops contain the exact source labels for ten avenues and retain an unassigned approach',()=>{
 const d=receipt();
 assert.deepEqual(d.views.map(v=>[v.id,v.name,v.sourceLabelEvidence.text]),expected);
 for(const v of [...d.views,...d.pendingApproachViews]){
  assert.equal(v.category,'avenue');
  assert.equal(v.viewKind,'original-map-crop');
  assert.deepEqual(v.viewBox,v.sourceRect);
  assert.equal(v.geometryStatus,'not-extracted');
  assert.deepEqual(v.paths,[]);
  assert.ok(contains([0,0,d.image.width,d.image.height],v.sourceRect));
  assert.ok(contains(v.sourceRect,v.sourceLabelEvidence.bounds),v.id);
  assert.equal(v.sourceLabelEvidence.fragments.map(f=>f.text).join(''),v.sourceLabelEvidence.text);
  assert.ok(v.sourceLabelEvidence.fragments.every(f=>Number.isInteger(f.blockIndex)&&contains(v.sourceRect,f.bounds)));
 }
 assert.deepEqual(d.pendingApproachViews.map(v=>v.id),['los-turistas']);
 assert.equal(d.pendingApproachViews[0].scope,'approach-outside-park');
 assert.equal(d.pendingApproachViews[0].assignedToTarget,false);
 assert.ok(d.views.every(v=>v.scope==='inside-park'));
});

test('compound road polygons and table-only names are never promoted to avenue curves',()=>{
 const d=receipt();
 assert.deepEqual(d.trails,[]);
 assert.deepEqual(d.unassignedSourceDrawingGroups.map(g=>[g.drawingIndex,g.type,g.operationCount,g.cubicCount,g.lineCount]),[[738,'f',600,547,53],[748,'f',1852,1418,434]]);
 for(const g of d.unassignedSourceDrawingGroups){
  assert.equal(g.assignedToAvenue,false);
  assert.equal(g.centerlineAvailable,false);
  assert.ok(!('paths' in g),'metadata is not a route path assignment');
 }
 assert.deepEqual(d.pendingSourceMentions.map(v=>v.id),['avenida-pablo-neruda','camino-rafael-elizalde']);
 for(const v of d.pendingSourceMentions){
  assert.equal(v.geometryStatus,'not-extracted');
  assert.equal(v.mapLocationStatus,'not-located-in-map');
  assert.ok(!('viewBox' in v));
  assert.ok(contains(v.referenceTableRect,v.sourceLabelEvidence.bounds));
 }
 assert.equal(d.topology.connectionsInferred,false);
 assert.equal(d.fidelity.rasterTracing,false);
 assert.equal(d.fidelity.routeExtentInferred,false);
});

test('avenue provenance regenerates byte-for-byte and rejects altered PDF or image bytes',async()=>{
 receipt();
 const checked=spawnSync('python3',['scripts/extract-parquemet-avenues.py','--check'],{cwd:root,encoding:'utf8'});
 assert.equal(checked.status,0,checked.stderr||checked.stdout);
 const dir=await mkdtemp(join(tmpdir(),'parquemet-avenues-'));
 try{
  for(const [flag,path] of [['--pdf','sources/parquemet-mapa-oficial.pdf'],['--image','sources/parquemet-mapa-oficial.jpg']]){
   const bytes=await readFile(join(root,path));bytes[bytes.length-1]^=1;
   const changed=join(dir,flag.slice(2));await writeFile(changed,bytes);
   const refused=spawnSync('python3',['scripts/extract-parquemet-avenues.py',flag,changed,'--output',join(dir,'out.json')],{cwd:root,encoding:'utf8'});
   assert.notEqual(refused.status,0);
   assert.match(refused.stderr,/SHA-256|source|image/i);
  }
 }finally{await rm(dir,{recursive:true,force:true});}
});
