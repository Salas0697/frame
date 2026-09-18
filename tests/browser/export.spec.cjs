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
test('downloaded ZIP contains every page and every photograph after choosing a background',async({page})=>{
 await prepare(page);await page.evaluate(()=>{Object.defineProperty(navigator,'share',{configurable:true,value:undefined})});
 const samples=await page.evaluate(()=>S.slides.map(sl=>sl.layers.filter(l=>l.type==='img'&&!l.hidden).map(l=>({x:Math.round((l.x+l.w*.5)*1080/340),y:Math.round((l.y+l.h*.5)*1080/340)}))));
 await page.locator('#fastExport').click();const download=page.waitForEvent('download');await page.locator('#exportAllBtn').click();const file=await download;
 const zip=await fs.readFile(await file.path());let offset=0,index=0,total=0;
 while(zip.readUInt32LE(offset)===0x04034b50){
  const size=zip.readUInt32LE(offset+18),nameSize=zip.readUInt16LE(offset+26),extra=zip.readUInt16LE(offset+28),start=offset+30+nameSize+extra;
  expect(zip.subarray(offset+30,offset+30+nameSize).toString()).toBe('FRAME_'+String(index+1).padStart(2,'0')+'.png');
  const pixels=await page.evaluate(async({bytes,samples})=>{const bitmap=await createImageBitmap(new Blob([new Uint8Array(bytes)],{type:'image/png'})),cv=document.createElement('canvas');cv.width=bitmap.width;cv.height=bitmap.height;const ctx=cv.getContext('2d');ctx.drawImage(bitmap,0,0);bitmap.close();const result=samples.map(p=>[...ctx.getImageData(p.x,p.y,1,1).data]);cv.width=cv.height=0;return result},{bytes:[...zip.subarray(start,start+size)],samples:samples[index]});
  for(const p of pixels){expect(p[0]).toBeGreaterThanOrEqual(160);expect(p[2]).toBeLessThanOrEqual(65);expect(p[3]).toBe(255);total++}
  offset=start+size;index++;
 }
 expect(index).toBe(samples.length);expect(total).toBe(12);
});
test('failed PNG encoding releases memory, reports failure and permits retry',async({page})=>{
 await prepare(page);
 await page.evaluate(()=>{window.originalToBlob=HTMLCanvasElement.prototype.toBlob;HTMLCanvasElement.prototype.toBlob=function(cb){cb(null)}});
 await page.locator('#fastExport').click();await page.locator('#exportAllBtn').click();await expect(page.locator('#toast')).toContainText('No se pudo completar');await expect(page.locator('#loading')).toBeHidden();await expect(page.locator('#fastExport')).toBeEnabled();
 await page.evaluate(()=>{HTMLCanvasElement.prototype.toBlob=window.originalToBlob;Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});Object.defineProperty(navigator,'share',{configurable:true,value:async({files})=>{window.sharedExport=files.map(f=>({name:f.name,size:f.size}))}})});
 await page.locator('#fastExport').click();await page.locator('#exportAllBtn').click();await expect.poll(()=>page.evaluate(()=>window.sharedExport?.length)).toBeGreaterThan(1);expect(await page.evaluate(()=>window.sharedExport.every(f=>f.size>1000))).toBe(true);
});
test('twelve-megapixel photographs export as visible photographs on every page',async({page})=>{
 test.setTimeout(180000);
 const originals=[];for(const id of [10,20,28]){const name=path.join(dir,'real-'+id+'.jpg');const response=await fetch('https://picsum.photos/id/'+id+'/3024/4032',{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('Photo fixture unavailable');await fs.writeFile(name,Buffer.from(await response.arrayBuffer()));originals.push(name)}
 await page.goto('/');const picker=page.waitForEvent('filechooser');await page.locator('#photosInput').click();await (await picker).setFiles(Array.from({length:9},(_,i)=>originals[i%3]));await expect(page.locator('#journeyCreate')).toBeEnabled();await page.locator('#journeyCreate').click();await expect(page.locator('html')).toHaveAttribute('data-photo-import-phase','idle',{timeout:100000});
 await page.locator('#templateFamily').selectOption('gallery_book');await page.getByText('Fondo y marco',{exact:true}).click();await page.locator('#backgroundScope').selectOption('all');await page.locator('#backgroundSwatches button').last().click();
 const images=await page.evaluate(async()=>{
  const results=[];
  for(let i=0;i<S.slides.length;i++){
   const f=await renderSlideToFile(i),im=await createImageBitmap(f),cv=document.createElement('canvas');cv.width=1080;cv.height=1350;const x=cv.getContext('2d');x.drawImage(im,0,0);im.close();
   for(const l of S.slides[i].layers.filter(l=>l.type==='img')){
    const colors=new Set();let sum=0;
    for(let a=2;a<=8;a++)for(let b=2;b<=8;b++){const p=x.getImageData(Math.floor((l.x+l.w*a/10)*1080/340),Math.floor((l.y+l.h*b/10)*1080/340),1,1).data;colors.add([...p].join());sum+=p[0]+p[1]+p[2]}
    results.push({name:l.photo.name,colors:colors.size,sum});
   }
   cv.width=cv.height=0;
  }return results;
 });
 expect(images).toHaveLength(9);for(const p of images){expect(p.colors,p.name).toBeGreaterThan(10);expect(p.sum,p.name).toBeGreaterThan(1000)}
});
