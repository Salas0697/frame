/* Portable originals + editor state, without base64 copies of large photos. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./project-state.js'):root.FrameProjectState);if(typeof module==='object'&&module.exports)module.exports=api;else root.FrameProjectFile=api})(typeof window==='undefined'?globalThis:window,state=>{
  const magic='FRAME_PROJECT_V1\n',encoder=new TextEncoder(),maxSize=250*1024*1024;
  const cleanPhoto=photo=>{const result={...photo};delete result.url;return result};
  function validate(project){
    if(!Array.isArray(project.photos)||!project.photos.length||project.photos.length>500||!Array.isArray(project.slides)||!project.slides.length||project.slides.length>500)throw Error('Invalid project');
    const ids=new Set(project.photos.map(p=>p.id));if(ids.size!==project.photos.length||project.photos.some(p=>typeof p.id!=='string'||!Number.isFinite(p.aspect)||p.aspect<=0))throw Error('Invalid photos');
    for(const slide of project.slides){
      if(!Array.isArray(slide.layers)||slide.layers.length>1000||typeof slide.bg!=='string')throw Error('Invalid page');
      for(const l of slide.layers){
        if(!['img','text','deco'].includes(l.type)||![l.x,l.y,l.w,l.z].every(n=>Number.isFinite(n)&&Math.abs(n)<1e6))throw Error('Invalid layer');
        if(l.type==='img'&&(!ids.has(l.photo?.id)||!Number.isFinite(l.h)||l.w<=0||l.h<=0))throw Error('Missing photo reference');
        if(l.type==='text'&&(typeof l.text!=='string'||!Number.isFinite(l.size)))throw Error('Invalid text');
      }
    }
  }
  function create(project,files){
    validate(project);if(files.length!==project.photos.length||files.some(f=>!f.size))throw Error('Missing originals');
    const saved=state.snapshot(project);saved.slides.forEach(sl=>sl.layers.forEach(l=>{if(l.type==='img')l.photo={id:l.photo.id}}));
    const manifest={version:1,state:saved,photos:project.photos.map(cleanPhoto),files:files.map(f=>({name:f.name,type:f.type,size:f.size}))};
    const json=encoder.encode(JSON.stringify(manifest)),size=new Uint8Array(4);new DataView(size.buffer).setUint32(0,json.length);
    const file=new File([magic,size,json,...files],'FRAME_proyecto.frame',{type:'application/octet-stream'});
    if(json.length>4*1024*1024||file.size>maxSize)throw Error('Project exceeds 250 MB');return file;
  }
  async function read(file){
    if(file.size>maxSize||file.size<magic.length+4)throw Error('Invalid project file');
    const prefix=await file.slice(0,magic.length+4).arrayBuffer();
    if(new TextDecoder().decode(prefix.slice(0,magic.length))!==magic)throw Error('Not a FRAME project');
    const length=new DataView(prefix).getUint32(magic.length);
    if(length>4*1024*1024||length<2||magic.length+4+length>file.size)throw Error('Invalid manifest');
    const manifest=JSON.parse(await file.slice(magic.length+4,magic.length+4+length).text());
    if(manifest.version!==1||!Array.isArray(manifest.files)||manifest.files.length!==manifest.photos?.length)throw Error('Unsupported project');
    const project={...state.snapshot(manifest.state),photos:manifest.photos};validate(project);
    let offset=magic.length+4+length;
    const files=manifest.files.map(f=>{
      if(!Number.isSafeInteger(f.size)||f.size<=0||offset+f.size>file.size||typeof f.name!=='string'||typeof f.type!=='string')throw Error('Invalid original');
      const original=new File([file.slice(offset,offset+f.size)],f.name,{type:f.type});offset+=f.size;return original;
    });
    if(offset!==file.size)throw Error('Unexpected project data');
    return {project,files};
  }
  return {create,read};
});
