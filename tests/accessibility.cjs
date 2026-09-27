const fs = require('node:fs');
const { chromium } = require('playwright-core');
const { default: AxeBuilder } = require('@axe-core/playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const reports = [];
  try {
    for (const theme of ['dark', 'light']) {
      for (const file of ['admin.html', 'blog.html', 'contact.html', 'tools.html']) {
        await page.goto('http://localhost:4174/' + file);
        await page.evaluate(theme => {localStorage.setItem('nexora.theme', JSON.stringify(theme));document.documentElement.dataset.theme = theme;}, theme);
        const report = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        reports.push({file,theme,violations:report.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
      }
    }
    fs.mkdirSync('output', {recursive:true});
    fs.writeFileSync('output/accessibility-results.json', JSON.stringify(reports,null,2));
    console.log(JSON.stringify(reports.filter(r=>r.violations.length),null,2));
    if(reports.some(r=>r.violations.length))process.exitCode=1;
    else console.log('8 application page/theme accessibility scans passed. The transplanted landing has a separate visual and navigation check.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
