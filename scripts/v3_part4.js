/* ==================================================================
   سه طبقه تا بقا — نسخه‌ی ۸٫۰ — منطق بازی (بخش ۳)
     ۱۵) رابط کاربری (HUD / نوار سلاح / نوار باس / پنل مکعبی + تولتیپ)
     ۱۶) حلقه اصلی و راه‌اندازی + رابط دیباگ/تست
   تازه‌های ۸٫۰ در این بخش:
     - آیکون‌های پنل ساخت‌وساز = اسپرایت‌های «مکعب پیکسل‌آرت» از پیش
       تولیدشده (CUBE_SPRITES — جاسازی‌شده به‌صورت data-URI در فایل تک‌فایل)
     - حلقه‌ی اصلی حالت cutscene را هم به‌روزرسانی می‌کند
   ================================================================== */

/* ---------------------- ۱۵) رابط کاربری ---------------------- */
function showScreen(id) { $(id).classList.remove('hidden'); }
function hideScreen(id) { $(id).classList.add('hidden'); }
function hideOverlays() {
  ['startScreen', 'howtoScreen', 'pauseScreen', 'gameoverScreen', 'victoryScreen',
   'settingsScreen', 'aboutScreen', 'confirmBox', 'saveCodeScreen']      // (۱۰٫۰ + ۱۳٫۰)
    .forEach(hideScreen);
}

function pauseGame() {
  if (!canPlay()) return;
  state.prevMode = state.mode; state.mode = 'paused';
  showScreen('pauseScreen');
  setPauseIcon(true);
}
function resumeGame() {
  if (state.mode !== 'paused') return;
  state.mode = state.prevMode || 'playing';
  hideScreen('pauseScreen');
  setPauseIcon(false);
}
/* (۱۳٫۰) آیکون دکمه‌ی توقف در ریل چپ */
function setPauseIcon(paused) {
  const b = $('ctlPause');
  if (b) b.textContent = paused ? '▶' : '⏸';
}

/* قطع/وصل صدا — همه‌ی دکمه‌های صدا هم‌زمان به‌روز می‌شوند
   (۱۰٫۰) با تنظیمات SETT هم‌گام است و بلندی صدا از آن‌جا می‌آید */
function toggleSound() {
  Snd.init();
  SETT.sfx = !SETT.sfx;
  saveSettings();
  applySettings();
  if (SETT.sfx) SFX.click();
}

/* ---------- پنل ساخت‌وساز تب‌دار (۱۲٫۰) ----------
   چهار تب (ارتقاء/سلاح‌ها/برجک‌ها/بقا) به‌جای فهرست بلند؛ سلاح‌های
   خریداری‌شده با کلیک روی کاشی‌شان «در دست» می‌شوند (نوار پایین حذف شد). */
const BP_TABS = [
  { id: 'up',  label: 'ارتقاء', ic: '⛏' },
  { id: 'wpn', label: 'سلاح‌ها', ic: '🔫' },
  { id: 'tur', label: 'برجک‌ها', ic: '🛡' },
  { id: 'sur', label: 'بقا',    ic: '🎒' },
];
let BP_TAB = 'up';
function setBPTab(id, silent) {
  if (!BP_TABS.some(t => t.id === id)) return;
  if (BP_TAB === id) return;
  BP_TAB = id;
  document.querySelectorAll('#bpTabs .bp-tab').forEach(el => el.classList.toggle('on', el.dataset.tab === id));
  if (!silent) SFX.click();
  refreshBuildPanel();
}

const BUILD_DEFS = [
  { tab: 'up', kind: 'repair', key: '۶', codes: ['Digit6', 'Numpad6'], name: 'تعمیر برج',    desc: '۵۰٪ جون برج را همان‌جا برمی‌گرداند' },
  { tab: 'up', kind: 'speed',  key: 'H', codes: ['KeyH'],              name: 'سرعت شلیک',   desc: 'نرخ شلیک همه‌ی سلاح‌ها ۸٪ سریع‌تر در هر سطح (حداکثر ۶ سطح)' },
  { tab: 'up', kind: 'health', key: '۵', codes: ['Digit5', 'Numpad5'], name: 'جون برج',      desc: '+۳۰ به حداکثر جون برج (و همین‌جا ترمیم می‌شود)' },
  { tab: 'up', kind: 'weapon', key: '۴', codes: ['Digit4', 'Numpad4'], name: 'ارتقای اسلحه',  desc: 'قدرت گلوله‌ی همه‌ی سلاح‌ها بالا می‌رود' },
  { tab: 'up', kind: 'trap',   key: '۷', codes: ['Digit7', 'Numpad7'], name: 'تله پایه',     desc: 'خارهای برقی — آسیب خودکار به زامبی‌های نزدیک برج' },
  { tab: 'wpn', kind: 'shotgun', key: '۸', codes: ['Digit8', 'Numpad8'], name: 'شاتگان',       desc: '۶ ساچمه با پراکندگی کشنده — بعد از خرید، خودش در دستت می‌آید' },
  { tab: 'wpn', kind: 'mg',      key: '۹', codes: ['Digit9', 'Numpad9'], name: 'مسلسل',        desc: 'نگه‌دار و ببار؛ نرخ شلیک خیلی بالا — بعد از خرید، خودش در دستت می‌آید' },
  { tab: 'tur', kind: 'gatling', key: '۰', codes: ['Digit0', 'Numpad0'], name: 'برجک مسلسل',   desc: 'رگبار پیوسته • دمیج ۳ • برد ۲۳۰' },
  { tab: 'tur', kind: 'sniper',  key: 'G', codes: ['KeyG'],              name: 'تک‌تیرانداز',   desc: 'تک‌ضرب کُشنده با شانس کریت • برد ۴۰۰' },
  { tab: 'tur', kind: 'frost',   key: 'F', codes: ['KeyF'],               name: 'برجک یخ‌زن',    desc: 'کند و یخ‌زده می‌کند • برد ۱۷۵' },
  { tab: 'tur', kind: 'turretUp',key: 'T', codes: ['KeyT'],              name: 'ارتقای برجک‌ها', desc: '+۳۰٪ دمیج و +۱۲٪ سرعت شلیک همه‌ی برجک‌ها در هر سطح' },
  { tab: 'sur', kind: 'flashlight', key: 'J', codes: ['KeyJ'], name: 'چراغ‌قوه',
    desc: 'با L روشن/خاموش می‌شود — دید در مه و قطع برق (باتری مصرف می‌کند)' },
  { tab: 'sur', kind: 'battery',    key: 'K', codes: ['KeyK'], name: 'باتری',
    desc: '+۵۰٪ شارژ چراغ‌قوه — داخل کوله‌پشتی ذخیره می‌شود' },
  { tab: 'sur', kind: 'canned',     key: 'C', codes: ['KeyC'], name: 'کنسرو',
    desc: 'شفای تدریجی ۴۵ جون در ۱۲ ثانیه — با کلیک/کلید کوله مصرف می‌شود' },
  { tab: 'sur', kind: 'medkit',     key: 'V', codes: ['KeyV'], name: 'کیت کمک‌های اولیه',
    desc: '۷۰ جون برج را فوراً برمی‌گرداند — با کلیک/کلید کوله مصرف می‌شود' },
];
/* نگاشت کلیدهای فیزیکی به آیتم خرید (برای خرید سریع با کیبورد) */
const KEY2KIND = {};
BUILD_DEFS.forEach(d => { if (d.codes) d.codes.forEach(c => KEY2KIND[c] = d.kind); });

/* ---------- آیکون‌های فروشگاه (۹٫۰) ----------
   کاشی‌ها مستقیماً از تصویر مرجع کاربر برش خورده‌اند (۹ کاشی واقعی:
   قلب/کفش/سپر/گلوله/مینی‌گان/تک‌تیرانداز/برجک‌ها) + دو کاشی ترکیبی
   هم‌سبک (تله خار و شاتگان دکلوله). سبک کاریکاتوریِ نرم است، پس با
   هموارسازی رسم می‌شوند (نه پیکسل‌آرت تیز). */

/* رسم آیکون آیتم روی بوم کوچک: گوشه‌های گرد + اسپرایت نرم */
function paintIcon(kind, cv) {
  cv.width = 88; cv.height = 88;                 // ۲ برابرِ نمایش ۴۴px برای تیزی رتینا
  const c = cv.getContext('2d');
  const im = CUBE_IMGS[kind];
  c.clearRect(0, 0, 88, 88);
  if (im && im.complete && im.naturalWidth) {
    c.imageSmoothingEnabled = true;              // کاشی‌های کاریکاتوریِ نرم
    c.imageSmoothingQuality = 'high';
    /* گوشه‌های گرد مثل کاشی‌های فروشگاه مرجع */
    if (c.roundRect) { c.beginPath(); c.roundRect(2, 2, 84, 84, 10); c.clip(); }
    c.drawImage(im, 2, 2, 84, 84);
    /* خط لبه‌ی ظریف برای جدا شدن از پس‌زمینه‌ی پنل */
    c.strokeStyle = 'rgba(120,170,230,.28)';
    c.lineWidth = 2;
    c.strokeRect(2, 2, 84, 84);
  } else {
    /* جای‌نگهدار تا بارگذاری تصویر */
    c.fillStyle = 'rgba(42,58,94,.85)';
    c.fillRect(18, 18, 52, 52);
    c.strokeStyle = 'rgba(255,216,115,.4)'; c.lineWidth = 2;
    c.strokeRect(18, 18, 52, 52);
  }
}

/* بازرسم کاشی بعد از بارگذاری تصویرش (data-URI ها async دیکود می‌شوند) */
function repaintCubeIcons(kind) {
  const el = $('bp-' + kind);
  if (!el) return;
  const cv = el.querySelector('.bp-ic');
  if (cv) paintIcon(kind, cv);
}

/* وضعیت لحظه‌ای آیتم برای تولتیپ (قیمت/سطح/مالکیت...) */
function tileStatus(kind) {
  /* وسایل بقی */
  if (kind === 'flashlight') {
    return state.torch.owned
      ? 'خریده شد ✅ (کلید L روشن/خاموش) — باتری: ' + faNum(Math.round(state.torch.battery)) + '٪'
      : 'برای مه و قطع برق لازمش داری';
  }
  if (kind === 'battery' || kind === 'canned' || kind === 'medkit') {
    const g = GEAR[kind];
    return 'داخل کوله: ' + faNum(state.backpack.filter(s => s && s.id === kind).length)
      + ' • قیمت: ' + faNum(g.price) + ' سکه';
  }
  if (kind === 'shotgun' || kind === 'mg') {
    if (!WEAPONS[kind].owned) return 'قفل — بعد از خرید، خودش در دستت می‌آید';
    return state.weapon === kind ? 'همین الان در دستته ✅' : 'خریده شد — کلیک کن تا در دستت بیاید';
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

/* ساخت یک‌بارِ تب‌ها و کاشی‌های پنل در شروع صفحه (۱۲٫۰: تب‌دار) */
function buildPanelInit() {
  const tabs = $('bpTabs');
  BP_TABS.forEach(t => {
    const b = document.createElement('div');
    b.className = 'bp-tab' + (t.id === BP_TAB ? ' on' : '');
    b.dataset.tab = t.id;
    b.innerHTML = '<span class="bp-tab-ic">' + t.ic + '</span><span>' + t.label + '</span>';
    b.addEventListener('click', () => setBPTab(t.id));
    tabs.appendChild(b);
  });
  const list = $('bpList');
  BUILD_DEFS.forEach((d) => {
    const el = document.createElement('div');
    el.className = 'bp-tile';
    el.id = 'bp-' + d.kind;
    /* آیکون Canvas با اسپرایت کاشی‌های تصویر مرجع */
    const cv = document.createElement('canvas');
    cv.className = 'bp-ic';
    paintIcon(d.kind, cv);
    el.appendChild(cv);
    /* کلید میان‌بر */
    if (d.key) {
      const k = document.createElement('span');
      k.className = 'bp-key'; k.textContent = d.key;
      el.appendChild(k);
    }
    /* قیمت — و زیر آن (۱۳٫۰) نوار سطح ارتقا (جای نقطه‌های نامرئی) */
    const price = document.createElement('span');
    price.className = 'bp-price'; price.id = 'bp-' + d.kind + '-cost';
    el.appendChild(price);
    const u0 = UPGRADES[d.kind];
    if (u0 && u0.max) {
      const lv = document.createElement('span');
      lv.className = 'bp-lv'; lv.id = 'bp-' + d.kind + '-lv';
      for (let i = 0; i < u0.max; i++) lv.appendChild(document.createElement('i'));
      el.appendChild(lv);
    }

    el.addEventListener('click', () => buy(d.kind));   /* مسیر یکسان خرید: قفل آخرین شب + سیو */
    el.addEventListener('mouseenter', () => showTip(d, el));
    el.addEventListener('mouseleave', hideTip);
    list.appendChild(el);
  });
  /* کلیک روی سربرگ = جمع/باز کردن پنل */
  $('bpHead').addEventListener('click', toggleBuildPanel);
}

/* تنظیم مستقیم وضعیت پنل ساخت‌وساز (۶٫۰):
   شب (شروع موج) خودکار جمع می‌شود تا زامبی‌های سمت راست دیده و شلیک شوند؛
   روز (پس از پاک‌سازی موج) خودکار باز می‌شود برای خرید و نصب. */
function setBuildPanel(collapsed, silent) {
  const p = $('buildPanel');
  if (p.classList.contains('collapsed') === collapsed) return;
  p.classList.toggle('collapsed', collapsed);
  $('bpChev').textContent = collapsed ? '▸' : '▾';
  if (collapsed) hideTip();                 // تولتیپ باز مانده نباشد
  if (!silent) SFX.click();
}

function toggleBuildPanel() {
  setBuildPanel(!$('buildPanel').classList.contains('collapsed'));
}

/* به‌روزرسانی وضعیت کاشی‌های پنل (۱۲٫۰: تب‌دار + سلاحِ در دست) */
function refreshBuildPanel() {
  for (const d of BUILD_DEFS) {
    const item = $('bp-' + d.kind);
    if (!item) continue;
    const cost = $('bp-' + d.kind + '-cost');
    item.classList.remove('deny');
    /* فقط کاشی‌های تبِ فعال دیده شوند */
    item.style.display = (d.tab === BP_TAB) ? '' : 'none';

    /* --- سلاح‌های یک‌بار خرید (۱۲٫۰: بعد از خرید = انتخاب/در دست) --- */
    if (d.kind === 'shotgun' || d.kind === 'mg') {
      const owned = WEAPONS[d.kind].owned;
      const armed = owned && state.weapon === d.kind;
      item.classList.toggle('armed', armed);
      item.classList.toggle('max', owned && !armed);
      cost.textContent = armed ? 'در دست' : (owned ? 'انتخاب' : faNum(UPGRADES[d.kind].price));
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

    /* --- برجک‌های دفاعی: خرید → حالت نصب --- */
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

    /* --- وسایل بقی: چراغ‌قوه یک‌بار خرید؛ بقیه تکراری‌اند --- */
    if (d.kind === 'flashlight' || d.kind === 'battery' || d.kind === 'canned' || d.kind === 'medkit') {
      const g = GEAR[d.kind];
      const owned = d.kind === 'flashlight' && state.torch.owned;
      item.classList.toggle('max', owned);
      cost.textContent = owned ? '✅' : faNum(g.price);
      item.classList.toggle('poor', !owned && state.coins < g.price);
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

/* به‌روزرسانی HUD (نوار جون، سکه، موج) + پنل ساخت
   (۱۳٫۰) سلاحِ در دست دیگر در HUD نیست — کاشی طلایی پنل + نوشته‌ی شناور بالای برج */
function updateHUD() {
  const t = state.tower, ratio = t.hp / t.maxHp;
  const fill = $('healthFill');
  fill.style.width = (ratio * 100).toFixed(1) + '%';
  fill.className = ratio > 0.5 ? '' : (ratio > 0.25 ? 'mid' : 'low');
  $('healthText').textContent = faNum(Math.ceil(t.hp)) + '/' + faNum(t.maxHp);
  $('coinText').textContent = faNum(state.coins);
  /* فصل + شماره‌ی موج درون‌فصلی */
  const wl = waveLabel();
  if (state.mode === 'playing') {
    const rem = state.spawn.queue.length + state.zombies.filter(z => !z.dead).length;
    $('waveText').textContent = wl + ' • ' + faNum(rem) + ' باقی';
  } else if (state.mode === 'day') {
    $('waveText').textContent = '☀️ ' + wl;
  } else {
    $('waveText').textContent = wl;
  }
  refreshBuildPanel();
  refreshGearHUD();                            // چراغ‌قوه/باتری
}

/* (۱۲٫۰) نوار سلاح حذف شد — این تابع برای سازگاری باقی مانده است */
function refreshWeaponBar() {}

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

  /* (۱۲٫۰) حلقه‌ی ضدّهنگ: هر خطای لحظه‌ای (مثلاً وسط رگبار شلیک)
     دیگر کل بازی را فریز نمی‌کند — فریم رد می‌شود و بازی ادامه می‌یابد */
  try {
    /* اسلوموشن سینمایی (۳٫۰): زمان بازی کند می‌شود ولی رندر عادی می‌ماند */
    let dtG = dt;
    if (state.slowmo > 0) {
      dtG = dt * 0.3;
      state.slowmo = Math.max(0, state.slowmo - dt);
    }

    if (state.mode === 'playing' || state.mode === 'intermission' || state.mode === 'day') update(dtG);
    else if (state.mode === 'cutscene') updateCutscene(dtG);   // رویداد داستانی (۷٫۰)
    else if (state.mode === 'defeatcine') updateDefeatCine(dtG);  // (۱۲٫۰) سینماییِ سقوط برج
    else if (state.mode === 'transition') updateTransition(dtG);   // (۱۰٫۰) انتقال بین فصل‌ها
    else if (state.mode === 'intro') updateIntro(dtG);             // (۱۰٫۰) کات‌سین افتتاحیه
    else if (state.mode === 'victorycine') updateVictoryCine(dtG); // (۱۰٫۰) صحنه‌ی پیروزی
    else if (state.mode === 'gameover' || state.mode === 'victory') updateFx(dtG);
    else if (state.mode === 'start') updateMenuScene(dtG);
    /* حالت paused: هیچ آپدیتی نمی‌شود (انجماد کامل) */

    /* جلوه‌های محیطی (شهاب و رعدوبرق) در همه‌ی حالت‌ها جریان دارند */
    updateShootingStar(dt);
    updateLightning(dt);
    render();
  } catch (e) {
    /* فریمِ خطادار رد می‌شود — بازی زنده می‌ماند */
  }
  /* (۱۲٫۰) موسیقی در همه‌ی حالت‌ها به‌روز می‌شود: منو/توقف (سکوت)/سینمایی/باخت */
  try { MUSIC.update(); } catch (e) {}
  requestAnimationFrame(frame);
}

function init() {
  /* اتصال دکمه‌های منو و اورلی‌ها */
  $('btnStart').addEventListener('click', startNewGame);   // تأیید پاک‌کردن سیو + کات‌سین افتتاحیه
  $('btnHowto').addEventListener('click', () => { SFX.click(); showScreen('howtoScreen'); });
  $('closeHowto').addEventListener('click', () => { SFX.click(); hideScreen('howtoScreen'); });
  $('btnContinue').addEventListener('click', continueGame);
  $('btnSettings').addEventListener('click', () => { SFX.click(); showScreen('settingsScreen'); });
  $('closeSettings').addEventListener('click', () => { SFX.click(); hideScreen('settingsScreen'); });
  $('btnAbout').addEventListener('click', () => { SFX.click(); showScreen('aboutScreen'); });
  $('closeAbout').addEventListener('click', () => { SFX.click(); hideScreen('aboutScreen'); });
  $('btnWipe').addEventListener('click', () => askConfirm('همه‌ی پیشرفتت پاک بشه؟', wipeSaveAndUI));
  $('cfNo').addEventListener('click', () => { SFX.click(); hideScreen('confirmBox'); });
  /* (۱۳٫۰) ریل کنترل گوشه‌ی چپ: چراغ / صدا / توقف */
  $('ctlFlash').addEventListener('click', () => toggleFlashlight());
  $('ctlMute').addEventListener('click', toggleSound);
  $('ctlPause').addEventListener('click', () => {
    if (state.mode === 'paused') resumeGame(); else pauseGame();
  });
  $('btnNight').addEventListener('click', startNight);   // شروع شب (۵٫۰)
  $('btnResume').addEventListener('click', resumeGame);
  $('btnRestart0').addEventListener('click', startGame);
  /* (۱۲٫۰) باخت: «ادامه از آخرین روز» (از آخرین سیو) و «شروع از اول» */
  $('btnRetryDay').addEventListener('click', retryFromSave);
  $('btnRestart1').addEventListener('click', startGame);
  $('btnRestart2').addEventListener('click', startGame);
  initSaveCodeUI();   // (۱۳٫۰) صفحه‌ی کد سیو

  buildPanelInit();    // پنل ساخت‌وساز تب‌دار (۱۲٫۰)
  initBackpackUI();   // کوله‌پشتی ۶ جا
  initPeddlerUI();    // پنل دستفروش مرموز
  initSettingsUI();   // تنظیمات + لود SETT
  refreshMenuContinue();   // فعال/غیرفعال‌کردن «ادامه‌ی بازی»
  initMenuZ();         // زامبی‌های تزئینیِ صحنه‌ی منو
  $('wrap').classList.add('menu-mode');   // در منو، HUD/پنل‌ها مخفی‌اند
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
  setBuildPanel,                     /* جمع/باز کردن پنل ساخت‌وساز (۶٫۰) */
  /* --- رویداد داستانی (۷٫۰) --- */
  playCutscene: playTowerCollapseCutscene,   /* اجرای دستی کات‌سین */
  skipCutscene,                              /* رد کردن کات‌سین */
  getCutscene() { return CS; },              /* وضعیت لحظه‌ای کات‌سین */
  getDrive() { return CS && CS.drive; },     /* وضعیت بخش رانندگی (۸٫۰) */
  csGoto(t) {                                /* پرش زمانی برای تست فریم‌ها */
    if (!CS) return;
    /* شبیه‌سازی گام‌به‌گام تا لحظه‌ی هدف تا همه‌ی رویدادهای میانی
       (سقوط، عبور ماشین، تصادم‌ها، رانندگی...) دقیقاً رخ بدهند.
       ۸٫۰: کات‌سین طولانی‌تر شد (بخش رانندگی) → سقف گام‌ها بیشتر */
    CS.paused = false;
    let guard = 0;
    while (CS && CS.t < t - (1 / 30) && guard++ < 1600) updateCutscene(1 / 30);
    if (CS) {
      const rest = t - CS.t;
      if (rest > 0) updateCutscene(Math.min(rest, 0.05));
      CS.paused = true;                      // فریز روی همین فریم
    }
  },
  csResume() { if (CS) CS.paused = false; }, /* ادامه‌ی عادی جریان */
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
  /* ---- (۱۰٫۰) رابط تست/دیباگ نسخه‌ی فصل‌ها ---- */
  v10: {
    CHAPTERS, FINAL_WAVE, WAVES_PER_CH, waveChapter, waveInChapter, buildWaveQueue,
    startChapter, startTransition, skipTransition,
    saveGame, loadSaveData, applySave, wipeSave, continueGame, retryFromSave,
    startNewGame, startIntroCine, skipIntro,
    giveItem, useItem, buy, buyRare, GEAR, RARE, toggleFlashlight,
    setBlackout(on) { state.blackout.on = !!on; },
    setBattery(n) { state.torch.battery = n; },
    peddlerVisit() { peddlerRoll(true); },
    mgJump, mgDuck, mgNudge,
    trGoto(t) {                              /* پرش زمانی قطعی برای تست فریم‌های انتقال */
      if (!TR) return;
      TR._paused = false;
      let guard = 0;
      while (TR && TR.t < t - 1 / 30 && guard++ < 4200) updateTransition(1 / 30);
      if (TR) TR._paused = true;
    },
    trResume() { if (TR) TR._paused = false; },
    introGoto(t) {                           /* پرش زمانی برای تست کات‌سین افتتاحیه — با زمانِ جهانی */
      if (!INTRO) return;
      INTRO._paused = false;
      let guard = 0;
      while (INTRO && introGlobalT() < t - 1 / 30 && guard++ < 4200) updateIntro(1 / 30);
      if (INTRO) INTRO._paused = true;
    },
    get TR() { return TR; },
    get INTRO() { return INTRO; },
    get Dark() { return Dark; },
    get CHT() { return curCh(); },
  },
  /* ---- (۱۱٫۰/۱۲٫۰) رابط تست/دیباگ صدا/موسیقی/گفتگو/موبایل ---- */
  v11: {
    VOICE, MUSIC, DLG, PERF: (typeof PERF !== 'undefined' ? PERF : null),
    INTRO_DLGS: (typeof INTRO_DLGS !== 'undefined' ? INTRO_DLGS : null),
    TR_DLGS: (typeof TR_DLGS !== 'undefined' ? TR_DLGS : null),
    say(text, who) { return VOICE.speak(String(text), who || 'n'); },
    saveAndExit, exitToMenu,
    isTouch: (typeof IS_TOUCH !== 'undefined' ? IS_TOUCH : false),
    setPerfLow(v) { if (typeof PERF !== 'undefined') { PERF.low = !!v; document.body.classList.toggle('perf-low', !!v); } },
  },
  /* ---- (۱۲٫۰) رابط تست کات‌سین باخت + تب‌های پنل ---- */
  v12: {
    DF: () => DF, setDFT(t) { if (DF) { DF.t = 0; } },
    defeatGoto(t) {                     /* پرش زمانی برای تست فریم‌های سقوط */
      if (!DF) return;
      DF._paused = false;
      let guard = 0;
      while (DF && DF.t < t - 1 / 30 && guard++ < 900) updateDefeatCine(1 / 30);
      if (DF) DF._paused = true;
    },
    defeatResume() { if (DF) DF._paused = false; },
    startDefeatCine, finishDefeatCine, skipDefeatCine, defeatHardReset,
    BP_TABS, setBPTab, get tab() { return BP_TAB; },
    retryFromSave,
  },
  /* ---- (۱۳٫۰) رابط تست صدا/سیو/ریل چپ ---- */
  v13: {
    get VOICES() { return (typeof VOICES13 !== 'undefined') ? VOICES13 : null; },
    get clipCount() { return (typeof VOICES13 !== 'undefined') ? Object.keys(VOICES13).length : 0; },
    exportSaveCode, importSaveCode,
    STORE: (typeof STORE !== 'undefined' ? STORE : null),
    storageOK: () => (typeof STORE !== 'undefined') && STORE.ok,
    decodedClips: () => Object.keys(VOICE._bufs).filter(k => VOICE._bufs[k]),
    ctlRail: () => document.getElementById('ctlRail'),
    warmup: () => VOICE.warmup(),
    toastSaved,
  },
  /* انداختن دستی جعبه‌ی قدرت (برای تست) */
  dropPower(type) { spawnPowerupObj(type || pickPowerType(), TOWER.x - 130, GROUND_Y - 60); },
  /* پرش سریع به موج n (برای تست) */
  skipToWave(n) {
    n = clamp(n, 1, FINAL_WAVE);              // (۱۰٫۰) ۳۳ موج
    if (state.mode === 'cutscene') skipCutscene();   /* کات‌سین فعال → ببند (۷٫۰) */
    if (state.mode === 'transition') skipTransition();   /* (۱۰٫۰) */
    if (state.mode === 'intro') skipIntro();             /* (۱۰٫۰) */
    if (state.mode === 'defeatcine') { skipDefeatCine(); hideOverlays(); }   /* (۱۲٫۰) */
    state.zombies = []; state.bullets = []; state.coinsArr = [];
    state.wave = n - 1;
    state.chapter = waveChapter(n);           /* (۱۰٫۰) فصل هماهنگ شود */
    state.towerVariant = state.chapter - 1;
    state.spawn = { queue: [], timer: 0, interval: 1, bossDelay: false };
    if (state.mode === 'playing') waveComplete();
    else if (!['start', 'gameover', 'victory', 'paused'].includes(state.mode)) {
      state.mode = 'intermission'; state.intermission = 0.3;
    }
  },
  /* شبیه‌سازی برد (برای تست) — از هر حالتی کار می‌کند */
  win() {
    if (state.mode === 'cutscene') skipCutscene();   /* کات‌سین فعال → ببند (۷٫۰) */
    if (state.mode === 'transition') skipTransition();   /* (۱۰٫۰) */
    if (state.mode === 'intro') skipIntro();             /* (۱۰٫۰) */
    if (state.mode === 'defeatcine') { skipDefeatCine(); hideOverlays(); }   /* (۱۲٫۰) */
    state.wave = FINAL_WAVE;                             /* (۱۰٫۰) شبیه‌سازی برد = پایانِ آخرین شب */
    state.chapter = 4;
    state.towerVariant = 3;
    state.spawn = { queue: [], timer: 0, interval: 1, bossDelay: false };
    state.zombies = []; state.bullets = [];
    state.mode = 'playing';          // حتی از وقفه هم برد شبیه‌سازی شود
    waveComplete();
  },
};
</script>
</body>
</html>
