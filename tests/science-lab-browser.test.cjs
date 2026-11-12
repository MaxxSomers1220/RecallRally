'use strict';
// Real application, real bank records and real browser storage. No mocked game.
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.join(__dirname,'..'),temp=fs.mkdtempSync(path.join(os.tmpdir(),'fizzwick-browser-'));
let server,context,page,url;const errors=[],screens=process.env.SCIENCE_LAB_SCREENSHOTS;
async function openBrowser(){
 context=await chromium.launchPersistentContext(path.join(temp,'profile'),{executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage'],viewport:{width:1366,height:768},reducedMotion:'reduce',acceptDownloads:true});
 page=await context.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));await page.goto(url,{waitUntil:'domcontentloaded'});assert(await page.locator('#runtime-status').isVisible());
}
const main=()=>page.evaluate(()=>({progress:questProgress,keys:[...questKeys],completed:[...questCompleted],location:questLocation,stats:{...questRunStats},hero:heroName,look:{...avatarLook},style:heroStyle}));
const labSave=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('recall-rally-sidequest-science-lab-v1:'+RallyLearning.activeProfile().id)));
const attempts=()=>page.evaluate(()=>RallyLearning.snapshot().attempts.filter(a=>a.mode==='science-lab'));
async function expectPrismInventory(){
 // dialog.close() queues a close event; the adventure renders in that handler.
 // Wait for the visible result instead of reading the previous map's HTML.
 const reward=page.locator('.sl-map-entrance strong').filter({hasText:'The Alchemist’s Prism'});
 await reward.waitFor({state:'visible'});assert.equal(await reward.innerText(),'The Alchemist’s Prism');
}
async function questionRecord(){const id=await page.locator('.sl-question').getAttribute('data-question-id');return page.evaluate(id=>[...SAMPLES,...customPack].find(q=>q.id===id),id)}
async function answerLab(correct=true){
 const q=await questionRecord(),options=await page.locator('[data-sl-choice]>span').allTextContents();assert.equal(q.subject,'science');
 assert.equal(await page.locator('#sl-prompt').textContent(),q.prompt);assert.deepEqual([...options].sort(),[...q.options].sort());
 const index=options.findIndex(x=>correct?x===q.answer:x!==q.answer);assert(index>=0);
 await page.keyboard.press(String(index+1));await page.keyboard.press(String(index+1)); // second input cannot grade twice
 assert.equal(await page.locator('.sl-explanation').textContent(),q.explanation);assert.match(await page.locator('.sl-right-answer').textContent(),new RegExp(q.answer.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
 await page.locator('.sl-source summary').click();const source=await page.locator('.sl-source').innerText();assert(source.includes(q.id));if(q.source)assert(source.includes(q.source));
 await page.locator('.sl-source summary').click();return q;
}
async function runStation(id,miss=false){
 await page.locator(`[data-sl-station="${id}"]`).click();const ids=[],before=(await attempts()).length;
 for(let n=0;n<5;n++){
  const isCorrect=!(miss&&n===0),q=await answerLab(isCorrect);ids.push(q.id);
  assert.equal(await page.locator('.sl-stage').getAttribute('data-sl-machine'),id);
  assert.equal(Number(await page.locator('.sl-stage').getAttribute('data-sl-progress')),Math.min(isCorrect?n+1:n,4));
  if(!isCorrect){assert(await page.locator('.sl-mishap').count());assert(await page.locator('.sl-fizzwick.is-surprised').count());assert(await page.locator('.sl-stage .sl-mishap-'+id).isVisible());assert.match(await page.locator('#sl-next').textContent(),/Apply the explanation/)}
  const latest=(await attempts()).at(-1);assert.equal(latest.questionId,q.id);assert.equal(latest.outcome,isCorrect?'correct':'incorrect');assert.equal(latest.topicId,q.curriculumTopicId||null);assert.equal(latest.evaluationMethod,'choice');
  await page.locator('#sl-next').click();
 }
 assert.equal(new Set(ids).size,5,'five distinct shared question IDs');assert.equal((await attempts()).length,before+5,'exactly one journal attempt per answer');
 assert(await page.locator('.sl-complete').isVisible());assert.equal(await page.locator('.sl-stage').getAttribute('data-sl-progress'),'5');
 const completed=await labSave();assert(completed.data.completed.includes(id));assert.equal(completed.data.records[id].lastCorrect,miss?4:5);
 if(screens)await page.screenshot({path:path.join(screens,id+'-complete.png')});
 await page.locator('#sl-back-hub').click();return ids;
}
async function switchPlayer(id){await page.locator('#open-learning').click();await page.locator('#learning-profile').selectOption(id);await page.locator('#learning-dialog [data-close]').click()}
(async()=>{
 try{
  if(screens)fs.mkdirSync(screens,{recursive:true});
  server=http.createServer((req,res)=>{const file=path.join(root,req.url==='/'?'index.html':req.url.split('?')[0]);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return}res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'image/svg+xml');res.end(data)})});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));url=`http://127.0.0.1:${server.address().port}/`;await openBrowser();
  // Establish main-quest progress through the existing guardian controls.
  await page.locator('#quest-home-new').click();await page.locator('[data-hero-key="skin"][data-hero-value="deep"]').click();await page.locator('#creator-hero-name').fill('Lab Explorer');await page.locator('#hero-done').click();await page.locator('#quest-speed').selectOption('0');
  for(let land=0;land<3;land++){
   await page.locator('#world-next').click();await page.locator('#quest-begin').click();for(let i=0;i<4;i++){const index=await page.evaluate(()=>duel.choices.indexOf(duel.deck[duel.index].answer));await page.locator(`[data-quest-choice="${index}"]`).click();await page.locator('#quest-next').click()}
   if(await page.locator('#rigby-skip').count())await page.locator('#rigby-skip').click();await page.locator('#quest-return').click();
  }
  const original=await main(),firstProfile=await page.evaluate(()=>RallyLearning.activeProfile().id);assert.equal(original.progress,3);
  await page.locator('#quest-science-lab').click();assert(await page.locator('#science-lab').isVisible());assert.equal(await page.locator('.sl-station').count(),5);
  assert.equal(await page.locator('.sl-hub-hero .sl-hero-art').getAttribute('data-hero-skin'),original.look.skin);assert.equal(await page.locator('.sl-hub-hero>span').innerText(),original.hero);
  if(screens)await page.screenshot({path:path.join(screens,'desktop-hub.png')});
  const firstDeck=await runStation('potion',true);assert.deepEqual(await main(),original,'science experiments cannot mutate the main adventure');
  await page.locator('[data-sl-station="potion"]').click();assert(!firstDeck.includes((await questionRecord()).id),'replay prioritizes unseen questions');await page.locator('#sl-hub').click();
  console.log('PASS Potion Mixer: shared science records, original choices/explanations/sources, harmless mishap, five repairs, badge, honest journal and fresh replay');
  // A browser close/reopen retains a badge but cannot complete an abandoned experiment.
  await page.locator('[data-sl-station="circuit"]').click();await answerLab(true);assert.equal((await labSave()).data.completed.length,1);
  await context.close();await openBrowser();await page.locator('#quest-home-continue').click();assert.deepEqual(await main(),original);
  assert.match(await page.locator('.sl-map-entrance').innerText(),/1 \/ 5 discovery badges/);
  await page.locator('#quest-science-lab').click();assert.equal((await labSave()).data.completed.length,1);assert(await page.locator('[data-sl-station="potion"]').getAttribute('class').then(x=>x.includes('is-discovered')));
  await runStation('circuit',true);await runStation('creature',true);await runStation('weather',true);await runStation('observatory',true);
  assert.equal((await labSave()).data.completed.length,5);assert.match(await page.locator('.sl-discovery-shelf').innerText(),/Prism is yours/);
  assert.deepEqual(await main(),original);await page.locator('#sl-close').click();await expectPrismInventory();assert.deepEqual(await main(),original);
  if(screens)await page.screenshot({path:path.join(screens,'prism-inventory.png'),fullPage:true});
  const journal=await attempts();assert.equal(journal.length,26);assert.equal(journal.filter(a=>a.outcome==='incorrect').length,5);
  // Reopening, Escape, reload and a full browser restart keep the same reward.
  await page.locator('#quest-science-lab').click();assert.equal(await page.locator('.sl-station.is-discovered').count(),5);assert.match(await page.locator('.sl-discovery-shelf').innerText(),/Prism is yours/);
  await page.keyboard.press('Escape');await expectPrismInventory();await page.waitForFunction(()=>document.activeElement.id==='quest-science-lab');
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('#quest-home-continue').click();await expectPrismInventory();assert.deepEqual(await main(),original);assert.deepEqual(await attempts(),journal);
  await context.close();await openBrowser();await page.locator('#quest-home-continue').click();await expectPrismInventory();assert.deepEqual(await main(),original);assert.deepEqual(await attempts(),journal);
  assert.equal((await labSave()).data.completed.length,5);
  console.log('PASS Prism inventory after close, reopen, Escape, reload and browser restart; five badges, journal and main adventure retained');
  console.log('PASS all five machines progress to completion; badges restore, incomplete experiment restarts, Prism enters inventory, Rigby keeps three seals and hero');
  // A normal deployment at the same browser origin retains lab and main saves.
  await page.goto(url+'Ellery_Recall_Rally_Librarian_v4.html',{waitUntil:'domcontentloaded'});assert(await page.locator('#lib-launch').isVisible());await page.locator('#quest-home-continue').click();assert.deepEqual(await main(),original);await page.locator('#quest-science-lab').click();assert.equal((await labSave()).data.completed.length,5);assert.equal((await attempts()).length,26);
  assert.equal(await page.evaluate(()=>RallyLearning.validateState(JSON.parse(localStorage.getItem('recall-rally-learning-v1'))).attempts.filter(a=>a.mode==='science-lab').length),26);
  await page.locator('#sl-close').click();await expectPrismInventory();
  console.log('PASS complete standalone HTML, Librarian v4, same-origin deployment and learning-journal import validation');
  await page.locator('#open-learning').click();await page.locator('#learning-add-player').click();await page.locator('#learning-new-name').fill('Other Scientist');await page.locator('#learning-new-player button[type="submit"]').click();await page.locator('#learning-dialog [data-close]').click();
  const otherProfile=await page.evaluate(()=>RallyLearning.activeProfile().id);assert.notEqual(otherProfile,firstProfile);await page.locator('#quest-science-lab').click();assert.equal(await labSave(),null);assert.equal((await attempts()).length,0);assert.match(await page.locator('.sl-discovery-shelf').innerText(),/0 \/ 5/);await page.locator('#sl-close').click();
  await switchPlayer(firstProfile);await page.locator('#quest-science-lab').click();assert.equal((await labSave()).data.completed.length,5);
  console.log('PASS stable player IDs keep laboratory discoveries and attempts separate');
  // The existing study-pack form validates an eligible custom record; no new lab bank.
  await page.evaluate(()=>{const q=SAMPLES.find(q=>q.subject==='science');customPack.push(validateQuestion({...q,id:'custom-lab-example',prompt:'Study pack review: '+q.prompt,topic:'Properties of materials'}));savePack()});
  await page.locator('#sl-close').click();await page.locator('#quest-science-lab').click();await page.locator('#sl-custom').check();assert(await page.evaluate(()=>ScienceLab.pool().some(q=>q.id==='custom-lab-example')));
  await page.locator('#sl-custom').uncheck();assert(!(await page.evaluate(()=>ScienceLab.pool().some(q=>q.id==='custom-lab-example'))));
  console.log('PASS eligible existing custom study-pack records can be included without rewriting them');
  // Loaded offline application: no network is needed for machines, art, answers or saving.
  await page.route('**/*',route=>route.abort());await page.locator('[data-sl-station="weather"]').click();await answerLab(false);assert(await page.locator('.sl-mishap').count());await page.locator('#sl-next').click();await page.locator('#sl-hub').click();await page.unroute('**/*');
  console.log('PASS network-free experiment, local artwork, feedback and save');
  const backupEvent=page.waitForEvent('download');await page.locator('#sl-export').click();const download=await backupEvent,backup=path.join(temp,'lab.json');await download.saveAs(backup);assert.equal(JSON.parse(fs.readFileSync(backup)).data.completed.length,5);
  await page.locator('#sl-import').setInputFiles({name:'broken.json',mimeType:'application/json',buffer:Buffer.from('{broken')});await page.waitForFunction(()=>document.getElementById('sl-notice').textContent.includes('did not finish'));assert.equal((await labSave()).data.completed.length,5);
  page.once('dialog',dialog=>dialog.accept());await page.locator('#sl-import').setInputFiles(backup);await page.waitForFunction(()=>document.getElementById('sl-notice').textContent.includes('backup imported'));assert.equal((await labSave()).data.completed.length,5);assert.deepEqual(await main(),original);
  console.log('PASS lab backup validates, confirms and preserves Rigby progress');
  // Storage failure is visible, with no false saved message and no lost main progress.
  await page.evaluate(()=>{window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.startsWith('recall-rally-sidequest-science-lab-'))throw new DOMException('Full','QuotaExceededError');return window.originalSetItem.call(this,k,v)}});
  await page.locator('[data-sl-station="potion"]').click();assert.match(await page.locator('#sl-save-status').innerText(),/saving is unavailable/);assert(!(await page.locator('#sl-save-status').innerText()).includes('✓'));assert.deepEqual(await main(),original);
  await page.evaluate(()=>{Storage.prototype.setItem=window.originalSetItem});await page.locator('#sl-hub').click();
  console.log('PASS quota failures show an honest warning without changing the saved Rigby adventure');
  // Actual rendered states and controls at the four required viewport sizes.
  for(const [width,height] of [[1366,768],[1024,768],[820,1180],[390,844]]){
   await page.setViewportSize({width,height});await page.locator('[data-sl-station="potion"]').click();await answerLab(false);
   assert(!(await page.evaluate(()=>document.querySelector('#science-lab').scrollWidth>document.querySelector('#science-lab').clientWidth+1)),'no horizontal overflow');
   const next=await page.locator('#sl-next').boundingBox();if(width>=1024){assert(next.y>=0&&next.y+next.height<=height,'Next visible on a laptop/landscape tablet');for(const el of await page.locator('[data-sl-choice]').all()){const r=await el.boundingBox();assert(r.y+r.height<=height,'all choices visible')}}
   if(screens)await page.screenshot({path:path.join(screens,'feedback-'+width+'x'+height+'.png')});
   await page.locator('#sl-next').scrollIntoViewIfNeeded();await page.locator('#sl-next').click();await page.locator('#sl-hub').click();
  }
  console.log('PASS desktop, tablet landscape, tablet portrait and phone layouts, keyboard choices and reachable feedback');
  await page.setViewportSize({width:1366,height:768});await page.locator('[data-sl-station="potion"]').click();
  for(let step=0;step<3;step++){await answerLab(true);if(step<2){assert.equal(await page.locator('.pm-bubble').count(),0,'Potion simmer starts at the third repaired step');await page.locator('#sl-next').click()}}
  assert.equal(await page.locator('.pm-bubble').first().evaluate(el=>getComputedStyle(el).animationName),'none');
  await page.emulateMedia({reducedMotion:'no-preference'});assert.equal(await page.locator('.pm-bubble').first().evaluate(el=>getComputedStyle(el).animationName),'pm-bubble-rise');
  await page.locator('#sl-hub').click();await page.locator('#sl-sound').click();assert.equal(await page.evaluate(()=>soundOn),false);assert.equal(await page.locator('#sl-sound').getAttribute('aria-pressed'),'false');await page.locator('#sl-close').click();assert.deepEqual((await main()).keys,original.keys);
  // Separate touch context exercises actual tap events; it has its own profile.
  const touch=await context.browser().newContext({viewport:{width:1024,height:768},hasTouch:true,isMobile:true,reducedMotion:'reduce'}),touchPage=await touch.newPage();touchPage.on('pageerror',e=>errors.push(e.message));
  await touchPage.goto(url,{waitUntil:'domcontentloaded'});await touchPage.locator('#open-science-lab').tap();assert((await touchPage.locator('#sl-approach').boundingBox()).height>=44);await touchPage.locator('[data-sl-station="circuit"]').tap();await touchPage.locator('[data-sl-choice="0"]').tap();assert(await touchPage.locator('.sl-feedback').isVisible());
  for(const el of await touchPage.locator('[data-sl-choice],#sl-close,#sl-sound,#sl-hub,#sl-open-model').all()){const box=await el.boundingBox();assert(box.height>=44&&box.width>=44,'44px touch targets')}
  await touchPage.locator('#sl-next').tap();assert.match(await touchPage.locator('.sl-question-meta').innerText(),/Question 2 of 5/);await touch.close();
  console.log('PASS reduced-motion rendering, active equipment animation, shared sound preference and tablet touch input');
  // Corrupt only the lab record on a fresh document, after pagehide has saved.
  await page.addInitScript(()=>{const p=JSON.parse(localStorage.getItem('recall-rally-learning-v1'));localStorage.setItem('recall-rally-sidequest-science-lab-v1:'+p.activeProfileId,'{broken')});
  await page.reload({waitUntil:'domcontentloaded'});assert(await page.locator('#runtime-status').isVisible());await page.locator('#quest-home-continue').click();assert.deepEqual(await main(),original);await page.locator('#quest-science-lab').click();assert.match(await page.locator('#sl-save-status').innerText(),/could not be read/);assert.equal(await page.evaluate(()=>localStorage.getItem('recall-rally-sidequest-science-lab-v1:'+RallyLearning.activeProfile().id)),'{broken');
  assert.deepEqual(errors,[],'no browser script errors');console.log('PASS corrupt laboratory save cannot break startup or the main adventure; no browser script errors');
 }finally{if(context)await context.close();if(server)await new Promise(r=>server.close(r));fs.rmSync(temp,{recursive:true,force:true})}
})().catch(e=>{console.error(e);process.exitCode=1});


