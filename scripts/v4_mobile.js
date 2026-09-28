/* ==================================================================
   سه طبقه تا بقا — نسخه‌ی ۱۱٫۰ — بخش ۱۱: موبایل/اندروید + کیفیت خودکار
   ==================================================================
   - تشخیص لمس → کلاس touch روی #wrap: دکمه‌های بزرگ‌تر، پنل‌های فشرده،
     بدون تولتیپ hover؛ راهنمای چرخاندن گوشی در حالت عمودی
   - کیفیت خودکار: اگر میانگین FPS زیر ۴۲ بیفتد → حالت کم‌بار
     (نصف ذرات، بدون کرم شب‌تاب/شهاب اضافی) — روی گوشی‌های معمولی روان
   - دکمه‌ی تمام‌صفحه برای لمس؛ جلوگیری از زوم دوضربه/اسکرول
   - (۱۱٫۰) ذخیره و خروج: دکمه‌ی پنل توقف + سیو خودکار وقتی
     صفحه مخفی/بسته می‌شود (visibilitychange / beforeunload)
   ================================================================== */

const IS_TOUCH = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) ||
                 (matchMedia && matchMedia('(pointer:coarse)').matches);

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
  /* اگر صفحه عمودی شد، راهنمای چرخش خودکار می‌آید (توسط JS — چون .hidden!important است) */
  const orient = () => {
    const w = $('wrap'), hint = $('rotateHint');
    if (w) w.classList.toggle('portrait', window.innerHeight > window.innerWidth);
    if (hint) hint.classList.toggle('hidden', !(window.innerHeight > window.innerWidth));
  };
  window.addEventListener('resize', orient);
  window.addEventListener('orientationchange', () => setTimeout(orient, 250));
  orient();
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
    const bar = document.querySelector('#hud .hud-group:last-child');
    if (bar) {
      const fs = document.createElement('button');
      fs.className = 'hud-btn';
      fs.id = 'btnFull';
      fs.title = 'تمام‌صفحه';
      fs.textContent = '⛶';
      fs.addEventListener('click', toggleFullscreen);
      bar.appendChild(fs);
    }
  }
});

/* سیو خودکار وقتی کاربر می‌رود بیرون/صفحه را می‌بندد */
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) return;
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
