!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define("exifr",["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).exifr={})}(this,(function(e){"use strict";function t(e,t,i){return t in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}var i="undefined"!=typeof self?self:global;const s="undefined"!=typeof navigator,n=s&&"undefined"==typeof HTMLImageElement,r=!("undefined"==typeof global||"undefined"==typeof process||!process.versions||!process.versions.node),a=i.Buffer,o=i.BigInt,h=!!a,l=e=>u(e)?void 0:e,f=e=>void 0!==e;function u(e){return void 0===e||(e instanceof Map?0===e.size:0===Object.values(e).filter(f).length)}function d(e){let t=new Error(e);throw delete t.stack,t}function c(e){return""===(e=function(e){for(;e.endsWith("\0");)e=e.slice(0,-1);return e}(e).trim())?void 0:e}function g(e){let t=function(e){let t=0;return e.ifd0.enabled&&(t+=1024),e.exif.enabled&&(t+=2048),e.makerNote&&(t+=2048),e.userComment&&(t+=1024),e.gps.enabled&&(t+=512),e.interop.enabled&&(t+=100),e.ifd1.enabled&&(t+=1024),t+2048}(e);return e.jfif.enabled&&(t+=50),e.xmp.enabled&&(t+=2e4),e.iptc.enabled&&(t+=14e3),e.icc.enabled&&(t+=6e3),t}const p=e=>String.fromCharCode.apply(null,e),m="undefined"!=typeof TextDecoder?new TextDecoder("utf-8"):void 0;function y(e){return m?m.decode(e):h?Buffer.from(e).toString("utf8"):decodeURIComponent(escape(p(e)))}class b{static from(e,t){return e instanceof this&&e.le===t?e:new b(e,void 0,void 0,t)}constructor(e,t=0,i,s){if("boolean"==typeof s&&(this.le=s),Array.isArray(e)&&(e=new Uint8Array(e)),0===e)this.byteOffset=0,this.byteLength=0;else if(e instanceof ArrayBuffer){void 0===i&&(i=e.byteLength-t);let s=new DataView(e,t,i);this._swapDataView(s)}else if(e instanceof Uint8Array||e instanceof DataView||e instanceof b){void 0===i&&(i=e.byteLength-t),(t+=e.byteOffset)+i>e.byteOffset+e.byteLength&&d("Creating view outside of available memory in ArrayBuffer");let s=new DataView(e.buffer,t,i);this._swapDataView(s)}else if("number"==typeof e){let t=new DataView(new ArrayBuffer(e));this._swapDataView(t)}else d("Invalid input argument for BufferView: "+e)}_swapArrayBuffer(e){this._swapDataView(new DataView(e))}_swapBuffer(e){this._swapDataView(new DataView(e.buffer,e.byteOffset,e.byteLength))}_swapDataView(e){this.dataView=e,this.buffer=e.buffer,this.byteOffset=e.byteOffset,this.byteLength=e.byteLength}_lengthToEnd(e){return this.byteLength-e}set(e,t,i=b){return e instanceof DataView||e instanceof b?e=new Uint8Array(e.buffer,e.byteOffset,e.byteLength):e instanceof ArrayBuffer&&(e=new Uint8Array(e)),e instanceof Uint8Array||d("BufferView.set(): Invalid data argument."),this.toUint8().set(e,t),new i(this,t,e.byteLength)}subarray(e,t){return t=t||this._lengthToEnd(e),new b(this,e,t)}toUint8(){return new Uint8Array(this.buffer,this.byteOffset,this.byteLength)}getUint8Array(e,t){return new Uint8Array(this.buffer,this.byteOffset+e,t)}getString(e=0,t=this.byteLength){return y(this.getUint8Array(e,t))}getLatin1String(e=0,t=this.byteLength){let i=this.getUint8Array(e,t);return p(i)}getUnicodeString(e=0,t=this.byteLength){const i=[];for(let s=0;s<t&&e+s<this.byteLength;s+=2)i.push(this.getUint16(e+s));return p(i)}getInt8(e){return this.dataView.getInt8(e)}getUint8(e){return this.dataView.getUint8(e)}getInt16(e,t=this.le){return this.dataView.getInt16(e,t)}getInt32(e,t=this.le){return this.dataView.getInt32(e,t)}getUint16(e,t=this.le){return this.dataView.getUint16(e,t)}getUint32(e,t=this.le){return this.dataView.getUint32(e,t)}getFloat32(e,t=this.le){return this.dataView.getFloat32(e,t)}getFloat64(e,t=this.le){return this.dataView.getFloat64(e,t)}getFloat(e,t=this.le){return this.dataView.getFloat32(e,t)}getDouble(e,t=this.le){return this.dataView.getFloat64(e,t)}getUintBytes(e,t,i){switch(t){case 1:return this.getUint8(e,i);case 2:return this.getUint16(e,i);case 4:return this.getUint32(e,i);case 8:return this.getUint64&&this.getUint64(e,i)}}getUint(e,t,i){switch(t){case 8:return this.getUint8(e,i);case 16:return this.getUint16(e,i);case 32:return this.getUint32(e,i);case 64:return this.getUint64&&this.getUint64(e,i)}}toString(e){return this.dataView.toString(e,this.constructor.name)}ensureChunk(){}}function S(e,t){d(`${e} '${t}' was not loaded, try using full build of exifr.`)}class w extends Map{constructor(e){super(),this.kind=e}get(e,t){return this.has(e)||S(this.kind,e),t&&(e in t||function(e,t){d(`Unknown ${e} '${t}'.`)}(this.kind,e),t[e].enabled||S(this.kind,e)),super.get(e)}keyList(){return Array.from(this.keys())}}var k=new w("file parser"),v=new w("segment parser"),O=new w("file reader");let x=i.fetch;const C="Invalid input argument";function P(e,t){return(i=e).startsWith("data:")||i.length>1e4?U(e,t,"base64"):r&&e.includes("://")?A(e,t,"url",B):r?U(e,t,"fs"):s?A(e,t,"url",B):void d(C);var i}async function A(e,t,i,s){return O.has(i)?U(e,t,i):s?async function(e,t){let i=await t(e);return new b(i)}(e,s):void d(`Parser ${i} is not loaded`)}async function U(e,t,i){let s=new(O.get(i))(e,t);return await s.read(),s}const B=e=>x(e).then((e=>e.arrayBuffer())),I=e=>new Promise(((t,i)=>{let s=new FileReader;s.onloadend=()=>t(s.result||new ArrayBuffer),s.onerror=i,s.readAsArrayBuffer(e)}));class F extends Map{get tagKeys(){return this.allKeys||(this.allKeys=Array.from(this.keys())),this.allKeys}get tagValues(){return this.allValues||(this.allValues=Array.from(this.values())),this.allValues}}function L(e,t,i){let s=new F;for(let[e,t]of i)s.set(e,t);if(Array.isArray(t))for(let i of t)e.set(i,s);else e.set(t,s);return s}function D(e,t,i){let s,n=e.get(t);for(s of i)n.set(s[0],s[1])}const T=new Map,z=new Map,N=new Map,V=37500,M=37510,E=33723,R=34675,j=34665,G=34853,_=40965,H=["chunked","firstChunkSize","firstChunkSizeNode","firstChunkSizeBrowser","chunkSize","chunkLimit"],W=["jfif","xmp","icc","iptc","ihdr"],$=["tiff",...W],K=["ifd0","ifd1","exif","gps","interop"],X=[...$,...K],Y=["makerNote","userComment"],q=["translateKeys","translateValues","reviveValues","multiSegment"],J=[...q,"sanitize","mergeOutput","silentErrors"];class Z{get translate(){return this.translateKeys||this.translateValues||this.reviveValues}}class Q extends Z{get needed(){return this.enabled||this.deps.size>0}constructor(e,i,s,n){if(super(),t(this,"enabled",!1),t(this,"skip",new Set),t(this,"pick",new Set),t(this,"deps",new Set),t(this,"translateKeys",!1),t(this,"translateValues",!1),t(this,"reviveValues",!1),this.key=e,this.enabled=i,this.parse=this.enabled,this.applyInheritables(n),this.canBeFiltered=K.includes(e),this.canBeFiltered&&(this.dict=T.get(e)),void 0!==s)if(Array.isArray(s))this.parse=this.enabled=!0,this.canBeFiltered&&s.length>0&&this.translateTagSet(s,this.pick);else if("object"==typeof s){if(this.enabled=!0,this.parse=!1!==s.parse,this.canBeFiltered){let{pick:e,skip:t}=s;e&&e.length>0&&this.translateTagSet(e,this.pick),t&&t.length>0&&this.translateTagSet(t,this.skip)}this.applyInheritables(s)}else!0===s||!1===s?this.parse=this.enabled=s:d(`Invalid options argument: ${s}`)}applyInheritables(e){let t,i;for(t of q)i=e[t],void 0!==i&&(this[t]=i)}translateTagSet(e,t){if(this.dict){let i,s,{tagKeys:n,tagValues:r}=this.dict;for(i of e)"string"==typeof i?(s=r.indexOf(i),-1===s&&(s=n.indexOf(Number(i))),-1!==s&&t.add(Number(n[s]))):t.add(i)}else for(let i of e)t.add(i)}finalizeFilters(){!this.enabled&&this.deps.size>0?(this.enabled=!0,re(this.pick,this.deps)):this.enabled&&this.pick.size>0&&re(this.pick,this.deps)}}var ee={jfif:!1,tiff:!0,xmp:!1,icc:!1,iptc:!1,ifd0:!0,ifd1:!1,exif:!0,gps:!0,interop:!1,ihdr:void 0,makerNote:!1,userComment:!1,multiSegment:!1,skip:[],pick:[],translateKeys:!0,translateValues:!0,reviveValues:!0,sanitize:!0,mergeOutput:!0,silentErrors:!0,chunked:!0,firstChunkSize:void 0,firstChunkSizeNode:512,firstChunkSizeBrowser:65536,chunkSize:65536,chunkLimit:5},te=new Map;class ie extends Z{static useCached(e){let t=te.get(e);return void 0!==t||(t=new this(e),te.set(e,t)),t}constructor(e){super(),!0===e?this.setupFromTrue():void 0===e?this.setupFromUndefined():Array.isArray(e)?this.setupFromArray(e):"object"==typeof e?this.setupFromObject(e):d(`Invalid options argument ${e}`),void 0===this.firstChunkSize&&(this.firstChunkSize=s?this.firstChunkSizeBrowser:this.firstChunkSizeNode),this.mergeOutput&&(this.ifd1.enabled=!1),this.filterNestedSegmentTags(),this.traverseTiffDependencyTree(),this.checkLoadedPlugins()}setupFromUndefined(){let e;for(e of H)this[e]=ee[e];for(e of J)this[e]=ee[e];for(e of Y)this[e]=ee[e];for(e of X)this[e]=new Q(e,ee[e],void 0,this)}setupFromTrue(){let e;for(e of H)this[e]=ee[e];for(e of J)this[e]=ee[e];for(e of Y)this[e]=!0;for(e of X)this[e]=new Q(e,!0,void 0,this)}setupFromArray(e){let t;for(t of H)this[t]=ee[t];for(t of J)this[t]=ee[t];for(t of Y)this[t]=ee[t];for(t of X)this[t]=new Q(t,!1,void 0,this);this.setupGlobalFilters(e,void 0,K)}setupFromObject(e){let t;for(t of(K.ifd0=K.ifd0||K.image,K.ifd1=K.ifd1||K.thumbnail,Object.assign(this,e),H))this[t]=ne(e[t],ee[t]);for(t of J)this[t]=ne(e[t],ee[t]);for(t of Y)this[t]=ne(e[t],ee[t]);for(t of $)this[t]=new Q(t,ee[t],e[t],this);for(t of K)this[t]=new Q(t,ee[t],e[t],this.tiff);this.setupGlobalFilters(e.pick,e.skip,K,X),!0===e.tiff?this.batchEnableWithBool(K,!0):!1===e.tiff?this.batchEnableWithUserValue(K,e):Array.isArray(e.tiff)?this.setupGlobalFilters(e.tiff,void 0,K):"object"==typeof e.tiff&&this.setupGlobalFilters(e.tiff.pick,e.tiff.skip,K)}batchEnableWithBool(e,t){for(let i of e)this[i].enabled=t}batchEnableWithUserValue(e,t){for(let i of e){let e=t[i];this[i].enabled=!1!==e&&void 0!==e}}setupGlobalFilters(e,t,i,s=i){if(e&&e.length){for(let e of s)this[e].enabled=!1;let t=se(e,i);for(let[e,i]of t)re(this[e].pick,i),this[e].enabled=!0}else if(t&&t.length){let e=se(t,i);for(let[t,i]of e)re(this[t].skip,i)}}filterNestedSegmentTags(){let{ifd0:e,exif:t,xmp:i,iptc:s,icc:n}=this;this.makerNote?t.deps.add(V):t.skip.add(V),this.userComment?t.deps.add(M):t.skip.add(M),i.enabled||e.skip.add(700),s.enabled||e.skip.add(E),n.enabled||e.skip.add(R)}traverseTiffDependencyTree(){let{ifd0:e,exif:t,gps:i,interop:s}=this;s.needed&&(t.deps.add(_),e.deps.add(_)),t.needed&&e.deps.add(j),i.needed&&e.deps.add(G),this.tiff.enabled=K.some((e=>!0===this[e].enabled))||this.makerNote||this.userComment;for(let e of K)this[e].finalizeFilters()}get onlyTiff(){return!W.map((e=>this[e].enabled)).some((e=>!0===e))&&this.tiff.enabled}checkLoadedPlugins(){for(let e of $)this[e].enabled&&!v.has(e)&&S("segment parser",e)}}function se(e,t){let i,s,n,r,a=[];for(n of t){for(r of(i=T.get(n),s=[],i))(e.includes(r[0])||e.includes(r[1]))&&s.push(r[0]);s.length&&a.push([n,s])}return a}function ne(e,t){return void 0!==e?e:void 0!==t?t:void 0}function re(e,t){for(let i of t)e.add(i)}t(ie,"default",ee);class ae{constructor(e){t(this,"parsers",{}),t(this,"output",{}),t(this,"errors",[]),t(this,"pushToErrors",(e=>this.errors.push(e))),this.options=ie.useCached(e)}async read(e){this.file=await function(e,t){return"string"==typeof e?P(e,t):s&&!n&&e instanceof HTMLImageElement?P(e.src,t):e instanceof Uint8Array||e instanceof ArrayBuffer||e instanceof DataView?new b(e):s&&e instanceof Blob?A(e,t,"blob",I):void d(C)}(e,this.options)}setup(){if(this.fileParser)return;let{file:e}=this,t=e.getUint16(0);for(let[i,s]of k)if(s.canHandle(e,t))return this.fileParser=new s(this.options,this.file,this.parsers),e[i]=!0;this.file.close&&this.file.close(),d("Unknown file format")}async parse(){let{output:e,errors:t}=this;return this.setup(),this.options.silentErrors?(await this.executeParsers().catch(this.pushToErrors),t.push(...this.fileParser.errors)):await this.executeParsers(),this.file.close&&this.file.close(),this.options.silentErrors&&t.length>0&&(e.errors=t),l(e)}async executeParsers(){let{output:e}=this;await this.fileParser.parse();let t=Object.values(this.parsers).map((async t=>{let i=await t.parse();t.assignToOutput(e,i)}));this.options.silentErrors&&(t=t.map((e=>e.catch(this.pushToErrors)))),await Promise.all(t)}async extractThumbnail(){this.setup();let{options:e,file:t}=this,i=v.get("tiff",e);var s;if(t.tiff?s={start:0,type:"tiff"}:t.jpeg&&(s=await this.fileParser.getOrFindSegment("tiff")),void 0===s)return;let n=await this.fileParser.ensureSegmentChunk(s),r=this.parsers.tiff=new i(n,e,t),a=await r.extractThumbnail();return t.close&&t.close(),a}}async function oe(e,t){let i=new ae(t);return await i.read(e),i.parse()}var he=Object.freeze({__proto__:null,parse:oe,Exifr:ae,fileParsers:k,segmentParsers:v,fileReaders:O,tagKeys:T,tagValues:z,tagRevivers:N,createDictionary:L,extendDictionary:D,fetchUrlAsArrayBuffer:B,readBlobAsArrayBuffer:I,chunkedProps:H,otherSegments:W,segments:$,tiffBlocks:K,segmentsAndBlocks:X,tiffExtractables:Y,inheritables:q,allFormatters:J,Options:ie});class le{constructor(e,i,s){t(this,"errors",[]),t(this,"ensureSegmentChunk",(async e=>{let t=e.start,i=e.size||65536;if(this.file.chunked)if(this.file.available(t,i))e.chunk=this.file.subarray(t,i);else try{e.chunk=await this.file.readChunk(t,i)}catch(t){d(`Couldn't read segment: ${JSON.stringify(e)}. ${t.message}`)}else this.file.byteLength>t+i?e.chunk=this.file.subarray(t,i):void 0===e.size?e.chunk=this.file.subarray(t):d("Segment unreachable: "+JSON.stringify(e));return e.chunk})),this.extendOptions&&this.extendOptions(e),this.options=e,this.file=i,this.parsers=s}injectSegment(e,t){this.options[e].enabled&&this.createParser(e,t)}createParser(e,t){let i=new(v.get(e))(t,this.options,this.file);return this.parsers[e]=i}createParsers(e){for(let t of e){let{type:e,chunk:i}=t,s=this.options[e];if(s&&s.enabled){let t=this.parsers[e];t&&t.append||t||this.createParser(e,i)}}}async readSegments(e){let t=e.map(this.ensureSegmentChunk);await Promise.all(t)}}class fe{static findPosition(e,t){let i=e.getUint16(t+2)+2,s="function"==typeof this.headerLength?this.headerLength(e,t,i):this.headerLength,n=t+s,r=i-s;return{offset:t,length:i,headerLength:s,start:n,size:r,end:n+r}}static parse(e,t={}){return new this(e,new ie({[this.type]:t}),e).parse()}normalizeInput(e){return e instanceof b?e:new b(e)}constructor(e,i={},s){t(this,"errors",[]),t(this,"raw",new Map),t(this,"handleError",(e=>{if(!this.options.silentErrors)throw e;this.errors.push(e.message)})),this.chunk=this.normalizeInput(e),this.file=s,this.type=this.constructor.type,this.globalOptions=this.options=i,this.localOptions=i[this.type],this.canTranslate=this.localOptions&&this.localOptions.translate}translate(){this.canTranslate&&(this.translated=this.translateBlock(this.raw,this.type))}get output(){return this.translated?this.translated:this.raw?Object.fromEntries(this.raw):void 0}translateBlock(e,t){let i=N.get(t),s=z.get(t),n=T.get(t),r=this.options[t],a=r.reviveValues&&!!i,o=r.translateValues&&!!s,h=r.translateKeys&&!!n,l={};for(let[t,r]of e)a&&i.has(t)?r=i.get(t)(r):o&&s.has(t)&&(r=this.translateValue(r,s.get(t))),h&&n.has(t)&&(t=n.get(t)||t),l[t]=r;return l}translateValue(e,t){return t[e]||t.DEFAULT||e}assignToOutput(e,t){this.assignObjectToOutput(e,this.constructor.type,t)}assignObjectToOutput(e,t,i){if(this.globalOptions.mergeOutput)return Object.assign(e,i);e[t]?Object.assign(e[t],i):e[t]=i}}t(fe,"headerLength",4),t(fe,"type",void 0),t(fe,"multiSegment",!1),t(fe,"canHandle",(()=>!1));function ue(e){return 192===e||194===e||196===e||219===e||221===e||218===e||254===e}function de(e){return e>=224&&e<=239}function ce(e,t,i){for(let[s,n]of v)if(n.canHandle(e,t,i))return s}class ge extends le{constructor(...e){super(...e),t(this,"appSegments",[]),t(this,"jpegSegments",[]),t(this,"unknownSegments",[])}static canHandle(e,t){return 65496===t}async parse(){await this.findAppSegments(),await this.readSegments(this.appSegments),this.mergeMultiSegments(),this.createParsers(this.mergedAppSegments||this.appSegments)}setupSegmentFinderArgs(e){!0===e?(this.findAll=!0,this.wanted=new Set(v.keyList())):(e=void 0===e?v.keyList().filter((e=>this.options[e].enabled)):e.filter((e=>this.options[e].enabled&&v.has(e))),this.findAll=!1,this.remaining=new Set(e),this.wanted=new Set(e)),this.unfinishedMultiSegment=!1}async findAppSegments(e=0,t){this.setupSegmentFinderArgs(t);let{file:i,findAll:s,wanted:n,remaining:r}=this;if(!s&&this.file.chunked&&(s=Array.from(n).some((e=>{let t=v.get(e),i=this.options[e];return t.multiSegment&&i.multiSegment})),s&&await this.file.readWhole()),e=this.findAppSegmentsInRange(e,i.byteLength),!this.options.onlyTiff&&i.chunked){let t=!1;for(;r.size>0&&!t&&(i.canReadNextChunk||this.unfinishedMultiSegment);){let{nextChunkOffset:s}=i,n=this.appSegments.some((e=>!this.file.available(e.offset||e.start,e.length||e.size)));if(t=e>s&&!n?!await i.readNextChunk(e):!await i.readNextChunk(s),void 0===(e=this.findAppSegmentsInRange(e,i.byteLength)))return}}}findAppSegmentsInRange(e,t){t-=2;let i,s,n,r,a,o,{file:h,findAll:l,wanted:f,remaining:u,options:d}=this;for(;e<t;e++)if(255===h.getUint8(e))if(i=h.getUint8(e+1),de(i)){if(s=h.getUint16(e+2),n=ce(h,e,s),n&&f.has(n)&&(r=v.get(n),a=r.findPosition(h,e),o=d[n],a.type=n,this.appSegments.push(a),!l&&(r.multiSegment&&o.multiSegment?(this.unfinishedMultiSegment=a.chunkNumber<a.chunkCount,this.unfinishedMultiSegment||u.delete(n)):u.delete(n),0===u.size)))break;d.recordUnknownSegments&&(a=fe.findPosition(h,e),a.marker=i,this.unknownSegments.push(a)),e+=s+1}else if(ue(i)){if(s=h.getUint16(e+2),218===i&&!1!==d.stopAfterSos)return;d.recordJpegSegments&&this.jpegSegments.push({offset:e,length:s,marker:i}),e+=s+1}return e}mergeMultiSegments(){if(!this.appSegments.some((e=>e.multiSegment)))return;let e=function(e,t){let i,s,n,r=new Map;for(let a=0;a<e.length;a++)i=e[a],s=i[t],r.has(s)?n=r.get(s):r.set(s,n=[]),n.push(i);return Array.from(r)}(this.appSegments,"type");this.mergedAppSegments=e.map((([e,t])=>{let i=v.get(e,this.options);if(i.handleMultiSegments){return{type:e,chunk:i.handleMultiSegments(t)}}return t[0]}))}getSegment(e){return this.appSegments.find((t=>t.type===e))}async getOrFindSegment(e){let t=this.getSegment(e);return void 0===t&&(await this.findAppSegments(0,[e]),t=this.getSegment(e)),t}}t(ge,"type","jpeg"),k.set("jpeg",ge);const pe=[void 0,1,1,2,4,8,1,1,2,4,8,4,8,4];class me extends fe{parseHeader(){var e=this.chunk.getUint16();18761===e?this.le=!0:19789===e&&(this.le=!1),this.chunk.le=this.le,this.headerParsed=!0}parseTags(e,t,i=new Map){let{pick:s,skip:n}=this.options[t];s=new Set(s);let r=s.size>0,a=0===n.size,o=this.chunk.getUint16(e);e+=2;for(let h=0;h<o;h++){let o=this.chunk.getUint16(e);if(r){if(s.has(o)&&(i.set(o,this.parseTag(e,o,t)),s.delete(o),0===s.size))break}else!a&&n.has(o)||i.set(o,this.parseTag(e,o,t));e+=12}return i}parseTag(e,t,i){let{chunk:s}=this,n=s.getUint16(e+2),r=s.getUint32(e+4),a=pe[n];if(a*r<=4?e+=8:e=s.getUint32(e+8),(n<1||n>13)&&d(`Invalid TIFF value type. block: ${i.toUpperCase()}, tag: ${t.toString(16)}, type: ${n}, offset ${e}`),e>s.byteLength&&d(`Invalid TIFF value offset. block: ${i.toUpperCase()}, tag: ${t.toString(16)}, type: ${n}, offset ${e} is outside of chunk size ${s.byteLength}`),1===n)return s.getUint8Array(e,r);if(2===n)return c(s.getString(e,r));if(7===n)return s.getUint8Array(e,r);if(1===r)return this.parseTagValue(n,e);{let t=new(function(e){switch(e){case 1:return Uint8Array;case 3:return Uint16Array;case 4:return Uint32Array;case 5:return Array;case 6:return Int8Array;case 8:return Int16Array;case 9:return Int32Array;case 10:return Array;case 11:return Float32Array;case 12:return Float64Array;default:return Array}}(n))(r),i=a;for(let s=0;s<r;s++)t[s]=this.parseTagValue(n,e),e+=i;return t}}parseTagValue(e,t){let{chunk:i}=this;switch(e){case 1:return i.getUint8(t);case 3:return i.getUint16(t);case 4:return i.getUint32(t);case 5:return i.getUint32(t)/i.getUint32(t+4);case 6:return i.getInt8(t);case 8:return i.getInt16(t);case 9:return i.getInt32(t);case 10:return i.getInt32(t)/i.getInt32(t+4);case 11:return i.getFloat(t);case 12:return i.getDouble(t);case 13:return i.getUint32(t);default:d(`Invalid tiff type ${e}`)}}}class ye extends me{static canHandle(e,t){return 225===e.getUint8(t+1)&&1165519206===e.getUint32(t+4)&&0===e.getUint16(t+8)}async parse(){this.parseHeader();let{options:e}=this;return e.ifd0.enabled&&await this.parseIfd0Block(),e.exif.enabled&&await this.safeParse("parseExifBlock"),e.gps.enabled&&await this.safeParse("parseGpsBlock"),e.interop.enabled&&await this.safeParse("parseInteropBlock"),e.ifd1.enabled&&await this.safeParse("parseThumbnailBlock"),this.createOutput()}safeParse(e){let t=this[e]();return void 0!==t.catch&&(t=t.catch(this.handleError)),t}findIfd0Offset(){void 0===this.ifd0Offset&&(this.ifd0Offset=this.chunk.getUint32(4))}findIfd1Offset(){if(void 0===this.ifd1Offset){this.findIfd0Offset();let e=this.chunk.getUint16(this.ifd0Offset),t=this.ifd0Offset+2+12*e;this.ifd1Offset=this.chunk.getUint32(t)}}parseBlock(e,t){let i=new Map;return this[t]=i,this.parseTags(e,t,i),i}async parseIfd0Block(){if(this.ifd0)return;let{file:e}=this;this.findIfd0Offset(),this.ifd0Offset<8&&d("Malformed EXIF data"),!e.chunked&&this.ifd0Offset>e.byteLength&&d(`IFD0 offset points to outside of file.\nthis.ifd0Offset: ${this.ifd0Offset}, file.byteLength: ${e.byteLength}`),e.tiff&&await e.ensureChunk(this.ifd0Offset,g(this.options));let t=this.parseBlock(this.ifd0Offset,"ifd0");return 0!==t.size?(this.exifOffset=t.get(j),this.interopOffset=t.get(_),this.gpsOffset=t.get(G),this.xmp=t.get(700),this.iptc=t.get(E),this.icc=t.get(R),this.options.sanitize&&(t.delete(j),t.delete(_),t.delete(G),t.delete(700),t.delete(E),t.delete(R)),t):void 0}async parseExifBlock(){if(this.exif)return;if(this.ifd0||await this.parseIfd0Block(),void 0===this.exifOffset)return;this.file.tiff&&await this.file.ensureChunk(this.exifOffset,g(this.options));let e=this.parseBlock(this.exifOffset,"exif");return this.interopOffset||(this.interopOffset=e.get(_)),this.makerNote=e.get(V),this.userComment=e.get(M),this.options.sanitize&&(e.delete(_),e.delete(V),e.delete(M)),this.unpack(e,41728),this.unpack(e,41729),e}unpack(e,t){let i=e.get(t);i&&1===i.length&&e.set(t,i[0])}async parseGpsBlock(){if(this.gps)return;if(this.ifd0||await this.parseIfd0Block(),void 0===this.gpsOffset)return;let e=this.parseBlock(this.gpsOffset,"gps");return e&&e.has(2)&&e.has(4)&&(e.set("latitude",be(...e.get(2),e.get(1))),e.set("longitude",be(...e.get(4),e.get(3)))),e}async parseInteropBlock(){if(!this.interop&&(this.ifd0||await this.parseIfd0Block(),void 0!==this.interopOffset||this.exif||await this.parseExifBlock(),void 0!==this.interopOffset))return this.parseBlock(this.interopOffset,"interop")}async parseThumbnailBlock(e=!1){if(!this.ifd1&&!this.ifd1Parsed&&(!this.options.mergeOutput||e))return this.findIfd1Offset(),this.ifd1Offset>0&&(this.parseBlock(this.ifd1Offset,"ifd1"),this.ifd1Parsed=!0),this.ifd1}async extractThumbnail(){if(this.headerParsed||this.parseHeader(),this.ifd1Parsed||await this.parseThumbnailBlock(!0),void 0===this.ifd1)return;let e=this.ifd1.get(513),t=this.ifd1.get(514);return this.chunk.getUint8Array(e,t)}get image(){return this.ifd0}get thumbnail(){return this.ifd1}createOutput(){let e,t,i,s={};for(t of K)if(e=this[t],!u(e))if(i=this.canTranslate?this.translateBlock(e,t):Object.fromEntries(e),this.options.mergeOutput){if("ifd1"===t)continue;Object.assign(s,i)}else s[t]=i;return this.makerNote&&(s.makerNote=this.makerNote),this.userComment&&(s.userComment=this.userComment),s}assignToOutput(e,t){if(this.globalOptions.mergeOutput)Object.assign(e,t);else for(let[i,s]of Object.entries(t))this.assignObjectToOutput(e,i,s)}}function be(e,t,i,s){var n=e+t/60+i/3600;return"S"!==s&&"W"!==s||(n*=-1),n}t(ye,"type","tiff"),t(ye,"headerLength",10),v.set("tiff",ye);var Se=Object.freeze({__proto__:null,default:he,Exifr:ae,fileParsers:k,segmentParsers:v,fileReaders:O,tagKeys:T,tagValues:z,tagRevivers:N,createDictionary:L,extendDictionary:D,fetchUrlAsArrayBuffer:B,readBlobAsArrayBuffer:I,chunkedProps:H,otherSegments:W,segments:$,tiffBlocks:K,segmentsAndBlocks:X,tiffExtractables:Y,inheritables:q,allFormatters:J,Options:ie,parse:oe});const we={ifd0:!1,ifd1:!1,exif:!1,gps:!1,interop:!1,sanitize:!1,reviveValues:!0,translateKeys:!1,translateValues:!1,mergeOutput:!1},ke=Object.assign({},we,{firstChunkSize:4e4,gps:[1,2,3,4]});async function ve(e){let t=new ae(ke);await t.read(e);let i=await t.parse();if(i&&i.gps){let{latitude:e,longitude:t}=i.gps;return{latitude:e,longitude:t}}}const Oe=Object.assign({},we,{tiff:!1,ifd1:!0,mergeOutput:!1});async function xe(e){let t=new ae(Oe);await t.read(e);let i=await t.extractThumbnail();return i&&h?a.from(i):i}async function Ce(e){let t=await this.thumbnail(e);if(void 0!==t){let e=new Blob([t]);return URL.createObjectURL(e)}}const Pe=Object.assign({},we,{firstChunkSize:4e4,ifd0:[274]});async function Ae(e){let t=new ae(Pe);await t.read(e);let i=await t.parse();if(i&&i.ifd0)return i.ifd0[274]}const Ue=Object.freeze({1:{dimensionSwapped:!1,scaleX:1,scaleY:1,deg:0,rad:0},2:{dimensionSwapped:!1,scaleX:-1,scaleY:1,deg:0,rad:0},3:{dimensionSwapped:!1,scaleX:1,scaleY:1,deg:180,rad:180*Math.PI/180},4:{dimensionSwapped:!1,scaleX:-1,scaleY:1,deg:180,rad:180*Math.PI/180},5:{dimensionSwapped:!0,scaleX:1,scaleY:-1,deg:90,rad:90*Math.PI/180},6:{dimensionSwapped:!0,scaleX:1,scaleY:1,deg:90,rad:90*Math.PI/180},7:{dimensionSwapped:!0,scaleX:1,scaleY:-1,deg:270,rad:270*Math.PI/180},8:{dimensionSwapped:!0,scaleX:1,scaleY:1,deg:270,rad:270*Math.PI/180}});if(e.rotateCanvas=!0,e.rotateCss=!0,"object"==typeof navigator){let t=navigator.userAgent;if(t.includes("iPad")||t.includes("iPhone")){let i=t.match(/OS (\d+)_(\d+)/);if(i){let[,t,s]=i,n=Number(t)+.1*Number(s);e.rotateCanvas=n<13.4,e.rotateCss=!1}}else if(t.includes("OS X 10")){let[,i]=t.match(/OS X 10[_.](\d+)/);e.rotateCanvas=e.rotateCss=Number(i)<15}if(t.includes("Chrome/")){let[,i]=t.match(/Chrome\/(\d+)/);e.rotateCanvas=e.rotateCss=Number(i)<81}else if(t.includes("Firefox/")){let[,i]=t.match(/Firefox\/(\d+)/);e.rotateCanvas=e.rotateCss=Number(i)<77}}async function Be(t){let i=await Ae(t);return Object.assign({canvas:e.rotateCanvas,css:e.rotateCss},Ue[i])}class Ie extends b{constructor(...e){super(...e),t(this,"ranges",new Fe),0!==this.byteLength&&this.ranges.add(0,this.byteLength)}_tryExtend(e,t,i){if(0===e&&0===this.byteLength&&i){let e=new DataView(i.buffer||i,i.byteOffset,i.byteLength);this._swapDataView(e)}else{let i=e+t;if(i>this.byteLength){let{dataView:e}=this._extend(i);this._swapDataView(e)}}}_extend(e){let t;t=h?a.allocUnsafe(e):new Uint8Array(e);let i=new DataView(t.buffer,t.byteOffset,t.byteLength);return t.set(new Uint8Array(this.buffer,this.byteOffset,this.byteLength),0),{uintView:t,dataView:i}}subarray(e,t,i=!1){return t=t||this._lengthToEnd(e),i&&this._tryExtend(e,t),this.ranges.add(e,t),super.subarray(e,t)}set(e,t,i=!1){i&&this._tryExtend(t,e.byteLength,e);let s=super.set(e,t);return this.ranges.add(t,s.byteLength),s}async ensureChunk(e,t){this.chunked&&(this.ranges.available(e,t)||await this.readChunk(e,t))}available(e,t){return this.ranges.available(e,t)}}class Fe{constructor(){t(this,"list",[])}get length(){return this.list.length}add(e,t,i=0){let s=e+t,n=this.list.filter((t=>Le(e,t.offset,s)||Le(e,t.end,s)));if(n.length>0){e=Math.min(e,...n.map((e=>e.offset))),s=Math.max(s,...n.map((e=>e.end))),t=s-e;let i=n.shift();i.offset=e,i.length=t,i.end=s,this.list=this.list.filter((e=>!n.includes(e)))}else this.list.push({offset:e,length:t,end:s})}available(e,t){let i=e+t;return this.list.some((t=>t.offset<=e&&i<=t.end))}}function Le(e,t,i){return e<=t&&t<=i}class De extends Ie{constructor(e,i){super(0),t(this,"chunksRead",0),this.input=e,this.options=i}async readWhole(){this.chunked=!1,await this.readChunk(this.nextChunkOffset)}async readChunked(){this.chunked=!0,await this.readChunk(0,this.options.firstChunkSize)}async readNextChunk(e=this.nextChunkOffset){if(this.fullyRead)return this.chunksRead++,!1;let t=this.options.chunkSize,i=await this.readChunk(e,t);return!!i&&i.byteLength===t}async readChunk(e,t){if(this.chunksRead++,0!==(t=this.safeWrapAddress(e,t)))return this._readChunk(e,t)}safeWrapAddress(e,t){return void 0!==this.size&&e+t>this.size?Math.max(0,this.size-e):t}get nextChunkOffset(){if(0!==this.ranges.list.length)return this.ranges.list[0].length}get canReadNextChunk(){return this.chunksRead<this.options.chunkLimit}get fullyRead(){return void 0!==this.size&&this.nextChunkOffset===this.size}read(){return this.options.chunked?this.readChunked():this.readWhole()}close(){}}O.set("blob",class extends De{async readWhole(){this.chunked=!1;let e=await I(this.input);this._swapArrayBuffer(e)}readChunked(){return this.chunked=!0,this.size=this.input.size,super.readChunked()}async _readChunk(e,t){let i=t?e+t:void 0,s=this.input.slice(e,i),n=await I(s);return this.set(n,e,!0)}});var Te=Object.freeze({__proto__:null,default:Se,Exifr:ae,fileParsers:k,segmentParsers:v,fileReaders:O,tagKeys:T,tagValues:z,tagRevivers:N,createDictionary:L,extendDictionary:D,fetchUrlAsArrayBuffer:B,readBlobAsArrayBuffer:I,chunkedProps:H,otherSegments:W,segments:$,tiffBlocks:K,segmentsAndBlocks:X,tiffExtractables:Y,inheritables:q,allFormatters:J,Options:ie,parse:oe,gpsOnlyOptions:ke,gps:ve,thumbnailOnlyOptions:Oe,thumbnail:xe,thumbnailUrl:Ce,orientationOnlyOptions:Pe,orientation:Ae,rotations:Ue,get rotateCanvas(){return e.rotateCanvas},get rotateCss(){return e.rotateCss},rotation:Be});O.set("url",class extends De{async readWhole(){this.chunked=!1;let e=await B(this.input);e instanceof ArrayBuffer?this._swapArrayBuffer(e):e instanceof Uint8Array&&this._swapBuffer(e)}async _readChunk(e,t){let i=t?e+t-1:void 0,s=this.options.httpHeaders||{};(e||i)&&(s.range=`bytes=${[e,i].join("-")}`);let n=await x(this.input,{headers:s}),r=await n.arrayBuffer(),a=r.byteLength;if(416!==n.status)return a!==t&&(this.size=e+a),this.set(r,e,!0)}});b.prototype.getUint64=function(e){let t=this.getUint32(e),i=this.getUint32(e+4);return t<1048575?t<<32|i:void 0!==typeof o?(console.warn("Using BigInt because of type 64uint but JS can only handle 53b numbers."),o(t)<<o(32)|o(i)):void d("Trying to read 64b value but JS can only handle 53b numbers.")};class ze extends le{parseBoxes(e=0){let t=[];for(;e<this.file.byteLength-4;){let i=this.parseBoxHead(e);if(t.push(i),0===i.length)break;e+=i.length}return t}parseSubBoxes(e){e.boxes=this.parseBoxes(e.start)}findBox(e,t){return void 0===e.boxes&&this.parseSubBoxes(e),e.boxes.find((e=>e.kind===t))}parseBoxHead(e){let t=this.file.getUint32(e),i=this.file.getString(e+4,4),s=e+8;return 1===t&&(t=this.file.getUint64(e+8),s+=8),{offset:e,length:t,kind:i,start:s}}parseBoxFullHead(e){if(void 0!==e.version)return;let t=this.file.getUint32(e.start);e.version=t>>24,e.start+=4}}class Ne extends ze{static canHandle(e,t){if(0!==t)return!1;let i=e.getUint16(2);if(i>50)return!1;let s=16,n=[];for(;s<i;)n.push(e.getString(s,4)),s+=4;return n.includes(this.type)}async parse(){let e=this.file.getUint32(0),t=this.parseBoxHead(e);for(;"meta"!==t.kind;)e+=t.length,await this.file.ensureChunk(e,16),t=this.parseBoxHead(e);await this.file.ensureChunk(t.offset,t.length),this.parseBoxFullHead(t),this.parseSubBoxes(t),this.options.icc.enabled&&await this.findIcc(t),this.options.tiff.enabled&&await this.findExif(t)}async registerSegment(e,t,i){await this.file.ensureChunk(t,i);let s=this.file.subarray(t,i);this.createParser(e,s)}async findIcc(e){let t=this.findBox(e,"iprp");if(void 0===t)return;let i=this.findBox(t,"ipco");if(void 0===i)return;let s=this.findBox(i,"colr");void 0!==s&&await this.registerSegment("icc",s.offset+12,s.length)}async findExif(e){let t=this.findBox(e,"iinf");if(void 0===t)return;let i=this.findBox(e,"iloc");if(void 0===i)return;let s=this.findExifLocIdInIinf(t),n=this.findExtentInIloc(i,s);if(void 0===n)return;let[r,a]=n;await this.file.ensureChunk(r,a);let o=4+this.file.getUint32(r);r+=o,a-=o,await this.registerSegment("tiff",r,a)}findExifLocIdInIinf(e){this.parseBoxFullHead(e);let t,i,s,n,r=e.start,a=this.file.getUint16(r);for(r+=2;a--;){if(t=this.parseBoxHead(r),this.parseBoxFullHead(t),i=t.start,t.version>=2&&(s=3===t.version?4:2,n=this.file.getString(i+s+2,4),"Exif"===n))return this.file.getUintBytes(i,s);r+=t.length}}get8bits(e){let t=this.file.getUint8(e);return[t>>4,15&t]}findExtentInIloc(e,t){this.parseBoxFullHead(e);let i=e.start,[s,n]=this.get8bits(i++),[r,a]=this.get8bits(i++),o=2===e.version?4:2,h=1===e.version||2===e.version?2:0,l=a+s+n,f=2===e.version?4:2,u=this.file.getUintBytes(i,f);for(i+=f;u--;){let e=this.file.getUintBytes(i,o);i+=o+h+2+r;let f=this.file.getUint16(i);if(i+=2,e===t)return f>1&&console.warn("ILOC box has more than one extent but we're only processing one\nPlease create an issue at https://github.com/MikeKovarik/exifr with this file"),[this.file.getUintBytes(i+a,s),this.file.getUintBytes(i+a+s,n)];i+=f*l}}}class Ve extends Ne{}t(Ve,"type","heic");class Me extends Ne{}t(Me,"type","avif"),k.set("heic",Ve),k.set("avif",Me),L(T,["ifd0","ifd1"],[[256,"ImageWidth"],[257,"ImageHeight"],[258,"BitsPerSample"],[259,"Compression"],[262,"PhotometricInterpretation"],[270,"ImageDescription"],[271,"Make"],[272,"Model"],[273,"StripOffsets"],[274,"Orientation"],[277,"SamplesPerPixel"],[278,"RowsPerStrip"],[279,"StripByteCounts"],[282,"XResolution"],[283,"YResolution"],[284,"PlanarConfiguration"],[296,"ResolutionUnit"],[301,"TransferFunction"],[305,"Software"],[306,"ModifyDate"],[315,"Artist"],[316,"HostComputer"],[317,"Predictor"],[318,"WhitePoint"],[319,"PrimaryChromaticities"],[513,"ThumbnailOffset"],[514,"ThumbnailLength"],[529,"YCbCrCoefficients"],[530,"YCbCrSubSampling"],[531,"YCbCrPositioning"],[532,"ReferenceBlackWhite"],[700,"ApplicationNotes"],[33432,"Copyright"],[33723,"IPTC"],[34665,"ExifIFD"],[34675,"ICC"],[34853,"GpsIFD"],[330,"SubIFD"],[40965,"InteropIFD"],[40091,"XPTitle"],[40092,"XPComment"],[40093,"XPAuthor"],[40094,"XPKeywords"],[40095,"XPSubject"]]),L(T,"exif",[[33434,"ExposureTime"],[33437,"FNumber"],[34850,"ExposureProgram"],[34852,"SpectralSensitivity"],[34855,"ISO"],[34858,"TimeZoneOffset"],[34859,"SelfTimerMode"],[34864,"SensitivityType"],[34865,"StandardOutputSensitivity"],[34866,"RecommendedExposureIndex"],[34867,"ISOSpeed"],[34868,"ISOSpeedLatitudeyyy"],[34869,"ISOSpeedLatitudezzz"],[36864,"ExifVersion"],[36867,"DateTimeOriginal"],[36868,"CreateDate"],[36873,"GooglePlusUploadCode"],[36880,"OffsetTime"],[36881,"OffsetTimeOriginal"],[36882,"OffsetTimeDigitized"],[37121,"ComponentsConfiguration"],[37122,"CompressedBitsPerPixel"],[37377,"ShutterSpeedValue"],[37378,"ApertureValue"],[37379,"BrightnessValue"],[37380,"ExposureCompensation"],[37381,"MaxApertureValue"],[37382,"SubjectDistance"],[37383,"MeteringMode"],[37384,"LightSource"],[37385,"Flash"],[37386,"FocalLength"],[37393,"ImageNumber"],[37394,"SecurityClassification"],[37395,"ImageHistory"],[37396,"SubjectArea"],[37500,"MakerNote"],[37510,"UserComment"],[37520,"SubSecTime"],[37521,"SubSecTimeOriginal"],[37522,"SubSecTimeDigitized"],[37888,"AmbientTemperature"],[37889,"Humidity"],[37890,"Pressure"],[37891,"WaterDepth"],[37892,"Acceleration"],[37893,"CameraElevationAngle"],[40960,"FlashpixVersion"],[40961,"ColorSpace"],[40962,"ExifImageWidth"],[40963,"ExifImageHeight"],[40964,"RelatedSoundFile"],[41483,"FlashEnergy"],[41486,"FocalPlaneXResolution"],[41487,"FocalPlaneYResolution"],[41488,"FocalPlaneResolutionUnit"],[41492,"SubjectLocation"],[41493,"ExposureIndex"],[41495,"SensingMethod"],[41728,"FileSource"],[41729,"SceneType"],[41730,"CFAPattern"],[41985,"CustomRendered"],[41986,"ExposureMode"],[41987,"WhiteBalance"],[41988,"DigitalZoomRatio"],[41989,"FocalLengthIn35mmFormat"],[41990,"SceneCaptureType"],[41991,"GainControl"],[41992,"Contrast"],[41993,"Saturation"],[41994,"Sharpness"],[41996,"SubjectDistanceRange"],[42016,"ImageUniqueID"],[42032,"OwnerName"],[42033,"SerialNumber"],[42034,"LensInfo"],[42035,"LensMake"],[42036,"LensModel"],[42037,"LensSerialNumber"],[42080,"CompositeImage"],[42081,"CompositeImageCount"],[42082,"CompositeImageExposureTimes"],[42240,"Gamma"],[59932,"Padding"],[59933,"OffsetSchema"],[65e3,"OwnerName"],[65001,"SerialNumber"],[65002,"Lens"],[65100,"RawFile"],[65101,"Converter"],[65102,"WhiteBalance"],[65105,"Exposure"],[65106,"Shadows"],[65107,"Brightness"],[65108,"Contrast"],[65109,"Saturation"],[65110,"Sharpness"],[65111,"Smoothness"],[65112,"MoireFilter"],[40965,"InteropIFD"]]),L(T,"gps",[[0,"GPSVersionID"],[1,"GPSLatitudeRef"],[2,"GPSLatitude"],[3,"GPSLongitudeRef"],[4,"GPSLongitude"],[5,"GPSAltitudeRef"],[6,"GPSAltitude"],[7,"GPSTimeStamp"],[8,"GPSSatellites"],[9,"GPSStatus"],[10,"GPSMeasureMode"],[11,"GPSDOP"],[12,"GPSSpeedRef"],[13,"GPSSpeed"],[14,"GPSTrackRef"],[15,"GPSTrack"],[16,"GPSImgDirectionRef"],[17,"GPSImgDirection"],[18,"GPSMapDatum"],[19,"GPSDestLatitudeRef"],[20,"GPSDestLatitude"],[21,"GPSDestLongitudeRef"],[22,"GPSDestLongitude"],[23,"GPSDestBearingRef"],[24,"GPSDestBearing"],[25,"GPSDestDistanceRef"],[26,"GPSDestDistance"],[27,"GPSProcessingMethod"],[28,"GPSAreaInformation"],[29,"GPSDateStamp"],[30,"GPSDifferential"],[31,"GPSHPositioningError"]]),L(z,["ifd0","ifd1"],[[274,{1:"Horizontal (normal)",2:"Mirror horizontal",3:"Rotate 180",4:"Mirror vertical",5:"Mirror horizontal and rotate 270 CW",6:"Rotate 90 CW",7:"Mirror horizontal and rotate 90 CW",8:"Rotate 270 CW"}],[296,{1:"None",2:"inches",3:"cm"}]]);let Ee=L(z,"exif",[[34850,{0:"Not defined",1:"Manual",2:"Normal program",3:"Aperture priority",4:"Shutter priority",5:"Creative program",6:"Action program",7:"Portrait mode",8:"Landscape mode"}],[37121,{0:"-",1:"Y",2:"Cb",3:"Cr",4:"R",5:"G",6:"B"}],[37383,{0:"Unknown",1:"Average",2:"CenterWeightedAverage",3:"Spot",4:"MultiSpot",5:"Pattern",6:"Partial",255:"Other"}],[37384,{0:"Unknown",1:"Daylight",2:"Fluorescent",3:"Tungsten (incandescent light)",4:"Flash",9:"Fine weather",10:"Cloudy weather",11:"Shade",12:"Daylight fluorescent (D 5700 - 7100K)",13:"Day white fluorescent (N 4600 - 5400K)",14:"Cool white fluorescent (W 3900 - 4500K)",15:"White fluorescent (WW 3200 - 3700K)",17:"Standard light A",18:"Standard light B",19:"Standard light C",20:"D55",21:"D65",22:"D75",23:"D50",24:"ISO studio tungsten",255:"Other"}],[37385,{0:"Flash did not fire",1:"Flash fired",5:"Strobe return light not detected",7:"Strobe return light detected",9:"Flash fired, compulsory flash mode",13:"Flash fired, compulsory flash mode, return light not detected",15:"Flash fired, compulsory flash mode, return light detected",16:"Flash did not fire, compulsory flash mode",24:"Flash did not fire, auto mode",25:"Flash fired, auto mode",29:"Flash fired, auto mode, return light not detected",31:"Flash fired, auto mode, return light detected",32:"No flash function",65:"Flash fired, red-eye reduction mode",69:"Flash fired, red-eye reduction mode, return light not detected",71:"Flash fired, red-eye reduction mode, return light detected",73:"Flash fired, compulsory flash mode, red-eye reduction mode",77:"Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",79:"Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",89:"Flash fired, auto mode, red-eye reduction mode",93:"Flash fired, auto mode, return light not detected, red-eye reduction mode",95:"Flash fired, auto mode, return light detected, red-eye reduction mode"}],[41495,{1:"Not defined",2:"One-chip color area sensor",3:"Two-chip color area sensor",4:"Three-chip color area sensor",5:"Color sequential area sensor",7:"Trilinear sensor",8:"Color sequential linear sensor"}],[41728,{1:"Film Scanner",2:"Reflection Print Scanner",3:"Digital Camera"}],[41729,{1:"Directly photographed"}],[41985,{0:"Normal",1:"Custom",2:"HDR (no original saved)",3:"HDR (original saved)",4:"Original (for HDR)",6:"Panorama",7:"Portrait HDR",8:"Portrait"}],[41986,{0:"Auto",1:"Manual",2:"Auto bracket"}],[41987,{0:"Auto",1:"Manual"}],[41990,{0:"Standard",1:"Landscape",2:"Portrait",3:"Night",4:"Other"}],[41991,{0:"None",1:"Low gain up",2:"High gain up",3:"Low gain down",4:"High gain down"}],[41996,{0:"Unknown",1:"Macro",2:"Close",3:"Distant"}],[42080,{0:"Unknown",1:"Not a Composite Image",2:"General Composite Image",3:"Composite Image Captured While Shooting"}]]);const Re={1:"No absolute unit of measurement",2:"Inch",3:"Centimeter"};Ee.set(37392,Re),Ee.set(41488,Re);const je={0:"Normal",1:"Low",2:"High"};function Ge(e){return"object"==typeof e&&void 0!==e.length?e[0]:e}function _e(e){let t=Array.from(e).slice(1);return t[1]>15&&(t=t.map((e=>String.fromCharCode(e)))),"0"!==t[2]&&0!==t[2]||t.pop(),t.join(".")}function He(e){if("string"==typeof e){var[t,i,s,n,r,a]=e.trim().split(/[-: ]/g).map(Number),o=new Date(t,i-1,s);return Number.isNaN(n)||Number.isNaN(r)||Number.isNaN(a)||(o.setHours(n),o.setMinutes(r),o.setSeconds(a)),Number.isNaN(+o)?e:o}}function We(e){if("string"==typeof e)return e;let t=[];if(0===e[1]&&0===e[e.length-1])for(let i=0;i<e.length;i+=2)t.push($e(e[i+1],e[i]));else for(let i=0;i<e.length;i+=2)t.push($e(e[i],e[i+1]));return c(String.fromCodePoint(...t))}function $e(e,t){return e<<8|t}Ee.set(41992,je),Ee.set(41993,je),Ee.set(41994,je),L(N,["ifd0","ifd1"],[[50827,function(e){return"string"!=typeof e?y(e):e}],[306,He],[40091,We],[40092,We],[40093,We],[40094,We],[40095,We]]),L(N,"exif",[[40960,_e],[36864,_e],[36867,He],[36868,He],[40962,Ge],[40963,Ge]]),L(N,"gps",[[0,e=>Array.from(e).join(".")],[7,e=>Array.from(e).join(":")]]);const Ke="http://ns.adobe.com/",Xe="http://ns.adobe.com/xmp/extension/";class Ye extends fe{static canHandle(e,t){return 225===e.getUint8(t+1)&&1752462448===e.getUint32(t+4)&&e.getString(t+4,Ke.length)===Ke}static headerLength(e,t){return e.getString(t+4,Xe.length)===Xe?79:4+"http://ns.adobe.com/xap/1.0/".length+1}static findPosition(e,t){let i=super.findPosition(e,t);return i.multiSegment=i.extended=79===i.headerLength,i.multiSegment?(i.chunkCount=e.getUint8(t+72),i.chunkNumber=e.getUint8(t+76),0!==e.getUint8(t+77)&&i.chunkNumber++):(i.chunkCount=1/0,i.chunkNumber=-1),i}static handleMultiSegments(e){return e.map((e=>e.chunk.getString())).join("")}normalizeInput(e){return"string"==typeof e?e:b.from(e).getString()}parse(e=this.chunk){if(!this.localOptions.parse)return e;e=function(e){let t={},i={};for(let e of rt)t[e]=[],i[e]=0;return e.replace(at,((e,s,n)=>{if("<"===s){let s=++i[n];return t[n].push(s),`${e}#${s}`}return`${e}#${t[n].pop()}`}))}(e);let t=Ze.findAll(e,"rdf","Description");0===t.length&&t.push(new Ze("rdf","Description",void 0,e));let i,s={};for(let e of t)for(let t of e.properties)i=it(t.ns,s),Qe(t,i);return function(e){let t;for(let i in e)t=e[i]=l(e[i]),void 0===t&&delete e[i];return l(e)}(s)}assignToOutput(e,t){if(this.localOptions.parse)for(let[i,s]of Object.entries(t))switch(i){case"tiff":this.assignObjectToOutput(e,"ifd0",s);break;case"exif":this.assignObjectToOutput(e,"exif",s);break;case"xmlns":break;default:this.assignObjectToOutput(e,i,s)}else e.xmp=t}}t(Ye,"type","xmp"),t(Ye,"multiSegment",!0),v.set("xmp",Ye);class qe{static findAll(e){return st(e,/([a-zA-Z0-9-]+):([a-zA-Z0-9-]+)=("[^"]*"|'[^']*')/gm).map(qe.unpackMatch)}static unpackMatch(e){let t=e[1],i=e[2],s=e[3].slice(1,-1);return s=nt(s),new qe(t,i,s)}constructor(e,t,i){this.ns=e,this.name=t,this.value=i}serialize(){return this.value}}const Je="[\\w\\d-]+";class Ze{static findAll(e,t,i){if(void 0!==t||void 0!==i){t=t||Je,i=i||Je;var s=new RegExp(`<(${t}):(${i})(#\\d+)?((\\s+?[\\w\\d-:]+=("[^"]*"|'[^']*'))*\\s*)(\\/>|>([\\s\\S]*?)<\\/\\1:\\2\\3>)`,"gm")}else s=/<([\w\d-]+):([\w\d-]+)(#\d+)?((\s+?[\w\d-:]+=("[^"]*"|'[^']*'))*\s*)(\/>|>([\s\S]*?)<\/\1:\2\3>)/gm;return st(e,s).map(Ze.unpackMatch)}static unpackMatch(e){let t=e[1],i=e[2],s=e[4],n=e[8];return new Ze(t,i,s,n)}constructor(e,t,i,s){this.ns=e,this.name=t,this.attrString=i,this.innerXml=s,this.attrs=qe.findAll(i),this.children=Ze.findAll(s),this.value=0===this.children.length?nt(s):void 0,this.properties=[...this.attrs,...this.children]}get isPrimitive(){return void 0!==this.value&&0===this.attrs.length&&0===this.children.length}get isListContainer(){return 1===this.children.length&&this.children[0].isList}get isList(){let{ns:e,name:t}=this;return"rdf"===e&&("Seq"===t||"Bag"===t||"Alt"===t)}get isListItem(){return"rdf"===this.ns&&"li"===this.name}serialize(){if(0===this.properties.length&&void 0===this.value)return;if(this.isPrimitive)return this.value;if(this.isListContainer)return this.children[0].serialize();if(this.isList)return tt(this.children.map(et));if(this.isListItem&&1===this.children.length&&0===this.attrs.length)return this.children[0].serialize();let e={};for(let t of this.properties)Qe(t,e);return void 0!==this.value&&(e.value=this.value),l(e)}}function Qe(e,t){let i=e.serialize();void 0!==i&&(t[e.name]=i)}var et=e=>e.serialize(),tt=e=>1===e.length?e[0]:e,it=(e,t)=>t[e]?t[e]:t[e]={};function st(e,t){let i,s=[];if(!e)return s;for(;null!==(i=t.exec(e));)s.push(i);return s}function nt(e){if(function(e){return null==e||"null"===e||"undefined"===e||""===e||""===e.trim()}(e))return;let t=Number(e);if(!Number.isNaN(t))return t;let i=e.toLowerCase();return"true"===i||"false"!==i&&e.trim()}const rt=["rdf:li","rdf:Seq","rdf:Bag","rdf:Alt","rdf:Description"],at=new RegExp(`(<|\\/)(${rt.join("|")})`,"g");e.Exifr=ae,e.Options=ie,e.allFormatters=J,e.chunkedProps=H,e.createDictionary=L,e.default=Te,e.extendDictionary=D,e.fetchUrlAsArrayBuffer=B,e.fileParsers=k,e.fileReaders=O,e.gps=ve,e.gpsOnlyOptions=ke,e.inheritables=q,e.orientation=Ae,e.orientationOnlyOptions=Pe,e.otherSegments=W,e.parse=oe,e.readBlobAsArrayBuffer=I,e.rotation=Be,e.rotations=Ue,e.segmentParsers=v,e.segments=$,e.segmentsAndBlocks=X,e.tagKeys=T,e.tagRevivers=N,e.tagValues=z,e.thumbnail=xe,e.thumbnailOnlyOptions=Oe,e.thumbnailUrl=Ce,e.tiffBlocks=K,e.tiffExtractables=Y,Object.defineProperty(e,"__esModule",{value:!0})}));

;

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const SAVE_KEY='frame_director_project_v1';
const FONTS=[['sf','Sans'],['serif','Editorial'],['mono','Mono'],['display','Display'],['rounded','Rounded'],['condensed','Condensed']];
const PLACEHOLDERS=['TITLE','AUG 2026','WEEKEND','NIGHT FILES','MOMENTS','VOL. 01','CITY NOTES','MEMORIES','LATE SUMMER','LOCATION'];
let S={photos:[],slides:[],currentSlide:0,selected:null,selectedType:null,history:[],future:[],randomMode:'all',showSafe:false,finish:'clean',photoEditMode:'crop'};
const uid=()=>Math.random().toString(36).slice(2,10), rnd=(a,b)=>a+Math.random()*(b-a), ri=(a,b)=>Math.floor(rnd(a,b+1)), pick=a=>a[ri(0,a.length-1)], clone=o=>JSON.parse(JSON.stringify(o));
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),1450)}
function ff(id){return id==='serif'?'Georgia,Times,serif':id==='mono'?'ui-monospace,SFMono-Regular,Menlo,monospace':id==='display'?'Impact,Arial Black,sans-serif':id==='rounded'?'Arial Rounded MT Bold,-apple-system,sans-serif':id==='condensed'?'Arial Narrow,Helvetica Neue Condensed,sans-serif':'-apple-system,BlinkMacSystemFont,Arial,sans-serif'}
function imgSize(){return[340,425]}
function framePreviewWidth(){const top=($('#canvasWrap')?.getBoundingClientRect().top||0)+(window.scrollY||0);return Math.min(innerWidth-36,380,Math.max(220,innerHeight-top-190)*.8)}
function selectedSlide(){return S.slides[S.currentSlide]}
function currentLayer(){return selectedSlide()?.layers.find(l=>l.id===S.selected)}
function pushHistory(){S.history.push(clone({slides:S.slides,currentSlide:S.currentSlide,randomMode:S.randomMode,showSafe:S.showSafe,finish:S.finish,frameTemplateFamily:S.frameTemplateFamily||'',frameCaption:S.frameCaption||'',frameArtDirection:S.frameArtDirection||'',frameLastDesign:S.frameLastDesign||null,frameBackground:S.frameBackground||'auto',frameTreatment:S.frameTreatment||'gallery',heroPhotoId:S.heroPhotoId||null,frameLocation:S.frameLocation||null}));if(S.history.length>40)S.history.shift();S.future=[];updateUndo()}
function applySnap(x){S.slides=x.slides;S.currentSlide=x.currentSlide;S.randomMode=x.randomMode;S.showSafe=x.showSafe;S.finish=x.finish;S.frameLocation=x.frameLocation||null;S.selected=null}
function undo(){if(!S.history.length)return;S.future.push(clone({slides:S.slides,currentSlide:S.currentSlide,randomMode:S.randomMode,showSafe:S.showSafe,finish:S.finish,frameTemplateFamily:S.frameTemplateFamily||'',frameCaption:S.frameCaption||'',frameArtDirection:S.frameArtDirection||'',frameLastDesign:S.frameLastDesign||null,frameBackground:S.frameBackground||'auto',frameTreatment:S.frameTreatment||'gallery',heroPhotoId:S.heroPhotoId||null,frameLocation:S.frameLocation||null}));applySnap(S.history.pop());renderAll()}
function redo(){if(!S.future.length)return;S.history.push(clone({slides:S.slides,currentSlide:S.currentSlide,randomMode:S.randomMode,showSafe:S.showSafe,finish:S.finish,frameTemplateFamily:S.frameTemplateFamily||'',frameCaption:S.frameCaption||'',frameArtDirection:S.frameArtDirection||'',frameLastDesign:S.frameLastDesign||null,frameBackground:S.frameBackground||'auto',frameTreatment:S.frameTreatment||'gallery',heroPhotoId:S.heroPhotoId||null,frameLocation:S.frameLocation||null}));applySnap(S.future.pop());renderAll()}
function updateUndo(){$('#undoBtn').style.display=$('#redoBtn').style.display=S.slides.length?'block':'none';$('#undoBtn').disabled=!S.history.length;$('#redoBtn').disabled=!S.future.length}
function saveProject(){try{localStorage.setItem(SAVE_KEY,JSON.stringify({...S,history:[],future:[]}));return true}catch(error){console.warn('Project storage unavailable',error);return false}}
function loadProject(){try{const raw=localStorage.getItem(SAVE_KEY);if(!raw)return false;Object.assign(S,JSON.parse(raw));return true}catch(e){return false}}
function luma([r,g,b]){return .2126*r+.7152*g+.0722*b}
function contrastText(rgb){return luma(rgb)>150?'#111111':'#ffffff'}
function avg(a){return Math.round(a.reduce((s,x)=>s+x,0)/Math.max(1,a.length))}
function hslToRgb(h,s,l){let c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2,r=0,g=0,b=0;if(h<60){r=c;g=x}else if(h<120){r=x;g=c}else if(h<180){g=c;b=x}else if(h<240){g=x;b=c}else if(h<300){r=x;b=c}else{r=c;b=x}return [Math.round((r+m)*255),Math.round((g+m)*255),Math.round((b+m)*255)]}
function rgbToCss(rgb){return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`}
function palFromPhoto(meta){const base=meta.avg;const dark=[Math.max(0,base[0]-90),Math.max(0,base[1]-90),Math.max(0,base[2]-90)];const light=[Math.min(255,base[0]+95),Math.min(255,base[1]+95),Math.min(255,base[2]+95)];const hue=((Math.atan2(base[1]-128,base[0]-128)*180/Math.PI)+360)%360;const accent1=hslToRgb((hue+40)%360,.8,.58), accent2=hslToRgb((hue+200)%360,.75,.62);const bright=luma(base);return bright>128?[light,dark,accent1,accent2]:[dark,light,accent1,accent2]}
async function loadImage(url){return await new Promise((res,rej)=>{const i=new Image();const timer=setTimeout(()=>{i.onload=i.onerror=null;i.src='';rej(new Error('Image decode timed out'))},15000);i.onload=()=>{clearTimeout(timer);res(i)};i.onerror=e=>{clearTimeout(timer);rej(e)};i.src=url})}
async function analyzePhoto(photo){const img=await loadImage(photo.url);const c=document.createElement('canvas');const w=42,h=42;c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0,w,h);const d=x.getImageData(0,0,w,h).data;let rs=[],gs=[],bs=[], brightness=[], grid=Array(9).fill(0), n=0;for(let yy=0;yy<h;yy++){for(let xx=0;xx<w;xx++){const i=(yy*w+xx)*4,r=d[i],g=d[i+1],b=d[i+2];rs.push(r);gs.push(g);bs.push(b);const br=(r+g+b)/3;brightness.push(br);const cell=Math.floor(yy/(h/3))*3+Math.floor(xx/(w/3));grid[cell]+=Math.abs(br-(brightness[brightness.length-2]||br));n++;}}
let lapEnergy=0;for(let yy=1;yy<h-1;yy++)for(let xx=1;xx<w-1;xx++){const i=yy*w+xx;const lap=4*brightness[i]-brightness[i-1]-brightness[i+1]-brightness[i-w]-brightness[i+w];lapEnergy+=lap*lap}const sharpness=lapEnergy/((w-2)*(h-2));
const avgRgb=[avg(rs),avg(gs),avg(bs)], mean=avg(brightness), variance=brightness.reduce((s,v)=>s+(v-mean)*(v-mean),0)/brightness.length;const centerWeight=variance + (Math.abs(img.width/img.height-1)<.4?20:0) + Math.min(img.width,img.height)/80;return {...photo,w:img.width,h:img.height,aspect:img.width/img.height,avg:avgRgb,brightness:mean,variance,grid,palette:palFromPhoto({avg:avgRgb}),score:centerWeight,sharpness};}
function bestTextPos(meta,boxW,boxH){const cellSize=[(340-boxW-28)/2,(425-boxH-28)/2];let best=0, min=1e12; meta.grid.forEach((v,i)=>{if(v<min){min=v;best=i}}); const col=best%3,row=Math.floor(best/3); const x=14+col*((340-boxW-28)/2); const y=18+row*((425-boxH-36)/2); return {x:Math.max(12,Math.min(340-boxW-12,x)),y:Math.max(16,Math.min(425-boxH-16,y))};}
function makeImg(photo,x,y,w,h,opt={}){return {id:uid(),type:'img',photo,x,y,w,h,z:10,rot:opt.rot??rnd(-6,6),zoom:opt.zoom??1,offX:opt.offX??0,offY:opt.offY??0,hidden:false,locked:false,moveMode:'crop'}}
function makeText(text,x,y,w,size,color,font,weight,rot=0){return {id:uid(),type:'text',text,x,y,w,size,color,font,weight,rot,z:40,hidden:false,locked:false}}
function makeDeco(kind,x,y,w,h,color,rot=0){return {id:uid(),type:'deco',kind,x,y,w,h,color,rot,z:20,hidden:false,locked:true}}
function heroPhoto(){return [...S.photos].sort((a,b)=>b.score-a.score)[0]||S.photos[0]}
// The import controller and remix buttons share the same storyboard owner.
function buildSlides(){return window.FRAME_generateStory()}
function renderAll(){if(window.FramePhotoLocation&&window.FrameTemplateEngine)FramePhotoLocation.decorate(S.slides,S.frameLocation,FrameTemplateEngine.captionInk);renderStats();renderToolbar();renderStage();renderFilmstrip();updateUndo();renderSheets();saveProject()}
function renderStats(){$('#stats').textContent=`${S.photos.length} fotos · ${S.slides.length} slides`;$('#modeLabel').textContent=`${S.finish} · ${S.randomMode}`;$('#slideCountRange').value=S.slides.length}
function renderToolbar(){$$('#controlBar [data-mode]').forEach(b=>b.classList.toggle('on',b.dataset.mode===S.randomMode));$('#safeBtn').classList.toggle('on',S.showSafe);$$('#finishRow .choice').forEach(b=>b.classList.toggle('on',b.dataset.finish===S.finish))}
function renderStage(){const [W,H]=imgSize(), sw=framePreviewWidth(), sc=sw/W; const stage=$('#stage'); stage.innerHTML=''; S.slides.forEach((sl,si)=>{const d=document.createElement('div'); d.className='slide'+(S.showSafe?' showSafe':''); d.dataset.slide=si; d.dataset.layout=sl.frameLayout||''; d.dataset.family=sl.frameFamily||''; d.style.width=sw+'px';d.style.height=sw*1.25+'px';d.style.background=sl.bg; d.style.filter=finishFilter(); sl.layers.sort((a,b)=>a.z-b.z).forEach(l=>{if(l.hidden)return; if(l.type==='img'){const {box,im:img}=FrameCrop.imageElement(l,l.w*sc,l.h*sc);img.className='frameLayer imgLayer'+(S.selected===l.id?' sel':'');img.dataset.id=l.id;img.dataset.photoId=l.photo.id;img.dataset.slide=si;box.style.left=l.x*sc+'px';box.style.top=l.y*sc+'px';box.style.zIndex=l.z;d.appendChild(box);} else if(l.type==='text'){const t=document.createElement('div'); t.className='textLayer'+(l.frameLocation?' locationLabel':'')+(S.selected===l.id?' sel':''); t.dataset.id=l.id; t.dataset.slide=si; t.textContent=l.text; t.style.left=(l.x*sc)+'px'; t.style.top=(l.y*sc)+'px'; t.style.width=(l.w*sc)+'px'; t.style.fontSize=(l.size*sc)+'px'; t.style.color=l.color; t.style.fontFamily=ff(l.font); t.style.fontWeight=l.weight; t.style.transform=`rotate(${l.rot}deg)`; t.style.zIndex=l.z; d.appendChild(t);} else {const e=document.createElement('div'); e.className='decoLayer'; e.style.left=(l.x*sc)+'px'; e.style.top=(l.y*sc)+'px'; e.style.width=(l.w*sc)+'px'; e.style.height=(l.h*sc)+'px'; e.style.background=l.color; e.style.zIndex=l.z; e.style.transform=`rotate(${l.rot}deg)`; e.style.borderRadius=l.kind==='circle'?'50%':(l.kind==='line'?'999px':'10px'); d.appendChild(e);}}); const safe=document.createElement('div'); safe.className='safe'; const num=document.createElement('div'); num.className='slideNo'; num.textContent=String(si+1).padStart(2,'0'); const badge=document.createElement('button'); badge.className='badge'; badge.textContent=sl.favorite?'★':'☆'; badge.onclick=(e)=>{e.stopPropagation();pushHistory();sl.favorite=!sl.favorite;renderAll()}; d.appendChild(safe); d.appendChild(num); d.appendChild(badge);const pin=document.createElement('button');pin.className='pagePin';pin.textContent=sl.frameLocked?'Fijada':'Fijar';pin.setAttribute('aria-label',(sl.frameLocked?'Liberar':'Fijar')+' página '+(si+1));pin.setAttribute('aria-pressed',String(!!sl.frameLocked));pin.onclick=e=>{e.stopPropagation();window.FRAME_togglePageLock(si)};d.appendChild(pin);stage.appendChild(d);}); bindStageScroll(); bindObjects()}
function finishFilter(){if(S.finish==='film')return 'contrast(1.02) saturate(.88) sepia(.13)'; if(S.finish==='soft')return 'contrast(.96) saturate(.93) brightness(1.02)'; if(S.finish==='mono')return 'grayscale(1) contrast(1.05)'; if(S.finish==='punchy')return 'contrast(1.08) saturate(1.18)'; return 'none'}
function renderFilmstrip(){
 const fs=$('#filmstrip');fs.innerHTML='';
 S.slides.forEach((sl,i)=>{
  const b=document.createElement('button');b.className='thumb'+(i===S.currentSlide?' on':'');b.setAttribute('aria-label','Página '+(i+1)+(sl.frameLocked?' · fijada':''));
  const mini=document.createElement('div');mini.className='miniPage';mini.style.cssText='position:absolute;inset:0;overflow:hidden;background:'+sl.bg;mini.style.filter=finishFilter();
  const sc=64/340;
  for(const l of [...sl.layers].filter(l=>!l.hidden).sort((a,b)=>a.z-b.z)){
   let el;
   if(l.type==='img'){el=FrameCrop.imageElement(l,l.w*sc,l.h*sc).box;el.classList.add('miniPhoto')}
   else {el=document.createElement('div');el.style.position='absolute';el.style.width=l.w*sc+'px';el.style.transform='rotate('+(l.rot||0)+'deg)';
    if(l.type==='text'){el.textContent=l.text;Object.assign(el.style,{fontFamily:ff(l.font),fontSize:l.size*sc+'px',fontWeight:l.weight,color:l.color,whiteSpace:'pre-wrap',lineHeight:'.9'})}
    else {el.style.height=l.h*sc+'px';el.style.background=l.color;el.style.borderRadius=l.kind==='circle'?'50%':'0'}
   }
   el.style.left=l.x*sc+'px';el.style.top=l.y*sc+'px';el.style.zIndex=l.z;mini.append(el);
  }
  b.append(mini);const n=document.createElement('div');n.className='thumbnum';n.textContent=(sl.frameLocked?'• ':'')+(i+1);b.append(n);b.onclick=()=>goToSlide(i);fs.append(b);
 });enableThumbDrag()
}
function goToSlide(i){S.currentSlide=Math.max(0,Math.min(S.slides.length-1,i)); const el=$(`.slide[data-slide="${S.currentSlide}"]`); if(el)el.scrollIntoView({behavior:'smooth',inline:'start'}); renderFilmstrip(); renderSheets(); saveProject()}
function bindStageScroll(){const wrap=$('#canvasWrap'); wrap.onscroll=()=>{const slideW=Math.min(innerWidth-36,380)+12; const i=Math.round(wrap.scrollLeft/slideW); if(i!==S.currentSlide){S.currentSlide=Math.max(0,Math.min(S.slides.length-1,i)); renderFilmstrip(); renderSheets();}}}
function openSheet(id){closeSheets(); $(id).classList.add('on')} function closeSheets(){$$('.sheet').forEach(s=>s.classList.remove('on'))} $$('.closeSheet').forEach(b=>b.onclick=closeSheets)
function renderSheets(){renderTextSheet(); renderPhotoSheet(); renderSlideSheet()}
function renderTextSheet(){const l=currentLayer(); if(!l||l.type!=='text') return; $('#textInput').value=l.text; $('#sizeRange').value=l.size; $('#fontRow').innerHTML=FONTS.map(([id,n])=>`<button class="choice ${l.font===id?'on':''}" data-font="${id}">${n}</button>`).join(''); $$('#weightRow .choice').forEach(b=>b.classList.toggle('on',+b.dataset.weight===l.weight)); const colors=[...new Set(selectedSlide().palette.map(rgbToCss))]; $('#colorRow').innerHTML=colors.map(c=>`<button class="dot ${l.color===c?'on':''}" data-color="${c}" style="background:${c}"></button>`).join(''); $('#lockTextBtn').textContent=l.locked?'Desbloquear':'Bloquear'; $('#toggleTextBtn').textContent=l.hidden?'Mostrar':'Ocultar'}
function renderPhotoSheet(){const l=currentLayer(); if(!l||l.type!=='img') return; $('#zoomRange').value=l.zoom; $('#lockPhotoBtn').textContent=l.locked?'Desbloquear':'Bloquear'; $('#togglePhotoBtn').textContent=l.hidden?'Mostrar':'Ocultar'; $('#moveModeBtn').classList.toggle('on',S.photoEditMode==='move'); $('#cropModeBtn').classList.toggle('on',S.photoEditMode==='crop'); $('#photoTray').innerHTML=S.photos.map(p=>`<img src="${p.url}" data-photoid="${p.id}">`).join(''); $$('#photoTray img').forEach(img=>img.onclick=()=>{pushHistory(); l.photo=S.photos.find(p=>p.id===img.dataset.photoid); renderAll(); toast('Foto reemplazada')})}
function renderSlideSheet(){$('#favoriteSlideBtn').textContent=selectedSlide()?.favorite?'Quitar favorito':'Favorito'}
function bindObjects(){ $$('.textLayer').forEach(el=>bindText(el)); $$('.imgLayer').forEach(el=>bindImg(el)); }
function bindText(el){ const slideI=+el.dataset.slide, id=el.dataset.id; let st={mode:null,sx:0,sy:0,bx:0,by:0,sd:0,sa:0,ss:0,sr:0}; el.onclick=()=>{S.currentSlide=slideI;S.selected=id;S.selectedType='text';renderStage();renderFilmstrip();renderTextSheet();openSheet('#textSheet')}; el.ondblclick=el.onclick; el.addEventListener('touchstart',e=>{const l=S.slides[slideI].layers.find(x=>x.id===id); if(!l||l.locked)return; S.currentSlide=slideI; S.selected=id; S.selectedType='text'; if(e.touches.length===1){st.mode='drag'; st.sx=e.touches[0].clientX; st.sy=e.touches[0].clientY; st.bx=l.x; st.by=l.y;} if(e.touches.length===2){const[a,b]=e.touches; st.mode='pinch'; st.sd=Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY); st.sa=Math.atan2(b.clientY-a.clientY,b.clientX-a.clientX); st.ss=l.size; st.sr=l.rot; st.bx=l.x; st.by=l.y; st.sx=(a.clientX+b.clientX)/2; st.sy=(a.clientY+b.clientY)/2;}},{passive:true}); el.addEventListener('touchmove',e=>{const l=S.slides[slideI].layers.find(x=>x.id===id); if(!l||l.locked)return; const sc=framePreviewWidth()/340; if(st.mode==='drag'&&e.touches.length===1){e.preventDefault(); l.x=st.bx+(e.touches[0].clientX-st.sx)/sc; l.y=st.by+(e.touches[0].clientY-st.sy)/sc; renderStage()} if((st.mode==='pinch'||e.touches.length===2)&&e.touches.length===2){e.preventDefault(); const[a,b]=e.touches, d=Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY), ang=Math.atan2(b.clientY-a.clientY,b.clientX-a.clientX); const midX=(a.clientX+b.clientX)/2, midY=(a.clientY+b.clientY)/2; l.size=Math.max(14,Math.min(160,st.ss*(d/st.sd))); l.rot=st.sr+((ang-st.sa)*180/Math.PI); l.x=st.bx+(midX-st.sx)/sc; l.y=st.by+(midY-st.sy)/sc; renderStage()}},{passive:false}); el.addEventListener('touchend',()=>saveProject()) }
function bindImg(el){ const slideI=+el.dataset.slide, id=el.dataset.id; let st={mode:null,sx:0,sy:0,bx:0,by:0,bmx:0,bmy:0,sd:0,sz:1}; el.onclick=()=>{S.currentSlide=slideI;S.selected=id;S.selectedType='img';renderStage();renderFilmstrip();renderPhotoSheet();openSheet('#photoSheet')}; el.ondblclick=()=>{const l=S.slides[slideI].layers.find(x=>x.id===id); if(!l)return; pushHistory(); l.zoom=1; l.offX=0; l.offY=0; renderAll(); toast('Reset foto')}; el.addEventListener('touchstart',e=>{const l=S.slides[slideI].layers.find(x=>x.id===id); if(!l||l.locked)return; S.currentSlide=slideI; S.selected=id; S.selectedType='img'; if(e.touches.length===1){st.mode='drag'; st.sx=e.touches[0].clientX; st.sy=e.touches[0].clientY; st.bx=l.offX; st.by=l.offY; st.bmx=l.x; st.bmy=l.y;} if(e.touches.length===2){const[a,b]=e.touches; st.mode='pinch'; st.sd=Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY); st.sz=l.zoom; st.bx=l.offX; st.by=l.offY; st.sx=(a.clientX+b.clientX)/2; st.sy=(a.clientY+b.clientY)/2; st.bmx=l.x; st.bmy=l.y;}},{passive:true}); el.addEventListener('touchmove',e=>{const l=S.slides[slideI].layers.find(x=>x.id===id); if(!l||l.locked)return; const sc=framePreviewWidth()/340; if(st.mode==='drag'&&e.touches.length===1){e.preventDefault(); const dx=e.touches[0].clientX-st.sx, dy=e.touches[0].clientY-st.sy; if(S.photoEditMode==='move'){l.x=st.bmx+dx/sc; l.y=st.bmy+dy/sc;} else {l.offX=Math.max(-48,Math.min(48,st.bx+dx*.12)); l.offY=Math.max(-48,Math.min(48,st.by+dy*.12));} renderStage()} if((st.mode==='pinch'||e.touches.length===2)&&e.touches.length===2){e.preventDefault(); const[a,b]=e.touches, dist=Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY), midX=(a.clientX+b.clientX)/2, midY=(a.clientY+b.clientY)/2; l.zoom=Math.max(1,Math.min(3,st.sz*(dist/st.sd))); if(S.photoEditMode==='move'){l.x=st.bmx+(midX-st.sx)/sc; l.y=st.bmy+(midY-st.sy)/sc;} else {l.offX=Math.max(-48,Math.min(48,st.bx+(midX-st.sx)*.12)); l.offY=Math.max(-48,Math.min(48,st.by+(midY-st.sy)*.12));} renderStage()}},{passive:false}); el.addEventListener('touchend',()=>saveProject()) }
function enableThumbDrag(){const thumbs=[...document.querySelectorAll('.thumb')]; thumbs.forEach((t,i)=>{t.dataset.index=i; let active=false,timer=null,sx=0,sy=0; t.addEventListener('touchstart',e=>{sx=e.touches[0].clientX; sy=e.touches[0].clientY; timer=setTimeout(()=>{active=true; t.style.transform='scale(1.06)'; if(navigator.vibrate)navigator.vibrate(10)},260)},{passive:true}); t.addEventListener('touchmove',e=>{if(!active){ if(Math.hypot(e.touches[0].clientX-sx,e.touches[0].clientY-sy)>12) clearTimeout(timer); return;} e.preventDefault(); const hit=document.elementFromPoint(e.touches[0].clientX,e.touches[0].clientY)?.closest?.('.thumb'); if(hit&&hit!==t){const a=+t.dataset.index,b=+hit.dataset.index;if(Number.isFinite(a)&&Number.isFinite(b)&&a!==b){const item=S.slides.splice(a,1)[0]; S.slides.splice(b,0,item); S.currentSlide=b; renderAll();}}},{passive:false}); t.addEventListener('touchend',()=>{clearTimeout(timer); if(active){active=false;t.style.transform='';saveProject();}})})}
$('#textInput').oninput=e=>{const l=currentLayer(); if(l){l.text=e.target.value; renderStage(); saveProject()}}; $('#sizeRange').oninput=e=>{const l=currentLayer(); if(l){l.size=+e.target.value; renderStage(); saveProject()}}; $('#fontRow').onclick=e=>{const b=e.target.closest('.choice'),l=currentLayer(); if(!b||!l)return; pushHistory(); l.font=b.dataset.font; renderTextSheet(); renderStage()}; $('#weightRow').onclick=e=>{const b=e.target.closest('.choice'),l=currentLayer(); if(!b||!l)return; pushHistory(); l.weight=+b.dataset.weight; renderTextSheet(); renderStage()}; $('#colorRow').onclick=e=>{const b=e.target.closest('.dot'),l=currentLayer(); if(!b||!l)return; pushHistory(); l.color=b.dataset.color; renderTextSheet(); renderStage()}; $('#toggleTextBtn').onclick=()=>{const l=currentLayer(); if(!l)return; pushHistory(); l.hidden=!l.hidden; renderAll()}; $('#lockTextBtn').onclick=()=>{const l=currentLayer(); if(!l)return; pushHistory(); l.locked=!l.locked; renderAll()}; $('#deleteTextBtn').onclick=()=>{const sl=selectedSlide(); if(!sl)return; pushHistory(); sl.layers=sl.layers.filter(l=>l.id!==S.selected); S.selected=null; closeSheets(); renderAll()};
$('#zoomRange').oninput=e=>{const l=currentLayer(); if(l){l.zoom=+e.target.value; renderStage(); saveProject()}}; $('#moveModeBtn').onclick=()=>{S.photoEditMode='move'; renderPhotoSheet()}; $('#cropModeBtn').onclick=()=>{S.photoEditMode='crop'; renderPhotoSheet()}; $('#centerPhotoBtn').onclick=()=>{const l=currentLayer(); if(!l)return; pushHistory(); l.offX=0;l.offY=0; renderStage(); saveProject()}; $('#togglePhotoBtn').onclick=()=>{const l=currentLayer(); if(!l)return; pushHistory(); l.hidden=!l.hidden; renderAll()}; $('#lockPhotoBtn').onclick=()=>{const l=currentLayer(); if(!l)return; pushHistory(); l.locked=!l.locked; renderAll()}; $('#deletePhotoBtn').onclick=()=>{const sl=selectedSlide(); if(!sl)return; pushHistory(); sl.layers=sl.layers.filter(l=>l.id!==S.selected); S.selected=null; closeSheets(); renderAll()};
$('#textBtn').onclick=()=>{if(!S.slides.length)return; pushHistory(); const [W,H]=imgSize(); const sl=selectedSlide(); const t=makeText(pick(PLACEHOLDERS),rnd(16,120),rnd(30,H-100),rnd(120,250),rnd(24,56),pick(sl.palette.map(rgbToCss)),pick(FONTS)[0],pick([400,700,900])); sl.layers.push(t); S.selected=t.id; S.selectedType='text'; renderAll(); openSheet('#textSheet')}; $('#photoBtn').onclick=()=>{const l=currentLayer(); if(l&&l.type==='img')openSheet('#photoSheet'); else toast('Toca una foto')}; $('#slideBtn').onclick=()=>openSheet('#slideSheet'); $('#exportBtn').onclick=()=>openSheet('#exportSheet'); $('#finishBtn').onclick=()=>openSheet('#finishSheet'); $('#undoBtn').onclick=undo; $('#redoBtn').onclick=redo; $('#newBtn').onclick=()=>{if(confirm('¿Crear proyecto nuevo?')){localStorage.removeItem(SAVE_KEY); location.reload()}};
$('#controlBar').onclick=e=>{const b=e.target.closest('[data-mode]'); if(!b)return; S.randomMode=b.dataset.mode; renderToolbar(); saveProject()}; $('#directorBtn').onclick=()=>{pushHistory(); buildSlides(); renderAll(); toast('Director mode')}; $('#safeBtn').onclick=()=>{S.showSafe=!S.showSafe; renderAll()}; $('#slidesBtn').onclick=()=>openSheet('#slideSheet'); $('#randomBtn').onclick=()=>{if(!S.slides.length)return; pushHistory(); if(S.randomMode==='all'||S.randomMode==='layout'){buildSlides()} else if(S.randomMode==='color'){S.slides.forEach(sl=>{const p=sl.layers.find(l=>l.type==='img')?.photo||hero; const pal=palFromPhoto(p); sl.palette=pal; sl.bg=rgbToCss(pal[0]); const ink=contrastText(pal[0]); sl.layers.forEach(l=>{if(l.type==='text'&&!l.locked)l.color=Math.random()<.7?ink:rgbToCss(pick(pal.slice(2))); if(l.type==='deco')l.color=rgbToCss(pick(pal.slice(2)));})})} else if(S.randomMode==='type'){S.slides.forEach(sl=>sl.layers.forEach(l=>{if(l.type==='text'&&!l.locked){l.font=pick(FONTS)[0]; l.weight=pick([400,700,900]); l.size=rnd(16,62); l.rot=rnd(-8,8)}}))} renderAll(); toast('Random listo')};
$('#prevSlideBtn').onclick=()=>moveSlide(-1); $('#nextSlideBtn').onclick=()=>moveSlide(1); function moveSlide(dir){const i=S.currentSlide,j=i+dir;if(j<0||j>=S.slides.length)return; pushHistory(); [S.slides[i],S.slides[j]]=[S.slides[j],S.slides[i]]; S.currentSlide=j; renderAll()}
$('#dupSlideBtn').onclick=()=>{if(S.slides.length>=12)return toast('Máximo 12 slides'); pushHistory(); const c=clone(selectedSlide()); c.id=uid(); c.layers.forEach(l=>l.id=uid()); S.slides.splice(S.currentSlide+1,0,c); S.currentSlide++; renderAll()}; $('#delSlideBtn').onclick=()=>{if(S.slides.length<=1)return toast('No puedes borrar el último'); pushHistory(); S.slides.splice(S.currentSlide,1); S.currentSlide=Math.max(0,S.currentSlide-1); renderAll()}; $('#remixSlideBtn').onclick=()=>{pushHistory(); const old=S.slides[S.currentSlide].favorite; const cache=S.slides.length; const prevPhotos=S.photos; S.slides[S.currentSlide]=(()=>{let cur=S.slides; buildSlides(); let sl=S.slides[0]; S.slides=cur; return sl})(); S.slides[S.currentSlide].favorite=old; renderAll(); toast('Slide rehecho')}; $('#favoriteSlideBtn').onclick=()=>{pushHistory(); selectedSlide().favorite=!selectedSlide().favorite; renderAll()}; $('#slideCountRange').oninput=e=>{const val=+e.target.value; if(val===S.slides.length)return; pushHistory(); while(S.slides.length<val){buildSlides(); if(S.slides.length>0) S.slides.push(clone(S.slides[0]));} while(S.slides.length>val)S.slides.pop(); renderAll()};
$('#finishRow').onclick=e=>{const b=e.target.closest('[data-finish]'); if(!b)return; S.finish=b.dataset.finish; renderAll()};
async function renderSlideToFile(i){const sl=S.slides[i], [BW,BH]=imgSize(), W=1080,H=1350,sc=W/BW; const cv=document.createElement('canvas'); cv.width=W; cv.height=H; const x=cv.getContext('2d'); x.fillStyle=sl.bg; x.fillRect(0,0,W,H); x.filter=finishCanvasFilter(); for(const l of sl.layers.filter(l=>!l.hidden).sort((a,b)=>a.z-b.z)){ if(l.type==='img'){const im=await loadImage(l.photo.url); x.save();x.translate((l.x+l.w/2)*sc,(l.y+l.h/2)*sc);x.rotate(l.rot*Math.PI/180);x.beginPath();x.rect(-l.w*sc/2,-l.h*sc/2,l.w*sc,l.h*sc);x.clip();const g=FrameCrop.geometry(l,l.w*sc,l.h*sc);x.drawImage(im,-l.w*sc/2+g.x,-l.h*sc/2+g.y,g.w,g.h);x.restore();if(l.frameBorder){x.save();x.translate((l.x+l.w/2)*sc,(l.y+l.h/2)*sc);x.rotate(l.rot*Math.PI/180);x.strokeStyle=l.frameBorderColor||'#202020';x.lineWidth=l.frameBorder*sc;x.strokeRect(-l.w*sc/2,-l.h*sc/2,l.w*sc,l.h*sc);x.restore()}} if(l.type==='deco'){x.save(); x.translate((l.x+l.w/2)*sc,(l.y+l.h/2)*sc); x.rotate(l.rot*Math.PI/180); x.fillStyle=l.color; if(l.kind==='circle'){x.beginPath(); x.arc(0,0,l.w*sc/2,0,Math.PI*2); x.fill()} else {x.fillRect(-l.w*sc/2,-l.h*sc/2,l.w*sc,l.h*sc)} x.restore()} } x.filter='none'; for(const l of sl.layers.filter(l=>l.type==='text'&&!l.hidden).sort((a,b)=>a.z-b.z)){ x.save(); x.translate(l.x*sc,l.y*sc); x.rotate(l.rot*Math.PI/180); x.fillStyle=l.color; x.font=`${l.weight} ${Math.round(l.size*sc)}px ${ff(l.font)}`; x.textBaseline='top'; if(l.frameCaption||l.frameLocation)l.text.split('\n').forEach((line,j)=>x.fillText(line,0,j*l.size*sc*.9));else wrapText(x,l.text,0,0,l.w*sc,l.size*sc*.9); x.restore() } if(S.finish==='film'){x.fillStyle='rgba(245,230,190,.06)'; x.fillRect(0,0,W,H); addGrain(x,W,H,.06)} if(S.finish==='mono'){x.globalCompositeOperation='saturation';} const blob=await new Promise(res=>cv.toBlob(res,'image/png')); return new File([blob],`FRAME_${String(i+1).padStart(2,'0')}.png`,{type:'image/png'})}
function finishCanvasFilter(){if(S.finish==='film')return 'contrast(1.02) saturate(.88) sepia(.13)'; if(S.finish==='soft')return 'contrast(.96) saturate(.93) brightness(1.02)'; if(S.finish==='mono')return 'grayscale(1) contrast(1.05)'; if(S.finish==='punchy')return 'contrast(1.08) saturate(1.18)'; return 'none'}
function addGrain(ctx,W,H,a){for(let i=0;i<1800;i++){ctx.fillStyle=`rgba(0,0,0,${Math.random()*a})`; const x=Math.random()*W,y=Math.random()*H,s=Math.random()*2; ctx.fillRect(x,y,s,s)}}
function wrapText(ctx,t,x,y,w,lh){const words=t.split(' '); let line=''; for(const q of words){const test=line+q+' '; if(ctx.measureText(test).width>w&&line){ctx.fillText(line,x,y); line=q+' '; y+=lh}else line=test} ctx.fillText(line,x,y)}
function crcTable(){let t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0}return t} const CT=crcTable(); function crc32(u){let c=0xffffffff; for(let i=0;i<u.length;i++) c=CT[(c^u[i])&255]^(c>>>8); return(c^0xffffffff)>>>0} function u16(v){return new Uint8Array([v&255,(v>>>8)&255])} function u32(v){return new Uint8Array([v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255])} function cat(ps){let n=ps.reduce((s,p)=>s+p.length,0),o=new Uint8Array(n),pos=0; for(const p of ps){o.set(p,pos); pos+=p.length} return o}
async function zipFiles(files){let locals=[],centrals=[],offset=0,enc=new TextEncoder(); for(const f of files){const name=enc.encode(f.name), data=new Uint8Array(await f.arrayBuffer()), crc=crc32(data); const local=cat([u32(0x04034b50),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(data.length),u32(data.length),u16(name.length),u16(0),name,data]); locals.push(local); const cen=cat([u32(0x02014b50),u16(20),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(data.length),u32(data.length),u16(name.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),name]); centrals.push(cen); offset+=local.length} const central=cat(centrals), end=cat([u32(0x06054b50),u16(0),u16(0),u16(files.length),u16(files.length),u32(central.length),u32(offset),u16(0)]); return new Blob([...locals,central,end],{type:'application/zip'})}
async function shareFiles(files,title){if(navigator.share && (!navigator.canShare || navigator.canShare({files}))) {await navigator.share({files,title}); return true} return false}
$('#exportCurrentBtn').onclick=async()=>{try{toast('Preparando…'); const f=await renderSlideToFile(S.currentSlide); if(!(await shareFiles([f],'FRAME slide'))){const a=document.createElement('a'); a.href=URL.createObjectURL(f); a.download=f.name; a.click();}}catch(e){toast('No se pudo exportar')}}; $('#exportAllBtn').onclick=async()=>{try{toast('Preparando…'); let files=[]; for(let i=0;i<S.slides.length;i++) files.push(await renderSlideToFile(i)); if(!(await shareFiles(files,'FRAME carrusel'))){const z=await zipFiles(files); const a=document.createElement('a'); a.href=URL.createObjectURL(z); a.download='FRAME_export.zip'; a.click();}}catch(e){if(e.name!=='AbortError')toast('No se pudo exportar')}};
try{$('#resumeBtn').style.display=localStorage.getItem(SAVE_KEY)?'block':'none'}catch(e){$('#resumeBtn').style.display='none'}

;
window.FRAME_TEMPLATE_CATALOG={"schemaVersion":1,"status":"runtime","researchedAt":"2026-09-14","referenceCommit":"dc04e1ef7b8d86cc2bda734d7a028dce305e8ff4","coordinateSystem":{"units":"fractions_of_each_page","origin":"top_left","canvasAspect":[4,5],"slots":"unrotated_image_rectangles","rotation":"degrees_about_center; validate_bounds_after_rotation","sourceSlice":"normalized_region_of_one_shared_composite_crop; continuous variants reuse a single photo intentionally"},"sources":{"user_reference":{"type":"user_supplied_screenshot","appIdentity":"unknown","observed":"One carousel page with nine photos, white margins, fine gutters and a small footer caption"},"scrl":{"url":"https://apps.apple.com/us/app/scrl-photo-collage-maker/id1289057196","supports":"Structured and freeform collages, seamless panoramic carousels"},"unfold":{"url":"https://play.google.com/store/apps/details?hl=en_US&id=com.moonlab.unfold","supports":"Template collections including Film; customizable text and backgrounds"},"tezza":{"url":"https://apps.apple.com/us/app/tezza-aesthetic-photo-editor/id1393061654","supports":"Film, editorial, magazine, moodboard and minimal template families"},"canva":{"url":"https://www.canva.com/photo-collages/templates/","supports":"Minimalist, travel, scrapbook and instant-photo-style collage examples"}},"selection":{"weightsMeaning":"Product hypotheses based on user preference, not usage statistics; renormalize after eligibility and brief filters","weightScope":"Primary album family, not independent random style on every page","capacity":"photoCount refers to distinct photos required for this variant","coverage":"Every selected photo must appear; never silently discard or duplicate to fill a grid","caption":"Optional user supplied text only; absent text leaves whitespace","density":"Evaluate outer whitespace separately from photos per page","crop":"Reject unsafe subject crops even when a template is otherwise preferred","anotherOption":"Reuse files, analysis and brief; vary sequence and layout without forcing a different family","integrationBoundary":"After PhotoImportController brief and analysis; no additional file event handlers"},"families":[{"id":"museum_notes","name":"Museum Notes","priority":1,"initialWeight":30,"preferPurpose":["memory","showcase","story"],"preferVibe":["clean","natural"],"variants":[{"id":"museum_9","photoCount":9,"pageSpan":1,"slots":[{"x":0.08,"y":0.065,"w":0.274667,"h":0.265733},{"x":0.362667,"y":0.065,"w":0.274667,"h":0.265733},{"x":0.645333,"y":0.065,"w":0.274667,"h":0.265733},{"x":0.08,"y":0.337133,"w":0.274667,"h":0.265733},{"x":0.362667,"y":0.337133,"w":0.274667,"h":0.265733},{"x":0.645333,"y":0.337133,"w":0.274667,"h":0.265733},{"x":0.08,"y":0.609267,"w":0.274667,"h":0.265733},{"x":0.362667,"y":0.609267,"w":0.274667,"h":0.265733},{"x":0.645333,"y":0.609267,"w":0.274667,"h":0.265733}],"captionRegion":{"x":0.08,"y":0.9,"w":0.84,"h":0.06}},{"id":"museum_6","photoCount":6,"pageSpan":1,"slots":[{"x":0.08,"y":0.065,"w":0.416,"h":0.265733},{"x":0.504,"y":0.065,"w":0.416,"h":0.265733},{"x":0.08,"y":0.337133,"w":0.416,"h":0.265733},{"x":0.504,"y":0.337133,"w":0.416,"h":0.265733},{"x":0.08,"y":0.609267,"w":0.416,"h":0.265733},{"x":0.504,"y":0.609267,"w":0.416,"h":0.265733}],"captionRegion":{"x":0.08,"y":0.9,"w":0.84,"h":0.06}},{"id":"museum_4","photoCount":4,"pageSpan":1,"slots":[{"x":0.08,"y":0.065,"w":0.416,"h":0.4018},{"x":0.504,"y":0.065,"w":0.416,"h":0.4018},{"x":0.08,"y":0.4732,"w":0.416,"h":0.4018},{"x":0.504,"y":0.4732,"w":0.416,"h":0.4018}],"captionRegion":{"x":0.08,"y":0.9,"w":0.84,"h":0.06}}],"background":"#ffffff","sourceIds":["user_reference","scrl","canva"],"rotationDegrees":0},{"id":"gallery_book","name":"Gallery Book","priority":1,"initialWeight":20,"preferPurpose":["memory","story","impact"],"preferVibe":["clean","natural"],"variants":[{"id":"gallery_center","photoCount":1,"pageSpan":1,"slots":[{"x":0.08,"y":0.08,"w":0.84,"h":0.76}],"captionRegion":{"x":0.08,"y":0.9,"w":0.84,"h":0.06}},{"id":"gallery_offset","photoCount":1,"pageSpan":1,"slots":[{"x":0.08,"y":0.08,"w":0.73,"h":0.77}],"captionRegion":{"x":0.08,"y":0.9,"w":0.84,"h":0.06}}],"background":"#ffffff","sourceIds":["unfold","canva"]},{"id":"editorial_pair","name":"Editorial Pair","priority":1,"initialWeight":18,"preferPurpose":["story","memory"],"preferVibe":["clean","natural"],"variants":[{"id":"pair_vertical","photoCount":2,"pageSpan":1,"slots":[{"x":0.08,"y":0.12,"w":0.416,"h":0.7},{"x":0.504,"y":0.12,"w":0.416,"h":0.7}]},{"id":"pair_horizontal","photoCount":2,"pageSpan":1,"slots":[{"x":0.08,"y":0.08,"w":0.84,"h":0.3968},{"x":0.08,"y":0.4832,"w":0.84,"h":0.3968}]},{"id":"triptych","photoCount":3,"pageSpan":1,"slots":[{"x":0.08,"y":0.2,"w":0.274667,"h":0.55},{"x":0.362667,"y":0.2,"w":0.274667,"h":0.55},{"x":0.645333,"y":0.2,"w":0.274667,"h":0.55}]}],"background":"#ffffff","sourceIds":["scrl","tezza"]},{"id":"film_archive","name":"Film Archive","priority":2,"initialWeight":8,"preferPurpose":["memory","story"],"preferVibe":["natural","bold"],"variants":[{"id":"film_strip_3","photoCount":3,"pageSpan":1,"slots":[{"x":0.17,"y":0.06,"w":0.66,"h":0.276},{"x":0.17,"y":0.352,"w":0.66,"h":0.276},{"x":0.17,"y":0.644,"w":0.66,"h":0.276}]},{"id":"film_contact_6","photoCount":6,"pageSpan":1,"slots":[{"x":0.06,"y":0.06,"w":0.43,"h":0.276},{"x":0.51,"y":0.06,"w":0.43,"h":0.276},{"x":0.06,"y":0.352,"w":0.43,"h":0.276},{"x":0.51,"y":0.352,"w":0.43,"h":0.276},{"x":0.06,"y":0.644,"w":0.43,"h":0.276},{"x":0.51,"y":0.644,"w":0.43,"h":0.276}]}],"background":"#161616","textureDefault":"none","sourceIds":["unfold","tezza"]},{"id":"travel_journal","name":"Travel Journal","priority":2,"initialWeight":12,"preferPurpose":["story","memory"],"preferVibe":["natural","clean"],"variants":[{"id":"journal_3","photoCount":3,"pageSpan":1,"slots":[{"x":0.08,"y":0.065,"w":0.84,"h":0.49},{"x":0.08,"y":0.57,"w":0.414,"h":0.28},{"x":0.506,"y":0.57,"w":0.414,"h":0.28}],"captionRegion":{"x":0.08,"y":0.9,"w":0.84,"h":0.06}},{"id":"journal_4","photoCount":4,"pageSpan":1,"slots":[{"x":0.08,"y":0.065,"w":0.84,"h":0.49},{"x":0.08,"y":0.57,"w":0.274667,"h":0.28},{"x":0.362667,"y":0.57,"w":0.274667,"h":0.28},{"x":0.645333,"y":0.57,"w":0.274667,"h":0.28}],"captionRegion":{"x":0.08,"y":0.9,"w":0.84,"h":0.06}}],"background":"#faf8f3","sourceIds":["canva","tezza"]},{"id":"continuous","name":"Continuous","priority":2,"initialWeight":6,"preferPurpose":["story","impact"],"preferVibe":["natural","bold"],"variants":[{"id":"continuous_2","photoCount":1,"pageSpan":2,"slots":[{"x":0,"y":0,"w":1,"h":1,"pageIndex":0,"sourceSlice":{"x":0,"y":0,"w":0.5,"h":1}},{"x":0,"y":0,"w":1,"h":1,"pageIndex":1,"sourceSlice":{"x":0.5,"y":0,"w":0.5,"h":1}}]},{"id":"continuous_3","photoCount":1,"pageSpan":3,"slots":[{"x":0,"y":0,"w":1,"h":1,"pageIndex":0,"sourceSlice":{"x":0,"y":0,"w":0.3333333333333333,"h":1}},{"x":0,"y":0,"w":1,"h":1,"pageIndex":1,"sourceSlice":{"x":0.3333333333333333,"y":0,"w":0.3333333333333333,"h":1}},{"x":0,"y":0,"w":1,"h":1,"pageIndex":2,"sourceSlice":{"x":0.6666666666666666,"y":0,"w":0.3333333333333333,"h":1}}]}],"background":"photo","sourceIds":["scrl"],"requirements":["Wide source image adequate for the combined canvas","Faces must avoid each individual page seam"]},{"id":"soft_scrapbook","name":"Soft Scrapbook","priority":3,"initialWeight":3,"preferPurpose":["memory"],"preferVibe":["bold"],"variants":[{"id":"scrapbook_3","photoCount":3,"pageSpan":1,"slots":[{"x":0.1,"y":0.08,"w":0.64,"h":0.38,"rotation":-2},{"x":0.4,"y":0.38,"w":0.49,"h":0.3,"rotation":2},{"x":0.1,"y":0.6,"w":0.57,"h":0.31,"rotation":-1}]},{"id":"scrapbook_4","photoCount":4,"pageSpan":1,"slots":[{"x":0.1,"y":0.08,"w":0.54,"h":0.34,"rotation":-2},{"x":0.48,"y":0.25,"w":0.42,"h":0.29,"rotation":2},{"x":0.1,"y":0.48,"w":0.46,"h":0.31,"rotation":-1},{"x":0.48,"y":0.65,"w":0.4,"h":0.26,"rotation":2}]}],"background":"#faf8f3","allowOverlap":true,"textureDefault":"none","sourceIds":["canva","tezza"],"requirements":["Check rotated bounds","Reject occluded faces and key subjects"]},{"id":"color_editorial","name":"Color Editorial","priority":3,"initialWeight":3,"preferPurpose":["impact"],"preferVibe":["color","bold"],"variants":[{"id":"color_hero","photoCount":1,"pageSpan":1,"slots":[{"x":0.08,"y":0.065,"w":0.84,"h":0.81}]},{"id":"color_pair","photoCount":2,"pageSpan":1,"slots":[{"x":0.08,"y":0.12,"w":0.416,"h":0.7},{"x":0.504,"y":0.12,"w":0.416,"h":0.7}]}],"background":"single_photo_derived_accent","sourceIds":["tezza","canva"]}],"version":"editorial-1"};window.FRAME_LOCATION_DATA_FILE="cities.0be9ecf4754b25cc.json";
;
/* One crop geometry for preview, gestures, thumbnails and PNG export. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FrameCrop=api})(typeof window!=='undefined'?window:this,function(){
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const ratio=l=>Number(l.photo?.aspect||l.photo?.width/l.photo?.height||l.photo?.w/l.photo?.h)||1;
  function geometry(l,w,h){
    const r=ratio(l),contain=l.fit==='contain',baseW=(contain?r>w/h:r<w/h)?w:h*r,baseH=baseW/r;
    const dw=baseW*(l.zoom||1),dh=baseH*(l.zoom||1),ex=Math.max(0,dw-w),ey=Math.max(0,dh-h);
    return {w:dw,h:dh,x:(w-dw)/2-clamp(l.offX||0,-50,50)*ex/100,y:(h-dh)/2-clamp(l.offY||0,-50,50)*ey/100,ex,ey};
  }
  function pan(l,w,h,dx,dy){const g=geometry(l,w,h);return {offX:g.ex?clamp((l.offX||0)-dx/g.ex*100,-50,50):0,offY:g.ey?clamp((l.offY||0)-dy/g.ey*100,-50,50):0}}
  function pinch(l,w,h,zoom,from,to){
    const old=geometry(l,w,h),next={...l,zoom:clamp(zoom,1,3)},g=geometry(next,w,h);
    const x=to.x-(from.x-old.x)/old.w*g.w,y=to.y-(from.y-old.y)/old.h*g.h;
    return {...next,offX:g.ex?clamp(((w-g.w)/2-x)/g.ex*100,-50,50):0,offY:g.ey?clamp(((h-g.h)/2-y)/g.ey*100,-50,50):0};
  }
  function imageElement(l,w,h){
    const box=document.createElement('div');box.className='photoClip';
    Object.assign(box.style,{position:'absolute',overflow:'hidden',width:w+'px',height:h+'px',transform:'rotate('+(l.rot||0)+'deg)'});
    if(l.frameBorder)box.style.outline=l.frameBorder*(w/l.w)+'px solid '+(l.frameBorderColor||'#161616');
    const im=document.createElement('img'),g=geometry(l,w,h);im.src=l.photo.url;im.alt=l.photo.name||'Foto seleccionada';im.draggable=false;
    Object.assign(im.style,{position:'absolute',maxWidth:'none',maxHeight:'none',width:g.w+'px',height:g.h+'px',left:g.x+'px',top:g.y+'px',objectFit:'fill'});
    box.append(im);return {box,im};
  }
  return {geometry,pan,pinch,imageElement};
});

;
/* IndexedDB stores original Files by the exact id assigned during analysis. */
const FramePhotoStore = (() => {
  const DB = 'frame-director-db-v2', STORE = 'photos';
  function open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE)) {
          request.result.createObjectStore(STORE, {keyPath: 'id'});
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function put(files, photos) {
    if (files.length !== photos.length) throw new Error('File/photo count mismatch');
    const db = await open();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.oncomplete = resolve;
        tx.onabort = () => reject(tx.error || new Error('Photo storage aborted'));
        tx.onerror = () => reject(tx.error);
        // Append/upsert only: importing another batch must retain the first batch.
        files.forEach((file, i) => tx.objectStore(STORE).put({
          id: photos[i].id, name: file.name, type: file.type, blob: file
        }));
      });
    } finally { db.close(); }
  }
  async function restore(project) {
    const db = await open();
    let rows;
    try {
      rows = await new Promise((resolve, reject) => {
        const request = db.transaction(STORE).objectStore(STORE).getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } finally { db.close(); }
    const stored = new Map(rows.map(row => [row.id, row]));
    // Validate before changing any URLs or rendering a partially restored project.
    if (project.photos.some(photo => !stored.has(photo.id))) {
      throw new Error('Saved originals are missing');
    }
    const restored = new Map(project.photos.map(photo => {
      const row = stored.get(photo.id);
      return [photo.id, {...photo, name: row.name, url: URL.createObjectURL(row.blob)}];
    }));
    project.photos = project.photos.map(photo => restored.get(photo.id));
    project.slides.forEach(slide => slide.layers.forEach(layer => {
      if (layer.type === 'img' && restored.has(layer.photo?.id)) {
        layer.photo = restored.get(layer.photo.id);
      }
    }));
  }
  return {put, restore};
})();
if (typeof module !== 'undefined' && module.exports) module.exports = FramePhotoStore;

;
/* One owner for the native picker and the complete import transaction.
 * Dependencies are injected so ordering and File identity can be regression tested.
 */
class PhotoImportController {
  constructor(ports) {
    this.ports = ports;
    this.pendingFiles = [];
    this.active = false;
    this.phase = 'idle';
    this.onChange = event => {
      // Copy File references before clearing the input. Never read a live FileList later.
      const files = Array.from(event.currentTarget.files || []);
      event.currentTarget.value = '';
      void this.filesSelected(files);
    };
    this.onCancel = () => { if (!this.active) this.transition('idle'); };
    ports.input.addEventListener('change', this.onChange);
    ports.input.addEventListener('cancel', this.onCancel);
    ports.input.disabled = false;
  }

  transition(phase) {
    this.phase = phase;
    this.ports.onPhase?.(phase, this.pendingFiles.length);
  }

  selectPhotos() {
    if (this.active || this.ports.isBlocked?.()) return;
    const input = this.ports.input;
    input.value = '';
    this.transition('selecting');
    // Stay in the original user gesture; no timer, promise or animation frame here.
    input.click();
  }

  async filesSelected(selection) {
    if (this.active || this.ports.isBlocked?.()) return false;
    const files = Array.from(selection);
    if (!files.length) { this.transition('idle'); return false; }
    this.active = true;
    this.pendingFiles = files;
    let photos = [];
    let checkpoint;
    try {
      this.ports.setBusy(true);
      this.transition('brief');
      // requestBrief mounts/shows synchronously, before this first await.
      const brief = await this.ports.requestBrief(files);
      if (!brief) return false;
      this.transition('analysis');
      this.ports.showProgress('Analizando tus fotos…');
      await this.ports.yieldToPaint();
      photos = await this.ports.analyzePhotos(files, message => this.ports.showProgress(message), brief);
      if (photos.length !== files.length) throw new Error('Incomplete photo analysis');
      checkpoint = this.ports.checkpoint();
      this.transition('commit');
      this.ports.commitPhotos(photos, brief);
      this.transition('storyboard');
      this.ports.showProgress('Generando storyboard…');
      await this.ports.yieldToPaint();
      this.ports.generateStoryboard();
      this.transition('render');
      this.ports.render();
      // Files are paired with analysis results by index, never with mutable S.photos.
      await this.ports.persistPhotos(files, photos);
      this.ports.onSuccess(photos.length);
      this.transition('complete');
      return true;
    } catch (error) {
      if (checkpoint !== undefined) this.ports.rollback(checkpoint);
      this.ports.releasePhotos(photos);
      this.transition('error');
      this.ports.onError(error);
      return false;
    } finally {
      this.pendingFiles = [];
      this.active = false;
      this.ports.hideProgress();
      this.ports.setBusy(false);
      this.transition('idle');
    }
  }
}

if (typeof module !== 'undefined' && module.exports) module.exports = PhotoImportController;

;
/* Local EXIF + nearby locality lookup. No coordinates leave the device. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FramePhotoLocation=api})(typeof window==='undefined'?globalThis:window,()=>{
  const clean=value=>String(value||'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,80);
  const valid=p=>p&&typeof p.latitude==='number'&&typeof p.longitude==='number'&&Number.isFinite(p.latitude)&&Number.isFinite(p.longitude)&&Math.abs(p.latitude)<=90&&Math.abs(p.longitude)<=180;
  function distance(a,b){const r=Math.PI/180,lat=(b.latitude-a.latitude)*r,lon=(b.longitude-a.longitude)*r;const x=Math.sin(lat/2)**2+Math.cos(a.latitude*r)*Math.cos(b.latitude*r)*Math.sin(lon/2)**2;return 6371*2*Math.asin(Math.sqrt(Math.min(1,x)))}
  function nearest(point,cities){
    if(!valid(point))return null;
    let best=null,km=30;
    for(const city of cities){if(Math.abs(city[2]-point.latitude)>.28)continue;const d=distance(point,{latitude:city[2],longitude:city[3]});if(d<km){best=city;km=d}}
    return best?{name:best[0],country:best[1],distanceKm:Math.round(km*10)/10,approximate:true}:null;
  }
  async function read(file,parser){try{const p=await parser.gps(file);return valid(p)?{latitude:p.latitude,longitude:p.longitude}:null}catch{return null}}
  let dataPromise;
  const assetBase=typeof document!=='undefined'?(document.currentScript?.src||document.baseURI):null;
  async function catalog(){
    if(!dataPromise)dataPromise=(async()=>{
      const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
      try{const url=new URL('../locations/'+window.FRAME_LOCATION_DATA_FILE,assetBase);const response=await fetch(url,{signal:controller.signal});if(!response.ok)throw Error('Locality catalog unavailable');return await response.json()}finally{clearTimeout(timer)}
    })().catch(error=>{dataPromise=null;throw error});
    return dataPromise;
  }
  async function enrich(files,photos,progress,parser,load=catalog){
    const points=[];
    for(let i=0;i<files.length;i++){progress?.(`Leyendo locaciones… ${i+1}/${files.length}`);points.push(await read(files[i],parser))}
    if(!points.some(Boolean))return;
    try{const cities=await load();photos.forEach((p,i)=>{p.location=nearest(points[i],cities)})}catch{photos.forEach(p=>{p.locationStatus='catalog-unavailable'})}
  }
  function summarize(photos){
    const places=new Map();let matched=0;
    for(const p of photos){const l=p.location;if(!l?.name)continue;matched++;const key=l.name+'|'+l.country;const entry=places.get(key)||{...l,count:0};entry.count++;places.set(key,entry)}
    const ordered=[...places.values()].sort((a,b)=>b.count-a.count);
    let text='';
    if(ordered.length===1){const l=ordered[0];let country=l.country;try{country=new Intl.DisplayNames(['es'],{type:'region'}).of(l.country)}catch{}text=(l.distanceKm>5?'Cerca de ':'')+l.name+' · '+country}
    else if(ordered.length)text=ordered.slice(0,2).map(l=>l.name).join(' · ')+(ordered.length>2?` · +${ordered.length-2} lugares`:'');
    return {text:clean(text),matched,total:photos.length,places:ordered.length};
  }
  function settings(brief,photos){const summary=summarize(photos),manual=clean(brief?.locationText);return {enabled:brief?.location==='yes',position:['first','middle','last'].includes(brief?.locationPosition)?brief.locationPosition:'last',source:manual?'manual':'gps',...summary,text:manual||summary.text}}
  function index(position,length){return position==='first'?0:position==='middle'?Math.floor((length-1)/2):length-1}
  function transform(sl,k,dx,dy){
    for(const l of sl.layers){l.x=l.x*k+dx;l.y=l.y*k+dy;if(Number.isFinite(l.w))l.w*=k;if(Number.isFinite(l.h))l.h*=k;if(Number.isFinite(l.size))l.size*=k}
    const r=sl.frameCaptionRegion;if(r){r.x=r.x*k+dx/340;r.y=r.y*k+dy/425;r.w*=k;if(r.h)r.h*=k}
  }
  function strip(slides){for(const sl of slides){sl.layers=sl.layers.filter(l=>!l.frameLocation);const space=sl.frameLocationSpace;if(space){transform(sl,1/space.k,-space.dx/space.k,-space.dy/space.k);delete sl.frameLocationSpace}}}
  function bounds(sl){let bottom=425;for(const l of sl.layers){if(l.hidden)continue;const h=l.type==='text'?l.size*Math.max(1,Math.ceil(l.text.length/Math.max(1,l.w/(l.size*.6)))):l.h;const a=(l.rot||0)*Math.PI/180;bottom=Math.max(bottom,l.y+h/2+Math.abs(l.w*Math.sin(a))/2+Math.abs(h*Math.cos(a))/2)}return bottom}
  function decorate(slides,config,ink){
    const selected=slides[index(config?.position,slides.length)],key=JSON.stringify([config?.enabled,config?.text,config?.position]);
    const existing=slides.flatMap(sl=>sl.layers.filter(l=>l.frameLocation).map(l=>({sl,l})));
    if(config?.enabled&&clean(config.text)&&existing.length===1&&existing[0].sl===selected&&selected.frameLocationKey===key){existing[0].l.color=ink(selected.bg);return}
    // Always remove the previous reservation first; regenerating never accumulates shrinkage.
    strip(slides);
    if(!config?.enabled||!clean(config.text)||!slides.length)return;
    const target=slides[index(config.position,slides.length)];
    const group=target.storySpan?slides.filter(sl=>sl.storySpan?.photoId===target.storySpan.photoId):[target];
    const k=Math.min(.89,376/Math.max(...group.map(bounds))),dx=170*(1-k),dy=6;
    for(const sl of group){transform(sl,k,dx,dy);sl.frameLocationSpace={k,dx,dy}}
    const lines=[];let line='';for(const word of clean(config.text).split(' ')){for(const part of word.match(/.{1,36}/gu)||[]){if(line&&line.length+part.length+1>36){lines.push(line);line=''}line+=(line?' ':'')+part}}if(line)lines.push(line);
    const text=lines.slice(0,3).join('\n'),size=7.5;
    target.frameLocationKey=key;
    target.layers.push({id:'frame-location-'+target.id,type:'text',text,x:24,y:395,w:292,size,color:ink(target.bg),font:'mono',weight:400,rot:0,z:45,hidden:false,locked:true,frameLocation:true});
  }
  return {read,enrich,nearest,distance,summarize,settings,index,strip,decorate,clean};
});

;
const FramePhotoAnalysis = (() => {
const clamp01=v=>Math.max(0,Math.min(1,Number(v)||0));
function loadScriptOnce(src){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Face detector load timed out')),8000);const res=()=>{clearTimeout(timer);resolve()};const rej=e=>{clearTimeout(timer);reject(e)};const existing=[...document.scripts].find(s=>s.src===src);if(existing){if(existing.dataset.ready==='1'||window.FaceDetection)return res();existing.addEventListener('load',res,{once:true});existing.addEventListener('error',rej,{once:true});return}const s=document.createElement('script');s.src=src;s.async=true;s.onload=()=>{s.dataset.ready='1';res()};s.onerror=rej;document.head.appendChild(s)})}
function loadPhoto(url){return loadImage(url)}
let detectorPromise=null;
function getFaceDetector(){if(detectorPromise)return detectorPromise;detectorPromise=(async()=>{try{await loadScriptOnce('https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/face_detection.js');if(!window.FaceDetection)return null;const fd=new FaceDetection({locateFile:f=>`https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${f}`});fd.setOptions({model:'short',minDetectionConfidence:.52});let pending=null;fd.onResults(r=>{if(pending){const fn=pending;pending=null;fn(r)}});fd.__frameSend=image=>new Promise(resolve=>{const timer=setTimeout(()=>{pending=null;resolve(null)},2800);pending=r=>{clearTimeout(timer);resolve(r)};Promise.resolve(fd.send({image})).catch(()=>{clearTimeout(timer);pending=null;resolve(null)})});return fd}catch(e){console.warn('face detector unavailable',e);return null}})();return detectorPromise}
function boxFromDetection(d){const b=d?.locationData?.relativeBoundingBox||d?.relativeBoundingBox||null;if(!b)return null;const x=clamp01(b.xMin??b.x??0),y=clamp01(b.yMin??b.y??0),w=clamp01(b.width??0),h=clamp01(b.height??0);if(w<.02||h<.02)return null;return{x,y,w:Math.min(w,1-x),h:Math.min(h,1-y),score:Number(d?.score?.[0]??d?.score??0)}}
function unionFaces(faces){if(!faces.length)return null;const x1=Math.min(...faces.map(f=>f.x)),y1=Math.min(...faces.map(f=>f.y)),x2=Math.max(...faces.map(f=>f.x+f.w)),y2=Math.max(...faces.map(f=>f.y+f.h));return{x:x1,y:y1,w:x2-x1,h:y2-y1,cx:(x1+x2)/2,cy:(y1+y2)/2}}
async function enrichComposition(p){try{const im=await loadPhoto(p.url);p.width=im.naturalWidth||im.width;p.height=im.naturalHeight||im.height;if(p.width&&p.height)p.aspect=p.width/p.height;const max=512,scale=Math.min(1,max/Math.max(p.width||1,p.height||1)),cv=document.createElement('canvas');cv.width=Math.max(1,Math.round((p.width||1)*scale));cv.height=Math.max(1,Math.round((p.height||1)*scale));cv.getContext('2d',{willReadFrequently:false}).drawImage(im,0,0,cv.width,cv.height);const fd=await getFaceDetector();let faces=[];if(fd?.__frameSend){const r=await fd.__frameSend(cv);faces=(r?.detections||[]).map(boxFromDetection).filter(Boolean).filter(f=>f.score===0||f.score>=.45)}p.faces=faces;p.faceCount=faces.length;p.faceUnion=unionFaces(faces);p.faceCenter=p.faceUnion?{x:p.faceUnion.cx,y:p.faceUnion.cy}:null;p.hasFaces=faces.length>0;return p}catch(e){console.warn('composition analysis',p?.name,e);p.faces=p.faces||[];p.faceCount=p.faces.length;p.faceUnion=unionFaces(p.faces);return p}}

async function analyzePhotos(files, progress, brief) {
  const photos = new Array(files.length), urls = [];
  let next = 0, done = 0, failure = null;
  async function worker() {
    while (next < files.length && !failure) {
      const i = next++, file = files[i];
      try {
        const url = URL.createObjectURL(file); urls.push(url);
        photos[i] = await analyzePhoto({id:uid(), name:file.name, url,
          sourceSize:file.size, sourceType:file.type, sourceLastModified:file.lastModified});
      } catch (error) { failure = error; }
      progress(`Analizando tus fotos… ${++done}/${files.length}`);
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  try {
    await Promise.all(Array.from({length:Math.min(3,files.length)}, worker));
    if (failure) throw failure;
    if(brief?.location==='yes'&&!FramePhotoLocation.clean(brief.locationText))await FramePhotoLocation.enrich(files,photos,progress,window.exifr);
    for (let i = 0; i < photos.length; i++) {
      progress(`Leyendo composición… ${i+1}/${photos.length}`);
      await enrichComposition(photos[i]);
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    return photos;
  } catch (error) {
    urls.forEach(url => URL.revokeObjectURL(url));
    throw error;
  }
}
return {analyzePhotos};
})();

;
(()=>{
  const ENHANCE_VER='Director v2';
  S.smartSelect=true; S.magicFill=false; S.referenceMeta=null; S.heroPhotoId=null; S.animate=false;

  function addCss(){
    const st=document.createElement('style');
    st.textContent=`
      .pill.wow{border-color:#d9ff4550;color:#d9ff45}.pill.wow.on{background:#d9ff45;color:#09090b}
      .magicBg{position:absolute;pointer-events:none;overflow:hidden;filter:blur(16px) saturate(.95);transform-origin:center;opacity:.82}
      body.animate-preview .slide img{animation:frameKen 5s ease-in-out infinite alternate}
      body.animate-preview .slide .textLayer{animation:frameType 2.6s ease-in-out infinite alternate}
      @keyframes frameKen{from{filter:brightness(.98)}to{filter:brightness(1.05)}}
      @keyframes frameType{from{opacity:.82}to{opacity:1}}
      .analysisBadge{display:inline-flex;gap:6px;align-items:center;padding:6px 9px;border-radius:999px;background:#d9ff4514;color:#d9ff45;font-size:10px;margin-top:8px}
      #referenceInput{display:none}
    `;
    document.head.appendChild(st);
  }
  addCss();

  function toolbarButton(id,label,cls=''){
    const b=document.createElement('button'); b.className='pill '+cls; b.id=id; b.textContent=label; return b;
  }
  const bar=$('#controlBar');
  if(bar){
    bar.appendChild(toolbarButton('smartBtn','Smart select','wow on'));
    bar.appendChild(toolbarButton('referenceBtn','Reference'));
    bar.appendChild(toolbarButton('moreLikeBtn','Más así'));
    bar.appendChild(toolbarButton('wildBtn','Wild'));
    bar.appendChild(toolbarButton('magicFillBtn','Magic fill'));
    bar.appendChild(toolbarButton('animateBtn','Animate'));
    bar.appendChild(toolbarButton('depthBtn','Depth','wow'));
    const inp=document.createElement('input'); inp.type='file'; inp.accept='image/*'; inp.id='referenceInput'; document.body.appendChild(inp);
  }

  function colorDist(a,b){return Math.hypot(a.avg[0]-b.avg[0],a.avg[1]-b.avg[1],a.avg[2]-b.avg[2])}
  function smartPhotos(list){
    const sorted=[...list].sort((a,b)=>b.score-a.score); const out=[];
    for(const p of sorted){
      const blurry=p.variance<110; const duplicate=out.some(q=>colorDist(p,q)<24 && Math.abs(p.aspect-q.aspect)<.08);
      if((blurry&&out.length>=6)||duplicate)continue; out.push(p); if(out.length>=20)break;
    }
    return out.length>=3?out:sorted;
  }
  const originalBuild=buildSlides;

  const originalPal=palFromPhoto;
  palFromPhoto=function(meta){
    const p=originalPal(meta); if(!S.referenceMeta)return p;
    const rp=originalPal(S.referenceMeta); return p.map((c,i)=>c.map((v,j)=>Math.round(v*.46+rp[i][j]*.54)));
  };

  $('#smartBtn').onclick=()=>{S.smartSelect=!S.smartSelect;$('#smartBtn').classList.toggle('on',S.smartSelect);toast(S.smartSelect?'Smart select activo':'Usando todas las fotos');saveProject()};
  $('#referenceBtn').onclick=()=>$('#referenceInput').click();
  $('#referenceInput').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;const p={id:'reference',name:f.name,url:URL.createObjectURL(f)};S.referenceMeta=await analyzePhoto(p);$('#referenceBtn').classList.add('on');toast('Estilo de referencia capturado');};

  function favoriteSlides(){return S.slides.filter(s=>s.favorite)}
  function variantFromFavorite(fav,idx){
    const sl=clone(fav); sl.id=uid(); sl.favorite=false; const photoPool=smartPhotos(S.photos); let pi=idx;
    sl.layers.forEach(l=>{l.id=uid(); if(l.type==='img'&&!l.locked){l.photo=photoPool[pi++%photoPool.length];l.offX=rnd(-8,8);l.offY=rnd(-8,8);l.zoom=Math.max(1,l.zoom+rnd(-.06,.12))} if(l.type==='text'&&!l.locked){l.x+=rnd(-12,12);l.y+=rnd(-12,12);l.rot+=rnd(-2.5,2.5);if(Math.random()<.35)l.font=pick(FONTS)[0]}});
    const first=sl.layers.find(l=>l.type==='img')?.photo; if(first){sl.palette=palFromPhoto(first);sl.bg=rgbToCss(sl.palette[0])}
    return sl;
  }
  $('#moreLikeBtn').onclick=()=>{const favs=favoriteSlides();if(!favs.length)return toast('Marca un slide con ☆ primero');pushHistory();S.slides=S.slides.map((s,i)=>s.favorite?s:variantFromFavorite(favs[i%favs.length],i));renderAll();toast('Variaciones del estilo favorito')};
  $('#wildBtn').onclick=()=>{pushHistory();const oldSmart=S.smartSelect;S.smartSelect=false;originalBuild();S.smartSelect=oldSmart;S.slides.forEach(sl=>{if(Math.random()<.8)sl.layers.push(makeDeco('block',rnd(-20,280),rnd(0,380),rnd(40,130),rnd(8,90),rgbToCss(pick(sl.palette.slice(2))),rnd(-22,22)));if(Math.random()<.65)sl.layers.push(makeText(pick(PLACEHOLDERS),rnd(-8,210),rnd(12,390),rnd(80,250),rnd(16,72),rgbToCss(pick(sl.palette.slice(1))),pick(FONTS)[0],pick([400,700,900]),rnd(-12,12))) });renderAll();toast('Wild mode')};

  const originalRenderStage=renderStage;
  function applyMagicFill(){
    if(!S.magicFill)return;
    $$('.imgLayer').forEach(img=>{const bg=document.createElement('div');bg.className='magicBg';bg.style.left=img.style.left;bg.style.top=img.style.top;bg.style.width=img.style.width;bg.style.height=img.style.height;bg.style.zIndex=Math.max(0,(+img.style.zIndex||10)-1);bg.style.background=`url("${img.src}") center/cover no-repeat`;bg.style.transform=(img.style.transform||'')+' scale(1.04)';img.parentNode.insertBefore(bg,img);img.style.objectFit='contain';img.style.background='rgba(0,0,0,.05)'})
  }
  renderStage=function(){originalRenderStage();applyMagicFill()};
  $('#magicFillBtn').onclick=()=>{S.magicFill=!S.magicFill;$('#magicFillBtn').classList.toggle('on',S.magicFill);renderStage();toast(S.magicFill?'Magic fill activo':'Magic fill desactivado')};
  $('#animateBtn').onclick=()=>{S.animate=!S.animate;document.body.classList.toggle('animate-preview',S.animate);$('#animateBtn').classList.toggle('on',S.animate);toast(S.animate?'Preview animado':'Animación detenida')};

  function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
  async function personCutout(layer){
    const src='https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js';
    await loadScript(src); if(!window.SelfieSegmentation)throw new Error('Segmentation unavailable');
    const img=await loadImage(layer.photo.url); const cv=document.createElement('canvas');cv.width=img.naturalWidth||img.width;cv.height=img.naturalHeight||img.height;const ctx=cv.getContext('2d');
    const seg=new SelfieSegmentation({locateFile:f=>`https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${f}`});seg.setOptions({modelSelection:1});
    const result=await new Promise((res,rej)=>{let done=false;seg.onResults(r=>{if(!done){done=true;res(r)}});seg.send({image:img}).catch(rej)});
    ctx.clearRect(0,0,cv.width,cv.height);ctx.drawImage(result.segmentationMask,0,0,cv.width,cv.height);ctx.globalCompositeOperation='source-in';ctx.drawImage(img,0,0,cv.width,cv.height);ctx.globalCompositeOperation='source-over';
    const blob=await new Promise(res=>cv.toBlob(res,'image/png'));return {id:'cut_'+uid(),name:'cutout.png',url:URL.createObjectURL(blob),avg:layer.photo.avg||[128,128,128],aspect:layer.photo.aspect||1,score:layer.photo.score||0,variance:layer.photo.variance||0,grid:layer.photo.grid||Array(9).fill(0)};
  }
  $('#depthBtn').onclick=async()=>{const l=currentLayer();if(!l||l.type!=='img')return toast('Toca una foto de una persona primero');try{$('#loading').classList.add('on');pushHistory();const sl=selectedSlide();const bg=clone(l);bg.id=uid();bg.z=8;const cut=await personCutout(l);const fg=clone(l);fg.id=uid();fg.photo=cut;fg.z=36;const ix=sl.layers.findIndex(x=>x.id===l.id);sl.layers.splice(ix,1,bg,fg);sl.layers.filter(x=>x.type==='text').forEach(t=>{if(!t.locked)t.z=24});S.selected=fg.id;S.selectedType='img';renderAll();toast('Depth aplicado');}catch(e){console.warn(e);toast('Depth necesita internet y una foto con persona')}finally{$('#loading').classList.remove('on')}};

  const photoGrid=$('#photoSheet .grid3'); if(photoGrid){const hero=document.createElement('button');hero.id='heroPhotoBtn';hero.textContent='★ Hero';photoGrid.appendChild(hero);hero.onclick=()=>{const l=currentLayer();if(!l||l.type!=='img')return;S.heroPhotoId=l.photo.id;l.photo.score=1e8;toast('Foto marcada como hero');saveProject()}}

  $('#slideCountRange').oninput=e=>{const val=+e.target.value;if(val===S.slides.length)return;pushHistory();if(val<S.slides.length)S.slides=S.slides.slice(0,val);else{const favs=favoriteSlides();while(S.slides.length<val){if(favs.length)S.slides.push(variantFromFavorite(favs[S.slides.length%favs.length],S.slides.length));else{const old=[...S.slides];originalBuild();const candidate=clone(S.slides[S.slides.length%Math.max(1,S.slides.length)]||S.slides[0]);S.slides=old;candidate.id=uid();candidate.layers.forEach(l=>l.id=uid());S.slides.push(candidate)}}}S.currentSlide=Math.min(S.currentSlide,S.slides.length-1);renderAll()};

  $('#randomBtn').onclick=()=>{if(!S.slides.length)return;pushHistory();if(S.randomMode==='all'||S.randomMode==='layout'){buildSlides()}else if(S.randomMode==='color'){S.slides.forEach(sl=>{const p=sl.layers.find(l=>l.type==='img')?.photo||heroPhoto();const pal=palFromPhoto(p);sl.palette=pal;sl.bg=rgbToCss(pal[0]);const ink=contrastText(pal[0]);sl.layers.forEach(l=>{if(l.type==='text'&&!l.locked)l.color=Math.random()<.7?ink:rgbToCss(pick(pal.slice(2)));if(l.type==='deco')l.color=rgbToCss(pick(pal.slice(2)))})})}else if(S.randomMode==='type'){S.slides.forEach(sl=>sl.layers.forEach(l=>{if(l.type==='text'&&!l.locked){l.font=pick(FONTS)[0];l.weight=pick([400,700,900]);l.size=rnd(16,62);l.rot=rnd(-8,8)}}))}renderAll();toast('Random listo')};

  const origRenderAll=renderAll;
  renderAll=function(){origRenderAll();$('#smartBtn')?.classList.toggle('on',!!S.smartSelect);$('#magicFillBtn')?.classList.toggle('on',!!S.magicFill);$('#animateBtn')?.classList.toggle('on',!!S.animate);document.body.classList.toggle('animate-preview',!!S.animate)};

  toast('FRAME Director listo');
})();

;
(()=>{
  const INTERACTION_VERSION='Interaction v1';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const dist=(a,b)=>Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
  const angle=(a,b)=>Math.atan2(b.clientY-a.clientY,b.clientX-a.clientX);
  const mid=(a,b)=>({x:(a.clientX+b.clientX)/2,y:(a.clientY+b.clientY)/2});
  const sc=()=>framePreviewWidth()/340;
  let gestureActive=false;

  const style=document.createElement('style');
  style.textContent=`
    :root{--tap:rgba(255,255,255,.08);--spring:cubic-bezier(.2,.85,.2,1)}
    button,.choice,.pill,.tool,.thumb{touch-action:manipulation}
    button{min-height:44px;transition:transform .12s ease,opacity .12s ease,background .16s ease}
    button:active,.choice:active,.pill:active,.tool:active,.thumb:active{transform:scale(.96);opacity:.86}
    .pill{min-height:38px;display:inline-flex;align-items:center;justify-content:center}
    .tool{min-height:58px}.tool .ico{transition:transform .16s var(--spring)}.tool:active .ico{transform:scale(.86)}
    .toolbar{scroll-snap-type:x proximity;padding-bottom:14px}.toolbar .pill{scroll-snap-align:start}
    .canvasWrap{scroll-behavior:smooth;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch}
    .slide{transition:transform .24s var(--spring),box-shadow .24s ease,filter .24s ease}
    .slide.isCurrent{transform:scale(1);box-shadow:0 28px 70px rgba(0,0,0,.5)}
    .slide:not(.isCurrent){transform:scale(.985)}
    .sel{outline:2px solid rgba(255,255,255,.9)!important;outline-offset:3px!important}
    .imgLayer,.textLayer{will-change:transform,left,top,object-position,font-size}
    .imgLayer.isManipulating,.textLayer.isManipulating{outline:2px solid rgba(255,255,255,.95)!important;outline-offset:4px!important}
    .interactionScrim{position:fixed;inset:0;z-index:74;background:rgba(0,0,0,.32);backdrop-filter:blur(4px);opacity:0;pointer-events:none;transition:opacity .2s ease}
    .interactionScrim.on{opacity:1;pointer-events:auto}
    .sheet{z-index:80;transition:transform .28s var(--spring)!important;will-change:transform}
    .sheet.dragging{transition:none!important}
    .grab{height:5px!important;width:42px!important;background:#4a4a52!important;cursor:grab}
    .sheetTop{position:sticky;top:0;background:#141417;z-index:2;padding-top:2px}
    .snapGuide{position:absolute;z-index:230;pointer-events:none;background:rgba(140,214,255,.95);opacity:0;transition:opacity .08s ease}
    .snapGuide.v{top:0;bottom:0;width:1px;left:50%}.snapGuide.h{left:0;right:0;height:1px;top:50%}.snapGuide.on{opacity:1}
    .contextBar{position:fixed;left:50%;transform:translateX(-50%) translateY(8px);bottom:calc(164px + env(safe-area-inset-bottom));z-index:65;display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:999px;background:rgba(22,22,26,.88);border:1px solid rgba(255,255,255,.09);backdrop-filter:blur(22px);box-shadow:0 14px 40px rgba(0,0,0,.32);opacity:0;pointer-events:none;transition:.2s var(--spring);font-size:10px;color:#d6d6dc;white-space:nowrap}
    .contextBar.on{opacity:1;transform:translateX(-50%) translateY(0)}
    .contextBar b{color:#fff}.contextBar .dotx{width:6px;height:6px;border-radius:50%;background:#fff}
    .pager{position:fixed;right:18px;bottom:calc(166px + env(safe-area-inset-bottom));z-index:64;padding:6px 9px;border-radius:999px;background:rgba(16,16,19,.72);border:1px solid rgba(255,255,255,.07);backdrop-filter:blur(18px);font-size:10px;color:#aaaab2;transition:.18s ease}
    .photoModeMini{display:flex;gap:6px;margin-top:10px}.photoModeMini button{flex:1;min-height:42px;border:1px solid #2c2c32;border-radius:14px;background:#0d0d10;font-size:11px}.photoModeMini button.on{background:#efeff1;color:#111;border-color:#efeff1}
    body.gestureLock .canvasWrap{overflow-x:hidden!important;scroll-snap-type:none!important}
    body.sheetOpen .dock{transform:translateY(10px);opacity:.25;pointer-events:none;transition:.2s ease}
    body.sheetOpen .filmstrip{opacity:.18;pointer-events:none;transition:.2s ease}
  `;
  document.head.appendChild(style);

  const scrim=document.createElement('div'); scrim.className='interactionScrim'; document.body.appendChild(scrim);
  const context=document.createElement('div'); context.className='contextBar'; context.innerHTML='<span class="dotx"></span><b>Seleccionado</b><span id="contextText"></span>'; document.body.appendChild(context);
  const pager=document.createElement('div'); pager.className='pager'; document.body.appendChild(pager);

  function updateSheetState(){
    const any=$$('.sheet.on').length>0;
    scrim.classList.toggle('on',any); document.body.classList.toggle('sheetOpen',any);
  }
  scrim.addEventListener('click',()=>{closeSheets();updateSheetState()});
  const mo=new MutationObserver(updateSheetState); $$('.sheet').forEach(s=>mo.observe(s,{attributes:true,attributeFilter:['class']}));

  function wireSheet(sheet){
    const grab=sheet.querySelector('.grab'); if(!grab||grab.dataset.interactionBound)return; grab.dataset.interactionBound='1';
    let sy=0,dy=0,dragging=false;
    const begin=e=>{const t=e.touches?.[0]; if(!t)return; sy=t.clientY;dy=0;dragging=true;sheet.classList.add('dragging')};
    const move=e=>{if(!dragging)return; const t=e.touches?.[0]; if(!t)return; dy=Math.max(0,t.clientY-sy); if(dy>0){e.preventDefault();sheet.style.transform=`translateY(${dy}px)`}};
    const end=()=>{if(!dragging)return;dragging=false;sheet.classList.remove('dragging');sheet.style.transform='';if(dy>86){sheet.classList.remove('on');updateSheetState()}}
    grab.addEventListener('touchstart',begin,{passive:true}); grab.addEventListener('touchmove',move,{passive:false}); grab.addEventListener('touchend',end,{passive:true});
  }
  function wireAllSheets(){$$('.sheet').forEach(wireSheet);updateSheetState()}
  wireAllSheets();

  const _openSheet=openSheet; openSheet=function(id){_openSheet(id); requestAnimationFrame(()=>{wireAllSheets();updateSheetState()})};
  const _closeSheets=closeSheets; closeSheets=function(){_closeSheets();requestAnimationFrame(updateSheetState)};

  function updatePager(){
    pager.textContent=`${String((S.currentSlide||0)+1).padStart(2,'0')} / ${String(Math.max(1,S.slides.length)).padStart(2,'0')}`;
    $$('.slide').forEach((el,i)=>el.classList.toggle('isCurrent',i===S.currentSlide));
  }
  const _renderFilmstrip=renderFilmstrip; renderFilmstrip=function(){_renderFilmstrip();updatePager()};
  const _goToSlide=goToSlide; goToSlide=function(i){_goToSlide(i);updatePager()};

  function setSelected(slideI,id,type){
    S.currentSlide=slideI; S.selected=id; S.selectedType=type;
    S.slides[slideI]?.layers.find(x=>x.id===id);
    $('#contextText').textContent=type==='img'?(S.photoEditMode==='move'?'Foto · mover marco':'Foto · reencuadrar'):'Texto · mover / pellizcar';
    context.classList.add('on'); clearTimeout(context._t); context._t=setTimeout(()=>context.classList.remove('on'),1800);
    renderFilmstrip(); renderSheets(); saveProject();
  }

  function ensureGuides(slide){
    if(!slide.querySelector('.snapGuide.v')){const v=document.createElement('div');v.className='snapGuide v';slide.appendChild(v);const h=document.createElement('div');h.className='snapGuide h';slide.appendChild(h)}
    return {v:slide.querySelector('.snapGuide.v'),h:slide.querySelector('.snapGuide.h')};
  }
  function lockCanvas(on){gestureActive=on;document.body.classList.toggle('gestureLock',on)}

  bindObjects=function(){
    $$('.textLayer').forEach(bindTextDirect);
    $$('.imgLayer').forEach(bindImgDirect);
  };

  function bindTextDirect(el){
    if(el.dataset.directBound)return; el.dataset.directBound='1';
    const slideI=+el.dataset.slide,id=el.dataset.id;
    let st=null,moved=false;
    el.addEventListener('touchstart',e=>{
      const l=S.slides[slideI]?.layers.find(x=>x.id===id); if(!l)return;
      setSelected(slideI,id,'text');
      if(l.locked){toast('Texto bloqueado');return}
      lockCanvas(true); el.classList.add('isManipulating'); moved=false;
      if(e.touches.length===1){const t=e.touches[0];st={mode:'drag',sx:t.clientX,sy:t.clientY,bx:l.x,by:l.y}}
      else if(e.touches.length>=2){const a=e.touches[0],b=e.touches[1],m=mid(a,b);st={mode:'pinch',sd:dist(a,b),sa:angle(a,b),ss:l.size,sr:l.rot,sx:m.x,sy:m.y,bx:l.x,by:l.y}}
    },{passive:true});
    el.addEventListener('touchmove',e=>{
      if(!st)return; const l=S.slides[slideI]?.layers.find(x=>x.id===id);if(!l||l.locked)return; e.preventDefault(); moved=true; const scale=sc(); const slide=el.closest('.slide'),g=ensureGuides(slide);
      if(e.touches.length>=2){const a=e.touches[0],b=e.touches[1],m=mid(a,b); if(st.mode!=='pinch'){st={mode:'pinch',sd:dist(a,b),sa:angle(a,b),ss:l.size,sr:l.rot,sx:m.x,sy:m.y,bx:l.x,by:l.y}}; l.size=clamp(st.ss*(dist(a,b)/Math.max(1,st.sd)),14,160); l.rot=st.sr+(angle(a,b)-st.sa)*180/Math.PI; l.x=st.bx+(m.x-st.sx)/scale; l.y=st.by+(m.y-st.sy)/scale; }
      else {const t=e.touches[0];l.x=st.bx+(t.clientX-st.sx)/scale;l.y=st.by+(t.clientY-st.sy)/scale}
      const cx=l.x+l.w/2, cy=l.y+l.size*.48; const snapX=Math.abs(cx-170)<7, snapY=Math.abs(cy-212.5)<7; if(snapX)l.x=170-l.w/2;if(snapY)l.y=212.5-l.size*.48;g.v.classList.toggle('on',snapX);g.h.classList.toggle('on',snapY);
      el.style.left=(l.x*scale)+'px';el.style.top=(l.y*scale)+'px';el.style.fontSize=(l.size*scale)+'px';el.style.transform=`rotate(${l.rot}deg)`;
    },{passive:false});
    const finish=()=>{if(!st)return;st=null;lockCanvas(false);el.classList.remove('isManipulating');const slide=el.closest('.slide');slide?.querySelectorAll('.snapGuide').forEach(g=>g.classList.remove('on'));saveProject();renderFilmstrip()};
    el.addEventListener('touchend',finish,{passive:true});el.addEventListener('touchcancel',finish,{passive:true});
    el.addEventListener('click',e=>{if(moved){moved=false;e.preventDefault();e.stopPropagation();return}setSelected(slideI,id,'text');renderStage();renderTextSheet();openSheet('#textSheet')});
    el.addEventListener('dblclick',()=>{setSelected(slideI,id,'text');renderStage();renderTextSheet();openSheet('#textSheet');setTimeout(()=>$('#textInput')?.focus(),80)});
  }

  function bindImgDirect(el){
    if(el.dataset.directBound)return; el.dataset.directBound='1';
    const slideI=+el.dataset.slide,id=el.dataset.id;
    let st=null,moved=false;
    el.addEventListener('touchstart',e=>{
      const l=S.slides[slideI]?.layers.find(x=>x.id===id); if(!l)return;
      setSelected(slideI,id,'img');
      if(l.locked){toast('Foto bloqueada');return}
      lockCanvas(true); el.classList.add('isManipulating');moved=false;
      if(e.touches.length===1){const t=e.touches[0];st={mode:'drag',sx:t.clientX,sy:t.clientY,bx:l.x,by:l.y,boX:l.offX,boY:l.offY}}
      else if(e.touches.length>=2){const a=e.touches[0],b=e.touches[1],m=mid(a,b);st={mode:'pinch',sd:dist(a,b),sz:l.zoom,sx:m.x,sy:m.y,bx:l.x,by:l.y,boX:l.offX,boY:l.offY}}
    },{passive:true});
    el.addEventListener('touchmove',e=>{
      if(!st)return; const l=S.slides[slideI]?.layers.find(x=>x.id===id);if(!l||l.locked)return;e.preventDefault();moved=true;const scale=sc();
      if(e.touches.length>=2){const a=e.touches[0],b=e.touches[1],m=mid(a,b);if(st.mode!=='pinch')st={mode:'pinch',sd:dist(a,b),sz:l.zoom,sx:m.x,sy:m.y,bx:l.x,by:l.y,boX:l.offX,boY:l.offY};l.zoom=clamp(st.sz*(dist(a,b)/Math.max(1,st.sd)),1,3);if(S.photoEditMode==='move'){l.x=st.bx+(m.x-st.sx)/scale;l.y=st.by+(m.y-st.sy)/scale}else{l.offX=clamp(st.boX+(m.x-st.sx)*.12,-48,48);l.offY=clamp(st.boY+(m.y-st.sy)*.12,-48,48)}}
      else {const t=e.touches[0],dx=t.clientX-st.sx,dy=t.clientY-st.sy;if(S.photoEditMode==='move'){l.x=st.bx+dx/scale;l.y=st.by+dy/scale}else{l.offX=clamp(st.boX+dx*.12,-48,48);l.offY=clamp(st.boY+dy*.12,-48,48)}}
      el.style.left=(l.x*scale)+'px';el.style.top=(l.y*scale)+'px';el.style.transform=`rotate(${l.rot}deg) scale(${l.zoom})`;el.style.objectPosition=`${50+l.offX}% ${50+l.offY}%`;
      const zr=$('#zoomRange');if(zr&&S.selected===id)zr.value=l.zoom;
      $('#contextText').textContent=S.photoEditMode==='move'?'Foto · mover marco':'Foto · reencuadrar';
    },{passive:false});
    const finish=()=>{if(!st)return;st=null;lockCanvas(false);el.classList.remove('isManipulating');saveProject();renderFilmstrip()};
    el.addEventListener('touchend',finish,{passive:true});el.addEventListener('touchcancel',finish,{passive:true});
    el.addEventListener('click',e=>{if(moved){moved=false;e.preventDefault();e.stopPropagation();return}setSelected(slideI,id,'img');renderStage();renderPhotoSheet();openSheet('#photoSheet')});
    el.addEventListener('dblclick',()=>{const l=S.slides[slideI]?.layers.find(x=>x.id===id);if(!l)return;pushHistory();l.zoom=1;l.offX=0;l.offY=0;renderStage();renderPhotoSheet();saveProject();toast('Encuadre reiniciado')});
  }

  const photoSheet=$('#photoSheet');
  if(photoSheet && !$('#interactionModeMini')){
    const mini=document.createElement('div');mini.className='photoModeMini';mini.id='interactionModeMini';mini.innerHTML='<button data-pmode="crop">Reencuadrar</button><button data-pmode="move">Mover marco</button>';
    const hint=photoSheet.querySelector('.hint');(hint||photoSheet.querySelector('.grid3'))?.insertAdjacentElement('beforebegin',mini);
    mini.onclick=e=>{const b=e.target.closest('[data-pmode]');if(!b)return;S.photoEditMode=b.dataset.pmode;syncPhotoModes();$('#contextText').textContent=S.photoEditMode==='move'?'Foto · mover marco':'Foto · reencuadrar';toast(S.photoEditMode==='move'?'Ahora mueves el marco':'Ahora reencuadras la foto')};
  }
  function syncPhotoModes(){$$('#interactionModeMini [data-pmode]').forEach(b=>b.classList.toggle('on',b.dataset.pmode===S.photoEditMode));$('#moveModeBtn')?.classList.toggle('on',S.photoEditMode==='move');$('#cropModeBtn')?.classList.toggle('on',S.photoEditMode==='crop')}
  $('#moveModeBtn')?.addEventListener('click',()=>{S.photoEditMode='move';syncPhotoModes()});$('#cropModeBtn')?.addEventListener('click',()=>{S.photoEditMode='crop';syncPhotoModes()});

  let dragThumb=null;
  $('#filmstrip')?.addEventListener('touchstart',e=>{const th=e.target.closest('.thumb');if(!th)return;dragThumb={el:th,sx:e.touches[0].clientX,scroll:$('#filmstrip').scrollLeft}}, {passive:true});
  $('#filmstrip')?.addEventListener('touchmove',e=>{if(!dragThumb)return;const dx=e.touches[0].clientX-dragThumb.sx;if(Math.abs(dx)>6)$('#filmstrip').scrollLeft=dragThumb.scroll-dx},{passive:true});
  $('#filmstrip')?.addEventListener('touchend',()=>dragThumb=null,{passive:true});

  $('#textInput')?.addEventListener('focus',()=>setTimeout(()=>$('#textSheet')?.scrollIntoView({block:'end',behavior:'smooth'}),120));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeSheets();updateSheetState()}});

  const _renderAll=renderAll; renderAll=function(){_renderAll();wireAllSheets();updatePager();syncPhotoModes()};
  renderStage();renderFilmstrip();wireAllSheets();updatePager();syncPhotoModes();
  toast('Interacción refinada');
})();
;
(()=>{
const PREF='frame_speed_prefs_v1';
const css=document.createElement('style');css.textContent=`
.quickbar{display:grid;grid-template-columns:1fr 1.22fr 1fr;gap:8px;padding:0 16px 10px}.quickbar button{min-height:42px;padding:0 12px;border-radius:999px;border:1px solid #292930;background:#121215;font-size:11px;font-weight:750}.quickbar .newDesign{background:#f2f2f4;color:#09090b;border-color:#f2f2f4}.quickbar.busy{pointer-events:none}.quickbar.busy button{opacity:.42}.speedHidden{display:none!important}.fastToastAction{position:fixed;left:50%;bottom:calc(96px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:110;background:#f4f4f5;color:#09090b;padding:9px 13px;border-radius:999px;font-size:11px;font-weight:750;box-shadow:0 12px 40px rgba(0,0,0,.4);opacity:0;pointer-events:none;transition:.18s}.fastToastAction.on{opacity:1;pointer-events:auto}.studioTop{padding-bottom:5px}.studioTop h1{font-size:31px!important}.emptyQuick{display:none;margin:72px 22px 0;text-align:center}.emptyQuick.on{display:block}.emptyQuick .emptyIcon{width:62px;height:62px;margin:0 auto 18px;border-radius:22px;border:1px solid #292930;display:grid;place-items:center;font-size:27px;background:#111114}.emptyQuick b{display:block;font-size:19px}.emptyQuick small{display:block;color:#73737c;margin:8px auto 20px;max-width:245px;line-height:1.45}.emptyQuick button{min-height:48px;padding:0 22px;border:0;border-radius:999px;background:#f4f4f5;color:#0b0b0d;font-weight:800}.emptyQuick button:disabled{opacity:.55}.emptyStateFast .quickbar,.emptyStateFast #controlBar,.emptyStateFast .canvasWrap,.emptyStateFast .filmstrip,.emptyStateFast .pager,.emptyStateFast .dock{display:none!important}.emptyStateFast .studioTop #modeLabel{display:none}.emptyStateFast .studioTop{border-bottom:0!important}
.frameBriefBackdrop{position:fixed!important;inset:0!important;z-index:2147483000!important;background:rgba(4,4,6,.86)!important;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);display:none!important;visibility:hidden!important;pointer-events:none!important;opacity:0!important;align-items:flex-end;padding:12px 12px calc(12px + env(safe-area-inset-bottom));box-sizing:border-box;overflow-y:auto}.frameBriefBackdrop.on{display:flex!important;visibility:visible!important;pointer-events:auto!important;opacity:1!important}.frameBriefCard{max-height:calc(100dvh - 24px);overflow-y:auto;box-sizing:border-box;width:100%;max-width:520px;margin:0 auto;background:#121216;border:1px solid #2b2b31;border-radius:27px;padding:19px 16px 15px;box-shadow:0 28px 90px rgba(0,0,0,.58)}.frameBriefEyebrow{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#73737d;margin-bottom:6px}.frameBriefCard h3{font-size:20px;line-height:1.15;margin:0 0 7px}.frameBriefIntro{font-size:11px;line-height:1.45;color:#85858e;margin-bottom:16px}.briefQ{margin:13px 0}.briefQ b{display:block;font-size:11px;margin-bottom:8px}.briefChoices{display:grid;grid-template-columns:1fr 1fr;gap:7px}.briefChoices button{min-height:42px;border-radius:14px;border:1px solid #2e2e35;background:#0d0d10;color:#d8d8dd;font-size:11px;font-weight:700;padding:8px 10px}.briefChoices button.on{background:#f1f1f3;color:#0a0a0c;border-color:#f1f1f3}.briefDensity{grid-template-columns:repeat(3,1fr)}.briefActions{display:grid;grid-template-columns:.8fr 1.2fr;gap:8px;margin-top:15px}.briefActions button{min-height:46px;border-radius:999px;border:1px solid #2d2d33;background:#111115;color:#d7d7dc;font-weight:800}.briefActions .primary{background:#f4f4f5;color:#09090b;border-color:#f4f4f5}
.locationPrompt{margin-top:13px}.locationManual{display:block;font-size:11px;margin:12px 0 6px;color:#bbb}#briefLocationText,#locationText{width:100%;box-sizing:border-box;min-height:44px;border:1px solid #34343a;background:#0d0d10;color:#eee;border-radius:10px;padding:10px;font-size:16px}.locationHint{font-size:11px;line-height:1.5;color:#999;margin:8px 0 0}.locationHint a{color:inherit}.locationControls{padding:6px 0 10px}.locationControls label{display:block;margin:8px 0}.locationControls select{width:100%}.frameBriefCard [hidden]{display:none!important}
`;document.head.appendChild(css);
let prefs={};try{prefs=JSON.parse(localStorage.getItem(PREF)||'{}')}catch(e){}
const studio=$('#studioScreen'),top=studio?.querySelector('.studioTop');
const qb=document.createElement('div');qb.className='quickbar';qb.innerHTML='<button id="fastAdd">＋ Fotos</button><button class="newDesign" id="fastNewDesign">✦ Otra opción</button><button id="fastExport">↑ Exportar</button>';if(top)top.after(qb);
const empty=document.createElement('div');empty.className='emptyQuick';empty.innerHTML='<div class="emptyIcon">▧</div><b>Empieza con tus fotos</b><small>Elige tus imágenes. Después FRAME te pregunta qué quieres lograr antes de diseñar.</small><button id="emptyAdd">＋ Elegir fotos</button>';if(qb)qb.after(empty);
const photoInput=$('#photosInput');
const undoAction=document.createElement('button');undoAction.className='fastToastAction';undoAction.textContent='Deshacer';document.body.appendChild(undoAction);
const brief=document.createElement('div');brief.className='frameBriefBackdrop';brief.id='frameBrief';brief.innerHTML=`<div class="frameBriefCard"><div class="frameBriefEyebrow">Fotos seleccionadas</div><h3>¿Qué quieres que haga este post?</h3><div class="frameBriefIntro" id="briefIntro">FRAME ya tiene tus fotos. Dale tres pistas rápidas antes de diseñar.</div><div class="briefQ"><b>1. ¿Qué quieres lograr?</b><div class="briefChoices" data-key="purpose"><button data-v="story" class="on">Contar una historia</button><button data-v="impact">Impactar</button><button data-v="memory">Guardar el momento</button><button data-v="showcase">Mostrar muchas fotos</button></div></div><div class="briefQ"><b>2. ¿Qué vibra buscas?</b><div class="briefChoices" data-key="vibe"><button data-v="clean" class="on">Editorial / limpio</button><button data-v="natural">Natural</button><button data-v="color">Color</button><button data-v="bold">Más atrevido</button></div></div><div class="briefQ"><b>3. ¿Cuánta información por slide?</b><div class="briefChoices briefDensity" data-key="density"><button data-v="airy">Con aire</button><button data-v="balanced" class="on">Equilibrado</button><button data-v="rich">Más fotos</button></div></div><div class="briefQ"><b>4. ¿Quieres incluir locación?</b><div class="briefChoices" data-key="location"><button data-v="no">Sin locación</button><button data-v="yes">Sí, incluir locación</button></div><div id="briefLocationOptions" hidden><b class="locationPrompt">¿Dónde aparece? Solo una vez.</b><div class="briefChoices briefDensity" data-key="locationPosition"><button data-v="first">En la primera</button><button data-v="middle">En el medio</button><button data-v="last">Al final</button></div><label class="locationManual" for="briefLocationText">Lugar (opcional)</label><input id="briefLocationText" maxlength="80" placeholder="Automático desde el GPS de las fotos" autocomplete="off"><p class="locationHint">Buscaremos localidades cercanas al GPS. Puedes escribir el lugar si prefieres. Tus fotos y coordenadas se quedan en este dispositivo.</p></div></div><div class="briefActions"><button id="briefSurprise">Sorpréndeme</button><button id="briefGo" class="primary">Diseñar ✦</button></div></div>`;document.body.appendChild(brief);
let busy=false,briefResolve=null,briefState={purpose:'story',vibe:'clean',density:'balanced'};
function setBusy(on){busy=on;qb.classList.toggle('busy',on);const eb=$('#emptyAdd');if(eb)eb.disabled=on}
function fire(primary,fallback){const a=$(primary);if(a){a.click();return true}const b=fallback?$(fallback):null;if(b){b.click();return true}return false}
function hideClutter(){const bar=$('#controlBar');if(bar)bar.classList.add('speedHidden');$('#randomBtn')?.classList.add('speedHidden');$('#slideBtn')?.classList.add('speedHidden')}
function emptyState(){const isEmpty=!S.photos?.length||!S.slides?.length;studio?.classList.toggle('emptyStateFast',isEmpty);empty.classList.toggle('on',isEmpty);if(isEmpty){const count=studio?.querySelector('.studioTop small');if(count)count.textContent='Nuevo proyecto'}return isEmpty}
hideClutter();emptyState();
function remember(){prefs.slides=S.slides?.length||prefs.slides;try{localStorage.setItem(PREF,JSON.stringify(prefs))}catch(e){console.warn('Preferences unavailable',e)}}
function snapshot(){return clone({slides:S.slides,currentSlide:S.currentSlide,randomMode:S.randomMode,showSafe:S.showSafe,finish:S.finish,designDNA:S.designDNA,frameBrief:S.frameBrief,frameTemplateFamily:S.frameTemplateFamily||'',frameCaption:S.frameCaption||'',frameArtDirection:S.frameArtDirection||'',frameLastDesign:S.frameLastDesign||null,frameBackground:S.frameBackground||'auto',frameTreatment:S.frameTreatment||'gallery',heroPhotoId:S.heroPhotoId||null,frameLocation:S.frameLocation||null})}
let quickUndo=null,undoTimer=null;function offerUndo(snap,label){quickUndo=snap;undoAction.classList.add('on');clearTimeout(undoTimer);undoTimer=setTimeout(()=>undoAction.classList.remove('on'),3000);toast(label)}undoAction.onclick=()=>{if(!quickUndo||busy)return;Object.assign(S,quickUndo);quickUndo=null;undoAction.classList.remove('on');renderAll();saveProject();toast('Deshecho')};
function syncBriefUI(){$('#briefLocationOptions').hidden=briefState.location!=='yes';brief.querySelectorAll('[data-key]').forEach(group=>{const key=group.dataset.key;group.querySelectorAll('button').forEach(b=>{b.classList.toggle('on',briefState[key]===b.dataset.v);b.setAttribute('aria-pressed',String(briefState[key]===b.dataset.v))})})}
brief.addEventListener('click',e=>{const b=e.target.closest('[data-key] button');if(!b)return;const g=b.closest('[data-key]');briefState[g.dataset.key]=b.dataset.v;syncBriefUI()});
let previousFocus=null, previousOverflow=null;
brief.setAttribute('role','dialog');
brief.setAttribute('aria-modal','true');
brief.setAttribute('aria-labelledby','frameBriefTitle');
brief.querySelector('h3').id='frameBriefTitle';
brief.querySelector('h3').textContent='¿Qué quieres hacer con este post?';
function showBrief(files,seed){
  const safe=seed&&typeof seed==='object'?seed:{};
  briefState={purpose:safe.purpose||'story',vibe:safe.vibe||'clean',density:safe.density||'balanced',location:safe.location||'no',locationPosition:safe.locationPosition||'last',locationText:safe.locationText||''};
  $('#briefLocationText').value=briefState.locationText;
  syncBriefUI();
  brief.querySelector('.frameBriefEyebrow').textContent=`${files.length} fotos seleccionadas`;
  $('#briefIntro').textContent='Dale tus preferencias a FRAME antes de analizar y diseñar.';
  brief.dataset.photoCount=String(files.length);
  previousFocus=document.activeElement;
  previousOverflow=[document.body.style.overflow,document.documentElement.style.overflow];
  const result=new Promise(resolve=>{briefResolve=resolve});
  brief.classList.add('on');
  document.body.style.overflow='hidden';document.documentElement.style.overflow='hidden';
  $('#briefGo').focus({preventScroll:true});
  return result;
}
function hideBrief(){
  brief.classList.remove('on');
  if(previousOverflow){[document.body.style.overflow,document.documentElement.style.overflow]=previousOverflow;previousOverflow=null}
  if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
}
brief.addEventListener('keydown',e=>{
  if(e.key!=='Tab')return;
  const buttons=[...brief.querySelectorAll('button,input')].filter(el=>!el.closest('[hidden]')),first=buttons[0],last=buttons.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
});
$('#briefLocationText').oninput=e=>{briefState.locationText=e.target.value};
$('#briefGo').onclick=()=>{const r=briefResolve;briefResolve=null;hideBrief();r?.({...briefState})};
$('#briefSurprise').onclick=()=>{const r=briefResolve;briefResolve=null;hideBrief();r?.({...briefState,purpose:'surprise',vibe:'surprise',density:'balanced'})};
function startPhotoFlow(){if(!busy)window.framePhotoImport.selectPhotos()}
$('#fastNewDesign').onclick=()=>{if(busy)return;if(emptyState()){startPhotoFlow();return}const snap=snapshot();setBusy(true);requestAnimationFrame(()=>{try{if(typeof window.FRAME_rebuildStory==='function')window.FRAME_rebuildStory();else fire('#directorBtn','#randomBtn');remember();offerUndo(snap,'Otra opción lista')}finally{setTimeout(()=>setBusy(false),180)}})};
$('#fastExport').onclick=()=>{if(busy)return;if(emptyState()){startPhotoFlow();return}if(!fire('#exportAllBtn','#exportBtn'))toast('Exportar no está disponible')};
$('#fastAdd').onclick=startPhotoFlow;$('#emptyAdd').onclick=startPhotoFlow;
const exportTool=$('#exportBtn');if(exportTool){let hold=false,timer;exportTool.onclick=null;exportTool.addEventListener('touchstart',()=>{hold=false;timer=setTimeout(()=>{hold=true;openSheet('#exportSheet')},520)},{passive:true});exportTool.addEventListener('touchend',e=>{clearTimeout(timer);if(!hold){e.preventDefault();fire('#exportAllBtn')}},{passive:false})}
const oldRenderAll=renderAll;renderAll=function(){oldRenderAll();requestAnimationFrame(emptyState)};const oldSave=saveProject;saveProject=function(){const saved=oldSave();remember();return saved};remember();
let persistenceWarning=false;
function progress(message){const loading=$('#loading');loading.querySelector('b').textContent=message;loading.querySelector('span').textContent='';loading.classList.add('on')}
function showStudio(){
  $('#uploadScreen').classList.remove('on');studio.classList.add('on');$('#newBtn').style.display='block';
  renderAll();
}
window.framePhotoImport=new PhotoImportController({
  input:photoInput,
  isBlocked:()=>busy,
  setBusy:on=>{setBusy(on);photoInput.disabled=on;$('#resumeBtn').disabled=on;$('#newBtn').disabled=on},
  requestBrief:files=>showBrief(files,S.frameBrief),
  showProgress:progress,
  hideProgress:()=>{hideBrief();$('#loading').classList.remove('on');emptyState()},
  yieldToPaint:()=>new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0))),
  analyzePhotos:FramePhotoAnalysis.analyzePhotos,
  checkpoint:()=>({state:{...S},studio:studio.classList.contains('on')}),
  commitPhotos:(photos,answers)=>{S.photos=[...S.photos,...photos];S.frameBrief=answers;S.frameLocation=FramePhotoLocation.settings(answers,S.photos);persistenceWarning=false},
  generateStoryboard:()=>buildSlides(),
  render:showStudio,
  persistPhotos:async(files,photos)=>{
    try{await FramePhotoStore.put(files,photos)}catch(error){persistenceWarning=true;console.warn('Original photo storage failed',error)}
    if(!saveProject())persistenceWarning=true;
  },
  rollback:checkpoint=>{S=checkpoint.state;studio.classList.toggle('on',checkpoint.studio);$('#uploadScreen').classList.toggle('on',!checkpoint.studio);renderAll()},
  releasePhotos:photos=>photos.forEach(photo=>URL.revokeObjectURL(photo.url)),
  onSuccess:count=>toast(persistenceWarning?'Fotos listas; no se pudo guardar en este dispositivo':`${count} fotos listas`),
  onError:error=>{console.warn('Photo import failed',error);toast('No pude añadir esas fotos. Tu proyecto se conserva.')},
  onPhase:(phase,count)=>{
    document.documentElement.dataset.photoImportPhase=phase;
    document.dispatchEvent(new CustomEvent('frame:import-phase',{detail:{phase,count}}));
  }
});
$('#resumeBtn').onclick=async()=>{
  if(busy)return;
  setBusy(true);photoInput.disabled=true;
  const previous=S;
  try{
    progress('Restaurando tus fotos…');
    let saved;
    try{saved=JSON.parse(localStorage.getItem(SAVE_KEY)||'null')}catch(e){}
    if(!saved?.photos?.length||!Array.isArray(saved.slides))throw new Error('No saved project');
    await FramePhotoStore.restore(saved);
    S=saved;showStudio();toast('Proyecto restaurado');
  }catch(error){S=previous;console.warn('Project restore failed',error);toast('No pude restaurar los originales guardados')}
  finally{$('#loading').classList.remove('on');photoInput.disabled=false;setBusy(false)}
};
})();
;
(()=>{
const css=document.createElement('style');css.textContent=`
/* Rescue pass: selection is safe; editing is intentional */
.imgLayer,.textLayer{touch-action:manipulation!important}.imgLayer.isEditArmed,.textLayer.isEditArmed{touch-action:none!important;outline:2px solid rgba(255,255,255,.92)!important;outline-offset:3px}.editHint{position:fixed;left:50%;bottom:calc(164px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:95;display:none;gap:7px;padding:7px;border-radius:18px;background:rgba(17,17,20,.94);border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(18px)}.editHint.on{display:flex}.editHint button{min-height:38px;padding:0 13px;border-radius:12px;border:0;background:#28282e;color:#fff;font-size:11px;font-weight:700}.editHint .danger{background:#3a171b;color:#ff9da6}.textQuickEdit{display:flex;gap:8px;margin:10px 0 2px}.textQuickEdit button{flex:1;min-height:42px;border-radius:13px;border:1px solid #303036;background:#111114;color:#eee;font-weight:700}.textQuickEdit .danger{border-color:#55252b;color:#ff8e98}.textLayer{cursor:pointer}
`;document.head.appendChild(css);
let armed=null;
const bar=document.createElement('div');bar.className='editHint';bar.innerHTML='<button id="uxEdit">Editar</button><button id="uxMove">Mover</button><button class="danger" id="uxDelete">Eliminar</button>';document.body.appendChild(bar);
function layer(){if(!S.selected)return null;return S.slides[S.currentSlide]?.layers.find(l=>l.id===S.selected)||null}
function disarm(){if(armed){armed.classList.remove('isEditArmed');armed=null}bar.classList.remove('on');document.body.classList.remove('uxArmed')}
function selectOnly(el){disarm();const si=+el.dataset.slide,id=el.dataset.id,type=el.classList.contains('textLayer')?'text':'img';S.currentSlide=si;S.selected=id;S.selectedType=type;$('#uxEdit').textContent=type==='img'?'Reencuadrar':'Editar';$('#uxMove').hidden=type==='img';renderFilmstrip?.();renderSheets?.();bar.classList.add('on')}
function arm(){const el=document.querySelector(`.slide[data-slide="${S.currentSlide}"] [data-id="${S.selected}"]`)||document.querySelector(`[data-id="${S.selected}"]`);if(!el)return;disarm();armed=el;armed.classList.add('isEditArmed');bar.classList.add('on');document.body.classList.add('uxArmed');toast(S.selectedType==='text'?'Arrastra para mover el texto':'Arrastra para reencuadrar')}
function remove(){const sl=S.slides[S.currentSlide];if(!sl||!S.selected)return;pushHistory?.();const i=sl.layers.findIndex(l=>l.id===S.selected);if(i<0)return;sl.layers.splice(i,1);S.selected=null;S.selectedType=null;disarm();renderAll();saveProject();toast('Elemento eliminado')}
function openEditor(){if(S.selectedType==='text'){renderTextSheet();openSheet('#textSheet');setTimeout(()=>$('#textInput')?.focus(),100)}else{window.FRAME_openPhotoEditor?.()}}
bar.querySelector('#uxEdit').onclick=openEditor;bar.querySelector('#uxMove').onclick=arm;bar.querySelector('#uxDelete').onclick=remove;
// Capture touch before legacy handlers: a normal touch only selects. Movement requires explicit Mover.
document.addEventListener('touchstart',e=>{const el=e.target.closest?.('.imgLayer,.textLayer');if(!el)return;if(el===armed)return;e.stopImmediatePropagation();selectOnly(el)},{capture:true,passive:true});
document.addEventListener('touchmove',e=>{const el=e.target.closest?.('.imgLayer,.textLayer');if(el&&el!==armed)e.stopImmediatePropagation()},{capture:true,passive:true});
document.addEventListener('touchend',e=>{const el=e.target.closest?.('.imgLayer,.textLayer');if(el&&el!==armed){e.stopImmediatePropagation();bar.classList.add('on')}},{capture:true,passive:true});
document.addEventListener('click',e=>{const el=e.target.closest?.('.imgLayer,.textLayer');if(!el||el===armed)return;e.preventDefault();e.stopImmediatePropagation();selectOnly(el)},{capture:true});
// Double tap/click edits instead of moving.
document.addEventListener('dblclick',e=>{const el=e.target.closest?.('.imgLayer,.textLayer');if(!el)return;e.preventDefault();e.stopImmediatePropagation();selectOnly(el);openEditor()},{capture:true});
// Add an unmistakable delete action inside the text editor itself.
function injectDelete(){const sh=$('#textSheet');if(!sh||$('#uxTextActions'))return;const host=sh.querySelector('.sheetBody')||sh;const row=document.createElement('div');row.id='uxTextActions';row.className='textQuickEdit';row.innerHTML='<button id="uxDoneText">Listo</button><button class="danger" id="uxDeleteText">Eliminar texto</button>';host.appendChild(row);row.querySelector('#uxDoneText').onclick=()=>{closeSheets();disarm()};row.querySelector('#uxDeleteText').onclick=remove}
injectDelete();const mo=new MutationObserver(injectDelete);mo.observe(document.body,{childList:true,subtree:true});
// Tapping outside clears edit intent, not the layout.
document.addEventListener('click',e=>{if(!e.target.closest?.('.imgLayer,.textLayer,.editHint,.sheet'))disarm()});
})();
;
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

;
/* Application adapter for the catalog engine; no legacy generation or file listeners. */
(() => {
  const catalog = window.FRAME_TEMPLATE_CATALOG;
  const engine = window.FrameTemplateEngine;
  let generation = 0;
  function buildStory() {
    if (!S.photos?.length) return;
    const seed = (Date.now() + (++generation) * 7919 + Math.floor(Math.random()*1e6)) >>> 0;
    const fixed=S.slides.map((sl,index)=>({sl,index})).filter(x=>x.sl.frameLocked);
    const retained=new Set(fixed.flatMap(x=>x.sl.layers.filter(l=>l.type==='img').map(l=>l.photo.id)));
    const available=S.photos.filter(p=>!retained.has(p.id));
    const result = engine.generate({catalog, photos:available, brief:S.frameBrief,
      familyId:S.frameTemplateFamily, previous:S.frameLastDesign, seed, caption:S.frameCaption,heroPhotoId:S.heroPhotoId,backgroundMode:S.frameBackground,frameTreatment:S.frameTreatment});
    result.slides.forEach(sl => {
      const photo = sl.layers.find(l=>l.type==='img')?.photo;
      sl.palette = palFromPhoto(photo);
    });
    fixed.forEach(({sl,index})=>result.slides.splice(Math.min(index,result.slides.length),0,sl));
    S.slides = result.slides;
    S.frameArtDirection = result.familyId||S.frameArtDirection;
    S.frameLastDesign = {dir:S.frameArtDirection,signature:engine.signature(result.slides),layouts:result.slides.map(sl=>sl.frameLayout)};
    S.currentSlide = 0; S.selected = null; S.selectedType = null;
  }
  window.FRAME_togglePageLock = index => {
    const sl=S.slides[index];if(!sl)return;pushHistory();
    const locked=!sl.frameLocked;
    S.slides.filter(p=>p===sl||(sl.storySpan&&p.storySpan?.photoId===sl.storySpan.photoId)).forEach(p=>p.frameLocked=locked);
    renderAll();saveProject();toast(locked?'Esta página se conserva en Otra opción':'Página liberada');
  };
  window.FRAME_generateStory = buildStory;
  window.FRAME_rebuildStory = () => {
    if (!S.photos?.length || window.framePhotoImport?.phase === 'brief') return;
    pushHistory(); buildStory(); renderAll(); saveProject();
    toast('Otra composición lista ✦');
  };

  const bar = document.createElement('div');
  bar.className = 'templateBar';
  const label = document.createElement('label'); label.htmlFor='templateFamily'; label.textContent='Estilo';
  const select = document.createElement('select'); select.id='templateFamily';
  select.append(new Option('Automático · según tu brief',''));
  catalog.families.forEach(f=>select.append(new Option(f.name,f.id)));
  const notes = document.createElement('details'); notes.className='templateNotes';
  const summary = document.createElement('summary'); summary.textContent='Nota al pie';
  const input = document.createElement('input'); input.id='templateCaption'; input.maxLength=120;
  input.placeholder='Una nota breve para este álbum'; input.setAttribute('aria-label','Nota al pie del álbum');
  notes.append(summary,input); bar.append(label,select,notes);
  const finish=document.createElement('details');finish.className='editorialFinish';
  finish.innerHTML='<summary>Fondo y marco</summary><div class="finishControls"><label>Fondo<select id="frameBackground" aria-label="Fondo del álbum"><option value="auto">Según el estilo</option><option value="white">Blanco</option><option value="black">Negro</option><option value="color">Color intenso</option></select></label><label>Marco<select id="frameTreatment" aria-label="Marco editorial"><option value="gallery">Galería</option><option value="mat">Paspartú</option><option value="fine">Filete fino</option></select></label></div>';
  bar.append(finish);
  const location=document.createElement('details');location.className='editorialFinish';
  location.innerHTML='<summary>Locación</summary><div class="locationControls"><label for="locationPosition">Una sola nota</label><select id="locationPosition"><option value="off">Sin locación</option><option value="first">En la primera</option><option value="middle">En el medio</option><option value="last">Al final</option></select><label for="locationText">Lugar</label><input id="locationText" maxlength="80" placeholder="Escribe el lugar" autocomplete="off"><p id="locationStatus" class="locationHint" role="status"></p><p class="locationHint">Localidades aproximadas · <a href="https://www.geonames.org/" target="_blank" rel="noopener">GeoNames</a> / <a href="https://github.com/lutangar/cities.json" target="_blank" rel="noopener">cities.json</a> · CC BY 4.0. Sin enviar coordenadas.</p></div>';
  bar.append(location);
  function changeLocation(event){
    if($('#locationPosition').disabled)return;
    pushHistory();const position=$('#locationPosition').value,text=FramePhotoLocation.clean($('#locationText').value);
    S.frameLocation={...(S.frameLocation||{}),enabled:position!=='off',position:position==='off'?'last':position,text,source:event.target.id==='locationText'?'manual':S.frameLocation?.source||'manual'};
    S.frameBrief={...(S.frameBrief||{}),location:position==='off'?'no':'yes',locationPosition:S.frameLocation.position,locationText:S.frameLocation.source==='manual'?text:''};
    renderAll();saveProject();
  }
  document.querySelector('.quickbar')?.after(bar);
  $('#locationPosition').onchange=changeLocation;$('#locationText').onchange=changeLocation;
  for(const [id,key] of [['frameBackground','frameBackground'],['frameTreatment','frameTreatment']]){
    $('#'+id).onchange=e=>{if(e.target.disabled||!S.photos.length)return;pushHistory();S[key]=e.target.value;buildStory();renderAll();saveProject()};
  }
  const supportsCaption = id => catalog.families.find(f=>f.id===id)?.variants.some(v=>v.captionRegion);
  function sync() {
    const loc=S.frameLocation;
    $('#locationPosition').value=loc?.enabled?loc.position:'off';
    if(document.activeElement!==$('#locationText'))$('#locationText').value=loc?.text||'';
    $('#locationStatus').textContent=!loc?.enabled?'La locación está desactivada.':loc.text?(loc.source==='gps'?`Localidad cercana al GPS de ${loc.matched}/${loc.total} fotos. Puedes corregir el texto.`:'Tu lugar aparecerá una sola vez, debajo de las fotos.'):'No pudimos obtener una localidad de estas fotos. Escribe el lugar para incluirlo.';
    if(loc?.enabled&&!loc.text)location.open=true;

    select.value=S.frameTemplateFamily||'';
    $('#frameBackground').value=S.frameBackground||'auto';$('#frameTreatment').value=S.frameTreatment||'gallery';
    if (document.activeElement!==input) input.value=S.frameCaption||'';
    notes.hidden=!supportsCaption(S.frameTemplateFamily||S.frameArtDirection);
    const family=catalog.families.find(f=>f.id===S.frameArtDirection);
    if (family && S.slides.length) $('#modeLabel').textContent=family.name;
  }
  select.onchange=()=>{
    if (select.disabled || !S.photos.length) return;
    pushHistory(); S.frameTemplateFamily=select.value; buildStory();renderAll();saveProject();
  };
  input.onchange=()=>{
    if (input.disabled || !S.photos.length) return;
    pushHistory(); S.frameCaption=input.value.trim();
    // Reuse the last design seed is unnecessary: changing a note must preserve geometry.
    S.slides.forEach(sl=>sl.layers=sl.layers.filter(l=>!l.frameCaption));
    const sl=S.slides.find(sl=>sl.frameCaptionRegion);
    if (sl && S.frameCaption) {
      const r=sl.frameCaptionRegion;
      const lines=window.FrameTemplateEngine.captionLines(S.frameCaption);
      const l=makeText(lines,r.x*340,r.y*425,r.w*340,6.5,engine.captionInk(sl.bg),'mono',400,0);
      l.frameCaption=true;l.userTouched=true;sl.layers.push(l);
    }
    renderAll();saveProject();
  };
  document.addEventListener('frame:import-phase',event=>{
    $('#locationPosition').disabled=$('#locationText').disabled=select.disabled=input.disabled=$('#frameBackground').disabled=$('#frameTreatment').disabled=event.detail.phase!=='idle';
  });
  const render = renderAll;
  renderAll = function() { render(); sync(); };
  sync();
  const css=document.createElement('style');
  css.textContent=`.templateBar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:0 16px 12px}.templateBar label{font-size:11px;color:#999}.templateBar select{flex:1;min-width:0;max-width:100%;min-height:40px;color:#eee;background:#151518;border:1px solid #303036;border-radius:12px;padding:0 10px;font:inherit;font-size:12px}.templateBar select:disabled{opacity:.45}.templateNotes{width:100%;font-size:11px;color:#aaa}.templateNotes summary{cursor:pointer;padding:4px 0}.templateNotes input{box-sizing:border-box;width:100%;min-height:40px;margin-top:5px;border:1px solid #303036;border-radius:10px;padding:8px 10px;background:#151518;color:#eee;font-size:16px}.emptyStateFast .templateBar{display:none}.slide[data-family] .textLayer{letter-spacing:normal;text-shadow:none}#storyBadge,.storyBadge,.coverageBadge{display:none!important}`;
  css.textContent+='.locationLabel{pointer-events:none;white-space:pre-wrap}.editorialFinish{width:100%;font-size:11px;color:#aaa}.editorialFinish summary{padding:8px 0;cursor:pointer}.finishControls{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:8px 0}.finishControls label{display:grid;gap:6px}.finishControls select{width:100%;min-height:44px}.pagePin{position:absolute;left:10px;top:10px;z-index:207;border-radius:20px;padding:0 12px;min-height:36px;background:#141414b8;color:#fff;font-size:10px;backdrop-filter:blur(12px)}.pagePin[aria-pressed=true]{background:#f5f5f2;color:#111}.slide{border-radius:3px;box-shadow:0 10px 35px #0005}.thumb{border-radius:3px}.miniPage{pointer-events:none}.quickbar button{min-height:46px;transition:background .16s,opacity .16s}.templateBar{gap:6px}.templateNotes summary{padding:6px 0}.logo{letter-spacing:.13em;font-size:18px}.logo b{color:inherit}.studioTop h2{font-family:Georgia,serif;font-weight:400;letter-spacing:-.03em}.sheet button,.editHint button{min-height:44px}.hero{letter-spacing:-.06em}.pickerGrid{transform:none}.pickGlow{display:none}:root{--accent:#ecebe5}button:focus-visible,select:focus-visible,summary:focus-visible{outline:2px solid #f1f1ed;outline-offset:3px}@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}';
  document.head.appendChild(css);
  $('.logo').textContent='FRAME';$('#studioScreen h2').textContent='Tu álbum';
})();

;
/* Dedicated crop transaction. Draft changes never touch the project until Done. */
(()=>{
 const css=document.createElement('style');css.textContent='.photoClip{position:absolute;overflow:hidden;touch-action:manipulation}.photoClip>.imgLayer{max-width:none!important;max-height:none!important;margin:0;border-radius:0}.photoEditOverlay{position:fixed;inset:0;z-index:220;display:none;background:#101011;padding:env(safe-area-inset-top) 16px env(safe-area-inset-bottom);box-sizing:border-box}.photoEditOverlay.on{display:flex;flex-direction:column;height:100dvh}.peTop{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:64px}.peTop b{font-size:14px}.peTop button{min-height:44px;padding:0 12px;color:#f7f7f5;font-size:14px}.peTop .peDone{background:#f7f7f5;color:#111;border-radius:24px;font-weight:700}.peStage{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:12px 0;background:#080808;border-radius:12px;overflow:hidden}.peFrame{position:relative;overflow:hidden;touch-action:none;user-select:none;outline:1px solid #ffffff30}.peFrame img{position:absolute;max-width:none;max-height:none;user-select:none;-webkit-user-drag:none;pointer-events:none}.peFrame:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,transparent 33.1%,#ffffff25 33.2%,#ffffff25 33.5%,transparent 33.6%,transparent 66.4%,#ffffff25 66.5%,#ffffff25 66.8%,transparent 66.9%),linear-gradient(transparent 33.1%,#ffffff25 33.2%,#ffffff25 33.5%,transparent 33.6%,transparent 66.4%,#ffffff25 66.5%,#ffffff25 66.8%,transparent 66.9%)}.peBottom{padding:12px 0 14px;max-height:40dvh;overflow:auto}.peHint{font-size:11px;text-align:center;color:#999;margin:0 0 12px}.peActions{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.peActions button{min-height:44px;border:1px solid #343436;border-radius:12px;font-size:11px;color:#ddd}.peActions button[aria-pressed=true]{background:#efefec;color:#111;border-color:#efefec}.peSlider{display:flex;gap:12px;align-items:center;margin:12px 0}.peSlider input{flex:1;min-width:0;accent-color:#eee;height:36px}.peSlider span{font-size:11px;color:#bbb}.peHero{width:100%;min-height:44px;border:1px solid #4b4b4d;border-radius:12px;color:#eee;font-size:12px}.peHero:disabled{opacity:.55;cursor:default}.peFrame:focus-visible{outline:2px solid #fff}';document.head.append(css);
 const ov=document.createElement('div');ov.id='photoEditV2';ov.className='photoEditOverlay';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','peTitle');
 ov.innerHTML='<div class="peTop"><button id="peCancel">Cancelar</button><b id="peTitle">Reencuadrar</b><button id="peDone" class="peDone">Listo</button></div><div class="peStage"><div id="peFrame" class="peFrame" tabindex="0" aria-label="Encuadre de la foto; arrastra o usa las flechas"><img id="peImg" alt=""></div></div><div class="peBottom"><p class="peHint">Arrastra la foto · Pellizca para acercar</p><div class="peActions"><button id="peContain">Foto completa</button><button id="peCover">Llenar marco</button><button id="peCenter">Centrar</button></div><div class="peSlider"><span>Zoom</span><input id="peZoom" aria-label="Zoom de la foto" type="range" min="1" max="3" step=".01"><span id="peZoomVal"></span></div><button id="peHero" class="peHero">Usar como portada</button></div>';document.body.append(ov);
 const frame=$('#peFrame'),im=$('#peImg'),zr=$('#peZoom'),pointers=new Map();
 let edit=null,gesture=null,previousFocus=null,oldOverflow=null;
 function paint(){
  if(!edit)return;const area=frame.parentElement,r=edit.draft.w/edit.draft.h;
  const aw=area.clientWidth||300,ah=Math.max(1,(area.clientHeight||350)-24),w=Math.max(1,Math.min(aw-24,ah*r)),h=w/r;
  frame.style.width=w+'px';frame.style.height=h+'px';frame.style.background=edit.bg;
  const g=FrameCrop.geometry(edit.draft,w,h);Object.assign(im.style,{width:g.w+'px',height:g.h+'px',left:g.x+'px',top:g.y+'px'});
  zr.value=edit.draft.zoom;$('#peZoomVal').textContent=Number(edit.draft.zoom).toFixed(2)+'×';
  $('#peContain').setAttribute('aria-pressed',String(edit.draft.fit==='contain'));$('#peCover').setAttribute('aria-pressed',String(edit.draft.fit!=='contain'));
 }
 function open(){
  const l=S.slides?.[S.currentSlide]?.layers.find(l=>l.id===S.selected);if(!l||l.type!=='img')return;
  previousFocus=document.activeElement;oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';closeSheets();
  edit={layer:l,draft:{...l,fit:l.fit||'cover',zoom:l.zoom||1,offX:l.offX||0,offY:l.offY||0},bg:S.slides[S.currentSlide].bg};
  im.src=l.photo.url;im.alt=l.photo.name||'Foto seleccionada';const fixedPhoto=S.heroPhotoId!==l.photo.id&&S.slides.some(sl=>sl.frameLocked&&sl.layers.some(x=>x.type==='img'&&x.photo.id===l.photo.id));$('#peHero').disabled=fixedPhoto;$('#peHero').textContent=fixedPhoto?'Libera esta página para usarla como portada':S.heroPhotoId===l.photo.id?'Portada fijada · liberar':'Usar como portada';
  ov.classList.add('on');requestAnimationFrame(()=>{paint();frame.focus({preventScroll:true})});
 }
 function close(save,hero=false){
  if(!edit)return;
  if(save){
   pushHistory();
   const targets=edit.layer.storySpan?S.slides.flatMap(sl=>sl.layers).filter(l=>l.storySpan&&l.photo.id===edit.layer.photo.id):[edit.layer];
   for(const l of targets)Object.assign(l,{fit:edit.draft.fit,zoom:edit.draft.zoom,offX:edit.draft.offX,offY:edit.draft.offY,userTouched:true});
   if(hero){S.heroPhotoId=S.heroPhotoId===edit.layer.photo.id?null:edit.layer.photo.id;window.FRAME_generateStory()}
  }
  edit=null;gesture=null;pointers.clear();ov.classList.remove('on');document.body.style.overflow=oldOverflow||'';
  if(save){renderAll();saveProject();toast(hero?'Portada actualizada':'Encuadre guardado')}
  if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
 }
 window.FRAME_openPhotoEditor=open;
 $('#peCancel').onclick=()=>close(false);$('#peDone').onclick=()=>close(true);$('#peHero').onclick=()=>close(true,true);
 $('#peContain').onclick=()=>{if(edit){Object.assign(edit.draft,{fit:'contain',zoom:1,offX:0,offY:0});paint()}};
 $('#peCover').onclick=()=>{if(edit){Object.assign(edit.draft,{fit:'cover',zoom:1,offX:0,offY:0});paint()}};
 $('#peCenter').onclick=()=>{if(edit){edit.draft.offX=edit.draft.offY=0;paint()}};
 zr.oninput=()=>{if(!edit)return;const r=frame.getBoundingClientRect(),center={x:r.width/2,y:r.height/2};edit.draft=FrameCrop.pinch(edit.draft,r.width,r.height,+zr.value,center,center);paint()};
 function center(points){return points.reduce((a,p)=>({x:a.x+p.x/points.length,y:a.y+p.y/points.length}),{x:0,y:0})}
 function startGesture(){if(!edit)return;const ps=[...pointers.values()],r=frame.getBoundingClientRect();gesture={draft:{...edit.draft},center:center(ps),dist:ps.length>1?Math.hypot(ps[1].x-ps[0].x,ps[1].y-ps[0].y):0,w:r.width,h:r.height}}
 frame.addEventListener('pointerdown',e=>{if(!edit)return;e.preventDefault();frame.setPointerCapture(e.pointerId);const r=frame.getBoundingClientRect();pointers.set(e.pointerId,{x:e.clientX-r.left,y:e.clientY-r.top});startGesture()});
 frame.addEventListener('pointermove',e=>{if(!edit||!pointers.has(e.pointerId)||!gesture)return;e.preventDefault();const r=frame.getBoundingClientRect();pointers.set(e.pointerId,{x:e.clientX-r.left,y:e.clientY-r.top});const ps=[...pointers.values()],c=center(ps),g=gesture;
  if(ps.length>1&&g.dist){const dist=Math.hypot(ps[1].x-ps[0].x,ps[1].y-ps[0].y);edit.draft=FrameCrop.pinch(g.draft,g.w,g.h,g.draft.zoom*dist/g.dist,g.center,c)}
  else edit.draft={...g.draft,...FrameCrop.pan(g.draft,g.w,g.h,c.x-g.center.x,c.y-g.center.y)};
  paint();
 });
 function end(e){pointers.delete(e.pointerId);if(pointers.size)startGesture();else gesture=null}
 frame.addEventListener('pointerup',end);frame.addEventListener('pointercancel',end);frame.addEventListener('lostpointercapture',end);
 frame.addEventListener('keydown',e=>{if(!edit||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const r=frame.getBoundingClientRect(),d=e.shiftKey?20:5;Object.assign(edit.draft,FrameCrop.pan(edit.draft,r.width,r.height,e.key==='ArrowLeft'?-d:e.key==='ArrowRight'?d:0,e.key==='ArrowUp'?-d:e.key==='ArrowDown'?d:0));paint()});
 ov.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close(false)}if(e.key==='Tab'){const nodes=[...ov.querySelectorAll('button,input,[tabindex="0"]')],first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(paint).observe(frame.parentElement);
 document.addEventListener('click',e=>{if(e.target?.id==='uxEdit'&&S.selectedType==='img'){e.preventDefault();e.stopImmediatePropagation();open()}},{capture:true});
})();
