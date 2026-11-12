'use strict';
// Real bank and real controls, including all first-answer grades and offline repair.
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.join(__dirname,'..'),screens=process.env.CIRCUIT_SCREENSHOTS;let browser,server;
(async()=>{try{
 server=http.createServer((req,res)=>{const file=path.join(root,req.url==='/'?'index.html':req.url.split('?')[0]);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(data)})});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});if(screens)fs.mkdirSync(screens,{recursive:true});const errors=[];
 for(const [name,width,height] of [['desktop',1366,768],['tablet-landscape',1024,768],['tablet-portrait',820,1180],['phone',390,844]]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:name!=='desktop',reducedMotion:'no-preference'});page.on('pageerror',e=>errors.push(name+': '+e.message));page.setDefaultTimeout(12000);
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{soundOn=false;avatarLook=normalizePantherLook({...avatarLook,skin:'deep',hairStyle:'locs',outfit:'scholar',outfitColor:'forest'});savePantherPreferences()});
  const before=await page.evaluate(()=>({hero:JSON.stringify(avatarLook),progress:questProgress,keys:JSON.stringify(questKeys),profile:RallyLearning.activeProfile().id}));
  await page.locator('#open-science-lab').click();await page.locator('[data-sl-station="circuit"]').click();
  const art=page.locator('.sl-stage .cc-machine'),body=page.locator('#science-lab .sl-body'),records=()=>page.evaluate(()=>RallyLearning.snapshot().attempts.filter(a=>a.mode==='science-lab'));
  const capture=async label=>{if(screens){await body.evaluate(e=>e.scrollTop=0);await page.screenshot({path:path.join(screens,name+'-'+label+'.png')})}};
  const state=async n=>{assert.equal(await art.getAttribute('data-circuit-level'),String(n));assert.equal(await art.getAttribute('data-circuit-closed'),String(n===5));assert.equal(await art.locator('.cc-current').count()>0,n===5);assert.equal(await art.locator('.cc-filament.is-lit').count(),n===5?1:0);assert.equal(await art.locator('.cc-needle').evaluate(e=>e.style.getPropertyValue('--cc-needle')),n===5?'25deg':'-90deg')};
  await state(0);await capture('initial');assert.equal(await page.locator('.sl-stage .sl-hero-art').getAttribute('data-hero-skin'),'deep');
  const ids=[];
  for(let i=0;i<5;i++){
   const id=await page.locator('.sl-question').getAttribute('data-question-id');ids.push(id);const q=await page.evaluate(id=>SAMPLES.find(q=>q.id===id),id);assert(q);assert.equal(await page.locator('#sl-prompt').innerText(),q.prompt);assert.deepEqual((await page.locator('[data-sl-choice]>span').allTextContents()).sort(),[...q.options].sort());
   const wrong=i===2,options=await page.locator('[data-sl-choice]>span').allTextContents(),k=options.findIndex(a=>wrong?a!==q.answer:a===q.answer),count=(await records()).length;
   if(name==='phone')await page.locator('[data-sl-choice="'+k+'"]').tap();else await page.keyboard.press(String(k+1));
   await page.evaluate(k=>ScienceLab.choose(k),k);assert.equal((await records()).length,count+1);assert.equal((await records()).at(-1).outcome,wrong?'incorrect':'correct');assert.equal(await page.locator('.sl-explanation').innerText(),q.explanation);
   await state(Math.min(wrong?i:i+1,4));assert.equal(await art.getAttribute('data-circuit-cue'),wrong?'mishap':'activate');
   if(wrong){assert.equal(await art.locator('[data-circuit-repair="3"]').count(),1);assert.equal(await page.locator('.sl-step-track .needs-repair').count(),1);assert.equal(await art.locator('.cc-bell').evaluate(e=>getComputedStyle(e).animationName),'cc-hiccup');}
   await page.waitForTimeout(i===4?1500:450);await capture(wrong?'mistake':'step-'+(i+1));
   if(i===4){assert.equal(await art.locator('.cc-current').count(),0,'complete circuit waits for the experiment result');}
   if(width>=1000){const boxes=await page.locator('#sl-prompt,[data-sl-choice],#sl-next,.sl-feedback,.sl-stage,.cc-next-action').evaluateAll(es=>es.map(e=>{const b=e.getBoundingClientRect();return {top:b.top,bottom:b.bottom,left:b.left,right:b.right}}));assert(boxes.every(b=>b.top>=0&&b.bottom<=height+1&&b.left>=0&&b.right<=width+1),'question, choices, feedback, machine, objective and Next fit');}
   if(name==='phone'){await page.locator('#sl-next').scrollIntoViewIfNeeded();const b=await page.locator('#sl-next').boundingBox();assert(b.height>=44&&b.y>=0&&b.y+b.height<=height);if(wrong&&screens)await page.screenshot({path:path.join(screens,'phone-mistake-controls.png')});}
   await page.locator('#sl-next').click();if(wrong){await state(3);assert.equal(await art.getAttribute('data-circuit-cue'),'repair');assert.equal((await records()).length,count+1);await page.waitForTimeout(950);await capture('repair');}
  }
  assert.equal(new Set(ids).size,5);assert.equal((await records()).length,5);assert.equal((await records()).filter(a=>a.outcome==='correct').length,4);assert.match(await page.locator('.sl-complete').innerText(),/4 \/ 5 correct/);await state(5);assert.equal(await page.locator('.sl-complete').getAttribute('data-sl-outcome'),'success');await capture('complete');assert.equal(await art.locator('.cc-current').first().evaluate(e=>getComputedStyle(e).animationName),'cc-current');const flow=art.locator('.cc-current').first(),flowSamples=await flow.evaluate(e=>{const a=e.getAnimations()[0];const assertionState=a.playState,prior=a.currentTime;a.pause();a.currentTime=1000;const first=getComputedStyle(e).strokeDashoffset;a.currentTime=1300;const second=getComputedStyle(e).strokeDashoffset;a.currentTime=prior;a.play();return {first,second,playing:assertionState}});assert.equal(flowSamples.playing,'running');assert.notEqual(flowSamples.first,flowSamples.second,'current actually animates after success');
  assert(await body.evaluate(e=>e.scrollWidth<=e.clientWidth+1));assert.equal(await page.locator('.sl-stage .sl-hero-art').getAttribute('data-hero-outfit'),'scholar');
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await art.locator('.cc-current').first().evaluate(e=>getComputedStyle(e).animationName),'none');await state(5);
  // Model remains accurate and returns to the completed machine.
  await page.locator('#sl-open-model').click();for(const c of [0,1]){await page.locator('[data-sl-condition="'+c+'"]').click();await page.keyboard.press(String(c+1));await page.locator('#sl-observe').click();assert.match(await page.locator('#sl-model-result').innerText(),c?/Lamp on/:/Lamp off/)}await page.locator('#sl-model-back').click();await state(5);
  await page.locator('#sl-close').click();assert.deepEqual(await page.evaluate(()=>({hero:JSON.stringify(avatarLook),progress:questProgress,keys:JSON.stringify(questKeys),profile:RallyLearning.activeProfile().id})),before);
  const saved=await page.evaluate(()=>QuestSaves.readSideQuest('science-lab',ScienceLab.validate).data);assert(saved.completed.includes('circuit'));assert(saved.notes.includes('circuit'));assert.equal(saved.records.circuit.lastCorrect,4);
  // A genuinely disconnected standalone replay, including a final-step error.
  await page.goto('http://127.0.0.1:'+server.address().port+'/Ellery_Recall_Rally_Librarian_v4.html',{waitUntil:'domcontentloaded'});await page.context().setOffline(true);await page.locator('#open-science-lab').click();assert.equal(await page.locator('[data-sl-station="circuit"].is-discovered').count(),1);await page.locator('[data-sl-station="circuit"]').click();await state(0);
  for(let i=0;i<5;i++){
   const id=await page.locator('.sl-question').getAttribute('data-question-id'),q=await page.evaluate(id=>SAMPLES.find(q=>q.id===id),id),opts=await page.locator('[data-sl-choice]>span').allTextContents(),k=opts.findIndex(a=>i===4?a!==q.answer:a===q.answer);
   await page.locator('[data-sl-choice="'+k+'"]').click();if(i===4){await state(4);assert.equal(await art.locator('.cc-finale').count(),0);await capture('final-mistake-offline')}await page.locator('#sl-next').click();
  }
  await state(5);assert.match(await page.locator('.sl-complete').innerText(),/4 \/ 5 correct/);assert.equal((await records()).length,10);await capture('final-repair-offline');
  // One more full run proves every possible mistake stage repairs exactly once.
  await page.locator('#sl-back-hub').click();await page.locator('[data-sl-station="circuit"]').click();
  for(let i=0;i<5;i++){const id=await page.locator('.sl-question').getAttribute('data-question-id'),q=await page.evaluate(id=>SAMPLES.find(q=>q.id===id),id),opts=await page.locator('[data-sl-choice]>span').allTextContents(),k=opts.findIndex(a=>a!==q.answer);await page.locator('[data-sl-choice="'+k+'"]').click();await state(i);assert.equal(await art.locator('[data-circuit-repair="'+(i+1)+'"]').count(),1);await page.locator('#sl-next').click();await state(i===4?0:i+1)}
  assert.equal(await page.locator('.sl-complete').getAttribute('data-sl-outcome'),'failure');assert.match(await page.locator('.sl-complete').innerText(),/0 \/ 5 correct/);assert.equal((await records()).length,15);const stored=await page.evaluate(()=>QuestSaves.readSideQuest('science-lab',ScienceLab.validate).data);assert.equal(stored.records.circuit.bestCorrect,4);assert.equal(stored.records.circuit.lastCorrect,0);
  await page.locator('#sl-close').click();await page.locator('#open-science-lab').click();for(const id of ['potion','creature','weather','observatory']){await page.locator('[data-sl-station="'+id+'"]').click();assert.equal(await page.locator('.cc-machine').count(),0);await page.locator('#sl-hub').click()}await page.locator('#sl-close').click();
  console.log('PASS '+name+': 15 real answers; all five mistakes/repairs; no premature current/light; actual animation; layout/touch/keyboard; model, saves, hero, offline, reduced motion, other stations');await page.close();
 }
 // A clean 5/5 run also works in the disconnected standalone document.
 const offline=await browser.newPage({viewport:{width:1366,height:768},reducedMotion:'reduce'});offline.on('pageerror',e=>errors.push(e.message));
 await offline.goto('http://127.0.0.1:'+server.address().port+'/Ellery_Recall_Rally_Librarian_v4.html');await offline.context().setOffline(true);
 await offline.locator('#open-science-lab').click();await offline.locator('[data-sl-station="circuit"]').click();
 for(let i=0;i<5;i++){const k=await offline.evaluate(()=>{const q=SAMPLES.find(q=>q.id===document.querySelector('.sl-question').dataset.questionId);return [...document.querySelectorAll('[data-sl-choice]>span')].findIndex(e=>e.textContent===q.answer)});await offline.keyboard.press(String(k+1));await offline.locator('#sl-next').click()}
 assert.match(await offline.locator('.sl-complete').innerText(),/5 \/ 5 correct/);assert.equal(await offline.locator('.cc-machine').getAttribute('data-circuit-closed'),'true');assert.equal(await offline.evaluate(()=>RallyLearning.snapshot().attempts.length),5);
 if(screens)await offline.screenshot({path:path.join(screens,'desktop-all-correct-offline.png')});await offline.close();
 console.log('PASS standalone 5/5 run with all networking disabled');
 assert.deepEqual(errors,[]);
}finally{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r))}})().catch(e=>{console.error(e);process.exitCode=1});
