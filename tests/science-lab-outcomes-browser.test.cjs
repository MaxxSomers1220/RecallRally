'use strict';
// Real bank questions, grading, local saves and player profiles in the full app.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.join(__dirname,'..'),stations=['potion','circuit','creature','weather','observatory'],screens=process.env.SCIENCE_LAB_SCREENSHOTS;
let browser,server,page;const errors=[];
const save=()=>page.evaluate(()=>{const raw=localStorage.getItem('recall-rally-sidequest-science-lab-v1:'+RallyLearning.activeProfile().id);return raw?JSON.parse(raw).data:null});
const journal=()=>page.evaluate(()=>RallyLearning.snapshot().attempts.filter(a=>a.mode==='science-lab'));
const main=()=>page.evaluate(()=>({progress:questProgress,keys:[...questKeys],completed:[...questCompleted],location:questLocation,stats:{...questRunStats},hero:heroName,look:{...avatarLook},style:heroStyle}));
async function experiment(id,correctCount){
 const before=(await journal()).length,prior=await save(),earnedBefore=prior?.completed||[];
 await page.locator('[data-sl-station="'+id+'"]').click();
 const ids=[];
 for(let i=0;i<5;i++){
  const qid=await page.locator('.sl-question').getAttribute('data-question-id'),q=await page.evaluate(id=>[...SAMPLES,...customPack].find(q=>q.id===id),qid),choices=await page.locator('[data-sl-choice]>span').allTextContents(),right=i<correctCount;
  assert(q,'question exists in shared bank');assert.equal(q.subject,'science');assert.equal(await page.locator('#sl-prompt').textContent(),q.prompt);assert.deepEqual([...choices].sort(),[...q.options].sort());ids.push(qid);
  const index=choices.findIndex(choice=>right?choice===q.answer:choice!==q.answer);assert(index>=0);
  // Number keys exercise the same answer controls used by mouse/touch.
  await page.keyboard.press(String(index+1));
  assert.equal(await page.locator('.sl-explanation').textContent(),q.explanation,'original science explanation is retained');
  assert.equal(await page.locator('.sl-complete').count(),0,'fifth answer is reviewed before final outcome');
  const actualCorrect=Math.min(i+1,correctCount);assert.match(await page.locator('.sl-question-meta').innerText(),new RegExp('Question '+(i+1)+' of 5.*'+actualCorrect+' correct.*Goal: 3'));
  if(i===4)assert(Number(await page.locator('.sl-stage').getAttribute('data-sl-progress'))<5,'final machine waits for the fifth explanation');
  const attempts=await journal();assert.equal(attempts.length,before+i+1);assert.equal(attempts.at(-1).questionId,qid);assert.equal(attempts.at(-1).outcome,right?'correct':'incorrect');
  if(i===4){const intermediate=await save();assert.deepEqual(intermediate?.completed||[],earnedBefore,'final feedback cannot award a badge early');assert(await page.locator('#sl-next').isVisible());}
  await page.locator('#sl-next').click();
 }
 assert.equal(new Set(ids).size,5,'no repeated question within one experiment');
 const outcome=correctCount>=3?'success':'failure';
 await page.locator('.sl-complete[data-sl-outcome="'+outcome+'"]').waitFor({state:'visible'});
 assert.match(await page.locator('.sl-complete').innerText(),new RegExp(correctCount+'\\s*[/]\\s*5'));
 const current=await save();assert(current,'result is saved');
 if(correctCount>=3){assert(current.completed.includes(id),'3 or more correct earns station badge');assert.equal(current.records[id].lastCorrect,correctCount);assert(current.records[id].bestCorrect>=correctCount)}
 else {assert.deepEqual(current.completed,earnedBefore,'failure cannot award or remove badges');assert(await page.locator('#sl-retry').isVisible(),'failed experiment offers Try Again');assert.match(await page.locator('#sl-retry').innerText(),/try again/i)}
 assert.equal((await journal()).length,before+5,'exactly five honest academic attempts');
 if(screens)await page.screenshot({path:path.join(screens,id+'-'+outcome+'-'+correctCount+'.png'),fullPage:true});
 await page.locator('#sl-back-hub').click();
 return current;
}
(async()=>{try{
 server=http.createServer((req,res)=>{const relative=req.url==='/'?'index.html':req.url.split('?')[0],file=path.join(root,relative);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return}res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'application/octet-stream');res.end(data)})});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port+'/';
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 page=await browser.newPage({viewport:{width:1366,height:768},reducedMotion:'reduce'});page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url,{waitUntil:'domcontentloaded'});const originalMain=await main(),firstProfile=await page.evaluate(()=>RallyLearning.activeProfile().id);await page.locator('#open-science-lab').click();
 assert.match(await page.locator('.sl-hub').innerText(),/3\s*(?:of|\/)\s*5/i,'goal visible before choosing station');
 if(screens)fs.mkdirSync(screens,{recursive:true});
 for(const id of stations){
  await experiment(id,2);await experiment(id,3);await experiment(id,5);
  assert.deepEqual(await main(),originalMain,'station outcomes preserve main quest and selected hero');
  console.log('PASS '+id+': 2/5 fails without new badge, 3/5 and 5/5 succeed; five original explanations and journal outcomes; unchanged adventure/hero');
 }
 let earned=await save();assert.deepEqual(new Set(earned.completed),new Set(stations));assert.equal((await journal()).length,75);
 assert.match(await page.locator('.sl-discovery-shelf').innerText(),/Prism is yours/);
 // Visit the earned Prism from the notebook, then verify a failed replay cannot
 // revoke or replay its award. The artifact remains cosmetic in the main quest.
 await page.locator('#sl-notebook').click();await page.locator('#sl-light-prism').click();assert(await page.locator('.sl-finale').isVisible());assert.equal(await page.locator('.sl-finale-badges li').count(),5);await page.locator('#sl-finale-hub').click();
 const prismBefore=await save();assert.equal(prismBefore.prismLit,true);await experiment('potion',2);earned=await save();assert.deepEqual(earned.completed,prismBefore.completed);assert.equal(earned.prismLit,true);assert.equal(earned.records.potion.bestCorrect,5);assert.equal((await journal()).length,80);
 assert.match(await page.locator('.sl-discovery-shelf').innerText(),/Prism is yours/);
 console.log('PASS all five badges unlock the Prism; 2/5 replay keeps prior badges, best score, lit Prism and all journal attempts');
 await page.reload({waitUntil:'domcontentloaded'});await page.locator('#open-science-lab').click();assert.deepEqual((await save()).completed,earned.completed);assert.equal((await save()).prismLit,true);assert.equal((await journal()).length,80);assert.deepEqual(await main(),originalMain);
 console.log('PASS reload restores successes, Prism, honest journal and unchanged main adventure');
 await page.locator('#sl-close').click();await page.locator('#open-learning').click();await page.locator('#learning-add-player').click();await page.locator('#learning-new-name').fill('Outcome Partner');await page.locator('#learning-new-player button[type="submit"]').click();await page.locator('#learning-dialog [data-close]').click();
 const secondProfile=await page.evaluate(()=>RallyLearning.activeProfile().id);assert.notEqual(secondProfile,firstProfile);await page.locator('#open-science-lab').click();assert.equal(await save(),null);assert.equal((await journal()).length,0);await experiment('creature',2);assert.deepEqual((await save()).completed,[]);assert.equal((await save()).prismLit,false);assert.equal((await journal()).length,5);await page.locator('#sl-close').click();
 await page.locator('#open-learning').click();await page.locator('#learning-profile').selectOption(firstProfile);await page.locator('#learning-dialog [data-close]').click();await page.locator('#open-science-lab').click();assert.deepEqual((await save()).completed,earned.completed);assert.equal((await save()).prismLit,true);assert.equal((await journal()).length,80);assert.deepEqual(await main(),originalMain);
 assert.deepEqual(errors,[],'no browser script errors');console.log('PASS stable profile IDs isolate failed experiments, successes, journal, badges and Prism; no browser script errors');
}finally{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r))}})().catch(e=>{console.error(e);process.exitCode=1});
