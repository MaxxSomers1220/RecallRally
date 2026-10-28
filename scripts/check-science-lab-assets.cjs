'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=path.join(__dirname,'../assets/science-lab'),manifest=JSON.parse(fs.readFileSync(path.join(base,'manifest.json'),'utf8'));
for(const asset of manifest.assets){
 const raw=fs.readFileSync(path.join(base,asset.file),'utf8');
 assert(Buffer.byteLength(raw)<=asset.max_bytes,'Asset exceeds its size budget: '+asset.file);
 assert(raw.startsWith('<svg ')&&raw.trim().endsWith('</svg>'),'Complete SVG: '+asset.file);
 assert(new RegExp('width="'+asset.width+'"').test(raw)&&new RegExp('height="'+asset.height+'"').test(raw),'Declared dimensions: '+asset.file);
 assert(!/<script|<foreignObject|\bon\w+=|(?:href|src)=["'](?:https?:|\/\/)/i.test(raw),'No scripts or remote resources: '+asset.file);
 console.log('PASS original offline artwork:',asset.file,asset.width+'×'+asset.height);
}
