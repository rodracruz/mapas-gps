# Final fix wave — DONE

Commit: `d13ba419dfa18a04d57386baf364f33246e1cd1e` on the existing `feat/bikeride-stitch-integration` worktree. Base: `affb4b2f790cf7370f0fec50be3aa6e1b0dbd858`. One local fix commit; no push/deploy/main/Site change. Worktree clean after commit. Root/worktree private dist was never built into or overwritten. All commands below ran in `/tmp/bikeride-final-fix`; its source and public test bundles are served by the disposable server on `http://127.0.0.1:4198` (exec session55759, still available for review).

| Finding | Result | Implementation/evidence |
|---|---|---|
| F1 — cross-tab recovery, deletion resurrection | Fixed | Native origin-wide exclusive Web Lock `bikeride-local-v1:recording`; owned recording/paused lease; guarded creation/update/delete; commit-before-release; honest unsupported/lost-ownership behavior. Real Chromium pages, native locks and real IndexedDB cover both park entries, simultaneous starts, queued writes, confirmed abandoned trace and API failures. |
| F2 — matcher-rejected fresh jump saved | Fixed | Consume rejected raw timestamp, break continuity, never ingest rejected result. Real session+matcher tests include fresh teleport, retained raw followed by matcher snapshot ticks, independent next segment, GPX exclusion, outside-network and ambiguous accepted raw, pause time, demo exclusion. Matcher/source geometry unchanged. |
| F3 — service source | Fixed | Each service links to its `sourceUrl`, with explicit official-map/site wording from catalog evidence and an honest park-source fallback. Both catalogs and defensive fallback checked; no POIs/availability invented. |

## Ownership and transaction ordering

- Startup opens the same v1 database, then attempts the global lock with `ifAvailable:true`. A live owner (including paused, in either park) causes startup to read history without recovery. No heartbeat/TTL is used.
- Startup recovery and explicit start use the same lock. Explicit start waits for startup to finish, acquires the lock, recovers abandoned active rows in a committed IndexedDB transaction, and only then starts native GPS/creates a new recording. This also handles an already-open survivor after an owner disappears. Recovery never starts GPS.
- Creation is explicit (`create:true`) and only once per current lease. Subsequent saves capture that lease when queued and recheck it inside the transaction. They require its matching ID and an existing recording/paused row. Missing/deleted or terminal rows cannot be recreated/overwritten. A failed write invalidates that lease's further writes.
- Pause retains ownership. Finish/leave stops generating recorder snapshots, queues its terminal save behind existing checkpoints, waits for commit/abort, then releases and awaits native lock release. New local starts remain disabled while starting/closing. Disposal also waits for the terminal save before closing its store.
- Deletion rechecks active status within its read/write transaction; disabled/stale UI is not relied upon. No schema extension or legacy-store change.
- Loss of a native lock stops the in-memory recorder, cancels pending checkpoints and displays the loss. Missing or rejected Web Locks support leaves stored state intact and visible, refuses recording/recovery, and still permits GPS consultation and other local features. API rejection no longer hides existing history.
- Document destruction can discard unconfirmed JS work. Recovery keeps confirmed segments and the prior duration; normal terminal saves serialize ahead of recovery, while a killed document's transactions either commit before subsequent transactions or abort. No promise of uncommitted crash durability was added.

## RED evidence

Archived under `final-fix-evidence/` alongside this report:

| Command (isolated copy, original product code) | Actual result/log |
|---|---|
| `node tests/rider-ownership-browser.mjs` | RED: expected recording, got interrupted immediately after second-tab boot. `bikeride-final-f1-red.log`. |
| `node --test tests/rider-session.test.mjs` | RED:1 failed/1 passed; actual trace included rejected `-70.488` in its own segment. `bikeride-final-f2-red.log`. |
| `node tests/rider-service-browser.mjs` | RED: missing service evidence anchor, locator timeout. `bikeride-final-f3-red.log`. |

Additional intermediate failures were resolved: native-API rejection initially preserved the DB but hid its history (`bikeride-final-f1-api-history-red.log`, assertion0 vs1); fixed by reading existing state after coordination failure. Geographic bundling initially retained the new exported constants, causing startup timeout (`bikeride-final-bundle-red.log`); builder now strips `export const`, and both builders include the module/bindings. The added ambiguous-session fixture initially lacked required network metadata/numeric node IDs; fixture corrected without changing matcher/source data. F3 fallback initially tried deleting a required catalog sourceUrl and was rejected by the existing validator, then its isolated view fixture lacked navigation buttons; fixture corrected. Final F3 log below is exit0. These were intermediate failures, not omitted final failures.

## Final GREEN commands and outputs

All exit0. No full baseline suite rerun: root owns the final exact-code155-test expectation (previous152 +3 session tests), private build and scoped independent review.

| Exact command | Output/log in `final-fix-evidence/` |
|---|---|
| `node --test tests/rider-session.test.mjs tests/rider-recording.test.mjs tests/rider-state.test.mjs tests/rider-exports.test.mjs` | 24 passed,0 failed. `bikeride-final-unit-green.log`. |
| `RIDER_BASE_URL=http://127.0.0.1:4198 node tests/rider-ownership-browser.mjs` |10 PASS groups: live cross-park owner; paused/delete guard/contender; already-open retry; surviving-tab recovery; destination recovery/no GPS; native lock revocation; simultaneous cross-park starts/one watch; queued checkpoint/finish/release/delete and missing/terminal guards; API absent; API rejected/history visible. `bikeride-final-f1-green.log`. |
| `RIDER_BASE_URL=http://127.0.0.1:4198 node tests/rider-service-browser.mjs` |3 PASS groups, both catalogs and honest fallback. `bikeride-final-f3-green.log`. |
| `RIDER_BASE_URL=http://127.0.0.1:4198 node tests/rider-lifecycle-browser.mjs` |PASS storage abort, CRUD, consultation, duplicate suppression, reload/crash, history export/delete, cross-park hashes. `bikeride-final-lifecycle.log`. |
| `RIDER_BASE_URL=http://127.0.0.1:4198 node tests/rider-views-browser.mjs` |PASS five views,47 cards, local profile/bike/agenda, GPX/ICS, opt-in recording/demo exclusion, responsive captures. `bikeride-final-views.log`. |
| `RIDER_BASE_URL=http://127.0.0.1:4198 RIDER_REVIEW_OUT=test-results/final-review node tests/rider-review-browser.mjs` |44 PASS checks: both parks at320×568/390×844, action/error feedback, date contrast, native accessible descriptions. Failed recording creation now correctly shows a stopped recorder/start action. `bikeride-final-review.log`. |
| `RIDER_BASE_URL=http://127.0.0.1:4198 node tests/rider-store-browser.mjs` |PASS real IndexedDB concurrent updates/rollback and legacy Blob/localStorage preservation. `bikeride-final-store.log`. |
| `GEOGRAPHIC_BASE_URL=http://127.0.0.1:4198 node tests/gps-storage-browser.mjs` |PASS legacy Blob/calibration/trails/webCenter/storage with active SW. `bikeride-final-legacy.log`. |
| `python3 scripts/build-geographic-standalone.py` |Both outputs built, including invoked Parquemet builder. `bikeride-final-build.log`. |
| `RIDER_BUNDLE_URL=http://127.0.0.1:4198/dist node tests/rider-bundle-browser.mjs` |PASS both autonomous bundles, embedded modules/fonts,47 cards, persistence/ICS, recording/pause/finish, no module/CDN requests. `bikeride-final-bundle-green.log`. |
| `git diff --check` and `git diff --cached --check` |Clean before commit. |

Final isolated public test bundle hashes (not private release artifacts): `dist/parquemet.html` SHA256 `5581435ec6f4e4f43a46348e827f61533df16f41362877dfd159dd52106ac04c`; `dist/mapas-gps-parques.html` SHA256 `b8d2dc65b09140e6a7cb21ab072a1ec6f230c65341077ce7f5144d2444f6b08e`.

## Captures inspected

Actually viewed pixels via image tool: `final-fix-evidence/rider-ownership/owner-paused.png`, `contender.png` (Parquemet against live El Durazno owner), `ownership-lost.png` at390×844; `coordination-absent.png` at320×568. They show readable reserved feedback and usable actions without covering action labels. `coordination-rejected.png` is also archived. Viewed `rider-services/el-durazno.png` and `parquemet.png` at390×844: source links/wording, service uncertainty, and original section hierarchy preserved. The complete44-check feedback/accessibility evidence/captures are in `final-fix-evidence/final-review/`.

## Files and limitations

Changed: `rider/ownership.mjs` (new), `rider/session.mjs`, `rider/views.mjs`, `rider/views.css`; both autonomous builders; three new focused test files (`rider-ownership-browser.mjs`, `rider-session.test.mjs`, `rider-service-browser.mjs`); existing `rider-review-browser.mjs` for honest stopped-state expectation; one persistence-contract paragraph in the existing spec. `final-fix-evidence/exact-files.json` hashes all changed product/build/test files and confirms byte equality with the tested isolated copy.

Schema v1, source geometry, catalogs, original maps/photo, legacy database and single map/watch per page are preserved. Native Web Locks is a deliberate recording compatibility requirement; unsupported browsers can consult GPS and use local data but cannot record/recover drafts. Tests use synthetic public coordinates and real native Chromium coordination/IndexedDB, not physical riding, background/locked-phone operation or guaranteed recovery of uncommitted data. No cross-device sync, accounts, backend, new permission prompt, location transmission, audience change or costs. No unresolved F1/F2/F3 concern. Root still owns scoped review, final exact-code full suite/private build and separately authorized release.

## N1 consent follow-up — DONE, supersedes session code in d13ba41

Base `d13ba419dfa18a04d57386baf364f33246e1cd1e`; narrow follow-up commit `5ab5d41778a4d4521b63e096ae0bb122d2e2a4df`. Only `rider/session.mjs` and new `tests/rider-start-consent-browser.mjs` changed. F1/F2/F3 remain as previously approved; no renewed scope. Clean worktree after commit; no root dist, Site, push/deploy/main changes.

The session now tracks the ownership-wait phase and observed GPS mode. A later transition to off/demo during that phase increments the existing cancellation epoch even before a recorder exists. When acquisition resolves, the existing epoch check releases ownership and returns without starting GPS or creating an activity. Mode returning to off does not reinstate the canceled request. Repeated snapshots of the same off mode do not cancel an ordinary start from off. The wait phase ends immediately after acquisition and before the session's own synchronous native start/reset, so that intentional reset remains supported. Navigation cancellation and terminal-save/release ordering retain their existing implementation.

All commands ran in the existing isolated `/tmp/bikeride-final-fix` served at4198. No full baseline suite rerun.

| Stage/command | Actual output and archived log |
|---|---|
| RED: `RIDER_BASE_URL=http://127.0.0.1:4198 node tests/rider-start-consent-browser.mjs` on d13ba41 | Exit1: Stop/demo/demo→off each restarted watch1→2; off→demo→off started watch0→1. Navigation and the two ordinary-start controls passed. `final-fix-evidence/n1/bikeride-n1-red.log`. |
| GREEN: same consent command on amended code | Exit0,7 PASS: Stop; demo; demo→off; off→demo→off; navigation; explicit start from GPS; explicit start from off. `n1/bikeride-n1-consent-green.log`. |
| `node --test tests/rider-session.test.mjs` | Exit0,3 passed/0 failed: actual matcher rejected raw/GPX, retained raw/pause/outside-network/demo, ambiguous raw. `n1/bikeride-n1-session-green.log`. |
| `python3 scripts/build-geographic-standalone.py` | Exit0, rebuilt both isolated autonomous bundles. `n1/bikeride-n1-build.log`. |
| `RIDER_BUNDLE_URL=http://127.0.0.1:4198/dist node tests/rider-bundle-browser.mjs` | Exit0, both bundles pass47 cards, local profile/agenda/ICS, recording/pause/finished persistence and no module/CDN requests. `n1/bikeride-n1-bundles-green.log`. |
| `git diff --check` and `git diff --cached --check` | Clean before commit. |

The consent test uses real native Web Locks and a real IndexedDB read/write transaction kept open by queued reads, waits until the native recording lock is actually held, then clicks the still-reachable GPS/demo/navigation controls. No timeout grants ownership or substitutes for ordering. Every canceled case asserts unchanged watch count and user-selected mode, empty activities, `Sin grabación`, and release of the actual lock. Successful controls verify one watch and one active record, then finish normally. Screenshots and exact before/after watch/clear/mode/activity/lock values are in `n1/red-captures/` and `n1/green-captures/evidence.json`.

Actual GREEN Stop result: `{mode:off,watches:1,clears:1,activities:[],recording:'Sin grabación',locks:[]}`. Demo keeps `{mode:demo,watches:1,clears:1}` with the same empty activity/lock results. Off→demo→off keeps watches0/clears0. Both successful controls end acquisition with modeGPS, watches1 and exactly one recording. Viewed `n1/green-captures/stop.png` and `demo.png` at390×844: stopped GPS remains stopped; demo remains visibly simulated/no recording with disabled recording action. No layout changes.

`n1/exact-files.json` verifies byte equality between committed amended source/test and the tested isolated copy. Isolated public test bundle SHA256: Parquemet `1ebde800102f057baf80072134b93db094dbb939abb1beffa88b167a0e668d6e`; geographic `384d046ae3d1d08432d2c220d8759c249ad678a2fd87925cec4743c5397f68c2`. These are test artifacts; root owns the final private rebuild/re-review/release. No unresolved N1 blocker. Prior native-Web-Locks, physical-device/background and unconfirmed-crash limitations remain unchanged.
