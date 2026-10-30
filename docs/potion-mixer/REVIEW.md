# Potion Mixer — playable graphics overhaul

This changes the existing Potion Mixer in Professor Fizzwick's Science Lab. The station still uses five records from the shared science bank, the same four choices and explanations, and the existing explanation-to-repair process. The other stations, grades, badges, Alchemist's Prism, profiles, saves, learning journal, Rigby and Librarian are preserved.

## Three passes

1. **Artwork.** Original layered SVG chassis, engraved copper/brass, five individually shaped glass vessels, curved glass routes, pressure/temperature instruments, mechanical drive and a transparent mixing chamber. Fizzwick's established silver hair, moustache, brass goggles and coat receive extra shading and four expression layers in a Potion-only asset. The original professor asset stays unchanged.
2. **Animation.** A presentation-only cue drives one ingredient transfer per newly repaired step, rising/mixing liquid, third-step simmer, fourth-step drive and fifth-step celebration. An incorrect answer creates a brief moustache bubble and startled Fizzwick; the existing Next/repair action advances the visual step without changing the missed grade. No animation owns scoring or persistence. Effects use bounded CSS transitions plus a few slow ambient loops; reduced motion retains the final information without animation.
3. **Polish.** Actual browser screenshots at laptop, landscape/portrait tablet and phone dimensions are used to review composition, readable controls, warm lighting, equipment/hero proportions and overflow. Browser results and screenshots will be added to the draft PR after the run.

## How to play the update

Open **Science Lab → Potion Mixer**. Answer five questions. Read an explanation and choose **Apply the explanation & continue** after a miss. Compare the dormant machine, first/second ingredients, simmer after the third repair, powered gears after the fourth and finished potion after the fifth. The chosen hero stays beside the machine.

## Packaging and provenance

- `assets/science-lab/potion-mixer-chassis.svg` and `professor-fizzwick-potion.svg` are original, code-authored illustrations; generator sources are in `scripts/draw-potion-*.py`. No third-party images or runtime libraries.
- `src/science-lab-potion.js` renders progress-dependent layers into the illustrated chassis; it has no storage, grading or timers.
- `scripts/sync-game-modules.cjs` embeds both new SVG assets and the renderer into `index.html`.
- `node scripts/build-standalone.cjs` includes the same art and gameplay in `Ellery_Recall_Rally_Librarian_v4.html`. No remote artwork requests are needed.
- The existing Amplify build still ships `index.html` and the Librarian assets. The new artwork is embedded in the HTML, and its focused validation is added to the build checks.

## Validation

Local: six artwork states and all IDs/clip/paint references; original science-bank/choice/source/selection tests; save validation; answer recognition; all current launcher, bank, Adventure, save/resume, effects and Librarian smoke checks; new asset budgets and XML/SVG parsing. The other four equipment renderers match the baseline byte-for-byte at all six repaired-step counts (24 comparisons).

The dedicated Potion workflow plays the actual station at 1366×768, 1024×768, 820×1180 and 390×844. It checks progression, real CSS movement, one journal attempt per answer, mistake/repair, honest 4/5 grading, badge retention, customized hero, reduced motion, offline replay and the unchanged Circuit renderer. It uploads actual initial, intermediate, mistake, repair and completed gameplay screenshots.

Physical iPad/Safari, device battery use and long-session performance are not claimed. This branch is for review; do not merge or deploy until reviewed.

## AWS Amplify preview

In Amplify, open RecallRally → **Add branch / Connect a new branch**, select the feature branch named in this PR, and use its existing `amplify.yml`. Deploy that branch as a separate preview, leaving `main` and `rigbyscloud.com` unchanged. Use the branch URL shown by Amplify after its build succeeds; no preview URL has been provisioned or assumed here. The complete downloadable HTML can also be downloaded from this branch for a local review.
