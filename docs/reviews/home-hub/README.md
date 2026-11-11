# Illustrated homepage and saved navigation

Base: latest main `395ea3e` (merged PR #21). PRs #16–#21 were confirmed merged before editing. Work is isolated on `feature/illustrated-homepage`; no merge or deployment is claimed.

## What is integrated

The actual playable homepage is now a painted, moonlit study hall with the existing customizable shared hero, an adventure Continue/New action, and five illustrated activity entrances. “Explore five games” provides a direct route to the chooser, including on phones. Selecting Quick Recall or Written Practice focuses its original live setup panel.

The hub reads the save module's existing Continue visibility and world progression. A fresh profile has no invented Continue or seal bar; an existing run shows its real earned seals and next world; the completed state explicitly invites practice after Rigby is home. Backup/export/import controls retain their original IDs, ancestry and confirmation behavior. No new save format, progression, achievement or grading rule was added.

All labels, descriptions, buttons, progress and menus are live HTML. Paintings are decorative, with empty image alternatives; the hero retains its existing accessible name and shared renderer. Activity targets and primary controls remain at least44px tall. Keyboard focus is visible, dialogs restore their launchers, and reduced motion removes the ambient light pulse and card transitions.

A single mutation observer reads relevant home/save/dialog changes. The ambient CSS light pauses away from home, when the page is hidden, and behind dialogs/overlays. The original shared-hero lifecycle continues to handle obscured/hidden/offscreen rigs. No independent JavaScript animation loop or new runtime library was introduced.

## Verified vertical slice and states

Open home → create a customized hero → play five bank-backed questions (including a miss) → earn a real seal → return home → Continue the saved quest → return home → play Quick Recall/Written Practice → visit the existing Lab/Librarian → return home.

The laptop browser case then earns all ten seals through **fifty actual UI-graded questions**. Completed-profile captures in other layouts reuse that earned test state. For an isolated staged server the fixture's origin is explicitly rebased; this is test setup, not an automatic cross-origin save-sync feature.

## Browser coverage

Local Chromium154.0.8037.57 passes every row below, including new/saved/completed states, live mode navigation and grading, reload, focus, interruption simulation, offline interactions and reduced motion. Desktop WebKit executes the same scenarios in the dedicated CI workflow; the final hosted outcomes and artifacts are linked in the draft PR.

| CSS viewport | DPR | Input configuration |
| --- | ---: | --- |
| Laptop1366×768 | 1 | Mouse, keyboard; native actions |
| Tablet landscape1024×768 | 2 | Mobile viewport and touch |
| Tablet portrait820×1180 | 2 | Mobile viewport and touch |
| Small phone375×667 | 3 | Mobile viewport and touch |
| Modern phone393×852 | 3 | Mobile viewport and touch |
| Phone landscape667×375 | 3 | Mobile viewport and touch |
| iPad split507×768 | 2 | Mobile viewport and touch |
| Narrow320×768 | 2 | Mobile viewport and touch |

The existing player-experience regression also passes its laptop,1024×768,820×1180 and390×844 layouts unchanged. Navigation recordings and paired phone captures use390×844. Screenshots are exported at CSS resolution even when the automated context uses DPR2/3.

**These are desktop Chromium/WebKit tests, not physical iPhone/iPad Safari tests.** No iOS Simulator or physical Apple device is available. Synthetic visibility changes are not actual device locking, and CDP zoom-scale checks are not physical pinch gestures. Follow the [physical Safari checklist](PHYSICAL-SAFARI-CHECKLIST.md).

## Gameplay evidence

- [Before laptop](before-laptop.jpg) / [after laptop](chromium-laptop-new.jpg).
- [Before phone390×844](before-phone.jpg) / [after phone390×844](chromium-phone-new.jpg).
- [Before tablet](before-tablet.jpg) / [after tablet](chromium-tablet-portrait-new.jpg).
- [Returning hero](chromium-laptop-saved.jpg) / [earned completed state](chromium-laptop-completed.jpg).
- [Laptop navigation recording](chromium-laptop-navigation.mp4) / [phone recording](chromium-phone-navigation.mp4). Source WebMs and timestamp metadata are retained alongside them.

Recordings run the normal animation clock and native UI actions: no frozen physics, replacement decks, injected scores or staged victories. Each recording includes five actual answers and an earned seal. WebKit's own recordings/screenshots/results are retained in its CI artifact.

## Regression and packaging checks

[Per-check Chromium results](chromium-results.json) and [actual Amplify output results](amplify/chromium-results.json) preserve the assertions. The draft PR lists final hosted checks and their result links. The existing save/profile/storage-failure regression, home launcher and four-layout player-experience browser checks pass locally without changing their assertions. Existing artwork/hero/save hash gates also pass.

One additional historical test, `tests/librarian.test.cjs`, fails on both unchanged main and this branch because it expects the old prototype's `function buzz()`. The playable Librarian has used the multiple-choice v4 implementation since earlier merged work. That obsolete assertion was not rewritten or counted as a pass. The repository's current v4 smoke and illustrated-playable regressions remain the relevant CI checks.

`tests/home-hub-package.test.cjs` executes every actual `amplify.yml` build command in an isolated directory, serves the emitted `dist/index.html` plus its real sibling Librarian assets, and plays two viewport scenarios through all destinations. The standalone tests use the complete embedded HTML. Every new runtime painting is embedded in both outputs; the source PNGs are excluded from published artifacts.

Offline checks cover the already-loaded game and locally served complete standalone HTML. Cold hosted offline navigation/reload, iOS Files execution and Home Screen offline installation are not promised. No service worker or PWA delivery contract was added. Storage-denied contexts retain a visible warning and never show a fabricated Continue action.

## Reproduce

```sh
node scripts/build-standalone.cjs
node tests/home-hub.test.cjs
HOME_HUB_ENGINE=chromium node tests/home-hub-browser.test.cjs
HOME_HUB_ENGINE=webkit node tests/home-hub-browser.test.cjs
HOME_HUB_ENGINE=chromium node tests/home-hub-package.test.cjs
HOME_HUB_ENGINE=webkit node tests/home-hub-package.test.cjs
HOME_HUB_ENGINE=chromium node scripts/record-home-hub.cjs
HOME_HUB_REFERENCE_HTML=/path/to/main-395ea3e.html node scripts/measure-home-hub.cjs
```

Playwright1.62.1 and the selected engines must be available; `CHROMIUM_PATH` selects a nondefault executable. `HOME_HUB_REPORT`, `HOME_HUB_HTML` and comma-separated `HOME_HUB_VIEWS` select the evidence directory, build and layout subset. The local managed network does not provide a WebKit installation; the GitHub workflow installs the actual engine on its runner. Neither engine is downloaded by the game.

## Artwork provenance and performance

[Asset provenance](../../../assets/home/PROVENANCE.md) and [manifest](../../../assets/home/manifest.json) retain original source paintings, source/runtime hashes, dimensions and byte budgets. New artwork is original image_gen output; approved library/world art and the shared hero remain unchanged. The six runtime WebPs total332,776 bytes before base64 embedding, within a400kB budget.

[Raw performance observations](performance.json) compare identical detailed hero configurations before/after, at1366×768 and393×852, DPR1, with2.4s warmed samples on shared Linux headless Chromium. They measure frame callback gaps, main-thread/layout work and retained JS/DOM, not physical-device input latency, GPU/process memory or battery life.

The creator is opened once before the retained-memory sample to exclude its intentional first-use DOM allocation. After twelve further open/close cycles, node/listener counts remain stable in both baseline and upgraded builds, with one active shared home hero and one hub mutation observer. The larger phone hero costs additional main-thread work in these samples; frame gaps remain around17ms. No device-level speedup or battery claim is made. Physical retina-device profiling is the next validation priority.

| DPR1 desktop sample | Before p95 frame gap | After p95 frame gap | Before/after task CPU |
| --- | ---: | ---: | ---: |
| laptop / fairy | 16.9ms | 17.0ms | 14.5% / 15.4% |
| laptop / panther | 17.0ms | 17.1ms | 15.6% / 17.8% |
| phone / fairy | 17.0ms | 17.0ms | 14.3% / 17.4% |
| phone / panther | 16.9ms | 17.8ms | 13.1% / 19.7% |

These short shared-host samples are observations, not physical-device guarantees or a universal speedup claim. The raw file also includes layout cost and the warmed retained-memory samples.

## Inactive-home work isolation

The first hosted guardian-motion check reported a150.4ms frame gap across the unchanged95ms casting window. Its diagnostics showed anticipation/follow-through but missed the casting sample. No guardian renderer, animation duration, attack timing or assertion was changed in this branch.

Investigation also found redundant work owned by the new hub: five controlled refreshes during Written Practice rewrote35 hidden-home DOM records and woke one extra shared-hero scan. The hub now defers hidden labels until home returns, and only writes changed values. The same probe reports **zero hidden mutations and zero extra scans**. Every Quick/Written setup case includes a regression assertion for this isolation. This demonstrates reduced inactive UI work; it does not establish the cause of the earlier guardian frame gap. Final hosted results are recorded in the PR.

[Before probe](inactive-before.txt) / [after probe](inactive-after.txt). Reproduce from the repository root with `node docs/reviews/home-hub/probe-inactive.cjs`; `HOME_PROBE_HTML` can select an earlier complete HTML build. The first integrated revision is `daf2a1f`.

## Hosted runner budget

The first final-code WebKit job spent roughly twelve minutes installing browser dependencies, then passed seven complete layout scenarios before its25-minute job limit canceled the eighth. No failing assertion was reported. The canceled narrow-layout remainder, recordings and staged checks were not counted as passes. The homepage workflow now allows45 minutes for installation plus the full unchanged scenario/recording/package sequence. This changes CI scheduling only; production JS/CSS/artwork and all existing test assertions remain unchanged from `b1b0b33`. Final hosted outcomes and artifact links are in the PR.

## Narrow card visual correction

Reviewing actual320px and375px captures exposed an older launcher rule that switched activity cards to a38px icon grid. The painted cards now explicitly retain their vertical flex layout, so both artwork and descriptions occupy the card width. [Before the correction](narrow-before-card-fix.jpg) / [after at320px](chromium-narrow-new.jpg). Every browser case now checks the usable artwork and description width, in addition to page overflow. Existing game/test assertions remain unchanged. The final PR records the results of the complete rerun after this correction.
