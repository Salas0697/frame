/* Local EXIF + nearby locality lookup. No coordinates leave the device. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FramePhotoLocation=api})(typeof window==='undefined'?globalThis:window,()=>{
  const clean=value=>String(value||'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,80);
  const valid=p=>p&&typeof p.latitude==='number'&&typeof p.longitude==='number'&&Number.isFinite(p.latitude)&&Number.isFinite(p.longitude)&&Math.abs(p.latitude)<=90&&Math.abs(p.longitude)<=180;
  function distance(a,b){const r=Math.PI/180,lat=(b.latitude-a.latitude)*r,lon=(b.longitude-a.longitude)*r;const x=Math.sin(lat/2)**2+Math.cos(a.latitude*r)*Math.cos(b.latitude*r)*Math.sin(lon/2)**2;return 6371*2*Math.asin(Math.sqrt(Math.min(1,x)))}
  function nearest(point,cities){
    if(!valid(point))return null;
    let best=null,km=30;
    for(const city of cities){if(Math.abs(city[2]-point.latitude)>.28)continue;const d=distance(point,{latitude:city[2],longitude:city[3]});if(d<km){best=city;km=d}}
    return best?{name:best[0],country:best[1],distanceKm:Math.round(km*10)/10,approximate:true}:null;
  }
  async function read(file,parser){try{const p=await parser.gps(file);return valid(p)?{latitude:p.latitude,longitude:p.longitude}:null}catch{return null}}
  let dataPromise;
  const assetBase=typeof document!=='undefined'?(document.currentScript?.src||document.baseURI):null;
  async function catalog(){
    if(!dataPromise)dataPromise=(async()=>{
      const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
      try{const url=new URL('../locations/'+window.FRAME_LOCATION_DATA_FILE,assetBase);const response=await fetch(url,{signal:controller.signal});if(!response.ok)throw Error('Locality catalog unavailable');return await response.json()}finally{clearTimeout(timer)}
    })().catch(error=>{dataPromise=null;throw error});
    return dataPromise;
  }
  async function enrich(files,photos,progress,parser,load=catalog){
    const points=[];
    for(let i=0;i<files.length;i++){progress?.(`Leyendo locaciones… ${i+1}/${files.length}`);points.push(await read(files[i],parser))}
    if(!points.some(Boolean))return;
    try{const cities=await load();photos.forEach((p,i)=>{p.location=nearest(points[i],cities)})}catch{photos.forEach(p=>{p.locationStatus='catalog-unavailable'})}
  }
  function summarize(photos){
    const places=new Map();let matched=0;
    for(const p of photos){const l=p.location;if(!l?.name)continue;matched++;const key=l.name+'|'+l.country;const entry=places.get(key)||{...l,count:0};entry.count++;places.set(key,entry)}
    const ordered=[...places.values()].sort((a,b)=>b.count-a.count);
    let text='';
    if(ordered.length===1){const l=ordered[0];let country=l.country;try{country=new Intl.DisplayNames(['es'],{type:'region'}).of(l.country)}catch{}text=(l.distanceKm>5?'Cerca de ':'')+l.name+' · '+country}
    else if(ordered.length)text=ordered.slice(0,2).map(l=>l.name).join(' · ')+(ordered.length>2?` · +${ordered.length-2} lugares`:'');
    return {text:clean(text),matched,total:photos.length,places:ordered.length};
  }
  function settings(brief,photos){const summary=summarize(photos),manual=clean(brief?.locationText);return {enabled:brief?.location==='yes',position:['first','middle','last'].includes(brief?.locationPosition)?brief.locationPosition:'last',source:manual?'manual':'gps',...summary,text:manual||summary.text}}
  function index(position,length){return position==='first'?0:position==='middle'?Math.floor((length-1)/2):length-1}
  function transform(sl,k,dx,dy){
    for(const l of sl.layers){l.x=l.x*k+dx;l.y=l.y*k+dy;if(Number.isFinite(l.w))l.w*=k;if(Number.isFinite(l.h))l.h*=k;if(Number.isFinite(l.size))l.size*=k}
    const r=sl.frameCaptionRegion;if(r){r.x=r.x*k+dx/340;r.y=r.y*k+dy/425;r.w*=k;if(r.h)r.h*=k}
  }
  function strip(slides){for(const sl of slides){sl.layers=sl.layers.filter(l=>!l.frameLocation);const space=sl.frameLocationSpace;if(space){transform(sl,1/space.k,-space.dx/space.k,-space.dy/space.k);delete sl.frameLocationSpace}}}
  function bounds(sl){let bottom=425;for(const l of sl.layers){if(l.hidden)continue;const h=l.type==='text'?l.size*Math.max(1,Math.ceil(l.text.length/Math.max(1,l.w/(l.size*.6)))):l.h;const a=(l.rot||0)*Math.PI/180;bottom=Math.max(bottom,l.y+h/2+Math.abs(l.w*Math.sin(a))/2+Math.abs(h*Math.cos(a))/2)}return bottom}
  function decorate(slides,config,ink){
    const selected=slides[index(config?.position,slides.length)],key=JSON.stringify([config?.enabled,config?.text,config?.position]);
    const existing=slides.flatMap(sl=>sl.layers.filter(l=>l.frameLocation).map(l=>({sl,l})));
    if(config?.enabled&&clean(config.text)&&existing.length===1&&existing[0].sl===selected&&selected.frameLocationKey===key){existing[0].l.color=ink(selected.bg);return}
    // Always remove the previous reservation first; regenerating never accumulates shrinkage.
    strip(slides);
    if(!config?.enabled||!clean(config.text)||!slides.length)return;
    const target=slides[index(config.position,slides.length)];
    const group=target.storySpan?slides.filter(sl=>sl.storySpan?.photoId===target.storySpan.photoId):[target];
    const k=Math.min(.89,376/Math.max(...group.map(bounds))),dx=170*(1-k),dy=6;
    for(const sl of group){transform(sl,k,dx,dy);sl.frameLocationSpace={k,dx,dy}}
    const lines=[];let line='';for(const word of clean(config.text).split(' ')){for(const part of word.match(/.{1,36}/gu)||[]){if(line&&line.length+part.length+1>36){lines.push(line);line=''}line+=(line?' ':'')+part}}if(line)lines.push(line);
    const text=lines.slice(0,3).join('\n'),size=7.5;
    target.frameLocationKey=key;
    target.layers.push({id:'frame-location-'+target.id,type:'text',text,x:24,y:395,w:292,size,color:ink(target.bg),font:'mono',weight:400,rot:0,z:45,hidden:false,locked:true,frameLocation:true});
  }
  return {read,enrich,nearest,distance,summarize,settings,index,strip,decorate,clean};
});
