'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={SCIENCE_LAB_ART:{potion:fs.readFileSync('assets/science-lab/potion-mixer-chassis.svg','utf8')}};
vm.createContext(context);vm.runInContext(fs.readFileSync('src/science-lab-potion.js','utf8')+'\nglobalThis.art=PotionMixerArt;',context);
const render=context.art.render;
for(let n=0;n<=5;n++){
 const svg=render(n,'unit-'+n,n===5?'finale':n?'activate':'');
 assert(svg.includes('data-potion-level="'+n+'"'));
 assert.equal((svg.match(/data-dispenser="/g)||[]).length,5);
 assert.equal((svg.match(/class="pm-dispenser is-powered/g)||[]).length,n);
 assert.equal(new Set([...svg.matchAll(/data-vessel-shape="([^"]+)"/g)].map(m=>m[1])).size,5);
 assert.equal((svg.match(/data-flow="/g)||[]).length,n?1:0,'only the newest repaired dispenser pours');
 if(n)assert(svg.includes('data-flow="'+n+'"'));
 assert.equal(svg.includes('class="pm-swirl"'),n>=3);
 assert.equal(svg.includes('class="pm-drive is-running"'),n>=4);
 assert.equal(svg.includes('data-potion-celebration="true"'),n===5);
 const ids=[...svg.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'no duplicate SVG resource IDs');
 for(const m of svg.matchAll(/url\(#([^)]+)\)/g))assert(ids.includes(m[1]),'resolved local paint/clip reference: '+m[1]);
 assert(!/__PM__|POTION_LAYERS|NaN|undefined|<script|<foreignObject|(?:href|src)=["']https?:/i.test(svg));
}
assert.notEqual(render(2,'hub'),render(2,'experiment'),'each rendering context has separate gradient/clip IDs');
assert(render(2,'experiment','mishap',true).includes('pm-needs-repair'));
assert(render(3,'experiment','repair').includes('data-potion-cue="repair"'));
for(const bad of [-1,6,NaN,null,'4'])assert(!render(bad).includes('data-potion-level="NaN"'));
const html=fs.readFileSync('index.html','utf8'),offline=fs.readFileSync('Ellery_Recall_Rally_Librarian_v4.html','utf8');
assert(html.includes(fs.readFileSync('src/science-lab-potion.js','utf8').trim()));
assert(offline.includes(fs.readFileSync('src/science-lab-potion.js','utf8').trim()));
const css=fs.readFileSync('src/science-lab.css','utf8');assert(css.includes('@keyframes pm-fill')&&css.includes('@keyframes pm-oops')&&css.includes('prefers-reduced-motion:reduce'));
console.log('PASS six potion states, five distinct vessels, one ingredient per repair, bubbles/drive/finale thresholds, safe SVG IDs, offline integration');
