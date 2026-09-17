const {test,expect}=require('@playwright/test');
const fs=require('node:fs/promises'),path=require('node:path');
const {png}=require('../support/color-fixture.cjs');
const dir=path.resolve('test-results/export-fixtures');
test.beforeAll(async()=>{await fs.mkdir(dir,{recursive:true});for(let i=0;i<12;i++)await fs.writeFile(path.join(dir,i+'.png'),png([170+i*5,40+i*5,50],[30,150,200]))});
async function prepare(page){
 await page.goto('/');const picker=page.waitForEvent('filechooser');await page.locator('#photosInput').click();await (await picker).setFiles(Array.from({length:12},(_,i)=>path.join(dir,i+'.png')));
 await expect(page.locator('#journeyCreate')).toBeEnabled();await page.locator('#journeyCreate').click();await expect(page.locator('html')).toHaveAttribute('data-photo-import-phase','idle',{timeout:100000});
 await page.locator('#templateFamily').selectOption('gallery_book');await page.getByText('Fondo y marco',{exact:true}).click();await page.locator('#backgroundScope').selectOption('all');await page.locator('#backgroundSwatches button').last().click();
}
test('every exported photograph survives custom backgrounds and surfaces are released',async({page})=>{
 await prepare(page);
 const report=await page.evaluate(async()=>{
  const make=document.createElement.bind(document),surfaces=[];
  document.createElement=function(name,...args){const el=make(name,...args);if(name==='canvas')surfaces.push(el);return el};
  const failures=[];let files=0,photos=0;
  try{for(let round=0;round<2;round++)for(let i=0;i<S.slides.length;i++){
   const f=await renderSlideToFile(i);files++;
   const image=await createImageBitmap(f),cv=make('canvas');cv.width=1080;cv.height=1350;const ctx=cv.getContext('2d');ctx.drawImage(image,0,0);image.close();
   for(const l of S.slides[i].layers.filter(l=>l.type==='img'&&!l.hidden)){
    const x=Math.round((l.x+l.w*.5)*1080/340),y=Math.round((l.y+l.h*.5)*1080/340),p=ctx.getImageData(x,y,1,1).data;
    // All fixtures have a known red central region; checking the background alone misses black photos.
    if(p[0]<160||p[0]>235||p[1]<30||p[1]>110||p[2]>65||p[3]!==255)failures.push({i,name:l.photo.name,p:[...p]});photos++;
   }
   cv.width=cv.height=0;
  }}finally{document.createElement=make}
  return {files,photos,failures,retainedPixels:surfaces.reduce((n,c)=>n+c.width*c.height,0)};
 });
 expect(report.failures).toEqual([]);expect(report.photos).toBe(24);expect(report.retainedPixels).toBe(0);
});
test('export stays reachable while scrolling the mobile editor',async({page})=>{
 await prepare(page);await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
 const b=await page.locator('#fastExport').boundingBox();expect(b.y).toBeGreaterThanOrEqual(0);expect(b.y+b.height).toBeLessThanOrEqual(844);
 await page.locator('#fastExport').click();await expect(page.locator('#exportSheet')).toHaveClass(/on/);
 await page.screenshot({path:'test-results/export-visible-'+test.info().project.name+'.png'});
});
