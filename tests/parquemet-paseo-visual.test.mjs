import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, mkdtemp, writeFile, rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const data=await readFile(new URL('../data/parquemet/visual-paseo-trails.json',import.meta.url),'utf8').then(JSON.parse).catch(()=>null);
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const expected=[
 ['paseo-infancia','Tramo Parque B. de la Infancia',1,940,[1362,1365,1366,1367]],
 ['paseo-sentidos','Sendero de los Sentidos',2,540,[1363,1364,1368,1369]],
 ['paseo-bellavista','Tramo Bellavista',3,1000,[1370,1371]],
 ['paseo-pedro-valdivia','Tramo Pedro de Valdivia',4,1500,[1372,1373,1374,1375]],
 ['paseo-piramide','Tramo Pirámide / Jardín Japonés',5,3700,Array.from({length:15},(_,i)=>1376+i)],
 ['paseo-cascada','Tramo La Cascada',6,1200,[1391,1392,1393]]
];
function receipt(){assert.ok(data,'the six PDF-native shared Paseo routes must be extracted');return data;}

test('Paseo extraction binds the official source and all six green numbered legend entries',async()=>{
 const d=receipt();
 const pdf=await readFile(new URL('../sources/parquemet-mapa-oficial.pdf',import.meta.url));
 assert.equal(d.source.sha256,sha256(pdf));
 assert.equal(d.source.sha256,'e7606172479a0fd585f7f3dcb4187556a202778cd647b31f44aaefcf9bd03cf8');
 assert.deepEqual(d.trails.map(t=>[t.id,t.name,t.number,t.officialDistanceM,t.sourceDrawingIds]),expected);
 for(const t of d.trails){
  assert.equal(t.category,'shared-trail');
  assert.equal(t.legend.text,t.name);
  assert.equal(t.label.number,t.number);
  assert.ok(t.legend.bounds[0]>2900&&t.legend.bounds[1]>2300);
 }
 assert.equal(d.trails.find(t=>t.number===5).labels.length,2,'both original green 5 badges identify the same Pirámide route');
});

test('all 32 native green objects preserve curves, dashes, separate drawings and document coordinates',()=>{
 const d=receipt(),paths=d.trails.flatMap(t=>t.paths);
 assert.equal(d.coordinateSystem,'document-pixels');
 assert.deepEqual(d.image,{width:6690,height:2835});
 assert.deepEqual(d.transform,[1,0,0,1,0,0]);
 assert.equal(d.georeferencing.transform,null);
 assert.equal(d.georeferencing.crs,null);
 assert.equal(d.georeferencing.useForNavigation,false);
 assert.equal(d.fidelity.simplificationTolerance,0);
 assert.equal(d.fidelity.interpolatedSegments,0);
 assert.equal(paths.length,32);
 assert.equal(paths.filter(p=>p.role==='trail-stroke').length,21);
 assert.equal(paths.filter(p=>p.role==='endpoint-marker').length,11);
 assert.equal(paths.reduce((n,p)=>n+(p.d.match(/\bC\b/g)||[]).length,0),110);
 assert.equal(paths.reduce((n,p)=>n+(p.d.match(/\bL\b/g)||[]).length,0),51);
 assert.deepEqual(paths.filter(p=>p.strokeDasharray.length).map(p=>p.drawingIndex),[1383,1386,1389]);
 assert.deepEqual(paths.find(p=>p.drawingIndex===1386).strokeDasharray,[1.769,1.769]);
 for(const t of d.trails){
  assert.deepEqual(t.paths.map(p=>p.drawingIndex),t.sourceDrawingIds);
  for(const p of t.paths){
   assert.match(p.d,/^M /);
   assert.ok(!/[AQHVSTaqhvst]/.test(p.d));
   assert.ok(p.bounds.every(Number.isFinite));
   assert.ok(p.bounds[1]+p.bounds[3]<2130,'legend graphics are not route paths');
  }
 }
 assert.ok(!/"(?:lat|lng|latitude|longitude|coordinates|crsCode)"/.test(JSON.stringify(d)));
});

test('source omissions remain open and unnumbered dotted objects remain unassigned',()=>{
 const d=receipt(),s=d.trails.find(t=>t.number===2),p=d.trails.find(t=>t.number===5);
 assert.equal(s.missingConnections.length,1);
 const gap=s.missingConnections[0];
 assert.equal(gap.fromDrawingIndex,1363);
 assert.equal(gap.toDrawingIndex,1368);
 assert.deepEqual(gap.from,[1163.5987548828125,1005.093017578125]);
 assert.deepEqual(gap.to,[1156.2177734375,1061.35595703125]);
 assert.equal(gap.documentGapPixels,56.74501954358688);
 assert.equal(gap.interpolated,false);
 assert.equal(p.sourceStrokeTransitions.length,12);
 assert.ok(p.sourceStrokeTransitions.every(g=>g.interpolated===false));
 assert.deepEqual(d.pendingSourceGroups.flatMap(g=>g.drawingIndices),Array.from({length:9},(_,i)=>1394+i));
 assert.ok(d.pendingSourceGroups.every(g=>g.assignedToTrail===false));
 assert.equal(d.topology.crossingsAreJunctions,false);
 assert.equal(d.topology.connectionsInferred,false);
});

test('Paseo extraction regenerates byte-for-byte and rejects modified source bytes',async()=>{
 receipt();
 const checked=spawnSync('python3',['scripts/extract-parquemet-paseo.py','--check'],{cwd:root,encoding:'utf8'});
 assert.equal(checked.status,0,checked.stderr||checked.stdout);
 const dir=await mkdtemp(join(tmpdir(),'parquemet-paseo-'));
 try{
  const pdf=await readFile(new URL('../sources/parquemet-mapa-oficial.pdf',import.meta.url));
  pdf[pdf.length-1]^=1;
  const changed=join(dir,'changed.pdf');await writeFile(changed,pdf);
  const refused=spawnSync('python3',['scripts/extract-parquemet-paseo.py','--pdf',changed,'--output',join(dir,'out.json')],{cwd:root,encoding:'utf8'});
  assert.notEqual(refused.status,0);
  assert.match(refused.stderr,/SHA-256|source|fuente/i);
 }finally{await rm(dir,{recursive:true,force:true});}
});
