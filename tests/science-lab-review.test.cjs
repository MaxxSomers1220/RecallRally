'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.join(__dirname,'..'),screens=process.env.SCIENCE_LAB_SCREENSHOTS;
let browser,server,page;const errors=[];
const journal=()=>page.evaluate(()=>RallyLearning.snapshot().attempts.filter(a=>a.mode==='science-lab'));
(async()=>{try{
 server=http.createServer((req,res)=>{const file=path.join(root,req.url==='/'?'index.html':req.url.split('?')[0]);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return}res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.js')?'text/javascript':'text/css');res.end(data)})});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 page=await browser.newPage({viewport:{width:1366,height:768},reducedMotion:'reduce'});page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});await page.locator('#open-science-lab').click();
 if(screens)fs.mkdirSync(screens,{recursive:true});
 for(const id of ['potion','circuit','creature','weather','observatory']){
  await page.locator('[data-sl-station="'+id+'"]').click();const qid=await page.locator('.sl-question').getAttribute('data-question-id');
  await page.locator('#sl-open-model').click();assert(await page.locator('#sl-observe').isDisabled());
  for(const condition of [0,1]){
   await page.locator('[data-sl-condition="'+condition+'"]').click();await page.keyboard.press(condition===0?'2':'1');
   await page.locator('#sl-observe').click();assert.match(await page.locator('#sl-model-result').innerText(),/result was different/);
   await page.keyboard.press(String(condition+1));await page.locator('#sl-observe').click();assert.match(await page.locator('#sl-model-result').innerText(),/prediction matched/);
   if(screens&&condition===1)await page.screenshot({path:path.join(screens,'model-'+id+'.png')});
  }
  await page.evaluate(()=>{ScienceLab.choose(0);ScienceLab.next()});assert.equal((await journal()).length,0,'ungraded predictions never become journal answers or question skips');
  await page.locator('#sl-model-back').click();assert.equal(await page.locator('.sl-question').getAttribute('data-question-id'),qid,'model preserves the pending shared question');
  await page.locator('#sl-hub').click();
 }
 assert.deepEqual(errors,[]);console.log('PASS five bank-backed models: both conditions, matched/different predictions, no academic credit, same pending question');
 await page.locator('#sl-approach').selectOption('review');await page.locator('[data-sl-station="potion"]').click();
 const current=await page.locator('.sl-question').getAttribute('data-question-id');const correct=await page.evaluate(id=>SAMPLES.find(q=>q.id===id).answer,current);
 const options=await page.locator('[data-sl-choice]>span').allTextContents();await page.keyboard.press(String(options.findIndex(v=>v!==correct)+1));
 assert(await page.locator('[data-sl-step="needs-repair"]').isVisible());assert.match(await page.locator('.sl-experiment-heading').innerText(),/1 answered · 0 \/ 5 repaired/);
 assert.equal((await journal()).length,1);assert.equal((await journal())[0].outcome,'incorrect');
 if(screens)await page.screenshot({path:path.join(screens,'repair-feedback.png')});
 await page.locator('#sl-next').click();assert.equal((await journal()).length,1);assert.equal(await page.locator('.sl-stage').getAttribute('data-sl-progress'),'1');
 await page.locator('#sl-hub').click();console.log('PASS a visible repair step, honest first grade, and immediate progress after applying the explanation');
}finally{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r))}})().catch(e=>{console.error(e);process.exitCode=1});
