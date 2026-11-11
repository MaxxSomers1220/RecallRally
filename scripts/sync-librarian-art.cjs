'use strict';
// Embed local illustrated assets in the existing CSS/JS delivery contract.
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8').trim();
const data=(p,type='image/svg+xml')=>'data:'+type+';base64,'+fs.readFileSync(path.join(root,p)).toString('base64');
let css=read('librarian/librarian.css'),js=read('librarian/librarian.js');
const section='/* LIBRARIAN_EMBEDDED_ART_START */\n.lib-canvas-wrap{--lib-room-art:url("'+data('librarian/library-painted.webp','image/webp')+'")}\n.lib-art-room,.lib-art-shelves,.lib-art-balcony{background-image:var(--lib-room-art)}\n.lib-art-foreground{background-image:url("'+data('librarian/library-foreground.svg')+'")}\n/* LIBRARIAN_EMBEDDED_ART_END */';
if(css.includes('/* LIBRARIAN_EMBEDDED_ART_START */'))css=css.replace(/\/\* LIBRARIAN_EMBEDDED_ART_START \*\/[\s\S]*?\/\* LIBRARIAN_EMBEDDED_ART_END \*\//,section);else css+='\n'+section;
const books='/* LIBRARIAN_BOOK_FRAMES_START */\nconst bookFrames='+JSON.stringify(['enchanted-book.svg','enchanted-book-1.svg','enchanted-book-2.svg'].map(p=>data('librarian/'+p)))+'.map(src=>{const img=new Image();img.src=src;return img;});\nconst bookImage=bookFrames[0];\n/* LIBRARIAN_BOOK_FRAMES_END */';
if(js.includes('/* LIBRARIAN_BOOK_FRAMES_START */'))js=js.replace(/\/\* LIBRARIAN_BOOK_FRAMES_START \*\/[\s\S]*?\/\* LIBRARIAN_BOOK_FRAMES_END \*\//,books);else js=js.replace(/^let bookImage=new Image\(\);.*$/m,books);
const guardian='/* LIBRARIAN_GUARDIAN_ART_START */\n guardian=document.createElement(\'div\');guardian.className=\'lib-guardian-sprite\';guardian.setAttribute(\'aria-hidden\',\'true\');guardian.innerHTML='+JSON.stringify(read('librarian/librarian-guardian.svg'))+';stage.appendChild(guardian);\n/* LIBRARIAN_GUARDIAN_ART_END */';
if(js.includes('/* LIBRARIAN_GUARDIAN_ART_START */'))js=js.replace(/\/\* LIBRARIAN_GUARDIAN_ART_START \*\/[\s\S]*?\/\* LIBRARIAN_GUARDIAN_ART_END \*\//,guardian);else js=js.replace(/^ guardian=document.createElement\('img'\);.*$/m,guardian);
fs.writeFileSync(path.join(root,'librarian/librarian.css'),css+'\n');fs.writeFileSync(path.join(root,'librarian/librarian.js'),js+'\n');
