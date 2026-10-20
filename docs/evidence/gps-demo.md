# Demo pública de continuidad GPS

Esta demo genera **posiciones simuladas sobre cartografía pública OpenStreetMap**. No contiene un registro GPS real, no usa posiciones del usuario y no representa una validación de campo.

`createPublicDemo(geo, {startTime})` recibe la colección producida por `fromOsmSnapshot` con `sources/el-durazno-osm.json` y `data/el-durazno/geographic-catalog.json`. No lee archivos privados ni utiliza píxeles del cartel.

- Aproximación: 192 m de `Sendero Lomo Vetado`, vía OSM [477170097](https://www.openstreetmap.org/way/477170097), target `lomo-vetado`.
- Cruce: nodo compartido [4705609090](https://www.openstreetmap.org/node/4705609090), coordenadas originales `[-70.4928546, -33.3043399]`.
- Salida: 192 m de `Sendero Calibre 12`, vía OSM [1003300258](https://www.openstreetmap.org/way/1003300258), target `calibre-12`.

Se recorre Lomo Vetado hacia atrás respecto del orden de sus nodos y luego Calibre 12 hacia delante. Esta elección permite observar la adquisición y la transición; no acredita un sentido de circulación permitido. El otro nodo compartido, 4705608441, también conecta con vías adicionales, por lo que no se usa para este ejemplo.

Se interpolan 49 posiciones cada 8 m de geometría fuente y cada 1800 ms de tiempo simulado: 22 de aproximación, 5 en el entorno del cruce y 22 de salida. Con reproducción cada 500 ms, la demo dura aproximadamente 24 segundos; el tiempo simulado total es 86.4 segundos. La precisión declarada varía entre 4 y 6 m y algunas posiciones reciben un desplazamiento determinista de 1.2 m al este. Este ruido sólo modifica posiciones simuladas, nunca las vías OSM.

## Verificación

Las seis pruebas de `tests/navigation-demo.test.mjs` se escribieron y ejecutaron primero en RED por ausencia del generador; después pasaron con la implementación.

`node --test tests/navigation-demo.test.mjs`: **6/6 pasan**. Verifica procedencia y coordenadas del nodo real, ambos target IDs, cercanía de cada posición a segmentos originales, etapas observables, intervalos, velocidades, precisión, ruido, reproducibilidad y ausencia de cambios en las fuentes congeladas o sus archivos.

La primera ejecución paralela de `npm test` dio **48/74 pasan**: los 26 fallos correspondían exclusivamente a `tests/navigation-matcher.test.mjs`, cuyo generador del motor aún no existía durante su ciclo RED. El demo no depende del motor.
