/* ==================================================================
   سه طبقه تا مرگ — v36 — ماژول بازخورد جدید کاربر
   ------------------------------------------------------------------
   · ریل چپ: جابه‌جایی دایره‌ی دستفروش ↔ کوله (کوله وسط، دستفروش پایین)
     + آیکون جدید کوله (سبک مرجع کاربر: بدنه‌ی سرمه‌ای + بندهای طلایی)
   · کوله و سرنخ‌ها: پنل کوچک وسط صفحه (دیگر از پایین باز نمی‌شود)
   · نام کاشی‌های ساخت‌وساز: اُورلی وسطِ عکس کاشی (نه زیر آن)
   · اعلان‌های بالای صفحه: توست فشرده اندرویدی — دیگر روی بخش‌های
     دیگر نمی‌افتد
   · کارایی: updateHUD/updateBossBar با حداقل ۱۲۰ms فاصله — رفع
     هنگِ صفحه با زیاد شدن زامبی‌ها (به‌روزرسانی DOM در هر ضربه)
   ================================================================== */
(function v36boot() {
'use strict';
if (window.__V36) return;
window.__V36 = { rail: 1, bpkIcon: 1, sheetCenter: 1, tileName: 1, announce: 1, perf: 1 };

/* ---------- ۳۶-۰) CSS ---------- */
(function css36() {
  var st = document.createElement('style');
  st.textContent = `
/* ==== (۳۶) ریل چپ: جابه‌جایی دستفروش ↔ کوله ====
   روز: [سرنخ‌ها ۷۸] [کوله ۱۴۸] [دستفروش ۲۱۸]
   شب: [چراغ‌قوه ۷۸] [کوله ۱۴۸] [مولوتوف ۲۱۸] */
#bpkBtn34{top:calc(148px * var(--uiz,1))!important}
#pedReopenBtn{top:calc(218px * var(--uiz,1))!important}
#molotovBtn{top:calc(218px * var(--uiz,1))!important}

/* ==== (۳۶) شیت‌ها: دیالوگ کوچک وسط صفحه (مثل ساخت‌وساز) — نه از پایین ==== */
.sheet34{left:50%!important;right:auto!important;bottom:auto!important;top:50%!important;
  transform:translate(-50%,-46%) scale(.93)!important;opacity:0!important;
  width:calc(480px * var(--uiz,1))!important;max-width:94%!important;max-height:86%!important;
  border-radius:calc(20px * var(--uiz,1))!important;
  border:1.5px solid rgba(232,181,74,.5)!important;
  box-shadow:0 22px 60px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.04),inset 0 1px 0 rgba(255,255,255,.08)!important;
  transition:transform .22s cubic-bezier(.2,1,.32,1),opacity .17s ease!important}
.sheet34.in34{transform:translate(-50%,-50%) scale(1)!important;opacity:1!important}
.sh-grab34{display:none!important}
.sh-body34{padding:calc(9px * var(--uiz,1)) calc(12px * var(--uiz,1)) calc(12px * var(--uiz,1))}

/* ==== (۳۶) نام کاشی: وسطِ عکس کاشی (اُورلی) ==== */
.bp-tile .bp-name{
  position:absolute!important;left:50%!important;top:40%!important;right:auto!important;bottom:auto!important;
  transform:translate(-50%,-50%)!important;
  max-width:calc(104px * var(--uiz,1))!important;width:auto!important;
  font-size:calc(9px * var(--uiz2,1))!important;font-weight:900;color:#ffffff!important;
  text-align:center!important;line-height:1.35!important;white-space:normal!important;
  padding:calc(2.5px * var(--uiz,1)) calc(9px * var(--uiz,1))!important;
  background:rgba(4,8,18,.68)!important;border-radius:calc(9px * var(--uiz,1))!important;
  border:1px solid rgba(255,255,255,.14)!important;
  box-sizing:border-box!important;overflow:hidden!important;
  display:-webkit-box!important;-webkit-line-clamp:2!important;-webkit-box-orient:vertical!important;
  text-shadow:0 1px 2px rgba(0,0,0,.9)!important;pointer-events:none;z-index:2;
  margin:0!important;flex:none!important}
#buildPanel .bp-ic{margin-top:calc(3px * var(--uiz,1))}

/* ==== (۳۶) اعلان مرکزی → توست فشرده‌ی بالای صفحه (اندرویدی) ====
   قبلاً: متن درشت وسط صفحه که روی باس‌بار/برج/ریل می‌افتاد */
#announce{top:calc(86px * var(--uiz2,1))!important;left:50%!important;right:auto!important;
  transform:translateX(-50%)!important;width:auto!important;max-width:calc(min(88vw, 520px) / var(--uiz2,1))!important;
  background:linear-gradient(180deg,rgba(17,26,52,.96),rgba(9,15,34,.96))!important;
  border:1.5px solid rgba(232,181,74,.55)!important;border-radius:calc(14px * var(--uiz2,1))!important;
  padding:calc(7px * var(--uiz2,1)) calc(18px * var(--uiz2,1)) calc(8px * var(--uiz2,1))!important;
  box-shadow:0 12px 34px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.09)!important;
  z-index:14!important;backdrop-filter:blur(2px)}
#announce .big{font-size:calc(16.5px * var(--uiz2,1))!important;font-weight:900;color:#ffd873!important;
  line-height:1.5!important;text-shadow:0 1px 3px rgba(0,0,0,.9)!important}
#announce .sub{font-size:calc(11px * var(--uiz2,1))!important;color:#dbe5fa!important;margin-top:2px!important;
  line-height:1.55!important;text-shadow:0 1px 2px rgba(0,0,0,.9)!important}
#announce .sub:empty{display:none!important}
@media (max-height:430px){
  #announce{top:calc(78px * var(--uiz,1))!important}
}

/* ==== (۳۶) گفتگوی کات‌سین: بالا صفحه — پایین برای ماشین/ارشان آزاد ==== */
#wrap.cine-mode #dlgBox{bottom:auto!important;top:calc(10px * var(--uiz,1))!important;
  max-width:calc(88% )!important}
#wrap.cine-mode #dlgTextWrap{max-width:calc(560px * var(--uiz,1))!important}
#wrap.cine-mode #dlgPortrait{width:calc(84px * var(--uiz,1))!important;height:calc(84px * var(--uiz,1))!important}
#wrap.cine-mode #dlgText{font-size:calc(15px * var(--uiz,1))!important;line-height:1.7!important;min-height:calc(26px * var(--uiz,1))!important}

`;
  document.head.appendChild(st);
})();

/* ---------- ۳۶-۱) آیکون جدید کوله‌پشتی (سبک مرجع کاربر) ----------
   کوله‌پشتی سه‌بعدیِ قهرمانِ بازی‌های بقا: بدنه‌ی سرمه‌ای + درِ روشن‌تر
   + دو بندِ عمودی طلایی + سگکِ مرکزی — بر اساس آیکونی که کاربر داد */
var BPK_SVG36 =
  '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">' +
  '<defs>' +
  '<linearGradient id="bpkB36" x1="0" y1="0" x2="0" y2="1">' +
  '<stop offset="0" stop-color="#364a75"/><stop offset=".5" stop-color="#1b2949"/><stop offset="1" stop-color="#101a30"/></linearGradient>' +
  '<linearGradient id="bpkF36" x1="0" y1="0" x2="0" y2="1">' +
  '<stop offset="0" stop-color="#4f6da6"/><stop offset="1" stop-color="#2c406e"/></linearGradient>' +
  '<linearGradient id="bpkG36" x1="0" y1="0" x2="0" y2="1">' +
  '<stop offset="0" stop-color="#ffe08a"/><stop offset=".55" stop-color="#f2b93c"/><stop offset="1" stop-color="#c98a1e"/></linearGradient>' +
  '</defs>' +
  '<path d="M9.4 6.9V5.5c0-1.2 1-2.1 2.1-2.1h1c1.2 0 2.1 1 2.1 2.1v1.4" fill="none" stroke="#2c406e" stroke-width="1.8" stroke-linecap="round"/>' +
  '<rect x="4.4" y="6.5" width="15.2" height="14.2" rx="3.9" fill="url(#bpkB36)" stroke="#0b1220" stroke-width=".7"/>' +
  '<path d="M4.4 10.6c0-2.3 1.8-4.1 4.1-4.1h7c2.3 0 4.1 1.8 4.1 4.1v.7c0 2.1-1.7 3.8-3.8 3.8H8.2c-2.1 0-3.8-1.7-3.8-3.8z" fill="url(#bpkF36)"/>' +
  '<rect x="7.5" y="8.8" width="2.2" height="11.9" rx="1.1" fill="url(#bpkG36)" stroke="#8a5f14" stroke-width=".4"/>' +
  '<rect x="14.3" y="8.8" width="2.2" height="11.9" rx="1.1" fill="url(#bpkG36)" stroke="#8a5f14" stroke-width=".4"/>' +
  '<rect x="9" y="12.6" width="6" height="4.5" rx="1.4" fill="url(#bpkG36)" stroke="#8a5f14" stroke-width=".5"/>' +
  '<rect x="10.5" y="13.9" width="3" height="2" rx=".9" fill="#5c3f0e"/>' +
  '<path d="M5.8 8.3c.5-1.1 1.5-1.7 2.6-1.8" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1.1" stroke-linecap="round"/>' +
  '</svg>';

(function bpkIcon36() {
  /* دکمه‌ی ریل — فقط عنصر <i> عوض می‌شود تا نشان عددی (badge) بماند */
  function apply36() {
    try {
      var b = document.getElementById('bpkBtn34');
      if (b) {
        var ic = b.querySelector('i.ic');
        if (ic) ic.innerHTML = BPK_SVG36;
        else b.insertAdjacentHTML('afterbegin', '<i class="ic">' + BPK_SVG36 + '</i>');
      }
      /* شیتِ بازشده‌ی قبلی */
      var sh = document.getElementById('bpkSheet34');
      if (sh) {
        var hi = sh.querySelector('.sh-ic34');
        if (hi) hi.innerHTML = BPK_SVG36;
      }
    } catch (e) {}
  }
  apply36();
  setTimeout(apply36, 600);
  setTimeout(apply36, 2500);
  /* شیت وقتی ساخته شد (اولین باز شدن) آیکونش تازه شود */
  try {
    var wrap = document.getElementById('wrap');
    if (wrap && window.MutationObserver) {
      var obs = new MutationObserver(function (muts) {
        for (var m = 0; m < muts.length; m++) {
          var add = muts[m].addedNodes;
          for (var i = 0; i < add.length; i++) {
            var n = add[i];
            if (n && n.id === 'bpkSheet34') {
              var hi = n.querySelector && n.querySelector('.sh-ic34');
              if (hi) hi.innerHTML = BPK_SVG36;
            }
          }
        }
      });
      obs.observe(wrap, { childList: true });
    }
  } catch (e) {}
})();

/* ---------- ۳۶-۲) کارایی: ضد-هنگِ صفحه با زیاد شدن زامبی‌ها ----------
   ریشه‌ی هنگ: killZombie و damageTower در «هر ضربه» updateHUD را
   صدا می‌زدند → refreshBuildPanel روی همه‌ی کاشی‌ها + چیپ‌ها + DOM
   در هر فریم چند بار → لایه‌بندی مجدد بی‌وقفه. حالا: حداکثر هر ۱۲۰ms */
(function perf36() {
  /* updateHUD — انباشتگی با فاصله‌ی حداقل ۱۲۰ms */
  if (typeof updateHUD === 'function' && !updateHUD.__36) {
    var _real36 = updateHUD;
    var _last36 = 0, _tm36 = null;
    updateHUD = function () {
      if (_tm36) return;                        /* یکی در صف است — همین کافی است */
      var wait = Math.max(0, 120 - (performance.now() - _last36));
      _tm36 = setTimeout(function () {
        _tm36 = null;
        _last36 = performance.now();
        try { _real36(); } catch (e) {}
      }, wait);
    };
    updateHUD.__36 = true;
  }
  /* updateBossBar — نوشتنِ width در هر فریم فقط وقتی عدد واقعاً عوض شده */
  if (typeof updateBossBar === 'function' && !updateBossBar.__36) {
    var _ub36 = updateBossBar;
    var _w36 = -1, _vis36 = null;
    updateBossBar = function () {
      try {
        var boss = (typeof state !== 'undefined') ? state.zombies.find(function (z) { return z.type === 'boss' && !z.dead; }) : null;
        if (boss) {
          var w = Math.round(clamp(boss.hp / boss.maxHp, 0, 1) * 250);
          if (w !== _w36) { _w36 = w; _ub36(); }
        } else if (_vis36 !== false) { _vis36 = false; _ub36(); }
        else _vis36 = true;
      } catch (e) { try { _ub36(); } catch (e2) {} }
    };
    updateBossBar.__36 = true;
  }
})();

})();
