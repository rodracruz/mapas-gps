// Native sign artwork stays in image pixels. Registration is an experimental
// rendering comparison with OSM, never an accepted GPS transform.
export function validateContinuous(d){
 const fail=()=>{throw new Error('Datos del cartel inválidos: se requieren curvas originales en píxeles.');};
 if(d?.schemaVersion!==1||d.coordinateSystem!=='image-pixels'||d.image?.width!==2570||d.image?.height!==3077||d.georeferencing?.transform!==null||d.connections?.length!==0||!Array.isArray(d.trails)||!Array.isArray(d.routePaths)||!Array.isArray(d.labels)||!Array.isArray(d.markers))fail();
 const ids=new Set(d.trails.map(t=>t.id));if(ids.size!==d.trails.length)fail();
 const point=p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&p[0]>=0&&p[0]<=d.image.width&&p[1]>=0&&p[1]<=d.image.height;
 for(const t of d.trails)if(!/^[a-z0-9-]+$/.test(t.id)||typeof t.name!=='string'||!/^#[0-9a-f]{6}$/i.test(t.color))fail();
 for(const p of [...d.routePaths,...d.labels.flatMap(l=>l.paths),...d.markers.flatMap(m=>m.paths)])if(typeof p.d!=='string'||!p.d.length||!/^[MmLlCcQqSsTtHhVvAaZz0-9eE,.\s+-]+$/.test(p.d)||!p.sourceDrawingIndices?.length)fail();
 for(const p of d.routePaths)if(!ids.has(p.trailId))fail();
 for(const v of [...d.labels,...d.markers])if(!ids.has(v.trailId)||!point(v.center))fail();
 for(const m of d.markers)if(m.connectionVerified!==false)fail();
 for(const t of d.trails)if(!d.routePaths.some(p=>p.trailId===t.id)||!d.labels.some(l=>l.trailId===t.id))fail();
 return d;
}
export function imageToMercator(point,registration){
 const m=registration?.experimentalModel?.matrix;
 if(registration?.validation?.status!=='unvalidated'||registration.acceptedTransform!==null||registration.experimentalModel?.useForNavigation!==false||registration.experimentalModel?.useForGroundDistances!==false||registration.experimentalModel.targetCRS!=='EPSG:3857'||!Array.isArray(m)||m.length!==6||!m.every(Number.isFinite)||Math.abs(m[0]*m[3]-m[1]*m[2])<1e-8||!Array.isArray(point)||point.length!==2||!point.every(Number.isFinite))throw new Error('Registro experimental del cartel inválido.');
 const [a,b,c,d,e,f]=m,[x,y]=point;return [a*x+c*y+e,b*x+d*y+f];
}
export function signShape(p){
 const n=document.createElementNS('http://www.w3.org/2000/svg','path');
 for(const [k,v] of Object.entries({d:p.d,fill:p.fill||'none','fill-rule':p.fillRule||'nonzero',stroke:p.stroke||'none','stroke-width':p.strokeWidth||0,'stroke-linecap':p.lineCap||'round','stroke-linejoin':p.lineJoin||'round'}))n.setAttribute(k,String(v));
 return n;
}
export function createCartelLayer(map,d,registration,onSelect){
 validateContinuous(d);const L=window.L,ns='http://www.w3.org/2000/svg',layer=L.layerGroup(),byTrail=new Map(d.trails.map(t=>[t.id,L.layerGroup().addTo(layer)]));
 const latlng=p=>{const [x,y]=imageToMercator(p,registration);return L.CRS.EPSG3857.unproject(L.point(x,y));};
 const corners=[[0,0],[d.image.width,0],[0,d.image.height],[d.image.width,d.image.height]].map(p=>imageToMercator(p,registration));
 const xs=corners.map(p=>p[0]),ys=corners.map(p=>p[1]),xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys),[a,b,c,d0,e0,f0]=registration.experimentalModel.matrix;
 const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox',`0 0 ${xmax-xmin} ${ymax-ymin}`);svg.classList.add('cartel-artwork');
 const root=document.createElementNS(ns,'g');root.setAttribute('transform',`matrix(${a} ${-b} ${c} ${-d0} ${e0-xmin} ${ymax-f0})`);svg.append(root);
 const groups=new Map(),labels=new Map();
 for(const t of d.trails){const group=document.createElementNS(ns,'g');group.dataset.cartelTrail=t.id;groups.set(t.id,group);root.append(group);}
 for(const p of d.routePaths){const t=d.trails.find(t=>t.id===p.trailId),group=groups.get(t.id),halo=signShape(p),line=signShape(p),hit=signShape(p);
  for(const [n,color,width]of [[halo,'#fffefa',6],[line,t.color,2]]){n.setAttribute('stroke',color);n.setAttribute('stroke-width',width);n.setAttribute('vector-effect','non-scaling-stroke');n.style.pointerEvents='none';}
  line.classList.add('cartel-route');line.dataset.trail=t.id;line.dataset.sourcePath=p.id;
  hit.setAttribute('stroke','transparent');hit.setAttribute('stroke-width','20');hit.setAttribute('fill','transparent');hit.setAttribute('vector-effect','non-scaling-stroke');hit.style.pointerEvents='all';hit.classList.add('cartel-hit');hit.dataset.trail=t.id;
  hit.addEventListener('click',event=>{if(map.dragging?.moved())return;L.DomEvent.stopPropagation(event);onSelect(t.id);});group.append(halo,line,hit);
 }
 const glyphs=document.createElementNS(ns,'g');glyphs.classList.add('cartel-native-labels');root.append(glyphs);for(const l of d.labels){const g=document.createElementNS(ns,'g');g.dataset.trail=l.trailId;for(const p of l.paths)g.append(signShape(p));g.style.pointerEvents='none';glyphs.append(g);}
 const symbols=document.createElementNS(ns,'g');symbols.classList.add('cartel-symbols');root.append(symbols);
 for(const m of d.markers){const group=document.createElementNS(ns,'g');group.dataset.trail=m.trailId;for(const p of m.paths)group.append(signShape(p));group.style.pointerEvents='none';symbols.append(group);}
 const bounds=L.latLngBounds([L.CRS.EPSG3857.unproject(L.point(xmin,ymin)),L.CRS.EPSG3857.unproject(L.point(xmax,ymax))]);
 L.svgOverlay(svg,bounds,{interactive:true,attribution:'Cartel © Outlife · ubicación aproximada'}).addTo(layer);
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 for(const l of d.labels){const angle=l.angleDeg*Math.PI/180,dx=a*Math.cos(angle)+c*Math.sin(angle),dy=-(b*Math.cos(angle)+d0*Math.sin(angle));let rotation=Math.atan2(dy,dx)*180/Math.PI;if(rotation>90)rotation-=180;if(rotation< -90)rotation+=180;
  const marker=L.marker(latlng(l.center),{icon:L.divIcon({className:'cartel-label',html:`<span style="transform:translate(-50%,-50%) rotate(${rotation}deg)">${escape(l.text)}</span>`,iconSize:null}),interactive:false,zIndexOffset:500});marker.addTo(byTrail.get(l.trailId));if(!labels.has(l.trailId))labels.set(l.trailId,[]);labels.get(l.trailId).push(marker);
 }
 let active=null;const updateLabelVisibility=()=>{const placed=[],entries=[...labels].sort(([a],[b])=>Number(b===active)-Number(a===active));for(const [id,markers]of entries)for(const m of markers){const element=m.getElement();if(!element?.isConnected)continue;element.style.display='';const rect=element.querySelector('span').getBoundingClientRect(),overlap=placed.some(p=>rect.left<p.right+3&&rect.right>p.left-3&&rect.top<p.bottom+3&&rect.bottom>p.top-3);if((map.getZoom()<13&&active!==id)||(overlap&&active!==id))element.style.display='none';else placed.push(rect);}};map.on('zoomend moveend',updateLabelVisibility);layer.on('add',()=>requestAnimationFrame(updateLabelVisibility));
 for(const m of d.markers.filter(m=>m.kind==='solid-dot'||m.kind==='hollow-dot')){const t=d.trails.find(t=>t.id===m.trailId);L.circleMarker(latlng(m.center),{radius:2.5,weight:1.5,color:t.color,fillColor:m.kind==='hollow-dot'?'#fffefa':t.color,fillOpacity:1,className:'cartel-point'}).on('click',()=>onSelect(t.id)).addTo(byTrail.get(t.id));}
 return {layer,data:d,registration,latlng,features(id,hidden=new Set()){return d.segments.filter(s=>(!id||s.trailId===id)&&!hidden.has(s.trailId)).flatMap(s=>s.points.map(latlng));},setVisible(id,visible){groups.get(id)?.toggleAttribute('hidden',!visible);for(const n of [...symbols.querySelectorAll('[data-trail]'),...glyphs.querySelectorAll('[data-trail]')])if(n.dataset.trail===id)n.toggleAttribute('hidden',!visible);if(visible)layer.addLayer(byTrail.get(id));else layer.removeLayer(byTrail.get(id));},select(id){active=id;updateLabelVisibility();for(const [tid,g]of groups){g.style.opacity=!id||tid===id?'1':'.3';g.classList.toggle('selected-cartel',tid===id);}for(const [tid,markers]of labels)for(const m of markers)m.setOpacity(!id||tid===id?1:.35);}};
}
