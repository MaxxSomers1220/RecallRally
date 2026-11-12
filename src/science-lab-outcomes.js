// Original, bounded fantasy stage effects. No questions, grading or save state.
const ScienceLabOutcomes=(()=>{
 'use strict';
 const stations=['potion','circuit','creature','weather','observatory'];
 const path=(d,fill,stroke='#f3dfb2',width=2)=>'<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+width+'" stroke-linejoin="round" stroke-linecap="round"/>';
 const star=(x,y,r=12)=>'<g transform="translate('+x+' '+y+')">'+path('M0-'+r+' '+r*.28+'-'+r*.28+' '+r+' 0 '+r*.28+' '+r*.28+' 0 '+r+'-'+r*.28+' '+r*.28+'-'+r+' 0-'+r*.28+'-'+r*.28+'Z','#f6e0a2')+'</g>';
 const cloud=(x,y,scale,color)=>'<g transform="translate('+x+' '+y+') scale('+scale+')">'+path('M-100 32C-143 17-136-32-97-35C-94-78-40-90-14-55C17-91 74-70 76-34C121-43 152 0 116 30Q13 75-100 32Z',color,'#f5ead1',3)+path('M-98-15Q-82-46-54-34M-17-48Q14-65 39-42M71-12Q101-20 114 5','none','#fff6dc',3)+'</g>';
 function render(id,success){
  if(!stations.includes(id))return '';
  let art='';
  if(success){
   art='<g class="slo-shimmer">'+path('M245 78Q354 37 469 78L486 361Q357 416 230 360Z','#fff1ad22','#f6e6ba',2)+'</g><g class="slo-sparkles">'+[[216,155,11],[487,134,14],[256,345,9],[454,323,12],[357,65,14]].map(([x,y,r])=>star(x,y,r)).join('')+'</g>';
  }else if(id==='potion'){
   art='<g class="slo-burst">'+cloud(356,240,.95,'#c9e7cf')+'</g><g class="slo-foam" fill="#e6f0d4" stroke="#a4d0c0" stroke-width="2">'+[[257,294,29],[301,304,36],[354,310,39],[408,299,33],[451,287,25],[274,338,20],[429,336,23]].map(([x,y,r])=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'"/>').join('')+'</g><g class="slo-bubbles" fill="#c5e5d6" stroke="#fff4d4" stroke-width="2">'+[[261,145,11],[443,142,16],[298,113,9],[399,92,12]].map(([x,y,r])=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'"/>').join('')+'</g>';
  }else if(id==='circuit'){
   art='<g class="slo-burst">'+cloud(361,227,.65,'#bfc9d2')+'</g><g class="slo-smoke">'+cloud(386,160,.45,'#d5d9dc')+cloud(405,102,.24,'#e4e6dc')+'</g><g class="slo-pop-lines" stroke="#f5d596" stroke-width="4" fill="none"><path d="M264 191l-24-15M272 224h-31M462 185l22-18M474 218l26-2M351 115l-2-24"/></g>';
  }else if(id==='creature'){
   // An opaque chamber cloud and CSS hide the Moonwing on this ending.
   art='<g class="slo-burst slo-creature-cloud">'+cloud(360,259,1.04,'#d1c9e0')+'</g><g class="slo-sleepy-cloud">'+path('M325 246q10 9 20 0M378 246q10 9 20 0','none','#625b7d',3)+path('M350 272q10 7 20 0','none','#625b7d',3)+'</g><g fill="#ead8bc" stroke="#b8a3c8" stroke-width="1.5"><circle cx="285" cy="146" r="12"/><circle cx="428" cy="147" r="16"/><circle cx="464" cy="315" r="10"/></g>';
  }else if(id==='weather'){
   art='<g class="slo-burst">'+cloud(357,173,.7,'#a9bdcf')+'</g><g class="slo-wind" fill="none" stroke="#d8edf0" stroke-width="3"><path d="M205 238q109-57 221-11q35 13 48-10q8-20-13-22M220 269q128-40 263-4M260 299q70-21 140-3"/></g><g class="slo-flying-papers">'+[[244,224,-22],[435,274,27],[292,330,-14]].map(([x,y,a])=>'<g transform="translate('+x+' '+y+') rotate('+a+')">'+path('M-18-13H14L21-5V18H-18Z','#f2e6c7','#a99575',2)+path('M-10-4H9M-10 3H13M-10 10H7','none','#918c87',1.5)+'</g>').join('')+'</g><g class="slo-flying-hat" transform="translate(461 151)">'+path('M-25 7-16-26Q0-39 17-23L23 7Q45 16 31 22H-34Q-44 15-25 7Z','#9c7b9c','#f0d6b2',2)+path('M-18 0Q2 7 20 0','none','#f2cc8e',5)+'</g>';
  }else{
   art='<g class="slo-burst">'+cloud(360,225,.65,'#b7a7d0')+'</g><g class="slo-scrambled-stars"><path d="M244 117 428 92 304 204 472 185 352 81 254 184" fill="none" stroke="#c6d8e6" stroke-width="2" stroke-dasharray="5 8"/>'+[[244,117,13],[428,92,10],[304,204,11],[472,185,14],[352,81,12],[254,184,9]].map(([x,y,r])=>star(x,y,r)).join('')+'</g>';
  }
  return '<div class="sl-outcome-effects slo-'+id+'" aria-hidden="true"><svg viewBox="0 0 720 500" focusable="false">'+art+'</svg>'+(!success?'<span class="slo-poof">'+(id==='circuit'?'POP!':'POOF!')+'</span>':'<span class="slo-done">✦ It works!</span>')+'</div>';
 }
 return{render};
})();
