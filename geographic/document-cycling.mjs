import {officialTrailModels,sourcePathNode} from './trail-preview.mjs';

// Native PDF paths and the raster share their parent's image coordinate system.
// This component never projects the schematic drawing onto geographic coordinates.
export function setupDocumentCycling({data,viewer}){
 const get=id=>document.getElementById(id),models=officialTrailModels(data),groups=new Map(),controller=new AbortController(),options={signal:controller.signal};
 const layer=get('document-cycling'),raster=get('document-image'),navigation=get('document-cycling-trails');let selected=null,mode='overlay',tap=null,isolated=false;
 for(const trail of data.trails){
  const group=document.createElementNS('http://www.w3.org/2000/svg','g');group.classList.add('document-cycling-trail');group.dataset.trailId=trail.id;group.setAttribute('aria-label',trail.name);
  for(const path of trail.paths){const node=sourcePathNode(path);if(path.role==='trail-stroke'&&trail.category!=='shared-trail'){node.setAttribute('vector-effect','non-scaling-stroke');node.setAttribute('stroke-width','3');node.removeAttribute('stroke-dasharray');}group.append(node);}
  layer.append(group);groups.set(trail.id,group);
  const button=document.createElement('button');button.type='button';button.dataset.visualTrail=trail.id;button.dataset.routeCategory=trail.category||'cycling-trail';button.style.borderColor=trail.category==='shared-trail'?'#008b7b':'#c58277';button.textContent=(trail.category==='shared-trail'?'P':'')+trail.number+' · '+trail.name;button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>select(trail.id),options);navigation.append(button);
 }
 function setMode(next){mode=next;raster.style.display=mode==='vectors'?'none':'';raster.style.opacity=mode==='overlay'?Number(get('document-opacity').value)/100:1;layer.style.display=mode==='photo'?'none':'';get('document-opacity').disabled=mode!=='overlay';for(const button of document.querySelectorAll('[data-document-mode]'))button.setAttribute('aria-pressed',String(button.dataset.documentMode===mode));}
 function select(id,{fit=true}={}){
  const model=models.find(t=>t.id===id),trail=data.trails.find(t=>t.id===id);if(!model)return;selected=id;
  for(const [key,group]of groups){group.style.display=isolated&&key!==id?'none':'';group.style.opacity=key===id?'1':'.22';group.classList.toggle('selected',key===id);}
  for(const button of navigation.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.visualTrail===id));
  get('document-cycling-selection').textContent=trail.name+' · '+trail.officialDistanceM+' m publicados · Curvas originales del PDF'+(trail.missingConnections?.length?' · '+trail.missingConnections.length+' huecos del original conservados.':'.');
  if(fit)viewer.open(model.viewBox);
 }
 function fitAll(){selected=null;isolated=false;for(const group of groups.values()){group.style.display='';group.style.opacity='1';}for(const button of navigation.querySelectorAll('button'))button.setAttribute('aria-pressed','false');const x=Math.min(...models.map(t=>t.viewBox.x)),y=Math.min(...models.map(t=>t.viewBox.y)),right=Math.max(...models.map(t=>t.viewBox.x+t.viewBox.width)),bottom=Math.max(...models.map(t=>t.viewBox.y+t.viewBox.height));viewer.open({x,y,width:right-x,height:bottom-y});get('document-cycling-selection').textContent=models.length+' recorridos del plano · Curvas del PDF sin simplificar. Los huecos originales se conservan; no se deducen conexiones.';}
 for(const button of document.querySelectorAll('[data-document-mode]'))button.addEventListener('click',()=>setMode(button.dataset.documentMode),options);
 get('document-opacity').addEventListener('input',()=>setMode(mode),options);get('document-fit-cycling').addEventListener('click',fitAll,options);
 const stage=get('document-stage');stage.addEventListener('pointerdown',event=>{if(tap){tap=null;return;}const group=event.target.closest?.('.document-cycling-trail');tap={id:group?.dataset.trailId,pointer:event.pointerId,x:event.clientX,y:event.clientY};},options);
 stage.addEventListener('pointermove',event=>{if(tap&&Math.hypot(event.clientX-tap.x,event.clientY-tap.y)>6)tap=null;},options);
 stage.addEventListener('pointerup',event=>{if(tap?.id&&tap.pointer===event.pointerId)select(tap.id,{fit:false});tap=null;},options);stage.addEventListener('pointercancel',()=>{tap=null;},options);
 get('document-fit-cycling').textContent='Los '+models.length+' recorridos';setMode(mode);
 return{open(id,{mode:nextMode='overlay',isolate=false}={}){isolated=isolate;setMode(nextMode);if(models.some(t=>t.id===id))select(id);else fitAll();},select,setMode,destroy(){controller.abort();layer.replaceChildren();navigation.replaceChildren();},get selected(){return selected;}};
}
