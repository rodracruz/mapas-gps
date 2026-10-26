# N1 pending-start consent — scoped independent re-review

Reviewed supplied `n1-review.diff` for `d13ba419dfa18a04d57386baf364f33246e1cd1e..5ab5d41778a4d4521b63e096ae0bb122d2e2a4df`, the appended N1 section of `final-fix-report.md`, and `final-fix-evidence/n1/`. Scope is only N1 and new breakage in the two-file correction. Previously approved F1/F2/F3 remain closed.

## N1 verdict: ADDRESSED

- `rider/session.mjs:25` tracks the observed GPS mode. At `:28`, a later transition to off or demo while awaiting ownership calls the existing finish/cancellation path even when no recorder exists yet; that advances `startEpoch` at `:19`.
- `rider/session.mjs:52` bounds the ownership-wait phase. After acquisition, the epoch check at `:54` releases the acquired ownership and returns for a canceled request before starting a native watch or creating an activity. Returning from demo to off cannot restore the old epoch.
- The wait phase ends before the intentional native GPS reset at `rider/session.mjs:57`, so a normal explicit start from off remains functional. Repeated unchanged off snapshots also do not cancel it. The finally block clears the wait/start flags after success, cancellation or error.
- Navigation/pagehide cancellation, terminal-save/release ordering, existing active-record stopping and the F2 rejection guard retain their implementation. No lock/store/schema/builder behavior is changed in this correction.

## Evidence inspected

`bikeride-n1-red.log` and the report establish four pre-fix watch-restart failures. `bikeride-n1-consent-green.log` records all seven scenarios passing: Stop GPS, demo, demo→off, off→demo→off, navigation, successful start with GPS already active, and successful start from off.

Read the actual `green-captures/evidence.json`, which has no failures. All five canceled cases preserve the user's selected mode and watch/clear counts, retain zero activities, show `Sin grabación`, and release the actual native recording lock. Specifically, Stop stays off with watches1/clears1; demo stays demo with watches1/clears1; off→demo→off stays off with watches0/clears0. Both positive controls produce exactly one watch and one recording before normal finish.

The new browser test holds a real IndexedDB read/write transaction, waits for the native lock to be held, invokes actual reachable controls, and checks state after release. Its canceled-case timeout is caught only to continue to final assertions: those assertions still require the native lock to be absent, so a lock leak cannot silently pass.

`bikeride-n1-session-green.log` records all three existing matcher/session tests passing. `bikeride-n1-bundles-green.log` records both rebuilt standalone bundles passing their functional smoke checks. Independently viewed the final Stop and demo captures: the stopped state remains stopped, and demo remains visibly simulated with no recording and a disabled recording action. Read-only SHA256 comparison confirms both changed source/test files match `exact-files.json`'s `tested_files_sha256` values.

These are inspected execution results, not suites rerun by this reviewer. No additional concrete code doubt required another reproduction.

## New breakage

**None found. No new Critical, Important or Minor finding in this scoped correction.** The added state is limited to pending-start cancellation; it does not introduce another GPS watcher, restart on recovery, alter recorded data, or change the UI layout.

## Out-of-scope / nonblocking observations

Previously accepted boundaries remain unchanged: native-Web-Locks compatibility, physical/field/background validation and unconfirmed crash durability. F1/F2/F3 are not reopened. Final exact-code private packaging, deployed-byte verification and preservation of the existing private Site audience remain the executor's release steps; this report does not claim they have occurred or authorize a main merge.

## Verdict

**All findings addressed; no new Critical or Important breakage. Ready for the authorized private release: Yes**, after the executor completes the planned exact-code packaging and deployment verification. F1/F2/F3 remain addressed and N1 is now closed.

Only this requested review file was written. No implementation/source changes, subagents, index/HEAD mutation, git recrawl, builds, suite reruns, push or deployment were performed.
