# Independent review — mobile labels and geographic control plans

Reviewed the uncommitted changes over `0d1f442ac65c2841ecfe3d67285b6af984375b00` in `/workspace/mapas-gps/.worktrees/parquemet-coverage`. Read-only review; no application code, source geometry, calibration, publication, or browser profiles were changed.

**Status: one medium-priority placement defect remains in the reviewed revision.** The default 390 × 844 overview and safety checks pass, but the coarse placement search can hide a selected callout when a safe position exists.

## Finding

**P2 — Internal free strips can be skipped by the 10-pixel grid.** `geographic/label-layout.mjs:13`–`16` adds viewport boundaries and a fixed grid, but does not add obstacle boundaries. In a fresh 390 × 844 source page, tap the actual `Ver Anfiteatro` callout. The Anfiteatro sheet opens correctly, but the selected Anfiteatro callout becomes hidden. With the map origin at viewport y = 64, the padded banner ends at map y = 123.78125 and the padded GPS panel starts at y = 166. A 65 × 29 callout with the algorithm's extra 2.5-pixel padding fits at y = 131; the grid tries y = 125 and y = 135, both of which collide. Anfiteatro's initial anchor-derived candidate also collides, so the selected label is falsely classified as unplaceable. La S happens to survive because its initial candidate lands at y = 131.

The pure-function reproduction returns `null` while a candidate at `{x:171,y:131,width:65,height:29}` satisfies the algorithm's full gap and bounds rules. This contradicts the intended policy of hiding labels when space physically cannot accommodate them. Include obstacle-edge positions, or an adaptive search that covers narrow internal slots, and add a selected-label/internal-corridor regression. Evidence: [narrow-corridor-finding.json](./narrow-corridor-finding.json) and the selected states in [independent-spotchecks.json](./independent-spotchecks.json).

## Checks that passed

- Ran `node --test tests/label-layout.test.mjs` independently: 2 tests passed, 0 failed. The existing tests do not cover the narrow internal strip above.
- Ran a separate Playwright spot check sequentially against source `4210/parquemet.html` and built standalone `4213/parquemet.html`, using fresh mobile contexts. Both show all 8 cyclist callouts in the default 390 × 844 overview; every visible callout was inside the map, collision-free against all measured production obstacles and other labels, and reachable at its center.
- Tapped the actual Anfiteatro callout text on both pages and verified `#sheet-title` becomes `Anfiteatro`.
- Changed the banner's measured height without changing the map. Callouts reflowed without any camera dataset, marker-anchor transform, or route SVG path change.
- Showed a measured full-viewport notice. Both pages hid all callouts, cleared the unsafe fallback behavior, and restored all 8 cyclist names after removing the obstacle. Camera, marker-anchor transforms, and route paths were unchanged throughout.
- Checked the selected-sheet and short-landscape states for visible-label bounds, obstacle collisions, label collisions, and center reachability. These safety checks passed; they do not imply that every feasible label was retained.
- Instrumented geolocation in the fresh contexts: 0 `getCurrentPosition`/`watchPosition` requests. No page JavaScript errors were observed.
- Inspected before/after screenshots. The default overview now keeps cyclist names outside the banner, GPS panel, HUD, zoom, scale, and attribution areas. The movement is confined to screen callouts.

## Static review

`park-viewer.mjs` still creates every marker anchor from the same midpoint of the longest retained route feature. The new code changes button translation and leader endpoints, without changing the marker's geographic coordinate or the route geometry. Leaders still begin at `item.marker.getLatLng()`. The diff contains no changes to OSM snapshots, source coordinates, PDF paths, affine matrices, or catalog records.

The requestAnimationFrame-coalesced ResizeObserver/MutationObserver path calls only label layout; it does not call fit, pan, source switching, GPS start, or recording. `pointer-events:none` on the empty Leaflet icon and `auto` on the actual button resolves the moved-icon hit-box problem while preserving the tested button-to-marker click propagation. The standalone builder includes the new pure module before its park-viewer binding.

The changed coverage/filter browser tests use the existing visible drawer helper. Reviewed changes preserve assertions and adapt interactions to the current drawer UI.

## Geographic control plans

Inspected the five pending candidates in each retained action plan. Both plans retain source image regions or precise source marks, named physical-object distinctions, existing public coordinate candidates where available, provenance links, and a concrete minimum missing datum. They explicitly accept no new control and propose no transform/publication. The Durazno plan preserves historical A/B references while distinguishing the generic park marker, entrance, statue, viewpoint, and trail endpoints. The Parquemet plan separates shared editorial symbols from distinct OSM junctions, and marks station/access coordinates as missing rather than promoting nearby context nodes.

No owner browser storage, browser history, or unavailable previous conversation was inspected. The plan correctly scopes the absence of an accessible export/link and does not claim personal calibration records do not exist. This was a consistency review of the retained plans and evidence, not an independent field survey or revalidation of every public coordinate.

## Limits and exact reviewed files

This independent review did not repeat the full npm suite or the heavy sequential GPS regressions running in the parent task. The browser checks used headless Chromium, not physical mobile hardware. The built candidate was exercised, not rebuilt by this reviewer. No publication was performed.

Reviewed production SHA-256 values:

```text
fb66912b693e0a955742f84b01b265d3f5d982da0bc7927eefe77568ff479c06  geographic/label-layout.mjs
9b9b4bd0e73b407fa942bf73b68fc0c65d9bc0177f3115553cec0f7cb41cd062  geographic/park-viewer.mjs
22ff9ff460b30e2e358dc5c69a57ede453aff1fb6b5f1a0ab3fc931329fb98aa  geographic/route-filter-ui.mjs
2cf991ff947b37bf047a3330ea44fe266272c3ca79910250d7e2d1ec2a60fcdc  scripts/build-parquemet-standalone.py
```
