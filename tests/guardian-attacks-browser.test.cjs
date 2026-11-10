'use strict';
// Exercise actual rendered attacks, including busy frames and replay, for every guardian.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.join(__dirname,'..'),folder=process.env.GUARDIAN_RECORDINGS;
(async()=>{let server,browser;try{
 server=http.createServer((q,r)=>fs.readFile(path.join(root,q.url==='/'?'Ellery_Recall_Rally_Librarian_v4.html':q.url.split('?')[0]),(e,b)=>{r.writeHead(e?404:200);r.end(b)}));await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});const errors=[];
 for(const [device,width,height] of [['desktop',1366,768],['tablet-landscape',1024,768],['tablet-portrait',820,1180],['phone',390,844]].filter(v=>!process.env.GUARDIAN_VIEWPORT||v[0]===process.env.GUARDIAN_VIEWPORT)){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'no-preference',...(folder?{recordVideo:{dir:path.join(folder,'raw'),size:{width,height}}}:{})});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('#quest-home-new').click();await page.locator('#creator-hero-name').fill('Attack Explorer');await page.locator('#hero-done').click();await page.locator('#quest-speed').selectOption('0');await page.evaluate(()=>{questProgress=10;questKeys=Array.from({length:10},(_,i)=>i);questCompleted=[...questKeys];setSoundPreference(false)});
  for(let land=0;land<10;land++){
   for(const outcome of ['hit','block','counter','guard']){
    // Pick a real turn in the guardian's announced pattern; do not fabricate attack state.
    await page.evaluate(({land,outcome})=>{startDuel(land);duel.assistanceSeal=null;duel.index=GUARDIAN_PATTERNS[land].indexOf(outcome==='guard'?'shield':'strike');openQuestQuestion();if(outcome==='block')duel.wardThrough=duel.index;if(outcome==='counter')selectDuelSpell('ward')},{land,outcome});
    await page.locator('.spell-scene').scrollIntoViewIfNeeded();
    const log=await page.evaluate(async outcome=>{
     const frames=[],phases=new Set(),scoresBefore=[...duel.scores];
     chooseQuest(duel.choices.findIndex(x=>(x===duel.deck[duel.index].answer)===(outcome==='counter')));
     // Simulate the long frame that used to skip the 65–160ms cast window.
     const busy=performance.now();while(performance.now()-busy<220){}
     const start=performance.now();while(performance.now()-start<1000){await new Promise(requestAnimationFrame);const info=GuardianMotion.inspect(),p=document.querySelector('.guardian-projectile'),core=p.querySelector('.projectile-core'),m=core.getCTM(),point=new DOMPoint(0,0).matrixTransform(m).matrixTransform(document.querySelector('.arena-combatants').getCTM().inverse());phases.add(info.state);frames.push({opacity:+getComputedStyle(p).opacity*+getComputedStyle(core).opacity,x:point.x,y:point.y,arm:info.values.arm0});}
     return{phases:[...phases],frames,outcome:duel.tacticOutcome,scores:[...duel.scores],scoresBefore};
    },outcome);
    assert.equal(log.outcome,outcome);assert.equal(log.scores[outcome==='counter'?0:1],1);
    if(outcome==='guard'){assert(!log.phases.includes('casting'),'Shield turn stays defensive');assert(log.frames.every(f=>f.opacity===0),'Shield turn launches no projectile');}
    else{assert(log.phases.includes('casting')&&log.phases.includes('follow-through'),device+'/'+land+'/'+outcome+' renders release and recovery');const visible=log.frames.filter(f=>f.opacity>.15);assert(visible.length>=3,'Visible spell over multiple frames');assert(Math.max(...visible.map(f=>f.x))-Math.min(...visible.map(f=>f.x))>150,device+'/'+land+'/'+outcome+' spell travels in arena coordinates');assert(new Set(log.frames.map(f=>f.arm.toFixed(1))).size>8,'Articulated casting motion');}
    if(outcome==='hit'){
     // Replay while the original effect is still active must restart the joints, not reuse elapsed time.
     const replay=await page.evaluate(()=>{const scores=[...duel.scores];replaySpell();return{state:GuardianMotion.inspect().state,scores:[...duel.scores],before:scores}});assert.equal(replay.state,'anticipation');assert.deepEqual(replay.scores,replay.before);
     if(folder){await page.waitForTimeout(350);await page.screenshot({path:path.join(folder,device+'-guardian-'+land+'-attack.jpg'),type:'jpeg',quality:85,fullPage:true});}
    }
   }
   await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(land=>{startDuel(land);duel.index=GUARDIAN_PATTERNS[land].indexOf('strike');openQuestQuestion();chooseQuest(duel.choices.findIndex(x=>x!==duel.deck[duel.index].answer))},land);assert.equal(await page.evaluate(()=>GuardianMotion.inspect().state),'casting');assert.equal(await page.evaluate(()=>GuardianMotion.inspect().scheduled),false);await page.emulateMedia({reducedMotion:'no-preference'});
   console.log('PASS '+device+' guardian '+land+': strike, block, Ward counter, shield, busy frame, replay, reduced motion');
  }
  await page.evaluate(()=>leaveDuel());assert.equal(await page.evaluate(()=>GuardianMotion.inspect().scheduled),false);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));await page.close();if(folder)await page.video().saveAs(path.join(folder,device+'-attacks.webm'));await context.close();
 }
 assert.deepEqual(errors,[]);
}finally{await browser?.close();if(server)await new Promise(r=>server.close(r))}})().catch(e=>{console.error(e);process.exitCode=1});
