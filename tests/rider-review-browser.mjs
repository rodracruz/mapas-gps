import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.RIDER_BASE_URL||'http://127.0.0.1:4187';
const out=process.env.RIDER_REVIEW_OUT||'test-results/rider-review';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const failures=[],evidence=[];
function verify(name,fn){try{fn();console.log('PASS',name);}catch(error){failures.push(name+': '+error.message);console.log('FAIL',name,error.message);}}
async function feedbackGeometry(page,selectors){
 return page.evaluate(selectors=>{
  const message=document.getElementById('rider-message'),m=message.getBoundingClientRect(),style=getComputedStyle(message),shown=!!message.getClientRects().length&&style.visibility==='visible'&&Number(style.opacity)>0;
  const overlap=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
  return {message:{text:message.textContent,shown,position:style.position,rect:m.toJSON(),color:style.color,background:style.backgroundColor},actions:selectors.map(selector=>{
   const button=document.querySelector(selector),r=button.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(button);const label=range.getBoundingClientRect();
   return {selector,text:button.textContent,visible:!!button.getClientRects().length&&getComputedStyle(button).visibility==='visible',withinViewport:r.top>=0&&r.bottom<=innerHeight,overlap:shown?overlap(m,r):0,labelOverlap:shown?overlap(m,label):0};
  })};
 },selectors);
}
async function axDescription(page,cdp){
 const {nodes}=await cdp.send('Accessibility.getFullAXTree');
 const description=nodes.find(n=>n.role?.value==='button'&&['Mi ubicación','Detener GPS'].includes(n.name?.value))?.description?.value;
 assert.equal(typeof description,'string','GPS button has a computed accessible description');return description;
}
function checkDescription(value){assert.match(value,/OSM.*teselas.*área visible/i);assert.match(value,/consultar.*GPS.*no (graba|guarda)/i);assert.match(value,/demo.*no (graba|guarda)/i);assert.match(value,/Registrar actividad.*(local|dispositivo)/i);assert.doesNotMatch(value,/Tu ubicación y recorrido no se guardan/);}
try{
 for(const [park,entry]of [['el-durazno','mapa-geografico.html'],['parquemet','parquemet.html']]){
  for(const viewport of [{width:320,height:568},{width:390,height:844}]){
   const context=await browser.newContext({viewport,serviceWorkers:'block'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await context.addInitScript(()=>{window.reviewFix=null;navigator.geolocation.watchPosition=fn=>{window.reviewFix=fn;return 1;};navigator.geolocation.clearWatch=()=>{window.reviewFix=null;};});
   await page.goto(`${base}/${entry}#parque=${park}&vista=mapa&mapa=1`);await page.waitForSelector('#map-card[data-ready=true]');await page.waitForSelector('body[data-rider-ready=true]');const cdp=await context.newCDPSession(page),prefix=`${park}-${viewport.width}x${viewport.height}`;
   const off=await axDescription(page,cdp);evidence.push({prefix,phase:'off-accessibility',description:off});verify(prefix+' inactive GPS accessibility',()=>checkDescription(off));
   await page.locator('#rider-record-start').click();await page.waitForFunction(()=>document.getElementById('rider-message').textContent.includes('Actividad guardada'));
   let geometry=await feedbackGeometry(page,['#rider-record-pause','#rider-record-finish']);evidence.push({prefix,phase:'recording',...geometry});verify(prefix+' start feedback keeps action labels visible',()=>{assert.equal(geometry.message.shown,true);for(const a of geometry.actions){assert.ok(a.visible&&a.withinViewport,a.selector);assert.equal(a.labelOverlap,0,JSON.stringify(a));assert.equal(a.overlap,0,JSON.stringify(a));}});await page.screenshot({path:`${out}/${prefix}-recording.png`});
   const active=await axDescription(page,cdp);evidence.push({prefix,phase:'recording-accessibility',description:active});verify(prefix+' recording GPS accessibility',()=>checkDescription(active));
   // A later periodic checkpoint uses a real accepted fix; it must not produce
   // a floating notice over the same controls.
   await page.evaluate(()=>{window.feedbackTextMutations=0;new MutationObserver(list=>{window.feedbackTextMutations+=list.filter(m=>m.type==='characterData'||m.type==='childList').length;}).observe(document.getElementById('rider-message'),{characterData:true,childList:true,subtree:true});});
   await page.evaluate(()=>window.reviewFix({coords:{longitude:-70.63,latitude:-33.42,accuracy:5,heading:null,speed:0},timestamp:Date.now()}));
   await page.waitForTimeout(5200);const feedbackTextMutations=await page.evaluate(()=>window.feedbackTextMutations);verify(prefix+' checkpoint does not reannounce unchanged success',()=>assert.equal(feedbackTextMutations,0));geometry=await feedbackGeometry(page,['#rider-record-pause','#rider-record-finish']);evidence.push({prefix,phase:'checkpoint',...geometry});verify(prefix+' checkpoint feedback stays in a reserved region',()=>{assert.notEqual(geometry.message.position,'fixed');assert.notEqual(geometry.message.position,'absolute');for(const a of geometry.actions)assert.equal(a.labelOverlap,0,JSON.stringify(a));});
   await page.locator('#rider-record-pause').click();await page.waitForFunction(()=>!document.getElementById('rider-record-resume').hidden);geometry=await feedbackGeometry(page,['#rider-record-resume','#rider-record-finish']);evidence.push({prefix,phase:'paused',...geometry});verify(prefix+' pause feedback keeps actions visible',()=>{for(const a of geometry.actions){assert.ok(a.visible&&a.withinViewport);assert.equal(a.overlap,0,JSON.stringify(a));}});await page.screenshot({path:`${out}/${prefix}-paused.png`});
   await page.locator('#rider-record-finish').click();await page.waitForFunction(()=>!document.getElementById('rider-record-start').hidden);geometry=await feedbackGeometry(page,['#rider-record-start']);evidence.push({prefix,phase:'finished',...geometry});verify(prefix+' finish feedback keeps new recording action visible',()=>{assert.equal(geometry.message.shown,true);assert.ok(geometry.actions[0].visible&&geometry.actions[0].withinViewport);assert.equal(geometry.actions[0].overlap,0);});
   // Actual transaction failure must retain visible, non-overlapping error feedback.
   await page.evaluate(()=>{const original=IDBDatabase.prototype.transaction;IDBDatabase.prototype.transaction=function(...args){const tx=original.apply(this,args);if(this.name==='bikeride-local-v1'&&args[1]==='readwrite'){tx.abort();IDBDatabase.prototype.transaction=original;}return tx;};});
   await page.locator('#rider-record-start').click();await page.waitForFunction(()=>document.getElementById('rider-message').dataset.error==='true');geometry=await feedbackGeometry(page,['#rider-record-pause','#rider-record-finish']);evidence.push({prefix,phase:'storage-error',...geometry});verify(prefix+' storage error is visible without covering actions',()=>{assert.equal(geometry.message.shown,true);assert.ok(geometry.message.rect.top>=0&&geometry.message.rect.bottom<=viewport.height);for(const a of geometry.actions){assert.ok(a.withinViewport);assert.equal(a.overlap,0);}});await page.screenshot({path:`${out}/${prefix}-storage-error.png`});await page.locator('#rider-record-finish').click();
   await page.locator('#bikeride-meetups').click();await page.locator('[data-rider-action=new-meetup]').click();await page.locator('#rider-meetup-title').fill('Salida de contraste');await page.locator('#rider-meetup-start').fill('2026-11-05T09:30');await page.locator('#rider-meetup-form button[type=submit]').click();await page.waitForFunction(()=>!document.getElementById('rider-editor').open);await page.locator('.rider-date').scrollIntoViewIfNeeded();
   const date=await page.locator('.rider-date').evaluate(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(el);const textRect=range.getBoundingClientRect();const rgb=c=>c.match(/[\d.]+/g).slice(0,3).map(Number),luminance=c=>rgb(c).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);const a=luminance(s.color),b=luminance(s.backgroundColor);return {text:el.textContent,color:s.color,background:s.backgroundColor,contrast:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),rect:r.toJSON(),textRect:textRect.toJSON(),visible:!!el.getClientRects().length&&s.visibility==='visible'};});
   evidence.push({prefix,phase:'agenda-date',...date});verify(prefix+' agenda renders readable actual date and time',()=>{assert.match(date.text,/5.*nov/i);assert.match(date.text,/09:30/);assert.ok(date.visible&&date.textRect.width>0);assert.ok(date.contrast>=4.5,JSON.stringify(date));});await page.screenshot({path:`${out}/${prefix}-agenda.png`});
   await page.locator('[data-rider-action=new-meetup]').scrollIntoViewIfNeeded();geometry=await feedbackGeometry(page,['[data-rider-action=new-meetup]']);evidence.push({prefix,phase:'agenda-feedback',...geometry});verify(prefix+' agenda save feedback does not obscure create action',()=>{assert.ok(geometry.actions[0].visible&&geometry.actions[0].withinViewport);assert.equal(geometry.actions[0].overlap,0);});await page.screenshot({path:`${out}/${prefix}-agenda-feedback.png`});verify(prefix+' no JavaScript errors',()=>assert.deepEqual(errors,[]));await context.close();
  }
 }
}finally{await browser.close();await writeFile(`${out}/evidence.json`,JSON.stringify({failures,evidence},null,2));}
assert.deepEqual(failures,[]);console.log('PASS review regressions: rendered recording/save/error actions, agenda date contrast, and actual GPS AX descriptions in both parks at320x568 and390x844');
