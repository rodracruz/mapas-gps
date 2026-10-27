// Reproducible source/OSM inventory. No coordinate changes or inferred links.
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fromOsmSnapshot,lineLength} from '../geographic/data.mjs';
const out=process.argv[2]||'docs/evidence/cartographic-fidelity';
const read=async path=>JSON.parse(await readFile(path));
const digest=async path=>createHash('sha256').update(await readFile(path)).digest('hex');
const report={schemaVersion:1,scope:'Official document versus geographic source; nominal correspondence is not surveyed equality.',parks:[]};
for(const park of ['el-durazno','parquemet']){
 const catalog=await read(`data/${park}/geographic-catalog.json`),snapshot=await read(catalog.sourceSnapshot),geo=fromOsmSnapshot(snapshot,catalog);
 const source=await read(park==='el-durazno'?'data/el-durazno/continuous-sign-trails.json':'data/parquemet/visual-cycling-trails.json');
 if(park==='parquemet')source.trails.push(...(await read('data/parquemet/visual-paseo-trails.json')).trails);
 const routes=source.trails.map(t=>{
  const target=catalog.targets.find(c=>c.visualTrailId===t.id||c.id===t.id),features=geo.features.filter(f=>f.properties.targetId===target?.id);
  return{id:t.id,name:t.name,documentCoordinateSystem:source.coordinateSystem,
   sourcePathIds:(source.routePaths?source.routePaths.filter(p=>p.trailId===t.id):t.paths).map(p=>p.id),
   sharedGraphicSymbols:t.sharedEndpointDrawingIds||[],unpaintedDocumentGaps:t.missingConnections||[],
   geographicTargetId:target?.id||null,correspondence:features.length?'declared-name-and-ID-only':'geographic-correspondence-missing',
   osmWays:features.map(f=>({id:f.properties.osmId,version:f.properties.osmVersion,url:f.properties.sourceUrl,nodeIds:f.properties.nodeIds,pointCount:f.geometry.coordinates.length})),
   officialDistanceM:t.officialDistanceM??null,osmLengthM:features.length?Math.round(features.reduce((n,f)=>n+lineLength(f.geometry.coordinates),0)):null,
   equalityOfExtentsVerified:false};
 });
 const nodes=new Map();for(const f of geo.features.filter(f=>f.properties.targetId))for(const [i,id]of f.properties.nodeIds.entries()){
  const n=nodes.get(id)||{osmNodeId:id,coordinateLonLat:f.geometry.coordinates[i],targetIds:[],wayIds:[]};
  if(!n.targetIds.includes(f.properties.targetId))n.targetIds.push(f.properties.targetId);if(!n.wayIds.includes(f.properties.osmId))n.wayIds.push(f.properties.osmId);nodes.set(id,n);
 }
 const context=park==='el-durazno'?await read('data/el-durazno/cartel-context.json'):null;
 report.parks.push({id:park,sourceImage:park==='el-durazno'?source.image.url:'sources/parquemet-mapa-oficial.jpg',
  documentSha256:park==='el-durazno'?source.sources[0].sha256:source.source.sha256,
  snapshotPath:catalog.sourceSnapshot,snapshotSha256:await digest(catalog.sourceSnapshot),
  visualToGeographicTransform:catalog.visualToGeographicTransform,navigationValidated:catalog.navigationValidated,
  acceptedGeographicControlCount:0,routes,
  graphicConnections:context?context.paths.map(p=>({id:p.id,sourceDrawingIndices:p.sourceDrawingIndices,bounds:p.bounds,role:p.role,connectionVerified:false})):[],
  unattributedDocumentGroups:park==='parquemet'?(await read('data/parquemet/visual-paseo-trails.json')).pendingSourceGroups:[],
  sourceOsmSharedNodes:[...nodes.values()].filter(n=>n.targetIds.length>1),
  topologyStatus:'OSM shared node IDs describe only that database. Graphic symbols/crossings create no traversable edges.',
  documentOnlyScope:park==='parquemet'?'8 yellow pedestrian entries remain in the original, outside the cycling catalog. Avenue views are source crops/table references, not extracted road axes.':null});
}
await mkdir(out,{recursive:true});await writeFile(out+'/inventory.json',JSON.stringify(report,null,2)+'\n');
console.log(report.parks.map(p=>`${p.id}: ${p.routes.length} source routes, ${p.routes.filter(r=>r.osmWays.length).length} nominal OSM associations, ${p.graphicConnections.length} graphic objects, 0 accepted geographic controls`).join('\n'));
