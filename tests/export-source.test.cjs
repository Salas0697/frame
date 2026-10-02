const {test}=require('node:test'),assert=require('node:assert/strict');
const decoder=require('../frame/export-source.js');
const photo={url:'blob:original',name:'photo.jpg'};
function image(decode){return {naturalWidth:3024,naturalHeight:4032,decode,removeAttribute(name){assert.equal(name,'src');this.released=true}}}
test('normal export decode retains original dimensions and releases its image',async()=>{
 const im=image(async()=>{}),source=await decoder.load(photo,{loadImage:async()=>im});
 assert.equal(source.image,im);assert.equal(source.width,3024);assert.equal(source.height,4032);assert.ok(!im.released);source.release();assert.ok(im.released);
});
test('rejected image decode releases the failed image and independently decodes original bytes once',async()=>{
 const error=new DOMException('cannot decode','EncodingError'),im=image(async()=>{throw error}),blob=new Blob(['original']),calls=[];
 const bitmap={width:3024,height:4032,close(){this.closed=true}};
 const source=await decoder.load(photo,{loadImage:async()=>im,fetch:async url=>{calls.push(url);assert.ok(im.released);return {ok:true,blob:async()=>blob}},createImageBitmap:async bytes=>{assert.equal(bytes,blob);return bitmap}});
 assert.deepEqual(calls,[photo.url]);assert.equal(source.width,3024);assert.equal(source.height,4032);assert.equal(source.image,bitmap);source.release();assert.ok(bitmap.closed);
});
test('both decoder failures reject instead of using an undecoded image',async()=>{
 const im=image(async()=>{throw Error('image decode failed')});let attempts=0;
 await assert.rejects(decoder.load(photo,{loadImage:async()=>im,fetch:async()=>({ok:true,blob:async()=>new Blob(['corrupt'])}),createImageBitmap:async()=>{attempts++;throw Error('bitmap decode failed')}}),/bitmap decode failed/);
 assert.equal(attempts,1);assert.ok(im.released);
});
test('unsupported bitmap recovery retains the decoder error and releases its source',async()=>{
 const error=Error('cannot decode'),im=image(async()=>{throw error});await assert.rejects(decoder.load(photo,{loadImage:async()=>im}),e=>e===error);assert.ok(im.released);
});
test('unavailable originals and zero-sized bitmaps cannot be exported',async()=>{
 const ports={loadImage:async()=>image(async()=>{throw Error('decode')}),fetch:async()=>({ok:false}),createImageBitmap:async()=>{throw Error('unexpected')}};
 await assert.rejects(decoder.load(photo,ports),/Original photo unavailable/);
 let closed=false;ports.fetch=async()=>({ok:true,blob:async()=>new Blob(['bytes'])});ports.createImageBitmap=async()=>({width:0,height:0,close(){closed=true}});
 await assert.rejects(decoder.load(photo,ports),/Empty decoded original/);assert.ok(closed);
});
