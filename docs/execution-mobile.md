# Ejecución móvil · 18-10-2026

Plan: `docs/superpowers/plans/2026-10-18-mapa-publico-georreferenciado.md`. Base de implementación: `24bc97b`. Rama aislada `feat/mapa-geografico`; `main` intacta.

El usuario autorizó ejecutar y precisó el flujo: entrada → parque → información/servicios + tarjetas iguales de mapa y senderos → detalles desplegables → mapa a pantalla completa con ficha inferior al tocar una pista. Prioridad móvil 95%.

Ruling: ampliar la pantalla de consulta del plan para implementar este flujo autorizado — conservar el mapa único y la aplicación anterior — coste si se interpreta mal: ajustar presentación sin cambiar almacenamiento ni fuentes.

Pre-flight: catálogo → conversión OSM → capas/cartas → constructor comparten IDs y huellas; validar catálogo y fuente antes de dibujar. El mapa base y la navegación de la interfaz se inicializan independientemente del snapshot.

Ruling: incorporar `Subida Buitrera` como tramo identificado por nombre en OSM 477168992, sin equipararlo a todas las subidas del parque — responde al ejemplo de subida del usuario — extensión, dificultad y desnivel quedan pendientes cuando no están acreditados.

Ruling: no mezclar desniveles de Trailforks con líneas OSM; velocidad máxima personal sin datos se muestra «Sin registros» — evita valores ficticios — las dos pistas sin geometría reutilizable siguen pendientes en el mapa.

Baseline: `npm test`: 25/25 antes de cambios. Pruebas móviles nuevas se escriben antes de implementar y deben fallar por ausencia del selector de parques.

La revisión fotográfica y la biblioteca existentes se conservan. El visor privado se actualiza manteniendo su audiencia; GitHub Pages/main requieren aprobación independiente.
