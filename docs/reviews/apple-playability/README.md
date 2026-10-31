# Apple viewport and Safari-engine audit

Base: main `901d5d8` after approved PR #20. Branch: `feature/ios-safari-playability`.

## Reproduced issues and fixes

| Priority | Baseline evidence | Fix |
| --- | --- | --- |
| P1 | 667×375 hero creator hides its customization pane; compact portrait offers only 33px of option scroll height. | Scroll the complete customization pane; use a two-column short-height layout and keep form/action controls reachable. |
| P1 | Landscape Librarian storms scroll the arena and Return button above the viewport while reaching movement controls. | Fit a proportional arena, live question and touch deck together; keep Return visible. |
| P1 | Native Chromium two-finger press on Right becomes unheld when only the first finger lifts. | Track pointer ownership; release only the last held pointer, and clear ownership on interruption. |
| P2 | Tab escapes the Librarian overlay into the page behind it. | Inert background, scoped Tab loop and focus restoration; preserve previous background state. |
| P2 | Compact name input renders at 14px. | At least 16px form text on compact/coarse-pointer layouts. Actual iOS autozoom behavior requires a physical-device check. |

[Baseline measurements](baseline-findings.json) and `before-*.jpg` are actual Chromium mobile-viewport captures before editing. Native Chromium touch injection reproduces the same-button ownership bug. Those results are **not** physical Safari tests.

The adapter only coordinates viewport CSS, focus, and pointer release. Questions, grades, scoring, collision dimensions, movement speed, attack clocks, saves, artwork and customization remain in their original modules.

## Coverage status

Chromium 154.0.8037.57 passes **72 checks in each of eight layouts** (576 total), with no browser script errors. The actual Amplify output passes the same checks in small-phone landscape and iPad split view (144 more). The hosted Chromium/WebKit workflow publishes its own per-layout JSON, screenshots and normal-clock recording. The final hosted outcomes and artifact links are recorded in draft PR #21; consult those engine results separately from the local Chromium results below.

| Layout (CSS pixels) | Local Chromium touch emulation | Desktop WebKit CI configuration |
| --- | --- | --- |
| Small phone 375×667 | PASS, 72 checks | Same scenario |
| Modern phone 393×852 | PASS, 72 checks | Same scenario |
| Small phone landscape 667×375 | PASS, 72 checks | Same scenario |
| Modern phone landscape 852×393 | PASS, 72 checks | Same scenario |
| iPad portrait 820×1180 | PASS, 72 checks | Same scenario |
| iPad landscape 1180×820 | PASS, 72 checks | Same scenario |
| iPad split 507×768 | PASS, 72 checks | Same scenario |
| Narrow multitasking 320×768 | PASS, 72 checks | Same scenario |

WebKit runs 69 assertions per layout: it includes background-rig suspension, but excludes the three Chromium-only native CDP multitouch/zoom assertions. CI uses Playwright1.62.1; the WebKit installation is26.5. **iOS Simulator: unavailable. Physical iPhone/iPad Safari: untested.** This matrix names layout targets, not tested physical device models.

[Local per-check results](chromium-results.json), [Amplify results](amplify/chromium-results.json), and [regression output](local-test-results.txt) preserve the actual observations.

Local WebKit installation was attempted, but the managed network proxy rejected its browser download hosts with HTTP 403. The dedicated GitHub Actions workflow installs actual WebKit and runs the same audit there. Hosted results are reported separately in PR #21 and its CI artifacts. This Linux environment has no iOS Simulator or physical Apple devices.

## Test methods

- Chromium: desktop browser with mobile viewport/touch emulation. Native CDP multitouch exercises overlapping pointers, drag/release outside, and browser zoom.
- WebKit CI: desktop Playwright WebKit with mobile viewport/touch settings and native single taps. Hold/cancel assertions use explicitly synthetic PointerEvents; no native WebKit multitouch claim.
- Viewport height changes simulate reduced space; they are not the OS keyboard. Nonzero CSS inset overrides check layout arithmetic; they are not a real notch measurement. Visibility/blur events are simulated interruptions, not device lock/unlock.
- Normal-clock gameplay recordings use real answer controls. The separate regression harness freezes/steps the existing Librarian physics for deterministic ownership and collision assertions.

Physical-device testing, Safari toolbar motion, actual keyboard behavior, device performance/battery and lock/unlock remain separate handoff checks. Do not infer device FPS from headless browser frame timing.

No deployment or main-branch merge is claimed.

## Reproduction and delivery

From a checkout with Node and Playwright installed:

```sh
node scripts/build-standalone.cjs
node tests/mobile-playability.test.cjs
APPLE_ENGINE=chromium node tests/apple-playability-browser.test.cjs
APPLE_ENGINE=webkit node tests/apple-playability-browser.test.cjs
APPLE_ENGINE=chromium node tests/apple-package.test.cjs
APPLE_ENGINE=webkit node tests/apple-package.test.cjs
APPLE_ENGINE=chromium node scripts/record-apple-playability.cjs
APPLE_BASELINE_HTML=/path/to/main-901d5d8.html node scripts/measure-apple-playability.cjs
```

Install the selected engines with Playwright's CLI first. `CHROMIUM_PATH` selects the Chromium binary; `APPLE_REPORT` selects the evidence directory; `APPLE_VIEW` selects comma-separated layout cases. The CI workflow installs tooling in a temporary directory, with no new game runtime dependencies. `apple-package.test.cjs` executes every actual Amplify command in an isolated directory, then exercises that output in two layouts. It serves the output's real sibling JS/CSS, including the Librarian module; the standalone audit uses the embedded version.

## Offline, storage and interruption contract

There is no service worker, web app manifest or guaranteed installable PWA in this project. Normal hosted Safari needs a successful initial load. Its loaded game can continue, grade and save with requests blocked; a cold offline URL/reload is not guaranteed by this work. The complete standalone HTML embeds the artwork and Librarian code; run it through a browser-capable local delivery workflow. Actual iOS Files/Quick Look execution and offline reopening are untested. A Home Screen bookmark does not establish offline installation support.

The existing save regression checks cover stable player IDs, customized appearance, seals, reload/browser restart, journal retention, export/import validation, corrupt data, denied storage and visible quota-error recovery. Temporary duel state follows the existing interrupted-duel restart contract. The new adapter clears touch ownership on simulated blur/hidden/resize/close, but does not write saves or change question/attack clocks. Real app switching and device locking require the [physical-device checklist](PHYSICAL-DEVICE-CHECKLIST.md).

## Artwork and evidence provenance

No artwork was replaced or generated. All painted materials, guardian art, library illustrations and customization IDs remain from approved main/PR #20 and its predecessors. New material is source code, tests and recordings of the actual game. Before captures use main `901d5d8`; after captures use this branch. Videos run the normal gameplay clock and answer the live question incorrectly; read-only hooks identify the answer/state. Chromium injects native CDP touches, WebKit uses native taps/mouse holds, and the duck hold is an explicitly synthetic PointerEvent sequence. No frozen physics or injected victory appears in those recordings. Deterministic assertion screenshots may freeze the original Librarian test clock.

- [Before gameplay MP4](chromium-before.mp4) / [after gameplay MP4](chromium-after.mp4), with source WebM and timeline JSON alongside them. Rotation is captured by the fixed recording canvas; layout screenshots show the full portrait bounds.
- [Before landscape creator](before-small-landscape-creator.jpg) / [after creator](chromium-iphone-small-landscape-creator.jpg).
- [Before landscape storm](before-small-landscape-storm.jpg) / [after storm](chromium-iphone-small-landscape-storm.jpg).
- Full engine output and WebKit recordings are retained in the linked GitHub Actions artifacts; screenshots in this directory are actual browser captures, not device photography.

## Remaining physical checks

Follow the [specific device checklist](PHYSICAL-DEVICE-CHECKLIST.md) for real Safari toolbars, notch/Dynamic Island, software keyboard, multitouch, app switching, lock/unlock, VoiceOver, standalone delivery, device performance and memory pressure. iOS Simulator and physical-device results are **not available**, and none are reported as passes. No deployment or main merge was performed.

## Performance observations

[Raw measurements](performance.json) use the same 393×852 viewport, appearance and scenarios before/after, 2.4-second samples, on shared Linux headless Chromium. These are frame callback gaps and CDP main-thread observations, not physical-device rendering, input latency, GPU memory or battery measurements. Concurrent workloads cause substantial variance; no universal speedup is claimed.

| Scenario | Before p95 frame gap | After p95 frame gap | Before/after layout time |
| --- | ---: | ---: | ---: |
| creator-fairy | 39.5 ms | 76.7 ms | 26.8 / 19.7 ms |
| creator-panther | 72.8 ms | 61.1 ms | 15.5 / 19.3 ms |
| guardian-listening | 21.5 ms | 18.1 ms | 63.8 / 54.9 ms |
| book-storm | 50.2 ms | 21.3 ms | 128.1 / 82.5 ms |

A confirmed redundant rig was removed from active storm work: `home-panther` and `librarian-v4-hero` previously both animated; now only `librarian-v4-hero` does. The obscured home rig resumes when the overlay closes. No artwork was reduced. The creator samples remain variable and warrant device profiling before further optimization.

After twelve open/close cycles with explicit GC, listeners changed 204→200, DOM nodes 16304→16278, and retained JS heap 11.928→12.013 MB. The adapter ended with zero pointers and matched mounts/cleanups. This short observation found no growing listener/scene count; it is not a proof against long-session leaks or Safari memory-pressure eviction.

## Reproduction steps for confirmed issues

1. At 667×375, open **Create your hero** on baseline main. The preview consumes the usable body and hides the options. At 375×667 measure `.hero-options-scroll`: only 33px tall. After the fix, touch the Outfit tab, select Ranger, edit the name and finish in both layouts.
2. At 852×393, start Librarian and choose an incorrect answer. Reach the movement deck: baseline arena top is −89px and Return is −164px. After the fix, arena, warning, Return and all six controls fit together; the arena retains 960:460 proportions.
3. During a storm, press Right with two native Chromium touches, then lift the first only. Baseline releases Right; after the fix it remains held until the second releases. Cancel, drag outside, rotate, blur and close also clear ownership. WebKit synthetic ownership checks supplement its native single taps.
4. Open Librarian from the launcher and press Tab repeatedly. Baseline focus escapes into the background. After the fix it stays within the overlay, and closing restores the launcher. The name input changes from 14px to at least 16px on compact/touch layouts; real Safari input zoom remains a physical check.
5. Inspect `HeroMotion.inspect().rigs` during a book storm with a saved customized hero. Baseline includes the home hero behind the overlay; the fix suspends inert-background rigs and restores them after closing.

The first WebKit attempt also exposed that Playwright's resize call can return before WebKit delivers its viewport/resize events: a landscape fit assertion and an iPad interrupted-hold assertion raced that settlement. The audit now waits for the actual viewport and CSS viewport height, then two animation frames, with a three-second bound. All fit, aspect-ratio and release assertions remain intact. This is recorded as a harness synchronization correction, not a claimed Safari product fix.

## Regression integrity

Existing source/asset hash gates still pass. Original Librarian physics, questions and saves are unchanged. The existing Librarian four-layout encounter regression, 140 tactics, ten-world staged Amplify journey, save/failure/recovery suite, and Science Lab staged five-station progression pass locally. Creature Incubator passes all four layouts plus a network-disabled standalone completion; guardian motion passes the full desktop journey. CI also runs the repository's remaining suites.

The initial CI runs exposed timing-sensitive test observations. The guardian casting phase occupies 65–160ms; observing only after a Playwright click response could miss it. Its collector is now armed before the same native choice click, with the same phase/joint/foot/focus assertions. The Moonwing blink test previously sought to the 44% apex and read it in a second protocol call while the animation kept running. It now pauses, seeks, reads and restores playback in one browser task, retaining the same <0.2 scale assertion. No gameplay timing, artwork or assertion was relaxed. A first staged Lab run also exceeded its unchanged 12s real-storm watchdog under load; both baseline and the branch pass that original test on rerun. Failed attempts are not counted as passes.

The baseline probe is reproducible with `APPLE_BASELINE_HTML=/path/to/main-901d5d8.html node docs/reviews/apple-playability/probe-baseline.cjs` from the repository root. Evidence ZIP downloads were restricted by the local network; WebKit artifacts remain available through the GitHub Actions links in the PR.
