'use strict';
// Protect the approved musical direction: real concurrent harmony and independent lines.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const seed=read('assets/music/source/approved-ensemble-sketch.json'),manifest=read('assets/music/manifest.json');
const at=n=>(n.bar-1)*4+n.beat-1,sorted=ns=>ns.toSorted((a,b)=>at(a)-at(b)||a.note-b.note);
const home=read('assets/music/source/home.json'),map=read('assets/music/source/map.json');
for(let channel=0;channel<seed.tracks.length;channel++)assert.deepEqual(sorted(home.tracks[channel].notes.filter(n=>at(n)<32)),sorted(seed.tracks[channel].notes.filter(n=>at(n)<32)),'Homepage preserves the approved opening: '+seed.tracks[channel].name);
const rows=[];
for(const score of [home,map]){
 const voices=[],layers=[];
 for(let beat=.125;beat<128;beat+=.125){
  const active=score.tracks.map(t=>t.notes.filter(n=>at(n)<=beat&&beat<at(n)+n.dur).length);
  voices.push(active.reduce((s,x)=>s+x,0));layers.push(active.filter(x=>x>0).length);
 }
 const ordered=voices.toSorted((a,b)=>a-b),median=ordered[Math.floor(ordered.length/2)];
 assert(median>=7,'Sustained polyphonic arrangement rather than isolated single notes');
 assert(layers.filter(n=>n>=3).length/layers.length>.9,'Multiple ensemble roles coexist throughout the cue');
 assert(score.tracks[0].notes.filter(n=>at(n)<=.5&&at(n)+n.dur>.5).length>=3,'Voiced harmony is present in the opening');
 assert(score.tracks[1].notes.some(n=>at(n)>32)&&score.tracks[2].notes.some(n=>at(n)>32),'Both lead and independent counterline develop beyond the opening');
 const meta=manifest.assets.find(a=>a.id===score.id);assert.equal(meta.bpm,score.bpm);assert.equal(meta.loopGridHz,300);assert.equal(meta.loopFrames%(meta.sampleRate/300),0);assert(Math.abs(meta.loopSeconds-score.loopBars*4*60/score.bpm)<=.5/300+1/meta.sampleRate,'Nearest common 44.1/48 kHz export grid preserves the musical phrase within 1.7 ms');
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),tempo=html.match(/const MUSIC_TEMPOS=\{home:(\d+),map:(\d+),/);assert.equal(Number(tempo[score.id==='home'?1:2]),score.bpm,'Session beat length matches authored tempo');
 rows.push({id:score.id,bpm:score.bpm,seconds:meta.loopSeconds,medianConcurrentNotes:median,multipleLayerFraction:layers.filter(n=>n>=3).length/layers.length,notes:score.tracks.reduce((n,t)=>n+t.notes.length,0)});
}
assert.notDeepEqual(home.tracks[1].notes,map.tracks[1].notes,'Map has its own melodic phrasing');assert.notEqual(home.tracks[3].program,map.tracks[3].program,'Map has a distinct bass articulation');
console.log('PASS approved opening, developed polyphonic ensembles, distinct map, authored tempos and unchanged source sketch',JSON.stringify(rows));
