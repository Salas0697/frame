/* Explicit synchronous hooks replace nested reassignments of renderAll/saveProject. */
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FrameLifecycle = api;
})(typeof window !== 'undefined' ? window : globalThis, () => {
  const hooks = new Map();
  function on(event, callback) {
    const listeners = hooks.get(event) || new Set();
    listeners.add(callback); hooks.set(event, listeners);
    return () => listeners.delete(callback);
  }
  function emit(event, ...args) {
    for (const callback of [...(hooks.get(event) || [])]) callback(...args);
  }
  return {on, emit};
});
