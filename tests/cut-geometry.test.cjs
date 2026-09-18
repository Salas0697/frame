const {test}=require('node:test'),assert=require('node:assert/strict');
const cuts=require('../frame/cut-geometry.js'),engine=require('../frame/template-engine.js'),catalog=require('../frame/template-catalog.json');
test('cut paths are deterministic, bounded and shared by CSS and canvas',()=>{
 for(const kind of ['torn','horizon','diagonal','notch'])for(const seed of [1,82,700]){
  const cut={kind,seed},points=cuts.points(cut),canvas=[];assert.deepEqual(points,cuts.points(cut));assert.ok(points.every(p=>p.every(v=>v>=0&&v<=1)));
  cuts.path({beginPath(){},moveTo(x,y){canvas.push([x,y])},lineTo(x,y){canvas.push([x,y])},closePath(){}},cut,0,0,100,100);
  assert.deepEqual(canvas,points.map(p=>p.map(v=>v*100)));assert.ok(cuts.css(cut).startsWith('polygon('));
 }
 assert.notDeepEqual(cuts.points({kind:'torn',seed:1}),cuts.points({kind:'torn',seed:2}));
});
test('cut collections preserve face-edge photos and persist cut geometry without changing originals',()=>{
 const photos=[{id:'group',aspect:.8,faces:[{x:0,y:0,w:1,h:1}],faceCount:4}];
 for(const f of catalog.families.filter(f=>f.cutStyle)){
  const r=engine.generate({catalog,photos,familyId:f.id,seed:1});
  assert.ok(r.slides[0].layers.some(l=>l.cutPaper&&l.frameCut));
  const photo=r.slides[0].layers.find(l=>l.type==='img');assert.equal(photo.frameCut,undefined);assert.equal(photo.photo,photos[0]);
  assert.deepEqual(JSON.parse(JSON.stringify(r.slides)).map(s=>s.layers.map(l=>l.frameCut||null)),r.slides.map(s=>s.layers.map(l=>l.frameCut||null)));
 }
});
