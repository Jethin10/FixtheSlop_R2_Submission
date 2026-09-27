const assert = require('node:assert/strict');
const {chromium} = require('playwright-core');
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try {
    const context=await browser.newContext();const page=await context.newPage();
    await page.setViewportSize({width:360,height:900});
    await page.goto('http://localhost:4174/admin.html');await page.keyboard.press('Tab');
    assert.equal(await page.locator(':focus').textContent(),'Skip to content');
    await page.getByRole('button',{name:'Open navigation',exact:true}).click();await page.keyboard.press('Escape');
    assert.equal(await page.locator(':focus').getAttribute('aria-label'),'Open navigation');
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
    await page.goto('http://localhost:4174/contact.html');
    const opener=page.getByRole('button',{name:'Write a message',exact:true});await opener.click();await page.keyboard.press('Escape');
    assert.equal(await page.locator('#cm').evaluate(d=>d.open),false);
    assert.equal(await opener.evaluate(el=>el===document.activeElement),true);
    await page.getByRole('button',{name:'Newsletter',exact:true}).click();await page.keyboard.press('Escape');
    assert.equal(await page.locator('#newsletter-dialog').evaluate(d=>d.open),false);
    const staticContext=await browser.newContext({javaScriptEnabled:false});const staticPage=await staticContext.newPage();
    await staticPage.goto('http://localhost:4174/admin.html');await staticPage.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Tools',exact:true}).click();
    assert.ok(staticPage.url().endsWith('/tools.html'));
    console.log('Keyboard focus, menu Escape, dialog Escape/focus return and static navigation passed.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
