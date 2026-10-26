# bikeride: diseño recibido conectado a la aplicación

El adjunto local resolvió el acceso al ZIP. Se comprobó su SHA256 y se inspeccionaron el HTML, la captura 544×830 y los dos documentos sin ejecutar los scripts del prototipo. El original se conserva fuera del repositorio público. Contiene una pantalla de «Mapas GPS · Integración SUDA v2», no todos los servicios de una aplicación.

## Integrado

- Marca **bikeride**, en minúsculas; superficies, colores, Sora/Inter y componentes derivados del diseño comprobado. Fuentes locales con licencias OFL; sin Tailwind remoto ni lógica del prototipo.
- Selector horizontal de parque, navegación funcional hacia Rutas y el mapa/GPS existente, y estado de red del navegador. El indicador no afirma sincronización ni mapas descargados.
- Catálogo completo 21/26 fichas, filtros, mapa que conserva su nodo al filtrar, fichas desplegables, recortes de planos oficiales y selección real. El contador de filtros también incluye los trazados visuales adicionales del cartel; no equivale al número de fichas de catálogo.
- GPS voluntario y demo pública de 49 lecturas de El Durazno. Se conserva el motor, sus estados y la red de origen. La barra inferior se oculta en pantalla completa; el menú Capas abierto queda accesible sobre las fichas y el cálculo del área GPS tiene en cuenta sus dimensiones.
- Construcciones autónomas de ambos parques con estilos, módulo y fuentes embebidos. Se mantienen mapas guardados, almacenamiento y API de compatibilidad.

Encuentros y Perfil están deshabilitados y marcados «Próximamente». Offline completo/sincronización, garaje, Beacon, eventos, estadísticas personales, capas satélite/3D, altimetría/obstáculos y navegación por destinos/loops siguen pendientes. No se importaron datos ficticios, velocidades máximas, eventos, coordenadas fijas ni demos adicionales del HTML recibido.

## Evidencia

[verification.json](verification.json) registra la suite 130/130, nueve comprobaciones nuevas, flujo móvil existente, GPS simulado en cinco tamaños/rotación, seguimiento en ambos parques y conservación de almacenamiento. Hubo dos correcciones verificadas con fallo previo: actualización del indicador de red tras eventos simulados de restauración de página y alcance del menú Capas sobre paneles GPS/ficha. No se realizó validación GPS en terreno.

Capturas de la construcción de referencia con fuentes públicas:

- [El Durazno, inicio](el-durazno-mobile.png) y [rutas](el-durazno-routes.png).
- [Parquemet, inicio](parquemet-mobile.png) y [rutas](parquemet-routes.png).

La foto privada del usuario se conserva en la construcción privada y no se incorpora a estas capturas públicas ni al repositorio. Los originales del ZIP tampoco se publican aquí. La rama de producto es `feat/bikeride-stitch-integration`; main permanece sin cambios. La publicación privada versión 19 está verificada y conserva acceso sólo para el propietario, sin visitantes externos. [Abrir bikeride](https://mapas-gps-revision-durazno.rodracruz.chatgpt.site) · [Comparación visual privada](https://mapas-gps-revision-durazno.rodracruz.chatgpt.site/comparacion.html). La app, Parquemet y la comparación respondieron HTTP200 con bytes idénticos a los empaquetados; ver [release.json](release.json).

La revisión independiente no detectó problemas críticos de ejecución. Detectó la ausencia de los textos OFL en la construcción autónoma; se añadió su inclusión íntegra y una comprobación que falló antes de corregir el empaquetado. No se ha comprobado una restauración bfcache real en un dispositivo físico.
