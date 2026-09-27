(function(root){
  'use strict';
  const OrderMath={
    summary(rows){return {count:rows.length,cents:rows.reduce((s,o)=>s+o.cents,0),qty:rows.reduce((s,o)=>s+o.qty,0),average:rows.length?Math.round(rows.reduce((s,o)=>s+o.cents,0)/rows.length):0};},
    filter(rows,q='',status='all',sort='newest'){
      const query=q.trim().toLowerCase();const result=rows.filter(o=>(status==='all'||o.status===status)&&(!query||[o.id,o.customer,o.email,o.product].some(v=>v.toLowerCase().includes(query))));
      return result.sort((a,b)=>(sort==='amount-asc'?a.cents-b.cents:sort==='amount-desc'?b.cents-a.cents:sort==='oldest'?a.date-b.date:b.date-b.date)||a.id.localeCompare(b.id));
    }
  };
  root.OrderMath=OrderMath;if(typeof module!=='undefined')module.exports=OrderMath;
  if(typeof document==='undefined')return;
  const source=window.ORDERS||[];
  let deleted=Core.read('deletedOrders',[]);if(!Array.isArray(deleted))deleted=[];deleted=new Set(deleted.filter(v=>typeof v==='string'));
  let page=1,lastDeleted=null;const pageSize=25;
  const el=id=>document.getElementById(id),active=()=>source.filter(o=>!deleted.has(o.id));
  const filtered=()=>OrderMath.filter(active(),el('search').value,el('status-filter').value,el('sort-orders').value);
  const esc=Core.escape;
  function renderTable(){
    const rows=filtered(),pages=Math.max(1,Math.ceil(rows.length/pageSize));page=Math.min(Math.max(page,1),pages);const offset=(page-1)*pageSize;
    const body=el('orders').querySelector('tbody');
    body.innerHTML=rows.length?rows.slice(offset,offset+pageSize).map(o=>`<tr><td>${esc(o.id)}</td><td>${esc(o.customer)}<br><span class="muted">${esc(o.email)}</span></td><td>${esc(o.product)}</td><td class="numeric">${Core.money(o.cents)}</td><td class="numeric">${o.qty}</td><td><span class="pill ${o.status}">${o.status[0].toUpperCase()+o.status.slice(1)}</span></td><td>${Core.date(o.date)}</td><td><button class="danger" type="button" data-delete="${esc(o.id)}" aria-label="Delete order ${esc(o.id)}">Delete</button></td></tr>`).join(''):'<tr><td class="empty" colspan="8">No orders match your search. Try a different name, product, or status.</td></tr>';
    el('table-count').textContent=`${Core.number(rows.length)} matching orders`;
    el('orders-page').textContent=rows.length?`${offset+1}–${Math.min(offset+pageSize,rows.length)} of ${Core.number(rows.length)} · Page ${page} of ${pages}`:'0 matching orders';
    el('orders-prev').disabled=page<=1;el('orders-next').disabled=page>=pages;el('export-orders').disabled=!rows.length;
  }
  function group(rows,key){const map=new Map();rows.forEach(o=>{const k=typeof key==='function'?key(o):o[key];map.set(k,(map.get(k)||0)+1);});return [...map].sort((a,b)=>b[1]-a[1]);}
  function renderSummary(){
    const rows=active(),s=OrderMath.summary(rows);el('rev').textContent=Core.money(s.cents);el('cnt').textContent=Core.number(s.count);el('avg').textContent=Core.money(s.average);el('qty').textContent=Core.number(s.qty);el('record-count').textContent=`${Core.number(s.count)} active demo records`;
    const dates=rows.map(o=>o.date);el('date-range').textContent=dates.length?`${Core.date(Math.min(...dates))} to ${Core.date(Math.max(...dates))}`:'No orders';
    const products=group(rows,'product'),max=Math.max(1,...products.map(p=>p[1]));
    el('c1').innerHTML=products.map(([name,count])=>`<div><div class="bar-label"><span>${esc(name)}</span><strong>${count}</strong></div><div class="bar-track" aria-hidden="true"><div class="bar-fill" style="width:${count/max*100}%"></div></div></div>`).join('')||'<p>No product data.</p>';
    const colors={paid:'#3b82f6',pending:'#a3a9b7',refunded:'#dc2626',unknown:'#7c3aed'},statuses=group(rows,'status');let angle=0;
    const stops=statuses.map(([status,count])=>{const start=angle;angle+=count/Math.max(s.count,1)*100;return `${colors[status]} ${start}% ${angle}%`;});
    el('c2').innerHTML=`<div class="donut-layout"><div class="donut" aria-hidden="true" style="background:conic-gradient(${stops.length?stops.join(','):'var(--border) 0% 100%'})"></div><ul class="chart-legend">${statuses.map(([status,count])=>`<li><span class="legend-dot" style="background:${colors[status]}" aria-hidden="true"></span>${status[0].toUpperCase()+status.slice(1)}<strong>${count}</strong></li>`).join('')}</ul></div><p>Counts include all active demo orders. Unknown means the source status could not be recognized.</p>`;
    const monthly=new Map();rows.forEach(o=>{const key=new Date(o.date).toISOString().slice(0,7);monthly.set(key,(monthly.get(key)||0)+o.cents);});const months=[...monthly].sort((a,b)=>a[0].localeCompare(b[0]));const peak=Math.max(1,...months.map(v=>v[1]));
    const points=months.map(([,value],i)=>`${32+i/Math.max(months.length-1,1)*336},${160-value/peak*128}`).join(' ');
    const chart=months.length?`<svg class="trend" viewBox="0 0 400 200" role="img" aria-label="Monthly recorded order value. Exact figures are in the data table below."><path d="M32 32V160H368" fill="none" stroke="var(--border)"/><polyline points="${points}" fill="none" stroke="currentColor" stroke-width="3"/>${months.map(([month,value],i)=>`<circle cx="${32+i/Math.max(months.length-1,1)*336}" cy="${160-value/peak*128}" r="4" fill="currentColor"/><text x="${32+i/Math.max(months.length-1,1)*336}" y="190" fill="var(--text-muted)" text-anchor="middle" font-size="14">${esc(month)}</text>`).join('')}</svg>`:'<p>No revenue data.</p>';
    el('c3').innerHTML=chart+`<details><summary>View monthly figures</summary><table class="chart-table"><caption>Recorded order value by month</caption><thead><tr><th scope="col">Month</th><th scope="col">Order value</th></tr></thead><tbody>${months.map(([month,value])=>`<tr><th scope="row">${month}</th><td>${Core.money(value)}</td></tr>`).join('')}</tbody></table></details>`;
    const unknown=rows.filter(o=>o.status==='unknown').length,paid=rows.filter(o=>o.status==='paid').reduce((sum,o)=>sum+o.cents,0);
    el('c4').innerHTML=`<div class="review-list"><div><span class="muted">Recognized payment statuses</span><div class="val">${s.count?((s.count-unknown)/s.count*100).toFixed(1):'0'}%</div></div><div class="bar-track" aria-hidden="true"><div class="bar-fill" style="width:${s.count?(s.count-unknown)/s.count*100:0}%"></div></div><p>${Core.number(unknown)} orders need status review. Unknown statuses are retained, not silently treated as paid.</p><p>Paid order value: <strong>${Core.money(paid)}</strong>. Total order value includes pending, refunded, and unknown records.</p></div>`;
    el('insight-copy').textContent=`${Core.number(unknown)} orders have an unrecognized source status. Review them before using this dataset for financial reporting.`;el('review-status').disabled=!unknown;
    const customers=new Map();rows.forEach(o=>{const c=customers.get(o.email)||{name:o.customer,email:o.email,cents:0,count:0};c.cents+=o.cents;c.count++;customers.set(o.email,c);});
    el('customer-list').innerHTML=[...customers.values()].sort((a,b)=>b.cents-a.cents).slice(0,5).map(c=>`<div class="customer-row"><span>${esc(c.name)}<br><span class="muted">${esc(c.email)}</span></span><span>${Core.money(c.cents)}<br><span class="muted">${c.count} ${c.count===1?'order':'orders'}</span></span></div>`).join('')||'<p>No customers.</p>';
  }
  function refresh(){renderSummary();renderTable();}
  el('search').addEventListener('input',()=>{page=1;renderTable();});
  ['status-filter','sort-orders'].forEach(id=>el(id).addEventListener('change',()=>{page=1;renderTable();}));
  el('orders-prev').addEventListener('click',()=>{page--;renderTable();});el('orders-next').addEventListener('click',()=>{page++;renderTable();});
  el('orders').addEventListener('click',e=>{
    const button=e.target.closest('[data-delete]');if(!button)return;const id=button.dataset.delete;
    if(!confirm(`Delete ${id} from this demo? You can undo this change.`))return;
    const next=new Set(deleted);next.add(id);
    if(!Core.save('deletedOrders',[...next])){toast('Could not save this deletion. The order is unchanged.');return;}
    deleted=next;lastDeleted=id;el('undo-delete').hidden=false;refresh();el('undo-delete').focus();toast(`${id} deleted. Use Undo deletion to restore it.`);
  });
  el('undo-delete').addEventListener('click',()=>{if(!lastDeleted)return;const next=new Set(deleted);next.delete(lastDeleted);if(!Core.save('deletedOrders',[...next])){toast('Could not save the restored order.');return;}deleted=next;lastDeleted=null;el('undo-delete').hidden=true;refresh();el('search').focus();toast('Order restored.');});
  el('reset-orders').addEventListener('click',()=>{if(!confirm('Restore all supplied demo orders?'))return;if(!Core.save('deletedOrders',[])){toast('Could not restore orders. Browser storage is unavailable.');return;}deleted.clear();lastDeleted=null;el('undo-delete').hidden=true;page=1;refresh();toast('All demo orders restored.');});
  el('export-orders').addEventListener('click',()=>{const rows=filtered();Core.download('nexora-orders.csv','\uFEFF'+Core.csv([['Order','Customer','Email','Product','Amount USD','Quantity','Status','Date'],...rows.map(o=>[o.id,o.customer,o.email,o.product,(o.cents/100).toFixed(2),o.qty,o.status,new Date(o.date).toISOString()])]),'text/csv;charset=utf-8');toast(`${Core.number(rows.length)} matching orders exported.`);});
  el('review-status').addEventListener('click',()=>{el('status-filter').value='unknown';el('search').value='';page=1;renderTable();el('order-section').scrollIntoView();el('status-filter').focus();});
  refresh();
})(typeof window!=='undefined'?window:globalThis);
