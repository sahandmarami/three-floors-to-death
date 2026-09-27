/* ==================================================================
   سه طبقه تا بقا — نسخه‌ی ۷٫۰ — بخش ۴: رویداد داستانی «فروریختن برج»
   ==================================================================
   بعد از پاک‌سازی موج ۵ و پیش از موج ۶، یک کات‌سین کوتاه پخش می‌شود:
     ۱) لرزش شدید صحنه + ترک خوردن برج (غرش + ترک‌های پیش‌رونده)
     ۲) فروریختن طبقه‌ی اول و دوم با انفجار آجر/چوب و توده‌ی آوار
     ۳) سقوط بازیکن از بام با فیزیک ساده (افتادن + چرخش تدریجی)
     ۴) ورود ماشینِ دوستِ راننده از چپ صحنه؛ بازیکن روی ماشین می‌نشیند
     ۵) ماشین از میان زامبی‌های مانع‌شده رد می‌شود (کنارشان می‌پراند)
        و صحنه را ترک می‌کند + «هدیه‌ی راننده» (سکه + آنلاک زودهنگام سلاح)
     ۶) محو به سیاهی + «به موقعیت جدید رسیدید...» / «برج بعدی»
     ۷) بازگشت صحنه با برج دوم (رنگ‌بندی متفاوت) و پس‌زمینه‌ی شهر سوخته
   قواعد گیم‌پلی:
     - جون، سکه، سلاح‌ها، ارتقاها و برجک‌ها دقیقاً حفظ می‌شوند
     - موج‌های ۶ تا ۱۰ روی برج جدید با همان منطق سختی ادامه می‌یابند
     - کات‌سین با دکمه‌ی «رد کردن» گوشه‌ی صفحه قابل عبور است
   جزئیات فنی:
     - همه‌چیز فقط با Canvas و شکل‌های ساده رسم می‌شود (بدون تصویر خارجی)
     - playTowerCollapseCutscene پارامتری است تا برای فصل‌های بعدی
       (برج سوم/چهارم...) هم قابل استفاده باشد
   ================================================================== */

/* ---------------------- ۱۷) رویداد داستانی ---------------------- */

/* موجی که بعد از پایانش کات‌سین پخش می‌شود */
const CUTSCENE_AFTER_WAVE = 5;

/* زمان‌بندی مراحل کات‌سین (ثانیه) — همه‌ی حرکت‌ها از t محاسبه می‌شوند
   تا پرش/تست زمانی (csGoto) دقیق و قطعی باشد */
const CS_T = {
  shakeEnd: 1.8,      // پایان لرزش/ترک‌خوردن
  colEnd: 3.2,        // پایان فروریختن طبقه‌ی ۱ و ۲
  chunkDrop: 3.25,    // شروع سقوط تخته‌بام (طبقه‌ی ۳)
  chunkDur: 0.7,      // مدت سقوط تخته‌بام
  playerDrop: 3.5,    // جدایی بازیکن از بامِ در حال سقوط
  fallDur: 1.15,      // مدت سقوط سینمایی بازیکن
  carEnter: 3.25,     // ورود ماشین از لبه‌ی چپ
  carSpd: 450,        // سرعت ماشین (px/s)
  catchDX: 14,        // جای بازیکن روی ماشین (نسبت به مرکز ماشین)
  giftT: 5.2,         // لحظه‌ی دادن هدیه‌ی راننده
  fadeOut: 6.3,       // شروع محو به سیاهی
  fadeDur: 0.9,       // مدت محو
  black: 7.2,         // سیاهی کامل
  switchT: 8.1,       // تعویض صحنه در دلِ سیاهی (برج دوم + شهر سوخته)
  fadeIn: 8.5,        // شروع بازگشت صحنه‌ی جدید
  fadeInDur: 1.0,     // مدت بازگشت
  end: 9.7,           // پایان کات‌سین → روزِ برج جدید
};

/* زیرنویس‌های کات‌سین: [شروع، پایان، متن] */
const CS_CAPS = [
  [0.30, 1.70, 'زمین می‌لرزد... برج دارد ترک می‌خورد!'],
  [1.95, 3.05, 'طبقه‌ها فرو می‌ریزند!'],
  [4.72, 5.15, 'رسیدی! سوار شو'],
];

/* --- پوسته‌های برج (۷٫۰): برج اول و برج دومِ شهر سوخته ---
   drawTower این رنگ‌ها را می‌خواند؛ اندازه‌ی برج در هر دو یکی است. */
const TOWER_SKINS = [
  { /* برج اول — سنگی/آجری/آبی (ظاهر اصلی بازی) */
    floors: [
      { light: '#82705a', base: '#6e5a44', dark: '#4d3f2f', edge: '#453a2c' },
      { light: '#b25a47', base: '#a04b3a', dark: '#7c3527', edge: '#6e2f24' },
      { light: '#4f83b5', base: '#41729f', dark: '#2f557c', edge: '#2a4b6b' },
    ],
    plinth: ['#3f362b', '#8c7f6a'], batt: ['#33557e', '#5c8ac0'],
    flag: '#d8453a', flagMark: '#f7c948',
    banner: ['#a12a20', '#c23a2c'], bannerMark: '#7a1f18',
    doorFrame: ['#8a7a5e', '#bfae8e'], pole: ['#4a3b2a', '#7a6244'],
  },
  { /* برج دوم — سنگ‌خزه/فیروزه/زرشکی (پس از کات‌سین، در شهر سوخته) */
    floors: [
      { light: '#6b7a5e', base: '#57644b', dark: '#3e4835', edge: '#39422e' },
      { light: '#3f8d86', base: '#357871', dark: '#265a55', edge: '#22504b' },
      { light: '#9c4252', base: '#873644', dark: '#692934', edge: '#5f2530' },
    ],
    plinth: ['#2e2a24', '#6e675c'], batt: ['#274f4a', '#4d8a82'],
    flag: '#3f8d86', flagMark: '#ffd873',
    banner: ['#274f4a', '#3f8d86'], bannerMark: '#173b37',
    doorFrame: ['#5a5446', '#8f8871'], pole: ['#3a3529', '#615a48'],
  },
];

/* --- شهر سوخته‌ی برج دوم: آسمان‌خراش‌های با لبه‌ی شکسته + کانون‌های آتش ---
   با همان تولیدکننده‌ی seed دارِ صحنه ساخته می‌شود تا همیشه یکسان باشد */
const RUIN_SKYLINE = [];
const RUIN_FIRES = [];
const RUIN_WINS = [];                       // پنجره‌های شکسته/سوخته‌ی ساختمان‌ها
{
  let x = -14;
  while (x < W + 14) {
    const bw = 40 + srand() * 58, bh = 30 + srand() * 100;
    const notch = [];                      // دندانه‌های لبه‌ی فروریخته‌ی بام
    const nn = 1 + Math.floor(srand() * 3);
    for (let i = 0; i < nn; i++) {
      notch.push({ dx: 5 + srand() * (bw - 22), w: 8 + srand() * 14, d: 13 + srand() * 30 });
    }
    RUIN_SKYLINE.push({ x, w: bw, h: bh, notch });
    /* پنجره‌های شکسته: تیره + چند نورافکن نارنجیِ آتش */
    const wn = 2 + Math.floor(srand() * 4);
    for (let i = 0; i < wn; i++) {
      RUIN_WINS.push({
        x: x + 5 + srand() * (bw - 12), y: GROUND_Y - bh + 8 + srand() * (bh - 20),
        lit: srand() > 0.72, ph: srand() * 6.28,
      });
    }
    /* چند کانون آتشِ دودکن روی ساختمان‌های بلندتر (۷٫۰: پررنگ و خوانا) */
    if (bh > 45 && srand() > 0.35 && RUIN_FIRES.length < 6) {
      RUIN_FIRES.push({ x: x + 9 + srand() * (bw - 18), y: GROUND_Y - bh + 6 + srand() * 22, ph: srand() * 6.28 });
    }
    x += bw + 9;
  }
}

/* توده‌ی آوار برج (قطعات پیش‌محاسبه‌شده برای رسم سریع) */
const RUBBLE_PTS = [];
for (let i = 0; i < 30; i++) RUBBLE_PTS.push({
  dx: (srand() * 2 - 1) * 74,
  dy: srand() * 30,
  w: 5 + srand() * 14, h: 4 + srand() * 9,
  rot: (srand() * 2 - 1) * 0.7,
  col: ['#6e5a44', '#8a6f52', '#4d3f2f', '#b25a47', '#9c8a6d'][Math.floor(srand() * 5)],
});

/* ترک‌های پیش‌فرض برج حین کات‌سین: نقاط نسبی به (TOWER.x, GROUND_Y) */
const TOWER_CRACKS = [
  { pts: [[-44, -16], [-33, -30], [-40, -46], [-27, -60], [-31, -74]] },
  { pts: [[46, -20], [37, -36], [45, -50]] },
  { pts: [[-38, -84], [-28, -96], [-36, -112], [-24, -126]] },
  { pts: [[40, -80], [30, -94], [38, -108], [26, -122]] },
  { pts: [[2, -88], [-4, -102], [3, -116]] },
];

/* --- صداهای کات‌سین (با همان موتور Web Audio بازی) --- */
Object.assign(SFX, {
  csRumble() { if (!sfxGate('csRumble', 420)) return;
    Snd.noise({ dur: 0.5, vol: 0.16, freq: 95, q: 0.5 });
    Snd.tone({ type: 'sine', f0: 46, f1: 30, dur: 0.5, vol: 0.2 }); },
  csCrack()  { Snd.noise({ dur: 0.1, vol: 0.2, ftype: 'highpass', freq: 1900 });
    Snd.tone({ type: 'square', f0: 850, f1: 190, dur: 0.09, vol: 0.09 }); },
  csBoom()   { Snd.noise({ dur: 1.1, vol: 0.38, freq: 170, q: 0.4 });
    Snd.tone({ type: 'sine', f0: 72, f1: 26, dur: 1.0, vol: 0.38 }); },
  csLand()   { Snd.noise({ dur: 0.35, vol: 0.3, freq: 150, q: 0.5 });
    Snd.tone({ type: 'sine', f0: 62, f1: 28, dur: 0.4, vol: 0.3 }); },
  csWhistle(){ Snd.tone({ type: 'sine', f0: 1450, f1: 300, dur: 1.0, vol: 0.06 }); },
  csEngine() { if (!sfxGate('csEngine', 300)) return;
    Snd.tone({ type: 'sawtooth', f0: 92, f1: 118, dur: 0.2, vol: 0.08 });
    Snd.noise({ dur: 0.18, vol: 0.04, freq: 420 }); },
  csThud()   { Snd.noise({ dur: 0.15, vol: 0.22, freq: 230 });
    Snd.tone({ type: 'sine', f0: 95, f1: 40, dur: 0.16, vol: 0.18 }); },
  csGift()   { [660, 880, 1320].forEach((f, i) =>
    Snd.tone({ type: 'triangle', f0: f, dur: 0.16, vol: 0.12, delay: i * 0.08 })); },
});

/* --- وضعیت اجرای کات‌سین (null = کات‌سینی در جریان نیست) ---
   draw: داده‌های رندر لحظه‌ای که drawTower/drawPlayer می‌خوانند */
let CS = null;

/* شروع کات‌سین «فروریختن برج» — تابع پارامتری برای استفاده در فصل‌های بعدی:
   opts.afterWave  موجِ مقدمه‌ی رویداد
   opts.variant    شماره‌ی پوسته‌ی برج بعدی (پیش‌فرض ۱)
   opts.gift       { coins, weapon } هدیه‌ی راننده‌ی ماشین */
function playTowerCollapseCutscene(opts = {}) {
  if (CS) return;                            // کات‌سین دیگری در جریان است
  CS = {
    t: 0, paused: false,
    afterWave: opts.afterWave || CUTSCENE_AFTER_WAVE,
    variant: opts.variant !== undefined ? opts.variant : 1,
    gift: opts.gift || { coins: 80, weapon: 'shotgun' },
    giftApplied: false, giftText: '', giftTextShown: false,
    boomed: false, chunkHit: false, caught: false, whistled: false,
    switched: false, bursts: 0,
    zombies: [], car: null, fade: 0,
    draw: {
      floors: [{ a: 1, dy: 0, rot: 0 }, { a: 1, dy: 0, rot: 0 }, { a: 1, dy: 0, rot: 0 }],
      cracks: 0, rubble: 0, player: null,
    },
  };
  state.mode = 'cutscene';
  state.mouse.down = false;
  state.placing = null;
  state.slowmo = 0;
  state.powerTimers = { rapid: 0, freeze: 0 };
  /* سکه‌ها/جعبه‌های معلق صحنه بلافاصله جمع شوند (پاداش موج نمی‌باید گم شود) */
  for (const c of state.coinsArr) collectCoin(c);
  state.coinsArr = [];
  state.powerups = [];
  hideDayPanel();
  hideAnnounce();
  setBuildPanel(true, true);                 // پنل جمع: حالت سینمایی
  $('wrap').classList.add('cs-mode');        // نوار سلاح/پنل‌ها مخفی (CSS)
  $('skipCs').classList.remove('hidden');    // دکمه‌ی «رد کردن»
  /* زامبی‌های ول‌گردِ صحنه — همان‌ها که بعداً جلوی ماشین را می‌گیرند */
  const spawns = [
    { type: 'normal', x: 70 }, { type: 'fast', x: 215 }, { type: 'normal', x: 335 },
    { type: 'normal', x: 645 }, { type: 'fast', x: 760 }, { type: 'tank', x: 845 },
    { type: 'normal', x: 940 },
  ];
  for (const s of spawns) {
    const T = ZTYPES[s.type];
    CS.zombies.push({
      type: s.type, x: s.x, y: GROUND_Y + 14, dir: s.x < TOWER.x ? 1 : -1,
      radius: T.r, speed: T.spdBase * 0.55, hp: 10, maxHp: 10,
      walkPhase: rand(0, 6.28), attacking: false, attackAnim: 0,
      attackSide: 0, lane: 0, depth: 1.06, yJit: rand(-2, 2), stagger: 0,
      chill: 0, hitFlash: 0, dead: false, deathT: 0,
      /* فیلدهای مخصوص کات‌سین: */
      hit: false, vx: 0, vy: 0, vr: 0, rot: 0, landed: false,
      groundY: GROUND_Y + 14,
    });
  }
  SFX.csRumble();
  updateHUD();
}

/* برخورد ماشین با زامبی مانع: پرتاب به جلو و بالا + خون + لرزش */
function csKnockZombie(z) {
  z.hit = true;
  z.vx = CS_T.carSpd * 0.72 + rand(0, 90);
  z.vy = -rand(300, 430);
  z.vr = rand(6, 11) * (Math.random() < 0.5 ? -1 : 1);
  if (CS && CS.car) CS.car.kick = 1;
  state.shake = Math.max(state.shake, 3.5);
  SFX.csThud();
  spawnParticles(z.x, z.y - 16, 10, '#7a2f2f', { speed: 160, life: 0.5, size: 2.6, grav: 500 });
  spawnParticles(z.x, z.y - 16, 6, '#5f8f3e', { speed: 130, life: 0.45, size: 2.2, grav: 500 });
}

/* موج انفجار آجر/چوب حین فروریختن طبقه‌ها (۷٫۰: درشت + جرقه‌های درخشان + غبار) */
function csBrickBurst(i) {
  const fy = i < 2 ? GROUND_Y - rand(10, 60) : GROUND_Y - rand(72, 130);
  const cols = ['#a58a68', '#7d6a4f', '#c46a54', '#5d4c39', '#d9c49b'];
  spawnParticles(TOWER.x + rand(-58, 58), fy, 26, cols[Math.floor(rand(0, 5))],
    { speed: rand(180, 320), life: rand(0.8, 1.2), size: rand(4, 6.5), grav: 600 });
  /* جرقه‌های درخشان (روشن و قابل‌دید در تاریکی) */
  for (let k = 0; k < 7; k++) {
    const a = rand(0, Math.PI * 2), sp = rand(140, 330);
    state.particles.push({
      x: TOWER.x + rand(-56, 56), y: fy,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 80,
      age: 0, life: rand(0.5, 0.9), size: rand(1.6, 2.6),
      color: Math.random() < 0.5 ? '#ffca6e' : '#ff9a4d', grav: 560, glow: true,
    });
  }
  /* ابر غبار نرمِ همره (دایره‌های بزرگِ نیمه‌شفاف) */
  for (let k = 0; k < 5; k++) {
    state.particles.push({
      x: TOWER.x + rand(-64, 64), y: fy - rand(4, 34),
      vx: rand(-46, 46), vy: rand(-75, -22),
      age: 0, life: rand(0.9, 1.5), size: rand(9, 17),
      color: 'rgba(172,152,122,0.30)', grav: -10,
    });
  }
  SFX.csCrack();
}

/* هدیه‌ی راننده: سکه‌ی اضافه + آنلاک زودهنگام سلاح (idempotent) */
function cutsceneApplyGift() {
  if (!CS || CS.giftApplied) return;
  CS.giftApplied = true;
  const g = CS.gift;
  state.coins += g.coins;
  state.stats.earned += g.coins;
  let extra = '';
  if (g.weapon && !WEAPONS[g.weapon].owned) {
    WEAPONS[g.weapon].owned = true;
    extra = ' + ' + WEAPONS[g.weapon].name;
  } else if (!WEAPONS.shotgun.owned) {
    WEAPONS.shotgun.owned = true;
    extra = ' + ' + WEAPONS.shotgun.name;
  } else if (!WEAPONS.mg.owned) {
    WEAPONS.mg.owned = true;
    extra = ' + ' + WEAPONS.mg.name;
  }
  CS.giftText = 'هدیه‌ی راننده: +' + faNum(g.coins) + ' سکه' + extra;
  SFX.csGift();
  pulseCoins();
  refreshWeaponBar();
  refreshBuildPanel();
  updateHUD();
}

/* پایان کات‌سین: ورود به «روزِ برج جدید» — همه‌ی پیشرفت‌ها حفظ شده‌اند */
function cutsceneFinish() {
  if (!CS) return;
  cutsceneApplyGift();                       // اطمینان: هدیه حتماً داده شود
  const giftSub = CS.giftText;
  const variant = CS.variant;
  CS = null;
  state.mode = 'day';
  state.towerVariant = variant;              // برج دوم + شهر سوخته
  state.cutsceneDone = true;
  state.dayTarget = 1;
  state.dayness = Math.max(state.dayness, 0.85);
  $('wrap').classList.remove('cs-mode');
  $('skipCs').classList.add('hidden');
  hideAnnounce();
  showDayPanel();                            // «شب شود — موج ۶»
  setBuildPanel(false, true);
  $('bpHead').classList.add('attention');
  setAnnounce('🌅 برج بعدی!',
    giftSub + ' — موج ' + faNum(state.wave + 1) + ' در راه است', 3.4);
  SFX.morning();
  updateHUD();
}

/* رد کردن کات‌سین — دکمه‌ی گوشه‌ی صفحه (برای بازی‌های دوباره) */
function skipCutscene() {
  if (!CS) return;
  SFX.click();
  cutsceneFinish();
}

/* ریست کامل حالت کات‌سین (مثلاً هنگام شروع مجدد بازی) */
function cutsceneHardReset() {
  CS = null;
  $('skipCs').classList.add('hidden');
  $('wrap').classList.remove('cs-mode');
}

/* ------------------ به‌روزرسانی کات‌سین (هر فریم) ------------------ */
function updateCutscene(dt) {
  if (!CS || CS.paused) return;
  const cs = CS;
  const t = (cs.t += dt);
  const D = cs.draw;

  /* زوال جلوه‌های عمومی */
  state.shake = Math.max(0, state.shake - dt * 22);
  state.flash = Math.max(0, state.flash - dt * 2.2);

  /* ---- مرحله ۱: لرزش شدید + ترک‌خوردن پیش‌رونده ---- */
  if (t < CS_T.shakeEnd) {
    D.cracks = t / CS_T.shakeEnd;
    state.shake = 7 + 6 * Math.abs(Math.sin(t * 18));
    if (Math.random() < dt * 20) {           // گردوغاک چکه‌کن از ترک‌ها
      spawnParticles(TOWER.x + rand(-52, 52), GROUND_Y - rand(20, 120), 1, '#9c8a6d',
        { speed: 40, life: 0.7, size: 1.8, grav: 300 });
    }
    SFX.csRumble();
    if (Math.random() < dt * 1.5) SFX.csCrack();
  }

  /* ---- مرحله ۲: فروریختن طبقه‌ی اول و دوم (آجر/چوب) ---- */
  else if (t < CS_T.colEnd) {
    const p = clamp((t - CS_T.shakeEnd) / (CS_T.colEnd - CS_T.shakeEnd), 0, 1);
    if (!cs.boomed) { cs.boomed = true; SFX.csBoom(); state.shake = 14; }
    D.cracks = 1;
    D.floors[0].a = clamp(1 - p * 1.5, 0, 1);      // طبقه‌ی اول: فرورفتن و محو
    D.floors[0].dy = p * p * 46;
    D.floors[0].rot = p * 0.05;
    const p2 = clamp((p - 0.12) / 0.88, 0, 1);     // طبقه‌ی دوم: کمی دیرتر
    D.floors[1].a = clamp(1 - p2 * 1.5, 0, 1);
    D.floors[1].dy = p2 * p2 * 56;
    D.floors[1].rot = -p2 * 0.06;
    D.rubble = clamp(p * 0.55, 0, 0.55);           // توده‌ی آوار رشد می‌کند
    state.shake = Math.max(state.shake, 5 + 7 * (1 - p));
    /* موج‌های انفجار آجر در چهار آستانه‌ی پیشرفت */
    const bn = [0.04, 0.3, 0.6, 0.9].filter(b => p >= b).length;
    while (cs.bursts < bn) { csBrickBurst(cs.bursts); cs.bursts++; }
  }

  /* ---- مرحله ۳: سقوط تخته‌بام (طبقه‌ی سوم) و خرد شدن روی زمین ---- */
  const cf = clamp((t - CS_T.chunkDrop) / CS_T.chunkDur, 0, 1);
  if (cf > 0 && t < CS_T.fadeOut) {
    if (cf < 1) {
      D.floors[2].a = 1;
      D.floors[2].dy = cf * cf * (GROUND_Y - TOWER_TOP_Y - 22);   // سقوط شتاب‌دار
      D.floors[2].rot = -cf * 0.16;                               // کمی کج می‌شود
    } else if (!cs.chunkHit) {
      cs.chunkHit = true;
      D.floors[2].a = 0;                 // تخته‌بام خورد و در آوار رفت
      D.rubble = 1;
      state.shake = 12;
      SFX.csLand();
      spawnParticles(TOWER.x, GROUND_Y - 10, 26, '#8a6f52', { speed: 240, life: 0.8, size: 3.4, grav: 560, up: true });
      spawnParticles(TOWER.x, GROUND_Y - 4, 18, '#6e5a44', { speed: 170, life: 1.2, size: 4.2, grav: 260, up: true });
    }
  }

  /* ---- ماشین نجات: ورود سریع از چپ، عبور از میان زامبی‌ها ---- */
  if (t >= CS_T.carEnter && t < CS_T.fadeOut + 0.6) {
    if (!cs.car) {
      cs.car = { x: -160, y: GROUND_Y + 14, spin: 0, kick: 0, hand: 1.4 };
      SFX.csEngine();
    }
    /* حرکت قطعی از زمان (قابل تست و پرش زمانی) */
    cs.car.x = -160 + CS_T.carSpd * (t - CS_T.carEnter);
    cs.car.spin += (CS_T.carSpd / 13) * dt;
    cs.car.kick = Math.max(0, cs.car.kick - dt * 4);
    cs.car.hand = Math.max(0, cs.car.hand - dt);   // اول کار دست می‌دهد
    SFX.csEngine();
    if (Math.random() < dt * 26) {                 // دم اگزوز + غبار چرخ‌ها
      spawnParticles(cs.car.x - 80, cs.car.y - 8, 1, 'rgba(190,180,168,0.5)',
        { speed: 34, life: 0.55, size: 2.6, grav: -26, dir: Math.PI, spread: 0.7 });
    }
    /* تصادف ساده: هر زامبیِ جلوی مسیر کنار پرتاب می‌شود */
    for (const z of cs.zombies) {
      if (!z.hit && Math.abs(z.x - cs.car.x) < 76) csKnockZombie(z);
    }
  } else if (t >= CS_T.fadeOut + 0.6 && cs.car) {
    cs.car = null;                                 // ماشین صحنه را ترک کرد
  }

  /* ---- سقوط سینمایی بازیکن و نشستن روی ماشین ---- */
  const pf = clamp((t - CS_T.playerDrop) / CS_T.fallDur, 0, 1);
  if (pf > 0 && !cs.caught) {
    const y0 = TOWER_TOP_Y + 30;                   // لبه‌ی بامِ در حال سقوط
    const y1 = GROUND_Y + 14 - 54;                 // سقف ماشین
    D.player = {
      x: TOWER.x + 8 + pf * (CS_T.catchDX - 8),    // کمی به سمت ماشین می‌لغزد
      y: y0 + (y1 - y0) * pf * pf,                 // شتاب‌دار (جاذبه)
      rot: pf * 0.62,                              // چرخش تدریجی حین سقوط
      aim: -2.35,                                  // اسلحه بالا (چنگ زدن به هوا)
    };
    if (!cs.whistled) { cs.whistled = true; SFX.csWhistle(); }
    if (pf >= 1) {                                 // رسید به ماشین — سوار شد
      cs.caught = true;
      state.shake = 4;
      SFX.csThud();
      spawnParticles(D.player.x, D.player.y, 9, '#ffd873',
        { speed: 120, life: 0.5, size: 2.4, grav: 320, up: true });
    }
  }
  if (cs.caught && cs.car) {
    /* سوار شدن: بازیکن روی سقف ماشین، کمی به عقب خم (باد سرعت) */
    D.player = { x: cs.car.x + CS_T.catchDX, y: cs.car.y - 54, rot: -0.07, aim: -0.5 };
  }

  /* ---- هدیه‌ی راننده وسط راه ---- */
  if (t >= CS_T.giftT) {
    cutsceneApplyGift();
    if (CS && CS.car && CS.giftApplied && !cs.giftTextShown) {
      cs.giftTextShown = true;
      addText(cs.car.x, cs.car.y - 92, '🎁 +' + faNum(cs.gift.coins), '#ffd873', 17);
    }
  }

  /* ---- زامبی‌های صحنه: خزش به سمت برج یا فیزیک پرتاب ---- */
  for (const z of cs.zombies) {
    if (z.hit) {
      z.vy += 900 * dt;
      z.x += z.vx * dt; z.y += z.vy * dt; z.rot += z.vr * dt;
      if (z.y > z.groundY) {                       // فرود روی زمین
        z.y = z.groundY;
        if (!z.landed) {
          z.landed = true;
          addDecal(z.x, true);
          spawnParticles(z.x, z.y, 6, '#7a2f2f', { speed: 110, life: 0.4, size: 2.2, grav: 400 });
        }
        z.vx *= 0.8; z.vr = 0;
        z.rot += (Math.sign(z.rot || 1) * 1.45 - z.rot) * Math.min(1, dt * 9);   // خوابیدن صاف
      }
    } else {
      const dir = Math.sign(TOWER.x - z.x) || 1;
      if (Math.abs(TOWER.x - z.x) > 155) { z.x += dir * z.speed * dt; z.walkPhase += dt * 5; }
      else z.walkPhase += dt * 2.2;                // دور آوار جمع می‌شوند
    }
  }

  /* ---- محو به سیاهی / سیاهی / بازگشت صحنه ---- */
  cs.fade = t < CS_T.fadeOut ? 0
    : t < CS_T.black ? clamp((t - CS_T.fadeOut) / CS_T.fadeDur, 0, 1)
    : t < CS_T.fadeIn ? 1
    : clamp(1 - (t - CS_T.fadeIn) / CS_T.fadeInDur, 0, 1);

  /* تعویض صحنه در دلِ سیاهی: برج دوم + شهر سوخته + صحنه‌ی تمیز */
  if (t >= CS_T.switchT && !cs.switched) {
    cs.switched = true;
    state.towerVariant = cs.variant;
    state.cutsceneDone = true;
    state.dayness = 0.3;
    state.dayTarget = 1;                    // صبحِ شهر سوخته
    cs.zombies = [];
    state.particles = []; state.texts = []; state.zaps = []; state.decals = [];
    cs.car = null;
    D.floors = [{ a: 1, dy: 0, rot: 0 }, { a: 1, dy: 0, rot: 0 }, { a: 1, dy: 0, rot: 0 }];
    D.cracks = 0; D.rubble = 0; D.player = null;   // بازیکن روی برج جدید
  }

  /* ---- پایان کات‌سین → روزِ برج جدید ---- */
  if (t >= CS_T.end) { cutsceneFinish(); return; }

  /* ذرات/متن‌های کات‌سین همیشه جریان دارند */
  updateParticles(dt); updateTexts(dt); updateZaps(dt);
}

/* ------------------ رسم: ماشین نجات دوست راننده ------------------
   ماشین عضلانی نارنجی-قرمز با نوار مشکی، شیشه‌ی آبی، راننده‌ی کلاه‌دار،
   چراغ جلو با مخروط نور (شب)، چرخ‌های در حال چرخش و دنباله‌ی غبار. */
function drawCar(car) {
  ctx.save();
  ctx.translate(car.x, car.y);
  const b = Math.sin(animTime * 16) * 1.1 - car.kick * 3;   // نرمی تعلیق + ضربه‌ی تصادم
  /* سایه روی زمین */
  ctx.fillStyle = 'rgba(0,0,0,0.42)';
  ctx.beginPath(); ctx.ellipse(0, 4, 78, 10, 0, 0, Math.PI * 2); ctx.fill();
  /* چرخ‌ها (زیر بدنه) */
  for (const wx of [-48, 48]) {
    ctx.fillStyle = '#15181f'; circle(wx, -12, 13);
    ctx.fillStyle = '#3c4250'; circle(wx, -12, 7.5);
    ctx.strokeStyle = '#9aa3b5'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
    ctx.beginPath();
    for (let k = 0; k < 4; k++) {                // پره‌های در حال چرخش
      const a = car.spin + k * Math.PI / 2;
      ctx.moveTo(wx - Math.cos(a) * 3, -12 - Math.sin(a) * 3);
      ctx.lineTo(wx + Math.cos(a) * 6.5, -12 + Math.sin(a) * 6.5);
    }
    ctx.stroke();
    ctx.fillStyle = '#cfd6e4'; circle(wx, -12, 2.2);
  }
  ctx.translate(0, b);
  /* بدنه‌ی پایین — قرمز آتشین + نوار مسابقه‌ای مشکی */
  const bg = ctx.createLinearGradient(0, -30, 0, 0);
  bg.addColorStop(0, '#ff7a4d'); bg.addColorStop(0.5, '#e8563f'); bg.addColorStop(1, '#b23a30');
  ctx.fillStyle = bg; rr(-77, -26, 154, 24, 9); ctx.fill();
  ctx.fillStyle = 'rgba(20,16,20,0.9)'; rr(-77, -15, 154, 7, 3); ctx.fill();
  /* کابین + شیشه‌ها */
  ctx.fillStyle = '#c23a2c';
  ctx.beginPath();
  ctx.moveTo(-46, -26); ctx.lineTo(-34, -54); ctx.lineTo(26, -54); ctx.lineTo(44, -26);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(160,215,255,0.5)';
  ctx.beginPath();
  ctx.moveTo(-38, -28); ctx.lineTo(-29, -50); ctx.lineTo(20, -50); ctx.lineTo(34, -28);
  ctx.closePath(); ctx.fill();
  /* راننده (دوست ما): سر + کلاه + دست تکان‌دادن اول ورود */
  ctx.fillStyle = '#f0c49a'; circle(-8, -40, 5.5);
  ctx.fillStyle = '#2c3550';
  ctx.beginPath(); ctx.arc(-8, -41, 5.8, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillRect(-14, -41, 12, 2.4);               // لبه‌ی کلاه
  if (car.hand > 0) {
    ctx.strokeStyle = '#f0c49a'; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-2, -36);
    ctx.lineTo(-8 + Math.sin(animTime * 9) * 3, -50 - car.hand * 8);
    ctx.stroke();
  }
  /* اسپویلر عقب */
  ctx.fillStyle = '#8a2f26'; rr(-74, -61, 36, 5, 2); ctx.fill();
  ctx.fillStyle = '#3c4250';
  ctx.fillRect(-48, -57, 4, 8); ctx.fillRect(-70, -57, 4, 8);
  /* سپرهای کرومی + چراغ‌ها */
  ctx.fillStyle = '#cfd6e4'; rr(72, -15, 8, 8, 3); ctx.fill(); rr(-80, -15, 8, 8, 3); ctx.fill();
  ctx.fillStyle = '#ff5d4d'; rr(-79, -22, 5, 8, 2); ctx.fill();  // عقب
  ctx.fillStyle = '#fff3c4'; circle(74, -20, 4.5);               // جلو
  /* مخروط نور چراغ جلو (کات‌سین در شب است) */
  const hg = ctx.createLinearGradient(74, -20, 158, -14);
  hg.addColorStop(0, 'rgba(255,235,160,0.30)'); hg.addColorStop(1, 'rgba(255,235,160,0)');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.moveTo(74, -24); ctx.lineTo(158, -30); ctx.lineTo(158, -4); ctx.lineTo(74, -16);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

/* زامبی‌های کات‌سین: معمولی = همان رسم بازی؛ پرتاب‌شده = چرخشی + بدون سایه‌ی زمین */
function drawCsZombie(z) {
  if (!z.hit) { drawZombie(z); return; }
  ctx.save();
  ctx.translate(z.x, z.y - (z.landed ? 10 : 0));
  if (z.rot) ctx.rotate(z.rot);
  drawZombie(Object.assign({}, z, { x: 0, y: 0, noShadow: true, attacking: false }));
  ctx.restore();
}

/* توده‌ی آوار پایه‌ی برج (k = ۰..۱ اندازه‌ی توده) + غبار روی آن */
function drawRubble(k) {
  if (k <= 0.02) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, k * 1.2);
  ctx.translate(TOWER.x, GROUND_Y + 2);
  /* هسته‌ی توده + غبار فراگیر روی آن */
  ctx.fillStyle = 'rgba(58,48,36,0.92)';
  ctx.beginPath(); ctx.ellipse(0, 2, 74 * k, 16 * k + 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(160,140,110,' + (0.16 * k).toFixed(2) + ')';
  ctx.beginPath(); ctx.ellipse(0, -9 * k, 62 * k + 12, 30 * k + 6, 0, 0, Math.PI * 2); ctx.fill();
  /* قطعات آجر/سنگ پراکنده */
  for (const p of RUBBLE_PTS) {
    ctx.save();
    ctx.translate(p.dx * k, -p.dy * k - 2);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.col;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  }
  /* تیرهای چوبِ کج‌مانده */
  if (k > 0.7) {
    ctx.strokeStyle = '#4a3b2a'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-30, -6); ctx.lineTo(-2, -40);
    ctx.moveTo(26, -4); ctx.lineTo(44, -30);
    ctx.stroke();
  }
  ctx.restore();
}

/* ترک‌های داستانی برج (k = ۰..۱ طول هر ترک):
   شکاف تیره‌ی پهن + لبه‌ی روشنِ تراشه تا در تاریکی شب هم خوانا باشد */
function drawTowerCracks(k) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const c of TOWER_CRACKS) {
    const n = Math.max(2, Math.ceil(c.pts.length * k));
    const seg = (off, col, lw) => {
      ctx.strokeStyle = col; ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(TOWER.x + c.pts[0][0] + off, GROUND_Y + c.pts[0][1]);
      for (let i = 1; i < n; i++) ctx.lineTo(TOWER.x + c.pts[i][0] + off, GROUND_Y + c.pts[i][1]);
      ctx.stroke();
    };
    seg(1.5, 'rgba(232,210,175,0.5)', 1.7);   // لبه‌ی روشنِ تراشه
    seg(0, 'rgba(13,8,4,0.92)', 3.6);          // شکاف تیره
  }
  ctx.fillStyle = 'rgba(160,140,110,' + (0.1 * k).toFixed(2) + ')';
  ctx.beginPath(); ctx.ellipse(TOWER.x, GROUND_Y - 80, 84, 118, 0, 0, Math.PI * 2); ctx.fill();
}

/* ------------------ افق شهر سوخته (برج دوم) ------------------
   ساختمان‌های سوگته با بام‌های شکسته + پنجره‌های تیره/نارنجی +
   کانون‌های آتشِ چشمک‌زن با دنباله‌ی دود + مهِ دودیِ پایه‌ها.
   آتش و دود در روز هم (کم‌رنگ‌تر) دیده می‌شوند — شهر هنوز می‌سوزد. */
function drawRuinedSkyline(d) {
  ctx.fillStyle = mixHex('#141018', '#6e5546', d);
  ctx.beginPath();
  for (const b of RUIN_SKYLINE) {
    const top = GROUND_Y - b.h;
    ctx.moveTo(b.x, GROUND_Y);
    ctx.lineTo(b.x, top);
    for (const n of b.notch) {                 // لبه‌ی فروریخته‌ی بام
      ctx.lineTo(b.x + n.dx, top);
      ctx.lineTo(b.x + n.dx + n.w * 0.5, top + n.d);
      ctx.lineTo(b.x + n.dx + n.w, top);
    }
    ctx.lineTo(b.x + b.w, top);
    ctx.lineTo(b.x + b.w, GROUND_Y);
    ctx.closePath();
  }
  ctx.fill();
  /* پنجره‌های شکسته: روز و شب — تیره‌ها سیاه، نارنجی‌ها سوسوزن */
  for (const w2 of RUIN_WINS) {
    if (w2.lit) {
      const fl = 0.55 + 0.45 * Math.sin(animTime * 4 + w2.ph);
      ctx.fillStyle = 'rgba(255,140,60,' + (fl * (0.6 + 0.4 * (1 - d))).toFixed(2) + ')';
    } else {
      ctx.fillStyle = 'rgba(5,3,6,0.5)';
    }
    ctx.fillRect(w2.x, w2.y, 3.4, 5);
  }
  /* کانون‌های آتش + دودِ بالا رونده — حتی روز هم به‌روشنی دیده می‌شوند
     (شهر هنوز می‌سوزد؛ آتشِ روز کمی کمرنگ‌تر از شب است) */
  const fireA = 0.78 + 0.22 * (1 - d);
  for (const f of RUIN_FIRES) {
    const fl = 0.55 + 0.45 * Math.sin(animTime * 5 + f.ph);
    const g2 = ctx.createRadialGradient(f.x, f.y, 1, f.x, f.y, 17);
    g2.addColorStop(0, 'rgba(255,150,66,' + (0.8 * fireA * fl).toFixed(2) + ')');
    g2.addColorStop(0.5, 'rgba(255,110,40,' + (0.4 * fireA * fl).toFixed(2) + ')');
    g2.addColorStop(1, 'rgba(255,110,40,0)');
    ctx.fillStyle = g2; circle(f.x, f.y, 17);
    ctx.fillStyle = 'rgba(255,200,120,' + (0.85 * fireA * fl).toFixed(2) + ')';
    circle(f.x, f.y, 2.4);                        // هسته‌ی روشن شعله
    const sy = f.y - 13 - (animTime * 7 + f.ph * 10) % 26;
    ctx.fillStyle = 'rgba(64,50,52,' + (0.45 * fireA * fl).toFixed(2) + ')';
    ctx.beginPath(); ctx.ellipse(f.x + Math.sin(animTime + f.ph) * 4, sy, 7.5, 13, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(f.x + Math.sin(animTime * 0.7 + f.ph) * 7, sy - 17, 11, 16, 0, 0, Math.PI * 2); ctx.fill();
  }
  /* مهِ پایه‌ی ساختمان‌ها: خاکستریِ دودی */
  const fog = ctx.createLinearGradient(0, GROUND_Y - 46, 0, GROUND_Y);
  fog.addColorStop(0, 'rgba(120,95,80,0)');
  fog.addColorStop(1, d > 0.5 ? 'rgba(160,130,110,' + (0.24 * d).toFixed(2) + ')'
                              : 'rgba(80,60,55,' + (0.2 * (1 - d)).toFixed(2) + ')');
  ctx.fillStyle = fog;
  ctx.fillRect(-20, GROUND_Y - 46, W + 40, 46);
}

/* ------------------ لایه‌ی رویی کات‌سین ------------------
   نوارهای سینمایی، زیرنویس مراحل، تپش قرمزِ لرزش، محو/سیاهی
   و متن‌های صفحه‌ی سیاه — بعد از همه‌ی لایه‌ها رسم می‌شود */
function drawCutscene() {
  if (!CS) return;
  const t = CS.t;
  /* نوارهای سینمایی (ورود/خروج نرم) */
  const lIn = clamp(t / 0.45, 0, 1);
  const lOut = clamp((CS_T.end - t) / 0.55, 0, 1);
  const L = 46 * Math.min(lIn, lOut);
  if (L > 0.5) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, L);
    ctx.fillRect(0, H - L, W, L);
  }
  /* زیرنویس مراحل (کپسول پایین صحنه) */
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = 'bold 15px Tahoma, sans-serif';
  const caps = CS_CAPS.slice();
  if (CS.giftApplied && CS.giftText) caps.push([CS_T.giftT, CS_T.giftT + 1.35, '🎁 ' + CS.giftText]);
  for (const c of caps) {
    if (t < c[0] || t > c[1]) continue;
    const a = Math.min(1, (t - c[0]) / 0.25, (c[1] - t) / 0.25);
    ctx.globalAlpha = a;
    const tw = ctx.measureText(c[2]).width + 26;
    ctx.fillStyle = 'rgba(0,0,0,0.66)';
    rr(W / 2 - tw / 2, H - L - 42, tw, 26, 13); ctx.fill();
    ctx.fillStyle = '#f3e9cf';
    ctx.fillText(c[2], W / 2, H - L - 29);
    ctx.globalAlpha = 1;
  }
  /* تپش قرمز لبه‌ها حین لرزش زمین */
  if (t < CS_T.shakeEnd) {
    const a = 0.1 + 0.08 * Math.sin(t * 26);
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.8);
    g.addColorStop(0, 'rgba(180,20,20,0)');
    g.addColorStop(1, 'rgba(180,20,20,' + a.toFixed(2) + ')');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
  /* محو به سیاهی */
  if (CS.fade > 0.003) {
    ctx.fillStyle = 'rgba(0,0,0,' + CS.fade.toFixed(3) + ')';
    ctx.fillRect(0, 0, W, H);
  }
  /* متن‌های صفحه‌ی سیاه: «به موقعیت جدید رسیدید...» / «برج بعدی» */
  if (CS.fade > 0.965) {
    const aM = clamp((t - CS_T.black - 0.2) / 0.5, 0, 1);
    const aS = clamp((t - CS_T.black - 0.8) / 0.5, 0, 1);
    if (aM > 0) {
      ctx.globalAlpha = aM;
      ctx.font = 'bold 30px Tahoma, sans-serif';
      ctx.fillStyle = '#e8ecf5';
      ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 12;
      ctx.fillText('به موقعیت جدید رسیدید...', W / 2, H / 2 - 16);
      ctx.shadowBlur = 0;
    }
    if (aS > 0) {
      ctx.globalAlpha = aS;
      ctx.font = 'bold 19px Tahoma, sans-serif';
      ctx.fillStyle = '#ffd873';
      ctx.fillText('🏗 برج بعدی', W / 2, H / 2 + 26);
    }
    ctx.globalAlpha = 1;
  }
}

/* اتصال دکمه‌ی «رد کردن» (عنصر در HTML موجود است) */
$('skipCs').addEventListener('click', skipCutscene);
