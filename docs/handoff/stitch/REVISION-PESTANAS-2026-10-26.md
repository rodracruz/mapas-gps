# bikeride: revisión de las pestañas recibidas

Rodrigo pidió revisar las otras pestañas diseñadas en Stitch y adjuntó un ZIP nuevo. Se revisaron las imágenes originales y el código estático. Esta entrega es una revisión; no incorpora pantallas ni funciones a la publicación versión 21.

## Archivo comprobado

- ZIP: `stitch_outdoor_activity_finder (1).zip`, 3916289 bytes, SHA256 `84a113e38416289740c8871fea025451c1e761b9edfeaefeb3d5f8b1aa6d14bc`.
- Integridad CRC correcta; 22 archivos: 10 HTML, 10 PNG y 2 documentos Markdown. Se comprobaron rutas y ausencia de enlaces simbólicos antes de extraer.
- El ZIP y los originales extraídos se conservan fuera de Git. Se inspeccionaron los píxeles de las 10 capturas, sus dimensiones, scripts y enlaces. No se ejecutó el JavaScript del prototipo ni se consultaron sus imágenes remotas.
- `mapas_gps_parques_senderos_v2/code.html` es idéntico byte a byte al recibido anteriormente: 47599 bytes, SHA256 `afeafc9b538f0dec004409238084d1d34d7817ba5c1508fe3f14dc2e5c215ed1`. Su PNG ahora muestra la página completa a 322×1600; no es una nueva implementación de esa pantalla.
- El documento de integración y DESIGN.md también son idénticos a los anteriores. El aporte nuevo es el conjunto de otras nueve pantallas y la captura completa de la ya conocida. No se infiere una cronología de versiones a partir de los nombres de carpeta.

## Pantallas y relación con bikeride

Se distinguen dos familias por idioma, contenido y navegación. Esta distinción describe lo observado; no autoriza incluir o descartar módulos sin el encargo correspondiente.

| Pantalla / carpeta | PNG original | Contenido visual observado | Relación con la aplicación actual |
|---|---:|---|---|
| Parques y senderos · `mapas_gps_parques_senderos_v2` |322×1600| Bienvenida, selector El Durazno/Parquemet, mapa, filtros, tarjetas y navegación ciclista. | Referencia ya adaptada en bikeride. La nueva captura permite ver el contenido inferior; el HTML no cambió. |
| Mapa GPS en ruta · `mapa_gps_en_ruta` |555×1600| Próximo giro, mapa, capas, posición, puntos de servicio, SOS, velocidad, tiempo, distancia, desnivel, hito, pausa y bloqueo. | Puede servir de referencia visual para el mapa real. Hoy existen ubicación/precisión, ajuste probable, continuidad y parada; faltan instrucciones de giro, registro de actividad, auto-pausa, métricas acumuladas y los servicios dibujados. |
| Explorador de rutas · `explorador_de_rutas` |404×1600| Búsqueda, disciplinas, ruta destacada, altimetría, GPX, lista de senderos y estado operativo. | Hoy Rutas lleva a los filtros del parque. Una pantalla independiente debe mantener el parque seleccionado, sus 47 fichas y categorías reales; búsqueda, destacado, estado del terreno y tiempos requieren implementación/fuentes. |
| Detalle técnico · `detalle_t_cnico_de_sendero` |345×1600| Portada, estado/sentido, métricas, perfil altimétrico, tramos, obstáculos, ajustes de bicicleta, patrulla/clima y acciones GPS/GPX/compartir. | Hoy hay ficha con fuente, dificultad y longitud OSM disponible. Faltan elevación, obstáculos, terreno, sentido validado, patrulla, clima y recomendaciones respaldadas. La presentación puede adaptarse sin rellenar esos campos con ejemplos. |
| Perfil y actividad · `perfil_y_mi_actividad` |335×1600| Perfil, Beacon, estadísticas, rutas offline, historial, bicicleta, presiones y mantenimiento. | Perfil sigue pendiente. Se necesita persistencia real y entrada voluntaria de datos; Beacon/sincronización entre personas requieren un servicio y permisos propios. No hay actividad personal registrada de la que obtener esas cifras. |
| Puntos de encuentro · `puntos_de_encuentro` |392×1600| Puntos clave, mapa de servicios, fichas de estaciones, quedadas, cupos, participación y creación. | Encuentros sigue pendiente. Los servicios conocidos del parque no tienen por ello coordenadas exactas. Agenda personal y directorio/participación compartidos son alcances distintos. |
| Explore · `explore` |687×1600| Búsqueda de actividades outdoor, categorías, expedición destacada, guía/precio y senderos en millas. | Familia general en inglés, con navegación Explore/Expeditions/Rentals/Profile. No es equivalente a la navegación ciclista de cuatro pestañas. |
| Expeditions · `expeditions` |300×1600| Expediciones, guías, precios, fechas, cupos, modal y confirmación de reserva. | No hay inventario, organizadores ni servicio de reservas de esta clase en bikeride. Se conserva como diseño recibido, sin tomar sus ofertas como catálogo real. |
| Profile · `profile` |603×1600| Viajes, material guardado, beneficios, puntos y reservas de otra persona de ejemplo. | Pantalla distinta de Perfil y actividad de ciclismo. No se fusionan perfiles, identidades o estadísticas de las dos familias. |
| Rentals · `rentals` |256×1600| Material outdoor, tallas, precio por día y carrito. | No existe catálogo de alquiler, disponibilidad, entrega ni checkout en bikeride. Su revisión no activa comercio ni añade esas ofertas. |

Las capturas tienen diferentes anchos y todas llegan a 1600px de alto. El ZIP no documenta su viewport CSS ni la escala de captura; las imágenes largas no prueban cómo se comporta un teléfono a 390×844 o en horizontal. Al implementar se deberá comparar cada pantalla al mismo viewport y comprobar mapa/controles visibles; no tomar 1600px de imagen como alto CSS del teléfono.

## Qué funciona en esos HTML y qué es sólo una representación

Se leyeron todos los scripts inline sin ejecutarlos. Los 10 documentos usan recursos externos de presentación, entre ellos Tailwind/Google Fonts e imágenes; eso no constituye un servicio de datos. Sus enlaces de navegación son `href="#"`. No se encontraron llamadas a geolocalización, `fetch`, WebSocket ni almacenamiento persistente en la lógica inline inspeccionada.

- **GPS en ruta:** abre/cierra el menú de capas y cambia el texto/color Pausar/Reanudar. El mapa es un SVG ilustrado; no es la red OSM ni una posición medida. Las cifras de velocidad, precisión, distancia, pendiente y tiempo están escritas en la página. El cambio de estado del botón no pausa una grabación real. No hay integración SOS acreditada.
- **Explorador:** los filtros cambian estilos. GPX cambia icono y muestra un mensaje de que la ruta está lista; no genera ni guarda un GPX.
- **Detalle técnico:** los temporizadores muestran Descargando/GPX Guardado y Buscando Satélites/En Marcha. No descargan una traza ni inician GPS. La acción compartir sí contiene una llamada a `navigator.share` cuando existe: compartiría el texto/URL de ejemplo, no una ruta o actividad validada.
- **Perfil ciclista:** los tres botones internos cambian el resaltado; no cargan historial, mapas ni garaje persistidos. Beacon viene marcado como activo en el HTML y al desmarcar muestra una alerta; no existe transmisión a contactos ni confirmación de recepción. Ese estado no representa consentimiento del usuario de bikeride.
- **Encuentros:** los botones superiores resaltan/desplazan contenido. Unirse/Reservar cambia la etiqueta a confirmado; no registra participación ni descuenta cupos. Crear abre un modal y luego un aviso, sin crear un evento o punto guardado.
- **Familia outdoor:** Explore no contiene lógica de aplicación aparte de configuración visual; Expeditions muestra modal/toast de reserva; Rentals cambia un contador de carrito en memoria; Profile alterna paneles. No hay reservas, pagos ni perfiles conectados.

Los prototipos sí describen estados y componentes útiles. Las interacciones visuales anteriores no se deben importar como sustituto de los controladores funcionales existentes.

## Hallazgos para una integración fiel

1. **La familia ciclista es coherente con bikeride.** Mantiene verde bosque, superficies claras, Sora/Inter y navegación Mapa GPS/Rutas/Encuentros/Perfil. La referencia exacta será el HTML/PNG de cada pestaña, conservados intactos; no una pantalla nueva inventada a partir de esta revisión.
2. **Los datos del ejemplo no corresponden a los catálogos actuales.** Se contrastaron ambos catálogos: nombres como Los Cóndores, Sendero El Espino y Circuito Los Coihues no están entre las 21 fichas de El Durazno ni las 26 de Parquemet. Lomo Vetado y Calibre 12 sí figuran en El Durazno; sus datos siguen siendo los del catálogo contrastado. No deben renombrarse geometrías existentes para forzar esa correspondencia. Lo mismo aplica a estados de apertura, inspección de hoy, obstáculos, clima, tiempos, presiones y estadísticas sin fuente comprobada.
3. **El mapa sigue siendo el motor geográfico real.** El SVG decorativo del GPS y la imagen de fondo de Encuentros no acreditan georreferenciación de rutas o servicios. El fondo de Encuentros dice Santiago/Parque Metropolitano en un atributo mientras sus fichas hablan de otro parque; falta una correspondencia identificada. Se conservan geometrías, nodos, precisión y ambigüedad del GPS actual. No se dibujan los iconos de servicios en coordenadas supuestas.
4. **La fotografía del plano sigue siendo información de origen.** Las fotos de paisajes/ciclistas del modelo pueden orientar el formato de portada, pero no sustituyen las miniaturas de ruta sobre el plano original que Rodrigo pidió. No se infieren obstáculos, curvas o puntos a partir de esas fotografías de ejemplo.
5. **Estados operativos y personales reales.** Offline Sync, GPS óptimo ±2m, satélites activos, Beacon compartiendo, cupos confirmados y descargas guardadas sólo pueden mostrarse cuando exista el proceso correspondiente y su evidencia. La precisión debe venir del dispositivo y el navegador no aporta el número de satélites utilizado. Un perfil nuevo necesita estado vacío; no el nombre/avatar/historial de la muestra.
6. **Navegación entre pestañas por conectar.** Los enlaces `#` deben llevar a vistas reales con parque/ruta seleccionados. Búsqueda y filtros deben afectar a los datos; una ficha debe abrir el sendero correcto; los botones de registro, compartir o reservar necesitan su propia conducta verificable. La marca visible seguirá siendo **bikeride**.
7. **Los servicios adicionales conservan sus dependencias.** Garaje/perfil/agenda personal pueden ser locales, con datos introducidos por el usuario. Beacon, sincronización y encuentros compartidos necesitan decisiones de servicio, acceso y retención. La cartografía offline necesita una fuente que permita descarga; el botón GPX no hace offline el fondo mundial. Los giros/destinos/loops requieren conexiones, accesos y sentidos contrastados, con `navigationValidated:false` aún vigente.
8. **Móvil y lectura.** Los HTML exportados restringen el zoom del navegador mediante `maximum-scale=1.0,user-scalable=no`; no conviene trasladar esa limitación a bikeride. El panel de telemetría debe comprobarse en teléfonos cortos y en horizontal conservando el área visible del GPS, como ya hace el visor actual. La captura larga no demuestra esa condición.

## Continuación y límites de esta revisión

La secuencia propuesta para una integración posterior es primero Explorador de rutas y Detalle técnico con el catálogo real, después Mapa en ruta sobre el motor GPS existente, y Perfil/Encuentros cuando se concreten sus datos y persistencia. Es una recomendación de orden; la recepción del ZIP no cambia por sí sola el alcance de esta revisión. Las cuatro pantallas outdoor quedan identificadas para decidir su encaje; no se borran ni se añaden automáticamente al menú ciclista.

Se verificaron tamaño/hash/CRC, estructura del archivo, dimensiones y píxeles de las 10 imágenes, identidad del HTML/documentos repetidos, scripts/enlaces y correspondencia con el catálogo/código actual. No se ejecutó el prototipo, no se probaron sus botones en navegador ni se comprobó su responsive en dispositivos. No se repitió la suite 131 porque no hay cambios de producto. Bikeride permanece en versión 21 y main conserva su estado. El inventario editable y los hashes están en [PESTANAS-RECIBIDAS.json](PESTANAS-RECIBIDAS.json).
