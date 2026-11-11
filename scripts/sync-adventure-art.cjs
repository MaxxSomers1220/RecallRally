'use strict';
// Embed all runtime art in the source HTML, so both static Amplify and one-file offline work.
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8').trim();
const dir=path.join(root,'assets/adventure'),manifest=JSON.parse(read('assets/adventure/manifest.json')),art={};
for(const row of manifest.assets){const data=fs.readFileSync(path.join(dir,row.file));art[row.key]=row.file.endsWith('.svg')?data.toString().replace(/^<svg[^>]*>/,'').replace(/<\/svg>\s*$/,''):'data:image/webp;base64,'+data.toString('base64');}
const block='/* ADVENTURE_ILLUSTRATIONS_START */\nconst ADVENTURE_ART='+JSON.stringify(art).replace(/</g,'\\u003c')+';\n'+read('src/adventure-illustrations.js')+'\n/* ADVENTURE_ILLUSTRATIONS_END */';
const file=path.join(root,'index.html');let html=fs.readFileSync(file,'utf8');
if(html.includes('/* ADVENTURE_ILLUSTRATIONS_START */'))html=html.replace(/\/\* ADVENTURE_ILLUSTRATIONS_START \*\/[\s\S]*?\/\* ADVENTURE_ILLUSTRATIONS_END \*\//,()=>block);
else html=html.replace('const LANDS=[',()=>block+'\nconst LANDS=[');
const style='<style id="adventure-illustrations-styles">\n'+read('src/adventure-illustrations.css')+'\n</style>';
if(html.includes('<style id="adventure-illustrations-styles">'))html=html.replace(/<style id="adventure-illustrations-styles">[\s\S]*?<\/style>/,()=>style);
else html=html.replace('</head>',style+'\n</head>');
fs.writeFileSync(file,html);
