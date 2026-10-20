import {routeFilterModels,filterRoutes,validFilterLocation} from './route-filters.mjs';
const el=id=>document.getElementById(id);
const selectOption=(value,label)=>{const o=document.createElement('option');o.value=value;o.textContent=label;return o;};
export function setupRouteFilters({getTargets,getGeo,onChange}){
 const panel=document.createElement('section');panel.id='route-filters';panel.className='route-filters';panel.setAttribute('aria-label','Filtrar y ordenar recorridos');panel.innerHTML='<header><button id="filter-toggle" type="button" aria-expanded="true" aria-controls="route-filter-body">Filtrar y ordenar</button><button id="filter-reset" type="button">Restablecer</button></header><div id="route-filter-body" class="route-filter-body"><div class="filter-fields"><label>Tipo<select id="filter-type" aria-label="Tipo de recorrido"></select></label><label>Longitud OSM<select id="filter-length" aria-label="Ordenar por longitud"><option value="default">Sin ordenar</option><option value="length-desc">Más larga primero</option><option value="length-asc">Más corta primero</option></select></label><label>Cercanía a mí<select id="filter-proximity" aria-label="Ordenar por cercanía"><option value="default">Sin ordenar</option><option value="near">Más cerca primero</option><option value="far">Más lejos primero</option></select></label><label>Dificultad<select id="filter-difficulty" aria-label="Filtrar por dificultad"></select></label></div><div class="filter-foot"><p id="filter-status" role="status"></p><button id="filter-locate" type="button" aria-label="Actualizar ubicación para cercanía" title="Actualizar ubicación">↻</button></div></div>';
 el('route-filter-anchor').append(panel);el('map-card').style.order='-1';
 let models=[],state={type:'all',difficulty:'all',order:'default'},fix=null,sequence=0,expiry=null,pending=false,locationError='',fullscreen=false,open=true,entries=[];
 const primaryIds=[...document.querySelectorAll('[data-trail-summary]')].map(n=>n.dataset.trailSummary);
 const showBody=()=>{el('route-filter-body').hidden=fullscreen&&!open;el('filter-toggle').setAttribute('aria-expanded',String(!fullscreen||open));};
 function sync(){el('filter-type').value=state.type;el('filter-difficulty').value=state.difficulty;el('filter-length').value=state.order.startsWith('length-')?state.order:'default';el('filter-proximity').value=['near','far'].includes(state.order)?state.order:'default';}
 function render(){
  entries=filterRoutes(models,{...state,fix});const ids=new Set(entries.map(m=>m.id)),ranks=new Map(entries.map((m,i)=>[m.id,i]));
  for(const card of document.querySelectorAll('.trail-card')){const id=card.querySelector('[data-trail-summary]')?.dataset.trailSummary;card.hidden=!ids.has(id);card.style.order=String(ranks.get(id)??models.length);}
  for(const button of el('map-trails').querySelectorAll('[data-map-target]')){button.hidden=!ids.has(button.dataset.mapTarget);button.style.order=String(ranks.get(button.dataset.mapTarget)??models.length);}
  const near=['near','far'].includes(state.order),ready=validFilterLocation(fix);panel.dataset.location=pending?'pending':locationError?'error':ready?'ready':'off';
  el('filter-toggle').textContent='Filtrar y ordenar · '+entries.length;
  const count=entries.length?entries.length+' recorridos':'Sin coincidencias';
  el('filter-status').textContent=locationError|| (pending?'Buscando tu ubicación; el mapa permanece disponible.':near?(ready?count+' · Cercanía al tramo OSM, en línea recta · ±'+Math.round(fix.accuracy)+' m.':count+' · Ubicación no disponible o antigua. Actualízala para ordenar.'):state.order.startsWith('length-')?count+' · Longitud de tramos OSM disponibles; sin datos al final.':count+' · Tipos y dificultad según las fuentes del parque.');
  el('filter-locate').style.visibility=near||pending?'visible':'hidden';el('filter-locate').disabled=pending;
  for(const m of models){const details=document.querySelector(`[data-trail-details="${m.id}"]`);if(!details)continue;let note=details.querySelector('.filter-proximity-note');if(!note){note=document.createElement('p');note.className='fine-print filter-proximity-note';details.append(note);}const entry=entries.find(t=>t.id===m.id);note.hidden=!near;note.textContent=entry?.distanceM!==null&&Number.isFinite(entry?.distanceM)?'Cercanía al tramo OSM: aproximadamente '+Math.round(entry.distanceM).toLocaleString('es-CL')+' m en línea recta; no es la distancia por caminos ni identifica un acceso.':'Cercanía sin calcular: falta una ubicación reciente o geometría geográfica identificada.';}
  sync();onChange?.(entries,{...state});
 }
 function cancel(){sequence++;pending=false;}
 function requestLocation(){
  cancel();locationError='';const current=sequence;pending=true;render();
  const fail=error=>{if(current!==sequence)return;pending=false;fix=null;clearTimeout(expiry);locationError=error.code===1?'Permiso de ubicación rechazado. Puedes seguir usando el mapa y los otros filtros.':error.code===4?'La posición es antigua o poco precisa. Actualiza tu ubicación para ordenar.':'No se pudo obtener ubicación. El mapa y los demás filtros siguen disponibles.';render();};
  if(!window.isSecureContext||!navigator.geolocation){fail({code:2});return;}
  try{navigator.geolocation.getCurrentPosition(position=>{if(current!==sequence)return;const next={longitude:position.coords.longitude,latitude:position.coords.latitude,accuracy:position.coords.accuracy,timestamp:position.timestamp};if(!validFilterLocation(next)){fail({code:4});return;}pending=false;fix=next;clearTimeout(expiry);render();expiry=setTimeout(()=>{fix=null;render();},Math.max(0,next.timestamp+60001-Date.now()));},fail,{enableHighAccuracy:true,maximumAge:0,timeout:10000});}catch{fail({code:2});}
 }
 el('filter-type').onchange=()=>{state.type=el('filter-type').value;render();};el('filter-difficulty').onchange=()=>{state.difficulty=el('filter-difficulty').value;render();};
 el('filter-length').onchange=()=>{cancel();state.order=el('filter-length').value;locationError='';render();};
 el('filter-proximity').onchange=()=>{cancel();state.order=el('filter-proximity').value;locationError='';if(['near','far'].includes(state.order)&&!validFilterLocation(fix))requestLocation();else render();};
 el('filter-locate').onclick=requestLocation;el('filter-reset').onclick=()=>{cancel();clearTimeout(expiry);fix=null;locationError='';state={type:'all',difficulty:'all',order:'default'};render();};el('filter-toggle').onclick=()=>{if(fullscreen){open=!open;showBody();}};
 window.addEventListener('pagehide',()=>{cancel();clearTimeout(expiry);fix=null;});window.addEventListener('pageshow',render);
 return{
  refresh(){const targets=getTargets(),ordered=[...targets].sort((a,b)=>{const ai=primaryIds.indexOf(a.id),bi=primaryIds.indexOf(b.id);return(ai<0?targets.length:ai)-(bi<0?targets.length:bi);});models=routeFilterModels(ordered,getGeo());const types=new Map(models.map(m=>[m.type.id,m.type.label])),difficulty=new Set(models.map(m=>m.difficulty));el('filter-type').replaceChildren(selectOption('all','Todos los tipos'),...[...types].map(([id,label])=>selectOption(id,label)));if(!types.has(state.type))state.type='all';el('filter-difficulty').replaceChildren(selectOption('all',difficulty.size===1&&difficulty.has('unknown')?'Sin datos publicados':'Todas las dificultades'),...['Principiante','Intermedio','Avanzado','Experto','unknown'].filter(v=>difficulty.has(v)).map(v=>selectOption(v,v==='unknown'?'Sin dificultad publicada':v)));el('filter-difficulty').disabled=difficulty.size===1&&difficulty.has('unknown');if(!difficulty.has(state.difficulty))state.difficulty='all';render();},
  includes(id){return entries.some(t=>t.id===id);},
  reveal(id){const m=models.find(t=>t.id===id);if(m&&!entries.some(t=>t.id===id)){state.type='all';state.difficulty='all';render();}},
  setFullscreen(next){if(fullscreen===next)return;fullscreen=next;open=!next;panel.classList.toggle('in-map',next);el(next?'map-filter-slot':'route-filter-anchor').append(panel);showBody();},
  clearConstraints(){state.type='all';state.difficulty='all';render();},
  collapse(){if(fullscreen){open=false;showBody();}},
  get state(){return{...state};}
 };
}
// Reserve the actual controls and lateral panels, including short landscape.
export function filterMapPadding(map,full){
 if(!full)return{paddingTopLeft:[15,10],paddingBottomRight:[15,10]};
 const size=map.getSize(),origin=el('geo-map').getBoundingClientRect();let left=35,right=35,top=Math.max(0,...['.map-toolbar','.map-source-switch','#map-filter-slot','#map-trails'].map(s=>el('map-card').querySelector(s)).filter(n=>n?.getClientRects().length).map(n=>n.getBoundingClientRect().bottom-origin.top))+14,bottom=45;
 for(const id of ['route-sheet','gps-panel']){const n=el(id);if(!n?.getClientRects().length)continue;const r=n.getBoundingClientRect();if(r.width<size.x*.6&&r.left-origin.left>size.x*.4)right=Math.max(right,size.x-(r.left-origin.left)+16);else if(r.width<size.x*.6&&r.right-origin.left<size.x*.6)left=Math.max(left,r.right-origin.left+16);else bottom=Math.max(bottom,size.y-(r.top-origin.top)+20);}
 const v=Math.min(1,Math.max(0,size.y-100)/(top+bottom)),h=Math.min(1,Math.max(0,size.x-120)/(left+right));return{paddingTopLeft:[left*h,top*v],paddingBottomRight:[right*h,bottom*v]};
}
