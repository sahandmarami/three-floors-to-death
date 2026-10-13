/* ==================================================================
   سه طبقه تا مرگ — v28 — بازسازی UI اندرویدی (بخش ۲۸)
   ------------------------------------------------------------------
   بازخورد کاربر:
   · منوی ساخت‌وساز → «باتن‌شیت» اندرویدی از پایین صفحه + دکمه‌ی
     شناور FAB — دسترسی آسان وسط بازی (قبلاً پنل کوچک بالا-راست بود)
   · نوار جان و مرحله → چیپ‌های پیل متریال اندرویدی + قلب تپنده
   · منوی توقف → فقط «ادامه بازی» (درشت) + «ذخیره و خروج» +
     ردیف کوچک تنظیمات/درباره (شروع دوباره حذف شد — درخواست کاربر)
   · صفحه‌ی باخت → کارت متریال با آمار و آیکون درخشان
   · سلاح‌ها → چیپ‌های تعویض سریع (کلت/شاتگان/مسلسل) کنار HUD؛
     مالکیت دائمی — برگشت به کلت همیشه ممکن است
   · کوله‌پشتی → پایین-چپِ جمع‌وجور (از وسط صفحه خارج شد)
   · درباره/تنظیمات → سربرگ گرادیانی + حباب آیکون رنگی
   · دکمه‌ی استپ → آیکون متریال گرد با هاله
   این فایل قبل از v3_part4.js می‌آید؛ کارِ DOM/رفع حقه‌ها بعد از
   لود کامل (DOMContentLoaded) انجام می‌شود تا تعریف‌های part4
   آماده باشند (function-wrapping، نه بازتعریف).
   ================================================================== */

/* ---------- ۲۸-۱) CSS — باتن‌شیت + HUD + چیپ‌ها + کارت‌ها ---------- */
(function css28() {
  const st = document.createElement('style');
  st.textContent = `
/* ============ (۲۸) ساخت‌وساز = باتن‌شیت پایین صفحه ============ */
#buildPanel{
  top:auto!important;bottom:0!important;left:50%!important;right:auto!important;
  transform:translateX(-50%)!important;
  width:min(620px,96%)!important;max-width:min(620px,96%)!important;
  max-height:52%!important;
  border-radius:22px 22px 0 0!important;
  border:1.5px solid rgba(111,143,212,.8)!important;border-bottom:none!important;
  box-shadow:0 -10px 34px rgba(0,0,0,.55)!important;
  z-index:9!important;
  transition:transform .24s cubic-bezier(.32,.72,.33,1)!important;
  overflow:hidden!important;
}
#buildPanel.collapsed{transform:translateX(-50%) translateY(108%)!important}
/* سربرگ = دستگیره‌ی باتن‌شیت */
#buildPanel .bp-head{
  border-radius:0!important;border-bottom:1px solid #2c3f70!important;
  min-height:calc(44px * var(--uiz,1))!important;
  padding:calc(8px * var(--uiz,1)) calc(14px * var(--uiz,1))!important;
  font-size:calc(14px * var(--uiz,1))!important;
  justify-content:center!important;position:relative!important;
}
#buildPanel .bp-head .bp-chev{font-size:calc(15px * var(--uiz,1))!important;margin-inline-start:calc(8px * var(--uiz,1))!important}
/* خط «دستیار» بالای سربرگ مثل باتن‌شیت واقعی اندروید */
#buildPanel .bp-head::before{
  content:'';position:absolute;top:calc(5px * var(--uiz,1));left:50%;transform:translateX(-50%);
  width:calc(38px * var(--uiz,1));height:calc(4px * var(--uiz,1));border-radius:99px;
  background:rgba(255,216,115,.4);
}
/* تب‌ها = پیل‌های درشت لمسی */
#buildPanel .bp-tabs{padding:calc(6px * var(--uiz,1)) calc(8px * var(--uiz,1)) 0!important;gap:calc(5px * var(--uiz,1))!important}
#buildPanel .bp-tab{
  min-height:calc(46px * var(--uiz,1))!important;
  font-size:calc(13px * var(--uiz,1))!important;
  border-radius:calc(14px * var(--uiz,1))!important;
  padding:calc(6px * var(--uiz,1)) calc(10px * var(--uiz,1))!important;
}
#buildPanel .bp-tab .bp-tab-ic{font-size:calc(21px * var(--uiz,1))!important}
/* کاشی‌ها = شبکه‌ی بزرگ با آیکون درشت */
#bpList{
  grid-template-columns:repeat(auto-fill,minmax(calc(102px * var(--uiz,1)),1fr))!important;
  gap:calc(7px * var(--uiz,1))!important;padding:calc(8px * var(--uiz,1))!important;
}
#buildPanel .bp-tile{
  height:calc(102px * var(--uiz,1))!important;
  border-radius:calc(15px * var(--uiz,1))!important;
  border-width:2px!important;
}
#buildPanel .bp-ic{width:calc(56px * var(--uiz,1))!important;height:calc(56px * var(--uiz,1))!important}
#buildPanel .bp-tile .bp-price{font-size:calc(12.5px * var(--uiz,1))!important}
#buildPanel .bp-tile .bp-lv{bottom:calc(6px * var(--uiz,1))!important}
#buildPanel .bp-tile.armed{border-color:#ffd873!important;box-shadow:0 0 16px rgba(255,216,115,.45),inset 0 0 0 1px rgba(255,216,115,.5)!important}
#buildPanel .bp-tile.owned{border-color:#69d389!important}
#buildPanel .bp-tile.locked{opacity:.45!important}
/* شب‌شود کوچک داخل سربرگ شیت (فقط روزها) */
#bpNightMini28{
  position:absolute;inset-inline-start:calc(10px * var(--uiz,1));top:50%;transform:translateY(-50%);
  display:none;align-items:center;gap:calc(5px * var(--uiz,1));
  min-height:calc(32px * var(--uiz,1));padding:0 calc(12px * var(--uiz,1));
  border-radius:calc(11px * var(--uiz,1));border:none;cursor:pointer;font-family:inherit;
  font-size:calc(12px * var(--uiz,1));font-weight:900;color:#1a1206;
  background:linear-gradient(180deg,#ffe08a,#f0b53c);
  box-shadow:0 3px 10px rgba(240,180,60,.4);
  -webkit-tap-highlight-color:transparent;touch-action:manipulation;
}
#bpNightMini28.on{display:flex}
#bpNightMini28:active{transform:translateY(-50%) scale(.93)}
#bpNightMini28 svg{width:calc(17px * var(--uiz,1));height:calc(17px * var(--uiz,1));color:#7a4a08}

/* ============ (۲۸) FAB ساخت‌وساز — پایین-راست ============ */
#bpFab28{
  position:absolute;bottom:calc(14px * var(--uiz,1));right:calc(14px * var(--uiz,1));z-index:8;
  width:calc(56px * var(--uiz,1));height:calc(56px * var(--uiz,1));
  border-radius:calc(18px * var(--uiz,1));border:none;cursor:pointer;font-family:inherit;
  display:flex;align-items:center;justify-content:center;
  color:#eaf2ff;background:linear-gradient(180deg,#4a6fd8,#2c48a8);
  box-shadow:0 8px 24px rgba(44,72,168,.55),inset 0 2px 0 rgba(255,255,255,.28);
  -webkit-tap-highlight-color:transparent;touch-action:manipulation;
}
#bpFab28:active{transform:scale(.92)}
#bpFab28 svg{width:calc(27px * var(--uiz,1));height:calc(27px * var(--uiz,1))}
/* شب‌شود (طلایی) کنار FAB می‌نشیند، نه زیرش */
#bpNight{right:calc(82px * var(--uiz,1))!important;bottom:calc(16px * var(--uiz,1))!important;min-width:calc(128px * var(--uiz,1))!important;z-index:8!important}

/* ============ (۲۸) HUD — چیپ‌های پیل اندرویدی ============ */
#hud .hud-item{
  border-radius:calc(14px * var(--uiz,1))!important;
  padding:calc(6px * var(--uiz,1)) calc(13px * var(--uiz,1))!important;
  border:1.5px solid rgba(94,124,196,.55)!important;
  background:linear-gradient(180deg,rgba(24,36,74,.96),rgba(10,17,38,.96))!important;
  box-shadow:0 4px 14px rgba(0,0,0,.45),inset 0 1.5px 0 rgba(255,255,255,.1)!important;
}
#hud .hud-ic{font-size:calc(17px * var(--uiz,1))!important}
/* قلب تپنده */
#coinItem .hud-ic{color:#ffd873}
#hud .hud-item[title="جون برج"] .hud-ic{color:#ff6a7a!important;animation:hbeat28 1.5s ease-in-out infinite}
@keyframes hbeat28{0%,100%{transform:scale(1)}12%{transform:scale(1.22)}24%{transform:scale(1)}36%{transform:scale(1.14)}48%{transform:scale(1)}}
/* نوار جان = قاب گرد درخشان */
#healthBar{
  width:calc(132px * var(--uiz,1))!important;height:calc(14px * var(--uiz,1))!important;
  border-radius:99px!important;border:1.5px solid rgba(255,106,122,.5)!important;
  background:rgba(22,8,12,.9)!important;box-shadow:inset 0 2px 5px rgba(0,0,0,.6)!important;
  overflow:hidden!important;
}
#healthFill{
  border-radius:99px!important;
  background:linear-gradient(90deg,#2ee06b,#a4ff9a)!important;
  box-shadow:0 0 10px rgba(46,224,107,.55),inset 0 1.5px 0 rgba(255,255,255,.4)!important;
}
#healthFill.mid{background:linear-gradient(90deg,#e8c93c,#ffe98a)!important;box-shadow:0 0 10px rgba(232,201,60,.5),inset 0 1.5px 0 rgba(255,255,255,.4)!important}
#healthFill.low{background:linear-gradient(90deg,#e04334,#ff8a7a)!important;box-shadow:0 0 12px rgba(224,67,52,.65),inset 0 1.5px 0 rgba(255,255,255,.35)!important;animation:hpCrit28 .8s ease-in-out infinite}
@keyframes hpCrit28{0%,100%{filter:brightness(1)}50%{filter:brightness(1.5)}}
#healthText{font-size:calc(12.5px * var(--uiz,1))!important;color:#ffeef0!important}
/* مرحله = پیل بنفش با جمجمه */
#hud .hud-item[title="مرحله"]{border-color:rgba(158,120,220,.55)!important}
#hud .hud-item[title="مرحله"] .hud-ic{color:#c9a6ff!important}
#waveText{color:#f0e6ff!important}
/* دکمه‌ی استپ = دایره متریال با هاله */
.ctl-btn.hud-pause{
  width:calc(46px * var(--uiz,1))!important;height:calc(46px * var(--uiz,1))!important;
  border-radius:calc(15px * var(--uiz,1))!important;
  background:linear-gradient(180deg,#4a6fd8,#2c48a8)!important;
  border:1.5px solid rgba(120,160,255,.5)!important;
  box-shadow:0 5px 16px rgba(44,72,168,.5),inset 0 2px 0 rgba(255,255,255,.25)!important;
  color:#eaf2ff!important;font-size:calc(19px * var(--uiz,1))!important;
}
.ctl-btn.hud-pause:active{transform:scale(.92)}
.ctl-btn.hud-mini{
  width:calc(40px * var(--uiz,1))!important;height:calc(40px * var(--uiz,1))!important;
  border-radius:calc(13px * var(--uiz,1))!important;
  background:rgba(20,32,66,.92)!important;
  border:1.5px solid rgba(94,124,196,.5)!important;color:#bcd0ff!important;
}

/* ============ (۲۸) چیپ‌های تعویض سلاح — زیر HUD راست ============ */
#wpnChips28{
  position:absolute;top:calc(62px * var(--uiz,1));right:calc(10px * var(--uiz,1));z-index:7;
  display:flex;flex-direction:column;gap:calc(6px * var(--uiz,1));
}
.wchip28{
  width:calc(50px * var(--uiz,1));height:calc(50px * var(--uiz,1));
  border-radius:calc(15px * var(--uiz,1));cursor:pointer;font-family:inherit;
  display:flex;align-items:center;justify-content:center;position:relative;
  background:linear-gradient(180deg,rgba(24,36,74,.94),rgba(10,17,38,.94));
  border:2px solid rgba(94,124,196,.55);
  box-shadow:0 4px 12px rgba(0,0,0,.45),inset 0 1.5px 0 rgba(255,255,255,.09);
  color:#dbe5fa;-webkit-tap-highlight-color:transparent;touch-action:manipulation;
}
.wchip28:active{transform:scale(.92)}
.wchip28 canvas{width:calc(36px * var(--uiz,1));height:calc(36px * var(--uiz,1))}
.wchip28.on{
  border-color:#ffd873!important;
  background:linear-gradient(180deg,rgba(84,66,20,.95),rgba(42,32,8,.95))!important;
  box-shadow:0 0 16px rgba(255,216,115,.5),inset 0 1.5px 0 rgba(255,255,255,.15)!important;
}
.wchip28.on::after{
  content:'';position:absolute;bottom:calc(3px * var(--uiz,1));left:50%;transform:translateX(-50%);
  width:calc(7px * var(--uiz,1));height:calc(7px * var(--uiz,1));border-radius:99px;
  background:#ffd873;box-shadow:0 0 7px #ffd873;
}
.wchip28.locked{opacity:.42}
.wchip28.locked::before{
  content:'🔒';position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  font-size:calc(15px * var(--uiz,1));background:rgba(8,12,26,.55);border-radius:inherit;
}

/* ============ (۲۸) کوله‌پشتی — پایین-چپِ جمع ============ */
#backpackBar{
  left:calc(12px * var(--uiz,1))!important;right:auto!important;
  transform:none!important;bottom:calc(12px * var(--uiz,1))!important;
  flex-direction:column!important;align-items:flex-start!important;gap:calc(4px * var(--uiz,1))!important;
  max-width:calc(320px * var(--uiz,1))!important;
}
#backpackBar .bpk-cap{
  font-size:calc(11px * var(--uiz,1))!important;padding:calc(4px * var(--uiz,1)) calc(9px * var(--uiz,1))!important;
  border-radius:calc(9px * var(--uiz,1))!important;
}
#bpkSlots{flex-wrap:wrap;max-width:calc(320px * var(--uiz,1))!important}

/* ============ (۲۸) منوی توقف — ادامه + خروج و سیو ============ */
#pauseScreen .m27-list{gap:calc(8px * var(--uiz,1))!important}
#pauseScreen .m27-primary{min-height:calc(78px * var(--uiz,1))!important;font-size:calc(19px * var(--uiz,1))!important}
#pauseScreen .m27-btn{min-height:calc(62px * var(--uiz,1))!important}
/* (۲۸) حالت فشرده‌ی صفحه‌ی کوتاه: «ادامه» همچنان درشت می‌ماند —
   درخواست کاربر: دکمه‌ی ادامه باید دیده و لمس شود راحت */
@media (max-height:520px){
  #pauseScreen .m27-primary{min-height:calc(68px * var(--uiz,1))!important;font-size:calc(17.5px * var(--uiz,1))!important}
  #pauseScreen .m27-btn{min-height:calc(56px * var(--uiz,1))!important}
  #pauseScreen .m27-card{padding:calc(10px * var(--uiz,1)) calc(13px * var(--uiz,1))!important}
  #pauseScreen .m27-icon{width:calc(40px * var(--uiz,1))!important;height:calc(40px * var(--uiz,1))!important;margin-bottom:calc(3px * var(--uiz,1))!important}
}
.m27-mini-row{display:flex;gap:calc(8px * var(--uiz,1));margin-top:calc(4px * var(--uiz,1))}
.m27-mini{
  flex:1;min-height:calc(44px * var(--uiz,1));border-radius:calc(13px * var(--uiz,1));cursor:pointer;font-family:inherit;
  display:flex;align-items:center;justify-content:center;gap:calc(6px * var(--uiz,1));
  font-size:calc(13px * var(--uiz,1));font-weight:800;color:#dbe5fa;
  background:rgba(20,32,66,.92);border:1.5px solid rgba(94,124,196,.5);
  -webkit-tap-highlight-color:transparent;touch-action:manipulation;
}
.m27-mini svg{width:calc(18px * var(--uiz,1));height:calc(18px * var(--uiz,1));color:#9db8f0}
.m27-mini:active{transform:scale(.96)}

/* ============ (۲۸) صفحه‌ی باخت — کارت متریال ============ */
#gameoverScreen .panel{background:none!important;border:none!important;box-shadow:none!important;padding:0!important;max-width:min(430px,94%)!important}
.m28-card{
  background:linear-gradient(180deg,rgba(24,30,52,.98),rgba(12,15,30,.98));
  border:1.5px solid rgba(200,90,90,.4);border-radius:calc(24px * var(--uiz,1));
  padding:calc(20px * var(--uiz,1)) calc(18px * var(--uiz,1)) calc(16px * var(--uiz,1));
  box-shadow:0 18px 50px rgba(0,0,0,.7),inset 0 2px 0 rgba(255,255,255,.07);
  display:flex;flex-direction:column;align-items:center;gap:calc(10px * var(--uiz,1));
  animation:m28in .3s ease both;
}
@keyframes m28in{from{opacity:0;transform:translateY(14px) scale(.96)}to{opacity:1;transform:none}}
.m28-skull{
  width:calc(74px * var(--uiz,1));height:calc(74px * var(--uiz,1));border-radius:calc(22px * var(--uiz,1));
  display:flex;align-items:center;justify-content:center;
  background:radial-gradient(circle at 35% 30%,#6a2830,#301018);
  border:2px solid rgba(255,106,122,.45);
  box-shadow:0 0 26px rgba(224,67,52,.5),inset 0 3px 0 rgba(255,255,255,.09);
  color:#ff8a8a;animation:m28pulse 2s ease-in-out infinite;
}
@keyframes m28pulse{0%,100%{box-shadow:0 0 22px rgba(224,67,52,.4),inset 0 3px 0 rgba(255,255,255,.09)}50%{box-shadow:0 0 34px rgba(224,67,52,.65),inset 0 3px 0 rgba(255,255,255,.09)}}
.m28-skull svg{width:calc(40px * var(--uiz,1));height:calc(40px * var(--uiz,1))}
.m28-title{font-size:calc(24px * var(--uiz,1));font-weight:900;color:#ffb0b0;margin:0!important}
.m28-sub{font-size:calc(13.5px * var(--uiz,1));color:#c3cdea;margin:0!important}
.m28-stats{display:flex;gap:calc(7px * var(--uiz,1));flex-wrap:wrap;justify-content:center}
.m28-stat{
  display:flex;align-items:center;gap:calc(5px * var(--uiz,1));
  background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.1);
  border-radius:calc(11px * var(--uiz,1));padding:calc(5px * var(--uiz,1)) calc(11px * var(--uiz,1));
  font-size:calc(12.5px * var(--uiz,1));font-weight:800;color:#ffe9b3;
}
.m28-stat svg{width:calc(15px * var(--uiz,1));height:calc(15px * var(--uiz,1));color:#ffd873}
#gameoverScreen .btn-row{width:100%!important;flex-direction:column!important;gap:calc(8px * var(--uiz,1))!important;margin-top:calc(4px * var(--uiz,1))!important}
#gameoverScreen .btn-main{width:100%!important;min-height:calc(56px * var(--uiz,1))!important;font-size:calc(16.5px * var(--uiz,1))!important}
#gameoverScreen .btn-sec{width:100%!important;min-height:calc(48px * var(--uiz,1))!important}

/* ============ (۲۸) درباره/تنظیمات — جذاب‌تر ============ */
.m27-card{
  border-radius:calc(22px * var(--uiz,1))!important;
  border:1.5px solid rgba(94,124,196,.45)!important;
  background:linear-gradient(180deg,rgba(24,32,62,.98),rgba(12,17,36,.98))!important;
  box-shadow:0 18px 46px rgba(0,0,0,.65),inset 0 2px 0 rgba(255,255,255,.08)!important;
}
.m27-icon{
  background:radial-gradient(circle at 35% 30%,#3a5bd0,#22348f)!important;
  border:2px solid rgba(130,170,255,.4)!important;
  box-shadow:0 0 22px rgba(74,111,216,.45),inset 0 3px 0 rgba(255,255,255,.15)!important;
}
#settingsScreen .m27-icon{background:radial-gradient(circle at 35% 30%,#3a5bd0,#22348f)!important}
#aboutScreen .m27-icon{background:radial-gradient(circle at 35% 30%,#d09a3a,#8f6a1f)!important;box-shadow:0 0 22px rgba(208,154,58,.4),inset 0 3px 0 rgba(255,255,255,.15)!important}
.m27-title{letter-spacing:.3px}
.m27-row{border-radius:calc(13px * var(--uiz,1))!important;background:rgba(255,255,255,.04)!important;border:1.5px solid rgba(255,255,255,.07)!important}
.m27-row .ic{color:#9db8f0}

/* مخفی‌سازی عناصر ۲۸ در حالت‌های غیر بازی */
#wrap.menu-mode #bpFab28,#wrap.cine-mode #bpFab28,#wrap.cs-mode #bpFab28,#wrap.dlg-on #bpFab28{display:none!important}
#wrap.menu-mode #wpnChips28,#wrap.cine-mode #wpnChips28,#wrap.cs-mode #wpnChips28,#wrap.dlg-on #wpnChips28{display:none!important}
#wrap.menu-mode #bpNightMini28{display:none!important}
/* باتن‌شیت باز = FAB و «شب شود»ی شناور مخفی (سربرگ خودش می‌بندد؛
   شب‌شودِ کوچک داخل سربرگ جای آن را می‌گیرد — رفع هم‌پوشانی) */
#buildPanel:not(.collapsed) ~ #bpFab28{display:none!important}
#buildPanel:not(.collapsed) ~ #bpNight{display:none!important}
`;
  document.head.appendChild(st);
})();

/* ---------- ۲۸-۲) راه‌اندازی بعد از لود کامل (تعریف‌های part4 آماده‌اند) ---------- */
function setup28() {
  try { buildFab28(); } catch (e) {}
  try { buildWeaponChips28(); } catch (e) {}
  try { rebuildPause28(); } catch (e) {}
  try { rebuildGameover28(); } catch (e) {}
  try { sheetNightChip28(); } catch (e) {}
  try { wrapPanels28(); } catch (e) {}
  try { refreshWeaponChips28(); } catch (e) {}
}

/* FAB ساخت‌وساز — باز/بستن باتن‌شیت با یک ضربه */
function buildFab28() {
  if ($('bpFab28')) return;
  const fab = document.createElement('button');
  fab.id = 'bpFab28';
  fab.title = 'ساخت‌وساز (B)';
  fab.innerHTML = (typeof ICO !== 'undefined' ? '<i class="ic">' + ICO.ico('tools') + '</i>' : '🛠');
  fab.addEventListener('click', () => { try { toggleBuildPanel(); } catch (e) {} });
  $('wrap').appendChild(fab);
}

/* چیپ‌های تعویض سریع سلاح — کلت/شاتگان/مسلسل کنار HUD راست */
function buildWeaponChips28() {
  if ($('wpnChips28')) return;
  const row = document.createElement('div');
  row.id = 'wpnChips28';
  const WORDER = ['pistol', 'shotgun', 'mg'];
  WORDER.forEach(id => {
    const b = document.createElement('button');
    b.className = 'wchip28';
    b.id = 'wchip28-' + id;
    b.title = (typeof WEAPONS !== 'undefined' && WEAPONS[id] ? WEAPONS[id].name : id);
    const cv = document.createElement('canvas');
    cv.width = 88; cv.height = 88;
    b.appendChild(cv);
    if (typeof paintIcon === 'function') { try { paintIcon(id, cv); } catch (e) {} }
    b.addEventListener('click', () => { try { selectWeapon(id); } catch (e) {} });
    row.appendChild(b);
  });
  $('wrap').appendChild(row);
}

/* به‌روزرسانی وضعیت چیپ‌ها (مالکیت/در دست/قفل) */
function refreshWeaponChips28() {
  const WORDER = ['pistol', 'shotgun', 'mg'];
  for (const id of WORDER) {
    const el = $('wchip28-' + id);
    if (!el) continue;
    const owned = !!(typeof WEAPONS !== 'undefined' && WEAPONS[id] && WEAPONS[id].owned);
    el.classList.toggle('on', state.weapon === id && owned);
    el.classList.toggle('locked', !owned);
  }
}

/* منوی توقف — ادامه (درشت) + ذخیره و خروج + ردیف کوچک تنظیمات/درباره */
function rebuildPause28() {
  const card = document.querySelector('#pauseScreen .m27-card');
  if (!card) return;
  /* «شروع دوباره» حذف — درخواست کاربر: فقط خروج و سیو + ادامه */
  const restart = document.getElementById('btnRestart0');
  if (restart) restart.remove();
  const list = card.querySelector('.m27-list');
  if (!list.querySelector('.m27-mini-row')) {
    const row = document.createElement('div');
    row.className = 'm27-mini-row';
    const mk = (id, ic, label) => {
      const b = document.createElement('button');
      b.className = 'm27-mini';
      b.innerHTML = (typeof ICO !== 'undefined' ? '<i class="ic">' + ICO.ico(ic) + '</i>' : '') + '<span>' + label + '</span>';
      b.addEventListener('click', () => { const el = $(id); if (el) el.click(); });
      return b;
    };
    row.appendChild(mk('btnPauseSettings', 'gear', 'تنظیمات'));
    row.appendChild(mk('btnPauseAbout', 'info', 'درباره'));
    list.appendChild(row);
    /* دکمه‌های قدیمی تنظیمات/درباره (تمام‌عرض) مخفی — جایشان ردیف کوچک است */
    const bs = document.getElementById('btnPauseSettings');
    const ba = document.getElementById('btnPauseAbout');
    if (bs) bs.style.display = 'none';
    if (ba) ba.style.display = 'none';
  }
}

/* صفحه‌ی باخت — کارت متریال با آمار و دکمه‌های درشت */
function rebuildGameover28() {
  const scr = document.getElementById('gameoverScreen');
  if (!scr || scr.dataset.m28) return;
  scr.dataset.m28 = '1';
  const old = scr.querySelector('.panel');
  if (!old) return;
  const sub = document.getElementById('goSubtitle');
  const stats = document.getElementById('goStats');
  const subHTML = sub ? sub.innerHTML : '';
  const statsHTML = stats ? stats.innerHTML : '';
  old.innerHTML = `
    <div class="m28-card">
      <div class="m28-skull"><i class="ic">${typeof ICO !== 'undefined' ? ICO.ico('skull') : '💀'}</i></div>
      <h1 class="m28-title">باختی!</h1>
      <p class="m28-sub" id="goSubtitle">${subHTML}</p>
      <div class="m28-stats" id="goStats">${statsHTML}</div>
      <div class="btn-row">
        <button class="btn-main" id="btnRetryDay" data-ico="dawn"><span>تلاش دوباره</span></button>
        <button class="btn-sec" id="btnRestart1" data-ico="home"><span>منوی اصلی</span></button>
      </div>
    </div>`;
  /* آیکون‌های data-ico که تازه ساخته شدند */
  if (typeof ICO !== 'undefined' && ICO.apply) { try { ICO.apply(old); } catch (e) {} }
  /* آمار به‌صورت چیپ — متنِ پیش‌فرض را چیپ‌دار می‌کنیم */
  const st = document.getElementById('goStats');
  if (st) st.innerHTML = '<span class="m28-stat">' + st.innerHTML + '</span>';
}

/* «شب شود» کوچک داخل سربرگ باتن‌شیت (فقط روز + شیت باز) */
function sheetNightChip28() {
  const head = document.getElementById('bpHead');
  if (!head || $('bpNightMini28')) return;
  const b = document.createElement('button');
  b.id = 'bpNightMini28';
  b.innerHTML = (typeof ICO !== 'undefined' ? '<i class="ic">' + ICO.ico('moon') + '</i>' : '') + '<span>شب شود</span>';
  b.addEventListener('click', (e) => {
    e.stopPropagation();              /* سربرگ جمعش نکند */
    try { startNight(); } catch (err) {}
  });
  head.appendChild(b);
}

/* ---------- ۲۸-۳) بسته‌بندی توابع part4 (بعد از تعریف) ---------- */
function wrapPanels28() {
  /* updateHUD → وضعیت چیپ‌ها + دکمه‌ی شبِ داخل شیت */
  if (typeof updateHUD === 'function' && !updateHUD.__28) {
    const _u = updateHUD;
    updateHUD = function () {
      _u.apply(this, arguments);
      try { refreshWeaponChips28(); } catch (e) {}
      try {
        const mini = $('bpNightMini28');
        if (mini) mini.classList.toggle('on', state.mode === 'day' && !$('buildPanel').classList.contains('collapsed'));
      } catch (e) {}
    };
    updateHUD.__28 = true;
  }
  /* refreshBuildPanel → چیپ‌ها هم تازه شوند */
  if (typeof refreshBuildPanel === 'function' && !refreshBuildPanel.__28) {
    const _r = refreshBuildPanel;
    refreshBuildPanel = function () {
      _r.apply(this, arguments);
      try { refreshWeaponChips28(); } catch (e) {}
    };
    refreshBuildPanel.__28 = true;
  }
  /* applySave → چیپ‌ها بعد از سیو */
  if (typeof applySave === 'function' && !applySave.__28) {
    const _a = applySave;
    applySave = function () {
      const r = _a.apply(this, arguments);
      try { refreshWeaponChips28(); } catch (e) {}
      return r;
    };
    applySave.__28 = true;
  }
  /* startGame → چیپ‌ها ریست شوند */
  if (typeof startGame === 'function' && !startGame.__28) {
    const _s = startGame;
    startGame = function () {
      const r = _s.apply(this, arguments);
      try { refreshWeaponChips28(); } catch (e) {}
      return r;
    };
    startGame.__28 = true;
  }
}

/* اجرا: بعد از آنکه همه‌ی اسکریپت‌ها (شامل part4) اجرا شدند */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setup28, { once: true });
} else {
  setup28();
}
