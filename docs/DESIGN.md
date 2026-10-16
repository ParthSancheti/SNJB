# Design rules — Operation Elevate

## Identity

Preserve the supplied logo, genuine campus film, real faculty portraits and source attribution. Home introduces journeys; Explore carries full navigation; Computer Engineering demonstrates depth. Keep historical text/documents in labelled source archives.

Colours sampled from the supplied image: Mist #e9f3f2, Teal #23737a, Deep Teal #1e4a4d, Orange #ee672b. Derived dark canvas: #091b1d. Contrast-safe text variants may differ. Navy remains inside the real logo, not the ambient colour scheme.

## Layers

1. Stable canvas with light/dark theme applied before first paint.
2. Four blurred teal/orange fields, multiply in light and screen in dark, lower dark opacity.
3. Translucent glass with readable text, lit edges and native backdrop filters. Menus need stronger reading surfaces than decorative cards.
4. Real images with one fade mask. Subject photography stays dark, saturated and edge-aligned; avoid a second white wash.

## Typography and scale

Self-hosted Manrope provides headings, UI and the aligned SNJB wordmark. Noto Sans Devanagari supplies Sanskrit. Existing other font files remain available to preserved content. Phone text reflows without truncation; headings are restrained and UI targets at least 44px. Inactive dock icons retain accessible names.

## Interaction

Phone: one moving spring pill; active icon+label, inactive icons. Desktop: existing expandable institutional navigation. No permanent desktop bottom dock.

News 5000ms; campus 3000ms; recruiters/recognitions 1000ms; voices 5000ms. Remove persistent controls/progress. Reveal arrows near pointer edges or keyboard focus. Pause on hover, focus, reading, hidden/offscreen/covered states, reduced motion and global motion-off. The requested one-second cadence is not an accessibility certification.

Idea tiles lift together while the photograph moves at a different rate, the icon rises, light crosses the surface and the arrow follows the destination. Loading animation must reflect actual loading. Reduced motion gets stable content.

## Validation and factual content

Render 320, 360, 390, 430, 768, 1024, 1440 and 1920 widths in both themes. Phone dock threshold: below 1024px. Inspect real text wrapping/crop/dialog bounds. Hero/footer retain edge-to-edge structure.

Figures require year, scope and primary-source links. Intake is capacity, not vacancies. Do not regenerate a real building/person into misleading photography. Restore assets only when a failed rendered request or absent required file is confirmed.
