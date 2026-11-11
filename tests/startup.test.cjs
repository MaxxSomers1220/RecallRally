'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('src/startup.js','utf8');
function boot(){
 const root={dataset:{}},warning={hidden:false};let timeout,cleared=false;
 const scope={document:{documentElement:root,getElementById:id=>{assert.equal(id,'startup-warning');return warning}},window:{},setTimeout:(fn,ms)=>{assert.equal(ms,20000);timeout=fn;return 1},clearTimeout:id=>{assert.equal(id,1);cleared=true}};
 vm.runInNewContext(source,scope);
 return{root,warning,api:scope.window.RallyStartup,delay:()=>timeout(),cleared:()=>cleared};
}
for(const order of [['coreReady','homeReady'],['homeReady','coreReady']]){
 const b=boot();assert.equal(b.root.dataset.rallyStartup,'starting');b.api[order[0]]();assert.equal(b.root.dataset.rallyStartup,'starting','Neither boot hook alone reveals uninitialized content');b.api[order[1]]();assert(!b.root.dataset.rallyStartup);assert(b.warning.hidden);assert(b.cleared());b.delay();assert(!b.root.dataset.rallyStartup,'A late recovery callback cannot cover a ready game');
}
const delayed=boot();delayed.delay();assert.equal(delayed.root.dataset.rallyStartup,'delayed');delayed.api.coreReady();assert.equal(delayed.root.dataset.rallyStartup,'delayed');delayed.api.homeReady();assert(!delayed.root.dataset.rallyStartup,'A slow connection can still finish without reloading');
for(const file of ['index.html','Ellery_Recall_Rally_Librarian_v4.html']){
 const html=fs.readFileSync(file,'utf8');assert(html.includes(source.trim()),file+' uses the early helper');assert(html.indexOf('id="rally-startup-script"')<html.indexOf('<body>'));assert.equal((html.match(/id="startup-loading"/g)||[]).length,1);assert(html.includes('class="startup-recovery"'));assert(html.includes('needs JavaScript'));assert(!html.includes('The interactive game has not started in this viewer.'));assert(html.includes('window.RallyStartup?.coreReady();'));assert(html.includes('window.RallyStartup?.homeReady();'));
 const scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)];for(const [i,m]of scripts.entries())new vm.Script(m[1],{filename:file+':script'+i});
}
const css=fs.readFileSync('src/startup.css','utf8');assert(css.includes('html[data-rally-startup] #play-area{display:none}'));assert(css.includes('#startup-loading{display:none}'),'No JavaScript leaves the readable original help/fallback accessible');
console.log('PASS startup waits for game + saved-home layout, honest delayed recovery, late completion, no viewer-warning flash, no-JS fallback and all scripts parse');
