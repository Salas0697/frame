const {test}=require('node:test'),assert=require('node:assert/strict');
const loc=require('../frame/photo-location.js'),exifr=require('exifr'),fixtures=require('./support/gps-fixture.cjs'),engine=require('../frame/template-engine.js'),catalog=require('../frame/template-catalog.json');
test('real EXIF parser reads JPEG byte orders and HEIC GPS, with missing/corrupt fallback',async()=>{
 for(const data of [fixtures.jpeg(Buffer.from([255,216,255,217]),4.142,-73.626,false),fixtures.jpeg(Buffer.from([255,216,255,217]),-33.86,151.2,true),fixtures.heic(40.78,-73.97)]){
  const p=await loc.read(data,exifr);assert.ok(p);assert.ok(Math.abs(p.latitude)>1);assert.ok(Math.abs(p.longitude)>1);
 }
 const p=await loc.read(fixtures.heic(40.78,-73.97),exifr);assert.ok(Math.abs(p.latitude-40.78)<.000001);assert.ok(Math.abs(p.longitude+73.97)<.000001);
 assert.equal(await loc.read(Buffer.from('broken'),exifr),null);
 assert.equal(await loc.read(Buffer.from([255,216,255,217]),exifr),null);
});
test('nearby lookup handles hemispheres, remote places, invalid coordinates and multiple locations',()=>{
 const cities=[['Villavicencio','CO',4.142,-73.626],['Sydney','AU',-33.86,151.2]];
 assert.equal(loc.nearest({latitude:4.142,longitude:-73.626},cities).name,'Villavicencio');
 assert.equal(loc.nearest({latitude:-33.86,longitude:151.2},cities).name,'Sydney');
 for(const p of [null,{latitude:0,longitude:0},{latitude:999,longitude:0},{latitude:null,longitude:0}])assert.equal(loc.nearest(p,cities),null);
 const photos=cities.map(c=>({location:loc.nearest({latitude:c[2],longitude:c[3]},cities)}));assert.equal(loc.summarize(photos).places,2);assert.match(loc.summarize(photos).text,/Villavicencio · Sydney/);
 assert.equal(loc.settings({location:'no'},photos).enabled,false);assert.equal(loc.settings({location:'yes',locationText:'Mi lugar'},photos).text,'Mi lugar');
});
test('missing GPS never loads the catalog and catalog failure does not fail import',async()=>{
 let calls=0;await loc.enrich([Buffer.from('bad')],[{}],()=>{},exifr,async()=>{calls++;throw Error('offline')});assert.equal(calls,0);
 const p={};await loc.enrich([fixtures.heic(4.142,-73.626)],[p],()=>{},exifr,async()=>{calls++;throw Error('offline')});assert.equal(p.locationStatus,'catalog-unavailable');assert.equal(calls,1);
});
test('single location survives first/middle/last, repeats, removal, pins and all template families without photo overlap',()=>{
 const photos=Array.from({length:12},(_,i)=>({id:'p'+i,aspect:.75,avg:[80,90,100],width:900,height:1200}));
 for(const family of catalog.families){
  const slides=engine.generate({catalog,photos,familyId:family.id,seed:5}).slides;
  const original=slides.flatMap(s=>s.layers.filter(l=>l.type==='img').map(l=>[l.x,l.y,l.w,l.h]));
  slides[0].frameLocked=true;
  for(const position of ['first','middle','last']){
   const settings={enabled:true,position,text:'Villavicencio · Colombia'};loc.decorate(slides,settings,engine.captionInk);
   assert.equal(slides.flatMap(s=>s.layers).filter(l=>l.frameLocation).length,1);
   assert.ok(slides[loc.index(position,slides.length)].layers.some(l=>l.frameLocation));
   const sl=slides[loc.index(position,slides.length)];for(const l of sl.layers.filter(l=>l.type==='img'))assert.ok(l.y+l.h<395,'footer outside photo');
   const frozen=JSON.stringify(slides);loc.decorate(slides,settings,engine.captionInk);assert.equal(JSON.stringify(slides),frozen,'no repeated shrink');
  }
  loc.decorate(slides,{enabled:false},engine.captionInk);
  const restored=slides.flatMap(s=>s.layers.filter(l=>l.type==='img').map(l=>[l.x,l.y,l.w,l.h]));restored.forEach((row,i)=>row.forEach((v,j)=>assert.ok(Math.abs(v-original[i][j])<1e-8)));
 }
});
