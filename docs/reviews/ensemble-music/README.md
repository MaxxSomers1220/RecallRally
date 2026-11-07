# Homepage and adventure-map ensemble revision

Built on main `a069e2a` after PR #25 merged. The user approved the fuller 44-second ensemble sketch; these cues develop that arrangement into actual playable 32-bar loops. The approved preview remains unchanged.

| Cue | Tempo / length | Listen | Editable source |
| --- | --- | --- | --- |
| An Invitation to Adventure — homepage | 92 BPM, 83.477 s | [MP3](../../../assets/music/home.mp3) | [MIDI](../../../assets/music/source/home.mid), [JSON](../../../assets/music/source/home.json) |
| The Lantern Trail — map | 104 BPM, 73.847 s | [MP3](../../../assets/music/map.mp3) | [MIDI](../../../assets/music/source/map.mid), [JSON](../../../assets/music/source/map.json) |

[Composition design](DESIGN.md) describes phrase development, voice-leading, registers, negative space and return. The homepage retains the approved opening across piano, flute, violin, cello, strings and harp. The map has its own phrasing, piano afterbeats and walking acoustic bass. Median concurrent scored notes are 10 and 9; the intent is connected ensemble writing rather than isolated notes. This count is not a judgment of how good the arrangement sounds.

## Integration and sources

The existing merged audio runtime is unchanged. Only home/map assets and their session tempo metadata change. Existing context ownership, scheduler, gains/ducking, bookmarks, autoplay unlock, MP3 gapless normalization, suspension and voice cleanup are reused. Original guardian/outcome/rescue/reunion music is protected by the unchanged legacy-score contract. No questions, grading, timing, customization or save schema change.

Original scores/MIDI/code remain MIT; sampled TimGM6mb and rendered MP3s retain the disclosed GPL-2.0-only provenance. [Source, license and reproduction](../../../assets/music/PROVENANCE.md). These are sample-based MIDI renders, not live performers. The approved score is copied unchanged into `assets/music/source/approved-ensemble-sketch.json` as a reproducible build input so minimal staged builds do not depend on review documents. Only the two runtime MP3s are embedded in the delivery HTML; the SoundFont and review files are excluded from Amplify output.

## Verification

- Existing music contract: both files' hashes, sizes, licensed sources, MIDI, bounded source PCM and loop metadata pass. Original encounter score/rendering functions remain exact against the existing fixture.
- New ensemble contract: the homepage's opening matches the approved score across all six tracks; simultaneous harmony, sustained multiple-part coverage, distinct map melody/bass and authored session tempos pass. Existing test assertions are preserved.
- Local desktop Chromium: 31 music/state/native-grade/save/offline checks in each of laptop (1366×768), phone (375×667) and tablet (820×1180) layouts, plus unavailable-context and failed-codec cases. [Results](chromium-results.json), [failure handling](chromium-failure-results.json).
- Actual Amplify command list/emitted game: all build/static tests and desktop/phone music/gameplay/failure checks pass. [Results](amplify-chromium-results.json), [failure handling](amplify-chromium-failure-results.json).
- Fresh-cache offline decoding of both embedded cues passes after page reload. This does not establish a service-worker/PWA or cold hosted offline-reload guarantee.
- Hosted Chromium/WebKit, direct-file and native 48 kHz checks, and final broader regression status are linked in the draft PR. Desktop automation is not physical Safari testing.

## Actual gameplay with sound

- Homepage loop boundaries: [first](home-loop-1.mp4), [second](home-loop-2.mp4).
- Map loop boundaries: [first](map-loop-1.mp4), [second](map-loop-2.mp4).
- [Map → encounter → map → home, answer feedback and mute](navigation-with-audio.mp4).
- [Capture method and timestamps](recording-timeline.json).

Recordings use the actual rendered game and post-volume/duck music/effects buses at normal clocks, not an added soundtrack. Two natural loop boundaries per cue are captured before navigation. No physical-device output or sub-frame audiovisual synchronization is claimed.

## Export compatibility

The new map export initially exceeded the existing repeat/seam bounds at 48 kHz. The renderer now rounds the loop region to the nearest 1/300-second grid (integer frames at both 44.1 and 48 kHz, within 1.7 ms of the nominal 32-bar duration) and applies symmetric eight-millisecond boundary ramps. MIDI/note data and arrangement stay unchanged; session tempo still follows the authored BPM. The original browser assertions remain unchanged. The native 48 kHz Chromium phone check with an explicitly simulated untrimmed MP3 decoder passes all 32 checks plus both failure cases: [results](48k-padding-simulation.json). This is not an actual WebKit result; hosted WebKit outcomes are in the PR.

## Measurements and limitations

[MP3/PCM measurements](audio-measurements.json): runtime audio totals 2,519,125 bytes (previously 2,899,050), with about 55.5 MB cached decoded PCM at 44.1 kHz (previously 63.9 MB). Decoded peaks are 0.565/0.639 full scale; loop-boundary differences are 0.00128/0.00036. Repeated decoded cycles are checked against the unchanged browser threshold. These are signal checks, not listening scores or physical-device performance measurements.

The user approved the short preview's sound; full-length development, long-session fatigue, SFX balance and phone speaker quality still require listening feedback. No physical iPhone/iPad, iOS Simulator, audio-route change, real lock/unlock or human listening assessment of the full cues is claimed. On physical Safari, test gesture unlock, home/map/encounter transitions, independent volume controls, mute, app switching/lock recovery, headphone changes and longer listening. The existing managed local Chrome policy blocks direct file navigation; final direct-file results come from the hosted workflow, not a policy bypass.

No merge, deployment or ready-for-review status change is part of this work.
