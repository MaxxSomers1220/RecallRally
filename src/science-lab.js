// Embedded in the main HTML. Uses the existing bank, journal, hero and save APIs.
const ScienceLab=(()=>{
 'use strict';
 const ID='science-lab',COUNT=5,PASS=3;
 const STATIONS=[
  {id:'potion',name:'Potion Mixer',badge:'Prismatic Potion',color:'#79ddba',topics:['science-01','science-12'],keywords:/material|chemistry|properties|scientific tool|inquiry/i,goal:'Activate five ingredient dispensers.',win:'The Moonbubble Potion is ready!',mishap:'A completely imaginary bubble has given the kettle a magnificent moustache.',repair:'Apply the explanation to steady the dispenser.'},
  {id:'circuit',name:'Circuit Constructor',badge:'Bright Circuit',color:'#f5cb79',topics:['science-02','science-03'],keywords:/electric|magnet|circuit|energy|motion|light|heat/i,goal:'Build a complete loop to light the lamp.',win:'The switch is closed and the lamp is shining!',mishap:'“HIC! The imaginary Fizz-o-bell has the hiccups. The switch stays open while we repair. Read the clue, apprentice!”',repair:'Apply the explanation to reconnect this component.'},
  {id:'creature',name:'Creature Incubator',badge:'Gentle Creature',color:'#d4b6ff',topics:['science-07','science-08','science-09','science-10','science-11'],keywords:/organism|plant|animal|cell|life cycle|body|health/i,goal:'Balance five habitat controls to meet the Moonwing.',win:'Meet a make-believe Moonwing!',mishap:'“A-CHOO! Our imaginary Moonwing sneezed confetti onto the glass. Read the clue, then repair the marked control!”',repair:'Apply the explanation to stabilize the chamber.'},
  {id:'weather',name:'Weather Machine',badge:'Weather Keeper',color:'#91d6f2',topics:['science-04','science-05'],keywords:/weather|climate|atmosphere|water cycle|earth|rock|soil|mineral|fossil/i,goal:"Restore five controls for a miniature rainbow.",win:'The tiny magical sky is balanced!',mishap:"“Teacups in the forecast! Our imaginary cloud has muddled its rain. Read the clue, then repair the marked control.”",repair:'Apply the explanation to repair the next weather control.'},
  {id:'observatory',name:'Star Observatory',badge:'Starlight Explorer',color:'#e8bcf2',topics:['science-06'],keywords:/solar|planet|astronom|space|sun|moon|star|orbit/i,goal:"Make five adjustments to reveal Fizzwick’s Teapot.",win:'Fizzwick’s fictional Teapot constellation shines!',mishap:"“My slipper! An excellent observation of the wrong thing. Read the clue, then realign the marked control.”",repair:'Apply the explanation to realign the telescope.'}
 ];
 let bench=null,approach='explore',openerId='',lastStation='';
 let weatherCue=''; // visual cue only; shared question/repair state stays unchanged
 let observatoryCue=''; // presentation only; existing grades and repair state are unchanged
 let creatureCue=''; // visual cues only; grading and saves remain in the shared flow
 let circuitCue=''; // presentation only; independent of questions and grades
 let potionCue=''; // presentation only; never saved or used to grade an answer
 let initialized=false,data=empty(),run=null,storageMessage='',invalidSave=false,notice='',musicKind='lab-hub';
 const stationById=id=>STATIONS.find(s=>s.id===id);
 function empty(){return{version:1,completed:[],seen:{},records:{},includeCustom:false,notes:[],prismLit:false}}
 function validate(value){
  if(!value||value.version!==1||!Array.isArray(value.completed)||value.completed.length>5||new Set(value.completed).size!==value.completed.length||value.completed.some(id=>!stationById(id))||typeof value.includeCustom!=='boolean')throw Error('Invalid Science Lab progress.');
  if(!value.seen||typeof value.seen!=='object'||Array.isArray(value.seen)||Object.keys(value.seen).length>1500||!value.records||typeof value.records!=='object'||Array.isArray(value.records))throw Error('Invalid Science Lab history.');
  const notes=value.notes===undefined?[]:value.notes,prismLit=value.prismLit===undefined?false:value.prismLit;
  if(!Array.isArray(notes)||notes.length>5||new Set(notes).size!==notes.length||notes.some(id=>!stationById(id))||typeof prismLit!=='boolean'||prismLit&&value.completed.length!==5)throw Error('Invalid laboratory keepsakes.');
  const seen={},records={};for(const [id,at] of Object.entries(value.seen)){if(!/^[a-zA-Z0-9-]{1,120}$/.test(id)||!Number.isSafeInteger(at)||at<0)throw Error('Invalid science question exposure.');seen[id]=at}
  for(const [id,r] of Object.entries(value.records)){
   if(!stationById(id)||!r||!Number.isSafeInteger(r.runs)||r.runs<1||!Number.isInteger(r.bestCorrect)||r.bestCorrect<0||r.bestCorrect>COUNT||!Number.isInteger(r.lastCorrect)||r.lastCorrect<0||r.lastCorrect>r.bestCorrect||typeof r.completedAt!=='string'||!Number.isFinite(Date.parse(r.completedAt)))throw Error('Invalid laboratory discovery record.');
   records[id]={runs:r.runs,bestCorrect:r.bestCorrect,lastCorrect:r.lastCorrect,completedAt:r.completedAt};
  }
  if(value.completed.some(id=>!records[id])||Object.keys(records).some(id=>!value.completed.includes(id)))throw Error('The laboratory badges disagree with the station records.');
  return{version:1,completed:STATIONS.filter(s=>value.completed.includes(s.id)).map(s=>s.id),seen,records,includeCustom:value.includeCustom,notes:STATIONS.filter(s=>notes.includes(s.id)).map(s=>s.id),prismLit};
 }
 function save(){
  if(invalidSave){refreshSaveNote();return false}
  const result=QuestSaves.saveSideQuest(ID,data,validate);storageMessage=result.ok?'✓ Laboratory discoveries saved on this device':result.error;refreshSaveNote();return result.ok;
 }
 function refreshSaveNote(){const el=$('sl-save-status');if(el){el.textContent=storageMessage||'Laboratory discoveries save in this browser on this device.';el.classList.toggle('sl-storage-warning',invalidSave||!!storageMessage&&!storageMessage.startsWith('✓'))}}
 function loadProfile(){
  if($('science-lab')?.open)$('science-lab').close();run=null;bench=null;approach='explore';notice='';
  const result=QuestSaves.readSideQuest(ID,validate);data=result.data||empty();
  if(!result.data)data.includeCustom=selectedQuestionSources().includes('custom');
  invalidSave=result.invalid;storageMessage=result.error||(result.data?'✓ Laboratory discoveries saved on this device':'');
 }
 function eligible(q){return q?.subject==='science'&&/^[a-zA-Z0-9-]{1,120}$/.test(q.id)&&supportsMode(q,'written')&&typeof q.prompt==='string'&&typeof q.answer==='string'&&typeof q.explanation==='string'&&Array.isArray(q.options)&&q.options.length===4&&new Set(q.options.map(norm)).size===4&&q.options.filter(x=>x===q.answer).length===1}
 function pool(includeCustom=data.includeCustom){
  const unique=new Map(),ids=new Set();
  for(const q of [...SAMPLES,...(includeCustom?sourceQuestions('custom'):[])])if(eligible(q)&&!ids.has(q.id)&&!unique.has(stableQuestionId(q))){unique.set(stableQuestionId(q),q);ids.add(q.id)}
  return [...unique.values()];
 }
 function matches(q,station){return station.topics.includes(q.curriculumTopicId)||!q.curriculumTopicId&&station.keywords.test(q.topic||'')}
 function pickDeck(id,trail=approach){
  const station=stationById(id);if(!station)return{deck:[],fallback:false};
  const all=pool(),recent=new Map(Object.entries(data.seen)),latest=new Map();
  for(const a of RallyLearning.snapshot().attempts){const at=Date.parse(a.answeredAt)||0;recent.set(a.questionId,Math.max(recent.get(a.questionId)||0,at));if(at>=(latest.get(a.questionId)?.at||0))latest.set(a.questionId,{at,outcome:a.outcome})}
  const missed=q=>['incorrect','timeout'].includes(latest.get(q.id)?.outcome),difficulty=q=>trail==='stretch'?-(q.difficultyEstimate||2):Math.abs((q.difficultyEstimate||2)-2);
  const order=rows=>shuffle(rows).sort((a,b)=>(trail==='review'?Number(missed(b))-Number(missed(a)):0)||Number(recent.has(a.id))-Number(recent.has(b.id))||(recent.get(a.id)||0)-(recent.get(b.id)||0)||difficulty(a)-difficulty(b));
  const matching=all.filter(q=>matches(q,station)),deck=order(matching).slice(0,COUNT);
  if(deck.length<COUNT)deck.push(...order(all.filter(q=>!deck.includes(q))).slice(0,COUNT-deck.length));
  return{deck,fallback:matching.length<COUNT};
 }
 function noteSeen(q){
  data.seen[q.id]=Date.now();const rows=Object.entries(data.seen).sort((a,b)=>b[1]-a[1]);data.seen=Object.fromEntries(rows.slice(0,1500));save();
 }
 function inventoryMarkup(){
  if(!initialized)return '';
  return '<section class="sl-map-entrance" aria-label="Science Lab side quest"><span class="sl-prism-token" aria-hidden="true">'+prismIcon()+'</span><div><strong>'+(data.completed.length===5?'The Alchemist’s Prism':'Professor Fizzwick’s laboratory')+'</strong><p>'+(data.completed.length===5?'Artifact earned · a cosmetic keepsake of five discoveries. Your answers and guardian seals work exactly as before.':data.completed.length+' / 5 discovery badges · help repair five magical science stations.')+'</p></div><button class="secondary" id="quest-science-lab">Enter the Science Lab →</button></section>';
 }
 function open(){
  if(!initialized)return;openerId=document.activeElement?.id||(mode==='adventure'?'quest-science-lab':'open-science-lab');
  if(questWalking)cancelQuestTravel();if(duel?.phase==='open'&&!duel.paused)pauseQuest();
  if(game&&!game.paused&&!['summary','result'].includes(game.phase))togglePause();
  run=null;bench=null;notice='';renderHub();showDialog('science-lab');$('sl-title').focus({preventScroll:true});
 }
 function close(){if($('science-lab').open)$('science-lab').close()}
 function professor(mood='calm'){return SCIENCE_LAB_ART.professor.replace('class="sl-fizzwick"','class="sl-fizzwick '+(mood==='mishap'?'is-surprised':'')+'"')}
 function heroArt(pose='idle'){return '<svg viewBox="-35 0 390 425" class="sl-hero-art" role="img" aria-label="'+esc(heroName)+' — your customized hero" data-hero-style="'+heroStyle+'" data-hero-skin="'+esc(avatarLook.skin)+'" data-hero-outfit="'+esc(avatarLook.outfit)+'">'+renderGameHero(avatarLook,{idPrefix:'science-lab-hero',pose})+'</svg>'}
 function prismIcon(){return '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M40 4 69 30 54 70H26L11 30Z" fill="#b5e5e0" stroke="#e0bd79" stroke-width="3"/><path d="M40 4 26 70M40 4 54 70M11 30H69M11 30 54 70M69 30 26 70" fill="none" stroke="#fff2ca" stroke-width="2"/><path d="M20 30 38 10 32 30Z" fill="#d7b5f1"/><path d="M34 34 40 61 49 34Z" fill="#77cdbb"/></svg>'}
 function header(subtitle){return '<header class="sl-header"><div><span class="sl-eyebrow">RECALL RALLY · SCIENCE SIDE QUEST</span><h2 id="sl-title" tabindex="-1">The Alchemist’s Science Lab</h2><p>'+esc(subtitle)+'</p></div><div class="sl-header-actions"><button class="sl-quiet" id="sl-sound" aria-pressed="'+soundOn+'">Sound '+(soundOn?'on':'off')+'</button><button class="sl-quiet" id="sl-close" aria-label="Leave the Science Lab">Return to adventure ×</button></div></header>'}
 function footer(){return '<footer class="sl-footer"><span>Magical effects are make-believe. Learn real science from your existing question bank.</span><span id="sl-save-status" role="status"></span></footer>'}
 // Presentation-only audio state; questions, repairs and saved progress never depend on it.
 function musicState(){return $('science-lab')?.open?{kind:musicKind,paused:false}:null}
 function notifyMusic(){document.dispatchEvent(new Event('rally-music-state'))}
 function bindCommon(){
  notifyMusic();
  $('sl-close').onclick=close;if($('sl-open-model'))$('sl-open-model').onclick=()=>openModel(run.station.id);$('sl-sound').onclick=()=>{setSoundPreference(!soundOn);$('sl-sound').textContent='Sound '+(soundOn?'on':'off');$('sl-sound').setAttribute('aria-pressed',String(soundOn))};refreshSaveNote();
 }
 function renderHub(){
  musicKind='lab-hub';
  const earned=data.completed.length,custom=sourceQuestions('custom').filter(eligible).length;
  $('science-lab').innerHTML=header('Five experiments. One wonderfully wonky laboratory.')+'<div class="sl-body sl-hub"><section class="sl-mission"><div class="sl-hub-professor">'+professor()+'</div><div><span class="sl-eyebrow">A MESSAGE FROM PROFESSOR FIZZWICK</span><h3>“A little help, my brilliant apprentice?”</h3><p>Answer 3 of 5 questions correctly to make an experiment work and earn its badge. Read every explanation. You can try again!</p></div><div class="sl-hub-hero">'+heroArt()+'<span>'+esc(heroName)+'</span></div></section>'+
   '<p class="sl-route">1 · Choose a station <span>→</span> 2 · Predict &amp; observe (optional) <span>→</span> 3 · Answer five questions <span>→</span> 4 · Get 3 right to earn a badge</p><div class="sl-room" style="background-image:url('+SCIENCE_LAB_ART.room+')"><div class="sl-room-sign">FIZZ • WICK • WORKSHOP<span>Choose any station to investigate</span></div><div class="sl-stations">'+STATIONS.map(s=>'<button class="sl-station '+(data.completed.includes(s.id)?'is-discovered':'')+'" data-sl-station="'+s.id+'" style="--station-color:'+s.color+'" aria-label="'+s.name+(data.completed.includes(s.id)?', discovery badge earned, replay experiment':', start a five-question experiment')+'">'+equipment(s,data.completed.includes(s.id)?5:0,'hub')+'<strong>'+s.name+'</strong><span>'+(data.completed.includes(s.id)?'✓ '+s.badge:'5 questions · goal: 3 correct →')+'</span></button>').join('')+'</div></div>'+
   '<section class="sl-discovery-shelf" aria-label="Laboratory discoveries"><span class="sl-prism-token">'+prismIcon()+'</span><div><strong>'+(earned===5?'The Alchemist’s Prism is yours!':earned+' / 5 discovery badges')+'</strong><p>'+(earned===5?'Your artifact is displayed on the adventure map. It is cosmetic and never answers or skips questions.':'Succeed at all five stations to earn The Alchemist’s Prism. Mistakes never remove badges or Rigby’s seals.')+'</p></div><div class="sl-badges">'+STATIONS.map(s=>'<span class="sl-badge '+(data.completed.includes(s.id)?'earned':'')+'" title="'+s.badge+'" aria-label="'+s.badge+': '+(data.completed.includes(s.id)?'earned':'not yet earned')+'">'+(data.completed.includes(s.id)?'✓':'◇')+'</span>').join('')+'</div></section>'+
   '<div class="sl-hub-tools"><label>Question trail <select id="sl-approach"><option value="explore" '+(approach==='explore'?'selected':'')+'>Explore · build confidence</option><option value="review" '+(approach==='review'?'selected':'')+'>Review · revisit missed ideas</option><option value="stretch" '+(approach==='stretch'?'selected':'')+'>Stretch · try harder questions</option></select></label>'+(custom?'<label><input type="checkbox" id="sl-custom" '+(data.includeCustom?'checked':'')+'> Include my science study pack ('+custom+')</label>':'<span>Uses Recall Rally’s built-in science bank.</span>')+'<span>Unfinished experiments restart; completed badges are kept.</span><button class="sl-quiet" id="sl-notebook">Field notebook · '+data.notes.length+' / 5</button> <button class="sl-quiet" id="sl-export">Export lab backup</button><label class="sl-import">Import lab backup<input id="sl-import" type="file" accept="application/json,.json"></label>'+(invalidSave?'<button class="sl-quiet" id="sl-repair-save">Replace damaged lab save</button>':'')+'</div><p id="sl-notice" role="status">'+esc(notice)+'</p></div>'+footer();
  bindCommon();$('science-lab').querySelectorAll('[data-sl-station]').forEach(b=>b.onclick=()=>start(b.dataset.slStation));
  if($('sl-custom'))$('sl-custom').onchange=()=>{data.includeCustom=$('sl-custom').checked;save()};
  $('sl-export').onclick=()=>downloadJSON({format:'recall-rally-science-lab',version:1,data:validate(data)},'Recall_Rally_Science_Lab.json');
  $('sl-import').onchange=importBackup;$('sl-notebook').onclick=renderNotebook;$('sl-approach').onchange=()=>{approach=$('sl-approach').value;notice=approach==='review'?'Missed ideas come first, when this station has them. No timer.':approach==='stretch'?'Harder unseen questions come first. You can change trails any time.':'Start with familiar science ideas. Each explanation helps you learn.';$('sl-notice').textContent=notice};
  if($('sl-repair-save'))$('sl-repair-save').onclick=()=>{if(window.confirm('Replace this damaged lab save with the discoveries from this visit? Rigby’s adventure and learning history will be kept.')){invalidSave=false;save();renderHub()}};
 }
 function start(id){
  potionCue='';circuitCue='';creatureCue='';observatoryCue='';weatherCue='';lastStation=id;const station=stationById(id),selection=pickDeck(id);if(!station||selection.deck.length<COUNT){notice='Five different science questions are needed. Add eligible science questions or try the built-in pool.';renderHub();return}
  run={station,approach,wasCompleted:data.completed.includes(id),deck:selection.deck,index:0,phase:'question',steps:0,correctCount:0,answers:[],selected:null,choices:[],correct:null,profileId:RallyLearning.activeProfile().id,fallback:selection.fallback,paused:false};present();
 }
 function present(){
  const q=run.deck[run.index];run.phase='question';run.selected=null;run.correct=null;run.choices=shuffle(q.options);
  noteSeen(q);RallyLearning.present(run,q,'science-lab');renderExperiment();$('sl-prompt').focus({preventScroll:true});
 }
 function choose(index){
  if(bench||!run||run.phase!=='question'||run.paused||run.profileId!==RallyLearning.activeProfile().id||!Number.isInteger(index)||index<0||index>3)return;
  const q=run.deck[run.index];run.phase='feedback';run.selected=index;run.correct=run.choices[index]===q.answer;
  run.answers.push(run.correct);
  if(run.correct){run.correctCount++;run.steps++}
  if(run.station.id==='potion')potionCue=run.correct?'activate':'mishap';
  if(run.station.id==='circuit')circuitCue=run.correct?'activate':'mishap';
  if(run.station.id==='creature')creatureCue=run.correct?'activate':'mishap';
  if(run.station.id==='observatory')observatoryCue=run.correct?'activate':'mishap';
  if(run.station.id==='weather')weatherCue=run.correct?'activate':'mishap';
  RallyLearning.record(run,q,run.correct?'correct':'incorrect','choice',true);
  tone(run.correct?'correct':'miss');renderExperiment();$('sl-next').focus({preventScroll:true});if(window.innerWidth<=720)$('sl-next').scrollIntoView({block:'nearest',behavior:'instant'});
 }
 function next(){
  if(bench||!run||run.phase!=='feedback')return;
  // Applying the existing explanation repairs a mishap, never changes its grade.
  if(!run.correct)run.steps++;
  if(run.station.id==='potion')potionCue=!run.correct?'repair':'';
  if(run.station.id==='circuit')circuitCue=!run.correct?'repair':'';
  if(run.station.id==='creature')creatureCue=!run.correct?'repair':'';
  if(run.station.id==='observatory')observatoryCue=!run.correct?'repair':'';
  if(run.station.id==='weather')weatherCue=!run.correct?'repair':'';
  if(run.index===COUNT-1){finishExperiment();return}
  run.index++;present();
 }
 function finishExperiment(){
  if(!run||run.phase!=='feedback'||run.index!==COUNT-1)return;
  run.phase='complete';const id=run.station.id,old=data.records[id];
  run.success=run.correctCount>=PASS;
  if(run.success&&!data.completed.includes(id))data.completed.push(id);
  // Keep the v1 earned-badge record format. Every attempt, including a failed
  // first experiment, is already recorded in the shared learning journal.
  if(run.success||old)data.records[id]={runs:(old?.runs||0)+1,bestCorrect:Math.max(old?.bestCorrect||0,run.correctCount),lastCorrect:run.correctCount,completedAt:run.success?new Date().toISOString():old.completedAt};
  save();renderComplete();
 }
 function machinePanel(){
  const final=run.phase==='complete',success=final&&run.success,failed=final&&!run.success,visualSteps=final?(success?COUNT:Math.min(run.correctCount,2)):Math.min(run.steps,COUNT-1);
  const s=run.station,mishap=run.phase==='feedback'&&!run.correct,isPotion=s.id==='potion',isCircuit=s.id==='circuit',isCreature=s.id==='creature',upgrade=s.id==='observatory'?StarObservatoryArt:s.id==='weather'?WeatherMachineArt:null,upgradePrefix=s.id==='weather'?'wm':'so',cue=final?(success?'finale':'mishap'):isPotion?potionCue:isCircuit?circuitCue:isCreature?creatureCue:upgrade?(s.id==='weather'?weatherCue:observatoryCue):'';
  if(isPotion)potionCue='';if(isCircuit)circuitCue='';if(isCreature)creatureCue='';if(upgrade){observatoryCue='';weatherCue='';}
  const upgradeLine=!upgrade?'':s.id==='weather'?(visualSteps===5?'“A miniature sky! Sunlight bends and reflects inside water droplets to spread into rainbow colors.”':cue==='repair'?'“Forecast repaired! Applying that explanation fixed the next control.”':'“'+upgrade.steps[visualSteps]+'. Watch the instrument change!”'):(visualSteps===5?'“A splendid Teapot! This pattern is invented. A real telescope gathers and focuses light from distant objects.”':cue==='repair'?'“Slipper mystery solved! That explanation helped us realign the instrument.”':'“'+upgrade.steps[visualSteps]+'. Watch the instrument change!”');
  const reaction=failed||mishap?'startled':visualSteps===5?'celebrate':cue==='activate'||cue==='repair'?'excited':'curious';
  const potionProfessor=isPotion?SCIENCE_LAB_ART.potionProfessor.replace('sl-fizzwick pm-fizzwick','sl-fizzwick pm-fizzwick is-'+(reaction==='startled'?'surprised':reaction)):'';
  return '<aside class="sl-experiment '+(isPotion?'sl-potion-experiment ':isCircuit?'sl-circuit-experiment ':isCreature?'sl-creature-experiment ':upgrade?'sl-'+s.id+'-experiment ':'')+(final?(success?'sl-outcome-success sl-success':'sl-outcome-failure'):mishap?'sl-mishap':run.correct?'sl-success':'is-thinking')+'" aria-label="Interactive '+s.name+'"><div class="sl-experiment-heading"><span>'+esc(s.goal)+'</span><strong>'+(run.phase==='feedback'?run.index+1:run.phase==='complete'?5:run.index)+' answered · '+run.correctCount+' correct · Goal: 3</strong></div><button class="sl-quiet sl-model-link" id="sl-open-model">Try a science model: predict → observe</button><div class="sl-stage" style="background-image:url('+SCIENCE_LAB_ART.room+');--station-color:'+s.color+'" data-sl-progress="'+visualSteps+'" data-sl-machine="'+s.id+'">'+equipment(s,visualSteps,'experiment',cue,mishap||failed)+(final?ScienceLabOutcomes.render(s.id,success):'')+(upgrade?'<span class="'+upgradePrefix+'-scene-caption" role="status">'+esc(failed?failureCaption(s.id):mishap?(s.id==='weather'?'Teacup forecast! Read, then repair.':'Slipper found! Read, then realign.'):upgrade.description(visualSteps))+'</span>':'')+(isCreature?'<span class="ci-scene-caption" role="status">'+esc(failed?failureCaption(s.id):mishap?'Confetti sneeze! Read, then repair the marked control.':CreatureIncubatorArt.description(visualSteps))+'</span>':'')+(isCircuit?'<span class="cc-scene-caption" role="status">'+esc(failed?failureCaption(s.id):mishap?'Hiccup! Switch open · repair needed.':CircuitConstructorArt.description(visualSteps))+'</span>':'')+(isPotion?'<span class="pm-scene-caption" role="status">'+esc(failed?failureCaption(s.id):mishap?'A moustache bubble! Read, then repair.':PotionMixerArt.description(visualSteps))+'</span>':'')+'<div class="sl-hero">'+heroArt(success?'victory':!final&&run.correct?'cast':'idle')+'</div><div class="sl-professor">'+(isPotion?potionProfessor:professor(failed||mishap?'mishap':'calm'))+'</div><div class="sl-poof" aria-hidden="true">✦ · ✧</div></div><div class="sl-fizzwick-line"><strong>Professor Fizzwick</strong><p>'+esc(final?(success?'“You did it! Your discoveries helped make it work! Brilliant experimenting, apprentice.”':'“Oh well—you tried your best! Let’s use what we learned. I’ll fetch the mop!”'):mishap?s.mishap:upgrade?upgradeLine:isCreature?visualSteps===5?'“Meet the Moonwing! A fictional friend in a make-believe habitat. Real organisms have different needs.”':cue==='repair'?'“Bless your little wings! That explanation helped us steady the habitat control.”':'“'+CreatureIncubatorArt.steps[visualSteps]+'. Watch the chamber and our sleepy friend!”':isCircuit?visualSteps===5?'“A complete loop! The battery transfers energy to the lamp as light and heat. Splendid!”':cue==='repair'?'“Hiccups cured! You used the explanation to fix the connection.”':'“'+CircuitConstructorArt.steps[visualSteps]+'. The lamp needs a complete conducting loop.”':isPotion&&visualSteps===5?'“Moonbubbles! A perfectly splendid potion. You made every step work!”':isPotion&&cue==='repair'?'“Aha! Applying that explanation fixed the valve. Onward, apprentice!”':run.correct?'“Brilliant thinking! Another piece of our experiment is working.”':'“Take your time. A discovery begins with a question.”')+'</p></div><div class="sl-step-track" aria-label="'+(final?'Original answers: '+run.correctCount+' correct. Check means correct; loop means reviewed.':'Practice repairs only; these do not change correct answers')+'">'+Array.from({length:COUNT},(_,i)=>{const repair=!final&&i===run.index&&mishap,state=final?(run.answers[i]?'answer-correct':'answer-reviewed'):i<visualSteps?'repaired':repair?'needs-repair':i===run.index?'current':'waiting';return '<span class="'+state+'" data-sl-step="'+state+'" aria-label="'+(final?'Question '+(i+1):upgrade?upgrade.steps[i]:isCreature?CreatureIncubatorArt.steps[i]:'Step '+(i+1))+': '+(repair?'needs repair':state)+'">'+(final?(run.answers[i]?'✓':'↺'):i<visualSteps?'✓':repair?'↺':i+1)+(upgrade?'<small>'+upgrade.labels[i]+'</small>':isCreature?'<small>'+['Air','Warmth','Moisture','Light','Check'][i]+'</small>':'')+'</span>'}).join('')+'</div>'+(isCircuit&&!final?'<p class="cc-next-action">'+esc(CircuitConstructorArt.nextAction(visualSteps,mishap))+'</p><p class="cc-science-note">Wire glow shows current only when the loop is closed. Battery energy becomes light and heat; the bell’s hiccup is make-believe.</p>':'')+(isCreature&&!final?'<p class="ci-next-action">'+esc(CreatureIncubatorArt.nextAction(visualSteps,mishap))+'</p><p class="ci-science-note">Moonwings and confetti sneezes are fantasy. Real organisms need suitable conditions; these gauges are illustrations, not measurements.</p>':'')+(upgrade&&!final?'<p class="'+upgradePrefix+'-next-action">'+esc(upgrade.nextAction(visualSteps,mishap))+'</p><p class="'+upgradePrefix+'-science-note">'+(s.id==='weather'?'Water vapor is invisible; clouds are tiny droplets or ice crystals. Rainbow optics are simplified; teacup rain is make-believe.':'Fizzwick’s Teapot and these star positions are invented. Telescopes gather and focus light; this display is not a real sky map.')+'</p>':'')+'</aside>';
 }
 function renderExperiment(){
  musicKind='lab-'+run.station.id;
  const q=run.deck[run.index],s=run.station,answered=run.phase==='feedback',topic=CURRICULUM_TOPICS.find(t=>t.id===q.curriculumTopicId)?.title||q.topic||'Science practice';
  $('science-lab').innerHTML=header(s.name+' · Question '+(run.index+1)+' of '+COUNT)+'<div class="sl-body sl-workspace"><section class="sl-question" data-question-id="'+esc(q.id)+'" aria-label="Science question and answers"><div class="sl-question-meta"><span>Question '+(run.index+1)+' of 5 · '+run.correctCount+' correct · Goal: 3</span><button class="sl-quiet" id="sl-hub">Laboratory hub</button></div><h3 id="sl-prompt" tabindex="-1">'+esc(q.prompt)+'</h3><div class="sl-answers">'+run.choices.map((answer,i)=>'<button class="sl-answer '+(answered&&answer===q.answer?'sl-correct':answered&&i===run.selected?'sl-incorrect':'')+'" data-sl-choice="'+i+'" '+(answered?'disabled':'')+'><kbd>'+(i+1)+'</kbd><span>'+esc(answer)+(answered&&answer===q.answer?'<small>✓ Correct answer</small>':answered&&i===run.selected?'<small>Your answer</small>':'')+'</span></button>').join('')+'</div>'+
   (answered?'<section class="sl-feedback '+(run.correct?'is-correct':'is-mishap')+'" role="status"><strong id="sl-feedback-title">'+(run.correct?'✓ Correct! A useful discovery.':'↺ A clue to investigate. Read, then repair.')+'</strong><p class="sl-right-answer">Correct answer: '+esc(q.answer)+'</p><p class="sl-explanation">'+esc(q.explanation)+'</p>'+(!run.correct?'<p class="sl-repair-copy">'+esc(s.repair+' Practice repairs do not change your score.')+'</p>':'')+'<details class="sl-source"><summary>Question source &amp; topic</summary><p>'+esc(topic)+'</p>'+(!q.guide?'<p>'+esc(q.source||'Recall Rally built-in practice')+'</p>':'')+sourceLink(q)+'<small>Question ID: '+esc(q.id)+'</small></details></section><button class="sl-next" id="sl-next" aria-describedby="sl-feedback-title">'+(run.index===COUNT-1?'Show experiment result →':run.correct?'Next experiment step →':'Apply the explanation & continue →')+'</button>':'<p class="sl-question-tip">Choose an answer, or press 1–4. No timer. Mistakes are a chance to learn.</p>')+
   (run.fallback?'<p class="sl-fallback">Science topics are mixed here to provide five different questions.</p>':'')+'</section>'+machinePanel()+'</div>'+footer();
  bindCommon();$('sl-hub').onclick=returnHub;$('science-lab').querySelectorAll('[data-sl-choice]').forEach(b=>b.onclick=()=>choose(Number(b.dataset.slChoice)));if($('sl-next'))$('sl-next').onclick=next;
 }
 function failureCaption(id){return {potion:'Foam overflow!',circuit:'POP! A make-believe puff of smoke.',creature:'A magical cloud hides the Moonwing.',weather:'WHOOSH! A tiny magical storm.',observatory:'A jumble of imaginary stars!'}[id]}
 function failureLine(id){return {potion:'POOF! Moonbubble foam spills over the kettle. Fizzwick fetches a mop!',circuit:'POP! The fantasy Fizz-o-bell sputters into a puff of make-believe smoke.',creature:'POOF! A magical cloud fills the chamber. The Moonwing stays safely hidden.',weather:'WHOOSH! A tiny make-believe storm whisks papers and Fizzwick’s hat around.',observatory:'WHIRR! The telescope spins and projects a jumble of imaginary stars.'}[id]}
 function renderComplete(){
  musicKind='lab-'+run.station.id;
  const s=run.station,success=run.success,all=data.completed.length===5,nextStation=STATIONS.find(x=>!data.completed.includes(x.id));
  $('science-lab').innerHTML=header(s.name+' · '+(success?'Experiment worked!':'A surprising result!'))+'<div class="sl-body sl-complete" data-sl-outcome="'+(success?'success':'failure')+'"><section><div class="sl-award" aria-hidden="true">'+(success?prismIcon():'<span class="sl-oops-token">POOF!</span>')+'</div><span class="sl-eyebrow">'+(success?(run.wasCompleted?'SUCCESSFUL REPLAY · BADGE KEPT':'DISCOVERY BADGE EARNED'):'A CHANCE TO TRY AGAIN')+'</span><h3 id="sl-result-title" tabindex="-1">'+(success?esc(s.win):'A funny experiment mix-up!')+'</h3><p class="sl-result-score"><strong>'+run.correctCount+' / 5 correct</strong> · Goal: 3</p><p>'+(success?'You did it! Your discoveries helped make it work!':esc(failureLine(s.id)))+'</p>'+(!success?'<p>“Well, that was unexpected! Scientists learn from experiments that don’t work, too.”</p><p>'+ (run.wasCompleted?'Your earlier badge'+(all?' and Prism are':' is')+' safe.':'No new badge this time. Try for 3 correct when you feel ready.')+'</p>':'<p>Brilliant experimenting! '+esc(s.badge)+' is yours.</p>')+'<p>Your original answers stay in My learning. These magical effects are make-believe.</p>'+(success&&all?'<div class="sl-artifact"><strong>The Alchemist’s Prism</strong><p>All five badges collected! Your cosmetic keepsake is in your adventure inventory.</p></div>':'')+(success&&nextStation?'<button class="sl-next" id="sl-next-station">Next discovery: '+esc(nextStation.name)+' →</button>':'')+(success&&all?'<button class="sl-next" id="sl-light-prism">'+(data.prismLit?'Visit the shining Prism':'Light the Alchemist’s Prism')+' ✦</button>':'')+'<button class="sl-next" id="sl-retry">'+(success?'Try this experiment again':'Try Again')+'</button><button class="sl-next" id="sl-back-hub">Back to the Lab</button></section>'+machinePanel()+'</div>'+footer();
  bindCommon();if($('sl-light-prism'))$('sl-light-prism').onclick=lightPrism;if($('sl-next-station'))$('sl-next-station').onclick=()=>start(nextStation.id);$('sl-retry').onclick=()=>start(s.id);$('sl-back-hub').onclick=returnHub;$('sl-result-title').focus({preventScroll:true});
 }
 function renderNotebook(){
  musicKind='lab-hub';
  $('science-lab').innerHTML=header('Fizzwick’s field notebook')+'<div class="sl-body sl-notebook"><h3>Small tests. Big discoveries.</h3><p>Compare both conditions in a science model to keep its note. These are the explanations from your science bank.</p>'+STATIONS.map(s=>{const m=ScienceLabModels.get(s.id);return '<article><h4>'+(data.notes.includes(s.id)?'✓ ':'◇ ')+esc(m.title)+'</h4>'+(data.notes.includes(s.id)?'<p>'+esc(m.record.explanation)+'</p><details class="sl-source"><summary>Science source</summary><p>'+esc(m.record.prompt)+'</p>'+sourceLink(m.record)+'<small>Question ID: '+esc(m.record.id)+'</small></details>':'<p>Try the model at '+s.name+' and compare both conditions.</p>')+'</article>'}).join('')+'<button class="sl-next" id="sl-notebook-back">Back to the laboratory</button>'+(data.completed.length===5?'<button class="sl-next" id="sl-light-prism">Visit the Alchemist’s Prism ✦</button>':'')+'</div>'+footer();
  bindCommon();$('sl-notebook-back').onclick=()=>{renderHub();$('sl-notebook').focus({preventScroll:true})};if($('sl-light-prism'))$('sl-light-prism').onclick=lightPrism;$('sl-title').focus({preventScroll:true});
 }
 function lightPrism(){
  if(data.completed.length!==5)return;musicKind='lab-hub';data.prismLit=true;save();
  $('science-lab').innerHTML=header('Five discoveries · The Alchemist’s Prism')+'<div class="sl-body sl-finale"><div class="sl-finale-cast">'+heroArt('victory')+'<div class="sl-prism-finale">'+prismIcon()+'</div>'+professor()+'</div><h3>The laboratory is humming again!</h3><p>“Five discoveries, one shining Prism. And only one teacup in the rain gauge. A new record!”</p><p>Professor Fizzwick bows. “You observed, tested, and learned from each surprise. Thank you, apprentice.”</p><ul class="sl-finale-badges">'+STATIONS.map(s=>'<li>✓ '+s.badge+'</li>').join('')+'</ul><p>Your Prism is in your adventure inventory. It is a keepsake, not an answer key.</p><div class="sl-finale-actions"><button class="sl-next" id="sl-finale-return">Return to Recall Rally →</button><button class="sl-quiet" id="sl-finale-hub">Revisit the laboratory</button></div></div>'+footer();
  bindCommon();$('sl-finale-return').onclick=close;$('sl-finale-hub').onclick=returnHub;$('sl-title').focus({preventScroll:true});
 }
 async function importBackup(event){
  const input=event.target,file=input.files?.[0],profileId=RallyLearning.activeProfile().id;if(!file)return;
  try{if(file.size>250000)throw Error('Choose a lab backup smaller than 250 KB.');const value=JSON.parse(await file.text());if(value.format!=='recall-rally-science-lab'||value.version!==1)throw Error('Choose a Science Lab backup.');const incoming=validate(value.data);
   if(RallyLearning.activeProfile().id!==profileId)throw Error('The player changed. Choose the backup again.');
   if(!window.confirm('Import these lab discoveries for '+RallyLearning.activeProfile().name+'? Existing lab badges will be replaced. Rigby’s adventure and learning records will be kept.'))return;
   const result=QuestSaves.saveSideQuest(ID,incoming,validate);if(!result.ok)throw Error(result.error);data=incoming;invalidSave=false;storageMessage='✓ Laboratory discoveries saved on this device';notice='Lab backup imported.';renderHub();
  }catch(e){notice='Lab import did not finish: '+e.message;const el=$('sl-notice');if(el)el.textContent=notice}finally{input.value=''}
 }
 function returnHub(){
  run=null;bench=null;renderHub();const target=$('science-lab').querySelector('[data-sl-station="'+lastStation+'"]')||$('sl-title');target.focus({preventScroll:true});
 }
 function openModel(id){
  if(!ScienceLabModels.get(id))return;
  if(run&&run.phase==='question'){run.paused=true;RallyLearning.syncPause(run)}
  bench={id,setting:0,prediction:null,observed:false,checked:0};renderModel();$('sl-model-title').focus({preventScroll:true});
 }
 function renderModel(){
  musicKind='lab-'+bench.id;
  const m=ScienceLabModels.get(bench.id),result=bench.observed?ScienceLabModels.outcome(bench.id,bench.setting):null;
  $('science-lab').innerHTML=header('Predict → change one thing → observe → compare')+'<div class="sl-body sl-model"><section><span class="sl-eyebrow">OPTIONAL SCIENCE MODEL · NO GRADE</span><h3 id="sl-model-title" tabindex="-1">'+esc(m.title)+'</h3><p>'+esc(m.scope)+'</p><fieldset><legend>'+esc(m.control)+'</legend>'+m.settings.map((text,i)=>'<button class="sl-quiet" data-sl-condition="'+i+'" aria-pressed="'+(bench.setting===i)+'">'+esc(text)+'</button>').join('')+'</fieldset><fieldset><legend>'+esc(m.ask)+'</legend>'+m.predictions.map((text,i)=>'<button class="sl-quiet" data-sl-predict="'+i+'" aria-pressed="'+(bench.prediction===i)+'">'+(i+1)+' · '+esc(text)+'</button>').join('')+'</fieldset><button class="sl-next" id="sl-observe" '+(bench.prediction===null?'disabled':'')+'>Test this condition</button><button class="sl-quiet" id="sl-model-back">Back to my experiment</button></section><section class="sl-model-observation">'+ScienceLabModels.diagram(bench.id,bench.setting,bench.observed)+'<div id="sl-model-result" role="status">'+(bench.observed?'<strong>Observed: '+esc(m.predictions[result])+'</strong><p>'+(bench.prediction===result?'Your prediction matched.':'The result was different. That gives us a clue!')+'</p><p>'+esc(m.record.explanation)+'</p><p>Now change one thing and compare.</p><p class="sl-note-earned">'+(data.notes.includes(bench.id)?'✓ Field note collected. You compared both conditions.':'Compare both conditions to collect a field note.')+'</p>':'<strong>What do you notice?</strong><p>Choose a condition and make a prediction. Then test it.</p>')+'</div><details class="sl-source"><summary>Science source</summary><p>'+esc(m.record.prompt)+'</p><p>'+esc(m.record.explanation)+'</p>'+sourceLink(m.record)+'<small>Question ID: '+esc(m.record.id)+'</small></details><p class="sl-model-note">Simplified model, not a measured experiment. Your five question answers stay in My learning; these guesses are not graded.</p></section></div>'+footer();
  bindCommon();
  $('science-lab').querySelectorAll('[data-sl-condition]').forEach(b=>b.onclick=()=>{bench.setting=Number(b.dataset.slCondition);bench.prediction=null;bench.observed=false;const condition=bench.setting;renderModel();$('science-lab').querySelector('[data-sl-condition="'+condition+'"]').focus({preventScroll:true})});
  $('science-lab').querySelectorAll('[data-sl-predict]').forEach(b=>b.onclick=()=>predict(Number(b.dataset.slPredict)));
  $('sl-observe').onclick=observe;$('sl-model-back').onclick=()=>{bench=null;if(run){if(run.phase==='complete'){renderComplete();return}run.paused=document.hidden;RallyLearning.syncPause(run);renderExperiment();$('sl-prompt').focus({preventScroll:true})}else renderHub()};
 }
 function predict(index){if(!bench||![0,1].includes(index))return;bench.prediction=index;bench.observed=false;renderModel();$('sl-observe').focus({preventScroll:true})}
 function observe(){if(!bench||bench.prediction===null)return;bench.observed=true;bench.checked|=1<<bench.setting;if(bench.checked===3&&!data.notes.includes(bench.id)){data.notes.push(bench.id);save()}renderModel();$('sl-model-result').setAttribute('tabindex','-1');$('sl-model-result').focus({preventScroll:true});if(window.innerWidth<=720)$('sl-model-result').scrollIntoView({block:'nearest',behavior:'instant'})}
 function keydown(e){
  if(!$('science-lab').open||e.repeat||e.ctrlKey||e.metaKey||e.altKey||/^(INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(e.target.tagName)||e.target.isContentEditable)return;
  if(bench){if(/^[12]$/.test(e.key)){e.preventDefault();predict(Number(e.key)-1)}return}
  if(/^[1-4]$/.test(e.key)&&run?.phase==='question'){e.preventDefault();choose(Number(e.key)-1)}
  else if(e.key==='Enter'&&run?.phase==='feedback'&&e.target.tagName!=='BUTTON'){e.preventDefault();next()}
 }
 function init(){
  initialized=true;loadProfile();$('open-science-lab').onclick=open;
  $('science-lab').addEventListener('close',()=>{if(run){run.paused=true;RallyLearning.syncPause(run)}run=null;bench=null;notifyMusic();if(mode==='adventure')renderAdventure();$(openerId)?.focus({preventScroll:true})});
  document.addEventListener('keydown',keydown);document.addEventListener('visibilitychange',()=>{if(run&&!bench){run.paused=document.hidden;RallyLearning.syncPause(run)}});
 }
 // Hand-authored, state-driven equipment. The art is fictional; question records
 // and explanations are never changed to fit a visual effect.
 function equipment(s,n,context,cue='',needsRepair=false){
  if(s.id==='potion')return PotionMixerArt.render(n,context,cue,needsRepair);
  if(s.id==='circuit')return CircuitConstructorArt.render(n,context,cue,needsRepair);
  if(s.id==='creature')return CreatureIncubatorArt.render(n,context,cue,needsRepair);
  if(s.id==='observatory')return StarObservatoryArt.render(n,context,cue,needsRepair);
  if(s.id==='weather')return WeatherMachineArt.render(n,context,cue,needsRepair);
  const id='sl-'+context+'-'+s.id,lit=i=>i<n,light=i=>lit(i)?s.color:'#475b70';let art='';
  const valve=(x,y,i)=>'<g class="sl-valve '+(lit(i)?'is-powered':'')+'" transform="translate('+x+' '+y+')"><circle r="17" fill="'+light(i)+'" stroke="#dfbe86" stroke-width="3"/><path d="M-10 0H10M0-10V10" stroke="#203b4a" stroke-width="3"/>'+(lit(i)?'<circle r="4" fill="#fff8d5"/>':'')+'</g>';
  if(s.id==='weather'){
   art+='<path d="M83 239V106Q83 35 200 35Q317 35 317 106V239Z" fill="url(#'+id+'-glass)" stroke="#dfbf8e" stroke-width="6"/><path d="M83 236H317V274H83Z" fill="url(#'+id+'-metal)"/><path d="M94 215Q160 180 204 213Q248 175 306 213V234H94Z" fill="#6b9b90"/><path d="M94 226Q190 195 306 226V234H94Z" fill="#aac79a"/>';
   art+='<g class="sl-sun" opacity="'+(.2+n*.16)+'"><circle cx="255" cy="94" r="25" fill="#ffe5a0"/><g stroke="#ffe5a0" stroke-width="4"><path d="M255 56V46M255 132V142M217 94H207M293 94H303M228 67 220 59M282 121 290 129M282 67 290 59M228 121 220 129"/></g></g>';
   art+='<g class="sl-cloud" transform="translate('+(n*6)+' 0)"><path d="M117 142Q89 111 122 98Q129 64 160 81Q184 71 192 98Q227 112 198 141Z" fill="'+(n<3?'#879aaf':'#e9f0de')+'" stroke="#b9d9d7" stroke-width="3"/></g>';
   if(n<4)art+='<g class="sl-rain" stroke="#b8e6ef" stroke-width="4" stroke-linecap="round"><path d="M121 156 116 168M148 153 143 165M175 154 170 166M190 174 185 186"/></g>';
   if(n>=4)art+='<path d="M135 206Q200 104 271 206" fill="none" stroke="#e6afba" stroke-width="7"/><path d="M143 207Q200 117 263 207" fill="none" stroke="#f3d28e" stroke-width="6"/><path d="M151 208Q200 131 255 208" fill="none" stroke="#abcfcb" stroke-width="6"/>';
   for(let i=0;i<5;i++)art+=valve(100+i*50,259,i);
  }else{
   art+='<path d="M80 164Q68 50 185 35Q315 29 323 164Z" fill="#20344f" stroke="#aab1cc" stroke-width="5"/><g stroke="#d1b4df" stroke-width="3">';
   const stars=[[121,107],[157,67],[214,83],[258,63],[289,121]];stars.forEach(([x,y],i)=>{if(i&&lit(i))art+='<path class="sl-constellation" d="M'+stars[i-1].join(' ')+' '+x+' '+y+'"/>';art+='<circle cx="'+x+'" cy="'+y+'" r="'+(lit(i)?6:3)+'" fill="'+light(i)+'" stroke="none"/>'});art+='</g>';
   art+='<path d="M195 178 151 276M195 178 240 276M195 178V281" stroke="#bfa581" stroke-width="8" stroke-linecap="round"/><g class="sl-telescope" transform="rotate('+(-15-n*5)+' 195 177)"><path d="M112 153H269V198H112Z" fill="url(#'+id+'-metal)" stroke="#f0d5a7" stroke-width="3"/><path d="M259 144H283V208H259Z" fill="#577788" stroke="#cdb890" stroke-width="4"/><ellipse cx="283" cy="176" rx="10" ry="31" fill="'+(n===5?'#bcecf3':'#547a99')+'" stroke="#e3d0aa" stroke-width="3"/><path d="M103 161H128V191H103Z" fill="#526f7e" stroke="#d9bc91" stroke-width="4"/></g>';
   for(let i=0;i<5;i++)art+='<circle cx="'+(150+i*24)+'" cy="294" r="6" fill="'+light(i)+'" stroke="#dcbf8f"/>';
  }
  let mishap='';
  if(s.id==='potion')mishap='<path d="M200 225Q172 202 150 220Q164 247 200 233Q236 247 250 220Q228 202 200 225Z" fill="#42455b" stroke="#f9e5c3" stroke-width="2"/>';
  if(s.id==='weather')mishap=[[128,154],[161,173],[190,151]].map(([x,y])=>'<g class="sl-teacup" transform="translate('+x+' '+y+')" fill="#f5d8bf" stroke="#a3809c" stroke-width="2"><path d="M-9 0H9L6 15H-6ZM9 3Q22 2 18 11L7 12"/><path d="M-12 19H12" stroke="#f5d8bf"/></g>').join('');
  if(s.id==='observatory')mishap='<g transform="rotate(-20 212 103)"><path d="M163 108Q166 87 192 95Q198 72 219 81L236 108Q256 119 240 129H165Q153 122 163 108Z" fill="#bf93ae" stroke="#f1d4b3" stroke-width="3"/><path d="M162 125H242M191 99 207 110" stroke="#fff0cf" stroke-width="4"/><circle cx="214" cy="98" r="5" fill="#c6e2d0"/></g>';
  return '<svg class="sl-equipment sl-machine-'+s.id+'" viewBox="0 0 400 320" role="img" aria-label="'+s.name+': '+n+' of 5 magical repairs"><defs><linearGradient id="'+id+'-metal" x2="1" y2="1"><stop stop-color="#f1d0a0"/><stop offset=".4" stop-color="#ba8b61"/><stop offset="1" stop-color="#68565a"/></linearGradient><linearGradient id="'+id+'-glass" x2="0" y2="1"><stop stop-color="#6291ac" stop-opacity=".4"/><stop offset="1" stop-color="#bfd8ca" stop-opacity=".18"/></linearGradient></defs><ellipse cx="200" cy="297" rx="135" ry="12" fill="#0c2533" opacity=".35"/>'+art+'<g class="sl-mishap-art sl-mishap-'+s.id+'">'+mishap+'</g></svg>';
 }
 return{init,open,close,loadProfile,validate,inventoryMarkup,pool,pickDeck,eligible,choose,next,save,musicState,ready:()=>initialized};
})();

