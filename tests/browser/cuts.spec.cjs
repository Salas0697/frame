const {test,expect}=require('@playwright/test'),fs=require('node:fs/promises'),path=require('node:path'),{png}=require('../support/color-fixture.cjs');
const families=['torn_atelier','torn_horizon','cut_diagonal','cut_mosaic'];
test('new cut series previews, creates, exports real masks, varies and restores',async({page})=>{
 const dir=path.resolve('test-results/cut-fixtures');await fs.mkdir(dir,{recursive:true});const files=[];for(let i=0;i<8;i++){const file=path.join(dir,i+'.png');await fs.writeFile(file,png([220,40,50],[220,40,50]));files.push(file)}
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');const picker=page.waitForEvent('filechooser');await page.locator('#photosInput').click();await (await picker).setFiles(files);await expect(page.locator('#journeyCreate')).toBeEnabled();
 await page.locator('#journeyCuts').click();await expect(page.locator('.journeyTemplate')).toHaveCount(4);expect(await page.locator('.journeyPage img').first().evaluate(e=>e.style.clipPath)).toContain('polygon');
 await page.locator('[data-family=torn_atelier]').click();await page.locator('#journeyCreate').click();await expect(page.locator('html')).toHaveAttribute('data-photo-import-phase','idle',{timeout:100000});
 await page.getByText('Fondo y marco',{exact:true}).click();await page.locator('#backgroundScope').selectOption('all');await page.locator('#frameBackground').selectOption('black');
 for(const family of families){
  await page.locator('#templateFamily').selectOption(family);
  expect(await page.locator('#stage .photoClip').first().evaluate(e=>e.style.clipPath)).toContain('polygon');
  expect(await page.locator('#filmstrip .miniPhoto').first().evaluate(e=>e.style.clipPath)).toContain('polygon');
  const pixels=await page.evaluate(async()=>{
   const l=S.slides[0].layers.find(l=>l.type==='img'),file=await renderSlideToFile(0),im=await createImageBitmap(file),cv=document.createElement('canvas');cv.width=1080;cv.height=1350;const ctx=cv.getContext('2d');ctx.drawImage(im,0,0);im.close();
   const points=FrameCuts.points(l.frameCut),outside=['diagonal','notch'].includes(l.frameCut.kind)?[.98,.02]:points.filter(p=>p[0]>.1&&p[0]<.9&&p[1]<.03).sort((a,b)=>b[1]-a[1])[0].map((v,i)=>i===1?v*.18:v);
   function pixel(p){const a=l.rot*Math.PI/180,dx=(p[0]-.5)*l.w,dy=(p[1]-.5)*l.h;return [...ctx.getImageData(Math.floor((l.x+l.w/2+dx*Math.cos(a)-dy*Math.sin(a))*1080/340),Math.floor((l.y+l.h/2+dx*Math.sin(a)+dy*Math.cos(a))*1080/340),1,1).data]}
   const result={center:pixel([.5,.5]),outside:pixel(outside)};cv.width=cv.height=0;return result;
  });
  expect(pixels.center.slice(0,3)).toEqual([220,40,50]);expect(pixels.outside.slice(0,3)).not.toEqual([220,40,50]);
  await page.screenshot({path:'test-results/cuts-'+family+'-'+test.info().project.name+'.png'});
  await page.locator('#fastNewDesign').click();await expect(page.locator('.quickbar')).not.toHaveClass(/busy/);expect(await page.evaluate(()=>S.frameTemplateFamily)).toBe(family);expect(await page.evaluate(()=>new Set(S.slides.flatMap(s=>s.layers.filter(l=>l.type==='img').map(l=>l.photo.id))).size)).toBe(8);
 }
 const before=await page.evaluate(()=>S.slides.map(s=>s.layers.map(l=>l.frameCut||null)));await page.reload();await page.locator('#resumeBtn').click();await expect(page.locator('#studioScreen')).toHaveClass(/on/);expect(await page.evaluate(()=>S.slides.map(s=>s.layers.map(l=>l.frameCut||null)))).toEqual(before);expect(errors).toEqual([]);
});
