// Two locally embedded sampled scores; playback uses the game's existing AudioContext/buses.
const StorybookMusic=(()=>{
 const cache=new Map(),live=new Set(),starts={home:0,map:0};let observer=null;
 const supports=kind=>Object.hasOwn(STORYBOOK_AUDIO,kind);
 function gapless(decoded,meta,context){
  const rate=decoded.sampleRate,frames=Math.round(meta.loopSeconds*rate);
  if(Math.abs(decoded.length-frames)<=2)return decoded;
  // Some WebKit/GStreamer decoders expose complete MPEG frames instead of honoring gapless tags.
  const encoded=Math.round(meta.mp3.encodedFrames*rate/meta.sampleRate),skip=Math.round(meta.mp3.skipSamples*rate/meta.sampleRate);
  if(Math.abs(decoded.length-encoded)>2||skip+frames>decoded.length)throw Error('Unrecognized decoded music length');
  const trimmed=context.createBuffer(decoded.numberOfChannels,frames,rate);
  for(let channel=0;channel<decoded.numberOfChannels;channel++)trimmed.copyToChannel(decoded.getChannelData(channel).subarray(skip,skip+frames),channel);
  return trimmed;
 }
 function buffer(kind,context,ready){
  let entry=cache.get(kind);if(entry)return entry.buffer||null;
  entry={buffer:null,error:null};cache.set(kind,entry);
  try{
   const encoded=atob(STORYBOOK_AUDIO[kind].data),bytes=new Uint8Array(encoded.length);
   for(let i=0;i<encoded.length;i++)bytes[i]=encoded.charCodeAt(i);
   entry.pending=context.decodeAudioData(bytes.buffer).then(decoded=>{
    decoded=gapless(decoded,STORYBOOK_AUDIO[kind],context);
    if(decoded.duration+.004<STORYBOOK_AUDIO[kind].loopSeconds)throw Error('Incomplete embedded music');
    entry.buffer=decoded;entry.pending=null;ready();
   }).catch(()=>{entry.pending=null;entry.error='Music could not be decoded. Sound effects remain available.';updateMusicControls()});
  }catch{entry.error='Music could not be decoded. Sound effects remain available.';}
  return null;
 }
 function play(kind,context,bus,voices,at,offset){
  const decoded=cache.get(kind)?.buffer;if(!decoded)return null;
  const node=context.createBufferSource();node.buffer=decoded;node.loop=true;node.loopStart=0;
  node.loopEnd=Math.min(Math.round(STORYBOOK_AUDIO[kind].loopSeconds*decoded.sampleRate),decoded.length)/decoded.sampleRate;node.connect(bus);live.add(node);voices.add(node);starts[kind]++;
  node.onended=()=>{live.delete(node);voices.delete(node);node.disconnect()};
  node.start(at,Math.max(0,offset)%node.loopEnd);return node;
 }
 function init(){
  if(observer)return;observer=new MutationObserver(()=>syncAdventureMusic());
  for(const dialog of document.querySelectorAll('dialog'))observer.observe(dialog,{attributes:true,attributeFilter:['open']});
  const home=document.getElementById('home-view');if(home)observer.observe(home,{attributes:true,attributeFilter:['hidden','class']});
  observer.observe(document.body,{childList:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 return{supports,buffer,play,release:node=>live.delete(node),title:kind=>STORYBOOK_AUDIO[kind]?.title,error:kind=>cache.get(kind)?.error||null,pending:kind=>!!cache.get(kind)?.pending,
  inspect:()=>({observers:observer?1:0,liveSources:live.size,starts:{...starts},decoded:[...cache].filter(([,v])=>v.buffer).map(([id,v])=>({id,duration:v.buffer.duration,bytes:v.buffer.length*v.buffer.numberOfChannels*4})),pending:[...cache].filter(([,v])=>v.pending).map(([id])=>id),errors:[...cache].filter(([,v])=>v.error).map(([id,v])=>({id,message:v.error}))})};
})();
