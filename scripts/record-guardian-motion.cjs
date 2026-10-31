'use strict';
// Record real UI input at real speed; no patched clock, injected answers or progress.
// Optional MOTION_REFERENCE_HTML records an immutable earlier build for comparison.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.join(__dirname,'..'),phone=process.env.MOTION_PHONE==='1',name=process.env.MOTION_REFERENCE_HTML?'before':phone?'phone-sequence':'pippin-sequence',folder=path.resolve(process.env.GUARDIAN_RECORDINGS||'docs/reviews/guardian-motion'),file=process.env.MOTION_REFERENCE_HTML||path.join(root,'Ellery_Recall_Rally_Librarian_v4.html');
let server,browser;
(async()=>{try{
 fs.mkdirSync(folder,{recursive:true});server=http.createServer((q,r)=>r.end(fs.readFileSync(file)));await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});const context=await browser.newContext({viewport:{width:phone?390:1366,height:phone?844:768},hasTouch:phone,recordVideo:{dir:path.join(folder,'raw'),size:{width:phone?390:1366,height:phone?844:768}}}),started=Date.now(),page=await context.newPage(),timeline={};
 const mark=k=>timeline[k]=(Date.now()-started)/1000;const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('#quest-home-new').click();await page.locator('#hero-done').click();await page.locator('#quest-speed').selectOption('0');await page.evaluate(()=>setSoundPreference(false));await page.locator('#world-next').click();await page.locator('#quest-begin').click();
 const arena=()=>page.locator('.spell-scene').scrollIntoViewIfNeeded();await arena();mark('listening');await page.waitForTimeout(8800);
 async function answer(right){const i=await page.evaluate(right=>duel.choices.findIndex(x=>(x===duel.deck[duel.index].answer)===right),right),choice=page.locator('[data-quest-choice="'+i+'"]');if(phone)await choice.tap();else await choice.click();if(phone)await arena();}
 await answer(false);mark('wrong-answer');await page.waitForTimeout(1700);await page.screenshot({path:path.join(folder,name+'-casting.jpg'),type:'jpeg',quality:90,fullPage:true});await page.locator('#quest-next').click();if(phone)await arena();mark('return-to-listening');await page.waitForTimeout(900);
 for(let i=0;i<4;i++){await answer(true);mark('correct-'+i);await page.waitForTimeout(i===2?2100:1400);await page.locator('#quest-next').click();}
 assert.equal(await page.evaluate(()=>questProgress),1);if(await page.locator('#rigby-skip').count())await page.locator('#rigby-skip').click();mark('celebration');await page.waitForTimeout(1700);await page.screenshot({path:path.join(folder,name+'-victory.jpg'),type:'jpeg',quality:90,fullPage:true});await page.locator('#quest-return').click();assert.deepEqual(errors,[]);
 await page.close();await page.video().saveAs(path.join(folder,name+'.webm'));await context.close();fs.writeFileSync(path.join(folder,name+'-timeline.json'),JSON.stringify(timeline,null,2)+'\n');console.log('Recorded actual '+name+' idle/miss/cast/review/next/victory sequence',timeline);
}finally{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1});
