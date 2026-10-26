# Task 2: five cycling views, controller and autonomous integration

Status: implemented and verified; ready for coordinator's independent scoped spec/quality review and private release. No subagents, pushes, deployment, main changes or Task 1 model modifications. Source branch remains `feat/bikeride-stitch-integration`, worktree `/workspace/mapas-gps/.worktrees/parquemet-coverage`.

## Commit / scope

Implementation commit: `813018f` — Integrate cycling views with local activity and real GPS. New `rider/views.mjs`, `rider/views.css`, `rider/session.mjs`; controller/GPS wiring; both entry HTMLs and both geographic autonomous builders; new UI/lifecycle/bundle browser tests and affected existing visible-control regressions. The three Task 1 store/recording/export modules remain read-only and unchanged.

## Implementation and actual data boundaries

- **Explorer:** independent view, real 21 El Durazno + 26 Parquemet catalog rows; search, catalog-derived type and difficulty filters, length ordering and explicit one-shot location-based geographic proximity, persistent favorites, featured primary catalog route with an available original route preview, individual technical detail/map actions and actual GPX. Preview source is the existing official SVG or general original image clone; no geographic geometry is inferred from document pixels. New cards use `.rider-route-card`, separate from the legacy `.trail-card` filter selectors.
- **Technical detail:** original crop/reference enlargement through existing viewers, actual catalog description and difficulty, separate OSM and published PDF lengths, source and access notes, persistent favorite, separate OSM ways as actual GPX segments, map/GPS opening with selected target. Explicit altitude, obstacle, patrol, weather and direction gaps retain their designed sections. Table-only avenues visibly say reference in the official table and never claim an individual route in the drawing. General image clones no longer retain the old negative stacking class.
- **Profile:** initial anonymous symbolic identity, optional alias editor in a dialog from the identity card, no seeded person; actual stored activity count/distance/time and explicit unavailable elevation; three local tabs: GPX files, GPS history, garage. Download export/delete/open detail works across parks. Activity view, GPX export and deletion work. Garage create/edit/delete includes user PSI values, fork, notes and service date. No maintenance interval, pressure recommendation, beacon, account or synchronization is invented. The alias form is not permanently inserted into the reference hierarchy.
- **Encounters:** supplied park amenities as documented services, each with source access and explicit unknown exact location/availability; general original park image rather than a fabricated locator map. Personal agenda create/edit/cancel/reactivate/delete and actual ICS export. Timezone/local input is converted into the validated UTC calendar. No shared registrations, capacity, participants, bookings or notifications.
- **Map in route:** reuses the only existing Leaflet instance and the existing native geolocation watch, with header/banner, accessible original tools in a drawer, source uncertainty, raw accuracy/age/probable/ambiguous state, telemetry, opt-in recording controls and persistent footer navigation. Original sources, map filters, route selector, layer settings, original-plan viewer, GPS start/stop/center and public El Durazno demo remain reachable. Short portrait telemetry is compact; landscape HUD sits beside the map. GPS viewport observes the HUD/banner/drawer and attribution, and recalculates on actual panel sizes. The selected Parquemet legacy sheet no longer hides inactive GPS controls.

Unavailable external/data-dependent features remain explicit: trustworthy altitude/obstacle/terrain/patrol/weather/sense-of-travel data, routable network directions/remaining distance, Beacon/SOS, satellite/3D, automatic pause, live services/bookings and collaborative event participation. A GPX is described as a trace file, not an offline basemap.

## Lifecycle and navigation

- API implemented: `setupCyclingViews({directory,catalog,getGeo,getPreview,actions})` → `navigate`, `syncRoute`, `refreshData`, `connectGps`, `dispose`.
- Hashes retain park and optional source, explicit cycling view, selected trail, and `mapa=1` only for map. Legacy bare park/map hashes still work. `syncRoute` is history-free; navigation asks the owning controller to reconcile. Both independent controllers preserve full hashes when redirecting to the proper park entry. Invalid trail IDs produce a deliberate missing-target state.
- Store operations use the Task 1 atomic synchronous mutator and update only changed records. Async refreshes render the currently active view; no stale result resurrects an old view. Real transaction-abort errors keep previous values and leave an error in the form rather than claiming saved data.
- A fresh recorder is created for each explicit activity **after** the GPS start/reset transition. GPS consultation and demo never create an activity. Only genuinely new raw timestamps are ingested; subscription age ticks do not duplicate a fix. Matcher-rejected fix/status signals break recording continuity using a same-time pause/resume (zero added paused duration), without re-ingesting the retained raw point.
- Saves are coalesced to at most one per five seconds during incoming fixes, with immediate pause/finish/leave checkpoints. Leaving the map terminates an interrupted activity before native tracking stops. Pagehide is best effort. Startup preserves drafts as interrupted, computes an end no earlier than confirmed active duration/latest point using reductions rather than a large spread, and never restarts geolocation. The UI explicitly avoids guaranteeing background/locked-screen recording or uncommitted recovery.
- Catalogue GPX includes source note plus `© OpenStreetMap contributors`, ODbL, `https://www.openstreetmap.org/copyright` and original way URLs/IDs. Own activity GPX describes the user's readings without attributing them to OSM.

## TDD and verification evidence

All commands use installed dependencies. Public synthetic fixture data only in fresh Playwright contexts. Test screenshots/logs are ignored artifacts, not repository data.

### New tests and red → green

1. `node tests/rider-views-browser.mjs`
   - RED `/tmp/rider-views-red.log`: expected new-view readiness absent before UI implementation.
   - GREEN final `/tmp/rider-views-final.log`: five direct/repeated views, 47 cards, back/close cycles, local alias and bike reload, personal agenda/ICS, actual GPX download and saved file, favorite state, explicit native recording/pause/resume/finish/interruption, no recording during demo, one map/navigation DOM, no horizontal overflow in four viewport sets, no JavaScript errors.
   - GPS GPX attribution RED `/tmp/rider-gpx-credit-red.log`: downloaded Centenario file lacked credit. Added permanent credit and source URLs; same actual download assertions now GREEN.
2. `node tests/rider-lifecycle-browser.mjs`
   - RED `/tmp/rider-lifecycle-red.log`: crash recovery end preceded its confirmed active duration. Corrected recovered end; GREEN `/tmp/rider-lifecycle-green.log`.
   - Additional RED `/tmp/rider-invalid-fix-red.log`: matcher-rejected raw sample incorrectly left a single recording segment. Corrected consumer continuity break; GREEN includes two one-point segments and no duplicate age-tick point.
   - Covers actual IDB transaction abort/rollback with visible form error, full bike/agenda create/edit/delete, search/favorite removal, GPS consultation versus recording, pause/reload/crash recovery, no GPS restart, activity view/download/delete, cross-controller direct links and table-only avenue semantics.
3. `node tests/rider-bundle-browser.mjs` with isolated HTTP4193 `/dist`
   - RED `/tmp/rider-bundle-red.log`: recording could not start in the bundled script because its independent lexical namespace lacked `RiderStore` bindings.
   - GREEN `/tmp/rider-bundle-green.log`: both autonomous entries, 47 embedded cards, actual profile/agenda persistence + ICS, explicit recording/pause/finalize persisted through real IndexedDB; no `.mjs`, runtime font/CDN/Tailwind request.

### Existing affected behavior

- `tests/gps-layout-browser.mjs`: GREEN `/tmp/rider-gps-layout.log`. 49 public replay positions at 390×844, 844×390, 320×740, 667×375, 320×568; position bounds and frontmost-obstacle checks include new HUD/banner/drawer/attribution; preserved hollow snap ring, reachable 44px GPS controls with selected sheet, paused-demo filters/layers. Actual failures at short portrait/selected landscape drove compact layout and accessible sticky actions; assertions were not lowered.
- `tests/gps-follow-browser.mjs`: GREEN `/tmp/rider-gps-follow.log`. Native browser GPS public-coordinate simulation in both parks, probable acquisition, raw point unobscured with selected sheet, rotation, recenter, coarse fixes, stop, failed background tiles, no foreign park demo.
- `tests/gps-storage-browser.mjs`: GREEN `/tmp/rider-gps-storage.log`. Existing real legacy image Blob upload, calibration points, trails and webCenter survive app → GPS demo → app with active service worker; bytes and localStorage sentinel identical; calibrated image still opens at natural width192.
- `tests/gps-browser.mjs`: GREEN `/tmp/rider-gps-browser.log`. Opt-in watch, demo junction continuity, raw/snap distinction, source guard, stale/lost signal, permission denial, native watch cleanup, unchanged storage for consultation, bundled matcher scope and no writes/location query requests.
- `tests/bikeride-browser.mjs`: GREEN `/tmp/rider-bikeride.log`. Existing park overview/catalog/filter counts and equal cards preserved; formerly disabled tabs now assert enabled real local views; same map node, network state, footer map navigation and both-park switch.
- `tests/bikeride-design-browser.mjs`: GREEN `/tmp/rider-bikeride-design.log`. Existing v21 park hierarchy and original miniatures preserved; source references and real layer-menu access retained. Updated obsolete Rutas-scroll/hidden-footer expectations to actual view navigation, preserving original card assertions after returning.
- `tests/geographic-regressions.mjs`: GREEN `/tmp/rider-regressions.log`, **3/3**, including unobstructed attribution with selected route, landscape fit and executable standalone logo/review links.
- `tests/parquemet-browser.mjs`: GREEN `/tmp/rider-parquemet.log`. Two parks and independent data, original high-resolution image/zoom, equal cards, OSM/PDF lengths, selected route, accessible GPS, landscape and directory return. Initial new assertion exposed the real old CSS rule hiding inactive GPS under selection; fixed in production.
- `tests/parquemet-hardening.mjs`: GREEN `/tmp/rider-hardening.log`, **4/4**: source PDF manipulation, corrupted source fail-closed, explicit GPS/watch cleanup, deep links in source+standalone and directory return. Heading-content assertions read textContent because the unchanged heading lives inside collapsed source details; actual visible map/navigation checks remain.

### Full suite / builds / source preservation

- Final `npm test` in `/tmp/bikeride-task2-suite-yfnx1bel`: **152 tests, 152 pass, 0 fail**, exit0; `/tmp/rider-task2-final-suite.log`. This isolated tree has its own real dist, only dependencies symlinked to the worktree. No full suite/build ran against root private dist.
- `npm run build:geographic` in that same isolated copy invokes **both** autonomous builders successfully. `/tmp/rider-bundle-build.log`.
- Final public isolated output SHA256:
  - `dist/index.html` / `dist/mapas-gps-parques.html`: `b121719b28a3a69be9c6445d6a19d3115d4aeeadd227c194df39f82acda42ee7`
  - `dist/parquemet.html`: `1033bb296fae483c9b6c1c95c1c1bb042609f23016ee1bf199c953197c889d5e`
- Root **private existing dist untouched**, verified SHA256 remains:
  - `index.html` / `mapas-gps-parques.html`: `ac0d7b50271b538939beff5bafac9c1e0567f94917fd4a81b481c0f352d52dbf`
  - `parquemet.html`: `f3c81cbef9354ac345881b01f2bfdb22e46fa41b04bbb882c558f417b66fe143`
- `git diff --check` and JavaScript syntax checks passed. No legacy IndexedDB/localStorage/SW source changes; Task 1 modules unchanged. No original ZIP/HTML/PNG/private photo files added to Git.

## Visual inspection and artifacts

Read all five supplied PNG pixels with view_image and inspected their original HTML/style/layout: route explorer, technical detail, profile/activity, encounters, map in route. Preserved entire component hierarchy rather than merely color tokens; local Sora/Inter fonts inherited from existing asset bundle.

Fresh task screenshots: `test-results/rider/{rutas,detalle,perfil,encuentros,mapa}-{390x844,844x390,320x640,544x780}.png` (20). The browser test captures all five at each viewport; full-page screenshots naturally capture the fixed footer at its viewport position. Inspected actual rendered pixels of map portrait, short portrait and landscape, plus full detail/profile/encounters; corrected original-image negative z-index, footer distribution, subtitle visibility, layer access, HUD sizing and short-phone point occlusion.

Additional GPS screenshots: `test-results/gps/demo-*.png`, `sheet-*.png`, `native-{el-durazno,parquemet}.png`, `no-tiles-{el-durazno,parquemet}.png`. Existing park comparison captures remain `test-results/bikeride*` and `test-results/parquemet` (latest runs in isolated copy where indicated).

Coordinator independently captured both parks × five views at390×844 under `/workspace/artifacts/cycling-tabs/`, reporting no JS errors, no network writes or overflow and a satisfactory component hierarchy. Coordinator owns final independent pixel comparison/evidence assembly and final private build/smoke/publication.

## Remaining concerns / interpretation

- External/source-dependent unavailable features listed above are deliberate visible gaps, not blocked local implementation.
- Simulated browser GPS validates UI/continuity/permission/watch lifecycle; it is not field GPS validation or a promise of background execution. Data not committed before crash can be lost.
- Source overview remains intact; compact phone maps compress telemetry and allow existing sheet/panel scrolling to retain position/attribution/action access. No invented route directions or fitted network distances.
- Independent coordinator spec/quality review and requested corrections remain the next gate. No release action was performed by this worker.

## Fix round 1 — three Important findings

FIX_BASE: `813018f44545b13daa67a8b7556746c8205f2b7c`. Read the complete independent review and applied the receiving-code-review workflow; verified all three triggers against the actual source before editing. Scope is only the three reported issues, four production files and one new focused browser test. No model, controller, service, source-data, deployment, private-dist or main-branch changes.

1. **Save feedback persistently covers recording actions.** The message now occupies normal document flow: immediately before the recording actions inside the measured HUD, and immediately before the agenda creation action in the encounters view. It never floats over controls. The existing HUD ResizeObserver incorporates its reserved height into map visibility. Success text is changed only when its value changes, so periodic checkpoints do not mutate/reannounce an identical success message. Errors use a persistent inline alert; long map errors have a bounded scrollable region above the actions. Normal view rerenders reattach the existing message to its current reserved region.
2. **Personal agenda cards hide the actual date and time.** The heading-accent selector explicitly excludes `.rider-date`. The date/clock keep the intended white foreground on the brown pill, with a measured6.477966:1 contrast ratio. No scheduling data or design hierarchy changed.
3. **GPS accessibility description still promises that no route is saved.** Both actual `<small id="gps-privacy">` elements now say: “OSM carga teselas del área visible. Consultar el GPS no graba tu recorrido; la demo no graba. Sólo «Registrar actividad» guarda lecturas y recorrido localmente en este dispositivo.” Existing aria-describedby relationships remain. The prior implementation report's assertion that this copy had changed was incorrect: its earlier replacement matched `<p>` while these elements are `<small>`. This round verifies the computed accessible description instead of inferring it from visible HUD copy.

### Focused RED → GREEN

Added `tests/rider-review-browser.mjs`. It uses fresh contexts and a synthetic GPS watch, actual local-storage writes and an actual aborted IndexedDB readwrite transaction. It verifies rendered control/label rectangles against the feedback rectangle, viewport visibility, computed date foreground/background contrast and rendered date/time, actual CDP `Accessibility.getFullAXTree` descriptions for the GPS control while off and while recording, and unchanged-success live-text mutation counts across a later real checkpoint. Screenshots cover recording, pause, storage error, populated agenda and agenda feedback. It does not rely on pointer-events or mere text presence.

- RED command: `RIDER_REVIEW_OUT=/tmp/rider-review-red node tests/rider-review-browser.mjs` — exit1, **36 failed assertions across40 checks**, reproducing all three findings in both parks at320×568 and390×844. `/tmp/rider-review-red.log`; measurements/screenshots `/tmp/rider-review-red/`, including `evidence.json`.
- GREEN command: `RIDER_REVIEW_OUT=/tmp/rider-review-green node tests/rider-review-browser.mjs` — exit0, **44/44 focused assertions passed**, plus final PASS summary. `/tmp/rider-review-green.log`; measurements/screenshots `/tmp/rider-review-green/`, including `evidence.json`. Four extra checks confirm zero live-text mutations for unchanged checkpoint success.
- Exact before/after at El Durazno320×568: Pause button overlap **5241.5625px² →0**, Finish overlap **1709.0625px² →0**; both label intersections also become0. Success region changes from fixed y451.20–488 to static y422.61–452, above action buttons y458–498. An actual storage-abort error occupies reserved y391.83–452 and overlaps neither action. Agenda date contrast **1:1 →6.477966:1**; rendered label contains “jue,5 nov,09:30 a.m.” (locale spacing preserved in evidence JSON).
- Inspected real pixels from `/tmp/rider-review-green/el-durazno-320x568-recording.png`, `el-durazno-320x568-storage-error.png` and `el-durazno-390x844-agenda.png`: buttons and labels visible, error visible, populated date/clock legible, success feedback separated from agenda creation.
- An intermediate check found only that “demo tampoco graba” did not match the deliberately explicit “demo no graba” contract assertion; copy was made explicit and the complete focused flow rerun to green. No visibility, contrast or AX assertion was weakened.

### Relevant regression / build checks

- `RIDER_BASE_URL=http://127.0.0.1:4187 node tests/rider-lifecycle-browser.mjs` — exit0, `/tmp/rider-review-lifecycle.log`: PASS storage-abort feedback/rollback, bike and agenda CRUD, search/favorite removal, GPS consultation, duplicate fix suppression, reload/crash recovery, activity view/export/delete and cross-park direct hashes.
- `GEOGRAPHIC_BASE_URL=http://127.0.0.1:4187 node tests/gps-layout-browser.mjs` — exit0, `/tmp/rider-review-layout.log`: PASS49 public positions without overlap at390×844,844×390,320×740,667×375,320×568; hollow ring, reachable GPS controls with route sheet, paused-demo filter expansion.
- Copied only the four changed production files and new browser test into existing isolated `/tmp/bikeride-task2-suite-yfnx1bel`; `npm run build:geographic` — exit0, both autonomous builders; `/tmp/rider-review-build.log`.
- `node tests/rider-bundle-browser.mjs` against isolated HTTP4193/dist — exit0, `/tmp/rider-review-bundle.log`: PASS both standalone bundles, embedded modules/fonts,47 cards, profile/agenda/ICS, recording/pause/finish persistence, no module/CDN requests.
- No unrelated full-suite rerun, per review instruction. `git diff --check` passed. Private root dist checksums remain exactly `ac0d7b50271b538939beff5bafac9c1e0567f94917fd4a81b481c0f352d52dbf` (index/parks) and `f3c81cbef9354ac345881b01f2bfdb22e46fa41b04bbb882c558f417b66fe143` (Parquemet).

Status: all three Important findings corrected and scoped regression checks green; awaiting independent fix-diff re-review. Fix commit is recorded below.

Initial round-1 fix commit: `e519e0584c42b0c0a0a0ffda562dc7a46f7f3f84` — Fix cycling feedback visibility and GPS privacy description.

### Round-1 amendment: human-readable save errors

The coordinator's final feedback arrived immediately after `e519e05` was committed: the reserved error region still exposed the pre-existing raw IndexedDB exception. Within Important1, `failed()` now uses the human message “No se guardó el cambio. Revisa los datos e inténtalo de nuevo. Los datos guardados antes se conservan.” Form errors reuse this same message instead of showing raw validation/storage exception strings. Transaction logic, previous stored values and entered form values remain unchanged. No technical diagnostics are sent or printed.

- Extended the existing focused assertion to require retry/preserved-data wording and reject `objectStore`, `IDBTransaction`, `Failed to execute`, `Invalid rider state` or transaction diagnostics in the visible notice; geometry/viewport assertions remain unchanged.
- RED: `RIDER_REVIEW_OUT=/tmp/rider-review-human-red node tests/rider-review-browser.mjs` — exit1, **4 failed assertions**, one actual transaction-abort error case per park/viewport. `/tmp/rider-review-human-red.log`, screenshots/measurements `/tmp/rider-review-human-red/`.
- GREEN: `RIDER_REVIEW_OUT=/tmp/rider-review-human-green node tests/rider-review-browser.mjs` — exit0, **44/44 focused assertions**, `/tmp/rider-review-human-green.log`, screenshots/measurements `/tmp/rider-review-human-green/`.
- Relevant regression: `RIDER_BASE_URL=http://127.0.0.1:4187 node tests/rider-lifecycle-browser.mjs` — exit0, `/tmp/rider-review-human-lifecycle.log`; real storage rollback, preserved alias and form visibility, CRUD, recorder/recovery and cross-park navigation still pass.
- Inspected `/tmp/rider-review-human-green/el-durazno-320x568-storage-error.png`: clear Spanish error wholly above fully visible Pause/Finish actions, without technical exception details.
- `git diff --check` passed. This supplemental wording-only production amendment does not change bundle interfaces/CSS; prior round-1 layout and both-builder smoke remain the relevant integration evidence. No unrelated full-suite rerun or release action.

Final round-1 result: all three Important findings and the coordinator's error-copy amendment fixed. Re-review range starts at813018f and includes the two round-1 fix commits.

Supplemental round-1 fix commit: `ba0a1c18063d2a9c23eed6e7f26c0af419fc4ea8` — Use clear local-save error messages. Final re-review range: `813018f44545b13daa67a8b7556746c8205f2b7c..ba0a1c18063d2a9c23eed6e7f26c0af419fc4ea8`.

## Task 3 verification amendment — original-map source control

The coordinator's private-photo smoke exposed an existing v21 source-card blocker, independently reproduced in published21 and the candidate. The broad `.park-photo-card>button>span` positioning rule and bikeride's broad `button>span` overlay rule applied to the inline arrow under the static `#open-sign` button. Its positioned span extended outside that button and intercepted the actual high-resolution photo button. Scope here was only that span styling and the owner's already-updated image browser test; the approved Task2 findings were not reopened.

Changed only three selectors across `geographic/style.css` and `geographic/bikeride.css`: overlay styling now targets direct spans of `#open-park-photo`. The adjacent `#open-sign` arrow remains inline/static in its own button. Preserved the existing84×80 thumbnail, high-resolution originals, full source-card layout, all behavior and service boundaries.

Took over `tests/park-image-browser.mjs` without reverting the coordinator's corrections: its previous full-width/native-crop assumptions predated bikeride. Retained the full card≥85% viewport, actual source target≥44px, original natural dimensions and no-overflow assertions. Extended to both parks in source and private autonomous entries at320/390/768, checking the real unobstructed control centre, inline arrow bounds, actual ordinary taps (no force), original map opening and zoom, and actual private960×1280 image opening at every El Durazno private width. Added ignored screenshot/JSON evidence.

- RED, before production changes: `GEOGRAPHIC_BASE_URL=http://127.0.0.1:4198 node tests/park-image-browser.mjs` — exit1, exact assertion `Source control is unobstructed` (false !==true). `/tmp/park-image-span-red.log`. Coordinator's original measured evidence remains `/workspace/artifacts/cycling-tabs/photo-control-diagnostic.json` and paired baseline/candidate PNGs.
- Copied only the two CSS files and image test into the disposable private QA copy `/tmp/bikeride-cycling-private-55b71mlr` (HTTP4198). Ran `python3 scripts/build-geographic-standalone.py --reference-photo /workspace/private-sources/mapas-gps/81184.jpg` there — exit0, both builders, `/tmp/park-image-span-private-build.log`. The private photo was read for this existing authorized isolated build; no original bytes or root dist were modified.
- GREEN in that isolated copy: `GEOGRAPHIC_BASE_URL=http://127.0.0.1:4198 PARK_IMAGE_OUT=/tmp/park-image-span-green node tests/park-image-browser.mjs` — exit0, **12/12 source/park/viewport combinations** passed. `/tmp/park-image-span-green.log`. JSON measurements and12 source-card screenshots: `/tmp/park-image-span-green/verification.json`, `/{private,source}-{el-durazno,parquemet}-{320,390,768}-source-card.png`.
- Actual measurements retain source cards288/350/720px and84×80px controls; El Durazno original2570×3077, Parquemet6690×2835. At320px, the formerly intercepting arrow is now static,9.546875px wide, fully inside its172px-wide parent. Private original remains960×1280.
- Inspected actual pixels of `private-el-durazno-390-source-card.png` and `private-parquemet-320-source-card.png`: same source-card layout and visible photo caption, with the arrow contained to its adjacent text button.
- `git diff --check` passed. Root private dist still has the exact original SHA256 values reported above. No full suite, publication, push, original-photo mutation or unrelated implementation changes. Coordinator owns the final full suite/build/review/release.
- The coordinator's modified `docs/superpowers/plans/2026-10-26-cycling-tabs.md` was left untouched and unstaged. Only two CSS files plus the owned image browser test are committed by this amendment; this report remains ignored.

Task3 verification-amendment commit: `cb045275139383c3ce7b77e0ca9ac6e9ee7f33d8` — Keep source photo overlays inside their own control. Owner plan edits and newly created owner `docs/evidence/cycling-tabs/` remain unstaged by this worker.
