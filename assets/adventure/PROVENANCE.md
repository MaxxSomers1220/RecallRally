# Rescue Rigby illustration assets

All new artwork in this directory was created for this change. No stock art, commercial game characters, remote fonts, or new runtime libraries were used.

The thirteen paintings were generated with OpenAI `image_gen` on October 30, 2026. The briefs called for premium, child-friendly, painterly storybook fantasy scenes with clear material detail and separate foreground/background depth. Arena scenes use a front-facing stage, an empty lower terrace, quiet regions behind the two combatants, and space in the upper center for live mechanisms. The prompts excluded characters, UI, labels, and baked-in question/answer text. The runtime WebP files are optimized copies; `manifest.json` retains original generated PNG paths and SHA-256 hashes, runtime dimensions, byte budgets, and runtime hashes.

| Painting | Illustration brief |
| --- | --- |
| `mosswood.webp` | Moss-covered woodland geometric sanctuary, carved standing stones, oak arches, ferns, amber shafts and turquoise mist |
| `firefly.webp` | Brass woodland observatory built into tree roots, sapphire sky, fireflies, leaf-carved pavilion |
| `coast.webp` | Sandstone mariner’s courtyard, brass navigation instruments, ropes, banners, turquoise coast and sunset |
| `peaks.webp` | Mountain library, walnut shelves, antique volumes, open gothic arches and distant violet snowy peaks |
| `cloudsong.webp` | Enchanted performance hall, velvet curtains, carved golden proscenium, organ pipes and rose window |
| `crystal.webp` | Prismatic underground cathedral, amethyst stalactites and a reflective indigo lake |
| `clockwork.webp` | Copper and brass clockwork city, ornate clocktower, aqueducts, rooftops and a quiet workshop plaza |
| `sunken.webp` | Underwater archive, coral gothic arches, protected antique books, pearl fittings and turquoise ocean light |
| `skygarden.webp` | Floating botanical islands, flowers, hanging vines, tiny waterfalls and a sea of clouds |
| `moonstone.webp` | Ivory lunar citadel, violet terraces, silver carvings, crescent moon and a dark central gate |
| `rescue.webp` | Close view of Moonstone’s empty carved archway and courtyard, with space for the live dog, seals and customized hero |
| `map-sunlit.webp` | Painted terrain for the first five worlds, with no baked-in trail or markers |
| `map-mist.webp` | Painted terrain for the second five worlds, with no baked-in trail or markers |

The ten transparent guardian SVGs are original vector drawings authored in `scripts/draw-adventure-guardians.py`. Each has separate head, arm, wing, or tail groups as appropriate, with original gradients, clothing, instruments and expressive facial elements. Run the script to reproduce the vectors. Updating artwork requires refreshing manifest hashes and running `node scripts/build-standalone.cjs`.

Rigby’s familiar black-and-tan Airedale image is the existing `RIGBY_ART.friendly` from `main` at `1e543ea`. It was retained, with SVG clip masks isolating its existing head and tail for movement. The hero remains the existing saved, customizable renderer. Neither character was replaced with a generic painted figure.

The painted scenery, glowing seals, underwater archive and other magical mechanisms are fictional story elements. All existing subject questions, explanations and source references remain the real practice interface.
