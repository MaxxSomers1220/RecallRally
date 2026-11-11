'use strict';
// Verify both adversarial fixtures and the artifact actually selected by Amplify.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),crypto=require('node:crypto'),zlib=require('node:zlib'),http=require('node:http');
const {buildHosted}=require('../scripts/build-hosted.cjs');
const root=path.join(__dirname,'..'),hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function tree(dir){const out={};for(const name of fs.readdirSync(dir).sort()){const file=path.join(dir,name);if(fs.statSync(file).isDirectory())for(const [child,bytes]of Object.entries(tree(file)))out[name+'/'+child]=bytes;else out[name]=fs.readFileSync(file)}return out}
function snapshot(dir){return Object.fromEntries(Object.entries(tree(dir)).map(([file,bytes])=>[file,hash(bytes)]))}
function sourceSnapshot(dir){return Object.fromEntries(['index.html','librarian/librarian.js','librarian/librarian.css',...['Ellery_Recall_Rally_Librarian_v4.html'].filter(file=>fs.existsSync(path.join(dir,file)))].map(file=>[file,hash(fs.readFileSync(path.join(dir,file)))]))}
function catalog(text){const m=text.match(/\bconst STORYBOOK_AUDIO=([^\r\n]*);/);assert(m,'Audio catalog present');return JSON.parse(m[1])}
function verify(dir){
 const dist=path.join(dir,'dist'),manifest=JSON.parse(fs.readFileSync(path.join(dist,'hosted-build.json'))),files=tree(dist),html=files['index.html'].toString(),game=files[manifest.routes.game].toString(),shipped=catalog(game),source=catalog(fs.readFileSync(path.join(dir,'index.html'),'utf8'));
 assert(!/data:[^,\s"']+;base64,/i.test(html),'No embedded binary in document');
 assert(!html.includes('/* STORYBOOK_MUSIC_START */'),'Main game is external');
 assert(html.includes('<script id="rally-game-script" src="'+manifest.routes.game+'"></script>'),'Main retains classic parser execution before DOMContentLoaded');
 assert(html.indexOf(manifest.routes.game)<html.indexOf(manifest.routes.librarian.script),'Classic game runs before deferred Librarian');
 assert(html.includes('as="image" href="'+manifest.routes.homePreload+'"'),'Home painting is preloaded');
 assert(!/as="(?:audio|fetch)"/.test(html),'Audio is not preloaded by the document');
 assert(html.includes('href="'+manifest.routes.librarian.stylesheet+'"')&&html.includes('src="'+manifest.routes.librarian.script+'"'),'Both Librarian routes are injected');
 assert.equal(Object.keys(files).length,Object.keys(manifest.files).length+1,'No source trees or untracked build files are shipped');
 for(const [file,record]of Object.entries(manifest.files)){
  assert(files[file],file+' exists');assert.equal(hash(files[file]),record.sha256,file+' content hash');assert.equal(files[file].length,record.raw,file+' byte size');assert.equal(zlib.gzipSync(files[file],{level:9}).length,record.gzip,file+' gzip size');
  if(file!=='index.html')assert(file.includes('.'+record.sha256+'.'),file+' content-addressed filename');
  if(/\.(?:html|js|css|svg)$/.test(file)){
   const text=files[file].toString();assert(!/data:[^,\s"']+;base64,/i.test(text),'No embedded binary in '+file);
   for(const match of text.matchAll(/(?:\.\.\/)?assets\/(?:image|audio|game)\.[a-f0-9]{64}\.[a-z0-9]+/g)){
    // CSS URLs are stylesheet-relative; JS strings are document-relative.
    const resolved=path.posix.normalize(path.posix.join(file.endsWith('.css')?path.posix.dirname(file):'',match[0]));assert(files[resolved],file+' URL resolves: '+match[0]);
   }
  }
 }
 for(const input of ['index.html','librarian/librarian.js','librarian/librarian.css'])for(const match of fs.readFileSync(path.join(dir,input),'utf8').matchAll(/data:(image\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=]+)/gi)){
  const bytes=Buffer.from(match[2],'base64');assert(Object.values(manifest.files).some(file=>file.sha256===hash(bytes)),'Every source image survives byte-for-byte');
 }
 const audioHashes=new Set();
 for(const [kind,entry]of Object.entries(source)){
  assert(shipped[kind],'Audio metadata retained: '+kind);assert(!Object.hasOwn(shipped[kind],'data'),'No base64 audio field: '+kind);
  assert(files[shipped[kind].url],'Audio URL resolves: '+kind);
  for(const [key,value]of Object.entries(entry))if(key!=='data')assert.deepEqual(shipped[kind][key],value,'Audio metadata '+kind+'.'+key);
  if(entry.data){const bytes=Buffer.from(entry.data,'base64');assert.equal(hash(files[shipped[kind].url]),hash(bytes),'Audio bytes retained: '+kind);audioHashes.add(hash(bytes))}
  if(entry.dataRef)assert.equal(shipped[kind].url,shipped[entry.dataRef].url,'Aliases share one audio resource');
 }
 assert.equal(manifest.counts.audioRecordings,audioHashes.size,'Identical recordings deduplicate');
 assert.equal(new Set(Object.values(shipped).map(entry=>entry.url)).size,audioHashes.size,'All aliases use existing recordings');
 return manifest;
}
function fixture(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'recall-hosted-fixture-')),image=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0h8v8z"/></svg>').toString('base64'),audio=Buffer.from('ID3 fixture recording').toString('base64'),imageURL='data:image/svg+xml;base64,'+image;
 const entries={home:{title:'Home',loopSeconds:4,data:audio},map:{title:'Map',loopSeconds:4,data:audio},'lab-hub':{loopSeconds:4,data:audio},'lab-potion':{loopSeconds:4,dataRef:'lab-hub'}};
 fs.mkdirSync(path.join(dir,'librarian'));
 const html='<!doctype html><html><head><style>.test{background:url("'+imageURL+'")}</style></head><body><img src="'+imageURL+'"><script>\n/* STORYBOOK_MUSIC_START */\nconst STORYBOOK_AUDIO='+JSON.stringify(entries)+';\nconst HOME_HUB_ART='+JSON.stringify({hall:imageURL})+';\nfor(const a of Object.values(STORYBOOK_AUDIO))if(a.dataRef)a.data=STORYBOOK_AUDIO[a.dataRef].data;\n</script></body></html>';
 fs.writeFileSync(path.join(dir,'index.html'),html);fs.writeFileSync(path.join(dir,'Ellery_Recall_Rally_Librarian_v4.html'),'offline fixture is untouched');fs.writeFileSync(path.join(dir,'librarian/librarian.js'),'const book="'+imageURL+'";');fs.writeFileSync(path.join(dir,'librarian/librarian.css'),'.book{background:url('+imageURL+')}');
 try{
  const before=sourceSnapshot(dir),manifest=buildHosted({root:dir});verify(dir);assert.deepEqual(sourceSnapshot(dir),before,'Hosted build never edits source or standalone');assert.equal(manifest.counts.uniqueImages,1,'Image dedup spans HTML/CSS/JS and Librarian');assert.equal(manifest.counts.imageReferences,5);assert.equal(manifest.counts.audioRecordings,1);
  const first=snapshot(path.join(dir,'dist'));buildHosted({root:dir});assert.deepEqual(snapshot(path.join(dir,'dist')),first,'Byte-for-byte deterministic output');
  for(const [name,mutate]of [
   ['malformed image',text=>text.replace(image,'bad%payload')],
   ['malformed audio',text=>text.replace(audio,'%%%')],
   ['noncanonical audio',text=>text.replace(audio,audio.slice(0,-1))],
   ['missing alias',text=>text.replace('"dataRef":"lab-hub"','"dataRef":"missing"')],
   ['cyclic alias',text=>text.replace('"dataRef":"lab-hub"','"dataRef":"lab-potion"')],
   ['missing main script',text=>text.replace('/* STORYBOOK_MUSIC_START */','')]
  ]){fs.writeFileSync(path.join(dir,'index.html'),mutate(html));assert.throws(()=>buildHosted({root:dir}),undefined,name+' fails clearly');assert.deepEqual(snapshot(path.join(dir,'dist')),first,'Failed '+name+' build preserves prior artifact')}
  console.log('PASS hosted fixtures: deterministic extraction/dedup, CSS and JS routes, metadata/aliases, unchanged offline source, malformed input rollback');
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
}
async function routes(dir,manifest){
 const dist=path.join(dir,'dist'),server=http.createServer((req,res)=>{const route=req.url==='/'?'index.html':req.url.slice(1),record=manifest.files[route];if(!record){res.writeHead(404).end();return}res.setHeader('Content-Type',record.mime);res.end(fs.readFileSync(path.join(dist,route)))});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
 try{await Promise.all(Object.entries(manifest.files).map(([file,record])=>new Promise((resolve,reject)=>http.get('http://127.0.0.1:'+server.address().port+'/'+file,response=>{const chunks=[];response.on('data',chunk=>chunks.push(chunk));response.on('end',()=>{try{assert.equal(response.statusCode,200,file);assert.equal(response.headers['content-type'],record.mime,file+' MIME');assert.equal(hash(Buffer.concat(chunks)),record.sha256,file+' HTTP bytes');resolve()}catch(error){reject(error)}})}).on('error',reject))))}finally{await new Promise(resolve=>server.close(resolve))}
}
(async()=>{
 fixture();if(process.argv.includes('--fixtures-only'))return;
 assert(fs.existsSync(path.join(root,'dist/hosted-build.json')),'Run node scripts/build-hosted.cjs first, as Amplify does');
 const before=sourceSnapshot(root),first=snapshot(path.join(root,'dist')),manifest=verify(root);buildHosted({root});assert.deepEqual(snapshot(path.join(root,'dist')),first,'Actual Amplify output is deterministic');assert.deepEqual(sourceSnapshot(root),before,'Actual source/offline output unchanged');
 if(process.argv.includes('--files-only')){console.log('PASS actual hosted file integrity: all assets/URLs, hashes, metadata, aliases, deterministic output and unchanged standalone. HTTP route checks explicitly not run.');return}
 await routes(root,manifest);
 console.log('PASS actual hosted artifact: all HTML, JS, CSS, image and audio routes resolve with verified hashes/bytes, no embedded binary, metadata intact, deterministic output');
})().catch(error=>{console.error(error);process.exitCode=1});
