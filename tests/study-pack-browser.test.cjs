'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.join(__dirname,'..');
(async()=>{
 const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}fs.readFile(file,(e,data)=>{if(e){res.writeHead(404).end();return}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(data)})});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  for(const file of ['index.html','Ellery_Recall_Rally_Librarian_v4.html'])for(const mobile of [false,true]){
   const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1366,height:768},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce',acceptDownloads:true});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:'+server.address().port+'/'+file,{waitUntil:'load'});
   assert.equal(await page.locator('header #open-pack').count(),0);
   assert.equal(await page.locator('#home-view #storage-message').count(),0);
   assert(!(await page.locator('#home-view .support-grid').innerText()).includes('Study pack'));
   const openPack=async()=>{await page.locator('#open-learning').click();await page.locator('.learning-study-tools summary').click();await page.locator('#open-pack').click();assert(await page.locator('#pack-dialog').isVisible())};
   await openPack();
   const prompt='A test explorer shares 42 berries equally among 6 friends. How many berries does each friend receive?';
   await page.locator('#custom-subject').selectOption('math');await page.locator('#custom-modes').selectOption('both');
   for(const [id,value]of Object.entries({'custom-prompt':prompt,'custom-answer':'7','custom-d1':'6','custom-d2':'8','custom-d3':'9','custom-aliases':'seven','custom-explanation':'Divide 42 berries by 6 friends: 42 ÷ 6 = 7.','custom-topic':'Sharing equally','custom-source':'Original browser test'}))await page.locator('#'+id).fill(value);
   await page.locator('#pack-form button[type=submit]').click();assert.match(await page.locator('#pack-status').innerText(),/Added!/);
   assert.equal(await page.evaluate(()=>customPack.length),1);
   const download=page.waitForEvent('download');await page.locator('#export-pack').click();const saved=await download;
   const exported=JSON.parse(fs.readFileSync(await saved.path(),'utf8'));assert.equal(exported.questions.length,1);assert.equal(exported.questions[0].prompt,prompt);
   const importData=async(data,name='practice.json')=>{await page.locator('#import-pack').setInputFiles({name,mimeType:'application/json',buffer:Buffer.from(typeof data==='string'?data:JSON.stringify(data))})};
   await importData(exported);assert.equal(await page.evaluate(()=>customPack.length),1,'duplicate import does not add another copy');
   const imported={subject:'math',prompt:'A test library adds 13 books to its shelf of 25 books. How many books are now on the shelf?',answer:'38',options:['38','12','35','48'],aliases:['thirty-eight'],explanation:'Add 25 and 13 to obtain 38 books.',modes:['quick','written'],source:'Original browser test'};
   await importData({questions:[imported]});await page.waitForFunction(()=>customPack.length===2);
   await importData('{invalid json','bad.json');assert(await page.locator('#pack-status.error').isVisible());assert.equal(await page.evaluate(()=>customPack.length),2,'invalid JSON leaves existing questions intact');
   await page.reload({waitUntil:'load'});assert.equal(await page.evaluate(()=>customPack.length),2,'custom questions persist after reload');
   await page.locator('#mode-written').click();await page.locator('#subject-focus').selectOption('math');await page.locator('#clock').selectOption('0');
   for(const value of ['guide','elementary','starter'])await page.locator('[data-question-source][value='+value+']').uncheck();
   await page.locator('[data-question-source][value=custom]').check();assert(await page.locator('#start').isEnabled());
   await page.locator('#start').click();const correct=await page.evaluate(()=>game.choices.indexOf(current().answer));await page.locator('#interaction .choice').nth(correct).click();assert.equal(await page.evaluate(()=>game.scores[0]),1,'custom questions play and grade correctly');
   await page.locator('#home-brand').click();await openPack();assert.match(await page.locator('#pack-list h3').innerText(),/2 \/ 500/);
   const builtinBefore=await page.evaluate(()=>SAMPLES.length);await page.locator('#pack-list .pack-row').first().getByRole('button',{name:'Remove',exact:true}).click();assert.equal(await page.evaluate(()=>customPack.length),1);
   assert.equal(await page.evaluate(()=>SAMPLES.length),builtinBefore,'custom removal never changes the built-in bank');
   await page.reload({waitUntil:'load'});assert.equal(await page.evaluate(()=>customPack.length),1,'custom removal persists');
   assert.deepEqual(errors,[],'no browser errors');console.log('PASS '+file+' '+(mobile?'phone':'desktop')+': add, duplicate-safe import, invalid JSON, export, reload, practice, remove, 500-question limit label and optional-tools navigation');
   await context.close();
  }
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
