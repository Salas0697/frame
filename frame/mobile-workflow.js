/* Direct mobile actions. Each model change is one undoable transaction. */
(()=>{
  const blocked=()=>exportBusy||window.framePhotoImport?.active||document.documentElement.dataset.projectBusy==='true';
  const fixed=sl=>sl.frameLocked||sl.layers.some(l=>l.type==='img'&&l.locked);
  const formats=document.createElement('label');formats.className='formatControl';formats.innerHTML='Formato<select id="frameFormat" aria-label="Formato del carrusel"></select>';
  FrameFormats.options.forEach(f=>formats.querySelector('select').append(new Option(f.name,f.id)));
  document.querySelector('.templateBar').prepend(formats);$('#templateFamily').previousElementSibling.textContent='Template';
  const scope=document.createElement('select');scope.id='variationScope';scope.setAttribute('aria-label','Cambiar composición de');scope.append(new Option('Carrusel','all'),new Option('Esta página','page'));
  $('#fastNewDesign').before(scope);document.querySelector('.albumActions').append($('#compareAlbumBtn'));
  window.FRAME_setFormat=(id,generate=true)=>{
    id=FrameFormats.get(id).id;if(id===(S.frameFormat||'4:5'))return;
    FramePhotoLocation.strip(S.slides);
    S.slides.forEach(sl=>FrameFormats.fitPage(sl,id));S.frameFormat=id;S.frameLastDesign=null;
    if(generate){
      const family=S.frameTemplateFamily,edited=new Map(S.slides.filter(sl=>sl.layers.some(l=>l.userTouched&&!l.frameCaption&&!l.frameLocation||l.type==='text'&&!l.frameCaption&&!l.frameLocation)).map(sl=>[sl.id,sl.frameLocked]));
      S.slides.filter(sl=>edited.has(sl.id)).forEach(sl=>sl.frameLocked=true);S.frameTemplateFamily=family||S.frameArtDirection;
      try{window.FRAME_generateStory()}finally{S.frameTemplateFamily=family;S.slides.filter(sl=>edited.has(sl.id)).forEach(sl=>{const lock=edited.get(sl.id);if(lock===undefined)delete sl.frameLocked;else sl.frameLocked=lock})}
    }
  };
  $('#frameFormat').onchange=e=>{if(blocked())return;pushHistory();window.FRAME_setFormat(e.target.value);renderAll();toast('Composición adaptada · Puedes deshacer')};
  scope.onchange=()=>{S.frameVariationScope=scope.value;sync();saveProject()};
  function group(index){const sl=S.slides[index];return sl?.storySpan?S.slides.filter(s=>s.storySpan?.photoId===sl.storySpan.photoId):sl?[sl]:[]}
  window.FRAME_rebuildStory=()=>{
    if(window.framePhotoImport?.active||exportBusy||!S.photos.length)return false;
    if(S.frameVariationScope!=='page'){if(S.slides.every(fixed)){toast('Libera una página o foto para variar');return false}pushHistory();window.FRAME_generateStory();renderAll();return true}
    const pages=group(S.currentSlide);if(!pages.length||pages.some(fixed)){toast('Libera esta página o foto para variar');return false}
    const ids=new Set(pages.flatMap(sl=>sl.layers.filter(l=>l.type==='img').map(l=>l.photo.id))),photos=S.photos.filter(p=>ids.has(p.id)),first=S.slides.indexOf(pages[0]);
    if(!photos.length){toast('Añade una foto a esta página antes de variar');return false}
    const result=FrameTemplateEngine.generate({catalog:FRAME_TEMPLATE_CATALOG,photos,familyId:S.frameTemplateFamily||pages[0].frameFamily,format:S.frameFormat,brief:{...S.frameBrief,purpose:'showcase'},previous:{signature:FrameTemplateEngine.signature(pages),visualSignature:FrameTemplateEngine.visualSignature(pages),layouts:pages.map(sl=>sl.frameLayout),recentGeometry:pages.map(FrameTemplateEngine.geometry)},seed:Date.now()>>>0,backgroundMode:S.frameBackground,backgroundColor:S.frameBackgroundColor,frameTreatment:S.frameTreatment});
    if(pages[0].frameBackgroundOverride)result.slides.forEach(sl=>{sl.frameBackgroundOverride=clone(pages[0].frameBackgroundOverride);FramePhotoColors.paint(sl,FramePhotoColors.resolve(sl.frameBackgroundOverride.mode,FramePhotoColors.pagePhotos(sl),sl.frameBackgroundOverride.color))});
    // User notes travel with this page; location has a separate global reservation.
    result.slides.forEach(sl=>{const settings=pages[0].frameDesignOverride||S.frameDesign;if(pages[0].frameDesignOverride)sl.frameDesignOverride=clone(settings);FrameDesign.apply(sl,settings)});
    const notes=pages.flatMap(sl=>sl.layers.filter(l=>l.type==='text'&&!l.frameLocation));if(notes.length)result.slides[0].layers.push(...clone(notes));
    pushHistory();S.slides.splice(first,pages.length,...result.slides);S.currentSlide=first;S.selected=S.selectedType=null;renderAll();toast('Esta página tiene otra composición');return true;
  };
  $('#remixSlideBtn').onclick=()=>{S.frameVariationScope='page';window.FRAME_rebuildStory()};

  const nav=document.createElement('nav');nav.className='pageNavigation';nav.setAttribute('aria-label','Navegación de páginas');nav.innerHTML='<button id="pageBack" aria-label="Página anterior">‹</button><select id="pageJump" aria-label="Ir a página"></select><button id="pageForward" aria-label="Página siguiente">›</button><button id="pageOrder">Ordenar</button>';document.body.append(nav);
  $('#pageBack').onclick=()=>goToSlide(S.currentSlide-1);$('#pageForward').onclick=()=>goToSlide(S.currentSlide+1);$('#pageJump').onchange=e=>goToSlide(+e.target.value);
  function moveTo(index,to){
    if(blocked())return;const moving=group(index),target=group(to);if(!moving.length||!target.length||moving.includes(target[0]))return;
    pushHistory();const left=to<index,remaining=S.slides.filter(sl=>!moving.includes(sl)),at=remaining.indexOf(left?target[0]:target.at(-1))+(left?0:1);remaining.splice(at,0,...moving);S.slides=remaining;S.currentSlide=at;S.selected=S.selectedType=null;renderAll();
  }
  window.FRAME_movePageTo=moveTo;
  $('#prevSlideBtn').onclick=()=>moveTo(S.currentSlide,S.currentSlide-1);$('#nextSlideBtn').onclick=()=>{const g=group(S.currentSlide);moveTo(S.currentSlide,S.slides.indexOf(g.at(-1))+1)};
  const order=document.createElement('dialog');order.id='pageOrderDialog';order.innerHTML='<header><b>Orden de páginas</b><button id="closePageOrder">Listo</button></header><p>Las panorámicas se mueven juntas.</p><div id="pageOrderRows"></div>';document.body.append(order);
  function orderRows(){
    const rows=$('#pageOrderRows');rows.replaceChildren();let last=null;
    S.slides.forEach((sl,i)=>{if(sl.storySpan&&last===sl.storySpan.photoId)return;last=sl.storySpan?.photoId;const pages=group(i),row=document.createElement('div');row.className='orderRow';const label=document.createElement('button');label.textContent=pages.length>1?'Páginas '+(i+1)+'–'+(i+pages.length):'Página '+(i+1);label.setAttribute('aria-current',String(i===S.currentSlide));label.onclick=()=>{goToSlide(i);order.close()};
      const prev=document.createElement('button'),next=document.createElement('button');prev.textContent='↑';next.textContent='↓';prev.setAttribute('aria-label','Subir página '+(i+1));next.setAttribute('aria-label','Bajar página '+(i+1));prev.disabled=i===0||blocked();next.disabled=i+pages.length===S.slides.length||blocked();prev.onclick=()=>{moveTo(i,i-1);orderRows()};next.onclick=()=>{moveTo(i,i+pages.length);orderRows()};row.append(label,prev,next);rows.append(row)});
  }
  $('#pageOrder').onclick=()=>{orderRows();order.showModal()};$('#closePageOrder').onclick=()=>order.close();order.addEventListener('close',()=>$('#pageOrder').focus({preventScroll:true}));

  const replacement=document.createElement('dialog');replacement.id='photoReplacement';replacement.setAttribute('aria-labelledby','replacementTitle');replacement.innerHTML='<header><b id="replacementTitle">Reemplazar foto</b><button id="cancelReplacement">Cancelar</button></header><p id="replacementStatus" role="status"></p><p>El marco y el diseño se conservan. Podrás ajustar el nuevo encuadre.</p><button id="replaceFromDevice">Elegir una foto del celular</button><p>O usa una foto del proyecto</p><div id="replacementPhotos"></div>';document.body.append(replacement);
  const picker=document.createElement('input');picker.id='replacePhotoInput';picker.type='file';picker.accept='image/*';picker.hidden=true;document.body.append(picker);let target=null,returnFocus=null;
  function selectedTarget(){const layer=currentLayer();return layer?.type==='img'?{project:S,layer,slide:selectedSlide()}:null}
  function commit(photo,t=target||selectedTarget()){
    if(!t||t.project!==S||!S.slides.includes(t.slide)||!t.slide.layers.includes(t.layer))return false;
    const l=t.layer;if(l.photo.id===photo.id)return false;
    if(l.storySpan&&!FrameTemplateEngine.canSpread(photo,l.storySpanCount,...imgSize())){toast('Esta panorámica necesita una foto horizontal sin rostros en las uniones');return false}
    const c=FrameTemplateEngine.crop(photo,l.w,l.h),fit=l.fit==='contain'||photo.faceAnalysisStatus==='unavailable'||!c.safe?'contain':'cover';
    pushHistory();if(!S.photos.some(p=>p.id===photo.id)){S.photos.push(photo);S.storageReady=false}const oldId=l.photo.id,targets=l.storySpan?S.slides.flatMap(sl=>sl.layers).filter(x=>x.storySpan&&x.photo.id===oldId):[l];
    targets.forEach(x=>{Object.assign(x,{photo,fit,zoom:1,offX:fit==='cover'?c.offX:0,offY:fit==='cover'?c.offY:0,userTouched:true});if(photo.faceAnalysisStatus==='unavailable'||photo.faceCount||photo.faceUnion)delete x.frameCut});
    if(l.storySpan)S.slides.filter(sl=>sl.storySpan?.photoId===oldId).forEach(sl=>sl.storySpan.photoId=photo.id);
    S.frameInactivePhotoIds=(S.frameInactivePhotoIds||[]).filter(id=>id!==photo.id);if(!S.slides.some(sl=>sl.layers.some(x=>x.type==='img'&&x.photo.id===oldId)))S.frameInactivePhotoIds.push(oldId);
    if(t.slide.frameHero&&S.heroPhotoId===oldId)S.heroPhotoId=photo.id;
    S.selected=l.id;S.selectedType='img';replacement.close();renderAll();saveProject();toast('Foto reemplazada · Reencuadra si lo necesitas');return true;
  }
  window.FRAME_replacePhoto=photo=>{if(!blocked()&&photo)return commit(photo,selectedTarget())};
  window.FRAME_openReplacement=()=>{
    if(blocked()||!selectedTarget())return;target=selectedTarget();$('#replacementStatus').textContent='';returnFocus=document.activeElement;closeSheets();const grid=$('#replacementPhotos');grid.replaceChildren();
    S.photos.forEach(photo=>{const button=document.createElement('button'),im=document.createElement('img');im.src=photo.url;im.alt=photo.name;im.loading='lazy';button.setAttribute('aria-label','Usar '+photo.name);button.disabled=photo.id===target.layer.photo.id||(target.layer.storySpan&&!FrameTemplateEngine.canSpread(photo,target.layer.storySpanCount,...imgSize()));button.append(im);button.onclick=()=>commit(photo);grid.append(button)});replacement.showModal();
  };
  $('#cancelReplacement').onclick=()=>replacement.close();replacement.addEventListener('close',()=>{target=null;$('#replacementPhotos').replaceChildren();returnFocus?.isConnected&&returnFocus.focus({preventScroll:true})});
  $('#replaceFromDevice').onclick=()=>{if(blocked())return;picker.value='';picker.click()};
  picker.onchange=()=>{const file=picker.files[0],t=target;picker.value='';if(!file||!t)return;void window.FRAME_projectTask(async()=>{
    let photos=[],committed=false;const loading=$('#loading');
    try{loading.classList.add('on');$('#replaceFromDevice').disabled=true;$('#replacementPhotos').querySelectorAll('button').forEach(b=>b.disabled=true);photos=await FramePhotoAnalysis.analyzePhotos([file],message=>{loading.querySelector('b').textContent=message;$('#replacementStatus').textContent=message},S.frameBrief);const photo=photos[0];
      if(t.project!==S||target!==t||!replacement.open)return;
      // Keep originals available for undo. Never overwrite or revoke the prior photo.
      committed=commit(photo,t);if(!committed)return;S.storageReady=false;
      try{await FramePhotoStore.put([file],[photo]);S.storageReady=true;if(!saveProject())throw Error('Metadata unavailable')}
      catch(error){S.storageReady=false;console.warn('Replacement storage failed',error);toast('Foto lista. Guarda una copia del proyecto antes de cerrar.')}
      renderAll();
    }catch(error){console.warn('Replacement failed',error);toast('No pude abrir esa foto. El carrusel se conserva.')}
    finally{if(!committed)photos.forEach(p=>URL.revokeObjectURL(p.url));loading.classList.remove('on');$('#replaceFromDevice').disabled=false;if(replacement.open&&target===t)$('#replacementPhotos').querySelectorAll('button').forEach((b,i)=>{const p=S.photos[i];b.disabled=p.id===t.layer.photo.id||(t.layer.storySpan&&!FrameTemplateEngine.canSpread(p,t.layer.storySpanCount,...imgSize()))})}
  })};
  const pin=document.createElement('button');pin.id='pePinPhoto';pin.className='peHero';pin.textContent='Fijar foto en esta composición';$('#peHero').before(pin);
  pin.onclick=()=>{const l=currentLayer();if(!l||blocked())return;$('#peDone').click();l.locked=!l.locked;renderAll();toast(l.locked?'Foto fijada para Otra opción':'Foto liberada')};
  document.addEventListener('click',e=>{if(e.target.id==='uxEdit')pin.textContent=currentLayer()?.locked?'Liberar foto':'Fijar foto en esta composición'},{capture:true});
  function sync(){
    const count=S.slides.length,[W,H]=imgSize();document.documentElement.style.setProperty('--film-height',Math.min(92,64*H/W)+'px');
    $('#frameFormat').value=S.frameFormat||'4:5';$('#frameFormat').disabled=blocked()||!count;scope.value=S.frameVariationScope||'all';scope.disabled=blocked()||!count;
    $('#pageJump').replaceChildren(...S.slides.map((_,i)=>new Option((i+1)+' / '+count,String(i))));$('#pageJump').value=String(S.currentSlide);$('#pageBack').disabled=blocked()||!S.currentSlide;$('#pageForward').disabled=blocked()||S.currentSlide>=count-1;$('#pageOrder').disabled=blocked()||count<2;nav.hidden=!count;
    $('#fastNewDesign').textContent=S.frameVariationScope==='page'?'✦ Variar página':'✦ Otra opción';$('#pageJump').disabled=blocked();
  }
  FrameLifecycle.on('afterRender',sync);document.addEventListener('frame:page-change',sync);new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['data-project-busy']});
  const css=document.createElement('style');css.textContent=`
    .pageControls .badge,.pageControls .pagePin{z-index:auto}.studioTop{padding-top:6px}.studioTop h2{display:none}.studioTop .subline{margin-top:4px}.formatControl{display:flex;align-items:center;gap:8px;width:100%;color:#aaa}.formatControl select{flex:1}.quickbar{grid-template-columns:.7fr 1fr 1.3fr}.quickbar #variationScope{grid-column:2;grid-row:1;min-width:0;min-height:44px;background:#19191b;border:1px solid #373738;border-radius:12px;color:#eee;padding:0 12px;font-size:12px}.quickbar #compareAlbumBtn{grid-column:3;grid-row:1}.quickbar #fastNewDesign{grid-column:3;grid-row:1}.quickbar #fastAdd{grid-column:1;grid-row:1}
    .filmstrip{height:var(--film-height,80px);align-items:center;padding-top:3px;padding-bottom:3px;background:#0b0b0eee}.filmstrip .thumb{max-height:92px}.pageNavigation{position:fixed;left:12px;right:12px;bottom:calc(var(--film-height,80px) + 22px + env(safe-area-inset-bottom));z-index:64;display:flex;justify-content:center;gap:6px;padding:4px;background:#121214ed;border:1px solid #343437;border-radius:14px}.pageNavigation[hidden]{display:none}.pageNavigation button,.pageNavigation select{min-height:44px;border-radius:10px;background:#232326;color:#eee;padding:0 12px;font-size:12px;border:0}.pageNavigation select{flex:1;max-width:140px}.pageNavigation button:disabled{opacity:.35}.pager,.contextBar{display:none!important}.editHint{bottom:calc(var(--film-height,80px) + 84px + env(safe-area-inset-bottom));max-width:calc(100% - 20px);white-space:nowrap}.editHint button{padding:0 10px;font-size:11px}.editHint button[hidden]{display:none}.bottomSpace{height:200px}.toast{bottom:calc(var(--film-height,80px) + 145px + env(safe-area-inset-bottom))}body.sheetOpen .pageNavigation{pointer-events:none;opacity:.18}
    #photoReplacement,#pageOrderDialog{width:calc(100% - 24px);max-width:520px;max-height:calc(100dvh - 32px);box-sizing:border-box;overflow:auto;background:#151517;color:#eee;border:1px solid #444;border-radius:18px;padding:16px}#photoReplacement::backdrop,#pageOrderDialog::backdrop{background:#000b}#photoReplacement header,#pageOrderDialog header{display:flex;align-items:center;justify-content:space-between;gap:8px}#photoReplacement p,#pageOrderDialog p{font-size:12px;line-height:1.5;color:#aaa}#photoReplacement button,#pageOrderDialog button{min-height:44px;border:1px solid #414144;border-radius:10px;padding:0 12px;background:#252528;color:#eee;font-size:12px}#replaceFromDevice{width:100%;background:#eee!important;color:#111!important}#replacementPhotos{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}#replacementPhotos button{padding:0;overflow:hidden;aspect-ratio:1}#replacementPhotos img{width:100%;height:100%;object-fit:cover}#replacementPhotos button:disabled{opacity:.35}.orderRow{display:flex;gap:8px;margin:8px 0}.orderRow button:first-child{flex:1;text-align:left}.orderRow button[aria-current=true]{border-color:#eee!important}.orderRow button:disabled{opacity:.35}#pePinPhoto{margin-bottom:8px}
    @media(max-width:360px){.nav{padding-left:10px;padding-right:10px}.nav .chipBtn{padding:0 9px}.logo{font-size:15px}.quickbar{gap:5px}.quickbar button{font-size:10px}.editHint button{padding:0 8px}}
  `;document.head.append(css);sync();
})();
