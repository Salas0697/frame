const {test,expect}=require('@playwright/test'),{png}=require('../support/color-fixture.cjs');
async function start(page,count=8){
 await page.route('**/face_detection.js',r=>r.fulfill({contentType:'text/javascript',body:'window.FaceDetection=class{setOptions(){}onResults(fn){this.fn=fn}async send(){this.fn({detections:[]})}}'}));
 await page.goto('/');await page.locator('#photosInput').setInputFiles(Array.from({length:count},(_,i)=>({name:'photo-'+i+'.png',mimeType:'image/png',buffer:png([180-i*12,80,50],[20,100+i*10,180])})));
 await expect(page.locator('#journeyCreate')).toBeEnabled();await page.locator('#journeyCreate').click();await expect(page.locator('html')).toHaveAttribute('data-photo-import-phase','idle');
}
async function design(page,id,value){await page.locator('#premiumDesignBtn').click();await page.locator(id).selectOption(value);await page.locator('#closePremiumDesign').click()}
for(const size of [{width:390,height:844},{width:375,height:667}])test('focused canvas, format export, navigation and preview at '+size.width+'x'+size.height,async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize(size);await start(page);
 for(const [format,H] of [['4:5',1350],['1:1',1080],['9:16',1920]]){
  await design(page,'#frameFormat',format);const box=await page.locator('#stage .slide').first().boundingBox(),v=await page.locator('#premiumViewport').boundingBox();expect(box.x+box.width/2).toBeCloseTo(size.width/2,0);expect(box.y).toBeGreaterThanOrEqual(v.y);expect(box.y+box.height).toBeLessThanOrEqual(v.y+v.height+1);expect(box.height).toBeGreaterThan(format==='9:16'?size.height*.48:200);
  const pixels=await page.evaluate(async()=>{const f=await renderSlideToFile(0),im=await createImageBitmap(f);return [im.width,im.height]});expect(pixels).toEqual([1080,H]);
 }
 await page.locator('#pageForward').click();expect(await page.evaluate(()=>S.currentSlide)).toBe(1);await page.locator('#premiumMobilePreview').click();await expect(page.locator('#premiumPreview')).toBeVisible();await expect(page.locator('.premiumPreviewPage')).toHaveCount(await page.evaluate(()=>S.slides.length));await page.locator('#closePremiumPreview').press('Escape');await expect(page.locator('#premiumMobilePreview')).not.toBeHidden();expect(await page.evaluate(()=>S.currentSlide)).toBe(1);
 await page.screenshot({path:'test-results/premium-studio-'+size.width+'-'+test.info().project.name+'.png'});expect(errors).toEqual([]);
});
test('spacing and borders preserve crop, undo, PNG and restore',async({page})=>{
 await start(page);const original=await page.evaluate(()=>FrameProjectState.snapshot(S));await page.locator('#premiumDesignBtn').click();await page.locator('#premiumDesignScope').selectOption('all');await page.locator('#premiumSpacing').selectOption('airy');await page.locator('#premiumBorder').selectOption('bold');await page.locator('#closePremiumDesign').click();
 expect(await page.evaluate(()=>S.slides.every(sl=>sl.layers.filter(l=>l.type==='img').every(l=>l.frameBorder===2)))).toBe(true);
 const changed=await page.evaluate(()=>FrameProjectState.snapshot(S));changed.slides.forEach((sl,i)=>sl.layers.filter(l=>l.type==='img').forEach(l=>{const old=original.slides[i].layers.find(o=>o.id===l.id);expect(l.w/l.h).toBeCloseTo(old.w/old.h,6);expect([l.offX,l.offY,l.zoom]).toEqual([old.offX,old.offY,old.zoom])}));
 await page.locator('#undoBtn').click();expect(await page.evaluate(()=>S.slides.every(sl=>sl.layers.filter(l=>l.type==='img').every(l=>!l.frameBorder)))).toBe(true);await page.locator('#redoBtn').click();
 await page.locator('#fastNewDesign').click();await expect(page.locator('html')).toHaveAttribute('data-project-busy','false');expect(await page.evaluate(()=>S.slides.every(sl=>sl.layers.filter(l=>l.type==='img').every(l=>l.frameBorder===2)))).toBe(true);
 await page.reload();await page.locator('#resumeBtn').click();await expect(page.locator('#studioScreen')).toHaveClass(/on/);expect(await page.evaluate(()=>S.frameDesign)).toEqual({spacing:'airy',border:'bold'});expect(await page.evaluate(async()=> (await renderSlideToFile(0)).size)).toBeGreaterThan(1000);
});
test('contextual swap preserves frames and all original sources, respects fixed photos and undo',async({page})=>{
 await start(page,8);await design(page,'#templateFamily','editorial_pair');const index=await page.evaluate(()=>S.slides.findIndex(sl=>sl.layers.filter(l=>l.type==='img').length>=2));expect(index).toBeGreaterThanOrEqual(0);await page.locator('#pageJump').selectOption(String(index));await page.locator('.slide[data-slide="'+index+'"] .imgLayer').first().tap();
 await expect(page.locator('#premiumSwap')).toBeEnabled();const before=await page.evaluate(()=>selectedSlide().layers.filter(l=>l.type==='img').map(l=>({id:l.id,photo:l.photo.id,frame:[l.x,l.y,l.w,l.h]})));
 await page.locator('#premiumSwap').click();await page.locator('#premiumSwapPhotos button').first().click();const after=await page.evaluate(()=>selectedSlide().layers.filter(l=>l.type==='img').map(l=>({id:l.id,photo:l.photo.id,frame:[l.x,l.y,l.w,l.h]})));expect(after.map(l=>l.frame)).toEqual(before.map(l=>l.frame));expect(after.map(l=>l.photo).sort()).toEqual(before.map(l=>l.photo).sort());expect(after.map(l=>l.photo)).not.toEqual(before.map(l=>l.photo));
 await page.locator('#undoBtn').click();expect(await page.evaluate(()=>selectedSlide().layers.filter(l=>l.type==='img').map(l=>l.photo.id))).toEqual(before.map(l=>l.photo));await page.locator('.slide[data-slide="'+index+'"] .imgLayer').first().tap();await page.locator('#premiumPinPhoto').click();await expect(page.locator('#premiumSwap')).toBeDisabled();await page.locator('#premiumSelectionDone').click();await expect(page.locator('#premiumTouchHint')).toBeVisible();
});
test('curated library shows actual full sequence, supports filtering and dismisses without changes',async({page})=>{
 await start(page,12);const before=await page.evaluate(()=>FrameProjectState.snapshot(S));await page.locator('#browseCollections').click();await expect(page.locator('#journeyCreate')).toBeEnabled();expect(await page.locator('.journeyTemplate').count()).toBe(8);await page.locator('#journeyFormat').selectOption('9:16');await page.locator('#journeyPreview').click();expect(await page.locator('#largePreviewPages .journeyPage').count()).toBeGreaterThanOrEqual(3);await page.locator('#closeLargePreview').click();await page.locator('#journeyCancel').press('Escape');expect(await page.evaluate(()=>FrameProjectState.snapshot(S))).toEqual(before);
});
