const fs = require('node:fs');
const vm = require('node:vm');
const { chromium } = require('playwright-core');
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try {
    const context=await browser.newContext();
    const page=await context.newPage();
    const run=vm.runInThisContext('('+fs.readFileSync('tests/browser-qa.js','utf8')+')');
    const result=await run(page);
    fs.writeFileSync('output/browser-results.json',JSON.stringify(result,null,2));
    console.log(JSON.stringify(result,null,2));
  } finally { await browser.close(); }
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
