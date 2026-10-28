// The Librarian: optional Recall Rally arcade world. No server or extra account needed.
(function(){
'use strict';
if(window.__librarianInstalled)return;
window.__librarianInstalled=true;
var W=960,H=460,FLOOR=405,COUNT=8,KEY='recall-rally-librarian-v1';
var demos=[
['Who wrote Charlotte’s Web?','E. B. White','E. B. White wrote the story of Wilbur and Charlotte.'],
['Who wrote The Lion, the Witch and the Wardrobe?','C. S. Lewis','C. S. Lewis created the Chronicles of Narnia.'],
['Who is the pig in Charlotte’s Web?','Wilbur','Wilbur is Charlotte’s friend.'],
['Who wrote The Wonderful Wizard of Oz?','L. Frank Baum','L. Frank Baum created the Land of Oz.'],
['What kind of animal is Aslan in the Narnia stories?','Lion','Aslan appears as a great lion.'],
['Who wrote Alice’s Adventures in Wonderland?','Lewis Carroll','Lewis Carroll was Charles Lutwidge Dodgson’s pen name.'],
['Who wrote Anne of Green Gables?','L. M. Montgomery','Lucy Maud Montgomery wrote Anne of Green Gables.'],
['Who is the main girl in Alice’s Adventures in Wonderland?','Alice','Alice visits Wonderland.']
].map(function(v,i){return {id:'librarian-demo-'+i,prompt:v[0],answer:v[1],explanation:v[2],source:'Example question · not from state study guide'};});
var theme=/\b(books?|novels?|authors?|writers?|wrote|poems?|poets?|characters?|literature|fiction|nonfiction|biography|fables?|genres?|stories|story|tales?|plays?|reading|protagonists?|antagonists?|narrators?|folktales?|illustrators?)\b/i;
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
function pool(){
 var all=[];try{if(typeof SAMPLES!=='undefined'&&Array.isArray(SAMPLES))all=SAMPLES;}catch(e){}
 var f=all.filter(function(q){return q&&q.subject==='language'&&typeof q.prompt==='string'&&typeof q.answer==='string'&&q.prompt.length<200&&q.answer.length<100&&(!q.modes||q.modes.includes('quick'))&&theme.test((q.topic||'')+' '+q.prompt);});
 return f.length>=COUNT?f:demos;
}
function normalize(s){return String(s||'').normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');}
function right(s,q){var a=normalize(s);return !!a&&[q.answer].concat(q.aliases||[]).some(function(x){return normalize(x)===a;});}
function keep(question,correct,speed){
 try{var o=JSON.parse(localStorage.getItem(KEY)||'{}');if(!o||typeof o!=='object')o={};
 var id=String(question.id||question.prompt),v=o[id]||{asked:0,correct:0};v.asked++;if(correct){v.correct++;v.best=Math.min(v.best||99,speed);}o[id]=v;localStorage.setItem(KEY,JSON.stringify(o));}catch(e){}
}
var launch=document.createElement('button');launch.id='lib-launch';launch.type='button';launch.textContent='Take a rest in our nice peaceful library';
launch.setAttribute('aria-label','Take a rest in our nice peaceful library');
document.body.appendChild(launch);
var root=null,c=null,ctx=null,frame=0,last=0,t=0,prior=null;
var phase='intro',deck=[],question=null,round=0,correct=0,missed=0,points=0,lives=4,seconds=12,speed=0;
var hero={x:150,jump:0,vy:0,inv:0,vx:0,facing:1,pose:'ready',poseTime:0},held={left:false,right:false,duck:false},books=[],storm=0,spawn=0,shield=0,shieldReady=true;
var warnings=[],dashCooldown=0,dashTime=0,stormHits=0,shakeTime=0,freezeOnHide=false,bookSprite=new Image();
bookSprite.src='librarian/enchanted-book.svg';
var heroNode=null,guardianNode=null,throwCount=0,defeatPending=false;
var reducedMotion=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
function el(id){return root?root.querySelector('#'+id):null;}
function show(id,yes){var e=el(id);if(e)e.hidden=!yes;}
function note(s){el('lib-feedback').textContent=s;}
function sync(){
 if(!root)return;
 el('lib-lives').textContent=lives>0?'♥ '.repeat(lives):'—';
 el('lib-score').textContent=points;
 el('lib-count').textContent=Math.min(round,COUNT)+' / '+COUNT;
 el('lib-clock').textContent=phase==='question'?Math.ceil(Math.max(0,seconds))+'s':'';
 el('lib-shield').textContent=shieldReady?'🛡 SHIELD':'🛡 USED';
 el('lib-dash').disabled=phase!=='storm'||dashCooldown>0;
 var bar=el('lib-attack-info');
 if(bar)bar.textContent=phase==='storm'
  ?('BOOK STORM · '+Math.max(0,Math.ceil(storm))+'s  |  '+(warnings.length?'⚠ Incoming: '+warnings[warnings.length-1].name:'Read the glowing lanes'))
  :phase==='defeated'?'Defeated · Next Question to recover':phase==='defeat-hit'?'A final blow!':phase==='review'?'The Librarian reveals the answer':phase==='question'?'BUZZ before the clock ends':'Watch the shelves';
}
function clearHeld(){held.left=false;held.right=false;held.duck=false;if(root){['lib-left','lib-right','lib-duck'].forEach(function(id){var n=el(id);if(n)n.dataset.held='false';});}}
function reset(){
 hero={x:150,jump:0,vy:0,inv:0,vx:0,facing:1,pose:'ready',poseTime:0};clearHeld();
 books=[];warnings=[];storm=0;spawn=0;shield=0;shieldReady=true;
 dashTime=0;dashCooldown=0;stormHits=0;shakeTime=0;throwCount=0;defeatPending=false;sparks=[];
}
function start(){deck=shuffle(pool()).slice(0,COUNT);round=0;correct=0;missed=0;points=0;lives=4;reset();next();}
function next(){
 if(phase==='defeated')lives=4; // A new question revives the hero; no attack can leak across rounds.
 if(round>=COUNT){end(lives>0);return;}
 question=deck[round++];phase='question';seconds=12;speed=0;reset();
 el('lib-question').textContent=question.prompt;
 el('lib-source').textContent=question.source||'Recall Rally · literature question';
 el('lib-answer').value='';
 show('lib-start',false);show('lib-next',false);show('lib-buzz',true);show('lib-form',false);
 note('Think of the answer and press BUZZ! before the clock runs out.');sync();
}
function buzz(){if(phase!=='question')return;speed=12-seconds;phase='answer';show('lib-buzz',false);show('lib-form',true);note('The timer stopped. Type the answer you said aloud.');el('lib-answer').focus();sync();}
function answer(e){
 if(e)e.preventDefault();if(phase!=='answer')return;
 var v=el('lib-answer').value.trim();if(!v){note('Enter an answer or choose “I missed it.”');return;}
 var good=right(v,question);keep(question,good,speed);show('lib-form',false);
 if(good){correct++;points+=100+Math.round(Math.max(0,12-speed)*5);phase='review';show('lib-next',true);
 note('Correct! '+(question.explanation||('Answer: '+question.answer))+' · Buzzer time '+speed.toFixed(1)+'s.');}
 else attack();
 sync();
}
function pass(){
 if(phase!=='answer'&&phase!=='question')return;
 if(phase==='question')speed=12;
 keep(question,false,speed);show('lib-form',false);show('lib-buzz',false);attack();
}
function attack(){
 missed++;phase='storm';storm=8;spawn=.12;warnings=[];books=[];stormHits=0;throwCount=0;
 hero.pose='ready';hero.poseTime=0;defeatPending=false;clearHeld();
 note('Missed! HIGH books: hold DUCK. LOW books: jump, move, or shield.');
 var jumpButton=el('lib-jump');if(jumpButton)jumpButton.focus();
 sync();
}
function jump(){
 if(phase!=='storm'||held.duck||hero.pose==='ducking'||hero.pose==='hit'||hero.pose==='recovering'||hero.jump>0||hero.vy!==0)return;
 hero.vy=545;hero.pose='jumping';spawnBurst(hero.x,FLOOR-6,'#f6d6a0',6);
}
function dash(){
 if(phase!=='storm'||dashCooldown>0||held.duck||hero.pose==='hit'||hero.pose==='recovering')return;
 hero.facing=(held.left&&!held.right)?-1:(held.right&&!held.left)?1:hero.facing;
 dashTime=.21;dashCooldown=2.2;hero.inv=Math.max(hero.inv,.25);
 spawnBurst(hero.x,FLOOR-hero.jump-43,'#91def2',10);sync();
}
function useShield(){if(phase==='storm'&&shieldReady){shieldReady=false;shield=1.3;sync();}}
function hitBook(b){
 if(phase!=='storm'||b.hit)return;
 b.hit=true;
 if(shield>0){shield=0;points+=20;spawnBurst(b.x,b.y,'#8fedff',16);note('Shield spell! The book dissolves into sparks.');return;}
 if(hero.inv>0||defeatPending)return;
 lives=Math.max(0,lives-1);stormHits++;hero.inv=1.0;hero.pose='hit';hero.poseTime=.30;
 shakeTime=reducedMotion?0:.12;spawnBurst(b.x,b.y,'#f8b7aa',14);
 if(lives===0){
  defeatPending=true;phase='defeat-hit';books=[];warnings=[];clearHeld();
  note('The Librarian wins this round! Correct answer: '+question.answer+'. '+(question.explanation||''));
 }else note('A book struck your hero. Recover and keep moving! '+lives+' hearts remain.');
}
function resolveDefeat(){
 if(phase!=='defeat-hit')return;
 phase='defeated';hero.pose='defeated';hero.poseTime=0;hero.vy=0;hero.jump=0;hero.vx=0;
 books=[];warnings=[];clearHeld();dashTime=0;shield=0;
 show('lib-next',round<COUNT);show('lib-start',true);el('lib-start').textContent='Restart adventure';
 el('lib-question').textContent='The Librarian has defeated your hero!';
 el('lib-source').textContent='You learned: '+question.answer+'. '+(question.explanation||'');
 note('Your hero is resting. '+(round<COUNT?'Select Next Question to recover with four hearts, or restart.':'Restart to challenge the library again.'));
 sync();
}
function end(win){
 phase='done';books=[];warnings=[];show('lib-form',false);show('lib-buzz',false);show('lib-next',false);show('lib-start',true);
 el('lib-start').textContent='Play again';
 el('lib-question').textContent=win?'You have earned the Golden Bookmark!':'The Librarian sends you back to the entrance.';
 el('lib-source').textContent=win?'Chapter complete!':'Your answers are still valuable practice.';
 note('Score: '+points+' · Correct: '+correct+' · Missed: '+missed+'. Try again to improve!');sync();
}
var sparks=[];
function spawnBurst(x,y,color,count){
 if(reducedMotion)count=Math.min(3,count);
 for(var i=0;i<count;i++)sparks.push({x:x,y:y,vx:(Math.random()-.5)*170,vy:-Math.random()*140-30,life:.5+Math.random()*.35,color:color});
 if(sparks.length>80)sparks=sparks.slice(-80);
}
function bookWarning(){
 // Two deterministic, readable lanes: duck the high throw; jump or leave the low throw's path.
 var high=(throwCount++%2)===0;
 var type=high
  ?{kind:'high',y:FLOOR-93,name:'HIGH · DUCK',color:'#9fe8fa'}
  :{kind:'low',y:FLOOR-22,name:'LOW · JUMP / MOVE',color:'#ffbc81'};
 warnings.push({kind:type.kind,y:type.y,name:type.name,color:type.color,time:.62,max:.62,speed:350});
}
function tick(dt){
 t+=dt;
 if(phase==='question'){seconds-=dt;if(seconds<=0){seconds=0;pass();}}
 if(phase==='defeat-hit'){
  hero.poseTime=Math.max(0,hero.poseTime-dt);
  if(hero.poseTime===0)resolveDefeat();
 }
 if(phase==='storm'){
  var hitLocked=hero.pose==='hit'||hero.pose==='recovering';
  if(hitLocked){
   hero.poseTime=Math.max(0,hero.poseTime-dt);
   if(hero.poseTime===0){
    if(hero.pose==='hit'){hero.pose='recovering';hero.poseTime=.24;}
    else hero.pose='ready';
   }
  }
  var ducking=held.duck&&hero.jump===0&&dashTime===0&&!hitLocked;
  var dx=(held.right?1:0)-(held.left?1:0);
  var desired=hitLocked?0:dx*(ducking?155:390);
  hero.vx+=(desired-hero.vx)*Math.min(1,dt*(hitLocked?18:14));
  if(dx)hero.facing=dx;
  if(!hitLocked)hero.x=Math.max(33,Math.min(W-33,hero.x+(dashTime>0?hero.facing*780:hero.vx)*dt));
  dashTime=Math.max(0,dashTime-dt);
  dashCooldown=Math.max(0,dashCooldown-dt);
  var previousJump=hero.jump;
  hero.jump=Math.max(0,hero.jump+hero.vy*dt);
  if(hero.vy!==0||hero.jump>0){
   hero.vy-=1300*dt;
   if(hero.jump===0){hero.vy=0;if(previousJump>0)spawnBurst(hero.x,FLOOR-2,'#cbbca5',5);}
  }
  hero.inv=Math.max(0,hero.inv-dt);
  shield=Math.max(0,shield-dt);
  shakeTime=Math.max(0,shakeTime-dt);
  if(!hitLocked)hero.pose=ducking?'ducking':dashTime>0?'dashing':hero.jump>0?'jumping':dx?'moving':'ready';
  storm-=dt;spawn-=dt;
  if(spawn<=0&&storm>1.1){bookWarning();spawn=.92;}
  warnings.forEach(function(w){w.time-=dt;});
  warnings.filter(function(w){return w.time<=0;}).forEach(function(w){
   books.push({x:W+22,y:w.y,kind:w.kind,speed:w.speed,angle:0,phase:Math.random()*6,color:w.color,hit:false,dodged:false});
  });
  warnings=warnings.filter(function(w){return w.time>0;});
  books.forEach(function(b){
   var before=b.x;
   b.x-=b.speed*dt;
   // Physics hitbox follows the *actual* body height, not the decorative cloak/hair.
   var bodyTop=FLOOR-hero.jump-(hero.pose==='ducking'?48:116);
   var bodyBottom=FLOOR-hero.jump-6;
   var overlaps=b.x+23>hero.x-20&&b.x-23<hero.x+20&&b.y+15>bodyTop&&b.y-15<bodyBottom;
   if(!b.hit&&overlaps&&hero.inv<=0)hitBook(b);
   // Credit a legible, tactical duck or jump after the hazard passes the hero's x-position.
   if(!b.hit&&!b.dodged&&before>=hero.x&&b.x<hero.x){
    b.dodged=true;
    if(b.kind==='high'&&hero.pose==='ducking'){points+=25;spawnBurst(hero.x,FLOOR-52,'#9fe8fa',8);note('Perfect duck! +25 points.');}
    else if(b.kind==='low'&&hero.jump>43){points+=25;spawnBurst(hero.x,FLOOR-hero.jump,'#ffe0a5',8);note('Great leap! +25 points.');}
   }
  });
  books=books.filter(function(b){return b.x>-65&&!b.hit;});
  if(phase==='storm'&&storm<=0){
   phase='review';books=[];warnings=[];hero.pose='ready';hero.poseTime=0;clearHeld();hero.inv=0;
   show('lib-next',true);
   note('You survived'+(stormHits===0?' without a hit!':'!')+' Correct answer: '+question.answer+'. '+(question.explanation||''));
  }
 }
 sparks.forEach(function(p){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=190*dt;p.life-=dt;});
 sparks=sparks.filter(function(p){return p.life>0;});
 sync();
}
function poly(points,fill,stroke){
 ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(var i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();
 if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=3;ctx.stroke();}
}
function scenery(){
 if(!ctx)return;
 // The architectural art is rendered once by CSS as a static background.
 // This canvas contains only interactive hazards, telegraphs, particles, and light.
 ctx.clearRect(0,0,W,H);
 ctx.save();
 for(var i=0;i<(reducedMotion?0:12);i++){
  var x=(i*137+32+t*(4+i%3))%W,y=(i*51+t*6)%350;
  ctx.fillStyle=i%2?'#d1aeeb77':'#ffe8ba66';
  ctx.beginPath();ctx.arc(x,y,1.3,0,Math.PI*2);ctx.fill();
 }
 ctx.restore();
}
function actor(){
 // The saved customizable hero is the primary sprite. Use a pose-aware fallback only if absent.
 if(heroNode)return;
 ctx.save();ctx.translate(hero.x,FLOOR-hero.jump);
 if(hero.pose==='defeated'){ctx.translate(0,-10);ctx.rotate(-1.15);}
 var ducking=hero.pose==='ducking';
 ctx.fillStyle='#182a56';
 ctx.beginPath();ctx.ellipse(0,ducking?-26:-52,ducking?26:21,ducking?22:45,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#e9b99e';ctx.beginPath();ctx.arc(ducking?10:0,ducking?-49:-102,ducking?14:18,0,Math.PI*2);ctx.fill();
 if(shield>0){ctx.strokeStyle='#a5dfff';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,ducking?-37:-57,36,ducking?32:62,0,0,Math.PI*2);ctx.stroke();}
 ctx.restore();
}
function draw(){
 if(!ctx)return;
 scenery();
 if(phase==='storm'){
  warnings.forEach(function(w){
   var a=reducedMotion?.7:.25+.45*Math.sin(t*24),y=w.y;
   ctx.save();ctx.strokeStyle=w.color;ctx.globalAlpha=a;
   ctx.setLineDash([18,11]);ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(25,y);ctx.lineTo(W-20,y);ctx.stroke();
   ctx.setLineDash([]);ctx.fillStyle=w.color;ctx.beginPath();
   ctx.moveTo(W-28,y-23);ctx.lineTo(W-6,y);ctx.lineTo(W-28,y+23);ctx.closePath();ctx.fill();
   ctx.restore();
  });
 }
 books.forEach(function(b){
  ctx.save();ctx.translate(b.x,b.y+Math.sin(t*10+b.phase)*2.5);
  ctx.rotate(Math.sin(t*8+b.phase)*.13);
  var trail=ctx.createLinearGradient(-80,0,25,0);
  trail.addColorStop(0,'#855ed400');trail.addColorStop(1,'#ba7bf4b3');
  ctx.strokeStyle=trail;ctx.lineWidth=13;ctx.beginPath();ctx.moveTo(-70,0);ctx.quadraticCurveTo(-30,-8,0,0);ctx.stroke();
  ctx.shadowColor=b.color||'#bd87fd';ctx.shadowBlur=18;
  if(bookSprite.complete&&bookSprite.naturalWidth>0){ctx.drawImage(bookSprite,-30,-20,60,42);}
  else{ctx.fillStyle='#9f5381';ctx.fillRect(-24,-16,48,32);ctx.strokeStyle='#e9c18b';ctx.lineWidth=3;ctx.strokeRect(-24,-16,48,32);}
  ctx.restore();
 });
 sparks.forEach(function(p){
  ctx.fillStyle=p.color;ctx.globalAlpha=Math.min(1,p.life*2);
  ctx.beginPath();ctx.arc(p.x,p.y,2.2,0,Math.PI*2);ctx.fill();
 });
 ctx.globalAlpha=1;
 actor();
 if(shield>0&&heroNode){
  ctx.save();ctx.strokeStyle='#a0ebff';ctx.shadowColor='#7bdffa';ctx.shadowBlur=24;ctx.lineWidth=5;
  ctx.beginPath();ctx.ellipse(hero.x,FLOOR-hero.jump-63,39,59,0,0,Math.PI*2);ctx.stroke();ctx.restore();
 }
 if(phase==='intro'||phase==='done'){
  ctx.fillStyle='#11132cd9';ctx.fillRect(143,296,674,86);
  ctx.strokeStyle='#d6b57d';ctx.lineWidth=3;ctx.strokeRect(143,296,674,86);
  ctx.fillStyle='#f6ddaa';ctx.font='bold 25px Georgia,serif';ctx.textAlign='center';
  ctx.fillText(phase==='intro'?'THE GUARDIAN OF THE LOST LIBRARY':'THE ARCHIVES REMEMBER YOU',W/2,330);
  ctx.fillStyle='#d8e0ff';ctx.font='17px Georgia,serif';
  ctx.fillText(phase==='intro'?'Answer the riddle. Outsmart the flying books.':'A scholar learns from every encounter.',W/2,360);
 }
}
function syncActors(){
 if(!root)return;
 if(heroNode){
  heroNode.style.left=(hero.x/W*100)+'%';
  heroNode.style.bottom=((H-FLOOR+hero.jump)/H*100)+'%';
  heroNode.style.transform='translateX(-50%) scaleX('+hero.facing+')';
  // Exactly one pose class: never combine looping run, hit and defeat animations.
  heroNode.className='lib-hero-sprite lib-pose-'+hero.pose;
  heroNode.style.opacity='1'; // No damage-timer flicker; injury is one finite animation.
 }
 if(guardianNode)guardianNode.className='lib-guardian-sprite'+(phase==='storm'||phase==='defeat-hit'?' lib-casting':'');
}
function mountActors(){
 heroNode=document.createElement('div');heroNode.id='lib-hero-sprite';heroNode.className='lib-hero-sprite';
 heroNode.setAttribute('aria-hidden','true');
 try{
  if(typeof renderGameHero==='function'&&typeof avatarLook!=='undefined'){
   heroNode.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 420">'+
     renderGameHero(avatarLook,{idPrefix:'librarian-arcade-hero',pose:'idle'})+'</svg>';
  } else heroNode=null;
 }catch(e){console.warn('Could not render saved hero in The Librarian:',e);heroNode=null;}
 guardianNode=document.createElement('img');guardianNode.id='lib-guardian-sprite';guardianNode.className='lib-guardian-sprite';
 guardianNode.src='librarian/librarian-guardian.svg';guardianNode.alt='';
 var stage=el('lib-canvas').parentElement;
 if(heroNode)stage.appendChild(heroNode);
 stage.appendChild(guardianNode);
 syncActors();
}
function animate(now){if(!root)return;var dt=Math.min(.033,Math.max(0,(now-last)/1000));last=now;if(!freezeOnHide)tick(dt);draw();syncActors();frame=requestAnimationFrame(animate);}
function down(e){
 if(!root)return;
 if(e.key==='Escape'){close();return;}
 // Never capture keyboard gameplay actions while the student types an answer.
 if(e.target===el('lib-answer')||e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
 if(phase==='question'&&(e.code==='Space'||e.key==='Enter')){e.preventDefault();buzz();return;}
 if(phase!=='storm')return;
 if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','KeyA','KeyD','KeyW','KeyS','KeyQ','ShiftLeft','ShiftRight'].includes(e.code))e.preventDefault();
 if(e.code==='ArrowLeft'||e.code==='KeyA')held.left=true;
 if(e.code==='ArrowRight'||e.code==='KeyD')held.right=true;
 if(e.code==='ArrowDown'||e.code==='KeyS')held.duck=true;
 if((e.code==='ArrowUp'||e.code==='Space'||e.code==='KeyW')&&!e.repeat)jump();
 if(e.code==='KeyQ'&&!e.repeat)useShield();
 if((e.code==='ShiftLeft'||e.code==='ShiftRight')&&!e.repeat)dash();
}
function up(e){
 if(e.code==='ArrowLeft'||e.code==='KeyA')held.left=false;
 if(e.code==='ArrowRight'||e.code==='KeyD')held.right=false;
 if(e.code==='ArrowDown'||e.code==='KeyS')held.duck=false;
}
function touch(id,key){
 var b=el(id);
 b.addEventListener('pointerdown',function(e){
  if(phase!=='storm')return;
  e.preventDefault();held[key]=true;b.dataset.held='true';
  try{b.setPointerCapture(e.pointerId);}catch(x){}
 });
 ['pointerup','pointercancel','lostpointercapture'].forEach(function(ev){
  b.addEventListener(ev,function(){held[key]=false;b.dataset.held='false';});
 });
}
function lostFocus(){clearHeld();last=performance.now();}

function open(){
 if(root)return;freezeOnHide=false;prior=document.activeElement;
 root=document.createElement('div');root.id='lib-overlay';root.className='lib-game';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','The Librarian game');
 root.innerHTML=[
 '<div class="lib-frame"><div class="lib-top"><div><p class="lib-kicker">Ellery’s Recall Rally · Epic literature encounter</p><h2 class="lib-title">THE LIBRARIAN</h2></div><button id="lib-close" type="button" class="lib-close">✕ Return to Recall Rally</button></div>',
 '<div class="lib-card"><div class="lib-hud"><span class="lib-stat">📚 CHAPTER 1 · THE GREAT ARCHIVES</span><span class="lib-stat">♥ <b id="lib-lives">♥ ♥ ♥ ♥</b></span><span class="lib-stat">⭐ <b id="lib-score">0</b></span><span class="lib-stat">📖 <b id="lib-count">0 / 8</b></span></div>',
 '<div class="lib-canvas-wrap"><canvas id="lib-canvas" width="960" height="460" role="img" aria-label="A storybook gothic library. Orange, purple and cyan warning lanes reveal incoming enchanted books."></canvas><div class="lib-scene-label">THE GUARDIAN OF THE LOST LIBRARY</div><div id="lib-attack-info" class="lib-attack-info" aria-live="off">Watch the shelves</div></div>',
 '<div class="lib-dialogue"><div class="lib-prompt-tag">THE LIBRARIAN ASKS <span id="lib-clock" class="lib-timer"></span></div><p class="lib-prompt" id="lib-question">Only the well-read may leave these halls.</p><p class="lib-source" id="lib-source">Answer aloud, buzz, then enter the answer. Missing awakens flying books!</p><div class="lib-feedback" id="lib-feedback" aria-live="polite"></div></div>',
 '<div class="lib-actions"><button type="button" class="lib-btn primary" id="lib-start">ENTER THE ARCHIVES</button><button type="button" class="lib-btn primary" id="lib-buzz" hidden>⚡ BUZZ!</button>',
 '<form id="lib-form" class="lib-answer" hidden><label class="lib-small" for="lib-answer">Your answer:</label><input id="lib-answer" autocomplete="off" maxlength="100" aria-label="Your answer"><button type="submit" class="lib-btn secondary">Submit</button><button type="button" id="lib-pass" class="lib-btn">I missed it</button></form>',
 '<button type="button" id="lib-next" class="lib-btn secondary" hidden>Next question →</button></div>',
 '<div class="lib-controls"><button type="button" id="lib-left" class="lib-touch" aria-label="Move left">◀</button><button type="button" id="lib-right" class="lib-touch" aria-label="Move right">▶</button><button type="button" id="lib-duck" class="lib-touch lib-duck-btn" aria-label="Duck - press and hold">↓ DUCK</button><button type="button" id="lib-jump" class="lib-touch" aria-label="Jump">↑ JUMP</button><button type="button" id="lib-dash" class="lib-touch" aria-label="Dash forward">✦ DASH</button><button type="button" id="lib-shield" class="lib-touch" aria-label="Shield">🛡 SHIELD</button></div>',
 '<div class="lib-instructions">During the storm: move ◀ ▶, jump ↑, dash ✦, shield 🛡. Keyboard: A/D or Left/Right to move, S/Down to DUCK, Space/Up to jump, Shift to dash, Q to shield. Space buzzes questions.</div></div></div>'
 ].join('');
 document.body.appendChild(root);c=el('lib-canvas');ctx=c.getContext('2d');mountActors();
 el('lib-close').addEventListener('click',close);
 el('lib-start').addEventListener('click',function(){el('lib-start').textContent='ENTER THE ARCHIVES';start();});
 el('lib-buzz').addEventListener('click',buzz);
 el('lib-form').addEventListener('submit',answer);
 el('lib-pass').addEventListener('click',pass);
 el('lib-next').addEventListener('click',next);
 el('lib-jump').addEventListener('click',jump);
 el('lib-jump').addEventListener('pointerdown',function(e){if(e.pointerType==='touch')jump();});
 el('lib-shield').addEventListener('click',useShield);el('lib-dash').addEventListener('click',dash);
 el('lib-dash').addEventListener('pointerdown',function(e){if(e.pointerType==='touch')dash();});
 el('lib-shield').addEventListener('pointerdown',function(e){if(e.pointerType==='touch')useShield();});
 touch('lib-left','left');touch('lib-right','right');touch('lib-duck','duck');
 document.addEventListener('keydown',down);document.addEventListener('keyup',up);window.addEventListener('blur',lostFocus);
 reset();phase='intro';t=0;last=performance.now();sync();syncActors();document.addEventListener('visibilitychange',visibilityChanged);frame=requestAnimationFrame(animate);el('lib-start').focus();
}
function visibilityChanged(){
 if(!root)return;
 freezeOnHide=document.hidden;
 if(freezeOnHide)clearHeld();
 last=performance.now();
}
function close(){
 if(!root)return;cancelAnimationFrame(frame);document.removeEventListener('keydown',down);document.removeEventListener('keyup',up);
 document.removeEventListener('visibilitychange',visibilityChanged);window.removeEventListener('blur',lostFocus);clearHeld();root.remove();root=null;ctx=null;c=null;heroNode=null;guardianNode=null;if(prior&&prior.focus)prior.focus();
}
launch.addEventListener('click',open);
})();