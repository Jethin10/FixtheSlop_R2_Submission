'use strict';
(() => {
  const frames=[...document.querySelectorAll('iframe[data-video-src]')];
  const intro=frames[0]?.closest('section');
  const hero=frames.find(frame=>frame.closest('section')===intro&&!frame.closest('.button-3d')&&getComputedStyle(frame.parentElement).display!=='none')||frames[0];
  // The hero needs a playback event, not the iframe's document-load event.
  frames.filter(frame=>frame!==hero).forEach(frame=>frame.addEventListener('load',()=>{if(frame.getAttribute('src'))frame.dataset.videoReady='true';}));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const limited=Boolean(navigator.connection?.saveData);
  let pending=false;
  let ready=false;
  let heroPlayer;
  let heroWanted=false;
  let heroRequested=false;
  function loadHero(){
    if(heroRequested||!hero||reduced.matches||limited)return;
    heroRequested=true;
    hero.id='landing-hero-video';hero.loading='eager';
    window.onKinescopeIframeAPIReady=factory=>{
      const url=new URL(hero.dataset.videoSrc);
      factory.create(hero.id,{
        url:'https://kinescope.io/'+url.pathname.split('/').pop(),
        behavior:{preload:'auto',autoPlay:true,muted:true,loop:true,autoPause:false,playsInline:true,localStorage:false},
        ui:{controls:false,mainPlayButton:false}
      }).then(player=>{
        heroPlayer=player;
        player.on(player.Events.Playing,()=>{if(heroWanted)hero.dataset.videoReady='true';});
        player.on(player.Events.Waiting,()=>{delete hero.dataset.videoReady;});
        player.on(player.Events.Error,()=>{delete hero.dataset.videoReady;});
        if(!heroWanted)player.pause().catch(()=>{});
      }).catch(()=>{delete hero.dataset.videoReady;});
    };
    const script=document.createElement('script');
    script.src='https://player.kinescope.io/latest/iframe.player.js';script.async=true;
    document.head.append(script);
  }
  function visible(frame){
    const r=frame.getBoundingClientRect();
    return r.width>100&&r.height>80&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth&&getComputedStyle(frame).visibility!=='hidden';
  }
  function update(){
    pending=false;
    const allowed=!document.hidden&&!reduced.matches&&!limited;
    const nextHeroWanted=allowed&&hero&&visible(hero);
    if(nextHeroWanted)loadHero();
    if(Boolean(nextHeroWanted)!==heroWanted){
      heroWanted=Boolean(nextHeroWanted);
      if(!heroWanted)delete hero?.dataset.videoReady;
      if(heroPlayer)(heroWanted?heroPlayer.play():heroPlayer.pause()).catch(()=>{});
    }
    const candidates=frames.filter(frame=>frame!==hero&&visible(frame)&&!frame.closest('.button-3d'));
    candidates.sort((a,b)=>Math.abs(a.getBoundingClientRect().top)-Math.abs(b.getBoundingClientRect().top));
    const active=new Set(allowed?candidates.slice(0,heroRequested?1:2):[]);
    frames.filter(frame=>frame!==hero).forEach(frame=>{
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
  function start(){ready=true;loadHero();update();setTimeout(schedule,700);}
  addEventListener('load',schedule,{once:true});
  // This deferred script runs after parsing. Do not wait for below-fold images.
  start();
})();
