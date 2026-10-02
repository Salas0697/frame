/* Template selection owns only temporary previews. ImportController owns Files and commits. */
const FrameJourney = (() => {
  const catalog=window.FRAME_TEMPLATE_CATALOG,engine=window.FrameTemplateEngine;
  let session=null;
  const modal=document.createElement('div');modal.id='templateJourney';modal.hidden=true;
  modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','journeyTitle');
  modal.innerHTML=`<section class="journeyPanel"><header><div><small>FRAME / COLECCIONES</small><h2 id="journeyTitle">Elige el ritmo de tus fotos.</h2></div><button id="journeyCancel" aria-label="Cancelar selección de template">Cerrar</button></header><p id="journeyStatus" role="status"></p><p class="journeyHelp">Colecciones destacadas y una nueva serie editorial. Vistas previas con tus fotos.</p><button id="journeyCuts" type="button" aria-pressed="false">Rasgadas y cortes · Nueva serie</button><div class="journeyFilters" role="group" aria-label="Filtrar templates"><button data-filter="editorial">Editorial y collage · Nueva serie</button><button data-filter="minimal">Minimalistas</button><button data-filter="mosaic">Mosaicos</button><button data-filter="panorama">Panorámicas</button></div><label class="journeyFormat">Formato<select id="journeyFormat" aria-label="Formato de vista previa"></select></label><button id="journeyPreview" disabled>Recorrer colección elegida</button><input id="journeySearch" type="search" aria-label="Buscar colecciones" placeholder="Buscar por nombre o estilo…"><div id="journeyCards"></div><button id="journeyMore">Ver todos los templates</button><details class="journeyLocation"><summary>¿Incluir locación? <span>Opcional</span></summary><label>Mostrar una sola vez<select id="journeyLocation"><option value="off">Sin locación</option><option value="first">En la primera página</option><option value="middle">En el medio</option><option value="last">Al final</option></select></label><label>Lugar <input id="journeyPlace" maxlength="80" placeholder="Automático desde tus fotos"></label><small>Usamos el GPS de las fotos, si está disponible. Puedes escribir el lugar. Se procesa en este dispositivo.</small></details><footer><p id="journeyChoice" aria-live="polite">Preparando vistas previas…</p><div><button id="journeySurprise" disabled>Sorpréndeme</button><button id="journeyCreate" disabled>Crear carrusel ✦</button></div><small>Después ajustaremos composición y encuadres.</small></footer></section>`;
  document.body.append(modal);
  const format=modal.querySelector('#journeyFormat');FrameFormats.options.forEach(f=>format.append(new Option(f.name,f.id)));format.onchange=()=>{if(session?.photos){session.designs.clear();renderCards(session)}};
  const search=modal.querySelector('#journeySearch');search.style.cssText='width:100%;box-sizing:border-box;margin-bottom:14px;min-height:44px;font-size:16px';
  const searchable=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  search.oninput=()=>{if(session){session.search=search.value;session.all=!!session.search;session.cuts=false;session.filter=null;if(session.ranked)renderCards(session)}};
  const q=id=>modal.querySelector('#'+id);
  const css=document.createElement('style');css.textContent=`
  #templateJourney[hidden]{display:none!important}#templateJourney{position:fixed;inset:0;z-index:2147483000;background:#0b0b0e;overflow:auto;padding:max(12px,env(safe-area-inset-top)) 12px max(12px,env(safe-area-inset-bottom));color:#f4f1e9;overscroll-behavior:contain}.journeyPanel{max-width:860px;margin:auto}.journeyPanel header{display:flex;justify-content:space-between;align-items:center;gap:12px}.journeyPanel header small{font-size:10px;letter-spacing:.18em;color:#aaa}.journeyPanel h2{font:32px Georgia,serif;margin:10px 0}.journeyPanel button,.journeyPanel select,.journeyPanel input{min-height:44px;font:inherit;border:1px solid #424246;border-radius:12px;background:#202023;color:#f4f1e9;padding:10px 14px}.journeyPanel header button{font-size:12px}.journeyHelp,#journeyStatus{font-size:13px;color:#b5b5b9;line-height:1.5}.journeyHelp{margin:5px 0 18px}#journeyCards{display:grid;grid-template-columns:1fr;gap:14px}.journeyTemplate{text-align:left;overflow:hidden;position:relative}.journeyTemplate[aria-pressed=true]{border-color:#eee!important;box-shadow:0 0 0 1px #eee}.journeyTemplate strong{display:block;margin:10px 0 4px;font-size:17px}.journeyTemplate small{display:block;font-size:12px;color:#bababe;line-height:1.5}.journeyPreviews{display:flex;gap:5px;overflow:hidden}.journeyPage{position:relative;overflow:hidden;aspect-ratio:4/5;flex:0 0 calc((100% - 10px)/3);border-radius:1px}.journeyPage img{position:absolute;object-fit:cover;max-width:none}.journeyTag{display:block;font-size:10px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;color:#f2d4b1}#journeyCuts{width:100%;margin:0 0 14px;border-color:#938679;background:#2a2420}#journeyCuts[aria-pressed=true]{background:#ece4d7;color:#201b16}#journeyMore{width:100%;margin:14px 0}.journeyLocation{border-top:1px solid #333;padding:14px 0}.journeyLocation summary{cursor:pointer;font-size:14px;min-height:32px}.journeyLocation summary span{color:#939399;font-size:11px}.journeyLocation label{display:grid;gap:6px;font-size:12px;margin:10px 0}.journeyLocation select,.journeyLocation input{width:100%;box-sizing:border-box;font-size:16px}.journeyLocation small,.journeyPanel footer>small{display:block;font-size:11px;color:#a2a2a8;line-height:1.5}.journeyPanel footer{position:sticky;bottom:-12px;background:#111114;padding:10px 0 calc(12px + env(safe-area-inset-bottom));border-top:1px solid #444;backdrop-filter:blur(18px)}.journeyPanel footer>div{display:grid;grid-template-columns:1fr 1.4fr;gap:8px}.journeyPanel footer small{margin-top:8px}#journeyCreate{background:#efece4;color:#141416;font-weight:700}.journeyPanel button:disabled{opacity:.4}#journeyChoice{font-size:12px;margin:0 0 8px}.journeyIntro{font-size:12px;color:#aaa;line-height:1.6;margin:0 0 18px}.journeyEditorHint{font-size:12px;color:#aaa;padding:0 16px 8px;line-height:1.5}@media(min-width:650px){#journeyCards{grid-template-columns:1fr 1fr}.journeyPanel footer{padding:14px}.journeyPanel h2{font-size:38px}}
  `;css.textContent+=`.journeyFilters{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}.journeyFilters button{font-size:12px;padding:0 10px}.journeyFilters button[aria-pressed=true]{background:#ece8dd;color:#111}.journeyFormat{display:flex;align-items:center;gap:12px;margin-bottom:12px;font-size:12px}.journeyFormat select{flex:1}#journeyPreview{width:100%;margin-bottom:12px;font-size:12px}#journeyLargePreview{max-width:580px;width:calc(100% - 24px);max-height:calc(100dvh - 24px);overflow:auto;box-sizing:border-box;background:#161619;color:#eee;border:1px solid #555;border-radius:18px;padding:14px}#journeyLargePreview::backdrop{background:#000d}#journeyLargePreview header{position:sticky;top:-14px;background:#161619;z-index:20;padding:10px 0}#largePreviewPages{display:grid;gap:16px;margin:16px 0}#largePreviewPages .journeyPage{display:block;width:100%}#chooseLargePreview{width:100%}`;document.head.append(css);
  function finish(value){
    const current=session;if(!current)return;
    session=null;modal.hidden=true;
    // Hidden previews must not retain another decoded copy of every original.
    modal.querySelectorAll('.journeyPage img').forEach(im=>im.removeAttribute('src'));
    if(preview.open)preview.close();q('largePreviewPages').replaceChildren();q('journeyCards').replaceChildren();current.designs.clear();delete current.photos;
    current.urls.forEach(url=>URL.revokeObjectURL(url));
    document.body.style.overflow=current.overflow;
    current.focus?.focus?.({preventScroll:true});current.resolve(value);
  }
  function answers(familyId){
    const position=q('journeyLocation').value;
    return {familyId,format:format.value,purpose:'story',vibe:'natural',density:familyId==='contact_press'||familyId==='museum_notes'?'rich':'balanced',location:position==='off'?'no':'yes',locationPosition:position==='off'?'last':position,locationText:q('journeyPlace').value.trim()};
  }
  q('journeyCancel').onclick=()=>finish(null);
  q('journeyCreate').onclick=()=>{if(session?.selected)finish(answers(session.selected))};
  q('journeySurprise').onclick=()=>{const rows=session&&visible(session);if(rows?.length)finish(answers(rows[Math.floor(Math.random()*rows.length)].id))};
  q('journeyMore').onclick=()=>{if(session){search.value='';session.search='';session.all=session.cuts||session.filter?false:!session.all;session.cuts=false;session.filter=null;renderCards(session)}};
  q('journeyCuts').onclick=()=>{if(session?.ranked){search.value='';session.search='';session.cuts=!session.cuts;session.all=false;session.filter=null;renderCards(session)}};
  modal.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!preview.open){event.preventDefault();event.stopPropagation();finish(null)}
    if(event.key==='Tab'){
      const els=[...modal.querySelectorAll('button,input,select,summary')].filter(el=>!el.disabled&&el.getClientRects().length),first=els[0],last=els.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
    }
  });
  function rank(photos){
    const wide=photos.filter(p=>p.aspect>1.5).length,portrait=photos.filter(p=>p.aspect<.9).length;
    return catalog.families.map(f=>({ ...f,match:
      (FrameTemplateLayouts.featured.includes(f.id)?25:0)+(f.id==='gallery_book'?8:0)+(f.id==='editorial_pair'?6:0)+
      (f.id==='continuous'?(wide?14:-100):0)+
      (f.id==='museum_notes'&&photos.length>=9?13:0)+
      (f.id==='contact_press'&&photos.length>=12?12:0)+
      (f.id==='column_house'&&portrait>photos.length*.6?11:0)+
      (f.id==='color_editorial'?5:0)
    })).sort((a,b)=>b.match-a.match);
  }
  const minimal=new Set(['gallery_book','full_bleed','offset_studies','margin_notes','linen_album','cinema_club']);
  function visible(current){return current.ranked.filter(f=>(!current.search||searchable(f.name+' '+f.description).includes(searchable(current.search)))&&(!current.cuts||f.cutStyle)&&(!current.filter||(current.filter==='editorial'?FrameTemplateLayouts.editorial.includes(f.id):current.filter==='minimal'?minimal.has(f.id):current.filter==='panorama'?f.id==='continuous'||f.crossPage:f.variants.some(v=>v.photoCount>=4)))).filter((_,i)=>current.search||current.cuts||current.filter||current.all||i<8)}
  modal.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{if(!session?.ranked)return;session.filter=session.filter===b.dataset.filter?null:b.dataset.filter;session.cuts=false;session.all=false;renderCards(session)});
  const preview=document.createElement('dialog');preview.id='journeyLargePreview';preview.innerHTML='<header><b id="largePreviewTitle"></b><button id="closeLargePreview">Cerrar</button></header><div id="largePreviewPages"></div><button id="chooseLargePreview">Usar esta colección</button>';modal.append(preview);
  q('closeLargePreview').onclick=()=>preview.close();q('chooseLargePreview').onclick=()=>{preview.close();q('journeyCreate').click()};
  q('journeyPreview').onclick=()=>{if(!session?.selected)return;const card=modal.querySelector('[data-family="'+session.selected+'"]');q('largePreviewTitle').textContent=card.querySelector('strong').textContent;const pages=q('largePreviewPages');pages.replaceChildren(...session.designs.get(session.selected).slides.map(previewPage));preview.showModal()};
  function previewPage(sl){
        const [W,H]=FrameFormats.dimensions(format.value),page=document.createElement('span');page.className='journeyPage';page.style.background=sl.bg;page.style.aspectRatio=W+'/'+H;page.style.setProperty('--page-ratio',W/H);
        for(const layer of [...sl.layers].filter(l=>!l.hidden).sort((a,b)=>a.z-b.z)){
          const box=document.createElement('span');box.style.cssText=`position:absolute;left:${layer.x/W*100}%;top:${layer.y/H*100}%;width:${layer.w/W*100}%;height:${(layer.h||layer.size)/H*100}%;transform:rotate(${layer.rot||0}deg);overflow:hidden;`;
          if(layer.frameCut)box.style.clipPath=FrameCuts.css(layer.frameCut);
          if(layer.type==='img'){const im=document.createElement('img'),g=FrameCrop.geometry(layer,layer.w,layer.h);im.src=layer.photo.url;im.alt='';im.style.cssText=`position:absolute;left:${g.x/layer.w*100}%;top:${g.y/layer.h*100}%;width:${g.w/layer.w*100}%;height:${g.h/layer.h*100}%;`;box.append(im);if(layer.frameBorder)box.style.outline='1px solid '+layer.frameBorderColor}
          else if(layer.type==='deco'){box.style.background=layer.color;box.style.borderRadius=layer.kind==='circle'?'50%':'0'}
          else{box.textContent=layer.text;box.style.fontFamily=ff(layer.font);box.style.color=layer.color;box.style.fontSize='5px'}
          page.append(box);
        }
    return page;
  }
  const polish=document.createElement('style');polish.textContent=`.journeyPanel h2{font-size:30px;font-weight:400;letter-spacing:-.025em;line-height:1.1}.journeyTemplate{padding:12px!important;background:#18181c!important;border-radius:16px!important}.journeyTemplate[aria-pressed=true]:after{content:'Elegida';position:absolute;right:16px;top:12px;border-radius:6px;background:#eeeae2;color:#202024;font-size:10px;padding:4px 7px}.journeyTag{padding-right:55px;font-size:9px}.journeyTemplate strong{font:22px Georgia,serif!important;margin:14px 0 6px}.journeyTemplate small{font-size:12px!important;color:#a5a4ab}.journeyPreviews{gap:7px}.journeyPage{flex-basis:calc((100% - 14px)/3)}#journeyLargePreview{padding:16px;background:#111114;border:1px solid #414149;color:#eee;border-radius:20px;width:calc(100vw - 16px);max-width:760px;max-height:calc(100dvh - 24px)}#largePreviewPages{display:flex;overflow:auto;scroll-snap-type:x mandatory;gap:12px;padding:16px 0}#largePreviewPages .journeyPage{flex:0 0 min(84%,340px,calc(65dvh * var(--page-ratio,.8)));scroll-snap-align:center}#journeyLargePreview header{display:flex;align-items:center;justify-content:space-between;gap:8px}#journeyLargePreview button{min-height:44px;background:#efebe3;color:#19191c;border:0;border-radius:10px;padding:0 12px}#chooseLargePreview{width:100%}@media(min-width:700px){#journeyCards{grid-template-columns:1fr 1fr}}`;document.head.append(polish);
  function renderCards(current){
    if(session!==current)return;
    q('journeyCards').replaceChildren();
    q('journeyCuts').setAttribute('aria-pressed',String(!!current.cuts));
    const rows=visible(current);modal.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(current.filter===b.dataset.filter)));
    if(!rows.some(f=>f.id===current.selected))current.selected=rows[0]?.id||null;
    for(const [index,family] of rows.entries()){
      const card=document.createElement('button');card.type='button';card.className='journeyTemplate';card.dataset.family=family.id;
      card.setAttribute('aria-pressed',String(current.selected===family.id));card.setAttribute('aria-label',family.name);
      const tag=document.createElement('span');tag.className='journeyTag';tag.textContent=family.collection==='editorial_collage'?'Nueva serie · Editorial y collage':family.cutStyle?'Rasgadas y cortes':index===0?'Recomendado para tus fotos':'Colección '+String(index+1).padStart(2,'0');
      const previews=document.createElement('span');previews.className='journeyPreviews';previews.setAttribute('aria-hidden','true');
      let design=current.designs.get(family.id);
      if(!design){design=engine.generate({catalog,photos:current.photos,familyId:family.id,brief:answers(family.id),seed:current.seed,backgroundMode:S.frameBackground||'collection',backgroundColor:S.frameBackgroundColor,frameTreatment:S.frameTreatment||'gallery',format:format.value});current.designs.set(family.id,design)}
      for(const sl of design.slides.slice(0,3))previews.append(previewPage(sl));
      const title=document.createElement('strong');title.textContent=family.name;
      const desc=document.createElement('small');desc.textContent=family.description;
      card.append(tag,previews,title,desc);
      card.onclick=()=>{current.selected=family.id;modal.querySelectorAll('[data-family]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.family===family.id)));q('journeyChoice').textContent=family.name+' · '+current.photos.length+' fotos'};
      q('journeyCards').append(card);
    }
    q('journeyMore').textContent=current.all||current.cuts||current.filter?'Ver recomendados':'Explorar los '+catalog.families.length+' templates';
    q('journeyMore').hidden=false;q('journeyPreview').disabled=q('journeyCreate').disabled=q('journeySurprise').disabled=!rows.length;
    q('journeyChoice').textContent=rows.length?current.ranked.find(f=>f.id===current.selected)?.name+' · '+current.photos.length+' fotos':'No hay colecciones con ese nombre o estilo.';
  }
  function open(){
    if(session)throw Error('Template selection already active');
    let resolve;const promise=new Promise(r=>resolve=r);
    const current={resolve,urls:[],overflow:document.body.style.overflow,focus:document.activeElement,designs:new Map(),seed:Date.now()>>>0};session=current;search.value='';format.value=S.frameFormat||'4:5';q('journeyPreview').disabled=true;
    modal.hidden=false;modal.scrollTop=0;document.body.style.overflow='hidden';
    q('journeyCuts').setAttribute('aria-pressed','false');q('journeyCards').replaceChildren();q('journeyStatus').textContent='Preparando tus fotos…';q('journeyChoice').textContent='Preparando vistas previas…';
    q('journeyCreate').disabled=q('journeySurprise').disabled=true;modal.querySelectorAll('[data-filter]').forEach(b=>b.disabled=true);q('journeyCuts').disabled=true;q('journeyMore').hidden=true;
    q('journeyLocation').value=S.frameLocation?.enabled?S.frameLocation.position:'off';q('journeyPlace').value=S.frameLocation?.source==='manual'?S.frameLocation.text:'';
    q('journeyCancel').focus({preventScroll:true});return {current,promise};
  }
  function ready(current,photos){if(session!==current)return;modal.querySelectorAll('[data-filter]').forEach(b=>b.disabled=false);q('journeyCuts').disabled=false;current.photos=photos;current.ranked=rank(photos);current.selected=current.ranked[0].id;q('journeyStatus').textContent=photos.length+' fotos · Vistas previas con tus imágenes';renderCards(current)}
  async function prepareSaved(photos,current){
    const rows=[];
    for(const photo of photos){
      if(session!==current)return [];
      const im=await loadImage(photo.url),cv=document.createElement('canvas'),scale=Math.min(1,640/Math.max(im.naturalWidth,im.naturalHeight));cv.width=Math.max(1,Math.round(im.naturalWidth*scale));cv.height=Math.max(1,Math.round(im.naturalHeight*scale));cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);
      const blob=await new Promise(resolve=>cv.toBlob(resolve,'image/jpeg',.88));im.removeAttribute('src');cv.width=cv.height=0;if(session!==current)return [];if(!blob)throw Error('Preview unavailable');const url=URL.createObjectURL(blob);current.urls.push(url);rows.push({...photo,url});await new Promise(resolve=>setTimeout(resolve,0));
    }return rows;
  }
  async function prepare(files,current){
    const photos=await prepareSaved(S.photos,current);
    // Decode sequentially and sample only 42px. No face detector, GPS or full analysis here.
    for(let i=0;i<files.length;i++){
      if(session!==current)return;
      const file=files[i],url=URL.createObjectURL(file);current.urls.push(url);
      const im=await new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('No se pudo abrir '+file.name));image.src=url});
      if(session!==current)return;
      const cv=document.createElement('canvas');cv.width=cv.height=42;const ctx=cv.getContext('2d');ctx.drawImage(im,0,0,42,42);
      const width=im.naturalWidth,height=im.naturalHeight,dominantColors=FramePhotoColors.extract(ctx.getImageData(0,0,42,42).data);
      const scale=Math.min(1,640/Math.max(width,height));cv.width=Math.max(1,Math.round(width*scale));cv.height=Math.max(1,Math.round(height*scale));ctx.drawImage(im,0,0,cv.width,cv.height);
      const blob=await new Promise(resolve=>cv.toBlob(resolve,file.type==='image/jpeg'?'image/jpeg':'image/png',.88));
      im.removeAttribute('src');cv.width=cv.height=0;URL.revokeObjectURL(url);
      if(session!==current)return;
      if(!blob)throw Error('No se pudo preparar la vista previa de '+file.name);
      const previewUrl=URL.createObjectURL(blob);current.urls.push(previewUrl);
      photos.push({id:'preview_'+i,name:file.name,url:previewUrl,width,height,aspect:width/height,dominantColors});
      q('journeyStatus').textContent=files.length+' fotos seleccionadas · '+(i+1)+'/'+files.length;
      await new Promise(r=>setTimeout(r,0));
    }
    ready(current,photos);
  }
  function selectFiles(files){const {current,promise}=open();void prepare(files,current).catch(error=>{if(session===current){q('journeyStatus').textContent=error.message+'. Cierra y elige imágenes compatibles.';q('journeyChoice').textContent='Tu proyecto se conserva.'}});return promise}
  function choose(photos){const {current,promise}=open();void prepareSaved(photos,current).then(rows=>ready(current,rows)).catch(()=>finish(null));return promise}
  return {selectFiles,choose};
})();
