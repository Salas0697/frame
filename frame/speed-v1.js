(()=>{
const PREF='frame_speed_prefs_v1';
const css=document.createElement('style');css.textContent=`
.quickbar{display:grid;grid-template-columns:1fr 1.22fr 1fr;gap:8px;padding:0 16px 10px}.quickbar button{min-height:42px;padding:0 12px;border-radius:999px;border:1px solid #292930;background:#121215;font-size:11px;font-weight:750}.quickbar .newDesign{background:#f2f2f4;color:#09090b;border-color:#f2f2f4}.quickbar.busy{pointer-events:none}.quickbar.busy button{opacity:.42}.speedHidden{display:none!important}.fastToastAction{position:fixed;left:50%;bottom:calc(96px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:110;background:#f4f4f5;color:#09090b;padding:9px 13px;border-radius:999px;font-size:11px;font-weight:750;box-shadow:0 12px 40px rgba(0,0,0,.4);opacity:0;pointer-events:none;transition:.18s}.fastToastAction.on{opacity:1;pointer-events:auto}.studioTop{padding-bottom:5px}.studioTop h1{font-size:31px!important}.emptyQuick{display:none;margin:72px 22px 0;text-align:center}.emptyQuick.on{display:block}.emptyQuick .emptyIcon{width:62px;height:62px;margin:0 auto 18px;border-radius:22px;border:1px solid #292930;display:grid;place-items:center;font-size:27px;background:#111114}.emptyQuick b{display:block;font-size:19px}.emptyQuick small{display:block;color:#73737c;margin:8px auto 20px;max-width:245px;line-height:1.45}.emptyQuick button{min-height:48px;padding:0 22px;border:0;border-radius:999px;background:#f4f4f5;color:#0b0b0d;font-weight:800}.emptyQuick button:disabled{opacity:.55}.emptyStateFast .quickbar,.emptyStateFast #controlBar,.emptyStateFast .canvasWrap,.emptyStateFast .filmstrip,.emptyStateFast .pager,.emptyStateFast .dock{display:none!important}.emptyStateFast .studioTop #modeLabel{display:none}.emptyStateFast .studioTop{border-bottom:0!important}
.frameBriefBackdrop{position:fixed!important;inset:0!important;z-index:2147483000!important;background:rgba(4,4,6,.86)!important;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);display:none!important;visibility:hidden!important;pointer-events:none!important;opacity:0!important;align-items:flex-end;padding:12px 12px calc(12px + env(safe-area-inset-bottom));box-sizing:border-box;overflow-y:auto}.frameBriefBackdrop.on{display:flex!important;visibility:visible!important;pointer-events:auto!important;opacity:1!important}.frameBriefCard{max-height:calc(100dvh - 24px);overflow-y:auto;box-sizing:border-box;width:100%;max-width:520px;margin:0 auto;background:#121216;border:1px solid #2b2b31;border-radius:27px;padding:19px 16px 15px;box-shadow:0 28px 90px rgba(0,0,0,.58)}.frameBriefEyebrow{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#73737d;margin-bottom:6px}.frameBriefCard h3{font-size:20px;line-height:1.15;margin:0 0 7px}.frameBriefIntro{font-size:11px;line-height:1.45;color:#85858e;margin-bottom:16px}.briefQ{margin:13px 0}.briefQ b{display:block;font-size:11px;margin-bottom:8px}.briefChoices{display:grid;grid-template-columns:1fr 1fr;gap:7px}.briefChoices button{min-height:42px;border-radius:14px;border:1px solid #2e2e35;background:#0d0d10;color:#d8d8dd;font-size:11px;font-weight:700;padding:8px 10px}.briefChoices button.on{background:#f1f1f3;color:#0a0a0c;border-color:#f1f1f3}.briefDensity{grid-template-columns:repeat(3,1fr)}.briefActions{display:grid;grid-template-columns:.8fr 1.2fr;gap:8px;margin-top:15px}.briefActions button{min-height:46px;border-radius:999px;border:1px solid #2d2d33;background:#111115;color:#d7d7dc;font-weight:800}.briefActions .primary{background:#f4f4f5;color:#09090b;border-color:#f4f4f5}
`;document.head.appendChild(css);
let prefs={};try{prefs=JSON.parse(localStorage.getItem(PREF)||'{}')}catch(e){}
const studio=$('#studioScreen'),top=studio?.querySelector('.studioTop');
const qb=document.createElement('div');qb.className='quickbar';qb.innerHTML='<button id="fastAdd">＋ Fotos</button><button class="newDesign" id="fastNewDesign">✦ Otra opción</button><button id="fastExport">↑ Exportar</button>';if(top)top.after(qb);
const empty=document.createElement('div');empty.className='emptyQuick';empty.innerHTML='<div class="emptyIcon">▧</div><b>Empieza con tus fotos</b><small>Elige tus imágenes. Después FRAME te pregunta qué quieres lograr antes de diseñar.</small><button id="emptyAdd">＋ Elegir fotos</button>';if(qb)qb.after(empty);
const photoInput=$('#photosInput');
const undoAction=document.createElement('button');undoAction.className='fastToastAction';undoAction.textContent='Deshacer';document.body.appendChild(undoAction);
const brief=document.createElement('div');brief.className='frameBriefBackdrop';brief.id='frameBrief';brief.innerHTML=`<div class="frameBriefCard"><div class="frameBriefEyebrow">Fotos seleccionadas</div><h3>¿Qué quieres que haga este post?</h3><div class="frameBriefIntro" id="briefIntro">FRAME ya tiene tus fotos. Dale tres pistas rápidas antes de diseñar.</div><div class="briefQ"><b>1. ¿Qué quieres lograr?</b><div class="briefChoices" data-key="purpose"><button data-v="story" class="on">Contar una historia</button><button data-v="impact">Impactar</button><button data-v="memory">Guardar el momento</button><button data-v="showcase">Mostrar muchas fotos</button></div></div><div class="briefQ"><b>2. ¿Qué vibra buscas?</b><div class="briefChoices" data-key="vibe"><button data-v="clean" class="on">Editorial / limpio</button><button data-v="natural">Natural</button><button data-v="color">Color</button><button data-v="bold">Más atrevido</button></div></div><div class="briefQ"><b>3. ¿Cuánta información por slide?</b><div class="briefChoices briefDensity" data-key="density"><button data-v="airy">Con aire</button><button data-v="balanced" class="on">Equilibrado</button><button data-v="rich">Más fotos</button></div></div><div class="briefActions"><button id="briefSurprise">Sorpréndeme</button><button id="briefGo" class="primary">Diseñar ✦</button></div></div>`;document.body.appendChild(brief);
let busy=false,briefResolve=null,briefState={purpose:'story',vibe:'clean',density:'balanced'};
function setBusy(on){busy=on;qb.classList.toggle('busy',on);const eb=$('#emptyAdd');if(eb)eb.disabled=on}
function fire(primary,fallback){const a=$(primary);if(a){a.click();return true}const b=fallback?$(fallback):null;if(b){b.click();return true}return false}
function hideClutter(){const bar=$('#controlBar');if(bar)bar.classList.add('speedHidden');$('#randomBtn')?.classList.add('speedHidden');$('#slideBtn')?.classList.add('speedHidden')}
function emptyState(){const isEmpty=!S.photos?.length||!S.slides?.length;studio?.classList.toggle('emptyStateFast',isEmpty);empty.classList.toggle('on',isEmpty);if(isEmpty){const count=studio?.querySelector('.studioTop small');if(count)count.textContent='Nuevo proyecto'}return isEmpty}
hideClutter();emptyState();
function remember(){prefs.slides=S.slides?.length||prefs.slides;try{localStorage.setItem(PREF,JSON.stringify(prefs))}catch(e){console.warn('Preferences unavailable',e)}}
function snapshot(){return clone({slides:S.slides,currentSlide:S.currentSlide,randomMode:S.randomMode,showSafe:S.showSafe,finish:S.finish,designDNA:S.designDNA,frameBrief:S.frameBrief})}
let quickUndo=null,undoTimer=null;function offerUndo(snap,label){quickUndo=snap;undoAction.classList.add('on');clearTimeout(undoTimer);undoTimer=setTimeout(()=>undoAction.classList.remove('on'),3000);toast(label)}undoAction.onclick=()=>{if(!quickUndo||busy)return;Object.assign(S,quickUndo);quickUndo=null;undoAction.classList.remove('on');renderAll();saveProject();toast('Deshecho')};
function syncBriefUI(){brief.querySelectorAll('[data-key]').forEach(group=>{const key=group.dataset.key;group.querySelectorAll('button').forEach(b=>b.classList.toggle('on',briefState[key]===b.dataset.v))})}
brief.addEventListener('click',e=>{const b=e.target.closest('[data-key] button');if(!b)return;const g=b.closest('[data-key]');briefState[g.dataset.key]=b.dataset.v;syncBriefUI()});
let previousFocus=null, previousOverflow=null;
brief.setAttribute('role','dialog');
brief.setAttribute('aria-modal','true');
brief.setAttribute('aria-labelledby','frameBriefTitle');
brief.querySelector('h3').id='frameBriefTitle';
brief.querySelector('h3').textContent='¿Qué quieres hacer con este post?';
function showBrief(files,seed){
  const safe=seed&&typeof seed==='object'?seed:{};
  briefState={purpose:safe.purpose||'story',vibe:safe.vibe||'clean',density:safe.density||'balanced'};
  syncBriefUI();
  brief.querySelector('.frameBriefEyebrow').textContent=`${files.length} fotos seleccionadas`;
  $('#briefIntro').textContent='Dale tres pistas a FRAME antes de analizar y diseñar.';
  brief.dataset.photoCount=String(files.length);
  previousFocus=document.activeElement;
  previousOverflow=[document.body.style.overflow,document.documentElement.style.overflow];
  const result=new Promise(resolve=>{briefResolve=resolve});
  brief.classList.add('on');
  document.body.style.overflow='hidden';document.documentElement.style.overflow='hidden';
  $('#briefGo').focus({preventScroll:true});
  return result;
}
function hideBrief(){
  brief.classList.remove('on');
  if(previousOverflow){[document.body.style.overflow,document.documentElement.style.overflow]=previousOverflow;previousOverflow=null}
  if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
}
brief.addEventListener('keydown',e=>{
  if(e.key!=='Tab')return;
  const buttons=[...brief.querySelectorAll('button')],first=buttons[0],last=buttons.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
});
$('#briefGo').onclick=()=>{const r=briefResolve;briefResolve=null;hideBrief();r?.({...briefState})};
$('#briefSurprise').onclick=()=>{const r=briefResolve;briefResolve=null;hideBrief();r?.({purpose:'surprise',vibe:'surprise',density:'balanced'})};
function startPhotoFlow(){if(!busy)window.framePhotoImport.selectPhotos()}
$('#fastNewDesign').onclick=()=>{if(busy)return;if(emptyState()){startPhotoFlow();return}const snap=snapshot();setBusy(true);requestAnimationFrame(()=>{try{if(typeof window.FRAME_rebuildStory==='function')window.FRAME_rebuildStory();else fire('#directorBtn','#randomBtn');remember();offerUndo(snap,'Otra opción lista')}finally{setTimeout(()=>setBusy(false),180)}})};
$('#fastExport').onclick=()=>{if(busy)return;if(emptyState()){startPhotoFlow();return}if(!fire('#exportAllBtn','#exportBtn'))toast('Exportar no está disponible')};
$('#fastAdd').onclick=startPhotoFlow;$('#emptyAdd').onclick=startPhotoFlow;
const exportTool=$('#exportBtn');if(exportTool){let hold=false,timer;exportTool.onclick=null;exportTool.addEventListener('touchstart',()=>{hold=false;timer=setTimeout(()=>{hold=true;openSheet('#exportSheet')},520)},{passive:true});exportTool.addEventListener('touchend',e=>{clearTimeout(timer);if(!hold){e.preventDefault();fire('#exportAllBtn')}},{passive:false})}
const oldRenderAll=renderAll;renderAll=function(){oldRenderAll();requestAnimationFrame(emptyState)};const oldSave=saveProject;saveProject=function(){const saved=oldSave();remember();return saved};remember();
let persistenceWarning=false;
function progress(message){const loading=$('#loading');loading.querySelector('b').textContent=message;loading.querySelector('span').textContent='';loading.classList.add('on')}
function showStudio(){
  $('#uploadScreen').classList.remove('on');studio.classList.add('on');$('#newBtn').style.display='block';
  renderAll();
}
window.framePhotoImport=new PhotoImportController({
  input:photoInput,
  isBlocked:()=>busy,
  setBusy:on=>{setBusy(on);photoInput.disabled=on;$('#resumeBtn').disabled=on;$('#newBtn').disabled=on},
  requestBrief:files=>showBrief(files,S.frameBrief),
  showProgress:progress,
  hideProgress:()=>{hideBrief();$('#loading').classList.remove('on');emptyState()},
  yieldToPaint:()=>new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0))),
  analyzePhotos:FramePhotoAnalysis.analyzePhotos,
  checkpoint:()=>({state:{...S},studio:studio.classList.contains('on')}),
  commitPhotos:(photos,answers)=>{S.photos=[...S.photos,...photos];S.frameBrief=answers;persistenceWarning=false},
  generateStoryboard:()=>buildSlides(),
  render:showStudio,
  persistPhotos:async(files,photos)=>{
    try{await FramePhotoStore.put(files,photos)}catch(error){persistenceWarning=true;console.warn('Original photo storage failed',error)}
    if(!saveProject())persistenceWarning=true;
  },
  rollback:checkpoint=>{S=checkpoint.state;studio.classList.toggle('on',checkpoint.studio);$('#uploadScreen').classList.toggle('on',!checkpoint.studio);renderAll()},
  releasePhotos:photos=>photos.forEach(photo=>URL.revokeObjectURL(photo.url)),
  onSuccess:count=>toast(persistenceWarning?'Fotos listas; no se pudo guardar en este dispositivo':`${count} fotos listas`),
  onError:error=>{console.warn('Photo import failed',error);toast('No pude añadir esas fotos. Tu proyecto se conserva.')},
  onPhase:(phase,count)=>{
    document.documentElement.dataset.photoImportPhase=phase;
    document.dispatchEvent(new CustomEvent('frame:import-phase',{detail:{phase,count}}));
  }
});
$('#resumeBtn').onclick=async()=>{
  if(busy)return;
  setBusy(true);photoInput.disabled=true;
  const previous=S;
  try{
    progress('Restaurando tus fotos…');
    let saved;
    try{saved=JSON.parse(localStorage.getItem(SAVE_KEY)||'null')}catch(e){}
    if(!saved?.photos?.length||!Array.isArray(saved.slides))throw new Error('No saved project');
    await FramePhotoStore.restore(saved);
    S=saved;showStudio();toast('Proyecto restaurado');
  }catch(error){S=previous;console.warn('Project restore failed',error);toast('No pude restaurar los originales guardados')}
  finally{$('#loading').classList.remove('on');photoInput.disabled=false;setBusy(false)}
};
})();