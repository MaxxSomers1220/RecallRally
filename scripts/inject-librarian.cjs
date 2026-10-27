// Appends the optional Librarian arcade mode to the shipped self-contained HTML.
// Intentionally does not rewrite the original index.html or its localStorage keys.
'use strict';
const fs = require('node:fs');
const file = process.argv[2] || 'dist/index.html';
let html = fs.readFileSync(file, 'utf8');
const tag = '<link rel="stylesheet" href="librarian/librarian.css">' +
  '<script defer src="librarian/librarian.js"></script>';
if (!html.includes('librarian/librarian.js')) {
  if (!/<\/body\s*>/i.test(html)) {
    throw new Error('Cannot find the closing body tag in ' + file);
  }
  html = html.replace(/<\/body\s*>/i, tag + '\n</body>');
  fs.writeFileSync(file, html, 'utf8');
}
console.log('The Librarian assets included in ' + file);
