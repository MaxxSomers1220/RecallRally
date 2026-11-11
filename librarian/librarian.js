/* The Librarian v4 — multi-choice, precise platform controls, magic lessons.
 * Isolated enhancement: original Recall Rally and local progress are untouched. */
(function(){
'use strict';
if(window.__librarianInstalled)return;
window.__librarianInstalled=true;
const WIDTH=960,HEIGHT=460,FLOOR=405,COUNT=8,RECORD_KEY='recall-rally-librarian-v1';
const LETTERS=['A','B','C','D'];
const DEMO=[
 ['Who wrote Charlotte’s Web?','E. B. White',['Roald Dahl','Beverly Cleary','Kate DiCamillo'],'E. B. White wrote the story of Wilbur and Charlotte.'],
 ['Who wrote The Lion, the Witch and the Wardrobe?','C. S. Lewis',['J. R. R. Tolkien','Madeleine L’Engle','L. Frank Baum'],'C. S. Lewis wrote the Chronicles of Narnia.'],
 ['Which pig is Charlotte’s friend in Charlotte’s Web?','Wilbur',['Templeton','Fern','Homer'],'Wilbur is the young pig that Charlotte helps.'],
 ['Who wrote The Wonderful Wizard of Oz?','L. Frank Baum',['Lewis Carroll','J. M. Barrie','Beatrix Potter'],'L. Frank Baum created the land of Oz.'],
 ['What kind of animal is Aslan in the Narnia stories?','A lion',['A tiger','A wolf','A bear'],'Aslan is the great lion of Narnia.'],
 ['Who wrote Alice’s Adventures in Wonderland?','Lewis Carroll',['Oscar Wilde','Charles Dickens','Jules Verne'],'Lewis Carroll was the pen name of Charles Lutwidge Dodgson.'],
 ['Who wrote Anne of Green Gables?','L. M. Montgomery',['Louisa May Alcott','Frances Hodgson Burnett','Laura Ingalls Wilder'],'Lucy Maud Montgomery created Anne Shirley.'],
 ['Who is the main girl in Alice’s Adventures in Wonderland?','Alice',['Dorothy','Wendy','Matilda'],'Alice travels through the fantastical world of Wonderland.']
].map((a,i)=>({id:'lib-demo-'+(i+1),subject:'language',topic:'Literature',prompt:a[0],answer:a[1],options:[a[1],...a[2]],explanation:a[3],source:'Original demonstration question; not from state study guide',demo:true}));
const BOOK_TOPIC=/\b(book|novel|author|poet|poem|story|stories|literature|fiction|fairy|folktale|fable|character|protagonist|biography|reading|playwright|drama|legend|myth|genre|title|writers?)\b/i;
const MOVEMENT_CODES=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyA','KeyD','KeyW','KeyS','Space','ShiftLeft','ShiftRight','KeyQ'];
const reduced=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const $=id=>root&&root.querySelector('#'+id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
function unique4(q){
 if(!q||!q.answer||!Array.isArray(q.options))return null;
 const answers=[q.answer,...q.options].filter(x=>typeof x==='string'&&x.trim());
 const seen=new Set(),out=[];
 for(const a of answers){const k=norm(a);if(k&&!seen.has(k)){seen.add(k);out.push(a.trim());}}
 if(out.length<4)return null;
 return [q.answer,...out.filter(a=>norm(a)!==norm(q.answer)).slice(0,3)];
}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function history(){try{const h=JSON.parse(localStorage.getItem(RECORD_KEY)||'{}');return h&&typeof h==='object'?h:{}}catch(e){return {}}}
function questionBank(){
 let all=[];try{if(typeof SAMPLES!=='undefined'&&Array.isArray(SAMPLES))all=SAMPLES;}catch(e){}
 let valid=all.filter(q=>q&&q.subject==='language'&&typeof q.prompt==='string'&&typeof q.answer==='string'&&q.prompt.length<250&&q.answer.length<100&&BOOK_TOPIC.test((q.topic||'')+' '+q.prompt)&&unique4(q));
 // Use only reviewed four-choice questions; demonstrations remain explicitly labeled.
 if(valid.length<COUNT)valid=DEMO;
 const h=history();
 return shuffle(valid).sort((a,b)=>{
  const ax=h[String(a.id)]||{},bx=h[String(b.id)]||{};
  return (Number(ax.lastSeen)||0)-(Number(bx.lastSeen)||0);
 }).slice(0,COUNT);
}
function persistAttempt(q,correct,chosen,elapsed,timeout=false){
 const key=String(q.id||q.prompt),h=history(),r=h[key]||{asked:0,correct:0};
 r.asked++;if(correct)r.correct++;r.lastSeen=Date.now();r.lastChoice=chosen;r.lastCorrect=!!correct;
 r.bestCorrectSeconds=correct?Math.min(r.bestCorrectSeconds||999,elapsed):r.bestCorrectSeconds;
 h[key]=r;try{localStorage.setItem(RECORD_KEY,JSON.stringify(h));}catch(e){}
 // Integrate with the existing Learning Journal for original bank items; demos do not pollute official study metrics.
 if(!q.demo&&typeof RallyLearning!=='undefined'&&typeof RallyLearning.record==='function'){
  try{RallyLearning.record(journal,q,timeout?'timeout':correct?'correct':'incorrect',timeout?'timeout':'choice',true)}catch(e){console.warn('Librarian journal attempt could not be recorded',e);}
 }
}
const journal={seating:'solo',mode:'written'};
function presentJournal(q){
 if(!q.demo&&typeof RallyLearning!=='undefined'&&typeof RallyLearning.present==='function'){
  try{RallyLearning.present(journal,q,'written','solo');}catch(e){console.warn('Librarian journal could not start',e);}
 }
}
let root=null,stage=null,ctx=null,heroNode=null,guardian=null,frame=0,last=0,elapsed=0;
let guardianMood='curious',moodUntil=0;
let screen='intro',deck=[],question=null,options=[],round=0,correctCount=0,wrongCount=0,points=0,hearts=4;
let selected=-1,answerLocked=false,remaining=16,responseSeconds=0,attackClock=0,launchClock=0,throwIndex=0,hitCount=0;
let musicKey='';
// Read-only soundtrack selection; movement, questions and combat keep their existing state.
const musicState=()=>root?{kind:screen==='storm'?'library-storm':'library',paused:freeze}:null;
window.LibrarianAudio=Object.freeze({musicState});
function notifyMusic(){const state=musicState(),key=state?state.kind+':'+state.paused:'';if(key===musicKey)return;musicKey=key;document.dispatchEvent(new Event('rally-music-state'))}
let freeze=false,previousFocus=null,jumpBuffer=0,dashTimer=0,dashRecharge=0,shieldTimer=0,shieldReady=true;
let hero={x:174,y:0,vy:0,facing:1,pose:'idle',poseDuration:0,invulnerable:0},held={left:false,right:false,duck:false},warnings=[],books=[],particles=[];
/* LIBRARIAN_BOOK_FRAMES_START */
const bookFrames=["data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNDAiIGhlaWdodD0iMTY4IiB2aWV3Qm94PSIwIDAgMTIwIDg0Ij48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJvb2stbGVhdGhlciIgeDI9IjEiIHkyPSIuNyI+PHN0b3Agc3RvcC1jb2xvcj0iI2JjODY3ZSIvPjxzdG9wIG9mZnNldD0iLjM4IiBzdG9wLWNvbG9yPSIjNjk0NDY1Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMmIyOTRiIi8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9ImJvb2stcGFwZXIiIHgyPSIuMiIgeTI9IjEiPjxzdG9wIHN0b3AtY29sb3I9IiNmZmY0ZDUiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNjZmIxOGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48ZyBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgo8cGF0aCBkPSJNMTMgMThRMzcgOCA1OSAyMVE4MyA4IDEwNyAxOEwxMDQgNjZRODIgNTcgNjAgNjlRMzcgNTcgMTYgNjZaIiBmaWxsPSJ1cmwoI2Jvb2stbGVhdGhlcikiIHN0cm9rZT0iI2VkY2Q5MSIgc3Ryb2tlLXdpZHRoPSIzIi8+CjxwYXRoIGQ9Ik0xOCAyMVEzOCAxNSA1OCAyNVY2MlEzOSA1MiAyMSA2MFpNNjIgMjVRODIgMTUgMTAyIDIxTDEwMCA2MFE4MiA1MiA2MiA2MloiIGZpbGw9InVybCgjYm9vay1wYXBlcikiIHN0cm9rZT0iI2I2YTE3ZSIgc3Ryb2tlLXdpZHRoPSIxLjMiLz4KPHBhdGggZD0iTTI0IDI4UTM5IDIzIDU2IDI5VjU3UTM4IDQ4IDI1IDUzWk02NCAyOVE4MiAyMyA5NiAyOEw5NSA1M1E4MiA0OCA2NCA1N1oiIGZpbGw9IiNmYmVmZDEiIHN0cm9rZT0iI2QyYjY4ZiIgc3Ryb2tlLXdpZHRoPSIxLjIiLz4KPHBhdGggZD0iTTI4IDMzUTQyIDI5IDUzIDM1TTI4IDM5UTQyIDM1IDUzIDQxTTI5IDQ1UTQyIDQxIDUzIDQ3TTY3IDM1UTgxIDI5IDkzIDMzTTY3IDQxUTgxIDM1IDkyIDM5TTY3IDQ3UTgxIDQxIDkyIDQ1IiBmaWxsPSJub25lIiBzdHJva2U9IiNhYThkOGIiIHN0cm9rZS13aWR0aD0iMS4xIi8+CjxwYXRoIGQ9Ik01OSAyMlY2NU0xNiAyMyAyNCAxOU05OCAxOSAxMDUgMjNNMTkgNTlsNyAyTTk3IDYxbDctMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZWRjYzhlIiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTM3IDM3IDQxIDMwIDQ1IDM3IDQxIDQ0Wk03OSAzNmw1LTYgNSA2LTUgNloiIGZpbGw9IiNjNWFhODMiIHN0cm9rZT0iI2EzOGY4NSIgc3Ryb2tlLXdpZHRoPSIuOCIvPgo8cGF0aCBkPSJNNTcgNjQgNTQgNzcgNjAgNzMgNjUgNzcgNjMgNjRaIiBmaWxsPSIjYjE3MjhkIiBzdHJva2U9IiNlMmM0OTciIHN0cm9rZS13aWR0aD0iMS4yIi8+CjwvZz48L3N2Zz4=","data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNDAiIGhlaWdodD0iMTY4IiB2aWV3Qm94PSIwIDAgMTIwIDg0Ij48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJvb2stbGVhdGhlciIgeDI9IjEiIHkyPSIuNyI+PHN0b3Agc3RvcC1jb2xvcj0iI2JjODY3ZSIvPjxzdG9wIG9mZnNldD0iLjM4IiBzdG9wLWNvbG9yPSIjNjk0NDY1Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMmIyOTRiIi8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9ImJvb2stcGFwZXIiIHgyPSIuMiIgeTI9IjEiPjxzdG9wIHN0b3AtY29sb3I9IiNmZmY0ZDUiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNjZmIxOGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48ZyBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgo8cGF0aCBkPSJNMTMgMThRMzcgOCA1OSAyMVE4MyA4IDEwNyAxOEwxMDQgNjZRODIgNTcgNjAgNjlRMzcgNTcgMTYgNjZaIiBmaWxsPSJ1cmwoI2Jvb2stbGVhdGhlcikiIHN0cm9rZT0iI2VkY2Q5MSIgc3Ryb2tlLXdpZHRoPSIzIi8+CjxwYXRoIGQ9Ik0xOCAyMVEzOCAxNSA1OCAyNVY2MlEzOSA1MiAyMSA2MFpNNjIgMjVRODIgMTUgMTAyIDIxTDEwMCA2MFE4MiA1MiA2MiA2MloiIGZpbGw9InVybCgjYm9vay1wYXBlcikiIHN0cm9rZT0iI2I2YTE3ZSIgc3Ryb2tlLXdpZHRoPSIxLjMiLz4KPHBhdGggZD0iTTI0IDI4UTM5IDI4IDU2IDI5VjU3UTM4IDQ4IDI1IDUzWk02NCAyOVE4MiAxOCA5NiAyOEw5NSA1M1E4MiA0OCA2NCA1N1oiIGZpbGw9IiNmYmVmZDEiIHN0cm9rZT0iI2QyYjY4ZiIgc3Ryb2tlLXdpZHRoPSIxLjIiLz4KPHBhdGggZD0iTTI4IDMzUTQyIDI5IDUzIDM1TTI4IDM5UTQyIDM1IDUzIDQxTTI5IDQ1UTQyIDQxIDUzIDQ3TTY3IDM1UTgxIDI5IDkzIDMzTTY3IDQxUTgxIDM1IDkyIDM5TTY3IDQ3UTgxIDQxIDkyIDQ1IiBmaWxsPSJub25lIiBzdHJva2U9IiNhYThkOGIiIHN0cm9rZS13aWR0aD0iMS4xIi8+CjxwYXRoIGQ9Ik01OSAyMlY2NU0xNiAyMyAyNCAxOU05OCAxOSAxMDUgMjNNMTkgNTlsNyAyTTk3IDYxbDctMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZWRjYzhlIiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTM3IDM3IDQxIDMwIDQ1IDM3IDQxIDQ0Wk03OSAzNmw1LTYgNSA2LTUgNloiIGZpbGw9IiNjNWFhODMiIHN0cm9rZT0iI2EzOGY4NSIgc3Ryb2tlLXdpZHRoPSIuOCIvPgo8cGF0aCBkPSJNNTcgNjQgNTQgNzcgNjAgNzMgNjUgNzcgNjMgNjRaIiBmaWxsPSIjYjE3MjhkIiBzdHJva2U9IiNlMmM0OTciIHN0cm9rZS13aWR0aD0iMS4yIi8+CjwvZz48L3N2Zz4=","data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNDAiIGhlaWdodD0iMTY4IiB2aWV3Qm94PSIwIDAgMTIwIDg0Ij48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJvb2stbGVhdGhlciIgeDI9IjEiIHkyPSIuNyI+PHN0b3Agc3RvcC1jb2xvcj0iI2JjODY3ZSIvPjxzdG9wIG9mZnNldD0iLjM4IiBzdG9wLWNvbG9yPSIjNjk0NDY1Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMmIyOTRiIi8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9ImJvb2stcGFwZXIiIHgyPSIuMiIgeTI9IjEiPjxzdG9wIHN0b3AtY29sb3I9IiNmZmY0ZDUiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNjZmIxOGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48ZyBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgo8cGF0aCBkPSJNMTMgMThRMzcgOCA1OSAyMVE4MyA4IDEwNyAxOEwxMDQgNjZRODIgNTcgNjAgNjlRMzcgNTcgMTYgNjZaIiBmaWxsPSJ1cmwoI2Jvb2stbGVhdGhlcikiIHN0cm9rZT0iI2VkY2Q5MSIgc3Ryb2tlLXdpZHRoPSIzIi8+CjxwYXRoIGQ9Ik0xOCAyMVEzOCAxNSA1OCAyNVY2MlEzOSA1MiAyMSA2MFpNNjIgMjVRODIgMTUgMTAyIDIxTDEwMCA2MFE4MiA1MiA2MiA2MloiIGZpbGw9InVybCgjYm9vay1wYXBlcikiIHN0cm9rZT0iI2I2YTE3ZSIgc3Ryb2tlLXdpZHRoPSIxLjMiLz4KPHBhdGggZD0iTTI0IDI4UTM5IDE5IDU2IDI5VjU3UTM4IDQ4IDI1IDUzWk02NCAyOVE4MiAyNyA5NiAyOEw5NSA1M1E4MiA0OCA2NCA1N1oiIGZpbGw9IiNmYmVmZDEiIHN0cm9rZT0iI2QyYjY4ZiIgc3Ryb2tlLXdpZHRoPSIxLjIiLz4KPHBhdGggZD0iTTI4IDMzUTQyIDI5IDUzIDM1TTI4IDM5UTQyIDM1IDUzIDQxTTI5IDQ1UTQyIDQxIDUzIDQ3TTY3IDM1UTgxIDI5IDkzIDMzTTY3IDQxUTgxIDM1IDkyIDM5TTY3IDQ3UTgxIDQxIDkyIDQ1IiBmaWxsPSJub25lIiBzdHJva2U9IiNhYThkOGIiIHN0cm9rZS13aWR0aD0iMS4xIi8+CjxwYXRoIGQ9Ik01OSAyMlY2NU0xNiAyMyAyNCAxOU05OCAxOSAxMDUgMjNNMTkgNTlsNyAyTTk3IDYxbDctMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZWRjYzhlIiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTM3IDM3IDQxIDMwIDQ1IDM3IDQxIDQ0Wk03OSAzNmw1LTYgNSA2LTUgNloiIGZpbGw9IiNjNWFhODMiIHN0cm9rZT0iI2EzOGY4NSIgc3Ryb2tlLXdpZHRoPSIuOCIvPgo8cGF0aCBkPSJNNTcgNjQgNTQgNzcgNjAgNzMgNjUgNzcgNjMgNjRaIiBmaWxsPSIjYjE3MjhkIiBzdHJva2U9IiNlMmM0OTciIHN0cm9rZS13aWR0aD0iMS4yIi8+CjwvZz48L3N2Zz4="].map(src=>{const img=new Image();img.src=src;return img;});
const bookImage=bookFrames[0];
/* LIBRARIAN_BOOK_FRAMES_END */
const entry=(typeof document.getElementById==='function'&&document.getElementById('lib-launch'))||document.createElement('button');
if(!entry.isConnected){entry.type='button';entry.id='lib-launch';entry.textContent='Take a rest in our nice peaceful library';entry.setAttribute('aria-label','Take a rest in our nice peaceful library');document.body.appendChild(entry)}
else{entry.disabled=false;}
function show(id,v){let e=$(id);if(e)e.hidden=!v;}
function message(m){let x=$('lib-status');if(x)x.textContent=m;}
function guardianReaction(mood,seconds=0){guardianMood=mood;moodUntil=seconds?elapsed+seconds:0;if(guardian)guardian.dataset.mood=mood;}
function pose(p,d=0){if(hero.pose===p)return;hero.pose=p;hero.poseDuration=d;syncHero();}
function clearInput(){held.left=held.right=held.duck=false;jumpBuffer=0;['lib-left','lib-right','lib-duck'].forEach(id=>{const b=$(id);if(b)b.dataset.held='false';});}
function resetHero(){hero={x:174,y:0,vy:0,facing:1,pose:'idle',poseDuration:0,invulnerable:0};clearInput();warnings=[];books=[];particles=[];dashTimer=0;dashRecharge=0;shieldTimer=0;shieldReady=true;hitCount=0;}
function updateHud(){if(!root)return;notifyMusic();
 $('lib-hearts').textContent=hearts?'♥ '.repeat(hearts):'—';$('lib-score').textContent=points;
 $('lib-progress').textContent=Math.min(round,COUNT)+' / '+COUNT;
 $('lib-timer').textContent=screen==='question'?Math.ceil(Math.max(0,remaining))+'s':'';
 const track=$('lib-time-track');if(track){track.hidden=screen!=='question';track.classList.toggle('is-low',remaining<=5);track.firstElementChild.style.setProperty('--time-left',Math.max(0,Math.min(1,remaining/16)))}
 $('lib-shield').disabled=screen!=='storm'||!shieldReady;
 $('lib-dash').disabled=screen!=='storm'||dashRecharge>0;
 $('lib-attack').textContent=screen==='storm'?(warnings.length?'⚠ '+warnings[warnings.length-1].name:'BOOK STORM · '+Math.max(0,Math.ceil(attackClock))+'s'):
  screen==='question'?'Choose A, B, C, or D':screen==='defeated'?'THE LIBRARIAN WINS':'THE GREAT ARCHIVES';
}
function reveal(){
 show('lib-choices',false);show('lib-learn',true);show('lib-next',true);
 const panel=$('lib-learn');panel.classList.remove('lib-arrived');void panel.offsetWidth;panel.classList.add('lib-arrived');
 $('lib-learn-answer').textContent=question.answer;
 $('lib-learn-explain').textContent=question.explanation||'Remember this answer for next time.';
 $('lib-learn-source').textContent=[question.topic||'Literature',question.source||'Recall Rally practice'].filter(Boolean).join(' · ');
 $('lib-learn-selection').textContent=selected<0?'Time ran out.':('You chose: '+options[selected]);
 let magic=$('lib-knowledge');magic.classList.remove('lib-fly');void magic.offsetWidth;if(!reduced)magic.classList.add('lib-fly');
 playTone('learn');
}
function start(){deck=questionBank();round=0;correctCount=wrongCount=points=0;hearts=4;resetHero();next();}
function next(){
 if(round>=COUNT){finish();return;}
 if(screen==='defeated')hearts=4;
 clearInput();resetHero();selected=-1;answerLocked=false;remaining=16;responseSeconds=0;
 question=deck[round++];options=shuffle(unique4(question));screen='question';guardianReaction('curious');
 $('lib-question').textContent=question.prompt;
 $('lib-choices').innerHTML='';
 options.forEach((a,i)=>{const b=document.createElement('button');b.type='button';b.className='lib-choice';b.dataset.index=i;
  b.innerHTML='<span class="lib-key">'+LETTERS[i]+'</span><span>'+esc(a)+'</span>';b.addEventListener('click',()=>choose(i));$('lib-choices').appendChild(b);});
 show('lib-start',false);show('lib-next',false);show('lib-learn',false);show('lib-choices',true);message('Choose an answer. One correct answer; the others may wake the shelves.');
 presentJournal(question);updateHud();
}
function choose(i,timeout=false){
 if(screen!=='question'||answerLocked)return;
 answerLocked=true;selected=i;responseSeconds=16-remaining;
 const win=i>=0&&norm(options[i])===norm(question.answer);
 persistAttempt(question,win,i>=0?options[i]:'',responseSeconds,timeout);
 [...$('lib-choices').children].forEach((b,k)=>{b.disabled=true;if(norm(options[k])===norm(question.answer))b.classList.add('lib-correct');if(i===k&&!win)b.classList.add('lib-wrong');});
 if(win){guardianReaction('impressed');correctCount++;points+=100+Math.max(0,Math.round((16-responseSeconds)*3));screen='review';pose('idle');message('Correct! The Librarian shares her wisdom.');reveal();}
 else {guardianReaction('preparing');wrongCount++;screen='storm';attackClock=20;launchClock=.18;throwIndex=0;hitCount=0;clearInput();message('The shelves wake! Duck beneath HIGH books; jump above LOW books.');show('lib-choices',false);show('lib-learn',false);playTone('warning');}
 updateHud();
}
function spawnWarning(){
 guardianReaction('preparing');
 const high=throwIndex++%2===0,extra=Math.min(110,Math.max(0,round-1)*14),speed=275+extra;
 const label=high?'HIGH · DUCK':'LOW · JUMP';warnings.push({kind:high?'high':'low',name:label,y:high?FLOOR-87:FLOOR-22,x:WIDTH-10,duration:Math.max(.43,.68-round*.017),speed,color:high?'#a3e9fc':'#fcb779'});
}
function launchBook(w){guardianReaction('casting',.5);books.push({kind:w.kind,x:WIDTH+25,y:w.y,speed:w.speed,hit:false,passed:false,color:w.color,seed:Math.random()*6});}
function jump(){
 if(screen!=='storm'||hero.pose==='hit'||hero.pose==='recovering'||hero.pose==='defeated')return;
 // Up overrides Down. Jump changes physics and visual pose in the same event, with no downward wind-up.
 held.duck=false;const duck=$('lib-duck');if(duck)duck.dataset.held='false';
 if(hero.y===0&&hero.vy===0){jumpBuffer=0;hero.vy=610;hero.y=1;pose('jump');particlesBurst(hero.x,FLOOR-5,'#f3cc94',5);playTone('jump');}
 else jumpBuffer=.10;
}
function shield(){if(screen!=='storm'||!shieldReady)return;shieldReady=false;shieldTimer=1.1;updateHud();playTone('shield');}
function dash(){if(screen!=='storm'||dashRecharge>0||hero.pose==='hit'||hero.pose==='recovering')return;dashTimer=.2;dashRecharge=2.2;hero.invulnerable=Math.max(hero.invulnerable,.20);playTone('dash');}
function collide(b){
 if(b.hit||screen!=='storm'||hero.invulnerable>0)return;
 b.hit=true;
 if(shieldTimer>0){shieldTimer=0;points+=15;guardianReaction('frustrated',.7);message('Your shield dissolves an enchanted book!');particlesBurst(b.x,b.y,'#b4f4ff',11);playTone('shield');return;}
 if(hero.pose==='hit'||hero.pose==='recovering')return;
 hearts=Math.max(0,hearts-1);hitCount++;
 hero.invulnerable=.86;pose('hit',.24);particlesBurst(b.x,b.y,'#ffb6a0',12);playTone('hit');
 if(hearts===0){screen='defeat-hit';warnings=[];books=[];clearInput();hero.vy=0;message('The Librarian has won this encounter.');playTone('defeat');}
 else message('Ouch! The Librarian has sharp aim. Keep moving!');
}
function defeated(){if(screen!=='defeat-hit')return;guardianReaction('satisfied');screen='defeated';hero.y=0;hero.vy=0;hero.invulnerable=0;clearInput();pose('defeated');reveal();message('Your hero needs a moment. You can continue with fresh hearts.');updateHud();}
function endWave(){if(screen!=='storm')return;guardianReaction('impressed');screen='review';warnings=[];books=[];clearInput();pose('idle');
 message(hitCount?'You survived the flying books!':'Flawless defense! The Librarian looks impressed.');reveal();updateHud();}
function finish(){guardianReaction('satisfied');screen='complete';clearInput();warnings=[];books=[];pose('idle');show('lib-choices',false);show('lib-learn',false);show('lib-next',false);show('lib-start',true);
 $('lib-start').textContent='Explore again';$('lib-question').textContent='The Golden Bookmark is yours!';
 message('You answered '+correctCount+' of '+COUNT+' correctly and earned '+points+' points.');updateHud();}
function particlesBurst(x,y,color,n){for(let i=0;i<(reduced?Math.min(2,n):n);i++)particles.push({x,y,vx:(Math.random()-.5)*160,vy:-Math.random()*140,life:.5,color});if(particles.length>65)particles.splice(0,particles.length-65);}
function update(dt){elapsed+=dt;
 if(screen==='question'){
  remaining-=dt;if(remaining<=0){remaining=0;choose(-1,true);}
 }
 if(screen==='defeat-hit'){hero.poseDuration=Math.max(0,hero.poseDuration-dt);if(hero.poseDuration===0)defeated();}
 if(screen==='storm'){
  // Direct movement; no acceleration and no slide after release, including while airborne.
  const dx=Number(held.right)-Number(held.left);
  if(hero.pose==='hit'||hero.pose==='recovering'){
   hero.poseDuration=Math.max(0,hero.poseDuration-dt);
   if(hero.poseDuration===0){if(hero.pose==='hit')pose('recovering',.20);else pose('idle');}
  }
  const locked=hero.pose==='hit'||hero.pose==='recovering';
  const ducking=held.duck&&hero.y===0&&!locked&&dashTimer===0;
  if(dx)hero.facing=dx;
  if(!locked)hero.x=Math.max(33,Math.min(WIDTH-33,hero.x+dx*(ducking?160:355)*dt+(dashTimer>0?hero.facing*620*dt:0)));
  dashTimer=Math.max(0,dashTimer-dt);dashRecharge=Math.max(0,dashRecharge-dt);
  if(hero.vy!==0||hero.y>0){
   const wasAirborne=hero.y>0;
   hero.y+=hero.vy*dt;hero.vy-=1520*dt;
   if(hero.y<=0){hero.y=0;hero.vy=0;if(wasAirborne)particlesBurst(hero.x,FLOOR-2,'#f2d4a2',5);if(jumpBuffer>0)jump();}
  }
  jumpBuffer=Math.max(0,jumpBuffer-dt);
  hero.invulnerable=Math.max(0,hero.invulnerable-dt);shieldTimer=Math.max(0,shieldTimer-dt);
  if(!locked)pose(hero.y>0?'jump':ducking?'duck':dx?'run':'idle');
  attackClock-=dt;launchClock-=dt;
  if(launchClock<=0&&attackClock>.9){spawnWarning();launchClock=Math.max(.83,1.18-(round-1)*.035);}
  for(const w of warnings)w.duration-=dt;
  warnings.filter(w=>w.duration<=0).forEach(launchBook);
  warnings=warnings.filter(w=>w.duration>0);
  for(const b of books){
   const oldX=b.x;b.x-=b.speed*dt;
   const bodyTop=FLOOR-hero.y-(hero.pose==='duck'?49:116),bodyBottom=FLOOR-hero.y-5;
   // Tight, visible-aligned collision. High clears duck; low still reaches crouched body.
   const overlap=b.x+24>hero.x-18&&b.x-24<hero.x+18&&b.y+14>bodyTop&&b.y-14<bodyBottom;
   if(!b.hit&&overlap)collide(b);
   if(!b.hit&&!b.passed&&oldX>=hero.x&&b.x<hero.x){
    b.passed=true;
    if((b.kind==='high'&&hero.pose==='duck')||(b.kind==='low'&&hero.y>57)){
     points+=25;guardianReaction('frustrated',.75);particlesBurst(hero.x,FLOOR-hero.y-55,b.color,7);message(b.kind==='high'?'Perfect duck! +25':'Perfect jump! +25');playTone('dodge');
    }
   }
  }
  books=books.filter(b=>!b.hit&&b.x>-60);
  if(screen==='storm'&&attackClock<=0)endWave();
 }
 for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=210*dt;p.life-=dt;}
 particles=particles.filter(p=>p.life>0);updateHud();
}
function paint(){if(!ctx)return;ctx.clearRect(0,0,WIDTH,HEIGHT);
 if(screen==='storm'){
  for(const w of warnings){ctx.save();ctx.strokeStyle='#0b1730';ctx.lineWidth=12;ctx.globalAlpha=.8;ctx.beginPath();ctx.moveTo(18,w.y);ctx.lineTo(WIDTH-12,w.y);ctx.stroke();ctx.strokeStyle=w.color;ctx.lineWidth=3;ctx.setLineDash([16,10]);ctx.globalAlpha=.95;
   ctx.beginPath();ctx.moveTo(18,w.y);ctx.lineTo(WIDTH-12,w.y);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=w.color;ctx.font='bold 19px system-ui';ctx.fillStyle='#101d35';ctx.fillRect(WIDTH-221,w.y-43,200,31);ctx.fillStyle=w.color;ctx.fillText(w.name,WIDTH-210,w.y-20);ctx.restore();}
 }
 for(const b of books){ctx.save();ctx.translate(b.x,b.y);
  if(!reduced)ctx.rotate(Math.sin(elapsed*8+b.seed)*.09);
  ctx.shadowColor=b.color;ctx.shadowBlur=reduced?3:15;
  const flyingPage=bookFrames[reduced?0:Math.floor(elapsed*7+b.seed)%bookFrames.length];
  if(!reduced){ctx.strokeStyle=b.color;ctx.lineWidth=2;for(let j=0;j<3;j++){ctx.globalAlpha=.3-j*.07;ctx.beginPath();ctx.moveTo(27+j*7,-3+j*3);ctx.lineTo(38+j*9,-3+j*3);ctx.stroke();}ctx.globalAlpha=1;}
  if(flyingPage.complete&&flyingPage.naturalWidth)ctx.drawImage(flyingPage,-29,-20,58,40);
  else{ctx.fillStyle='#8f4b78';ctx.fillRect(-24,-14,48,28);ctx.strokeStyle='#e6c08b';ctx.lineWidth=3;ctx.strokeRect(-24,-14,48,28);}
  ctx.restore();}
 for(const p of particles){ctx.save();ctx.globalAlpha=Math.max(0,p.life*1.9);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,2.4,0,Math.PI*2);ctx.fill();ctx.restore();}
 if(!heroNode){ctx.save();ctx.translate(hero.x,FLOOR-hero.y);
  if(hero.pose==='defeated')ctx.rotate(-1.16);
  ctx.fillStyle='#3666a8';ctx.beginPath();ctx.ellipse(0,hero.pose==='duck'?-24:-55,23,hero.pose==='duck'?22:48,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#e0b59b';ctx.beginPath();ctx.arc(0,hero.pose==='duck'?-46:-105,17,0,Math.PI*2);ctx.fill();ctx.restore();}
 if(shieldTimer>0){ctx.save();ctx.strokeStyle='#9eeeff';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(hero.x,FLOOR-hero.y-54,42,hero.pose==='duck'?37:64,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
}
function syncHero(){if(!root)return;
 if(heroNode){heroNode.style.left=(hero.x/WIDTH*100)+'%';heroNode.style.bottom=((HEIGHT-FLOOR+(['storm','defeat-hit'].includes(screen)?hero.y:0))/HEIGHT*100)+'%';heroNode.style.transform='translateX(-50%) scaleX('+hero.facing+')';
  heroNode.className='lib-hero-sprite lib-v4-'+hero.pose;heroNode.style.opacity='1';/* HERO_PRESENTATION_START */const motionAction=dashTimer>0?'dash':shieldTimer>0?'shield':'';if(heroNode.dataset.motionAction!==motionAction)heroNode.dataset.motionAction=motionAction;/* HERO_PRESENTATION_END */}
 if(guardian){if(moodUntil&&elapsed>=moodUntil)guardianReaction(screen==='storm'?'preparing':screen==='complete'||screen==='defeated'?'satisfied':screen==='review'?'impressed':'curious');if(guardian.dataset.mood!==guardianMood)guardian.dataset.mood=guardianMood;guardian.className='lib-guardian-sprite';}
 if(root&&root.dataset.scene!==screen)root.dataset.scene=screen;
}
function animation(now){if(!root)return;let dt=Math.min(.032,Math.max(0,(now-last)/1000));last=now;if(!freeze)update(dt);paint();syncHero();frame=requestAnimationFrame(animation);}
function keydown(e){if(!root)return;
 if(e.key==='Escape'){close();return;}
 const t=e.target&&e.target.tagName;if(t==='INPUT'||t==='TEXTAREA'||t==='SELECT')return;
 if(screen==='question'&&/^Digit[1-4]$/.test(e.code)){e.preventDefault();choose(Number(e.code.slice(-1))-1);return;}
 if(screen==='storm'&&MOVEMENT_CODES.includes(e.code))e.preventDefault();
 if(screen!=='storm')return;
 if(e.code==='ArrowLeft'||e.code==='KeyA')held.left=true;
 if(e.code==='ArrowRight'||e.code==='KeyD')held.right=true;
 if(e.code==='ArrowDown'||e.code==='KeyS')held.duck=true;
 if((e.code==='ArrowUp'||e.code==='KeyW'||e.code==='Space')&&!e.repeat)jump();
 if(e.code==='KeyQ'&&!e.repeat)shield();
 if((e.code==='ShiftLeft'||e.code==='ShiftRight')&&!e.repeat)dash();
 syncHero();
}
function keyup(e){if(e.code==='ArrowLeft'||e.code==='KeyA')held.left=false;if(e.code==='ArrowRight'||e.code==='KeyD')held.right=false;
 if(e.code==='ArrowDown'||e.code==='KeyS'){held.duck=false;if(hero.pose==='duck')pose('idle');}}
function pointerHold(id,k){const b=$(id);if(!b)return;
 b.addEventListener('pointerdown',e=>{if(screen!=='storm')return;e.preventDefault();held[k]=true;b.dataset.held='true';try{b.setPointerCapture(e.pointerId);}catch(x){};
 if(k==='duck'&&hero.y===0)pose('duck');});
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>{held[k]=false;b.dataset.held='false';if(k==='duck'&&hero.pose==='duck')pose('idle');});
}
function pointerAction(id,fn){const b=$(id);if(!b)return;b.addEventListener('pointerdown',e=>{if(screen!=='storm')return;e.preventDefault();fn();});
 // Keyboard activation generates click without pointerdown.
 b.addEventListener('click',e=>{if(e.detail===0)fn();});}
function loseFocus(){clearInput();last=performance.now();}
function visibility(){freeze=document.hidden;if(freeze)loseFocus();else last=performance.now();notifyMusic();}
function soundEnabled(){try{if(typeof soundOn!=='undefined')return !!soundOn;}catch(e){}try{return localStorage.getItem('recall-rally-sound-v1')!=='off';}catch(e){return false;}}
function playTone(name){if(!soundEnabled()||document.hidden)return;try{
 if(typeof initAudio!=='function')return;initAudio();if(typeof audioContext==='undefined'||!audioContext||audioContext.state!=='running'||!fxBus)return;
 const config={jump:[480,.055],dodge:[680,.085],hit:[170,.11],defeat:[125,.2],learn:[600,.12],warning:[300,.08],shield:[570,.09],dash:[310,.055]};
 const v=config[name]||config.jump,o=audioContext.createOscillator(),gain=audioContext.createGain(),at=audioContext.currentTime;o.type='sine';o.frequency.value=v[0];gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(.035,at+.014);gain.gain.exponentialRampToValueAtTime(.0001,at+v[1]);o.connect(gain);gain.connect(fxBus);o.onended=()=>{o.disconnect();gain.disconnect()};o.start();o.stop(at+v[1]+.01);duckMusic(Math.max(.2,v[1]),.34);
 }catch(e){} }

// DOM articulation reuses the saved character's exact SVG geometry. The sources
// live in defs once; split limb uses never duplicate gradients or change identity.
function rigHero(svg){
 if(!svg)return;const body=svg.querySelector('.panther-hero');if(!body)return;/* HERO_PRESENTATION_START */if(body.classList.contains('hero-motion-rig')){svg.querySelector('.hero-idle')?.classList.replace('hero-idle','lib-source-idle');svg.dataset.articulated='true';return;}/* HERO_PRESENTATION_END */
 const ns='http://www.w3.org/2000/svg',make=(tag,attrs={})=>{const e=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);return e};
 const defs=make('defs');svg.appendChild(defs);let serial=0;
 function split(node,kind){if(!node)return;const wrap=make('g',{'class':'lib-rig-'+kind}),source='lib-rig-source-'+serial++;node.parentNode.insertBefore(wrap,node);node.setAttribute('id',source);defs.appendChild(node);
  for(const side of ['left','right']){const clip='lib-rig-clip-'+serial++,cp=make('clipPath',{id:clip});cp.appendChild(make('rect',{x:side==='left'?-100:160,y:-100,width:side==='left'?260:300,height:650}));defs.appendChild(cp);
   const limb=make('g',{'class':'lib-'+kind+'-'+side}),mask=make('g',{'clip-path':'url(#'+clip+')'});mask.appendChild(make('use',{href:'#'+source}));limb.appendChild(mask);wrap.appendChild(limb);}
  return wrap;
 }
 const legs=split(body.querySelector('.hero-legs'),'leg');
 for(const kind of ['hero-arms','hero-sleeves'])split(body.querySelector('.'+kind),'arm');
 const upper=make('g',{'class':'lib-rig-upper'});
 for(const child of [...body.children])if(child!==legs&&child.tagName.toLowerCase()!=='defs')upper.appendChild(child);
 body.appendChild(upper);svg.querySelector('.hero-idle')?.classList.replace('hero-idle','lib-source-idle');svg.dataset.articulated='true';
}
function open(){if(root)return;guardianMood='curious';moodUntil=0;previousFocus=document.activeElement;
 root=document.createElement('div');root.id='lib-overlay';root.className='lib-game lib-v4-game';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','The Librarian game');
 root.innerHTML=`<div class="lib-frame"><header class="lib-top"><div><p class="lib-kicker">ELLERY'S RECALL RALLY · THE LOST LIBRARY</p><h2 class="lib-title">THE LIBRARIAN</h2></div><button id="lib-close" class="lib-close" type="button">✕ Return to Rally</button></header>
 <div class="lib-card"><div class="lib-hud"><span class="lib-stat">📜 CHAPTER I · THE GREAT ARCHIVES</span><span class="lib-stat">♥ <b id="lib-hearts">♥ ♥ ♥ ♥</b></span><span class="lib-stat">⭐ <b id="lib-score">0</b></span><span class="lib-stat">📖 <b id="lib-progress">0 / 8</b></span></div>
 <div class="lib-canvas-wrap"><div class="lib-art-room" aria-hidden="true"></div><div class="lib-art-shelves" aria-hidden="true"></div><div class="lib-art-balcony" aria-hidden="true"></div><div class="lib-art-light" aria-hidden="true"></div><div class="lib-art-foreground" aria-hidden="true"></div><canvas id="lib-canvas" width="960" height="460" role="img" aria-label="Enchanted books fly through a gothic library; control the hero using movement buttons."></canvas><div class="lib-scene-label">THE GUARDIAN OF THE LOST LIBRARY</div><div id="lib-attack" class="lib-attack-info">THE GREAT ARCHIVES</div><div id="lib-knowledge" class="lib-knowledge-wisp" aria-hidden="true">✧</div></div>
 <div class="lib-dialogue"><div class="lib-prompt-tag">THE LIBRARIAN ASKS <span id="lib-timer" class="lib-timer"></span></div><div class="rally-time-track lib-time-track" id="lib-time-track" aria-hidden="true" hidden><span class="rally-time-fill"></span></div><p class="lib-prompt" id="lib-question">Welcome, traveler. The library is very peaceful today.</p>
 <div id="lib-choices" class="lib-choices" hidden></div><section id="lib-learn" class="lib-learning" hidden aria-live="polite"><div class="lib-learn-kicker">✦ YOU LEARNED:</div><div id="lib-learn-answer" class="lib-learn-answer"></div><p id="lib-learn-explain" class="lib-learn-explain"></p><p id="lib-learn-selection" class="lib-learn-selection"></p><p id="lib-learn-source" class="lib-learn-source"></p></section><div class="lib-feedback" id="lib-status" aria-live="polite">An unexpected book may be waiting.</div></div>
 <div class="lib-actions"><button type="button" class="lib-btn primary" id="lib-start">ENTER THE READING ROOM</button><button type="button" class="lib-btn secondary" id="lib-next" hidden>NEXT QUESTION →</button></div>
 <div class="lib-controls"><button type="button" id="lib-left" class="lib-touch" aria-label="Move left">◀ LEFT</button><button type="button" id="lib-right" class="lib-touch" aria-label="Move right">RIGHT ▶</button><button type="button" id="lib-duck" class="lib-touch lib-duck-btn" aria-label="Duck while held">↓ DUCK</button><button type="button" id="lib-jump" class="lib-touch" aria-label="Jump">↑ JUMP</button><button type="button" id="lib-dash" class="lib-touch" aria-label="Dash">✦ DASH</button><button type="button" id="lib-shield" class="lib-touch" aria-label="Shield">🛡 SHIELD</button></div>
 <p class="lib-instructions">Movement: ← → · Jump ↑ · Duck ↓ · Shift dash · Q shield. Answers: tap A–D or press 1–4.</p></div></div>`;
 document.body.appendChild(root);stage=$('lib-canvas').parentElement;ctx=$('lib-canvas').getContext('2d');
 heroNode=document.createElement('div');heroNode.className='lib-hero-sprite';heroNode.id='lib-hero-sprite';heroNode.setAttribute('aria-hidden','true');
 try{if(typeof renderGameHero==='function'&&typeof avatarLook!=='undefined'){heroNode.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 420">'+renderGameHero(avatarLook,{idPrefix:'librarian-v4-hero',pose:'idle',articulated:true})+'</svg>';stage.appendChild(heroNode);rigHero(heroNode.querySelector('svg'));}else heroNode=null;}catch(e){heroNode=null;}
/* LIBRARIAN_GUARDIAN_ART_START */
 guardian=document.createElement('div');guardian.className='lib-guardian-sprite';guardian.setAttribute('aria-hidden','true');guardian.innerHTML="<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"520\" height=\"680\" viewBox=\"0 0 260 340\" class=\"lib-guardian-art\" role=\"img\" aria-label=\"The Librarian\"><defs>\n<linearGradient id=\"lg-velvet\" x2=\"1\" y2=\".7\"><stop stop-color=\"#8e71a0\"/><stop offset=\".3\" stop-color=\"#48365f\"/><stop offset=\".63\" stop-color=\"#302846\"/><stop offset=\"1\" stop-color=\"#76618c\"/></linearGradient>\n<linearGradient id=\"lg-silk\" x2=\".7\" y2=\"1\"><stop stop-color=\"#cf9d93\"/><stop offset=\".4\" stop-color=\"#947080\"/><stop offset=\"1\" stop-color=\"#4d405c\"/></linearGradient>\n<linearGradient id=\"lg-gold\" x2=\".8\" y2=\"1\"><stop stop-color=\"#fff0c2\"/><stop offset=\".3\" stop-color=\"#d3b27a\"/><stop offset=\".52\" stop-color=\"#8d7054\"/><stop offset=\".8\" stop-color=\"#eed39f\"/><stop offset=\"1\" stop-color=\"#9d7b55\"/></linearGradient>\n<linearGradient id=\"lg-hair\" x2=\"1\" y2=\".3\"><stop stop-color=\"#eeebdf\"/><stop offset=\".35\" stop-color=\"#bbc6d5\"/><stop offset=\".65\" stop-color=\"#8f9db8\"/><stop offset=\"1\" stop-color=\"#e8e2df\"/></linearGradient>\n<linearGradient id=\"lg-skin\" x2=\"1\" y2=\".4\"><stop stop-color=\"#f4d6b8\"/><stop offset=\".6\" stop-color=\"#dfb59f\"/><stop offset=\"1\" stop-color=\"#b98886\"/></linearGradient>\n<radialGradient id=\"lg-magic\"><stop stop-color=\"#fff3d4\"/><stop offset=\".4\" stop-color=\"#b8b5ee\" stop-opacity=\".8\"/><stop offset=\"1\" stop-color=\"#aa7adb\" stop-opacity=\"0\"/></radialGradient>\n</defs><g stroke-linejoin=\"round\" stroke-linecap=\"round\">\n<ellipse cx=\"130\" cy=\"322\" rx=\"77\" ry=\"9\" fill=\"#111b34\" opacity=\".45\"/>\n<!-- Silver braids, velvet mantle, a pleated skirt and individually engraved trim. -->\n<path d=\"M83 64Q69 33 96 23Q139 4 166 30Q197 46 174 84L177 135 81 133Z\" fill=\"url(#lg-hair)\" stroke=\"#758199\" stroke-width=\"2.5\"/>\n<path d=\"M90 138Q50 171 32 310Q130 337 228 310Q213 171 170 138Z\" fill=\"url(#lg-velvet)\" stroke=\"#c6b28c\" stroke-width=\"3\"/>\n<path d=\"M120 158 105 315H157L143 158Z\" fill=\"url(#lg-silk)\" stroke=\"#d8be8c\" stroke-width=\"1.5\"/>\n<path d=\"M76 173Q68 235 55 309M94 176Q88 255 83 317M167 177Q172 259 181 317M184 174Q197 245 206 310\" fill=\"none\" stroke=\"#b1a1be\" stroke-opacity=\".35\" stroke-width=\"2\"/>\n<path d=\"M51 304Q129 327 210 305M47 310Q129 334 215 310\" fill=\"none\" stroke=\"url(#lg-gold)\" stroke-width=\"2\"/>\n<path d=\"M90 141 120 154 130 196 105 179 85 154ZM170 141 141 154 130 196 158 179 176 154Z\" fill=\"#304254\" stroke=\"url(#lg-gold)\" stroke-width=\"2\"/>\n<path d=\"M109 130V151L130 169 152 149V129\" fill=\"url(#lg-skin)\" stroke=\"#b0887b\" stroke-width=\"1.5\"/>\n<path d=\"M105 143 130 156 155 143 151 155 130 175 109 155Z\" fill=\"#e3dbc8\" stroke=\"#aa9778\" stroke-width=\"1.5\"/>\n<path d=\"M113 149 118 158M120 152 125 164M133 165 139 154M142 159 147 150\" stroke=\"#9e8c7e\" fill=\"none\"/>\n<path d=\"M94 211Q130 223 166 211L168 221Q130 234 92 221Z\" fill=\"url(#lg-gold)\" stroke=\"#7e6550\" stroke-width=\"1.5\"/>\n<path d=\"M119 215 130 208 142 216 130 231Z\" fill=\"#a5b9bc\" stroke=\"#eddbac\" stroke-width=\"1.5\"/>\n<path d=\"M123 218 130 214 137 218 130 225Z\" fill=\"#dae6d4\"/>\n<g transform=\"translate(130 169) scale(-1 1)\"><g class=\"lg-arm lg-arm-left\">\n<path d=\"M26-15Q54-33 66-7L82 25 68 43Q40 20 25 2Z\" fill=\"url(#lg-velvet)\" stroke=\"#ceb88d\" stroke-width=\"2.2\"/>\n<path d=\"M67 25 84 17 91 31 74 44Z\" fill=\"#e5d9c4\" stroke=\"#ad967c\" stroke-width=\"1.5\"/>\n<path d=\"M77 23Q79 5 89 0Q99-9 102-2L95 12Q114 3 117 13Q120 22 94 31L84 34Z\" fill=\"url(#lg-skin)\" stroke=\"#aa7d77\" stroke-width=\"1.5\"/>\n<path d=\"M88 19 97 13M91 24l11-7M43-12Q50 12 66 24\" fill=\"none\" stroke=\"#e6c6ad\" stroke-width=\"1.2\"/>\n</g></g><g transform=\"translate(130 169) scale(1 1)\"><g class=\"lg-arm lg-arm-right\">\n<path d=\"M26-15Q54-33 66-7L82 25 68 43Q40 20 25 2Z\" fill=\"url(#lg-velvet)\" stroke=\"#ceb88d\" stroke-width=\"2.2\"/>\n<path d=\"M67 25 84 17 91 31 74 44Z\" fill=\"#e5d9c4\" stroke=\"#ad967c\" stroke-width=\"1.5\"/>\n<path d=\"M77 23Q79 5 89 0Q99-9 102-2L95 12Q114 3 117 13Q120 22 94 31L84 34Z\" fill=\"url(#lg-skin)\" stroke=\"#aa7d77\" stroke-width=\"1.5\"/>\n<path d=\"M88 19 97 13M91 24l11-7M43-12Q50 12 66 24\" fill=\"none\" stroke=\"#e6c6ad\" stroke-width=\"1.2\"/>\n</g></g><g class=\"lg-head\" transform=\"translate(130 91)\">\n<path d=\"M-42-18Q-48 13-27 36Q0 58 30 33Q48 8 40-19Z\" fill=\"url(#lg-skin)\" stroke=\"#ac8680\" stroke-width=\"2\"/>\n<path d=\"M-47-12Q-53-48-17-53Q18-62 40-37L49-9Q30-10 17-32Q-7-13-47-12Z\" fill=\"url(#lg-hair)\" stroke=\"#8492a9\" stroke-width=\"2\"/>\n<path d=\"M-40-23Q-20-26-8-40M-37-30Q-20-34-16-44M9-43Q27-35 33-20M22-44Q37-31 41-15\" fill=\"none\" stroke=\"#f7f2e4\" stroke-width=\"1.5\"/>\n<path d=\"M-45-3Q-55 20-38 41M44-3Q55 22 37 43\" fill=\"none\" stroke=\"url(#lg-hair)\" stroke-width=\"9\"/>\n<g fill=\"#c4ae85\" stroke=\"#7b6e65\"><circle cx=\"-42\" cy=\"28\" r=\"4\"/><circle cx=\"42\" cy=\"28\" r=\"4\"/></g>\n<path d=\"M-3 2-7 15 2 16\" fill=\"none\" stroke=\"#b38c80\" stroke-width=\"1.3\"/>\n<g class=\"lg-face lg-face-curious\"><path d=\"M-31-4q10-9 20-3M11-7q11-5 20 2\" fill=\"none\" stroke=\"#5d5364\" stroke-width=\"2.5\"/><ellipse cx=\"-20\" cy=\"6\" rx=\"4\" ry=\"5\" fill=\"#35495f\"/><ellipse cx=\"21\" cy=\"6\" rx=\"4\" ry=\"5\" fill=\"#35495f\"/><path d=\"M-8 28q9 4 17-2\" fill=\"none\" stroke=\"#9e6471\" stroke-width=\"2\"/></g>\n<g class=\"lg-face lg-face-impressed\"><path d=\"M-31-8q10-7 20-2M11-10q11-6 20 2\" fill=\"none\" stroke=\"#5d5364\" stroke-width=\"2.5\"/><ellipse cx=\"-20\" cy=\"5\" rx=\"4\" ry=\"6\" fill=\"#35495f\"/><ellipse cx=\"21\" cy=\"5\" rx=\"4\" ry=\"6\" fill=\"#35495f\"/><path d=\"M-12 24Q0 39 14 23Q1 29-12 24Z\" fill=\"#fff0d7\" stroke=\"#9e6471\" stroke-width=\"1.5\"/></g>\n<g class=\"lg-face lg-face-preparing\"><path d=\"M-31-3l20-2M11-5l20 2\" stroke=\"#5d5364\" stroke-width=\"3\"/><circle cx=\"-20\" cy=\"6\" r=\"4\" fill=\"#35495f\"/><circle cx=\"21\" cy=\"6\" r=\"4\" fill=\"#35495f\"/><path d=\"M-9 27q9-6 18 0\" fill=\"none\" stroke=\"#9e6471\" stroke-width=\"2\"/></g>\n<g class=\"lg-face lg-face-casting\"><path d=\"M-31-2l20 3M11 1l20-4\" stroke=\"#5d5364\" stroke-width=\"3\"/><circle cx=\"-19\" cy=\"7\" r=\"4\" fill=\"#35495f\"/><circle cx=\"20\" cy=\"7\" r=\"4\" fill=\"#35495f\"/><ellipse cy=\"27\" rx=\"7\" ry=\"5\" fill=\"#9e6471\"/></g>\n<g class=\"lg-face lg-face-frustrated\"><path d=\"M-32-8l22 8M11-1l21-9M-27 6l12 4M15 10l12-4\" stroke=\"#5d5364\" stroke-width=\"2.7\"/><path d=\"M-11 27q11-9 22 0\" fill=\"none\" stroke=\"#9e6471\" stroke-width=\"2.5\"/></g>\n<g class=\"lg-face lg-face-satisfied\"><path d=\"M-30-6q10-6 19 0M11-6q10-6 19 0M-27 7q7 6 14 0M14 7q7 6 14 0\" fill=\"none\" stroke=\"#5d5364\" stroke-width=\"2.4\"/><path d=\"M-12 25q13 11 25-1\" fill=\"none\" stroke=\"#9e6471\" stroke-width=\"2.5\"/></g>\n<!-- Fine brass spectacles stay constant across expressions. -->\n<g fill=\"none\" stroke=\"url(#lg-gold)\" stroke-width=\"2\"><ellipse cx=\"-21\" cy=\"8\" rx=\"14\" ry=\"12\"/><ellipse cx=\"21\" cy=\"8\" rx=\"14\" ry=\"12\"/><path d=\"M-7 7Q0 2 7 7M-35 5-44 0M35 5 44 0\"/></g>\n<path d=\"M-31 1l9-2M13 1l9-2\" stroke=\"#fff9e3\" stroke-width=\"1.1\" opacity=\".7\"/>\n</g>\n<g class=\"lg-floating-book\" transform=\"translate(130 187)\"><path d=\"M-37-4Q-17-13 0-4Q17-13 37-4L32 26Q15 18 0 26Q-15 18-32 26Z\" fill=\"#d7b995\" stroke=\"#f7e5b6\" stroke-width=\"2\"/><path d=\"M-34-7Q-16-15 0-6V22Q-15 14-34 23ZM0-6Q16-15 34-7V23Q15 14 0 22Z\" fill=\"#f2e7c9\" stroke=\"#b49b72\" stroke-width=\"1.5\"/><path d=\"M-27-1-6 2M-26 5-6 8M7 2 27-1M7 8l19-3\" stroke=\"#9b8791\" stroke-width=\"1.2\"/></g>\n<circle class=\"lg-spell-aura\" cx=\"219\" cy=\"155\" r=\"30\" fill=\"url(#lg-magic)\"/>\n<path class=\"lg-cast-rune\" d=\"M218 137 222 150 235 155 222 160 218 174 214 160 201 155 214 150Z\" fill=\"#e8dcff\" stroke=\"#a69bd3\" stroke-width=\"1.5\"/>\n<path d=\"M75 242l3 5 5 3-5 3-3 5-3-5-5-3 5-3Z\" fill=\"none\" stroke=\"#bba37d\" stroke-width=\"1\"/><path d=\"M177 242l3 5 5 3-5 3-3 5-3-5-5-3 5-3Z\" fill=\"none\" stroke=\"#bba37d\" stroke-width=\"1\"/><path d=\"M64 277l3 5 5 3-5 3-3 5-3-5-5-3 5-3Z\" fill=\"none\" stroke=\"#bba37d\" stroke-width=\"1\"/><path d=\"M190 277l3 5 5 3-5 3-3 5-3-5-5-3 5-3Z\" fill=\"none\" stroke=\"#bba37d\" stroke-width=\"1\"/></g></svg>";stage.appendChild(guardian);
/* LIBRARIAN_GUARDIAN_ART_END */
 $('lib-close').addEventListener('click',close);$('lib-start').addEventListener('click',start);$('lib-next').addEventListener('click',next);
 pointerHold('lib-left','left');pointerHold('lib-right','right');pointerHold('lib-duck','duck');pointerAction('lib-jump',jump);pointerAction('lib-shield',shield);pointerAction('lib-dash',dash);
 document.addEventListener('keydown',keydown);document.addEventListener('keyup',keyup);document.addEventListener('visibilitychange',visibility);window.addEventListener('blur',loseFocus);
 screen='intro';freeze=false;elapsed=0;resetHero();last=performance.now();updateHud();frame=requestAnimationFrame(animation);$('lib-start').focus();
}
function close(){if(!root)return;cancelAnimationFrame(frame);document.removeEventListener('keydown',keydown);document.removeEventListener('keyup',keyup);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('blur',loseFocus);clearInput();root.remove();root=null;notifyMusic();ctx=null;heroNode=null;guardian=null;if(previousFocus&&previousFocus.focus)previousFocus.focus();}
entry.addEventListener('click',open);
// Test-only hooks are installed only with __RECALL_RALLY_TEST__; no production controls or physics change.
if(window.__RECALL_RALLY_TEST__){window.__librarianTest={open,close,start,next,choose,jump,keydown,keyup,update,setFrozen(v){freeze=!!v},render(){paint();syncHero()},get warnings(){return warnings},get mood(){return guardianMood},get state(){return screen},get hero(){return hero},get held(){return held},get question(){return question},get options(){return options},get books(){return books},get hearts(){return hearts},get round(){return round},get points(){return points},get remaining(){return remaining},setHearts(v){hearts=v},spawnBook(kind,x){books.push({kind,x,y:kind==='high'?FLOOR-87:FLOOR-22,speed:280,hit:false,passed:false,color:'#fff',seed:1})},get history(){return history()}};}
})();
