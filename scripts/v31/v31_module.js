
/* ==================================================================
   «سه طبقه تا مرگ» v31 — بازسازی منوها بر اساس عکس‌های واقعی گوشی
   ==================================================================
   گزارش کاربر (عکس‌های ۲۳۴۰×۱۰۸۰ گوشی سامسونگ):
   ۱) دستفروش مرموز: متن‌ها روی هم، ناخوانا → بازسازی کامل ردیف‌ها
   ۲) ساخت‌وساز: «همه‌ی وسایل با هم» → ریشه: display:flex!important
      روی .bp-tile که فیلترینگ تب‌ها را می‌کشت (رفع در CSS بالا)
   ۳) سه تفنگ زیر دکمه‌ی توقف + دکمه‌ی سرنخ روی آن → جابه‌جایی کامل
      چیپ‌ها به پایین‌وسطِ صفحه (دور از توقف/سرنخ/داک/کوله/شب‌شود)
   ۴) نویز خش‌خش رادیو بعد از حل معما تا ابد می‌ماند → stop درستِ
      منبع صدا + پاک‌سازی در خروج
   ۵) چراغ‌قوه/کوله خیلی ریز و بدبرش → دکمه و آیکون درشت‌تر
   ۶) بعد از «ذخیره و خروج» سرنخ‌ها هنوز کنار منو → مخفی در menu-mode
   ۷) «ذخیره شد» باید یک‌بار در منو دیده شود و بعد برود → z-index و
      محو خودکار (منو updateAnnounce را تیک نمی‌زند)
   ۸) آیکون «شروع بازی» خراب → شمشیرهای متقاطعِ درشت و ضخیم
   ۹) لوگوهای چسبیده به گوشه‌ی دکمه‌ها → فاصله‌گذاری
   ۱۰) برجک تک‌تیرانداز آیکون «دوربین دید در شب» شده بود → برگشت به
      اسپرایت اصلیِ برجک (سه‌پایه + لوله‌ی بلند)
   ۱۱) خروج از بازی = قطع کامل صدا (موسیقی/پد/باد/نویز/صداپخش)
   ۱۲) تست خودکار «هیچ دکمه‌ای روی هیچ‌دکمه‌ای نمی‌افتد» (test_v31)
   ================================================================== */

/* ---------- ۳۱-۱) CSS — همه‌ی اصلاحات بصری ---------- */
(function css31() {
  const st = document.createElement('style');
  st.textContent = `
/* ==== (۳۱) چیپ سلاح‌ها → پایین‌وسط؛ دور از توقف/سرنخ/داک ==== */
#wpnChips28 {
  top: auto !important;
  bottom: calc(9px * var(--uiz,1)) !important;
  left: 50% !important;
  right: auto !important;
  transform: translateX(-50%) !important;
  flex-direction: row !important;
  gap: calc(7px * var(--uiz,1)) !important;
  z-index: 7 !important;
  padding: calc(5px * var(--uiz,1)) calc(8px * var(--uiz,1)) !important;
  border-radius: calc(24px * var(--uiz,1)) !important;
  background: rgba(8,14,30,.68) !important;
  border: 1px solid rgba(94,124,196,.4) !important;
  box-shadow: 0 6px 20px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.06) !important;
}
#wpnChips28 .wchip28 { margin: 0 !important; }

/* ==== (۳۱) دستفروش مرموز — بازسازی کامل چیدمان ====
   ردیف = [آیکون] [نام + توضیح] [قیمت + خرید] — جریان flex خالص؛
   هیچ عنصری position:absolute ندارد تا روی متن دیگری نیفتد */
#peddlerPanel {
  width: min(calc(478px * var(--uiz,1)), 94%) !important;
  max-height: 86% !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}
#peddlerPanel .pd-head {
  gap: calc(10px * var(--uiz,1)) !important;
  padding: calc(10px * var(--uiz,1)) calc(12px * var(--uiz,1)) !important;
  flex: 0 0 auto !important;
}
#peddlerPanel .pd-note {
  flex: 0 0 auto !important;
  margin: calc(7px * var(--uiz,1)) calc(2px * var(--uiz,1)) 0 !important;
  font-size: calc(12px * var(--uiz,1)) !important;
  line-height: 1.6 !important;
}
#pdStock {
  display: flex !important;
  flex-direction: column !important;
  gap: calc(9px * var(--uiz,1)) !important;
  flex: 1 1 auto !important;
  min-height: 0 !important;
  margin: calc(8px * var(--uiz,1)) 0 0 !important;
  padding: calc(2px * var(--uiz,1)) calc(2px * var(--uiz,1)) calc(6px * var(--uiz,1)) !important;
  overflow-y: auto !important;
  overscroll-behavior: contain !important;
  -webkit-overflow-scrolling: touch !important;
}
/* ردیف تازه‌ی کالا (DOM تازه در renderPeddlerStockِ v31) */
.pd-row31 {
  display: flex !important;
  align-items: center !important;
  gap: calc(10px * var(--uiz,1)) !important;
  padding: calc(9px * var(--uiz,1)) calc(11px * var(--uiz,1)) !important;
  min-height: calc(72px * var(--uiz,1)) !important;
  border-radius: calc(15px * var(--uiz,1)) !important;
  border: 1.5px solid #5c4c9e !important;
  background: linear-gradient(180deg, rgba(56,44,102,.96), rgba(38,30,72,.96)) !important;
  cursor: pointer;
  flex: 0 0 auto !important;
  transition: transform .12s, border-color .12s !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.07) !important;
}
.pd-row31:active { transform: scale(.97) !important; }
.pd-row31.poor { opacity: .62 !important; }
.pd-row31.bp31 {
  background: linear-gradient(180deg, rgba(64,45,17,.96), rgba(42,29,10,.96)) !important;
  border-color: #c9954a !important;
  box-shadow: 0 0 12px rgba(232,181,74,.22), inset 0 1px 0 rgba(255,255,255,.08) !important;
}
.pd-row31 .pd-ic31 {
  width: calc(54px * var(--uiz,1)) !important;
  height: calc(54px * var(--uiz,1)) !important;
  flex: none !important;
  border-radius: calc(13px * var(--uiz,1)) !important;
  background: rgba(10,8,24,.62) !important;
  border: 1px solid #4a3d84 !important;
  object-fit: contain !important;
  padding: calc(4px * var(--uiz,1)) !important;
}
.pd-row31 .pd-mid31 {
  flex: 1 1 auto !important;
  min-width: 0 !important;
}
.pd-row31 .pd-name31 {
  font-size: calc(14px * var(--uiz,1)) !important;
  font-weight: 900 !important;
  color: #eee6ff !important;
  line-height: 1.45 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
.pd-row31 .pd-name31 .ic { font-size: calc(15px * var(--uiz,1)) !important; color: #ffd873 !important; }
.pd-row31 .pd-sub31 {
  font-size: calc(11.5px * var(--uiz,1)) !important;
  color: #a89ecf !important;
  line-height: 1.6 !important;
  margin-top: calc(2px * var(--uiz,1)) !important;
  display: -webkit-box !important;
  -webkit-line-clamp: 2 !important;
  -webkit-box-orient: vertical !important;
  overflow: hidden !important;
}
.pd-row31 .pd-new31 {
  font-style: normal !important;
  font-size: calc(9px * var(--uiz,1)) !important;
  font-weight: 900 !important;
  color: #0d2a12 !important;
  background: #7be389 !important;
  border-radius: calc(5px * var(--uiz,1)) !important;
  padding: 0 calc(4px * var(--uiz,1)) !important;
  margin-inline-start: calc(4px * var(--uiz,1)) !important;
}
.pd-row31 .pd-buy31 {
  flex: none !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  gap: calc(4px * var(--uiz,1)) !important;
}
.pd-row31 .pd-price31 {
  display: inline-flex !important;
  align-items: center !important;
  gap: calc(4px * var(--uiz,1)) !important;
  font-size: calc(14px * var(--uiz,1)) !important;
  font-weight: 900 !important;
  color: #ffd873 !important;
  white-space: nowrap !important;
  background: rgba(4,8,18,.9) !important;
  border: 1px solid #4a3d1e !important;
  border-radius: 999px !important;
  padding: calc(3px * var(--uiz,1)) calc(12px * var(--uiz,1)) !important;
}
.pd-row31 .pd-price31 .coin-ic { width: calc(13px * var(--uiz,1)) !important; height: calc(13px * var(--uiz,1)) !important; }
.pd-row31.poor .pd-price31 { color: #e06a5a !important; }
.pd-row31 .pd-go31 {
  font-size: calc(10.5px * var(--uiz,1)) !important;
  font-weight: 900 !important;
  color: #8fd6ff !important;
  letter-spacing: .3px;
}

/* ==== (۳۱) چراغ‌قوه — دکمه و آیکون درشت (قابل‌تشخیص) ==== */
#ctlFlash {
  width: calc(66px * var(--uiz,1)) !important;
  height: calc(66px * var(--uiz,1)) !important;
}
#ctlFlash .ic .ic30,
#ctlFlash .ic svg {
  width: calc(37px * var(--uiz,1)) !important;
  height: calc(37px * var(--uiz,1)) !important;
}
#ctlFlash .ctl-batt {
  width: calc(34px * var(--uiz,1)) !important;
  height: calc(6px * var(--uiz,1)) !important;
}

/* ==== (۳۱) کوله‌پشتی — قرص درشت‌تر + آیکون درشت ==== */
#backpackBar .bpk-cap {
  padding: calc(8px * var(--uiz,1)) calc(13px * var(--uiz,1)) !important;
  border-radius: calc(15px * var(--uiz,1)) !important;
  gap: calc(7px * var(--uiz,1)) !important;
}
#backpackBar .bpk-cap .ic30 {
  width: calc(30px * var(--uiz,1)) !important;
  height: calc(30px * var(--uiz,1)) !important;
  border-radius: calc(9px * var(--uiz,1)) !important;
  margin-inline-end: 0 !important;
}
#backpackBar .bpk-cap .ic { font-size: calc(24px * var(--uiz,1)) !important; }
.bpk-slot {
  width: calc(46px * var(--uiz,1)) !important;
  height: calc(46px * var(--uiz,1)) !important;
}
.bpk-slot canvas { width: calc(41px * var(--uiz,1)) !important; height: calc(41px * var(--uiz,1)) !important; }

/* ==== (۳۱) منو — بقایای بازی مخفی + آیکون‌های درشت با فاصله ==== */
#wrap.menu-mode #mystBtn,
#wrap.menu-mode #listenBtn,
#wrap.menu-mode #molotovBtn,
#wrap.menu-mode #pedReopenBtn,
#wrap.menu-mode #saveToast { display: none !important; }
/* «ذخیره شد» باید در منو هم دیده شود (روی لایه‌ی منو) */
#wrap.menu-mode #announce { z-index: 30 !important; }
/* دکمه‌های منو: آیکون درشت‌تر + فاصله از گوشه‌ها (لوگو چسبیده نباشد) */
.m23-btn { padding-inline: calc(16px * var(--uiz,1)) !important; }
.m23-ico svg {
  width: calc(34px * var(--uiz,1)) !important;
  height: calc(34px * var(--uiz,1)) !important;
  stroke-width: 2.2 !important;
}
.m23-small .m23-ico svg {
  width: calc(25px * var(--uiz,1)) !important;
  height: calc(25px * var(--uiz,1)) !important;
}
.m23-ico { margin-inline-end: calc(2px * var(--uiz,1)) !important; }
/* دکمه‌های کوچک منو هم فاصله بگیرند */
.mini-btn { padding: calc(11px * var(--uiz,1)) calc(24px * var(--uiz,1)) !important; }
/* «شب شود» — چسبیده به گوشه (FAB حذف شده؛ gap ۸۲px دیگر بی‌معنی) */
#bpNight { right: calc(14px * var(--uiz,1)) !important; }
/* برچسب FAB قدیمی اگر جایی مانده باشد */
#bpFab28 { display: none !important; }
`;
  document.head.appendChild(st);
})();

/* ---------- ۳۱-۲) بازسازی قفسه‌ی دستفروش مرموز ---------- */
(function merchant31() {
  if (typeof renderPeddlerStock !== 'function' || renderPeddlerStock.__31) return;
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
      /* آیکون: PNG مرجع کاربر اگر بود؛ وگرنه همان نقاشی کانواسِ gear */
      let ic = '';
      const png = (typeof PDICONS30 !== 'undefined' && PDICONS30[it.id] &&
        typeof ICONS30 !== 'undefined' && ICONS30[PDICONS30[it.id]]) || null;
      if (png) {
        ic = '<img class="pd-ic31" alt="" src="' + png + '">';
      } else {
        try {
          const cv = document.createElement('canvas');
          paintGearIcon(it.id, cv);
          ic = '<img class="pd-ic31" alt="" src="' + cv.toDataURL() + '">';
        } catch (e) {}
      }
      el.innerHTML =
        ic +
        '<div class="pd-mid31">' +
          '<div class="pd-name31">' +
            (it.bp && typeof ICO !== 'undefined' ? '<i class="ic">' + ICO.ico('blueprint') + '</i> ' : '') +
            r.name + (it.fresh ? ' <em class="pd-new31">تازه!</em>' : '') +
          '</div>' +
          '<div class="pd-sub31">' + r.desc + '</div>' +
        '</div>' +
        '<div class="pd-buy31">' +
          '<span class="pd-price31"><i class="coin-ic"></i>' + faNum(r.price) + '</span>' +
          '<span class="pd-go31">برای خرید بزن</span>' +
        '</div>';
      el.addEventListener('click', () => buyRare(it));
      box.appendChild(el);
    }
    /* اگر همه خریداری شد، پنل بسته شود */
    if (!box.children.length) { hidePeddlerPanel(); return; }
    try { drawPeddlerFace(); } catch (e) {}
    $('peddlerBox').classList.remove('hidden');
  };
  renderPeddlerStock.__31 = true;
})();

/* ---------- ۳۱-۳) رفع نویز ابدیِ رادیو ----------
   ریشه: closePanel روی wrapper ــِ {src,g,flt} متد stop() می‌زد
   (چنین متدی وجود ندارد → خطای بی‌صدا → نویز برای همیشه) */
(function radio31() {
  try {
    if (typeof MYST === 'undefined' || !MYST || MYST.closePanel.__31) return;
    const _cp = MYST.closePanel.bind(MYST);
    MYST.closePanel = function () {
      try {
        if (this._radioNoise && typeof Snd !== 'undefined' && Snd.ctx) {
          const t = Snd.ctx.currentTime;
          try {
            this._radioNoise.g.gain.cancelScheduledValues(t);
            this._radioNoise.g.gain.setTargetAtTime(0.0001, t, 0.02);
          } catch (e) {}
          try { this._radioNoise.src.stop(t + 0.07); } catch (e) {}
        }
      } catch (e) {}
      this._radioNoise = null;
      return _cp();
    };
    MYST.closePanel.__31 = true;
    /* ایمنی: وقتی شب می‌شود هم نویز رادیو خاموش شود */
    if (typeof startNight === 'function' && !startNight.__31rz) {
      const _sn = startNight;
      startNight = function () {
        try { if (MYST._radioNoise) MYST.closePanel(); } catch (e) {}
        return _sn.apply(this, arguments);
      };
      startNight.__31rz = true;
    }
  } catch (e) {}
})();

/* ---------- ۳۱-۴) خروج از بازی = قطع کامل صدا ---------- */
(function exitSound31() {
  function duckMusic31() {
    try {
      if (typeof Snd !== 'undefined' && Snd.musicGain && Snd.ctx) {
        const t = Snd.ctx.currentTime;
        Snd.musicGain.gain.cancelScheduledValues(t);
        Snd.musicGain.gain.setValueAtTime(Math.max(0.0001, Snd.musicGain.gain.value), t);
        Snd.musicGain.gain.linearRampToValueAtTime(0.0001, t + 0.35);
      }
    } catch (e) {}
  }
  function unduckMusic31() {
    try {
      if (typeof Snd !== 'undefined' && Snd.musicGain && Snd.ctx && Snd.musicOn !== false) {
        const t = Snd.ctx.currentTime;
        Snd.musicGain.gain.cancelScheduledValues(t);
        Snd.musicGain.gain.setValueAtTime(Math.max(0.0001, Snd.musicGain.gain.value), t);
        Snd.musicGain.gain.linearRampToValueAtTime(1, t + 0.5);
      }
    } catch (e) {}
  }
  window.__unduckMusic31 = unduckMusic31;
  try {
    if (typeof exitToMenu === 'function' && !exitToMenu.__31) {
      const _exit = exitToMenu;
      exitToMenu = function () {
        /* اول نویز/گفتار را ببند */
        try { if (typeof MYST !== 'undefined' && MYST && MYST._radioNoise) MYST.closePanel(); } catch (e) {}
        try { if (typeof VOICE !== 'undefined' && VOICE) VOICE.stop(); } catch (e) {}
        const r = _exit.apply(this, arguments);
        /* بعد از خروج: موسیقیِ خودِ منو که exitToMenu روشن کرده بود،
           طبق درخواست کاربر کلاً قطع می‌شود (به‌همراه پد و باد) */
        try { if (typeof MUSIC !== 'undefined' && MUSIC) MUSIC.fadeStop(); } catch (e) {}
        duckMusic31();
        return r;
      };
      exitToMenu.__31 = true;
    }
  } catch (e) {}
  /* دفعه‌ی بعد که موسیقی/بازی روشن شود، صدا برمی‌گردد */
  try {
    if (typeof MUSIC !== 'undefined' && MUSIC && MUSIC.set && !MUSIC.set.__31) {
      const _set = MUSIC.set.bind(MUSIC);
      MUSIC.set = function (name) { unduckMusic31(); return _set(name); };
      MUSIC.set.__31 = true;
    }
  } catch (e) {}
  /* حتی اگر جایی MUSIC.set نزند، شروع شب/روز صدا را برمی‌گرداند */
  try {
    if (typeof startNight === 'function' && !startNight.__31snd) {
      const _sn = startNight;
      startNight = function () { unduckMusic31(); return _sn.apply(this, arguments); };
      startNight.__31snd = true;
    }
    if (typeof enterDay === 'function' && !enterDay.__31) {
      const _ed = enterDay;
      enterDay = function () { unduckMusic31(); return _ed.apply(this, arguments); };
      enterDay.__31 = true;
    }
  } catch (e) {}
})();

/* ---------- ۳۱-۵) «ذخیره شد» — یک‌بار در منو، بعد محو ----------
   منو updateAnnounce را تیک نمی‌زند → خودمان بعد از ~۳.۴ ثانیه
   محوش می‌کنیم تا برای همیشه روی منو نماند */
(function savedToast31() {
  try {
    if (typeof saveAndExit !== 'function' || saveAndExit.__31) return;
    const _se = saveAndExit;
    saveAndExit = function () {
      const r = _se.apply(this, arguments);
      setTimeout(() => { try { hideAnnounce(); } catch (e) {} }, 3400);
      return r;
    };
    saveAndExit.__31 = true;
  } catch (e) {}
})();

/* ---------- ۳۱-۶) آیکون قبلیِ برجک تک‌تیرانداز ----------
   v30 تصویر «دوربین دید در شب» را روی این برجک گذاشته بود؛
   کاربر: «اصلا برجک نیست — همون قبلی رو بزار» */
(function sniperIcon31() {
  try {
    const ORIG = '__SNIPER_URI__';
    const im = new Image();
    im.onload = () => { try { repaintCubeIcons('sniper'); } catch (e) {} };
    im.src = ORIG;
    try { if (typeof CUBE_SPRITES !== 'undefined' && CUBE_SPRITES) CUBE_SPRITES.sniper = ORIG; } catch (e) {}
    try { if (typeof CUBE_IMGS !== 'undefined' && CUBE_IMGS) CUBE_IMGS.sniper = im; } catch (e) {}
    try { if (typeof SPRITE30 !== 'undefined' && SPRITE30) delete SPRITE30.sniper; } catch (e) {}
    try { repaintCubeIcons('sniper'); } catch (e) {}
  } catch (e) {}
})();

/* ---------- ۳۱-۷) آیکون «شروع بازی» — شمشیرهای متقاطعِ درشت ----------
   قبلی: شمشیر تکیِ نازک که مثل مداد دیده می‌شد (گزارش کاربر) */
(function startIcon31() {
  try {
    if (typeof ICO === 'undefined' || !ICO || !ICO.I) return;
    const S = (inner) =>
      '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
    ICO.I.sword30 = S(
      '<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/>' +
      '<line x1="13" y1="19" x2="19" y2="13"/>' +
      '<line x1="16" y1="16" x2="20" y2="20"/>' +
      '<line x1="19" y1="21" x2="21" y2="19"/>' +
      '<polyline points="14.5 6.5 18 3 21 3 21 6 17.5 10"/>' +
      '<line x1="5" y1="14" x2="9" y2="18"/>' +
      '<line x1="7" y1="17" x2="4" y2="20"/>' +
      '<line x1="3" y1="19" x2="5" y2="21"/>'
    );
    /* اگر منو قبلاً رندر شده، آیکون را تازه کنیم */
    setTimeout(() => {
      try {
        document.querySelectorAll('.m23-ico[data-ico="sword30"]').forEach(b => {
          b.innerHTML = ICO.I.sword30;
        });
      } catch (e) {}
    }, 60);
  } catch (e) {}
})();
