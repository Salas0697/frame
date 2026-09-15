const {test}=require('node:test'),assert=require('node:assert/strict');
const colors=require('../frame/photo-colors.js');
const pixels=(rgb,count)=>Array.from({length:count},()=>[...rgb,255]).flat();
test('predominant colors are observed pixels, ranked by area, without invented averages or tints',()=>{
 const data=Uint8ClampedArray.from([...pixels([220,20,30],80),...pixels([20,160,60],20),...Array(100).fill([0,0,255,0]).flat()]);
 const palette=colors.extract(data);assert.deepEqual(palette.map(c=>c.rgb),[[220,20,30],[20,160,60]]);assert.equal(palette[0].weight,.8);assert.equal(palette[1].weight,.2);
 assert.deepEqual(colors.extract(Uint8ClampedArray.from(pixels([90,90,90],100))).map(c=>c.hex),['#5a5a5a']);assert.deepEqual(colors.extract(new Uint8ClampedArray(40)),[]);
});
test('album suggestions combine measured populations and ignore duplicate panorama photo references',()=>{
 const a={id:'a',dominantColors:colors.extract(Uint8ClampedArray.from([...pixels([220,20,30],80),...pixels([20,160,60],20)]))},b={id:'b',dominantColors:colors.extract(Uint8ClampedArray.from(pixels([20,160,60],100)))};
 assert.equal(colors.palette([a,b,a])[0].hex,'#14a03c');assert.equal(colors.resolve('auto',[a]),'#dc141e');assert.equal(colors.resolve('color',[a]),'#dc141e');
});
test('page scope changes only one page; album scope clears overrides and preserves all geometry and text contrast',()=>{
 const p={id:'a',dominantColors:[{rgb:[220,20,30],hex:'#dc141e',weight:1}]},layers=()=>[{id:'im',type:'img',photo:p,x:20,y:20,w:100,h:200,offX:12},{id:'note',type:'text',frameLocation:true,color:'#fff'}];
 const project={photos:[p],slides:[{bg:'#ffffff',layers:layers()},{bg:'#ffffff',layers:layers()}],currentSlide:1},before=JSON.stringify(project.slides.map(s=>s.layers[0]));
 colors.apply(project,{scope:'page',mode:'custom',color:'#080809'});assert.equal(project.slides[0].bg,'#ffffff');assert.equal(project.slides[1].bg,'#080809');assert.equal(project.slides[1].layers[1].color,'#f7f7f5');
 colors.apply(project,{scope:'all',mode:'custom',color:'#f2eadd'});assert.ok(project.slides.every(s=>s.bg==='#f2eadd'&&!s.frameBackgroundOverride));assert.equal(project.frameBackgroundColor,'#f2eadd');assert.equal(project.slides[1].layers[1].color,'#222222');assert.equal(JSON.stringify(project.slides.map(s=>s.layers[0])),before);
 colors.apply(project,{scope:'all',mode:'auto'});assert.ok(project.slides.every(s=>s.bg==='#dc141e'));assert.equal(project.frameBackgroundColor,null);
});
