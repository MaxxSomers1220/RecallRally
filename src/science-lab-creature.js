// Original botanical chamber and fictional Moonwing. Presentation only: this
// module owns no questions, grades, timers, saves or profile/hero state.
const CreatureIncubatorArt=(()=>{
 'use strict';
 const steps=['Restore gentle airflow','Steady the warmth','Balance the moisture','Set a gentle light','Complete the habitat check'];
 const descriptions=['Sleeping chamber · five controls need attention','Airflow restored · four controls remain','Warmth steady · a sleepy wiggle','Moisture balanced · the Moonwing peeks out','Gentle light set · wings begin to stretch','Habitat check complete · meet the Moonwing!'];
 const level=n=>Number.isInteger(n)?Math.max(0,Math.min(5,n)):0;
 const safe=s=>String(s||'').replace(/[^a-zA-Z0-9_-]/g,'');
 function description(n){return descriptions[level(n)]}
 function nextAction(n,mishap=false){n=level(n);return n===5?'All five controls checked. Say hello to your fictional Moonwing!':(mishap?'Read the explanation, then repair: ':'Next repair: ')+steps[n]+'.'}
 function render(value,context='experiment',cue='',needsRepair=false){
  const n=level(value),id='ci-'+safe(context),g=k=>'url(#'+id+'-'+k+')',fresh=['activate','repair','finale'].includes(cue),gold=g('brass');
  const path=(d,fill='none',stroke='#6b5742',width=2,extra='')=>'<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+width+'" '+extra+'/>';
  const gauge=(x,y,label,step,inside)=>'<g transform="translate('+x+' '+y+')" class="ci-instrument '+(n>=step?'is-balanced':'is-pending')+(fresh&&n===step?' ci-activate':'')+'" data-creature-instrument="'+step+'"><circle r="37" fill="'+gold+'" stroke="#634c39" stroke-width="3"/><circle r="29" fill="#e5dec0" stroke="#816c4c" stroke-width="2"/>'+inside+'<text y="53" text-anchor="middle" fill="#e4d8b2" font-size="9" letter-spacing="1">'+label+'</text></g>';
  let art='<g stroke-linecap="round" stroke-linejoin="round">';
  art+='<g clip-path="url(#'+id+'-interior)"><path d="M236 365V190Q238 87 360 82Q482 87 484 190V365Z" fill="#173846" fill-opacity=".58"/>';
  if(n>=2)art+='<ellipse class="ci-warmth" cx="360" cy="278" rx="122" ry="138" fill="'+g('warmth')+'"/>';
  if(n>=4)art+='<path class="ci-light-beam" d="M337 103H383L465 365H255Z" fill="#e7e7b1" opacity=".1"/>';
  art+='<ellipse cx="360" cy="362" rx="130" ry="29" fill="#2a5553"/>'+path('M234 358Q281 329 331 353Q394 326 485 359V383H234Z','#52796a','#809d79',1.5);
  // Botanical habitat: mature leaves unfold; this is not instant plant growth.
  for(const [x,y,flip,scale] of [[266,357,1,1],[456,355,-1,1],[285,367,1,.6],[435,370,-1,.65]]){
   art+='<g transform="translate('+x+' '+y+') scale('+flip*scale+' '+scale+')"><g class="ci-frond '+(n>=3?'is-unfurled':'')+'" style="--ci-leaf-angle:'+(n>=3?'0deg':'12deg')+'">'+path('M0 0Q18-51-12-99','none','#a9bc8e',3)+[-19,-40,-61,-79].map((h,i)=>path('M'+(6-i*3)+' '+h+'q-34-4-33-27q27 0 33 27q29-24 40-13q-7 23-40 13Z',g('leaf'),'#aecb9d',1.2)).join('')+path('M-8-90q-12-17-8-28q18 7 20 28Z',g('leaf'),'#aecb9d',1.2)+'</g></g>';
  }
  art+='<g class="ci-moss" fill="#9fbc90" stroke="#d5d9aa" stroke-width=".7">'+[[294,355],[313,362],[408,357],[427,350],[288,343]].map(([x,y],i)=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+(5+i%2*2)+'" ry="3"/>').join('')+'</g>';
  // Fine crescent-patterned chrysalis on a leaf cradle. It wiggles before reveal.
  if(n<4)art+='<g transform="translate(360 314)"><g class="ci-cocoon '+(n>=2?'is-wiggling':'')+'">'+path('M-43 25Q-59-13-35-56Q-15-91 0-88Q15-91 35-56Q59-13 43 25Q0 46-43 25Z','#bbc8ae','#e4ddb1',2.5)+path('M-41 11Q0 37 41 11M-45-5Q0 22 45-5M-45-22Q0 4 45-22M-37-44Q0-17 37-44','none','#78958e',2)+path('M-7-59Q-21-67-11-78Q-14-65-2-67Z','#f4dfae','#e4ddb1',.7)+(n<3?'<g class="ci-sleepy-face">'+path('M-18-42q6 6 12 0M6-42q6 6 12 0','none','#345761',2.4)+path(needsRepair?'M-4-28q4-6 8 0q0 8-8 0Z':'M-5-29q5 4 10 0',needsRepair?'#55717a':'none','#55717a',1.8)+'</g>':'')+'</g></g>';
  if(n>=3){
   art+='<g class="ci-moonwing ci-age-'+n+'" data-moonwing-state="'+(needsRepair?'sneezing':n===3?'peek':n===4?'stretch':'greeting')+'" transform="translate(360 '+(n===3?'286':n===4?'280':'264')+')"><g class="ci-creature-motion">';
   // Hinged wing groups retain the same silhouette through peek/stretch/greeting.
   for(const side of [-1,1]){
    art+='<g transform="scale('+side+' 1)"><g class="ci-wing '+(n>=4?'is-stretching':'is-folded')+'" style="--ci-wing-fold:'+(n===3?'58deg':n===4?'14deg':'-6deg')+'">'+path('M15 3C42-53 96-95 111-68C129-38 105-1 69 16C112 10 123 47 97 63C69 81 35 45 15 3Z',g('wing'),'#f4e3c3',2.5)+path('M20 6Q72-56 104-66M20 6Q65-18 113-39M20 6Q69 7 100 42M20 6Q51 40 89 57M50-24 55 0 81-7M48 28 64 17 75 34','none','#eff2dc',1.4,'opacity=".8"')+path('M80-46Q77-28 91-28Q103-34 97-44Q89-52 80-46Z','#e9dfb5','#a99ec6',1)+path('M84-45Q82-34 91-35Q86-37 90-45Z','#b2a1cd','none',0)+'<circle cx="84" cy="38" r="5" fill="#c5dfd0" stroke="#f4e3c3"/>'+path('M38-11Q49-45 69-54M37 19Q44 44 66 54','none','#8da6b8',2,'opacity=".6"')+'</g></g>';
   }
   art+='<g class="ci-body">'+path('M-27 8Q-38 51-17 68L-5 65 0 70 8 65 20 68Q38 49 27 8Z',g('fur'),'#d1e2bb',2)+path('M-17 18Q0 10 17 18V49Q0 67-17 49Z','#e2e9c9','#bad7bd',1.2)+path('M-14 24 0 29 14 24M-13 35 0 40 13 35M-9 47 0 51 9 47','none','#a1c4b2',1.5)+path('M-15 63q-19 5-14 11q14 4 24-8M15 63q19 5 14 11q-14 4-24-8','#a8d4bd','#e0e4be',1.5)+
    '<g transform="translate(-25 22)"><path class="ci-paw-left" d="M0 0q-26-6-21 7q5 15 26 3" fill="'+g('fur')+'" stroke="#d6e5be" stroke-width="2"/></g><g transform="translate(25 22)"><path class="ci-paw-wave" d="M0 0q26-6 21 7q-5 15-26 3" fill="'+g('fur')+'" stroke="#d6e5be" stroke-width="2"/></g>'+
    '<g class="ci-head">'+path('M-20-32Q-30-61-48-58M20-32Q30-61 48-58','none','#a9d1bd',3)+'<circle cx="-48" cy="-58" r="5" fill="#f4dba0"/><circle cx="48" cy="-58" r="5" fill="#f4dba0"/>'+path('M-42-19-49-25-43-31-47-36-31-41-27-49-12-44 0-54 12-44 27-49 31-41 47-36 43-31 49-25 42-19Q50 17 22 27L12 31 0 28-12 31-22 27Q-50 17-42-19Z',g('fur'),'#dce7bf',2.2)+path('M-33-18Q-24-31-7-16L0-5 7-16Q24-31 33-18Q45 7 21 16L0 24-21 16Q-45 7-33-18Z','#eef0d1','#bad6bc',1)+path('M4-40Q-12-37-5-26Q4-20 12-30Q0-26 4-40Z','#edcf8d','none',0)+
    (needsRepair?'<g class="ci-sneeze-face">'+path('M-29-3l13 5-12 5M29-3 16 2l12 5','none','#304d60',3)+'<ellipse cy="16" rx="7" ry="8" fill="#53657c" stroke="#b8c6b2"/></g>':'<g class="ci-eyes"><ellipse cx="-21" cy="0" rx="10" ry="14" fill="#2b455b" stroke="#879fab" stroke-width="1.5"/><ellipse cx="21" cy="0" rx="10" ry="14" fill="#2b455b" stroke="#879fab" stroke-width="1.5"/><g fill="#f7f5d9"><circle cx="-24" cy="-5" r="4"/><circle cx="18" cy="-5" r="4"/><circle cx="-17" cy="7" r="1.5"/><circle cx="25" cy="7" r="1.5"/></g></g>'+path('M-5 15Q0 20 5 15','none','#41616b',2))+path('M-4 9 0 12 4 9Z','#9b9b92','none',0)+'<g fill="#dfabb8" opacity=".7"><ellipse cx="-34" cy="12" rx="6" ry="3"/><ellipse cx="34" cy="12" rx="6" ry="3"/></g></g></g></g></g>';
  }
  // One bounded cloud/confetti burst per wrong answer. Repair marker persists.
  if(needsRepair){
   art+='<g class="sl-mishap-art sl-mishap-creature ci-malfunction"><g class="ci-sneeze-fog"><ellipse cx="371" cy="280" rx="86" ry="47" fill="#d5e7da" fill-opacity=".3"/><path d="M302 281Q329 248 358 272T432 270M305 300Q338 283 375 298T436 290" fill="none" stroke="#eff4dd" stroke-opacity=".55" stroke-width="4"/></g><g class="ci-confetti">';
   for(let i=0;i<12;i++){const x=292+i*29%139,y=227+i*23%101;art+='<path class="ci-confetti-piece" d="M'+x+' '+y+'l6-3 3 7-6 3Z" fill="'+['#f2ce8c','#d8b7e7','#a9ded0'][i%3]+'" stroke="#f5e9c5" stroke-width=".6" style="--ci-confetti-delay:'+i*.025+'s;--ci-confetti-x:'+((i-6)*4)+'px;--ci-confetti-y:'+(-24-i%3*9)+'px"/>'}
   art+='</g></g>';
  }
  art+='</g>';
  // Glass is layered in front of the habitat without hiding the live creature.
  art+=path('M232 366V190Q232 82 360 76Q488 82 488 190V366Q360 405 232 366Z',g('glass'),'#cee5d6',2.5)+path('M244 188Q243 111 312 97M245 205V292M473 194V321','none','#f3ffe8',4,'opacity=".35"')+
   path('M234 366Q360 401 486 366L493 379Q360 418 227 379Z',gold,'#71553c',2)+path('M241 377Q360 407 479 377','none','#fae5b2',1.5);
  // Copper crown, vent outlets and adjustable light reflector.
  art+=path('M311 90Q360 60 409 90L399 103Q360 88 321 103Z',gold,'#634c39',2)+path('M326 86Q360 73 394 86','none','#fce8b0',1.4)+'<g class="ci-light '+(n>=4?'is-on':'')+'"><ellipse cx="360" cy="98" rx="26" ry="7" fill="'+(n>=4?'#fff0b2':'#7b9596')+'" stroke="#ddc68f" stroke-width="2"/>'+(n>=4?'<ellipse cx="360" cy="101" rx="33" ry="14" fill="#f5e8b6" opacity=".35" filter="'+g('halo')+'"/>':'')+'</g>';
  // Fan, thermometer, humidity reservoir and light dial are separate mechanisms.
  art+=gauge(167,157,'AIRFLOW',1,'<g class="ci-fan '+(n>=1?'is-turning':'')+'">'+[0,120,240].map(a=>'<path d="M0 0Q-23-20-13-24Q7-28 6-5Z" transform="rotate('+a+')" fill="#82ada5" stroke="#526d6b" stroke-width="1"/>').join('')+'<circle r="5" fill="'+gold+'"/></g>');
  if(n>=1)art+='<g class="ci-airflow" fill="none" stroke="#bbebe0" stroke-width="2" opacity=".6"><path class="ci-air-thread" d="M201 150Q225 135 244 154M202 160Q225 148 246 166M203 171Q226 160 244 178" stroke-dasharray="4 8"/></g>';
  art+=gauge(167,278,'WARMTH',2,'<path d="M-7 8V-18Q0-29 7-18V8A12 12 0 1 1-7 8Z" fill="#afc7bb" stroke="#718579" stroke-width="1.5"/>'+path('M0 15V'+(n>=2?'-6':'8'),'none',n>=2?'#b88b58':'#a4a2c7',5)+'<circle cy="15" r="6" fill="'+(n>=2?'#d4aa6b':'#9fa3c3')+'"/><path d="M13-17H19M13-7H17M13 3H19" stroke="#9a8b6c" stroke-width="1.3"/>');
  art+=gauge(553,157,'MOISTURE',3,'<path d="M0-24Q-27 7-11 20Q0 31 13 19Q28 5 0-24Z" fill="#9cbbb5" stroke="#7d9b8b" stroke-width="1.5"/>'+path('M-15 '+(n>=3?'4':'15')+'Q0 '+(n>=3?'-1':'11')+' 15 '+(n>=3?'4':'15')+'Q14 25 0 24Q-14 25-15 '+(n>=3?'4':'15')+'Z','#76bdbd','#d7ead3',1)+path('M-7-5Q-15 6-9 11','none','#f3f1ce',2));
  art+=gauge(553,278,'LIGHT',4,'<circle cy="-5" r="12" fill="'+(n>=4?'#ebcc85':'#bcc4ad')+'" stroke="#a58b60" stroke-width="1.5"/>'+path('M0-24V-28M-19-5H-24M19-5H24M-13-19-17-23M13-19 17-23','none','#b29a6c',1.5)+'<g transform="translate(0 18)"><g class="ci-light-needle" style="--ci-needle:'+(n>=4?'0deg':'-50deg')+'">'+path('M0 3V-17','none','#a9694d',2.5)+'<circle r="3" fill="'+gold+'"/></g></g>');
  // Five numbered control wheels show repair state even with motion disabled.
  for(let i=0;i<5;i++){
   const done=i<n,repair=needsRepair&&i===n,x=240+i*60;
   art+='<g transform="translate('+x+' 409)" class="ci-control '+(done?'is-balanced':'is-pending')+(repair?' needs-repair':'')+(fresh&&n===i+1?' ci-control-turn':'')+'" data-creature-control="'+(i+1)+'" data-control-state="'+(done?'balanced':repair?'needs-repair':i===n?'current':'waiting')+'"><circle r="18" fill="'+gold+'" stroke="#6f523c" stroke-width="2"/><circle r="12" fill="'+(done?'#b7d9b6':'#28424b')+'" stroke="#d3c68c" stroke-width="1.2"/><text y="4" text-anchor="middle" fill="'+(done?'#365d54':'#f1dfb5')+'" font-size="12" font-weight="700">'+(done?'✓':repair?'↺':i+1)+'</text>'+(repair?'<circle r="23" fill="none" stroke="#ffe6b7" stroke-width="2" stroke-dasharray="4 4" data-creature-repair="'+(i+1)+'"/>':'')+'</g>';
  }
  // Final specimen-check plaque opens independently of the creature's movement.
  art+='<g class="ci-habitat-check '+(n===5?'is-complete':'')+'" transform="translate(360 127)"><path d="M-31-11Q0-20 31-11V5Q0 17-31 5Z" fill="'+gold+'" stroke="#6e553d" stroke-width="1.5"/><text y="2" text-anchor="middle" fill="#4a5846" font-size="9" letter-spacing="1">'+(n===5?'✓ READY':'HABITAT')+'</text></g>';
  if(n===5)art+='<g class="ci-finale" data-creature-celebration="true"><ellipse class="ci-reveal-halo" cx="360" cy="263" rx="123" ry="117" fill="'+g('moonlight')+'"/>'+[[-100,-50],[-72,-100],[78,-89],[109,-24],[-78,71],[92,61]].map(([x,y],i)=>'<path class="ci-reveal-spark" d="M'+(360+x)+' '+(260+y-6)+'l2 4 4 2-4 2-2 4-2-4-4-2 4-2Z" fill="#f4e3b3" style="--ci-spark-delay:'+i*.08+'s"/>').join('')+'</g>';
  art+='</g>';
  const desc=needsRepair?'A make-believe confetti sneeze! Read the explanation, then repair '+steps[Math.min(n,4)]+'.':description(n);
  return SCIENCE_LAB_ART.creature.replaceAll('__CI__',id).replace('class="sl-equipment sl-machine-creature ci-machine"','class="sl-equipment sl-machine-creature ci-machine ci-level-'+n+' ci-context-'+safe(context)+' ci-event-'+safe(cue)+(needsRepair?' ci-needs-repair':'')+'" data-creature-level="'+n+'" data-creature-cue="'+safe(cue)+'"').replace('aria-label="Creature Incubator"','aria-label="Creature Incubator: '+desc+'"').replace('<!-- CREATURE_LAYERS -->',art);
 }
 return{render,description,nextAction,steps};
})();
