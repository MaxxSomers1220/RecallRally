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
