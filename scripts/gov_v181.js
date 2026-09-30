/* تست فرماندار کیفیت ۱۸٫۱ — آیا پله‌ها خودکار فعال می‌شوند و fps بهبود می‌یابد؟ */
const { chromium } = require('playwright');
const path = '/home/z/my-project/download/three-floors-to-survival.html';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1100, height: 640 } });
  const cdp = await page.context().newCDPSession(page);
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto('file://' + path);
  await page.waitForTimeout(3000);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });

  await page.evaluate(() => {
    window.__P = { samples: [] };
    const raf = requestAnimationFrame;
    let last = 0;
    (function probe(t) { raf(probe); if (last) __P.samples.push(t - last); last = t; })(0);
    window.__fps = n => {
      const s = __P.samples.slice(-n); if (!s.length) return 'no';
      s.sort((a, b) => a - b); const k = s.length;
      return 'avg=' + (1000 / (s.reduce((a, b) => a + b, 0) / k)).toFixed(0) + ' p95=' + (1000 / s[Math.floor(k * 0.95)]).toFixed(0);
    };
  });

  const snap = async (label) => {
    const r = await page.evaluate(() => ({
      tier: GAME.perf.tier, fps: GAME.perf.fps.toFixed(1), dpr: (typeof DPR !== 'undefined' ? DPR : -1),
      cls: document.body.className,
    }));
    console.log(`${label}: tier=${r.tier} fps=${r.fps} DPR=${r.dpr} body="${r.cls}"`);
  };

  // شب سنگین مستقیم — فرماندار باید ظرف چند ثانیه پله پایین بیاورد
  await page.evaluate(() => {
    GAME.v10.wipeSave(); GAME.v10.startNewGame();
  });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { GAME.v10.skipIntro(); });
  await page.waitForTimeout(500);
  await page.evaluate(() => { GAME.startNight(); });
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    for (let i = 0; i < 12; i++) GAME.spawnType('normal');
    for (let i = 0; i < 5; i++) GAME.spawnType('fast');
    for (let i = 0; i < 3; i++) GAME.spawnType('tank');
  });
  await snap('t=0s (شروع بار)');
  await page.waitForTimeout(3000); await snap('t=3s');
  await page.waitForTimeout(3000); await snap('t=6s');
  await page.waitForTimeout(3000); await snap('t=9s');
  await page.waitForTimeout(3000); await snap('t=12s');
  console.log('fps زنده: ' + await page.evaluate(() => __fps(240)));

  // بازیابی: بار را بردار — آیا پله بالا می‌رود؟ (نیاز به ۱۰ث fps>57 — در 6x ممکن نخواهد شد؛ تست دستی setTier)
  await page.evaluate(() => { GAME.v10.setPerfLow ? null : null; GAME.perf.setTier(0); });
  await page.waitForTimeout(1500);
  await snap('بعد از setTier(0) دستی');
  console.log('fps بعد از بازگشت پله ۰: ' + await page.evaluate(() => __fps(120)));

  if (errors.length) console.log('ERRORS:', errors.slice(0, 3));
  else console.log('صفر خطا ✓');
  await browser.close();
})().catch(e => { console.error('GOV FAIL:', e); process.exit(1); });
