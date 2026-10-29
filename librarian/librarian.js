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
let screen='intro',deck=[],question=null,options=[],round=0,correctCount=0,wrongCount=0,points=0,hearts=4;
let selected=-1,answerLocked=false,remaining=16,responseSeconds=0,attackClock=0,launchClock=0,throwIndex=0,hitCount=0;
let freeze=false,previousFocus=null,jumpBuffer=0,dashTimer=0,dashRecharge=0,shieldTimer=0,shieldReady=true;
let hero={x:174,y:0,vy:0,facing:1,pose:'idle',poseDuration:0,invulnerable:0},held={left:false,right:false,duck:false},warnings=[],books=[],particles=[];
let bookImage=new Image();bookImage.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjAgODQiIHdpZHRoPSIyNDAiIGhlaWdodD0iMTY4Ij4KPGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJsZWF0aGVyIiB4Mj0iMSIgeTI9Ii43Ij48c3RvcCBzdG9wLWNvbG9yPSIjY2U3YTc1Ii8+PHN0b3Agb2Zmc2V0PSIuNCIgc3RvcC1jb2xvcj0iIzg1M2E2MCIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzM4MWE1MSIvPjwvbGluZWFyR3JhZGllbnQ+PGxpbmVhckdyYWRpZW50IGlkPSJwYWdlcyIgeTI9IjEiPjxzdG9wIHN0b3AtY29sb3I9IiNmZmY5ZTYiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNjZmFmODYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz4KPHBhdGggZD0iTTggMTNRMzQgMiA1OCAxOFE4NSAzIDExMCAxM1Y3MFE4NyA1OCA1OCA3M1EzMSA1OSA4IDcwWiIgZmlsbD0idXJsKCNwYWdlcykiIHN0cm9rZT0iI2QyYjE3YyIgc3Ryb2tlLXdpZHRoPSI0Ii8+CjxwYXRoIGQ9Ik01IDhRMzItMyA1OSAxM1Y2OVEzMiA1NCA1IDY1WiIgZmlsbD0idXJsKCNsZWF0aGVyKSIgc3Ryb2tlPSIjZjFjOTgzIiBzdHJva2Utd2lkdGg9IjMiLz4KPHBhdGggZD0iTTU5IDEzUTg2LTMgMTEzIDhWNjVRODYgNTQgNTkgNjlaIiBmaWxsPSIjNjUzNDUzIiBzdHJva2U9IiNlZGJjNzIiIHN0cm9rZS13aWR0aD0iMyIvPgo8cGF0aCBkPSJNMTYgMTZRMzYgMTAgNTMgMjJNMTYgNThRMzYgNTMgNTMgNjRNNjUgMjNRODUgMTIgMTA0IDE3TTY1IDYzUTg3IDUyIDEwNCA2MCIgc3Ryb2tlPSIjZWNjNjhjIiBzdHJva2Utd2lkdGg9IjIuNiIgZmlsbD0ibm9uZSIvPgo8cGF0aCBkPSJNMjggMzVMMzQgMjkgNDAgMzUgMzQgNDJaIiBmaWxsPSIjZjVkNzhlIi8+PHBhdGggZD0iTTc5IDM1bDEwLTYgOSA3LTkgN1oiIGZpbGw9IiNiYzg0ZDciLz4KPHBhdGggZD0iTTU5IDEyVjcyIiBzdHJva2U9IiMyNzFhNDAiIHN0cm9rZS13aWR0aD0iNCIvPgo8cGF0aCBkPSJNMTYgMjFINDhNNjggMjJIMTAxIiBzdHJva2U9IiNmOWRmYWUiIHN0cm9rZS13aWR0aD0iMS41IiBvcGFjaXR5PSIuNjUiLz4KPC9zdmc+';
const entry=(typeof document.getElementById==='function'&&document.getElementById('lib-launch'))||document.createElement('button');
if(!entry.isConnected){entry.type='button';entry.id='lib-launch';entry.textContent='Take a rest in our nice peaceful library';entry.setAttribute('aria-label','Take a rest in our nice peaceful library');document.body.appendChild(entry)}
else{entry.disabled=false;}
function show(id,v){let e=$(id);if(e)e.hidden=!v;}
function message(m){let x=$('lib-status');if(x)x.textContent=m;}
function pose(p,d=0){if(hero.pose===p)return;hero.pose=p;hero.poseDuration=d;syncHero();}
function clearInput(){held.left=held.right=held.duck=false;jumpBuffer=0;['lib-left','lib-right','lib-duck'].forEach(id=>{const b=$(id);if(b)b.dataset.held='false';});}
function resetHero(){hero={x:174,y:0,vy:0,facing:1,pose:'idle',poseDuration:0,invulnerable:0};clearInput();warnings=[];books=[];particles=[];dashTimer=0;dashRecharge=0;shieldTimer=0;shieldReady=true;hitCount=0;}
function updateHud(){if(!root)return;
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
 question=deck[round++];options=shuffle(unique4(question));screen='question';
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
 if(win){correctCount++;points+=100+Math.max(0,Math.round((16-responseSeconds)*3));screen='review';pose('idle');message('Correct! The Librarian shares her wisdom.');reveal();}
 else {wrongCount++;screen='storm';attackClock=7.8;launchClock=.18;throwIndex=0;hitCount=0;clearInput();message('The shelves wake! Duck beneath HIGH books; jump above LOW books.');show('lib-choices',false);show('lib-learn',false);playTone('warning');}
 updateHud();
}
function spawnWarning(){
 const high=throwIndex++%2===0,extra=Math.min(110,Math.max(0,round-1)*14),speed=275+extra;
 const label=high?'HIGH · DUCK':'LOW · JUMP';warnings.push({kind:high?'high':'low',name:label,y:high?FLOOR-87:FLOOR-22,x:WIDTH-10,duration:Math.max(.43,.68-round*.017),speed,color:high?'#a3e9fc':'#fcb779'});
}
function launchBook(w){books.push({kind:w.kind,x:WIDTH+25,y:w.y,speed:w.speed,hit:false,passed:false,color:w.color,seed:Math.random()*6});}
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
 if(shieldTimer>0){shieldTimer=0;points+=15;message('Your shield dissolves an enchanted book!');particlesBurst(b.x,b.y,'#b4f4ff',11);playTone('shield');return;}
 if(hero.pose==='hit'||hero.pose==='recovering')return;
 hearts=Math.max(0,hearts-1);hitCount++;
 hero.invulnerable=.86;pose('hit',.24);particlesBurst(b.x,b.y,'#ffb6a0',12);playTone('hit');
 if(hearts===0){screen='defeat-hit';warnings=[];books=[];clearInput();hero.vy=0;message('The Librarian has won this encounter.');playTone('defeat');}
 else message('Ouch! The Librarian has sharp aim. Keep moving!');
}
function defeated(){if(screen!=='defeat-hit')return;screen='defeated';hero.y=0;hero.vy=0;hero.invulnerable=0;clearInput();pose('defeated');reveal();message('Your hero needs a moment. You can continue with fresh hearts.');updateHud();}
function endWave(){if(screen!=='storm')return;screen='review';warnings=[];books=[];clearInput();pose('idle');
 message(hitCount?'You survived the flying books!':'Flawless defense! The Librarian looks impressed.');reveal();updateHud();}
function finish(){screen='complete';clearInput();warnings=[];books=[];pose('idle');show('lib-choices',false);show('lib-learn',false);show('lib-next',false);show('lib-start',true);
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
     points+=25;particlesBurst(hero.x,FLOOR-hero.y-55,b.color,7);message(b.kind==='high'?'Perfect duck! +25':'Perfect jump! +25');playTone('dodge');
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
  for(const w of warnings){ctx.save();ctx.strokeStyle=w.color;ctx.lineWidth=5;ctx.setLineDash([16,10]);ctx.globalAlpha=reduced?.8:.5+.3*Math.sin(elapsed*14);
   ctx.beginPath();ctx.moveTo(18,w.y);ctx.lineTo(WIDTH-12,w.y);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=w.color;ctx.font='bold 19px system-ui';ctx.fillText(w.name,WIDTH-210,w.y-18);ctx.restore();}
 }
 for(const b of books){ctx.save();ctx.translate(b.x,b.y);
  if(!reduced)ctx.rotate(Math.sin(elapsed*8+b.seed)*.09);
  ctx.shadowColor=b.color;ctx.shadowBlur=reduced?3:15;
  if(bookImage.complete&&bookImage.naturalWidth)ctx.drawImage(bookImage,-29,-20,58,40);
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
 if(heroNode){heroNode.style.left=(hero.x/WIDTH*100)+'%';heroNode.style.bottom=((HEIGHT-FLOOR+hero.y)/HEIGHT*100)+'%';heroNode.style.transform='translateX(-50%) scaleX('+hero.facing+')';
  heroNode.className='lib-hero-sprite lib-v4-'+hero.pose;heroNode.style.opacity='1';}
 if(guardian)guardian.className='lib-guardian-sprite'+(screen==='storm'||screen==='defeat-hit'||screen==='review'?' lib-casting':'');
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
function visibility(){freeze=document.hidden;if(freeze)loseFocus();else last=performance.now();}
let audioCtx=null;
function soundEnabled(){try{if(typeof soundOn!=='undefined')return !!soundOn;}catch(e){}try{return localStorage.getItem('recall-rally-sound-v1')!=='off';}catch(e){return false;}}
function playTone(name){if(!soundEnabled())return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
 audioCtx=audioCtx||new AC();if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});
 const config={jump:[480,.055],dodge:[680,.085],hit:[170,.11],defeat:[125,.2],learn:[600,.12],warning:[300,.08],shield:[570,.09],dash:[310,.055]};
 const v=config[name]||config.jump,o=audioCtx.createOscillator(),gain=audioCtx.createGain();o.type='sine';o.frequency.value=v[0];gain.gain.setValueAtTime(.0001,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(.035,audioCtx.currentTime+.014);gain.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+v[1]);o.connect(gain);gain.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+v[1]+.01);
 }catch(e){} }
function open(){if(root)return;previousFocus=document.activeElement;
 root=document.createElement('div');root.id='lib-overlay';root.className='lib-game lib-v4-game';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','The Librarian game');
 root.innerHTML=`<div class="lib-frame"><header class="lib-top"><div><p class="lib-kicker">ELLERY'S RECALL RALLY · THE LOST LIBRARY</p><h2 class="lib-title">THE LIBRARIAN</h2></div><button id="lib-close" class="lib-close" type="button">✕ Return to Rally</button></header>
 <div class="lib-card"><div class="lib-hud"><span class="lib-stat">📜 CHAPTER I · THE GREAT ARCHIVES</span><span class="lib-stat">♥ <b id="lib-hearts">♥ ♥ ♥ ♥</b></span><span class="lib-stat">⭐ <b id="lib-score">0</b></span><span class="lib-stat">📖 <b id="lib-progress">0 / 8</b></span></div>
 <div class="lib-canvas-wrap"><canvas id="lib-canvas" width="960" height="460" role="img" aria-label="Enchanted books fly through a gothic library; control the hero using movement buttons."></canvas><div class="lib-scene-label">THE GUARDIAN OF THE LOST LIBRARY</div><div id="lib-attack" class="lib-attack-info">THE GREAT ARCHIVES</div><div id="lib-knowledge" class="lib-knowledge-wisp" aria-hidden="true">✧</div></div>
 <div class="lib-dialogue"><div class="lib-prompt-tag">THE LIBRARIAN ASKS <span id="lib-timer" class="lib-timer"></span></div><div class="rally-time-track lib-time-track" id="lib-time-track" aria-hidden="true" hidden><span class="rally-time-fill"></span></div><p class="lib-prompt" id="lib-question">Welcome, traveler. The library is very peaceful today.</p>
 <div id="lib-choices" class="lib-choices" hidden></div><section id="lib-learn" class="lib-learning" hidden aria-live="polite"><div class="lib-learn-kicker">✦ YOU LEARNED:</div><div id="lib-learn-answer" class="lib-learn-answer"></div><p id="lib-learn-explain" class="lib-learn-explain"></p><p id="lib-learn-selection" class="lib-learn-selection"></p><p id="lib-learn-source" class="lib-learn-source"></p></section><div class="lib-feedback" id="lib-status" aria-live="polite">An unexpected book may be waiting.</div></div>
 <div class="lib-actions"><button type="button" class="lib-btn primary" id="lib-start">ENTER THE READING ROOM</button><button type="button" class="lib-btn secondary" id="lib-next" hidden>NEXT QUESTION →</button></div>
 <div class="lib-controls"><button type="button" id="lib-left" class="lib-touch" aria-label="Move left">◀ LEFT</button><button type="button" id="lib-right" class="lib-touch" aria-label="Move right">RIGHT ▶</button><button type="button" id="lib-duck" class="lib-touch lib-duck-btn" aria-label="Duck while held">↓ DUCK</button><button type="button" id="lib-jump" class="lib-touch" aria-label="Jump">↑ JUMP</button><button type="button" id="lib-dash" class="lib-touch" aria-label="Dash">✦ DASH</button><button type="button" id="lib-shield" class="lib-touch" aria-label="Shield">🛡 SHIELD</button></div>
 <p class="lib-instructions">Movement: ← → · Jump ↑ · Duck ↓ · Shift dash · Q shield. Answers: tap A–D or press 1–4.</p></div></div>`;
 document.body.appendChild(root);stage=$('lib-canvas').parentElement;ctx=$('lib-canvas').getContext('2d');
 heroNode=document.createElement('div');heroNode.className='lib-hero-sprite';heroNode.id='lib-hero-sprite';heroNode.setAttribute('aria-hidden','true');
 try{if(typeof renderGameHero==='function'&&typeof avatarLook!=='undefined'){heroNode.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 420">'+renderGameHero(avatarLook,{idPrefix:'librarian-v4-hero',pose:'idle'})+'</svg>';stage.appendChild(heroNode);}else heroNode=null;}catch(e){heroNode=null;}
 guardian=document.createElement('img');guardian.className='lib-guardian-sprite';guardian.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NDAiIGhlaWdodD0iNTIwIiB2aWV3Qm94PSIwIDAgMjIwIDI2MCI+PGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icm9iZSIgeDI9IjEiIHkyPSIuOCI+PHN0b3Agc3RvcC1jb2xvcj0iIzI5MTk0NCIvPjxzdG9wIG9mZnNldD0iLjYiIHN0b3AtY29sb3I9IiM2NTNlODMiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMxNjBlMmMiLz48L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9InNpbHZlciIgeDI9IjEiIHkyPSIxIj48c3RvcCBzdG9wLWNvbG9yPSIjZmFmNWVmIi8+PHN0b3Agb2Zmc2V0PSIuNSIgc3RvcC1jb2xvcj0iI2I2YjhkNiIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzczN2JhNyIvPjwvbGluZWFyR3JhZGllbnQ+CjxyYWRpYWxHcmFkaWVudCBpZD0id2FuZCI+PHN0b3Agc3RvcC1jb2xvcj0iI2ZjZjlmZiIvPjxzdG9wIG9mZnNldD0iLjI4IiBzdG9wLWNvbG9yPSIjZTZhZGZmIi8+PHN0b3Agb2Zmc2V0PSIuNzIiIHN0b3AtY29sb3I9IiM5YzVhZTkiIHN0b3Atb3BhY2l0eT0iLjg1Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjOWM1YWU5IiBzdG9wLW9wYWNpdHk9IjAiLz48L3JhZGlhbEdyYWRpZW50PjwvZGVmcz4KPGVsbGlwc2UgY3g9IjEwOCIgY3k9IjI0MCIgcng9Ijg3IiByeT0iMTIiIGZpbGw9IiMxMzBkMjEiIG9wYWNpdHk9Ii4zIi8+CjxwYXRoIGQ9Ik03MiAxMzJRMzIgMTUzIDE3IDI0NVExMDggMjY0IDIwNSAyNDZRMTkxIDE1NiAxNDggMTMzWiIgZmlsbD0idXJsKCNyb2JlKSIgc3Ryb2tlPSIjYjc5MTY3IiBzdHJva2Utd2lkdGg9IjMiLz4KPHBhdGggZD0iTTEwOCAxNDdMOTggMjM5IDEzOCAyNDMgMTIzIDE0NiIgZmlsbD0iIzIzMTQyZiIgc3Ryb2tlPSIjZDRhZjc0IiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTEwOCAxNTZMOTIgMTY5IDEwOCAxOTQgMTI3IDE2OFoiIGZpbGw9IiM3ZDUwYWIiIHN0cm9rZT0iI2VmY2Y5OSIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik05NCAxMDlWMTM3TDEwOCAxNTEgMTIzIDEzNlYxMTEiIGZpbGw9IiNlMmI1OWEiIHN0cm9rZT0iI2EwNzc2YyIvPgo8cGF0aCBkPSJNNjggODlRNTggMzIgMTAwIDI0UTE1MSAxNiAxNjggNTNRMTg0IDgzIDE1MCAxMTdMNzMgMTE1WiIgZmlsbD0idXJsKCNzaWx2ZXIpIiBzdHJva2U9IiNjNWM2ZGQiIHN0cm9rZS13aWR0aD0iMyIvPgo8ZWxsaXBzZSBjeD0iMTEwIiBjeT0iOTMiIHJ4PSIzNSIgcnk9IjM5IiBmaWxsPSIjZTdiYWEwIiBzdHJva2U9IiNhMDdhNzUiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNNzcgNzdRNzggNDYgOTYgNTNRMTEzIDI3IDEzNyA1MFExNjEgNjAgMTQ4IDgyTDEzNiA2NVExMDggNzkgNzcgNzdaIiBmaWxsPSJ1cmwoI3NpbHZlcikiIHN0cm9rZT0iI2VkZWRmOSIgc3Ryb2tlLXdpZHRoPSIzIi8+CjxwYXRoIGQ9Ik04MSA4OVE5NSA4MCAxMDQgODlNMTIyIDg5UTEzOSA4MSAxNDkgOTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzM1MjQzZCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPGVsbGlwc2UgY3g9Ijk0IiBjeT0iOTgiIHJ4PSI5IiByeT0iNiIgZmlsbD0iI2ZiZmNmZiIgc3Ryb2tlPSIjNDUzNDU2IiBzdHJva2Utd2lkdGg9IjIiLz48ZWxsaXBzZSBjeD0iMTMyIiBjeT0iOTgiIHJ4PSI5IiByeT0iNiIgZmlsbD0iI2ZiZmNmZiIgc3Ryb2tlPSIjNDUzNDU2IiBzdHJva2Utd2lkdGg9IjIiLz48Y2lyY2xlIGN4PSI5NiIgY3k9Ijk4IiByPSIzIiBmaWxsPSIjMjgyMjM1Ii8+PGNpcmNsZSBjeD0iMTMxIiBjeT0iOTgiIHI9IjMiIGZpbGw9IiMyODIyMzUiLz4KPHBhdGggZD0iTTEwMCAxMTlRMTEwIDExNCAxMjMgMTIwIiBmaWxsPSJub25lIiBzdHJva2U9IiM5YTQ3NTUiIHN0cm9rZS13aWR0aD0iMyIvPgo8cGF0aCBkPSJNNTIgMTU2TDIzIDEwNSAxMiA5Nk0xNjUgMTU0TDE5NSAxMTIgMjA4IDk3IiBmaWxsPSJub25lIiBzdHJva2U9IiM1NjM1NzYiIHN0cm9rZS13aWR0aD0iMjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8cGF0aCBkPSJNNTIgMTU2TDIzIDEwNSAxMiA5Nk0xNjUgMTU0TDE5NSAxMTIgMjA4IDk3IiBmaWxsPSJub25lIiBzdHJva2U9IiNkOWE5NjgiIHN0cm9rZS13aWR0aD0iMi44Ii8+CjxwYXRoIGQ9Ik00IDkzTDE3IDgwIDI4IDk5IDE3IDExNVoiIGZpbGw9IiNlZGJiOWIiIHN0cm9rZT0iIzliN2E3MiIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTE5NyA5N0wyMTEgODIgMjIxIDEwNiAyMTAgMTIwWiIgZmlsbD0iI2VkYmI5YiIgc3Ryb2tlPSIjOWI3YTcyIiBzdHJva2Utd2lkdGg9IjIiLz4KPGNpcmNsZSBjeD0iMjA3IiBjeT0iNjgiIHI9IjMwIiBmaWxsPSJ1cmwoI3dhbmQpIi8+PHBhdGggZD0iTTIwNyAyNVY0NU0yMDcgOTBWMTA4TTE2NyA2OEgxODlNMjI1IDY4SDI0NyIgc3Ryb2tlPSIjZGNhNWZiIiBzdHJva2Utd2lkdGg9IjMiLz48L3N2Zz4=';guardian.alt='';stage.appendChild(guardian);
 $('lib-close').addEventListener('click',close);$('lib-start').addEventListener('click',start);$('lib-next').addEventListener('click',next);
 pointerHold('lib-left','left');pointerHold('lib-right','right');pointerHold('lib-duck','duck');pointerAction('lib-jump',jump);pointerAction('lib-shield',shield);pointerAction('lib-dash',dash);
 document.addEventListener('keydown',keydown);document.addEventListener('keyup',keyup);document.addEventListener('visibilitychange',visibility);window.addEventListener('blur',loseFocus);
 screen='intro';freeze=false;elapsed=0;resetHero();last=performance.now();updateHud();frame=requestAnimationFrame(animation);$('lib-start').focus();
}
function close(){if(!root)return;cancelAnimationFrame(frame);document.removeEventListener('keydown',keydown);document.removeEventListener('keyup',keyup);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('blur',loseFocus);clearInput();root.remove();root=null;ctx=null;heroNode=null;guardian=null;if(previousFocus&&previousFocus.focus)previousFocus.focus();}
entry.addEventListener('click',open);
// Expose narrow, read-only hooks to automated gameplay tests without affecting production play.
if(window.__RECALL_RALLY_TEST__){window.__librarianTest={open,close,start,next,choose,jump,keydown,keyup,update,get state(){return screen},get hero(){return hero},get held(){return held},get question(){return question},get options(){return options},get books(){return books},get hearts(){return hearts},get round(){return round},get points(){return points},get remaining(){return remaining},setHearts(v){hearts=v},spawnBook(kind,x){books.push({kind,x,y:kind==='high'?FLOOR-87:FLOOR-22,speed:280,hit:false,passed:false,color:'#fff',seed:1})},get history(){return history()}};}
})();

