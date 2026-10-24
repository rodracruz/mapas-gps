# Paseo Metropolitano: seis trazados verdes nativos del PDF

Se recuperaron las seis secciones numeradas de la leyenda verde **«Paseo Metropolitano / Metropolitan trail»**, con sus nombres y distancias oficiales, del [PDF retenido](../../sources/parquemet-mapa-oficial.pdf). Los badges originales incluyen los pictogramas de bicicleta y peatón. El [resultado](../../data/parquemet/visual-paseo-trails.json) contiene únicamente coordenadas del documento; no es una red GPS.

La fuente es <https://mapas.parquemet.cl/doc/MapaParque.pdf>, copia de **765376 bytes**, SHA-256 **`e7606172479a0fd585f7f3dcb4187556a202778cd647b31f44aaefcf9bd03cf8`**. Tiene una página de **6689.759765625 × 2834.64990234375 puntos**, rotación 0°, raster de referencia **6690 × 2835**, origen superior izquierdo y transformación identidad `[1,0,0,1,0,0]`. El JSON registra también xref de página, flujos de contenido y sus hashes, versiones de PyMuPDF/MuPDF y los 3540 dibujos originales. La leyenda ocupa aproximadamente x=2942, y=2261–2780; todos los objetos de ruta extraídos están en el mapa superior, antes de y=2130.

## Asignación inspeccionada

La correspondencia se comprobó sobre el PDF original, los números blancos de los badges verdes y los grupos de objetos nativos. No se usó cercanía a un nombre de OSM ni se asignaron rutas por semejanza espacial. La ruta 5 tiene **dos badges originales**; ambos se conservan en `labels`. Ninguna de estas seis etiquetas necesita un leader independiente: sus badges están sobre el trazado, mientras que los pequeños ramales verdes 1362 y 1374 son geometría de la fuente y permanecen como objetos separados.

| Nº | ID estable y nombre exacto de leyenda | Distancia | Dibujos originales de ruta y marcadores | Fondo del badge | Origen x/y del número |
| --- | --- | --- | --- | --- | --- |
| 1 | `paseo-infancia` — Tramo Parque B. de la Infancia | 940 m | 1362, 1365–1367 | 1412 | 1402.1123046875 / 767.89599609375 |
| 2 | `paseo-sentidos` — Sendero de los Sentidos | 540 m | 1363–1364, 1368–1369 | 1409 | 1163.38623046875 / 952.33154296875 |
| 3 | `paseo-bellavista` — Tramo Bellavista | 1 km | 1370–1371 | 1406 | 1379.5546875 / 1286.34228515625 |
| 4 | `paseo-pedro-valdivia` — Tramo Pedro de Valdivia | 1,5 km | 1372–1375 | 1403 | 2006.3681640625 / 1370.2529296875 |
| 5 | `paseo-piramide` — Tramo Pirámide / Jardín Japonés | 3,7 km | 1376–1390 | 1418, 1421 | 2926.15087890625 / 1653.98388671875; 3827.1123046875 / 1308.33642578125 |
| 6 | `paseo-cascada` — Tramo La Cascada | 1,2 km | 1391–1393 | 1415 | 2872.3984375 / 1135.42822265625 |

El número de dibujo usa índice desde cero de `page.get_drawings()`. Cada objeto conserva su `seqno`, capa, instrucciones SVG, controles cúbicos, color RGB flotante, ancho, remates, unión y patrón de guiones originales. El extractor reutiliza sin modificar `path_record` y su serializador `native_svg_path` del [extractor ciclista existente](../../scripts/extract-parquemet-cycling.py).

Se conservan **32 objetos nativos: 21 trazos y 11 marcadores rellenos**, con **110 instrucciones cúbicas `C` y 51 líneas `L`**. De los 21 trazos, tres tienen guiones nativos: **1383, 1386 y 1389**, todos en Pirámide. Los seis objetos 1382/1384, 1385/1387 y 1388/1390 son los pequeños remates sólidos independientes de esos guiones. No se aplanaron curvas, redondearon coordenadas, unieron objetos ni interpolaron segmentos; la tolerancia de simplificación es **0**.

## Huecos, sobrepintado y fragmentos pendientes

**Sendero de los Sentidos tiene dos grupos de geometría con un hueco fuente real junto al funicular.** El dibujo 1363 termina en `[1163.5987548828125,1005.093017578125]` y el dibujo 1368 empieza en `[1156.2177734375,1061.35595703125]`: separación **56.74501954358688 píxeles del esquema**. No existe entre ambos una centerline verde nativa. El hueco se registra en `missingConnections` con `interpolated:false`; no se dibuja una conexión bajo el icono del funicular.

Pirámide alterna trazos sólidos y guiones más anchos. Sus **12 pequeñas separaciones originales**, entre remates o cambios de estilo, quedan en `sourceStrokeTransitions`, con extremos originales e `interpolated:false`. Miden entre 0.8369293389545276 y 5.515767001088275 píxeles y no se rellenan. Se distinguen del hueco largo entre los dos grupos de Sentidos.

Las curvas que pasan detrás de los badges y otros objetos se conservan completas cuando existen en la fuente. Al dibujar el vector encima del PDF, estos tramos pueden aparecer sobre los rótulos. Las máscaras y el orden de sobrepintado originales se mantienen en el raster, sin inventar recortes de geometría.

Los dibujos **1394–1402** son otros nueve objetos verdes punteados, en tres grupos de tres, sin vínculo visible con un badge numerado del Paseo. En el original aparecen cerca de símbolos rojos de prohibición de entrada. Esto no basta para asignarles una de las seis identidades: se documentan como **pendientes y no asignados** en `pendingSourceGroups`, y se excluyen de `trails[].paths`. Tampoco se deduce una condición de acceso GPS de esos símbolos.

El esquema no tiene georreferencia aceptada. No se infieren conexiones ni intersecciones transitables, sentidos, alturas o distancias terrestres. Las longitudes de la leyenda son datos oficiales separados, no distancias calculadas desde píxeles. `georeferencing.transform` y `crs` son `null`, y `useForNavigation`/`useForGroundDistances` son `false`.

## Reproducción y comparación visual

```sh
python3 scripts/extract-parquemet-paseo.py
python3 scripts/extract-parquemet-paseo.py --check
python3 scripts/extract-parquemet-paseo.py --check --preview /workspace/scratch/parquemet-shared-routes/qa
node --test tests/parquemet-paseo-visual.test.mjs
```

El extractor requiere PyMuPDF; el preview opcional requiere Pillow e Inkscape. Inkscape se usa porque el renderizador SVG de MuPDF omite aquí `stroke-dasharray`, aunque los guiones están conservados en el SVG y JSON. El preview corregido conserva los tres patrones, sus anchos y remates originales. Cada comparación tiene **PDF original / curvas nativas superpuestas / curvas nativas solas**; el color de QA permite comprobar coincidencias sin cambiar su geometría o estilo de guiones.

Se generaron e inspeccionaron visualmente siete tripaneles en `/workspace/scratch/parquemet-shared-routes/qa/`: `infancia-sentidos-comparison.png`, `bellavista-comparison.png`, `pedro-valdivia-comparison.png`, `piramide-west-comparison.png`, `piramide-middle-comparison.png`, `piramide-east-comparison.png` y `cascada-comparison.png`. Coinciden las curvas, ramales y marcadores con el original; se comprueban el hueco de Sentidos, los dos badges 5 y las tres secciones con guiones de Pirámide. El preview incluye también los SVG y PNG de vectores usados en cada comparación.

Se verificó el ciclo RED→GREEN de las [cuatro pruebas específicas](../../tests/parquemet-paseo-visual.test.mjs): primero fallaron por la ausencia del dataset, después pasaron las cuatro. Cubren identidades/leyenda/badges, los 32 objetos y sus curvas, guiones, escala sin GPS, huecos y fragmentos pendientes, regeneración byte a byte y rechazo de un PDF alterado. Se ejecutó además `--check` tras corregir el renderizador opcional. No se ejecutaron builds ni la suite global en este trabajo de extracción acotado.

Hash de contenido del resultado: **`48938ef3c5aa35fe73495667121ded43f0be2762cad91da0f3378bbca426e0fa`**. SHA-256 de los bytes del JSON con sangría y salto final: **`e7b938e8d032feae33ffb67d0b5ab7e5b0e681b96657a6426e8bb4a10284e2e6`**. El hash de cada objeto y el superior siguen la definición canónica del JSON, sin incluir su propio campo `contentSha256`.
