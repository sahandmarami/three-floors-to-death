/* ==================================================================
   سه طبقه تا مرگ — ماژول ۴۳٫۰ — بخش د: اصلاح‌های ظاهری و جویس
   ==================================================================
   ۰) وصل‌کردن کلیپ‌های صوتی v43 به VOICES23
   ۱) زامبی‌های صفحات داستان: دیگر «روی هوا» نیستند — پا روی زمین،
      بدون جست‌وخیزِ عجیب؛ ردیف‌های عمق روی صفحهٔ خیابان
   ۲) صدای قدم در پلتفرمر + رهاشدنِ درستِ دکمهٔ پرش (پرش متغیر واقعی)
   ۳) بج نسخهٔ v43 + گرم‌سازی کلیپ‌های تازهٔ w43/p43
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

/* ---------- ۲) ورودی پلتفرمر: رهاکردن پرش + صدای قدم ---------- */
(function plat43IO() {
  /* کیبورد — پرش متغیر واقعی */
  window.addEventListener('keyup', (e) => {
    if (!PLAT30.on) return;
    if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) PLAT30.jumpHeld = false;
  });
  window.addEventListener('keydown', (e) => {
    if (!PLAT30.on) return;
    if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) PLAT30.jumpHeld = true;
  });
  /* دی‌پد لمسی — پایان لمسِ دکمهٔ پرش */
  const wire = () => {
    const bj = document.getElementById('platBJ');
    if (bj && !bj.__v43rel) {
      bj.__v43rel = true;
      const off = () => { try { PLAT30.jumpHeld = false; } catch (e) {} };
      bj.addEventListener('touchend', off, { passive: false });
      bj.addEventListener('touchcancel', off, { passive: false });
      bj.addEventListener('pointerup', off);
      bj.addEventListener('pointerleave', off);
    }
  };
  wire();
  setInterval(wire, 900);
})();

/* صدای قدم — داخل حلقهٔ به‌روزرسانی پلتفرمر تزریق می‌شود */
try {
  const _up43 = updatePlatformer43;
  updatePlatformer43 = function (dt) {
    try {
      const p = P43.pl;
      if (p && p.onG && Math.abs(p.vx) > 60 && !P43.dying && !P43.card) {
        const gait = Math.sin(p.walk);
        if (P43._lastGait != null && Math.sign(gait) !== Math.sign(P43._lastGait)) {
          try { Snd.noise({ dur: 0.05, vol: 0.028, ftype: 'lowpass', freq: 420, q: 0.7 }); } catch (e) {}
        }
        P43._lastGait = gait;
      } else P43._lastGait = null;
    } catch (e) {}
    return _up43(dt);
  };
} catch (e) {}

/* ---------- ۳) بج نسخه + گرم‌سازی ---------- */
(function v43badge() {
  setInterval(() => {
    const el = document.getElementById('ver42');
    if (el) el.textContent = 'v43.0';
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
