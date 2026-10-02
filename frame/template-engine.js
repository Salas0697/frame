/* Pure composition engine. Files, decoding, persistence and UI belong to their owners. */
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FrameTemplateEngine = api;
})(typeof window !== 'undefined' ? window : this, function() {
  const W = 340, H = 425;
  const formats=typeof module==='object'&&module.exports?require('./formats.js'):window.FrameFormats;
  const colors=typeof module==='object'&&module.exports?require('./photo-colors.js'):window.FramePhotoColors;
  const style=typeof module==='object'&&module.exports?require('./template-style.js'):window.FrameTemplateStyle;
  const layouts=typeof module==='object'&&module.exports?require('./template-layouts.js'):window.FrameTemplateLayouts;
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
  const aspect = p => Number(p.aspect || p.width / p.height || p.w / p.h) || 1;
  const faces = p => p.faces?.length ? p.faces : p.faceUnion ? [p.faceUnion] : [];
  function seeded(seed) {
    let s = seed >>> 0;
    return () => { s += 0x6D2B79F5; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function weighted(rows, random) {
    let n = random() * rows.reduce((sum, r) => sum + r.weight, 0);
    return rows.find(r => (n -= r.weight) < 0) || rows.at(-1);
  }
  function union(p) {
    const f = faces(p);
    if (!f.length) return null;
    const x = Math.min(...f.map(b => b.x)), y = Math.min(...f.map(b => b.y));
    return {x, y, w: Math.max(...f.map(b => b.x + b.w)) - x, h: Math.max(...f.map(b => b.y + b.h)) - y};
  }
  // CSS object-position and canvas export use the same excess-pixel percentage.
  function crop(p, w, h) {
    const ratio = aspect(p), target = w / h;
    const vw = Math.min(1, target / ratio), vh = Math.min(1, ratio / target);
    const u = union(p);
    const x = clamp((u ? u.x + u.w / 2 : .5) - vw / 2, 0, 1 - vw);
    const y = clamp((u ? u.y + u.h / 2 : .5) - vh / 2, 0, 1 - vh);
    const safe = !u || (u.x >= x - .001 && u.y >= y - .001 && u.x + u.w <= x + vw + .001 && u.y + u.h <= y + vh + .001);
    return {offX: vw < .999 ? (x / (1 - vw) - .5) * 100 : 0,
      offY: vh < .999 ? (y / (1 - vh) - .5) * 100 : 0, safe, visible: {x, y, w: vw, h: vh}, retained: vw * vh};
  }
  function fittedSlot(slot, p, W=340, H=425) {
    const result = {...slot};
    const target = slot.w * W / (slot.h * H), ratio = aspect(p);
    if (ratio > target) { result.h = slot.w * W / ratio / H; result.y += (slot.h - result.h) / 2; }
    else { result.w = slot.h * H * ratio / W; result.x += (slot.w - result.w) / 2; }
    return result;
  }
  function assign(variant, pool, random, allowOverlap = false, W=340, H=425) {
    if (variant.photoCount > pool.length) return null;
    const free = [...pool], assigned = new Array(variant.slots.length);
    // Constrained small cells get first choice; groups remain available for large slots.
    const order = variant.slots.map((s, i) => ({s, i})).sort((a,b) => a.s.w*a.s.h - b.s.w*b.s.h);
    let fit = 0;
    for (const {s, i} of order) {
      const ranked = free.map(p => {
        let slot = s, c = crop(p, s.w * W, s.h * H);
        if (p.faceAnalysisStatus==='unavailable' || (variant.photoCount === 1 && !((variant.id.startsWith('bleed_')||variant.id.startsWith('full_bleed_')) && c.safe && c.retained >= .68))) { slot = fittedSlot(s, p, W, H); c = crop(p, slot.w * W, slot.h * H); }
        const count = p.faceCount || faces(p).length, area = slot.w * slot.h;
        const dense = variant.photoCount > 1;
        const safe = c.safe && !(dense && count >= 3 && area < .28) && !(dense && count >= 2 && area < .14) && !(allowOverlap && (count || p.faceAnalysisStatus==='unavailable'));
        // Image variance may be in thousands. It must never override crop safety.
        const quality = Math.log1p(Math.max(0, Number(p.score) || 0)) / 4;
        return {p, slot, c, safe, score: c.retained * 16 + Math.min(quality, 4) + random() * 9};
      }).filter(r => r.safe).sort((a,b) => b.score-a.score);
      if (!ranked.length) return null;
      const best = ranked[0]; assigned[i] = best; fit += best.c.retained;
      free.splice(free.indexOf(best.p), 1);
    }
    return {assigned, fit: fit / assigned.length};
  }
  function canSpread(p, span, W=340, H=425) {
    if (p.faceAnalysisStatus==='unavailable') return false;
    if (aspect(p) < span * (W/H) * .8) return false;
    const c = crop(p, W * span, H);
    if (!c.safe) return false;
    // A face can fit the composite while still being severed at a page boundary.
    return faces(p).every(f => {
      const left = (f.x - c.visible.x) / c.visible.w, right = (f.x + f.w - c.visible.x) / c.visible.w;
      for (let i = 1; i < span; i++) if (left - .015 < i/span && right + .015 > i/span) return false;
      return true;
    });
  }
  function heroScore(p,W=340,H=425){
    const brightness=Number(p.brightness??128),exposure=1-Math.min(1,Math.abs(brightness-128)/128);
    const sharp=Math.log1p(Math.max(0,Number(p.sharpness??p.variance??0)));
    const resolution=Math.min(1,Math.min(p.width||p.w||1000,p.height||p.h||1000)/1400);
    const fit=crop(p,W*.84,H*.8);
    return (fit.safe?12:-30)+fit.retained*10+exposure*8+Math.min(sharp,10)*1.5+resolution*4+(faces(p).length===1?3:0);
  }
  function captionInk(bg){
    let c=bg.startsWith('#')?bg.slice(1).match(/../g).map(v=>parseInt(v,16)):(bg.match(/\d+/g)||[255,255,255]).map(Number);
    return c[0]*.2126+c[1]*.7152+c[2]*.0722<135?'#f7f7f5':'#222222';
  }
  function signature(slides) {
    return slides.map(sl => `${sl.frameLayout}:${sl.layers.filter(l=>l.type==='img').map(l=>l.photo.id).join(',')}`).join('|');
  }
  // Compare the result after contain-fitting, without names, layer IDs or photo order.
  function geometry(sl) {
    const [W,H]=formats.dimensions(sl.frameFormat);
    return sl.layers.filter(l=>l.type==='img'&&!l.hidden).map(l=>[l.x/W,l.y/H,l.w/W,l.h/H,l.rot||0]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  }
  function distance(a,b){
    if(!a||!b||a.length!==b.length)return 1;
    return a.reduce((sum,row,i)=>sum+row.slice(0,4).reduce((n,v,j)=>n+Math.abs(v-b[i][j]),0)/4+Math.abs(row[4]-b[i][4])/180,0)/a.length;
  }
  function visualSignature(slides){
    return JSON.stringify(slides.map(sl=>[sl.bg,sl.layers.filter(l=>!l.hidden).map(l=>[l.type,l.kind||'',l.frameCut?.kind||'',l.frameBorder||0,l.color||'',l.x,l.y,l.w||0,l.h||0,l.rot||0].map(v=>typeof v==='number'?Math.round(v/3)*3:v)).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))]));
  }
  function captionLines(text) {
    const words=String(text).trim().slice(0,120).split(/\s+/).flatMap(word=>word.match(/.{1,40}/g)||[]), lines=[''];
    words.forEach(word=>{const last=lines.length-1;if((lines[last]+' '+word).trim().length>40 && lines[last])lines.push(word);else lines[last]=(lines[last]+' '+word).trim()});
    return lines.join('\n');
  }
  function generate({catalog, photos, brief = {}, familyId, previous, seed = Date.now(), caption = '', heroPhotoId, backgroundMode = 'collection', frameTreatment = 'gallery', backgroundColor, format = '4:5'}) {
    const [W,H]=formats.dimensions(format);
    if (!photos.length) return {slides: [], familyId: null, signature: ''};
    const random = seeded(seed), families = catalog.families.map(f=>layouts.family(f,format));
    const weights = families.map(f => {
      let weight = f.initialWeight;
      if (f.preferPurpose.includes(brief.purpose)) weight *= 1.8;
      if (f.preferVibe.includes(brief.vibe)) weight *= 2;
      if (brief.vibe === 'clean' && ['film_archive','soft_scrapbook','color_editorial'].includes(f.id)) weight *= .08;
      if (brief.vibe === 'color' && f.id === 'color_editorial') weight *= 8;
      if (brief.vibe === 'bold' && f.id === 'soft_scrapbook') weight *= 5;
      if (brief.purpose === 'showcase' && f.id === 'museum_notes') weight *= 2.5;
      // Recency is handled as eligibility, so high weights cannot immediately repeat.
      if (f.id==='continuous' && !photos.some(p=>canSpread(p,2,W,H))) weight=0;
      return {f, weight};
    });
    const recent = [...new Set([...(previous?.recentFamilies||[]),previous?.dir].filter(Boolean))].slice(-3);
    const fresh = weights.filter(row=>row.weight>0 && !recent.includes(row.f.id));
    const family = families.find(f=>f.id===familyId) || weighted(fresh.length?fresh:weights.filter(row=>row.weight>0), random).f;
    const gallery = families.find(f=>f.id==='gallery_book').variants;
    const pairs = families.find(f=>f.id==='editorial_pair').variants;
    const bg = backgroundMode==='collection'?style.background(family,photos,colors):colors.resolve(backgroundMode,photos,backgroundColor);
    const candidates = [];
    for (let attempt = 0; attempt < 12; attempt++) {
      let serial = 0, pool = [...photos], slides = [], totalFit = 0, fitCount = 0;
      const uid = () => `tpl_${seed}_${attempt}_${++serial}`;
      const layer = (p, slot, c, index = 0) => ({id:uid(),type:'img',photo:p,x:slot.x*W,y:slot.y*H,w:slot.w*W,h:slot.h*H,
        rot:slot.rotation||0,zoom:1,offX:c.offX,offY:c.offY,z:10+index,hidden:false,locked:false,moveMode:'crop',storyAuto:true});
      const page = kind => ({id:uid(),bg,frameFormat:formats.get(format).id,layers:[],palette:null,favorite:false,frameAuto:true,frameFamily:family.id,frameLayout:kind});
      const seen=[];
      function distinguish(sl){
        const original=geometry(sl),memory=[...seen,...(previous?.recentGeometry||[])];
        if(!memory.some(g=>distance(original,g)<.045)){seen.push(original);return}
        const imgs=sl.layers.filter(l=>l.type==='img'),bounds=imgs.map(l=>{const a=l.rot*Math.PI/180,w=Math.abs(l.w*Math.cos(a))+Math.abs(l.h*Math.sin(a)),h=Math.abs(l.w*Math.sin(a))+Math.abs(l.h*Math.cos(a));return {x:l.x+l.w/2-w/2,y:l.y+l.h/2-h/2,w,h}});
        const x=Math.min(...bounds.map(b=>b.x)),y=Math.min(...bounds.map(b=>b.y)),w=Math.max(...bounds.map(b=>b.x+b.w))-x,h=Math.max(...bounds.map(b=>b.y+b.h))-y;
        const old=imgs.map(l=>({...l}));let best,merit=-1;
        // A uniform transform preserves every source crop, face and inter-image gap.
        for(let i=0;i<(family.curated?96:24);i++){
          const ceiling=Math.min(.96,(W-34)/w,(H*.87-42)/h),floor=Math.min(sl.frameHero ? .83 : .68,ceiling*.8);
          const k=family.curated?Math.min(1,(W-24)/w,(H*.88-24)/h)*(.86+(i%16)*.01):floor+random()*(ceiling-floor);
          const tx=family.curated?12+(i%3)/2*Math.max(0,W-24-w*k):17+random()*Math.max(0,W-34-w*k),ty=family.curated?12+(Math.floor(i/3)%5)/4*Math.max(0,H*.88-24-h*k):21+random()*Math.max(0,H*.87-42-h*k);
          imgs.forEach((l,j)=>{l.x=tx+(old[j].x-x)*k;l.y=ty+(old[j].y-y)*k;l.w=old[j].w*k;l.h=old[j].h*k});
          const g=geometry(sl),d=Math.min(...memory.map(other=>distance(g,other)));
          if(d>merit){merit=d;best=imgs.map(l=>({x:l.x,y:l.y,w:l.w,h:l.h}))}
        }
        imgs.forEach((l,j)=>Object.assign(l,best[j]));sl.frameVariation=true;seen.push(geometry(sl));
      }
      function append(v, assigned, front = false) {
        const sl = page(v.id);
        assigned.assigned.forEach((a, i) => sl.layers.push(layer(a.p,a.slot,a.c,i)));
        distinguish(sl);
        if (v.captionRegion) sl.frameCaptionRegion = {...v.captionRegion};
        if (front) slides.splice(slides[0]?.frameHero ? 1 : 0,0,sl); else slides.push(sl);
        const used = new Set(assigned.assigned.map(a=>a.p.id));
        pool = pool.filter(p=>!used.has(p.id)); totalFit += assigned.fit; fitCount++;
      }
      const wantedHero=pool.find(p=>p.id===heroPhotoId);
      if(wantedHero || (pool.length>=4 && (family.curated||['story','impact'].includes(brief.purpose)))){
        const hero=wantedHero||[...pool].sort((a,b)=>heroScore(b,W,H)-heroScore(a,W,H))[0];
        const covers=family.covers||[{id:'editorial_hero',slots:[{x:.08,y:.06,w:.84,h:.80}],captionRegion:{x:.08,y:.9,w:.84,h:.06}}];
        const freshCovers=covers.filter(v=>v.id!==previous?.layouts?.[0]);
        const cover=(freshCovers.length?freshCovers:covers)[attempt % (freshCovers.length||covers.length)];
        const box=cover.slots[0];
        const fit=crop(hero,box.w*W,box.h*H);
        const slot=hero.faceAnalysisStatus!=='unavailable' && fit.safe && fit.retained>.82 ? box : fittedSlot(box,hero,W,H);
        const c=crop(hero,slot.w*W,slot.h*H),sl=page(cover.id);
        sl.layers.push(layer(hero,slot,c));sl.frameHero=true;
        distinguish(sl);
        if(cover.captionRegion)sl.frameCaptionRegion={...cover.captionRegion};
        slides.push(sl);pool=pool.filter(p=>p.id!==hero.id);totalFit+=c.retained;fitCount++;
      }
      // Dense, orderly grids are intentional layouts, never nine "too small" penalties.
      if (['museum_notes','contact_press'].includes(family.id)) {
        const grids = [...family.variants].sort((a,b)=>b.photoCount-a.photoCount);
        const max = family.id==='contact_press' ? (brief.density==='airy'?4:brief.density==='rich'?12:8) : brief.density === 'airy' && brief.purpose !== 'showcase' ? 6 : 9;
        const eligible = grids.filter(v=>v.photoCount<=max && v.photoCount<=pool.length);
        for (const v of eligible) {
          const assigned = assign(v,pool,random,false,W,H);
          if (assigned) { append(v,assigned); break; }
        }
      }
      if (family.id === 'continuous'||family.crossPage) {
        const variants = family.variants.filter(v=>v.pageSpan>1).map(v=>({v,key:random()})).sort((a,b)=>a.key-b.key).map(row=>row.v);
        for (const v of variants) {
          const p = [...pool].sort(()=>random()-.5).find(p=>canSpread(p,v.pageSpan,W,H));
          if (!p) continue;
          const c = crop(p,W*v.pageSpan,H);
          for (let i=0;i<v.pageSpan;i++) {
            const sl=page(v.id);
            sl.storySpan={photoId:p.id,start:0,span:v.pageSpan,seg:i};
            sl.layers.push({...layer(p,{x:-i,y:0,w:v.pageSpan,h:1},c),storySpan:true,storySeg:i,storySpanCount:v.pageSpan});
            slides.push(sl);
          }
          pool=pool.filter(q=>q.id!==p.id); break;
        }
      }
      while (pool.length) {
        let options = family.variants.filter(v=>v.pageSpan===1);
        if (family.id==='museum_notes' && slides.length) options=[...pairs,...gallery];
        else {
          // Keep each collection's silhouette; a family cover is the safe single fallback.
          options=[...options,...(family.covers||gallery)];
        }
        options=[...new Map(options.map(v=>[v.id,v])).values()];
        const ranked=[];
        for (const v of options) {
          if (v.photoCount>pool.length) continue;
          const a=assign(v,pool,random,family.allowOverlap && v.id.startsWith('scrapbook'),W,H);
          if (!a) continue;
          const native=family.variants.some(x=>x.id===v.id);
          const target=brief.density==='airy'?1.5:brief.density==='rich'?4:2.5;
          let score=a.fit*8+(family.curated?a.assigned.reduce((n,r)=>n+r.slot.w*r.slot.h,0)*10:0)+(native?9:0)-Math.abs(v.photoCount-target)*2+random()*8;
          const shape=a.assigned.map(row=>[row.slot.x,row.slot.y,row.slot.w,row.slot.h,row.slot.rotation||0]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
          if([...seen,...(previous?.recentGeometry||[])].some(g=>distance(shape,g)<.045))score-=24;
          if (v.id===slides.at(-1)?.frameLayout) score-=5;
          if (family.id==='museum_notes' && slides.length && pool.length>=2 && pool.length<=3 && v.photoCount===2) score+=20;
          if (brief.purpose==='impact' && !slides.length && v.photoCount===1) score+=12;
          ranked.push({v,a,score});
        }
        ranked.sort((a,b)=>b.score-a.score);
        // A fitted single image is always eligible, even for a very wide group photo.
        const choice=ranked[0];
        if (!choice) throw new Error('No safe layout available');
        append(choice.v,choice.a,family.id==='museum_notes' && slides.length>0 && pool.length<=3);
      }
      // Only one user-authored caption per album. No fabricated dates or locations.
      const note = String(caption).trim().slice(0,120);
      const captionSlide = slides.find(sl=>sl.frameCaptionRegion);
      if (note && captionSlide) {
        const r=captionSlide.frameCaptionRegion;
        // Four short lines fit the reserved footer in both preview and export.
        captionSlide.layers.push({id:uid(),type:'text',text:captionLines(note),x:r.x*W,y:r.y*H,w:r.w*W,size:6.5,color:'#222222',font:'mono',weight:400,rot:0,z:40,hidden:false,locked:false,userTouched:true,frameCaption:true});
      }
      for(const sl of slides){
        if(sl.storySpan){
          if(family.cutStyle){const l=sl.layers[0],cut={kind:family.cutStyle,seed:(seed+7919)>>>0},u=union(l.photo),c=crop(l.photo,l.w,l.h),safe=l.photo.faceAnalysisStatus!=='unavailable'&&(!u||(u.y>=c.visible.y+.04*c.visible.h&&u.y+u.h<=c.visible.y+.96*c.visible.h));
            sl.layers.push({id:uid(),type:'deco',kind:'frame',x:l.x,y:l.y,w:l.w,h:l.h,rot:0,z:l.z-.25,color:'#f2eee5',frameCut:cut,cutPaper:true,hidden:false,locked:true});
            l.x+=l.w*.014;l.y+=l.h*.014;l.w*=.972;l.h*=.972;if(safe)l.frameCut=cut;
          }continue;
        }
        style.decorate(sl,family,uid,slides.indexOf(sl));
        if(frameTreatment==='mat'){
          sl.layers.forEach(l=>{l.x=W*.045+l.x*.91;l.y=H*.045+l.y*.91;if(l.type==='img'||l.type==='deco'){l.w*=.91;l.h*=.91}else if(l.type==='text'){l.w*=.91;l.size*=.91}});
          if(sl.frameCaptionRegion){const r=sl.frameCaptionRegion;sl.frameCaptionRegion={x:.045+r.x*.91,y:.045+r.y*.91,w:r.w*.91,h:r.h*.91}}
        }
        if(['print','darkroom'].includes(frameTreatment)){
          const paper=frameTreatment==='print'?'#ffffff':'#080809';
          const images=sl.layers.filter(l=>l.type==='img');
          for(const l of images){
            const backing={id:uid(),type:'deco',kind:'frame',x:l.x,y:l.y,w:l.w,h:l.h,rot:l.rot,z:l.z-.5,color:paper,framePaper:true,hidden:false,locked:true};
            const k=.86;l.x+=l.w*(1-k)/2;l.y+=l.h*.045;l.w*=k;l.h*=k;
            sl.layers.push(backing);
          }
        }
        if(frameTreatment==='fine')sl.layers.filter(l=>l.type==='img').forEach(l=>{l.frameBorder=.55;l.frameBorderColor=bg==='#101012'||bg==='#161616'?'#eeeeee':'#202020'});
        if(family.cutStyle){
          for(const l of sl.layers.filter(l=>l.type==='img')){
            const cut={kind:family.cutStyle,seed:(seed+serial++*7919)>>>0};
            // The backing owns the torn silhouette; leave a narrow visible paper lip.
            sl.layers.push({id:uid(),type:'deco',kind:'frame',x:l.x,y:l.y,w:l.w,h:l.h,rot:l.rot,z:l.z-.25,color:'#f2eee5',frameCut:cut,cutPaper:true,hidden:false,locked:true});
            const k=.972;l.x+=l.w*(1-k)/2;l.y+=l.h*(1-k)/2;l.w*=k;l.h*=k;
            const u=union(l.photo),c=crop(l.photo,l.w,l.h),margin=['diagonal','notch'].includes(cut.kind)?.18:.03;
            const safe=l.photo.faceAnalysisStatus!=='unavailable'&&(!u||(u.x>=c.visible.x+margin*c.visible.w&&u.y>=c.visible.y+margin*c.visible.h&&u.x+u.w<=c.visible.x+(1-margin)*c.visible.w&&u.y+u.h<=c.visible.y+(1-margin)*c.visible.h));
            // If an edge could cross a face, cut only the paper, preserving the photo.
            if(safe)l.frameCut=cut;
          }
        }
        sl.layers.filter(l=>l.frameCaption).forEach(l=>{l.color=captionInk(bg)});
      }
      const sig=signature(slides);
      const visual=visualSignature(slides);
      let score=totalFit/Math.max(fitCount,1)*12 + random()*4;
      if (previous?.signature===sig) score-=100;
      if (previous?.layouts?.join('|')===slides.map(sl=>sl.frameLayout).join('|')) score-=60;
      if(previous?.visualSignature===visual)score-=120;
      const shapes=slides.filter(sl=>!sl.storySpan).map(geometry);
      const opening=shapes[0],lastOpening=previous?.openingGeometry;
      if(lastOpening)score+=Math.min(.2,distance(opening,lastOpening))*80;
      candidates.push({slides,familyId:family.id,familyName:family.name,signature:sig,visualSignature:visual,openingGeometry:opening,recentGeometry:[...(previous?.recentGeometry||[]),...shapes].slice(-32),recentFamilies:[...recent.filter(id=>id!==family.id),family.id].slice(-3),score});
    }
    candidates.sort((a,b)=>b.score-a.score);
    return candidates[0];
  }
  return {generate, crop, canSpread, signature, visualSignature, geometry, distance, captionLines, heroScore, captionInk};
});
