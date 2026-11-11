# Storybook soundtrack provenance and licenses

Both melodies, harmonies, arrangements and note-level JSON/MIDI scores are original contributions for Recall Rally. No external song, soundtrack, melody transcription or reference recording was used. The shared six-note motif and development are described in `docs/reviews/storybook-music/DESIGN.md`.

| Material | Source / license |
| --- | --- |
| Original `.json` / `.mid` scores and Python/JavaScript code | Repository MIT license |
| TimGM6mb.sf2, copied unchanged into `source/` for reproducible rendering | Tim Brechbill (2004), David Bolton (2010); GPL version 2 only. See `source/SOUNDFONT-COPYRIGHT.txt` and `LICENSE-GPL-2.txt`. |
| Rendered `.mp3` files (full cues and sketches) | Distributed under GPL-2.0-only with the sample source notices, full license and rendering sources supplied here. |

The installed Debian `timgm6mb-soundfont` package supplies the original SoundFont. Its upstream reference is recorded in the unmodified copyright notice. `manifest.json` records its SHA-256 and the rendered-file hashes, sizes, sample rate and loop boundaries. The SoundFont and composition sources are build-time inputs only; the game embeds just two compressed playback files. GPL notices and source location are also embedded in both delivered HTML files.

Rendering uses the already installed FluidSynth shared library through Python ctypes, NumPy for PCM processing, and FFmpeg/libmp3lame for 128 kbps MP3. No renderer, SoundFont, CDN or third-party audio library is loaded by the game. This is sampled General MIDI rendering, not live acoustic performance or a mastered orchestral recording.

Reproduce from the repository root:

```sh
python scripts/compose-storybook-music.py
python scripts/render-storybook-music.py
node scripts/build-standalone.cjs
```

The renderer uses the bundled SoundFont by default; `MUSIC_SOUNDFONT_PATH` can select the same licensed input elsewhere. Rendering requires build-time FluidSynth, NumPy and FFmpeg. The game itself needs none of those packages. The plain eight-bar sketches are rendered before the 32-bar arrangements. MIDI note-offs may extend slightly beyond the 32-bar region for held notes; the JSON/manifest defines the exact loop region for a DAW.
