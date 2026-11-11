# Uploaded-guide question expansion

The expansion adds **200 original practice questions**, 40 per subject, covering
all 64 existing curriculum areas. It increases the shared bank from 1,550 to
1,750 records without replacing or renumbering existing questions.

| Subject | Added | New total |
| --- | ---: | ---: |
| Mathematics | 40 | 350 |
| Science | 40 | 350 |
| Social Studies | 40 | 350 |
| Language Arts | 40 | 351 |
| Arts & Humanities | 40 | 349 |

## Source handling

`data/study-guide-expansion-2026.json` is the editable question source. Each
record includes a source PDF filename and 1-based PDF page numbers, including
covers. `data/study-guide-sources-2026.json` inventories all 16 uploaded files with
page counts and SHA-256 hashes. The PDFs themselves are not included in the game.

The Social Studies addendum uploaded with `(1)` in its filename is byte-for-byte
identical to the other Social Studies addendum. The all-subject supplement repeats
the subject addenda, so citations point to individual subject PDFs. The practice
rounds contain scanned pages; OCR was used to read them, with citations following
their actual PDF page order rather than their occasionally reordered printed page
numbers. New questions use original wording and examples, rather than reproducing
rounds or the guides' exercises.

The 2026–27 Quick Recall manual (PDF page 12) describes equal coverage of five
subjects and short-answer competition questions. This expansion balances subjects
and retains a short answer for every record, alongside four choices used by the
game's existing practice modes. The manual is a rules reference, not an additional
academic question bank. The 2025–26 manual is historical context, not an override
of the newer manual or of current game behavior.

Questions use source-supported facts and concepts, with new applications for math,
grammar, experimental variables, and similar skills. Source examples with errors
or contradictory keys were not copied. For example, Round 5's motion-law question
labels its answer “second” while accepting “3”; the expansion uses separately
supported motion concepts. Historical events are explicitly dated. There is no
claim that these source documents cover all current events after 2025.

## Integration and checks

The build embeds the JSON into `index.html` and
`Ellery_Recall_Rally_Librarian_v4.html`, so no network fetch is needed. The new
records join `GUIDE_QUESTIONS`, then the shared `SAMPLES` bank, once each.

- Study-guide practice includes all 200 additions in Written practice and 191 in
  Quick Recall. The nine new questions in math areas 02, 07, and 10 stay
  written-only, following the existing curriculum flags and study-guide labels.
- Rescue Rigby's existing subject filters can select every new question in both
  all-bank and guide-only play across its ten worlds.
- The Science Lab can select all 40 new science records through its existing
  station/topic filters. The Librarian can select the new eligible literature
  records through its existing book-topic filter.
- Existing saves and journal identities keep their old question IDs. New IDs use
  the `guide-additions-2026-` prefix. Existing scoring and game rules are unchanged.

`node tests/study-guide-expansion.test.cjs` checks counts, topic coverage, mode
eligibility, normalized duplicate prompts, distinct choices, aliases, source-page
bounds, both HTML embeds, adventure availability, Science Lab eligibility, and
actual Librarian selection. The existing bank, world, learning, and save checks
provide additional regression coverage. Difficulty levels are editorial estimates,
not measured student performance.

Validation completed: all 21 static checks in the Amplify build passed. A direct
comparison confirmed that every field of all 1,550 pre-existing bank records is
unchanged. `node tests/study-guide-expansion-browser.test.cjs` passed against both
HTML editions in Chromium: it loaded the game, disabled network access, displayed
and answered a new question from each subject, checked explanations and PDF
citations, verified journal entries, accepted a new short-answer alias, and
rejected an incorrect choice. Direct `file://` navigation is blocked by the test
browser's administrator policy, so the browser test loads each HTML edition from
a local HTTP server before switching offline. Static checks confirm embedded
question data in both editions.

These changes update the workspace and offline game file. They do not by
themselves publish a new version to GitHub or AWS Amplify.
