/* Finishes affect the entire composition: background, photos, paper and text.
 * Pixel rendering also works on WebKit without CanvasRenderingContext2D.filter. */
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FrameFinish = api;
})(typeof window !== 'undefined' ? window : globalThis, () => {
  const recipes = {
    clean: [], film: [['contrast', 1.02], ['saturate', .88], ['sepia', .13]],
    soft: [['contrast', .96], ['saturate', .93], ['brightness', 1.02]],
    mono: [['grayscale', 1], ['contrast', 1.05]],
    punchy: [['contrast', 1.08], ['saturate', 1.18]]
  };
  const recipe = finish => recipes[finish] || recipes.clean;
  const clamp = n => Math.max(0, Math.min(255, n));
  function filter(finish) { return recipe(finish).map(([name, value]) => `${name}(${value})`).join(' ') || 'none'; }
  function apply(imageData, finish) {
    const steps = recipe(finish), data = imageData.data;
    if (!steps.length) return imageData;
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i], g = data[i + 1], b = data[i + 2];
      for (const [name, amount] of steps) {
        if (name === 'contrast') { r = (r - 127.5) * amount + 127.5; g = (g - 127.5) * amount + 127.5; b = (b - 127.5) * amount + 127.5; }
        if (name === 'brightness') { r *= amount; g *= amount; b *= amount; }
        if (name === 'saturate' || name === 'grayscale') {
          const saturation = name === 'grayscale' ? 1 - amount : amount;
          const y = .2126 * r + .7152 * g + .0722 * b;
          r = y + (r - y) * saturation; g = y + (g - y) * saturation; b = y + (b - y) * saturation;
        }
        if (name === 'sepia') {
          const nr = .393 * r + .769 * g + .189 * b;
          const ng = .349 * r + .686 * g + .168 * b;
          const nb = .272 * r + .534 * g + .131 * b;
          r += (nr - r) * amount; g += (ng - g) * amount; b += (nb - b) * amount;
        }
        r = clamp(r); g = clamp(g); b = clamp(b);
      }
      data[i] = r; data[i + 1] = g; data[i + 2] = b;
    }
    return imageData;
  }
  return {filter, apply};
});
