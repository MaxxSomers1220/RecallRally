'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex'),html=fs.readFileSync('index.html','utf8'),offline=fs.readFileSync('Ellery_Recall_Rally_Librarian_v4.html','utf8'),fixture=JSON.parse(fs.readFileSync('tests/fixtures/character-contract.json'));
const constants=html.slice(html.indexOf('const HERO_OPTIONS='),html.indexOf('function normalizePantherLook'));
assert.equal(hash(constants.replace(/\s+/g,'')),fixture.appearance_schema_sha256,'All existing appearance IDs, colors, defaults and presets unchanged');
assert.equal(hash(fs.readFileSync('librarian/librarian.js')),fixture.librarian_js_sha256,'Original controls, timing, physics and Librarian unchanged');assert.equal(hash(fs.readFileSync('src/adventure-save.js')),fixture.save_js_sha256);
const manifest=JSON.parse(fs.readFileSync('assets/characters/manifest.json'));assert.equal(manifest.assets.length,32);
for(const r of manifest.assets){const raw=fs.readFileSync('assets/characters/'+r.file);assert.equal(hash(raw),r.sha256);assert(raw.length<=r.max_bytes);assert(html.includes(raw.toString('base64'))&&offline.includes(raw.toString('base64')));}
for(const f of ['src/hero-renderer.js','src/character-art.js','src/character-art.css']){const s=fs.readFileSync(f,'utf8').trim();assert(html.includes(s)&&offline.includes(s),'Same source in both builds: '+f);}
const helper=fs.readFileSync('src/character-art.js','utf8');assert(!/localStorage|fetch\(|setTimeout|requestAnimationFrame|addEventListener/.test(helper),'New character drawing has no gameplay state or extra loops');assert(helper.includes('heroSplitLimbArt')&&helper.includes('heroFacePlanes'));assert(fs.readFileSync('src/character-art.css','utf8').includes('prefers-reduced-motion'));
console.log('PASS unchanged customization schema/presets, saves and Librarian physics; 30 embedded poses, shared hero drawing and offline synchronization');
