// Focused state regressions against the functions in the actual offline HTML.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const source=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const illustrations=source.slice(source.indexOf('/* ADVENTURE_ILLUSTRATIONS_START */'),source.indexOf('/* ADVENTURE_ILLUSTRATIONS_END */'));
const lands=source.slice(source.indexOf('const LANDS=['),source.indexOf('let questProgress='));
const functions=source.slice(source.indexOf('function startDuel('),source.indexOf('// Refresh only the visible clock'));
const lifecycle=['resetQuestRun','cancelQuestClock','cancelQuestFxTimers','leaveDuel'].map(n=>source.match(new RegExp('^function '+n+'\\([^\\n]+','m'))[0]).join('\n');
const context={assert,console};vm.createContext(context);
vm.runInContext(`
const PANTHER_BATTLE_SCALE=2.25;let reduced=false,mode='adventure',heroName='Mira',avatarLook={},soundOn=false,audioContext=null,questProgress=0,questLocation=-1,avatarPoint={},questKeys=[],questCompleted=[],questRunStats={answered:0,correct:0,streak:0,bestStreak:0},duel=null,questTimer=null,questRescueTimer=null,questFxTimers=[],questPace=0,questQuestionBank='all',questHistory={duels:0,shown:{prior:{count:1}}};
let nextTimer=1;const timers=new Map(),elements=new Map();
function setTimeout(fn,ms){const id=nextTimer++;timers.set(id,{fn,ms});return id}function clearTimeout(id){timers.delete(id)}
const window={matchMedia:()=>({matches:reduced})},performance={now:()=>100},document={querySelector:()=>null};
function $(id){if(!elements.has(id))elements.set(id,{value:id==='quest-speed'?0:id==='quest-bank'?'all':undefined,innerHTML:'',textContent:'',focus(){},scrollIntoView(){},closest(){return null},querySelector(){return null},querySelectorAll(){return []}});return elements.get(id)}
function esc(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;')}function norm(s){return String(s).toLowerCase()}function shuffle(a){return [...a]}function subjectName(s){return s}function sourceLink(){return ''}function avatarEllery(){return '<g>hero</g>'}function heroMagicColor(){return '#a47bed'}function heroMagicGlyph(){return '<g>hero glyph</g>'}function pantherBattleFocus(){return {x:173,y:42}}function pantherSpellTrail(){return '<path/>'}function clearMusicOutcome(){}function syncAdventureMusic(){}function playMusicOutcome(){}function duckMusic(){}function initAudio(){}function tone(){}function stopQuestionCue(){}function questionFanfare(){}function cancelQuestTravel(){}function questSoundEnabled(){return false}function journeyPosition(){return {x:1,y:2}}function saveQuestPreferences(){}function setSoundPreference(){}function renderAdventure(){}function beginFreshAdventure(){resetQuestRun()}function rigbySceneArt(){return 'Rigby artwork'}function rigbyCutawayMarkup(d){return 'Rigby rescue '+d.rescueStage}function stableQuestionId(q){return q.prompt}function recordQuestExposure(q){questHistory.shown[q.prompt]={count:1}}function selectAdventureDeck(land){questHistory.duels++;return Array.from({length:7},(_,i)=>({subject:'math',prompt:'Q'+land+'-'+i,answer:'A',options:['A','B','C','D'],explanation:'Because A.'}))}
${illustrations}\n${lands}\n${lifecycle}\n${functions}
function adventureSubjectLabel(l){return l.subjects?"Mixed subjects":subjectName(l.subject)}function adventureQuestionPool(){return Array.from({length:310})}
function check(x,message){assert.ok(x,message)}
function hit(){chooseQuest(0)}function miss(){chooseQuest(1)}function next(){advanceDuel()}
for(let land=0;land<10;land++){
 resetQuestRun();questProgress=land;questKeys=Array.from({length:land},(_,i)=>i);questCompleted=[...questKeys];startDuel(land);openQuestQuestion();
 check(duel.charge===0&&duel.guardianPhase===1,'fresh duel');hit();hit();check(duel.scores[0]===1&&duel.charge===1,'double answer ignored');next();miss();check(duel.charge===1&&duel.scores[1]===1,'miss keeps charge');next();hit();check(duel.guardianPhase===2&&duel.phaseJustShifted,'phase threshold');
 const phaseMarkup=$('adventure-panel').innerHTML;check(phaseMarkup.includes('guardian-phase-two')&&phaseMarkup.includes('ward-'+LANDS[land].magic)&&phaseMarkup.includes(ARENA_PHASES[land].line),'distinct phase markup '+land);check(phaseMarkup.includes('awakened'),'environment responds');
 finishDuelEffects();replaySpell();check(!duel.phaseJustShifted,'replay does not transition again');next();hit();check(duel.signatureUsed&&!duel.signaturePending&&duel.charge===3,'third answer automatically casts');check(duel.fxActive&&duel.signatureThisAnswer,'third answer uses only the signature sequence');check(!$('adventure-panel').innerHTML.includes('id="cast-starfall"'),'no extra cast button');check(spellDuelScene(duel,LANDS[land]).includes('signature-starfall'),'automatic signature animation');
 const score=duel.scores.join();castStarfall();castStarfall();check(duel.signatureUsed&&!duel.signaturePending&&duel.scores.join()===score,'one signature with no extra point');check($('adventure-panel').innerHTML.includes('signature-starfall'),'signature sequence');replaySpell();check(duel.scores.join()===score,'no extra score from replay');
 next();hit();check(duel.scores[0]===4&&!duel.signaturePending&&!duel.phaseJustShifted,'four points still wins, no second effects');next();check(duel.phase==='rescue'&&duel.rescueStage===land+1,'correct Rigby scene');finishRigbyCutaway();finishRigbyCutaway();check(duel.phase==='won'&&questProgress===land+1,'skip idempotent');
 const history=questHistory;resetQuestRun();check(questProgress===0&&questKeys.length===0&&duel===null&&questHistory===history,'fresh reset keeps history');
 console.log('PASS guardian '+land+': charge, miss, phase, signature, victory, reset');
}
resetQuestRun();startDuel(0);openQuestQuestion();hit();next();hit();next();hit();const before=duel.scores[0];next();check(duel.phase==='open'&&duel.signatureUsed&&duel.scores[0]===before,'Next skips the animation without extra credit');next();check(duel.index===3,'double Next ignored while question is open');leaveDuel();check(duel===null&&questFxTimers.length===0,'navigation cancels pending effects');
startDuel(0);openQuestQuestion();check(duel.charge===0&&!duel.signatureUsed&&duel.guardianPhase===1,'rematch resets effects');reduced=true;hit();next();hit();next();hit();check(duel.signatureUsed&&!duel.signaturePending,'reduced motion automatically releases signature');check(duel.scores[0]===3&&duel.phase==='result','reduced motion no extra turn');leaveDuel();for(const {fn} of [...timers.values()])fn();check(duel===null,'stale callbacks harmless');
startDuel(0);openQuestQuestion();for(let i=0;i<4;i++){miss();next()}check(duel.phase==='lost'&&questProgress===0&&duel.charge===0,'loss never advances rescue');

// Every intent/action/correctness outcome is checked against the displayed result.
reduced=false;
for(let land=0;land<10;land++){
 for(const spell of ['strike','ward'])for(const correct of [true,false]){
  for(let index=0;index<7;index++){
   resetQuestRun();questProgress=land;startDuel(land);duel.index=index;openQuestQuestion();
   const intent=GUARDIAN_PATTERNS[land][index%GUARDIAN_PATTERNS[land].length];
   check(duel.intent===intent&&duel.selectedSpell==='strike','fixed intention/default '+land+'/'+index);
   const announcement=$('adventure-panel').innerHTML;check(announcement.includes('intent-row intent-'+intent)&&announcement.includes(intent==='strike'?'is preparing a strike':'is raising a shield'),'announced intention matches '+intent);
   const question=duel.deck[duel.index],timer=questTimer;selectDuelSpell(spell);selectDuelSpell(spell);check(duel.deck[duel.index]===question&&questTimer===timer&&duel.scores.join()==='0,0','selecting never redeals/scores/restarts clock');
   if(correct)hit();else miss();const points=duel.scores.join(),stars=duel.tacticalStars;chooseQuest(0);selectDuelSpell(spell==='ward'?'strike':'ward');check(duel.scores.join()===points&&duel.tacticalStars===stars&&duel.actionUsed===spell,'duplicate answer or late spell cannot change resolution');
   check(duel.scores[correct?0:1]===1&&questRunStats.correct===(correct?1:0),'full academic credit');
   const expected=correct?(spell==='ward'?(intent==='strike'?'counter':'raise'):(intent==='shield'?'break':'strike')):(intent==='strike'?'hit':'guard');
   check(duel.tacticOutcome===expected,'intent/action behavior '+expected);
   check(duel.tacticalStars===(correct&&((spell==='ward'&&intent==='strike')||(spell==='strike'&&intent==='shield'))?1:0),'matching tactical bonus');
   check(duel.wardThrough===(correct&&spell==='ward'?index+1:-1),'Ward duration / incorrect Ward gives no protection');
   const scene=spellDuelScene(duel,LANDS[land]);if(!correct&&intent==='shield')check(!scene.includes('spell-from-guardian')&&scene.includes('guardian-defending'),'shield turn never launches a spell');
  }
 }
}
// Fern opens with Shield, then two Strikes: store a Ward, block once, expire.
resetQuestRun();questProgress=1;startDuel(1);openQuestQuestion();selectDuelSpell('ward');hit();check(duel.tacticOutcome==='raise'&&duel.wardThrough===1,'store one Ward');next();miss();check(duel.tacticOutcome==='block'&&duel.wardThrough===-1&&duel.scores.join()==='1,1'&&duel.tacticalStars===1,'stored Ward blocks but preserves miss credit');next();miss();check(duel.tacticOutcome==='hit'&&duel.scores.join()==='1,2','protection spent after one question');
resetQuestRun();startDuel(0);openQuestQuestion();selectDuelSpell('ward');hit();next();hit();check(duel.wardThrough===-1,'unused protection expires at next resolution');next();miss();check(duel.tacticOutcome==='hit','expired Ward cannot block');
// Consecutive powered Wards refresh rather than stack, including the signature answer.
resetQuestRun();startDuel(0);openQuestQuestion();for(let i=0;i<3;i++){selectDuelSpell('ward');hit();check(duel.wardThrough===i+1,'refresh, never stack');if(i<2)next()}
check(duel.signatureUsed&&!duel.signaturePending&&duel.scores[0]===3&&duel.charge===3,'Ward earns automatic signature/full credit');const starScore=duel.scores.join(),tacticCount=duel.tacticalStars;castStarfall();castStarfall();check(duel.scores.join()===starScore&&duel.tacticalStars===tacticCount&&duel.wardThrough===3,'signature never duplicates tactics or consumes protection');next();selectDuelSpell('ward');hit();next();check(duel.phase==='rescue'&&duel.wardThrough===-1,'Ward can win and protection ends with duel');
// Timed selection and keyboard shortcuts do not award points or consume a turn.
resetQuestRun();startDuel(0);duel.speed=20000;openQuestQuestion();const clock=questTimer,deadline=duel.deadline;adventureKey({key:'w',target:{tagName:'DIV'},preventDefault(){}});check(duel.selectedSpell==='ward'&&questTimer===clock&&duel.deadline===deadline,'W shortcut keeps the existing clock');adventureKey({key:'s',target:{tagName:'DIV'},preventDefault(){}});check(duel.selectedSpell==='strike','S shortcut');selectDuelSpell('ward');settleDuel(false,'rival');check(questTimer===null&&duel.scores[1]===1&&duel.wardThrough===-1,'timeout gives point, no new Ward');
resetQuestRun();startDuel(0);openQuestQuestion();for(let i=0;i<4;i++){selectDuelSpell('ward');miss();next()}check(duel.phase==='lost'&&duel.scores[1]===4&&duel.deck.length===7,'incorrect Ward cannot avoid defeat or extend deck');
console.log('PASS all 140 intent/spell/result cases, protection expiry/refresh, Starfall, keyboard, timer, victory/defeat');

// Earned-seal assistance: eligibility, activation, consumption, and academic invariants.
reduced=false;resetQuestRun();startDuel(0);openQuestQuestion();
check(duel.assistanceSeal===null&&!duel.assistUsed&&!duel.assistWard,'no assistance before first seal');activateSealAssistance(duel,true);check(!duel.assistUsed,'cannot activate before answer');hit();check(!duel.assistUsed&&duel.charge===1&&duel.scores[0]===1,'unearned seal never helps');
for(let seal=0;seal<5;seal++){
 resetQuestRun();questKeys=Array.from({length:seal+1},(_,i)=>i);questCompleted=[...questKeys];questProgress=questKeys.length;startDuel(Math.min(seal+1,4));openQuestQuestion();
 check(duel.assistanceSeal===seal&&!duel.assistUsed,'latest seal automatically selected '+seal);check(mapSealAssistance().includes(LANDS[seal].reward),'map shows latest seal');hit();
 check(duel.assistUsed&&duel.assistWard&&duel.assistThisAnswer&&duel.scores.join()==='1,0'&&duel.charge===1&&duel.index===0,'first earned spell activates once, with one point/rune');
 const before=duel.scores.join(),stars=duel.tacticalStars;activateSealAssistance(duel,true);settleDuel(true,'choice');check(duel.scores.join()===before&&duel.tacticalStars===stars,'duplicate activation cannot score');
 const scene=spellDuelScene(duel,LANDS[duel.land]);check(scene.includes('seal-assisting')&&scene.includes('--assist-color:'+LANDS[seal].magicColor)&&scene.includes(LANDS[seal].name+'’s'),'own guardian style/credit joins the cast');
 check(!sealAssistArt(duel,LANDS[seal],'<g/>').includes('Rigby'),'no captive Rigby participation');replaySpell();check(!duel.assistThisAnswer&&duel.assistWard&&duel.scores.join()===before,'replay does not reactivate seal');next();hit();check(!duel.assistThisAnswer&&duel.assistWard&&duel.charge===2,'second success does not recharge aid');
 const history=questHistory;resetQuestRun();startDuel(0);openQuestQuestion();check(duel.assistanceSeal===null&&!duel.assistUsed&&!duel.assistWard&&questHistory===history,'new adventure clears eligibility, preserves history');
}
// A seal shield catches only one missed Strike, and correct answers remain required.
resetQuestRun();questProgress=1;questKeys=[0];questCompleted=[0];startDuel(1);openQuestQuestion();miss();activateSealAssistance(duel,true);check(!duel.assistUsed&&!duel.assistWard,'wrong answer cannot activate available assistance');next();hit();check(duel.assistUsed&&duel.assistWard,'first correct after a miss activates');next();const starsBeforeBlock=duel.tacticalStars;miss();
check(duel.assistBlocked&&!duel.assistWard&&duel.tacticOutcome==='block'&&duel.scores.join()==='1,2'&&duel.tacticalStars===starsBeforeBlock+1,'seal blocks once but miss still scores for guardian');
const blockedScore=duel.scores.join(),blockedStars=duel.tacticalStars;chooseQuest(1);activateSealAssistance(duel,true);check(duel.scores.join()===blockedScore&&duel.tacticalStars===blockedStars&&!duel.assistWard,'duplicate block cannot refund shield or score');next();hit();check(!duel.assistWard&&!duel.assistThisAnswer,'later correct answer cannot rearm consumed seal');next();hit();check(duel.signatureUsed&&!duel.signaturePending&&duel.scores[0]===3&&!duel.assistWard,'third success automatically casts signature');castStarfall();castStarfall();check(!duel.assistWard&&duel.scores[0]===3,'signature does not rearm aid or duplicate points');next();hit();next();check(duel.phase==='rescue'&&duel.rescueStage===2&&duel.index===5&&questRunStats.answered===6,'victory still requires four actual correct answers');
// Regular Ward is consumed first; seal protection remains a single separate backstop.
resetQuestRun();questProgress=1;questKeys=[0];questCompleted=[0];startDuel(0);openQuestQuestion();selectDuelSpell('ward');hit();next();selectDuelSpell('ward');hit();next();miss();check(duel.tacticOutcome==='block'&&!duel.assistBlocked&&duel.assistWard,'regular Ward preserves seal shield');next();miss();check(duel.assistWard,'a Shield intention cannot consume seal protection');next();miss();check(duel.assistBlocked&&!duel.assistWard,'next unwarded Strike consumes seal');next();hit();next();miss();next();check(duel.phase==='lost'&&duel.index===6&&duel.deck.length===7&&duel.scores.join()==='3,4'&&questProgress===1,'assistance cannot skip questions, extend deck, or prevent academic defeat');
// A newly earned seal changes only the following duel's assistance snapshot.
resetQuestRun();startDuel(0);openQuestQuestion();for(let i=0;i<4;i++){hit();if(duel.signaturePending)castStarfall();next()}
check(duel.phase==='rescue'&&duel.assistanceSeal===null&&questKeys.join()==='0','first victory does not grant retroactive aid');finishRigbyCutaway();leaveDuel();startDuel(1);openQuestQuestion();check(duel.assistanceSeal===0,'first earned seal aids next duel');for(let i=0;i<4;i++){hit();next()}
check(duel.phase==='rescue'&&duel.assistanceSeal===0&&questKeys.join()==='0,1','current aid remains the starting seal');finishRigbyCutaway();leaveDuel();startDuel(2);openQuestQuestion();check(duel.assistanceSeal===1&&!duel.assistUsed&&mapSealAssistance().includes(LANDS[1].reward),'newest seal replaces old in subsequent duel');
reduced=true;hit();check(duel.assistUsed&&duel.assistWard&&duel.scores[0]===1&&duel.charge===1,'reduced-motion assistance keeps academic rules');finishDuelEffects();check(duel.assistWard,'ending or skipping effects preserves earned shield');leaveDuel();check(duel===null&&questFxTimers.length===0,'navigation ends aid and cancels transient effects');resetQuestRun();check(latestEarnedSeal()===null,'fresh adventure has no active seal');
console.log('PASS seal eligibility, all five styles, once-only shield, Ward priority, Starfall/replay, progression, reset, no extra points/questions');
// Full arena scenery follows actual answers; transient events never become saved progress.
reduced=false;
for(let land=0;land<10;land++){
 resetQuestRun();questProgress=land;questKeys=Array.from({length:land},(_,i)=>i);questCompleted=[...questKeys];startDuel(land);openQuestQuestion();
 const env=()=>arenaEnvironment(duel,LANDS[land]);
 check(env().includes('data-arena-progress="0"')&&env().includes('data-arena-phase="1"')&&duel.envEvent==='', 'arena begins unearned '+land);
 const startMarkup=env(),startHistory=questHistory;hit();const once=duel.scores.join();hit();check(duel.scores.join()===once&&duel.envEvent==='correct'&&env().includes('data-arena-progress="1"'),'one environmental step per real correct answer');
 next();miss();check(env().includes('data-arena-progress="1"')&&duel.envEvent==='miss'&&arenaWorldCaption(duel).includes('stays lit'),'setback retains earned scenery');next();hit();
 check(duel.guardianPhase===2&&duel.phaseJustShifted&&env().includes('data-arena-progress="2"')&&env().includes('data-arena-phase="2"')&&env()!==startMarkup,'second state follows actual success '+land);
 finishDuelEffects();replaySpell();check(duel.envEvent===''&&!duel.phaseJustShifted&&env().includes('data-arena-progress="2"'),'replay cannot repeat milestones');next();hit();
 check(duel.signatureUsed&&!duel.signaturePending&&duel.fxActive&&duel.envEvent==='correct','third-answer automatically powers signature scenery');const beforeCast=duel.scores.join();castStarfall();castStarfall();check(duel.scores.join()===beforeCast&&spellDuelScene(duel,LANDS[land]).includes(' env-signature'),'signature scenery shares the earned spell, no extra point');
 finishDuelEffects();check(duel.envEvent===''&&env().includes('data-arena-progress="3"'),'signature cleanup retains three successes');next();hit();
 check(env().includes('data-arena-progress="4"')&&spellDuelScene(duel,LANDS[land]).includes(' env-victory')&&env().includes('SEAL LIGHT TO RIGBY'),'victory state and rescue connection reflect four answers');const keysBefore=questKeys.length;next();advanceDuel();check(duel.phase==='rescue'&&questKeys.length===keysBefore+1,'exactly one existing cutaway/reward');finishRigbyCutaway();
 check(spellDuelScene(duel,LANDS[land]).includes(' env-victory')&&env().includes('data-arena-phase="2"'),'victorious scenery persists through result');
 leaveDuel();for(const {fn} of [...timers.values()])fn();check(duel===null&&questFxTimers.length===0,'navigation cancels transient work');resetQuestRun();startDuel(0);openQuestQuestion();check(duel.envEvent===''&&duel.scores[0]===0&&questHistory===startHistory,'fresh run resets scenery but retains exposure history');
}
reduced=true;resetQuestRun();startDuel(0);openQuestQuestion();hit();next();hit();check(arenaEnvironment(duel,LANDS[0]).includes('data-arena-phase="2"'),'reduced-motion retains full second state');next();hit();check(duel.signatureUsed&&duel.scores[0]===3,'reduced-motion signature preserves progress');leaveDuel();reduced=false;
console.log('PASS all five evolving arenas: persistent steps, miss recovery, once-only phase/signature, victory, rescue, cleanup, reset, reduced motion');
// Auto-casting schedules exactly one sequence for the third success, never an extra turn.
reduced=false;resetQuestRun();const effectLog=[],actualEffects=runDuelEffects;runDuelEffects=d=>{effectLog.push({signature:d.signatureThisAnswer,points:d.scores[0]});actualEffects(d)};
startDuel(0);openQuestQuestion();for(let i=0;i<3;i++){hit();if(i<2)next()}
check(effectLog.length===3&&!effectLog[0].signature&&!effectLog[1].signature&&effectLog[2].signature,'one signature replaces ordinary third cast');
const thirdIndex=duel.index,thirdScore=duel.scores.join();hit();castStarfall();castStarfall();check(effectLog.length===3&&duel.index===thirdIndex&&duel.scores.join()===thirdScore,'duplicates cannot recast or score');
const compactMarkup=$('adventure-panel').innerHTML,promptEnd=compactMarkup.indexOf('</div>',compactMarkup.indexOf('class="quest-prompt"'))+6,choicesStart=compactMarkup.indexOf('<div class="choices adventure-choices">');check(compactMarkup.slice(promptEnd,choicesStart).trim()==='','question and choices are adjacent');check(compactMarkup.indexOf('class="duel-arena-panel"')>compactMarkup.indexOf('data-quest-choice'),'arena is separate from reading controls');
for(const tagName of ['SUMMARY','A'])adventureKey({key:'Enter',target:{tagName},preventDefault(){throw Error('Details and links must keep native Enter behavior')}});check(duel.index===thirdIndex,'Enter on details or sources cannot advance');
next();check(duel.phase==='open'&&duel.index===thirdIndex+1&&!duel.fxActive,'Next skips effects and opens exactly one question');
runDuelEffects=actualEffects;leaveDuel();const layoutClasses=new Map();document.body={classList:{toggle:(name,on)=>layoutClasses.set(name,on)}};syncDuelLayout();check(layoutClasses.get('adventure-duel-active')===false,'map restores normal chrome');startDuel(0);openQuestQuestion();check(layoutClasses.get('adventure-duel-active')&&layoutClasses.get('duel-playing'),'duel activates compact chrome');leaveDuel();syncDuelLayout();check(!layoutClasses.get('adventure-duel-active')&&!layoutClasses.get('duel-playing'),'leaving clears both layout states');
console.log('PASS automatic Starfall, duplicate protection, adjacent question/choices, animation skip, compact layout lifecycle');
// Review labels make selection, correctness, timeout, and the actual scorer explicit.
resetQuestRun();startDuel(0);openQuestQuestion();
const openMarkup=$('adventure-panel').innerHTML;
check(openMarkup.includes('class="duel-header"')&&openMarkup.includes('Reward: '+LANDS[0].reward)&&!openMarkup.includes('WIN:'),'one header describes the available reward');
check(openMarkup.includes('id="duel-settings"')&&!openMarkup.includes('id="duel-sound"'),'one consolidated settings access');
check(openMarkup.includes('class="duel-answer-footer"')&&openMarkup.includes('id="quest-next" disabled'),'Next has a reserved, disabled position before resolution');
check(!openMarkup.includes('Your answer · Correct')&&!openMarkup.includes('Your answer · Incorrect'),'unanswered choices reveal no answer');
hit();let review=$('adventure-panel').innerHTML;
check(review.includes('✓ Your answer · Correct')&&review.includes('Correct answer · Mira earns 1 answer point.'),'correct review identifies the player selection and academic point');
check((review.match(/ picked"/g)||[]).length===1&&!review.includes('Your answer · Incorrect'),'exactly one picked correct choice');
next();miss();review=$('adventure-panel').innerHTML;
check(review.includes('✕ Your answer · Incorrect')&&review.includes('✓ Correct answer')&&review.includes(LANDS[0].name+' earns 1 answer point.'),'wrong review labels both answers and the guardian point');
check((review.match(/ picked"/g)||[]).length===1,'incorrect selection remains identifiable');
next();settleDuel(false,'rival');review=$('adventure-panel').innerHTML;const timedScore=duel.scores.join();
check(review.includes('Time’s up')&&review.includes('✓ Correct answer')&&!review.includes('Your answer ·')&&!review.includes(' picked"'),'timeout identifies no fabricated selection');
settleDuel(false,'rival');hit();check(duel.scores.join()===timedScore,'duplicate timeout/click cannot score twice');
const scene=spellDuelScene(duel,LANDS[0]);
check(scene.includes('Starfall · Automatic')&&!scene.includes('tactical stars')&&!scene.includes('No seal assistance')&&!scene.includes('spell-replay'),'arena contains compact state instead of the old information stack');
check(review.includes('<summary>Battle details</summary>')&&review.includes('Replay spell sequence')&&review.includes('id="strike-rule"')&&review.includes('id="ward-rule"'),'expanded rules and replay remain available in the disclosure');
leaveDuel();
console.log('PASS compact header, reserved feedback/Next, selected and correct labels, timeout/scorer identity, concise arena and detailed disclosure');
console.log('PASS skip, navigation, rematch, reduced-motion automatic release, defeat');
`,context);

vm.runInContext(`
resetQuestRun();
for(let land=0;land<10;land++){
 startDuel(land);openQuestQuestion();for(let point=0;point<4;point++){hit();next()}
 check(duel.phase==='rescue'&&questProgress===land+1,'one seal per world');
 check((duel.rescueStage===10)===(land===9),'final music/reunion only in tenth world');
 finishRigbyCutaway();leaveDuel();
}
check(questKeys.length===10&&questCompleted.length===10,'all worlds completed');
const history=questHistory;resetQuestRun();check(questProgress===0&&questKeys.length===0&&questHistory===history,'reset preserves history');
for(let i=5;i<10;i++){
 questProgress=i;startDuel(i);openQuestQuestion();
 for(let point=0;point<4;point++){
  hit();const markup=spellDuelScene(duel,LANDS[i]);
  check(markup.includes('expanded-world world-'+i)&&markup.includes('data-guardian="'+i+'"'),'specific arena and guardian');
  check(!markup.replace(/data:image[/]webp;base64,[A-Za-z0-9+/=]+/g,'painted-art').includes('undefined')&&!markup.replace(/data:image[/]webp;base64,[A-Za-z0-9+/=]+/g,'painted-art').includes('NaN'),'complete artwork at every score');next();
 }
 finishRigbyCutaway();leaveDuel();
}
console.log('PASS full ten-world journey, final rescue at world 9 only, reset, five new guardians and all arena progress states');
`,context);
