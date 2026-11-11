# Every missed answer triggers a guardian attack

Before, the fixed Strike/Shield pattern caused a miss on a Shield turn to resolve
as a defensive `guard` outcome. The guardian earned an answer point without
launching a spell. Separately, the renderer only enabled guardian projectiles
for announced Strike turns, and portrait layouts could leave the battle below
the visible screen. Next/Enter could also skip the attack immediately.

All ten guardians now attack after a wrong answer or timeout in either stance.
The stance pattern remains available for correct-answer Strike/Ward tactics.
An earned Ward or seal can catch the incoming attack at the hero; it does not
prevent the guardian's cast or cancel its answer point. Protection is consumed
once, with regular Ward taking priority over seal protection. Guardian defensive
rings lower during the attack, and the result caption identifies who blocked.

Next waits for the brief missed-answer effect (1.3 seconds normally, 0.9 seconds
with reduced motion). Duplicate answers and rapid Next/Enter do not award extra
points or skip that effect. Correct-answer effects remain skippable. Replay
restarts the cast without regrading or consuming protection. Navigation away
still cancels effects immediately. Reduced motion uses a clear static casting
pose rather than forced animation.

On a miss, an off-screen battle scrolls into view instantly. Landscape layouts
already showing the battle stay in place. The answer/explanation remains in the
review panel. Actual recorded stage bounds in `viewport-results.json` confirm
visibility on desktop, both tablet orientations, and phone portrait/landscape.

## Review images

These are actual standalone-game captures on former Shield turns after a wrong
answer, not generated artwork. All ten captures were visually inspected.

| Guardian | Screenshot |
| --- | --- |
| Pippin the Pattern Fox | [desktop-guardian-0.jpg](desktop-guardian-0.jpg) |
| Professor Fern | [desktop-guardian-1.jpg](desktop-guardian-1.jpg) |
| Captain Compass | [desktop-guardian-2.jpg](desktop-guardian-2.jpg) |
| Quill the Story Dragon | [desktop-guardian-3.jpg](desktop-guardian-3.jpg) |
| Maestro Moth | [desktop-guardian-4.jpg](desktop-guardian-4.jpg) |
| Flint the Prism Keeper | [desktop-guardian-5.jpg](desktop-guardian-5.jpg) |
| Tock the Gearwright | [desktop-guardian-6.jpg](desktop-guardian-6.jpg) |
| Lyra the Tide Archivist | [desktop-guardian-7.jpg](desktop-guardian-7.jpg) |
| Zephyr the Cloud Stag | [desktop-guardian-8.jpg](desktop-guardian-8.jpg) |
| Astra the Lunar Gryphon | [desktop-guardian-9.jpg](desktop-guardian-9.jpg) |

Additional views: [tablet landscape](tablet-landscape-guardian-5.jpg),
[tablet portrait](tablet-portrait-guardian-7.jpg),
[phone portrait](phone-guardian-9.jpg), and
[phone landscape](phone-landscape-guardian-9.jpg).

## Validation

- Standalone build and all 22 static checks in `amplify.yml`: passed.
- Static combat coverage includes all 120 combinations of ten guardians,
  two stances, wrong answer/timeout, and no protection/Ward/seal. It also checks
  single scoring, protection priority, progression, replay, reduced motion,
  premature Next/Enter, and timer cleanup.
- Actual screenshot pass: all ten former Shield-turn misses on desktop, plus
  tablet landscape (1024×768), tablet portrait (820×1180), phone (390×844), and
  phone landscape (844×390). Casts and viewport visibility verified.
- `node tests/guardian-attacks-browser.test.cjs`: passed in Chromium. All ten
  guardians in both stances at all four required viewports; 180 academic-result
  cases including 120 desktop combinations of stance, wrong/timeout and
  no protection/Ward/seal. Checks visible traveling spells and articulated
  casting through a simulated 220 ms busy frame, replay without rescoring,
  protection consumption, journal results, Next locking/unlocking, automatic
  stage visibility, reduced motion in both stances, and navigation cleanup.
  No page errors or horizontal overflow were reported.

The illustration contract pins were updated only for intentional changes:
`selectDuelSpell` help text, the `advanceDuel` attack gate, and
`finishDuelEffects` unlocking Next. The reviewed guardian renderer hash changes
only because missed Shield turns now receive casting mood metadata. Save code,
question data, hero identity, answer-point rules and rescue requirements keep
their prior implementations.

Preview the branch's `Ellery_Recall_Rally_Librarian_v4.html`, enter Rescue Rigby,
and miss an answer in any guardian duel. Safari and physical iPhone/iPad testing
were not performed. Production deployment is not confirmed. The next useful
check is the attack and review sequence on the user's own phone.
