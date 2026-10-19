// Image geometry only. Deliberately has no geographic projection or distance API.
// The source trace permits a 3px boundary band around pending rectangles.
// Test complete edges, not just vertices: a shortcut can cross an occlusion.
function entersPendingArea(a,b,bounds){
 const [x,y,w,h]=bounds,margin=3;
 if(w<=margin*2||h<=margin*2)return false;
 let start=0,end=1;
 for(const [axis,min,max] of [[0,x+margin,x+w-margin],[1,y+margin,y+h-margin]]){
  const delta=b[axis]-a[axis];
  if(delta===0){if(a[axis]<=min||a[axis]>=max)return false;continue;}
  const t1=(min-a[axis])/delta,t2=(max-a[axis])/delta;
  start=Math.max(start,Math.min(t1,t2));end=Math.min(end,Math.max(t1,t2));
  if(start>=end)return false;
 }
 return start<end;
}
export function validateDataset(d) {
 const fail=(reason='se requieren coordenadas de imagen y fragmentos separados')=>{throw new Error('Datos de trazado inválidos: '+reason+'.');};
 if(!d||d.schemaVersion!==1||d.coordinateSystem!=='image-pixels'||!d.image||![d.image.width,d.image.height].every(v=>Number.isFinite(v)&&v>0))fail();
 const identity=[1,0,0,1,0,0];
 if(!Array.isArray(d.image.transform)||d.image.transform.length!==6||!d.image.transform.every((v,i)=>v===identity[i]))fail('la transformación de imagen debe ser identidad en este visor');
 if(!Array.isArray(d.trails)||!d.trails.length||!Array.isArray(d.segments)||!d.segments.length||!Array.isArray(d.gaps)||!Array.isArray(d.nodes))fail();
 const all=[...d.trails,...d.segments,...d.gaps,...d.nodes];
 if(all.some(x=>!x||typeof x.id!=='string')||new Set(all.map(x=>x.id)).size!==all.length)fail();
 const point=p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&p[0]>=0&&p[0]<=d.image.width&&p[1]>=0&&p[1]<=d.image.height;
 const tids=new Set(d.trails.map(t=>t.id)),nids=new Set(d.nodes.map(n=>n.id)),sids=new Set((d.sources||[]).map(s=>s.id));
 for(const t of d.trails)if(typeof t.name!=='string'||!/^#[0-9a-f]{6}$/i.test(t.color))fail();
 for(const s of d.segments)if(!tids.has(s.trailId)||s.status!=='visible'||!sids.has(s.sourceId)||!nids.has(s.startNodeId)||!nids.has(s.endNodeId)||!Array.isArray(s.points)||s.points.length<2||!s.points.every(point))fail();
 for(const n of d.nodes)if(!point(n.point)||n.connectionVerified!==false)fail();
 for(const t of d.trails)if(!d.segments.some(s=>s.trailId===t.id))fail('cada sendero seleccionable requiere fragmentos visibles');
 const nodes=new Map(d.nodes.map(n=>[n.id,n])),usedEndpoints=new Set();
 for(const s of d.segments){
  for(const [id,p] of [[s.startNodeId,s.points[0]],[s.endNodeId,s.points.at(-1)]]){
   const n=nodes.get(id);
   if(usedEndpoints.has(id)||n.point[0]!==p[0]||n.point[1]!==p[1])fail('los extremos deben coincidir con nodos visuales separados y sin compartir');
   usedEndpoints.add(id);
  }
 }
 for(const g of d.gaps){
  if(!tids.has(g.trailId)||g.status!=='pending'||!sids.has(g.sourceId)||g.geometry!==null||typeof g.reason!=='string'||!Array.isArray(g.bounds)||g.bounds.length!==4||!g.bounds.every(Number.isFinite))fail();
  const [x,y,w,h]=g.bounds;if(w<=0||h<=0||!point([x,y])||!point([x+w,y+h]))fail();
 }
 for(const s of d.segments)for(const g of d.gaps.filter(g=>g.trailId===s.trailId)){
  if(s.points.slice(1).some((b,i)=>entersPendingArea(s.points[i],b,g.bounds)))fail('un fragmento atraviesa una zona pendiente: '+g.id);
 }
 if(d.georeferencing?.status!=='unvalidated'||d.georeferencing.transform!==null||d.connections?.length!==0||d.geographicCorrespondences?.length!==0)fail();
 return d;
}
export function fitView(width,height){
 if(![width,height].every(v=>Number.isFinite(v)&&v>0))throw new Error('Dimensiones inválidas');
 return {x:0,y:0,width,height};
}
export function zoomView(v,factor,anchor={x:v.x+v.width/2,y:v.y+v.height/2}){
 if(!Number.isFinite(factor)||factor<=0)throw new Error('Zoom inválido');
 return {x:anchor.x+(v.x-anchor.x)*factor,y:anchor.y+(v.y-anchor.y)*factor,width:v.width*factor,height:v.height*factor};
}
export function panView(v,dx,dy){return {...v,x:v.x+dx,y:v.y+dy};}
