/* ==================================================================
   سه طبقه تا مرگ — ماژول ۴۲٫۰ — بازخورد کاربر (جلسهٔ ۴۲)
   ==================================================================
   ۱) رفعِ دکمه‌های مردهٔ صفحهٔ باخت (ریشه: rebuildGameover28 بعد از
      init بازسازی می‌کند و لایسنرها از بین می‌روند) + سیوِ خودکار پیش از شب
   ۲) زامبی‌های منو: بازطراحی کامل رنگی (بدون سایهٔ سیاه) — پوست فاسد،
      لباس پاره، دنده‌ها، خون، چشم سرخ، نورِ لبهٔ ماه
   ۳) زامبی‌های صفحات داستان: همان سبک رنگی (MG23.bgZombies23)
   ۴) دستفروش: موتور گفتگوی ضدتکرار با جفت‌های منسجم (سؤال↔پاسخ)،
      حذف «بیا ازم بخر»ها، خط تازهٔ هر بار، CTA تمیزِ قفسه
   ۵) آیکون‌های تازه و تمیزِ کالاهای دستفروش (SVG گرادیانی)
   ۶) منوی سازنده: انتخاب مستقیم فصل/شب آخر/پلتفرمر/پایان + هدیه
   ۷) سرنخ‌ها: کاربرد واقعی — پاداش‌های دائمی + شب‌نامهٔ فردا + سرنخ‌های بیشتر
   ۸) پایان: تیزر مرموز Z پس از تیتراژ + لمس ترسناک روی «ادامه دارد»
   ۹) صدا: ثبت کلیپ‌های تازهٔ v42 (شکاف‌های صوتی داستان بسته شد)
   ================================================================== */
'use strict';

/* ---------- ۴۲-۰) داده‌های صوتی تازه ---------- */
try {
  if (typeof VOICES42_DATA !== 'undefined') Object.assign(VOICES23, VOICES42_DATA);
  /* گرم‌سازی خط‌های افتتاحیه که صدای تازه گرفتند */
  if (typeof VOICE !== 'undefined') {
    const _warm = VOICE.warmup.bind(VOICE);
    VOICE.warmup = function () {
      try {
        const keys = ['n30a', 'n30b', 's30a', 's30p', 's30b', 's30n', 'k30a', 'k30p', 'r30r', 'r30a', 'r30p'];
        let i = 0;
        const step = () => { if (i >= keys.length) return; try { VOICE._buf(keys[i++]); } catch (e) {} setTimeout(step, 130); };
        step();
      } catch (e) {}
      return _warm();
    };
  }
} catch (e) {}

/* ==================================================================
   ۴۲-۱) دکمه‌های صفحهٔ باخت — ریشه‌یابی و رفع
   ================================================================== */
(function fixGameoverButtons() {
  function rewire() {
    const r = document.getElementById('btnRetryDay');
    const m = document.getElementById('btnRestart1');
    if (r && !r.__v42wired) {
      r.__v42wired = true;
      r.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        try { SFX.click(); } catch (er) {}
        try { retryFromSave(); } catch (er) {}
      });
    }
    if (m && !m.__v42wired) {
      m.__v42wired = true;
      m.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        try { SFX.click(); } catch (er) {}
        try { exitToMenu(); } catch (er) {}
      });
    }
  }
  rewire();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', rewire, { once: true });
    setTimeout(rewire, 600);
  }
  /* اگر بازسازی دوباره رخ داد، سیم‌کشی تازه شود */
  setInterval(rewire, 900);
  try {
    const _rg = rebuildGameover28;
    rebuildGameover28 = function () {
      const out = _rg.apply(this, arguments);
      setTimeout(rewire, 30);
      return out;
    };
  } catch (e) {}
  /* «تلاش دوباره» بدون سیو = شروعِ همان فصل (نه کل بازی از اینترو) */
  try {
    const _rf = retryFromSave;
    retryFromSave = function () {
      try { DLG.skip(); } catch (e) {}
      const d = loadSaveData();
      if (!d) {
        const ch = (state && state.chapter) || 1;
        hideOverlays();
        startChapter(ch);
        setAnnounce('🔄 تلاش دوباره', 'همان فصل، از شب اول — این بار محکم‌تر!', 2.6);
        return;
      }
      return _rf();
    };
  } catch (e) {}
  /* پیش از هر شب، سیو — پس «تلاش دوباره» همیشه جواب می‌دهد */
  try {
    const _sn = startNight;
    startNight = function () {
      try { saveGame(); } catch (e) {}
      return _sn.apply(this, arguments);
    };
  } catch (e) {}
})();

/* ==================================================================
   ۴۲-۲) زامبی رنگیِ بازطراحی‌شده — هستهٔ مشترک منو و داستان
   سبک: پوست فاسدِ سبز-خاکستری با نورِ ماه، لباس پارهٔ رنگی،
   دنده‌های بیرون‌زده، خونِ خشک، چشم سرخ تابان، فک آویزان
   ================================================================== */
function drawZ42(x, y, s, ph, t, opt) {
  opt = opt || {};
  const dir = opt.dir || 1;
  const tank = !!opt.tank;
  const fog = opt.fog || 0;                    // مهِ عمق — هرچه دورتر بیشتر
  const stare = !!opt.stare;
  const hurt = opt.hurt || 0;
  const skinA = opt.skinA || '#7d8b58';
  const skinB = opt.skinB || '#4e5a34';
  const skinDark = opt.skinDark || '#39432a';
  const shirt = opt.shirt || '#4a3355';
  const shirt2 = opt.shirt2 || '#372642';
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir < 0 ? -s : s, s);
  /* سایه */
  ctx.fillStyle = 'rgba(0,0,0,' + (0.42 - fog * 0.2).toFixed(2) + ')';
  ctx.beginPath(); ctx.ellipse(0, 2, tank ? 21 : 17, tank ? 5 : 4.2, 0, 0, Math.PI * 2); ctx.fill();
  /* دنبالهٔ مهِ پا */
  ctx.fillStyle = 'rgba(150,165,210,' + (0.10 - fog * 0.05).toFixed(2) + ')';
  ctx.beginPath(); ctx.ellipse(-6 - Math.sin(ph) * 4, 1.5, 12, 4.4, 0, 0, Math.PI * 2); ctx.fill();

  const sway = stare ? 0.30 : 0.22 + Math.sin(ph) * 0.045;
  ctx.rotate(-sway * 0.42);
  /* --- پاها: گام لَنگ --- */
  const lim = Math.sin(ph), lim2 = Math.sin(ph * 0.87 + 1.9);
  const drag = Math.sin(hurt) * 2.4;
  ctx.lineCap = 'round';
  ctx.strokeStyle = skinDark; ctx.lineWidth = 6.6;
  ctx.beginPath();
  ctx.moveTo(-3, -15); ctx.lineTo(-5 + lim * 8.4, -2 + Math.abs(lim) * 1.6);
  ctx.moveTo(3.5, -15); ctx.lineTo(5 + lim2 * 8.4 + drag, -2.2 - Math.abs(Math.sin(ph * 0.87 + 1.9)) * 1.6);
  ctx.stroke();
  /* پارچهٔ پاچهٔ پاره */
  ctx.fillStyle = shirt2;
  ctx.beginPath();
  ctx.moveTo(-6, -15); ctx.lineTo(-3.5, -9.5); ctx.lineTo(-1, -14.5); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(4.5, -15); ctx.lineTo(7, -9.8); ctx.lineTo(9, -14.5); ctx.closePath(); ctx.fill();

  /* --- رداپوش پاره در باد (پشت بدن) --- */
  const wf = Math.sin(t * 2.9 + ph), wf2 = Math.sin(t * 2.2 + ph + 1.3);
  ctx.fillStyle = shirt2;
  ctx.beginPath();
  ctx.moveTo(-7, -18);
  ctx.quadraticCurveTo(-14 - wf * 2.6, -12, -16.5 - wf * 3.2, -3 + wf2 * 1.8);
  ctx.quadraticCurveTo(-11.5, -7.5, -8.5, -13.5);
  ctx.closePath(); ctx.fill();

  /* --- بالاتنه --- */
  const grad = ctx.createLinearGradient(0, -38, 0, -12);
  grad.addColorStop(0, skinA); grad.addColorStop(0.55, skinB); grad.addColorStop(1, skinDark);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-10, -14.5);
  ctx.quadraticCurveTo(-12.6, -27, -6.5, -35);
  ctx.quadraticCurveTo(1, -40.5, 8.6, -34.8);
  ctx.quadraticCurveTo(13, -27, 10.8, -14.5);
  ctx.lineTo(8, -11.2); ctx.lineTo(5.6, -14); ctx.lineTo(2.6, -10.8);
  ctx.lineTo(-0.6, -13.8); ctx.lineTo(-3.4, -10.4); ctx.lineTo(-6.2, -13.2); ctx.lineTo(-8.4, -10.6);
  ctx.closePath(); ctx.fill();
  /* لباس پارهٔ روی سینه */
  ctx.fillStyle = shirt;
  ctx.beginPath();
  ctx.moveTo(-9.6, -15.5);
  ctx.quadraticCurveTo(-11.4, -25, -6.8, -30.5);
  ctx.lineTo(-2, -29); ctx.lineTo(-4.4, -22); ctx.lineTo(0.5, -23.5);
  ctx.lineTo(-2.5, -16); ctx.lineTo(3.5, -17); ctx.lineTo(2, -14.8);
  ctx.lineTo(-5.5, -14);
  ctx.closePath(); ctx.fill();
  /* دنده‌های بیرون‌زده — سه قوس استخوانی */
  ctx.strokeStyle = 'rgba(224,222,208,0.78)'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let ri = 0; ri < 3; ri++) {
    const ry = -24.5 + ri * 3.4;
    ctx.moveTo(0.6, ry);
    ctx.quadraticCurveTo(3.4, ry + 1.1, 5.2, ry - 0.6);
  }
  ctx.stroke();
  /* خونِ خشک روی لباس */
  ctx.fillStyle = 'rgba(122,28,24,0.85)';
  ctx.beginPath(); ctx.ellipse(-3.4, -19.5, 2.6, 3.6, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(3.2, -25, 1.7, 2.3, -0.3, 0, Math.PI * 2); ctx.fill();
  /* نورِ لبهٔ ماه */
  ctx.strokeStyle = opt.rim || 'rgba(255,150,95,0.40)'; ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(10.4, -16);
  ctx.quadraticCurveTo(12.4, -27.5, 7.4, -34.2);
  ctx.quadraticCurveTo(3.2, -38.8, -1.6, -37.6);
  ctx.stroke();

  /* --- بازوها: یکی دراز جلو با چنگک --- */
  const reach = Math.sin(ph * 0.55) * 2.4;
  ctx.strokeStyle = skinB; ctx.lineWidth = 5.4;
  ctx.beginPath();
  ctx.moveTo(5.5, -30);
  ctx.quadraticCurveTo(13.5, -26 + reach * 0.4, 17.5, -17.5 + reach);
  ctx.moveTo(-5, -30.5);
  ctx.quadraticCurveTo(-12.5, -24, -14.8, -14 + Math.sin(ph + 1.1) * 2.4);
  ctx.stroke();
  /* خطِ سایه زیر بازو */
  ctx.strokeStyle = skinDark; ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(6.4, -29);
  ctx.quadraticCurveTo(13.8, -24.6, 17, -16.4 + reach);
  ctx.stroke();
  /* چنگک‌ها */
  ctx.strokeStyle = skinA; ctx.lineWidth = 2.1;
  const claw = (cx, cy, k) => {
    ctx.beginPath();
    for (let ci = -1; ci <= 1; ci++) {
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(cx + ci * 2.4 * k, cy + 2.4, cx + ci * 3.1 * k, cy + 5.8);
    }
    ctx.stroke();
  };
  claw(17.5, -17.5 + reach, 1);
  claw(-14.8, -14 + Math.sin(ph + 1.1) * 2.4, 0.8);

  /* --- سر --- */
  const tilt = (stare ? 0.30 : 0.20) + Math.sin(t * 0.9 + ph) * 0.05;
  ctx.save();
  ctx.translate(7.6, -37.2);
  ctx.rotate(tilt);
  const hg = ctx.createLinearGradient(0, -9, 0, 5);
  hg.addColorStop(0, skinA); hg.addColorStop(1, skinDark);
  ctx.fillStyle = hg;
  ctx.beginPath(); ctx.ellipse(0, -1.5, 6.9, 7.5, 0, 0, Math.PI * 2); ctx.fill();
  /* گوش + موی پاره */
  ctx.fillStyle = skinDark;
  ctx.beginPath(); ctx.ellipse(-5.6, -1.8, 1.7, 2.4, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(46,52,34,0.9)';
  ctx.beginPath(); ctx.arc(-1.2, -6.6, 4.6, Math.PI * 1.05, Math.PI * 1.9); ctx.fill();
  ctx.beginPath(); ctx.arc(-4.6, -5.6, 2.6, Math.PI * 1.1, Math.PI * 1.75); ctx.fill();
  /* لبهٔ جمجمه در نور */
  ctx.strokeStyle = opt.rim || 'rgba(255,150,95,0.45)'; ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.arc(0, -1.5, 6.9, -1.3, 0.3); ctx.stroke();
  /* چشم‌های سرخ تابان */
  const lit = opt.lit ? 0.5 : 0;
  let er = 0.62 + 0.38 * Math.abs(Math.sin(t * 1.9 + ph * 0.6)) + lit;
  if (er > 1) er = 1;
  const eg = ctx.createRadialGradient(2.6, -3.4, 0.4, 2.6, -3.4, 6.4);
  eg.addColorStop(0, 'rgba(255,60,34,' + (er * 0.55).toFixed(2) + ')');
  eg.addColorStop(1, 'rgba(255,60,34,0)');
  ctx.fillStyle = eg; circle(2.6, -3.4, 6.4);
  ctx.fillStyle = 'rgba(255,74,44,' + er.toFixed(2) + ')';
  circle(1.5, -3.5, 1.35); circle(4.4, -3.2, 1.35);
  ctx.fillStyle = 'rgba(20,8,6,0.9)';
  circle(1.7, -3.3, 0.55); circle(4.6, -3.0, 0.55);
  /* زخم دهان */
  ctx.strokeStyle = 'rgba(110,26,22,0.9)'; ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(3.6, 1.6); ctx.lineTo(5.6, 2.6);
  ctx.moveTo(-2.6, 1.2); ctx.lineTo(-4.2, 2.2);
  ctx.stroke();
  /* فک آویزان + دندان */
  ctx.fillStyle = skinDark;
  ctx.beginPath();
  ctx.moveTo(-4.6, 2.4);
  ctx.quadraticCurveTo(0.6, 8.8, 5.4, 3.6);
  ctx.quadraticCurveTo(3.2, 1.3, -4.6, 2.4);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(20,10,8,0.95)';
  ctx.beginPath(); ctx.ellipse(0.4, 3.3, 3.6, 1.7, 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(216,210,196,0.92)'; ctx.lineWidth = 1.05;
  ctx.beginPath();
  for (let di = 0; di < 4; di++) {
    const tx = -2.8 + di * 1.9;
    ctx.moveTo(tx, 2.1); ctx.lineTo(tx + 0.8, 3.8);
    ctx.moveTo(tx + 0.9, 4.9); ctx.lineTo(tx + 0.9, 3.6);
  }
  ctx.stroke();
  ctx.restore();
  ctx.restore();

  /* مهِ عمق روی زامبی‌های دور */
  if (fog > 0) {
    ctx.fillStyle = 'rgba(12,14,28,' + (fog * 0.5).toFixed(2) + ')';
    ctx.beginPath(); ctx.ellipse(x, y - 20 * s, 24 * s, 26 * s, 0, 0, Math.PI * 2); ctx.fill();
  }
}

/* --- منو: پیکربندی و رسم تازه --- */
try {
  const _init42 = M23.init.bind(M23);
  M23.init = function () {
    _init42();
    if (!this.__z42) {
      this.__z42 = 1;
      const cfg = [
        { d: 0.60, x0: 0.14, ty: 'tank' },
        { d: 0.92, x0: 0.86, ty: 'normal' },
        { d: 1.20, x0: 0.58, ty: 'normal' },
        { d: 1.42, x0: 0.30, ty: 'tank' },
      ];
      const s0 = { v: 424243 };
      const rnd = () => { s0.v = (s0.v * 1103515245 + 12345) & 0x7fffffff; return s0.v / 0x7fffffff; };
      this.zmb = cfg.map(c => ({
        d: c.d, ty: c.ty, x: c.x0 * W, ph: rnd() * 6.28,
        dir: c.x0 < 0.45 ? 1 : -1, spd: 4.6 + rnd() * 3.4,
        stare: 0, hurt: rnd() * 6.28,
        hue: Math.floor(rnd() * 3),
      }));
    }
  };
  const Z42_SKIN = [
    { a: '#7d8b58', b: '#4e5a34', dk: '#39432a', sh: '#4a3355', sh2: '#372642' },   // سبز فاسد
    { a: '#8a8a66', b: '#5c5c3c', dk: '#41412a', sh: '#6e3b2e', sh2: '#4f2a20' },   // خاکی با پیراهن قهوه‌ای
    { a: '#75855e', b: '#49583a', dk: '#34402a', sh: '#33415c', sh2: '#232e44' },   // سبز آبی‌فام
  ];
  M23.drawSilZombie = function (z, t, flash) {
    const d = z.d;
    const x = z.x + this._press.x * -20 * d;
    const y = GROUND_Y + (d - 0.6) * 15;
    const s = d * (z.ty === 'tank' ? 1.42 : 1.24);
    const sk = Z42_SKIN[z.hue % Z42_SKIN.length];
    drawZ42(x, y, s, z.ph, t, {
      dir: z.dir, stare: z.stare > 0, hurt: z.hurt, tank: z.ty === 'tank',
      lit: flash > 0.35, fog: Math.max(0, 0.62 - d) * 0.9,
      skinA: sk.a, skinB: sk.b, skinDark: sk.dk, shirt: sk.sh, shirt2: sk.sh2,
    });
  };
} catch (e) {}

/* --- داستان: زامبی‌های رنگی در پس‌زمینهٔ صحنه‌ها --- */
try {
  MG23.bgZombies23 = function (t, x0, y, n, spread, k, scale) {
    for (let i = 0; i < n; i++) {
      const ph = t * 1.7 + i * 2.3;
      const zx = x0 + i * spread - k * (40 + i * 22);
      const zz = 0.55 + (i % 3) * 0.28;
      const zs = scale * zz;
      const far = 1 - zz;
      drawZ42(zx + Math.sin(ph * 0.5) * 3.5, y + (1 - zz) * 8 - Math.abs(Math.sin(ph)) * 2.2, zs, ph, t, {
        dir: 1, tank: i % 3 === 2, hurt: i * 1.7,
        fog: 0.22 + far * 0.3,
        rim: 'rgba(255,170,110,0.30)',
      });
    }
  };
} catch (e) {}

/* ==================================================================
   ۴۲-۳) دستفروش — موتور گفتگوی ضدتکرارِ منسجم
   ================================================================== */
const PED42 = {
  LS: 'ttb42_ped',
  _used: null,
  load() {
    if (this._used) return this._used;
    try { this._used = JSON.parse(STORE.get(this.LS) || '{}') || {}; } catch (e) { this._used = {}; }
    return this._used;
  },
  save() { try { STORE.set(this.LS, JSON.stringify(this._used || {})); } catch (e) {} },
  /* انتخاب بدون تکرار: تا استخر تمام نشود، خط تازه می‌دهد */
  pick(key, n) {
    const u = this.load();
    if (!Array.isArray(u[key])) u[key] = [];
    const arr = u[key];
    if (n <= 1) return 0;
    if (arr.length >= n) {
      /* چرخه تمام شد — با ایندکس متفاوت از آخرین خطِ قبلی از نو */
      const last = arr[arr.length - 1];
      u[key] = [];
      this.save();
      let idx;
      do { idx = Math.floor(Math.random() * n); } while (idx === last && n > 1);
      arr.push(idx);
      this.save();
      return idx;
    }
    let idx;
    do { idx = Math.floor(Math.random() * n); } while (arr.indexOf(idx) >= 0 && arr.length < n);
    arr.push(idx);
    this.save();
    return idx;
  },
  reset() { this._used = {}; this.save(); },
};

/* جفت‌های منسجم: (سؤال آرش ↔ پاسخ دستفروش) + خط آغازین مستقل */
const PED42_INTRO = [
  ['pd1i2', 'pd1i3', 'q1a', 'q1b', 'q1c', 'q1d'],   // شنل‌پوش
  ['pd2i1', 'pd2i2', 'pd2i3', 'q2a', 'q2b', 'q2c'], // پیرمرد
  ['pd3i3', 'q3a', 'q3b', 'q3c'],                    // ماسک گاز
  ['pd4i1', 'pd4i2', 'pd4i3', 'q4a', 'q4b', 'q4c'], // بارانی‌زرد
  ['pd5i1', 'pd5i2', 'pd5i3', 'q5a', 'q5b', 'q5c'], // چرخ‌دسته
];
const PED42_PAIRS = [
  [ // شنل‌پوش مرموز
    { q: 'pdA1', a: 'pd1a1' },
    { q: 'pa1', a: 'q1b' },
    { q: 'pa2', a: 'q1d' },
    { q: 'pa3', a: 'q1c' },
  ],
  [ // پیرمرد خنده‌رو
    { q: 'pdA1', a: 'pd2a1' },
    { q: 'pa1', a: 'q2a' },
    { q: 'pa4', a: 'q2b' },
    { q: 'pdA7', a: 'pd2a3' },
  ],
  [ // ماسک گاز
    { q: 'pdA1', a: 'pd3a3' },
    { q: 'pa1', a: 'q3a' },
    { q: 'pa4', a: 'q3c' },
  ],
  [ // جوان بارانی‌زرد
    { q: 'pdA1', a: 'pd4a1' },
    { q: 'pa1', a: 'q4a' },
    { q: 'pa4', a: 'pd4a3' },
  ],
  [ // چرخ‌دسته
    { q: 'pdA1', a: 'pd5a1' },
    { q: 'pa1', a: 'q5c' },
    { q: 'pa5', a: 'q5a' },
    { q: 'pa3', a: 'pd5a2' },
  ],
];
const PED42_FARE = [
  ['pd1f1', 'pd1f2', 'pmh5'],
  ['pd2f1'],
  ['pd3f1', 'q3b'],
  ['pd4f1'],
  ['pd5f1', 'q5b'],
];

try {
  PED.talk = function () {
    this.phase = 'talk';
    const face = this.look % 5;
    const who = 'd' + (face + 1);
    const visit = Math.max(1, state.peddler.visits | 0);
    const lines = [];
    if (visit === 1) lines.push({ who: 'd1', v: 'pdf1', text: 'تازه‌واردی، نه؟ اولین بار همیشه سخته. ببین و انتخاب کن.' });
    /* خط آغازین — هر بار تازه */
    const ip = PED42_INTRO[face];
    const ii = PED42.pick('i' + face, ip.length);
    lines.push({ who, v: ip[ii], text: '' });   // متن پایین پر می‌شود
    /* جفت سؤال↔پاسخ منسجم — بدون تکرار تا چرخه کامل شود */
    const pp = PED42_PAIRS[face];
    const pi = PED42.pick('p' + face, pp.length);
    lines.push({ who: 'p', v: pp[pi].q, text: '' });
    lines.push({ who, v: pp[pi].a, text: '' });
    /* هر پنج بازدید: خط مرموز عمیق‌تر */
    if (visit >= 3 && visit % 4 === 0) {
      const mi = PED42.pick('m' + face, PED30_MYSTERY.length);
      lines.push({ who, v: PED30_MYSTERY[mi].v, text: PED30_MYSTERY[mi].t });
    }
    /* متن‌های نمایشی — از دیتابیس کلیپ‌ها نمی‌خوانیم؛ اینجا ثابت‌اند */
    const T42 = {
      pd1i2: 'بازگشتم. مثل همیشه، قبل از تاریکی.', pd1i3: 'امشب سنگین‌تره. آماده‌ای؟',
      q1a: 'امشب باد از درهٔ شمالی می‌وزد. چیزی که باهاش میاد، جنسِ من نیست.',
      q1b: 'عصای من پیش از هر خطر تکان می‌خوره. امشب، از لحظه‌ی رسیدنم، داره می‌لرزه.',
      q1c: 'سرنخ‌هات رو جمع کن، آرش. من همه‌چیز رو از دو طرفِ این شهر دیده‌ام.',
      q1d: 'پروژهٔ Z؟ مثل آینه‌ست؛ خودت باید ببینیش. من فقط جنس می‌فروشم.',
      pd2i1: 'به‌به! مشتری قدیمی! بیا ببین چی آوردم!', pd2i2: 'این کوله از خودم سنگین‌تره، ولی برات می‌ارزه!',
      pd2i3: 'بیا بیا! یه سورپرایز دارم که موهات وانهسته!',
      q2a: 'تو جوانیِ من، شب‌ها مالِ خواب بود. حالا شب‌ها فقط مالِ زنده‌موندنه!',
      q2b: 'جنسام قدیمین، مثل خودم؛ ولی هر دو هنوز کار می‌کنیم!',
      q2c: 'این بسته‌رو از یه داروخانه برداشتم؛ صاحبش دیگه بهش نیاز نداشت.',
      pd3i3: '...جنسِ تازه رسیده. نگاه کن.',
      q3a: 'باد از دره میاد. بوی گله‌ی جدید رو میاره.',
      q3b: 'کالا مرتبه. انتخاب کن. وقت کمه.',
      q3c: 'اسمت رو ماسکم نوشتم، آرش. قصه‌ش درازه.',
      pd4i1: 'سلام سلام! بهترین جنس شهر اینجاست!', pd4i2: 'تخفیف ویژه دارم! فقط امروز!',
      pd4i3: 'وایسا! قبل از اینکه بپرسی بگم: تخفیفِ ویژه‌ی امشب!',
      q4a: 'امشب از جاده گذشتم؛ زامبی‌ها مثل صفِ نونوایی برمی‌گشتن!',
      q4b: 'یه کارتون از پناهگاهِ قدیمی پیدا کردم؛ اینا توش بود!',
      q4c: 'فردا اگه زنده بودی، یه جوکِ تازه دارم؛ مالِ قبلِ ویروسه!',
      pd5i1: 'این چرخ‌دسته رو از سه شهر دورتر هل دادم تا اینجا.',
      pd5i2: 'خسته‌ام، ولی جنسام تازه‌ست.', pd5i3: 'بینِ چرخ‌ها چیزای خوبی گیر کرده.',
      q5a: 'از سه تا ایستگاه گذشتم؛ همه خاموش بودن. رادیو رو روشن نگه دار.',
      q5b: 'چرخ‌دسته‌ام صدا میده، ولی هنوز می‌چرخه؛ مثل ما.',
      q5c: 'هر شب یکی از چراغ‌های شهر خاموش میشه؛ ولی تو هنوز ایستادی.',
      pdA1: 'کالای کمیاب؟ تقلبی نیست؟', pdA7: 'چیزی داری که برج رو نجات بده؟',
      pa1: 'امشب در انتظارمون چیه؟', pa2: 'دربارهٔ پروژهٔ Z چی می‌دونی؟',
      pa3: 'این سرنخ‌ها رو دیدی؟ یه چیزیش می‌فهمی؟',
      pa4: 'تو دقیقاً کی هستی؟', pa5: 'اونا که از پناهگاه رفتن... کجا رفتن؟',
      pd1a1: 'تقلبی؟ در این دنیا اصل و تقلبی فرقی نداره... فقط زنده موندن مهمه.',
      pd2a1: 'قیمت؟ جون عزیزت! مگه تو این دوره کسی قیمت می‌پرسه؟',
      pd2a3: 'کار می‌کنه! روی خودم تستش نکردم، ولی کار می‌کنه!',
      pd3a3: 'تست‌شده. روی اونا.',
      pd4a1: 'تقلبی؟ داداش، من خودم تستشون کردم! البته نه روی خودم...',
      pd4a3: 'ضمانت؟! تو دنیای زامبی‌ها ضمانت یعنی همین بسته‌ی پلاستیکی!',
      pd5a1: 'این روزا همه‌چی گرونه، حتی زنده موندن.', pd5a2: 'انتخاب با توئه. من فقط راه رو نشون می‌دم.',
    };
    for (const L of lines) if (!L.text) L.text = T42[L.v] || L.v;
    /* متن و صدا هم‌زمان — DLG خودش با VOICE.dur تایپ می‌کند */
    try { if (typeof VOICE !== 'undefined') VOICE.pedTweak = null; } catch (e) {}
    /* سرنخ دستفروش: هر سومین بازدید یک سرنخ داستانی */
    try {
      if (visit % 3 === 0 && typeof MYST !== 'undefined') {
        MYST.addClue('🛒', 'بازارِ زیرِزمینی', 'دستفروش: «سؤال، گرون‌تره» — بازدیدِ ' + faNum(visit));
      }
    } catch (e) {}
    try {
      DLG.start(lines, () => { if (PED.phase === 'talk') PED.openShop(); });
    } catch (e) { this.openShop(); }
  };
  /* خداحافظی بدون تکرار */
  const _leave42 = PED.leave.bind(PED);
  PED.leave = function (farewell) {
    if (!this.active) return;
    if (this.phase !== 'leave') {
      const face = this.look % 5;
      const fp = PED42_FARE[face];
      const fi = PED42.pick('f' + face, fp.length);
      const v = fp[fi];
      const T42F = {
        pd1f1: 'غروب شد... باید رفت.', pd1f2: 'فردا... اگه فردایی باشه.', pmh5: 'یه روز می‌فهمی چرا همیشه قبل از غروب می‌رم.',
        pd2f1: 'مواظب خودت باش جوون! اگه عمری باشه!',
        pd3f1: '...رفتم.', q3b: 'وقت کمه. رفتم.',
        pd4f1: 'غروب شد! من رفتم! فردا زودتر بیا!',
        pd5f1: 'راه درازه... باید برم. فردا همین‌جا.', q5b: 'چرخ‌دسته‌ام هنوز می‌چرخه؛ منم می‌رم.',
      };
      const text = T42F[v] || 'غروب شد... باید رفت.';
      this.phase = 'leave';
      this.dir = -this.dirFrom;
      try { DLG.skip(); } catch (e) {}
      hidePeddlerPanel();
      state.peddler.here = false;
      if (farewell !== false) {
        try { VOICE.speak(text, 'd' + (this.look + 1), v); } catch (e) {}
      }
    }
  };
} catch (e) {}

/* ==================================================================
   ۴۲-۴) قفسهٔ دستفروش — آیکون‌های تازه + CTA تمیز (بدون «بیا بخر»)
   ================================================================== */
const VICON42 = {
  vest: '<svg viewBox="0 0 48 48"><defs><linearGradient id="vg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4fb8e8"/><stop offset="1" stop-color="#1a5c8a"/></linearGradient></defs><path d="M16 6 L32 6 L34 14 L34 42 L14 42 L14 14 Z" fill="url(#vg1)" stroke="#0d2c44" stroke-width="1.6"/><path d="M20 6 L24 14 L28 6" fill="#0d2c44"/><rect x="19" y="20" width="10" height="12" rx="2" fill="rgba(9,40,62,0.5)" stroke="#9fdcff" stroke-width="1.2"/><path d="M14 14 L10 20 L12 26 M34 14 L38 20 L36 26" stroke="#9fdcff" stroke-width="1.6" fill="none"/><path d="M22 23 L24 29 L26 23" stroke="#ffd873" stroke-width="1.6" fill="none"/></svg>',
  goldAmmo: '<svg viewBox="0 0 48 48"><defs><linearGradient id="gg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe38a"/><stop offset="1" stop-color="#c89a2a"/></linearGradient></defs><g><rect x="10" y="18" width="7" height="20" rx="3" fill="url(#gg1)" stroke="#6e5410" stroke-width="1.2"/><rect x="19" y="14" width="7" height="24" rx="3" fill="url(#gg1)" stroke="#6e5410" stroke-width="1.2"/><rect x="28" y="18" width="7" height="20" rx="3" fill="url(#gg1)" stroke="#6e5410" stroke-width="1.2"/><path d="M10 18 L13.5 10 L17 18 M19 14 L22.5 6 L26 14 M28 18 L31.5 10 L35 18" fill="#fff2c2" stroke="#6e5410" stroke-width="1"/></g><ellipse cx="23.5" cy="42" rx="16" ry="3.4" fill="rgba(0,0,0,0.30)"/></svg>',
  helmet: '<svg viewBox="0 0 48 48"><defs><linearGradient id="hg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfe7f0"/><stop offset="1" stop-color="#8a97a8"/></linearGradient></defs><path d="M9 30 C9 16 16 9 24 9 C32 9 39 16 39 30 L39 33 L9 33 Z" fill="url(#hg1)" stroke="#3a4654" stroke-width="1.6"/><path d="M9 33 L6 35 L42 35 L39 33 Z" fill="#4a5664"/><path d="M17 12 C19 10.6 29 10.6 31 12" stroke="#eef4fa" stroke-width="1.6" fill="none"/><circle cx="24" cy="21" r="3.4" fill="rgba(9,40,62,0.25)" stroke="#4a5664" stroke-width="1.2"/><ellipse cx="24" cy="42" rx="15" ry="3" fill="rgba(0,0,0,0.30)"/></svg>',
  airstrike: '<svg viewBox="0 0 48 48"><defs><linearGradient id="ag1" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3c4654"/><stop offset="1" stop-color="#20272f"/></linearGradient></defs><rect x="8" y="16" width="32" height="16" rx="6" fill="url(#ag1)" stroke="#0d1216" stroke-width="1.5"/><circle cx="17" cy="24" r="4.6" fill="#0d1216" stroke="#7ce6c4" stroke-width="1.4"/><circle cx="17" cy="24" r="1.8" fill="#7ce6c4"/><rect x="26" y="20" width="10" height="3" rx="1.5" fill="#7ce6c4"/><rect x="26" y="25" width="7" height="2.4" rx="1.2" fill="#4fae94"/><path d="M8 16 L4 12 M8 32 L4 36" stroke="#4fae94" stroke-width="1.6"/><path d="M40 22 L45 18 M40 26 L45 30" stroke="#ff8a5a" stroke-width="1.8"/></svg>',
  freezeBomb: '<svg viewBox="0 0 48 48"><defs><radialGradient id="fg1" cx="0.5" cy="0.42" r="0.7"><stop offset="0" stop-color="#d6f2ff"/><stop offset="1" stop-color="#4a9cc8"/></radialGradient></defs><circle cx="24" cy="24" r="13" fill="url(#fg1)" stroke="#1a4a68" stroke-width="1.5"/><path d="M24 12 L24 36 M12 24 L36 24 M16 16 L32 32 M32 16 L16 32" stroke="#eaf8ff" stroke-width="1.8" stroke-linecap="round"/><circle cx="24" cy="24" r="4" fill="#eaf8ff" stroke="#1a4a68" stroke-width="1.2"/><path d="M24 8 L24 11 M24 37 L24 40 M8 24 L11 24 M37 24 L40 24" stroke="#9fdcff" stroke-width="2" stroke-linecap="round"/></svg>',
  adrenaline: '<svg viewBox="0 0 48 48"><defs><linearGradient id="rg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8aa2"/><stop offset="1" stop-color="#c22a52"/></radialGradient></defs><path d="M17 6 L31 6 L31 14 L34 18 L34 40 C34 43 31 44 29 44 L19 44 C17 44 14 43 14 40 L14 18 L17 14 Z" fill="#e23a66" stroke="#7a0f2c" stroke-width="1.5"/><rect x="18" y="3" width="12" height="4" rx="2" fill="#8a97a8"/><path d="M24 22 C20 26 19 30 22 33 C24 35 27 33 26 30 C25 28 22 28 22 31" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="24" cy="37" r="2" fill="#ffd873"/></svg>',
  bpTesla: '<svg viewBox="0 0 48 48"><defs><linearGradient id="tg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d29aff"/><stop offset="1" stop-color="#7a2ab8"/></linearGradient></defs><rect x="10" y="6" width="28" height="36" rx="3" fill="#e8e2f2" stroke="#5a3a7a" stroke-width="1.5"/><path d="M14 10 L34 10 M14 38 L34 38" stroke="#5a3a7a" stroke-width="1.2"/><path d="M24 14 L24 22 M24 22 L30 26 L20 30 L26 34" stroke="#8a3acc" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="24" cy="13" r="2.2" fill="#8a3acc"/><path d="M15 15 L18 19 M33 15 L30 19" stroke="#c04dff" stroke-width="1.4"/><text x="24" y="26" font-size="7" fill="#5a3a7a" text-anchor="middle">⚡</text></svg>',
  bpMissile: '<svg viewBox="0 0 48 48"><rect x="10" y="6" width="28" height="36" rx="3" fill="#e8e2f2" stroke="#5a3a7a" stroke-width="1.5"/><path d="M24 12 C28 16 29 22 27 28 L21 28 C19 22 20 16 24 12 Z" fill="#ff8a5a" stroke="#8a3a1a" stroke-width="1.3"/><circle cx="24" cy="20" r="2.4" fill="#ffe0c2" stroke="#8a3a1a" stroke-width="1"/><path d="M21 28 L18 34 M27 28 L30 34 M24 28 L24 35" stroke="#8a3a1a" stroke-width="1.6"/><path d="M14 16 L18 14 M34 16 L30 14" stroke="#ff5a2a" stroke-width="1.4"/></svg>',
  bpFlame: '<svg viewBox="0 0 48 48"><rect x="10" y="6" width="28" height="36" rx="3" fill="#e8e2f2" stroke="#5a3a7a" stroke-width="1.5"/><path d="M24 12 C29 17 31 22 28 27 C26 31 21 31 20 26 C19 21 21 17 24 12 Z" fill="#ff9a3c" stroke="#8a4a1a" stroke-width="1.3"/><path d="M24 18 C26 21 27 24 25.5 27 C24 29 22 28 21.8 26 C21.4 23 22.5 20.5 24 18 Z" fill="#ffd873"/><rect x="16" y="33" width="16" height="3.4" rx="1.6" fill="#5a3a7a"/><circle cx="20" cy="36.8" r="1.2" fill="#ffb347"/><circle cx="24" cy="36.8" r="1.2" fill="#ff6a2a"/></svg>',
  battery: '<svg viewBox="0 0 48 48"><rect x="14" y="12" width="20" height="30" rx="3.4" fill="#2c3a28" stroke="#14301a" stroke-width="1.5"/><rect x="19" y="7" width="10" height="5" rx="1.6" fill="#8a97a8"/><rect x="17" y="16" width="14" height="10" rx="1.6" fill="#7be389"/><path d="M24 30 L21 36 L24 36 L22.6 41" stroke="#7be389" stroke-width="1.8" fill="none" stroke-linecap="round"/><text x="24" y="23.4" font-size="7" fill="#0d2414" text-anchor="middle">+</text></svg>',
  canned: '<svg viewBox="0 0 48 48"><defs><linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2c37c"/><stop offset="1" stop-color="#b87c2a"/></linearGradient></defs><rect x="15" y="12" width="18" height="26" rx="3" fill="url(#cg1)" stroke="#6e4a10" stroke-width="1.5"/><ellipse cx="24" cy="12" rx="9" ry="2.8" fill="#d8d2c0" stroke="#6e4a10" stroke-width="1.2"/><rect x="17" y="20" width="14" height="9" rx="1.6" fill="#e8e2f2"/><path d="M19.5 24.5 C21 22.5 23 23 24 24.5 C25 26 27 26 28.5 24.5" stroke="#c22a3a" stroke-width="1.4" fill="none"/><path d="M15 33 L33 33" stroke="#6e4a10" stroke-width="1.2"/></svg>',
  medkit: '<svg viewBox="0 0 48 48"><rect x="9" y="14" width="30" height="24" rx="4.4" fill="#e8e2e4" stroke="#8a3a3a" stroke-width="1.6"/><rect x="9" y="14" width="30" height="7" rx="3.4" fill="#c8384a"/><rect x="20" y="10" width="8" height="6" rx="2" fill="#8a97a8"/><path d="M24 22 L24 32 M19 27 L29 27" stroke="#c22a3a" stroke-width="3.4" stroke-linecap="round"/></svg>',
};

try {
  renderPeddlerStock = function () {
    const box = $('pdStock');
    if (!box) return;
    box.innerHTML = '';
    if (!state.peddler.here) { hidePeddlerPanel(); return; }
    for (const it of state.peddler.stock) {
      if (it.bought) continue;
      const r = it.bp ? BLUEPRINTS[it.id] : RARE[it.id];
      if (!r) continue;
      const el = document.createElement('div');
      el.className = 'pd-row31' + (state.coins < r.price ? ' poor' : '') + (it.bp ? ' bp31' : '');
      /* آیکون: مجموعهٔ SVG تازهٔ ۴۲ — وگرنه کانواس قدیمی */
      let ic = VICON42[it.id] || '';
      if (!ic) {
        try {
          const cv = document.createElement('canvas');
          paintGearIcon(it.id, cv);
          ic = '<img class="pd-ic31" alt="" src="' + cv.toDataURL() + '">';
        } catch (e) { ic = ''; }
      }
      const afford = state.coins >= r.price;
      el.innerHTML =
        '<span class="pd-ic42">' + ic + '</span>' +
        '<div class="pd-mid31">' +
          '<div class="pd-name31">' +
            (it.bp && typeof ICO !== 'undefined' ? '<i class="ic">' + ICO.ico('blueprint') + '</i> ' : '') +
            r.name + (it.fresh ? ' <em class="pd-new31">تازه!</em>' : '') +
          '</div>' +
          '<div class="pd-sub31">' + r.desc + '</div>' +
        '</div>' +
        '<div class="pd-buy31">' +
          '<span class="pd-price31"><i class="coin-ic"></i>' + faNum(Math.round(r.price * (MYST42.vendorDiscount() || 1))) + '</span>' +
          '<span class="pd-go42" style="' + (afford ? '' : 'color:#ff8a8a') + '">' + (afford ? 'دریافت ›' : 'سکه کم داری') + '</span>' +
        '</div>';
      el.addEventListener('click', () => buyRare(it));
      box.appendChild(el);
    }
    if (!box.children.length) { hidePeddlerPanel(); return; }
    try { drawPeddlerFace(); } catch (e) {}
    $('peddlerBox').classList.remove('hidden');
  };
} catch (e) {}

/* ==================================================================
   ۴۲-۵) سرنخ‌ها با کاربرد واقعی: پاداش‌های دائمی + شب‌نامه
   ================================================================== */
const MYST42 = {
  /* پاداش‌ها بر اساس تعداد سرنخ */
  tier(n) {
    if (n >= 14) return 4;
    if (n >= 10) return 3;
    if (n >= 6) return 2;
    if (n >= 3) return 1;
    return 0;
  },
  TIERS: [
    { n: 3,  name: 'چشم تیزبین',      desc: 'سکهٔ زامبی‌ها +۱۰٪' },
    { n: 6,  name: 'رابطهٔ دستفروش',  desc: 'قیمت کالاهای دستفروش −۱۰٪' },
    { n: 10, name: 'ترمیم شبانه',     desc: 'هر صبح برج ۸ جون ترمیم می‌شود' },
    { n: 14, name: 'مکشِ پروندهٔ Z',  desc: 'دمیج همهٔ سلاح‌ها +۶٪' },
  ],
  vendorDiscount() { return this.tier((MYST.clues || []).length) >= 2 ? 0.9 : 1; },
  coinMul() { return this.tier((MYST.clues || []).length) >= 1 ? 1.1 : 1; },
  dmgMul() { return this.tier((MYST.clues || []).length) >= 4 ? 1.06 : 1; },
};

try {
  const _ac42 = MYST.addClue.bind(MYST);
  MYST.addClue = function (icon, name, sub) {
    /* بدون تکرار اسم */
    if ((this.clues || []).some(c => c.name === name)) return null;
    const r = _ac42(icon, name, sub);
    try { this._badge42(); } catch (e) {}
    const t0 = MYST42.tier(this.clues.length), t1 = MYST42.tier(this.clues.length - 1);
    if (t1 > t0) {
      const T = MYST42.TIERS[t0];
      setAnnounce('🧩 پاداش پرونده فعال شد!', T.name + ' — ' + T.desc, 3.4);
      try { SFX.powerUp2(); } catch (e) {}
    } else {
      setAnnounce('🧩 سرنخ تازه', name, 2.4);
    }
    return r;
  };
  /* بخش سرنخ در روز: دکمه همیشه دیده شود (پاداش‌ها نمایش داده می‌شوند) */
  const _mu42 = MYST.update.bind(MYST);
  MYST.update = function (dt) {
    _mu42(dt);
    try {
      if (state.mode === 'day' && this._btn) this._btn.style.display = 'flex';
    } catch (e) {}
  };
  MYST._badge42 = function () {
    const em = document.getElementById('clueBadge32');
    if (!em) return;
    const n = this.clues.length;
    if (n > 0) { em.textContent = faNum(n); em.style.display = 'flex'; }
    else em.style.display = 'none';
  };
} catch (e) {}

/* سکهٔ بیشتر با پاداش سرنخ */
try {
  const _dc42 = dropCoins;
  dropCoins = function (z) {
    const before = state.coinsArr.length;
    _dc42(z);
    const added = state.coinsArr.length - before;
    if (added > 0 && MYST42.coinMul() > 1) {
      const extra = Math.round(added * (MYST42.coinMul() - 1));
      for (let i = 0; i < extra; i++) {
        state.coinsArr.push({ x: z.x, y: z.y - 18, vx: rand(-100, 100), vy: rand(-280, -140), phase: 'drop', t: 0, bounces: 0, flySpeed: 420, dead: false });
      }
    }
  };
  /* دمیج بیشتر با پاداش آخر */
  const _wd42 = weaponDmg;
  weaponDmg = function (w, extra) {
    let d = _wd42(w, extra);
    if (MYST42.dmgMul() > 1) d = Math.round(d * MYST42.dmgMul());
    return d;
  };
  /* ترمیم شبانه */
  const _ed42 = enterDay;
  enterDay = function () {
    const r = _ed42.apply(this, arguments);
    try {
      if (MYST42.tier((MYST.clues || []).length) >= 3 && state.tower.hp < state.tower.maxHp) {
        const heal = Math.min(8, state.tower.maxHp - state.tower.hp);
        if (heal > 0) {
          state.tower.hp += heal;
          setTimeout(() => { try { setAnnounce('🧩 ترمیم شبانه', 'پروندهٔ سرنخ‌ها برج را ' + faNum(heal) + ' جون ترمیم کرد', 2.4); } catch (e) {} }, 700);
        }
      }
    } catch (e) {}
    /* سرنخ‌های مسیر داستان — شب‌های شاخص */
    try {
      const w = state.wave | 0;
      const CL = {
        8: ['🏰', 'شبِ سقوطِ پارتی', 'پایان فصل ۱ — «پناهگاه، تله است»'],
        14: ['📻', 'فرکانسِ دره', 'از برج مخابراتی: «درهٔ شمالی» نشانه‌گذاری شده'],
        22: ['❄️', 'ردپای اسنوموبیل', 'مسیر برفی — کسی پیش از شما رد کرده'],
        30: ['📁', 'پروندهٔ Z — صفحهٔ ۱', '«فاز دوم... ایستگاه شمالی»'],
      };
      if (CL[w]) MYST.addClue(CL[w][0], CL[w][1], CL[w][2]);
    } catch (e) {}
    return r;
  };
  /* تخفیف دستفروش */
  const _br42 = buyRare;
  buyRare = function (it) {
    if (it && !it.bought && MYST42.vendorDiscount() < 1) {
      const r = it.bp ? BLUEPRINTS[it.id] : RARE[it.id];
      if (r && state.coins >= r.price) {
        const save42 = r.price;
        r.price = Math.round(save42 * MYST42.vendorDiscount());
        const out = _br42(it);
        setTimeout(() => { r.price = save42; }, 50);
        return out;
      }
    }
    return _br42(it);
  };
  /* جست‌وجوی محیط: گاهی سرنخ واقعی پیدا می‌شود */
  const _sc42 = MYST.scavenge.bind(MYST);
  MYST.scavenge = function () {
    if (state.mode !== 'day') return;
    if (this.scavengedWave === state.wave) { SFX.deny(); setAnnounce('امروز جست‌وجو کردی', 'فردا دوباره', 2); return; }
    this.scavengedWave = state.wave;
    const r = Math.random();
    this.closePanel();
    if (r < 0.36) {
      const c = Math.round((22 + Math.floor(rand(0, 26))) * MYST42.coinMul());
      state.coins += c;
      setAnnounce('📦 قراضه پیدا شد!', '+' + faNum(c) + ' سکه از میان آوار', 3);
      SFX.placeT();
    } else if (r < 0.64) {
      const heal = Math.min(22, state.tower.maxHp - state.tower.hp);
      state.tower.hp += heal;
      setAnnounce('💉 کمک‌های اولیه!', heal > 0 ? 'برج ' + faNum(Math.round(heal)) + ' جون گرفت' : 'برج سالم است', 3);
      SFX.placeT();
    } else if (r < 0.88) {
      setAnnounce('🚪 هیچی نبود', 'فقط خاک و سکوت... و صدایی که دور نیست', 3);
      SFX.deny();
    } else {
      const pool = [
        ['🗂', 'یادداشتِ سرگردان', '«اگه برج مخابراتی زنده بود، رادیو هم زنده‌ست»'],
        ['🔑', 'کِلیدِ زنگ‌زده', 'کلافی از کلید — یکی‌اش شماره‌دار بود'],
        ['📻', 'قطعهٔ بی‌سیم', 'یک ولومِ سوخته — فرکانسش روی بدنه حک شده'],
        ['🗺', 'نقشهٔ پاره', 'لبه‌اش نوشته: «پاسگاه شمالی»'],
      ];
      const c = pool[Math.floor(rand(0, pool.length))];
      MYST.addClue(c[0], c[1], c[2]);
      SFX.placeT();
    }
  };
} catch (e) {}

/* آرشیو سرنخ‌ها — نسخهٔ sheet34 با پاداش‌ها و شب‌نامه */
try {
  /* بازساخت باتن‌شیت با همان کلاس‌های CSS — shEl34 داخل IIFE است و در دسترس نیست */
  function shEl42(id, iconSvg, title, sub) {
    var old = document.getElementById(id);
    if (old) old.remove();
    var el = document.createElement('div');
    el.className = 'sheet34';
    el.id = id;
    el.innerHTML =
      '<div class="sh-grab34"></div>' +
      '<div class="sh-head34"><span class="sh-ic34">' + iconSvg + '</span>' +
      '<div class="sh-tx34"><b>' + title + '</b><span>' + sub + '</span></div>' +
      '<button class="sh-x34">✕</button></div>' +
      '<div class="sh-body34"></div>';
    el.querySelector('.sh-x34').addEventListener('click', function () { try { SFX.click(); } catch (e) {} try { closeSheet34(); } catch (e) {} });
    var wrap = document.getElementById('wrap');
    if (wrap) wrap.appendChild(el);
    return el;
  }
  function openSheet42(el) {
    var bk = document.getElementById('sheetBk34');
    if (!bk) { bk = document.createElement('div'); bk.id = 'sheetBk34'; $('wrap').appendChild(bk); }
    bk.classList.add('open');
    el.classList.add('open');
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('in34'); }); });
  }
  MYST.openArchive = function () {
    this.closePanel();
    try { window.closeSheet34(); } catch (e) {}
    var svgClue42 = (typeof SVG34 !== 'undefined' && SVG34 && SVG34.clue) ? SVG34.clue : '🧩';
    var el = shEl42('clueSheet34', svgClue42, 'پروندهٔ سرنخ‌ها', faNum(this.clues.length) + ' سرنخ — پاداش‌ها با جمع‌آوری فعال می‌شوند');
    var body = el.querySelector('.sh-body34');
    var av = this.avail();
    var h = '';
    /* شب‌نامهٔ فردا — بدان چه بیاید، همان بساز */
    try {
      var nw = (state.wave | 0) + 1;
      if (nw <= FINAL_WAVE && ['day', 'intermission', 'playing'].indexOf(state.mode) >= 0) {
        var q = buildWaveQueue(nw);
        var cnt = { normal: 0, fast: 0, tank: 0, boss: 0 };
        q.forEach(function (k) { cnt[k] = (cnt[k] || 0) + 1; });
        var comp = [];
        if (cnt.normal) comp.push(faNum(cnt.normal) + ' معمولی');
        if (cnt.fast) comp.push(faNum(cnt.fast) + ' تندپا');
        if (cnt.tank) comp.push(faNum(cnt.tank) + ' تانک');
        if (cnt.boss || nw === FINAL_WAVE) comp.push('هیولای آخر');
        var tip = 'مسلسل جلوی تندپاها را می‌گیرد';
        if (cnt.tank >= 3) tip = 'تانک زیاد — تک‌تیرانداز یا موشک‌انداز';
        else if (cnt.fast >= 5) tip = 'تندپا زیاد — برجک یخ‌زن کنار در';
        if (cnt.boss || nw === FINAL_WAVE) tip = 'همه‌چیز را خرج کن؛ فردا تعطیلی است!';
        h += '<div class="sh-sec34 gold"><i></i><span>شب‌نامهٔ فردا — شبِ ' + faNum(nw) + '</span><i></i></div>';
        h += '<div class="rc34 gold34" style="cursor:default"><span class="rc-ic34">🌙</span><div class="rc-tx34"><b>' + comp.join(' • ') + '</b><span>پیشنهاد: ' + tip + '</span></div></div>';
      }
    } catch (e) {}
    /* پاداش‌های پرونده */
    try {
      var tier = MYST42.tier(this.clues.length);
      h += '<div class="sh-sec34 gold"><i></i><span>پاداش‌های پرونده</span><i></i></div>';
      MYST42.TIERS.forEach(function (T, i) {
        var on = tier > i;
        h += '<div class="rc34' + (on ? ' gold34' : '') + '" style="' + (on ? '' : 'opacity:.62') + '"><span class="rc-ic34">' + (on ? '✓' : '🔒') + '</span>' +
          '<div class="rc-tx34"><b>' + T.name + '</b><span>' + (on ? 'فعال — ' : 'با ') + faNum(T.n) + ' سرنخ: ' + T.desc + '</span></div></div>';
      });
    } catch (e) {}
    /* شواهد */
    if (this.clues.length > 0) {
      h += '<div class="sh-sec34 gold"><i></i><span>شواهد</span><i></i></div>';
      var self = this;
      this.clues.forEach(function (c, i) {
        h += '<div class="rc34" style="cursor:default"><em class="rc-ic34" style="font-style:normal;color:#ffd873;font-size:calc(13px * var(--uiz,1));font-weight:900">' +
          faNum(String(i + 1).padStart(2, '0')) + '</em>' +
          '<span class="rc-ic34">' + c.icon + '</span>' +
          '<div class="rc-tx34"><b>' + c.name + '</b><span>' + c.sub + '</span></div></div>';
      });
    }
    /* معماهای فعال */
    if (av.length > 0) {
      h += '<div class="sh-sec34 gold"><i></i><span>معماها</span><i></i></div>';
      if (av.indexOf('radio') >= 0) h += '<button class="rc34 gold34" data-act="radio"><span class="rc-ic34">📻</span><div class="rc-tx34"><b>کوک کردن بی‌سیم</b><span>فرکانس ایستگاه شمال</span></div></button>';
      if (av.indexOf('code') >= 0) h += '<button class="rc34 gold34" data-act="code"><span class="rc-ic34">🔐</span><div class="rc-tx34"><b>قفل ایستگاه</b><span>کد ۴رقمی از سرنخ‌ها</span></div></button>';
      if (av.indexOf('fuse') >= 0) h += '<button class="rc34 gold34" data-act="fuse"><span class="rc-ic34">💡</span><div class="rc-tx34"><b>جعبه‌ی فیوز</b><span>وصل‌کردن سیم‌ها</span></div></button>';
    }
    /* بقا */
    h += '<div class="sh-sec34"><i></i><span>بقا</span><i></i></div>';
    h += '<button class="rc34" data-act="scav"><span class="rc-ic34">🔍</span><div class="rc-tx34"><b>جست‌وجوی محیط</b><span>روزی یک‌بار — سکه، مدکیت یا سرنخِ واقعی</span></div></button>';
    h += '<button class="rc34" data-act="molo"><span class="rc-ic34">🔥</span><div class="rc-tx34"><b>کوکتل مولوتوف</b><span id="moloCnt34">داردی: ' + faNum(this.molotovs) + ' از ۳</span></div><em class="rc-price34">۴۵</em></button>';
    h += '<button class="rc34" data-act="listen"><span class="rc-ic34">👂</span><div class="rc-tx34"><b>گوش بسپار</b><span>ضربان دشمن‌ها در مه</span></div></button>';
    if (this.clues.length === 0 && av.length === 0) {
      h = '<div class="rc34" style="cursor:default"><span class="rc-ic34">' + svgClue42 + '</span><div class="rc-tx34"><b>پرونده هنوز خالی است</b><span>جست‌وجوی محیط + گفتگو با دستفروش = سرنخ</span></div></div>' + h;
    }
    body.innerHTML = h;
    /* اکشن‌ها */
    body.querySelectorAll('[data-act]').forEach(function (b) {
      b.addEventListener('click', function () {
        var act = b.getAttribute('data-act');
        try { SFX.click(); } catch (e) {}
        if (act === 'radio') { closeSheet34(); try { MYST.openRadio(); } catch (e) {} }
        else if (act === 'code') { closeSheet34(); try { MYST.openCode(); } catch (e) {} }
        else if (act === 'fuse') { closeSheet34(); try { MYST.openFuse(); } catch (e) {} }
        else if (act === 'scav') { closeSheet34(); try { MYST.scavenge(); } catch (e) {} }
        else if (act === 'molo') {
          try {
            if (MYST.molotovs >= 3) { SFX.deny(); setAnnounce('مولوتوف پر است', 'حداکثر ۳ عدد', 1.2); return; }
            if (state.coins < 45) { SFX.deny(); setAnnounce('سکه کافی نیست', 'مولوتوف: ۴۵ سکه', 1.2); return; }
            state.coins -= 45;
            MYST.molotovs++;
            try { SFX.placeT(); } catch (e) {}
            var cnt = document.getElementById('moloCnt34');
            if (cnt) cnt.textContent = 'داردی: ' + faNum(MYST.molotovs) + ' از ۳';
            setAnnounce('🔥 مولوتوف ' + faNum(MYST.molotovs) + '/۳', '', 1);
            try { updateHUD(); } catch (e) {}
            try { moloBadge34(); } catch (e) {}
          } catch (e) {}
        }
        else if (act === 'listen') {
          try {
            if (MYST.listen.cd > 0) { setAnnounce('گوش خسته است', 'کمی صبر کن', 1.2); }
            else { MYST.startListen(); closeSheet34(); }
          } catch (e) {}
        }
      });
    });
  };
} catch (e) {}

/* ==================================================================
   ۴۲-۶) منوی سازنده — انتخاب مرحله برای تست
   ================================================================== */
(function devMenu42() {
  const css = document.createElement('style');
  css.textContent = `
    #devBtn42{position:absolute;left:10px;bottom:12px;z-index:64;display:flex;align-items:center;gap:6px;
      background:rgba(10,14,30,0.72);border:1px solid rgba(140,160,210,0.35);color:#cdd8f0;
      border-radius:999px;padding:7px 14px;font:600 12px Vazirmatn,Tahoma,sans-serif;backdrop-filter:blur(4px)}
    #devBtn42 .dot{width:7px;height:7px;border-radius:50%;background:#ffd873;box-shadow:0 0 8px #ffd873}
    #devSheet42{position:fixed;inset:0;z-index:220;display:flex;align-items:flex-end;justify-content:center;background:rgba(3,5,12,0.55)}
    #devSheet42.hidden{display:none}
    .dev-card42{width:min(430px,94%);background:#111628;border-radius:18px 18px 0 0;border:1px solid #2a3450;border-bottom:none;
      padding:14px 14px calc(16px + env(safe-area-inset-bottom));color:#e8eef8;font-family:Vazirmatn,Tahoma,sans-serif;
      max-height:76vh;overflow:auto}
    .dev-card42 h3{margin:2px 0 10px;font-size:16px;display:flex;align-items:center;gap:8px}
    .dev-card42 h3 em{font-size:10.5px;color:#9fb0d0;font-style:normal;background:#1c2440;border-radius:99px;padding:2px 8px}
    .dev-sec42{font-size:11px;color:#9fb0d0;margin:10px 2px 6px;letter-spacing:.4px}
    .dev-grid42{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .dev-btn42{display:flex;flex-direction:column;align-items:flex-start;gap:2px;background:#1a2138;border:1px solid #2c3858;
      color:#e8eef8;border-radius:12px;padding:10px 12px;font:600 13.5px Vazirmatn,Tahoma,sans-serif;text-align:right}
    .dev-btn42 small{font-weight:400;font-size:10.5px;color:#8fa0c0}
    .dev-btn42:active{background:#243056}
    .dev-btn42.gold{border-color:#8a6f2a;background:#2a2412}
    .dev-close42{width:100%;margin-top:12px;background:#2c3858;color:#e8eef8;border:none;border-radius:12px;padding:12px;font:700 14px Vazirmatn,Tahoma,sans-serif}
  `;
  document.head.appendChild(css);

  function make() {
    if (document.getElementById('devBtn42')) return;
    const b = document.createElement('button');
    b.id = 'devBtn42';
    b.innerHTML = '<span class="dot"></span> سازنده';
    b.addEventListener('click', () => { SFX.click(); openSheet(); });
    $('wrap').appendChild(b);
  }
  function openSheet() {
    closeSheet();
    const sh = document.createElement('div');
    sh.id = 'devSheet42';
    const ch = CHAPTERS.map((C, i) =>
      '<button class="dev-btn42" data-go="ch' + (i + 1) + '"><span>فصل ' + faNum(i + 1) + ' — ' + C.name + '</span><small>شبِ ' + faNum(WAVES_CH.slice(0, i).reduce((a, b2) => a + b2, 0) + 1) + '</small></button>'
    ).join('');
    sh.innerHTML = '<div class="dev-card42">' +
      '<h3>🛠 حالت سازنده <em>v42</em></h3>' +
      '<div class="dev-sec42">فصل‌ها — همه باز</div><div class="dev-grid42">' + ch + '</div>' +
      '<div class="dev-sec42">پرش سریع</div><div class="dev-grid42">' +
        '<button class="dev-btn42 gold" data-go="last"><span>شب آخر (۳۶)</span><small>هیولای آخر</small></button>' +
        '<button class="dev-btn42" data-go="end"><span>سینمایی پایان</span><small>ایستگاه شمالی</small></button>' +
      '</div>' +
      '<div class="dev-sec42">فصل میانی — پلتفرمر</div><div class="dev-grid42">' +
        '<button class="dev-btn42" data-go="pl1"><span>مرحله ۱</span><small>خرابه‌های شهر</small></button>' +
        '<button class="dev-btn42" data-go="pl2"><span>مرحله ۲</span><small>پل شکسته</small></button>' +
        '<button class="dev-btn42" data-go="pl3"><span>مرحله ۳</span><small>راه شمالی</small></button>' +
        '<button class="dev-btn42" data-go="gift"><span>هدیهٔ سازنده</span><small>+۶۰۰ سکه + همهٔ اسلحه‌ها</small></button>' +
      '</div>' +
      '<button class="dev-close42">بستن</button></div>';
    sh.addEventListener('click', (e) => {
      if (e.target === sh) { closeSheet(); return; }
      const b = e.target.closest('[data-go]');
      if (b) { SFX.click(); go(b.getAttribute('data-go')); }
      if (e.target.classList.contains('dev-close42')) { SFX.click(); closeSheet(); }
    });
    document.body.appendChild(sh);
  }
  function closeSheet() {
    const sh = document.getElementById('devSheet42');
    if (sh) sh.remove();
  }
  function go(k) {
    closeSheet();
    try {
      if (k === 'gift') {
        if (state.mode === 'start') { hideOverlays(); startGame(); }
        state.coins += 600;
        WEAPONS.shotgun.owned = true; WEAPONS.mg.owned = true;
        state.bps = state.bps || {};
        state.bps.tesla = state.bps.missile = state.bps.flame = true;
        updateHUD(); refreshBuildPanel();
        setAnnounce('🎁 هدیهٔ سازنده', '۶۰۰ سکه + شاتگان + مسلسل + هر سه نقشه', 3);
        saveGame();
        return;
      }
      if (k === 'pl1' || k === 'pl2' || k === 'pl3') {
        hideOverlays(); introHardReset(); transitionHardReset();
        startPlatformer(+k.slice(2));
        return;
      }
      if (k === 'end') {
        hideOverlays(); introHardReset(); transitionHardReset(); defeatHardReset();
        try { PLAT30.on = false; } catch (e) {}
        startEnding30();
        return;
      }
      if (k === 'last') {
        jumpCh(4, FINAL_WAVE - 1);
        setTimeout(() => { try { startNight(); } catch (e) {} }, 900);
        return;
      }
      if (k.indexOf('ch') === 0) jumpCh(+k.slice(2), null);
    } catch (e) { setAnnounce('خطا', String(e.message || e).slice(0, 60), 2); }
  }
  function jumpCh(ch, wave) {
    try { DLG.skip(); } catch (e) {}
    hideOverlays(); hideScreen('startScreen');
    introHardReset(); transitionHardReset(); defeatHardReset(); shelterHardReset();
    try { PLAT30.on = false; platPadShow(false); } catch (e) {}
    try { $('wrap').classList.remove('cine-mode'); } catch (e) {}
    try { $('skipCs').classList.add('hidden'); } catch (e) {}
    state.mode = 'day';
    startChapter(clamp(ch, 1, 4));
    if (wave) { state.wave = wave - 1; }
    window.DEV42 = { lastJump: k };
  }
  /* دکمه فقط در منوی اصلی دیده می‌شود */
  setInterval(() => {
    const b = document.getElementById('devBtn42');
    if (!b) { make(); return; }
    const show = (typeof state !== 'undefined') && state.mode === 'start';
    b.style.display = show ? 'flex' : 'none';
  }, 500);
})();

/* ==================================================================
   ۴۲-۷) پایان — تیزرِ Z پس از تیتراژ
   ================================================================== */
try {
  const _tbc42 = updateTbc40;
  updateTbc40 = function (dt) {
    _tbc42(dt);
    if (SHEL && SHEL.tbcDone && !SHEL.__z42tease) {
      SHEL.__z42tease = true;
      setTimeout(() => {
        try {
          VOICE.speak('آرش... هنوز نفهمیدی من کی‌ام. ولی جاده‌ی شمالی، راهِ منِه.', 'b', 'zb1');
        } catch (e) {}
        try {
          const el = document.getElementById('tbcTease');
          if (el) { el.textContent = '🎙 صدایی از رادیوی خراب...'; el.classList.add('z42'); }
        } catch (e) {}
        try { SFX.heartbeat(); } catch (e) {}
      }, 2600);
    }
  };
} catch (e) {}

/* CSS تیزر Z + ردیف قفسهٔ ۴۲ */
(function css42() {
  const st = document.createElement('style');
  st.textContent = `
    #tbcTease.z42{color:#ff8a8a!important;text-shadow:0 0 14px rgba(255,60,40,0.55);animation:z42flick 1.1s infinite}
    @keyframes z42flick{0%,100%{opacity:1}42%{opacity:.55}45%{opacity:1}78%{opacity:.7}}
    .pd-ic42{width:44px;height:44px;flex:0 0 44px;display:flex;align-items:center;justify-content:center;
      background:radial-gradient(circle at 34% 30%, #232c48, #12172a);border:1px solid #33406a;border-radius:11px}
    .pd-ic42 svg{width:36px;height:36px;display:block}
    .pd-go42{font-size:11.5px;color:#9fdcff;font-weight:700}
    .ev-card32.night42{border-color:#3a4a78;background:linear-gradient(180deg,#141b34,#101627)}
    .ev-card32.got42{border-color:#7a6a2a;background:linear-gradient(180deg,#1c1a10,#141208)}
    .ev-card32.locked42{opacity:.62}
  `;
  document.head.appendChild(st);
})();

/* نشان نسخه روی منو */
(function ver42() {
  const v = document.createElement('div');
  v.id = 'ver42';
  v.textContent = 'v42.0';
  v.style.cssText = 'position:absolute;right:12px;bottom:14px;z-index:64;color:rgba(160,175,205,0.55);font:600 10.5px Vazirmatn,Tahoma,sans-serif;pointer-events:none';
  document.getElementById('wrap').appendChild(v);
  setInterval(() => {
    const show = (typeof state !== 'undefined') && state.mode === 'start';
    v.style.display = show ? 'block' : 'none';
  }, 500);
})();

window.__V42 = { ped: PED42, myst: MYST42, zDraw: drawZ42 };
