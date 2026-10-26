// Presentation only: park/GPS/data behavior remains in the existing controllers.
export function setupBikerideChrome({directory,park,onSwitchPark}){
 document.body.classList.add('bikeride-ui');
 const header=document.querySelector('.app-header');
 const network=document.createElement('span');network.id='bikeride-network-status';network.className='bikeride-network';network.setAttribute('role','status');network.setAttribute('aria-live','polite');
 function updateNetwork(){const online=navigator.onLine;network.textContent=online?'En línea':'Sin conexión';network.dataset.online=String(online);network.setAttribute('aria-label','Estado de red del dispositivo: '+network.textContent.toLowerCase());}
 header?.append(network);updateNetwork();window.addEventListener('online',updateNetwork);window.addEventListener('offline',updateNetwork);
 const switcher=document.createElement('nav');switcher.id='bikeride-park-switch';switcher.className='bikeride-park-switch';switcher.setAttribute('aria-label','Cambiar de parque');
 for(const entry of directory.parks){
  const button=document.createElement('button');button.type='button';button.dataset.bikeridePark=entry.id;button.setAttribute('aria-current',entry.id===park.id?'true':'false');
  const name=document.createElement('strong');name.textContent=entry.shortName;button.append(name);
  const note=document.createElement('span');note.textContent=entry.id===park.id?document.querySelectorAll('.trail-card').length+' recorridos':'Cambiar de parque';button.append(note);
  button.onclick=()=>{if(entry.id!==park.id)onSwitchPark(entry);};switcher.append(button);
 }
 const parkView=document.getElementById('park-view');
 (parkView||document.getElementById('app'))?.prepend(switcher);
 const nav=document.createElement('nav');nav.id='bikeride-navigation';nav.className='bikeride-navigation';nav.setAttribute('aria-label','Navegación de bikeride');
 const icons={map:'<circle cx="12" cy="12" r="9"/><path d="m15 9-2 4-4 2 2-4z"/>',routes:'<path d="m2 19 6-10 4 6 3-9 7 13z"/>',meetups:'<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2"/><path d="M2 21v-4a6 6 0 0 1 12 0v4m2-7a4 4 0 0 1 6 3v4"/>',profile:'<circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>'};
 for(const [id,label,available] of [['map','Mapa GPS',true],['routes','Rutas',true],['meetups','Encuentros',false],['profile','Perfil',false]]){
  const button=document.createElement('button');button.type='button';button.id='bikeride-'+id;button.disabled=!available;
  const icon=document.createElement('span');icon.className='bikeride-nav-icon';icon.setAttribute('aria-hidden','true');icon.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+icons[id]+'</svg>';
  const text=document.createElement('span');text.textContent=label;button.append(icon,text);
  if(!available){const pending=document.createElement('small');pending.textContent='Próximamente';button.append(pending);}
  if(id==='map')button.onclick=()=>document.getElementById('open-map')?.click();
  if(id==='routes'){button.setAttribute('aria-current','page');button.onclick=()=>document.getElementById('route-filter-anchor')?.scrollIntoView({block:'start'});}
  nav.append(button);
 }
 document.body.append(nav);
 function setParkOpen(open){nav.hidden=!open;switcher.hidden=!open;}
 setParkOpen(!parkView?.hidden);
 // Keep listeners when this document is restored from the browser's back cache.
 return {setParkOpen};
}
