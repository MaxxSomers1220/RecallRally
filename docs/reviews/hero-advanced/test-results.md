# Completed verification

These are automated Chromium/Playwright runs against the playable game, not physical-device tests.

| Check | Completed coverage |
| --- | --- |
| New hero motion matrix | 12 actual style/outfit encounters at each of 1366×768, 1024×768, 820×1180 and 390×844: both styles, all six outfits, 240 core graded questions. Every case checks live eyelids/joints, grounded feet, actual miss outcome, attached spell focus, victory, unchanged identity and cleanup. |
| Motion lifecycle and tactics | Live reduced-motion switching, idle-loop cessation, pause/resume, rapid Next, real Ward and a protected miss, defeat, offline reduced-motion cast, ten-seal save and customized-hero reload. Feet are measured in arena-local coordinates so question/feedback layout changes do not count as sliding. |
| Existing character suite | Full ten-world journeys at all four sizes, 200 real core graded answers, customized reunion, reload/offline play. 266 independent appearance variants and 48 outfit/style/pose combinations validate XML, unique/resolved SVG references and pure rendering. Final desktop run repeats these checks after source sharing and attachment refinements. |
| Librarian | Complete eight-question flow on all four layouts, correct/missed questions and honest learning records; high/low warnings, run, duck, jump, dash, shield, hits, defeat/recovery, completion, close/reopen, touch cancellation, offline and reduced motion. New check keeps cape/wing and front torso transforms registered. |
| Amplify | Every actual build command in isolated staging; complete ten-world journey and 50 real answers from `dist/index.html`, Starfall, seals, defeat, saves, offline/reduced-motion rematch. |
| Other modes and saves | Existing Science Lab static suite exercises five stations and mistakes/repairs/finales, 25 real Lab answers, unchanged Rigby progress and a real Librarian storm/review. Existing save browser suite covers restart, checkpoints, profiles, reset/import/export, corrupt/denied/quota-failed storage, blocked network and customized identity. |
| Source and asset gates | Four new material hashes/budgets and source parity in both HTML builds; original assets and guardian motion hashes; original appearance schema/presets; same 48 snapshot inputs; exact read-only Librarian bridge blocks; original 22 gameplay/hero contracts and all 140 tactical cases. |
| Review recordings | Matching customized Fairy before/after; final Fairy/Panther encounter videos; phone touch encounter; real-time Librarian controls and genuine storm outcome; actual-frame close-up GIFs. |

Logs: [motion matrix](motion-browser.txt), [character](character-browser.txt), [final desktop character check](character-final-desktop.txt), [Librarian](librarian-browser.txt), [Amplify](amplify.txt), [saves](save-browser.txt), [Science Lab/package](science-static.txt), [source/tactics](contracts.txt).

The motion matrix was executed as desktop/landscape and portrait/phone runs. The Librarian automated regression suite uses controlled steps through the original physics for reproducible collision assertions. Its separate video uses the normal real-time clock and native controls; it does not use those step controls or injected hazards.

## Rendering observations

[Raw final comparison](render-performance.json) · [Earlier comparison while other browser jobs were active](render-performance-under-load.json). The included script measures both styles with crystal wings, a long cape and lantern, in the actual live creator. Samples last 2.4 seconds after warm-up and include the page UI. Frame gaps and task CPU reflect this headless cloud machine; heap values are point-in-time observations, not peak memory limits. The richer preview costs more CPU. These measurements do not establish physical-device frame rate or battery impact.

| Preview | Before median / p95 | After median / p95 |
| --- | --- | --- |
| Laptop fairy | 33.4 / 59.1 ms | 39.5 / 51.9 ms |
| Laptop panther | 33.9 / 63.3 ms | 38.3 / 43.2 ms |
| Phone fairy | 16.7 / 16.9 ms | 18.1 / 23.5 ms |
| Phone panther | 16.7 / 16.9 ms | 16.8 / 25.3 ms |

New material payload is 53,876 bytes total; the complete standalone file is approximately 9.6 MiB. Shared source geometry avoids duplicating complete leg and sleeve drawings per joint. There is one hero animation loop, with preset/thumbnail exclusion, bounded state caching and reduced-motion suspension.

## Not tested

Physical iPad/iPhone/Android hardware, Safari/Firefox, direct standalone `file://` opening and low-end-device performance. Offline rematches run with network access disabled, and both game builds embed all required graphics. No deployment or main-branch merge is claimed. GitHub-hosted CI results are separate from these local runs.
