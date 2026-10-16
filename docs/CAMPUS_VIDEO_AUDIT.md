# Campus video audit — Operation Elevate

16 October 2026. Audit command: `node scripts/qa-elevate-video.mjs`, against the production preview at `http://127.0.0.1:4178`. The isolated two-viewport repeat uses `--performance-only`. The default browser is installed Microsoft Edge; `SNJB_QA_CHANNEL` can select another installed Chromium channel. Raw observations are written to ignored `qa/elevate-video.json`; the first recording is retained as `qa/elevate-video-contended.json` and the isolated repeat as `qa/elevate-video-idle.json`.

## Confirmed asset inventory

| Delivered asset | Encoded file bytes | Observed dimensions / duration |
| --- | ---: | --- |
| `public/media/campus-desktop-v10.mp4` | 6,963,207 | 1920 × 1080 / 15 seconds |
| `public/media/campus-mobile-v10.mp4` | 4,019,462 | 720 × 1280 / 15 seconds |
| `public/media/campus-poster-desktop-v10.webp` | 342,494 | Responsive desktop poster |
| `public/media/campus-poster-mobile-v10.webp` | 163,400 | Responsive phone poster |

The audit does not re-encode, recolour or replace these assets. File size is the full encoded asset; network measurements distinguish completed responses from partial streaming transfers. A byte count recorded before a video response finishes is not the total transfer size.

## Confirmed functional behaviour

Five grouped cases passed in headless Microsoft Edge 155 on Windows:

1. The 1440px viewport requests the desktop source, plays the actual film, advances `currentTime`, and retains its 15-second loop.
2. The 390px emulated phone viewport requests the portrait source, plays and advances the actual film, and retains the same loop length.
3. Fresh reduced-motion and Save-Data contexts both load the poster and make **zero MP4 requests**.
4. Aborting the MP4 request removes the failed player while preserving the decoded poster and visible Home heading.
5. Holding the MP4 response leaves the decoded poster visible, shows the existing slow-network status, then removes that status and resumes playback when the response is released. The observed status time includes application startup and browser scheduling; it is not a measurement of the exact 4,500ms source timer.

## First recording: concurrent host load

This recording ran while other browser verification was active. Its functional assertions passed, but its frame results do **not** establish smooth playback.

| Observation | Desktop 1440 × 900 | Emulated phone 390 × 900 |
| --- | ---: | ---: |
| First `canplay`, from navigation | 6,544.9ms | 3,306.6ms |
| First `playing`, from navigation | 6,545.6ms | 3,310.2ms |
| Sampled total frames | 101 | 143 |
| Sampled dropped frames | 61 | 63 |
| Dropped fraction | 60.4% | 44.1% |
| Observed LCP candidate | Hero text span, 5,136ms | Hero text span, 2,236ms |

**CONFIRMED:** These frame drops and video waiting events occurred in this browser recording. `getVideoPlaybackQuality()` counts are observations of this headless browser; they are not physical display-frame or device-GPU measurements.

**CONFIRMED:** Buffered `PerformanceObserver` recorded the text spans as LCP candidates. Neither poster was observed as an LCP candidate. Poster loading, request timing and encoded bytes are reported separately rather than labelling a resource-load timestamp as poster LCP.

**CONFIRMED:** The desktop CDP Performance sample recorded 326.0ms of whole-page main-thread task time over 4,243.8ms of sampled wall time. Script time was 5.5ms, layout 1.1ms and style recalculation 21.7ms. These are whole-page task durations, not video-only CPU utilization. They do not account for all compositor/GPU work.

**HYPOTHESIS:** Concurrent browser work contributed to the frame drops and scheduling delays. This requires an isolated comparison; the first recording alone cannot establish an encoding, filter or rendering defect.

## Isolated comparison

After the other browser workloads closed, both responsive cases passed again on build `index-BJcO8Bfa.js`. Each case uses a fresh browser context; the host filesystem/OS cache is not deliberately cleared. The two-case command finished in 8.65 seconds.

| Observation | Desktop 1440 × 900 | Emulated phone 390 × 900 |
| --- | ---: | ---: |
| First `canplay`, from navigation | 655.0ms | 425.9ms |
| First `playing`, from navigation | 655.1ms | 426.1ms |
| Actual film time advanced | 2.171 seconds | 2.228 seconds |
| Observation window | 2,240ms | 2,231ms |
| Sampled total frames | 71 | 71 |
| Sampled dropped frames | 4 | 6 |
| Dropped fraction | 5.6% | 8.5% |
| Observed LCP candidate | Hero text span, 944ms | Hero text span, 544ms |

Neither poster was an observed LCP candidate in the isolated recording either. The resource timings below are network-request timings, not poster LCP.

| Actual network response | Request start from navigation | Received body bytes | Result |
| --- | ---: | ---: | --- |
| Desktop poster | 28.6ms | 342,494 | Complete, HTTP 200 |
| Desktop MP4 | 460.4ms | 6,963,207 | Complete, HTTP 206, bytes 0–6,963,206 |
| Phone poster | 23.3ms | 163,400 | Complete, HTTP 200 |
| Phone MP4 | 308.1ms | 4,019,462 | Complete, HTTP 206, bytes 0–4,019,461 |

CDP Network `dataReceived` body-byte totals match the full encoded files in this isolated run. HTTP headers add additional transfer bytes; they are not part of the body counts above. These localhost results do not describe an internet connection or a CDN.

The desktop-only CDP Performance sample recorded 406.9ms of whole-page main-thread task time over 2,242.1ms of sampled wall time: script 36.3ms, layout 33.9ms, style recalculation 39.1ms. Mobile CPU/task metrics were deliberately not inferred from desktop emulation.

**CONFIRMED:** The isolated recording had substantially fewer frame drops than the first contended recording. Residual drops remained, so neither recording supports a zero-drop or physical-device smoothness claim.

**HYPOTHESIS:** Lower contention and warmed host caches contributed to the improved results. This comparison does not isolate their individual effects or establish which visual layer caused the residual startup drops. No film re-encoding or colour-filter change was justified by these observations alone.

## Limits and next decision

**BLOCKED:** Physical iPhone/Safari, low-end Android, battery use, GPU behaviour and production CDN/mobile-network performance were not measured here.

**RECOMMENDATION:** Retain the current film while checking the remaining startup frame drops on representative hardware. If visible stutter reproduces there, profile decoding and the complete glass/ambient composition separately before changing the film. Passing the functional cases is not evidence of universal smoothness.
