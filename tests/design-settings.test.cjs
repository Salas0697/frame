const {test}=require('node:test'),assert=require('node:assert/strict');
const design=require('../frame/design-settings'),state=require('../frame/project-state'),layouts=require('../frame/template-layouts'),catalog=require('../frame/template-catalog.json'),engine=require('../frame/template-engine');
test('spacing preserves full image geometry, crop settings and bounds in every format',()=>{
 for(const format of ['4:5','1:1','9:16'])for(const family of layouts.featured){const photos=Array.from({length:8},(_,i)=>({id:'p'+i,aspect:i%2?.75:1.5,faceAnalysisStatus:'unavailable'}));const slides=engine.generate({catalog,photos,familyId:family,format,seed:42}).slides;
  for(const sl of slides){const before=sl.layers.filter(l=>l.type==='img').map(l=>({...l}));design.apply(sl,{spacing:'airy',border:'bold'});const H=format==='1:1'?340:format==='9:16'?340*16/9:425;
   sl.layers.filter(l=>l.type==='img').forEach((l,i)=>{assert.ok(Math.abs(l.w/l.h-before[i].w/before[i].h)<1e-8);assert.deepEqual([l.zoom,l.offX,l.offY],[before[i].zoom,before[i].offX,before[i].offY]);assert.equal(l.frameBorder,2)});
   design.apply(sl,{spacing:'compact',border:'none'});sl.layers.filter(l=>l.type==='img').forEach(l=>{assert.ok(l.x>=-.01&&l.y>=-.01&&l.x+l.w<=340.01&&l.y+l.h<=H+.01);assert.equal(l.frameBorder,0)});
  }
 }
});
test('panorama adjustments preserve the entire seam geometry and saved defaults are undoable',()=>{
 const page={storySpan:{span:2},layers:[{type:'img',x:-340,y:0,w:680,h:425}]},before=JSON.stringify(page);assert.equal(design.apply(page,{spacing:'airy',border:'bold'}),false);assert.equal(JSON.stringify(page),before);
 const project={slides:[],frameDesign:{spacing:'airy',border:'fine'}},snap=state.snapshot(project);project.frameDesign.spacing='compact';state.apply(project,snap);assert.deepEqual(project.frameDesign,{spacing:'airy',border:'fine'});
});
test('featured tall diptychs stack while square diptychs share a horizontal grid',()=>{
 const f=catalog.families.find(f=>f.id==='editorial_pair'),tall=layouts.family(f,'9:16').variants.find(v=>v.id.includes('diptych')),square=layouts.family(f,'1:1').variants.find(v=>v.id.includes('diptych'));
 assert.equal(tall.slots[0].x,tall.slots[1].x);assert.notEqual(tall.slots[0].y,tall.slots[1].y);assert.equal(square.slots[0].y,square.slots[1].y);assert.notEqual(square.slots[0].x,square.slots[1].x);
});
