/* ==================================================================
   «سه طبقه تا مرگ» v30.1 — ماژول ادغام (مکمل v4_ui30.js داک بالا)
   ------------------------------------------------------------------
   این فایل بعد از v4_ui30.js می‌آید و «رفع‌های نشست جاری» را روی
   معماریِ داکِ بالای صفحه سوار می‌کند (بدون دست‌زدن به آن):
   ۱) go-mode: در صفحه‌ی باخت/برد همه‌ی UI شناور بازی مخفی می‌شود —
      کوله دیگر روی دکمه‌های «تلاش دوباره/منوی اصلی» نمی‌افتد
   ۲) اختصاص متقابل داک ⟷ دستفروش: وقتی پنل خرید دستفروش باز است
      داک مخفی می‌شود (کلاس peddler-on) و برعکس — دیگر هیچ‌وقت
      «همه‌چیز با هم روی صفحه» نمی‌افتد
   ۳) text-size-adjust:100% — مقیاس فونت سیستم (سامسونگ/One UI)
      دیگر متن‌ها را از کادرها بیرون نمی‌پراند (در APK هم
      setTextZoom(100) ست شده)
   ۴) کوله‌پشتی کشویی: همیشه فقط قرص کوچک با شمارنده؛ با لمس،
      جاخالی‌ها در یک ردیف باریک کنارش باز می‌شوند — «نصف صفحه»
      دیگر وجود ندارد؛ شب که می‌شود خودش جمع می‌شود
   ۵) پیل «خرید از دستفروش» → شیار ۳ ستون چپ (جای مولوتوف که
      فقط شب‌هاست — این پیل فقط روزهاست → تداخل صفر)
   ۶) آیکون SVG شمشیر برای دکمه‌ی «شروع داستان» منو (data-ico)
   ================================================================== */

/* ---------- ۳۰م-۰) CSS ---------- */
(function css30m() {
  const st = document.createElement('style');
  st.textContent = `
/* ============ (۳۰٫۱) مرگ فونت‌بوستینگ اندروید ============ */
html, body, #wrap {
  -webkit-text-size-adjust: 100% !important;
  text-size-adjust: 100% !important;
}

/* ============ (۳۰٫۱) go-mode: باخت/برد — فقط کارت، بدون UI شناور ============ */
#wrap.go-mode #backpackBar, #wrap.go-mode #peddlerBox, #wrap.go-mode #pedReopenBtn,
#wrap.go-mode #wpnChips28, #wrap.go-mode #bpNight, #wrap.go-mode #buildPanel,
#wrap.go-mode #announce, #wrap.go-mode #listenBtn, #wrap.go-mode #molotovBtn,
#wrap.go-mode #bossBar, #wrap.go-mode #lockBadge { display: none !important; }

/* ============ (۳۰٫۱) دستفروش باز → داک مخفی (اختصاص متقابل) ============ */
#wrap.peddler-on #buildPanel { display: none !important; }

/* ============ (۳۰٫۱) کوله‌پشتی کشویی — قرص کوچک + ردیف باریک ============ */
#backpackBar {
  flex-direction: row !important;
  align-items: center !important;
  gap: calc(6px * var(--uiz,1)) !important;
  bottom: calc(10px * var(--uiz,1)) !important;
  left: calc(12px * var(--uiz,1)) !important;
  right: auto !important;
  transform: none !important;
  max-width: calc(304px * var(--uiz,1)) !important;
  z-index: 7 !important;
}
#backpackBar .bpk-cap {
  display: inline-flex !important;
  align-items: center !important;
  gap: calc(5px * var(--uiz,1)) !important;
  font-size: calc(12px * var(--uiz,1)) !important;
  font-weight: 900 !important;
  padding: calc(6px * var(--uiz,1)) calc(11px * var(--uiz,1)) !important;
  border-radius: calc(12px * var(--uiz,1)) !important;
  cursor: pointer !important;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
#bpkSlots {
  display: none !important;
  gap: calc(4px * var(--uiz,1)) !important;
  flex-wrap: nowrap !important;
  max-width: calc(262px * var(--uiz,1)) !important;
  overflow-x: auto !important;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}
#backpackBar.open30 #bpkSlots { display: flex !important; }
#backpackBar.compact #bpkSlots { display: none !important; }
.bpk-slot {
  width: calc(38px * var(--uiz,1)) !important;
  height: calc(38px * var(--uiz,1)) !important;
  border-radius: calc(10px * var(--uiz,1)) !important;
  border: 1.5px solid rgba(94,124,196,.5) !important;
  box-shadow: none !important;
  flex: none !important;
}
.bpk-slot canvas { width: calc(33px * var(--uiz,1)) !important; height: calc(33px * var(--uiz,1)) !important; }
.bpk-slot.ready { border-color: rgba(105,211,137,.85) !important; }
.bpk-slot.empty { opacity: .45; }
.bpk-slot:active { transform: scale(.92) !important; }

/* ============ (۳۰٫۱) پیل «خرید از دستفروش» — شیار ۳ ستون چپ ============
   فقط روزها دیده می‌شود؛ مولوتوفِ همان شیار فقط شب‌ها → تداخل صفر.
   کوله‌ی پایین-چپ هم دیگر هیچ برخوردی ندارد. */
#pedReopenBtn {
  top: calc(222px * var(--uiz,1)) !important;
  padding: calc(7px * var(--uiz,1)) calc(11px * var(--uiz,1)) !important;
  font-size: calc(12px * var(--uiz,1)) !important;
  gap: calc(6px * var(--uiz,1)) !important;
}
#pedReopenBtn .ic { font-size: calc(17px * var(--uiz,1)) !important; }

/* ============ (۳۰٫۱) دستفروش — ردیف‌های جادار (هیچ متنی روی چیزی نمی‌افتد) ============ */
.pd-item {
  padding: calc(10px * var(--uiz,1)) calc(11px * var(--uiz,1)) !important;
  margin-top: calc(10px * var(--uiz,1)) !important;
  gap: calc(10px * var(--uiz,1)) !important;
  align-items: flex-start !important;
}
.pd-item .pd-name { line-height: 1.7 !important; margin-bottom: calc(2px * var(--uiz,1)); }
.pd-item .pd-sub { line-height: 1.8 !important; margin-top: calc(3px * var(--uiz,1)) !important; }
.pd-item .pd-price { margin-top: calc(8px * var(--uiz,1)) !important; }

/* ============ (۳۰٫۱) آیکون‌های SVG دکمه‌های منو ============ */
.m23-ico svg { width: calc(29px * var(--uiz,1)); height: calc(29px * var(--uiz,1)); }
.m23-small .m23-ico svg { width: calc(22px * var(--uiz,1)); height: calc(22px * var(--uiz,1)); }
`;
  document.head.appendChild(st);
})();

/* ---------- ۳۰م-۱) آیکون شمشیرِ «شروع داستان» (data-ico) ---------- */
(function icons30m() {
  try {
    if (typeof ICO === 'undefined' || !ICO.I) return;
    const S = (inner) =>
      '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
    ICO.I.sword30 = S(
      '<path d="M14.5 3.5l4.2 1-1 4.2-8.4 8.4-3.2-3.2z"/>' +
      '<path d="M6.1 17.9l-2.1 2.1M8.2 15.8l-2.1 2.1"/>' +
      '<path d="M13 8.5l3 3"/>' +
      '<path d="M17 14c-1.4 1-3 1.4-4.6 1.1-.3-1.6.1-3.2 1.1-4.6" opacity=".65"/>'
    );
  } catch (e) {}
})();

/* ---------- ۳۰م-۲) راه‌اندازی بعد از لود کامل (بعد از setup30 داک) ---------- */
function setup30m() {
  try { gomode30m(); } catch (e) {}
  try { exclusivity30m(); } catch (e) {}
  try { backpack30m(); } catch (e) {}
}

/* go-mode: صفحه‌ی باخت/برد بدون هیچ UI شناور بازی */
function gomode30m() {
  const GO_IDS = ['gameoverScreen', 'victoryScreen'];
  if (typeof showScreen === 'function' && !showScreen.__30m) {
    const _s = showScreen;
    showScreen = function (id) {
      const r = _s.apply(this, arguments);
      try {
        if (GO_IDS.indexOf(id) >= 0) {
          const w = document.getElementById('wrap');
          if (w) w.classList.add('go-mode');
          const bar = document.getElementById('backpackBar');
          if (bar) bar.classList.remove('open30');
        }
      } catch (e) {}
      return r;
    };
    showScreen.__30m = true;
  }
  if (typeof hideScreen === 'function' && !hideScreen.__30m) {
    const _h = hideScreen;
    hideScreen = function (id) {
      const r = _h.apply(this, arguments);
      try {
        if (GO_IDS.indexOf(id) >= 0) {
          const w = document.getElementById('wrap');
          if (w) w.classList.remove('go-mode');
        }
      } catch (e) {}
      return r;
    };
    hideScreen.__30m = true;
  }
}

/* اختصاص متقابل: داک ساخت‌وساز ⟷ پنل دستفروش (کلاس peddler-on) */
function exclusivity30m() {
  /* پنل دستفروش باز می‌شود → داک مخفی + اگر تابع شیت هنوز هست، جمعش کن */
  if (typeof renderPeddlerStock === 'function' && !renderPeddlerStock.__30m) {
    const _r = renderPeddlerStock;
    renderPeddlerStock = function () {
      try {
        const w = document.getElementById('wrap');
        if (w) w.classList.add('peddler-on');
        if (typeof setBuildPanel === 'function') setBuildPanel(true, true);
      } catch (e) {}
      return _r.apply(this, arguments);
    };
    renderPeddlerStock.__30m = true;
  }
  /* پنل دستفروش بسته می‌شود → داک برگردد */
  if (typeof hidePeddlerPanel === 'function' && !hidePeddlerPanel.__30m) {
    const _h = hidePeddlerPanel;
    hidePeddlerPanel = function () {
      try {
        const w = document.getElementById('wrap');
        if (w) w.classList.remove('peddler-on');
      } catch (e) {}
      return _h.apply(this, arguments);
    };
    hidePeddlerPanel.__30m = true;
  }
  /* داک باز می‌شود → پنل دستفروش بسته شود */
  if (typeof setBuildPanel === 'function' && !setBuildPanel.__30m) {
    const _sb = setBuildPanel;
    setBuildPanel = function (c, s) {
      const r = _sb.apply(this, arguments);
      try {
        if (!c && typeof hidePeddlerPanel === 'function') hidePeddlerPanel();
      } catch (e) {}
      return r;
    };
    setBuildPanel.__30m = true;
  }
}

/* کوله‌پشتی کشویی: قرص همیشه؛ جاخالی‌ها با لمس — شب خودش جمع می‌شود */
function backpack30m() {
  const bar = document.getElementById('backpackBar');
  if (!bar || bar.__30m) return;
  bar.__30m = true;
  bar.addEventListener('click', (e) => {
    if (e.target.closest('.bpk-slot')) return;        /* ضربه به جاخالی = مصرف وسیله */
    if (bar.classList.contains('compact')) return;     /* خالی است */
    try { if (typeof SFX !== 'undefined' && SFX.click) SFX.click(); } catch (err) {}
    bar.classList.toggle('open30');
  });
  if (typeof startNight === 'function' && !startNight.__30m) {
    const _n = startNight;
    startNight = function () {
      try { bar.classList.remove('open30'); } catch (e) {}
      return _n.apply(this, arguments);
    };
    startNight.__30m = true;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setup30m, { once: true });
} else {
  setup30m();
}
