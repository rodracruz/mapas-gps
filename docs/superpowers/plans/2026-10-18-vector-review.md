# Primer hito de revisión vectorial — plan de implementación

> Ejecución nativa mediante superpowers:executing-plans; investigación geográfica independiente en paralelo. El usuario autorizó el alcance y pidió ejecutar sin otra aprobación.

**Goal:** revisar Starwars, La Virgen y Lomo Vetado contra la fotografía existente, sin inventar geometría ni georreferenciación.
**Architecture:** página aditiva `revision.html`, SVG único con imagen y polilíneas en coordenadas de píxel. Datos JSON editables separan fragmentos visibles, huecos y referencias geográficas. Ninguna migración de almacenamiento.
**Tech Stack:** HTML/CSS/ES modules sin dependencia de ejecución, Node test runner y Playwright para pruebas.
**Spec:** solicitud del usuario en esta sesión, recogida en `docs/evidence/primer-hito.md`.

## Restricciones globales
- Fuente original de 900 × 1100 píxeles, sin rectificación ni ampliación generativa; conservar bytes originales.
- No usar geometría de `visor-vectorial.html`, coordenadas heredadas ni exportación GeoJSON en este hito.
- No unir huecos, cruces o proximidades. Separar dibujo, geografía y correspondencias estables.
- No modificar base de datos, app actual ni service worker. No publicar main ni datos privados.

## Foco de revisión
- Recursos ausentes o JSON malformado: mostrar error útil, sin plano parcial engañoso.
- Cambio de tamaño y letterboxing: imagen y trazado deben compartir transformación.
- Gestos táctiles y selección: arrastrar no debe seleccionar accidentalmente; cancelación segura.
- Huecos por texto/iconos: no dibujar supuestos enlaces ni medir distancias de terreno.
- Regresión: fotos, calibraciones y banderas de instalación originales intactas.

## Tarea 1: evidencia y geometría
Files: `data/el-durazno/visual-trails.json`, `docs/evidence/primer-hito.md`, `scripts/trace-trails.py`, `tests/data.test.mjs`.
Interfaces: JSON `coordinateSystem: image-pixels`, `image {width,height,sha256,url}`, `trails[]`, `segments[]`, `gaps[]`, `nodes[]`, `connections: []`, `geographicCorrespondences: []`.
- [x] Inspeccionar original y rótulos, buscar edición oficial.
- [x] Escribir prueba de fuente, límites, IDs y fragmentos separados; ejecutar RED.
- [x] Digitalizar curvas visibles con puntos de apoyo inspeccionados y tolerancia explícita; ejecutar GREEN.
- [x] Documentar rótulos, incertidumbres y decisiones.

## Tarea 2: visor y transformaciones
Files: `revision.html`, `review/viewer.js`, `review/geometry.mjs`, `review/style.css`, `tests/geometry.test.mjs`, `tests/viewer.test.mjs`, `package.json`.
Interfaces: `validateDataset(data)`, `fitView(width,height)`, `zoomView(view,factor,anchor)`, `panView(view,dx,dy)`, SVG viewBox compartido.
- [x] Escribir pruebas de coordenadas, zoom anclado y carga; ejecutar RED.
- [x] Implementar foto, superposición, solo vectores, opacidad, capas, selección, zoom/pan táctil y descarga JSON.
- [x] Probar errores, gestos y conservación de almacenamiento con navegador real; ejecutar GREEN.

## Tarea 3: revisión y entrega
Files: `docs/evidence/geographic-references.md`, `data/el-durazno/geographic-references.json`, `docs/evidence/verification.md`, `docs/evidence/screenshots/*`, `README.md`.
- [x] Contrastar fuentes geográficas con identificadores y fecha; declarar falta de ajuste independiente si corresponde.
- [x] Revisar visualmente capturas originales/superpuestas por sendero y móvil.
- [x] Ejecutar suite completa y revisión independiente; corregir fallos importantes con pruebas.
- [x] Mantener servidor HTTP local, comprobar respuesta y entregar paquete ejecutable, sin publicar main.


## Cierre de ejecución
- Tarea 1 completa: fuentes inspeccionadas, PDF oficial contrastado visualmente, geometría generada; pruebas de datos RED→GREEN. Se sustituyó la digitalización manual por extracción asistida desde contornos oficiales y centrado sobre la foto al encontrar la mejor fuente; el límite de fidelidad queda documentado.
- Tarea 2 completa: visor estático independiente; matemáticas y validación RED→GREEN; 12 comprobaciones de navegador.
- Tarea 3 completa: referencias, capturas, HTML autónomo, pruebas offline y revisión independiente.
- La revisión detectó omisión del hash sin SubtleCrypto. Se reprodujo con JPEG válido de bytes cambiados (RED), se añadió SHA local y pasaron regresión y suite (GREEN).
- Se conserva rama y worktree, como pidió el usuario; sin merge, push ni publicación. El servidor de QA es local del entorno y la entrega portable no depende de su persistencia.
