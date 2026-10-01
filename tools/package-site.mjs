import {readFile,mkdir,copyFile,rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const directory=path.join(root,'.qa/site');
await rm(directory,{recursive:true,force:true});
const html=await readFile(path.join(root,'index.html'),'utf8');
const runtime=html.match(/assets\/runtime\/frame\.[a-f0-9]+\.js/)?.[0];
if(!runtime)throw Error('Missing current runtime');
const bundle=await readFile(path.join(root,runtime),'utf8');
const catalog=bundle.match(/FRAME_LOCATION_DATA_FILE="(cities\.[a-f0-9]+\.json)"/)?.[1];
if(!catalog)throw Error('Missing locality catalog');
// Deploy only the current app and its icons, never test fixtures, sources or
// historical runtimes. Both published entry points share the same bundle.
const files=['index.html','frame/index.html','manifest.webmanifest','apple-touch-icon.png','apple-touch-icon-precomposed.png','frame-fr-192.png','frame-fr-512.png','frame-fr-favicon.png','frame-fr-touch.png','frame/apple-touch-icon.png',runtime,'assets/locations/'+catalog];
for(const file of files){const target=path.join(directory,file);await mkdir(path.dirname(target),{recursive:true});await copyFile(path.join(root,file),target)}
console.log('Packaged '+files.length+' app files');
