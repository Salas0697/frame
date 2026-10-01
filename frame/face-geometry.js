/* Adapt the published MediaPipe JS contract, plus older serialized proto boxes. */
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FrameFaceGeometry = api;
})(typeof window !== 'undefined' ? window : globalThis, () => {
  const clamp = n => Math.max(0, Math.min(1, n));
  function box(detection) {
    const js = detection?.boundingBox;
    const b = js || detection?.locationData?.relativeBoundingBox || detection?.relativeBoundingBox;
    if (!b || ![b.width, b.height].every(Number.isFinite)) return null;
    const left = js ? js.xCenter - b.width / 2 : b.xMin ?? b.x;
    const top = js ? js.yCenter - b.height / 2 : b.yMin ?? b.y;
    if (![left, top].every(Number.isFinite) || b.width <= 0 || b.height <= 0) return null;
    const x = clamp(left), y = clamp(top), w = clamp(left + b.width) - x, h = clamp(top + b.height) - y;
    if (w < .02 || h < .02) return null;
    return {x, y, w, h, score: Number(detection.score?.[0] ?? detection.score ?? 0)};
  }
  return {box};
});
