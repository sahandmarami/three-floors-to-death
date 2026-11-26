/* ==================================================================
   سه طبقه تا مرگ — ماژول اصلاح‌های ظاهری (v44)
   ==================================================================
   ۰) وصل‌کردن کلیپ‌های صوتی به VOICES23
   ۱) زامبی‌های صفحات داستان: پا روی زمین، ردیف‌های عمق
   ۳) گرم‌سازی کلیپ‌های آغازین
   (نسخهٔ ۴۴: بخش پلتفرمر حذف شد)
   ================================================================== */

/* ---------- ۰) دادهٔ صوتی v۴۳ → VOICES23 ---------- */
try {
  if (typeof VOICES43_DATA !== 'undefined') Object.assign(VOICES23, VOICES43_DATA);
} catch (e) {}

/* ---------- ۱) زامبی‌های پس‌زمینهٔ داستان — همیشه پا روی زمین ---------- */
try {
  MG23.bgZombies23 = function (t, x0, y, n, spread, k, scale) {
    for (let i = 0; i < n; i++) {
      const ph = t * 1.7 + i * 2.3;
      const zx = x0 + i * spread - k * (40 + i * 22);
      const zz = 0.55 + (i % 3) * 0.28;                 // ردیف عمق
      const zs = scale * zz;
      /* کلیدِ اصلاح: پا دقیقاً روی صفحهٔ زمین — فقط ردیفِ دور کمی بالاتر،
         نه معلق در هوا؛ هیچ جست‌وخیزِ عمودی نداریم */
      const rowY = GROUND_Y + 2 - (1 - zz) * 9;
      drawZ42(zx + Math.sin(ph * 0.5) * 3.5, rowY, zs, ph, t, {
        dir: 1, tank: i % 3 === 2, hurt: i * 1.7,
        fog: 0.22 + (1 - zz) * 0.3,
        rim: 'rgba(255,170,110,0.30)',
      });
    }
  };
} catch (e) {}

/* ---------- ۳) بج نسخه + گرم‌سازی ---------- */
(function v43badge() {
  setInterval(() => {
    const el = document.getElementById('ver42');
    if (el) el.textContent = 'v44.0';
  }, 600);
  try {
    const _warm = VOICE.warmup.bind(VOICE);
    VOICE.warmup = function () {
      try {
        const keys = ['w43n1', 'w43g1', 'w43p1', 'w43m1', 'w43p2', 'w43m2', 'w43a2', 'w43m3', 'w43p3'];
        let i = 0;
        const step = () => { if (i >= keys.length) return; try { VOICE._buf(keys[i++]); } catch (e) {} setTimeout(step, 130); };
        step();
      } catch (e) {}
      return _warm();
    };
  } catch (e) {}
})();

window.__V43_FIX = 1;
