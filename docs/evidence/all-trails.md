# Veinte senderos del cartel y fotografía principal

Entrega 18-10-2026 (America/Santiago; ejecución19UTC), rama `feat/all-trails-from-sign`, sobre `156a270`. Conserva `main`, GitHub Pages y los mapas personales. La vista privada usa la fotografía completa del usuario en la pantalla principal del parque y permite abrirla. La foto no se incorpora al repositorio público: el constructor sólo la incluye en `dist/` ignorado cuando recibe `--reference-photo`.

## Qué se reconstruyó

Los20 nombres de la leyenda tienen ficha y geometría visual: Chilling, Papaya, La Virgen, Parcero, Skills, Mampato, Starwars, Cactus, Lomo Vetado, La Bala, Cebolla, Los Saltos, El Gringo, El Duro, XL, Rock N’Roll, Las Nieves, Calibre12, Calibre Loco y Mordor. Además se muestran Subida y Subida E-Bike como capas auxiliares. No se equipara la Subida del dibujo a la vía OSM Subida Buitrera.

Datos: `data/el-durazno/all-visual-trails.json`, SHA-256 `f68ae492e04724e2cbad56a3bf64910868c237a486a4576b6c48fb0f526d1368`. Son **104 fragmentos,72.831 vértices y164 zonas pendientes**. Cada fragmento conserva extremos distintos. Cero conexiones, correspondencias geográficas y transformaciones GPS. Los trazados antiguos de `visor-vectorial.html` no se utilizan.

Las líneas verdes punteadas de conexión y las conexiones rojas para expertos no se convierten en senderos transitables. Los20 senderos tienen fragmentos visibles, pero no se presenta como reconstruido lo que cubren placas, iconos, flechas o símbolos. Chilling y Los Saltos conservan fragmentos cortos porque sus rótulos ocultan una proporción grande del eje impreso. La continuidad del PDF bajo una placa no acredita la parte oculta de la foto.

## Fuentes y coordenadas

Se inspeccionaron la foto privada original960×1280, el recorte público900×1100, el JPG oficial2570×3077 y el PDF vectorial oficial de2022. El [JPG](https://www.outlife.cl/wp-content/uploads/2020/07/Mapa_El-Durazno-2022_web_Mesa-de-trabajo-1.jpg) y el [PDF](https://www.outlife.cl/wp-content/uploads/2023/04/Mapa_El-Durazno-2022_web.pdf) muestran rótulos y disposición concordantes con la foto. La edición exacta de la foto no está demostrada. URL y huellas están en el dataset y [auditoría](all-trails/review-evidence.json).

Este nuevo plano usa **píxeles nativos del JPG oficial2570×3077**, con origen arriba a la izquierda e identidad `[1,0,0,1,0,0]`. Raster y vectores comparten el mismo SVG y `viewBox`, también al acercar y desplazar. La foto privada completa se muestra por separado; no se usa como fondo con coordenadas incompatibles. La revisión anterior de tres senderos conserva sus propias coordenadas900×1100 sin modificación. No se rectificó perspectiva ni se aplicó transformación geográfica.

El script identifica dibujos vectoriales por índice y rótulo realmente inspeccionado. Extrae ejes de los contornos rellenos rasterizados a4×; Skills procede de un trazo cúbico auténtico. Respeta el orden de impresión del PDF para excluir lo tapado. Los contornos ocultos no se publican como tramos visibles. Las muestras que quedan a ambos lados de una máscara se exportan como fragmentos independientes.

No hay simplificación: tolerancia0px. La cuadrícula de extracción es0,25px; la arista máxima exportada mide0,354px. Es menor que el grosor de las líneas impresas y evita que el muestreo sustituya curvas por atajos. La estabilidad frente a extracción8× da una diferencia máxima0,319px. Esto mide estabilidad de extracción, **no** exactitud geográfica ni una garantía absoluta de error del eje menor a1px. Una revisión independiente sitúa todos los vértices sobre tinta de color compatible o a≤1,42px; coincidencia cromática por sí sola no demuestra identidad semántica.

## Revisión y pruebas

Se inspeccionaron overlay general y atlas de rótulos, junto con ampliaciones independientes de Los Saltos, Skills, Parcero, Papaya, Mampato, La Bala y Chilling. Mantienen curvas, codos y terminales separados. [Comparación general](all-trails/all-trails-overlay.png), [rótulos](all-trails/review-label-plate-atlas.png), [contornos por sendero](all-trails/path-atlas.jpg). Los artefactos corresponden a fuentes públicas; no contienen la foto privada.

La regeneración produce bytes idénticos. Auditoría estricta:667.118 pares arista/hueco, cero cruces. Se conservan [métricas](all-trails/extraction-audit.json), [estabilidad](all-trails/resolution-check.json), [huecos](all-trails/edge-mask-check.json) y [reproducibilidad](all-trails/reproducibility-check.json).

Pruebas ejecutadas:39 unitarias;9 del flujo móvil;9 de aceptación (teselas OSM reales, toque sobre línea, pinch, mapa mundial, paisaje, fuentes ausentes/alteradas, datos embebidos y conservación de Blob/calibración/senderos/IndexedDB con service worker activo);3 regresiones; visor de20 senderos más selección táctil/pinch/alineación y múltiples vías; recuperación tras fallo de imagen. La revisión independiente comprobó además320×568,360×640 y390×844. Se corrigieron el recorte del panel en móviles pequeños y el reintento de fondo. No se probó en un teléfono físico ni se validaron GPS, navegación, accesos o sentidos.

## Geografía separada

El [catálogo de fuentes](all-catalog.md) explica21 fichas:20del cartel y Subida Buitrera. Hay11 fichas con correspondencia nominal y13 vías OSM independientes. Las otras10 conservan geometría geográfica pendiente. Las79 vías del snapshot se conservan sin alterar, incluida su secuencia completa de nodos. Agrupar vías nominalmente bajo Mampato o XL no las empalma. La selección resalta todas sus vías independientes.

En el mapa mundial sólo se dibuja la geografía OSM disponible. La vista «Todos los senderos del cartel» muestra todos los trazados visuales; no se exporta como GeoJSON. Identificar por nombre una vía OSM no verifica que su extensión coincida con todo el cartel ni su situación actual. Desnivel y velocidad siguen sin inventarse. La georreferenciación de las diez pistas pendientes y la red navegable quedan abiertas.

## Reproducir y abrir

```sh
npm ci
npm test
python3 -m http.server 4175 --bind 0.0.0.0
# En otra terminal:
GEOGRAPHIC_BASE_URL=http://127.0.0.1:4175 npm run test:sign
GEOGRAPHIC_BASE_URL=http://127.0.0.1:4175 npm run test:geographic:browser
GEOGRAPHIC_BASE_URL=http://127.0.0.1:4175 npm run test:geographic:acceptance
```

Abrir `http://127.0.0.1:4175/mapa-geografico.html` en la misma máquina del servidor: URL local, no acceso remoto. Sin adjunto privado la pantalla usa el JPG oficial con un pie que lo identifica. Para incluir la foto privada en la copia del propietario:

```sh
python3 scripts/build-geographic-standalone.py --reference-photo /ruta/privada/81184.jpg
```

El constructor crea `dist/mapas-gps-parques.html`, su revisión anterior y `dist/sources/el-durazno-official-2022.jpg`. Conservar esa carpeta al distribuir: la imagen oficial se carga al abrir el plano. El mapa mundial necesita internet para las teselas. Para regenerar geometría, descargar el PDF de la URL registrada, instalar `scripts/requirements-tracing.txt` y ejecutar `python3 scripts/trace-all-trails.py --pdf /ruta/official-map.pdf --audit-dir /ruta/auditoria`. El script rechaza bytes fuente con otra huella.
