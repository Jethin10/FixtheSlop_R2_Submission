'use strict';
(() => {
  const frames=[...document.querySelectorAll('iframe[data-video-src]')];
  frames.forEach(frame=>frame.addEventListener('load',()=>{if(frame.getAttribute('src'))frame.dataset.videoReady='true';}));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const limited=Boolean(navigator.connection?.saveData);
  let pending=false;
  let ready=false;
  function visible(frame){
    const r=frame.getBoundingClientRect();
    return r.width>100&&r.height>80&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth&&getComputedStyle(frame).visibility!=='hidden';
  }
  function update(){
    pending=false;
    const candidates=frames.filter(frame=>visible(frame)&&!frame.closest('.button-3d'));
    candidates.sort((a,b)=>Math.abs(a.getBoundingClientRect().top)-Math.abs(b.getBoundingClientRect().top));
    const active=new Set(document.hidden||reduced.matches||limited?[]:candidates.slice(0,2));
    frames.forEach(frame=>{
      if(active.has(frame)&&!frame.getAttribute('src')){
        frame.loading='eager';
        frame.src=frame.dataset.videoSrc;frame.dataset.mediaActive='true';
      }else if(!active.has(frame)&&frame.getAttribute('src')){
        frame.removeAttribute('src');delete frame.dataset.mediaActive;delete frame.dataset.videoReady;
      }
    });
  }
  function schedule(){if(ready&&!pending){pending=true;requestAnimationFrame(update);}}
  // Native and transformed reference scrolling both trigger passive input events.
  const observer=new IntersectionObserver(schedule,{threshold:[0,.05,.5,1]});
  frames.forEach(frame=>observer.observe(frame));
  addEventListener('scroll',schedule,{passive:true});addEventListener('wheel',schedule,{passive:true});
  addEventListener('touchmove',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
  document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',schedule);
  // Give the reference's reveal sequence a chance to finish, without continuous polling.
  function start(){ready=true;update();setTimeout(schedule,700);}
  if(document.readyState==='complete')start();else addEventListener('load',start,{once:true});
})();
