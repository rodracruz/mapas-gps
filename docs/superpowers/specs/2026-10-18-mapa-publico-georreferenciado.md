# Mapa público georreferenciado de El Durazno

Fecha de consulta: 18-10-2026, America/Santiago (19-10-2026 UTC).
Estado: especificación para planificación; no implica aceptación del prototipo ni publicación.

## Objetivo y alcance

Mostrar Star Wars, La Virgen y Lomo Vetado sobre cartografía pública georreferenciada. La fotografía conserva su función de documento de comparación, accesible como vista secundaria. No será el fondo principal de navegación.

Esta entrega permite consultar y seleccionar pistas. No implementa navegación, distancia restante, loops ni ajuste del GPS. No afirma que una ficha pública o una línea con coordenadas esté validada sobre el terreno.

## Decisión de arquitectura

1. Usar el **widget oficial de Trailforks por pista** para consultar las tres pistas individualmente. Es la modalidad encontrada que muestra las tres con nombre y trazado independiente sobre cartografía geográfica. Mantener el enlace y la atribución del proveedor, y cargar solo la selección actual.
2. Ofrecer una vista propia OSM, con Leaflet, para **Lomo Vetado y contexto abierto**. Conservar los nodos originales de OSM, su orden, ID, versión y procedencia. Identificar expresamente esta modalidad como una fuente diferente del widget.
3. Conservar el trazado fotográfico en coordenadas de imagen y sin transformación geográfica. No trasladarlo a OSM ni usarlo para completar huecos.

Las modalidades son independientes: tras validar el catálogo, las consultas Trailforks no esperan la carga del snapshot OSM. Si falta o está alterado, deshabilitar únicamente la vista/exportación OSM y mantener disponibles los widgets de las tres pistas.

La vista oficial externa y el mapa OSM propio no comparten una supuesta geometría equivalente. No se promete superponer las tres pistas en una única capa propia. Esa posibilidad requiere geometrías con derechos de reutilización y correspondencias comprobadas.

## Evidencia por pista

| Pista / ID estable de la aplicación | Mapa individual público | Geometría reutilizable comprobada | Límites |
|---|---|---|---|
| Starwars / `starwars` | [Trailforks 76316, Star Wars](https://www.trailforks.com/trails/star-wars-76316/) | No se encontró una polilínea abierta identificada exclusivamente como esta pista en la consulta realizada. | El widget muestra el trazado del proveedor. No se extraen coordenadas, GPX ni datos internos. Extremos, vigencia y conexión con Cactus no están contrastados de manera independiente. |
| La Virgen / `la-virgen` | [Trailforks 205330](https://www.trailforks.com/trails/la-virgen-205330/) | No se encontró la pista completa identificada en OSM. | `Conexión Calibre 12-La Virgen`, OSM 477174834, es una conexión, no la pista. Distinguir también la subida de la pista de descenso y la posterior conexión con Mampato. |
| Lomo Vetado / `lomo-vetado` | [Trailforks 7601](https://www.trailforks.com/trails/lomo-vetado/) | [OSM way 477170097](https://www.openstreetmap.org/way/477170097), versión 6, 127 nodos, última edición registrada 07-02-2023. | Fuente y posición geográfica documentadas; precisión de terreno, extensión actual, sentidos y accesos pendientes. La fecha de edición no acredita fecha de levantamiento. |

La búsqueda nominal ampliada OSM se realizó con bbox `(-33.34,-70.53,-33.27,-70.47)`, base 19-10-2026 00:15:36 UTC. Encontró Lomo y conexiones. Esto no descarta vías sin nombre y no demuestra que dos caminos cercanos sean la misma pista.

## Mapa oficial: prueba y condiciones

- [Catálogo de widgets](https://www.trailforks.com/widgets/): modalidad oficial “Trail Details”, mapa de una pista.
- [Configurador por pista](https://www.trailforks.com/widgets/config/trail/?trailid=76316): accesible sin login; genera iframe y enlace al proveedor.
- Ejemplo generado: `https://www.trailforks.com/widgets/trail/?trailid=76316&w=100%&h=350px&activitytype=1&map=1&basemap=trailforks&elevation=1&photos=0&title=1&info=1&trail_opacity=25&v=2&basicmap=1`.
- También existe [configurador de región 4442](https://www.trailforks.com/widgets/config/region_map/?rid=4442); no es necesario para el alcance mínimo ni sustituye la identificación por pista.
- [Política de datos de Trailforks](https://www.trailforks.com/about/data/): no asumir que el widget concede acceso o derechos para extraer/republicar geometrías. No solicitar ni publicar claves ni activar servicios de pago.

Los tres widgets renderizaron en un iframe de un origen tercero en Chromium: mapa topográfico, pista individual resaltada, controles y perfil visibles. Hubo un error de `CacheStorage.open` debido a la política del navegador, sin impedir el render. No se modificó esa política. Esta prueba es de escritorio y del widget aislado: falta interacción móvil, integración final y disponibilidad desde el destino publicado.

Evidencia local de investigación, fuera del repositorio público:

- `/workspace/scratch/plan-mapas/tf-starwars-iframe.png`
- `/workspace/scratch/plan-mapas/tf-virgen-iframe.png`
- `/workspace/scratch/plan-mapas/tf-lomo-iframe.png`

Las tres capturas fueron inspeccionadas por el agente de mapas públicos y por el agente principal. No publicar automáticamente capturas o datos de proveedores al repositorio; esta evidencia local no concede derechos de redistribución.

## Contrato OSM

Fuente consultada: [API map bbox](https://api.openstreetmap.org/api/0.6/map?bbox=-70.518,-33.328,-70.485,-33.290). Snapshot del prototipo: `sources/el-durazno-osm.json`, 79 vías completas y 2932 nodos. Huella SHA256: `b8926fb02ddcc2410850d831312e64a5c51e5aeb9db49ce970a86e418a0df318`.

Representación: EPSG:4326, orden `[longitud, latitud]`; sin recorte, simplificación, interpolación ni uniones por proximidad. Conservar IDs de nodos para futuras relaciones, sin declararlas transitables automáticamente.

Anclas de Lomo para detectar inversión de ejes, desorden o sustitución de fuente:

| Posición | Nodo OSM | `[longitud, latitud]` |
|---|---:|---|
| Inicio de la secuencia | 4705608466 | `[-70.4923871, -33.3040099]` |
| Índice 63 | 4705609117 | `[-70.5005836, -33.3094445]` |
| Final de la secuencia | 4705608441 | `[-70.5036907, -33.3138365]` |

Comparar también los 127 nodos completos con la fuente. Las anclas y la huella comprueban fidelidad a OSM, **no exactitud independiente**. La longitud de unos 2786 m calculada sobre esa secuencia es horizontal y dependiente de la fuente; no representa distancia oficial, desnivel ni recorrido restante.

Cumplir [ODbL y atribución OSM](https://www.openstreetmap.org/copyright) y [política de teselas](https://operations.osmfoundation.org/policies/tiles/): HTTPS del proveedor, Referer, caché HTTP y sin descarga masiva u offline de teselas. Código/geometría locales y fondo de mapa online tienen disponibilidad distinta.

## Contraste oficial y referencias secundarias

- [Outlife: RKF El Durazno](https://www.outlife.cl/parques/rkf-el-durazno/): confirma nombres; La Virgen principiante, Starwars y Lomo intermedio. No suministra aquí una transformación geográfica del cartel.
- [Outlife: review Alex Marín, 11-03-2025](https://www.outlife.cl/noticias/review-de-alex-marin-en-rkf-el-durazno/): descenso por La Virgen y posterior conexión con Mampato; evidencia textual de segmentación, no polilínea.
- [Outlife: todas las pistas](https://www.outlife.cl/noticias/todas-las-pistas-del-durazno-en-un-dia-travesia-the-good-durazno-all-in/): menciona Starwars con Cactus; no identifica ambos como una sola pista.
- [Wikiloc 12062480](https://es.wikiloc.com/rutas-mountain-bike/cycleworld-el-durazno-mtb-park-buitrera-star-wars-12-01-2016-12062480), 2016: circuito que incluye Star Wars.
- [Wikiloc 164985986](https://es.wikiloc.com/rutas-mountain-bike/el-durazno-ruta-la-buitrera-164985986), marzo de 2024: incluye ascenso y descenso por La Virgen.
- [Instrucciones oficiales de iframe Wikiloc](https://help.wikiloc.com/article/259-share-embed-iframe-insert-embed-trail-route-wikiloc-web-blog-digital-online-html). El iframe falló con restricciones de almacenamiento de terceros. Los dos mapas sí renderizaron como página principal tras esperar su carga. Son referencias de circuitos compuestos y no la integración recomendada.

No se encontró una validación independiente de precisión, un control geográfico exacto del cartel ni un modelo justificado para convertir sus píxeles. `visualToGeographicTransform` permanece `null`; `navigationValidated`, `false`.

## Conservación e interfaz

- La nueva página tiene mapa principal, selección de pista, fuente visible, enlace público alternativo, opción OSM cuando hay geometría abierta y acceso secundario a fotografía/biblioteca.
- No extraer datos de iframes de otro origen. Mantener un aviso neutral de disponibilidad externa y enlace alternativo permanente; informar errores detectables. El anfitrión no puede detectar automáticamente un mapa vacío sin una señal oficial del proveedor. Confirmar el render mediante la inspección de aceptación, sin tratar `iframe.load` como prueba de pista cargada.
- Mantener `mapas-gps-v1` versión 1, almacén `maps`, Blob, calibraciones, `trails`, `webCenter`, IDs y localStorage existentes. No migrar ni borrar para activar el visor.
- Sites y GitHub Pages son orígenes diferentes y no comparten IndexedDB. Conservar datos no significa trasladarlos; cualquier futura migración requiere un alcance explícito.
- Mantener enlaces a la aplicación original. Probar también con el service worker anterior activo y datos ausentes/versiones mezcladas.
- Navegación sobre la red queda aplazada hasta disponer de geometrías reutilizables, conexiones/sentidos/accesos comprobados y tratamiento de incertidumbre GPS.

Plan ejecutable: [2026-10-18-mapa-publico-georreferenciado.md](../plans/2026-10-18-mapa-publico-georreferenciado.md).
