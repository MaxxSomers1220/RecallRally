# Verification record

All results below come from the actual playable HTML. Browser automation used system Chromium with Playwright; phone choices use native touch taps. These are viewport/touch emulations, **not physical-device tests**.

| Check | Result / coverage |
| --- | --- |
| New guardian motion browser suite | Ten guardians at 1366×768, 1024×768, 820×1180 and 390×844. Each journey grades 40 correct and 10 incorrect built-in questions and earns ten seals. Every guardian checks live blinks, multiple intermediate joint positions, fixed support-foot matrices, hand/tool focus within 1.25 CSS px, and continuity when Next is pressed. |
| Lifecycle and feedback | Live reduced-motion preference changes, pause/resume, simulated document visibility changes through the game's auto-pause behavior, rapid advancement, four-miss defeat, repeated exit/reopen, victory, rescue/celebration, and animation-loop cleanup. |
| Offline and saves | Every layout plays an offline reduced-motion rematch and reloads the customized hero and ten-seal save. The existing save browser suite separately covers browser restart, checkpoints, profiles, reset, import/export, storage failures/corruption, denied storage, and loaded-game use with all network requests blocked. |
| Existing character browser suite | Ten encounters in all four layouts, exact 50-attempt journal growth, customized reunion and reload. Also 266 independent appearance variants and 48 outfit/style/pose combinations, resolved SVG references, no rendering state mutation. |
| Actual Amplify output | Every `amplify.yml` command executed in isolated staging; `dist/index.html` played the complete ten-world journey, 50 real answers, Starfall, seals, defeat, saves, offline rematch and reduced motion. |
| Other modes / standalone packaging | Existing Science Lab static suite built the actual site and exercised all five illustrated Lab stations, mistakes/repairs/finales, 25 graded Lab answers, unchanged Rigby progress and a real Librarian book storm/review. |
| Gameplay / source contracts | Original 22 gameplay/hero contracts, unchanged save module, appearance schema/presets, Librarian controller, all original asset hashes; all 140 intent/spell/result cases, Ward/Strike, protection, Starfall, seals, timers, progression and learning bank checks. |
| New rig / bundle gate | All ten native-resolution profiles, head/eye/arm/wrist landmarks, single bitmap per puppet, fixed feet, bounded launch coordinates, presentation-only source, and exact three-module inclusion in both HTML outputs. Included in Amplify and new motion CI. |
| Review media | Real first-encounter desktop and phone recordings through victory, a ten-guardian desktop journey, and baseline PR #18 recording; GIFs extracted at real speed from the desktop capture. |

Plain-text output: [motion](motion-browser.txt), [character](character-browser.txt), [Amplify](amplify.txt), [save](save-browser.txt), [Science Lab / Librarian package](science-static.txt), [source and tactical contracts](contracts.txt).

## Limits

Physical iPad/iPhone/Android hardware, Safari/Firefox, and low-end-device performance were not tested. Direct `file://` navigation was blocked by this environment's managed Chromium policy (`ERR_BLOCKED_BY_ADMINISTRATOR`), so standalone gameplay was tested through a local server with offline rematches and zero external asset dependencies. No deployment is claimed. GitHub-hosted CI is separate from these completed local runs.

The visibility test dispatches the browser lifecycle event; it does not claim a physical tab-switch test. Recordings use the normal game animation clock. Full-journey videos include real navigation and pauses; the GIF crops do not alter animation speed or synthesize frames.
