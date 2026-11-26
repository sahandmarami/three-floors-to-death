'use strict';
/* ==================================================================
   سه طبقه تا مرگ — ماژول فروشندهٔ مرموز ۴۴٫۰ (پنج ملاقاتِ داستانی)
   ==================================================================
   · ملاقات‌ها بعد از شب‌های ۲/۱۰/۱۸/۲۷/۳۴ — هر کدام سرنخِ خودش را دارد
   · یک شخصیت واحد با پنج نقاب؛ قطب‌نمای عتیقه = نشانهٔ ثابت هویت
   · ضدتکرار: هر ملاقات با «شمارهٔ شب» کلید می‌خورد و فقط یک‌بار اجرا می‌شود
   · چهره و فیگور از اسپرایت‌های اختصاصی ASSETS44 (در نبودِ asset → کانواس)
   ================================================================== */

/* ---------- ۱) دیالوگ ملاقات‌ها ---------- */
const M44 = {
  /* look: 0 = ظاهر کلاسیک کانواس؛ 1..4 = اسپرایت‌های اختصاصی کاربر */
  1: { look: 0, ids: ['M1_01', 'M1_02', 'M1_03'], farewell: { v: 'pd1i1', t: 'کالای دست اول! بخر، شاید دومی هم باشه.', who: 'd1' } },
  2: { look: 1, ids: ['M2_01', 'M2_02', 'M2_03', 'M2_04'], farewell: { v: 'pmh4', t: 'من فقط می‌فروشم. سؤال، گرون‌تره.', who: 'd2' } },
  3: { look: 2, ids: ['M3_01', 'M3_02', 'M3_03', 'M3_04'], farewell: { v: 'pmh5', t: 'یه روز می‌فهمی چرا همیشه قبل از غروب می‌رم.', who: 'd3' } },
  4: { look: 3, ids: ['M4_01', 'M4_02', 'M4_03', 'M4_04'], farewell: { v: 'w44m4e', t: 'قبل از طلوع می‌رم. همیشه قبل از طلوع.', who: 'd4' } },
  5: { look: 4, ids: ['M5_01', 'M5_02', 'M5_03', 'M5_04'], farewell: { v: 'w44m5e', t: 'چهارفصل همراهی کردم. آخرین قطعه هم رسید. خدا نگهدارت، آرش.', who: 'd5' } },
};

/* نام‌گذاری چهره‌ها مطابق اسپرایت‌های واقعی */
try {
  Object.assign(DLG_WHO, {
    d1: { name: 'شنل‌پوشِ مرموز',        color: '#d8a3ff' },
    d2: { name: 'آقای کلاه‌لقمه‌ای',     color: '#e8c9a0' },
    d3: { name: 'پیرمردِ خنده‌رو',        color: '#a8d8c0' },
    d4: { name: 'ماسکِ پرنده',            color: '#ffe86e' },
    d5: { name: 'ستاره‌بازِ چرخ‌دسته',    color: '#c8b8e8' },
  });
} catch (e) {}

/* ثبت در رجیستری مرکزی */
D44('M1_01', 1, 2, 'd1', 'w44m1a', 'تازه‌واردی، نه؟ این برج رو منم می‌شناختم — مالِ بانک بود. آنتش رو کی زدی بالا؟', 'ملاقات ۱', 'normal');
D44('M1_02', 1, 2, 'p',  'w44m1b', 'خودم؛ از قطعاتِ پشت‌بام. چرا می‌پرسی؟', 'ملاقات ۱', 'normal');
D44('M1_03', 1, 2, 'd1', 'w44m1c', 'هیچی. فقط... آنتنت رو ببو. داغه؟ هر چی داغ‌تره، «مهمون»‌هات بیشترن.', 'سرنخ: آنتن دعوت‌کننده', 'normal');
D44('M2_01', 2, 10, 'd2', 'w44m2a', 'قربونت برم پسرم! بازم کاوه از راه رسید، مثل کبوترِ بارِن!', 'ملاقات ۲', 'normal');
D44('M2_02', 2, 10, 'p',  'w44m2b', 'چهره‌ات عوض شده ولی قطب‌نمات همونه. تو کی هستی؟', 'پرسش هویت', 'worried');
D44('M2_03', 2, 10, 'd2', 'w44m2c', 'یه سرنخِ نقدی بهت می‌دم: 104.5 فقط عدد نیست؛ «آهنگشه». گوشِ خوش داشته باش.', 'سرنخ پازل ۱', 'normal');
D44('M3_01', 3, 18, 'd3', 'w44m3a', 'برف و آژیر... این حوالی رو می‌شناختم. سال‌ها این‌جا سرِ کار بودم.', 'ملاقات ۳', 'normal');
D44('M3_02', 3, 18, 'd3', 'w44m3b', 'جدولِ هفتگی داریم؛ مثل برنامهٔ اتوبوس. بعضی شب‌ها «بادِ» سخت‌تره.', 'سرنخ: چرتکهٔ خودکار', 'normal');
D44('M3_03', 3, 18, 'p',  'w44m3c', '«ما»؟ گفتی «جدول داریم». کی‌این «ما»؟', 'پرسش', 'worried');
D44('M3_04', 3, 18, 'd3', 'w44m3d', '...نمی‌دونم چی گفتم. بخر دیگه.', 'فرار از سؤال', 'normal');
D44('M4_01', 4, 27, 'd4', 'w44m4a', 'این‌جا رو خوب ساختید... کاش همه‌چیز با همین وسواس ساخته می‌شد.', 'ملاقات ۴', 'normal');
D44('M4_02', 4, 27, 'p',  'w44m4b', 'جدولِ هفتگی رو تو نوشتی. تو پروژه بودی. بگو!', 'رو در رو', 'angry');
D44('M4_03', 4, 27, 'd4', 'w44m4c', 'من جدول رو نوشتم؛ نه جوابش رو. کاوه از آینده خبر نمیاره، از «برنامه» خبر داره.', 'اعتراف فروشنده', 'sad');
D44('M4_04', 4, 27, 'd4', 'w44m4d', 'قطب‌نما رو ببین؟ مالِ پدرمه. تنها چیزی که هیچ‌وقت عوض نشد.', 'نشانهٔ ثابت', 'hopeful');
D44('M5_01', 4, 34, 'd5', 'w44m5a', 'آخرین بارمه که می‌بینمت، آرش. تصمیمِ بزرگ نزدیکه.', 'ملاقات ۵', 'normal');
D44('M5_02', 4, 34, 'p',  'w44m5b', 'حقیقت رو بگو: مختصاتِ برج از کجا اومد؟', 'پرسش بزرگ', 'worried');
D44('M5_03', 4, 34, 'd5', 'w44m5c', 'از آسمون نیومد. از شبکه پخش شد، شبِ سقوط. یکی با بی‌سیمِ شبکه پخشش کرد.', 'سرنخ ارشان', 'normal');
D44('M5_04', 4, 34, 'd5', 'w44m5d', 'حالا برو انتخابت رو بکن. و به دوستت شک نکن — به خودت.', 'راهنمایی پایانی', 'normal');

/* ---------- ۲) فراخوانیِ گارانتی‌شده در شب‌های ملاقات ---------- */
(function () {
  const _roll = peddlerRoll;
  peddlerRoll = function (force) {
    const N = NIGHTS[state.wave | 0];
    if (N && N.merchant && state.mode === 'day' && !DEC44.played['M_N' + state.wave]) {
      DEC44.played['M_N' + state.wave] = true;
      const enc = M44[N.merchant];
      _roll(true);
      try { PED.look = enc.look; } catch (e) {}
      try { PED._enc44 = N.merchant; } catch (e) {}
      return;
    }
    _roll(force);
  };
})();

/* ---------- ۳) گفت‌وگوی ملاقات → سپس فروشگاه ---------- */
try {
  const _pedOpen44 = PED.openShop.bind(PED);
  PED.talk = function () {
    const encIdx = this._enc44;
    /* اگر دیالوگِ داستانیِ شب فعال است — صبر تا تمام‌شدن (بدون تعارض) */
    if (encIdx && M44[encIdx] && !this._encDone44 && DLG.active) {
      setTimeout(() => { try { if (PED.active && PED._enc44) PED.talk(); } catch (e) {} }, 1600);
      return;
    }
    if (encIdx && M44[encIdx] && !this._encDone44) {
      this.phase = 'talk';
      const enc = M44[encIdx];
      const lines = R44(enc.ids);
      const who = 'd' + (encIdx);                    /* d1..d5 — نقشِ همان ملاقات */
      lines.forEach(l => { l.who = who; });
      DLG.start(lines, () => {
        this._encDone44 = true;
        this._enc44 = null;
        if (this.phase === 'talk') _pedOpen44();
      });
      return;
    }
    /* ملاقات‌های تصادفی عادی → موتور قدیمی (v40/v42) */
    this.phase = 'talk';
    const who = 'd' + (this.look + 1);
    const visit = Math.max(1, state.peddler.visits | 0);
    const lines = [];
    if (visit === 1) lines.push({ who: 'd1', v: 'pdf1', text: 'تازه‌واردی، نه؟ اولین بار همیشه سخته. بخر، شاید دومی هم باشه.' });
    const B = (typeof PED30_BANKS !== 'undefined') ? PED30_BANKS[this.look % PED30_BANKS.length] : null;
    if (B) {
      lines.push({ who, v: B.intro[(visit - 1) % B.intro.length].v, text: B.intro[(visit - 1) % B.intro.length].t });
      if (typeof PED30_DOUBTS !== 'undefined') {
        const doubt = PED30_DOUBTS[(visit - 1) % PED30_DOUBTS.length];
        lines.push({ who: 'p', v: doubt.v, text: doubt.t });
        lines.push({ who, v: B.ans[(visit - 1) % B.ans.length].v, text: B.ans[(visit - 1) % B.ans.length].t });
      }
    }
    if (!lines.length) { _pedOpen44(); return; }
    try { if (typeof VOICE !== 'undefined') VOICE.pedTweak = null; } catch (e) {}
    try { DLG.start(lines, () => { if (PED.phase === 'talk') _pedOpen44(); }); } catch (e) { _pedOpen44(); }
  };
  /* خداحافظی ملاقات‌های داستانی */
  const _pedLeave44 = PED.leave.bind(PED);
  PED.leave = function (farewell) {
    if (this.active && this._enc44 && this.phase !== 'leave' && farewell !== false) {
      const enc = M44[this._enc44];
      try { VOICE.speak(enc.farewell.t, enc.farewell.who, enc.farewell.v); } catch (e) {}
    }
    _pedLeave44(farewell);
  };
} catch (e) { console.warn('[v44] merchant hook failed', e); }

/* ---------- ۴) فیگور فروشنده با اسپرایت واقعی ---------- */
try {
  const _fig44 = drawPeddlerFig;
  drawPeddlerFig = function (x, y, phase, walkT, t, look, face) {
    const spr = ASSETS44 && ASSETS44.merchantWalk && ASSETS44.merchantWalk[look % 5];
    if (!spr || !spr.length) { _fig44(x, y, phase, walkT, t, look, face); return; }
    const moving = phase === 'enter' || phase === 'leave';
    const fi = moving ? Math.floor(walkT * 8) % spr.length : 0;
    const bob = moving ? Math.abs(Math.sin(walkT * 6)) * 2.2 : Math.sin(t * 1.8) * 1.1;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(0, 2, 16, 4.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.translate(0, -bob);
    ctx.scale(face > 0 ? 1 : -1, 1);
    const img = spr[fi];
    if (img && img.complete && img.naturalWidth) {
      const h = 64, w2 = h * (img.naturalWidth / img.naturalHeight);
      ctx.drawImage(img, -w2 / 2, -h, w2, h);
    }
    /* قطب‌نمای عتیقه — نشانهٔ ثابت هویت */
    ctx.scale(face > 0 ? 1 : -1, 1);
    ctx.fillStyle = '#c9a55a';
    circle(9, -34 + Math.sin(t * 1.8) * 1.1, 3.2);
    ctx.strokeStyle = '#8a6a2e'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(9, -34 + Math.sin(t * 1.8) * 1.1, 3.2, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  };
} catch (e) {}

/* ---------- ۵) چهرهٔ پنل فروشگاه با پرترهٔ واقعی ---------- */
try {
  const _face44 = drawPeddlerFace;
  drawPeddlerFace = function () {
    const cv = document.getElementById('peddlerFace');
    if (!cv || !ASSETS44 || !ASSETS44.merchantCard) { _face44(); return; }
    const look = (PED.look | 0) % 5;
    const img = ASSETS44.merchantCard[look];
    if (!img || !img.complete || !img.naturalWidth) { _face44(); return; }
    const c = cv.getContext('2d');
    const S = cv.width;
    c.clearRect(0, 0, S, S);
    /* پس‌زمینهٔ قاب */
    const bg = c.createRadialGradient(S / 2, S * 0.42, 8, S / 2, S / 2, S * 0.62);
    bg.addColorStop(0, 'rgba(40,46,64,0.95)'); bg.addColorStop(1, 'rgba(12,14,22,0.98)');
    c.fillStyle = bg;
    c.beginPath(); c.arc(S / 2, S / 2, S * 0.48, 0, Math.PI * 2); c.fill();
    /* پرتره — پوشاندن با clip دایره‌ای */
    c.save();
    c.beginPath(); c.arc(S / 2, S / 2, S * 0.46, 0, Math.PI * 2); c.clip();
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const k = (S * 0.92) / Math.max(iw, ih);
    c.drawImage(img, S / 2 - iw * k / 2, S / 2 - ih * k / 2 + S * 0.02, iw * k, ih * k);
    c.restore();
    /* حلقهٔ قطب‌نما در گوشه — امضای هویت */
    c.strokeStyle = 'rgba(201,165,90,0.85)'; c.lineWidth = 2;
    c.beginPath(); c.arc(S * 0.82, S * 0.80, S * 0.07, 0, Math.PI * 2); c.stroke();
    c.fillStyle = 'rgba(201,165,90,0.9)';
    c.beginPath();
    c.moveTo(S * 0.82, S * 0.80 - S * 0.045);
    c.lineTo(S * 0.835, S * 0.80);
    c.lineTo(S * 0.82, S * 0.845);
    c.lineTo(S * 0.805, S * 0.80);
    c.closePath(); c.fill();
  };
} catch (e) {}

/* ---------- ۶) پاک‌سازی per-night ---------- */
try {
  const _hp44 = hidePeddlerPanel;
  hidePeddlerPanel = function () { _hp44(); };
} catch (e) {}

window.__V44_MERCHANT = M44;
console.log('[v44] merchant module ready — 5 encounters');
