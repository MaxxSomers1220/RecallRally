# The Librarian — illustrated multiple-choice encounter

Launch **The Librarian** from Recall Rally's home screen. The current game asks eight literature questions with four choices and a 16-second answer window. A miss or timeout starts the existing 7.8-second book storm. High books require ducking; low books require jumping. The correct answer, explanation and original source appear afterward. This is the current v4 multiple-choice game, not the historical buzzer prototype.

Correct answers retain their original points/speed bonus. Dodge/shield rewards, four hearts, defeat recovery, question selection, journal integration and `recall-rally-librarian-v1` history are unchanged. Reviewed eligible questions come from the shared bank; the original, explicitly labeled demonstration fallback remains separate from academic journal records.

## Controls

- Answer: click/tap A–D or press 1–4.
- Move: A/D or left/right arrows; touch hold Left/Right.
- Duck: Down/S or hold Duck. Jump: Space/Up/W or tap Jump.
- Dash: Shift or tap Dash. Shield: Q or tap Shield, once per storm.
- Exit: Return to Rally or Escape.

Movement controls appear during storms. In review, the explanation and Next get priority. Pointer cancellation and lost focus release held controls. Reduced motion keeps warning lanes, poses and feedback visible without optional animation.

## Illustrated scene and character preservation

The original painted room has carved shelves, varied antique books, stained glass, ladders, moonlight, candlelight and an empty central balcony. Independent DOM planes use one cached painting with masks for the distant room, shelving and balcony rail, plus a separate foreground SVG and lighting layer. The balcony sits in front of the guardian's lower robe; the hero, canvas hazards and warnings remain above the scenery. All foreground carving is below the unchanged FLOOR=405 baseline.

An original inline SVG Librarian has curious, impressed, preparing, casting, frustrated and satisfied expressions, independent head/arm poses, a floating reading book and a bounded casting gesture. Three original flying-book page poses animate in the existing canvas loop, with the original visible dimensions and collision bounds. Warning lanes have a dark contrast backing and a steady high/low label rather than flashing.

The hero still comes from the saved `renderGameHero(avatarLook)` configuration. An opt-in `articulated` option adds semantic groups only for the arcade. Local clipped limb instances reuse the exact customized geometry, gradients, shoes, skin, hair and clothing. Running swings separate legs/arms; jumping tucks the legs; ducking bends the upper body and legs instead of scaling down the whole hero. This is lightweight layered articulation, not a new universal skeletal system or frame-by-frame sprite pack. Noncombat review/completion poses are grounded visually without changing physics state. The normal shared renderer's idle output is byte-identical for all 48 baseline fairy/panther × outfit × shoe combinations tested.

## Assets and offline delivery

`art-manifest.json` records asset roles, dimensions, budgets, hashes and provenance. The painted room was created with OpenAI's image_gen tool for this project. The guardian, three book poses and foreground are original project-authored SVG from `scripts/draw-librarian-illustrations.py`. No borrowed artwork, remote fonts or runtime dependency was added.

Run `node scripts/build-standalone.cjs` after edits. It runs the module/art synchronization and creates `Ellery_Recall_Rally_Librarian_v4.html`. `scripts/sync-librarian-art.cjs` embeds the local art into `librarian.css` and `librarian.js`; Amplify copies those bundles, so play never needs separate image requests. The standalone file embeds both bundles.

## Verification

```sh
node scripts/build-standalone.cjs
node tests/librarian-art.test.cjs
node tests/librarian-v4-smoke.test.cjs
python scripts/check-librarian-assets.py
CHROMIUM_PATH=/usr/bin/chromium node tests/librarian-illustrated-browser.test.cjs
CHROMIUM_PATH=/usr/bin/chromium node tests/science-lab-static.test.cjs
```

The Python asset checker uses Pillow as a development tool. Browser tests use Playwright and an installed Chromium, with tools installed outside the game checkout in CI. They cover the full encounter, controls, actual collision/dodge/shield behavior, source questions and grades, all guardian moods, customized hero preservation, four viewport sizes, reduced motion and offline replay. The static test executes the actual Amplify build and then plays all five Science Lab stations plus a real Librarian storm/review sequence from its output.

See [actual gameplay screenshots and detailed test results](../docs/reviews/librarian/README.md). Physical iPad/iPhone and Safari/Firefox testing remain separate follow-up work. `ARTWORK-v2.md` is historical design documentation.
