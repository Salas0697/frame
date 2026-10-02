const {test}=require('node:test'),assert=require('node:assert/strict');
const catalog=require('../frame/template-catalog.json'),layouts=require('../frame/template-layouts'),engine=require('../frame/template-engine'),formats=require('../frame/formats');
test('editorial series adapts its layout to every format and uses native exportable paper graphics',()=>{
 assert.equal(layouts.editorial.length,6);
 const photos=Array.from({length:12},(_,i)=>({id:'p'+i,aspect:[.75,1.6,1][i%3],faceAnalysisStatus:'unavailable'}));
 for(const id of layouts.editorial){
  const source=catalog.families.find(f=>f.id===id);assert.equal(source.collection,'editorial_collage');assert.ok(source.referencePins.length);
  assert.notDeepEqual(layouts.family(source,'4:5').variants,layouts.family(source,'9:16').variants);
  for(const format of formats.options){
   const result=engine.generate({catalog,photos,familyId:id,format:format.id,seed:42});
   assert.deepEqual(result.slides.flatMap(sl=>sl.layers.filter(l=>l.type==='img').map(l=>l.photo.id)).sort(),photos.map(p=>p.id).sort());
   for(const sl of result.slides){
    assert.equal(sl.bg,source.background);assert.ok(sl.layers.some(l=>l.frameGraphic));
    sl.layers.filter(l=>l.frameGraphic).forEach(l=>{assert.equal(l.type,'deco');assert.ok(['frame','circle'].includes(l.kind));assert.ok(l.w>0&&l.h>0)});
    sl.layers.filter(l=>l.type==='img').forEach(l=>assert.ok(Math.abs(l.w/l.h-l.photo.aspect)<1e-8));
   }
  }
 }
});
