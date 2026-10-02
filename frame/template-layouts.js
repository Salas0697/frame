/* Curated, format-specific photo envelopes. Coordinates share preview/export units. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FrameTemplateLayouts=api})(typeof window==='undefined'?globalThis:window,()=>{
  const featured=['gallery_book','editorial_pair','full_bleed','museum_notes','offset_studies','linen_album','cinema_club','torn_atelier'];
  const editorial=['editorial_studio','instant_paper','sage_shapes','lilac_pages','travel_papers','pop_cards'];
  const slot=(x,y,w,h)=>({x,y,w,h,rotation:0});
  function editorialFamily(source,format){
    const tall=format==='9:16',square=format==='1:1',id=source.id;
    const v=(name,slots)=>({id:id+'_'+name+'_'+format.replace(':','x'),pageSpan:1,photoCount:slots.length,slots,captionRegion:{x:.09,y:.925,w:.82,h:.055}});
    // Paper and graphic accents stay outside these envelopes. Unknown subjects retain the whole source.
    let covers,variants;
    if(id==='editorial_studio'){
      covers=[slot(.10,.13,.80,.66),slot(.08,.10,.72,.72),slot(.20,.14,.70,.65)];
      variants=[v('feature',[slot(.08,.08,.84,.75)]),v('columns',tall?[slot(.10,.07,.80,.38),slot(.10,.51,.80,.35)]:[slot(.08,.12,.39,.69),slot(.53,.20,.39,.61)]),v('essay',[slot(.09,.08,.82,.47),slot(.09,.63,.39,.24),slot(.53,.63,.38,.24)])];
    }else if(id==='instant_paper'){
      covers=[slot(.16,.12,.68,.62),slot(.11,.10,.74,.68),slot(.22,.16,.63,.61)];
      variants=[v('album',[slot(.12,.08,.76,.68)]),v('pair',tall?[slot(.16,.06,.68,.34),slot(.16,.52,.68,.34)]:[slot(.08,.12,.38,.62),slot(.55,.20,.37,.58)]),v('three',[slot(.10,.07,.48,.40),slot(.64,.10,.25,.29),slot(.34,.60,.54,.25)])];
    }else if(id==='sage_shapes'){
      covers=[slot(.13,.17,.70,.62),slot(.10,.11,.76,.69),slot(.21,.13,.69,.63)];
      variants=[v('botanical',[slot(.12,.12,.76,.69)]),v('balance',tall?[slot(.14,.08,.72,.35),slot(.14,.52,.72,.34)]:[slot(.08,.14,.40,.62),slot(.55,.25,.36,.54)]),v('study',[slot(.08,.10,.84,.45),slot(.17,.62,.32,.24),slot(.56,.62,.32,.24)])];
    }else if(id==='lilac_pages'){
      covers=[slot(.12,.21,.76,.57),slot(.16,.15,.68,.65),slot(.09,.19,.81,.62)];
      variants=[v('portrait',[slot(.16,.13,.68,.69)]),v('spread',tall?[slot(.12,.10,.76,.34),slot(.12,.53,.76,.31)]:[slot(.09,.20,.36,.59),slot(.53,.13,.38,.65)]),v('sequence',[slot(.09,.11,.82,.42),slot(.09,.61,.37,.25),slot(.54,.61,.37,.25)])];
    }else if(id==='travel_papers'){
      covers=[slot(.07,.09,.84,.70),slot(.13,.13,.79,.67),slot(.09,.07,.80,.77)];
      variants=[v('journey',[slot(.08,.07,.84,.77)]),v('postcards',tall?[slot(.09,.07,.82,.35),slot(.16,.53,.75,.34)]:[slot(.06,.09,.44,.68),slot(.56,.22,.37,.60)]),v('diary',[slot(.07,.08,.86,.45),slot(.09,.61,.34,.27),slot(.49,.60,.43,.27)])];
    }else{
      covers=[slot(.14,.14,.72,.66),slot(.11,.09,.73,.75),slot(.23,.17,.65,.65)];
      variants=[v('poster',[slot(.14,.10,.72,.75)]),v('duo',tall?[slot(.14,.07,.72,.36),slot(.14,.53,.72,.33)]:[slot(.09,.12,.36,.66),slot(.55,.20,.36,.62)]),v('tiles',[slot(.10,.09,.80,square?.43:.45),slot(.10,.62,.34,.23),slot(.56,.62,.34,.23)])];
    }
    return {...source,curated:true,variants,covers:covers.map((s,i)=>v('cover_'+i,[s]))};
  }
  function family(source,format){
    if(editorial.includes(source.id))return editorialFamily(source,format);
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
  return {featured,editorial,family};
});
