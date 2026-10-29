'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8'),source=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const bank=source.slice(source.indexOf('const SAMPLE_ROWS='),source.indexOf('// Storage is optional.'));
const ctx={assert,console};vm.createContext(ctx);
vm.runInContext(bank+'\n'+fs.readFileSync('src/answer-recognition.js','utf8')+'\nglobalThis.bank=SAMPLES;globalThis.evaluate=RallyAnswers.evaluate',ctx);
const question=(answer,options=[],aliases=[],subject='science')=>({answer,options,aliases,subject});
function check(raw,q,want,bank=ctx.bank){const r=ctx.evaluate(raw,q,bank);assert.equal(r.confidence,want,raw+' -> '+q.answer+': '+JSON.stringify(r));return r;}
for(const q of ctx.bank)for(const a of [q.answer,...q.aliases||[]])check(a,q,'high');
check('  GEORGE WASHINGTON!!! ',question('George Washington'),'high');
check('E. B. White',question('E B White'),'high');
check('CARBON MONOXIDE',question('carbon monoxide',[],['CO']),'high');
check('Co',question('carbon monoxide',[],['CO']),'low');
check('photosyntheiss',question('photosynthesis'),'high');
check('photosyntesis',question('photosynthesis'),'intermediate');
check('oxegen',question('oxygen',['carbon dioxide','nitrogen','helium']),'intermediate');
check('mitosis',question('meiosis',['mitosis','respiration','digestion']),'low');
check('meiosis',question('mitosis'), 'low'); // Competing term elsewhere in the real bank.
check('horse',question('house'), 'low',[question('horse')]);
check('fusion',question('fission',['fusion','friction','inertia']),'low');
for(const [a,b] of [['14','41'],['-5','5'],['1.5','15'],['1/2','12'],['10 m','10 cm'],['10 M','10 m'],['50%','50'],['H2O','H2O2'],['Co','CO'],['No','NO'],['m','M'],['less than','more than'],['water','not water'],['twelve','twenty'],['twleve','twelve']])check(a,question(b),'low');
check('an ocelot',question('ocelot',[],['an ocelot']),'high');
check('<img src=x>',question('oxygen'),'low');
check('wrong answer entirely',question('photosynthesis'),'low');
// Custom bank changes are reflected immediately; no stale academic vocabulary cache.
check('horse',question('house'),'intermediate',[]);
check('horse',question('house'),'low',[question('horse')]);
console.log('PASS exact answers/aliases for all 1,550 questions; spelling tiers; academic terms, numbers, units, formulas, negation, custom-bank refresh');
