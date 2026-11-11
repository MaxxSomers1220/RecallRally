# Uploaded music

Home uses homepage.mp3; the adventure map uses adventuremap.mp3. Science Lab
hub, all five stations and models share science.mp3 without restarting it on
station changes. guard1 through guard10 map in order to worlds 0 through 9:
Pippin, Fern, Compass, Quill, Maestro, Flint, Tock, Lyra, Zephyr and Astra.
Guardian recordings continue through phase two. Other scenes retain their music.

Playback copies in assets/music/user preserve full recording durations (30–152
seconds), with stereo 32 kHz / 96 kbps encoding, consistent levels/headroom and gentle
0.5-second opening/tail fades. These are soft repeats of supplied songs, not
claims that their compositions are seamless loops. Existing controls, saved
preferences, scene crossfades, cue ducking and pause/resume remain. A 24 kHz context
is requested with browser-default fallback to reduce memory for long recordings.

The user manifest records mappings, original upload checksums/byte counts,
playback checksums and exact MPEG delay/padding/frame counts. Original uploads
remain in session attachments. Their ownership/license was not supplied; no
GPL/MIT license is inferred for them. Credits distinguish these recordings from
remaining original fallback music.

Build before previewing: node scripts/build-standalone.cjs. The existing HTML
templates generate both updated game editions, embedding Science audio once.
Tests check every destination/content hash in both editions, frame counts,
shared Science payload, phase-two selection and mocked playback lifecycle.
All 22 static checks are recorded in checks.json. Live browser playback and
listening by ear remain unverified; this is a review branch, not a deployment.
