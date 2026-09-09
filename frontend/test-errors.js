const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.toString());
  });
  
  console.log('Checking /analytics...');
  await page.goto('http://localhost:3000/analytics', { waitUntil: 'networkidle2' }).catch(e => console.log(e));
  
  console.log('Checking /appointments...');
  await page.goto('http://localhost:3000/appointments', { waitUntil: 'networkidle2' }).catch(e => console.log(e));

  await browser.close();
})();
