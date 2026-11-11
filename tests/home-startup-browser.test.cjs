'use strict';
// Build first with scripts/build-standalone.cjs and scripts/build-hosted.cjs.
// Exercise the emitted site while its real deferred game script is unavailable.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const pw=require('playwright');

const root=path.join(__dirname,'..');
const html=path.resolve(process.env.HOME_STARTUP_HTML||path.join(root,'dist/index.html'));
const site=path.dirname(html);
const manifestFile=path.join(site,'hosted-build.json');
assert(fs.existsSync(html)&&fs.existsSync(manifestFile),'Build the hosted dist/ site before running startup browser checks');
const manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8'));
const gamePath='/'+manifest.routes.game;
assert.match(gamePath,/^\/assets\/game\.[a-f0-9]{64}\.js$/,'Hold the actual content-hashed game script');
const audioPaths=new Set(Object.entries(manifest.files).filter(([,entry])=>entry.mime.startsWith('audio/')).map(([file])=>'/'+file));
assert(audioPaths.size>0,'Hosted audio recordings are separate manifest assets');
for(const [file,entry] of Object.entries(manifest.files)){
 assert(fs.statSync(path.join(site,file)).isFile(),'Manifest asset exists: '+file);
 assert.equal(typeof entry.mime,'string','Manifest MIME type exists: '+file);
}

const engine=process.env.HOME_STARTUP_ENGINE||process.env.HOME_HUB_ENGINE||'chromium';
let server,browser,origin;
const contexts=[];
const mimeTypes={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav'};
const launchOptions=engine==='chromium'?{executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']}:{headless:true};

async function newPage(options={}){
 const context=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce',...options});
 contexts.push(context);
 const page=await context.newPage();
 page.setDefaultTimeout(15000);
 page.setDefaultNavigationTimeout(45000);
 const observed={audio:[],badResponses:[],errors:[]};
 page.on('request',request=>{
  const url=new URL(request.url());
  if(audioPaths.has(url.pathname)||request.resourceType()==='media')observed.audio.push(url.pathname);
 });
 page.on('response',response=>{
  const pathname=new URL(response.url()).pathname;
  const file=pathname.slice(1)||'index.html';
  const entry=manifest.files[file];
  if(response.status()>=400)observed.badResponses.push(pathname+': HTTP '+response.status());
  if(entry&&!response.headers()['content-type']?.startsWith(entry.mime))observed.badResponses.push(pathname+': incorrect MIME type');
 });
 page.on('pageerror',error=>observed.errors.push(error.message));
 // Record actual animation-frame observations, including the transition out of
 // the shell. Looking only after DOMContentLoaded would miss the original flash.
 await page.addInitScript(()=>{
  window.__startupFrames=[];
  let readyFrames=0;
  const visible=element=>!!element&&element.getClientRects().length>0&&getComputedStyle(element).visibility!=='hidden';
  function sample(){
   const home=document.getElementById('home-hero');
   const pending=document.documentElement.hasAttribute('data-rally-startup');
   const row={pending,loading:visible(document.getElementById('startup-loading')),homeVisible:visible(home),name:home?.textContent,hub:!!document.querySelector('.home-hub'),avatar:!!document.querySelector('#avatar-preview svg'),warning:visible(document.getElementById('startup-warning'))};
   window.__startupFrames.push(row);
   readyFrames=!pending&&row.homeVisible?readyFrames+1:0;
   if(readyFrames<3)requestAnimationFrame(sample);
  }
  requestAnimationFrame(sample);
 });
 return{page,context,observed};
}

async function holdGame(page){
 let release,arrived;
 const gate=new Promise(resolve=>{release=resolve});
 const requested=new Promise(resolve=>{arrived=resolve});
 const pattern=origin+gamePath;
 await page.route(pattern,async route=>{arrived();await gate;await route.continue()});
 return{requested,release,async dispose(){release();await page.unroute(pattern)}};
}

async function pendingShell(page,label){
 await page.locator('#startup-loading').waitFor({state:'visible'});
 assert(await page.locator('#play-area').isHidden(),label+': unfinished game content is hidden');
 assert(await page.locator('#home-hero').isHidden(),label+': default Ellery greeting is hidden');
 assert.equal(await page.locator('#home-hero').textContent(),'Ellery',label+': this is the original unhydrated greeting');
 assert(await page.locator('#startup-warning').isHidden(),label+': JavaScript fallback warning does not flash');
 assert(await page.locator('#runtime-status').isHidden(),label+': game is not prematurely marked ready');
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),label+': loading shell has no horizontal overflow');
 await page.evaluate(()=>new Promise(requestAnimationFrame));
 const frames=await page.evaluate(()=>window.__startupFrames);
 assert(frames.some(row=>row.pending&&row.loading),label+': loading shell was rendered');
 assert(!frames.some(row=>row.homeVisible||row.warning),label+': no unfinished hero or fallback warning was rendered');
}

async function readyHome(page,expectedName,label){
 await page.waitForFunction(()=>!document.documentElement.hasAttribute('data-rally-startup')&&typeof HomeHub!=='undefined'&&HomeHub.inspect().initialized);
 await page.locator('#home-view .home-hub').waitFor({state:'visible'});
 assert(await page.locator('#startup-loading').isHidden(),label+': startup shell closes');
 assert(await page.locator('#startup-warning').isHidden(),label+': fallback warning stays hidden');
 assert(await page.locator('#runtime-status').isVisible(),label+': game readiness is visible');
 assert.equal(await page.locator('#home-hero').textContent(),expectedName,label+': correct hero appears');
 assert.equal(await page.locator('#hero-name').inputValue(),expectedName,label+': name control is hydrated');
 assert.equal(await page.locator('.home-choice').count(),5,label+': all existing activities remain');
 await page.waitForFunction(()=>window.__startupFrames.filter(row=>!row.pending&&row.homeVisible).length>=3);
 const frames=await page.evaluate(()=>window.__startupFrames);
 assert(!frames.some(row=>row.pending&&row.homeVisible),label+': personalized content stays hidden until ready');
 assert(!frames.some(row=>row.homeVisible&&(!row.hub||!row.avatar||row.name!==expectedName)),label+': no wrong name, empty avatar, or previous layout was rendered');
 assert(!frames.some(row=>row.warning),label+': fallback warning was never painted');
 await page.waitForFunction(()=>[...document.querySelectorAll('.home-choice-art img')].length===5&&[...document.querySelectorAll('.home-choice-art img')].every(image=>image.complete&&image.naturalWidth>0));
}

function noAudio(observed,label){assert.deepEqual(observed.audio,[],label+': no audio HTTP requests before a real player gesture')}
function clean(observed,label){assert.deepEqual(observed.badResponses,[],label+': all requested emitted assets use valid MIME types and return successfully');assert.deepEqual(observed.errors,[],label+': no browser script errors')}

async function advanceRecovery(page){
 if(page.clock&&typeof page.clock.fastForward==='function')await page.clock.fastForward(20100);
 else await page.waitForTimeout(20100);
 await page.locator('html[data-rally-startup="delayed"]').waitFor();
 assert(await page.locator('#startup-loading .startup-recovery').isVisible(),'A long or failed load offers recovery');
 assert(await page.locator('#startup-loading .startup-progress').isHidden(),'Recovery replaces the initial progress message');
 assert(await page.locator('#startup-loading a').isVisible(),'Recovery offers a native reload link');
 assert(await page.locator('#play-area').isHidden(),'Recovery keeps unfinished personalized content hidden');
 assert(await page.locator('#startup-warning').isHidden(),'A JavaScript load failure does not claim the viewer disabled JavaScript');
}

(async()=>{
 try{
  server=http.createServer((request,response)=>{
   let pathname;
   try{pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname)}catch{response.writeHead(400).end();return}
   const relative=pathname==='/'?path.basename(html):pathname.replace(/^\/+/,''),file=path.resolve(site,relative);
   if(!file.startsWith(site+path.sep)){response.writeHead(403).end();return}
   fs.readFile(file,(error,bytes)=>{
    if(error){response.writeHead(404).end();return}
    response.setHeader('Content-Type',(manifest.files[relative]?.mime||mimeTypes[path.extname(file)]||'application/octet-stream')+(file.endsWith('.html')?'; charset=utf-8':''));
    response.setHeader('Cache-Control','no-store');
    response.end(bytes);
   });
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
  origin='http://127.0.0.1:'+server.address().port;
  browser=await pw[engine].launch(launchOptions);

  const fresh=await newPage(),page=fresh.page;
  let held=await holdGame(page);
  // Start navigation without waiting for deferred scripts; the shell must work
  // while the main request remains held and DOMContentLoaded cannot fire.
  let navigation=page.goto(origin,{waitUntil:'load'});
  navigation.catch(()=>{});
  await held.requested;
  await pendingShell(page,'cold startup');
  noAudio(fresh.observed,'held cold startup');
  held.release();
  await navigation;
  await held.dispose();
  await readyHome(page,'Ellery','fresh ready home');
  assert(await page.locator('#quest-home-continue').isHidden(),'Fresh profiles have no invented Continue');
  noAudio(fresh.observed,'fresh ready home');
  clean(fresh.observed,'fresh ready home');
  console.log('PASS held cold startup: neutral shell, no warning/default-layout flash, final home and zero audio requests before a gesture');

  // Seed an independent profile and custom appearance through the normal UI;
  // neither storage records nor progression are fabricated by this test.
  await page.locator('#open-learning').click();
  await page.locator('#learning-add-player').click();
  await page.locator('#learning-new-name').fill('Startup Reader');
  await page.locator('#learning-new-player button[type="submit"]').click();
  await page.locator('#learning-dialog [data-close]').click();
  await page.locator('#build-hero').click();
  await page.locator('#hero-model-panther').click();
  await page.locator('#creator-hero-name').fill('Startup Comet');
  await page.locator('[data-hero-key="skin"][data-hero-value="deep"]').click();
  await page.locator('[data-hero-tab="outfit"]').click();
  await page.locator('[data-hero-key="outfit"][data-hero-value="ranger"]').click();
  await page.locator('#hero-done').click();
  await page.locator('#quest-home-new').click();
  if(await page.locator('#hero-creator').isVisible())await page.locator('#hero-done').click();
  await page.locator('#adventure-panel').waitFor({state:'visible'});
  await page.locator('#home-brand').click();
  await page.locator('#quest-home-continue').waitFor({state:'visible'});
  const saved=await page.evaluate(()=>({profile:RallyLearning.activeProfile(),name:heroName,style:heroStyle,look:{...avatarLook},progress:questProgress}));
  assert.equal(saved.name,'Startup Comet');
  assert.equal(saved.profile.name,'Startup Reader');
  assert.equal(saved.look.skin,'deep');
  assert.equal(saved.look.outfit,'ranger');
  fresh.observed.audio.length=0;
  held=await holdGame(page);
  navigation=page.reload({waitUntil:'load'});
  navigation.catch(()=>{});
  await held.requested;
  await pendingShell(page,'saved-profile reload');
  noAudio(fresh.observed,'held saved-profile reload');
  held.release();
  await navigation;
  await held.dispose();
  await readyHome(page,saved.name,'saved-profile ready home');
  const restored=await page.evaluate(()=>({profile:RallyLearning.activeProfile(),name:heroName,style:heroStyle,look:{...avatarLook},progress:questProgress}));
  assert.deepEqual(restored,saved,'Ready home restores the active profile, custom hero, and saved quest together');
  assert.match(await page.locator('#quest-home-summary').textContent(),/Playing as Startup Reader/);
  assert.equal(await page.locator('#avatar-preview [data-hero-style]').getAttribute('data-hero-style'),saved.style);
  assert.equal(await page.locator('#avatar-preview [data-hero-outfit]').getAttribute('data-hero-outfit'),saved.look.outfit);
  noAudio(fresh.observed,'saved-profile ready home');
  await page.locator('#quest-home-continue').click();
  assert(await page.locator('#adventure-panel').isVisible(),'Continue opens the existing saved adventure');
  await page.locator('#home-brand').click();
  for(const mode of ['quick','written']){
   await page.locator('#mode-'+mode).click();
   assert(await page.locator('#setup-panel').isVisible(),mode+' setup remains usable');
   assert.equal(await page.evaluate(()=>document.activeElement.id),'setup-panel',mode+' still focuses its settings');
   await page.locator('#home-brand').click();
  }
  await page.locator('#open-science-lab').click();
  assert(await page.locator('#science-lab').isVisible(),'Science Lab remains usable');
  await page.locator('#sl-close').click();
  await page.locator('#lib-launch').click();
  assert(await page.locator('#lib-overlay').isVisible(),'The emitted Librarian module remains usable');
  await page.locator('#lib-close').click();
  clean(fresh.observed,'saved profile and existing controls');
  console.log('PASS held saved-profile reload: custom hero appears only after readiness; profile, Continue, Quick/Written, Lab and Librarian remain usable');

  const delayed=await newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  if(delayed.page.clock&&typeof delayed.page.clock.install==='function')await delayed.page.clock.install();
  const delayedHold=await holdGame(delayed.page);
  const delayedNavigation=delayed.page.goto(origin,{waitUntil:'load'});
  delayedNavigation.catch(()=>{});
  await delayedHold.requested;
  await pendingShell(delayed.page,'delayed startup');
  await advanceRecovery(delayed.page);
  noAudio(delayed.observed,'delayed startup recovery');
  delayedHold.release();
  await delayedNavigation;
  await delayedHold.dispose();
  await readyHome(delayed.page,'Ellery','late script completion');
  noAudio(delayed.observed,'late script completion');
  clean(delayed.observed,'late script completion');
  console.log('PASS delayed main script: visible reload recovery after 20 seconds, then correct final home when the script arrives');

  const failed=await newPage();
  if(failed.page.clock&&typeof failed.page.clock.install==='function')await failed.page.clock.install();
  await failed.page.route(origin+gamePath,route=>route.abort('failed'));
  await failed.page.goto(origin,{waitUntil:'load'});
  await pendingShell(failed.page,'failed main script');
  await advanceRecovery(failed.page);
  noAudio(failed.observed,'failed main script');
  await failed.page.unroute(origin+gamePath);
  // The existing Librarian may report its missing core after this deliberate
  // failure. The following real reload must complete without script errors.
  failed.observed.errors.length=0;
  await Promise.all([failed.page.waitForNavigation({waitUntil:'load'}),failed.page.locator('#startup-loading a').click()]);
  await readyHome(failed.page,'Ellery','recovery-link reload');
  noAudio(failed.observed,'recovery-link reload');
  clean(failed.observed,'recovery-link reload');
  console.log('PASS failed main script: honest delayed recovery and functional native reload link');

  const noJS=await newPage({javaScriptEnabled:false});
  await noJS.page.goto(origin,{waitUntil:'load'});
  assert(await noJS.page.locator('#startup-loading').isHidden(),'No-JavaScript mode does not become stuck behind the loading shell');
  assert(await noJS.page.locator('#play-area').isVisible(),'No-JavaScript fallback content remains readable');
  assert(await noJS.page.locator('#startup-warning').isVisible(),'No-JavaScript mode explains how to enable the game');
  assert.match(await noJS.page.locator('#startup-warning').textContent(),/needs JavaScript|JavaScript enabled/i);
  assert(await noJS.page.locator('#runtime-status').isHidden(),'No-JavaScript mode makes no readiness claim');
  noAudio(noJS.observed,'No-JavaScript fallback');
  clean(noJS.observed,'No-JavaScript fallback');
  console.log('PASS no-JavaScript fallback: readable help, explicit JavaScript requirement, no loading trap or false ready state');
 }finally{
  for(const context of contexts)await context.close().catch(()=>{});
  if(browser)await browser.close();
  if(server)await new Promise(resolve=>server.close(resolve));
 }
})().catch(error=>{console.error(error);process.exitCode=1});
