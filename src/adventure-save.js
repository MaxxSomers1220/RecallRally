/* QUEST_SAVES_START — embedded in index.html for offline play. */
const QuestSaves=(()=>{
 const PREFIX='recall-rally-rigby-save-v1:',HERO_PREFIX='recall-rally-profile-hero-v1:';
 const FORMAT='recall-rally-rigby-adventure',VERSION=1,WORLD_SET='ten-worlds-v29';
 let initialized=false,loading=false,hasRun=false,invalid=false,stored=false,pendingEncounter=null,message='',warning='',confirmation=null;
 const profile=()=>RallyLearning.activeProfile();
 const key=()=>PREFIX+profile().id;
 const finiteInt=(v,min,max)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
 const validId=v=>typeof v==='string'&&/^[a-zA-Z0-9-]{1,120}$/.test(v);
 const validText=(v,max)=>typeof v==='string'&&v.trim().length>0&&v.length<=max&&!/[\u0000-\u001f\u007f-\u009f]/.test(v);
 function validateHero(v){
  if(!v||!validText(v.name,48)||!['fairy','panther'].includes(v.style)||typeof v.creatorSeen!=='boolean'||!v.look||typeof v.look!=='object'||Array.isArray(v.look))throw Error('The saved hero is invalid.');
  for(const [field,choices] of Object.entries(HERO_OPTIONS))if(!choices.some(c=>c.id===v.look[field]))throw Error('The saved hero appearance is invalid.');
  return{name:cleanHeroName(v.name),style:v.style,look:normalizePantherLook(v.look),creatorSeen:v.creatorSeen};
 }
 function hero(){return{name:heroName,style:heroStyle,look:normalizePantherLook(avatarLook),creatorSeen:pantherCreatorSeen}}
 function validate(value,expectedProfileId=null){
  if(!value||value.format!==FORMAT)throw Error('Choose a Quest for Rigby adventure backup.');
  if(value.version!==VERSION||value.worldSet!==WORLD_SET)throw Error('This adventure save uses an unsupported version. Keep your backup for a compatible game update.');
  if(!value.profile||!validId(value.profile.id)||!validText(value.profile.name,48)||expectedProfileId&&value.profile.id!==expectedProfileId)throw Error('This adventure belongs to a different player profile.');
  if(typeof value.savedAt!=='string'||!Number.isFinite(Date.parse(value.savedAt)))throw Error('The save date is invalid.');
  const p=value.progress,s=value.stats;
  if(!p||!finiteInt(p.level,0,LANDS.length)||!finiteInt(p.location,-1,Math.min(p.level,LANDS.length-1))||![0,1].includes(p.chapter))throw Error('The saved map location is invalid.');
  // Progress is sequential: a level is the number of distinct earned seals.
  const earned=Array.from({length:p.level},(_,i)=>i);
  for(const list of [p.keys,p.completed])if(!Array.isArray(list)||list.length!==earned.length||list.some((id,i)=>id!==earned[i]))throw Error('The saved seals and completed guardians disagree.');
  if(!s||!['answered','correct','streak','bestStreak'].every(k=>finiteInt(s[k],0,Number.MAX_SAFE_INTEGER))||s.correct>s.answered||s.streak>s.bestStreak||s.bestStreak>s.correct)throw Error('The saved adventure statistics are invalid.');
  if(value.interruptedEncounter!==null&&!finiteInt(value.interruptedEncounter,0,Math.min(p.level,LANDS.length-1)))throw Error('The interrupted encounter is invalid.');
  // Unlocks, objective, rewards, score, accuracy and assistance are derived from
  // these authoritative fields and the world's definitions, never trusted from JSON.
  return{format:FORMAT,version:VERSION,worldSet:WORLD_SET,profile:{id:value.profile.id,name:value.profile.name},hero:validateHero(value.hero),savedAt:value.savedAt,
   progress:{level:p.level,location:p.location,chapter:p.chapter,keys:[...earned],completed:[...earned]},
   stats:{answered:s.answered,correct:s.correct,streak:s.streak,bestStreak:s.bestStreak},interruptedEncounter:value.interruptedEncounter};
 }
 function capture(){
  const interrupted=duel&&!['won','lost','rescue'].includes(duel.phase)?duel.land:pendingEncounter;
  return validate({format:FORMAT,version:VERSION,worldSet:WORLD_SET,profile:profile(),hero:hero(),savedAt:new Date().toISOString(),
   progress:{level:questProgress,location:questLocation,chapter:questMapChapter,keys:[...questKeys],completed:[...questCompleted]},stats:{...questRunStats},interruptedEncounter:interrupted},profile().id);
 }
 function write(value){
  try{
   if(!RallyLearning.isSaving())throw Error('The player profile could not be saved.');
   const json=JSON.stringify(value);localStorage.setItem(key(),json);
   if(localStorage.getItem(key())!==json)throw Error('Storage did not retain this save.');
   stored=true;warning='';return true;
  }catch(e){stored=false;warning='Adventure saving is unavailable. Your current quest may last only for this visit. Export an adventure backup before closing.';return false}
 }
 function status(){return warning|| (stored?'✓ Adventure saved on this device':'Adventure progress stays in this browser on this device. It does not sync automatically.')}
 function interruptedMessage(){return pendingEncounter===null?'':`Your unfinished encounter with ${LANDS[pendingEncounter].name} will restart from the beginning. Previously earned seals are safe; duel health, spell charge and question position reset.`}
 function feedback(){
  const el=$('quest-save-status');if(el){el.textContent=status();el.classList.toggle('save-warning',!!warning)}
  const note=$('quest-welcome');if(note){note.textContent=[message,interruptedMessage()].filter(Boolean).join(' ');note.hidden=!note.textContent}
  const resume=$('quest-home-continue');if(resume)resume.hidden=!hasRun;
  const summary=$('quest-home-summary');if(summary)summary.textContent=`Playing as ${profile().name}. `+(hasRun?`${questProgress} / ${LANDS.length} seals earned. `:'')+(invalid?'Your adventure save could not be restored. Keep the original backup; start a new adventure or import a valid save. ':interruptedMessage());
  const homeStatus=$('quest-home-status');if(homeStatus){homeStatus.textContent=status();homeStatus.classList.toggle('save-warning',!!warning)}
  const recoveryNotice=$('quest-recovery-notice');if(recoveryNotice)recoveryNotice.textContent=message;
  const exp=$('quest-home-export');if(exp)exp.hidden=!hasRun;
 }
 function save(){if(!initialized||loading||!hasRun||invalid)return false;const ok=write(capture());feedback();return ok}
 function saveHero(){
  if(!initialized||loading)return;
  try{localStorage.setItem(HERO_PREFIX+profile().id,JSON.stringify(hero()))}catch(e){}
  if(hasRun)save();
 }
 function applyHero(v){heroName=v.name;heroStyle=v.style;avatarLook={...v.look};pantherCreatorSeen=v.creatorSeen;savePantherPreferences()}
 function apply(value){
  questProgress=value.progress.level;questLocation=value.progress.location;questMapChapter=value.progress.chapter;
  questKeys=[...value.progress.keys];questCompleted=[...value.progress.completed];questRunStats={...value.stats};
  pendingEncounter=value.interruptedEncounter;hasRun=true;invalid=false;avatarPoint=journeyPosition(questLocation);
 }
 function loadProfile(legacy=false){
  loading=true;resetQuestRun();hasRun=false;invalid=false;stored=false;pendingEncounter=null;message='';warning='';let value=null,look=null;
  try{const raw=localStorage.getItem(key());if(raw!==null){try{if(raw.length>100000)throw Error('Save is too large.');value=validate(JSON.parse(raw),profile().id);apply(value);stored=true}catch(e){invalid=true;warning='This adventure save could not be restored. Its data has been kept. You can import a valid backup or intentionally start a new adventure.'}}}
  catch(e){warning='Browser storage is unavailable. You can play for this visit and export an adventure backup.'}
  try{const raw=localStorage.getItem(HERO_PREFIX+profile().id);if(raw)look=validateHero(JSON.parse(raw))}catch(e){}
  if(!look)look=value?.hero||(legacy?hero():{name:cleanHeroName(profile().name),style:'fairy',look:{...DEFAULT_FAIRY_LOOK},creatorSeen:false});
  applyHero(look);loading=false;
  if(!hasRun&&!invalid)saveHero();
  renderHeroProfile();feedback();
 }
 function onMap(){
  if(!initialized||loading)return;
  if(!invalid){hasRun=true;save()}
  feedback();
  if(pendingEncounter!==null){const button=$('world-next');if(button){button.textContent=`Restart encounter · ${LANDS[pendingEncounter].land} →`;button.onclick=()=>startDuel(pendingEncounter)}}
 }
 function recovery(root){
  if(!initialized||!invalid)return false;
  root.innerHTML='<section class="quest-backup-card"><h2>Your quest needs a fresh trail</h2><p role="status">'+esc(warning)+'</p><button class="primary" id="quest-recovery-new">Start a New Adventure</button><label class="secondary quest-import-label">Import Adventure Save<input id="quest-recovery-import" type="file" accept=".json,application/json"></label><p id="quest-recovery-notice" role="status"></p></section>';
  $('quest-recovery-new').onclick=requestNew;$('quest-recovery-import').onchange=importSave;return true;
 }
 function continueQuest(){
  if(!hasRun)return;
  // Returning to the map never replays travel or claims an unfinished victory.
  const liveEncounter=duel&&!['won','lost','rescue'].includes(duel.phase)?duel.land:pendingEncounter;
  leaveDuel();pendingEncounter=liveEncounter;message='Welcome back! Your quest continues.';
  if(questLocation>=0)questMapChapter=Math.floor(questLocation/5);
  showView('home');selectMode('adventure');feedback();
 }
 function confirmReplace(title,text,label,action){
  confirmation={profileId:profile().id,action};
  $('quest-confirm-title').textContent=title;$('quest-confirm-text').textContent=text;$('quest-confirm-accept').textContent=label;
  if(duel?.phase==='open'&&!duel.paused)pauseQuest();
  showDialog('quest-confirm');$('quest-confirm-keep').focus();
 }
 function startFresh(){
  resetQuestRun();pendingEncounter=null;hasRun=true;invalid=false;message='A new quest begins. Your hero and learning history are kept.';
  save();showView('home');selectMode('adventure');
 }
 function requestNew(){
  if(hasRun||invalid)confirmReplace('Start a new adventure?','Your current quest progress will be replaced. Your hero, learning history, and study questions will be kept.','Start Fresh at Level 0',startFresh);
  else startFresh();
 }
 function exportSave(){
  if(!hasRun)return;
  try{downloadJSON(capture(),'Recall_Rally_Adventure_Save.json');message='Adventure backup exported. Import it on another browser or device to move your quest.';feedback()}
  catch(e){warning='The adventure backup could not be exported. Please try again.';feedback()}
 }
 async function importSave(event){
  const input=event.target,file=input.files?.[0],profileId=profile().id;if(!file)return;
  const notice=$('quest-import-notice');if(notice)notice.textContent='';message='';
  try{
   if(file.size>100000)throw Error('Choose an adventure JSON backup smaller than 100 KB.');
   const incoming=validate(JSON.parse(await file.text()));
   if(profile().id!==profileId)throw Error('The player changed. Choose the backup again for this player.');
   confirmReplace(hasRun||invalid?'Replace this adventure?':'Import this adventure?',`Import ${incoming.hero.name}’s quest with ${incoming.progress.level} seals for ${profile().name}? ${hasRun||invalid?'Your current quest progress will be replaced. ':''}The backup’s hero appearance will be restored. Learning history and study questions will be kept.`, 'Import Adventure Save',()=>{
    const value={...incoming,profile:profile(),savedAt:new Date().toISOString()};
    // Commit the validated file atomically before replacing the in-memory run.
    if(!write(value)){feedback();return}
    loading=true;resetQuestRun();apply(value);applyHero(value.hero);loading=false;saveHero();
    renderHeroProfile();continueQuest();
   });
  }catch(e){message='Import did not finish: '+e.message;const notice=$('quest-import-notice');if(notice)notice.textContent=message;feedback()}
  finally{input.value=''}
 }
 function duelStarted(){if(!initialized||loading)return;hasRun=true;pendingEncounter=null;save()}
 function duelLeft(){if(!initialized||loading)return;pendingEncounter=null;save()}
 function init(){
  initialized=true;
  $('quest-home-continue').onclick=continueQuest;$('quest-home-new').onclick=requestNew;
  $('quest-home-export').onclick=exportSave;$('quest-home-import').onchange=importSave;
  $('quest-confirm-keep').onclick=()=>{$('quest-confirm').close()};
  $('quest-confirm-accept').onclick=()=>{const pending=confirmation;confirmation=null;$('quest-confirm').close();if(pending&&pending.profileId===profile().id)pending.action()};
  $('quest-confirm').addEventListener('close',()=>{confirmation=null});
  loadProfile(true);
  window.addEventListener('pagehide',save);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});
 }
 return{init,validate,save,saveHero,loadProfile,onMap,recovery,continueQuest,requestNew,exportSave,importSave,duelStarted,duelLeft,status,ready:()=>initialized};
})();
/* QUEST_SAVES_END */
