/* The editor, regular history and quick undo use the same snapshot contract. */
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FrameProjectState = api;
})(typeof window !== 'undefined' ? window : globalThis, () => {
  const defaults = {
    slides: [], currentSlide: 0, randomMode: 'all', showSafe: false,
    finish: 'clean', photoEditMode: 'crop', frameBrief: null,
    frameTemplateFamily: '', frameCaption: '', frameArtDirection: '',
    frameLastDesign: null, frameBackground: 'auto', frameBackgroundColor: null,
    frameTreatment: 'gallery', frameNarrative: '', heroPhotoId: null, frameLocation: null
  };
  const copy = value => JSON.parse(JSON.stringify(value));
  function snapshot(state) {
    return copy(Object.fromEntries(Object.entries(defaults).map(([key, value]) =>
      [key, state[key] === undefined ? value : state[key]])));
  }
  function apply(state, saved) {
    Object.assign(state, snapshot(saved));
    state.currentSlide = Math.max(0, Math.min(state.currentSlide, state.slides.length - 1));
    state.selected = state.selectedType = null;
  }
  return {snapshot, apply};
});
