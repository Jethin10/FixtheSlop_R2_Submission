const fs=require('node:fs');
const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.goto('http://localhost:4174/',{waitUntil:'domcontentloaded'});
 await page.waitForTimeout(700);
 await page.mouse.move(720,450);
 for(let i=0;i<20;i++){await page.mouse.wheel(0,120);await page.waitForTimeout(80);}
 await page.waitForTimeout(400);
 const report=await page.evaluate(()=>({players:document.querySelectorAll('iframe[src]').length,photos:[...document.querySelectorAll('picture[data-nexora-photo] img')].filter(e=>{const r=e.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.width>100}).map(e=>({src:e.currentSrc,loaded:e.complete&&e.naturalWidth>0}))}));
 assert.ok(report.players<=2);
 assert.ok(report.photos.length>0,'White-frame photographs are visible after scrolling');
 assert.ok(report.photos.every(e=>e.loaded),'Visible photographs are loaded');
 await page.screenshot({path:'output/optimized-white-gallery.png'});
 fs.writeFileSync('output/landing-gallery-results.json',JSON.stringify(report,null,2));
 console.log(report);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});

