/* In-place design adjustments preserve photo crops and use native export layers. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FrameDesign=api})(typeof window==='undefined'?globalThis:window,()=>{
  const spacing={compact:1.045,balanced:1,airy:.88};
  function apply(sl,setting={}){
    if(sl.storySpan)return false;
    const W=340,H=sl.frameFormat==='1:1'?340:sl.frameFormat==='9:16'?340*16/9:425;
    const layers=sl.layers.filter(l=>l.type==='img'||l.type==='deco'),images=layers.filter(l=>l.type==='img');if(!images.length)return false;
    const previous=sl.frameDesignScale||1,target=spacing[setting.spacing]||1;
    const cx=W/2,cy=H*.46;
    let k=target/previous;
    if(k>1){
      for(const l of images){const a=(l.rot||0)*Math.PI/180,bw=Math.abs(l.w*Math.cos(a))+Math.abs(l.h*Math.sin(a)),bh=Math.abs(l.h*Math.cos(a))+Math.abs(l.w*Math.sin(a));
        const left=l.x+l.w/2-bw/2,right=left+bw,top=l.y+l.h/2-bh/2,bottom=top+bh;
        if(left<cx)k=Math.min(k,cx/(cx-left));if(right>cx)k=Math.min(k,(W-cx)/(right-cx));if(top<cy)k=Math.min(k,cy/(cy-top));if(bottom>cy)k=Math.min(k,(H-cy)/(bottom-cy));
      }
    }
    layers.forEach(l=>{l.x=cx+(l.x-cx)*k;l.y=cy+(l.y-cy)*k;l.w*=k;l.h*=k});sl.frameDesignScale=previous*k;
    for(const l of images){if(!Object.hasOwn(l,'frameOriginalBorder'))l.frameOriginalBorder=l.frameBorder||0;
      l.frameBorder=setting.border==='none'?0:setting.border==='fine'?.65:setting.border==='bold'?2:l.frameOriginalBorder;
      if(setting.border==='fine'||setting.border==='bold')l.frameBorderColor=['#101012','#161616'].includes(sl.bg)?'#f1eee7':'#242322';
    }
    return true;
  }
  return {apply,spacing};
});
