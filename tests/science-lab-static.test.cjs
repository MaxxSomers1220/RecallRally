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
 await page.locator('#sl-model-back').click();for(let i=0;i<5;i++){await page.locator('[data-sl-choice="0"]').click();await page.locator('#sl-next').click()}
 assert.equal(await page.locator('.sl-stage .cc-machine').getAttribute('data-circuit-level'),'5');assert.equal(await page.locator('.sl-stage .cc-machine').getAttribute('data-circuit-closed'),'true');assert.equal(await page.locator('.sl-stage .cc-filament.is-lit').count(),1);
 assert(await page.locator('.sl-complete').isVisible());assert.equal(await page.evaluate(()=>RallyLearning.snapshot().attempts.filter(a=>a.mode==='science-lab').length),5);
 assert(await page.evaluate(()=>{const lab=JSON.parse(localStorage.getItem('recall-rally-sidequest-science-lab-v1:'+RallyLearning.activeProfile().id));return lab.data.notes.includes('circuit')&&lab.data.completed.includes('circuit')&&questProgress===0}));
 await page.locator('#sl-back-hub').click();await page.locator('[data-sl-station="potion"]').click();
 assert.equal(await page.locator('.sl-stage .pm-machine').getAttribute('data-potion-level'),'0');
 assert.equal(await page.locator('.sl-stage .pm-dispenser').count(),5);
 for(let i=0;i<5;i++){const k=await page.evaluate(()=>{const id=$('science-lab').querySelector('.sl-question').dataset.questionId,q=SAMPLES.find(q=>q.id===id);return [...$('science-lab').querySelectorAll('[data-sl-choice]>span')].findIndex(e=>e.textContent===q.answer)});await page.locator('[data-sl-choice="'+k+'"]').click();await page.locator('#sl-next').click()}
 assert.equal(await page.locator('.sl-stage .pm-machine').getAttribute('data-potion-level'),'5');assert(await page.locator('.sl-stage .pm-finale').count());
 assert.equal(await page.evaluate(()=>RallyLearning.snapshot().attempts.filter(a=>a.mode==='science-lab').length),10);
 assert.deepEqual(errors,[]);console.log('PASS staged static site: Librarian, Circuit model/badge, illustrated Potion Mixer stages 0–5, ten journal answers, unchanged Rigby progress');
}finally{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));fs.rmSync(stage,{recursive:true,force:true})}})().catch(e=>{console.error(e);process.exitCode=1});

