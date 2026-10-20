// This viewer uses raster/PDF-page pixels only. It has no geographic transform.
import {fitView, zoomView, panView} from '../review/geometry.mjs';

const positive = value => Number.isFinite(value) && value > 0;
const validPoint = point => point && [point.x, point.y].every(Number.isFinite);
const validRect = rect => validPoint(rect) && positive(rect.width) && positive(rect.height);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function fitDocumentView(rect, viewport) {
  if (!validRect(rect) || !positive(viewport?.width) || !positive(viewport?.height)) {
    throw new Error('Encuadre del documento inválido.');
  }
  const scale = Math.max(rect.width / viewport.width, rect.height / viewport.height);
  const width = viewport.width * scale, height = viewport.height * scale;
  return {x: rect.x + (rect.width - width) / 2, y: rect.y + (rect.height - height) / 2, width, height};
}

// Both points use the current document frame. A pinch may also move its midpoint.
export function applyDocumentGesture(view, from, to, factor = 1) {
  if (!validRect(view) || !validPoint(from) || !validPoint(to)) {
    throw new Error('Gesto del documento inválido.');
  }
  return panView(zoomView(view, factor, from), (from.x - to.x) * factor, (from.y - to.y) * factor);
}

export function constrainDocumentView(view, image, {minWidth = image?.width / 64, maxWidth = image?.width} = {}) {
  if (!validRect(view) || !positive(image?.width) || !positive(image?.height)
      || !positive(minWidth) || !positive(maxWidth) || minWidth > maxWidth) {
    throw new Error('Límites del documento inválidos.');
  }
  const width = clamp(view.width, minWidth, maxWidth);
  const next = zoomView(view, width / view.width);
  return {
    ...next,
    x: next.width >= image.width ? (image.width - next.width) / 2 : clamp(next.x, 0, image.width - next.width),
    y: next.height >= image.height ? (image.height - next.height) / 2 : clamp(next.y, 0, image.height - next.height),
  };
}

export function setupOfficialDocument({imageUrl, width, height, initialView, pdfUrl}) {
  const full = fitView(width, height);
  if (typeof imageUrl !== 'string' || !imageUrl || typeof pdfUrl !== 'string' || !pdfUrl
      || (initialView !== undefined && !validRect(initialView))) {
    throw new Error('Fuente del documento inválida.');
  }
  const area = initialView ? {...initialView} : full;
  const get = id => {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Falta el control del documento: ${id}.`);
    return element;
  };
  const dialog = get('official-dialog'), stage = get('document-stage'), svg = get('document-svg');
  const artwork = get('document-image'), status = get('document-status'), closeButton = get('official-close');
  const out = get('document-out'), into = get('document-in'), fit = get('document-fit'), map = get('document-map');
  get('document-pdf').href = pdfUrl;
  artwork.setAttribute('x', '0'); artwork.setAttribute('y', '0');
  artwork.setAttribute('width', String(width)); artwork.setAttribute('height', String(height));
  artwork.style.pointerEvents = 'none';
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('tabindex', '0');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Mapa oficial de Parquemet, ampliable. Usa las flechas para desplazar y los signos más y menos para ampliar.');
  svg.setAttribute('aria-describedby', 'document-status');
  // Also enforce this on the input surface, independently of page layout CSS.
  stage.style.touchAction = 'none';
  const controller = new AbortController(), options = {signal: controller.signal};
  const pointers = new Map();
  let view = {...full}, viewport = null, loadState = 'loading', destroyed = false, returnFocus = null;

  const measure = () => {
    const rect = svg.getBoundingClientRect();
    return {width: rect.width || width, height: rect.height || height};
  };
  const maximumWidth = () => fitDocumentView(full, viewport || measure()).width;
  const limits = () => ({minWidth: width / 64, maxWidth: maximumWidth()});
  const updateStatus = () => {
    let message;
    if (loadState === 'error') message = 'No se pudo cargar el mapa. Abre el PDF oficial para consultarlo.';
    else if (loadState === 'loading') message = 'Cargando mapa oficial…';
    else message = `Mapa esquemático · zoom ${Math.round(maximumWidth() / view.width * 100)} % · arrastra o pellizca para explorar.`;
    if (status.textContent !== message) status.textContent = message;
    out.disabled = view.width >= maximumWidth() - 0.01;
    into.disabled = view.width <= width / 64 + 0.01;
  };
  const draw = next => {
    view = constrainDocumentView(next, {width, height}, limits());
    svg.setAttribute('viewBox', `${view.x} ${view.y} ${view.width} ${view.height}`);
    updateStatus();
  };
  const showArea = rect => {
    viewport = measure();
    draw(fitDocumentView(rect, viewport));
  };
  const point = ({x, y}) => {
    const matrix = svg.getScreenCTM();
    if (matrix) {
      const p = svg.createSVGPoint(); p.x = x; p.y = y;
      const world = p.matrixTransform(matrix.inverse());
      return {x: world.x, y: world.y};
    }
    const rect = svg.getBoundingClientRect();
    return {x: view.x + (x - rect.left) / (rect.width || 1) * view.width,
      y: view.y + (y - rect.top) / (rect.height || 1) * view.height};
  };
  const zoom = (factor, anchor = {x: view.x + view.width / 2, y: view.y + view.height / 2}) => {
    const bounded = clamp(view.width * factor, width / 64, maximumWidth()) / view.width;
    draw(zoomView(view, bounded, anchor));
  };
  const gesture = () => {
    const [a, b] = [...pointers.values()];
    return b ? {x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, distance: Math.hypot(a.x - b.x, a.y - b.y)}
      : {...a, distance: 0};
  };
  const clearPointers = () => {
    for (const id of pointers.keys()) {
      if (stage.hasPointerCapture?.(id)) stage.releasePointerCapture(id);
    }
    pointers.clear();
    stage.classList.remove('dragging');
  };
  const close = () => { clearPointers(); if (dialog.open) dialog.close(); };
  closeButton.addEventListener('click', close, options);
  out.addEventListener('click', () => zoom(1.5), options);
  into.addEventListener('click', () => zoom(1 / 1.5), options);
  fit.addEventListener('click', () => showArea(full), options);
  map.addEventListener('click', () => showArea(area), options);
  artwork.addEventListener('load', () => {loadState = 'ready'; updateStatus();}, options);
  artwork.addEventListener('error', () => {loadState = 'error'; updateStatus();}, options);
  artwork.setAttribute('href', imageUrl);
  stage.addEventListener('pointerdown', event => {
    if (!dialog.open || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.preventDefault();
    pointers.set(event.pointerId, {x: event.clientX, y: event.clientY});
    stage.setPointerCapture(event.pointerId);
    stage.classList.add('dragging');
  }, options);
  stage.addEventListener('pointermove', event => {
    if (!pointers.has(event.pointerId)) return;
    event.preventDefault();
    const before = gesture();
    pointers.set(event.pointerId, {x: event.clientX, y: event.clientY});
    const after = gesture();
    const raw = before.distance > 0 && after.distance > 0 ? before.distance / after.distance : 1;
    const factor = clamp(view.width * raw, width / 64, maximumWidth()) / view.width;
    draw(applyDocumentGesture(view, point(before), point(after), factor));
  }, options);
  const releasePointer = event => {
    pointers.delete(event.pointerId);
    if (stage.hasPointerCapture?.(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    if (!pointers.size) stage.classList.remove('dragging');
  };
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) stage.addEventListener(name, releasePointer, options);
  stage.addEventListener('wheel', event => {
    if (!dialog.open) return;
    event.preventDefault();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.height : 1);
    zoom(Math.exp(clamp(delta * 0.0015, -1, 1)), point({x: event.clientX, y: event.clientY}));
  }, {...options, passive: false});
  stage.addEventListener('dblclick', event => {
    event.preventDefault(); zoom(0.5, point({x: event.clientX, y: event.clientY}));
  }, options);
  dialog.addEventListener('keydown', event => {
    if (!dialog.open || event.altKey || event.metaKey || event.ctrlKey) return;
    const actions = {
      '+': () => zoom(1 / 1.5), '=': () => zoom(1 / 1.5), '-': () => zoom(1.5),
      '0': () => showArea(full), Home: () => showArea(area),
      ArrowLeft: () => draw(panView(view, -view.width * 0.12, 0)),
      ArrowRight: () => draw(panView(view, view.width * 0.12, 0)),
      ArrowUp: () => draw(panView(view, 0, -view.height * 0.12)),
      ArrowDown: () => draw(panView(view, 0, view.height * 0.12)),
    };
    if (actions[event.key]) {event.preventDefault(); actions[event.key]();}
  }, options);
  dialog.addEventListener('close', () => {
    clearPointers();
    if (returnFocus?.isConnected) returnFocus.focus({preventScroll: true});
    returnFocus = null;
  }, options);
  const observer = new ResizeObserver(() => {
    if (!dialog.open || !viewport) return;
    const next = measure();
    if (next.width === viewport.width && next.height === viewport.height) return;
    const scale = view.width / viewport.width;
    const resized = {x: view.x + view.width / 2 - next.width * scale / 2,
      y: view.y + view.height / 2 - next.height * scale / 2, width: next.width * scale, height: next.height * scale};
    viewport = next;
    draw(resized);
  });
  observer.observe(stage);
  draw(full);
  return {
    open(rect = area) {
      if (destroyed) throw new Error('El visor del documento está cerrado definitivamente.');
      if (!validRect(rect)) throw new Error('Encuadre del documento inválido.');
      if (!dialog.open) {returnFocus = document.activeElement; dialog.showModal();}
      showArea(rect);
      closeButton.focus({preventScroll: true});
    },
    close,
    destroy() {close(); observer.disconnect(); controller.abort(); destroyed = true;},
  };
}
