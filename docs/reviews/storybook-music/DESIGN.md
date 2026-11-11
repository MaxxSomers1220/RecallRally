# Storybook music design cards

Base: main `ffbd2ed`, including merged PRs #22 and #23. Mode: compose-game-music implementation. Existing duel, outcome, rescue and reunion composition/rendering remain unchanged.

## Shared identity

An original six-note rise/turn/answer cell: D–F#–E / A–F#–E, with a later D resolution. A held note followed by two shorter responses gives the cell its rhythmic identity. Both cues use D major; the map compresses and displaces the cell rather than replacing it. No external melody or named soundtrack is used.

## An Invitation to Adventure

- Job: safe, intimate study hall; browsing, reading and choosing an activity; target repeated listening of several minutes.
- 76 BPM, 4/4, D major, 32 bars (101.0526 seconds before sample quantization).
- Form: A statement (1–8), A' answer/register variation (9–16), B relative-minor/subdominant excursion and thinner lead (17–24), A'' return with a softer turnaround (25–32).
- First five seconds: warm rolled nylon-guitar voicing, the first D–F#–E call, and an unhurried bass anchor. No noise bed or percussion.
- Lead: sampled flute/clarinet phrase handoff in the middle register, with rests and held answers. Point: rare celesta notes at phrase ends. Plane: quiet strings with common tones and staggered entrances, not block retriggers. Bass: sparse roots/inversions, not a drone.
- Inner motion: D and F# common tones bridge chord changes; cello answers while the lead rests. Harmonic rhythm is usually one chord per bar, with ties across barlines.
- Negative space: lead-free bars, no constant high sparkle, no busy arpeggio machine, no drum backbeat.
- Return: A/add9 suspension prepares the first D chord; tails wrap through the boundary rather than fading to silence.

## The Lantern Trail

- Job: safe exploration across an area-wide storybook map; walking, planning a route and discovering worlds; no combat intensity.
- 96 BPM, 4/4, D-major center with a brief Lydian G# color in the return phrase, 32 bars (80 seconds).
- Form: A walking statement (1–8), A' antiphonal answer (9–16), B more spacious relative-minor/inner-voice passage (17–24), A'' bright return (25–32).
- First five seconds: compressed shared motif, two-beat acoustic bass movement and a softly rolled plucked accompaniment. No snare or battle percussion.
- Bass: roots, inversions, occasional prepared passing notes into the next bar; two main steps per bar with periodic rests. Lead: flute/clarinet exchange, never both doubling continuously. Cello supplies a slower contrary answer. Celesta only marks a few phrase turns.
- Common-tone strings bridge changes; lead, bass and harmony do not all attack together. Four/eight-bar density changes provide direction without escalating danger.
- Return: a restrained dominant pickup and ringing accompaniment connect to bar 1. Same tonal center permits a short unobtrusive transition to the homepage.

## Sound source and proof

Before the full arrangement, export eight-bar music-only sketches with melody plus harmony/bass. Check motif returns, statement/answer, the contrasting phrase and preparation back to the start. Keep the editable note data and MIDI. Render using the installed FluidSynth library and TimGM6mb General MIDI SoundFont, not live acoustic recordings. The final runtime uses locally embedded MP3 loops through the existing Web Audio buses; the SoundFont is a build-time input only.

Self-review is a score/structure and measured-audio review in this environment, not a claim of human listening. Downloadable previews and real browser-bus recordings are supplied for audition. Do not claim blind-listening validation, physical-device sound quality or mastered/live-ensemble realism.
