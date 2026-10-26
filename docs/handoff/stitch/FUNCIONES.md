# Funciones que el diseño debe representar

Base:31e5c698dd00f3e8ea8f0a7641c6a709a4d93b9f. La etiqueta «existente» describe código presente; no certifica condiciones actuales sobre terreno.

| Área | Existente y que se conserva | Estados y límites relevantes |
|---|---|---|
| Parques | Selector El Durazno/Parquemet; volver y cambiar de parque | Carga y error de catálogo; no mezclar datos entre parques |
| Información | Nombre, descripción, servicios, fuentes y plano oficial ampliable | Servicios documentados; vigencia/disponibilidad por confirmar |
| Recorridos | Tarjetas del tamaño del mapa, principales primero, datos desplegables | El Durazno21 fichas; plano20 senderos y2 subidas; Parquemet26 fichas:8 ciclistas,6 compartidos,12 avenidas/caminos |
| Miniaturas | Ruta sobre una sección relevante del plano original; ampliar | Curvas y fondo en el mismo sistema de coordenadas; algunas avenidas sólo tienen una referencia de tabla o sector, no una línea central extraída |
| Filtros | Tipo, longitud OSM ascendente/descendente, cercanía ascendente/descendente, dificultad documentada | Sin coincidencias; dificultad sin datos deshabilitada; mapa siempre en su sitio; ordenación de longitud y cercanía mutuamente excluyentes |
| Cercanía | Lectura puntual solicitada al ordenar por cercanía; reutiliza lectura reciente | Permiso rechazado, posición antigua/imprecisa; cercanía al tramo en línea recta, no distancia accesible por caminos; no activa seguimiento GPS |
| Mapa | OSM mundial, zoom/pan, pantalla completa, encuadrar, elegir por línea/lista, ficha inferior | Fuentes distintas; errores de conexión; ficha desplazable; rótulos y controles sin tapar GPS |
| Capas | Activar/ocultar recorridos, caminos de contexto, inspeccionar vía OSM y descargar datos OSM | Atribución ODbL; exportación sólo de geometría geográfica identificada |
| Plano El Durazno | Foto/plano, superposición, sólo vectores, opacidad, zoom/pan, selección, exportación visual |23 trazados continuos,20 senderos de leyenda y2 subidas; coordenadas nativas de imagen; registro mundial aproximado no apto para ajuste GPS |
| Plano Parquemet | PDF original, área del mapa, superposición, sólo rutas, opacidad, selección, zoom/pan | Mantiene el plano esquemático separado de OSM; los senderos peatonales están en el plano, su digitalización interactiva no está completa |
| GPS | Activación voluntaria, detener, recentrar, lectura original, precisión y aro de ajuste probable | Búsqueda, probable, ambiguo, fuera de red, precisión insuficiente, lectura antigua, pérdida temporal y permiso rechazado |
| Continuidad | Mantener pista probable; reevaluar por nodo OSM compartido y varias lecturas coherentes | Puede suspender/readquirir si la hipótesis falla; un cruce gráfico no autoriza cambiar de pista; Cartel aproximado no sirve para ajuste |
| Demo | Lomo Vetado→Calibre12 con49 posiciones públicas simuladas; pausa, paso y progreso | Sólo El Durazno; sin activar GPS del usuario; no prueba el sentido de circulación en terreno |
| Mis mapas | Aplicación anterior de imágenes importadas, calibración y mapas locales guardados | Preservar blobs, calibración, trazados, centro y almacenamiento; no trasladar ubicaciones personales al servidor |
| Fuentes | Identificar operador, edición, geometría de origen, referencias y datos pendientes | Longitud publicada del PDF y longitud OSM se distinguen; velocidad máxima/desnivel sin registros se muestran como faltantes |

## Ampliaciones previstas, pendientes de implementar

Destino, loops y distancias recorrida/restante por caminos forman parte del objetivo del usuario. Requieren construir y validar la red, sus conexiones, accesos y sentidos. El ZIP de Stitch ya se recibió y se integró su diseño en bikeride, conservando los motores reales; no hace falta pedirlo de nuevo. Las funciones propuestas siguen pendientes según [PROPUESTAS-SUDA.md](PROPUESTAS-SUDA.md). El [diagnóstico de siguiente etapa](SIGUIENTE-ETAPA.md) distingue qué puede completarse localmente, qué necesita servicios/datos y cómo verificarlo. No atribuir esas ampliaciones a la base actual.

## Módulos de integración

- Entrada y pantallas: `mapa-geografico.html`, `parquemet.html`, `geographic/viewer.mjs`, `geographic/park-viewer.mjs`.
- Estilos/miniaturas: `geographic/style.css`, `geographic/trail-preview.*`.
- Filtros: `geographic/route-filters.mjs`, `geographic/route-filter-ui.*`.
- GPS y continuidad: `geographic/gps.mjs`, `geographic/gps-viewport.mjs`, `navigation/matcher.mjs`, `navigation/demo.mjs`.
- Planos/registro: `geographic/sign.mjs`, `geographic/cartel.mjs`, `geographic/document*.mjs`.
- Fuentes y permisos: `data/`, `sources/`, `geographic/data.mjs`, `geographic/network.mjs`.
- Aplicación anterior: `index.html`, `app.js`, `online.js`, `style.css`, `sw.js`.
- Pruebas y evidencia: `tests/`, `docs/evidence/gps-validation*`, `docs/evidence/route-filters*`.

Conservar IDs de controles o entregar una tabla que relacione los IDs nuevos con éstos. Evitar sustituir los datos y motores existentes por ejemplos visuales que aparenten interacción sin integrar la lógica.
