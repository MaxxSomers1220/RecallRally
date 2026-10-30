'use strict';
// Build with the actual Amplify commands, then play all ten worlds in its output.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),stage=fs.mkdtempSync(path.join(os.tmpdir(),'rigby-illustrated-static-'));
try{
 for(const name of ['index.html','Ellery_Recall_Rally_Librarian_v4.html','src','scripts','tests','assets','librarian','data'])fs.cpSync(path.join(root,name),path.join(stage,name),{recursive:true});
 const block=fs.readFileSync(path.join(root,'amplify.yml'),'utf8').match(/commands:\r?\n([\s\S]*?)^\s{2}artifacts:/m)?.[1];assert(block);const lines=block.split(/\r?\n/).filter(s=>s.trim());assert(lines.every(s=>/^\s+- \S/.test(s)));
 for(const line of lines){const command=line.trim().slice(2),r=cp.spawnSync('bash',['-euo','pipefail','-c',command],{cwd:stage,encoding:'utf8'});if(r.status!==0)throw Error(command+' failed:\n'+r.stdout+r.stderr);console.log('PASS actual Amplify command:',command);}
 const html=fs.readFileSync(path.join(stage,'dist/index.html'),'utf8');assert(html.includes('data:image/webp;base64,')&&html.includes('ADVENTURE_ART'));assert(fs.existsSync(path.join(stage,'dist/librarian/librarian.js')));
 const r=cp.spawnSync(process.execPath,[path.join(stage,'tests/adventure-illustrated-browser.test.cjs')],{cwd:stage,stdio:'inherit',env:{...process.env,RIGBY_TEST_HTML:path.join(stage,'dist/index.html'),RIGBY_VIEWPORT:'desktop',RIGBY_SCREENSHOT_PREFIX:'staged-',...(process.env.RIGBY_SCREENSHOTS?{RIGBY_SCREENSHOTS:path.resolve(root,process.env.RIGBY_SCREENSHOTS)}:{})}});assert.equal(r.status,0,'Actual published output plays the full journey');
 console.log('PASS staged Amplify: all ten worlds, fifty graded answers, defeat, saves, offline and reduced-motion rematch');
}finally{fs.rmSync(stage,{recursive:true,force:true});}
