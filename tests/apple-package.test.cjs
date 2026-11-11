'use strict';
// Exercise Apple viewport audit against precisely the files emitted by amplify.yml.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),stage=fs.mkdtempSync(path.join(os.tmpdir(),'apple-package-'));
try{
 for(const name of ['index.html','Ellery_Recall_Rally_Librarian_v4.html','src','scripts','tests','assets','librarian','data'])fs.cpSync(path.join(root,name),path.join(stage,name),{recursive:true});
 const block=fs.readFileSync(path.join(root,'amplify.yml'),'utf8').match(/commands:\r?\n([\s\S]*?)^\s{2}artifacts:/m)?.[1];assert(block);const lines=block.split(/\r?\n/).filter(s=>s.trim());assert(lines.every(s=>/^\s+- \S/.test(s)));
 for(const line of lines){const command=line.trim().slice(2),r=cp.spawnSync('bash',['-euo','pipefail','-c',command],{cwd:stage,encoding:'utf8'});assert.equal(r.status,0,command+'\n'+r.stdout+r.stderr);}
 const html=fs.readFileSync(path.join(stage,'dist/index.html'),'utf8'),manifest=JSON.parse(fs.readFileSync(path.join(stage,'dist/hosted-build.json'))),game=fs.readFileSync(path.join(stage,'dist',manifest.routes.game),'utf8');assert(game.includes('MOBILE_PLAYABILITY_START'));assert(!html.includes(';base64,'));assert(fs.existsSync(path.join(stage,'dist',manifest.routes.librarian.script)));
 const r=cp.spawnSync(process.execPath,[path.join(root,'tests/apple-playability-browser.test.cjs')],{cwd:root,stdio:'inherit',env:{...process.env,APPLE_TEST_HTML:path.join(stage,'dist/index.html'),APPLE_VIEW:'iphone-small-landscape,ipad-split',APPLE_REPORT:path.resolve(process.env.APPLE_REPORT||'docs/reviews/apple-playability','amplify')}});assert.equal(r.status,0,'Actual Amplify output passes Apple viewport audit');
 console.log('PASS actual Amplify output: two layouts, all modes, input cancellation, saves, offline and reduced motion');
}finally{fs.rmSync(stage,{recursive:true,force:true});}
