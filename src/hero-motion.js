// Presentation only. The existing game owns all input, clocks, collisions and scoring.
const HeroMotion=(()=>{
 const ns='http://www.w3.org/2000/svg',cache=new Map();let rigs=[],raf=0,dirty=true,media,observer,frames=0,scans=0,hiddenAt=0;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),ease=x=>{x=clamp(x,0,1);return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*ease(t),deg=x=>x*180/Math.PI;
 function target(state){const a={head:-2,torso:0,'left-shoulder':-12,'left-elbow':-24,'left-wrist':4,'right-shoulder':8,'right-elbow':-12,'right-wrist':0,drop:0,shift:0};
  if(state==='anticipation')Object.assign(a,{head:-4,'left-shoulder':-19,'left-elbow':-16,'right-shoulder':12,'right-elbow':-5});
  if(state==='casting'||state==='shield')Object.assign(a,{head:-1,'left-shoulder':32,'left-elbow':14,'left-wrist':-8,'right-shoulder':0,'right-elbow':0});
  if(state==='follow-through')Object.assign(a,{head:1,'left-shoulder':24,'left-elbow':20,'left-wrist':-2,'right-shoulder':-2,'right-elbow':3});
  if(state==='reaction')Object.assign(a,{head:4,'left-shoulder':-26,'left-elbow':-80,'left-wrist':8,'right-shoulder':4,'right-elbow':-9});
  if(state==='hit')Object.assign(a,{head:7,torso:-3,'left-shoulder':-20,'left-elbow':-45,'right-shoulder':7,'right-elbow':12,drop:4});
  if(state==='victory'||state==='reunion')Object.assign(a,{head:-5,'left-shoulder':45,'left-elbow':30,'left-wrist':-6,'right-shoulder':-10,'right-elbow':7});
  if(state==='defeat')Object.assign(a,{head:12,torso:-6,'left-shoulder':-18,'left-elbow':-18,'right-shoulder':11,'right-elbow':9,drop:22});
  if(state==='duck')Object.assign(a,{head:-5,torso:36,'left-shoulder':-32,'left-elbow':-55,'right-shoulder':18,'right-elbow':-25,drop:62});
  if(state==='jump')Object.assign(a,{head:-4,torso:-3,'left-shoulder':31,'left-elbow':12,'right-shoulder':-9,'right-elbow':12});
  if(state==='dash')Object.assign(a,{head:-2,torso:13,'left-shoulder':-23,'left-elbow':-36,'right-shoulder':-7,'right-elbow':14,drop:14});
  return a;
 }
 function blend(a,b,t){const r={};for(const k of new Set([...Object.keys(a),...Object.keys(b)]))r[k]=mix(a[k]||0,b[k]||0,t);return r;}
 function intent(c){const n=c.node,lib=n.closest('.lib-hero-sprite'),scene=n.closest('.spell-scene');let key,state='listening';
  if(lib){state=lib.dataset.motionAction||(lib.className.match(/lib-v4-([\w-]+)/)||[])[1]||'idle';if(lib.closest('#lib-overlay')?.dataset.scene==='complete')state='victory';state={idle:'listening',recovering:'hit',defeated:'defeat',cast:'casting',ward:'shield'}[state]||state;key='lib:'+state;}
  else if(n.closest('#ellery-avatar')&&typeof questWalking!=='undefined'){state=questWalking?'run':'listening';key='map:'+state;}
  else if(scene&&typeof duel!=='undefined'&&duel){const d=duel;key='duel:'+d.land+':'+d.index+':'+d.phase+':'+d.correct+':'+Boolean(d.fxActive)+':'+Boolean(d.signaturePending)+':'+Boolean(d.signatureThisAnswer);state=d.phase==='won'?'victory':d.phase==='lost'?'defeat':d.phase==='result'?(d.correct?(d.fxActive&&!d.signaturePending?'spell':'reaction'):(d.fxActive?(d.tacticOutcome==='block'?'shield':d.tacticOutcome==='guard'?'reaction':'incoming'):'reaction')):'listening';}
  else if(n.closest('.preview-casting')){key='preview:cast';state='spell';}
  else{state={idle:'listening',cast:'spell',hit:'hit',victory:n.closest('.rigby-reunion,.rescue-reunion,.rescue-custom-hero,.rigby-reunion-hero,.castle-reunion-hero')?'reunion':'victory'}[n.dataset.heroPose]||'listening';key='pose:'+state;}
  return{state,key};
 }
 function scan(now){dirty=false;scans++;const next=[];
  const modal=document.querySelector('dialog[open]');
  for(const node of document.querySelectorAll('.hero-motion-rig')){
   if(modal&&!modal.contains(node))continue;
   if(node.closest('.hero-preset,.hero-thumb-choice,[hidden]'))continue;const dialog=node.closest('dialog');if(dialog&&!dialog.open)continue;const b=node.getBoundingClientRect();if(b.width<34||b.height<42||(!node.closest('.spell-scene')&&(b.bottom<0||b.top>innerHeight||b.right<0||b.left>innerWidth)))continue;
   const id=node.dataset.heroRigId,signature=node.dataset.heroSignature,owner=node.closest('.spell-scene')&&typeof duel!=='undefined'?duel:null,old=cache.get(id),same=old&&old.signature===signature&&old.owner===owner;
   const c=old?.node===node?old:{node,signature,owner,suspended:same?old.suspended:0,clock:same?old.clock:0,last:now,event:same?old.event:'',start:same?old.start:now,base:same?{...old.base}:target('listening'),from:same?{...old.from}:target('listening'),values:{},joints:[...node.querySelectorAll('[data-hj]')],eyes:[...node.querySelectorAll('[data-hero-aperture]')],lids:[...node.querySelectorAll('[data-hero-lid]')],gaze:[...node.querySelectorAll('[data-hero-gaze]')]};
   // When an encounter paused, DOM replacement removed its puppet. Resume its timeline.
   if(c.suspended){c.start+=now-c.suspended;c.last=now;c.suspended=0;}cache.set(id,c);next.push(c);
  }
  for(const c of rigs)if(!next.includes(c)&&!c.suspended)c.suspended=now;
  rigs=next;if(cache.size>40)for(const [id,c]of cache)if(!rigs.includes(c))cache.delete(id);
 }
 // Solve two bones against a fixed ankle. Crouches and weight shifts keep boot soles grounded.
 function legIK(side,dx,dy){const left=side==='left',h=left?[140,275]:[180,275],k=left?[121,313]:[200,313],a=left?[94,355]:[223,355],u=Math.hypot(k[0]-h[0],k[1]-h[1]),v=Math.hypot(a[0]-k[0],a[1]-k[1]),x=a[0]-h[0]-dx,y=a[1]-h[1]-dy,d=clamp(Math.hypot(x,y),Math.abs(u-v)+.01,u+v-.01),axis=Math.atan2(y,x),sign=left?1:-1,theta=axis+sign*Math.acos(clamp((u*u+d*d-v*v)/(2*u*d),-1,1)),kx=h[0]+dx+u*Math.cos(theta),ky=h[1]+dy+u*Math.sin(theta),phi=Math.atan2(a[1]-ky,a[0]-kx),initial=Math.atan2(k[1]-h[1],k[0]-h[0]),initial2=Math.atan2(a[1]-k[1],a[0]-k[0]);
  return{hip:deg(theta-initial),knee:deg(phi-initial2)-deg(theta-initial),ankle:-deg(phi-initial2)};
 }
 function draw(c,now){const dt=clamp((now-c.last)/1000,0,.05);c.last=now;c.clock+=dt;const wanted=intent(c),reduced=media.matches;
  if(c.event!==wanted.key){c.event=wanted.key;c.from={...c.base};c.start=now;}
  const t=(now-c.start)/1000;let state=wanted.state,go;
  if(state==='spell'&&!reduced){if(t<.075){state='anticipation';go=blend(c.from,target(state),t/.075)}else if(t<.155){state='casting';go=blend(target('anticipation'),target(state),(t-.075)/.08)}else if(t<.36){state='follow-through';go=blend(target('casting'),target(state),(t-.155)/.205)}else{state='follow-through';go=blend(target('follow-through'),target('listening'),(t-.36)/.72)}}
  else if(state==='incoming'){state=t<.68?'anticipation':t<1.06?'hit':'reaction';go=blend(t<.68?c.from:target('listening'),target(state),t<.68?t/.18:(t-.68)/.12)}
  else{if(state==='spell')state='casting';go=reduced?target(state):blend(c.from,target(state),t/(state==='duck'?.16:.32));}
  c.base={...go};const clock=c.clock,quiet=reduced?0:Math.sin(clamp(((clock%9.7)-6.8)/2.9,0,1)*Math.PI),breath=reduced?0:Math.sin(clock*1.15)*.55;
  if(!reduced){go.head+=quiet*1.7;go.shift+=quiet*.85;go.drop+=breath;go['left-wrist']+=Math.sin(clock*.8)*.45;}
  const library=!!c.node.closest('.lib-hero-sprite'),follow=1-Math.exp(-dt/.035);
  if(library&&!reduced){for(const key of ['head','torso','left-shoulder','left-elbow','left-wrist','right-shoulder','right-elbow','right-wrist','drop','shift'])if(Number.isFinite(c.values[key]))go[key]=c.values[key]+(go[key]-c.values[key])*follow;if(c.previousState!==state&&['run','jump'].includes(c.previousState))c.settleUntil=now+150;}
  if(state==='run'){const stride=reduced?0:Math.sin(clock*12.8);go['left-hip']=stride*24;go['right-hip']=-stride*24;go['left-knee']=Math.max(0,-stride)*42;go['right-knee']=-Math.max(0,stride)*42;go['left-ankle']=-go['left-hip']-go['left-knee'];go['right-ankle']=-go['right-hip']-go['right-knee'];go['left-shoulder']=-stride*19;go['right-shoulder']=stride*16;go['left-elbow']=-22-Math.max(0,-stride)*16;go['right-elbow']=-12-Math.max(0,stride)*13;}
  else if(state==='jump'){Object.assign(go,{'left-hip':18,'left-knee':22,'left-ankle':-15,'right-hip':-15,'right-knee':-30,'right-ankle':16});}
  else for(const side of ['left','right']){const ik=legIK(side,go.shift,go.drop);go[side+'-hip']=ik.hip;go[side+'-knee']=ik.knee;go[side+'-ankle']=ik.ankle;}
  if(library&&!reduced&&(state==='run'||state==='jump'||now<(c.settleUntil||0)))for(const side of ['left','right'])for(const part of ['hip','knee','ankle']){const key=side+'-'+part;if(Number.isFinite(c.values[key]))go[key]=c.values[key]+(go[key]-c.values[key])*follow;}c.previousState=state;
  const spread={anticipation:-2,casting:-6,'follow-through':-3,victory:-9,reunion:-9,jump:-10,hit:4,defeat:6,duck:8,shield:-5}[state]||0;
  Object.assign(go,{cape:reduced?0:Math.sin(clock*1.05-.7)*1.25-(go['left-shoulder']||0)*.055,hair:reduced?0:Math.sin(clock*1.4-.5)*.55,'hair-back':go.head*.55+(reduced?0:Math.sin(clock*1.2-.6)*.4),skirt:reduced?0:Math.sin(clock*1.1-.6)*.65+go.torso*.3-go['left-shoulder']*.02,'wing-left':spread+(reduced?0:Math.sin(clock*.95)*1.7),'wing-right':spread+(reduced?0:Math.sin(clock*.95-.45)*1.4),'ear-left':quiet*2.2-go.head*.14,'ear-right':-quiet*1.1+go.head*.1});
  if(!reduced)for(const key of ['cape','hair','hair-back','skirt','wing-left','wing-right','ear-left','ear-right'])if(Number.isFinite(c.values[key]))go[key]=c.values[key]+(go[key]-c.values[key])*(1-Math.exp(-dt/.08));

  go['torso-back']=go.torso;
  for(const e of c.joints){const key=e.dataset.hj,p=e.dataset.pivot.split(',').map(Number),shift=key==='torso'||key==='torso-back'||key.endsWith('-hip')?'translate('+go.shift.toFixed(3)+' '+go.drop.toFixed(3)+') ':'';e.setAttribute('transform',shift+'rotate('+(go[key]||0).toFixed(3)+' '+p.join(' ')+')');}
  const b=(clock+1.4)%5.9,blink=reduced?0:b<.19?Math.sin(b/.19*Math.PI):0;for(const e of c.eyes)e.setAttribute('ry',(Number(e.dataset.radius)*(1-blink*.985)).toFixed(3));for(const e of c.lids)e.setAttribute('opacity',String(Math.max(0,(blink-.78)/.22)));for(const e of c.gaze)e.setAttribute('transform','translate('+(reduced?0:quiet*.7).toFixed(3)+' 0)');
  c.values=go;c.state=state;c.node.dataset.heroMotion=state;
  // Project the actual animated implement into its containing combatant SVG.
  const creator=c.node.closest('#hero-live-preview'),ctool=c.node.querySelector('.panther-weapon');if(creator&&ctool){const glyph=creator.querySelector('.creator-spell-glyph'),space=creator.querySelector('svg'),p=gameHeroWeaponFocus();if(glyph&&space){const m=space.getScreenCTM()?.inverse().multiply(ctool.getScreenCTM()),unrot=new DOMMatrix().translate(267,164).rotate(-9).translate(-267,-164);if(m){const q=new DOMPoint(p.x,p.y).matrixTransform(unrot).matrixTransform(m);glyph.setAttribute('transform','translate('+q.x.toFixed(3)+' '+q.y.toFixed(3)+')')}}}
  const scene=c.node.closest('.spell-scene'),tool=c.node.querySelector('.panther-weapon');if(scene&&tool){const focus=scene.querySelector('.hero-motion-focus'),space=scene.querySelector('.arena-combatants');if(focus&&space){const p=gameHeroWeaponFocus(),m=space.getScreenCTM()?.inverse().multiply(tool.getScreenCTM());if(m){const unrot=new DOMMatrix().translate(267,164).rotate(-9).translate(-267,-164),native=new DOMPoint(p.x,p.y).matrixTransform(unrot),q=native.matrixTransform(m);focus.setAttribute('transform','translate('+q.x.toFixed(3)+' '+q.y.toFixed(3)+')');}}}
 }
 function tick(now){raf=0;if(document.hidden)return;if(dirty)scan(now);for(const c of rigs)draw(c,now);frames++;if(rigs.length&&!media.matches)raf=requestAnimationFrame(tick);}
 function wake(){dirty=true;if(!media||typeof requestAnimationFrame!=='function')return;if(!raf&&!document.hidden)raf=requestAnimationFrame(tick);}
 function visibility(){if(document.hidden){hiddenAt=performance.now();if(raf)cancelAnimationFrame(raf);raf=0;}else{const now=performance.now();for(const c of cache.values()){c.start+=now-hiddenAt;c.last=now;}wake();}}
 function init(){if(observer)return;media=matchMedia('(prefers-reduced-motion: reduce)');media.addEventListener('change',wake);observer=new MutationObserver(records=>{if(records.some(r=>r.type==='childList'||r.oldValue!==r.target.getAttribute(r.attributeName)))wake()});observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeOldValue:true,attributeFilter:['class','hidden','open','data-motion-action']});document.addEventListener('visibilitychange',visibility);window.addEventListener('scroll',wake,{passive:true,capture:true});window.addEventListener('resize',wake,{passive:true});wake();}
 if(typeof document!=='undefined'&&typeof requestAnimationFrame==='function'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();}
 return{refresh:wake,replay:()=>{const c=cache.get('battle-panther');if(c)c.event='';wake()},preview:()=>{const c=cache.get('hero-live');if(c)c.event='';wake()},inspect:()=>({scheduled:!!raf,frames,scans,count:rigs.length,rigs:rigs.map(c=>({id:c.node.dataset.heroRigId,state:c.state,values:{...c.values}}))})};
})();
