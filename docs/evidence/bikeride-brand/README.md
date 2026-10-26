# Marca bikeride

La marca visible pasa a **bikeride**, exactamente en minúsculas, por indicación del usuario. Se actualizan cabeceras, nombres accesibles, ayuda, títulos de navegación y nombre de instalación del manifiesto. SUDA se conserva sólo como referencia histórica del diseño.

El cambio está en `feat/bikeride-stitch-integration`, dentro del worktree aislado existente. No renombra repositorio, dominios, claves de almacenamiento ni la API interna `window.MapasGPS`. La aplicación anterior mantiene sus mapas y calibraciones; no hay migración de datos.

## Comprobaciones

La comprobación local en Chromium390×844 verificó el selector, El Durazno y Parquemet, abrir/cerrar el mapa a pantalla completa, biblioteca y revisión visual; marca en minúsculas y títulos correctos,21/26 fichas,23 trazados visuales de El Durazno y filtro de11 avenidas. Ningún error JavaScript. El manifiesto mantiene inicio y ámbito. Ver [verification.json](verification.json).

La construcción privada anterior y la fotografía original conservan sus hashes. No se publicó una nueva versión del sitio ni se modificó main. Las capturas locales de esta comprobación muestran la interfaz existente con el nuevo nombre, no el diseño de Stitch integrado.

## Continuación

El adjunto local posterior resolvió el acceso al ZIP. La integración visual y sus pruebas se documentan en [bikeride-stitch](../bikeride-stitch/README.md). Esta carpeta conserva únicamente la comprobación del cambio de nombre.
