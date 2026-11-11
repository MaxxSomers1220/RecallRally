// Original sampled scores share the game's AudioContext and music/effects buses.
// Hosted cues load on demand; the standalone edition retains embedded audio.
const StorybookMusic=(()=>{
 const CACHE_LIMIT=3,CACHE_BYTES=60*1024*1024,cache=new Map(),live=new Map(),pins=new Map(),starts={};
 let observer=null,queue=[],decoding=null,requested,serial=0;
 const supports=kind=>Object.hasOwn(STORYBOOK_AUDIO,kind);
 const metadata=kind=>STORYBOOK_AUDIO[kind]||null;
 function cue(kind){
  const seen=new Set();
  while(metadata(kind)?.dataRef&&supports(metadata(kind).dataRef)&&!seen.has(kind)){seen.add(kind);kind=metadata(kind).dataRef}
  return kind;
 }
 function gapless(decoded,meta,context){
  const rate=decoded.sampleRate,frames=Math.round((meta.loopFrames||meta.loopSeconds*meta.sampleRate)*rate/meta.sampleRate);
  if(Math.abs(decoded.length-frames)<=2)return decoded;
  // WebKit/GStreamer may expose MPEG padding rather than honoring the gapless tags.
  const encoded=Math.round(meta.mp3.encodedFrames*rate/meta.sampleRate),skip=Math.round(meta.mp3.skipSamples*rate/meta.sampleRate);
  if(Math.abs(decoded.length-encoded)>2||skip+frames>decoded.length)throw Error('Unrecognized decoded music length');
  const trimmed=context.createBuffer(decoded.numberOfChannels,frames,rate);
  for(let channel=0;channel<decoded.numberOfChannels;channel++)trimmed.copyToChannel(decoded.getChannelData(channel).subarray(skip,skip+frames),channel);
  return trimmed;
 }
 function softenLoopEdge(decoded,meta){
  const frames=Math.min(Math.round(meta.loopSeconds*decoded.sampleRate),decoded.length),start=Math.max(1,frames-Math.max(2,Math.round(decoded.sampleRate*.002)));
  for(let channel=0;channel<decoded.numberOfChannels;channel++){
   const samples=decoded.getChannelData(channel),first=samples[0];if(Math.abs(samples[frames-1]-first)<=.004)continue;
   // MP3 can leave a small discontinuity even when the source PCM is periodic.
   // Repair only the final two milliseconds, in place, retaining exact loop bounds.
   for(let i=start;i<frames;i++){const mix=(1-Math.cos(Math.PI*(i-start)/(frames-1-start)))*.5;samples[i]=samples[i]*(1-mix)+first*mix}
  }
  return decoded;
 }
 const size=entry=>entry.buffer?entry.buffer.length*entry.buffer.numberOfChannels*4:0;
 function trim(keep=null){
  let entries=[...cache.values()].filter(e=>e.buffer),bytes=entries.reduce((sum,e)=>sum+size(e),0);
  for(const entry of entries.sort((a,b)=>a.used-b.used)){
   if(entries.length<=CACHE_LIMIT&&bytes<=CACHE_BYTES)break;
   if(entry===keep||pins.has(entry.kind))continue;
   bytes-=size(entry);entries=entries.filter(e=>e!==entry);cache.delete(entry.kind);entry.buffer=null;
  }
 }
 function finish(entry){
  const callbacks=[...entry.ready];entry.ready.clear();
  if(!entry.cancelled)for(const ready of callbacks){try{ready()}catch(e){console.warn('Music state could not be refreshed',e)}}
 }
 async function pump(){
  if(decoding)return;
  const entry=queue.shift();if(!entry)return;
  decoding=entry;entry.queued=false;let phase='load';
  try{
   const meta=metadata(entry.kind);let bytes;
   if(meta.url){
    const url=new URL(meta.url,document.baseURI||location.href);
    if(!['http:','https:'].includes(url.protocol)||url.origin!==location.origin)throw Error('Music URL must use the page origin');
    entry.controller=new AbortController();
    const response=await fetch(url.href,{signal:entry.controller.signal,mode:'same-origin',credentials:'same-origin'});
    if(!response.ok){entry.httpStatus=response.status;throw Error('Music HTTP request failed')}
    bytes=await response.arrayBuffer();
   }else{
    const encoded=atob(meta.data),data=new Uint8Array(encoded.length);
    for(let i=0;i<encoded.length;i++)data[i]=encoded.charCodeAt(i);
    bytes=data.buffer;
   }
   if(entry.cancelled)return;
   phase='decode';let decoded=await entry.context.decodeAudioData(bytes);
   if(!entry.cancelled){
    decoded=softenLoopEdge(gapless(decoded,meta,entry.context),meta);
    if(decoded.duration+.004<meta.loopSeconds)throw Error('Incomplete music');
    entry.buffer=decoded;entry.used=++serial;trim(entry);
   }
  }catch(e){if(!entry.cancelled)entry.error=(phase==='decode'?'Music could not be decoded.':'Music could not be loaded'+(entry.httpStatus?' (HTTP '+entry.httpStatus+')':'')+'.')+' Sound effects remain available. Leave this scene and return to retry.'}
  finally{
   entry.pending=false;entry.controller=null;decoding=null;
   if(entry.cancelled&&cache.get(entry.kind)===entry)cache.delete(entry.kind);
   finish(entry);pump();
  }
 }
 function request(kind){
  const changed=requested!==kind,key=cue(kind);requested=kind;
  for(const entry of cache.values())if(entry.pending&&entry.kind!==key){entry.cancelled=true;entry.ready.clear();entry.controller?.abort();cache.delete(entry.kind)}
  queue=queue.filter(entry=>{if(!entry.cancelled)return true;entry.pending=false;return false});
  // A failed cue retries only after the user leaves and reenters it. Repeated
  // control updates and the completion callback must not form a retry loop.
  if(changed&&cache.get(key)?.error)cache.delete(key);
 }
 function buffer(kind,context,ready){
  if(!supports(kind))return null;
  const key=cue(kind);let entry=cache.get(key);
  if(entry?.buffer){entry.used=++serial;return entry.buffer}
  if(entry?.error)return null;
  if(requested!==undefined&&cue(requested)!==key)return null;
  if(!entry){entry={kind:key,context,buffer:null,error:null,pending:true,queued:true,cancelled:false,ready:new Set(),used:++serial};cache.set(key,entry);queue.push(entry)}
  if(typeof ready==='function')entry.ready.add(ready);pump();return null;
 }
 function release(node){
  const kind=live.get(node);if(kind===undefined)return;
  live.delete(node);const count=(pins.get(kind)||1)-1;if(count)pins.set(kind,count);else pins.delete(kind);trim();
 }
 function play(kind,context,bus,voices,at,offset){
  const key=cue(kind),entry=cache.get(key),decoded=entry?.buffer;if(!decoded||live.size>=2||context.state!=='running'||requested!==undefined&&cue(requested)!==key)return null;
  entry.used=++serial;const node=context.createBufferSource();node.buffer=decoded;node.loop=true;node.loopStart=0;
  node.loopEnd=Math.min(Math.round(metadata(kind).loopSeconds*decoded.sampleRate),decoded.length)/decoded.sampleRate;
  node.connect(bus);live.set(node,key);pins.set(key,(pins.get(key)||0)+1);voices.add(node);
  node.onended=()=>{release(node);voices.delete(node);node.disconnect()};
  const position=Number.isFinite(offset)?((offset%node.loopEnd)+node.loopEnd)%node.loopEnd:0;
  try{node.start(at,position);starts[kind]=(starts[kind]||0)+1}catch(e){release(node);voices.delete(node);node.disconnect();return null}
  return node;
 }
 function init(){
  if(observer)return;observer=new MutationObserver(()=>syncAdventureMusic());
  for(const dialog of document.querySelectorAll('dialog'))observer.observe(dialog,{attributes:true,attributeFilter:['open']});
  for(const id of ['home-view','game-view','summary-view']){const view=document.getElementById(id);if(view)observer.observe(view,{attributes:true,attributeFilter:['hidden','class']})}
  observer.observe(document.body,{childList:true});
  document.addEventListener('rally-music-state',()=>syncAdventureMusic());
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 return{supports,metadata,request,buffer,play,release,title:kind=>metadata(kind)?.title,error:kind=>cache.get(cue(kind))?.error||null,pending:kind=>!!cache.get(cue(kind))?.pending,
  inspect:()=>({observers:observer?1:0,cacheLimit:CACHE_LIMIT,cacheByteLimit:CACHE_BYTES,decodedBytes:[...cache.values()].reduce((sum,e)=>sum+size(e),0),liveSources:live.size,starts:{...starts},requested:requested??null,decoderBusy:!!decoding,queued:queue.map(e=>e.kind),decoded:[...cache.values()].filter(e=>e.buffer).map(e=>({id:e.kind,duration:e.buffer.duration,bytes:size(e),pinned:!!pins.get(e.kind)})),pending:[...cache.values()].filter(e=>e.pending).map(e=>e.kind),errors:[...cache.values()].filter(e=>e.error).map(e=>({id:e.kind,message:e.error}))})};
})();
