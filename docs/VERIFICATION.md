# Verification — V13 / campus film V10

> Historical report for 15 October 2026. These results do not certify the upgraded ZIP or Elevate changes. See [current verification](ELEVATE_VERIFICATION.md).

15 October 2026. Production preview in installed Google Chrome on Windows. Final build: `index-hiaBr4s9.js`, `index-CXZd7jl7.css`. Device profiles and phone sizes below are browser emulation, not physical iPhone/Safari certification.

| Check | Result |
| --- | --- |
| Responsive journeys / accessibility | 12 cases passed: 320×568, 390×844, 768×900, 1024×768, 1440×900 and 1920×720, in both themes. All five routes, header clearance, no horizontal document overflow, real dock journeys, theme persistence, search ranking/focus, original-record expansion, service destinations and source counts. Axe reported zero violations in scanned Home, menus, search, Campus, Apply and Explore states. |
| Film actions and glass | Both Home actions have identical translucent material, native blur and white text in both themes. Header, menu and search material filters and translucency checked. Vision icon/text centres align on one row. No carousel next/previous/pause/pagination or photo-enlarge controls remain on any of the five routes. |
| Animation and five-second content | Six focused cases passed: real intermediate search/menu opening frames and settled bounds at phone/desktop, actual film time after route return, all five surfaces advance in about five seconds, hover/focus/read holds and resume, reduced-motion keyboard access with zero MP4 requests, and saved global motion-off. |
| Touch navigation | Both iPhone 13 and Pixel 7 Chrome device profiles passed actual tap journeys, 44px clear hero actions, quick-menu blur, nested Explore navigation, search focus/background inertness, no non-Home footer and admission-route selection. |
| Material regressions / genuine loading | Three checks passed: dark phone and light desktop hero text, low-tint menu/search/guide backdrops and glass footer; a deliberately held real image request shows shimmer, then removes it when both gallery photographs load. |
| Desktop hierarchy | Three focused cases passed: 1440 light, 1024 dark and 390 light. Hover open/close, pinned click, crossing the panel gap, nested departments, Escape/focus restoration, search geometry/ranking and guide handoff remain intact. |
| Original content | Passed: 16 CS sections, 50,115 text characters, 55 tables, 146 local references, 109 unchanged optimized resource files (duplicate originals archived outside distribution). Home summary equals original event/notice/testimonial/recruiter records. |
| Numerical/source presentation | Six cases passed at 320/390/1440 in both themes. Archive hashes, nine recognitions, twelve services, current intake/TFWS arithmetic, actual PG routes, both placement scopes/years, chart counts, missing-offer handling and all journal/recruiter/voice counts. |
| Build / delivery | Final production build passed. Five video/playback/fallback cases and all five direct static entries passed again after the material corrections, including the native CS fragment and anchored header layering. |

The current Home archive retains 333 link records, 63 body images, nine recognition entries, two notices, four source event entries (three unique displayed events), ten testimonials and 34 recruiter marks. The department retains all 37 authentic faculty/staff identities and source fields. No numerical or source-media substitution is introduced in V13.

## Findings and remedies

- A legacy light-theme rule made transparent hero actions use dark text. A scoped foreground rule now keeps both actions white over the campus film, while leaving the glass hover/reflection rules effective. The responsive test explicitly checks this regression.
- Older dark-theme selectors still applied a 40% black veil behind Quick access and a 50% veil behind the guide. Specific current-layer rules remove these inherited fills; page blur and low transparent tints retain scene colours.
- White-only header glass became too bright over pale video frames in dark mode. A translucent navy tint, lit edge and soft text shadow restore reading contrast while preserving native blur and background colour.
- Expensive first-paint blur can skip a short opening animation. Search/quick access paint the trigger-sized state for two frames before expanding. Motion verification samples real rendered intermediate states and settled geometry rather than assuming a target style proves movement.
- Automatic movement formerly stopped permanently after a swipe, relying on a visible Resume control. Manual interactions now restart viewing time; released/cancelled touch holds and replaced focused quotes cannot leave stale hidden pause state.
- Quote expansion pauses while reading; collapse and focus/hover departure restore rotation. Reduced-motion and saved motion-off retain swipe/keyboard access without forced automatic movement.
- Image loading uses actual request/decode state. No artificial introductory loader or delay is added.

QA scripts write screenshots and JSON evidence under ignored `qa/`. Current V13 checks are included; historical scripts and working artifacts are archived outside the runnable project.

Automated checks do not certify every assistive technology, low-end GPU or physical phone. The existing deferred optional Three.js module still triggers Vite's large-chunk advisory; it is not an initial Home dependency. The guide remains local source-linked resource lookup, without a language-model backend.

## Runnable cleanup verification

The production JS/CSS hashes remain identical after cleanup, so rendering logic is unchanged. The content checker now verifies all 109 exact delivery-image hashes while original-source URLs/hashes remain metadata. See [cleanup](CLEANUP.md).
