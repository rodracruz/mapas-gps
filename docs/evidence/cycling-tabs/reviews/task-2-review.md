# Task 2 independent spec and quality review

Reviewed package: `a71b8a393f0eb8077be2e199dfa59b807b52b15d..813018f44545b13daa67a8b7556746c8205f2b7c`.

**Spec verdict: Issues found.** The principal architecture and data contracts are implemented, but recording controls are visually obscured by save feedback, agenda dates are unreadable, and the explicitly required GPS privacy-copy correction is missing.

**Task quality verdict: Needs fixes.** Three Important findings below; no Critical findings. These are functional visibility/privacy issues, not requests for cosmetic refinement.

## Strengths

- The integration retains the existing Leaflet instance and native GPS controller. New GPS subscription/snapshot support adds no second watch. Controller redirects preserve the full route hash, and `syncRoute()` itself does not write history.
- New route cards have their own selectors. Data is bound to each park's actual catalog, original previews and independent geographic segments; unavailable altimetry, terrain, live services and network routing remain explicit. GPX export includes geographic attribution, and the UI distinguishes a GPX file from an offline basemap.
- Local changes use the Task 1 transactional mutator and mutate individual records rather than replacing an old UI snapshot. Forms retain errors instead of claiming a failed update succeeded. Profile, garage, personal agenda and downloadable GPX/ICS have real implementations.
- Recording begins only after the GPS-start reset, creates a recorder per activity, excludes demo mode, suppresses repeated raw timestamps and breaks continuity after rejected signals. Leaving the map finalizes an interrupted record before native GPS stops. Startup recovery preserves stored segments without restarting GPS.
- The submitted browser tests exercise direct routes, both catalogs, real IndexedDB failure/rollback, lifecycle, downloads, legacy storage and bundled execution. Existing layout tests were adapted to actual reachable controls and expanded for the new obstacles rather than simply dropping the original GPS visibility assertions.

## Findings

### Important 1 — Save feedback persistently covers recording actions

**Locations:** `rider/views.mjs:27`, `rider/views.mjs:39`, `rider/views.css:18`.

**Trigger:** Open the map at 320×568 and select **Registrar actividad**. The first successful checkpoint calls `tell('Actividad guardada en este dispositivo')`. `tell()` unhides the fixed message but never dismisses it; later checkpoints keep it present. The message uses `z-index:1800` and `bottom:80px`, above the HUD.

**Consequence:** The solid message covers the Pause and Finish labels. A focused fresh-browser check measured the message at y451.20–488 while both action buttons occupy y458–498. It overlaps 5,241.56px² of Pause and 1,709.06px² of Finish. At 390×844 it also overlaps the bottom of both buttons. `pointer-events:none` permits clicks but does not make the action labels visible. The same persistent notice obscures the create-agenda button in the owner's populated agenda capture. This violates the requirement that new panels not cover actions.

**Evidence:** Independently captured and inspected `/tmp/task2-review-recording-320x568.png`; additional captures `/tmp/task2-review-recording-390x844.png` and `/tmp/task2-review-recording-844x390.png`. The focused check used a new Playwright context and synthetic GPS watch stub, not user storage. The submitted GPS visibility runs exercise consultation/demo, so they do not answer this recording-save feedback case.

**Remedy:** Put save/error feedback in a reserved visible region that cannot overlap actions, or use suitably positioned transient success feedback and persistent inline error feedback. Do not show a floating success toast on every periodic checkpoint. Verify explicit start/pause/finalize with the message present at 320×568 and 390×844, and a populated agenda after saving.

### Important 2 — Personal agenda cards hide the actual date and time

**Locations:** `rider/views.css:9`, `rider/views.css:17`, `rider/views.mjs:135`.

**Trigger:** Save a personal meetup. Its date/time is a `.rider-date` span directly inside `.rider-section-title`.

**Consequence:** `.rider-section-title>span` (specificity 0,1,1) sets `color:#954915` and overrides the later `.rider-date` (0,1,0) `color:white`, while the pill background is also `#954915`. The date and time, including the clock glyph, become invisible. Scheduling data is present in the DOM and export but unavailable in the agenda card.

**Evidence:** Confirmed from the submitted CSS/markup and independently inspected the owner's `/workspace/artifacts/cycling-tabs/agenda-fixture-390x844.png`, whose populated card has a blank orange date pill. No extra test or source crawl was needed to resolve the specificity conflict.

**Remedy:** Scope the heading accent rule so it excludes the date pill, or give the date pill an appropriately specific contrasting foreground rule. Verify a populated meetup's rendered date/time and contrast, not only that the card or text exists.

### Important 3 — GPS accessibility description still promises that no route is saved

**Locations:** `mapa-geografico.html:18`, `mapa-geografico.html:19`, `parquemet.html:16`, `parquemet.html:17`; hiding rule in `rider/views.css:25`.

**Trigger:** Use the GPS control, including **Detener GPS** while an explicit local recording is active. Both buttons retain `aria-describedby="gps-privacy"`, whose referenced text is still: “OSM carga teselas del área visible. Tu ubicación y recorrido no se guardan.”

**Consequence:** The new CSS hides this element visually but does not correct the referenced accessible description; directly referenced hidden text can still supply an accessible description. The absolute promise conflicts with explicit local recording and with the brief's specific instruction to update `#gps-privacy`. The replacement visible HUD note does not change this relationship.

**Evidence / focused unchanged-code check:** Inspected only the named `gps-privacy` text and its `aria-describedby` references in both entry HTMLs. The focused recording browser check also read back the unchanged description during an active recording. This was a concrete privacy-copy integration risk, not a general unchanged-code review.

**Remedy:** Update both descriptions to distinguish GPS consultation/demo from explicitly started local activity recording, retaining an accurate explanation of map tile requests. Keep the visible and accessible messages consistent and check the control's computed accessibility description.

## Cannot verify from diff alone

- Exact visual fidelity to all original HTML/PNG references, and every viewport/park combination: the diff shows the major component hierarchy and responsive rules, but it cannot establish rendered fidelity. The owner has inspected the original references and ten current viewport captures. This review inspected only the two specific pixel cases described above; it does not claim pixel-perfect equivalence or normalize an undocumented reference DPR.
- Successful execution of the reported full suite, build checks, previous-dist hashes, and legacy Blob/calibration preservation: the report supplies results and the submitted tests provide relevant coverage, but this scoped review did not rerun completed tests or independently recompute those artifacts. The owner should retain that evidence for final integration review.
- Field GPS behavior, background execution and crash-time durability beyond committed IndexedDB data remain outside these browser checks; the implementation appropriately avoids promising them.

## Review scope and additional verification

Read the Task 2 brief, binding design spec, Task 1 interface notes, implementation report and supplied diff package. Some initial tool output was truncated; the remaining package portions were read in bounded chunks. No git recrawl, HEAD/index changes, implementation edits, builds, full-suite reruns or subagents were used.

One focused browser check was added only to resolve the specific uncovered save-toast/recording-control overlap doubt. It used the existing source server on port4187, synthetic public test state in a new browser context, and temporary screenshots outside the repository. Only this requested review report was written in the worktree.
