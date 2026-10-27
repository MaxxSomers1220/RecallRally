# Ellery's Recall Rally

A self-contained academic-team practice game with Quick Recall, Written warm-up,
the Rescue Rigby adventure, customizable heroes, and a local learning journal.

This package uses the version 29 game. It includes 1,550 built-in
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

The build copies only `index.html` into `dist`. Repository documentation and
configuration are not included in the deployed site. Later commits to the
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

## Version 29 adventure

Fifteen levels are arranged as three named challenges in each of the five lands.
Two trail victories unlock the guardian’s seal duel. Only that third victory awards
a seal and advances Rigby’s rescue. Completing all fifteen levels rescues Rigby.
Each duel still uses first to four answer points with at most seven questions.
Fifty new original scenario questions (ten per subject) are included in General
warm-ups. Difficulty estimates remain editorial; they are not calibrated ratings.
Different topics and unseen questions are favored in each duel. A new adventure
starts at level zero and preserves character choices and question history.

Run the self-contained checks with `node tests/bank-v29.test.cjs` and
`node tests/adventure-effects.test.cjs`. Browser layout and physical iPad testing
of version 29 remain outstanding; this release is a draft until playtested.
