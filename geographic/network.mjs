// Explicit restrictions exclude an edge from this experimental bicycle matcher.
// Absence of a restriction is not proof of current physical access or direction.
export function bikeAccessRestricted(feature){
 const tags=feature.properties.tags||{};
 return ['no','private'].includes(tags.bicycle)||['no','private'].includes(tags.access)||tags.highway==='steps';
}
export function bikeMatchingNetwork(geo){
 if(geo?.metadata?.source!=='OpenStreetMap'||!Array.isArray(geo.features))throw new Error('La red de coincidencia requiere datos OSM.');
 return {...geo,features:geo.features.filter(f=>f.properties.targetId&&!bikeAccessRestricted(f))};
}
