# Study-guide questions: round four

Adds **200 original practice questions**, 40 per subject, bringing the built-in
bank from **2,150 to 2,350**. This batch covers all **64 curriculum areas**.
A SHA-256 snapshot verifies that the previous 2,150 question records remain
identical, including IDs, answers, aliases, order and metadata.

| Subject | Added | Built-in total |
| --- | ---: | ---: |
| Mathematics | 40 | 470 |
| Science | 40 | 470 |
| Social Studies | 40 | 470 |
| Language Arts | 40 | 471 |
| Arts & Humanities | 40 | 469 |
| **Total** | **200** | **2,350** |

## Content and sources

Editable records: [study-guide-round-four-2026.json](../data/study-guide-round-four-2026.json).
Every record contains four distinct choices, an explanation, optional accepted
aliases, a curriculum topic, an editorial difficulty estimate, and a source PDF
filename with 1-based page references. Sources use the existing uploaded-guide
inventory. No uploaded PDFs are added to the repository. The source-handling
notes from [round one](question-expansion-2026.md) continue to apply.

Topics include new calculations and spatial problems; material comparisons,
physiology and invertebrate life cycles; Kentucky landforms and frontier history;
interpretation of government and economic situations; supporting book characters,
poetry, grammar and spelling; less-common instruments, composition details,
choreography, theater, art techniques and cultural icons.

Questions are authored, unofficial practice rather than copied competition
items. PDF references identify the concept or study-topic basis; the new
numerical examples and reasoning tasks are original. Five expanded historical
or cultural details also carry a `verificationSource` with a primary-source URL
and check date. These include the National Park Service, OpenAI's original
London announcement, the IOC, Disney's official press room and Michael Jackson's
official album catalogue. The guide's cultural-icon appendix explicitly allows
historical figures as well as recent icons. Dated events are anchored to their
years rather than presented as current officeholders or changing rankings.

Exact normalized prompts were checked against all previous questions and the
new batch. Similar same-answer prompts were reviewed, and close retellings were
replaced with different details, applications or reasoning tasks. Related
concepts and some correct answers still recur for practice; this is not a claim
that every learning target is new.

## Availability across the game

- All **200** enter the guide selection and the matching Written/Adventure
  subject pools, including Rescue Rigby. All 40 science additions enter the
  Science Lab pool; eligible literature additions enter The Librarian's pool.
- **166** additions support Quick Recall. **34** are written-only: nine follow
  the written-only math curriculum areas, and twenty-five compare visible
  choices or full-sentence explanations. Those twenty-five have an explicit
  `modeRationale`, keeping unseen-choice tasks out of buzzer practice.
- Combined totals: **2,155 Quick Recall** questions and **195 written-only**
  questions. Written mode can use all 2,350.
- Both HTML editions embed `STUDY_GUIDE_ROUND_FOUR` and append it to the shared
  guide bank once. New IDs begin `guide-round-four-2026-`. Displayed built-in
  source counts are updated to 2,075 guide, 150 elementary and 125 general items.
- Existing saves, scoring, mobile layout and guardian animations retain their
  implementations.

## Validation performed

- `node scripts/build-standalone.cjs`: passed.
- All **22 static checks** from `amplify.yml`: passed locally.
- `node tests/study-guide-expansion.test.cjs`: passed for all four batches and
  both editions. Checks counts, 64-topic coverage, duplicate prompts/IDs, options,
  aliases, source page bounds, provenance, mode restrictions, all ten Adventure
  pools, Science Lab/Librarian selection, and both the earlier 1,950-record and
  new 2,150-record preservation snapshots.
- `node tests/study-guide-expansion-browser.test.cjs`: passed in Chromium for
  both HTML editions with network access disabled after loading. Exercises new
  written questions from every subject in all four batches, explanations, PDF
  citations, journal recording, the new Monet alias, numeric density units, and a
  punctuation-dependent written question. Earlier Kepler/Ochoa aliases,
  written-only coordinate grading and wrong-answer rejection also pass.

To preview, serve the repository or open `Ellery_Recall_Rally_Librarian_v4.html`
and select the guide or full question bank. New questions mix with existing
content. This branch is a review build, not a confirmed production deployment.
