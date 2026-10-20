# Inventario geográfico de avenidas Parquemet

Revisión de evidencia: 20 de octubre de 2026 (UTC). Alcance: avenidas interiores identificadas en el mapa oficial y caminos de acceso que el mismo documento menciona. El inventario separa nombre, geometría y permiso ciclista; ninguno acredita apertura operacional actual.

## Resultado

- Las nueve fichas de avenidas existentes ya tenían geometría OSM: Pedro Bannen, Alberto Mackenna, Abate Molina, Carlos Martner, Carlos Reed, Claudio Gay, Federico Albert, Manuel Zañartu y La Montaña. Su ausencia percibida no era una ausencia total de datos.
- Faltaban las fichas `avenida-pablo-neruda`, `camino-rafael-elizalde` y `avenida-gabriela-mistral`. Gabriela Mistral ya estaba completa como contexto OSM y debe seguir excluida del GPS ciclista por `bicycle=no`.
- Faltaban seis vías consecutivas de Manuel Zañartu hacia Puente La Pirámide, documentadas por nombre, nodos compartidos y etiquetas ciclistas explícitas.
- La vía 1223734901 de La Montaña ya estaba en la fuente; puede atribuirse visualmente a esa avenida como referencia, pero sus etiquetas no permiten habilitarla para GPS ciclista.
- `los-turistas` queda pendiente: el plano sí identifica la calle exterior y el cuadro sí la usa para el acceso Zapadores–Mahuidahue, pero no permite escoger límites OSM exactos para sus 240 m sin recortar o inferir. No se incorporan todas sus vías urbanas.

## Fuentes y método

1. [PDF oficial conservado](../../sources/parquemet-mapa-oficial.pdf), publicado en <https://mapas.parquemet.cl/doc/MapaParque.pdf>. Inspección directa de la imagen [JPG original](../../sources/parquemet-mapa-oficial.jpg) y extracción de texto. El plano es esquemático y no suministra una geometría geográfica para registrar o calcar sobre OSM.
2. Catálogo previo `data/parquemet/geographic-catalog.json` y fuente previa `sources/parquemet-shared-osm.json`, SHA-256 `0954dccc4a9256fcb1a73a4af744efa8a0f0040770dc2e36c8506212cbcb1cbc`.
3. Descubrimiento nominal OSM en bbox lat/lon `(-33.44,-70.66,-33.36,-70.58)`: 1887 vías con nombre coincidente; respuesta Overpass de base `2026-10-20T19:44:36Z`. Se contrastó nombre, sector y conexiones; la consulta amplia no es una lista de importación.
4. Una consulta atómica posterior pidió las 106 vías previas, las 10 vías adicionales y la relación 17934042, con todos los nodos y metadatos. Se conserva la geometría original completa por vía, sin unir, recortar, simplificar, interpolar ni proyectar el esquema. La relación es de senderismo y no prueba permiso ciclista.

El permiso para GPS se sostiene solo en `bicycle=yes/designated/permissive`, infraestructura ciclista explícita o clasificación ciclista pertinente, siempre sujeto a restricciones. `motor_vehicle=no/permit/private` no equivale a permiso para bicicletas. La fecha de consulta no es una verificación de apertura en terreno.

## Las nueve fichas existentes

| ID estable | Nombre oficial / OSM | Vías y versiones previas | Situación |
| --- | --- | --- | --- |
| `avenida-pedro-bannen` | Av. Pedro Bannen / Avenida Pedro Bannen | [169885900 v11](https://api.openstreetmap.org/api/0.6/way/169885900/11), [480868066 v17](https://api.openstreetmap.org/api/0.6/way/480868066/17), [482748524 v5](https://api.openstreetmap.org/api/0.6/way/482748524/5), [482748525 v7](https://api.openstreetmap.org/api/0.6/way/482748525/7), [923017128 v7](https://api.openstreetmap.org/api/0.6/way/923017128/7), [929919509 v4](https://api.openstreetmap.org/api/0.6/way/929919509/4), [929919510 v5](https://api.openstreetmap.org/api/0.6/way/929919510/5), [929919511 v4](https://api.openstreetmap.org/api/0.6/way/929919511/4), [929919512 v4](https://api.openstreetmap.org/api/0.6/way/929919512/4) | Ya tenía geometría. Todas las vías seleccionadas registran carril o vía compartida ciclista. |
| `avenida-alberto-mackenna` | Av. Alberto Mackenna / Avenida Alberto Mackenna | [44579782 v43](https://api.openstreetmap.org/api/0.6/way/44579782/43), [442629926 v13](https://api.openstreetmap.org/api/0.6/way/442629926/13), [919288128 v7](https://api.openstreetmap.org/api/0.6/way/919288128/7), [922756659 v8](https://api.openstreetmap.org/api/0.6/way/922756659/8), [1035844715 v4](https://api.openstreetmap.org/api/0.6/way/1035844715/4) | Ya tenía geometría. Todas las vías seleccionadas registran carril o vía compartida ciclista. |
| `avenida-abate-molina` | Av. Abate Molina / Avenida Abate Molina | [292124343 v19](https://api.openstreetmap.org/api/0.6/way/292124343/19), [363378017 v8](https://api.openstreetmap.org/api/0.6/way/363378017/8), [480868638 v8](https://api.openstreetmap.org/api/0.6/way/480868638/8), [741162913 v8](https://api.openstreetmap.org/api/0.6/way/741162913/8), [1308348020 v1](https://api.openstreetmap.org/api/0.6/way/1308348020/1), [1308348021 v1](https://api.openstreetmap.org/api/0.6/way/1308348021/1), [1343882813 v2](https://api.openstreetmap.org/api/0.6/way/1343882813/2), [1343882814 v2](https://api.openstreetmap.org/api/0.6/way/1343882814/2) | Ya tenía geometría. Todas las vías seleccionadas registran carril o vía compartida ciclista. |
| `avenida-carlos-martner` | Av. Carlos Martner / Avenida Carlos Martner | [40140801 v20](https://api.openstreetmap.org/api/0.6/way/40140801/20), [69889085 v27](https://api.openstreetmap.org/api/0.6/way/69889085/27), [442592613 v11](https://api.openstreetmap.org/api/0.6/way/442592613/11), [442592614 v13](https://api.openstreetmap.org/api/0.6/way/442592614/13), [442633595 v8](https://api.openstreetmap.org/api/0.6/way/442633595/8) | Ya tenía geometría. Todas las vías seleccionadas registran carril o vía compartida ciclista. |
| `avenida-carlos-reed` | Av. Carlos Reed / Avenida Carlos Reed | [48549531 v27](https://api.openstreetmap.org/api/0.6/way/48549531/27), [909201230 v5](https://api.openstreetmap.org/api/0.6/way/909201230/5), [909201231 v4](https://api.openstreetmap.org/api/0.6/way/909201231/4), [922756671 v4](https://api.openstreetmap.org/api/0.6/way/922756671/4), [922756672 v5](https://api.openstreetmap.org/api/0.6/way/922756672/5) | Ya tenía geometría. Todas las vías seleccionadas registran carril o vía compartida ciclista. |
| `avenida-claudio-gay` | Av. Claudio Gay / Avenida Claudio Gay | [41160817 v30](https://api.openstreetmap.org/api/0.6/way/41160817/30), [542847079 v5](https://api.openstreetmap.org/api/0.6/way/542847079/5) | Ya tenía geometría. Todas las vías seleccionadas registran carril o vía compartida ciclista. |
| `avenida-federico-albert` | Av. Federico Albert / Avenida Federico Albert | [40140804 v31](https://api.openstreetmap.org/api/0.6/way/40140804/31) | Ya tenía geometría. Todas las vías seleccionadas registran carril o vía compartida ciclista. |
| `avenida-manuel-zanartu` | Av. Manuel Zañartu / Avenida Manuel Zañartu | [441864821 v14](https://api.openstreetmap.org/api/0.6/way/441864821/14) | Una vía previa; ampliar con seis vías consecutivas de acceso La Pirámide. |
| `avenida-la-montana` | Av. La Montaña / Avenida La Montaña | [120389660 v22](https://api.openstreetmap.org/api/0.6/way/120389660/22), [520212770 v8](https://api.openstreetmap.org/api/0.6/way/520212770/8), [1292391201 v3](https://api.openstreetmap.org/api/0.6/way/1292391201/3), [1292391202 v2](https://api.openstreetmap.org/api/0.6/way/1292391202/2) | Cuatro vías ciclistas previas; la quinta vía 1223734901 se conserva solo como referencia. |

Las condicionales `motor_vehicle:conditional=no @ (Su 09:00-14:00)` se conservan donde OSM las registra; no se convierten en una restricción para bicicletas. Los `oneway` y las etiquetas ciclistas laterales se mantienen por vía. El detalle completo de etiquetas, versiones y nodos está en la fuente atómica, y un índice por avenida se conserva en el recibo de trabajo descrito al final.

## Incorporaciones nominales y extensión

| ID / alcance | Correspondencia oficial | Vías, versión, cantidad de nodos | Acceso y uso geográfico |
| --- | --- | --- | --- |
| `avenida-pablo-neruda` | Avenida interior. Cuadro: Acceso La Pirámide → Mirador Los Gemelos, 2,9 km por Av. M. Zañartu y Av. P. Neruda; el trayecto total del cuadro no es la longitud OSM de esta avenida. | [160691199 v20](https://api.openstreetmap.org/api/0.6/way/160691199/20) (52 nodos) | `bicycle=permissive`, `cycleway=shared_lane`, `motor_vehicle=private`, `foot=yes`. Elegible para coincidencia GPS ciclista con permiso explícito; no demuestra apertura actual. |
| `camino-rafael-elizalde` | Camino de acceso interior desde Pedro de Valdivia hacia Teleférico Oasis, citado por nombre en el cuadro oficial (170 m referenciales). | [919288157 v2](https://api.openstreetmap.org/api/0.6/way/919288157/2) (6 nodos), [919288158 v4](https://api.openstreetmap.org/api/0.6/way/919288158/4) (2 nodos), [1343882815 v1](https://api.openstreetmap.org/api/0.6/way/1343882815/1) (4 nodos) | `motor_vehicle=no`. Sin `bicycle` ni `cycleway` explícito: visible como referencia, excluido del GPS ciclista. La longitud OSM suma aproximadamente 184 m y no sustituye los 170 m publicados. |
| `avenida-gabriela-mistral` | Avenida interior rotulada en el plano y mencionada en el cuadro: Mapulemu vía Av. A. Molina y Av. G. Mistral; también Tupahue → Pedro de Valdivia. No confundir con el sendero peatonal Gabriela Mistral de la leyenda. | [158170398 v20](https://api.openstreetmap.org/api/0.6/way/158170398/20) (42 nodos), [480868075 v5](https://api.openstreetmap.org/api/0.6/way/480868075/5) (10 nodos) | `bicycle=no`, `foot=yes`, `highway=pedestrian`, `motor_vehicle=no`. Visible como referencia peatonal, excluida del GPS ciclista. |
| `avenida-manuel-zanartu-extension` | Extensión del mismo nombre hacia Puente La Pirámide; conservar ID existente avenida-manuel-zanartu. El plano representa el corredor de La Pirámide y Bosque Santiago; el nombre y la conexión exacta provienen de OSM. | [577345674 v6](https://api.openstreetmap.org/api/0.6/way/577345674/6) (3 nodos), [1345175047 v2](https://api.openstreetmap.org/api/0.6/way/1345175047/2) (2 nodos), [47776335 v19](https://api.openstreetmap.org/api/0.6/way/47776335/19) (6 nodos), [1035844716 v3](https://api.openstreetmap.org/api/0.6/way/1035844716/3) (3 nodos), [802365175 v6](https://api.openstreetmap.org/api/0.6/way/802365175/6) (3 nodos), [47727162 v20](https://api.openstreetmap.org/api/0.6/way/47727162/20) (10 nodos) | Todas tienen `cycleway=lane` o `bicycle=yes`; sin prohibición ciclista. Elegibles para coincidencia GPS; operación sin confirmar. |
| `avenida-la-montana-context` | 1223734901 está enlazada a La Montaña por nombre exacto y nodo 4760402169 compartido con 120389660; conservar el ID existente. | [1223734901 v2](https://api.openstreetmap.org/api/0.6/way/1223734901/2) (3 nodos) | `highway=residential`, `motor_vehicle=permit`; sin `bicycle` ni infraestructura ciclista explícita. Referencia solamente. |

La denominación abreviada del cuadro se declara expresamente: `Av. P. Neruda` → OSM `Avenida Pablo Neruda`, compatible con el sector Mirador Los Gemelos; `Av. G. Mistral` → `Avenida Gabriela Mistral`, respaldada además por la rotulación completa del plano; `Camino Rafael Elizalde` coincide literalmente. Estas equivalencias son por elemento, no una normalización automática de otros nombres.

### Límites geográficos originales

Orden de coordenadas: longitud, latitud (EPSG:4326). Las cajas siguientes describen la geometría OSM; no son límites legales del parque.

| Grupo | Oeste | Sur | Este | Norte |
| --- | ---: | ---: | ---: | ---: |
| `avenida-pablo-neruda` | -70.6112448 | -33.4075972 | -70.6101142 | -33.4039459 |
| `camino-rafael-elizalde` | -70.6175274 | -33.4152185 | -70.6159911 | -33.4143619 |
| `avenida-gabriela-mistral` | -70.6229021 | -33.4171729 | -70.6179437 | -33.4140453 |
| `avenida-manuel-zanartu-extension` | -70.6019812 | -33.3896647 | -70.6012966 | -33.3866189 |
| `avenida-la-montana-context` | -70.6214812 | -33.4138568 | -70.6211989 | -33.4138198 |

### Continuidad comprobable de Zañartu

La vía previa 441864821 termina en el nodo 612440489. Las seis vías adicionales forman esta cadena exacta (se conservan sus orientaciones originales):

`441864821 → [612440489] → 577345674 → [6938700276] → 1345175047 → [12444737032] → 47776335 → [612440420] → 1035844716 → [5035918756] → 802365175 → [612440402] → 47727162 → [6022945802]`.

No se crea una unión geométrica artificial. La vía 47776335 registra `bridge=yes`, `bridge:name=Puente La Pirámide`, `layer=2`, `bicycle=yes` y `cycleway=lane`. La suma geodésica aproximada de las seis vías es 356 m; es una medida geográfica de referencia y no una distancia oficial.

## Pendientes y exclusiones

- **Los Turistas:** vía urbana exterior documentada para llegar desde Zapadores a Mahuidahue. Hallazgos de nombre exacto: 21167375 v13, 520212771 v11, 1199349401 v2, 1199349402 v1, 1199349403 v4, 1199349404 v4, 1199994470 v6 y 1199994471 v3. Algunas registran infraestructura ciclista, otras no. No se atribuye la calle completa ni se habilita GPS por proximidad. El recorte del plano muestra el rótulo exterior; el cuadro publica 240 m, pero no identifica los nodos extremos OSM.
- **Pablo Neruda urbano de Recoleta:** 24638023, 445941884, 618096769 y 1332104009 están al norte del sector del parque y no son la avenida interior 160691199. Excluidos.
- **Vías urbanas de fondo** como Recoleta, El Salto, Perú, Américo Vespucio y Vitacura no se incorporan por aparecer en el fondo del plano.
- **Senderos y caminos de servicio:** nombres como Camino Federico Johow, Camino de Servicio, Camino Siete Palabras y Camino El Excursionista aparecieron en el descubrimiento. No se reclasifican como avenidas ni se habilitan para bicicletas; no forman parte de las avenidas/caminos nominales de acceso incorporados por esta corrección.

## Recibo atómico y reproducibilidad

- Consulta UTC: `2026-10-20T19:47:49.932301+00:00`; base OSM: `2026-10-20T19:47:36Z`; HTTP `200`.
- Respuesta original: `691403` bytes; SHA-256 `8be2358193cc8d2a77f506b4bb20117976265ea44264b17b7d15cad583dab1aa`.
- Objetos únicos: 116 vías, 2694 nodos, 1 relación. Overpass repitió 42 vías idénticas al emitir las vías solicitadas y luego los miembros de la relación; se deduplican por `(type,id)` sin alterar campos.
- Ninguna vía solicitada falta. Los 2722 objetos del shared previo (106 vías, 2615 nodos, 1 relación) conservan todos sus campos. Los 2042 objetos de `sources/parquemet-osm.json`, SHA-256 `4cb185c60c137a15810fb941ca20954bcae6be09487cc27c580617ba156e3e1c`, también conservan todos sus campos.
- No se ejecutaron compilación, pruebas globales, despliegues ni escrituras de catálogo/fuente durante este inventario.

Archivos de trabajo en `/workspace/scratch/parquemet-avenues/geo/`:

| Archivo | Contenido |
| --- | --- |
| `atomic-union-query.overpassql` | Consulta exacta con las 106 vías previas, 10 adicionales, relación 17934042 y recursión de nodos. |
| `atomic-union-response.json` | Bytes originales de la respuesta 200; conserva IDs, versiones, marcas de tiempo, nodos, relación y coordenadas. |
| `atomic-union-receipt.json` | URL reproducible, consulta, hora, cabeceras, SHA-256, objetos únicos/duplicados y comparación íntegra contra ambas fuentes previas. |
| `atomic-union-elements-normalized.json` | Objetos únicos, únicamente retirando user/uid/changeset; no altera IDs, versiones, marcas de tiempo, tags, nodos, miembros ni coordenadas. |
| `existing-avenue-inventory.json` | Índice de las nueve fichas previas: versiones, etiquetas completas, IDs de nodo y geometrías por vía. |
| `candidate-inventory.json` | Cada vía candidata: URL pública/API de versión exacta, versión, fecha OSM, etiquetas, lista completa de IDs de nodo, geometría longitude/latitude y bounds. |
| `discovery-query.overpassql`, `discovery-response.json`, `discovery-receipt.json` | Consulta amplia de identificación, recibida 200; no implica autorización de importar todos sus resultados. |
| `official-map-text.txt`, `official-distance-panel.jpg`, `map-west.jpg`, `map-center.jpg`, `map-east.jpg` | Texto y recortes del documento conservado para inspección directa. |
| `access-discovery-receipt.json`, `access-discovery-response.json` | Consulta auxiliar de accesos respondió 502; no se utiliza como evidencia de ausencia ni para tomar decisiones geográficas. |

Los artefactos scratch son recibos de revisión; el catálogo final debe apuntar a la fuente versionada y no depender de rutas temporales para funcionar.

## IDs de nodo de las vías candidatas

Las coordenadas en el mismo orden constan completas en `candidate-inventory.json` y en los objetos node de la respuesta atómica.

### `avenida-pablo-neruda`

- `160691199 v20`: `5709141058,5709141059,5709141057,5247968764,8038505191,5180937702,483170532,1727255785,4386585433,1727255787,5247968766,5247968765,1727255788,1727255789,5247968767,1727255790,2953717205,6816215934,5247968768,2953717206,5247968769,1727255791,5247968770,1727255792,5180937700,5247968771,5247968772,1727255793,1727255794,5247968773,1727255795,5180937699,1727255796,5247968774,1727255797,5180937715,2953717105,5247970147,1727255798,2832925083,5247968775,5247968776,5247968777,5247968778,5247968779,5247968780,5247968781,5247968782,5247968783,5247968784,5247968786,2652513977`.

### `camino-rafael-elizalde`

- `919288157 v2`: `8538143523,3675470794,4400251491,3675470795,4400251492,8538143412`.
- `919288158 v4`: `8538143524,8538143523`.
- `1343882815 v1`: `265686747,3675470792,3675470793,8538143524`.

### `avenida-gabriela-mistral`

- `158170398 v20`: `2953717039,8735367666,3995884241,1704038891,1704038896,1704038898,2956545064,2956545065,2956545066,1704038901,2956545057,3995884240,1704038897,3995884239,2953717037,1704038895,2956545047,2956545042,1704038892,2953717036,4403050060,2956544931,4403050059,2956544918,1704038887,2953717035,4403050058,1704038888,1704038886,4786657352,5180937672,1704038885,1704038884,7009221363,4362150716,1704038879,6938709819,8373981206,4732681452,1704038871,2956544870,265686725`.
- `480868075 v5`: `4732681472,2956544891,2956544896,5180937674,5180937675,2956544898,2956544902,2956544907,2956544915,2953717035`.

### `avenida-manuel-zanartu-extension`

- `577345674 v6`: `612440489,3995918365,6938700276`.
- `1345175047 v2`: `12444737032,6938700276`.
- `47776335 v19`: `612440420,612440450,7505333256,7505333260,1949583874,12444737032`.
- `1035844716 v3`: `5035918756,12223582948,612440420`.
- `802365175 v6`: `612440402,2730370979,5035918756`.
- `47727162 v20`: `6022945802,12445573397,12223582937,2832908331,612440395,612440398,4787199482,4787199481,4787199480,612440402`.

### `avenida-la-montana-context`

- `1223734901 v2`: `4760402169,5290653562,4760402170`.
