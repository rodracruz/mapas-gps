// Draw only original source paths. Thumbnail emphasis changes screen stroke width,
// never path coordinates, curve commands, missing spans or geography.
const svgNS='http://www.w3.org/2000/svg';
export function officialTrailModels(data){
 if(!['document-pixels','image-pixels'].includes(data?.coordinateSystem)||!Array.isArray(data.trails))throw new Error('Las miniaturas requieren curvas del plano oficial.');
 const routes=data.trails.map(t=>{
  const paths=(data.routePaths?data.routePaths.filter(p=>p.trailId===t.id):t.paths||[]).filter(p=>p.role!=='endpoint-marker');
  if(!paths.length)return null;
  for(const p of paths)if(typeof p.d!=='string'||!p.d.trim()||!/^[MmLlHhVvCcSsQqTtAaZz0-9eE+.,\s-]+$/.test(p.d)||!Array.isArray(p.bounds)||p.bounds.length!==4||!p.bounds.every(Number.isFinite)||p.bounds[2]<0||p.bounds[3]<0)throw new Error('Curva oficial inválida para miniatura.');
  const left=Math.min(...paths.map(p=>p.bounds[0])),top=Math.min(...paths.map(p=>p.bounds[1])),right=Math.max(...paths.map(p=>p.bounds[0]+p.bounds[2])),bottom=Math.max(...paths.map(p=>p.bounds[1]+p.bounds[3]));
  const width=Math.max(1,right-left),height=Math.max(1,bottom-top),padding=Math.max(width,height)*.07;
  return{id:t.id,name:t.name,category:t.category,kind:'route',routeGeometryAvailable:true,paths,bounds:[left,top,width,height],viewBox:{x:left-padding,y:top-padding,width:width+padding*2,height:height+padding*2}};
 }).filter(Boolean);
 const cropModel=(view,reference=false)=>{
  const rect=reference?view.referenceTableRect:view.sourceRect;
  if(view.geometryStatus!=='not-extracted'||(view.paths?.length)||!Array.isArray(rect)||rect.length!==4||!rect.every(Number.isFinite)||rect[0]<0||rect[1]<0||rect[2]<=0||rect[3]<=0||rect[0]+rect[2]>data.image?.width||rect[1]+rect[3]>data.image?.height||!Number.isFinite(data.image?.width)||!Number.isFinite(data.image?.height))throw new Error('Recorte del plano oficial inválido.');
  if(reference?view.mapLocationStatus!=='not-located-in-map':view.viewKind!=='original-map-crop')throw new Error('Referencia del plano oficial inválida.');
  return{id:view.id,name:view.name,category:view.category||'avenue',kind:reference?'document-reference':'document-crop',routeGeometryAvailable:false,thumbnail:!reference,paths:[],bounds:[...rect],viewBox:{x:rect[0],y:rect[1],width:rect[2],height:rect[3]}};
 };
 return [...routes,...(data.views||[]).map(v=>cropModel(v)),...(data.pendingSourceMentions||[]).map(v=>cropModel(v,true))];
}
export function sourcePathNode(path,{thumbnail=false}={}){
 const node=document.createElementNS(svgNS,'path');node.setAttribute('d',path.d);node.dataset.sourceDrawing=String(path.drawingIndex??path.sourceDrawingIndices?.join(',')??path.id);node.dataset.sourcePath=path.id;
 const fill=path.fill&&path.fill!=='none'?path.fill:'none',stroke=path.stroke&&path.stroke!=='none'?path.stroke:'none';
 node.setAttribute('fill',fill);node.setAttribute('fill-rule',path.fillRule||'nonzero');node.setAttribute('stroke',thumbnail?(stroke==='none'?fill:stroke):stroke);node.setAttribute('stroke-width',String(thumbnail?1.7:path.strokeWidth||0));node.setAttribute('stroke-linecap',path.lineCap||'round');node.setAttribute('stroke-linejoin',path.lineJoin||'round');
 if(thumbnail)node.setAttribute('vector-effect','non-scaling-stroke');
 else if(path.strokeDasharray?.length)node.setAttribute('stroke-dasharray',path.strokeDasharray.join(' '));
 if(!thumbnail&&path.strokeDashoffset)node.setAttribute('stroke-dashoffset',String(path.strokeDashoffset));
 return node;
}
export function createTrailPreview(model,onOpen,background){
 const figure=document.createElement('figure');figure.className=model.kind==='document-reference'?'trail-official-reference':'trail-official-preview';figure.dataset.officialPreview=model.id;figure.dataset.previewKind=model.kind||'route';
 const button=document.createElement('button');button.type='button';button.className='trail-preview-open';button.setAttribute('aria-label','Ampliar '+(model.routeGeometryAvailable?'trazado oficial de ':'referencia oficial de ')+model.name);
 const frame=model.viewBox,viewBox=[frame.x,frame.y,frame.width,frame.height].join(' '),svg=document.createElementNS(svgNS,'svg');svg.setAttribute('viewBox',viewBox);svg.setAttribute('preserveAspectRatio','xMidYMid meet');svg.setAttribute('role','img');svg.setAttribute('aria-label',model.name+' y su entorno en el plano oficial');
 // A nested viewport clips the original map to the route neighbourhood even in
 // the outer SVG's letterbox. Image and original paths use identical coordinates.
 const crop=document.createElementNS(svgNS,'svg');crop.classList.add('trail-preview-crop');for(const key of ['x','y','width','height'])crop.setAttribute(key,String(frame[key]));crop.setAttribute('viewBox',viewBox);crop.setAttribute('overflow','hidden');
 if(background){if(!background.imageUrl||![background.width,background.height].every(n=>Number.isFinite(n)&&n>0))throw new Error('Fondo del plano oficial inválido.');const image=document.createElementNS(svgNS,'image');image.classList.add('trail-preview-map');image.setAttribute('href',background.imageUrl);image.setAttribute('x','0');image.setAttribute('y','0');image.setAttribute('width',String(background.width));image.setAttribute('height',String(background.height));image.setAttribute('preserveAspectRatio','none');crop.append(image);}
 for(const path of model.paths)crop.append(sourcePathNode(path,{thumbnail:model.category!=='shared-trail'}));svg.append(crop);button.append(svg);button.onclick=onOpen;
 const caption=document.createElement('figcaption');caption.textContent=model.kind==='document-reference'?'Referencia en la tabla oficial · Sin ubicación individual en el dibujo · Toca para ampliar':model.kind==='document-crop'?'Plano original · Sector rotulado de la avenida · Sin trazado individual extraído · Toca para ampliar':'Plano oficial · Entorno de la ruta · Toca para ampliar';figure.append(button,caption);return figure;
}
export function attachTrailPreviews(data,{resolveId=id=>id,onOpen,background}={}){
 const models=officialTrailModels(data);for(const card of document.querySelectorAll('.trail-card')){
  const summary=card.querySelector('[data-trail-summary]'),id=summary?.dataset.trailSummary,model=models.find(t=>t.id===resolveId(id));if(!model)continue;
  card.querySelectorAll('.trail-official-preview,.trail-official-reference,.trail-miniature').forEach(n=>n.remove());const preview=createTrailPreview(model,()=>onOpen?.(model.id),background);card.querySelector('.trail-details').prepend(preview);
  const note=card.querySelector('.bikeride-fragment-note');if(note)note.textContent=model.kind==='document-reference'?'Referencia en tabla oficial · Ubicación en el plano pendiente':model.kind==='document-crop'?'Sector del plano oficial · Trazado individual pendiente':'Fragmento del plano oficial · Amplía en la ficha';
  if(model.thumbnail!==false){const miniature=preview.querySelector('svg').cloneNode(true);miniature.classList.add('trail-miniature');miniature.setAttribute('aria-hidden','true');miniature.setAttribute('preserveAspectRatio','xMidYMid slice');summary.classList.add('has-trail-miniature');(summary.querySelector('.bikeride-card-preview')||summary).append(miniature);}
 }
 return models;
}
