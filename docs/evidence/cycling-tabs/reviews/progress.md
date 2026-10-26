# SDD ledger — plan: docs/superpowers/plans/2026-10-26-cycling-tabs.md

Base5fbf13b, feature feat/bikeride-stitch-integration, existing linked worktree /workspace/mapas-gps/.worktrees/parquemet-coverage; Git dir differs from common dir. Site21 owner-only; original private dist preserved. New ZIP84a113e38416 includes five approved cycling views plus current park view; outdoor excluded.

Ruling: explicit approval to execute and prior opt-out of repeated questions override plan/brainstorm confirmation gates. No pause for another start approval.
Ruling: skill helper resources scripts/sdd-workspace and scripts/task-brief are unavailable through skills.read. Use this unique git-ignored directory and exact task briefs written from the plan; no guessed plugin filesystem or installation.
Ruling: personal modules are local with honest empty states. No shared Beacon/bookings/services or offline-tile prefetch; do not block local work on those decisions.

| Scan | Producer/consumer | Finding/ruling |
|---|---|---|
| Task1 self | State/recorder/exports tests vs exact schema | Coherent; browser verifies atomic storage and legacy preservation. |
| Task2 self | View contracts vs existing two controllers/builders | Coherent; preserve hash and one map, no geometry edits. |
| Task3 self | Tested source/private packaging vs publication | Coherent; owner-only update already authorized, no new Site/audience. |
| Task1→Task2 | openRiderStore/createRideRecorder/buildGpx/meetupCalendar | Exact signatures in spec; Task2 waits for reviewed implementation. |
| Task2→Task3 | UI/modules/build outputs/screenshots | Task3 uses isolated build, root private dist untouched. |
| Task1→Task3 | Persisted/user exports | Never publish private DB/activities; test with public fixtures. |

Task1 running: /root/cycling_local_model (gpt-6.1-sol high), BASE381e695. Brief task-1-brief.md; report task-1-report.md. Root source HTTP4187; private dist remains untouched.

Task1 bc9c637 implemented: scoped18/browserIDB/full149 green; review /root/cycling_model_review spec Issues/quality Needs fixes. Two Important confirmed: movement-anchor accuracy vs previous accepted accuracy; backwards terminal finish yields invalid persisted snapshot. Fix round1 begins, FIX_BASEbc9c637, original implementer resumed. Task2 not started.

Ruling: clarify Task2 public navigate() and getPreview() kind/label contract before execution; needed for controller history and table-reference honesty, no implemented consumer changed. Task2 brief prepared, waiting Task1 fix/review gate.

Task1: fix round1/5 (2 addressed,0 open — jitter precision and terminal trace timing; commits bc9c637..38e43d2). Re-review /root/cycling_model_review APPROVED, no new breakage,21 scoped tests green.
Task1: complete (commits381e695..38e43d2, review clean).

Owner QA preparation: capture/comparison scripts in /workspace/scratch/cycling-release. Source Tailwind CDN returned403 (versioned and exact provided URL); no further compiler retrieval or workaround. This is optional reference rendering only; original PNG/HTML are available and product uses existing local fonts/CSS. Comparisons will explicitly retain original PNG scale uncertainty, normalize visual width and capture app at390×844; do not assert original CSS viewport metadata that ZIP lacks.

Task2 running: /root/cycling_views_integration (gpt-6-astra high), BASEa71b8a3; task-2-brief.md. Browser RED direct-view absence confirmed; initial five-view hierarchy, session bridge and controller changes now uncommitted; worker debugging browser flows. Owner QA scripts and input hashes prepared, no production changes by controller.

Task2 functional milestone: browser five views/47 cards/back/repeat/profile+bike reload/real GPX+ICS/record pause-resume-finish-interrupt/demo exclusion GREEN, /tmp/rider-views-green.log. Worker continuing GPS short+landscape, legacy Blob and HUD checks before final commit. Preliminary visual findings (blank source hero, exposed alias form) addressed by worker; final captures still pending.

Task2 DONE813018f, worktree clean; report task-2-report.md, scoped review package task-2-review-package.diff froma71b8a3. Final full suite152/152 and UI/lifecycle/bundle/GPS/attribution/storage green per logs read. Root10 captures+visual hierarchy checked; source originals and old private dist hashes unchanged. Dispatching scoped spec+quality review; no publishing yet.

Task2 review: Spec Issues/quality Needs fixes;3 Important confirmed against actual source/pixels. F1 persistent save notice obscures recording/agenda actions; F2 agenda date foreground=background; F3 hidden accessible GPS privacy copy still incorrectly promises no saving. No Critical/Minor. Owner confirmed source, images and exact aria-describedby mismatch; all within approved scope. Fix round1 starts from813018f with original implementer; new focused visibility/contrast/accessibility regression required. Cannot-verify items owned by controller:10 screenshot check completed; original viewport/DPR unknown documented; execution logs read152/152 +browser/GPS/store; fieldGPS remains unvalidated.

Owner comparison artifact QA: browser file:// navigation administratively blocked, no file-protocol retry. Normal approved HTTP project preview remains available for final packaged artifact QA; no permission or policy changes. Corrected comparison figure border/padding arithmetic so final visible columns are390px. Reference viewport/DPR remains unknown, explicitly disclosed.

Task2 fix round1 implemented: e519e05 +ba0a1c1 (friendly error copy amendment);44/44 focused assertions GREEN, lifecycle/layout/bundles GREEN. Owner inspected short recording/readable agenda/error screenshots,0 overlap and6.48:1 contrast, accurateAX descriptions. Source clean, private dist unchanged. Fix diff task-2-fix1-review.diff; re-review pending.

Task2: fix round1/5 (3 addressed,0 open — feedback/date/AX privacy; commits813018f..ba0a1c1). Re-review cycling_feedback_review APPROVED, no new breakage. Task2 complete, full change a71b8a3..ba0a1c1.
Task3 owner exact-code verification: fresh152/152 atba0a1c1; private build in/tmp/bikeride-cycling-private-55b71mlr, metadata /workspace/artifacts/cycling-tabs/private-build.json; private both-bundle smoke GREEN, comparison HTTP200/10 frames390x844 GREEN. Owned private QA HTTP4198 session37422; root source4187 session31077. All18 input hashes unchanged.
Task3 image QA found obsolete pre-bikeride test (full-width image/native crop) against current84x80 thumbnail. Compared actual published-v21 Site source and candidate: card widths288/350/720 at320/390/768, identical84x80 thumbnail and2570x3077 source. Test adapted to full source card, real44px touch target, actual high-res image and real enlargement/zoom/private-original checks; no product layout changed. Root test edits currently uncommitted.
Further actual tap failure confirmed in BOTHv21 and candidate after centering/readiness: a span inside#open-sign intercepts photograph control. Root cause broad .park-photo-card>button>span absolute base style plus bikeride .park-photo-card button>span left/right0 applies to arrow of static#open-sign, making global overlay. Diagnostic photo-control-diagnostic.json and PNGs in artifacts/cycling-tabs. Ruling: correct only this existing source-map interaction blocker before release — necessary to preserve original image access; no redesign/geometry changes. Small styling change risk to arrow placement must be checked in both parks/widths. Original implementer will take over focusedCSS/test fix; owner stopped editing test.

Task3 final codecb04527: fresh isolated152/152, private both-bundle smoke and12 source/private photo cases PASS. Final private build /tmp/bikeride-cycling-private-etepvt0e, HTTP4199 session21193; logs and hashes artifacts/cycling-tabs. New10 default captures0JS/errors/writes/overflow; synthetic garage/agenda captures refreshed. Safe public evidence/reviews archived underdocs/evidence/cycling-tabs; originals/comparison remain private. Preparing entire-plan review from5fbf13b (plan continuation baseline, no proposed merge of historical100k-line branch into main). No open task findings.

Task3 source-card correction committedcb04527,12/12 actual tap/zoom cases source/private. Entire integration source review package5fbf13b..affb4b2f790cf7370f0fec50be3aa6e1b0dbd858 prepared. Safe docs/evidence commit affb4b2; latest fresh suite+private build+bundle/photo tests all GREEN, source codecb04527. Independent entire-plan review next; publication still21.

RELEASE HOLD: final reviewer confirmed Important cross-tab ownership bug atcurrentaffb4b2/cb04527. BootTabB marks liveTabA recording interrupted, permits Delete, nextAcheckpoint upserts/resurrects ID. Await complete final-review.md then ONE combined final fix wave and scoped re-review. No publication/push yet. Site checkout locally prepared fromCB but must replace with corrected final tested build before packaging; live21 owner1 unchanged. Source remote569d329, publish_on_push false.

Final review affb4b2 With fixes: F1 cross-tab ownership/deletion resurrection Important; F2 rejected teleport raw retained Important; F3 amenity source provenance Minor. All Declined-to-judge boundaries accepted with stated reasons: historical prebase scope separate/no main merge; deploy validation still root duty; no pixel/field/background/long-run claims; generic CRUD live refresh not promised; no invented metadata/services. Ruling: native browser-exclusive ownership (WebLocks), compatible schema unchanged, no unsafe fallback; unsupported browsers keep consultation/data and refuse recording honestly. Cost: recording unavailable where coordination unsupported. One combined final fix wave dispatched per final-fix-brief.md; live publication held21.

Final fix ONE wave d13ba41 committed, clean. F1 nativeWebLocks guardedwrites/recovery/delete, F2 rejectedfresh/retainedGPSskip, F3 actualsourceURL. Report final-fix-report.md, diffaffb4b2..d13ba41 final-fix-review.diff, scoped re-review cycling_final_review running. Root fresh155/155 +private build fromexactd13 PASS, latest private root/tmp/bikeride-cycling-private-y8sizw0n, HTTP4201 session49878. Bundle/photo checks sessions52133/94175, current10capture28236. Staged SiteoldCB remainsDO NOTPUBLISH untilreplace latest. Compatibilitycost accepted perruling; no schema/legacydata/geometry changes.

Final scoped re-review: F1/F2/F3 addressed, new ImportantN1 in fix diff: pending asynchronous recording start can override later explicit GPS stop (sourcewatch1→off→watch2/record after queued recovery). RELEASE HOLD remains. Ruling: correct only this new consent regression and re-review it, despite final-review single-wave workflow cap — higher-priority user/developer require authorized work complete and safe; shipping known stop-override violates scope. No new feature or broad review. Cost: one extra narrowly focused fix/review and rebuild. Pending-start epoch must invalidate later external mode/intent changes while preserving own synchronousGPSoff/reset/start transition. Original final-fix implementer will handle N1 after formal scoped report.

N1 narrowly corrected5ab5d4 afterd13ba41, onlysession+consenttest.7 realnative/blockedIDB consent cases green, session3/3 andbothbundlecontrols green. Report appended final-fix-report.md; diffn1-review.diff; originalreviewer doingN1-onlyre-review. Preparing fresh exact-code build155 expected; liveSite21/no pushes still. No other findings reopened.

COMPLETE: N1 re-review APPROVED, F1/F2/F3 remainclosed. Source5ab5d4 exact fresh155/155/privatebundles/photo12 PASS. Native Site22 succeeded deploymentappgdep_6adf70016504819195217a4a995836e7, source69b4b4a, archive20d2bee9...; privateowner1/0visitors/0groups unchanged. Live /,parquemet.html,comparacion.html,comparacion-vistas.html allHTTP200+bytehashmatch. GitHubfeature5ab5d4 pushed, main87edc untouched. Finalpublicdocs/evidence nowupdated, willcommit/pushdocs thenteardownownedQA servers.
