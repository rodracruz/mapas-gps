import {officialTrailModels,sourcePathNode} from './trail-preview.mjs';

// Native paths and reviewed crops stay in the unchanged document coordinates.
// Crop references are not avenue centerlines and cannot enter vector-only mode.
export function setupDocumentCycling({data,viewer}){
 const get=id=>document.getElementById(id),models=officialTrailModels(data),groups=new Map(),controller=new AbortController(),options={signal:controller.signal};
 const layer=get('document-cycling'),raster=get('document-image'),navigation=get('document-cycling-trails');let selected=null,mode='overlay',tap=null,isolated=false;
 for(const trail of data.trails){
  const group=document.createElementNS('http://www.w3.org/2000/svg','g');group.classList.add('document-cycling-trail');group.dataset.trailId=trail.id;group.setAttribute('aria-label',trail.name);
  for(const path of trail.paths)group.append(sourcePathNode(path));
  // Some official dots belong to one PDF object yet mark several drawn routes.
  // Reuse that exact symbol for isolation; it does not establish a graph edge.
  for(const index of trail.sharedEndpointDrawingIds||[]){
   if(trail.paths.some(p=>p.drawingIndex===index))continue;
   const path=data.trails.flatMap(t=>t.paths).find(p=>p.drawingIndex===index&&p.role==='endpoint-marker');
   if(path){const node=sourcePathNode(path);node.dataset.sharedSymbol='true';group.append(node);}
  }
  layer.append(group);groups.set(trail.id,group);
 }
 for(const model of models){
  const trail=data.trails.find(t=>t.id===model.id),button=document.createElement('button');button.type='button';button.dataset.visualTrail=model.id;button.dataset.routeCategory=model.category||'cycling-trail';button.dataset.viewKind=model.kind;button.style.borderColor=model.category==='avenue'?'#507f9d':model.category==='shared-trail'?'#008b7b':'#c58277';button.textContent=trail?(trail.category==='shared-trail'?'P':'')+trail.number+' · '+trail.name:model.name+' · '+(model.kind==='document-reference'?'Tabla':'Plano');button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>select(model.id),options);navigation.append(button);
 }
 function setMode(next){
  const crop=selected&&models.find(t=>t.id===selected)?.routeGeometryAvailable===false;mode=crop?'photo':next;raster.style.display=mode==='vectors'?'none':'';raster.style.opacity=mode==='overlay'?Number(get('document-opacity').value)/100:1;layer.style.display=mode==='photo'?'none':'';get('document-opacity').disabled=mode!=='overlay';for(const button of document.querySelectorAll('[data-document-mode]')){button.disabled=!!crop&&button.dataset.documentMode!=='photo';button.setAttribute('aria-pressed',String(button.dataset.documentMode===mode));}
 }
 function select(id,{fit=true}={}){
  const model=models.find(t=>t.id===id),trail=data.trails.find(t=>t.id===id);if(!model)return;selected=id;setMode(mode);
  for(const [key,group]of groups){group.style.display=isolated&&key!==id?'none':'';group.style.opacity=key===id?'1':'.22';group.classList.toggle('selected',key===id);}
  for(const button of navigation.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.visualTrail===id));
  get('document-cycling-selection').textContent=model.kind==='document-reference'?model.name+' · Referencia en la tabla de distancias. Su ubicación individual no está identificada en el dibujo; el trazado geográfico se consulta por separado en OSM.':model.kind==='document-crop'?model.name+' · Sector rotulado en el plano original. La avenida forma parte de una superficie vial común; no se ha extraído una curva individual. No representa su extensión completa.':trail.name+(Number.isFinite(trail.officialDistanceM)?' · '+trail.officialDistanceM+' m publicados':'')+' · Curvas originales del PDF'+(trail.missingConnections?.length?' · '+trail.missingConnections.length+' huecos del original conservados.':'.');
  if(fit)viewer.open(model.viewBox);
 }
 function fitAll(){selected=null;isolated=false;setMode(mode);for(const group of groups.values()){group.style.display='';group.style.opacity='1';}for(const button of navigation.querySelectorAll('button'))button.setAttribute('aria-pressed','false');const routes=models.filter(t=>t.routeGeometryAvailable),x=Math.min(...routes.map(t=>t.viewBox.x)),y=Math.min(...routes.map(t=>t.viewBox.y)),right=Math.max(...routes.map(t=>t.viewBox.x+t.viewBox.width)),bottom=Math.max(...routes.map(t=>t.viewBox.y+t.viewBox.height));viewer.open({x,y,width:right-x,height:bottom-y});get('document-cycling-selection').textContent=routes.length+' recorridos con curvas originales sin simplificar; '+(models.length-routes.length)+' referencias de avenidas en el plano o su tabla. No se deducen conexiones.';}
 for(const button of document.querySelectorAll('[data-document-mode]'))button.addEventListener('click',()=>setMode(button.dataset.documentMode),options);
 get('document-opacity').addEventListener('input',()=>setMode(mode),options);get('document-fit-cycling').addEventListener('click',fitAll,options);
 const stage=get('document-stage');stage.addEventListener('pointerdown',event=>{if(tap){tap=null;return;}const group=event.target.closest?.('.document-cycling-trail');tap={id:group?.dataset.trailId,pointer:event.pointerId,x:event.clientX,y:event.clientY};},options);
 stage.addEventListener('pointermove',event=>{if(tap&&Math.hypot(event.clientX-tap.x,event.clientY-tap.y)>6)tap=null;},options);
 stage.addEventListener('pointerup',event=>{if(tap?.id&&tap.pointer===event.pointerId)select(tap.id,{fit:false});tap=null;},options);stage.addEventListener('pointercancel',()=>{tap=null;},options);
 get('document-fit-cycling').textContent='Todos los recorridos';setMode(mode);
 return{open(id,{mode:nextMode='overlay',isolate=false}={}){isolated=isolate;selected=models.some(t=>t.id===id)?id:null;setMode(nextMode);if(selected)select(id);else fitAll();},select,setMode,destroy(){controller.abort();layer.replaceChildren();navigation.replaceChildren();},get selected(){return selected;}};
}
