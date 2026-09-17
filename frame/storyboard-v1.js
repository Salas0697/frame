/* Application adapter for the catalog engine; no legacy generation or file listeners. */
(() => {
  const catalog = window.FRAME_TEMPLATE_CATALOG;
  const engine = window.FrameTemplateEngine;
  let generation = 0;
  function buildStory() {
    if (!S.photos?.length) return;
    const seed = (Date.now() + (++generation) * 7919 + Math.floor(Math.random()*1e6)) >>> 0;
    const pageColors=new Map(S.slides.map((sl,index)=>[index,sl.frameBackgroundOverride]).filter(([,v])=>v));
    const fixed=S.slides.map((sl,index)=>({sl,index})).filter(x=>x.sl.frameLocked);
    const retained=new Set(fixed.flatMap(x=>x.sl.layers.filter(l=>l.type==='img').map(l=>l.photo.id)));
    const available=S.photos.filter(p=>!retained.has(p.id));
    const result = engine.generate({catalog, photos:available, brief:S.frameBrief,
      familyId:S.frameTemplateFamily, previous:S.frameLastDesign, seed, caption:S.frameCaption,heroPhotoId:S.heroPhotoId,backgroundMode:S.frameBackground,frameTreatment:S.frameTreatment,backgroundColor:S.frameBackgroundColor});
    result.slides.forEach(sl => {
      const photo = sl.layers.find(l=>l.type==='img')?.photo;
      sl.palette = palFromPhoto(photo);
    });
    fixed.forEach(({sl,index})=>result.slides.splice(Math.min(index,result.slides.length),0,sl));
    result.slides.forEach((sl,index)=>{const override=sl.frameBackgroundOverride||pageColors.get(index);if(override){sl.frameBackgroundOverride=override;FramePhotoColors.paint(sl,FramePhotoColors.resolve(override.mode,FramePhotoColors.pagePhotos(sl),override.color))}});
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
    if (!S.photos?.length || window.framePhotoImport?.active) return;
    pushHistory(); buildStory(); renderAll(); saveProject();
    toast('Otra composición lista ✦');
  };

  const bar = document.createElement('div');
  bar.className = 'templateBar';
  const label = document.createElement('label'); label.htmlFor='templateFamily'; label.textContent='Estilo';
  const select = document.createElement('select'); select.id='templateFamily';
  select.append(new Option('Sorpréndeme · todas las colecciones',''));
  catalog.families.forEach(f=>select.append(new Option(f.name,f.id)));
  const notes = document.createElement('details'); notes.className='templateNotes';
  const summary = document.createElement('summary'); summary.textContent='Nota al pie';
  const input = document.createElement('input'); input.id='templateCaption'; input.maxLength=120;
  input.placeholder='Una nota breve para este álbum'; input.setAttribute('aria-label','Nota al pie del álbum');
  notes.append(summary,input); bar.append(label,select,notes);
  const finish=document.createElement('details');finish.className='editorialFinish';
  finish.innerHTML='<summary>Fondo y marco</summary><div class="finishControls"><label>Fondo<select id="frameBackground" aria-label="Modo de fondo"><option value="auto">Desde tus fotos</option><option value="white">Blanco</option><option value="black">Negro</option><option value="custom">Color elegido</option></select></label><label>Marco<select id="frameTreatment" aria-label="Marco editorial"><option value="gallery">Galería</option><option value="mat">Paspartú</option><option value="fine">Filete fino</option><option value="print">Papel fotográfico</option><option value="darkroom">Montaje negro</option></select></label></div>';
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
  const hint=document.createElement('p');hint.className='journeyEditorHint';hint.textContent='03 · Ajusta y comparte · Toca una foto para reencuadrar. Otra opción cambia la composición de tu template.';bar.after(hint);
  $('#locationPosition').onchange=changeLocation;$('#locationText').onchange=changeLocation;
  for(const [id,key] of [['frameTreatment','frameTreatment']]){
    $('#'+id).onchange=e=>{if(e.target.disabled||!S.photos.length)return;pushHistory();S[key]=e.target.value;buildStory();renderAll();saveProject()};
  }
  const colorMenu=document.createElement('div');colorMenu.className='photoColorMenu';
  colorMenu.innerHTML='<label for="backgroundScope">Aplicar fondo a</label><select id="backgroundScope"><option value="page">Esta página</option><option value="all">Todo el carrusel</option></select><p id="backgroundSource" class="locationHint"></p><div id="backgroundSwatches" class="backgroundSwatches" aria-label="Colores extraídos de tus fotos"></div><p class="locationHint">Los colores se extraen de las imágenes. Cambiar el fondo conserva el encuadre.</p>';
  finish.append(colorMenu);
  const scope=colorMenu.querySelector('#backgroundScope'),swatches=colorMenu.querySelector('#backgroundSwatches');
  function syncBackground(){
    const sl=S.slides[S.currentSlide||0],all=scope.value==='all',source=all?S.photos:sl?FramePhotoColors.pagePhotos(sl):[];
    const palette=FramePhotoColors.palette(source),setting=!all&&sl?.frameBackgroundOverride||{mode:S.frameBackground||'auto',color:S.frameBackgroundColor};
    $('#frameBackground').value=setting.mode==='color'?'auto':setting.mode;
    $('#backgroundSource').textContent=palette.length?(all?'Predominantes de todo el carrusel':'Predominantes de la página '+((S.currentSlide||0)+1)):'Los colores aparecerán al analizar tus fotos.';
    swatches.replaceChildren();
    for(const color of palette){const button=document.createElement('button');button.type='button';button.className='backgroundSwatch';button.disabled=scope.disabled;button.dataset.color=color.hex;button.title=color.hex.toUpperCase();button.setAttribute('aria-label','Fondo '+color.hex.toUpperCase());button.setAttribute('aria-pressed',String(!!sl&&sl.bg.toLowerCase()===color.hex));button.style.setProperty('--swatch',color.hex);button.onclick=()=>applyBackground('custom',color.hex);swatches.append(button)}
  }
  function applyBackground(mode,color){if($('#frameBackground').disabled||!S.slides.length)return;if(mode==='custom'&&!color)return;pushHistory();FramePhotoColors.apply(S,{scope:scope.value,mode,color});renderAll();saveProject();toast(scope.value==='all'?'Fondo aplicado al carrusel':'Fondo aplicado a esta página')}
  scope.onchange=syncBackground;$('#frameBackground').onchange=e=>{if(e.target.value==='custom'){syncBackground();return}applyBackground(e.target.value)};
  document.addEventListener('frame:page-change',syncBackground);
  document.addEventListener('frame:import-phase',e=>{scope.disabled=e.detail.phase!=='idle';swatches.querySelectorAll('button').forEach(b=>b.disabled=scope.disabled)});
  const browse=document.createElement('button');browse.type='button';browse.id='browseCollections';browse.className='browseCollections';browse.textContent='Explorar '+catalog.families.length+' colecciones';browse.setAttribute('aria-haspopup','dialog');
  bar.insertBefore(browse,collectionNote);
  browse.textContent='Cambiar template';
  browse.onclick=async()=>{
    if(browse.disabled||!S.photos.length)return;
    const choice=await FrameJourney.choose(S.photos);
    if(!choice)return;
    pushHistory();S.frameTemplateFamily=choice.familyId;S.frameBrief=choice;
    S.frameLocation=FramePhotoLocation.settings(choice,S.photos);
    buildStory();renderAll();saveProject();
  };
  document.addEventListener('frame:import-phase',e=>{browse.disabled=e.detail.phase!=='idle'});
  const supportsCaption = id => [...(catalog.families.find(f=>f.id===id)?.variants||[]),...(catalog.families.find(f=>f.id===id)?.covers||[])].some(v=>v.captionRegion);
  function sync() {
    const loc=S.frameLocation;
    $('#locationPosition').value=loc?.enabled?loc.position:'off';
    if(document.activeElement!==$('#locationText'))$('#locationText').value=loc?.text||'';
    $('#locationStatus').textContent=!loc?.enabled?'La locación está desactivada.':loc.text?(loc.source==='gps'?`Localidad cercana al GPS de ${loc.matched}/${loc.total} fotos. Puedes corregir el texto.`:'Tu lugar aparecerá una sola vez, debajo de las fotos.'):'No pudimos obtener una localidad de estas fotos. Escribe el lugar para incluirlo.';
    if(loc?.enabled&&!loc.text)location.open=true;

    select.value=S.frameTemplateFamily||'';
    syncBackground();$('#frameTreatment').value=S.frameTreatment||'gallery';
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
  css.textContent=`.templateBar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:0 16px 12px}.collectionNote{width:100%;margin:0 0 3px;font-size:11px;line-height:1.5;color:#a2a2a8}.templateBar label{font-size:11px;color:#999}.templateBar select{appearance:none;-webkit-appearance:none;color-scheme:dark;flex:1;min-width:0;max-width:100%;min-height:40px;color:#eee;background:#151518;border:1px solid #303036;border-radius:12px;padding:0 10px;font:inherit;font-size:12px}.templateBar select option{color:#eee;background:#151518}.templateBar select:disabled{opacity:.45}.templateNotes{width:100%;font-size:11px;color:#aaa}.templateNotes summary{cursor:pointer;padding:4px 0}.templateNotes input{box-sizing:border-box;width:100%;min-height:40px;margin-top:5px;border:1px solid #303036;border-radius:10px;padding:8px 10px;background:#151518;color:#eee;font-size:16px}.emptyStateFast .templateBar{display:none}.slide[data-family] .textLayer{letter-spacing:normal;text-shadow:none}#storyBadge,.storyBadge,.coverageBadge{display:none!important}`;
  css.textContent+='.locationLabel{pointer-events:none;white-space:pre-wrap}.editorialFinish{width:100%;font-size:11px;color:#aaa}.editorialFinish summary{padding:8px 0;cursor:pointer}.finishControls{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:8px 0}.finishControls label{display:grid;gap:6px}.finishControls select{width:100%;min-height:44px}.pagePin{position:absolute;left:10px;top:10px;z-index:207;border-radius:20px;padding:0 12px;min-height:36px;background:#141414b8;color:#fff;font-size:10px;backdrop-filter:blur(12px)}.pagePin[aria-pressed=true]{background:#f5f5f2;color:#111}.slide{border-radius:3px;box-shadow:0 10px 35px #0005}.thumb{border-radius:3px}.miniPage{pointer-events:none}.quickbar button{min-height:46px;transition:background .16s,opacity .16s}.templateBar{gap:6px}.templateNotes summary{padding:6px 0}.logo{letter-spacing:.13em;font-size:18px}.logo b{color:inherit}.studioTop h2{font-family:Georgia,serif;font-weight:400;letter-spacing:-.03em}.sheet button,.editHint button{min-height:44px}.hero{letter-spacing:-.06em}.pickerGrid{transform:none}.pickGlow{display:none}:root{--accent:#ecebe5}button:focus-visible,select:focus-visible,summary:focus-visible{outline:2px solid #f1f1ed;outline-offset:3px}@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}';
  css.textContent+=`.browseCollections{min-height:42px;border:1px solid #404045;border-radius:12px;background:#202023;color:#ecece8;padding:0 12px;font-size:11px}.collectionLibrary[hidden]{display:none}.collectionLibrary{position:fixed;inset:0;z-index:230;background:#08080bec;display:flex;align-items:flex-start;justify-content:center;padding:12px 12px calc(12px + env(safe-area-inset-bottom));padding-top:max(12px,env(safe-area-inset-top));box-sizing:border-box;overflow:auto}.collectionLibraryPanel{width:100%;max-width:680px;background:#141416;border:1px solid #323235;border-radius:20px;padding:18px;box-sizing:border-box}.libraryHeading{display:flex;justify-content:space-between;align-items:center;gap:12px}.libraryHeading span{font-size:9px;letter-spacing:.18em;color:#a0a098}.libraryHeading h3{font-family:Georgia,serif;font-size:27px;font-weight:400;margin:7px 0}.libraryHeading button{min-height:44px;background:#eee;color:#111;padding:0 13px;border-radius:20px}.libraryIntro{font-size:12px;line-height:1.5;color:#aaa}.collectionAuto{width:100%;min-height:48px;margin:6px 0 16px;border:1px solid #555;border-radius:12px;color:#eee;background:#252526;font-size:12px}.collectionGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.collectionCard{padding:10px;text-align:left;background:#1d1d20;border:1px solid #353539;border-radius:12px;color:#eee;min-width:0}.collectionCard[aria-pressed=true]{border-color:#f5f4ec;box-shadow:0 0 0 1px #f5f4ec}.collectionDiagram{display:block;position:relative;width:100%;aspect-ratio:4/5;overflow:hidden}.collectionDiagram span{display:block;position:absolute}.collectionCard strong{display:block;font-size:12px;font-weight:600;margin:10px 0 5px}.collectionCard small{display:block;font-size:10px;line-height:1.5;color:#aaa}@media(min-width:600px){.collectionGrid{grid-template-columns:repeat(3,1fr)}}`;
  css.textContent+='.pageShell{flex:none;scroll-snap-align:start}.pageControls{height:44px;display:flex;align-items:center;gap:6px}.pageControls>span{font-size:10px;color:#949499;flex:1}.pageControls .pagePin,.pageControls .badge{position:static;transform:none;min-height:36px;min-width:44px;padding:0 10px;font-size:10px;border:1px solid #38383c;background:#19191b;backdrop-filter:none}.pageControls .pagePin[aria-pressed=true]{background:#efeee8;color:#111}.pageControls .badge{font-size:15px}.pageShell .slide{scroll-snap-align:none}';
  css.textContent+='.photoColorMenu{padding:10px 0}.photoColorMenu>label{display:block;margin:0 0 6px}.photoColorMenu>select{width:100%;min-height:44px}.backgroundSwatches{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}.backgroundSwatch{width:44px;height:44px;border:1px solid #ffffff55;background:var(--swatch);border-radius:50%;box-shadow:inset 0 0 0 3px #171719}.backgroundSwatch[aria-pressed=true]{outline:2px solid #f0eee4;outline-offset:2px}.backgroundSwatch:focus-visible{outline:3px solid #fff;outline-offset:3px}';
  document.head.appendChild(css);
  $('.logo').textContent='FRAME';$('#studioScreen h2').textContent='Tu álbum';
})();
