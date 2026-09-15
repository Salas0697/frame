/* IndexedDB stores original Files by the exact id assigned during analysis. */
const FramePhotoStore = (() => {
  const DB = 'frame-director-db-v2', STORE = 'photos';
  function open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE)) {
          request.result.createObjectStore(STORE, {keyPath: 'id'});
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function put(files, photos) {
    if (files.length !== photos.length) throw new Error('File/photo count mismatch');
    const db = await open();
    try {
      // Materialize one original at a time before opening its transaction.
      // WebKit can reject picker-backed Files during IndexedDB serialization.
      for(let i=0;i<files.length;i++) {
        const file=files[i], bytes=await file.arrayBuffer();
        await new Promise((resolve,reject)=>{
          const tx=db.transaction(STORE,'readwrite');
          tx.oncomplete=resolve;
          tx.onabort=()=>reject(tx.error||new Error('Photo storage aborted'));
          tx.onerror=e=>reject(e.target.error||tx.error||new Error('Photo storage failed'));
          tx.objectStore(STORE).put({id:photos[i].id,name:file.name,type:file.type,bytes});
        });
      }
    } finally { db.close(); }
  }
  async function restore(project) {
    const db = await open();
    let rows;
    try {
      rows = await new Promise((resolve, reject) => {
        const request = db.transaction(STORE).objectStore(STORE).getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } finally { db.close(); }
    const stored = new Map(rows.map(row => [row.id, row]));
    // Validate before changing any URLs or rendering a partially restored project.
    if (project.photos.some(photo => !stored.has(photo.id))) {
      throw new Error('Saved originals are missing');
    }
    const restored = new Map(project.photos.map(photo => {
      const row = stored.get(photo.id);
      return [photo.id, {...photo, name: row.name, url: URL.createObjectURL(row.bytes ? new Blob([row.bytes],{type:row.type}) : row.blob)}];
    }));
    project.photos = project.photos.map(photo => restored.get(photo.id));
    project.slides.forEach(slide => slide.layers.forEach(layer => {
      if (layer.type === 'img' && restored.has(layer.photo?.id)) {
        layer.photo = restored.get(layer.photo.id);
      }
    }));
  }
  return {put, restore};
})();
if (typeof module !== 'undefined' && module.exports) module.exports = FramePhotoStore;
