'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const offline=fs.readFileSync(path.join(root,'Ellery_Recall_Rally_Librarian_v4.html'),'utf8');
const libJs=fs.readFileSync(path.join(root,'librarian/librarian.js'),'utf8');
const libCss=fs.readFileSync(path.join(root,'librarian/librarian.css'),'utf8');
const activities=['mode-quick','mode-written','mode-adventure','lib-launch','open-science-lab'];
for(const id of activities){
  assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,'One main-menu choice for '+id);
  assert(offline.includes('id="'+id+'"'),'Offline game includes '+id);
}
assert(html.includes('class="home-activities"'),'The main menu is present');
assert(html.includes('id="quest-home-continue"')&&html.includes('id="quest-home-new"'),'Adventure resume and new-run controls remain');
assert(html.includes('id="build-hero"')&&html.includes('id="open-learning"'),'Hero creator and learning journal remain');
assert(html.includes('id="setup-panel"')&&html.includes('id="adventure-panel"'),'Original practice and adventure destinations remain');
assert(html.includes("#home-view:not(.home-choice-open) .setup-card{display:none}"),'Detailed practice controls start closed');
assert(html.includes("#home-view.adventure-active .home-activities{display:none!important}"),'Main choices do not overlap adventure');
assert(html.includes("classList.add('home-choice-open')"),'Selecting a practice mode expands its settings');
assert(html.includes("classList.remove('home-choice-open')"),'Returning home restores the simplified menu');
assert(libJs.includes("document.getElementById('lib-launch')"),'The Librarian reuses its homepage choice');
assert(libJs.includes("entry.disabled=false"),'The Librarian becomes available when its script loads');
assert(libCss.includes('body > #lib-launch{position:fixed'),'Fallback floating launcher only when homepage button is absent');
assert(!libCss.includes('\n#lib-launch{position:fixed'),'Main-menu Librarian card is not fixed');
new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1],{filename:'index.html'});
new vm.Script(libJs,{filename:'librarian.js'});
console.log('PASS five distinct home choices, functional launch hooks, hidden advanced setup, persistent quest tools, non-floating Librarian, and scripts parse');
