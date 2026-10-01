const {test,expect}=require('@playwright/test'),path=require('node:path'),fs=require('node:fs/promises');
const {fixtureFetch}=require('../support/photo-fixtures.cjs'),catalog=require('../../frame/template-catalog.json');
const ids=[10,20,24,28,29,42,43,47,48,49,50,54],files=[];
test.beforeAll(async()=>{test.setTimeout(240000);const dir=path.resolve('test-results/diversity-photos');await fs.mkdir(dir,{recursive:true});for(const id of ids){const r=await fixtureFetch('https://picsum.photos/id/'+id+'/900/1200',{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Fixture failed');const f=path.join(dir,id+'.jpg');await fs.writeFile(f,Buffer.from(await r.arrayBuffer()));files.push(f)}});
async function upload(page){await page.goto('/');const wait=page.waitForEvent('filechooser');await page.locator('#photosInput').click();await(await wait).setFiles(files);await expect(page.locator('#journeyCreate')).toBeEnabled();await page.locator('#journeyCreate').click();await expect(page.locator('html')).toHaveAttribute('data-photo-import-phase','idle',{timeout:100000})}
test('expanded library is searchable and produces distinct real-photo frames with exported graphic identity',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await upload(page);
 await page.locator('#browseCollections').click();await page.locator('#journeySearch').fill('neon');await expect(page.locator('.journeyTemplate')).toHaveCount(1);await expect(page.locator('[data-family=neon_stage]')).toBeVisible();
 await page.locator('#journeySearch').fill('zz-no-results');await expect(page.locator('#journeyCreate')).toBeDisabled();await expect(page.locator('#journeyChoice')).toContainText('No hay');
 await page.locator('#journeySearch').fill('');await page.locator('#journeyMore').click();await expect(page.locator('.journeyTemplate')).toHaveCount(catalog.families.length);
 const lastVisible=await page.locator('.journeyTemplate').last().getAttribute('data-family');
 await page.evaluate(()=>{window.qaRandom=Math.random;Math.random=()=>.9999});
 await page.locator('#journeySurprise').click();await expect(page.locator('#templateJourney')).toBeHidden();
 await page.evaluate(()=>{Math.random=window.qaRandom;delete window.qaRandom});await expect(page.locator('#templateFamily')).toHaveValue(lastVisible);
 await page.evaluate(()=>{S.frameBackground='collection';S.frameLastDesign=null;window.visualSamples=[]});
 for(const family of catalog.families){
  await page.locator('#templateFamily').selectOption(family.id);
  const result=await page.evaluate(async name=>{
   const shapes=S.slides.filter(s=>!s.storySpan).map(FrameTemplateEngine.geometry),duplicates=shapes.some((g,i)=>shapes.slice(0,i).some(other=>FrameTemplateEngine.distance(g,other)<.005));
   const file=await renderSlideToFile(0),im=await createImageBitmap(file);const size=[im.width,im.height];im.close();window.visualSamples.push({name,url:URL.createObjectURL(file)});
   return {duplicates,size,ids:S.slides.flatMap(s=>s.layers.filter(l=>l.type==='img').map(l=>l.photo.id)),signature:FrameTemplateEngine.visualSignature([S.slides[0]])};
  },family.name);
  expect(result.duplicates,family.id).toBeFalsy();expect(result.size).toEqual([1080,1350]);expect(new Set(result.ids).size).toBe(12);
 }
 // Contact sheet contains actual exported PNGs, not a parallel mock renderer.
 await page.setViewportSize({width:1100,height:900});
 await page.evaluate(()=>{const sheet=document.createElement('div');sheet.id='qaSheet';sheet.style.cssText='position:absolute;inset:0 auto auto 0;width:1100px;background:#e7e7e4;z-index:2147483647;padding:18px;box-sizing:border-box;display:grid;grid-template-columns:repeat(5,1fr);gap:16px;color:#222;font:14px sans-serif';for(const sample of visualSamples){const tile=document.createElement('div'),im=document.createElement('img'),label=document.createElement('p');im.src=sample.url;im.style.cssText='width:100%;display:block';label.textContent=sample.name;tile.append(im,label);sheet.append(tile)}document.body.append(sheet)});
 await expect(page.locator('#qaSheet img')).toHaveCount(catalog.families.length);await page.evaluate(()=>Promise.all([...document.querySelectorAll('#qaSheet img')].map(im=>im.decode())));
 await page.locator('#qaSheet').screenshot({path:'test-results/diversity-export-sheet-'+test.info().project.name+'.png'});expect(errors).toEqual([]);
});
