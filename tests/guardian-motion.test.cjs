'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const read=f=>fs.readFileSync(f,'utf8'),html=read('index.html'),standalone=read('Ellery_Recall_Rally_Librarian_v4.html');
const files=['src/guardian-motion-models.js','src/guardian-motion-render.js','src/guardian-motion.js'];
for(const f of files){assert(html.includes(read(f).trim()),f+' in Amplify input');assert(standalone.includes(read(f).trim()),f+' in offline HTML');new vm.Script(read(f),{filename:f});}
const ctx=vm.createContext({});vm.runInContext(read(files[0])+';this.rigs=GUARDIAN_RIGS;',ctx);
assert.equal(ctx.rigs.length,10);
const manifest=JSON.parse(read('assets/characters/manifest.json')),art={},meta={};
for(const a of manifest.assets){art[a.key]='data:image/webp;base64,TEST';if(Number.isInteger(a.guardian))meta[a.guardian]={width:a.width,height:a.height};}
ctx.CHARACTER_ART=art;ctx.CHARACTER_META=meta;vm.runInContext(read(files[1]),ctx);
const names=new Set();
for(const [i,r]of ctx.rigs.entries()){
 assert(!names.has(r.key));names.add(r.key);
 assert.equal(r.focus.length,2);assert(r.eyes.length>0&&r.arms[0].child);
 const parts=a=>[a,...(a.child?parts(a.child):[]),...(a.hand?parts(a.hand):[])];
 for(const p of [r.head,...r.arms.flatMap(parts),...(r.ears||[]),...(r.wings||[]).flatMap(parts)]){assert.equal(p.pivot.length,2);assert(p.pivot.every(Number.isFinite));assert(/^M/.test(p.shape));}
 for(const e of r.eyes)assert(e.every(Number.isFinite)&&e[2]>0&&e[3]>0);
 const mark=ctx.guardianRigMarkup({land:i,phase:'question'},{magicColor:'#fff'},'');
 assert.equal((mark.match(/<image /g)||[]).length,1,'One approved bitmap, no crossfade figures');
 assert(mark.includes('data-g-fixed-feet')&&mark.includes('data-g-breath'));
 assert(mark.includes('data-g-joint="arm0-tip"')&&mark.includes('data-g-eye'));
 if(r.arms[0].child.hand)assert(mark.includes('data-g-joint="arm0-tip-wrist"'));
 const f=ctx.guardianReleaseFocus(i);assert(f.x>400&&f.x<650&&f.y>0&&f.y<150,'Spell launch in guardian bounds');
}
assert(!/localStorage|fetch\(|setTimeout\(|setInterval\(|gradeAnswer\(|questProgress\s*=/.test(files.map(read).join('\n')),'Motion layer has no grading, persistence or gameplay timers');
assert(!/guardian-pose-(in|out)|guardian-pose-dissolve/.test(read('src/character-art.css')),'No whole-figure dissolve');
console.log('PASS ten native-pixel joint rigs, one approved paint per guardian, wrists/eyes/feet, focus coordinates, offline synchronization and presentation-only code');
// A delayed paint, countered strike and replay must still show a real release.
let scheduled,now=1000;
const node={dataset:{},isConnected:true,querySelectorAll:()=>[]};
Object.assign(ctx,{performance:{now:()=>now},requestAnimationFrame:fn=>{scheduled=fn;return 1},cancelAnimationFrame:()=>{scheduled=null},document:{hidden:false,addEventListener(){},removeEventListener(){}},window:{matchMedia:()=>({matches:false,addEventListener(){},removeEventListener(){}})},root:{querySelector:()=>node},mode:'adventure'});
// The focus is optional in this timing-only harness.
ctx.root.querySelector=s=>s==='.guardian-rig'?node:null;
vm.runInContext(read(files[2])+';this.motion=GuardianMotion;',ctx);
for(let land=0;land<10;land++)for(const outcome of ['hit','block','counter','raise']){
 ctx.duel={land,index:0,phase:'result',correct:['counter','raise'].includes(outcome),fxActive:true,tacticOutcome:outcome};
 ctx.motion.mount(ctx.root,ctx.duel);const states=new Set([ctx.motion.inspect().state]);
 for(let frame=0;frame<24;frame++){now+=200;scheduled(now);states.add(ctx.motion.inspect().state);}
 if(outcome==='raise')assert(!states.has('casting'),'A correctly answered shield turn stays defensive');
 else{assert(states.has('casting')&&states.has('follow-through'),'Every guardian releases even at five frames per second');ctx.motion.mount(ctx.root,ctx.duel);assert.equal(ctx.motion.inspect().state,'anticipation','Active replay restarts the attack');}
 ctx.motion.stop();assert.equal(ctx.motion.inspect().scheduled,false);
}
console.log('PASS all ten guardians: delayed frames, strike/block/counter, correctly answered defensive turn, active replay and loop cleanup');
