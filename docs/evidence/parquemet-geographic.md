# Parquemet: catálogo geográfico y procedencia

Consulta: 20 de octubre de 2026 (UTC). El catálogo incorpora **ocho nombres ciclistas de la edición aportada del mapa oficial**, seis correspondencias nominales con OSM y dos avenidas principales. Dos variantes nominales de OSM se conservan solo como contexto sin atribuirles un sendero del PDF. Ninguna coordenada procede del dibujo esquemático.

## Fuentes y fechas

- PDF solicitado: <https://mapas.parquemet.cl/doc/MapaParque.pdf>, descargado el **2026-10-20T15:01:06.256455+00:00**, 765.376 bytes. SHA-256 `e7606172479a0fd585f7f3dcb4187556a202778cd647b31f44aaefcf9bd03cf8`. Copia retenida: `sources/parquemet-mapa-oficial.pdf`; metadata documental en `data/parquemet/official-document.json`. El archivo tiene una página esquemática. La fecha de consulta no prueba que su contenido haya sido actualizado en 2026.
- OSM por Overpass: host <https://overpass-api.de/api/interpreter>, consulta y URL exactas incluidas en `sources/parquemet-osm.json`. Recuperado el **2026-10-20T15:04:36.262293+00:00**; base OSM **2026-10-20T15:03:08Z**. SHA-256 de respuesta original: `ad252f77463c909acceeee9fe3544a4c14e14d5fe925442933eaa9dbac231294`.
- Snapshot reducido: `sources/parquemet-osm.json`, SHA-256 `5f804c6b89ceb2e5836429364cf87a8850cdfd57c347bb167d5be08b00dd29db`. Conserva **33 vías y 1.260 nodos**, identificadores, versiones, marcas temporales, etiquetas y orden íntegro de nodos. Se omiten nombres y UID de contribuyentes. Licencia ODbL-1.0; atribución © OpenStreetMap contributors.

La API OSM de mapa para `bbox=-70.65,-33.44,-70.60,-33.40` devolvió HTTP 400 por superar el límite de 50.000 nodos. Se usó una consulta Overpass acotada a `[-70.65,-33.44,-70.59,-33.39]` para vías path/track/cycleway y nombres de avenidas de la leyenda. De ese resultado se retuvieron únicamente los ocho nombres ciclistas registrados en OSM y las dos avenidas indicadas abajo; se excluyó el resto del viario urbano. Se conservan las vías completas devueltas, aunque sus nodos sobrepasen los límites de búsqueda. Extensión real del snapshot: **oeste -70.6380693, sur -33.4306903, este -70.6019812, norte -33.3894875**. Es la extensión de los datos importados, no un polígono administrativo del parque ni cobertura de sus seis cumbres.

## Ocho senderos de la edición aportada

Se transcribe la leyenda **Senderos ciclistas** de `MapaParque.pdf`. No se mezcló con `Map_Parquemet_DIC.pdf`, otra edición que contiene nueve nombres y valores distintos. Pichon Line no pertenece a este catálogo.

| ID estable | Nombre del PDF | Distancia referencial PDF | Vías OSM atribuidas | Nombre OSM literal |
| --- | --- | ---: | --- | --- |
| `centenario` | Centenario | 900 m | 749895576 v6; 1307648383 v2; 1307648385 v4 | Sendero Ciclista Centenario |
| `cuatro-y-medio` | 4 ½ | 1.000 m | 479769031 v9; 479771255 v8; 512366462 v8 | Sendero Ciclista 4 ½ |
| `anfiteatro` | Anfiteatro | 700 m | 479769658 v11; 691091448 v6; 929919497 v3; 929919498 v3; 929919499 v3; 1309108626 v2 | Sendero Ciclista Anfiteatro |
| `la-s` | La S | 500 m | 906948595 v6 | Sendero Ciclista La S |
| `zorzal` | Zorzal | 500 m | Ninguna; referencia pública | OSM registra **Sendero Ciclista El Zorzal**; equivalencia sin confirmar |
| `pa-arriba` | Pa’ arriba | 600 m | Ninguna; referencia pública | OSM registra **Sendero Ciclista Pa' Arriba**; variante de escritura sin equivalencia confirmada |
| `torre-5` | Torre 5 | 800 m | 741162897 v8; 1316047257 v2; 1316047258 v2 | Sendero Ciclista Torre 5 |
| `piramide` | Pirámide | 600 m | 479774004 v9 | Sendero Ciclista Pirámide |

En las seis asignaciones, «Sendero Ciclista» es un prefijo de categoría explícito en las etiquetas OSM; el nombre propio coincide literalmente con el PDF. `osmNames` contiene las etiquetas exactas, sin corrección ortográfica, comparación difusa o selección por proximidad. Las dos variantes pendientes mantienen `status: public-reference`, `osmWayIds: []`, `osmNames: []`, `geometryImported: false` y `geometry: null`. Las vías 862880882 y 691091446 aparecen como contexto con `targetId: null`. No constituyen una atribución geográfica al objetivo del catálogo.

Las páginas oficiales citadas por OSM para 4 ½, Anfiteatro, Pa' Arriba, El Zorzal y La S se consultaron el 20 de octubre de 2026 y devolvieron **HTTP 503**. Se intentó, respectivamente, `/lugares/sendero-4-1-2-descenso-ciclistas/`, `/lugares/sendero-mtb-anfiteatro/`, `/lugares/sendero-pa-arriba-ascenso-ciclistas/`, `/lugares/sendero-el-zorzal-descenso-ciclistas/` y `/lugares/sendero-la-s-descenso-ciclistas/` en `parquemet.cl`. Sus URLs, presentes como etiquetas de fuente de OSM, no se consideran evidencia de contenido leído ni confirmación operacional.

## Dos avenidas principales

El PDF rotula **Av. Pedro Bannen** y **Av. Alberto Mackenna**. OSM registra los mismos nombres propios con el tipo de vía escrito «Avenida». Las 14 vías tienen infraestructura ciclista explícita: `cycleway=lane`, `cycleway=shared_lane`, `cycleway:left=shared_lane` o `cycleway:right=shared_lane`. La etiqueta lateral opuesta puede ser `no`; no se elimina esa distinción ni se inventa un carril en ambos lados.

| Objetivo | Vías OSM (versión) | Evidencia ciclista |
| --- | --- | --- |
| `avenida-pedro-bannen` | 169885900 (11), 480868066 (17), 482748524 (5), 482748525 (7), 923017128 (7), 929919509 (4), 929919510 (5), 929919511 (4), 929919512 (4) | `lane` en siete vías; `shared_lane` lateral en 482748524 y 482748525 |
| `avenida-alberto-mackenna` | 44579782 (43), 442629926 (13), 919288128 (7), 922756659 (8), 1035844715 (4) | `lane` en 44579782; `shared_lane` en tres vías; `shared_lane` izquierdo en 1035844715 |

Estas son las dos `primaryTargetIds`. No se atribuye a la avenida entera ninguna de las distancias entre sectores del recuadro del PDF; `officialDistanceM` se omite para ambas. Se conservan los sentidos de circulación y restricciones de vehículos motorizados de OSM. La infraestructura registrada no confirma que el acceso esté operativo hoy ni que el sentido ciclista sea idéntico al sentido vehicular.

## Restricciones y límites de uso

OSM registra `access=no` en **479769658** (un tramo de Anfiteatro), **691091446** (nombre OSM Pa' Arriba, no atribuido) y **862880882** (nombre OSM El Zorzal, no atribuido). En Anfiteatro hay seis vías importadas, de las cuales una tiene esta restricción; no se afirma que todo el sendero esté cerrado. Los `check_date` de esos tres objetos son 2024-08-20; son etiquetas del snapshot, no una comprobación realizada por esta aplicación. El consumidor debe excluir cualquier sección con acceso restringido de la coincidencia GPS. Las etiquetas no certifican la operación presente.

La publicación de geometría **no valida navegación**, accesos, cierres, sentidos, seguridad, permisos ni horarios. `navigationValidated` es `false` y `visualToGeographicTransform` es `null`. Los desniveles y la dificultad normalizada se conservan nulos: no se convierten automáticamente valores `mtb:scale:imba` a las categorías de la aplicación.

Las ocho distancias del PDF se guardan como `officialDistanceM` con `officialDistanceSource`. Las longitudes OSM son sumas geodésicas de todas las vías atribuidas a cada nombre; pueden incluir fragmentos, ramas o alternativas y **no acreditan el sendero completo**. No se unieron huecos ni recortaron líneas para aproximarse a la cifra de la leyenda.

| Nombre | Referencia PDF | Longitud OSM importada (suma de vías, redondeada) |
| --- | ---: | ---: |
| Centenario | 900 m | 609 m |
| 4 ½ | 1.000 m | 1.571 m |
| Anfiteatro | 700 m | 1.218 m |
| La S | 500 m | 458 m |
| Torre 5 | 800 m | 787 m |
| Pirámide | 600 m | 848 m |

Las discrepancias refuerzan la separación entre referencia editorial y geometría importada. No prueban por sí solas un error del mapa o de OSM. Zorzal y Pa’ arriba no tienen longitud geográfica atribuida. Ninguna cifra del PDF se usa para escalar coordenadas.

Los servicios de `park.amenities` —baños, primeros auxilios, informaciones, bicicleteros, estacionamiento, restaurantes, kioscos y pump track— proceden solo de la **simbología del PDF**. Llevan `evidenceType: official-map-legend` y `operationConfirmed: false`; no se publican ubicaciones, horarios o disponibilidad de servicios a partir de esa lista. No se añade agua potable porque la leyenda no la acredita.

## Verificación reproducible

`node --test tests/parquemet-sources.test.mjs` pasa **6/6** comprobaciones: edición y ocho valores del PDF, hash del snapshot, procedencia y versiones de nodos/vías, 33 vías/1.260 nodos, extensión, coordenadas fijas de Pirámide, orden íntegro de nodos, variantes sin atribución, infraestructura ciclista de cada tramo de las avenidas y restricciones por tramo. El catálogo pasa `validateCatalog`; `fromOsmSnapshot` produce 33 líneas: 31 atribuidas y dos de contexto. La comparación puntual con la respuesta original confirma que los 1.293 objetos retenidos son idénticos tras omitir únicamente metadata de contribuyentes; no hay IDs duplicados ni nodos huérfanos. El hash del PDF retenido coincide con la edición aportada. No se realizaron comprobaciones en terreno.
