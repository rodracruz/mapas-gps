# Atribución completa en el mapa

Seguimiento de la revisión visual versión 20. La atribución quedaba cortada porque `white-space:nowrap` excedía el ancho de la tarjeta. Una regla anterior mantenía 9px mediante `!important`, de modo que la reducción prevista a 6px no resolvía el desbordamiento y tampoco era una solución legible.

Se mantiene texto de 9px, con ajuste de línea y ancho limitado al mapa. El título y el botón Ver capas reservan la altura real de la atribución más 8px, medida al montar el control Leaflet y al cambiar su tamaño. La tarjeta conserva posición y altura 176px; no se cambiaron cartografía, datos, navegación ni servicios.

## Capturas verificadas

- [Vista completa 544×830](el-durazno-544x830.png) y [detalle de la tarjeta](el-durazno-card.png).
- [320px](preview-320.png), [390px con alto 595](preview-390.png), [544px](preview-544.png) y [mapa ampliado 390px](full-390.png).
- [Tarjeta de Parquemet](parquemet-card.png).

Son capturas de la fuente comprobada con planos públicos, sin fotografía privada ni ubicaciones personales. La referencia original de Stitch sigue fuera de Git; la comparación del sitio privado conserva esa referencia intacta y sustituye sus capturas actuales por las corregidas.

## Comprobaciones ejecutadas

`tests/attribution-browser.mjs` reprodujo primero el desbordamiento. Ahora verifica en ambos parques, a 320/390/544px, que cada fragmento de texto cabe en el mapa, que el tamaño permanece legible y que título, botón y navegación no lo tapan. Incluye ampliar/cerrar y cambiar Cartel→OSM→Cartel. Se repitieron los seis casos en los HTML autónomos privados.

Pasaron 131 pruebas unitarias, la regresión de diseño, los dos flujos de interfaz móvil, disposición GPS con 49 lecturas públicas en cinco tamaños y seguimiento en ambos parques. La revisión independiente inspeccionó las 12 capturas y no detectó problemas atribuibles a este ajuste. Ver [verification.json](verification.json). No se repitió validación física de GPS ni se modificó almacenamiento del usuario.

Publicación privada versión 21 comprobada: la app, Parquemet y comparación responden HTTP200 con bytes idénticos al paquete verificado. Se conserva el único propietario y cero visitantes externos. [Resultado del despliegue y hashes](release.json).
