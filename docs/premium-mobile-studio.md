# Focused mobile studio

The editor reserves its remaining viewport height for a centered active page. Adjacent pages indicate horizontal navigation; the filmstrip uses 52 px previews. Design controls live in a native modal panel, with format, collection, spacing, border, and progressive project controls. The main toolbar keeps photos, collections, design and composition variation reachable. Full-screen preview uses the same rendered composition and keeps the editing position unchanged.

Photo selection exposes Replace, Crop, Swap and Pin. Swap exchanges sources within an unlocked, non-panorama page and recalculates safe framing without moving either slot. Photos with unavailable face detection retain full-image fitting. Each operation is one history transaction; originals remain in the project store. Rapid repeated photo taps select rather than accidentally opening crop.

Eight featured collections have explicit layouts for 4:5, 1:1 and 9:16. Tall diptychs and triptychs stack; square layouts use horizontal grids. Generation scores usable photographic area and uses bounded alignment/scale variants to avoid repeated fitted compositions. The complete library remains searchable. Enlarged collection previews show every generated page using bounded temporary photos.

`FrameDesign` adjusts existing native image/decorative layers uniformly and preserves zoom, crop offsets and source aspect. Page overrides and whole-album defaults survive history, saved projects and regeneration. Spreads are excluded from these transforms to preserve seams. Borders use the existing shared preview/export border fields.

Validation includes viewport geometry at 390×844 and 375×667, format-specific PNG dimensions, navigation, collection dismissal, swaps, pinning, undo, restore and original-photo retention. Existing browser acceptance now enters the design panel when exercising moved controls.
