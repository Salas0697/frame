const {designSelect,editorClick,closeDesign,openDesign}=require('../support/editor.cjs');
const {test,expect}=require('@playwright/test');
const {png}=require('../support/color-fixture.cjs');

async function detector(page,unavailable=false){
 await page.route('**/face_detection.js',route=>unavailable?route.abort():route.fulfill({contentType:'text/javascript',body:`window.FaceDetection=class{setOptions(){}onResults(fn){this.fn=fn}async send(){this.fn({detections:window.testDetections||[]})}close(){}}`}));
}
async function importPhotos(page,append=false,count=8){
 const picker=page.waitForEvent('filechooser');await page.locator(append?'#fastAdd':'#photosInput').click();
 await (await picker).setFiles(Array.from({length:count},(_,i)=>({name:'fixture-'+i+'.png',mimeType:'image/png',buffer:png([220,40,50],[30,150,200])})));
 await expect(page.locator('#journeyCreate')).toBeEnabled();await page.locator('#journeyCreate').click();
 await expect(page.locator('html')).toHaveAttribute('data-photo-import-phase','idle',{timeout:100000});
}

test('share denial offers a working prepared-file download; cancelling does not offer recovery',async({page})=>{
 await detector(page);await page.goto('/');await importPhotos(page);
 await page.evaluate(()=>{Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});Object.defineProperty(navigator,'share',{configurable:true,value:async()=>{throw new DOMException('denied','NotAllowedError')}})});
 await page.locator('#fastExport').click();await page.locator('#exportCurrentBtn').click();await expect(page.locator('#exportRecovery')).toBeVisible();
 const pending=page.waitForEvent('download');await page.locator('#downloadPreparedBtn').click();const downloaded=await pending;expect(downloaded.suggestedFilename()).toBe('FRAME_01.png');await expect(page.locator('#exportRecovery')).toBeHidden();
 await page.evaluate(()=>Object.defineProperty(navigator,'share',{configurable:true,value:async()=>{throw new DOMException('cancel','AbortError')}}));
 await page.locator('#fastExport').click();await page.locator('#exportCurrentBtn').click();await expect(page.locator('#loading')).toBeHidden();await expect(page.locator('#exportRecovery')).toBeHidden();
});

test('failed original storage preserves the saved project; export remains available and reset clears the database',async({page})=>{
 await detector(page);await page.goto('/');await importPhotos(page);
 const saved=await page.evaluate(()=>localStorage.getItem(SAVE_KEY));
 await page.evaluate(()=>{FramePhotoStore.put=async()=>{throw new DOMException('quota','QuotaExceededError')}});
 await importPhotos(page,true,2);await expect(page.locator('#storageNotice')).toBeVisible();expect(await page.evaluate(()=>S.photos.length)).toBe(10);
 await editorClick(page,'#fastNewDesign');await expect(page.locator('.quickbar')).not.toHaveClass(/busy/);expect(await page.evaluate(()=>localStorage.getItem(SAVE_KEY))).toBe(saved);
 expect(await page.evaluate(async()=> (await renderSlideToFile(0)).size)).toBeGreaterThan(1000);
 await page.reload();await page.locator('#resumeBtn').click();await expect(page.locator('#studioScreen')).toHaveClass(/on/);expect(await page.evaluate(()=>S.photos.length)).toBe(8);
 const ids=await page.evaluate(()=>S.photos.map(p=>p.id));page.once('dialog',d=>d.accept());await editorClick(page,'#newBtn');await expect(page.locator('#uploadScreen')).toHaveClass(/on/);await expect(page.locator('#resumeBtn')).toBeHidden();
 expect(await page.evaluate(async ids=>(await FramePhotoStore.read(ids)).size,ids)).toBe(0);
});

test('undo and redo restore one coherent brief and design',async({page})=>{
 await detector(page);await page.goto('/');await importPhotos(page);
 await designSelect(page,'#templateFamily','collector');
 const original=await page.evaluate(()=>FrameProjectState.snapshot(S));
 await editorClick(page,'#fastNewDesign');await expect(page.locator('#undoBtn')).toBeEnabled();await expect(page.locator('.quickbar')).not.toHaveClass(/busy/);
 const changed=await page.evaluate(()=>FrameProjectState.snapshot(S));
 await editorClick(page,'#undoBtn');expect(await page.evaluate(()=>FrameProjectState.snapshot(S))).toEqual(original);
 await editorClick(page,'#redoBtn');expect(await page.evaluate(()=>FrameProjectState.snapshot(S))).toEqual(changed);
 await page.locator('#browseCollections').click();await page.locator('#journeyMore').click();await page.locator('[data-family=full_bleed]').click();await page.locator('#journeyCreate').click();
 expect(await page.evaluate(()=>S.frameBrief.familyId)).toBe('full_bleed');await editorClick(page,'#undoBtn');expect(await page.evaluate(()=>S.frameBrief)).toEqual(changed.frameBrief);
});

test('metadata quota and reset failures retain the previous saved project and announce the failure',async({page})=>{
 await detector(page);await page.goto('/');await importPhotos(page);
 const saved=await page.evaluate(()=>localStorage.getItem(SAVE_KEY));
 await page.evaluate(()=>{const original=Storage.prototype.setItem;window.restoreStorage=()=>Storage.prototype.setItem=original;Storage.prototype.setItem=function(k,v){if(k===SAVE_KEY)throw new DOMException('quota','QuotaExceededError');return original.call(this,k,v)}});
 await editorClick(page,'#fastNewDesign');await expect(page.locator('#storageNotice')).toBeVisible();expect(await page.evaluate(()=>localStorage.getItem(SAVE_KEY))).toBe(saved);
 await page.evaluate(()=>window.restoreStorage());await page.reload();await page.locator('#resumeBtn').click();await expect(page.locator('#studioScreen')).toHaveClass(/on/);
 await page.evaluate(()=>{FramePhotoStore.clear=async()=>{throw Error('storage locked')}});page.once('dialog',d=>d.accept());await editorClick(page,'#newBtn');
 await expect(page.locator('#toast')).toContainText('No pude eliminar');expect(await page.evaluate(()=>JSON.parse(localStorage.getItem(SAVE_KEY)).photos.length)).toBe(8);await expect(page.locator('#studioScreen')).toHaveClass(/on/);
});

test('real JavaScript detector boxes are consumed; unavailable detection keeps whole photos and keyboard editing works',async({page})=>{
 await detector(page);await page.addInitScript(()=>window.testDetections=[{boundingBox:{xCenter:.7,yCenter:.4,width:.3,height:.25},score:[.95]}]);
 await page.goto('/');await importPhotos(page, false, 2);expect(await page.evaluate(()=>S.photos.every(p=>p.faceCount===1&&Math.abs(p.faces[0].x-.55)<.001))).toBe(true);
 const photo=page.locator('#stage .imgLayer').first();await photo.focus();await photo.press('Enter');await expect(page.locator('#photoEditV2')).toBeVisible();await page.locator('#peCancel').press('Escape');await expect(page.locator('#photoEditV2')).toBeHidden();
 await page.unroute('**/face_detection.js');await detector(page,true);await page.reload();await importPhotos(page);
 await openDesign(page);await expect(page.locator('#analysisNotice')).toBeVisible();await closeDesign(page);
 await designSelect(page,'#templateFamily','cut_diagonal');
 expect(await page.evaluate(()=>S.slides.flatMap(s=>s.layers.filter(l=>l.type==='img')).every(l=>!l.frameCut&&Math.abs(l.w/l.h-l.photo.aspect)<.0001))).toBe(true);
});

test('preview and PNG finishes agree on background, photo and paper; text respects layer order',async({page})=>{
 await detector(page);await page.goto('/');await importPhotos(page, false, 2);
 await page.evaluate(()=>{const photo=S.photos[0];S.frameLocation=null;S.slides=[{id:'parity',bg:'#1464aa',palette:[[20,100,170]],layers:[{id:'photo',type:'img',photo,x:30,y:40,w:120,h:160,rot:0,z:1,zoom:1,offX:0,offY:0},{id:'text',type:'text',text:'MMMMMMMM',x:190,y:210,w:130,size:24,color:'#ff0000',font:'sans',weight:700,rot:0,z:2},{id:'paper',type:'deco',x:180,y:190,w:140,h:120,color:'#daa870',rot:0,z:3,kind:'rect'}]}];S.currentSlide=0;renderAll()});
 for(const finish of ['clean','film','soft','mono','punchy']){
  await page.evaluate(f=>{S.finish=f;renderAll()},finish);await expect(page.locator('#stage .imgLayer')).toBeVisible();
  const slide=page.locator('#stage .slide'),box=await slide.boundingBox(),shot=await slide.screenshot();
  const result=await page.evaluate(async({bytes,width,height})=>{
   const screenshot=await createImageBitmap(new Blob([new Uint8Array(bytes)],{type:'image/png'})),file=await renderSlideToFile(0),exported=await createImageBitmap(file);
   const cv=document.createElement('canvas'),ctx=cv.getContext('2d');
   function sample(bitmap,w,h){cv.width=w;cv.height=h;ctx.drawImage(bitmap,0,0);return [[10,100],[80,100],[250,250]].map(([x,y])=>[...ctx.getImageData(Math.round(x*w/340),Math.round(y*h/425),1,1).data].slice(0,3))}
   const preview=sample(screenshot,screenshot.width,screenshot.height),png=sample(exported,1080,1350);screenshot.close();exported.close();cv.width=cv.height=0;return {preview,png};
  },{bytes:[...shot],width:box.width,height:box.height});
  for(let i=0;i<3;i++)for(let c=0;c<3;c++)expect(Math.abs(result.preview[i][c]-result.png[i][c]),finish+' region '+i+' channel '+c).toBeLessThanOrEqual(3);
 }
 await page.screenshot({path:'test-results/architecture-parity-'+test.info().project.name+'.png'});
});
