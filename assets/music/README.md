# Lantern Afterglow — original Recall Rally soundtrack

An original fantasy suite with warm 1990s Tokyo lo-fi colors: felt electric piano,
nylon guitar, rounded upright bass, woodwinds, soft mallets, sustained strings,
and original synthesized brushed percussion. No commercial recordings, drum
loops, borrowed melodies, or artist imitations were used.

The six-note lantern motif is D–F♯–A–E–D–B. Extended 6/9, major-9 and minor-9
voicings connect the arrangements. Phrases include rests and answering lines;
soft swing, deterministic microtiming and velocity variation avoid mechanical
retriggering. Home/map arrangements are 32 bars; other cues are 16 bars, about
42–54 seconds. Different lead colors, harmony, register, density and tempo follow
the worlds and characters.

## Cues

- `home`, `map`: invitation and exploration.
- `world-0` … `world-9`: Pippin, Fern, Compass, Quill, Maestro, Flint, Tock,
  Lyra, Zephyr and Astra each have an arrangement.
- `duel-high`: a firmer brushed pulse for phase-two encounters.
- `lab-hub`, `lab-potion`, `lab-circuit`, `lab-creature`, `lab-weather`,
  `lab-observatory`: Fizzwick's hub and five experiments/models.
- `practice`, `library`, `library-storm`, `rescue`, `finale`: restrained study,
  mysterious shelves, flying books, rescue and homecoming.

Exact titles, durations, checksum, levels and MPEG gapless metadata are in
`manifest.json`. The 24 runtime MP3s total 12,850,176 bytes. All are embedded in
both game editions; no external audio request or runtime music library is used.

## Rebuild

```
python scripts/compose-storybook-music.py
python scripts/render-storybook-music.py --jobs 2
node scripts/build-standalone.cjs
```

Run from the repository root. Build dependencies are Python/NumPy/SciPy,
libfluidsynth.so.3 and FFmpeg/ffprobe with libmp3lame. The existing bundled
`source/TimGM6mb.sf2` is used. No new package is needed in the browser or Amplify
runtime. Editable JSON and Standard MIDI for every cue are in `source/`.
Historical home/map sketches remain there as archives, outside the runtime set.

Rendering warms two cycles before capture so held notes span the seam. Original
kick/brush/hat envelopes are synthesized from sine/noise. Circular EQ and room
reflections preserve tails; subtle periodic tape drift and gentle saturation
soften the mix. Conservative peak limiting and matched RMS keep transitions
consistent. MP3s use stereo 32 kHz / 80 kbps after intentional soft EQ; source
frame counts, encoder delay and padding are recorded. The player handles codec
padding and repairs small decoded endpoint discontinuities without changing
loop length.

## Rights and sources

Original compositions, score-generation/render code and synthesized percussion
are authored for this project under its MIT license. TimGM6mb is credited to
Tim Brechbill (2004) and David Bolton (2010); its existing copyright text is in
`source/SOUNDFONT-COPYRIGHT.txt`. The SoundFont and distributed rendered audio
use **GPL-2.0-only**, as documented in `LICENSE-GPL-2.txt`. The SoundFont checksum
is retained in the manifest. Score JSON, MIDI, scripts and the instrument source
are available in this repository. In-game credits retain the license text and
source location.

## Source and generated game files

Run `node scripts/build-standalone.cjs` before previewing or testing this branch.
The audio coordinator and its small control/lifecycle hooks now live in
`src/audio-coordinator.js` and `src/audio-integration.json`; the existing build
embeds them together with all music assets. The checked-in HTML files serve as
build templates. The complete generated standalone file is produced by the
build, and Amplify runs that same step before publication. A rebuild from the
previous source templates was verified byte-for-byte against the reviewed
standalone output. This keeps large generated audio HTML out of source updates
without reducing soundtrack quality or changing offline playback.
