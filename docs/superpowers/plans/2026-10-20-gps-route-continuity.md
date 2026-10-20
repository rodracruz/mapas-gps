# Plan de ejecución

Base bf2c939, rama feat/gps-route-continuity, worktree /workspace/mapas-gps/.worktrees/gps-continuity. Main y las ramas previas no se modifican. Se conserva la vista privada del propietario.

1. Motor puro navigation/matcher.mjs con tests propios, primero RED: proyección sobre aristas OSM, memoria temporal, adquisición por varias lecturas, permanencia frente a paralelas, reevaluación por nodos compartidos, edad/precisión/dirección, pérdida y recuperación. No inferir conexiones por distancia o cruce gráfico. No aceptar coordenadas del cartel. API createRouteMatcher(geo,options) → update(fix,now), snapshot(now), reset().
2. Demo independiente navigation/demo.mjs generada sólo del snapshot público; secuencia Lomo→Calibre si su nodo OSM lo permite, con ruido de señal simulado, etapas y metadatos explícitos. Tests de procedencia, cronología y geografía.
3. Controlador geographic/gps.mjs: geolocalización sólo por acción del usuario, raw/accuracy/snapped separados, fuente OSM al activar, estados honestos, parada/cancelación y error de permisos, limpieza al cerrar y demo sin permisos. Integrar en viewer.mjs, HTML y CSS, sin migración de mapas locales.
4. Pruebas en navegador con geolocalización emulada y demo: activación voluntaria, permanencia, cruce, mala señal/antigüedad, error/stop, no almacenamiento/red de posiciones, formato móvil. Mantener suites anteriores y builder standalone.
5. Revisión independiente de algoritmo y privacidad; ejecutar checks; commit/push a rama nueva y PR borrador apilado sobre feat/all-trails-from-sign. Actualizar la misma copia Sites privada, verificar versión alojada y registrar límites. No main/Pages ni validación GPS de campo simulada.
