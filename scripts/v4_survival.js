/* ==================================================================
   سه طبقه تا بقا — نسخه‌ی ۱۰٫۰ — بخش ۶: کوله‌پشتی، وسایل بقی،
   چراغ‌قوه و تاریکی، قطع برق تصادفی و دستفروش مرموز (دزد شبانه)
   ==================================================================
   - فروشگاه بخش تازه «وسایل بقی» دارد: چراغ‌قوه، باتری، کنسرو (شفای
     تدریجی) و کیت کمک‌های اولیه (شفای فوری) — همه داخل کوله‌پشتی
     ۶ جایی می‌روند و با کلیک یا کلیدهای Q..U مصرف می‌شوند
   - چراغ‌قوه باتری محدود دارد (کلید L)؛ در مهِ انبارها و لحظه‌های
     قطع برق وسط موج، دید به دایره‌ی نور دور بازیکن محدود می‌شود
   - دستفروش مرموز: هر چند روز یک‌بار با شانس ۴۰٪ کنار فروشگاه می‌آید
     و ۱-۲ آیتم کمیاب می‌فروشد؛ ۳۰٪ مواقع کالا تقلبی درمی‌آید!
   ================================================================== */

/* ---------------------- ۶-۱) وسایل بقی و آیتم‌های کمیاب ---------------------- */
const GEAR = {
  flashlight: { name: 'چراغ‌قوه',            price: 80, icon: 'flashlight', color: '#f5d76e',
    desc: 'با کلید L روشن/خاموش می‌شود — دید در مه و قطع برق (باتری دارد)' },
  battery:    { name: 'باتری',               price: 30, icon: 'battery',    color: '#7be389',
    desc: '+۵۰٪ شارژ چراغ‌قوه — ذخیره در کوله، مصرف با کلیک' },
  canned:     { name: 'کنسرو',               price: 25, icon: 'canned',     color: '#e8a13c',
    desc: 'شفای تدریجی ۴۵ جون در ۱۲ ثانیه' },
  medkit:     { name: 'کیت کمک‌های اولیه',   price: 45, icon: 'medkit',     color: '#ff8a8a',
    desc: '۷۰ جون برج را فوراً برمی‌گرداند' },
};

/* آیتم‌های کمیاب دستفروش (فعال‌سازی دائمی بعد از مصرف) */
const RARE = {
  vest:     { name: 'جلیقه‌ی ضدّ دندان', price: 260, icon: 'vest',     color: '#8fd6ff',
    desc: 'آسیب به برج ۲۵٪ کمتر می‌شود — دائمی' },
  goldAmmo: { name: 'فشنگ‌های طلایی',   price: 320, icon: 'goldAmmo', color: '#ffd873',
    desc: 'دمیج همه‌ی گلوله‌ها ۲۵٪ بیشتر — دائمی' },
  helmet:   { name: 'کلاهخود فولادی',   price: 200, icon: 'helmet',   color: '#b8c4d4',
    desc: '+۴۰ به حداکثر جون برج (و همین‌جا ترمیم) — دائمی' },
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

/* ترمیم جون برج (کیت/قدرت‌ها) */
function healTower(n) {
  const heal = Math.min(n, state.tower.maxHp - state.tower.hp);
  if (heal <= 0) {
    setAnnounce('❤️ برج سرِ سلامتی است', 'فعلاً لازم نیست', 1.4);
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

/* به‌روزرسانی جاخالی‌ها (آیکون + حالت) — (۱۲٫۰) کوله‌ی خالی = فقط یک قرص کوچک */
function refreshBackpack() {
  const any = state.backpack.some(s => s);
  const bar = $('backpackBar');
  if (bar) bar.classList.toggle('compact', !any);
  const cap = $('bpkCap');
  if (cap) cap.textContent = any ? '🎒 کوله' : '🎒 کوله خالی — خرید از تب «بقا»';
  for (let i = 0; i < 6; i++) {
    const el = $('bpk-' + i);
    if (!el) continue;
    const s = state.backpack[i];
    const cv = el.querySelector('canvas');
    el.classList.toggle('empty', !s);
    const usable = !!s && (GEAR[s.id] || (RARE[s.id] && !state.buffs[s.id]));
    el.classList.toggle('ready', usable);
    paintGearIcon(s ? s.id : null, cv);
  }
}

/* تولتیپ مخصوص کوله (سمت راست جاخالی باز می‌شود) */
function bpkStatus(id) {
  if (id === 'battery') return 'کلیک/کلید = شارژ ۵۰٪ چراغ‌قوه';
  if (id === 'canned') return 'کلیک/کلید = شفای تدریجی ۴۵ جون';
  if (id === 'medkit') return 'کلیک/کلید = شفای فوری ۷۰ جون';
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
  const wrapR = $('wrap').getBoundingClientRect();
  const r = el.getBoundingClientRect();
  tip.style.left = Math.min(W - tip.offsetWidth - 6, r.right - wrapR.left + 8) + 'px';
  tip.style.top = clamp(r.top - wrapR.top + r.height / 2 - tip.offsetHeight / 2, 6, H - tip.offsetHeight - 6) + 'px';
}

/* ---------------------- ۶-۴) آیکون‌های Canvas وسایل ---------------------- */
/* هم‌سبک کاشی‌های فروشگاهِ تصویر مرجع: قاب تیره‌ی گرد + گرادیان +
   هاله‌ی رنگی + نماد برجسته + ذرات ستاره‌ای (بدون فایل خارجی) */
const GEAR_ICON_COLORS = {
  flashlight: '#f5d76e', battery: '#7be389', canned: '#e8a13c', medkit: '#ff8a8a',
  vest: '#8fd6ff', goldAmmo: '#ffd873', helmet: '#b8c4d4',
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
  cv.width = 80; cv.height = 80;
  const c = cv.getContext('2d');
  c.clearRect(0, 0, 80, 80);
  if (!kind) return;
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
  }
  c.restore();
  /* ذرات ستاره‌ای مثل کاشی‌های فروشگاه مرجع */
  c.fillStyle = 'rgba(255,255,255,0.85)';
  icoStar(c, 20, 19, 3.2); icoStar(c, 61, 57, 2.6); icoStar(c, 59, 22, 1.9);
  c.restore();
  /* لبه‌ی قاب */
  c.strokeStyle = 'rgba(120,170,230,.3)'; c.lineWidth = 2;
  icoRR(c, 5, 5, 70, 70, 10); c.stroke();
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
  const btn = $('btnFlash');
  if (!btn) return;
  btn.classList.toggle('nolight', !state.torch.owned || !state.torch.on);
  btn.classList.toggle('dead', state.torch.owned && state.torch.battery <= 0);
  $('battFill').style.width = clamp(state.torch.battery, 0, 100) + '%';
}

/* ---------------------- ۶-۶) تاریکی و دایره‌ی نور ---------------------- */
/* لایه‌ی تاریکی: مهِ فصل ۲، قطع برق تصادفی و «آخرین شب».
   نورها: محیطِ مهتابی + چراغ‌قوه‌ی بازیکن + دهانه‌ی اسلحه + برجک‌ها */
const Dark = {
  level: 0, target: 0,

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
    const a = clamp(this.level, 0, 1) * 0.94;
    /* بوم جدا برای لایه‌ی تاریکی: سوراخ‌ها (نورها) این‌جا زده می‌شوند و بعد
       کل لایه روی صحنه می‌نشیند — destination-out مستقیم روی بوم اصلی، خودِ
       صحنه را هم پاک می‌کرد (باگ ۱۰٫۰) */
    if (!this.cv) { this.cv = document.createElement('canvas'); this.cv.width = W; this.cv.height = H; }
    const c = this.cv.getContext('2d');
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, W, H);
    c.fillStyle = 'rgba(3,6,15,' + a.toFixed(3) + ')';
    c.fillRect(0, 0, W, H);
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
function drawDarkEyes() {
  if (Dark.level < 0.55 || state.mode !== 'playing') return;
  const a = clamp((Dark.level - 0.55) / 0.45, 0, 1);
  ctx.save();
  ctx.globalAlpha = a;
  for (const z of state.zombies) {
    if (z.dead) continue;
    const s = (z.radius / 15) * (z.depth || 1);
    const ex = z.x + z.dir * 4 * s, ey = z.y - 37 * s;
    ctx.shadowColor = z.type === 'boss' ? '#c44dff' : '#ff4b3e';
    ctx.shadowBlur = 7 * s;
    ctx.fillStyle = z.type === 'boss' ? '#c44dff' : '#ff4b3e';
    circle(ex, ey, 1.8 * s);
    circle(ex + z.dir * 3.4 * s, ey - 0.6 * s, 1.8 * s);
  }
  ctx.restore();
}

/* ---------------------- ۶-۷) هوک به‌روزرسانی این بخش ---------------------- */
UPDATE_HOOKS.push(function survivalUpdate(dt) {
  Dark.update(dt);

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
          try { bark('p', 'وای... برق رفت! چراغ‌قوه رو روشن کن!', '🔌 برق رفت!',
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

/* ---------------------- ۶-۸) دستفروش مرموز (دزد شبانه) ---------------------- */
/* هر روز (فقط در حالت day) صدا زده می‌شود: بعد از ۲ روزِ خالی، شانس ۴۰٪ */
function peddlerRoll(force) {
  if (force) {                                   // برای تست/API
    state.peddler.here = true;
    state.peddler.cd = 2;
    state.peddler.stock = pickRareStock();
    renderPeddlerStock();
    return;
  }
  state.peddler.here = false;
  if (state.peddler.cd > 0) { state.peddler.cd--; hidePeddlerPanel(); return; }
  if (Math.random() < 0.4) {
    state.peddler.here = true;
    state.peddler.cd = 2;                        // دو روز بعد دوباره شانس
    state.peddler.stock = pickRareStock();
    setAnnounce('🕳 دستفروش مرموز رسید...', 'کالای کمیاب دارد — ولی ۳۰٪ شانس تقلبی بودن!', 2.8);
    SFX.peddler();
    try { bark('d', 'کالای کمیاب دارم... فقط، برای تو.', '🕳 دستفروش مرموز رسید...', 'کالای کمیاب — ۳۰٪ شانس تقلبی بودن!', 4); } catch (e) {}
    renderPeddlerStock();
  } else {
    hidePeddlerPanel();
  }
}

/* انتخاب ۱-۲ آیتم کمیاب تصادفی */
function pickRareStock() {
  const keys = Object.keys(RARE).sort(() => Math.random() - 0.5);
  const n = Math.random() < 0.5 ? 1 : 2;
  return keys.slice(0, n).map(k => ({ id: k, bought: false }));
}

function hidePeddlerPanel() { $('peddlerPanel').classList.add('hidden'); }

/* پرتره‌ی دستفروش: شنل تیره + چشم‌های بنفش + فانوس */
function drawPeddlerFace() {
  const cv = $('pdFace');
  if (!cv) return;
  const c = cv.getContext('2d');
  c.clearRect(0, 0, 92, 92);
  const g = c.createRadialGradient(46, 34, 6, 46, 52, 62);
  g.addColorStop(0, '#241a3e'); g.addColorStop(1, '#0a0714');
  c.fillStyle = g; c.fillRect(0, 0, 92, 92);
  /* شنل */
  c.fillStyle = '#1c1430';
  c.beginPath();
  c.moveTo(18, 90); c.quadraticCurveTo(22, 42, 46, 32);
  c.quadraticCurveTo(70, 42, 74, 90); c.closePath(); c.fill();
  /* کلاه */
  c.fillStyle = '#2a1f48';
  c.beginPath();
  c.moveTo(27, 48); c.quadraticCurveTo(46, 12, 65, 48);
  c.quadraticCurveTo(46, 57, 27, 48); c.closePath(); c.fill();
  /* چشم‌های بنفش درخشان */
  c.save();
  c.shadowColor = '#c08aff'; c.shadowBlur = 7;
  c.fillStyle = '#d8b0ff';
  circle2(c, 39, 45, 3); circle2(c, 53, 45, 3);
  c.restore();
  /* فانوس */
  c.strokeStyle = '#7a5a20'; c.lineWidth = 1.6;
  c.strokeRect(64, 58, 10, 14);
  c.fillStyle = '#c9a24e'; c.fillRect(64, 58, 10, 14);
  c.save();
  c.shadowColor = '#ffd873'; c.shadowBlur = 9;
  c.fillStyle = 'rgba(255,216,115,0.92)';
  c.fillRect(66, 60, 6, 10);
  c.restore();
  c.strokeStyle = '#4a3a18'; c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(69, 58); c.lineTo(69, 50); c.stroke();
}

function initPeddlerUI() {
  drawPeddlerFace();
}

/* رندر قفسه‌ی دستفروش (هر بار تازه) */
function renderPeddlerStock() {
  const box = $('pdStock');
  if (!box) return;
  box.innerHTML = '';
  if (!state.peddler.here) { hidePeddlerPanel(); return; }
  for (const it of state.peddler.stock) {
    if (it.bought) continue;                     // خریداری‌شده‌ها حذف می‌شوند
    const r = RARE[it.id];
    const el = document.createElement('div');
    el.className = 'pd-item' + (state.coins < r.price ? ' poor' : '');
    const cv = document.createElement('canvas');
    cv.width = 80; cv.height = 80;
    paintGearIcon(it.id, cv);
    const info = document.createElement('div');
    info.innerHTML = '<span class="pd-name">' + r.name + '</span><span class="pd-sub">' + r.desc + '</span>';
    const price = document.createElement('span');
    price.className = 'pd-price';
    price.textContent = faNum(r.price);
    el.appendChild(cv); el.appendChild(info); el.appendChild(price);
    el.addEventListener('click', () => buyRare(it));
    box.appendChild(el);
  }
  /* اگر هر دو خریداری شد، پنل بسته شود */
  if (!box.children.length) { hidePeddlerPanel(); return; }
  $('peddlerPanel').classList.remove('hidden');
}

/* خرید از دستفروش: ۳۰٪ تقلبی (سکه می‌سوزد) — ۷۰٪ واقعی و قدرتمند */
function buyRare(it) {
  if (it.bought || !state.peddler.here || !canPlay()) return;
  const r = RARE[it.id];
  if (state.coins < r.price) { SFX.deny(); return; }
  state.coins -= r.price;
  it.bought = true;
  if (Math.random() < 0.3) {
    /* کلک خوردی! کالای تقلبی — افکت + پیام */
    SFX.scam();
    const p = $('peddlerPanel');
    p.classList.remove('scammed'); void p.offsetWidth; p.classList.add('scammed');
    setAnnounce('🎭 بهت کلک زد!', 'کالا تقلبی بود — ' + faNum(r.price) + ' سکه‌ات پرت شد!', 3);
    spawnParticles(150, 180, 18, '#9f8fd0', { speed: 170, life: 0.75, size: 2.6, grav: 280 });
    renderPeddlerStock(); updateHUD(); saveGame();
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
