// Draw only original source paths. Thumbnail emphasis changes screen stroke width,
// never path coordinates, curve commands, missing spans or geography.
const svgNS='http://www.w3.org/2000/svg';
export function officialTrailModels(data){
 if(!['document-pixels','image-pixels'].includes(data?.coordinateSystem)||!Array.isArray(data.trails))throw new Error('Las miniaturas requieren curvas del plano oficial.');
 return data.trails.map(t=>{
  const paths=(data.routePaths?data.routePaths.filter(p=>p.trailId===t.id):t.paths||[]).filter(p=>p.role!=='endpoint-marker');
  if(!paths.length)return null;
  for(const p of paths)if(typeof p.d!=='string'||!p.d.trim()||!/^[MmLlHhVvCcSsQqTtAaZz0-9eE+.,\s-]+$/.test(p.d)||!Array.isArray(p.bounds)||p.bounds.length!==4||!p.bounds.every(Number.isFinite)||p.bounds[2]<0||p.bounds[3]<0)throw new Error('Curva oficial inválida para miniatura.');
  const left=Math.min(...paths.map(p=>p.bounds[0])),top=Math.min(...paths.map(p=>p.bounds[1])),right=Math.max(...paths.map(p=>p.bounds[0]+p.bounds[2])),bottom=Math.max(...paths.map(p=>p.bounds[1]+p.bounds[3]));
  const width=Math.max(1,right-left),height=Math.max(1,bottom-top),padding=Math.max(width,height)*.07;
  return{id:t.id,name:t.name,paths,bounds:[left,top,width,height],viewBox:{x:left-padding,y:top-padding,width:width+padding*2,height:height+padding*2}};
 }).filter(Boolean);
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
 const figure=document.createElement('figure');figure.className='trail-official-preview';figure.dataset.officialPreview=model.id;
 const button=document.createElement('button');button.type='button';button.className='trail-preview-open';button.setAttribute('aria-label','Ampliar trazado oficial de '+model.name);
 const frame=model.viewBox,viewBox=[frame.x,frame.y,frame.width,frame.height].join(' '),svg=document.createElementNS(svgNS,'svg');svg.setAttribute('viewBox',viewBox);svg.setAttribute('preserveAspectRatio','xMidYMid meet');svg.setAttribute('role','img');svg.setAttribute('aria-label',model.name+' y su entorno en el plano oficial');
 // A nested viewport clips the original map to the route neighbourhood even in
 // the outer SVG's letterbox. Image and original paths use identical coordinates.
 const crop=document.createElementNS(svgNS,'svg');crop.classList.add('trail-preview-crop');for(const key of ['x','y','width','height'])crop.setAttribute(key,String(frame[key]));crop.setAttribute('viewBox',viewBox);crop.setAttribute('overflow','hidden');
 if(background){if(!background.imageUrl||![background.width,background.height].every(n=>Number.isFinite(n)&&n>0))throw new Error('Fondo del plano oficial inválido.');const image=document.createElementNS(svgNS,'image');image.classList.add('trail-preview-map');image.setAttribute('href',background.imageUrl);image.setAttribute('x','0');image.setAttribute('y','0');image.setAttribute('width',String(background.width));image.setAttribute('height',String(background.height));image.setAttribute('preserveAspectRatio','none');crop.append(image);}
 for(const path of model.paths)crop.append(sourcePathNode(path,{thumbnail:true}));svg.append(crop);button.append(svg);button.onclick=onOpen;
 const caption=document.createElement('figcaption');caption.textContent='Plano oficial · Entorno de la ruta · Toca para ampliar';figure.append(button,caption);return figure;
}
export function attachTrailPreviews(data,{resolveId=id=>id,onOpen,background}={}){
 const models=officialTrailModels(data);for(const card of document.querySelectorAll('.trail-card')){
  const summary=card.querySelector('[data-trail-summary]'),id=summary?.dataset.trailSummary,model=models.find(t=>t.id===resolveId(id));if(!model)continue;
  card.querySelectorAll('.trail-official-preview,.trail-miniature').forEach(n=>n.remove());const preview=createTrailPreview(model,()=>onOpen?.(model.id),background);card.querySelector('.trail-details').prepend(preview);
  const miniature=preview.querySelector('svg').cloneNode(true);miniature.classList.add('trail-miniature');miniature.setAttribute('aria-hidden','true');summary.classList.add('has-trail-miniature');summary.append(miniature);
 }
 return models;
}
