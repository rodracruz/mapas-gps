# Five cycling views implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement task by task. Steps use checkbox syntax.

**Goal:** Integrate the five supplied cycling views with real maps, GPS and local data.
**Architecture:** Existing JavaScript/Leaflet controllers remain authoritative; rider modules own local records and UI. Both autonomous builders bundle the same modules. Owner coordinates visual QA and private deployment.
**Tech Stack:** ES modules, IndexedDB, Leaflet1.9, local Sora/Inter, node:test and Playwright.
**Spec:** docs/superpowers/specs/2026-10-26-cycling-tabs-design.md

## Global Constraints

- Brand bikeride,47 catalog cards, original maps/photos/geometries and user storage preserved.
- Same feature branch/worktree; no GitHub main/force push, no new audience, accounts, billing, shared bookings or location transmission.
- Use exact supplied HTML/PNG hierarchy and visual components. Real data/empty states replace sample identities/metrics; no prototype runtime imported.
- Record only by explicit action; demo never persists; GPX does not imply offline base maps. No guessed geographical links, altimetry or POIs.
- Do not overwrite current private dist while testing; new database only. Errors cannot claim data was saved.

## Review Focus

- Repeated view/history/park switching: preserve route identity and stop GPS/recording correctly.
- Storage unavailable/full or concurrent updates: prior state survives and UI reports failure.
- Bad fixes, pause, time gaps, demo: no phantom distance or personal activity.
- Narrow/short/landscape phones: no panel hides fix, precision, attribution or navigation.
- Partial geography/missing source fields: correct empty states and segment exports, no copied demo routes.

### Task 1: Local state, recording and file exports

**Files:** create rider/store.mjs, rider/recording.mjs, rider/exports.mjs; tests/rider-state.test.mjs, tests/rider-recording.test.mjs, tests/rider-exports.test.mjs and tests/rider-store-browser.mjs.
**Interfaces:** implement exact schema/functions in spec. No UI/controller/build modifications.
- [x] Write failing unit tests for validation/defaults, XML/ICS escaping/segments, recorder pause/gaps/jitter/stale/jumps; run red.
- [x] Implement pure functions and atomic IndexedDB read/update. Store concurrency stays in one readwrite transaction; no async mutator.
- [x] Browser test actual IndexedDB across reload and simultaneous updates, invalid mutation rollback and separate legacy map store preservation.
- [x] Run scoped tests; full npm test in an isolated copy, not the product dist. Commit only owned files and report evidence.
- [x] Task-scoped independent spec+quality review and corrections.

### Task 2: Five faithful cycling views and controller integration

**Files:** create rider/views.mjs, rider/views.css (split UI helpers into focused rider/*.mjs as useful); modify geographic/bikeride.mjs, viewer.mjs, park-viewer.mjs, gps.mjs, gps-viewport.mjs only where necessary, both HTML entries and both autonomous builders. Tests/rider-views-browser.mjs and relevant existing browser tests/helpers.
**Interfaces:** consume Task1 exports. `setupCyclingViews`/actions/GPS snapshot+subscribe contract is in spec. Reuse one live Leaflet instance and real source previews.
- [x] Write failing browser tests for navigation to five views,47 cards across parks, local CRUD/favorites/downloads, honest missing-data sections and voluntary recording. Run red.
- [x] Inspect all five original PNGs and HTML. Implement reference structure/styles/components and real data binding, route/park hash preservation and repeated back/close.
- [x] Enable real Profile/Encuentros and dedicated Rutas/Detalle views. Local forms persist; actual GPX/ICS downloads and session history work, empty states are explicit.
- [x] Integrate in-route HUD with existing GPS subscription; add explicit recording/pause/resume/end and checkpoint recovery, source uncertainty and demo guards. New panels participate in visible map calculation.
- [x] Bundle modules/styles in both private/public builds; preserve legacy storage/photo and local fonts/OFL.
- [x] Run new browser flow plus affected existing tests, including actual stored Blob/calibration before/after. Capture mobile and landscape for every view.
- [x] Commit owned changes, report remaining external/data blockers; independent scoped spec+quality review and fixes.

### Task 3: Whole-branch visual verification and release

**Files:** docs/evidence/cycling-tabs/* and handoff state; existing private Site dist/archive, no new hosting project.
**Interfaces:** reviewed Task1/2 source and private original photograph; current owner-only Site.
- [x] Compare each supplied screenshot and current page at equivalent CSS viewport/scale. Inspect pixels; no completion based on tests alone. Fix with Task2 implementer if needed.
- [x] Run full unit suite once source is final; relevant mobile/GPS/preservation/autonomous tests. Verify original photo and source geometry hashes.
- [x] Independent whole-branch review on the most capable model; resolve Important findings.
- [x] Push feature branch; package exact tested private build, sync existing Site source, native private deployment without audience changes.
- [x] Verify returned deployment and actual app paths/hashes; publish screenshots/evidence safe for public Git, retain design originals privately. Record accurate completed/pending list.
