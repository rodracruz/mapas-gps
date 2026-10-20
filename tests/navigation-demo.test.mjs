import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fromOsmSnapshot} from '../geographic/data.mjs';

const api = await import('../navigation/demo.mjs').catch(() => ({}));
const sourceUrl = new URL('../sources/el-durazno-osm.json', import.meta.url);
const catalogUrl = new URL('../data/el-durazno/geographic-catalog.json', import.meta.url);
const sourceText = await readFile(sourceUrl, 'utf8');
const catalogText = await readFile(catalogUrl, 'utf8');
const source = JSON.parse(sourceText);
const catalog = JSON.parse(catalogText);
const START = 1_800_000_000_000;

function demo(geo = fromOsmSnapshot(source, catalog), options = {startTime: START}) {
  assert.equal(typeof api.createPublicDemo, 'function', 'public OSM demo generator is available');
  return api.createPublicDemo(geo, options);
}

function freeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

// Independent local metric projection checks proximity to the original OSM
// segments; it does not import geometry helpers from the demo or the matcher.
function metres([longitude, latitude], origin) {
  const radians = Math.PI / 180;
  const radius = 6_371_008.8;
  return [
    (longitude - origin[0]) * radians * radius * Math.cos(origin[1] * radians),
    (latitude - origin[1]) * radians * radius
  ];
}

function distance(a, b) {
  const [east, north] = metres(a, b);
  return Math.hypot(east, north);
}

function distanceToWay(fix, feature) {
  const origin = [fix.longitude, fix.latitude];
  const points = feature.geometry.coordinates.map(point => metres(point, origin));
  return Math.min(...points.slice(1).map((b, index) => {
    const a = points[index];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const t = Math.max(0, Math.min(1, -(a[0] * dx + a[1] * dy) / (dx * dx + dy * dy)));
    return Math.hypot(a[0] + t * dx, a[1] + t * dy);
  }));
}

test('public demo identifies the source and explicitly labels positions as simulated', () => {
  const result = demo();
  assert.equal(result.source, 'OpenStreetMap');
  assert.equal(result.simulated, true);
  assert.match(result.name, /simulad/i);
  assert.match(result.name, /Lomo Vetado.*Calibre 12/);
  assert.match(result.description, /no .*registro GPS real/i);
  assert.match(result.description, /no .*validaci.n de campo/i);
  assert.deepEqual(result.routeIds, ['lomo-vetado', 'calibre-12']);
  assert.deepEqual(result.sourceWayIds, [477170097, 1003300258]);
});

test('demo crosses a verified shared public OSM node between the two identified ways', () => {
  const geo = fromOsmSnapshot(source, catalog);
  const result = demo(geo);
  assert.equal(result.junctionNodeId, 4705609090);
  const ways = result.sourceWayIds.map(id => geo.features.find(f => f.properties.osmId === id));
  assert.deepEqual(ways.map(f => f.properties.targetId), result.routeIds);
  const junctions = ways.map(f => f.geometry.coordinates[f.properties.nodeIds.indexOf(result.junctionNodeId)]);
  assert.ok(junctions.every(Boolean));
  assert.deepEqual(junctions[0], junctions[1]);
  assert.deepEqual(junctions[0], [-70.4928546, -33.3043399]);
  assert.ok(result.fixes.some(f => f.stage === 'junction' && distance([f.longitude, f.latitude], junctions[0]) < 0.01));
});

test('every simulated position follows its real source way, with only small disclosed metric GPS noise', () => {
  const geo = fromOsmSnapshot(source, catalog);
  const result = demo(geo);
  const lomo = geo.features.find(f => f.properties.osmId === 477170097);
  const calibre = geo.features.find(f => f.properties.osmId === 1003300258);
  const offsets = result.fixes.map(fix => {
    const features = fix.stage === 'approach' ? [lomo] : fix.stage === 'exit' ? [calibre] : [lomo, calibre];
    const offset = Math.min(...features.map(feature => distanceToWay(fix, feature)));
    assert.ok(offset < 2.01, `${fix.stage} is ${offset.toFixed(2)} m away from its source`);
    return offset;
  });
  assert.ok(offsets.some(offset => offset > 0.5), 'some fixes include metre-scale GPS noise');
  assert.ok(offsets.filter(offset => offset < 0.01).length > result.fixes.length / 2, 'most fixes lie on source segments');
  assert.ok(distanceToWay(result.fixes[0], calibre) > 50, 'initial acquisition is distinguishable from Calibre 12');
  assert.ok(distanceToWay(result.fixes.at(-1), lomo) > 50, 'exit is distinguishable from Lomo Vetado');
});

test('demo gives a short monotonic approach, junction and exit sequence at realistic fix intervals', () => {
  const {fixes} = demo();
  assert.ok(fixes.length >= 30 && fixes.length <= 50);
  assert.equal(fixes[0].timestamp, START);
  assert.deepEqual([...new Set(fixes.map(fix => fix.stage))], ['approach', 'junction', 'exit']);
  assert.ok(fixes.filter(fix => fix.stage === 'approach').length >= 12);
  assert.ok(fixes.filter(fix => fix.stage === 'exit').length >= 12);
  for (const [index, fix] of fixes.entries()) {
    for (const key of ['longitude', 'latitude', 'accuracy', 'timestamp', 'heading', 'speed']) assert.ok(Number.isFinite(fix[key]), key);
    assert.ok(fix.accuracy >= 4 && fix.accuracy <= 6);
    assert.ok(fix.heading >= 0 && fix.heading < 360);
    assert.ok(fix.speed >= 3 && fix.speed <= 6);
    assert.ok(fix.longitude < -70 && fix.longitude > -71);
    assert.ok(fix.latitude < -33 && fix.latitude > -34);
    if (!index) continue;
    const previous = fixes[index - 1];
    assert.ok(fix.timestamp - previous.timestamp >= 1500 && fix.timestamp - previous.timestamp <= 2000);
    const step = distance([fix.longitude, fix.latitude], [previous.longitude, previous.latitude]);
    assert.ok(step >= 6 && step <= 10, `position ${index} step is ${step.toFixed(2)} m`);
  }
  assert.ok(fixes.length * 400 >= 16_000 && fixes.length * 400 <= 20_000);
});

test('demo is reproducible and never changes the source snapshot, catalog or converted geometry', async () => {
  const frozenSource = freeze(JSON.parse(sourceText));
  const frozenCatalog = freeze(JSON.parse(catalogText));
  const geo = freeze(fromOsmSnapshot(frozenSource, frozenCatalog));
  const before = JSON.stringify(geo);
  const first = demo(geo);
  assert.deepEqual(first, demo(geo));
  assert.equal(JSON.stringify(geo), before);
  assert.equal(JSON.stringify(frozenSource), JSON.stringify(source));
  assert.equal(JSON.stringify(frozenCatalog), JSON.stringify(catalog));
  assert.equal(await readFile(sourceUrl, 'utf8'), sourceText);
  assert.equal(await readFile(catalogUrl, 'utf8'), catalogText);
  const later = demo(geo, {startTime: START + 60_000});
  assert.deepEqual(later.fixes.map(f => ({...f, timestamp: f.timestamp - 60_000})), first.fixes);
});

test('demo refuses missing public geometry, invalid provenance and a disconnected junction', () => {
  assert.equal(typeof api.createPublicDemo, 'function', 'public OSM demo generator is available');
  for (const change of [
    geo => { geo.metadata.source = 'private GPS'; },
    geo => { geo.metadata.coordinateSystem = 'image-pixels'; },
    geo => { geo.features = geo.features.filter(f => f.properties.targetId !== 'lomo-vetado'); },
    geo => { geo.features.find(f => f.properties.targetId === 'calibre-12').properties.nodeIds[0] = 123; },
    geo => { geo.features.find(f => f.properties.targetId === 'calibre-12').geometry.coordinates[0][0] += 0.001; }
  ]) {
    const geo = fromOsmSnapshot(JSON.parse(sourceText), JSON.parse(catalogText));
    change(geo);
    assert.throws(() => demo(geo), /OSM|OpenStreetMap|geogr|nodo|fuente/i);
  }
  assert.throws(() => demo(undefined, {startTime: NaN}), /tiempo|timestamp|fecha/i);
});
