import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
const base=process.env.GEOGRAPHIC_BASE_URL||'http://127.0.0.1:4210';
const entry=process.env.CARTOGRAPHY_ENTRY||'/mapa-geografico.html';
const output=process.env.CARTOGRAPHY_OUTPUT||'/workspace/artifacts/cartography-audit/browser';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
await mkdir(output,{recursive:true});
try{
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,permissions:['geolocation'],geolocation:{latitude:-33.3138365,longitude:-70.5036907,accuracy:5}}),p=await ctx.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+entry+'#parque=el-durazno&vista=mapa');await p.waitForSelector('#map-card[data-ready=true][data-source=cartel]');
 const registration=JSON.parse(await readFile('data/el-durazno/cartel-registration.json'));
 const sampled=JSON.parse(await readFile('data/el-durazno/continuous-sign-trails.json')).segments.map(s=>s.points[0]);
 const alignment=async()=>{
  const error=await p.evaluate(({matrix,points})=>{
   const [a,b,c,d,e,f]=matrix,root=document.querySelector('.cartel-artwork>g'),ctm=root.getScreenCTM(),rect=document.querySelector('#geo-map').getBoundingClientRect(),[lat,lon,zoom]=document.querySelector('#geo-map').dataset.view.split(',').map(Number),R=6378137,cx=R*lon*Math.PI/180,cy=R*Math.log(Math.tan(Math.PI/4+lat*Math.PI/360)),scale=256*2**zoom/(2*Math.PI*R);
   return Math.max(...points.map(([x,y])=>{const q=new DOMPoint(x,y).matrixTransform(ctm),mx=a*x+c*y+e,my=b*x+d*y+f;return Math.hypot(q.x-(rect.x+rect.width/2+(mx-cx)*scale),q.y-(rect.y+rect.height/2-(my-cy)*scale));}));
  },{matrix:registration.experimentalModel.matrix,points:sampled});
  assert.ok(error<2,'native artwork and geographic screen projection must stay aligned: '+error);
 };
 await alignment();await p.locator('.leaflet-control-zoom-in').click();await p.waitForTimeout(350);await alignment();
 await p.mouse.move(70,250);await p.mouse.down();await p.mouse.move(115,280,{steps:8});await p.mouse.up();await p.waitForTimeout(350);await alignment();
 await p.screenshot({path:output+'/world-before-gps.png'});
 await p.locator('#gps-toggle').click();await p.waitForSelector('.gps-raw-dot');
 await p.screenshot({path:output+'/world-with-gps.png'});
 assert.equal(await p.locator('#map-card').getAttribute('data-source'),'cartel','activating GPS must retain the official source selected by the rider');
 assert.doesNotMatch(await p.locator('#rider-route-guidance').innerText(),/probable sobre OSM/,'official artwork cannot advertise an OSM-adjusted route');
 assert.equal(await p.locator('.gps-snapped-dot').count(),0,'approximate official artwork cannot acquire an OSM-adjusted position');
 assert.equal(await p.locator('.cartel-connection-artwork').count(),68,'native green and red dotted connections remain visible');
 const official=JSON.parse(await readFile('data/el-durazno/continuous-sign-trails.json'));
 assert.deepEqual(await p.locator('.cartel-route').evaluateAll(ns=>Object.fromEntries(ns.map(n=>[n.dataset.sourcePath,{d:n.getAttribute('d'),fill:n.getAttribute('fill'),stroke:n.getAttribute('stroke'),width:Number(n.getAttribute('stroke-width'))}]))),Object.fromEntries(official.routePaths.map(n=>[n.id,{d:n.d,fill:n.fill,stroke:n.stroke,width:n.strokeWidth}])),'world rendering retains actual filled ribbons/strokes instead of outlining both edges');
 await p.setViewportSize({width:320,height:568});await p.route('https://tile.openstreetmap.org/**',r=>r.abort());
 await p.locator('#rider-map-more').click();await p.locator('[data-map-target=lomo-vetado]').click();
 await p.locator('#gps-panel').evaluate(n=>{const notice=document.getElementById('map-notice');notice.hidden=false;notice.textContent='No se está cargando el fondo del mapa.';n.append(notice);});
 assert.equal(await p.locator('#gps-toggle').evaluate(n=>{const r=n.getBoundingClientRect(),front=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return front===n||n.contains(front);}),true,'Stop GPS stays reachable with official sheet and failed map tiles on a small phone');
 await p.locator('#close-sheet').click();await p.setViewportSize({width:390,height:844});
 await p.locator('#gps-toggle').click();assert.equal(await p.locator('.gps-raw-dot').count(),0);
 await p.locator('#open-sign').evaluate(n=>n.click());await p.waitForSelector('#sign-dialog[data-ready=true]');
 assert.equal(await p.locator('#sign-context path').count(),68);
 const download=await Promise.all([p.waitForEvent('download'),p.locator('#sign-download').click()]);
 const exported=JSON.parse(await readFile(await download[0].path()));assert.equal(exported.graphicContext?.paths.length,68,'editable download includes the restored artwork');
 await p.locator('#close-sign').click();
 await p.goto(base+'/parquemet.html#parque=parquemet');await p.waitForSelector('#map-card[data-ready=true]');
 await p.locator('[data-show-document=centenario]').evaluate(n=>n.click());await p.waitForSelector('#official-dialog[open]');
 const cycling=JSON.parse(await readFile('data/parquemet/visual-cycling-trails.json'));
 for(const t of cycling.trails)for(const path of t.paths){
  const node=p.locator(`.document-cycling-trail[data-trail-id="${t.id}"] [data-source-path="${path.id}"]`);
  assert.equal(await node.getAttribute('d'),path.d);
  assert.equal(await node.getAttribute('stroke-width'),String(path.strokeWidth||0));
  assert.equal(await node.getAttribute('stroke-dasharray'),path.strokeDasharray?.length?path.strokeDasharray.join(' '):null);
 }
 for(const id of ['centenario','la-s','zorzal','pa-arriba']){
  const t=cycling.trails.find(t=>t.id===id);
  for(const index of t.sharedEndpointDrawingIds){assert.equal(await p.locator(`.document-cycling-trail[data-trail-id="${id}"] [data-source-drawing="${index}"]`).count(),1,'isolation retains the same official shared endpoint symbol');}
 }
 await p.screenshot({path:output+'/parquemet-official-overlay.png'});
 assert.deepEqual(errors,[]);await ctx.close();console.log('PASS official shapes,68 dotted connection drawings, shared endpoint symbols, native dash styles and GPS source preservation');
}finally{await browser.close();}
