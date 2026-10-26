# Estado actual: bikeride

El usuario entregó el ZIP directamente a esta tarea y quedó resuelto el bloqueo de transferencia. No hace falta repetir inicio de sesión, exportación ni lectura de portapapeles. Se verificó su tamaño 278768 bytes, CRC y SHA256 `ee1a8c4dbc98642089f14dee7f0ef8cb150bd5d57b6f5b1454f7d59318daae06`; el original permanece fuera de Git.

El archivo contiene un HTML, una captura 544×830 y dos documentos de la revisión «Mapas GPS · Integración SUDA v2». Es una pantalla de referencia, no una aplicación completa ni prueba de servicios conectados. Sus scripts y mediciones de ejemplo no se ejecutaron ni importaron a la app.

## Resultado implementado

La marca es **bikeride**, en minúsculas. Se aplicó el diseño a los visores reales, con fuentes locales licenciadas, selector horizontal, navegación Mapa GPS/Rutas, estado de red y tarjetas. Se mantienen los 47 recorridos de catálogo, geometrías y planos originales, filtros, fuentes, GPS voluntario, incertidumbre/continuidad y demo pública de 49 lecturas sólo en El Durazno. Los mapas locales guardados conservan su almacenamiento y compatibilidad.

La rama actual de producto es `feat/bikeride-stitch-integration`. Código funcional: `cacb996`. No volver a la rama documental antigua como si fuera el estado más reciente. No se cambió GitHub main ni el dominio.

La publicación privada existente se actualizó a **versión 19**, conservando un único propietario y cero visitantes externos:

- [Abrir bikeride](https://mapas-gps-revision-durazno.rodracruz.chatgpt.site)
- [Comparación visual privada](https://mapas-gps-revision-durazno.rodracruz.chatgpt.site/comparacion.html)

Ambos parques y la comparación se verificaron por HTTP200 y hash idéntico a los archivos probados. La fotografía privada del usuario está preservada en esa construcción; no está en Git. La construcción anterior del worktree se conserva: para reconstruir usar los scripts actuales y el adjunto fotográfico privado, sin confundir la copia anterior de dist con esta publicación.

## Pruebas y pendientes

Pasaron 130 pruebas unitarias, nueve comprobaciones nuevas de interfaz, nueve del flujo móvil existente, filtros de ambos paquetes autónomos, GPS simulado/continuidad/precisión/caducidad/permiso rechazado, cinco tamaños con 49 lecturas públicas, seguimiento en ambos parques, giro/recentrado y conservación de Blob/calibración/trazados con service worker activo. Una revisión independiente comprobó 320px, títulos, cambio de parque y preservación de motores. La falta de licencias tipográficas en la salida autónoma se reprodujo con prueba fallida y se corrigió. No se validó GPS en terreno ni restauración bfcache real en un dispositivo físico.

Encuentros y Perfil figuran deshabilitados como «Próximamente». Offline completo, Beacon, garaje, estadísticas personales, eventos, capas satélite/3D, altimetría/obstáculos y destinos/loops siguen pendientes. No tienen servicios conectados ni datos personales inventados. No atribuirles implementación por lo que afirme el documento generado de Stitch.

Evidencia y capturas: [bikeride-stitch](../../evidence/bikeride-stitch/README.md). Plan y límites: [diseño](../../superpowers/specs/2026-10-25-bikeride-design.md). Se conserva el historial del bloqueo en [RECUPERACION-2026-10-26.md](RECUPERACION-2026-10-26.md), como antecedente resuelto.
