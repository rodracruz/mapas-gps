// Exercise the visible control: chips in the park, native fields on the map.
export async function chooseRouteFilter(page,kind,value){
 await openMapControls(page);
 const select=page.locator('#filter-'+kind);
 if(await select.isVisible())await select.selectOption(value);
 else await page.locator('[data-filter-'+kind+'="'+value+'"]').click();
}

export async function openMapControls(page){
 const toggle=page.locator('#rider-map-more');
 if(await toggle.isVisible()&&await toggle.getAttribute('aria-expanded')==='false')await toggle.click();
}
export async function selectMapTrail(page,id){
 await openMapControls(page);
 await page.locator('[data-map-target="'+id+'"]').click();
}
