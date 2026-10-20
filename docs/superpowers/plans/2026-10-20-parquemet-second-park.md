# Parquemet Second Park Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Tasks include independent delegated source work.

**Goal:** Añadir el mapa oficial de Parquemet como segundo parque ejecutable sin alterar El Durazno.
**Architecture:** Directorio común de parques, entrada específica con controlador genérico basado en catálogo. Documento oficial en plano propio y OSM mundial con fuentes independientes; reutiliza matcher/GPS sin demo de otro parque.
**Tech Stack:** HTML/CSS, módulos ES, Leaflet local, Node test/Playwright Chromium, Python/PyMuPDF para PDF/build.
**Spec:** docs/superpowers/specs/2026-10-20-parquemet-second-park.md

## Global Constraints

- Rama feat/parquemet-second-park sobrefa298ab, worktreeparquemet, no main/Pages ni force-push.
- Original público PDF intacto; nada de georreferenciar el esquema o mezclar ediciones.
- Datos personales/foto privada fuera de Git público; GPS sólo memoria, solicitudes normales de teselas informadas.
- Fichas cerradas176px, móvil95%, no desnivel/velocidad/accesos inventados.

## Review Focus

- Deep links y vuelta al selector en bundle y fuente deben resolver a archivos existentes.
- Catálogo/snapshot corrupto debe fallar explícitamente, sin mostrar datos de otro parque.
- Vista inicial panorámica en teléfono no acredita legibilidad: zoom/pinch y recorte de mapa deben permitir lectura real.
- Red OSM incompleta/nombres distintos deben quedar pendientes, sin copiar geometría de El Durazno ni demo ajena.
- Cambiar/salir de parque con GPS activo debe cancelar watch y no conservar posiciones o fichas.

### Task1: fuentes oficiales y geográficas (delegadas independientes)
**Files:** sources/parquemet-*;data/parquemet/{official-document,geographic-catalog}.json; geographic/document.mjs;tests/{document,parquemet-sources}.test.mjs;docs/evidence/parquemet-*.
**Produces:** catálogo schema1 válido +snapshotOSM/hash; documento {image,pdf,initialView,pixelTransform},setupOfficialDocument({imageUrl,width,height,initialView,pdfUrl})→{open,close,destroy}.
- [x] Inspeccionar PDF1p/dimensiones/leyenda y render original completo, sin interpolar senderos.
- [x] Contrastar OSM por nombre literal y registrar referencias/consulta; dejar ausentes pendientes.
- [x] Probar datos, hashes, límites y relaciones de fuente; verificar módulo documento.

### Task2: directorio y flujo segundo parque
**Files:** data/parks.json;geographic/{parks,park-viewer}.mjs;parquemet.html;geographic/{viewer,gps,catalog}.mjs;geographic/style.css;tests/{park-directory,parquemet-browser}.*.
**Interfaces:** loadParkDirectory()/validateParkDirectory/parkById;renderParkDirectory(container,directory,onChoose); catálogo schema1 anterior;setupGpsTracking agrega demoFactory opcional sin romper valor predeterminado.
- [x] Escribir tests RED de registro2parques, rutas seguras, IDs únicos, selección móvil2parques y ausencia de datos mezclados.
- [x] Implementar directorio/catálogo genérico y controles del nuevo parque; ElDurazno sigue mismo controlador.
- [x] Integrar documento y OSM hash, fichas con fuentes/longitudes separadas, estados pendientes y GPS sin demo ajena.
- [x] Comprobar320/390/844, zoom/pan/pinch/fichas, deep links, permiso/limpieza y fallo explícito de fuente.

### Task3: bundle, revisión y entrega
**Files:** scripts/build-geographic-standalone.py; scripts/build-parquemet-standalone.py;docs/continuar-desarrollo.md;docs/evidence/parquemet-release.md.
- [x] Añadir bundle hermano y directorio embebido; probar origen y standalone sin rutas rotas.
- [x] Ejecutar unitarias y regresiones de ElDurazno/GPS/almacenes, revisión independiente y corregir hallazgos.
- [x] Commit/push rama/PR borrador apilado, actualizar la misma copia privada y ZIP; verificar HTTPS/datos/foto original/ambos parques.
- [x] Guardar capturas y resultados/hashes/limitaciones; conservar worktree para continuación.
