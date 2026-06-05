const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 240 } });
  const root = 'file://' + process.cwd() + '/site/dist';
  await p.goto(root + '/index.html');
  await p.waitForTimeout(300);
  await p.screenshot({ path: '/tmp/header.png', clip: { x: 0, y: 0, width: 1280, height: 62 } });
  await b.close();
  console.log('done');
})();
