(()=>{
const css=document.createElement('style');css.textContent=`
/* Rescue pass: selection is safe; editing is intentional */
.imgLayer,.textLayer{touch-action:manipulation!important}.imgLayer.isEditArmed,.textLayer.isEditArmed{touch-action:none!important;outline:2px solid rgba(255,255,255,.92)!important;outline-offset:3px}.editHint{position:fixed;left:50%;bottom:calc(164px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:95;display:none;gap:7px;padding:7px;border-radius:18px;background:rgba(17,17,20,.94);border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(18px)}.editHint.on{display:flex}.editHint button{min-height:38px;padding:0 13px;border-radius:12px;border:0;background:#28282e;color:#fff;font-size:11px;font-weight:700}.editHint .danger{background:#3a171b;color:#ff9da6}.textQuickEdit{display:flex;gap:8px;margin:10px 0 2px}.textQuickEdit button{flex:1;min-height:42px;border-radius:13px;border:1px solid #303036;background:#111114;color:#eee;font-weight:700}.textQuickEdit .danger{border-color:#55252b;color:#ff8e98}.textLayer{cursor:pointer}
`;document.head.appendChild(css);
let armed=null;
const bar=document.createElement('div');bar.className='editHint';bar.innerHTML='<button id="uxEdit">Editar</button><button id="uxMove">Mover</button><button class="danger" id="uxDelete">Eliminar</button>';document.body.appendChild(bar);
function layer(){if(!S.selected)return null;return S.slides[S.currentSlide]?.layers.find(l=>l.id===S.selected)||null}
function disarm(){if(armed){armed.classList.remove('isEditArmed');armed=null}bar.classList.remove('on');document.body.classList.remove('uxArmed')}
function selectOnly(el){disarm();const si=+el.dataset.slide,id=el.dataset.id,type=el.classList.contains('textLayer')?'text':'img';S.currentSlide=si;S.selected=id;S.selectedType=type;$('#uxEdit').textContent=type==='img'?'Reencuadrar':'Editar';$('#uxMove').hidden=type==='img';renderFilmstrip?.();renderSheets?.();bar.classList.add('on')}
function arm(){const el=document.querySelector(`.slide[data-slide="${S.currentSlide}"] [data-id="${S.selected}"]`)||document.querySelector(`[data-id="${S.selected}"]`);if(!el)return;disarm();armed=el;armed.classList.add('isEditArmed');bar.classList.add('on');document.body.classList.add('uxArmed');toast(S.selectedType==='text'?'Arrastra para mover el texto':'Arrastra para reencuadrar')}
function remove(){const sl=S.slides[S.currentSlide];if(!sl||!S.selected)return;pushHistory?.();const i=sl.layers.findIndex(l=>l.id===S.selected);if(i<0)return;sl.layers.splice(i,1);S.selected=null;S.selectedType=null;disarm();renderAll();saveProject();toast('Elemento eliminado')}
function openEditor(){if(S.selectedType==='text'){renderTextSheet();openSheet('#textSheet');setTimeout(()=>$('#textInput')?.focus(),100)}else{window.FRAME_openPhotoEditor?.()}}
bar.querySelector('#uxEdit').onclick=openEditor;bar.querySelector('#uxMove').onclick=arm;bar.querySelector('#uxDelete').onclick=remove;
// Capture touch before legacy handlers: a normal touch only selects. Movement requires explicit Mover.
document.addEventListener('touchstart',e=>{const el=e.target.closest?.('.imgLayer,.textLayer');if(!el)return;if(el===armed)return;e.stopImmediatePropagation();selectOnly(el)},{capture:true,passive:true});
document.addEventListener('touchmove',e=>{const el=e.target.closest?.('.imgLayer,.textLayer');if(el&&el!==armed)e.stopImmediatePropagation()},{capture:true,passive:true});
document.addEventListener('touchend',e=>{const el=e.target.closest?.('.imgLayer,.textLayer');if(el&&el!==armed){e.stopImmediatePropagation();bar.classList.add('on')}},{capture:true,passive:true});
document.addEventListener('click',e=>{const el=e.target.closest?.('.imgLayer,.textLayer');if(!el||el===armed)return;e.preventDefault();e.stopImmediatePropagation();selectOnly(el)},{capture:true});
// Double tap/click edits instead of moving.
document.addEventListener('dblclick',e=>{const el=e.target.closest?.('.imgLayer,.textLayer');if(!el)return;e.preventDefault();e.stopImmediatePropagation();selectOnly(el);openEditor()},{capture:true});
// Add an unmistakable delete action inside the text editor itself.
function injectDelete(){const sh=$('#textSheet');if(!sh||$('#uxTextActions'))return;const host=sh.querySelector('.sheetBody')||sh;const row=document.createElement('div');row.id='uxTextActions';row.className='textQuickEdit';row.innerHTML='<button id="uxDoneText">Listo</button><button class="danger" id="uxDeleteText">Eliminar texto</button>';host.appendChild(row);row.querySelector('#uxDoneText').onclick=()=>{closeSheets();disarm()};row.querySelector('#uxDeleteText').onclick=remove}
injectDelete();const mo=new MutationObserver(injectDelete);mo.observe(document.body,{childList:true,subtree:true});
// Tapping outside clears edit intent, not the layout.
document.addEventListener('click',e=>{if(!e.target.closest?.('.imgLayer,.textLayer,.editHint,.sheet'))disarm()});
})();