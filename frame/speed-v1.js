(()=>{
const PREF='frame_speed_prefs_v1';
const css=document.createElement('style');css.textContent=`
.quickbar{display:grid;grid-template-columns:1fr 1.22fr;gap:8px;padding:0 16px 10px}.quickbar button{min-height:42px;padding:0 12px;border-radius:999px;border:1px solid #292930;background:#121215;font-size:11px;font-weight:750}.quickbar .newDesign{background:#f2f2f4;color:#09090b;border-color:#f2f2f4}.quickbar.busy{pointer-events:none}.quickbar.busy button{opacity:.42}.speedHidden{display:none!important}.fastToastAction{position:fixed;left:50%;bottom:calc(96px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:110;background:#f4f4f5;color:#09090b;padding:9px 13px;border-radius:999px;font-size:11px;font-weight:750;box-shadow:0 12px 40px rgba(0,0,0,.4);opacity:0;pointer-events:none;transition:.18s}.fastToastAction.on{opacity:1;pointer-events:auto}.studioTop{padding-bottom:5px}.studioTop h1{font-size:31px!important}.emptyQuick{display:none;margin:72px 22px 0;text-align:center}.emptyQuick.on{display:block}.emptyQuick .emptyIcon{width:62px;height:62px;margin:0 auto 18px;border-radius:22px;border:1px solid #292930;display:grid;place-items:center;font-size:27px;background:#111114}.emptyQuick b{display:block;font-size:19px}.emptyQuick small{display:block;color:#73737c;margin:8px auto 20px;max-width:245px;line-height:1.45}.emptyQuick button{min-height:48px;padding:0 22px;border:0;border-radius:999px;background:#f4f4f5;color:#0b0b0d;font-weight:800}.emptyQuick button:disabled{opacity:.55}.emptyStateFast .quickbar,.emptyStateFast #controlBar,.emptyStateFast .canvasWrap,.emptyStateFast .filmstrip,.emptyStateFast .pager,.emptyStateFast .dock{display:none!important}.emptyStateFast .studioTop #modeLabel{display:none}.emptyStateFast .studioTop{border-bottom:0!important}
.nav .persistentExport{min-height:44px;background:#efeee8;color:#111;border-color:#efeee8;font-weight:700;padding:0 14px}.nav .persistentExport:disabled{opacity:.45}
.locationPrompt{margin-top:13px}.locationManual{display:block;font-size:11px;margin:12px 0 6px;color:#bbb}#briefLocationText,#locationText{width:100%;box-sizing:border-box;min-height:44px;border:1px solid #34343a;background:#0d0d10;color:#eee;border-radius:10px;padding:10px;font-size:16px}.locationHint{font-size:11px;line-height:1.5;color:#999;margin:8px 0 0}.locationHint a{color:inherit}.locationControls{padding:6px 0 10px}.locationControls label{display:block;margin:8px 0}.locationControls select{width:100%}.frameBriefCard [hidden]{display:none!important}
`;document.head.appendChild(css);
let prefs={};try{prefs=JSON.parse(localStorage.getItem(PREF)||'{}')}catch(e){}
const studio=$('#studioScreen'),top=studio?.querySelector('.studioTop');
const qb=document.createElement('div');qb.className='quickbar';qb.innerHTML='<button id="fastAdd">＋ Fotos</button><button class="newDesign" id="fastNewDesign">✦ Otra opción</button><button id="fastExport">↑ Exportar</button>';if(top)top.after(qb);
const persistentExport=$('#fastExport');persistentExport.className='chipBtn persistentExport';document.querySelector('.navBtns')?.prepend(persistentExport);
const empty=document.createElement('div');empty.className='emptyQuick';empty.innerHTML='<div class="emptyIcon">▧</div><b>Empieza con tus fotos</b><small>Elige tus imágenes. Elige un template con tus fotos y crea tu carrusel.</small><button id="emptyAdd">＋ Elegir fotos</button>';if(qb)qb.after(empty);
const photoInput=$('#photosInput');
const undoAction=document.createElement('button');undoAction.className='fastToastAction';undoAction.textContent='Deshacer';document.body.appendChild(undoAction);
let busy=false;
function setBusy(on){busy=on;qb.classList.toggle('busy',on);const eb=$('#emptyAdd');if(eb)eb.disabled=on}
function fire(primary,fallback){const a=$(primary);if(a){a.click();return true}const b=fallback?$(fallback):null;if(b){b.click();return true}return false}
function hideClutter(){const bar=$('#controlBar');if(bar)bar.classList.add('speedHidden');$('#randomBtn')?.classList.add('speedHidden');$('#slideBtn')?.classList.add('speedHidden')}
function emptyState(){const isEmpty=!S.photos?.length||!S.slides?.length;studio?.classList.toggle('emptyStateFast',isEmpty);persistentExport.style.display=!isEmpty&&studio?.classList.contains('on')?'block':'none';empty.classList.toggle('on',isEmpty);if(isEmpty){const count=studio?.querySelector('.studioTop small');if(count)count.textContent='Nuevo proyecto'}return isEmpty}
hideClutter();emptyState();
function remember(){prefs.slides=S.slides?.length||prefs.slides;try{localStorage.setItem(PREF,JSON.stringify(prefs))}catch(e){console.warn('Preferences unavailable',e)}}
function snapshot(){return clone({slides:S.slides,currentSlide:S.currentSlide,randomMode:S.randomMode,showSafe:S.showSafe,finish:S.finish,designDNA:S.designDNA,frameBrief:S.frameBrief,frameTemplateFamily:S.frameTemplateFamily||'',frameCaption:S.frameCaption||'',frameArtDirection:S.frameArtDirection||'',frameLastDesign:S.frameLastDesign||null,frameBackground:S.frameBackground||'auto',frameBackgroundColor:S.frameBackgroundColor||null,frameTreatment:S.frameTreatment||'gallery',heroPhotoId:S.heroPhotoId||null,frameLocation:S.frameLocation||null})}
let quickUndo=null,undoTimer=null;function offerUndo(snap,label){quickUndo=snap;undoAction.classList.add('on');clearTimeout(undoTimer);undoTimer=setTimeout(()=>undoAction.classList.remove('on'),3000);toast(label)}undoAction.onclick=()=>{if(!quickUndo||busy)return;Object.assign(S,quickUndo);quickUndo=null;undoAction.classList.remove('on');renderAll();saveProject();toast('Deshecho')};
function startPhotoFlow(){if(!busy)window.framePhotoImport.selectPhotos()}
$('#fastNewDesign').onclick=()=>{if(busy)return;if(emptyState()){startPhotoFlow();return}const snap=snapshot();setBusy(true);requestAnimationFrame(()=>{try{if(typeof window.FRAME_rebuildStory==='function')window.FRAME_rebuildStory();else fire('#directorBtn','#randomBtn');remember();offerUndo(snap,'Otra opción lista')}finally{setTimeout(()=>setBusy(false),180)}})};
$('#fastExport').onclick=()=>{if(busy)return;if(emptyState()){startPhotoFlow();return}openSheet('#exportSheet')};
$('#fastAdd').onclick=startPhotoFlow;$('#emptyAdd').onclick=startPhotoFlow;
const exportTool=$('#exportBtn');if(exportTool)exportTool.onclick=()=>{if(!busy&&!exportBusy)openSheet('#exportSheet')};
const oldRenderAll=renderAll;renderAll=function(){emptyState();oldRenderAll()};const oldSave=saveProject;saveProject=function(){const saved=oldSave();remember();return saved};remember();
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
  requestTemplate:files=>FrameJourney.selectFiles(files),
  showProgress:progress,
  hideProgress:()=>{$('#loading').classList.remove('on');emptyState()},
  yieldToPaint:()=>new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0))),
  analyzePhotos:FramePhotoAnalysis.analyzePhotos,
  checkpoint:()=>({state:{...S},studio:studio.classList.contains('on')}),
  commitPhotos:(photos,answers)=>{S.photos=[...S.photos,...photos];S.frameBrief=answers;S.frameTemplateFamily=answers.familyId;S.frameLocation=FramePhotoLocation.settings(answers,S.photos);persistenceWarning=false},
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
    await FramePhotoColors.ensure(saved.photos);
    S=saved;showStudio();toast('Proyecto restaurado');
  }catch(error){S=previous;console.warn('Project restore failed',error);toast('No pude restaurar los originales guardados')}
  finally{$('#loading').classList.remove('on');photoInput.disabled=false;setBusy(false)}
};
})();