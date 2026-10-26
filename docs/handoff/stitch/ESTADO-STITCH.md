# Estado actual: bikeride

## Última etapa

Las cinco pantallas ciclistas del segundo ZIP están implementadas en `feat/bikeride-stitch-integration`: mapa GPS en ruta, explorador, detalle técnico, perfil/actividad/garaje y encuentros. La revisión independiente de implementación y la segunda revisión de sus tres correcciones están aprobadas. El sitio privado está actualizado a la **versión22**, con un propietario, cero visitantes/grupos externos y HTTP200/hash idéntico al paquete probado. Código final5ab5d4; GitHub main no se modificó. El resultado definitivo se registra en [release.json](../../evidence/cycling-tabs/release.json).

[Entrega y límites de esta etapa](../../evidence/cycling-tabs/README.md) · [Plan](../../superpowers/plans/2026-10-26-cycling-tabs.md) · [Contratos de datos/UI](../../superpowers/specs/2026-10-26-cycling-tabs-design.md).

## Comportamiento real

- 21 fichas en El Durazno y26 en Parquemet. Planos originales, geometrías, catálogo y antiguo almacenamiento de mapas conservados. Las rutas tienen búsqueda/filtros/favoritos y fichas técnicas; longitudes OSM/PDF separadas, referencias de tabla identificadas y datos desconocidos explícitos.
- Perfil opcional, bicicletas, notas de mantenimiento, archivos GPX e historial GPS en la base separada `bikeride-local-v1`. No hay persona, bicicleta, actividad ni estadísticas precargadas. Los PSI son datos introducidos, no recomendaciones.
- Agenda personal con creación/edición/cancelación/reactivación/eliminación y exportación ICS real. No hay reservas, cupos ni participantes compartidos.
- Un solo Leaflet y un solo controlador GPS por página. Consultar GPS y la demo no registran actividad. «Registrar actividad» guarda lecturas localmente con pausa/reanudación/cierre, cortes entre segmentos y recuperación de datos confirmados tras recargar. El ajuste probable/incertidumbre/continuidad anterior permanece. Se evita prometer ejecución en segundo plano o recuperación de datos no confirmados.
- GPX real de segmentos geográficos OSM documentados, con atribución y enlaces de procedencia; GPX propio de actividades sin atribución OSM. No es descarga del mapa base.

La marca visible es **bikeride**, en minúsculas. No renombrar repositorio/dominio ni cambiar GitHub `main`. No copiar HTML/PNG/ZIP originales de Stitch, foto privada, datos de agenda o recorridos del usuario al repositorio público.

## Verificación y revisiones

La nueva implementación se probó en fuente y en ambos paquetes autónomos, usando copias aisladas. Formularios reales, IndexedDB/rollback, recarga, historial/archivos, rutas profundas, navegación repetida y GPS voluntario/demostración están cubiertos. Los mapas antiguos conservan Blob, calibración y senderos con service worker activo. La regresión GPS usa49 posiciones públicas en cinco tamaños y seguimiento simulado en ambos parques.

La revisión encontró y corrigió: aviso que tapaba acciones, fechas con contraste1:1 y descripción accesible antigua que prometía no guardar. La regresión nueva verifica44 comprobaciones visuales/AX en ambos parques320×568 y390×844; contraste final6.48:1 y superposición0. Mensajes de error claros conservan los datos previos.

La comprobación final de la foto también detectó una flecha que interceptaba el toque en la versión21. El selector se restringió al botón fotográfico, conservando miniaturas y medidas. La prueba compara dimensiones del diseño vigente y utiliza toques normales para ampliar/zoom, incluyendo la foto privada960×1280. No confundir el test antiguo de imagen a ancho completo con el diseño vigente de bikeride.

Los resultados definitivos y los hashes del código/paquete se recogen en [verification.json](../../evidence/cycling-tabs/verification.json) y las revisiones archivadas junto a la entrega. La construcción privada anterior de la `dist` del worktree se conserva; no representa necesariamente la publicación actual.

## Pendientes reales

Beacon/SOS, sincronización/cuentas, participación colaborativa y servicios/reservas en tiempo real necesitan decisiones de producto y servicios externos; no están conectados. Offline completo requiere paquetes y una fuente permitida de cartografía base: no precargar masivamente teselas estándar de OSM. Satélite/3D, altimetría, obstáculos, patrulla/clima y accesos/sentidos necesitan fuentes verificadas.

La navegación por red con indicaciones, loops y distancia restante sigue pendiente de validar geografía/conexiones. La distancia registrada aquí es una estimación sobre lecturas GPS aceptadas. Las pruebas de navegador no equivalen a GPS en terreno, teléfono físico o pantalla bloqueada. Expediciones y alquileres quedaron expresamente fuera de esta etapa.

## Fuentes y continuidad

El primer ZIP `ee1a8c4d…` se recibió y verificó correctamente; no existe un bloqueo actual de login, portapapeles ni transferencia. El segundo ZIP tiene3916289 bytes y SHA256 `84a113e38416289740c8871fea025451c1e761b9edfeaefeb3d5f8b1aa6d14bc`. Diez pantallas fueron inspeccionadas: se aprobaron las cinco nuevas ciclistas y se excluyó la familia outdoor general. El HTML de Parques/senderos v2 coincide con el primer ZIP.

[Revisión estática y visual de las pantallas](REVISION-PESTANAS-2026-10-26.md) · [Inventario/hashes](PESTANAS-RECIBIDAS.json). Los scripts del prototipo nunca se utilizaron como servicios reales. Referencias de diseño y fotografía original permanecen privadas.

Historial: [integración inicial](../../evidence/bikeride-stitch/README.md), [corrección visual](../../evidence/bikeride-visual/README.md), [atribución](../../evidence/bikeride-attribution/README.md), [recuperación resuelta](RECUPERACION-2026-10-26.md). El diagnóstico [SIGUIENTE-ETAPA.md](SIGUIENTE-ETAPA.md) es histórico; las funciones locales enumeradas arriba ya no deben tratarse como propuestas sin implementar.

La revisión conjunta final corrigió propiedad entre pestañas y borrado/checkpoints, exclusión de saltos GPS rechazados y fuente real de servicios. Una revisión focalizada posterior corrigió el inicio pendiente para respetar Detener GPS/demo. Todo aprobado;155 pruebas finales y regresiones específicas verdes. La coordinación nativa entre pestañas es requisito de grabación; donde falta se conserva historial/consulta y se rechaza grabar/recuperar con aviso.
