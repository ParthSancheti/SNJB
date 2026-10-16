# Elevate workflow verification

Final-build run: **16 October 2026, 07:31:13–07:32:27 IST** (02:01:13–02:02:27 UTC). This supersedes the earlier workflow run in this audit and is separate from the historical V13 report.

Target: `http://127.0.0.1:4178`, the built local preview supplied for this audit. The actual HTML response was checked for final entry `/assets/index-CBxFKyUt.js`. Browser: installed Microsoft Edge, automated through Playwright. Source script: `scripts/qa-elevate-flows.mjs`.

## Result

**PASS: 3 focused configurations, 21 workflow checks, no detected defects in this scope.** Process exit code: 0.

| Configuration | Size | Theme / motion | Checks |
| --- | --- | --- | ---: |
| Desktop | 1440 × 900 | Light, normal motion | 9 passed |
| Phone emulation | 390 × 844 | Dark, normal motion, touch | 10 passed |
| Fallback | 390 × 844 | Light, reduced motion; WebGL contexts deliberately unavailable | 2 passed |

No JavaScript `pageerror` events, local HTTP responses of 400 or higher, or external write requests were observed during these journeys.

## Verified journeys

| Journey | Actual acceptance result |
| --- | --- |
| Desktop navigation | Hover opens the menu; leaving dismisses it. Clicking pins it open after pointer exit. Academic and nested department folders open. Escape closes and restores focus to the opener. |
| Phone quick access | Opens the dialog; the background becomes inert. The global motion switch remains accessible. Escape closes and restores focus. |
| Search | Receives input focus. “computer curriculum” returns the local curriculum destination. Escape closes and restores the search trigger. |
| Search → guide | Search closes and the source-linked guide opens. “computer faculty” finds the preserved local people source. Tab/Shift+Tab remain within the dialog; Escape restores the background. No external AI service request occurs. |
| Campus film | Plays on Home, then resumes and advances its actual playback clock after navigating to Apply and returning via the brand link, on both tested configurations. |
| CS curriculum | Batch 2025–29 / Year 2 selects the correct official PDF. Returning to batch 2026–30 resets the unavailable study year to Year 1 and selects its published PDF. |
| CS people | All 37 rendered identities match the source JSON in order. Staff filter returns 10; “Sanghavi” returns 2; published details expand; empty search resets to all 37. |
| CS archive | All 16 rendered section IDs match the preserved source JSON. The people record opens and retains its official source URL. Search and empty/reset states work. |
| Admissions enquiry | Blank required fields and malformed optional email are rejected. A valid synthetic enquiry prepares a summary and encoded WhatsApp/email links. Editing preserves the entered name. The test sends no enquiry. |
| Institutional directory | All 9 root categories appear. “fees” exposes the official FRA link; empty search and reset work. |
| Phone dock | Exactly one active label/pill is present after route settling. Campus selection and browser back/forward update the active route correctly. |
| WebGL fallback | An unavailable-context simulation produces the readable “3D view is unavailable in this browser” state. Academic controls and faculty content remain available. |
| Reduced motion | Home omits the video element; search and Escape remain functional. |

“Guide” here means the existing local official-resource search, not a connected generative AI service. An enquiry summary and handoff are not an officially submitted application. No external link was activated to send WhatsApp or email.

## Automated accessibility scope

Twelve scoped axe scans completed with **zero reported violations**: desktop header / phone quick access, search, guide, faculty, enquiry and resource directory, on the respective two configurations.

Each scan also reported **one incomplete automated check**. These results therefore require human review; they are not a declaration of complete WCAG conformance. Physical phone behavior, Safari/VoiceOver, full keyboard and screen-reader reading order, and contrast across changing glass backgrounds remain manual review items.

An initial final-build attempt passed 20 of 21 checks: the desktop faculty scan found filters partly obscured behind sticky navigation after the browser scrolled an expanded details card into view. The follow-up positions the filter bar fully below sticky navigation before inspection; all target-size rules remain enabled and the complete suite then passes. The original report and screenshot remain in `workflow-report-before-viewport-normalization.json` and `desktop-light-6-failure.png`. Review sticky-header focus/occlusion behavior manually across other scroll positions; no product CSS sizing rule was altered by this test correction.

## Evidence and reproduction

- Structured results, including individual checks and measured playback clocks: `qa/elevate/flows/workflow-report.json`.
- Search, guide, prepared enquiry, phone dock and fallback screenshots: `qa/elevate/flows/`.
- Evidence is intentionally ignored by Git; the reproducible script and this report are source-controlled.

Run against a built preview:

```powershell
$env:SNJB_QA_URL = 'http://127.0.0.1:4178'
node scripts/qa-elevate-flows.mjs
```

The script uses only project dependencies and installed Edge by default; `SNJB_QA_CHANNEL` can select another installed Playwright browser channel. It reads source JSON to check identities and archive IDs. Synthetic admissions values use `qa@example.invalid`; external messages are never sent.

This focused suite complements the separate responsive, media, carousel and static-build audits. It does not claim every possible route state, physical-device performance or assistive-technology combination has been tested.
