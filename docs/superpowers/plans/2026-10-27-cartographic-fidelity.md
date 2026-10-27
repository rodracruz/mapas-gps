# Fidelidad cartográfica: plan de corrección

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Corregir pérdidas comprobadas entre el arte oficial y el visor, sin atribuir precisión geográfica al dibujo.

**Architecture:** Mantener los datasets y las curvas originales. Añadir las conexiones gráficas omitidas de El Durazno como arte documental separado, sin nodos ni aristas navegables. Mantener las fuentes geográficas OSM independientes; activar GPS no reemplaza el plano elegido.

**Tech Stack:** JavaScript/SVG/Leaflet, Python/PyMuPDF, Node test y Playwright.

**Spec:** Petición vigente del usuario: reflejar el documento oficial en el mapa georreferenciado; conservar v22, main, datos y acceso privado. Antecedentes de fidelidad y separación dibujo/geografía en `docs/evidence/cartel-registration.md` y `docs/evidence/parquemet-official-document.md`.

## Global Constraints

- Misma rama/worktree `feat/bikeride-stitch-integration`; main intacto.
- Sin uniones inventadas, deformación individual de senderos ni coordenadas creadas por intuición.
- `acceptedTransform: null`, navegación y distancias de terreno deshabilitadas para el arte aproximado.
- Los originales y datos del usuario permanecen intactos; sin foto privada en Git público.
- No sustituir la publicación activa antes de tener comparación visual y revisión.

## Review Focus

- Las conexiones gráficas no deben entrar en GPS, GPX ni topología por proximidad/cruces.
- La representación de rellenos, trazos y guiones debe corresponder al PDF en el mismo marco de píxeles.
- GPS debe respetar la fuente elegida y conservar consulta, grabación voluntaria y parada.
- Un recurso nuevo corrupto debe fallar sin afectar los senderos documentados ni OSM independiente.
- Parquemet no tiene transformación geográfica justificada: no convertir su panorámica esquemática en geografía inventada.

## Task 1: Reproducción y recuperación documental

- [x] Inspeccionar imágenes nativas y revisar datos/código vigentes de ambos parques.
- [x] Auditar por separado los objetos del PDF y la fuente de la geometría geográfica.
- [x] Escribir y observar fallar comprobaciones de las conexiones omitidas y estilos fuente.
- [x] Añadir extractor/datos de conexiones originales con IDs, hash, píxeles y sin conexiones navegables.
- [x] Verificar reproducibilidad y preservación íntegra de los datasets previos.

## Task 2: Corregir representación y sustitución de fuente

- [x] Reproducir en navegador la pérdida de ramales/guiones y el cambio de fuente al activar GPS.
- [x] Dibujar conexiones bajo senderos, rótulos y puntos, en el mismo SVG y transformación.
- [x] Conservar estilos originales en la revisión del plano, sin inflar contornos rellenos.
- [x] Mantener la fuente elegida al activar GPS real; OSM sigue disponible explícitamente y la demo sigue identificada como tal.
- [x] Verificar fuentes y ambos paquetes autónomos sin modificar dist privada histórica.

## Task 3: Evidencia, regresiones y revisión

- [x] Crear comparación original/antes/después a igual marco, detalles de ramales/cruces y mapa geográfico.
- [x] Ejecutar suite del proyecto y pruebas de navegador afectadas, móvil, GPS y almacenamiento.
- [x] Revisión independiente acotada al cambio; resolver fallos materiales y documentar límites/pendientes.
- [x] Entregar código, datos editables, capturas y forma comprobada de abrir resultado; publicar sólo tras evidencia/revisión y dentro de permisos vigentes.

## Resultado y límite de cierre

Corrección documental implementada y revisada. Georreferenciación completa **no resuelta**: sin controles aceptados ni transformación para Parquemet; no se cambia publicación activa22. La prueba de rótulos móviles anterior falla en baseline/candidato y queda abierta. Ver docs/evidence/cartographic-fidelity/README.md. Los checks anteriores acreditan trabajo/evidencia entregados, no equivalencia de terreno.
