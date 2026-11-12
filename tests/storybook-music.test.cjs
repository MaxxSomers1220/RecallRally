'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p)),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(read('assets/music/manifest.json')),html=read('index.html').toString(),offline=read('Ellery_Recall_Rally_Librarian_v4.html').toString();
const ids=['home','map',...Array.from({length:10},(_,i)=>'world-'+i),'duel-high','lab-hub',...['potion','circuit','creature','weather','observatory'].map(id=>'lab-'+id),'practice','library','library-storm','rescue','finale'];
assert.deepEqual([...manifest.assets.map(a=>a.id)].sort(),[...ids].sort(),'Every game context has an embedded original cue');
const replacement=JSON.parse(read('assets/music/user/manifest.json')),replaced=new Set([...Object.keys(replacement.mapping),'lab-potion','lab-circuit','lab-creature','lab-weather','lab-observatory',...(replacement.mapping.library?['library-storm']:[])]);
assert.equal(new Set(manifest.assets.map(a=>a.sha256)).size,ids.length,'Scenes have distinct rendered arrangements');let bytes=0;
for(const a of [...manifest.assets,...manifest.sketches||[]]){
 const file=read(a.file);assert.equal(file.length,a.bytes,a.id+' byte count');assert.equal(hash(file),a.sha256,a.id+' checksum');
 assert(a.peak<=.71&&a.rms>.03,a.id+' mix headroom and audible body');assert(a.boundaryDelta<.0041,a.id+' source loop seam');
 assert.equal(a.loopSeconds,a.loopFrames/a.sampleRate);assert.equal(a.channels,2);assert([22050,32000,44100,48000].includes(a.sampleRate));
 assert(Math.abs(a.loopBars*4*60/a.bpm-a.loopSeconds)<=1/a.sampleRate,a.id+' loop matches its score tempo');
 assert.equal(a.mp3.encodedFrames-a.mp3.skipSamples-a.mp3.discardPadding,a.loopFrames,a.id+' MPEG gapless region matches source PCM');
 if(ids.includes(a.id)){bytes+=file.length;assert(a.loopBars>=16,a.id+' complete arrangement');if(!replaced.has(a.id))for(const build of [html,offline])assert(build.includes(file.toString('base64')),'Embedded '+a.id);}
 const score=JSON.parse(read('assets/music/source/'+a.id+'.json')),midi=read('assets/music/source/'+a.id+'.mid');assert.equal(midi.subarray(0,4).toString(),'MThd');assert.equal(midi.readUInt16BE(10),score.tracks.length+1);assert.equal(score.bpm,a.bpm);assert.equal(score.loopBars,a.loopBars);
 assert(score.tracks.some(t=>t.notes.some(n=>(n.beat-1)+n.dur>4)),a.id+' held notes cross barlines');assert(score.tracks.every(t=>t.notes.every(n=>n.note>=0&&n.note<128&&n.dur>0&&n.vel>0&&n.vel<128)),a.id+' editable MIDI events');
}
assert(bytes<16_000_000,'Runtime compressed audio budget stays below 16 MB');assert.equal(hash(read('assets/music/source/TimGM6mb.sf2')),manifest.soundfont.sha256);
const source=read('src/storybook-music.js').toString().trim();for(const build of [html,offline]){
 assert(build.includes(source),'Same runtime music source');const credits=JSON.parse(build.match(/const STORYBOOK_AUDIO_CREDITS=(.*);/)[1]);assert(credits.license.includes('GNU GENERAL PUBLIC LICENSE'));assert(credits.notice.includes('Tim Brechbill'));
}
for(const build of [html,offline])assert(build.includes(read('src/audio-coordinator.js').toString().trim()),'Editable audio coordinator is embedded');
assert(!/new\s+(?:window\.)?(?:webkit)?AudioContext|setInterval\(|requestAnimationFrame\(|localStorage/.test(source),'Reuse existing context/scheduler and preferences');new vm.Script(source);
console.log('PASS original fallback catalog, licensed sources, effective embedded delivery and MPEG metadata');
require('./storybook-music-runtime.test.cjs').catch(error=>{console.error(error);process.exitCode=1});

assert.equal(replacement.assets.length,14);
assert.equal(replacement.mapping.home,'homepage');assert.equal(replacement.mapping.map,'adventuremap');assert.equal(replacement.mapping['lab-hub'],'science');
assert.equal(replacement.mapping.library,'blue-hour');
for(let i=0;i<10;i++)assert.equal(replacement.mapping['world-'+i],'guard'+(i+1));
for(const a of replacement.assets){const data=read(a.file);assert.equal(hash(data),a.sha256);assert.equal(data.length,a.bytes);assert.equal(a.loopSeconds,a.loopFrames/a.sampleRate);assert.equal(a.mp3.encodedFrames-a.mp3.skipSamples-a.mp3.discardPadding,a.loopFrames);assert(a.peak<=.71);assert(a.sourceSha256);}
for(const build of [html,offline]){
 const catalog=JSON.parse(build.match(/const STORYBOOK_AUDIO=(.*);/)[1]);
 for(const [kind,name] of Object.entries(replacement.mapping)){const asset=replacement.assets.find(a=>a.id===name);assert.equal(catalog[kind].sourceFilename,asset.sourceFilename);assert(catalog[kind].uploaded);assert.equal(hash(Buffer.from(catalog[kind].data,'base64')),asset.sha256);}
 const science=Buffer.from(catalog['lab-hub'].data,'base64');assert.equal(hash(science),replacement.assets.find(a=>a.id==='science').sha256);
 for(const k of ['potion','circuit','creature','weather','observatory']){assert.equal(catalog['lab-'+k].dataRef,'lab-hub');assert(!catalog['lab-'+k].data);}
 assert.equal(catalog['library-storm'].dataRef,'library');assert(!catalog['library-storm'].data,'Library storm does not duplicate the recording');
 const library=replacement.assets.find(a=>a.id==='blue-hour');assert.equal(catalog.library.sourceFilename,'punch-deck-blue-hour.mp3');assert.equal(catalog.library.title,'Blue Hour — Punch Deck');assert.equal(catalog.library.bytes,library.bytes);assert(catalog.library.loopSeconds>165&&catalog.library.loopSeconds<166,'Full supplied song duration is retained');
}
console.log('PASS 14 uploaded tracks, exact destination mapping, full-length gapless metadata and shared Science Lab/Library payloads');
