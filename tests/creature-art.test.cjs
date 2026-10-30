'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={SCIENCE_LAB_ART:{creature:fs.readFileSync('assets/science-lab/creature-incubator-chassis.svg','utf8')}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('src/science-lab-creature.js','utf8')+'\nglobalThis.art=CreatureIncubatorArt;',ctx);
for(let n=0;n<=5;n++){
 const svg=ctx.art.render(n,'experiment',n===5?'finale':'activate');
 assert(svg.includes('data-creature-level="'+n+'"'));assert(!svg.includes('__CI__'));assert(!svg.includes('CREATURE_LAYERS'));
 assert.equal((svg.match(/data-control-state="balanced"/g)||[]).length,n);assert.equal((svg.match(/data-creature-control=/g)||[]).length,5);
 assert.equal(svg.includes('data-creature-celebration="true"'),n===5,'no reveal until five steps are repaired');
 assert.equal(svg.includes('ci-fan is-turning'),n>=1);assert.equal(svg.includes('ci-cocoon is-wiggling'),n>=2&&n<4);assert.equal(svg.includes('class="ci-moonwing'),n>=3);
 if(n>=3)assert(svg.includes('data-moonwing-state="'+(n===3?'peek':n===4?'stretch':'greeting')+'"'));
 const ids=[...svg.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(ids.length,new Set(ids).size);for(const [,id] of svg.matchAll(/url\(#([^\)]+)\)/g))assert(ids.includes(id));
 if(n<5){const repair=ctx.art.render(n,'experiment','mishap',true);assert(repair.includes('data-creature-repair="'+(n+1)+'"'));assert(repair.includes('sl-mishap-creature'));assert.equal((repair.match(/ci-confetti-piece/g)||[]).length,12);assert(!repair.includes('data-creature-celebration'));assert(ctx.art.nextAction(n,true).startsWith('Read the explanation'));if(n>=3)assert(repair.includes('data-moonwing-state="sneezing"'));}
}
for(const file of ['index.html','Ellery_Recall_Rally_Librarian_v4.html'])assert(fs.readFileSync(file,'utf8').includes(fs.readFileSync('src/science-lab-creature.js','utf8').trim()));
for(const n of [-1,8,NaN,null,'4'])assert(!ctx.art.render(n).includes('NaN'));
assert(!ctx.art.render(3,'"><script>').includes('<script>'));
console.log('PASS creature: six habitat states, five independent repairs, pre-reveal movement, expressive Moonwing, bounded confetti, safe SVG references, embedded online/offline');
