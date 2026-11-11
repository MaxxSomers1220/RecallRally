'use strict';
// Deferred decodes make navigation races and cache pressure deterministic without
// requiring a sound device or allocating the production soundtrack's PCM.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../src/storybook-music.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),coordinator=html.slice(html.indexOf('const MUSIC_KEY='),html.indexOf('// End original soundtrack.'));
const audioInit=html.slice(html.indexOf('function initAudio('),html.indexOf('// Original Tokyo-lofi fantasy soundtrack'));
const ids=['home','map',...Array.from({length:10},(_,i)=>'world-'+i),'duel-high','lab-hub',...['potion','circuit','creature','weather','observatory'].map(id=>'lab-'+id),'practice','library','library-storm','rescue','finale'];
const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve()};
function audioBuffer(channels,length,rate){
 const data=Array.from({length:channels},()=>new Float32Array(length));
 return {numberOfChannels:channels,length,sampleRate:rate,duration:length/rate,getChannelData:c=>data[c],copyToChannel:(samples,c,offset=0)=>data[c].set(samples,offset)};
}
function harness(rate=44100){
 const requests=[],sources=[],callbacks=[],updates=[];
 const catalog=Object.fromEntries(ids.map(id=>[id,{title:id,bpm:80,loopBars:16,sampleRate:32000,loopFrames:32000,loopSeconds:1,mp3:{encodedFrames:34560,skipSamples:1105,discardPadding:1455},data:Buffer.from(id).toString('base64')}]));
 const context={sampleRate:rate,currentTime:0,state:'running',destination:{},createBuffer:audioBuffer,
  createGain(){return {gain:{value:1,cancelAndHoldAtTime(){},cancelScheduledValues(){},setValueAtTime(v){this.value=v},linearRampToValueAtTime(v){this.value=v}},connect(){},disconnect(){this.disconnected=true}}},
  decodeAudioData(bytes){return new Promise((resolve,reject)=>requests.push({id:Buffer.from(bytes).toString(),resolve,reject}))},
  createBufferSource(){const node={connect(){},disconnect(){this.disconnected=true},start(at,offset){this.at=at;this.offset=offset;this.started=true},stop(){this.stopped=true;this.onended?.()}};sources.push(node);return node}};
 const scope={STORYBOOK_AUDIO:catalog,atob:s=>Buffer.from(s,'base64').toString('binary'),Uint8Array,Map,Set,console,
  MutationObserver:class{constructor(fn){this.fn=fn}observe(){}},document:{readyState:'complete',querySelectorAll:()=>[],getElementById:()=>null,addEventListener(){},body:{}},
  syncAdventureMusic:()=>callbacks.push('sync'),updateMusicControls:()=>updates.push('update')};
 vm.createContext(scope);vm.runInContext(source+';this.music=StorybookMusic',scope);
 const music=scope.music;
 async function resolve(id,{padded=false,invalid=false,silent=false}={}){
  const request=requests.find(x=>x.id===id&&!x.finished);assert(request,'Queued decoder request for '+id);request.finished=true;
  const meta=catalog[id],frames=Math.round(meta.loopSeconds*rate),skip=padded?Math.round(meta.mp3.skipSamples*rate/meta.sampleRate):0;
  const length=invalid?Math.round(frames/2):padded?Math.round(meta.mp3.encodedFrames*rate/meta.sampleRate):frames,buffer=audioBuffer(2,length,rate);
  if(!silent)for(let c=0;c<2;c++)for(let i=0;i<Math.min(frames,length-skip);i++)buffer.getChannelData(c)[i+skip]=Math.sin(i/61)*.1+c*.01;
  request.resolve(buffer);await flush();return buffer;
 }
 function request(id){music.request(id);return music.buffer(id,context,()=>callbacks.push(id))}
 return {music,context,catalog,requests,sources,callbacks,updates,resolve,request,scope,eval:code=>vm.runInContext(code,scope)};
}
function coordinated(){
 const h=harness(32000),s=h.scope;let wall=0,intervals=0;
 const home={hidden:false,classList:{contains:()=>s.homeChoice}};Object.assign(s,{homeChoice:false,dialogOpen:false,labScene:null,libraryScene:null,mode:'adventure',duel:null,game:null,soundOn:true,audioContext:h.context,LANDS:Array.from({length:10}),
  $:id=>id==='home-view'?home:null,ScienceLab:{musicState:()=>s.labScene},window:{LibrarianAudio:{musicState:()=>s.libraryScene}},
  localStorage:{getItem:()=>null,setItem(){}},initAudio(){},setInterval(){return ++intervals},performance:{now:()=>wall}});
 s.document.querySelector=()=>s.dialogOpen?{}:null;s.document.hidden=false;
 h.eval(audioInit+coordinator+';audioUnlocked=true;ensureAudioGraph();');
 return {...h,home,advance(seconds,{wallOnly=false}={}){wall+=seconds*1000;if(!wallOnly)h.context.currentTime+=seconds;h.eval('soundtrackTick()')},intervals:()=>intervals};
}
async function run(){
 for(const rate of [22050,44100,48000])for(const padded of [false,true]){
  const h=harness(rate);assert.equal(h.request('home'),null);assert(h.music.pending('home'));
  const raw=await h.resolve('home',{padded}),buffer=h.music.buffer('home',h.context,()=>{});
  assert(buffer,'Decoded buffer is ready');assert.equal(buffer.length,rate,'Loop length uses decoded output rate');assert.equal(buffer.sampleRate,rate);
  assert(Math.abs(buffer.getChannelData(1)[0]-.01)<1e-6,'Gapless trimming starts at first musical sample');if(!padded)assert.equal(buffer,raw,'Gapless decoder buffer is reused');
  for(let c=0;c<2;c++){
   const samples=buffer.getChannelData(c),safe=rate-Math.round(rate*.002)-2;
   assert(Math.abs(samples[0]-samples.at(-1))<=.004,'Decoded seam repair meets its discontinuity threshold');
   assert(Math.abs(samples[safe]-(Math.sin(safe/61)*.1+c*.01))<1e-6,'Seam repair preserves samples before the final two milliseconds');
  }
  const voices=new Set(),node=h.music.play('home',h.context,{},voices,3.25,2.125);
  assert(node&&node.loop);assert.equal(node.loopStart,0);assert.equal(node.loopEnd,1);assert.equal(node.at,3.25);assert.equal(node.offset,.125,'Resume wraps at the exact loop length');
  assert.equal(voices.size,1);assert.equal(h.music.inspect().liveSources,1);assert.equal(h.music.inspect().starts.home,1);
  node.stop();assert.equal(voices.size,0);assert.equal(h.music.inspect().liveSources,0);assert(node.disconnected,'Finished sources disconnect');
 }
 {
  const h=harness();h.request('home');h.request('map');h.request('world-0');h.request('lab-potion');
  assert.equal(h.requests.length,1,'Only one decode runs during rapid navigation');await h.resolve('home');
  assert.deepEqual(h.requests.map(r=>r.id),['home','lab-potion'],'Intermediate queued scenes are canceled');
  h.music.request(null);await h.resolve('lab-potion');assert.equal(h.music.inspect().liveSources,0,'Completing a canceled decode starts no source');
  assert.deepEqual(h.callbacks,[],'Canceled pending entries never notify stale scene callbacks');
  assert.equal(h.music.inspect().decoderBusy,false);assert.equal(h.music.inspect().queued.length,0);
  h.request('map');await h.resolve('map');const voices=new Set(),active=h.music.play('map',h.context,{},voices,0,0);
  for(const id of ['world-0','world-1','world-2','lab-hub','lab-weather','library','library-storm','rescue','finale']){
   if(!h.request(id))await h.resolve(id);
   const state=h.music.inspect();assert.equal(state.cacheLimit,3);assert(state.decoded.length<=3,'Decoded LRU holds at most three buffers');
   assert(state.decoded.some(x=>x.id==='map'),'Playing source pins its buffer');assert.equal(state.decodedBytes,state.decoded.reduce((n,x)=>n+x.bytes,0));
  }
  active.stop();h.music.release(active);for(const id of ['world-3','world-4','world-5']){h.request(id);await h.resolve(id)}
  assert(!h.music.inspect().decoded.some(x=>x.id==='map'),'Released inactive source can be evicted');assert.equal(h.music.inspect().liveSources,0);
 }
 {
  const h=harness(32000);for(const id of ['home','map','world-0','lab-hub']){h.catalog[id].loopSeconds=120;h.catalog[id].loopFrames=120*32000;h.request(id);await h.resolve(id,{silent:true});assert(h.music.inspect().decodedBytes<=60*1024*1024,'Byte ceiling evicts large inactive buffers before the three-entry limit')}
  assert.equal(h.music.inspect().decoded.length,2,'Large decoded cues reduce cache occupancy to fit the byte budget');
 }
 {
  const h=coordinated(),s=h.scope;
  assert.equal(h.eval('adventureMusicState()'),'home');s.homeChoice=true;assert.equal(h.eval('adventureMusicState()'),'map');
  for(let land=0;land<10;land++){s.duel={land,phase:'open',guardianPhase:1,paused:false};assert.equal(h.eval('adventureMusicState()'),'world-'+land);s.duel.guardianPhase=2;assert.equal(h.eval('adventureMusicState()'),'duel-high')}
  for(const phase of ['won','lost']){s.duel={phase,paused:false};assert.equal(h.eval('adventureMusicState()'),'map')}
  for(const stage of [1,9,10])for(const phase of ['won','rescue']){s.duel={phase,rescueStage:stage,newSeal:true,paused:false};assert.equal(h.eval('adventureMusicState()'),stage===10?'finale':'rescue')}
  s.mode='written';s.game={paused:true};assert.equal(h.eval('adventureMusicState()'),'practice');assert.equal(h.eval('musicMayPlay()'),false,'Paused practice suspends its cue');
  for(const kind of ids.filter(id=>id.startsWith('lab-'))){s.labScene={kind,paused:false};assert.equal(h.eval('adventureMusicState()'),kind)}
  s.labScene=null;for(const kind of ['library','library-storm']){s.libraryScene={kind,paused:false};assert.equal(h.eval('adventureMusicState()'),kind)}
  s.dialogOpen=true;assert.equal(h.eval('adventureMusicState()'),null,'Settings/learning dialog suspends underlying scenes');
 }
 {
  const h=coordinated(),s=h.scope;
  h.eval('syncAdventureMusic()');s.homeChoice=true;h.eval('syncAdventureMusic()');s.labScene={kind:'lab-potion',paused:false};h.eval('syncAdventureMusic()');s.labScene=null;s.mode='quick';h.eval('syncAdventureMusic()');
  await h.resolve('home');await h.resolve('practice');assert.equal(h.eval('musicCurrent.kind'),'practice');assert.deepEqual(Object.keys(h.music.inspect().starts),['practice'],'Coordinator ignores every stale decode');
  const started=h.music.inspect().starts.practice;for(let i=0;i<10;i++)h.eval('syncAdventureMusic();updateMusicControls()');assert.equal(h.music.inspect().starts.practice,started,'Unchanged scene/control updates preserve the source');
  h.advance(7);const position=h.context.currentTime-h.eval('musicCurrent.origin');s.dialogOpen=true;h.eval('syncAdventureMusic()');h.advance(.2);assert.equal(h.music.inspect().liveSources,0,'Dialog fade retires its source');
  s.dialogOpen=false;h.eval('syncAdventureMusic()');assert.equal(h.eval('musicCurrent.kind'),'practice');assert(Math.abs(h.context.currentTime-h.eval('musicCurrent.origin')-position)<.03,'Dialog resume preserves bookmark position');
  s.mode='adventure';h.eval('syncAdventureMusic()');await h.resolve('map');assert.equal(h.music.inspect().liveSources,2,'Transitions crossfade only the old and new loop');
  s.labScene={kind:'lab-weather',paused:false};h.eval('syncAdventureMusic()');await h.resolve('lab-weather');assert.equal(h.music.inspect().liveSources,2,'A rapid second transition disposes the older retiring tail');
  h.advance(1);assert.equal(h.music.inspect().liveSources,1);assert.equal(h.eval('musicRetiring.length'),0);
  h.context.state='suspended';h.eval('syncAdventureMusic()');assert.equal(h.music.inspect().liveSources,0,'Suspended audio clock destroys sources immediately');
  h.context.state='running';h.eval('syncAdventureMusic()');assert.equal(h.music.inspect().liveSources,1);assert.equal(h.intervals(),1,'All navigation retains one scheduler');
  h.eval('setMusicPreference("on",false)');h.advance(.2);assert.equal(h.music.inspect().liveSources,0);assert.equal(h.eval('fxBus.gain.value'),.8,'Music mute leaves the effects bus untouched');
  h.eval('setMusicPreference("volume",0);setMusicPreference("on",true)');assert.equal(h.eval('musicCurrent'),null,'Zero volume never starts a silent background source');
 }
 for(const cause of ['visibility','pagehide']){
  const h=coordinated(),s=h.scope;let resolveSuspend,resumes=0;
  h.context.suspend=()=>new Promise(resolve=>{resolveSuspend=()=>{h.context.state='suspended';resolve()}});
  h.context.resume=()=>{resumes++;h.context.state='running';return Promise.resolve()};
  h.eval('syncAdventureMusic()');await h.resolve('home');
  if(cause==='visibility')s.document.hidden=true;else h.eval('musicPageHeld=true');
  h.eval('holdSoundtrack();suspendGameAudio()');await flush();assert(resolveSuspend,'Host suspension began');assert.equal(h.music.inspect().liveSources,0);
  if(cause==='visibility')s.document.hidden=false;else h.eval('musicPageHeld=false');
  h.eval('initAudio();syncAdventureMusic()');resolveSuspend();await flush();
  assert.equal(resumes,1,cause+' return reconciles a still-pending suspension');assert.equal(h.context.state,'running');assert.equal(h.eval('musicCurrent.kind'),'home');assert.equal(h.music.inspect().liveSources,1,'Deferred host suspension resumes exactly one source');
 }
 {
  const h=coordinated(),attempts=[];h.context.state='suspended';
  h.context.resume=()=>new Promise((resolve,reject)=>attempts.push({resolve:()=>{h.context.state='running';resolve()},reject}));
  h.eval('initAudio()');h.eval('unlockGameAudio()');assert.equal(attempts.length,2,'A trusted gesture retries a previously pending browser resume');
  attempts[0].reject(Error('Old activation expired'));await flush();assert(h.eval('audioResumePending'),'Old attempt settlement cannot clear the newer resume');
  attempts[1].resolve();await flush();await h.resolve('home');assert.equal(h.eval('audioResumePending'),null);assert.equal(h.eval('musicCurrent.kind'),'home');assert.equal(h.music.inspect().starts.home,1);
 }
 {
  const h=harness();h.request('home');await h.resolve('home',{invalid:true});assert.match(h.music.error('home'),/could not be decoded/);assert.equal(h.music.inspect().liveSources,0);
  h.request('map');h.requests.find(r=>r.id==='map').reject(Error('codec unavailable'));await flush();assert.match(h.music.error('map'),/could not be decoded/);
  h.request('practice');await h.resolve('practice');assert(h.music.buffer('practice',h.context,()=>{}),'One failed scene does not block the decoder queue');
 }
 console.log('PASS mocked audio: all scene selections, stale/serial decodes, pinned LRU/60 MiB ceiling, crossfade/retirement/suspension/bookmarks, independent buses, failures, and gapless bounds at 22.05/44.1/48 kHz');
}
const result=run();if(require.main===module)result.catch(error=>{console.error(error);process.exitCode=1});module.exports=result;
