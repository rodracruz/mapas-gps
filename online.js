/* Plano geográfico independiente de la fotografía. Datos OSM © colaboradores, licencia ODbL. */
(function(){
const api=window.MapasGPS;if(!api)return;
const $=id=>document.getElementById(id),rad=x=>x*Math.PI/180,deg=x=>x*180/Math.PI;
let lat=-33.310,lon=-70.500,z=15,base='osm',opened=false,lines=[],ptr=null,showPhoto=false,timer=null;
const world=(a,o)=>{const n=256*Math.pow(2,z),v=Math.min(85.051,Math.max(-85.051,a));return {x:(o+180)/360*n,y:(1-Math.asinh(Math.tan(rad(v)))/Math.PI)/2*n}};
const coords=(x,y)=>{const n=256*Math.pow(2,z);return {lat:deg(Math.atan(Math.sinh(Math.PI*(1-2*y/n)))),lon:x/n*360-180}};
const modal=document.createElement('div');modal.id='realDlg';modal.className='modal hidden';modal.innerHTML='<section class="real-card"><div class="real-head"><div><b>Plano digital GPS</b><small>Rutas georreferenciadas sin visitar el lugar</small></div><button id="realClose" class="iconbtn">×</button></div><div class="real-form"><input id="realQuery" value="RKF El Durazno, Lo Barnechea" aria-label="Parque o sector"><button id="realFind" class="btn tiny">Buscar zona</button><button id="realLoad" class="btn tiny accent">Cargar rutas</button></div><div class="real-actions"><button id="realRoad" class="btn tiny accent">Mapa</button><button id="realSat" class="btn tiny">Satélite</button><button id="realPhoto" class="btn tiny">Ver foto</button><button id="realLoc" class="btn tiny">GPS</button><button id="realExport" class="btn tiny" disabled>GeoJSON ↓</button></div><div id="realView" class="real-view"><div id="realTiles" class="real-tiles"></div><svg id="realPaths" class="real-paths"></svg><div id="realDot" class="real-dot hidden"></div><div class="real-zoom"><button id="realPlus">+</button><button id="realMinus">−</button><button id="realCenter">◎</button></div><div id="realImgPanel" class="real-img hidden"><img id="realImg" alt="Foto del cartel"/><small>Foto de referencia, sin ajustar</small></div><div id="realCredit" class="real-credit">© OpenStreetMap contributors</div></div><div class="real-foot"><span id="realMessage">Buscar rutas existentes en OpenStreetMap.</span><small id="realPosition"></small></div><p class="real-caution">Las rutas descargadas son datos abiertos: pueden estar incompletas, desactualizadas o no corresponder a las pistas del cartel. La fotografía aún no queda georreferenciada. Las imágenes satelitales solo se visualizan online y no se descargan ni se interpretan automáticamente.</p></section>';
document.body.append(modal);
const btn=document.createElement('button');btn.id='openReal';btn.className='plainbtn';btn.textContent='🌐 Plano GPS';document.getElementById('viewerBottom').prepend(btn);
const cb=document.createElement('button');cb.id='openRealCal';cb.className='btn accent wide';cb.textContent='🌐 Buscar senderos desde internet';document.querySelector('#calPanel .cal-heading').after(cb);
const status=t=>$('realMessage').textContent=t;
function render(){
 if(!opened)return;
 const r=$('realView').getBoundingClientRect();if(!r.width||!r.height)return;
 const c=world(lat,lon),left=c.x-r.width/2,top=c.y-r.height/2,nt=Math.pow(2,z),tiles=$('realTiles');
 const present=new Map(Array.from(tiles.children).map(e=>[e.dataset.k,e])),valid=new Set();
 for(let x=Math.floor(left/256);x<=Math.floor((left+r.width)/256);x++)for(let y=Math.floor(top/256);y<=Math.floor((top+r.height)/256);y++){
 if(y<0||y>=nt)continue;const xx=((x%nt)+nt)%nt,k=base+':'+z+':'+xx+':'+y;valid.add(k);
 let img=present.get(k);if(!img){img=document.createElement('img');img.dataset.k=k;img.alt='';img.src=base==='osm'?'https://tile.openstreetmap.org/'+z+'/'+xx+'/'+y+'.png':'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/'+z+'/'+y+'/'+xx;tiles.append(img)}
 img.style.left=(x*256-left)+'px';img.style.top=(y*256-top)+'px';}
 for(const el of Array.from(tiles.children))if(!valid.has(el.dataset.k))el.remove();
 const svg=$('realPaths');svg.setAttribute('viewBox','0 0 '+r.width+' '+r.height);
 svg.setAttribute('width',r.width);svg.setAttribute('height',r.height);svg.replaceChildren();
 for(const l of lines){const str=l.coords.map(a=>{const p=world(a[1],a[0]);return (p.x-left).toFixed(1)+','+(p.y-top).toFixed(1)}).join(' ');
 const outline=document.createElementNS('http://www.w3.org/2000/svg','polyline'),line=document.createElementNS('http://www.w3.org/2000/svg','polyline');
 for(const el of [outline,line]){el.setAttribute('points',str);el.setAttribute('fill','none');el.setAttribute('stroke-linejoin','round');el.setAttribute('stroke-linecap','round');}
 outline.setAttribute('stroke','#162321');outline.setAttribute('stroke-width','5');line.setAttribute('stroke',l.tags?.bicycle==='designated'||l.tags?.mtb_scale?'#ffad41':'#31f5ce');line.setAttribute('stroke-width','2.5');svg.append(outline,line);}
 const dot=$('realDot'),fix=api.state.gpsFix;
 if(fix){const p=world(fix.lat,fix.lon),x=p.x-left,y=p.y-top;dot.classList.toggle('hidden',x<0||y<0||x>r.width||y>r.height);dot.style.left=x+'px';dot.style.top=y+'px';const metersPerPx=156543.03392*Math.cos(rad(fix.lat))/Math.pow(2,z);dot.style.setProperty('--circle',Math.min(250,Math.max(12,fix.accuracy/metersPerPx))+'px')}
 else dot.classList.add('hidden');
 $('realCredit').innerHTML=base==='osm'?'© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>':'Imágenes © Esri, Vantor y proveedores · datos © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>';
 $('realPosition').textContent=lat.toFixed(5)+', '+lon.toFixed(5)+' · z'+z+' · '+lines.length+' rutas';
}
function move(dx,dy){const c=world(lat,lon),g=coords(c.x-dx,c.y-dy);lat=g.lat;lon=((g.lon+540)%360)-180;render();}
function zoom(k){z=Math.max(3,Math.min(19,z+k));render();}
function open(){if(!api.state.current)return;opened=true;const m=api.state.current;const c=m.webCenter;
 if(c){lat=c.lat;lon=c.lon;}else if(m.points?.length){lat=m.points.reduce((s,p)=>s+p.lat,0)/m.points.length;lon=m.points.reduce((s,p)=>s+p.lon,0)/m.points.length;}else if(m.id==='rkf-el-durazno'){lat=-33.310;lon=-70.500;}
 $('realQuery').value=m.name==='RKF El Durazno'?'RKF El Durazno, Lo Barnechea':m.name;lines=m.trails||[];
 $('realImg').src=api.state.imageURL||'';$('realExport').disabled=!lines.length;modal.classList.remove('hidden');status(lines.length?lines.length+' tramos guardados localmente; vuelve a buscar para actualizar.':'Pulsa «Cargar rutas»; la zona inicial es aproximada.');setTimeout(render,50);timer=setInterval(render,2300);}
function close(){opened=false;modal.classList.add('hidden');clearInterval(timer);}
async function find(){const q=$('realQuery').value.trim();if(q.length<3)return status('Escribe un nombre de parque o localidad.');
 if(!navigator.onLine)return status('Se necesita conexión para buscar lugares.');$('realFind').disabled=true;status('Buscando ubicación…');
 try{const r=await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=5&q='+encodeURIComponent(q));if(!r.ok)throw Error('Servicio no disponible');const data=await r.json();if(!data.length)return status('No encontré el lugar. Busca comuna o mueve el mapa.');
 lat=+data[0].lat;lon=+data[0].lon;z=15;status('Zona aproximada: '+data[0].display_name+'. Verifica antes de cargar rutas.');render();}catch(e){status('No se pudo buscar: '+e.message)}finally{$('realFind').disabled=false;}}
async function load(){if(!navigator.onLine)return status('Sin internet. Puedes usar rutas guardadas si existen.');
 $('realLoad').disabled=true;status('Consultando senderos GPS de OpenStreetMap…');
 try{const query='[out:json][timeout:25];way["highway"~"^(path|track|footway|cycleway)$"](around:2500,'+lat.toFixed(6)+','+lon.toFixed(6)+');out geom;';
 const r=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:'data='+encodeURIComponent(query)});
 if(!r.ok)throw Error('Servidor de senderos: '+r.status);const json=await r.json();
 const found=(json.elements||[]).filter(e=>e.type==='way'&&e.geometry?.length>1).map(e=>({id:e.id,name:e.tags?.name||'',tags:e.tags||{},coords:e.geometry.map(p=>[p.lon,p.lat])}));
 if(!found.length)return status('No hay trazados digitalizados en el sector buscado.');
 lines=found;const m=api.state.current;if(m){m.trails=lines;m.webCenter={lat,lon};await api.saveCurrent();}
 $('realExport').disabled=false;status(found.length+' tramos georreferenciados guardados. Contrasta con tu foto; no presupongas coincidencia automática.');render();
 }catch(e){status('No se pudieron cargar: '+e.message)}finally{$('realLoad').disabled=false;}}
function exportGeo(){if(!lines.length)return;const data={type:'FeatureCollection',attribution:'© OpenStreetMap contributors, ODbL',features:lines.map(l=>({type:'Feature',properties:{osm_id:l.id,name:l.name,...l.tags},geometry:{type:'LineString',coordinates:l.coords}}))};
 const url=URL.createObjectURL(new Blob([JSON.stringify(data)],{type:'application/geo+json'}));const a=document.createElement('a');a.href=url;a.download='senderos-osm.geojson';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
btn.onclick=open;cb.onclick=open;$('realClose').onclick=close;$('realFind').onclick=find;$('realLoad').onclick=load;
$('realRoad').onclick=()=>{base='osm';$('realRoad').classList.add('accent');$('realSat').classList.remove('accent');render()};
$('realSat').onclick=()=>{base='sat';$('realSat').classList.add('accent');$('realRoad').classList.remove('accent');render()};
$('realPhoto').onclick=()=>{showPhoto=!showPhoto;$('realImgPanel').classList.toggle('hidden',!showPhoto);$('realPhoto').classList.toggle('accent',showPhoto)};
$('realLoc').onclick=()=>{if(api.state.locationEnabled)api.stopGPS();else api.startGPS();$('realLoc').classList.toggle('accent',api.state.locationEnabled);render();};
$('realCenter').onclick=()=>{if(!api.state.gpsFix)return status('Primero activa GPS y espera posición.');lat=api.state.gpsFix.lat;lon=api.state.gpsFix.lon;z=Math.max(16,z);render();};
$('realPlus').onclick=()=>zoom(1);$('realMinus').onclick=()=>zoom(-1);$('realExport').onclick=exportGeo;
const v=$('realView');v.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('button,a,.real-img'))return;v.setPointerCapture(e.pointerId);ptr={x:e.clientX,y:e.clientY};});
v.addEventListener('pointermove',e=>{if(ptr){move(e.clientX-ptr.x,e.clientY-ptr.y);ptr={x:e.clientX,y:e.clientY};}});
v.addEventListener('pointerup',()=>ptr=null);v.addEventListener('pointercancel',()=>ptr=null);
v.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY<0?1:-1);},{passive:false});
window.addEventListener('resize',()=>{if(opened)render()});
})();