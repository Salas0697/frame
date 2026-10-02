/* Curated, format-specific photo envelopes. Coordinates share preview/export units. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FrameTemplateLayouts=api})(typeof window==='undefined'?globalThis:window,()=>{
  const featured=['gallery_book','editorial_pair','full_bleed','museum_notes','offset_studies','linen_album','cinema_club','torn_atelier'];
  const slot=(x,y,w,h)=>({x,y,w,h,rotation:0});
  function family(source,format){
    if(!featured.includes(source.id))return source;
    const tall=format==='9:16',square=format==='1:1',id=source.id;
    const margin=id==='full_bleed'?0:id==='linen_album'?.075:id==='torn_atelier'?.055:.06;
    const gap=id==='full_bleed'?.008:.022;
    const bottom=id==='full_bleed'?1:.88,top=id==='full_bleed'?0:.055;
    const width=1-2*margin,height=bottom-top;
    const grid=(cols,rows)=>Array.from({length:cols*rows},(_,i)=>slot(margin+(i%cols)*(width+gap)/cols,top+Math.floor(i/cols)*(height+gap)/rows,(width-gap*(cols-1))/cols,(height-gap*(rows-1))/rows));
    const variant=(name,slots)=>({id:id==='museum_notes'&&name.startsWith('grid')?'museum_'+name.slice(4):id+'_'+name+'_'+format.replace(':','x'),pageSpan:1,photoCount:slots.length,slots,captionRegion:{x:margin||.04,y:.925,w:width||.92,h:.055}});
    const wide=slot(margin,top,width,height);
    let interiors;
    if(id==='museum_notes')interiors=[variant('grid4',grid(2,2)),variant('grid6',grid(tall?2:3,tall?3:2)),variant('grid9',grid(3,3))];
    else if(id==='editorial_pair')interiors=[variant('diptych',grid(tall?1:2,tall?2:1)),variant('triptych',grid(tall?1:3,tall?3:1)),variant('paired',grid(tall?2:1,tall?1:2))];
    else if(id==='full_bleed')interiors=[variant('single',[wide]),variant('pair',grid(tall?1:2,tall?2:1)),variant('four',grid(2,2))];
    else if(id==='offset_studies')interiors=[variant('step',[slot(.06,.055,.66,tall?.49:.53),slot(.35,tall?.57:.49,.59,tall?.31:.39)]),variant('details',[slot(.06,.055,.88,.51),slot(.06,.60,.43,.28),slot(.51,.60,.43,.28)])];
    else if(id==='cinema_club')interiors=[variant('still',[slot(.025,.19,.95,square?.56:.60)]),variant('double',[slot(.025,.07,.95,.36),slot(.025,.51,.95,.36)]),variant('reel',grid(1,3))];
    else if(id==='torn_atelier')interiors=[variant('portrait',[wide]),variant('diptych',grid(tall?1:2,tall?2:1)),variant('asymmetric',[slot(.055,.06,.89,.48),slot(.27,.59,.675,.29)])];
    else if(id==='linen_album')interiors=[variant('single',[wide]),variant('pair',grid(tall?1:2,tall?2:1)),variant('four',grid(2,2))];
    else interiors=[variant('center',[wide]),variant('left',[slot(.055,.055,.84,.825)]),variant('right',[slot(.105,.075,.84,.805)])];
    // End pages stay substantial; airy is intentional rather than a tiny thumbnail.
    if(id!=='museum_notes')interiors.push(variant('pause',[slot(id==='offset_studies'?.17:margin,.17,width*.88,.64)]),variant('coda',[slot(margin,.11,width,.77)]));
    const covers=[variant('cover_open',[wide]),variant('cover_offset',[slot(margin+(id==='gallery_book'?.035:0),.085,width*.94,.79)]),variant('cover_close',[slot(margin,.055,width,.80)])];
    return {...source,curated:true,variants:interiors,covers};
  }
  return {featured,family};
});
