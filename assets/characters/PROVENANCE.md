# Hero and guardian character artwork

Created for Recall Rally on October 30, 2026, from the merged world-upgrade baseline `65d0953`. No third-party stock images, commercial game characters, external fonts, or runtime libraries were added.

## Painted guardians

OpenAI `image_gen` produced ten original transparent three-pose sheets. Each brief requested the same character and equipment in a curious/listening pose, a casting gesture toward the left, and an impressed/appreciative pose. The direction specified detailed painterly materials, expressive eyes, convincing anatomy, child-friendly personalities, clear small silhouettes, consistent scale and footing, separated figures, and no background, UI, labels, shadows, projectiles or particle effects.

| Runtime key | Character and illustration brief |
| --- | --- |
| `pippin` | Red fox, white muzzle, embroidered green waistcoat, linen sleeves, leather boots, acorn brooch and brass geometric instrument |
| `fern` | Barn owl with layered tawny feathers, cream facial disc, spectacles, teal scholarly cape, satchel and field notebook |
| `compass` | River otter navigator, navy captain’s coat and tricorn, brass compass, rolled chart, leather boots |
| `quill` | Lavender story dragon, cream belly, gold horns, plum wings, indigo scholar’s vest and open book |
| `maestro` | Moon moth conductor, elaborate mauve/ivory wings, fluffy collar, violet tailcoat, antennae and baton |
| `flint` | Friendly living amethyst golem, refracting mineral facets, brass fastenings and a triangular prism |
| `tock` | Sage turtle engineer, fitted clockwork shell, brass goggles, russet leather apron, gear and tools |
| `lyra` | Sea-green fictional sea dragon archivist, coral fins, spectacles, teal cape, pearl brooch and protected book |
| `zephyr` | Four-legged ivory/sage stag, botanical gold antlers, feathered wings, chest harness and Skyblossom pendant |
| `astra` | Lunar gryphon, ivory feathers, violet eyes, crescent crown, lilac wings, four legs and a moonstone harness |

`prepare-character-sprites.py` separates the connected silhouettes from the original transparent source sheet and packs them at one shared scale per guardian, with a common 620px ground baseline. Each guardian has three WebP files (`-0`, `-1`, `-2`). A wider canvas preserves extended wings and tails. The runtime scales the canvas using the recorded aspect ratio; the baseline and actual nontransparent bounds are validated against the playable stage. No pose is stretched independently to fit a box.

The manifest records each original PNG path and SHA-256, crop coordinates, foot registration, runtime dimensions, baseline, byte budget and runtime hash. Original sheets remain in the generation workspace. The optional source-preparation script requires Pillow, NumPy and SciPy; the shipped game does not.

## Configurable hero

The existing composable SVG hero was refined in `src/hero-renderer.js` and `src/character-art.js`. It retains both Fairy/Panther styles and every existing choice ID, color, default and preset. New work includes smaller sculpted eyes, colored iris gradients, facial planes, hair fibers, garment-specific seam/trim drawings, and separately articulated sleeve/hand/glove layers. Original saved face, hair, clothing, equipment and magic selections continue to supply the artwork.

Two original grayscale `image_gen` material swatches provide linen grain and painted silk-fold shading. They are small, recolorable overlays clipped to the actual costume paths, with the existing selected colors beneath them. They do not contain a face, character, text or interface. Their source and runtime hashes are also in the manifest.

The hero remains assembled from the player’s choices across the creator, map, duels, Science Lab, Librarian and Rigby reunion. The existing Librarian movement rig remains in control of its run/jump/duck states.

## Animation and fantasy

The guardians use authored painted poses with a brief CSS dissolve. Existing duel state selects the pose; no new game clock or scoring resource was introduced. The hero’s casting gesture moves the shoulder/arm layers, with secondary cloak movement. Reduced motion retains the selected pose and clear game feedback.

The creatures, magical casts and materials are fantasy illustrations. Existing real academic questions, explanations and source references are unchanged.
