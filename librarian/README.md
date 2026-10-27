# The Librarian — arcade prototype (v1)

This is an **optional arcade mode** for Ellery's Recall Rally, designed for a fifth-grade academic team student. It does not replace any existing Adventure worlds.

## Gameplay
- Launch from the floating "Enter The Librarian" button in the existing Recall Rally page.
- The game asks eight literature questions with a twelve-second quick-recall buzzer window.
- Press **BUZZ!** (or Space) when ready, say the answer aloud, then type it for scoring.
- A miss or timeout starts a 6.5-second flying-book dodge challenge. Move with left/right, jump, and use one shield each wave.
- Correct answers award points and faster buzzes earn a bonus.
- A wrong answer is revealed after surviving the book storm.
- Four lives, score, and completion results are included.
- Attempts and buzzer speeds are saved in browser storage under `recall-rally-librarian-v1`, separately from existing Recall Rally progress.

## Controls
- Tablet: on-screen left/right, Jump, Shield buttons.
- Keyboard: A/D or arrow keys to move, Space/Up to jump, S for shield.
- On question screen, Space or Enter buzzes. Input is typed after buzzing.

## Question sourcing
The game tries to select quick-recall, book/literature-related questions from the **existing** `SAMPLES` bank in Recall Rally. If there aren't eight eligible questions, it falls back to eight clearly labeled demonstration questions. **The separate 2026–27 official study guide has not been imported or verified in this branch.** Never represent demonstrations as official state questions.

## Build & integration
`amplify.yml` executes `node tests/librarian.test.cjs`, copies existing `index.html` unchanged into `dist`, copies `librarian.css` and `librarian.js`, then uses `scripts/inject-librarian.cjs` to append asset references to the staged HTML. Source `index.html` and existing local storage keys remain unchanged.

To test locally from the repository root:
```sh
node tests/librarian.test.cjs
mkdir -p dist/librarian
cp index.html dist/index.html
cp librarian/librarian.css librarian/librarian.js dist/librarian/
node scripts/inject-librarian.cjs dist/index.html
```
Serve `dist` with a local static web server; opening the HTML file directly can also work on desktop.

## Known limitations / planned improvements
- This is canvas-drawn concept art, not the final cinematic sprites or the previously generated illustration asset.
- The prototype has a built-in small hero; it does not yet import the personalized hero design from the character creator.
- Typed answers use exact normalized matching with explicit aliases, so more answer aliases are needed.
- Question bank filtering is heuristic; content needs review against the state guide.
- The game saves basic attempts locally only; cloud sync and cross-device progress are not yet implemented.
- There is no speech recognition or automatic grading of spoken answers.
- Actual iPad gameplay testing and a live AWS Amplify deployment have not been verified.

## Next iteration
1. Import and validate the state literature question bank.
2. Reuse the customized hero avatar and animation frames.
3. Replace the canvas sketch with optimized illustrated layered assets.
4. Add multiple chapters, improved projectile patterns, responsive touch tuning, and accessibility/reduced-motion controls.
5. Connect the Learning Journal and provide deeper parent progress reports.
