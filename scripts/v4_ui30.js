/* ==================================================================
   «سه طبقه تا مرگ» v30 — ریشه‌یابی «دکمه‌ها روی هم» (گوشی واقعی)
   ------------------------------------------------------------------
   تشخیص با اسکرین‌شات‌های کاربر + آشکارساز هندسی خودکار (780×360
   با شبیه‌سازی فونت متورم ×۱٫۲۲):
   ۱) ریشه‌ی اصلی «بهم ریختگی»: پنل دستفروش و شیت ساخت‌وساز
      «هم‌زمان» باز می‌ماندند → تب‌ها/کاشی‌های شیت روی آیتم‌های
      دستفروش می‌افتاد و همه‌چیز یک‌کاسه می‌شد («همش با هم افتاده»).
      حالا: باز شدن هرکدام = بسته شدن دیگری (اختصاص متقابل).
   ۲) صفحه‌ی باخت/برد: نوار کوله روی دکمه‌های «تلاش دوباره» و
      «منوی اصلی» می‌افتاد → حالت go-mode همه‌ی UI بازی را مخفی
      می‌کند تا کارت باخت تمیز بماند.
   ۳) فونت گوشی (مقیاس متن سیستم سامسونگ = textZoom): متن‌ها از
      کادرهای ثابت بیرون می‌پرید → text-size-adjust:100% (و در APK
      خودش setTextZoom(100) ست می‌شود).
   ۴) کوله‌پشتی: آیکون تازه (کوله‌ی کوهنوردی با بند و قفل) + طرح
      «کشویی»: همیشه فقط یک قرص کوچک پایین-چپ؛ با لمس، جاخالی‌ها
      در یک ردیفِ باریکِ کنارش باز می‌شوند — هرگز نصف صفحه نمی‌گیرد.
   ۵) دستفروش: پنل پهن‌تر + ردیف‌های جادار (فاصله/line-height امن)
      + پیل «خرید از دستفروش» بالاتر (top:284) تا با کوله تداخل
      نکند؛ قفلِ «هر تب فقط آیتم‌های خودش» در هر باز شدن شیت.
   ۶) دکمه‌های منو: گلیف‌های ⚔/▶/⚙️/ℹ️ (روی سامسونگ عجیب رندر
      می‌شدند) → SVG تمیز data-ico.
   ================================================================== */

/* ---------- ۳۰-۰) CSS ---------- */
(function css30() {
  const st = document.createElement('style');
  st.textContent = `
/* ============ (۳۰) مرگ فونت‌بوستینگ اندروید — متن هرگز از کادر نمی‌پرد ============ */
html, body, #wrap {
  -webkit-text-size-adjust: 100% !important;
  text-size-adjust: 100% !important;
}

/* ============ (۳۰) go-mode: صفحه‌ی باخت/برد — فقط کارت، بدون UI بازی ============ */
#wrap.go-mode #backpackBar, #wrap.go-mode #peddlerBox, #wrap.go-mode #pedReopenBtn,
#wrap.go-mode #wpnChips28, #wrap.go-mode #bpFab28, #wrap.go-mode #bpNight,
#wrap.go-mode #bpNightMini28, #wrap.go-mode #bpScrim29, #wrap.go-mode #announce,
#wrap.go-mode #listenBtn, #wrap.go-mode #molotovBtn, #wrap.go-mode #bossBar,
#wrap.go-mode #lockBadge { display: none !important; }
#wrap.go-mode #buildPanel { transform: translateX(-50%) translateY(108%) !important; }

/* ============ (۳۰) کوله‌پشتی کشویی — قرص کوچک + ردیفِ باریکِ قابل‌باز شدن ============ */
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
#backpackBar .bpk-cap .ic { font-size: calc(17px * var(--uiz,1)); margin-inline-end: 0 !important; }
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

/* ============ (۳۰) پیل «خرید از دستفروش» — جایگاه شیار ۳ ستون چپ ============
   فقط روزها دیده می‌شود و مولوتوف (همین شیار) فقط شب‌ها → هرگز هم‌زمان نیستند؛
   کوله‌ی پایین-چپ هم دیگر هیچ برخوردی ندارد. */
#pedReopenBtn {
  top: calc(222px * var(--uiz,1)) !important;
  padding: calc(7px * var(--uiz,1)) calc(11px * var(--uiz,1)) !important;
  font-size: calc(12px * var(--uiz,1)) !important;
  gap: calc(6px * var(--uiz,1)) !important;
}
#pedReopenBtn .ic { font-size: calc(17px * var(--uiz,1)) !important; }

/* ============ (۳۰) دستفروش — پنل پهن‌تر + ردیف‌های جادار بدون هیچ برخوردی ============ */
#peddlerPanel {
  width: min(calc(400px * var(--uiz,1)), calc(94vw / var(--uiz,1))) !important;
  max-height: 84% !important;
}
.pd-item {
  padding: calc(10px * var(--uiz,1)) calc(11px * var(--uiz,1)) !important;
  margin-top: calc(10px * var(--uiz,1)) !important;
  gap: calc(10px * var(--uiz,1)) !important;
  align-items: flex-start !important;
}
.pd-item canvas { width: calc(48px * var(--uiz,1)) !important; height: calc(48px * var(--uiz,1)) !important; }
.pd-item .pd-name { line-height: 1.7 !important; margin-bottom: calc(2px * var(--uiz,1)); }
.pd-item .pd-sub { line-height: 1.8 !important; margin-top: calc(3px * var(--uiz,1)) !important; }
.pd-item .pd-price { margin-top: calc(8px * var(--uiz,1)) !important; }

/* ============ (۳۰) آیکون‌های SVG منوی اصلی (به‌جای گلیف‌های ⚔▶⚙️ℹ️) ============ */
.m23-ico svg { width: calc(29px * var(--uiz,1)); height: calc(29px * var(--uiz,1)); }
.m23-small .m23-ico svg { width: calc(22px * var(--uiz,1)); height: calc(22px * var(--uiz,1)); }
.m23-ico { font-size: calc(27px * var(--uiz,1)); }
`;
  document.head.appendChild(st);
})();

/* ---------- ۳۰-۱) آیکون کوله‌ی تازه (کوله‌ی کوهنوردی: بدنه + سرپوش + دو قفل + بند) ---------- */
(function backpackIcon30() {
  try {
    if (typeof ICO === 'undefined' || !ICO.I) return;
    const S = (inner, fill) =>
      '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="' + (fill ? 'currentColor' : 'none') +
      '" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
    /* کوله‌ی کوهنوردی: بدنه‌ی گرد + سرپوش بالایی + دو بند قفل + بسته‌ی کناری */
    ICO.I.backpack = S(
      '<path d="M7.2 9.2c0-2.9 2.1-5 4.8-5s4.8 2.1 4.8 5"/>' +
      '<rect x="5" y="8.6" width="14" height="12" rx="3.4"/>' +
      '<path d="M8.6 8.6h6.8c.9 0 1.6.7 1.6 1.6v1.2c0 .9-.7 1.6-1.6 1.6H8.6c-.9 0-1.6-.7-1.6-1.6v-1.2c0-.9.7-1.6 1.6-1.6z"/>' +
      '<path d="M9.2 13.9v2.4M14.8 13.9v2.4"/>' +
      '<path d="M5 13.9H3.6M19 13.9h1.4" opacity=".7"/>'
    );
    /* شمشیر و سپر برای «شروع داستان» — تمیز و قهرمانانه */
    ICO.I.sword30 = S(
      '<path d="M14.5 3.5l4.2 1-1 4.2-8.4 8.4-3.2-3.2z"/>' +
      '<path d="M6.1 17.9l-2.1 2.1M8.2 15.8l-2.1 2.1"/>' +
      '<path d="M13 8.5l3 3"/>' +
      '<path d="M17 14c-1.4 1-3 1.4-4.6 1.1-.3-1.6.1-3.2 1.1-4.6" opacity=".65"/>'
    );
  } catch (e) {}
})();

/* ---------- ۳۰-۲) راه‌اندازی بعد از لود کامل ---------- */
function setup30() {
  try { exclusivity30(); } catch (e) {}
  try { gomode30(); } catch (e) {}
  try { backpack30(); } catch (e) {}
  try { peddlerHardening30(); } catch (e) {}
}

/* ---------- ۳۰-۳) اختصاص متقابل: شیت ساخت‌وساز ⟷ پنل دستفروش ----------
   ریشه‌ی «همش با هم افتاده»: هر دو پنل هم‌زمان باز بودند و تب‌ها/
   کاشی‌های شیت روی ردیف‌های دستفروش می‌افتادند. */
function exclusivity30() {
  /* شیت باز می‌شود → پنل دستفروش فوراً بسته شود + فیلتر تب دوباره قفل شود */
  if (typeof setBuildPanel === 'function' && !setBuildPanel.__30) {
    const _sbp = setBuildPanel;
    setBuildPanel = function (c, s) {
      _sbp(c, s);
      try {
        if (!c) {                                   /* باز شدن شیت */
          if (typeof hidePeddlerPanel === 'function') hidePeddlerPanel();
          if (typeof refreshBuildPanel === 'function') refreshBuildPanel();   /* هر تب فقط آیتم‌های خودش */
        }
      } catch (e) {}
    };
    setBuildPanel.__30 = true;
  }
  if (typeof toggleBuildPanel === 'function' && !toggleBuildPanel.__30) {
    const _t = toggleBuildPanel;
    toggleBuildPanel = function () { _t(); };
    toggleBuildPanel.__30 = true;
  }
  /* پنل دستفروش باز می‌شود → شیت فوراً جمع شود (اسکریم هم خاموش) */
  if (typeof renderPeddlerStock === 'function' && !renderPeddlerStock.__30) {
    const _r = renderPeddlerStock;
    renderPeddlerStock = function () {
      try {
        if (typeof setBuildPanel === 'function') setBuildPanel(true, true);
        const sc = document.getElementById('bpScrim29');
        if (sc) sc.classList.remove('on');
      } catch (e) {}
      return _r.apply(this, arguments);
    };
    renderPeddlerStock.__30 = true;
  }
}

/* ---------- ۳۰-۴) go-mode: صفحه‌ی باخت/برد بدون هیچ UI شناور بازی ---------- */
function gomode30() {
  const GO_IDS = ['gameoverScreen', 'victoryScreen'];
  if (typeof showScreen === 'function' && !showScreen.__30) {
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
    showScreen.__30 = true;
  }
  if (typeof hideScreen === 'function' && !hideScreen.__30) {
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
    hideScreen.__30 = true;
  }
}

/* ---------- ۳۰-۵) کوله‌پشتی کشویی: قرص همیشه؛ جاخالی‌ها با لمس ----------
   درخواست کاربر: «وقتی کوله توش وسیله باشه نصف صفحه رو هم اون میگیره» */
function backpack30() {
  const bar = document.getElementById('backpackBar');
  if (!bar || bar.__30) return;
  bar.__30 = true;
  bar.addEventListener('click', (e) => {
    /* فقط قرصِ خودِ کوله کشویی را جمع/باز می‌کند؛ ضربه به جاخالی = مصرف وسیله */
    if (e.target.closest('.bpk-slot')) return;
    if (bar.classList.contains('compact')) return;      /* خالی است — چیزی برای باز کردن نیست */
    SFX_OK30();
    bar.classList.toggle('open30');
  });
  /* شب/گفتگو → جمع شود تا جا اشغال نکند */
  const collapse = () => { try { bar.classList.remove('open30'); } catch (e) {} };
  if (typeof startNight === 'function' && !startNight.__30) {
    const _n = startNight;
    startNight = function () { collapse(); return _n.apply(this, arguments); };
    startNight.__30 = true;
  }
}
function SFX_OK30() { try { if (typeof SFX !== 'undefined' && SFX.click) SFX.click(); } catch (e) {} }

/* ---------- ۳۰-۶) دستفروش: بعد از هر بازسازیِ قفسه، شیتِ احتمالی بسته بماند ---------- */
function peddlerHardening30() {
  /* buyRare بعد از خرید renderPeddlerStock را صدا می‌زند — رپِ ۳۰-۳ خودش شیت را می‌بندد.
     این‌جا فقط مطمئن می‌شویم پیل بازگشایی هرگز روی پنلِ باز دیده نشود. */
  const style = document.createElement('style');
  style.textContent = '#peddlerBox:not(.hidden) ~ #pedReopenBtn, #peddlerBox:not(.hidden) ~ * #pedReopenBtn{display:none!important}';
  document.head.appendChild(style);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setup30, { once: true });
} else {
  setup30();
}
