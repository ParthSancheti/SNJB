# Media recovery audit — Operation Elevate

Reviewed 16 October 2026, Asia/Kolkata. Recovery baseline: `4fbde18` on `recovery/elevate-20261016`. This audit distinguishes a missing runtime file from an unloaded lazy image, a hidden archive, a source-only master, and a layout problem.

## Evidence and package comparison

Read-only sources inspected:

- Current `public/`, source components, runtime JSON, and `public/images/resources/manifest.json`.
- `C:\Users\ParthSancheti\Downloads\SNJB-ASTRA-Upgraded-Codebase.zip`, the supplied upgrade archive.
- `D:\SNJB\SNJB-Runnable-Codebase.zip`, the earlier runnable export.
- `D:\SNJB\snjb-engineering\public.zip`, a misleadingly named project archive.
- `D:\SNJB\.research\removed-before-runnable-cleanup-20261015\public`, the preserved cleanup archive.

The upgrade ZIP contains **327 image files, 5 WOFF2 font files, and 2 current MP4 files**. All **334** matching runtime entries were compared with current local `public/` using SHA-256: **zero missing files and zero byte mismatches**. The image count includes three AVIF files and the favicon/app icons; it does not mean 327 different campus photographs.

`public.zip` is not a bundle of missing extra photographs. It is a **91,478,419-byte full project ZIP** with 1,007 entries, including both `public/` and built `dist/`. It therefore contains 654 image entries, 10 font entries, and 4 video entries: duplicate source/build copies of the same runtime assets. Its uncompressed size is 100,850,594 bytes. Re-extracting it wholesale would reintroduce redundant build output.

The preserved cleanup archive contains 137 retired/raw public files totaling 149,545,722 bytes. These include old video versions and high-resolution image masters. It is evidence and a recovery source, not a list of files to restore automatically.

## Computer Engineering image preservation

`public/images/resources/manifest.json` records 146 original HTML image references and 109 unique downloaded source images. All **109 delivery WebP files** remain present, and every file matches its recorded `deliverySha256` hash. The delivery files total 22,814,546 bytes; the original image masters total 96,037,488 bytes. The manifest records no failed source downloads.

The preserved department HTML renders `/images/resources/*-delivery.webp`. JSON `originalPath` fields and original external SNJB links document provenance; they are not local image requests made by the page. A broad string search incorrectly treats these metadata paths and `/uploads/media/...` substrings inside external URLs as missing runtime files.

The CS resources drawer contains 16 published sections. Its native closed disclosures intentionally defer display. The faculty directory initially displays 8 people and has an explicit action to show all 37. These are information architecture states, not evidence that portraits or archive photographs were deleted.

## Font evidence

The existing five self-hosted font files are present: Manrope, DM Sans, Instrument Serif, and the Devanagari/Latin subsets of Noto Sans Devanagari. The refreshed UI uses Manrope for body typography and the SNJB wordmark, with Noto Sans Devanagari for Devanagari text. The legacy serif file can remain available for preserved components without forcing a serif `J` into the wordmark.

## Browser verification

The repeatable check is `scripts/qa-elevate.mjs`; use `SNJB_QA_SCOPE=media` and `SNJB_QA_URL` to target an owned local preview. It uses installed Microsoft Edge by default (`SNJB_QA_CHANNEL` can override the channel).

The media check visits all 12 local routes, opens all seven Home source groups, opens all 16 CS archival sections, and expands all 37 faculty/staff records. It scrolls each rendered image into the viewport before assessing lazy loading, verifies decoded `naturalWidth`, checks local source and responsive image HTTP status plus image MIME, and rejects image fallback UI. Font checks verify HTTP MIME and actual `FontFace` load status. Runtime findings and exact per-route image counts are written to ignored `qa/elevate/verification-media.json`.

The complete media run passed first on the development server (`4173`) and again on the production preview (`4178`) in Microsoft Edge: all 12 route checks, the delivery-hash check, and the browser font check. There were zero failed local image HTTP/MIME checks, zero zero-width decoded images, zero image fallback states, and zero browser runtime errors. The completed production-media subset is retained in ignored `qa/elevate/verification-media-production.json`, derived without changing results from the original compound-run report.

| Route | Decoded image elements | Unique local image paths (including responsive sources) |
| --- | ---: | ---: |
| Home, with all source groups expanded | 73 | 64 |
| Computer Engineering, with all people and archival sections expanded | 191 | 156 |
| Campus / Student Life | 16 | 11 |
| AI & Data Science | 3 | 1 |
| Civil Engineering | 3 | 1 |
| Electronics & Telecommunication | 3 | 1 |
| Mechanical Engineering | 3 | 1 |
| First-Year Engineering | 3 | 1 |
| MBA | 3 | 1 |
| Apply | 3 | 1 |
| Explore | 3 | 1 |
| Audit | 3 | 1 |

Image-element counts include temporary decoded preview images if React has not yet removed them at the instant of capture; these are not different source photographs. The initial development CS run recorded 162 elements and the production run recorded 191, with the same 156 unique local image paths. Repeated emblem elements account for the three image elements on the simpler routes. The six non-CS department routes currently render department resource directories, not full image-led department landing pages. Their sparse imagery is a **page implementation/coverage gap**, not a deleted-file finding. This audit does not claim that all departments have received the CS-level redesign.

The browser loaded the four named font families from valid self-hosted assets. All five WOFF2 endpoints passed HTTP/MIME/size checks. The Devanagari font loaded its Devanagari subset for the explicit `ज्ञान` test; the unused Latin subset may legitimately remain unloaded until text selects it.

## Related UI and motion verification

The default QA matrix covers 320, 360, 390, 430, 768, 1024, 1440, and 1920 pixels in both themes. All **16 layout cases / 192 route visits** passed, with 24 route-top captures at 1440/light and 390/dark plus Home/field captures for every matrix case. The completed layout subset is `qa/elevate/verification-layout.json`; its tested assets were `index-CBxFKyUt.js` and `index-E5G_fTlu.css`.

The matrix exposed rapid destination changes being dropped while a prior route was opening. Review also found an older transition completion could erase the next queued transition, and that the mobile dock could render four inactive icons on department pages. These were navigation/visibility defects, not asset losses. They were fixed after the static layout matrix. The CSS did not change.

All **8 focused motion/navigation cases** then passed on final `index-BJcO8Bfa.js` with the same `index-E5G_fTlu.css`; see `qa/elevate/verification-motion.json`. The checks cover actual 5-second news, 3-second campus, and 1-second recognition/recruiter replacement; edge-only pointer arrows and keyboard operation; shaded saturated subject photography; learning-card/image hover movement; a single-line Manrope 700 wordmark; the moving mobile active pill; two immediate destination requests in both motion preferences; reduced-motion stability; and dock absence on all seven department routes. The seven phone department screenshots were refreshed on this final JS build.

These reports intentionally identify different builds: media assets remained unchanged, static layout used the final CSS, and the targeted navigation regressions used the final JS. A partial compound report is not presented as a completed full-suite pass. Re-running `node scripts/qa-elevate.mjs` without a scope executes all checks against one selected preview; `media`, `ui`, and `motion` are supported scope arguments.

## Restoration decision

No bulk restoration is justified by the ZIP, hash, or delivery-image evidence. Restore a specific asset only if a rendered image request fails, the browser cannot decode it, or a required photograph is confirmed absent from both the current package and its intended page. Retain source-only originals in the external recovery archive. Layout, cropping, dark overlays, and closed disclosures must be corrected as presentation issues rather than by copying back obsolete masters.

Browser checks are Edge automation and viewport emulation. They do not certify a physical iPhone or Safari rendering behavior.
