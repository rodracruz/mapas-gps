import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const out=process.env.CARTOGRAPHY_OUTPUT||'/workspace/artifacts/cartography-audit/comparison';await mkdir(out,{recursive:true});
const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}),receipt=[];
try{
 for(const [version,base]of [['before','http://127.0.0.1:4211'],['after','http://127.0.0.1:4210']]){
  const context=await b.newContext({viewport:{width:1200,height:900}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/mapa-geografico.html#parque=el-durazno');await page.waitForSelector('#map-card[data-ready=true]');await page.locator('#open-sign').click();await page.waitForSelector('#sign-dialog[data-ready=true]');await page.waitForFunction(()=>document.querySelector('#sign-raster').getAttribute('href'));
  for(const [sector,view]of [['north',[1600,540,970,1000]],['lower',[850,1550,950,950]],['skills',[900,1980,400,350]]]){
   await page.locator('#sign-svg').evaluate((n,v)=>n.setAttribute('viewBox',v.join(' ')),view);
   for(const mode of version==='before'?['vectors']:['photo','overlay','vectors']){
    await page.locator(`[data-sign-mode=${mode}]`).click();await page.locator('#sign-svg').screenshot({path:`${out}/durazno-${sector}-${version}-${mode}.png`});
   }
  }
  await page.locator('#close-sign').click();await page.goto(base+'/parquemet.html#parque=parquemet');await page.waitForSelector('#map-card[data-ready=true]');
  await page.locator('[data-show-document=centenario]').evaluate(n=>n.click());await page.waitForSelector('#official-dialog[open]');
  for(const [sector,view]of [['west',[1450,950,600,550]],['middle',[2900,1080,780,600]],['east',[3700,1050,750,450]]]){
   await page.locator('#document-fit-cycling').click();await page.locator('#document-svg').evaluate((n,v)=>n.setAttribute('viewBox',v.join(' ')),view);
   for(const mode of version==='before'?['vectors']:['photo','overlay','vectors']){
    await page.locator(`[data-document-mode=${mode}]`).click();await page.locator('#document-svg').screenshot({path:`${out}/parquemet-${sector}-${version}-${mode}.png`});
   }
  }
  await page.locator('#official-close').click();await page.setViewportSize({width:390,height:844});
  for(const [park,entry]of [['el-durazno','mapa-geografico.html'],['parquemet','parquemet.html']]){
   await page.goto(`${base}/${entry}#parque=${park}&vista=mapa`);await page.waitForSelector('#map-card[data-ready=true]');
   await page.waitForTimeout(1200);await page.screenshot({path:`${out}/${park}-${version}-world.png`});
   receipt.push({version,park,viewport:[390,844],source:await page.locator('#map-card').getAttribute('data-source')||'osm',view:await page.locator('#geo-map').getAttribute('data-view'),loadedTiles:await page.locator('.leaflet-tile-loaded').count(),errors:[...errors]});
  }
  await context.close();
 }
 await writeFile(out+'/captures.json',JSON.stringify(receipt,null,2));console.log('PASS comparative native-coordinate source/overlay/vector sectors and geographic maps captured at equal viewports');
}finally{await b.close();}
