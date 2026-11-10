# Study-guide questions: round three

Adds **200 original practice questions**, 40 per subject, bringing the built-in
bank from **1,950 to 2,150**. All 64 curriculum areas receive new questions. A
SHA-256 snapshot of the prior bank verifies that all 1,950 existing records,
including IDs, answers, aliases, ordering and metadata, remain identical.

| Subject | Added | Built-in total |
| --- | ---: | ---: |
| Mathematics | 40 | 430 |
| Science | 40 | 430 |
| Social Studies | 40 | 430 |
| Language Arts | 40 | 431 |
| Arts & Humanities | 40 | 429 |
| **Total** | **200** | **2,150** |

## Content and provenance

The editable records are in [data/study-guide-round-three-2026.json](../data/study-guide-round-three-2026.json).
Each has four distinct choices, an explanation, optional accepted short-answer
aliases, a curriculum topic, an editorial difficulty estimate, and a source PDF
filename with 1-based PDF page references. The curriculum basis is the uploaded
study guides already inventoried in `data/study-guide-sources-2026.json`.
The source-handling notes in [round one](question-expansion-2026.md) still apply.
These are original, unofficial practice items based on the guides, not copied
contest rounds or an official question set. Guide references identify the basis
for a concept or study topic; new calculations and examples are authored practice.

This batch includes new math applications, experimental reasoning, organism
comparisons, Kentucky geography, government and civic interpretation, detailed
book characters and settings, grammar applications, instruments, composers,
choreographers, and visual-art media. Dated events state the relevant year rather
than claiming to describe today's officeholders or latest awards. Cultural-icon
questions include historical figures, as the uploaded guide explicitly permits.

Exact normalized stems were checked against the full existing bank and the new
batch. Similar stems with the same answer were also reviewed; close retellings
were replaced with different examples, details, or reasoning tasks. Related
concepts and some answers recur for practice; this is not a claim that all 200
learning targets have never appeared before.

## Availability across the game

- All **200** are eligible for Written warm-up, guide selection and matching
  Adventure/Rescue Rigby subject pools. All 40 new science records enter the
  Science Lab pool; eligible literature records enter The Librarian's pool.
- **171** new items support Quick Recall. **29** are written-only: nine fall in
  the curriculum's written-only math areas, and twenty require displayed choices
  or full-sentence comparisons. Those twenty carry an explicit `modeRationale`.
  This avoids asking a buzzer-practice player to select an unseen sentence or
  guess the exact wording of a long explanation.
- Combined totals are **1,989 Quick Recall** questions and **161 written-only**
  questions. Written mode can use all 2,150 records.
- The build embeds `STUDY_GUIDE_ROUND_THREE` once in each HTML edition and appends
  it to the existing shared guide bank. IDs begin `guide-round-three-2026-`.
  Existing saves, layout, guardian animations and scoring logic are unchanged.

## Checks performed

- `node scripts/build-standalone.cjs`: builds both embedded editions.
- All **22 static checks** in `amplify.yml`: passed, including the question bank,
  save boundaries, answer handling, characters, worlds and mini-games.
- `node tests/study-guide-expansion.test.cjs`: passed for all three batches and
  both HTML editions. Checks counts, 64-topic coverage, source page bounds,
  duplicate stems/IDs, distinct options, aliases, mode restrictions, provenance,
  all ten Adventure pools, Science Lab, Librarian and the unchanged prior-bank hash.
  The test now reuses its actual source/pool selections instead of recomputing
  every pool for every record; the same assertions finish within their existing
  timeout as the bank grows.
- `node tests/study-guide-expansion-browser.test.cjs`: passed in Chromium with
  the network disabled after loading, for both HTML editions. Plays new written
  questions from all subjects and all three batches, validates feedback and PDF
  citations, records attempts, accepts the new Kepler alias, grades a written-only
  coordinate problem, preserves the earlier Ochoa alias and rejects a wrong choice.

Preview locally by opening `Ellery_Recall_Rally_Librarian_v4.html` or serving the
repository and selecting the guide or full question bank. Questions mix naturally
with existing content. This review branch is not a confirmed production deployment.
