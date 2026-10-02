/* Export decoding is isolated from preview images and owns its release handles. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FrameExportSource=api})(typeof window!=='undefined'?window:this,function(){
  async function load(photo,ports){
    let image;
    try{
      image=await ports.loadImage(photo.url);
      if(image.decode)await image.decode();
      if(!image.naturalWidth||!image.naturalHeight)throw Error('Empty decoded photo');
      const source=image;
      return {image:source,width:source.naturalWidth,height:source.naturalHeight,release:()=>source.removeAttribute('src')};
    }catch(error){
      image?.removeAttribute('src');
      if(typeof ports.createImageBitmap!=='function')throw error;
      // One independent decode of the original bytes. Never substitute a preview
      // or assume that an onload image is drawable after decode() rejected.
      const response=await ports.fetch(photo.url);
      if(!response.ok)throw Error('Original photo unavailable: '+photo.name,{cause:error});
      const bitmap=await ports.createImageBitmap(await response.blob());
      if(!bitmap.width||!bitmap.height){bitmap.close();throw Error('Empty decoded original: '+photo.name)}
      return {image:bitmap,width:bitmap.width,height:bitmap.height,release:()=>bitmap.close()};
    }
  }
  return {load};
});
