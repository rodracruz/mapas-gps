# Five cycling views — independent final integration review

Reviewed `5fbf13b9b5104926ef6ec607559823dca7604909..affb4b2f790cf7370f0fec50be3aa6e1b0dbd858`, with final production code at `cb045275139383c3ce7b77e0ca9ac6e9ee7f33d8`. Scope is the approved continuation on the existing feature branch, not the historical geographic rebuild before the supplied base and not a merge to main.

Requirements: `docs/superpowers/specs/2026-10-26-cycling-tabs-design.md` and `docs/superpowers/plans/2026-10-26-cycling-tabs.md`. Reviewed the supplied final package, bounded source sections, archived review/fix reports, verification metadata, test implementations and final logs. Targeted unchanged-code inspection was limited to the GPS matcher's rejected-result contract, catalog amenity provenance, route-filter data contract and existing legacy-storage preservation assertions.

## Findings

### Important F1 — Opening another tab misclassifies a live recording and enables deletion that later checkpoints undo

**Locations:** `rider/views.mjs:43` (unconditional startup recovery), `rider/views.mjs:51` (checkpoint upsert), `rider/views.mjs:130` (history status and deletion), `rider/session.mjs:5` (checkpoint production).

**Trigger:** Start recording in tab A. Open the same origin in tab B at Profile. Every UI initialization changes every persisted recording/paused activity to interrupted, without establishing whether its owner is still alive. Tab B now presents the live activity as interrupted and enables Delete. Delete it in B, then pause A or wait for its next checkpoint.

**Consequence:** A remains actively recording, while B says its activity ended. The explicit successful deletion is then undone: A's save consumer inserts the activity again because its ID is absent. The same upsert carries the recorder's complete segments, so an activity containing location readings can return after the UI represented it as ended and deleted. Atomic individual transactions do not prevent this lifecycle error. A paused owner has the same recovery/deletion problem.

**Independent focused reproduction:** Existing source server `http://127.0.0.1:4187`, Chromium, one new disposable browser context with two pages and a stubbed native GPS watch. Used real buttons and real IndexedDB; no user storage, coordinates or source files were modified. Opened A at `mapa-geografico.html#parque=el-durazno&vista=mapa`, selected Registrar actividad; opened B at the same entry with `vista=perfil`, selected Historial GPS and Eliminar; then selected Pausar in A. Observed:

```text
before second tab:         [{id: same activity ID, status: recording}]
after second tab boot:    [{id: same activity ID, status: interrupted}]
A's simultaneous HUD:     Grabando · Auto-pausa no disponible
after explicit B delete:  []
after A checkpoint:       [{id: same activity ID, status: paused}]
```

This check intentionally used an empty trace; the resurrection of stored coordinates follows directly from the unmodified whole-activity upsert at line 51. The browser context was closed after the check.

**Required invariants, without prescribing a mechanism:**

- Recovery must distinguish an abandoned draft from another live owner, including a paused owner. Opening a page must not finalize someone else's active session.
- Recovery, checkpoint, finish and deletion must have coherent ordering across tabs. A stale checkpoint must not resurrect an activity whose deletion was committed, overwrite a terminal state owned elsewhere, or silently regain write authority.
- Only an authorized live session may continue writing its recording. If ownership is lost, fail/stop honestly rather than claiming that recording is still being saved.
- Genuine reload/crash recovery must retain confirmed segments, mark abandoned records interrupted, and never restart GPS. Closing an owner and opening the destination page must not lose a final queued checkpoint through a recovery race.
- Browsers lacking the selected coordination capability need explicit supported behavior. Do not silently use an unsafe multi-tab fallback, modify legacy storage, or discard existing data to obtain exclusivity.

Add a focused regression using two real same-origin pages that covers live and paused owners, deletion versus queued checkpoint ordering, genuine abandoned recovery, and unavailable coordination support. Preserve the approved data schema unless the executor explicitly resolves a compatible extension.

### Important F2 — The session ingests a jump that the matcher already rejected

**Locations:** `rider/session.mjs:21`–27 (rejection handling followed by unconditional new-raw ingestion), `rider/recording.mjs:30` and `rider/recording.mjs:43` (continuity reset and geometric-speed check). Named unchanged producer: `navigation/matcher.mjs:131`–138 returns the new raw reading with `reason: 'teleport-reacquiring'`.

**Trigger:** During explicit recording, a new otherwise well-formed reading moves an impossible distance. The matcher publishes `teleport-reacquiring` with that new raw coordinate. Session handling pauses and immediately resumes the recorder to break continuity, which clears its previous point. The following ingestion branch still ingests the rejected raw reading; the recorder can no longer compare its speed with the preceding accepted point. With a same-millisecond callback clock, this succeeds.

**Consequence:** A rejected GPS jump is retained as an accepted point in a new activity segment and subsequently exported by the ordinary activity GPX path. Distance is not bridged in this reproduction; that limits the metric impact but does not make the saved trace correct. The pure recorder rejects such jumps when its continuity guard is intact, so its passing tests do not cover this composition failure.

**Independent focused reproduction:** Ran the real `createRouteMatcher`, `fromOsmSnapshot` and `createRiderSession` in a disposable Node process, with the existing El Durazno source geometry, no-op async save, stub window listeners and a deterministic `Date.now`. Connected a GPS subscription and explicitly started the session. Fed accuracy 5 m points at latitude −33.305, longitude −70.498 and then −70.488 exactly one second later (approximately 929 m/s). Result:

```text
matcher reasons: acquiring, teleport-reacquiring
session segments: [[first accepted point], [rejected jump point]]
distanceM: 0
```

The process disposed the session and restored its clock. This test did not alter any data source, browser state, implementation or stored user activity.

**Required behavior:** Break recording continuity on rejection without then ingesting that rejected result. Distinguish retained previous raw data from a new rejected raw reading, and avoid admitting either through another subscription tick. The next valid new reading may begin a new segment; it must not bridge the rejected interval. Preserve real pause timing, demo exclusion and legitimate outside-network recordings. Add a session-plus-matcher regression, including both retained-raw rejection and fresh-raw teleport rejection. A blanket rejection of all non-probable matcher states would incorrectly exclude valid raw GPS activity.

### Minor F3 — Service cards replace the recorded source with a blanket map attribution

**Location:** `rider/views.mjs:144`.

**Trigger:** Open Encuentros → Servicios in El Durazno. Every amenity card says “Figura en el plano oficial” and “Fuente: plano del parque”; Ver fuente opens the plan. The actual catalog amenities contain `sourceUrl: https://www.outlife.cl/parques/rkf-el-durazno/` (`data/el-durazno/geographic-catalog.json:539` onward), recording the operator page as their evidence.

**Consequence:** Users following the new source control are sent to a different artifact from the supplied evidence, and the page overstates what the map itself establishes. The services themselves are documented and the UI correctly withholds exact location, hours and availability; therefore this is a Minor provenance issue, not an invented-service finding.

**Remedy:** Bind each service's source wording and source action to its actual catalog provenance, with an honest park-source fallback. Keep map enlargement distinct if retained. No external lookup or invented source is necessary.

## Specific strengths

- The five-view integration retains the single Leaflet map and sole native watch per page. GPS subscription/snapshot is a small addition, with the existing controller still owning location and map behavior. Both standalone builders bundle the same rider modules with explicit lexical bindings and local fonts.
- The new database is isolated from `mapas-gps-v1`; update mutators run synchronously inside one read/write transaction and resolve only after commit. Validation returns detached data, rejects malformed inputs and avoids truncating saved activity. Existing map Blob/calibration/localStorage/SW consumers are unchanged.
- Both controllers preserve the full cross-park hash; syncRoute does not write history. New view/card selectors avoid hijacking the 47 existing catalog cards. Preview types preserve the distinction between individual routes, table references and general source maps.
- Geographic GPX exports preserve independent original segments and OSM attribution. Personal activity exports do not misattribute GPS readings to OSM. ICS uses stable IDs, escaping, UTC conversion and UTF-8 line folding, with no invitations or shared registrations.
- The UI has real empty states and local CRUD. Altimetry, operational terrain, weather, patrol, offline basemaps and live safety services are not fabricated. Recording is explicit, demo recording is disabled, native consultation creates no activity, and normal single-tab pause/finish/exit/recovery boundaries have meaningful coverage.
- The earlier feedback, date contrast and accessible privacy fixes are present in final source. Reserved feedback space, readable agenda date pills and computed accessible GPS descriptions have 44 archived focused checks. The source-photo fix narrows three selectors without redesigning the existing thumbnail; its 12 real-tap/zoom cases cover both parks, source/private bundles and widths 320/390/768, without forced clicks.
- The final suite log records 152 passed, zero failed, and the private bundle log records both outputs passing. The evidence explicitly binds final code and private output hashes, leaves deployment pending, and does not claim field GPS or pixel-perfect reference equivalence.

## Visual and evidence assessment

Independently viewed all five approved original PNGs and the five corresponding final El Durazno default captures, plus the populated agenda and short recording captures. The original search/chips/feature/list hierarchy, detail hero/metrics/altimetry/obstacles/patrol arrangement, profile/safety/stats/tabs arrangement, encounters/services/agenda arrangement and map/banner/telemetry/navigation composition are recognizable. Data-dependent changes use source previews, truthful empty states and functional controls. The short recording image shows the repaired visible Pause/Finish actions; the populated agenda shows a legible actual date and separated feedback.

The owner already inspected both parks' ten default captures and populated/error states, with archived measurements. This review does not independently certify every pixel or repeat all viewport runs. The ZIP's original CSS viewport/DPR is unknown; normalizing visual width is a reasonable composition comparison, not proof of pixel identity.

Read the final unit log, private bundle log, photo log, focused regression log, `verification.json`, release placeholder and archived review reports. Those are inspected execution evidence, not claims that this reviewer reran the suites. Test changes follow real reachable controls and include HUD/banner/drawer/attribution in occlusion checks; the photo test replaces a pre-bikeride full-width assumption with the measured already-published source-card layout. The new two-tab lifecycle and fresh-raw rejection compositions were missing from those checks and explain why the two Important findings coexist with a green suite.

The reviewed public captures show catalog/source imagery, empty states and explicitly synthetic fixture records. Private reference PNGs, original private photo bytes and user database exports are not additions in the supplied package. No new backend, account, payment, location-sharing endpoint, audience or outdoor module is introduced.

## Declined to judge / explicitly set aside before verdict

These are explicit boundaries and considered non-findings for the executor to rule on; none hides an additional discovered Critical/Important issue.

| Behavior considered | Disposition and reason |
|---|---|
| Historical geographic rebuild and all pre-base branch changes | Outside the supplied current-integration base. No merge of that historical branch to main is proposed; existing source bytes are treated as the delivered baseline. |
| Main merge, push, native Site publication and actual deployed byte identity | Not performed or authorized by this review. Release fields are deliberately pending. The executor must complete the separately authorized private release and byte/audience checks after fixes; the current review is not release-complete evidence. |
| Exact reference pixel equality and all ten screenshots at every width | Cannot establish undocumented original viewport/DPR. Reviewed all five reference compositions and corresponding El Durazno pixels; relied on the owner's documented two-park/viewport QA for the broader matrix. No new composition blocker found. |
| Physical phone, terrain accuracy, screen lock/background execution and uncommitted crash durability | Not tested and explicitly not promised. Browser simulation and confirmed-checkpoint recovery are the supported evidence. These remain limits, not a reason to invent performance claims. |
| Long-duration recording scale and browser quota limits | No sustained field/long-run performance benchmark supplied. Storage failure is surfaced and previous committed data retained; no concrete performance failure established in this review, so no speculative blocker assigned. |
| General cross-tab instant UI refresh for alias, garage, agenda or favorites | No live synchronization contract. Atomic store updates preserve unrelated edits. F1 specifically covers incorrect recording ownership and resurrected deletion, which is a separate concrete integrity failure. |
| Final save failure after the in-memory recorder ends | Error feedback remains explicit and prior committed state remains. UI does not promise recovery of unconfirmed data. No additional blocker established beyond the required checkpoint/ownership ordering in F1. |
| Wall-clock changes during an active ride | Pure module rejects backwards command time rather than storing invalid records. The UI may need a future monotonic-clock strategy, but no normal-operation reproduction was established here; do not silently reinterpret this as tested physical-device behavior. |
| Restriction-sensitive GPX exports and routes without geography | Existing original geographical segments remain exportable with provenance/access caveats; absent geometry disables export. GPX is not a route planner or permission claim. No geographic source edits or inferred connections found. |
| Nearby sorting's one-shot geolocation | Uses explicit user action and the existing filtering quality contract; it is not an additional continuous GPS watch or recording. |
| Bike assignment to activity and activity-map visualization | Nullable bikeId and local activity details/GPX satisfy the specified contracts. No required bike selector or separate replay map was identified; did not add requirements from prototype decoration. |
| Disposal restoring moved legacy controls | dispose has no active controller call site in this integration; cross-park changes load a new document. No reachable defect established, so no speculative teardown rewrite requested. |
| Service existence, exact POIs and availability | Existing catalog services are used with location/availability uncertainty. Only their new source attribution/action is incorrect (F3). Did not infer additional services, coordinates or live access from the prototype. |
| Beacon/SOS, shared events, bookings, payments, accounts, full offline maps, satélite/3D, routing turns or network remaining distance | Explicitly excluded/unavailable and not implemented as active services. Their absence is honest and within scope. |
| Extra runtime dependencies or prototype scripts | Builders use local product modules/fonts. No imported prototype runtime/CDN, external service or private design-original publication found. |

## Verdict

**Ready for private release: With fixes.** Two Important findings (F1 and F2) block release; F3 is a concrete Minor correction. No Critical finding.

Complete the ownership/deletion and rejected-reading fixes with focused regressions, then obtain a scoped independent re-review and refresh affected exact-code/build evidence. The existing architecture and approved five-screen scope can remain intact. This verdict is not authorization to merge main or change Site audience.

Review actions were read-only except this requested report. No subagents, implementation edits, index/HEAD changes, git recrawl, builds, full-suite reruns, push or deployment were performed. Two additional focused checks were justified above by concrete unresolved composition risks.
