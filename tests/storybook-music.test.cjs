'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p)),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(read('assets/music/manifest.json')),html=read('index.html').toString(),offline=read('Ellery_Recall_Rally_Librarian_v4.html').toString();
assert.deepEqual(manifest.assets.map(a=>a.id),['home','map']);let bytes=0;
for(const a of [...manifest.assets,...manifest.sketches]){
 const file=read(a.file);assert.equal(file.length,a.bytes);assert.equal(hash(file),a.sha256);assert(a.peak<=.71&&a.rms>.04);assert(a.boundaryDelta<.0041);
 assert.equal(a.loopSeconds,a.loopFrames/a.sampleRate);assert.equal(a.channels,2);
 if(!a.id.endsWith('sketch')){bytes+=file.length;assert.equal(a.loopBars,32);for(const build of [html,offline])assert(build.includes(file.toString('base64')),'Embedded '+a.id);}
 const score=JSON.parse(read('assets/music/source/'+a.id+'.json')),midi=read('assets/music/source/'+a.id+'.mid');assert.equal(midi.subarray(0,4).toString(),'MThd');assert.equal(midi.readUInt16BE(10),score.tracks.length+1);
 assert(score.tracks.some(t=>t.notes.some(n=>(n.beat-1)+n.dur>4)),'Held notes cross barlines');assert(score.tracks.every(t=>t.notes.every(n=>n.note>=0&&n.note<128&&n.dur>0&&n.vel>0&&n.vel<128)));
}
assert(bytes<3_000_000,'Runtime compressed audio budget');assert.equal(hash(read('assets/music/source/TimGM6mb.sf2')),manifest.soundfont.sha256);
const source=read('src/storybook-music.js').toString().trim();for(const build of [html,offline]){
 assert(build.includes(source),'Same runtime music source');const credits=JSON.parse(build.match(/const STORYBOOK_AUDIO_CREDITS=(.*);/)[1]);assert(credits.license.includes('GNU GENERAL PUBLIC LICENSE'));assert(credits.notice.includes('Tim Brechbill'));
}
assert(!/new\s+(?:window\.)?(?:webkit)?AudioContext|setInterval\(|requestAnimationFrame\(|localStorage|fetch\(/.test(source),'Reuse existing context/scheduler and embedded data');new vm.Script(source);
const legacy=JSON.parse(read('tests/fixtures/storybook-music-legacy.json')),ctx={};
vm.runInNewContext(html.slice(html.indexOf('const MUSIC_KEY='),html.indexOf('// End original soundtrack.'))+';this.current={data:{RIGBY_MELODY,MAP_CHORDS,DUEL_CHORDS,DUEL_TUNE,tempos:{duel:MUSIC_TEMPOS.duel,rescue:MUSIC_TEMPOS.rescue,finale:MUSIC_TEMPOS.finale}},functions:{musicScoreBar:musicScoreBar.toString(),musicNote:musicNote.toString(),playMusicOutcome:playMusicOutcome.toString()}}',ctx);
const current=JSON.parse(JSON.stringify(ctx.current));assert.deepEqual(current.data,legacy.data,'Existing duel/rescue/reunion score data');for(const [name,text]of Object.entries(current.functions))assert.equal(hash(text),legacy.functions[name],'Existing composition/rendering: '+name);
console.log('PASS two bounded embedded original scores, editable MIDI/sketches, licenses, exact loop metadata, existing context ownership and unchanged duel/outcome/rescue music');
