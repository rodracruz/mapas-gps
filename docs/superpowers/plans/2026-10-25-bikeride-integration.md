# bikeride Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Aplicar el diseño comprobado a bikeride conservando los mapas, datos y GPS reales.

**Architecture:** Mantener los controladores Leaflet actuales y añadir una capa de presentación compartida. Usar el catálogo y el directorio existentes; no ejecutar ni importar la lógica ficticia del ZIP. Las construcciones autónomas deben incluir esa capa y fuentes locales.

**Tech Stack:** JavaScript ES modules, CSS, Leaflet, Node tests y Playwright existentes.

**Spec:** `docs/superpowers/specs/2026-10-25-bikeride-design.md`

## Global Constraints

- Marca visible: `bikeride`, en minúsculas;21 fichas de El Durazno y26 de Parquemet.
- Sin coordenadas, mediciones o servicios inventados; no importar la lógica del prototipo.
- Conservar main, mapas guardados, API interna y el original ZIP privado.
- Sin nuevas cuentas, servicios pagados, permisos ni publicación ampliada.

## Review Focus

- Pantalla pequeña/horizontal: controles accesibles y navegación sin tapar GPS.
- Filtros: el mismo mapa permanece visible y conserva nodo y datos.
- Cambio de parque: títulos, rutas y ausencia de demo en Parquemet correctos.
- Sin red/permiso GPS: estado explícito; ninguna ubicación pedida al cargar.
- Servicios ausentes: navegación futura deshabilitada; sin estadísticas simuladas.

### Task 1: Capa visual y navegación real

**Files:** crear `geographic/bikeride.mjs`, `geographic/bikeride.css`, `vendor/fonts/`; modificar ambas entradas HTML y controladores; probar `tests/bikeride-browser.mjs`.

**Interfaces:** `setupBikerideChrome({directory,park,onSwitchPark})` devuelve `{setParkOpen(boolean)}`. Consume los controles existentes `open-map`, `trail-grid` y el directorio; produce selector de parque, estado de red y navegación Mapa/Rutas.

- [x] Escribir prueba móvil que exija selector y navegación real, datos correctos, botones futuros deshabilitados y mapa fijo al filtrar.
- [x] Ejecutarla y comprobar fallo por ausencia de la navegación.
- [x] Implementar módulo/CSS, fuentes locales y conexión con controladores sin cambiar motores.
- [x] Ejecutar prueba móvil y horizontal; comparar capturas con el diseño inspeccionado.

### Task 2: Construcción autónoma

**Files:** modificar `scripts/build-geographic-standalone.py`, `scripts/build-parquemet-standalone.py`, `tests/geographic-build.test.mjs`.

**Interfaces:** incluir `geographic/bikeride.css` y namespace `BikerideChrome.setupBikerideChrome`; fuentes locales embebidas en CSS como data URLs.

- [x] Añadir aserción de construcción para capa visual, módulo y fuentes embebidas; comprobar fallo antes de modificar los constructores.
- [x] Adaptar ambos constructores y comprobar la construcción en copia local aislada.
- [x] Comprobar ambos parques autónomos sin solicitudes de fuentes externas ni código del prototipo.

### Task 3: Regresión y revisión

**Files:** documentación de evidencia e integración; correcciones sólo si pruebas/revisión encuentran problemas.

- [x] Ejecutar suite completa en copia aislada, pruebas GPS/móvil pertinentes y conservación de almacenamiento.
- [x] Revisar comparación visual y una revisión independiente del cambio completo.
- [x] Guardar código y evidencia en la rama de trabajo; documentar funciones implementadas y pendientes.
- [x] Preparar una vista ejecutable dentro del acceso ya autorizado; no cambiar main ni ampliar audiencia.
