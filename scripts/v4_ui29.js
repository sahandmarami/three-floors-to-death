/* ==================================================================
   «سه طبقه تا مرگ» v29 — بازخورد کاربر (جلسه‌ی ۲۹، سه درخواست):
   ۱) منوی ساخت‌وساز «دیگر روی صفحه نمی‌افتد»:
      · شروعِ جمع (روز/شروع بازی خودکار باز نمی‌شود — فقط با FAB)
      · اسکریم نیمه‌شفاف + لمس بیرون = بستن (باتن‌شیت واقعی اندروید)
      · فشرده‌تر: کاشی‌ها ۷۸px، تب‌ها ۳۶px، ارتفاع حداکثر ۵۰٪
      · FAB با برچسب «ساخت‌وساز» + پالس جلب توجه در روز
   ۲) آیکون‌های کلت/شاتگان/مسلسل = SVG خطی تمیز متریال (نه اسپرایت
      پیکسلی تار) — هم در چیپ‌های کنار HUD، هم در کاشی‌های شیت
      + حالت انتخاب طلایی ملایم (نه هاله‌ی کلفت ارزان)
      + قفل = نشان کوچک گوشه‌ای (نه ایموجی 🔒 سامسونگی)
   ۳) آیکون چراغ‌قوه = مشعل عمودی تمیز با پرتوهای نور (به‌جای
      آیکون افقی «بال‌دار» قبلی)
   ۴) منوی توقف = فقط «ادامه» + «ذخیره و خروج» (ردیف تنظیمات/
      درباره حذف شد — درخواست صریح کاربر)
   ================================================================== */

/* ---------- ۲۹-۰) CSS — همه‌ی overrides این نسخه ---------- */
(function css29() {
  const st = document.createElement('style');
  st.textContent = `
/* ============ (۲۹) باتن‌شیت فشرده + اسکریم ============ */
#buildPanel{max-height:50%!important}
#buildPanel .bp-head{min-height:calc(38px * var(--uiz,1))!important;padding:calc(6px * var(--uiz,1)) calc(12px * var(--uiz,1))!important;font-size:calc(13px * var(--uiz,1))!important}
#buildPanel .bp-tabs{justify-content:center!important;padding:calc(4px * var(--uiz,1)) calc(6px * var(--uiz,1)) 0!important;gap:calc(4px * var(--uiz,1))!important}
#buildPanel .bp-tab{min-height:calc(36px * var(--uiz,1))!important;font-size:calc(11.5px * var(--uiz,1))!important;padding:calc(4px * var(--uiz,1)) calc(9px * var(--uiz,1))!important;border-radius:calc(11px * var(--uiz,1))!important}
#buildPanel .bp-tab .bp-tab-ic{font-size:calc(16px * var(--uiz,1))!important}
#bpList{grid-template-columns:repeat(auto-fill,minmax(calc(86px * var(--uiz,1)),1fr))!important;gap:calc(6px * var(--uiz,1))!important;padding:calc(7px * var(--uiz,1)) calc(9px * var(--uiz,1)) calc(9px * var(--uiz,1))!important}
#buildPanel .bp-tile{height:calc(76px * var(--uiz,1))!important;border-radius:calc(13px * var(--uiz,1))!important}
#buildPanel .bp-ic{width:calc(40px * var(--uiz,1))!important;height:calc(40px * var(--uiz,1))!important}
#buildPanel .bp-tile .bp-price{font-size:calc(11px * var(--uiz,1))!important}
/* اسکریم: لمس = بستن شیت — بازی پشت‌ش کم‌سو ولی دیده می‌شود */
#bpScrim29{position:absolute;inset:0;z-index:8;background:rgba(4,8,20,.5);
  opacity:0;pointer-events:none;transition:opacity .22s ease}
#bpScrim29.on{opacity:1;pointer-events:auto}
#wrap.menu-mode #bpScrim29,#wrap.cine-mode #bpScrim29,#wrap.cs-mode #bpScrim29,#wrap.dlg-on #bpScrim29{display:none!important}

/* FAB: برچسب زیر دکمه + پالس جلب توجه در روز */
#bpFab28{flex-direction:column;gap:calc(2px * var(--uiz,1))}
#bpFab28 .fabLbl29{font-size:calc(9px * var(--uiz,1));font-weight:800;color:#dfe9ff;
  letter-spacing:-0.2px;line-height:1;text-shadow:0 1px 3px rgba(0,0,0,.8)}
@keyframes fabPulse29{0%,100%{box-shadow:0 8px 24px rgba(44,72,168,.55),0 0 0 0 rgba(255,216,115,.6)}50%{box-shadow:0 8px 24px rgba(44,72,168,.55),0 0 0 11px rgba(255,216,115,0)}}
#bpFab28.attention{animation:fabPulse29 1.3s infinite}

/* ============ (۲۹) آیکون‌های سلاح — SVG تمیز ============ */
.wchip28 svg{width:calc(30px * var(--uiz,1));height:calc(30px * var(--uiz,1));display:block}
.wchip28 canvas{display:none!important}
/* انتخاب = طلایی ملایم (نه هاله‌ی کلفت) */
.wchip28.on{border-color:#ffd873!important;border-width:1.5px!important;
  background:linear-gradient(180deg,rgba(66,53,22,.95),rgba(34,27,11,.95))!important;
  box-shadow:0 0 9px rgba(255,216,115,.28),inset 0 1.5px 0 rgba(255,255,255,.12)!important}
.wchip28.on::after{width:calc(6px * var(--uiz,1));height:calc(6px * var(--uiz,1));
  box-shadow:0 0 5px #ffd873}
/* قفل = نشان کوچک گوشه‌ای (SVG، نه ایموجی) */
.wchip28.locked{opacity:.5}
.wchip28.locked::before{content:'';position:absolute;top:calc(3px * var(--uiz,1));inset-inline-start:calc(3px * var(--uiz,1));
  width:calc(13px * var(--uiz,1));height:calc(13px * var(--uiz,1));border-radius:calc(4px * var(--uiz,1));
  background:rgba(8,12,26,.72) url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffd873'><path d='M7 10V8a5 5 0 0 1 10 0v2h.6c.8 0 1.4.6 1.4 1.4v7.2c0 .8-.6 1.4-1.4 1.4H6.4c-.8 0-1.4-.6-1.4-1.4v-7.2c0-.8.6-1.4 1.4-1.4H7zm2 0h6V8a3 3 0 0 0-6 0v2z'/></svg>") center/72% no-repeat}
/* کاشی سلاح داخل شیت هم SVG شود (هم‌خانواده‌ی چیپ) */
.bp-ic29{display:flex!important;align-items:center;justify-content:center;color:#cfe0ff;
  width:calc(40px * var(--uiz,1))!important;height:calc(40px * var(--uiz,1))!important}
.bp-ic29 svg{width:calc(31px * var(--uiz,1));height:calc(31px * var(--uiz,1))}
#buildPanel .bp-tile.armed .bp-ic29{color:#ffe9b0}

/* آیکون چراغ‌قوه‌ی تازه: کمی جا برای تنفس */
#ctlFlash .ic{line-height:1}
#ctlFlash .ic svg{width:calc(23px * var(--uiz,1));height:calc(23px * var(--uiz,1))}

/* توقف: «ذخیره و خروج» حالا تنها دکمه‌ی فرعی است — تمام‌عرض */
#pauseScreen .m27-list #btnSaveExit{grid-column:1 / -1!important}
#pauseScreen .m27-btn.m27-primary{min-height:calc(58px * var(--uiz,1))!important}
#pauseScreen .m27-list #btnSaveExit{min-height:calc(54px * var(--uiz,1))!important}
`;
  document.head.appendChild(st);
})();

/* ---------- ۲۹-۱) آیکون‌های SVG سلاح + مشعل (viewBox 24، خط ۱٫۸) ---------- */
const SVG29S = (inner) =>
  '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
const WICONS29 = {
  /* کلت: لوله‌ی گرد افقی + قنداق مورب + ماشه */
  pistol: SVG29S(
    '<rect x="3" y="7.8" width="16.4" height="4" rx="2"/>' +
    '<path d="M6.4 11.5l-1.15 4.7c-.24 1 .52 1.9 1.55 1.9h1.42c.74 0 1.38-.5 1.54-1.22l1.04-4.2"/>' +
    '<path d="M11.9 11.9c.4.85 1.25 1.4 2.2 1.4" opacity=".6"/>' +
    '<path d="M16.9 7.8V6.7" opacity=".7"/>'
  ),
  /* شاتگان: لوله‌ی بلند نازک + قنداق گِردِ عقب + پمپ زیر لوله */
  shotgun: SVG29S(
    '<rect x="2.2" y="8.9" width="13.8" height="2.7" rx="1.35"/>' +
    '<path d="M15.7 9.5l4.4 2.95c.95.64.5 2.05-.65 2.05h-1.68c-.38 0-.75-.1-1.07-.3l-3.95-2.4"/>' +
    '<rect x="5.7" y="12.5" width="5.1" height="2.3" rx="1.15"/>' +
    '<path d="M3.6 8.6V7.7" opacity=".7"/>'
  ),
  /* مسلسل: بدنه + خشاب عمودی + دوپایه + قنداق */
  mg: SVG29S(
    '<rect x="2.2" y="9.1" width="15.4" height="2.4" rx="1.2"/>' +
    '<path d="M17.2 9.3l3.5 2.5c.85.6.4 1.9-.68 1.9h-1.35c-.37 0-.73-.1-1.04-.3l-3.43-2.05"/>' +
    '<path d="M9.5 11.5l.42 5.05c.07.85-.6 1.55-1.44 1.55h-.3c-.77 0-1.42-.6-1.48-1.36l-.32-5.24"/>' +
    '<path d="M4.3 11.5l-1.35 2.9M6.7 11.5l1.35 2.9" opacity=".75"/>'
  ),
  /* مشعل عمودی تازه: بدنه + سر پهن + سه پرتو بالا */
  torch: SVG29S(
    '<path d="M8.7 6.05l2-2.7c.55-.74 1.75-.74 2.3 0l2 2.7c.26.35.4.77.4 1.2v10.1c0 1.06-.86 1.92-1.92 1.92h-1.16c-1.06 0-1.92-.86-1.92-1.92V7.25c0-.43.14-.85.4-1.2z"/>' +
    '<path d="M9.4 8.9c.85-.45 1.65-.45 2.6 0 .95-.45 1.75-.45 2.6 0" opacity=".5"/>' +
    '<path d="M7 2.3L5.8 1M17 2.3L18.2 1M12 1.9V.6" opacity=".85"/>'
  ),
};

/* ---------- ۲۹-۲) راه‌اندازی بعد از لود کامل ---------- */
function setup29() {
  try { buildScrim29(); } catch (e) {}
  try { patchPanel29(); } catch (e) {}
  try { chipIcons29(); } catch (e) {}
  try { sheetWeaponIcons29(); } catch (e) {}
  try { flashIcon29(); } catch (e) {}
  try { pauseOnly29(); } catch (e) {}
}

/* اسکریم باتن‌شیت — لمس بیرون شیت = بستن */
function buildScrim29() {
  if (document.getElementById('bpScrim29')) return;
  const s = document.createElement('div');
  s.id = 'bpScrim29';
  s.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    try { setBuildPanel(true); } catch (err) {}
  });
  document.getElementById('wrap').appendChild(s);
  /* برچسب واقعی زیر FAB (به‌جای ::after تا در textContent هم باشد) */
  const fab = document.getElementById('bpFab28');
  if (fab && !fab.querySelector('.fabLbl29')) {
    const l = document.createElement('span');
    l.className = 'fabLbl29';
    l.textContent = 'ساخت‌وساز';
    fab.appendChild(l);
  }
}

/* پچ setBuildPanel: اسکریم همگام + پالس FAB در روز */
function patchPanel29() {
  if (typeof setBuildPanel !== 'function' || setBuildPanel.__29) return;
  const _sbp = setBuildPanel;
  setBuildPanel = function (c, s) {
    _sbp(c, s);
    try {
      const sc = document.getElementById('bpScrim29');
      if (sc) sc.classList.toggle('on', !c);
      const fab = document.getElementById('bpFab28');
      /* پالس فقط روزِ بین‌موج‌ها (یادآوری خرید) — نه شبِ نبرد */
      if (fab) fab.classList.toggle('attention', !!c && typeof state !== 'undefined' && state.mode === 'day');
    } catch (e) {}
  };
  setBuildPanel.__29 = true;
}

/* چیپ‌های سلاح: canvas پیکسلی → SVG تمیز */
function chipIcons29() {
  ['pistol', 'shotgun', 'mg'].forEach(id => {
    const b = document.getElementById('wchip28-' + id);
    if (!b || !WICONS29[id]) return;
    const cv = b.querySelector('canvas');
    if (cv) cv.remove();
    if (!b.querySelector('svg')) b.insertAdjacentHTML('afterbegin', WICONS29[id]);
  });
}

/* کاشی سلاح داخل شیت هم SVG (کلاس جدا تا repaintCanvas دستش نبرد) */
function sheetWeaponIcons29() {
  ['pistol', 'shotgun', 'mg'].forEach(id => {
    const el = document.getElementById('bp-' + id);
    if (!el || !WICONS29[id]) return;
    if (el.querySelector('.bp-ic29')) return;          /* قبلاً شده */
    const cv = el.querySelector('canvas.bp-ic');
    if (!cv) return;
    const sp = document.createElement('span');
    sp.className = 'bp-ic29';
    sp.innerHTML = WICONS29[id];
    cv.replaceWith(sp);
  });
}

/* آیکون چراغ‌قوه‌ی تازه در دکمه‌ی کنترل */
function flashIcon29() {
  const b = document.getElementById('ctlFlash');
  if (!b) return;
  const ic = b.querySelector('.ic');
  if (ic) ic.innerHTML = WICONS29.torch;
}

/* منوی توقف = فقط «ادامه» + «ذخیره و خروج» (درخواست کاربر) */
function pauseOnly29() {
  const row = document.querySelector('#pauseScreen .m27-mini-row');
  if (row) row.remove();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setup29, { once: true });
} else {
  setup29();
}
