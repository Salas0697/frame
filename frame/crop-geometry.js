/* One crop geometry for preview, gestures, thumbnails and PNG export. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FrameCrop=api})(typeof window!=='undefined'?window:this,function(){
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const ratio=l=>Number(l.photo?.aspect||l.photo?.width/l.photo?.height||l.photo?.w/l.photo?.h)||1;
  function geometry(l,w,h){
    const r=ratio(l),contain=l.fit==='contain',baseW=(contain?r>w/h:r<w/h)?w:h*r,baseH=baseW/r;
    const dw=baseW*(l.zoom||1),dh=baseH*(l.zoom||1),ex=Math.max(0,dw-w),ey=Math.max(0,dh-h);
    return {w:dw,h:dh,x:(w-dw)/2-clamp(l.offX||0,-50,50)*ex/100,y:(h-dh)/2-clamp(l.offY||0,-50,50)*ey/100,ex,ey};
  }
  function pan(l,w,h,dx,dy){const g=geometry(l,w,h);return {offX:g.ex?clamp((l.offX||0)-dx/g.ex*100,-50,50):0,offY:g.ey?clamp((l.offY||0)-dy/g.ey*100,-50,50):0}}
  function pinch(l,w,h,zoom,from,to){
    const old=geometry(l,w,h),next={...l,zoom:clamp(zoom,1,3)},g=geometry(next,w,h);
    const x=to.x-(from.x-old.x)/old.w*g.w,y=to.y-(from.y-old.y)/old.h*g.h;
    return {...next,offX:g.ex?clamp(((w-g.w)/2-x)/g.ex*100,-50,50):0,offY:g.ey?clamp(((h-g.h)/2-y)/g.ey*100,-50,50):0};
  }
  function imageElement(l,w,h){
    const box=document.createElement('div');box.className='photoClip';
    Object.assign(box.style,{position:'absolute',overflow:'hidden',width:w+'px',height:h+'px',transform:'rotate('+(l.rot||0)+'deg)'});
    if(l.frameBorder)box.style.outline=l.frameBorder*(w/l.w)+'px solid '+(l.frameBorderColor||'#161616');
    const im=document.createElement('img'),g=geometry(l,w,h);im.src=l.photo.url;im.alt=l.photo.name||'Foto seleccionada';im.draggable=false;
    Object.assign(im.style,{position:'absolute',maxWidth:'none',maxHeight:'none',width:g.w+'px',height:g.h+'px',left:g.x+'px',top:g.y+'px',objectFit:'fill'});
    box.append(im);return {box,im};
  }
  return {geometry,pan,pinch,imageElement};
});
