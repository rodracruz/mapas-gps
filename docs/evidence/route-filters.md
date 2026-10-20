# Filtros sobre el mapa sin desplazarlo

2026-10-20 · rama `feat/park-route-filters`, sobre `b24e40a`.

El mismo panel de cuatro controles aparece antes del mapa de cada parque y se puede desplegar sobre el mapa completo. Se conservan el nodo del mapa, su tamaño, lugar y cámara al filtrar u ordenar. Solo cambian las capas visibles y las fichas/botones correspondientes; la tarjeta del mapa siempre ocupa el primer lugar.

- **Tipo:** palabras de las fuentes disponibles: Sendero ciclista, Paseo compartido, Avenida y Camino en Parquemet; Trail, Park y Subida en El Durazno. El motor admite la alternativa Bicicleta/Peatonal si una fuente futura documenta uso sin tipo. No inventa clasificaciones ni agrega geometrías. Los dos ascensos auxiliares del cartel conservan sus IDs, separados de Buitrera.
- **Longitud OSM:** mayor a menor o menor a mayor. Suma únicamente segmentos geográficos identificados. No mide el dibujo ni mezcla longitudes publicadas en el PDF con medidas OSM. Los recorridos sin geometría geográfica quedan al final; la longitud representa los tramos disponibles, no acredita la extensión completa.
- **Cercanía:** más cerca o más lejos, al punto más próximo de cada segmento OSM, no a su primer nodo o centro. Es distancia geodésica en línea recta hasta el tramo, no recorrido por caminos ni acceso comprobado. La posición aproximada del cartel no se usa para calcularla. En El Durazno las pistas aún sin correspondencia geográfica permanecen sin cercanía calculada.
- **Dificultad:** niveles publicados del operador en El Durazno; sin datos publicados en Parquemet, donde el control queda deshabilitado. Tipo y dificultad se combinan; una combinación vacía conserva el mapa y explica «Sin coincidencias».

Los dos controles de orden se excluyen: elegir longitud devuelve cercanía a «Sin ordenar» y viceversa. Así se muestra un orden único, sin aplicar prioridades ocultas.

## Ubicación y continuidad

No se solicita ubicación al entrar o cambiar tipo/dificultad/longitud. Solo al elegir cercanía o actualizarla se usa `getCurrentPosition`: una lectura, sin activar seguimiento ni el matcher GPS. Se reutiliza durante un máximo de 60 segundos si su precisión indicada es de 100 m o mejor; se muestra ±precisión. Una lectura futura por más de 5 segundos, antigua, inválida o demasiado imprecisa no ordena por cercanía.

Un rechazo, falta de señal o timeout deja disponible el mapa y los demás controles. Cambiar de orden invalida callbacks pendientes, pero conserva la caducidad de una lectura reutilizada. La posición vive en memoria de esta pantalla: Restablecer y abandonar la página la eliminan; al volver desde caché se vuelve a representar el estado sin posición. No se añade persistencia ni envío a un backend. Las solicitudes normales de teselas OSM mantienen el aviso de privacidad existente.

Filtros, cambios de fuente y controles manuales de Capas respetan sus estados. Una selección ocultada o excluida pierde su resaltado y ficha. Inspeccionar explícitamente contexto elimina las restricciones de tipo/dificultad para no presentar una vía ajena como coincidencia.

## Archivos y pruebas

`geographic/route-filters.mjs` contiene clasificación, métricas, filtros y ordenación sin DOM. `route-filter-ui.mjs` coordina el panel y la lectura opcional; `route-filter-ui.css` adapta cuatro campos a móvil y paisaje. Los dos controladores consumen el mismo componente; ambos constructores lo incluyen en su propio ámbito. No cambian catálogos, fuentes, curvas, proyecciones ni red GPS.

Verificaciones ejecutadas:

- 128/128 pruebas unitarias (120 previas y ocho nuevas): tipos, datos ausentes, orden estable en ambos sentidos, dificultad combinada, geometría inválida, edad/precisión y distancias al segmento, incluidos reversión, puntos repetidos y antimeridiano.
- `route-filters-browser.mjs`, fuente y bundle, ambos parques: cuatro controles, ordenación real de fichas, mismo nodo/rectángulo/cámara del mapa, combinaciones vacías, panel único, lectura opt-in, permiso rechazado, ausencia de seguimiento GPS y 320/390 px, 844×390 y 568×320.
- `route-filters-location-browser.mjs`, fuente y bundle: expiración al reutilizar una lectura en cerca→lejos, callback cancelado descartado y precisión insuficiente.
- `route-filters-visibility-browser.mjs`, ambos parques: resaltado/ficha eliminados al ocultar el seleccionado o filtrar contexto.
- Prueba anterior de doce avenidas adaptada al selector de tipos: conserva geometrías, diez recortes y dos referencias tabulares, restricciones, selección, ocultación manual y paisaje.
- Nueve grupos de `geographic-acceptance.mjs`: incluye Blob, calibración, trazados, localStorage e IndexedDB conservados con service worker activo; fuente/bundle, gestos y fallo de fuentes.

La revisión independiente detectó problemas de caducidad y selección que se reprodujeron en pruebas rojas antes de corregirlos. No quedan bloqueos en la revisión. No se ha probado físicamente en el parque; los datos de posición de las pruebas son públicos y simulados.

Capturas: [Parquemet, filtros y mapa en su lugar](route-filters/parquemet-home.png), [panel sobre el mapa](route-filters/parquemet-expanded.png), [El Durazno](route-filters/el-durazno-home.png), [dificultad y tipo](route-filters/el-durazno-expanded.png).
