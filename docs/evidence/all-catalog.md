# Catálogo completo del cartel de El Durazno

Revisión: 18-10-2026, America/Santiago (consulta19-10-2026 UTC). El catálogo contiene los **20 nombres de la leyenda**, además del tramo geográfico **Subida Buitrera** previamente identificado: 21 fichas, 11 con correspondencia nominal OSM y 10 sin geometría geográfica acreditada. Se conservan los IDs `subida-buitrera`, `la-virgen`, `lomo-vetado` y `starwars`, así como las fichas principales `subida-buitrera` y `la-virgen`.

## Evidencia de nombres y dificultades

Se contrastó la fotografía privada completa `81184.jpg` (960 × 1280; SHA-256 `c6391281460cc5c6ad65d61069bd310bdd1dd64b8fedbb4d2c12d81898668fb9`) con el [JPG oficial de Outlife](https://www.outlife.cl/wp-content/uploads/2020/07/Mapa_El-Durazno-2022_web_Mesa-de-trabajo-1.jpg), conservado en `sources/el-durazno-official-2022.jpg` (2570 × 3077; SHA-256 `ee124136bc9930ca1928d2df1f79a9810fb4d245c66503a2d4c6ae888aea29af`). La fotografía permanece en el almacén privado; esta ampliación del catálogo no copia su binario al repositorio.

Las dificultades e iconos Park/Trail se leen en la leyenda oficial. `difficulty.label` almacena el nivel y `difficulty.style` el tipo impreso. Park/Trail no se convierte en una clasificación geográfica ni en una medición de terreno. Las mayúsculas de la leyenda se presentan como nombres legibles. El impreso `ROCK N´ROLL` se muestra como **Rock N’Roll**, manteniendo su diferencia con la grafía literal de OSM.

| ID estable | Nombre visible | Nivel | Tipo | Estado geográfico |
| --- | --- | --- | --- | --- |
| `subida-buitrera` | Subida Buitrera | Sin acreditar | Sin acreditar | OSM por nombre |
| `chilling` | Chilling | Principiante | Park | Referencia pública |
| `papaya` | Papaya | Principiante | Trail | OSM por nombre |
| `la-virgen` | La Virgen | Principiante | Park | Referencia pública |
| `parcero` | Parcero | Principiante | Park | OSM por nombre |
| `skills` | Skills | Intermedio | Park | Referencia pública |
| `mampato` | Mampato | Intermedio | Park | OSM por nombre |
| `starwars` | Starwars | Intermedio | Trail | Referencia pública |
| `cactus` | Cactus | Intermedio | Trail | Referencia pública |
| `lomo-vetado` | Lomo Vetado | Intermedio | Park | OSM por nombre |
| `la-bala` | La Bala | Intermedio | Park | OSM por nombre |
| `cebolla` | Cebolla | Avanzado | Park | OSM por nombre |
| `los-saltos` | Los Saltos | Avanzado | Park | OSM por nombre |
| `el-gringo` | El Gringo | Avanzado | Park | Referencia pública |
| `el-duro` | El Duro | Avanzado | Trail | Referencia pública |
| `xl` | XL | Experto | Trail | OSM por nombre |
| `rock-n-roll` | Rock N’Roll | Experto | Trail | OSM por nombre |
| `las-nieves` | Las Nieves | Experto | Trail | Referencia pública |
| `calibre-12` | Calibre 12 | Experto | Park | OSM por nombre |
| `calibre-loco` | Calibre Loco | Experto | Trail | Referencia pública |
| `mordor` | Mordor | Experto | Park | Referencia pública |

Cada nombre de la leyenda incluye `visualTrailId` igual a su ID estable para asociar su ficha con la capa visual. Esta asociación es nominal: no demuestra igualdad de extensiones entre el dibujo y OSM. **Subida Buitrera mantiene `visualTrailId: null`**: el rótulo visual «Subida» no identifica inequívocamente toda la vía OSM «Sendero Subida Buitrera».

## Correspondencias OSM explícitas

Se usa únicamente `sources/el-durazno-osm.json`, snapshot existente de [OpenStreetMap](https://api.openstreetmap.org/api/0.6/map?bbox=-70.518,-33.328,-70.485,-33.290), atribuido a sus colaboradores bajo ODbL-1.0. No se cambia su contenido, URL ni SHA-256 `b8926fb02ddcc2410850d831312e64a5c51e5aeb9db49ce970a86e418a0df318`. Se mantiene `schemaVersion: 1`.

Cada vía asignada debe cumplir simultáneamente el ID escrito en `osmWayIds` y el nombre literal escrito en `osmNames`. No se normalizan mayúsculas, acentos, apóstrofos o espacios al atribuir una vía. Los errores tipográficos reales quedan documentados como aliases explícitos.

| Ficha | Vía OSM | Versión | Nodos | `name` literal aceptado en `osmNames` |
| --- | --- | --- | --- | --- |
| Subida Buitrera | [477168992](https://www.openstreetmap.org/way/477168992) | 11 | 145 | `Sendero Subida Buitrera` |
| Papaya | [747369689](https://www.openstreetmap.org/way/747369689) | 3 | 63 | `Sendero Papaya` |
| Parcero | [1003300262](https://www.openstreetmap.org/way/1003300262) | 1 | 39 | `Sendero Parcero` |
| Mampato | [478641797](https://www.openstreetmap.org/way/478641797) | 4 | 35 | `Sendero Mampato` |
| Mampato | [1003300261](https://www.openstreetmap.org/way/1003300261) | 1 | 12 | `Sendero Mampato` |
| Lomo Vetado | [477170097](https://www.openstreetmap.org/way/477170097) | 6 | 127 | `Sendero Lomo Vetado` |
| La Bala | [1003300263](https://www.openstreetmap.org/way/1003300263) | 2 | 57 | `Sendero la Bala` |
| Cebolla | [1003300260](https://www.openstreetmap.org/way/1003300260) | 2 | 51 | `Sendero Cebolla` |
| Los Saltos | [1003300259](https://www.openstreetmap.org/way/1003300259) | 1 | 22 | `Ssendero Los Saltos` |
| XL | [75311770](https://www.openstreetmap.org/way/75311770) | 4 | 49 | `Sendero XL` |
| XL | [477174835](https://www.openstreetmap.org/way/477174835) | 5 | 60 | `Sendero XL` |
| Rock N’Roll | [1003300257](https://www.openstreetmap.org/way/1003300257) | 1 | 60 | `Sendero Rock´n Roll` |
| Calibre 12 | [1003300258](https://www.openstreetmap.org/way/1003300258) | 2 | 100 | `Sendero Calibre 12` |

El conversor conserva las 79 vías del snapshot como 79 Features independientes, con los IDs, versiones, fechas, etiquetas, secuencia completa de nodos y coordenadas originales en orden longitud/latitud. Las 13 vías nominalmente acreditadas reciben un `targetId`; las otras 66 permanecen como contexto. No se simplifican, empalman, rellenan ni corrigen sus líneas.

Las dos vías de Mampato comparten un nodo y ninguna arista: una termina dentro de la otra, en el nodo 4718548374. Se mantienen como ramales independientes. Las dos vías XL comparten el extremo 397646284 y ninguna arista; también se conservan separadas. Agruparlas bajo una ficha por nombre no crea una línea continua nueva.

Permanecen sin ficha nominal las vías `Conexión a La Bala` (477170748), `Conexión Calibre 12-La Virgen` (477174834), `Conexión Calibre 12-Lomo Vetado` (477174836), `Conexión Plaza Saltos-Mampato/Papaya` (747368856) y `Sendero Olímpico-La Bala` (1003300264). Este último es un nombre propio distinto y no se convierte en La Bala. Una vía sin nombre tampoco identifica ninguna de las pistas pendientes.

## Diez pistas sin geometría geográfica acreditada

Chilling, La Virgen, Skills, Starwars, Cactus, El Gringo, El Duro, Las Nieves, Calibre Loco y Mordor usan `status: public-reference`, `osmWayIds: []`, `osmNames: []`, `geometryImported: false` y `geometry: null`. Las fichas sin enlace individual acreditado remiten a la [página oficial del parque](https://www.outlife.cl/parques/rkf-el-durazno/).

Se mantienen las referencias individuales de Trailforks para [La Virgen 205330](https://www.trailforks.com/trails/la-virgen-205330/) y [Starwars 76316](https://www.trailforks.com/trails/star-wars-76316/). Son enlaces externos; no se importan sus coordenadas ni datos protegidos. El dibujo visual se guarda por separado en unidades de imagen y no se usa para producir GeoJSON. `visualToGeographicTransform` sigue en `null` y `navigationValidated` en `false`.

Todas las fichas mantienen `elevationGainM: null` y `elevationLossM: null`, y la velocidad máxima figura como «Sin registros». No hay mediciones que permitan rellenar esos valores. Las distancias cartográficas se calculan exclusivamente sumando las aristas geodésicas de las vías OSM disponibles; no prueban longitud completa de la pista ni estado actual de acceso o sentido.

## Verificación reproducible

Primero se añadieron las pruebas: fallaron seis casos que detectaban las 17 fichas ausentes, las atribuciones nominales nuevas, los aliases obligatorios y el rechazo de nombres no acreditados. Después de implementar el catálogo y el conversor, el comando `node --test tests/parks.test.mjs tests/geographic.test.mjs` pasa **13/13 pruebas**.

Las pruebas cubren los 21 IDs y nombres esperados, los 20 niveles y tipos de leyenda, las diez referencias sin geometría, los enlaces individuales conservados, las 13 atribuciones OSM por ID y nombre exacto, las 79 secuencias completas de nodos y coordenadas, las dos vías separadas de Mampato/XL, y el rechazo de conexiones, nombres aproximados, vías sin nombre, vías asignadas ausentes, píxeles, ejes invertidos y nodos faltantes. Se verificaron además los SHA-256 de la fuente OSM, el JPG oficial y la fotografía privada sin modificarlos.
