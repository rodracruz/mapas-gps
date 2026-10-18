import {sha256} from './sha256.mjs';
import {validateDataset,fitView,zoomView,panView} from './geometry.mjs';
const $=id=>document.getElementById(id),svg=$('map'),stage=$('stage');
const NS='http://www.w3.org/2000/svg';
const make=(tag,attrs={})=>{const n=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);return n;};
let data,view=fitView(900,1100),selected=null,selectedGap=null,mode='overlay',imageURL;
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
async function init(){
 try{
  const embedded=$('embedded-data');
  let candidate;
  if(embedded)candidate=validateDataset(JSON.parse(embedded.textContent));
  else{const r=await fetch(new URL('../data/el-durazno/visual-trails.json',import.meta.url));if(!r.ok)throw new Error(`No se cargaron los trazados (HTTP ${r.status}).`);candidate=validateDataset(await r.json());}
  const source=await fetch(embedded?$('embedded-image').textContent.trim():new URL('../'+candidate.image.url,import.meta.url));if(!source.ok)throw new Error(`No se cargó la fotografía (HTTP ${source.status}).`);
  const blob=await source.blob();
  const bytes=await blob.arrayBuffer();let hash;
  if(globalThis.crypto?.subtle){const digest=await crypto.subtle.digest('SHA-256',bytes);hash=[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');}
  else hash=sha256(new Uint8Array(bytes));
  if(hash!==candidate.image.sha256)throw new Error('La fotografía cambió: no coincide con la fuente de los trazados.');
  imageURL=URL.createObjectURL(blob);const img=new Image();img.src=imageURL;await img.decode();
  if(img.naturalWidth!==candidate.image.width||img.naturalHeight!==candidate.image.height)throw new Error('La fotografía tiene dimensiones distintas a las del trazado.');
  data=candidate;$('original').setAttribute('href',imageURL);draw();setMode('overlay');apply();
  $('load-status').hidden=true;stage.setAttribute('aria-busy','false');$('download').disabled=false;
  $('dataset-status').textContent=`${data.segments.length} fragmentos · ${data.gaps.length} zonas pendientes`;
 }catch(error){stage.classList.add('error');stage.setAttribute('aria-busy','false');$('load-status').textContent='No se pudo abrir la revisión. '+error.message;$('load-status').setAttribute('role','alert');$('dataset-status').textContent='Revisión no disponible';}
}
window.addEventListener('pagehide',()=>{if(imageURL)URL.revokeObjectURL(imageURL);});
init();
