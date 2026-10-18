import {validateReviewImages,verifyImageBytes} from './images.mjs';
import {validateDataset,fitView,zoomView,panView} from './geometry.mjs';
const $=id=>document.getElementById(id),svg=$('map'),stage=$('stage');
const NS='http://www.w3.org/2000/svg';
const make=(tag,attrs={})=>{const n=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);return n;};
let data,view=fitView(900,1100),selected=null,selectedGap=null,mode='overlay',imageURL,reviewImages,currentSource,sourceRequest=0,referenceURL;
const visible=new Set(),groups=new Map(),pointers=new Map();
let gesture=null,moved=false,multitouch=false;
function apply(){svg.setAttribute('viewBox',`${view.x} ${view.y} ${view.width} ${view.height}`);$('view-readout').textContent=`${Math.round(900/view.width*100)} % · Píxeles de imagen`;}
function toWorld(x,y){const p=new DOMPoint(x,y).matrixTransform(svg.getScreenCTM().inverse());return {x:p.x,y:p.y};}
function zoom(factor,anchor){
 const width=Math.max(35,Math.min(3600,view.width*factor));view=zoomView(view,width/view.width,anchor);apply();
}
function setMode(next){mode=next;stage.classList.remove('mode-photo','mode-overlay','mode-vectors');stage.classList.add(`mode-${next}`);document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===next)));}
function refreshLayers(){
 for(const [id,g] of groups){g.style.display=visible.has(id)?'':'none';g.classList.toggle('selected',selected===id);g.classList.toggle('dim',selected!==null&&selected!==id);}
 document.querySelectorAll('.layer-row').forEach(row=>row.classList.toggle('active',row.dataset.trail===selected));
 for(const g of $('gaps').children)g.style.display=visible.has(g.dataset.trail)?'':'none';
 $('gaps').style.display=$('show-gaps').checked?'':'none';
}
function select(id){
 selected=id;selectedGap=null;const trail=data.trails.find(t=>t.id===id);
 const segs=data.segments.filter(s=>s.trailId===id),gaps=data.gaps.filter(g=>g.trailId===id);
 $('selection-title').textContent=trail.name;
 $('selection-detail').textContent=`${segs.length} fragmentos visibles · ${gaps.length} zonas pendientes. El nombre y las curvas se contrastan con la foto y el mapa oficial. Extremos y cruces sin conexión transitable confirmada.`;
 $('focus-trail').disabled=false;refreshLayers();
}
function pickGap(id){
 const g=data.gaps.find(g=>g.id===id);selected=g.trailId;selectedGap=g;
 $('selection-title').textContent=`${data.trails.find(t=>t.id===g.trailId).name} · pendiente`;
 $('selection-detail').textContent=g.reason+' No se ha dibujado un tramo para cerrar esta zona.';
 $('focus-trail').disabled=false;refreshLayers();
}
function fitSelection(){
 if(!selected)return;
 let x,y,w,h;
 if(selectedGap)[x,y,w,h]=selectedGap.bounds;
 else{
  const points=data.segments.filter(s=>s.trailId===selected).flatMap(s=>s.points);
  x=Math.min(...points.map(p=>p[0]));y=Math.min(...points.map(p=>p[1]));w=Math.max(...points.map(p=>p[0]))-x;h=Math.max(...points.map(p=>p[1]))-y;
 }
 const pad=selectedGap?15:25;view={x:x-pad,y:y-pad,width:w+pad*2,height:h+pad*2};apply();
}
function draw(){
 for(const t of data.trails){
  visible.add(t.id);const group=make('g',{'class':'trail-group','data-trail':t.id});groups.set(t.id,group);
  for(const s of data.segments.filter(s=>s.trailId===t.id)){
   const points=s.points.map(p=>p.join(',')).join(' ');
   const hit=make('polyline',{points,'class':'route-hit','data-trail':t.id,'data-segment':s.id,'tabindex':'0','role':'button','aria-label':`${t.name}, fragmento visible ${s.id}`});
   const line=make('polyline',{points,stroke:t.color,'class':'route','data-segment':s.id});
   hit.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(t.id);}});
   group.append(hit,line);
   for(const p of [s.points[0],s.points.at(-1)])group.append(make('circle',{cx:p[0],cy:p[1],r:2,fill:t.color,'class':'endpoint'}));
  }
  $('trails').append(group);
  const row=document.createElement('div');row.className='layer-row';row.dataset.trail=t.id;
  const label=document.createElement('label');label.className='visibility';
  const cb=document.createElement('input');cb.type='checkbox';cb.checked=true;cb.setAttribute('aria-label',`Mostrar ${t.name}`);
  cb.addEventListener('change',()=>{cb.checked?visible.add(t.id):visible.delete(t.id);refreshLayers();});label.append(cb);
  const b=document.createElement('button');b.className='layer-select';b.setAttribute('aria-label',`Seleccionar ${t.name}`);
  const swatch=document.createElement('span');swatch.className='swatch';swatch.style.background=t.color;
  const text=document.createElement('span'),name=document.createElement('span'),info=document.createElement('span'),arrow=document.createElement('span');
  name.className='trail-label';name.textContent=t.name;info.className='trail-info';info.textContent=`${data.segments.filter(s=>s.trailId===t.id).length} fragmentos · ${data.gaps.filter(g=>g.trailId===t.id).length} pendientes`;arrow.className='layer-arrow';arrow.textContent='>';text.append(name,info);b.append(swatch,text,arrow);b.addEventListener('click',()=>select(t.id));row.append(label,b);$('layers').append(row);
 }
 for(const [i,g] of data.gaps.entries()){
  const [x,y,w,h]=g.bounds;const group=make('g',{'class':'pending','data-gap':g.id,'data-trail':g.trailId,tabindex:0,role:'button','aria-label':g.reason});
  group.append(make('rect',{x,y,width:w,height:h,rx:3}));const tag=make('text',{x:x+3,y:y+11});tag.textContent=String(i+1);group.append(tag);
  group.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pickGap(g.id);}});$('gaps').append(group);
 }
 $('trails').style.opacity=$('vector-opacity').value/100;
 refreshLayers();
}
function midpoint(){const pts=[...pointers.values()];if(pts.length===1)return {...pts[0],distance:0};const [a,b]=pts;return {x:(a.x+b.x)/2,y:(a.y+b.y)/2,distance:Math.hypot(a.x-b.x,a.y-b.y)};}
svg.addEventListener('pointerdown',e=>{
 if(!data||e.button>0)return;
 pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});svg.setPointerCapture(e.pointerId);
 if(pointers.size===1){moved=false;multitouch=false;gesture={...midpoint(),target:e.target,startX:e.clientX,startY:e.clientY};}
 else {multitouch=true;gesture={...midpoint()};}
 svg.classList.add('dragging');
});
svg.addEventListener('pointermove',e=>{
 if(!pointers.has(e.pointerId)||!gesture)return;
 pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const next=midpoint();
 if(pointers.size>1||Math.hypot(next.x-gesture.startX,next.y-gesture.startY)>5)moved=true;
 if(moved){
  const inverse=svg.getScreenCTM().inverse();
  view=panView(view,-(next.x-gesture.x)*inverse.a,-(next.y-gesture.y)*inverse.d);apply();
  if(next.distance&&gesture.distance)zoom(gesture.distance/next.distance,toWorld(next.x,next.y));
 }
 gesture={...gesture,...next};
});
function release(e,canceled=false){
 if(!pointers.has(e.pointerId))return;
 const target=gesture?.target;pointers.delete(e.pointerId);
 if(!pointers.size){
  if(!canceled&&!moved&&!multitouch){const gap=target?.closest('[data-gap]');const trail=target?.closest('.route-hit');if(gap)pickGap(gap.dataset.gap);else if(trail)select(trail.dataset.trail);}
  gesture=null;svg.classList.remove('dragging');
 } else {gesture={...midpoint()};moved=true;}
}
svg.addEventListener('pointerup',e=>release(e));svg.addEventListener('pointercancel',e=>release(e,true));svg.addEventListener('lostpointercapture',e=>release(e,true));
svg.addEventListener('wheel',e=>{if(!data)return;e.preventDefault();zoom(e.deltaY<0?.85:1/.85,toWorld(e.clientX,e.clientY));},{passive:false});
svg.addEventListener('keydown',e=>{
 if(e.target!==svg||!data)return;
 const shifts={ArrowLeft:[-.08,0],ArrowRight:[.08,0],ArrowUp:[0,-.08],ArrowDown:[0,.08]};
 if(shifts[e.key]){e.preventDefault();const [x,y]=shifts[e.key];view=panView(view,x*view.width,y*view.height);apply();}
 else if(['+','=','-'].includes(e.key)){e.preventDefault();zoom(e.key==='-'?1.25:.8);}
 else if(e.key==='Home'){$('fit').click();}
});
$('zoom-in').onclick=()=>zoom(.75);$('zoom-out').onclick=()=>zoom(1/.75);
$('fit').onclick=()=>{view=fitView(data?.image.width||900,data?.image.height||1100);apply();};
$('focus-trail').onclick=fitSelection;
for(const b of document.querySelectorAll('[data-mode]'))b.onclick=()=>setMode(b.dataset.mode);
$('photo-opacity').oninput=()=>{$('original').style.opacity=$('photo-opacity').value/100;$('photo-value').textContent=$('photo-opacity').value+' %';};
$('vector-opacity').oninput=()=>{$('trails').style.opacity=$('vector-opacity').value/100;$('vector-value').textContent=$('vector-opacity').value+' %';};
$('show-gaps').onchange=refreshLayers;
$('download').onclick=()=>{
 const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='el-durazno-trazados-pixeles.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
async function loadImageSource(id){
 const source=reviewImages.sources.find(s=>s.id===id),request=++sourceRequest;
 const embedded=$('embedded-images');const assets=embedded?JSON.parse(embedded.textContent):null;
 $('image-source').disabled=true;stage.setAttribute('aria-busy','true');$('source-error').hidden=true;
 $('load-status').hidden=false;$('load-status').textContent='Cargando imagen de referencia…';
 let url;
 try{
  const response=await fetch(assets?.[id]||new URL('../'+source.url,import.meta.url));if(!response.ok)throw new Error(`No se cargó la imagen de referencia (HTTP ${response.status}).`);
  const blob=await response.blob();await verifyImageBytes(await blob.arrayBuffer(),source.sha256);
  url=URL.createObjectURL(blob);const image=new Image();image.src=url;await image.decode();
  if(image.naturalWidth!==source.naturalWidth||image.naturalHeight!==source.naturalHeight)throw new Error('La imagen tiene dimensiones distintas a las declaradas.');
  if(request!==sourceRequest){URL.revokeObjectURL(url);return;}
  const old=imageURL;imageURL=url;$('original').setAttribute('href',imageURL);if(old)URL.revokeObjectURL(old);
  currentSource=id;stage.dataset.imageSource=id;$('image-source').value=id;
  $('image-source-info').textContent=`${source.naturalWidth} × ${source.naturalHeight} px · ${source.note}`;
  $('image-tag').textContent=`${source.naturalWidth} × ${source.naturalHeight} px`;
 }catch(error){
  if(url)URL.revokeObjectURL(url);
  if(!currentSource)throw error;
  $('image-source').value=currentSource;$('source-error').textContent='Se conserva la imagen anterior. '+error.message;$('source-error').hidden=false;
 }finally{if(request===sourceRequest){$('load-status').hidden=true;stage.setAttribute('aria-busy','false');$('image-source').disabled=false;}}
}
$('image-source').onchange=()=>loadImageSource($('image-source').value);
$('close-reference-photo').onclick=()=>$('reference-photo-dialog').close();
async function setupReferencePhoto(){
 const embedded=$('embedded-reference-photo');if(!embedded)return;
 const reference=JSON.parse(embedded.textContent);$('show-reference-photo').hidden=false;
 $('show-reference-photo').onclick=async()=>{
  try{
   if(!referenceURL){const response=await fetch(reference.dataUrl),blob=await response.blob();await verifyImageBytes(await blob.arrayBuffer(),reference.sha256);referenceURL=URL.createObjectURL(blob);const image=new Image();image.src=referenceURL;await image.decode();if(image.naturalWidth!==reference.width||image.naturalHeight!==reference.height){URL.revokeObjectURL(referenceURL);referenceURL=null;throw new Error('Dimensiones de la foto recibida incorrectas.');}$('reference-photo-image').src=referenceURL;}
   $('reference-photo-info').textContent=`${reference.width} × ${reference.height} px · Fotografía completa conservada sin cambios. Esta imagen no tiene un ajuste geográfico validado.`;
   $('reference-photo-dialog').showModal();
  }catch(error){$('source-error').textContent='No se pudo mostrar la foto completa. '+error.message;$('source-error').hidden=false;}
 };
}
async function init(){
 try{
  const embedded=$('embedded-data');let candidate;
  if(embedded)candidate=validateDataset(JSON.parse(embedded.textContent));
  else{const r=await fetch(new URL('../data/el-durazno/visual-trails.json',import.meta.url));if(!r.ok)throw new Error(`No se cargaron los trazados (HTTP ${r.status}).`);candidate=validateDataset(await r.json());}
  const embeddedConfig=$('embedded-image-config');let config;
  if(embeddedConfig)config=JSON.parse(embeddedConfig.textContent);
  else{const r=await fetch(new URL('../data/el-durazno/review-images.json',import.meta.url));if(!r.ok)throw new Error('No se cargó el registro de imágenes.');config=await r.json();}
  reviewImages=validateReviewImages(config,candidate.image);
  for(const source of reviewImages.sources){const option=document.createElement('option');option.value=source.id;option.textContent=source.label;$('image-source').append(option);}
  await loadImageSource(reviewImages.defaultId);
  data=candidate;draw();setMode('overlay');apply();await setupReferencePhoto();
  $('load-status').hidden=true;stage.setAttribute('aria-busy','false');$('download').disabled=false;
  $('dataset-status').textContent=`${data.segments.length} fragmentos · ${data.gaps.length} zonas pendientes`;
 }catch(error){stage.classList.add('error');stage.setAttribute('aria-busy','false');$('load-status').hidden=false;$('load-status').textContent='No se pudo abrir la revisión. '+error.message;$('load-status').setAttribute('role','alert');$('dataset-status').textContent='Revisión no disponible';$('image-source').disabled=true;}
}
window.addEventListener('pagehide',()=>{if(imageURL)URL.revokeObjectURL(imageURL);if(referenceURL)URL.revokeObjectURL(referenceURL);});
init();
