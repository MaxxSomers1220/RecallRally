> Historical v2 design notes. See [README.md](README.md) for the current multiple-choice illustrated encounter and verified delivery workflow.

# The Librarian — illustrated arcade v2

## Purpose
Upgrade the optional literature encounter without changing Quick Recall, Written Warm-up, the ten Rescue Rigby Adventure worlds, or saved hero configurations. This update keeps a lightweight Canvas hazard layer with HTML quiz controls and DOM SVG hero/guardian layers. Phaser remains a future option if we add moving platforms and a scrolling world; there is no CDN or npm dependency.

## Art direction and source
The project's approved cinematic library concept inspired the architecture, blue-violet-candle palette and gothic ambience. The three committed scene assets are new original vector illustrations generated for Recall Rally, not cropped screenshots or borrowed commercial art:

| Asset | Purpose | Transparency | Source |
|---|---|---|---|
| `library-backdrop.svg` | 960 × 460 viewBox, static windows, shelves, balconies, moonlight and stone floor | Opaque | Original project vector illustration |
| `librarian-guardian.svg` | 220 × 260 guardian on balcony; animated by CSS | Yes | Original project vector illustration |
| `enchanted-book.svg` | 120 × 84 ornate flying book hazard; animated by Canvas | Yes | Original project vector illustration |

The live player is generated from the **same** `renderGameHero(avatarLook)` function as the existing game's character creator. The image is rebuilt whenever the player opens The Librarian; current panther/fairy costume selections are retained. This first upgrade animates the **whole character SVG** (running bounce, airborne squash, dash smear, hit stagger and cape sway); it is not yet a frame-by-frame, articulated limb animation.

## Arcade design
The scene uses independent static and animated layers: CSS background, animated guardian SVG, live hero SVG, foreground Canvas warnings, flying books, motion trails and particles, plus accessible DOM quiz controls. Each book uses one of three announced lanes (low, middle, high) with a visible 0.7-second warning before launch. Horizontal movement uses acceleration. Dash (Shift or touch) moves in facing direction and grants a short protection window with a 2.2-second cooldown. Jump (Space/Up/touch) and one shield per storm remain available. Hitboxes are smaller than the illustrated cape and magic effects.

On a missed, blank or timed-out question, the student still completes the dodge and sees the answer plus explanation. Existing separate local question attempt storage remains unchanged.

## Controls
- **Buzzer** during question: Space, Enter, or BUZZ.
- **Movement** during storm: arrow keys / A-D, or touch hold.
- **Jump**: Space, Up, W, or tap.
- **Dash**: Shift or tap DASH.
- **Shield**: S or tap SHIELD.
- **Exit**: Escape or Return to Recall Rally.

## Static deployment
`amplify.yml` copies the three illustrated SVGs with `librarian.js` and `librarian.css` into the static output. Browser assets remain relative to the site root; no new network service is needed.

## Verification
Branch-level JS syntax and mocked runtime state-transition tests were executed during development; SVG tags were checked for balanced opening/closing elements. The existing `tests/librarian.test.cjs` checks boot, file presence and injected HTML references and runs in the Amplify build. Those are **not** substitutes for rendered desktop/iPad QA: inspect real screenshots and keyboard/touch interactions before merging. No physical iPad or live AWS preview has been verified in this change.

## Next polish pass
1. Make the Guardian react to hits and misses with explicit pose frames.
2. Animate individual hero limbs for walk/run/jump using reusable rigged layers while maintaining customization.
3. Add authored danger patterns, book clusters, longer encounters and boss phases only after testing timing with fifth graders.
4. Tie successful practice and missed explanations into the central Learning Journal instead of only the separate arcade record key.
5. Improve source review of book-specific study material; the current keyword-based selector is not official content verification.
