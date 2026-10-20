# Parquemet: cobertura ciclista y fuentes geográficas

Revisión del 20 de octubre de 2026 (UTC). Este documento actualiza las cifras y atribuciones de `parquemet-geographic.md`: **los ocho senderos ciclistas del PDF tienen ahora geometría OSM atribuida explícitamente**. Las diferencias de escritura de Zorzal y Pa’ arriba no justificaban ocultar sus vías ya disponibles. La restricción de acceso se conserva y excluye su uso en la coincidencia GPS.

La selección se amplía de 33 vías / 1.260 nodos a **62 vías / 1.980 nodos**: 59 vías atribuidas a ocho senderos y nueve avenidas secundarias, más tres vías de contexto. La red experimental GPS contiene **56 vías**. Estas cifras describen la selección importada; no prueban cobertura completa, continuidad ni apertura del parque.

## Fuente principal y preservación de coordenadas

- Edición solicitada: <https://mapas.parquemet.cl/doc/MapaParque.pdf>, retenida como `sources/parquemet-mapa-oficial.pdf`; 765.376 bytes, SHA-256 `e7606172479a0fd585f7f3dcb4187556a202778cd647b31f44aaefcf9bd03cf8`. Su leyenda roja contiene ocho senderos. Nombres y distancias publicados se conservan sin incorporar otras ediciones.
- Respuesta original Overpass del **2026-10-20T15:04:36.262293+00:00**, base OSM `2026-10-20T15:03:08Z`: 360 vías, 6.739 objetos y 1.568.537 bytes. SHA-256 `ad252f77463c909acceeee9fe3544a4c14e14d5fe925442933eaa9dbac231294`. La consulta íntegra y URL están en `sources/parquemet-osm.json`. La ampliación usa esa misma respuesta, no una consulta posterior con coordenadas mezcladas. Durante esta revisión permanece en `/workspace/scratch/parquemet/osm-overpass.json`; es material temporal, no una dependencia del visor ni de los tests.
- Snapshot seleccionado `sources/parquemet-osm.json`: SHA-256 **`4cb185c60c137a15810fb941ca20954bcae6be09487cc27c580617ba156e3e1c`**. Conserva 2.042 objetos originales. La comparación con la respuesta original arroja **cero diferencias** después de omitir únicamente `user`, `uid` y `changeset`. Se preservan identificadores, versiones, marcas temporales, etiquetas, coordenadas y orden de nodos de cada vía.
- Huella independiente de geometría/versiones, calculada de los objetos seleccionados de la respuesta original: `5719f4586795a98115fce889bbbf2f19b1bd59838813b70992b73bb80bc2d43b`. El test ordena objetos por tipo/ID y serializa `[type,id,version,timestamp,[lon,lat] o nodes]` con JSON compacto. Esta huella fija todos los nodos y órdenes de vía; evita que una modificación conjunta del catálogo y su hash convierta coordenadas cambiadas en datos aparentemente originales.

Se conservan vías enteras sin recortar en el borde de la consulta, unir extremos, interpolar huecos, simplificar curvas ni ajustar sus longitudes a las del PDF. La extensión importada es `[-70.6380693,-33.4307172,-70.6017231,-33.3894875]` en orden oeste/sur/este/norte; no es un límite administrativo. Algunas vías tienen nodos fuera del rectángulo de búsqueda, como Pirámide al norte de -33.39. EPSG:4326 y orden longitud/latitud son exclusivos de OSM. El PDF es un esquema: `visualToGeographicTransform: null`, `navigationValidated: false`; no suministra ninguna coordenada GPS.

## Ocho senderos: correspondencias declaradas

| Nombre en el PDF | Vías OSM (versión) | Nombre OSM literal | PDF / OSM importado, redondeado |
| --- | --- | --- | ---: |
| Centenario | 749895576 (6), 1307648383 (2), 1307648385 (4) | Sendero Ciclista Centenario | 900 / 609 m |
| 4 ½ | 479769031 (9), 479771255 (8), 512366462 (8) | Sendero Ciclista 4 ½ | 1.000 / 1.571 m |
| Anfiteatro | 479769658 (11), 691091448 (6), 929919497 (3), 929919498 (3), 929919499 (3), 1309108626 (2) | Sendero Ciclista Anfiteatro | 700 / 1.218 m |
| La S | 906948595 (6) | Sendero Ciclista La S | 500 / 458 m |
| Zorzal | **862880882 (6)** | **Sendero Ciclista El Zorzal** | 500 / 445 m |
| Pa’ arriba | **691091446 (6)** | **Sendero Ciclista Pa' Arriba** | 600 / 610 m |
| Torre 5 | 741162897 (8), 1316047257 (2), 1316047258 (2) | Sendero Ciclista Torre 5 | 800 / 787 m |
| Pirámide | 479774004 (9) | Sendero Ciclista Pirámide | 600 / 848 m |

Las longitudes OSM son sumas geodésicas de las vías importadas, no certificaciones del recorrido completo. Las diferencias grandes de Centenario, 4 ½, Anfiteatro y Pirámide se mantienen visibles; no se ocultan ni se corrigen cambiando coordenadas.

Las correspondencias nuevas se basan conjuntamente en nombre, categoría, referencia de fuente del objeto y contexto cartográfico:

- **Zorzal / El Zorzal:** el artículo «El» y el prefijo «Sendero Ciclista» aparecen en OSM. La vía 862880882 es `highway=cycleway`, `incline=down`, `oneway=yes`. Su etiqueta `source` cita <https://parquemet.cl/lugares/sendero-el-zorzal-descenso-ciclistas/>. Su extremo 6484453802 es compartido con Anfiteatro (691091448); el nodo 8613999020 coincide con Pa’ arriba. En el PDF, los números rojos 5 y 6 aparecen en el mismo sector Embalse / Anfiteatro Pablo Neruda y La S está próxima. Esto respalda la atribución cartográfica del alias; no constituye una confirmación oficial de identidad emitida por la página web.
- **Pa’ arriba / Pa' Arriba:** cambia el apóstrofo tipográfico por uno recto y la mayúscula de «Arriba». La vía 691091446 es `highway=cycleway`, `incline=up`, `oneway=yes`; su etiqueta `source` cita <https://parquemet.cl/lugares/sendero-pa-arriba-ascenso-ciclistas/>. El nodo inicial 6484453796 es compartido con Anfiteatro y el final 8613999021 con La S (906948595). Su posición relativa concuerda con ese mismo sector del esquema y la pareja ascenso/descenso registrada en OSM.

Para inspección de los originales: Pa’ arriba conserva 158 nodos, desde `6484453796 [-70.6092837,-33.3999925]` hasta `8613999021 [-70.6101951,-33.4033109]`; Zorzal conserva 82 nodos, desde `8613999020 [-70.6101738,-33.4032642]` hasta `6484453802 [-70.6103459,-33.400559]`. No se dedujo una transformación entre estas posiciones y píxeles del PDF.

`osmNames` guarda los nombres OSM exactos y cada atribución requiere su ID explícito. No se añade normalización automática de artículos, apóstrofos ni mayúsculas; un nombre no declarado sigue rechazándose. Ambas fichas pasan a `osm-identified` / `geometryImported: true` y dejan de ser referencias sin trazado.

Las dos páginas oficiales de senderos se volvieron a solicitar entre **15:36:47 y 15:36:53 UTC** y respondieron **HTTP 503**. No se leyó su contenido ni se usa su inaccesibilidad como evidencia de un alias oficial o de apertura. La evidencia web utilizada aquí es la URL que OSM registra en su etiqueta `source`.

## Nueve avenidas secundarias y contexto preservado

El PDF abrevia «Av.» y OSM escribe «Avenida»; el nombre propio se conserva literalmente. Se incorporan las siete avenidas compatibles que estaban en la respuesta original pero se omitieron del snapshot inicial. Todos los tramos atribuidos tienen `cycleway=lane` o `shared_lane` —incluidas variantes laterales— y no presentan prohibición explícita de bicicletas/acceso. El catálogo prioriza ahora `centenario` y `cuatro-y-medio`; las avenidas son referencias secundarias, todas con `category: avenue`.

| Nombre OSM literal | Vías atribuidas (versión) | Observación |
| --- | --- | --- |
| Avenida Pedro Bannen | 169885900 (11), 480868066 (17), 482748524 (5), 482748525 (7), 923017128 (7), 929919509 (4), 929919510 (5), 929919511 (4), 929919512 (4) | Nueve vías ya incluidas; infraestructura lateral preservada |
| Avenida Alberto Mackenna | 44579782 (43), 442629926 (13), 919288128 (7), 922756659 (8), 1035844715 (4) | Cinco vías ya incluidas; infraestructura lateral preservada |
| Avenida Abate Molina | 292124343 (19), 363378017 (8), 480868638 (8), 741162913 (8), 1308348020 (1), 1308348021 (1), 1343882813 (2), 1343882814 (2) | Ocho vías añadidas, `cycleway=lane` |
| Avenida Carlos Martner | 40140801 (20), 69889085 (27), 442592613 (11), 442592614 (13), 442633595 (8) | Cinco vías añadidas, `cycleway=lane` |
| Avenida Carlos Reed | 48549531 (27), 909201230 (5), 909201231 (4), 922756671 (4), 922756672 (5) | Cinco vías añadidas, `cycleway=lane`; no se confunde con la calle urbana «Carlos Reed» |
| Avenida Claudio Gay | 41160817 (30), 542847079 (5) | Dos vías añadidas, `cycleway=lane` |
| Avenida Federico Albert | 40140804 (31) | Una vía añadida, `cycleway=lane` |
| Avenida Manuel Zañartu | 441864821 (14) | Una vía añadida, `cycleway=lane` |
| Avenida La Montaña | 120389660 (22), 520212770 (8), 1292391201 (3), 1292391202 (2) | Cuatro vías añadidas con `bicycle=yes`, `access=yes` y `cycleway=lane` |

La vía **1223734901 (v2), Avenida La Montaña**, se conserva entera como contexto, con `targetId: null`. No tiene `bicycle` ni `cycleway`; su compatibilidad ciclista queda sin probar. La selección no rellena ese tramo ni afirma continuidad entre los cuatro tramos atribuidos.

**Avenida Gabriela Mistral**, vías **158170398 (v20)** y **480868075 (v5)**, se conserva como contexto geográfico íntegro; ambas llevan `highway=pedestrian`, `bicycle=no`, `targetId: null`. No se presentan como avenida ciclista ni entran en GPS. El PDF también ubica Gabriela Mistral entre los senderos peatonales. Las tres vías de contexto figuran con motivo explícito en `source.contextWays`.

La ausencia de otros senderos peatonales o calles de las 360 vías originales no demuestra un sendero ciclista perdido. Muchos están marcados `bicycle=no`, `access=no` o no tienen evidencia ciclista. La selección es nominal y parcial, no un inventario de toda la vialidad del parque.

## Otras fuentes oficiales investigadas

<https://mapas.parquemet.cl/> respondió **200** el **2026-10-20T15:36:42 UTC**, 6.365 bytes, SHA-256 `4bdfd1c42275b9a8acc701cee2c4eba73a7a41034c90fdf585b29412e1568456`. Su HTML publica enlaces a PDFs, al portal de parques urbanos y al perfil de Parquemet en SUDA. Sus scripts son Analytics y dependencias jQuery/Popper/Bootstrap; no expone un visor cartográfico ni un enlace GeoJSON, KML, GPX o servicio SIG para los ocho senderos. Esto describe el portal inspeccionado, no prueba que no exista información geográfica oficial en otro lugar.

La otra edición pública <https://mapas.parquemet.cl/doc/Map_Parquemet_DIC.pdf> respondió **200** a las **15:37:33 UTC**, 3.371.379 bytes, SHA-256 `c0bb7ba4a6d2c4a33bde5635b55133d4e0697b4a73dd116af969bcd5e3712f5e`. Tiene una página y metadata de creación/modificación del **2021-12-31**; esa metadata no certifica fecha editorial ni vigencia. Su texto conserva Zorzal y Pa’ arriba, pero también incorpora Pichon Line y Chicken Line y difiere en la leyenda. No se mezclan esas rutas con los ocho nombres de la edición solicitada ni se atribuyen vías OSM por proximidad.

El portal oficial enlaza <https://suda.io/profile/tbeE4GSQz2>, que responde **200** y redirige a <https://suda.io/person/tbeE4GSQz2>, título «Parquemet - SUDA Outdoors». El frontend público publica un listado de nueve actividades del autor Parquemet y endpoints de recorrido/GPX. Se inspeccionaron mediante las mismas peticiones de lectura públicas del frontend:

- <https://suda.io/api/v1/person/tbeE4GSQz2/routes?offset=0>: **200**, nueve actividades; no aparecen los ocho nombres de la leyenda roja. Incluye «Parquemet Metropolitano», Atacameño, Gabriela Mistral, Zorro Vidal, Boy Scout, Cerro El Carbón, Sendero Mapuche, Anáhuac Casa de la Cultura y Ermitaño alto/Ermitaño Bajo.
- <https://suda.io/api/v1/activity/XJPs5s4GDc>: **200**, actividad «Parquemet Metropolitano», autor Parquemet, `isPublic: true`, **`sportKey: Running`**, distancia registrada 11,2796 km, creada en 2025 y con GPX fechado el **2021-04-18**. SHA-256 de metadata `9f26cd6880b386a04c90fa56b795a88a2b5ea10ee2fba9323413484845f8e041`.
- <https://suda.io/api/v1/activity/XJPs5s4GDc/route>: **200**, coordenadas GPX disponibles, 85.091 bytes, SHA-256 `3b6a823cb80ed396f9720af17f81e8c3b2f78256b18309ab27713d4cf9b5efde`. El nombre y la descripción no establecen que sea el Paseo Metropolitano ni una red ciclista.

La leyenda verde del PDF sí muestra peatón y bicicleta para el **Paseo Metropolitano**, con seis tramos y distancias referenciales: Parque B. de la Infancia 940 m, Sendero de los Sentidos 540 m, Bellavista 1 km, Pedro de Valdivia 1,5 km, Pirámide / Jardín Japonés 3,7 km y La Cascada 1,2 km. Ninguna vía de la respuesta OSM original tiene ese nombre y el track SUDA de running no demuestra equivalencia a esos seis tramos. Por ello no se atribuyen coordenadas del track al Paseo, no se añade como geometría ciclista y no se amplía GPS con esa fuente. Su representación en el PDF sigue siendo consultable. No se añadió ningún JSON de fuente SUDA al proyecto.

## Restricciones y verificación

Las vías **479769658** (Anfiteatro), **691091446** (Pa’ arriba) y **862880882** (Zorzal) conservan `access=no`, `check_date=2024-08-20` y se muestran como referencia geográfica. **Mostrar su trayectoria no habilita GPS**. Las fichas mantienen la advertencia por ID. Cinco de las seis vías de Anfiteatro siguen sin esa restricción; no se declara cerrado todo el sendero. Los horarios, sentidos efectivos, apertura, seguridad, dificultad y desniveles no están confirmados; `operationConfirmed` sigue en `false` para todo el catálogo.

TDD: antes de modificar los datos, las comprobaciones fallaron por 33/62 vías, seis/ocho senderos atribuidos, prioridades antiguas, extensión antigua y contexto no ampliado. Después, `node --test tests/parquemet-sources.test.mjs tests/bike-network.test.mjs` pasa **9/9**: ocho identidades/distancias de la edición, hash del snapshot, 62 vías/1.980 nodos y versiones, huella completa de geometría original, variantes explícitas, nueve avenidas con evidencia por vía, contexto retenido y exclusión GPS de los seis objetos no elegibles. La comparación independiente con la respuesta Overpass original confirma los 2.042 objetos seleccionados sin diferencias salvo metadata de contribuyentes. No se exige validación de terreno para mostrar la geometría fuente ni se introduce un umbral arbitrario de controles.
