// Experimental identification on geographic OSM edges. No route planning, access
// inference, image registration, storage, clocks or browser APIs are used here.
const R=6371008.8,rad=Math.PI/180;
const DEFAULTS=Object.freeze({
 acquisitionFixes:3,transitionFixes:3,escapeFixes:3,minSpanMs:2000,
 maxAccuracyM:45,escapeAccuracyM:15,staleAfterMs:10000,maxFutureMs:2000,
 junctionRadiusM:25,junctionExitRadiusM:90,junctionWindowMs:12000,
 maxSpeedMps:35,motionSlackM:20,headingMinSpeedMps:1.5,headingMaxSpeedMps:25,
 headingMaxAccuracyM:15,headingPenaltyM:18
});
const point=p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&Math.abs(p[0])<=180&&Math.abs(p[1])<=90;
const distance=(a,b)=>{
 const dl=(b[0]-a[0])*rad,dp=(b[1]-a[1])*rad;
 return 2*R*Math.asin(Math.min(1,Math.sqrt(Math.sin(dp/2)**2+Math.cos(a[1]*rad)*Math.cos(b[1]*rad)*Math.sin(dl/2)**2)));
};
const position=f=>[f.longitude,f.latitude];
const copy=value=>structuredClone(value);

function buildNetwork(geo){
 const m=geo?.metadata;
 if(geo?.type!=='FeatureCollection'||m?.source!=='OpenStreetMap'||m.coordinateSystem!=='EPSG:4326'||m.coordinateOrder!=='longitude,latitude'||m.visualToGeographicTransform!=null||!Array.isArray(geo.features)||!geo.features.length)
  throw new Error('Se requieren coordenadas geográficas OSM EPSG:4326, longitude,latitude; no un registro aproximado.');
 const nodes=new Map(),features=[],ids=new Set();
 for(const f of geo.features){
  const p=f?.properties,coords=f?.geometry?.coordinates;
  if(f?.type!=='Feature'||typeof f.id!=='string'||!f.id||ids.has(f.id)||f.geometry?.type!=='LineString'||!p||!Array.isArray(coords)||coords.length<2||!coords.every(point))
   throw new Error('Geometría OSM o coordenadas geográficas inválidas.');
  if(!Array.isArray(p.nodeIds)||p.nodeIds.length!==coords.length||!p.nodeIds.every(id=>Number.isSafeInteger(id)&&id>0))
   throw new Error('Se requieren las identidades de cada nodo OSM.');
  ids.add(f.id);
  const targetId=typeof p.targetId==='string'&&p.targetId?p.targetId:null;
  const feature={id:f.id,routeId:targetId||f.id,targetId,name:typeof p.name==='string'&&p.name.trim()?p.name:'Camino OSM sin nombre',edges:[],nodeIds:new Set(p.nodeIds)};
  features.push(feature);
  for(let i=0;i<coords.length;i++){
   const id=p.nodeIds[i],previous=nodes.get(id);
   if(previous&&distance(previous.coordinates,coords[i])>.05)throw new Error('Un nodo OSM tiene coordenadas incoherentes.');
   if(!previous)nodes.set(id,{nodeId:id,coordinates:[...coords[i]],features:new Set(),neighbours:new Set()});
   nodes.get(id).features.add(feature);
   if(i){
    const a=p.nodeIds[i-1],b=id;
    if(distance(coords[i-1],coords[i])>.001){
     feature.edges.push({a:[...coords[i-1]],b:[...coords[i]],nodeIds:[a,b]});
     nodes.get(a).neighbours.add(b);nodes.get(b).neighbours.add(a);
    }
   }
  }
  if(!feature.edges.length)throw new Error('La vía OSM no contiene aristas geográficas utilizables.');
 }
 // A shared name/target never joins disconnected geometry. Only actual node IDs
 // join features of the same target into a continuity component.
 const parents=new Map(features.map(f=>[f,f]));
 const find=f=>parents.get(f)===f?f:(parents.set(f,find(parents.get(f))),parents.get(f));
 for(const node of nodes.values()){
  const byRoute=new Map();
  for(const f of node.features){const prior=byRoute.get(f.routeId);if(prior)parents.set(find(f),find(prior));else byRoute.set(f.routeId,f);}
 }
 const components=new Map();
 for(const f of features){
  const root=find(f);if(!components.has(root))components.set(root,[]);components.get(root).push(f);
 }
 for(const group of components.values())for(const f of group)f.componentId=group.map(p=>p.id).sort()[0];
 const junctions=[...nodes.values()].filter(n=>n.features.size>1&&(new Set([...n.features].map(f=>f.componentId)).size>1||n.neighbours.size>2));
 return {features,junctions};
}

function project(fix,edge){
 // Local tangent approximation, recomputed at each observation; output remains
 // longitude/latitude. Appropriate for this local trail snapshot, not global GIS.
 const scaleX=R*rad*Math.cos(fix.latitude*rad),scaleY=R*rad;
 const ax=(edge.a[0]-fix.longitude)*scaleX,ay=(edge.a[1]-fix.latitude)*scaleY;
 const bx=(edge.b[0]-fix.longitude)*scaleX,by=(edge.b[1]-fix.latitude)*scaleY;
 const dx=bx-ax,dy=by-ay,length=dx*dx+dy*dy;
 const t=length?Math.max(0,Math.min(1,-(ax*dx+ay*dy)/length)):0;
 return {distanceM:Math.hypot(ax+t*dx,ay+t*dy),projected:{longitude:edge.a[0]+t*(edge.b[0]-edge.a[0]),latitude:edge.a[1]+t*(edge.b[1]-edge.a[1])},bearing:(Math.atan2(dx,dy)/rad+360)%360};
}

function rankCandidates(network,fix,o){
 const byComponent=new Map();
 const useHeading=Number.isFinite(fix.heading)&&Number.isFinite(fix.speed)&&fix.speed>=o.headingMinSpeedMps&&fix.speed<=o.headingMaxSpeedMps&&fix.accuracy<=o.headingMaxAccuracyM;
 for(const feature of network.features){
  for(const edge of feature.edges){
   const p=project(fix,edge);
   const delta=useHeading?Math.abs(((fix.heading-p.bearing)%180+270)%180-90):0;
   const c={...p,feature,componentId:feature.componentId,score:p.distanceM+(useHeading?o.headingPenaltyM*delta/90:0)};
   const previous=byComponent.get(c.componentId);
   // Physical distance defines compatibility for the whole component. Heading
   // ranks different hypotheses, and only breaks exact projection ties within
   // one component. Splitting an OSM way must never discard its nearest edge.
   if(!previous||c.distanceM<previous.distanceM||(c.distanceM===previous.distanceM&&c.score<previous.score))byComponent.set(c.componentId,c);
  }
 }
 return [...byComponent.values()].sort((a,b)=>a.score-b.score||a.distanceM-b.distanceM||a.feature.id.localeCompare(b.feature.id));
}

const publicCandidate=c=>({routeId:c.feature.routeId,name:c.feature.name,featureId:c.feature.id,distanceM:c.distanceM,projected:{...c.projected}});
const publicRoute=c=>({id:c.feature.routeId,name:c.feature.name,targetId:c.feature.targetId,featureId:c.feature.id,source:'OpenStreetMap'});
const initial=()=>({status:'searching',route:null,candidates:[],raw:null,snapped:null,junction:null,reason:'awaiting-fix',continuity:'acquiring'});

export function createRouteMatcher(geo,options={}){
 const o={...DEFAULTS,...options};
 for(const key of Object.keys(DEFAULTS))if(!Number.isFinite(o[key])||o[key]<0||(['acquisitionFixes','transitionFixes','escapeFixes'].includes(key)&&(!Number.isInteger(o[key])||o[key]<1)))throw new Error('Opciones del matcher inválidas: '+key);
 const network=buildNetwork(geo);
 let state=initial(),latest=null,motionFix=null,locked=null,everLocked=false,acquiring=null,transition=null,escape=null,encounter=null;
 const continuity=()=>everLocked?'reacquiring':'acquiring';
 const clearHypothesis=()=>{locked=null;acquiring=null;transition=null;escape=null;encounter=null;motionFix=null;};
 const save=result=>{state=result;return copy(state);};
 const rejected=(reason)=>({...copy(state),status:'invalid',route:null,snapped:null,reason});
 const observe=(previous,candidate,timestamp)=>candidate?{componentId:candidate.componentId,count:previous?.componentId===candidate.componentId?previous.count+1:1,firstTimestamp:previous?.componentId===candidate.componentId?previous.firstTimestamp:timestamp}:null;
 const sufficient=(evidence,count,timestamp)=>evidence&&evidence.count>=count&&timestamp-evidence.firstTimestamp>=o.minSpanMs;
 const lock=(candidate)=>{locked=candidate.componentId;everLocked=true;acquiring=null;escape=null;transition=null;};

 function snapshot(now=Date.now()){
  if(!Number.isFinite(now))return rejected('invalid-clock');
  if(latest&&now-latest.timestamp>o.staleAfterMs){
   clearHypothesis();
   return save({...state,status:'stale',route:null,snapped:null,junction:null,reason:'stale-fix',continuity:continuity()});
  }
  if(latest&&latest.timestamp-now>o.maxFutureMs)return rejected('clock-before-fix');
  return copy(state);
 }

 function update(input,now=Date.now()){
  if(!Number.isFinite(now))return rejected('invalid-clock');
  if(!input||!point([input.longitude,input.latitude])||!Number.isFinite(input.accuracy)||input.accuracy<=0||!Number.isFinite(input.timestamp))return rejected('invalid-fix');
  if(input.timestamp-now>o.maxFutureMs)return rejected('future-fix');
  if(latest&&input.timestamp<=latest.timestamp)return rejected('out-of-order');
  const fix={longitude:input.longitude,latitude:input.latitude,accuracy:input.accuracy,timestamp:input.timestamp,heading:Number.isFinite(input.heading)?((input.heading%360)+360)%360:null,speed:Number.isFinite(input.speed)&&input.speed>=0?input.speed:null};
  const prior=latest;
  if(prior&&(fix.timestamp-prior.timestamp>o.staleAfterMs||now-prior.timestamp>o.staleAfterMs))clearHypothesis();
  latest=fix;
  const base={status:'searching',route:null,candidates:[],raw:fix,snapped:null,junction:null,reason:'acquiring',continuity:continuity()};
  if(now-fix.timestamp>o.staleAfterMs){clearHypothesis();return save({...base,status:'stale',reason:'stale-fix'});}
  if(fix.accuracy>o.maxAccuracyM){clearHypothesis();return save({...base,reason:'poor-accuracy'});}
  if(motionFix){
   const seconds=(fix.timestamp-motionFix.timestamp)/1000;
   const limit=o.maxSpeedMps*seconds+o.motionSlackM+fix.accuracy+motionFix.accuracy;
   if(distance(position(motionFix),position(fix))>limit){
    clearHypothesis();return save({...base,reason:'teleport-reacquiring',continuity:continuity()});
   }
  }
  motionFix=fix;
  const ranked=rankCandidates(network,fix,o);
  base.candidates=ranked.map(publicCandidate);
  const acquireRadius=Math.max(12,Math.min(60,fix.accuracy*1.25));
  const compatibleRadius=Math.max(15,Math.min(65,fix.accuracy*2+5));
  const eligible=ranked.filter(c=>c.distanceM<=acquireRadius);
  const margin=Math.max(5,fix.accuracy*.9);
  const winner=eligible[0]&&(!eligible[1]||eligible[1].score-eligible[0].score>margin)?eligible[0]:null;
  const nearJunctions=network.junctions.map(n=>({node:n,distanceM:distance(position(fix),n.coordinates)})).filter(n=>n.distanceM<=o.junctionRadiusM).sort((a,b)=>a.distanceM-b.distanceM);
  // A junction is relevant to the held component; an unrelated nearby junction
  // cannot grant permission to switch from the current trail.
  const nearby=nearJunctions.find(n=>!locked||[...n.node.features].some(f=>f.componentId===locked));
  if(nearby)base.junction={nodeId:nearby.node.nodeId,distanceM:nearby.distanceM,routeIds:[...new Set([...nearby.node.features].map(f=>f.routeId))].sort()};
  const probable=(candidate,reason,mode)=>save({...base,status:'probable',route:publicRoute(candidate),snapped:{...candidate.projected,routeId:candidate.feature.routeId},reason,continuity:mode});

  if(!locked){
   acquiring=observe(acquiring,winner,fix.timestamp);
   if(winner&&sufficient(acquiring,o.acquisitionFixes,fix.timestamp)){const mode=everLocked?'reacquiring':'held';lock(winner);return probable(winner,mode==='held'?'route-acquired':'reacquired',mode);}
   return save({...base,status:!eligible.length?'off-route':winner?'searching':'ambiguous',reason:!eligible.length?'outside-network':winner?'acquiring':'ambiguous-candidates'});
  }

  const held=ranked.find(c=>c.componentId===locked),compatible=held&&held.distanceM<=compatibleRadius;
  if(nearby)encounter={node:nearby.node,timestamp:fix.timestamp};
  if(encounter&&(fix.timestamp-encounter.timestamp>o.junctionWindowMs||distance(position(fix),encounter.node.coordinates)>o.junctionExitRadiusM))encounter=null;
  const canTransition=winner&&winner.componentId!==locked&&encounter&&[...encounter.node.features].some(f=>f.componentId===winner.componentId)&&winner.score+margin<held.score;
  if(canTransition){
   transition=observe(transition,winner,fix.timestamp);escape=null;
   if(sufficient(transition,o.transitionFixes,fix.timestamp)){lock(winner);encounter=null;return probable(winner,'junction-transition','junction-transition');}
   if(compatible)return probable(held,'junction-evidence-pending','held');
   return save({...base,status:'ambiguous',reason:'junction-evidence-pending',continuity:'held'});
  }
  transition=null;
  if(compatible){escape=null;return probable(held,'continuity-held','held');}

  // Only good observations can disprove a prior outside a known junction. A
  // competing route must itself accumulate coherent evidence before being shown.
  if(fix.accuracy<=o.escapeAccuracyM){
   const previousCount=escape?.excludedCount||0;
   escape={...observe(escape,winner,fix.timestamp),excludedCount:previousCount+1,excludedSince:escape?.excludedSince??fix.timestamp};
   if(escape.excludedCount>=o.escapeFixes&&fix.timestamp-escape.excludedSince>=o.minSpanMs){
    const evidence=escape;clearHypothesis();motionFix=fix;
    if(winner&&evidence.componentId===winner.componentId){
     acquiring={componentId:winner.componentId,count:evidence.count,firstTimestamp:evidence.firstTimestamp};
     if(sufficient(acquiring,o.acquisitionFixes,fix.timestamp)){lock(winner);return probable(winner,'reacquired','reacquiring');}
    }
    return save({...base,status:eligible.length?'searching':'off-route',reason:'hypothesis-rejected',continuity:'reacquiring'});
   }
  }else escape=null;
  return save({...base,status:eligible.length?'ambiguous':'off-route',reason:'route-incompatible',continuity:'held'});
 }

 function reset(){state=initial();latest=null;everLocked=false;clearHypothesis();return copy(state);}
 return {update,snapshot,reset};
}
