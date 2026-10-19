import {validateContinuous,signShape} from './cartel.mjs';
import {fitView,zoomView,panView} from '../review/geometry.mjs';
import {sha256} from '../review/sha256.mjs';
export function setupSignReview(){
 const el=id=>document.getElementById(id),ns='http://www.w3.org/2000/svg';
 let dataset,loading,rasterReady=false,rasterLoading,statusText='',view={x:0,y:0,width:2570,height:3077},mode='overlay',selected=null;
 const pointers=new Map();let gesture=null;
 const redraw=()=>el('sign-svg').setAttribute('viewBox',[view.x,view.y,view.width,view.height].join(' '));
 function fitTrail(id){const points=dataset.segments.filter(s=>s.trailId===id).flatMap(s=>s.points),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);if(!points.length)return;const x=Math.min(...xs),y=Math.min(...ys),w=Math.max(100,Math.max(...xs)-x),h=Math.max(100,Math.max(...ys)-y);view={x:x-w*.12,y:y-h*.12,width:w*1.24,height:h*1.24};redraw();}
 function selectTrail(id,fit=false){
  const t=dataset.trails.find(t=>t.id===id);if(!t)return;selected=id;
  const gaps=dataset.coveredSpans.filter(g=>g.trailId===id);el('sign-selection').textContent=t.name+' · '+(gaps.length?gaps.length+' zonas recuperadas del PDF':'Fragmentos visibles documentados');
  for(const p of el('sign-paths').querySelectorAll('.sign-route')){p.style.opacity=p.dataset.trail===id?'1':'.38';p.setAttribute('stroke-width',p.dataset.trail===id?'3':'1.6');}
  for(const b of el('sign-trails-panel').querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.signSelect===id));
  const checkbox=el('sign-trails-panel').querySelector(`[data-sign-visible="${id}"]`);if(checkbox&&!checkbox.checked){checkbox.checked=true;toggle(id,true);}if(fit)fitTrail(id);
 }
 function toggle(id,visible){for(const p of el('sign-dialog').querySelectorAll('[data-trail]'))if(p.dataset.trail===id)p.toggleAttribute('hidden',!visible);}
 function setMode(value){mode=value;value=rasterReady?value:'vectors';el('sign-raster').toggleAttribute('hidden',value==='vectors');el('sign-paths').toggleAttribute('hidden',value==='photo');el('sign-gaps').toggleAttribute('hidden',value==='photo');el('sign-labels').toggleAttribute('hidden',value==='photo');el('sign-markers').toggleAttribute('hidden',value==='photo');el('sign-raster').style.opacity=value==='photo'?'1':String(Number(el('sign-opacity').value)/100);for(const b of document.querySelectorAll('[data-sign-mode]')){b.setAttribute('aria-pressed',String(b.dataset.signMode===value));b.disabled=!rasterReady&&b.dataset.signMode!=='vectors';}}
 function shape(tag,attributes){const node=document.createElementNS(ns,tag);for(const [name,value] of Object.entries(attributes))node.setAttribute(name,String(value));return node;}
 async function load(){
  if(loading)return loading;
  loading=(async()=>{
   const embedded=el('embedded-all-visual');let value;
   if(embedded)value=JSON.parse(embedded.textContent);else{const response=await fetch('./data/el-durazno/continuous-sign-trails.json');if(!response.ok)throw new Error('No se pudo cargar el plano de senderos.');value=await response.json();}
   dataset=validateContinuous(value);if(!/^sources\/[a-zA-Z0-9._-]+\.jpg$/.test(dataset.image.url))throw new Error('Fuente de imagen no válida.');
   el('sign-svg').setAttribute('viewBox',`0 0 ${dataset.image.width} ${dataset.image.height}`);view=fitView(dataset.image.width,dataset.image.height);
   el('sign-raster').setAttribute('width',dataset.image.width);el('sign-raster').setAttribute('height',dataset.image.height);
   const legendTrails=dataset.trails.filter(t=>t.category!=='auxiliary');
   for(const t of dataset.trails){const row=document.createElement('div');row.className='sign-trail-row';const input=document.createElement('input');input.type='checkbox';input.checked=true;input.dataset.signVisible=t.id;input.setAttribute('aria-label','Mostrar '+t.name);input.onchange=()=>toggle(t.id,input.checked);const button=document.createElement('button');button.textContent=t.name;button.dataset.signSelect=t.id;button.style.borderLeftColor=t.color;button.onclick=()=>selectTrail(t.id,true);row.append(input,button);el(t.category==='auxiliary'?'sign-aux-trails':'sign-trails').append(row);}
   for(const p of dataset.routePaths){const t=dataset.trails.find(t=>t.id===p.trailId),line=signShape(p),hit=signShape(p);line.classList.add('sign-route');line.dataset.trail=t.id;line.style.pointerEvents='none';hit.setAttribute('stroke','transparent');hit.setAttribute('fill','transparent');hit.setAttribute('stroke-width','16');hit.setAttribute('vector-effect','non-scaling-stroke');hit.setAttribute('pointer-events','all');hit.dataset.trail=t.id;hit.classList.add('sign-hit');el('sign-paths').append(line,hit);}
   for(const [items,id]of [[dataset.labels,'sign-labels'],[dataset.markers,'sign-markers']])for(const item of items){const group=shape('g',{'data-trail':item.trailId});for(const p of item.paths)group.append(signShape(p));group.style.pointerEvents='none';el(id).append(group);}
   statusText=legendTrails.length+' senderos · curvas completas del PDF, con nombres y puntos encima. Las partes tapadas en la foto se recuperan de la fuente; no hay ajuste GPS validado.';
   el('sign-status').textContent=statusText;el('sign-dialog').dataset.ready='true';setMode(mode);redraw();
  })().catch(error=>{loading=null;el('sign-status').textContent=error.message;throw error;});return loading;
 }
 async function ensureRaster(){
  if(rasterReady)return;if(rasterLoading)return rasterLoading;
  el('sign-retry-source').disabled=true;
  rasterLoading=(async()=>{try{const response=await fetch('./'+dataset.image.url);if(!response.ok)throw new Error();const bytes=new Uint8Array(await response.arrayBuffer());if(sha256(bytes)!==dataset.image.sha256)throw new Error();const url=URL.createObjectURL(new Blob([bytes],{type:'image/jpeg'}));el('sign-raster').setAttribute('href',url);rasterReady=true;el('sign-retry-source').hidden=true;el('sign-status').textContent=statusText;}catch{el('sign-status').textContent=statusText+' No se cargó el fondo; las líneas siguen disponibles.';el('sign-retry-source').hidden=false;}finally{el('sign-retry-source').disabled=false;setMode(mode);}})();
  try{await rasterLoading;}finally{rasterLoading=null;}
 }
 async function open(id,displayMode='overlay'){setMode(displayMode);el('sign-dialog').showModal();document.body.classList.add('sign-open');try{await load();if(id)selectTrail(id,true);else{view=displayMode==='photo'?{x:580,y:0,width:1990,height:2500}:fitView(dataset.image.width,dataset.image.height);redraw();}await ensureRaster();}catch{}}
 function close(){el('sign-dialog').close();document.body.classList.remove('sign-open');el('open-sign').focus({preventScroll:true});}
 el('sign-retry-source').onclick=()=>ensureRaster();el('open-sign').onclick=()=>open();el('close-sign').onclick=close;el('sign-dialog').addEventListener('cancel',event=>{event.preventDefault();close();});
 el('sign-fit').onclick=()=>{if(dataset){view=fitView(dataset.image.width,dataset.image.height);redraw();}};
 el('sign-zoom-in').onclick=()=>{view=zoomView(view,.7);redraw();};el('sign-zoom-out').onclick=()=>{view=zoomView(view,1/.7);redraw();};
 el('sign-opacity').oninput=()=>setMode(mode);for(const b of document.querySelectorAll('[data-sign-mode]'))b.onclick=()=>setMode(b.dataset.signMode);
 el('sign-download').onclick=()=>{if(!dataset)return;const url=URL.createObjectURL(new Blob([JSON.stringify(dataset,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='el-durazno-todos-senderos-pixeles.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 const stage=el('sign-stage');
 stage.addEventListener('pointerdown',event=>{if(event.button!==undefined&&event.button!==0)return;stage.setPointerCapture(event.pointerId);pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});if(pointers.size===1)gesture={x:event.clientX,y:event.clientY,view:{...view},moved:false};else{const [a,b]=[...pointers.values()];gesture={pinch:true,distance:Math.hypot(a.x-b.x,a.y-b.y),view:{...view},moved:true};}});
 stage.addEventListener('pointermove',event=>{if(!pointers.has(event.pointerId)||!gesture)return;const old=pointers.get(event.pointerId);pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});if(pointers.size===2&&gesture.pinch){const [a,b]=[...pointers.values()];view=zoomView(gesture.view,gesture.distance/Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)));}else if(pointers.size===1&&!gesture.pinch){const matrix=el('sign-svg').getScreenCTM(),scale=matrix?.a||1;const dx=event.clientX-old.x,dy=event.clientY-old.y;if(Math.abs(event.clientX-gesture.x)+Math.abs(event.clientY-gesture.y)>4)gesture.moved=true;if(gesture.moved)view=panView(view,-dx/scale,-dy/scale);}redraw();});
 function nearestTrail(event){
  if(!dataset||mode==='photo')return null;const matrix=el('sign-svg').getScreenCTM();if(!matrix)return null;const q=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse()),scale=Math.hypot(matrix.a,matrix.b);let best=64/(scale*scale),id=null;
  const hidden=new Set([...el('sign-trails-panel').querySelectorAll('input:not(:checked)')].map(n=>n.dataset.signVisible));
  for(const s of dataset.segments){if(hidden.has(s.trailId))continue;for(const [x,y]of s.points){const d=(x-q.x)**2+(y-q.y)**2;if(d<best){best=d;id=s.trailId;}}}return id;
 }
 const release=event=>{if(event.type==='pointerup'&&pointers.size===1&&gesture&&!gesture.moved){const id=nearestTrail(event);if(id)selectTrail(id);}pointers.delete(event.pointerId);if(!pointers.size)setTimeout(()=>{gesture=null;},0);};stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);
 stage.addEventListener('wheel',event=>{event.preventDefault();view=zoomView(view,event.deltaY<0?.85:1/.85);redraw();},{passive:false});
 let photoUrl=null;const embeddedPhoto=el('embedded-park-photo');
 if(embeddedPhoto){try{const photo=JSON.parse(embeddedPhoto.textContent),bytes=Uint8Array.from(atob(photo.dataUrl.split(',')[1]),c=>c.charCodeAt(0));if(sha256(bytes)!==photo.sha256)throw new Error();photoUrl=photo.dataUrl;el('park-original-photo').dataset.sha256=photo.sha256;el('open-original-photo').hidden=false;}catch{el('open-original-photo').hidden=true;}}
 el('open-park-photo').onclick=()=>open(null,'photo');el('open-original-photo').onclick=()=>{if(!photoUrl)return;el('park-original-photo').src=photoUrl;el('park-photo-dialog').showModal();};el('close-park-photo').onclick=()=>el('park-photo-dialog').close();
 return {open};
}
