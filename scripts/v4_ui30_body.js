/* ==================================================================
   سه طبقه تا مرگ — نسخه‌ی ۳۰٫۰ — لایه‌ی UI جدید (v4_ui30.js)
   ==================================================================
   درخواست‌های کاربر (v30):
     ۱) «کلا منوی ساخت و ساز رو از پایین بردار» + «جای منوی ساخت
        و ساز رو از پایین عوض کن چون وسط بازی نمیشه دسترسی داشتن بهش»
        → باتن‌شیت پایین حذف؛ داک افقی بالا-راست که وسط نبرد هم باز
        می‌ماند و روی زمین بازی/زامبی‌ها نمی‌نشیند (فقط نوار آسمان)
     ۲) آیکون‌های برش‌خورده از شیت کاربر (icons.png): کلت/شاتگان/
        مسلسل + جعبه (دکمه ساخت‌وساز) + کوله‌پشتی + چراغ‌قوه + بقیه
        برای کاشی‌ها و کالاهای دستفروش
     ۳) رفع به‌هم‌ریختگی منوی دستفروش مرموز (عکس «باگ»): کارت‌های
        بریده‌شده پایین پنل → ریشه: #pdStock بدون flex/min-height
        زیر max-height → هیچ‌وقت اسکرول نمی‌شد؛ + عرض پنل uiz-دار
     ۴) «شب شود» طلایی شناور به پایین-راست برمی‌گردد (FAB حذف شد)
   این فایل بعد از v4_ui29.js و قبل از v3_part4.js می‌آید.
   ================================================================== */

/* ---------- ۳۰-۱) CSS — داک بالا + دستفروش + پاک‌سازی شیت ---------- */
(function css30() {
  const st = document.createElement('style');
  st.textContent = `
/* ============ (۳۰) ساخت‌وساز = داک افقی بالا-راست ============
   روی نوار آسمان می‌نشیند (بالای برج) — وسط شب نبرد هم باز
   می‌ماند؛ فقط با کلیک سربرگ یا کلید B جمع/باز می‌شود */
#buildPanel{
  top:calc(62px * var(--uiz2,1))!important;bottom:auto!important;
  left:auto!important;right:calc(10px * var(--uiz2,1))!important;
  transform:none!important;
  width:auto!important;max-width:min(640px,64%)!important;
  max-height:none!important;
  border-radius:calc(16px * var(--uiz2,1))!important;
  border:1.5px solid rgba(111,143,212,.8)!important;
  box-shadow:0 12px 32px rgba(0,0,0,.55),inset 0 1.5px 0 rgba(255,255,255,.07)!important;
  z-index:6!important;
  background:linear-gradient(180deg,rgba(17,26,52,.98),rgba(9,14,32,.98))!important;
  overflow:hidden!important;
  transition:width .18s ease!important;
}
#buildPanel.collapsed{
  transform:none!important;width:auto!important;max-width:none!important;
}
#buildPanel.collapsed #bpList{display:none!important}
#buildPanel.collapsed .bp-tabs{display:none!important}
/* سربرگ = دکمه جمع/باز (بدون دستگیره‌ی شیت) */
#buildPanel .bp-head{
  border-radius:0!important;border-bottom:1px solid #2c3f70!important;
  min-height:calc(36px * var(--uiz,1))!important;
  padding:calc(5px * var(--uiz,1)) calc(16px * var(--uiz,1))!important;
  font-size:calc(14.5px * var(--uiz,1))!important;
  justify-content:center!important;position:relative!important;
  gap:calc(7px * var(--uiz,1))!important;
  background:linear-gradient(180deg,#26365f,#1a2748)!important;
}
#buildPanel .bp-head::before{content:none!important}
#buildPanel .bp-head .ic{display:none!important}
#bpHead img.ic30{
  width:calc(24px * var(--uiz,1))!important;height:calc(24px * var(--uiz,1))!important;
  border-radius:calc(7px * var(--uiz,1));flex:none;
  box-shadow:0 0 8px rgba(120,190,255,.35);
}
#bpHead .bp-chev{font-size:calc(13px * var(--uiz,1))!important;margin-inline-start:calc(6px * var(--uiz,1))!important;color:#8fb0e8!important}
/* پالس طلایی روزِ بین‌موج‌ها (راهنمای خرید) — کلاس attention از کد بازی روی bpHead می‌آید */
#buildPanel.collapsed .bp-head.attention{animation:bpPulse30 1.8s ease-in-out infinite!important}
@keyframes bpPulse30{0%,100%{box-shadow:0 0 0 rgba(255,216,115,0),inset 0 1.5px 0 rgba(255,255,255,.07)}50%{box-shadow:0 0 18px rgba(255,216,115,.55),inset 0 1.5px 0 rgba(255,255,255,.07)}}
/* تب‌ها = پیل‌های فشرده */
#buildPanel .bp-tabs{
  display:grid!important;grid-template-columns:repeat(4,1fr)!important;
  padding:calc(5px * var(--uiz,1)) calc(8px * var(--uiz,1)) 0!important;
  gap:calc(4px * var(--uiz,1))!important;
}
#buildPanel .bp-tab{
  min-height:calc(34px * var(--uiz2,1))!important;
  font-size:calc(11.5px * var(--uiz2,1))!important;
  border-radius:calc(10px * var(--uiz2,1))!important;
  padding:calc(3px * var(--uiz,1)) calc(5px * var(--uiz,1))!important;
  flex-direction:row!important;justify-content:center!important;
  gap:calc(4px * var(--uiz,1))!important;
}
#buildPanel .bp-tab .bp-tab-ic{font-size:calc(14px * var(--uiz2,1))!important}
/* کاشی‌ها = ردیف افقی قابل اسکرول (مثل فروشگاه‌های اندروید) */
#bpList{
  display:flex!important;flex-direction:row!important;
  overflow-x:auto!important;overflow-y:hidden!important;
  overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;
  gap:calc(6px * var(--uiz2,1))!important;
  padding:calc(5px * var(--uiz2,1)) calc(9px * var(--uiz2,1)) calc(8px * var(--uiz2,1))!important;
  flex:0 0 auto!important;max-height:calc(114px * var(--uiz2,1))!important;
}
#buildPanel .bp-tile{
  flex:none!important;width:calc(84px * var(--uiz2,1))!important;height:calc(108px * var(--uiz2,1))!important;
  display:flex!important;flex-direction:column!important;align-items:center!important;
  justify-content:flex-start!important;
  border-radius:calc(13px * var(--uiz2,1))!important;border-width:2px!important;
  padding:calc(6px * var(--uiz2,1)) calc(4px * var(--uiz2,1)) calc(4px * var(--uiz2,1))!important;
  gap:calc(2px * var(--uiz2,1))!important;
}
#buildPanel .bp-ic{width:calc(46px * var(--uiz2,1))!important;height:calc(46px * var(--uiz2,1))!important;margin-top:calc(2px * var(--uiz2,1))!important}
#buildPanel .bp-tile .bp-key{top:calc(3px * var(--uiz2,1))!important;left:calc(4px * var(--uiz2,1))!important;font-size:calc(8.5px * var(--uiz2,1))!important}
#buildPanel .bp-tile .bp-price{font-size:calc(10px * var(--uiz2,1))!important;min-height:calc(12px * var(--uiz2,1))!important;line-height:1.25!important;width:100%!important;justify-content:center!important;margin-top:calc(2px * var(--uiz2,1))!important}
#buildPanel .bp-tile .bp-lv{position:static!important;margin-top:calc(2px * var(--uiz2,1))!important;gap:2px!important}
#buildPanel .bp-tile .bp-lv i{width:calc(5px * var(--uiz2,1))!important;height:calc(5px * var(--uiz2,1))!important}
#buildPanel .bp-tile .bp-ic29 img, #buildPanel .bp-tile img.bp-ic30{
  width:calc(46px * var(--uiz2,1))!important;height:calc(46px * var(--uiz2,1))!important;
  border-radius:calc(9px * var(--uiz2,1));display:block;margin-top:calc(2px * var(--uiz2,1));
}
#buildPanel .bp-tile.armed{border-color:#ffd873!important;box-shadow:0 0 14px rgba(255,216,115,.4),inset 0 0 0 1px rgba(255,216,115,.5)!important}
#buildPanel .bp-tile.owned{border-color:#69d389!important}
#buildPanel .bp-tile.locked{opacity:.45!important}
/* تولتیپ کنار داک */
#bpTip{z-index:7!important}

/* ============ (۳۰) حذف بقایای شیت/FAB v28-29 ============ */
#bpFab28,#bpScrim29,#bpNightMini28{display:none!important}
#bpNight{
  right:calc(12px * var(--uiz,1))!important;bottom:calc(14px * var(--uiz,1))!important;
  min-width:calc(136px * var(--uiz,1))!important;z-index:8!important;
}
/* دکمه شب فقط روزِ بین‌موج‌ها — ارث از منطق بازی */

/* اعلان مرکزی بالای داک دیده شود (گذرا است، بازی نمی‌بندد) */
#announce{z-index:10!important}

/* ============ (۳۰) چیپ سلاح‌ها = ردیف افقی بالا-چپ + آیکون PNG ============ */
#wpnChips28{
  top:calc(62px * var(--uiz,1))!important;left:calc(10px * var(--uiz,1))!important;right:auto!important;
  flex-direction:row!important;gap:calc(6px * var(--uiz,1))!important;z-index:6!important;
}
.wchip28 img.ic30{width:calc(34px * var(--uiz,1))!important;height:calc(34px * var(--uiz,1))!important;border-radius:calc(9px * var(--uiz,1));display:block}
.wchip28 canvas{display:none!important}
.wchip28 svg{display:none!important}

/* ============ (۳۰) چراغ‌قوه/کوله = آیکون PNG کاربر ============ */
#ctlFlash .ic .ic30{width:calc(23px * var(--uiz,1))!important;height:calc(23px * var(--uiz,1))!important;border-radius:calc(6px * var(--uiz,1));display:block}
#backpackBar .bpk-cap .ic30{width:calc(15px * var(--uiz,1))!important;height:calc(15px * var(--uiz,1))!important;border-radius:calc(5px * var(--uiz,1));margin-inline-end:calc(5px * var(--uiz,1));display:inline-block;vertical-align:middle}

/* ============ (۳۰) دستفروش مرموز — رفع بریده‌شدن کارت‌ها ============
   ریشه: #pdStock فرزندِ flex پنل با max-height بود ولی بدون
   min-height:0 → جمع نمی‌شد، از پنل بیرون می‌زد و با overflow:hidden
   بریده می‌شد و هرگز اسکرول نمی‌شد (روی گوشی با uiz≈۱٫۵) */
#peddlerPanel{
  width:min(calc(430px * var(--uiz,1)), calc(92vw / var(--uiz,1)))!important;
  max-height:82%!important;
}
#pdStock{
  flex:1 1 auto!important;min-height:0!important;
  overflow-y:auto!important;overscroll-behavior:contain!important;
  -webkit-overflow-scrolling:touch!important;
}
#pdStock .pd-item{align-items:center!important}
#pdStock .pd-item canvas{display:none!important}
#pdStock .pd-item img.pd-ic30{
  width:calc(50px * var(--uiz,1))!important;height:calc(50px * var(--uiz,1))!important;
  border-radius:calc(11px * var(--uiz,1))!important;flex:none!important;
  background:rgba(10,8,24,.6)!important;border:1px solid #4a3d84!important;
}
/* مخفی‌سازی در حالت‌های غیر بازی (به‌جای قوانین FAB) */
#wrap.menu-mode #buildPanel,#wrap.cs-mode #buildPanel{display:none!important}
`;
  document.head.appendChild(st);
})();

/* ---------- ۳۰-۲) تزریق اسپرایت‌های تازه در CUBE_SPRITES/CUBE_IMGS ---------- */
const SPRITE30 = {
  pistol: 'pistol', shotgun: 'shotgun', mg: 'rifle',
  flashlight: 'flashlight', repair: 'firstaid', trap: 'landmine',
  speed: 'runner', health: 'shield', sniper: 'binoculars', medkit: 'firstaid',
};
function sprites30() {
  for (const tile in SPRITE30) {
    const src = ICONS30[SPRITE30[tile]];
    if (!src) continue;
    try { CUBE_SPRITES[tile] = src; } catch (e) {}
    const im = new Image();
    im.onload = () => { try { repaintCubeIcons(tile); } catch (e) {} };
    im.src = src;
    try { CUBE_IMGS[tile] = im; } catch (e) {}
  }
}

/* ---------- ۳۰-۳) حذFAB/اسکریم/مینی-شب شیت v28-29 ---------- */
function removeSheetLegacy30() {
  ['bpFab28', 'bpScrim29', 'bpNightMini28'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });
  /* «شب شود» قبل از buildPanel برود تا قانونِ خواهر-برادرِ v28
     (مخفی‌شدن هنگام باز بودن پنل) دیگر مطابقت نکند — داک بالا
     با دکمه پایین-راست هیچ تداخلی ندارد */
  try {
    const wrap = document.getElementById('wrap');
    const night = document.getElementById('bpNight');
    const bp = document.getElementById('buildPanel');
    if (wrap && night && bp && night.parentElement === wrap && bp.parentElement === wrap) {
      wrap.insertBefore(night, bp);
    }
  } catch (e) {}
}

/* آیکون سربرگ داک = جعبه کاربر */
function buildPillIcon30() {
  const head = document.getElementById('bpHead');
  if (!head) return;
  const old = head.querySelector('.ic');
  if (ICONS30.ammobox && !head.querySelector('img.ic30')) {
    const img = document.createElement('img');
    img.className = 'ic30';
    img.src = ICONS30.ammobox;
    img.alt = '';
    if (old) old.replaceWith(img);
    else head.insertBefore(img, head.firstChild);
  } else if (old) { old.remove(); }
  head.title = 'ساخت‌وساز — وسط بازی هم باز می‌ماند (کلید B)';
}

/* چیپ سلاح‌ها: SVG/کانواس v29 → PNG کاربر */
function weaponChipIcons30() {
  const MAP = { pistol: 'pistol', shotgun: 'shotgun', mg: 'rifle' };
  for (const id in MAP) {
    const b = document.getElementById('wchip28-' + id);
    if (!b) continue;
    const old = b.querySelector('svg') || b.querySelector('canvas');
    if (old) old.remove();
    if (!b.querySelector('img.ic30') && ICONS30[MAP[id]]) {
      const img = document.createElement('img');
      img.className = 'ic30';
      img.src = ICONS30[MAP[id]];
      b.insertBefore(img, b.firstChild);
    }
  }
}

/* کاشی سلاح‌ها داخل داک: SVG/کانواس → PNG */
function sheetWeaponIcons30() {
  const MAP = { pistol: 'pistol', shotgun: 'shotgun', mg: 'rifle' };
  for (const id in MAP) {
    const el = document.getElementById('bp-' + id);
    if (!el) continue;
    const holder = el.querySelector('.bp-ic29');
    if (holder) {
      const svg = holder.querySelector('svg');
      if (svg) svg.remove();
      if (!holder.querySelector('img') && ICONS30[MAP[id]]) {
        const img = document.createElement('img');
        img.src = ICONS30[MAP[id]];
        holder.appendChild(img);
      }
    } else {
      const cv = el.querySelector('canvas.bp-ic');
      if (cv && ICONS30[MAP[id]]) {
        const img = document.createElement('img');
        img.className = 'bp-ic30';
        img.src = ICONS30[MAP[id]];
        cv.replaceWith(img);
      }
    }
  }
}

/* آیکون چراغ‌قوه (دکمه کنترل چپ) */
function flashIcon30() {
  const b = document.getElementById('ctlFlash');
  if (!b) return;
  const ic = b.querySelector('.ic');
  if (ic) {
    ic.innerHTML = '';
    if (ICONS30.flashlight) {
      const img = document.createElement('img');
      img.className = 'ic30';
      img.src = ICONS30.flashlight;
      ic.appendChild(img);
    }
  }
}

/* لوگوی کوله‌پشتی روی برچسبش — refreshBackpack هر بار innerHTML کپسول را
   بازنویسی می‌کند؛ پس آیکون PNG را بعد از هر رفرش دوباره می‌گذاریم */
function backpackIcon30() {
  const putImg = () => {
    try {
      const cap = document.getElementById('bpkCap');
      if (!cap || !ICONS30.backpack) return;
      if (cap.querySelector('img.ic30')) return;
      const ic = cap.querySelector('i.ic');
      const img = document.createElement('img');
      img.className = 'ic30';
      img.src = ICONS30.backpack;
      if (ic) ic.replaceWith(img);
      else cap.insertBefore(img, cap.firstChild);
    } catch (e) {}
  };
  putImg();
  if (typeof refreshBackpack === 'function' && !refreshBackpack.__30) {
    const _rb = refreshBackpack;
    refreshBackpack = function () {
      _rb.apply(this, arguments);
      putImg();
    };
    refreshBackpack.__30 = true;
  }
}

/* ---------- ۳۰-۴) دستفروش: آیکون PNG کالاها + پایداری اسکرول ---------- */
const PDICONS30 = {
  vest: 'vest', goldAmmo: 'ammobox', adrenaline: 'energy',
  freezeBomb: 'grenade', airstrike: 'binoculars', helmet: 'shield',
  tesla: 'radar', missile: 'grenade', flame: 'energy',
};
function vendorIcons30() {
  if (typeof renderPeddlerStock !== 'function' || renderPeddlerStock.__30) return;
  const _old = renderPeddlerStock;
  renderPeddlerStock = function () {
    _old.apply(this, arguments);
    try {
      const items = document.querySelectorAll('#pdStock .pd-item');
      items.forEach(el => {
        if (el.querySelector('img.pd-ic30')) return;
        /* آیتم را از روی آیکون/متن تشخیص می‌دهیم — کلاس pd-bp = نقشه */
        const isBp = el.classList.contains('pd-bp');
        const name = (el.querySelector('.pd-name') || {}).textContent || '';
        const price = (el.querySelector('.pd-price') || {}).textContent || '';
        const priceN = parseInt(String(price).replace(/[^۰-۹0-9]/g, '').replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)), 10) || 0;
        let iconKey = null;
        if (isBp) {
          if (priceN >= 480) iconKey = 'missile';
          else if (priceN >= 400) iconKey = 'tesla';
          else iconKey = 'flame';
        } else {
          if (/جلیقه/.test(name)) iconKey = 'vest';
          else if (/طلایی|فشنگ/.test(name)) iconKey = 'goldAmmo';
          else if (/کلاهخود/.test(name)) iconKey = 'helmet';
          else if (/آدرنالین/.test(name)) iconKey = 'adrenaline';
          else if (/یخ|انجماد/.test(name)) iconKey = 'freezeBomb';
          else if (/هوایی|بمباران/.test(name)) iconKey = 'airstrike';
        }
        if (!iconKey || !ICONS30[PDICONS30[iconKey]]) return;
        const cv = el.querySelector('canvas');
        if (cv) {
          const img = document.createElement('img');
          img.className = 'pd-ic30';
          img.src = ICONS30[PDICONS30[iconKey]];
          cv.replaceWith(img);
        }
      });
    } catch (e) {}
  };
  renderPeddlerStock.__30 = true;
}

/* ---------- ۳۰-۵) راه‌اندازی ---------- */
function setup30() {
  try { sprites30(); } catch (e) {}
  try { removeSheetLegacy30(); } catch (e) {}
  try { buildPillIcon30(); } catch (e) {}
  try { weaponChipIcons30(); } catch (e) {}
  try { sheetWeaponIcons30(); } catch (e) {}
  try { flashIcon30(); } catch (e) {}
  try { backpackIcon30(); } catch (e) {}
  try { vendorIcons30(); } catch (e) {}
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setup30, { once: true });
} else {
  setup30();
}
