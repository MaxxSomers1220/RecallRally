# Round six: 500 additional practice questions

Adds 100 questions per subject, increasing the built-in bank from 2,550 to 3,050.
The previous 2,550 complete records are preserved by a SHA-256 snapshot.

| Subject | Added | Total |
| --- | ---: | ---: |
| Mathematics | 100 | 610 |
| Science | 100 | 610 |
| Social Studies | 100 | 610 |
| Language Arts | 100 | 611 |
| Arts & Humanities | 100 | 609 |
| Total | 500 | 3,050 |

## Content

Editable questions: `data/study-guide-round-six-2026.json`.
This is an application-heavy practice batch across 37 curriculum areas. It adds
new numerical examples, experimental scenarios, sentences, and classification
tasks. Related concepts deliberately recur; this is not a claim of 500 new facts
or 500 distinct learning targets. The complete game retains all 64 areas.

- Math: integer changes, data, purchasing, fractions, percents, conversions,
  coordinates, border areas, counting combinations, and equations.
- Science: independent/dependent variables in varied experiments, density,
  motion, bacterial division, cells, plants, animals, body systems, Earth
  processes, light, circuits, and sound.
- Social Studies: map scales, population density, revenue and profit, branches
  of government, First Amendment freedoms, historical documents, and economic
  choices.
- Language Arts: original grammar examples, word choice/spelling, roots and
  affixes, and identifying figurative language.
- Arts: rhythm calculations, visual media and subjects, instrument families,
  dance, music performance, drama, and design terminology.

Every record has four distinct options, an explanation, curriculum metadata,
editorial difficulty, modes, and a guide filename with 1-based PDF references.
References identify the guide concept or topic basis; scenarios and calculations
are original, unofficial practice, not copied competition items. Sources use
the existing uploaded-guide inventory, with no PDFs added to Git. The source
notes in `question-expansion-2026.md` continue to apply.

Normalized prompts were checked against the existing bank and within this
batch. Repeated application patterns and correct answers remain intentional
practice; exact normalized duplicate stems are rejected by the shared test.

## Availability

All 500 support Written mode and matching Adventure subject pools, including
Rescue Rigby. The 100 science questions enter Science Lab selection; eligible
language questions enter the Librarian selection through its existing rules.
Both HTML editions embed the same data once as `STUDY_GUIDE_ROUND_SIX`.

380 additions support Quick Recall. 120 are written-only: 20 follow the data and
coordinate curriculum restrictions, and 100 evaluate displayed examples or
complete explanations. The bank totals 2,684 Quick Recall and 366 written-only
questions. Displayed source counts are 2,775 guide, 150 elementary, 125 general.

## Validation

- Standalone build: passed.
- All 22 static checks in `amplify.yml`: passed on the final build.
- Shared guide tests validate all six batches, subject/topic counts, options,
  prompt/ID uniqueness, source page bounds, mode eligibility, both embeds,
  Adventure pools, Science Lab/Librarian selection, and preservation snapshots.
- `node tests/study-guide-expansion-browser.test.cjs`: passed in Chromium for
  both HTML editions with networking disabled after loading. Includes new
  round-six questions from all five subjects, correct scoring, explanations,
  PDF citations and journal recording, plus existing typed-answer and
  wrong-answer regressions.

The branch includes the previously merged guardian-attack and Main menu fixes.
This is a review build; production deployment is not confirmed.
