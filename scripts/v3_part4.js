/* ==================================================================
   سه طبقه تا بقا — نسخه‌ی ۵٫۰ — منطق بازی (بخش ۳)
     ۱۵) رابط کاربری (HUD / نوار سلاح / نوار باس / پنل آیکونی + تولتیپ)
     ۱۶) حلقه اصلی و راه‌اندازی + رابط دیباگ/تست
   تازه‌های ۵٫۰ در این بخش:
     - پنل ساخت‌وساز آیکونی: هر آیتم یک کاشی تصویری (Canvas-drawn icon)
       + قیمت + پین‌های سطح؛ توضیح فقط در تولتیپِ hover
     - حلقه‌ی اصلی حالت day را هم به‌روز می‌کند (روزِ بین موج‌ها)
     - دکمه‌ی «شب شود» (btnNight) به startNight وصل شد
   ================================================================== */

/* ---------------------- ۱۵) رابط کاربری ---------------------- */
function showScreen(id) { $(id).classList.remove('hidden'); }
function hideScreen(id) { $(id).classList.add('hidden'); }
function hideOverlays() {
  ['startScreen', 'howtoScreen', 'pauseScreen', 'gameoverScreen', 'victoryScreen']
    .forEach(hideScreen);
}

function pauseGame() {
  if (!canPlay()) return;
  state.prevMode = state.mode; state.mode = 'paused';
  showScreen('pauseScreen');
  $('btnPause').textContent = '▶ ادامه';
}
function resumeGame() {
  if (state.mode !== 'paused') return;
  state.mode = state.prevMode || 'playing';
  hideScreen('pauseScreen');
  $('btnPause').textContent = '⏸ توقف';
}

/* قطع/وصل صدا — همه‌ی دکمه‌های صدا هم‌زمان به‌روز می‌شوند */
function toggleSound() {
  Snd.init();
  const m = Snd.toggleMute();
  $('btnMute').textContent = m ? '🔇' : '🔊';
  $('btnMute0').textContent = m ? '🔇' : '🔊';
  $('btnMute2').textContent = m ? '🔇 صدا خاموش' : '🔊 صدا روشن';
  if (!m) SFX.click();
}

/* ---------- پنل ساخت‌وساز آیکونی (۵٫۰) ----------
   تعریف آیتم‌های پنل در سه گروه: ارتقاها (۴-۷)، سلاح‌ها (۸-۹)
   و برجک‌های دفاعی (۰، G، F و T) — ترتیب = ترتیب نمایش.
   متن توضیح فقط در تولتیپِ hover دیده می‌شود؛ روی کاشی فقط آیکون + قیمت. */
const BUILD_DEFS = [
  { grp: 'ارتقاها' },
  { kind: 'weapon',  key: '۴', codes: ['Digit4', 'Numpad4'], name: 'ارتقای اسلحه',  desc: 'قدرت گلوله‌ی همه‌ی سلاح‌ها بالا می‌رود' },
  { kind: 'health',  key: '۵', codes: ['Digit5', 'Numpad5'], name: 'جون برج',      desc: '+۳۰ به حداکثر جون برج (و همین‌جا ترمیم می‌شود)' },
  { kind: 'repair',  key: '۶', codes: ['Digit6', 'Numpad6'], name: 'تعمیر برج',    desc: '۵۰٪ جون برج را همان‌جا برمی‌گرداند' },
  { kind: 'trap',    key: '۷', codes: ['Digit7', 'Numpad7'], name: 'تله پایه',     desc: 'خارهای برقی — آسیب خودکار به زامبی‌های نزدیک برج' },
  { grp: 'سلاح‌ها' },
  { kind: 'shotgun', key: '۸', codes: ['Digit8', 'Numpad8'], name: 'شاتگان',       desc: '۶ ساچمه با پراکندگی کشنده — بعد از خرید کلید ۲' },
  { kind: 'mg',      key: '۹', codes: ['Digit9', 'Numpad9'], name: 'مسلسل',        desc: 'نگه‌دار و ببار؛ نرخ شلیک خیلی بالا — بعد از خرید کلید ۳' },
  { grp: 'برجک‌های خودکار' },
  { kind: 'gatling', key: '۰', codes: ['Digit0', 'Numpad0'], name: 'برجک مسلسل',   desc: 'رگبار پیوسته • دمیج ۳ • برد ۲۳۰' },
  { kind: 'sniper',  key: 'G', codes: ['KeyG'],              name: 'تک‌تیرانداز',   desc: 'تک‌ضرب کُشنده با شانس کریت • برد ۴۰۰' },
  { kind: 'frost',   key: 'F', codes: ['KeyF'],               name: 'برجک یخ‌زن',    desc: 'کند و یخ‌زده می‌کند • برد ۱۷۵' },
  { kind: 'turretUp',key: 'T', codes: ['KeyT'],              name: 'ارتقای برجک‌ها', desc: '+۳۰٪ دمیج و +۱۲٪ سرعت شلیک همه‌ی برجک‌ها در هر سطح' },
];
/* نگاشت کلیدهای فیزیکی به آیتم خرید (برای خرید سریع با کیبورد) */
const KEY2KIND = {};
BUILD_DEFS.forEach(d => { if (d.codes) d.codes.forEach(c => KEY2KIND[c] = d.kind); });

/* ---------- آیکون‌های پنل ساخت‌وساز (۵٫۰) ----------
   هر آیکون یک تصویر ۳۴×۳۴ است که همین‌جا با Canvas رسم می‌شود؛
   به‌جای متن‌های طولانی، هر خرید با یک نگاه قابل تشخیص است. */
function rrFill(c, x, y, w, h, r) {
  c.beginPath();
  if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h);
  c.fill();
}
const ICON_PAINTERS = {
  /* ارتقای اسلحه: نشان هدف + دو گلوله */
  weapon(c) {
    c.strokeStyle = '#ffd873'; c.lineWidth = 2.4;
    c.beginPath(); c.arc(16, 15, 10, 0, 7); c.stroke();
    c.beginPath(); c.arc(16, 15, 5.2, 0, 7); c.stroke();
    c.fillStyle = '#ffd873'; c.beginPath(); c.arc(16, 15, 2, 0, 7); c.fill();
    c.beginPath();
    c.moveTo(16, 1.5); c.lineTo(16, 5.6); c.moveTo(16, 24.4); c.lineTo(16, 28.5);
    c.moveTo(2.5, 15); c.lineTo(6.6, 15); c.moveTo(25.4, 15); c.lineTo(29.5, 15);
    c.stroke();
    c.fillStyle = '#c9a35a';
    rrFill(c, 24, 24.5, 2.8, 6.4, 1.3); rrFill(c, 28.2, 26, 2.4, 5, 1.1);
  },
  /* جون برج: قلب سرخ با برق سفید */
  health(c) {
    c.fillStyle = '#e04b3a'; c.strokeStyle = '#7a1f18'; c.lineWidth = 1.8;
    c.beginPath();
    c.moveTo(17, 27.5);
    c.bezierCurveTo(3.5, 18, 7.5, 5.5, 17, 12);
    c.bezierCurveTo(26.5, 5.5, 30.5, 18, 17, 27.5);
    c.closePath(); c.fill(); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.4)';
    c.beginPath(); c.arc(12, 13.5, 2.4, 0, 7); c.fill();
  },
  /* تعمیر: آچار */
  repair(c) {
    c.save(); c.translate(17, 17); c.rotate(Math.PI / 4);
    c.strokeStyle = '#39466b'; c.lineWidth = 1.4;
    c.fillStyle = '#aebbd2';
    rrFill(c, -2.4, -6, 4.8, 17, 2.4); c.stroke();
    c.lineWidth = 4.6; c.strokeStyle = '#aebbd2';
    c.beginPath(); c.arc(0, -8.5, 5.4, 0.5, Math.PI - 0.5); c.stroke();
    c.lineWidth = 1.4; c.strokeStyle = '#39466b';
    c.beginPath(); c.arc(0, -8.5, 7.8, 0.55, Math.PI - 0.55); c.stroke();
    c.beginPath(); c.arc(0, -8.5, 3, 0.55, Math.PI - 0.55); c.stroke();
    c.restore();
  },
  /* تله: خارهای فلزی روی پایه + جرقه */
  trap(c) {
    c.fillStyle = '#c9a35a'; c.strokeStyle = '#6b4a2c'; c.lineWidth = 1.2;
    for (const x of [7, 13, 19, 25]) {
      c.beginPath();
      c.moveTo(x - 3.4, 25); c.lineTo(x + 3.4, 25); c.lineTo(x, 13.5);
      c.closePath(); c.fill(); c.stroke();
    }
    c.fillStyle = '#3c4250'; rrFill(c, 3, 25, 28, 5, 2);
    c.fillStyle = '#565e70'; c.fillRect(3, 25, 28, 1.6);
    c.fillStyle = '#ffd873';
    c.beginPath(); c.arc(13, 10.5, 1.6, 0, 7); c.fill();
    c.beginPath(); c.arc(19, 10.5, 1.6, 0, 7); c.fill();
  },
  /* شاتگان: قنداق + لوله‌ی دوقلو */
  shotgun(c) {
    c.fillStyle = '#6b4a2c'; rrFill(c, 2, 14.5, 9, 7.5, 2);
    c.fillStyle = '#2b2f38'; rrFill(c, 10, 13.5, 7, 9, 1.5);
    c.fillStyle = '#454b57';
    rrFill(c, 16.5, 14.8, 15, 3, 1.2); rrFill(c, 16.5, 19.4, 15, 3, 1.2);
    c.fillStyle = '#20262b'; c.fillRect(29.5, 14.8, 2, 3); c.fillRect(29.5, 19.4, 2, 3);
    c.fillStyle = '#8a6f3a'; rrFill(c, 19, 23.5, 7, 3.4, 1.4);
  },
  /* مسلسل: بدنه + خشاب گرد + سه تیر */
  mg(c) {
    c.fillStyle = '#6b4a2c'; rrFill(c, 1.5, 14.5, 5, 6, 1.5);
    c.fillStyle = '#2b2f38'; rrFill(c, 6, 12.5, 17, 7.5, 2);
    c.fillStyle = '#454b57'; rrFill(c, 23, 14.6, 9.5, 3.2, 1.2);
    c.fillStyle = '#31363f'; c.beginPath(); c.arc(14, 24, 4.2, 0, 7); c.fill();
    c.fillStyle = '#20262b'; c.beginPath(); c.arc(14, 24, 2, 0, 7); c.fill();
    c.fillStyle = '#ffd873';
    rrFill(c, 9, 3.5, 2.6, 6, 1.2); rrFill(c, 14, 2.5, 2.6, 6.5, 1.2); rrFill(c, 19, 3.5, 2.6, 6, 1.2);
  },
  /* برجک مسلسل: کیسه‌شن + سر چرخان سه‌لوله */
  gatling(c) {
    c.fillStyle = '#6e6146'; rrFill(c, 1.5, 24, 11, 6, 2.5); rrFill(c, 22, 24, 11, 6, 2.5);
    c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1;
    c.strokeRect(1.5, 24, 11, 6); c.strokeRect(22, 24, 11, 6);
    c.fillStyle = '#3a4150'; rrFill(c, 11, 16, 12, 9, 2.5);
    c.fillStyle = '#8a6f3a'; rrFill(c, 23, 18, 6, 5, 1.5);
    c.strokeStyle = '#c9a35a'; c.lineWidth = 1.4; c.setLineDash([2, 2]);
    c.beginPath(); c.moveTo(23, 20); c.quadraticCurveTo(19, 18, 16, 17); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#2b2f38'; c.beginPath(); c.arc(17, 13.5, 5, 0, 7); c.fill();
    c.strokeStyle = '#5d6575'; c.lineWidth = 2.6;
    c.beginPath();
    c.moveTo(20, 11.5); c.lineTo(31.5, 11.5);
    c.moveTo(20, 13.5); c.lineTo(32.5, 13.5);
    c.moveTo(20, 15.5); c.lineTo(31.5, 15.5);
    c.stroke();
  },
  /* تک‌تیرانداز: سه‌پایه + لوله‌ی بلند + دوربین */
  sniper(c) {
    c.strokeStyle = '#4a3b28'; c.lineWidth = 2.6; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(14, 19); c.lineTo(7, 29); c.moveTo(20, 19); c.lineTo(27, 29); c.moveTo(17, 20); c.lineTo(17, 29);
    c.stroke();
    c.fillStyle = '#334632'; rrFill(c, 5, 14.5, 19, 5.5, 2);
    c.fillStyle = '#20262b'; rrFill(c, 24, 16, 8, 2.8, 1);
    c.fillStyle = '#454b57'; rrFill(c, 29.5, 15.4, 3.5, 4, 1);
    c.fillStyle = '#141a20'; rrFill(c, 10, 9, 8, 4.5, 2);
    c.fillStyle = 'rgba(140,220,255,.9)'; c.beginPath(); c.arc(14, 11.2, 1.5, 0, 7); c.fill();
    c.strokeStyle = '#ffd873'; c.lineWidth = 1.2;
    c.beginPath(); c.arc(17, 25.5, 3.2, 0, 7); c.stroke();
  },
  /* برجک یخ‌زن: دانه‌ی برف */
  frost(c) {
    c.strokeStyle = '#a8e2ff'; c.lineWidth = 2.3; c.lineCap = 'round';
    c.beginPath();
    for (let k = 0; k < 3; k++) {
      const a = k * Math.PI / 3;
      c.moveTo(17 - Math.cos(a) * 12, 17 - Math.sin(a) * 12);
      c.lineTo(17 + Math.cos(a) * 12, 17 + Math.sin(a) * 12);
    }
    c.stroke();
    c.lineWidth = 1.7;
    c.beginPath();
    for (let k = 0; k < 6; k++) {
      const a = k * Math.PI / 3;
      const bx = 17 + Math.cos(a) * 8, by = 17 + Math.sin(a) * 8;
      c.moveTo(bx, by); c.lineTo(bx + Math.cos(a + 0.6) * 3.4, by + Math.sin(a + 0.6) * 3.4);
      c.moveTo(bx, by); c.lineTo(bx + Math.cos(a - 0.6) * 3.4, by + Math.sin(a - 0.6) * 3.4);
    }
    c.stroke();
    c.fillStyle = '#e8f7ff'; c.beginPath(); c.arc(17, 17, 2.6, 0, 7); c.fill();
  },
  /* ارتقای برجک‌ها: دو شورون بالا + سه نقطه‌ی سطح */
  turretUp(c) {
    c.fillStyle = '#ffd873'; c.strokeStyle = '#8a5a12'; c.lineWidth = 1.4;
    for (const y0 of [3, 12]) {
      c.beginPath();
      c.moveTo(17, y0); c.lineTo(27, y0 + 9); c.lineTo(7, y0 + 9);
      c.closePath(); c.fill(); c.stroke();
    }
    c.fillStyle = '#8fd6ff';
    for (let i = -1; i <= 1; i++) { c.beginPath(); c.arc(17 + i * 6, 26.5, 2, 0, 7); c.fill(); }
  },
};

/* رسم آیکون آیتم روی بوم کوچک (مقیاس ۲ برابر برای شفافیت) */
function paintIcon(kind, cv) {
  const c = cv.getContext('2d');
  const s = cv.width / 34;
  c.save();
  c.scale(s, s);
  c.lineJoin = 'round'; c.lineCap = 'round';
  const fn = ICON_PAINTERS[kind];
  if (fn) fn(c);
  c.restore();
}

/* وضعیت لحظه‌ای آیتم برای تولتیپ (قیمت/سطح/مالکیت...) */
function tileStatus(kind) {
  if (kind === 'shotgun' || kind === 'mg') {
    return WEAPONS[kind].owned ? 'خریده شد ✅' : 'قفل — بعد از خرید، کلید ' + faNum(kind === 'shotgun' ? 2 : 3);
  }
  if (kind === 'repair') {
    return state.tower.hp >= state.tower.maxHp - 0.5
      ? 'برج سرِ سلامتی است'
      : 'جون برج: ' + faNum(Math.ceil(state.tower.hp)) + '/' + faNum(state.tower.maxHp);
  }
  if (kind === 'gatling' || kind === 'sniper' || kind === 'frost') {
    const cnt = state.turrets.filter(t => t.type === kind).length;
    return (cnt ? faNum(cnt) + ' عدد فعال • ' : '') + 'قیمت: ' + faNum(TURRETS[kind].price) + ' سکه';
  }
  const u = UPGRADES[kind], lvl = state.upgrades[kind];
  if (lvl >= u.max) return 'حداکثر ✅';
  return 'سطح ' + faNum(lvl) + '/' + faNum(u.max) + ' • قیمت بعدی: ' + faNum(priceOf(kind)) + ' سکه';
}

/* تولتیپ کاشی‌ها: نمایش کنار پنل (جای متن‌های حذف‌شده) */
function showTip(d, el) {
  const tip = $('bpTip');
  tip.innerHTML = '<b>' + d.name + '</b><span>' + d.desc + '</span>' +
    '<span class="t-status">' + tileStatus(d.kind) + '</span>';
  tip.style.display = 'block';
  positionTip(el);
}
function positionTip(el) {
  const tip = $('bpTip');
  const wrapR = $('wrap').getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const left = r.left - wrapR.left - tip.offsetWidth - 10;
  const top = clamp(r.top - wrapR.top + r.height / 2 - tip.offsetHeight / 2, 6, H - tip.offsetHeight - 6);
  tip.style.left = Math.max(4, left) + 'px';
  tip.style.top = top + 'px';
}
function hideTip() { $('bpTip').style.display = 'none'; }

/* ساخت یک‌بارِ کاشی‌های پنل در شروع صفحه (۵٫۰: آیکونی) */
function buildPanelInit() {
  const list = $('bpList');
  BUILD_DEFS.forEach((d) => {
    if (d.grp) {                              // عنوان گروه
      const g = document.createElement('div');
      g.className = 'bp-grp';
      g.textContent = d.grp;
      list.appendChild(g);
      return;
    }
    const el = document.createElement('div');
    el.className = 'bp-tile';
    el.id = 'bp-' + d.kind;
    /* آیکون Canvas */
    const cv = document.createElement('canvas');
    cv.className = 'bp-ic';
    cv.width = 68; cv.height = 68;            // ۲ برابر برای شفافیت رتینا
    paintIcon(d.kind, cv);
    el.appendChild(cv);
    /* کلید میان‌بر */
    if (d.key) {
      const k = document.createElement('span');
      k.className = 'bp-key'; k.textContent = d.key;
      el.appendChild(k);
    }
    /* پین‌های سطح برای آیتم‌های ارتقایی */
    const u = UPGRADES[d.kind];
    if (u && u.max) {
      const lv = document.createElement('span');
      lv.className = 'bp-lv'; lv.id = 'bp-' + d.kind + '-lv';
      for (let i = 0; i < u.max; i++) lv.appendChild(document.createElement('i'));
      el.appendChild(lv);
    }
    /* قیمت */
    const price = document.createElement('span');
    price.className = 'bp-price'; price.id = 'bp-' + d.kind + '-cost';
    el.appendChild(price);

    el.addEventListener('click', () => attemptBuy(d.kind));
    el.addEventListener('mouseenter', () => showTip(d, el));
    el.addEventListener('mouseleave', hideTip);
    list.appendChild(el);
  });
  /* کلیک روی سربرگ = جمع/باز کردن پنل */
  $('bpHead').addEventListener('click', toggleBuildPanel);
}

function toggleBuildPanel() {
  const p = $('buildPanel');
  p.classList.toggle('collapsed');
  $('bpChev').textContent = p.classList.contains('collapsed') ? '▸' : '▾';
  SFX.click();
}

/* به‌روزرسانی وضعیت کاشی‌های پنل (قیمت/سطح/قابلیت خرید — ۵٫۰ آیکونی) */
function refreshBuildPanel() {
  for (const d of BUILD_DEFS) {
    if (!d.kind) continue;
    const item = $('bp-' + d.kind);
    if (!item) continue;
    const cost = $('bp-' + d.kind + '-cost');
    item.classList.remove('deny');

    /* --- سلاح‌های یک‌بار خرید --- */
    if (d.kind === 'shotgun' || d.kind === 'mg') {
      const owned = WEAPONS[d.kind].owned;
      item.classList.toggle('max', owned);
      cost.textContent = owned ? '✅' : faNum(UPGRADES[d.kind].price);
      item.classList.toggle('poor', !owned && state.coins < UPGRADES[d.kind].price);
      continue;
    }

    /* --- تعمیر سریع --- */
    if (d.kind === 'repair') {
      const full = state.tower.hp >= state.tower.maxHp - 0.5;
      item.classList.toggle('max', full);
      cost.textContent = full ? '✅' : faNum(UPGRADES.repair.price);
      item.classList.toggle('poor', !full && state.coins < UPGRADES.repair.price);
      continue;
    }

    /* --- برجک‌های دفاعی: خرید → حالت نصب (۴٫۰) --- */
    if (d.kind === 'gatling' || d.kind === 'sniper' || d.kind === 'frost') {
      const def = TURRETS[d.kind];
      const maxed = state.turrets.length >= MAX_TURRETS;
      const isPlacing = state.placing && state.placing.type === d.kind;
      item.classList.toggle('placing', !!isPlacing);
      item.classList.toggle('max', maxed && !isPlacing);
      cost.textContent = maxed && !isPlacing ? '✅' : faNum(def.price);
      item.classList.toggle('poor', !maxed && !isPlacing && state.coins < def.price);
      continue;
    }

    /* --- ارتقاهای سطح‌دار (اسلحه/جون/تله/برجک‌ها) --- */
    const u = UPGRADES[d.kind], lvl = state.upgrades[d.kind];
    const maxed = lvl >= u.max;
    item.classList.toggle('max', maxed);
    cost.textContent = maxed ? '✅' : faNum(priceOf(d.kind));
    item.classList.toggle('poor', !maxed && state.coins < priceOf(d.kind));
    /* پین‌های سطح روشن/خاموش */
    const lv = $('bp-' + d.kind + '-lv');
    if (lv) Array.from(lv.children).forEach((pip, i) => pip.classList.toggle('on', i < lvl));
  }
}

/* به‌روزرسانی HUD (نوار جون، سکه، موج + باقی‌مانده‌ی موج) + نوار سلاح + پنل ساخت */
function updateHUD() {
  const t = state.tower, ratio = t.hp / t.maxHp;
  const fill = $('healthFill');
  fill.style.width = (ratio * 100).toFixed(1) + '%';
  fill.className = ratio > 0.5 ? '' : (ratio > 0.25 ? 'mid' : 'low');
  $('healthText').textContent = faNum(Math.ceil(t.hp)) + '/' + faNum(t.maxHp);
  $('coinText').textContent = faNum(state.coins);
  if (state.mode === 'playing') {
    const rem = state.spawn.queue.length + state.zombies.filter(z => !z.dead).length;
    $('waveText').textContent = 'موج ' + faNum(clamp(state.wave, 1, TOTAL_WAVES)) + '/' + faNum(TOTAL_WAVES) + ' • ' + faNum(rem) + ' باقی';
  } else if (state.mode === 'day') {
    $('waveText').textContent = '☀️ روز • موج ' + faNum(clamp(state.wave, 1, TOTAL_WAVES)) + '/' + faNum(TOTAL_WAVES);
  } else {
    $('waveText').textContent = 'موج ' + faNum(clamp(state.wave, 1, TOTAL_WAVES)) + '/' + faNum(TOTAL_WAVES);
  }
  refreshWeaponBar();
  refreshBuildPanel();
}

/* نوار سلاح: هایلایتِ سلاح فعال + قفل/قیمتِ سلاح‌های نخریده */
function refreshWeaponBar() {
  document.querySelectorAll('#weaponBar .wslot').forEach(el => {
    const id = el.dataset.w;
    el.classList.toggle('active', state.weapon === id && WEAPONS[id].owned);
    const locked = !WEAPONS[id].owned;
    el.classList.toggle('locked', locked);
    const info = el.querySelector('.wlockinfo');
    if (info) info.style.display = locked ? 'flex' : 'none';
  });
}

/* نوار جون پادشاه زامبی‌ها (فقط وقتی زنده است نمایش داده می‌شود) */
let bossBarVisible = false;
function updateBossBar() {
  const boss = state.zombies.find(z => z.type === 'boss' && !z.dead);
  const el = $('bossBar');
  if (boss) {
    el.style.display = 'block';
    $('bossFill').style.width = (clamp(boss.hp / boss.maxHp, 0, 1) * 100).toFixed(1) + '%';
    bossBarVisible = true;
  } else if (bossBarVisible) {
    el.style.display = 'none';
    bossBarVisible = false;
  }
}

/* ---------------------- ۱۶) حلقه اصلی و راه‌اندازی ---------------------- */
let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05); // سقف dt برای جلوگیری از پرش فیزیک
  last = now;
  animTime += dt;                                // زمان نمایشی همیشه جلو می‌رود

  /* اسلوموشن سینمایی (۳٫۰): زمان بازی کند می‌شود ولی رندر عادی می‌ماند */
  let dtG = dt;
  if (state.slowmo > 0) {
    dtG = dt * 0.3;
    state.slowmo = Math.max(0, state.slowmo - dt);
  }

  if (state.mode === 'playing' || state.mode === 'intermission' || state.mode === 'day') update(dtG);
  else if (state.mode === 'gameover' || state.mode === 'victory') updateFx(dtG);
  else if (state.mode === 'start') updateMenuScene(dtG);
  /* حالت paused: هیچ آپدیتی نمی‌شود (انجماد کامل) */

  /* جلوه‌های محیطی (شهاب و رعدوبرق) در همه‌ی حالت‌ها جریان دارند */
  updateShootingStar(dt);
  updateLightning(dt);
  render();
  requestAnimationFrame(frame);
}

function init() {
  /* اتصال دکمه‌های منو و اورلی‌ها */
  $('btnStart').addEventListener('click', startGame);
  $('btnHowto').addEventListener('click', () => { SFX.click(); showScreen('howtoScreen'); });
  $('closeHowto').addEventListener('click', () => { SFX.click(); hideScreen('howtoScreen'); });
  $('btnMute0').addEventListener('click', toggleSound);
  $('btnMute').addEventListener('click', toggleSound);
  $('btnMute2').addEventListener('click', toggleSound);
  $('btnNight').addEventListener('click', startNight);   // شروع شب (۵٫۰)
  $('btnPause').addEventListener('click', () => {
    if (state.mode === 'paused') resumeGame(); else pauseGame();
  });
  $('btnResume').addEventListener('click', resumeGame);
  $('btnRestart0').addEventListener('click', startGame);
  $('btnRestart1').addEventListener('click', startGame);
  $('btnRestart2').addEventListener('click', startGame);

  /* کلیک روی اسلات‌های نوار سلاح */
  document.querySelectorAll('#weaponBar .wslot').forEach(el => {
    el.addEventListener('click', () => selectWeapon(el.dataset.w));
  });

  buildPanelInit();    // پنل ساخت‌وساز آیکونیِ کنار نقشه
  initMenuZ();         // زامبی‌های تزئینیِ صحنه‌ی منو
  $('wrap').classList.add('menu-mode');   // در منو، HUD/پنل‌ها مخفی‌اند (۵٫۰)
  updateHUD();
  requestAnimationFrame(frame);
}
init();

/* رابط اشکال‌زدایی/تست خودکار — برای توسعه‌های بعدی در دسترس است */
window.GAME = {
  state, startGame, startWave, spawnZombie, damageTower, selectWeapon, WEAPONS, ZTYPES, WAVES,
  TURRETS, MAX_TURRETS,
  endWave: waveComplete,             /* شبیه‌سازی پایان موج → صبح (۵٫۰) */
  startNight,                        /* شبیه‌سازی کلیک «شب شود» (۵٫۰) */
  giveCoins(n) { state.coins += n; updateHUD(); },
  spawnType(type) { spawnZombie(type); },
  hurt(n) { damageTower(n, TOWER.x + 10); },
  hurtBoss(n) {
    const b = state.zombies.find(z => z.type === 'boss' && !z.dead);
    if (b) { b.hp -= n; if (b.hp <= 0) killZombie(b); }
  },
  /* خرید و نصبِ مستقیم برجک بدون کلیک (برای تست) */
  placeTurret(type, x, y) {
    state.turrets.push({ type, x, y, cd: 0.3,
      aim: x < TOWER.x ? 0 : Math.PI, spin: 0, flash: 0, recoil: 0, hover: false, bob: rand(0, 6.28) });
    refreshBuildPanel();
  },
  /* شبیه‌سازی کلیک در حالت نصب (برای تست) */
  clickPlace(x, y) { state.mouse.x = x; state.mouse.y = y; handlePlaceClick(); },
  attemptBuy,
  /* انداختن دستی جعبه‌ی قدرت (برای تست) */
  dropPower(type) { spawnPowerupObj(type || pickPowerType(), TOWER.x - 130, GROUND_Y - 60); },
  /* پرش سریع به موج n (برای تست) */
  skipToWave(n) {
    n = clamp(n, 1, TOTAL_WAVES);
    state.zombies = []; state.bullets = []; state.coinsArr = [];
    state.wave = n - 1;
    state.spawn = { queue: [], timer: 0, interval: 1, bossDelay: false };
    if (state.mode === 'playing') waveComplete();
    else if (!['start', 'gameover', 'victory', 'paused'].includes(state.mode)) {
      state.mode = 'intermission'; state.intermission = 0.3;
    }
  },
  /* شبیه‌سازی برد (برای تست) — از هر حالتی کار می‌کند */
  win() {
    state.wave = TOTAL_WAVES;
    state.spawn = { queue: [], timer: 0, interval: 1, bossDelay: false };
    state.zombies = []; state.bullets = [];
    state.mode = 'playing';          // حتی از وقفه هم برد شبیه‌سازی شود
    waveComplete();
  },
};
</script>
</body>
</html>
