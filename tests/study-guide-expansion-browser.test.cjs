'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.join(__dirname,'..');
(async()=>{
 const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}
  fs.readFile(file,(error,data)=>{if(error){res.writeHead(404).end();return}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(data)});
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  for(const file of ['index.html','Ellery_Recall_Rally_Librarian_v4.html']){
   const context=await browser.newContext({viewport:{width:1024,height:768},reducedMotion:'reduce'});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:'+server.address().port+'/'+file,{waitUntil:'load'});
   await context.setOffline(true);
   assert(await page.locator('#runtime-status').isVisible());
   assert.equal(await page.evaluate(()=>SAMPLES.length),2350);
   for(const batch of ['first','second','third','fourth'])for(const subject of ['math','science','social','language','arts']){
    const info=await page.evaluate(({subject,batch})=>{
     goHome();mode='written';$('clock').value='0';$('seating').value='solo';$('sound-setting').value='off';
     const q=(batch==='first'?STUDY_GUIDE_ADDITIONS:batch==='second'?STUDY_GUIDE_ROUND_TWO:batch==='third'?STUDY_GUIDE_ROUND_THREE:STUDY_GUIDE_ROUND_FOUR).find(q=>q.subject===subject);
     const before=RallyLearning.snapshot().attempts.length;startRound([q]);
     return {id:q.id,prompt:q.prompt,source:q.sourceDocument,explanation:q.explanation,before};
    },{subject,batch});
    assert((await page.locator('#question-text').innerText()).includes(info.prompt));
    await page.evaluate(()=>choose(game.choices.indexOf(current().answer)));
    assert.equal(await page.evaluate(()=>game.scores[0]),1);
    const feedback=await page.locator('#feedback').innerText();
    assert(feedback.includes(info.explanation));assert(feedback.includes(info.source));assert(feedback.includes('PDF page'));
    const last=await page.evaluate(()=>RallyLearning.snapshot().attempts.at(-1));
    assert.equal(last.questionId,info.id);assert.equal(last.outcome,'correct');
   }
   // Fourth-batch text aliases, numeric units, and punctuation-dependent choices.
   for(const [id,answer] of [['guide-round-four-2026-arts-033','Monet'],['guide-round-four-2026-science-001','7 g/cm3']]){
    await page.evaluate(id=>{goHome();mode='quick';$('clock').value='0';$('reveal').value='full';$('seating').value='solo';startRound([STUDY_GUIDE_ROUND_FOUR.find(q=>q.id===id)]);buzz(0,'Tester')},id);
    await page.locator('#typed-answer').fill(answer);await page.locator('.answer-form button').click();assert.equal(await page.evaluate(()=>game.scores[0]),1,'fourth-batch typed answer: '+id);
   }
   await page.evaluate(()=>{goHome();mode='written';startRound([STUDY_GUIDE_ROUND_FOUR.find(q=>q.id==='guide-round-four-2026-language-031')]);choose(game.choices.indexOf(current().answer))});
   assert.equal(await page.evaluate(()=>game.scores[0]),1,'fourth-batch punctuation choice grades correctly');
   // New-batch aliases and a written-only record use the real grading paths.
   await page.evaluate(()=>{goHome();mode='quick';$('clock').value='0';$('reveal').value='full';$('seating').value='solo';startRound([STUDY_GUIDE_ROUND_THREE.find(q=>q.id==='guide-round-three-2026-science-038')]);buzz(0,'Tester')});
   await page.locator('#typed-answer').fill('Kepler');await page.locator('.answer-form button').click();
   assert.equal(await page.evaluate(()=>game.scores[0]),1,'round-three short-answer alias is accepted');
   await page.evaluate(()=>{goHome();mode='written';startRound([STUDY_GUIDE_ROUND_THREE.find(q=>q.curriculumTopicId==='math-07')]);choose(game.choices.indexOf(current().answer))});
   assert.equal(await page.evaluate(()=>game.scores[0]),1,'round-three written-only coordinate problem grades');
   // Exercise short-answer grading for a new record and wrong-choice rejection.
   await page.evaluate(()=>{goHome();mode='quick';$('clock').value='0';$('reveal').value='full';$('seating').value='solo';startRound([STUDY_GUIDE_ROUND_TWO.find(q=>q.id==='guide-round-two-2026-science-040')]);buzz(0,'Tester')});
   await page.locator('#typed-answer').fill('Ochoa');await page.locator('.answer-form button').click();
   assert.equal(await page.evaluate(()=>game.scores[0]),1,'new short-answer alias is accepted');
   await page.evaluate(()=>{goHome();mode='written';startRound([STUDY_GUIDE_ADDITIONS[0]]);choose(game.choices.findIndex(a=>a!==current().answer))});
   assert.equal(await page.evaluate(()=>game.scores[0]),0,'incorrect choice cannot score');
   assert(await page.locator('.feedback.miss').isVisible());
   assert.deepEqual(errors,[],'offline game has no JavaScript errors');
   await context.close();
  }
  console.log('PASS offline browser play in both HTML editions: new questions from all five subjects, choices, typed alias, explanations, PDF citations, journal recording and wrong-answer rejection');
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
})().catch(e=>{console.error(e);process.exitCode=1});
