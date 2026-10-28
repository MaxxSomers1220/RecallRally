'use strict';
// Requires Playwright and Chromium. Runs the real HTML and storage in a browser.
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.join(__dirname,'..'),temp=fs.mkdtempSync(path.join(os.tmpdir(),'rigby-browser-'));
const htmlFile=process.env.RECALL_RALLY_TEST_HTML||'index.html';
const errors=[];let server,context,page,url;
async function openBrowser(){
 context=await chromium.launchPersistentContext(path.join(temp,'browser'),{executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage'],reducedMotion:'reduce',viewport:{width:1280,height:900},acceptDownloads:true});
 page=await context.newPage();page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url,{waitUntil:'domcontentloaded'});assert(await page.locator('#runtime-status').isVisible(),'game launches');
}
const state=()=>page.evaluate(()=>({level:questProgress,keys:questKeys,completed:questCompleted,location:questLocation,chapter:questMapChapter,stats:questRunStats,hero:heroName,look:avatarLook,style:heroStyle,profile:RallyLearning.activeProfile(),duel:duel&&{land:duel.land,index:duel.index,scores:duel.scores,phase:duel.phase,charge:duel.charge,assistUsed:duel.assistUsed,assistanceSeal:duel.assistanceSeal},walking:questWalking}));
const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('recall-rally-rigby-save-v1:'+RallyLearning.activeProfile().id)));
async function answer(){
 const answer=await page.evaluate(()=>duel.choices.indexOf(duel.deck[duel.index].answer));
 await page.locator(`[data-quest-choice="${answer}"]`).click();await page.locator('#quest-next').click();
}
async function encounter(){await page.locator('#world-next').click();await page.locator('#quest-begin').click()}
async function win(){await encounter();for(let i=0;i<4;i++)await answer()}
async function map(){if(await page.locator('#rigby-skip').count())await page.locator('#rigby-skip').click();await page.locator('#quest-return').click()}
async function home(){await page.locator('#home-brand').click()}
async function switchProfile(id){await page.locator('#open-learning').click();await page.locator('#learning-profile').selectOption(id);await page.locator('#learning-dialog [data-close]').click()}
function checkSave(s,level){assert.equal(s.progress.level,level);assert.deepEqual(s.progress.keys,Array.from({length:level},(_,i)=>i));assert.equal(s.interruptedEncounter,null)}
(async()=>{
 try{
  server=http.createServer((req,res)=>{let file=path.join(root,req.url==='/'?htmlFile:req.url.split('?')[0]);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return}res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'application/octet-stream');res.end(data)})});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));url=`http://127.0.0.1:${server.address().port}/`;await openBrowser();
  assert(await page.locator('#quest-home-continue').isHidden(),'new browser has no Continue button');
  await page.locator('#quest-home-new').click();await page.locator('#hero-done').click();
  await page.locator('#quest-speed').selectOption('0');
  // A real creator edit, saved separately from the learning-profile identity.
  await home();await page.locator('#build-hero').click();await page.locator('#creator-hero-name').fill('Moon Explorer');
  await page.locator('[data-hero-key="skin"][data-hero-value="deep"]').click();await page.locator('#hero-done').click();
  const firstProfile=(await state()).profile.id,look=(await state()).look;
  await win();await map();await win();
  checkSave(await saved(),2); // The second seal is durable even during its cutaway.
  await context.close();await openBrowser();
  assert(await page.locator('#quest-home-continue').isVisible());await page.locator('#quest-home-continue').click();
  let s=await state();assert.equal(s.level,2);assert.deepEqual(s.keys,[0,1]);assert.equal(s.location,1);assert.equal(s.duel,null);assert.equal(s.walking,false);assert.deepEqual(s.look,look);assert.equal(s.hero,'Moon Explorer');
  assert.match(await page.locator('#quest-welcome').innerText(),/Welcome back!/);
  assert.equal(await page.locator('.world-stop.cleared').count(),2);assert(await page.locator('[data-level="2"]').isEnabled());assert(await page.locator('[data-level="3"]').isDisabled());
  assert.equal(await page.locator('[aria-current="location"]').getAttribute('data-level'),'1');
  assert.match(await page.locator('#objective-title').innerText(),/Compass Coast/);assert.match(await page.locator('.seal-map-help').innerText(),/Firefly Lantern/);
  console.log('PASS close browser after two victories: both seals, location, objective, locks and hero restored');
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('#quest-home-continue').click();assert.equal((await state()).location,1);assert.equal((await state()).walking,false);
  console.log('PASS map reload restores the hero without replaying travel');
  await encounter();await answer();await answer();
  assert.equal((await state()).duel.scores[0],2);assert.equal((await saved()).interruptedEncounter,2);
  const learningBefore=await page.evaluate(()=>localStorage.getItem('recall-rally-learning-v1'));
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('#quest-home-continue').click();
  assert.match(await page.locator('#quest-welcome').innerText(),/restart from the beginning/);assert.equal((await state()).level,2);
  await encounter();s=await state();assert.deepEqual(s.duel.scores,[0,0]);assert.equal(s.duel.index,0);assert.equal(s.duel.charge,0);assert.equal(s.duel.assistUsed,false);assert.equal(s.duel.assistanceSeal,1);
  assert.equal((await page.evaluate(()=>JSON.parse(localStorage.getItem('recall-rally-learning-v1')))).attempts.length,JSON.parse(learningBefore).attempts.length);
  console.log('PASS interrupted duel resets its temporary state, retaining seals, assistance and learning records');
  for(let i=0;i<4;i++)await answer();await map();assert.equal((await state()).level,3);
  const thirdSealSave=await saved();
  await home();
  const backup=page.locator('#quest-home-card details');await backup.locator('summary').click();
  const downloadPromise=page.waitForEvent('download');await page.locator('#quest-home-export').click();const download=await downloadPromise;const backupPath=path.join(temp,'quest.json');await download.saveAs(backupPath);assert.equal(JSON.parse(fs.readFileSync(backupPath)).progress.level,3);
  // Switch via the real profile controls, then create an independent adventure.
  await page.locator('#open-learning').click();await page.locator('#learning-add-player').click();await page.locator('#learning-new-name').fill('Rigby Fan');await page.locator('#learning-new-player button[type="submit"]').click();await page.locator('#learning-dialog [data-close]').click();
  const secondProfile=(await state()).profile.id;assert.notEqual(firstProfile,secondProfile);assert.equal((await state()).level,0);assert(await page.locator('#quest-home-continue').isHidden());
  await page.locator('#quest-home-new').click();await page.locator('#hero-done').click();await page.locator('#quest-speed').selectOption('0');await win();await map();assert.equal((await state()).level,1);
  await switchProfile(firstProfile);assert.equal((await state()).level,3);assert.deepEqual((await state()).look,look);assert.equal((await state()).hero,'Moon Explorer');
  await switchProfile(secondProfile);assert.equal((await state()).level,1);assert.equal((await state()).hero,'Rigby Fan');
  // A transferred backup is attached to the receiving profile's stable ID.
  await home();await page.locator('#quest-home-import').setInputFiles(backupPath);await page.locator('#quest-confirm-accept').click();
  assert.equal((await state()).level,3);assert.equal((await saved()).profile.id,secondProfile);
  await switchProfile(firstProfile);await home();
  console.log('PASS two stable profile IDs retain independent adventures and hero appearances');
  const history=await page.evaluate(()=>localStorage.getItem('ellery-rigby-question-history-v1'));
  const learning=await page.evaluate(()=>JSON.parse(localStorage.getItem('recall-rally-learning-v1')));
  await page.locator('#quest-home-new').click();assert(await page.locator('#quest-confirm').isVisible());await page.locator('#quest-confirm-keep').click();assert.equal((await state()).level,3);
  await page.locator('#quest-home-new').click();await page.locator('#quest-confirm-accept').click();s=await state();assert.equal(s.level,0);assert.deepEqual(s.look,look);assert.equal(s.hero,'Moon Explorer');checkSave(await saved(),0);
  assert.equal(await page.evaluate(()=>localStorage.getItem('ellery-rigby-question-history-v1')),history);
  const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('recall-rally-learning-v1')));assert.deepEqual(after.attempts,learning.attempts);assert.deepEqual(after.sessions,learning.sessions);
  console.log('PASS new-run confirmation protects progress; reset retains learning, exposure history and hero');
  await home();await page.locator('#quest-home-card details summary').click();
  await page.locator('#quest-home-import').setInputFiles(backupPath);await page.locator('#quest-confirm-keep').click();checkSave(await saved(),0);
  await page.locator('#quest-home-import').setInputFiles(backupPath);await page.locator('#quest-confirm-accept').click();checkSave(await saved(),3);
  assert.deepEqual((await state()).look,look);
  await home();await page.locator('#quest-home-card details summary').click();
  await page.locator('#quest-home-import').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"format":"recall-rally-rigby-adventure","version":99}')});
  await page.waitForFunction(()=>document.getElementById('quest-import-notice').textContent.includes('Import did not finish'));
  assert.match(await page.locator('#quest-import-notice').innerText(),/unsupported version/);checkSave(await saved(),3);
  console.log('PASS export/import validates backups and confirms replacement; bad import leaves the quest intact');
  // Loading the other shipped HTML at the SAME origin simulates a deployment update.
  await page.goto(url+'Ellery_Recall_Rally_Librarian_v4.html',{waitUntil:'domcontentloaded'});await page.locator('#quest-home-continue').click();assert.equal((await state()).level,3);assert(await page.locator('#lib-launch').isVisible());
  console.log('PASS normal same-origin deployment/file update retains three seals and Librarian v4');
  await page.route('**/*',route=>route.abort());
  await page.evaluate(()=>{beginFreshAdventure()});await page.locator('#quest-confirm-keep').click();assert.equal((await state()).level,3);
  await encounter();await answer();assert.equal((await state()).duel.scores[0],1);await page.locator('#quest-map-back').click();checkSave(await saved(),3);
  await page.unroute('**/*');console.log('PASS loaded game and save work with all network requests blocked');
  // A quota error is visible and never masquerades as a successful save.
  await page.evaluate(()=>{window.realSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.startsWith('recall-rally-rigby-save-'))throw new DOMException('Full','QuotaExceededError');return window.realSetItem.call(this,k,v)};QuestSaves.save()});
  assert.match(await page.locator('#quest-save-status').innerText(),/saving is unavailable/);assert(!(await page.locator('#quest-save-status').innerText()).includes('✓'));
  const unchangedSave=await saved();await home();
  await page.locator('#quest-home-import').setInputFiles({name:'fresh.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...thirdSealSave,progress:{level:0,location:-1,chapter:0,keys:[],completed:[]},stats:{answered:0,correct:0,streak:0,bestStreak:0}}))});
  await page.locator('#quest-confirm-accept').click();assert.equal((await state()).level,3);assert.deepEqual(await saved(),unchangedSave,'failed import preserves the old save');
  await page.locator('#quest-home-continue').click();
  await page.evaluate(()=>{Storage.prototype.setItem=window.realSetItem;QuestSaves.save()});assert.match(await page.locator('#quest-save-status').innerText(),/✓ Adventure saved/);
  console.log('PASS saving failures show a visible warning and recovery saves again');
  await page.addInitScript(()=>{const p=JSON.parse(localStorage.getItem('recall-rally-learning-v1'));localStorage.setItem('recall-rally-rigby-save-v1:'+p.activeProfileId,'{broken')});
  await page.reload({waitUntil:'domcontentloaded'});assert(await page.locator('#runtime-status').isVisible());assert(await page.locator('#quest-home-continue').isHidden());assert.match(await page.locator('#quest-home-status').innerText(),/could not be restored/);
  assert.equal(await page.evaluate(()=>localStorage.getItem('recall-rally-rigby-save-v1:'+RallyLearning.activeProfile().id)),'{broken');
  await page.locator('#mode-adventure').click();assert(await page.locator('#quest-recovery-new').isVisible());await page.locator('#quest-recovery-new').click();await page.locator('#quest-confirm-keep').click();
  console.log('PASS corrupt save cannot crash startup and is retained until intentional replacement');
  // Unsupported and internally inconsistent records are rejected by the actual validator.
  await page.evaluate(value=>{const bad=[{...value,version:999},{...value,interruptedEncounter:9},{...value,progress:{...value.progress,keys:[0,0,2]}},{...value,stats:{...value.stats,correct:-1}},{...value,hero:{...value.hero,style:'<script>'}}];for(const candidate of bad){let rejected=false;try{QuestSaves.validate(candidate)}catch{rejected=true}if(!rejected)throw Error('Invalid save accepted')}},thirdSealSave);
  const blocked=await context.newPage();blocked.on('pageerror',e=>errors.push(e.message));
  await blocked.addInitScript(()=>{Storage.prototype.getItem=function(){throw new DOMException('Denied','SecurityError')};Storage.prototype.setItem=function(){throw new DOMException('Denied','SecurityError')}});
  await blocked.goto(url,{waitUntil:'domcontentloaded'});assert(await blocked.locator('#runtime-status').isVisible());assert.match(await blocked.locator('#quest-home-status').innerText(),/storage is unavailable/);
  await blocked.locator('#quest-home-new').click();await blocked.locator('#hero-done').click();assert.match(await blocked.locator('#quest-save-status').innerText(),/saving is unavailable/);await blocked.close();
  console.log('PASS startup and a new adventure still work when all browser storage is denied');
  assert.deepEqual(errors,[],'no browser JavaScript errors');console.log('PASS version, map, statistics and hero validation; no browser JavaScript errors');
 }finally{if(context)await context.close();if(server)await new Promise(r=>server.close(r));fs.rmSync(temp,{recursive:true,force:true})}
})().catch(e=>{console.error(e);process.exitCode=1});
