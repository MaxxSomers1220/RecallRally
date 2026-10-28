# Science Lab discovery workshop — review record

## October 28, 2026 — failed workflow investigation

Run `40688735977` at `b56f7e2` was reproduced locally: after five completed
stations, the immediate inventory text read still showed one badge. Diagnostic
instrumentation found `science-lab.open === false` but zero delivered `close`
events at that read. The saved record already contained all five station IDs,
and `ScienceLab.inventoryMarkup()` already returned The Alchemist’s Prism.
After the queued native dialog `close` event, the existing `init()` listener
called `renderAdventure()` and the visible inventory displayed the Prism.

The cause was an unsynchronized browser assertion, not a missing save or an
incorrect reward expectation. The correction waits for the visible inventory
title with Playwright before asserting it, without a fixed delay or another
navigation to force rendering. Production code and distributed HTML are unchanged.

The browser regression now also checks the one-badge inventory after restarting
an unfinished experiment; the completed inventory after return, lab reopening,
Escape, page reload, full browser restart and the standalone HTML; and unchanged
five badges, learning attempts, three Rigby seals and customized hero.

Local verification: Node `v24.22.1`, Playwright `1.62.1`, Chromium
`153.0.8010.0` (isolated tooling outside the repository). All six workflow Node
regressions and all four browser suites passed, including the actual staged
Amplify build commands. No deployment or merge was performed. The earlier
validation record below describes the original workshop work; this section
records the reproduced failure and its correction.

## Recovery and scope

- Default branch verified via `git ls-remote --symref origin HEAD`: `main`.
- Base: `1d1bae4dc92daf032ac584595c1254e809d6d86a` (Quest save/resume PR #7).
- The previous Science Lab was recovered as tracked modifications and untracked
  files on local `feature/alchemist-science-lab`; no remote lab branch existed.
  A complete non-Git archive was verified at
  `/tmp/recallrally-science-lab-recovery.tar.gz`, then the recovered implementation
  was preserved in commit `be5dc00` on the new review branch.
- Remote heads and PR Git refs #1–#7 were inspected. Librarian v1–v4, ten-world
  adventure and save/resume heads are ancestors of current main. The older
  `version-29-adventure-trails` proposal remains outside main and was left intact.
  GitHub GraphQL and REST PR-list requests returned HTTP 403, so current PR state
  could not be established through the API; Git refs alone do not prove PR state.
- Review branch: `feature/science-lab-discovery-workshop`. Only lab code,
  integration/build embeds, lab CI/tests, documentation and review artifacts are
  changed. No dependency manifests, question-bank rows, Librarian implementation,
  production infrastructure, repository permissions or deployment settings changed.
  The recovered baseline includes its previously prepared additive save interface
  and Amplify science-test command. The four improvement passes leave those shared
  interfaces and the existing main-adventure save format unchanged.

## Four bounded passes

| Pass | Hypothesis | Implementation | Evaluation and refinement |
| --- | --- | --- | --- |
| 1 — Predict and observe | The quiz loop needs a clear goal and a real opportunity to test one variable. | A four-step hub route and five optional, ungraded science models. Change one condition, predict, observe, compare. Each model cites an existing Science record and reuses its explanation. | Both conditions and matched/different predictions exercised in all five models. Predictions cannot award academic credit or skip the pending question. Model screenshots inspected. Water-vapor dots explicitly labeled as symbols; blocked light no longer drawn through the screen. |
| 2 — Challenge and repair | A single question trail and color-only progress make difficulty and repair goals unclear. | Explore favors approachable unseen records; Review prioritizes the latest missed ideas; Stretch favors harder unseen records. Separate answered/repaired counts, a repair symbol/text, calmer equipment while thinking, and a direct next-discovery option. | Shared-record selection tests cover all trails; browser checks verify a miss stays incorrect and repair advances the equipment exactly once. Existing five-question station/replay flow retained. |
| 3 — Curiosity and ending | Badges alone give little reason to compare conditions or celebrate the whole lab. | Optional field notes for comparing both conditions, a notebook with original bank explanations, and a player-triggered Prism ending with the selected hero and Fizzwick. | Five notes and all five station badges earned, mistakes in every station, Prism lit and restored after reload. Old v1 saves default optional fields safely. A completed-experiment → model → completed-experiment return bug found during inspection was fixed and covered. |
| 4 — Access and response | Dark source labels, re-rendered controls and small secondary targets can interrupt learning. | Higher-contrast source text, retained condition-button focus, Escape/return focus restoration, 44px secondary touch targets, concise feedback association, and visible phone feedback. | Keyboard, simulated tablet touch, reduced motion, all four viewports, source/profile/save regressions and staged-build play checked. Screenshot review found phone observations below the fold; automatic nearest scrolling now exposes new observations and repair feedback. |

## Validation actually run

Local runtime: Node `v24.19.0`, Playwright `1.62.1`, system Chromium. Existing
GitHub workflows use Node 22; remote CI results are not claimed here.

All of the following completed successfully (exit 0) after implementation:

```sh
node tests/science-lab.test.cjs
node tests/adventure-save.test.cjs
node tests/bank-v29.test.cjs
node tests/worlds.test.cjs
node tests/adventure-effects.test.cjs
node tests/librarian-v4-smoke.test.cjs
SCIENCE_LAB_SCREENSHOTS=/tmp/science-lab-overnight/final-game node tests/science-lab-browser.test.cjs
SCIENCE_LAB_SCREENSHOTS=/tmp/science-lab-overnight/final-review node tests/science-lab-review.test.cjs
node tests/adventure-save-browser.test.cjs
node tests/science-lab-static.test.cjs
node scripts/check-science-lab-assets.cjs
node --check src/science-lab.js
node --check src/science-lab-models.js
node --check src/adventure-save.js
node --check scripts/sync-game-modules.cjs
node --check tests/science-lab-review.test.cjs
node scripts/build-standalone.cjs
git diff --check
```

The standalone build was also checked for repeatability by comparing SHA-256
hashes of both HTML files before and after rebuilding: identical. The inline
application JavaScript is parsed by the save test, and source/standalone embeds
are compared. No package manifest, TypeScript configuration, or lint configuration
exists, so there is no configured type-check/lint command to run. The archived
Librarian v2/v3-specific tests are not current v4 checks; current repository CI
uses `librarian-v4-smoke.test.cjs`, which passed. The Librarian source is unchanged.

The static test runs **each actual command in `amplify.yml`**, in an isolated
temporary directory, with failure status preserved. All ten commands passed:
the six active Node checks, `mkdir`, both `cp` commands and the existing Librarian
injector. It then serves `dist`, verifies the Librarian launcher, exercises both
circuit-model conditions, answers five shared questions, verifies five journal
attempts, and checks the saved badge/note and unchanged Rigby progress. No AWS
deployment is performed.

Browser coverage includes:

- Full five-station path, at least one wrong answer and repair per station,
  exact original question choices/explanations/source IDs, single grading,
  unseen replay selection, and honest learning records.
- Five controlled models, both conditions, differing/correct predictions,
  notebook collection, completed-model return, and optional Prism ending.
- Browser close/reopen, reload, old save validation, separate profiles, study
  packs, import/export, corrupt saves and quota/denied-storage warnings.
- Three already-earned Rigby seals, location, run statistics and customized
  hero remain unchanged while playing the lab. Quest save/resume regression suite
  separately passed its guardian, reset, backup, profile and learning scenarios.
- Keyboard choices, condition Tab/Enter focus, Escape return focus, touch input
  with 44px targets, reduced-motion styles and active equipment animations.
- 1366×768 laptop, 1024×768 tablet landscape, 820×1180 portrait, 390×844 phone.
  Laptop/landscape answer choices and Next stay visible; phones use vertical
  scrolling and bring new feedback into view. No horizontal overflow observed.
- Loaded-game play with network requests blocked, and the complete standalone
  HTML retaining saves at the same origin. No service worker/offline installation
  or direct local-file launch is claimed.

## Actual screenshot artifacts

All screenshots use generated **test profiles**, not real student records.

- [Before: recovered lab hub](screenshots/before-hub.png)
- [After: hub and question trails](screenshots/hub-desktop.png)
- [Model and original science explanation](screenshots/model-desktop.png)
- [Observation feedback on phone](screenshots/model-phone.png)
- [Mistake and repair on landscape tablet](screenshots/repair-tablet.png)
- [Portrait tablet](screenshots/repair-portrait.png)
- [Phone repair feedback](screenshots/repair-phone.png)
- [Prism ending](screenshots/prism-ending.png)

## Limits and fifth-grade playtesting

**Direct fifth-grade playtesting was unavailable.** The working assumptions are:
five questions make a manageable experiment; optional two-condition models help
children form and revise predictions; the bank's editorial difficulty estimates
are useful for Explore/Stretch; and the short UI copy is suitable for fifth grade.
These assumptions are design hypotheses, not measured learning outcomes. Original
science-bank wording and difficulty may still need teacher review.

Physical iPad/Safari, WebKit, screen-reader and classroom testing were unavailable.
Touch was simulated in Chromium, and screenshots were inspected, not reviewed by
a child. The science models are intentionally discrete and simplified, not real
measurement simulations. Unfinished question experiments restart from the hub;
completed badges, notes, learning records and the Prism are preserved. Local
storage remains browser/device/origin specific. No deployment or merge occurred.

Recommended student/teacher questions:

1. Before clicking a station, can you explain the goal and how to earn its badge?
2. Which thing did you change in the model? What did you keep the same?
3. When a prediction differs from the observation, can you explain the clue?
4. After a wrong science answer, can you find the explanation and repair the step
   without thinking your first answer was changed to correct?
5. Do Explore and Stretch feel meaningfully different? Does Review help revisit
   an idea you missed, without feeling like a penalty?
6. Can you tell real science models from Fizzwick's magical equipment effects?
7. Can you find your next station, saved discoveries and Prism? Is the ending
   satisfying without making you feel you must keep playing?

Next highest-value usability pass: watch a fifth grader use the compare controls
and repair flow on a physical iPad, checking reading load, scroll discovery and
touch spacing before adding more content.

