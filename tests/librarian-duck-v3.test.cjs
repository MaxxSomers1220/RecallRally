'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../librarian/librarian.js'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'../librarian/librarian.css'),'utf8');
new vm.Script(source,{filename:'librarian.js'});
assert(source.includes("Take a rest in our nice peaceful library"));
assert(css.includes('lib-pose-defeated')&&css.includes('prefers-reduced-motion:reduce'));
const expose='window.__t={open,start,next,pass,tick,down,up,lostFocus,visibilityChanged,close,'
 +'get hero(){return hero},get held(){return held},get phase(){return phase},'
 +'get lives(){return lives},get points(){return points},get books(){return books},'
 +'setLives(n){lives=n},setInv(n){hero.inv=n},setPose(p){hero.pose=p},'
 +'addBook(kind,x){books.push({x,y:kind==="high"?FLOOR-93:FLOOR-22,kind,speed:350,phase:0,color:"#fff",hit:false,dodged:false})}'
 +'};})();';
const game=source.replace(/\}\)\(\);\s*$/,expose);
assert.notEqual(game,source);
const nodes=new Map(),children=[],docListeners={},winListeners={};
const stage={appendChild(){}},canvas=new Proxy({}, {get:(o,k)=>
 k==='createLinearGradient'||k==='createRadialGradient'?()=>({addColorStop(){}}):()=>{}});
let counter=0,savedLook=null;
function el(id){
 if(!nodes.has(id))nodes.set(id,{id,hidden:false,disabled:false,value:'',textContent:'',innerHTML:'',dataset:{},style:{},parentElement:stage,
 setAttribute(){},addEventListener(t,fn){this['on_'+t]=fn},remove(){},focus(){},setPointerCapture(){},
 getContext(){return canvas},querySelector(s){return el(s.slice(1))}});
 return nodes.get(id);
}
const document={hidden:false,activeElement:{focus(){}},body:{appendChild(n){children.push(n)}},
 createElement(tag){return el('made-'+tag+'-'+(++counter))},
 addEventListener(k,fn){docListeners[k]=fn},removeEventListener(k){delete docListeners[k]}};
const window={matchMedia(){return {matches:false}},
 addEventListener(k,fn){winListeners[k]=fn},removeEventListener(k){delete winListeners[k]}};
function FakeImage(){this.complete=false;this.naturalWidth=0;}
const originalHero={face:'sun',hood:'panther',magicColor:'violet'};
const sandbox={window,document,Image:FakeImage,avatarLook:originalHero,
 renderGameHero(look){savedLook=look;return '<g></g>'},
 localStorage:{getItem(){return '{}'},setItem(){}},
 performance:{now(){return 100}},requestAnimationFrame(){return 1},cancelAnimationFrame(){},
 console:{warn(){},log(){}},Math};
vm.runInNewContext(game,sandbox,{timeout:2000});
const g=window.__t;
assert.equal(children[0].textContent,'Take a rest in our nice peaceful library');
g.open();assert.equal(savedLook,originalHero);
assert(children.some(e=>e.id==='lib-overlay'&&e.innerHTML.includes('id="lib-duck"')));
g.start();assert.equal(g.phase,'question');g.pass();assert.equal(g.phase,'storm');
// Ducking under a high throw reduces the actual hitbox.
g.held.duck=true;g.tick(.016);assert.equal(g.hero.pose,'ducking');
const p=g.points;g.addBook('high',g.hero.x+19);g.tick(.08);
assert.equal(g.lives,4);assert(g.points>=p+25,'high throw should be dodged with Duck');
// Low throws still damage a crouching player.
g.addBook('low',g.hero.x+19);g.tick(.08);
assert.equal(g.lives,3);assert.equal(g.hero.pose,'hit');
// Damage immunity prevents repeated hit transitions.
g.addBook('low',g.hero.x+19);g.tick(.04);assert.equal(g.lives,3);
g.held.duck=false;g.tick(.30);assert.equal(g.hero.pose,'recovering');
g.tick(.30);const before=g.hero.x;g.held.right=true;g.tick(.06);
assert(g.hero.x>before,'normal walking resumes after Duck');g.held.right=false;
// Fatal hit is played once, then a persistent defeated pose.
g.setLives(1);g.setInv(0);g.setPose('ready');
g.addBook('low',g.hero.x+19);g.tick(.08);
assert.equal(g.phase,'defeat-hit');g.tick(.35);
assert.equal(g.phase,'defeated');assert.equal(g.hero.pose,'defeated');
for(let i=0;i<40;i++)g.tick(.033);
assert.equal(g.hero.pose,'defeated');assert.equal(g.lives,0);
assert.equal(el('lib-next').hidden,false,'Next Question visible on defeat');
// Recovery resets state, lives, controls and movement.
g.held.duck=true;g.next();assert.equal(g.phase,'question');assert.equal(g.lives,4);
assert.equal(g.hero.pose,'ready');assert.equal(g.held.duck,false);
// Touch: press-and-hold, cancellation, lost pointer capture.
g.pass();el('lib-duck').on_pointerdown({pointerId:5,preventDefault(){}});
assert.equal(g.held.duck,true);el('lib-duck').on_pointercancel({});assert.equal(g.held.duck,false);
el('lib-duck').on_pointerdown({pointerId:6,preventDefault(){}});
el('lib-duck').on_lostpointercapture({});assert.equal(g.held.duck,false);
// Keyboard: S/Down duck; Q shields (no overlap); focus loss clears held controls.
const key=c=>({code:c,repeat:false,key:'',target:{tagName:'BODY'},preventDefault(){}});
g.down(key('KeyS'));assert.equal(g.held.duck,true);g.up(key('KeyS'));assert.equal(g.held.duck,false);
g.down(key('ArrowDown'));assert.equal(g.held.duck,true);g.up(key('ArrowDown'));assert.equal(g.held.duck,false);
g.down(key('KeyQ'));assert.equal(el('lib-shield').textContent,'🛡 USED');
g.down(key('KeyS'));g.down(key('ArrowRight'));g.lostFocus();
assert(!g.held.duck&&!g.held.right);
g.down(key('KeyS'));document.hidden=true;g.visibilityChanged();assert(!g.held.duck);
document.hidden=false;g.visibilityChanged();
assert(!source.includes('heroNode.style.opacity=hero.inv>0&&Math.floor'));
assert(css.includes('animation:none!important;transition:none!important'));
g.close();assert.equal(Object.keys(winListeners).length,0);
assert.equal(Object.keys(docListeners).length,0);
console.log('PASS Librarian v3: duck high/low, hit gating, stable defeat, next, touch, keyboard, blur, reduced-motion');
