'use strict';
document.getElementById('counter').textContent=Core.money(SITE.summary.cents);
const canvas=document.getElementById('bg3d'),ctx=canvas.getContext('2d');
if(ctx){
  let angle=.4;
  const points=Array.from({length:48},(_,i)=>{const y=1-2*i/47,r=Math.sqrt(1-y*y),theta=i*2.399963;return [Math.cos(theta)*r,y,Math.sin(theta)*r];});
  function draw(){
    const rect=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=rect.width*dpr;canvas.height=rect.height*dpr;ctx.scale(dpr,dpr);ctx.clearRect(0,0,rect.width,rect.height);
    const css=getComputedStyle(document.documentElement),color=css.getPropertyValue('--brand').trim(),muted=css.getPropertyValue('--text-muted').trim();
    const size=Math.min(rect.width,rect.height)*.32;
    const projected=points.map(([x,y,z])=>{const rx=x*Math.cos(angle)+z*Math.sin(angle),rz=z*Math.cos(angle)-x*Math.sin(angle),perspective=3/(3-rz*.5);return {x:rect.width/2+rx*size*perspective,y:rect.height/2+y*size*perspective,z:rz};});
    for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){const dist=Math.hypot(...points[i].map((n,k)=>n-points[j][k]));if(dist<.64){ctx.globalAlpha=.18;ctx.strokeStyle=muted;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(projected[i].x,projected[i].y);ctx.lineTo(projected[j].x,projected[j].y);ctx.stroke();}}
    projected.sort((a,b)=>a.z-b.z).forEach(p=>{ctx.globalAlpha=.45+(p.z+1)*.25;ctx.fillStyle=color;ctx.beginPath();ctx.arc(p.x,p.y,3+(p.z+1),0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;
  }
  new ResizeObserver(draw).observe(canvas);
  new MutationObserver(draw).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');let frame;
  document.getElementById('orb-turn').addEventListener('click',()=>{
    cancelAnimationFrame(frame);const start=performance.now(),initial=angle;
    if(reduced.matches){angle+=Math.PI/3;draw();return;}
    function animate(now){const t=Math.min((now-start)/200,1);angle=initial+Math.PI/3*(1-(1-t)**3);draw();if(t<1)frame=requestAnimationFrame(animate);}frame=requestAnimationFrame(animate);
  });
  draw();
}
