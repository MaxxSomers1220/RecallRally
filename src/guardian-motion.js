// One presentation loop, mounted by renderDuel. It never grades, scores or persists.
const GuardianMotion=(()=>{
 let current=null,cache=null,raf=0,media=null,frames=0;
 const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
 const mix=(a,b,t)=>a+(b-a)*smooth(t),rad=a=>a*Math.PI/180;
 const around=(p,o,a)=>{const c=Math.cos(rad(a)),s=Math.sin(rad(a));return[o[0]+(p[0]-o[0])*c-(p[1]-o[1])*s,o[1]+(p[0]-o[0])*s+(p[1]-o[1])*c]};
 function target(r,state,t){const p=r.personality||{},v={head:0,arm0:-55,'arm0-tip':-35,wing0:0,'wing0-tip':0,step0:0,'step0-tip':0,'arm0-tip-wrist':0};
  if(state==='anticipation'){v.arm0=-65;v['arm0-tip']=-18;v.head=-3}
  if(state==='casting'){v.arm0=0;v['arm0-tip']=0;v.head=-1;v.wing0=-5;v['wing0-tip']=3;v.step0=-3}
  if(state==='follow-through'){v['arm0-tip-wrist']=7;v.arm0=5;v['arm0-tip']=7;v.head=1;v.wing0=1}
  if(state==='reaction'){v.head=5;v.arm0=-44;v['arm0-tip']=-45;v.wing0=-2;v.step0=1}
  if(state==='celebrating'){v.head=3;v.arm0=-35;v['arm0-tip']=-50;v.wing0=-5}
  // Optional profile-specific anatomy and timings use the same finite motion phases.
  v.arm0*=r.armScale??1;v['arm0-tip']*=r.armScale??1;
  if(r.rest){for(const k in r.rest)if(k in v&&state==='listening')v[k]=r.rest[k];}
  if((state==='reaction'||state==='celebrating')&&r.reaction)Object.assign(v,r.reaction);return v;
 }
 function pose(c,now){const d=c.duel,r=c.rig,dt=c.last?Math.min(.05,(now-c.last)/1000):0;c.last=now;c.clock+=dt;
  const key=d.phase+':'+d.index+':'+d.correct+':'+Boolean(d.fxActive);
  if(key!==c.event){c.event=key;c.start=now;c.from={...c.base};}
  let state='listening',go=target(r,state,c.clock),t=(now-c.start)/1000;
  if(d.phase==='result'&&!d.correct&&d.fxActive){
   if(t<.065){state='anticipation';go=target(r,state);go=blend(c.from,go,t/.065)}
   else if(t<.16){state='casting';go=blend(target(r,'anticipation'),target(r,state),(t-.065)/.095)}
   else if(t<.36){state='follow-through';go=blend(target(r,'casting'),target(r,state),(t-.16)/.2)}
   else {state='follow-through';go=blend(target(r,'follow-through'),target(r,'listening'),(t-.36)/.72)}
  }else{state=d.phase==='won'?'celebrating':d.phase==='lost'||d.phase==='result'?'reaction':'listening';go=blend(c.from,target(r,state),t/.4);}
  if(t>1.1&&state==='follow-through')state='listening';
  c.base={...go};
  const period=r.personality.period||8,cycle=(c.clock/period)%1,quiet=cycle<.65?0:Math.sin((cycle-.65)/.35*Math.PI);
  go.head+=(r.personality.head||1.3)*quiet;
  if(r.armFeather)go['arm0-tip']+=Math.sin(c.clock*.9-.6)*.55;
  for(const[i,a]of(r.tails||[]).entries())go['tail'+i]=(r.personality.tail||1.3)*Math.sin(c.clock*1.6+i);
  for(const[i,a]of(r.ears||[]).entries())go['ear'+i]=(r.personality.ear||2)*quiet*(i?-.7:1);
  for(const[i,a]of(r.wings||[]).entries()){go['wing'+i]=(go['wing'+i]||0)+(r.personality.wing||1.1)*Math.sin(c.clock*.8+i);go['wing'+i+'-tip']=(go['wing'+i+'-tip']||0)+Math.sin(c.clock*.8+i-.6)*.8;}
  for(const[i,a]of(r.cloth||[]).entries())go['cloth'+i]=Math.sin(c.clock*1.5-.4)*.7;
  const blinkPhase=(c.clock+1.7+(d.land*.47))%(4.6+d.land*.21),blink=blinkPhase<.16?Math.sin(blinkPhase/.16*Math.PI):0;
  if(c.reduced){state=d.phase==='result'?(d.correct?'reaction':'casting'):d.phase==='won'?'celebrating':d.phase==='lost'?'reaction':'listening';go=target(r,state);}
  c.values=go;c.node.dataset.motionState=state;c.node.dataset.characterPose=state==='casting'||state==='anticipation'||state==='follow-through'?'1':state==='reaction'||state==='celebrating'?'2':'0';
  const rib=c.reduced?0:Math.sin(c.clock*(2*Math.PI/(4.8+d.land*.23)))*.006,pivot=r.hip||r.breath?.[1]||460;for(const e of c.chests)e.setAttribute('transform','translate('+CHARACTER_META[d.land].width/2+' '+pivot+') scale('+(1+rib*.3).toFixed(5)+' '+(1+rib).toFixed(5)+') translate('+(-CHARACTER_META[d.land].width/2)+' '+(-pivot)+')');
  for(const e of c.joints){const name=e.dataset.gJoint,p=e.dataset.pivot.split(',').map(Number);e.setAttribute('transform','rotate('+(go[name]||0).toFixed(3)+' '+p.join(' ')+')');}
  for(const e of c.eyes)e.setAttribute('ry',(Number(e.dataset.radius)*(1-(c.reduced?0:blink)*.985)).toFixed(3));
  for(const e of c.lids)e.setAttribute('opacity',c.reduced?'0':String(Math.max(0,(blink-.8)*5)));
  for(const e of c.gaze)e.setAttribute('transform','translate('+(c.reduced?0:Math.sin(c.clock*.43)*.9).toFixed(3)+' 0)');
  const arm=r.arms[0],point=arm?around(around(arm.child?.hand?around(r.focus,arm.child.hand.pivot,go['arm0-tip-wrist']||0):r.focus,arm.child?.pivot||arm.pivot,go['arm0-tip']||0),arm.pivot,go.arm0||0):r.focus;
  const px=CHARACTER_META[d.land].width/2+(point[0]-CHARACTER_META[d.land].width/2)*(1+rib*.3),py=pivot+(point[1]-pivot)*(1+rib);const f={x:(d.land===9?585:588)+(px-CHARACTER_META[d.land].width/2)*.325,y:-25+py*.325};if(c.focus)c.focus.setAttribute('transform','translate('+f.x.toFixed(3)+' '+f.y.toFixed(3)+')');
 }
 function blend(a,b,t){const v={};for(const k of new Set([...Object.keys(a),...Object.keys(b)]))v[k]=mix(a[k]||0,b[k]||0,t);return v;}
 function detach(){if(raf)cancelAnimationFrame(raf);raf=0;if(media)media.removeEventListener?.('change',mediaChange);document.removeEventListener('visibilitychange',visibility);media=null;current=null;}
 function tick(now){raf=0;const c=current;if(!c)return;if(!c.node.isConnected||duel!==c.duel||mode!=='adventure'){cache=duel===c.duel?c:null;detach();return}if(document.hidden||c.duel.paused){c.last=0;return}pose(c,now);frames++;if(!c.reduced)raf=requestAnimationFrame(tick);}
 function mediaChange(){if(!current)return;current.reduced=media.matches;current.last=0;pose(current,performance.now());if(raf)cancelAnimationFrame(raf);raf=current.reduced?0:requestAnimationFrame(tick);}
 function visibility(){if(!current)return;if(document.hidden){current.hiddenAt=performance.now();if(raf)cancelAnimationFrame(raf);raf=0;current.last=0}else{current.start+=performance.now()-(current.hiddenAt||performance.now());current.last=0;if(!current.reduced)raf=requestAnimationFrame(tick)}}
 function mount(root,d){if(typeof requestAnimationFrame!=='function')return;if(!root?.querySelector){cache=null;detach();return;}const node=root.querySelector('.guardian-rig');
  const prior=current||cache;if(current)cache=current;detach();if(!node){if(!d)cache=null;else if(d.paused&&cache&&!cache.pausedAt)cache.pausedAt=performance.now();return}
  // The game pauses its own timers; preserve the presentation timeline as well.
  if(prior?.duel===d&&prior.pausedAt){prior.start+=performance.now()-prior.pausedAt;prior.pausedAt=0;}
  const same=prior&&prior.duel===d;current={node,duel:d,rig:GUARDIAN_RIGS[d.land],joints:[...node.querySelectorAll('[data-g-joint]')],eyes:[...node.querySelectorAll('[data-g-eye]')],lids:[...node.querySelectorAll('[data-g-lid]')],gaze:[...node.querySelectorAll('[data-g-gaze]')],focus:root.querySelector('.guardian-motion-focus'),clock:same?prior.clock:0,values:same?{...prior.values}:target(GUARDIAN_RIGS[d.land],'listening'),base:same?{...prior.base}:target(GUARDIAN_RIGS[d.land],'listening'),chests:[...node.querySelectorAll('[data-g-breath]')],event:same?prior.event:'',start:same?prior.start:performance.now(),last:0,from:same?{...prior.from}:{},reduced:false};
  media=window.matchMedia('(prefers-reduced-motion: reduce)');current.reduced=media.matches;media.addEventListener?.('change',mediaChange);document.addEventListener('visibilitychange',visibility);pose(current,performance.now());cache=current;if(!current.reduced)raf=requestAnimationFrame(tick);
 }
 return{mount,stop:()=>{cache=null;detach()},inspect:()=>({active:!!current,scheduled:!!raf,frames,state:current?.node.dataset.motionState,values:current?{...current.values}:null})};
})();
