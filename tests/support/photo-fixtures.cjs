// Cache the same photographic originals between suites; never replace a failed
// network fixture with a synthetic image or silently skip an acceptance check.
const fs=require('node:fs/promises'),path=require('node:path');
const pending=new Map();
async function fixtureFetch(url){
 const match=/^https:\/\/picsum\.photos\/id\/(\d+)\/(\d+)\/(\d+)$/.exec(url);
 if(!match)throw Error('Unexpected photographic fixture URL');
 const key=match.slice(1).join('-'),file=path.resolve('.qa/photos',key+'.jpg');
 if(!pending.has(key))pending.set(key,(async()=>{
  try{return await fs.readFile(file)}catch{}
  let error;
  for(let attempt=0;attempt<2;attempt++)try{
   const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
   if(!response.ok)throw Error('Photo fixture unavailable: '+response.status);
   const bytes=Buffer.from(await response.arrayBuffer());
   if(bytes[0]!==255||bytes[1]!==216)throw Error('Photo fixture is not JPEG');
   await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,bytes);return bytes;
  }catch(e){error=e}
  throw error;
 })());
 return new Response(await pending.get(key),{headers:{'Content-Type':'image/jpeg'}});
}
module.exports={fixtureFetch};
