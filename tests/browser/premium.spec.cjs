const {test,expect}=require('@playwright/test');
const fs=require('node:fs/promises'),path=require('node:path');
const ids=[10,20,24,28,29,42,43,47,48,49,50,54],dir=path.resolve('test-results/fixtures');
test.beforeAll(async()=>{
 await fs.mkdir(dir,{recursive:true});
 for(const id of ids){
  const file=path.join(dir,'photo-'+id+'.jpg');try{await fs.access(file);continue}catch{}
  const response=await fetch('https://picsum.photos/id/'+id+'/900/1200',{signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw Error('Real image fixture download failed: '+id);
  const bytes=Buffer.from(await response.arrayBuffer());if(bytes[0]!==255||bytes[1]!==216)throw Error('Fixture is not JPEG');
  await fs.writeFile(file,bytes);
 }
});
async function upload(page,n){
 const chooserPromise=page.waitForEvent('filechooser');
 await page.locator('#photosInput').click();const chooser=await chooserPromise;
 await chooser.setFiles(ids.slice(0,n).map(id=>path.join(dir,'photo-'+id+'.jpg')));
 await expect(page.locator('#frameBrief')).toBeVisible();
 await expect(page.locator('.frameBriefEyebrow')).toHaveText(n+' fotos seleccionadas');
 await expect(page.locator('html')).toHaveAttribute('data-photo-import-phase','brief');
 await expect(page.locator('#loading')).toBeHidden();
 await page.getByRole('button',{name:'Mostrar muchas fotos',exact:true}).click();
 await page.getByRole('button',{name:'Editorial / limpio',exact:true}).click();
 await page.getByRole('button',{name:'Diseñar ✦',exact:true}).click();
 await expect(page.locator('#studioScreen')).toHaveClass(/on/);
 await expect(page.locator('html')).toHaveAttribute('data-photo-import-phase','idle',{timeout:100000});
 const names=await page.locator('#stage .imgLayer').evaluateAll(els=>els.map(e=>e.alt).sort());
 expect([...new Set(names)]).toEqual(ids.slice(0,n).map(id=>'photo-'+id+'.jpg').sort());
 expect(await page.locator('#stage .imgLayer').evaluateAll(els=>els.every(e=>e.complete&&e.naturalWidth===900))).toBeTruthy();
}
for(const n of [8,10,12])test('real photo import '+n+' waits for brief and variations reuse analysis',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.importPhases=[];document.addEventListener('frame:import-phase',e=>window.importPhases.push(e.detail.phase))});
 await page.goto('/');await upload(page,n);
 const phases=await page.evaluate(()=>window.importPhases);
 expect(phases).toContain('analysis');expect(phases.indexOf('brief')).toBeLessThan(phases.indexOf('analysis'));
 const before=await page.locator('#stage .slide').first().getAttribute('data-layout');
 await page.locator('#fastNewDesign').click();await expect(page.locator('#frameBrief')).toBeHidden();
 expect(await page.evaluate(()=>window.importPhases)).toEqual(phases);
 await expect(page.locator('#stats')).toContainText(n+' fotos');
 expect(errors).toEqual([]);
 await page.screenshot({path:'test-results/album-'+n+'-'+test.info().project.name+'.png'});
});
test('finishes, fixed page, crop transaction, cover, full miniatures and PNG export',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await upload(page,12);await page.locator('#templateFamily').selectOption('museum_notes');
 await expect(page.locator('#stage .slide[data-layout="museum_9"] .imgLayer')).toHaveCount(9);
 await page.getByText('Fondo y marco',{exact:true}).click();
 await page.locator('#frameBackground').selectOption('black');
 await page.locator('#frameTreatment').selectOption('fine');
 expect(await page.locator('#stage .slide').first().evaluate(e=>getComputedStyle(e).backgroundColor)).toBe('rgb(16, 16, 18)');
 const grid=page.locator('#stage .slide[data-layout="museum_9"]');
 await grid.locator('.pagePin').click();
 const frozen=await grid.locator('.imgLayer').evaluateAll(els=>els.map(e=>[e.alt,e.getAttribute('style')]));
 await page.locator('#fastNewDesign').click();
 expect(await grid.locator('.imgLayer').evaluateAll(els=>els.map(e=>[e.alt,e.getAttribute('style')]))).toEqual(frozen);
 expect(await page.locator('#filmstrip .miniPhoto').count()).toBe(12);
 await grid.locator('.imgLayer').first().click();await page.locator('#uxEdit').click();
 await expect(page.locator('#peHero')).toBeDisabled();await expect(page.locator('#peHero')).toHaveText('Libera esta página para usarla como portada');
 await page.locator('#peCancel').click();
 // Crop a photo from the first, unlocked page.
 const photo=page.locator('#stage .slide').first().locator('.imgLayer').first();
 await photo.click();await page.locator('#uxEdit').click();
 await expect(page.locator('#photoEditV2')).toBeVisible();
 const original=await photo.getAttribute('style'),clip=await photo.locator('..').boundingBox(),frame=await page.locator('#peFrame').boundingBox();
 expect(frame.width/frame.height).toBeCloseTo(clip.width/clip.height,2);
 await page.locator('#peZoom').focus();await page.locator('#peZoom').press('End');
 const oldLeft=await page.locator('#peImg').evaluate(e=>parseFloat(e.style.left));
 const f=await page.locator('#peFrame').boundingBox();
 await page.mouse.move(f.x+f.width/2,f.y+f.height/2);await page.mouse.down();await page.mouse.move(f.x+f.width/2+20,f.y+f.height/2,{steps:5});await page.mouse.up();
 expect(await page.locator('#peImg').evaluate(e=>parseFloat(e.style.left))).toBeGreaterThan(oldLeft);
 await page.locator('#peCancel').click();expect(await photo.getAttribute('style')).toBe(original);
 await photo.click();await page.locator('#uxEdit').click();await page.locator('#peContain').click();await page.locator('#peDone').click();
 const geometry=await photo.evaluate(e=>({iw:parseFloat(e.style.width),ih:parseFloat(e.style.height),w:parseFloat(e.parentElement.style.width),h:parseFloat(e.parentElement.style.height)}));
 expect(geometry.iw).toBeLessThanOrEqual(geometry.w+.1);expect(geometry.ih).toBeLessThanOrEqual(geometry.h+.1);
 // Pin cover; another option must retain that selected source as the opening photo.
 const name=await photo.getAttribute('alt');await photo.click();await page.locator('#uxEdit').click();await page.locator('#peHero').click();
 await page.locator('#fastNewDesign').click();await expect(page.locator('#stage .slide').first().locator('.imgLayer').first()).toHaveAttribute('alt',name);
 const png=await page.evaluate(async()=>{const file=await renderSlideToFile(0);const image=await createImageBitmap(file);return {w:image.width,h:image.height,size:file.size,type:file.type}});
 expect(png.w).toBe(1080);expect(png.h).toBe(1350);expect(png.size).toBeGreaterThan(1000);expect(png.type).toBe('image/png');
 expect(errors).toEqual([]);
 await page.screenshot({path:'test-results/premium-'+test.info().project.name+'.png'});
});
