/* ==================================================================
   «سه طبقه تا مرگ» v30 — اجرای کامل بازخورد ۸گانه کاربر
   ==================================================================
   ۱) ستون دایره‌های گوشه‌ی چپ: همه یک‌سایزِ ۵۶px، شبکه‌ی عمودی دقیق
      (۷۸ / ۱۵۴ / ۲۳۰ / ۳۰۶) — سرنخ و دستفروش هم دایره‌ی آیکنی شدند
   ۲) تب سلاح‌های شیت ساخت‌وساز: بدون هیچ متن — فقط آیکن + قیمت سکه‌ای
      + قفل گوشه‌ای + هاله‌ی طلایی «در دست»
   ۳) کوله‌پشتی: آیکونش باتن‌شیت اندرویدی باز می‌کند — آیتم‌های خریداری‌شده
      با دکمه‌ی «استفاده» واقعا وسط بازی مصرف می‌شوند (+ مولوتوف: پرتاب)
   ۴) بخش سرنخ‌ها: بازسازی کامل اندرویدی — باتن‌شیت متریال + اسکریم +
      کارت‌های جمع + آیکون جدید «اثر انگشت + ذره‌بین» + حل معماها همان‌جا
   ۵) خرید مولوتوف: دیگر هیچ سیل متنی نمی‌آید — اسنک‌بار متریال کوچک
   ۶) کاشی‌ها: متن کیت/سلاح‌ها دیگر بیرون نمی‌زند (تولتیپ‌ها روی لمس
      کاملا خاموش + گیره‌ی عرض)
   ۷) تنظیمات/درباره: بدون اسکرول — همه‌چیز در قاب جا می‌شود
   ۸) (منو و زامبی‌ها در v4_menu23 ویرایش شدند)
   ================================================================== */

/* ---------- ۳۰-۰) CSS — همه‌ی overrides ---------- */
(function css30() {
  const st = document.createElement('style');
  st.textContent = `
/* ============ (۳۰-۱) ستون چپ: دایره‌های هم‌سایز روی شبکه‌ی دقیق ============ */
/* توجه: display اینجا عمداً تنظیم نمی‌شود — چراغ‌قوه با CSS پایه‌اش دیده
   می‌شود و بقیه با style.display خطی از MYST.update کنترل می‌شوند */
#listenBtn,#ctlFlash,#molotovBtn,#mystBtn,#pedReopenBtn{
  width:calc(56px * var(--uiz,1))!important;height:calc(56px * var(--uiz,1))!important;
  left:calc(12px * var(--uiz,1))!important;right:auto!important;
  border-radius:calc(18px * var(--uiz,1))!important;
  align-items:center!important;justify-content:center!important;
  box-shadow:0 6px 18px rgba(0,0,0,.5),inset 0 1.5px 0 rgba(255,255,255,.12)!important;
  -webkit-tap-highlight-color:transparent;touch-action:manipulation;padding:0!important
}
#mystBtn{top:calc(78px * var(--uiz,1))!important;gap:0!important;animation:none!important}
#listenBtn{top:calc(78px * var(--uiz,1))!important}
#ctlFlash{top:calc(154px * var(--uiz,1))!important}
#molotovBtn{top:calc(230px * var(--uiz,1))!important}
#pedReopenBtn{top:calc(306px * var(--uiz,1))!important;gap:0!important}
/* متن‌های دکمه‌های ستون حذف — فقط آیکن */
#mystBtn span,#pedReopenBtn span{display:none!important}
.ctl-lbl{display:none!important}
/* آیکن‌ها هم‌اندازه */
#listenBtn .ic,#ctlFlash .ic,#molotovBtn .ic,#mystBtn .ic,#pedReopenBtn .ic{
  width:calc(27px * var(--uiz,1))!important;height:calc(27px * var(--uiz,1))!important;
  display:flex!important;align-items:center;justify-content:center!important}
#listenBtn .ic svg,#ctlFlash .ic svg,#molotovBtn .ic svg,#mystBtn .ic svg,#pedReopenBtn .ic svg{
  width:calc(25px * var(--uiz,1))!important;height:calc(25px * var(--uiz,1))!important}
/* باتری چراغ‌قوه داخل دایره */
#ctlFlash .ctl-batt{width:calc(26px * var(--uiz,1))!important;margin-top:calc(2px * var(--uiz,1))!important}
/* نشان شمارنده (مولوتوف) — قرص کوچک گوشه‌ی دکمه */
.railBadge30{position:absolute;top:calc(-4px * var(--uiz,1));inset-inline-start:calc(-4px * var(--uiz,1));
  min-width:calc(20px * var(--uiz,1));height:calc(20px * var(--uiz,1));border-radius:99px;
  background:linear-gradient(180deg,#ffd873,#eda93c);color:#141a2e;
  font-size:calc(11px * var(--uiz,1));font-weight:900;
  display:flex;align-items:center;justify-content:center;padding:0 calc(5px * var(--uiz,1));
  box-shadow:0 2px 8px rgba(0,0,0,.55);pointer-events:none;font-family:inherit}
/* نقطه‌ی «سرنخ تازه» روی دکمه‌ی سرنخ */
#mystBtn .dot30{position:absolute;top:calc(6px * var(--uiz,1));inset-inline-end:calc(6px * var(--uiz,1));
  width:calc(10px * var(--uiz,1));height:calc(10px * var(--uiz,1));border-radius:99px;
  background:#ff5c40;box-shadow:0 0 8px rgba(255,90,60,.9);display:none;pointer-events:none}
#mystBtn.fresh .dot30{display:block}
#mystBtn.glow{animation:mystGlow 1.4s infinite!important}

/* ============ (۳۰-۲) اسنک‌بار متریال — جایگزین اعلانِ خریدها ============ */
#snack30{position:absolute;bottom:calc(64px * var(--uiz,1));left:50%;transform:translateX(-50%) translateY(18px);
  z-index:40;display:flex;align-items:center;gap:calc(9px * var(--uiz,1));
  background:linear-gradient(180deg,#2b3150,#1a2038);border:1.5px solid #4d5f9e;
  border-radius:calc(13px * var(--uiz,1));padding:calc(9px * var(--uiz,1)) calc(16px * var(--uiz,1));
  font-size:calc(13px * var(--uiz,1));font-weight:800;color:#eef3ff;white-space:nowrap;
  box-shadow:0 10px 34px rgba(0,0,0,.65),inset 0 1.5px 0 rgba(255,255,255,.1);
  opacity:0;transition:opacity .2s ease,transform .2s ease;pointer-events:none;font-family:inherit}
#snack30.show{opacity:1;transform:translateX(-50%) translateY(0)}
#snack30 .ic{width:calc(17px * var(--uiz,1));height:calc(17px * var(--uiz,1));color:#ffd873;flex:none}
#snack30 .ic svg{width:calc(17px * var(--uiz,1));height:calc(17px * var(--uiz,1))}
#wrap.menu-mode #snack30,#wrap.cine-mode #snack30{display:none!important}

/* ============ (۳۰-۳) باتن‌شیت اندرویدی مشترک (سرنخ/کوله) ============ */
#shScrim30{position:absolute;inset:0;z-index:24;background:rgba(3,6,16,.55);
  opacity:0;pointer-events:none;transition:opacity .22s ease}
#shScrim30.on{opacity:1;pointer-events:auto}
.shSheet30{position:absolute;left:0;right:0;bottom:0;z-index:25;
  max-height:calc(76% );display:flex;flex-direction:column;
  background:linear-gradient(180deg,#1c2646 0%,#121a34 60%,#0d1428 100%);
  border-top:1.5px solid #4d6aa8;
  border-radius:calc(24px * var(--uiz,1)) calc(24px * var(--uiz,1)) 0 0;
  box-shadow:0 -18px 60px rgba(0,0,0,.7);
  transform:translateY(103%);transition:transform .26s cubic-bezier(.2,.9,.3,1.05)}
.shSheet30.on{transform:translateY(0)}
.shHandle30{width:calc(44px * var(--uiz,1));height:calc(4.5px * var(--uiz,1));border-radius:99px;
  background:rgba(255,255,255,.22);margin:calc(9px * var(--uiz,1)) auto calc(4px * var(--uiz,1));flex:none}
.shHead30{display:flex;align-items:center;gap:calc(11px * var(--uiz,1));
  padding:calc(4px * var(--uiz,1)) calc(16px * var(--uiz,1)) calc(10px * var(--uiz,1));flex:none}
.shHic30{width:calc(42px * var(--uiz,1));height:calc(42px * var(--uiz,1));border-radius:calc(13px * var(--uiz,1));
  display:flex;align-items:center;justify-content:center;flex:none;
  background:radial-gradient(circle at 35% 30%,rgba(255,190,60,.3),rgba(255,150,40,.07));
  border:1.5px solid rgba(255,200,90,.45);color:#ffd873}
.shHic30 svg{width:calc(23px * var(--uiz,1));height:calc(23px * var(--uiz,1))}
.shTitle30{font-size:calc(17px * var(--uiz,1));font-weight:900;color:#ffd873;flex:1;line-height:1.3}
.shSub30{font-size:calc(11px * var(--uiz,1));color:#93a3cc;font-weight:700;margin-top:calc(2px * var(--uiz,1))}
.shX30{width:calc(38px * var(--uiz,1));height:calc(38px * var(--uiz,1));border-radius:50%;flex:none;
  background:rgba(255,255,255,.07);border:1.5px solid #4d5f9e;color:#cdd8f2;
  display:flex;align-items:center;justify-content:center;cursor:pointer;font-family:inherit}
.shX30 svg{width:calc(16px * var(--uiz,1));height:calc(16px * var(--uiz,1))}
.shBody30{overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;
  padding:calc(4px * var(--uiz,1)) calc(14px * var(--uiz,1)) calc(14px * var(--uiz,1));
  display:flex;flex-direction:column;gap:calc(9px * var(--uiz,1))}
#wrap.menu-mode .shSheet30,#wrap.cine-mode .shSheet30,#wrap.menu-mode #shScrim30,#wrap.cine-mode #shScrim30{display:none!important}

/* کارت آیتم کوله */
.bpkCard30{display:flex;align-items:center;gap:calc(12px * var(--uiz,1));
  background:linear-gradient(180deg,rgba(40,53,92,.95),rgba(26,37,70,.95));
  border:1.5px solid #46609e;border-radius:calc(16px * var(--uiz,1));
  padding:calc(10px * var(--uiz,1)) calc(12px * var(--uiz,1));min-height:calc(64px * var(--uiz,1))}
.bpkIc30{width:calc(46px * var(--uiz,1));height:calc(46px * var(--uiz,1));border-radius:calc(12px * var(--uiz,1));
  background:rgba(10,16,34,.75);border:1.5px solid #3d548c;flex:none;
  display:flex;align-items:center;justify-content:center;position:relative}
.bpkIc30 canvas{width:calc(36px * var(--uiz,1))!important;height:calc(36px * var(--uiz,1))!important}
.bpkN30{flex:1;min-width:0}
.bpkName30{font-size:calc(14.5px * var(--uiz,1));font-weight:900;color:#eef3ff;line-height:1.35}
.bpkDesc30{font-size:calc(11px * var(--uiz,1));color:#93a3cc;font-weight:700;line-height:1.5;margin-top:calc(2px * var(--uiz,1))}
.bpkUse30{flex:none;min-height:calc(46px * var(--uiz,1));min-width:calc(84px * var(--uiz,1));
  border:none;border-radius:calc(13px * var(--uiz,1));cursor:pointer;font-family:inherit;
  font-size:calc(14px * var(--uiz,1));font-weight:900;color:#141a2e;
  background:linear-gradient(180deg,#ffd873,#eda93c);
  box-shadow:0 4px 16px rgba(240,180,60,.35),inset 0 1.5px 0 rgba(255,255,255,.5)}
.bpkUse30:active{transform:scale(.95)}
.bpkUse30.off{background:linear-gradient(180deg,#39435f,#2a3350);color:#8d9cc4;box-shadow:none}
.bpkCnt30{position:absolute;top:calc(-6px * var(--uiz,1));inset-inline-end:calc(-6px * var(--uiz,1));
  min-width:calc(21px * var(--uiz,1));height:calc(21px * var(--uiz,1));border-radius:99px;
  background:linear-gradient(180deg,#ffd873,#eda93c);color:#141a2e;
  font-size:calc(11.5px * var(--uiz,1));font-weight:900;
  display:flex;align-items:center;justify-content:center;padding:0 calc(5px * var(--uiz,1));
  box-shadow:0 2px 8px rgba(0,0,0,.55)}
.bpkEmpty30{text-align:center;color:#93a3cc;font-size:calc(13px * var(--uiz,1));font-weight:700;
  padding:calc(22px * var(--uiz,1)) calc(10px * var(--uiz,1));line-height:2}
/* ============ (۳۰-۷) ضد سرریز متن: کارت دستفروش/متن‌های بلند ============ */
.pd-item .pd-name,.pd-item .pd-sub,.m30act .m30s,.m30clue .mc-sub,.bpkDesc30,.shSub30{
  overflow-wrap:break-word!important;word-break:break-word!important}
.pd-item .pd-sub{overflow:hidden!important;display:-webkit-box!important;
  -webkit-line-clamp:2!important;-webkit-box-orient:vertical!important}
`;
  document.head.appendChild(st);
})();

/* ---------- ۳۰-۱) اسنک‌بار متریال ---------- */
let _snackT30 = null;
function snack30(text, icon) {
  let el = document.getElementById('snack30');
  if (!el) {
    el = document.createElement('div');
    el.id = 'snack30';
    document.getElementById('wrap').appendChild(el);
  }
  el.innerHTML = (typeof ICO !== 'undefined' ? '<i class="ic">' + ICO.ico(icon || 'coin') + '</i>' : '') +
    '<span></span>';
  el.querySelector('span').textContent = text;
  el.classList.add('show');
  clearTimeout(_snackT30);
  _snackT30 = setTimeout(() => el.classList.remove('show'), 2100);
}

/* ---------- ۳۰-۲) ستون چپ: یک‌سان‌سازی + نشان‌ها ---------- */
function railBadge30(btn, n) {
  if (!btn) return;
  let b = btn.querySelector('.railBadge30');
  if (n > 0) {
    if (!b) { b = document.createElement('span'); b.className = 'railBadge30'; btn.appendChild(b); }
    b.textContent = faNum(n);
  } else if (b) b.remove();
}

/* پچ MYST.update: نشان مولوتوف + نقطه‌ی سرنخ تازه */
(function patchMystRail30() {
  const _upd = MYST.update.bind(MYST);
  MYST.update = function (dt) {
    _upd(dt);
    try {
      /* نشان تعداد مولوتوف روی دکمه‌ی ستون */
      if (this._molotovBtn) railBadge30(this._molotovBtn, this.molotovs);
      /* نقطه‌ی قرمز «سرنخ/معمای حل‌نشده» روی دکمه‌ی سرنخ */
      if (this._btn) this._btn.classList.toggle('fresh', this.avail().length > 0);
    } catch (e) {}
  };
})();

/* ---------- ۳۰-۳) تب سلاح‌ها: کاشی‌های بی‌متن (آیکن + قیمت + قفل + طلایی) ---------- */
(function weaponTiles30() {
  const st = document.createElement('style');
  st.textContent = `
#buildPanel .bp-tile .bp-key{display:none!important}
/* کاشی سلاح: هیچ متن زیر آیکن — قیمت فقط سکه‌ای کوچک */
#bpList .bp-tile[id^=bp-pistol] .bp-price,#bpList .bp-tile[id^=bp-shotgun] .bp-price,
#bpList .bp-tile[id^=bp-mg] .bp-price{
  font-size:0!important;line-height:1!important;overflow:visible!important;
  background:rgba(20,15,4,.85)!important;border:1.5px solid #c9922e!important;
  border-radius:99px!important;padding:calc(2px * var(--uiz,1)) calc(8px * var(--uiz,1))!important;
  min-height:0!important;width:auto!important;align-self:center!important}
/* آیکن سکه داخل قیمت (متن = عدد؛ آیکن با ::before) */
#bpList .bp-tile[id^=bp-pistol] .bp-price::before,#bpList .bp-tile[id^=bp-shotgun] .bp-price::before,
#bpList .bp-tile[id^=bp-mg] .bp-price::before{
  content:'';display:inline-block;vertical-align:-2px;
  width:calc(13px * var(--uiz,1));height:calc(13px * var(--uiz,1));border-radius:50%;
  background:radial-gradient(circle at 35% 30%,#ffe9a8,#d9a63f 60%,#a8741f);
  box-shadow:0 0 4px rgba(255,215,100,.5);margin-inline-end:calc(3px * var(--uiz,1))}
/* وقتی متن قیمتی نیست (در دست/خریده/قفل) — چیپ پنهان */
#bpList .bp-tile .bp-price:empty{display:none!important}
/* نشان قفل گوشه‌ای برای سلاح‌های دور */
#bpList .bp-tile.locked{position:relative}
#bpList .bp-tile.locked::after{content:'';position:absolute;top:calc(5px * var(--uiz,1));inset-inline-end:calc(5px * var(--uiz,1));
  width:calc(15px * var(--uiz,1));height:calc(15px * var(--uiz,1));border-radius:calc(4px * var(--uiz,1));
  background:rgba(8,12,26,.78) url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffd873'><path d='M7 10V8a5 5 0 0 1 10 0v2h.6c.8 0 1.4.6 1.4 1.4v7.2c0 .8-.6 1.4-1.4 1.4H6.4c-.8 0-1.4-.6-1.4-1.4v-7.2c0-.8.6-1.4 1.4-1.4H7zm2 0h6V8a3 3 0 0 0-6 0v2z'/></svg>") center/74% no-repeat}
/* نشان «مالِ خودت» تیک سبز کوچک */
#bpList .bp-tile.owned{position:relative}
#bpList .bp-tile.owned::after{content:'';position:absolute;top:calc(5px * var(--uiz,1));inset-inline-end:calc(5px * var(--uiz,1));
  width:calc(16px * var(--uiz,1));height:calc(16px * var(--uiz,1));border-radius:50%;
  background:rgba(10,30,16,.85) url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2377e29a' stroke-width='3.2' stroke-linecap='round' stroke-linejoin='round'><path d='M5 13l4 4L19 7'/></svg>") center/72% no-repeat;
  box-shadow:0 0 6px rgba(80,220,120,.4)}
/* در دست = هاله‌ی طلایی ملایم (بدون متن) */
#bpList .bp-tile.armed{border-color:#ffd873!important;
  box-shadow:0 0 12px rgba(255,216,115,.35),inset 0 1.5px 0 rgba(255,255,255,.14)!important}
/* تولتیپ: روی لمس هرگز + گیره‌ی عرض (متن کیت بیرون نزند) */
@media (pointer:coarse){#bpTip{display:none!important}}
#bpTip{max-width:calc(190px * var(--uiz,1))!important;overflow:hidden!important;
  word-break:break-word!important}
#bpTip b{white-space:normal!important;overflow-wrap:break-word!important}
/* کاشی‌های بقا/ارتقا: قیمت‌ها هم جمع‌تر و هرگز سرریز نه */
#buildPanel .bp-tile .bp-price{max-width:calc(72px * var(--uiz,1))!important;
  overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
`;
  document.head.appendChild(st);

  /* پچ refreshBuildPanel: شاخه‌ی سلاح‌ها = بدون متن */
  const _rbp = refreshBuildPanel;
  refreshBuildPanel = function () {
    _rbp.apply(null, arguments);
    try {
      const WORDER = ['pistol', 'shotgun', 'mg'];
      for (const id of WORDER) {
        const el = document.getElementById('bp-' + id);
        const cost = document.getElementById('bp-' + id + '-cost');
        if (!el || !cost) continue;
        const owned = !!(typeof WEAPONS !== 'undefined' && WEAPONS[id] && WEAPONS[id].owned);
        const isCur = (typeof state !== 'undefined' && state.weapon === id);
        const idx = WORDER.indexOf(id);
        const curIdx = WORDER.indexOf(typeof state !== 'undefined' ? state.weapon : 'pistol');
        const isFar = !owned && idx > curIdx + 1;
        if (isCur || owned || isFar) {
          cost.textContent = '';                       /* هیچ متنی */
          cost.classList.remove('poor');
        } else if (typeof UPGRADES !== 'undefined' && UPGRADES[id]) {
          cost.textContent = faNum(UPGRADES[id].price); /* فقط عدد — سکه با ::before */
          cost.classList.toggle('poor', state.coins < UPGRADES[id].price);
        }
      }
    } catch (e) {}
  };
})();

/* ==================================================================
   ۳۰-۴) کوله‌پشتی — آیکون باتن‌شیت اندرویدی باز می‌کند؛ آیتم‌ها
   با دکمه‌ی «استفاده» واقعا مصرف می‌شوند (+ کارت مولوتوف: پرتاب)
   ================================================================== */
const BPK30 = {
  sheet: null, scrim: null, open: false,

  ensure() {
    if (this.sheet && document.body.contains(this.sheet)) return;
    const wrap = document.getElementById('wrap');
    /* اسکریم مشترک */
    if (!document.getElementById('shScrim30')) {
      const s = document.createElement('div');
      s.id = 'shScrim30';
      s.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        try { BPK30.close(); MYST30.close(); } catch (err) {}
      });
      wrap.appendChild(s);
    }
    this.scrim = document.getElementById('shScrim30');
    /* شیت کوله */
    const sh = document.createElement('div');
    sh.className = 'shSheet30';
    sh.id = 'bpkSheet30';
    sh.innerHTML =
      '<div class="shHandle30"></div>' +
      '<div class="shHead30">' +
        '<div class="shHic30"><i class="ic">' + (typeof ICO !== 'undefined' ? ICO.ico('backpack') : '') + '</i></div>' +
        '<div class="shTitle30">کوله‌پشتی<span class="shSub30">وسایل خریداری‌شده — همین‌جا مصرف کن</span></div>' +
        '<button class="shX30"><i class="ic">' + (typeof ICO !== 'undefined' ? ICO.ico('close') : '✕') + '</i></button>' +
      '</div>' +
      '<div class="shBody30" id="bpkBody30"></div>';
    sh.querySelector('.shX30').addEventListener('click', () => { SFX.click(); this.close(); });
    wrap.appendChild(sh);
    this.sheet = sh;
  },

  show() {
    this.ensure();
    this.render();
    this.open = true;
    this.sheet.classList.add('on');
    this.scrim.classList.add('on');
    /* شیت ساخت‌وساز هم باز باشد → ببند (تصادم نمی‌کنند) */
    try { if (typeof setBuildPanel === 'function') setBuildPanel(true, true); } catch (e) {}
    try { if (MYST30.sheet) MYST30.close(); } catch (e) {}
    SFX.click();
  },
  close() {
    if (!this.open) return;
    this.open = false;
    if (this.sheet) this.sheet.classList.remove('on');
    if (this.scrim && !MYST30.open) this.scrim.classList.remove('on');
  },

  /* محتوای شیت — آیتم‌های موجود + مولوتوف */
  render() {
    const body = document.getElementById('bpkBody30');
    if (!body) return;
    const defs = [];
    /* آیتم‌های داخل کوله (شمارش بر اساس نوع) */
    const counts = {};
    for (const s of state.backpack) if (s) counts[s.id] = (counts[s.id] || 0) + 1;
    for (const id of Object.keys(counts)) {
      const d = (typeof GEAR !== 'undefined' && GEAR[id]) || (typeof RARE !== 'undefined' && RARE[id]);
      if (d) defs.push({ id, name: d.name, desc: d.desc, n: counts[id], color: d.color, kind: 'pack' });
    }
    /* مولوتوف — پرتاب */
    if (typeof MYST !== 'undefined' && MYST.molotovs > 0) {
      defs.push({ id: 'molotov', name: 'کوکتل مولوتوف', desc: 'پرتاب روی متراکم‌ترین گله‌ی زامبی‌ها (شب)', n: MYST.molotovs, color: '#ff9a3c', kind: 'molo' });
    }
    if (defs.length === 0) {
      body.innerHTML = '<div class="bpkEmpty30">کوله‌پشتیت خالی است.<br>از تب «بقا» در ساخت‌وساز یا از دستفروش خرید کن.</div>';
      return;
    }
    body.innerHTML = '';
    for (const d of defs) {
      const card = document.createElement('div');
      card.className = 'bpkCard30';
      /* آیکن رنگی آیتم — همان نقاشِ کاشی‌های بازی */
      const ic = document.createElement('div');
      ic.className = 'bpkIc30';
      const cv = document.createElement('canvas');
      cv.width = 80; cv.height = 80;
      ic.appendChild(cv);
      if (d.id === 'molotov') {
        ic.innerHTML = '<i class="ic">' + (typeof ICO !== 'undefined' ? ICO.ico('molotov') : '') + '</i>';
        ic.style.color = '#ffb26e';
      } else if (typeof paintGearIcon === 'function') {
        try { paintGearIcon(d.id, cv); } catch (e) {}
      }
      if (d.n > 1) {
        const c = document.createElement('span');
        c.className = 'bpkCnt30'; c.textContent = '×' + faNum(d.n);
        ic.appendChild(c);
      }
      const n = document.createElement('div');
      n.className = 'bpkN30';
      n.innerHTML = '<div class="bpkName30">' + d.name + '</div><div class="bpkDesc30">' + d.desc + '</div>';
      const use = document.createElement('button');
      use.className = 'bpkUse30';
      use.textContent = d.kind === 'molo' ? 'پرتاب' : 'استفاده';
      const usable = d.kind === 'molo'
        ? (state.mode === 'playing' && state.zombies.some(z => !z.dead))
        : (state.mode === 'playing' || state.mode === 'day');
      if (!usable) use.classList.add('off');
      use.addEventListener('click', () => {
        if (d.kind === 'molo') {
          try {
            if (MYST.throwMolotov()) { snack30('مولوتوف پرتاب شد! 🔥', 'molotov'); this.render(); }
            else snack30('هدفی نیست — صبر کن نزدیک‌تر بشن', 'molotov');
          } catch (e) {}
          return;
        }
        const i = state.backpack.findIndex(s => s && s.id === d.id);
        if (i < 0) return;
        try { useItem(i); } catch (e) {}
        snack30(d.name + ' مصرف شد', 'backpack');
        this.render();
      });
      card.appendChild(ic); card.appendChild(n); card.appendChild(use);
      body.appendChild(card);
    }
  },
};

/* آیکون کوله (سرصفحه‌ی نوار) → باز کردن شیت؛ اسلات‌ها همان مصرف سریع‌اند */
(function backpackOpen30() {
  function bind() {
    const cap = document.getElementById('bpkCap');
    if (cap && !cap.dataset.bpk30) {
      cap.dataset.bpk30 = '1';
      cap.style.cursor = 'pointer';
      cap.addEventListener('click', (e) => {
        e.stopPropagation();
        BPK30.open ? BPK30.close() : BPK30.show();
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true });
  else bind();
  /* بعد از هر تغییر کوله، اگر شیت باز است تازه شود */
  const _rb = refreshBackpack;
  refreshBackpack = function () {
    _rb.apply(null, arguments);
    try { if (BPK30.open) BPK30.render(); } catch (e) {}
  };
})();

/* ==================================================================
   ۳۰-۵) بخش سرنخ‌ها — بازسازی کامل اندرویدی
   ================================================================== */
const CLUE_ICO30 =
  '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="10.2" cy="10.2" r="6.4"/>' +
    '<path d="M14.9 14.9L20.5 20.5"/>' +
    '<path d="M7.3 10.6c0-1.7 1.3-3 3-3 1.6 0 2.9 1.2 3 2.8" opacity=".9"/>' +
    '<path d="M7.3 13.6c.2.9.8 1.6 1.6 2" opacity=".55"/>' +
    '<path d="M10.2 6.9v1.2M6.9 10.2h1.2" opacity=".8"/>' +
  '</svg>';

/* CSS مکمل شیت سرنخ (کارت‌ها + معماها) */
(function cssMyst30() {
  const st = document.createElement('style');
  st.textContent = `
.shSheet30 .myst-body{padding:calc(4px * var(--uiz,1)) calc(14px * var(--uiz,1)) calc(16px * var(--uiz,1))!important;
  gap:calc(9px * var(--uiz,1))!important}
/* کارت سرنخ آرشیوشده */
.m30clue{display:flex;align-items:center;gap:calc(12px * var(--uiz,1));
  background:linear-gradient(180deg,rgba(46,58,96,.9),rgba(28,37,68,.9));
  border:1.5px solid #46609e;border-radius:calc(16px * var(--uiz,1));
  padding:calc(10px * var(--uiz,1)) calc(12px * var(--uiz,1));min-height:calc(60px * var(--uiz,1))}
.m30clue .mc-icon{width:calc(44px * var(--uiz,1));height:calc(44px * var(--uiz,1));flex:none;
  display:flex;align-items:center;justify-content:center;font-size:calc(21px * var(--uiz,1));
  background:radial-gradient(circle at 35% 30%,rgba(255,190,60,.25),rgba(255,150,40,.05));
  border:1.5px solid rgba(255,200,90,.4);border-radius:calc(12px * var(--uiz,1))}
.m30clue .mc-name{font-size:calc(14.5px * var(--uiz,1));font-weight:900;color:#ffe9b3}
.m30clue .mc-sub{font-size:calc(11.5px * var(--uiz,1));color:#aeb9d8;margin-top:calc(2px * var(--uiz,1));line-height:1.6}
/* کارت اکشن (معما/بقا) — دکمه‌ی متریال تمام‌عرض */
.m30act{display:flex;align-items:center;gap:calc(12px * var(--uiz,1));width:100%;text-align:right;
  cursor:pointer;font-family:inherit;min-height:calc(62px * var(--uiz,1));
  background:linear-gradient(180deg,#2a3a66,#182344);border:1.5px solid #4a629c;
  border-radius:calc(16px * var(--uiz,1));padding:calc(10px * var(--uiz,1)) calc(13px * var(--uiz,1));
  transition:transform .12s,border-color .12s;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.m30act:active{transform:scale(.97);border-color:#ffd873}
.m30act .m30ic{width:calc(42px * var(--uiz,1));height:calc(42px * var(--uiz,1));flex:none;
  display:flex;align-items:center;justify-content:center;font-size:calc(20px * var(--uiz,1));
  background:rgba(10,16,34,.6);border:1.5px solid #3d548c;border-radius:calc(12px * var(--uiz,1))}
.m30act .m30t{flex:1;min-width:0}
.m30act .m30n{font-size:calc(14.5px * var(--uiz,1));font-weight:900;color:#eef3ff;line-height:1.3}
.m30act .m30s{font-size:calc(11px * var(--uiz,1));font-weight:700;color:#93a3cc;line-height:1.55;margin-top:calc(2px * var(--uiz,1))}
.m30act .m30go{flex:none;color:#ffd873;width:calc(18px * var(--uiz,1));height:calc(18px * var(--uiz,1))}
.m30act .m30go svg{width:calc(18px * var(--uiz,1));height:calc(18px * var(--uiz,1))}
.m30act b{color:#ffd873}
.m30act .m30price{flex:none;display:inline-flex;align-items:center;gap:calc(4px * var(--uiz,1));
  background:rgba(20,15,4,.85);border:1.5px solid #c9922e;border-radius:99px;
  padding:calc(4px * var(--uiz,1)) calc(10px * var(--uiz,1));color:#ffd873;
  font-size:calc(12.5px * var(--uiz,1));font-weight:900}
.m30sep{display:flex;align-items:center;gap:calc(10px * var(--uiz,1));
  color:#8a94b4;font-size:calc(11px * var(--uiz,1));font-weight:800;letter-spacing:1px;
  padding:calc(4px * var(--uiz,1)) 0}
.m30sep::before,.m30sep::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.12)}
.myst-empty{font-size:calc(13px * var(--uiz,1));color:#9aa8cc;text-align:center;line-height:2;padding:calc(14px * var(--uiz,1)) 8px}
/* معماها — فشرده و لمسی */
.myst-hint{font-size:calc(12.5px * var(--uiz,1))!important;line-height:1.9!important;text-align:center;
  background:rgba(255,255,255,.05);border-radius:calc(11px * var(--uiz,1));
  padding:calc(9px * var(--uiz,1)) calc(11px * var(--uiz,1))!important}
.radio-dial input[type=range]{height:calc(46px * var(--uiz,1))!important}
.radio-read{font-size:calc(22px * var(--uiz,1))!important}
.radio-static{font-size:calc(13px * var(--uiz,1))!important;min-height:calc(22px * var(--uiz,1))}
.code-disp{font-size:calc(24px * var(--uiz,1))!important;letter-spacing:calc(7px * var(--uiz,1))!important;
  padding:calc(10px * var(--uiz,1)) 0!important}
.code-key{width:calc(56px * var(--uiz,1))!important;height:calc(48px * var(--uiz,1))!important;
  font-size:calc(18px * var(--uiz,1))!important;border-radius:calc(12px * var(--uiz,1))!important}
.fuse-wire{min-height:calc(58px * var(--uiz,1))!important}
.fuse-wire span{font-size:calc(13px * var(--uiz,1))!important}
.fuse-log{font-size:calc(12.5px * var(--uiz,1))!important}
`;
  document.head.appendChild(st);
})();

const MYST30 = {
  get sheet() { return MYST._panel; },
  get open() { return !!(MYST._panel && MYST._panel.classList.contains('on')); },
  close() { try { MYST.closePanel(); } catch (e) {} },
};

/* پوسته‌ی جدید — باتن‌شیت اندرویدی (جایگزین modal وسط‌چین قدیمی) */
MYST.panelShell = function (title) {
  this.closePanel();
  const wrap = document.getElementById('wrap');
  if (!document.getElementById('shScrim30')) {
    const s = document.createElement('div');
    s.id = 'shScrim30';
    s.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      try { MYST.closePanel(); BPK30.close(); } catch (err) {}
    });
    wrap.appendChild(s);
  }
  const sh = document.createElement('div');
  sh.className = 'shSheet30';
  sh.innerHTML =
    '<div class="shHandle30"></div>' +
    '<div class="shHead30">' +
      '<div class="shHic30">' + CLUE_ICO30 + '</div>' +
      '<div class="shTitle30">' + title + '<span class="shSub30">سرنخ‌ها و معماهای داستان</span></div>' +
      '<button class="shX30"><i class="ic">' + (typeof ICO !== 'undefined' ? ICO.ico('close') : '✕') + '</i></button>' +
    '</div>' +
    '<div class="shBody30 myst-body"></div>';
  sh.querySelector('.shX30').addEventListener('click', () => { SFX.click(); this.closePanel(); });
  wrap.appendChild(sh);
  /* انیمیشن ورود */
  requestAnimationFrame(() => requestAnimationFrame(() => sh.classList.add('on')));
  document.getElementById('shScrim30').classList.add('on');
  this._panel = sh;
  return sh;
};

MYST.closePanel = function () {
  if (this._radioNoise) { try { this._radioNoise.stop(); } catch (e) {} this._radioNoise = null; }
  if (this._panel) {
    const p = this._panel;
    p.classList.remove('on');
    setTimeout(() => p.remove(), 240);
    this._panel = null;
  }
  const sc = document.getElementById('shScrim30');
  if (sc && !BPK30.open) sc.classList.remove('on');
};

/* آرشیو سرنخ‌ها — کارت‌های متریال جدید (جایگزین فهرست قدیمی) */
const M30_GO = '<i class="m30go"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 6l-6 6 6 6"/></svg></i>';

MYST.openArchive = function () {
  this.closePanel();
  const av = this.avail();
  const wrap = this.panelShell('آرشیو سرنخ‌ها');
  const box = wrap.querySelector('.myst-body');
  let h = '';
  if (this.clues.length === 0 && av.length === 0) {
    h += '<div class="myst-empty">هنوز سرنخی نداری.<br>داستان را دنبال کن — راهنمایی‌ها در گفتگوها پنهان‌اند.</div>';
  }
  for (const c of this.clues) {
    h += '<div class="m30clue"><div class="mc-icon">' + c.icon + '</div>' +
      '<div><div class="mc-name">' + c.name + '</div><div class="mc-sub">' + c.sub + '</div></div></div>';
  }
  for (const a of av) {
    if (a === 'radio') h += '<button class="m30act" data-act="radio"><div class="m30ic">📻</div><div class="m30t"><div class="m30n">کوک کردن بی‌سیم</div><div class="m30s">فرکانس ایستگاه شمال را پیدا کن</div></div>' + M30_GO + '</button>';
    if (a === 'code') h += '<button class="m30act" data-act="code"><div class="m30ic">🔐</div><div class="m30t"><div class="m30n">قفل ایستگاه</div><div class="m30s">کد ۴رقمی از سرنخ‌ها</div></div>' + M30_GO + '</button>';
    if (a === 'fuse') h += '<button class="m30act" data-act="fuse"><div class="m30ic">💡</div><div class="m30t"><div class="m30n">جعبه‌ی فیوز</div><div class="m30s">سیم‌ها را به ترتیب وصل کن</div></div>' + M30_GO + '</button>';
  }
  /* اکشن‌های بقا */
  h += '<div class="m30sep">بقا</div>';
  h += '<button class="m30act" data-act="scav"><div class="m30ic">🔍</div><div class="m30t"><div class="m30n">جست‌وجوی محیط</div><div class="m30s">روزی یک‌بار — شانس قراضه یا مدکیت</div></div>' + M30_GO + '</button>';
  h += '<button class="m30act" data-act="molo"><div class="m30ic">' + (typeof ICO !== 'undefined' ? ICO.ico('molotov') : '🔥') + '</div>' +
    '<div class="m30t"><div class="m30n">ساخت کوکتل مولوتوف</div><div class="m30s">داری: <b class="m30cnt">' + faNum(this.molotovs) + '</b> از ۳ — شب، از ستون چپ پرتاب کن</div></div>' +
    '<span class="m30price">' + faNum(45) + ' 🪙</span></button>';
  box.innerHTML = h;
  box.querySelectorAll('.m30act').forEach((b) => {
    b.addEventListener('click', () => {
      const act = b.getAttribute('data-act');
      SFX.click();
      if (act === 'radio') this.openRadio();
      else if (act === 'code') this.openCode();
      else if (act === 'fuse') this.openFuse();
      else if (act === 'scav') this.scavenge();
      else if (act === 'molo') {
        if (this.craftMolotov()) {
          const cnt = box.querySelector('.m30cnt');
          if (cnt) cnt.textContent = faNum(this.molotovs);
          snack30('مولوتوف ساخته شد — ' + faNum(this.molotovs) + ' از ۳', 'molotov');
        }
      }
    });
  });
};

/* بازخوردهای خرید/ساخت — اسنک‌بار به‌جای اعلان متنی درشت */
MYST.craftMolotov = function () {
  if (this.molotovs >= 3) { SFX.deny(); snack30('مولوتوف پر است — حداکثر ۳ تا حمل کن', 'molotov'); return false; }
  if (state.coins < 45) { SFX.deny(); snack30('سکه کافی نیست — ۴۵ سکه لازم است', 'coin'); return false; }
  state.coins -= 45;
  this.molotovs++;
  SFX.placeT();
  updateHUD();
  return true;
};

MYST.scavenge = function () {
  if (state.mode !== 'day') return;
  if (this.scavengedWave === state.wave) { SFX.deny(); snack30('امروز جست‌وجو کردی — فردا دوباره', 'clue'); return; }
  this.scavengedWave = state.wave;
  const r = Math.random();
  this.closePanel();
  if (r < 0.42) {
    const c = 22 + Math.floor(rand(0, 26));
    state.coins += c;
    snack30('قراضه پیدا شد! +' + faNum(c) + ' سکه', 'coin');
    SFX.placeT();
  } else if (r < 0.72) {
    const heal = Math.min(22, state.tower.maxHp - state.tower.hp);
    state.tower.hp += heal;
    snack30(heal > 0 ? 'کمک‌های اولیه — برج ' + faNum(Math.round(heal)) + ' جون گرفت' : 'برج سالم است', 'medkit');
    SFX.placeT();
  } else {
    snack30('هیچی نبود — فقط خاک و سکوت...', 'clue');
    SFX.deny();
  }
};

/* دکمه‌ی سرنخ ستون چپ: آیکن تازه + دایره (متنش با CSS مخفی است) */
(function clueBtn30() {
  function patch() {
    const b = document.getElementById('mystBtn');
    if (!b) return;
    const ic = b.querySelector('.ic');
    if (ic) ic.innerHTML = CLUE_ICO30;
    if (!b.querySelector('.dot30')) {
      const d = document.createElement('span');
      d.className = 'dot30';
      b.appendChild(d);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', patch, { once: true });
  else patch();
  /* اگر بعدا دکمه ساخته شد (ensureBtn) هم آیکن تازه بگیرد */
  const _eb = MYST.ensureBtn.bind(MYST);
  MYST.ensureBtn = function () {
    _eb();
    try {
      const ic = this._btn && this._btn.querySelector('.ic');
      if (ic) ic.innerHTML = CLUE_ICO30;
      if (this._btn && !this._btn.querySelector('.dot30')) {
        const d = document.createElement('span');
        d.className = 'dot30';
        this._btn.appendChild(d);
      }
    } catch (e) {}
  };
})();

/* شیت‌های دیگر موقع باز شدن یکی از آن‌ها بسته شوند */
(function sheetGuards30() {
  const _ps = MYST.panelShell.bind(MYST);
  MYST.panelShell = function (t) {
    try { BPK30.close(); } catch (e) {}
    try { if (typeof setBuildPanel === 'function') setBuildPanel(true, true); } catch (e) {}
    return _ps(t);
  };
  /* شیت‌ها موقع گفتگو/کات‌سین/منو مخفی — و موقع تغییر فاز بسته */
  const st = document.createElement('style');
  st.textContent = '#wrap.dlg-on .shSheet30,#wrap.dlg-on #shScrim30,#wrap.cs-mode .shSheet30{display:none!important}';
  document.head.appendChild(st);
  UPDATE_HOOKS.push(function sheetsGuard30(dt) {
    try {
      const m = state.mode;
      if (m !== 'day' && m !== 'playing' && m !== 'intermission' && m !== 'paused') {
        if (MYST30.open) MYST.closePanel();
        if (BPK30.open) BPK30.close();
      }
    } catch (e) {}
  });
})();

/* ==================================================================
   ۳۰-۶) تنظیمات/درباره — بدون اسکرول: سربرگ فشرده + ردیف‌های کوتاه
   ================================================================== */
(function settingsFit30() {
  const st = document.createElement('style');
  st.textContent = `
/* کارت تنظیمات/درباره: بدون اسکرول — همه‌چیز در قاب */
#settingsScreen .m27-card,#aboutScreen .m27-card{
  max-height:calc(96% );overflow:hidden!important;
  width:min(94%,calc(410px * var(--uiz,1)))!important;
  padding:calc(12px * var(--uiz,1)) calc(13px * var(--uiz,1)) calc(11px * var(--uiz,1))!important;
  display:flex;flex-direction:column}
/* سربرگ: آیکن کوچک کنار عنوان — یک ردیف */
#settingsScreen .m27-card>.m27-icon,#aboutScreen .m27-card>.m27-icon{
  width:calc(44px * var(--uiz,1))!important;height:calc(44px * var(--uiz,1))!important;
  margin:0!important;font-size:calc(21px * var(--uiz,1))!important;flex:none}
#settingsScreen .m27-title,#aboutScreen .m27-title{
  font-size:calc(17.5px * var(--uiz,1))!important;margin:0!important;flex:1;text-align:right}
#settingsScreen .m27-sub,#aboutScreen .m27-sub{display:none!important}
.m27-headrow30{display:flex;align-items:center;gap:calc(11px * var(--uiz,1));
  margin-bottom:calc(9px * var(--uiz,1));flex:none}
/* ردیف‌های تنظیمات — کوتاه */
#settingsScreen .m27-row{min-height:calc(42px * var(--uiz,1))!important;
  padding:calc(6px * var(--uiz,1)) calc(12px * var(--uiz,1))!important;
  border-radius:calc(11px * var(--uiz,1))!important}
#settingsScreen .m27-row>span{font-size:calc(13px * var(--uiz,1))!important}
#settingsScreen .m27-list{gap:calc(6px * var(--uiz,1))!important;margin:0!important;flex:none}
#settingsScreen .m27-btn{min-height:calc(44px * var(--uiz,1))!important;
  font-size:calc(13.5px * var(--uiz,1))!important;border-radius:calc(12px * var(--uiz,1))!important}
#settingsScreen .m27-sep{margin:calc(2px * var(--uiz,1)) 0!important}
#settingsScreen .m27-row .vol{max-width:calc(140px * var(--uiz,1))!important}
/* درباره — متن فشرده‌تر در قاب */
#aboutScreen .m27-text{font-size:calc(11.5px * var(--uiz,1))!important;line-height:1.75!important;
  gap:calc(5px * var(--uiz,1))!important;padding:calc(9px * var(--uiz,1)) calc(11px * var(--uiz,1))!important;
  overflow:hidden!important;border-radius:calc(11px * var(--uiz,1))!important}
#aboutScreen .m27-btn{min-height:calc(44px * var(--uiz,1))!important;
  font-size:calc(13.5px * var(--uiz,1))!important;border-radius:calc(12px * var(--uiz,1))!important;
  margin-top:calc(9px * var(--uiz,1))!important}
#aboutScreen .about-credit{font-size:calc(11px * var(--uiz,1))!important}
/* صفحه‌ی کوتاه: باز هم فشرده‌تر */
@media (max-height:460px){
  #settingsScreen .m27-card,#aboutScreen .m27-card{padding:calc(9px * var(--uiz,1)) calc(10px * var(--uiz,1)) calc(8px * var(--uiz,1))!important}
  #settingsScreen .m27-row{min-height:calc(38px * var(--uiz,1))!important}
  #settingsScreen .m27-list{gap:calc(4px * var(--uiz,1))!important}
  #settingsScreen .m27-btn,#aboutScreen .m27-btn{min-height:calc(40px * var(--uiz,1))!important}
  #aboutScreen .m27-text{line-height:1.6!important;gap:calc(3px * var(--uiz,1))!important}
  .m27-headrow30{margin-bottom:calc(6px * var(--uiz,1))!important}
}
`;
  document.head.appendChild(st);

  /* سربرگ تنظیمات/درباره: آیکن + عنوان در یک ردیف flex */
  function compactHead(id) {
    const card = document.querySelector('#' + id + ' .m27-card');
    if (!card || card.dataset.hr30) return;
    card.dataset.hr30 = '1';
    const ic = card.querySelector('.m27-icon');
    const ti = card.querySelector('.m27-title');
    const sub = card.querySelector('.m27-sub');
    if (!ic || !ti) return;
    const row = document.createElement('div');
    row.className = 'm27-headrow30';
    ic.remove();
    if (sub) sub.remove();
    row.appendChild(ic);
    row.appendChild(ti);
    card.insertBefore(row, card.firstChild);
  }
  function heads30() { compactHead('settingsScreen'); compactHead('aboutScreen'); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', heads30, { once: true });
  else heads30();
})();

/* ---------- ۳۰-۷) حذف title های بومی (تولتیپ طولانی‌فشردن اندروید) ---------- */
(function stripTitles30() {
  function strip() {
    if (!(typeof IS_TOUCH !== 'undefined' ? IS_TOUCH : true)) return;
    document.querySelectorAll('#wrap [title]').forEach(el => {
      if (el.closest('.shSheet30') || el.closest('#bpkSheet30')) { el.removeAttribute('title'); return; }
      el.removeAttribute('title');
    });
  }
  setTimeout(strip, 1200);
  setTimeout(strip, 4000);
  window.addEventListener('load', () => setTimeout(strip, 800), { once: true });
})();

/* ---------- ۳۰-۸) راه‌اندازی ---------- */
function setup30() {
  try {
    const b = document.getElementById('mystBtn');
    if (b) {
      const ic = b.querySelector('.ic');
      if (ic) ic.innerHTML = CLUE_ICO30;
      if (!b.querySelector('.dot30')) { const d = document.createElement('span'); d.className = 'dot30'; b.appendChild(d); }
    }
    const pb = document.getElementById('pedReopenBtn');
    if (pb) { const ic = pb.querySelector('.ic'); if (ic) ic.innerHTML = (typeof ICO !== 'undefined' ? ICO.ico('cart') : ''); }
  } catch (e) {}
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup30, { once: true });
else setup30();
