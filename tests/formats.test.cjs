const {test}=require('node:test'),assert=require('node:assert/strict');
const formats=require('../frame/formats'),engine=require('../frame/template-engine'),catalog=require('../frame/template-catalog.json'),state=require('../frame/project-state');
test('each format preserves all sources and protects faces in native compositions',()=>{
 for(const format of formats.options)for(const family of catalog.families){
  const photos=Array.from({length:8},(_,i)=>({id:'p'+i,aspect:[.75,2.8,1][i%3],faceAnalysisStatus:i%2?'unavailable':'ready',faces:i%2?[]:[{x:.05,y:.1,w:.9,h:.7}]}));
  const result=engine.generate({catalog,photos,familyId:family.id,format:format.id,seed:41}),[W,H]=formats.dimensions(format.id),used=new Set();
  for(const sl of result.slides){assert.equal(sl.frameFormat,format.id);for(const l of sl.layers.filter(l=>l.type==='img')){
   used.add(l.photo.id);if(l.storySpan)continue;
   const a=(l.rot||0)*Math.PI/180,bw=Math.abs(l.w*Math.cos(a))+Math.abs(l.h*Math.sin(a)),bh=Math.abs(l.h*Math.cos(a))+Math.abs(l.w*Math.sin(a));
   assert.ok(l.x+l.w/2-bw/2>=-.01&&l.x+l.w/2+bw/2<=W+.01,family.id+' width');assert.ok(l.y+l.h/2-bh/2>=-.01&&l.y+l.h/2+bh/2<=H+.01,family.id+' height');
   assert.ok(engine.crop(l.photo,l.w,l.h).safe);if(l.photo.faceAnalysisStatus==='unavailable'){assert.ok(!l.frameCut);assert.ok(Math.abs(l.w/l.h-l.photo.aspect)<1e-8)}
  }}assert.equal(used.size,photos.length);
 }
});
test('fixed pages change size uniformly; old project and undo restore the format',()=>{
 const page={frameFormat:'4:5',layers:[{type:'img',x:30,y:50,w:200,h:250,photo:{id:'a'},zoom:2,offX:12,offY:10}]};formats.fitPage(page,'1:1');assert.equal(page.layers[0].w/page.layers[0].h,.8);assert.equal(page.layers[0].zoom,2);assert.equal(page.layers[0].offX,12);
 const project={slides:[page],frameFormat:'1:1',frameVariationScope:'page',frameInactivePhotoIds:['b']},snap=state.snapshot(project);project.frameFormat='9:16';state.apply(project,snap);assert.equal(project.frameFormat,'1:1');assert.equal(project.frameVariationScope,'page');assert.deepEqual(project.frameInactivePhotoIds,['b']);assert.equal(state.snapshot({}).frameFormat,'4:5');
});
test('torn panoramas share a continuous source and cut seed in all formats',()=>{
 for(const format of formats.options){const result=engine.generate({catalog,photos:[{id:'wide',aspect:3,faces:[],faceAnalysisStatus:'ready'},{id:'portrait',aspect:.75}],familyId:'torn_horizon',format:format.id,seed:12}),pages=result.slides.filter(sl=>sl.storySpan);
  assert.ok(pages.length>=2);const first=pages[0].layers.find(l=>l.type==='img');pages.forEach((sl,i)=>{const l=sl.layers.find(l=>l.type==='img');assert.equal(l.photo.id,first.photo.id);assert.equal(l.frameCut.seed,first.frameCut.seed);assert.equal(l.x,first.x-340*i)})
 }
});
