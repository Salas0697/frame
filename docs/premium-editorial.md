# FRAME editorial refinement

This update addresses pale color backgrounds, weak cover hierarchy and difficult reframing.

- Backgrounds: automatic family palette, pure white, deep black, or a stronger photo-derived color. Caption contrast follows the page background.
- Frames: Gallery, Mat and Fine rule; geometry and border treatment are represented in the exported model.
- Covers: exposure, sharpness, resolution, crop fit and detected subjects contribute to ranking. A user-selected cover is retained by Another option. This remains a heuristic, not a trained aesthetic judgment model.
- Reframe: same aspect ratio as the actual slot; pointer drag, two-pointer pinch, keyboard arrows, contain/cover/center, zoom and explicit Cancel/Done. Shared crop geometry drives preview, thumbnails and PNG export. Undo records the pre-edit state.
- Keep pages: pinned pages and their photos remain fixed during regeneration. Continuous panorama groups are pinned together.
- Preview: full-composition thumbnails, quieter typography, straighter page corners, larger controls, reduced-motion support and viewport-aware preview sizing.
- Import: no new file input or import handler. The existing controller still requires the brief before analysis.

Validation: 26 unit/DOM regressions and 8 real-JPEG browser acceptance cases passed on 2026-09-14 ([run](https://github.com/Salas0697/frame/actions/runs/34885964254)). Each browser completed imports of 8, 10 and 12 photos plus finishes, fixed pages, crop transactions, cover retention, full thumbnails and PNG export. A final guard asks users to unpin a page before promoting one of its photos to the cover; that regression is included in the same browser suite and must pass on the final commit. WebKit on Linux does not equal device-level iPhone/PWA verification.
