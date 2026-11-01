'use strict';
// Keep the distributed single-file game in sync with its editable modules/art.
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),file=path.join(root,'index.html');
let html=fs.readFileSync(file,'utf8');
const read=name=>fs.readFileSync(path.join(root,name),'utf8').trim();
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
fs.writeFileSync(file,html);
