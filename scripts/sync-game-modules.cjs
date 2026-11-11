'use strict';
// Keep the distributed single-file game in sync with its editable modules/art.
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),file=path.join(root,'index.html');
let html=fs.readFileSync(file,'utf8');
const read=name=>fs.readFileSync(path.join(root,name),'utf8').trim();
// Keep the uninitialized name/avatar and viewer warning out of normal startup.
const startupHead='<style id="rally-startup-styles">\n'+read('src/startup.css')+'\n</style>\n<script id="rally-startup-script">\n'+read('src/startup.js')+'\n</script>';
if(html.includes('<style id="rally-startup-styles">'))html=html.replace(/<style id="rally-startup-styles">[^]*?<\/script>/,()=>startupHead);
else html=html.replace('</head>',()=>startupHead+'\n</head>');
const startupShell='<section id="startup-loading" role="status" aria-live="polite"><span class="eyebrow">WELCOME TO RECALL RALLY</span><h1>A little practice.<br>A bigger adventure.</h1><p class="startup-progress">Opening your adventure…</p><div class="startup-recovery"><p>This is taking longer than usual. Check your connection, then try again.</p><a href="">Reload Recall Rally</a></div></section>';
if(html.includes('<section id="startup-loading"'))html=html.replace(/<section id="startup-loading"[^]*?<\/section>/,()=>startupShell);
else html=html.replace('<main id="play-area">',()=>startupShell+'\n<main id="play-area">');
html=html.replace(/<div class="callout" id="startup-warning"[^]*?<\/div>/,'<div class="callout" id="startup-warning" role="status" style="margin-top:24px"><strong>The interactive game needs JavaScript.</strong><br>Open Recall Rally in your browser with JavaScript enabled. A chat attachment or file preview may show the page without running the game. Instructions are below under How to play.</div>');
if(!html.includes('window.RallyStartup?.coreReady();'))html=html.replace("$('runtime-status').hidden=false;","$('runtime-status').hidden=false;\nwindow.RallyStartup?.coreReady();");
// Audio stays editable as modules; builds regenerate both large distribution files.
const audioBlock=/^function initAudio\([^]*?\/\/ End original soundtrack\./m;
if(!audioBlock.test(html))throw Error('Audio coordinator embed location not found');
html=html.replace(audioBlock,()=>read('src/audio-coordinator.js'));
for(const patch of JSON.parse(read('src/audio-integration.json')).patches){
 if(html.includes(patch.before))html=html.replace(patch.before,()=>patch.after);
 else if(!html.includes(patch.after))throw Error('Audio integration location changed: '+patch.name);
}
// Guide additions stay editable as data and are embedded for offline/file:// play.
const guideAdditions=JSON.parse(read('data/study-guide-expansion-2026.json'));
const guideRoundTwo=JSON.parse(read('data/study-guide-round-two-2026.json'));
const guideRoundThree=JSON.parse(read('data/study-guide-round-three-2026.json'));
const guideRoundFour=JSON.parse(read('data/study-guide-round-four-2026.json'));
const guideRoundFive=JSON.parse(read('data/study-guide-round-five-2026.json'));
const guideRoundSix=JSON.parse(read('data/study-guide-round-six-2026.json'));
const guideEmbed='/* STUDY_GUIDE_ADDITIONS_START */\nconst STUDY_GUIDE_ADDITIONS='+JSON.stringify(guideAdditions).replace(/</g,'\\u003c')+';\nGUIDE_QUESTIONS.push(...STUDY_GUIDE_ADDITIONS);\nconst STUDY_GUIDE_ROUND_TWO='+JSON.stringify(guideRoundTwo).replace(/</g,'\\u003c')+';\nGUIDE_QUESTIONS.push(...STUDY_GUIDE_ROUND_TWO);\nconst STUDY_GUIDE_ROUND_THREE='+JSON.stringify(guideRoundThree).replace(/</g,'\\u003c')+';\nGUIDE_QUESTIONS.push(...STUDY_GUIDE_ROUND_THREE);\nconst STUDY_GUIDE_ROUND_FOUR='+JSON.stringify(guideRoundFour).replace(/</g,'\\u003c')+';\nGUIDE_QUESTIONS.push(...STUDY_GUIDE_ROUND_FOUR);\nconst STUDY_GUIDE_ROUND_FIVE='+JSON.stringify(guideRoundFive).replace(/</g,'\\u003c')+';\nGUIDE_QUESTIONS.push(...STUDY_GUIDE_ROUND_FIVE);\nconst STUDY_GUIDE_ROUND_SIX='+JSON.stringify(guideRoundSix).replace(/</g,'\\u003c')+';\nGUIDE_QUESTIONS.push(...STUDY_GUIDE_ROUND_SIX);\n/* STUDY_GUIDE_ADDITIONS_END */';
if(html.includes('/* STUDY_GUIDE_ADDITIONS_START */'))html=html.replace(/\/\* STUDY_GUIDE_ADDITIONS_START \*\/[\s\S]*?\/\* STUDY_GUIDE_ADDITIONS_END \*\//,()=>guideEmbed);
else {
 if(!html.includes('/* QUESTION_DATABASE_END */'))throw Error('Question database embed marker not found');
 html=html.replace('/* QUESTION_DATABASE_END */',()=>guideEmbed+'\n/* QUESTION_DATABASE_END */');
}
const answers=read('src/answer-recognition.js');
if(html.includes('/* ANSWER_RECOGNITION_START */'))html=html.replace(/\/\* ANSWER_RECOGNITION_START \*\/[\s\S]*?\/\* ANSWER_RECOGNITION_END \*\//,answers);
else html=html.replace('function checkTyped(',answers+'\nfunction checkTyped(');
const experienceCSS='<style id="player-experience-styles">\n'+read('src/player-experience.css')+'\n</style>';
if(html.includes('<style id="player-experience-styles">'))html=html.replace(/<style id="player-experience-styles">[\s\S]*?<\/style>/,experienceCSS);
else html=html.replace('</head>',experienceCSS+'\n</head>');
const quest=read('src/adventure-save.js');
const a=html.indexOf('/* QUEST_SAVES_START'),b=html.indexOf('/* QUEST_SAVES_END */',a)+'/* QUEST_SAVES_END */'.length;
if(a<0||b<a)throw Error('Adventure save embed markers not found');
html=html.slice(0,a)+quest+html.slice(b);
const art={weather:read('assets/science-lab/weather-machine-chassis.svg'),observatory:read('assets/science-lab/star-observatory-chassis.svg'),creature:read('assets/science-lab/creature-incubator-chassis.svg'),circuit:read('assets/science-lab/circuit-constructor-chassis.svg'),room:'data:image/svg+xml;base64,'+Buffer.from(read('assets/science-lab/laboratory.svg')).toString('base64'),professor:read('assets/science-lab/professor-fizzwick.svg'),potion:read('assets/science-lab/potion-mixer-chassis.svg'),potionProfessor:read('assets/science-lab/professor-fizzwick-potion.svg')};
const script='/* SCIENCE_LAB_START */\nconst SCIENCE_LAB_ART='+JSON.stringify(art).replace(/</g,'\\u003c')+';\n'+read('src/science-lab-models.js')+'\n'+read('src/science-lab-potion.js')+'\n'+read('src/science-lab-circuit.js')+'\n'+read('src/science-lab-creature.js')+'\n'+read('src/science-lab-weather.js')+'\n'+read('src/science-lab-observatory.js')+'\n'+read('src/science-lab.js')+'\n/* SCIENCE_LAB_END */';
if(html.includes('/* SCIENCE_LAB_START */'))html=html.replace(/\/\* SCIENCE_LAB_START \*\/[\s\S]*?\/\* SCIENCE_LAB_END \*\//,script);
else html=html.replace('/* QUEST_SAVES_END */','/* QUEST_SAVES_END */\n\n'+script);
const css='<style id="science-lab-styles">\n'+read('src/science-lab.css')+'\n</style>';
if(html.includes('<style id="science-lab-styles">'))html=html.replace(/<style id="science-lab-styles">[\s\S]*?<\/style>/,css);
else html=html.replace('</head>',css+'\n</head>');
const mobileCSS='<style id="mobile-playability-styles">\n'+read('src/mobile-playability.css')+'\n</style>';
if(html.includes('<style id="mobile-playability-styles">'))html=html.replace(/<style id="mobile-playability-styles">[\s\S]*?<\/style>/,()=>mobileCSS);else html=html.replace('</head>',mobileCSS+'\n</head>');
const mobileJS='/* MOBILE_PLAYABILITY_START */\n'+read('src/mobile-playability.js')+'\n/* MOBILE_PLAYABILITY_END */';
if(html.includes('/* MOBILE_PLAYABILITY_START */'))html=html.replace(/\/\* MOBILE_PLAYABILITY_START \*\/[\s\S]*?\/\* MOBILE_PLAYABILITY_END \*\//,()=>mobileJS);else html=html.replace('/* QUEST_SAVES_END */','/* QUEST_SAVES_END */\n'+mobileJS);




const homeArt={};
for(const row of JSON.parse(read('assets/home/manifest.json')).assets)homeArt[row.key]='data:image/webp;base64,'+fs.readFileSync(path.join(root,'assets/home',row.file)).toString('base64');
const homeCSS='<style id="home-hub-styles">\n'+read('src/home-hub.css')+'\n</style>';
if(html.includes('<style id="home-hub-styles">'))html=html.replace(/<style id="home-hub-styles">[\s\S]*?<\/style>/,()=>homeCSS);else html=html.replace('</head>',homeCSS+'\n</head>');
const homeJS='/* HOME_HUB_START */\nconst HOME_HUB_ART='+JSON.stringify(homeArt).replace(/</g,'\\u003c')+';\n'+read('src/home-hub.js')+'\n/* HOME_HUB_END */';
if(html.includes('/* HOME_HUB_START */'))html=html.replace(/\/\* HOME_HUB_START \*\/[\s\S]*?\/\* HOME_HUB_END \*\//,()=>homeJS);else html=html.replace('/* QUEST_SAVES_END */','/* QUEST_SAVES_END */\n'+homeJS);
const scoreData={};
for(const cue of JSON.parse(read('assets/music/manifest.json')).assets)scoreData[cue.id]={title:cue.title,loopSeconds:cue.loopSeconds,loopFrames:cue.loopFrames,loopBars:cue.loopBars,channels:cue.channels,sampleRate:cue.sampleRate,mp3:cue.mp3,bpm:cue.bpm,data:fs.readFileSync(path.join(root,cue.file)).toString('base64')};
// Uploaded replacements are embedded once; all Science Lab scenes share one recording.
const uploads=JSON.parse(read('assets/music/user/manifest.json'));
const supplied=new Map(uploads.assets.map(a=>[a.id,a]));
for(const [kind,name] of Object.entries(uploads.mapping)){
 const a=supplied.get(name);if(!a)throw Error('Missing uploaded music: '+name);
 scoreData[kind]={...scoreData[kind],...a,id:kind,data:fs.readFileSync(path.join(root,a.file)).toString('base64')};
}
for(const kind of ['lab-potion','lab-circuit','lab-creature','lab-weather','lab-observatory'])scoreData[kind]={...scoreData['lab-hub'],id:kind,dataRef:'lab-hub',data:undefined};
const credits={notice:'User-supplied recordings replace Home, the map, guardians and Science Lab; their rights remain with their respective owners and no license is inferred. Remaining original Lantern Afterglow arrangements use TimGM6mb by Tim Brechbill (2004) and David Bolton (2010). Those legacy rendered MP3s and SoundFont assets: GPL-2.0-only; editable original scores and application code: repository MIT license.',source:'https://github.com/MaxxSomers1220/RecallRally — assets/music/source and scripts/render-storybook-music.py',license:read('assets/music/LICENSE-GPL-2.txt')};
const musicJS='/* STORYBOOK_MUSIC_START */\nconst STORYBOOK_AUDIO='+JSON.stringify(scoreData)+';\nconst STORYBOOK_AUDIO_CREDITS='+JSON.stringify(credits).replace(/</g,'\\u003c')+';\nfor(const a of Object.values(STORYBOOK_AUDIO))if(a.dataRef)a.data=STORYBOOK_AUDIO[a.dataRef].data;\n'+read('src/storybook-music.js')+'\n/* STORYBOOK_MUSIC_END */';
if(html.includes('/* STORYBOOK_MUSIC_START */'))html=html.replace(/\/\* STORYBOOK_MUSIC_START \*\/[\s\S]*?\/\* STORYBOOK_MUSIC_END \*\//,()=>musicJS);else html=html.replace('/* QUEST_SAVES_END */','/* QUEST_SAVES_END */\n'+musicJS);
fs.writeFileSync(file,html);
