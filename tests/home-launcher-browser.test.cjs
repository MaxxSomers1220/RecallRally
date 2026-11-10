'use strict';
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.join(__dirname,'..');
let server,browser;
(async()=>{
 const errors=[];
 try{
  server=http.createServer((req,res)=>{
   const pathname=(req.url||'/').split('?')[0];
   const file=path.join(root,pathname==='/'?'Ellery_Recall_Rally_Librarian_v4.html':pathname.replace(/^\//,''));
   if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
   fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type','text/html; charset=utf-8');res.end(data)});
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const url='http://127.0.0.1:'+server.address().port+'/';
  const page=await browser.newPage({viewport:{width:1366,height:768},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url,{waitUntil:'domcontentloaded'});
  assert(await page.locator('#runtime-status').isVisible(),'Complete game boots');
  assert.equal(await page.locator('.home-activity-grid .home-choice').count(),5,'All five activities appear on home');
  assert(await page.locator('#lib-launch').isEnabled(),'The Librarian becomes playable');
  assert.notEqual(await page.locator('#lib-launch').evaluate(el=>getComputedStyle(el).position),'fixed','The Librarian is not a floating overlay');
  assert(await page.locator('#setup-panel').isHidden(),'Setup remains tucked away initially');
  await page.locator('#mode-quick').click();
  assert(await page.locator('#setup-panel').isVisible(),'Quick Recall expands settings');
  assert(await page.locator('#home-brand .brand-destination').isVisible(),'Main menu destination is visible');
  await page.evaluate(()=>{mode='quick';$('clock').value='0';startRound([SAMPLES[0]])});
  await page.getByRole('button',{name:'Recall Rally — Main menu',exact:true}).click();
  assert(await page.locator('.home-activities').isVisible(),'Main menu skips summary during active practice');
  assert(await page.locator('#game-view').isHidden(),'Practice is closed');
  assert(await page.locator('#summary-view').isHidden(),'Summary does not intercept menu navigation');
  await page.locator('#mode-quick').click();
  await page.locator('#mode-written').click();
  assert.equal(await page.locator('#mode-written').getAttribute('aria-pressed'),'true','Written Practice is selected');
  await page.locator('#open-science-lab').click();
  assert(await page.locator('#science-lab').isVisible(),'Science Lab launches from home');
  await page.locator('#sl-close').click();
  await page.locator('#lib-launch').click();
  assert(await page.locator('#lib-overlay').isVisible(),'The Librarian launches from home');
  await page.locator('#lib-close').click();
  await page.locator('#mode-adventure').click();
  if(await page.locator('#hero-creator').isVisible())await page.locator('#hero-close').click();
  assert(await page.locator('#adventure-panel').isVisible(),'Rescue Rigby map opens');
  assert(await page.locator('.home-activities').isHidden(),'Home launcher is not over the map');
  await page.locator('#home-brand').click();
  assert(await page.locator('.home-activities').isVisible(),'Home returns to five-game chooser');
  assert(await page.locator('#setup-panel').isHidden(),'Home returns to uncluttered layout');
  const phone=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  phone.on('pageerror',e=>errors.push(e.message));
  await phone.goto(url,{waitUntil:'domcontentloaded'});
  assert.equal(await phone.locator('.home-choice').count(),5);
  assert(await phone.locator('#home-brand .brand-destination').isVisible(),'Main menu label stays visible on phones');
  assert((await phone.locator('#home-brand').boundingBox()).height>=44,'Menu button is touch sized');
  assert(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Phone has no horizontal overflow');
  const heights=await phone.locator('.home-choice').evaluateAll(els=>els.map(e=>e.getBoundingClientRect().height));
  assert(heights.every(h=>h>=44),'Game choices are touch sized');
  await phone.locator('#open-science-lab').tap();
  assert(await phone.locator('#science-lab').isVisible(),'Science Lab works on touch');
  await phone.locator('#sl-close').tap();
  assert.deepEqual(errors,[],'No JavaScript errors');
  console.log('PASS desktop + phone five-choice homepage, Quick/Written/Adventure routing, Science Lab, Librarian, return home, responsive touch');
 } finally{
  if(browser)await browser.close();
  if(server)await new Promise(resolve=>server.close(resolve));
 }
})().catch(err=>{console.error(err);process.exitCode=1});
