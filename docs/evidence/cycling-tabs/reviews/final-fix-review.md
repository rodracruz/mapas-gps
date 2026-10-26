# Final fix wave — scoped independent re-review

Reviewed supplied package `affb4b2f790cf7370f0fec50be3aa6e1b0dbd858..d13ba419dfa18a04d57386baf364f33246e1cd1e`, `final-fix-review.diff`, `final-fix-report.md`, the three findings in `final-review.md`, and the archived focused evidence. This is a review of that fix wave and its introduced behavior, not a renewed whole-task review.

## Per-finding verdicts

### F1 — Cross-tab recovery/deletion resurrection: ADDRESSED

- `rider/ownership.mjs:23` acquires the same origin-wide exclusive native lock for both park entries. `rider/ownership.mjs:14` recovers active drafts only while owning it; startup (`:70`) reads existing state without recovery when another owner holds the lock. Pausing retains that ownership.
- `rider/ownership.mjs:49` captures the actual lease when enqueueing a write and rechecks ownership inside the transaction. Initial creation is explicit and once per lease; subsequent checkpoints require the matching existing active row. Missing/deleted or terminal rows cannot be recreated or overwritten by stale checkpoints.
- `rider/ownership.mjs:66` drains queued transactions before releasing and awaiting the native lock. `rider/session.mjs:18` queues the terminal save before release and prevents a new local start while closing. `rider/views.mjs:181` waits for the session ending before closing the store during disposal.
- `rider/ownership.mjs:6`, consumed at `rider/views.mjs:137`, checks activity status inside the deletion transaction rather than relying on a possibly stale disabled button.
- Unsupported/rejected coordination retains readable history (`rider/ownership.mjs:70`, `rider/views.mjs:45`) and disables recording with explicit feedback (`rider/views.mjs:169`). Native loss of ownership invalidates the lease and stops the in-memory recorder. This implements the executor's explicit native-Web-Locks compatibility ruling without changing schema v1 or legacy data.

Evidence inspected: `final-fix-evidence/bikeride-final-f1-green.log` records 10 passing groups with native locks and real IndexedDB, including live cross-park and paused owners, transactional delete refusal, simultaneous starts, surviving-tab and destination recovery, native revocation, queued checkpoint/finish/release/delete ordering, missing/terminal row guards, and absent/rejected APIs with existing history visible. The test code exercises the ordering rather than substituting a timer for ownership. The new asynchronous start still has the separate regression N1 below; that does not negate the corrected cross-tab storage invariants.

### F2 — Fresh matcher-rejected jump enters saved trace: ADDRESSED

`rider/session.mjs:27` distinguishes rejected results; `:34` consumes the rejected raw timestamp; `:35` requires a non-rejected, strictly newer raw reading before ingestion. The rejected result now breaks continuity without entering the recorded segments, including a retained old raw point on later matcher ticks. The next valid reading starts independently. Valid outside-network and ambiguous raw readings remain recordable.

Evidence inspected: `tests/rider-session.test.mjs:19` reproduces the original fresh-teleport case through the real matcher/session and checks both saved segments and GPX exclusion. The remaining tests cover retained-raw rejection/ticks, pause time, off-network activity, demo exclusion and ambiguous raw activity. `final-fix-evidence/bikeride-final-unit-green.log` records all 24 focused unit tests passing. Matcher and source geometry are unchanged.

### F3 — Blanket map provenance for services: ADDRESSED

`rider/views.mjs:151` uses each amenity's actual source URL and evidence type, distinguishing official-map evidence from the park site and labeling the fallback as a general park reference. The source action is now a real evidence link; the false blanket claim “Figura en el plano oficial” is removed. Location, availability and schedule uncertainty remain explicit. `rider/views.css:14` styles the new anchor without rearranging the service card.

Evidence inspected: `final-fix-evidence/bikeride-final-f3-green.log` records both catalogs and the defensive fallback passing. The test compares every rendered href against its supplied catalog value. Independently viewed the final El Durazno service capture: the corrected site-source wording/link and uncertainty are visible in the existing card hierarchy.

## New breakage

### Important N1 — Pending recording start overrides a later explicit Stop GPS

**Locations:** `rider/session.mjs:24`–25 and `rider/session.mjs:45`–55, particularly the awaited acquisition at `:49` and native GPS restart at `:52`.

**Trigger:** GPS consultation is running. Select Registrar actividad while the new lock/recovery operation is waiting for an IndexedDB transaction. Before it completes, select Detener GPS. The subscription receives mode off, but `update()` only calls finish/increments the cancellation epoch when a recorder already exists. During acquisition there is no recorder yet. Once acquisition finishes, the epoch still matches and line 52 clicks the GPS control back on before creating the recorder.

**Consequence:** The later explicit stop is silently undone: another native watch starts and local recording begins without a subsequent user action. Navigation has cancellation protection, but changing GPS mode during the new asynchronous start does not. This is an Important consent/lifecycle regression introduced by the fix's asynchronous acquisition, not a request for an unrelated feature.

**Independent focused check:** Fresh disposable Chromium context at `http://127.0.0.1:4187`, real native Web Lock and IndexedDB, stubbed watch/clear counters. No saved user data or actual personal positions. Started consultation, held a real read/write transaction open with queued reads, selected Registrar actividad, waited until the recording lock was held, then selected Detener GPS. Released the blocking transaction and observed:

```text
after explicit Stop GPS during pending start:
  mode: off, watches: 1, clears: 1

after pending recovery completes:
  mode: gps, watches: 2, clears: 1
  recording label: Grabando · Auto-pausa no disponible
```

The check completed in approximately four seconds and closed the context. It was needed because the supplied ownership tests cover transaction ordering and competing owners, but not a user's later GPS control action during acquisition. No completed suite was rerun.

**Required correction and regression:** A later explicit GPS stop or switch to demo must cancel a pending recording start. Once acquisition resolves, release ownership without restarting GPS or creating an activity for that canceled request. Preserve the intentional internal off/reset emitted by the session's own native GPS start, normal explicit starts, navigation cancellation, and terminal write ordering. Add focused delayed-acquisition/recovery tests for Stop GPS and demo, along with a successful explicit start control case. Merely disabling Registrar while busy does not address the still-reachable GPS/demo controls.

## Evidence and new-regression checks

Read the archived ownership, service, 24-test unit, lifecycle, both-bundle, real-store and legacy-storage logs, plus the 44-check feedback/accessibility completion. The builders both include the ownership namespace and required bindings; the geographic builder also strips its exported constants. The modified error-state assertion correctly expects a failed creation to stop recording, while retaining geometry/contrast/accessibility assertions.

Independently inspected the unsupported-browser capture at 320×568 and ownership-loss capture at 390×844: reserved error feedback and the disabled recording action are present, with GPS consultation still available. Hash-checked all 10 product/build/test files in `final-fix-evidence/exact-files.json`; all match their archived final hashes. These checks support the supplied evidence; they do not mean this reviewer reran the suites. The executor separately reports the fresh 155/155 full suite and final private build.

## Out-of-scope / nonblocking observations

- Native Web Locks and refusal to record/recover when absent or rejected are the executor-approved compatibility choice, now documented in the spec and UI. No alternate coordination architecture is requested.
- Existing tabs need not instantly synchronize every profile/history display; transaction-level safeguards protect recording/deletion. The earlier review's accepted boundaries remain in force.
- Field GPS, physical phones, background/locked-screen behavior and unconfirmed crash durability remain unvalidated and unpromised.
- Private publication, exact deployed-byte verification and audience preservation remain the executor's subsequent release work. No Site/main action is authorized or performed by this review.
- No additional out-of-scope defect or cosmetic follow-up is raised. N1 is in the changed session start path and blocks this fix-wave approval.

## Verdict

**F1: ADDRESSED. F2: ADDRESSED. F3: ADDRESSED. New Important N1: OPEN.**

**Ready for private release: With fixes.** Resolve N1 and obtain a focused re-review before release. No new Critical finding. This is not approval to merge main or change Site audience.

No subagents, implementation edits, index/HEAD changes, git recrawl, build, full-suite rerun, push or deployment. Only this requested report was written; one narrowly justified fresh-context reproduction and a read-only hash comparison were performed.
