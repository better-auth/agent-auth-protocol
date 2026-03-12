const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:4321/specification', { waitUntil: 'networkidle' });
  
  const results = await page.evaluate(() => {
    const logo = document.querySelector('nav a[href="/"]');
    const specShell = document.querySelector('.spec-shell');
    const readerContent = document.querySelector('.spec-reader-content');
    const contentArea = document.querySelector('.spec-content-area');
    const specContent = document.querySelector('.spec-content');
    const toc = document.querySelector('.spec-reader-toc');
    
    const results = {};
    [['logo', logo], ['spec-shell', specShell], ['reader-content', readerContent], ['content-area', contentArea], ['spec-content', specContent], ['toc', toc]].forEach(([name, el]) => {
      if (el) {
        const rect = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        results[name] = {
          left: rect.left,
          right: rect.right,
          width: rect.width,
          paddingLeft: cs.paddingLeft,
          paddingRight: cs.paddingRight,
          marginLeft: cs.marginLeft,
          marginRight: cs.marginRight,
          maxWidth: cs.maxWidth,
          boxSizing: cs.boxSizing
        };
      }
    });
    return results;
  });
  
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();
