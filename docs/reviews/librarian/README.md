# Librarian illustration upgrade — playable review

Branch: `feature/librarian-illustrated-encounter`, from latest main at `30bd46a` (all five Science Lab upgrades included). Open the branch game → **The Librarian**. The complete offline package is `Ellery_Recall_Rally_Librarian_v4.html`. This is integrated game artwork, not a mockup. No production deployment or merge is part of the change.

## What changed

The Science Lab/Potion Mixer quality benchmark informed the layered illustration, state-based reactions, clear progress/feedback and offline asset workflow. The existing v4 implementation and tests were inspected directly; the old v1/v2 documentation described gameplay that no longer matched the live multiple-choice encounter.

A new original painted environment creates a richly detailed gothic library: carved walnut shelves with varied antique books, stained glass, rolling ladders, an elevated balcony and warm candles against blue-violet moonlight. Room, clipped shelving, clipped balcony, lighting and carved foreground are separate DOM planes, using one cached painting plus a transparent foreground SVG. This preserves registration and avoids mismatched generated layers. The balcony rail occludes the Librarian's lower robe while all hero/hazard/warning layers remain above the scenery. The lower walkway stays clear; foreground carving begins below the unchanged collision baseline.

The new Librarian has six original face groups and separate head/arm/reading-book gestures:

| Situation | Reaction |
| --- | --- |
| Question or welcome | Curious glance, open hands and a gently floating book |
| Correct answer | Raised brows, smile and pleased gesture |
| Book warning | Preparing pose with a restrained spell glow |
| Book launch | Casting arms, open mouth and a brief book gesture |
| Successful dodge/shield | Comically frustrated brow and head shake |
| Completion/defeat | Satisfied smile; defeat stays friendly |

Flying books use three ornate page poses in the existing canvas loop, with short magical trails and unchanged draw size/hitboxes. High/low warning lanes have dark contrast backing and steady colored labels. No new particle storm, timer, physics engine or third-party runtime was added.

A local hero rig reuses the existing customized character. An opt-in renderer flag adds layer groups; SVG uses split original limb geometry into independently animated hips/arms. Running swings limbs, jumping tucks the legs, and ducking bends the torso/legs without squashing the whole character. Brief impact/recovery gestures remain. Both Fairy and Panther configurations were exercised. This is layered articulation rather than a universal skeletal rewrite. The normal shared renderer's idle output remains byte-identical across 48 baseline style/outfit/shoe combinations, preserving all other game modes.

Movement controls are shown when storms make them usable; questions and explanations get that space during learning. The live question, choices, timer, answer/source, feedback and Next remain DOM text and buttons. Scenery and warning labels no longer obscure the guardian. Reduced motion retains poses, lanes and feedback without ambient animation.

## Gameplay preserved

A baseline contract fixture at `30bd46a` protects the original question selection, options, academic recording, choice lock, warning scheduling, launch behavior, jump, dash, shield, collisions, defeat, review, completion and update functions. Only presentation reaction calls are stripped for that comparison; their original logic remains exact.

Eight questions, 16-second answer window, 7.8-second storms, warning durations, projectile speeds/positions, hero movement/jump physics, hitboxes, hearts, scoring, dodge/shield rewards, save/history keys and Learning Journal behavior are unchanged. Review/completion ground the displayed hero without changing the physics state. Reopening removes the old scene, frame callback and listeners as before. No questions or explanations were rewritten. Existing Science Lab, written/quick practice, Adventure progress and saved appearance were regression tested.

## Actual rendered screenshots

Before:

![Original book storm](before-desktop-storm.png)

![Original phone layout](before-phone-storm.png)

Integrated welcome, question and complete wrong-answer sequence:

![Illustrated welcome](desktop-intro.png)

![Illustrated question](desktop-question.png)

![Preparing and high-book warning](desktop-warning.png)

![Casting and flying book](desktop-casting.png)

![Independent running limbs](desktop-run.png)

![Bending duck pose](desktop-duck.png)

![Successful dodge and frustrated Librarian](desktop-dodge.png)

![Jump and tucked legs](desktop-jump.png)

![Dash](desktop-dash.png)

![Shield blocks a book](desktop-shield-block.png)

![Hit response](desktop-hit.png)

![Correct answer and original explanation after storm](desktop-explanation.png)

![Correct answer and impressed Librarian](desktop-correct.png)

![Full eight-question completion with honest 6/8 result](desktop-complete.png)

![Defeat with answer review and recovery Next](desktop-defeat.png)

![Customized Panther duck pose](desktop-panther-duck.png)

Responsive and packaged gameplay:

![Landscape tablet](tablet-landscape-question.png)

![Portrait tablet](tablet-portrait-question.png)

![Phone storm and active controls](phone-warning.png)

![Phone explanation and Next](phone-explanation.png)

![Disconnected reduced-motion replay](phone-offline-reduced.png)

![Real storm from staged Amplify output](staged-book-storm.png)

These are actual browser screenshots. Automated tests additionally retain intro and other per-device states as CI artifacts. Baseline pictures show the original default hero; the new pictures deliberately use customized heroes to exercise identity preservation.

## Validation actually run

- `node scripts/build-standalone.cjs` — embeds current local art and modules into both delivery routes.
- `node tests/librarian-art.test.cjs` — verifies exact protected v4 behavior against the baseline function hashes, six guardian face groups, three distinct book poses, byte budgets/provenance hashes, no remote SVG code/resources, and exact CSS/JS in the standalone package.
- `python scripts/check-librarian-assets.py` — actual WebP/SVG dimensions, hashes, byte budgets and XML/local-resource validation. The original 1812×868 painted room is 373,420 bytes as WebP; source PNG remains in the session's generated_images folder. Asset metadata/prompt/provenance are in `librarian/art-manifest.json`.
- `CHROMIUM_PATH=/usr/bin/chromium LIBRARIAN_SCREENSHOTS=docs/reviews/librarian node tests/librarian-illustrated-browser.test.cjs` — complete eight-question encounters at **1366×768, 1024×768, 820×1180 and 390×844**, with real four-choice bank questions and keyboard/touch answers; duplicate-grade protection; original question/answer/explanation and journal records; six visibly selected guardian expressions; actual warning/launch; running and independently moving legs; high-book duck and dodge reward; low-book jump; dash; once-only shield block; single-hit collision and recovery; completion with 6/8 first grades; defeat and restored hearts; closing/reopening during a storm; pointer cancellation; native phone jump/shield taps; unchanged hero/lab/Rigby state; offline reduced-motion replay. No browser script errors. Four complete eight-question runs plus defeat, interrupted and offline scenarios were exercised. Scripted controlled-time cases use opt-in test hooks; physics and actual browser input handlers remain live. The packaged test below additionally runs a normal real-time storm.
- Baseline default hero fixture: all **48 Fairy/Panther × six outfits × four shoe configurations** render byte-identically outside the optional arcade rig. Both actual arcade rig styles were also tested.
- `CHROMIUM_PATH=/usr/bin/chromium node tests/science-lab-static.test.cjs` — executes **every actual Amplify command** in isolated staging, plays all five illustrated Science Lab stations (25 attempts), then enters the Librarian using the real staged CSS/JS bundles and survives a normal real-time book storm with held Duck. Checks the painted room, guardian, explanation/Next and one additional honest journal answer: 26 total attempts. No deployment.
- `CHROMIUM_PATH=/usr/bin/chromium node tests/player-experience-browser.test.cjs` — four viewport sizes; shared hero, scoring, feedback, timer/pause/untimed controls, journal and Librarian close passed.
- `CHROMIUM_PATH=/usr/bin/chromium node tests/adventure-save-browser.test.cjs` — original seals, hero, independent profiles, interrupted duel, restart/reload, reset/import confirmations, offline play and failed/denied storage passed.
- `CHROMIUM_PATH=/usr/bin/chromium node tests/science-lab-browser.test.cjs` — all five stations, original questions/options/explanations, grades, badges/Prism, profiles, custom packs, backups, restart, offline play, storage failures, unchanged hero and Rigby progress passed.
- All current Amplify unit gates passed, including all five Lab art checks, bank/world/adventure checks, home launcher, answer recognition and Librarian v4. Syntax and clean-diff checks passed.

The new `librarian-art.yml` PR workflow repeats the art/behavior, four-device browser and actual static-output checks and uploads gameplay screenshots. The original v1/v2/v3 Librarian tests target superseded prototypes; current validation uses the v4 and new illustrated-encounter suites.

## Limits and next review

Testing used automated Chromium and emulated touch devices, not physical iPad/iPhone, Safari or Firefox. Offline tests load the self-contained document locally and then disable networking; direct file navigation is not claimed as tested. No live Amplify preview URL or deployment is claimed.

The highest-value next visual check is the duck/jump silhouette, book warning readability and guardian expression timing on a physical iPad. Keep this change in a draft PR; do not merge into main.
