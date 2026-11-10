'use strict';
const crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
const batches=['data/study-guide-expansion-2026.json','data/study-guide-round-two-2026.json','data/study-guide-round-three-2026.json'].map(file=>JSON.parse(read(file)));
const additions=batches.flat();
const baseline=JSON.parse(read('tests/fixtures/question-bank-before-round-three.json'));
const hash=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const sources=new Map(JSON.parse(read('data/study-guide-sources-2026.json')).map(s=>[s.name,s]));
assert.equal(additions.length,600);
const subjects=['math','science','social','language','arts'];
for(const batch of batches){assert.equal(batch.length,200);assert.equal(new Set(batch.map(q=>q.curriculumTopicId)).size,64);for(const subject of subjects)assert.equal(batch.filter(q=>q.subject===subject).length,40)}
for(const filename of ['index.html','Ellery_Recall_Rally_Librarian_v4.html']){
 const html=read(filename),script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
 const bank=script.slice(script.indexOf('const SAMPLE_ROWS='),script.indexOf('// Storage is optional.'));
 const context=vm.createContext({assert,console,additions,sources,hash,baseline});
 const functions=['supportsMode','sourceQuestions','stableQuestionId','adventureQuestionPool'].map(name=>script.match(new RegExp('^function '+name+'\\(.*$','m'))[0]).join('\n');
 const norm=script.match(/^const norm=v=>.*$/m)[0];
 const lands=script.slice(script.indexOf('const LANDS=['),script.indexOf('let questProgress='));
 vm.runInContext(`${bank}\n${norm}\n${functions}\n${lands}
 let mode='quick',customPack=[],questQuestionBank='all';
 assert.equal(SAMPLES.length,2150);
 const preserved=SAMPLES.filter(q=>!q.id.startsWith('guide-round-three-2026-'));
 assert.equal(preserved.length,baseline.count);
 assert.equal(hash(preserved),baseline.sha256,'All pre-existing question records remain identical');
 assert.equal(new Set(SAMPLES.map(q=>q.id)).size,2150);
 const allGuideAdditions=[...STUDY_GUIDE_ADDITIONS,...STUDY_GUIDE_ROUND_TWO,...STUDY_GUIDE_ROUND_THREE];
 assert.equal(JSON.stringify(allGuideAdditions),JSON.stringify(additions),'data and offline embed match');
 const topics=new Map(CURRICULUM_TOPICS.map(t=>[t.id,t]));
 assert.equal(new Set(STUDY_GUIDE_ADDITIONS.map(q=>q.curriculumTopicId)).size,64);
 // Build real source/pool selections once; checking each record need not rebuild
 // every ten-world pool hundreds of times as the content bank grows.
 const guideSet=new Set(sourceQuestions('guide')),starterSet=new Set(sourceQuestions('starter'));
 const allAdventure=new Set(LANDS.flatMap((_,i)=>adventureQuestionPool(i,'all')));
 const guideAdventure=new Set(LANDS.flatMap((_,i)=>adventureQuestionPool(i,'guide')));
 const idCounts=new Map();for(const q of SAMPLES)idCounts.set(q.id,(idCounts.get(q.id)||0)+1);
 const prompts=new Set();
 const additionIds=new Set(allGuideAdditions.map(q=>q.id));
 const oldPrompts=new Set(SAMPLES.filter(q=>!additionIds.has(q.id)).map(q=>norm(q.prompt).replace(/[^a-z0-9]/g,'')));
 for(const q of allGuideAdditions){
  const key=norm(q.prompt).replace(/[^a-z0-9]/g,'');
  assert(!oldPrompts.has(key),'new prompt already exists: '+q.id);
  assert(!prompts.has(key),'duplicate expansion prompt: '+q.id);prompts.add(key);
  assert.equal(q.options.length,4);assert.equal(new Set(q.options.map(norm)).size,4,q.id);
  assert(q.options.includes(q.answer));assert(q.prompt.length<250&&q.answer.length<100,q.id);
  assert(q.explanation.length>20&&q.source&&q.difficultyRationale,q.id);
  assert(Number.isInteger(q.difficultyEstimate)&&q.difficultyEstimate>=1&&q.difficultyEstimate<=3);
  assert.equal(q.difficultyStatus,'editorial_estimate');assert.equal(q.contentVersion,1);
  const topic=topics.get(q.curriculumTopicId);assert(topic&&topic.subjectId===q.subject);
  assert(!supportsMode(q,'quick')||topic.quickEligible,'written-only curriculum stays out of Quick Recall: '+q.id);
  if(topic.quickEligible&&!supportsMode(q,'quick')){assert(q.id.startsWith('guide-round-three-2026-'));assert(q.modeRationale?.startsWith('Written-only:'),'explain choice-dependent wording: '+q.id);}
  assert(supportsMode(q,'written'));
  assert(guideSet.has(q),'guide selection includes '+q.id);
  assert(!starterSet.has(q),'keep guide origin distinct');
  assert.equal(idCounts.get(q.id),1);
  assert(allAdventure.has(q),'all-bank adventure includes '+q.id);
  assert(guideAdventure.has(q),'guide-only adventure includes '+q.id);
  const source=sources.get(q.sourceDocument);assert(source,'known uploaded PDF: '+q.id);
  assert(q.sourcePdfPages.length&&q.sourcePdfPages.every(n=>Number.isInteger(n)&&n>=1&&n<=source.pages));
  for(const alias of q.aliases)assert(!q.options.filter(x=>x!==q.answer).some(x=>norm(x)===norm(alias)),'alias accepts wrong option: '+q.id);
 }
 for(const batch of [STUDY_GUIDE_ADDITIONS,STUDY_GUIDE_ROUND_TWO])assert.equal(batch.filter(q=>!supportsMode(q,'quick')).length,9);
 assert.equal(STUDY_GUIDE_ROUND_THREE.filter(q=>!supportsMode(q,'quick')).length,29);
 assert.equal(STUDY_GUIDE_ROUND_THREE.filter(q=>q.modeRationale).length,20);
 const RallyLearning={snapshot:()=>({attempts:[]}),activeProfile:()=>({id:'guide-test'})};
 function shuffle(a){return [...a]}
 ${read('src/science-lab.js')}
 const science=allGuideAdditions.filter(q=>q.subject==='science');
 assert(science.every(q=>ScienceLab.pool().includes(q)),'all 120 expansion science questions reach the lab');
 `,context,{timeout:10000});
}
// Exercise the Librarian's real selection logic with new literature records only.
const lib=read('librarian/librarian.js');
const libContext=vm.createContext({assert,console,SAMPLES:additions,localStorage:{getItem:()=>null}});
vm.runInContext(`const COUNT=1,DEMO=[],RECORD_KEY='test';
${lib.match(/^const BOOK_TOPIC=.*$/m)[0]}
${lib.match(/^const norm=s=>.*$/m)[0]}
${lib.slice(lib.indexOf('function unique4('),lib.indexOf('function persistAttempt('))}
const expected=SAMPLES.filter(q=>q.subject==='language'&&BOOK_TOPIC.test(q.topic+' '+q.prompt));
assert(expected.length>=20,'new literature coverage');
const all=SAMPLES;for(const q of expected){SAMPLES=[q];assert.equal(questionBank()[0]?.id,q.id,'Librarian can select '+q.id)}SAMPLES=all;
`,libContext,{timeout:5000});
console.log('PASS three 200-question guide batches, 40 per subject per batch, all 64 areas, provenance, choices, mode rules, both HTML embeds, ten-world pools, Science Lab and Librarian selection');
