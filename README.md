# Ellery's Recall Rally

A self-contained academic-team practice game with Quick Recall, Written warm-up,
the Rescue Rigby adventure, customizable heroes, and a local learning journal.

## Quest for Rigby: automatic save and resume

Adventures now save automatically for the active **learning profile**, using its
stable profile ID. Return to the home screen and choose **Continue the Quest for
Rigby** to restore your map, earned seals, defeated guardians, unlocked worlds,
next objective, hero and run record. No travel animation replays when resuming.
Switch players in **My learning** to load another child's independent adventure
and hero appearance. A hero nickname is never used as a save identifier.

If a duel was interrupted, the map offers **Restart encounter**. That encounter
starts at question one with fresh duel health, charge and temporary protections;
previously earned seals and their assistance remain available. Questions already
answered stay in the learning journal and run statistics. A victory is saved
before the seal/rescue cutaway, so closing during that animation keeps the seal.

**Start a New Adventure** asks for confirmation before replacing an existing
quest. It clears only adventure progress and run statistics, keeping the player's
hero, question exposure history, learning records, study packs and preferences.
The map reports whether saving succeeded. If storage is blocked or full, export
an adventure backup before closing; an unsaved run may last only for that visit.

On the home screen, open **Adventure backup & device storage** for **Export
Adventure Save** and **Import Adventure Save**. Import validates the file before
asking permission to replace a quest. It associates the imported adventure with
the selected learning profile and restores the backup's hero. Import learning
history separately with the existing **My learning** backup controls; adventure
backups do not replace learning records or study packs.

Saves belong to the current browser and site origin. They survive ordinary
Amplify code deployments at the same origin; they do not automatically sync
between a laptop and iPad. A different browser, cleared site data, private
browsing, or a new domain can make previous saves unavailable. Export backups
before changing devices or site addresses. Offline play works from the complete
downloaded HTML where the browser supports local files; hosting alone does not
install an offline app.

Developer validation from the repository root:

```sh
node tests/adventure-save.test.cjs
node tests/bank-v29.test.cjs
node tests/worlds.test.cjs
node tests/adventure-effects.test.cjs
node tests/librarian-v4-smoke.test.cjs
node tests/adventure-save-browser.test.cjs
```

The browser suite requires Playwright and Chromium (set `CHROMIUM_PATH` if it is
not `/usr/bin/chromium`). It starts its own local HTTP server and tests actual
browser close/reopen, reloads, profile switching, confirmation, backup handling,
network-free gameplay, corrupted saves, quota failures and same-origin updates.
It does not validate a live AWS deployment or physical iPad hardware.

`src/adventure-save.js` is embedded verbatim in `index.html` for offline play;
keep both copies synchronized. Save schema version 1 uses keys of the form
`recall-rally-rigby-save-v1:<learning-profile-id>`. It stores the map position,
sequential completed encounters and seals, run counts, hero identity and an
interrupted-encounter marker. Unlocks, rewards, rescue stage, next objective,
answer-point score, accuracy and persistent seal assistance are reconstructed
from those validated fields and the world's definitions. Imported extra fields
cannot unlock destinations. Invalid or unsupported saves are kept until the
player explicitly replaces them.

Run `node scripts/build-standalone.cjs` after changing the game or Librarian
assets to regenerate **Ellery_Recall_Rally_Librarian_v4.html**, the complete
self-contained game suitable for static hosting. The save test checks that this
file and `index.html` embed the current save implementation.

This package uses the version 29 Ten Worlds game. It includes 1,550 built-in
questions across 64 curriculum areas: 1,436 eligible for Quick Recall and 114
written-only questions. Adventure can use all 1,550.

## Upload to GitHub — no terminal required

1. Extract `Ellery_Recall_Rally_GitHub.zip` on your computer.
2. Create a GitHub repository, for example `ellery-recall-rally`. A private
   repository is recommended. Leave the automatic README, license, and gitignore
   options unchecked because this package supplies its own files.
3. In the empty repository, use **uploading an existing file**. For an existing
   repository, choose **Add file → Upload files**.
4. Open the extracted `ellery-recall-rally` folder and upload its contents:
   `index.html`, `amplify.yml`, `README.md`, `CHANGELOG.md`, and `.gitignore`.
   Your computer may hide `.gitignore`; include it if available. It is optional
   for running this game.
5. Commit the files to the `main` branch.

Upload the extracted files, not the ZIP. `index.html` and `amplify.yml` must appear
at the top level of the repository, rather than inside an extra folder. GitHub's
file page previews source code; use Amplify's URL to play the hosted game.

## Connect the repository to AWS Amplify Hosting

1. Open the AWS Amplify console and start a new hosted app.
2. Choose **GitHub** as the source and authorize the Amplify GitHub App for this
   repository.
3. Select the repository and its `main` branch.
4. Keep the build settings supplied by `amplify.yml`. This is a static HTML app:
   no Node packages, framework, backend, environment variables, or API keys are
   required. If the console asks for a framework, choose **Other** or the static
   option. The output directory is `dist`.
5. Review the configuration and deploy. Open the HTTPS URL Amplify provides.

The build runs the game checks, stages `index.html` and the Librarian v4 assets
in `dist`, and adds the Librarian launch scripts to the staged page. Repository
documentation and configuration are not included in the deployed site. Later commits to the
connected branch deploy automatically when Amplify automatic builds are enabled.
AWS usage and pricing are controlled by your AWS account; this package does not
configure budgets or guarantee free hosting.

Official references:

- [Amplify GitHub connection](https://docs.aws.amazon.com/amplify/latest/userguide/setting-up-GitHub-access.html)
- [Amplify build specification](https://docs.aws.amazon.com/amplify/latest/userguide/yml-specification-syntax.html)

## Play locally or on a tablet

On a desktop computer, open `index.html` in a modern browser to play offline.
The artwork, styles, questions, and audio synthesis are included in the HTML.
On an iPad, open the hosted HTTPS URL in Safari; an HTML preview in the Files app
may not run the complete game. Hosting does not add offline installation or
cross-device synchronization.

## Player progress and moving to a new URL

Profiles, attempts, question history, character choices, and preferences are
stored in the player's browser when browser storage is available. They are not
saved in this repository or automatically sent to AWS. A hosted URL does not
create shared player accounts or a server-side database.

Browser storage is specific to the browser and site address. Before moving from
the old game URL, use the **My learning** progress export. Import that backup in
the game at the new Amplify URL. Custom study packs have their own export/import
in **Study pack**. Character and audio preferences may need to be selected again.
Do not upload player progress exports to GitHub.

## Updating and recovery

Replace `index.html` with a revised self-contained game and commit the change.
Keep `amplify.yml` unless the application structure changes. GitHub keeps previous
commits so an earlier version can be restored. The original uploaded HTML was
left unchanged while preparing this separate package.

## Content and validation

These are original, unofficial practice questions, not an official KAAC match or
question set. Difficulty ratings are editorial estimates. Recent-events coverage
still needs its previously identified 2024–26 expansion.

The package was checked for JavaScript syntax, question counts and IDs,
unchanged question-bank content, self-contained assets, ZIP integrity, and the
Amplify build's output. Live GitHub upload, AWS deployment, and physical iPad
testing were not performed while preparing this package.

## Ten Worlds adventure (version 29 draft)

The five original lands lead to five new worlds: Crystal Caverns, Clockwork City,
Sunken Library, Skygarden Isles, and Moonstone Citadel. Each world has one guardian,
one seal, distinctive arena scenery and an evolving response to correct answers.
The map has two selectable chapters of five worlds each. The second chapter can be
previewed early, but its guardian encounters remain locked until reached.

The new worlds mix related subjects. The final citadel includes all five subjects
in every seven-question deck. The final rescue happens after ten seals, never at
the old five-seal endpoint. New adventures start at level zero and preserve hero
preferences and question exposure history. The 50 new questions remain included.

`src/world-expansion.js` documents the new artwork and world definitions. The same
code is embedded in `index.html` to preserve offline play; keep the two in sync when
editing. The new question rows are also provided in `data/adventure-v29-questions.json`.

Self-contained validation commands:

- `node tests/bank-v29.test.cjs`
- `node tests/worlds.test.cjs`
- `node tests/adventure-effects.test.cjs`

Nine automated suites passed during development. Actual SVG game artwork was
rendered for visual inspection. Browser layout and physical iPad checks remain
outstanding. This draft replaces the rejected repeated-trail-duel proposal.
