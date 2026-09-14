(()=>{
  const ENHANCE_VER='Director v2';
  S.smartSelect=true; S.magicFill=false; S.referenceMeta=null; S.heroPhotoId=null; S.animate=false;

  function addCss(){
    const st=document.createElement('style');
    st.textContent=`
      .pill.wow{border-color:#d9ff4550;color:#d9ff45}.pill.wow.on{background:#d9ff45;color:#09090b}
      .magicBg{position:absolute;pointer-events:none;overflow:hidden;filter:blur(16px) saturate(.95);transform-origin:center;opacity:.82}
      body.animate-preview .slide img{animation:frameKen 5s ease-in-out infinite alternate}
      body.animate-preview .slide .textLayer{animation:frameType 2.6s ease-in-out infinite alternate}
      @keyframes frameKen{from{filter:brightness(.98)}to{filter:brightness(1.05)}}
      @keyframes frameType{from{opacity:.82}to{opacity:1}}
      .analysisBadge{display:inline-flex;gap:6px;align-items:center;padding:6px 9px;border-radius:999px;background:#d9ff4514;color:#d9ff45;font-size:10px;margin-top:8px}
      #referenceInput{display:none}
    `;
    document.head.appendChild(st);
  }
  addCss();

  function toolbarButton(id,label,cls=''){
    const b=document.createElement('button'); b.className='pill '+cls; b.id=id; b.textContent=label; return b;
  }
  const bar=$('#controlBar');
  if(bar){
    bar.appendChild(toolbarButton('smartBtn','Smart select','wow on'));
    bar.appendChild(toolbarButton('referenceBtn','Reference'));
    bar.appendChild(toolbarButton('moreLikeBtn','Más así'));
    bar.appendChild(toolbarButton('wildBtn','Wild'));
    bar.appendChild(toolbarButton('magicFillBtn','Magic fill'));
    bar.appendChild(toolbarButton('animateBtn','Animate'));
    bar.appendChild(toolbarButton('depthBtn','Depth','wow'));
    const inp=document.createElement('input'); inp.type='file'; inp.accept='image/*'; inp.id='referenceInput'; document.body.appendChild(inp);
  }

  function colorDist(a,b){return Math.hypot(a.avg[0]-b.avg[0],a.avg[1]-b.avg[1],a.avg[2]-b.avg[2])}
  function smartPhotos(list){
    const sorted=[...list].sort((a,b)=>b.score-a.score); const out=[];
    for(const p of sorted){
      const blurry=p.variance<110; const duplicate=out.some(q=>colorDist(p,q)<24 && Math.abs(p.aspect-q.aspect)<.08);
      if((blurry&&out.length>=6)||duplicate)continue; out.push(p); if(out.length>=20)break;
    }
    return out.length>=3?out:sorted;
  }
  const originalBuild=buildSlides;

  const originalPal=palFromPhoto;
  palFromPhoto=function(meta){
    const p=originalPal(meta); if(!S.referenceMeta)return p;
    const rp=originalPal(S.referenceMeta); return p.map((c,i)=>c.map((v,j)=>Math.round(v*.46+rp[i][j]*.54)));
  };

  $('#smartBtn').onclick=()=>{S.smartSelect=!S.smartSelect;$('#smartBtn').classList.toggle('on',S.smartSelect);toast(S.smartSelect?'Smart select activo':'Usando todas las fotos');saveProject()};
  $('#referenceBtn').onclick=()=>$('#referenceInput').click();
  $('#referenceInput').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;const p={id:'reference',name:f.name,url:URL.createObjectURL(f)};S.referenceMeta=await analyzePhoto(p);$('#referenceBtn').classList.add('on');toast('Estilo de referencia capturado');};

  function favoriteSlides(){return S.slides.filter(s=>s.favorite)}
  function variantFromFavorite(fav,idx){
    const sl=clone(fav); sl.id=uid(); sl.favorite=false; const photoPool=smartPhotos(S.photos); let pi=idx;
    sl.layers.forEach(l=>{l.id=uid(); if(l.type==='img'&&!l.locked){l.photo=photoPool[pi++%photoPool.length];l.offX=rnd(-8,8);l.offY=rnd(-8,8);l.zoom=Math.max(1,l.zoom+rnd(-.06,.12))} if(l.type==='text'&&!l.locked){l.x+=rnd(-12,12);l.y+=rnd(-12,12);l.rot+=rnd(-2.5,2.5);if(Math.random()<.35)l.font=pick(FONTS)[0]}});
    const first=sl.layers.find(l=>l.type==='img')?.photo; if(first){sl.palette=palFromPhoto(first);sl.bg=rgbToCss(sl.palette[0])}
    return sl;
  }
  $('#moreLikeBtn').onclick=()=>{const favs=favoriteSlides();if(!favs.length)return toast('Marca un slide con ☆ primero');pushHistory();S.slides=S.slides.map((s,i)=>s.favorite?s:variantFromFavorite(favs[i%favs.length],i));renderAll();toast('Variaciones del estilo favorito')};
  $('#wildBtn').onclick=()=>{pushHistory();const oldSmart=S.smartSelect;S.smartSelect=false;originalBuild();S.smartSelect=oldSmart;S.slides.forEach(sl=>{if(Math.random()<.8)sl.layers.push(makeDeco('block',rnd(-20,280),rnd(0,380),rnd(40,130),rnd(8,90),rgbToCss(pick(sl.palette.slice(2))),rnd(-22,22)));if(Math.random()<.65)sl.layers.push(makeText(pick(PLACEHOLDERS),rnd(-8,210),rnd(12,390),rnd(80,250),rnd(16,72),rgbToCss(pick(sl.palette.slice(1))),pick(FONTS)[0],pick([400,700,900]),rnd(-12,12))) });renderAll();toast('Wild mode')};

  const originalRenderStage=renderStage;
  function applyMagicFill(){
    if(!S.magicFill)return;
    $$('.imgLayer').forEach(img=>{const bg=document.createElement('div');bg.className='magicBg';bg.style.left=img.style.left;bg.style.top=img.style.top;bg.style.width=img.style.width;bg.style.height=img.style.height;bg.style.zIndex=Math.max(0,(+img.style.zIndex||10)-1);bg.style.background=`url("${img.src}") center/cover no-repeat`;bg.style.transform=(img.style.transform||'')+' scale(1.04)';img.parentNode.insertBefore(bg,img);img.style.objectFit='contain';img.style.background='rgba(0,0,0,.05)'})
  }
  renderStage=function(){originalRenderStage();applyMagicFill()};
  $('#magicFillBtn').onclick=()=>{S.magicFill=!S.magicFill;$('#magicFillBtn').classList.toggle('on',S.magicFill);renderStage();toast(S.magicFill?'Magic fill activo':'Magic fill desactivado')};
  $('#animateBtn').onclick=()=>{S.animate=!S.animate;document.body.classList.toggle('animate-preview',S.animate);$('#animateBtn').classList.toggle('on',S.animate);toast(S.animate?'Preview animado':'Animación detenida')};

  function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
  async function personCutout(layer){
    const src='https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js';
    await loadScript(src); if(!window.SelfieSegmentation)throw new Error('Segmentation unavailable');
    const img=await loadImage(layer.photo.url); const cv=document.createElement('canvas');cv.width=img.naturalWidth||img.width;cv.height=img.naturalHeight||img.height;const ctx=cv.getContext('2d');
    const seg=new SelfieSegmentation({locateFile:f=>`https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${f}`});seg.setOptions({modelSelection:1});
    const result=await new Promise((res,rej)=>{let done=false;seg.onResults(r=>{if(!done){done=true;res(r)}});seg.send({image:img}).catch(rej)});
    ctx.clearRect(0,0,cv.width,cv.height);ctx.drawImage(result.segmentationMask,0,0,cv.width,cv.height);ctx.globalCompositeOperation='source-in';ctx.drawImage(img,0,0,cv.width,cv.height);ctx.globalCompositeOperation='source-over';
    const blob=await new Promise(res=>cv.toBlob(res,'image/png'));return {id:'cut_'+uid(),name:'cutout.png',url:URL.createObjectURL(blob),avg:layer.photo.avg||[128,128,128],aspect:layer.photo.aspect||1,score:layer.photo.score||0,variance:layer.photo.variance||0,grid:layer.photo.grid||Array(9).fill(0)};
  }
  $('#depthBtn').onclick=async()=>{const l=currentLayer();if(!l||l.type!=='img')return toast('Toca una foto de una persona primero');try{$('#loading').classList.add('on');pushHistory();const sl=selectedSlide();const bg=clone(l);bg.id=uid();bg.z=8;const cut=await personCutout(l);const fg=clone(l);fg.id=uid();fg.photo=cut;fg.z=36;const ix=sl.layers.findIndex(x=>x.id===l.id);sl.layers.splice(ix,1,bg,fg);sl.layers.filter(x=>x.type==='text').forEach(t=>{if(!t.locked)t.z=24});S.selected=fg.id;S.selectedType='img';renderAll();toast('Depth aplicado');}catch(e){console.warn(e);toast('Depth necesita internet y una foto con persona')}finally{$('#loading').classList.remove('on')}};

  const photoGrid=$('#photoSheet .grid3'); if(photoGrid){const hero=document.createElement('button');hero.id='heroPhotoBtn';hero.textContent='★ Hero';photoGrid.appendChild(hero);hero.onclick=()=>{const l=currentLayer();if(!l||l.type!=='img')return;S.heroPhotoId=l.photo.id;l.photo.score=1e8;toast('Foto marcada como hero');saveProject()}}

  $('#slideCountRange').oninput=e=>{const val=+e.target.value;if(val===S.slides.length)return;pushHistory();if(val<S.slides.length)S.slides=S.slides.slice(0,val);else{const favs=favoriteSlides();while(S.slides.length<val){if(favs.length)S.slides.push(variantFromFavorite(favs[S.slides.length%favs.length],S.slides.length));else{const old=[...S.slides];originalBuild();const candidate=clone(S.slides[S.slides.length%Math.max(1,S.slides.length)]||S.slides[0]);S.slides=old;candidate.id=uid();candidate.layers.forEach(l=>l.id=uid());S.slides.push(candidate)}}}S.currentSlide=Math.min(S.currentSlide,S.slides.length-1);renderAll()};

  $('#randomBtn').onclick=()=>{if(!S.slides.length)return;pushHistory();if(S.randomMode==='all'||S.randomMode==='layout'){buildSlides()}else if(S.randomMode==='color'){S.slides.forEach(sl=>{const p=sl.layers.find(l=>l.type==='img')?.photo||heroPhoto();const pal=palFromPhoto(p);sl.palette=pal;sl.bg=rgbToCss(pal[0]);const ink=contrastText(pal[0]);sl.layers.forEach(l=>{if(l.type==='text'&&!l.locked)l.color=Math.random()<.7?ink:rgbToCss(pick(pal.slice(2)));if(l.type==='deco')l.color=rgbToCss(pick(pal.slice(2)))})})}else if(S.randomMode==='type'){S.slides.forEach(sl=>sl.layers.forEach(l=>{if(l.type==='text'&&!l.locked){l.font=pick(FONTS)[0];l.weight=pick([400,700,900]);l.size=rnd(16,62);l.rot=rnd(-8,8)}}))}renderAll();toast('Random listo')};

  const origRenderAll=renderAll;
  renderAll=function(){origRenderAll();$('#smartBtn')?.classList.toggle('on',!!S.smartSelect);$('#magicFillBtn')?.classList.toggle('on',!!S.magicFill);$('#animateBtn')?.classList.toggle('on',!!S.animate);document.body.classList.toggle('animate-preview',!!S.animate)};

  toast('FRAME Director listo');
})();
