// Screen callouts only. Route coordinates and anchors are never moved.
export function placeRouteLabels({width,height,labels,obstacles}){
 const gap=5,result=new Map(),placed=[],overlaps=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
 for(const label of [...labels].sort((a,b)=>(a.priority||0)-(b.priority||0))){
  const {id,x,y}=label,w=label.width,h=label.height;
  const fits=p=>p.x>=gap&&p.y>=gap&&p.x+w<=width-gap&&p.y+h<=height-gap&&![...obstacles,...placed].some(o=>overlaps({x:p.x-gap/2,y:p.y-gap/2,width:w+gap,height:h+gap},o));
  let best=null,cost=Infinity;
  const consider=(left,top)=>{const p={x:left,y:top,width:w,height:h},distance=(left+w/2-x)**2+(top+h/2-y)**2;if(distance<cost&&fits(p)){best=p;cost=distance;}};
  if([x,y,w,h].every(Number.isFinite)&&w>0&&h>0&&x>=0&&x<=width&&y>=0&&y<=height){
   consider(x-w/2,y-h-6);
   // Scan the full measured viewport, not a fixed-radius unsafe fallback.
   // Include boundary positions so narrow, valid edge slots are not skipped.
   const xs=[gap,width-w-gap],ys=[gap,height-h-gap];
   // Real control edges may leave a valid strip between coarse grid rows.
   // Include its exact boundaries, including callouts already placed.
   for(const o of [...obstacles,...placed]){xs.push(o.x-w-gap/2,o.x+o.width+gap/2);ys.push(o.y-h-gap/2,o.y+o.height+gap/2);}
   for(let left=gap;left<=width-w-gap;left+=10)xs.push(left);
   for(let top=gap;top<=height-h-gap;top+=10)ys.push(top);
   for(const left of new Set(xs))for(const top of new Set(ys))consider(left,top);
  }
  result.set(id,best);if(best)placed.push(best);
 }
 return result;
}
