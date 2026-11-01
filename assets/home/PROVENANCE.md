# Homepage artwork provenance

Original artwork created for Recall Rally on 2026-11-01 with OpenAI image_gen. No third-party stock, copied commercial characters, fonts or game assets were introduced. The images are decorative environments and objects; questions, progress, labels and controls remain live HTML.

- `source/study-hall.png`: newly generated clean enchanted academy environment. Prompt requested carved walnut shelves, antique books, brass lanterns, warm candlelight and a moonlit arched window, quiet left side for live text, clear right foreground for the existing customized hero. No baked character or interface.
- `source/practice-tools.png`: newly generated two-panel object painting, brass recall bell/book and feather quill/journal. Cropped into independent thumbnails; no readable writing or UI.
- `source/science-workbench.png`: newly generated fantasy science-workbench painting, glass vessel, brass fittings, condensation coil, botanical specimen and notebook. A decorative fantasy symbol, not an instructional scientific diagram. Actual Science Lab equipment/explanations remain unchanged.
- `library.webp`: thumbnail prepared from approved `librarian/library-painted.webp` (PR #16). The original remains unchanged.
- `adventure.webp`: thumbnail prepared from approved `assets/adventure/mosswood.webp` (PR #17). The original remains unchanged.
- The live hero uses the approved shared renderer/materials from PR #20, with the player's saved configuration. No fixed hero painting or new character preset was added.

The three generation outputs are preserved in `source/`; runtime WebPs are prepared by `python3 scripts/prepare-home-art.py`. `manifest.json` records source/runtime SHA-256 hashes, dimensions and byte budgets. Artwork is embedded in both builds; the game makes no requests to image generation services. Source PNGs are not copied to the Amplify output.

Runtime artwork budget: all six WebPs together under 400 kB, before base64 embedding. Existing art and license/provenance files elsewhere in the repository remain authoritative for the reused illustrations.

Licensing: the repository's existing MIT `LICENSE` remains in place for this contribution. No additional third-party asset license or external font was introduced. Reused project paintings retain their existing provenance.
