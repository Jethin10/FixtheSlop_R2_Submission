const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage();
 await page.route('https://player.kinescope.io/latest/iframe.player.js',route=>route.fulfill({contentType:'application/javascript',body:`
 window.onKinescopeIframeAPIReady({create:async(id)=>{
  const frame=document.getElementById(id);frame.src='about:blank';
  const listeners={};window.videoTestEvents=listeners;
  return {Events:{Playing:'playing',Waiting:'waiting',Error:'error'},on:(event,fn)=>listeners[event]=fn,play:async()=>{},pause:async()=>{}};
 }});`}));
 await page.goto('http://localhost:4174/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.videoTestEvents?.playing,null,{timeout:15000});
 await page.waitForLoadState('load');
 await page.waitForTimeout(800);
 const hero=page.locator('#landing-hero-video');
 await hero.evaluate(e=>e.dispatchEvent(new Event('load')));
 assert.equal(await hero.getAttribute('data-video-ready'),null,'Iframe load cannot expose a spinner');
 await page.evaluate(()=>window.videoTestEvents.playing());
 assert.equal(await hero.getAttribute('data-video-ready'),'true','Playback reveals the video');
 await page.evaluate(()=>window.videoTestEvents.waiting());
 assert.equal(await hero.getAttribute('data-video-ready'),null,'Buffering returns to the poster');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.reload({waitUntil:'domcontentloaded'});
 assert.equal(await page.locator('iframe[src]').count(),0);
 console.log('Hero stays hidden through load/buffering, reveals on playback, and respects reduced motion.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});

