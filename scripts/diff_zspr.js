/* مقایسه‌ی پیکسلی: زامبیِ مسیر برداری (قدیمی) در برابر اسپرایت پخته (۱۸٫۱)
   اگر آفسست/باهم‌نهی درست باشد، تفاکت تصویری باید نزدیک صفر باشد */
const { chromium } = require('playwright');
const path = '/home/z/my-project/download/three-floors-to-survival.html';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1100, height: 640 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('file://' + path);
  await page.waitForTimeout(3000);

  const r = await page.evaluate(() => {
    /* دو بوم آزمایشی: یکی با بدنه‌ی زامبیِ مستقیم (برداری)، یکی با اسپرایتِ پخت */
    function mkCanvas() {
      const c = document.createElement('canvas');
      c.width = 200; c.height = 200;
      const g = c.getContext('2d');
      g.setTransform(2, 0, 0, 2, 100, 100);   // مرکز، مقیاس ۲
      return [c, g];
    }
    const mock = { type: 'normal', attacking: false, walkPhase: 1.1, attackAnim: 0, dead: false };
    const main = ctx;

    // ۱) برداری
    let [c1, g1] = mkCanvas();
    ctx = g1;
    try { drawZombieBody(mock, false); } finally { ctx = main; }
    // ۲) اسپرایت — همان قابی که drawZombie می‌کشد
    const spr = ZSPR.frame(mock, false);
    let [c2, g2] = mkCanvas();
    g2.drawImage(spr, ZSPR.X0, ZSPR.Y0, ZSPR.X1 - ZSPR.X0, ZSPR.Y1 - ZSPR.Y0);

    // تفاکت پیکسلی
    const d1 = c1.getContext('2d').getImageData(0, 0, 200, 200).data;
    const d2 = c2.getContext('2d').getImageData(0, 0, 200, 200).data;
    let diff = 0, cnt1 = 0, cnt2 = 0, maxd = 0;
    for (let i = 0; i < d1.length; i += 4) {
      const a1 = d1[i + 3], a2 = d2[i + 3];
      if (a1 > 10) cnt1++;
      if (a2 > 10) cnt2++;
      const dd = Math.abs(a1 - a2);
      if (dd > maxd) maxd = dd;
      if (dd > 40) diff++;
    }
    // جعبه‌ی محدودکننده‌ی هر دو
    function bbox(d) {
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (let y = 0; y < 200; y++) for (let x = 0; x < 200; x++) {
        if (d[(y * 200 + x) * 4 + 3] > 10) {
          if (x < x0) x0 = x; if (x > x1) x1 = x;
          if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
      }
      return [x0, y0, x1, y1];
    }
    return {
      px1: cnt1, px2: cnt2, diffPx: diff, maxd,
      bbox1: bbox(d1).join(','), bbox2: bbox(d2).join(','),
      ratio: cnt2 ? (cnt1 / cnt2) : 0,
    };
  });

  console.log('نتیجه‌ی مقایسه (زامبی معمولی، قاب walkPhase=1.1):');
  console.log(JSON.stringify(r, null, 2));
  const ok = r.ratio > 0.9 && r.ratio < 1.1 && r.diffPx < r.px1 * 0.02;
  console.log(ok ? '✔ اسپرایت با مسیر برداری هم‌پوشانی دارد' : '✘ ناهماهنگی جدی — نیاز به بررسی');

  // شب: بررسی روشنایی صحنه شب واقعی (بعد از رفتن کامل dayness به صفر)
  await page.evaluate(() => {
    GAME.v10.wipeSave(); GAME.v10.startNewGame();
  });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { GAME.v10.skipIntro(); });
  await page.waitForTimeout(600);
  await page.evaluate(() => { GAME.startNight(); });
  await page.waitForTimeout(6000);   // گذار کامل به شب
  const night = await page.evaluate(() => ({
    d: state.dayness, mode: state.mode,
    dark: Dark.level.toFixed(2),
    bgKey: BG.key,
  }));
  console.log('شب کامل:', JSON.stringify(night));
  await page.screenshot({ path: '/home/z/my-project/scripts/shots181/05_night_full.png' });
  const px = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 480; c.height = 280;
    const g = c.getContext('2d');
    g.drawImage(document.getElementById('game'), 0, 0, 480, 280);
    const d = g.getImageData(0, 0, 480, 280).data;
    let s = 0;
    for (let i = 0; i < d.length; i += 4) s += (d[i] + d[i + 1] + d[i + 2]) / 3;
    return (s / (d.length / 4)).toFixed(1);
  });
  console.log('میانگین روشنایی شب (باید < 90):', px);

  if (errors.length) console.log('ERRORS:', errors.slice(0, 3));
  else console.log('صفر خطا ✓');
  await browser.close();
})().catch(e => { console.error('DIFF FAIL:', e); process.exit(1); });
