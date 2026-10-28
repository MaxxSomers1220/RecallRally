'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.join(__dirname,'..'),screens=process.env.SCIENCE_LAB_SCREENSHOTS;
let browser,server,page;const errors=[];
const journal=()=>page.evaluate(()=>RallyLearning.snapshot().attempts.filter(a=>a.mode==='science-lab'));
function contrast(a,b){const lum=s=>{const c=s.match(/[\d.]+/g).slice(0,3).map(x=>{const v=Number(x)/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return c[0]*.2126+c[1]*.7152+c[2]*.0722};return(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05)}
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
  const colors=await page.evaluate(()=>({fg:getComputedStyle(document.querySelector('.sl-model .sl-source summary')).color,bg:getComputedStyle(document.getElementById('science-lab')).backgroundColor}));assert(contrast(colors.fg,colors.bg)>=4.5,'readable model-source contrast');
  await page.locator('[data-sl-condition="0"]').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.dataset.slCondition),'0');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.dataset.slCondition),'1');
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
 const notes=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('recall-rally-sidequest-science-lab-v1:'+RallyLearning.activeProfile().id)).data);
 assert.equal((await notes()).notes.length,5);await page.locator('#sl-notebook').click();assert.equal(await page.locator('.sl-notebook article').count(),5);assert.equal(await page.locator('.sl-notebook article .sl-source').count(),5);await page.locator('#sl-notebook-back').click();
 for(const id of ['potion','circuit','creature','weather','observatory']){
  await page.locator('[data-sl-station="'+id+'"]').click();
  for(let i=0;i<5;i++){
   const id=await page.locator('.sl-question').getAttribute('data-question-id'),answer=await page.evaluate(id=>SAMPLES.find(q=>q.id===id).answer,id),choices=await page.locator('[data-sl-choice]>span').allTextContents();
   await page.keyboard.press(String(choices.findIndex(v=>i===0?v!==answer:v===answer)+1));await page.locator('#sl-next').click();
  }
  if(id==='observatory'){await page.locator('#sl-light-prism').click();assert(await page.locator('.sl-finale').isVisible());assert.equal(await page.locator('.sl-finale-badges li').count(),5);if(screens)await page.screenshot({path:path.join(screens,'prism-ending.png')});await page.locator('#sl-finale-hub').click()}
  else {await page.locator('#sl-open-model').click();await page.locator('#sl-model-back').click();assert(await page.locator('.sl-complete').isVisible(),'model can return to a completed experiment');await page.locator('#sl-back-hub').click()}
 }
 assert.equal((await notes()).prismLit,true);assert.equal((await notes()).completed.length,5);await page.reload({waitUntil:'domcontentloaded'});await page.locator('#open-science-lab').click();assert.equal((await notes()).notes.length,5);assert.equal((await notes()).prismLit,true);assert.match(await page.locator('.sl-discovery-shelf').innerText(),/Prism is yours/);
 assert.deepEqual(errors,[]);console.log('PASS five saved field notes, mistakes in every station, Prism ending and reload without replaying the finale');
 for(const [width,height] of [[1366,768],[1024,768],[820,1180],[390,844]]){
  await page.setViewportSize({width,height});await page.locator('[data-sl-station="observatory"]').click();await page.locator('#sl-open-model').click();await page.locator('[data-sl-condition="1"]').click();await page.keyboard.press('2');await page.locator('#sl-observe').click();
  assert(!(await page.evaluate(()=>document.getElementById('science-lab').scrollWidth>document.getElementById('science-lab').clientWidth+1)));
  if(width===390){const r=await page.locator('#sl-model-result').boundingBox();assert(r.y>=0&&r.y+r.height<=height,'phone brings the observation into view')}
  if(screens)await page.screenshot({path:path.join(screens,'model-layout-'+width+'x'+height+'.png')});
  await page.locator('#sl-model-back').scrollIntoViewIfNeeded();assert(await page.locator('#sl-model-back').isVisible());await page.locator('#sl-model-back').click();await page.locator('#sl-hub').click();
 }
 await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.getElementById('science-lab').open&&document.activeElement.id==='open-science-lab');
 assert.deepEqual(errors,[]);console.log('PASS keyboard condition focus, completed-model return, four model layouts and Escape focus restoration');
 const firstProfile=await page.evaluate(()=>RallyLearning.activeProfile().id);
 await page.locator('#open-learning').click();await page.locator('#learning-add-player').click();await page.locator('#learning-new-name').fill('Workshop partner');await page.locator('#learning-new-player button[type="submit"]').click();await page.locator('#learning-dialog [data-close]').click();
 await page.locator('#open-science-lab').click();assert.match(await page.locator('#sl-notebook').textContent(),/0 \/ 5/);assert.match(await page.locator('.sl-discovery-shelf').innerText(),/0 \/ 5/);await page.locator('#sl-close').click();
 await page.locator('#open-learning').click();await page.locator('#learning-profile').selectOption(firstProfile);await page.locator('#learning-dialog [data-close]').click();await page.locator('#open-science-lab').click();assert.equal((await notes()).notes.length,5);assert.equal((await notes()).prismLit,true);
 assert.deepEqual(errors,[]);console.log('PASS saved notebook and Prism celebration are separate for each player; model sources meet 4.5:1 contrast');
}finally{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r))}})().catch(e=>{console.error(e);process.exitCode=1});
