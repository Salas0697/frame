/* Collection identity uses native layers, shared by selection, editor and export. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FrameTemplateStyle=api})(typeof window!=='undefined'?window:this,()=>{
  function background(family,photos,colors){return /^#[\da-f]{6}$/i.test(family?.background||'')?family.background:colors.resolve('auto',photos)}
  function decorate(sl,family,uid,index){
    const W=340,H=sl.frameFormat==='1:1'?340:sl.frameFormat==='9:16'?340*16/9:425;
    const recipe=family.visualRecipe,ink=['#101017','#122d48','#161616','#191919'].includes(sl.bg)?'#e8e5d9':'#403c35';
    const accent=recipe==='neon'?'#dfff64':recipe==='grid'?'#557f9c':recipe==='blocks'?'#c96542':ink;
    const add=(x,y,w,h,color=accent,z=2,kind='frame')=>sl.layers.push({id:uid(),type:'deco',kind,x:x*W,y:y*H,w:w*W,h:h*H,rot:0,z,color,hidden:false,locked:true,frameGraphic:true});
    const images=sl.layers.filter(l=>l.type==='img');
    if(recipe==='none'||!recipe)return;
    if(['studio','instant','sage','lilac','travel','pop'].includes(recipe)){
      if(recipe==='studio'){add(.08,.055,.84,.0015,'#9b9186');add(.08,.892,.18,.004,'#7b6554');add(.77,.892,.15,.0015,'#9b9186')}
      if(recipe==='sage'){add(index%2?.56:.04,.04,.40,.26,'#d3d7c5',1,'circle');add(index%2?.05:.67,.69,.28,.20,'#d3d7c5',1,'circle');add(.08,.90,.84,.0015,'#7a806a')}
      if(recipe==='lilac'){add(.045,.045,.91,.052,'#e8e0d0');add(.08,.88,.84,.0015,'#918199');add(.08,.90,.13,.008,'#918199')}
      if(recipe==='travel'){add(0,0,.055,1,'#8b9e84');add(.91,.03,.06,.83,'#d7c8ad');add(.10,.90,.80,.002,'#8b9e84')}
      if(recipe==='pop'){add(.055,.05,.23,.17,'#e48bb0');add(.70,.72,.25,.17,'#e48bb0');add(.06,.90,.27,.008,'#644275')}
      for(const l of images){
        const x=l.x/W,y=l.y/H,w=l.w/W,h=l.h/H;
        const color=recipe==='pop'?'#fff8e5':recipe==='travel'?'#fcf8ef':'#fffdf8';
        const pad=recipe==='instant'?.019:recipe==='studio'?.009:.013;
        add(x-pad,y-pad,w+pad*2,h+pad*2+(recipe==='instant'?.055:0),color,l.z-.5);
        if(recipe==='instant'){add(x+w*.35,y-.026,w*.30,.019,'#d3bea0',l.z-.25);add(x+w*.27,y+h+.027,w*.46,.0015,'#b5a48d',l.z-.25)}
        if(recipe==='travel')add(x+w*.27,y-.024,w*.27,.022,'#c7b68f',l.z-.25);
        if(recipe==='pop'){add(x-pad,y-pad,w+pad*2,.003,'#644275',l.z-.25);add(x-pad,y-pad,.003,h+pad*2,'#644275',l.z-.25)}
      }
    }else if(['rule','margin','journal','rail','columns','hinge'].includes(recipe)){
      const x=recipe==='hinge'?.5:recipe==='margin'?.13:.035;
      add(x,.06,.002,.81,ink);if(recipe==='journal')add(.055,.87,.84,.002,ink);
      if(recipe==='margin')for(let i=0;i<3;i++)add(.05,.13+i*.035,.045,.003,ink);
      if(recipe==='rail')add(.025,.06,.023,.14,ink);
      if(recipe==='columns')add(.06,.9,.88,.002,ink);
    }else if(['sprockets','registration'].includes(recipe)){
      for(let i=0;i<12;i++)for(const x of [.018,.963])add(x,.04+i*.073,.019,.018,ink);
      if(recipe==='registration')for(const x of [.03,.96]){add(x,.015,.002,.025,ink);add(x-.008,.026,.018,.002,ink)}
    }else if(['blocks','mosaic','ribbon','horizon','diagonal','neon','screen'].includes(recipe)){
      if(recipe==='blocks'){add(index%2?.04:.61,.04,.35,.31,'#c96542');add(index%2?.67:.04,.68,.29,.2,'#e2be60')}
      if(recipe==='mosaic'){add(.03,.06,.022,.22,ink);add(.77,.88,.19,.012,ink)}
      if(recipe==='ribbon')add(index%2?.62:.08,.03,.22,.87,'#d8c3ac');
      if(recipe==='horizon')add(.03,.88,.94,.011,ink);
      if(recipe==='diagonal'){add(.03,.035,.23,.012,ink);add(.94,.71,.013,.17,ink)}
      if(recipe==='neon'){add(.025,.035,.018,.86);add(.025,.895,.65,.012)}
      if(recipe==='screen'){add(.055,.025,.89,.018,ink);add(.055,.875,.89,.018,ink)}
    }else if(recipe==='grid'){
      for(let i=1;i<10;i++)add(i*.1,0,.001,1,'#28506b');for(let i=1;i<13;i++)add(0,i*.075,1,.0008,'#28506b');
      for(const x of [.04,.94]){add(x,.88,.002,.035,'#91b4c7');add(x-.015,.897,.032,.002,'#91b4c7')}
    }else if(['stack','tape','mount','corners','postage','atelier'].includes(recipe)){
      for(const l of images){
        const x=l.x/W,y=l.y/H,w=l.w/W,h=l.h/H;
        if(recipe==='stack'){add(x+.012,y+.018,Math.min(w,.975-x-.012),Math.min(h,.89-y-.018),'#c1b5a3',l.z-.7);add(x-.01,y-.01,w+.02,h+.02,'#fffaf0',l.z-.5)}
        if(recipe==='tape'){add(x-.012,y-.008,w+.024,h+.016,'#fffdf7',l.z-.5);add(x+w*.32,y-.019,w*.3,.012,'#d5bd95',l.z-.25)}
        if(recipe==='mount'){add(x-.009,y-.009,w+.018,h+.018,'#b7a98c',l.z-.5)}
        if(recipe==='corners'||recipe==='atelier')for(const [a,b] of [[x-.012,y-.01],[x+w-.035,y+h-.009]]){add(a,b,.047,.003,ink,l.z-.25);add(a,b-.027,.004,.03,ink,l.z-.25)}
        if(recipe==='postage'){
          add(x-.014,y-.011,w+.028,h+.022,'#fffdf7',l.z-.5);
          for(let i=0;i<Math.floor(w*W/10);i++)for(const b of [y-.011,y+h+.002])add(x+i*10/W,b,.011,.009,sl.bg,l.z-.25,'circle');
          for(let i=0;i<Math.floor(h*H/10);i++)for(const a of [x-.014,x+w+.003])add(a,y+i*10/H,.011,.009,sl.bg,l.z-.25,'circle');
        }
      }
    }
  }
  return {background,decorate};
});
