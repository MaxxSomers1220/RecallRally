const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const bank=script.slice(script.indexOf('const SAMPLE_ROWS='),script.indexOf('// Storage is optional.'));
vm.runInNewContext(bank+`
assert.equal(SAMPLES.length,2550);
assert.equal(new Set(SAMPLES.map(q=>q.id)).size,2550);
assert.equal(new Set(SAMPLES.map(q=>q.curriculumTopicId)).size,64);
assert.equal(SAMPLES.filter(q=>q.modes.includes('quick')).length,2304);
assert.equal(SAMPLES.filter(q=>!q.modes.includes('quick')).length,246);
assert.equal(ADVENTURE_V29_QUESTIONS.length,50);
for(const subject of ['math','science','social','language','arts'])assert.equal(ADVENTURE_V29_QUESTIONS.filter(q=>q.subject===subject).length,10);
for(const q of ADVENTURE_V29_QUESTIONS){
 assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);
 assert(q.options.includes(q.answer));assert(q.explanation&&q.source&&q.difficultyRationale);
 assert(CURRICULUM_TOPICS.some(t=>t.id===q.curriculumTopicId&&t.subjectId===q.subject));
 assert.equal(SAMPLES.filter(x=>x.prompt.trim().toLowerCase()===q.prompt.trim().toLowerCase()).length,1);
}
`,{assert});
console.log('PASS 2,550 stable IDs, 64 areas, 2,304 Quick Recall / 246 written-only, and 50 preserved adventure questions');
