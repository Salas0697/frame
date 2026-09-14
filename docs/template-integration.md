# Editorial template integration

The runtime now loads `frame/template-catalog.json` in the same content-addressed bundle as the engine. Eight families / eighteen variants are available through automatic brief-based selection and the Studio style selector. The initial research remains in `template-research.md` and `template-catalog.proposed.json` as provenance.

`template-engine.js` creates a complete album from already-analyzed photo objects. `storyboard-v1.js` adapts its output to the existing editor and export model. `buildSlides()` delegates to this owner. The old base generator and Director smart-selection wrapper have been removed from the generation path: there is no preliminary legacy layout, filtering away selected images, or extra file handler.

Museum Notes supports 9/6/4-photo grids with white margins; twelve suitable photos can produce 1 + 2 + 9. All selected photos must be represented exactly once, except intentional continuous panoramas. Single-photo fallback preserves aspect ratio. Dense layouts reject unsafe face crops; panoramas check individual page seams. Scrapbook overlap is restricted to photos without detected faces. No detector can guarantee safety for subjects it did not detect.

The optional footer is available for families with caption regions. It uses only entered text, remains editable, and exports with explicit line breaks. “Otra opción” reuses the brief and analysis; selecting a specific family keeps variations in that family. Style and note changes participate in undo and project persistence.

An old desktop-only CSS overlay prevented all pointer interaction on wide screens. It is replaced with a centered upload panel; mobile geometry is retained. This permits actual desktop browser verification.

## Automated verification

`npm run build && npm test`: 23 tests pass. Coverage includes all eighteen variants, 1/2/3/4/6/8/9/12/24-photo batches, unique photo coverage, face/group fallback, panorama seams, geometry bounds, footer handling, selector persistence, and import/brief/variation/append/cancel integration. The integration suite uses jsdom with substituted image decoding; it is not a real-browser claim.

## Browser verification

Deployment and live verification are recorded separately after the version is available. iPhone Safari/PWA requires a device-level check; the available cloud browser is Chrome.
