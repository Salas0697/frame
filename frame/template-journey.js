/* Template selection owns only temporary previews. ImportController owns Files and commits. */
const FrameJourney = (() => {
  const catalog=window.FRAME_TEMPLATE_CATALOG,engine=window.FrameTemplateEngine;
  let session=null;
  const modal=document.createElement('div');modal.id='templateJourney';modal.hidden=true;
  modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','journeyTitle');
  modal.innerHTML=`<section class="journeyPanel"><header><div><small>FRAME / 02 · TEMPLATE</small><h2 id="journeyTitle">Encuentra tu mirada.</h2></div><button id="journeyCancel" aria-label="Cancelar selección de template">Cerrar</button></header><p id="journeyStatus" role="status"></p><p class="journeyHelp">Elige una historia visual. Puedes cambiarla después.</p><button id="journeyCuts" type="button" aria-pressed="false">Rasgadas y cortes · Nueva serie</button><div id="journeyCards"></div><button id="journeyMore">Ver todos los templates</button><details class="journeyLocation"><summary>¿Incluir locación? <span>Opcional</span></summary><label>Mostrar una sola vez<select id="journeyLocation"><option value="off">Sin locación</option><option value="first">En la primera página</option><option value="middle">En el medio</option><option value="last">Al final</option></select></label><label>Lugar <input id="journeyPlace" maxlength="80" placeholder="Automático desde tus fotos"></label><small>Usamos el GPS de las fotos, si está disponible. Puedes escribir el lugar. Se procesa en este dispositivo.</small></details><footer><p id="journeyChoice" aria-live="polite">Preparando vistas previas…</p><div><button id="journeySurprise" disabled>Sorpréndeme</button><button id="journeyCreate" disabled>Crear carrusel ✦</button></div><small>Después ajustaremos composición y encuadres.</small></footer></section>`;
  document.body.append(modal);
  const q=id=>modal.querySelector('#'+id);
  const css=document.createElement('style');css.textContent=`
  #templateJourney[hidden]{display:none!important}#templateJourney{position:fixed;inset:0;z-index:2147483000;background:#0b0b0e;overflow:auto;padding:max(12px,env(safe-area-inset-top)) 12px max(12px,env(safe-area-inset-bottom));color:#f4f1e9;overscroll-behavior:contain}.journeyPanel{max-width:860px;margin:auto}.journeyPanel header{display:flex;justify-content:space-between;align-items:center;gap:12px}.journeyPanel header small{font-size:10px;letter-spacing:.18em;color:#aaa}.journeyPanel h2{font:32px Georgia,serif;margin:10px 0}.journeyPanel button,.journeyPanel select,.journeyPanel input{min-height:44px;font:inherit;border:1px solid #424246;border-radius:12px;background:#202023;color:#f4f1e9;padding:10px 14px}.journeyPanel header button{font-size:12px}.journeyHelp,#journeyStatus{font-size:13px;color:#b5b5b9;line-height:1.5}.journeyHelp{margin:5px 0 18px}#journeyCards{display:grid;grid-template-columns:1fr;gap:14px}.journeyTemplate{text-align:left;overflow:hidden;position:relative}.journeyTemplate[aria-pressed=true]{border-color:#eee!important;box-shadow:0 0 0 1px #eee}.journeyTemplate strong{display:block;margin:10px 0 4px;font-size:17px}.journeyTemplate small{display:block;font-size:12px;color:#bababe;line-height:1.5}.journeyPreviews{display:flex;gap:5px;overflow:hidden}.journeyPage{position:relative;overflow:hidden;aspect-ratio:4/5;flex:0 0 calc((100% - 10px)/3);border-radius:1px}.journeyPage img{position:absolute;object-fit:cover;max-width:none}.journeyTag{display:block;font-size:10px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;color:#f2d4b1}#journeyCuts{width:100%;margin:0 0 14px;border-color:#938679;background:#2a2420}#journeyCuts[aria-pressed=true]{background:#ece4d7;color:#201b16}#journeyMore{width:100%;margin:14px 0}.journeyLocation{border-top:1px solid #333;padding:14px 0}.journeyLocation summary{cursor:pointer;font-size:14px;min-height:32px}.journeyLocation summary span{color:#939399;font-size:11px}.journeyLocation label{display:grid;gap:6px;font-size:12px;margin:10px 0}.journeyLocation select,.journeyLocation input{width:100%;box-sizing:border-box;font-size:16px}.journeyLocation small,.journeyPanel footer>small{display:block;font-size:11px;color:#a2a2a8;line-height:1.5}.journeyPanel footer{position:sticky;bottom:-12px;background:#111114;padding:10px 0 calc(12px + env(safe-area-inset-bottom));border-top:1px solid #444;backdrop-filter:blur(18px)}.journeyPanel footer>div{display:grid;grid-template-columns:1fr 1.4fr;gap:8px}.journeyPanel footer small{margin-top:8px}#journeyCreate{background:#efece4;color:#141416;font-weight:700}.journeyPanel button:disabled{opacity:.4}#journeyChoice{font-size:12px;margin:0 0 8px}.journeyIntro{font-size:12px;color:#aaa;line-height:1.6;margin:0 0 18px}.journeyEditorHint{font-size:12px;color:#aaa;padding:0 16px 8px;line-height:1.5}@media(min-width:650px){#journeyCards{grid-template-columns:1fr 1fr}.journeyPanel footer{padding:14px}.journeyPanel h2{font-size:38px}}
  `;document.head.append(css);
  function finish(value){
    const current=session;if(!current)return;
    session=null;modal.hidden=true;
    current.urls.forEach(url=>URL.revokeObjectURL(url));
    document.body.style.overflow=current.overflow;
    current.focus?.focus?.({preventScroll:true});current.resolve(value);
  }
  function answers(familyId){
    const position=q('journeyLocation').value;
    return {familyId,purpose:'story',vibe:'natural',density:familyId==='contact_press'||familyId==='museum_notes'?'rich':'balanced',location:position==='off'?'no':'yes',locationPosition:position==='off'?'last':position,locationText:q('journeyPlace').value.trim()};
  }
  q('journeyCancel').onclick=()=>finish(null);
  q('journeyCreate').onclick=()=>{if(session?.selected)finish(answers(session.selected))};
  q('journeySurprise').onclick=()=>{if(session?.ranked?.length){const rows=session.ranked.slice(0,4);finish(answers(rows[Math.floor(Math.random()*rows.length)].id))}};
  q('journeyMore').onclick=()=>{if(session){session.all=session.cuts?false:!session.all;session.cuts=false;renderCards(session)}};
  q('journeyCuts').onclick=()=>{if(session?.ranked){session.cuts=!session.cuts;session.all=false;renderCards(session)}};
  modal.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();finish(null)}
    if(event.key==='Tab'){
      const els=[...modal.querySelectorAll('button,input,select,summary')].filter(el=>!el.disabled&&el.getClientRects().length),first=els[0],last=els.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
    }
  });
  function rank(photos){
    const wide=photos.filter(p=>p.aspect>1.5).length,portrait=photos.filter(p=>p.aspect<.9).length;
    return catalog.families.map(f=>({ ...f,match:
      (f.id==='gallery_book'?8:0)+(f.id==='editorial_pair'?6:0)+
      (f.id==='continuous'?(wide?14:-100):0)+
      (f.id==='museum_notes'&&photos.length>=9?13:0)+
      (f.id==='contact_press'&&photos.length>=12?12:0)+
      (f.id==='column_house'&&portrait>photos.length*.6?11:0)+
      (f.id==='color_editorial'?5:0)
    })).sort((a,b)=>b.match-a.match);
  }
  function renderCards(current){
    if(session!==current)return;
    q('journeyCards').replaceChildren();
    q('journeyCuts').setAttribute('aria-pressed',String(!!current.cuts));
    const rows=current.cuts?current.ranked.filter(f=>f.cutStyle):current.all?current.ranked:current.ranked.slice(0,4);
    for(const [index,family] of rows.entries()){
      const card=document.createElement('button');card.type='button';card.className='journeyTemplate';card.dataset.family=family.id;
      card.setAttribute('aria-pressed',String(current.selected===family.id));card.setAttribute('aria-label',family.name);
      const tag=document.createElement('span');tag.className='journeyTag';tag.textContent=family.cutStyle?'Rasgadas y cortes':index===0?'Recomendado para tus fotos':'Colección '+String(index+1).padStart(2,'0');
      const previews=document.createElement('span');previews.className='journeyPreviews';previews.setAttribute('aria-hidden','true');
      let design=current.designs.get(family.id);
      if(!design){design=engine.generate({catalog,photos:current.photos,familyId:family.id,brief:answers(family.id),seed:current.seed,backgroundMode:S.frameBackground||'auto',backgroundColor:S.frameBackgroundColor,frameTreatment:S.frameTreatment||'gallery'});current.designs.set(family.id,design)}
      for(const sl of design.slides.slice(0,3)){
        const page=document.createElement('span');page.className='journeyPage';page.style.background=sl.bg;
        for(const layer of [...sl.layers].filter(l=>l.type==='img'||l.type==='deco').sort((a,b)=>a.z-b.z)){
          const im=document.createElement(layer.type==='img'?'img':'span');if(layer.type==='img'){im.src=layer.photo.url;im.alt=''}im.style.cssText=`position:absolute;left:${layer.x/340*100}%;top:${layer.y/425*100}%;width:${layer.w/340*100}%;height:${layer.h/425*100}%;transform:rotate(${layer.rot||0}deg);object-position:${50+(layer.offX||0)}% ${50+(layer.offY||0)}%;`;
          if(layer.frameCut)im.style.clipPath=FrameCuts.css(layer.frameCut);if(layer.type==='deco')im.style.background=layer.color;
          page.append(im);
        }
        previews.append(page);
      }
      const title=document.createElement('strong');title.textContent=family.name;
      const desc=document.createElement('small');desc.textContent=family.description;
      card.append(tag,previews,title,desc);
      card.onclick=()=>{current.selected=family.id;modal.querySelectorAll('[data-family]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.family===family.id)));q('journeyChoice').textContent=family.name+' · '+current.photos.length+' fotos'};
      q('journeyCards').append(card);
    }
    q('journeyMore').textContent=current.all||current.cuts?'Ver recomendados':'Explorar los '+catalog.families.length+' templates';
    q('journeyMore').hidden=false;q('journeyCreate').disabled=q('journeySurprise').disabled=false;
    q('journeyChoice').textContent=current.ranked.find(f=>f.id===current.selected)?.name+' · '+current.photos.length+' fotos';
  }
  function open(){
    if(session)throw Error('Template selection already active');
    let resolve;const promise=new Promise(r=>resolve=r);
    const current={resolve,urls:[],overflow:document.body.style.overflow,focus:document.activeElement,designs:new Map(),seed:Date.now()>>>0};session=current;
    modal.hidden=false;modal.scrollTop=0;document.body.style.overflow='hidden';
    q('journeyCuts').setAttribute('aria-pressed','false');q('journeyCards').replaceChildren();q('journeyStatus').textContent='Preparando tus fotos…';q('journeyChoice').textContent='Preparando vistas previas…';
    q('journeyCreate').disabled=q('journeySurprise').disabled=true;q('journeyMore').hidden=true;
    q('journeyLocation').value=S.frameLocation?.enabled?S.frameLocation.position:'off';q('journeyPlace').value=S.frameLocation?.source==='manual'?S.frameLocation.text:'';
    q('journeyCancel').focus({preventScroll:true});return {current,promise};
  }
  function ready(current,photos){if(session!==current)return;current.photos=photos;current.ranked=rank(photos);current.selected=current.ranked[0].id;q('journeyStatus').textContent=photos.length+' fotos · Vistas previas con tus imágenes';renderCards(current)}
  async function prepare(files,current){
    const photos=[...S.photos];
    // Decode sequentially and sample only 42px. No face detector, GPS or full analysis here.
    for(let i=0;i<files.length;i++){
      if(session!==current)return;
      const file=files[i],url=URL.createObjectURL(file);current.urls.push(url);
      const im=await new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('No se pudo abrir '+file.name));image.src=url});
      if(session!==current)return;
      const cv=document.createElement('canvas');cv.width=cv.height=42;const ctx=cv.getContext('2d');ctx.drawImage(im,0,0,42,42);
      photos.push({id:'preview_'+i,name:file.name,url,width:im.naturalWidth,height:im.naturalHeight,aspect:im.naturalWidth/im.naturalHeight,dominantColors:FramePhotoColors.extract(ctx.getImageData(0,0,42,42).data)});
      q('journeyStatus').textContent=files.length+' fotos seleccionadas · '+(i+1)+'/'+files.length;
      await new Promise(r=>setTimeout(r,0));
    }
    ready(current,photos);
  }
  function selectFiles(files){const {current,promise}=open();void prepare(files,current).catch(error=>{if(session===current){q('journeyStatus').textContent=error.message+'. Cierra y elige imágenes compatibles.';q('journeyChoice').textContent='Tu proyecto se conserva.'}});return promise}
  function choose(photos){const {current,promise}=open();try{ready(current,photos)}catch{finish(null)}return promise}
  return {selectFiles,choose};
})();
