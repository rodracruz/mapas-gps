# Referencias geográficas de RKF El Durazno

Consulta: **2026-10-18**. Registro de evidencia pública; **georreferenciación no validada**. Las coordenadas siguientes verifican contenido de OpenStreetMap, no la precisión de un levantamiento en terreno ni correspondencias píxel/coordenada con la fotografía. No se importó geometría OSM ni se reutilizó geometría de visores anteriores.

## Original y mejor fuente oficial

Se inspeccionó primero `elh-durazno.jpg`: 900 × 1100, SHA-256 `c9fde34725691801933b3ba72f887a31677dba305d30f0f938f0ddf81211d018`. El original permanece intacto.

La [página oficial de Outlife](https://www.outlife.cl/parques/rkf-el-durazno/) enlaza un mapa con mayor resolución y su PDF:

| Recurso | Dimensiones / tamaño | SHA-256 | Fecha técnica, no fecha demostrada de la fotografía |
| --- | --- | --- | --- |
| [JPG oficial «Mapa El Durazno 2022»](https://www.outlife.cl/wp-content/uploads/2020/07/Mapa_El-Durazno-2022_web_Mesa-de-trabajo-1.jpg) | 2570 × 3077; 4.739.485 bytes; HTTP 200 | `ee124136bc9930ca1928d2df1f79a9810fb4d245c66503a2d4c6ae888aea29af` | Last-Modified: 2023-04-18 13:25:05 UTC |
| [PDF oficial](https://www.outlife.cl/wp-content/uploads/2023/04/Mapa_El-Durazno-2022_web.pdf) | 1 página de 1233,54 × 1476,85 pt; 82.626.422 bytes; HTTP 200 | `9a67123b027197042da8e47d0c6dbe61e800d11e0e7fe01a5d85172b65ef39ab` | Metadatos: creación 2023-04-18 12:26:33 UTC; modificación 13:26:34 UTC |
| [JPG oficial anterior](https://www.outlife.cl/wp-content/uploads/2020/07/mapa-parque-el-durazno.jpg) | 2000 × 2400; 964.993 bytes; HTTP 200 | `bbe3355d3874201f45a90bbead11389be30bdc431e734aec3c360598c0949bff` | Last-Modified: 2021-10-04 15:40:51 UTC |

**Comparación visual:** el JPG «2022» muestra una composición visual compatible con la fotografía: Starwars/Cactus al norte, Buitrera, La Virgen, Lomo Vetado, red negra al este e inserto del centro de operaciones arriba a la izquierda. Comparte la subida roja, Cebolla negra y el inserto sin el dibujo de skills que distinguen la foto del JPG anterior. El archivo oficial completo añade una columna de progresión a la izquierda y leyendas abajo; la foto encuadra principalmente el área de trazados. La comparación respalda compatibilidad visual de la red de Starwars, La Virgen y Lomo Vetado. No demuestra identidad de edición, igualdad de todos los vértices ni fecha del cartel fotografiado. El PDF se verificó por descarga y metadatos. Después se extrajeron sus contornos de estos tres senderos y se contrastaron superpuestos sobre la foto; no se revisaron todos los demás trazados de la página.

El JPG anterior es **otra edición**: subida naranja, Cebolla azul y skills dibujado en el inserto. Fue localizado a través de [Wikiexplora, revisión 100975](https://www.wikiexplora.com/index.php?title=El_Durazno_Bike_Park&oldid=100975), que enlaza directamente al recurso Outlife. No constituye corroboración independiente de la imagen.

Las descargas investigativas completas están fuera del repositorio, en `/workspace/scratch/geo/`. Se conserva además una copia del JPG oficial «2022» en `sources/el-durazno-official-2022.jpg` para inspección y reproducción del ajuste visual. No se verificó una licencia abierta explícita de los mapas de Outlife ni se sustituyó el original.

## Fuentes oficiales de contexto del acceso

Outlife ubica el ingreso en Camino La Cumbre 4491, al costado del Jardín Bosque Colores. La página confirma los nombres Starwars, La Virgen y Lomo Vetado, pero no aporta pares píxel/coordenada.

El [Decreto DAEP N.º 0031/2023 de Lo Barnechea](https://www.lobarnechea.cl/transparencia/DEC_DAEP_152945_0031__13-03-2023__.pdf), de 2023-03-13, página 2, numeral 5(a), identifica el área de acceso en Camino La Cumbre con Camino Quebrada Norte. El [mapa municipal de bicivías](https://www.lobarnechea.cl/wp-content/uploads/2021/02/MAPA_BICIVIAS0402.pdf) aporta contexto vial semejante. Son evidencia independiente del contexto general, **sin coordenadas del portón**. El cruce vial, un punto de hidratación y el nodo de entrada del parque no se equiparan.

## Coordenadas verificadas en cartografía abierta

Fuente directa: [OpenStreetMap API, área inspeccionada](https://api.openstreetmap.org/api/0.6/map?bbox=-70.518,-33.328,-70.485,-33.290), HTTP 200; 2.454.053 bytes; SHA-256 `d8aae668ead1085372efecd2078d7abf83fd06473fd6ba4b301b6f5705ba374b`. Límites oeste/sur/este/norte: −70,518 / −33,328 / −70,485 / −33,290. Coordenadas WGS84/EPSG:4326, orden **latitud, longitud** en la tabla. La precisión decimal de la base no demuestra exactitud métrica. Se incluyen identificador, versión, fecha del objeto y motivo para evitar su confusión.

| Referencia y URL | Latitud, longitud | Versión / fecha OSM (UTC) | Qué demuestra y límite |
| --- | --- | --- | --- |
| [Bikepark RKF El Durazno — nodo 9258698134](https://www.openstreetmap.org/node/9258698134) | -33.3218441, -70.5128438 | v1 / 2021-11-17T01:25:04Z | Identifies the park by name and official website, for broad map location only. It is about 171 m from the OSM entrance node; it is not an entrance or trail junction. |
| [OSM entrance — nodo 9258698133](https://www.openstreetmap.org/node/9258698133) | -33.3232656, -70.5121506 | v1 / 2021-11-17T01:25:04Z | Node is tagged as an entrance and shared by a fence and Sendero Subida Buitrera. Candidate gate location in OSM; exact correspondence with the operator entry address and photographed operations area is not validated. |
| [Buitrera — nodo 4705647672](https://www.openstreetmap.org/node/4705647672) | -33.3013190, -70.4937320 | v2 / 2021-11-17T01:25:04Z | Named viewpoint matches a label visible in the photograph. No pixel/world control pair established. It is about 51 m from the separately mapped Virgen statue. |
| [Virgen — nodo 9258698197](https://www.openstreetmap.org/node/9258698197) | -33.3008590, -70.4937586 | v1 / 2021-11-17T01:25:04Z | Named statue may explain the Virgin icon by Buitrera. It is a point feature, not the entire La Virgen trail or an independently surveyed anchor. |
| [Plaza de Los Saltos — nodo 9258698201](https://www.openstreetmap.org/node/9258698201) | -33.3136744, -70.5037364 | v1 / 2021-11-17T01:25:04Z | Named viewpoint is separate from the nearby information-map node by about 18.5 m. Do not exchange the viewpoint icon and trail junction as an anchor. |
| [Bikepark El Durazno — nodo 4705608441](https://www.openstreetmap.org/node/4705608441) | -33.3138365, -70.5036907 | v3 / 2021-11-17T01:25:04Z | This is an information-map node, not a park-wide centroid or access. OSM paths Lomo Vetado, Calibre 12 and Los Saltos share this endpoint; a common graph node does not identify a pixel in the sign. |
| [Subida Buitrera / conexión — nodo 397645997](https://www.openstreetmap.org/node/397645997) | -33.3013392, -70.4938151 | v2 / 2017-03-05T15:20:17Z | Shared endpoint of OSM ways 477168992 and 477174834, close to Buitrera viewpoint. This node has no place-name tag; do not replace the viewpoint coordinate with it. |
| [Conexiones / Sendero XL — nodo 397646020](https://www.openstreetmap.org/node/397646020) | -33.3028752, -70.4919406 | v2 / 2017-02-25T19:59:10Z | Shared endpoint of OSM ways 477174834, 477174835 and 477174836. Names differ from some map labels; correspondence to a photographed junction remains unvalidated. |
| [Lomo Vetado / conexión — nodo 4705608466](https://www.openstreetmap.org/node/4705608466) | -33.3040099, -70.4923871 | v1 / 2017-02-25T19:36:27Z | Endpoint of OSM Lomo Vetado way 477170097 and connection way 477174836. Candidate topology reference only; not a verified image control point. |
| [Calibre 12 / Lomo Vetado — nodo 4705609090](https://www.openstreetmap.org/node/4705609090) | -33.3043399, -70.4928546 | v1 / 2017-02-25T19:36:27Z | Node belongs to OSM Lomo Vetado way 477170097 and is an endpoint of Calibre 12 way 1003300258. Graph connectivity verified; correspondence to the drawing not validated. |

Todos los puntos de la tabla tienen **correspondencia con la foto no validada** y `acceptedForCalibration: false` en el JSON. No hay pares de control aceptados ni transformación calculada en este registro.

El marcador `sports_centre` 9258698134 está aproximadamente a 171 m del nodo `entrance=yes` 9258698133; no representa ese portón. Buitrera y Virgen son puntos separados por unos 51 m. El mapa informativo 4705608441 y Plaza de Los Saltos distan unos 18,5 m: proximidad no es identidad. Distancias aproximadas calculadas sobre las coordenadas OSM mediante haversine con radio terrestre de 6.371 km.

### Topología OSM inspeccionada

- El candidato de entrada 9258698133 pertenece al sendero de subida 477168992 y a una cerca 1003300249. La etiqueta `entrance=yes` es evidencia de entrada en la base; no verifica el estado físico actual.
- El mapa informativo 4705608441 es extremo compartido de Lomo Vetado 477170097, Calibre 12 1003300258 y Los Saltos 1003300259, además de caminos sin nombre. Es conectividad del modelo OSM, no una prueba de cuál símbolo o cruce de la fotografía corresponde.
- Los nodos 397645997, 397646020, 4705608466 y 4705609090 documentan conexiones superiores. No tienen nombres propios; no se los convirtió en Buitrera, Virgen ni otro hito por proximidad.
- En el área inspeccionada no apareció una vía OSM nombrada Starwars o Cactus. Esta consulta acotada no demuestra su ausencia fuera del área ni permite inventar sus trazados.

Versiones y fechas de las vías comprobadas:

| Vía OSM | Versión | Fecha UTC |
| --- | --- | --- |
| [Sendero Subida Buitrera — 477168992](https://www.openstreetmap.org/way/477168992) | 11 | 2024-05-29T18:50:47Z |
| [Sendero Lomo Vetado — 477170097](https://www.openstreetmap.org/way/477170097) | 6 | 2023-02-07T21:55:08Z |
| [Conexión Calibre 12-La Virgen — 477174834](https://www.openstreetmap.org/way/477174834) | 2 | 2021-11-17T01:25:04Z |
| [Sendero XL — 477174835](https://www.openstreetmap.org/way/477174835) | 5 | 2024-05-29T18:36:57Z |
| [Conexión Calibre 12-Lomo Vetado — 477174836](https://www.openstreetmap.org/way/477174836) | 3 | 2021-11-17T01:25:04Z |
| [Sendero Calibre 12 — 1003300258](https://www.openstreetmap.org/way/1003300258) | 2 | 2025-05-08T19:30:02Z |
| [Ssendero Los Saltos — 1003300259](https://www.openstreetmap.org/way/1003300259) | 1 | 2021-11-17T01:25:04Z |

## Independencia, límites y solicitudes fallidas

- Outlife página, JPG y PDF pertenecen a una única fuente operadora. No son tres mediciones independientes.
- Los puntos OSM nombrados y el candidato de entrada se editaron en el mismo changeset 113876046, 2021-11-17. Mapcarta, Ride Line u otras páginas que usen OSM no agregan independencia a esas coordenadas.
- La municipalidad confirma contexto vial, sin exactitud geográfica de los puntos del sendero. Wikiexplora enlaza mapas Outlife; sus rutas comunitarias y los puntos incrustados de Google no se aceptaron como controles.
- La herramienta web no pudo abrir la página OSM del nodo 4705608441; la API pública OSM sí respondió. Wikiexplora dio inicialmente timeout en la herramienta web y luego HTTP 200 en descarga directa.
- Las descargas HTTP directas de los dos PDF municipales devolvieron **403 Forbidden**. La herramienta web permitió leerlos; no se eludieron controles de acceso ni se forzaron reintentos por otras identidades.
- No se utilizaron claves, facturación, APIs de pago, ubicaciones personales ni copias de teselas comerciales. OSM se atribuye a sus colaboradores bajo [ODbL y política de atribución](https://www.openstreetmap.org/copyright).

**Resultado para calibración:** no validado. Faltan correspondencias inequívocas revisadas entre píxeles de la foto original y posiciones geográficas, con comprobaciones distribuidas espacialmente. El parentesco visual con un mapa oficial y la existencia de puntos OSM no bastan para declarar precisión GPS, inferir accesos por proximidad o ajustar una transformación como si estuviera comprobada.

Registro estructurado: [geographic-references.json](../../data/el-durazno/geographic-references.json).
