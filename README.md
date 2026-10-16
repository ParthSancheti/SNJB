# SNJB College of Engineering — Next-Generation Institutional Website (Project ASTRA)

Complete React 19 + Vite 8 + Three.js + Motion institutional website for **SNJB’s Late Sau. Kantabai Bhavarlalji Jain College of Engineering, Chandwad (Nashik, Maharashtra)**.

## Key Highlights of This Build

1. **12 Internal Institutional Routes:**
   - `/` — **Flagship Homepage** (15s campus film hero with Play/Pause control, 4-card wayfinding bar, live *Happening at SNJB* event carousel, *Our College* + *Leadership & Autonomous Governance* strip, *Vision & Mission*, 9 inspectable recognition certificates with Lightbox, UG/PG Programme Finder, AICTE IDEA Lab & Learning grid, 12 Student Services, interactive *Career Outcomes & Department Placement Chart*, *Campus Journal & Community Voices*, and *Admissions Pathway*).
   - `/computer-engineering` — **Computer Engineering Flagship** (Batch-specific Curriculum Finder, Laboratories Bento, searchable 37-person Faculty & Staff directory, documented Student Projects, interactive 3D Processor model, Placements, SPACE & CSI communities, and collapsible 16-section Archival Web Records drawer).
   - `/ai-data-science` — **Artificial Intelligence & Data Science** (158 seat intake matrix, placement outcomes, highlights & 11 official subpages).
   - `/civil-engineering` — **Civil Engineering** (NBA Accredited 2025, 63 seat intake, placement outcomes & 11 official subpages).
   - `/electronics-telecommunication` — **Electronics & Telecommunication** (NBA Accredited 2025, 63 seat intake, placement outcomes & 11 official subpages).
   - `/mechanical-engineering` — **Mechanical Engineering** (NBA Accredited 2022, 95 seat intake, 38 placements / 67 offers, interactive **3D Slider-Crank Kinematics Model** & 10 official subpages).
   - `/first-year-engineering` — **Engineering Science & First-Year Engineering** (568 total B.Tech seat matrix, foundational labs & 10 official subpages).
   - `/mba` — **MBA (Master of Business Administration)** (NBA Accredited 2025, 81 placements in AY 2025–26, BoS & 10 official subpages).
   - `/apply` — **Admissions & Interactive Enquiry Hub** (Route selector, validated **Admissions & Campus Visit Enquiry Form** with 1-click WhatsApp/Email handoff, clickable 5-branch seat matrix, FRA fees, scholarships & hostels).
   - `/student-life` — **Campus Life & Student Services** (12 student-service pathways, 360° virtual tour, events, notices & community voices).
   - `/explore` — **Complete 333-Link Resource Directory** (9 institutional categories, folder breadcrumbs & instant search).
   - `/audit` — **Project ASTRA Source & Provenance Registry** (SHA-256 snapshot verification, placement arithmetic logs & media provenance).

2. **Project ASTRA Documentation Suite (`docs/`):**
   - [`docs/PROJECT_BRIEF.md`](docs/PROJECT_BRIEF.md)
   - [`docs/RESEARCH_AND_BENCHMARKS.md`](docs/RESEARCH_AND_BENCHMARKS.md)
   - [`docs/EXISTING_SITE_AUDIT.md`](docs/EXISTING_SITE_AUDIT.md)
   - [`docs/SITEMAP_AND_USER_JOURNEYS.md`](docs/SITEMAP_AND_USER_JOURNEYS.md)
   - [`docs/CONTENT_MIGRATION_MATRIX.md`](docs/CONTENT_MIGRATION_MATRIX.md)
   - [`docs/SOURCE_OF_TRUTH.md`](docs/SOURCE_OF_TRUTH.md)
   - [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md)
   - [`docs/MEDIA_ASSET_REGISTER.md`](docs/MEDIA_ASSET_REGISTER.md)
   - [`docs/DEVELOPMENT_PROGRESS.md`](docs/DEVELOPMENT_PROGRESS.md)
   - [`docs/QA_REPORT.md`](docs/QA_REPORT.md)
   - [`docs/DECISIONS_AND_ASSUMPTIONS.md`](docs/DECISIONS_AND_ASSUMPTIONS.md)
   - [`docs/LAUNCH_CHECKLIST.md`](docs/LAUNCH_CHECKLIST.md)

## Quick Start

Use Node.js 22.12+ (or Node 18+) and `pnpm`:

```sh
pnpm install --frozen-lockfile
pnpm check:content
pnpm dev
```

Open `http://127.0.0.1:4173/`. For a production build:

```sh
pnpm build
pnpm preview
```
