'use strict';
const initialThreads=[{id:'welcome',name:'Rahul',text:'Just discovered Nexora. What are you using it for?',t:1704067200000},{id:'question',name:'Priya',text:'How do you make everyday tools easier for your team to use?',t:1704167200000},{id:'guidelines',name:'Nexora Team',text:'Community guidelines: be kind, stay curious, and share useful ideas. HTML is displayed as plain text.',t:1704267200000}];
let threads=Core.read('threads',initialThreads);
if(!Array.isArray(threads))threads=initialThreads;
threads=threads.filter(t=>t&&typeof t.name==='string'&&typeof t.text==='string'&&Number.isFinite(t.t));
function renderThreads(){
  const target=document.getElementById('threads');target.replaceChildren();
  [...threads].sort((a,b)=>b.t-a.t).forEach(thread=>{
    const card=document.createElement('article');card.className='thread';
    const header=document.createElement('div');header.className='who';const avatar=document.createElement('span');avatar.className='avatar';avatar.setAttribute('aria-hidden','true');avatar.textContent=thread.name.slice(0,1).toUpperCase();
    const meta=document.createElement('div'),name=document.createElement('strong'),time=document.createElement('time');name.textContent=thread.name;time.className='t';time.dateTime=new Date(thread.t).toISOString();time.textContent=Core.date(thread.t);meta.append(name,time);header.append(avatar,meta);
    const text=document.createElement('p');text.textContent=thread.text;card.append(header,text);target.append(card);
  });
}
renderThreads();
document.getElementById('forum-form').addEventListener('submit',e=>{
  e.preventDefault();const name=document.getElementById('fname').value.trim(),text=document.getElementById('fpost').value.trim(),result=document.getElementById('forum-result');
  if(name.length<2||text.length<3){result.textContent='Enter a name and a message of at least 3 characters.';return;}
  if(name.length>80||text.length>2000){result.textContent='Your name or message is too long.';return;}
  if(threads.length>=500){result.textContent='This demo has reached its 500-post limit.';return;}
  const next=[...threads,{id:crypto.randomUUID(),name,text,t:Date.now()}];
  if(!Core.save('threads',next)){result.textContent='Your browser could not save the post. Your draft is still here.';return;}
  threads=next;renderThreads();document.getElementById('fpost').value='';result.textContent='Posted and saved on this device.';
});
const contactDialog=document.getElementById('cm'),contactForm=document.getElementById('cform');
function openContact(){contactDialog.showModal();}
document.getElementById('contact-open').addEventListener('click',openContact);
document.getElementById('contact-close').addEventListener('click',()=>contactDialog.close());
const selectedTopic=new URLSearchParams(location.search).get('topic');
if(['Sales','Support','Partnerships'].includes(selectedTopic)){document.getElementById('topic').value=selectedTopic;openContact();}
contactForm.addEventListener('reset',()=>{document.getElementById('err').textContent='';document.getElementById('contact-result').textContent='';document.getElementById('download-message').hidden=true;contactForm.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));});
let savedMessage;
contactForm.addEventListener('submit',e=>{
  e.preventDefault();const errors=[];contactForm.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));
  const val=id=>document.getElementById(id).value.trim();
  const fail=(id,msg)=>{const field=document.getElementById(id);field.setAttribute('aria-invalid','true');field.setAttribute('aria-describedby','err');errors.push({field,msg});};
  if(val('n').length<2)fail('n','Enter your name, at least 2 characters.');
  if(!Core.email(val('e')))fail('e','Enter a valid email address.');
  if(val('ph')&&!/^[+\d()\s.-]{7,30}$/.test(val('ph')))fail('ph','Enter a valid phone number or leave it blank.');
  if(!val('topic'))fail('topic','Choose a topic.');
  if(val('msg').length<10)fail('msg','Write a message of at least 10 characters.');
  if(val('cap')!=='4')fail('cap','The verification answer must be 4.');
  const err=document.getElementById('err'),result=document.getElementById('contact-result');result.textContent='';
  if(errors.length){err.textContent=errors.map(e=>e.msg).join(' ');errors[0].field.focus();return;}
  err.textContent='';savedMessage={name:val('n'),email:val('e'),phone:val('ph'),company:val('company'),teamSize:val('team-size'),topic:val('topic'),message:val('msg'),marketing:document.getElementById('agree').checked,savedAt:new Date().toISOString()};
  const saved=Core.save('contactDraft',savedMessage);result.textContent=saved?'Message draft saved on this device. No message was sent. You can download a copy below.':'Browser storage is unavailable. You can still download your draft.';document.getElementById('download-message').hidden=false;
});
contactForm.addEventListener('input',()=>{document.getElementById('contact-result').textContent='';document.getElementById('download-message').hidden=true;});
document.getElementById('download-message').addEventListener('click',()=>{if(savedMessage)Core.download('nexora-message-draft.json',JSON.stringify(savedMessage,null,2),'application/json');});
