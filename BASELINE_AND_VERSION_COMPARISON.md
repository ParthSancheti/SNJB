# Baseline and version comparison — 16 October 2026

## CONFIRMED: selected source baseline

The supplied `public.zip` is present at the project root. Its SHA-256 is
`878a32fa5611b271cc673a19cda9bdb85a60fd7dfe2b7277817b0f9cf3472b94`.
It contains 963 files: 502 source/runtime files and 461 generated dist files.
The pre-edit local files match its source files after CRLF/LF normalization.
No ZIP source file is missing locally, including DepartmentPage, AuditPage and
ImageViewer. Their actual implementations were read; they will be preserved.

A separate remote clone identifies default branch `main`, commit
`6f7c8c45df913e503468c4474186f498900ba1f5`, with 498 files.
The clone used the local Git object cache with `--dissociate`; it has independent
objects, the actual GitHub origin and the remotely verified commit/tree.
There are 21 content differences after line-ending normalization and
465 ZIP-only paths, mostly generated dist plus the four missing source
components/styles. No file exists only in the GitHub clone.

Decision: keep the complete ZIP-equivalent working source. Do not reset it to
GitHub. Generated dist is reproducible and remains excluded from Git. The
unmodified ZIP, safe extraction, complete working-tree snapshot, clone,
comparison inventory and SHA-256 inventories are preserved separately under
`D:/SNJB/.research/elevate-20261016/`.

## Relevant source differences against GitHub

- `README.md`
- `index.html`
- `public/asset-manifest.json`
- `public/data/navigation-directory.json`
- `scripts/build.mjs`
- `src/App.jsx`
- `src/components/BottomNavigation.jsx`
- `src/components/CampusGallery.jsx`
- `src/components/CinematicHero.jsx`
- `src/components/ContentRail.jsx`
- `src/components/DesktopNavigation.jsx`
- `src/components/HomeContentSpotlight.jsx`
- `src/components/NewsStrip.jsx`
- `src/components/SearchDialog.jsx`
- `src/components/ui.jsx`
- `src/layers.css`
- `src/main.jsx`
- `src/pages/ComputerEngineering.jsx`
- `src/pages/Home.jsx`
- `src/pages/VisitorPage.jsx`
- `src/v13-ui.css`

## STATIC FINDINGS awaiting runtime verification

- The upgraded ZIP reintroduces persistent carousel controls/progress lines.
- BottomNavigation renders all four labels, contrary to the requested active-only pill.
- Static route HTML inherits Home canonical/Open Graph fields.
- README links to absent historical documents.
- The supplied palette must replace the purple/blue/rose ambient fields.

## Recovery sequence

1. Preserve both versions and current working tree before edits.
2. Create a dedicated local recovery branch and commit the ZIP-equivalent source.
3. Run install/content/build and browser baseline checks.
4. Apply focused changes, commit them on the recovery branch and retest.
5. Do not push, reset or overwrite upstream main during this operation.

Current tests are recorded separately; 15 October reports remain historical.
