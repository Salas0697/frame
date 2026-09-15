/* Colors measured from image pixels; no hue rotation or synthetic tints. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FramePhotoColors=api})(typeof window!=='undefined'?window:this,function(){
 const hex=rgb=>'#'+rgb.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
 const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
 function cluster(rows,limit=8){
  const groups=[];
  for(const row of [...rows].sort((a,b)=>b.weight-a.weight)){
   const near=groups.find(g=>distance(g.rgb,row.rgb)<38);
   if(near)near.weight+=row.weight;else groups.push({...row,rgb:[...row.rgb]});
  }
  return groups.sort((a,b)=>b.weight-a.weight).slice(0,limit).map(g=>({rgb:g.rgb,hex:hex(g.rgb),weight:g.weight}));
 }
 function extract(data){
  const bins=new Map();let total=0;
  for(let i=0;i<data.length;i+=4){if(data[i+3]<200)continue;const rgb=[data[i],data[i+1],data[i+2]],key=rgb.map(v=>v>>4).join(',');
   let bin=bins.get(key);if(!bin){bin={rgb,weight:0};bins.set(key,bin)}bin.weight++;total++;
  }
  // Each representative is an observed RGB sample; mixed red/green never becomes invented yellow.
  const palette=cluster([...bins.values()].map(b=>({...b,weight:b.weight/Math.max(1,total)})));
  const dominant=palette.filter(c=>c.weight>=.03);return dominant.length?dominant:palette.slice(0,1);
 }
 function palette(photos){
  const unique=[...new Map(photos.filter(Boolean).map(p=>[p.id,p])).values()];
  return cluster(unique.flatMap(p=>(p.dominantColors||[]).map(c=>({...c,weight:c.weight/Math.max(1,unique.length)}))));
 }
 function pagePhotos(sl){return [...new Map(sl.layers.filter(l=>l.type==='img'&&!l.hidden).map(l=>[l.photo.id,l.photo])).values()]}
 function resolve(mode,photos,color){if(mode==='custom'&&/^#[\da-f]{6}$/i.test(color||''))return color;if(mode==='white')return '#ffffff';if(mode==='black')return '#101012';return palette(photos)[0]?.hex||'#ffffff'}
 function ink(color){const rgb=color.match(/^#([\da-f]{6})$/i);const c=rgb?rgb[1].match(/../g).map(v=>parseInt(v,16)):(color.match(/\d+/g)||[255,255,255]).map(Number);return c[0]*.2126+c[1]*.7152+c[2]*.0722<135?'#f7f7f5':'#222222'}
 function paint(sl,color){sl.bg=color;sl.layers.forEach(l=>{if(l.frameCaption||l.frameLocation)l.color=ink(color);if(l.frameBorder)l.frameBorderColor=ink(color)})}
 function apply(project,{scope='page',mode='custom',color,index=project.currentSlide||0}){
  if(scope==='all'){
   project.frameBackground=mode;project.frameBackgroundColor=mode==='custom'?color:null;
   const bg=resolve(mode,project.photos,color);project.slides.forEach(sl=>{delete sl.frameBackgroundOverride;paint(sl,bg)});
  }else{const sl=project.slides[index];if(!sl)return;sl.frameBackgroundOverride={mode,color:mode==='custom'?color:null};paint(sl,resolve(mode,pagePhotos(sl),color))}
 }
 async function ensure(photos){
  for(const p of photos){if(p.dominantColors?.length)continue;
   try{const im=await new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=p.url});const cv=document.createElement('canvas');cv.width=cv.height=42;const ctx=cv.getContext('2d',{willReadFrequently:true});ctx.drawImage(im,0,0,42,42);p.dominantColors=extract(ctx.getImageData(0,0,42,42).data)}catch{p.dominantColors=[]}
  }
 }
 return {extract,palette,pagePhotos,resolve,paint,apply,ensure,ink};
});
