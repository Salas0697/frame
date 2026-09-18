# Template-first journey

The photo survey is replaced by a template chooser. PhotoImportController retains the exact File objects and remains the sole import owner. The new `templates` phase mounts immediately after selection; no analysis, storyboard commit or project persistence runs until confirmation.

The chooser reads image dimensions and a 42×42 pixel sample sequentially, without face detection or GPS lookup. Four recommendations use photo count and orientation, with an expandable catalog of all 18 original collections. Previews use the same composition engine and selected photos. Final analysis refines face-safe crops; previews are illustrative rather than a promise of identical geometry.

Cancel/Escape preserves the current project and revokes temporary URLs. Appending includes existing photos in previews; only new originals are analyzed. Location is optional, appears once, and retains first/middle/last placement. Changing template in the editor reuses analyzed originals. Another option stays in the selected family. Automatic family exploration remains available through the style control.

Journey: select photos → choose a live template → create → tap to crop / adjust colors / vary composition → Export → current page or full carousel. Existing IndexedDB restore and content-addressed runtime remain in use.

The previous survey DOM and handlers and the separate diagram-only collection dialog were removed. No additional file listener or import wrapper was added.

Recommendation scope: count and aspect ratios only. Subject recognition, recommendations from learned user preferences, exact preview/final geometry parity and new cross-page torn-paper designs are future work, not claimed here.

Rasgadas y cortes: four original families (Rasgado Atelier, Horizonte Rasgado, Corte Diagonal, Mosaico Cortado), each with three layouts and two covers. A dedicated chooser filter also scopes Surprise to this series. Seeded vector edges are persisted on layers and shared across preview, crop editing, thumbnails and PNG export; no raster overlay assets or extra canvas surfaces. If a cut could cross a detected face, only the paper is cut. These are individual-page compositions, not cross-page tears.
