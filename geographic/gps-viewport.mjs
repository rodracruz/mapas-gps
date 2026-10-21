// CSS-pixel screen space only. This changes the camera, never GPS coordinates.
export function gpsViewport({width,height},obstacles=[],margin=12){
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=2*margin||height<=2*margin)return null;
 const left=margin,right=width-margin,top=margin,bottom=height-margin;
 const boxes=obstacles.filter(o=>[o.x,o.y,o.width,o.height].every(Number.isFinite)&&o.width>0&&o.height>0)
  .map(o=>({left:Math.max(left,o.x-margin),right:Math.min(right,o.x+o.width+margin),top:Math.max(top,o.y-margin),bottom:Math.min(bottom,o.y+o.height+margin)}))
  .filter(o=>o.right>o.left&&o.bottom>o.top);
 const xs=[...new Set([left,right,...boxes.flatMap(o=>[o.left,o.right])])].sort((a,b)=>a-b);
 let best=null,area=0;
 for(let i=0;i<xs.length;i++)for(let j=i+1;j<xs.length;j++){
  const x=xs[i],w=xs[j]-x,spans=boxes.filter(o=>o.left<xs[j]&&o.right>x).sort((a,b)=>a.top-b.top);
  let y=top;
  for(const span of [...spans,{top:bottom,bottom}]){
   const h=span.top-y;
   if(w*h>area){area=w*h;best={x,y,width:w,height:h};}
   y=Math.max(y,span.bottom);
  }
 }
 return best;
}
