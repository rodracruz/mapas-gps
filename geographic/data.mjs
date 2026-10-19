// Geographic data only: longitude, latitude. No image registration or GPS snapping.
const normalized=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ');
const matches=(name,target)=>[normalized(target.name),'sendero '+normalized(target.name)].includes(normalized(name||''));
const point=p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&Math.abs(p[0])<=180&&Math.abs(p[1])<=90;
export function validateGeographic(data,catalog){
 const fail=()=>{throw new Error('Datos geográficos inválidos: se requieren coordenadas OSM y nombres contrastados.');};
 if(data?.type!=='FeatureCollection'||data.metadata?.coordinateSystem!=='EPSG:4326'||data.metadata.coordinateOrder!=='longitude,latitude'||data.metadata.source!=='OpenStreetMap'||!Array.isArray(data.features)||!data.features.length)fail();
 if(catalog?.coordinateSystem!=='EPSG:4326'||catalog.coordinateOrder!=='longitude,latitude'||catalog.visualToGeographicTransform!==null||catalog.navigationValidated!==false)fail();
 const [west,south,east,north]=catalog.geographicExtent||[];
 if(![west,south,east,north].every(Number.isFinite)||west>=east||south>=north)fail();
 const ids=new Set();
 for(const f of data.features){
  const p=f?.properties,coords=f?.geometry?.coordinates;
  if(f.type!=='Feature'||f.geometry.type!=='LineString'||!p||!Number.isSafeInteger(p.osmId)||!Number.isSafeInteger(p.osmVersion)||p.osmVersion<1||f.id!=='osm-way-'+p.osmId||ids.has(f.id)||!Array.isArray(coords)||coords.length<2||p.nodeIds?.length!==coords.length)fail();
  ids.add(f.id);
  if(!coords.every(p=>point(p)&&p[0]>=west-1e-7&&p[0]<=east+1e-7&&p[1]>=south-1e-7&&p[1]<=north+1e-7))fail();
  if(p.targetId!==null){const target=catalog.targets.find(t=>t.id===p.targetId);if(!target||target.status!=='osm-identified'||!target.osmWayIds.includes(p.osmId)||!matches(p.name,target))fail();}
 }
 return data;
}
export function fromOsmSnapshot(source,catalog){
 if(source?.source!=='OpenStreetMap'||source.license!=='ODbL-1.0'||source.url!==catalog.sourceUrl||!Array.isArray(source.elements))throw new Error('Fuente OSM inválida.');
 const nodes=new Map(),ways=[];
 for(const e of source.elements){
  if(e.type==='node'){if(nodes.has(e.id)||!Number.isSafeInteger(e.id)||!point([e.lon,e.lat]))throw new Error('Nodo OSM inválido.');nodes.set(e.id,e);}
  else if(e.type==='way')ways.push(e);
 }
 const features=ways.map(w=>{
  if(!Array.isArray(w.nodes)||!w.nodes.every(id=>nodes.has(id)))throw new Error('Falta un nodo del trazado OSM; no se unen huecos.');
  const target=catalog.targets.find(t=>t.status==='osm-identified'&&t.osmWayIds.includes(w.id));
  return {type:'Feature',id:'osm-way-'+w.id,properties:{osmId:w.id,osmVersion:w.version,osmTimestamp:w.timestamp,name:w.tags?.name||null,targetId:target?.id||null,nodeIds:w.nodes,tags:w.tags||{},sourceUrl:'https://www.openstreetmap.org/way/'+w.id},geometry:{type:'LineString',coordinates:w.nodes.map(id=>{const n=nodes.get(id);return [n.lon,n.lat];})}};
 });
 return validateGeographic({type:'FeatureCollection',metadata:{source:'OpenStreetMap',license:'ODbL-1.0',attribution:'© OpenStreetMap contributors',sourceUrl:source.url,queriedAt:source.queriedAt,coordinateSystem:'EPSG:4326',coordinateOrder:'longitude,latitude',visualToGeographicTransform:null,navigationValidated:false},features},catalog);
}
export function lineLength(coords){
 const rad=x=>x*Math.PI/180,R=6371008.8;
 let result=0;
 for(let i=1;i<coords.length;i++){
  const a=coords[i-1],b=coords[i];if(!point(a)||!point(b))throw new Error('Coordenadas geográficas inválidas.');
  const dlat=rad(b[1]-a[1]),dlon=rad(b[0]-a[0]);
  result+=2*R*Math.asin(Math.min(1,Math.sqrt(Math.sin(dlat/2)**2+Math.cos(rad(a[1]))*Math.cos(rad(b[1]))*Math.sin(dlon/2)**2)));
 }
 return result;
}
