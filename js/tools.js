(function (root) {
  'use strict';
  const Tools = {
    numeric(value, name, min = 0, integer = false) {
      if (String(value).trim() === '') throw new Error(`Enter ${name}.`);
      const n = Number(value);
      if (!Number.isFinite(n) || n < min || (integer && !Number.isInteger(n))) throw new Error(`Enter a valid ${name}${integer ? ' as a whole number' : ''}.`);
      if (n > 1e12) throw new Error(`${name} is too large.`);
      return n;
    },
    miles(value) { return Tools.numeric(value, 'distance') / 1.609344; },
    bmi(weight, height) { const kg = Tools.numeric(weight,'weight',0.1), m = Tools.numeric(height,'height',0.1) / 100; const value = kg / (m*m); return {value, category: value < 18.5 ? 'underweight' : value < 25 ? 'healthy weight' : value < 30 ? 'overweight' : 'obesity'}; },
    split(bill, tip, people) { const amount = Tools.numeric(bill,'bill amount'), pct = Tools.numeric(tip,'tip percentage'), count = Tools.numeric(people,'number of people',1,true); const cents = Math.round(amount*100), tipCents = Math.round(cents*pct/100); const total = cents+tipCents; return {total, tip:tipCents, each:total/count, lower:Math.floor(total/count), extra:total%count, count}; },
    currency(amount, rate) { return Tools.numeric(amount,'amount') * Tools.numeric(rate,'exchange rate',Number.MIN_VALUE); },
    password(length) {
      const n = Tools.numeric(length,'password length',12,true);
      if (n > 128) throw new Error('Choose a password length between 12 and 128.');
      const groups = ['abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ','0123456789','!@#$%^&*()-_=+']; const chars=groups.join('');
      const crypto = root.crypto;
      if (!crypto?.getRandomValues) throw new Error('Secure random generation is unavailable in this browser.');
      function random(max) { const limit = Math.floor(256/max)*max; const b = new Uint8Array(1); do { crypto.getRandomValues(b); } while(b[0] >= limit); return b[0]%max; }
      const out = groups.map(g=>g[random(g.length)]);
      while(out.length<n) out.push(chars[random(chars.length)]);
      for(let i=out.length-1;i>0;i--) { const j=random(i+1); [out[i],out[j]]=[out[j],out[i]]; }
      return out.join('');
    },
    age(value, today = new Date()) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Choose a valid date of birth.');
      const [year,month,day] = value.split('-').map(Number); const birth = new Date(year,month-1,day); birth.setFullYear(year);
      if (birth.getFullYear()!==year || birth.getMonth()!==month-1 || birth.getDate()!==day || year<1) throw new Error('Choose a valid date of birth.');
      const now = new Date(today.getFullYear(),today.getMonth(),today.getDate());
      if (birth>now) throw new Error('Date of birth cannot be in the future.');
      let years=now.getFullYear()-year;
      if (now.getMonth()<month-1 || (now.getMonth()===month-1 && now.getDate()<day)) years--;
      return years;
    },
    hex(value) { let s=value.trim(); if (/^#[\da-f]{3}$/i.test(s)) s='#'+s.slice(1).split('').map(c=>c+c).join(''); if (!/^#[\da-f]{6}$/i.test(s)) throw new Error('Use a valid hex color, such as #3b82f6 or #fff.'); return s; },
    contrast(fg,bg) {
      const luminance = color => { const hex=Tools.hex(color); const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4); return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722; };
      const a=luminance(fg),b=luminance(bg); return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
    }
  };
  root.Tools=Tools;
  if(typeof module!=='undefined') module.exports=Tools;
  if(typeof document==='undefined')return;
  const value=id=>document.getElementById(id).value;
  function bind(id, compute) {
    const form=document.getElementById('form-'+id),out=document.getElementById('out-'+id),err=document.getElementById('error-'+id);
    form.addEventListener('submit',e=>{e.preventDefault();err.textContent='';for(const input of form.querySelectorAll('input'))input.removeAttribute('aria-invalid');try{const text=compute();out.textContent=text;}catch(error){out.textContent='';err.textContent=error.message;}});
    form.addEventListener('input',()=>{out.textContent='';err.textContent='';if(id==='password')document.getElementById('copy-password').hidden=true;});
  }
  bind('km',()=>`${Tools.miles(value('km')).toLocaleString('en-US',{maximumFractionDigits:6})} miles`);
  bind('bmi',()=>{const r=Tools.bmi(value('weight'),value('height'));return `${r.value.toFixed(1)} · ${r.category}`;});
  bind('tip',()=>{const r=Tools.split(value('bill'),value('tip'),value('people'));const money=n=>Core.money(n);return r.extra?`${r.extra} ${r.extra===1?'person pays':'people pay'} ${money(r.lower+1)}; ${r.count-r.extra} pay ${money(r.lower)}. Total ${money(r.total)} including ${money(r.tip)} tip.`:`${money(r.each)} per person. Total ${money(r.total)} including ${money(r.tip)} tip.`;});
  const exampleRates={INR:83,EUR:.9,JPY:150,BTC:.00001};
  document.getElementById('currency').addEventListener('change',e=>{document.getElementById('exchange-rate').value=exampleRates[e.target.value];document.getElementById('out-currency').textContent='';});
  bind('currency',()=>{const amount=Tools.currency(value('amount'),value('exchange-rate')),code=value('currency');return `${amount.toLocaleString('en-US',{minimumFractionDigits:code==='BTC'?8:2,maximumFractionDigits:code==='BTC'?8:2})} ${code}`;});
  bind('password',()=>{const pw=Tools.password(value('password-length'));document.getElementById('copy-password').hidden=false;document.getElementById('copy-result').textContent='';return pw;});
  document.getElementById('copy-password').addEventListener('click',async()=>{const status=document.getElementById('copy-result');try{await navigator.clipboard.writeText(document.getElementById('out-password').textContent);status.textContent='Password copied.';}catch{status.textContent='Clipboard is unavailable. Select and copy the password above.';}});
  const today=new Date();document.getElementById('dob').max=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  bind('age',()=>{const years=Tools.age(value('dob'));return `${years} ${years===1?'year':'years'} old`;});
  bind('contrast',()=>{const fg=Tools.hex(value('foreground')),bg=Tools.hex(value('background')),ratio=Tools.contrast(fg,bg),preview=document.getElementById('contrast-preview');preview.style.color=fg;preview.style.background=bg;return `${ratio.toFixed(2)}:1. AA normal text: ${ratio>=4.5?'Pass':'Fail'}. AA large text: ${ratio>=3?'Pass':'Fail'}. AAA normal text: ${ratio>=7?'Pass':'Fail'}.`;});
})(typeof window!=='undefined'?window:globalThis);
