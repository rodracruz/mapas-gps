// Exercise the visible control: chips in the park, native fields on the map.
export async function chooseRouteFilter(page,kind,value){
 const select=page.locator('#filter-'+kind);
 if(await select.isVisible())await select.selectOption(value);
 else await page.locator('[data-filter-'+kind+'="'+value+'"]').click();
}
