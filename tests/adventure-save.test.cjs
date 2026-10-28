'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const moduleSource=fs.readFileSync(path.join(root,'src/adventure-save.js'),'utf8').trim();
assert.equal(html.slice(html.indexOf('/* QUEST_SAVES_START'),html.indexOf('/* QUEST_SAVES_END */')+'/* QUEST_SAVES_END */'.length),moduleSource,'offline game embeds the current save implementation');
const standalone=fs.readFileSync(path.join(root,'Ellery_Recall_Rally_Librarian_v4.html'),'utf8');
assert(standalone.includes(moduleSource),'complete HTML includes the same save system');
assert.equal(standalone.match(/<script>([\s\S]*?)<\/script>/)[1],html.match(/<script>([\s\S]*?)<\/script>/)[1],'complete HTML includes the current game and all save hooks');
new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
const ctx=vm.createContext({assert,console});
vm.runInContext(`
const store=new Map(),elements=new Map();let failRead=false,failWrite=false,profileSaved=true,active={id:'learner-ellery',name:'Ellery'};
const window={addEventListener(){}},document={hidden:false,addEventListener(){}};
const localStorage={getItem(k){if(failRead)throw Error('Denied');return store.get(k)??null},setItem(k,v){if(failWrite)throw Error('Quota');store.set(k,v)}};
const LANDS=Array.from({length:10},(_,i)=>({name:'Guardian '+i,land:'World '+i}));
const HERO_OPTIONS={skin:[{id:'warm'},{id:'deep'}],staff:[{id:'moon'}]},DEFAULT_FAIRY_LOOK={skin:'warm',staff:'moon'};
function normalizePantherLook(v){return {skin:v.skin,staff:v.staff}}function cleanHeroName(v){return v.trim()}
let heroName='Ellery',heroStyle='fairy',avatarLook={...DEFAULT_FAIRY_LOOK},pantherCreatorSeen=true;
let questProgress=0,questLocation=-1,questMapChapter=0,questKeys=[],questCompleted=[],questRunStats={answered:0,correct:0,streak:0,bestStreak:0},avatarPoint={},duel=null;
function $(id){if(!elements.has(id))elements.set(id,{textContent:'',hidden:false,classList:{toggle(){}},focus(){},addEventListener(){},close(){this.open=false}});return elements.get(id)}
function journeyPosition(i){return {x:i,y:i}}function resetQuestRun(){duel=null;questProgress=0;questLocation=-1;questMapChapter=0;questKeys=[];questCompleted=[];questRunStats={answered:0,correct:0,streak:0,bestStreak:0}}
function savePantherPreferences(){}function renderHeroProfile(){}function showView(){}function selectMode(){}function showDialog(id){$(id).open=true}function pauseQuest(){}function leaveDuel(){duel=null}function downloadJSON(){}function esc(s){return s}
const RallyLearning={activeProfile:()=>({...active}),isSaving:()=>profileSaved};
${moduleSource}
QuestSaves.init();
assert.equal($('quest-home-continue').hidden,true);
QuestSaves.requestNew();assert.equal($('quest-home-continue').hidden,false);
questProgress=3;questKeys=[0,1,2];questCompleted=[0,1,2];questLocation=2;questRunStats={answered:17,correct:12,streak:4,bestStreak:5};
assert(QuestSaves.save());const saveKey='recall-rally-rigby-save-v1:'+active.id,valid=JSON.parse(store.get(saveKey));
assert.equal(valid.progress.level,3);assert.equal(valid.profile.id,'learner-ellery');assert.equal(valid.interruptedEncounter,null);
QuestSaves.loadProfile();assert.equal(questProgress,3);assert.deepEqual(questKeys,[0,1,2]);assert.equal(questLocation,2);assert.equal(questRunStats.answered,17);
duel={land:3,phase:'result',scores:[2,1],charge:2,index:2};QuestSaves.duelStarted();assert.equal(JSON.parse(store.get(saveKey)).interruptedEncounter,3);
QuestSaves.loadProfile();assert.equal(duel,null);assert.equal(questProgress,3);assert.match($('quest-home-summary').textContent,/restart from the beginning/);
console.log('PASS versioned save round-trip and unfinished encounter checkpoint');
const mutate=change=>{const v=JSON.parse(JSON.stringify(valid));change(v);assert.throws(()=>QuestSaves.validate(v))};
for(const malformed of [null,{},[],1,'bad'])assert.throws(()=>QuestSaves.validate(malformed));
for(const change of [v=>v.version=99,v=>v.worldSet='unknown',v=>v.progress.level=-1,v=>v.progress.level=11,v=>v.progress.level=1.5,v=>v.progress.location=9,v=>v.progress.chapter=2,v=>v.progress.keys=[0,0,2],v=>v.progress.completed=[0,1],v=>v.stats.correct=18,v=>v.stats.streak=7,v=>v.stats.answered=-1,v=>v.interruptedEncounter=9,v=>v.interruptedEncounter='3',v=>v.profile.id='../other',v=>v.hero.style='unknown',v=>v.hero.look.skin='unknown',v=>v.hero.name='',v=>v.savedAt='not a date'])mutate(change);
assert.throws(()=>QuestSaves.validate(valid,'learner-other'));
const sanitized=QuestSaves.validate({...valid,unlockedEncounters:[0,1,2,3,4,5,6,7,8,9],__extra:'ignored'});assert.equal(sanitized.unlockedEncounters,undefined,'untrusted derived unlocks cannot unlock worlds');
console.log('PASS malformed, incompatible, inconsistent, wrong-profile and injected save data rejected');
// Each profile's key is independent even if hero names happen to match.
active={id:'learner-other',name:'Another child'};QuestSaves.loadProfile();assert.equal(questProgress,0);QuestSaves.requestNew();questProgress=1;questKeys=[0];questCompleted=[0];questLocation=0;QuestSaves.save();
active={id:'learner-ellery',name:'Ellery'};QuestSaves.loadProfile();assert.equal(questProgress,3);assert.deepEqual(questKeys,[0,1,2]);
failWrite=true;assert.equal(QuestSaves.save(),false);assert.match(QuestSaves.status(),/saving is unavailable/);assert.equal(JSON.parse(store.get(saveKey)).progress.level,3);
failWrite=false;profileSaved=false;assert.equal(QuestSaves.save(),false);profileSaved=true;assert(QuestSaves.save());assert.match(QuestSaves.status(),/✓ Adventure saved/);
failRead=true;QuestSaves.loadProfile();assert.match(QuestSaves.status(),/storage is unavailable/);failRead=false;
console.log('PASS independent profile keys, quota/read failures and missing stable profile persistence');
store.set(saveKey,'{broken');QuestSaves.loadProfile();assert.equal($('quest-home-continue').hidden,true);assert.equal(store.get(saveKey),'{broken');QuestSaves.onMap();assert.equal(store.get(saveKey),'{broken','map cannot silently replace a corrupt save');
QuestSaves.requestNew();assert.equal($('quest-confirm').open,true);assert.equal(store.get(saveKey),'{broken');$('quest-confirm-keep').onclick();assert.equal(store.get(saveKey),'{broken');QuestSaves.requestNew();$('quest-confirm-accept').onclick();assert.equal(JSON.parse(store.get(saveKey)).progress.level,0);
console.log('PASS corrupt saves survive until explicit reset confirmation');
`,ctx,{timeout:5000});
console.log('PASS inline source synchronization and complete HTML syntax');
