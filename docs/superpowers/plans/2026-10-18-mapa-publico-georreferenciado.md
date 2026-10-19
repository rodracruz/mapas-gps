# Plan: mapa público georreferenciado

> Estado: planificación con subagentes, corregida tras la referencia del usuario `real-state-map.onrender.com`. Implementación y publicación en pausa. El prototipo geográfico existente es exploratorio y no cumple la aceptación. Este documento no afirma cambio del modo de la interfaz de Codex.

**Objetivo:** mostrar Star Wars, La Virgen y Lomo Vetado simultáneamente como líneas seleccionables sobre un único mapa mundial, con zoom/pan compartidos, conservando fuentes, derechos y mapas guardados.

**Arquitectura:** un único mapa Leaflet persistente; capas nativas independientes por pista/fuente, contexto OSM y resaltado; fotografía secundaria. Referencias externas solo como enlaces. Sin copiar geometría protegida ni trasladar píxeles a latitud/longitud.

**Tecnología:** aplicación estática HTML/CSS/JavaScript, Leaflet 1.9.4 local, snapshot OSM con SHA256 y futuras colecciones autorizadas, Node test runner y Playwright/Chromium. Sin backend, cuentas nuevas, claves ni facturación.

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

El hallazgo de Trailforks amplía las referencias disponibles, pero los widgets separados no satisfacen la corrección posterior del usuario. Se descarta la arquitectura de widgets del plan anterior. Solo Lomo dispone aquí de geometría abierta identificada; falta obtener polilíneas reutilizables y delimitadas de Starwars y La Virgen antes de aceptar el conjunto.

La referencia se inspeccionó en navegador y código público: un mapa Leaflet, capas `L.polyline`, colores por línea, tooltip y zoom funcional. El prototipo actual reemplaza el mapa por un iframe al elegir Starwars; se reprodujeron errores de almacenamiento y ausencia de la pista. Capturas y registro: `/workspace/scratch/reference-map/`.

## Tarea 1: cerrar catálogo y procedencia

Archivos: `data/el-durazno/geographic-catalog.json`, `sources/el-durazno-osm.json`, `geographic/data.mjs`, `tests/geographic.test.mjs`; nuevo `docs/geographic-evidence.md`.

- [ ] Definir `validateCatalog(catalog) -> Catalog`: objetivos únicos, IDs estables, geometría disponible o `null`, correspondencia con fuente, licencia y referencias HTTPS. Registrar fecha de consulta y límites. Cada fuente conserva su licencia; no etiquetar una futura traza de otro origen como OSM.
- [ ] Registrar Trailforks 76316/205330/7601 y circuitos Wikiloc solo como referencias secundarias. Retirar `embedUrl` del flujo principal. Starwars y La Virgen permanecen sin geometría nativa hasta obtener datos permitidos y delimitados, sin asignarles vías anónimas por parecido.
- [ ] Escribir primero pruebas de rechazo: IDs duplicados, URL ajena al proveedor, pista atribuida a una vía sin respaldo, ejes invertidos, píxeles, nodos ausentes y huella alterada. Ejecutarlas y comprobar que detectan la carencia antes de implementar la validación.
- [ ] Mantener `fromOsmSnapshot(source, catalog) -> FeatureCollection` y `validateGeographic(data,catalog) -> FeatureCollection`, orden `[longitud,latitud]`, secuencias completas sin simplificación/recorte ni conexiones por cercanía.
- [ ] Comparar los 127 nodos de Lomo con la respuesta OSM y las tres anclas documentadas en la especificación. Mantener la vía 477174834 como conexión, nunca como La Virgen completa.
- [ ] Fijar huella exacta del snapshot y comprobarla antes de dibujar o habilitar exportación OSM. Su fallo no bloquea el mapa base ni fuentes independientes válidas. Documentar que la comparación acredita fidelidad a OSM, no precisión independiente.
- [ ] Mantener transformación del cartel `null` y navegación no validada. Ejecutar `node --test tests/geographic.test.mjs` y revisar el diff.

Salida: catálogo verificable que distingue las capas nativas disponibles de las referencias externas y datos pendientes. Investigar la obtención remota de un GPX/GeoJSON original autorizado por operador/autor o acceso permitido a datos; no exigir visita física al usuario ni contactar terceros sin autorización.

## Tarea 2: convertir la página geográfica en la vista de consulta

Archivos: `mapa-geografico.html`, `geographic/viewer.mjs`, `geographic/style.css`, `tests/geographic-browser.mjs`.

Interfaces: `selectTarget(targetId,{fit=false}={})`, `setTargetVisible(targetId,visible)`, `setContextVisible(visible)`, `fitAvailableRoutes()`, `addRouteCollection(sourceId,featureCollection)`.

- [ ] Añadir primero pruebas: una sola instancia cartográfica, ningún iframe principal; seleccionar una pista conserva centro/zoom y las otras capas. La selección sin geometría mantiene el fondo y explica el dato pendiente.
- [ ] Crear el mapa base una vez, independientemente de las fuentes. Quitar alternancia `native-map-panel/public-map-panel` y permitir pan mundial/zoom; el parque es encuadre inicial, no límite territorial.
- [ ] Añadir pistas válidas como capas geográficas nativas con colores estables, halo y trazo visible. Respetar curvas/nodos originales; no añadir círculos de conexión como si fueran estaciones de metro ni simplificar por motivos estéticos.
- [ ] Separar capas de pistas, contexto y selección. Incorporar leyenda, visibilidad individual y “Encuadrar pistas disponibles”; cambiar selección no recrea el mapa ni ajusta encuadre salvo petición explícita.
- [ ] Cargar cada colección de forma independiente. Hash incorrecto/fuente ausente impide dibujar o exportar esa colección, sin ocultar mapa base ni otras colecciones válidas.
- [ ] Mostrar fuente y disponibilidad por pista. Mantener enlaces de investigación externos y acceso secundario a fotografía/biblioteca. No ofrecer exportación de geometrías inexistentes.
- [ ] Verificar Lomo nativo sobre fondo realmente cargado en tres niveles de zoom y después de pan; alejar hasta Chile/vista mundial, desplazar fuera del parque y regresar. Comprobar alineación, nunca dibujo fijo sobre pantalla.
- [ ] La aceptación completa requiere las tres pistas simultáneas y ocultables de forma independiente, con sus fuentes permitidas. Hasta conseguir las otras dos geometrías, declarar avance parcial; enlaces y widgets no sustituyen ese criterio.

Salida parcial posible ahora: Lomo y contexto abierto en el mapa continuo. Salida final exigida: tres capas nativas acreditadas simultáneas; pendiente de datos de Starwars y La Virgen.

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
- [ ] Distinguir código/datos incluidos de fondos cartográficos online. No preparar paquetes offline de teselas.
- [ ] Añadir comandos explícitos `test:geographic`, `test:geographic:browser`, construcción y prueba autónoma. Ejecutar `npm test` y los controles de navegador/artefacto/preservación afectados; registrar comando, resultado y límites.
- [ ] Inspeccionar resultados escritorio, 390×844 y 360×800: pista real, controles táctiles, pan/pellizco, rotación, tamaño recuperado y ausencia de desbordamiento. Una mera etiqueta iframe/canvas o HTTP 200 no satisface la prueba.
- [ ] Probar hash erróneo, JSON ausente y teselas inaccesibles, con estados independientes por fuente. Guardar capturas comparativas y evidencia sin cookies, tokens ni trazas personales.
- [ ] Solicitar revisión independiente del diff y criterios de aceptación; corregir incidencias y repetir solo verificaciones afectadas.
- [ ] Revisar archivos añadidos y commits; conservar rama aislada y `main` intacta. Preparar resultado revisable antes de proponer publicación.

## Matriz de cierre

| Criterio | Evidencia exigida |
|---|---|
| Mapa único | Una instancia Leaflet mundial, sin iframes como sustitutos. Seleccionar/ocultar una pista no reemplaza el mapa ni modifica centro/zoom salvo petición explícita. |
| Tres pistas geográficas | Tres capas nativas simultáneas con fuentes reutilizables y segmentos identificados; escritorio y móvil inspeccionados. Pendiente de datos para Starwars y La Virgen; Lomo solo no cierra este criterio. |
| Datos abiertos | Lomo conserva 127 nodos OSM y fuente/versión; ejes correctos, hash íntegro y exportación verificable. |
| Honestidad | Ninguna conexión renombrada como pista, geometría protegida copiada, hueco inventado o precisión de terreno sin prueba. |
| Interacción | Selección visible con contexto apagado, visibilidad individual y pan/zoom/pellizco compartidos sin desfases. Alejar a vista mundial y regresar mantiene las coordenadas. |
| Conservación | Blob, calibración, `trails/webCenter`, biblioteca y localStorage idénticos antes/después en el mismo origen, también con SW. |
| Fallos | Datos de una fuente alterados/inaccesibles deshabilitan solo sus capas/exportación; el mapa y fuentes independientes permanecen disponibles. Pista pendiente no produce trazado ficticio ni cambia a un widget. |
| Entrega | Código/datos editables, artefacto ejecutable, capturas, pruebas y documentación de pendientes. URL local diferenciada de vista previa accesible y publicación; comprobar la URL antes de llamarla operativa. |

## Fuera de este cierre

No implementar map matching, destinos, loops, sentidos, conexiones transitables o distancia restante. No declarar georreferenciado el cartel ni afirmar precisión por error cero en puntos de ajuste. La futura navegación requiere obtener geometría reutilizable donde falta y contrastar extremos, accesos, sentidos, conectividad e incertidumbre GPS.

La implementación continúa después de esta fase de planificación; el prototipo sin publicar no es la entrega aprobada.
