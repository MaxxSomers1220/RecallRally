'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const html=fs.readFileSync('index.html','utf8'),offline=fs.readFileSync('Ellery_Recall_Rally_Librarian_v4.html','utf8');
const fixture=JSON.parse(fs.readFileSync('tests/fixtures/adventure-illustration-contract.json'));
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
for(const [name,expected] of Object.entries(fixture.functions)){
 const m=html.match(new RegExp('^function '+name+'\\([^\\n]*','m'));assert(m,name);let code=m[0];if(!code.endsWith('}'))code=html.slice(m.index,html.indexOf('\n}',m.index)+2);
 assert.equal(hash(code.replace(/\s+/g,'')),expected,'Preserve original '+name+' exactly');
}
assert.equal(hash(fs.readFileSync('src/adventure-save.js')),fixture.save_source_sha256);
assert.equal(hash(fs.readFileSync('tests/fixtures/librarian-shared-hero.json')),fixture.hero_fixture_sha256);
const manifest=JSON.parse(fs.readFileSync('assets/adventure/manifest.json'));
for(const row of manifest.assets){const raw=fs.readFileSync('assets/adventure/'+row.file);assert.equal(hash(raw),row.sha256);assert(raw.length<=row.max_bytes);assert(html.includes(row.file.endsWith('.webp')?raw.toString('base64'):raw.toString().replace(/^<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'').replace(/</g,'\\u003c').replace(/"/g,'\\"')),'Embedded '+row.file);}
const js=fs.readFileSync('src/adventure-illustrations.js','utf8').trim(),css=fs.readFileSync('src/adventure-illustrations.css','utf8').trim();assert(html.includes(js)&&offline.includes(js)&&html.includes(css)&&offline.includes(css));
assert(!/fetch\(|localStorage|setTimeout|requestAnimationFrame|addEventListener/.test(js),'Presentation module has no persistence or independent loops');
assert.equal((js.match(/goal:'/g)||[]).length,10);assert(js.includes('n===10'));assert(css.includes('prefers-reduced-motion'));assert(css.includes('rescue-sigil'));
console.log('PASS 22 original gameplay/hero functions, unchanged save module, all 23 embedded assets, ten visual objectives, one-file offline synchronization');
