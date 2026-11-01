# Homepage card contrast and touch feedback fixes

Based on merged main `15b6d6d` (PR #22). This implements both findings from the read-only layout/motion review.

- **L1:** The three `.mode-tab` descriptions received `opacity:.8` from the older card rule. The existing homepage description rule now sets opacity to 1, retaining its color, typography and artwork. Minimum contrast across the actual card-gradient endpoints rises from 3.90:1 to 6.08:1, above the 4.5:1 normal-text threshold.
- **M1:** Both the older inline card-hover rule and the illustrated hover rule now require `(hover:hover) and (pointer:fine)`. Native coarse-pointer taps retain the selected ring without leaving a card lifted. Desktop mouse hover/image zoom and reduced-motion suppression remain intact.

[Descriptions before](descriptions-before.png) / [after](descriptions-after.png). Actual phone navigation/motion: [before](phone-before.mp4) / [after](phone-after.mp4). The recordings use isolated browser profiles and normal animation clocks. No artwork asset was replaced.

## Verification

- New focused Chromium checks pass all eight CSS viewports: 1366×768,1024×768,820×1180,375×667,393×852,667×375,507×768 and320×768. These fresh contexts use DPR 1; they verify rendered contrast, native taps, desktop hover, keyboard feedback and reduced motion. See [feedback results](feedback-results.json).
- The same new test deliberately fails on unchanged main, detecting all three low-contrast descriptions and both retained 2px touch lifts. See [baseline results](baseline-results.json). This is expected baseline reproduction, not a failing test on the corrected branch.
- The existing eight-layout gameplay browser test is byte-for-byte unchanged (SHA-256 `0f20d3b41faf06d5b4a455dc262626119edf79719600d41074860a0ed0911ec0`). It passes 458 checks, plus the separate storage-denied case, retaining its original DPR 1/2/3 configurations. See [gameplay results](gameplay-results.json).
- Every actual Amplify build command passes. Its emitted HTML and sibling Librarian assets pass the new focused test at laptop, small-phone and tablet-portrait sizes, followed by the unchanged 104 gameplay checks across two layouts and storage-denied case. See [focused output](amplify-feedback-results.json) / [gameplay output](amplify-gameplay-results.json).
- Homepage asset/embedding, original launcher and mobile-playability static gates pass. Both distributed HTML files include the corrected CSS. No questions, saves, grading, controls or gameplay timing changed.

Playwright's `setViewportSize` rotation API switches the reported pointer media to fine/hover-capable in this Chromium environment. The new focused checks therefore assert genuine coarse/no-hover capabilities in fresh touch contexts before any viewport changes; the existing rotation and gameplay assertions remain untouched. No assertion was removed or relaxed.

These are desktop browser automation results, not physical iPhone/iPad Safari tests. Local WebKit is unavailable; the existing GitHub Actions homepage matrix runs the new checks in both Chromium and WebKit. Final hosted status is linked in the draft PR. No deployment or merge is claimed.
