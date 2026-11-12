'use strict';
// Deferred decodes make navigation races and cache pressure deterministic without
// requiring a sound device or allocating the production soundtrack's PCM.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../src/storybook-music.js'),'utf8');
const coordinator=fs.readFileSync(path.join(__dirname,'../src/audio-coordinator.js'),'utf8');
const ids=['home','map',...Array.from({length:10},(_,i)=>'world-'+i),'duel-high','lab-hub',...['potion','circuit','creature','weather','observatory'].map(id=>'lab-'+id),'practice','library','library-storm','rescue','finale'];
const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve()};
function audioBuffer(channels,length,rate){
 const data=Array.from({length:channels},()=>new Float32Array(length));
 return {numberOfChannels:channels,length,sampleRate:rate,duration:length/rate,getChannelData:c=>data[c],copyToChannel:(samples,c,offset=0)=>data[c].set(samples,offset)};
}
function harness(rate=44100,{hosted=false}={}){
 const requests=[],fetches=[],sources=[],callbacks=[],updates=[];
 const catalog=Object.fromEntries(ids.map(id=>[id,{title:id,bpm:80,loopBars:16,sampleRate:32000,loopFrames:32000,loopSeconds:1,mp3:{encodedFrames:34560,skipSamples:1105,discardPadding:1455},data:Buffer.from(id).toString('base64')}]));
 if(hosted)for(const [id,meta]of Object.entries(catalog)){meta.url='./assets/music/'+id+'.hash.mp3';delete meta.data}
 const context={sampleRate:rate,currentTime:0,state:'running',destination:{},createBuffer:audioBuffer,
  createGain(){return {gain:{value:1,cancelAndHoldAtTime(){},cancelScheduledValues(){},setValueAtTime(v){this.value=v},linearRampToValueAtTime(v){this.value=v}},connect(){},disconnect(){this.disconnected=true}}},
  decodeAudioData(bytes){return new Promise((resolve,reject)=>requests.push({id:Buffer.from(bytes).toString(),resolve,reject}))},
  createBufferSource(){const node={connect(){},disconnect(){this.disconnected=true},start(at,offset){this.at=at;this.offset=offset;this.started=true},stop(){this.stopped=true;this.onended?.()}};sources.push(node);return node}};
 const scope={STORYBOOK_AUDIO:catalog,atob:s=>Buffer.from(s,'base64').toString('binary'),Uint8Array,Map,Set,console,URL,AbortController,location:{href:'https://recall.test/game/index.html',origin:'https://recall.test'},
  fetch(url,options){return new Promise((resolve,reject)=>{
   const request={id:new URL(url).pathname.split('/').at(-1).split('.')[0],url,options,resolve,reject,bodyReads:0};fetches.push(request);
   options.signal.addEventListener('abort',()=>{request.aborted=true;if(!request.ignoreAbort){request.finished=true;const error=Object.assign(Error('Request aborted'),{name:'AbortError'});reject(error);request.rejectBody?.(error)}},{once:true});
  })},
  MutationObserver:class{constructor(fn){this.fn=fn}observe(){}},document:{readyState:'complete',querySelectorAll:()=>[],getElementById:()=>null,addEventListener(){},body:{}},
  syncAdventureMusic:()=>callbacks.push('sync'),updateMusicControls:()=>updates.push('update')};
 vm.createContext(scope);vm.runInContext(source+';this.music=StorybookMusic',scope);
 const music=scope.music;
 async function respond(id,{status=200,bodyPending=false}={}){
  const request=fetches.find(x=>x.id===id&&!x.finished);assert(request,'Pending fetch for '+id);request.finished=true;
  request.resolve({ok:status>=200&&status<300,status,arrayBuffer(){request.bodyReads++;return bodyPending?new Promise((resolve,reject)=>{request.resolveBody=()=>resolve(Uint8Array.from(Buffer.from(id)).buffer);request.rejectBody=reject}):Promise.resolve(Uint8Array.from(Buffer.from(id)).buffer)}});
  await flush();return request;
 }
 async function resolve(id,{padded=false,invalid=false,silent=false}={}){
  const request=requests.find(x=>x.id===id&&!x.finished);assert(request,'Queued decoder request for '+id);request.finished=true;
  const meta=catalog[id],frames=Math.round(meta.loopSeconds*rate),skip=padded?Math.round(meta.mp3.skipSamples*rate/meta.sampleRate):0;
  const length=invalid?Math.round(frames/2):padded?Math.round(meta.mp3.encodedFrames*rate/meta.sampleRate):frames,buffer=audioBuffer(2,length,rate);
  if(!silent)for(let c=0;c<2;c++)for(let i=0;i<Math.min(frames,length-skip);i++)buffer.getChannelData(c)[i+skip]=Math.sin(i/61)*.1+c*.01;
  request.resolve(buffer);await flush();return buffer;
 }
 function request(id){music.request(id);return music.buffer(id,context,()=>callbacks.push(id))}
 return {music,context,catalog,requests,fetches,sources,callbacks,updates,respond,resolve,request,scope,eval:code=>vm.runInContext(code,scope)};
}
function coordinated(options){
 const h=harness(32000,options),s=h.scope;let wall=0,intervals=0;
 const home={hidden:false,classList:{contains:()=>s.homeChoice}};Object.assign(s,{homeChoice:false,dialogOpen:false,labScene:null,libraryScene:null,mode:'adventure',duel:null,game:null,soundOn:true,audioContext:h.context,LANDS:Array.from({length:10}),
  $:id=>id==='home-view'?home:null,ScienceLab:{musicState:()=>s.labScene},window:{LibrarianAudio:{musicState:()=>s.libraryScene}},
  localStorage:{getItem:()=>null,setItem(){}},initAudio(){},setInterval(){return ++intervals},performance:{now:()=>wall}});
 s.document.querySelector=()=>s.dialogOpen?{}:null;s.document.hidden=false;
 h.eval(coordinator+';audioUnlocked=true;ensureAudioGraph();');
 return {...h,home,advance(seconds,{wallOnly=false}={}){wall+=seconds*1000;if(!wallOnly)h.context.currentTime+=seconds;h.eval('soundtrackTick()')},intervals:()=>intervals};
}
async function run(){
 {
  const h=harness();assert.equal(h.fetches.length,0,'Embedded edition performs no startup fetch');
  h.request('home');await h.resolve('home');assert(h.music.buffer('home',h.context));assert.equal(h.fetches.length,0,'Embedded audio decodes without the network');
 }
 {
  const h=harness(44100,{hosted:true});assert.equal(h.fetches.length,0,'Hosted catalog initialization does not fetch audio');
  assert(h.music.supports('home'));assert.equal(h.music.metadata('map').title,'map');h.music.request('home');assert.equal(h.fetches.length,0,'Selecting the desired cue alone does not fetch');
  h.music.buffer('home',h.context,()=>h.callbacks.push('home'));assert.equal(h.fetches.length,1,'Only buffer requests the cue bytes');assert.equal(h.requests.length,0,'Decode waits for the fetch body');
  assert.equal(h.fetches[0].url,'https://recall.test/game/assets/music/home.hash.mp3');assert.equal(h.fetches[0].options.mode,'same-origin');assert.equal(h.fetches[0].options.credentials,'same-origin');
  await h.respond('home');assert.equal(h.requests.length,1);await h.resolve('home');assert.deepEqual(h.callbacks,['home']);
  const decoded=h.music.buffer('home',h.context);h.music.request(null);assert.equal(h.request('home'),decoded,'Reentry reuses the decoded cue');assert.equal(h.fetches.length,1,'Cached replay does not fetch again');
  const voices=new Set(),first=h.music.play('home',h.context,{},voices,0,0),second=h.music.play('home',h.context,{},voices,0,0);
  assert(first&&second);assert.equal(h.music.play('home',h.context,{},voices,0,0),null,'Hosted playback retains the two-source limit');first.stop();second.stop();
  h.music.request(null);assert.equal(h.music.play('home',h.context,{},voices,0,0),null,'A paused request cannot start a cached source');
  h.music.request('home');h.context.state='suspended';assert.equal(h.music.play('home',h.context,{},voices,0,0),null,'A suspended context cannot start a cached source');
 }
 {
  const h=harness(44100,{hosted:true});h.request('home');h.request('map');h.request('world-0');
  assert(h.fetches[0].aborted,'Navigation aborts the stale fetch');await flush();assert.deepEqual(h.fetches.map(x=>x.id),['home','world-0'],'Only the latest queued cue fetches');
  await h.respond('world-0');h.music.request(null);await h.resolve('world-0');assert.deepEqual(h.callbacks,[],'Canceled decode has no stale callback');assert.equal(h.music.inspect().decoded.length,0);
  h.request('map');const response=await h.respond('map',{bodyPending:true});h.music.request(null);assert(response.aborted,'Pause also aborts a pending response body');await flush();
  assert.equal(h.music.error('map'),null,'Cancellation is not reported as a network failure');assert.equal(h.music.inspect().decoderBusy,false);assert.equal(h.requests.length,1,'An aborted body is never decoded');
 }
 {
  const h=harness(44100,{hosted:true});h.request('home');h.fetches[0].ignoreAbort=true;h.request('map');
  await h.respond('home');assert.equal(h.requests.length,0,'A fetch that ignores abort still cannot decode stale audio');assert.equal(h.fetches.at(-1).id,'map');
  await h.respond('map');await h.resolve('map');assert.deepEqual(h.callbacks,['map']);
 }
 {
  const h=harness(44100,{hosted:true});h.request('home');await h.respond('home');h.music.request(null);h.request('home');
  await h.resolve('home');assert.equal(h.fetches.length,2,'Returning during a canceled decode starts a fresh load');assert(h.music.pending('home'),'Settling an old decode does not delete the new same-cue request');
  await h.respond('home');await h.resolve('home');assert.deepEqual(h.callbacks,['home']);assert(h.music.buffer('home',h.context));
 }
 {
  const h=harness(44100,{hosted:true});let callbacks=0;
  const ready=()=>{callbacks++;h.music.buffer('home',h.context,ready)};h.music.request('home');h.music.buffer('home',h.context,ready);
  const response=await h.respond('home',{status:404});assert.equal(response.bodyReads,0,'HTTP failures do not read or decode a response body');assert.equal(h.requests.length,0);assert.match(h.music.error('home'),/could not be loaded \(HTTP 404\)/);assert.equal(callbacks,1);
  for(let i=0;i<5;i++)h.request('home');assert.equal(h.fetches.length,1,'Repeated state updates do not retry a failed cue');assert.equal(h.music.pending('home'),false);
  h.music.request(null);h.request('home');assert.equal(h.fetches.length,2,'Leaving and returning retries the failed cue');await h.respond('home');await h.resolve('home');assert.equal(h.music.error('home'),null);
  h.request('map');h.fetches.at(-1).reject(Error('Connection unavailable'));await flush();assert.match(h.music.error('map'),/could not be loaded/);assert.equal(h.music.inspect().liveSources,0);
  h.request('practice');await h.respond('practice');await h.resolve('practice');assert(h.music.buffer('practice',h.context),'A failed fetch does not block later cues');
 }
 for(const url of ['https://other.test/home.mp3','data:audio/mpeg;base64,aG9tZQ==','//other.test/home.mp3']){
  const h=harness(44100,{hosted:true});h.catalog.home.url=url;h.request('home');await flush();assert.equal(h.fetches.length,0,'Unsafe music URL is rejected before fetching');assert.match(h.music.error('home'),/could not be loaded/);
 }
 {
  const h=harness(44100,{hosted:true});for(const id of ['lab-potion','lab-weather']){h.catalog[id].dataRef='lab-hub';h.catalog[id].url=h.catalog['lab-hub'].url}
  h.request('lab-potion');h.request('lab-weather');assert.equal(h.fetches.length,1,'Lab aliases share one pending fetch');assert(!h.fetches[0].aborted,'Switching aliases keeps their shared request');
  await h.respond('lab-hub');await h.resolve('lab-hub');assert.equal(h.music.buffer('lab-potion',h.context),h.music.buffer('lab-weather',h.context),'Aliases share the decoded buffer');assert.equal(h.music.inspect().decoded.length,1);
  const voices=new Set(),node=h.music.play('lab-weather',h.context,{},voices,0,0);assert(node);assert.equal(h.music.inspect().decoded[0].pinned,true,'Alias playback pins its canonical cache entry');node.stop();assert.equal(h.music.inspect().decoded[0].pinned,false);
 }
 {
  const h=coordinated({hosted:true}),s=h.scope;h.eval('syncAdventureMusic()');assert.equal(h.fetches.length,1);
  s.document.hidden=true;h.eval('syncAdventureMusic()');await flush();assert(h.fetches[0].aborted);assert.equal(h.music.inspect().liveSources,0,'Hiding the page during fetch starts no source');
  s.document.hidden=false;h.eval('syncAdventureMusic()');await h.respond('home');s.homeChoice=true;h.eval('syncAdventureMusic()');await h.resolve('home');assert.equal(h.music.inspect().liveSources,0,'A stale hosted decode cannot play after navigation');
  await h.respond('map');await h.resolve('map');assert.equal(h.eval('musicCurrent.kind'),'map');assert.equal(h.music.inspect().starts.map,1);assert.equal(h.music.inspect().starts.home,undefined);
  s.document.hidden=true;h.eval('syncAdventureMusic()');h.advance(.2);assert.equal(h.music.inspect().liveSources,0);s.document.hidden=false;h.eval('syncAdventureMusic()');assert.equal(h.music.inspect().liveSources,1,'Returning to a cached hosted cue resumes one source');assert.equal(h.fetches.length,3,'Cached resume adds no fetch');
 }
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
 {
  const h=coordinated();h.catalog['lab-hub'].uploaded=true;h.catalog['world-3'].uploaded=true;
  h.scope.labScene={kind:'lab-potion',paused:false};assert.equal(h.eval('musicScene().kind'),'lab-hub');
  h.scope.labScene=null;h.scope.homeChoice=true;h.scope.mode='adventure';h.scope.duel={land:3,phase:'open',guardianPhase:2,paused:false};assert.equal(h.eval('musicScene().kind'),'world-3','Uploaded guardian recording continues in phase two');
 }
 for(const hosted of [false,true]){
  const h=coordinated({hosted}),s=h.scope;h.catalog.library.uploaded=true;
  s.libraryScene={kind:'library',paused:false};h.eval('syncAdventureMusic()');if(hosted)await h.respond('library');await h.resolve('library');
  const session=h.eval('musicCurrent'),source=h.sources.at(-1);assert.equal(h.music.inspect().starts.library,1);
  h.advance(3);s.libraryScene={kind:'library-storm',paused:false};
  for(let i=0;i<3;i++)h.eval('syncAdventureMusic()');
  assert.equal(h.eval('musicScene().kind'),'library','Uploaded Library theme also selects the storm');assert.equal(h.eval('musicScene().paused'),false);
  assert.equal(h.eval('musicCurrent'),session,'Storm entry preserves the playing Library session');assert.equal(h.sources.at(-1),source,'Storm entry preserves the playing source');
  assert.equal(h.music.inspect().starts.library,1,'Storm updates never restart the uploaded theme');assert.equal(h.music.inspect().starts['library-storm']||0,0);
  assert.equal(h.requests.length,1,'Storm entry needs no second decode');assert.equal(h.fetches.length,hosted?1:0,'Storm entry needs no second fetch');
  const position=h.context.currentTime-h.eval('musicCurrent.origin');s.libraryScene={kind:'library-storm',paused:true};
  assert.equal(h.eval('musicScene().kind'),'library');assert.equal(h.eval('musicScene().paused'),true,'Uploaded Library selection preserves its pause flag');assert.equal(h.eval('musicMayPlay()'),false);
  h.eval('syncAdventureMusic()');h.advance(.2);assert.equal(h.eval('musicCurrent'),null);assert.equal(h.music.inspect().liveSources,0,'Pausing a storm retires its theme');
  for(let i=0;i<3;i++)h.eval('syncAdventureMusic()');assert.equal(h.music.inspect().starts.library,1,'Paused updates never create a duplicate source');
  s.libraryScene={kind:'library-storm',paused:false};h.eval('syncAdventureMusic()');
  assert.equal(h.eval('musicScene().paused'),false);assert.equal(h.eval('musicCurrent.kind'),'library');assert.equal(h.music.inspect().starts.library,2,'Resuming starts exactly one Library source');
  assert(Math.abs(h.context.currentTime-h.eval('musicCurrent.origin')-position)<.03,'Storm resume preserves the Library bookmark');assert.equal(h.music.inspect().liveSources,1);
  const resumed=h.eval('musicCurrent');s.libraryScene={kind:'library',paused:false};h.eval('syncAdventureMusic()');
  assert.equal(h.eval('musicCurrent'),resumed,'Leaving the storm preserves the resumed Library session');assert.equal(h.music.inspect().starts.library,2);
  s.libraryScene=null;h.eval('syncAdventureMusic()');if(hosted)await h.respond('home');await h.resolve('home');h.advance(1);
  assert.equal(h.eval('musicCurrent.kind'),'home','Closing Library returns to the Home theme');assert.equal(h.music.inspect().starts.home,1);assert.equal(h.music.inspect().starts.library,2);assert.equal(h.music.inspect().liveSources,1);
 }
 console.log('PASS mocked audio: lazy hosted fetch/cached replay, HTTP/network failure and reentry retry, abort/navigation races, alias deduplication, embedded network independence, all scene selections, serial decodes, pinned LRU/60 MiB ceiling, crossfade/retirement/suspension/bookmarks, and gapless bounds at 22.05/44.1/48 kHz');
}
const result=run();if(require.main===module)result.catch(error=>{console.error(error);process.exitCode=1});module.exports=result;
