const {test,expect}=require('@playwright/test');
const path=require('node:path'),fs=require('node:fs/promises');
const dir=path.resolve('test-results/journey-fixtures'),ids=[10,20,24,28,29,42,43,47];
test.beforeAll(async()=>{await fs.mkdir(dir,{recursive:true});for(const id of ids){const r=await fetch('https://picsum.photos/id/'+id+'/900/1200');if(!r.ok)throw Error('Fixture unavailable');await fs.writeFile(path.join(dir,id+'.jpg'),Buffer.from(await r.arrayBuffer()))}});
async function pick(page,count,append=false){const pending=page.waitForEvent('filechooser');await page.locator(append?'#fastAdd':'#photosInput').click();await (await pending).setFiles(ids.slice(0,count).map(id=>path.join(dir,id+'.jpg')));await expect(page.locator('#templateJourney')).toBeVisible();await expect(page.locator('#journeyCreate')).toBeEnabled()}
test('previews, cancel, append, export and restore',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await pick(page,8);
 expect(await page.locator('#journeyCards img').count()).toBeGreaterThan(4);await expect(page.locator('#loading')).toBeHidden();expect(await page.evaluate(()=>S.photos.length)).toBe(0);
 await page.locator('#journeyCancel').click();expect(await page.evaluate(()=>S.photos.length)).toBe(0);
 await pick(page,8);await page.screenshot({path:'test-results/journey-templates-'+test.info().project.name+'.png'});
 const family=await page.locator('.journeyTemplate[aria-pressed=true]').getAttribute('data-family');await page.locator('#journeyCreate').click();await expect(page.locator('html')).toHaveAttribute('data-photo-import-phase','idle',{timeout:100000});
 expect(await page.evaluate(()=>S.frameTemplateFamily)).toBe(family);const before=await page.evaluate(()=>S.photos.map(p=>p.id));
 await page.locator('#fastNewDesign').click();await expect(page.locator('.quickbar')).not.toHaveClass(/busy/);await expect(page.locator('#templateJourney')).toBeHidden();expect(await page.evaluate(()=>S.photos.map(p=>p.id))).toEqual(before);
 await pick(page,2,true);await page.locator('#journeyCancel').click();expect(await page.evaluate(()=>S.photos.map(p=>p.id))).toEqual(before);
 await pick(page,2,true);await page.locator('#journeyCreate').click();await expect(page.locator('html')).toHaveAttribute('data-photo-import-phase','idle',{timeout:100000});expect(await page.evaluate(()=>S.photos.length)).toBe(10);
 expect(await page.evaluate(()=>new Set(S.slides.flatMap(s=>s.layers.filter(l=>l.type==='img').map(l=>l.photo.id))).size)).toBe(10);
 await page.locator('#fastExport').click();await expect(page.locator('#exportSheet')).toHaveClass(/on/);await page.locator('#exportSheet .closeSheet').click();
 await page.reload();await page.locator('#resumeBtn').click();await expect(page.locator('#studioScreen')).toHaveClass(/on/);expect(await page.evaluate(()=>S.photos.length)).toBe(10);expect(errors).toEqual([]);
});
