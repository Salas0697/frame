/* Shared logical and export sizes. Old projects remain 4:5. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FrameFormats=api})(typeof window==='undefined'?globalThis:window,()=>{
  const options=[{id:'4:5',name:'Vertical · 4:5',width:1080,height:1350},{id:'1:1',name:'Cuadrado · 1:1',width:1080,height:1080},{id:'9:16',name:'Pantalla · 9:16',width:1080,height:1920}];
  const get=id=>options.find(f=>f.id===id)||options[0];
  const dimensions=id=>{const f=get(id);return [340,340*f.height/f.width]};
  // Preserve hand edits and fixed pages with a uniform transform, never stretch photos.
  function fitPage(page,id){
    const [w,h]=dimensions(page.frameFormat),[W,H]=dimensions(id),k=Math.min(W/w,H/h),dx=(W-w*k)/2,dy=(H-h*k)/2;
    for(const l of page.layers){l.x=page.storySpan?(l.x+page.storySpan.seg*w)*k-page.storySpan.seg*W+page.storySpan.span*dx:l.x*k+dx;l.y=l.y*k+dy;if(Number.isFinite(l.w))l.w*=k;if(Number.isFinite(l.h))l.h*=k;if(Number.isFinite(l.size))l.size*=k}
    const r=page.frameCaptionRegion;if(r){r.x=(r.x*w*k+dx)/W;r.y=(r.y*h*k+dy)/H;r.w=r.w*w*k/W;if(r.h)r.h=r.h*h*k/H}
    page.frameFormat=get(id).id;return page;
  }
  return {options,get,dimensions,fitPage};
});
