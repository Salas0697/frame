const {test}=require('node:test');
const assert=require('node:assert/strict');
const crop=require('../frame/crop-geometry.js'),engine=require('../frame/template-engine.js'),catalog=require('../frame/template-catalog.json');
test('crop drag direction, limits, contain, zoom anchoring and export scaling',()=>{
 const l={photo:{aspect:2},fit:'cover',zoom:1,offX:0,offY:0};
 const a=crop.geometry(l,100,100);assert.equal(a.x,-50);
 const pan=crop.pan(l,100,100,20,0);assert.equal(pan.offX,-20);assert.equal(crop.geometry({...l,...pan},100,100).x,-30);
 const fit=crop.geometry({...l,fit:'contain'},100,100);assert.deepEqual([fit.w,fit.h,fit.x,fit.y],[100,50,0,25]);
 const zoom=crop.pinch(l,100,100,2,{x:50,y:50},{x:50,y:50});assert.equal(zoom.offX,0);
 const preview=crop.geometry({...zoom,offX:25,offY:-12},100,125),png=crop.geometry({...zoom,offX:25,offY:-12},1080,1350);
 for(const key of ['x','y','w','h'])assert.ok(Math.abs(png[key]-preview[key]*10.8)<.0001);
 assert.equal(crop.pan(l,100,100,1000,0).offX,-50);
});
test('explicit cover is first, unique, and frame/background choices are deterministic',()=>{
 const photos=Array.from({length:12},(_,i)=>({id:'p'+i,aspect:.75,avg:[160,35,45],dominantColors:[{rgb:[176,28,41],hex:'#b01c29',weight:.7}],brightness:128,sharpness:400}));
 const r=engine.generate({catalog,photos,heroPhotoId:'p7',familyId:'museum_notes',backgroundMode:'black',frameTreatment:'fine',seed:1});
 assert.equal(r.slides[0].layers[0].photo.id,'p7');assert.equal(r.slides[0].frameHero,true);
 assert.equal(r.slides.flatMap(s=>s.layers).filter(l=>l.type==='img'&&l.photo.id==='p7').length,1);
 assert.ok(r.slides.every(s=>s.bg==='#101012'));assert.ok(r.slides.flatMap(s=>s.layers).every(l=>l.frameBorder===.55));
 const color=engine.generate({catalog,photos,familyId:'color_editorial',backgroundMode:'color',seed:1}).slides[0].bg;
 assert.equal(color,'#b01c29');
});
test('cover scoring favors exposure and sharpness over raw variance',()=>{
 const good={aspect:.75,brightness:128,sharpness:500,variance:200,score:100,width:1800,height:2400};
 const bad={...good,brightness:5,sharpness:1,variance:9000,score:1e8};
 assert.ok(engine.heroScore(good)>engine.heroScore(bad));
});
