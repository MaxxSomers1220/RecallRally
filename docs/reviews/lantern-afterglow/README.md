# Lantern Afterglow — soundtrack review

The former implementation had two sampled menu/map cues, simpler oscillator
music for duels/rescue, and silence in most lab/practice/library states. This
change adds one coordinated suite of 24 original arrangements with a shared
six-note melody, warmer sampled electric piano/guitar/bass, richer extended
harmony, soft original brushed percussion and world-specific melodic colors.

## Preview

Open [listen.html](listen.html) for four self-contained listening excerpts:
Home, Astra's world, Potion Lab and high intensity. The game uses longer loops
and a quieter background mix than these audition excerpts. Full cues and
editable sources are in `assets/music/`; see its README for credits/rebuild.

To review in the game, open the branch's
`Ellery_Recall_Rally_Librarian_v4.html`, enable audio with a normal gesture, and
visit Home, the adventure map, a guardian, Science Lab stations/models and the
Librarian. Existing master mute, independent music/effects sliders and saved
preferences remain. Enable audio retries browser permission without discarding
remembered mute or volume settings.

## Integration and safeguards

- Home/map, ten guardians, high intensity, lab hub/five stations, practice,
  library/book-storm, rescue and finale all select rendered cues.
- One shared AudioContext and scheduler own all music and sound-effect buses.
  The Librarian's effects now use that same context/effects slider.
- Gentle crossfades retain at most two live loop sources. Per-cue bookmarks
  resume interrupted music. Serialized decoding cancels stale scene requests.
- Three cached decoded buffers and a 60 MiB soft byte limit bound steady-state
  memory. Live crossfade buffers and the one in-flight decode are temporarily
  protected; unused buffers are evicted. A 32 kHz context is requested with
  browser-default fallback.
- Gameplay cues and speech duck music. Master/music/effects preferences retain
  their existing storage key and independent gains. No autoplay before a real
  gesture; mute does not prevent learning/gameplay.
- Hidden pages, paused rounds and blocking dialogs stop music. Deferred browser
  suspension/resumption and touch activation retry avoid duplicate loops or
  becoming stranded in silence.
- Short outcome melodies use warmer envelopes/partials and lower level. Music
  source room/EQ/tape coloration is rendered offline, avoiding live convolution
  or heavy per-frame synthesis on laptops/iPads.

Changes are confined to audio, read-only scene notifications, and audio controls.
Question data, scoring, saves, hero identity, combat physics and progression keep
their existing implementations. The Librarian contract now separately freezes
non-audio gameplay while allowing the reviewed shared-audio hooks.

## Validation actually performed

- `node scripts/build-standalone.cjs`: passed for both editions.
- All **22 static checks** in `amplify.yml`: passed; outputs are saved in
  `static-results.json`.
- `node tests/storybook-music-runtime.test.cjs`: passed. Deferred Web Audio mocks
  cover all scene selectors, serial/stale/cancelled decodes, cache pressure,
  crossfade/retirement/source cleanup, bookmarks, independent gains, failures,
  output-rate and MPEG-padding handling, practice pause/resume, hidden/foreground
  suspension races, and touch retry of a pending resume.
- All 24 final MP3s were decoded with FFmpeg. Exact musical frame counts,
  RMS/peak, endpoints, high-frequency energy and zero clipped samples are
  recorded in `audio-analysis.json`. Encoded RMS is about .095–.097; decoded
  sample peaks stay below .66. Small codec-edge discontinuities are repaired
  by the player before looping. No listening claim is inferred from these data.
- Actual Amplify artifact assembly passed: all 24 tracks are embedded and the
  source SoundFont is excluded from runtime output (`package-results.json`).
- The updated browser suite covers live music output, track selection,
  transitions, controls, pause/resume, labs, grading/saves and offline decoding,
  but **could not execute here**. The sandbox denied the local server
  (`listen EPERM`) and Chromium launch; elevated launch requests stalled before
  starting. The combined Amplify+browser package test is therefore also unrun.
- **Listening by ear was unavailable.** An attempt to audition an actual rendered
  excerpt returned that audio input is unsupported. Neither musical taste nor
  clicks/artifacts on real speakers, Safari or a physical iPad/iPhone are claimed
  as verified. Use the listening page to assess the new sound directly.

This is a review build, not a confirmed production deployment. The next check
is listening on the user's own device, followed by the committed browser suite
in an environment that allows Chromium.

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
