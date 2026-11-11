'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),pw=require('playwright');
const root=path.join(__dirname,'..'),engine=process.env.APPLE_ENGINE||'chromium',folder=process.env.APPLE_REPORT;
const views=[['iphone-se',568,320],['iphone-small',667,375],['iphone-modern',852,393],['iphone-large',932,430],['safari-bars',852,300]];
(async()=>{let server,browser;try{
 const html=process.env.APPLE_TEST_HTML||path.join(root,'Ellery_Recall_Rally_Librarian_v4.html');
 server=http.createServer((q,r)=>r.end(fs.readFileSync(html)));await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await pw[engine].launch(engine==='chromium'?{executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']}:{});
 if(folder)fs.mkdirSync(folder,{recursive:true});const errors=[];
 for(const [name,width,height] of views){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:'no-preference',...(folder&&name==='iphone-modern'?{recordVideo:{dir:path.join(folder,'raw'),size:{width:932,height:844}}}:{})});const page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('#quest-home-new').tap();await page.locator('#creator-hero-name').fill('Landscape Explorer');await page.locator('#hero-done').tap();await page.locator('#quest-speed').selectOption('0');await page.evaluate(()=>setSoundPreference(false));await page.locator('#world-next').tap();await page.locator('#quest-begin').tap();
  const identity=await page.evaluate(()=>JSON.stringify({heroName,heroStyle,avatarLook}));
  const bounds=()=>page.evaluate(()=>{const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};return{question:rect('.duel-question-panel'),arena:rect('.duel-arena-panel'),stage:rect('.spell-stage'),board:rect('.duel-board'),scroll:document.documentElement.scrollWidth,win:innerWidth,h:visualViewport.height}});
  let b=await bounds();assert(b.arena.y>=b.question.bottom-1,'Portrait retains stacked layout');
  await page.setViewportSize({width,height});await page.waitForFunction(h=>Math.abs(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--rally-vh'))-h)<2,height);
  // Simulate a landscape iPhone notch/home-indicator safe area.
  await page.evaluate(()=>{const s=document.documentElement.style;s.setProperty('--rally-safe-left','32px');s.setProperty('--rally-safe-right','32px');s.setProperty('--rally-safe-bottom','10px')});
  const check=async()=>{const b=await bounds();assert(b.question.right<=b.arena.x+1,name+': side by side');assert(Math.abs(b.question.y-b.arena.y)<2,name+': aligned tops');assert(b.arena.bottom<=b.h+1&&b.stage.y>=0&&b.stage.bottom<=b.h+1,name+': whole battle in viewport');assert(b.stage.height>70,name+': visible full illustration '+JSON.stringify(b));assert(b.scroll<=b.win+1,name+': no horizontal page overflow');const fits=await page.locator('.duel-question-panel').evaluate(e=>e.scrollWidth<=e.clientWidth+1);assert(fits,name+': no horizontal question overflow');return b;};
  if(folder)await page.screenshot({path:path.join(folder,engine+'-'+name+'-layout.jpg'),type:'jpeg',quality:85});
  b=await check();
  const touch=await page.locator('[data-quest-choice]').evaluateAll(es=>es.every(e=>e.getBoundingClientRect().height>=44));assert(touch,'Answer targets remain at least 44px');
  if(folder)await page.screenshot({path:path.join(folder,engine+'-'+name+'-question.jpg'),type:'jpeg',quality:85});
  // Native touch scrolls the question to its answer; it must not move the battle away.
  const before=b.stage;const wrong=await page.evaluate(()=>duel.choices.findIndex(x=>x!==duel.deck[duel.index].answer));await page.locator('[data-quest-choice="'+wrong+'"]').tap();
  assert.equal(await page.evaluate(()=>duel.scores[1]),1);assert.match(await page.locator('.duel-feedback-slot').innerText(),/Incorrect answer/);b=await check();assert(Math.abs(b.stage.y-before.y)<2,'Answering keeps battle fixed');
  await page.waitForTimeout(350);if(folder)await page.screenshot({path:path.join(folder,engine+'-'+name+'-attack.jpg'),type:'jpeg',quality:85});
  await page.locator('#quest-next').tap();assert.equal(await page.evaluate(()=>duel.phase),'open');assert(await page.locator('#quest-prompt').evaluate(e=>e.getBoundingClientRect().top>=e.closest('.duel-question-panel').getBoundingClientRect().top),'Next question scrolls back to prompt');
  // Stress the layout with long content, retaining the real deck for grading.
  await page.evaluate(()=>{document.querySelector('#quest-prompt').textContent='A longer question about the scientific investigation: '.repeat(18);document.querySelectorAll('[data-quest-choice]').forEach(e=>e.append(document.createTextNode(' with a detailed answer option '.repeat(5))))});
  const scores=await page.evaluate(()=>[...duel.scores]);const stage=await page.locator('.spell-stage').boundingBox();await page.locator('.duel-question-panel').evaluate(e=>e.scrollTop=e.scrollHeight);const after=await page.locator('.spell-stage').boundingBox();assert(Math.abs(stage.y-after.y)<1,'Long question scroll stays independent');await check();
  await page.locator('#quest-pause').tap();assert.equal(await page.evaluate(()=>duel.paused),true);await page.locator('#quest-resume').tap();assert.deepEqual(await page.evaluate(()=>[...duel.scores]),scores);
  // Mid-question rotation keeps question, score and selected hero.
  const id=await page.evaluate(()=>stableQuestionId(duel.deck[duel.index]));await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);b=await bounds();assert(b.arena.y>=b.question.bottom-1);await page.setViewportSize({width,height});await page.waitForTimeout(100);await check();assert.equal(await page.evaluate(()=>stableQuestionId(duel.deck[duel.index])),id);assert.equal(await page.evaluate(()=>JSON.stringify({heroName,heroStyle,avatarLook})),identity);
  await page.emulateMedia({reducedMotion:'reduce'});const right=await page.evaluate(()=>duel.choices.indexOf(duel.deck[duel.index].answer));await page.locator('[data-quest-choice="'+right+'"]').tap();await check();assert.equal(await page.evaluate(()=>duel.scores[0]),1);assert.equal(await page.evaluate(()=>GuardianMotion.inspect().scheduled),false);
  await page.locator('#quest-map-back').tap();assert.equal(await page.evaluate(()=>document.body.classList.contains('duel-playing')),false);
  await page.close();if(folder&&name==='iphone-modern')await page.video().saveAs(path.join(folder,engine+'-rotation-and-duel.webm'));await context.close();console.log('PASS '+engine+' '+name+': rotation, safe areas, battle visible, native touch, long copy, pause, grading, reduced motion');
 }
 // Check unchanged larger layouts in the same standalone game.
 for(const [width,height]of [[1366,768],[1024,768],[820,1180],[390,844]]){const page=await browser.newPage({viewport:{width,height}});await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('#quest-home-new').click();await page.locator('#creator-hero-name').fill('Layout Explorer');await page.locator('#hero-done').click();await page.locator('#quest-speed').selectOption('0');await page.locator('#world-next').click();await page.locator('#quest-begin').click();const side=await page.evaluate(()=>{const q=document.querySelector('.duel-question-panel').getBoundingClientRect(),a=document.querySelector('.duel-arena-panel').getBoundingClientRect();return Math.abs(q.top-a.top)<2});assert.equal(side,width>=900);if(folder)await page.screenshot({path:path.join(folder,engine+'-regression-'+width+'x'+height+'.jpg'),type:'jpeg',quality:80,fullPage:true});await page.close();}
 assert.deepEqual(errors,[]);
}finally{await browser?.close();if(server)await new Promise(r=>server.close(r))}})().catch(e=>{console.error(e);process.exitCode=1});
