/* ==================================================================
   سه طبقه تا بقا — نسخه‌ی ۱۲٫۰ — بخش ۱۱: موبایل/اندروید + کیفیت خودکار
   ==================================================================
   - تشخیص لمس → کلاس touch روی #wrap: دکمه‌های بزرگ‌تر، پنل‌های فشرده،
     تب‌های لمس‌پذیر، بدون تولتیپ hover؛ راهنمای چرخاندن گوشی در حالت عمودی
   - کیفیت خودکار: اگر میانگین FPS زیر ۴۲ بیفتد → حالت کم‌بار
     (نصف ذرات، بدون کرم شب‌تاب/شهاب اضافی) — روی گوشی‌های معمولی روان
   - دکمه‌ی تمام‌صفحه برای لمس؛ جلوگیری از زوم دوضربه/اسکرول
   - (۱۱٫۰) ذخیره و خروج: دکمه‌ی پنل توقف + سیو خودکار وقتی
     صفحه مخفی/بسته می‌شود (visibilitychange / beforeunload)
   ================================================================== */

const IS_TOUCH = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) ||
                 (matchMedia && matchMedia('(pointer:coarse)').matches);

/* ---------------------- ۱۱-۰) (۲۱٫۳) اندازه‌ی قاب بازی — تمام‌صفحه‌ی واقعی ----------------------
   قدیم: قاب ۹۶۰×۵۶۰ با حفظ نسبت وسط صفحه می‌نشست → روی گوشی‌های
   عریض، چپ و راست نوار سیاه می‌ماند و همه‌چیز ریز و «کم‌رنگ» به
   نظر می‌رسید.
   جدید: عرضِ دنیای بازی از همان نسبت صفحه محاسبه شده (W در
   v3_part2)؛ قاب با ابعاد منطقی W×H ساخته و با transform:scale
   دقیقاً تا لبه‌های صفحه کشیده می‌شود — بوم، HUD، منوها و متن‌ها
   همه با هم و یک‌نواخت بزرگ می‌شوند (متن‌ها دیگر له/ریز نمی‌شوند).
   • 100vh در گوشی نوار آدرس را هم حساب می‌کند → از visualViewport
   • مرورگرهای درون‌اپ گاهی vw/vh را اشتباه گزارش می‌کنند
   • تغییر جهت/چرخش/بازآمدن نوار آدرس → بازسازی فوری
   • مقیاس جاری در window.__fitScale (برای تبدیل مختصات تولتیپ‌ها) */
function fitWrap() {
  const el = document.getElementById('wrap');
  if (!el) return;
  const vv = window.visualViewport;
  let aw = (vv && vv.width) || window.innerWidth || document.documentElement.clientWidth || 960;
  let ah = (vv && vv.height) || window.innerHeight || document.documentElement.clientHeight || 560;
  const s = Math.min(aw / W, ah / H);            /* (W خودش هم‌نسبت صفحه است → s ≈ هر دو) */
  el.style.width = W + 'px';
  el.style.height = H + 'px';
  el.style.aspectRatio = 'auto';
  el.style.transform = 'scale(' + s + ')';
  el.style.transformOrigin = 'center center';
  window.__fitScale = s;
  /* (۱۹٫۰) صفحه‌های کوچک: کلاس sui → کوله‌پشتی و متن‌های ریز باز هم
     جمع‌تر می‌شوند تا زمین بازی/زامبی‌های ورودی دیده بمانند */
  el.classList.toggle('sui', W * s < 760);
}
window.addEventListener('resize', fitWrap, { passive: true });
window.addEventListener('orientationchange', () => setTimeout(fitWrap, 250));
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', fitWrap);
  window.visualViewport.addEventListener('scroll', fitWrap);
}
window.addEventListener('load', fitWrap);
fitWrap();

/* ---------------------- ۱۱-۱) کیفیت خودکار — (۱۸٫۱) فرماندار سه‌پله‌ای ----------------------
   قبلاً فقط «شهاب/کرم شب‌تاب» خاموش می‌شد و فقط در حالت playing سنجش می‌شد.
   حالا سنجش در «همه‌ی حالت‌ها» از خودِ حلقه‌ی اصلی (PERF.tick در v3_part4)
   انجام می‌شود و سه پله دارد:
   • پله ۰: کیفیت کامل (DPR اولیه + همه‌ی افکت‌ها)
   • پله ۱: DPR→1 (نیم‌ششدن پیکسل‌های GPU) + حذف افکت‌های زینتی (perf-low)
   • پله ۲: همه‌ی بالا + لکه‌های خون/لکه‌های تاریکی/ابرها نصف (perf-vlow)
   افت پایدار ۲ثانیه‌ای → پله پایین‌تر؛ بازیابی پایدار ۱۰ثانیه‌ای → پله
   بالاتر (با قفل ۸ثانیه‌ای بعد از هر ارتقا تا نوسان نکند) */
const PERF = {
  tier: 0, fps: 60, _acc: 0, _n: 0, _badT: 0, _goodT: 0, _lockT: 3,
  get low() { return this.tier > 0; },          // سازگاری با گیت‌های قدیمی (۱۱٫۰)
  update(dt) { this.tick(dt); },                // سازگاری با UPDATE_HOOKS قدیمی
  tick(dt) {
    if (dt <= 0 || dt > 0.25) return;           // تب مخفی/پرش زمانی → نادیده
    this._acc += dt; this._n++;
    if (this._acc < 0.5) return;
    this.fps = this._n / this._acc;
    this._acc = 0; this._n = 0;
    if (this._lockT > 0) { this._lockT -= 0.5; return; }
    const th = this.tier === 0 ? 44 : (this.tier === 1 ? 32 : 0);
    if (this.fps < th && th > 0) {
      this._badT += 0.5;
      if (this._badT >= 2) { this._badT = 0; this.setTier(this.tier + 1); }
    } else {
      this._badT = 0;
      if (this.fps > 57 && this.tier > 0) {
        this._goodT += 0.5;
        if (this._goodT >= 10) {
          this._goodT = 0;
          this.setTier(this.tier - 1);
          this._lockT = 8;                      // بعد از ارتقا، مدتی قفل
        }
      } else this._goodT = 0;
    }
  },
  setTier(t) {
    t = Math.max(0, Math.min(2, t));
    if (t === this.tier) return;
    this.tier = t;
    try { setDPR(t >= 1 ? 1 : DPR0); } catch (e) {}
    document.body.classList.toggle('perf-low', t >= 1);
    document.body.classList.toggle('perf-vlow', t >= 2);
  },
};
UPDATE_HOOKS.push(dt => PERF.update(dt));

/* ---------------------- ۱۱-۲) کلاس لمس + ورودی‌های لمسی ---------------------- */
/* (۱۴٫۰) راهنمای چرخش برای همه (نه فقط لمس): پنجره/گوشیِ عمودی → راهنمای
   تمام‌صفحه؛ تابع برای تست هم روی window قابل دسترس است */
function orientHint() {
  const portrait = window.innerHeight > window.innerWidth;
  const w = $('wrap'), hint = $('rotateHint');
  if (w) w.classList.toggle('portrait', portrait);
  if (hint) hint.classList.toggle('hidden', !portrait);
}
window.ttbOrient = orientHint;
window.addEventListener('resize', orientHint);
window.addEventListener('orientationchange', () => setTimeout(orientHint, 250));
orientHint();

if (IS_TOUCH) {
  document.documentElement.classList.add('touch-html');
  window.addEventListener('load', () => {
    const w = $('wrap');
    if (w) w.classList.add('touch');
  });
  /* جلوگیری از زوم دوضربه و منوی طولانی‌فشردن */
  document.addEventListener('contextmenu', e => { if (e.target && e.target.id === 'game') e.preventDefault(); });
  document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
  document.addEventListener('touchmove', e => { if (e.target && e.target.id === 'game') e.preventDefault(); }, { passive: false });
}

/* دکمه‌ی تمام‌صفحه — فقط روی لمس (دسکتاپ F11 دارد) */
function toggleFullscreen() {
  try {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      (el.requestFullscreen || el.webkitRequestFullscreen || function() {}).call(el);
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen || function() {}).call(document);
    }
  } catch (e) {}
}

/* ---------------------- (۲۰٫۰) آماده‌ی APK: دکمه‌ی بازگشت اندروید ----------------------
   داخل کپاسیتور/کوردوا، دکمه‌ی Back گوشی رویداد «backbutton» می‌دهد؛
   در وبِ معمولی popstate. رفتار: صفحه‌ی تنظیمات/درباره باز → بستن؛
   وسط بازی → توقف؛ در توقف → بازگشت به بازی؛ در منو → هیچ (خروج با دکمه) */
function apkBackButton() {
  try {
    /* صفحات کمکی باز هستند؟ (۲۰٫۱: راهنما حذف شد) */
    const open = ['settingsScreen', 'aboutScreen', 'saveCodeScreen', 'confirmBox'];
    for (const id of open) {
      const el = $(id);
      if (el && !el.classList.contains('hidden')) {
        SFX.click();
        hideScreen(id);
        if (id === 'settingsScreen') { try { applySettings(); saveSettings(); } catch (e) {} }
        return;
      }
    }
    if (state.mode === 'paused') { resumeGame(); return; }
    if (state.mode === 'playing' || state.mode === 'day' || state.mode === 'intermission') {
      pauseGame();
      return;
    }
    /* (۲۱٫۲) منوی اصلی + APK بومیِ WebView → خروج تمیز از برنامه
       (پلِ ttbNative فقط در پوسته‌ی اندرویدی ما وجود دارد) */
    if (state.mode === 'start' && window.ttbNative && window.ttbNative.exit) {
      try { window.ttbNative.exit(); } catch (e) {}
      return;
    }
    /* در حالت‌های سینمایی/انتقال، چیزی نکن — دکمه‌ی «رد کردن» خودش هست */
  } catch (e) {}
}
document.addEventListener('backbutton', apkBackButton, false);          /* کوردوا/کپاسیتور */
window.addEventListener('popstate', () => {                            /* مرورگر/APK های وب‌محور */
  if (window.Capacitor || document.body.classList.contains('in-app')) apkBackButton();
});
/* تشخیص درون‌اپ: کپاسیتور/کوردوا → حالت تمام‌صفحه بدون سایه
   (۲۱٫۲) WebView خالیِ APK سفارشی هم — با نشانه‌ی «wv» در UA — شناسایی می‌شود */
(function detectInApp() {
  const wvUA = /;\s*wv\)/.test(navigator.userAgent || '');
  const inApp = !!(window.Capacitor || window.cordova || window.androidBridge || wvUA);
  if (inApp) document.body.classList.add('in-app');
  if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
    try { window.Capacitor.Plugins.App.addListener('backButton', apkBackButton); } catch (e) {}
  }
})();
/* جلوگیری از pull-to-refresh و اسکرول لمسی — فقط روی صحنه‌ی بازی
   (پنل‌های HTML داخل #wrap خودشان مدیریت می‌شوند) */
document.addEventListener('touchmove', e => {
  const t = e.target;
  if (t && (t.id === 'game' || t === document.body || t === document.documentElement)) {
    if (e.cancelable) e.preventDefault();
  }
}, { passive: false });

/* ---------------------- ۱۱-۳) ذخیره و خروج + سیو خودکارِ خروج ---------------------- */
/* دکمه‌ی پنل توقف: ذخیره‌ی وسط بازی و برگشت امن به منو */
window.addEventListener('load', () => {
  const b = $('btnSaveExit');
  if (b) b.addEventListener('click', () => {
    if (state.mode !== 'paused') return;
    resumeGame();          // اول از توقف دربیاور تا state سالم باشد
    saveAndExit();
  });
  /* دکمه‌ی تمام‌صفحه کنار دکمه‌های HUD (لمسی) */
  if (IS_TOUCH) {
    const rail = $('ctlRail');
    if (rail) {
      const fs = document.createElement('button');
      fs.className = 'ctl-btn';
      fs.id = 'btnFull';
      fs.title = 'تمام‌صفحه';
      fs.textContent = '⛶';
      fs.addEventListener('click', toggleFullscreen);
      rail.appendChild(fs);
    }
  }
});

/* سیو خودکار وقتی کاربر می‌رود بیرون/صفحه را می‌بندد
   (۱۳٫۰) pagehide هم اضافه شد — روی موبایل از visibilitychange مطمئن‌تر است */
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) return;
  if (['playing', 'day', 'intermission'].includes(state.mode)) {
    try { saveGame(); } catch (e) {}
  }
});
window.addEventListener('pagehide', () => {
  if (['playing', 'day', 'intermission'].includes(state.mode)) {
    try { saveGame(); } catch (e) {}
  }
});
window.addEventListener('beforeunload', () => {
  if (['playing', 'day', 'intermission'].includes(state.mode)) {
    try { saveGame(); } catch (e) {}
  }
});

/* دیباگ API */
if (typeof window.GAME !== 'undefined') {
  GAME.perf = PERF;
  GAME.isTouch = IS_TOUCH;
  GAME.saveAndExit = saveAndExit;
  GAME.exitToMenu = exitToMenu;
}

/* ---------------------- (۱۷٫۰) فرمان با کج‌کردن گوشی ----------------------
   در مینی‌گیم رانندگی (انتقال فصل ۱→۲): شیبِ چپ/راست گوشی = فرمان.
   فقط وقتی مؤثر است که نه کلید و نه لمسِ فرمان فعال باشد (DRV.kb)
   تا با ورودی‌های دیگر نجنگد. اندروید بدون اجازه کار می‌کند؛ iOS
   بدون درخواستِ اجازه رویداد نمی‌دهد — بی‌صدا نادیده گرفته می‌شود. */
if (IS_TOUCH && typeof window.DeviceOrientationEvent !== 'undefined') {
  window.addEventListener('deviceorientation', e => {
    if (e.gamma == null) return;
    if (typeof DRV === 'undefined' || !DRV) return;
    if (DRV.kb) return;                          /* کلید/لمس فرمان فعال است */
    const g = clamp(e.gamma, -24, 24) / 18;      /* ±۱۸ درجه = فرمان کامل */
    if (TR && TR.phase === 2 && MG.cfg && isRideTheme(MG.cfg.theme)) {   /* (۱۹٫۰) هر سه تم */
      DRV.steer = clamp(g, -1, 1);
    }
  });
}
