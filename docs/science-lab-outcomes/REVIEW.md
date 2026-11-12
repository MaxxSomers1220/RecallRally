# Science Lab: three correct answers make the experiment work

Review branch: `feature/science-lab-three-of-five`, based on current main
`aee2d54`. No deployment or merge is part of this change.

All five stations use the original five question grades: 3–5 correct succeeds;
0–2 ends in a harmless fantasy mix-up. Every fifth answer and bank explanation
is reviewed before the player chooses **Show experiment result**. Repairs are
practice, never academic credit. The visible correct count and goal are separate
from the animated preparation steps. Complete equipment is revealed only on a
successful result, including a 3/5 result with two mistakes.

Each failed experiment has its own bounded effect: foam, smoke, a chamber cloud,
a tiny windstorm with papers/hat, or scrambled stars and a spinning telescope.
Fizzwick scrambles to contain the mess and encourages another try. Successful
experiments shimmer and reveal the existing finished equipment/creature, with
praise. These are explicitly fantasy game effects. No new science questions or
facts were created. New motion finishes within three seconds; reduced motion
keeps the static outcome. Phones show the reaction before the result copy.

New badges require success. Older v1 badges are retained, even if earned under
the previous rule. Failed replays preserve every earned badge, best score and
Prism. The existing profile-scoped v1 save format is unchanged; failed first
experiments remain in the shared journal, without creating an earned-badge
record. All original question attempts remain correctly graded.

## Validation

Successful checks (exit 0):

- `node scripts/build-standalone.cjs --science-lab-only`: main/standalone embedded
  lab rebuilt. Repeating the build produces identical SHA256 hashes.
- `node tests/science-lab.test.cjs`: original question records, five station
  mappings, explanations, trails, custom eligibility, old save validation and
  artwork checks.
- `CHROMIUM_PATH=/usr/bin/chromium node tests/science-lab-outcomes-browser.test.cjs`:
  each station 2/5, 3/5 and 5/5; fifth explanations before rewards; honest grades;
  failed replay with five existing badges/lit Prism; reload; separate profiles;
  main adventure and hero unchanged. 85 actual question attempts across profiles.
- `CHROMIUM_PATH=/usr/bin/chromium node tests/science-lab-browser.test.cjs`:
  five-station path, journal, saves, backups, profiles, interrupted runs, storage
  failures, main-quest preservation, offline-loaded play, controls.
- `CHROMIUM_PATH=/usr/bin/chromium node tests/science-lab-review.test.cjs`:
  optional science models, honest predictions, notebook, Prism, focus, four
  layouts, separate profiles and source contrast.
- Each of `CHROMIUM_PATH=/usr/bin/chromium node tests/{potion,circuit,creature,weather,observatory}-browser.test.cjs` ran separately and passed: actual animation, mistakes/repairs at each step, end-only success reveal, failed replays, four layouts, keyboard/touch, reduced motion and offline standalone play.
- `node tests/adventure-save-browser.test.cjs`: two/three seals, map location,
  interrupted duel, reset confirmation, profiles/customization, import/export,
  same-origin updates, offline-loaded play and denied/corrupted storage.
- `CHROMIUM_PATH=/usr/bin/chromium node tests/science-lab-static.test.cjs`:
  all 26 actual Amplify commands passed in an isolated copy (including normal
  standalone build, all 24 Node test commands and hosted build). Then the actual
  hosted artifact passed five stations, bank/journal/model/badges and a real
  Librarian storm/review. No deployment.
- `node --check` for lab implementation, outcome artwork module and new outcome
  browser suite; `git diff --check`.
- Byte comparison: index outside the lab script/style blocks, shared save module,
  question/model records and Librarian source all remain unchanged from base.

Rendered QA captured all ten station/result combinations and failures at
1366×768, 1024×768, 820×1180 and 390×844. Browser checks verified the professor
actually moves, all stage motion finishes, reduced motion has no active stage
animation, the failed creature stays hidden, controls remain reachable and no
horizontal overflow or browser errors occur.

The source-only preliminary Node run found four existing unsynchronized
source/embed expectations (home hub, startup, soundtrack and hosted audio
metadata). The normal build step regenerates those embeds; all four then passed
inside the full staged Amplify pipeline. The lab-only rebuild preserves the
reviewed main HTML outside the requested feature. Two stale static browser
expectations were updated to match the existing hosted asset URLs and the
already-merged 20-second Librarian storm; no Librarian implementation changed.

Local screenshots: `/tmp/science-lab-outcomes-final/` (15 score-specific results)
and `/tmp/science-lab-outcomes-qa/` (all five reactions, four layouts, motion and
reduced motion). These are rendered game screenshots, not mockups.

## Limits

Chromium and simulated touch were used. Physical iPad/Safari, screen readers and
direct fifth-grade playtesting were unavailable. No live AWS deployment or
cross-device synchronization was tested. Existing local-save limitations still
apply. Watch a fifth grader try a 2/5 then 3/5 experiment on an actual iPad to
check that the correct-count goal, practice repairs and result are easy to tell
apart, and that the comic reaction feels encouraging.
