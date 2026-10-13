/* ==================================================================
   سه طبقه تا بقا — نسخه‌ی ۱۴٫۰ — بخش ۶: کوله‌پشتی، وسایل بقی،
   چراغ‌قوه و تاریکی، قطع برق تصادفی و دستفروش مرموز (استوری‌مود)
   ==================================================================
   - فروشگاه بخش تازه «وسایل بقی» دارد: چراغ‌قوه، باتری، کنسرو (شفای
     تدریجی) و کیت کمک‌های اولیه (شفای فوری) — همه داخل کوله‌پشتی
     ۶ جایی می‌روند و با کلیک یا کلیدهای Q..U مصرف می‌شوند
   - چراغ‌قوه باتری محدود دارد (کلید L)؛ در مهِ انبارها و لحظه‌های
     قطع برق وسط موج، دید به دایره‌ی نور دور بازیکن محدود می‌شود
   - دستفروش مرموز (۱۴٫۰ استوری‌مود): هر چند روز یک‌بار با شانس ۴۰٪
     از چپ می‌آید، پایین برج با تو حرف می‌زند (پرتره + صدا)، کالای
     کمیاب می‌فروشد (۳۰٪ تقلبی!) و «شب شود» که زده شود بدرقه می‌شود.
   ================================================================== */

/* ---------------------- ۶-۱) وسایل بقی و آیتم‌های کمیاب ---------------------- */
const GEAR = {
  flashlight: { name: 'چراغ‌قوه',            price: 55, icon: 'flashlight', color: '#f5d76e',
    desc: 'دید در مه و قطع برق (باتری دارد) — دکمه‌ی پایین-چپ' },
  battery:    { name: 'باتری',               price: 20, icon: 'battery',    color: '#7be389',
    desc: '+۵۰٪ شارژ چراغ‌قوه — ذخیره در کوله، مصرف با لمس' },
  canned:     { name: 'کنسرو',               price: 16, icon: 'canned',     color: '#e8a13c',
    desc: 'شفای تدریجی ۴۵ جون در ۱۲ ثانیه' },
  medkit:     { name: 'کیت کمک‌های اولیه',   price: 30, icon: 'medkit',     color: '#ff8a8a',
    desc: '۷۰ جون برج را فوراً برمی‌گرداند' },
};

/* آیتم‌های کمیاب دستفروش (فعال‌سازی دائمی بعد از مصرف)
   (۲۰٫۰) بازخورد کاربر «هر سری یه چیز جدید بیاره و جالب باشه» —
   سه کالای مصرفیِ تازه هم اضافه شد: حمله‌ی هوایی، بمب یخی و آدرنالین */
const RARE = {
  vest:     { name: 'جلیقه‌ی ضدّ گازگزش', price: 150, icon: 'vest',     color: '#8fd6ff',
    desc: 'آسیب گازِ زامبی‌ها ۲۵٪ کمتر — دائمی' },
  goldAmmo: { name: 'فشنگ‌های طلایی',   price: 185, icon: 'goldAmmo', color: '#ffd873',
    desc: 'دمیج همه‌ی گلوله‌ها ۲۵٪ بیشتر — دائمی' },
  helmet:   { name: 'کلاهخود فولادی',   price: 120, icon: 'helmet',   color: '#b8c4d4',
    desc: '+۴۰ به حداکثر جون برج — دائمی' },
  airstrike:{ name: 'بی‌سیمِ حمله‌ی هوایی', price: 220, icon: 'airstrike', color: '#ff8a5a',
    desc: 'مصرف = بمبارانِ همه‌ی زامبی‌های صفحه' },
  freezeBomb:{ name: 'بمب یخی',          price: 140, icon: 'freezeBomb', color: '#8fd6ff',
    desc: 'مصرف = انجمادِ کاملِ ۶ ثانیه‌ایِ همه' },
  adrenaline:{ name: 'آدرنالین',         price: 110, icon: 'adrenaline', color: '#ff6a8a',
    desc: 'مصرف = ۱۲ ثانیه شلیک سریع + دمیج دوبرابر' },
};

/* (۲۰٫۰) نقشه‌های ساختِ برجک‌های ویژه — فقط از دستفروش می‌آیند؛
   بعد از خرید، برجک در تب «برجک‌ها» باز می‌شود و جداگانه نصب می‌شود */
const BLUEPRINTS = {
  tesla:   { name: 'نقشه‌ی برجک تسلا',       price: 240, icon: 'bpTesla',   color: '#c04dff',
    desc: 'برجک آذرخش زنجیره‌ای (۳ هدف) را در ساخت‌وساز باز می‌کند' },
  missile: { name: 'نقشه‌ی برجک موشک‌انداز', price: 280, icon: 'bpMissile', color: '#ff8a5a',
    desc: 'برجک انفجارِ محدوده‌ای را در ساخت‌وساز باز می‌کند' },
  flame:   { name: 'نقشه‌ی برجک شعله‌افکن',  price: 200, icon: 'bpFlame',   color: '#ffb347',
    desc: 'برجک شعله + آتش‌گیرندگی را در ساخت‌وساز باز می‌کند' },
};

/* کلیدهای میان‌بر مصرف کوله‌پشتی (اسلات ۱ تا ۶) */
const BPKEYS = { KeyQ: 1, KeyW: 2, KeyE: 3, KeyR: 4, KeyY: 5, KeyU: 6 };

/* صداهای جدید این بخش */
Object.assign(SFX, {
  powerDown() { Snd.tone({ type: 'sawtooth', f0: 320, f1: 38, dur: 0.7, vol: 0.15 });
                Snd.noise({ dur: 0.5, vol: 0.10, freq: 300 }); },
  powerUp2()  { Snd.tone({ type: 'triangle', f0: 120, f1: 480, dur: 0.4, vol: 0.12 }); },
  scam()      { [280, 220, 160].forEach((f, i) =>
                Snd.tone({ type: 'sawtooth', f0: f, f1: f * 0.84, dur: 0.22, vol: 0.13, delay: i * 0.24 })); },
  peddler()   { Snd.tone({ type: 'triangle', f0: 520, f1: 660, dur: 0.14, vol: 0.10 });
                Snd.tone({ type: 'triangle', f0: 660, f1: 520, dur: 0.18, vol: 0.09, delay: 0.15 }); },
});

/* ---------------------- ۶-۲) مسیر یکسان خرید (buy) ---------------------- */
/* همه‌ی خریدهای پنل/کیبورد از این‌جا رد می‌شوند:
   ۱) در «آخرین شب» فروشگاه قفل است  ۲) وسایل بقی مسیر خودشان را دارند
   ۳) بقیه = attemptBuy اصلی  ۴) بعد از هر خرید موفق، سیو خودکار */
function buy(kind) {
  /* قفل فروشگاه در موج آخر کل بازی (۱۰٫۰) */
  if (state.wave >= FINAL_WAVE && state.mode === 'playing') {
    SFX.deny();
    setAnnounce('🔒 فروشگاه قفل است!', 'در «آخرین شب» فقط کوله‌پشتی و برجت کارت را می‌کنند', 1.8);
    return;
  }
  if (GEAR[kind]) { buyGear(kind); return; }
  const before = state.coins;
  attemptBuy(kind);
  if (state.coins !== before) saveGame();      // (۱۰٫۰) سیو بعد از خرید
}

/* خرید وسایل بقی: چراغ‌قوه یک‌بار؛ بقیه به کوله‌پشتی می‌روند */
function buyGear(kind) {
  if (!canPlay()) return;
  const g = GEAR[kind];
  if (kind === 'flashlight') {
    if (state.torch.owned) return;
    if (state.coins < g.price) { denyBPItem('flashlight'); return; }
    state.coins -= g.price;
    state.torch.owned = true;
    state.torch.battery = 100;
    state.torch.on = true;                     // روشن تحویل گرفته می‌شود
    SFX.buy();
    setAnnounce('🔦 چراغ‌قوه گرفتی!', 'کلید L روشن/خاموشش می‌کند — باتری: ۱۰۰٪', 2.4);
    spawnParticles(TOWER.x, TOWER_TOP_Y - 20, 16, '#f5d76e',
      { speed: 150, life: 0.6, size: 2.4, grav: 250, up: true });
    saveGame();
    updateHUD(); refreshBuildPanel(); refreshGearHUD();
    return;
  }
  if (state.coins < g.price) { denyBPItem(kind); return; }
  if (!giveItem(kind)) return;                 // کوله پر بود → سکه کنار ماند
  state.coins -= g.price;
  SFX.buy();
  addText(TOWER.x, TOWER_TOP_Y - 46, g.name + ' → کوله 🎒', '#9fe08a', 13);
  saveGame();
  updateHUD(); refreshBuildPanel(); refreshBackpack();
}

/* ---------------------- ۶-۳) کوله‌پشتی (۶ جا) ---------------------- */
/* گذاشتن آیتم در اولین جای خالی */
function giveItem(id) {
  const i = state.backpack.findIndex(s => !s);
  if (i < 0) {
    setAnnounce('🎒 کوله‌پشتی پر است!', 'اول یکی را مصرف کن (کلیک روی جاخالی یا Q تا U)', 2);
    SFX.deny();
    return false;
  }
  state.backpack[i] = { id };
  refreshBackpack();
  return true;
}

/* مصرف آیتم اسلات i (کلیک یا کلید) */
function useItem(i) {
  if (!canPlay()) return;
  if (i < 0 || i > 5) return;
  const s = state.backpack[i];
  if (!s) return;
  const id = s.id;
  if (id === 'battery') {
    if (!state.torch.owned) {
      setAnnounce('🔦 چراغ‌قوه نداری!', 'اول چراغ‌قوه را از فروشگاه بخر (کلید J)', 1.8);
      SFX.deny();
      return;
    }
    state.torch.battery = clamp(state.torch.battery + 50, 0, 100);
    addText(TOWER.x, TOWER_TOP_Y - 46, '+۵۰٪ 🔦', '#7be389', 15);
    SFX.power();
    refreshGearHUD();
  } else if (id === 'canned') {
    state.regen += 45;                         // ۳٫۷۵ جون در ثانیه × ۱۲ ثانیه
    addText(TOWER.x, TOWER_TOP_Y - 46, 'شفای تدریجی 🥫', '#e8a13c', 15);
    SFX.power();
  } else if (id === 'medkit') {
    healTower(70);
    SFX.power();
  } else if (id === 'airstrike') {
    /* (۲۰٫۰) بی‌سیمِ حمله‌ی هوایی: بمبارانِ همه‌ی زامبی‌های زنده */
    if (!useAirstrike()) return;              /* هدفی نبود → مصرف نشود */
  } else if (id === 'freezeBomb') {
    /* (۲۰٫۰) بمب یخی: انجماد کاملِ ۶ ثانیه‌ای */
    state.powerTimers.freeze = Math.max(state.powerTimers.freeze, 6);
    SFX.freeze();
    setAnnounce('❄ انجماد کامل!', 'همه‌ی زامبی‌ها ۶ ثانیه خشک زدند — ببار!', 2.4);
    for (const z of state.zombies) {
      if (z.dead) continue;
      spawnParticles(z.x, z.y - 24, 8, '#cfeaff', { speed: 120, life: 0.6, size: 2.4, grav: 140 });
    }
  } else if (id === 'adrenaline') {
    /* (۲۰٫۰) آدرنالین: ۱۲ ثانیه شلیک سریع + دمیج دوبرابر */
    state.adren = 12;
    state.powerTimers.rapid = Math.max(state.powerTimers.rapid, 12);
    SFX.power();
    setAnnounce('💉 آدرنالین تزریق شد!', '۱۲ ثانیه: شلیک سریع + دمیج دوبرابر!', 2.4);
    spawnParticles(TOWER.x, TOWER_TOP_Y - 30, 20, '#ff6a8a',
      { speed: 190, life: 0.7, size: 2.6, grav: 220, up: true });
    state.shake = Math.min(8, state.shake + 4);
  } else if (RARE[id]) {
    if (state.buffs[id]) {
      setAnnounce('✅ ' + RARE[id].name + ' از قبل فعال است', 'برای بعد نگهش دار', 1.8);
      SFX.deny();
      return;                                  // مصرف نشود
    }
    state.buffs[id] = true;
    if (id === 'helmet') { state.tower.maxHp += 40; state.tower.hp += 40; }
    setAnnounce('⚡ ' + RARE[id].name + ' فعال شد!', RARE[id].desc, 2.4);
    SFX.power();
    spawnParticles(TOWER.x, TOWER_TOP_Y - 30, 18, RARE[id].color,
      { speed: 170, life: 0.6, size: 2.6, grav: 200, up: true });
    updateHUD();
  }
  state.backpack[i] = null;
  spawnParticles(TOWER.x, TOWER_TOP_Y - 26, 10, '#7be389',
    { speed: 130, life: 0.5, size: 2.2, grav: 220, up: true });
  refreshBackpack();
}

/* (۲۰٫۰) حمله‌ی هوایی: بمبارانِ صفحه — بمب‌ها از آسمان می‌ریزند */
function useAirstrike() {
  const targets = state.zombies.filter(z => !z.dead);
  if (!targets.length) {
    setAnnounce('✈ هدفی نیست!', 'برای مرحله‌ی بعد نگهش دار', 1.6);
    SFX.deny();
    return false;
  }
  state.shake = 14;
  state.flash = 0.6;
  setAnnounce('✈ حمله‌ی هوایی!', 'بمبارانِ کلِ صفحه — بگذار آسمان کارش را بکند!', 2.6);
  for (const z of targets) {
    /* انفجار زیر پای هر زامبی + آسیب سنگین */
    spawnParticles(z.x, z.y - 10, 14, '#ffb26e', { speed: 230, life: 0.5, size: 3, grav: 320 });
    spawnParticles(z.x, z.y - 10, 6, 'rgba(255,240,200,0.95)', { speed: 170, life: 0.35, size: 2.4, grav: 160 });
    state.zaps.push({ pts: [{ x: z.x, y: z.y - 10 }], age: 0, life: 0.28, ring: true, rr: 60 });
    hitZombie(z, z.type === 'boss' ? 900 : 160, z.x, z.y - 10,
      Math.sign(z.x - TOWER.x) || 1, false, 3, 'airstrike');
  }
  /* ردِ هواپیمای بالای سر */
  for (let i = 0; i < 5; i++) {
    spawnParticles(120 + i * 170, 60, 3, 'rgba(220,230,240,0.7)',
      { speed: 300, life: 0.4, size: 2.2, grav: 0 });
  }
  SFX.missileBoom();
  try { SFX.roar(); } catch (e) {}
  return true;
}

/* ترمیم جون برج (کیت/قدرت‌ها) */
function healTower(n) {
  const heal = Math.min(n, state.tower.maxHp - state.tower.hp);
  if (heal <= 0) {
    setAnnounce('❤️ برج سالم است', 'فعلاً لازم نیست', 1.4);
    return;
  }
  state.tower.hp += heal;
  addText(TOWER.x, TOWER_TOP_Y - 44, '+' + faNum(Math.round(heal)) + ' ❤️', '#7be389', 16);
  spawnParticles(TOWER.x, TOWER_TOP_Y - 30, 12, '#7be389',
    { speed: 140, life: 0.55, size: 2.4, grav: 240, up: true });
  updateHUD();
}

/* ساخت کوله‌پشتی HTML (یک بار در شروع صفحه) */
function initBackpackUI() {
  const wrap = $('bpkSlots');
  wrap.innerHTML = '';
  const keys = ['Q', 'W', 'E', 'R', 'Y', 'U'];
  for (let i = 0; i < 6; i++) {
    const el = document.createElement('div');
    el.className = 'bpk-slot empty';
    el.id = 'bpk-' + i;
    const cv = document.createElement('canvas');
    cv.width = 80; cv.height = 80;
    el.appendChild(cv);
    const k = document.createElement('span');
    k.className = 'bpk-key';
    k.textContent = keys[i];
    el.appendChild(k);
    el.addEventListener('click', () => useItem(i));
    el.addEventListener('mouseenter', () => showBpkTip(i, el));
    el.addEventListener('mouseleave', hideTip);
    wrap.appendChild(el);
  }
  refreshBackpack();
}

/* به‌روزرسانی جاخالی‌ها (آیکون + حالت) — (۱۲٫۰) کوله‌ی خالی = فقط یک قرص کوچک
   (۱۶٫۰) قاب و هاله‌ی هر جاخالی به رنگِ همان وسیله ست می‌شود —
   وسیله‌های آماده‌ی مصرف قاف سبز می‌گیرند (CSS)، بقیه رنگ خودشان را */
function refreshBackpack() {
  const any = state.backpack.some(s => s);
  const bar = $('backpackBar');
  if (bar) bar.classList.toggle('compact', !any);
  const cap = $('bpkCap');
  const n = state.backpack.filter(s => s).length;
  /* (۲۶٫۰) آیکن SVG به‌جای ایموجی 🎒
     (۲۸٫۰) متن بلندِ «کوله خالی — خرید از تب بقا» حذف شد —
     درخواست کاربر: نوشته‌ی کوله دقیقاً وسط بازی بود؛ حالا فقط
     آیکون کوچک (خالی) یا آیکون + شمارنده (پر) */
  const bpkIc = (typeof ICO !== 'undefined' ? '<i class="ic">' + ICO.ico('backpack') + '</i>' : '');
  if (cap) cap.innerHTML = any
    ? bpkIc + ' ' + faNum(n) + '/' + faNum(6)
    : bpkIc;
  for (let i = 0; i < 6; i++) {
    const el = $('bpk-' + i);
    if (!el) continue;
    const s = state.backpack[i];
    const cv = el.querySelector('canvas');
    el.classList.toggle('empty', !s);
    const usable = !!s && (GEAR[s.id] || (RARE[s.id] && !state.buffs[s.id]));
    el.classList.toggle('ready', usable);
    paintGearIcon(s ? s.id : null, cv);
    /* (۱۶٫۰) قاب/هاله‌ی رنگی — سبزِ CSS برای آماده‌ها را با استایل
       درون‌خطی له نمی‌کنیم؛ فقط غیرآماده‌ها رنگ خودشان را می‌گیرند */
    el.style.borderColor = '';
    el.style.boxShadow = '';
    if (s && !usable) {
      const col = GEAR_ICON_COLORS[s.id] || '#ffd873';
      el.style.borderColor = col;
      el.style.boxShadow = '0 0 12px ' + hexA(col, 0.32) + ',0 4px 12px rgba(0,0,0,.35)';
    }
  }
}

/* تولتیپ مخصوص کوله (سمت راست جاخالی باز می‌شود) */
function bpkStatus(id) {
  if (id === 'battery') return 'کلیک/کلید = شارژ ۵۰٪ چراغ‌قوه';
  if (id === 'canned') return 'کلیک/کلید = شفای تدریجی ۴۵ جون';
  if (id === 'medkit') return 'کلیک/کلید = شفای فوری ۷۰ جون';
  if (id === 'airstrike') return 'کلیک/کلید = بمبارانِ همه‌ی زامبی‌های صفحه';
  if (id === 'freezeBomb') return 'کلیک/کلید = انجماد کاملِ ۶ ثانیه‌ای';
  if (id === 'adrenaline') return 'کلیک/کلید = ۱۲ ثانیه شلیک سریع + دمیج دوبرابر';
  if (RARE[id]) return state.buffs[id] ? 'از قبل فعال است — نگهش دار' : 'کلیک/کلید = فعال‌سازی دائمی';
  return '';
}
function showBpkTip(i, el) {
  const s = state.backpack[i];
  if (!s) return;
  const def = GEAR[s.id] || RARE[s.id];
  if (!def) return;
  const tip = $('bpTip');
  tip.innerHTML = '<b>' + def.name + '</b><span>' + def.desc + '</span>' +
    '<span class="t-status">' + bpkStatus(s.id) + '</span>';
  tip.style.display = 'block';
  /* کوله سمت چپ صفحه است → تولتیپ سمت راستِ جاخالی باز شود */
  const sc = window.__fitScale || 1;              /* (۲۱٫۳) rect ها مقیاس‌خورده‌اند → تقسیم بر مقیاس */
  const wrapR = $('wrap').getBoundingClientRect();
  const r = el.getBoundingClientRect();
  tip.style.left = Math.min(W - tip.offsetWidth - 6, (r.right - wrapR.left) / sc + 8) + 'px';
  tip.style.top = clamp((r.top - wrapR.top) / sc + (r.height / sc) / 2 - tip.offsetHeight / 2, 6, H - tip.offsetHeight - 6) + 'px';
}

/* ---------------------- ۶-۴) آیکون‌های Canvas وسایل ---------------------- */
/* هم‌سبک کاشی‌های فروشگاهِ تصویر مرجع: قاب تیره‌ی گرد + گرادیان +
   هاله‌ی رنگی + نماد برجسته + ذرات ستاره‌ای (بدون فایل خارجی) */
const GEAR_ICON_COLORS = {
  flashlight: '#f5d76e', battery: '#7be389', canned: '#e8a13c', medkit: '#ff8a8a',
  vest: '#8fd6ff', goldAmmo: '#ffd873', helmet: '#b8c4d4',
  airstrike: '#ff8a5a', freezeBomb: '#8fd6ff', adrenaline: '#ff6a8a',
  tesla: '#c04dff', missile: '#ff8a5a', flame: '#ffb347',
};

function icoRR(c, x, y, w, h, r) {
  c.beginPath();
  if (c.roundRect) c.roundRect(x, y, w, h, r);
  else c.rect(x, y, w, h);
}
function icoStar(c, x, y, r) {
  c.beginPath();
  c.moveTo(x - r, y); c.lineTo(x, y - r * 0.35); c.lineTo(x + r, y);
  c.lineTo(x, y + r * 0.35); c.closePath(); c.fill();
  c.beginPath();
  c.moveTo(x, y - r); c.lineTo(x + r * 0.35, y); c.lineTo(x, y + r);
  c.lineTo(x - r * 0.35, y); c.closePath(); c.fill();
}

function paintGearIcon(kind, cv) {
  const S0 = cv.width || 80, S1 = cv.height || 80;
  cv.width = S0; cv.height = S1;
  const c = cv.getContext('2d');
  c.clearRect(0, 0, S0, S1);
  if (!kind) return;
  /* (۱۴٫۰) مقیاس‌پذیر: کاشی‌های ۸۰px کوله/دستفروش بدون تغییر می‌مانند،
     بوم ۸۸px پنل ساخت‌وساز هم بدون برش رسم می‌شود */
  c.save();
  c.scale(S0 / 80, S1 / 80);
  const col = GEAR_ICON_COLORS[kind] || '#ffd873';
  /* زمینه‌ی کاشی */
  icoRR(c, 4, 4, 72, 72, 11);
  c.save(); c.clip();
  const bg = c.createRadialGradient(40, 28, 8, 40, 46, 60);
  bg.addColorStop(0, 'rgba(56,76,128,0.95)');
  bg.addColorStop(0.6, 'rgba(22,32,64,0.97)');
  bg.addColorStop(1, 'rgba(8,13,30,0.99)');
  c.fillStyle = bg; c.fillRect(0, 0, 80, 80);
  const halo = c.createRadialGradient(40, 42, 4, 40, 42, 34);
  halo.addColorStop(0, hexA(col, 0.28)); halo.addColorStop(1, hexA(col, 0));
  c.fillStyle = halo; c.fillRect(0, 0, 80, 80);
  /* سایه‌ی زیر نماد */
  c.fillStyle = 'rgba(0,0,0,0.35)';
  c.beginPath(); c.ellipse(40, 61, 17, 4.5, 0, 0, Math.PI * 2); c.fill();

  c.save(); c.translate(40, 40);
  c.lineCap = 'round'; c.lineJoin = 'round';
  switch (kind) {
    case 'flashlight': {
      c.rotate(-0.5);
      c.fillStyle = '#3a4250'; icoRR(c, -17, -6, 22, 12, 3); c.fill();   // بدنه
      c.fillStyle = '#2c3440'; c.fillRect(-17, -6, 4, 12);               // سرِ عقبی
      c.fillStyle = col;       c.fillRect(5, -7.5, 7, 15);               // کله‌ی روشن
      c.fillStyle = 'rgba(255,244,200,0.95)'; c.fillRect(12, -5.5, 3, 11); // شیشه
      const beam = c.createLinearGradient(15, 0, 33, 0);                 // مخروط نور
      beam.addColorStop(0, 'rgba(255,238,170,0.55)'); beam.addColorStop(1, 'rgba(255,238,170,0)');
      c.fillStyle = beam;
      c.beginPath(); c.moveTo(15, -6); c.lineTo(33, -13); c.lineTo(33, 13); c.lineTo(15, 6);
      c.closePath(); c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 1.4;
      icoRR(c, -17, -6, 22, 12, 3); c.stroke();
      break;
    }
    case 'battery': {
      c.fillStyle = '#2c3440'; c.fillRect(-4, -16, 8, 4);                // نوک
      c.fillStyle = '#39424f'; icoRR(c, -8, -12, 16, 26, 4); c.fill();   // بدنه
      const inG = c.createLinearGradient(-8, 0, 8, 0);
      inG.addColorStop(0, col); inG.addColorStop(0.5, '#a5e8b0'); inG.addColorStop(1, '#4a9a5c');
      c.fillStyle = inG; icoRR(c, -5, -9, 10, 20, 3); c.fill();          // پوسته‌ی سبز
      c.fillStyle = '#12301c';                                           // نشانِ برق
      c.beginPath();
      c.moveTo(2, -6); c.lineTo(-3, 1); c.lineTo(0, 1); c.lineTo(-2, 6);
      c.lineTo(3, -1); c.lineTo(0, -1); c.closePath(); c.fill();
      break;
    }
    case 'canned': {
      c.fillStyle = '#8a97a8';                                            // بدنه‌ی حلب
      icoRR(c, -11, -12, 22, 25, 3); c.fill();
      c.fillStyle = col;                                                  // نوار برچسب
      c.fillRect(-11, -6, 22, 11);
      c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(-11, -6, 22, 1.5); c.fillRect(-11, 3.5, 22, 1.5);
      c.fillStyle = '#c9d4e2';                                            // درِ بیضی
      c.beginPath(); c.ellipse(0, -12, 11, 3.6, 0, 0, Math.PI * 2); c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 1.3;
      c.beginPath(); c.ellipse(0, -12, 11, 3.6, 0, 0, Math.PI * 2); c.stroke();
      c.fillStyle = '#fff8e8';                                            // ماهی روی برچسب
      c.beginPath(); c.ellipse(-2, -0.5, 5.5, 3, -0.3, 0, Math.PI * 2); c.fill();
      c.fillStyle = col;
      c.beginPath(); c.moveTo(2.5, -2.5); c.lineTo(6.5, -0.5); c.lineTo(2.5, 1.5); c.closePath(); c.fill();
      break;
    }
    case 'medkit': {
      c.fillStyle = '#e8eef5'; icoRR(c, -13, -9, 26, 19, 4); c.fill();   // جعبه‌ی سفید
      c.fillStyle = col; c.fillRect(-13, -9, 26, 5);                     // نوار بالایی
      c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 1.4;
      icoRR(c, -13, -9, 26, 19, 4); c.stroke();
      c.fillStyle = '#e04b3a';                                           // صلیب قرمز
      c.fillRect(-2.6, -4, 5.2, 12); c.fillRect(-7, 1, 14, 5.2);
      c.fillStyle = '#c9d4e2'; c.fillRect(-9, -6.5, 6, 3);               // قفل‌گاه
      break;
    }
    case 'vest': {
      c.fillStyle = col;                                                  // تنه‌ی جلیقه
      c.beginPath();
      c.moveTo(-12, -10); c.lineTo(-5, -10); c.lineTo(-4, -5);
      c.lineTo(4, -5); c.lineTo(5, -10); c.lineTo(12, -10);
      c.lineTo(11, 12); c.lineTo(-11, 12); c.closePath(); c.fill();
      c.fillStyle = '#4a7a9a';                                            // نوارهای زرهی
      c.fillRect(-12, -10, 24, 4); c.fillRect(-11, 8, 22, 4);
      c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 1.3;
      c.beginPath();
      c.moveTo(-12, -10); c.lineTo(-5, -10); c.lineTo(-4, -5);
      c.lineTo(4, -5); c.lineTo(5, -10); c.lineTo(12, -10);
      c.lineTo(11, 12); c.lineTo(-11, 12); c.closePath(); c.stroke();
      c.fillStyle = '#2c4a60';                                            // گره‌های شانه
      circle2(c, -8, -7, 1.6); circle2(c, 8, -7, 1.6);
      break;
    }
    case 'goldAmmo': {
      for (const [dx, dy, a] of [[-7, 3, -0.35], [0, 0, -0.1], [7, -3, 0.15]]) {
        c.save(); c.translate(dx, dy); c.rotate(a);
        c.fillStyle = col; icoRR(c, -2.6, -13, 5.2, 17, 2.6); c.fill();  // غلاف طلایی
        c.fillStyle = '#e8a13c'; c.beginPath();                          // نوکِ برنجی
        c.moveTo(-2.6, -13); c.quadraticCurveTo(0, -18, 2.6, -13); c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.55)'; c.fillRect(-1.8, -11, 1.4, 13); // برق طولی
        c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 1;
        icoRR(c, -2.6, -13, 5.2, 17, 2.6); c.stroke();
        c.restore();
      }
      break;
    }
    case 'helmet': {
      c.fillStyle = col;                                                  // گنبد فولادی
      c.beginPath(); c.arc(0, 3, 13, Math.PI, 0); c.closePath(); c.fill();
      c.fillStyle = '#8e9dac'; c.fillRect(-15, 2, 30, 4);                // لبه‌ی جلو
      c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 1.3;
      c.beginPath(); c.arc(0, 3, 13, Math.PI, 0); c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.5)';                             // برقِ گنبد
      c.beginPath(); c.ellipse(-4, -4, 4.5, 2.5, -0.6, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#6a788c'; c.fillRect(-10, 6, 20, 3);                // نوار پایین
      break;
    }
    case 'airstrike': {
      /* بی‌سیم نظامی + موج + هواپیمای کوچک */
      c.fillStyle = '#39424f'; icoRR(c, -10, -2, 20, 15, 3); c.fill();
      c.strokeStyle = '#8a97a8'; c.lineWidth = 1.4; icoRR(c, -10, -2, 20, 15, 3); c.stroke();
      c.strokeStyle = col; c.lineWidth = 1.8;
      c.beginPath(); c.moveTo(-4, 2); c.lineTo(4, 2); c.moveTo(0, -2); c.lineTo(0, 6); c.stroke();
      c.strokeStyle = '#c9d4e2'; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(-6, -6); c.quadraticCurveTo(0, -12, 8, -8); c.stroke();
      c.fillStyle = '#c9d4e2';
      c.beginPath(); c.moveTo(6, -12); c.lineTo(16, -12); c.lineTo(13, -9); c.lineTo(8, -9);
      c.closePath(); c.fill();
      icoStar(c, -14, 8, 2.6); icoStar(c, 14, 4, 2.2);
      break;
    }
    case 'freezeBomb': {
      /* بمب گرد + بلور یخ + مه */
      c.fillStyle = '#39424f'; circle2(c, 0, 2, 11);
      c.strokeStyle = '#5d6a7a'; c.lineWidth = 1.4;
      c.beginPath(); c.arc(0, 2, 11, 0, Math.PI * 2); c.stroke();
      c.fillStyle = col;
      c.beginPath(); c.moveTo(0, -8); c.lineTo(5.5, 2); c.lineTo(0, 11); c.lineTo(-5.5, 2);
      c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.8)';
      c.beginPath(); c.moveTo(0, -8); c.lineTo(2.6, 2); c.lineTo(0, 11); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(200,235,255,0.75)'; c.lineWidth = 1.2;
      for (let k = 0; k < 3; k++) {
        const a = k * 2.09;
        c.beginPath(); c.moveTo(Math.cos(a) * 13, 2 + Math.sin(a) * 13);
        c.lineTo(Math.cos(a) * 17, 2 + Math.sin(a) * 17); c.stroke();
      }
      break;
    }
    case 'adrenaline': {
      /* سرنگ + قطره‌ی قلب */
      c.rotate(-0.5);
      c.fillStyle = '#e8eef5'; icoRR(c, -3, -14, 7, 20, 3); c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 1.2; icoRR(c, -3, -14, 7, 20, 3); c.stroke();
      c.fillStyle = col; c.fillRect(-3, -14, 7, 6);
      c.fillStyle = '#8a97a8'; c.fillRect(-1.4, 6, 3.6, 7);
      c.fillStyle = col;
      c.beginPath();
      c.moveTo(0, -19); c.bezierCurveTo(5, -13, 4, -8, 0, -6);
      c.bezierCurveTo(-4, -8, -5, -13, 0, -19); c.closePath(); c.fill();
      break;
    }
    case 'tesla': case 'missile': case 'flame': {
      /* نقشه‌ی ساخت: کاغذ آبیِ مهندسی + طرحِ برجک */
      c.fillStyle = '#d8e4f0'; icoRR(c, -13, -15, 26, 30, 3); c.fill();
      c.strokeStyle = '#8aa0b8'; c.lineWidth = 1.2; icoRR(c, -13, -15, 26, 30, 3); c.stroke();
      c.strokeStyle = 'rgba(70,100,140,0.6)'; c.lineWidth = 0.8;
      for (let k = -2; k <= 2; k++) {
        c.beginPath(); c.moveTo(-13, k * 6); c.lineTo(13, k * 6); c.stroke();
        c.beginPath(); c.moveTo(k * 6, -15); c.lineTo(k * 6, 15); c.stroke();
      }
      c.strokeStyle = col; c.lineWidth = 2; c.lineCap = 'round';
      if (kind === 'tesla') {
        c.beginPath(); c.moveTo(0, 10); c.lineTo(0, -2); c.stroke();
        c.fillStyle = col; circle2(c, 0, -6, 4);
        c.beginPath();
        c.moveTo(3, -9); c.lineTo(8, -12); c.moveTo(8, -12); c.lineTo(5, -12);
        c.moveTo(-3, -9); c.lineTo(-8, -12); c.moveTo(-8, -12); c.lineTo(-5, -12);
        c.stroke();
      } else if (kind === 'missile') {
        c.save(); c.rotate(0.6);
        c.fillStyle = col; icoRR(c, -2.6, -11, 5.2, 18, 2.6); c.fill();
        c.beginPath(); c.moveTo(-2.6, -11); c.quadraticCurveTo(0, -15, 2.6, -11); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(-2.6, 7); c.lineTo(-5, 10); c.lineTo(-2.6, 8); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(2.6, 7); c.lineTo(5, 10); c.lineTo(2.6, 8); c.closePath(); c.fill();
        c.restore();
      } else {
        c.fillStyle = '#6e2a22'; icoRR(c, -7, -3, 14, 12, 4); c.fill();
        c.strokeStyle = col; c.lineWidth = 2.4;
        c.beginPath(); c.moveTo(4, 3); c.lineTo(12, -5); c.stroke();
        c.fillStyle = col; circle2(c, 13, -6, 2.6);
      }
      break;
    }
  }
  c.restore();
  /* ذرات ستاره‌ای مثل کاشی‌های فروشگاه مرجع */
  c.fillStyle = 'rgba(255,255,255,0.85)';
  icoStar(c, 20, 19, 3.2); icoStar(c, 61, 57, 2.6); icoStar(c, 59, 22, 1.9);
  c.restore();
  /* لبه‌ی قاب */
  c.strokeStyle = 'rgba(120,170,230,.3)'; c.lineWidth = 2;
  icoRR(c, 5, 5, 70, 70, 10); c.stroke();
  c.restore();                                 /* (۱۴٫۰) پایان مقیاس */
}
function circle2(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }

/* ---------------------- ۶-۵) چراغ‌قوه ---------------------- */
function toggleFlashlight() {
  if (!state.torch.owned) {
    if (canPlay()) setAnnounce('🔦 چراغ‌قوه نداری!', 'از پنل ساخت‌وساز بخرش (کلید J)', 1.8);
    SFX.deny();
    return;
  }
  if (!state.torch.on && state.torch.battery <= 0) {
    setAnnounce('🔋 باتری تمام است!', 'باتری تازه از فروشگاه (کلید K) یا کوله‌پشتی', 1.8);
    SFX.deny();
    return;
  }
  state.torch.on = !state.torch.on;
  SFX.click();
  refreshGearHUD();
}

/* HUD چراغ‌قوه: دکمه + نوار باتری */
function refreshGearHUD() {
  const btn = $('ctlFlash');
  if (!btn) return;
  btn.classList.toggle('nolight', !state.torch.owned || !state.torch.on);
  btn.classList.toggle('dead', state.torch.owned && state.torch.battery <= 0);
  $('ctlBattFill').style.width = clamp(state.torch.battery, 0, 100) + '%';
}

/* ---------------------- ۶-۶) تاریکی و دایره‌ی نور ---------------------- */
/* لایه‌ی تاریکی: مهِ فصل ۲، قطع برق تصادفی و «آخرین شب».
   نورها: محیطِ مهتابی + چراغ‌قوه‌ی بازیکن + دهانه‌ی اسلحه + برجک‌ها
   (۱۶٫۰) تاریکیِ «لکه‌ای و متغیر» به‌جای پوششِ یکدستِ سنگین:
   پایه‌ی ملایم همه‌جا + ابرهای شناورِ تیره‌تر — بازخورد کاربر:
   «از فصل دو به بعد کلا تاریک نشود؛ متغیر باشد — بعضی جاها
   یه‌قدر تاریک، بعضی جاها کامل، بعضی جاها اصلاً» */
const Dark = {
  level: 0, target: 0, _blobs: null, _cl: null,

  /* ابرِ لکه‌ای: اسپرایتی از ۷ گرادیانِ نرمِ روی‌هم — چون همه‌ی
     گرادیان‌ها با شبه‌تصادفِ ثابت رسم می‌شوند، فقط یک بار در
     هر اجرا ساخته می‌شود و بعد فقط drawImage (کارایی ۱۲٫۰) */
  _cloud() {
    if (this._cl) return this._cl;
    const s = document.createElement('canvas');
    s.width = 512; s.height = 512;
    const c = s.getContext('2d');
    let seed = 137;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 7; i++) {
      const x = 96 + rnd() * 320, y = 96 + rnd() * 320, r = 88 + rnd() * 148;
      const g = c.createRadialGradient(x, y, r * 0.14, x, y, r);
      g.addColorStop(0, 'rgba(3,7,17,0.5)');
      g.addColorStop(1, 'rgba(3,7,17,0)');
      c.fillStyle = g; c.fillRect(0, 0, 512, 512);
    }
    this._cl = s;
    return s;
  },
  /* میدانِ ۴ لکه‌ی شناور: هرکدام مقیاس/شدت/سرعتِ خودش را دارد —
     کمتر و کوچک‌تر از پیش تا «جاهای بدون تاریکی» هم دیده شوند */
  _field() {
    if (this._blobs) return this._blobs;
    const arr = [];
    for (let i = 0; i < 4; i++) arr.push({
      x: (i + 0.5) / 4 * W + (Math.random() - 0.5) * 160,
      y: Math.random() * H,
      sc: 0.62 + Math.random() * 0.5,
      a: 0.42 + Math.random() * 0.28,
      vx: (Math.random() - 0.5) * 9, vy: (Math.random() - 0.5) * 6,
      ph: Math.random() * Math.PI * 2,
    });
    this._blobs = arr;
    return arr;
  },

  /* شعاع نور محیطی (مهتاب/مه) — در قطع برق کامل کوچک می‌شود */
  ambientR() {
    if (this.level > 0.85) return 44;
    return 128 + 132 * curCh().theme.darkBase;
  },
  /* شعاع چراغ‌قوه — تابع باتری + لرزش نور */
  flashR() {
    if (!state.torch.owned || !state.torch.on || state.torch.battery <= 0) return 0;
    const r = 138 + 92 * (state.torch.battery / 100);
    const flick = 0.93 + 0.07 * Math.sin(animTime * 17) + (Math.random() < 0.03 ? -0.16 : 0);
    return Math.max(24, r * flick);
  },
  /* مرکز نور: بازیکن روی برج (کمی به سمت هدفش) */
  lightXY() {
    return {
      x: TOWER.x + Math.cos(state.aimAngle) * 22,
      y: TOWER_TOP_Y - 12 + Math.sin(state.aimAngle) * 16,
    };
  },

  update(dt) {
    /* هدف تاریکی لحظه‌ای: قطع برق > آخرین شب > مهِ فصل — روز/منو = صفر */
    let t = curCh().theme.darkBase * (1 - state.dayness);
    if (state.blackout.on) t = 1;
    if (state.wave >= FINAL_WAVE && state.mode === 'playing') t = 1;
    if (!(state.mode === 'playing' || state.mode === 'day' || state.mode === 'intermission')) t = 0;
    this.target = t;
    this.level += (this.target - this.level) * Math.min(1, dt * 2.4);

    /* (۱۶٫۰) دریفتِ آرامِ لکه‌های تاریکی — می‌آیند و می‌روند؛
       تاریکی هیچ‌وقت ثابت و یکدست به چشم نمی‌آید */
    if (this.level > 0.04) {
      for (const b of this._field()) {
        b.x += (b.vx + Math.sin(animTime * 0.13 + b.ph) * 7) * dt;
        b.y += (b.vy + Math.cos(animTime * 0.11 + b.ph) * 5) * dt;
        const m = 300 * b.sc;
        if (b.x < -m) b.x = W + m; else if (b.x > W + m) b.x = -m;
        if (b.y < -m) b.y = H + m; else if (b.y > H + m) b.y = -m;
      }
    }

    /* مصرف باتری وقتی چراغ در تاریکی روشن است */
    if (state.torch.on && this.level > 0.25 && state.torch.battery > 0) {
      state.torch.battery = Math.max(0, state.torch.battery - dt * 1.5);
      if (state.torch.battery <= 0) {
        setAnnounce('🔋 باتری چراغ‌قوه تمام شد!', 'از کوله باتری مصرف کن یا K بخر', 2.2);
        SFX.deny();
        refreshGearHUD();
      }
    }
    /* ضربان قلب در تاریکیِ بی‌نور */
    if (this.level > 0.8 && this.flashR() <= 0 && state.mode === 'playing') {
      state.heartT -= dt;
      if (state.heartT <= 0) { state.heartT = 1.25; SFX.heartbeat(); }
    }
  },

  /* سوراخ کردن تاریکی با یک دایره‌ی نور نرم (روی بوم جدا — تا صحنه پاک نشود)
     (۱۲٫۰) کارایی: اسپرایتِ گرادیان یک‌بار ساخته می‌شود و بعد فقط
     drawImage مقیاس‌شده — دیگر هر فریم createRadialGradient نمی‌سازیم */
  _sprite() {
    if (this._sp) return this._sp;
    const s = document.createElement('canvas');
    s.width = 128; s.height = 128;
    const c = s.getContext('2d');
    const g = c.createRadialGradient(64, 64, 9, 64, 64, 64);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.62, 'rgba(0,0,0,0.5)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 128, 128);
    this._sp = s;
    return s;
  },
  punch(c, x, y, r, hard) {
    if (r <= 5) return;
    c.globalAlpha = hard ? 0.98 : 0.85;
    c.drawImage(this._sprite(), x - r, y - r, r * 2, r * 2);
    c.globalAlpha = 1;
  },

  render() {
    if (this.level <= 0.04) return;
    if (!(state.mode === 'playing' || state.mode === 'day' || state.mode === 'intermission')) return;
    const lv = clamp(this.level, 0, 1);
    /* بوم جدا برای لایه‌ی تاریکی: سوراخ‌ها (نورها) این‌جا زده می‌شوند و بعد
       کل لایه روی صحنه می‌نشیند — destination-out مستقیم روی بوم اصلی، خودِ
       صحنه را هم پاک می‌کرد (باگ ۱۰٫۰) */
    if (!this.cv) { this.cv = document.createElement('canvas'); this.cv.width = W; this.cv.height = H; }
    const c = this.cv.getContext('2d');
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, W, H);
    /* (۱۶٫۰) ترکیبِ لکه‌ای:
       • پایه: پوششِ ملایم همه‌جا (فصل ۲ ~۰٫۲؛ جاهای خالی تقریباً روشن)
       • قطع برق/آخرین شب: پایه سنگین‌تر + لکه‌های قوی‌تر
       • لکه‌ها: ۴ ابر با آلفا/مقیاس متفاوت → بعضی نقاط تاریکِ کامل */
    const heavy = (state.blackout.on || (state.wave >= FINAL_WAVE && state.mode === 'playing')) ? 1 : 0;
    const base = lv * (0.26 + 0.38 * heavy);
    c.fillStyle = 'rgba(4,8,18,' + base.toFixed(3) + ')';
    c.fillRect(0, 0, W, H);
    const ps = Math.min(1.3, lv / 0.5) * (heavy ? 1.45 : 1);
    /* (۱۸٫۱) پله‌ی کیفیت ۲: فقط ۲ لکه از ۴ لکه — نصف بار کشیدن */
    const field = this._field();
    const nb = (typeof PERF !== 'undefined' && PERF.tier >= 2) ? Math.min(2, field.length) : field.length;
    for (let bi = 0; bi < nb; bi++) {
      const b = field[bi];
      const w = 512 * b.sc, h = 512 * b.sc;
      c.globalAlpha = Math.min(0.52, b.a * ps);
      c.drawImage(this._cloud(), b.x - w / 2, b.y - h / 2, w, h);
    }
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'destination-out';
    const L = this.lightXY();
    this.punch(c, L.x, L.y, Math.max(this.ambientR(), this.flashR() + 26), false);  // نور محیطی
    if (this.flashR() > 0) this.punch(c, L.x, L.y, this.flashR(), true);            // چراغ‌قوه
    /* نورهای موقت: دهانه‌ی اسلحه و شلیک برجک‌ها */
    if (state.muzzleGlow > 0) {
      const m = gunMuzzle(WEAPONS[state.weapon].barrel);
      this.punch(c, m.x, m.y, 84, true);
    }
    for (const t of state.turrets) {
      if (t.flash > 0) this.punch(c, t.x, t.y - 12, 54, true);
    }
    /* نور گرمِ درِ برج در شب تاریک */
    if (state.dayness < 0.5) this.punch(c, TOWER.x, GROUND_Y - 14, 42, false);
    /* سیلوئت نگهبان در «آخرین شب» — تا در تاریکی هم قابل ردیابی باشد */
    const boss = state.zombies.find(z => z.type === 'boss' && !z.dead);
    if (boss) this.punch(c, boss.x, boss.y - 42, 76, true);
    c.globalCompositeOperation = 'source-over';
    ctx.drawImage(this.cv, 0, 0);
  },
};

/* چشم‌های زامبی‌ها روی تاریکی (وقتی هیچ نوری نیست، بازهم دیده می‌شوند) */
/* (۱۸٫۱) هاله‌ی چشم در تاریکی: اسپرایت گرادیانیِ پیش‌پخته — قبلاً shadowBlur
   برای هر چشم ست می‌شد (۳۰ blur در هر فریم = گرون‌ترین عملیات canvas؛
   عامل اصلی هنگِ شب‌های فصل ۲+). اکنون فقط drawImage با globalAlpha */
const EYE_GLOW = {
  red: null, purple: null,
  _mk(col) {
    const R = 8, SS = 2;
    const cv = document.createElement('canvas');
    cv.width = R * 2 * SS; cv.height = R * 2 * SS;
    const g = cv.getContext('2d');
    const gr = g.createRadialGradient(R * SS, R * SS, 0.5 * SS, R * SS, R * SS, R * SS);
    gr.addColorStop(0, 'rgba(' + col + ',0.95)');
    gr.addColorStop(0.35, 'rgba(' + col + ',0.55)');
    gr.addColorStop(1, 'rgba(' + col + ',0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, R * 2 * SS, R * 2 * SS);
    return cv;
  },
  get(kind) {
    if (kind === 'boss') { if (!this.purple) this.purple = this._mk('196,77,223'); return this.purple; }
    if (!this.red) this.red = this._mk('255,75,62');
    return this.red;
  },
};
function drawDarkEyes() {
  if (Dark.level < 0.55 || state.mode !== 'playing') return;
  const a = clamp((Dark.level - 0.55) / 0.45, 0, 1);
  ctx.save();
  ctx.globalAlpha = a;
  for (const z of state.zombies) {
    if (z.dead) continue;
    const s = (z.radius / 15) * (z.depth || 1);
    const spr = EYE_GLOW.get(z.type);
    /* (۲۰٫۴) حالت تصویری: چشم‌ها نزدیک بالای سرِ اسپرایت تقریب زده می‌شوند */
    if (ZIMG.ready[z.type]) {
      const B = ZIMG.BOX[z.type];
      const ex = z.x + z.dir * B.w * 0.2 * s, ey = z.y - B.h * 0.87 * s;
      const w = B.w * 0.3 * s;
      ctx.drawImage(spr, ex - w / 2, ey - w / 2, w, w);
      ctx.drawImage(spr, ex + z.dir * B.w * 0.12 * s - w / 2, ey - w / 2, w, w);
      continue;
    }
    const ex = z.x + z.dir * 4 * s, ey = z.y - 37 * s;
    const w = 16 * s;
    ctx.drawImage(spr, ex - w / 2, ey - w / 2, w, w);
    ctx.drawImage(spr, ex + z.dir * 3.4 * s - w / 2, ey - 0.6 * s - w / 2, w, w);
  }
  ctx.restore();
}

/* ---------------------- ۶-۷) هوک به‌روزرسانی این بخش ---------------------- */
UPDATE_HOOKS.push(function survivalUpdate(dt) {
  Dark.update(dt);
  PED.update(dt);                              /* (۱۴٫۰) دستفروش استوری‌مود */

  /* (۱۴٫۰) گفتگو در روز/وقفه (داستان دستفروش) — بقیه‌ی حالت‌ها خودشان
     DLG.update را صدا می‌زنند (افتتاحیه/انتقال/پیروزی) */
  if (state.mode === 'day' || state.mode === 'intermission') {
    try { DLG.update(dt); } catch (e) {}
  }

  /* نوار باتری هر ~۰٫۴ ثانیه تازه شود (مصرف پیوسته است) */
  survivalUpdate._t = (survivalUpdate._t || 0) + dt;
  if (survivalUpdate._t > 0.4) { survivalUpdate._t = 0; refreshGearHUD(); }

  /* شفای تدریجی کنسرو (۳٫۷۵ جون در ثانیه) */
  if (state.regen > 0 && state.tower.hp < state.tower.maxHp && canPlay()) {
    const heal = Math.min(state.regen, dt * 3.75, state.tower.maxHp - state.tower.hp);
    state.tower.hp += heal;
    state.regen -= heal;
    if (Math.random() < dt * 3) {
      spawnParticles(TOWER.x + rand(-22, 22), TOWER_TOP_Y - rand(8, 42), 1, '#e8a13c',
        { speed: 34, life: 0.7, size: 2, grav: -55 });
    }
    if (state.regen <= 0.01) state.regen = 0;
  }

  /* قطع برق زمان‌بندی‌شده‌ی وسط موج (فصل ۲ به بعد) */
  const B = state.blackout;
  if (state.mode === 'playing') {
    B.waveT += dt;
    if (!B.on) {
      for (const ev of B.schedule) {
        if (!ev.fired && B.waveT >= ev.at) {
          ev.fired = true;
          B.on = true;
          B.until = B.waveT + ev.dur;
          SFX.powerDown();
          try { bark('sbo1', 'p', 'وای... برق رفت! چراغ‌قوه رو روشن کن!', '🔌 برق رفت!',
            state.torch.owned ? 'چراغ‌قوه رو روشن کن — کلید L!' : 'چراغ‌قوه نداری؟! — از تب «بقا» بخر', 2.6); } catch (e) {}
          Dark.level = Math.max(Dark.level, 0.6);   // با ضربه تیره شود
          break;
        }
      }
    } else if (B.waveT >= B.until) {
      B.on = false;
      setAnnounce('💡 برق برگشت', 'دید کامل شد', 1.4);
      SFX.powerUp2();
    }
  }
});

/* ---------------------- ۶-۸) دستفروش مرموز — بازطراحی ۲۰٫۰ ----------------------
   بازخورد کاربر: «شکلش هر سری که میاد عوض شه، جهتش هم عوض شه،
   هر سری یه چیز جدید بیاره و جالب باشه — حتی برجک‌های خاص»:
     • ۵ چهره‌ی متفاوت که با هر بازدید عوض می‌شود (شنل کلاسیک /
       کلاه لبه‌گرد و قترقم‌فروش / هودی ماسک‌دار / بارانی زرد /
       دستفروشِ چرخ‌دسته)
     • جهت آمدن تناوبی: یک‌بار از چپ، یک‌بار از راست
     • قفسه‌ی چرخان: هر بازدید کالای تازه — از بازدید دوم یک
       «نقشه‌ی ساختِ برجک ویژه» (تسلا/موشک/شعله) هم می‌آورد
     • شانس آمدن بیشتر شد (۴۰٪ → ۵۵٪) چون حالا ستونِ اصلی وسایل است
   ۳۰٪ کالای تقلبی هم‌طرح قبل باقی است (ریسکِ خرید از غریبه!) */
const PED_LOOKS = [
  { name: 'شنل‌پوش',    cloak: '#2a1f45', hat: '#3a2c5e', eye: '#e2bcff', eyeGlow: '#c08aff', trim: '#c9a24e', trim2: '#8a6f3a' },
  { name: 'کلاه‌لبه‌گرد', cloak: '#5e3434', hat: '#8f4636', eye: '#9ff0b0', eyeGlow: '#54d07a', trim: '#d8b455', trim2: '#6f5528' },
  { name: 'ماسک‌دار',   cloak: '#2c3844', hat: '#42566a', eye: '#ffc37f', eyeGlow: '#ff9a3d', trim: '#9aa8b8', trim2: '#5d6a7a' },
  { name: 'بارانی‌زرد',  cloak: '#a8821f', hat: '#c9a02f', eye: '#a8d8ff', eyeGlow: '#5aa8e8', trim: '#5a4a10', trim2: '#7a6518' },
  { name: 'چرخ‌دسته',   cloak: '#4a3f2e', hat: '#68573a', eye: '#f0e0a8', eyeGlow: '#c9a24e', trim: '#b08a3a', trim2: '#6f5528' },
];

/* (۲۱٫۲) صدا/لحنِ هر چهره — فرقِ هر بازدید در صدا هم حس شود:
   rate نرخ پخشِ کلیپ (زیر/بم‌شدن+سرعت)، pitch مخصوص صدای سیستم */
const PED_VOICES = [
  { rate: 1.0,  pitch: 1.0,  label: 'همان شنل‌پوشِ مرموز' },
  { rate: 0.86, pitch: 0.7,  label: 'پیرمردِ خنده‌رو' },
  { rate: 0.76, pitch: 0.5,  label: 'صدای پشتِ ماسکِ گاز' },
  { rate: 1.18, pitch: 1.5,  label: 'جوانِ پرحرفِ بارانی‌زرد' },
  { rate: 0.95, pitch: 0.85, label: 'دستفروشِ چرخ‌دسته' },
];

const PED = {
  active: false, phase: 'idle', x: -46, dir: 1, t: 0, walkT: 0,
  look: 0, dirFrom: 1,

  /* آمدن: جهتِ این بازدید از state.peddler.visits حساب شده است
     (بازدید ۱ = چهره‌ی کلاسیک از چپ؛ بعدی تناوبی می‌چرخد) */
  enter() {
    this.active = true;
    this.phase = 'enter';
    const v0 = Math.max(0, (state.peddler.visits | 0) - 1);
    this.look = v0 % PED_LOOKS.length;
    this.dirFrom = (v0 % 2 === 0) ? 1 : -1;
    this.x = this.dirFrom > 0 ? -46 : W + 46;
    this.dir = this.dirFrom;
    this.t = 0; this.walkT = 0;
    state.peddler.here = true;
    /* (۲۱٫۲) صدای این چهره — VOICE هنگام پخشِ خط‌های «d» اعمالش می‌کند */
    try { if (typeof VOICE !== 'undefined') VOICE.pedTweak = PED_VOICES[this.look]; } catch (e) {}
    hidePeddlerPanel();
    SFX.peddler();
  },
  /* رسید پایین برج → گفتگوی استوری (۲۱٫۲: خطِ آغازِ هر چهره فرق دارد) */
  talk() {
    this.phase = 'talk';
    const L = PED_LOOKS[this.look];
    /* (۲۳٫۰) خطوط دستفروش — هماهنگ با voices23 (کلیدهای موجود) */
    const lines = [
      { who: 'd', v: 'pd1a1', text: 'کالای دست اول! ببین بخری.' },
      { who: 'p', v: 'pd1b', text: 'کالای کمیاب؟ تقلبی نیست؟' },
      { who: 'd', v: 'pd1c', text: 'تا غروب اینجام. زود انتخاب کن.' },
    ];
    try {
      DLG.start(lines, () => { if (PED.phase === 'talk') PED.openShop(); });
    } catch (e) { this.openShop(); }
  },
  /* پایان گفتگو → قفسه‌ی کالا */
  openShop() {
    this.phase = 'stay';
    renderPeddlerStock();
  },
  /* شب شد → خداحافظی و رفتن (از همان سمتی که آمد) */
  leave(farewell) {
    if (!this.active) return;
    if (this.phase !== 'leave') {
      this.phase = 'leave';
      this.dir = -this.dirFrom;
      try { DLG.skip(); } catch (e) {}
      hidePeddlerPanel();
      state.peddler.here = false;
      if (farewell !== false) {
        try { VOICE.speak('غروب شد... باید رفت.', 'd', 'pd1l'); } catch (e) {}
      }
    }
  },
  reset() {
    this.active = false; this.phase = 'idle'; this.x = -46; this.t = 0;
  },

  update(dt) {
    if (!this.active) return;
    this.t += dt;
    const TARGET = TOWER.x - 84 * this.dirFrom;    /* پایین برج، سمتِ ورود */
    if (this.phase === 'enter') {
      this.walkT += dt;
      this.x += 118 * this.dirFrom * dt;
      const done = this.dirFrom > 0 ? this.x >= TARGET : this.x <= TARGET;
      if (done) {
        this.x = TARGET;
        /* (۲۵٫۰) اگر گفتگو باز است، مودبانه می‌ایستد و صبر می‌کند —
           وسط حرفِ هیچ‌کس نمی‌پرد */
        if (!(typeof DLG !== 'undefined' && DLG.active)) this.talk();
      }
    } else if (this.phase === 'leave') {
      this.walkT += dt;
      this.x += 150 * this.dir * dt;
      if (this.x < -70 || this.x > W + 70) this.reset();
    }
  },

  render() {
    if (!this.active) return;
    if (state.mode !== 'day' && state.mode !== 'intermission') return;
    drawPeddlerFig(this.x, GROUND_Y + 10, this.phase, this.walkT, this.t, this.look, this.dirFrom);
  },
};

/* رسم دستفروش در صحنه — ۵ چهره (۲۰٫۰):
   look 0: شنل تیره + کلاه نوک‌تیز + چشم بنفش + فانوس (کلاسیک)
   look 1: کلاه لبه‌گرد + شال + قترقم‌های آویزانِ کوله‌پشتی
   look 2: هود + ماسک گاز با عدسی‌های گردِ درخشان
   look 3: بارانی زرد + چراغ‌قوه‌ی دستی به جای فانوس
   look 4: دستفروش چرخ‌دسته — قفسه‌ی کوچکِ پر از کالا را هل می‌دهد */
function drawPeddlerFig(x, y, phase, walkT, t, look, face) {
  const L = PED_LOOKS[look % PED_LOOKS.length];
  const moving = phase === 'enter' || phase === 'leave';
  const bob = moving ? Math.abs(Math.sin(walkT * 6)) * 2.2 : Math.sin(t * 1.8) * 1.1;
  const lean = moving ? 0.07 * (face > 0 ? 1 : -1) : 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(0, 2, look === 4 ? 24 : 15, 4.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.translate(0, -bob);
  ctx.rotate(lean);
  ctx.scale(face > 0 ? 1 : -1, 1);          /* آینه‌ای وقتی از راست می‌آید */

  /* پاها (فقط موقع راه‌رفتن جابه‌جا می‌شوند) */
  ctx.strokeStyle = '#15101f'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  const step = moving ? Math.sin(walkT * 6) * 6 : 0;
  ctx.beginPath();
  ctx.moveTo(-4, -14); ctx.lineTo(-5 + step, -1);
  ctx.moveTo(4, -14); ctx.lineTo(5 - step, -1);
  ctx.stroke();

  if (look === 4) {
    /* --- دستفروش چرخ‌دسته: قفسه‌ی چوبی با چرخ --- */
    ctx.strokeStyle = '#4a3a22'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-22, -8); ctx.lineTo(-34, -30);
    ctx.moveTo(22, -8); ctx.lineTo(34, -30);
    ctx.stroke();
    ctx.fillStyle = '#5a4426';
    rr(-36, -44, 72, 16, 4); ctx.fill();
    ctx.strokeStyle = '#3a2c18'; ctx.lineWidth = 2; rr(-36, -44, 72, 16, 4); ctx.stroke();
    /* کالاهای روی قفسه */
    const goods = ['#7a4a28', '#5a6a3a', '#8fd6ff', '#ffd873', '#ff8a5a'];
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = goods[i];
      rr(-32 + i * 13, -50, 10, 8, 2); ctx.fill();
    }
    /* چرخ */
    ctx.fillStyle = '#2c2012'; circle(-26, -2, 5.5); circle(26, -2, 5.5);
    ctx.fillStyle = '#8a6f3a'; circle(-26, -2, 1.8); circle(26, -2, 1.8);
    /* بدنِ خمیده روی چرخ — (۲۱٫۲) با گرادیان و حاشیه */
    const cg4 = ctx.createLinearGradient(-14, -48, 14, -12);
    cg4.addColorStop(0, L.trim2); cg4.addColorStop(0.45, L.cloak); cg4.addColorStop(1, '#14100a');
    ctx.fillStyle = cg4;
    ctx.beginPath();
    ctx.moveTo(-14, -46);
    ctx.quadraticCurveTo(-18, -26, -14, -12);
    ctx.lineTo(14, -12);
    ctx.quadraticCurveTo(18, -26, 14, -46);
    ctx.quadraticCurveTo(0, -52, -14, -46);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(8,12,20,0.55)'; ctx.lineWidth = 1.1; ctx.stroke();
    ctx.strokeStyle = L.trim; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(-11.5, -45.5); ctx.quadraticCurveTo(0, -49, 11.5, -45.5); ctx.stroke();
    /* کلاه لبه‌کوتاه + سر */
    ctx.fillStyle = '#f0c49a'; circle(2, -50, 7.4);
    ctx.fillStyle = L.hat;
    ctx.beginPath(); ctx.arc(2, -51, 7.8, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillRect(-7, -52, 17, 4);
    /* دست‌ها روی دسته‌ی چرخ */
    ctx.strokeStyle = '#f0c49a'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(8, -40); ctx.lineTo(24, -30); ctx.stroke();
    /* چشم‌های درخشان */
    ctx.save();
    ctx.shadowColor = L.eyeGlow; ctx.shadowBlur = 8;
    ctx.fillStyle = L.eye;
    circle2(ctx, -0.6, -50, 1.6); circle2(ctx, 4.6, -50, 1.6);
    ctx.restore();
    /* فانوس سبز کوچک آویزان از قفسه */
    ctx.save();
    ctx.shadowColor = '#7be389'; ctx.shadowBlur = 10;
    ctx.fillStyle = '#c9a24e'; ctx.fillRect(-33, -38, 6, 8);
    ctx.fillStyle = 'rgba(150,255,170,0.95)'; ctx.fillRect(-31.6, -36.4, 3.2, 5);
    ctx.restore();
  } else {
    /* --- بدن‌های چهار چهره‌ی پیاده (۲۱٫۲: لباس‌های حاشیه‌دوزی‌شده و رنگ‌تراش) --- */
    const sway = Math.sin((moving ? walkT : t) * 2.2) * 3;
    const cg = ctx.createLinearGradient(-14, -50, 14, -12);
    cg.addColorStop(0, L.trim2); cg.addColorStop(0.45, L.cloak); cg.addColorStop(1, '#0d0a14');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.moveTo(-13, -46);
    ctx.quadraticCurveTo(-17 + sway, -26, -14, -12);
    ctx.lineTo(14, -12);
    ctx.quadraticCurveTo(17 + sway, -26, 13, -46);
    ctx.quadraticCurveTo(0, -52, -13, -46);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(8,12,20,0.55)'; ctx.lineWidth = 1.1;
    ctx.stroke();
    /* حاشیه‌ی طلاییِ یقه + دوختِ لبه‌ی دامن (۲۱٫۲ — لباس فاخرتر) */
    ctx.strokeStyle = L.trim; ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-10.5, -45.5); ctx.quadraticCurveTo(0, -49.5, 10.5, -45.5);
    ctx.stroke();
    ctx.lineWidth = 0.9; ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.moveTo(-13.6, -18); ctx.lineTo(13.6, -18);
    ctx.moveTo(-13.8, -13.5); ctx.lineTo(13.8, -13.5);
    ctx.stroke();
    ctx.globalAlpha = 1;
    /* سگکِ روشنِ وسطِ بدن */
    ctx.fillStyle = L.trim;
    ctx.beginPath(); ctx.moveTo(0, -43); ctx.lineTo(3.4, -40.5); ctx.lineTo(0, -38); ctx.lineTo(-3.4, -40.5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.fillRect(-12.6, -44, 3.4, 24);                 /* بازتاب نورِ کنار */

    if (look === 1) {
      /* کلاه لبه‌گرد قرمز + شال گردن سبز + کوله‌پشتی پر از قترقم */
      ctx.fillStyle = '#3e5a3a'; rr(-19, -40, 9, 22, 4); ctx.fill();   /* کوله */
      ctx.strokeStyle = '#8a97a8'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(-14, -38); ctx.lineTo(-6, -42); ctx.stroke();
      /* قترقم‌های آویزان */
      ctx.strokeStyle = '#c9a24e'; ctx.lineWidth = 1.4;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo(-17, -34 + i * 7); ctx.lineTo(-21, -28 + i * 7); ctx.stroke();
        ctx.fillStyle = ['#ffd873', '#8fd6ff', '#ff8a5a'][i];
        circle(-21, -27 + i * 7, 2);
      }
      /* شال */
      ctx.fillStyle = '#3e5a3a';
      ctx.beginPath();
      ctx.moveTo(-8, -46); ctx.quadraticCurveTo(0, -40, 8, -46);
      ctx.quadraticCurveTo(6, -36, 0, -35); ctx.quadraticCurveTo(-6, -36, -8, -46);
      ctx.closePath(); ctx.fill();
      /* کلاه لبه‌گرد */
      ctx.fillStyle = L.hat;
      ctx.beginPath(); ctx.ellipse(2, -48, 14, 3.6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(2, -50, 7, Math.PI, Math.PI * 2); ctx.fill();
      /* صورت + چشم‌های سبز */
      ctx.fillStyle = '#0d0918';
      ctx.beginPath(); ctx.ellipse(2, -48, 8.5, 6.4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.save();
      ctx.shadowColor = L.eyeGlow; ctx.shadowBlur = 8;
      ctx.fillStyle = L.eye;
      circle2(ctx, -1.4, -48, 1.7); circle2(ctx, 5.4, -48, 1.7);
      ctx.restore();
    } else if (look === 2) {
      /* هود + ماسک گاز: دو عدسی گردِ نارنجی + فیلترِ زیر */
      ctx.fillStyle = L.hat;
      ctx.beginPath();
      ctx.moveTo(-11, -44); ctx.quadraticCurveTo(-13, -62, 2, -64);
      ctx.quadraticCurveTo(15, -62, 13, -44);
      ctx.quadraticCurveTo(2, -50, -11, -44);
      ctx.closePath(); ctx.fill();
      /* عدسی‌های ماسک */
      ctx.save();
      ctx.shadowColor = L.eyeGlow; ctx.shadowBlur = 9;
      ctx.fillStyle = '#1a1410';
      circle2(ctx, -3.6, -50, 4.4); circle2(ctx, 5.6, -50, 4.4);
      ctx.fillStyle = L.eye;
      circle2(ctx, -3.6, -50, 2.8); circle2(ctx, 5.6, -50, 2.8);
      ctx.restore();
      /* فیلتر گردن */
      ctx.fillStyle = '#39424e';
      circle(1, -42, 3.8);
      ctx.fillStyle = '#5d6a7a'; circle(1, -42, 1.8);
    } else if (look === 3) {
      /* بارانی زرد با یقه + چراغ‌قوه به‌جای فانوس */
      ctx.fillStyle = L.hat;
      ctx.beginPath();
      ctx.moveTo(-12, -44); ctx.quadraticCurveTo(-14, -60, 2, -62);
      ctx.quadraticCurveTo(14, -60, 12, -44);
      ctx.quadraticCurveTo(0, -50, -12, -44);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath(); ctx.ellipse(2, -47, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.save();
      ctx.shadowColor = L.eyeGlow; ctx.shadowBlur = 8;
      ctx.fillStyle = L.eye;
      circle2(ctx, -1.4, -47, 1.6); circle2(ctx, 5.4, -47, 1.6);
      ctx.restore();
      /* چراغ‌قوه‌ی دستی با مخروط نور */
      ctx.strokeStyle = '#f0c49a'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(9, -38); ctx.lineTo(17, -30); ctx.stroke();
      ctx.fillStyle = '#3a4250'; ctx.save();
      ctx.translate(18, -29); ctx.rotate(0.6);
      rr(-3, -3, 10, 6, 2); ctx.fill();
      const beam = ctx.createLinearGradient(5, 0, 30, 0);
      beam.addColorStop(0, 'rgba(255,238,170,0.5)'); beam.addColorStop(1, 'rgba(255,238,170,0)');
      ctx.fillStyle = beam;
      ctx.beginPath(); ctx.moveTo(5, -4); ctx.lineTo(30, -10); ctx.lineTo(30, 10); ctx.lineTo(5, 4);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    } else {
      /* look 0: کلاسیک — کلاه نوک‌تیز + چشم بنفش + فانوس */
      ctx.fillStyle = L.hat;
      ctx.beginPath();
      ctx.moveTo(-11, -46); ctx.quadraticCurveTo(-2, -62, 3, -60);
      ctx.quadraticCurveTo(12, -58, 11, -46);
      ctx.quadraticCurveTo(0, -50, -11, -46);
      ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-2, -61); ctx.lineTo(2, -72); ctx.lineTo(6, -59);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#0d0918';
      ctx.beginPath(); ctx.ellipse(0, -50, 8.5, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.save();
      ctx.shadowColor = L.eyeGlow; ctx.shadowBlur = 8;
      ctx.fillStyle = L.eye;
      circle2(ctx, -3.4, -50, 1.7); circle2(ctx, 3.4, -50, 1.7);
      ctx.restore();
    }

    /* فانوس نوسانی (فقط چهره‌های ۰ و ۱) */
    if (look === 0 || look === 1) {
      const lx = 16, ly = -34 + Math.sin((moving ? walkT : t) * 2.6) * 3;
      ctx.strokeStyle = '#4a3a24'; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(10, -40); ctx.lineTo(lx, ly - 6); ctx.stroke();
      ctx.save();
      ctx.shadowColor = '#ffd873'; ctx.shadowBlur = 14;
      ctx.fillStyle = '#c9a24e';
      ctx.fillRect(lx - 4, ly - 6, 8, 11);
      ctx.fillStyle = 'rgba(255,232,150,0.95)';
      ctx.fillRect(lx - 2.4, ly - 4, 4.8, 7);
      ctx.restore();
      /* هاله‌ی نورِ فانوس روی زمین */
      const g2 = ctx.createRadialGradient(lx, ly, 3, lx, ly + 8, 34);
      g2.addColorStop(0, 'rgba(255,216,115,0.30)');
      g2.addColorStop(1, 'rgba(255,216,115,0)');
      ctx.fillStyle = g2;
      ctx.beginPath(); ctx.arc(lx, ly + 8, 34, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

/* هر روز (فقط در حالت day) صدا زده می‌شود: بعد از ۱ روزِ خالی، شانس ۵۵٪ */
function peddlerRoll(force) {
  if (force) {                                   // برای تست/API
    state.peddler.here = true;
    state.peddler.cd = 1;
    state.peddler.visits = (state.peddler.visits | 0) + 1;
    state.peddler.stock = pickRareStock();
    PED.enter();
    return;
  }
  state.peddler.here = false;
  PED.reset();
  if (state.peddler.cd > 0) { state.peddler.cd--; hidePeddlerPanel(); return; }
  if (Math.random() < 0.55) {
    state.peddler.cd = 1;                        // (۲۰٫۰) روز بعد دوباره شانس
    state.peddler.stock = pickRareStock();
    state.peddler.visits = (state.peddler.visits | 0) + 1;
    PED.enter();                                 // استوری: می‌آید، حرف می‌زند، می‌فروشد
  } else {
    hidePeddlerPanel();
  }
}

/* انتخاب کالای این بازدید (۲۰٫۰):
   • ۱-۲ کالای کمیاب (دائمی‌ها فقط اگر هنوز فعال نشده‌اند؛ مصرفی‌ها همیشه)
   • از بازدید دوم، با شانس ۷۰٪، یک «نقشه‌ی ساختِ برجک ویژه» که هنوز
     باز نشده — تا وقتی هر سه باز شود، بعدش کالای معمولی می‌آورد */
function pickRareStock() {
  const visits = state.peddler.visits | 0;
  const stock = [];
  /* جایزه‌ی نقشه‌ی ساخت */
  if (visits >= 1) {
    const closed = Object.keys(BLUEPRINTS).filter(k => !(state.bps && state.bps[k]));
    if (closed.length && Math.random() < 0.7) {
      closed.sort(() => Math.random() - 0.5);
      stock.push({ id: closed[0], bp: true, bought: false });
    }
  }
  /* کالاهای معمولی دستفروش */
  const permLeft = ['vest', 'goldAmmo', 'helmet'].filter(k => !state.buffs[k]);
  const consum = ['airstrike', 'freezeBomb', 'adrenaline'];
  const pool = permLeft.concat(consum);
  pool.sort(() => Math.random() - 0.5);
  const n = 1 + (Math.random() < 0.65 ? 1 : 0) - (stock.length ? 1 : 0);
  for (let i = 0; i < Math.max(1, n) && i < pool.length; i++) {
    stock.push({ id: pool[i], bought: false });
  }
  return stock;
}

function hidePeddlerPanel() { $('peddlerBox').classList.add('hidden'); }

/* پرتره‌ی دستفروش — (۲۱٫۲) پنج چهره‌ی کاملاً متفاوت: هر بازدید یک
   شخصیت دیگر (کلاه/هود/ماسک/بارانی/کاسکت) + لباس حاشیه‌دارِ فاخر.
   درخواست کاربر: «آیکونی که موقع حرف زدن ازش انداخته هر سری یکی
   باید متفاوت باشه و لباس‌های فروشنده جذاب‌تر باشه» */
function drawPeddlerFace() {
  const cv = $('pdFace');
  if (!cv) return;
  const c = cv.getContext('2d');
  c.clearRect(0, 0, 92, 92);
  const look = (PED && PED.active) ? PED.look : 0;
  const L = PED_LOOKS[look % PED_LOOKS.length];
  const BGS = ['#2a1f45', '#40222a', '#22303c', '#54400f', '#3a3222'];
  /* پس‌زمینه‌ی هم‌رنگِ شخصیت + هاله */
  const g = c.createRadialGradient(46, 36, 5, 46, 54, 64);
  g.addColorStop(0, BGS[look % 5]); g.addColorStop(1, '#08060e');
  c.fillStyle = g; c.fillRect(0, 0, 92, 92);
  c.strokeStyle = 'rgba(201,162,78,0.35)'; c.lineWidth = 2;
  c.strokeRect(3, 3, 86, 86);                       /* قابِ طلاییِ کم‌رنگ */

  /* شنل با گرادیان + یقه‌ی حاشیه‌دار (۲۱٫۲ — لباس فاخرتر) */
  const cg = c.createLinearGradient(0, 40, 0, 92);
  cg.addColorStop(0, L.trim2); cg.addColorStop(0.5, L.cloak); cg.addColorStop(1, '#0d0a14');
  c.fillStyle = cg;
  c.beginPath();
  c.moveTo(16, 90); c.quadraticCurveTo(20, 40, 46, 30);
  c.quadraticCurveTo(72, 40, 76, 90); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(8,12,20,0.6)'; c.lineWidth = 1.4; c.stroke();
  c.strokeStyle = L.trim; c.lineWidth = 2;
  c.beginPath(); c.moveTo(24, 62); c.quadraticCurveTo(46, 54, 68, 62); c.stroke();
  /* سگکِ الماسی */
  c.fillStyle = L.trim;
  c.beginPath(); c.moveTo(46, 58); c.lineTo(51, 63); c.lineTo(46, 68); c.lineTo(41, 63); c.closePath(); c.fill();

  if (look === 0) {
    /* ===== ۰) شنل‌پوش کلاسیک: هودِ سایه‌دار + چشم بنفش ===== */
    c.fillStyle = L.hat;
    c.beginPath();
    c.moveTo(24, 52); c.quadraticCurveTo(46, 8, 68, 52);
    c.quadraticCurveTo(46, 62, 24, 52); c.closePath(); c.fill();
    c.fillStyle = 'rgba(8,6,14,0.55)';
    c.beginPath(); c.ellipse(46, 47, 20, 13, 0, 0, Math.PI * 2); c.fill();
    c.save();
    c.shadowColor = L.eyeGlow; c.shadowBlur = 9;
    c.fillStyle = L.eye;
    circle2(c, 39, 46, 3.2); circle2(c, 53, 46, 3.2);
    c.restore();
    /* فانوسِ گوشه */
    c.strokeStyle = '#7a5a20'; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(72, 54); c.lineTo(72, 58); c.stroke();
    c.fillStyle = '#c9a24e'; c.fillRect(66, 58, 12, 16);
    c.save(); c.shadowColor = '#ffd873'; c.shadowBlur = 10;
    c.fillStyle = 'rgba(255,216,115,0.92)'; c.fillRect(68.6, 60, 6.8, 12); c.restore();
    c.strokeStyle = '#4a3a18'; c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(72, 54); c.lineTo(72, 50); c.stroke();
  } else if (look === 1) {
    /* ===== ۱) کلاه‌لبه‌گرد: کلاه سنبادی + شال سبز + قترقم‌ها ===== */
    c.fillStyle = '#3e5a3a';                     /* شال گردن */
    c.beginPath();
    c.moveTo(30, 54); c.quadraticCurveTo(46, 48, 62, 54);
    c.quadraticCurveTo(46, 68, 30, 54); c.closePath(); c.fill();
    c.fillStyle = 'rgba(8,6,14,0.5)';
    c.beginPath(); c.ellipse(46, 48, 17, 11, 0, 0, Math.PI * 2); c.fill();
    c.save();
    c.shadowColor = L.eyeGlow; c.shadowBlur = 8;
    c.fillStyle = L.eye;
    circle2(c, 39, 47, 3); circle2(c, 53, 47, 3);
    c.restore();
    c.fillStyle = L.hat;                        /* کلاه سنبادی با لبه‌ی پهن */
    c.beginPath(); c.ellipse(46, 40, 26, 5.5, 0, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.moveTo(34, 40); c.quadraticCurveTo(46, 12, 58, 40); c.closePath(); c.fill();
    c.strokeStyle = L.trim; c.lineWidth = 1.6;
    c.beginPath(); c.ellipse(46, 40, 26, 5.5, 0, 0, Math.PI * 2); c.stroke();
    c.fillStyle = L.trim; c.fillRect(33, 36, 26, 2.4);   /* نوارِ کلاه */
    /* قترقم‌های آویزان از کلاه */
    c.strokeStyle = '#c9a24e'; c.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      const cx = 28 + i * 18;
      c.beginPath(); c.moveTo(cx, 43); c.lineTo(cx - 2, 50); c.stroke();
      c.fillStyle = ['#ffd873', '#8fd6ff', '#ff8a5a'][i];
      circle2(c, cx - 2, 52, 2.4);
    }
  } else if (look === 2) {
    /* ===== ۲) ماسک‌دار: هود + ماسک گاز با عدسی‌های درخشان ===== */
    c.fillStyle = L.hat;
    c.beginPath();
    c.moveTo(22, 56); c.quadraticCurveTo(46, 10, 70, 56);
    c.quadraticCurveTo(46, 66, 22, 56); c.closePath(); c.fill();
    c.fillStyle = '#39424e';                    /* بدنه‌ی ماسک */
    c.beginPath(); c.ellipse(46, 47, 21, 15, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#5d6a7a'; c.lineWidth = 2; c.stroke();
    c.save();
    c.shadowColor = L.eyeGlow; c.shadowBlur = 11;
    c.fillStyle = '#1a1410';
    circle2(c, 38.6, 45, 6.4); circle2(c, 53.4, 45, 6.4);
    c.fillStyle = L.eye;
    circle2(c, 38.6, 45, 3.6); circle2(c, 53.4, 45, 3.6);
    c.restore();
    c.strokeStyle = '#8a97a8'; c.lineWidth = 1.4;
    circle2b(c, 38.6, 45, 6.4); circle2b(c, 53.4, 45, 6.4);
    /* فیلترِ پایینِ ماسک + شلنگ */
    c.fillStyle = '#4a5664';
    circle2(c, 46, 59, 5.6);
    c.fillStyle = '#5d6a7a'; circle2(c, 46, 59, 2.6);
    c.strokeStyle = '#39424e'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(51, 56); c.quadraticCurveTo(62, 60, 64, 70); c.stroke();
  } else if (look === 3) {
    /* ===== ۳) بارانی‌زرد: هودِ زرد + قطره‌های باران + چراغ‌قوه ===== */
    c.fillStyle = L.hat;
    c.beginPath();
    c.moveTo(24, 54); c.quadraticCurveTo(46, 10, 68, 54);
    c.quadraticCurveTo(46, 64, 24, 54); c.closePath(); c.fill();
    c.strokeStyle = L.trim; c.lineWidth = 1.6; c.stroke();
    c.fillStyle = 'rgba(8,6,14,0.5)';
    c.beginPath(); c.ellipse(46, 47, 18, 12, 0, 0, Math.PI * 2); c.fill();
    c.save();
    c.shadowColor = L.eyeGlow; c.shadowBlur = 8;
    c.fillStyle = L.eye;
    circle2(c, 39, 46, 3); circle2(c, 53, 46, 3);
    c.restore();
    /* قطره‌های باران روی شانه */
    c.fillStyle = 'rgba(168,216,255,0.55)';
    c.beginPath(); c.ellipse(30, 72, 2, 3.2, 0.4, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(63, 66, 1.7, 2.8, -0.4, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(56, 78, 1.9, 3.1, 0.2, 0, Math.PI * 2); c.fill();
    /* چراغ‌قوه با مخروط نور */
    const beam = c.createLinearGradient(74, 60, 74, 84);
    beam.addColorStop(0, 'rgba(255,238,170,0.5)'); beam.addColorStop(1, 'rgba(255,238,170,0)');
    c.fillStyle = beam;
    c.beginPath(); c.moveTo(70, 58); c.lineTo(78, 58); c.lineTo(84, 84); c.lineTo(64, 84);
    c.closePath(); c.fill();
    c.fillStyle = '#3a4250'; c.fillRect(66, 56, 16, 7);
    c.save(); c.shadowColor = '#ffe9a0'; c.shadowBlur = 8;
    c.fillStyle = '#fff3c9'; c.fillRect(80, 57, 3, 5); c.restore();
  } else {
    /* ===== ۴) چرخ‌دسته: کاسکت + پیشانی‌نوار + قفسه‌ی کالا ===== */
    c.fillStyle = 'rgba(8,6,14,0.5)';
    c.beginPath(); c.ellipse(46, 48, 18, 12, 0, 0, Math.PI * 2); c.fill();
    c.save();
    c.shadowColor = L.eyeGlow; c.shadowBlur = 8;
    c.fillStyle = L.eye;
    circle2(c, 39, 47, 3); circle2(c, 53, 47, 3);
    c.restore();
    /* ریش کوتاه + لبخند خصول */
    c.fillStyle = 'rgba(30,24,18,0.8)';
    c.beginPath(); c.ellipse(46, 58, 11, 6, 0, 0, Math.PI); c.fill();
    c.fillStyle = '#e8d8a0';                     /* دندان‌های طلایی! */
    c.fillRect(41, 58, 3, 2.4); c.fillRect(45, 58, 3, 2.4); c.fillRect(49, 58, 3, 2.4);
    /* کاسکت با سنبله */
    c.fillStyle = L.hat;
    c.beginPath(); c.ellipse(46, 42, 22, 5, 0, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.moveTo(32, 42); c.quadraticCurveTo(46, 18, 60, 42); c.closePath(); c.fill();
    c.strokeStyle = L.trim; c.lineWidth = 1.6;
    c.beginPath(); c.ellipse(46, 42, 22, 5, 0, 0, Math.PI * 2); c.stroke();
    /* قفسه‌ی کوچکِ کالا در گوشه */
    c.fillStyle = '#4a3a22'; c.fillRect(62, 60, 22, 20);
    c.strokeStyle = '#2c2012'; c.lineWidth = 1.6; c.strokeRect(62, 60, 22, 20);
    const goods = ['#8fd6ff', '#ffd873', '#ff8a5a'];
    for (let i = 0; i < 3; i++) {
      c.fillStyle = goods[i];
      c.fillRect(65 + i * 6.4, 63, 5, 5);
      c.fillRect(65 + i * 6.4, 71, 5, 5);
    }
  }
}
function circle2b(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.stroke(); }

function initPeddlerUI() {
  drawPeddlerFace();
  /* (۲۶٫۰) دکمه‌ی بستن دیالوگ خرید + کلیک روی بک‌دراپ = بستن */
  const closer = () => { try { SFX.click(); } catch (e) {} hidePeddlerPanel(); };
  const xc = $('pdClose');
  if (xc) xc.addEventListener('click', (e) => { e.stopPropagation(); closer(); });
  const box = $('peddlerBox');
  if (box) box.addEventListener('click', (e) => { if (e.target === box) closer(); });
}

/* رندر قفسه‌ی دستفروش (هر بار تازه — با برچسب «تازه!» برای کالای نو) */
function renderPeddlerStock() {
  const box = $('pdStock');
  if (!box) return;
  box.innerHTML = '';
  if (!state.peddler.here) { hidePeddlerPanel(); return; }
  for (const it of state.peddler.stock) {
    if (it.bought) continue;                     // خریداری‌شده‌ها حذف می‌شوند
    const r = it.bp ? BLUEPRINTS[it.id] : RARE[it.id];
    if (!r) continue;
    const el = document.createElement('div');
    el.className = 'pd-item' + (state.coins < r.price ? ' poor' : '') + (it.bp ? ' pd-bp' : '');
    const cv = document.createElement('canvas');
    cv.width = 80; cv.height = 80;
    paintGearIcon(it.id, cv);
    const info = document.createElement('div');
    info.className = 'pd-info';
    /* (۲۶٫۰) آیکن SVG به‌جای ایموجی 📐/💰 — یک‌شکل روی همه‌ی اندرویدها */
    info.innerHTML = '<span class="pd-name">' + (it.bp && typeof ICO !== 'undefined' ? '<i class="ic">' + ICO.ico('blueprint') + '</i> ' : '') + r.name +
      (it.fresh ? ' <em class="pd-new">تازه!</em>' : '') +
      '</span><span class="pd-sub">' + r.desc + '</span>';
    const price = document.createElement('span');
    price.className = 'pd-price';
    price.innerHTML = '<i class="coin-ic"></i>' + faNum(r.price);
    info.appendChild(price);
    el.appendChild(cv); el.appendChild(info);
    el.addEventListener('click', () => buyRare(it));
    box.appendChild(el);
  }
  /* اگر همه خریداری شد، پنل بسته شود */
  if (!box.children.length) { hidePeddlerPanel(); return; }
  drawPeddlerFace();
  $('peddlerBox').classList.remove('hidden');
}

/* خرید از دستفروش: ۳۰٪ تقلبی (سکه می‌سوزد) — ۷۰٪ واقعی و قدرتمند
   (۲۰٫۰) نقشه‌ی ساخت: مستقیم باز می‌شود و به کوله نمی‌رود */
function buyRare(it) {
  if (it.bought || !state.peddler.here || !canPlay()) return;
  const r = it.bp ? BLUEPRINTS[it.id] : RARE[it.id];
  if (!r) return;
  if (state.coins < r.price) { SFX.deny(); return; }
  state.coins -= r.price;
  it.bought = true;
  if (Math.random() < 0.3 && !it.bp) {
    /* کلک خوردی! کالای تقلبی — افکت + پیام */
    SFX.scam();
    const p = $('peddlerPanel');
    p.classList.remove('scammed'); void p.offsetWidth; p.classList.add('scammed');
    setAnnounce('🎭 بهت کلک زد!', 'کالا تقلبی بود — ' + faNum(r.price) + ' سکه‌ات پرت شد!', 3);
    spawnParticles(150, 180, 18, '#9f8fd0', { speed: 170, life: 0.75, size: 2.6, grav: 280 });
    renderPeddlerStock(); updateHUD(); saveGame();
    return;
  }
  if (it.bp) {
    /* نقشه‌ی ساختِ برجک ویژه — باز شدن دائم */
    state.bps[it.id] = true;
    SFX.buy();
    setAnnounce('📐 ' + r.name + ' باز شد!', 'حالا از تب «برجک‌ها» نصبش کن — ' + TURRETS[it.id].name, 3);
    spawnParticles(TOWER.x, TOWER_TOP_Y - 20, 22, r.color,
      { speed: 180, life: 0.7, size: 2.8, grav: 260, up: true });
    try { setBPTab('tur', true); } catch (e) {}
    renderPeddlerStock(); updateHUD(); saveGame(); refreshBuildPanel();
    return;
  }
  if (!giveItem(it.id)) {
    state.coins += r.price;                      // کوله پر بود → پول برگشت
    it.bought = false;
    return;
  }
  SFX.buy();
  setAnnounce('💎 ' + r.name + ' گرفتی!', 'از کوله‌پشتی مصرفش کن — ' + r.desc, 2.6);
  renderPeddlerStock(); updateHUD(); saveGame();
}

