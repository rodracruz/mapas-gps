# Plan: mapa público georreferenciado

> Estado: planificación solicitada por el usuario con tres subagentes. Implementación y publicación en pausa. El prototipo geográfico existente es exploratorio y no cumple todavía la aceptación. Este documento no afirma cambio del modo de la interfaz de Codex.

**Objetivo:** consultar Star Wars, La Virgen y Lomo Vetado en mapas públicos georreferenciados, conservando fuentes, derechos y mapas guardados.

**Arquitectura:** widgets oficiales Trailforks por pista para las tres; vista propia OSM para Lomo y contexto abierto; fotografía secundaria e independiente. Sin copiar geometría del proveedor ni trasladar píxeles a latitud/longitud.

**Tecnología:** aplicación estática HTML/CSS/JavaScript, Leaflet 1.9.4 local, snapshot OSM con SHA256, iframe oficial Trailforks, Node test runner y Playwright/Chromium. Sin backend, cuentas nuevas, claves ni facturación.

**Especificación:** [mapa público georreferenciado](../specs/2026-10-18-mapa-publico-georreferenciado.md), con URLs, IDs, coordenadas y resultados de investigación.

## Estado y restricciones globales

- Repo base `/workspace/mapas-gps`, `main` intacta en `87edc6c9f8097a9eb34cfc1f7e955a74edfe3ab9`.
- Worktree aislado `/workspace/mapas-gps/.worktrees/geographic-map`, rama `feat/mapa-geografico`, base `2ea40845210e6da595ef8f93007bc731249f3d30` de la revisión visual previa.
- En esta rama hay código exploratorio sin seguimiento, incluidas carpetas `geographic/`, `vendor/`, datos y pruebas geográficas. No se ha publicado ni aceptado. Existe además un enlace local `node_modules`: no incluirlo en Git.
- No hacer `git add -A` sin revisar el conjunto; añadir explícitamente archivos de cada tarea. No incluir fotos privadas, trazas personales, credenciales ni registros de analítica del navegador.
- No modificar ni publicar sobre `main`, hacer force-push ni actualizar GitHub Pages sin aprobación. Publicación y permisos del visor privado se revisarán como acción separada sobre un resultado concreto.
- No cambiar IndexedDB ni convertir el primer hito en navegación. Un punto dibujado, una coincidencia con la fuente y una posición precisa en terreno son conceptos distintos.

## Investigación paralela terminada

| Subagente | Encargo | Resultado incorporado |
|---|---|---|
| `plan_fuentes_geograficas` | Fuentes oficiales/abiertas, IDs y permisos | Lomo OSM 477170097 v6/127 nodos. No pista completa nominal de Starwars/La Virgen en la consulta OSM. Separación entre conexiones y pistas, y circuitos compuestos de Wikiloc. |
| `plan_mapas_publicos` | Mapas públicos que realmente rendericen | Widgets oficiales Trailforks 76316, 205330 y 7601: las tres pistas visibles en iframe externo, con fondo geográfico. No concede reutilización de geometría. Pendiente móvil/integración final. |
| `plan_integracion` | Arquitectura, almacenamiento y pruebas | Página independiente, preservación de campos reales `trails/webCenter`, revisión del SW, capa de selección propia y pruebas que comprueben mapas visibles en lugar de solo un contenedor. |

El hallazgo de Trailforks amplía la investigación inicial de fuentes: hay mapa individual público para las tres, aunque solo Lomo tiene aquí geometría abierta identificada. No mantener la conclusión antigua de que únicamente se pueden mostrar circuitos completos de Wikiloc.

## Tarea 1: cerrar catálogo y procedencia

Archivos: `data/el-durazno/geographic-catalog.json`, `sources/el-durazno-osm.json`, `geographic/data.mjs`, `tests/geographic.test.mjs`; nuevo `docs/geographic-evidence.md`.

- [ ] Definir `validateCatalog(catalog) -> Catalog`: objetivos únicos, IDs estables, correspondencia con fuente, modalidades disponibles y URLs HTTPS de proveedores autorizados. Registrar fecha de consulta y límites de cada fuente. Distinguir metadatos ODbL de OSM y condiciones de contenido externo.
- [ ] Sustituir la referencia primaria Wikiloc del prototipo por widgets oficiales individuales: Star Wars 76316, La Virgen 205330, Lomo 7601. Mantener circuitos Wikiloc solo como referencias secundarias etiquetadas.
- [ ] Escribir primero pruebas de rechazo: IDs duplicados, URL ajena al proveedor, pista atribuida a una vía sin respaldo, ejes invertidos, píxeles, nodos ausentes y huella alterada. Ejecutarlas y comprobar que detectan la carencia antes de implementar la validación.
- [ ] Mantener `fromOsmSnapshot(source, catalog) -> FeatureCollection` y `validateGeographic(data,catalog) -> FeatureCollection`, orden `[longitud,latitud]`, secuencias completas sin simplificación/recorte ni conexiones por cercanía.
- [ ] Comparar los 127 nodos de Lomo con la respuesta OSM y las tres anclas documentadas en la especificación. Mantener la vía 477174834 como conexión, nunca como La Virgen completa.
- [ ] Fijar huella exacta del snapshot y comprobarla antes de dibujar o habilitar exportación OSM. Su fallo no bloquea widgets ni enlaces de un catálogo válido. Documentar que la comparación acredita fidelidad a OSM, no precisión independiente.
- [ ] Mantener transformación del cartel `null` y navegación no validada. Ejecutar `node --test tests/geographic.test.mjs` y revisar el diff.

Salida: catálogo verificable que no confunde visualización externa con datos descargables o transitables.

## Tarea 2: convertir la página geográfica en la vista de consulta

Archivos: `mapa-geografico.html`, `geographic/viewer.mjs`, `geographic/style.css`, `tests/geographic-browser.mjs`.

Interfaces: `showTarget(targetId) -> void`, `showSourceMode(mode) -> void`; un único widget activo y mapa Leaflet propio con ciclo de montaje/desmontaje explícito.

- [ ] Añadir primero pruebas del comportamiento deseado: tres selecciones, ID y proveedor correctos, enlace alternativo visible y regreso a OSM sin mapa duplicado.
- [ ] Montar el código oficial por pista con `basicmap=1`, preservando atribución/enlace del proveedor. No leer ni almacenar geometría interna del iframe.
- [ ] Hacer visibles la fuente y el alcance: “Mapa de Trailforks” frente a “Geometría OSM”. No presentar ambas como geometrías ya comparadas o fusionadas.
- [ ] Inicializar widgets después de validar el catálogo, independientemente de la carga del snapshot OSM. Probar que un hash OSM incorrecto o una fuente ausente mantienen disponibles las tres consultas Trailforks y deshabilitan solo la modalidad/exportación OSM.
- [ ] Permitir vista OSM de Lomo y contexto abierto. Mantener fotografía/biblioteca como destinos secundarios. No anunciar exportación de Starwars o La Virgen sin datos reutilizables.
- [ ] Ofrecer “Abrir en Trailforks” permanentemente y un aviso neutral de disponibilidad externa. Probar bloqueo del proveedor e informar errores detectables. No prometer detección automática de un mapa vacío: el acceso cross-origin está restringido y `load` no acredita render. Confirmarlo en las pruebas visuales de aceptación.
- [ ] Verificar visualmente dentro de la aplicación que cada pista aparece sobre un mapa real. Capturar escritorio y móvil; distinguir comprobación automatizada de inspección humana del render.

Salida: las tres selecciones muestran mapas públicos geográficos operativos; ningún circuito compuesto suplanta una pista individual.

## Tarea 3: corregir selección nativa y exportación

Archivos: `geographic/viewer.mjs`, `geographic/data.mjs`, pruebas geográficas de datos y navegador.

Interfaces: `selectFeature(featureId,{fit=false}={}) -> void`, `setContextVisible(visible) -> void`, `lineLength(coords) -> meters`.

- [ ] Reproducir con prueba el fallo conocido: ocultar contexto y seleccionar una vía actualiza nombre/encuadre pero deja la línea invisible.
- [ ] Separar la capa seleccionada del contexto. Seleccionar 477174834 con contexto oculto debe mostrar solo esa selección; al volver a Lomo debe retirarse el resaltado anterior.
- [ ] Probar selección por toque y lista, zoom, pan y encuadre. Confirmar alineación con coordenadas nativas al cambiar zoom, sin desplazamientos de ejes/proyección.
- [ ] Exportar únicamente geometría OSM real con procedencia, licencia e IDs, conservando el orden original. Descargar y volver a validar el archivo en la prueba.
- [ ] Etiquetar longitud como calculada sobre geometría de fuente, sin equivalencia con distancia de terreno ni restante. Comprobar cálculo sobre todos los segmentos, no distancia recta entre extremos.

Salida: selección visible y exportación honesta de datos abiertos; sin conectividad navegable inferida.

## Tarea 4: conservar aplicación y almacenamiento

Archivos: `mapa-geografico.html`, enlaces mínimos de `index.html` y/o `revision.html`, nueva prueba de preservación o ampliación justificada de la existente. Leer `app.js`, `online.js` y `sw.js` para comprobar contratos; evitar cambios en ellos si no son necesarios.

- [ ] Probar en el mismo origen la secuencia app → visor geográfico → app con un JPG de prueba real, calibración válida y campos reales `trails/webCenter` guardados mediante el flujo actual.
- [ ] Comparar Blob byte a byte, IDs, nombres, dimensiones, puntos, trazados, centro y claves previas de localStorage; recargar y abrir el mapa guardado desde la biblioteca.
- [ ] Repetir con SW anterior activo. Una fuente ausente, HTML servido en lugar de JSON o versiones mezcladas debe causar un error visible y exportación deshabilitada, sin borrar datos ni desregistrar el SW como atajo.
- [ ] Si los enlaces cambian de origen, explicar que la biblioteca anterior permanece en el origen original. No prometer migración de GitHub Pages a Sites.

Salida: acceso al nuevo visor sin pérdida de mapas/calibraciones ni migración accidental.

## Tarea 5: artefacto reproducible y aceptación

Archivos: nuevo `scripts/build-geographic-standalone.py`, prueba del artefacto, scripts de `package.json`, `docs/geographic-evidence.md` y documento de continuidad. Mantener el constructor fotográfico existente.

- [ ] Añadir pruebas significativas del artefacto antes de implementar el constructor: código y datos locales presentes, huella válida y error ante alteración.
- [ ] Incrustar Leaflet, estilos y datos. Conservar bytes exactos del snapshot mediante base64 y comprobar SHA antes de parsear. No reserializar JSON y conservar la huella anterior.
- [ ] Distinguir código/datos incluidos de fondos OSM/widgets externos que requieren conexión. No preparar paquetes offline de teselas.
- [ ] Añadir comandos explícitos `test:geographic`, `test:geographic:browser`, construcción y prueba autónoma. Ejecutar `npm test` y los controles de navegador/artefacto/preservación afectados; registrar comando, resultado y límites.
- [ ] Inspeccionar resultados escritorio, 390×844 y 360×800: pista real, controles táctiles, pan/pellizco, rotación, tamaño recuperado y ausencia de desbordamiento. Una mera etiqueta iframe/canvas o HTTP 200 no satisface la prueba.
- [ ] Probar hash erróneo, JSON ausente y teselas/proveedor inaccesibles. Guardar capturas comparativas y evidencia sin cookies, tokens ni trazas personales.
- [ ] Solicitar revisión independiente del diff y criterios de aceptación; corregir incidencias y repetir solo verificaciones afectadas.
- [ ] Revisar archivos añadidos y commits; conservar rama aislada y `main` intacta. Preparar resultado revisable antes de proponer publicación.

## Matriz de cierre

| Criterio | Evidencia exigida |
|---|---|
| Tres pistas geográficas | Cada selección muestra su pista individual en widget oficial operativo; escritorio y móvil inspeccionados dentro del visor final. |
| Datos abiertos | Lomo conserva 127 nodos OSM y fuente/versión; ejes correctos, hash íntegro y exportación verificable. |
| Honestidad | Ninguna conexión renombrada como pista, geometría protegida copiada, hueco inventado o precisión de terreno sin prueba. |
| Interacción | Selección visible con contexto apagado, pan/zoom/pellizco y cambio de fuente sin duplicados/desfases. |
| Conservación | Blob, calibración, `trails/webCenter`, biblioteca y localStorage idénticos antes/después en el mismo origen, también con SW. |
| Fallos | Datos OSM alterados/inaccesibles deshabilitan solo OSM; widgets siguen disponibles. Un proveedor bloqueado conserva aviso neutral, alternativa permanente e información de errores detectables, sin anunciar render exitoso. |
| Entrega | Código/datos editables, artefacto ejecutable, capturas, pruebas y documentación de pendientes. URL local diferenciada de vista previa accesible y publicación; comprobar la URL antes de llamarla operativa. |

## Fuera de este cierre

No implementar map matching, destinos, loops, sentidos, conexiones transitables o distancia restante. No declarar georreferenciado el cartel ni afirmar precisión por error cero en puntos de ajuste. La futura navegación requiere obtener geometría reutilizable donde falta y contrastar extremos, accesos, sentidos, conectividad e incertidumbre GPS.

La implementación continúa después de esta fase de planificación; el prototipo sin publicar no es la entrega aprobada.
