# bikeride: corrección de fidelidad visual

El usuario señaló que la comparación publicada no reproducía el diseño recibido. La revisión de la página privada versión19 por HTTP200 confirmó sus bytes, y la inspección de sus píxeles y del PNG del ZIP confirmó una diferencia estructural: selector/volver/descripción/fotografía antes del mapa, frente a bienvenida/selector/mapa en la referencia.

Se corrigió esa estructura en la misma rama `feat/bikeride-stitch-integration`, conservando main, fuentes y motores. El encabezado mide 64px, la bienvenida 160px, el selector 90px y el mapa 176px. El mapa empieza ahora en y 354px CSS; en la construcción privada anterior estaba en y 1465px. No se identifica un mero cambio de color con fidelidad al diseño.

## Comparación reproducible

Estas tres capturas usan el mismo viewport CSS 390×595 y escala 544/390, produciendo PNG 544×830. Las medidas del encabezado y márgenes de la captura recibida corresponden a esa escala. No se comparó una captura390×844 contra otra 544×830 como si fueran iguales.

- [Antes, versión19](before-v19.png): capturado desde los mismos bytes de la publicación privada comprobada, servidos localmente para QA. Su plano visible es el original oficial público; no la fotografía privada del usuario.
- [Después, El Durazno](after-el-durazno.png) y [Parquemet](after-parquemet.png).
- [Pantalla más alta](after-tall.png) y [Lomo Vetado con cuerpo/acciones](route-lomo.png).
- [Coordenadas, dimensiones y hashes](verification.json).

El PNG original de Stitch no se incorpora a Git público. Se conserva en el ZIP privado intacto y se muestra, junto a antes/después de igual tamaño, en la [comparación del sitio privado existente](https://mapas-gps-revision-durazno.rodracruz.chatgpt.site/comparacion.html). La publicación anterior, versión 20, se comprobó por HTTP200 en la app, Parquemet y comparación, con hashes idénticos al paquete probado; ver [release.json](release.json). Conserva el único propietario y cero visitantes externos.

## Correcciones y diferencias deliberadas

Se ajustaron orden, proporciones, márgenes, Sora/Inter, superficies y colores del diseño, selector con contadores/subtítulos reales, iconos, degradados, botón con ojo y menú Capas real, barra inferior y controles táctiles de 44px. Los filtros principales usan botones horizontales con las categorías del catálogo; dentro del mapa conservan los controles compactos anteriores. El nodo del mapa se conserva al filtrar.

Las fichas muestran un fragmento del plano original, métricas existentes, descripción real y acciones **Ver ficha técnica / Ver en mapa**. El detalle técnico continúa desplegable. El área de imagen/estadísticas conserva 176px; el cuerpo común visible añade espacio debajo, como en la referencia. Las miniaturas pueden recortar extremos por su formato horizontal: se rotulan como fragmento y la ampliación mantiene la geometría completa, con el mismo sistema de coordenadas. Dos avenidas de Parquemet sólo tienen referencia en tabla: se informa sin atribuirles una miniatura de ruta.

Se mantienen diferencias necesarias: marca **bikeride**, estado real de red y GPS voluntario, sin avatar ajeno ni punto GPS inventado; mapas/curvas/atribuciones reales; ubicación del cartel identificada como aproximada; mediciones documentadas o Sin datos/Sin registros; botones reales en lugar de múltiples demos ficticias. La foto/plano original y sus servicios siguen accesibles en la vista principal por requisito expreso anterior. Perfil/Encuentros continúan señalados como pendientes. No se declara igualdad de todos los píxeles: los contenidos geográficos y estos estados difieren intencionalmente del ejemplo.

## Verificación

La regresión de diseño falló primero porque el mapa público estaba a y 1421px y faltaban filtros de botones. Una revisión independiente detectó después el cuerpo/acciones ocultos en las tarjetas; se añadió una comprobación que falló antes de incorporarlos. También se reprodujo la etiqueta incorrecta de «Fragmento» en las dos referencias de tabla de Parquemet y se corrigió desde el tipo real del modelo de miniatura.

La revisión independiente volvió a examinar capturas e interacción a 320/390/544/844px: confirmó resueltos los hallazgos importantes, apertura/cierre técnico, mapa real, objetivos 44px y ausencia de desbordamiento. Pasaron 131 pruebas unitarias, la regresión de diseño, los flujos móviles existentes, las pruebas de avenidas y los filtros de ambos paquetes autónomos. Se repitieron GPS/continuidad/disposición en cinco tamaños y conservación del almacenamiento; el paquete privado conservó su fotografía original y el cambio de parque en ambos sentidos. Los resultados constan en [verification.json](verification.json); la publicación se registra separadamente en release.json. Las pruebas usan datos públicos simulados; no validan GPS en terreno ni convierten las conexiones OSM en una red navegable comprobada.

Seguimiento: la atribución truncada de esa primera revisión se corrigió y se publicó como versión21. Las capturas actuales de esta carpeta reflejan ese ajuste; [evidencia y resultado actuales](../bikeride-attribution/README.md).
