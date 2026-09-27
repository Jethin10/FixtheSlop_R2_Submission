async (page) => {
  const errors=[];const failures=[];const requests=[];const results=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('requestfailed',r=>failures.push(r.url()));
  page.on('response',r=>{if(r.status()>=400)failures.push(`${r.status()} ${r.url()}`);});
  page.on('request',r=>requests.push(r.url()));
  const base='http://localhost:4174/';
  const assert=(value,message)=>{if(!value)throw new Error(message);results.push(message);};
  await page.setViewportSize({width:1440,height:900});
  await page.goto(base+'tools.html');
  await page.evaluate(()=>localStorage.clear());await page.reload();
  await page.getByRole('button',{name:'Dismiss',exact:true}).click();
  await page.getByLabel('Distance in kilometers').fill('1.609344');await page.getByRole('button',{name:'Convert distance',exact:true}).click();assert(await page.locator('#out-km').textContent()==='1 miles','Distance converter gives 1 mile');
  await page.getByLabel('Weight in kilograms').fill('70');await page.getByLabel('Height in centimeters').fill('175');await page.getByRole('button',{name:'Calculate BMI',exact:true}).click();assert((await page.locator('#out-bmi').textContent()).includes('22.9'),'BMI gives 22.9');
  await page.getByLabel('Bill amount', {exact:true}).fill('100');await page.getByRole('button',{name:'Split bill',exact:true}).click();assert((await page.locator('#out-tip').textContent()).includes('$55.00'),'Bill split gives $55 per person');
  await page.getByLabel('Number of people').fill('0');await page.getByRole('button',{name:'Split bill',exact:true}).click();assert((await page.locator('#error-tip').textContent()).length>0,'Invalid party size shows error');
  await page.getByLabel('Amount in USD').fill('100');await page.getByLabel('Convert to',{exact:true}).selectOption('EUR');await page.getByRole('button',{name:'Convert currency',exact:true}).click();assert((await page.locator('#out-currency').textContent()).includes('90.00 EUR'),'Currency result identifies correct currency');
  await page.getByRole('button',{name:'Generate password',exact:true}).click();assert((await page.locator('#out-password').textContent()).length===16,'Password is requested length');
  await page.getByLabel('Date of birth').fill('2000-01-01');await page.getByRole('button',{name:'Calculate age',exact:true}).click();assert((await page.locator('#out-age').textContent()).includes('26'),'Age handles completed birthdays');
  await page.getByRole('button',{name:'Check contrast',exact:true}).click();assert((await page.locator('#out-contrast').textContent()).includes('21.00:1'),'Contrast gives 21:1');
  await page.getByRole('button',{name:'Switch to light theme',exact:true}).click();await page.reload();assert(await page.locator('html').getAttribute('data-theme')==='light','Theme persists after reload');
  await page.screenshot({path:'C:/fixtheslop/round2/output/tools-desktop.png',fullPage:true});
  await page.goto(base+'admin.html');assert((await page.locator('#rev').textContent())==='$996,759.55','Dashboard retains exact source total');assert((await page.locator('#cnt').textContent())==='2,000','Dashboard counts exactly 2,000 orders');
  await page.getByLabel('Search orders').fill('ORD-100000');assert(await page.locator('#orders tbody tr').count()===1,'Order ID search selects one record');
  const id=await page.locator('#orders tbody tr td').first().textContent();page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Delete order '+id,exact:true}).click();assert((await page.locator('#orders tbody').textContent()).includes('No orders match'),'Delete removes requested order');await page.getByRole('button',{name:'Undo deletion',exact:true}).click();assert((await page.locator('#orders tbody').textContent()).includes(id),'Undo restores same order');
  const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export CSV',exact:true}).click();const download=await downloadPromise;await download.saveAs('C:/fixtheslop/round2/output/orders-test.csv');assert(download.suggestedFilename()==='nexora-orders.csv','CSV export downloads actual file');
  await page.getByLabel('Search orders').fill('');await page.getByLabel('Sort by',{exact:true}).selectOption('amount-asc');const amounts=await page.locator('#orders tbody td:nth-child(4)').allTextContents();assert(amounts.every((v,i)=>i===0||Number(v.replace(/[$,]/g,''))>=Number(amounts[i-1].replace(/[$,]/g,''))),'Amounts sort numerically');
  await page.screenshot({path:'C:/fixtheslop/round2/output/dashboard-desktop.png',fullPage:true});
  await page.goto(base+'blog.html');assert((await page.locator('#posts h2').first().textContent()).includes('Quiet Death'),'Blog starts with first article');await page.getByRole('button',{name:'Next',exact:true}).click();assert((await page.locator('#pno').textContent()).includes('Page 2'),'Blog next page advances');await page.getByRole('button',{name:'Previous',exact:true}).click();
  await page.getByLabel('Search the journal').fill('quiet');assert(await page.locator('#posts article').count()===5,'Blog search is case insensitive');await page.getByLabel('Search the journal').fill('NO_MATCH_123');assert((await page.locator('#posts').textContent()).includes('No articles match'),'Blog empty result does not crash');await page.getByLabel('Search the journal').fill('');
  await page.getByRole('button',{name:'Read essay',exact:true}).first().click();assert(await page.locator('#posts article.open').count()===1,'Read expands only chosen article');const like=page.locator('[data-like="0"]');await like.click();assert(await like.getAttribute('aria-pressed')==='true','Like toggles true');await page.reload();assert(await page.locator('[data-like="0"]').getAttribute('aria-pressed')==='true','Like persists after reload');
  await page.goto(base+'contact.html');await page.getByLabel('Your name',{exact:true}).fill('QA Tester');const payload='<img src=x onerror="alert(1)"> plain-text test';await page.getByLabel('Your message',{exact:true}).fill(payload);await page.getByRole('button',{name:'Post to community',exact:true}).click();assert((await page.locator('#threads').textContent()).includes(payload),'Forum displays submitted markup as text');assert(await page.locator('#threads img').count()===0,'Forum creates no injected image');await page.reload();assert((await page.locator('#threads').textContent()).includes(payload),'Forum post persists after reload');
  await page.getByRole('button',{name:'Write a message',exact:true}).click();await page.getByLabel('Name',{exact:true}).fill('QA Tester');await page.getByRole('button',{name:'Save message draft',exact:true}).click();assert((await page.locator('#err').textContent()).includes('valid email'),'Contact validates incomplete input');assert(await page.getByLabel('Name',{exact:true}).inputValue()==='QA Tester','Contact preserves invalid submission');await page.getByLabel('Email',{exact:true}).fill('qa+test@example.io');await page.getByLabel('Topic',{exact:true}).selectOption('Support');await page.getByLabel('Message',{exact:true}).fill('This is a local QA message, not an external transmission.');await page.getByLabel('Verification: what is 2 + 2?',{exact:true}).fill('4');await page.getByRole('button',{name:'Save message draft',exact:true}).click();assert((await page.locator('#contact-result').textContent()).includes('No message was sent'),'Contact honestly confirms local draft');await page.getByRole('button',{name:'Close contact form',exact:true}).click();
  for(const width of [360,768,1440]) {
    await page.setViewportSize({width,height:900});
    for(const file of ['admin.html','blog.html','contact.html','tools.html']) {
      await page.goto(base+file);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);assert(!overflow,`${file} fits ${width}px viewport`);
      assert(await page.locator('main').count()===1,`${file} has one main landmark`);
      const broken=await page.locator('img').evaluateAll(images=>images.filter(i=>i.complete&&!i.naturalWidth).length);assert(!broken,`${file} images load at ${width}px`);
      if(width===360&&file==='index.html'){await page.getByRole('button',{name:'Open navigation',exact:true}).click();assert(await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Tools',exact:true}).isVisible(),'Mobile menu reveals navigation');await page.screenshot({path:'C:/fixtheslop/round2/output/home-mobile.png'});}
    }
  }
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'tools.html');assert(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior)==='auto','Reduced motion disables smooth scrolling');
  assert(errors.length===0,'No browser runtime errors');assert(failures.length===0,'No failed application requests');assert(requests.every(url=>url.startsWith(base)),'All runtime assets stay on local origin');
  await page.evaluate(()=>{localStorage.removeItem('nexora.threads');localStorage.removeItem('nexora.contactDraft');localStorage.removeItem('nexora.likedPosts');localStorage.removeItem('nexora.deletedOrders');});
  await page.setViewportSize({width:1440,height:900});await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(base+'index.html');
  return {passed:results.length,results,errors,failures};
}
