function initAudio(gesture=false){
 if(!soundOn||!audioUnlocked||document.hidden||musicPageHeld||audioSuspendPending&&!gesture)return;
 try{
  if(!audioContext){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;try{audioContext=new AC({sampleRate:32000})}catch(e){audioContext=new AC()}}
  ensureAudioGraph();
  if((audioContext.state==='suspended'||audioContext.state==='interrupted'||gesture&&audioSuspendPending)&&(!audioResumePending||gesture)){const attempt=audioContext.resume();audioResumePending=attempt;Promise.resolve(attempt).then(()=>{if(audioResumePending===attempt)audioResumePending=null;syncAdventureMusic()},()=>{if(audioResumePending===attempt)audioResumePending=null;updateMusicControls()})}
 }catch(e){updateMusicControls()}
}
// Original Tokyo-lofi fantasy soundtrack, using one shared audio graph and scheduler.
const MUSIC_KEY='recall-rally-music-v1';
function loadMusicPreferences(){try{const p=JSON.parse(localStorage.getItem(MUSIC_KEY)||'null'),level=(n,f)=>Number.isFinite(n)?Math.max(0,Math.min(100,n)):f;return{on:p?.on!==false,volume:level(p?.volume,32),effects:level(p?.effects,80)}}catch(e){return{on:true,volume:32,effects:80}}}
let musicPrefs=loadMusicPreferences(),audioUnlocked=false,fxBus=null,musicBus=null,musicDuckBus=null,musicScheduler=null,musicCurrent=null,musicRetiring=[],musicSting=null,musicBookmark=null,musicDuckUntil=0,musicDuckLevel=1;
let musicDesiredKind=null,musicGeneration=0,musicLoadRequest=null,musicPageHeld=false,audioResumePending=null,audioSuspendPending=null;
const musicBookmarks=new Map();
function musicRamp(param,to,seconds=.08){const t=audioContext.currentTime;if(param.cancelAndHoldAtTime)param.cancelAndHoldAtTime(t);else{param.cancelScheduledValues(t);param.setValueAtTime(param.value,t)}param.linearRampToValueAtTime(to,t+seconds)}
function ensureAudioGraph(){
 if(fxBus)return;fxBus=audioContext.createGain();fxBus.connect(audioContext.destination);musicBus=audioContext.createGain();musicDuckBus=audioContext.createGain();musicBus.connect(musicDuckBus);musicDuckBus.connect(audioContext.destination);musicDuckBus.gain.value=1;applyAudioLevels();
 // One scheduler only cleans crossfade tails and ducks under spoken prompts.
 musicScheduler=setInterval(soundtrackTick,60);
 audioContext.addEventListener?.('statechange',()=>{if(audioContext.state==='running'&&(document.hidden||musicPageHeld))suspendGameAudio();syncAdventureMusic()});
}
function applyAudioLevels(){if(!fxBus)return;musicRamp(fxBus.gain,soundOn?musicPrefs.effects/100:0,.035);musicRamp(musicBus.gain,soundOn&&musicPrefs.on?musicPrefs.volume/100*.48:0,.06)}
function suspendGameAudio(){
 if(!audioContext||audioSuspendPending)return audioSuspendPending;
 const context=audioContext;
 // A blocked resume may remain pending until a later browser gesture. Do not
 // wait behind it: reconcile the latest page intent when suspension settles.
 const pending=Promise.resolve().then(()=>{if(context===audioContext&&(document.hidden||musicPageHeld))return context.suspend()});
 audioSuspendPending=pending;
 const settled=()=>{if(audioSuspendPending===pending)audioSuspendPending=null;if(context===audioContext&&!document.hidden&&!musicPageHeld){initAudio();syncAdventureMusic()}};
 pending.then(settled,settled);return pending;
}
function unlockGameAudio(){audioUnlocked=true;initAudio(true);syncAdventureMusic()}
function saveMusicPreferences(){try{localStorage.setItem(MUSIC_KEY,JSON.stringify(musicPrefs))}catch(e){}}
function setMusicPreference(key,value){if(key==='on')musicPrefs.on=Boolean(value);else if(['volume','effects'].includes(key)){const n=Number(value);if(!Number.isFinite(n))return;musicPrefs[key]=Math.max(0,Math.min(100,n))}else return;saveMusicPreferences();initAudio();applyAudioLevels();syncAdventureMusic();updateMusicControls()}
function musicScene(){
 if(document.querySelector('dialog[open]:not(#science-lab)'))return{kind:null,paused:true};
 const lab=typeof ScienceLab!=='undefined'&&ScienceLab.musicState?.();if(lab)return lab;
 const library=window.LibrarianAudio?.musicState?.();if(library)return library;
 const home=$('home-view');
 if(!home?.hidden&&!home?.classList.contains('home-choice-open'))return{kind:'home',paused:false};
 if(mode!=='adventure')return{kind:'practice',paused:!!game?.paused};
 if(home?.hidden)return{kind:null,paused:false};
 if(!duel)return{kind:'map',paused:false};
 if(duel.phase==='rescue'||duel.phase==='won'&&duel.newSeal)return{kind:duel.rescueStage===LANDS.length?'finale':'rescue',paused:!!duel.paused};
 if(['won','lost'].includes(duel.phase))return{kind:'map',paused:!!duel.paused};
 return{kind:duel.guardianPhase===2?'duel-high':'world-'+Math.max(0,Math.min(LANDS.length-1,duel.land)),paused:!!duel.paused};
}
function adventureMusicState(){return musicScene().kind}
function musicMayPlay(scene=musicScene()){return !!(scene.kind&&!scene.paused&&audioUnlocked&&audioContext?.state==='running'&&soundOn&&musicPrefs.on&&musicPrefs.volume>0&&!document.hidden&&!musicPageHeld)}
// Short outcome phrases keep the common D/F#/A/E/D/B theme in soft harmonic tones.
function musicNote(ctx,out,event,at,seconds,voices){
 const hz=440*2**((event.note-69)/12),pad=event.voice==='pad',attack=pad?.16:.026,release=pad?.32:.24,duration=Math.max(.09,seconds);
 const partials=pad?[[1,.8,'triangle'],[2,.08,'sine']]:[[1,1,'sine'],[2,.12,'sine'],[3,.025,'sine']];
 for(const [ratio,amount,wave] of partials){
  const osc=ctx.createOscillator(),gain=ctx.createGain(),pan=ctx.createStereoPanner?.(),peak=event.level*amount,end=at+duration+release;osc.type=wave;osc.frequency.setValueAtTime(hz*ratio,at);
  osc.connect(gain);if(pan){pan.pan.value=event.pan||0;gain.connect(pan);pan.connect(out)}else gain.connect(out);
  gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,peak),at+Math.min(attack,duration*.4));gain.gain.exponentialRampToValueAtTime(.0001,end);
  voices.add(osc);osc.onended=()=>{voices.delete(osc);osc.disconnect();gain.disconnect();pan?.disconnect()};osc.start(at);osc.stop(end+.015);
 }
}
function destroyMusicSession(s){if(!s||s.destroyed)return;s.destroyed=true;for(const v of s.voices){try{v.stop()}catch(e){}try{v.disconnect()}catch(e){}if(s.rendered)StorybookMusic.release(v)}s.voices.clear();s.bus.disconnect()}
function rememberMusicSession(s){if(!s)return;const position=Math.max(0,audioContext.currentTime-s.origin);musicBookmarks.set(s.kind,position);musicBookmark={kind:s.kind,position}}
function retireMusicSession(s,fade=.72){
 if(!s)return;for(const old of musicRetiring)destroyMusicSession(old);musicRetiring=[];
 if(audioContext.state!=='running'||document.hidden||musicPageHeld){destroyMusicSession(s);return}
 musicRamp(s.bus.gain,0,fade);s.retireAt=audioContext.currentTime+fade+.025;s.retireWallAt=performance.now()+fade*1000+60;musicRetiring.push(s);
}
function clearMusicOutcome(){if(musicSting){destroyMusicSession(musicSting);musicSting=null}}
function cancelMusicLoad(){if(musicDesiredKind!==null||musicLoadRequest){musicDesiredKind=null;musicGeneration++;musicLoadRequest=null;StorybookMusic.request(null)}}
function holdSoundtrack(){
 cancelMusicLoad();
 if(musicCurrent){rememberMusicSession(musicCurrent);retireMusicSession(musicCurrent,.035);musicCurrent=null}
 clearMusicOutcome();
 if(musicDuckBus){musicDuckUntil=0;musicDuckLevel=1;musicRamp(musicDuckBus.gain,1,.035)}
}
function beginMusicSession(kind){
 const decoded=StorybookMusic.buffer(kind,audioContext,musicLoadRequest?.ready);if(!decoded)return false;
 // Dispose the preceding tail before starting a new loop: at most two live loops.
 for(const old of musicRetiring)destroyMusicSession(old);musicRetiring=[];
 const t=audioContext.currentTime,offset=musicBookmarks.get(kind)||0,bus=audioContext.createGain(),voices=new Set();bus.gain.value=0;bus.connect(musicBus);
 const node=StorybookMusic.play(kind,audioContext,bus,voices,t+.025,offset);if(!node){bus.disconnect();return false}
 const previous=musicCurrent;musicCurrent={kind,bus,voices,rendered:true,origin:t+.025-offset,beat:60/StorybookMusic.metadata(kind).bpm};
 if(previous){rememberMusicSession(previous);retireMusicSession(previous)}
 musicBookmark=null;musicRamp(bus.gain,1,.82);return true;
}
function syncAdventureMusic(){
 const scene=musicScene(),kind=scene.kind;
 if(!kind||!musicMayPlay(scene)){holdSoundtrack();updateMusicControls();return}
 if(kind!==musicDesiredKind){
  musicDesiredKind=kind;const generation=++musicGeneration;StorybookMusic.request(kind);
  musicLoadRequest={kind,generation,ready:()=>{if(generation===musicGeneration&&musicDesiredKind===kind)syncAdventureMusic()}};
 }
 if(musicCurrent?.kind!==kind)beginMusicSession(kind);
 updateMusicControls();
}
function soundtrackTick(){
 if(!audioContext)return;const now=audioContext.currentTime;
 musicRetiring=musicRetiring.filter(s=>{if(now>=s.retireAt||performance.now()>=s.retireWallAt){destroyMusicSession(s);return false}return true});
 if(musicSting&&now>musicSting.ends){destroyMusicSession(musicSting);musicSting=null}
 const scene=musicScene();if(!musicMayPlay(scene)){holdSoundtrack();return}
 if(musicDesiredKind!==scene.kind)syncAdventureMusic();
 if(window.speechSynthesis?.speaking)duckMusic(.45,.22);
}
function duckMusic(seconds=.7,level=.28){
 if(!musicDuckBus||!soundOn)return;const t=audioContext.currentTime;
 if(t>musicDuckUntil)musicDuckLevel=1;musicDuckLevel=Math.min(musicDuckLevel,level);musicDuckUntil=Math.max(musicDuckUntil,t+seconds);
 const p=musicDuckBus.gain;if(p.cancelAndHoldAtTime)p.cancelAndHoldAtTime(t);else{p.cancelScheduledValues(t);p.setValueAtTime(p.value,t)}p.linearRampToValueAtTime(musicDuckLevel,t+.025);p.setValueAtTime(musicDuckLevel,musicDuckUntil);p.linearRampToValueAtTime(1,musicDuckUntil+.32);
}
function playMusicOutcome(d,won){
 if(d.musicOutcomePlayed)return;d.musicOutcomePlayed=true;if(!musicMayPlay())return;
 clearMusicOutcome();const bus=audioContext.createGain();bus.gain.value=.72;bus.connect(musicBus);const t=audioContext.currentTime+.02;
 musicSting={bus,voices:new Set(),ends:t+2.1};
 const tune=won?[[0,74,.16],[.18,78,.16],[.36,81,.2],[.65,76,.17],[.88,74,.2],[1.1,71,.48]]:[[0,71,.24],[.3,69,.24],[.6,66,.3],[.98,74,.5]];
 for(const [beat,note,length] of tune)musicNote(audioContext,bus,{voice:'bell',note,level:won?.09:.07,pan:0},t+beat,length,musicSting.voices);
 for(const note of (won?[62,66,69,71]:[59,62,66]))musicNote(audioContext,bus,{voice:'pad',note,level:.02,pan:0},t+.05,1.3,musicSting.voices);
}
function updateMusicControls(){
 const music=$('music-on'),master=$('audio-master'),vol=$('music-volume'),effects=$('effects-volume');if(!music)return;
 music.checked=musicPrefs.on;master.checked=soundOn;vol.value=musicPrefs.volume;effects.value=musicPrefs.effects;$('music-volume-value').textContent=musicPrefs.volume+'%';$('effects-volume-value').textContent=musicPrefs.effects+'%';
 const scene=musicScene(),kind=scene.kind;
 const message=!soundOn?'All game audio is muted.':!musicPrefs.on||musicPrefs.volume===0?'Music off. Sound effects keep their own volume.':document.hidden||musicPageHeld||scene.paused?'Music paused.':!kind?'Original Tokyo-lofi fantasy soundtrack · ready.':!audioUnlocked?'Music starts when you play.':audioContext?.state!=='running'?'Audio is blocked. Press Enable audio to try again.':StorybookMusic.error(kind)||StorybookMusic.pending(kind)?StorybookMusic.error(kind)||'Preparing '+StorybookMusic.title(kind)+'…':StorybookMusic.title(kind)||'Original Tokyo-lofi fantasy soundtrack · ready.';
 const status=$('music-status');if(status.textContent!==message)status.textContent=message;
 status.dataset.musicState=kind||'ready';status.dataset.musicPlaying=String(!!musicCurrent&&musicMayPlay(scene));status.dataset.musicPhase=String(kind==='duel-high'?2:kind?.startsWith('world-')?1:0);
}
// End original soundtrack.
