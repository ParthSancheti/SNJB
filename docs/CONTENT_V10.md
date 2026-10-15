# Home content V10 — source audit and visitor journeys

Reviewed on 14 October 2026. This refinement covers the Engineering homepage, its original resource destinations, and the existing Computer Engineering demonstration. The homepage preservation result below does **not** mean every page in the institution’s website has been rebuilt.

## What the live comparison proves

`python scripts/audit-home-content-v10.py` fetched the current [official Engineering homepage](https://snjb.org/engineering/) into an ignored QA file and compared it with the preserved snapshot. The original snapshot was not overwritten. All ten meaningful content groups matched, with no original navigation destinations added or removed.

| Source content | Preserved count | Where a visitor finds it |
| --- | ---: | --- |
| About paragraphs | 2 | A concise campus introduction, including 2004 / 2010 / 2020 history; exact paragraphs in Official homepage resources |
| Vision and mission | 1 vision, 4 mission statements | Campus → Our vision & mission, with the published wording intact |
| Achievements | 9 | Three recognition links for a quick overview; Our recognition, through the years exposes all nine original records and evidence images |
| Notices | 2 | Campus journal → Notice board; original placeholder links remain recorded in the archive |
| Events | 4 source entries, 3 distinct events | Campus journal → What’s happening; the duplicate orientation entry becomes one event with both original photographs |
| Testimonials | 10 complete quotations and attributions | Campus journal → Community voices, with manual controls, a direct name selector and full-quote expansion |
| Recruiters | 34 source logos and names | Careers & placements → Recruiters, expandable from eight logos to the full set |
| Homepage photographs | 4 | Original photographs remain accessible in Official homepage resources; the campaign presentation is separately labelled |
| Campus tour | 1 original destination | Early campus section → Explore the 360° tour; original link retained in the archive |
| Admissions body wording and links | Original block retained | Current admission routes use the canonical FY B.Tech destination; the original admission copy and older body destination remain explicitly archival |
| Placement counters | 4 original records | Original HTML zeros and undated animation targets remain in Source snapshot & corrections; current visible results use the dated placement tables |
| Original link records | 333 | Source snapshot, complete resource directory, search and hierarchical navigation |
| Original image asset records | 63 | Original downloaded images and provenance remain preserved; no branding or certificate evidence is AI-redrawn |

Machine-readable evidence: `public/data/homepage-audit-v10.json`. Original snapshot SHA-256: `18ad6d2d404374843f533d0dcfe4f9a02417f71bae1c51b4b9d5dfb30866df54`.

The counts include repeated links and placeholders because they are original records. The directory resolves the 234 unique usable destinations; a placeholder is not turned into an invented page. Source scripts, analytics, broken interactive widgets and a visitor counter are not embedded in the new UI.

## Information order

The homepage answers six questions in order:

1. **Where am I?** Film, institutional name and the exact supplied tagline.
2. **What is SNJB?** Location, affiliation, history, people, recognition and published purpose.
3. **What can I study?** Five undergraduate disciplines; separate M.Tech, MBA and Ph.D. routes; optional current published B.Tech intake.
4. **How do I learn and live here?** IDEA Lab, student projects, syllabus and library, followed by three compact expandable groups for student life, everyday resources and the wider community.
5. **What do the career records actually show?** A dated engineering summary, an explicit entire-college comparison, department details, placement-cell contact, history and recruiter evidence together.
6. **How do I stay informed and apply?** Events, notices and real community voices; admission routes with fees, support and contacts; complete resources at the end.

The four early wayfinding links and root’s four-tab floating navigation complement this reading order. We preserve breadth through clear progressive disclosure instead of displaying hundreds of links or a long row of full-size cards.

## Placement recheck

Primary sources opened and checked: [Department Placement Statistics](https://snjb.org/engineering/placements/dept-placement-statistics), [annual Placement Statistics](https://snjb.org/engineering/placements/placement-statistics), [About Placement Cell](https://snjb.org/engineering/placements/about-placement-cell) and [Our Recruiters](https://snjb.org/engineering/placements/our-recruiters).

| Academic year and scope | Placements | Offers | Maximum published package |
| --- | ---: | ---: | ---: |
| 2025–26 · five engineering departments | 134 | 189 | ₹9,00,000 |
| 2025–26 · whole college, including MBA | 215 | 270 | ₹9,00,000 |
| 2024–25 · five engineering departments | 162 | Not published | ₹11,50,000 |
| 2024–25 · whole college, including MBA | 219 | Not published | ₹11,50,000 |

Engineering summaries are calculated by adding AI&DS, Civil, Computer, E&TC and Mechanical. The original college totals include MBA. The Home default is engineering so a reader is not shown MBA-inclusive totals as engineering outcomes.

| Department | 2025–26 placements | 2025–26 offers | 2025–26 maximum package | 2024–25 placements | 2024–25 maximum package |
| --- | ---: | ---: | ---: | ---: | ---: |
| AI & Data Science | 24 | 27 | ₹9,00,000 | 21 | ₹6,00,000 |
| Civil | 16 | 20 | ₹6,00,000 | 19 | ₹4,60,000 |
| Computer | 35 | 54 | ₹9,00,000 | 66 | ₹11,50,000 |
| E&TC | 21 | 21 | ₹8,00,000 | 16 | ₹5,00,000 |
| Mechanical | 38 | 67 | ₹9,00,000 | 40 | ₹8,00,000 |
| MBA | 81 | 81 | ₹5,00,000 | 57 | ₹6,00,000 |

The annual college record also publishes 232 placements for 2022–23 and 236 for 2023–24. These are available in the optional four-year history. Older engineering-only figures are not manufactured from an annual college total.

The annual page marks 2025–26 as `2025-26*` but does not explain the asterisk. The UI retains it with that limitation. The department table labels package amounts in rupees without specifying an annual salary period, so the refined Home uses rupees/lakh rather than silently relabelling them LPA. No placement rate, current average salary, eligible-student denominator or recruiting cutoff is invented. A testimonial’s individual package is not used as a cohort-wide metric.

The downloadable placement-list index on the source page stops at 2022–23. Its source link remains available, but we do not invent 2024–26 student-list PDFs. The placement email promoted here, `tpocoe@snjb.org`, comes directly from the published placement-cell page.

## Admissions and academic resources

The [canonical FY B.Tech page](https://snjb.org/engineering/admissions/fy-btech) gives current total intake including TFWS: AI&DS 158, Civil 63, Computer 189, E&TC 63 and Mechanical 95. The new optional intake disclosure labels the academic year and distinguishes sanctioned intake from available seats. Full CAP, minority, institute-level and TFWS values are retained in `src/data/admissions-v10.json`, with arithmetic verification.

The old `/admissions/first-year-engineering` body link is not used as the active admission CTA. The original destination remains in the source archive so the preservation claim does not hide the original inconsistency.

The [M.Tech page](https://snjb.org/engineering/mtech) lists Civil, Computer, E&TC and Mechanical, with current admission activity; its visible syllabus/timetable entries are labelled 2024–25. The homepage offers an appropriately labelled official information link rather than describing those older documents as the current curriculum. The [Ph.D. page](https://snjb.org/engineering/phd) supports the added research route.

Fees link to the [AY 2026–27 FRA page](https://snjb.org/engineering/fra-fees-structure-ay2026-27). Syllabus links use the [autonomy syllabus source](https://snjb.org/engineering/syllabi-autonomy), which includes the 2026–30 cohort; the promoted academic calendar uses the exact original destination, which publishes 2026–27 Semester 1.

All twelve newly promoted student-service links are checked against the original resource destinations. They include student council, sports, NSS, SPACE, the academic calendar, scholarships, student welfare, student ERP, research/IPR, the alumni portal, NPTEL and Impetus. Source pages are linked rather than replaced with guessed service descriptions or private portal content.

## Reference research and what changed because of it

| Primary reference actually visited | Useful pattern | Applied to SNJB |
| --- | --- | --- |
| [BITS Pilani](https://www.bits-pilani.ac.in/) | A clear task selector and programme finder; distinct research, community, updates and placement areas | Strengthen actionable resource shortcuts; separate programme levels; put practical study and campus services into compact groups |
| [MIT Manipal](https://www.manipal.edu/mit-manipal) (the user’s `/mit.html` redirects here) | UG/PG programme browsing, placement evidence alongside recruiters, separate student life, voices and news | Replace the generic postgraduate banner with three real routes; move recruiter evidence into the career section; give student life and services a direct place |
| [MIT School of Engineering](https://engineering.mit.edu/) | Discipline descriptions and routes to learning, laboratories, people and student stories | Keep programme exploration brief; connect it to local Computer Engineering faculty, labs and published student work |

These are information-design adaptations. SNJB does not inherit the other institutions’ programmes, rankings, companies, collaborations or outcome claims. The native source identity and content remain SNJB’s.

## Supplied audit disposition

The supplied Word audit was read as source guidance, not executed as instructions. Relevant Home findings addressed here are the zero/undated KPI problem, MBA-inclusive placement scope, conflicting older first-year route, unexplained placement asterisk, missing recent placement-list evidence, current-versus-historical M.Tech resources and unclear accessibility of the website’s breadth.

The redesign cannot redirect or correct pages on the independently hosted original `snjb.org` site. Historical MBA admission items and other upstream governance defects remain documented; this preview does not falsely announce that the source institution’s CMS has been repaired.

## Validation

`node scripts/qa-content-v10.mjs` verifies the unchanged archive hash, fresh live-content comparison, all nine recognition titles, arithmetic for placement scopes and intake, the original destinations of the twelve promoted services, UG/PG routes, two-year placement switches, department detail rows, MBA inclusion, historical figures, recruiter placement, notices/events/voices, unique IDs, viewport overflow and WCAG axe checks.

Expanded-state checks cover all nine recognition entries, current intake, all student-service groups, each placement scope and year, the four-year history and all 34 recruiter logos. Independent production inspection found that the initially opened placement table forced its parent wider than a phone screen. The grid children now allow a zero minimum width, and the table scrolls inside its own wrapper; the complete source table is retained.

The V10 production content checks passed at 320, 390 and 1440 pixels in both themes. V11 promotes the same records into visible recognition/recruiter rails, mission and student-service sections; the current layout is validated separately. The root’s final verification records production-build outcomes separately; browser emulation is not a claim of testing on physical iOS or Android hardware.

## V11 presentation and second source review

On 15 October the department and annual placement pages were revisited; figures and scope distinctions remain unchanged. Desktop now offers the complete original hierarchy from the top navbar; the phone dock opens separate Home, Campus life, Explore and Apply pages. The phone emblem is only Quick access. All nine recognition records and 34 recruiter marks are available in visible user-controlled rails; exact vision/mission and all twelve campus-service links no longer require dropdowns. The early bulletin reuses the two published notices and does not invent an upcoming event. Source archives and the V10 comparison remain unchanged. See DESIGN.md and VERIFICATION.md for the current contract and checks.

The final V11 production content run passed all six 320/390/1440 light/dark cases on 15 October. The responsive navigation run passed twelve viewport/theme cases, and film/fallback checks passed five cases. Generated QA records remain local under `qa/`.

## V12 content placement and presentation

On 15 October, the next revision keeps the original snapshot and every institutional fact unchanged. The new early news composition uses the source's 18 October 2026 Avishkar notice and the published 9 October voter-awareness / 21 September orientation events. An accompanying project-laboratory photograph is labelled illustrative; it is not claimed as an Avishkar event photograph. The two original notices still remain on the notice board and in the archive.

The graph uses the same department rows as the placement table. Engineering and whole-college scopes remain distinct, with the source's missing 2024–25 offers shown as missing rather than inferred. Graph series animate when selectors change; colours identify placements/offers, not outcomes or guarantees.

The complete mission text, nine dated recognition records, twelve service destinations, 34 recruiter marks and ten unabridged source quotes remain available. Automatic carousels stop when reading/interacting, under overlays, offscreen, under reduced motion or saved motion OFF. All records have manual navigation. The testimonial chooser was removed; arrows/swipe and the full original archive preserve access to every quote. The archive now opens through one compact icon-labelled entry into seven record groups; no source group was removed.

Navigation categories now come directly from the original institution hierarchy. The desktop primary items no longer merely scroll Home. Mobile dock destinations remain Home/Campus/Explore/Apply, with no dock on Computer Engineering and no site footer on secondary pages. See [V12 design](../DESIGN.md) and [current verification](VERIFICATION.md).
