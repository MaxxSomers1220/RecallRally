# Mobile landscape duel fit

Review branch: `fix/mobile-landscape-duel-fit` (base `7853980`).

The compact side-by-side layout stopped at 1000px wide and depended entirely on
`--rally-vh`. Reproducing a stale 245px value in an 852×393 viewport reduced the
duel to 237px and its illustrated arena to 23px, leaving blank page below. The
same value after the fix leaves a 385px duel and 171px arena.

The duel now uses live `100dvh` sizing, with the previous JS height as fallback
for older browsers. A fixed main viewport keeps answer focus from moving the
whole page; long questions still scroll inside their own panel. Safe areas are
retained. The compact rules cover wider landscape webviews up to 520px tall.
Portrait and normal laptop/tablet layouts keep their previous rules. There are
no question, grading, save, hero, soundtrack or Science Lab behavior changes.

The new `--mobile-only` option to `scripts/build-standalone.cjs` rebuilds this
module in both HTML files without regenerating unrelated reviewed inline code.
The normal Amplify build also embeds the updated module.

Successful validation (exit 0):

- `node scripts/build-standalone.cjs --mobile-only`
- `node tests/mobile-playability.test.cjs`
- `node tests/adventure-save.test.cjs`
- `node tests/science-lab.test.cjs`
- `node tests/librarian-v4-smoke.test.cjs`
- `node tests/apple-landscape-duels-browser.test.cjs`: eight landscape sizes,
  safe areas, stale height, browser height 300→430→393, touch targets, grading,
  long copy, independent scrolling, pause and rotation; four unchanged larger
  and portrait layouts. New lower bounds require the panels to fill the viewport.
- `APPLE_REPORT=/tmp/landscape-fit/all-modes APPLE_VIEW=iphone-small-landscape,iphone-modern-landscape,ipad-landscape,iphone-modern node tests/apple-playability-browser.test.cjs`:
  73 checks at each of four sizes; all modes, zoom, pointer cancellation, focus,
  saved progress, offline-loaded play and reduced motion.
- `CHROMIUM_PATH=/usr/bin/chromium node tests/science-lab-static.test.cjs`:
  all 26 actual Amplify build commands and the staged site's five-station and
  Librarian browser path.
- Byte comparison confirms that index outside the mobile CSS block, including
  the question bank and gameplay scripts, is unchanged. The viewport JS adapter
  is unchanged. `node --check scripts/sync-game-modules.cjs` and
  `git diff --check` passed.

Actual before/after screenshots and bounds: `/tmp/landscape-fit/`.
Screenshots include a deliberately stale viewport value and wide webviews.
A screenshot/video run initially stopped because Playwright's FFmpeg executable
is missing; the complete landscape suite passed without optional recording.
WebKit was attempted but its executable is not installed. Testing used Chromium
with mobile/touch emulation; physical iPhone/Safari and the user's app webview
still need confirmation. Browser/app toolbar pixels remain outside the game's
available content area. Nothing has been pushed, merged or deployed.
