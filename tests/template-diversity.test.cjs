const {test}=require('node:test'),assert=require('node:assert/strict');
const engine=require('../frame/template-engine'),catalog=require('../frame/template-catalog.json'),colors=require('../frame/photo-colors');
const source=(count,aspect=.75)=>Array.from({length:count},(_,i)=>({id:'p'+i,aspect,faceAnalysisStatus:'unavailable'}));
function uniquePages(result){
 const shapes=result.slides.filter(s=>!s.storySpan).map(engine.geometry);
 shapes.forEach((shape,i)=>assert.ok(shapes.slice(0,i).every(other=>engine.distance(shape,other)>.005),result.familyId+' page '+(i+1)+' repeats fitted geometry'));
}
test('fitted photos remain visibly different within every collection, even when detection is unavailable',()=>{
 for(const family of catalog.families)for(const aspect of [.75,2.1])for(const seed of [1,42,97]){
  const photos=source(24,aspect),result=engine.generate({catalog,photos,familyId:family.id,brief:{purpose:'story'},seed});uniquePages(result);
  assert.deepEqual(result.slides.flatMap(s=>s.layers.filter(l=>l.type==='img').map(l=>l.photo.id)).sort(),photos.map(p=>p.id).sort());
  result.slides.flatMap(s=>s.layers).filter(l=>l.type==='img').forEach(l=>assert.ok(Math.abs(l.w/l.h-aspect)<1e-9,'uniform scaling preserves entire source'));
 }
});
test('collection covers have different visible identities and cut covers no longer share image envelopes',()=>{
 const covers=catalog.families.map(f=>engine.generate({catalog,photos:source(12),familyId:f.id,brief:{purpose:'story'},seed:42}).slides[0]);
 assert.equal(new Set(covers.map(s=>engine.visualSignature([s]))).size,catalog.families.length);
 const cut=covers.filter(s=>catalog.families.find(f=>f.id===s.frameFamily).cutStyle);
 assert.equal(new Set(cut.map(s=>JSON.stringify(engine.geometry(s)))).size,cut.length);
});
test('fixed collection explores new visual compositions across successive options without changing the chosen cover source',()=>{
 for(const family of catalog.families){
  const photos=source(12),seen=new Set();let previous;
  for(let seed=1;seed<=8;seed++){
   const result=engine.generate({catalog,photos,familyId:family.id,heroPhotoId:'p0',brief:{purpose:'story'},previous,seed});
   assert.equal(result.slides[0].layers.find(l=>l.type==='img').photo.id,'p0');
   assert.ok(!seen.has(result.visualSignature),family.id+' repeated album');seen.add(result.visualSignature);uniquePages(result);
   previous={...result,dir:result.familyId,layouts:result.slides.map(s=>s.frameLayout)};
  }
 }
});
test('visual comparison ignores source IDs and recognizes changes in geometry and graphic recipe',()=>{
 const a=engine.generate({catalog,photos:source(3),familyId:'blueprint',seed:42}).slides;
 const clone=JSON.parse(JSON.stringify(a));clone.forEach(s=>s.layers.forEach(l=>{l.id+='different';if(l.photo)l.photo.id+='different'}));
 assert.equal(engine.visualSignature(a),engine.visualSignature(clone));clone[0].layers.find(l=>l.type==='img').x+=18;
 assert.notEqual(engine.visualSignature(a),engine.visualSignature(clone));
});
test('collection backgrounds restore the family identity and explicit measured/custom choices still win',()=>{
 const project={photos:source(2),slides:catalog.families.map(f=>({frameFamily:f.id,bg:'#000000',layers:[]}))};
 colors.apply(project,{scope:'all',mode:'collection'});
 project.slides.forEach(sl=>assert.equal(sl.bg,colors.resolve('collection',project.photos,null,catalog.families.find(f=>f.id===sl.frameFamily))));
 colors.apply(project,{scope:'all',mode:'custom',color:'#ab1256'});assert.ok(project.slides.every(s=>s.bg==='#ab1256'));
});
test('large fitted group photos stay inside the canvas when repeated geometry forces variation',()=>{
 for(const seed of [1,14,42]){
  const photos=source(36,.8).map(p=>({...p,faceCount:4}));
  const result=engine.generate({catalog,photos,familyId:'full_bleed',seed});
  const images=result.slides.flatMap(s=>s.layers.filter(l=>l.type==='img'));
  assert.equal(images.length,photos.length);
  images.forEach(l=>{assert.ok(l.x>=0&&l.y>=0&&l.x+l.w<=340&&l.y+l.h<=425,'fitted source escaped the frame');assert.ok(Math.abs(l.w/l.h-.8)<1e-9)});
 }
});
