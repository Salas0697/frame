const FramePhotoAnalysis = (() => {
const clamp01=v=>Math.max(0,Math.min(1,Number(v)||0));
function loadScriptOnce(src){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Face detector load timed out')),8000);const res=()=>{clearTimeout(timer);resolve()};const rej=e=>{clearTimeout(timer);reject(e)};const existing=[...document.scripts].find(s=>s.src===src);if(existing){if(existing.dataset.ready==='1'||window.FaceDetection)return res();existing.addEventListener('load',res,{once:true});existing.addEventListener('error',rej,{once:true});return}const s=document.createElement('script');s.src=src;s.async=true;s.onload=()=>{s.dataset.ready='1';res()};s.onerror=rej;document.head.appendChild(s)})}
function loadPhoto(url){return loadImage(url)}
let detectorPromise=null;
function getFaceDetector(){if(detectorPromise)return detectorPromise;detectorPromise=(async()=>{try{await loadScriptOnce('https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/face_detection.js');if(!window.FaceDetection)return null;const fd=new FaceDetection({locateFile:f=>`https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${f}`});fd.setOptions({model:'short',minDetectionConfidence:.52});let pending=null;fd.onResults(r=>{if(pending){const fn=pending;pending=null;fn(r)}});fd.__frameSend=image=>new Promise(resolve=>{const timer=setTimeout(()=>{pending=null;resolve(null)},2800);pending=r=>{clearTimeout(timer);resolve(r)};Promise.resolve(fd.send({image})).catch(()=>{clearTimeout(timer);pending=null;resolve(null)})});return fd}catch(e){console.warn('face detector unavailable',e);return null}})();return detectorPromise}
function boxFromDetection(d){const b=d?.locationData?.relativeBoundingBox||d?.relativeBoundingBox||null;if(!b)return null;const x=clamp01(b.xMin??b.x??0),y=clamp01(b.yMin??b.y??0),w=clamp01(b.width??0),h=clamp01(b.height??0);if(w<.02||h<.02)return null;return{x,y,w:Math.min(w,1-x),h:Math.min(h,1-y),score:Number(d?.score?.[0]??d?.score??0)}}
function unionFaces(faces){if(!faces.length)return null;const x1=Math.min(...faces.map(f=>f.x)),y1=Math.min(...faces.map(f=>f.y)),x2=Math.max(...faces.map(f=>f.x+f.w)),y2=Math.max(...faces.map(f=>f.y+f.h));return{x:x1,y:y1,w:x2-x1,h:y2-y1,cx:(x1+x2)/2,cy:(y1+y2)/2}}
async function enrichComposition(p){try{const im=await loadPhoto(p.url);p.width=im.naturalWidth||im.width;p.height=im.naturalHeight||im.height;if(p.width&&p.height)p.aspect=p.width/p.height;const max=512,scale=Math.min(1,max/Math.max(p.width||1,p.height||1)),cv=document.createElement('canvas');cv.width=Math.max(1,Math.round((p.width||1)*scale));cv.height=Math.max(1,Math.round((p.height||1)*scale));cv.getContext('2d',{willReadFrequently:false}).drawImage(im,0,0,cv.width,cv.height);const fd=await getFaceDetector();let faces=[];if(fd?.__frameSend){const r=await fd.__frameSend(cv);faces=(r?.detections||[]).map(boxFromDetection).filter(Boolean).filter(f=>f.score===0||f.score>=.45)}p.faces=faces;p.faceCount=faces.length;p.faceUnion=unionFaces(faces);p.faceCenter=p.faceUnion?{x:p.faceUnion.cx,y:p.faceUnion.cy}:null;p.hasFaces=faces.length>0;return p}catch(e){console.warn('composition analysis',p?.name,e);p.faces=p.faces||[];p.faceCount=p.faces.length;p.faceUnion=unionFaces(p.faces);return p}}

async function analyzePhotos(files, progress, brief) {
  const photos = new Array(files.length), urls = [];
  let next = 0, done = 0, failure = null;
  async function worker() {
    while (next < files.length && !failure) {
      const i = next++, file = files[i];
      try {
        const url = URL.createObjectURL(file); urls.push(url);
        photos[i] = await analyzePhoto({id:uid(), name:file.name, url,
          sourceSize:file.size, sourceType:file.type, sourceLastModified:file.lastModified});
      } catch (error) { failure = error; }
      progress(`Analizando tus fotos… ${++done}/${files.length}`);
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  try {
    await Promise.all(Array.from({length:Math.min(3,files.length)}, worker));
    if (failure) throw failure;
    if(brief?.location==='yes'&&!FramePhotoLocation.clean(brief.locationText))await FramePhotoLocation.enrich(files,photos,progress,window.exifr);
    for (let i = 0; i < photos.length; i++) {
      progress(`Leyendo composición… ${i+1}/${photos.length}`);
      await enrichComposition(photos[i]);
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    return photos;
  } catch (error) {
    urls.forEach(url => URL.revokeObjectURL(url));
    throw error;
  }
}
return {analyzePhotos};
})();
