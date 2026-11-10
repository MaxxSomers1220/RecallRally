# Clear Main menu navigation

Before: the top-left control looked like a Recall Rally brand mark with a
personalized tagline. During an active practice round, clicking it showed the
round summary before the menu.

After: a house icon, visible “← Main menu” text, button outline, and hover/focus
feedback make its destination explicit. The label stays visible on phones.
Its accessible name and tooltip identify the menu destination. Clicking returns
directly to the five-game chooser, using the existing timer cleanup and Adventure
exit logic. “End round” remains the route to a practice summary. Previously
recorded learning attempts and Adventure saves use their existing persistence.
The personalized tagline element remains available to the existing setup code
but is hidden in favor of the navigation label.

## Validation

- `node scripts/build-standalone.cjs`: passed; both HTML editions updated.
- All 22 static checks from `amplify.yml`: passed.
- `node tests/home-launcher-browser.test.cjs`: passed in Chromium. Covers desktop
  and phone, five activity launchers, direct menu return during active practice,
  Adventure return, Science Lab, Librarian, and no browser errors.
- A Playwright visual pass exercised active practice and menu return at
  1366×768, 1024×768, 820×1180, and 390×844. The label was visible and there was
  no horizontal overflow at each size. Screenshots below were captured from the
  real standalone game during question reading and visually inspected.
- Static navigation coverage exercises reading, open, buzzed, checking, result,
  and summary phases plus the Adventure layout reset.

| View | Preview |
| --- | --- |
| Laptop | [desktop.png](desktop.png) |
| Tablet landscape | [tablet-landscape.png](tablet-landscape.png) |
| Tablet portrait | [tablet-portrait.png](tablet-portrait.png) |
| Phone | [phone.png](phone.png) |

Preview by serving the branch or opening `Ellery_Recall_Rally_Librarian_v4.html`.
Start Quick Recall or Rescue Rigby, then use the top-left Main menu button.
Chromium viewport emulation was tested; real iPhone/iPad and Safari were not.
Production deployment has not been confirmed. The next useful check is whether
this label is immediately clear on the user's own phone.
