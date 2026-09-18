/* Deterministic normalized paper edges, shared by DOM, crop editor and PNG. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FrameCuts=api})(typeof window!=='undefined'?window:this,function(){
 function points(cut){
  if(!cut)return [[0,0],[1,0],[1,1],[0,1]];
  if(cut.kind==='diagonal')return [[0,0],[.86,0],[1,.14],[1,1],[.14,1],[0,.86]];
  if(cut.kind==='notch')return [[0,0],[.83,0],[.83,.1],[1,.1],[1,1],[.1,1],[0,.9]];
  let seed=cut.seed>>>0;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  const p=[],n=44,depth=.022;
  // Irregular spacing and shallow fibres keep the image dominant.
  for(let i=0;i<=n;i++)p.push([i/n,i===0||i===n?0:rnd()*depth]);
  if(cut.kind==='torn')for(let i=1;i<n;i++)p.push([1-rnd()*depth,i/n]);
  p.push([1,1]);for(let i=n-1;i>=0;i--)p.push([i/n,1-(i===0?0:rnd()*depth)]);
  if(cut.kind==='torn')for(let i=n-1;i>0;i--)p.push([rnd()*depth,i/n]);
  return p;
 }
 function css(cut){return cut?'polygon('+points(cut).map(p=>p.map(v=>(v*100).toFixed(4)+'%').join(' ')).join(',')+')':'none'}
 function path(ctx,cut,x,y,w,h){const p=points(cut);ctx.beginPath();ctx.moveTo(x+p[0][0]*w,y+p[0][1]*h);for(const q of p.slice(1))ctx.lineTo(x+q[0]*w,y+q[1]*h);ctx.closePath()}
 return {points,css,path};
});
