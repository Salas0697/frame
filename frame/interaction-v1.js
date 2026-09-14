(()=>{
  const INTERACTION_VERSION='Interaction v1';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const dist=(a,b)=>Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
  const angle=(a,b)=>Math.atan2(b.clientY-a.clientY,b.clientX-a.clientX);
  const mid=(a,b)=>({x:(a.clientX+b.clientX)/2,y:(a.clientY+b.clientY)/2});
  const sc=()=>framePreviewWidth()/340;
  let gestureActive=false;

  const style=document.createElement('style');
  style.textContent=`
    :root{--tap:rgba(255,255,255,.08);--spring:cubic-bezier(.2,.85,.2,1)}
    button,.choice,.pill,.tool,.thumb{touch-action:manipulation}
    button{min-height:44px;transition:transform .12s ease,opacity .12s ease,background .16s ease}
    button:active,.choice:active,.pill:active,.tool:active,.thumb:active{transform:scale(.96);opacity:.86}
    .pill{min-height:38px;display:inline-flex;align-items:center;justify-content:center}
    .tool{min-height:58px}.tool .ico{transition:transform .16s var(--spring)}.tool:active .ico{transform:scale(.86)}
    .toolbar{scroll-snap-type:x proximity;padding-bottom:14px}.toolbar .pill{scroll-snap-align:start}
    .canvasWrap{scroll-behavior:smooth;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch}
    .slide{transition:transform .24s var(--spring),box-shadow .24s ease,filter .24s ease}
    .slide.isCurrent{transform:scale(1);box-shadow:0 28px 70px rgba(0,0,0,.5)}
    .slide:not(.isCurrent){transform:scale(.985)}
    .sel{outline:2px solid rgba(255,255,255,.9)!important;outline-offset:3px!important}
    .imgLayer,.textLayer{will-change:transform,left,top,object-position,font-size}
    .imgLayer.isManipulating,.textLayer.isManipulating{outline:2px solid rgba(255,255,255,.95)!important;outline-offset:4px!important}
    .interactionScrim{position:fixed;inset:0;z-index:74;background:rgba(0,0,0,.32);backdrop-filter:blur(4px);opacity:0;pointer-events:none;transition:opacity .2s ease}
    .interactionScrim.on{opacity:1;pointer-events:auto}
    .sheet{z-index:80;transition:transform .28s var(--spring)!important;will-change:transform}
    .sheet.dragging{transition:none!important}
    .grab{height:5px!important;width:42px!important;background:#4a4a52!important;cursor:grab}
    .sheetTop{position:sticky;top:0;background:#141417;z-index:2;padding-top:2px}
    .snapGuide{position:absolute;z-index:230;pointer-events:none;background:rgba(140,214,255,.95);opacity:0;transition:opacity .08s ease}
    .snapGuide.v{top:0;bottom:0;width:1px;left:50%}.snapGuide.h{left:0;right:0;height:1px;top:50%}.snapGuide.on{opacity:1}
    .contextBar{position:fixed;left:50%;transform:translateX(-50%) translateY(8px);bottom:calc(164px + env(safe-area-inset-bottom));z-index:65;display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:999px;background:rgba(22,22,26,.88);border:1px solid rgba(255,255,255,.09);backdrop-filter:blur(22px);box-shadow:0 14px 40px rgba(0,0,0,.32);opacity:0;pointer-events:none;transition:.2s var(--spring);font-size:10px;color:#d6d6dc;white-space:nowrap}
    .contextBar.on{opacity:1;transform:translateX(-50%) translateY(0)}
    .contextBar b{color:#fff}.contextBar .dotx{width:6px;height:6px;border-radius:50%;background:#fff}
    .pager{position:fixed;right:18px;bottom:calc(166px + env(safe-area-inset-bottom));z-index:64;padding:6px 9px;border-radius:999px;background:rgba(16,16,19,.72);border:1px solid rgba(255,255,255,.07);backdrop-filter:blur(18px);font-size:10px;color:#aaaab2;transition:.18s ease}
    .photoModeMini{display:flex;gap:6px;margin-top:10px}.photoModeMini button{flex:1;min-height:42px;border:1px solid #2c2c32;border-radius:14px;background:#0d0d10;font-size:11px}.photoModeMini button.on{background:#efeff1;color:#111;border-color:#efeff1}
    body.gestureLock .canvasWrap{overflow-x:hidden!important;scroll-snap-type:none!important}
    body.sheetOpen .dock{transform:translateY(10px);opacity:.25;pointer-events:none;transition:.2s ease}
    body.sheetOpen .filmstrip{opacity:.18;pointer-events:none;transition:.2s ease}
  `;
  document.head.appendChild(style);

  const scrim=document.createElement('div'); scrim.className='interactionScrim'; document.body.appendChild(scrim);
  const context=document.createElement('div'); context.className='contextBar'; context.innerHTML='<span class="dotx"></span><b>Seleccionado</b><span id="contextText"></span>'; document.body.appendChild(context);
  const pager=document.createElement('div'); pager.className='pager'; document.body.appendChild(pager);

  function updateSheetState(){
    const any=$$('.sheet.on').length>0;
    scrim.classList.toggle('on',any); document.body.classList.toggle('sheetOpen',any);
  }
  scrim.addEventListener('click',()=>{closeSheets();updateSheetState()});
  const mo=new MutationObserver(updateSheetState); $$('.sheet').forEach(s=>mo.observe(s,{attributes:true,attributeFilter:['class']}));

  function wireSheet(sheet){
    const grab=sheet.querySelector('.grab'); if(!grab||grab.dataset.interactionBound)return; grab.dataset.interactionBound='1';
    let sy=0,dy=0,dragging=false;
    const begin=e=>{const t=e.touches?.[0]; if(!t)return; sy=t.clientY;dy=0;dragging=true;sheet.classList.add('dragging')};
    const move=e=>{if(!dragging)return; const t=e.touches?.[0]; if(!t)return; dy=Math.max(0,t.clientY-sy); if(dy>0){e.preventDefault();sheet.style.transform=`translateY(${dy}px)`}};
    const end=()=>{if(!dragging)return;dragging=false;sheet.classList.remove('dragging');sheet.style.transform='';if(dy>86){sheet.classList.remove('on');updateSheetState()}}
    grab.addEventListener('touchstart',begin,{passive:true}); grab.addEventListener('touchmove',move,{passive:false}); grab.addEventListener('touchend',end,{passive:true});
  }
  function wireAllSheets(){$$('.sheet').forEach(wireSheet);updateSheetState()}
  wireAllSheets();

  const _openSheet=openSheet; openSheet=function(id){_openSheet(id); requestAnimationFrame(()=>{wireAllSheets();updateSheetState()})};
  const _closeSheets=closeSheets; closeSheets=function(){_closeSheets();requestAnimationFrame(updateSheetState)};

  function updatePager(){
    pager.textContent=`${String((S.currentSlide||0)+1).padStart(2,'0')} / ${String(Math.max(1,S.slides.length)).padStart(2,'0')}`;
    $$('.slide').forEach((el,i)=>el.classList.toggle('isCurrent',i===S.currentSlide));
  }
  const _renderFilmstrip=renderFilmstrip; renderFilmstrip=function(){_renderFilmstrip();updatePager()};
  const _goToSlide=goToSlide; goToSlide=function(i){_goToSlide(i);updatePager()};

  function setSelected(slideI,id,type){
    S.currentSlide=slideI; S.selected=id; S.selectedType=type;
    S.slides[slideI]?.layers.find(x=>x.id===id);
    $('#contextText').textContent=type==='img'?(S.photoEditMode==='move'?'Foto · mover marco':'Foto · reencuadrar'):'Texto · mover / pellizcar';
    context.classList.add('on'); clearTimeout(context._t); context._t=setTimeout(()=>context.classList.remove('on'),1800);
    renderFilmstrip(); renderSheets(); saveProject();
  }

  function ensureGuides(slide){
    if(!slide.querySelector('.snapGuide.v')){const v=document.createElement('div');v.className='snapGuide v';slide.appendChild(v);const h=document.createElement('div');h.className='snapGuide h';slide.appendChild(h)}
    return {v:slide.querySelector('.snapGuide.v'),h:slide.querySelector('.snapGuide.h')};
  }
  function lockCanvas(on){gestureActive=on;document.body.classList.toggle('gestureLock',on)}

  bindObjects=function(){
    $$('.textLayer').forEach(bindTextDirect);
    $$('.imgLayer').forEach(bindImgDirect);
  };

  function bindTextDirect(el){
    if(el.dataset.directBound)return; el.dataset.directBound='1';
    const slideI=+el.dataset.slide,id=el.dataset.id;
    let st=null,moved=false;
    el.addEventListener('touchstart',e=>{
      const l=S.slides[slideI]?.layers.find(x=>x.id===id); if(!l)return;
      setSelected(slideI,id,'text');
      if(l.locked){toast('Texto bloqueado');return}
      lockCanvas(true); el.classList.add('isManipulating'); moved=false;
      if(e.touches.length===1){const t=e.touches[0];st={mode:'drag',sx:t.clientX,sy:t.clientY,bx:l.x,by:l.y}}
      else if(e.touches.length>=2){const a=e.touches[0],b=e.touches[1],m=mid(a,b);st={mode:'pinch',sd:dist(a,b),sa:angle(a,b),ss:l.size,sr:l.rot,sx:m.x,sy:m.y,bx:l.x,by:l.y}}
    },{passive:true});
    el.addEventListener('touchmove',e=>{
      if(!st)return; const l=S.slides[slideI]?.layers.find(x=>x.id===id);if(!l||l.locked)return; e.preventDefault(); moved=true; const scale=sc(); const slide=el.closest('.slide'),g=ensureGuides(slide);
      if(e.touches.length>=2){const a=e.touches[0],b=e.touches[1],m=mid(a,b); if(st.mode!=='pinch'){st={mode:'pinch',sd:dist(a,b),sa:angle(a,b),ss:l.size,sr:l.rot,sx:m.x,sy:m.y,bx:l.x,by:l.y}}; l.size=clamp(st.ss*(dist(a,b)/Math.max(1,st.sd)),14,160); l.rot=st.sr+(angle(a,b)-st.sa)*180/Math.PI; l.x=st.bx+(m.x-st.sx)/scale; l.y=st.by+(m.y-st.sy)/scale; }
      else {const t=e.touches[0];l.x=st.bx+(t.clientX-st.sx)/scale;l.y=st.by+(t.clientY-st.sy)/scale}
      const cx=l.x+l.w/2, cy=l.y+l.size*.48; const snapX=Math.abs(cx-170)<7, snapY=Math.abs(cy-212.5)<7; if(snapX)l.x=170-l.w/2;if(snapY)l.y=212.5-l.size*.48;g.v.classList.toggle('on',snapX);g.h.classList.toggle('on',snapY);
      el.style.left=(l.x*scale)+'px';el.style.top=(l.y*scale)+'px';el.style.fontSize=(l.size*scale)+'px';el.style.transform=`rotate(${l.rot}deg)`;
    },{passive:false});
    const finish=()=>{if(!st)return;st=null;lockCanvas(false);el.classList.remove('isManipulating');const slide=el.closest('.slide');slide?.querySelectorAll('.snapGuide').forEach(g=>g.classList.remove('on'));saveProject();renderFilmstrip()};
    el.addEventListener('touchend',finish,{passive:true});el.addEventListener('touchcancel',finish,{passive:true});
    el.addEventListener('click',e=>{if(moved){moved=false;e.preventDefault();e.stopPropagation();return}setSelected(slideI,id,'text');renderStage();renderTextSheet();openSheet('#textSheet')});
    el.addEventListener('dblclick',()=>{setSelected(slideI,id,'text');renderStage();renderTextSheet();openSheet('#textSheet');setTimeout(()=>$('#textInput')?.focus(),80)});
  }

  function bindImgDirect(el){
    if(el.dataset.directBound)return; el.dataset.directBound='1';
    const slideI=+el.dataset.slide,id=el.dataset.id;
    let st=null,moved=false;
    el.addEventListener('touchstart',e=>{
      const l=S.slides[slideI]?.layers.find(x=>x.id===id); if(!l)return;
      setSelected(slideI,id,'img');
      if(l.locked){toast('Foto bloqueada');return}
      lockCanvas(true); el.classList.add('isManipulating');moved=false;
      if(e.touches.length===1){const t=e.touches[0];st={mode:'drag',sx:t.clientX,sy:t.clientY,bx:l.x,by:l.y,boX:l.offX,boY:l.offY}}
      else if(e.touches.length>=2){const a=e.touches[0],b=e.touches[1],m=mid(a,b);st={mode:'pinch',sd:dist(a,b),sz:l.zoom,sx:m.x,sy:m.y,bx:l.x,by:l.y,boX:l.offX,boY:l.offY}}
    },{passive:true});
    el.addEventListener('touchmove',e=>{
      if(!st)return; const l=S.slides[slideI]?.layers.find(x=>x.id===id);if(!l||l.locked)return;e.preventDefault();moved=true;const scale=sc();
      if(e.touches.length>=2){const a=e.touches[0],b=e.touches[1],m=mid(a,b);if(st.mode!=='pinch')st={mode:'pinch',sd:dist(a,b),sz:l.zoom,sx:m.x,sy:m.y,bx:l.x,by:l.y,boX:l.offX,boY:l.offY};l.zoom=clamp(st.sz*(dist(a,b)/Math.max(1,st.sd)),1,3);if(S.photoEditMode==='move'){l.x=st.bx+(m.x-st.sx)/scale;l.y=st.by+(m.y-st.sy)/scale}else{l.offX=clamp(st.boX+(m.x-st.sx)*.12,-48,48);l.offY=clamp(st.boY+(m.y-st.sy)*.12,-48,48)}}
      else {const t=e.touches[0],dx=t.clientX-st.sx,dy=t.clientY-st.sy;if(S.photoEditMode==='move'){l.x=st.bx+dx/scale;l.y=st.by+dy/scale}else{l.offX=clamp(st.boX+dx*.12,-48,48);l.offY=clamp(st.boY+dy*.12,-48,48)}}
      el.style.left=(l.x*scale)+'px';el.style.top=(l.y*scale)+'px';el.style.transform=`rotate(${l.rot}deg) scale(${l.zoom})`;el.style.objectPosition=`${50+l.offX}% ${50+l.offY}%`;
      const zr=$('#zoomRange');if(zr&&S.selected===id)zr.value=l.zoom;
      $('#contextText').textContent=S.photoEditMode==='move'?'Foto · mover marco':'Foto · reencuadrar';
    },{passive:false});
    const finish=()=>{if(!st)return;st=null;lockCanvas(false);el.classList.remove('isManipulating');saveProject();renderFilmstrip()};
    el.addEventListener('touchend',finish,{passive:true});el.addEventListener('touchcancel',finish,{passive:true});
    el.addEventListener('click',e=>{if(moved){moved=false;e.preventDefault();e.stopPropagation();return}setSelected(slideI,id,'img');renderStage();renderPhotoSheet();openSheet('#photoSheet')});
    el.addEventListener('dblclick',()=>{const l=S.slides[slideI]?.layers.find(x=>x.id===id);if(!l)return;pushHistory();l.zoom=1;l.offX=0;l.offY=0;renderStage();renderPhotoSheet();saveProject();toast('Encuadre reiniciado')});
  }

  const photoSheet=$('#photoSheet');
  if(photoSheet && !$('#interactionModeMini')){
    const mini=document.createElement('div');mini.className='photoModeMini';mini.id='interactionModeMini';mini.innerHTML='<button data-pmode="crop">Reencuadrar</button><button data-pmode="move">Mover marco</button>';
    const hint=photoSheet.querySelector('.hint');(hint||photoSheet.querySelector('.grid3'))?.insertAdjacentElement('beforebegin',mini);
    mini.onclick=e=>{const b=e.target.closest('[data-pmode]');if(!b)return;S.photoEditMode=b.dataset.pmode;syncPhotoModes();$('#contextText').textContent=S.photoEditMode==='move'?'Foto · mover marco':'Foto · reencuadrar';toast(S.photoEditMode==='move'?'Ahora mueves el marco':'Ahora reencuadras la foto')};
  }
  function syncPhotoModes(){$$('#interactionModeMini [data-pmode]').forEach(b=>b.classList.toggle('on',b.dataset.pmode===S.photoEditMode));$('#moveModeBtn')?.classList.toggle('on',S.photoEditMode==='move');$('#cropModeBtn')?.classList.toggle('on',S.photoEditMode==='crop')}
  $('#moveModeBtn')?.addEventListener('click',()=>{S.photoEditMode='move';syncPhotoModes()});$('#cropModeBtn')?.addEventListener('click',()=>{S.photoEditMode='crop';syncPhotoModes()});

  let dragThumb=null;
  $('#filmstrip')?.addEventListener('touchstart',e=>{const th=e.target.closest('.thumb');if(!th)return;dragThumb={el:th,sx:e.touches[0].clientX,scroll:$('#filmstrip').scrollLeft}}, {passive:true});
  $('#filmstrip')?.addEventListener('touchmove',e=>{if(!dragThumb)return;const dx=e.touches[0].clientX-dragThumb.sx;if(Math.abs(dx)>6)$('#filmstrip').scrollLeft=dragThumb.scroll-dx},{passive:true});
  $('#filmstrip')?.addEventListener('touchend',()=>dragThumb=null,{passive:true});

  $('#textInput')?.addEventListener('focus',()=>setTimeout(()=>$('#textSheet')?.scrollIntoView({block:'end',behavior:'smooth'}),120));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeSheets();updateSheetState()}});

  const _renderAll=renderAll; renderAll=function(){_renderAll();wireAllSheets();updatePager();syncPhotoModes()};
  renderStage();renderFilmstrip();wireAllSheets();updatePager();syncPhotoModes();
  toast('Interacción refinada');
})();