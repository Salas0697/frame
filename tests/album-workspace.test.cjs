const {test}=require('node:test'),assert=require('node:assert/strict');
const portable=require('../frame/project-file.js'),narrative=require('../frame/narrative.js');
const project=()=>({photos:[{id:'p1',name:'original.jpg',url:'blob:old',aspect:.75,brightness:80}],slides:[{id:'page',bg:'#ffffff',layers:[{id:'image',type:'img',x:30,y:40,w:120,h:160,z:1,photo:{id:'p1',url:'blob:old'}}]}],frameNarrative:'calm',finish:'film',heroPhotoId:'p1',frameBrief:{purpose:'story'}});
test('portable project round trips original bytes, brief, narrative and finish without serializing object URLs',async()=>{
 const source=project(),before=structuredClone(source),bytes=new Uint8Array([255,216,42,255,217]);
 const file=portable.create(source,[new File([bytes],'original.jpg',{type:'image/jpeg'})]);
 const restored=await portable.read(file);assert.deepEqual(new Uint8Array(await restored.files[0].arrayBuffer()),bytes);assert.equal(restored.files[0].name,'original.jpg');assert.equal(restored.files[0].type,'image/jpeg');assert.equal(restored.project.finish,'film');assert.equal(restored.project.frameNarrative,'calm');assert.equal(restored.project.frameBrief.purpose,'story');assert.equal(restored.project.photos[0].url,undefined);assert.deepEqual(restored.project.slides[0].layers[0].photo,{id:'p1'});assert.deepEqual(source,before);
});
test('project restore rejects foreign, truncated and oversized files, duplicate ids and missing references',async()=>{
 const file=portable.create(project(),[new File(['photo'],'original.jpg')]);
 for(const invalid of [new File(['not FRAME'],'bad.frame'),file.slice(0,file.size-1)])await assert.rejects(portable.read(invalid));
 const duplicate=project();duplicate.photos.push({...duplicate.photos[0]});assert.throws(()=>portable.create(duplicate,[]),/photos/);
 const missing=project();missing.slides[0].layers[0].photo.id='other';assert.throws(()=>portable.create(missing,[]),/reference/);
 await assert.rejects(portable.read({size:251*1024*1024}),/Invalid/);
});
test('narrative directions change global sequence while conserving sources, cover, pinned pages and panorama seams',()=>{
 const pages=Array.from({length:8},(_,i)=>({id:'page'+i,layers:[{type:'img',photo:{id:'p'+i,brightness:30+i*28}}]}));
 pages[2].frameLocked=true;pages[4].storySpan={photoId:'wide',seg:0};pages[5].storySpan={photoId:'wide',seg:1};
 const before=structuredClone(pages),calm=narrative.sequence(pages,'calm'),contrast=narrative.sequence(pages,'contrast');
 assert.notDeepEqual(calm.map(p=>p.id),contrast.map(p=>p.id));
 for(const result of [calm,contrast,narrative.sequence(pages,'rhythm')]){
  assert.deepEqual(result.map(p=>p.id).sort(),pages.map(p=>p.id).sort());for(const i of [0,2,4,5])assert.equal(result[i].id,pages[i].id);assert.equal(result[0].frameNarrativeRole,'Apertura');assert.equal(result.at(-1).frameNarrativeRole,'Cierre');
 }
 assert.deepEqual(pages,before);
});
