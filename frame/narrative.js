/* Album sequencing keeps covers, pinned pages and panorama seams intact. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FrameNarrative=api})(typeof window==='undefined'?globalThis:window,()=>{
  const directions={rhythm:{name:'Ritmo',description:'Apertura fuerte, alternancia de escenas y una pausa antes del cierre.',density:'balanced',vibe:'clean',purpose:'story'},calm:{name:'Calma',description:'Más aire, una foto protagonista y un recorrido suave de luz.',density:'airy',vibe:'soft',purpose:'story'},contrast:{name:'Contraste',description:'Contrapuntos de luz y páginas más densas para un recorrido enérgico.',density:'rich',vibe:'bold',purpose:'story'}};
  const metrics=sl=>{const photos=sl.layers.filter(l=>l.type==='img'&&!l.hidden).map(l=>l.photo);return {density:photos.length,light:photos.reduce((n,p)=>n+(Number(p.brightness)||128),0)/Math.max(1,photos.length)}};
  function sequence(slides,direction){
    if(!directions[direction])return slides;
    const result=[...slides],slots=[];
    for(let i=1;i<slides.length;i++)if(!slides[i].frameLocked&&!slides[i].layers.some(l=>l.type==='img'&&l.locked)&&!slides[i].storySpan)slots.push(i);
    const rows=slots.map(i=>({slide:slides[i],...metrics(slides[i])}));
    const ordered=[],closing=slots.at(-1)===slides.length-1?rows.splice(rows.map((r,i)=>({i,score:r.density*1000+Math.abs(r.light-128)})).sort((a,b)=>a.score-b.score)[0].i,1)[0]:null;
    if(direction==='calm')ordered.push(...rows.sort((a,b)=>a.light-b.light||a.density-b.density));
    else{
      rows.sort((a,b)=>direction==='contrast'?a.light-b.light:a.density-b.density||a.light-b.light);
      while(rows.length){ordered.push(rows.pop());if(rows.length)ordered.push(rows.shift())}
    }
    if(closing)ordered.push(closing);
    slots.forEach((index,i)=>result[index]=ordered[i].slide);
    return result.map((sl,i)=>({...sl,frameNarrativeRole:i===0?'Apertura':i===result.length-1?'Cierre':i===Math.floor(result.length/2)?'Pausa':'Ritmo'}));
  }
  return {directions,sequence};
});
