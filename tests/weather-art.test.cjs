'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={SCIENCE_LAB_ART:{weather:fs.readFileSync('assets/science-lab/weather-machine-chassis.svg','utf8')}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('src/science-lab-weather.js','utf8')+'\nglobalThis.art=WeatherMachineArt;',ctx);
for(let n=0;n<=5;n++){
 const svg=ctx.art.render(n,'experiment',n===5?'finale':'activate');assert(svg.includes('data-weather-level="'+n+'"'));assert(!svg.includes('__WM__'));
 assert.equal((svg.match(/data-control-state="ready"/g)||[]).length,n);assert.equal((svg.match(/data-weather-control=/g)||[]).length,5);assert.equal(svg.includes('data-weather-celebration="true"'),n===5);
 assert.equal(svg.includes('wm-cloud\"'),n>=3);assert.equal(svg.includes('data-weather-rain=\"liquid\"'),n>=4);assert.equal(svg.includes('wm-pump is-running'),n>=1);assert.equal((svg.match(/wm-rainbow-band/g)||[]).length,n===5?7:0);
 const ids=[...svg.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(ids.length,new Set(ids).size);for(const [,id] of svg.matchAll(/url\(#([^\)]+)\)/g))assert(ids.includes(id));
 if(n<5){const repair=ctx.art.render(n,'experiment','mishap',true);assert(repair.includes('data-weather-repair="'+(n+1)+'"'));assert(repair.includes('sl-mishap-weather'));assert(!repair.includes('data-weather-celebration'));assert(ctx.art.nextAction(n,true).startsWith('Read the explanation'));}
}
for(const file of ['index.html','Ellery_Recall_Rally_Librarian_v4.html'])assert(fs.readFileSync(file,'utf8').includes(fs.readFileSync('src/science-lab-weather.js','utf8').trim()));
for(const n of [-1,8,NaN,null,'4'])assert(!ctx.art.render(n).includes('NaN'));assert(!ctx.art.render(3,'"><script>').includes('<script>'));
console.log('PASS weather: six states, five distinct repairs, scientific thresholds, final-only celebration, safe SVG references, online/offline embedding');
