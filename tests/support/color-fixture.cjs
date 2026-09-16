const {deflateSync}=require('node:zlib');
function crc(bytes){let c=0xffffffff;for(const byte of bytes){c^=byte;for(let i=0;i<8;i++)c=c&1?0xedb88320^(c>>>1):c>>>1}return (c^0xffffffff)>>>0}
function chunk(type,data){const t=Buffer.from(type),size=Buffer.alloc(4),end=Buffer.alloc(4);size.writeUInt32BE(data.length);end.writeUInt32BE(crc(Buffer.concat([t,data])));return Buffer.concat([size,t,data,end])}
function png(a,b){const w=84,h=112,header=Buffer.alloc(13);header.writeUInt32BE(w,0);header.writeUInt32BE(h,4);header[8]=8;header[9]=2;const raw=Buffer.alloc(h*(w*3+1));for(let y=0;y<h;y++)for(let x=0;x<w;x++){const color=x<w*.75?a:b,i=y*(w*3+1)+1+x*3;raw[i]=color[0];raw[i+1]=color[1];raw[i+2]=color[2]}return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))])}
module.exports={png};
