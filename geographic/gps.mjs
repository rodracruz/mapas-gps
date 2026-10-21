import {createRouteMatcher} from '../navigation/matcher.mjs';
import {createPublicDemo} from '../navigation/demo.mjs';
import {gpsViewport} from './gps-viewport.mjs';

// Session-only tracking. No positions or inferred trail choices are persisted.
export function setupGpsTracking({map,geo,setSource,getSource,routeName=route=>route.name,demoFactory=createPublicDemo}){
 const el=id=>document.getElementById(id);el('gps-demo').hidden=!demoFactory;const matcher=createRouteMatcher(geo),layer=L.layerGroup().addTo(map);
 const pane='gps-location',gpsPane=map.getPane(pane)||map.createPane(pane);
 gpsPane.style.zIndex='650';gpsPane.style.pointerEvents='none';
 let mode='off',watchId=null,timer=null,ageTimer=null,session=0,result=matcher.snapshot(),demo=null,index=-1,paused=false,follow=false,firstFix=true,signalError=null,demoFit=false,frame=null;
 const controls='.map-toolbar,.map-source-switch,#map-filter-slot,.route-filters.in-map .route-filter-body,#map-trails,.leaflet-control-zoom,#map-options,#gps-panel,#route-sheet,#map-notice';
 const notice=el('map-notice'),noticeParent=notice.parentNode,noticeNext=notice.nextSibling;
 function viewport(){
  const container=map.getContainer().getBoundingClientRect(),size=map.getSize();
  return gpsViewport({width:size.x,height:size.y},[...document.querySelectorAll(controls)].filter(e=>e.getClientRects().length).map(e=>{const r=e.getBoundingClientRect();return{x:r.x-container.x,y:r.y-container.y,width:r.width,height:r.height};}));
 }
 function positionCamera(){
  if(mode==='off')return;const r=viewport();if(!r)return;
  const size=map.getSize();
  if(demoFit&&demo){map.fitBounds(L.latLngBounds(demo.fixes.map(f=>[f.latitude,f.longitude])),{paddingTopLeft:[r.x,r.y],paddingBottomRight:[size.x-r.x-r.width,size.y-r.y-r.height],maxZoom:18,animate:false});}
  else if(follow&&result.raw){
   map.setView([result.raw.latitude,result.raw.longitude],firstFix?Math.max(map.getZoom(),17):map.getZoom(),{animate:false});firstFix=false;
   map.panBy([size.x/2-r.x-r.width/2,size.y/2-r.y-r.height/2],{animate:false});
  }
 }
 const refreshCamera=()=>{if(frame!==null)cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{frame=null;positionCamera();});};
 const text=(id,value)=>{if(el(id).textContent!==value)el(id).textContent=value;};
 const details={
  'awaiting-fix':'Esperando una lectura de ubicación.',acquiring:'Comprobando varias lecturas antes de elegir una pista.',
  'route-acquired':'Pista probable tras varias lecturas coherentes.', 'continuity-held':'Mantiene la pista por continuidad, aunque otra línea esté cerca.',
  'junction-evidence-pending':'Cruce OSM próximo: comprobando por qué salida continúas.',
  'junction-transition':'Cambio de pista probable tras un nodo compartido de OSM y varias lecturas.',
  'route-incompatible':'La lectura no encaja con la pista anterior. Se suspende el ajuste.',
  reacquired:'Pista probable recuperada tras descartar la hipótesis anterior.',
  'hypothesis-rejected':'Se descartó la pista anterior. Buscando de nuevo.',
  'ambiguous-candidates':'Varias pistas son compatibles: todavía no se elige una.',
  'stale-fix':'La posición tiene más de 10 segundos. Esperando una lectura reciente.',
  'poor-accuracy':'La precisión supera 45 m. Se muestra la lectura sin ajustar.',
  'outside-network':'La lectura está fuera de la red OSM disponible.',
  'out-of-order':'Se descartó una lectura anterior a la última aceptada.',
  'future-fix':'La hora de la lectura no es válida.', 'invalid-fix':'La lectura de ubicación no es válida.',
  'teleport-reacquiring':'El salto entre lecturas no es coherente. Comprobando de nuevo.'
 };
 function render(){
  el('gps-panel').dataset.mode=mode;layer.clearLayers();const active=mode!=='off',isDemo=mode==='demo',sign=getSource()==='cartel';
  // A connection warning belongs with GPS status while tracking, so it cannot
  // cover the last free strip of map on a short phone. Restore it on stop.
  if(active&&notice.parentNode!==el('gps-panel'))el('gps-panel').append(notice);
  else if(!active&&notice.parentNode!==noticeParent)noticeParent.insertBefore(notice,noticeNext);
  const name=result.route?routeName(result.route):null;
  const status=el('gps-status');status.dataset.state=active?result.status:'off';status.dataset.routeId=active?result.route?.id||'':'';status.dataset.reason=active?result.reason:'off';
  text('gps-mode',isDemo?(index===demo.fixes.length-1?'Demostración finalizada · posición simulada':'Demostración · posición simulada'):active?'GPS · OSM experimental':'Ubicación desactivada');
  text('gps-toggle',mode==='gps'?'Detener GPS':'Mi ubicación');el('gps-toggle').setAttribute('aria-pressed',String(mode==='gps'));
  text('gps-demo',isDemo?'Salir de demo':'Probar recorrido');el('gps-demo').setAttribute('aria-pressed',String(isDemo));
  el('gps-center').hidden=!active||!result.raw;el('gps-demo-controls').hidden=!isDemo;
  if(isDemo){el('gps-demo-progress').max=demo.fixes.length;el('gps-demo-progress').value=index+1;el('gps-demo-next').disabled=index>=demo.fixes.length-1;el('gps-demo-pause').disabled=index>=demo.fixes.length-1;text('gps-demo-pause',paused?'Continuar':'Pausar');text('gps-demo-stage',`${index+1}/${demo.fixes.length} · ${demo.fixes[index]?.stage==='exit'?'Salida del cruce':demo.fixes[index]?.stage==='junction'?'Cruce OSM':'Lomo Vetado'}`);}
  const heading=!active?'Identificación de pista':sign?'Cartel aproximado · GPS sin ajuste':result.status==='probable'?`Ruta probable: ${name}`:result.status==='ambiguous'?'Pista ambigua':result.status==='stale'?'GPS sin lectura reciente':result.status==='off-route'?'Fuera de la red disponible':result.status==='error'?'No se pudo obtener tu ubicación':'Buscando pista probable…';
  text('gps-status',heading);
  text('gps-detail',!active?(demoFactory?'Activa tu ubicación o prueba el recorrido público Lomo Vetado → Calibre 12.':'Activa tu ubicación para identificar una pista probable en los tramos OSM disponibles.'):sign?'El cartel no está calibrado para GPS. Cambia a OSM para ver el ajuste probable.':details[result.reason]||result.message||'Esperando una lectura fiable.');
  text('gps-accuracy',active&&result.raw?`${isDemo?'Lectura simulada':'Lectura GPS'} · precisión indicada ±${Math.round(result.raw.accuracy)} m${result.status==='stale'?' · antigua':''}`:'');
  if(!active||!result.raw)return;
  const raw=result.raw,latlng=[raw.latitude,raw.longitude],color=isDemo?'#c76722':'#2874bd';
  L.circle(latlng,{pane,radius:raw.accuracy,color,weight:1,fillColor:color,fillOpacity:.08,interactive:false,className:'gps-accuracy-circle'}).addTo(layer);
  L.circleMarker(latlng,{pane,radius:5,color:'#fff',weight:2,fillColor:color,fillOpacity:1,interactive:false,className:'gps-raw-dot'}).addTo(layer);
  if(!sign&&result.snapped&&result.status==='probable'){
   const snap=[result.snapped.latitude,result.snapped.longitude];
   L.polyline([latlng,snap],{pane,color,weight:1.5,dashArray:'3 5',interactive:false}).addTo(layer);
   // A hollow ring keeps the original reading visible even when both coincide.
   L.circleMarker(snap,{pane,radius:10,color:'#203e35',weight:3,fill:false,interactive:false,className:'gps-snapped-dot'}).addTo(layer);
  }
 }
 function show(next){result=next;render();positionCamera();}
 function stop(){session++;if(watchId!==null)navigator.geolocation.clearWatch(watchId);watchId=null;clearInterval(timer);clearInterval(ageTimer);timer=ageTimer=null;mode='off';demo=null;index=-1;paused=false;follow=false;demoFit=false;firstFix=true;signalError=null;result=matcher.reset();render();}
 function fail(error){
  const messages={1:'El permiso de ubicación fue rechazado. Puedes habilitarlo en los permisos del navegador.',2:'No hay una lectura disponible. El GPS sigue activo y espera recuperar señal.',3:'No llegó una lectura a tiempo. El GPS sigue esperando señal.'};
  if(error.code===1){stop();text('gps-status','Permiso de ubicación rechazado');text('gps-detail',messages[1]);el('gps-status').dataset.state='error';el('gps-status').dataset.reason='permission-denied';return;}
  // POSITION_UNAVAILABLE and TIMEOUT can be temporary. Keep the native watch,
  // suppress the adjusted point and let later fixes (or age expiry) reevaluate.
  signalError={reason:'signal-unavailable',message:messages[error.code]||messages[2]};
  show({...matcher.snapshot(),status:'searching',route:null,snapped:null,...signalError});
 }
 function startGps(){
  stop();if(!window.isSecureContext||!navigator.geolocation){text('gps-status','Ubicación no disponible');text('gps-detail','Abre la app mediante HTTPS o localhost en un navegador con geolocalización.');return;}
  setSource('osm');mode='gps';follow=true;const current=session;render();
  watchId=navigator.geolocation.watchPosition(p=>{if(current!==session||mode!=='gps')return;signalError=null;const c=p.coords;show(matcher.update({longitude:c.longitude,latitude:c.latitude,accuracy:c.accuracy,timestamp:p.timestamp,heading:c.heading,speed:c.speed},Date.now()));},e=>{if(current===session)fail(e);},{enableHighAccuracy:true,maximumAge:0,timeout:15000});
  ageTimer=setInterval(()=>{if(current!==session||mode!=='gps')return;const s=matcher.snapshot(Date.now());show(signalError&&s.status!=='stale'?{...s,status:'searching',route:null,snapped:null,...signalError}:s);},1000);
 }
 function step(){if(mode!=='demo'||index>=demo.fixes.length-1)return;index++;show(matcher.update(demo.fixes[index],demo.fixes[index].timestamp));if(index===demo.fixes.length-1){clearInterval(timer);timer=null;paused=true;render();}}
 function playback(){clearInterval(timer);timer=setInterval(step,500);}
 function startDemo(){
  if(!demoFactory)return;stop();setSource('osm');demo=demoFactory(geo);mode='demo';demoFit=true;step();playback();
 }
 el('gps-toggle').onclick=()=>mode==='gps'?stop():startGps();el('gps-demo').onclick=()=>mode==='demo'?stop():startDemo();
 el('gps-demo-pause').onclick=()=>{if(mode!=='demo')return;paused=!paused;if(paused){clearInterval(timer);timer=null;}else playback();render();};
 el('gps-demo-next').onclick=()=>{paused=true;clearInterval(timer);timer=null;step();};
 el('gps-center').onclick=()=>{demoFit=false;follow=true;firstFix=true;show(result);};
 const dragged=()=>{follow=false;demoFit=false;};map.on('dragstart',dragged);map.on('resize',refreshCamera);window.addEventListener('pagehide',stop);
 // The filter body moves into the map after setup; observe its stable ID too.
 const observer=new ResizeObserver(refreshCamera);for(const node of document.querySelectorAll(controls+',#route-filter-body'))observer.observe(node);
 render();return {stop,sourceChanged:()=>{render();refreshCamera();},setMapOpen:open=>{if(!open)stop();},destroy(){stop();observer.disconnect();if(frame!==null)cancelAnimationFrame(frame);map.off('dragstart',dragged);map.off('resize',refreshCamera);window.removeEventListener('pagehide',stop);layer.remove();}};
}
