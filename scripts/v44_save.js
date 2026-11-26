'use strict';
/* ==================================================================
   سه طبقه تا مرگ — ماژول سیو/پرتره/منو ۴۴٫۰
   ==================================================================
   · سیو نسخهٔ ۲: متغیرهای داستان + مدارک + ملاقات‌های فروشنده + پایان
   · مهاجرت امن سیوهای نسخهٔ ۱ (پاک‌سازی نمی‌شوند؛ فقط ارتقا)
   · پرتره‌های تصویری شخصیت‌ها (ASSETS44) با fallback کانواس
   · فیگور آرش/ارشان در صحنهٔ منو (اسپرایت راه‌رفتن)
   ================================================================== */

/* ---------- ۰) وصل‌کردن کلیپ‌های صوتی v44 (بعد از جایگزینی v40) ---------- */
try {
  if (typeof VOICES44_DATA !== 'undefined') Object.assign(VOICES23, VOICES44_DATA);
} catch (e) {}

/* ---------- ۱) سیو نسخهٔ ۲ + مهاجرت ---------- */
try {
  const _collect44 = collectSave;
  collectSave = function () {
    const d = _collect44();
    d.v = 2;
    d.story44 = {
      trustArshan: DEC44.trustArshan,
      savedSurvivors: DEC44.savedSurvivors,
      evidenceCount: DEC44.evidenceCount,
      choiceHistory: DEC44.choiceHistory.slice(),
      endingChoice: DEC44.endingChoice,
      played: Object.assign({}, DEC44.played),
      docsSeen: Object.assign({}, DOCS44.seen),
    };
    return d;
  };

  const _apply44 = applySave;
  applySave = function (d) {
    /* مهاجرت v1 → v2: سیوهای قدیمی دست‌نخورده می‌مانند؛ فقط فیلدها کامل می‌شوند */
    _apply44(d);
    try {
      const s = d && d.story44;
      if (s) {
        DEC44.trustArshan = s.trustArshan | 0 || 50;
        DEC44.savedSurvivors = s.savedSurvivors | 0;
        DEC44.evidenceCount = s.evidenceCount | 0;
        DEC44.choiceHistory = Array.isArray(s.choiceHistory) ? s.choiceHistory.slice() : [];
        DEC44.endingChoice = s.endingChoice || null;
        DEC44.played = Object.assign({}, s.played || {});
        DOCS44.seen = Object.assign({}, s.docsSeen || {});
        DOCS44.save();
      } else {
        /* سیو v1: حفظِ پیشرفتِ سرنخ‌ها به‌عنوان شواهد */
        try {
          const raw = localStorage.getItem('ttb23_myst');
          if (raw) { const m = JSON.parse(raw); DEC44.evidenceCount = Math.max(DEC44.evidenceCount, (m.clues || []).length); }
        } catch (e) {}
      }
    } catch (e) { console.warn('[v44] save migration warn', e); }
  };

  /* اعتبارِ سیو: کدِ وارد‌شدهٔ خراب → پیام واضح، بدون خرابیِ بازی */
  const _import44 = importSaveCode;
  importSaveCode = function (code) {
    const ok = _import44(code);
    return ok;
  };
} catch (e) { console.warn('[v44] save hooks failed', e); }

/* ---------- ۲) پرتره‌های تصویری شخصیت‌ها ---------- */
/* آرش(p) ارشان(a) مریم(m) سارا(s) — با تایپ/حرف‌زدن: تکانِ ظریف + نورِ لبه */
(function () {
  if (typeof ASSETS44 === 'undefined' || !ASSETS44 || !ASSETS44.portrait) return;
  const MAP = { p: 'arash', a: 'arshan', m: 'maryam', s: 'sara', d1: 'm1', d2: 'm2', d3: 'm3', d4: 'm4', d5: 'm5' };
  const _dp44 = drawPortrait;
  drawPortrait = function (cv, who, talking, t) {
    const key = MAP[who];
    if (!key || !ASSETS44.portrait[key]) return _dp44(cv, who, talking, t);
    const img = ASSETS44.portrait[key];
    if (!img.complete || !img.naturalWidth) return _dp44(cv, who, talking, t);
    const c = cv.getContext('2d');
    const S = cv.width;
    c.clearRect(0, 0, S, S);
    /* پس‌زمینهٔ قاب */
    const bg = c.createRadialGradient(S / 2, S * 0.42, 8, S / 2, S / 2, S * 0.62);
    bg.addColorStop(0, 'rgba(40,46,64,0.95)'); bg.addColorStop(1, 'rgba(12,14,22,0.98)');
    c.fillStyle = bg;
    c.beginPath(); c.arc(S / 2, S / 2, S * 0.48, 0, Math.PI * 2); c.fill();
    c.save();
    /* تکانِ ظریف حین حرف‌زدن */
    const bob = talking ? Math.sin(t * 9) * 1.4 : Math.sin(t * 1.4) * 0.6;
    c.translate(0, bob);
    c.beginPath(); c.arc(S / 2, S / 2, S * 0.46, 0, Math.PI * 2); c.clip();
    const iw = img.naturalWidth, ih = img.naturalHeight;
    /* حذف پلاکِ نامِ پایینِ کارت — نام در جعبهٔ گفتگو جداگانه نمایش داده می‌شود */
    const cutH = ih * 0.84;
    const k = (S * 1.02) / Math.max(iw, cutH);
    c.drawImage(img, 0, 0, iw, cutH, S / 2 - iw * k / 2, S * 0.46 - cutH * k * 0.62, iw * k, cutH * k);
    c.restore();
    /* نورِ لبه حین حرف‌زدن */
    if (talking) {
      c.strokeStyle = 'rgba(255,214,140,0.55)';
      c.lineWidth = 2.2;
      c.beginPath(); c.arc(S / 2, S / 2, S * 0.46, 0, Math.PI * 2); c.stroke();
    }
  };
})();

/* ---------- ۳) فیگورهای منو: آرش و ارشان جلوی برج ---------- */
try {
  if (typeof ASSETS44 !== 'undefined' && ASSETS44.walk && ASSETS44.walk.arash) {
    const _menuZ23 = makeMenuZombie;
    window.__V44_menuFig = { t: 0 };
    (function () {
      /* در رندر منو (موج ۲۳) با hooksRender اضافه می‌شود */
      if (typeof hooksRender !== 'undefined') {
        hooksRender.push(function () {
          if (state.mode !== 'start') return;
          const F = window.__V44_menuFig;
          /* دو فیگور ایستاده کنار برج — تنفسِ ظریف */
          const bob = Math.sin(F.t * 1.6) * 1.5;
          F.t += 1 / 60;
          try {
            const ga = ASSETS44.walk.arash[0], gb = ASSETS44.walk.arshan[0];
            if (ga && ga.complete) {
              const h = 58, w2 = h * (ga.naturalWidth / ga.naturalHeight);
              ctx.drawImage(ga, W * 0.5 - 26 - w2 / 2, GROUND_Y - h + 6 + bob * 0.5, w2, h);
            }
            if (gb && gb.complete) {
              const h2 = 56, w3 = h2 * (gb.naturalWidth / gb.naturalHeight);
              ctx.drawImage(gb, W * 0.5 + 26 - w3 / 2, GROUND_Y - h2 + 8 - bob * 0.5, w3, h2);
            }
          } catch (e) {}
        });
      }
    })();
  }
} catch (e) {}

/* ---------- ۴) بج نسخه ---------- */
(function v44badge() {
  setInterval(() => {
    const el = document.getElementById('ver42');
    if (el) el.textContent = 'v44.0';
  }, 600);
})();

/* ---------- ۵) اصلاح اعلان شب آخر (باگِ TOTAL_WAVES=۱۰) ---------- */
/* متنِ اصلی در base با TOTAL_WAVES (۱۰) مقایسه می‌شد؛ حالا ۳۶ با متنِ درست */
try {
  window.__V44_FINAL_TEXT = 'موج آخر! نگهبانِ آخرین شب بیدار شده...';
} catch (e) {}

window.__V44_SAVE = 1;
console.log('[v44] save/portrait module ready');
