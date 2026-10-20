// The directory selects independent park entries. It never combines their networks.
export function validateParkDirectory(directory){
 const fail=()=>{throw new Error('No se pudo validar el directorio de parques.');};
 if(directory?.schemaVersion!==1||!Array.isArray(directory.parks)||!directory.parks.length)fail();const ids=new Set();
 for(const p of directory.parks){
  if(!p||typeof p.id!=='string'||!/^[a-z0-9-]+$/.test(p.id)||ids.has(p.id)||!['name','shortName','locality','description'].every(k=>typeof p[k]==='string'&&p[k].trim())||typeof p.entry!=='string'||!/^\.\/[a-z0-9-]+\.html#parque=[a-z0-9-]+$/.test(p.entry)||p.entry.split('#')[1]!=='parque='+p.id)fail();
  for(const key of ['catalog','document'])if(p[key]!==undefined&&p[key]!==`./data/${p.id}/${key==='catalog'?'geographic-catalog':'official-document'}.json`)fail();ids.add(p.id);
 }
 return directory;
}
export function parkById(directory,id){return directory.parks.find(p=>p.id===id)||null;}
export async function loadParkDirectory(){
 const embedded=document.getElementById('embedded-parks-directory');if(embedded)return validateParkDirectory(JSON.parse(embedded.textContent));
 const r=await fetch('./data/parks.json');if(!r.ok)throw new Error('No se pudo cargar el directorio de parques.');return validateParkDirectory(await r.json());
}
export function renderParkDirectory(container,directory,onChoose){
 container.replaceChildren();for(const p of directory.parks){
  const card=document.createElement('article');card.className='park-choice';const art=document.createElement('div');art.className='park-art';art.setAttribute('aria-hidden','true');art.textContent=p.id==='parquemet'?'♧':'↟';
  const body=document.createElement('div');body.className='park-choice-body';const local=document.createElement('span');local.className='eyebrow';local.textContent=p.locality;const title=document.createElement('h2');title.textContent=p.shortName;const description=document.createElement('p');description.textContent=p.description;const button=document.createElement('button');button.id=p.id==='el-durazno'?'choose-park':'choose-park-'+p.id;button.className='primary-button';button.textContent='Explorar '+p.shortName+' →';button.setAttribute('aria-label','Explorar '+p.shortName);button.onclick=()=>onChoose(p);body.append(local,title,description,button);card.append(art,body);container.append(card);
 }
}
