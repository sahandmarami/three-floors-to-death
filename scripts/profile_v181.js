/* پروفایلر v18.1 — شمارش عملیات canvas + fps با CPU throttling (شبیه‌سازی گوشی ضعیف) */
const { chromium } = require('playwright');
const path = '/home/z/my-project/download/three-floors-to-survival.html';

const THROTTLE = parseFloat(process.argv[2] || '4');   // ضریب کندسازی CPU
const SECS = parseFloat(process.argv[3] || '6');       // مدت هر سناریو

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1100, height: 640 } });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE });

  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto('file://' + path);
  await page.waitForTimeout(3000);

  // ── ابزار سنجش: patch کردن متدهای canvas + fps ──
  await page.evaluate(() => {
    window.__OPS = {};
    window.__FRAME = 0;
    const methods = ['fill', 'stroke', 'fillRect', 'strokeRect', 'clearRect', 'drawImage',
      'beginPath', 'closePath', 'moveTo', 'lineTo', 'arc', 'ellipse', 'quadraticCurveTo',
      'bezierCurveTo', 'createLinearGradient', 'createRadialGradient', 'save', 'restore',
      'fillText', 'strokeText', 'setTransform', 'translate', 'rotate', 'scale', 'clip'];
    const proto = CanvasRenderingContext2D.prototype;
    for (const m of methods) {
      const orig = proto[m];
      if (typeof orig !== 'function') continue;
      window.__OPS[m] = 0;
      proto[m] = function (...a) { window.__OPS[m]++; return orig.apply(this, a); };
    }
    window.__resetOps = () => { for (const m of methods) window.__OPS[m] = 0; window.__FRAME = 0; };
    // fps
    window.__P = { samples: [] };
    const raf = requestAnimationFrame;
    let last = 0;
    (function probe(t) { raf(probe); if (last) __P.samples.push(t - last); last = t; })(0);
    window.__fps = n => {
      const s = __P.samples.slice(-n); if (!s.length) return 'no';
      s.sort((a, b) => a - b); const k = s.length;
      return 'avg=' + (1000 / (s.reduce((a, b) => a + b, 0) / k)).toFixed(0)
        + ' p95=' + (1000 / s[Math.floor(k * 0.95)]).toFixed(0)
        + ' min=' + (1000 / s[k - 1]).toFixed(0);
    };
    window.__rAFinc = () => __FRAME++;
    const oraf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = f => oraf(t => { __FRAME++; return f(t); });
  });

  const report = async (label) => {
    const ops = await page.evaluate(() => {
      const o = { ...window.__OPS };
      const f = Math.max(1, window.__FRAME);
      const per = {};
      let total = 0;
      for (const k in o) { if (o[k]) { per[k] = +(o[k] / f).toFixed(1); total += o[k] / f; } }
      return { per, total: +total.toFixed(0), frames: f };
    });
    const fps = await page.evaluate(n => window.__fps(n), 300);
    const top = Object.entries(ops.per).sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([k, v]) => `${k}:${v}`).join(' ');
    console.log(`\n[${label}]  fps ${fps}  ops/frame=${ops.total} (${ops.frames}f)`);
    console.log(`  top: ${top}`);
    await page.evaluate(() => window.__resetOps());
  };

  await page.evaluate(() => window.__resetOps());

  // ── سناریو ۱: منو ──
  await page.waitForTimeout(SECS * 1000);
  await report(`منو @${THROTTLE}x`);

  // ── سناریو ۲: شب موج ۱ با انبوه زامبی (بدترین حالت) ──
  await page.evaluate(() => {
    GAME.v10.wipeSave(); GAME.v10.startNewGame();
  });
  await page.waitForTimeout(2000);
  await page.evaluate(() => { GAME.v10.skipIntro(); });
  await page.waitForTimeout(800);
  await page.evaluate(() => { GAME.startNight(); });
  await page.waitForTimeout(1500);
  // انبوه: ۱۸ زامبی مخلوط + ادامه اسپاون طبیعی
  await page.evaluate(() => {
    for (let i = 0; i < 10; i++) GAME.spawnType('normal');
    for (let i = 0; i < 4; i++) GAME.spawnType('fast');
    for (let i = 0; i < 3; i++) GAME.spawnType('tank');
    GAME.spawnType('boss');
  });
  await page.waitForTimeout(SECS * 1000);
  await report(`شب انبوه (۱۸+زامبی) @${THROTTLE}x`);

  // ── سناریو ۳: شب فصل ۲ (تاریکی لکه‌ای) ──
  await page.evaluate(() => { GAME.skipToWave(9); });
  await page.waitForTimeout(600);
  await page.evaluate(() => { GAME.startNight(); });
  await page.waitForTimeout(2500);
  await page.evaluate(() => {
    for (let i = 0; i < 10; i++) GAME.spawnType('normal');
    for (let i = 0; i < 5; i++) GAME.spawnType('fast');
  });
  await page.waitForTimeout(SECS * 1000);
  await report(`شب فصل۲ (تاریکی) @${THROTTLE}x`);

  // ── سناریو ۴: رانندگی ──
  await page.evaluate(() => {
    GAME.v10.wipeSave(); GAME.v10.startNewGame();
  });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    GAME.v10.skipIntro();
    // پرش به کات‌سین انتقال ۱ → فاز رانندگی
    if (GAME.v10.startTransition) { try { GAME.v10.startTransition(1); } catch (e) {} }
  });
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    const tr = GAME.v10.TR;
    if (tr) GAME.v10.trGoto(40);   // وسط فاز رانندگی
  });
  await page.waitForTimeout(SECS * 1000);
  await report(`رانندگی @${THROTTLE}x`);

  // ── سناریو ۵: روز + گفتگو (تایپ) ──
  await page.evaluate(() => {
    try { GAME.v10.skipTransition(); } catch (e) {}
    GAME.skipToWave(2);
  });
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    GAME.endWave();
    GAME.v11.DLG.start(GAME.v11.INTRO_DLGS[0]);
  });
  await page.waitForTimeout(SECS * 1000);
  await report(`روز+گفتگو @${THROTTLE}x`);

  if (errors.length) console.log('\nERRORS:', errors.slice(0, 5));
  else console.log('\nصفر خطای کنسول ✓');
  await browser.close();
})().catch(e => { console.error('PROFILE FAIL:', e); process.exit(1); });
