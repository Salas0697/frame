/* Pure composition engine. Files, decoding, persistence and UI belong to their owners. */
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FrameTemplateEngine = api;
})(typeof window !== 'undefined' ? window : this, function() {
  const W = 340, H = 425;
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
  function fittedSlot(slot, p) {
    const result = {...slot};
    const target = slot.w * W / (slot.h * H), ratio = aspect(p);
    if (ratio > target) { result.h = slot.w * W / ratio / H; result.y += (slot.h - result.h) / 2; }
    else { result.w = slot.h * H * ratio / W; result.x += (slot.w - result.w) / 2; }
    return result;
  }
  function assign(variant, pool, random, allowOverlap = false) {
    if (variant.photoCount > pool.length) return null;
    const free = [...pool], assigned = new Array(variant.slots.length);
    // Constrained small cells get first choice; groups remain available for large slots.
    const order = variant.slots.map((s, i) => ({s, i})).sort((a,b) => a.s.w*a.s.h - b.s.w*b.s.h);
    let fit = 0;
    for (const {s, i} of order) {
      const ranked = free.map(p => {
        let slot = s, c = crop(p, s.w * W, s.h * H);
        if (variant.photoCount === 1) { slot = fittedSlot(s, p); c = crop(p, slot.w * W, slot.h * H); }
        const count = p.faceCount || faces(p).length, area = slot.w * slot.h;
        const dense = variant.photoCount > 1;
        const safe = c.safe && !(dense && count >= 3 && area < .28) && !(dense && count >= 2 && area < .14) && !(allowOverlap && count);
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
  function canSpread(p, span) {
    if (aspect(p) < span * .8 * .8) return false;
    const c = crop(p, W * span, H);
    if (!c.safe) return false;
    // A face can fit the composite while still being severed at a page boundary.
    return faces(p).every(f => {
      const left = (f.x - c.visible.x) / c.visible.w, right = (f.x + f.w - c.visible.x) / c.visible.w;
      for (let i = 1; i < span; i++) if (left - .015 < i/span && right + .015 > i/span) return false;
      return true;
    });
  }
  function background(family, photos) {
    if (family.background !== 'single_photo_derived_accent' && family.background !== 'photo') return family.background;
    if (family.background === 'photo') return '#ffffff';
    const c = photos.map(p => p.avg || [128,128,128]).sort((a,b) => (Math.max(...b)-Math.min(...b))-(Math.max(...a)-Math.min(...a)))[0];
    return `rgb(${c.map(v => Math.round(v*.92)).join(',')})`;
  }
  function heroScore(p){
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
  function captionLines(text) {
    const words=String(text).trim().slice(0,120).split(/\s+/).flatMap(word=>word.match(/.{1,40}/g)||[]), lines=[''];
    words.forEach(word=>{const last=lines.length-1;if((lines[last]+' '+word).trim().length>40 && lines[last])lines.push(word);else lines[last]=(lines[last]+' '+word).trim()});
    return lines.join('\n');
  }
  function generate({catalog, photos, brief = {}, familyId, previous, seed = Date.now(), caption = '', heroPhotoId, backgroundMode = 'auto', frameTreatment = 'gallery'}) {
    if (!photos.length) return {slides: [], familyId: null, signature: ''};
    const random = seeded(seed), families = catalog.families;
    const weights = families.map(f => {
      let weight = f.initialWeight;
      if (f.preferPurpose.includes(brief.purpose)) weight *= 1.8;
      if (f.preferVibe.includes(brief.vibe)) weight *= 2;
      if (brief.vibe === 'clean' && ['film_archive','soft_scrapbook','color_editorial'].includes(f.id)) weight *= .08;
      if (brief.vibe === 'color' && f.id === 'color_editorial') weight *= 8;
      if (brief.vibe === 'bold' && f.id === 'soft_scrapbook') weight *= 5;
      if (brief.purpose === 'showcase' && f.id === 'museum_notes') weight *= 2.5;
      if (previous?.dir === f.id) weight *= .85;
      return {f, weight};
    });
    const family = families.find(f=>f.id===familyId) || weighted(weights, random).f;
    const gallery = families.find(f=>f.id==='gallery_book').variants;
    const pairs = families.find(f=>f.id==='editorial_pair').variants;
    const bg = backgroundMode === 'white' ? '#ffffff' : backgroundMode === 'black' ? '#101012' : backgroundMode === 'color' ? background({background:'single_photo_derived_accent'},photos) : background(family, photos);
    const candidates = [];
    for (let attempt = 0; attempt < 12; attempt++) {
      let serial = 0, pool = [...photos], slides = [], totalFit = 0, fitCount = 0;
      const uid = () => `tpl_${seed}_${attempt}_${++serial}`;
      const layer = (p, slot, c, index = 0) => ({id:uid(),type:'img',photo:p,x:slot.x*W,y:slot.y*H,w:slot.w*W,h:slot.h*H,
        rot:slot.rotation||0,zoom:1,offX:c.offX,offY:c.offY,z:10+index,hidden:false,locked:false,moveMode:'crop',storyAuto:true});
      const page = kind => ({id:uid(),bg,layers:[],palette:null,favorite:false,frameAuto:true,frameFamily:family.id,frameLayout:kind});
      function append(v, assigned, front = false) {
        const sl = page(v.id);
        assigned.assigned.forEach((a, i) => sl.layers.push(layer(a.p,a.slot,a.c,i)));
        if (v.captionRegion) sl.frameCaptionRegion = {...v.captionRegion};
        if (front) slides.splice(slides[0]?.frameHero ? 1 : 0,0,sl); else slides.push(sl);
        const used = new Set(assigned.assigned.map(a=>a.p.id));
        pool = pool.filter(p=>!used.has(p.id)); totalFit += assigned.fit; fitCount++;
      }
      const wantedHero=pool.find(p=>p.id===heroPhotoId);
      if(wantedHero || (pool.length>=4 && ['story','impact'].includes(brief.purpose))){
        const hero=wantedHero||[...pool].sort((a,b)=>heroScore(b)-heroScore(a))[0];
        const box=brief.purpose==='impact'?{x:.025,y:.025,w:.95,h:.95}:{x:.08,y:.06,w:.84,h:.80};
        const fit=crop(hero,box.w*W,box.h*H);
        const slot=fit.safe && fit.retained>.82 ? box : fittedSlot(box,hero);
        const c=crop(hero,slot.w*W,slot.h*H),sl=page('editorial_hero');
        sl.layers.push(layer(hero,slot,c));sl.frameHero=true;
        if(box.h<.9)sl.frameCaptionRegion={x:.08,y:.9,w:.84,h:.06};
        slides.push(sl);pool=pool.filter(p=>p.id!==hero.id);totalFit+=c.retained;fitCount++;
      }
      // Dense, orderly grids are intentional layouts, never nine "too small" penalties.
      if (family.id === 'museum_notes') {
        const grids = [...family.variants].sort((a,b)=>b.photoCount-a.photoCount);
        const max = brief.density === 'airy' && brief.purpose !== 'showcase' ? 6 : 9;
        const eligible = grids.filter(v=>v.photoCount<=max && v.photoCount<=pool.length);
        for (const v of eligible) {
          const assigned = assign(v,pool,random);
          if (assigned) { append(v,assigned); break; }
        }
      }
      if (family.id === 'continuous') {
        const variants = [...family.variants].sort(()=>random()-.5);
        for (const v of variants) {
          const p = [...pool].sort(()=>random()-.5).find(p=>canSpread(p,v.pageSpan));
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
        else options=[...options,...gallery,...pairs];
        options=[...new Map(options.map(v=>[v.id,v])).values()];
        const ranked=[];
        for (const v of options) {
          if (v.photoCount>pool.length) continue;
          const a=assign(v,pool,random,family.allowOverlap && v.id.startsWith('scrapbook'));
          if (!a) continue;
          const native=family.variants.some(x=>x.id===v.id);
          const target=brief.density==='airy'?1.5:brief.density==='rich'?4:2.5;
          let score=a.fit*8+(native?9:0)-Math.abs(v.photoCount-target)*2+random()*8;
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
        if(sl.storySpan)continue;
        if(frameTreatment==='mat'){
          sl.layers.forEach(l=>{l.x=W*.045+l.x*.91;l.y=H*.045+l.y*.91;if(l.type==='img'){l.w*=.91;l.h*=.91}else if(l.type==='text'){l.w*=.91;l.size*=.91}});
          if(sl.frameCaptionRegion){const r=sl.frameCaptionRegion;sl.frameCaptionRegion={x:.045+r.x*.91,y:.045+r.y*.91,w:r.w*.91,h:r.h*.91}}
        }
        if(frameTreatment==='fine')sl.layers.filter(l=>l.type==='img').forEach(l=>{l.frameBorder=.55;l.frameBorderColor=bg==='#101012'||bg==='#161616'?'#eeeeee':'#202020'});
        sl.layers.filter(l=>l.frameCaption).forEach(l=>{l.color=captionInk(bg)});
      }
      const sig=signature(slides);
      let score=totalFit/Math.max(fitCount,1)*12 + random()*4;
      if (previous?.signature===sig) score-=100;
      if (previous?.layouts?.join('|')===slides.map(sl=>sl.frameLayout).join('|')) score-=4;
      candidates.push({slides,familyId:family.id,familyName:family.name,signature:sig,score});
    }
    candidates.sort((a,b)=>b.score-a.score);
    return candidates[0];
  }
  return {generate, crop, canSpread, signature, captionLines, heroScore, captionInk};
});
