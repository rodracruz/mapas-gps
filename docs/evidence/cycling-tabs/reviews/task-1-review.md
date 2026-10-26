# Task 1 independent review

Reviewed change: `381e695..bc9c637`, using the supplied review-package diff once. Scope: three rider modules and four assigned tests; no UI, reload-controller, demo-consumer, deployment, or build changes assessed.

**Spec verdict: Issues.**

**Task quality verdict: Needs fixes.**

## Findings

### Important — Jitter threshold uses an old anchor's accuracy instead of the previous accepted reading

`rider/recording.mjs:48`

The binding threshold is `max(3m, min(current accuracy, previous accuracy) * 0.5)`. The implementation uses `anchor.accuracy`; the anchor can precede multiple accepted fixes. When accuracy deteriorates, an old precise anchor causes movement within the newer uncertainty to increase distance and maximum speed.

Focused counterexample: accept equatorial positions 0m (accuracy 1m), 1m (accuracy 45m), and 10m (accuracy 45m), one second apart. All readings are accepted. The final previous/current threshold is 22.5m, while both the 9m consecutive step and the 10m anchor displacement are below that threshold. The recorder nevertheless reports approximately 10m because the anchor's 1m accuracy produces a 3m threshold.

Use the previous accepted reading's accuracy for the specified threshold while preserving coherent-progress handling. Add a regression covering accuracy changes across subthreshold accepted readings.

### Important — Earlier finish time can irreversibly finalize an activity that its own store rejects

`rider/recording.mjs:21`, `rider/recording.mjs:71`

Time validation compares only against `lastCommand`, which advances on start/pause/resume/finish but not accepted fixes. `finish` then changes the recorder to its terminal state without validating the resulting activity against its accepted trace.

Focused counterexample: start at 1,000,000ms; accept stationary fixes at start, start+10s, and start+20s; call `finish(start+10s)`. It succeeds with a last point 10 seconds after `endedAt`. `validateRiderState` rejects this returned activity with `Invalid rider state: activities[0]: point time`. A subsequent corrected `finish(start+20s)` fails with `The ride has already ended`. The accepted trace is consequently stranded in an invalid terminal snapshot. An earlier explicit time or a backward wall-clock adjustment can expose this inconsistency.

Validate the resulting final time against the accepted trace, accounting for the allowed future-fix tolerance, before mutating recorder state. Invalid finalization must leave the current recording usable. Add a regression asserting rejection, state preservation, and successful later finalization.

No Critical or additional Minor findings.

## Strengths

- The change is limited to assigned modules and tests. Default storage is the separate `bikeride-local-v1` database; the legacy database name is explicitly protected.
- IndexedDB read/modify/validate/write occurs in one readwrite transaction, resolves only on completion, and rejects async mutators and aborted writes. The browser test covers real cross-connection concurrency, rollback, reload persistence, and synthetic legacy Blob/localStorage preservation.
- Validation produces detached state, rejects invalid data and unsafe identifiers, limits text, and preserves long traces without truncation.
- GPX preserves independent segments and point order, validates geographic coordinates, and escapes XML. ICS converts explicit offsets to UTC, escapes text and line breaks, and folds by UTF-8 octets without invitation transport.
- Recorder tests cover active time, pauses, gaps, rejected-fix continuity breaks, dateline distance, basic jitter, and detached snapshots.

## Evidence and verification limits

- Read the brief, implementation report, and complete supplied diff. Read retained RED logs and the full-suite log; its final totals are 149 tests, 149 passed, 0 failed. The report records 18 scoped passes and a successful actual-browser IndexedDB run. No broad suite was rerun.
- Ran only the two named, in-memory Node counterexamples described above. No source, existing database, product dist, or Git state was modified during review. This review document is the sole written artifact.
- Browser GREEN execution is supported by the implementer's report and browser-test assertions; it was not independently rerun. Real private user storage was not inspected.
- Explicit GPS initiation, demo exclusion, checkpoint scheduling, reload interruption, UI save messaging, and catalog presentation remain consumer/integration responsibilities in the following task, as directed by the brief. This review makes no completion claim for them.
