# Parquemet avenues implementation plan

> **For agentic workers:** Use superpowers:executing-plans; bounded PDF/OSM research is delegated to existing source agents.

**Goal:** Make the park avenues visible, selectable and documented alongside the bicycle and shared paths.

**Architecture:** Keep the original PDF/JPG and all historical receipts. Review image-coordinate crops separately from geographic OSM ways. Add category filters to the existing mobile flow; never derive geographic geometry from the schematic road polygon.

**Tech Stack:** Vanilla modules, Leaflet, native SVG, Python/PyMuPDF, node:test and Playwright.

**Spec:** User feedback «Faltan las avenidas», following the existing official-background route cards.

## Global constraints

- Branch `fix/parquemet-avenues`; no main merge, force push or Pages publication.
- Preserve existing route IDs, source curves, saved maps and private photograph.
- No inferred road centerlines, junctions, access rights, speed or elevation.
- Retain private audience when updating the existing Sites preview.

## Review focus

- New reference roads without bicycle permission must not enter GPS matching.
- An original-map crop must not claim a separately extracted avenue curve.
- Table-only avenue mentions must not look like located route thumbnails.
- Category filters must preserve manual visibility and selected-route consistency.
- Long names, bottom sheets and controls must work at 320/390 px without overlap.

## Tasks

- [x] Source receipts: document the white compound PDF road polygon; extract reproducible reviewed crops; obtain a single atomic OSM union, preserve all old objects, bind only verified names/IDs.
- [x] Tests first: reject malformed crops; protect all old objects/curves; gate avenue GPS on explicit permission/infrastructure; browser checks for category filtering, named selection, original crops and mobile layout.
- [x] Implementation: `trail-preview.mjs` crop/reference models; `document-cycling.mjs` honest avenue document views; `park-viewer.mjs` category filters, visible blue avenue strokes and names; `network.mjs` access gate; registry and standalone embedding with hashes.
- [x] Validation: focused tests, full unit suite, original extraction replay, source and private-bundle mobile QA, legacy storage and El Durazno regression checks.
- [x] Delivery: screenshots, repository continuation/evidence docs, branch/draft PR, same owner-private Site and downloadable private bundle. Verify deployed bytes/interactions and preserve main.
