import test from 'node:test';
import assert from 'node:assert/strict';

const api = await import('../geographic/document.mjs').catch(() => ({}));
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);

test('document fitting contains the requested area without distortion in portrait and landscape', () => {
  assert.equal(typeof api.fitDocumentView, 'function');
  const area = {x: 120, y: 40, width: 5600, height: 2080};
  for (const viewport of [{width: 390, height: 650}, {width: 1280, height: 600}]) {
    const view = api.fitDocumentView(area, viewport);
    close(view.width / view.height, viewport.width / viewport.height);
    close(view.x + view.width / 2, area.x + area.width / 2);
    close(view.y + view.height / 2, area.y + area.height / 2);
    assert.ok(view.x <= area.x && view.y <= area.y);
    assert.ok(view.x + view.width >= area.x + area.width);
    assert.ok(view.y + view.height >= area.y + area.height);
  }
  assert.throws(() => api.fitDocumentView(area, {width: 0, height: 600}));
});

test('a simultaneous pinch and drag keeps the touched document point under the moving fingers', () => {
  assert.equal(typeof api.applyDocumentGesture, 'function');
  const view = {x: 180, y: 80, width: 900, height: 600};
  const from = {x: 420, y: 250}, to = {x: 480, y: 290};
  for (const factor of [0.4, 1, 1.7]) {
    const next = api.applyDocumentGesture(view, from, to, factor);
    close((from.x - next.x) / next.width, (to.x - view.x) / view.width);
    close((from.y - next.y) / next.height, (to.y - view.y) / view.height);
    close(next.width / next.height, view.width / view.height);
  }
  const dragged = api.applyDocumentGesture(view, from, to);
  close(dragged.x, 120);
  close(dragged.y, 40);
});

test('document limits keep the source reachable after extreme pan and zoom gestures', () => {
  assert.equal(typeof api.constrainDocumentView, 'function');
  const image = {width: 6690, height: 2835};
  for (const candidate of [
    {x: -1e8, y: 1e8, width: 900, height: 600},
    {x: 1e8, y: -1e8, width: 900, height: 600},
    {x: -1e8, y: 1e8, width: 0.01, height: 0.02},
    {x: 1e8, y: -1e8, width: 1e8, height: 2e8},
  ]) {
    const view = api.constrainDocumentView(candidate, image, {minWidth: 120, maxWidth: 7000});
    assert.ok(view.width >= 120 && view.width <= 7000);
    close(view.width / view.height, candidate.width / candidate.height);
    for (const [start, size, extent] of [[view.x, view.width, image.width], [view.y, view.height, image.height]]) {
      if (size <= extent) assert.ok(start >= 0 && start + size <= extent);
      else close(start + size / 2, extent / 2);
    }
  }
  assert.throws(() => api.constrainDocumentView({x: 0, y: 0, width: NaN, height: 10}, image));
});
