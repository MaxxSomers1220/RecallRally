'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={SCIENCE_LAB_ART:{observatory:fs.readFileSync('assets/science-lab/star-observatory-chassis.svg','utf8')}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('src/science-lab-observatory.js','utf8')+'\nglobalThis.art=StarObservatoryArt;',ctx);
for(let n=0;n<=5;n++){
 const svg=ctx.art.render(n,'experiment',n===5?'finale':'activate');assert(svg.includes('data-observatory-level="'+n+'"'));assert(!svg.includes('__SO__'));
 assert.equal((svg.match(/data-control-state="ready"/g)||[]).length,n);assert.equal((svg.match(/data-observatory-control=/g)||[]).length,5);assert.equal(svg.includes('data-observatory-celebration="true"'),n===5);
 assert.equal((svg.match(/data-star=/g)||[]).length,[0,3,7,10,14,14][n]);assert.equal(svg.includes('so-lens-glint'),n>=4);assert(svg.includes('data-telescope-angle=\"'+[-6,-10,-18,-24,-28,-28][n]+'\"'));
 const ids=[...svg.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(ids.length,new Set(ids).size);for(const [,id] of svg.matchAll(/url\(#([^\)]+)\)/g))assert(ids.includes(id));
 if(n<5){const repair=ctx.art.render(n,'experiment','mishap',true);assert(repair.includes('data-observatory-repair="'+(n+1)+'"'));assert(repair.includes('sl-mishap-observatory'));assert(!repair.includes('data-observatory-celebration'));assert(ctx.art.nextAction(n,true).startsWith('Read the explanation'));}
}
for(const file of ['index.html','Ellery_Recall_Rally_Librarian_v4.html'])assert(fs.readFileSync(file,'utf8').includes(fs.readFileSync('src/science-lab-observatory.js','utf8').trim()));
for(const n of [-1,8,NaN,null,'4'])assert(!ctx.art.render(n).includes('NaN'));assert(!ctx.art.render(3,'"><script>').includes('<script>'));
console.log('PASS observatory: six states, five distinct repairs, scientific thresholds, final-only celebration, safe SVG references, online/offline embedding');
