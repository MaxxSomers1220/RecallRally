// Viewport, modal focus and pointer ownership only. No physics, grading or saved data.
const RallyMobile=(()=>{
 let fitFrame=0,overlay=null,opener=null,mounts=0,cleanups=0;const pointers=new Map(),background=new Map();let oldOverflow='';
 const heldButton=t=>t?.closest?.('#lib-left,#lib-right,#lib-duck');
 function release(){const buttons=new Set(pointers.values());pointers.clear();for(const b of buttons){b.dispatchEvent(new PointerEvent('pointercancel',{bubbles:true,pointerId:-1,pointerType:'touch'}));b.dataset.held='false';}}
 function restore(){for(const [e,inert]of background)e.inert=inert;background.clear();document.body.style.overflow=oldOverflow;}
 function syncOverlay(){const next=document.getElementById('lib-overlay');if(next===overlay)return;
  if(overlay){release();restore();cleanups++;if(opener?.isConnected)opener.focus({preventScroll:true});}
  overlay=next;if(!overlay)return;mounts++;oldOverflow=document.body.style.overflow;
  for(const e of document.body.children)if(e!==overlay&&!['SCRIPT','STYLE'].includes(e.tagName)){background.set(e,e.inert);e.inert=true;}document.body.style.overflow='hidden';opener=opener?.isConnected?opener:document.getElementById('lib-launch');
 }
 function fit(){fitFrame=0;const v=window.visualViewport;if(v&&v.scale>1.01)return;const h=v?.height||innerHeight,top=v?.offsetTop||0,root=document.documentElement;root.style.setProperty('--rally-vh',h+'px');root.style.setProperty('--rally-vtop',top+'px');root.toggleAttribute('data-rally-short',h<520);root.toggleAttribute('data-rally-tiny',h<300);
  const active=document.activeElement;if(active?.matches('input,textarea,select')&&active.closest('dialog[open]'))active.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
 }
 function resized(){release();if(!fitFrame)fitFrame=requestAnimationFrame(fit);}
 function pointer(e){const b=heldButton(e.target);if(!b||!overlay?.contains(b))return;if(e.type==='pointerdown'){pointers.set(e.pointerId,b);return}pointers.delete(e.pointerId);if([...pointers.values()].includes(b))e.stopImmediatePropagation();}
 function key(e){if(!overlay)return;if(e.key==='Escape'){release();restore();return;}if(e.key!=='Tab')return;const all=[...overlay.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])')].filter(x=>x.getClientRects().length&&!x.closest('[hidden]'));if(!all.length)return;const first=all[0],last=all.at(-1),active=document.activeElement;if(!all.includes(active)||(!e.shiftKey&&active===last)||(e.shiftKey&&active===first)){e.preventDefault();(e.shiftKey?last:first).focus();}}
 function init(){fit();new MutationObserver(syncOverlay).observe(document.body,{childList:true});document.addEventListener('click',e=>{if(e.target.closest?.('#lib-launch'))opener=e.target.closest('#lib-launch');if(e.target.closest?.('#lib-close')){release();restore();}},{capture:true});for(const type of ['pointerdown','pointerup','pointercancel','lostpointercapture'])document.addEventListener(type,pointer,true);document.addEventListener('keydown',key,true);window.addEventListener('resize',resized);window.visualViewport?.addEventListener('resize',resized);window.visualViewport?.addEventListener('scroll',()=>{if(!fitFrame)fitFrame=requestAnimationFrame(fit)});window.addEventListener('blur',release);document.addEventListener('visibilitychange',()=>{if(document.hidden)release();else resized()});syncOverlay();}
 if(typeof document!=='undefined'&&typeof requestAnimationFrame==='function'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();}
 return{inspect:()=>({active:!!overlay,pointers:pointers.size,mounts,cleanups}),release};
})();
