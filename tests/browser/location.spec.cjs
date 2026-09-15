const {test,expect}=require('@playwright/test'),fs=require('node:fs/promises'),path=require('node:path');
const {jpeg}=require('../support/gps-fixture.cjs');
const ids=[10,20,24,28,29,42,43,47],dir=path.resolve('test-results/location-fixtures');
test.beforeAll(async()=>{
 await fs.mkdir(dir,{recursive:true});
 for(const id of ids){
  const original=path.join(dir,'original-'+id+'.jpg');let bytes;
  try{bytes=await fs.readFile(original)}catch{const response=await fetch('https://picsum.photos/id/'+id+'/900/1200',{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('Fixture download failed');bytes=Buffer.from(await response.arrayBuffer());await fs.writeFile(original,bytes)}
  await fs.writeFile(path.join(dir,'gps-'+id+'.jpg'),jpeg(bytes,4.142,-73.626));
 }
});
async function choose(page,gps=true,append=false){
 const pending=page.waitForEvent('filechooser');await page.locator(append?'#fastAdd':'#photosInput').click();const picker=await pending;
 await picker.setFiles(ids.map(id=>path.join(dir,(gps?'gps-':'original-')+id+'.jpg')));
 await expect(page.locator('#frameBrief')).toBeVisible();await expect(page.locator('html')).toHaveAttribute('data-photo-import-phase','brief');await expect(page.locator('#loading')).toBeHidden();
}
async function done(page,surprise=false){await page.locator(surprise?'#briefSurprise':'#briefGo').click();await expect(page.locator('#studioScreen')).toHaveClass(/on/);await expect(page.locator('html')).toHaveAttribute('data-photo-import-phase','idle',{timeout:100000})}
async function note(page,position){
 const labels=page.locator('#stage .locationLabel');await expect(labels).toHaveCount(1);await expect(labels).toContainText('Villavicencio');
 const count=await page.locator('#stage .slide').count(),index=position==='first'?0:position==='middle'?Math.floor((count-1)/2):count-1;
 await expect(page.locator('#stage .slide').nth(index).locator('.locationLabel')).toHaveCount(1);
 const layout=await labels.evaluate(el=>{const label=el.getBoundingClientRect();return [...el.parentElement.querySelectorAll('.photoClip')].map(im=>({bottom:im.getBoundingClientRect().bottom,top:label.top}))});
 expect(layout.every(x=>x.bottom<x.top)).toBeTruthy();return index;
}
for(const position of ['first','middle','last'])test('GPS note '+position+' only once, no overlap, variation, export and restore',async({page})=>{
 const errors=[],catalogRequests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().includes('/assets/locations/'))catalogRequests.push(r.url())});
 await page.goto('/');await choose(page);expect(catalogRequests).toHaveLength(0);
 await page.getByRole('button',{name:'Sí, incluir locación',exact:true}).click();await page.locator('[data-key="locationPosition"] [data-v="'+position+'"]').click();expect(catalogRequests).toHaveLength(0);
 await done(page,position==='last');await note(page,position);expect(catalogRequests).toHaveLength(1);
 expect(catalogRequests[0]).not.toContain('73.626');
 await page.locator('#fastNewDesign').click();const index=await note(page,position);expect(catalogRequests).toHaveLength(1);await expect(page.locator('#frameBrief')).toBeHidden();
 const exported=await page.evaluate(async i=>{const f=await renderSlideToFile(i),im=await createImageBitmap(f),cv=document.createElement('canvas');cv.width=1080;cv.height=1350;const ctx=cv.getContext('2d');ctx.drawImage(im,0,0);const bg=ctx.getImageData(10,1260,1,1).data,data=ctx.getImageData(70,1250,940,85).data;let ink=0;for(let p=0;p<data.length;p+=4)if(Math.abs(data[p]-bg[0])+Math.abs(data[p+1]-bg[1])+Math.abs(data[p+2]-bg[2])>100)ink++;return {width:im.width,height:im.height,ink}},index);
 expect(exported.width).toBe(1080);expect(exported.height).toBe(1350);expect(exported.ink).toBeGreaterThan(30);
 await page.screenshot({path:'test-results/location-'+position+'-'+test.info().project.name+'.png'});
 await page.reload();await page.locator('#resumeBtn').click();await note(page,position);expect(catalogRequests).toHaveLength(1);expect(errors).toEqual([]);
});
test('off skips metadata lookup; appended batch asks again and adds only one note',async({page})=>{
 const requests=[];page.on('request',r=>{if(r.url().includes('/assets/locations/'))requests.push(r.url())});
 await page.goto('/');await choose(page);await done(page);await expect(page.locator('#stage .locationLabel')).toHaveCount(0);expect(requests).toHaveLength(0);
 await choose(page,true,true);await page.getByRole('button',{name:'Sí, incluir locación',exact:true}).click();await done(page);await note(page,'last');await expect(page.locator('#stats')).toContainText('16 fotos');
 await page.getByText('Locación',{exact:true}).click();await page.locator('#locationPosition').selectOption('off');await expect(page.locator('#stage .locationLabel')).toHaveCount(0);
 await page.locator('#undoBtn').click();await note(page,'last');
});
test('no GPS falls back to editable place, position updates remain singular',async({page})=>{
 await page.goto('/');await choose(page,false);await page.getByRole('button',{name:'Sí, incluir locación',exact:true}).click();await done(page);
 await expect(page.locator('#stage .locationLabel')).toHaveCount(0);await expect(page.locator('#locationStatus')).toContainText('No pudimos obtener');await expect(page.locator('#locationText')).toBeVisible();
 await page.locator('#locationText').fill('Villavicencio · Colombia');await page.locator('#locationText').press('Tab');await note(page,'last');
 for(const position of ['first','middle','last']){await page.locator('#locationPosition').selectOption(position);await note(page,position)}
});
test('manual brief place is retained by Surprise without downloading locality data',async({page})=>{
 const requests=[];page.on('request',r=>{if(r.url().includes('/assets/locations/'))requests.push(r.url())});
 await page.goto('/frame/');await choose(page);await page.getByRole('button',{name:'Sí, incluir locación',exact:true}).click();await page.locator('#briefLocationText').fill('Villavicencio · Colombia');await done(page,true);await note(page,'last');expect(requests).toHaveLength(0);
});
