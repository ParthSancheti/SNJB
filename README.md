# SNJB Engineering - runnable website

Complete React/Vite source for Home, Computer Engineering, Campus life, Apply
and the college resource directory. Current images, licensed self-hosted fonts,
original factual content and both desktop/phone campus films are included.
This is the runnable project, not the earlier Gemini review-only package.

## Start

Use Node.js 22.12+ and pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://127.0.0.1:4173/. For a production build:

```sh
pnpm build
pnpm preview
```

The build creates direct entries for /, /computer-engineering, /student-life,
/apply and /explore. Deploy at a domain root; assets use root-relative paths.

## What is included

- All current application source, dependency lock and build configuration.
- Current campaign WebP assets, portraits, recruiter logos, event photographs,
  optimized documentary images, font files/licences and icons.
- Separate current desktop and phone videos with matching posters.
- Runtime JSON, preserved Home/department facts and source/provenance metadata.
- Current build, content, accessibility, navigation, motion and touch checks.

Raw masters, duplicate full-size documentary captures, obsolete video versions,
historical working kits, old QA scripts, hosting metadata, node_modules, dist,
Git history and temporary outputs are excluded. Original source URLs and hashes
remain recorded; documentary delivery files are preserved without modification.
The cleanup changes project contents, not website design or institutional facts.

## Verify

```sh
pnpm check:content
pnpm build
pnpm exec vite preview --host 127.0.0.1 --port 4178 --strictPort
```

With that preview running, execute pnpm check, pnpm check:materials,
pnpm check:motion, pnpm check:touch and pnpm check:navigation as needed.
Checks use installed Chrome; reports go to the ignored qa directory.

The guide performs local source-linked search, without an AI backend.
[Design contract](DESIGN.md) and [cleanup record](docs/CLEANUP.md).
