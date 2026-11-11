// Runs in the head: show the saved hero and finished home together after boot.
(()=>{
 const root=document.documentElement;let core=false,home=false;
 root.dataset.rallyStartup='starting';
 const timer=setTimeout(()=>{if(root.dataset.rallyStartup)root.dataset.rallyStartup='delayed'},20000);
 function ready(){if(!core||!home)return;clearTimeout(timer);delete root.dataset.rallyStartup;document.getElementById('startup-warning').hidden=true}
 window.RallyStartup={coreReady(){core=true;ready()},homeReady(){home=true;ready()}};
})();
