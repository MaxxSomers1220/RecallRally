'use strict';
// Execute the repository's actual Amplify command list in an isolated staging
// directory, then play the resulting static site. Does not deploy anything.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http'),cp=require('node:child_process'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.join(__dirname,'..'),stage=fs.mkdtempSync(path.join(os.tmpdir(),'fizzwick-static-'));let server,browser;
(async()=>{try{
 for(const name of ['index.html','Ellery_Recall_Rally_Librarian_v4.html','src','scripts','tests','assets','librarian','data'])fs.cpSync(path.join(root,name),path.join(stage,name),{recursive:true});
 const spec=fs.readFileSync(path.join(root,'amplify.yml'),'utf8'),block=spec.match(/commands:\r?\n([\s\S]*?)^\s{2}artifacts:/m)?.[1];
 assert(block,'Expected a simple Amplify build command list');
 const lines=block.split(/\r?\n/).filter(s=>s.trim());assert(lines.every(s=>/^\s+- \S/.test(s)),'Use a YAML parser if build commands become multiline');
 for(const line of lines){const command=line.trim().slice(2),r=cp.spawnSync('bash',['-euo','pipefail','-c',command],{cwd:stage,encoding:'utf8'});if(r.status!==0)throw Error(command+' failed:\n'+r.stdout+r.stderr);console.log('PASS Amplify command:',command)}
 const publicRoot=path.join(stage,'dist');server=http.createServer((req,res)=>{const file=path.join(publicRoot,req.url==='/'?'index.html':req.url.split('?')[0]);if(!file.startsWith(publicRoot+path.sep)){res.writeHead(403).end();return}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(data)})});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const page=await browser.newPage({viewport:{width:1366,height:768},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});assert(await page.locator('#lib-launch').isVisible());await page.locator('#open-science-lab').click();await page.locator('[data-sl-station="circuit"]').click();await page.locator('#sl-open-model').click();
 for(const condition of [0,1]){await page.locator('[data-sl-condition="'+condition+'"]').click();await page.keyboard.press(String(condition+1));await page.locator('#sl-observe').click()}
 await page.locator('#sl-model-back').click();for(let i=0;i<5;i++){const k=await page.evaluate(()=>{const id=$('science-lab').querySelector('.sl-question').dataset.questionId,q=SAMPLES.find(q=>q.id===id);return [...$('science-lab').querySelectorAll('[data-sl-choice]>span')].findIndex(e=>e.textContent===q.answer)});await page.locator('[data-sl-choice="'+k+'"]').click();await page.locator('#sl-next').click()}
 assert.equal(await page.locator('.sl-stage .cc-machine').getAttribute('data-circuit-level'),'5');assert.equal(await page.locator('.sl-stage .cc-machine').getAttribute('data-circuit-closed'),'true');assert.equal(await page.locator('.sl-stage .cc-filament.is-lit').count(),1);
 assert(await page.locator('.sl-complete').isVisible());assert.equal(await page.evaluate(()=>RallyLearning.snapshot().attempts.filter(a=>a.mode==='science-lab').length),5);
 assert(await page.evaluate(()=>{const lab=JSON.parse(localStorage.getItem('recall-rally-sidequest-science-lab-v1:'+RallyLearning.activeProfile().id));return lab.data.notes.includes('circuit')&&lab.data.completed.includes('circuit')&&questProgress===0}));
 await page.locator('#sl-back-hub').click();await page.locator('[data-sl-station="potion"]').click();
 assert.equal(await page.locator('.sl-stage .pm-machine').getAttribute('data-potion-level'),'0');
 assert.equal(await page.locator('.sl-stage .pm-dispenser').count(),5);
 for(let i=0;i<5;i++){const k=await page.evaluate(()=>{const id=$('science-lab').querySelector('.sl-question').dataset.questionId,q=SAMPLES.find(q=>q.id===id);return [...$('science-lab').querySelectorAll('[data-sl-choice]>span')].findIndex(e=>e.textContent===q.answer)});await page.locator('[data-sl-choice="'+k+'"]').click();await page.locator('#sl-next').click()}
 assert.equal(await page.locator('.sl-stage .pm-machine').getAttribute('data-potion-level'),'5');assert(await page.locator('.sl-stage .pm-finale').count());
 await page.locator('#sl-back-hub').click();await page.locator('[data-sl-station="creature"]').click();
 assert.equal(await page.locator('.sl-stage .ci-machine').getAttribute('data-creature-level'),'0');
 for(let i=0;i<5;i++){const k=await page.evaluate(i=>{const id=$('science-lab').querySelector('.sl-question').dataset.questionId,q=SAMPLES.find(q=>q.id===id);return [...$('science-lab').querySelectorAll('[data-sl-choice]>span')].findIndex(e=>i===2?e.textContent!==q.answer:e.textContent===q.answer)},i);await page.locator('[data-sl-choice="'+k+'"]').click();if(i===2)assert.equal(await page.locator('[data-creature-repair="3"]').count(),1);await page.locator('#sl-next').click()}
 assert.equal(await page.locator('.sl-stage .ci-machine').getAttribute('data-creature-level'),'5');assert.equal(await page.locator('.sl-stage .ci-moonwing').getAttribute('data-moonwing-state'),'greeting');assert.match(await page.locator('.sl-complete').innerText(),/4 \/ 5 correct/);
 await page.locator('#sl-back-hub').click();await page.locator('[data-sl-station="weather"]').click();
 assert.equal(await page.locator('.sl-stage .wm-machine').getAttribute('data-weather-level'),'0');
 for(let i=0;i<5;i++){const k=await page.evaluate(i=>{const id=$('science-lab').querySelector('.sl-question').dataset.questionId,q=SAMPLES.find(q=>q.id===id);return [...$('science-lab').querySelectorAll('[data-sl-choice]>span')].findIndex(e=>i===2?e.textContent!==q.answer:e.textContent===q.answer)},i);await page.locator('[data-sl-choice="'+k+'"]').click();if(i===2)assert.equal(await page.locator('[data-weather-repair="3"]').count(),1);await page.locator('#sl-next').click()}
 assert.equal(await page.locator('.sl-stage .wm-machine').getAttribute('data-weather-level'),'5');assert.equal(await page.locator('[data-weather-celebration="true"]').count(),1);assert.match(await page.locator('.sl-complete').innerText(),/4 \/ 5 correct/);
 await page.locator('#sl-back-hub').click();await page.locator('[data-sl-station="observatory"]').click();
 assert.equal(await page.locator('.sl-stage .so-machine').getAttribute('data-observatory-level'),'0');
 for(let i=0;i<5;i++){const k=await page.evaluate(i=>{const id=$('science-lab').querySelector('.sl-question').dataset.questionId,q=SAMPLES.find(q=>q.id===id);return [...$('science-lab').querySelectorAll('[data-sl-choice]>span')].findIndex(e=>i===2?e.textContent!==q.answer:e.textContent===q.answer)},i);await page.locator('[data-sl-choice="'+k+'"]').click();if(i===2)assert.equal(await page.locator('[data-observatory-repair="3"]').count(),1);await page.locator('#sl-next').click()}
 assert.equal(await page.locator('.sl-stage .so-machine').getAttribute('data-observatory-level'),'5');assert.equal(await page.locator('[data-observatory-celebration="true"]').count(),1);assert.match(await page.locator('.sl-complete').innerText(),/4 \/ 5 correct/);
 assert.equal(await page.evaluate(()=>RallyLearning.snapshot().attempts.filter(a=>a.mode==='science-lab').length),25);
 // Play the real staged Librarian assets, not just its launch button.
 await page.locator('#sl-close').click();await page.locator('#lib-launch').click();
 const background=await page.locator('.lib-art-room').evaluate(e=>getComputedStyle(e).backgroundImage);
 assert(/assets\/image\.[a-f0-9]{64}\.webp/.test(background),'Hosted Librarian art uses the existing content-addressed static asset');
 assert((await page.request.get(new URL(background.match(/url\(["']?([^"')]+)/)[1],page.url()).href)).ok(),'Hosted background loads');
 assert.equal(await page.locator('.lib-guardian-art').count(),1);await page.locator('#lib-start').click();
 const wrong=await page.evaluate(()=>{const q=SAMPLES.find(q=>q.prompt===document.getElementById('lib-question').textContent);if(!q)throw Error('Expected real literature bank question');return [...document.querySelectorAll('.lib-choice')].findIndex(b=>b.lastElementChild.textContent!==q.answer)});
 await page.locator('.lib-choice').nth(wrong).click();await page.keyboard.down('ArrowDown');
 await page.waitForFunction(()=>document.getElementById('lib-overlay').dataset.scene==='storm');
 if(process.env.LIBRARIAN_SCREENSHOTS){await page.waitForTimeout(2600);fs.mkdirSync(process.env.LIBRARIAN_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.LIBRARIAN_SCREENSHOTS,'staged-book-storm.png')})}
 await page.waitForSelector('#lib-learn:not([hidden])',{timeout:25000});await page.keyboard.up('ArrowDown');assert(await page.locator('#lib-next').isVisible());assert.equal(await page.evaluate(()=>RallyLearning.snapshot().attempts.length),26);await page.locator('#lib-close').click();
 assert.deepEqual(errors,[]);console.log('PASS staged static site: Librarian, Circuit model/badge, illustrated Potion/Creature stages 0–5, creature mistake/repair, Weather and Observatory mistakes/repairs and finales, twenty-five journal answers, unchanged Rigby progress, illustrated Librarian real book storm/review and one honest journal answer');
}finally{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));fs.rmSync(stage,{recursive:true,force:true})}})().catch(e=>{console.error(e);process.exitCode=1});

