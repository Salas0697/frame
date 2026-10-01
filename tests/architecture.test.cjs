const {test}=require('node:test'),assert=require('node:assert/strict');
const state=require('../frame/project-state.js'),faces=require('../frame/face-geometry.js');
const finish=require('../frame/finish.js'),delivery=require('../frame/export-delivery.js');
const engine=require('../frame/template-engine.js'),catalog=require('../frame/template-catalog.json');

test('history restores the brief, chosen family, cover, location and finish as one transaction',()=>{
 const project={slides:[{layers:[]}],currentSlide:9,frameBrief:{familyId:'collector',location:'yes'},frameTemplateFamily:'collector',heroPhotoId:'p1',finish:'film',frameLocation:{text:'Bogotá'},photos:[{id:'p1'}],selected:'l1'};
 const saved=state.snapshot(project);project.frameBrief.familyId='full_bleed';project.finish='mono';project.heroPhotoId='p2';
 state.apply(project,saved);
 assert.equal(project.frameBrief.familyId,'collector');assert.equal(project.frameTemplateFamily,'collector');assert.equal(project.heroPhotoId,'p1');assert.equal(project.finish,'film');assert.equal(project.frameLocation.text,'Bogotá');assert.equal(project.currentSlide,0);assert.equal(project.selected,null);assert.equal(project.photos[0].id,'p1');
 project.frameBrief.familyId='changed';assert.equal(saved.frameBrief.familyId,'collector');
});

test('MediaPipe JavaScript center boxes become bounded crop geometry; legacy boxes still work',()=>{
 const result=faces.box({boundingBox:{xCenter:.8,yCenter:.4,width:.4,height:.2},score:[.93]});
 assert.ok(Math.abs(result.x-.6)<1e-10);assert.ok(Math.abs(result.y-.3)<1e-10);assert.equal(result.score,.93);
 const clipped=faces.box({boundingBox:{xCenter:0,yCenter:0,width:.2,height:.2}});assert.equal(clipped.x,0);assert.equal(clipped.w,.1);
 assert.deepEqual(faces.box({locationData:{relativeBoundingBox:{xMin:.1,yMin:.2,width:.3,height:.4}}}),{x:.1,y:.2,w:.30000000000000004,h:.4000000000000001,score:0});
 for(const d of [null,{boundingBox:{width:1,height:1}},{boundingBox:{xCenter:2,yCenter:2,width:.1,height:.1}},{boundingBox:{xCenter:.5,yCenter:.5,width:-1,height:1}}])assert.equal(faces.box(d),null);
});

test('unavailable detection preserves complete source geometry throughout the collection library',()=>{
 const photos=Array.from({length:12},(_,i)=>({id:'p'+i,aspect:[.75,1.5,3][i%3],avg:[100,120,90],faceAnalysisStatus:'unavailable'}));
 for(const family of catalog.families){
  const slides=engine.generate({catalog,photos,familyId:family.id,seed:42}).slides;
  const layers=slides.flatMap(s=>s.layers.filter(l=>l.type==='img'));
  assert.equal(layers.length,12,family.id);
  for(const l of layers){assert.ok(Math.abs(l.w/l.h-l.photo.aspect)<1e-8,family.id);assert.ok(!l.storySpan);assert.ok(!l.frameCut,'unknown faces cannot be masked')}
 }
});

test('finish processing retains alpha and uses the same recipe on the full composition',()=>{
 const clean={data:new Uint8ClampedArray([220,40,50,255,20,150,200,160])};assert.equal(finish.apply(clean,'clean'),clean);
 const mono=finish.apply({data:clean.data.slice()},'mono');assert.equal(mono.data[0],mono.data[1]);assert.equal(mono.data[1],mono.data[2]);assert.equal(mono.data[3],255);assert.equal(mono.data[7],160);assert.equal(finish.filter('mono'),'grayscale(1) contrast(1.05)');assert.equal(finish.filter('unknown'),'none');
});

test('share denial retains rendered files for an explicit retry download; cancellation is respected',async()=>{
 const files=[new File(['png'],'FRAME_01.png')],events=[];
 const ports={all:false,share:async()=>{throw new DOMException('denied','NotAllowedError')},recover:(f,a)=>events.push(['recover',f===files,a]),download:async()=>events.push(['download'])};
 assert.equal(await delivery.deliver(files,ports),'recovery');assert.deepEqual(events,[['recover',true,false]]);
 events.length=0;ports.share=async()=>{throw new DOMException('cancelled','AbortError')};assert.equal(await delivery.deliver(files,ports),'cancelled');assert.deepEqual(events,[]);
 ports.share=async()=>false;assert.equal(await delivery.deliver(files,ports),'downloaded');assert.deepEqual(events,[['download']]);
 events.length=0;ports.share=async()=>true;assert.equal(await delivery.deliver(files,ports),'shared');assert.deepEqual(events,[]);
});
