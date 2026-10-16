# Operation Elevate — current verification

> A newer uninterrupted full run on final build Wjb7KuR7 passed all 38 browser checks and all 327 image-file decodes. See [fresh full-project verification](FINAL_PROJECT_CHECK.md). The first-cycle scoped-run history is retained below.

16 October 2026. This is the first evidence-based recovery/improvement cycle, not a claim that all future production work is finished.

## Outcome and versions

The supplied complete ZIP was preserved and selected over older GitHub main. Baseline commit: 4fbde18; UI commit: 099faf2; admissions/metadata/navigation commit: 2d9fee3. Work is on recovery/elevate-20261016; no remote push/reset was performed.

Final default demo assets: index-Wjb7KuR7.js and index-E5G_fTlu.css. The last change only corrects the CS hero's AI-illustration alt text/caption. No media bytes or content records were replaced. Earlier reports below record their own exact build IDs; results are not relabelled as one universal final-build run.

## Actual verification

| Check | Observed result |
| --- | --- |
| Dependency installation | pnpm install --frozen-lockfile succeeded, already up to date; pnpm 11.25.0 / Node 24.21.0. |
| Production build | Passed. Twelve static entry routes produced. Existing large Three.js chunk warning remains; it is not hidden. |
| Content preservation | Passed: 16 CS sections, 50,115 text characters, 55 tables, 146 local image references, 109 unchanged optimised source images. Home summary still equals preserved event/notice/testimonial/recruiter records. |
| Packaged media | All 334 image/font/video files match the prior upgraded ZIP; 327 are images. Twelve production routes decoded their actual displayed images after lazy loading and disclosures. 14 scoped checks passed, no broken image HTTP/MIME/decoding or JavaScript errors. |
| Responsive layout | 16 configurations passed: 320, 360, 390, 430, 768, 1024, 1440, 1920px × light/dark. All twelve routes visited per configuration: 192 route visits. No horizontal document overflow. Palette, Manrope, glass header and dock journeys checked. Build CBxFKyUt / CSS E5G_fTlu. |
| Requested interaction and navigation fixes | Eight focused cases passed on BJcO8Bfa / unchanged CSS E5G_fTlu: subject image treatment/learning hover in both themes; real carousel cadence, edge controls and keyboard focus; moving phone pill; rapid double taps with normal/reduced motion; reduced-motion stability; dock absent on all seven department detail routes. |
| Functional workflows | 21 checks passed across desktop light, touch-phone dark and reduced/no-WebGL configurations on CBxFKyUt: menus, search, local guide, video route return, cohorts, all 37 people, 16 archives, enquiry validation/handoffs, directory and browser history. Details in ELEVATE_WORKFLOW_VERIFICATION.md. |
| Accessibility | Twelve scoped axe scans found zero violations and one incomplete check each. The initial faculty scan at a partly obscured scroll position was preserved; a fully visible filter-bar scan passed without disabling rules. This is not full WCAG certification. |
| Video functional behaviour | Five grouped cases passed: responsive source/real playback, reduced motion and Save-Data with no MP4 request, forced failure poster fallback, held-response status and recovery. |
| Isolated video measurement | Two additional cases: desktop canplay ~655ms and phone viewport ~426ms. Observed text LCP ~944ms / 544ms. Dropped frames 4/71 and 6/71. Network bodies matched full encoded MP4 sizes. Contended and isolated samples remain separate; see CAMPUS_VIDEO_AUDIT.md. |
| Static route metadata | Actual generated HTML for all twelve routes passed in default demo/noindex mode and a configured reserved .example-domain build. Default demo build restored afterwards. Route title, description, OG and Twitter fields agree; canonical/OG URL policy checked. No real hosting deployment was performed. |
| Final caption-only smoke | All twelve direct route reloads passed on Wjb7KuR7 with no page errors, ready state complete, explicit CS illustration caption/alt, hidden detail dock and visible AICTE/CET links on Apply. |

These first-cycle records are separate scoped runs. During that cycle the default all-scope alias was not run uninterrupted; the later full run linked above closes that gap. Reproducible commands point to current Elevate suites; historical V13 scripts remain labelled historical.

## Defects found and corrected during testing

- Rapid phone navigation could discard the next requested destination while a route loaded. The newest destination now queues and route readiness releases before paint; main exposes its busy state.
- Code review found an old animation callback could clear/commit a newer queued transition. Commits and cleanup are now bound to a monotonic navigation ID. Both normal and reduced rapid-tap regressions passed.
- Detail routes rendered a phone dock with no active destination. It is now absent on those seven pages and checked in the browser.
- CS campaign artwork was incorrectly captioned as an ordinary laboratory photograph. Existing provenance classifies it as AI-composed; visible caption and alt now reflect that.

## Evidence and review

Machine-readable results and 56 responsive/route screenshots: qa/elevate/. Additional workflow, carousel and video observations are retained locally. Reports record browser, scope, timestamps and build assets where applicable. [Committed before/after pair](BEFORE_AFTER.md) remains available without the ignored evidence folder.

Root visually inspected the before/after phone programme cards, light/dark Home views and the CS phone hero, rather than relying only on style assertions. Benchmark research includes 17 actual official-site screenshots; SRM returned 403 and is explicitly blocked. See BENCHMARK_RESEARCH.md.

Modified areas: carousel components/shared edge helper, BottomNavigation, CinematicHero controls, App route/theme state, global Elevate styles/fonts, Home/Apply factual copy, CS illustration disclosure, admissions provenance, shared metadata/build generator, current QA scripts and documentation. Original DepartmentPage, AuditPage and ImageViewer implementations were retained.

## Remaining limits and next phase

- Physical iPhone/Safari, low-end Android GPU/battery and production mobile-network/CDN behaviour were not measured. Headless viewport emulation is not a substitute.
- Isolated frame drops are lower than under concurrent tests, but not zero. Profile the actual target devices before promising universal smoothness or changing video encoding/blur effects.
- Six non-CS department routes are official-resource directories; full showcases are separate scope. All verified original content is retained.
- Enquiry prepares external WhatsApp/email links; it has no server-side application storage or live AI backend. Tests sent no messages.
- Deployment origin/hosting remain unspecified, so the delivered build stays noindex. Institution sign-off is needed before production publication/admissions integration.
- Current total intake is reconciled; live CAP subdivision confirmation and retirement/annotation of the inconsistent legacy BE page remain institutional review tasks.

Next priorities: real-device profiling, production domain/hosting setup and approved backend integration, then any commissioned expansion of department showcases. Do not restore duplicate raw assets or overwrite the supplied baseline to conceal those gaps.
