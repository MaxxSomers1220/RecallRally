Players can visit Fizzwick's lab, predict and compare a simple science model,
answer five shared-bank questions, recover from a harmless mishap, and keep a
discovery badge. Five stations culminate in the Alchemist's Prism. This branch
includes the previously unmerged Science Lab plus four tested improvement passes.

### Gameplay

- Five optional, ungraded one-variable models cite existing science-bank records:
  freezing water, a circuit switch, light for photosynthesis, condensation, and
  reflected lamp light as a Moon model. Original explanations and quiz records
  remain intact; model guesses never become academic grades or question skips.
- Explore, Review and Stretch provide approachable unseen questions, missed-idea
  practice, and harder unseen questions. These use existing difficulty estimates
  and the active profile's journal, without changing correct answers or distractors.
- Separate answered/repaired counts, explicit repair steps and next-discovery
  navigation make the five-question goal visible. Incorrect first answers stay
  incorrect after a repair. All badges remain available without a perfect score.

### Presentation

- Original illustrated laboratory, five distinct equipment reactions, expressive
  Fizzwick and the existing customized hero.
- Clear hub route, numbered/checkmarked/repair states, immediate feedback, and
  calmer equipment while thinking. Model/source text has stronger hierarchy.
- Complete single-file HTML and normal static Amplify output include the same
  lab; Librarian v4 and Quest save/resume remain available.

### Story & Rewards

- Comparing both model conditions collects an optional field note with the
  original bank explanation. A field notebook makes discoveries revisitable.
- A player-triggered Prism ending reunites the hero, professor and five badges.
  The Prism is cosmetic; it cannot answer or skip questions. Humor is encouraging,
  with magical effects explicitly distinguished from real science.
- Optional `notes` and `prismLit` fields default safely for old v1 lab saves and
  backups. Main guardian progress, seals, location, hero and learning history are
  preserved; the lab keeps its separate stable-profile save record.

### Accessibility

- Keyboard question/prediction choices, retained condition-button focus,
  completed-model return, and Escape focus restoration.
- 44px touch buttons/selectors; readable source colors (model-source contrast
  checked at ≥4.5:1), visible focus and non-color-only status cues.
- Reduced motion, existing sound preferences and responsive laptop/tablet/phone
  layouts. Phone observations and repair feedback are brought into view.

### Validation — local checks passed

All commands below completed with exit 0:

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

- Full five-station path, a mistake/recovery in every station, original question
  metadata, journal grading, Prism ending, reload/reopen, independent profiles,
  backups, corrupt/denied storage, keyboard, touch and reduced motion passed.
- Inspected rendered screenshots at 1366×768, 1024×768, 820×1180 and 390×844.
- The static test executed all ten actual `amplify.yml` commands in an isolated
  staging directory, then played the output alongside the Librarian launcher.
- Both HTML rebuild hashes were repeatable. Question-bank bytes and Librarian
  source/CSS are unchanged from main; the shared save module is unchanged from
  the recovered lab baseline. No dependency or deployment changes were added.
- No configured lint/type-check commands exist. Current v4 checks passed; retired
  v2/v3-specific Librarian tests are not the current CI contract. Local testing
  used Node 24.19.0 / Playwright 1.62.1 / Chromium; remote CI uses Node 22 and has
  not been verified through GitHub's API.

### Actual screenshots and review report

- [Before hub](https://github.com/MaxxSomers1220/RecallRally/blob/feature/science-lab-discovery-workshop/docs/science-lab-review/screenshots/before-hub.png)
- [After hub](https://github.com/MaxxSomers1220/RecallRally/blob/feature/science-lab-discovery-workshop/docs/science-lab-review/screenshots/hub-desktop.png)
- [Prediction model](https://github.com/MaxxSomers1220/RecallRally/blob/feature/science-lab-discovery-workshop/docs/science-lab-review/screenshots/model-desktop.png)
- [Phone observation](https://github.com/MaxxSomers1220/RecallRally/blob/feature/science-lab-discovery-workshop/docs/science-lab-review/screenshots/model-phone.png)
- [Tablet repair](https://github.com/MaxxSomers1220/RecallRally/blob/feature/science-lab-discovery-workshop/docs/science-lab-review/screenshots/repair-tablet.png)
- [Portrait tablet](https://github.com/MaxxSomers1220/RecallRally/blob/feature/science-lab-discovery-workshop/docs/science-lab-review/screenshots/repair-portrait.png)
- [Phone repair](https://github.com/MaxxSomers1220/RecallRally/blob/feature/science-lab-discovery-workshop/docs/science-lab-review/screenshots/repair-phone.png)
- [Prism ending](https://github.com/MaxxSomers1220/RecallRally/blob/feature/science-lab-discovery-workshop/docs/science-lab-review/screenshots/prism-ending.png)
- [Recovery, four-pass hypotheses/results, full validation and limitations](https://github.com/MaxxSomers1220/RecallRally/blob/feature/science-lab-discovery-workshop/docs/science-lab-review/REVIEW.md)

Screenshots use generated test profiles, not real student records. No merge or
deployment is requested by this PR.

### Known limitations and fifth-grade playtesting

**Direct fifth-grade playtesting was unavailable.** Assumptions needing review:
five questions make a manageable experiment; optional comparisons help prediction
skills; editorial difficulty ratings suit Explore/Stretch; and the concise UI
copy is appropriate for fifth grade. No learning gains or reading-level scores
were measured. Existing bank wording was preserved rather than simplified.

Physical iPad/Safari, WebKit and screen-reader testing were unavailable. Touch was
simulated in Chromium. Models are discrete and simplified, not measurements.
Unfinished experiments restart; badges, notes, first-answer records and Prism are
kept. Saves remain local to the browser/device/origin. Live AWS deployment and
offline app installation were not performed.

Recommended fifth-grade playtesting questions:

1. Can you explain the station goal and how to earn a badge before starting?
2. What did you change in the model, and what stayed the same?
3. What clue helped when your prediction and observation differed?
4. Can you repair a mistake while understanding that My learning keeps the first
   answer's grade?
5. Do Explore/Review/Stretch feel useful and fair? Can you distinguish real science
   models from the magical equipment reactions?
6. Can you find the next station and your saved discoveries on an iPad? Does the
   Prism ending feel satisfying while leaving you free to stop?
