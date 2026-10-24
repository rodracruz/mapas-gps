import {validateContinuous,createCartelLayer} from './cartel.mjs';
import {fromOsmSnapshot} from './data.mjs';
import {validateCatalog,describeTrail} from './catalog.mjs';
import {sha256} from '../review/sha256.mjs';
import {setupSignReview} from './sign.mjs';
import {setupGpsTracking} from './gps.mjs';
import {loadParkDirectory,renderParkDirectory} from './parks.mjs';
import {attachTrailPreviews} from './trail-preview.mjs';
const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let directory,catalog,map,geo,contextLayer,selectionLayer,selectedFeature=null,selectedTarget=null,loadPromise,full=false;
const targetLayers=new Map(),hiddenTargets=new Set(),hiddenCartelTargets=new Set();
let gpsTracking,signReview,cartelData,cartelLayer,registration,mapSource=new URLSearchParams(location.hash.slice(1)).get('fuente')==='osm'?'osm':'cartel';
const metricMarkup=stats=>[['Longitud',stats.distance],['Dificultad',stats.difficulty],['Vel. máxima',stats.maxSpeed],['Ascenso',stats.elevationGain],['Descenso',stats.elevationLoss]].map(([name,value])=>`<div><dt>${esc(name)}</dt><dd>${esc(value)}</dd></div>`).join('');
function routeState(){const p=new URLSearchParams(location.hash.slice(1));return {park:p.get('parque'),map:p.get('mapa')==='1'};}
function navigate(park,showMap=false,replace=false){const hash=park?'#'+new URLSearchParams({parque:park,...(showMap?{mapa:'1'}:{})}):'';history[replace?'replaceState':'pushState']({mapasGPS:true,mapasMap:showMap},'',location.pathname+location.search+hash);renderRoute();}
function featuresFor(id){return geo?.features.filter(f=>f.properties.targetId===id)||[];}
function renderCatalog(){
 const p=catalog.park;
 renderParkDirectory($('park-list'),directory,park=>{if(park.id===p.id)navigate(p.id);else location.assign(park.entry);});$('back-to-parks').onclick=()=>navigate(null);
 $('park-name').textContent=p.name;$('park-locality').textContent=p.locality;$('park-description').textContent=p.description;$('map-park-title').textContent=p.shortName;$('park-source').href=p.sourceUrl;
 const symbols={banos:'◫',agua:'♧',cafeteria:'☕',tienda:'◇',guardaparques:'⌂',pumptrack:'↝'};
 $('amenities').innerHTML=p.amenities.map(a=>`<li><span aria-hidden="true">${symbols[a.id]||'✓'}</span><span>${esc(a.label)}</span></li>`).join('');
 const ordered=[...p.primaryTargetIds,...catalog.targets.map(t=>t.id).filter(id=>!p.primaryTargetIds.includes(id))];
 for(const [index,id] of ordered.entries()){
  const t=catalog.targets.find(t=>t.id===id),card=document.createElement('details');card.className='trail-card tile-card';card.style.setProperty('--trail-color',t.color);
  card.innerHTML=`<summary class="tile-face" data-trail-summary="${esc(t.id)}"><span class="trail-topline"><span class="trail-badge"><i></i>${esc(t.difficulty?.label||'Dificultad por confirmar')}</span><span class="trail-number">${String(index+1).padStart(2,'0')}</span></span><span><h3>${esc(t.name)}</h3><span class="trail-footer"><span class="card-distance" data-distance="${esc(t.id)}">Consultando trazado…</span><span class="trail-chevron" aria-hidden="true">⌄</span></span></span></summary><div class="trail-details" data-trail-details="${esc(t.id)}"><p>${esc(t.description)}</p><dl class="stats" data-stats="${esc(t.id)}"></dl><p class="fine-print">${esc(t.sourceNote)}</p><button class="text-button" data-show-on-map="${esc(t.id)}">Ver en el mapa ↗</button></div>`;
  card.querySelector('[data-show-on-map]').onclick=()=>{selectTarget(t.id);navigate(p.id,true);};
  if(!t.visualTrailId){const note=document.createElement('p');note.className='fine-print trail-preview-unavailable';note.textContent='Este sendero aún no tiene un trazado específico identificado en el plano oficial.';card.querySelector('.trail-details').prepend(note);}
  if(t.visualTrailId){const button=document.createElement('button');button.className='text-button';button.textContent='Ver en el plano del cartel →';button.onclick=()=>signReview.open(t.visualTrailId);card.querySelector('.trail-details').append(button);}
  $('trail-grid').append(card);
 }
 $('map-trails').innerHTML=catalog.targets.map(t=>`<button data-map-target="${esc(t.id)}" data-pending="${t.status!=='osm-identified'}" aria-pressed="false"><i class="trail-color" style="--trail-color:${t.color}"></i>${esc(t.name)}</button>`).join('');
 for(const b of $('map-trails').querySelectorAll('button'))b.onclick=()=>selectTarget(b.dataset.mapTarget);
 $('visibility-controls').innerHTML=catalog.targets.filter(t=>t.status==='osm-identified').map(t=>`<label class="check-row"><input type="checkbox" data-visible-target="${esc(t.id)}" checked> ${esc(t.name)}</label>`).join('');
 for(const input of $('visibility-controls').querySelectorAll('input'))input.onchange=()=>setTargetVisible(input.dataset.visibleTarget,input.checked);
 $('open-map').onclick=()=>navigate(p.id,true);$('close-map').onclick=()=>{if(history.state?.mapasMap)history.back();else navigate(p.id,false,true);};
 $('map-source-cartel').onclick=()=>setMapSource('cartel');$('map-source-osm').onclick=()=>setMapSource('osm');$('fit-routes').onclick=fitAvailableRoutes;$('close-sheet').onclick=()=>{$('route-sheet').hidden=true;selectedTarget=null;selectedFeature=null;selectionLayer?.clearLayers();cartelLayer?.select(null);updateSelectionButtons();};
 $('fit-selected').onclick=()=>{if(mapSource==='cartel'&&selectedTarget)fitCartel(selectedTarget);else if(selectedFeature)fitFeatures(selectedTarget?featuresFor(selectedTarget):[selectedFeature]);};
 $('show-context').onchange=()=>{if(!contextLayer||mapSource!=='osm')return;if($('show-context').checked)contextLayer.addTo(map);else map.removeLayer(contextLayer);};
 $('osm-way').onchange=()=>{const f=geo.features.find(f=>f.id===$('osm-way').value);if(f){setMapSource('osm');selectFeature(f);fitFeatures([f]);}};
 $('download-geojson').onclick=()=>{if(!geo)return;const url=URL.createObjectURL(new Blob([JSON.stringify(geo,null,2)],{type:'application/geo+json'}));const a=document.createElement('a');a.href=url;a.download='el-durazno-trazados-osm.geojson';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 updateCards();
}
function updateCards(){
 for(const t of catalog.targets){const stats=describeTrail(t,geo?.features||[]);document.querySelector(`[data-stats="${t.id}"]`).innerHTML=metricMarkup({...stats,distance:featuresFor(t.id).length?stats.distance+' · OSM':stats.distance});document.querySelector(`[data-distance="${t.id}"]`).textContent=featuresFor(t.id).length?stats.distance+' en OSM · Ver información':'Trazado pendiente · Ver información';}
 const count=catalog.targets.filter(t=>featuresFor(t.id).length).length;
 $('available-count').textContent='20 senderos del cartel';
 $('data-status').textContent=geo?'Las curvas del cartel se muestran sobre el mapa con ubicación aproximada. Puedes compararlas con '+count+' senderos de OSM.':'Los senderos se cargarán al abrir el parque.';
}
function updateSelectionButtons(){for(const button of $('map-trails').querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.mapTarget===selectedTarget));}
function paintSelection(features){
 selectionLayer?.clearLayers();if(!selectionLayer||!features)return;
 for(const feature of (Array.isArray(features)?features:[features])){
 const color=catalog.targets.find(t=>t.id===feature.properties.targetId)?.color||'#687765';const coords=feature.geometry.coordinates.map(([lon,lat])=>[lat,lon]);
 L.polyline(coords,{color:'#fffefa',weight:11,opacity:1,interactive:false,smoothFactor:0,className:'selected-route'}).addTo(selectionLayer);
 L.polyline(coords,{color,weight:6,opacity:1,interactive:false,smoothFactor:0,className:'selected-route'}).addTo(selectionLayer);
 }
}
function selectTarget(id){
 if(mapSource==='cartel'&&cartelData){if(cartelData.trails.some(t=>t.id===id))return selectCartel(id);setMapSource('osm');}
 const t=catalog.targets.find(t=>t.id===id);if(!t)return;
 selectedTarget=id;selectedFeature=featuresFor(id)[0]||null;
 if(selectedFeature&&hiddenTargets.has(id))setTargetVisible(id,true);
 paintSelection(featuresFor(id));updateSelectionButtons();const stats=describeTrail(t,geo?.features||[]);
 $('sheet-title').textContent=t.name;$('sheet-level').textContent=selectedFeature?'SENDERO · '+stats.difficulty.toUpperCase():'TRAZADO PENDIENTE';
 $('sheet-description').textContent=selectedFeature?t.description:'Trazado pendiente. Esta pista todavía no tiene una línea disponible en nuestro mapa.';
 $('sheet-stats').innerHTML=metricMarkup(stats);$('sheet-source').href=t.publicMapUrl;$('sheet-source').textContent=selectedFeature?'Fuente OpenStreetMap ↗':'Referencia de la pista ↗';$('fit-selected').hidden=!selectedFeature;$('route-sheet').hidden=false;
}
function selectFeature(feature){
 if(feature.properties.targetId){selectTarget(feature.properties.targetId);return;}
 selectedTarget=null;selectedFeature=feature;updateSelectionButtons();paintSelection(feature);const t={id:'context',difficulty:null,elevationGainM:null,elevationLossM:null};
 const temporary={...feature,properties:{...feature.properties,targetId:'context'}};
 $('sheet-title').textContent=feature.properties.name||'Sendero OSM sin nombre';$('sheet-level').textContent='CONTEXTO OPENSTREETMAP';$('sheet-description').textContent='Nombre y geometría conservados de la fuente. No se atribuye este tramo a una pista diferente.';$('sheet-stats').innerHTML=metricMarkup(describeTrail(t,[temporary]));$('sheet-source').href=feature.properties.sourceUrl;$('sheet-source').textContent='Fuente OpenStreetMap ↗';$('fit-selected').hidden=false;$('route-sheet').hidden=false;
}
function setTargetVisible(id,visible){if(mapSource==='cartel'&&cartelLayer){cartelLayer.setVisible(id,visible);if(visible)hiddenCartelTargets.delete(id);else hiddenCartelTargets.add(id);return;}const group=targetLayers.get(id);if(!group)return;if(visible){hiddenTargets.delete(id);group.addTo(map);}else{hiddenTargets.add(id);map.removeLayer(group);if(selectedTarget===id)selectionLayer.clearLayers();}const input=document.querySelector(`[data-visible-target="${id}"]`);if(input)input.checked=visible;}
function fitFeatures(features){if(!map||!features.length)return;const latlngs=features.flatMap(f=>f.geometry.coordinates.map(([lon,lat])=>[lat,lon]));const sheet=full&&!$('route-sheet').hidden?$('route-sheet').getBoundingClientRect():null;const lateral=sheet&&sheet.width<map.getSize().x*.8;const right=lateral?sheet.width+48:28;const bottom=sheet&&!lateral?sheet.height+35:35;map.fitBounds(L.latLngBounds(latlngs),{paddingTopLeft:full?[28,140]:[20,16],paddingBottomRight:full?[right,bottom]:[20,16],maxZoom:17,animate:false});}
function fitAvailableRoutes(){if(mapSource==='cartel'&&cartelLayer)return fitCartel();fitFeatures(geo?.features.filter(f=>f.properties.targetId&&!hiddenTargets.has(f.properties.targetId))||[]);}
function selectCartel(id){
 const visual=cartelData.trails.find(t=>t.id===id),t=catalog.targets.find(t=>t.id===id);if(!visual)return;
 selectedTarget=id;selectedFeature=null;cartelLayer.select(id);cartelLayer.setVisible(id,true);hiddenCartelTargets.delete(id);const input=document.querySelector(`[data-visible-target="${id}"]`);if(input)input.checked=true;updateSelectionButtons();
 $('sheet-title').textContent=visual.name;$('sheet-level').textContent='CARTEL · UBICACIÓN APROXIMADA';$('sheet-description').textContent='Recorrido original del cartel de Outlife. Las curvas continúan bajo sus rótulos y puntos. Su ubicación sobre el mapa es un ajuste experimental, pendiente de validación para GPS.';
 $('sheet-stats').innerHTML=metricMarkup({distance:'Sin medir',difficulty:t?.difficulty?.label||'Sin datos',maxSpeed:'Sin registros',elevationGain:'Sin datos',elevationLoss:'Sin datos'});$('sheet-source').href='https://www.outlife.cl/wp-content/uploads/2023/04/Mapa_El-Durazno-2022_web.pdf';$('sheet-source').textContent='Cartel original de Outlife ↗';$('fit-selected').hidden=false;$('route-sheet').hidden=false;
}
function fitCartel(id){
 const points=cartelLayer?.features(id,hiddenCartelTargets);if(!points?.length||!map)return;const sheet=full&&!$('route-sheet').hidden?$('route-sheet').getBoundingClientRect():null,lateral=sheet&&sheet.width<map.getSize().x*.8;
 map.fitBounds(L.latLngBounds(points),{paddingTopLeft:full?[25,175]:[15,10],paddingBottomRight:full?[lateral?sheet.width+45:25,sheet&&!lateral?sheet.height+35:40]:[15,10],maxZoom:id?18:15,animate:false});
}
function setMapSource(source){
 if(source==='cartel'&&!cartelLayer)return;mapSource=source;const visual=source==='cartel';$('map-card').dataset.source=source;
 $('map-source-cartel').setAttribute('aria-pressed',String(visual));$('map-source-osm').setAttribute('aria-pressed',String(!visual));$('map-source-status').textContent=visual?'Ubicación aproximada · Sin ajuste GPS':'Coordenadas de OpenStreetMap';
 if(map){if(visual){map.addLayer(cartelLayer.layer);for(const group of targetLayers.values())map.removeLayer(group);if(contextLayer)map.removeLayer(contextLayer);}else{if(cartelLayer)map.removeLayer(cartelLayer.layer);for(const [id,group]of targetLayers)if(!hiddenTargets.has(id))map.addLayer(group);if(contextLayer&&$('show-context').checked)map.addLayer(contextLayer);}}
 selectedTarget=null;selectedFeature=null;selectionLayer?.clearLayers();cartelLayer?.select(null);$('route-sheet').hidden=true;
 const trails=visual?cartelData.trails:catalog.targets;
 $('map-trails').innerHTML=trails.map(t=>`<button data-map-target="${esc(t.id)}" data-pending="${!visual&&t.status!=='osm-identified'}" aria-pressed="false"><i class="trail-color" style="--trail-color:${t.color}"></i>${esc(t.name)}</button>`).join('');for(const button of $('map-trails').querySelectorAll('button'))button.onclick=()=>selectTarget(button.dataset.mapTarget);
 $('visibility-controls').innerHTML=trails.filter(t=>visual||t.status==='osm-identified').map(t=>`<label class="check-row"><input type="checkbox" data-visible-target="${esc(t.id)}" ${(visual?hiddenCartelTargets:hiddenTargets).has(t.id)?'':'checked'}> ${esc(t.name)}</label>`).join('');for(const input of $('visibility-controls').querySelectorAll('input'))input.onchange=()=>setTargetVisible(input.dataset.visibleTarget,input.checked);
 fitAvailableRoutes();gpsTracking?.sourceChanged(source);
}
async function loadCartel(){
 const read=async(id,path)=>{const embedded=$(id);if(embedded)return embedded.textContent;const r=await fetch('./'+path);if(!r.ok)throw new Error('No se pudo cargar la capa del cartel.');return r.text();};
 const [raw,reg]=await Promise.all([read('embedded-all-visual','data/el-durazno/continuous-sign-trails.json'),read('embedded-cartel-registration','data/el-durazno/cartel-registration.json')]);registration=JSON.parse(reg);cartelData=validateContinuous(JSON.parse(raw));if(sha256(new TextEncoder().encode(raw))!==registration.sources.find(s=>s.id==='native-sign-artwork')?.sha256)throw new Error('El cartel no coincide con su fuente documentada.');
 try{
  const response=await fetch('./'+cartelData.image.url);if(!response.ok)throw new Error();const bytes=new Uint8Array(await response.arrayBuffer());if(sha256(bytes)!==cartelData.image.sha256)throw new Error();const imageUrl=URL.createObjectURL(new Blob([bytes],{type:'image/jpeg'}));
  attachTrailPreviews(cartelData,{background:{imageUrl,width:cartelData.image.width,height:cartelData.image.height},resolveId:id=>catalog.targets.find(t=>t.id===id)?.visualTrailId,onOpen:id=>{$('sign-opacity').value='100';signReview.open(id,'overlay');}});
 }catch{for(const card of document.querySelectorAll('.trail-card')){const note=document.createElement('p');note.className='fine-print';note.textContent='No se pudo cargar el recorte del plano oficial. Puedes abrir el plano y reintentar el fondo.';card.querySelector('.trail-details').prepend(note);}}
 cartelLayer=createCartelLayer(map,cartelData,registration,selectCartel);setMapSource(mapSource);
}
async function ensureMap(){
 if(loadPromise)return loadPromise;
 loadPromise=(async()=>{
  try{
   if(!window.L)throw new Error('No se pudo cargar el mapa. Reintenta con conexión.');
   map=L.map('geo-map',{zoomControl:false,scrollWheelZoom:true,zoomSnap:.25,minZoom:2,maxZoom:19}).setView([-33.305,-70.498],14);L.control.zoom({position:'topleft'}).addTo(map);L.control.scale({imperial:false,position:'bottomleft'}).addTo(map);
   const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{minZoom:0,maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>'}).addTo(map);
   let loaded=0;tiles.on('tileload',()=>{loaded++;$('geo-map').dataset.loadedTiles=String(loaded);if($('map-notice').dataset.kind==='tiles')$('map-notice').hidden=true;});tiles.on('tileerror',()=>{if(!loaded){$('map-notice').dataset.kind='tiles';$('map-notice').textContent='No se está cargando el fondo del mapa. Revisa tu conexión; los trazados disponibles conservan su ubicación.';$('map-notice').hidden=false;}});
   map.on('moveend zoomend',()=>{const c=map.getCenter();$('geo-map').dataset.view=[c.lat.toFixed(7),c.lng.toFixed(7),map.getZoom()].join(',');});
   selectionLayer=L.layerGroup().addTo(map);
   let bytes;const embedded=$('embedded-osm-source');if(embedded){bytes=Uint8Array.from(atob(embedded.textContent.trim()),c=>c.charCodeAt(0));}else{const response=await fetch('./'+catalog.sourceSnapshot);if(!response.ok)throw new Error('No se pudieron cargar los trazados del parque.');bytes=new Uint8Array(await response.arrayBuffer());}
   if(sha256(bytes)!==catalog.sourceSnapshotSha256)throw new Error('Los trazados no coinciden con su fuente verificada.');
   geo=fromOsmSnapshot(JSON.parse(new TextDecoder().decode(bytes)),catalog);
   contextLayer=L.geoJSON({...geo,features:geo.features.filter(f=>!f.properties.targetId)},{style:{color:'#82937d',weight:1.8,opacity:.6,smoothFactor:0},onEachFeature:(f,layer)=>layer.on('click',()=>selectFeature(f))}).addTo(map);
   for(const t of catalog.targets){const group=L.layerGroup();for(const f of featuresFor(t.id)){const points=f.geometry.coordinates.map(([lon,lat])=>[lat,lon]);L.polyline(points,{color:'#fffefa',weight:8,opacity:.95,interactive:false,smoothFactor:0}).addTo(group);L.polyline(points,{color:t.color,weight:4.5,opacity:1,interactive:false,smoothFactor:0,className:'trail-line'}).addTo(group);L.polyline(points,{color:t.color,weight:22,opacity:0,smoothFactor:0,className:'route-hit'}).on('click',()=>selectFeature(f)).addTo(group);}targetLayers.set(t.id,group);group.addTo(map);}
   $('osm-way').innerHTML=geo.features.map(f=>`<option value="${f.id}">${esc(f.properties.name||'Sendero sin nombre')} · ${f.properties.osmId}</option>`).join('');$('osm-way').disabled=false;$('download-geojson').disabled=false;
   updateCards();const requestedTarget=selectedTarget;try{await loadCartel();}catch(error){setMapSource('osm');$('map-notice').textContent=error.message+' Se muestran sólo datos OSM.';$('map-notice').dataset.kind='source';$('map-notice').hidden=false;}fitAvailableRoutes();if(requestedTarget)selectTarget(requestedTarget);
   gpsTracking=setupGpsTracking({map,geo,setSource:setMapSource,getSource:()=>mapSource,routeName:route=>catalog.targets.find(t=>t.id===route.targetId)?.name||route.name});gpsTracking.setMapOpen(full);
  }catch(error){$('data-status').textContent=error.message;$('map-notice').textContent=error.message;$('map-notice').dataset.kind='source';$('map-notice').hidden=false;$('download-geojson').disabled=true;}
  finally{$('map-card').dataset.ready='true';}
 })();return loadPromise;
}
async function renderRoute(){
 if(!catalog)return;const route=routeState();const destination=directory.parks.find(p=>p.id===route.park&&p.id!==catalog.park.id);if(destination){gpsTracking?.stop();location.replace(destination.entry+(route.map?'&mapa=1':''));return;}const show=route.park===catalog.park.id;
 $('park-picker').hidden=show;$('park-view').hidden=!show;full=show&&route.map;$('map-card').classList.toggle('fullscreen',full);document.body.classList.toggle('map-open',full);
 gpsTracking?.setMapOpen(full);
 if(!show){document.title='Mapas GPS · Elige un parque';return;}
 document.title=(full?'Mapa · ':'')+catalog.park.shortName+' · Mapas GPS';await ensureMap();if(map){map.invalidateSize({animate:false});if(full&&!selectedTarget)fitAvailableRoutes();}
 if(full)$('close-map').focus({preventScroll:true});
}
async function init(){try{directory=await loadParkDirectory();const embedded=$('embedded-geographic-catalog');if(embedded)catalog=JSON.parse(embedded.textContent);else{const response=await fetch('./data/el-durazno/geographic-catalog.json');if(!response.ok)throw new Error('No se pudo cargar la información del parque.');catalog=await response.json();}validateCatalog(catalog);signReview=setupSignReview();renderCatalog();await renderRoute();}catch(error){$('app-error').textContent=error.message;$('app-error').hidden=false;$('park-list').replaceChildren();}}
window.addEventListener('popstate',renderRoute);window.addEventListener('hashchange',renderRoute);window.addEventListener('resize',()=>map?.invalidateSize({animate:false}));window.addEventListener('keydown',event=>{if(event.key==='Escape'&&full)$('close-map').click();});init();
