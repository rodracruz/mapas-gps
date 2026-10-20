import {lineLength} from '../geographic/data.mjs';

const RADIUS = 6_371_008.8;
const RAD = Math.PI / 180;
const JUNCTION = 4705609090;
const HALF_DISTANCE = 192;
const STEP = 8;
const INTERVAL = 1800;
const ROUTES = [
  {targetId: 'lomo-vetado', osmId: 477170097},
  {targetId: 'calibre-12', osmId: 1003300258}
];

function sourceLines(geo) {
  const fail = () => { throw new Error('La demo requiere las vías OSM geográficas de Lomo Vetado y Calibre 12 y su nodo compartido.'); };
  if (geo?.metadata?.source !== 'OpenStreetMap' || geo.metadata.coordinateSystem !== 'EPSG:4326' || geo.metadata.coordinateOrder !== 'longitude,latitude' || !Array.isArray(geo.features)) fail();
  const ways = ROUTES.map(route => {
    const matches = geo.features.filter(feature => feature?.properties?.osmId === route.osmId);
    if (matches.length !== 1) fail();
    const way = matches[0], coordinates = way.geometry?.coordinates, nodes = way.properties.nodeIds;
    if (way.properties.targetId !== route.targetId || way.geometry?.type !== 'LineString' || !Array.isArray(coordinates) || !Array.isArray(nodes) || nodes.length !== coordinates.length || !coordinates.every(p => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite) && Math.abs(p[0]) <= 180 && Math.abs(p[1]) <= 90)) fail();
    const junctionIndex = nodes.indexOf(JUNCTION);
    if (junctionIndex < 0) fail();
    return coordinates.slice(junctionIndex);
  });
  if (!ways[0][0].every((value, index) => value === ways[1][0][index])) fail();
  return ways.map(coordinates => {
    const cumulative = [0];
    for (let i = 1; i < coordinates.length; i++) cumulative.push(cumulative.at(-1) + lineLength([coordinates[i - 1], coordinates[i]]));
    if (cumulative.at(-1) < HALF_DISTANCE + STEP) fail();
    return {coordinates, cumulative};
  });
}

function pointAt(line, distance) {
  const end = line.cumulative.findIndex(length => length > distance);
  const start = end - 1;
  const ratio = (distance - line.cumulative[start]) / (line.cumulative[end] - line.cumulative[start]);
  return line.coordinates[start].map((value, axis) => value + (line.coordinates[end][axis] - value) * ratio);
}

function bearing(a, b) {
  const longitude = (b[0] - a[0]) * RAD;
  const lat1 = a[1] * RAD, lat2 = b[1] * RAD;
  const east = Math.sin(longitude) * Math.cos(lat2);
  const north = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(longitude);
  return (Math.atan2(east, north) / RAD + 360) % 360;
}

/**
 * Synthetic positions interpolated only along two public OpenStreetMap ways.
 * This is a playback fixture, not a real GPS recording or field validation.
 * Source node order is reversed on Lomo Vetado to approach the shared node;
 * this choice does not assert a permitted riding direction.
 */
export function createPublicDemo(geo, {startTime = Date.now()} = {}) {
  if (!Number.isFinite(startTime)) throw new Error('El tiempo inicial de la demo debe ser un timestamp finito.');
  const lines = sourceLines(geo);
  const position = progress => pointAt(lines[progress < 0 ? 0 : 1], Math.abs(progress));
  const fixes = Array.from({length: HALF_DISTANCE * 2 / STEP + 1}, (_, index) => {
    const progress = index * STEP - HALF_DISTANCE;
    const [longitude, latitude] = position(progress);
    // Sparse deterministic 1.2 m eastward noise affects fixes, never source geometry.
    const eastNoise = index % 5 === 2 ? 1.2 : 0;
    return {
      longitude: longitude + eastNoise / (RADIUS * RAD * Math.cos(latitude * RAD)),
      latitude,
      accuracy: 4 + index % 3,
      timestamp: startTime + index * INTERVAL,
      heading: bearing([longitude, latitude], position(progress + 0.5)),
      speed: STEP / (INTERVAL / 1000),
      stage: progress < -16 ? 'approach' : progress > 16 ? 'exit' : 'junction'
    };
  });
  return {
    name: 'Posición simulada · Lomo Vetado → Calibre 12',
    description: 'Posición simulada sobre cartografía pública OpenStreetMap; no es un registro GPS real y no representa validación de campo.',
    source: 'OpenStreetMap',
    simulated: true,
    fixes,
    routeIds: ROUTES.map(route => route.targetId),
    junctionNodeId: JUNCTION,
    sourceWayIds: ROUTES.map(route => route.osmId)
  };
}
