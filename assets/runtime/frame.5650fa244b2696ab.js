
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const SAVE_KEY='frame_director_project_v1';
const FONTS=[['sf','Sans'],['serif','Editorial'],['mono','Mono'],['display','Display'],['rounded','Rounded'],['condensed','Condensed']];
const PLACEHOLDERS=['TITLE','AUG 2026','WEEKEND','NIGHT FILES','MOMENTS','VOL. 01','CITY NOTES','MEMORIES','LATE SUMMER','LOCATION'];
let S={photos:[],slides:[],currentSlide:0,selected:null,selectedType:null,history:[],future:[],randomMode:'all',showSafe:false,finish:'clean',photoEditMode:'crop'};
const uid=()=>Math.random().toString(36).slice(2,10), rnd=(a,b)=>a+Math.random()*(b-a), ri=(a,b)=>Math.floor(rnd(a,b+1)), pick=a=>a[ri(0,a.length-1)], clone=o=>JSON.parse(JSON.stringify(o));
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),1450)}
function ff(id){return id==='serif'?'Georgia,Times,serif':id==='mono'?'ui-monospace,SFMono-Regular,Menlo,monospace':id==='display'?'Impact,Arial Black,sans-serif':id==='rounded'?'Arial Rounded MT Bold,-apple-system,sans-serif':id==='condensed'?'Arial Narrow,Helvetica Neue Condensed,sans-serif':'-apple-system,BlinkMacSystemFont,Arial,sans-serif'}
function imgSize(){return[340,425]}
function selectedSlide(){return S.slides[S.currentSlide]}
function currentLayer(){return selectedSlide()?.layers.find(l=>l.id===S.selected)}
function pushHistory(){S.history.push(clone({slides:S.slides,currentSlide:S.currentSlide,randomMode:S.randomMode,showSafe:S.showSafe,finish:S.finish,frameTemplateFamily:S.frameTemplateFamily,frameCaption:S.frameCaption,frameArtDirection:S.frameArtDirection,frameLastDesign:S.frameLastDesign}));if(S.history.length>40)S.history.shift();S.future=[];updateUndo()}
function applySnap(x){S.slides=x.slides;S.currentSlide=x.currentSlide;S.randomMode=x.randomMode;S.showSafe=x.showSafe;S.finish=x.finish;S.selected=null}
function undo(){if(!S.history.length)return;S.future.push(clone({slides:S.slides,currentSlide:S.currentSlide,randomMode:S.randomMode,showSafe:S.showSafe,finish:S.finish}));applySnap(S.history.pop());renderAll()}
function redo(){if(!S.future.length)return;S.history.push(clone({slides:S.slides,currentSlide:S.currentSlide,randomMode:S.randomMode,showSafe:S.showSafe,finish:S.finish,frameTemplateFamily:S.frameTemplateFamily,frameCaption:S.frameCaption,frameArtDirection:S.frameArtDirection,frameLastDesign:S.frameLastDesign}));applySnap(S.future.pop());renderAll()}
function updateUndo(){$('#undoBtn').style.display=$('#redoBtn').style.display=S.slides.length?'block':'none';$('#undoBtn').disabled=!S.history.length;$('#redoBtn').disabled=!S.future.length}
function saveProject(){try{localStorage.setItem(SAVE_KEY,JSON.stringify({...S,history:[],future:[]}));return true}catch(error){console.warn('Project storage unavailable',error);return false}}
function loadProject(){try{const raw=localStorage.getItem(SAVE_KEY);if(!raw)return false;Object.assign(S,JSON.parse(raw));return true}catch(e){return false}}
function luma([r,g,b]){return .2126*r+.7152*g+.0722*b}
function contrastText(rgb){return luma(rgb)>150?'#111111':'#ffffff'}
function avg(a){return Math.round(a.reduce((s,x)=>s+x,0)/Math.max(1,a.length))}
function hslToRgb(h,s,l){let c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2,r=0,g=0,b=0;if(h<60){r=c;g=x}else if(h<120){r=x;g=c}else if(h<180){g=c;b=x}else if(h<240){g=x;b=c}else if(h<300){r=x;b=c}else{r=c;b=x}return [Math.round((r+m)*255),Math.round((g+m)*255),Math.round((b+m)*255)]}
function rgbToCss(rgb){return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`}
function palFromPhoto(meta){const base=meta.avg;const dark=[Math.max(0,base[0]-90),Math.max(0,base[1]-90),Math.max(0,base[2]-90)];const light=[Math.min(255,base[0]+95),Math.min(255,base[1]+95),Math.min(255,base[2]+95)];const hue=((Math.atan2(base[1]-128,base[0]-128)*180/Math.PI)+360)%360;const accent1=hslToRgb((hue+40)%360,.8,.58), accent2=hslToRgb((hue+200)%360,.75,.62);const bright=luma(base);return bright>128?[light,dark,accent1,accent2]:[dark,light,accent1,accent2]}
async function loadImage(url){return await new Promise((res,rej)=>{const i=new Image();const timer=setTimeout(()=>{i.onload=i.onerror=null;i.src='';rej(new Error('Image decode timed out'))},15000);i.onload=()=>{clearTimeout(timer);res(i)};i.onerror=e=>{clearTimeout(timer);rej(e)};i.src=url})}
async function analyzePhoto(photo){const img=await loadImage(photo.url);const c=document.createElement('canvas');const w=42,h=42;c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0,w,h);const d=x.getImageData(0,0,w,h).data;let rs=[],gs=[],bs=[], brightness=[], grid=Array(9).fill(0), n=0;for(let yy=0;yy<h;yy++){for(let xx=0;xx<w;xx++){const i=(yy*w+xx)*4,r=d[i],g=d[i+1],b=d[i+2];rs.push(r);gs.push(g);bs.push(b);const br=(r+g+b)/3;brightness.push(br);const cell=Math.floor(yy/(h/3))*3+Math.floor(xx/(w/3));grid[cell]+=Math.abs(br-(brightness[brightness.length-2]||br));n++;}}
const avgRgb=[avg(rs),avg(gs),avg(bs)], mean=avg(brightness), variance=brightness.reduce((s,v)=>s+(v-mean)*(v-mean),0)/brightness.length;const centerWeight=variance + (Math.abs(img.width/img.height-1)<.4?20:0) + Math.min(img.width,img.height)/80;return {...photo,w:img.width,h:img.height,aspect:img.width/img.height,avg:avgRgb,brightness:mean,variance,grid,palette:palFromPhoto({avg:avgRgb}),score:centerWeight};}
function bestTextPos(meta,boxW,boxH){const cellSize=[(340-boxW-28)/2,(425-boxH-28)/2];let best=0, min=1e12; meta.grid.forEach((v,i)=>{if(v<min){min=v;best=i}}); const col=best%3,row=Math.floor(best/3); const x=14+col*((340-boxW-28)/2); const y=18+row*((425-boxH-36)/2); return {x:Math.max(12,Math.min(340-boxW-12,x)),y:Math.max(16,Math.min(425-boxH-16,y))};}
function makeImg(photo,x,y,w,h,opt={}){return {id:uid(),type:'img',photo,x,y,w,h,z:10,rot:opt.rot??rnd(-6,6),zoom:opt.zoom??1,offX:opt.offX??0,offY:opt.offY??0,hidden:false,locked:false,moveMode:'crop'}}
function makeText(text,x,y,w,size,color,font,weight,rot=0){return {id:uid(),type:'text',text,x,y,w,size,color,font,weight,rot,z:40,hidden:false,locked:false}}
function makeDeco(kind,x,y,w,h,color,rot=0){return {id:uid(),type:'deco',kind,x,y,w,h,color,rot,z:20,hidden:false,locked:true}}
function heroPhoto(){return [...S.photos].sort((a,b)=>b.score-a.score)[0]||S.photos[0]}
// The import controller and remix buttons share the same storyboard owner.
function buildSlides(){return window.FRAME_generateStory()}
function renderAll(){renderStats();renderToolbar();renderStage();renderFilmstrip();updateUndo();renderSheets();saveProject()}
function renderStats(){$('#stats').textContent=`${S.photos.length} fotos · ${S.slides.length} slides`;$('#modeLabel').textContent=`${S.finish} · ${S.randomMode}`;$('#slideCountRange').value=S.slides.length}
function renderToolbar(){$$('#controlBar [data-mode]').forEach(b=>b.classList.toggle('on',b.dataset.mode===S.randomMode));$('#safeBtn').classList.toggle('on',S.showSafe);$$('#finishRow .choice').forEach(b=>b.classList.toggle('on',b.dataset.finish===S.finish))}
function renderStage(){const [W,H]=imgSize(), sw=Math.min(innerWidth-36,380), sc=sw/W; const stage=$('#stage'); stage.innerHTML=''; S.slides.forEach((sl,si)=>{const d=document.createElement('div'); d.className='slide'+(S.showSafe?' showSafe':''); d.dataset.slide=si; d.dataset.layout=sl.frameLayout||''; d.dataset.family=sl.frameFamily||''; d.style.background=sl.bg; d.style.filter=finishFilter(); sl.layers.sort((a,b)=>a.z-b.z).forEach(l=>{if(l.hidden)return; if(l.type==='img'){const img=document.createElement('img'); img.src=l.photo.url; img.className='frameLayer imgLayer'+(S.selected===l.id?' sel':''); img.dataset.id=l.id; img.dataset.slide=si; img.style.left=(l.x*sc)+'px'; img.style.top=(l.y*sc)+'px'; img.style.width=(l.w*sc)+'px'; img.style.height=(l.h*sc)+'px'; img.style.zIndex=l.z; img.style.transform=`rotate(${l.rot}deg) scale(${l.zoom})`; img.style.objectFit='cover'; img.style.objectPosition=`${50+l.offX}% ${50+l.offY}%`; d.appendChild(img);} else if(l.type==='text'){const t=document.createElement('div'); t.className='textLayer'+(S.selected===l.id?' sel':''); t.dataset.id=l.id; t.dataset.slide=si; t.textContent=l.text; t.style.left=(l.x*sc)+'px'; t.style.top=(l.y*sc)+'px'; t.style.width=(l.w*sc)+'px'; t.style.fontSize=(l.size*sc)+'px'; t.style.color=l.color; t.style.fontFamily=ff(l.font); t.style.fontWeight=l.weight; t.style.transform=`rotate(${l.rot}deg)`; t.style.zIndex=l.z; d.appendChild(t);} else {const e=document.createElement('div'); e.className='decoLayer'; e.style.left=(l.x*sc)+'px'; e.style.top=(l.y*sc)+'px'; e.style.width=(l.w*sc)+'px'; e.style.height=(l.h*sc)+'px'; e.style.background=l.color; e.style.zIndex=l.z; e.style.transform=`rotate(${l.rot}deg)`; e.style.borderRadius=l.kind==='circle'?'50%':(l.kind==='line'?'999px':'10px'); d.appendChild(e);}}); const safe=document.createElement('div'); safe.className='safe'; const num=document.createElement('div'); num.className='slideNo'; num.textContent=String(si+1).padStart(2,'0'); const badge=document.createElement('button'); badge.className='badge'; badge.textContent=sl.favorite?'★':'☆'; badge.onclick=(e)=>{e.stopPropagation();pushHistory();sl.favorite=!sl.favorite;renderAll()}; d.appendChild(safe); d.appendChild(num); d.appendChild(badge); stage.appendChild(d);}); bindStageScroll(); bindObjects()}
function finishFilter(){if(S.finish==='film')return 'contrast(1.02) saturate(.88) sepia(.13)'; if(S.finish==='soft')return 'contrast(.96) saturate(.93) brightness(1.02)'; if(S.finish==='mono')return 'grayscale(1) contrast(1.05)'; if(S.finish==='punchy')return 'contrast(1.08) saturate(1.18)'; return 'none'}
function renderFilmstrip(){const fs=$('#filmstrip'); fs.innerHTML=''; S.slides.forEach((sl,i)=>{const b=document.createElement('button'); b.className='thumb'+(i===S.currentSlide?' on':''); const first=sl.layers.find(l=>l.type==='img'); if(first){const img=document.createElement('img'); img.src=first.photo.url; img.style.filter=finishFilter(); b.appendChild(img)} const n=document.createElement('div'); n.className='thumbnum'; n.textContent=i+1; b.appendChild(n); b.onclick=()=>goToSlide(i); fs.appendChild(b)}); enableThumbDrag()}
function goToSlide(i){S.currentSlide=Math.max(0,Math.min(S.slides.length-1,i)); const el=$(`.slide[data-slide="${S.currentSlide}"]`); if(el)el.scrollIntoView({behavior:'smooth',inline:'start'}); renderFilmstrip(); renderSheets(); saveProject()}
function bindStageScroll(){const wrap=$('#canvasWrap'); wrap.onscroll=()=>{const slideW=Math.min(innerWidth-36,380)+12; const i=Math.round(wrap.scrollLeft/slideW); if(i!==S.currentSlide){S.currentSlide=Math.max(0,Math.min(S.slides.length-1,i)); renderFilmstrip(); renderSheets();}}}
function openSheet(id){closeSheets(); $(id).classList.add('on')} function closeSheets(){$$('.sheet').forEach(s=>s.classList.remove('on'))} $$('.closeSheet').forEach(b=>b.onclick=closeSheets)
function renderSheets(){renderTextSheet(); renderPhotoSheet(); renderSlideSheet()}
function renderTextSheet(){const l=currentLayer(); if(!l||l.type!=='text') return; $('#textInput').value=l.text; $('#sizeRange').value=l.size; $('#fontRow').innerHTML=FONTS.map(([id,n])=>`<button class="choice ${l.font===id?'on':''}" data-font="${id}">${n}</button>`).join(''); $$('#weightRow .choice').forEach(b=>b.classList.toggle('on',+b.dataset.weight===l.weight)); const colors=[...new Set(selectedSlide().palette.map(rgbToCss))]; $('#colorRow').innerHTML=colors.map(c=>`<button class="dot ${l.color===c?'on':''}" data-color="${c}" style="background:${c}"></button>`).join(''); $('#lockTextBtn').textContent=l.locked?'Desbloquear':'Bloquear'; $('#toggleTextBtn').textContent=l.hidden?'Mostrar':'Ocultar'}
function renderPhotoSheet(){const l=currentLayer(); if(!l||l.type!=='img') return; $('#zoomRange').value=l.zoom; $('#lockPhotoBtn').textContent=l.locked?'Desbloquear':'Bloquear'; $('#togglePhotoBtn').textContent=l.hidden?'Mostrar':'Ocultar'; $('#moveModeBtn').classList.toggle('on',S.photoEditMode==='move'); $('#cropModeBtn').classList.toggle('on',S.photoEditMode==='crop'); $('#photoTray').innerHTML=S.photos.map(p=>`<img src="${p.url}" data-photoid="${p.id}">`).join(''); $$('#photoTray img').forEach(img=>img.onclick=()=>{pushHistory(); l.photo=S.photos.find(p=>p.id===img.dataset.photoid); renderAll(); toast('Foto reemplazada')})}
function renderSlideSheet(){$('#favoriteSlideBtn').textContent=selectedSlide()?.favorite?'Quitar favorito':'Favorito'}
function bindObjects(){ $$('.textLayer').forEach(el=>bindText(el)); $$('.imgLayer').forEach(el=>bindImg(el)); }
function bindText(el){ const slideI=+el.dataset.slide, id=el.dataset.id; let st={mode:null,sx:0,sy:0,bx:0,by:0,sd:0,sa:0,ss:0,sr:0}; el.onclick=()=>{S.currentSlide=slideI;S.selected=id;S.selectedType='text';renderStage();renderFilmstrip();renderTextSheet();openSheet('#textSheet')}; el.ondblclick=el.onclick; el.addEventListener('touchstart',e=>{const l=S.slides[slideI].layers.find(x=>x.id===id); if(!l||l.locked)return; S.currentSlide=slideI; S.selected=id; S.selectedType='text'; if(e.touches.length===1){st.mode='drag'; st.sx=e.touches[0].clientX; st.sy=e.touches[0].clientY; st.bx=l.x; st.by=l.y;} if(e.touches.length===2){const[a,b]=e.touches; st.mode='pinch'; st.sd=Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY); st.sa=Math.atan2(b.clientY-a.clientY,b.clientX-a.clientX); st.ss=l.size; st.sr=l.rot; st.bx=l.x; st.by=l.y; st.sx=(a.clientX+b.clientX)/2; st.sy=(a.clientY+b.clientY)/2;}},{passive:true}); el.addEventListener('touchmove',e=>{const l=S.slides[slideI].layers.find(x=>x.id===id); if(!l||l.locked)return; const sc=Math.min(innerWidth-36,380)/340; if(st.mode==='drag'&&e.touches.length===1){e.preventDefault(); l.x=st.bx+(e.touches[0].clientX-st.sx)/sc; l.y=st.by+(e.touches[0].clientY-st.sy)/sc; renderStage()} if((st.mode==='pinch'||e.touches.length===2)&&e.touches.length===2){e.preventDefault(); const[a,b]=e.touches, d=Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY), ang=Math.atan2(b.clientY-a.clientY,b.clientX-a.clientX); const midX=(a.clientX+b.clientX)/2, midY=(a.clientY+b.clientY)/2; l.size=Math.max(14,Math.min(160,st.ss*(d/st.sd))); l.rot=st.sr+((ang-st.sa)*180/Math.PI); l.x=st.bx+(midX-st.sx)/sc; l.y=st.by+(midY-st.sy)/sc; renderStage()}},{passive:false}); el.addEventListener('touchend',()=>saveProject()) }
function bindImg(el){ const slideI=+el.dataset.slide, id=el.dataset.id; let st={mode:null,sx:0,sy:0,bx:0,by:0,bmx:0,bmy:0,sd:0,sz:1}; el.onclick=()=>{S.currentSlide=slideI;S.selected=id;S.selectedType='img';renderStage();renderFilmstrip();renderPhotoSheet();openSheet('#photoSheet')}; el.ondblclick=()=>{const l=S.slides[slideI].layers.find(x=>x.id===id); if(!l)return; pushHistory(); l.zoom=1; l.offX=0; l.offY=0; renderAll(); toast('Reset foto')}; el.addEventListener('touchstart',e=>{const l=S.slides[slideI].layers.find(x=>x.id===id); if(!l||l.locked)return; S.currentSlide=slideI; S.selected=id; S.selectedType='img'; if(e.touches.length===1){st.mode='drag'; st.sx=e.touches[0].clientX; st.sy=e.touches[0].clientY; st.bx=l.offX; st.by=l.offY; st.bmx=l.x; st.bmy=l.y;} if(e.touches.length===2){const[a,b]=e.touches; st.mode='pinch'; st.sd=Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY); st.sz=l.zoom; st.bx=l.offX; st.by=l.offY; st.sx=(a.clientX+b.clientX)/2; st.sy=(a.clientY+b.clientY)/2; st.bmx=l.x; st.bmy=l.y;}},{passive:true}); el.addEventListener('touchmove',e=>{const l=S.slides[slideI].layers.find(x=>x.id===id); if(!l||l.locked)return; const sc=Math.min(innerWidth-36,380)/340; if(st.mode==='drag'&&e.touches.length===1){e.preventDefault(); const dx=e.touches[0].clientX-st.sx, dy=e.touches[0].clientY-st.sy; if(S.photoEditMode==='move'){l.x=st.bmx+dx/sc; l.y=st.bmy+dy/sc;} else {l.offX=Math.max(-48,Math.min(48,st.bx+dx*.12)); l.offY=Math.max(-48,Math.min(48,st.by+dy*.12));} renderStage()} if((st.mode==='pinch'||e.touches.length===2)&&e.touches.length===2){e.preventDefault(); const[a,b]=e.touches, dist=Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY), midX=(a.clientX+b.clientX)/2, midY=(a.clientY+b.clientY)/2; l.zoom=Math.max(1,Math.min(3,st.sz*(dist/st.sd))); if(S.photoEditMode==='move'){l.x=st.bmx+(midX-st.sx)/sc; l.y=st.bmy+(midY-st.sy)/sc;} else {l.offX=Math.max(-48,Math.min(48,st.bx+(midX-st.sx)*.12)); l.offY=Math.max(-48,Math.min(48,st.by+(midY-st.sy)*.12));} renderStage()}},{passive:false}); el.addEventListener('touchend',()=>saveProject()) }
function enableThumbDrag(){const thumbs=[...document.querySelectorAll('.thumb')]; thumbs.forEach((t,i)=>{t.dataset.index=i; let active=false,timer=null,sx=0,sy=0; t.addEventListener('touchstart',e=>{sx=e.touches[0].clientX; sy=e.touches[0].clientY; timer=setTimeout(()=>{active=true; t.style.transform='scale(1.06)'; if(navigator.vibrate)navigator.vibrate(10)},260)},{passive:true}); t.addEventListener('touchmove',e=>{if(!active){ if(Math.hypot(e.touches[0].clientX-sx,e.touches[0].clientY-sy)>12) clearTimeout(timer); return;} e.preventDefault(); const hit=document.elementFromPoint(e.touches[0].clientX,e.touches[0].clientY)?.closest?.('.thumb'); if(hit&&hit!==t){const a=+t.dataset.index,b=+hit.dataset.index;if(Number.isFinite(a)&&Number.isFinite(b)&&a!==b){const item=S.slides.splice(a,1)[0]; S.slides.splice(b,0,item); S.currentSlide=b; renderAll();}}},{passive:false}); t.addEventListener('touchend',()=>{clearTimeout(timer); if(active){active=false;t.style.transform='';saveProject();}})})}
$('#textInput').oninput=e=>{const l=currentLayer(); if(l){l.text=e.target.value; renderStage(); saveProject()}}; $('#sizeRange').oninput=e=>{const l=currentLayer(); if(l){l.size=+e.target.value; renderStage(); saveProject()}}; $('#fontRow').onclick=e=>{const b=e.target.closest('.choice'),l=currentLayer(); if(!b||!l)return; pushHistory(); l.font=b.dataset.font; renderTextSheet(); renderStage()}; $('#weightRow').onclick=e=>{const b=e.target.closest('.choice'),l=currentLayer(); if(!b||!l)return; pushHistory(); l.weight=+b.dataset.weight; renderTextSheet(); renderStage()}; $('#colorRow').onclick=e=>{const b=e.target.closest('.dot'),l=currentLayer(); if(!b||!l)return; pushHistory(); l.color=b.dataset.color; renderTextSheet(); renderStage()}; $('#toggleTextBtn').onclick=()=>{const l=currentLayer(); if(!l)return; pushHistory(); l.hidden=!l.hidden; renderAll()}; $('#lockTextBtn').onclick=()=>{const l=currentLayer(); if(!l)return; pushHistory(); l.locked=!l.locked; renderAll()}; $('#deleteTextBtn').onclick=()=>{const sl=selectedSlide(); if(!sl)return; pushHistory(); sl.layers=sl.layers.filter(l=>l.id!==S.selected); S.selected=null; closeSheets(); renderAll()};
$('#zoomRange').oninput=e=>{const l=currentLayer(); if(l){l.zoom=+e.target.value; renderStage(); saveProject()}}; $('#moveModeBtn').onclick=()=>{S.photoEditMode='move'; renderPhotoSheet()}; $('#cropModeBtn').onclick=()=>{S.photoEditMode='crop'; renderPhotoSheet()}; $('#centerPhotoBtn').onclick=()=>{const l=currentLayer(); if(!l)return; pushHistory(); l.offX=0;l.offY=0; renderStage(); saveProject()}; $('#togglePhotoBtn').onclick=()=>{const l=currentLayer(); if(!l)return; pushHistory(); l.hidden=!l.hidden; renderAll()}; $('#lockPhotoBtn').onclick=()=>{const l=currentLayer(); if(!l)return; pushHistory(); l.locked=!l.locked; renderAll()}; $('#deletePhotoBtn').onclick=()=>{const sl=selectedSlide(); if(!sl)return; pushHistory(); sl.layers=sl.layers.filter(l=>l.id!==S.selected); S.selected=null; closeSheets(); renderAll()};
$('#textBtn').onclick=()=>{if(!S.slides.length)return; pushHistory(); const [W,H]=imgSize(); const sl=selectedSlide(); const t=makeText(pick(PLACEHOLDERS),rnd(16,120),rnd(30,H-100),rnd(120,250),rnd(24,56),pick(sl.palette.map(rgbToCss)),pick(FONTS)[0],pick([400,700,900])); sl.layers.push(t); S.selected=t.id; S.selectedType='text'; renderAll(); openSheet('#textSheet')}; $('#photoBtn').onclick=()=>{const l=currentLayer(); if(l&&l.type==='img')openSheet('#photoSheet'); else toast('Toca una foto')}; $('#slideBtn').onclick=()=>openSheet('#slideSheet'); $('#exportBtn').onclick=()=>openSheet('#exportSheet'); $('#finishBtn').onclick=()=>openSheet('#finishSheet'); $('#undoBtn').onclick=undo; $('#redoBtn').onclick=redo; $('#newBtn').onclick=()=>{if(confirm('¿Crear proyecto nuevo?')){localStorage.removeItem(SAVE_KEY); location.reload()}};
$('#controlBar').onclick=e=>{const b=e.target.closest('[data-mode]'); if(!b)return; S.randomMode=b.dataset.mode; renderToolbar(); saveProject()}; $('#directorBtn').onclick=()=>{pushHistory(); buildSlides(); renderAll(); toast('Director mode')}; $('#safeBtn').onclick=()=>{S.showSafe=!S.showSafe; renderAll()}; $('#slidesBtn').onclick=()=>openSheet('#slideSheet'); $('#randomBtn').onclick=()=>{if(!S.slides.length)return; pushHistory(); if(S.randomMode==='all'||S.randomMode==='layout'){buildSlides()} else if(S.randomMode==='color'){S.slides.forEach(sl=>{const p=sl.layers.find(l=>l.type==='img')?.photo||hero; const pal=palFromPhoto(p); sl.palette=pal; sl.bg=rgbToCss(pal[0]); const ink=contrastText(pal[0]); sl.layers.forEach(l=>{if(l.type==='text'&&!l.locked)l.color=Math.random()<.7?ink:rgbToCss(pick(pal.slice(2))); if(l.type==='deco')l.color=rgbToCss(pick(pal.slice(2)));})})} else if(S.randomMode==='type'){S.slides.forEach(sl=>sl.layers.forEach(l=>{if(l.type==='text'&&!l.locked){l.font=pick(FONTS)[0]; l.weight=pick([400,700,900]); l.size=rnd(16,62); l.rot=rnd(-8,8)}}))} renderAll(); toast('Random listo')};
$('#prevSlideBtn').onclick=()=>moveSlide(-1); $('#nextSlideBtn').onclick=()=>moveSlide(1); function moveSlide(dir){const i=S.currentSlide,j=i+dir;if(j<0||j>=S.slides.length)return; pushHistory(); [S.slides[i],S.slides[j]]=[S.slides[j],S.slides[i]]; S.currentSlide=j; renderAll()}
$('#dupSlideBtn').onclick=()=>{if(S.slides.length>=12)return toast('Máximo 12 slides'); pushHistory(); const c=clone(selectedSlide()); c.id=uid(); c.layers.forEach(l=>l.id=uid()); S.slides.splice(S.currentSlide+1,0,c); S.currentSlide++; renderAll()}; $('#delSlideBtn').onclick=()=>{if(S.slides.length<=1)return toast('No puedes borrar el último'); pushHistory(); S.slides.splice(S.currentSlide,1); S.currentSlide=Math.max(0,S.currentSlide-1); renderAll()}; $('#remixSlideBtn').onclick=()=>{pushHistory(); const old=S.slides[S.currentSlide].favorite; const cache=S.slides.length; const prevPhotos=S.photos; S.slides[S.currentSlide]=(()=>{let cur=S.slides; buildSlides(); let sl=S.slides[0]; S.slides=cur; return sl})(); S.slides[S.currentSlide].favorite=old; renderAll(); toast('Slide rehecho')}; $('#favoriteSlideBtn').onclick=()=>{pushHistory(); selectedSlide().favorite=!selectedSlide().favorite; renderAll()}; $('#slideCountRange').oninput=e=>{const val=+e.target.value; if(val===S.slides.length)return; pushHistory(); while(S.slides.length<val){buildSlides(); if(S.slides.length>0) S.slides.push(clone(S.slides[0]));} while(S.slides.length>val)S.slides.pop(); renderAll()};
$('#finishRow').onclick=e=>{const b=e.target.closest('[data-finish]'); if(!b)return; S.finish=b.dataset.finish; renderAll()};
async function renderSlideToFile(i){const sl=S.slides[i], [BW,BH]=imgSize(), W=1080,H=1350,sc=W/BW; const cv=document.createElement('canvas'); cv.width=W; cv.height=H; const x=cv.getContext('2d'); x.fillStyle=sl.bg; x.fillRect(0,0,W,H); x.filter=finishCanvasFilter(); for(const l of sl.layers.filter(l=>!l.hidden).sort((a,b)=>a.z-b.z)){ if(l.type==='img'){const im=await loadImage(l.photo.url); x.save(); x.translate((l.x+l.w/2)*sc,(l.y+l.h/2)*sc); x.rotate(l.rot*Math.PI/180); x.scale(l.zoom,l.zoom); x.beginPath(); x.rect(-l.w*sc/2,-l.h*sc/2,l.w*sc,l.h*sc); x.clip(); let ir=im.width/im.height, br=l.w/l.h, dw=l.w*sc, dh=l.h*sc; if(ir>br)dw=dh*ir; else dh=dw/ir; const ox=l.offX/100*(dw-l.w*sc), oy=l.offY/100*(dh-l.h*sc); x.drawImage(im,-dw/2-ox,-dh/2-oy,dw,dh); x.restore()} if(l.type==='deco'){x.save(); x.translate((l.x+l.w/2)*sc,(l.y+l.h/2)*sc); x.rotate(l.rot*Math.PI/180); x.fillStyle=l.color; if(l.kind==='circle'){x.beginPath(); x.arc(0,0,l.w*sc/2,0,Math.PI*2); x.fill()} else {x.fillRect(-l.w*sc/2,-l.h*sc/2,l.w*sc,l.h*sc)} x.restore()} } x.filter='none'; for(const l of sl.layers.filter(l=>l.type==='text'&&!l.hidden).sort((a,b)=>a.z-b.z)){ x.save(); x.translate(l.x*sc,l.y*sc); x.rotate(l.rot*Math.PI/180); x.fillStyle=l.color; x.font=`${l.weight} ${Math.round(l.size*sc)}px ${ff(l.font)}`; x.textBaseline='top'; if(l.frameCaption)l.text.split('\n').forEach((line,j)=>x.fillText(line,0,j*l.size*sc*.9));else wrapText(x,l.text,0,0,l.w*sc,l.size*sc*.9); x.restore() } if(S.finish==='film'){x.fillStyle='rgba(245,230,190,.06)'; x.fillRect(0,0,W,H); addGrain(x,W,H,.06)} if(S.finish==='mono'){x.globalCompositeOperation='saturation';} const blob=await new Promise(res=>cv.toBlob(res,'image/png')); return new File([blob],`FRAME_${String(i+1).padStart(2,'0')}.png`,{type:'image/png'})}
function finishCanvasFilter(){if(S.finish==='film')return 'contrast(1.02) saturate(.88) sepia(.13)'; if(S.finish==='soft')return 'contrast(.96) saturate(.93) brightness(1.02)'; if(S.finish==='mono')return 'grayscale(1) contrast(1.05)'; if(S.finish==='punchy')return 'contrast(1.08) saturate(1.18)'; return 'none'}
function addGrain(ctx,W,H,a){for(let i=0;i<1800;i++){ctx.fillStyle=`rgba(0,0,0,${Math.random()*a})`; const x=Math.random()*W,y=Math.random()*H,s=Math.random()*2; ctx.fillRect(x,y,s,s)}}
function wrapText(ctx,t,x,y,w,lh){const words=t.split(' '); let line=''; for(const q of words){const test=line+q+' '; if(ctx.measureText(test).width>w&&line){ctx.fillText(line,x,y); line=q+' '; y+=lh}else line=test} ctx.fillText(line,x,y)}
function crcTable(){let t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0}return t} const CT=crcTable(); function crc32(u){let c=0xffffffff; for(let i=0;i<u.length;i++) c=CT[(c^u[i])&255]^(c>>>8); return(c^0xffffffff)>>>0} function u16(v){return new Uint8Array([v&255,(v>>>8)&255])} function u32(v){return new Uint8Array([v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255])} function cat(ps){let n=ps.reduce((s,p)=>s+p.length,0),o=new Uint8Array(n),pos=0; for(const p of ps){o.set(p,pos); pos+=p.length} return o}
async function zipFiles(files){let locals=[],centrals=[],offset=0,enc=new TextEncoder(); for(const f of files){const name=enc.encode(f.name), data=new Uint8Array(await f.arrayBuffer()), crc=crc32(data); const local=cat([u32(0x04034b50),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(data.length),u32(data.length),u16(name.length),u16(0),name,data]); locals.push(local); const cen=cat([u32(0x02014b50),u16(20),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(data.length),u32(data.length),u16(name.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),name]); centrals.push(cen); offset+=local.length} const central=cat(centrals), end=cat([u32(0x06054b50),u16(0),u16(0),u16(files.length),u16(files.length),u32(central.length),u32(offset),u16(0)]); return new Blob([...locals,central,end],{type:'application/zip'})}
async function shareFiles(files,title){if(navigator.share && (!navigator.canShare || navigator.canShare({files}))) {await navigator.share({files,title}); return true} return false}
$('#exportCurrentBtn').onclick=async()=>{try{toast('Preparando…'); const f=await renderSlideToFile(S.currentSlide); if(!(await shareFiles([f],'FRAME slide'))){const a=document.createElement('a'); a.href=URL.createObjectURL(f); a.download=f.name; a.click();}}catch(e){toast('No se pudo exportar')}}; $('#exportAllBtn').onclick=async()=>{try{toast('Preparando…'); let files=[]; for(let i=0;i<S.slides.length;i++) files.push(await renderSlideToFile(i)); if(!(await shareFiles(files,'FRAME carrusel'))){const z=await zipFiles(files); const a=document.createElement('a'); a.href=URL.createObjectURL(z); a.download='FRAME_export.zip'; a.click();}}catch(e){if(e.name!=='AbortError')toast('No se pudo exportar')}};
try{$('#resumeBtn').style.display=localStorage.getItem(SAVE_KEY)?'block':'none'}catch(e){$('#resumeBtn').style.display='none'}

;
window.FRAME_TEMPLATE_CATALOG={"schemaVersion":1,"status":"runtime","researchedAt":"2026-09-14","referenceCommit":"dc04e1ef7b8d86cc2bda734d7a028dce305e8ff4","coordinateSystem":{"units":"fractions_of_each_page","origin":"top_left","canvasAspect":[4,5],"slots":"unrotated_image_rectangles","rotation":"degrees_about_center; validate_bounds_after_rotation","sourceSlice":"normalized_region_of_one_shared_composite_crop; continuous variants reuse a single photo intentionally"},"sources":{"user_reference":{"type":"user_supplied_screenshot","appIdentity":"unknown","observed":"One carousel page with nine photos, white margins, fine gutters and a small footer caption"},"scrl":{"url":"https://apps.apple.com/us/app/scrl-photo-collage-maker/id1289057196","supports":"Structured and freeform collages, seamless panoramic carousels"},"unfold":{"url":"https://play.google.com/store/apps/details?hl=en_US&id=com.moonlab.unfold","supports":"Template collections including Film; customizable text and backgrounds"},"tezza":{"url":"https://apps.apple.com/us/app/tezza-aesthetic-photo-editor/id1393061654","supports":"Film, editorial, magazine, moodboard and minimal template families"},"canva":{"url":"https://www.canva.com/photo-collages/templates/","supports":"Minimalist, travel, scrapbook and instant-photo-style collage examples"}},"selection":{"weightsMeaning":"Product hypotheses based on user preference, not usage statistics; renormalize after eligibility and brief filters","weightScope":"Primary album family, not independent random style on every page","capacity":"photoCount refers to distinct photos required for this variant","coverage":"Every selected photo must appear; never silently discard or duplicate to fill a grid","caption":"Optional user supplied text only; absent text leaves whitespace","density":"Evaluate outer whitespace separately from photos per page","crop":"Reject unsafe subject crops even when a template is otherwise preferred","anotherOption":"Reuse files, analysis and brief; vary sequence and layout without forcing a different family","integrationBoundary":"After PhotoImportController brief and analysis; no additional file event handlers"},"families":[{"id":"museum_notes","name":"Museum Notes","priority":1,"initialWeight":30,"preferPurpose":["memory","showcase","story"],"preferVibe":["clean","natural"],"variants":[{"id":"museum_9","photoCount":9,"pageSpan":1,"slots":[{"x":0.08,"y":0.065,"w":0.274667,"h":0.265733},{"x":0.362667,"y":0.065,"w":0.274667,"h":0.265733},{"x":0.645333,"y":0.065,"w":0.274667,"h":0.265733},{"x":0.08,"y":0.337133,"w":0.274667,"h":0.265733},{"x":0.362667,"y":0.337133,"w":0.274667,"h":0.265733},{"x":0.645333,"y":0.337133,"w":0.274667,"h":0.265733},{"x":0.08,"y":0.609267,"w":0.274667,"h":0.265733},{"x":0.362667,"y":0.609267,"w":0.274667,"h":0.265733},{"x":0.645333,"y":0.609267,"w":0.274667,"h":0.265733}],"captionRegion":{"x":0.08,"y":0.9,"w":0.84,"h":0.06}},{"id":"museum_6","photoCount":6,"pageSpan":1,"slots":[{"x":0.08,"y":0.065,"w":0.416,"h":0.265733},{"x":0.504,"y":0.065,"w":0.416,"h":0.265733},{"x":0.08,"y":0.337133,"w":0.416,"h":0.265733},{"x":0.504,"y":0.337133,"w":0.416,"h":0.265733},{"x":0.08,"y":0.609267,"w":0.416,"h":0.265733},{"x":0.504,"y":0.609267,"w":0.416,"h":0.265733}],"captionRegion":{"x":0.08,"y":0.9,"w":0.84,"h":0.06}},{"id":"museum_4","photoCount":4,"pageSpan":1,"slots":[{"x":0.08,"y":0.065,"w":0.416,"h":0.4018},{"x":0.504,"y":0.065,"w":0.416,"h":0.4018},{"x":0.08,"y":0.4732,"w":0.416,"h":0.4018},{"x":0.504,"y":0.4732,"w":0.416,"h":0.4018}],"captionRegion":{"x":0.08,"y":0.9,"w":0.84,"h":0.06}}],"background":"#ffffff","sourceIds":["user_reference","scrl","canva"],"rotationDegrees":0},{"id":"gallery_book","name":"Gallery Book","priority":1,"initialWeight":20,"preferPurpose":["memory","story","impact"],"preferVibe":["clean","natural"],"variants":[{"id":"gallery_center","photoCount":1,"pageSpan":1,"slots":[{"x":0.08,"y":0.08,"w":0.84,"h":0.76}],"captionRegion":{"x":0.08,"y":0.9,"w":0.84,"h":0.06}},{"id":"gallery_offset","photoCount":1,"pageSpan":1,"slots":[{"x":0.08,"y":0.08,"w":0.73,"h":0.77}],"captionRegion":{"x":0.08,"y":0.9,"w":0.84,"h":0.06}}],"background":"#ffffff","sourceIds":["unfold","canva"]},{"id":"editorial_pair","name":"Editorial Pair","priority":1,"initialWeight":18,"preferPurpose":["story","memory"],"preferVibe":["clean","natural"],"variants":[{"id":"pair_vertical","photoCount":2,"pageSpan":1,"slots":[{"x":0.08,"y":0.12,"w":0.416,"h":0.7},{"x":0.504,"y":0.12,"w":0.416,"h":0.7}]},{"id":"pair_horizontal","photoCount":2,"pageSpan":1,"slots":[{"x":0.08,"y":0.08,"w":0.84,"h":0.3968},{"x":0.08,"y":0.4832,"w":0.84,"h":0.3968}]},{"id":"triptych","photoCount":3,"pageSpan":1,"slots":[{"x":0.08,"y":0.2,"w":0.274667,"h":0.55},{"x":0.362667,"y":0.2,"w":0.274667,"h":0.55},{"x":0.645333,"y":0.2,"w":0.274667,"h":0.55}]}],"background":"#ffffff","sourceIds":["scrl","tezza"]},{"id":"film_archive","name":"Film Archive","priority":2,"initialWeight":8,"preferPurpose":["memory","story"],"preferVibe":["natural","bold"],"variants":[{"id":"film_strip_3","photoCount":3,"pageSpan":1,"slots":[{"x":0.17,"y":0.06,"w":0.66,"h":0.276},{"x":0.17,"y":0.352,"w":0.66,"h":0.276},{"x":0.17,"y":0.644,"w":0.66,"h":0.276}]},{"id":"film_contact_6","photoCount":6,"pageSpan":1,"slots":[{"x":0.06,"y":0.06,"w":0.43,"h":0.276},{"x":0.51,"y":0.06,"w":0.43,"h":0.276},{"x":0.06,"y":0.352,"w":0.43,"h":0.276},{"x":0.51,"y":0.352,"w":0.43,"h":0.276},{"x":0.06,"y":0.644,"w":0.43,"h":0.276},{"x":0.51,"y":0.644,"w":0.43,"h":0.276}]}],"background":"#161616","textureDefault":"none","sourceIds":["unfold","tezza"]},{"id":"travel_journal","name":"Travel Journal","priority":2,"initialWeight":12,"preferPurpose":["story","memory"],"preferVibe":["natural","clean"],"variants":[{"id":"journal_3","photoCount":3,"pageSpan":1,"slots":[{"x":0.08,"y":0.065,"w":0.84,"h":0.49},{"x":0.08,"y":0.57,"w":0.414,"h":0.28},{"x":0.506,"y":0.57,"w":0.414,"h":0.28}],"captionRegion":{"x":0.08,"y":0.9,"w":0.84,"h":0.06}},{"id":"journal_4","photoCount":4,"pageSpan":1,"slots":[{"x":0.08,"y":0.065,"w":0.84,"h":0.49},{"x":0.08,"y":0.57,"w":0.274667,"h":0.28},{"x":0.362667,"y":0.57,"w":0.274667,"h":0.28},{"x":0.645333,"y":0.57,"w":0.274667,"h":0.28}],"captionRegion":{"x":0.08,"y":0.9,"w":0.84,"h":0.06}}],"background":"#faf8f3","sourceIds":["canva","tezza"]},{"id":"continuous","name":"Continuous","priority":2,"initialWeight":6,"preferPurpose":["story","impact"],"preferVibe":["natural","bold"],"variants":[{"id":"continuous_2","photoCount":1,"pageSpan":2,"slots":[{"x":0,"y":0,"w":1,"h":1,"pageIndex":0,"sourceSlice":{"x":0,"y":0,"w":0.5,"h":1}},{"x":0,"y":0,"w":1,"h":1,"pageIndex":1,"sourceSlice":{"x":0.5,"y":0,"w":0.5,"h":1}}]},{"id":"continuous_3","photoCount":1,"pageSpan":3,"slots":[{"x":0,"y":0,"w":1,"h":1,"pageIndex":0,"sourceSlice":{"x":0,"y":0,"w":0.3333333333333333,"h":1}},{"x":0,"y":0,"w":1,"h":1,"pageIndex":1,"sourceSlice":{"x":0.3333333333333333,"y":0,"w":0.3333333333333333,"h":1}},{"x":0,"y":0,"w":1,"h":1,"pageIndex":2,"sourceSlice":{"x":0.6666666666666666,"y":0,"w":0.3333333333333333,"h":1}}]}],"background":"photo","sourceIds":["scrl"],"requirements":["Wide source image adequate for the combined canvas","Faces must avoid each individual page seam"]},{"id":"soft_scrapbook","name":"Soft Scrapbook","priority":3,"initialWeight":3,"preferPurpose":["memory"],"preferVibe":["bold"],"variants":[{"id":"scrapbook_3","photoCount":3,"pageSpan":1,"slots":[{"x":0.1,"y":0.08,"w":0.64,"h":0.38,"rotation":-2},{"x":0.4,"y":0.38,"w":0.49,"h":0.3,"rotation":2},{"x":0.1,"y":0.6,"w":0.57,"h":0.31,"rotation":-1}]},{"id":"scrapbook_4","photoCount":4,"pageSpan":1,"slots":[{"x":0.1,"y":0.08,"w":0.54,"h":0.34,"rotation":-2},{"x":0.48,"y":0.25,"w":0.42,"h":0.29,"rotation":2},{"x":0.1,"y":0.48,"w":0.46,"h":0.31,"rotation":-1},{"x":0.48,"y":0.65,"w":0.4,"h":0.26,"rotation":2}]}],"background":"#faf8f3","allowOverlap":true,"textureDefault":"none","sourceIds":["canva","tezza"],"requirements":["Check rotated bounds","Reject occluded faces and key subjects"]},{"id":"color_editorial","name":"Color Editorial","priority":3,"initialWeight":3,"preferPurpose":["impact"],"preferVibe":["color","bold"],"variants":[{"id":"color_hero","photoCount":1,"pageSpan":1,"slots":[{"x":0.08,"y":0.065,"w":0.84,"h":0.81}]},{"id":"color_pair","photoCount":2,"pageSpan":1,"slots":[{"x":0.08,"y":0.12,"w":0.416,"h":0.7},{"x":0.504,"y":0.12,"w":0.416,"h":0.7}]}],"background":"single_photo_derived_accent","sourceIds":["tezza","canva"]}],"version":"editorial-1"};
;
/* IndexedDB stores original Files by the exact id assigned during analysis. */
const FramePhotoStore = (() => {
  const DB = 'frame-director-db-v2', STORE = 'photos';
  function open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE)) {
          request.result.createObjectStore(STORE, {keyPath: 'id'});
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function put(files, photos) {
    if (files.length !== photos.length) throw new Error('File/photo count mismatch');
    const db = await open();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.oncomplete = resolve;
        tx.onabort = () => reject(tx.error || new Error('Photo storage aborted'));
        tx.onerror = () => reject(tx.error);
        // Append/upsert only: importing another batch must retain the first batch.
        files.forEach((file, i) => tx.objectStore(STORE).put({
          id: photos[i].id, name: file.name, type: file.type, blob: file
        }));
      });
    } finally { db.close(); }
  }
  async function restore(project) {
    const db = await open();
    let rows;
    try {
      rows = await new Promise((resolve, reject) => {
        const request = db.transaction(STORE).objectStore(STORE).getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } finally { db.close(); }
    const stored = new Map(rows.map(row => [row.id, row]));
    // Validate before changing any URLs or rendering a partially restored project.
    if (project.photos.some(photo => !stored.has(photo.id))) {
      throw new Error('Saved originals are missing');
    }
    const restored = new Map(project.photos.map(photo => {
      const row = stored.get(photo.id);
      return [photo.id, {...photo, name: row.name, url: URL.createObjectURL(row.blob)}];
    }));
    project.photos = project.photos.map(photo => restored.get(photo.id));
    project.slides.forEach(slide => slide.layers.forEach(layer => {
      if (layer.type === 'img' && restored.has(layer.photo?.id)) {
        layer.photo = restored.get(layer.photo.id);
      }
    }));
  }
  return {put, restore};
})();
if (typeof module !== 'undefined' && module.exports) module.exports = FramePhotoStore;

;
/* One owner for the native picker and the complete import transaction.
 * Dependencies are injected so ordering and File identity can be regression tested.
 */
class PhotoImportController {
  constructor(ports) {
    this.ports = ports;
    this.pendingFiles = [];
    this.active = false;
    this.phase = 'idle';
    this.onChange = event => {
      // Copy File references before clearing the input. Never read a live FileList later.
      const files = Array.from(event.currentTarget.files || []);
      event.currentTarget.value = '';
      void this.filesSelected(files);
    };
    this.onCancel = () => { if (!this.active) this.transition('idle'); };
    ports.input.addEventListener('change', this.onChange);
    ports.input.addEventListener('cancel', this.onCancel);
    ports.input.disabled = false;
  }

  transition(phase) {
    this.phase = phase;
    this.ports.onPhase?.(phase, this.pendingFiles.length);
  }

  selectPhotos() {
    if (this.active || this.ports.isBlocked?.()) return;
    const input = this.ports.input;
    input.value = '';
    this.transition('selecting');
    // Stay in the original user gesture; no timer, promise or animation frame here.
    input.click();
  }

  async filesSelected(selection) {
    if (this.active || this.ports.isBlocked?.()) return false;
    const files = Array.from(selection);
    if (!files.length) { this.transition('idle'); return false; }
    this.active = true;
    this.pendingFiles = files;
    let photos = [];
    let checkpoint;
    try {
      this.ports.setBusy(true);
      this.transition('brief');
      // requestBrief mounts/shows synchronously, before this first await.
      const brief = await this.ports.requestBrief(files);
      if (!brief) return false;
      this.transition('analysis');
      this.ports.showProgress('Analizando tus fotos…');
      await this.ports.yieldToPaint();
      photos = await this.ports.analyzePhotos(files, message => this.ports.showProgress(message));
      if (photos.length !== files.length) throw new Error('Incomplete photo analysis');
      checkpoint = this.ports.checkpoint();
      this.transition('commit');
      this.ports.commitPhotos(photos, brief);
      this.transition('storyboard');
      this.ports.showProgress('Generando storyboard…');
      await this.ports.yieldToPaint();
      this.ports.generateStoryboard();
      this.transition('render');
      this.ports.render();
      // Files are paired with analysis results by index, never with mutable S.photos.
      await this.ports.persistPhotos(files, photos);
      this.ports.onSuccess(photos.length);
      this.transition('complete');
      return true;
    } catch (error) {
      if (checkpoint !== undefined) this.ports.rollback(checkpoint);
      this.ports.releasePhotos(photos);
      this.transition('error');
      this.ports.onError(error);
      return false;
    } finally {
      this.pendingFiles = [];
      this.active = false;
      this.ports.hideProgress();
      this.ports.setBusy(false);
      this.transition('idle');
    }
  }
}

if (typeof module !== 'undefined' && module.exports) module.exports = PhotoImportController;

;
const FramePhotoAnalysis = (() => {
const clamp01=v=>Math.max(0,Math.min(1,Number(v)||0));
function loadScriptOnce(src){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Face detector load timed out')),8000);const res=()=>{clearTimeout(timer);resolve()};const rej=e=>{clearTimeout(timer);reject(e)};const existing=[...document.scripts].find(s=>s.src===src);if(existing){if(existing.dataset.ready==='1'||window.FaceDetection)return res();existing.addEventListener('load',res,{once:true});existing.addEventListener('error',rej,{once:true});return}const s=document.createElement('script');s.src=src;s.async=true;s.onload=()=>{s.dataset.ready='1';res()};s.onerror=rej;document.head.appendChild(s)})}
function loadPhoto(url){return loadImage(url)}
let detectorPromise=null;
function getFaceDetector(){if(detectorPromise)return detectorPromise;detectorPromise=(async()=>{try{await loadScriptOnce('https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/face_detection.js');if(!window.FaceDetection)return null;const fd=new FaceDetection({locateFile:f=>`https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${f}`});fd.setOptions({model:'short',minDetectionConfidence:.52});let pending=null;fd.onResults(r=>{if(pending){const fn=pending;pending=null;fn(r)}});fd.__frameSend=image=>new Promise(resolve=>{const timer=setTimeout(()=>{pending=null;resolve(null)},2800);pending=r=>{clearTimeout(timer);resolve(r)};Promise.resolve(fd.send({image})).catch(()=>{clearTimeout(timer);pending=null;resolve(null)})});return fd}catch(e){console.warn('face detector unavailable',e);return null}})();return detectorPromise}
function boxFromDetection(d){const b=d?.locationData?.relativeBoundingBox||d?.relativeBoundingBox||null;if(!b)return null;const x=clamp01(b.xMin??b.x??0),y=clamp01(b.yMin??b.y??0),w=clamp01(b.width??0),h=clamp01(b.height??0);if(w<.02||h<.02)return null;return{x,y,w:Math.min(w,1-x),h:Math.min(h,1-y),score:Number(d?.score?.[0]??d?.score??0)}}
function unionFaces(faces){if(!faces.length)return null;const x1=Math.min(...faces.map(f=>f.x)),y1=Math.min(...faces.map(f=>f.y)),x2=Math.max(...faces.map(f=>f.x+f.w)),y2=Math.max(...faces.map(f=>f.y+f.h));return{x:x1,y:y1,w:x2-x1,h:y2-y1,cx:(x1+x2)/2,cy:(y1+y2)/2}}
async function enrichComposition(p){try{const im=await loadPhoto(p.url);p.width=im.naturalWidth||im.width;p.height=im.naturalHeight||im.height;if(p.width&&p.height)p.aspect=p.width/p.height;const max=512,scale=Math.min(1,max/Math.max(p.width||1,p.height||1)),cv=document.createElement('canvas');cv.width=Math.max(1,Math.round((p.width||1)*scale));cv.height=Math.max(1,Math.round((p.height||1)*scale));cv.getContext('2d',{willReadFrequently:false}).drawImage(im,0,0,cv.width,cv.height);const fd=await getFaceDetector();let faces=[];if(fd?.__frameSend){const r=await fd.__frameSend(cv);faces=(r?.detections||[]).map(boxFromDetection).filter(Boolean).filter(f=>f.score===0||f.score>=.45)}p.faces=faces;p.faceCount=faces.length;p.faceUnion=unionFaces(faces);p.faceCenter=p.faceUnion?{x:p.faceUnion.cx,y:p.faceUnion.cy}:null;p.hasFaces=faces.length>0;return p}catch(e){console.warn('composition analysis',p?.name,e);p.faces=p.faces||[];p.faceCount=p.faces.length;p.faceUnion=unionFaces(p.faces);return p}}

async function analyzePhotos(files, progress) {
  const photos = new Array(files.length), urls = [];
  let next = 0, done = 0, failure = null;
  async function worker() {
    while (next < files.length && !failure) {
      const i = next++, file = files[i];
      try {
        const url = URL.createObjectURL(file); urls.push(url);
        photos[i] = await analyzePhoto({id:uid(), name:file.name, url,
          sourceSize:file.size, sourceType:file.type, sourceLastModified:file.lastModified});
      } catch (error) { failure = error; }
      progress(`Analizando tus fotos… ${++done}/${files.length}`);
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  try {
    await Promise.all(Array.from({length:Math.min(3,files.length)}, worker));
    if (failure) throw failure;
    for (let i = 0; i < photos.length; i++) {
      progress(`Leyendo composición… ${i+1}/${photos.length}`);
      await enrichComposition(photos[i]);
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    return photos;
  } catch (error) {
    urls.forEach(url => URL.revokeObjectURL(url));
    throw error;
  }
}
return {analyzePhotos};
})();

;
(()=>{
  const ENHANCE_VER='Director v2';
  S.smartSelect=true; S.magicFill=false; S.referenceMeta=null; S.heroPhotoId=null; S.animate=false;

  function addCss(){
    const st=document.createElement('style');
    st.textContent=`
      .pill.wow{border-color:#d9ff4550;color:#d9ff45}.pill.wow.on{background:#d9ff45;color:#09090b}
      .magicBg{position:absolute;pointer-events:none;overflow:hidden;filter:blur(16px) saturate(.95);transform-origin:center;opacity:.82}
      body.animate-preview .slide img{animation:frameKen 5s ease-in-out infinite alternate}
      body.animate-preview .slide .textLayer{animation:frameType 2.6s ease-in-out infinite alternate}
      @keyframes frameKen{from{filter:brightness(.98)}to{filter:brightness(1.05)}}
      @keyframes frameType{from{opacity:.82}to{opacity:1}}
      .analysisBadge{display:inline-flex;gap:6px;align-items:center;padding:6px 9px;border-radius:999px;background:#d9ff4514;color:#d9ff45;font-size:10px;margin-top:8px}
      #referenceInput{display:none}
    `;
    document.head.appendChild(st);
  }
  addCss();

  function toolbarButton(id,label,cls=''){
    const b=document.createElement('button'); b.className='pill '+cls; b.id=id; b.textContent=label; return b;
  }
  const bar=$('#controlBar');
  if(bar){
    bar.appendChild(toolbarButton('smartBtn','Smart select','wow on'));
    bar.appendChild(toolbarButton('referenceBtn','Reference'));
    bar.appendChild(toolbarButton('moreLikeBtn','Más así'));
    bar.appendChild(toolbarButton('wildBtn','Wild'));
    bar.appendChild(toolbarButton('magicFillBtn','Magic fill'));
    bar.appendChild(toolbarButton('animateBtn','Animate'));
    bar.appendChild(toolbarButton('depthBtn','Depth','wow'));
    const inp=document.createElement('input'); inp.type='file'; inp.accept='image/*'; inp.id='referenceInput'; document.body.appendChild(inp);
  }

  function colorDist(a,b){return Math.hypot(a.avg[0]-b.avg[0],a.avg[1]-b.avg[1],a.avg[2]-b.avg[2])}
  function smartPhotos(list){
    const sorted=[...list].sort((a,b)=>b.score-a.score); const out=[];
    for(const p of sorted){
      const blurry=p.variance<110; const duplicate=out.some(q=>colorDist(p,q)<24 && Math.abs(p.aspect-q.aspect)<.08);
      if((blurry&&out.length>=6)||duplicate)continue; out.push(p); if(out.length>=20)break;
    }
    return out.length>=3?out:sorted;
  }
  const originalBuild=buildSlides;

  const originalPal=palFromPhoto;
  palFromPhoto=function(meta){
    const p=originalPal(meta); if(!S.referenceMeta)return p;
    const rp=originalPal(S.referenceMeta); return p.map((c,i)=>c.map((v,j)=>Math.round(v*.46+rp[i][j]*.54)));
  };

  $('#smartBtn').onclick=()=>{S.smartSelect=!S.smartSelect;$('#smartBtn').classList.toggle('on',S.smartSelect);toast(S.smartSelect?'Smart select activo':'Usando todas las fotos');saveProject()};
  $('#referenceBtn').onclick=()=>$('#referenceInput').click();
  $('#referenceInput').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;const p={id:'reference',name:f.name,url:URL.createObjectURL(f)};S.referenceMeta=await analyzePhoto(p);$('#referenceBtn').classList.add('on');toast('Estilo de referencia capturado');};

  function favoriteSlides(){return S.slides.filter(s=>s.favorite)}
  function variantFromFavorite(fav,idx){
    const sl=clone(fav); sl.id=uid(); sl.favorite=false; const photoPool=smartPhotos(S.photos); let pi=idx;
    sl.layers.forEach(l=>{l.id=uid(); if(l.type==='img'&&!l.locked){l.photo=photoPool[pi++%photoPool.length];l.offX=rnd(-8,8);l.offY=rnd(-8,8);l.zoom=Math.max(1,l.zoom+rnd(-.06,.12))} if(l.type==='text'&&!l.locked){l.x+=rnd(-12,12);l.y+=rnd(-12,12);l.rot+=rnd(-2.5,2.5);if(Math.random()<.35)l.font=pick(FONTS)[0]}});
    const first=sl.layers.find(l=>l.type==='img')?.photo; if(first){sl.palette=palFromPhoto(first);sl.bg=rgbToCss(sl.palette[0])}
    return sl;
  }
  $('#moreLikeBtn').onclick=()=>{const favs=favoriteSlides();if(!favs.length)return toast('Marca un slide con ☆ primero');pushHistory();S.slides=S.slides.map((s,i)=>s.favorite?s:variantFromFavorite(favs[i%favs.length],i));renderAll();toast('Variaciones del estilo favorito')};
  $('#wildBtn').onclick=()=>{pushHistory();const oldSmart=S.smartSelect;S.smartSelect=false;originalBuild();S.smartSelect=oldSmart;S.slides.forEach(sl=>{if(Math.random()<.8)sl.layers.push(makeDeco('block',rnd(-20,280),rnd(0,380),rnd(40,130),rnd(8,90),rgbToCss(pick(sl.palette.slice(2))),rnd(-22,22)));if(Math.random()<.65)sl.layers.push(makeText(pick(PLACEHOLDERS),rnd(-8,210),rnd(12,390),rnd(80,250),rnd(16,72),rgbToCss(pick(sl.palette.slice(1))),pick(FONTS)[0],pick([400,700,900]),rnd(-12,12))) });renderAll();toast('Wild mode')};

  const originalRenderStage=renderStage;
  function applyMagicFill(){
    if(!S.magicFill)return;
    $$('.imgLayer').forEach(img=>{const bg=document.createElement('div');bg.className='magicBg';bg.style.left=img.style.left;bg.style.top=img.style.top;bg.style.width=img.style.width;bg.style.height=img.style.height;bg.style.zIndex=Math.max(0,(+img.style.zIndex||10)-1);bg.style.background=`url("${img.src}") center/cover no-repeat`;bg.style.transform=(img.style.transform||'')+' scale(1.04)';img.parentNode.insertBefore(bg,img);img.style.objectFit='contain';img.style.background='rgba(0,0,0,.05)'})
  }
  renderStage=function(){originalRenderStage();applyMagicFill()};
  $('#magicFillBtn').onclick=()=>{S.magicFill=!S.magicFill;$('#magicFillBtn').classList.toggle('on',S.magicFill);renderStage();toast(S.magicFill?'Magic fill activo':'Magic fill desactivado')};
  $('#animateBtn').onclick=()=>{S.animate=!S.animate;document.body.classList.toggle('animate-preview',S.animate);$('#animateBtn').classList.toggle('on',S.animate);toast(S.animate?'Preview animado':'Animación detenida')};

  function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
  async function personCutout(layer){
    const src='https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js';
    await loadScript(src); if(!window.SelfieSegmentation)throw new Error('Segmentation unavailable');
    const img=await loadImage(layer.photo.url); const cv=document.createElement('canvas');cv.width=img.naturalWidth||img.width;cv.height=img.naturalHeight||img.height;const ctx=cv.getContext('2d');
    const seg=new SelfieSegmentation({locateFile:f=>`https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${f}`});seg.setOptions({modelSelection:1});
    const result=await new Promise((res,rej)=>{let done=false;seg.onResults(r=>{if(!done){done=true;res(r)}});seg.send({image:img}).catch(rej)});
    ctx.clearRect(0,0,cv.width,cv.height);ctx.drawImage(result.segmentationMask,0,0,cv.width,cv.height);ctx.globalCompositeOperation='source-in';ctx.drawImage(img,0,0,cv.width,cv.height);ctx.globalCompositeOperation='source-over';
    const blob=await new Promise(res=>cv.toBlob(res,'image/png'));return {id:'cut_'+uid(),name:'cutout.png',url:URL.createObjectURL(blob),avg:layer.photo.avg||[128,128,128],aspect:layer.photo.aspect||1,score:layer.photo.score||0,variance:layer.photo.variance||0,grid:layer.photo.grid||Array(9).fill(0)};
  }
  $('#depthBtn').onclick=async()=>{const l=currentLayer();if(!l||l.type!=='img')return toast('Toca una foto de una persona primero');try{$('#loading').classList.add('on');pushHistory();const sl=selectedSlide();const bg=clone(l);bg.id=uid();bg.z=8;const cut=await personCutout(l);const fg=clone(l);fg.id=uid();fg.photo=cut;fg.z=36;const ix=sl.layers.findIndex(x=>x.id===l.id);sl.layers.splice(ix,1,bg,fg);sl.layers.filter(x=>x.type==='text').forEach(t=>{if(!t.locked)t.z=24});S.selected=fg.id;S.selectedType='img';renderAll();toast('Depth aplicado');}catch(e){console.warn(e);toast('Depth necesita internet y una foto con persona')}finally{$('#loading').classList.remove('on')}};

  const photoGrid=$('#photoSheet .grid3'); if(photoGrid){const hero=document.createElement('button');hero.id='heroPhotoBtn';hero.textContent='★ Hero';photoGrid.appendChild(hero);hero.onclick=()=>{const l=currentLayer();if(!l||l.type!=='img')return;S.heroPhotoId=l.photo.id;l.photo.score=1e8;toast('Foto marcada como hero');saveProject()}}

  $('#slideCountRange').oninput=e=>{const val=+e.target.value;if(val===S.slides.length)return;pushHistory();if(val<S.slides.length)S.slides=S.slides.slice(0,val);else{const favs=favoriteSlides();while(S.slides.length<val){if(favs.length)S.slides.push(variantFromFavorite(favs[S.slides.length%favs.length],S.slides.length));else{const old=[...S.slides];originalBuild();const candidate=clone(S.slides[S.slides.length%Math.max(1,S.slides.length)]||S.slides[0]);S.slides=old;candidate.id=uid();candidate.layers.forEach(l=>l.id=uid());S.slides.push(candidate)}}}S.currentSlide=Math.min(S.currentSlide,S.slides.length-1);renderAll()};

  $('#randomBtn').onclick=()=>{if(!S.slides.length)return;pushHistory();if(S.randomMode==='all'||S.randomMode==='layout'){buildSlides()}else if(S.randomMode==='color'){S.slides.forEach(sl=>{const p=sl.layers.find(l=>l.type==='img')?.photo||heroPhoto();const pal=palFromPhoto(p);sl.palette=pal;sl.bg=rgbToCss(pal[0]);const ink=contrastText(pal[0]);sl.layers.forEach(l=>{if(l.type==='text'&&!l.locked)l.color=Math.random()<.7?ink:rgbToCss(pick(pal.slice(2)));if(l.type==='deco')l.color=rgbToCss(pick(pal.slice(2)))})})}else if(S.randomMode==='type'){S.slides.forEach(sl=>sl.layers.forEach(l=>{if(l.type==='text'&&!l.locked){l.font=pick(FONTS)[0];l.weight=pick([400,700,900]);l.size=rnd(16,62);l.rot=rnd(-8,8)}}))}renderAll();toast('Random listo')};

  const origRenderAll=renderAll;
  renderAll=function(){origRenderAll();$('#smartBtn')?.classList.toggle('on',!!S.smartSelect);$('#magicFillBtn')?.classList.toggle('on',!!S.magicFill);$('#animateBtn')?.classList.toggle('on',!!S.animate);document.body.classList.toggle('animate-preview',!!S.animate)};

  toast('FRAME Director listo');
})();

;
(()=>{
  const INTERACTION_VERSION='Interaction v1';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const dist=(a,b)=>Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
  const angle=(a,b)=>Math.atan2(b.clientY-a.clientY,b.clientX-a.clientX);
  const mid=(a,b)=>({x:(a.clientX+b.clientX)/2,y:(a.clientY+b.clientY)/2});
  const sc=()=>Math.min(innerWidth-36,380)/340;
  let gestureActive=false;

  const style=document.createElement('style');
  style.textContent=`
    :root{--tap:rgba(255,255,255,.08);--spring:cubic-bezier(.2,.85,.2,1)}
    button,.choice,.pill,.tool,.thumb{touch-action:manipulation}
    button{min-height:44px;transition:transform .12s ease,opacity .12s ease,background .16s ease}
    button:active,.choice:active,.pill:active,.tool:active,.thumb:active{transform:scale(.96);opacity:.86}
    .pill{min-height:38px;display:inline-flex;align-items:center;justify-content:center}
    .tool{min-height:58px}.tool .ico{transition:transform .16s var(--spring)}.tool:active .ico{transform:scale(.86)}
    .toolbar{scroll-snap-type:x proximity;padding-bottom:14px}.toolbar .pill{scroll-snap-align:start}
    .canvasWrap{scroll-behavior:smooth;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch}
    .slide{transition:transform .24s var(--spring),box-shadow .24s ease,filter .24s ease}
    .slide.isCurrent{transform:scale(1);box-shadow:0 28px 70px rgba(0,0,0,.5)}
    .slide:not(.isCurrent){transform:scale(.985)}
    .sel{outline:2px solid rgba(255,255,255,.9)!important;outline-offset:3px!important}
    .imgLayer,.textLayer{will-change:transform,left,top,object-position,font-size}
    .imgLayer.isManipulating,.textLayer.isManipulating{outline:2px solid rgba(255,255,255,.95)!important;outline-offset:4px!important}
    .interactionScrim{position:fixed;inset:0;z-index:74;background:rgba(0,0,0,.32);backdrop-filter:blur(4px);opacity:0;pointer-events:none;transition:opacity .2s ease}
    .interactionScrim.on{opacity:1;pointer-events:auto}
    .sheet{z-index:80;transition:transform .28s var(--spring)!important;will-change:transform}
    .sheet.dragging{transition:none!important}
    .grab{height:5px!important;width:42px!important;background:#4a4a52!important;cursor:grab}
    .sheetTop{position:sticky;top:0;background:#141417;z-index:2;padding-top:2px}
    .snapGuide{position:absolute;z-index:230;pointer-events:none;background:rgba(140,214,255,.95);opacity:0;transition:opacity .08s ease}
    .snapGuide.v{top:0;bottom:0;width:1px;left:50%}.snapGuide.h{left:0;right:0;height:1px;top:50%}.snapGuide.on{opacity:1}
    .contextBar{position:fixed;left:50%;transform:translateX(-50%) translateY(8px);bottom:calc(164px + env(safe-area-inset-bottom));z-index:65;display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:999px;background:rgba(22,22,26,.88);border:1px solid rgba(255,255,255,.09);backdrop-filter:blur(22px);box-shadow:0 14px 40px rgba(0,0,0,.32);opacity:0;pointer-events:none;transition:.2s var(--spring);font-size:10px;color:#d6d6dc;white-space:nowrap}
    .contextBar.on{opacity:1;transform:translateX(-50%) translateY(0)}
    .contextBar b{color:#fff}.contextBar .dotx{width:6px;height:6px;border-radius:50%;background:#fff}
    .pager{position:fixed;right:18px;bottom:calc(166px + env(safe-area-inset-bottom));z-index:64;padding:6px 9px;border-radius:999px;background:rgba(16,16,19,.72);border:1px solid rgba(255,255,255,.07);backdrop-filter:blur(18px);font-size:10px;color:#aaaab2;transition:.18s ease}
    .photoModeMini{display:flex;gap:6px;margin-top:10px}.photoModeMini button{flex:1;min-height:42px;border:1px solid #2c2c32;border-radius:14px;background:#0d0d10;font-size:11px}.photoModeMini button.on{background:#efeff1;color:#111;border-color:#efeff1}
    body.gestureLock .canvasWrap{overflow-x:hidden!important;scroll-snap-type:none!important}
    body.sheetOpen .dock{transform:translateY(10px);opacity:.25;pointer-events:none;transition:.2s ease}
    body.sheetOpen .filmstrip{opacity:.18;pointer-events:none;transition:.2s ease}
  `;
  document.head.appendChild(style);

  const scrim=document.createElement('div'); scrim.className='interactionScrim'; document.body.appendChild(scrim);
  const context=document.createElement('div'); context.className='contextBar'; context.innerHTML='<span class="dotx"></span><b>Seleccionado</b><span id="contextText"></span>'; document.body.appendChild(context);
  const pager=document.createElement('div'); pager.className='pager'; document.body.appendChild(pager);

  function updateSheetState(){
    const any=$$('.sheet.on').length>0;
    scrim.classList.toggle('on',any); document.body.classList.toggle('sheetOpen',any);
  }
  scrim.addEventListener('click',()=>{closeSheets();updateSheetState()});
  const mo=new MutationObserver(updateSheetState); $$('.sheet').forEach(s=>mo.observe(s,{attributes:true,attributeFilter:['class']}));

  function wireSheet(sheet){
    const grab=sheet.querySelector('.grab'); if(!grab||grab.dataset.interactionBound)return; grab.dataset.interactionBound='1';
    let sy=0,dy=0,dragging=false;
    const begin=e=>{const t=e.touches?.[0]; if(!t)return; sy=t.clientY;dy=0;dragging=true;sheet.classList.add('dragging')};
    const move=e=>{if(!dragging)return; const t=e.touches?.[0]; if(!t)return; dy=Math.max(0,t.clientY-sy); if(dy>0){e.preventDefault();sheet.style.transform=`translateY(${dy}px)`}};
    const end=()=>{if(!dragging)return;dragging=false;sheet.classList.remove('dragging');sheet.style.transform='';if(dy>86){sheet.classList.remove('on');updateSheetState()}}
    grab.addEventListener('touchstart',begin,{passive:true}); grab.addEventListener('touchmove',move,{passive:false}); grab.addEventListener('touchend',end,{passive:true});
  }
  function wireAllSheets(){$$('.sheet').forEach(wireSheet);updateSheetState()}
  wireAllSheets();

  const _openSheet=openSheet; openSheet=function(id){_openSheet(id); requestAnimationFrame(()=>{wireAllSheets();updateSheetState()})};
  const _closeSheets=closeSheets; closeSheets=function(){_closeSheets();requestAnimationFrame(updateSheetState)};

  function updatePager(){
    pager.textContent=`${String((S.currentSlide||0)+1).padStart(2,'0')} / ${String(Math.max(1,S.slides.length)).padStart(2,'0')}`;
    $$('.slide').forEach((el,i)=>el.classList.toggle('isCurrent',i===S.currentSlide));
  }
  const _renderFilmstrip=renderFilmstrip; renderFilmstrip=function(){_renderFilmstrip();updatePager()};
  const _goToSlide=goToSlide; goToSlide=function(i){_goToSlide(i);updatePager()};

  function setSelected(slideI,id,type){
    S.currentSlide=slideI; S.selected=id; S.selectedType=type;
    S.slides[slideI]?.layers.find(x=>x.id===id);
    $('#contextText').textContent=type==='img'?(S.photoEditMode==='move'?'Foto · mover marco':'Foto · reencuadrar'):'Texto · mover / pellizcar';
    context.classList.add('on'); clearTimeout(context._t); context._t=setTimeout(()=>context.classList.remove('on'),1800);
    renderFilmstrip(); renderSheets(); saveProject();
  }

  function ensureGuides(slide){
    if(!slide.querySelector('.snapGuide.v')){const v=document.createElement('div');v.className='snapGuide v';slide.appendChild(v);const h=document.createElement('div');h.className='snapGuide h';slide.appendChild(h)}
    return {v:slide.querySelector('.snapGuide.v'),h:slide.querySelector('.snapGuide.h')};
  }
  function lockCanvas(on){gestureActive=on;document.body.classList.toggle('gestureLock',on)}

  bindObjects=function(){
    $$('.textLayer').forEach(bindTextDirect);
    $$('.imgLayer').forEach(bindImgDirect);
  };

  function bindTextDirect(el){
    if(el.dataset.directBound)return; el.dataset.directBound='1';
    const slideI=+el.dataset.slide,id=el.dataset.id;
    let st=null,moved=false;
    el.addEventListener('touchstart',e=>{
      const l=S.slides[slideI]?.layers.find(x=>x.id===id); if(!l)return;
      setSelected(slideI,id,'text');
      if(l.locked){toast('Texto bloqueado');return}
      lockCanvas(true); el.classList.add('isManipulating'); moved=false;
      if(e.touches.length===1){const t=e.touches[0];st={mode:'drag',sx:t.clientX,sy:t.clientY,bx:l.x,by:l.y}}
      else if(e.touches.length>=2){const a=e.touches[0],b=e.touches[1],m=mid(a,b);st={mode:'pinch',sd:dist(a,b),sa:angle(a,b),ss:l.size,sr:l.rot,sx:m.x,sy:m.y,bx:l.x,by:l.y}}
    },{passive:true});
    el.addEventListener('touchmove',e=>{
      if(!st)return; const l=S.slides[slideI]?.layers.find(x=>x.id===id);if(!l||l.locked)return; e.preventDefault(); moved=true; const scale=sc(); const slide=el.closest('.slide'),g=ensureGuides(slide);
      if(e.touches.length>=2){const a=e.touches[0],b=e.touches[1],m=mid(a,b); if(st.mode!=='pinch'){st={mode:'pinch',sd:dist(a,b),sa:angle(a,b),ss:l.size,sr:l.rot,sx:m.x,sy:m.y,bx:l.x,by:l.y}}; l.size=clamp(st.ss*(dist(a,b)/Math.max(1,st.sd)),14,160); l.rot=st.sr+(angle(a,b)-st.sa)*180/Math.PI; l.x=st.bx+(m.x-st.sx)/scale; l.y=st.by+(m.y-st.sy)/scale; }
      else {const t=e.touches[0];l.x=st.bx+(t.clientX-st.sx)/scale;l.y=st.by+(t.clientY-st.sy)/scale}
      const cx=l.x+l.w/2, cy=l.y+l.size*.48; const snapX=Math.abs(cx-170)<7, snapY=Math.abs(cy-212.5)<7; if(snapX)l.x=170-l.w/2;if(snapY)l.y=212.5-l.size*.48;g.v.classList.toggle('on',snapX);g.h.classList.toggle('on',snapY);
      el.style.left=(l.x*scale)+'px';el.style.top=(l.y*scale)+'px';el.style.fontSize=(l.size*scale)+'px';el.style.transform=`rotate(${l.rot}deg)`;
    },{passive:false});
    const finish=()=>{if(!st)return;st=null;lockCanvas(false);el.classList.remove('isManipulating');const slide=el.closest('.slide');slide?.querySelectorAll('.snapGuide').forEach(g=>g.classList.remove('on'));saveProject();renderFilmstrip()};
    el.addEventListener('touchend',finish,{passive:true});el.addEventListener('touchcancel',finish,{passive:true});
    el.addEventListener('click',e=>{if(moved){moved=false;e.preventDefault();e.stopPropagation();return}setSelected(slideI,id,'text');renderStage();renderTextSheet();openSheet('#textSheet')});
    el.addEventListener('dblclick',()=>{setSelected(slideI,id,'text');renderStage();renderTextSheet();openSheet('#textSheet');setTimeout(()=>$('#textInput')?.focus(),80)});
  }

  function bindImgDirect(el){
    if(el.dataset.directBound)return; el.dataset.directBound='1';
    const slideI=+el.dataset.slide,id=el.dataset.id;
    let st=null,moved=false;
    el.addEventListener('touchstart',e=>{
      const l=S.slides[slideI]?.layers.find(x=>x.id===id); if(!l)return;
      setSelected(slideI,id,'img');
      if(l.locked){toast('Foto bloqueada');return}
      lockCanvas(true); el.classList.add('isManipulating');moved=false;
      if(e.touches.length===1){const t=e.touches[0];st={mode:'drag',sx:t.clientX,sy:t.clientY,bx:l.x,by:l.y,boX:l.offX,boY:l.offY}}
      else if(e.touches.length>=2){const a=e.touches[0],b=e.touches[1],m=mid(a,b);st={mode:'pinch',sd:dist(a,b),sz:l.zoom,sx:m.x,sy:m.y,bx:l.x,by:l.y,boX:l.offX,boY:l.offY}}
    },{passive:true});
    el.addEventListener('touchmove',e=>{
      if(!st)return; const l=S.slides[slideI]?.layers.find(x=>x.id===id);if(!l||l.locked)return;e.preventDefault();moved=true;const scale=sc();
      if(e.touches.length>=2){const a=e.touches[0],b=e.touches[1],m=mid(a,b);if(st.mode!=='pinch')st={mode:'pinch',sd:dist(a,b),sz:l.zoom,sx:m.x,sy:m.y,bx:l.x,by:l.y,boX:l.offX,boY:l.offY};l.zoom=clamp(st.sz*(dist(a,b)/Math.max(1,st.sd)),1,3);if(S.photoEditMode==='move'){l.x=st.bx+(m.x-st.sx)/scale;l.y=st.by+(m.y-st.sy)/scale}else{l.offX=clamp(st.boX+(m.x-st.sx)*.12,-48,48);l.offY=clamp(st.boY+(m.y-st.sy)*.12,-48,48)}}
      else {const t=e.touches[0],dx=t.clientX-st.sx,dy=t.clientY-st.sy;if(S.photoEditMode==='move'){l.x=st.bx+dx/scale;l.y=st.by+dy/scale}else{l.offX=clamp(st.boX+dx*.12,-48,48);l.offY=clamp(st.boY+dy*.12,-48,48)}}
      el.style.left=(l.x*scale)+'px';el.style.top=(l.y*scale)+'px';el.style.transform=`rotate(${l.rot}deg) scale(${l.zoom})`;el.style.objectPosition=`${50+l.offX}% ${50+l.offY}%`;
      const zr=$('#zoomRange');if(zr&&S.selected===id)zr.value=l.zoom;
      $('#contextText').textContent=S.photoEditMode==='move'?'Foto · mover marco':'Foto · reencuadrar';
    },{passive:false});
    const finish=()=>{if(!st)return;st=null;lockCanvas(false);el.classList.remove('isManipulating');saveProject();renderFilmstrip()};
    el.addEventListener('touchend',finish,{passive:true});el.addEventListener('touchcancel',finish,{passive:true});
    el.addEventListener('click',e=>{if(moved){moved=false;e.preventDefault();e.stopPropagation();return}setSelected(slideI,id,'img');renderStage();renderPhotoSheet();openSheet('#photoSheet')});
    el.addEventListener('dblclick',()=>{const l=S.slides[slideI]?.layers.find(x=>x.id===id);if(!l)return;pushHistory();l.zoom=1;l.offX=0;l.offY=0;renderStage();renderPhotoSheet();saveProject();toast('Encuadre reiniciado')});
  }

  const photoSheet=$('#photoSheet');
  if(photoSheet && !$('#interactionModeMini')){
    const mini=document.createElement('div');mini.className='photoModeMini';mini.id='interactionModeMini';mini.innerHTML='<button data-pmode="crop">Reencuadrar</button><button data-pmode="move">Mover marco</button>';
    const hint=photoSheet.querySelector('.hint');(hint||photoSheet.querySelector('.grid3'))?.insertAdjacentElement('beforebegin',mini);
    mini.onclick=e=>{const b=e.target.closest('[data-pmode]');if(!b)return;S.photoEditMode=b.dataset.pmode;syncPhotoModes();$('#contextText').textContent=S.photoEditMode==='move'?'Foto · mover marco':'Foto · reencuadrar';toast(S.photoEditMode==='move'?'Ahora mueves el marco':'Ahora reencuadras la foto')};
  }
  function syncPhotoModes(){$$('#interactionModeMini [data-pmode]').forEach(b=>b.classList.toggle('on',b.dataset.pmode===S.photoEditMode));$('#moveModeBtn')?.classList.toggle('on',S.photoEditMode==='move');$('#cropModeBtn')?.classList.toggle('on',S.photoEditMode==='crop')}
  $('#moveModeBtn')?.addEventListener('click',()=>{S.photoEditMode='move';syncPhotoModes()});$('#cropModeBtn')?.addEventListener('click',()=>{S.photoEditMode='crop';syncPhotoModes()});

  let dragThumb=null;
  $('#filmstrip')?.addEventListener('touchstart',e=>{const th=e.target.closest('.thumb');if(!th)return;dragThumb={el:th,sx:e.touches[0].clientX,scroll:$('#filmstrip').scrollLeft}}, {passive:true});
  $('#filmstrip')?.addEventListener('touchmove',e=>{if(!dragThumb)return;const dx=e.touches[0].clientX-dragThumb.sx;if(Math.abs(dx)>6)$('#filmstrip').scrollLeft=dragThumb.scroll-dx},{passive:true});
  $('#filmstrip')?.addEventListener('touchend',()=>dragThumb=null,{passive:true});

  $('#textInput')?.addEventListener('focus',()=>setTimeout(()=>$('#textSheet')?.scrollIntoView({block:'end',behavior:'smooth'}),120));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeSheets();updateSheetState()}});

  const _renderAll=renderAll; renderAll=function(){_renderAll();wireAllSheets();updatePager();syncPhotoModes()};
  renderStage();renderFilmstrip();wireAllSheets();updatePager();syncPhotoModes();
  toast('Interacción refinada');
})();
;
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
function snapshot(){return clone({slides:S.slides,currentSlide:S.currentSlide,randomMode:S.randomMode,showSafe:S.showSafe,finish:S.finish,designDNA:S.designDNA,frameBrief:S.frameBrief,frameTemplateFamily:S.frameTemplateFamily,frameCaption:S.frameCaption,frameArtDirection:S.frameArtDirection,frameLastDesign:S.frameLastDesign})}
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
;
(()=>{
const css=document.createElement('style');css.textContent=`
/* Rescue pass: selection is safe; editing is intentional */
.imgLayer,.textLayer{touch-action:manipulation!important}.imgLayer.isEditArmed,.textLayer.isEditArmed{touch-action:none!important;outline:2px solid rgba(255,255,255,.92)!important;outline-offset:3px}.editHint{position:fixed;left:50%;bottom:calc(164px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:95;display:none;gap:7px;padding:7px;border-radius:18px;background:rgba(17,17,20,.94);border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(18px)}.editHint.on{display:flex}.editHint button{min-height:38px;padding:0 13px;border-radius:12px;border:0;background:#28282e;color:#fff;font-size:11px;font-weight:700}.editHint .danger{background:#3a171b;color:#ff9da6}.textQuickEdit{display:flex;gap:8px;margin:10px 0 2px}.textQuickEdit button{flex:1;min-height:42px;border-radius:13px;border:1px solid #303036;background:#111114;color:#eee;font-weight:700}.textQuickEdit .danger{border-color:#55252b;color:#ff8e98}.textLayer{cursor:pointer}
`;document.head.appendChild(css);
let armed=null;
const bar=document.createElement('div');bar.className='editHint';bar.innerHTML='<button id="uxEdit">Editar</button><button id="uxMove">Mover</button><button class="danger" id="uxDelete">Eliminar</button>';document.body.appendChild(bar);
function layer(){if(!S.selected)return null;return S.slides[S.currentSlide]?.layers.find(l=>l.id===S.selected)||null}
function disarm(){if(armed){armed.classList.remove('isEditArmed');armed=null}bar.classList.remove('on');document.body.classList.remove('uxArmed')}
function selectOnly(el){disarm();const si=+el.dataset.slide,id=el.dataset.id,type=el.classList.contains('textLayer')?'text':'img';S.currentSlide=si;S.selected=id;S.selectedType=type;renderFilmstrip?.();renderSheets?.();bar.classList.add('on')}
function arm(){const el=document.querySelector(`.slide[data-slide="${S.currentSlide}"] [data-id="${S.selected}"]`)||document.querySelector(`[data-id="${S.selected}"]`);if(!el)return;disarm();armed=el;armed.classList.add('isEditArmed');bar.classList.add('on');document.body.classList.add('uxArmed');toast(S.selectedType==='text'?'Arrastra para mover el texto':'Arrastra para reencuadrar')}
function remove(){const sl=S.slides[S.currentSlide];if(!sl||!S.selected)return;pushHistory?.();const i=sl.layers.findIndex(l=>l.id===S.selected);if(i<0)return;sl.layers.splice(i,1);S.selected=null;S.selectedType=null;disarm();renderAll();saveProject();toast('Elemento eliminado')}
function openEditor(){if(S.selectedType==='text'){renderTextSheet();openSheet('#textSheet');setTimeout(()=>$('#textInput')?.focus(),100)}else{renderPhotoSheet();openSheet('#photoSheet')}}
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
;
/* Pure composition engine. Files, decoding, persistence and UI belong to their owners. */
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FrameTemplateEngine = api;
})(typeof window !== 'undefined' ? window : this, function() {
  const W = 340, H = 425;
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
  const aspect = p => Number(p.aspect || p.width / p.height || p.w / p.h) || 1;
  const faces = p => p.faces?.length ? p.faces : p.faceUnion ? [p.faceUnion] : [];
  function seeded(seed) {
    let s = seed >>> 0;
    return () => { s += 0x6D2B79F5; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function weighted(rows, random) {
    let n = random() * rows.reduce((sum, r) => sum + r.weight, 0);
    return rows.find(r => (n -= r.weight) < 0) || rows.at(-1);
  }
  function union(p) {
    const f = faces(p);
    if (!f.length) return null;
    const x = Math.min(...f.map(b => b.x)), y = Math.min(...f.map(b => b.y));
    return {x, y, w: Math.max(...f.map(b => b.x + b.w)) - x, h: Math.max(...f.map(b => b.y + b.h)) - y};
  }
  // CSS object-position and canvas export use the same excess-pixel percentage.
  function crop(p, w, h) {
    const ratio = aspect(p), target = w / h;
    const vw = Math.min(1, target / ratio), vh = Math.min(1, ratio / target);
    const u = union(p);
    const x = clamp((u ? u.x + u.w / 2 : .5) - vw / 2, 0, 1 - vw);
    const y = clamp((u ? u.y + u.h / 2 : .5) - vh / 2, 0, 1 - vh);
    const safe = !u || (u.x >= x - .001 && u.y >= y - .001 && u.x + u.w <= x + vw + .001 && u.y + u.h <= y + vh + .001);
    return {offX: vw < .999 ? (x / (1 - vw) - .5) * 100 : 0,
      offY: vh < .999 ? (y / (1 - vh) - .5) * 100 : 0, safe, visible: {x, y, w: vw, h: vh}, retained: vw * vh};
  }
  function fittedSlot(slot, p) {
    const result = {...slot};
    const target = slot.w * W / (slot.h * H), ratio = aspect(p);
    if (ratio > target) { result.h = slot.w * W / ratio / H; result.y += (slot.h - result.h) / 2; }
    else { result.w = slot.h * H * ratio / W; result.x += (slot.w - result.w) / 2; }
    return result;
  }
  function assign(variant, pool, random, allowOverlap = false) {
    if (variant.photoCount > pool.length) return null;
    const free = [...pool], assigned = new Array(variant.slots.length);
    // Constrained small cells get first choice; groups remain available for large slots.
    const order = variant.slots.map((s, i) => ({s, i})).sort((a,b) => a.s.w*a.s.h - b.s.w*b.s.h);
    let fit = 0;
    for (const {s, i} of order) {
      const ranked = free.map(p => {
        let slot = s, c = crop(p, s.w * W, s.h * H);
        if (variant.photoCount === 1) { slot = fittedSlot(s, p); c = crop(p, slot.w * W, slot.h * H); }
        const count = p.faceCount || faces(p).length, area = slot.w * slot.h;
        const dense = variant.photoCount > 1;
        const safe = c.safe && !(dense && count >= 3 && area < .28) && !(dense && count >= 2 && area < .14) && !(allowOverlap && count);
        // Image variance may be in thousands. It must never override crop safety.
        const quality = Math.log1p(Math.max(0, Number(p.score) || 0)) / 4;
        return {p, slot, c, safe, score: c.retained * 16 + Math.min(quality, 4) + random() * 9};
      }).filter(r => r.safe).sort((a,b) => b.score-a.score);
      if (!ranked.length) return null;
      const best = ranked[0]; assigned[i] = best; fit += best.c.retained;
      free.splice(free.indexOf(best.p), 1);
    }
    return {assigned, fit: fit / assigned.length};
  }
  function canSpread(p, span) {
    if (aspect(p) < span * .8 * .8) return false;
    const c = crop(p, W * span, H);
    if (!c.safe) return false;
    // A face can fit the composite while still being severed at a page boundary.
    return faces(p).every(f => {
      const left = (f.x - c.visible.x) / c.visible.w, right = (f.x + f.w - c.visible.x) / c.visible.w;
      for (let i = 1; i < span; i++) if (left - .015 < i/span && right + .015 > i/span) return false;
      return true;
    });
  }
  function background(family, photos) {
    if (family.background !== 'single_photo_derived_accent' && family.background !== 'photo') return family.background;
    if (family.background === 'photo') return '#ffffff';
    const c = photos.map(p => p.avg || [128,128,128]).sort((a,b) => (Math.max(...b)-Math.min(...b))-(Math.max(...a)-Math.min(...a)))[0];
    return `rgb(${c.map(v => Math.round(v*.68+245*.32)).join(',')})`;
  }
  function signature(slides) {
    return slides.map(sl => `${sl.frameLayout}:${sl.layers.filter(l=>l.type==='img').map(l=>l.photo.id).join(',')}`).join('|');
  }
  function captionLines(text) {
    const words=String(text).trim().slice(0,120).split(/\s+/).flatMap(word=>word.match(/.{1,40}/g)||[]), lines=[''];
    words.forEach(word=>{const last=lines.length-1;if((lines[last]+' '+word).trim().length>40 && lines[last])lines.push(word);else lines[last]=(lines[last]+' '+word).trim()});
    return lines.join('\n');
  }
  function generate({catalog, photos, brief = {}, familyId, previous, seed = Date.now(), caption = ''}) {
    if (!photos.length) return {slides: [], familyId: null, signature: ''};
    const random = seeded(seed), families = catalog.families;
    const weights = families.map(f => {
      let weight = f.initialWeight;
      if (f.preferPurpose.includes(brief.purpose)) weight *= 1.8;
      if (f.preferVibe.includes(brief.vibe)) weight *= 2;
      if (brief.vibe === 'clean' && ['film_archive','soft_scrapbook','color_editorial'].includes(f.id)) weight *= .08;
      if (brief.vibe === 'color' && f.id === 'color_editorial') weight *= 8;
      if (brief.vibe === 'bold' && f.id === 'soft_scrapbook') weight *= 5;
      if (brief.purpose === 'showcase' && f.id === 'museum_notes') weight *= 2.5;
      if (previous?.dir === f.id) weight *= .85;
      return {f, weight};
    });
    const family = families.find(f=>f.id===familyId) || weighted(weights, random).f;
    const gallery = families.find(f=>f.id==='gallery_book').variants;
    const pairs = families.find(f=>f.id==='editorial_pair').variants;
    const bg = background(family, photos);
    const candidates = [];
    for (let attempt = 0; attempt < 12; attempt++) {
      let serial = 0, pool = [...photos], slides = [], totalFit = 0, fitCount = 0;
      const uid = () => `tpl_${seed}_${attempt}_${++serial}`;
      const layer = (p, slot, c, index = 0) => ({id:uid(),type:'img',photo:p,x:slot.x*W,y:slot.y*H,w:slot.w*W,h:slot.h*H,
        rot:slot.rotation||0,zoom:1,offX:c.offX,offY:c.offY,z:10+index,hidden:false,locked:false,moveMode:'crop',storyAuto:true});
      const page = kind => ({id:uid(),bg,layers:[],palette:null,favorite:false,frameAuto:true,frameFamily:family.id,frameLayout:kind});
      function append(v, assigned, front = false) {
        const sl = page(v.id);
        assigned.assigned.forEach((a, i) => sl.layers.push(layer(a.p,a.slot,a.c,i)));
        if (v.captionRegion) sl.frameCaptionRegion = {...v.captionRegion};
        if (front) slides.unshift(sl); else slides.push(sl);
        const used = new Set(assigned.assigned.map(a=>a.p.id));
        pool = pool.filter(p=>!used.has(p.id)); totalFit += assigned.fit; fitCount++;
      }
      // Dense, orderly grids are intentional layouts, never nine "too small" penalties.
      if (family.id === 'museum_notes') {
        const grids = [...family.variants].sort((a,b)=>b.photoCount-a.photoCount);
        const max = brief.density === 'airy' && brief.purpose !== 'showcase' ? 6 : 9;
        const eligible = grids.filter(v=>v.photoCount<=max && v.photoCount<=pool.length);
        for (const v of eligible) {
          const assigned = assign(v,pool,random);
          if (assigned) { append(v,assigned); break; }
        }
      }
      if (family.id === 'continuous') {
        const variants = [...family.variants].sort(()=>random()-.5);
        for (const v of variants) {
          const p = [...pool].sort(()=>random()-.5).find(p=>canSpread(p,v.pageSpan));
          if (!p) continue;
          const c = crop(p,W*v.pageSpan,H);
          for (let i=0;i<v.pageSpan;i++) {
            const sl=page(v.id);
            sl.storySpan={photoId:p.id,start:0,span:v.pageSpan,seg:i};
            sl.layers.push({...layer(p,{x:-i,y:0,w:v.pageSpan,h:1},c),storySpan:true,storySeg:i,storySpanCount:v.pageSpan});
            slides.push(sl);
          }
          pool=pool.filter(q=>q.id!==p.id); break;
        }
      }
      while (pool.length) {
        let options = family.variants.filter(v=>v.pageSpan===1);
        if (family.id==='museum_notes' && slides.length) options=[...pairs,...gallery];
        else options=[...options,...gallery,...pairs];
        options=[...new Map(options.map(v=>[v.id,v])).values()];
        const ranked=[];
        for (const v of options) {
          if (v.photoCount>pool.length) continue;
          const a=assign(v,pool,random,family.allowOverlap && v.id.startsWith('scrapbook'));
          if (!a) continue;
          const native=family.variants.some(x=>x.id===v.id);
          const target=brief.density==='airy'?1.5:brief.density==='rich'?4:2.5;
          let score=a.fit*8+(native?9:0)-Math.abs(v.photoCount-target)*2+random()*8;
          if (v.id===slides.at(-1)?.frameLayout) score-=5;
          if (family.id==='museum_notes' && slides.length && pool.length===3 && v.photoCount===2) score+=20;
          if (brief.purpose==='impact' && !slides.length && v.photoCount===1) score+=12;
          ranked.push({v,a,score});
        }
        ranked.sort((a,b)=>b.score-a.score);
        // A fitted single image is always eligible, even for a very wide group photo.
        const choice=ranked[0];
        if (!choice) throw new Error('No safe layout available');
        append(choice.v,choice.a,family.id==='museum_notes' && slides.length>0 && pool.length<=3);
      }
      // Only one user-authored caption per album. No fabricated dates or locations.
      const note = String(caption).trim().slice(0,120);
      const captionSlide = slides.find(sl=>sl.frameCaptionRegion);
      if (note && captionSlide) {
        const r=captionSlide.frameCaptionRegion;
        // Four short lines fit the reserved footer in both preview and export.
        captionSlide.layers.push({id:uid(),type:'text',text:captionLines(note),x:r.x*W,y:r.y*H,w:r.w*W,size:6.5,color:'#222222',font:'mono',weight:400,rot:0,z:40,hidden:false,locked:false,userTouched:true,frameCaption:true});
      }
      const sig=signature(slides);
      let score=totalFit/Math.max(fitCount,1)*12 + random()*4;
      if (previous?.signature===sig) score-=100;
      if (previous?.layouts?.join('|')===slides.map(sl=>sl.frameLayout).join('|')) score-=4;
      candidates.push({slides,familyId:family.id,familyName:family.name,signature:sig,score});
    }
    candidates.sort((a,b)=>b.score-a.score);
    return candidates[0];
  }
  return {generate, crop, canSpread, signature, captionLines};
});

;
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

;
(()=>{
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const css=document.createElement('style');css.textContent=`
.photoClip{position:absolute;overflow:hidden;border-radius:inherit;touch-action:manipulation}.photoClip>.imgLayer{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;transform-origin:center center!important;margin:0!important}
.photoEditOverlay{position:fixed;inset:0;z-index:180;background:#09090b;display:none;flex-direction:column;padding:max(12px,env(safe-area-inset-top)) 14px max(12px,env(safe-area-inset-bottom));box-sizing:border-box}.photoEditOverlay.on{display:flex}.peTop{display:flex;align-items:center;justify-content:space-between;min-height:52px}.peTop b{font-size:16px}.peTop button{border:0;background:transparent;color:#f3f3f5;font-size:14px}.peDone{font-weight:800}.peStage{flex:1;display:grid;place-items:center;min-height:0}.peFrame{position:relative;width:min(84vw,360px);height:min(64vh,450px);overflow:hidden;background:#151519;border-radius:18px;box-shadow:0 24px 70px rgba(0,0,0,.45);touch-action:none}.peFrame img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform-origin:center center;user-select:none;-webkit-user-drag:none}.peFrame:after{content:'';position:absolute;inset:0;border:1px solid rgba(255,255,255,.16);border-radius:inherit;pointer-events:none}.peHint{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);padding:7px 10px;border-radius:999px;background:rgba(0,0,0,.52);backdrop-filter:blur(12px);font-size:10px;color:#ddd;white-space:nowrap;pointer-events:none;opacity:.9}.peBottom{padding-top:12px}.peSlider{display:flex;align-items:center;gap:10px}.peSlider span{font-size:11px;color:#8a8a94}.peSlider input{flex:1}.peActions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.peActions button{min-height:44px;border-radius:14px;border:1px solid #303037;background:#121216;color:#eee;font-weight:750}.peActions .primary{background:#f2f2f4;color:#09090b;border-color:#f2f2f4}.peMode{display:flex;gap:7px;margin-bottom:10px}.peMode button{flex:1;min-height:40px;border-radius:12px;border:1px solid #303037;background:#101014;color:#aaa;font-size:11px;font-weight:700}.peMode button.on{background:#f1f1f3;color:#0a0a0b;border-color:#f1f1f3}
`;document.head.appendChild(css);

function modelFor(el){const si=+el.dataset.slide,id=el.dataset.id;return {si,l:S.slides?.[si]?.layers?.find(x=>x.id===id)}}
function wrapPhotos(){
  $$('.imgLayer').forEach(img=>{
    if(img.closest('.photoEditOverlay')||img.parentElement?.classList.contains('photoClip'))return;
    const {l}=modelFor(img);if(!l)return;
    const p=img.parentElement,clip=document.createElement('div');clip.className='photoClip';
    const cs=img.style;clip.style.left=cs.left;clip.style.top=cs.top;clip.style.width=cs.width;clip.style.height=cs.height;clip.style.zIndex=cs.zIndex;clip.style.borderRadius=cs.borderRadius||getComputedStyle(img).borderRadius;clip.style.transform=`rotate(${l.rot||0}deg)`;
    p.insertBefore(clip,img);clip.appendChild(img);img.style.left='0';img.style.top='0';img.style.width='100%';img.style.height='100%';img.style.zIndex='1';img.style.borderRadius='0';img.style.objectFit='cover';img.style.objectPosition=`${50+(l.offX||0)}% ${50+(l.offY||0)}%`;img.style.transform=`scale(${l.zoom||1})`;
  })
}
const oldRS=renderStage;renderStage=function(){oldRS();requestAnimationFrame(wrapPhotos)};
const oldRA=renderAll;renderAll=function(){oldRA();requestAnimationFrame(wrapPhotos)};requestAnimationFrame(wrapPhotos);

const ov=document.createElement('div');ov.className='photoEditOverlay';ov.id='photoEditV2';ov.innerHTML=`<div class="peTop"><button id="peCancel">Cancelar</button><b>Reencuadrar foto</b><button class="peDone" id="peDone">Listo</button></div><div class="peStage"><div class="peFrame" id="peFrame"><img id="peImg"><div class="peHint">Arrastra para mover · Pellizca para acercar</div></div></div><div class="peBottom"><div class="peMode"><button class="on" id="peCropMode">Dentro del marco</button><button id="peFrameMode">Mover marco</button></div><div class="peSlider"><span>Zoom</span><input id="peZoom" type="range" min="1" max="2.5" step="0.01" value="1"><span id="peZoomVal">1.00×</span></div><div class="peActions"><button id="peReset">Restablecer</button><button class="primary" id="peFit">Centrar</button></div></div>`;document.body.appendChild(ov);
const frame=$('#peFrame'),im=$('#peImg'),zr=$('#peZoom'),zv=$('#peZoomVal');
let edit=null,mode='crop',start=null;
function renderEdit(){if(!edit)return;im.style.objectPosition=`${50+edit.offX}% ${50+edit.offY}%`;im.style.transform=`scale(${edit.zoom})`;zr.value=edit.zoom;zv.textContent=edit.zoom.toFixed(2)+'×'}
function openEditor(){const l=S.slides?.[S.currentSlide]?.layers?.find(x=>x.id===S.selected);if(!l||l.type!=='img')return;edit={l,orig:{x:l.x,y:l.y,offX:l.offX||0,offY:l.offY||0,zoom:l.zoom||1},x:l.x,y:l.y,offX:l.offX||0,offY:l.offY||0,zoom:l.zoom||1};im.src=l.photo?.url||'';mode='crop';$('#peCropMode').classList.add('on');$('#peFrameMode').classList.remove('on');renderEdit();ov.classList.add('on')}
function close(save){if(!edit)return;if(save){Object.assign(edit.l,{x:edit.x,y:edit.y,offX:edit.offX,offY:edit.offY,zoom:edit.zoom,userTouched:true});pushHistory?.();saveProject();renderAll();toast('Foto ajustada')}edit=null;ov.classList.remove('on')}
$('#peCancel').onclick=()=>close(false);$('#peDone').onclick=()=>close(true);$('#peCropMode').onclick=()=>{mode='crop';$('#peCropMode').classList.add('on');$('#peFrameMode').classList.remove('on');$('.peHint').textContent='Arrastra para mover · Pellizca para acercar'};$('#peFrameMode').onclick=()=>{mode='frame';$('#peFrameMode').classList.add('on');$('#peCropMode').classList.remove('on');$('.peHint').textContent='Arrastra para mover el marco'};
$('#peReset').onclick=()=>{if(!edit)return;Object.assign(edit,{x:edit.orig.x,y:edit.orig.y,offX:0,offY:0,zoom:1});renderEdit()};$('#peFit').onclick=()=>{if(!edit)return;edit.offX=0;edit.offY=0;renderEdit()};zr.oninput=e=>{if(!edit)return;edit.zoom=+e.target.value;renderEdit()};
function d(a,b){return Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)};function m(a,b){return{x:(a.clientX+b.clientX)/2,y:(a.clientY+b.clientY)/2}}
frame.addEventListener('touchstart',e=>{if(!edit)return;const t=e.touches;if(t.length===1){start={n:1,x:t[0].clientX,y:t[0].clientY,offX:edit.offX,offY:edit.offY,bx:edit.x,by:edit.y}}else if(t.length>=2){const mm=m(t[0],t[1]);start={n:2,dist:d(t[0],t[1]),zoom:edit.zoom,mx:mm.x,my:mm.y,offX:edit.offX,offY:edit.offY,bx:edit.x,by:edit.y}}},{passive:true});
frame.addEventListener('touchmove',e=>{if(!edit||!start)return;e.preventDefault();const t=e.touches;if(t.length>=2){if(start.n!==2){const mm=m(t[0],t[1]);start={n:2,dist:d(t[0],t[1]),zoom:edit.zoom,mx:mm.x,my:mm.y,offX:edit.offX,offY:edit.offY,bx:edit.x,by:edit.y}}const mm=m(t[0],t[1]);edit.zoom=clamp(start.zoom*d(t[0],t[1])/Math.max(1,start.dist),1,2.5);if(mode==='crop'){edit.offX=clamp(start.offX+(mm.x-start.mx)*.22,-45,45);edit.offY=clamp(start.offY+(mm.y-start.my)*.22,-45,45)}else{edit.x=start.bx+(mm.x-start.mx)*.45;edit.y=start.by+(mm.y-start.my)*.45}}else if(t.length===1){const dx=t[0].clientX-start.x,dy=t[0].clientY-start.y;if(mode==='crop'){edit.offX=clamp(start.offX+dx*.22,-45,45);edit.offY=clamp(start.offY+dy*.22,-45,45)}else{edit.x=start.bx+dx*.45;edit.y=start.by+dy*.45}}renderEdit()},{passive:false});frame.addEventListener('touchend',()=>{start=null},{passive:true});frame.addEventListener('touchcancel',()=>{start=null},{passive:true});

// Replace the previous photo Edit action with this dedicated editor.
document.addEventListener('click',e=>{if(e.target?.id==='uxEdit'&&S.selectedType==='img'){e.preventDefault();e.stopImmediatePropagation();openEditor()}},{capture:true});
// Double tap on a selected photo opens reframe instead of resetting it.
document.addEventListener('dblclick',e=>{const el=e.target.closest?.('.imgLayer');if(!el)return;e.preventDefault();e.stopImmediatePropagation();S.currentSlide=+el.dataset.slide;S.selected=el.dataset.id;S.selectedType='img';openEditor()},{capture:true});
})();