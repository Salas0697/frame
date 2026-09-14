# FRAME editorial refinement

This update addresses pale color backgrounds, weak cover hierarchy and difficult reframing.

- Backgrounds: automatic family palette, pure white, deep black, or a stronger photo-derived color. Caption contrast follows the page background.
- Frames: Gallery, Mat and Fine rule; geometry and border treatment are represented in the exported model.
- Covers: exposure, sharpness, resolution, crop fit and detected subjects contribute to ranking. A user-selected cover is retained by Another option. This remains a heuristic, not a trained aesthetic judgment model.
- Reframe: same aspect ratio as the actual slot; pointer drag, two-pointer pinch, keyboard arrows, contain/cover/center, zoom and explicit Cancel/Done. Shared crop geometry drives preview, thumbnails and PNG export. Undo records the pre-edit state.
- Keep pages: pinned pages and their photos remain fixed during regeneration. Continuous panorama groups are pinned together.
- Preview: full-composition thumbnails, quieter typography, straighter page corners, larger controls, reduced-motion support and viewport-aware preview sizing.
- Import: no new file input or import handler. The existing controller still requires the brief before analysis.

Validation prepared: existing unit/DOM suite, new crop/cover/background regressions, and GitHub Actions acceptance with real JPEG fixtures in Chromium and WebKit at a mobile viewport. CI results must be checked before merge. WebKit on Linux does not equal device-level iPhone/PWA verification.
