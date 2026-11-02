'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),stage=fs.mkdtempSync(path.join(os.tmpdir(),'storybook-package-')),report=process.env.MUSIC_REPORT||path.join(os.tmpdir(),'recall-storybook-music');
try{
 for(const name of ['index.html','Ellery_Recall_Rally_Librarian_v4.html','src','scripts','tests','assets','librarian','data'])fs.cpSync(path.join(root,name),path.join(stage,name),{recursive:true});
 const commands=fs.readFileSync(path.join(root,'amplify.yml'),'utf8').match(/commands:\r?\n([\s\S]*?)^\s{2}artifacts:/m)?.[1];assert(commands);
 for(const row of commands.split(/\r?\n/).filter(s=>s.trim())){assert(/^\s+- \S/.test(row));const cmd=row.trim().slice(2),r=cp.spawnSync('bash',['-euo','pipefail','-c',cmd],{cwd:stage,encoding:'utf8',maxBuffer:2*1024*1024});assert.equal(r.status,0,cmd+'\n'+r.stdout+r.stderr);console.log('PASS actual Amplify command: '+cmd)}
 assert(!fs.existsSync(path.join(stage,'dist/assets/music/source')),'SoundFont/build sources are excluded from runtime output');
 const result=cp.spawnSync(process.execPath,[path.join(root,'tests/storybook-music-browser.test.cjs')],{cwd:root,stdio:'inherit',env:{...process.env,STORYBOOK_HTML:path.join(stage,'dist/index.html'),MUSIC_REPORT:path.join(report,'amplify'),MUSIC_VIEWS:'laptop,phone'}});assert.equal(result.status,0,'Emitted Amplify game audio, controls, grading, saves and offline decoding');
 console.log('PASS actual Amplify output: music plays locally embedded, source font excluded, desktop/phone audio and gameplay checks');
}finally{fs.rmSync(stage,{recursive:true,force:true})}
