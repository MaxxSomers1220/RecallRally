'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),source=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const moduleSource=fs.readFileSync(path.join(root,'src/science-lab.js'),'utf8').trim();
assert(source.includes(moduleSource),'actual game contains the editable Science Lab implementation');
assert(html.includes(fs.readFileSync(path.join(root,'src/science-lab.css'),'utf8').trim()),'actual game contains current styles');
assert(fs.readFileSync(path.join(root,'Ellery_Recall_Rally_Librarian_v4.html'),'utf8').includes(moduleSource),'complete offline game contains Science Lab');
const bank=source.slice(source.indexOf('const SAMPLE_ROWS='),source.indexOf('// Storage is optional.'));
const supports=source.match(/^function supportsMode\(.*$/m)[0],identity=source.match(/^function stableQuestionId\(.*$/m)[0],sources=source.match(/^function sourceQuestions\(.*$/m)[0];
const ctx=vm.createContext({assert,console});
vm.runInContext(`
let customPack=[],attempts=[],mode='written';function norm(s){return String(s).toLowerCase().replace(/[^a-z0-9]/g,'')}function shuffle(a){return [...a]}
const RallyLearning={snapshot:()=>({attempts}),activeProfile:()=>({id:'learner-1',name:'Ellery'})};
${bank}\n${supports}\n${identity}\n${sources}\n${moduleSource}
const science=ScienceLab.pool();assert(science.length>=300);assert(science.every(q=>q.subject==='science'&&SAMPLES.includes(q)));
const expected={potion:['science-01','science-12'],circuit:['science-02','science-03'],creature:['science-07','science-08','science-09','science-10','science-11'],weather:['science-04','science-05'],observatory:['science-06']};
for(const [id,topics] of Object.entries(expected)){
 const {deck,fallback}=ScienceLab.pickDeck(id);assert.equal(deck.length,5);assert.equal(fallback,false);assert.equal(new Set(deck.map(stableQuestionId)).size,5);
 for(const q of deck){assert(SAMPLES.includes(q),'shared record identity');assert(topics.includes(q.curriculumTopicId),'station topic mapping');assert.strictEqual(q.options,SAMPLES.find(x=>x.id===q.id).options,'choices are preserved');assert.equal(q.explanation,SAMPLES.find(x=>x.id===q.id).explanation)}
 attempts=deck.map(q=>({questionId:q.id,answeredAt:new Date().toISOString()}));const next=ScienceLab.pickDeck(id).deck;assert(next.every(q=>!deck.includes(q)),'recent questions are deprioritized');attempts=[];
}
console.log('PASS all five station mappings, shared science records, exact choices and explanations, and recent-history selection');
const original=[...SAMPLES];SAMPLES.splice(0,SAMPLES.length,...SAMPLES.filter(q=>q.curriculumTopicId!=='science-06'));const fallback=ScienceLab.pickDeck('observatory');assert.equal(fallback.fallback,true);assert.equal(fallback.deck.length,5);SAMPLES.splice(0,SAMPLES.length,...original);
const base=science[0];customPack=[{...base,id:'custom-science-unit',prompt:'Custom study pack: '+base.prompt,topic:'Weather and climate',curriculumTopicId:undefined}];assert(ScienceLab.pool(true).includes(customPack[0]));assert(!ScienceLab.pool(false).includes(customPack[0]));customPack[0].modes=['quick'];assert(!ScienceLab.pool(true).includes(customPack[0]));
console.log('PASS incomplete topic coverage falls back to science, eligible custom records are optional, quick-only questions stay out');
const valid={version:1,completed:['potion'],seen:{'sample-science-1':1234},records:{potion:{runs:1,bestCorrect:4,lastCorrect:4,completedAt:'2026-10-28T12:00:00Z'}},includeCustom:false};
assert.equal(ScienceLab.validate(valid).completed.length,1);assert.equal(ScienceLab.validate({...valid,artifact:'skip-all-questions'}).artifact,undefined);
for(const v of [null,{}, {...valid,version:9},{...valid,completed:['potion','potion']},{...valid,completed:['unknown']},{...valid,records:{}},{...valid,seen:{'bad-id':-1}},{...valid,records:{potion:{...valid.records.potion,bestCorrect:6}}},{...valid,records:{potion:{...valid.records.potion,runs:0}}}])assert.throws(()=>ScienceLab.validate(v));
console.log('PASS versioned station saves validate badge consistency, history, grades and corrupted data');
`,ctx,{timeout:5000});
require('../scripts/check-science-lab-assets.cjs');
