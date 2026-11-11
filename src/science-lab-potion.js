// Original, composable Potion Mixer artwork. A pure visual view of repaired steps.
// No timers, grades, questions, profiles or storage are owned by this module.
const PotionMixerArt=(()=>{
 'use strict';
 const xs=[100,230,360,490,620],colors=['#74dbe9','#b99bf0','#ffc766','#75dfac','#f3a1cb'];
 const routes=['M100 190V217Q100 239 125 239H213Q238 239 260 280','M230 190V210Q230 230 253 230Q286 230 306 280','M360 190V280','M490 190V210Q490 230 467 230Q434 230 414 280','M620 190V217Q620 239 595 239H507Q482 239 460 280'];
 const vessels=[
  'M-12-56H12V-32C12-20 39-14 39 14C39 46 22 58 0 58C-22 58-39 46-39 14C-39-14-12-20-12-32Z',
  'M-17-55H17L20-34C35-28 28-11 18-4C35 10 43 27 32 45C23 62-25 62-35 42C-45 20-27 1-19-7C-36-24-31-35-19-39Z',
  'M-15-55H15V-32L39-10 31 42 0 60-31 42-39-10-15-32Z',
  'M-26-51Q0-62 26-51V-35C43-26 34-8 14 0C38 10 47 39 26 52Q0 66-26 52C-47 39-38 10-14 0C-34-8-43-26-26-35Z',
  'M-12-56H12V-40C43-34 47-14 41 7C38 19 27 21 26 32L30 46Q0 65-30 46L-26 32C-27 21-38 19-41 7C-47-14-43-34-12-40Z'
 ];
 const fillY=[421,398,375,352,329,307];
 const descriptions=['Dormant · five ingredients ready','Moonwater has entered the chamber','Violet essence joins the mixture','Sun-gold sparks awaken a bubbling swirl','Jade elixir powers the mixing drive','Roseglow completes the Moonbubble Potion'];
 const clamp=n=>Math.max(0,Math.min(5,Number.isInteger(n)?n:0));
 const safe=s=>String(s).replace(/[^a-zA-Z0-9_-]/g,'');
 const path=(d,fill,stroke='#493c37',w=2,extra='')=>'<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round" '+extra+'/>';
 function gear(x,y,r,id,small=false){
  let teeth='';for(let i=0;i<12;i++)teeth+='<path d="M-5 '+(-r-3)+'h10v10h-10Z" transform="rotate('+(i*30)+')"/>';
  return '<g transform="translate('+x+' '+y+')"><g class="pm-cog '+(small?'pm-cog-counter':'')+'" data-part="mixing-drive">'+
   '<g fill="url(#'+id+'-brass)" stroke="#64422e" stroke-width="1.5">'+teeth+'<circle r="'+r+'"/></g><circle r="'+(r-7)+'" fill="#243c43" stroke="#c79b57" stroke-width="2"/>'+[0,120,240].map(a=>'<path d="M0-7V-'+(r-9)+'" transform="rotate('+a+')" stroke="#d7ad68" stroke-width="5"/>').join('')+'<circle r="7" fill="url(#'+id+'-copper)" stroke="#edcd8e" stroke-width="2"/></g></g>';
 }
 function vessel(i,n,id,fresh=false){
  const x=xs[i],c=colors[i],powered=i<n,shape=vessels[i];
  const gold='url(#'+id+'-brass)',copper='url(#'+id+'-copper)';
  return '<g class="pm-dispenser '+(powered?'is-powered':'is-dormant')+(fresh?' is-pouring':'')+'" data-dispenser="'+(i+1)+'" data-vessel-shape="'+['pear','retort','faceted','hourglass','bell'][i]+'" transform="translate('+x+' 113)">'+
   '<defs><clipPath id="'+id+'-vessel-'+i+'">'+path(shape,'#fff','none',0)+'</clipPath><linearGradient id="'+id+'-ingredient-'+i+'" x2=".8" y2="1"><stop stop-color="#fff7ce"/><stop offset=".2" stop-color="'+c+'"/><stop offset="1" stop-color="'+['#276c91','#624d99','#bd6634','#2e866b','#a64d82'][i]+'"/></linearGradient></defs>'+
   '<path class="pm-vessel-aura" d="'+shape+'" fill="'+c+'" opacity="'+(powered?'.25':'.06')+'" filter="url(#'+id+'-halo)"/>'+
   path(shape,'url(#'+id+'-glass)','#9ac4c3',2.5)+
   '<g clip-path="url(#'+id+'-vessel-'+i+')"><path d="M-44 '+(powered?11:-13)+'Q-22 '+(powered?2:-21)+' 0 '+(powered?11:-13)+'T44 '+(powered?11:-13)+'V67H-44Z" fill="url(#'+id+'-ingredient-'+i+')" opacity="'+(powered?'.93':'.72')+'"/>'+path('M-44 '+(powered?11:-13)+'Q-22 '+(powered?2:-21)+' 0 '+(powered?11:-13)+'T44 '+(powered?11:-13),'none',c,2.5)+
   path('M-18-28Q-31-8-25 9M-26 21Q-20 40-8 44','none','#fff6d7',3,'opacity=".65"')+
   '<g fill="#e8fff3" opacity=".45"><circle cx="12" cy="29" r="3"/><circle cx="18" cy="12" r="1.7"/><circle cx="-6" cy="38" r="2"/></g></g>'+
   path(shape,'none','#dbebd7',1,'opacity=".7"')+
   (i===2?path('M-15-32 0-10 39-10M0-10 0 60M-39-10 0-10 31 42M0-10-31 42','none','#fff6db',1,'opacity=".42"'):'')+
   path('M-22-61Q0-66 22-61L19-48Q0-43-19-48Z',copper,'#603d2c',2)+
   path('M-20-59Q0-54 20-59M-17-49Q0-45 17-49','none','#f6d695',1.5)+
   '<path d="M-5-72 0-79 5-72 0-65Z" fill="'+(powered?c:'#796b53')+'" stroke="#f1cc84" stroke-width="1.4"/>'+
   '<text x="0" y="-51" text-anchor="middle" font-family="Georgia,serif" font-size="8" fill="#fff1cc">'+['I','II','III','IV','V'][i]+'</text>'+
   path('M-22 2q9 15 22 5q13-10 22 5M-16 7q-2 12 7 14M12 6q6-10 12-4','none','#f4dfaa',1.1,'opacity=".7"')+
   '<g transform="translate(0 73)"><g class="pm-valve-wheel"><circle r="12" fill="'+copper+'" stroke="#e2ba79" stroke-width="2"/>'+path('M-8 0H8M0-8V8','none',powered?c:'#785d43',3)+'<circle r="3" fill="#f4d99b"/></g></g></g>';
 }
 function render(steps,context='experiment',cue='',mishap=false){
  const n=clamp(steps),id='pm-'+safe(context),g=k=>'url(#'+id+'-'+k+')',gold=g('brass');
  const last=n-1,flow=cue==='activate'||cue==='repair'||cue==='finale';
  const classes=['pm-machine','sl-equipment','sl-machine-potion','pm-level-'+n,'pm-context-'+safe(context),cue?'pm-event-'+safe(cue):'',mishap?'pm-needs-repair':''].filter(Boolean).join(' ');
  let art='<defs><clipPath id="'+id+'-bowl">'+path('M219 297Q221 411 307 427Q360 444 413 427Q499 411 501 297Z','#fff','none',0)+'</clipPath><linearGradient id="'+id+'-mixture" x2=".8" y2="1">'+[0,.3,.65,1].map((v,i)=>'<stop offset="'+v+'" stop-color="'+(n?colors[Math.min(n-1,Math.max(0,n-1-i))]:'#496d73')+'"/>').join('')+'</linearGradient></defs>';
  // Light travels through the existing routes; only the newly repaired valve pours.
  art+='<g class="pm-flows" fill="none">'+routes.map((d,i)=>'<path d="'+d+'" stroke="'+colors[i]+'" stroke-width="'+(i<n?'5':'2')+'" opacity="'+(i<n?'.68':'.08')+'"/>'+(flow&&i===last?'<path class="pm-transfer" data-flow="'+(i+1)+'" d="'+d+'" stroke="#fff5cf" stroke-width="3" pathLength="100"/>':'')).join('')+'</g>';
  art+=xs.map((x,i)=>vessel(i,n,id,flow&&i===last)).join('');
  // Decorative flywheels are behind the central chamber and high above the heroes.
  art+='<g class="pm-drive '+(n>=4?'is-running':'')+'">'+gear(199,294,26,id)+gear(530,294,22,id,true)+
   path('M199 294Q214 247 261 267M530 294Q518 247 462 267','none',gold,5)+'</g>';
  art+='<g class="pm-gauge" transform="translate(136 276)"><g class="pm-needle" style="--needle-angle:'+(-65+n*24)+'deg;--needle-before:'+(-65+Math.max(0,n-1)*24)+'deg">'+path('M-3 5 0-19 3 5Z','#a15c3c','#603b30',1)+'<circle r="4" fill="'+gold+'"/></g></g>';
  art+='<g clip-path="url(#'+id+'-bowl)">'+path('M210 293H510V448H210Z',g('glass'),'none',0)+
   '<g class="pm-liquid-volume" style="--pm-fill:'+fillY[n]+'px;--pm-before:'+fillY[Math.max(0,n-1)]+'px;transform:translateY('+fillY[n]+'px)">'+path('M196 0H524V160H196Z',g('mixture'),'none',0)+
   '<ellipse cx="360" cy="0" rx="146" ry="13" fill="'+(n?colors[n-1]:'#50727a')+'" stroke="'+(n?'#e6f8d0':'#709193')+'" stroke-width="2"/>'+
   '<path class="pm-surface" d="M247 3Q302-12 360 1T474 0M281 5Q340-2 399 6" fill="none" stroke="#ffffd8" stroke-opacity=".5" stroke-width="2"/>'+
   (n>=3?'<g class="pm-swirl" fill="none" stroke-linecap="round"><path d="M267 20C317 1 437 13 434 39C431 66 293 61 293 35C293 16 411 22 404 40C396 59 324 45 331 35" stroke="#f7edbe" stroke-width="4" opacity=".5"/><path d="M300 23Q358 65 421 27" stroke="'+colors[Math.max(0,n-2)]+'" stroke-width="8" opacity=".65"/></g>':'')+'</g>'+
   (n>=3?Array.from({length:9},(_,i)=>'<circle class="pm-bubble" cx="'+(272+i*31%176)+'" cy="'+(398-i*13%65)+'" r="'+(3+i%3*2)+'" fill="#eafbd5" fill-opacity=".2" stroke="#fff6d4" stroke-opacity=".75" stroke-width="1.4" style="--bubble-delay:-'+i*.37+'s"/>').join(''):'')+
   (flow&&n?'<path class="pm-falling-ingredient" d="M'+[260,306,360,414,460][last]+' 283Q'+(360+(last-2)*28)+' 307 360 '+(fillY[n]+4)+'" fill="none" stroke="'+colors[last]+'" stroke-width="6" stroke-linecap="round"/>':'')+
   path('M246 324Q252 388 292 403M258 322 262 347M468 330Q468 387 431 411','none','#fffde2',4,'opacity=".27"')+'</g>';
  // Copper ribs and handles frame a genuinely transparent, refracting glass belly.
  art+=path('M219 297Q221 411 307 427Q360 444 413 427Q499 411 501 297Z','none',gold,9)+
   path('M228 304Q232 403 310 419M492 304Q488 403 410 419','none','#fff2bd',1.5)+
   path('M218 318Q176 296 176 334Q178 362 233 361M502 318Q544 296 544 334Q542 362 487 361','none',g('copper'),12)+
   path('M215 319Q186 305 184 332Q188 352 228 353M505 319Q534 305 536 332Q532 352 492 353','none','#f3c98c',2)+
   path('M303 426Q289 444 301 451H320L332 432M417 426Q431 444 419 451H400L388 432',g('copper'),'#633d2e',2)+
   '<ellipse cx="360" cy="293" rx="147" ry="22" fill="'+gold+'" stroke="#633e2e" stroke-width="3"/><ellipse cx="360" cy="290" rx="134" ry="13" fill="#1a343c" stroke="#f0ce8a" stroke-width="2"/>'+
   '<path d="M215 293Q360 326 505 293" fill="none" stroke="#ffe4a3" stroke-width="2"/>'+
   path('M324 389Q360 378 396 389L390 407Q360 418 330 407Z',g('enamel'),gold,2)+
   path('M341 398q7-14 19-3q12-11 19 3M353 404l7-13 7 13','none','#e5c68d',1.6);
  // Same scene graph for all states: labels describe progress independently of color.
  art+='<g class="pm-temperature">'+path('M584 299V'+(296-n*8),'none',n>=4?'#f3cf8c':'#a5cfbb',5)+'<circle cx="584" cy="311" r="8" fill="'+(n>=4?'#f2c16d':'#89c9b5')+'"/></g>';
  if(n>=3)art+='<g class="pm-steam" fill="none" stroke="#f4e9c3" stroke-width="3" stroke-linecap="round" opacity=".45">'+[315,360,405].map((x,i)=>'<path class="pm-steam-thread" d="M'+x+' 279q-14-14 1-27t0-26" style="animation-delay:-'+i*.7+'s"/>').join('')+'</g>';
  if(n>=4)art+='<g class="pm-energy" fill="none" stroke="#c9f5d7" stroke-width="2"><path d="M256 271Q224 251 201 264M464 271Q496 251 519 264"/><circle cx="200" cy="264" r="5"/><circle cx="520" cy="264" r="5"/></g>';
  if(n===5)art+='<g class="pm-finale" data-potion-celebration="true"><g class="pm-finale-plume" fill="none" stroke-linecap="round"><path d="M344 286C304 267 399 257 366 239C328 218 343 204 362 198" stroke="#fff2b0" stroke-width="4"/><path d="M372 287C417 271 326 251 350 233C376 218 385 212 376 202" stroke="#b9ebd5" stroke-width="5"/><path d="M338 275Q360 258 385 273M340 245Q362 228 379 242" stroke="#eed5f6" stroke-width="2"/><circle cx="350" cy="210" r="8" stroke="#fff5d0" stroke-width="2"/><circle cx="380" cy="225" r="5" stroke="#fff5d0" stroke-width="1.5"/></g><ellipse class="pm-crown-glow" cx="360" cy="262" rx="110" ry="65" fill="#d9f0b5" opacity=".18" filter="url(#'+id+'-halo)"/>'+Array.from({length:13},(_,i)=>{const a=(i/12)*Math.PI,x=360+Math.cos(a)*107,y=278-Math.sin(a)*94;return '<g transform="translate('+x.toFixed(1)+' '+y.toFixed(1)+')"><path class="pm-celebration-spark" d="M0-6 2-2 6 0 2 2 0 6-2 2-6 0-2-2Z" fill="'+colors[i%5]+'" stroke="#fff4d2" stroke-width=".6" style="--spark-delay:'+i*.04+'s;--spark-x:'+((x-360)*.25).toFixed(1)+'px;--spark-y:-'+(15+i%3*8)+'px"/></g>'}).join('')+'<path class="pm-celebration-ring" d="M287 267Q360 236 433 267Q360 297 287 267Z" fill="none" stroke="#e5f8cc" stroke-width="2"/></g>';
  art+='<g class="sl-mishap-art sl-mishap-potion pm-malfunction" aria-hidden="true">'+
   '<g class="pm-oops-bubble"><ellipse cx="360" cy="267" rx="50" ry="29" fill="#d7edd0" fill-opacity=".84" stroke="#fff0c4" stroke-width="2"/>'+path('M360 267Q339 251 324 267Q334 283 360 274Q386 283 396 267Q381 251 360 267Z','#4e4a60','#e4cdaf',1.5)+'<circle cx="340" cy="259" r="3" fill="#fff7d3"/></g>'+path('M270 276q-26-20-33 0q-4 16 18 19M450 274q26-20 33 0q4 16-18 19','none','#dcc5ec',5)+'</g>';
  const desc=mishap?'A moustache bubble! Read the explanation, then repair this step.':descriptions[n];
  return SCIENCE_LAB_ART.potion.replaceAll('__PM__',id).replace('class="sl-equipment sl-machine-potion pm-machine"','class="'+classes+'" data-potion-level="'+n+'" data-potion-cue="'+safe(cue)+'"').replace('aria-label="Potion Mixer"','aria-label="Potion Mixer: '+desc+'"').replace('<!-- POTION_LAYERS -->',art);
 }
 return {render,description:n=>descriptions[clamp(n)]};
})();
