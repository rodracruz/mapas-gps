import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, mkdtemp, writeFile, rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const file=new URL('../data/parquemet/visual-cycling-trails.json',import.meta.url);
const data=await readFile(file,'utf8').then(JSON.parse).catch(()=>null);
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
function receipt(){assert.ok(data,'the PDF-native cycling extraction must exist');return data;}

test('the visual receipt binds the original PDF and keeps all eight official cyclist identities',async()=>{
 const d=receipt();
 const pdf=await readFile(new URL('../sources/parquemet-mapa-oficial.pdf',import.meta.url));
 assert.equal(d.source.sha256,sha256(pdf));
 assert.equal(d.source.sha256,'e7606172479a0fd585f7f3dcb4187556a202778cd647b31f44aaefcf9bd03cf8');
 assert.equal(d.source.bytes,765376);
 assert.deepEqual(d.trails.map(t=>[t.id,t.name,t.number,t.officialDistanceM]),[
  ['centenario','Centenario',1,900],['cuatro-y-medio','4 ½',2,1000],
  ['anfiteatro','Anfiteatro',3,700],['la-s','La S',4,500],
  ['zorzal','Zorzal',5,500],['pa-arriba','Pa’ arriba',6,600],
  ['torre-5','Torre 5',7,800],['piramide','Pirámide',8,600]
 ]);
});

test('native cubic geometry survives at document scale without simplification or GPS conversion',()=>{
 const d=receipt(),paths=d.trails.flatMap(t=>t.paths);
 assert.equal(d.coordinateSystem,'document-pixels');
 assert.deepEqual(d.image,{width:6690,height:2835});
 assert.deepEqual(d.transform,[1,0,0,1,0,0]);
 assert.equal(d.georeferencing.transform,null);
 assert.equal(d.georeferencing.useForNavigation,false);
 assert.equal(d.fidelity.simplificationTolerance,0);
 assert.equal(d.fidelity.interpolatedSegments,0);
 assert.equal(paths.length,43);
 assert.equal(paths.filter(p=>p.role==='trail-stroke').length,30);
 assert.equal(paths.filter(p=>p.role==='endpoint-marker').length,13);
 assert.equal(paths.reduce((n,p)=>n+(p.d.match(/\bC\b/g)||[]).length,0),120);
 assert.equal(paths.reduce((n,p)=>n+(p.d.match(/\bL\b/g)||[]).length,0),78);
 const c=paths.find(p=>p.drawingIndex===1260);
 assert.ok(c.d.includes('C 1760.18701171875 1136.4552001953125 1754.5570068359375 1138.754150390625 1749.0059814453125 1137.750244140625'));
 assert.deepEqual(c.strokeDasharray,[4.759,5.948]);
 assert.equal(c.seqno,1289);
 for(const t of d.trails){
  assert.equal(t.fidelity,'native-pdf-centerline');
  for(const p of t.paths){
   assert.match(p.d,/^M /);
   assert.ok(!/[AQHVSTaqhvst]/.test(p.d));
   assert.ok(p.bounds.every(Number.isFinite));
   assert.ok(p.bounds[0]>1000&&p.bounds[1]>900);
   assert.ok(p.bounds[0]+p.bounds[2]<4500&&p.bounds[1]+p.bounds[3]<1700);
  }
 }
 assert.ok(!/"(?:lat|lng|latitude|longitude|coordinates|crsCode)"/.test(JSON.stringify(d)));
});

test('source objects remain separate and Anfiteatro preserves its two unpainted gaps',()=>{
 const d=receipt();
 const expected=[[1259,1260,1261,1262,1263,1264,1265],[1266,1267,1268,1269,1270],
  [1276,1277,1278,1279,1280,1281,1282,1283,1284,1285,1286],
  [1287,1288,1289,1290],[1291,1292,1293,1294],[1295,1296,1297,1298],
  [1271,1272,1273,1274,1275],[1299,1300,1301]];
 assert.deepEqual(d.trails.map(t=>t.sourceDrawingIds),expected);
 assert.deepEqual(d.trails.map(t=>t.paths.map(p=>p.drawingIndex)),expected);
 const a=d.trails.find(t=>t.id==='anfiteatro');
 assert.deepEqual(a.missingConnections.map(g=>[g.fromDrawingIndex,g.toDrawingIndex]),[[1285,1280],[1282,1276]]);
 for(const gap of a.missingConnections) assert.equal(gap.interpolated,false);
 assert.equal(d.topology.crossingsAreJunctions,false);
 assert.equal(d.topology.connectionsInferred,false);
});

test('regeneration is byte-for-byte deterministic and rejects a changed PDF',async()=>{
 receipt();
 const checked=spawnSync('python3',['scripts/extract-parquemet-cycling.py','--check'],{cwd:root,encoding:'utf8'});
 assert.equal(checked.status,0,checked.stderr||checked.stdout);
 const dir=await mkdtemp(join(tmpdir(),'parquemet-native-'));
 try{
  const original=await readFile(new URL('../sources/parquemet-mapa-oficial.pdf',import.meta.url));
  original[original.length-1]^=1;
  const changed=join(dir,'changed.pdf');await writeFile(changed,original);
  const refused=spawnSync('python3',['scripts/extract-parquemet-cycling.py','--pdf',changed,'--output',join(dir,'out.json')],{cwd:root,encoding:'utf8'});
  assert.notEqual(refused.status,0);
  assert.match(refused.stderr,/SHA-256|source|fuente/i);
 }finally{await rm(dir,{recursive:true,force:true});}
});
