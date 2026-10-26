// Presentation only: park/GPS/data behavior remains in the existing controllers.
export function setupBikerideChrome({directory,park,catalog,onSwitchPark}){
 document.body.classList.add('bikeride-ui');
 const icons={map:'<circle cx="12" cy="12" r="9"/><path d="m15 9-2 4-4 2 2-4z"/>',routes:'<path d="m2 19 6-10 4 6 3-9 7 13z"/>',meetups:'<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2"/><path d="M2 21v-4a6 6 0 0 1 12 0v4m2-7a4 4 0 0 1 6 3v4"/>',profile:'<circle cx="5" cy="17" r="4"/><circle cx="19" cy="17" r="4"/><path d="m5 17 5-9 5 9h4l-5-12h-3m-5 3h5m1-5h3"/>',layers:'<path d="m12 3 9 6-9 6-9-6zM3 13l9 6 9-6M3 17l9 6 9-6"/>',satellite:'<path d="m9 3 4 4-6 6-4-4zm8 8 4 4-6 6-4-4zM11 9l4 6m-7 1a5 5 0 0 1-5-5m6 9a9 9 0 0 1-9-9"/>'};
 icons.eye='<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>';
 const icon=name=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[name]+'</svg>';
 const header=document.querySelector('.app-header');
 const brand=header?.querySelector('.brand');if(brand){brand.querySelector('.brand-icon').innerHTML=icon('profile');brand.querySelector('small').textContent='Rutas';}
 const library=header?.querySelector('.library-link');if(library){library.innerHTML=icon('profile');library.setAttribute('aria-label','Mis mapas guardados');library.title='Mis mapas guardados';}
 const network=document.createElement('span');network.id='bikeride-network-status';network.className='bikeride-network';network.setAttribute('role','status');network.setAttribute('aria-live','polite');
 function updateNetwork(){const online=navigator.onLine;network.textContent=online?'En línea':'Sin conexión';network.dataset.online=String(online);network.setAttribute('aria-label','Estado de red del dispositivo: '+network.textContent.toLowerCase());}
 header?.insertBefore(network,library||null);updateNetwork();window.addEventListener('online',updateNetwork);window.addEventListener('offline',updateNetwork);
 const parkView=document.getElementById('park-view');
 const summary=document.createElement('section');summary.id='bikeride-summary';summary.className='bikeride-summary';summary.setAttribute('aria-label','Mapas y ubicación');
 summary.innerHTML='<div class="bikeride-summary-top"><div class="bikeride-summary-title">'+icon('satellite')+'<h2>bikeride ·<br>Mapas de<br>senderos</h2></div><span class="bikeride-summary-status"><i></i>GPS a petición</span></div><p>Explora los senderos de cada parque con sus planos originales, cartografía de OpenStreetMap y ubicación GPS cuando tú la actives.</p>';
 const switcher=document.createElement('nav');switcher.id='bikeride-park-switch';switcher.className='bikeride-park-switch';switcher.setAttribute('aria-label','Cambiar de parque');
 for(const entry of directory.parks){
  const button=document.createElement('button');button.type='button';button.dataset.bikeridePark=entry.id;button.setAttribute('aria-current',entry.id===park.id?'true':'false');
  const top=document.createElement('span');top.className='bikeride-park-title';const name=document.createElement('strong');name.textContent=entry.id==='el-durazno'?'RKF El Durazno':entry.shortName;top.append(name);
  const count=document.createElement('span');count.className='bikeride-park-count';count.textContent=(entry.id===park.id?catalog?.targets.length:entry.routeCount)||'—';count.append(document.createTextNode(entry.id==='el-durazno'?' fichas':' rutas'));top.append(count);button.append(top);
  const note=document.createElement('span');note.className='bikeride-park-note';note.textContent=entry.routeSummary||(entry.id===park.id?park.locality:entry.locality);button.append(note);
  button.onclick=()=>{if(entry.id!==park.id)onSwitchPark(entry);};switcher.append(button);
 }
 parkView?.prepend(summary,switcher);
 // Reuse the one live map, before filters/cards, as in the supplied design.
 const mapCard=document.getElementById('map-card'),filterAnchor=document.getElementById('route-filter-anchor');
 if(mapCard&&filterAnchor)parkView.insertBefore(mapCard,filterAnchor);
 // Leaflet adds its control after this chrome is mounted. Reserve its actual
 // wrapped height so source changes and mobile widths cannot cover the caption.
 const observeAttribution=()=>{
  const attribution=mapCard.querySelector('.leaflet-control-attribution');if(!attribution)return false;
  const size=()=>mapCard.style.setProperty('--bikeride-attribution-height',Math.ceil(attribution.getBoundingClientRect().height)+'px');
  const observer=new ResizeObserver(size);observer.observe(attribution);size();return true;
 };
 if(!observeAttribution()){const pending=new MutationObserver(()=>{if(observeAttribution())pending.disconnect();});pending.observe(document.getElementById('geo-map'),{childList:true,subtree:true});}
 const back=document.getElementById('back-to-parks');if(back)header?.append(back);
 const sources=document.querySelector('.park-sources');for(const node of [document.querySelector('.park-heading'),document.getElementById('amenities'),document.getElementById('data-status')])if(node&&sources)sources.append(node);
 const photo=document.querySelector('.park-photo-card');if(photo&&filterAnchor)filterAnchor.after(photo);
 const heading=document.querySelector('.section-heading');if(heading&&photo)photo.after(heading);
 const cover=document.getElementById('open-map');if(cover){
  cover.innerHTML='<span class="bikeride-map-badges"><span>'+icon('layers')+'<span class="bikeride-map-source"></span></span><span>WGS84 · EPSG:4326</span></span><span class="map-caption"><span><strong></strong><small></small></span><span class="map-open-label">'+icon('eye')+'Ver capas</span></span>';
  cover.querySelector('strong').textContent=park.shortName==='El Durazno'?'RKF El Durazno':park.shortName;
  cover.querySelector('small').textContent=park.id==='el-durazno'?'Plano original del parque · Ubicación aproximada, sin ajuste GPS':'Senderos y avenidas del parque · Coordenadas de OpenStreetMap';
  cover.querySelector('.bikeride-map-source').textContent=park.id==='el-durazno'?'Plano original · Ubicación aproximada':'Trazados OpenStreetMap';
  cover.addEventListener('click',event=>{if(event.target.closest('.map-open-label'))document.getElementById('map-options').open=true;});
 }
 const nav=document.createElement('nav');nav.id='bikeride-navigation';nav.className='bikeride-navigation';nav.setAttribute('aria-label','Navegación de bikeride');
 for(const [id,label,available] of [['map','Mapa GPS',true],['routes','Rutas',true],['meetups','Encuentros',false],['profile','Perfil',false]]){
  const button=document.createElement('button');button.type='button';button.id='bikeride-'+id;button.disabled=!available;
  const graphic=document.createElement('span');graphic.className='bikeride-nav-icon';graphic.setAttribute('aria-hidden','true');graphic.innerHTML=icon(id);
  const text=document.createElement('span');text.textContent=label;button.append(graphic,text);
  if(!available){const pending=document.createElement('small');pending.textContent='Próximamente';button.append(pending);}
  if(id==='map')button.onclick=()=>document.getElementById('open-map')?.click();
  if(id==='routes'){button.setAttribute('aria-current','page');button.onclick=()=>document.getElementById('route-filter-anchor')?.scrollIntoView({block:'start'});}
  nav.append(button);
 }
 document.body.append(nav);
 function refresh(){
  if(cover&&park.id==='el-durazno'){
   const osm=mapCard.dataset.source==='osm';cover.querySelector('.bikeride-map-source').textContent=osm?'Trazados OpenStreetMap':'Plano original · Ubicación aproximada';cover.querySelector('small').textContent=osm?'Senderos del parque · Coordenadas de OpenStreetMap':'Plano original del parque · Ubicación aproximada, sin ajuste GPS';
  }
  for(const card of document.querySelectorAll('.trail-card')){
   const face=card.querySelector('summary'),id=face.dataset.trailSummary,target=catalog?.targets.find(t=>t.id===id),details=card.querySelector('[data-stats]');
   let preview=face.querySelector('.bikeride-card-preview');
   if(!preview){
    preview=document.createElement('span');preview.className='tile-face bikeride-card-preview';face.classList.remove('tile-face');preview.append(...face.childNodes);face.append(preview);
    const body=document.createElement('div');body.className='bikeride-card-body';const description=document.createElement('p');description.className='bikeride-card-description';description.textContent=target?.description||'Consulta los datos y la fuente de este recorrido.';body.append(description);
    const fragment=document.createElement('small');fragment.className='bikeride-fragment-note';fragment.textContent=target?.visualTrailId||park.id==='parquemet'?'Fragmento del plano oficial · Amplía en la ficha':'Plano general · Trazado individual pendiente';body.append(fragment);
    const actions=document.createElement('span');actions.className='bikeride-card-actions';const technical=document.createElement('button');technical.type='button';technical.textContent='Ver ficha técnica';technical.setAttribute('aria-expanded',String(card.open));technical.onclick=event=>{event.preventDefault();event.stopPropagation();card.open=!card.open;};card.addEventListener('toggle',()=>technical.setAttribute('aria-expanded',String(card.open)));
    const openMap=document.createElement('button');openMap.type='button';openMap.textContent='Ver en mapa';openMap.onclick=event=>{event.preventDefault();event.stopPropagation();card.querySelector('[data-show-on-map]')?.click();};actions.append(technical,openMap);body.append(actions);face.append(body);
    const originalDescription=[...card.querySelectorAll('.trail-details>p')].find(n=>n.textContent===target?.description);if(originalDescription)originalDescription.hidden=true;
   }
   face.dataset.difficulty=target?.difficulty?.label||'unknown';
   let stats=face.querySelector('.bikeride-card-stats');if(!stats){stats=document.createElement('dl');stats.className='bikeride-card-stats';for(const name of ['Longitud','Desnivel','Vel. máxima']){const item=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=name;item.append(dt,dd);stats.append(item);}preview.append(stats);}
   const values=new Map([...details.querySelectorAll('div')].map(n=>[n.querySelector('dt').textContent,n.querySelector('dd').textContent]));
   const dd=stats.querySelectorAll('dd');dd[0].textContent=values.get('Longitud')||values.get('Longitud OSM importada')||'Sin datos';dd[1].textContent=values.get('Ascenso')==='Sin datos'&&values.get('Descenso')==='Sin datos'?'Sin datos':(values.get('Ascenso')||'Sin datos');dd[2].textContent=values.get('Vel. máxima')||'Sin registros';
   const source=face.querySelector('.trail-number');source.textContent=target?.status==='osm-identified'?'Fuente OSM':'Plano oficial';
   // A missing individually identified crop stays explicit; never draw a route
   // over an unregistered park image to make the card look complete.
   if(!target?.visualTrailId&&park.id==='el-durazno'){source.textContent='Plano general';if(!face.querySelector('.bikeride-general-plan')){const image=document.createElement('img');image.className='bikeride-general-plan';image.src=document.getElementById('park-photo').src;image.alt='';image.setAttribute('aria-hidden','true');preview.prepend(image);}}
  }
 }
 function setParkOpen(open){nav.hidden=!open;switcher.hidden=!open;summary.hidden=!open;if(back)back.hidden=!open;document.body.classList.toggle('bikeride-park-open',open);}
 setParkOpen(!parkView?.hidden);
 refresh();
 // Keep listeners when this document is restored from the browser's back cache.
 return {setParkOpen,refresh};
}
