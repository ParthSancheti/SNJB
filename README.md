# Project ASTRA — SNJB Engineering

React 19 / Vite 8 demonstration. The complete supplied public.zip was compared with GitHub and preserved before changes. Current branch: recovery/elevate-20261016. The remote default branch was not overwritten.

## Run

Node.js 22.12+ and pnpm; current verification uses Node 24.21.0 on Windows.

```sh
pnpm install --frozen-lockfile
pnpm check:content
pnpm dev
```

Open http://127.0.0.1:4173/. Production: stop dev, then run pnpm build and pnpm preview. For automated checks alongside dev:

```sh
pnpm build
pnpm exec vite preview --host 127.0.0.1 --port 4178 --strictPort
# Another terminal:
pnpm check
pnpm check:images
pnpm check:interactions
pnpm check:video
pnpm check:metadata
```

Browser suites use installed Edge. SNJB_QA_CHANNEL=chrome selects installed Chrome; SNJB_QA_URL changes the preview address. Viewport emulation is not physical-device certification.

The image-library check loads and decodes every image under public, including responsive variants not currently displayed on a page. It checks HTTP status, image MIME and nonzero decoded dimensions.

## Actual route coverage

- Home: campus film, sourced news, gallery, vision/mission, nine recognitions, programme finder, learning resources, twelve services, placement charts, recruiters, testimonials and source archives.
- /computer-engineering: curriculum, laboratories, 37 faculty/staff, projects, processor visualisation, placements, communities and sixteen original archival sections.
- /apply: study routes, intake capacity, fees/source links and an enquiry form preparing WhatsApp/email handoffs. It does not submit an application or store data on a server.
- /student-life: campus services, events and resources.
- /explore: 333-destination directory across nine categories.
- /audit: source/provenance registry.
- /ai-data-science, /civil-engineering, /electronics-telecommunication, /mechanical-engineering, /first-year-engineering, /mba: working official-resource directories. They do not yet have the complete CS showcase or a mechanical 3D experience.

Home and CS remain the main demonstration scope. External links intentionally open official resources.

## Design

The attached Mist / Teal / Deep Teal / Orange palette is sampled in src/elevate.css. Manrope supplies body/wordmark typography; Noto Sans Devanagari supplies Sanskrit. Glass uses native backdrop blur.

News advances every 5s, campus every 3s, recognitions/recruiters every 1s, voices every 5s. Persistent transport/progress rows are removed. Edge arrows reveal near the pointer or keyboard focus; swipe/arrow keys remain. Hover, focus, reading, hidden tabs and offscreen states pause movement. Quick access / desktop navigation provides Background motion; reduced motion is respected.

The mobile dock has one spring pill and only the selected tab's label. It is hidden on desktop and department detail routes.

## Deployment metadata

No deployment domain was supplied. Demo builds use noindex, nofollow and omit guessed canonical/OG URLs. All twelve static entries have route-specific title/description/OG/Twitter metadata. Set VITE_SITE_URL to the approved deployment URL before building to emit canonical and OG URLs and allow indexing. Verify with pnpm check:metadata.

This does not configure hosting, subdirectory asset routing, institutional approval or server rewrites. Verify direct route reloads on the target host before publication.

## Current documentation

- [Fresh full-project and image check](docs/FINAL_PROJECT_CHECK.md)
- [Baseline comparison](BASELINE_AND_VERSION_COMPARISON.md)
- [Design rules](docs/DESIGN.md)
- [Admissions reconciliation](docs/ADMISSIONS_DATA_RECONCILIATION.md)
- [Official benchmarks](docs/BENCHMARK_RESEARCH.md)
- [Media recovery audit](docs/MEDIA_RECOVERY_AUDIT.md)
- [Prioritised findings](docs/ELEVATE_ISSUES.md)
- [Current verification](docs/ELEVATE_VERIFICATION.md)
- [Before and after](docs/BEFORE_AFTER.md)
- [Workflow checks](docs/ELEVATE_WORKFLOW_VERIFICATION.md)
- [Video audit](docs/CAMPUS_VIDEO_AUDIT.md)
- [Client walkthrough](docs/CLIENT_WALKTHROUGH.md)

docs/VERIFICATION.md, CHANGELOG_V13.md and qa-v*.mjs are historical, not current proof. Fresh evidence goes into ignored qa/elevate/. Missing historical reports are not fabricated.

Raw captures, duplicate masters, public.zip, Git metadata, dependencies and generated dist are excluded from source delivery. Recovery material remains outside the app at D:/SNJB/.research/elevate-20261016/.
