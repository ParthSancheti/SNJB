# SNJB design contract — V13 / campus film V10

Updated 15 October 2026. V13 supersedes the earlier material and carousel contracts, following the request for controls-free five-second rotation. Home and Computer Engineering remain the principal demonstration, with useful Campus life, Apply and complete-directory pages. Other institutional services retain official SNJB destinations.

## Desktop navigation and search

At 1024px and above, show actual original directory categories: About, Academics, Admissions and Placements. They open the matching institutional hierarchy rather than scrolling Home. College menu is the all-category entry, with a compass emblem. All nine groups and every original nested destination remain reachable.

Mouse hover opens a category or nested folder. A 150ms grace period allows moving across the header/panel gap. Leaving the complete header/panel region closes a hover-open menu. Clicking pins it; moving away then leaves it open. Escape, outside click, the close control or a destination closes it. ArrowDown opens and enters the hierarchy; folders also work by click/touch/keyboard. Category selection and links remain distinct controls.

The panel is portalled directly into the fixed header, beside the filtered header-inner. This avoids an ancestor backdrop-filter fencing off the panel's blur. The panel uses a native 38px/175% backdrop with translucent light/dark gradients and bounded content scrolling. The menu is a navigation region, not a modal.

Search starts as a compact frosted pill. On desktop it expands from the pill's measured bounds to the navbar's width/top, with a text field, compact two-column results below, a tiny edge fade, directory access and guide access. It is height-bounded to the viewport rather than a fullscreen desktop slab. On mobile, the measured search icon expands into a viewport-bounded glass sheet. Two initial animation frames allow the material to paint before the expansion; text resolves through a brief blur, with a light sweep through the glass. Search preserves directory ranking, aliases, retry, keyboard arrows, focus trapping and restoration. The guide remains local source-linked lookup, without a language-model backend.

## Phone and tablet

Below 1024px, the emblem opens Quick access: practical shortcuts, directory access, appearance and motion. It springs outward from the emblem with a brief refraction and staggered shortcuts. A separate page backdrop blurs 16px and its own glass is 38px/175%; focus stays inside and returns to the emblem on dismissal. The header search symbol is 22px with a broader 2.25 stroke.

The floating glass dock only belongs to the four destinations Home `/`, Campus `/student-life`, Explore `/explore`, Apply `/apply`. Computer Engineering has no dock. One active icon/text spring pill accompanies three accessible icons; target dimensions remain at least 44px. Ask SNJB sits above the dock. Safe-area and end padding prevent final content from falling underneath it.

Each destination is a real page. Campus life gives photo-led communities and twelve original student-service routes, visit resources and community stories. Apply gives icon-labelled route selection, official process links, visible current intake, dated fees/scholarship/hostel/contact links and PG/research routes. It does not accept applications. Explore preserves all nine folders and nested destinations, local search and keyboard breadcrumb navigation.

Phone lists remain naturally page-scrollable. Desktop Explore has a bounded list. New rows gently enter from 97.5% to full scale, with opacity/position feedback. Only the top/bottom 5px edge uses a concentrated progressive blur; reading text stays sharp. Use 16px search input text and meaningful 44px controls. Compactness must not make important links unreadable.

Only Home has the site footer. Its small formal name sits above an emblem and large SNJB on one line, followed by College of Engineering and the small COE/location. The footer is full-width glass with rounded top corners only.

## Home composition

Keep the authentic film-led opening. Give the larger icon/heading/description wayfinding actions 44px breathing room after the hero. The next editorial area is Happening at SNJB: three live-text photographic banners drawn from the published Avishkar notice, voter-awareness event and orientation event. Preserve their source dates. The project-lab photograph beside the Avishkar notice is explicitly illustrative, not a claimed event photograph. No new event or deadline is invented.

Campus, Study, Learning, Outcomes, Journal and Admissions have visible section boundaries, deliberate outer spacing and common glass material. Phone panels have narrow gutters, moderate corner radii and compact type; the campus identity composition is retained.

The campus image pair moves in equal opposite vertical directions, fading/blurring out while the next image enters. It cycles the four existing source/campaign photographs without headings, captions or native scrollbar. No fullscreen-photo, next, previous or pause controls are shown. Swipe and keyboard arrows retain access to every item. Original/AI-treatment provenance remains below the pair.

Knowledge with purpose is an editorial purpose panel: one larger vision statement beside four numbered mission principles, with the exact original wording. The vision icon and heading share one row. The subtle Devanagari accent is decorative. All nine recognition records form a compact automatic rail; show three desktop/two tablet/one phone entry with a glimpse of the next. Preserve certificate wording/dates and avoid a blanket current-accreditation claim.

Find your field retains five undergraduate branches and actual M.Tech/MBA/Ph.D. routes. Place a discipline icon before the title. Right-edge imagery fades into glass. Desktop hover changes the field tint, turns the small discipline symbol and enlarges the arrow toward the centre of the image; it does not cover the text or change the click destination. Phone gets a compact 137px-minimum touch row with its discipline icon beside the title, moderate type and masked right-edge photography. Sanctioned intake includes TFWS and is not vacancies.

Make room for ideas uses photographic learning tiles, with a featured tile and compact secondary phone tiles. Twelve direct student-service routes follow in three photo-led groups, clearly separated from learning. All photographs retain their provenance and context; Computer lab imagery beside IDEA Lab is labelled Computer lab / AI-treated rather than claimed as the IDEA Lab facility.

Published career outcomes are accompanied by a department bar chart using the same source rows and common per-chart scale. Animate bars and numerical changes when year/scope changes. Missing offer totals hide that series; no inferred offers or percentage is shown. Exact counts also remain in the full accessible source table. Recruiter marks sit beside outcomes and automatically advance, retaining all 34 marks without a native scrollbar.

Community voices automatically advance through all ten original quotes, one phone/two desktop. Swipe and keyboard arrows replace control rows and the select dropdown. Opening a complete quote pauses rotation until it is collapsed and focus/hover leave the section. Full source quotes remain unchanged in the original-record archive as well.

Admission routes have transition feedback and desktop hover/focus selection. Practical links use relevant icons and clear contact context. The archive is a compact icon-labelled entry, expanding to seven useful record groups with counts and full preserved content. A loading spinner appears during a real deferred resource load, not as an artificial introductory delay.

## Motion behavior

News, campus images, recognitions, recruiters and voices advance every 5,000ms of active viewing. No media control buttons or clickable pagination are shown. A small decorative progress line indicates time. Manual swipe/arrow movement restarts the cadence rather than leaving an invisible permanent pause. Timers stop offscreen, while the document is hidden, under a menu/dialog/route cover, on hover/focus, under saved Background motion OFF and for reduced motion. No timer scrolls the page. Reduced-motion visitors retain native horizontal scrolling, swipe and keyboard arrows with immediate updates. Expanded source quotes remain in the original-record archive. Pointer cancellation/window blur release a touch hold; replacement of a focused quote cannot leave stale focus blocking motion.

Internal navigation expands a rounded glass sheet from the clicked element into the viewport, then reveals the destination. It blocks click-through while the transition is visible; a pending navigation cannot be overwritten by another action. Reduced motion bypasses the expansion. Theme changes reveal radially from their control. Only the hero boundary/first wayfinding area use proximity scroll snap; reading sections remain free.

The campus video resynchronizes using actual geometry on visibility, focus, pageshow, canplay and decoded-data events. Offscreen playback pauses; returning to Home must advance actual video time/frames, not merely report paused=false. A stale IntersectionObserver value is not the authority when a tab or cached page returns.

## Film, material and source integrity

Active V10 retains the authentic 2019 sequence with fixed desktop crop, selective vibrance, 450 frames/30fps/15-second eased silent loop and matched first-frame posters. Phone is 720×1280; desktop is 1920×1080. The corner source logo lies outside the desktop crop. There is no hero Pause control; saved Background motion stops video/orbs. Reduced motion and save-data request no MP4; failed video retains a poster. No scroll blur is applied to the film. See [provenance](public/media/media-v10-provenance.json).

Canvas is #f0f4f8 / #050508. Four ambient orbs travel and rotate using light 0.22/multiply and dark 0.18/screen. Translucent structural glass, readable popovers and search retain native backdrop filtering. Header, dock, footer, guide and hero actions use a common liquid-glass vocabulary: transparent fills, native blur, fine lit edges and soft inner reflections. The two hero actions use identical clear glass with white text over the film in both themes. A translucent navy tint and text shadow maintain dark-header legibility over bright video frames. Overlay panels use the current page colours and a low-tint background blur rather than an opaque black sheet. Image shimmer appears only during actual loading, with a soft decoded-image reveal and reduced-motion fallback; no artificial introductory loader is added. Theme applies before first paint. Manrope, DM Sans, Devanagari and Instrument Serif are self-hosted with original OFL licences.

The Home archive remains unchanged: ten meaningful source groups, 333 link records, 63 body images, nine recognitions, two notices, four original event entries, ten testimonials and 34 recruiters. Display three unique events because orientation repeats, preserving both original records. [Content audit](docs/CONTENT_V10.md) records the comparison and source/correction map.

Placements distinguish five engineering branches from the whole college including MBA. 2025–26 engineering is 134 placements/189 offers; college is 215/270. 2024–25 engineering is 162 placements and college 219; offers are not published. Preserve the unexplained asterisk and rupee package units, without inventing an annual salary period, placement rate or guarantee. Older annual totals explicitly include MBA.

Computer Engineering retains all 16 sections, 50,115 text characters, 55 tables, 146 image references and 37 authentic faculty/staff identities/fields. Original portraits, certificates, recruiter marks and documentary evidence are never generatively replaced. Optional processor 3D is deferred and rendered on demand.

## Research and verification

[BITS Pilani](https://www.bits-pilani.ac.in/) informed task-first institutional hierarchy; [MIT Manipal](https://www.manipal.edu/mit-manipal) informed distinct programmes, student life, outcomes/recruiters and community areas. The [Motion project](https://github.com/motiondivision/motion) is the existing animation foundation. V12 uses custom controlled hover, spring, masked-image and opposing-column compositions instead of importing an unrelated card template. CSS scrolling and progressive edge filtering follow browser-native behavior. These are design/engineering references, not borrowed SNJB facts or media.

See [current verification](docs/VERIFICATION.md). Chrome viewport emulation does not certify physical phones, Safari or low-end GPUs; automated axe checks are not full accessibility certification.
