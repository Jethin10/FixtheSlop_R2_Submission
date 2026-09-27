'use strict';
// Native responsive navigation avoids the reference router's desktop-only modal behavior.
const responsiveMenu=document.querySelector('.modal--menu');
const responsiveToggle=document.querySelector('header a[href="#menu"]');
let nativeMenuOpen=false;
function closeNativeMenu(){
  if(!nativeMenuOpen)return;
  nativeMenuOpen=false;document.body.classList.remove('nexora-native-menu');responsiveMenu.classList.add('is-hidden');
  responsiveMenu.removeAttribute('aria-modal');responsiveToggle.setAttribute('aria-expanded','false');responsiveToggle.focus();
}
if(responsiveMenu&&responsiveToggle){
  const close=document.createElement('button');close.type='button';close.className='nexora-menu-close';close.textContent='Close menu';close.addEventListener('click',closeNativeMenu);responsiveMenu.append(close);
  responsiveToggle.setAttribute('aria-expanded','false');
  window.addEventListener('click',event=>{
    const link=event.target.closest('a[href]');if(!link)return;
    if(innerWidth<=1023&&link===responsiveToggle){
      event.preventDefault();event.stopImmediatePropagation();
      if(nativeMenuOpen){closeNativeMenu();return;}
      nativeMenuOpen=true;responsiveMenu.classList.remove('is-hidden');document.body.classList.add('nexora-native-menu');
      for(let ancestor=responsiveMenu;ancestor&&ancestor!==document.body;ancestor=ancestor.parentElement){if(ancestor.getAttribute('aria-hidden')==='true')ancestor.removeAttribute('aria-hidden');}
      responsiveMenu.setAttribute('role','dialog');responsiveMenu.setAttribute('aria-modal','true');responsiveMenu.setAttribute('aria-label','Navigation');responsiveToggle.setAttribute('aria-expanded','true');close.focus();
    }else if(nativeMenuOpen&&link.closest('nav.menu')&&link.hash&&new URL(link.href).origin===location.origin){
      const target=document.getElementById(link.hash.slice(1));if(target){event.preventDefault();event.stopImmediatePropagation();closeNativeMenu();target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
    }
  },true);
  document.addEventListener('keydown',event=>{
    if(nativeMenuOpen&&event.key==='Escape'){closeNativeMenu();event.preventDefault();}
    if(nativeMenuOpen&&event.key==='Tab'){
      const items=[...responsiveMenu.querySelectorAll('a[href],button')].filter(e=>e.getClientRects().length);
      const first=items[0],last=items[items.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
}
// App pages use their own scripts; leave the reference's transition router on its home anchors only.
window.addEventListener('click',event=>{
  const link=event.target.closest('a[href]');if(!link)return;
  const url=new URL(link.href,location.href);
  if(url.origin===location.origin&&/(?:admin|blog|contact|tools)\.html$/.test(url.pathname)&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey){event.preventDefault();event.stopImmediatePropagation();location.assign(url.href);}
},true);
const fictionalNames=[['Dubai','Aster Bay'],['Sheikh Zayed Road','Cedar Avenue'],['Hartland II','Northbank'],['Siniya Island','Juniper Island'],['Palm Jumeirah','Crescent Point'],['Burj Al Arab','Beacon Tower'],['Ain Dubai','Aster Wheel'],['The Palm','The Crescent'],['Meydan Racecourse','Meadow Park'],['Ras Al Khor','Willow Marsh']];
const textNodes=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
while(textNodes.nextNode()){const node=textNodes.currentNode;if(!['SCRIPT','STYLE'].includes(node.parentElement.tagName)){let text=node.nodeValue;for(const [from,to] of fictionalNames)text=text.split(from).join(to);node.nodeValue=text;}}
// The reference's original interaction bundles initialize the page before this bridge.
document.querySelectorAll('svg.icon-logo-text,svg.icon-logo-privy,svg.icon-logo').forEach(logo=>{
  const mark=document.createElement('span');mark.className='nexora-wordmark';mark.innerHTML='NEXORA<small>WORKSPACE</small>';logo.replaceWith(mark);
});
document.querySelectorAll('a').forEach(link=>{
  if(link.textContent.includes('3D Map'))link.textContent='Dashboard';
  if(link.href.includes('videinfra.com')){link.href='admin.html';link.textContent='Nexora workspace';}
});
const portal=document.createElement('nav');portal.className='nexora-portal';portal.setAttribute('aria-label','Nexora applications');
portal.innerHTML='<a href="admin.html">Dashboard</a><a href="blog.html">Journal</a><a href="contact.html">Community</a><a href="tools.html">Tools</a>';
const form=document.querySelector('.register__form');
if(form){form.append(portal);const note=document.createElement('p');note.className='nexora-demo-note';note.textContent='No account needed. Explore sample orders, read the journal, share a question or try a tool.';form.append(note);form.addEventListener('submit',event=>event.preventDefault());}
const menu=document.querySelector('.menu__nav')||document.querySelector('nav.menu');
if(menu)menu.append(portal.cloneNode(true));
document.querySelectorAll('a[href="admin.html"].button-3d .button-3d__bottom').forEach(el=>el.innerHTML='Open<br>dashboard');
document.querySelectorAll('a[href="admin.html"].button-3d .button-3d__top').forEach(el=>el.textContent='NX');
document.querySelectorAll('a[href="admin.html"]').forEach(el=>{if(el.classList.contains('button-3d'))el.setAttribute('aria-label','Open Nexora dashboard');});
const cookie=document.querySelector('.cookie-consent__description');if(cookie)cookie.innerHTML='Local demo preferences. <a href="contact.html">Details</a>';
if(matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.remove('has-scroll-smooth');document.querySelectorAll('[data-reveal]').forEach(el=>{el.style.opacity='1';el.style.visibility='visible';});}
