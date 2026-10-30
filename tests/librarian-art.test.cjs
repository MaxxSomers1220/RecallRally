'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const js=fs.readFileSync('librarian/librarian.js','utf8'),css=fs.readFileSync('librarian/librarian.css','utf8'),fixture=JSON.parse(fs.readFileSync('tests/fixtures/librarian-v4-contract.json','utf8'));
function code(source,name){const lines=source.split('\n'),i=lines.findIndex(l=>l.startsWith('function '+name+'('));assert(i>=0);let out=lines[i];if(!out.endsWith('}'))for(let k=i+1;k<lines.length;k++){out+='\n'+lines[k];if(lines[k]==='}')break;}return out.replace(/guardianReaction\([^;]*\);/g,'').replace(/\s+/g,'');}
for(const [name,hash]of Object.entries(fixture.functions))assert.equal(crypto.createHash('sha256').update(code(js,name)).digest('hex'),hash,'Preserve original '+name+' behavior, allowing only presentation reaction calls');
const manifest=JSON.parse(fs.readFileSync('librarian/art-manifest.json','utf8'));
for(const a of manifest.assets){const raw=fs.readFileSync('librarian/'+a.file);assert(raw.length<=a.max_bytes);assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),a.sha256);if(a.file.endsWith('.svg'))assert(!/<script|<foreignObject|\bon\w+=|(?:href|src)=["'](?:https?:|\/\/)/i.test(raw.toString()));}
assert(css.includes('data:image/webp;base64,'+fs.readFileSync('librarian/library-painted.webp').toString('base64')));
for(const file of ['enchanted-book.svg','enchanted-book-1.svg','enchanted-book-2.svg'])assert(js.includes(fs.readFileSync('librarian/'+file).toString('base64')));
const guardian=fs.readFileSync('librarian/librarian-guardian.svg','utf8');for(const pose of ['curious','impressed','preparing','casting','frustrated','satisfied'])assert(guardian.includes('lg-face-'+pose));
assert.equal(new Set(['enchanted-book.svg','enchanted-book-1.svg','enchanted-book-2.svg'].map(f=>fs.readFileSync('librarian/'+f,'utf8'))).size,3);
const offline=fs.readFileSync('Ellery_Recall_Rally_Librarian_v4.html','utf8');assert(offline.includes(js.trim()));assert(offline.includes(css.trim()));assert(!offline.includes('src="librarian/'));
console.log('PASS original academic, scoring, timing, movement and collision functions; six guardian moods; three page poses; asset provenance; exact offline bundles');
