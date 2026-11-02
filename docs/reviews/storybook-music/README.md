# Homepage and adventure map music

Based on main `ffbd2ed`, with PRs #22/#23 merged. Two new original scores are integrated into the actual homepage and Rescue Rigby map. The existing audio context, music/effects gains, ducking, saved preferences and single scheduler remain the owners. No gameplay grading, timing, hero or save schema was changed.

## Listen and inspect

| Cue | Full listening preview | Editable MIDI | Plain eight-bar proof |
| --- | --- | --- | --- |
| An Invitation to Adventure | [MP3](../../../assets/music/home.mp3) | [MIDI](../../../assets/music/source/home.mid) | [Sketch MP3](../../../assets/music/source/home-sketch.mp3) / [MIDI](../../../assets/music/source/home-sketch.mid) |
| The Lantern Trail | [MP3](../../../assets/music/map.mp3) | [MIDI](../../../assets/music/source/map.mid) | [Sketch MP3](../../../assets/music/source/map-sketch.mp3) / [MIDI](../../../assets/music/source/map-sketch.mid) |

[Design cards](DESIGN.md) specify motif, harmony, phrasing, common tones, bass, silence and loop return. Both use an original D–F#–E / A–F#–E cell. Home is 76 BPM and 101.052630s; map is 96 BPM and 80s. Both have 32 bars with A/A'/B/A'' development. The map return briefly colors the D-major center with G# before returning to chord tones. JSON tracks retain bar/beat/duration/note/velocity and instrument roles.

This is **sample-based General MIDI rendering**, not live acoustic recording or a mastered orchestral soundtrack. TimGM6mb and the rendered MP3 assets have GPL-2.0-only notices; original score/MIDI and code use the repository MIT license. The unchanged SoundFont, its copyright notice, full license, renderer and editable source are supplied. [Provenance and reproduction](../../../assets/music/PROVENANCE.md). License notices/source location are embedded in both delivered HTML files.

## Actual gameplay recordings with sound

- Homepage natural loop boundaries: [first](home-loop-1.mp4), [second](home-loop-2.mp4).
- Map natural loop boundaries: [first](map-loop-1.mp4), [second](map-loop-2.mp4).
- [Map → encounter → map → home, correct/incorrect feedback and master mute](navigation-with-audio.mp4).
- [Capture timestamps and method](recording-timeline.json).

These excerpts come from one continuous 379-second desktop Chromium recording. No physics, audio clock, score or wins were replaced or accelerated. Audio is captured from the game's actual post-volume/duck music and effects buses, then aligned with video timestamps; it is not an independently laid-in soundtrack or microphone capture. Each boundary excerpt is nine seconds. Full raw capture is generated in the CI artifact workspace; curated clips and timestamps are retained here. Physical-device output and sub-frame audiovisual synchronization are not claimed.

## Automated verification

| Coverage | Result |
| --- | --- |
| Chromium 1366×768,375×667,820×1180 | 31 music/state/grading/save/offline assertions per layout; [results](chromium-results.json) |
| Unavailable device / codec simulation | Visible state; native Written Practice still grades correctly; [results](chromium-failure-results.json) |
| Native 48000Hz AudioContext | 32 assertions plus failure cases; exact repeated decoded cycles; [results](chromium-48k-results.json) |
| Actual Amplify command list / emitted game | All build commands pass; desktop/phone music and failure cases pass; [results](amplify-chromium-results.json), [failures handled](amplify-chromium-failure-results.json) |
| Existing homepage suite | All 458 assertions across eight DPR 1/2/3 layouts, plus storage-denied handling, unchanged; [results](home-regression-results.json) |
| Existing player-experience browser suite | All four layouts pass unchanged: grading, explanations, timers, shared hero and Librarian close |
| Asset/legacy score gates | Embedded audio hashes, source/MIDI/font/license, size budget and exact existing duel/rescue/outcome composition/rendering pass |

Music tests cover real-gesture unlock, pre-gesture silence, independent gains, master mute, music toggle, reload, bookmarks, dialogues, other activities, rapid navigation, context suspension/recovery, simulated visibility, native correct/incorrect answers and an earned seal. Offline checks reload first, disable network, then decode both embedded MP3s from a fresh audio cache. Two decoded cycles are also rendered through an OfflineAudioContext for exact sample-grid comparison; the natural-clock recordings independently demonstrate live repetition.

Range input events and visibility/device failures are simulated and labeled. A suspended AudioContext freezes `onended` callbacks: tests require silence/no active session while suspended and verify settled source cleanup after running resumes. Direct `file://` navigation is blocked by this managed local browser's administrator policy; it is **not counted as a local pass**. The dedicated CI workflow tests direct-file delivery separately, along with desktop WebKit. Final hosted results/artifact links are in the draft PR.

## Measurements and musical review

The two runtime MP3s total 2,899,050 bytes (3,865,400 base64 bytes). Neither the 5.7 MiB SoundFont nor sketches/source scores are copied into Amplify output; they are build/review materials. Both loops are decoded lazily and cached once per page. Measured cached PCM totals 63,875,368 bytes at 44.1kHz and 69,524,208 bytes at 48kHz. Repeated navigation settles to one playing source, two cached buffers, one observer and the original context/scheduler.

At44.1kHz, decoded boundary differences are 0.001437/0.001220 full-scale for home/map; two complete rendered cycles compare identically. Loop endpoints are rounded to each browser's output sample grid. MP3 true peaks are about −3.6/−3.5dBFS, with integrated loudness −16.9/−17.9LUFS before the existing user music gain and ducking. Default-gain gameplay captures contain nonzero audio with headroom. [Raw measured summaries](audio-analysis.json).

Provisional composition self-review (0–3): motif 3, phrase form 3 and loop construction 3 are supported by explicit score structure and measurements; fit/function 2, ensemble texture 2, idiom 2, sampled-source quality 2 and SFX space 2 are compositional judgments awaiting human audition. The score has deliberate held notes/common tones, separated layer attacks, answering lines, phrase-level rests and sparse celesta. **No human or blind-listening test was performed in this environment.** Automated checks prove signal/state/loop behavior, not aesthetic preference, fatigue tolerance, instrument realism or perceived balance. Listening previews and actual game audio are supplied for that review.

No physical iPhone/iPad, iOS Simulator, VoiceOver, real lock/unlock or speaker/headphone testing was available. Actual Safari interruption/route changes, longer listening and mobile memory pressure remain checks for physical devices. This adds no service worker or PWA contract; cold hosted offline reload and iOS Files execution are not promised. No merge or deployment is claimed.

## Reproduce

```sh
node scripts/build-standalone.cjs
node tests/storybook-music.test.cjs
MUSIC_ENGINE=chromium node tests/storybook-music-browser.test.cjs
MUSIC_ENGINE=webkit node tests/storybook-music-browser.test.cjs
node tests/storybook-music-package.test.cjs
MUSIC_TEST_RATE=48000 MUSIC_VIEWS=phone node tests/storybook-music-browser.test.cjs
STORYBOOK_FILE=1 MUSIC_VIEWS=phone node tests/storybook-music-browser.test.cjs
node scripts/record-storybook-music.cjs
```

Playwright 1.62.1 and its selected engine must be available; `CHROMIUM_PATH` selects a local executable. `MUSIC_REPORT` selects an evidence directory. Recordings require existing FFmpeg; their raw files stay outside the repository by default.
