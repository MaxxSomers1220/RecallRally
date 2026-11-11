'use strict';
// The offline builder remains the source of truth. Hosting removes only embedded
// binary payloads and gives the browser a small document plus cacheable assets.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const mimeExtensions={'image/webp':'webp','image/png':'png','image/jpeg':'jpg','image/gif':'gif','image/svg+xml':'svg','image/avif':'avif','image/x-icon':'ico'};
const audioAlias='for(const a of Object.values(STORYBOOK_AUDIO))if(a.dataRef)a.data=STORYBOOK_AUDIO[a.dataRef].data;';
const hostedAlias='for(const a of Object.values(STORYBOOK_AUDIO))if(a.dataRef)a.url=STORYBOOK_AUDIO[a.dataRef].url;';
function decodeBase64(value,label){
 if(typeof value!=='string'||!value.length||value.length%4||!/^[A-Za-z0-9+/]*={0,2}$/.test(value))throw Error('Malformed base64: '+label);
 const bytes=Buffer.from(value,'base64');
 if(bytes.toString('base64')!==value)throw Error('Noncanonical base64: '+label);
 return bytes;
}
function buildHosted({root=path.join(__dirname,'..')}={}){
 root=path.resolve(root);const output=path.join(root,'dist'),inputs={};
 for(const file of ['index.html','librarian/librarian.js','librarian/librarian.css'])inputs[file]=fs.readFileSync(path.join(root,file));
 const files=new Map(),imageUses=new Map(),audioUses=new Map();
 function asset(bytes,extension,mime,kind){
  const sha256=hash(bytes),file='assets/'+kind+'.'+sha256+'.'+extension;
  if(files.has(file)&&!files.get(file).bytes.equals(bytes))throw Error('Content hash collision: '+file);
  files.set(file,{bytes,mime,sha256});return file;
 }
 function images(text,relativePrefix=''){
  const result=text.replace(/data:(image\/[a-z0-9.+-]+);base64,([^\s"'<>`\\)]*)/gi,(_,type,payload)=>{
   const mime=type.toLowerCase(),extension=mimeExtensions[mime];if(!extension)throw Error('Unsupported embedded image type: '+mime);
   const bytes=decodeBase64(payload,mime),file=asset(bytes,extension,mime,'image');
   imageUses.set(file,(imageUses.get(file)||0)+1);return relativePrefix+file;
  });
  if(/data:image\/[^,\s"'<>`]*;base64,/i.test(result))throw Error('Unconverted embedded image');
  return result;
 }
 let html=images(inputs['index.html'].toString('utf8'));
 let catalog;
 const catalogPattern=/\bconst STORYBOOK_AUDIO=([^\r\n]*);/;
 if(!catalogPattern.test(html))throw Error('STORYBOOK_AUDIO catalog not found');
 html=html.replace(catalogPattern,(_,json)=>{
  try{catalog=JSON.parse(json)}catch(error){throw Error('Malformed STORYBOOK_AUDIO catalog: '+error.message)}
  if(!catalog||typeof catalog!=='object'||Array.isArray(catalog))throw Error('Invalid STORYBOOK_AUDIO catalog');
  for(const [kind,entry]of Object.entries(catalog)){
   if(!entry||typeof entry!=='object'||Array.isArray(entry))throw Error('Invalid audio entry: '+kind);
   if(Object.hasOwn(entry,'data')){
    const bytes=decodeBase64(entry.data,'STORYBOOK_AUDIO.'+kind),file=asset(bytes,'mp3','audio/mpeg','audio');
    entry.url=file;delete entry.data;audioUses.set(file,(audioUses.get(file)||0)+1);
   }else if(!entry.dataRef)throw Error('Missing audio data: '+kind);
  }
  // Resolve aliases during packaging too, so cycles or missing targets cannot
  // become silent runtime failures. dataRef remains available to share a buffer.
  function resolve(kind,seen=new Set()){
   const entry=catalog[kind];if(!entry)throw Error('Missing audio dataRef: '+kind);
   if(seen.has(kind))throw Error('Cyclic audio dataRef: '+kind);
   if(entry.dataRef){seen.add(kind);const url=resolve(entry.dataRef,seen);if(entry.url&&entry.url!==url)throw Error('Conflicting audio dataRef: '+kind);entry.url=url}
   if(!entry.url)throw Error('Missing audio URL: '+kind);return entry.url;
  }
  for(const kind of Object.keys(catalog))resolve(kind);
  return 'const STORYBOOK_AUDIO='+JSON.stringify(catalog)+';';
 });
 if(!html.includes(audioAlias))throw Error('Offline audio alias initialization not found');
 html=html.replace(audioAlias,hostedAlias);
 const homeMatch=html.match(/\bconst HOME_HUB_ART=([^\r\n]*);/);
 if(!homeMatch)throw Error('HOME_HUB_ART catalog not found');
 let home;try{home=JSON.parse(homeMatch[1])}catch(error){throw Error('Malformed HOME_HUB_ART catalog: '+error.message)}
 if(!files.has(home.hall))throw Error('Home hall preload does not resolve to an extracted asset');
 if(!/<\/head\s*>/i.test(html)||!/<\/body\s*>/i.test(html))throw Error('Hosted document is missing head/body close tags');
 html=html.replace(/<\/head\s*>/i,'<link rel="preload" as="image" href="'+home.hall+'" fetchpriority="high">\n</head>');
 let mainScript,count=0;
 html=html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi,(tag,attributes,source)=>{
  if(!source.includes('/* STORYBOOK_MUSIC_START */'))return tag;
  if(attributes.trim())throw Error('Unexpected attributes on the main game script');
  mainScript=asset(Buffer.from(source),'js','text/javascript','game');count++;
  // Keep classic parser execution at the original body location. Modules use
  // readyState === 'loading' to postpone initialization until all globals exist.
  return '<script id="rally-game-script" src="'+mainScript+'"></script>';
 });
 if(count!==1)throw Error('Expected one main game script, found '+count);
 const librarianJS=Buffer.from(images(inputs['librarian/librarian.js'].toString('utf8')));
 // Stylesheet URLs resolve against its librarian/ directory; JS image strings
 // resolve against index.html, just like their former data: URLs.
 const librarianCSS=Buffer.from(images(inputs['librarian/librarian.css'].toString('utf8'),'../'));
 function librarian(bytes,extension,mime){const sha256=hash(bytes),file='librarian/librarian.'+sha256+'.'+extension;files.set(file,{bytes,mime,sha256});return file}
 const librarianRoutes={stylesheet:librarian(librarianCSS,'css','text/css'),script:librarian(librarianJS,'js','text/javascript')};
 if(/(?:href|src)=["']librarian\//.test(html))throw Error('Source index already includes external Librarian assets');
 html=html.replace(/<\/body\s*>/i,'<link rel="stylesheet" href="'+librarianRoutes.stylesheet+'"><script defer src="'+librarianRoutes.script+'"></script>\n</body>');
 files.set('index.html',{bytes:Buffer.from(html),mime:'text/html',sha256:hash(Buffer.from(html))});
 // Never ship an unnoticed audio/image embedding in an additional script or CSS.
 for(const [file,entry]of files)if(/\.(?:html|js|css|svg)$/.test(file)&&/data:[^,\s"']+;base64,/i.test(entry.bytes.toString('utf8')))throw Error('Embedded binary remains in '+file);
 const measures=bytes=>({raw:bytes.length,gzip:zlib.gzipSync(bytes,{level:9}).length});
 const add=rows=>rows.reduce((sum,row)=>({raw:sum.raw+row.raw,gzip:sum.gzip+row.gzip}),{raw:0,gzip:0});
 const records=Object.fromEntries([...files].sort(([a],[b])=>a.localeCompare(b)).map(([file,entry])=>[file,{sha256:entry.sha256,mime:entry.mime,...measures(entry.bytes)}]));
 const initialRoutes=['index.html',mainScript,librarianRoutes.stylesheet,librarianRoutes.script,home.hall];
 const manifest={version:1,routes:{document:'index.html',game:mainScript,librarian:librarianRoutes,homePreload:home.hall},counts:{imageReferences:[...imageUses.values()].reduce((a,b)=>a+b,0),uniqueImages:imageUses.size,audioRecordings:audioUses.size,audioEntries:Object.keys(catalog).length,audioAliases:Object.values(catalog).filter(a=>a.dataRef).length},metrics:{sourceIndex:measures(inputs['index.html']),sourceHosted:add(Object.values(inputs).map(measures)),hostedHTML:records['index.html'],coreBootResources:add([...new Set(initialRoutes)].map(file=>records[file])),completeHosted:add(Object.values(records))},files:records};
 const temporary=fs.mkdtempSync(path.join(root,'.hosted-build-'));
 try{
  for(const [file,entry]of files){const dest=path.join(temporary,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,entry.bytes)}
  fs.writeFileSync(path.join(temporary,'hosted-build.json'),JSON.stringify(manifest,null,2)+'\n');
  fs.rmSync(output,{recursive:true,force:true});fs.renameSync(temporary,output);
 }finally{fs.rmSync(temporary,{recursive:true,force:true})}
 return manifest;
}
if(require.main===module){
 const manifest=buildHosted(),m=manifest.metrics,format=bytes=>(bytes/1024).toFixed(1)+' KiB';
 console.log('Hosted HTML: '+format(m.hostedHTML.raw)+' raw / '+format(m.hostedHTML.gzip)+' gzip (source index '+format(m.sourceIndex.raw)+' / '+format(m.sourceIndex.gzip)+')');
 console.log('Core boot files plus home preload (additional dynamic art excluded): '+format(m.coreBootResources.raw)+' raw / '+format(m.coreBootResources.gzip)+' gzip; '+manifest.counts.uniqueImages+' images and '+manifest.counts.audioRecordings+' recordings stored separately.');
}
module.exports={buildHosted};
