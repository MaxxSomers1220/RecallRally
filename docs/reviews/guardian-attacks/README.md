# Rescue Rigby guardian attack repair

The release pose previously occupied only 65–160 ms after an answer. A long render could skip it. Replaying an active result also retained the original joint timeline even though its CSS projectile restarted. Finally, Ward counters displayed a projectile while the guardian remained in its reaction pose.

The shared rig now gives anticipation 160 ms, release 300 ms, and follow-through/recovery the remainder of a 1.18-second sequence. Its elapsed presentation time uses capped frame deltas. Rebuilding an active result restarts both joints and CSS effects, including Replay. Strike, blocked Strike and Ward counter outcomes cast; defensive Shield turns remain defensive, and Starfall retains its own sequence. All ten guardian illustrations, question data, scoring and save logic retain their existing implementations.

Preview: open `Ellery_Recall_Rally_Librarian_v4.html` (or serve the repository), choose Rescue Rigby, start a match and miss an announced Strike. Use Battle details → Replay spell sequence during the effect. Answer correctly with Ward against an announced Strike to see the countered cast.

## Actual rendered evidence

[All ten guardians in motion](desktop-all-guardians.webm) — recorded Chromium gameplay, compressed for review.

[Before active replay](before-active-replay.jpg) · [After active replay](after-active-replay.jpg). These show the old recovered/listening pose versus the restarted casting sequence; the question decks are randomized.

| Guardian | Attack screenshot |
| --- | --- |
| Pippin the Pattern Fox | [Desktop](desktop-guardian-0-attack.jpg) |
| Professor Fern | [Desktop](desktop-guardian-1-attack.jpg) |
| Captain Compass | [Desktop](desktop-guardian-2-attack.jpg) |
| Quill the Story Dragon | [Desktop](desktop-guardian-3-attack.jpg) |
| Maestro Moth | [Desktop](desktop-guardian-4-attack.jpg) |
| Flint the Prism Keeper | [Desktop](desktop-guardian-5-attack.jpg) |
| Tock the Gearwright | [Desktop](desktop-guardian-6-attack.jpg) |
| Lyra the Tide Archivist | [Desktop](desktop-guardian-7-attack.jpg) |
| Zephyr the Cloud Stag | [Desktop](desktop-guardian-8-attack.jpg) |
| Astra the Lunar Gryphon | [Desktop](desktop-guardian-9-attack.jpg) |

Additional layout evidence: [1024×768](tablet-landscape-guardian-5-attack.jpg), [820×1180](tablet-portrait-guardian-7-attack.jpg), [390×844](phone-guardian-9-attack.jpg).

## Verification

- `node tests/guardian-motion.test.cjs`: all ten rigs, delayed frames at five frames/second, strike/block/counter/defensive outcomes, active replay and cleanup.
- `node tests/guardian-attacks-browser.test.cjs`: all ten guardians at 1366×768, 1024×768, 820×1180 and 390×844. Checks 160 ordinary outcomes plus 40 reduced-motion attacks, actual projectile visibility/travel, a 220 ms main-thread stall, articulated release/recovery, replay without score changes, no horizontal overflow and no browser errors.
- `GUARDIAN_VIEWPORT=desktop node tests/guardian-motion-browser.test.cjs`: complete ten-world progression, idle/blink, pause/background/resume, planted feet and attached spell focus, continuous next-question pose, victory/defeat, fast exits, offline reduced motion and preserved customized save.
- Amplify static validation suite: character assets, guardian/hero rigs, home, music, illustrations, mini-games, answer handling, adventure saves, question banks, all 140 tactical state cases, and standalone game.

Browser checks use Linux Chromium with emulated viewport sizes. Physical iPad/iPhone Safari has not been tested here. No production deployment is part of this review branch. A useful future refinement would synchronize projectile release to the moving hand under sustained low frame rates; these fixes preserve the existing spell paths and gameplay timers.
