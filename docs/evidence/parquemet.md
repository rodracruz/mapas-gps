# Parquemet como segundo parque

2026-10-20. Basefa298ab, rama `feat/parquemet-second-park`, worktree aislado `parquemet`. Fuente elegida por el usuario: [MapaParque.pdf](https://mapas.parquemet.cl/doc/MapaParque.pdf). No se fusiona a main ni se modifica GitHub Pages o los mapas/calibraciones guardados.

## Flujo implementado

El selector ofrece El Durazno y Parquemet. Elegir Parquemet abre su página independiente dentro de la app: mapa oficial, servicios documentados, dos avenidas de referencia y ocho fichas de senderos ciclistas de esta edición. Las fichas y la tarjeta de mapa conservan176px cerradas. Longitud publicada en PDF y suma de geometría OSM importada se identifican por separado. No se inventan dificultad, desnivel o velocidad registrada.

La página usa `geographic/park-viewer.mjs`, basado en el catálogo de la entrada elegida del directorio común `data/parks.json`. Nuevos parques pueden usar este controlador con su registro/catálogo/documento, sin copiar sus datos a El Durazno. Se conserva el controlador anterior de El Durazno para evitar cambios en sus capas revisadas. El nuevo build produce una página hermana autónoma y un índice compartido, sin iframes ni widget de otro mapa.

El PDF original765376bytes se conserva intacto; el render completo6690×2835 no modifica curvas, rótulos, cruces o puntos. En teléfono vertical abre un recorte central del área cartográfica para evitar presentar el panorama diminuto con grandes márgenes. Es un encuadre de cámara: arrastrar/pellizcar, Ver completo y Área del mapa permiten recorrer toda la fuente, incluida su leyenda y tabla lateral. En horizontal se ajusta al área panorámica. No se realiza una transformación geográfica del dibujo. [Método y metadatos](parquemet-official-document.md), [captura móvil](parquemet/official-mobile.png), [horizontal](parquemet/official-landscape.png).

Mapa de senderos abre una instancia Leaflet mundial con geometría geográfica OSM. Seleccionar un trazado lo encuadra y muestra su ficha inferior. El panel GPS inactivo se oculta mientras esa ficha está abierta para conservar espacio al mapa; cerrar la ficha permite activarlo. El seguimiento activo sigue visible. Las líneas con restricciones explícitas se dibujan discontinuas y su ficha advierte la restricción por tramo. Las variantes de nombre pendientes se pueden inspeccionar como contexto OSM, sin asignarlas a otro sendero. [Parque](parquemet/park-mobile.png), [selección](parquemet/map-mobile.png).

## Correspondencias y límites

33 vías y1260nodos OSM. Seis senderos nominales contrastados: Centenario,4½,Anfiteatro,La S,Torre5,Pirámide; avenidas Pedro Bannen y Alberto Mackenna como referencias principales. Zorzal y Pa’ arriba permanecen pendientes de atribución frente a las variantes literales OSM El Zorzal/Pa' Arriba. Se conservan esas dos vías como contexto. Algunas extensiones OSM difieren significativamente de las longitudes publicadas en el PDF; no se recortan ni se unen vías para forzar equivalencia. [Referencias por ID, fecha, discrepancias y consultas](parquemet-geographic.md).

GPS es opt-in, experimental, sólo sobre30 vías nominales compatibles después de excluir prohibiciones explícitas. No ajusta posiciones al PDF. No se ofrece la demo específica Lomo→Calibre de otro parque. No se guardan posiciones o recorridos ni se suben trazas a un backend propio; el fondo OSM carga teselas del área visible y puede revelar esa área al proveedor, según aviso previo. Cerrar/salir/cambiar parque detiene la sesión. Ausencia de una etiqueta restrictiva no demuestra acceso físico actual ni sentido permitido.

## Verificación ejecutada

- Baseline80/80 antes de modificar. Suite final `npm test`:94/94; incluye fuentes, metadatos, directorio, geometría del documento, restricciones, motor GPS anterior y build de ambas páginas con bytes OSM exactos.
- `test:parquemet`: flujo real Chromium móvil390×844 y844×390, selector2parques, datos independientes, fichas176px, imagen6690px, longitudes con fuente, fondo OSM real, selección y retorno a El Durazno sin nombres mezclados.
- Cuatro grupos adversos: pinch/drag/orientación del documento; snapshot alterado rechazado conservando PDF; GPS nativo con permiso y posición pública emulada, demo ajena ausente y cancelación al cerrar; deep links source/standalone conservando mapa=1 y limpieza de chip al seleccionar contexto.
- El mismo flujo de ambos parques se ejecutó en standalone. El build incluye fuente de alta resolución/PDF intacto y los datos geográficos embebidos de cada página.
- Regresiones El Durazno:9/9 de flujo móvil,9/9 de aceptación geográfica con teselas reales y biblioteca anterior bajo SW activo conservando Blob/calibración/trails/webCenter/almacenes. GPS38/38 pruebas motor+demo y prueba integrada de adquisición/transición, señal antigua, permisos, standalone y cancelación.
- Revisión independiente: corregidos deep links cruzados que perdían mapa=1 y chip anterior retenido al seleccionar contexto. Revalidación source/bundle/cambio de hash/GPS sin hallazgos pendientes.

Se usó Chromium con emulación táctil y posiciones públicas sintéticas, no un teléfono físico ni una salida en bicicleta. No se validaron sobre terreno los senderos, restricciones actuales, servicios o sentidos; no se implementan navegación, loops o distancias restantes. El PDF no muestra fecha de edición: sus metadatos de creación2022/modificación2023 no prueban vigencia actual.

## Reproducir

```sh
npm ci
npm test
python3 scripts/build-geographic-standalone.py --reference-photo /ruta/privada/81184.jpg
python3 -m http.server 4177 --bind 0.0.0.0
# En otra terminal:
GEOGRAPHIC_BASE_URL=http://127.0.0.1:4177 npm run test:parquemet
PARK_ENTRY=/dist/index.html GEOGRAPHIC_BASE_URL=http://127.0.0.1:4177 node tests/parquemet-browser.mjs
```

Source: `http://127.0.0.1:4177/mapa-geografico.html`; bundle: `http://127.0.0.1:4177/dist/index.html`. Son URLs locales de la máquina que sirve la app. La publicación privada usa la misma URL alojada del proyecto; su comprobación se registra por separado. El adjunto original de El Durazno y dist/ siguen fuera de Git público; el PDF elegido y su render provienen de la URL pública identificada y conservan atribución al operador.
