const {test,expect}=require('@playwright/test'),{fixtureFetch}=require('../support/photo-fixtures.cjs'),{designSelect}=require('../support/editor.cjs');
const catalog=require('../../frame/template-catalog.json'),ids=require('../../frame/template-layouts').editorial;
test('new editorial series previews, applies and exports real photos in all mobile formats',async({page})=>{
 test.setTimeout(180000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const files=await Promise.all([10,20,24,28,29,42,43,47].map(async id=>({name:id+'.jpg',mimeType:'image/jpeg',buffer:Buffer.from(await(await fixtureFetch('https://picsum.photos/id/'+id+'/900/1200')).arrayBuffer())})));
 await page.goto('/');await page.locator('#photosInput').setInputFiles(files);await expect(page.locator('#journeyCreate')).toBeEnabled();
 const filter=page.locator('[data-filter=editorial]');await filter.click();await expect(page.locator('.journeyTemplate')).toHaveCount(6);await expect(filter).toHaveAttribute('aria-pressed','true');
 expect(await page.locator('.journeyTemplate').evaluateAll(cards=>cards.map(c=>c.dataset.family).sort())).toEqual([...ids].sort());
 await page.locator('[data-family=instant_paper]').click();await page.locator('#journeyPreview').click();expect(await page.locator('#largePreviewPages .journeyPage').count()).toBeGreaterThanOrEqual(3);
 expect(await page.locator('#largePreviewPages img').count()).toBe(8);await page.locator('#chooseLargePreview').click();await expect(page.locator('html')).toHaveAttribute('data-photo-import-phase','idle');
 await expect(page.locator('#templateFamily')).toHaveValue('instant_paper');
 const photoIds=await page.evaluate(()=>S.photos.map(p=>p.id).sort());
 await page.evaluate(()=>{window.editorialSamples=[]});
 for(const id of ids)for(const [format,H] of [['4:5',1350],['1:1',1080],['9:16',1920]]){
  await designSelect(page,'#frameFormat',format);await designSelect(page,'#templateFamily',id);
  const result=await page.evaluate(async()=>{
   const file=await renderSlideToFile(0),im=await createImageBitmap(file),cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const ctx=cv.getContext('2d');ctx.drawImage(im,0,0);const corner=[...ctx.getImageData(im.width-2,im.height-2,1,1).data].slice(0,3);const size=[im.width,im.height];const accents={editorial_studio:'#7b6554',instant_paper:'#d3bea0',sage_shapes:'#d3d7c5',lilac_pages:'#918199',travel_papers:'#8b9e84',pop_cards:'#e48bb0'},hex=accents[S.frameTemplateFamily],rgb=[1,3,5].map(n=>parseInt(hex.slice(n,n+2),16)),pixels=ctx.getImageData(0,0,im.width,im.height).data;let ink=0;for(let p=0;p<pixels.length;p+=4)if(rgb.every((c,n)=>pixels[p+n]===c))ink++;im.close();
   if((S.frameFormat||'4:5')==='4:5')editorialSamples.push({name:S.frameTemplateFamily,url:URL.createObjectURL(file)});
   return {size,corner,ink,ids:S.slides.flatMap(sl=>sl.layers.filter(l=>l.type==='img').map(l=>l.photo.id)).sort(),native:S.slides.every(sl=>sl.layers.some(l=>l.frameGraphic))};
  });
  expect(result.size).toEqual([1080,H]);expect(result.ids).toEqual(photoIds);expect(result.native).toBe(true);expect(result.ink,id+' native graphic is present in PNG').toBeGreaterThan(80);
  const hex=catalog.families.find(f=>f.id===id).background;expect(result.corner).toEqual([1,3,5].map(n=>parseInt(hex.slice(n,n+2),16)));
 }
 await page.locator('#browseCollections').click();await expect(page.locator('#journeyCreate')).toBeEnabled();await filter.click();await page.locator('#journeyMore').click();await expect(page.locator('.journeyTemplate')).toHaveCount(8);await expect(filter).toHaveAttribute('aria-pressed','false');await page.locator('#journeyCancel').click();
 await page.setViewportSize({width:1100,height:900});await page.evaluate(()=>{const sheet=document.createElement('div');sheet.id='editorialSheet';sheet.style.cssText='position:absolute;top:0;left:0;z-index:2147483647;width:1100px;padding:24px;background:#e8e5df;display:grid;grid-template-columns:repeat(3,1fr);gap:24px;box-sizing:border-box;color:#222';for(const s of editorialSamples){const tile=document.createElement('div'),im=document.createElement('img'),label=document.createElement('p');im.src=s.url;im.style.width='100%';label.textContent=s.name;tile.append(im,label);sheet.append(tile)}document.body.append(sheet);return Promise.all([...sheet.querySelectorAll('img')].map(im=>im.decode()))});
 await page.locator('#editorialSheet').screenshot({path:'test-results/editorial-collections-'+test.info().project.name+'.png'});expect(errors).toEqual([]);
});
