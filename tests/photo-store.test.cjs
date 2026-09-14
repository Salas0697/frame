const {test} = require('node:test');
const assert = require('node:assert/strict');
const {IDBFactory} = require('fake-indexeddb');
const store = require('../frame/photo-store.js');

test('IndexedDB append preserves originals, associates exact ids, and restores before rendering',async()=>{
  global.indexedDB=new IDBFactory();
  const first=new File(['first-photo'],'first.jpg',{type:'image/jpeg'});
  const second=new File(['second-photo'],'second.jpg',{type:'image/jpeg'});
  await store.put([first],[{id:'id-first'}]);
  await store.put([second],[{id:'id-second'}]);
  const project={photos:[{id:'id-second',score:2},{id:'id-first',score:1}],slides:[{layers:[
    {type:'img',photo:{id:'id-first'}},{type:'img',photo:{id:'id-second'}}
  ]}]};
  await store.restore(project);
  assert.equal(project.photos[0].name,'second.jpg');
  assert.equal(project.photos[1].name,'first.jpg');
  assert.equal(await (await fetch(project.photos[0].url)).text(),'second-photo');
  assert.equal(await (await fetch(project.photos[1].url)).text(),'first-photo');
  assert.equal(project.slides[0].layers[0].photo,project.photos[1]);
  assert.equal(project.slides[0].layers[1].photo,project.photos[0]);
  project.photos.forEach(p=>URL.revokeObjectURL(p.url));
});

test('missing stored originals fail without partially mutating the project',async()=>{
  global.indexedDB=new IDBFactory();
  const project={photos:[{id:'missing',url:'old'}],slides:[]};
  const before=structuredClone(project);
  await assert.rejects(store.restore(project),/missing/);
  assert.deepEqual(project,before);
});
