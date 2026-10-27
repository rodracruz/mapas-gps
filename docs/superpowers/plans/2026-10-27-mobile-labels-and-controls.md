# Rótulos móviles y controles geográficos accionables

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans.

**Goal:** Cerrar la regresión de rótulos Parquemet y precisar qué evidencia remota falta, reutilizando aportes históricos.

**Architecture:** Reservar los controles realmente visibles para los rótulos y el encuadre; mantener coordenadas/paths/red sin cambios. Reubicar sólo textos/llamadas, ocultando un rótulo si físicamente no cabe sin tapar controles. Revisar fuentes históricas antes de solicitar datos.

**Tech Stack:** Leaflet/SVG/JavaScript, Playwright, Node test, fuentes PDF/OSM retenidas.

**Spec:** Petición vigente del27-10-2026: corregir rótulos móviles con revisión y suite completa; entregar3–5 hitos por parque con el dato mínimo faltante y revisar Google Maps/carteles/calibraciones ya aportados. No publicar todavía.

## Global Constraints

- Misma rama/worktree, main y publicación activa intactos.
- No cambiar geometría ni aceptar controles por coincidir con coordenadas antiguas.
- No publicar calibraciones/ubicaciones privadas ni inspeccionar sesiones ajenas.
- Conservar navegación/GPS y los47 registros del catálogo.

## Review Focus

- Rótulos frente a banner/HUD/GPS/ficha/capas/atribución, también al girar o cambiar panel.
- Llamadas gráficas apuntan al mismo lugar geográfico aunque cambie el texto de sitio.
- Nunca volver al fallback que pone un rótulo sobre controles por falta de espacio.
- Datos históricos: separar ejemplo del código, fuente aportada y calibración guardada realmente disponible.
- Los puntos propuestos son referencias concretas pendientes, no precisión geográfica declarada.

## Task1: Reproducción y corrección móvil

- [x] Añadir prueba de rótulos visibles/interactuables, sin colisiones, a390×844 y otros tamaños/estados.
- [x] Observar fallo del candidato0d1f442 y conservar captura/medidas.
- [x] Corregir reserva de espacio, búsqueda de ubicación y actualización tras cambios reales de controles.
- [x] Repetir suite previa de cobertura y regresiones de GPS/filtros; ejecutar `npm test` completa.

## Task2: Plan mínimo de controles por parque

- [x] Revisar referencias históricas accesibles, sin dar por revisado el navegador/localStorage del usuario.
- [x] Identificar3–5 hitos concretos por parque con región/píxel, coordenada candidata y fuente, identidad pendiente y mínimo dato que permitiría avanzar remotamente.
- [x] Documentar lo que ya sirve y lo que no requiere volver a aportar.

## Task3: Revisión y entrega sin publicar

- [x] Revisar visualmente antes/después y obtener revisión independiente.
- [x] Construir/probar ambos paquetes y preservar datos originales; subir código sólo a la rama autorizada.
- [x] Entregar evidencia y pendientes accionables. No actualizar el sitio activo.

Resultado:160/160 unitarias y12 suites de navegador finales pasan. P2 de revisión reproducido/corregido y verificado. Diez referencias concretas con histórico y búsquedas oficiales documentadas;0 controles nuevos aceptados. Sin publicación ni cambios a main.
