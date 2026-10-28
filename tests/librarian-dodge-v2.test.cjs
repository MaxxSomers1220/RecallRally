'use strict';
/* Replays the actual Librarian code with a lightweight mock DOM.
   Focus: question -> miss -> tell -> dodge/dash -> reveal -> next. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync(path.join(__dirname,'../librarian/librarian.js'),'utf8');
const code=src.replace(/\}\)\(\);\s*$/,`window.__test={open,close,start,buzz,answer,pass,next,tick,dash,jump,useShield,get phase(){return phase},get question(){return question},get round(){return round},get lives(){return lives},get warnings(){return warnings.length},get books(){return books.length},get hero(){return hero},setLives(n){lives=n}};})();`);
assert.notEqual(code,src,'instrumented test entry point');
const nodes=new Map(),rootChildren=[];
let created=0,heroLook=null,loopCount=0,listenerCount=0;
const stage={appendChild(node){rootChildren.push(node);}};
const context2d={addColorStop(){}};
const drawContext=new Proxy({},{
 get(target,key){if(key==='createLinearGradient'||key==='createRadialGradient')return()=>context2d;return()=>{};},
 set(target,key,val){target[key]=val;return true;}
});
function el(id){
 if(!nodes.has(id))nodes.set(id,{
  id,hidden:false,value:'',textContent:'',innerHTML:'',dataset:{},style:{},parentElement:stage,
  setAttribute(){},addEventListener(type,fn){this['on_'+type]=fn;},focus(){},remove(){},
  getContext(){return drawContext;},querySelector(sel){return el(sel.replace(/^#/,''));}
 });
 return nodes.get(id);
}
const document={
 body:{appendChild(node){rootChildren.push(node);}},
 createElement(tag){return el('made-'+tag+'-'+(++created));},
 addEventListener(){listenerCount++;},removeEventListener(){listenerCount--;},
 activeElement:null,hidden:false
};
const savedAppearance={face:'warm-skin',hood:'panther',magicColor:'violet'};
const window={};
function FakeImage(){this.complete=false;this.naturalWidth=0;}
function renderGameHero(look,options){heroLook=look;return '<g data-pose="'+options.pose+'" data-hero-face="'+look.face+'"></g>';}
const context={window,document,Image:FakeImage,renderGameHero,avatarLook:savedAppearance,
 requestAnimationFrame(){loopCount++;return loopCount;},cancelAnimationFrame(){},
 performance:{now(){return 100;}},localStorage:{getItem(){return '{}';},setItem(){}},
 console:{warn(){},log(){}},Math,Set};
vm.runInNewContext(code,context,{timeout:2500});
vm.runInNewContext(code,context,{timeout:2500});
assert.equal(rootChildren.length,1,'second boot must not create duplicate button');
assert.equal(rootChildren[0].id,'lib-launch');
const d=window.__test;
d.open();
assert.equal(heroLook,savedAppearance,'actual creator appearance must be supplied');
assert(rootChildren.some(n=>n.innerHTML&&n.innerHTML.includes('warm-skin')),'actual hero should mount');
d.start();
assert.equal(d.phase,'question');assert.equal(d.round,1);
d.buzz();assert.equal(d.phase,'answer');
el('lib-answer').value='definitely not correct';
d.answer({preventDefault(){}});
assert.equal(d.phase,'storm');
d.setLives(20); // deterministic state test should not depend on player skill
d.tick(.20);assert.equal(d.warnings,1,'book should telegraph before spawning');
d.tick(.60);assert(d.books>=1,'telegraphed projectile should enter scene after warning');
d.dash();assert(d.hero.inv>0,'dash should grant a short defensive window');
d.useShield();
for(let i=0;i<250&&d.phase==='storm';i++)d.tick(.032);
assert.equal(d.phase,'review','a survived storm must lead to answer review');
assert(el('lib-feedback').textContent.includes('Correct answer:'),'show explanation after miss');
d.next();
assert.equal(d.phase,'question');assert.equal(d.round,2);
d.buzz();el('lib-answer').value=d.question.answer;d.answer({preventDefault(){}});
assert.equal(d.phase,'review','correct answer should not trigger storm');
d.close();
assert.equal(listenerCount,0,'close removes keyboard and visibility listeners');
console.log('PASS Librarian v2 active-state test: saved hero, warn->book, dash, shield, reveal, next, correct, close');
