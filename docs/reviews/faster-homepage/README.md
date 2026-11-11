# Faster homepage startup

The hosted homepage previously downloaded the complete embedded soundtrack and
illustrations before its main script could initialize. That exposed the default
Ellery form, empty avatar and misleading viewer warning while the player waited.

Hosting now uses a small HTML document, an external game script, and content-hashed
image/music files. Only the home hall is preloaded; mode-card paintings load lazily
and music downloads when its scene is requested after an audio-unlocking gesture.
Identical recordings and Science Lab aliases share files. The original uploaded
recordings and all image bytes are unchanged. No assets or licenses were added.

The game script keeps classic parser execution at the original body position.
This preserves the modules' DOMContentLoaded initialization order. A small early
helper shows a neutral welcome until both core boot and the saved-profile HomeHub
layout finish. JavaScript-disabled readers retain readable help and an explicit
fallback. A delayed load offers a native reload link and can still finish normally.
Existing audio controls, stored preferences, crossfades, saves and questions remain.

`customHttp.yml` configures immutable caching for hashed asset directories and
revalidation for the document. These are configuration changes; response headers
at Amplify's edge have not been observed here.

Measured generated files (bytes, decimal):

| Files | Raw | gzip level 9 |
| --- | ---: | ---: |
| Embedded build plus Librarian JS/CSS | 38,194,116 | 26,644,069 |
| Embedded index.html before hosted packaging | 37,633,242 | 26,247,098 |
| New hosted index.html | 259,039 | 57,846 |
| New HTML, game JS, Librarian JS/CSS and home hall | 3,461,347 | 754,081 |

The last row excludes dynamic image requests made when rendering the selected
hero and visible UI. These are file-size comparisons, not measured iPhone load
times. The complete hosted package remains 27,760,656 bytes, with 62 separate
images and 18 unique music recordings available as needed. The offline standalone
edition still embeds every asset and does not require network music access.

Validation completed: all 22 existing build checks, the new startup state/syntax
test, strict mocked audio lifecycle/fetch tests, and hosted fixture plus actual
artifact file-integrity checks. The latter verify every output asset hash, all
extracted URLs, exact audio metadata, aliases, deduplication, repeatable output,
malformed input rejection and unchanged standalone/source files.

Browser execution remains blocked by this environment: local HTTP binding fails
with `listen EPERM 127.0.0.1`; a separate direct Chromium attempt fails with
`setsockopt: Operation not permitted` and SIGTRAP. No browser screenshots,
physical Safari timings or production deployment are claimed. The new browser
test covers held-script startup, wrong-profile flashes, no pre-gesture music
requests, saved-hero hydration, normal controls, no-JS and delayed/error recovery.

Build and review:

```sh
node scripts/build-standalone.cjs
node scripts/build-hosted.cjs
node tests/hosted-build.test.cjs
node tests/home-startup-browser.test.cjs
```

Serve `dist/` for the hosted preview. In a sandbox that forbids local sockets,
`node tests/hosted-build.test.cjs --files-only` runs all file/fixture assertions
and explicitly omits HTTP checks. The normal Amplify command includes HTTP checks.

Next device check: open a cold page and reload on iPhone Safari; confirm the saved
hero appears with the final hall, then open the map, a guardian and Science Lab
and check that their tracks and mute/volume controls still behave correctly.
