# Library theme: Blue Hour

The supplied `punch-deck-blue-hour.mp3` is now the Library/Librarian theme, including
the welcome screen, questions and book storms. Storm entry/exit keeps the same
playing session. Pause/resume retains its position, and closing the Library
returns to the appropriate game music. Existing volume, mute, crossfades and cue
ducking remain. Current main's 20-second book storms are unchanged.

The full recording is retained in a level-matched stereo 32 kHz / 96 kbps playback
copy, with 0.5-second endpoint fades. Duration is 165.565 seconds; size is 1,988,108
bytes. The manifest records the original/playback hashes, processing gain, exact
MPEG delay/padding, and decoded frame/peak/RMS checks. Minimal encoder alignment
adds 44 silent samples (under 2 ms), without trimming the song.

This is a user-supplied recording credited as Blue Hour — Punch Deck. Rights remain
with the respective owners; no new license is inferred. Existing soundtrack
credits distinguish uploaded recordings from original fallback arrangements.

Hosting downloads one content-hashed MP3 only when Library audio is requested;
the storm aliases the same file and decoded buffer. The hosted document remains
259,039 bytes and does not preload this song. The offline edition embeds it once.

Validation: all 23 game/static build checks passed, along with strict mocked audio
lifecycle tests, hosted fixture/actual file-integrity checks, and FFmpeg decoding
of the complete recording. Tests cover continuous storm playback in hosted and
offline modes, one fetch/decode, pause/bookmark resume, and returning Home.
Browser execution was attempted but local HTTP binding fails with `listen EPERM
127.0.0.1`. Listening by ear and physical-device playback remain unverified.

Build with `node scripts/build-standalone.cjs` then `node scripts/build-hosted.cjs`.
Serve `dist/`, enter Library, enable audio if needed, and miss a question: the song
should continue without restarting throughout the book storm. This review branch
does not establish a production deployment.
