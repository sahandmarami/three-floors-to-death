/* ==================================================================
   سه طبقه تا مرگ — v34 — ماژول بازسازی کامل
   ------------------------------------------------------------------
   · ریل چپ یکدست: سه دایره‌ی هم‌سایز، دقیقاً زیر هم (۷۰px فاصله)
     روز: [سرنخ‌ها] [دستفروش] [کوله] — شب: [چراغ‌قوه] [مولوتوف] [کوله]
   · بازسازی کامل پرونده‌ی سرنخ‌ها: باتن‌شیت اندرویدی (مثل داک ساخت‌وساز)
     + خرید مولوتوف بدون هیچ بازنویسی متن کارت (فقط نشان عددی)
   · کوله‌پشتی تعاملی: دکمه در ریل + باتن‌شیت مصرف وسایل
   · زامبی‌های منوی اصلی: درشت‌تر، خمیده، درازکش، ترسناک
   · منوی اصلی روشن‌تر (پالت مستقیم در HTML اصلاح شد)
   ================================================================== */
(function v34boot() {
'use strict';
if (window.__V34) return;          /* یک‌بار اجرا */
window.__V34 = { rail: 1, clueSheet: 1, bpkSheet: 1, zombies: 1, flags: 0 };

/* ---------- ۳۴-۰) آیکون‌های SVG تازه ---------- */
var SVG34 = {
  /* پرونده‌ی سرنخ: پوشه + ذره‌بین + اثر انگشت — سبک متریال */
  clue: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M3.6 7.4c0-1 .8-1.8 1.8-1.8h3.2c.6 0 1.1.27 1.45.74l.85 1.16h6.7c1 0 1.8.8 1.8 1.8v2"/>' +
    '<path d="M3.6 7.4v9.8c0 1 .8 1.8 1.8 1.8h3.4"/>' +
    '<circle cx="13.6" cy="14.2" r="3.9"/>' +
    '<path d="M16.6 17.2l3 3"/>' +
    '<path d="M12.3 12.3c.75-.6 1.9-.75 2.8-.25" opacity=".75"/>' +
    '<path d="M11.9 15.5c.1-.95.9-1.7 1.9-1.8" opacity=".5"/>' +
    '</svg>',
  /* کوله‌پشتی متریال */
  backpack: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M8.2 6.3V5.4c0-1.7 1.7-3 3.8-3s3.8 1.3 3.8 3v.9"/>' +
    '<rect x="5" y="6.3" width="14" height="13.2" rx="3.4"/>' +
    '<path d="M8.6 6.3c0-1.1 1.5-2 3.4-2s3.4.9 3.4 2"/>' +
    '<path d="M9.4 12.1h5.2"/>' +
    '<path d="M8.2 19.5v1.2M15.8 19.5v1.2" opacity=".55"/>' +
    '</svg>',
};

/* ---------- ۳۴-۱) CSS ---------- */
(function css34() {
  var st = document.createElement('style');
  st.textContent = `
/* ==== (۳۴) ریل چپ یکدست — سه دایره‌ی هم‌سایز زیر هم ==== */
#mystBtn,#pedReopenBtn,#ctlFlash,#molotovBtn,#bpkBtn34{
  width:calc(58px * var(--uiz,1))!important;height:calc(58px * var(--uiz,1))!important;
  left:calc(12px * var(--uiz,1))!important;border-radius:50%!important;
  padding:0!important;display:flex;align-items:center;justify-content:center;
  -webkit-tap-highlight-color:transparent;touch-action:manipulation;line-height:1}
#mystBtn span,#pedReopenBtn span{display:none!important}
#mystBtn{top:calc(78px * var(--uiz,1))!important;
  background:linear-gradient(180deg,#8a5a17,#503608)!important;border:2px solid #e8b54a!important;
  box-shadow:0 8px 20px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.2)!important}
#mystBtn .ic{font-size:calc(26px * var(--uiz,1))!important;color:#ffd873!important;margin:0!important}
#pedReopenBtn{top:calc(148px * var(--uiz,1))!important;
  background:linear-gradient(180deg,#3d2a63,#231640)!important;border:2px solid #8f6fd4!important;
  box-shadow:0 8px 20px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.16)!important}
#pedReopenBtn .ic{font-size:calc(24px * var(--uiz,1))!important;color:#cdb2f5!important}
#ctlFlash{top:calc(78px * var(--uiz,1))!important;
  background:linear-gradient(180deg,#5a4a17,#33290a)!important;border:2px solid #d4b34a!important;
  border-radius:50%!important}
#ctlFlash .ic{font-size:calc(22px * var(--uiz,1))!important;color:#ffe9b0!important}
#ctlFlash .ctl-batt{margin-top:calc(2px * var(--uiz,1))}
#molotovBtn{top:calc(148px * var(--uiz,1))!important}
#bpkBtn34{position:absolute;top:calc(218px * var(--uiz,1));z-index:7;cursor:pointer;font-family:inherit;
  background:linear-gradient(180deg,#23355e,#131e38);border:2px solid #4a629c;color:#bcd0ff;
  box-shadow:0 8px 20px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.14)}
#bpkBtn34 .ic{font-size:calc(25px * var(--uiz,1));color:#a8d8ff}
#bpkBtn34:active{transform:scale(.93)}
#wrap.menu-mode #bpkBtn34,#wrap.cine-mode #bpkBtn34,#wrap.cs-mode #bpkBtn34,
#wrap.go-mode #bpkBtn34,#wrap.dlg-on #bpkBtn34{display:none!important}
/* نشان‌های عددی ریل */
.rl-badge34{position:absolute;top:calc(-4px * var(--uiz,1));inset-inline-end:calc(-4px * var(--uiz,1));
  min-width:calc(20px * var(--uiz,1));height:calc(20px * var(--uiz,1));padding:0 calc(4px * var(--uiz,1));
  display:flex;align-items:center;justify-content:center;border-radius:999px;
  font-size:calc(11.5px * var(--uiz,1));font-weight:900;color:#fff;
  background:linear-gradient(180deg,#e04b3a,#a92c1e);border:1.5px solid #ffd873;
  box-shadow:0 2px 8px rgba(0,0,0,.55);pointer-events:none}
/* باتن‌شیت اندرویدی — پایین صفحه */
#sheetBk34{position:absolute;inset:0;z-index:25;background:rgba(3,6,16,.55);display:none;
  -webkit-tap-highlight-color:transparent}
#sheetBk34.open{display:block}
.sheet34{position:absolute;left:calc(10px * var(--uiz,1));right:calc(10px * var(--uiz,1));bottom:0;z-index:26;
  background:linear-gradient(180deg,#18203a,#0c1224);
  border:1.5px solid rgba(232,181,74,.45);border-bottom:none;border-radius:calc(22px * var(--uiz,1)) calc(22px * var(--uiz,1)) 0 0;
  box-shadow:0 -18px 50px rgba(0,0,0,.65),inset 0 1px 0 rgba(255,255,255,.07);
  max-height:calc(86% );overflow:hidden;display:none;flex-direction:column;
  transform:translateY(108%);transition:transform .26s cubic-bezier(.2,1,.32,1)}
.sheet34.open{display:flex}
.sheet34.in34{transform:translateY(0)}
.sh-grab34{width:calc(44px * var(--uiz,1));height:calc(4px * var(--uiz,1));border-radius:99px;
  background:rgba(190,205,240,.35);margin:calc(8px * var(--uiz,1)) auto 0;flex:none}
.sh-head34{display:flex;align-items:center;gap:calc(9px * var(--uiz,1));
  padding:calc(8px * var(--uiz,1)) calc(12px * var(--uiz,1)) calc(8px * var(--uiz,1));flex:none;
  border-bottom:1px solid rgba(232,181,74,.28)}
.sh-ic34{width:calc(38px * var(--uiz,1));height:calc(38px * var(--uiz,1));flex:none;
  display:flex;align-items:center;justify-content:center;font-size:calc(21px * var(--uiz,1));color:#ffd873;
  background:radial-gradient(circle at 32% 28%,rgba(232,181,74,.28),rgba(10,14,28,.5));
  border:1.5px solid rgba(232,181,74,.55);border-radius:calc(12px * var(--uiz,1))}
.sh-tx34{flex:1;min-width:0}
.sh-tx34 b{display:block;font-size:calc(15.5px * var(--uiz,1));font-weight:900;color:#ffe9b3;line-height:1.4}
.sh-tx34 span{display:block;font-size:calc(10px * var(--uiz,1));color:#9aa8cc;font-weight:700;margin-top:1px}
.sh-x34{width:calc(42px * var(--uiz,1));height:calc(42px * var(--uiz,1));flex:none;cursor:pointer;font-family:inherit;
  border-radius:calc(12px * var(--uiz,1));border:1px solid #5a4a2a;background:rgba(0,0,0,.3);
  color:#ffd873;font-size:calc(17px * var(--uiz,1));
  -webkit-tap-highlight-color:transparent;touch-action:manipulation}
.sh-x34:active{transform:scale(.92)}
.sh-body34{padding:calc(10px * var(--uiz,1)) calc(12px * var(--uiz,1)) calc(12px * var(--uiz,1));
  overflow-y:auto;overscroll-behavior:contain;display:flex;flex-direction:column;gap:calc(8px * var(--uiz,1))}
.sh-sec34{display:flex;align-items:center;gap:calc(9px * var(--uiz,1));
  color:#8fa3c8;font-size:calc(11px * var(--uiz,1));font-weight:900;letter-spacing:1.5px;margin-top:calc(2px * var(--uiz,1))}
.sh-sec34 i{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(120,146,200,.45),transparent)}
.sh-sec34.gold{color:#ffd873}
.sh-sec34.gold i{background:linear-gradient(90deg,transparent,rgba(232,181,74,.5),transparent)}
/* کارت‌های باتن‌شیت — لمسی درشت، متن یک‌خطی */
.rc34{display:flex;align-items:center;gap:calc(10px * var(--uiz,1));width:100%;text-align:start;
  font-family:inherit;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;
  padding:calc(9px * var(--uiz,1)) calc(11px * var(--uiz,1));border-radius:calc(13px * var(--uiz,1));
  background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.02));border:1px solid #2e3d66}
.rc34:active{transform:scale(.97)}
.rc34 .rc-ic34{width:calc(40px * var(--uiz,1));height:calc(40px * var(--uiz,1));flex:none;
  display:flex;align-items:center;justify-content:center;font-size:calc(20px * var(--uiz,1));
  background:rgba(10,14,28,.7);border-radius:calc(11px * var(--uiz,1))}
.rc34 .rc-tx34{flex:1;min-width:0}
.rc34 .rc-tx34 b{display:block;font-size:calc(13px * var(--uiz,1));font-weight:900;color:#eee6ff;line-height:1.45;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rc34 .rc-tx34 span{display:block;font-size:calc(10.5px * var(--uiz,1));color:#9aa8cc;font-weight:700;line-height:1.55;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rc34 .rc-go34{flex:none;color:#ffd873;font-size:calc(20px * var(--uiz,1));font-weight:900;transform:scaleX(-1)}
.rc34.gold34{background:linear-gradient(180deg,rgba(74,55,18,.5),rgba(42,30,10,.5));border:1.5px solid #c9954a}
.rc34 .rc-price34{flex:none;font-size:calc(11.5px * var(--uiz,1));font-weight:900;color:#ffd873;
  display:flex;align-items:center;gap:calc(3px * var(--uiz,1))}
.rc34 .rc-price34::before{content:'';width:calc(7px * var(--uiz,1));height:calc(7px * var(--uiz,1));border-radius:50%;
  background:radial-gradient(circle at 35% 30%,#ffe9a8,#f5c542 55%,#b98a1e)}
/* کوله: شبکه‌ی ۲ ستونه کارت مصرف */
.bpk-grid34{display:grid;grid-template-columns:1fr 1fr;gap:calc(8px * var(--uiz,1))}
.bk34{display:flex;align-items:center;gap:calc(9px * var(--uiz,1));
  padding:calc(9px * var(--uiz,1));border-radius:calc(13px * var(--uiz,1));
  background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.02));border:1px solid #2e3d66}
.bk34 canvas{width:calc(44px * var(--uiz,1))!important;height:calc(44px * var(--uiz,1))!important;flex:none;border-radius:calc(10px * var(--uiz,1))}
.bk34 .bk-tx34{flex:1;min-width:0}
.bk34 .bk-tx34 b{display:block;font-size:calc(12px * var(--uiz,1));font-weight:900;color:#eee6ff;line-height:1.4;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bk34 .bk-tx34 span{display:block;font-size:calc(9.5px * var(--uiz,1));color:#9aa8cc;font-weight:700;line-height:1.5;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:calc(1px * var(--uiz,1))}
.bk34 .bk-use34{flex:none;cursor:pointer;font-family:inherit;font-weight:900;touch-action:manipulation;
  -webkit-tap-highlight-color:transparent;color:#141a2e;font-size:calc(11px * var(--uiz,1));
  padding:calc(7px * var(--uiz,1)) calc(11px * var(--uiz,1));border-radius:calc(10px * var(--uiz,1));
  background:linear-gradient(180deg,#ffd873,#eda93c);border:none;box-shadow:0 3px 10px rgba(240,180,60,.35)}
.bk34 .bk-use34:active{transform:scale(.93)}
.bk34.empty34{border-style:dashed;border-color:rgba(96,128,196,.55);opacity:.8;justify-content:center}
.bk34.empty34 span{font-size:calc(11px * var(--uiz,1));font-weight:800;color:#8fa3c8}
/* ==== (۳۴) تنظیمات/درباره بدون اسکرول ==== */
.m27-compact34{max-height:96%!important;overflow:hidden!important;display:flex;flex-direction:column;
  gap:calc(9px * var(--uiz,1));padding:calc(13px * var(--uiz,1)) calc(15px * var(--uiz,1)) calc(11px * var(--uiz,1))!important}
.m27-compact34 .m27-icon{display:none!important}
.m27-headrow34{display:flex;align-items:center;gap:calc(10px * var(--uiz,1));text-align:right;flex:none}
.m27-hic34{width:calc(44px * var(--uiz,1));height:calc(44px * var(--uiz,1));flex:none;
  display:flex;align-items:center;justify-content:center;font-size:calc(21px * var(--uiz,1));color:#ffd873;
  background:radial-gradient(circle at 35% 30%,rgba(255,190,60,.28),rgba(255,150,40,.08));
  border:1.5px solid rgba(255,200,90,.5);border-radius:50%}
.m27-htx34{flex:1;min-width:0}
.m27-htx34 .m27-title{margin-bottom:calc(1px * var(--uiz,1))!important}
.m27-htx34 .m27-sub{margin-bottom:0!important;font-size:calc(11px * var(--uiz,1))}
.m27-grid34{display:grid;grid-template-columns:1fr 1fr;gap:calc(7px * var(--uiz,1));flex:none}
.m27-grid34 .m27-vol{grid-column:span 2}
.m27-compact34 .m27-row{min-height:calc(46px * var(--uiz,1))!important;
  padding:calc(6px * var(--uiz,1)) calc(10px * var(--uiz,1))!important}
.m27-compact34 .m27-row>span{font-size:calc(12px * var(--uiz,1))!important}
.m27-compact34 .m27-row .vol{max-width:calc(160px * var(--uiz,1))}
.m27-acts34{display:grid;grid-template-columns:1fr 1fr;gap:calc(7px * var(--uiz,1));flex:none}
.m27-acts34 .m27-btn{min-height:calc(46px * var(--uiz,1));font-size:calc(13.5px * var(--uiz,1))}
.m27-acts34 .m27-btn .ic{width:calc(18px * var(--uiz,1));height:calc(18px * var(--uiz,1))}
.m27-text34{font-size:calc(11.5px * var(--uiz,1));line-height:1.7;gap:calc(6px * var(--uiz,1));
  padding:calc(10px * var(--uiz,1)) calc(12px * var(--uiz,1));margin-bottom:0!important;flex:none}
/* کوله‌ی قدیمی مخفی — جای آن دکمه‌ی ریل */
#backpackBar{display:none!important}
`;
  document.head.appendChild(st);
})();

/* ---------- ۳۴-۲) ابزار: باتن‌شیت ---------- */
function shEl34(id, iconSvg, title, sub) {
  var old = document.getElementById(id);
  if (old) old.remove();
  var el = document.createElement('div');
  el.className = 'sheet34';
  el.id = id;
  el.innerHTML =
    '<div class="sh-grab34"></div>' +
    '<div class="sh-head34"><span class="sh-ic34">' + iconSvg + '</span>' +
    '<div class="sh-tx34"><b>' + title + '</b><span>' + sub + '</span></div>' +
    '<button class="sh-x34">✕</button></div>' +
    '<div class="sh-body34"></div>';
  el.querySelector('.sh-x34').addEventListener('click', function () { try { SFX.click(); } catch (e) {} closeSheet34(); });
  var wrap = document.getElementById('wrap');
  if (wrap) wrap.appendChild(el);
  return el;
}
function openSheet34(el) {
  var bk = document.getElementById('sheetBk34');
  if (!bk) { bk = document.createElement('div'); bk.id = 'sheetBk34'; $('wrap').appendChild(bk); }
  bk.classList.add('open');
  el.classList.add('open');
  requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('in34'); }); });
}
function closeSheet34() {
  var bk = document.getElementById('sheetBk34');
  if (bk) bk.classList.remove('open');
  document.querySelectorAll('.sheet34').forEach(function (s) {
    s.classList.remove('in34');
    setTimeout(function () { if (!s.classList.contains('in34')) s.classList.remove('open'); }, 280);
  });
  window.__V34.openSheet = null;
}
(function () {
  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'sheetBk34') closeSheet34();
  });
})();

/* ---------- ۳۴-۳) ریل چپ: بازسازی دکمه‌ها ---------- */
function faN34(n) { try { return faNum(n); } catch (e) { return String(n); } }

/* دکمه‌ی سرنخ‌ها — دایره + نشان شمارنده */
try {
  MYST.ensureBtn = function () {
    var b = document.getElementById('mystBtn');
    if (!b || !b.__v34) {
      if (b) b.remove();
      b = document.createElement('button');
      b.id = 'mystBtn'; b.__v34 = 1;
      b.innerHTML = '<i class="ic">' + SVG34.clue + '</i><em class="rl-badge34" id="clueBadge34" style="display:none"></em>';
      b.addEventListener('click', function () { try { SFX.click(); } catch (e) {} MYST.openArchive(); });
      var wrap = document.getElementById('wrap');
      if (wrap) wrap.appendChild(b);
    }
    var em = document.getElementById('clueBadge34');
    if (em) {
      var n = (MYST.clues || []).length;
      if (n > 0) { em.textContent = faN34(n); em.style.display = 'flex'; }
      else { em.style.display = 'none'; }
    }
    this._btn = b;
  };
  MYST._badge32 = function () { this.ensureBtn(); };
} catch (e) {}

/* دکمه‌ی بازگشایی دستفروش — دایره */
try {
  MYST.ensurePedBtn = function () {
    var pb = document.getElementById('pedReopenBtn');
    if (!pb || !pb.__v34) {
      if (pb) pb.remove();
      pb = document.createElement('button');
      pb.id = 'pedReopenBtn'; pb.__v34 = 1;
      pb.title = 'خرید از دستفروش';
      pb.innerHTML = (typeof ICO !== 'undefined' ? '<i class="ic">' + ICO.ico('cart') + '</i>' : '🛒');
      pb.addEventListener('click', function () { try { SFX.click(); PED.openShop(); } catch (e) {} });
      var wrap = document.getElementById('wrap');
      if (wrap) wrap.appendChild(pb);
    }
    this._pedBtn = pb;
  };
} catch (e) {}

/* نشان مولوتوف روی دکمه‌ی ریل */
function moloBadge34() {
  try {
    var b = document.getElementById('molotovBtn');
    if (!b) return;
    var em = b.querySelector('.rl-badge34');
    if (!em) { em = document.createElement('em'); em.className = 'rl-badge34'; b.appendChild(em); }
    em.textContent = faN34(MYST.molotovs);
  } catch (e) {}
}

/* ---------- ۳۴-۴) دکمه‌ی کوله‌پشتی + باتن‌شیت مصرف ---------- */
var BPK34 = { btn: null, sheet: null };
function bpkCount34() {
  try { return (state.backpack || []).filter(function (s) { return s; }).length; } catch (e) { return 0; }
}
function bpkBadge34() {
  try {
    var b = document.getElementById('bpkBtn34');
    if (!b) return;
    var em = b.querySelector('.rl-badge34');
    var n = bpkCount34();
    if (n > 0) {
      if (!em) { em = document.createElement('em'); em.className = 'rl-badge34'; b.appendChild(em); }
      em.textContent = faN34(n);
    } else if (em) em.remove();
  } catch (e) {}
}
function bpkStatus34(id) {
  try {
    if (id === 'battery') return 'شارژ +۵۰٪ چراغ‌قوه';
    if (id === 'canned') return 'شفای تدریجی ۴۵ جون';
    if (id === 'medkit') return 'شفای فوری ۷۰ جون';
    if (id === 'airstrike') return 'بمباران کل صفحه';
    if (id === 'freezeBomb') return 'انجماد ۶ ثانیه‌ای';
    if (id === 'adrenaline') return '۱۲ ثانیه شلیک سریع';
    if (typeof RARE !== 'undefined' && RARE[id]) return state.buffs[id] ? 'از قبل فعال است' : 'فعال‌سازی دائمی';
  } catch (e) {}
  return '';
}
function bpkRender34() {
  try {
    var body = BPK34.sheet && BPK34.sheet.querySelector('.sh-body34');
    if (!body) return;
    var h = '<div class="bpk-grid34">';
    for (var i = 0; i < 6; i++) {
      var s = state.backpack[i];
      if (!s) { h += '<div class="bk34 empty34"><span>خالی</span></div>'; continue; }
      var def = (typeof GEAR !== 'undefined' && GEAR[s.id]) || (typeof RARE !== 'undefined' && RARE[s.id]) || { name: s.id };
      h += '<div class="bk34" data-i="' + i + '"><canvas width="80" height="80"></canvas>' +
        '<div class="bk-tx34"><b>' + def.name + '</b><span>' + bpkStatus34(s.id) + '</span></div>' +
        '<button class="bk-use34">مصرف</button></div>';
    }
    h += '</div>';
    body.innerHTML = h;
    body.querySelectorAll('.bk34[data-i]').forEach(function (card) {
      var i = parseInt(card.getAttribute('data-i'), 10);
      var cv = card.querySelector('canvas');
      var s = state.backpack[i];
      if (cv && s && typeof paintGearIcon === 'function') paintGearIcon(s.id, cv);
      var u = card.querySelector('.bk-use34');
      if (u) u.addEventListener('click', function (ev) {
        ev.stopPropagation();
        try { useItem(i); } catch (e) {}
        setTimeout(bpkRender34, 60);
      });
    });
  } catch (e) {}
}
function bpkToggle34() {
  try { SFX.click(); } catch (e) {}
  if (!BPK34.sheet) BPK34.sheet = shEl34('bpkSheet34', SVG34.backpack, 'کوله‌پشتی', 'روی «مصرف» بزن تا وسیله عمل کند');
  var el = BPK34.sheet;
  if (el.classList.contains('open')) { closeSheet34(); return; }
  closeSheet34();
  bpkRender34();
  openSheet34(el);
  window.__V34.openSheet = 'bpk';
}
(function bpkInit34() {
  function ensure() {
    var wrap = document.getElementById('wrap');
    if (!wrap) return;
    var b = document.getElementById('bpkBtn34');
    if (b) return;
    b = document.createElement('button');
    b.id = 'bpkBtn34';
    b.title = 'کوله‌پشتی';
    b.innerHTML = '<i class="ic">' + SVG34.backpack + '</i>';
    b.addEventListener('click', bpkToggle34);
    wrap.appendChild(b);
  }
  ensure();
  setTimeout(ensure, 800); setTimeout(ensure, 2500);
})();

/* به‌روزرسانی نشان‌ها بعد از هر تغییر کوله */
try {
  var _rb34 = refreshBackpack;
  refreshBackpack = function () {
    var r = _rb34.apply(this, arguments);
    try { bpkBadge34(); if (BPK34.sheet && BPK34.sheet.classList.contains('open')) bpkRender34(); } catch (e) {}
    return r;
  };
  refreshBackpack.__34 = true;
} catch (e) {}

/* ---------- ۳۴-۵) پرونده‌ی سرنخ‌ها — بازسازی کامل ---------- */
try {
  MYST.openArchive = function () {
    this.closePanel();
    closeSheet34();
    var el = shEl34('clueSheet34', SVG34.clue, 'پرونده‌ی سرنخ‌ها', 'ردپای داستان، در گفتگوها پنهان است');
    var body = el.querySelector('.sh-body34');
    var av = this.avail();
    var h = '';
    /* شواهد */
    if (this.clues.length > 0) {
      h += '<div class="sh-sec34 gold"><i></i><span>شواهد</span><i></i></div>';
      var self = this;
      this.clues.forEach(function (c, i) {
        h += '<div class="rc34"><em class="rc-ic34" style="font-style:normal;color:#ffd873;font-size:calc(13px * var(--uiz,1));font-weight:900">' +
          faN34(String(i + 1).padStart(2, '0')) + '</em>' +
          '<span class="rc-ic34">' + c.icon + '</span>' +
          '<div class="rc-tx34"><b>' + c.name + '</b><span>' + c.sub + '</span></div></div>';
      });
    }
    /* معماهای فعال */
    if (av.length > 0) {
      h += '<div class="sh-sec34 gold"><i></i><span>معماها</span><i></i></div>';
      if (av.indexOf('radio') >= 0) h += '<button class="rc34 gold34" data-act="radio"><span class="rc-ic34">📻</span><div class="rc-tx34"><b>کوک کردن بی‌سیم</b><span>فرکانس ایستگاه شمال</span></div><i class="rc-go34">›</i></button>';
      if (av.indexOf('code') >= 0) h += '<button class="rc34 gold34" data-act="code"><span class="rc-ic34">🔐</span><div class="rc-tx34"><b>قفل ایستگاه</b><span>کد ۴رقمی از سرنخ‌ها</span></div><i class="rc-go34">›</i></button>';
      if (av.indexOf('fuse') >= 0) h += '<button class="rc34 gold34" data-act="fuse"><span class="rc-ic34">💡</span><div class="rc-tx34"><b>جعبه‌ی فیوز</b><span>وصل‌کردن سیم‌ها</span></div><i class="rc-go34">›</i></button>';
    }
    /* بقا */
    h += '<div class="sh-sec34"><i></i><span>بقا</span><i></i></div>';
    h += '<button class="rc34" data-act="scav"><span class="rc-ic34">🔍</span><div class="rc-tx34"><b>جست‌وجوی محیط</b><span>روزی یک‌بار</span></div><i class="rc-go34">›</i></button>';
    h += '<button class="rc34" data-act="molo"><span class="rc-ic34">🔥</span><div class="rc-tx34"><b>کوکتل مولوتوف</b><span id="moloCnt34">داردی: ' + faN34(this.molotovs) + ' از ۳</span></div><em class="rc-price34">۴۵</em></button>';
    h += '<button class="rc34" data-act="listen"><span class="rc-ic34">👂</span><div class="rc-tx34"><b>گوش بسپار</b><span>ضربان دشمن‌ها در مه</span></div><i class="rc-go34">›</i></button>';
    if (this.clues.length === 0 && av.length === 0) {
      h = '<div class="rc34" style="cursor:default"><span class="rc-ic34">' + SVG34.clue + '</span><div class="rc-tx34"><b>پرونده هنوز خالی است</b><span>جلوتر برو — سرنخ‌ها خودشان پیدا می‌شوند</span></div></div>' + h;
    }
    body.innerHTML = h;
    /* اکشن‌ها — بدون هیچ بازنویسیِ متن کارت‌ها */
    body.querySelectorAll('[data-act]').forEach(function (b) {
      b.addEventListener('click', function () {
        var act = b.getAttribute('data-act');
        try { SFX.click(); } catch (e) {}
        if (act === 'radio') { closeSheet34(); try { MYST.openRadio(); } catch (e) {} }
        else if (act === 'code') { closeSheet34(); try { MYST.openCode(); } catch (e) {} }
        else if (act === 'fuse') { closeSheet34(); try { MYST.openFuse(); } catch (e) {} }
        else if (act === 'scav') { closeSheet34(); try { MYST.scavenge(); } catch (e) {} }
        else if (act === 'molo') {
          try {
            if (MYST.molotovs >= 3) { SFX.deny(); setAnnounce('مولوتوف پر است', 'حداکثر ۳ عدد', 1.2); return; }
            if (state.coins < 45) { SFX.deny(); setAnnounce('سکه کافی نیست', 'مولوتوف: ۴۵ سکه', 1.2); return; }
            state.coins -= 45;
            MYST.molotovs++;
            try { SFX.placeT(); } catch (e) {}
            /* فقط عدد به‌روز می‌شود — هیچ متنی بازنویسی نمی‌شود */
            var cnt = document.getElementById('moloCnt34');
            if (cnt) cnt.textContent = 'داردی: ' + faN34(MYST.molotovs) + ' از ۳';
            setAnnounce('🔥 مولوتوف ' + faN34(MYST.molotovs) + '/۳', '', 1);
            try { updateHUD(); } catch (e) {}
            moloBadge34();
          } catch (e) {}
        }
        else if (act === 'listen') {
          try {
            if (MYST.listen.cd > 0) { setAnnounce('گوش خسته است', 'کمی صبر کن', 1.2); }
            else { MYST.startListen(); closeSheet34(); }
          } catch (e) {}
        }
      });
    });
    openSheet34(el);
    this._panel = null;          /* بستن با closeSheet34 انجام می‌شود */
    window.__V34.openSheet = 'clue';
  };
  MYST.openArchive.__34 = true;
} catch (e) {}

/* پاک‌سازی باتن‌شیت‌ها وقتی حالت عوض می‌شود */
setInterval(function () {
  try {
    var m = (typeof state !== 'undefined') ? state.mode : '';
    if (m === 'start' || m === 'gameover' || m === 'victory' || m === 'transition' || m === 'defeatcine') closeSheet34();
  } catch (e) {}
}, 400);

/* نشان مولوتوف بعد از ساخت/پرتاب */
try {
  var _tm34 = MYST.throwMolotov.bind(MYST);
  MYST.throwMolotov = function () { var r = _tm34.apply(MYST, arguments); try { moloBadge34(); } catch (e) {} return r; };
  MYST.throwMolotov.__34 = true;
} catch (e) {}
setInterval(function () { try { moloBadge34(); } catch (e) {} }, 700);

/* ---------- ۳۴-۶) زامبی‌های منو — ترسناک‌تر ---------- */
try {
  if (typeof M23 !== 'undefined' && M23) {
    var _init34 = M23.init.bind(M23);
    M23.init = function () {
      _init34();
      if (!this.__z34) {
        this.__z34 = 1;
        try {
          (this.zmb || []).forEach(function (z) {
            z.d = Math.min(1.28, z.d * 1.24);      /* (۳۴) درشت‌تر و نزدیک‌تر */
            z.spd = (z.spd || 6) * 0.72;           /* (۳۴) سنگین‌تر — لَه‌له‌له */
          });
        } catch (e) {}
      }
    };
    M23.drawSilZombie = function (z, t, flash) {
      var d = z.d, x = z.x + this._press.x * -22 * d;
      var y = GROUND_Y + (d - 0.6) * 16;
      var s = d * (z.ty === 'tank' ? 1.32 : z.ty === 'fast' ? 0.94 : 1.08);
      var ph = z.ph;
      var sway = Math.sin(ph) * 0.085;
      var bodyC = flash > 0.4 ? 'rgba(32,36,64,0.95)' : 'rgba(3,4,10,0.95)';
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(z.dir < 0 ? -s : s, s);
      /* سایه */
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath(); ctx.ellipse(2, 2, 15, 3.6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.rotate(sway * 0.4);
      /* پاها — گام لَنگنده: پای عقب کشیده می‌آید */
      ctx.strokeStyle = bodyC; ctx.lineWidth = 6.6; ctx.lineCap = 'round';
      var l1 = Math.sin(ph) * 7.5;
      ctx.beginPath();
      ctx.moveTo(-1, -14); ctx.lineTo(-2 + l1, -1);
      ctx.moveTo(4, -14); ctx.lineTo(7.5 - Math.sin(ph + Math.PI) * 2.6, -1);
      ctx.stroke();
      /* بالاتنه‌ی خمیده به جلو + لبه‌های پاره */
      ctx.save();
      ctx.rotate(0.16);
      ctx.fillStyle = bodyC;
      rr(-8.5, -28.5, 17, 16, 5); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-8.5, -24); ctx.lineTo(-11.5, -20.5); ctx.lineTo(-7.6, -19.8);
      ctx.moveTo(8.5, -25.5); ctx.lineTo(11.8, -22); ctx.lineTo(8, -20.6);
      ctx.closePath(); ctx.fill();
      /* بازوی درازکش جلو با چنگک + بازوی آویزان */
      ctx.strokeStyle = bodyC; ctx.lineWidth = 4.9;
      var reach = Math.sin(ph * 0.55) * 2.2;
      ctx.beginPath();
      ctx.moveTo(2, -25); ctx.quadraticCurveTo(12, -24.5 + reach * 0.4, 17.5, -20 + reach);
      ctx.moveTo(-5, -24); ctx.quadraticCurveTo(-8.4, -18, -6.2, -13);
      ctx.stroke();
      ctx.lineWidth = 2.3;
      ctx.beginPath();
      ctx.moveTo(17.5, -20 + reach); ctx.lineTo(20.8, -18.3 + reach);
      ctx.moveTo(17.5, -20 + reach); ctx.lineTo(20.2, -21.8 + reach);
      ctx.stroke();
      ctx.restore();
      /* سر: پایین و جلو + فکِ آویزان + چشم سرخ */
      ctx.save();
      ctx.translate(5.6, -30.2); ctx.rotate(0.2);
      ctx.fillStyle = bodyC;
      circle(0, 0, 6);
      ctx.beginPath(); ctx.moveTo(2.6, 2.3); ctx.lineTo(8, 3.6); ctx.lineTo(3.1, 4.9); ctx.closePath(); ctx.fill();
      var er = 0.55 + 0.45 * Math.abs(Math.sin(t * 2.3 + ph * 0.6));
      ctx.fillStyle = 'rgba(255,50,36,' + er.toFixed(2) + ')';
      circle(3.2, -1.2, 1.3);
      ctx.fillStyle = 'rgba(255,50,36,' + (er * 0.22).toFixed(2) + ')';
      circle(3.2, -1.2, 4.8);
      ctx.restore();
      ctx.restore();
    };
  }
} catch (e) {}

/* ---------- ۳۴-۶b) سرنخ‌ها همیشه در روز قابل دسترس ---------- */
try {
  var _mu34 = MYST.update.bind(MYST);
  MYST.update = function (dt) {
    _mu34(dt);
    try {
      if (state.mode === 'day' && this._btn) {
        this._btn.style.display = 'flex';       /* (۳۴) بقا-اکشن‌ها هر روز لازم‌اند */
        this._btn.classList.toggle('glow', this.avail().length > 0 && !this._panel);
      }
    } catch (e) {}
  };
  MYST.update.__34 = true;
} catch (e) {}

/* ---------- ۳۴-۷) چراغ‌قوه: فقط شب (جای سرنخ‌ها نمی‌گیرد) ---------- */
setInterval(function () {
  try {
    var b = document.getElementById('ctlFlash');
    if (!b) return;
    var m = state.mode;
    if (m === 'day' || m === 'start' || m === 'gameover' || m === 'victory' || m === 'transition' || m === 'defeatcine') {
      b.style.display = 'none';
    } else if (m === 'playing' || m === 'intermission') {
      if (b.style.display === 'none') b.style.display = '';
    }
  } catch (e) {}
}, 300);

/* ---------- ۳۴-۷b) API عمومی برای تست/دیباگ ---------- */
try {
  window.closeSheet34 = closeSheet34;
  window.bpkToggle34 = bpkToggle34;
  window.moloBadge34 = moloBadge34;
} catch (e) {}

/* ---------- ۳۴-۸) پرچم‌ها ---------- */
window.__V34.flags = 1;
})();
