# Study-guide questions: round two

This round adds **200 original questions**, 40 per subject, to the 1,750-question
bank on `main`. The result is **1,950 questions** across the same 64 curriculum
areas. The first expansion's data file and all pre-existing question records are
preserved.

| Subject | Added this round | Total |
| --- | ---: | ---: |
| Mathematics | 40 | 390 |
| Science | 40 | 390 |
| Social Studies | 40 | 390 |
| Language Arts | 40 | 391 |
| Arts & Humanities | 40 | 389 |

## Content and sources

The editable data is `data/study-guide-round-two-2026.json`. Each question has
four distinct choices, an answer, an explanation, optional accepted aliases,
curriculum mapping, an editorial difficulty estimate, and a source PDF filename
with 1-based PDF page numbers. Sources come from the same 16 uploaded documents
inventoried in `data/study-guide-sources-2026.json`; no uploaded PDFs are added to
the repository. The source-handling notes from
[round one](question-expansion-2026.md) continue to apply.

This batch includes new multi-step math situations; material properties,
atmospheric layers, cell structures and body systems; Kentucky cave geography and
frontier settlements; detailed book characters and settings; sentence structure
and spelling applications; instrument construction, musical notation, theater,
and visual-art techniques. The academic content is written as unofficial practice,
not represented as an official competition question set.

Every new stem is checked against the full prior bank after normalization.
Close stems identified during review were revised into different applications,
interpretations, or facts. Related concepts deliberately recur for practice; the
duplicate check does not claim that every concept or correct answer is new.

## Shared-bank integration

The build embeds `STUDY_GUIDE_ROUND_TWO` and appends its records to
`GUIDE_QUESTIONS` once. Both the hosted HTML and the complete offline HTML contain
the same data. New IDs begin with `guide-round-two-2026-`.

- Written practice and the adventure can use all 200 additions.
- Quick Recall can use 191; nine questions in math areas 02, 07, and 10 remain
  written-only. The complete bank contains 1,818 Quick Recall questions and 132
  written-only questions.
- All 40 new science questions are eligible for the existing Science Lab topic
  selection, and the Librarian can use eligible new literature questions.
- The source selector shows 1,675 Study-guide practice questions, 150 Elementary
  topic questions, and 125 General warm-ups.

## Validation

The expansion regression check covers both 200-question batches, the matching
data embedded in both HTML editions, IDs, normalized duplicate stems, choices,
aliases, source-page bounds, all 64 topic areas, written-only restrictions, all ten
adventure worlds, Science Lab eligibility, and the Librarian's real selector.
The answer-recognition test checks correct answers and aliases, and rejects all
distractors throughout the 1,950-question bank.

The browser check exercises questions from both batches in every subject in both
HTML editions, then checks the new Ochoa short-answer alias, wrong-answer
rejection, explanations, source citations, and journal entries. It switches the
browser offline after loading from the local test server. Direct `file://`
navigation is restricted by the managed test browser, as documented in round one.

Difficulty labels are editorial estimates rather than measurements of student
performance. The uploaded sources are historical study materials and are not a
complete update of current events after 2025.

Validation result: all 22 Amplify build checks passed, as did the Chromium browser
check in both HTML editions. A field-by-field comparison against the prior bank
confirmed that all 1,750 previous records remain unchanged. The first expansion's
JSON is also unchanged.
