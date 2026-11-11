const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),source=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const bank=source.slice(source.indexOf('const SAMPLE_ROWS='),source.indexOf('// Storage is optional.'));
const characterArt=source.slice(source.indexOf('/* CHARACTER_ART_START */'),source.indexOf('/* CHARACTER_ART_END */'));
const illustrations=source.slice(source.indexOf('/* ADVENTURE_ILLUSTRATIONS_START */'),source.indexOf('/* ADVENTURE_ILLUSTRATIONS_END */'));
const lands=source.slice(source.indexOf('const LANDS=['),source.indexOf('let questProgress='));
const history=source.slice(source.indexOf('function stableQuestionId('),source.indexOf('function recordQuestExposure('));
const art=source.slice(source.indexOf('function rigbyStage('),source.indexOf('function rigbyCutawayMarkup('));
const arenas=source.slice(source.indexOf('const ARENA_PHASES=['),source.indexOf('function arenaWorldCaption('));
const firstMap=source.match(/^function worldScene\(\).*$/m)[0];
const mapRender=source.slice(source.indexOf('function renderAdventure('),source.indexOf('function startDuel('));
const ctx={assert,console};vm.createContext(ctx);
vm.runInContext(`
let soundOn=false,heroName='Mira',questProgress=0,questLocation=-1,questKeys=[],questCompleted=[],duel=null,avatarPoint={x:55,y:340},questHistory={shown:{},duels:0,recentDecks:{}},questQuestionBank='all',questPace=0,questHistorySaving=true,questRunStats={answered:0};
function norm(s){return String(s).toLowerCase()}function shuffle(a){return [...a]}function supportsMode(q,m){return(q.modes||['quick','written']).includes(m)}function saveQuestHistory(){}function subjectName(s){return s}function esc(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;')}function avatarEllery(){return '<g id="test-hero"/>'}
const RIGBY_ART={friendly:'data:image/webp;base64,fixture'};
function journeyPosition(){return {x:55,y:340}}function updateAvatar(){}function beginFreshAdventure(){}function syncDuelLayout(){}function syncAdventureMusic(){}function setSoundPreference(){}function saveQuestPreferences(){}function mapSealAssistance(){return ''}function rigbyMission(){return ''}
const elements=new Map();function $(id){if(!elements.has(id))elements.set(id,{innerHTML:'',querySelectorAll(){return []}});return elements.get(id)}
${bank}\n${characterArt}\n${illustrations}\n${lands}\n${history}\n${art}\n${arenas}\n${firstMap}\n${mapRender}
const WORLD_STOPS=Array.from({length:10},(_,i)=>[{x:145,y:270},{x:310,y:165},{x:485,y:275},{x:650,y:145},{x:815,y:235}][i%5]);
assert.equal(LANDS.length,10);assert.equal(ARENA_WORLDS.length,10);assert.equal(ARENA_PHASES.length,10);
assert.equal(new Set(LANDS.map(l=>l.land)).size,10);assert.equal(new Set(LANDS.map(l=>l.name)).size,10);
for(let i=0;i<10;i++){
 const pool=adventureQuestionPool(i);assert(pool.length>=200);
 const first=selectAdventureDeck(i);assert.equal(first.length,7);assert.equal(new Set(first.map(q=>q.id)).size,7);
 for(const subject of LANDS[i].subjects||[LANDS[i].subject])assert(first.some(q=>q.subject===subject));
 first.forEach((q,j)=>questHistory.shown[stableQuestionId(q)]={lastTurn:j+1});
 const second=selectAdventureDeck(i);assert(second.every(q=>!first.some(x=>x.id===q.id)),'unseen before repeated');
}
for(let stage=0;stage<=10;stage++){
 questProgress=stage;const castle=rigbyCastleArt(stage,'map'),scene=rigbySceneArt(stage,true);
 assert.equal((castle.match(/class="castle-seal seal-open/g)||[]).length,stage);
 assert(scene.includes('data-rescue-stage="'+stage+'"'));
 assert(!castle.includes('undefined')&&!scene.includes('NaN'));
 assert.equal(castle.includes('rigby-at-home'),stage===10,'rescue only at ten seals');
}
questProgress=0;questMapChapter=0;renderAdventure();let markup=$('adventure-panel').innerHTML;
assert(markup.includes('Mosswood Meadows'));assert(markup.includes('data-level="4"'));assert(!markup.includes('data-level="5"'));
questProgress=5;questMapChapter=1;renderAdventure();markup=$('adventure-panel').innerHTML;
for(let i=5;i<10;i++)assert(markup.includes('data-level="'+i+'"'));
assert(!markup.includes('data-level="4"'));assert(markup.includes('Crystal Caverns')&&markup.includes('MOONSTONE'));
questProgress=10;renderAdventure();assert($('adventure-panel').innerHTML.includes('THE RESCUE IS COMPLETE'));
console.log('PASS ten worlds, mixed/finale subject coverage, unseen deck rotation, ten individual seals, no premature rescue, both map chapters and completed map');
`,ctx);
