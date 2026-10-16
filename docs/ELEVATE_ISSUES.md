# Prioritised findings — 16 October 2026

Evidence labels: CONFIRMED means an actual file, calculation or rendered state was inspected; STATIC is code-only evidence; HYPOTHESIS is not a defect claim; RECOMMENDATION is a proposed next step; BLOCKED requires unavailable evidence. Runtime results are kept separately in ELEVATE_VERIFICATION.md.

| Rank | Priority | Finding and evidence | First-cycle disposition |
| --- | --- | --- | --- |
| 1 | P0 | CONFIRMED version mismatch: GitHub 6f7c8c4 lacks four supplied source files and differs in 21 source files. Resetting would lose the supplied baseline. | Complete ZIP-equivalent source committed as 4fbde18 on a recovery branch; source/archive/hash inventories retained. No main push/reset. |
| 2 | P0 | CONFIRMED reported admissions conflict is a year/scope problem. Current AICTE+CET support 540 base + 28 TFWS = 568. Legacy E&TC arithmetic is inconsistent. | Preserve current numbers, add provenance and capacity context; historical source retained separately. |
| 3 | P1 | CONFIRMED Home/README/metadata promised full intake/placements/3D content on departments whose component is only a resource directory. | Remove false promises and mechanical 3D badge; accurately describe flagship vs directory coverage. |
| 4 | P1 | STATIC generated route HTML inherited Home Open Graph/Twitter fields. | Share metadata registry between client and build; verify all twelve generated entries. |
| 5 | P1 | STATIC canonical and og:url identified the legacy official website regardless of current demo deployment. | Omit guessed URLs, demo noindex; configurable approved deployment URL. Actual host publication still requires review. |
| 6 | P1 | CONFIRMED supplied upgrade restored always-visible carousel transport/progress rows against explicit user requirements. | Shared edge controls, pointer-edge/keyboard reveal, 44px targets; permanent rows/progress removed. |
| 7 | P1 | CONFIRMED requested section cadences differed from the supplied five-second default. | News 5s, campus 3s, recruiters/recognitions 1s; retain reading/focus/visibility/motion pauses. |
| 8 | P1 | CONFIRMED mobile dock rendered four labels and column layouts instead of selected icon+label. Rapid taps were discarded by a pending-route guard; department pages showed a dock without an active destination. | Active-only label, horizontal spring pill, latest-request queue and route-bound animation callbacks; hide the dock on department details. Retain accessible inactive names. |
| 9 | P1 | CONFIRMED serif hero wordmark has a descender inconsistent with requested aligned SNJB letters; body fonts varied. | Manrope wordmark/body; preserve Devanagari font and authentic logo. |
| 10 | P2 | CONFIRMED programme photos had opacity + mask + white overlay, visibly washed out in light mode. | One fade mask, dark saturated photographs in both themes, no white wash. |
| 11 | P2 | STATIC ambient/nav/canvas colours mixed older navy/blue/gold with supplied teal/orange identity. | Palette sampled from attachment; light/dark canvas, four ambient fields and UI tokens aligned. |
| 12 | P2 | CONFIRMED learning-card feedback was limited to a small image scale. | Coordinated card depth, image parallax, light sweep, icon/arrow motion; keyboard outline and motion preference retained. |
| 13 | P1 | CONFIRMED README linked twelve absent documents and stated unsupported department features. | Replace with honest onboarding and real current reports; older QA explicitly historical. |
| 14 | P1 | CONFIRMED desktop film is 6,963,207 bytes, mobile 4,019,462 bytes; large Three.js chunk and heavily layered glass need measurement. | Separate network/playback/fallback audit; contended-host dropped frames must not be called a pass for smoothness. Isolated measurement and real-device tests govern further tuning. |
| 15 | P2 | CONFIRMED six non-CS department routes are functional directories, not complete image-led showcases. | Preserve those working routes and describe scope correctly. A full multi-department redesign is a later product phase, not hidden by restoring duplicate raw photos. |

## Reports that were investigated, not presumed

- **CONFIRMED:** all 327 packaged image files match the prior upgraded ZIP; all 109 optimised source-delivery hashes remain correct. Browser decoding checks found no missing local images. No bulk restoration was justified.
- **BLOCKED:** SRM returned 403 in the actual browser. No design observations are claimed from the blocked page.
- **MANUAL REVIEW:** institution confirmation of legacy-page retirement/current CAP subdivisions, deployment domain and hosting, physical iOS/Safari and true mobile GPU behaviour.
- **HYPOTHESIS:** slow or dropped frames under several concurrent desktop browser audits may be host contention. A single such sample does not isolate video encoding, CSS blur, GPU or network as the cause.

## Traceability and acceptance

Issue IDs are E01–E15 in rank order above. Before source evidence is preserved at baseline commit 4fbde18 and in the external recovery folder. Before screenshots: before/home-390-light.png, home-390-dark.png, home-1440-light.png, home-1440-dark.png, fields-390.png and learning-390.png. After screenshots and machine-readable results: qa/elevate/. Source commits and final verification identify the implemented version.

| IDs | Inspected source | User impact / acceptance criteria | Verification evidence |
| --- | --- | --- | --- |
| E01 | public.zip; remote main; comparison.json; file-hashes.json | Prevent loss of supplied source. All 502 source/runtime paths retained; no remote-only file silently removed. | BASELINE_AND_VERSION_COMPARISON.md, archived hashes and independent clone. |
| E02 | admissions-v10.json; official FY, AICTE and CET records | Prevent misleading admission decisions. Every row sums, base/TFWS/year/source visible; no implication of live vacancies. | ADMISSIONS_DATA_RECONCILIATION.md; Apply workflow and metadata tests. |
| E03 | Home.jsx; DepartmentPage.jsx; README; route descriptions | Avoid promising a showcase absent at the destination. Directory routes work and are described accurately. | Workflow/media route audit; current README. |
| E04–E05 | index.html; App.jsx; scripts/build.mjs | Correct social/search identity. Twelve route-specific titles/descriptions, no guessed deployment URL, explicit demo indexing policy. | scripts/verify-metadata.mjs against actual built HTML. |
| E06–E07 | ContentRail, NewsStrip, CampusGallery, HomeContentSpotlight; useAmbientAutoplay | Content stays clear and readable. Exact requested timers, no persistent rows, edge/focus controls, holds and reduced-motion behaviour. | qa-elevate motion cases and focused carousel evidence; before/after Home captures. |
| E08 | BottomNavigation.jsx; App.jsx | Compact predictable phone navigation. Active-only text, moving pill, rapid latest tap succeeds, hidden on detail pages, history remains correct. | Rapid-tap, pill geometry, detail-route and workflow checks. |
| E09–E11 | brand-font.css; v10/v11/v12 styles; elevate.css | Consistent identity and legible photography. Self-hosted aligned wordmark, exact sampled tokens, dark saturated subject images in light mode. | Runtime font loads, computed styles, both-theme subject checks and screenshots. |
| E12 | Home resource grid; v11 hover rules; elevate.css | Discoverable tactile feedback. Card and image move distinctly; focus visible; reduced/global-off movement suppressed. | Learning hover and reduced-motion cases; learning-hover screenshots. |
| E13 | Supplied README; docs inventory; historical reports | Reproducible handover without false evidence. Every current README link resolves; old results clearly historical. | README link/path check; current verification and walkthrough. |
| E14 | MP4/poster files; CinematicHero; runtime network/frame observations | Establish real loading/playback limits. Responsive source plays, reduced/Save-Data avoid MP4, failure/slow recovery preserve content; frame/LCP findings disclosed. | CAMPUS_VIDEO_AUDIT.md and separate contended/isolated recordings. |
| E15 | Six non-CS DepartmentPage routes | Clear demonstration scope. Preserve working official links and avoid claiming missing full redesigns are deleted files. | All-route media/layout audit; phase-two recommendation. |
