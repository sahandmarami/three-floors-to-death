/* ==================================================================
   سه طبقه تا بقا — نسخه‌ی ۱۰٫۰ — بخش ۵: فصل‌بندی، جریان موج‌ها و سیو
   ==================================================================
   ساختار چهار فصل بازی (هر فصل ۸ موج + موج ۳۳ = «آخرین شب»):
     ۱) محله‌ی قدیمی   — آجری، شب معمولی، برج سنگی/آجری
     ۲) منطقه‌ی انبارها — صنعتی، مه‌گرفته، برج فولادی + قطع برق تصادفی
     ۳) پاسگاه نظامی    — خرابه‌ها، ماه خونی و بارش خاکستر (شهر سوخته‌ی ۷٫۰)
     ۴) برج مخابراتی   — بارانی/برفی، رعدوبرق پرتواتر، برج لاجوردی
   قواعد:
     - جون، سکه، سلاح‌ها، ارتقاها و کوله‌پشتی بین فصل‌ها حفظ می‌شوند
     - برجک‌ها روی برج قبلی می‌مانند (هر فصل از نو ساخته می‌شود)
     - پایان هر فصل = انتقال سه‌فازی سینمایی-قابل‌بازی (بخش ۷)
     - سیو خودکار localStorage: پایان هر موج + هر خرید + شروع هر فصل
   این فایل توابع جریان نسخه‌های قبل (startGame/startWave/waveComplete/
   startNight/spawnZombie) را با نسخه‌ی فصل‌دار بازنویسی می‌کند.
   ================================================================== */

/* ---------------------- ۵-۱) ثابت‌های فصل‌بندی ---------------------- */
const WAVES_PER_CH = 8;                    // موج‌های عادی هر فصل
const FINAL_WAVE = 33;                     // ۴×۸ + ۱ = موج آخرِ کل بازی («آخرین شب»)

/* شماره‌ی فصل/موجِ درون‌فصلی از شماره‌ی موجِ سراسری */
function waveChapter(w) { return w <= 8 ? 1 : w <= 16 ? 2 : w <= 24 ? 3 : 4; }
function waveInChapter(w) { return clamp(w, 1, FINAL_WAVE) - (waveChapter(clamp(w, 1, FINAL_WAVE)) - 1) * WAVES_PER_CH; }

/* ابزارهای تصادفی مکمل */
function irand(a, b) { return Math.floor(rand(a, b + 0.999)); }
function chance(p) { return Math.random() < p; }

/* تنظیمات کامل هر فصل:
   mulHp/mulSpd/mulCount = ضریب سختی دشمن‌ها • unlock = موجِ درون‌فصلیِ ورود انواع
   blackout = تعداد قطع‌برق‌های تصادفی هر شب • theme = پالت و حال‌وهوای صحنه */
const CHAPTERS = [
  { /* ---- فصل ۱: محله‌ی قدیمی — شب‌های آجری ---- */
    name: 'محله‌ی قدیمی', sub: 'شب‌های آجری',
    waves: WAVES_PER_CH,
    mulHp: 1.15, mulSpd: 1.05, mulCount: 1.18,
    unlock: { fast: 3, tank: 6 },
    blackout: null,
    theme: {
      sky: [['#05091a', '#41a8ef'], ['#0d1734', '#6fc8f8'], ['#182550', '#b8e8fd'], ['#233865', '#e2f4ff']],
      moon: { x: 176, y: 88, r: 37 },
      skyline: 'city', grade: 'cold',
      ground: {
        h1: ['#16244a', '#82c163'], h1c: ['#2c4272', '#abd97e'],
        h2: ['#101d3d', '#6fb556'], h2c: ['#263a63', '#9ccf74'],
        soil: ['#1e2815', '#568c3e'], soilD: ['#0c110a', '#2a4a22'],
        grass: ['#273418', '#68ac4c'], blade: ['#33451f', '#7cc266'],
      },
      fog: 0, snow: false, ash: false, emberEyes: false, deadTrees: false,
      lightning: [13, 30], darkBase: 0, props: 'village',
    },
  },
  { /* ---- فصل ۲: منطقه‌ی انبارها — مهِ صنعتی ---- */
    name: 'منطقه‌ی انبارها', sub: 'مهِ صنعتی',
    waves: WAVES_PER_CH,
    mulHp: 1.50, mulSpd: 1.13, mulCount: 1.30,
    unlock: { fast: 1, tank: 3 },
    blackout: { min: 1, max: 2 },
    theme: {
      sky: [['#070d16', '#77a3bd'], ['#10202e', '#a5c2d4'], ['#1a3441', '#c8dae4'], ['#24424a', '#e0ecf2']],
      smoke: { c: '110,130,145', a: [0.26, 0.12] },
      moon: { x: 760, y: 70, r: 26, dim: 0.75 },
      skyline: 'warehouse', grade: 'cold',
      ground: {
        h1: ['#15202e', '#8e9aa6'], h1c: ['#243448', '#b7c2ca'],
        h2: ['#101a26', '#7c8892'], h2c: ['#1e2c3e', '#a5b0b8'],
        soil: ['#232a30', '#6a7278'], soilD: ['#101418', '#3a4046'],
        grass: ['#2e3844', '#7d8894'], blade: ['#3a4654', '#8d99a6'],
      },
      fog: 0.9, snow: false, ash: false, emberEyes: false, deadTrees: false,
      lightning: [22, 46], darkBase: 0.62, props: 'warehouse',
    },
  },
  { /* ---- فصل ۳: پاسگاه نظامی — خرابه‌ها (شهر سوخته‌ی ۷٫۰/۸٫۰) ---- */
    name: 'پاسگاه نظامی', sub: 'خرابه‌ها',
    waves: WAVES_PER_CH,
    mulHp: 1.90, mulSpd: 1.21, mulCount: 1.45,
    unlock: { fast: 1, tank: 1 },
    blackout: { min: 0, max: 1 },
    theme: {
      sky: [['#170b1c', '#8a7560'], ['#241028', '#a58b70'], ['#3a1626', '#c2a784'], ['#4a1c28', '#d8bc95']],
      smoke: { c: '150,85,55', a: [0.30, 0.15] },
      moon: { x: 806, y: 96, r: 44, blood: true },
      skyline: 'ruin', grade: 'ember',
      ground: {
        h1: ['#242028', '#8d7f6c'], h1c: ['#3a3440', '#a8977f'],
        h2: ['#1c1820', '#7c6e5c'], h2c: ['#302a34', '#97866f'],
        soil: ['#2a2118', '#6b5a44'], soilD: ['#120e0a', '#3a3227'],
        grass: ['#3a3125', '#7d6d54'], blade: ['#4a4030', '#948266'],
        scorch: true,
      },
      fog: 0.15, snow: false, ash: true, emberEyes: true, deadTrees: true,
      lightning: [16, 34], darkBase: 0.22, props: 'military',
    },
  },
  { /* ---- فصل ۴: برج مخابراتی — بارانی/برفی ---- */
    name: 'برج مخابراتی', sub: 'آخرین قله',
    waves: WAVES_PER_CH,
    mulHp: 2.40, mulSpd: 1.29, mulCount: 1.60,
    unlock: { fast: 1, tank: 1 },
    blackout: { min: 1, max: 2 },
    theme: {
      sky: [['#0a1020', '#96b6d4'], ['#152238', '#bcd2e6'], ['#20304a', '#d8e6f2'], ['#2c3f5c', '#f0f6fc']],
      smoke: { c: '90,105,130', a: [0.20, 0.10] },
      moon: { x: 250, y: 64, r: 30, dim: 0.6 },
      skyline: 'mountain', grade: 'frost',
      ground: {
        h1: ['#1a2740', '#aebfd4'], h1c: ['#2c3f5e', '#d4e2ef'],
        h2: ['#141f36', '#94a8c2'], h2c: ['#243450', '#bccce0'],
        soil: ['#2a3342', '#8e9db2'], soilD: ['#141a26', '#4a566a'],
        grass: ['#39465a', '#a8bacf'], blade: ['#46536a', '#bcd0e2'],
      },
      fog: 0.1, snow: true, ash: false, emberEyes: false, deadTrees: false,
      lightning: [5, 12], darkBase: 0.3, props: 'telecom',
    },
  },
];

/* فصل فعال (برای خواندن تم/ضریب‌ها در توابع رندر) */
function curCh() { return CHAPTERS[clamp(state.chapter - 1, 0, 3)]; }

/* برچسب موج برای HUD: «فصل ۲ • موج ۳/۸» یا «آخرین شب» */
function waveLabel() {
  if (state.wave >= FINAL_WAVE) return '🌑 آخرین شب';
  const w = clamp(state.wave, 1, FINAL_WAVE);
  return 'فصل ' + faNum(waveChapter(w)) + ' • موج ' + faNum(waveInChapter(w)) + '/' + faNum(WAVES_PER_CH);
}

/* ---------------------- ۵-۲) تولید ترکیب موج‌ها ---------------------- */
/* ترکیب هر موج به‌صورت رویه‌ای از (فصل، شماره‌ی درون‌فصلی) ساخته می‌شود؛
   موج آخرِ کل بازی فقط نگهبان است (زامبی‌هایش را خودش فراخوان می‌کند) */
function buildWaveQueue(w) {
  if (w >= FINAL_WAVE) return ['boss'];
  const ch = waveChapter(w), wv = waveInChapter(w), C = CHAPTERS[ch - 1];
  let n = Math.round((5 + wv * 1.85) * C.mulCount);          // (۱۱٫۰) موج‌ها پرتر
  const f = wv >= C.unlock.fast ? Math.round(n * 0.32) : 0;
  const t = wv >= C.unlock.tank ? Math.max(1, Math.round(n * 0.16)) : 0;
  n = Math.max(3, n - Math.round((f + t) * 0.55));
  const q = [];
  for (let i = 0; i < n; i++) q.push('normal');
  for (let i = 0; i < f; i++) q.push('fast');
  for (let i = 0; i < t; i++) q.push('tank');
  for (let i = q.length - 1; i > 0; i--) {          // شافل فیشر–ییتس
    const j = Math.floor(rand(0, i + 1));
    const tmp = q[i]; q[i] = q[j]; q[j] = tmp;
  }
  return q;
}

/* فاصله‌ی تولد زامبی‌ها: هر موج و هر فصل فشرده‌تر */
function spawnInterval(w) {
  const ch = waveChapter(w), wv = waveInChapter(w);
  return clamp(2.0 - wv * 0.13 - (ch - 1) * 0.2, 0.5, 2.0);   // (۱۱٫۰) فشرده‌تر
}

/* ---------------------- ۵-۳) بازنویسی جریان اصلی ---------------------- */
/* (جایگزین نسخه‌های بخش ۲ — فصل‌دار و سیو‌دار) */

function startGame() {
  state.mode = 'intermission';
  state.prevMode = null;
  state.time = 0; state.wave = 0;
  state.coins = 30;                       // سرمایه‌ی شروع
  state.dayness = 0; state.dayTarget = 0; state.goingNight = false;
  state.tower.hp = 100; state.tower.maxHp = 100;
  state.upgrades = { weapon: 0, health: 0, trap: 0, turretUp: 0, speed: 0 };
  state.weapon = 'pistol';
  state.chapter = 1;                      // (۱۰٫۰) فصل ۱
  state.towerVariant = 0;
  state.cutsceneDone = false;
  state.weaponSpent = 0;
  /* (۱۰٫۰) ریست نظام‌های جدید */
  state.backpack = [null, null, null, null, null, null];
  state.torch = { owned: false, on: false, battery: 0 };
  state.buffs = { vest: false, goldAmmo: false, helmet: false };
  state.regen = 0;
  state.peddler = { cd: 0, here: false, stock: [] };
  state.blackout = { on: false, waveT: 0, schedule: [], until: 0 };
  state.projectiles = [];
  state.cardT = 0;
  cutsceneHardReset();                    // کات‌سین معلق نباشد (۷٫۰)
  transitionHardReset();                  // انتقال فصل معلق نباشد (۱۰٫۰)
  introHardReset();                       // کات‌سین افتتاحیه معلق نباشد (۱۰٫۰)
  defeatHardReset();                      // (۱۲٫۰) سینماییِ باخت معلق نباشد
  wipeSave();                             // بازی تازه = سیو تازه
  WEAPONS.shotgun.owned = false; WEAPONS.mg.owned = false;
  state.zombies = []; state.bullets = []; state.coinsArr = [];
  state.turrets = []; state.placing = null; state.tipTurret = false;
  state.particles = []; state.texts = []; state.zaps = [];
  state.powerups = []; state.decals = [];
  state.powerTimers = { rapid: 0, freeze: 0 };
  state.combo = 0; state.comboT = 0; state.comboPop = 0;
  state.killsSinceDrop = 0; state.heartT = 0;
  state.shake = 0; state.flash = 0;   // فلش قرمز آسیب (عدد) — چراغ‌قوه state.torch است
  state.hitMark = 0; state.muzzleGlow = 0; state.slowmo = 0;
  state.lightning = { t: rand(9, 20), a: 0 };
  state.stats = { kills: 0, earned: 0, shots: 0, maxCombo: 0, turKills: 0 };
  state.spawn = { queue: [], timer: 0, interval: 2, bossDelay: false };
  state.mouse.down = false; fireTimer = 0; announceTimer = 0;
  state.intermission = INTERMISSION_FIRST;
  hideOverlays();
  hideDayPanel();
  hidePeddlerPanel();                     // (۱۰٫۰)
  hideChapterCard();                      // (۱۰٫۰)
  $('wrap').classList.remove('menu-mode', 'cs-mode', 'cine-mode');
  $('lockBadge').classList.add('hidden'); // (۱۰٫۰)
  setBuildPanel(false, true);
  $('btnPause').textContent = '⏸ توقف';
  $('bpHead').classList.remove('attention');
  $('bossBar').style.display = 'none'; bossBarVisible = false;
  updateHUD(); refreshBuildPanel(); refreshWeaponBar();
  refreshBackpack(); refreshGearHUD();    // (۱۰٫۰)
}

/* آغاز موج سراسری n — صف ترکیبِ فصل‌محور + زمان‌بندی قطع برق */
function startWave(n) {
  state.wave = n;
  state.mode = 'playing';
  const isFinal = n >= FINAL_WAVE;
  state.spawn = {
    queue: buildWaveQueue(n),
    timer: 1.2,
    interval: spawnInterval(n),
    bossDelay: false,
  };
  /* (۱۰٫۰) زمان‌بندی قطع‌برق‌های تصادفیِ این موج (فصل‌های ۲ به بعد) */
  state.blackout.waveT = 0;
  state.blackout.on = false;
  state.blackout.schedule = [];
  const C = curCh();
  if (!isFinal && C.blackout) {
    const k = irand(C.blackout.min, C.blackout.max);
    for (let i = 0; i < k; i++) {
      state.blackout.schedule.push({ at: rand(5, 24), dur: rand(8, 13), fired: false });
    }
  }
  if (isFinal) {
    $('lockBadge').classList.remove('hidden');    // فروشگاه قفل
    setAnnounce('🌑 آخرین شب', 'فروشگاه قفل است — فقط کوله‌پشتی و برجت', 2.6);
    SFX.roar();
  } else {
    setAnnounce(waveLabel(), 'دفاع کن! 🧟', 2);
    SFX.wave();
  }
  SFX.dusk();
  setBuildPanel(true, true);             // شب: پنل جمع
  $('bpHead').classList.remove('attention');
  updateHUD();
}

/* پایان موج: جایزه + مسیر جدید (انتقال فصل / روز / پیروزی) */
function waveComplete() {
  if (state.wave >= FINAL_WAVE) { startVictoryCine(); return; }   // برد واقعی (۱۰٫۰)
  const bonus = 12 + state.wave * 4;
  state.coins += bonus;
  state.stats.earned += bonus;
  addText(TOWER.x, TOWER_TOP_Y - 56, 'جایزه‌ی موج: +' + faNum(bonus) + ' 💰', '#ffd873', 16);
  pulseCoins();
  state.zombies = []; state.bullets = []; state.projectiles = [];
  state.blackout.on = false;              // برق برمی‌گردد
  $('lockBadge').classList.add('hidden');
  /* آخرین موجِ فصل → انتقال سینمایی-قابل‌بازی به فصل بعد (۱۰٫۰) */
  const ch = waveChapter(state.wave), wv = waveInChapter(state.wave);
  if (wv === WAVES_PER_CH && ch < 4) {
    startTransition(ch);
    return;
  }
  enterDay();
}

/* ورود به روز: پنل فروشگاه + دستفروش + سیو خودکار */
function enterDay() {
  state.mode = 'day';
  state.dayTarget = 1;
  state.goingNight = false;
  state.slowmo = Math.max(state.slowmo, 0.45);
  $('bossBar').style.display = 'none'; bossBarVisible = false;
  const isFinalNext = state.wave + 1 >= FINAL_WAVE;
  setAnnounce('☀️ صبح شد!',
    isFinalNext ? '⚠️ شب بعدی «آخرین شب» است — آخرین فرصت خرید!'
                : 'موج ' + faNum(state.wave) + ' پاک شد — ارتقا بخر و شب را شروع کن', 3);
  SFX.clear();
  SFX.morning();
  showDayPanel();
  $('dpHint').textContent = isFinalNext
    ? '⚠️ شب بعدی «آخرین شب» است — کوله‌پشتیت را پر کن!'
    : 'زامبی نمی‌آید — ارتقا بخر و برجک بگذار';
  peddlerRoll();                          // (۱۰٫۰) شانس آمدن دستفروش مرموز
  saveGame();                             // (۱۰٫۰) سیو خودکارِ پایان موج
  /* (۱۱٫۰) روی موبایل پنلِ باز شلوغ است — جمع شروع می‌شود (با ضربه باز می‌شود) */
  setBuildPanel((typeof IS_TOUCH !== 'undefined' && IS_TOUCH) ? true : false, true);
  $('bpHead').classList.add('attention');
  updateHUD(); refreshBackpack();
}

/* کلیک «شب شود» — با هشدار ویژه‌ی آخرین شب (۱۰٫۰) */
function startNight() {
  if (state.mode !== 'day' || state.goingNight) return;
  state.goingNight = true;
  hideDayPanel();
  state.dayTarget = 0;
  if (state.wave + 1 >= FINAL_WAVE) {
    showBossWarn();
    SFX.dusk();
    SFX.roar();
  } else {
    setAnnounce('🌙 شب می‌شود...', 'موج ' + faNum(state.wave + 1) + ' در راه است — آماده باش!', 1.8);
    SFX.dusk();
  }
}

/* هشدار تمام‌صفحه «آخرین شب» */
function showBossWarn() {
  const el = $('bossWarn');
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3400);
}

/* تولید زامبی با مقیاسِ فصل (جون/سرعت به موجِ درون‌فصلی و ضریب فصل وابسته است) */
function spawnZombie(type) {
  const T = ZTYPES[type || 'normal'];
  const C = curCh();
  const wv = waveInChapter(clamp(state.wave, 1, FINAL_WAVE));
  const side = Math.random() < 0.5 ? -1 : 1;
  /* (۱۱٫۰) نگهبانِ آخرین شب جونِ ثابت دارد — ضریب فصل روی او اعمال نمی‌شود
     (زرهاش خودش سختی را می‌سازند: ×۰٫۵ معمولی، ×۲٫۶ کریتِ سر) */
  const hp = Math.max(1, Math.round((T.hpBase + T.hpWave * wv) * ((type || 'normal') === 'boss' ? 1 : C.mulHp)));
  state.zombies.push({
    type: type || 'normal',
    x: side < 0 ? -30 : W + 30,
    y: GROUND_Y + rand(-3, 3),
    yJit: rand(-3, 3),
    dir: side < 0 ? 1 : -1,
    hp, maxHp: hp,
    speed: (T.spdBase + T.spdWave * wv) * C.mulSpd * rand(0.85, 1.15),
    radius: T.r,
    biteInt: T.bite, biteTimer: rand(0.2, 0.6),
    dmg: T.dmg,
    walkPhase: Math.random() * Math.PI * 2,
    attackAnim: 0,
    attacking: false, attackSide: 0,
    lane: 0, depth: 1,
    stagger: 0,
    chill: 0,
    hitFlash: 0, dead: false, deathT: 0,
  });
  spawnParticles(side < 0 ? 8 : W - 8, GROUND_Y - 4, 5, '#5a4a33',
    { speed: 55, life: 0.4, size: 2.2, grav: 180, up: true });
  updateHUD();
}

/* ---------------------- ۵-۴) شروع فصل جدید + کارت فصل ---------------------- */
const CH_ORD = ['اول', 'دوم', 'سوم', 'چهارم'];

/* ورود به فصل ch: برج تازه + حفظ پیشرفت بازیکن (۱۰٫۰)
   برجک‌ها/تله‌های فیزیکی مکان قبلی هستند؛ ارتقاها و وسایل می‌آیند */
function startChapter(ch) {
  ch = clamp(ch, 1, 4);
  state.chapter = ch;
  state.towerVariant = ch - 1;                 // پوسته‌ی برج فصل
  state.wave = (ch - 1) * WAVES_PER_CH;        // موج بعدی = این + ۱
  state.turrets = [];                          // برجک‌ها روی برج قبلی ماندند
  state.placing = null;
  state.zombies = []; state.bullets = []; state.projectiles = [];
  state.powerups = []; state.decals = [];
  state.blackout.on = false; state.blackout.schedule = [];
  state.dayTarget = 1; state.dayness = Math.max(state.dayness, 0.85);
  state.goingNight = false;
  saveGame();                                  // سیو شروع فصل
  state.mode = 'day';
  enterDay();
  setAnnounce('🗺 فصل ' + CH_ORD[ch - 1] + ': ' + curCh().name,
    curCh().sub + ' — موج ' + faNum(waveInChapter(state.wave + 1)) + ' از ' + faNum(WAVES_PER_CH) + ' در راه است', 3.2);
  showChapterCard(ch);
}

/* کارت تمام‌صفحه‌ی فصل جدید */
function showChapterCard(ch) {
  const C = CHAPTERS[ch - 1];
  $('ccNum').textContent = 'فصل ' + CH_ORD[ch - 1];
  $('ccName').textContent = C.name;
  $('ccSub').textContent = C.sub;
  $('chapterCard').classList.add('show');
  state.cardT = 2.9;                           // در هوک به‌روزرسانی کم می‌شود
  SFX.clear();
}
function hideChapterCard() {
  $('chapterCard').classList.remove('show');
  state.cardT = 0;
}

/* ---------------------- ۵-۵) سیستم سیو localStorage ---------------------- */
const SAVE_KEY = 'ttb3_save_v1';

/* عکس‌الوضعتی که ذخیره می‌شود: فصل/موج بعدی، جون، سکه، سلاح‌ها و ارتقاها،
   محتویات کوله‌پشتی، باتری چراغ‌قوه، دستفروش و آمار */
function collectSave() {
  return {
    v: 1,
    chapter: state.chapter,
    /* (۱۱٫۰) حین شبِ N → خودِ N ذخیره می‌شود (همان شب از اول بازی شود)؛
       در روز/وقفه بعد از موج N → N+۱ (موج بعدی) */
    wave: state.wave + (state.mode === 'playing' ? 0 : 1),
    coins: state.coins,
    hp: Math.ceil(state.tower.hp), maxHp: state.tower.maxHp,
    upgrades: Object.assign({}, state.upgrades),
    weapon: state.weapon,
    owned: { shotgun: WEAPONS.shotgun.owned, mg: WEAPONS.mg.owned },
    backpack: state.backpack.map(s => (s ? s.id : null)),
    flash: { owned: state.torch.owned, battery: Math.round(state.torch.battery) },
    buffs: Object.assign({}, state.buffs),
    peddlerCd: state.peddler.cd,
    weaponSpent: state.weaponSpent,
    stats: Object.assign({}, state.stats),
  };
}

function saveGame() {
  if (state.mode === 'gameover' || state.mode === 'victory' || state.mode === 'defeatcine') return;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(collectSave())); } catch (e) {}
  refreshMenuContinue();
}

/* خواندن امن سیو: ساختار نامعتبر = null (بدون کرش) */
function loadSaveData() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!d || d.v !== 1) return null;
    if (!CHAPTERS[(d.chapter | 0) - 1]) return null;
    if (typeof d.wave !== 'number' || d.wave < 1 || d.wave > FINAL_WAVE) return null;
    if (typeof d.coins !== 'number' || !d.upgrades || !d.stats || !d.flash) return null;
    return d;
  } catch (e) { return null; }
}

/* اعمال سیو روی state (بعد از ریست کامل) — مقاوم در برابر داده‌های ناقص
   (۱۲٫۰) در پایان، سیو دوباره نوشته می‌شود تا اگر ریستِ داخلی چیزی پاک
   کرد، «ادامه‌ی بازی» هرگز بی‌سیو نماند (رفع باگ دکمه‌ی خاموش‌مانده) */
function applySave(d) {
  startGame();
  state.chapter = clamp(d.chapter | 0, 1, 4);
  state.towerVariant = state.chapter - 1;
  state.wave = clamp(d.wave | 0, 1, FINAL_WAVE) - 1;   // enterDay با +1 ادامه می‌دهد
  state.coins = Math.max(0, d.coins | 0);
  state.tower.maxHp = Math.max(100, d.maxHp | 0);
  state.tower.hp = clamp(d.hp | 0, 1, state.tower.maxHp);
  state.upgrades = Object.assign({ weapon: 0, health: 0, trap: 0, turretUp: 0, speed: 0 }, d.upgrades);
  WEAPONS.shotgun.owned = !!(d.owned && d.owned.shotgun);
  WEAPONS.mg.owned = !!(d.owned && d.owned.mg);
  state.weapon = (d.weapon && WEAPONS[d.weapon]) ? d.weapon : 'pistol';
  state.weaponSpent = d.weaponSpent | 0;
  state.backpack = (d.backpack || []).slice(0, 6)
    .map(id => ((id && GEAR[id]) || (id && RARE[id])) ? { id } : null);
  while (state.backpack.length < 6) state.backpack.push(null);
  state.torch = {
    owned: !!(d.flash && d.flash.owned),
    on: false,
    battery: clamp((d.flash && d.flash.battery) | 0, 0, 100),
  };
  state.buffs = Object.assign({ vest: false, goldAmmo: false, helmet: false }, d.buffs);
  state.peddler = { cd: d.peddlerCd | 0, here: false, stock: [] };
  state.stats = Object.assign({ kills: 0, earned: 0, shots: 0, maxCombo: 0, turKills: 0 }, d.stats);
  state.intermission = 0;
  state.dayness = 1; state.dayTarget = 1;
  updateHUD(); refreshBackpack(); refreshGearHUD();
  saveGame();                        // (۱۲٫۰) سیو بلافاصله بازنویسی شود
}

function wipeSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  refreshMenuContinue();
}
function wipeSaveAndUI() {
  SFX.click();
  wipeSave();
  hideScreen('confirmBox');
  setAnnounce('🗑 سیو پاک شد', 'برای شروع تازه «بازی جدید» را بزن', 2.4);
}

/* فعال/غیرفعال‌شدن دکمه‌ی «ادامه‌ی بازی» منو */
function refreshMenuContinue() {
  const btn = $('btnContinue');
  if (!btn) return;
  const d = loadSaveData();
  btn.disabled = !d;
  btn.textContent = d
    ? '▶ ادامه — فصل ' + faNum(d.chapter) + ' • موج ' + faNum(waveInChapter(d.wave))
    : '▶ ادامه‌ی بازی (سیوی نیست)';
}

/* ادامه از سیو: دقیقاً از روزِ موجِ ذخیره‌شده */
function continueGame() {
  const d = loadSaveData();
  if (!d) { SFX.deny(); refreshMenuContinue(); return; }
  SFX.click();
  doFade(() => {
    applySave(d);
    hideOverlays();
    state.mode = 'day';
    enterDay();
    setAnnounce('💾 بازی ادامه پیدا کرد',
      'فصل ' + faNum(state.chapter) + ' — موج ' + faNum(waveInChapter(state.wave + 1)) + ' از ' + faNum(WAVES_PER_CH), 2.8);
  });
}

/* (۱۱٫۰) ذخیره‌ی وسط بازی + خروج امن به منو — «ادامه» از اولِ همان شب/روز
   سیوِ حین شبِ N → ادامه در روزِ قبل از N با دکمه‌ی «شب شود — موج N» */
function saveAndExit() {
  SFX.click();
  saveGame();                       // حین playing/day/intermission مجاز است
  exitToMenu();
  setTimeout(() => setAnnounce('💾 ذخیره شد!', 'هر وقت خواستی از منو «ادامه‌ی بازی» را بزن', 3), 350);
}

function exitToMenu() {
  try { VOICE.stop(); } catch (e) {}
  try { DLG.skip(); } catch (e) {}
  try { MUSIC.set('menu'); } catch (e) {}
  cutsceneHardReset();
  transitionHardReset();
  introHardReset();
  defeatHardReset();                      // (۱۲٫۰)
  hideOverlays();
  hideDayPanel();
  hidePeddlerPanel();
  hideChapterCard();
  hideAnnounce();
  $('skipCs').classList.add('hidden');
  state.mode = 'start';
  state.prevMode = null;
  state.mouse.down = false;
  state.placing = null;
  state.goingNight = false;
  state.zombies = []; state.bullets = []; state.projectiles = [];
  state.coinsArr = []; state.powerups = []; state.particles = []; state.texts = [];
  state.bossBar && ($('bossBar').style.display = 'none');
  bossBarVisible = false;
  $('lockBadge').classList.add('hidden');
  $('btnPause').textContent = '⏸ توقف';
  $('wrap').classList.add('menu-mode');
  $('wrap').classList.remove('cs-mode', 'cine-mode');
  initMenuZ();                       // صحنه‌ی زنده‌ی منو
  refreshMenuContinue();
  showScreen('startScreen');
  updateHUD();
}

/* بعد از باخت: تلاش دوباره از آخرین سیو (وگرنه شروع تازه) */
function retryFromSave() {
  const d = loadSaveData();
  SFX.click();
  hideOverlays();
  if (d) {
    applySave(d);
    state.mode = 'day';
    enterDay();
    setAnnounce('🔄 تلاش دوباره',
      'از آخرین سیو: فصل ' + faNum(state.chapter) + '، موج ' + faNum(waveInChapter(state.wave + 1)), 2.6);
  } else {
    startGame();
  }
}

/* «بازی جدید» منو: اگر سیو هست تأیید بگیر، بعد کات‌سین افتتاحیه */
function startNewGame() {
  SFX.click();
  if (loadSaveData()) {
    askConfirm('با شروع بازی جدید، سیوِ قبلی پاک می‌شود. ادامه بدهم؟', () => {
      hideScreen('confirmBox');
      wipeSave();
      startIntroCine();
    });
    return;
  }
  startIntroCine();
}

/* ---------------------- ۵-۶) محو نرم + جعبه‌ی تایید ---------------------- */
let fadeBusy = false;
function doFade(mid, dur) {
  const d = dur || 0.45;
  if (fadeBusy) { mid && mid(); return; }
  fadeBusy = true;
  const el = $('fadeDiv');
  el.style.transition = 'opacity ' + d + 's ease';
  el.classList.add('on');
  setTimeout(() => {
    try { mid && mid(); } catch (e) {}
    setTimeout(() => { el.classList.remove('on'); fadeBusy = false; }, 90);
  }, d * 1000 + 40);
}

let _cfYes = null;
function askConfirm(msg, onYes) {
  $('cfMsg').textContent = msg;
  _cfYes = onYes;
  showScreen('confirmBox');
}
$('cfYes').addEventListener('click', () => {
  SFX.click();
  hideScreen('confirmBox');
  if (_cfYes) { const f = _cfYes; _cfYes = null; f(); }
});

/* ---------------------- ۵-۷) هوک‌های به‌روزرسانی/رندر ---------------------- */
/* ماژول‌های نسخه‌ی ۱۰ منطق اضافه‌ی خودشان را این‌جا ثبت می‌کنند تا update/render
   اصلی فقط دو خط هوک داشته باشند */
const UPDATE_HOOKS = [];
const RENDER_HOOKS = [];
function hooksUpdate(dt) { for (const f of UPDATE_HOOKS) f(dt); }
function hooksRender() { for (const f of RENDER_HOOKS) f(); }

/* هوک فصل‌ها: تایمر کارت فصل */
UPDATE_HOOKS.push(function chaptersUpdate(dt) {
  if (state.cardT > 0) {
    state.cardT -= dt;
    if (state.cardT <= 0) hideChapterCard();
  }
});

/* ---------------------- ۵-۸) افق‌های جدید: انبارها و کوهستان ---------------------- */
/* افق صنعتیِ فصل ۲: انبارهای جعبه‌ای + جرثقیل + دودکش + چراغ‌های سدیم */
const WH_SKYLINE = [];
{
  let x = -10;
  while (x < W + 10) {
    const bw = 66 + srand() * 88, bh = 34 + srand() * 62;
    WH_SKYLINE.push({ x, w: bw, h: bh, win: 2 + Math.floor(srand() * 4), stack: srand() > 0.72, lamp: srand() > 0.5 });
    x += bw + 16;
  }
}
function drawWarehouseSkyline(d) {
  const body = mixHex('#0d141c', '#7d8a96', d);
  const edge = mixHex('#18222e', '#9aa8b4', d);
  for (const b of WH_SKYLINE) {
    ctx.fillStyle = body;
    ctx.fillRect(b.x, GROUND_Y - b.h, b.w, b.h);
    ctx.fillStyle = edge;                                     // لبه‌ی بام ساده (شیب‌دار)
    ctx.beginPath();
    ctx.moveTo(b.x - 4, GROUND_Y - b.h); ctx.lineTo(b.x + b.w / 2, GROUND_Y - b.h - 9);
    ctx.lineTo(b.x + b.w + 4, GROUND_Y - b.h); ctx.closePath(); ctx.fill();
    /* پنجره‌های نواری روشن (شب) */
    if (d < 0.95) {
      const nf = 1 - d;
      ctx.fillStyle = 'rgba(255,196,110,' + (0.5 * nf).toFixed(2) + ')';
      for (let i = 0; i < b.win; i++) {
        ctx.fillRect(b.x + 8 + i * ((b.w - 16) / b.win), GROUND_Y - b.h + 12, (b.w - 16) / b.win - 8, 5);
      }
    }
    /* دودکش یکی‌یکی */
    if (b.stack) {
      ctx.fillStyle = body;
      ctx.fillRect(b.x + b.w * 0.7, GROUND_Y - b.h - 22, 9, 26);
      ctx.fillStyle = edge;
      ctx.fillRect(b.x + b.w * 0.7 - 2, GROUND_Y - b.h - 24, 13, 4);
    }
    /* چراغ سدیم نارنجی روی بام (شب) */
    if (b.lamp && d < 0.7) {
      const lx = b.x + 10, ly = GROUND_Y - b.h - 4;
      const blink = 0.75 + 0.25 * Math.sin(animTime * 2.2 + b.x);
      ctx.strokeStyle = mixHex('#18222e', '#5a6570', d); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, ly - 10); ctx.lineTo(lx + 8, ly - 10); ctx.stroke();
      const g2 = ctx.createRadialGradient(lx + 8, ly - 8, 1, lx + 8, ly - 8, 16);
      g2.addColorStop(0, 'rgba(255,170,80,' + (0.5 * blink * (1 - d)).toFixed(2) + ')');
      g2.addColorStop(1, 'rgba(255,170,80,0)');
      ctx.fillStyle = g2; circle(lx + 8, ly - 8, 16);
      ctx.fillStyle = 'rgba(255,200,120,' + (blink * (1 - d)).toFixed(2) + ')';
      circle(lx + 8, ly - 8, 2);
    }
  }
  /* مه غلیظ پایه‌ی انبارها */
  const fog = ctx.createLinearGradient(0, GROUND_Y - 60, 0, GROUND_Y);
  fog.addColorStop(0, 'rgba(140,160,175,0)');
  fog.addColorStop(1, 'rgba(140,160,175,' + (d > 0.5 ? 0.30 * d : 0.34 * (1 - d)).toFixed(2) + ')');
  ctx.fillStyle = fog;
  ctx.fillRect(-20, GROUND_Y - 60, W + 40, 60);
}

/* افق کوهستانی فصل ۴: قله‌های برفی + دکل مخابراتی بزرگ با چراغ قرمز */
const MT_PEAKS = [];
{
  let x = -30;
  while (x < W + 30) {
    const pw = 120 + srand() * 130, ph = 90 + srand() * 110;
    MT_PEAKS.push({ x, w: pw, h: ph });
    x += pw * 0.62;
  }
}
function drawMountainSkyline(d) {
  /* دو ردیف قله برای عمق */
  ctx.fillStyle = mixHex('#0e1626', '#8fa6bd', d);
  ctx.beginPath(); ctx.moveTo(-20, GROUND_Y);
  for (const p of MT_PEAKS) {
    ctx.lineTo(p.x + p.w * 0.5, GROUND_Y - p.h * 0.72);
    ctx.lineTo(p.x + p.w, GROUND_Y - p.h * 0.3);
  }
  ctx.lineTo(W + 20, GROUND_Y); ctx.closePath(); ctx.fill();
  /* برف‌گیر قله‌ها */
  ctx.fillStyle = mixHex('#2c3f5e', '#e8f0f8', d);
  ctx.beginPath(); ctx.moveTo(-20, GROUND_Y);
  for (const p of MT_PEAKS) {
    ctx.lineTo(p.x + p.w * 0.5, GROUND_Y - p.h * 0.72);
    ctx.lineTo(p.x + p.w * 0.62, GROUND_Y - p.h * 0.5);
  }
  ctx.lineTo(W + 20, GROUND_Y); ctx.closePath(); ctx.fill();
  /* دکل مخابراتی بزرگ (پس‌زمینه‌ی فصل ۴) — شبکه‌ای با چراغ قرمز چشمک‌زن */
  const mx = 780, mtop = GROUND_Y - 208, mbase = GROUND_Y - 4;
  ctx.strokeStyle = mixHex('#1a2438', '#6a7a92', d); ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(mx - 34, mbase); ctx.lineTo(mx - 8, mtop);
  ctx.moveTo(mx + 34, mbase); ctx.lineTo(mx + 8, mtop);
  for (let i = 0; i < 6; i++) {                 // مهاربندهای X
    const t = i / 6, t2 = (i + 1) / 6;
    const w1 = 34 - 26 * t, w2 = 34 - 26 * t2;
    const y1 = mbase - (mbase - mtop) * t, y2 = mbase - (mbase - mtop) * t2;
    ctx.moveTo(mx - w1, y1); ctx.lineTo(mx + w2, y2);
    ctx.moveTo(mx + w1, y1); ctx.lineTo(mx - w2, y2);
  }
  ctx.moveTo(mx - 20, mtop + 46); ctx.lineTo(mx + 20, mtop + 46);
  ctx.moveTo(mx - 12, mtop + 12); ctx.lineTo(mx + 12, mtop + 12);
  ctx.stroke();
  ctx.fillStyle = mixHex('#1a2438', '#6a7a92', d);
  ctx.fillRect(mx - 11, mtop + 6, 22, 8);       // سکوی آنتن
  ctx.strokeStyle = mixHex('#243450', '#7d8ca2', d);
  ctx.beginPath(); ctx.moveTo(mx - 6, mtop + 6); ctx.lineTo(mx - 6, mtop - 26);
  ctx.moveTo(mx + 6, mtop + 6); ctx.lineTo(mx + 6, mtop - 20); ctx.stroke();
  if (d < 0.8) {                                // چراغ قرمز هشدار
    const blink = Math.sin(animTime * 2.4) > 0.2 ? 1 : 0.1;
    const aa = (1 - d * 0.7) * blink;
    const g2 = ctx.createRadialGradient(mx - 6, mtop - 26, 1, mx - 6, mtop - 26, 12);
    g2.addColorStop(0, 'rgba(255,70,60,' + (0.9 * aa).toFixed(2) + ')');
    g2.addColorStop(1, 'rgba(255,70,60,0)');
    ctx.fillStyle = g2; circle(mx - 6, mtop - 26, 12);
    ctx.fillStyle = 'rgba(255,120,110,' + aa.toFixed(2) + ')';
    circle(mx - 6, mtop - 26, 2);
  }
}

/* ---------------------- ۵-۹) اسباب‌متعلقات صحنه‌ی هر فصل ---------------------- */
/* جعبه‌ها/بشکه‌های انبار، کیسه‌شن و خودروی سوخته‌ی پاسگاه، تل‌های برف قله */
function drawChapterProps() {
  const th = curCh().theme;
  const d = state.dayness;
  if (th.props === 'warehouse') {
    /* بشکه‌های زنگاری + جعبه‌های چوبی کنار برج */
    for (const bx of [122, 176, 794, 848]) {
      ctx.fillStyle = mixHex('#3a3038', '#7d6a70', d);
      rr(bx, GROUND_Y - 20, 13, 20, 3); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(bx, GROUND_Y - 13, 13, 2.5);
      ctx.fillStyle = mixHex('#22262e', '#5a6270', d);
      ctx.fillRect(bx - 1, GROUND_Y - 22, 15, 3);
    }
    ctx.fillStyle = mixHex('#3d3020', '#8a7452', d);
    rr(300, GROUND_Y - 16, 26, 16, 2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1.4;
    ctx.strokeRect(300, GROUND_Y - 16, 26, 16);
    ctx.beginPath(); ctx.moveTo(300, GROUND_Y - 8); ctx.lineTo(326, GROUND_Y - 8); ctx.stroke();
  } else if (th.props === 'military') {
    /* کیسه‌های شن دو طرف پایه‌ی برج */
    ctx.fillStyle = mixHex('#5a5544', '#a89f84', d);
    const bags = [[-92, -13], [-80, -13], [-86, -24], [70, -13], [82, -13], [76, -24]];
    for (const [dx, dy] of bags) {
      ctx.beginPath();
      ctx.ellipse(TOWER.x + dx, GROUND_Y + dy, 9, 5.5, dx < 0 ? 0.3 : -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1; ctx.stroke();
    }
    /* خودروی زرهی سوخته در راست صحنه */
    const vx = 828, vy = GROUND_Y - 6;
    ctx.fillStyle = mixHex('#2c3038', '#5f6870', d);
    rr(vx, vy - 20, 72, 20, 6); ctx.fill();
    rr(vx + 16, vy - 30, 34, 12, 4); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    circle(vx + 16, vy - 2, 7); circle(vx + 56, vy - 2, 7);
    ctx.strokeStyle = mixHex('#3a4048', '#7d8890', d); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(vx + 50, vy - 30); ctx.lineTo(vx + 58, vy - 44); ctx.stroke();
    /* زبانه‌ی آتش کوچک از موتور (شب) */
    if (d < 0.6 && Math.sin(animTime * 7) > 0) {
      ctx.fillStyle = 'rgba(255,140,60,0.5)';
      circle(vx + 8, vy - 22, 3 + Math.sin(animTime * 11) * 1.5);
    }
  } else if (th.props === 'telecom') {
    /* تل‌های برف کنار برج + سیم‌های آویخته */
    for (const sx of [130, 240, 760, 860]) {
      ctx.fillStyle = mixHex('#3c4a60', '#d4e2ef', d);
      ctx.beginPath();
      ctx.ellipse(sx, GROUND_Y + 2, 30, 9, 0, Math.PI, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(sx, GROUND_Y + 2, 18, 5, 0, Math.PI, Math.PI * 2); ctx.fill();
    }
  }
  /* صحنه‌ی فاز ۱ انتقال فصل‌ها: درِ سردابه (فصل ۲) / دکل زیپ‌لاین (فصل ۳) */
  if (state.mode === 'transition' && TR && TR.phase === 1) drawTransitionIntroProps();
}

/* ---------------------- ۵-۱۰) آب‌وهوای فصل: مه روان و برف ---------------------- */
const FOG_BLOBS = Array.from({ length: 9 }, () => ({
  x: srand() * (W + 300), y: 70 + srand() * (GROUND_Y - 200),
  s: 0.8 + srand() * 1.5, v: 4 + srand() * 8, a: 0.05 + srand() * 0.06,
}));
const SNOW_FLAKES = Array.from({ length: 90 }, () => ({
  x: srand() * W, y0: srand() * H, v: 22 + srand() * 42,
  sw: 0.5 + srand() * 1.1, ph: srand() * 6.28, r: 1 + srand() * 1.8,
}));

function drawChapterWeather() {
  const th = curCh().theme;
  const d = state.dayness;
  /* مهِ روان — انبارها (شب پررنگ‌تر) + یک نسخه‌ی آرام در منوی اصلی */
  const fogA = (state.mode === 'start' ? 0.55 : th.fog) * (1 - 0.55 * d);
  if (fogA > 0.02) {
    for (const f of FOG_BLOBS) {
      const m = W + 300;
      const x = (((f.x - animTime * f.v) % m) + m) % m - 150;
      ctx.fillStyle = 'rgba(168,188,203,' + Math.min(0.34, f.a * fogA * 2).toFixed(3) + ')';
      ctx.beginPath();
      ctx.ellipse(x, f.y, 95 * f.s, 20 * f.s, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  /* برف فصل ۴ — با بادِ جانبی و رگبار باران‌گونه */
  if (th.snow) {
    for (const f of SNOW_FLAKES) {
      const m = W + 40;
      const x = (((f.x - animTime * 13) % m) + m) % m - 20 + Math.sin(animTime * f.sw + f.ph) * 16;
      const y = (f.y0 + animTime * f.v) % (H + 24) - 12;
      const a = 0.5 + 0.4 * (1 - d * 0.5);
      ctx.fillStyle = 'rgba(235,244,252,' + a.toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(x, y, f.r, 0, Math.PI * 2); ctx.fill();
    }
  }
}

/* پارالاکس ملایم منو: افق/تپه‌ها کمی با ماوس جابه‌جا می‌شوند (۱۰٫۰) */
function menuPar(k) {
  if (state.mode !== 'start') return 0;
  return (state.mouse.x - W / 2) / W * k;
}
