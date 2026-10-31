# Advanced composable hero materials

The four grayscale relief tiles are original OpenAI image_gen artwork generated for this upgrade. The atlas brief requested four equal, unlabelled panels: softly sculpted velvet/skin grain, flowing satin pleats, worn supple leather, and engraved/brushed antique metal. It explicitly excluded characters, equipment, text, UI and complete hero paintings.

Original source: `/workspace/generated_images/exec-625937be-c385-4795-bccd-89de5b49b900.png`. The SHA-256 of that original source and of each packed tile is in `manifest.json`. `scripts/prepare-hero-materials.py` crops equal quadrants, resamples to 256×256 and packs WebP quality 83. Total shipped material bytes: 53,876. The original generated source remains in the execution workspace.

These tiles are restrained multiply layers inside the existing selectable geometry. They do not contain skin color, hair, faces, garments, identity, accessories or a replacement fixed hero. Every selected color remains the base color. All face planes, iris fibers, equipment bindings, clothing construction, registered component cut paths, pivots and motion curves are authored in the repository's SVG/JavaScript source.

No third-party character art or animation library was downloaded. All original guardian paintings and material assets from PR #18 and all guardian animation modules from PR #19 remain unchanged. The renderer continues to use the existing selected appearance IDs and save schema.
