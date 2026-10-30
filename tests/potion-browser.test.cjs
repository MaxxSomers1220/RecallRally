'use strict';
// Real station, actual question-bank records and controls in both shipped builds.
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.join(__dirname,'..'),screens=process.env.POTION_SCREENSHOTS;
let browser,server;
(async()=>{try{
 server=http.createServer((req,res)=>{const file=path.join(root,req.url==='/'?'index.html':req.url.split('?')[0]);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(data)})});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 if(screens)fs.mkdirSync(screens,{recursive:true});const errors=[];
 for(const [name,width,height] of [['desktop',1366,768],['tablet-landscape',1024,768],['tablet-portrait',820,1180],['phone',390,844]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'no-preference',hasTouch:name!=='desktop'});page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(name+': '+e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{soundOn=false;avatarLook=normalizePantherLook({...avatarLook,skin:'deep',hairStyle:'locs',outfit:'scholar',outfitColor:'forest'});savePantherPreferences()});
  const before=await page.evaluate(()=>({hero:JSON.stringify(avatarLook),progress:questProgress,keys:JSON.stringify(questKeys),profile:RallyLearning.activeProfile().id}));
  await page.locator('#open-science-lab').click();await page.locator('[data-sl-station="potion"]').click();
  const art=page.locator('.sl-stage .pm-machine'),body=page.locator('#science-lab .sl-body'),records=()=>page.evaluate(()=>RallyLearning.snapshot().attempts.filter(a=>a.mode==='science-lab'));
  const capture=async label=>{if(!screens)return;await body.evaluate(e=>e.scrollTop=0);await page.screenshot({path:path.join(screens,name+'-'+label+'.png')});};
  assert.equal(await art.getAttribute('data-potion-level'),'0');assert.equal(await art.locator('.pm-dispenser.is-powered').count(),0);assert.equal(await art.locator('.pm-bubble').count(),0);
  assert.equal(await page.locator('.sl-professor .pm-fizzwick').count(),1);assert.equal(await page.locator('.sl-stage .sl-hero-art').getAttribute('data-hero-skin'),'deep');
  const ids=[];await capture('initial');
  for(let i=0;i<5;i++){
   const id=await page.locator('.sl-question').getAttribute('data-question-id');ids.push(id);
   const q=await page.evaluate(id=>SAMPLES.find(q=>q.id===id),id);assert(q);assert.equal(await page.locator('#sl-prompt').innerText(),q.prompt);
   assert.deepEqual((await page.locator('[data-sl-choice]>span').allTextContents()).sort(),[...q.options].sort());
   const wrong=i===2,options=await page.locator('[data-sl-choice]>span').allTextContents(),index=options.findIndex(a=>wrong?a!==q.answer:a===q.answer);
   const count=(await records()).length;
   if(name==='phone')await page.locator('[data-sl-choice="'+index+'"]').tap();else await page.keyboard.press(String(index+1));
   await page.evaluate(index=>ScienceLab.choose(index),index);assert.equal((await records()).length,count+1,'duplicate input never grades twice');
   assert.equal((await records()).at(-1).outcome,wrong?'incorrect':'correct');assert.equal(await page.locator('.sl-explanation').innerText(),q.explanation);
   assert.equal(await art.getAttribute('data-potion-level'),String(wrong?i:i+1));
   assert.equal(await art.getAttribute('data-potion-cue'),wrong?'mishap':i===4?'finale':'activate');
   assert.equal(await page.locator('.sl-professor .pm-fizzwick').evaluate(e=>e.classList.contains('is-surprised')),wrong);
   if(wrong){assert(await page.locator('.sl-step-track .needs-repair').count());await page.waitForTimeout(350);await capture('mistake');}
   else if(i===0){assert.equal(await art.locator('[data-flow="1"]').count(),1);assert.equal(await art.locator('.pm-transfer').evaluate(e=>getComputedStyle(e).animationName),'pm-transfer');await page.waitForTimeout(650);await capture('first-ingredient');}
   else if(i===1){await page.waitForTimeout(1250);await capture('two-ingredients');}
   else if(i===3){assert.equal(await art.locator('.pm-drive.is-running').count(),1);assert(await art.locator('.pm-bubble').count());const cog=art.locator('.pm-cog').first(),a=await cog.evaluate(e=>getComputedStyle(e).transform);await page.waitForTimeout(220);assert.notEqual(await cog.evaluate(e=>getComputedStyle(e).transform),a,'mixing drive actually moves');await capture('machinery');}
   else if(i===4){assert(await art.locator('.pm-finale').count());assert(await page.locator('.sl-professor .is-celebrate').count());await page.waitForTimeout(700);await capture('fifth-answer');}
   if(width>=1000){
    const boxes=await page.locator('#sl-prompt,[data-sl-choice],#sl-next,.sl-feedback,.sl-stage').evaluateAll(es=>es.map(e=>{const b=e.getBoundingClientRect();return {top:b.top,bottom:b.bottom,left:b.left,right:b.right}}));
    assert(boxes.every(b=>b.top>=0&&b.bottom<=height+1&&b.left>=0&&b.right<=width+1),'Question, choices, explanation, Next and machine fit laptop/tablet viewport');
   }
   await page.locator('#sl-next').click();
   if(wrong){assert.equal(await art.getAttribute('data-potion-level'),'3');assert.equal(await art.getAttribute('data-potion-cue'),'repair');assert.equal((await records()).length,count+1,'repair creates no new academic attempt');assert(await art.locator('.pm-swirl').count());await page.waitForTimeout(850);await capture('repair');}
  }
  assert.equal(new Set(ids).size,5);assert.equal((await records()).length,5);assert.equal((await records()).filter(a=>a.outcome==='correct').length,4);
  assert(await page.locator('.sl-complete').isVisible());assert.equal(await art.getAttribute('data-potion-level'),'5');assert.match(await page.locator('.sl-complete').innerText(),/4 \/ 5 correct/);await capture('complete');
  assert(await page.locator('.sl-stage .sl-hero-art').getAttribute('data-hero-outfit').then(v=>v==='scholar'));
  assert.equal(await page.locator('#science-lab .sl-body').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true,'no horizontal overflow');
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await art.locator('.pm-cog').first().evaluate(e=>getComputedStyle(e).animationName),'none');assert.equal(await art.locator('.pm-bubble').first().evaluate(e=>getComputedStyle(e).animationName),'none');assert.equal(await art.getAttribute('data-potion-level'),'5');
  await page.locator('#sl-close').click();
  assert.deepEqual(await page.evaluate(()=>({hero:JSON.stringify(avatarLook),progress:questProgress,keys:JSON.stringify(questKeys),profile:RallyLearning.activeProfile().id})),before);
  const stored=await page.evaluate(()=>QuestSaves.readSideQuest('science-lab',ScienceLab.validate).data);assert(stored.completed.includes('potion'));assert.equal(stored.records.potion.lastCorrect,4);
  // Same origin + complete offline package: badges, history and hero carry over.
  await page.goto('http://127.0.0.1:'+server.address().port+'/Ellery_Recall_Rally_Librarian_v4.html',{waitUntil:'domcontentloaded'});
  await page.context().setOffline(true);
  await page.locator('#open-science-lab').click();assert(await page.locator('[data-sl-station="potion"].is-discovered').count());await page.locator('[data-sl-station="potion"]').click();assert.equal(await art.getAttribute('data-potion-level'),'0');assert.equal((await records()).length,5);
  if(name==='desktop'){
   for(let i=0;i<5;i++){
    const qid=await page.locator('.sl-question').getAttribute('data-question-id'),q=await page.evaluate(id=>SAMPLES.find(q=>q.id===id),qid),choices=await page.locator('[data-sl-choice]>span').allTextContents();
    const k=choices.findIndex(a=>i===4?a!==q.answer:a===q.answer);await page.keyboard.press(String(k+1));
    if(i===4){assert.equal(await art.getAttribute('data-potion-level'),'4');assert.equal(await art.locator('.pm-finale').count(),0);}
    await page.locator('#sl-next').click();
   }
   assert.equal(await art.getAttribute('data-potion-level'),'5');assert.match(await page.locator('.sl-complete').innerText(),/4 \/ 5 correct/);assert.equal((await records()).length,10);
   await capture('final-repair-offline');
  }
  await page.locator('#sl-close').click();await page.locator('#open-science-lab').click();await page.locator('[data-sl-station="circuit"]').click();assert.equal(await page.locator('.pm-machine').count(),0,'other equipment still uses its original renderer');await page.locator('#sl-close').click();
  console.log('PASS '+name+': real five-question experiment, distinct activations, actual animation, mistake/repair with honest grades, final potion, customized hero, offline replay and reduced motion');await page.close();
 }
 assert.deepEqual(errors,[],'no page errors');
}finally{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r))}})().catch(e=>{console.error(e);process.exitCode=1});
