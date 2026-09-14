/* Dedicated crop transaction. Draft changes never touch the project until Done. */
(()=>{
 const css=document.createElement('style');css.textContent='.photoClip{position:absolute;overflow:hidden;touch-action:manipulation}.photoClip>.imgLayer{max-width:none!important;max-height:none!important;margin:0;border-radius:0}.photoEditOverlay{position:fixed;inset:0;z-index:220;display:none;background:#101011;padding:env(safe-area-inset-top) 16px env(safe-area-inset-bottom);box-sizing:border-box}.photoEditOverlay.on{display:flex;flex-direction:column;height:100dvh}.peTop{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:64px}.peTop b{font-size:14px}.peTop button{min-height:44px;padding:0 12px;color:#f7f7f5;font-size:14px}.peTop .peDone{background:#f7f7f5;color:#111;border-radius:24px;font-weight:700}.peStage{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:12px 0;background:#080808;border-radius:12px;overflow:hidden}.peFrame{position:relative;overflow:hidden;touch-action:none;user-select:none;outline:1px solid #ffffff30}.peFrame img{position:absolute;max-width:none;max-height:none;user-select:none;-webkit-user-drag:none;pointer-events:none}.peFrame:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,transparent 33.1%,#ffffff25 33.2%,#ffffff25 33.5%,transparent 33.6%,transparent 66.4%,#ffffff25 66.5%,#ffffff25 66.8%,transparent 66.9%),linear-gradient(transparent 33.1%,#ffffff25 33.2%,#ffffff25 33.5%,transparent 33.6%,transparent 66.4%,#ffffff25 66.5%,#ffffff25 66.8%,transparent 66.9%)}.peBottom{padding:12px 0 14px;max-height:40dvh;overflow:auto}.peHint{font-size:11px;text-align:center;color:#999;margin:0 0 12px}.peActions{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.peActions button{min-height:44px;border:1px solid #343436;border-radius:12px;font-size:11px;color:#ddd}.peActions button[aria-pressed=true]{background:#efefec;color:#111;border-color:#efefec}.peSlider{display:flex;gap:12px;align-items:center;margin:12px 0}.peSlider input{flex:1;min-width:0;accent-color:#eee;height:36px}.peSlider span{font-size:11px;color:#bbb}.peHero{width:100%;min-height:44px;border:1px solid #4b4b4d;border-radius:12px;color:#eee;font-size:12px}.peFrame:focus-visible{outline:2px solid #fff}';document.head.append(css);
 const ov=document.createElement('div');ov.id='photoEditV2';ov.className='photoEditOverlay';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','peTitle');
 ov.innerHTML='<div class="peTop"><button id="peCancel">Cancelar</button><b id="peTitle">Reencuadrar</b><button id="peDone" class="peDone">Listo</button></div><div class="peStage"><div id="peFrame" class="peFrame" tabindex="0" aria-label="Encuadre de la foto; arrastra o usa las flechas"><img id="peImg" alt=""></div></div><div class="peBottom"><p class="peHint">Arrastra la foto · Pellizca para acercar</p><div class="peActions"><button id="peContain">Foto completa</button><button id="peCover">Llenar marco</button><button id="peCenter">Centrar</button></div><div class="peSlider"><span>Zoom</span><input id="peZoom" aria-label="Zoom de la foto" type="range" min="1" max="3" step=".01"><span id="peZoomVal"></span></div><button id="peHero" class="peHero">Usar como portada</button></div>';document.body.append(ov);
 const frame=$('#peFrame'),im=$('#peImg'),zr=$('#peZoom'),pointers=new Map();
 let edit=null,gesture=null,previousFocus=null,oldOverflow=null;
 function paint(){
  if(!edit)return;const area=frame.parentElement,r=edit.draft.w/edit.draft.h;
  const aw=area.clientWidth||300,ah=Math.max(1,(area.clientHeight||350)-24),w=Math.max(1,Math.min(aw-24,ah*r)),h=w/r;
  frame.style.width=w+'px';frame.style.height=h+'px';frame.style.background=edit.bg;
  const g=FrameCrop.geometry(edit.draft,w,h);Object.assign(im.style,{width:g.w+'px',height:g.h+'px',left:g.x+'px',top:g.y+'px'});
  zr.value=edit.draft.zoom;$('#peZoomVal').textContent=Number(edit.draft.zoom).toFixed(2)+'×';
  $('#peContain').setAttribute('aria-pressed',String(edit.draft.fit==='contain'));$('#peCover').setAttribute('aria-pressed',String(edit.draft.fit!=='contain'));
 }
 function open(){
  const l=S.slides?.[S.currentSlide]?.layers.find(l=>l.id===S.selected);if(!l||l.type!=='img')return;
  previousFocus=document.activeElement;oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';closeSheets();
  edit={layer:l,draft:{...l,fit:l.fit||'cover',zoom:l.zoom||1,offX:l.offX||0,offY:l.offY||0},bg:S.slides[S.currentSlide].bg};
  im.src=l.photo.url;im.alt=l.photo.name||'Foto seleccionada';$('#peHero').textContent=S.heroPhotoId===l.photo.id?'Portada fijada · liberar':'Usar como portada';
  ov.classList.add('on');requestAnimationFrame(()=>{paint();frame.focus({preventScroll:true})});
 }
 function close(save,hero=false){
  if(!edit)return;
  if(save){
   pushHistory();
   const targets=edit.layer.storySpan?S.slides.flatMap(sl=>sl.layers).filter(l=>l.storySpan&&l.photo.id===edit.layer.photo.id):[edit.layer];
   for(const l of targets)Object.assign(l,{fit:edit.draft.fit,zoom:edit.draft.zoom,offX:edit.draft.offX,offY:edit.draft.offY,userTouched:true});
   if(hero){S.heroPhotoId=S.heroPhotoId===edit.layer.photo.id?null:edit.layer.photo.id;window.FRAME_generateStory()}
  }
  edit=null;gesture=null;pointers.clear();ov.classList.remove('on');document.body.style.overflow=oldOverflow||'';
  if(save){renderAll();saveProject();toast(hero?'Portada actualizada':'Encuadre guardado')}
  if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
 }
 window.FRAME_openPhotoEditor=open;
 $('#peCancel').onclick=()=>close(false);$('#peDone').onclick=()=>close(true);$('#peHero').onclick=()=>close(true,true);
 $('#peContain').onclick=()=>{if(edit){Object.assign(edit.draft,{fit:'contain',zoom:1,offX:0,offY:0});paint()}};
 $('#peCover').onclick=()=>{if(edit){Object.assign(edit.draft,{fit:'cover',zoom:1,offX:0,offY:0});paint()}};
 $('#peCenter').onclick=()=>{if(edit){edit.draft.offX=edit.draft.offY=0;paint()}};
 zr.oninput=()=>{if(!edit)return;const r=frame.getBoundingClientRect(),center={x:r.width/2,y:r.height/2};edit.draft=FrameCrop.pinch(edit.draft,r.width,r.height,+zr.value,center,center);paint()};
 function center(points){return points.reduce((a,p)=>({x:a.x+p.x/points.length,y:a.y+p.y/points.length}),{x:0,y:0})}
 function startGesture(){if(!edit)return;const ps=[...pointers.values()],r=frame.getBoundingClientRect();gesture={draft:{...edit.draft},center:center(ps),dist:ps.length>1?Math.hypot(ps[1].x-ps[0].x,ps[1].y-ps[0].y):0,w:r.width,h:r.height}}
 frame.addEventListener('pointerdown',e=>{if(!edit)return;e.preventDefault();frame.setPointerCapture(e.pointerId);const r=frame.getBoundingClientRect();pointers.set(e.pointerId,{x:e.clientX-r.left,y:e.clientY-r.top});startGesture()});
 frame.addEventListener('pointermove',e=>{if(!edit||!pointers.has(e.pointerId)||!gesture)return;e.preventDefault();const r=frame.getBoundingClientRect();pointers.set(e.pointerId,{x:e.clientX-r.left,y:e.clientY-r.top});const ps=[...pointers.values()],c=center(ps),g=gesture;
  if(ps.length>1&&g.dist){const dist=Math.hypot(ps[1].x-ps[0].x,ps[1].y-ps[0].y);edit.draft=FrameCrop.pinch(g.draft,g.w,g.h,g.draft.zoom*dist/g.dist,g.center,c)}
  else edit.draft={...g.draft,...FrameCrop.pan(g.draft,g.w,g.h,c.x-g.center.x,c.y-g.center.y)};
  paint();
 });
 function end(e){pointers.delete(e.pointerId);if(pointers.size)startGesture();else gesture=null}
 frame.addEventListener('pointerup',end);frame.addEventListener('pointercancel',end);frame.addEventListener('lostpointercapture',end);
 frame.addEventListener('keydown',e=>{if(!edit||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const r=frame.getBoundingClientRect(),d=e.shiftKey?20:5;Object.assign(edit.draft,FrameCrop.pan(edit.draft,r.width,r.height,e.key==='ArrowLeft'?-d:e.key==='ArrowRight'?d:0,e.key==='ArrowUp'?-d:e.key==='ArrowDown'?d:0));paint()});
 ov.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close(false)}if(e.key==='Tab'){const nodes=[...ov.querySelectorAll('button,input,[tabindex="0"]')],first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(paint).observe(frame.parentElement);
 document.addEventListener('click',e=>{if(e.target?.id==='uxEdit'&&S.selectedType==='img'){e.preventDefault();e.stopImmediatePropagation();open()}},{capture:true});
})();
