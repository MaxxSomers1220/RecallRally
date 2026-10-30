// Original miniature atmospheric laboratory. Repaired steps drive this view;
// academic content, grades, repairs and saves remain in ScienceLab.
const WeatherMachineArt=(()=>{
 'use strict';
 const steps=['Connect the water circuit','Warm the reservoir','Cool the condensation plate','Collect the rainfall','Align sunlight with the drops'];
 const labels=['Water','Warm','Cool','Rain','Light'];
 const descriptions=['Atmospheric lab ready · five controls pending','Pump running · liquid water circulates','Reservoir warmed · water vapor is invisible','Cooling plate ready · tiny droplets form a cloud','Rain falling · water returns to the collector','Sunlight and droplets · a miniature rainbow!'];
 const level=n=>Number.isInteger(n)?Math.max(0,Math.min(5,n)):0,safe=s=>String(s||'').replace(/[^a-zA-Z0-9_-]/g,'');
 function description(n){return descriptions[level(n)]}
 function nextAction(n,m=false){return level(n)===5?'Water cycle complete. Enjoy the miniature rainbow!':(m?'Read the explanation, then repair: ':'Next repair: ')+steps[level(n)]+'.'}
 function render(value,context='experiment',cue='',mishap=false){
  const n=level(value),id='wm-'+safe(context),g=k=>'url(#'+id+'-'+k+')',gold=g('brass');
  const p=(d,f='none',s='#6c513c',w=2,e='')=>'<path d="'+d+'" fill="'+f+'" stroke="'+s+'" stroke-width="'+w+'" '+e+'/>';
  let a='<g stroke-linecap="round" stroke-linejoin="round"><g clip-path="'+g('chamber')+'">'+p('M228 367V190Q230 88 360 80Q490 88 492 190V367Z',g('sky'),'none',0);
  if(n>=5)a+='<ellipse cx="360" cy="233" rx="139" ry="144" fill="'+g('halo')+'"/>';
  // Cloud droplets are liquid water. Water vapor itself is never drawn as dots.
  if(n>=3)a+='<g class="wm-cloud" data-weather-cloud="droplets" transform="translate('+(n===5?'321':'360')+' '+(n===5?'217':'223')+')">'+p('M-76 19C-111 6-100-27-74-26C-71-56-32-62-16-41C5-62 43-46 45-24C77-33 98-4 78 18Q18 39-76 19Z',g('cloud'),'#d3e8de',2)+p('M-81-10Q-65-35-43-25M-22-35Q-4-47 13-28M37-14Q62-28 73-7','none','#fff9df',3,'opacity=".65"')+'</g>';
  if(n>=4)a+='<g class="wm-rain" data-weather-rain="liquid" fill="none" stroke="#d2f0eb" stroke-width="2.5">'+[278,301,324,347,370,393,416].map((x,i)=>'<path class="wm-rain-stream" d="M'+x+' '+(262+i%3*9)+'v70" stroke-dasharray="5 17" style="animation-delay:-'+i*.18+'s"/>').join('')+'</g>';
  if(n>=5){
   a+='<g class="wm-sun" transform="translate(433 157)"><circle r="21" fill="#ffe5a1" stroke="#fff1c1" stroke-width="2"/><g class="wm-sun-rays" stroke="#f9dfa1" stroke-width="2">'+Array.from({length:12},(_,i)=>'<path d="M0-27V-34" transform="rotate('+i*30+')"/>').join('')+'</g></g>';
   a+='<g class="wm-rainbow" data-weather-celebration="true" fill="none" stroke-width="6">'+['#e9a19b','#eeb479','#f1d994','#a4d4a5','#8acbd6','#9faee3','#c3a3dd'].map((c,i)=>'<path class="wm-rainbow-band" d="M'+(254+i*6)+' 322A'+(106-i*6)+' '+(106-i*6)+' 0 0 1 '+(466-i*6)+' 322" stroke="'+c+'" pathLength="100" style="--wm-delay:'+i*.065+'s"/>').join('')+'</g>';
  }
  a+=p('M227 351Q270 318 319 348Q375 326 421 347Q458 326 494 352V376H227Z','#4b837d','#9bb99a',1.5)+p('M229 364Q293 342 355 361T492 362V377H229Z',g('water'),'#a3d7cd',1.5);
  if(n>=4)a+='<g class="wm-ripples" fill="none" stroke="#d6f2dd" stroke-width="1.5"><ellipse cx="318" cy="358" rx="22" ry="4"/><ellipse cx="390" cy="365" rx="31" ry="4"/></g>';
  a+='</g>';
  // Double-wall transparent chamber and collection trough.
  a+=p('M230 366V190Q230 88 360 80Q490 88 490 190V366Q360 398 230 366Z',g('glass'),'#d4e5d1',2.5)+p('M244 186Q244 120 294 104M243 204V290M477 197V322','none','#f4ffe9',4,'opacity=".35"')+p('M230 366Q360 400 490 366L496 378Q360 416 224 378Z',gold,'#725039',2.5);
  // Graduated reservoir, meniscus, porcelain base and a visible warm coil.
  a+='<g class="wm-reservoir" transform="translate(126 252)">'+p('M-35-63Q0-75 35-63V47Q0 65-35 47Z',g('glass'),'#c6ded1',2.5)+p('M-31-12Q0-20 31-12V44Q0 58-31 44Z',g('water'),'#d8eed4',1.2)+'<ellipse cy="-12" rx="31" ry="7" fill="#b9e9de" stroke="#d8eed4"/>'+p('M-35-63Q0-75 35-63L39-55Q0-43-39-55Z',gold,'#725039',2)+p('M-36 47Q0 62 36 47L40 57Q0 74-40 57Z',gold,'#725039',2)+p('M-23-42V27','none','#fff9df',3,'opacity=".55"')+'<g stroke="#e7dfb8" stroke-width="1.5">'+[-38,-21,-4,13,30].map(y=>'<path d="M14 '+y+'h12"/>').join('')+'</g>'+p('M-28 75q9-13 18 0t18 0t18 0','none',n>=2?'#f0c176':'#6e7e7b',5)+(n>=2?'<g class="wm-heat-shimmer" fill="none" stroke="#f6d99c" stroke-width="2" opacity=".5"><path d="M-17-21q-9-11 0-20M0-21q-9-11 0-20M17-21q-9-11 0-20"/></g>':'')+'<text y="99" text-anchor="middle" fill="#e4d5b0" font-size="9" letter-spacing="1">RESERVOIR</text></g>';
  // Pump motion starts only after the water connection is repaired.
  a+='<g transform="translate(181 357)"><g class="wm-pump '+(n>=1?'is-running':'')+'"><circle r="23" fill="'+gold+'" stroke="#6a4d36" stroke-width="2"/><circle r="16" fill="#294753" stroke="#dcc28e" stroke-width="2"/>'+[0,120,240].map(v=>'<path d="M0-5V-15" transform="rotate('+v+')" stroke="#d8bc80" stroke-width="4"/>').join('')+'<circle r="5" fill="'+g('copper')+'"/></g></g>';
  if(n>=1)a+='<path class="wm-water-flow" d="M126 314V361Q126 383 227 383M494 381H564Q587 381 587 357V232" fill="none" stroke="#bce9dd" stroke-width="3" stroke-dasharray="3 15"/>';
  // Finned condenser and cold plate: droplets appear only when cooling is ready.
  a+='<g class="wm-condenser '+(n>=3?'is-cooling':'')+'" transform="translate(566 174)">'+p('M-29-66H29V56H-29Z',g('enamel'),'#c9b982',2.5)+[-54,-37,-20,-3,14,31,48].map(y=>p('M-36 '+y+'H36','none',n>=3?'#b3dee0':'#9b9e8b',5)).join('')+p('M-14-74V-87H14V-74',gold,'#705139',2)+'<text y="82" text-anchor="middle" fill="#e4d5b0" font-size="9" letter-spacing="1">CONDENSER</text>'+(n>=3?'<g class="wm-condensation" fill="#b8e7e5" stroke="#eff7dd" stroke-width="1">'+[[-16,1],[7,20],[19,-26]].map(([x,y])=>'<path d="M'+x+' '+y+'q-9 12 0 13q9-1 0-13Z"/>').join('')+'</g>':'')+'</g>';
  const dial=(x,y,label,step)=>'<g transform="translate('+x+' '+y+')"><circle r="29" fill="'+gold+'" stroke="#6d5038" stroke-width="2.5"/><circle r="22" fill="#e8dfbd" stroke="#9b8258" stroke-width="1.5"/><path d="M-17 4A17 17 0 0 1 17 4" fill="none" stroke="#8aab9b" stroke-width="4"/>'+p('M-16 4h4M-12-7l3 3M0-13v4M12-7l-3 3M16 4h-4','none','#786b51',1)+'<g class="wm-needle" style="--wm-angle:'+(n>=step?'10deg':'-65deg')+'">'+p('M0 7V-15','none','#a16e50',2.5)+'<circle r="3" fill="'+gold+'"/></g><text y="45" text-anchor="middle" fill="#e4d5b0" font-size="9" letter-spacing="1">'+label+'</text></g>';
  a+=dial(153,132,'WARMTH',2)+dial(558,301,'COOLING',3);
  // Five independently marked brass valves; the pending repair remains visible.
  for(let i=0;i<5;i++){const done=i<n,repair=mishap&&i===n;a+='<g transform="translate('+(240+i*60)+' 409)" class="wm-control '+(done?'is-ready':'is-pending')+'" data-weather-control="'+(i+1)+'" data-control-state="'+(done?'ready':repair?'needs-repair':i===n?'current':'waiting')+'"><circle r="17" fill="'+gold+'" stroke="#785336" stroke-width="2"/><circle r="11" fill="'+(done?'#b9d7bc':'#294653')+'" stroke="#e1c992"/><text y="4" text-anchor="middle" fill="'+(done?'#365c53':'#f0dcad')+'" font-size="11">'+(done?'✓':repair?'↺':i+1)+'</text>'+(repair?'<circle r="23" fill="none" stroke="#ffe4b0" stroke-width="2" stroke-dasharray="4 4" data-weather-repair="'+(i+1)+'"/>':'')+'</g>'}
  if(mishap)a+='<g class="sl-mishap-art sl-mishap-weather wm-malfunction"><g class="wm-mischief-cloud" transform="translate(360 205)">'+p('M-45 17Q-70 5-52-15Q-42-26-28-18Q-20-44 4-30Q25-39 34-18Q65-15 52 13Q5 32-45 17Z','#d9c8e5','#f2dfc4',2)+p('M-24-1q5-5 10 0M14-1q5-5 10 0','none','#625d7d',2)+'<ellipse cy="11" rx="4" ry="5" fill="#82778f"/></g>'+[[310,257],[361,277],[414,248]].map(([x,y],i)=>'<g transform="translate('+x+' '+y+')"><g class="wm-teacup" style="--wm-cup-delay:'+i*.13+'s">'+p('M-12-7H12L8 10H-8ZM12-4Q29-6 24 4L10 7','#f0d6c2','#b590a6',2)+p('M-16 15H16','none','#eedbb5',2)+p('M-3-13q-5-5 0-10','none','#d6e7dc',1.5)+'</g></g>').join('')+'</g>';
  a+='</g>';
  return SCIENCE_LAB_ART.weather.replaceAll('__WM__',id).replace('class="sl-equipment sl-machine-weather wm-machine"','class="sl-equipment sl-machine-weather wm-machine wm-level-'+n+' wm-event-'+safe(cue)+'" data-weather-level="'+n+'" data-weather-cue="'+safe(cue)+'"').replace('aria-label="Weather Machine"','aria-label="Weather Machine: '+(mishap?'Imaginary teacup rain. Read the explanation and repair step '+(n+1):description(n))+'"').replace('<!-- WEATHER_LAYERS -->',a);
 }
 return{render,steps,labels,description,nextAction};
})();
