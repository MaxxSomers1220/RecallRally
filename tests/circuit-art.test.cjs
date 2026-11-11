'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={SCIENCE_LAB_ART:{circuit:fs.readFileSync('assets/science-lab/circuit-constructor-chassis.svg','utf8')}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('src/science-lab-circuit.js','utf8')+'\nglobalThis.art=CircuitConstructorArt;',ctx);
for(let n=0;n<=5;n++){
 const svg=ctx.art.render(n,'experiment',n===5?'finale':'activate');
 assert(svg.includes('data-circuit-level="'+n+'"'));assert(!svg.includes('__CC__'));assert(!svg.includes('CIRCUIT_LAYERS'));
 assert.equal(svg.includes('data-circuit-closed="true"'),n===5);
 assert.equal(svg.includes('class="cc-current"'),n===5,'no current in an open or incomplete loop');
 assert.equal(svg.includes('cc-filament is-lit'),n===5,'no lamp light before the switch closes');
 assert.equal(svg.includes('--cc-needle:25deg'),n===5,'series ammeter reads zero until the loop closes');
 assert.equal(svg.includes('data-circuit-celebration="true"'),n===5);
 const ids=[...svg.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(ids.length,new Set(ids).size);for(const [,id] of svg.matchAll(/url\(#([^\)]+)\)/g))assert(ids.includes(id));
 if(n<5){const repair=ctx.art.render(n,'experiment','mishap',true);assert(repair.includes('data-circuit-repair="'+(n+1)+'"'));assert(!repair.includes('cc-filament is-lit'));assert(!repair.includes('class="cc-current"'));assert(ctx.art.nextAction(n,true).startsWith('Read the explanation'));}
}
for(const file of ['index.html','Ellery_Recall_Rally_Librarian_v4.html'])assert(fs.readFileSync(file,'utf8').includes(fs.readFileSync('src/science-lab-circuit.js','utf8').trim()));
for(const n of [-1,8,NaN,null,'4'])assert(!ctx.art.render(n).includes('NaN'));
assert(!ctx.art.render(3,'"><script>').includes('<script>'));
assert(!ctx.art.render(5,'hub').includes('cc-experiment-brass'));
console.log('PASS circuit: six assembly states, five repair targets, closed-loop-only light/current/ammeter, safe SVG references, embedded online/offline');
