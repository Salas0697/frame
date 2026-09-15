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
    S.frameLastDesign = {dir:S.frameArtDirection,signature:engine.signature(result.slides),layouts:result.slides.map(sl=>sl.frameLayout)};
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
  finish.innerHTML='<summary>Fondo y marco</summary><div class="finishControls"><label>Fondo<select id="frameBackground" aria-label="Fondo del álbum"><option value="auto">Según el estilo</option><option value="white">Blanco</option><option value="black">Negro</option><option value="color">Color intenso</option></select></label><label>Marco<select id="frameTreatment" aria-label="Marco editorial"><option value="gallery">Galería</option><option value="mat">Paspartú</option><option value="fine">Filete fino</option></select></label></div>';
  bar.append(finish);
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
    if (family && S.slides.length) $('#modeLabel').textContent=family.name;
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
  css.textContent=`.templateBar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:0 16px 12px}.templateBar label{font-size:11px;color:#999}.templateBar select{flex:1;min-width:0;max-width:100%;min-height:40px;color:#eee;background:#151518;border:1px solid #303036;border-radius:12px;padding:0 10px;font:inherit;font-size:12px}.templateBar select:disabled{opacity:.45}.templateNotes{width:100%;font-size:11px;color:#aaa}.templateNotes summary{cursor:pointer;padding:4px 0}.templateNotes input{box-sizing:border-box;width:100%;min-height:40px;margin-top:5px;border:1px solid #303036;border-radius:10px;padding:8px 10px;background:#151518;color:#eee;font-size:16px}.emptyStateFast .templateBar{display:none}.slide[data-family] .textLayer{letter-spacing:normal;text-shadow:none}#storyBadge,.storyBadge,.coverageBadge{display:none!important}`;
  css.textContent+='.locationLabel{pointer-events:none;white-space:pre-wrap}.editorialFinish{width:100%;font-size:11px;color:#aaa}.editorialFinish summary{padding:8px 0;cursor:pointer}.finishControls{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:8px 0}.finishControls label{display:grid;gap:6px}.finishControls select{width:100%;min-height:44px}.pagePin{position:absolute;left:10px;top:10px;z-index:207;border-radius:20px;padding:0 12px;min-height:36px;background:#141414b8;color:#fff;font-size:10px;backdrop-filter:blur(12px)}.pagePin[aria-pressed=true]{background:#f5f5f2;color:#111}.slide{border-radius:3px;box-shadow:0 10px 35px #0005}.thumb{border-radius:3px}.miniPage{pointer-events:none}.quickbar button{min-height:46px;transition:background .16s,opacity .16s}.templateBar{gap:6px}.templateNotes summary{padding:6px 0}.logo{letter-spacing:.13em;font-size:18px}.logo b{color:inherit}.studioTop h2{font-family:Georgia,serif;font-weight:400;letter-spacing:-.03em}.sheet button,.editHint button{min-height:44px}.hero{letter-spacing:-.06em}.pickerGrid{transform:none}.pickGlow{display:none}:root{--accent:#ecebe5}button:focus-visible,select:focus-visible,summary:focus-visible{outline:2px solid #f1f1ed;outline-offset:3px}@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}';
  document.head.appendChild(css);
  $('.logo').textContent='FRAME';$('#studioScreen h2').textContent='Tu álbum';
})();
