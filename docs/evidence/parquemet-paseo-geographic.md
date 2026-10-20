# Paseo Metropolitano: evidencia geográfica de sus seis tramos

Consulta del **20 de octubre de 2026, UTC**. Sí existe geometría pública reutilizable en OpenStreetMap para los **seis nombres de la leyenda verde** de `sources/parquemet-mapa-oficial.pdf`. Se identificaron **31 vías con nombres explícitos**, de las cuales **28 tienen `bicycle=yes` o `bicycle=designated`**. Esto permite mostrar trazados de fuente para los seis objetivos; no prueba que la suma de vías sea exactamente cada recorrido completo de la edición del PDF.

La omisión anterior tiene una causa comprobable: la consulta original seleccionaba `highway=path|track|cycleway` y avenidas por nombre. Las vías del Paseo son predominantemente **`highway=pedestrian`**, que no coincidía con ese filtro. La ausencia en las 360 vías originales no era ausencia de cartografía disponible. Tampoco debe interpretarse `pedestrian` como prohibición de bicicletas cuando la misma vía contiene un permiso ciclista explícito.

## Fuentes originales y recibos retenidos

El PDF de referencia sigue siendo <https://mapas.parquemet.cl/doc/MapaParque.pdf>, SHA-256 `e7606172479a0fd585f7f3dcb4187556a202778cd647b31f44aaefcf9bd03cf8`. Es un esquema; aquí no se registra, proyecta ni transforma su dibujo a coordenadas. Sus seis distancias se conservan como distancias publicadas, separadas de las longitudes de OSM.

Los recibos de esta investigación están en `/workspace/scratch/parquemet-shared-routes/geo/`. Son temporales; el visor no debe depender de ellos.

| Recibo | Fuente / fecha de recuperación | Contenido y SHA-256 |
| --- | --- | --- |
| `relation-17934042-full.json` | <https://api.openstreetmap.org/api/0.6/relation/17934042/full.json>; HTTP 200; `2026-10-20T19:08:58.484587+00:00` | 131.268 bytes; 632 nodos, 42 vías, una relación; `9b7e22ec84306e84189704ca198257320503fa78d80d37a4242c6b3541a51759` |
| `paseo-overpass.json` | <https://overpass-api.de/api/interpreter>; HTTP 200; `2026-10-20T19:09:20.265718+00:00`; base OSM `2026-10-20T19:08:23Z` | 192.079 bytes; **647 nodos / 44 vías / una relación únicos**; `5deafab679cf3329cbbc55e0cbfe6893d8c0b3319e6aec057fc240dd4050f431` |
| `union-overpass.json` | Mismo servidor Overpass; HTTP 200; `2026-10-20T19:10:39.142803+00:00`; base OSM `2026-10-20T19:09:23Z` | 669.363 bytes; **2.615 nodos / 106 vías / una relación únicos**; `910f6834bd9f4b49ea81d2e5523123bc69ec95a90ea1b8d4bd7b0ee97602a829` |

Cada recibo tiene metadata adyacente (`relation-17934042-retrieval.json`, `paseo-retrieval.json`, `union-retrieval.json`) con URL y hora completas. `paseo-query.txt` y `union-query.txt` conservan las consultas exactas. El recibo Overpass puede repetir objetos entre sus dos bloques de salida: los recuentos anteriores se deduplican únicamente por `(type,id)`, sin cambiar objetos.

Consulta de descubrimiento reproducible:

```overpass
[out:json][timeout:90];
(
  way["name"~"Paseo Metropolitano|PaseoMet",i](-33.46,-70.67,-33.34,-70.56);
  relation(17934042);
);
out meta;
>;
out meta;
```

La consulta de unión pide en una sola respuesta los IDs exactos de las **62 vías del snapshot anterior**, las **44 vías del recibo del Paseo**, la relación 17934042 y todos sus nodos. No modifica el archivo anterior. Al comparar todos los **2.042 objetos del snapshot anterior** con la unión, hay **cero ausentes y cero diferencias** después de omitir únicamente `user`, `uid` y `changeset`. También se conservan sin diferencias los 692 objetos únicos del recibo del Paseo. Por tanto, esta ampliación no requiere combinar versiones o elegir coordenadas entre snapshots incompatibles.

Licencia de los datos geográficos: **ODbL-1.0**, atribución **© OpenStreetMap contributors**, <https://www.openstreetmap.org/copyright>. Las etiquetas `operator` y `source` son declaraciones de contribuidores de OSM; no convierten el dataset en un levantamiento oficial de Parquemet.

## Relación explícita y correspondencias

La [relación OSM 17934042](https://www.openstreetmap.org/relation/17934042) es **v7**, timestamp **`2026-04-11T04:13:25Z`**. Registra:

```text
type=route
route=hiking
name=Paseo Metropolitano
name:en=Metropolitan Trail
operator=ParqueMet
source=https://mapas.parquemet.cl/
colour=#129b67
check_date=2024-08-16
network=lwn
network:type=node_network
ref=0
roundtrip=no
from=Acceso La Pirámide
to=Parque Mahuidahue
```

Es una relación de senderismo, **no una relación ciclista**. La identificación de los seis tramos combina los nombres explícitos de sus vías, su pertenencia al Paseo mediante esta relación con referencia al portal oficial y los permisos ciclistas por vía. No se basa únicamente en un nombre suelto o cercanía al dibujo. Dos vías adicionales del ramal Pedro de Valdivia llevan el nombre completo del tramo y se conectan por nodos con su conjunto; **no pertenecen a esta relación** y se declaran aparte.

| Objetivo | Nombre OSM literal | IDs de vía y versiones | PDF / suma OSM aproximada |
| --- | --- | --- | ---: |
| `paseo-infancia` | Paseo Metropolitano - Parque Bicentenario de la Infancia | **1022000923 v5** | 940 / **1.059 m** |
| `paseo-sentidos` | Paseo Metropolitano - Sendero de los Sentidos | **777396164 v3; 777396167 v5; 777396168 v5; 1498379319 v1** | 540 / **549 m** |
| `paseo-bellavista` | Paseo Metropolitano - Sendero Bellavista | **777396165 v9; 1307609502 v1; 1498379320 v1** | 1.000 / **1.329 m** |
| `paseo-pedro-valdivia` | Paseo Metropolitano - Sendero Pedro de Valdivia Norte; Paseo Metropolitano - Tramo Pedro de Valdivia Norte | **256510467 v5; 749561207 v6; 981089817 v4; 1233612936 v3; 1307609504 v2; 1308348019 v2; 1308348023 v1** | 1.500 / **2.329 m**, incluido ramal |
| `paseo-piramide` | Paseo Metropolitano - Tramo Jardín Japonés / Pirámide | **180578702 v19; 396817982 v11; 727333973 v9; 741162893 v6; 741162909 v6; 906717591 v3; 906717592 v4; 906717593 v3; 906717594 v4; 919016888 v5; 1346024630 v2; 1346033271 v1** | 3.700 / **3.777 m** |
| `paseo-cascada` | Paseo Metropolitano - Sendero La Cascada | **555001286 v6; 910105205 v3; 910105206 v3; 1345197424 v1** | 1.200 / **1.261 m** |

Las longitudes son sumas de segmentos originales con distancia de círculo máximo, radio 6.371.008,8 m, redondeadas al metro; no representan un recorrido elegido entre ramales. No se ajustan puntos, recortan vías, completan huecos ni fuerzan distancias para igualar el PDF. El nombre del PDF «Pirámide / Jardín Japonés» invierte el orden de los dos lugares respecto del nombre OSM; esta equivalencia se declara para estos IDs concretos, sin comparación difusa de otros objetos.

### Permisos y excepciones por vía

- **Infancia:** 1022000923 es `highway=pedestrian`, `bicycle=designated`, `foot=yes`, `access=yes`, `motor_vehicle=no`.
- **Sentidos:** sus cuatro vías son `highway=pedestrian`, `bicycle=designated`; no tienen etiqueta `access`. No se inventa `foot=yes` en el snapshot para las que no la llevan.
- **Bellavista:** 777396165 y 1498379320 tienen `bicycle=yes`; 1307609502 tiene `bicycle=designated`. Las tres son `highway=pedestrian`, `foot=yes`, `motor_vehicle=no`, sin etiqueta `access`.
- **Pedro de Valdivia, cuatro vías con evidencia ciclista positiva:** 749561207, 981089817, 1233612936 y 1307609504 tienen `highway=pedestrian`, `bicycle=designated`; suman aproximadamente **1.348 m**. La vía **749561207 no es miembro de la relación**.
- **Pedro de Valdivia, geometría sin habilitación ciclista:** **1308348019** es `highway=footway`, `footway=sidewalk`, **`bicycle=no`**; **1308348023** es `highway=footway`, `footway=sidewalk`, sin `bicycle`; **256510467** es `highway=pedestrian`, `access=permissive`, sin `bicycle` y **no es miembro de la relación**. Mantenerlas visibles no implica incorporarlas a coincidencia GPS ciclista. No se deduce permiso ciclista de la pertenencia a una ruta de senderismo.
- **Pirámide / Jardín Japonés:** las doce vías son `highway=pedestrian`, `bicycle=designated`, `foot=yes`. **727333973, 906717591, 906717592, 919016888, 1346024630 y 1346033271** conservan `access=permissive`; **180578702** lleva `access=yes`; las cinco restantes no tienen `access`. `permissive` no equivale a `access=no`. **741162893** lleva `motor_vehicle=yes`; **396817982 y 741162909**, `motor_vehicle=permit`. No se afirma exclusividad peatonal/ciclista de todo el tramo.
- **La Cascada:** sus cuatro vías son `highway=pedestrian`, `bicycle=yes`, `foot=yes`, `motor_vehicle=no`; no tienen etiqueta `access`. 910105205 registra `oneway=no`.

Ninguna de las 31 vías nominales tiene `access=no`. Ninguna etiqueta positiva confirma apertura actual, horario o seguridad. Las restricciones y las ausencias de permiso se conservan por ID; no justifican ocultar el trazado fuente de toda una categoría.

### Relación: miembros, roles y contexto sin atribución de tramo

Hay **42 miembros**, todos de tipo `way`. **29** son vías nominales de los seis objetivos. Los roles son la cadena vacía salvo **910105205, 981089817, 1308348019 y 1308348023**, cuyo rol literal es **`route`**. Se preserva ese valor; no se reinterpreta como sentido de circulación.

Los **13 miembros restantes** no se asignan a uno de los seis tramos por proximidad:

| ID (versión) | Nombre / categoría | Evidencia ciclista |
| --- | --- | --- |
| 923017130 (4) | Paseo Metropolitano; `highway=footway` | **`bicycle=no`** |
| 555001265 (6) | Sin nombre; puente `highway=pedestrian` | `bicycle=yes` |
| 1233612935 (2) | Paseo Metropolitano; `highway=pedestrian` | `bicycle=yes`, `access=yes` |
| 1233612934 (1) | Abraham Lincoln; `highway=living_street` | `bicycle=yes`, `access=yes` |
| 179494266 (23) | Canal El Carmen; `highway=living_street` | `bicycle=yes`, `access=yes` |
| 922756673 (4) | Paseo Metropolitano; `highway=pedestrian` | `bicycle=designated` |
| 1022000922 (1) | Paseo Metropolitano; `highway=pedestrian` | `bicycle=yes`, `access=yes` |
| 555001287 (3) | Sin nombre; `highway=pedestrian` | `bicycle=yes` |
| 1081650302 (2) | Sin nombre; `highway=footway`, `footway=sidewalk` | Sin `bicycle` |
| 1081650303 (1) | Sin nombre; puente `highway=path` | Sin `bicycle` |
| 1081650304 (1) | Sin nombre; `highway=footway`, `footway=sidewalk` | Sin `bicycle` |
| 919288140 (2) | Sin nombre; `highway=footway`, `footway=sidewalk` | Sin `bicycle` |
| 919016889 (2) | Paseo Metropolitano; `highway=pedestrian` | `bicycle=yes` |

Por ejemplo, **922756673** une exactamente el extremo Sentidos 8566030160 con el extremo Bellavista 835432125, pero su nombre no especifica uno de los dos tramos: puede preservarse como contexto de la relación sin adjudicarlo silenciosamente a una ficha. Lo mismo aplica a los puentes y conexiones genéricas.

## Conectividad realmente observada

Las seis agrupaciones nominales son internamente conexas al usar **identidad exacta de nodo**, no una tolerancia espacial. Infancia, Sentidos, Bellavista, Pirámide y Cascada forman una cadena cada una. Pedro de Valdivia tiene un ramal: 256510467 comparte 6938709907 con 1233612936 y 1307609504, y llega a 749561207 mediante 8538143358. Su trazado completo con nombres no debe describirse como una sola línea sin bifurcaciones.

Al conservar solo las cuatro vías de Pedro de Valdivia con `bicycle=designated`, quedan **dos componentes**: el ramal 749561207 (unos 311 m), separado por la vía 256510467 sin permiso ciclista explícito (unos 177 m), y la cadena 1233612936 → 1307609504 → 981089817 (unos 1.037 m). Tras esa cadena, 1308348019 lleva `bicycle=no`; el sistema no debe saltar sobre ella ni convertirla en una conexión ciclista.

Los 42 miembros de la relación completa sí forman **un componente topológico**, pero su grafo tiene **seis extremos y seis bifurcaciones**. No es una cadena única. El orden almacenado de miembros presenta además varios pares consecutivos sin nodo compartido. Si se conservan únicamente miembros con permiso ciclista explícito `yes|designated`, el grafo pasa a **tres componentes**. Por ello ni la relación de senderismo ni su orden bastan para declarar un circuito ciclista continuo.

Referencias exactas de extremos de las geometrías nominales, en **[longitud, latitud], EPSG:4326**:

| Tramo | Nodos extremos y coordenadas originales |
| --- | --- |
| Infancia | 2589703313 `[-70.6378791,-33.4274791]`; 2589703273 `[-70.63827,-33.419577]` |
| Sentidos | 2589703313 `[-70.6378791,-33.4274791]`; 8566030160 `[-70.6341175,-33.430685]` |
| Bellavista | 5357381944 `[-70.6233866,-33.4240511]`; 835432125 `[-70.6341132,-33.4307163]` |
| Pedro de Valdivia | 5357381944 `[-70.6233866,-33.4240511]`; 12115910296 `[-70.6155769,-33.4130738]`; extremo de ramal 2545317622 `[-70.6175354,-33.4152925]` |
| Pirámide / Jardín Japonés | 2341975054 `[-70.6156242,-33.4131015]`; 6983753709 `[-70.6016241,-33.3898962]` |
| La Cascada | 5349176215 `[-70.6179659,-33.4037026]`; 1350005243 `[-70.6206597,-33.4077352]` |

Infancia y Sentidos comparten **2589703313**. Bellavista y Pedro de Valdivia comparten **5357381944**. Pedro de Valdivia y Pirámide comparten **12115910296**, que pertenece al interior de una vía de Pirámide, no a su extremo global. No se inventa unión entre los restantes pares. Los extremos globales de Pirámide conservan el orden de fuente de las vías, no un sentido de circulación autorizado.

## Límites de la conclusión y uso concreto

La investigación aporta geometría OSM explícita para las seis fichas y evidencia suficiente para no dejarlas sin trazado geográfico. **No certifica correspondencia de límites al metro con el PDF ni cobertura completa de sus distancias**; Infancia, Bellavista y especialmente el conjunto con ramal de Pedro de Valdivia difieren de los valores impresos. Mostrar estas diferencias es preferible a modificar geometría para disimularlas.

El track SUDA «Parquemet Metropolitano», actividad `XJPs5s4GDc`, sigue sin demostrar equivalencia con estos seis tramos y **no se usa**. Tampoco se extraen recorridos de plataformas con licencia no comprobada. Los índices OSM de OpenAlfa y el resultado de Acampar `osm-17934042` sirvieron únicamente para descubrir nombres/ID; toda coordenada propuesta procede de los recibos originales de OSM citados arriba.

La elegibilidad de coincidencia GPS puede resolverse con evidencia por vía: mantener geometría visible, conservar permisos y excepciones y excluir los objetos sin evidencia ciclista positiva o con prohibición. No hace falta inventar coordenadas, exigir mediciones de terreno para mostrar la fuente ni tratar toda la relación como habilitada. La apertura y las condiciones operacionales siguen sin confirmar.

El análisis reproducible de IDs, etiquetas, versiones, distancias, extremos y componentes quedó en `paseo-analysis.json`, generado por `analyze-paseo.py` dentro del directorio temporal de recibos. Ningún archivo fuente, catálogo o componente del proyecto fue modificado por esta investigación.
