# Documento oficial de Parquemet

Se conservó el PDF indicado por el usuario: [MapaParque.pdf](https://mapas.parquemet.cl/doc/MapaParque.pdf). La consulta retenida corresponde a **2026-10-20T15:01:06.256455+00:00**. La [copia local](../../sources/parquemet-mapa-oficial.pdf) tiene **765376 bytes** y SHA-256 `e7606172479a0fd585f7f3dcb4187556a202778cd647b31f44aaefcf9bd03cf8`; coincide byte por byte con el original descargado. No se volvió a descargar otra edición durante la preparación del visor.

Se inspeccionó la página completa, el recorte principal y los rótulos de la leyenda a resolución nativa. El título visible es **«Recorre y descubre Parquemet»**. Es un panorama esquemático con relieve dibujado, simbología inferior y una tabla de distancias lateral. El PDF no muestra una fecha de edición. Sus metadatos registran creación el 9 de diciembre de 2022 y modificación el 20 de octubre de 2023; esas fechas no acreditan operación, accesos ni vigencia actual de los senderos.

## Activos y coordenadas

| Activo | Resultado |
| --- | --- |
| PDF | Una página de 6689.759765625 × 2834.64990234375 puntos PDF; 72 puntos por pulgada; rotación 0°. |
| [JPEG completo](../../sources/parquemet-mapa-oficial.jpg) | 6690 × 2835 píxeles RGB, 3251978 bytes; SHA-256 `e0d91c5e90bbc290ae1af71d1b51e29960f682ab5dd242c3b24ede003f0a7dd3`. |
| [Metadatos](../../data/parquemet/official-document.json) | Rutas, hashes, dimensiones, configuración del render, procedencia, matrices y límites de uso. |
| Encuadre recomendado | `{x: 0, y: 0, width: 5705, height: 2130}` en píxeles del documento; excluye la simbología inferior y la tabla de distancias derecha en una vista previa recortada. |

El JPEG conserva **toda la página**, incluidos tabla, leyenda, logotipos y códigos QR. Se rasterizó directamente a escala 1 con PyMuPDF 1.26.6 / MuPDF 1.26.11; se codificó con Pillow 12.3.0, JPEG de calidad 95 y muestreo de color 4:4:4. No se aplicaron aumento generativo, retoques, redibujo de curvas, georreferenciación ni recorte al archivo completo. Las dimensiones enteras del raster cubren los límites fraccionarios de la página; el render no estira la página para hacer coincidir sus bordes con esos enteros.

El espacio PDF original usa origen inferior izquierdo. Su matriz a píxeles de la imagen es `[1, 0, 0, -1, 0, 2834.64990234375]`, con la convención `x2=a*x1+c*y1+e; y2=b*x1+d*y1+f`. El espacio de página con origen superior izquierdo se convierte a píxeles mediante identidad `[1, 0, 0, 1, 0, 0]`. Las claves de georreferencia de página `VP`, `Measure` y `LGIDict` están ausentes. No existen controles aceptados, CRS ni transformación a GPS en este modelo. Los píxeles del esquema no sirven para calcular posiciones, distancias de terreno ni conexiones transitables.

## Visor del documento

[geographic/document.mjs](../../geographic/document.mjs) exporta:

```js
setupOfficialDocument({imageUrl, width, height, initialView, pdfUrl})
// → {open(rect = initialView), close(), destroy()}
// rect: {x, y, width, height}, siempre en píxeles del documento.
```

Utiliza los controles `official-dialog`, `official-close`, `document-out`, `document-in`, `document-fit`, `document-map`, `document-pdf`, `document-stage`, `document-svg`, `document-image` y `document-status`. `imageUrl` admite el objeto URL de una imagen cuyos bytes ya haya verificado la aplicación. `pdfUrl` admite la copia local o el enlace oficial. El diálogo contiene el raster ampliable; no incrusta un PDF en un marco de lectura móvil.

La interacción permite botones de zoom, rueda, doble clic, arrastre, pellizco de dos dedos y teclado. Las flechas desplazan, `+`/`−` amplían o alejan, `0` encuadra la página completa y `Home` vuelve al área principal. Los cambios de orientación conservan el centro y la escala de pantalla dentro de los límites del documento. El zoom máximo es 64 veces el ancho de la página; los límites de desplazamiento mantienen el documento accesible. Escape cierra el diálogo y se devuelve el foco al control que lo abrió. Los errores de carga se anuncian junto al enlace al PDF.

## Reproducción y comprobaciones

```sh
python3 scripts/build-parquemet-source.py --pdf /ruta/al/original/MapaParque.pdf
# Las ejecuciones siguientes usan la copia retenida:
python3 scripts/build-parquemet-source.py
node --test tests/document.test.mjs
npm test
```

El [script](../../scripts/build-parquemet-source.py) rechaza cualquier PDF cuyo tamaño o SHA-256 difieran de la fuente retenida. Una segunda ejecución produjo exactamente los mismos bytes de PDF, JPEG y metadatos en el entorno indicado. Cambiar de versión del rasterizador o del codificador requiere revisar el nuevo render y sus hashes.

Verificación realizada el 20 de octubre de 2026:

- Las tres pruebas de [geometría del documento](../../tests/document.test.mjs) pasaron: encuadre sin distorsión en vertical y horizontal, anclaje del punto tocado durante un pellizco con desplazamiento y límites ante gestos extremos.
- La suite `npm test` pasó: **92 pruebas, 0 fallos**.
- Una sesión Chromium con pantalla de 390 × 844 y entrada táctil real de CDP confirmó zoom de botones, pellizco, arrastre, rueda, cambio a 844 × 390, Escape y retorno de foco; no registró errores JavaScript. El pellizco aumentó la distancia entre dedos de 70 a 190 píxeles y redujo el ancho del encuadre al factor esperado `70/190`.

La integración de este documento con el catálogo y el mapa GPS se comprueba por separado. El visor del documento no toma posiciones del GPS ni comparte coordenadas con la cartografía geográfica.
