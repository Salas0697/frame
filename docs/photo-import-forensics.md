# Photo import consolidation — verification status

**Status: implemented; browser acceptance NOT COMPLETE. Do not merge/deploy as a verified fix.**

Baseline: `d081227f5b54732606a3a4e9ead9b0d7c4a33968`.

## Evidence observed before implementation

In the available remote Chrome browser, the published application accepted ten real JPEGs
through the initial `photosInput` (native chooser opened with Enter; the application's
desktop overlay intercepted pointer clicks). Immediately after selection the DOM showed
“Analizando fotos” without the brief. At completion, `#stats` read `10 fotos · 8 slides`;
`#stage` contained eight slides and ten distinct blob image URLs. `#frameBrief` existed
exactly once with class `frameBriefBackdrop`, without `.on` or inline visibility styles.

In the same application, `#fastAdd` opened a different picker. Selecting two additional
JPEGs showed the brief, its two-photo count, and `.on`. Clicking the choices and “Diseñar”
removed `.on` from the brief and added it to `#loading`. The final additional-photo render
was not verified: a subsequent browser operation timed out. These observations reproduce
the initial-upload bypass, not an intermittent Safari failure of `#fastAdd` itself.

Browser policy rejected both localhost and file URLs. No local browser workaround was used.
The available browser API did not supply full DevTools or mobile viewport emulation.
No real iPhone/Safari/PWA acceptance was performed.

## Audit A–J

| Item | Finding and evidence boundary |
| --- | --- |
| A: actual input | Published DOM contained `photosInput`, `referenceInput`, and an unnamed multiple file input created by `speed-v1.js`. Initial selection and Studio selection use different inputs. |
| B: event order | Source audit: initial input has a capture `change` listener from `director-enhancements.js`, scheduling persistence at 150 ms, and the base target `onchange`, invoking `initPhotos` immediately. No import `input` listener in the loaded modules. This exact listener order was not instrumented in the real browser. |
| C: first build | Source: `initPhotos` calls `buildSlides` after its analysis loop. The current wrapper chain is storyboard → director enhancements → base builder, followed by storyboard generation. |
| D: design before brief | Observed: initial selection produces slides without any answer. Source: no brief call anywhere in `initPhotos`. |
| E: render replaces modal | Source: render replaces stage, filmstrip and sheet contents, not the modal sibling under body. New DOM integration verifies the same modal node survives rendering. |
| F: modal exists | Observed exactly once, even when initial import skipped it. |
| G: `.on` | Observed absent after initial import; present after Studio import. |
| H: CSS | Published modal was visibly rendered in a screenshot after Studio import. Its hidden class rule behaves as written when `.on` is absent. Other Safari-specific CSS interactions remain untested. Desktop `body::before` blocks normal pointer access at widths ≥700px. |
| I: cache/PWA | Source has a manifest but no service-worker registration. Historical service-worker registrations, Cache Storage and Safari's suspended document were NOT inspected. Do not claim a cache root cause or successful PWA update. |
| J: competing flows | Two independent import routes confirmed. They need not run on the same event to cause inconsistent behavior. |

Loaded module audit: `interaction-v1.js`, `ux-rescue-v1.js`, and `photo-editor-v2.js` add
editing/gesture/render behavior, not photo import handlers. `storyboard-v1.js` wraps
`buildSlides`; it does not own the picker. `enhancements-v6.js` contains another legacy
file persistence listener but was not loaded by the inspected root entrypoint.
Other historical designer modules on disk were not loaded by that entrypoint either.
The nested `frame/index.html` previously loaded only director enhancements, another entry
that could never show the speed module's brief. The old `frame/v2.html` also injected obsolete
gestures into that nested application.

## Implemented changes

- A single `PhotoImportController` owns the `change` and `cancel` handlers of `photosInput`.
  Studio and empty-state buttons synchronously open that same native input within the user gesture.
  There is no second `addInput`, no capture interceptor and no `initPhotos` wrapper.
- Copy the `FileList` to an array before clearing the input; keep original File references
  in `pendingFiles` through the brief, analysis and persistence. No decoding, face detection,
  composition analysis or storyboard generation starts until the brief resolves.
- Show the already-mounted modal synchronously on `change`; remove the 120 ms delay and
  redundant inline visibility overrides. Add selected count, dialog semantics, focus handling
  and scrolling for short viewports. Keep the visual designer unchanged.
- Extract analysis from the UI module. Keep results in source order across workers and fail
  the batch on a decode failure, releasing newly created URLs. Bound image decode and face-script
  load waits. Face analysis still falls back when its external dependency is unavailable.
- Commit photos only after analysis completes; roll back model changes on generation failure.
  “Otra opción” still uses existing photos and the accepted brief without reopening the picker.
- Remove the timed capture persistence handler and the separate timed resume handler.
  Persist exact File/result pairs in an awaited IndexedDB transaction without clearing earlier
  batches. Restore originals before rendering, with a single resume handler.
- Keep the current session usable when localStorage/IndexedDB is unavailable; show a persistence
  warning instead of implying that the originals were saved.
- Replace the eight-part base64 reconstruction and `document.write` loader with generated static
  HTML plus one runtime bundle whose filename contains its content hash. Both entrypoints use the
  same bundle. The old `v2.html` entry redirects to the canonical app.

`frame/director/base.html` is the readable source of the former encoded base. The historical
encoded chunks and inactive modules remain on disk for old asset references; the new entrypoints
do not load them. No existing cache or service worker is deleted indiscriminately. Content
addressing prevents new documents from mixing module revisions; it cannot retroactively execute
new code in an already suspended old Safari document. That update path requires device verification.

## Automated verification (not browser acceptance)

Run with Node 24+: `npm ci`, `npm run build`, `npm test`.

16 tests pass:

- Controller ordering/File identity with 8, 10 and 12 Files, input reset, additional batch,
  empty selection/cancel, duplicate events, analysis error and generation rollback.
- Full application DOM integration in jsdom with 8, 10 and 12 files, real application handlers,
  brief, storyboard algorithm, rendering, variation, append and cancellation. Image decoding
  is deliberately substituted. These tests do not provide screenshots or prove Safari behavior.
- One import change handler, no base `onchange`, modal node preserved, no analysis before answer,
  complete source-URL coverage, matching content hashes across both entrypoints, and blocked storage.
- IndexedDB tests via fake-indexeddb: retain previous batches, restore byte-identical originals
  and match layer/photo IDs; missing originals fail without partial model mutation.

jsdom cannot parse all unchanged legacy CSS; its CSS parser warnings are excluded from this
nonvisual suite. Uncaught application errors fail the tests. No CSS/layout validation is claimed.

## Required browser acceptance

| Required test | Actual browser result for the correction |
| --- | --- |
| Clean reload → + Photos → 8–12 real images → brief → answer → analysis → carousel, round 1 | NOT RUN |
| Same sequence, round 2 | NOT RUN |
| Same sequence, round 3 | NOT RUN |
| Same selected originals used in the resulting carousel | NOT RUN |
| Another option without a new brief | NOT RUN |
| Additional real photos → brief → answer → incorporation | NOT RUN |
| Cancel native picker → no brief and unchanged project | NOT RUN |
| Safari/PWA resume, service-worker and Cache Storage inspection | NOT RUN |

For instrumentation, listen to `frame:import-phase` on `document`; event detail contains
`phase` and `count`, never raw Files. `document.documentElement.dataset.photoImportPhase`
also exposes the phase. `window.framePhotoImport` exposes the owner for local DevTools
inspection. Verify zero analysis calls before answering; do not substitute event injection
or DOM tests for a real native file picker acceptance run.

## Remaining technical debt / limitations

- Real browser and iPhone acceptance is the blocking verification gate.
- Face detection relies on an external MediaPipe script/model; accuracy and late callbacks
  under dependency timeouts were not validated on a device.
- Historic projects whose originals were never persisted cannot be reconstructed from dead blob URLs.
- Old unused IndexedDB photo records are retained; quota cleanup needs a separate design.
- Existing designer/render wrappers and the desktop overlay remain; this change only consolidates import.
