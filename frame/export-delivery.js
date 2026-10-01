/* Delivery errors do not discard already-rendered files. Cancellation is intentional. */
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FrameExportDelivery = api;
})(typeof window !== 'undefined' ? window : globalThis, () => {
  async function deliver(files, {share, download, recover, all, title}) {
    try {
      if (await share(files, title)) return 'shared';
    } catch (error) {
      if (error.name === 'AbortError') return 'cancelled';
      recover(files, all);
      return 'recovery';
    }
    await download(files, all);
    return 'downloaded';
  }
  return {deliver};
});
