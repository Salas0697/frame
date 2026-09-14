/* Application adapter for the catalog engine; no legacy generation or file listeners. */
(() => {
  const catalog = window.FRAME_TEMPLATE_CATALOG;
  const engine = window.FrameTemplateEngine;
  let generation = 0;
  function buildStory() {
    if (!S.photos?.length) return;
    const seed = (Date.now() + (++generation) * 7919 + Math.floor(Math.random()*1e6)) >>> 0;
    const result = engine.generate({catalog, photos:S.photos, brief:S.frameBrief,
      familyId:S.frameTemplateFamily, previous:S.frameLastDesign, seed, caption:S.frameCaption});
    result.slides.forEach(sl => {
      const photo = sl.layers.find(l=>l.type==='img')?.photo;
      sl.palette = palFromPhoto(photo);
    });
    S.slides = result.slides;
    S.frameArtDirection = result.familyId;
    S.frameLastDesign = {dir:result.familyId,signature:result.signature,layouts:result.slides.map(sl=>sl.frameLayout)};
    S.currentSlide = 0; S.selected = null; S.selectedType = null;
  }
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
  document.querySelector('.quickbar')?.after(bar);
  const supportsCaption = id => catalog.families.find(f=>f.id===id)?.variants.some(v=>v.captionRegion);
  function sync() {
    select.value=S.frameTemplateFamily||'';
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
      const l=makeText(lines,r.x*340,r.y*425,r.w*340,6.5,'#222222','mono',400,0);
      l.frameCaption=true;l.userTouched=true;sl.layers.push(l);
    }
    renderAll();saveProject();
  };
  document.addEventListener('frame:import-phase',event=>{
    select.disabled=input.disabled=event.detail.phase!=='idle';
  });
  const render = renderAll;
  renderAll = function() { render(); sync(); };
  sync();
  const css=document.createElement('style');
  css.textContent=`.templateBar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:0 16px 12px}.templateBar label{font-size:11px;color:#999}.templateBar select{flex:1;min-width:0;max-width:100%;min-height:40px;color:#eee;background:#151518;border:1px solid #303036;border-radius:12px;padding:0 10px;font:inherit;font-size:12px}.templateBar select:disabled{opacity:.45}.templateNotes{width:100%;font-size:11px;color:#aaa}.templateNotes summary{cursor:pointer;padding:4px 0}.templateNotes input{box-sizing:border-box;width:100%;min-height:40px;margin-top:5px;border:1px solid #303036;border-radius:10px;padding:8px 10px;background:#151518;color:#eee;font-size:16px}.emptyStateFast .templateBar{display:none}.slide[data-family] .textLayer{letter-spacing:normal;text-shadow:none}#storyBadge,.storyBadge,.coverageBadge{display:none!important}`;
  document.head.appendChild(css);
})();
