const {test} = require('node:test');
const assert = require('node:assert/strict');
const Controller = require('../frame/photo-import-controller.js');

const deferred = () => { let resolve; const promise = new Promise(r => {resolve=r}); return {promise,resolve}; };
const files = (n, offset=0) => Array.from({length:n}, (_,i) => new File([`photo-${i+offset}`], `photo-${i+offset}.jpg`, {type:'image/jpeg'}));
function setup(overrides={}) {
  const events=[], answer=deferred(), state={photos:[],brief:null,slides:[]};
  const input=new EventTarget(); input.files=[]; input.value=''; input.disabled=true;
  input.click=()=>events.push('picker');
  const ports={
    input,
    setBusy:busy=>{input.disabled=busy},
    requestBrief:selected=>{events.push(['brief',selected]);return answer.promise},
    showProgress:()=>{}, hideProgress:()=>{}, yieldToPaint:async()=>{},
    analyzePhotos:async selected=>{events.push(['analysis',selected]);return selected.map((f,i)=>({id:f.name,url:`blob:${i}`}))},
    checkpoint:()=>({...state}),
    commitPhotos:(photos,brief)=>{events.push('commit');state.photos=[...state.photos,...photos];state.brief=brief},
    generateStoryboard:()=>{events.push('storyboard');state.slides=state.photos.map(p=>p.id)},
    render:()=>events.push('render'),
    persistPhotos:async(selected,photos)=>events.push(['persist',selected,photos]),
    rollback:checkpoint=>{events.push('rollback');Object.assign(state,checkpoint)},
    releasePhotos:photos=>events.push(['release',photos]),
    onSuccess:()=>events.push('success'), onError:error=>events.push(['error',error]),
    ...overrides
  };
  const controller=new Controller(ports);
  return {controller,ports,input,events,state,answer};
}

for (const count of [8,10,12]) test(`${count} original Files stay pending; analysis/commit wait for the brief`, async()=>{
  const h=setup(), selected=files(count);
  h.controller.selectPhotos();
  assert.deepEqual(h.events,['picker']);
  const run=h.controller.filesSelected(selected);
  assert.equal(h.controller.phase,'brief');
  assert.equal(h.input.disabled,true);
  assert.equal(h.events.length,2);
  assert.equal(h.state.photos.length,0);
  selected.forEach((file,i)=>assert.equal(h.controller.pendingFiles[i],file));
  await Promise.resolve();
  assert.equal(h.events.length,2,'no analysis, save or storyboard before answering');
  h.answer.resolve({purpose:'story',vibe:'natural',density:'balanced'});
  assert.equal(await run,true);
  assert.deepEqual(h.events.map(e=>Array.isArray(e)?e[0]:e),['picker','brief','analysis','commit','storyboard','render','persist','success']);
  const analyzed=h.events.find(e=>e[0]==='analysis')[1];
  const stored=h.events.find(e=>e[0]==='persist');
  selected.forEach((file,i)=>{assert.equal(analyzed[i],file);assert.equal(stored[1][i],file);assert.equal(stored[2][i].id,file.name)});
  assert.equal(h.state.photos.length,count);
  assert.equal(h.controller.pendingFiles.length,0);
  assert.equal(h.controller.active,false);
  assert.equal(h.input.disabled,false);
});

test('change listener copies Files before resetting the native input', async()=>{
  const h=setup(), selected=files(10), finished=deferred();
  h.ports.onSuccess=()=>finished.resolve();
  h.input.files=selected;
  Object.defineProperty(h.input,'value',{set:()=>{h.input.files=[]}});
  h.input.dispatchEvent(new Event('change'));
  assert.equal(h.input.files.length,0);
  assert.equal(h.controller.pendingFiles.length,10);
  selected.forEach((file,i)=>assert.equal(h.controller.pendingFiles[i],file));
  h.answer.resolve({purpose:'impact'});
  await finished.promise;
  assert.equal(h.state.photos.length,10);
});

test('additional import retains the previous batch and asks only once per batch',async()=>{
  const h=setup();h.answer.resolve({purpose:'memory'});
  await h.controller.filesSelected(files(10));
  const first=[...h.state.photos];
  await h.controller.filesSelected(files(2,10));
  assert.deepEqual(h.state.photos.slice(0,10),first);
  assert.equal(h.state.photos.length,12);
  assert.equal(h.events.filter(e=>e[0]==='brief').length,2);
});

test('cancelling the picker or an empty change leaves the project untouched',async()=>{
  const h=setup();h.state.photos=[{id:'existing'}];h.state.slides=['existing'];
  const before=structuredClone(h.state);
  h.controller.selectPhotos();h.input.dispatchEvent(new Event('cancel'));
  assert.equal(h.controller.phase,'idle');
  assert.equal(await h.controller.filesSelected([]),false);
  assert.deepEqual(h.state,before);
  assert.deepEqual(h.events,['picker']);
  h.controller.selectPhotos();assert.deepEqual(h.events,['picker','picker']);
});

test('a second change cannot race a pending brief or open another picker',async()=>{
  const h=setup(), original=files(10);
  const run=h.controller.filesSelected(original);
  h.controller.selectPhotos();
  assert.equal(await h.controller.filesSelected(files(2,10)),false);
  assert.deepEqual(h.controller.pendingFiles,original);
  assert.equal(h.events.length,1);
  h.answer.resolve({purpose:'surprise'});assert.equal(await run,true);
  assert.equal(h.state.photos.length,10);
});

test('analysis failure preserves the previous project and permits retry',async()=>{
  const h=setup({analyzePhotos:async()=>{throw Error('decode')}});
  h.state.photos=[{id:'existing'}];h.state.slides=['existing'];
  const before=structuredClone(h.state);
  h.answer.resolve({purpose:'story'});
  assert.equal(await h.controller.filesSelected(files(8)),false);
  assert.deepEqual(h.state,before);
  assert.equal(h.controller.active,false);
  assert.equal(h.input.disabled,false);
  assert.equal(h.controller.pendingFiles.length,0);
  assert.ok(!h.events.includes('storyboard'));
  h.ports.analyzePhotos=async fs=>fs.map(f=>({id:f.name}));
  assert.equal(await h.controller.filesSelected(files(8)),true);
});

test('generation failure rolls back the model and releases only new object URLs',async()=>{
  const h=setup({generateStoryboard:()=>{throw Error('generation')}});
  h.state.photos=[{id:'existing'}];h.state.slides=['existing'];
  const before=structuredClone(h.state);
  h.answer.resolve({purpose:'story'});
  assert.equal(await h.controller.filesSelected(files(8)),false);
  assert.deepEqual(h.state,before);
  assert.ok(h.events.includes('rollback'));
  assert.equal(h.events.find(e=>e[0]==='release')[1].length,8);
  assert.ok(!h.events.includes('render'));
});
