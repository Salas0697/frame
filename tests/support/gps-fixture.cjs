// Synthetic EXIF GPS, not a person's coordinates. Container formats match JPEG/HEIF.
function tiff(lat=4.142,lng=-73.626,big=false){
 const b=Buffer.alloc(128),w16=(v,o)=>big?b.writeUInt16BE(v,o):b.writeUInt16LE(v,o),w32=(v,o)=>big?b.writeUInt32BE(v,o):b.writeUInt32LE(v,o);
 b.write(big?'MM':'II');w16(42,2);w32(8,4);w16(1,8);w16(0x8825,10);w16(4,12);w32(1,14);w32(26,18);w16(4,26);
 for(let i=0;i<4;i++){const o=28+i*12;w16(i+1,o);w16(i%2?5:2,o+2);w32(i%2?3:2,o+4);if(i%2)w32(i===1?80:104,o+8);else b.write(i===0?(lat<0?'S':'N'):(lng<0?'W':'E'),o+8)}
 for(const [value,offset] of [[lat,80],[lng,104]]){const n=Math.abs(value),d=Math.floor(n),m=Math.floor((n-d)*60),sec=Math.round(((n-d)*60-m)*60*1e6);[d,m,sec].forEach((v,i)=>{w32(v,offset+i*8);w32(i===2?1e6:1,offset+i*8+4)})}
 return b;
}
function jpeg(photo,lat,lng,big){const payload=Buffer.concat([Buffer.from('Exif\0\0'),tiff(lat,lng,big)]),head=Buffer.alloc(4);head.writeUInt16BE(0xffe1);head.writeUInt16BE(payload.length+2,2);return Buffer.concat([photo.subarray(0,2),head,payload,photo.subarray(2)])}
function box(kind,...parts){const payload=Buffer.concat(parts),head=Buffer.alloc(8);head.writeUInt32BE(payload.length+8);head.write(kind,4);return Buffer.concat([head,payload])}
function heic(lat,lng){
 const ftyp=box('ftyp',Buffer.from('heic'),Buffer.alloc(4),Buffer.from('mif1heic'));
 const infe=box('infe',Buffer.from([2,0,0,0,0,1,0,0]),Buffer.from('Exif\0'));
 const iinf=box('iinf',Buffer.from([0,0,0,0,0,1]),infe);
 const payload=Buffer.concat([Buffer.alloc(4),tiff(lat,lng,true)]),loc=Buffer.alloc(22);loc[4]=0x44;loc.writeUInt16BE(1,6);loc.writeUInt16BE(1,8);loc.writeUInt16BE(1,12);loc.writeUInt32BE(payload.length,18);
 let meta=box('meta',Buffer.alloc(4),iinf,box('iloc',loc));loc.writeUInt32BE(ftyp.length+meta.length+8,14);meta=box('meta',Buffer.alloc(4),iinf,box('iloc',loc));
 return Buffer.concat([ftyp,meta,box('mdat',payload)]);
}
module.exports={tiff,jpeg,heic};
