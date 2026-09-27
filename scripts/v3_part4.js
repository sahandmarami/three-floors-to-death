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

/* ---------- آیکون‌های مکعبی پنل ساخت‌وساز (۸٫۰) ----------
   هر آیتم یک اسپرایت «مکعب پیکسل‌آرت» است (تولیدشده در make_cubes.py):
   وجه بالا با بافت و نشانِ آیتم + دو دیواره با درز بلوک‌چینی + لبه‌ی
   تیره — مثل مکعب‌های بازی‌های ساختمان‌سازی. اسپرایت‌ها به‌صورت
   data-URI (CUBE_SPRITES) در همان فایل جاسازی شده‌اند و با
   imageSmoothingEnabled=false (بدون هموارسازی) رسم می‌شوند تا
   پیکسل‌ها تیز بمانند. */

/* رسم آیکون آیتم روی بوم کوچک: سایه‌ی نرم + اسپرایت مکعب */
function paintIcon(kind, cv) {
  cv.width = 76; cv.height = 76;                 // ۲ برابرِ نمایش ۳۸px برای تیزی
  const c = cv.getContext('2d');
  const im = CUBE_IMGS[kind];
  if (im && im.complete && im.naturalWidth) {
    c.imageSmoothingEnabled = false;             // پیکسل‌آرت تیز
    /* سایه‌ی زمین زیر مکعب */
    c.fillStyle = 'rgba(0,0,0,.38)';
    c.beginPath(); c.ellipse(38, 64, 27, 7.5, 0, 0, Math.PI * 2); c.fill();
    c.drawImage(im, 0, 0);
  } else {
    /* جای‌نگهدار تا بارگذاری تصویر: مربع زمینه‌دار */
    c.fillStyle = 'rgba(42,58,94,.85)';
    c.fillRect(18, 18, 40, 40);
    c.strokeStyle = 'rgba(255,216,115,.4)'; c.lineWidth = 2;
    c.strokeRect(18, 18, 40, 40);
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
    /* آیکون Canvas با اسپرایت مکعب پیکسل‌آرت (۸٫۰) */
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
  else if (state.mode === 'cutscene') updateCutscene(dtG);   // رویداد داستانی (۷٫۰)
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
  /* انداختن دستی جعبه‌ی قدرت (برای تست) */
  dropPower(type) { spawnPowerupObj(type || pickPowerType(), TOWER.x - 130, GROUND_Y - 60); },
  /* پرش سریع به موج n (برای تست) */
  skipToWave(n) {
    n = clamp(n, 1, TOTAL_WAVES);
    if (state.mode === 'cutscene') skipCutscene();   /* کات‌سین فعال → ببند (۷٫۰) */
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
    if (state.mode === 'cutscene') skipCutscene();   /* کات‌سین فعال → ببند (۷٫۰) */
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
