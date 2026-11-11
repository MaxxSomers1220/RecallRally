// Presentation only: reuse existing controls and read the save-owned Continue state.
const HomeHub=(()=>{
 let refreshes=0,initialized=false;const byId=id=>document.getElementById(id);
 const data=(el,key,value)=>{value=String(value);if(el.dataset[key]!==value)el.dataset[key]=value};
 const text=(id,value)=>{const el=byId(id);if(el.textContent!==value)el.textContent=value};
 function refresh(){
  const home=byId('home-view');if(!home)return;refreshes++;
  const active=!home.hidden&&!home.classList.contains('home-choice-open');
  data(document.body,'homeHub',active);data(document.body,'hubAwake',active&&!document.hidden&&!document.querySelector('dialog[open],#lib-overlay'));
  // Hidden labels can wait until home returns. Avoid waking the shared hero observer.
  if(!active)return;
  const resume=!byId('quest-home-continue').hidden,hub=home.querySelector('.home-hub');data(hub,'resume',resume);
  const total=typeof LANDS==='undefined'?10:LANDS.length,earned=typeof questProgress==='number'?questProgress:0,progress=byId('hub-seals');
  if(progress.hidden!==!resume)progress.hidden=!resume;if(progress.max!==total)progress.max=total;if(progress.value!==earned)progress.value=earned;
  const label=earned+' of '+total+' adventure seals earned';if(progress.getAttribute('aria-label')!==label)progress.setAttribute('aria-label',label);
  text('hub-next-step',resume?(earned===total?'Rigby is home. Revisit a guardian and keep learning.':'Next chapter: '+LANDS[earned].land+'.'):'Ten magical worlds. One friend to bring home.');
  text('hub-chapter-label',resume?(earned===total?'YOUR RESCUE IS COMPLETE':'YOUR ADVENTURE CONTINUES'):'YOUR FIRST CHAPTER');
 }
 function init(){if(initialized||!byId('home-view'))return;initialized=true;
  const home=byId('home-view'),welcome=home.querySelector('.home-welcome'),hero=byId('hero-name-form'),quest=byId('quest-home-card'),hub=document.createElement('section');hub.className='home-hub';hub.setAttribute('aria-label','Your storybook adventure');hub.style.setProperty('--hub-hall','url("'+HOME_HUB_ART.hall+'")');home.insertBefore(hub,welcome);hub.append(welcome,quest,hero);
  const kicker=document.createElement('span');kicker.id='hub-chapter-label';kicker.className='hub-chapter-label';quest.prepend(kicker);
  const note=document.createElement('p');note.id='hub-next-step';quest.insertBefore(note,quest.querySelector('.quest-save-actions'));
  const progress=document.createElement('progress');progress.id='hub-seals';progress.hidden=true;quest.insertBefore(progress,note);
  quest.querySelector('details').classList.add('hub-backup');
  const browse=document.createElement('a');browse.className='hub-games-link';browse.href='#home-games-title';browse.textContent='Explore five games ↓';byId('home-games-title').tabIndex=-1;browse.addEventListener('click',e=>{e.preventDefault();byId('home-games-title').focus({preventScroll:true});byId('home-games-title').scrollIntoView({block:'start',behavior:'instant'})});quest.querySelector('.quest-save-actions').append(browse);
  const descriptions={quick:'Buzz in, then recall your answer.',written:'Four choices. Learn why an answer fits.',adventure:'Win seals across ten magical worlds.',library:'Answer questions. Dodge flying books.',science:'Five experiments with Professor Fizzwick.'};
  for(const [key,id]of Object.entries({quick:'mode-quick',written:'mode-written',adventure:'mode-adventure',library:'lib-launch',science:'open-science-lab'})){
   const button=byId(id),art=document.createElement('span'),img=document.createElement('img');art.className='home-choice-art';art.setAttribute('aria-hidden','true');img.loading='lazy';img.src=HOME_HUB_ART[key];img.alt='';img.width=480;img.height=260;img.decoding='async';art.append(img);button.querySelector('.home-choice-icon').replaceWith(art);button.querySelector('small').textContent=descriptions[key];
  }
  for(const id of ['mode-quick','mode-written'])byId(id).addEventListener('click',()=>{const panel=byId('setup-panel');panel.tabIndex=-1;panel.focus({preventScroll:true});panel.scrollIntoView({block:'start',behavior:'instant'})});
  const observer=new MutationObserver(refresh);observer.observe(home,{attributes:true,attributeFilter:['hidden','class']});observer.observe(byId('quest-home-continue'),{attributes:true,attributeFilter:['hidden']});observer.observe(byId('quest-home-summary'),{childList:true,characterData:true,subtree:true});observer.observe(byId('home-hero'),{childList:true});observer.observe(document.body,{childList:true});for(const dialog of document.querySelectorAll('dialog'))observer.observe(dialog,{attributes:true,attributeFilter:['open']});
  document.addEventListener('visibilitychange',refresh);refresh();window.RallyStartup?.homeReady();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 return{refresh,inspect:()=>({initialized,refreshes,active:document.body.dataset.homeHub==='true',awake:document.body.dataset.hubAwake==='true',observers:initialized?1:0})};
})();
