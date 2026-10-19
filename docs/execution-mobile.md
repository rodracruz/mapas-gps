# Ejecución móvil · 18-10-2026

Plan: `docs/superpowers/plans/2026-10-18-mapa-publico-georreferenciado.md`. Base de implementación: `24bc97b`. Rama aislada `feat/mapa-geografico`; `main` intacta.

El usuario autorizó ejecutar y precisó el flujo: entrada → parque → información/servicios + tarjetas iguales de mapa y senderos → detalles desplegables → mapa a pantalla completa con ficha inferior al tocar una pista. Prioridad móvil 95%.

Ruling: ampliar la pantalla de consulta del plan para implementar este flujo autorizado — conservar el mapa único y la aplicación anterior — coste si se interpreta mal: ajustar presentación sin cambiar almacenamiento ni fuentes.

Pre-flight: catálogo → conversión OSM → capas/cartas → constructor comparten IDs y huellas; validar catálogo y fuente antes de dibujar. El mapa base y la navegación de la interfaz se inicializan independientemente del snapshot.

Ruling: incorporar `Subida Buitrera` como tramo identificado por nombre en OSM 477168992, sin equipararlo a todas las subidas del parque — responde al ejemplo de subida del usuario — extensión, dificultad y desnivel quedan pendientes cuando no están acreditados.

Ruling: no mezclar desniveles de Trailforks con líneas OSM; velocidad máxima personal sin datos se muestra «Sin registros» — evita valores ficticios — las dos pistas sin geometría reutilizable siguen pendientes en el mapa.

Baseline: `npm test`: 25/25 antes de cambios. Pruebas móviles nuevas se escriben antes de implementar y deben fallar por ausencia del selector de parques.

La revisión fotográfica y la biblioteca existentes se conservan. El visor privado se actualiza manteniendo su audiencia; GitHub Pages/main requieren aprobación independiente.

Task 1: complete — catálogo con servicios activos del operador, dificultad con fuente, geometrías ausentes explícitas y rechazo de asignaciones sin evidencia. Pruebas rojas iniciales de catálogo → verdes.

Task 2: complete — selección de parque, tarjetas cerradas iguales, acordeones, mapa persistente a pantalla completa y ficha inferior. Prueba roja por selector inexistente → 9 verificaciones verdes.

Task 3: complete — artefacto con bytes exactos de fuente, 9 controles de aceptación y preservación real de Blob/calibración/trails/webCenter/localStorage con SW activo; 12 regresiones visuales previas y HTML fotográfico autónomo pasan. La cobertura geográfica completa de La Virgen/Starwars permanece pendiente, no se marca resuelta.

Final review: subagente independiente `review_mobile_execution`, base24bc97b..53e7340, sin modificaciones. Encontró tres P2: padding de encuadre en horizontal, atribución tapada y enlaces del HTML autónomo.

Final: fixed landscape framing — regresión zoom5 fuera del parque RED → reserva lateral por ancho real de ficha GREEN.

Final: fixed visible attribution — regresión `elementFromPoint` muestra copyright cubierto RED → atribución adicional siempre visible en barra del mapa GREEN.

Final: fixed standalone links — logo abre listado y foto404 RED → logo vuelve al selector en el mismo archivo y constructor genera/enlaza el HTML fotográfico compañero GREEN.

No menores diferidos reportados. No se probó dispositivo físico, Safari ni GPS de terreno. El código de Leaflet conserva sus bytes originales, incluidos CRLF; la comprobación de espacios del código propio excluye `vendor/leaflet`.

Task 4: complete — rama subida, PR2 en borrador y visor privado actualizado manteniendo audiencia. Siete comprobaciones del sitio real: bytes idénticos al artefacto, entrada/parque/tarjetas, fichas, mapa con once teselas, revisión fotográfica completa y cero errores. Solicitud anónima401. Detalles en `docs/evidence/mobile-private-release.md`.
