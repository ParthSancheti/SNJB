# Official benchmark research

Reviewed 16 October 2026 (Asia/Kolkata). These are observed information-architecture patterns, followed by clearly identified recommendations for SNJB. No institutional identity or proprietary imagery is reused.

## Method and evidence limits

Official URLs were read with the web research tool and rendered in installed Microsoft Edge through Playwright. Desktop viewport: 1440 × 900. DOM text, status, redirects and screenshots are retained locally in `qa/elevate/benchmarks/` (ignored by Git). Screenshots capture one observation, not complete functional/accessibility certification. Cookie/loading overlays or changing banners can affect a capture. Automated Chromium's default binary was absent; using installed Edge worked.

## IFHE Hyderabad

Source: [official homepage](https://ifheindia.org/). **CONFIRMED:** HTTP 200. Audience navigation includes students/applicants, parents, alumni, employers, faculty and employees. Academic programmes have separate UG/PG/doctoral paths and department/level/programme selects. The desktop “Information For” hover exposed parent/employer/faculty/employee links.

**Strength:** visitors can begin with their own role rather than institutional department names. **Observed limitation:** multiple navigation levels and a long homepage compete for attention.

**RECOMMENDATION:** add a small role-based set of shortcuts inside SNJB's existing Explore directory/search; use real existing destinations. Reject an additional permanent navigation bar or duplicating the complete directory on Home.

Evidence: `ifhe-home.png`, `ifhe-audience.png`; status/details in `benchmark-observations.json`.

## Manipal Institute of Technology

Sources: [MIT homepage](https://www.manipal.edu/mit-manipal), [provided programme-list URL](https://www.manipal.edu/mit/program-list.html). **CONFIRMED:** the old programme-list URL redirects to the current MIT homepage, HTTP 200. UG/PG tabs and school groupings are present. Selecting PG exposed M.Tech programme links. No programme-search form was present on that redirected page during inspection.

**Strength:** degree-level selection reduces the first decision; laboratories and student life have contextual imagery. **Observed limitation:** the supplied reference URL no longer offers the historical dedicated searchable listing.

**RECOMMENDATION:** preserve SNJB's useful programme finder and concise branch distinctions, with links to official academic resources. Reject copying a large university's number of hierarchy levels for SNJB's smaller programme set. Historical “MIT has programme search at this URL” is not asserted as current evidence.

Evidence: `mit-home.png`, `mit-programmes.png`; redirect recorded in JSON.

## BITS Pilani

Source: [official admissions](https://www.bits-pilani.ac.in/admissions/). **CONFIRMED:** HTTP 200. Degree pathways, announcements, programme-specific “Top Resources”, brochures, important dates, fees, FAQs and admissions-office contacts are grouped explicitly. Current-student resources are separated in navigation.

**Strength:** admission tasks remain anchored to the relevant pathway. **Observed limitation:** substantial historical prose and older year labels coexist with current announcements; SNJB should not copy that ambiguity.

**RECOMMENDATION:** make SNJB Apply a route-first task list with visible source dates and distinct enquiry/application language. Reject transplanting BITS-specific programme names, statistics or prospectuses.

Evidence: `bits-admissions.png`, `bits-resources.png`.

## Sathyabama

Source: [official homepage](https://www.sathyabama.ac.in/). **CONFIRMED:** HTTP 200. Dated campus/news entries, events, research indicators, campus/arts/gallery destinations and an admissions enquiry form are present.

**Strength:** news and dated events make current institutional activity discoverable. **Observed limitation:** many parallel news items and mixed date contexts create a dense page; a displayed item timestamp is not necessarily its underlying event date.

**RECOMMENDATION:** use SNJB's existing authenticated event/notice dates and source links in a concise newsroom, with a clear route to the full archive. Preserve the user-requested uncluttered rail; do not copy a research counter without verified SNJB evidence or make the one-second recognition rail the sole way to read records.

Evidence: `sathyabama-home.png`, `sathyabama-news.png`.

## SRM

Source: [official homepage](https://www.srmist.edu.in/). **BLOCKED:** direct Microsoft Edge request returned **403 Forbidden**, and web retrieval failed. The error page was captured as `srm-access-blocked.png`.

No design, performance, mobile or interaction conclusions are claimed for SRM. Revisit from an authorized browser/network before citing it as an inspected benchmark.

## SNJB source architecture

Source: [official engineering homepage](https://snjb.org/engineering/). **CONFIRMED:** its navigation covers academic departments, admissions, placements, examination resources, student services, approvals and disclosures.

**RECOMMENDATION:** keep that coverage in the existing institutional directory and search. Home should introduce high-value journeys and current activity; the complete source archive remains available for depth. Do not turn incidental animated counters into verified placement statistics.

Evidence: `snjb-official.png`. Content inventory and numerical reconciliation are separate documents.

## Motion decisions against primary guidance

[WCAG 2.2 SC 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) requires a way to pause/stop/hide nonessential automatic updates presented with other content; auto-updating information has no five-second exemption. [W3C WAI carousel guidance](https://www.w3.org/WAI/tutorials/carousels/animations/) recommends stop/resume, hover/focus pauses and hiding outgoing slides from assistive technology.

**RECOMMENDATION for this explicit user request:** remove persistent per-rail transport controls and progress lines; show edge arrows on hover/focus, retain swipe/keyboard access, global motion preference and reduced-motion support. Keep focus/reading/hidden-page/offscreen pauses. A one-second rail particularly needs a static full-list destination and a discoverable global motion setting. These safeguards require runtime checks; hover-only controls or an axe pass alone do not establish WCAG conformance.

## Adaptation priorities

1. Keep the authenticated campus video and identity; improve text hierarchy without an unrelated visual overhaul.
2. Make route and resource choices understandable before adding another effect.
3. Distinguish base intake, TFWS and live availability; expose provenance beside admissions figures.
4. Restore authentic missing media from the preserved baseline before creating replacements.
5. Keep phone navigation compact: one active labelled pill, inactive icons, clear focus and safe-area spacing.
6. Use hover motion on idea tiles as feedback; reduced-motion users get an immediate stable state.

Items above are recommendations. Implementation and browser results belong to the new audit report, not this benchmark record.

