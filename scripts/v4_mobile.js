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

/* ---------------------- ۱۱-۰) (۱۴٫۰) اندازه‌ی قاب بازی ----------------------
   کل بازی (۹۶۰×۵۶۰) بدون برش در صفحه جا شود — با JS چون:
   • 100vh در گوشی نوار آدرس را هم حساب می‌کند (پایین بریده می‌شد)
   • مرورگرهای درون‌اپ گاهی vw/vh را اشتباه گزارش می‌کنند («صفحه نصفه»)
   • تغییر جهت/چرخش/بازآمدن نوار آدرس → بازسازی فوری */
function fitWrap() {
  const el = document.getElementById('wrap');
  if (!el) return;
  const vv = window.visualViewport;
  let aw = (vv && vv.width) || window.innerWidth || document.documentElement.clientWidth || 960;
  let ah = (vv && vv.height) || window.innerHeight || document.documentElement.clientHeight || 560;
  /* حاشیه‌ی امن: حداقل ۶px از هر طرف */
  aw = Math.max(200, aw - 12);
  ah = Math.max(140, ah - 12);
  const s = Math.min(aw / 960, ah / 560);
  const w = Math.round(960 * s), h = Math.round(560 * s);
  if (Math.abs(el.offsetWidth - w) > 1 || Math.abs(el.offsetHeight - h) > 1) {
    el.style.width = w + 'px';
    el.style.height = h + 'px';
    el.style.aspectRatio = 'auto';
  }
}
window.addEventListener('resize', fitWrap, { passive: true });
window.addEventListener('orientationchange', () => setTimeout(fitWrap, 250));
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', fitWrap);
  window.visualViewport.addEventListener('scroll', fitWrap);
}
window.addEventListener('load', fitWrap);
fitWrap();

/* ---------------------- ۱۱-۱) کیفیت خودکار ---------------------- */
const PERF = {
  low: false, fps: 60, _acc: 0, _n: 0, _lowT: 0,
  update(dt) {
    if (dt <= 0) return;
    this._acc += dt; this._n++;
    if (this._acc >= 0.5) {
      this.fps = this._n / this._acc;
      this._acc = 0; this._n = 0;
      if (this.fps < 42) {
        this._lowT += 0.5;
        if (!this.low && this._lowT >= 3) {
          this.low = true;
          /* یک‌بار پیکربندی سبک روشن شود */
          document.body.classList.add('perf-low');
        }
      } else this._lowT = Math.max(0, this._lowT - 0.5);
    }
  },
};
UPDATE_HOOKS.push(dt => PERF.update(dt));

/* لایه‌ی سبک: کم‌کردن ذرات از راه دور */
document.addEventListener('DOMContentLoaded', () => {
  if (document.body.classList.contains('perf-low')) return;
});

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
