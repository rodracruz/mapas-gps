# Task 1 correction round 1 re-review

Reviewed scope: supplied fix diff `bc9c637..38e43d2`, appended implementation report, and named RED/GREEN logs. The original Task 1 brief remains the binding contract. Only changed recorder behavior and its regression tests were assessed for new breakage.

## Verdicts

- **Finding 1 — ADDRESSED.** `rider/recording.mjs:48` now computes the uncertainty threshold from `previous.accuracy` and current accuracy. The movement anchor still supplies coherent-progress displacement. The regression reproduces the original 0m/1m/10m, 1m/45m/45m accuracy case, checks zero distance and null maximum speed, and checks that later 25m progress accumulates.
- **Finding 2 — ADDRESSED.** `rider/recording.mjs:74` rejects finalization more than 5,000ms before the latest accepted fix before any recorder mutation. This matches the store's time tolerance. Regression tests check unchanged state after rejection, successful later completion, and validation of the resulting activity through `validateRiderState`. Both final statuses are covered at the exact 5,000ms and 5,001ms boundaries.
- **Overall fix verdict — APPROVED.** Both blocking findings are resolved; the fix diff introduces no identified Critical, Important, or Minor issue.

## Evidence and limits

- `/tmp/rider-recording-fix1-red.log`: 11 recorder tests, 8 passed, 3 failed; the three failures are the new jitter and finalization regressions.
- `/tmp/rider-recording-fix1-green.log`: 21 scoped state/recording/export tests, 21 passed, 0 failed. Existing recorder coverage also remains green.
- The two production changes are narrow: an accuracy source substitution and a pre-mutation final-time guard. No interface, storage, geometry, export, or consumer behavior changes appear in the fix diff.
- No broad suite or additional counterexample was run: the supplied regression evidence directly covers the original failures and relevant tolerance boundary. No code or Git operation was performed; this report is the only written artifact.
- No additional observations about untouched code. UI, reload interruption, demo exclusion, and integration remain outside this scoped re-review.
