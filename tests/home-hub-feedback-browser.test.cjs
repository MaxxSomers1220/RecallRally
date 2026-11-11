'use strict';
// Native pointer checks use fresh contexts, before screenshots or viewport emulation changes.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http'),assert=require('node:assert/strict'),pw=require('playwright');
const root=path.join(__dirname,'..'),html=path.resolve(process.env.HOME_HUB_HTML||path.join(root,'Ellery_Recall_Rally_Librarian_v4.html')),engine=process.env.HOME_HUB_ENGINE||'chromium';
const report=path.join(process.env.HOME_HUB_REPORT||path.join(os.tmpdir(),'recall-home-feedback'),'feedback');
const views=[['laptop',1366,768],['tablet-landscape',1024,768],['tablet-portrait',820,1180],['small-phone',375,667],['modern-phone',393,852],['phone-landscape',667,375],['ipad-split',507,768],['narrow',320,768]].filter(v=>!process.env.HOME_HUB_FEEDBACK_VIEWS||process.env.HOME_HUB_FEEDBACK_VIEWS.split(',').includes(v[0]));
// Resolve the rendered color/opacity and both ends of the actual painted card gradient.
const contrasts=elements=>elements.map(card=>{
 const style=getComputedStyle(card.querySelector('small')),rgb=value=>value.match(/[\d.]+/g).map(Number),foreground=rgb(style.color),opacity=Number(style.opacity)*(foreground[3]??1);
 const backgrounds=[...getComputedStyle(card).backgroundImage.matchAll(/rgba?\(([^)]+)\)/g)].map(m=>rgb(m[0]));
 const luminance=color=>color.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
 const ratios=backgrounds.map(bg=>{const blended=foreground.slice(0,3).map((v,i)=>v*opacity+bg[i]*(1-opacity)),a=luminance(bg),b=luminance(blended);return(Math.max(a,b)+.05)/(Math.min(a,b)+.05)});
 return{id:card.id,ratio:ratios.length?Math.min(...ratios):0};
});
let browser,server;
(async()=>{try{
 fs.mkdirSync(report,{recursive:true});server=http.createServer((q,r)=>{const file=q.url==='/'?html:path.join(path.dirname(html),q.url.split('?')[0]);if(!fs.existsSync(file)){r.writeHead(404).end();return}r.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.mp3':'audio/mpeg','.json':'application/json'})[path.extname(file)]||'application/octet-stream');r.end(fs.readFileSync(file))});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await pw[engine].launch(engine==='chromium'?{executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']}:{});
 const results=[],errors=[];
 for(const [name,width,height]of views){
  const touch=name!=='laptop',context=await browser.newContext({viewport:{width,height},hasTouch:touch,isMobile:touch}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>HomeHub.inspect().initialized);await page.waitForFunction(()=>!document.getElementById('lib-launch').disabled);
  const rowErrors=errors.length,row={name,engine,contrasts:await page.locator('.home-choice').evaluateAll(contrasts)};
  assert.equal(row.contrasts.length,5);for(const c of row.contrasts)if(c.ratio<4.5)errors.push(name+': '+c.id+' contrast '+c.ratio+' < 4.5');
  if(touch){
   assert(await page.evaluate(()=>matchMedia('(pointer:coarse)').matches&&!matchMedia('(hover:hover)').matches),'fresh touch context must have coarse pointer and no hover');
   row.taps=[];for(const mode of ['quick','written']){
    await page.locator('#mode-'+mode).tap();await page.waitForTimeout(300);
    const state=await page.locator('#mode-'+mode).evaluate(e=>({mode:e.id,transform:getComputedStyle(e).transform,pressed:e.getAttribute('aria-pressed'),shadow:getComputedStyle(e).boxShadow}));row.taps.push(state);
    if(state.transform!=='none')errors.push(name+': native tap retained movement '+state.transform);
    assert.equal(state.pressed,'true');assert.notEqual(state.shadow,'none','selected-state ring remains');await page.locator('#home-brand').tap();
   }
  }else{
   await page.locator('#mode-quick').hover();await page.waitForFunction(()=>getComputedStyle(document.getElementById('mode-quick')).transform!=='none');row.mouseHover=await page.locator('#mode-quick').evaluate(e=>getComputedStyle(e).transform);
   await page.locator('#mode-written').focus();await page.keyboard.press('Enter');await page.waitForTimeout(300);assert.equal(await page.locator('#mode-written').getAttribute('aria-pressed'),'true');assert.equal(await page.evaluate(()=>document.activeElement.id),'setup-panel');await page.locator('#home-brand').click();
   await page.locator('#mode-quick').focus();await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.activeElement.matches(':focus-visible')),'keyboard focus remains visible');
  }
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>!HeroMotion.inspect().scheduled);assert.equal(await page.locator('.home-hub').evaluate(e=>getComputedStyle(e,'::after').animationName),'none');
  assert(await page.locator('.home-choice').evaluateAll(es=>es.every(e=>getComputedStyle(e).transform==='none')),'reduced motion suppresses card lift');
  await page.screenshot({path:path.join(report,engine+'-'+name+'.jpg'),type:'jpeg',quality:85,scale:'css',fullPage:true});results.push(row);await context.close();console.log((errors.length===rowErrors?'PASS ':'FAIL ')+engine+' '+name+': description contrast, native pointer feedback, selection and reduced motion');
 }
 fs.writeFileSync(path.join(report,engine+'-results.json'),JSON.stringify({engine,version:browser.version(),method:'Desktop browser with stated viewport/touch configuration. No physical-device claim.',results,errors},null,2));assert.deepEqual(errors,[]);
}finally{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r))}})().catch(e=>{console.error(e);process.exitCode=1});
