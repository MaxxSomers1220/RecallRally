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
var launch=document.createElement('button');launch.id='lib-launch';launch.type='button';launch.textContent='📚 Enter The Librarian';
launch.setAttribute('aria-label','Open The Librarian literature game');
document.body.appendChild(launch);
var root=null,c=null,ctx=null,frame=0,last=0,t=0,prior=null;
var phase='intro',deck=[],question=null,round=0,correct=0,missed=0,points=0,lives=4,seconds=12,speed=0;
var hero={x:150,jump:0,vy:0,inv:0},held={left:false,right:false},books=[],storm=0,spawn=0,shield=0,shieldReady=true;
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
}
function reset(){hero={x:150,jump:0,vy:0,inv:0};held.left=false;held.right=false;books=[];storm=0;spawn=0;shield=0;shieldReady=true;}
function start(){deck=shuffle(pool()).slice(0,COUNT);round=0;correct=0;missed=0;points=0;lives=4;reset();next();}
function next(){
 if(round>=COUNT){end(true);return;}
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
function attack(){missed++;phase='storm';storm=6.5;spawn=.2;note('Missed! The shelves awaken. Dodge the enchanted books to survive!');sync();}
function jump(){if(phase==='storm'&&hero.jump===0&&hero.vy===0)hero.vy=475;}
function useShield(){if(phase==='storm'&&shieldReady){shieldReady=false;shield=1.3;sync();}}
function end(win){
 phase='done';books=[];show('lib-form',false);show('lib-buzz',false);show('lib-next',false);show('lib-start',true);
 el('lib-start').textContent='Play again';
 el('lib-question').textContent=win?'You have earned the Golden Bookmark!':'The Librarian sends you back to the entrance.';
 el('lib-source').textContent=win?'Chapter complete!':'Your answers are still valuable practice.';
 note('Score: '+points+' · Correct: '+correct+' · Missed: '+missed+'. Try again to improve!');sync();
}
function tick(dt){
 t+=dt;
 if(phase==='question'){seconds-=dt;if(seconds<=0){seconds=0;pass();}}
 if(phase==='storm'){
  var dx=(held.right?1:0)-(held.left?1:0);
  hero.x=Math.max(35,Math.min(W-35,hero.x+dx*310*dt));
  hero.jump=Math.max(0,hero.jump+hero.vy*dt);
  if(hero.vy!==0||hero.jump>0){hero.vy-=1100*dt;if(hero.jump===0)hero.vy=0;}
  hero.inv=Math.max(0,hero.inv-dt);shield=Math.max(0,shield-dt);storm-=dt;spawn-=dt;
  if(spawn<=0&&storm>.7){books.push({x:W+40,y:[FLOOR-19,FLOOR-49,FLOOR-98][Math.floor(Math.random()*3)],speed:230+Math.random()*105,angle:Math.random()-.5});spawn=.48+Math.random()*.26;}
  books.forEach(function(b){b.x-=b.speed*dt;
   if(!b.hit&&Math.abs(b.x-hero.x)<35&&Math.abs(b.y-(FLOOR-hero.jump-45))<55){
    b.hit=true;if(shield>0){shield=0;points+=15;}else if(hero.inv<=0){lives--;hero.inv=.9;}
   }
  });
  books=books.filter(function(b){return b.x>-60&&!b.hit;});
  if(lives<=0)end(false);
  else if(storm<=0){phase='review';books=[];show('lib-next',true);note('You escaped! Correct answer: '+question.answer+'. '+(question.explanation||''));}
 }
 sync();
}
function poly(points,fill,stroke){
 ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(var i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();
 if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=3;ctx.stroke();}
}
function scenery(){
 var sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#0b1231');sky.addColorStop(.55,'#333763');sky.addColorStop(1,'#161427');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
 for(var w=0;w<4;w++){
  var x=120+w*242,light=ctx.createRadialGradient(x,120,1,x,180,165);light.addColorStop(0,'#8ca2e94d');light.addColorStop(1,'#8ca2e900');ctx.fillStyle=light;ctx.fillRect(x-165,0,330,350);
  poly([[x-50,238],[x-50,95],[x,31],[x+50,95],[x+50,238]],'#283e68','#b89b71');
  poly([[x-37,231],[x-37,101],[x,53],[x+37,101],[x+37,231]],'#486ea6','#c1afbb');
  ctx.strokeStyle='#cebba4';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,52);ctx.lineTo(x,231);ctx.moveTo(x-36,159);ctx.lineTo(x+36,159);ctx.stroke();
 }
 for(var s=0;s<6;s++){
  var sx=s*190-50;ctx.fillStyle='#241d31';ctx.fillRect(sx,15,122,330);ctx.strokeStyle='#8d6545';ctx.lineWidth=5;ctx.strokeRect(sx+3,15,119,330);
  for(var row=0;row<6;row++){var y=49+row*49;for(var b=0;b<11;b++){var h=18+(b*9+row*7+s*3)%16;ctx.fillStyle=['#9b6a67','#6e789f','#8c5986','#a38963','#48747b'][(b+row+s)%5];ctx.fillRect(sx+9+b*10,y+30-h,8,h);}
   ctx.fillStyle='#9e7249';ctx.fillRect(sx+4,y+31,116,7);}
 }
 ctx.fillStyle='#281f36';ctx.fillRect(0,245,W,19);ctx.fillStyle='#bc8c5c';ctx.fillRect(0,243,W,5);
 for(var rail=0;rail<W;rail+=35){ctx.strokeStyle='#c39c6d';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(rail,265);ctx.lineTo(rail,288);ctx.stroke();}
 for(var k=0;k<4;k++){var cx=35+k*285,cy=210,glow=ctx.createRadialGradient(cx,cy,1,cx,cy,49);glow.addColorStop(0,'#ffd88b8a');glow.addColorStop(1,'#ffd88b00');ctx.fillStyle=glow;ctx.fillRect(cx-48,cy-48,96,96);ctx.fillStyle='#ffe2a0';ctx.beginPath();ctx.ellipse(cx,cy,6,11,0,0,Math.PI*2);ctx.fill();}
 ctx.save();ctx.translate(481,190);
 poly([[-40,4],[-59,56],[58,56],[36,4]],'#3f2c57');
 poly([[-32,-10],[-48,54],[48,54],[28,-10]],'#61417e','#e2b379');
 ctx.fillStyle='#e2b28f';ctx.beginPath();ctx.ellipse(0,-31,20,23,0,0,Math.PI*2);ctx.fill();
 poly([[-21,-39],[-19,-65],[-4,-83],[16,-72],[23,-46],[12,-55],[-16,-40]],'#c8cbd9');
 ctx.fillStyle='#332141';ctx.fillRect(-15,-31,11,4);ctx.fillRect(4,-31,11,4);
 ctx.strokeStyle='#e2b28f';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(31,8);ctx.lineTo(57,-17);ctx.lineTo(69,-46);ctx.stroke();
 ctx.shadowColor='#ac70fa';ctx.shadowBlur=23;ctx.fillStyle='#b475ef';ctx.beginPath();ctx.arc(70,-47,9+Math.sin(t*3)*2,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.restore();
 ctx.fillStyle='#44334b';ctx.fillRect(403,244,155,16);
 var floor=ctx.createLinearGradient(0,FLOOR,0,H);floor.addColorStop(0,'#775250');floor.addColorStop(1,'#252037');ctx.fillStyle=floor;ctx.fillRect(0,FLOOR,W,H-FLOOR);ctx.fillStyle='#e1b482';ctx.fillRect(0,FLOOR,W,7);
 for(var m=0;m<22;m++){var px=(m*139+35)%W,py=(m*73+t*12)%345;ctx.fillStyle=m%2?'#ffe0a55a':'#c2a1fd66';ctx.beginPath();ctx.arc(px,py,1.5,0,Math.PI*2);ctx.fill();}
}
function actor(){
 ctx.save();ctx.translate(hero.x,FLOOR-hero.jump);
 if(hero.inv>0&&Math.floor(t*15)%2===1){ctx.restore();return;}
 ctx.fillStyle='#0b0a1d88';ctx.beginPath();ctx.ellipse(0,0,23,5,0,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#d0a48d';ctx.lineWidth=9;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-8,-30);ctx.lineTo(-11,-4);ctx.moveTo(8,-30);ctx.lineTo(12,-4);ctx.stroke();
 poly([[-19,-65],[-27,-27],[25,-27],[18,-65]],'#346194');poly([[-15,-64],[16,-64],[12,-41],[-11,-41]],'#5ea9c7');
 ctx.strokeStyle='#dba680';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-17,-57);ctx.lineTo(-29,-37);ctx.moveTo(17,-57);ctx.lineTo(29,-36);ctx.stroke();
 ctx.fillStyle='#e2ad89';ctx.beginPath();ctx.arc(0,-80,17,0,Math.PI*2);ctx.fill();poly([[-17,-86],[-12,-104],[5,-106],[19,-93],[13,-76],[9,-91],[-13,-83]],'#4d3440');
 ctx.fillStyle='#22253c';ctx.fillRect(-5,-82,3,3);ctx.fillRect(5,-82,3,3);
 if(shield>0){ctx.shadowColor='#8eeaff';ctx.shadowBlur=20;ctx.strokeStyle='#90e8fc';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(0,-49,42,62,0,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;}
 ctx.restore();
}
function draw(){
 if(!ctx)return;ctx.clearRect(0,0,W,H);scenery();
 books.forEach(function(b){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.angle+Math.sin(t*9)*.12);ctx.shadowColor='#ae74fc';ctx.shadowBlur=21;ctx.fillStyle='#793868';ctx.fillRect(-22,-15,44,30);ctx.shadowBlur=0;ctx.strokeStyle='#f1bc89';ctx.lineWidth=2;ctx.strokeRect(-22,-15,44,30);ctx.beginPath();ctx.moveTo(0,-14);ctx.lineTo(0,14);ctx.stroke();ctx.restore();});
 actor();
 if(phase==='intro'||phase==='done'){ctx.fillStyle='#10152cdd';ctx.fillRect(154,300,650,83);ctx.strokeStyle='#d0a26d';ctx.lineWidth=2;ctx.strokeRect(154,300,650,83);ctx.fillStyle='#f1d79e';ctx.textAlign='center';ctx.font='bold 25px Georgia,serif';ctx.fillText(phase==='intro'?'THE GUARDIAN OF THE LOST LIBRARY':'THE ARCHIVES REMEMBER YOU',W/2,333);ctx.font='16px Georgia,serif';ctx.fillStyle='#d7dffa';ctx.fillText('Answer book questions. Dodge the books when you miss.',W/2,364);}
}
function animate(now){if(!root)return;var dt=Math.min(.033,Math.max(0,(now-last)/1000));last=now;tick(dt);draw();frame=requestAnimationFrame(animate);}
function down(e){
 if(!root)return;
 if(e.key==='Escape'){close();return;}
 if(e.target===el('lib-answer'))return;
 if(phase==='question'&&(e.code==='Space'||e.key==='Enter')){e.preventDefault();buzz();return;}
 if(phase!=='storm')return;
 if(['ArrowLeft','ArrowRight','ArrowUp','Space','KeyA','KeyD','KeyW','KeyS'].includes(e.code))e.preventDefault();
 if(e.code==='ArrowLeft'||e.code==='KeyA')held.left=true;
 if(e.code==='ArrowRight'||e.code==='KeyD')held.right=true;
 if(e.code==='ArrowUp'||e.code==='Space'||e.code==='KeyW')jump();
 if(e.code==='KeyS')useShield();
}
function up(e){if(e.code==='ArrowLeft'||e.code==='KeyA')held.left=false;if(e.code==='ArrowRight'||e.code==='KeyD')held.right=false;}
function touch(id,key){var b=el(id);b.addEventListener('pointerdown',function(e){e.preventDefault();held[key]=true;b.dataset.held='true';try{b.setPointerCapture(e.pointerId);}catch(x){};});['pointerup','pointercancel','lostpointercapture'].forEach(function(ev){b.addEventListener(ev,function(){held[key]=false;b.dataset.held='false';});});}
function open(){
 if(root)return;prior=document.activeElement;
 root=document.createElement('div');root.id='lib-overlay';root.className='lib-game';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','The Librarian game');
 root.innerHTML=[
 '<div class="lib-frame"><div class="lib-top"><div><p class="lib-kicker">Ellery’s Recall Rally · Epic literature encounter</p><h2 class="lib-title">THE LIBRARIAN</h2></div><button id="lib-close" type="button" class="lib-close">✕ Return to Recall Rally</button></div>',
 '<div class="lib-card"><div class="lib-hud"><span class="lib-stat">📚 CHAPTER 1 · THE GREAT ARCHIVES</span><span class="lib-stat">♥ <b id="lib-lives">♥ ♥ ♥ ♥</b></span><span class="lib-stat">⭐ <b id="lib-score">0</b></span><span class="lib-stat">📖 <b id="lib-count">0 / 8</b></span></div>',
 '<div class="lib-canvas-wrap"><canvas id="lib-canvas" width="960" height="460" role="img" aria-label="A magical library with a librarian on a balcony and a hero dodging flying books."></canvas><div class="lib-scene-label">THE GUARDIAN OF THE LOST LIBRARY</div></div>',
 '<div class="lib-dialogue"><div class="lib-prompt-tag">THE LIBRARIAN ASKS <span id="lib-clock" class="lib-timer"></span></div><p class="lib-prompt" id="lib-question">Only the well-read may leave these halls.</p><p class="lib-source" id="lib-source">Answer aloud, buzz, then enter the answer. Missing awakens flying books!</p><div class="lib-feedback" id="lib-feedback" aria-live="polite"></div></div>',
 '<div class="lib-actions"><button type="button" class="lib-btn primary" id="lib-start">ENTER THE ARCHIVES</button><button type="button" class="lib-btn primary" id="lib-buzz" hidden>⚡ BUZZ!</button>',
 '<form id="lib-form" class="lib-answer" hidden><label class="lib-small" for="lib-answer">Your answer:</label><input id="lib-answer" autocomplete="off" maxlength="100" aria-label="Your answer"><button type="submit" class="lib-btn secondary">Submit</button><button type="button" id="lib-pass" class="lib-btn">I missed it</button></form>',
 '<button type="button" id="lib-next" class="lib-btn secondary" hidden>Next question →</button></div>',
 '<div class="lib-controls"><button type="button" id="lib-left" class="lib-touch" aria-label="Move left">◀</button><button type="button" id="lib-right" class="lib-touch" aria-label="Move right">▶</button><button type="button" id="lib-jump" class="lib-touch" aria-label="Jump">↑ JUMP</button><button type="button" id="lib-shield" class="lib-touch" aria-label="Shield">🛡 SHIELD</button></div>',
 '<div class="lib-instructions">During the storm: ◀ ▶ to move, ↑ to jump, shield to block once. Keyboard: arrows/A-D, Space for jump, S for shield; Space also buzzes.</div></div></div>'
 ].join('');
 document.body.appendChild(root);c=el('lib-canvas');ctx=c.getContext('2d');
 el('lib-close').addEventListener('click',close);
 el('lib-start').addEventListener('click',function(){el('lib-start').textContent='ENTER THE ARCHIVES';start();});
 el('lib-buzz').addEventListener('click',buzz);
 el('lib-form').addEventListener('submit',answer);
 el('lib-pass').addEventListener('click',pass);
 el('lib-next').addEventListener('click',next);
 el('lib-jump').addEventListener('click',jump);
 el('lib-shield').addEventListener('click',useShield);
 touch('lib-left','left');touch('lib-right','right');
 document.addEventListener('keydown',down);document.addEventListener('keyup',up);
 reset();phase='intro';t=0;last=performance.now();sync();frame=requestAnimationFrame(animate);el('lib-start').focus();
}
function close(){
 if(!root)return;cancelAnimationFrame(frame);document.removeEventListener('keydown',down);document.removeEventListener('keyup',up);
 root.remove();root=null;ctx=null;c=null;held.left=false;held.right=false;if(prior&&prior.focus)prior.focus();
}
launch.addEventListener('click',open);
})();