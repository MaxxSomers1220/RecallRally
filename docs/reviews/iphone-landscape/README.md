# iPhone landscape duels

Turning a phone sideways now places the question on the left and the animated Rescue Rigby duel on the right. The question panel scrolls independently, so long questions, answer explanations and Next remain reachable while the battle stays visible. Answers, spell controls and header buttons retain at least 44px target height. Returning to portrait restores the stacked layout without changing the question, score or selected hero.

This is a CSS layout change for active duels in landscape viewports 560–1000px wide and up to 520px high. It uses the existing visual-viewport adapter and safe-area insets. It does not change grading, question selection, timers, guardian motion, saves, artwork or other game modes. On the shortest screens, the duplicate arena subtitle and restoration goal text give way to the illustration; the four progress markers remain. The full restoration objective remains in the progress region's accessible label.

## Preview

Serve the repository or open `Ellery_Recall_Rally_Librarian_v4.html`, choose Rescue Rigby, start a match and rotate to landscape. Scroll the left panel to answer or review longer questions. Return to world and Sound / Settings remain in the top bar. This branch is not deployed.

[Before](before-iphone-landscape.jpg) · [After](chromium-iphone-modern-question.jpg) · [Rotation and a real answer/attack](chromium-rotation-and-duel.webm)

| Viewport | Question | Attack |
| --- | --- | --- |
| 568×320 | [Small phone](chromium-iphone-se-question.jpg) | [Attack](chromium-iphone-se-attack.jpg) |
| 667×375 | [Small iPhone](chromium-iphone-small-question.jpg) | [Attack](chromium-iphone-small-attack.jpg) |
| 852×393 | [Modern iPhone](chromium-iphone-modern-question.jpg) | [Attack](chromium-iphone-modern-attack.jpg) |
| 932×430 | [Large iPhone](chromium-iphone-large-question.jpg) | [Attack](chromium-iphone-large-attack.jpg) |
| 852×300 | [Short browser viewport](chromium-safari-bars-question.jpg) | [Attack](chromium-safari-bars-attack.jpg) |

Larger/portrait layouts: [1366×768](chromium-regression-1366x768.jpg), [1024×768](chromium-regression-1024x768.jpg), [820×1180](chromium-regression-820x1180.jpg), [390×844](chromium-regression-390x844.jpg).

## Verification

- `node tests/apple-landscape-duels-browser.test.cjs`: passed on Chromium 154.0.8037.57 with touch/mobile viewport emulation. Five landscape sizes, simulated 32px side safe areas and 10px bottom inset, portrait/landscape rotation mid-question, actual touch answers, correct/incorrect scoring, long copy and independent scrolling, pause/resume, preserved hero and question identity, reduced motion, no horizontal overflow or page errors. Also verifies the four larger/portrait layouts above.
- `node scripts/build-standalone.cjs` and all 22 static checks from `amplify.yml`: passed. The source CSS is embedded identically in both online and standalone editions.
- The new browser test is included in the existing Chromium/WebKit Apple viewport CI matrix.

Physical iPhone Safari and real browser-toolbar transitions have not been tested locally. WebKit is not installed in this local environment; a shortened Chromium viewport simulates browser-bar space, not iOS Safari itself. The next useful check is rotation and scrolling on the user's actual iPhone in Safari.
