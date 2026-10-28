// Embedded in the main HTML. Uses the existing bank, journal, hero and save APIs.
const ScienceLab=(()=>{
 'use strict';
 const ID='science-lab',COUNT=5;
 const STATIONS=[
  {id:'potion',name:'Potion Mixer',badge:'Prismatic Potion',color:'#79ddba',topics:['science-01','science-12'],keywords:/material|chemistry|properties|scientific tool|inquiry/i,goal:'Activate five ingredient dispensers.',win:'The Moonbubble Potion is ready!',mishap:'A completely imaginary bubble has given the kettle a magnificent moustache.',repair:'Apply the explanation to steady the dispenser.'},
  {id:'circuit',name:'Circuit Constructor',badge:'Bright Circuit',color:'#f5cb79',topics:['science-02','science-03'],keywords:/electric|magnet|circuit|energy|motion|light|heat/i,goal:'Connect five glowing components.',win:'The enchanted circuit is humming!',mishap:'The enchanted bell has developed a very squeaky hiccup.',repair:'Apply the explanation to reconnect this component.'},
  {id:'creature',name:'Creature Incubator',badge:'Gentle Creature',color:'#d4b6ff',topics:['science-07','science-08','science-09','science-10','science-11'],keywords:/organism|plant|animal|cell|life cycle|body|health/i,goal:'Stabilize five chamber controls.',win:'Meet a make-believe Moonwing!',mishap:'Our make-believe Moonwing sneezed a shower of harmless confetti.',repair:'Apply the explanation to stabilize the chamber.'},
  {id:'weather',name:'Weather Machine',badge:'Weather Keeper',color:'#91d6f2',topics:['science-04','science-05'],keywords:/weather|climate|atmosphere|water cycle|earth|rock|soil|mineral|fossil/i,goal:'Repair five weather controls.',win:'The tiny magical sky is balanced!',mishap:'A tiny imaginary cloud is raining teacups. Fizzwick has brought an umbrella.',repair:'Apply the explanation to repair the next weather control.'},
  {id:'observatory',name:'Star Observatory',badge:'Starlight Explorer',color:'#e8bcf2',topics:['science-06'],keywords:/solar|planet|astronom|space|sun|moon|star|orbit/i,goal:'Align five telescope markers.',win:'Fizzwick’s fictional Teapot constellation shines!',mishap:'The telescope has located Fizzwick’s left slipper instead of the sky.',repair:'Apply the explanation to realign the telescope.'}
 ];
 let bench=null,approach='explore';
 let initialized=false,data=empty(),run=null,storageMessage='',invalidSave=false,notice='';
 const stationById=id=>STATIONS.find(s=>s.id===id);
 function empty(){return{version:1,completed:[],seen:{},records:{},includeCustom:false}}
 function validate(value){
  if(!value||value.version!==1||!Array.isArray(value.completed)||value.completed.length>5||new Set(value.completed).size!==value.completed.length||value.completed.some(id=>!stationById(id))||typeof value.includeCustom!=='boolean')throw Error('Invalid Science Lab progress.');
  if(!value.seen||typeof value.seen!=='object'||Array.isArray(value.seen)||Object.keys(value.seen).length>1500||!value.records||typeof value.records!=='object'||Array.isArray(value.records))throw Error('Invalid Science Lab history.');
  const seen={},records={};for(const [id,at] of Object.entries(value.seen)){if(!/^[a-zA-Z0-9-]{1,120}$/.test(id)||!Number.isSafeInteger(at)||at<0)throw Error('Invalid science question exposure.');seen[id]=at}
  for(const [id,r] of Object.entries(value.records)){
   if(!stationById(id)||!r||!Number.isSafeInteger(r.runs)||r.runs<1||!Number.isInteger(r.bestCorrect)||r.bestCorrect<0||r.bestCorrect>COUNT||!Number.isInteger(r.lastCorrect)||r.lastCorrect<0||r.lastCorrect>r.bestCorrect||typeof r.completedAt!=='string'||!Number.isFinite(Date.parse(r.completedAt)))throw Error('Invalid laboratory discovery record.');
   records[id]={runs:r.runs,bestCorrect:r.bestCorrect,lastCorrect:r.lastCorrect,completedAt:r.completedAt};
  }
  if(value.completed.some(id=>!records[id])||Object.keys(records).some(id=>!value.completed.includes(id)))throw Error('The laboratory badges disagree with the station records.');
  return{version:1,completed:STATIONS.filter(s=>value.completed.includes(s.id)).map(s=>s.id),seen,records,includeCustom:value.includeCustom};
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
  if(!initialized)return;
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
 function bindCommon(){
  $('sl-close').onclick=close;if($('sl-open-model'))$('sl-open-model').onclick=()=>openModel(run.station.id);$('sl-sound').onclick=()=>{setSoundPreference(!soundOn);$('sl-sound').textContent='Sound '+(soundOn?'on':'off');$('sl-sound').setAttribute('aria-pressed',String(soundOn))};refreshSaveNote();
 }
 function renderHub(){
  const earned=data.completed.length,custom=sourceQuestions('custom').filter(eligible).length;
  $('science-lab').innerHTML=header('Five experiments. One wonderfully wonky laboratory.')+'<div class="sl-body sl-hub"><section class="sl-mission"><div class="sl-hub-professor">'+professor()+'</div><div><span class="sl-eyebrow">A MESSAGE FROM PROFESSOR FIZZWICK</span><h3>“A little help, my brilliant apprentice?”</h3><p>Pick a station. Try its science model, then answer five questions. Read each explanation to fix a step and keep a badge.</p></div><div class="sl-hub-hero">'+heroArt()+'<span>'+esc(heroName)+'</span></div></section>'+
   '<p class="sl-route">1 · Choose a station <span>→</span> 2 · Predict &amp; observe (optional) <span>→</span> 3 · Answer five questions <span>→</span> 4 · Keep your badge</p><div class="sl-room" style="background-image:url('+SCIENCE_LAB_ART.room+')"><div class="sl-room-sign">FIZZ • WICK • WORKSHOP<span>Choose any station to investigate</span></div><div class="sl-stations">'+STATIONS.map(s=>'<button class="sl-station '+(data.completed.includes(s.id)?'is-discovered':'')+'" data-sl-station="'+s.id+'" style="--station-color:'+s.color+'" aria-label="'+s.name+(data.completed.includes(s.id)?', discovery badge earned, replay experiment':', start a five-question experiment')+'">'+equipment(s,data.completed.includes(s.id)?5:0,'hub')+'<strong>'+s.name+'</strong><span>'+(data.completed.includes(s.id)?'✓ '+s.badge:'5 questions · explore →')+'</span></button>').join('')+'</div></div>'+
   '<section class="sl-discovery-shelf" aria-label="Laboratory discoveries"><span class="sl-prism-token">'+prismIcon()+'</span><div><strong>'+(earned===5?'The Alchemist’s Prism is yours!':earned+' / 5 discovery badges')+'</strong><p>'+(earned===5?'Your artifact is displayed on the adventure map. It is cosmetic and never answers or skips questions.':'Finish all five stations to earn The Alchemist’s Prism. Mistakes never remove badges or Rigby’s seals.')+'</p></div><div class="sl-badges">'+STATIONS.map(s=>'<span class="sl-badge '+(data.completed.includes(s.id)?'earned':'')+'" title="'+s.badge+'" aria-label="'+s.badge+': '+(data.completed.includes(s.id)?'earned':'not yet earned')+'">'+(data.completed.includes(s.id)?'✓':'◇')+'</span>').join('')+'</div></section>'+
   '<div class="sl-hub-tools"><label>Question trail <select id="sl-approach"><option value="explore" '+(approach==='explore'?'selected':'')+'>Explore · build confidence</option><option value="review" '+(approach==='review'?'selected':'')+'>Review · revisit missed ideas</option><option value="stretch" '+(approach==='stretch'?'selected':'')+'>Stretch · try harder questions</option></select></label>'+(custom?'<label><input type="checkbox" id="sl-custom" '+(data.includeCustom?'checked':'')+'> Include my science study pack ('+custom+')</label>':'<span>Uses Recall Rally’s built-in science bank.</span>')+'<span>Unfinished experiments restart; completed badges are kept.</span><button class="sl-quiet" id="sl-export">Export lab backup</button><label class="sl-import">Import lab backup<input id="sl-import" type="file" accept="application/json,.json"></label>'+(invalidSave?'<button class="sl-quiet" id="sl-repair-save">Replace damaged lab save</button>':'')+'</div><p id="sl-notice" role="status">'+esc(notice)+'</p></div>'+footer();
  bindCommon();$('science-lab').querySelectorAll('[data-sl-station]').forEach(b=>b.onclick=()=>start(b.dataset.slStation));
  if($('sl-custom'))$('sl-custom').onchange=()=>{data.includeCustom=$('sl-custom').checked;save()};
  $('sl-export').onclick=()=>downloadJSON({format:'recall-rally-science-lab',version:1,data:validate(data)},'Recall_Rally_Science_Lab.json');
  $('sl-import').onchange=importBackup;$('sl-approach').onchange=()=>{approach=$('sl-approach').value;notice=approach==='review'?'Missed ideas come first, when this station has them. No timer.':approach==='stretch'?'Harder unseen questions come first. You can change trails any time.':'Start with familiar science ideas. Each explanation helps you learn.';$('sl-notice').textContent=notice};
  if($('sl-repair-save'))$('sl-repair-save').onclick=()=>{if(window.confirm('Replace this damaged lab save with the discoveries from this visit? Rigby’s adventure and learning history will be kept.')){invalidSave=false;save();renderHub()}};
 }
 function start(id){
  const station=stationById(id),selection=pickDeck(id);if(!station||selection.deck.length<COUNT){notice='Five different science questions are needed. Add eligible science questions or try the built-in pool.';renderHub();return}
  run={station,approach,wasCompleted:data.completed.includes(id),deck:selection.deck,index:0,phase:'question',steps:0,correctCount:0,selected:null,choices:[],correct:null,profileId:RallyLearning.activeProfile().id,fallback:selection.fallback,paused:false};present();
 }
 function present(){
  const q=run.deck[run.index];run.phase='question';run.selected=null;run.correct=null;run.choices=shuffle(q.options);
  noteSeen(q);RallyLearning.present(run,q,'science-lab');renderExperiment();$('sl-prompt').focus({preventScroll:true});
 }
 function choose(index){
  if(bench||!run||run.phase!=='question'||run.paused||run.profileId!==RallyLearning.activeProfile().id||!Number.isInteger(index)||index<0||index>3)return;
  const q=run.deck[run.index];run.phase='feedback';run.selected=index;run.correct=run.choices[index]===q.answer;
  if(run.correct){run.correctCount++;run.steps++}
  RallyLearning.record(run,q,run.correct?'correct':'incorrect','choice',true);
  tone(run.correct?'correct':'miss');renderExperiment();$('sl-next').focus({preventScroll:true});
 }
 function next(){
  if(bench||!run||run.phase!=='feedback')return;
  // Applying the existing explanation repairs a mishap, never changes its grade.
  if(!run.correct)run.steps++;
  if(run.index===COUNT-1){finishExperiment();return}
  run.index++;present();
 }
 function finishExperiment(){
  if(!run||run.phase!=='feedback'||run.index!==COUNT-1)return;
  run.phase='complete';const id=run.station.id,old=data.records[id];
  if(!data.completed.includes(id))data.completed.push(id);
  data.records[id]={runs:(old?.runs||0)+1,bestCorrect:Math.max(old?.bestCorrect||0,run.correctCount),lastCorrect:run.correctCount,completedAt:new Date().toISOString()};save();renderComplete();
 }
 function machinePanel(){
  const s=run.station,mishap=run.phase==='feedback'&&!run.correct;
  return '<aside class="sl-experiment '+(mishap?'sl-mishap':run.correct?'sl-success':'is-thinking')+'" aria-label="Interactive '+s.name+'"><div class="sl-experiment-heading"><span>'+esc(s.goal)+'</span><strong>'+(run.phase==='feedback'?run.index+1:run.phase==='complete'?5:run.index)+' answered · '+run.steps+' / 5 repaired</strong></div><button class="sl-quiet sl-model-link" id="sl-open-model">Try a science model: predict → observe</button><div class="sl-stage" style="background-image:url('+SCIENCE_LAB_ART.room+');--station-color:'+s.color+'" data-sl-progress="'+run.steps+'" data-sl-machine="'+s.id+'">'+equipment(s,run.steps,'experiment')+'<div class="sl-hero">'+heroArt(run.correct?'cast':'idle')+'</div><div class="sl-professor">'+professor(mishap?'mishap':'calm')+'</div><div class="sl-poof" aria-hidden="true">✦ · ✧</div></div><div class="sl-fizzwick-line"><strong>Professor Fizzwick</strong><p>'+esc(mishap?s.mishap:run.correct?'“Brilliant thinking! Another piece of our experiment is working.”':'“Take your time. A discovery begins with a question.”')+'</p></div><div class="sl-step-track" aria-label="'+run.steps+' of 5 experiment steps repaired">'+Array.from({length:COUNT},(_,i)=>{const repair=i===run.index&&mishap,state=i<run.steps?'repaired':repair?'needs-repair':i===run.index?'current':'waiting';return '<span class="'+state+'" data-sl-step="'+state+'" aria-label="Step '+(i+1)+': '+(repair?'needs repair':state)+'">'+(i<run.steps?'✓':repair?'↺':i+1)+'</span>'}).join('')+'</div></aside>';
 }
 function renderExperiment(){
  const q=run.deck[run.index],s=run.station,answered=run.phase==='feedback',topic=CURRICULUM_TOPICS.find(t=>t.id===q.curriculumTopicId)?.title||q.topic||'Science practice';
  $('science-lab').innerHTML=header(s.name+' · Question '+(run.index+1)+' of '+COUNT)+'<div class="sl-body sl-workspace"><section class="sl-question" data-question-id="'+esc(q.id)+'" aria-label="Science question and answers"><div class="sl-question-meta"><span>SCIENCE · '+(run.index+1)+' / 5</span><button class="sl-quiet" id="sl-hub">Laboratory hub</button></div><h3 id="sl-prompt" tabindex="-1">'+esc(q.prompt)+'</h3><div class="sl-answers">'+run.choices.map((answer,i)=>'<button class="sl-answer '+(answered&&answer===q.answer?'sl-correct':answered&&i===run.selected?'sl-incorrect':'')+'" data-sl-choice="'+i+'" '+(answered?'disabled':'')+'><kbd>'+(i+1)+'</kbd><span>'+esc(answer)+(answered&&answer===q.answer?'<small>✓ Correct answer</small>':answered&&i===run.selected?'<small>Your answer</small>':'')+'</span></button>').join('')+'</div>'+
   (answered?'<section class="sl-feedback '+(run.correct?'is-correct':'is-mishap')+'" role="status"><strong>'+(run.correct?'✓ It worked! One step fixed.':'↺ A clue to investigate. Read, then repair.')+'</strong><p class="sl-right-answer">Correct answer: '+esc(q.answer)+'</p><p class="sl-explanation">'+esc(q.explanation)+'</p>'+(!run.correct?'<p class="sl-repair-copy">'+esc(s.repair)+'</p>':'')+'<details class="sl-source"><summary>Question source &amp; topic</summary><p>'+esc(topic)+'</p>'+(!q.guide?'<p>'+esc(q.source||'Recall Rally built-in practice')+'</p>':'')+sourceLink(q)+'<small>Question ID: '+esc(q.id)+'</small></details></section><button class="sl-next" id="sl-next">'+(run.correct?(run.index===COUNT-1?'Finish experiment & earn badge →':'Next experiment step →'):(run.index===COUNT-1?'Apply the explanation & finish →':'Apply the explanation & continue →'))+'</button>':'<p class="sl-question-tip">Choose an answer, or press 1–4. No timer. Mistakes are a chance to learn.</p>')+
   (run.fallback?'<p class="sl-fallback">Science topics are mixed here to provide five different questions.</p>':'')+'</section>'+machinePanel()+'</div>'+footer();
  bindCommon();$('sl-hub').onclick=()=>{run=null;renderHub()};$('science-lab').querySelectorAll('[data-sl-choice]').forEach(b=>b.onclick=()=>choose(Number(b.dataset.slChoice)));if($('sl-next'))$('sl-next').onclick=next;
 }
 function renderComplete(){
  const s=run.station,all=data.completed.length===5;
  $('science-lab').innerHTML=header(s.name+' · Experiment complete')+'<div class="sl-body sl-complete"><section><div class="sl-award">'+prismIcon()+'</div><span class="sl-eyebrow">DISCOVERY BADGE EARNED</span><h3>'+s.badge+'</h3><p>'+esc(s.win)+'</p><p>'+run.correctCount+' / 5 correct on your first try; '+(COUNT-run.correctCount)+' learned with repairs.</p><p>Every answer helps. Your first answers stay in My learning.</p>'+(all?'<div class="sl-artifact"><strong>The Alchemist’s Prism</strong><p>All five discoveries complete! Your new cosmetic artifact is waiting in your adventure inventory.</p></div>':'<p>'+data.completed.length+' of 5 badges earned. Explore another station to keep discovering.</p>')+(STATIONS.find(x=>!data.completed.includes(x.id))?'<button class="sl-next" id="sl-next-station">Next discovery: '+esc(STATIONS.find(x=>!data.completed.includes(x.id)).name)+' →</button>':'')+'<button class="sl-next" id="sl-back-hub">Back to Fizzwick’s laboratory →</button></section>'+machinePanel()+'</div>'+footer();
  bindCommon();if($('sl-next-station'))$('sl-next-station').onclick=()=>start(STATIONS.find(x=>!data.completed.includes(x.id)).id);$('sl-back-hub').onclick=()=>{run=null;renderHub()};$('sl-back-hub').focus({preventScroll:true});
 }
 async function importBackup(event){
  const input=event.target,file=input.files?.[0],profileId=RallyLearning.activeProfile().id;if(!file)return;
  try{if(file.size>250000)throw Error('Choose a lab backup smaller than 250 KB.');const value=JSON.parse(await file.text());if(value.format!=='recall-rally-science-lab'||value.version!==1)throw Error('Choose a Science Lab backup.');const incoming=validate(value.data);
   if(RallyLearning.activeProfile().id!==profileId)throw Error('The player changed. Choose the backup again.');
   if(!window.confirm('Import these lab discoveries for '+RallyLearning.activeProfile().name+'? Existing lab badges will be replaced. Rigby’s adventure and learning records will be kept.'))return;
   const result=QuestSaves.saveSideQuest(ID,incoming,validate);if(!result.ok)throw Error(result.error);data=incoming;invalidSave=false;storageMessage='✓ Laboratory discoveries saved on this device';notice='Lab backup imported.';renderHub();
  }catch(e){notice='Lab import did not finish: '+e.message;const el=$('sl-notice');if(el)el.textContent=notice}finally{input.value=''}
 }
 function openModel(id){
  if(!ScienceLabModels.get(id))return;
  if(run&&run.phase==='question'){run.paused=true;RallyLearning.syncPause(run)}
  bench={id,setting:0,prediction:null,observed:false,checked:0};renderModel();
 }
 function renderModel(){
  const m=ScienceLabModels.get(bench.id),result=bench.observed?ScienceLabModels.outcome(bench.id,bench.setting):null;
  $('science-lab').innerHTML=header('Predict → change one thing → observe → compare')+'<div class="sl-body sl-model"><section><span class="sl-eyebrow">OPTIONAL SCIENCE MODEL · NO GRADE</span><h3>'+esc(m.title)+'</h3><p>'+esc(m.scope)+'</p><fieldset><legend>'+esc(m.control)+'</legend>'+m.settings.map((text,i)=>'<button class="sl-quiet" data-sl-condition="'+i+'" aria-pressed="'+(bench.setting===i)+'">'+esc(text)+'</button>').join('')+'</fieldset><fieldset><legend>'+esc(m.ask)+'</legend>'+m.predictions.map((text,i)=>'<button class="sl-quiet" data-sl-predict="'+i+'" aria-pressed="'+(bench.prediction===i)+'">'+(i+1)+' · '+esc(text)+'</button>').join('')+'</fieldset><button class="sl-next" id="sl-observe" '+(bench.prediction===null?'disabled':'')+'>Test this condition</button><button class="sl-quiet" id="sl-model-back">Back to my experiment</button></section><section class="sl-model-observation">'+ScienceLabModels.diagram(bench.id,bench.setting,bench.observed)+'<div id="sl-model-result" role="status">'+(bench.observed?'<strong>Observed: '+esc(m.predictions[result])+'</strong><p>'+(bench.prediction===result?'Your prediction matched.':'The result was different. That gives us a clue!')+'</p><p>'+esc(m.record.explanation)+'</p><p>Now change one thing and compare.</p>':'<strong>What do you notice?</strong><p>Choose a condition and make a prediction. Then test it.</p>')+'</div><details class="sl-source"><summary>Science source</summary><p>'+esc(m.record.prompt)+'</p><p>'+esc(m.record.explanation)+'</p>'+sourceLink(m.record)+'<small>Question ID: '+esc(m.record.id)+'</small></details><p class="sl-model-note">Simplified model, not a measured experiment. Your five question answers stay in My learning; these guesses are not graded.</p></section></div>'+footer();
  bindCommon();
  $('science-lab').querySelectorAll('[data-sl-condition]').forEach(b=>b.onclick=()=>{bench.setting=Number(b.dataset.slCondition);bench.prediction=null;bench.observed=false;renderModel()});
  $('science-lab').querySelectorAll('[data-sl-predict]').forEach(b=>b.onclick=()=>predict(Number(b.dataset.slPredict)));
  $('sl-observe').onclick=observe;$('sl-model-back').onclick=()=>{bench=null;if(run&&!bench){run.paused=document.hidden;RallyLearning.syncPause(run);renderExperiment();$('sl-prompt').focus({preventScroll:true})}else renderHub()};
 }
 function predict(index){if(!bench||![0,1].includes(index))return;bench.prediction=index;bench.observed=false;renderModel();$('sl-observe').focus({preventScroll:true})}
 function observe(){if(!bench||bench.prediction===null)return;bench.observed=true;bench.checked|=1<<bench.setting;renderModel();$('sl-model-result').setAttribute('tabindex','-1');$('sl-model-result').focus({preventScroll:true})}
 function keydown(e){
  if(!$('science-lab').open||e.repeat||e.ctrlKey||e.metaKey||e.altKey||/^(INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(e.target.tagName)||e.target.isContentEditable)return;
  if(bench){if(/^[12]$/.test(e.key)){e.preventDefault();predict(Number(e.key)-1)}return}
  if(/^[1-4]$/.test(e.key)&&run?.phase==='question'){e.preventDefault();choose(Number(e.key)-1)}
  else if(e.key==='Enter'&&run?.phase==='feedback'&&e.target.tagName!=='BUTTON'){e.preventDefault();next()}
 }
 function init(){
  initialized=true;loadProfile();$('open-science-lab').onclick=open;
  $('science-lab').addEventListener('close',()=>{if(run){run.paused=true;RallyLearning.syncPause(run)}run=null;bench=null;if(mode==='adventure')renderAdventure()});
  document.addEventListener('keydown',keydown);document.addEventListener('visibilitychange',()=>{if(run&&!bench){run.paused=document.hidden;RallyLearning.syncPause(run)}});
 }
 // Hand-authored, state-driven equipment. The art is fictional; question records
 // and explanations are never changed to fit a visual effect.
 function equipment(s,n,context){
  const id='sl-'+context+'-'+s.id,lit=i=>i<n,light=i=>lit(i)?s.color:'#475b70';let art='';
  const valve=(x,y,i)=>'<g class="sl-valve '+(lit(i)?'is-powered':'')+'" transform="translate('+x+' '+y+')"><circle r="17" fill="'+light(i)+'" stroke="#dfbe86" stroke-width="3"/><path d="M-10 0H10M0-10V10" stroke="#203b4a" stroke-width="3"/>'+(lit(i)?'<circle r="4" fill="#fff8d5"/>':'')+'</g>';
  if(s.id==='potion'){
   const colors=['#a6d9ed','#bcb0ef','#f1c692','#8cdbb6','#e7aed0'];
   art+='<path d="M69 53H331V88H69Z" fill="url(#'+id+'-metal)" stroke="#edce9f" stroke-width="3"/>';
   for(let i=0;i<5;i++)art+='<g class="sl-dispenser '+(lit(i)?'is-powered':'')+'"><path d="M'+(86+i*48)+' 35h26v55h-26Z" fill="'+(lit(i)?colors[i]:'#49677c')+'" stroke="#e0c194" stroke-width="2"/><path d="M'+(99+i*48)+' 90v47" stroke="#d2ba94" stroke-width="6"/>'+(lit(i)?'<path class="sl-ingredient" d="M'+(99+i*48)+' 119v32" stroke="'+colors[i]+'" stroke-width="5" stroke-dasharray="7 8"/>':'')+'</g>';
   art+='<path d="M138 131Q118 170 105 204Q95 259 200 265Q305 259 295 204Q282 170 262 131Z" fill="#b5e7dc" fill-opacity=".23" stroke="#c3e7df" stroke-width="5"/><path d="M112 216Q200 194 288 216Q295 255 200 257Q105 255 112 216Z" fill="'+colors[Math.max(0,n-1)]+'" opacity="'+(.35+n*.12)+'"/><ellipse cx="200" cy="216" rx="87" ry="14" fill="'+colors[Math.max(0,n-1)]+'"/><path d="M133 132H267" stroke="#f0d3a0" stroke-width="12" stroke-linecap="round"/>';
   for(let i=0;i<n*2;i++)art+='<circle class="sl-bubble" cx="'+(145+i*37%116)+'" cy="'+(207-i*13%52)+'" r="'+(3+i%3*2)+'" fill="#fff8df" opacity=".6" style="animation-delay:-'+i*.3+'s"/>';
   art+='<path d="M117 275H283L275 289H125Z" fill="url(#'+id+'-metal)"/>';
  }else if(s.id==='circuit'){
   art+='<rect x="66" y="44" width="268" height="226" rx="21" fill="#294e55" stroke="#c9a778" stroke-width="7"/><path d="M90 64H310V248H90Z" fill="none" stroke="#658b7a" stroke-width="2"/><path d="M111 119V87H288V214H111V168" fill="none" stroke="#577d6e" stroke-width="10"/><path d="M92 132H131V166H92Z" fill="#d6b77f"/><path d="M101 141H122M111 134V151" stroke="#2a4653" stroke-width="3"/>';
   const paths=['M111 119V87H163','M163 87H230','M230 87H288V133','M288 133V214H226','M226 214H111V168'];
   paths.forEach((p,i)=>{art+='<path d="'+p+'" class="sl-wire '+(lit(i)?'is-powered':'')+'" fill="none" stroke="'+light(i)+'" stroke-width="7" stroke-linecap="round"/>'});
   [[163,87],[230,87],[288,133],[226,214],[111,168]].forEach(([x,y],i)=>art+=valve(x,y,i));
   art+='<path d="M178 129Q200 106 222 129Q237 149 213 171V187H187V171Q163 149 178 129Z" fill="'+(n===5?'#ffe7a0':'#80a7ab')+'" stroke="#ecd4a3" stroke-width="3"/><path d="M187 193H213M190 199H210" stroke="#e5bb77" stroke-width="4"/>';
   if(n===5)art+='<g class="sl-rays" stroke="#ffedb3" stroke-width="3"><path d="M200 108V98M172 120 163 112M229 119 238 111M161 146H150M240 146H251"/></g>';
  }else if(s.id==='creature'){
   art+='<path d="M111 252V97Q111 40 200 35Q289 40 289 97V252Z" fill="#9ac9d6" fill-opacity=".19" stroke="#ddc99f" stroke-width="6"/><path d="M125 241V98Q125 54 200 50Q275 54 275 98V241Z" fill="#a5d5d4" opacity=".13"/><path d="M88 251H312L300 279H100Z" fill="url(#'+id+'-metal)"/>';
   if(n<3)art+='<path class="sl-egg" d="M151 204Q144 161 181 129Q200 110 219 129Q256 161 249 204Q246 237 200 239Q154 237 151 204Z" fill="#d8cae4" stroke="#f3e4bb" stroke-width="3"/><path d="m160 169 26 12 16-17 21 18 22-12" fill="none" stroke="#9e90c0" stroke-width="4"/>';
   else art+='<g class="sl-creature '+(n===5?'is-awake':'')+'"><path d="M189 173Q133 107 128 171Q123 224 187 206M211 173Q267 107 272 171Q277 224 213 206" fill="'+(n===5?'#bfafea':'#8ca9b1')+'" stroke="#edcfaf" stroke-width="3"/><path d="M142 155 180 189M259 155 220 189" fill="none" stroke="#e4ddf1" stroke-width="3"/><ellipse cx="200" cy="197" rx="23" ry="42" fill="#d5dcbb"/><circle cx="200" cy="158" r="25" fill="#e5e8c8"/><path d="M190 139 183 120M210 139 217 120" stroke="#e4c89a" stroke-width="4" stroke-linecap="round"/><circle cx="190" cy="155" r="4" fill="#35465d"/><circle cx="211" cy="155" r="4" fill="#35465d"/><path d="M194 168Q200 173 207 168" fill="none" stroke="#35465d" stroke-width="2"/></g>';
   for(let i=0;i<5;i++)art+=valve(100+i*50,272,i);
   art+='<path d="M134 96V207" stroke="#e9f5df" stroke-opacity=".45" stroke-width="5" stroke-linecap="round"/>';
  }else if(s.id==='weather'){
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
  if(s.id==='circuit')mishap='<g fill="#f7dfb2" stroke="#bf90c4" stroke-width="2"><path d="M251 134V101L273 96V126M251 108 273 103"/><ellipse cx="245" cy="136" rx="7" ry="5"/><ellipse cx="267" cy="128" rx="7" ry="5"/><path d="m146 147-14 8 14 6-14 9" fill="none" stroke-width="4"/></g>';
  if(s.id==='creature')mishap=Array.from({length:12},(_,i)=>'<path d="M'+(120+i*41%166)+' '+(61+i*29%89)+'l7-3 3 7-7 3Z" fill="'+['#f1c490','#d6b0ee','#88dbbe'][i%3]+'"/>').join('');
  if(s.id==='weather')mishap=[[128,154],[161,173],[190,151]].map(([x,y])=>'<g class="sl-teacup" transform="translate('+x+' '+y+')" fill="#f5d8bf" stroke="#a3809c" stroke-width="2"><path d="M-9 0H9L6 15H-6ZM9 3Q22 2 18 11L7 12"/><path d="M-12 19H12" stroke="#f5d8bf"/></g>').join('');
  if(s.id==='observatory')mishap='<g transform="rotate(-20 212 103)"><path d="M163 108Q166 87 192 95Q198 72 219 81L236 108Q256 119 240 129H165Q153 122 163 108Z" fill="#bf93ae" stroke="#f1d4b3" stroke-width="3"/><path d="M162 125H242M191 99 207 110" stroke="#fff0cf" stroke-width="4"/><circle cx="214" cy="98" r="5" fill="#c6e2d0"/></g>';
  return '<svg class="sl-equipment sl-machine-'+s.id+'" viewBox="0 0 400 320" role="img" aria-label="'+s.name+': '+n+' of 5 magical repairs"><defs><linearGradient id="'+id+'-metal" x2="1" y2="1"><stop stop-color="#f1d0a0"/><stop offset=".4" stop-color="#ba8b61"/><stop offset="1" stop-color="#68565a"/></linearGradient><linearGradient id="'+id+'-glass" x2="0" y2="1"><stop stop-color="#6291ac" stop-opacity=".4"/><stop offset="1" stop-color="#bfd8ca" stop-opacity=".18"/></linearGradient></defs><ellipse cx="200" cy="297" rx="135" ry="12" fill="#0c2533" opacity=".35"/>'+art+'<g class="sl-mishap-art sl-mishap-'+s.id+'">'+mishap+'</g></svg>';
 }
 return{init,open,close,loadProfile,validate,inventoryMarkup,pool,pickDeck,eligible,choose,next,save,ready:()=>initialized};
})();
