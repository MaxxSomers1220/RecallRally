'use strict';
// Exercise real missed-answer attacks, protection, timeouts, busy frames and replay.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.join(__dirname,'..'),folder=process.env.GUARDIAN_RECORDINGS;
(async()=>{let server,browser;try{
 server=http.createServer((q,r)=>fs.readFile(path.join(root,q.url==='/'?'Ellery_Recall_Rally_Librarian_v4.html':q.url.split('?')[0]),(e,b)=>{r.writeHead(e?404:200);r.end(b)}));await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});if(folder)fs.mkdirSync(folder,{recursive:true});const errors=[];
 for(const [device,width,height] of [['desktop',1366,768],['tablet-landscape',1024,768],['tablet-portrait',820,1180],['phone',390,844]].filter(v=>!process.env.GUARDIAN_VIEWPORT||v[0]===process.env.GUARDIAN_VIEWPORT)){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'no-preference',...(folder?{recordVideo:{dir:path.join(folder,'raw'),size:{width,height}}}:{})});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('#quest-home-new').click();await page.locator('#creator-hero-name').fill('Attack Explorer');await page.locator('#hero-done').click();await page.locator('#quest-speed').selectOption('0');await page.evaluate(()=>{questProgress=10;questKeys=Array.from({length:10},(_,i)=>i);questCompleted=[...questKeys];setSoundPreference(false)});
  for(let land=0;land<10;land++){
   const scenarios=device==='desktop'?['choice','rival'].flatMap(reason=>['none','ward','seal'].map(protection=>({reason,protection}))):[{reason:'choice',protection:'none'}];
   for(const intent of ['strike','shield'])for(const scenario of scenarios){
    // Pick actual turns in this guardian's announced pattern; only protection is supplied.
    await page.evaluate(({land,intent,protection})=>{startDuel(land);duel.assistanceSeal=protection==='seal'?0:null;duel.index=GUARDIAN_PATTERNS[land].indexOf(intent);openQuestQuestion();if(protection==='ward')duel.wardThrough=duel.index;if(protection==='seal'){duel.assistUsed=true;duel.assistWard=true}},{land,intent,...scenario});
    const probe=scenario.reason==='choice';
    const log=await page.evaluate(async ({reason,protection,probe})=>{
     const frames=[],phases=new Set(),before=RallyLearning.snapshot().attempts.length,index=duel.index;
     if(reason==='rival'){duel.speed=8;duel.remaining=8;startQuestClock();await new Promise(r=>setTimeout(r,40));}
     else chooseQuest(duel.choices.findIndex(x=>x!==duel.deck[duel.index].answer));
     const nextDisabled=document.getElementById('quest-next').disabled;
     // Neither a fast Next nor a duplicate settlement can erase/score this attack twice.
     advanceDuel();const stayed=duel.index===index&&duel.phase==='result';
     chooseQuest(0);settleDuel(false,'rival');
     const scored=RallyLearning.snapshot().attempts,attempt=scored.at(-1);
     const scene=document.querySelector('.spell-scene'),castScene=scene.classList.contains('spell-from-guardian'),defending=!!scene.querySelector('.guardian-defending'),stage=scene.querySelector('.spell-stage').getBoundingClientRect(),viewport=window.visualViewport,viewTop=viewport?.offsetTop||0,viewBottom=viewTop+(viewport?.height||innerHeight),stageVisible=stage.top>=viewTop-2&&stage.bottom<=viewBottom+2;
     if(probe){
      // Simulate a long main-thread frame which used to skip the casting window.
      const busy=performance.now();while(performance.now()-busy<220){}
      const start=performance.now();while(performance.now()-start<900){await new Promise(requestAnimationFrame);const info=GuardianMotion.inspect(),p=document.querySelector('.guardian-projectile'),core=p.querySelector('.projectile-core'),m=core.getCTM(),point=new DOMPoint(0,0).matrixTransform(m).matrixTransform(document.querySelector('.arena-combatants').getCTM().inverse());phases.add(info.state);frames.push({opacity:+getComputedStyle(p).opacity*+getComputedStyle(core).opacity,x:point.x,y:point.y,arm:info.values.arm0});}
     }
     let replay=null;if(probe&&protection==='none'){const scores=[...duel.scores];replaySpell();replay={state:GuardianMotion.inspect().state,scores:[...duel.scores],before:scores};}
     return{phases:[...phases],frames,outcome:duel.tacticOutcome,intent:duel.intent,scores:[...duel.scores],nextDisabled,stayed,castScene,defending,stageVisible,stageTop:stage.top,stageBottom:stage.bottom,viewTop,viewBottom,attempts:scored.length-before,attemptOutcome:attempt.outcome,protectedLeft:duel.wardThrough,sealLeft:duel.assistWard,sealBlocked:duel.assistBlocked,replay};
    },{...scenario,probe});
    const label=device+'/'+land+'/'+intent+'/'+scenario.reason+'/'+scenario.protection;
    assert.equal(log.outcome,scenario.protection==='none'?'hit':'block',label+' resolves attack');assert.equal(log.intent,intent);assert.deepEqual(log.scores,[0,1],label+' awards only the guardian answer point');
    assert.equal(log.attempts,1,label+' records one academic attempt');assert.equal(log.attemptOutcome,scenario.reason==='rival'?'timeout':'incorrect');
    assert(log.castScene&&!log.defending,label+' shows guardian attacking rather than defending');assert(log.stageVisible,label+' automatically reveals attack stage: '+JSON.stringify({top:log.stageTop,bottom:log.stageBottom,viewTop:log.viewTop,viewBottom:log.viewBottom}));assert(log.nextDisabled&&log.stayed,label+' cannot skip the attack');
    if(scenario.protection==='ward')assert.equal(log.protectedLeft,-1,label+' consumes prior Ward');if(scenario.protection==='seal')assert(!log.sealLeft&&log.sealBlocked,label+' consumes seal shield');
    if(probe){assert(log.phases.includes('casting')&&log.phases.includes('follow-through'),label+' renders release and recovery');const visible=log.frames.filter(f=>f.opacity>.15);assert(visible.length>=3,label+' spell visible over multiple frames');assert(Math.max(...visible.map(f=>f.x))-Math.min(...visible.map(f=>f.x))>150,label+' spell travels across arena');assert(new Set(log.frames.map(f=>f.arm.toFixed(1))).size>8,label+' articulated casting motion');}
    if(log.replay){assert.equal(log.replay.state,'anticipation',label+' replay restarts joints');assert.deepEqual(log.replay.scores,log.replay.before,label+' replay cannot rescore');if(folder&&intent==='shield'){await page.waitForTimeout(350);await page.screenshot({path:path.join(folder,device+'-guardian-'+land+'-shield-miss-attack.jpg'),type:'jpeg',quality:85,fullPage:true});}}
    await page.evaluate(()=>{duel.speed=0;finishDuelEffects();window.__attackNextEnabled=!document.getElementById('quest-next').disabled;advanceDuel()});
    assert(await page.evaluate(()=>window.__attackNextEnabled&&duel.phase==='open'),label+' Next unlocks after attack');
   }
   // A correctly answered Ward counter keeps its existing guardian release animation.
   if(device==='desktop'){
    const counter=await page.evaluate(land=>{startDuel(land);duel.assistanceSeal=null;duel.index=GUARDIAN_PATTERNS[land].indexOf('strike');openQuestQuestion();selectDuelSpell('ward');chooseQuest(duel.choices.findIndex(x=>x===duel.deck[duel.index].answer));return{outcome:duel.tacticOutcome,scores:[...duel.scores],active:duel.fxActive}},land);
    assert.equal(counter.outcome,'counter');assert.deepEqual(counter.scores,[1,0]);assert(counter.active);
   }
   // Motion reduction preserves an obvious attack pose in either stance, without a loop.
   await page.emulateMedia({reducedMotion:'reduce'});
   for(const intent of ['strike','shield']){
    await page.evaluate(({land,intent})=>{startDuel(land);duel.assistanceSeal=null;duel.index=GUARDIAN_PATTERNS[land].indexOf(intent);openQuestQuestion();chooseQuest(duel.choices.findIndex(x=>x!==duel.deck[duel.index].answer))},{land,intent});
    assert.equal(await page.evaluate(()=>GuardianMotion.inspect().state),'casting');assert.equal(await page.evaluate(()=>GuardianMotion.inspect().scheduled),false);
   }
   await page.emulateMedia({reducedMotion:'no-preference'});
   console.log('PASS '+device+' guardian '+land+': both stances attack on misses, protection/scoring, busy frames, replay, Next gate, reduced motion'+(device==='desktop'?', wrong/timeout × none/Ward/seal':''));
  }
  await page.evaluate(()=>leaveDuel());assert.equal(await page.evaluate(()=>GuardianMotion.inspect().scheduled),false);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));await page.close();if(folder)await page.video().saveAs(path.join(folder,device+'-attacks.webm'));await context.close();
 }
 assert.deepEqual(errors,[]);
}finally{await browser?.close();if(server)await new Promise(r=>server.close(r))}})().catch(e=>{console.error(e);process.exitCode=1});
