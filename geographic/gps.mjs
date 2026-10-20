import {createRouteMatcher} from '../navigation/matcher.mjs';
import {createPublicDemo} from '../navigation/demo.mjs';

// Session-only tracking. No positions or inferred trail choices are persisted.
export function setupGpsTracking({map,geo,setSource,getSource,routeName=route=>route.name}){
 const el=id=>document.getElementById(id),matcher=createRouteMatcher(geo),layer=L.layerGroup().addTo(map);
 let mode='off',watchId=null,timer=null,ageTimer=null,session=0,result=matcher.snapshot(),demo=null,index=-1,paused=false,follow=false,firstFix=true,signalError=null;
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
  layer.clearLayers();const active=mode!=='off',isDemo=mode==='demo',sign=getSource()==='cartel';
  const name=result.route?routeName(result.route):null;
  const status=el('gps-status');status.dataset.state=active?result.status:'off';status.dataset.routeId=active?result.route?.id||'':'';status.dataset.reason=active?result.reason:'off';
  text('gps-mode',isDemo?(index===demo.fixes.length-1?'Demostración finalizada · posición simulada':'Demostración · posición simulada'):active?'GPS · OSM experimental':'Ubicación desactivada');
  text('gps-toggle',mode==='gps'?'Detener GPS':'Mi ubicación');el('gps-toggle').setAttribute('aria-pressed',String(mode==='gps'));
  text('gps-demo',isDemo?'Salir de demo':'Probar recorrido');el('gps-demo').setAttribute('aria-pressed',String(isDemo));
  el('gps-center').hidden=!active||!result.raw;el('gps-demo-controls').hidden=!isDemo;
  if(isDemo){el('gps-demo-progress').max=demo.fixes.length;el('gps-demo-progress').value=index+1;el('gps-demo-next').disabled=index>=demo.fixes.length-1;el('gps-demo-pause').disabled=index>=demo.fixes.length-1;text('gps-demo-pause',paused?'Continuar':'Pausar');text('gps-demo-stage',`${index+1}/${demo.fixes.length} · ${demo.fixes[index]?.stage==='exit'?'Salida del cruce':demo.fixes[index]?.stage==='junction'?'Cruce OSM':'Lomo Vetado'}`);}
  const heading=!active?'Identificación de pista':sign?'Cartel aproximado · GPS sin ajuste':result.status==='probable'?`Ruta probable: ${name}`:result.status==='ambiguous'?'Pista ambigua':result.status==='stale'?'GPS sin lectura reciente':result.status==='off-route'?'Fuera de la red disponible':result.status==='error'?'No se pudo obtener tu ubicación':'Buscando pista probable…';
  text('gps-status',heading);
  text('gps-detail',!active?'Activa tu ubicación o prueba el recorrido público Lomo Vetado → Calibre 12.':sign?'El cartel no está calibrado para GPS. Cambia a OSM para ver el ajuste probable.':details[result.reason]||result.message||'Esperando una lectura fiable.');
  text('gps-accuracy',active&&result.raw?`${isDemo?'Lectura simulada':'Lectura GPS'} · precisión indicada ±${Math.round(result.raw.accuracy)} m${result.status==='stale'?' · antigua':''}`:'');
  if(!active||!result.raw)return;
  const raw=result.raw,latlng=[raw.latitude,raw.longitude],color=isDemo?'#c76722':'#2874bd';
  L.circle(latlng,{radius:raw.accuracy,color,weight:1,fillColor:color,fillOpacity:.08,interactive:false,className:'gps-accuracy-circle'}).addTo(layer);
  L.circleMarker(latlng,{radius:5,color:'#fff',weight:2,fillColor:color,fillOpacity:1,interactive:false,className:'gps-raw-dot'}).addTo(layer);
  if(!sign&&result.snapped&&result.status==='probable'){
   const snap=[result.snapped.latitude,result.snapped.longitude];
   L.polyline([latlng,snap],{color,weight:1.5,dashArray:'3 5',interactive:false}).addTo(layer);
   // A hollow ring keeps the original reading visible even when both coincide.
   L.circleMarker(snap,{radius:10,color:'#203e35',weight:3,fill:false,interactive:false,className:'gps-snapped-dot'}).addTo(layer);
  }
 }
 function show(next){result=next;render();if(follow&&result.raw){map.setView([result.raw.latitude,result.raw.longitude],firstFix?Math.max(map.getZoom(),17):map.getZoom(),{animate:false});firstFix=false;}}
 function stop(){session++;if(watchId!==null)navigator.geolocation.clearWatch(watchId);watchId=null;clearInterval(timer);clearInterval(ageTimer);timer=ageTimer=null;mode='off';demo=null;index=-1;paused=false;follow=false;firstFix=true;signalError=null;result=matcher.reset();render();}
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
  stop();setSource('osm');demo=createPublicDemo(geo);mode='demo';step();
  const size=map.getSize(),panel=el('gps-panel').getBoundingClientRect(),lateral=size.x>size.y&&size.y<=650;
  map.fitBounds(L.latLngBounds(demo.fixes.map(f=>[f.latitude,f.longitude])),{paddingTopLeft:[25,175],paddingBottomRight:lateral?[panel.width+35,30]:[25,Math.min(panel.height+65,size.y-265)],maxZoom:18,animate:false});playback();
 }
 el('gps-toggle').onclick=()=>mode==='gps'?stop():startGps();el('gps-demo').onclick=()=>mode==='demo'?stop():startDemo();
 el('gps-demo-pause').onclick=()=>{if(mode!=='demo')return;paused=!paused;if(paused){clearInterval(timer);timer=null;}else playback();render();};
 el('gps-demo-next').onclick=()=>{paused=true;clearInterval(timer);timer=null;step();};
 el('gps-center').onclick=()=>{follow=true;firstFix=true;show(result);};
 const dragged=()=>{follow=false;};map.on('dragstart',dragged);window.addEventListener('pagehide',stop);
 render();return {stop,sourceChanged:()=>render(),setMapOpen:open=>{if(!open)stop();},destroy(){stop();map.off('dragstart',dragged);window.removeEventListener('pagehide',stop);layer.remove();}};
}
