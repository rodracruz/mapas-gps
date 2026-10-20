# Avenidas y caminos de Parquemet

2026-10-20 · rama `fix/parquemet-avenues`, sobre `7e72be7`.

La pantalla anterior relegaba nueve avenidas a líneas tenues, sin recortes oficiales. Faltaban Gabriela Mistral, Pablo Neruda y Camino Rafael Elizalde; además, Zañartu y La Montaña tenían tramos nominales omitidos.

Ahora hay 26 fichas: ocho senderos ciclistas, seis tramos compartidos y doce avenidas/caminos. Los filtros Todos / Ciclistas / Paseo / Avenidas funcionan en las fichas y en el mapa; conservan la ocultación manual por recorrido. Las avenidas aparecen en azul de 4,5 px, con halo blanco y nombres al filtrar o seleccionar. En pantallas estrechas se omiten rótulos que no caben para evitar amontonarlos; la selección por botones permanece disponible. Las fichas y la tarjeta del mapa conservan 176 px cerradas.

## El plano original y la geografía son fuentes distintas

Diez avenidas tienen un recorte revisado de su sector rotulado en el JPG original. Pablo Neruda y Rafael Elizalde tienen referencia en la tabla oficial, presentada como tal al desplegar; no reciben una miniatura falsamente ubicada en el dibujo. Se amplían los recortes, con zoom y desplazamiento, manteniendo las coordenadas originales y la imagen al 100% de opacidad.

El PDF dibuja la red vial blanca en polígonos compuestos (738 y 748), sin ejes identificados para cada avenida. **No se inventaron curvas individuales ni se atribuyó toda esa superficie a una sola vía.** Las vistas de avenida no habilitan «Sólo rutas». Los catorce recorridos anteriores conservan sus curvas, huecos y estilos nativos. No hay transformación de ese plano esquemático hacia GPS.

Datos editables: [visual-avenues.json](../../data/parquemet/visual-avenues.json). Extracción reproducible: `python3 scripts/extract-parquemet-avenues.py --check`. [Evidencia exacta de rótulos, recortes y límites](parquemet-avenues-pdf.md).

## Fuente geográfica y permisos

Nueva consulta atómica: [parquemet-avenues-osm.json](../../sources/parquemet-avenues-osm.json), 116 vías, 2694 nodos y una relación, sin metadatos de colaboradores. SHA256 `cf2aa2e2e548e1181a230966e7b6954b4403a6493212cea3c375032e775bc7bc`. Base OSM `2026-10-20T19:47:36Z`; raw HTTP200, SHA256 `8be2358193cc8d2a77f506b4bb20117976265ea44264b17b7d15cad583dab1aa`. Consulta y URL exactas dentro de la fuente. Todos los 2722 objetos previos conservan sus campos; ambas fuentes históricas siguen intactas. Las 42 repeticiones idénticas de la recursión de Overpass se deduplicaron, sin mezclar consultas.

Hay 103 vías atribuidas: 19 ciclistas, 31 compartidas, 53 de avenidas. Otras 13 permanecen como contexto. No se unen líneas por proximidad o por un cruce aparente. [Identificadores, versiones, coordenadas, permisos y contraste oficial](parquemet-avenues-geographic.md).

El matcher experimental acepta 91 vías (las 84 previas y siete nuevas con permiso/infraestructura ciclista explícita). Gabriela Mistral (`bicycle=no`), Rafael Elizalde (sin permiso explícito) y el tramo adicional de La Montaña (sin permiso/infraestructura) se muestran y quedan excluidos. La restricción de vehículos motorizados no acredita circulación ciclista. Siguen vigentes las exclusiones previas. No se acreditan apertura, sentidos, navegación o distancias completas de terreno.

Los Turistas sigue pendiente: el PDF documenta 240 m de acceso, pero no se pudo delimitar ese segmento frente a toda la calle OSM sin inferir límites. Su recorte y evidencia quedan como referencia sin ficha activa. No se agregan avenidas urbanas circundantes como rutas del parque.

## Verificación ejecutada

- 120/120 pruebas unitarias, incluyendo conservación de objetos/coordenadas, permisos, separación imagen/geografía, recortes inválidos, bytes alterados y reproducción del extractor.
- `parquemet-avenues-browser.mjs`: doce selecciones geográficas, diez recortes exactos del original y dos referencias tabulares sin curvas inventadas; hash del fondo; filtros y ocultación manual; restricciones; zoom; tamaño de fichas y controles en 320/390 px; giros 844×390 y 568×320 sin controles interceptados ni nombres amontonados. Ejecutado en fuente y bundle; las comprobaciones finales del bundle incluyen ambos giros.
- `parquemet-coverage-browser.mjs` y `parquemet-shared-browser.mjs`: ocho ciclistas y seis del Paseo conservados, curvas nativas, selección, superposición y estilos.
- `trail-map-background-browser.mjs`, fuente y bundle: 34 vistas anteriores entre ambos parques, imágenes exactas, recortes y matrices imagen/vector iguales.
- `parquemet-visual-integrity.mjs`: alterar curvas o recibo de avenidas falla en fuente y bundle, sin perder OSM ni el PDF original.
- `parquemet-hardening.mjs`: gestos, giros, fuente alterada, enlaces entre parques y GPS opt-in con posiciones públicas simuladas en navegador.
- `geographic-acceptance.mjs`: nueve grupos; incluidos mapas guardados, Blob, calibración, trazados, localStorage y service worker conservados. `geographic-regressions.mjs`: tres comprobaciones de selección, encuadre y enlaces.
- Revisión independiente: detectó y permitió corregir el encuadre con panel lateral y los rótulos persistentes al seleccionar contexto. Se inspeccionaron capturas reales, incluido paisaje estrecho.

Sin prueba física en el parque ni acceso vigente confirmado. Emulación móvil y GPS público simulado no equivalen a navegación de campo. Main/Pages, la fotografía privada y la biblioteca del usuario se conservan.

Capturas de la entrega: [ficha con fondo original](parquemet-avenues/card-mobile.png), [recorte ampliado](parquemet-avenues/original-crop-mobile.png), [avenidas en el mapa](parquemet-avenues/world-avenues-mobile.png), [restricción ciclista](parquemet-avenues/restricted-avenue-mobile.png), [paisaje estrecho](parquemet-avenues/world-avenues-landscape-568.png).
