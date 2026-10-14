#!/usr/bin/env python3
"""Replace the exitSound31 section inside the HTML with the v2 (menu-silent flag) version."""
import re

HTML = '/home/z/my-project/download/three-floors-to-survival.html'
html = open(HTML, encoding='utf-8').read()

NEW = '''/* ---------- ۳۱-۴) خروج از بازی = قطع کامل صدا ----------
   نکته‌ی حیاتی: MUSIC.update() هر فریم، حالت منو را به موسیقی منو
   مپ می‌کند و پد/باد را هم برمی‌گرداند → هر قطعِ ساده یک فریم بعد
   خنثی می‌شد. راه‌حل: پرچم «منوی بی‌صدا» که تا شروعِ بازیِ بعدی
   (جدید/ادامه/تلاش دوباره) بی‌صدا نگه می‌دارد. */
(function exitSound31() {
  window.__menuSilent31 = false;
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
  function clearSilent31() { window.__menuSilent31 = false; unduckMusic31(); }
  window.__unduckMusic31 = clearSilent31;
  try {
    if (typeof exitToMenu === 'function' && !exitToMenu.__31) {
      const _exit = exitToMenu;
      exitToMenu = function () {
        try { if (typeof MYST !== 'undefined' && MYST && MYST._radioNoise) MYST.closePanel(); } catch (e) {}
        try { if (typeof VOICE !== 'undefined' && VOICE) VOICE.stop(); } catch (e) {}
        const r = _exit.apply(this, arguments);
        /* طبق درخواست کاربر: بعد از خروج، صدای بازی کلاً قطع می‌شود */
        window.__menuSilent31 = true;
        try { if (typeof MUSIC !== 'undefined' && MUSIC) { MUSIC._want = null; MUSIC.fadeStop(); MUSIC.stop(); } } catch (e) {}
        duckMusic31();
        return r;
      };
      exitToMenu.__31 = true;
    }
  } catch (e) {}
  /* MUSIC.update هر فریم صدا زده می‌شود — در منویِ بی‌صدا همه‌ی
     خودکارها (set منو / برگرداندن امبینت) را دور می‌زنیم */
  try {
    if (typeof MUSIC !== 'undefined' && MUSIC && MUSIC.update && !MUSIC.update.__31) {
      const _up = MUSIC.update.bind(MUSIC);
      MUSIC.update = function () {
        if (window.__menuSilent31) {
          const m = (typeof state !== 'undefined') ? state.mode : '';
          if (m === 'start' || m === 'intro' || m === 'paused') {
            try { if (MUSIC.timer) MUSIC.fadeStop(); } catch (e) {}
            try { MUSIC._want = null; } catch (e) {}
            duckMusic31();
            return;
          }
          /* اگر از منو بازیِ جدیدی شروع شد، پرچم برداشته می‌شود */
          window.__menuSilent31 = false;
        }
        return _up();
      };
      MUSIC.update.__31 = true;
    }
  } catch (e) {}
  /* شروع بازی جدید / ادامه / تلاش دوباره = برگشتن صدا */
  try {
    if (typeof startNewGame === 'function' && !startNewGame.__31clr) {
      const _s = startNewGame;
      startNewGame = function () { clearSilent31(); return _s.apply(this, arguments); };
      startNewGame.__31clr = true;
    }
    if (typeof continueGame === 'function' && !continueGame.__31clr) {
      const _c = continueGame;
      continueGame = function () { clearSilent31(); return _c.apply(this, arguments); };
      continueGame.__31clr = true;
    }
    if (typeof retryFromSave === 'function' && !retryFromSave.__31clr) {
      const _r = retryFromSave;
      retryFromSave = function () { clearSilent31(); return _r.apply(this, arguments); };
      retryFromSave.__31clr = true;
    }
  } catch (e) {}
  /* شروع شب/روز هم صدا را برمی‌گرداند (اگر از مسیر بالا رد نشد) */
  try {
    if (typeof startNight === 'function' && !startNight.__31snd) {
      const _sn = startNight;
      startNight = function () { clearSilent31(); return _sn.apply(this, arguments); };
      startNight.__31snd = true;
    }
    if (typeof enterDay === 'function' && !enterDay.__31) {
      const _ed = enterDay;
      enterDay = function () { clearSilent31(); return _ed.apply(this, arguments); };
      enterDay.__31 = true;
    }
  } catch (e) {}
})();'''

# find the old section: from the ۳۱-۴ header to the start of ۳۱-۵ header
start = html.index('/* ---------- ۳۱-۴)')
end = html.index('/* ---------- ۳۱-۵)')
old = html[start:end]
html = html[:start] + NEW + '\n\n' + html[end:]
open(HTML, 'w', encoding='utf-8').write(html)
print('replaced exitSound31 section. old len:', len(old), 'new len:', len(NEW))
