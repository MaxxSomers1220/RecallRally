'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const vm=require('node:vm');
const cp=require('node:child_process');

const root=path.join(__dirname,'..');
const game=fs.readFileSync(path.join(root,'librarian/librarian.js'),'utf8');
const css=fs.readFileSync(path.join(root,'librarian/librarian.css'),'utf8');
new vm.Script(game,{filename:'librarian.js'});
assert(css.includes('#lib-launch'));
assert(css.includes('#lib-canvas'));
assert(game.includes('function buzz()'));
assert(game.includes('function jump()'));
assert(game.includes('function useShield()'));
assert(game.includes('SAMPLES'));
assert(game.includes('function dash()'),'Dash must be implemented');
assert(game.includes('function bookWarning()'),'Incoming books must be telegraphed');
assert(game.includes('function mountActors()'),'Visual actors must mount');
assert(game.includes('renderGameHero(avatarLook'),'Arcade must preserve custom hero identity');
assert(game.includes('function visibilityChanged()'),'Timers must pause while hidden');
for(const asset of ['library-backdrop.svg','librarian-guardian.svg','enchanted-book.svg']){
  const file=path.join(root,'librarian',asset);
  assert(fs.existsSync(file),'Missing illustrated asset: '+asset);
  const xml=fs.readFileSync(file,'utf8');
  assert(xml.startsWith('<svg'),'Invalid SVG entry: '+asset);
  assert(xml.includes('</svg>'),'Invalid SVG closure: '+asset);
}

assert.equal((game.match(/source:'Example question/g)||[]).length,1,'Demo attribution is generated in a single place');
assert(game.includes('not from state study guide'),'Demo items must be labeled as examples');

const elements=[];
const doc={
  createElement:function(name) {return {nodeName:name,attributes:{},setAttribute:function(k,v){this.attributes[k]=v;},addEventListener:function(k,fn){this['on_'+k]=fn;}};},
  body:{appendChild:function(node){elements.push(node);}}
};
const runtime={window:{},document:doc,console:console,Math:Math,Image:function(){this.complete=false;this.naturalWidth=0;}};
vm.runInNewContext(game,runtime,{timeout:2000});
assert.equal(elements.length,1,'Boot adds exactly one game entry point');
assert.equal(elements[0].id,'lib-launch');
assert.equal(typeof elements[0].on_click,'function');
vm.runInNewContext(game,runtime,{timeout:2000});
assert.equal(elements.length,1,'Repeated boot must not create duplicate buttons');

const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'librarian-smoke-'));
try {
  const htmlFile=path.join(tmp,'index.html');
  fs.writeFileSync(htmlFile,'<!doctype html><html><body><h1>Recall Rally</h1></body></html>');
  const inject=path.join(root,'scripts/inject-librarian.cjs');
  cp.execFileSync(process.execPath,[inject,htmlFile],{stdio:'pipe'});
  cp.execFileSync(process.execPath,[inject,htmlFile],{stdio:'pipe'});
  const html=fs.readFileSync(htmlFile,'utf8');
  assert.equal((html.match(/librarian\/librarian.js/g)||[]).length,1,'Asset injection must be idempotent');
  assert.equal((html.match(/librarian\/librarian.css/g)||[]).length,1);
  assert(html.includes('<h1>Recall Rally</h1>'));
} finally {fs.rmSync(tmp,{recursive:true,force:true});}
console.log('PASS Librarian v2: syntax, launch guard, hero integration, warning/dash mechanics, 3 SVG assets, idempotent build injection');
