/* Application adapter for the catalog engine; no legacy generation or file listeners. */
(() => {
  const catalog = window.FRAME_TEMPLATE_CATALOG;
  const engine = window.FrameTemplateEngine;
  let generation = 0;
  function buildStory() {
    if (!S.photos?.length) return;
    const seed = (Date.now() + (++generation) * 7919 + Math.floor(Math.random()*1e6)) >>> 0;
    const fixed=S.slides.map((sl,index)=>({sl,index})).filter(x=>x.sl.frameLocked);
    const retained=new Set(fixed.flatMap(x=>x.sl.layers.filter(l=>l.type==='img').map(l=>l.photo.id)));
    const available=S.photos.filter(p=>!retained.has(p.id));
    const result = engine.generate({catalog, photos:available, brief:S.frameBrief,
      familyId:S.frameTemplateFamily, previous:S.frameLastDesign, seed, caption:S.frameCaption,heroPhotoId:S.heroPhotoId,backgroundMode:S.frameBackground,frameTreatment:S.frameTreatment});
    result.slides.forEach(sl => {
      const photo = sl.layers.find(l=>l.type==='img')?.photo;
      sl.palette = palFromPhoto(photo);
    });
    fixed.forEach(({sl,index})=>result.slides.splice(Math.min(index,result.slides.length),0,sl));
    S.slides = result.slides;
    S.frameArtDirection = result.familyId||S.frameArtDirection;
    S.frameLastDesign = {dir:S.frameArtDirection,signature:engine.signature(result.slides),layouts:result.slides.map(sl=>sl.frameLayout),recentFamilies:result.recentFamilies||S.frameLastDesign?.recentFamilies||[]};
    S.currentSlide = 0; S.selected = null; S.selectedType = null;
  }
  window.FRAME_togglePageLock = index => {
    const sl=S.slides[index];if(!sl)return;pushHistory();
    const locked=!sl.frameLocked;
    S.slides.filter(p=>p===sl||(sl.storySpan&&p.storySpan?.photoId===sl.storySpan.photoId)).forEach(p=>p.frameLocked=locked);
    renderAll();saveProject();toast(locked?'Esta página se conserva en Otra opción':'Página liberada');
  };
  window.FRAME_generateStory = buildStory;
  window.FRAME_rebuildStory = () => {
    if (!S.photos?.length || window.framePhotoImport?.phase === 'brief') return;
    pushHistory(); buildStory(); renderAll(); saveProject();
    toast('Otra composición lista ✦');
  };

  const bar = document.createElement('div');
  bar.className = 'templateBar';
  const label = document.createElement('label'); label.htmlFor='templateFamily'; label.textContent='Estilo';
  const select = document.createElement('select'); select.id='templateFamily';
  select.append(new Option('Automático · según tu brief',''));
  catalog.families.forEach(f=>select.append(new Option(f.name,f.id)));
  const notes = document.createElement('details'); notes.className='templateNotes';
  const summary = document.createElement('summary'); summary.textContent='Nota al pie';
  const input = document.createElement('input'); input.id='templateCaption'; input.maxLength=120;
  input.placeholder='Una nota breve para este álbum'; input.setAttribute('aria-label','Nota al pie del álbum');
  notes.append(summary,input); bar.append(label,select,notes);
  const finish=document.createElement('details');finish.className='editorialFinish';
  finish.innerHTML='<summary>Fondo y marco</summary><div class="finishControls"><label>Fondo<select id="frameBackground" aria-label="Fondo del álbum"><option value="auto">Según el estilo</option><option value="white">Blanco</option><option value="black">Negro</option><option value="color">Color intenso</option></select></label><label>Marco<select id="frameTreatment" aria-label="Marco editorial"><option value="gallery">Galería</option><option value="mat">Paspartú</option><option value="fine">Filete fino</option><option value="print">Papel fotográfico</option><option value="darkroom">Montaje negro</option></select></label></div>';
  bar.append(finish);
  const collectionNote=document.createElement('p');collectionNote.className='collectionNote';collectionNote.id='collectionNote';collectionNote.setAttribute('aria-live','polite');bar.insertBefore(collectionNote,notes);
  const location=document.createElement('details');location.className='editorialFinish';
  location.innerHTML='<summary>Locación</summary><div class="locationControls"><label for="locationPosition">Una sola nota</label><select id="locationPosition"><option value="off">Sin locación</option><option value="first">En la primera</option><option value="middle">En el medio</option><option value="last">Al final</option></select><label for="locationText">Lugar</label><input id="locationText" maxlength="80" placeholder="Escribe el lugar" autocomplete="off"><p id="locationStatus" class="locationHint" role="status"></p><p class="locationHint">Localidades aproximadas · <a href="https://www.geonames.org/" target="_blank" rel="noopener">GeoNames</a> / <a href="https://github.com/lutangar/cities.json" target="_blank" rel="noopener">cities.json</a> · CC BY 4.0. Sin enviar coordenadas.</p></div>';
  bar.append(location);
  function changeLocation(event){
    if($('#locationPosition').disabled)return;
    pushHistory();const position=$('#locationPosition').value,text=FramePhotoLocation.clean($('#locationText').value);
    S.frameLocation={...(S.frameLocation||{}),enabled:position!=='off',position:position==='off'?'last':position,text,source:event.target.id==='locationText'?'manual':S.frameLocation?.source||'manual'};
    S.frameBrief={...(S.frameBrief||{}),location:position==='off'?'no':'yes',locationPosition:S.frameLocation.position,locationText:S.frameLocation.source==='manual'?text:''};
    renderAll();saveProject();
  }
  document.querySelector('.quickbar')?.after(bar);
  $('#locationPosition').onchange=changeLocation;$('#locationText').onchange=changeLocation;
  for(const [id,key] of [['frameBackground','frameBackground'],['frameTreatment','frameTreatment']]){
    $('#'+id).onchange=e=>{if(e.target.disabled||!S.photos.length)return;pushHistory();S[key]=e.target.value;buildStory();renderAll();saveProject()};
  }
  const browse=document.createElement('button');browse.type='button';browse.id='browseCollections';browse.className='browseCollections';browse.textContent='Explorar '+catalog.families.length+' colecciones';browse.setAttribute('aria-haspopup','dialog');
  bar.insertBefore(browse,collectionNote);
  const library=document.createElement('div');library.id='collectionLibrary';library.className='collectionLibrary';library.hidden=true;library.setAttribute('role','dialog');library.setAttribute('aria-modal','true');library.setAttribute('aria-labelledby','collectionLibraryTitle');
  const libraryPanel=document.createElement('div');libraryPanel.className='collectionLibraryPanel';
  libraryPanel.innerHTML='<div class="libraryHeading"><div><span>FRAME / COLLECTIONS</span><h3 id="collectionLibraryTitle">Una mirada distinta.</h3></div><button type="button" id="closeCollections" aria-label="Cerrar colecciones">Cerrar</button></div><p class="libraryIntro">Elige una colección o deja que Otra opción te sorprenda. Los esquemas muestran su composición; FRAME la adapta a tus fotos.</p><div class="collectionGrid"></div>';
  library.append(libraryPanel);document.body.append(library);
  let libraryFocus,libraryOverflow;
  function closeLibrary(){if(library.hidden)return;library.hidden=true;document.body.style.overflow=libraryOverflow;libraryFocus?.focus?.({preventScroll:true})}
  const close=library.querySelector('#closeCollections');close.onclick=closeLibrary;
  library.onclick=e=>{if(e.target===library)closeLibrary()};
  library.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeLibrary()}if(e.key==='Tab'){const buttons=[...library.querySelectorAll('button')],first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
  function chooseCollection(id){select.value=id;closeLibrary();select.onchange()}
  const automatic=document.createElement('button');automatic.type='button';automatic.className='collectionAuto';automatic.textContent='Sorpréndeme · cambiar de colección en cada opción';automatic.onclick=()=>chooseCollection('');libraryPanel.querySelector('.collectionGrid').before(automatic);
  for(const family of catalog.families){
    const card=document.createElement('button');card.type='button';card.className='collectionCard';card.dataset.collection=family.id;card.setAttribute('aria-label',family.name);card.onclick=()=>chooseCollection(family.id);
    const diagram=document.createElement('span');diagram.className='collectionDiagram';diagram.setAttribute('aria-hidden','true');diagram.style.background=family.background?.startsWith('#')?family.background:family.id==='color_editorial'?'#6e282d':'#e5e4de';
    const v=family.variants.find(v=>v.pageSpan===1)||family.variants[0];
    for(const slot of v.slots.filter(slot=>!slot.pageIndex)){const box=document.createElement('span');box.style.cssText=`left:${slot.x*100}%;top:${slot.y*100}%;width:${slot.w*100}%;height:${slot.h*100}%;transform:rotate(${slot.rotation||0}deg);background:${engine.captionInk(diagram.style.background)==='#222222'?'#868781':'#b7b6af'}`;diagram.append(box)}
    const title=document.createElement('strong');title.textContent=family.name;const desc=document.createElement('small');desc.textContent=family.description;
    card.append(diagram,title,desc);libraryPanel.querySelector('.collectionGrid').append(card);
  }
  browse.onclick=()=>{if(browse.disabled)return;libraryFocus=document.activeElement;libraryOverflow=document.body.style.overflow;library.querySelectorAll('[data-collection]').forEach(card=>card.setAttribute('aria-pressed',String(card.dataset.collection===(S.frameTemplateFamily||S.frameArtDirection))));library.hidden=false;document.body.style.overflow='hidden';close.focus()};
  document.addEventListener('frame:import-phase',e=>{browse.disabled=e.detail.phase!=='idle';if(browse.disabled)closeLibrary()});
  const supportsCaption = id => catalog.families.find(f=>f.id===id)?.variants.some(v=>v.captionRegion);
  function sync() {
    const loc=S.frameLocation;
    $('#locationPosition').value=loc?.enabled?loc.position:'off';
    if(document.activeElement!==$('#locationText'))$('#locationText').value=loc?.text||'';
    $('#locationStatus').textContent=!loc?.enabled?'La locación está desactivada.':loc.text?(loc.source==='gps'?`Localidad cercana al GPS de ${loc.matched}/${loc.total} fotos. Puedes corregir el texto.`:'Tu lugar aparecerá una sola vez, debajo de las fotos.'):'No pudimos obtener una localidad de estas fotos. Escribe el lugar para incluirlo.';
    if(loc?.enabled&&!loc.text)location.open=true;

    select.value=S.frameTemplateFamily||'';
    $('#frameBackground').value=S.frameBackground||'auto';$('#frameTreatment').value=S.frameTreatment||'gallery';
    if (document.activeElement!==input) input.value=S.frameCaption||'';
    notes.hidden=!supportsCaption(S.frameTemplateFamily||S.frameArtDirection);
    const family=catalog.families.find(f=>f.id===S.frameArtDirection);
    if (family && S.slides.length) {$('#modeLabel').textContent=family.name;collectionNote.textContent=family.description+(S.frameTemplateFamily?' · Otra opción explora esta colección.':' · Otra opción cambia de colección.')}
    else collectionNote.textContent=catalog.families.length+' colecciones · una dirección distinta para tus fotos.';
  }
  select.onchange=()=>{
    if (select.disabled || !S.photos.length) return;
    pushHistory(); S.frameTemplateFamily=select.value; buildStory();renderAll();saveProject();
  };
  input.onchange=()=>{
    if (input.disabled || !S.photos.length) return;
    pushHistory(); S.frameCaption=input.value.trim();
    // Reuse the last design seed is unnecessary: changing a note must preserve geometry.
    S.slides.forEach(sl=>sl.layers=sl.layers.filter(l=>!l.frameCaption));
    const sl=S.slides.find(sl=>sl.frameCaptionRegion);
    if (sl && S.frameCaption) {
      const r=sl.frameCaptionRegion;
      const lines=window.FrameTemplateEngine.captionLines(S.frameCaption);
      const l=makeText(lines,r.x*340,r.y*425,r.w*340,6.5,engine.captionInk(sl.bg),'mono',400,0);
      l.frameCaption=true;l.userTouched=true;sl.layers.push(l);
    }
    renderAll();saveProject();
  };
  document.addEventListener('frame:import-phase',event=>{
    $('#locationPosition').disabled=$('#locationText').disabled=select.disabled=input.disabled=$('#frameBackground').disabled=$('#frameTreatment').disabled=event.detail.phase!=='idle';
  });
  const render = renderAll;
  renderAll = function() { render(); sync(); };
  sync();
  const css=document.createElement('style');
  css.textContent=`.templateBar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:0 16px 12px}.collectionNote{width:100%;margin:0 0 3px;font-size:11px;line-height:1.5;color:#a2a2a8}.templateBar label{font-size:11px;color:#999}.templateBar select{flex:1;min-width:0;max-width:100%;min-height:40px;color:#eee;background:#151518;border:1px solid #303036;border-radius:12px;padding:0 10px;font:inherit;font-size:12px}.templateBar select option{color:#eee;background:#151518}.templateBar select:disabled{opacity:.45}.templateNotes{width:100%;font-size:11px;color:#aaa}.templateNotes summary{cursor:pointer;padding:4px 0}.templateNotes input{box-sizing:border-box;width:100%;min-height:40px;margin-top:5px;border:1px solid #303036;border-radius:10px;padding:8px 10px;background:#151518;color:#eee;font-size:16px}.emptyStateFast .templateBar{display:none}.slide[data-family] .textLayer{letter-spacing:normal;text-shadow:none}#storyBadge,.storyBadge,.coverageBadge{display:none!important}`;
  css.textContent+='.locationLabel{pointer-events:none;white-space:pre-wrap}.editorialFinish{width:100%;font-size:11px;color:#aaa}.editorialFinish summary{padding:8px 0;cursor:pointer}.finishControls{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:8px 0}.finishControls label{display:grid;gap:6px}.finishControls select{width:100%;min-height:44px}.pagePin{position:absolute;left:10px;top:10px;z-index:207;border-radius:20px;padding:0 12px;min-height:36px;background:#141414b8;color:#fff;font-size:10px;backdrop-filter:blur(12px)}.pagePin[aria-pressed=true]{background:#f5f5f2;color:#111}.slide{border-radius:3px;box-shadow:0 10px 35px #0005}.thumb{border-radius:3px}.miniPage{pointer-events:none}.quickbar button{min-height:46px;transition:background .16s,opacity .16s}.templateBar{gap:6px}.templateNotes summary{padding:6px 0}.logo{letter-spacing:.13em;font-size:18px}.logo b{color:inherit}.studioTop h2{font-family:Georgia,serif;font-weight:400;letter-spacing:-.03em}.sheet button,.editHint button{min-height:44px}.hero{letter-spacing:-.06em}.pickerGrid{transform:none}.pickGlow{display:none}:root{--accent:#ecebe5}button:focus-visible,select:focus-visible,summary:focus-visible{outline:2px solid #f1f1ed;outline-offset:3px}@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}';
  css.textContent+=`.browseCollections{min-height:42px;border:1px solid #404045;border-radius:12px;background:#202023;color:#ecece8;padding:0 12px;font-size:11px}.collectionLibrary[hidden]{display:none}.collectionLibrary{position:fixed;inset:0;z-index:230;background:#08080bec;display:flex;align-items:flex-start;justify-content:center;padding:12px 12px calc(12px + env(safe-area-inset-bottom));padding-top:max(12px,env(safe-area-inset-top));box-sizing:border-box;overflow:auto}.collectionLibraryPanel{width:100%;max-width:680px;background:#141416;border:1px solid #323235;border-radius:20px;padding:18px;box-sizing:border-box}.libraryHeading{display:flex;justify-content:space-between;align-items:center;gap:12px}.libraryHeading span{font-size:9px;letter-spacing:.18em;color:#a0a098}.libraryHeading h3{font-family:Georgia,serif;font-size:27px;font-weight:400;margin:7px 0}.libraryHeading button{min-height:44px;background:#eee;color:#111;padding:0 13px;border-radius:20px}.libraryIntro{font-size:12px;line-height:1.5;color:#aaa}.collectionAuto{width:100%;min-height:48px;margin:6px 0 16px;border:1px solid #555;border-radius:12px;color:#eee;background:#252526;font-size:12px}.collectionGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.collectionCard{padding:10px;text-align:left;background:#1d1d20;border:1px solid #353539;border-radius:12px;color:#eee;min-width:0}.collectionCard[aria-pressed=true]{border-color:#f5f4ec;box-shadow:0 0 0 1px #f5f4ec}.collectionDiagram{display:block;position:relative;width:100%;aspect-ratio:4/5;overflow:hidden}.collectionDiagram span{display:block;position:absolute}.collectionCard strong{display:block;font-size:12px;font-weight:600;margin:10px 0 5px}.collectionCard small{display:block;font-size:10px;line-height:1.5;color:#aaa}@media(min-width:600px){.collectionGrid{grid-template-columns:repeat(3,1fr)}}`;
  document.head.appendChild(css);
  $('.logo').textContent='FRAME';$('#studioScreen h2').textContent='Tu álbum';
})();
