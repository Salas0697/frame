// DOM integration, NOT browser acceptance: image decoding is substituted deliberately.
// Real application handlers, modal, storyboard, rendering and storage execute together.
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {JSDOM,VirtualConsole} = require('jsdom');
const {IDBFactory} = require('fake-indexeddb');
const root = path.join(__dirname,'..');

function boot(entry='index.html', storageFailure=false) {
  const html=fs.readFileSync(path.join(root,entry),'utf8');
  const src=html.match(/<script src="([^"]+)"/)[1];
  const bundle=fs.readFileSync(path.resolve(root,path.dirname(entry),src),'utf8');
  const errors=[], console=new VirtualConsole();
  // jsdom cannot parse all of the unchanged legacy CSS; this suite does not validate layout.
  console.on('jsdomError',error=>{if(error.type!=='css-parsing')errors.push(error)});
  const dom=new JSDOM(html,{url:`https://frame.test/${entry}`,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:console});
  const w=dom.window, d=w.document, phases=[], listeners=[];
  w.indexedDB=new IDBFactory();
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  w.URL.createObjectURL=file=>`blob:${file.name}-${file.size}`;
  w.URL.revokeObjectURL=()=>{};
  w.console.warn=()=>{};
  w.Image=class {set src(value){this.naturalWidth=900;this.naturalHeight=1200;queueMicrotask(()=>this.onload?.())}};
  w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){},getImageData(){return {data:new Uint8ClampedArray([80,105,140,255])}}});
  const observers=[], Observer=w.MutationObserver;
  w.MutationObserver=class extends Observer {constructor(callback){super(callback);observers.push(this)}};
  if(storageFailure){Object.defineProperty(w,'localStorage',{get(){throw Error('storage blocked')}})}
  const add=w.EventTarget.prototype.addEventListener;
  w.EventTarget.prototype.addEventListener=function(type,handler,options){
    if(this.tagName==='INPUT'&&this.type==='file')listeners.push({id:this.id,type,capture:options===true||!!options?.capture});
    return add.call(this,type,handler,options);
  };
  d.addEventListener('frame:import-phase',event=>phases.push(event.detail.phase));
  w.eval(bundle+'\nwindow.__test={state:()=>S};');
  const controller=w.framePhotoImport, input=d.querySelector('#photosInput');
  let picked=0, calls=0;
  input.click=()=>{picked++};
  const batches=[];
  controller.ports.analyzePhotos=async files=>{
    calls++;batches.push(files);
    return files.map((file,i)=>({id:file.name,name:file.name,url:`blob:${file.name}`,w:1200,h:1600,
      width:1200,height:1600,aspect:.75,avg:[80+i*9,105,140],score:100+i,variance:500,
      brightness:100,grid:[1,2,3,4,5,6,7,8,9],faces:[],faceCount:0}));
  };
  controller.ports.yieldToPaint=async()=>{};
  const select=files=>{
    Object.defineProperty(input,'files',{value:files,configurable:true});
    input.dispatchEvent(new w.Event('input',{bubbles:true}));
    input.dispatchEvent(new w.Event('change',{bubbles:true}));
  };
  async function complete(button='#journeyCreate') {
    const done=new Promise(resolve=>{
      const handler=e=>{if(e.detail.phase==='idle'){d.removeEventListener('frame:import-phase',handler);resolve()}};
      d.addEventListener('frame:import-phase',handler);
    });
    for(let i=0;i<200&&d.querySelector(button).disabled;i++)await new Promise(r=>setTimeout(r,5));
    assert.equal(d.querySelector(button).disabled,false);d.querySelector(button).click();await done;
  }
  const close=()=>{observers.forEach(observer=>observer.disconnect());dom.window.close();assert.deepEqual(errors,[],'no uncaught application errors')};
  return {w,d,dom,controller,input,phases,listeners,select,complete,batches,close,calls:()=>calls,picked:()=>picked};
}
function batch(n,start=0){return Array.from({length:n},(_,i)=>new File([`jpeg-fixture-${i+start}`],`photo-${i+start}.jpg`,{type:'image/jpeg'}))}

test('generated entrypoints share one content-addressed runtime and no legacy loader',()=>{
  const paths=['index.html','frame/index.html'].map(entry=>{
    const html=fs.readFileSync(path.join(root,entry),'utf8');
    assert.ok(!html.includes('document.write'));
    assert.ok(!html.includes('initPhotos('));
    assert.equal((html.match(/<script/g)||[]).length,1);
    const src=html.match(/<script src="([^"]+)"/)[1];
    return path.resolve(root,path.dirname(entry),src);
  });
  assert.equal(paths[0],paths[1]);
  const hash=createHash('sha256').update(fs.readFileSync(paths[0])).digest('hex').slice(0,16);
  assert.equal(path.basename(paths[0]),`frame.${hash}.js`);
});

for(const count of [8,10,12])test(`DOM integration with ${count} files: brief, storyboard, variation, append, cancel`,async()=>{
  const h=boot(count===10?'frame/index.html':'index.html');
  try{
    assert.equal(h.input.disabled,false);
    assert.equal(h.d.querySelectorAll('input[type=file][multiple]').length,1);
    assert.deepEqual(h.listeners.filter(l=>l.type==='change'),[{id:'photosInput',type:'change',capture:false}]);
    assert.equal(h.input.onchange,null,'no base HTML onchange can compete');
    h.d.querySelector('#fastAdd').click();assert.equal(h.picked(),1);
    assert.ok(!h.d.querySelector('#templateJourney').hidden === false);
    const selected=batch(count);
    h.select(selected);
    const modal=h.d.querySelector('#templateJourney');
    assert.ok(modal.hidden === false,'shown synchronously on change');

    assert.equal(h.calls(),0);
    assert.equal(h.w.__test.state().photos.length,0);
    assert.equal(h.d.querySelector('#loading').className,'loading');

    await h.complete();
    assert.equal(h.calls(),1);
    selected.forEach((file,i)=>assert.equal(h.batches[0][i],file));
    assert.equal(h.w.__test.state().frameBrief.purpose,'story');
    assert.equal(h.w.__test.state().photos.length,count);
    assert.ok(h.d.querySelectorAll('#stage .slide').length>0);
    const used=new Set([...h.d.querySelectorAll('#stage img')].map(img=>img.getAttribute('src')));
    selected.forEach(file=>assert.ok(used.has(`blob:${file.name}`),file.name));
    assert.equal(h.d.querySelector('#templateJourney'),modal,'renderAll preserves modal identity');
    assert.deepEqual(h.phases,['selecting','templates','analysis','commit','storyboard','render','complete','idle']);
    const beforeSlides=h.w.__test.state().slides;
    h.d.querySelector('#fastNewDesign').click();
    await new Promise(resolve=>h.w.requestAnimationFrame(resolve));
    assert.notEqual(h.w.__test.state().slides,beforeSlides);
    assert.equal(h.calls(),1,'variation never reanalyzes photos');
    assert.ok(!modal.hidden === false,'variation never asks again');
    await new Promise(resolve=>setTimeout(resolve,220)); // the UI releases its existing variation lock after 180 ms
    h.d.querySelector('#fastAdd').click();assert.equal(h.picked(),2);
    h.select(batch(2,count));assert.ok(modal.hidden === false);
    await h.complete('#journeySurprise');
    assert.equal(h.w.__test.state().photos.length,count+2);
    assert.equal(h.w.__test.state().frameBrief.purpose,'story');
    assert.equal(h.calls(),2);
    const beforeCancel=JSON.stringify(h.w.__test.state());
    h.d.querySelector('#fastAdd').click();
    h.input.dispatchEvent(new h.w.Event('cancel'));
    assert.equal(JSON.stringify(h.w.__test.state()),beforeCancel);
    assert.ok(!modal.hidden === false);
    assert.equal(h.calls(),2);
  }finally{h.close()}
});

test('unavailable localStorage cannot prevent the brief from being installed',()=>{
  const h=boot('index.html',true);
  try{h.select(batch(8));assert.ok(h.d.querySelector('#templateJourney').hidden === false);assert.equal(h.calls(),0)}
  finally{h.close()}
});

test('template selector and caption use analyzed photos and survive persistence',async()=>{
  const h=boot();
  try {
    h.select(batch(12));await h.complete();
    const select=h.d.querySelector('#templateFamily');
    assert.equal(select.options.length,15);
    select.value='museum_notes';select.dispatchEvent(new h.w.Event('change',{bubbles:true}));
    const s=h.w.__test.state();
    assert.deepEqual(Array.from(s.slides,sl=>sl.layers.filter(l=>l.type==='img').length),[1,2,9]);
    assert.equal(h.d.querySelectorAll('#stage [data-id]').length,12);
    const before=s.slides.map(sl=>sl.layers.map(l=>l.id).join()).join('|');
    const note=h.d.querySelector('#templateCaption');note.value='Museos, cafés y recuerdos.';
    note.dispatchEvent(new h.w.Event('change',{bubbles:true}));
    assert.equal(s.slides.map(sl=>sl.layers.filter(l=>l.type==='img').map(l=>l.id).join()).join('|'),before);
    assert.equal(s.slides.flatMap(sl=>sl.layers).filter(l=>l.frameCaption).length,1);
    // Locate the application record without relying on a preference-store key.
    const records=Object.keys(h.w.localStorage).map(k=>{try{return JSON.parse(h.w.localStorage.getItem(k))}catch{return null}});
    assert.ok(records.some(r=>r?.frameTemplateFamily==='museum_notes'&&r.frameCaption===note.value));
    h.d.querySelector('#fastNewDesign').click();await new Promise(r=>h.w.requestAnimationFrame(r));
    assert.equal(h.calls(),1);assert.equal(s.frameArtDirection,'museum_notes');
    assert.ok(!h.d.querySelector('#templateJourney').hidden === false);
    assert.equal(s.slides.flatMap(sl=>sl.layers).filter(l=>l.frameCaption).length,1);
    await new Promise(resolve=>setTimeout(resolve,220));
    h.select(batch(2,12));assert.equal(select.disabled,true);
    await h.complete();assert.equal(select.disabled,false);
    const ids=new Set(s.slides.flatMap(sl=>sl.layers).filter(l=>l.type==='img').map(l=>l.photo.id));
    assert.equal(ids.size,14);
  } finally {h.close()}
});
