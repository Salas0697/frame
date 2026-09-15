const {test,expect}=require('@playwright/test'),fs=require('node:fs/promises'),path=require('node:path'),{png}=require('../support/color-fixture.cjs');
const dir=path.resolve('test-results/color-fixtures'),measured=['#dc141e','#14a03c','#2346be','#e6bd28'];
test.beforeAll(async()=>{await fs.mkdir(dir,{recursive:true});for(let i=0;i<8;i++)await fs.writeFile(path.join(dir,'color-'+i+'.png'),i%2?png([35,70,190],[230,189,40]):png([220,20,30],[20,160,60]))});
async function prepare(page){
 await page.goto('/');const wait=page.waitForEvent('filechooser');await page.locator('#photosInput').click();await (await wait).setFiles(Array.from({length:8},(_,i)=>path.join(dir,'color-'+i+'.png')));
 await expect(page.locator('#frameBrief')).toBeVisible();expect(await page.locator('#backgroundSwatches button').count()).toBe(0);
 await page.getByRole('button',{name:'Guardar el momento',exact:true}).click();await page.getByRole('button',{name:'Diseñar ✦',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('data-photo-import-phase','idle',{timeout:100000});
 await page.locator('#templateFamily').selectOption('gallery_book');await page.getByText('Fondo y marco',{exact:true}).click();
}
test('measured swatches support page/all scope, undo, variation, PNG and restore without changing crops',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await prepare(page);
 const swatches=await page.locator('#backgroundSwatches button').evaluateAll(els=>els.map(e=>e.dataset.color));expect(swatches.length).toBeGreaterThan(1);expect(swatches.every(c=>measured.includes(c))).toBeTruthy();
 const before=await page.evaluate(()=>({bg:S.slides.map(s=>s.bg),geometry:S.slides.map(s=>s.layers.filter(l=>l.type==='img').map(l=>[l.id,l.x,l.y,l.w,l.h,l.offX,l.offY]))}));
 const local=swatches.find(c=>c!==before.bg[0]);await page.locator('[data-color="'+local+'"]').click();
 const after=await page.evaluate(()=>S.slides.map(s=>s.bg));expect(after[0]).toBe(local);expect(after.slice(1)).toEqual(before.bg.slice(1));
 expect(await page.evaluate(()=>S.slides.map(s=>s.layers.filter(l=>l.type==='img').map(l=>[l.id,l.x,l.y,l.w,l.h,l.offX,l.offY])))).toEqual(before.geometry);
 await page.locator('#backgroundScope').selectOption('all');await expect(page.locator('#backgroundSource')).toContainText('todo el carrusel');
 const choices=await page.locator('#backgroundSwatches button').evaluateAll(els=>els.map(e=>e.dataset.color));expect(choices).toHaveLength(4);const global=choices.find(c=>c!==local);
 await page.locator('[data-color="'+global+'"]').click();expect(await page.evaluate(()=>S.slides.every(s=>s.bg===S.frameBackgroundColor))).toBeTruthy();
 await page.locator('#undoBtn').click();expect(await page.evaluate(()=>S.slides.map(s=>s.bg))).toEqual(after);
 await page.locator('[data-color="'+global+'"]').click();await page.locator('#fastNewDesign').click();await expect(page.locator('.quickbar')).not.toHaveClass(/busy/);expect(await page.evaluate(()=>S.slides.every(s=>s.bg===S.frameBackgroundColor))).toBeTruthy();
 const pixel=await page.evaluate(async()=>{const f=await renderSlideToFile(0),im=await createImageBitmap(f),cv=document.createElement('canvas');cv.width=1080;cv.height=1350;const ctx=cv.getContext('2d');ctx.drawImage(im,0,0);return Array.from(ctx.getImageData(2,2,1,1).data)});expect(pixel.slice(0,3)).toEqual(global.slice(1).match(/../g).map(v=>parseInt(v,16)));
 await page.locator('#backgroundScope').selectOption('page');const local2=(await page.locator('#backgroundSwatches button').evaluateAll(els=>els.map(e=>e.dataset.color))).find(c=>c!==global);await page.locator('[data-color="'+local2+'"]').click();await page.locator('#fastNewDesign').click();await expect(page.locator('.quickbar')).not.toHaveClass(/busy/);expect(await page.evaluate(()=>S.slides[0].bg)).toBe(local2);expect(await page.evaluate(()=>S.slides.slice(1).every(s=>s.bg===S.frameBackgroundColor))).toBeTruthy();
 await page.screenshot({path:'test-results/photo-backgrounds-'+test.info().project.name+'.png'});
 await page.reload();await page.locator('#resumeBtn').click();await expect(page.locator('#studioScreen')).toHaveClass(/on/);expect(await page.evaluate(()=>S.slides[0].bg)).toBe(local2);expect(await page.evaluate(()=>S.frameBackgroundColor)).toBe(global);expect(errors).toEqual([]);
});
test('legacy saved projects recover measured colors from their originals and suggestions follow the current page',async({page})=>{
 await prepare(page);
 await page.evaluate(()=>{for(const key of Object.keys(localStorage)){let p;try{p=JSON.parse(localStorage.getItem(key))}catch{}if(!p?.photos?.length||!p.slides)continue;for(const photo of p.photos)delete photo.dominantColors;for(const sl of p.slides)for(const l of sl.layers)if(l.photo)delete l.photo.dominantColors;localStorage.setItem(key,JSON.stringify(p))}});
 await page.reload();await page.locator('#resumeBtn').click();await expect(page.locator('#studioScreen')).toHaveClass(/on/);expect(await page.evaluate(()=>S.photos.every(p=>p.dominantColors.length>=2))).toBeTruthy();
 await page.getByText('Fondo y marco',{exact:true}).click();const first=await page.locator('#backgroundSwatches button').evaluateAll(els=>els.map(e=>e.dataset.color));
 const index=await page.evaluate(first=>S.slides.findIndex(sl=>!first.includes(sl.layers.find(l=>l.type==='img').photo.dominantColors[0].hex)),first);
 expect(index).toBeGreaterThan(0);await page.locator('#filmstrip .thumb').nth(index).click();await expect(page.locator('#backgroundSource')).toContainText('página '+(index+1));
 const next=await page.locator('#backgroundSwatches button').evaluateAll(els=>els.map(e=>e.dataset.color));expect(next).not.toEqual(first);
});
