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

The first integrated 667×375 Chromium scenario passed 69 checks across the creator, adventure, Quick Recall, Written Practice, all five Lab stations, Librarian, settings/history, rotation, saved identity and offline reduced motion. The expanded eight-size audit and unchanged regressions are being completed; final results will be added to this draft.

Local WebKit installation was attempted, but the managed network proxy rejected its browser download hosts with HTTP 403. The dedicated GitHub Actions workflow installs actual WebKit and runs the same audit there. Hosted results will be reported separately. This Linux environment has no iOS Simulator or physical Apple devices.

## Test methods

- Chromium: desktop browser with mobile viewport/touch emulation. Native CDP multitouch exercises overlapping pointers, drag/release outside, and browser zoom.
- WebKit CI: desktop Playwright WebKit with mobile viewport/touch settings and native single taps. Hold/cancel assertions use explicitly synthetic PointerEvents; no native WebKit multitouch claim.
- Viewport height changes simulate reduced space; they are not the OS keyboard. Nonzero CSS inset overrides check layout arithmetic; they are not a real notch measurement. Visibility/blur events are simulated interruptions, not device lock/unlock.
- Normal-clock gameplay recordings use real answer controls. The separate regression harness freezes/steps the existing Librarian physics for deterministic ownership and collision assertions.

Physical-device testing, Safari toolbar motion, actual keyboard behavior, device performance/battery and lock/unlock remain separate handoff checks. Do not infer device FPS from headless browser frame timing.

No deployment or main-branch merge is claimed.
