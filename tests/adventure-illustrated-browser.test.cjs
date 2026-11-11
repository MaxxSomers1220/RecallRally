'use strict';
// Runs the actual game and actual controls. State reads assert results; no replacement decks/grades.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.join(__dirname,'..'),file=path.resolve(root,process.env.RIGBY_TEST_HTML||'Ellery_Recall_Rally_Librarian_v4.html');
const screens=process.env.RIGBY_SCREENSHOTS,errors=[],failures=[];let browser,server;
const viewports=[['desktop',1366,768],['tablet-landscape',1024,768],['tablet-portrait',820,1180],['phone',390,844]].filter(v=>!process.env.RIGBY_VIEWPORT||v[0]===process.env.RIGBY_VIEWPORT);
(async()=>{try{
 server=http.createServer((req,res)=>{const f=req.url==='/'?file:path.join(path.dirname(file),req.url.split('?')[0]);if(req.url==='/favicon.ico'){res.writeHead(204).end();return}fs.readFile(f,(e,data)=>{if(e){res.writeHead(404).end();return}res.setHeader('Content-Type',f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html');res.end(data)})});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});if(screens)fs.mkdirSync(screens,{recursive:true});
 for(const [name,width,height] of viewports){
  const context=await browser.newContext({viewport:{width,height},hasTouch:name!=='desktop',reducedMotion:name==='desktop'?'no-preference':'reduce'}),page=await context.newPage();page.setDefaultTimeout(10000);
  page.on('pageerror',e=>errors.push(name+': '+e.message));page.on('requestfailed',r=>failures.push(r.url()));
  const snap=async(s,selector)=>{if(screens){await page.waitForTimeout(100);const target=selector?page.locator(selector):page;await target.screenshot({path:path.join(screens,(process.env.RIGBY_SCREENSHOT_PREFIX||'')+name+'-'+s+'.jpg'),type:'jpeg',quality:87,...(selector?{}:{fullPage:true})});}};
  const state=()=>page.evaluate(()=>({progress:questProgress,keys:[...questKeys],phase:duel?.phase,scores:duel?.scores,index:duel?.index,charge:duel?.charge,signature:duel?.signatureUsed,hero:heroName,style:heroStyle,look:avatarLook,stats:{...questRunStats},journal:RallyLearning.snapshot().attempts.length}));
  async function layout(){assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'No horizontal overflow '+name);for(const sel of ['.quest-prompt','.adventure-choices','#quest-next']){const b=await page.locator(sel).boundingBox();assert(b&&b.x>=0&&b.x+b.width<=width+1,'Readable '+sel);}if(width>=900){const next=await page.locator('#quest-next').boundingBox();assert(next.y+next.height<=height+1,'Laptop/tablet Next in viewport');const arena=await page.locator('.spell-stage').boundingBox();assert(arena.y+arena.height<=height+1,'Arena in viewport');}for(const b of await page.locator('[data-quest-choice],[data-spell-choice],#quest-next').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().height)))assert(b>=38,'Controls have usable touch targets');}
  async function pick(correct,keyboard=false){const k=await page.evaluate(correct=>duel.choices.findIndex(c=>(c===duel.deck[duel.index].answer)===correct),correct);if(keyboard){await page.locator('#quest-prompt').focus();await page.keyboard.press(String(k+1));}else if(name==='phone')await page.locator('[data-quest-choice="'+k+'"]').tap();else await page.locator('[data-quest-choice="'+k+'"]').click();assert.equal((await state()).phase,'result');assert.match(await page.locator('.duel-feedback-slot').innerText(),correct?/Correct answer/:/Incorrect answer/);assert(await page.locator('#quest-next').isEnabled());}
  async function next(){await page.locator('#quest-next').click();}
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'domcontentloaded'});await page.locator('#quest-home-new').click();
  // Persist a deliberately customized appearance through all ten worlds and the reunion.
  await page.locator(name==='phone'?'#hero-model-panther':'#hero-model-fairy').click();
  await page.locator('#creator-hero-name').fill(name==='phone'?'Moon Scout':'Star Explorer');
  for(const [key,value] of [['skin','deep'],['hairStyle','locs'],['outfit',name==='phone'?'knight':'ranger'],['outfitColor','forest'],['shoes','boots']]){const tab=await page.evaluate(key=>HERO_CATEGORIES.find(c=>c.keys.includes(key)).id,key);await page.locator('[data-hero-tab="'+tab+'"]').click();await page.locator('[data-hero-key="'+key+'"][data-hero-value="'+value+'"]').click();}
  await page.evaluate(()=>setSoundPreference(false));
  await page.locator('#hero-done').click();await page.locator('#quest-speed').selectOption('0');const original=await state();assert.equal(original.style,name==='phone'?'panther':'fairy');assert.equal(original.look.skin,'deep');assert.equal(original.look.outfit,name==='phone'?'knight':'ranger');assert.equal(original.hero,name==='phone'?'Moon Scout':'Star Explorer');const lab=await page.evaluate(()=>JSON.stringify(QuestSaves.readSideQuest('science-lab',ScienceLab.validate).data));
  if(name==='desktop'||name==='phone')await snap('map-sunlit','#quest-world');
  for(let world=0;world<10;world++){
   assert.equal((await state()).progress,world);await page.locator('#world-next').click();await page.locator('#quest-begin').click();await layout();
   assert.equal(await page.locator('[data-guardian="'+world+'"]').count(),1);assert.equal(await page.locator('.arena-environment').getAttribute('data-arena-progress'),'0');assert.equal(await page.locator('.world-restoration li').count(),4);
   assert(await page.locator('.world-painted-depth').evaluate(async e=>{const im=new Image();im.src=e.getAttribute('href');await im.decode();return im.naturalWidth>=1200}),'Actual embedded painting decodes');
   if(name==='desktop'||world===0||world===9)await snap('world-'+world+'-question');
   await page.locator('[data-spell-choice="ward"]').click();await pick(true,name==='desktop');
   assert.equal((await state()).scores[0],1);assert.equal(await page.locator('.restored').count(),1);
   if(name==='desktop'&&world===0){await page.waitForTimeout(400);await snap('ward-cast');await page.waitForTimeout(1400);}
   await next();await pick(false,name==='desktop');assert.deepEqual((await state()).scores,[1,1]);assert.equal(await page.locator('.restored').count(),1,'Mistake preserves earned scene');
   if(world===0&&(name==='desktop'||name==='phone')){await page.waitForTimeout(name==='desktop'?380:50);await snap('mistake-and-explanation');await layout();}
   await next();await page.locator('[data-spell-choice="strike"]').click();await pick(true);assert.equal(await page.locator('.arena-environment').getAttribute('data-arena-phase'),'2');
   if(world===0&&(name==='desktop'||name==='phone')){await page.waitForTimeout(950);await snap('second-milestone');}
   await next();await pick(true);assert.equal((await state()).signature,true);assert.equal((await state()).charge,3);
   if(name==='desktop'&&[0,5,9].includes(world)){await page.waitForTimeout(450);await snap('world-'+world+'-starfall');}
   await next();await pick(true);assert.deepEqual((await state()).scores,[4,1]);assert.equal(await page.locator('.restored').count(),4);
   if(name==='desktop'||world===9){await page.waitForTimeout(name==='desktop'?1400:50);await snap('world-'+world+'-restored');}
   await next();assert.equal((await state()).progress,world+1);assert.deepEqual((await state()).keys,Array.from({length:world+1},(_,i)=>i));
   const rescue=page.locator('.rigby-cutaway .illustrated-rescue');assert.equal(await rescue.getAttribute('data-rescue-stage'),String(world+1));assert.equal(await rescue.locator('.rescue-sigil.rune-earned').count(),world+1);assert.equal(await rescue.locator('.rescue-custom-hero').count(),world===9?1:0,'Reunion only at ten seals');assert.equal(await rescue.locator('.rescue-ward').getAttribute('opacity'),world===9?'0':String(.9-(world+1)*.075));
   if(name==='desktop'&&world===9)await page.waitForTimeout(1600);if(name==='desktop'||world===9)await snap('rescue-'+(world+1),'.rigby-cutaway');
   if(await page.locator('#rigby-skip').count())await page.locator('#rigby-skip').click();else assert.equal((await state()).phase,'won');await page.locator('#quest-return').click();
   if(world===4&&(name==='desktop'||name==='phone'))await snap('map-beyond-mist','#quest-world');
   console.log('PASS '+name+' world '+world+': five real answers, miss review, four earned changes, phase, Starfall, seal '+(world+1));
  }
  const complete=await state();assert.equal(complete.progress,10);assert.deepEqual(complete.stats,{answered:50,correct:40,streak:3,bestStreak:4});assert.equal(complete.journal-original.journal,50);
  assert.equal(complete.hero,original.hero);assert.equal(complete.style,original.style);assert.deepEqual(complete.look,original.look);assert.equal(await page.evaluate(()=>JSON.stringify(QuestSaves.readSideQuest('science-lab',ScienceLab.validate).data)),lab);
  await snap('completed-map','#quest-world');
  // A missed-answer defeat cannot remove any earned seals; a rematch cannot add another seal.
  await page.locator('[data-level="9"]').click();await page.locator('#quest-begin').click();for(let i=0;i<4;i++){await pick(false);await next();}assert.equal((await state()).phase,'lost');assert.equal((await state()).progress,10);await snap('defeat');await page.locator('#quest-return').click();
  // Closing an open encounter cancels it; reopening begins with fresh score, charge and scenery.
  await page.locator('[data-level="9"]').click();await page.locator('#quest-begin').click();await pick(true);await page.locator('#quest-map-back').click();await page.locator('[data-level="9"]').click();await page.locator('#quest-begin').click();assert.deepEqual((await state()).scores,[0,0]);assert.equal(await page.locator('.restored').count(),0);await page.locator('#quest-map-back').click();
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('#quest-home-continue').click();assert.equal((await state()).progress,10);assert.deepEqual((await state()).look,original.look);
  // Offline plus reduced motion: decode new art and play a full rematch with no network.
  await context.setOffline(true);await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-level="9"]').click();await page.locator('#quest-begin').click();
  assert.equal(await page.locator('.guardian-painted-frame').evaluate(e=>getComputedStyle(e).animationName),'none');
  for(let i=0;i<4;i++){await pick(true);await next();}assert.equal((await state()).phase,'won');assert.equal((await state()).progress,10);await snap('offline-reduced-victory');
  assert.deepEqual((await state()).look,original.look);await context.close();
  console.log('PASS '+name+': full ten-world journey, customized hero, journal, defeat, close/reopen, durable save, offline rematch, reduced motion');
 }
 assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);
}finally{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1});
