# Admissions data reconciliation

Audit date: 16 October 2026 (Asia/Kolkata). Research is fresh; earlier project QA is historical.

## Decision

**CONFIRMED:** Preserve the current 568-seat breakdown. Direct official-page rendering, the AY 2026–27 AICTE approval and the Maharashtra CET institute record support the same programme totals. A cached older FY B.Tech result and an undated legacy BE page explain the reported discrepancy; neither is evidence that the current JSON is wrong.

These are capacity figures, not admitted-student counts or live vacancies. The 568 includes 28 TFWS seats; the approved base capacity is 540. Retaining the numbers does not certify live vacancy availability.

## Current evidence

| Record | Scope and date | Finding |
| --- | --- | --- |
| [SNJB FY B.Tech](https://snjb.org/engineering/admissions/fy-btech) | Direct Edge HTTP 200 on 16 October; current page links AY 2026–27 notices/fees | Matches every current JSON category and total. The intake table has no standalone academic-year/date label. |
| [AICTE EoA 2026–27, pp. 1–2](https://snjb.org/engineering/uploads/media/2026/05/EOA_Report_2026-2027.PDF) | Approval 5 May 2026; printed 6 May 2026 | Base capacities 150, 60, 180, 60, 90. |
| [CET institute 05173](https://fe2026.mahacet.org/StaticPages/frmInstituteSummary?InstituteCode=05173) | Explicit AY 2026–27; direct Edge HTTP 200 | Same base capacities, plus separate TFWS choice-code rows: 8, 3, 9, 3, 5. |
| [AICTE EoA 2025–26, pp. 1–2](https://snjb.org/engineering/uploads/approvals-regulations-and-achievements/EOA-2025-26.PDF) | Approval 5 April 2025; printed 12 April 2025 | Previous base capacities 120, 60, 180, 60, 60. |
| [Legacy First Year Engineering](https://snjb.org/engineering/admissions/first-year-engineering) | Intake undated; surrounding content mixes 2022–23 merit, 2023–24 documents/fees and a 2024–25 notice | Different BE table; cannot assign its intake to one proven academic year. Preserve as historical evidence. |

The current SNJB HTTP response supplied a Date header but no Last-Modified or ETag. Retrieval date is not publication date. The approval letter establishes its own date.

## Current programme arithmetic

Values transcribed from the live FY B.Tech table and compared with `src/data/admissions-v10.json`. The base and final columns are independently calculated.

| Programme | CAP excluding minority | CAP minority | Institute | Base | TFWS | Including TFWS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| AI & Data Science | 43 | 77 | 30 | 150 | 8 | 158 |
| Civil | 23 | 31 | 6 | 60 | 3 | 63 |
| Computer | 52 | 92 | 36 | 180 | 9 | 189 |
| E&TC | 17 | 31 | 12 | 60 | 3 | 63 |
| Mechanical | 32 | 46 | 12 | 90 | 5 | 95 |
| **Total** | **167** | **277** | **96** | **540** | **28** | **568** |

All five rows and the aggregate add correctly. AICTE verifies base capacities; CET verifies the base/TFWS separation. CAP/minority/institute subdivisions match the current college page, but were not independently revalidated against the full state seat matrix. The [state matrix PDF](https://cappublicdocs2026.blob.core.windows.net/documents/2026_fe_seatmatrix_V1.pdf) exceeded the research tool's document-size limit. No category redistribution has been inferred.

## Why the earlier figures differ

An older search-index version of the same FY B.Tech URL shows totals **126 / 63 / 189 / 63 / 63 = 504**, with 2025–26 fee/CAP links. Its base values align with the 2025–26 approval, but the cached extract is not a dated publication or a current page. It must not overwrite the direct 2026 observation.

The separate legacy BE table states totals **63 / 63 / 158 / 63 / 63 = 410**. Treating its institute dashes as zero yields **409**, because E&TC lists **2 + 29 + 31 = 62** while stating 63. This is a confirmed arithmetic discrepancy in that source, not permission to correct the institution's historical record silently.

## Code findings and safe follow-up

- **STATIC FINDING:** Home labels 05173 a “DTE Choice Code”; CET identifies it as the **Institute Code**, with distinct longer programme choice codes. Correct that label.
- **STATIC FINDING:** Home and Apply copy promises intake/seat splits and placements on every department view, while the examined `DepartmentPage.jsx` is currently an official-resource directory. Align the promise with the actual destination.
- **RECOMMENDATION:** Add the AICTE and CET URLs, review date, base/TFWS distinction and scope to provenance. Use “published capacity including TFWS” rather than implying seats remain available.
- **RECOMMENDATION:** Keep 2025–26 and undated records separate from the current presentation.
- **MANUAL REVIEW:** Ask the college to identify/retire the legacy BE page and confirm the live CAP category allocation before production admissions use. An official enquiry handoff remains distinct from a submitted application.

No code or JSON admission numbers were changed by this research task. See the implementation changelog for any subsequent copy/provenance changes.

## Reproducible evidence

Fresh rendered evidence is retained locally under `qa/elevate/benchmarks/` (ignored by Git). The JSON records requested/final URLs, HTTP status, page title, source table rows and observation timestamp; screenshots show the table context. Browser: installed Microsoft Edge through Playwright's `channel: 'msedge'`. These observations do not establish institutional approval of the demo.

