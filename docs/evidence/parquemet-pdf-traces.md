# Senderos ciclistas: trazados nativos del PDF oficial

Se extrajeron los **ocho senderos ciclistas numerados**, con curvas Bézier nativas y **tolerancia de simplificación 0**, del [PDF retenido](../../sources/parquemet-mapa-oficial.pdf). No se siguieron píxeles, no se aproximaron curvas mediante polilíneas y no se rellenaron huecos entre objetos. El [resultado](../../data/parquemet/visual-cycling-trails.json) usa exclusivamente **x/y del documento**, sin geometría GPS.

La fuente contiene centerlines reales con patrón de guiones; **no son contornos de guiones expandidos**. Se conservaron por separado 43 objetos: **11 trazos con guiones, 19 remates sólidos cortos y 13 marcadores rellenos**. Sus instrucciones geométricas suman **120 curvas cúbicas `C` y 78 segmentos `L`**. Los cuatro trazos finos que unen rótulos a senderos se registran como `leaderPaths`, separados de la geometría de los senderos.

## Fuente y coordenadas

- Fuente: <https://mapas.parquemet.cl/doc/MapaParque.pdf>, copia retenida de 765376 bytes, SHA-256 `e7606172479a0fd585f7f3dcb4187556a202778cd647b31f44aaefcf9bd03cf8`.
- Página 1, objeto PDF xref **2**, tamaño **6689.759765625 × 2834.64990234375 puntos**, rotación 0°. Sus flujos de contenido son xref **119, 120, 121, 122, 123, 124, 125 y 126**; los hashes de sus bytes decodificados constan en el JSON.
- Extracción: PyMuPDF **1.26.6**, MuPDF **1.26.11**, `page.get_drawings()`: **3540 dibujos**. `drawingIndex` es su índice **desde cero**; `seqno` es el número de pintura de MuPDF. Los dibujos extraídos 1259–1301 tienen `seqno` 1288–1330 y capa **«Capa 1»**.
- El espacio de página de PyMuPDF tiene origen **superior izquierdo**. Su transformación a `document-pixels` es identidad `[1,0,0,1,0,0]`, coherente con el [render oficial a escala 1](../../data/parquemet/official-document.json). El raster de **6690 × 2835** cubre los límites fraccionarios de la página sin estirarla.
- Las coordenadas son los valores flotantes entregados por PyMuPDF, serializados con representación de ida y vuelta, sin redondeo adicional. Cada `C` conserva los dos controles y el punto final de su curva fuente.
- `bounds` siempre significa `[x,y,width,height]`: caja de controles nativos, ampliada por medio ancho de trazo cuando procede. Son límites conservadores para encuadre, no distancias de terreno.

El PDF es un panorama esquemático, sin georreferencia aceptada. No se inferieron conexiones, sentidos de marcha, elevación, distancias de terreno ni transitabilidad. Los cruces de tinta no acreditan uniones entre rutas. Las longitudes oficiales de la leyenda se mantienen como referencias separadas y no se calculan desde los píxeles.

## Correspondencia comprobada con los números originales

Se inspeccionaron a escala 2 los tres sectores del mapa y la leyenda ciclista. Los números blancos de los ocho badges rojos son texto PDF, y sus coordenadas originales se conservan en `label`. Los nombres y distancias proceden de la leyenda **«Senderos ciclistas / Cyclists trails»** situada en el panel inferior, no de semejanza con nombres de OSM.

| Nº | ID y nombre oficial | Distancia de leyenda | Dibujos del sendero y marcadores | Centerlines con guiones | Rótulo: origen x/y | Línea de rótulo |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `centenario` — Centenario | 0,9 km | 1259–1265 | 1260, 1262 | 1576.5283203125 / 1182.06982421875 | — |
| 2 | `cuatro-y-medio` — 4 ½ | 1 km | 1266–1270 | 1267 | 1644.03076171875 / 1276.7275390625 | — |
| 3 | `anfiteatro` — Anfiteatro | 0,7 km | 1276–1286 | 1277, 1281, 1284 | 3071.2421875 / 1498.31787109375 | 1309 |
| 4 | `la-s` — La S | 0,5 km | 1287–1290 | 1288 | 3263.96435546875 / 1168.9306640625 | 1324 |
| 5 | `zorzal` — Zorzal | 0,5 km | 1291–1294 | 1292 | 3480.00390625 / 1168.9306640625 | 1325 |
| 6 | `pa-arriba` — Pa’ arriba | 0,6 km | 1295–1298 | 1296 | 3480.00390625 / 1421.05322265625 | 1326 |
| 7 | `torre-5` — Torre 5 | 0,8 km | 1271–1275 | 1272 | 3378.7763671875 / 1507.15087890625 | — |
| 8 | `piramide` — Pirámide | 0,6 km | 1299–1301 | 1299 | 4007.82421875 / 1192.90185546875 | — |

Los trazos sólidos cortos no unen objetos nuevos: son los remates de guiones ya existentes en el PDF. Cada objeto tiene un `d` SVG independiente; el consumidor debe conservar esa separación y el patrón `strokeDasharray` si pretende reproducir los guiones originales. Los colores RGB flotantes originales de MuPDF se guardan junto al color hexadecimal redondeado; la gestión de color del PDF puede producir una apariencia ligeramente distinta al SVG.

El marcador común final de Anfiteatro, La S, Zorzal y Pa’ arriba es **un único dibujo 1279**. Se almacena una sola vez, en Anfiteatro; las otras tres entradas lo referencian con `sharedEndpointDrawingIds`. El círculo **1269**, almacenado en 4 ½, también se referencia desde Centenario. Esta coincidencia de tinta no crea una unión navegable.

## Ocultación y huecos preservados

El PDF sí contiene curvas completas que pasan detrás de los badges **1, 2, 7 y 8** y de la cabina del teleférico junto al sendero 1. Esos tramos se conservaron porque existen como instrucciones nativas; al sobreponer los vectores por encima del raster pueden verse sobre los rótulos. La extracción no reproduce máscaras de objetos dibujados después. La vista del documento original mantiene la composición y las ocultaciones originales.

**Anfiteatro consta de tres grupos de trazos y conserva dos huecos reales en la geometría fuente.** No se generaron segmentos para unirlos:

| Desde el dibujo | Hasta el dibujo | Extremos originales x/y | Separación en píxeles del esquema |
| --- | --- | --- | --- |
| 1285 | 1280 | `[3118.8994140625,1406.07666015625]` → `[3168.421875,1406.76806640625]` | 49.527287225414966 |
| 1282 | 1276 | `[3196.68994140625,1338.1416015625]` → `[3223.7001953125,1324.92578125]` | 30.070113445286186 |

Los huecos están en los sectores de los dibujos de Mirador Atardecer y del anfiteatro. No se encontró una centerline roja nativa que continúe entre esos grupos. Se registran explícitamente como `missingConnections` con `interpolated:false`. No deben cerrarse usando la apariencia de los iconos, la proximidad espacial ni una ruta geográfica distinta.

## Reproducción y comparación visual

```sh
python3 scripts/extract-parquemet-cycling.py
python3 scripts/extract-parquemet-cycling.py --check
python3 scripts/extract-parquemet-cycling.py --preview /workspace/scratch/parquemet-coverage/qa
node --test tests/parquemet-visual.test.mjs
npm test
```

El [extractor](../../scripts/extract-parquemet-cycling.py) rechaza una fuente con bytes o SHA-256 distintos. `--check` vuelve a extraer el PDF y compara **todos los bytes** del JSON. Cada objeto incorpora `contentSha256`, calculado sobre sus datos antes de añadir ese campo. El hash superior se calcula sobre el documento sin el campo superior `contentSha256`, como JSON UTF-8 con claves ordenadas, `ensure_ascii=false` y separadores compactos `(',',':')`.

La extracción retenida tiene `contentSha256` **`9b5da4576d66b863c49ccf45096bac69d183098da60f68a0837bcb4f7573726e`**. El hash de los bytes del archivo JSON, con sangría y salto final, es **`10c75c0778494a0d4b04a2005316a351261a6fa5d95e45a7117d8ffa70169eba`**.

Se generaron e inspeccionaron tres comparaciones a escala 2, cada una con **PDF original / curvas originales superpuestas / curvas originales solas**. La comparación usa centerlines de color continuo para revelar también los controles extraídos que quedan entre los guiones o detrás de rótulos. No agrega conexiones entre objetos:

- `/workspace/scratch/parquemet-coverage/qa/left-comparison.png`: senderos 1 y 2; curvas, giros, cabina y tramos bajo rótulos coinciden.
- `/workspace/scratch/parquemet-coverage/qa/middle-comparison.png`: senderos 3 a 7; se ven claramente los tres grupos de Anfiteatro y los tres descensos distintos hacia el marcador compartido.
- `/workspace/scratch/parquemet-coverage/qa/piramide-comparison.png`: sendero 8; conserva la curva completa original bajo su badge.

Las cuatro pruebas de [extracción visual](../../tests/parquemet-visual.test.mjs) verifican los ocho IDs/nombres, hash de fuente, escala identidad, conservación de curvas y objetos, ausencia de conversión GPS, huecos explícitos, regeneración determinista y rechazo de un PDF alterado. La interacción del overlay con el visor se comprueba por separado.

Verificación del 20 de octubre de 2026: **4/4 pruebas de extracción y 102/102 pruebas de `npm test`, sin fallos**. Las tres comparaciones visuales se revisaron después de generar el archivo retenido.
