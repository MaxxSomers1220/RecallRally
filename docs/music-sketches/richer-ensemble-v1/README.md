# Fuller ensemble — listening sketch 1

Preview only: **not selected by the game, embedded in either HTML, or copied to Amplify output**. The existing cues remain unchanged pending listening feedback. This rebuild responds to the feedback that the earlier tracks sounded like isolated single notes.

- [Full ensemble MP3 — 44 seconds](full-ensemble.mp3)
- [Harmony and bass alone — first eight bars, 21 seconds](harmony-and-bass.mp3)
- [Editable multitrack MIDI](editable.mid) · [Note data](score.json)

Original composition, 92 BPM, 4/4, D major, 16 bars plus release tail. A four-bar statement expands into an answering phrase, a rising contrasting phrase, and a resolved return. The shared D–F#–E–A cell is developed rhythmically rather than traded between isolated lead instruments.

The opening combines a flute melody, simultaneous piano voicings and moving cello bass. Violin adds an independent overlapping countermelody. Sustained inner voices tie common pitches across harmony changes. Seventh/ninth/sixth colors, bass inversions, inner-neighbor resolutions and a B7 → Em7 secondary dominant develop the harmony. Sparse harp figures connect phrase endings; there is no percussion or noise bed.

This is a finite listening sketch with a closing cadence and release tail, **not a finished seamless game loop**. It demonstrates an arrangement direction before composing replacement full-length cues or changing integration.

## Source and checks

Sample-based rendering with the existing FluidSynth/TimGM6mb pipeline, not a live ensemble recording. Same licensed sound source as the PR's original previews: [provenance](../../../assets/music/PROVENANCE.md), [SoundFont copyright](../../../assets/music/source/SOUNDFONT-COPYRIGHT.txt), [GPL-2.0 license](../../../assets/music/LICENSE-GPL-2.txt). Rendered MP3s retain GPL-2.0-only; original composition/MIDI and code use the repository MIT license. The SoundFont and rendering tools are build-only, never runtime services.

Reproduce from the repository with `python docs/music-sketches/richer-ensemble-v1/compose.py` using NumPy, FluidSynth and FFmpeg. This writes review files in this folder only; it does not rebuild or change the game.

[Measurements](measurements.json) confirm nonzero signal, 0.76 peak without PCM clipping, a median of nine concurrently scored voices, and at least six at the tenth percentile. These establish that the arrangement is polyphonic; they do not establish perceived musical quality or balance. Human listening approval is pending. Provisional structural self-review: motif/form/thickness 3/3; scene fit, concentration, instrument rendering, dynamics and fatigue remain unverified by listening. Loop readiness is deliberately not claimed.
