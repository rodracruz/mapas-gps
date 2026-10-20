import {lineLength} from './data.mjs';
const rad=Math.PI/180,R=6371008.8;
const point=p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&Math.abs(p[0])<=180&&Math.abs(p[1])<=90;
const angle=(a,b)=>2*Math.asin(Math.min(1,Math.sqrt(Math.sin((b[1]-a[1])*rad/2)**2+Math.cos(a[1]*rad)*Math.cos(b[1]*rad)*Math.sin((b[0]-a[0])*rad/2)**2)));
const bearing=(a,b)=>Math.atan2(Math.sin((b[0]-a[0])*rad)*Math.cos(b[1]*rad),Math.cos(a[1]*rad)*Math.sin(b[1]*rad)-Math.sin(a[1]*rad)*Math.cos(b[1]*rad)*Math.cos((b[0]-a[0])*rad));
export function routeType(target){
 if(target.category==='cycling-trail')return{id:'cycling-trail',label:'Sendero ciclista'};
 if(target.category==='shared-trail')return{id:'shared-trail',label:'Paseo compartido'};
 if(target.category==='avenue')return /^Camino\b/i.test(target.name||'')?{id:'camino',label:'Camino'}:{id:'avenue',label:'Avenida'};
 if(target.category==='auxiliary'||target.id?.startsWith('subida-'))return{id:'ascent',label:'Subida'};
 if(['Park','Trail'].includes(target.difficulty?.style))return{id:target.difficulty.style.toLowerCase(),label:target.difficulty.style};
 if(target.category==='pedestrian-trail')return{id:'foot',label:'Sendero peatonal'};
 if(target.usage==='bicycle')return{id:'bicycle',label:'Bicicleta'};
 if(target.usage==='foot')return{id:'foot',label:'Peatonal'};
 return{id:'route',label:'Recorrido'};
}
export function validFilterLocation(fix,now=Date.now()){
 return !!fix&&point([fix.longitude,fix.latitude])&&Number.isFinite(fix.accuracy)&&fix.accuracy>=0&&fix.accuracy<=100&&Number.isFinite(fix.timestamp)&&now-fix.timestamp<=60000&&fix.timestamp-now<=5000;
}
// Great-circle distance to the closest point of an original geographic segment.
// This is proximity, not distance via paths, a reachable access or GPS snapping.
export function distanceToRoute(fix,lines){
 if(!point([fix?.longitude,fix?.latitude]))return null;
 const p=[fix.longitude,fix.latitude];let nearest=Infinity;
 for(const line of lines)for(let i=1;i<line.length;i++){
  const a=line[i-1],b=line[i];if(!point(a)||!point(b))continue;
  const ab=angle(a,b),ap=angle(a,p);let d=Math.min(ap,angle(b,p));
  if(ab>1e-12&&ab<Math.PI-1e-8){const delta=bearing(a,p)-bearing(a,b),along=Math.atan2(Math.sin(ap)*Math.cos(delta),Math.cos(ap));if(along>=0&&along<=ab)d=Math.abs(Math.asin(Math.max(-1,Math.min(1,Math.sin(ap)*Math.sin(delta)))));}
  nearest=Math.min(nearest,d*R);
 }
 return Number.isFinite(nearest)?nearest:null;
}
export function routeFilterModels(targets,geo){
 const verified=geo?.metadata?.source==='OpenStreetMap'&&geo.metadata.coordinateSystem==='EPSG:4326'&&geo.metadata.coordinateOrder==='longitude,latitude';
 const byId=new Map();if(verified)for(const f of geo.features||[]){const id=f.properties?.targetId,c=f.geometry?.coordinates;if(!id||f.geometry?.type!=='LineString'||!Array.isArray(c)||c.length<2||!c.every(point))continue;if(!byId.has(id))byId.set(id,[]);byId.get(id).push(c);}
 return targets.map(t=>{const lines=byId.get(t.id)||[],length=lines.reduce((sum,line)=>sum+lineLength(line),0);return{id:t.id,name:t.name,type:routeType(t),difficulty:t.difficulty?.label||'unknown',lengthM:length>0?length:null,lines};});
}
export function filterRoutes(models,{type='all',difficulty='all',order='default',fix=null,now=Date.now()}={}){
 const measured=validFilterLocation(fix,now),list=models.filter(m=>(type==='all'||m.type.id===type)&&(difficulty==='all'||m.difficulty===difficulty)).map(m=>({...m,distanceM:measured?distanceToRoute(fix,m.lines):null}));
 const key=order.startsWith('length-')?'lengthM':['near','far'].includes(order)?'distanceM':null,descending=['length-desc','far'].includes(order);
 if(key)list.sort((a,b)=>{const x=a[key],y=b[key];if(x===null||y===null)return x===y?0:x===null?1:-1;return(descending?-1:1)*(x-y);});
 return list;
}
