# Study-guide questions: round five

Adds 200 original, unofficial practice questions, 40 per subject, covering all
64 curriculum areas. The built-in bank grows from 2,350 to 2,550 questions.
A SHA-256 snapshot verifies the previous 2,350 records remain identical,
including IDs, answers, order, aliases, and metadata.

| Subject | Added | New built-in total |
| --- | ---: | ---: |
| Mathematics | 40 | 510 |
| Science | 40 | 510 |
| Social Studies | 40 | 510 |
| Language Arts | 40 | 511 |
| Arts & Humanities | 40 | 509 |
| Total | 200 | 2,550 |

## Content and sources

Editable records are in `data/study-guide-round-five-2026.json`. Each has four
choices, an explanation, curriculum metadata, editorial difficulty, optional
accepted aliases, and an uploaded-guide filename with 1-based PDF pages.
PDF references identify the concept or study-topic basis; original calculations,
applications, and supporting factual details extend that basis. These are not
copied competition questions or a replacement for the guides. The source notes
in `docs/question-expansion-2026.md` still apply. Uploaded PDFs remain outside Git.

Topics include reverse calculations, unit conversions, bacterial division,
experimental variables, interpretation of physical processes and body systems,
Kentucky geography, colonial history, civic and economic reasoning, supporting
book characters and plot details, grammar, music performance, instruments, art
techniques, and historical cultural icons. Events are tied to specific years.

Four records add primary-source verification links and a check date: WHO's
May 2023 emergency announcement, Secretariat's Belmont victory, Disney's
Steamboat Willie history, and USA Basketball's Michael Jordan profile. The WHO
item distinguishes ending an emergency designation from eliminating a disease;
it does not reproduce the older guide's inaccurate pandemic-end statement.
The arts guide explicitly permits historical figures in its cultural-icon list.

Normalized prompts were checked against the existing bank and within this batch.
Same-answer and similar-prompt candidates were reviewed; close factual retellings
were replaced by different details or applications. Related concepts and some
answers still recur for practice. Numeric exercises use new examples rather
than claiming 200 entirely new learning targets.

## Game integration

All 200 enter the guide bank and eligible Written/Adventure subject pools,
including Rescue Rigby. Science additions enter the Science Lab selection;
eligible literature questions enter The Librarian selection. Both HTML editions
embed the same records once, with IDs beginning `guide-round-five-2026-`.

Of these additions, 149 support Quick Recall and all 200 support Written mode.
The 51 written-only items include nine restricted by their math curriculum areas
and 42 that depend on visible choices or full-sentence comparisons. Each of those
42 includes a mode rationale. Combined totals are 2,304 Quick Recall questions
and 246 written-only questions. Displayed source counts are 2,275 guide,
150 elementary, and 125 general questions.

## Validation

- `node scripts/build-standalone.cjs`: passed.
- All 22 static checks in `amplify.yml`: passed locally on the final build.
- `node tests/study-guide-expansion.test.cjs`: validates five batches, both
  editions, counts, 64-area coverage, exact duplicate prompts/IDs, distinct
  normalized choices, aliases, source-page bounds, mode restrictions, ten-world
  Adventure pools, Science Lab and Librarian selection, and all three historical
  preservation snapshots, including the previous 2,350 questions.
- Browser coverage was extended to the fifth batch in every subject, including
  Pasteur and numeric-unit typed answers and written-only coordinate and
  capitalization tasks. **The browser suite could not run in this workspace:**
  the sandbox denied the local server (`listen EPERM`), and Chromium also failed
  to launch under the restricted sandbox. No browser pass is claimed.

Run `node tests/study-guide-expansion-browser.test.cjs` in an environment that
allows local browser testing. This branch is a review build; production
deployment has not been confirmed.
