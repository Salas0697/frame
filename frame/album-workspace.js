/* Progressive controls, reversible proposals and portable project recovery. */
(() => {
  const studio=$('#studioScreen'),bar=studio.querySelector('.templateBar');
  const tools=document.createElement('details');tools.id='albumTools';tools.className='albumTools';
  tools.innerHTML='<summary>Ajustes y proyecto</summary><div class="albumToolsBody"></div>';
  const body=tools.querySelector('div');bar.after(tools);
  for(const el of [...bar.children])if(el.matches('details,#collectionNote'))body.append(el);
  const extra=document.createElement('div');extra.className='albumActions';body.append(extra);
  for(const id of ['textBtn','photoBtn','finishBtn','slidesBtn'])extra.append($('#'+id));
  $('#finishBtn').textContent='Acabado';$('#slidesBtn').textContent='Páginas';body.append(extra);
  const project=document.createElement('div');project.className='projectActions';
  project.innerHTML='<p>Tu proyecto</p><button id="backupProjectBtn">Guardar copia .frame</button><button id="openProjectBtn">Abrir copia</button><small>Incluye tus fotos y ajustes para continuar en otro dispositivo. Hasta 250 MB.</small>';
  body.append(project);bar.after(tools);
  const status=document.createElement('span');status.id='projectStatus';status.setAttribute('role','status');studio.querySelector('.subline').after(status);
  $('#newBtn').textContent='+';$('#fastAdd').textContent='+ Fotos';$('#newBtn').setAttribute('aria-label','Nuevo proyecto');
  $('#undoBtn').setAttribute('aria-label','Deshacer');$('#redoBtn').setAttribute('aria-label','Rehacer');

  const narrative=document.createElement('div');narrative.className='narrativeControls';
  narrative.innerHTML='<label for="albumDirection">Historia del álbum</label><select id="albumDirection"><option value="">Composición original</option></select><p id="narrativeDescription"></p>';
  for(const [value,d] of Object.entries(FrameNarrative.directions))narrative.querySelector('select').append(new Option(d.name,value));
  body.prepend(narrative);
  const compareButton=document.createElement('button');compareButton.id='compareAlbumBtn';compareButton.textContent='Comparar';compareButton.setAttribute('aria-haspopup','dialog');document.querySelector('.quickbar').append(compareButton);
  const dialog=document.createElement('dialog');dialog.id='albumCompare';dialog.setAttribute('aria-labelledby','compareTitle');
  dialog.innerHTML='<div class="compareHeading"><div><small>UN ÁLBUM, TRES MIRADAS</small><h2 id="compareTitle">Encuentra tu ritmo.</h2></div><button id="closeComparison" aria-label="Cerrar comparación">Cerrar</button></div><p class="compareIntro">Compara con tu álbum actual. Tus ajustes se conservan hasta que elijas otra propuesta.</p><div id="albumProposals"></div><div class="compareFooter"><button id="keepCurrentAlbum">Conservar actual</button><button id="applyAlbumProposal">Usar esta opción</button></div>';
  document.body.append(dialog);
  let proposals=[],selected=0,returnFocus=null;
  const blocked=()=>window.framePhotoImport?.active||exportBusy||document.documentElement.dataset.projectBusy==='true';
  function sync(){
    if(S.frameLocation?.enabled&&!S.frameLocation.text)tools.open=true;
    status.hidden=!S.photos.length;
    status.textContent=S.storageReady===false?'Sin guardar':blocked()?'Preparando…':'Guardado';
    status.dataset.saved=String(S.storageReady!==false);status.setAttribute('aria-label',S.storageReady===false?'El proyecto actual no está guardado':'Proyecto guardado en este dispositivo');
    $('#albumDirection').value=S.frameNarrative||'';
    $('#narrativeDescription').textContent=FrameNarrative.directions[S.frameNarrative]?.description||'Elige cómo se recorre tu álbum, además de su estilo visual.';
    for(const id of ['compareAlbumBtn','backupProjectBtn','albumDirection','retrySaveBtn','backupNoticeBtn'])$('#'+id).disabled=blocked()||!S.photos.length;
    $('#openProjectBtn').disabled=blocked();homeOpen.disabled=blocked();
  }
  $('#albumDirection').onchange=()=>{if(blocked()||!S.photos.length)return;pushHistory();S.frameNarrative=$('#albumDirection').value;window.FRAME_generateStory();renderAll()};
  function thumbnail(slide){
    const wrap=document.createElement('div');wrap.className='proposalPage';wrap.style.background=slide.bg;wrap.style.filter=FrameFinish.filter(S.finish);
    for(const l of [...slide.layers].filter(l=>!l.hidden).sort((a,b)=>a.z-b.z)){
      let el;
      if(l.type==='img'){
        el=FrameCrop.imageElement(l,l.w*.3,l.h*.3).box;el.style.left=l.x*.3+'px';el.style.top=l.y*.3+'px';
      }else{
        el=document.createElement('div');el.style.position='absolute';el.style.left=l.x*.3+'px';el.style.top=l.y*.3+'px';el.style.width=l.w*.3+'px';el.style.transform=`rotate(${l.rot||0}deg)`;
        if(l.type==='text'){el.textContent=l.text;Object.assign(el.style,{fontSize:l.size*.3+'px',fontFamily:ff(l.font),fontWeight:String(l.weight),color:l.color,lineHeight:'.9',whiteSpace:'pre-wrap'})}
        else{Object.assign(el.style,{height:l.h*.3+'px',background:l.color,borderRadius:l.kind==='circle'?'50%':'0'});if(l.frameCut)el.style.clipPath=FrameCuts.css(l.frameCut)}
      }
      el.style.zIndex=l.z;wrap.append(el);
    }
    return wrap;
  }
  function choose(index){selected=index;dialog.querySelectorAll('.albumProposal').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));$('#applyAlbumProposal').disabled=index===0}
  compareButton.onclick=()=>{
    if(blocked()||!S.photos.length)return;returnFocus=compareButton;
    const original=S,baseline=FrameProjectState.snapshot(S);
    proposals=[{name:'A · Tu álbum actual',description:'La composición que ya tienes, con todos tus ajustes.',state:baseline}];
    try{
      for(const [direction,d] of Object.entries(FrameNarrative.directions)){
        S={...original,...FrameProjectState.snapshot(original),frameNarrative:direction,history:[],future:[]};
        window.FRAME_generateStory();FramePhotoLocation.decorate(S.slides,S.frameLocation,FrameTemplateEngine.captionInk);
        proposals.push({name:String.fromCharCode(65+proposals.length)+' · '+d.name,description:d.description,state:FrameProjectState.snapshot(S)});
      }
    }finally{S=original}
    const grid=$('#albumProposals');grid.replaceChildren();
    proposals.forEach((p,index)=>{
      const button=document.createElement('button');button.type='button';button.className='albumProposal';button.setAttribute('aria-label',p.name);button.onclick=()=>choose(index);
      const title=document.createElement('strong');title.textContent=p.name;
      const strip=document.createElement('div');strip.className='proposalStrip';p.state.slides.forEach(sl=>strip.append(thumbnail(sl)));
      const description=document.createElement('p');description.textContent=p.description;
      const count=document.createElement('small');count.textContent=p.state.slides.length+' páginas · '+S.photos.length+' fotos';button.append(title,strip,description,count);grid.append(button);
    });choose(0);dialog.showModal();$('#closeComparison').focus();
  };
  $('#closeComparison').onclick=$('#keepCurrentAlbum').onclick=()=>dialog.close();
  $('#applyAlbumProposal').onclick=()=>{if(selected===0||blocked())return;pushHistory();FrameProjectState.apply(S,proposals[selected].state);renderAll();dialog.close();toast('Propuesta conservada. Puedes deshacer el cambio.')};
  dialog.addEventListener('close',()=>{proposals=[];$('#albumProposals').replaceChildren();returnFocus?.focus()});

  async function original(photo){
    try{return (await FramePhotoStore.originals([photo]))[0]}
    catch{const response=await fetch(photo.url);if(!response.ok)throw Error('Original unavailable');return new File([await response.blob()],photo.name,{type:photo.sourceType||response.headers.get('Content-Type')||'image/jpeg'})}
  }
  async function persist(){
    try{
      for(const photo of S.photos){
        try{await FramePhotoStore.originals([photo])}catch{await FramePhotoStore.put([await original(photo)],[photo])}
      }
      S.storageReady=true;if(!saveProject({allowImport:true}))throw Error('Metadata unavailable');
      try{await FramePhotoStore.prune(S.photos.map(p=>p.id))}catch(error){console.warn('Original cleanup deferred',error)}
      sync();return true;
    }catch(error){S.storageReady=false;FrameLifecycle.emit('afterSave',S,false);sync();console.warn('Project persistence failed',error);return false}
  }
  $('#retrySaveBtn').onclick=()=>window.FRAME_projectTask(async()=>{toast(await persist()?'Proyecto guardado':'No se pudo guardar. Puedes guardar una copia .frame.')});
  async function backup(){
    return window.FRAME_projectTask(async()=>{
      try{const snapshot={...FrameProjectState.snapshot(S),photos:S.photos.map(p=>({...p}))},files=[];for(const photo of snapshot.photos)files.push(await original(photo));const copy=FrameProjectFile.create(snapshot,files);downloadExport(copy,copy.name);toast('Copia del proyecto preparada')}
      catch(error){console.warn('Project backup failed',error);toast('No pude preparar la copia. Comprueba el tamaño y vuelve a intentar.')}
    });
  }
  $('#backupProjectBtn').onclick=$('#backupNoticeBtn').onclick=backup;
  const picker=document.createElement('input');picker.id='projectFileInput';picker.type='file';picker.accept='.frame';picker.hidden=true;document.body.append(picker);
  const homeOpen=document.createElement('button');homeOpen.id='homeOpenProjectBtn';homeOpen.className='choice';homeOpen.textContent='Abrir copia de proyecto';$('#resumeBtn').parentElement.append(homeOpen);
  $('#openProjectBtn').onclick=homeOpen.onclick=()=>{if(!blocked()){picker.value='';picker.click()}};
  picker.onchange=()=>{const file=picker.files[0];picker.value='';if(!file)return;void window.FRAME_projectTask(async()=>{
    const urls=[];let previous=null;
    try{
      const {project,files}=await FrameProjectFile.read(file);
      if(S.photos.length&&!confirm('¿Abrir esta copia? Reemplazará el álbum actual.'))return;
      const restored=new Map(project.photos.map((photo,i)=>{const url=URL.createObjectURL(files[i]);urls.push(url);return [photo.id,{...photo,id:uid(),url}]}));
      project.photos=project.photos.map(p=>restored.get(p.id));
      project.slides.forEach(sl=>{if(sl.storySpan)sl.storySpan.photoId=restored.get(sl.storySpan.photoId)?.id;sl.layers.forEach(l=>{if(l.type==='img')l.photo=restored.get(l.photo.id)})});
      project.heroPhotoId=restored.get(project.heroPhotoId)?.id||null;
      previous=S;S={...project,storageReady:false,history:[],future:[],selected:null,selectedType:null};
      $('#uploadScreen').classList.remove('on');studio.classList.add('on');$('#newBtn').style.display='block';renderAll();
      const saved=await persist();previous.photos.forEach(p=>URL.revokeObjectURL(p.url));
      toast(saved?'Copia abierta y guardada':'Copia abierta. Guarda una copia antes de cerrar.');
    }catch(error){if(previous){S=previous;studio.classList.toggle('on',!!S.photos.length);$('#uploadScreen').classList.toggle('on',!S.photos.length);renderAll()}urls.forEach(url=>URL.revokeObjectURL(url));console.warn('Project restore failed',error);toast('No pude abrir esa copia. Tu álbum se conserva.')}
  })};
  FrameLifecycle.on('afterRender',sync);FrameLifecycle.on('afterSave',sync);
  document.addEventListener('frame:import-phase',sync);
  new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['data-project-busy']});
  const style=document.createElement('style');style.textContent=`
    .quickbar{grid-template-columns:.8fr 1.25fr .85fr;padding-bottom:8px}.quickbar button{padding:0 8px}.navBtns{gap:5px}#projectStatus{display:block;margin:6px 0 0;color:#aebaaa;font-size:10px}#projectStatus[data-saved=false]{color:#eec995}#projectStatus[hidden]{display:none}
    .templateBar{padding-bottom:8px}.albumTools{margin:0 16px 8px;border-bottom:1px solid #292929;color:#c1bfb6;font-size:12px}.albumTools>summary{min-height:40px;display:flex;align-items:center;cursor:pointer;list-style:none}.albumTools>summary:after{content:'+';margin-left:auto}.albumTools[open]>summary:after{content:'-'}.albumToolsBody{padding:0 0 15px}.albumToolsBody .collectionNote{padding:8px 0}.narrativeControls label{display:block;margin:10px 0 6px}.narrativeControls select{width:100%;min-height:44px;border:1px solid #373738;border-radius:10px;background:#19191b;padding:0 10px}.narrativeControls p,.projectActions small{font-size:11px;line-height:1.5;color:#aaa}.albumActions,.projectActions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.albumActions .tool,.albumActions .pill,.projectActions button,.storageActions button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;height:auto;gap:6px;padding:0 12px;border:1px solid #373738;border-radius:10px;font-size:11px;color:#eee;background:#19191b}.projectActions p,.projectActions small{width:100%;margin:0}.storageActions{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.dock{display:none}.filmstrip{bottom:calc(14px + env(safe-area-inset-bottom))}.pager{bottom:calc(104px + env(safe-area-inset-bottom))}.editHint,.contextBar{bottom:calc(115px + env(safe-area-inset-bottom))}.bottomSpace{height:125px}.journeyEditorHint{display:none}#analysisNotice{margin:0 16px 8px;font-size:10px}.toast{top:auto;bottom:calc(156px + env(safe-area-inset-bottom));white-space:normal;max-width:90vw;text-align:center}.toast.on{transform:translateX(-50%) translateY(0)}
    #albumCompare{position:fixed;inset:0;margin:auto;width:calc(100% - 24px);max-width:800px;max-height:calc(100dvh - 24px);padding:20px;background:#151517;color:#efeee8;border:1px solid #41413e;border-radius:20px;overflow:auto}#albumCompare::backdrop{background:#050505ce;backdrop-filter:blur(8px)}.compareHeading{display:flex;justify-content:space-between;gap:10px;align-items:center}.compareHeading small{font-size:9px;letter-spacing:.15em;color:#aaa}.compareHeading h2{font:normal 30px Georgia,serif;margin:8px 0}.compareHeading button,.compareFooter button{min-height:44px;padding:0 12px;background:#27272a;border:1px solid #444;border-radius:10px}.compareIntro{font-size:12px;line-height:1.5;color:#aaa}#albumProposals{display:grid;grid-template-columns:1fr 1fr;gap:12px}.albumProposal{min-width:0;padding:12px;text-align:left;border:1px solid #3b3b3e;border-radius:12px;background:#202023}.albumProposal[aria-pressed=true]{outline:2px solid #e9e5d6;border-color:#e9e5d6}.albumProposal strong{display:block;font-size:13px}.albumProposal p{font-size:11px;line-height:1.5;color:#bbb}.albumProposal small{font-size:10px;color:#b2b2ac}.proposalStrip{display:flex;gap:6px;overflow:auto;margin:12px 0}.proposalPage{position:relative;flex:0 0 102px;width:102px;height:127.5px;overflow:hidden}.compareFooter{position:sticky;bottom:-20px;display:flex;gap:8px;background:#151517;padding:15px 0;margin-top:10px}.compareFooter button{flex:1;font-size:12px}#applyAlbumProposal{background:#eae8dd;color:#111}#applyAlbumProposal:disabled{opacity:.45}
    @media(max-width:350px){#albumProposals{grid-template-columns:1fr}}@media(prefers-reduced-motion:reduce){#albumCompare::backdrop{backdrop-filter:none}}
  `;document.head.append(style);sync();
})();
