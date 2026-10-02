const {designSelect,editorClick,closeDesign}=require('../support/editor.cjs');
const {test,expect}=require('@playwright/test'),{png}=require('../support/color-fixture.cjs'),{openTools}=require('../support/editor.cjs');
async function prepare(page){
 await page.route('**/face_detection.js',r=>r.fulfill({contentType:'text/javascript',body:'window.FaceDetection=class{setOptions(){}onResults(fn){this.fn=fn}async send(){this.fn({detections:[]})}}'}));
 await page.goto('/');const pending=page.waitForEvent('filechooser');await page.locator('#photosInput').click();await (await pending).setFiles(Array.from({length:12},(_,i)=>({name:'photo-'+i+'.png',mimeType:'image/png',buffer:png([40+i*15,70,100],[30,100+i*10,160])})));
 await page.locator('#journeyCreate').click();await expect(page.locator('html')).toHaveAttribute('data-photo-import-phase','idle',{timeout:100000});
}
test('mobile photos lead the editor; comparing and closing leave every saved adjustment untouched; choosing is undoable',async({page})=>{
 await prepare(page);await expect(page.locator('#projectStatus')).toHaveText('Guardado');expect(await page.locator('#albumTools').getAttribute('open')).toBeNull();
 // The responsive viewport can replace a slide between resolving its handle and measuring it.
 // Wait for the actual layout condition, retaining the same position requirement.
 await expect.poll(async()=>{const box=await page.locator('#stage .slide').first().boundingBox();return box?.y??Infinity}).toBeLessThan(350);await expect(page.locator('.dock')).toBeHidden();
 const before=await page.evaluate(()=>FrameProjectState.snapshot(S)),saved=await page.evaluate(()=>localStorage.getItem(SAVE_KEY));
 await openTools(page);await page.locator('#compareAlbumBtn').click();await expect(page.locator('#albumCompare')).toBeVisible();await expect(page.locator('.albumProposal')).toHaveCount(4);expect(await page.evaluate(()=>FrameProjectState.snapshot(S))).toEqual(before);expect(await page.evaluate(()=>localStorage.getItem(SAVE_KEY))).toBe(saved);
 await page.getByRole('button',{name:'B · Ritmo',exact:true}).click();await page.locator('#closeComparison').press('Escape');await expect(page.locator('#compareAlbumBtn')).toBeFocused();expect(await page.evaluate(()=>FrameProjectState.snapshot(S))).toEqual(before);
 await openTools(page);await page.locator('#compareAlbumBtn').click();await page.getByRole('button',{name:'C · Calma',exact:true}).click();await page.screenshot({path:'test-results/album-comparison-'+test.info().project.name+'.png'});await page.locator('#applyAlbumProposal').click();expect(await page.evaluate(()=>S.frameNarrative)).toBe('calm');
 expect(await page.evaluate(()=>new Set(S.slides.flatMap(s=>s.layers.filter(l=>l.type==='img').map(l=>l.photo.id))).size)).toBe(12);await editorClick(page,'#undoBtn');expect(await page.evaluate(()=>FrameProjectState.snapshot(S))).toEqual(before);
 await page.screenshot({path:'test-results/album-compact-'+test.info().project.name+'.png'});
});
test('portable copy restores exact originals, editorial settings and photo associations after resetting the device project',async({page})=>{
 await prepare(page);await openTools(page);await page.locator('#albumDirection').selectOption('contrast');
 await page.evaluate(()=>{S.finish='film';S.frameCaption='Mi historia';renderAll()});
 const bytes=await page.evaluate(async()=>{const r=[];for(const p of S.photos)r.push([...new Uint8Array(await (await FramePhotoStore.originals([p]))[0].arrayBuffer())]);return r});
 const pending=page.waitForEvent('download');await page.locator('#backupProjectBtn').click();const file=await pending,path=await file.path();expect(file.suggestedFilename()).toBe('FRAME_proyecto.frame');
 page.once('dialog',d=>d.accept());await editorClick(page,'#newBtn');await expect(page.locator('#uploadScreen')).toHaveClass(/on/);
 const picker=page.waitForEvent('filechooser');await page.locator('#homeOpenProjectBtn').click();await (await picker).setFiles(path);await expect(page.locator('#studioScreen')).toHaveClass(/on/);await expect(page.locator('#projectStatus')).toHaveText('Guardado');
 const restored=await page.evaluate(async()=>{const r=[];for(const p of S.photos)r.push([...new Uint8Array(await (await FramePhotoStore.originals([p]))[0].arrayBuffer())]);return r});expect(restored).toEqual(bytes);
 expect(await page.evaluate(()=>S.finish)).toBe('film');expect(await page.evaluate(()=>S.frameNarrative)).toBe('contrast');expect(await page.evaluate(()=>S.frameCaption)).toBe('Mi historia');expect(await page.evaluate(()=>S.slides.every(s=>s.layers.filter(l=>l.type==='img').every(l=>S.photos.includes(l.photo))))).toBe(true);
 await page.reload();await page.locator('#resumeBtn').click();await expect(page.locator('#studioScreen')).toHaveClass(/on/);expect(await page.evaluate(()=>S.photos.length)).toBe(12);
});
test('failed storage can be retried and invalid project copies leave the current album intact',async({page})=>{
 await prepare(page);await page.evaluate(()=>{window.realPut=FramePhotoStore.put;window.realSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===SAVE_KEY)throw new DOMException('quota','QuotaExceededError');return window.realSetItem.call(this,k,v)}});
 await editorClick(page,'#fastNewDesign');await expect(page.locator('#storageNotice')).toBeVisible();await expect(page.locator('#projectStatus')).toHaveText('Sin guardar');
 await page.evaluate(()=>Storage.prototype.setItem=window.realSetItem);await page.locator('#retrySaveBtn').click();await expect(page.locator('#storageNotice')).toBeHidden();await expect(page.locator('#projectStatus')).toHaveText('Guardado');
 const before=await page.evaluate(()=>FrameProjectState.snapshot(S));await openTools(page);const picker=page.waitForEvent('filechooser');await page.locator('#openProjectBtn').click();await (await picker).setFiles({name:'bad.frame',mimeType:'application/octet-stream',buffer:Buffer.from('broken')});await expect(page.locator('#toast')).toContainText('No pude abrir');expect(await page.evaluate(()=>FrameProjectState.snapshot(S))).toEqual(before);
});
