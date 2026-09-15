const {test}=require('node:test');
const assert=require('node:assert/strict');
const engine=require('../frame/template-engine.js');
const catalog=require('../frame/template-catalog.json');
const photos=n=>Array.from({length:n},(_,i)=>({id:`p${i}`,aspect:[.75,1.5,1,.8,2.8][i%5],score:400+i*170,avg:[100,90+i*3,130],faces:[]}));
function verify(result, source) {
  const used=[];
  for(const sl of result.slides){
    assert.ok(sl.layers.some(l=>l.type==='img'));
    for(const l of sl.layers.filter(l=>l.type==='img')){
      assert.equal(l.photo,source.find(p=>p.id===l.photo.id),'keep source photo object');
      if(!l.storySpan || l.storySeg===0)used.push(l.photo.id);
      assert.ok(Number.isFinite(l.offX)&&Number.isFinite(l.offY));
      if(!l.storySpan){
        const a=Math.abs(l.rot)*Math.PI/180;
        const bw=Math.abs(l.w*Math.cos(a))+Math.abs(l.h*Math.sin(a));
        const bh=Math.abs(l.w*Math.sin(a))+Math.abs(l.h*Math.cos(a));
        assert.ok(l.x+l.w/2-bw/2>=-.01 && l.x+l.w/2+bw/2<=340.01);
        assert.ok(l.y+l.h/2-bh/2>=-.01 && l.y+l.h/2+bh/2<=425.01);
      }
    }
  }
  assert.deepEqual(used.sort(),source.map(p=>p.id).sort(),'complete coverage, no accidental duplicate');
}
test('every family preserves all photos for small, mixed, and larger batches',()=>{
  for(const f of catalog.families)for(const count of [1,2,3,4,6,8,9,12,24])for(const seed of [1,42,97]){
    const source=photos(count),before=JSON.stringify(source);
    verify(engine.generate({catalog,photos:source,familyId:f.id,seed}),source);
    assert.equal(JSON.stringify(source),before,'no metadata mutation');
  }
});
test('Museum Notes creates 1 + 2 + 9 and varies without reusing photos',()=>{
  const source=photos(12).map(p=>({...p,aspect:.75}));
  const first=engine.generate({catalog,photos:source,familyId:'museum_notes',seed:1});
  assert.deepEqual(first.slides.map(s=>s.layers.length),[1,2,9]);
  const grid=first.slides[2];assert.equal(grid.frameLayout,'museum_9');assert.equal(grid.bg,'#ffffff');
  assert.equal(new Set(grid.layers.map(l=>l.x)).size,3);assert.equal(new Set(grid.layers.map(l=>l.y)).size,3);
  const second=engine.generate({catalog,photos:source,familyId:'museum_notes',previous:{signature:first.signature},seed:2});
  assert.notEqual(first.signature,second.signature);verify(second,source);
});
test('large groups and off-center faces cannot be sacrificed to a dense grid',()=>{
  const source=photos(12).map(p=>({...p,aspect:2.1,score:1e8,faceCount:4,faces:[{x:.02,y:.15,w:.95,h:.6}]}));
  const result=engine.generate({catalog,photos:source,familyId:'museum_notes',seed:1});
  verify(result,source);
  for(const sl of result.slides)for(const l of sl.layers){
    assert.equal(sl.layers.length,1);assert.ok(engine.crop(l.photo,l.w,l.h).safe);
  }
  const p={aspect:2,faces:[{x:.81,y:.3,w:.12,h:.2}]};
  const c=engine.crop(p,100,150);
  assert.ok(c.safe);assert.ok(c.offX>30);assert.ok(c.visible.x+c.visible.w>=.93);
});
test('continuous rejects a face across a seam and permits safe panoramas',()=>{
  assert.equal(engine.canSpread({aspect:1.6,faces:[{x:.46,y:.3,w:.1,h:.2}]},2),false);
  assert.equal(engine.canSpread({aspect:2.4,faces:[{x:.1,y:.3,w:.06,h:.2}]},3),true);
  const source=[{id:'panorama',aspect:2.4,avg:[90,100,120],faces:[]}];
  const result=engine.generate({catalog,photos:source,familyId:'continuous',seed:6});
  verify(result,source);assert.ok(result.slides.length>=2);
  result.slides.forEach((sl,i)=>assert.equal(sl.layers[0].x,-340*i));
});
test('all catalog variants are reachable with suitable photos',()=>{
  const seen=new Set();
  for(const f of catalog.families)for(const count of [4,6,8,9,12])engine.generate({catalog,photos:photos(count),familyId:f.id,seed:1,brief:{density:'rich'}}).slides.forEach(sl=>seen.add(sl.frameLayout));
  for(const f of catalog.families)for(let seed=1;seed<=35;seed++){
    const source=photos(12).map(p=>({...p,aspect:seed%2?.75:2.4}));
    engine.generate({catalog,photos:source,familyId:f.id,seed,brief:{density:seed%3?'balanced':'rich'}}).slides.forEach(sl=>seen.add(sl.frameLayout));
  }
  for(const f of catalog.families)for(const v of f.variants)assert.ok(seen.has(v.id),v.id);
});
test('caption stays in the footer and is omitted without user text',()=>{
  const source=photos(9);
  const first=engine.generate({catalog,photos:source,familyId:'museum_notes',seed:10});
  assert.ok(first.slides.every(sl=>sl.layers.every(l=>l.type==='img')));
  const result=engine.generate({catalog,photos:source,familyId:'museum_notes',caption:'New York. Museos, café y un fin de semana para recordar.',seed:10});
  const notes=result.slides.flatMap(sl=>sl.layers).filter(l=>l.type==='text');
  assert.equal(notes.length,1);assert.equal(notes[0].font,'mono');
  assert.ok(notes[0].y>=425*.9);assert.ok(notes[0].y+notes[0].text.split('\n').length*6.5<=425*.97);
  assert.ok(engine.captionLines('X'.repeat(120)).split('\n').every(l=>l.length<=40));
});

test('automatic exploration avoids the last three collections and changes geometry, not just photo order',()=>{
 const source=photos(12),families=[],shapes=new Set();let previous;
 for(let seed=1;seed<=24;seed++){
  const result=engine.generate({catalog,photos:source,brief:{purpose:'story',vibe:'clean'},previous,seed});
  assert.ok(!families.slice(-3).includes(result.familyId),'recent collection repeated');verify(result,source);
  shapes.add(JSON.stringify(result.slides.map(sl=>sl.layers.filter(l=>l.type==='img').map(l=>[Math.round(l.x),Math.round(l.y),Math.round(l.w),Math.round(l.h)]))));
  families.push(result.familyId);previous={dir:result.familyId,signature:result.signature,layouts:result.slides.map(sl=>sl.frameLayout),recentFamilies:result.recentFamilies};
 }
 assert.ok(new Set(families).size>=8);assert.ok(shapes.size>=16);
});
test('every collection has two reachable cover geometries while retaining the chosen photo and safe group crop',()=>{
 const source=[{id:'chosen',aspect:2.2,faces:[{x:.03,y:.2,w:.92,h:.5}],faceCount:4}];
 for(const family of catalog.families){
  const a=engine.generate({catalog,photos:source,familyId:family.id,heroPhotoId:'chosen',seed:1});
  const b=engine.generate({catalog,photos:source,familyId:family.id,heroPhotoId:'chosen',seed:2,previous:{dir:family.id,layouts:a.slides.map(sl=>sl.frameLayout),signature:a.signature}});
  verify(a,source);verify(b,source);assert.notEqual(a.slides[0].frameLayout,b.slides[0].frameLayout,family.id);
  assert.notDeepEqual(a.slides[0].layers.map(l=>[l.x,l.y,l.w,l.h]),b.slides[0].layers.map(l=>[l.x,l.y,l.w,l.h]));
  for(const r of [a,b])assert.ok(engine.crop(source[0],r.slides[0].layers[0].w,r.slides[0].layers[0].h).safe);
 }
});
test('photographic paper and dark mounts preserve the crop and reserve a larger lower border',()=>{
 const source=photos(8);
 for(const treatment of ['print','darkroom'])for(const f of catalog.families.filter(f=>f.id!=='continuous')){
  const plain=engine.generate({catalog,photos:source,familyId:f.id,seed:16});
  const framed=engine.generate({catalog,photos:source,familyId:f.id,seed:16,frameTreatment:treatment});verify(framed,source);
  for(let i=0;i<framed.slides.length;i++){
   const images=framed.slides[i].layers.filter(l=>l.type==='img'),papers=framed.slides[i].layers.filter(l=>l.framePaper);
   assert.equal(images.length,papers.length);
   images.forEach((l,j)=>{const old=plain.slides[i].layers.filter(l=>l.type==='img')[j],paper=papers[j];assert.equal(l.offX,old.offX);assert.equal(l.offY,old.offY);assert.ok(Math.abs(l.w/l.h-old.w/old.h)<1e-9);assert.ok(paper.y+paper.h-l.y-l.h>l.y-paper.y);assert.equal(paper.color,treatment==='print'?'#ffffff':'#080809')});
  }
 }
});
