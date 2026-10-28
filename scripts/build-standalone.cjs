'use strict';
// Ship the same game and Librarian mode as Amplify, in one offline HTML file.
const fs=require('node:fs'),path=require('node:path');
require('./sync-game-modules.cjs');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'librarian/librarian.css'),'utf8');
const js=fs.readFileSync(path.join(root,'librarian/librarian.js'),'utf8');
if(/<\/script/i.test(js)||/<\/style/i.test(css))throw Error('Unsafe embedded closing tag');
const assets='\n<!-- Offline, self-contained Librarian v4 -->\n<style id="librarian-game-v4">\n'+css+'\n</style>\n<script id="librarian-js-v4">\n'+js+'\n</script>\n';
const output=html.replace('</body>',assets+'</body>');
fs.writeFileSync(path.join(root,'Ellery_Recall_Rally_Librarian_v4.html'),output);
console.log('Built Ellery_Recall_Rally_Librarian_v4.html (offline game + Librarian v4)');
