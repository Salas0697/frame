/* Original bytes belong to the saved project, not the lifetime of the browser.
 * Existing database/schema retained for backward compatibility. */
const FramePhotoStore = (() => {
  const DB = 'frame-director-db-v2', STORE = 'photos';
  function open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, {keyPath: 'id'});
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Photo storage is busy in another tab'));
    });
  }
  function transaction(db, mode, perform) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error || new Error('Photo storage aborted'));
      tx.onerror = event => reject(event.target.error || tx.error || new Error('Photo storage failed'));
      try { perform(tx.objectStore(STORE)); } catch (error) { tx.abort(); reject(error); }
    });
  }
  async function read(ids) {
    const db = await open(), rows = new Map();
    try {
      await transaction(db, 'readonly', store => {
        for (const id of new Set(ids)) {
          const request = store.get(id);
          request.onsuccess = () => { if (request.result) rows.set(id, request.result); };
        }
      });
      return rows;
    } finally { db.close(); }
  }
  async function prune(keepIds) {
    const db = await open(), keep = new Set(keepIds);
    try {
      // Key cursors never deserialize large, unrelated image buffers.
      await transaction(db, 'readwrite', store => {
        const request = store.openKeyCursor();
        request.onsuccess = () => {
          const cursor = request.result;
          if (!cursor) return;
          if (!keep.has(cursor.primaryKey)) store.delete(cursor.primaryKey);
          cursor.continue();
        };
      });
    } finally { db.close(); }
  }
  async function clear() {
    const db = await open();
    try { await transaction(db, 'readwrite', store => store.clear()); }
    finally { db.close(); }
  }
  async function put(files, photos) {
    if (files.length !== photos.length) throw new Error('File/photo count mismatch');
    const db = await open();
    try {
      // Materialize sequentially: WebKit rejects some picker-backed Files in IDB.
      for (let i = 0; i < files.length; i++) {
        const file = files[i], bytes = await file.arrayBuffer();
        await transaction(db, 'readwrite', store => store.put({id: photos[i].id, name: file.name, type: file.type, bytes}));
      }
    } finally { db.close(); }
  }
  async function originals(photos) {
    const rows = await read(photos.map(photo => photo.id));
    if (photos.some(photo => !rows.has(photo.id))) throw new Error('Saved originals are missing');
    return photos.map(photo => {
      const row = rows.get(photo.id);
      return new File([row.bytes || row.blob], row.name, {type: row.type || row.blob?.type || ''});
    });
  }
  async function restore(project) {
    const files = await originals(project.photos), urls = [];
    try {
      const restored = new Map(project.photos.map((photo, index) => {
        const url = URL.createObjectURL(files[index]); urls.push(url);
        return [photo.id, {...photo, name: files[index].name, url}];
      }));
      project.photos = project.photos.map(photo => restored.get(photo.id));
      project.slides.forEach(slide => slide.layers.forEach(layer => {
        if (layer.type === 'img' && restored.has(layer.photo?.id)) layer.photo = restored.get(layer.photo.id);
      }));
    } catch (error) { urls.forEach(url => URL.revokeObjectURL(url)); throw error; }
  }
  return {put, read, originals, restore, prune, clear};
})();
if (typeof module !== 'undefined' && module.exports) module.exports = FramePhotoStore;
