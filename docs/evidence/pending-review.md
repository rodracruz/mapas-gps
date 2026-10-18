# Revisión de zonas y resolución técnica

**Estado actual tras validación propia e independiente:** 10 fragmentos / 253 vértices / **6 pendientes**. El antiguo `virgen-tight-turns` está resuelto como dibujo visible mediante el nuevo fragmento `la-virgen-s05`; conserva su ID en `visualReviews`. Se corrigió también el pequeño gancho de Lomo Vetado. Véase [la validación y sus límites](visual-validation.md).

Consulta e inspección: 2026-10-18. Se inspeccionaron los originales, los contornos aislados del PDF, las siete zonas iniciales y las ampliaciones antes/después de los dos ajustes. No se añadieron conexiones transitables ni coordenadas geográficas.

## Uso en el visor

Abrir **Revisar zonas pendientes**, elegir una zona y alternar **Foto original** / **Mapa oficial** bajo el mapa. La acción muestra el sendero y los recuadros, conserva el encuadre al cambiar de imagen y mantiene el foco en el mapa para desplazarlo con el teclado. Los números grandes se ocultan durante esta inspección para no tapar la fotografía; el número de zona permanece fuera de la imagen.

Si falla una imagen, se conserva la última ya verificada y el aviso aparece junto a los controles de comparación, dentro de la pantalla móvil. Se puede reintentar. La selección y la geometría no se modifican.

## Resultado del contraste

| Zona / ID estable | Lo que se observa al comparar | Estado y evidencia necesaria |
| --- | --- | --- |
| 1 · `sw-label-east` | El rótulo Starwars y su pictograma cubren el eje en foto y JPG oficial. El PDF conserva el contorno debajo de la placa. | Pendiente en el modelo de la foto: el contorno oculto del PDF es evidencia de su propio dibujo; su correspondencia exacta bajo el rótulo de la foto no queda validada por verla en ese archivo. |
| 2 · `sw-label-west` | El segundo rótulo y pictograma se leen mejor en la fuente oficial, pero siguen ocultando el eje. | Pendiente por oclusión, no simplemente por tamaño del archivo. |
| 3 · `virgen-label-upper` | El rótulo verde superior oculta parte del eje y queda próximo a la subida roja. | Pendiente. El cruce gráfico y el texto no prueban una conexión transitable. |
| 4 · `virgen-label-lower` | El segundo rótulo La Virgen, junto a líneas punteadas, cubre el eje. Los puntos y líneas de alrededor no se fusionan. | Pendiente de eje bajo el rótulo y correspondencia de edición. |
| 5 · `lomo-label` | La placa diagonal de Lomo Vetado tapa el recorrido entre dos fragmentos. Calibre 12 está cerca y permanece separado. | Pendiente. Ni proximidad ni cambio de color autorizan cerrar el hueco o conectar senderos. |
| 6 · `lomo-end` | En la fuente oficial se distingue un extremo azul redondeado, separado de una conexión punteada y de otro sendero. | Pendiente de centro del extremo en la foto y relación topológica. No prolongar hasta la línea cercana. |

La revisión inicial conservaba siete zonas. Al ampliar la foto sin trazado superpuesto, se distinguen las dos cuñas claras y los dos retornos de `virgen-tight-turns`. La revisión independiente y el contorno PDF confirman el orden. Se añadió su eje visible, sin interpolar bajo una placa. Las observaciones editables están en `data/el-durazno/visual-corrections.json`; no son medidas de terreno ni posiciones exactas subpíxel.

## Comparaciones reproducibles

- [Lámina de las seis zonas pendientes](pending/zonas-pendientes-comparacion.png).
- [Manifiesto de recortes y hashes](pending/comparisons.json).
- Archivos individuales: `docs/evidence/pending/*-comparacion.png`.
- [Zigzags de La Virgen: original / antes / después](visual-audit/virgen-tight-turns-antes-despues.png).
- [Gancho de Lomo Vetado: original / antes / después](visual-audit/lomo-hook-photo-review-antes-despues.png).

Cada fila contiene fotografía, oficial alineado y fotografía con los fragmentos del mismo sendero. Los tres paneles usan exactamente el mismo recorte en el plano de 900 × 1100. El oficial usa su raster alineado de 1800 × 2200; la foto original usa 900 × 1100. La presentación amplía 4× por replicación ordinaria de píxeles, sin aumento generativo ni generación de curvas. El margen exterior del recorte es de 20 píxeles nativos, recortado contra el límite de la imagen.

Reproducir con `python3 scripts/compare-pending.py` (Pillow). El script comprueba los hashes de ambas imágenes y que la geometría permanezca idéntica; guarda en el manifiesto la huella de los trazados, fuentes y recortes. Esta comparación usa la homografía visual documentada; no constituye una comprobación geográfica independiente.

## Seguimiento geográfico

La [página oficial de Outlife](https://www.outlife.cl/parques/rkf-el-durazno/) sigue enlazando el JPG/PDF registrados. La inspección del conjunto OSM retenido confirmó el nombre Sendero Lomo Vetado. No se equiparó la vía «Conexión Calibre 12-La Virgen» con la pista completa La Virgen ni se inventaron vías para Starwars.

Se consultó además la [política de uso de datos de Trailforks](https://www.trailforks.com/about/data/), que exige acceso autorizado por API para usar sus datos. No se solicitaron claves, no se contrataron servicios y no se importaron coordenadas ni geometrías de ese proveedor. La consulta pública de su página no se trata como una licencia para incorporar su cartografía.

Se corrigieron dos anotaciones históricas del registro de fuentes: sí hay un JPG oficial conservado en `sources/`, y sí se extrajeron los contornos de los tres senderos del PDF. Ninguno de esos hechos acredita una transformación GPS. El registro mantiene **cero controles aceptados** y **transformación geográfica nula**.
