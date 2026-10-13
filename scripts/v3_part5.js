/* ==================================================================
   سه طبقه تا بقا — نسخه‌ی ۸٫۰ — بخش ۴: رویداد داستانی «فروریختن برج»
   ==================================================================
   بعد از پاک‌سازی موج ۵ و پیش از موج ۶، یک کات‌سین چند‌پرده‌ای پخش می‌شود:
     ۱) لرزشِ پیش‌رونده‌ی زمین + ترک‌خوردن تدریجی برج (کند و منطقی)
     ۲) فروریختن طبقه‌ی اول → نشستن طبقه‌های بالا → فروریختن طبقه‌ی دوم
        → لغزیدن و کج‌شدن بام (برج مثل پنکیک طبقه‌طبقه می‌نشیند)
     ۳) جهش بازیکن از بامِ در حال لغزش + سقوط قوسی + نشستن روی ماشین دوست
     ۴) بخش «رانندگی»: خود بازیکن فرمان را دست می‌گیرد (گاز/ترمز با کلیدهای
        جهت‌دار یا لمس چپ/راست صفحه) — زامبی‌ها و موانع را کنار می‌زند؛
        نوار «مسیر تا برج جدید» پیش می‌رود تا مقصد
     ۵) پایان مسیر: ماشین خودش دور می‌شود، صفحه سیاه می‌شود — «اسلحه‌هایت
        زیر آوار ماند...» + «غرامت: +N سکه» + «به موقعیت جدید رسیدید...»
     ۶) طلوع در برج دومِ شهر سوخته (آسمان سرخ، ماه خونی، بارش خاکستر)
   قواعد گیم‌پلی (۸٫۰):
     - سکه‌ها، جون برج، برجک‌ها و ارتقاهای ساختمانی همه حفظ می‌شوند
     - سلاح‌های همراه (تپانچه‌ی ارتقایافته/شاتگان/مسلسل) زیر آوار از بین
       می‌روند؛ به‌جایش «غرامت» (سکه‌ی اضافه بر سکه‌های خودمان) می‌رسد
     - موج‌های ۶ تا ۱۰ روی برج جدید با همان منطق سختی ادامه می‌یابند
     - کات‌سین با دکمه‌ی «رد کردن» گوشه‌ی صفحه قابل عبور است
   جزئیات فنی:
     - همه‌چیز فقط با Canvas و شکل‌های ساده رسم می‌شود (بدون تصویر خارجی)
     - playTowerCollapseCutscene پارامتری است تا برای فصل‌های بعدی
       (برج سوم/چهارم...) هم قابل استفاده باشد
     - همه‌ی حرکت‌ها از t محاسبه می‌شوند تا پرش/تست زمانی (csGoto) قطعی باشد؛
       رانندگی هم بدون ورودی، با گازِ خودکار پیش می‌رود (تست‌پذیر)
   ================================================================== */

/* ---------------------- ۱۷) رویداد داستانی ---------------------- */

/* موجی که بعد از پایانش کات‌سین پخش می‌شود */
const CUTSCENE_AFTER_WAVE = 5;

/* زمان‌بندی مراحل کات‌سین (ثانیه) — ۸٫۰: فروریختن «کندتر و منطقی‌تر»
   شد (طبقه‌طبقه با فاصله) و بخش رانندگی تعاملی به آن اضافه شد.
   زمان‌های پس از رانندگی (fadeOut/black/switch/fadeIn/end) نسبت به
   پایان رانندگی در CS.post محاسبه می‌شوند (طول رانندگی متغیر است). */
const CS_T = {
  shakeEnd: 3.4,     // پایان لرزش/ترک‌خوردن (شدت به‌مرور رشد می‌کند)
  col1End: 5.2,      // پایان فروریختن طبقه‌ی اول
  col2End: 7.0,      // پایان فروریختن طبقه‌ی دوم
  chunkDrop: 7.0,    // شروع لغزش/سقوط بام (طبقه‌ی سوم)
  chunkDur: 1.15,    // مدت سقوط بام
  playerDrop: 7.3,   // جهش بازیکن از بامِ در حال لغزش
  fallDur: 1.5,      // مدت سقوط قوسی بازیکن
  carEnter: 6.9,     // ورود ماشین از لبه‌ی چپ
  catchDX: 14,       // جای بازیکن روی ماشین (نسبت به مرکز ماشین)
  driveStart: 9.15,  // شروع بخش رانندگی (بازیکن سوار شد)
  /* --- رانندگی --- */
  driveDist: 3000,   // طول مسیر تا برج جدید (پیکسل دنیای جاده)
  vMin: 150, vMax: 560, vBase: 310, vAcc: 430, vBrk: 560,
  driveMax: 18,      // حداکثر ثانیه‌ی رانندگی (بعدش خودکار تمام می‌شود)
  /* --- پس از رانندگی (آفست از لحظه‌ی پایان مسیر) --- */
  fadeDur: 0.95,
  switchOff: 2.3,    // تعویض صحنه در دلِ سیاهی
  fadeInOff: 3.4,    // شروع بازگشت صحنه‌ی جدید (بعد از متن‌های سیاهی)
  endOff: 4.5,       // پایان کات‌سین → روزِ برج جدید
};

/* جای ثابت ماشین روی صفحه‌ی جاده */
const CS_DRIVE_CAR_X = 330;

/* زیرنویس‌های کات‌سین: [شروع، پایان، متن] */
const CS_CAPS = [
  [0.35, 2.95, 'زمین می‌لرزد... برج دارد ترک می‌خورد!'],
  [3.5, 5.05, 'طبقه‌ی اول فرو می‌ریزد!'],
  [5.35, 6.85, 'طبقه‌ی دوم هم...!'],
  [7.0, 7.9, 'بام می‌لغزد — بپر!'],
  [8.6, 9.1, 'رسیدی! سوار شو'],
  [9.5, 12.6, 'فرمان با توست! گاز بده تا برج جدید'],
];

/* --- پوسته‌های برج (۱۰٫۰): هر فصل رنگ و جنس خودش را دارد ---
   ۰=محله‌ی قدیمی (آجری/آبی) • ۱=انبارها (فولادی/زنگاری/خردلی)
   ۲=پاسگاه (سنگ‌خزه/فیروزه — برج دوم سابق) • ۳=مخابرات (لاجوردی/یخی)
   drawTower این رنگ‌ها را می‌خواند؛ اندازه‌ی برج در همه یکی است. */
const TOWER_SKINS = [
  { /* فصل ۱ — محله‌ی قدیمی: سنگی/آجری/آبی (ظاهر اصلی بازی) */
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
  { /* فصل ۲ — منطقه‌ی انبارها: فولادی/صناعتی/زنگاری (۱۰٫۰) */
    floors: [
      { light: '#7a8496', base: '#5f6a7d', dark: '#434c5e', edge: '#3a4254' },
      { light: '#5d84a6', base: '#4c7191', dark: '#375873', edge: '#2f4c63' },
      { light: '#b07838', base: '#9a662e', dark: '#75491d', edge: '#663f1a' },
    ],
    plinth: ['#2c3038', '#6a7078'], batt: ['#4c7191', '#7fa5c4'],
    flag: '#e8a13c', flagMark: '#3a2c14',
    banner: ['#75491d', '#96682c'], bannerMark: '#3a2c14',
    doorFrame: ['#4c5566', '#7d8896'], pole: ['#333a44', '#5d666f'],
  },
  { /* فصل ۳ — پاسگاه نظامی: سنگ‌خزه/فیروزه/زرشکی (برج دوم سابق — ۷٫۰) */
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
  { /* فصل ۴ — برج مخابراتی: لاجوردی/یخی/کمرنگ (۱۰٫۰) */
    floors: [
      { light: '#5b6a84', base: '#48566e', dark: '#333e52', edge: '#2c3648' },
      { light: '#8fb4d9', base: '#7299c2', dark: '#527495', edge: '#466382' },
      { light: '#c8d4e2', base: '#aebbc9', dark: '#8c99a8', edge: '#7a8694' },
    ],
    plinth: ['#242c3a', '#5a6578'], batt: ['#527495', '#8fb4d9'],
    flag: '#7fd8ff', flagMark: '#0e2a3a',
    banner: ['#527495', '#7299c2'], bannerMark: '#1c3040',
    doorFrame: ['#3a4254', '#6a7584'], pole: ['#2c3648', '#4d5a6b'],
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
    /* چند کانون آتشِ دودکن روی ساختمان‌های بلندتر */
    if (bh > 45 && srand() > 0.35 && RUIN_FIRES.length < 6) {
      RUIN_FIRES.push({ x: x + 9 + srand() * (bw - 18), y: GROUND_Y - bh + 6 + srand() * 22, ph: srand() * 6.28 });
    }
    x += bw + 9;
  }
}

/* --- اجزای کنار راهِ بخش رانندگی (۸٫۰) ---
   چراغ/درخت/بوته/سنگ + موانعِ راه‌بندیِ پرت‌خورِ هر چند صد پیکسل.
   موانع سرعت ماشین را می‌گیرند (ولی شکست نمی‌آورند). */
const DRIVE_PROPS = [];
{
  let wx = 230, i = 0;
  while (wx < CS_T.driveDist + 700) {
    const r = srand();
    let kind = 'bush';
    if (i % 4 === 3) kind = 'barrier';            // هر چهارمی: مانع
    else if (r < 0.3) kind = 'lamp';
    else if (r < 0.55) kind = 'tree';
    else if (r < 0.8) kind = 'bush';
    else kind = 'rock';
    DRIVE_PROPS.push({ wx, kind, s: 0.75 + srand() * 0.5, ph: srand() * 6.28 });
    wx += 150 + srand() * 170;
    i++;
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
  csWhoosh() { if (!sfxGate('csWhoosh', 700)) return;
    Snd.noise({ dur: 0.25, vol: 0.06, ftype: 'highpass', freq: 900 }); },
  csCrash()  { Snd.noise({ dur: 0.3, vol: 0.3, freq: 200, q: 0.6 });
    Snd.tone({ type: 'sawtooth', f0: 120, f1: 60, dur: 0.25, vol: 0.14 }); },
  csGift()   { [660, 880, 1320].forEach((f, i) =>
    Snd.tone({ type: 'triangle', f0: f, dur: 0.16, vol: 0.12, delay: i * 0.08 })); },
});

/* --- وضعیت اجرای کات‌سین (null = کات‌سینی در جریان نیست) ---
   draw: داده‌های رندر لحظه‌ای که drawTower/drawPlayer می‌خوانند */
let CS = null;

/* غرامت اسلحه‌های سوخته: ۶۰٪ پولِ خرج‌شده + کمی لطف راننده
   (کف ۶۰ سکه، سقف ۳۲۰) — جدا از سکه‌های خودِ بازیکن */
function computeWeaponCompensation() {
  return clamp(Math.round((state.weaponSpent * 0.6 + 50) / 10) * 10, 60, 320);
}

/* شروع کات‌سین «فروریختن برج» — تابع پارامتری برای استفاده در فصل‌های بعدی:
   opts.afterWave  موجِ مقدمه‌ی رویداد
   opts.variant    شماره‌ی پوسته‌ی برج بعدی (پیش‌فرض ۱) */
function playTowerCollapseCutscene(opts = {}) {
  if (CS) return;                            // کات‌سین دیگری در جریان است
  CS = {
    t: 0, paused: false,
    afterWave: opts.afterWave || CUTSCENE_AFTER_WAVE,
    variant: opts.variant !== undefined ? opts.variant : 1,
    boomed1: false, boomed2: false, chunkHit: false,
    caught: false, whistled: false, switched: false,
    compApplied: false, compCoins: 0, compSpent: 0,
    bursts1: 0, bursts2: 0,
    zombies: [], car: null, drive: null, post: null,
    fade: 0,
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
function csKnockZombie(z, v) {
  z.hit = true;
  z.vx = (v || 430) * 0.72 + rand(0, 90);
  z.vy = -rand(300, 430);
  z.vr = rand(6, 11) * (Math.random() < 0.5 ? -1 : 1);
  if (CS && CS.car) CS.car.kick = 1;
  state.shake = Math.max(state.shake, 3.5);
  SFX.csThud();
  spawnParticles(z.x, z.y - 16, 10, '#7a2f2f', { speed: 160, life: 0.5, size: 2.6, grav: 500 });
  spawnParticles(z.x, z.y - 16, 6, '#5f8f3e', { speed: 130, life: 0.45, size: 2.2, grav: 500 });
}

/* موج انفجار آجر/چوب حین فروریختن طبقه‌ها (درشت + جرقه + غبار)
   i = شماره طبقه (۰/۱) برای انتخاب ارتفاع انفجار */
function csBrickBurst(i, n) {
  const fy = i === 0 ? GROUND_Y - rand(10, 55) : GROUND_Y - rand(60, 120);
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

/* «اسلحه‌ها زیر آوار ماندند» + پرداخت غرامت (فقط یک‌بار)
   (۲۸٫۰) کلت همیشه در دست می‌ماند (WEAPONS.pistol.owned=true تضمینی) */
function cutsceneApplyCompensation() {
  if (!CS || CS.compApplied) return;
  CS.compApplied = true;
  CS.compSpent = state.weaponSpent;
  CS.compCoins = computeWeaponCompensation();
  /* اسلحه‌های همراهِ روی برج از بین می‌روند */
  WEAPONS.shotgun.owned = false;
  WEAPONS.mg.owned = false;
  WEAPONS.pistol.owned = true;                /* (۲۸٫۰) کلت زیر آوار نمی‌ماند */
  state.weapon = 'pistol';
  state.upgrades.weapon = 0;
  state.upgrades.speed = 0;               // (۹٫۰) ارتقای سرعت شلیک هم «زیر آوار» می‌ماند
  state.weaponSpent = 0;
  /* غرامت: سکه‌ی اضافه، جدا از سکه‌های خودمان */
  state.coins += CS.compCoins;
  state.stats.earned += CS.compCoins;
  SFX.csGift();
  pulseCoins();
  refreshWeaponBar();
  refreshBuildPanel();
  try { refreshWeaponChips28(); } catch (e) {}
  updateHUD();
}

/* پایان کات‌سین: ورود به «روزِ برج جدید» — پیشرفت ساختمانی حفظ شده است */
function cutsceneFinish() {
  if (!CS) return;
  cutsceneApplyCompensation();               // اطمینان: غرامت حتماً پرداخت شود
  const compCoins = CS.compCoins;
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
  setBuildPanel(true, true);              // (۲۹) جمع — FAB راهنماست
  $('bpHead').classList.add('attention');
  setAnnounce('🌅 برج بعدی!',
    'اسلحه‌ها زیر آوار ماندند — غرامت: +' + faNum(compCoins) + ' سکه • موج '
    + faNum(state.wave + 1) + ' در راه است', 3.6);
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

/* ------------------ بخش رانندگی (۸٫۰) ------------------
   بازیکن خودش ماشین را می‌راند: گاز/ترمز با کلیدهای جهت‌دار (یا A/D)
   یا لمس نیمه‌ی راست/چپ صفحه؛ بدون ورودی، گازِ خودکارِ ملایم جلو می‌رود
   تا neither قفل شود نه تستِ زمانی (csGoto) غیرقطعی شود. */
function startCsDrive() {
  const cs = CS;
  cs.zombies = [];                           // صحنه‌ی برج تمام شد
  state.particles = []; state.texts = [];
  if (cs.car) { cs.car.x = CS_DRIVE_CAR_X; cs.car.hand = 0; }
  cs.drive = {
    scroll: 0, v: 280, progress: 0,
    keys: { a: false, b: false },            // گاز/ترمز کیبورد
    touch: { a: false, b: false },           // گاز/ترمز لمسی
    spawnT: 0.7, zombies: [], hits: {},
    ended: false, endT: 0,
  };
  SFX.csEngine();
}

function updateCsDrive(dt) {
  const cs = CS, dr = cs.drive, t = cs.t;
  if (!dr.ended) {
    /* --- کنترل بازیکن: گاز/ترمز (کیبورد + لمس) --- */
    const acc = dr.keys.a || dr.touch.a, brk = dr.keys.b || dr.touch.b;
    if (acc) dr.v += CS_T.vAcc * dt;
    else if (brk) dr.v -= CS_T.vBrk * dt;
    else dr.v += (CS_T.vBase - dr.v) * Math.min(1, dt * 1.1);   // گازِ خودکار
    dr.v = clamp(dr.v, CS_T.vMin, CS_T.vMax);
    dr.scroll += dr.v * dt;
    dr.progress = clamp(dr.scroll / CS_T.driveDist, 0, 1);
    /* پایان مسیر یا مهلتِ زمانی → ماشین خودش مقصد را پیدا می‌کند */
    if (dr.progress >= 1 || t - CS_T.driveStart > CS_T.driveMax) {
      dr.ended = true;
      dr.endT = t;
      cs.post = {
        fadeOut: t,
        black: t + CS_T.fadeDur,
        switchT: t + CS_T.switchOff,
        fadeIn: t + CS_T.fadeInOff,
        end: t + CS_T.endOff,
      };
      SFX.csWhoosh();
    }
  } else {
    /* بعد از مسیر: ماشین خودش دور می‌شود (تا در سیاهی محو شود) */
    if (cs.car) cs.car.x += (dr.v + 280) * dt;
    dr.scroll += dr.v * dt;
  }
  if (cs.car) {
    cs.car.spin += (dr.v / 13) * dt;
    cs.car.kick = Math.max(0, cs.car.kick - dt * 4);
  }
  SFX.csEngine();
  /* دم اگزوز + غبار چرخ‌ها (هرچه تندتر، بیشتر) */
  if (cs.car && Math.random() < dt * (dr.v / 20)) {
    spawnParticles(CS_DRIVE_CAR_X - 84, GROUND_Y + 6, 1, 'rgba(190,180,168,0.5)',
      { speed: 30, life: 0.5, size: 2.4, grav: -20, dir: Math.PI, spread: 0.7 });
  }
  /* زامبی‌های خیابانی: جلوتر سر راه می‌آیند تا ماشین آنها را کنار براند */
  dr.spawnT -= dt;
  if (dr.spawnT <= 0 && !dr.ended) {
    dr.spawnT = rand(0.9, 1.7);
    const r = Math.random();
    const type = r < 0.62 ? 'normal' : (r < 0.86 ? 'fast' : 'tank');
    const T = ZTYPES[type];
    dr.zombies.push({
      type, x: W + 60, y: GROUND_Y + 14, dir: -1, radius: T.r,
      walkPhase: rand(0, 6.28), attacking: false, attackAnim: 0, attackSide: 0,
      lane: 0, depth: 1.06, yJit: rand(-2, 2), stagger: 0, chill: 0, hitFlash: 0,
      dead: false, deathT: 0, walk: rand(30, 70),
      hit: false, vx: 0, vy: 0, vr: 0, rot: 0, landed: false,
      groundY: GROUND_Y + 14,
    });
  }
  for (const z of dr.zombies) {
    if (z.hit) {
      z.vy += 900 * dt;
      z.x += z.vx * dt; z.y += z.vy * dt; z.rot += z.vr * dt;
      if (z.y > z.groundY) {
        z.y = z.groundY;
        if (!z.landed) {
          z.landed = true;
          spawnParticles(z.x, z.y, 6, '#7a2f2f', { speed: 110, life: 0.4, size: 2.2, grav: 400 });
        }
        z.vx *= 0.8; z.vr = 0;
        z.rot += (Math.sign(z.rot || 1) * 1.45 - z.rot) * Math.min(1, dt * 9);
      }
    } else {
      z.x -= (dr.v * 0.92 + z.walk) * dt;    // جاده زیر پایشان می‌گذرد
      z.walkPhase += dt * 5;
      if (!dr.ended && cs.car && Math.abs(z.x - cs.car.x) < 76) csKnockZombie(z, dr.v);
    }
  }
  dr.zombies = dr.zombies.filter(z => z.x > -90 && z.x < W + 160);
  /* برخورد با موانعِ راه‌بندی: سرعت می‌گیرد/می‌شکند ولی باخت نیست */
  for (const p of DRIVE_PROPS) {
    if (p.kind !== 'barrier' || dr.hits[p.wx]) continue;
    const sx = p.wx - dr.scroll;
    if (!dr.ended && Math.abs(sx - CS_DRIVE_CAR_X) < 48) {
      dr.hits[p.wx] = true;
      dr.v = Math.max(CS_T.vMin, dr.v * 0.55);
      state.shake = Math.max(state.shake, 7);
      if (cs.car) cs.car.kick = 1;
      SFX.csCrash();
      spawnParticles(sx, GROUND_Y - 6, 14, '#c9a35a', { speed: 200, life: 0.7, size: 3, grav: 500 });
      spawnParticles(sx, GROUND_Y - 4, 8, 'rgba(190,180,168,0.6)', { speed: 120, life: 0.9, size: 5, grav: -30 });
    }
  }
  /* خطوط سرعت در سرعت بالا */
  if (dr.v > 430 && Math.random() < dt * 30) {
    state.particles.push({
      x: rand(60, W - 60), y: rand(80, GROUND_Y - 40),
      vx: -dr.v * 1.6, vy: 0, age: 0, life: 0.22, size: rand(1, 2),
      color: 'rgba(200,215,255,0.5)', grav: 0,
    });
  }
  /* جای بازیکن روی سقف کابین (پاها روی لبه‌ی سقف) */
  if (cs.car) cs.draw.player = { x: cs.car.x + CS_T.catchDX, y: cs.car.y - 60, rot: -0.06, aim: -0.5 };
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

  /* ---- مرحله ۱: لرزش پیش‌رونده + ترک‌خوردن (کند و منطقی) ---- */
  if (t < CS_T.shakeEnd) {
    const k = t / CS_T.shakeEnd;                   // شدت به‌مرور رشد می‌کند
    D.cracks = k;
    state.shake = (2 + 9 * k) * (0.6 + 0.4 * Math.abs(Math.sin(t * 14)));
    if (Math.random() < dt * 14 * (0.2 + k)) {     // گردوغاک چکه‌کن از ترک‌ها
      spawnParticles(TOWER.x + rand(-52, 52), GROUND_Y - rand(15, 120), 1, '#9c8a6d',
        { speed: 40, life: 0.7, size: 1.8, grav: 300 });
    }
    SFX.csRumble();
    if (Math.random() < dt * 1.1 * (0.3 + k)) SFX.csCrack();
  }

  /* ---- مرحله ۲: فروریختن طبقه‌ی اول (۳٫۴ تا ۵٫۲) ---- */
  else if (t < CS_T.col1End) {
    const p = clamp((t - CS_T.shakeEnd) / (CS_T.col1End - CS_T.shakeEnd), 0, 1);
    if (!cs.boomed1) { cs.boomed1 = true; SFX.csBoom(); state.shake = 12; }
    D.cracks = 1;
    D.floors[0].a = clamp(1 - p * 1.45, 0, 1);      // طبقه‌ی اول: خرد و محو
    D.floors[0].dy = p * p * 40;
    D.floors[0].rot = p * 0.04;
    D.floors[1].dy = p * 52;                        // طبقه‌های بالا پایین می‌آیند
    D.floors[2].dy = p * 52;
    D.rubble = clamp(p * 0.5, 0, 0.5);
    state.shake = Math.max(state.shake, 3 + 6 * (1 - p));
    const bn = [0.05, 0.35, 0.65, 0.95].filter(b => p >= b).length;
    while (cs.bursts1 < bn) { csBrickBurst(0, cs.bursts1); cs.bursts1++; }
    /* بازیکن روی بامِ در حال نشستن است */
    D.player = { x: TOWER.x, y: TOWER_TOP_Y + D.floors[2].dy, rot: D.floors[2].rot * 0.6, aim: -1.2 };
  }

  /* ---- مرحله ۳: فروریختن طبقه‌ی دوم (۵٫۲ تا ۷٫۰) ---- */
  else if (t < CS_T.col2End) {
    const p = clamp((t - CS_T.col1End) / (CS_T.col2End - CS_T.col1End), 0, 1);
    if (!cs.boomed2) { cs.boomed2 = true; SFX.csBoom(); state.shake = 11; }
    D.floors[0].a = 0;
    D.floors[1].a = clamp(1 - p * 1.4, 0, 1);
    D.floors[1].dy = 52 + p * 70;
    D.floors[1].rot = -p * 0.05;
    D.floors[2].dy = 52 + p * 60;                  // بام باز هم پایین می‌آید
    D.floors[2].rot = p * 0.1;                     // و کم‌کم کج می‌شود
    D.rubble = clamp(0.5 + p * 0.35, 0, 0.85);
    state.shake = Math.max(state.shake, 3 + 5 * (1 - p));
    const bn = [0.1, 0.45, 0.8].filter(b => p >= b).length;
    while (cs.bursts2 < bn) { csBrickBurst(1, cs.bursts2); cs.bursts2++; }
    SFX.csRumble();
    D.player = { x: TOWER.x, y: TOWER_TOP_Y + D.floors[2].dy, rot: D.floors[2].rot * 0.6, aim: -1.2 };
  }

  /* ---- مرحله ۴: لغزیدن/سقوط بام (طبقه‌ی ۳) روی توده‌ی آوار ---- */
  const cf = clamp((t - CS_T.chunkDrop) / CS_T.chunkDur, 0, 1);
  if (cf > 0 && !cs.chunkHit) {
    D.floors[0].a = 0;
    D.floors[1].a = 0;
    D.floors[2].a = 1;
    D.floors[2].dy = 112 + cf * cf * (GROUND_Y - TOWER_TOP_Y - 140);
    D.floors[2].rot = 0.1 + cf * 0.34;             // لغزیدن کج
    if (t < CS_T.playerDrop) {                      // بازیکن هنوز روی بامِ لغزان است
      D.player = { x: TOWER.x, y: TOWER_TOP_Y + D.floors[2].dy, rot: D.floors[2].rot * 0.6, aim: -1.2 };
    }
    if (cf >= 1) {
      cs.chunkHit = true;
      D.floors[2].a = 0;                           // بام خورد و در آوار رفت
      D.rubble = 1;
      state.shake = 12;
      SFX.csLand();
      spawnParticles(TOWER.x, GROUND_Y - 10, 26, '#8a6f52', { speed: 240, life: 0.8, size: 3.4, grav: 560, up: true });
      spawnParticles(TOWER.x, GROUND_Y - 4, 18, '#6e5a44', { speed: 170, life: 1.2, size: 4.2, grav: 260, up: true });
    }
  }

  /* ---- ماشین نجات: ورود نرم از چپ و ایستادن زیر بازیکن ---- */
  const catchT = CS_T.playerDrop + CS_T.fallDur;   // لحظه‌ی رسیدن بازیکن به ماشین
  if (t >= CS_T.carEnter && t < CS_T.driveStart) {
    if (!cs.car) {
      cs.car = { x: -160, y: GROUND_Y + 14, spin: 0, kick: 0, hand: 1.8 };
      SFX.csEngine();
    }
    if (t < catchT) {
      /* حرکت قطعی از زمان (قابل تست و پرش زمانی): نرم به زیر برج می‌رسد */
      const u = clamp((t - CS_T.carEnter) / (catchT - CS_T.carEnter), 0, 1);
      const e = u * u * (3 - 2 * u);
      cs.car.x = -160 + (TOWER.x + 160) * e;
      cs.car.spin += 24 * dt;
    } else {
      cs.car.x = TOWER.x;                          // زیر برج منتظر بازیکن
      cs.car.spin += 6 * dt;
    }
    cs.car.hand = Math.max(0, cs.car.hand - dt);   // اول کار دست می‌دهد
    SFX.csEngine();
    /* تصادم ساده: هر زامبیِ جلوی مسیر کنار پرتاب می‌شود */
    for (const z of cs.zombies) {
      if (!z.hit && Math.abs(z.x - cs.car.x) < 76) csKnockZombie(z, 430);
    }
  }

  /* ---- سقوط قوسی بازیکن و نشستن روی ماشین ---- */
  const pf = clamp((t - CS_T.playerDrop) / CS_T.fallDur, 0, 1);
  if (pf > 0 && !cs.caught) {
    const y0 = TOWER_TOP_Y + 112;                   // بامِ نشسته روی آوار (پیوستگی با فریم قبل)
    const y1 = GROUND_Y + 14 - 60;                 // سقف کابین ماشین
    const arc = -46 * Math.sin(Math.PI * Math.min(1, pf * 1.25));   // جهش اول
    D.player = {
      x: TOWER.x + 8 + pf * (CS_T.catchDX - 8),    // کمی به سمت ماشین می‌لغزد
      y: y0 + arc + (y1 - y0) * pf * pf,           // جهش + سقوط شتاب‌دار
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
  if (cs.caught && cs.car && t < CS_T.driveStart) {
    /* سوار شدن: بازیکن روی سقف کابین، پاها روی لبه‌ی سقف، کمی به عقب خم */
    D.player = { x: cs.car.x + CS_T.catchDX, y: cs.car.y - 60, rot: -0.07, aim: -0.5 };
  }

  /* ---- زامبی‌های صحنه‌ی برج: خزش به سمت آوار یا فیزیک پرتاب ---- */
  for (const z of cs.zombies) {
    if (z.hit) {
      z.vy += 900 * dt;
      z.x += z.vx * dt; z.y += z.vy * dt; z.rot += z.vr * dt;
      if (z.y > z.groundY) {
        z.y = z.groundY;
        if (!z.landed) {
          z.landed = true;
          addDecal(z.x, true);
          spawnParticles(z.x, z.y, 6, '#7a2f2f', { speed: 110, life: 0.4, size: 2.2, grav: 400 });
        }
        z.vx *= 0.8; z.vr = 0;
        z.rot += (Math.sign(z.rot || 1) * 1.45 - z.rot) * Math.min(1, dt * 9);
      }
    } else {
      const dir = Math.sign(TOWER.x - z.x) || 1;
      if (Math.abs(TOWER.x - z.x) > 155) { z.x += dir * z.speed * dt; z.walkPhase += dt * 5; }
      else z.walkPhase += dt * 2.2;                // دور آوار جمع می‌شوند
    }
  }

  /* ---- شروع بخش رانندگی (زیر پوشش سیاهیِ کوتاه) ----
     (بعد از تعویض صحنه، رانندگی دیگر به‌روز نمی‌شود — ماشین رفته است) */
  if (t >= CS_T.driveStart && !cs.drive) startCsDrive();
  if (cs.drive && !(cs.post && t >= cs.post.switchT)) updateCsDrive(dt);

  /* ---- محو به سیاهی / سیاهی / بازگشت صحنه (نسبی به پایان رانندگی) ---- */
  cs.fade = !cs.post ? 0
    : t < cs.post.fadeOut ? 0
    : t < cs.post.black ? clamp((t - cs.post.fadeOut) / CS_T.fadeDur, 0, 1)
    : t < cs.post.fadeIn ? 1
    : clamp(1 - (t - cs.post.fadeIn) / (CS_T.endOff - CS_T.fadeInOff), 0, 1);

  /* پرداخت غرامت در دلِ سیاهی — قبل از ظاهر شدن متن‌های صفحه‌ی سیاه */
  if (cs.post && !cs.compApplied && t >= cs.post.black) cutsceneApplyCompensation();

  /* تعویض صحنه در دلِ سیاهی: برج دوم + شهر سوخته */
  if (cs.post && t >= cs.post.switchT && !cs.switched) {
    cs.switched = true;
    state.towerVariant = cs.variant;
    state.cutsceneDone = true;
    state.dayness = 0.3;
    state.dayTarget = 1;                          // صبحِ شهر سوخته
    cs.zombies = [];
    if (cs.drive) cs.drive.zombies = [];
    state.particles = []; state.texts = []; state.zaps = []; state.decals = [];
    cs.car = null;
    D.floors = [{ a: 1, dy: 0, rot: 0 }, { a: 1, dy: 0, rot: 0 }, { a: 1, dy: 0, rot: 0 }];
    D.cracks = 0; D.rubble = 0; D.player = null;  // بازیکن روی برج جدید
  }

  /* ---- پایان کات‌سین → روزِ برج جدید ---- */
  if (cs.post && t >= cs.post.end) { cutsceneFinish(); return; }

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
    seg(1.5, 'rgba(232,210,175,0.55)', 2.1);   // لبه‌ی روشنِ تراشه
    seg(0, 'rgba(13,8,4,0.94)', 4.2);          // شکاف تیره
  }
  ctx.fillStyle = 'rgba(160,140,110,' + (0.1 * k).toFixed(2) + ')';
  ctx.beginPath(); ctx.ellipse(TOWER.x, GROUND_Y - 80, 84, 118, 0, 0, Math.PI * 2); ctx.fill();
}

/* ------------------ افق شهر سوخته (برج دوم) ------------------
   ساختمان‌های سوخته با بام‌های شکسته + پنجره‌های تیره/نارنجی +
   کانون‌های آتش + مهِ دودیِ پایه‌ها.
   (۱۹٫۰ — بازخورد کاربر: «دودِ خانه‌ها متحرک باشه») لایه‌ی «زنده»
   (آتشِ سوسوزن + ستون‌های دودِ بالا رونده + پنجره‌های چشمک‌زن) هر
   فریم جدا از کش BG رسم می‌شود: drawRuinLiveFx — پایه‌ی ایستا همین‌جا
   در کش L1 می‌ماند و دود/شعله واقعاً حرکت می‌کند (چه شب، چه روز). */
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
  /* پنجره‌های شکسته: تیره‌ها سیاه؛ نارنجی‌ها فقط «پایه‌ی» کم‌نورِ ایستا —
     سوسوی واقعی‌شان در لایه‌ی زنده (drawRuinLiveFx) می‌آید */
  for (const w2 of RUIN_WINS) {
    if (w2.lit) {
      ctx.fillStyle = 'rgba(255,140,60,' + (0.42 * (0.6 + 0.4 * (1 - d))).toFixed(2) + ')';
    } else {
      ctx.fillStyle = 'rgba(5,3,6,0.5)';
    }
    ctx.fillRect(w2.x, w2.y, 3.4, 5);
  }
  /* کانون‌های آتش — پایه‌ی ایستا (هاله‌ی گرمِ ثابت) برای کش؛
     شعله‌ی پویا و دود در لایه‌ی زنده */
  const fireA = 0.86 + 0.14 * (1 - d);
  for (const f of RUIN_FIRES) {
    const g2 = ctx.createRadialGradient(f.x, f.y, 1, f.x, f.y, 23);
    g2.addColorStop(0, 'rgba(255,150,66,' + (0.5 * fireA).toFixed(2) + ')');
    g2.addColorStop(0.5, 'rgba(255,110,40,' + (0.26 * fireA).toFixed(2) + ')');
    g2.addColorStop(1, 'rgba(255,110,40,0)');
    ctx.fillStyle = g2; circle(f.x, f.y, 23);
  }
  /* مهِ پایه‌ی ساختمان‌ها: خاکستریِ دودی */
  const fog = ctx.createLinearGradient(0, GROUND_Y - 46, 0, GROUND_Y);
  fog.addColorStop(0, 'rgba(120,95,80,0)');
  fog.addColorStop(1, d > 0.5 ? 'rgba(160,130,110,' + (0.24 * d).toFixed(2) + ')'
                              : 'rgba(80,60,55,' + (0.2 * (1 - d)).toFixed(2) + ')');
  ctx.fillStyle = fog;
  ctx.fillRect(-20, GROUND_Y - 46, W + 40, 46);
}

/* (۱۹٫۰) اسپرایت دودِ پیش‌پخته — لکه‌ی نرمِ شعاعی؛ رنگش با تم روز/شب
   ترکیب می‌شود (شب: دودی تیره؛ روز: قهوه‌ای سپیا) */
let _smokeSpr = null;
function smokeSpr() {
  if (_smokeSpr) return _smokeSpr;
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const g = c.getContext('2d');
  const rg = g.createRadialGradient(32, 32, 3, 32, 32, 30);
  rg.addColorStop(0, 'rgba(70,56,58,0.85)');
  rg.addColorStop(0.6, 'rgba(64,50,52,0.5)');
  rg.addColorStop(1, 'rgba(64,50,52,0)');
  g.fillStyle = rg;
  g.fillRect(0, 0, 64, 64);
  _smokeSpr = c;
  return c;
}
let _smokeSprDay = null;
function smokeSprDay() {
  if (_smokeSprDay) return _smokeSprDay;
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const g = c.getContext('2d');
  const rg = g.createRadialGradient(32, 32, 3, 32, 32, 30);
  rg.addColorStop(0, 'rgba(150,120,105,0.8)');
  rg.addColorStop(0.6, 'rgba(140,112,98,0.45)');
  rg.addColorStop(1, 'rgba(140,112,98,0)');
  g.fillStyle = rg;
  g.fillRect(0, 0, 64, 64);
  _smokeSprDay = c;
  return c;
}

/* (۱۹٫۰) لایه‌ی زنده‌ی افق سوخته: شعله‌های پویا + ستون‌های دودِ
   بالا رونده (۴ دانه‌ی حلقه‌ایِ در حال رشد و محو + تلوّنِ باد) +
   سوسوی پنجره‌های نارنجی — بعد از blit لایه‌ی افق صدا می‌شود
   (dx = پارالاکس افق، هماهنگ با BG.blit(1)) */
function drawRuinLiveFx(d, dx) {
  ctx.save();
  if (dx) ctx.translate(dx, 0);
  const spr = d > 0.5 ? smokeSprDay() : smokeSpr();
  const fireA = 0.86 + 0.14 * (1 - d);
  /* پنجره‌های نارنجیِ سوسوزن — لایه‌ی روشنِ زنده روی پایه‌ی ایستا */
  for (const w2 of RUIN_WINS) {
    if (!w2.lit) continue;
    const fl = 0.55 + 0.45 * Math.sin(animTime * 4 + w2.ph);
    ctx.fillStyle = 'rgba(255,140,60,' + (fl * 0.55 * (0.6 + 0.4 * (1 - d))).toFixed(2) + ')';
    ctx.fillRect(w2.x, w2.y, 3.4, 5);
  }
  /* شعله‌های پویا + ستون دود */
  for (const f of RUIN_FIRES) {
    const fl = 0.55 + 0.45 * Math.sin(animTime * 5 + f.ph);
    /* هسته‌ی روشن شعله (جلوتر از دود) */
    ctx.fillStyle = 'rgba(255,200,120,' + (0.9 * fireA * fl).toFixed(2) + ')';
    circle(f.x, f.y, 3 + fl * 1.4);
    ctx.fillStyle = 'rgba(255,150,66,' + (0.5 * fireA * fl).toFixed(2) + ')';
    circle(f.x, f.y - 2, 6.5 + fl * 2.6);
    /* ستون دود: ۵ دانه، هرکدام یک چرخه‌ی بالارفتن ۰..۱ */
    for (let p = 0; p < 5; p++) {
      const ph = ((animTime * 0.14 + p / 5 + f.ph * 0.09) % 1 + 1) % 1;
      const rise = ph * 128;
      const sway = Math.sin(animTime * 0.8 + p * 1.6 + f.ph) * (5 + ph * 16);
      const sx = f.x + sway;
      const sy = f.y - 12 - rise;
      const r = 6.5 + ph * 17;
      const a = (0.5 - ph * 0.4) * fireA;
      if (a <= 0.02) continue;
      ctx.globalAlpha = a;
      ctx.drawImage(spr, sx - r, sy - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

/* (۱۹٫۰) دودکش‌های زنده‌ی افق انبارها (فصل ۲) — بخارِ صنعتیِ خاکستری
   که از دودکش‌های جعبه‌ایِ WH_SKYLINE بالا می‌رود (پیوسته و آرام) */
function drawWhLiveSmoke(d, dx) {
  ctx.save();
  if (dx) ctx.translate(dx, 0);
  const spr = d > 0.5 ? smokeSprDay() : smokeSpr();
  const a0 = 0.4 + 0.2 * (1 - d);
  for (const b of WH_SKYLINE) {
    if (!b.stack) continue;
    const cx2 = b.x + b.w * 0.7 + 4.5;
    const cy2 = GROUND_Y - b.h - 24;
    for (let p = 0; p < 3; p++) {
      const ph = ((animTime * 0.09 + p / 3 + (b.x % 37) * 0.008) % 1 + 1) % 1;
      const rise = ph * 88;
      const sway = Math.sin(animTime * 0.6 + p * 2.1 + b.x * 0.05) * (3 + ph * 12);
      const r = 5 + ph * 13;
      const a = (a0 - ph * a0 * 0.85);
      if (a <= 0.02) continue;
      ctx.globalAlpha = a;
      ctx.drawImage(spr, cx2 + sway - r, cy2 - rise - r, r * 2, r * 2);
    }
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

/* ------------------ صحنه‌ی رانندگی (۸٫۰) ------------------
   جاده‌ی شب زیر نور چراغ‌ها: خط‌چین متحرک، اجزای کنار راه (چراغ/درخت/
   بوته/سنگ/مانع)، زامبی‌های سرآمد، ماشین با بازیکن روی سقف و — وقتی
   نزدیک مقصد می‌شویم — محوشدنِ شهر سوخته در افقِ پیش‌رو. */
function drawDriveScene() {
  const cs = CS, dr = cs.drive;
  const d = state.dayness;                       // کات‌سین شب است (d ≈ ۰)

  /* افق شهر معمولی + تپه‌ها (پس‌زمینه‌ی ثابت — حس حرکت با اجزای نزدیک) */
  drawSkyline();
  ctx.fillStyle = mixHex('#16244a', '#8fae6e', d); drawHillRow(HILLS1);
  strokeCrest(HILLS1, mixHex('#2c4272', '#b7d193', d));

  /* نزدیک‌شدن به مقصد: شهر سوخته در افقِ پیش‌رو ظاهر می‌شود (۸٫۰: پررنگ) */
  if (dr.progress > 0.4) {
    ctx.save();
    ctx.globalAlpha = clamp((dr.progress - 0.4) / 0.35, 0, 1);
    drawRuinedSkyline(d);
    ctx.restore();
  }

  /* جاده‌ی آسفالت + شانه‌ها */
  const gg = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  gg.addColorStop(0, mixHex('#23262e', '#565b66', d));
  gg.addColorStop(1, mixHex('#101216', '#2e3238', d));
  ctx.fillStyle = gg;
  ctx.fillRect(-20, GROUND_Y, W + 40, H - GROUND_Y + 20);
  ctx.fillStyle = 'rgba(255,255,255,0.10)';       // لبه‌ی روشن سرِ جاده
  ctx.fillRect(-20, GROUND_Y, W + 40, 3);
  /* خط‌چین زرد وسط جاده — با اسکرول می‌دود (۸٫۰: پررنگ برای خوانایی) */
  const dash = 46, off = dr.scroll % (dash * 2);
  ctx.fillStyle = 'rgba(244,206,110,0.66)';
  for (let x = -dash * 2 + off; x < W + dash; x += dash * 2) {
    rr(x, GROUND_Y + 24, 32, 5.5, 2.5); ctx.fill();
  }
  ctx.fillStyle = 'rgba(220,215,200,0.14)';       // جدول کنار جاده
  ctx.fillRect(-20, GROUND_Y + 42, W + 40, 3);

  /* اجزای کنار راه */
  for (const p of DRIVE_PROPS) {
    const sx = p.wx - dr.scroll;
    if (sx < -70 || sx > W + 90) continue;
    drawRoadProp(p, sx);
  }

  /* زامبی‌های خیابانی + ماشینِ بازیکن (مرتب‌شده با عمق) */
  const ents = [];
  for (const z of dr.zombies) ents.push({ y: z.y, csZ: z });
  if (cs.car) ents.push({ y: cs.car.y - 1, car: cs.car });
  ents.sort((a, b) => a.y - b.y);
  for (const e of ents) {
    if (e.car) drawCar(e.car);
    else drawCsZombie(e.csZ);
  }
}

/* یک جزء کنار راه: چراغ‌برق / درخت / بوته / سنگ / مانعِ راه‌بندی
   (۱۰٫۰) در انتقال‌های فصل، CS.drive وجود ندارد → dr ممکن است null باشد */
function drawRoadProp(p, sx) {
  const dr = CS && CS.drive;
  const d = state.dayness;
  if (p.kind === 'lamp') {
    ctx.strokeStyle = mixHex('#151d33', '#3a4457', d); ctx.lineWidth = 3.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(sx, GROUND_Y + 2); ctx.lineTo(sx, GROUND_Y - 52); ctx.stroke();
    ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(sx, GROUND_Y - 52); ctx.lineTo(sx - 10, GROUND_Y - 52); ctx.stroke();
    let fl = 0.8 + 0.2 * Math.sin(animTime * 9 + p.ph);
    if (Math.random() < 0.01) fl = 0.3;
    ctx.fillStyle = 'rgba(255,214,120,' + (0.75 * fl * (1 - d * 0.8)).toFixed(2) + ')';
    circle(sx - 9, GROUND_Y - 50, 2.6);
    const g = ctx.createLinearGradient(sx - 9, GROUND_Y - 48, sx - 9, GROUND_Y + 4);
    g.addColorStop(0, 'rgba(255,214,120,' + (0.14 * fl * (1 - d * 0.8)).toFixed(2) + ')');
    g.addColorStop(1, 'rgba(255,214,120,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(sx - 14, GROUND_Y - 48); ctx.lineTo(sx - 4, GROUND_Y - 48);
    ctx.lineTo(sx + 6, GROUND_Y + 4); ctx.lineTo(sx - 26, GROUND_Y + 4);
    ctx.closePath(); ctx.fill();
  } else if (p.kind === 'tree') {
    drawTree(sx, p.s * 0.85, false);
  } else if (p.kind === 'bush') {
    ctx.fillStyle = mixHex('#12251a', '#3c5a33', d);
    for (const [ox, oy, r] of [[-8, 2, 7], [0, -2, 9], [9, 2, 6.5]]) {
      ctx.beginPath(); ctx.ellipse(sx + ox * p.s, GROUND_Y + oy * p.s, r * p.s, r * 0.72 * p.s, 0, 0, Math.PI * 2); ctx.fill();
    }
  } else if (p.kind === 'rock') {
    ctx.fillStyle = mixHex('#2a2d36', '#6a6f7a', d);
    ctx.beginPath();
    ctx.moveTo(sx - 9 * p.s, GROUND_Y + 3);
    ctx.lineTo(sx - 5 * p.s, GROUND_Y - 7 * p.s);
    ctx.lineTo(sx + 3 * p.s, GROUND_Y - 9 * p.s);
    ctx.lineTo(sx + 10 * p.s, GROUND_Y + 3);
    ctx.closePath(); ctx.fill();
  } else if (p.kind === 'barrier') {
    const hit = !!(dr && dr.hits && dr.hits[p.wx]);
    ctx.save();
    ctx.translate(sx, GROUND_Y + 2);
    if (hit) { ctx.rotate(0.42); ctx.translate(6, 2); }
    /* بدنه‌ی نارنجی-سفید راه‌بندی + پایه‌ها */
    ctx.fillStyle = hit ? '#7a4a20' : '#d8712c';
    rr(-17, -20, 34, 13, 2); ctx.fill();
    ctx.fillStyle = hit ? '#9c9c94' : '#f2ece0';
    for (const bx of [-13, -3, 7]) ctx.fillRect(bx, -20, 7, 13);
    ctx.fillStyle = '#3a3f4a';
    ctx.fillRect(-15, -8, 4, 10); ctx.fillRect(11, -8, 4, 10);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1.2;
    rr(-17, -20, 34, 13, 2); ctx.stroke();
    ctx.restore();
  }
}

/* آیکون کوچک برج مقصد (انتهای نوار پیشرفت رانندگی) */
function drawMiniTower(x, y) {
  const cols = ['#3f8d86', '#357871', '#9c4252'];
  for (let i = 0; i < 3; i++) {
    const w = 16 - i * 3;
    ctx.fillStyle = cols[i];
    ctx.fillRect(x - w / 2, y - 4 - i * 6, w, 6);
  }
  ctx.fillStyle = '#ffd873';
  circle(x, y - 24, 2);
}

/* ------------------ لایه‌ی رویی کات‌سین ------------------
   نوارهای سینمایی، زیرنویس مراحل، تپش قرمزِ لرزش، نوار پیشرفت و
   راهنمای رانندگی، محو/سیاهی و متن‌های صفحه‌ی سیاه — بعد از همه‌ی
   لایه‌ها رسم می‌شود */
function drawCutscene() {
  if (!CS) return;
  const t = CS.t;
  /* نوارهای سینمایی (ورود/خروج نرم) — حین رانندگی کوتاه‌تر تا جاده دیده شود */
  const lIn = clamp(t / 0.45, 0, 1);
  const lOut = clamp(((CS.post ? CS.post.end : CS_T.driveStart + 20) - t) / 0.55, 0, 1);
  const L = (CS.drive && !CS.drive.ended ? 26 : 46) * Math.min(lIn, lOut);
  if (L > 0.5) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, L);
    ctx.fillRect(0, H - L, W, L);
  }
  /* زیرنویس مراحل (کپسول پایین صحنه) */
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = 'bold 15px Vazirmatn, Tahoma, sans-serif';
  for (const c of CS_CAPS) {
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
  /* ---- HUD رانندگی: نوار «مسیر تا برج جدید» + راهنمای کنترل ---- */
  const dr = CS.drive;
  if (dr && !dr.ended && t > CS_T.driveStart + 0.4) {
    const pct = Math.round(dr.progress * 100);
    const bw = 430, bx = (W - bw) / 2, by = 58;
    ctx.font = 'bold 13px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#e8ecf5';
    ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 6;
    ctx.fillText('مسیر تا برج جدید — ' + faNum(pct) + '٪', W / 2, by - 13);
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(5,9,22,0.92)';
    rr(bx, by, bw, 14, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,216,115,0.55)'; ctx.lineWidth = 1.5;
    rr(bx, by, bw, 14, 7); ctx.stroke();
    const fw = (bw - 6) * dr.progress;
    if (fw > 4) {
      const fg = ctx.createLinearGradient(bx, 0, bx + bw, 0);
      fg.addColorStop(0, '#f0b53c'); fg.addColorStop(1, '#ffd873');
      ctx.fillStyle = fg;
      rr(bx + 3, by + 3, fw, 8, 4); ctx.fill();
    }
    /* نشان ماشین روی نوار + آیکون برج مقصد */
    ctx.fillStyle = '#e8563f';
    rr(bx + 3 + Math.max(0, fw - 8), by + 1.5, 15, 11, 3); ctx.fill();
    drawMiniTower(bx + bw + 20, by + 14);
    /* راهنمای کنترل (چند ثانیه‌ی اول) */
    const k = clamp((t - CS_T.driveStart - 0.6) / 0.4, 0, 1)
            * clamp((5.8 - (t - CS_T.driveStart)) / 0.8, 0, 1);
    if (k > 0.03) {
      ctx.globalAlpha = k;
      const hw = 470, hx = (W - hw) / 2, hy = by + 24;
      ctx.fillStyle = 'rgba(4,7,18,0.94)';
      rr(hx, hy, hw, 32, 16); ctx.fill();
      ctx.strokeStyle = 'rgba(255,216,115,0.6)'; ctx.lineWidth = 1.6;
      rr(hx, hy, hw, 32, 16); ctx.stroke();
      ctx.font = 'bold 14px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = '#ffd873';
      ctx.fillText('گاز', hx + hw - 54, hy + 16);        // سمت راست: گاز
      ctx.fillStyle = '#8fd6ff';
      ctx.fillText('ترمز', hx + 58, hy + 16);           // سمت چپ: ترمز
      ctx.fillStyle = '#c3cdea';
      ctx.font = 'bold 12px Vazirmatn, Tahoma, sans-serif';
      ctx.fillText('کلیدهای جهت‌دار یا لمس چپ/راست صفحه', W / 2, hy + 16);
      /* فلش‌های جهت (رسم مسیری — بدون متن، ضد به‌هم‌ریختگی RTL) */
      ctx.fillStyle = '#ffd873';
      ctx.beginPath(); ctx.moveTo(hx + hw - 26, hy + 15); ctx.lineTo(hx + hw - 36, hy + 9); ctx.lineTo(hx + hw - 36, hy + 21); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#8fd6ff';
      ctx.beginPath(); ctx.moveTo(hx + 26, hy + 15); ctx.lineTo(hx + 36, hy + 9); ctx.lineTo(hx + 36, hy + 21); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  /* پوشش سیاهی کوتاه هنگام ورود به جاده (تعویض صحنه زیر آن پنهان است) */
  if (CS.drive && t < CS_T.driveStart + 0.4) {
    const a = 1 - clamp((t - CS_T.driveStart) / 0.4, 0, 1);
    ctx.fillStyle = 'rgba(0,0,0,' + a.toFixed(3) + ')';
    ctx.fillRect(0, 0, W, H);
  }
  /* محو به سیاهی */
  if (CS.fade > 0.003) {
    ctx.fillStyle = 'rgba(0,0,0,' + CS.fade.toFixed(3) + ')';
    ctx.fillRect(0, 0, W, H);
  }
  /* متن‌های صفحه‌ی سیاه: اسلحه‌ها سوختند + غرامت + رسیدن به مقصد
     (پنجره‌ی زمانی — نه آلفای محو — تا با شروعِ روشن‌شدن صحنه ناپدید نشوند) */
  if (CS.post && t >= CS.post.black) {
    const tb = CS.post.black;
    const lines = [
      [tb + 0.15, 'bold 21px Vazirmatn, Tahoma, sans-serif', '#ff9d8a', 'اسلحه‌هایت زیر آوار ماند...'],
      [tb + 0.72, 'bold 26px Vazirmatn, Tahoma, sans-serif', '#ffd873', 'غرامت: +' + faNum(CS.compCoins) + ' سکه'],
      [tb + 1.35, 'bold 30px Vazirmatn, Tahoma, sans-serif', '#e8ecf5', 'به موقعیت جدید رسیدید...'],
      [tb + 1.9, 'bold 19px Vazirmatn, Tahoma, sans-serif', '#ffd873', '🏗 برج بعدی'],
    ];
    let li = 0;
    for (const [t0, font, col, txt] of lines) {
      const a = clamp((t - t0) / 0.45, 0, 1) * clamp((CS.post.fadeIn + 0.35 - t) / 0.3, 0, 1);
      if (a <= 0.02) { li++; continue; }
      ctx.globalAlpha = a;
      ctx.font = font; ctx.fillStyle = col;
      ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 12;
      ctx.fillText(txt, W / 2, H / 2 - 52 + li * 36);
      ctx.shadowBlur = 0;
      li++;
    }
    ctx.globalAlpha = 1;
  }
}

/* اتصال دکمه‌ی «رد کردن» (عنصر در HTML موجود است) — (۱۰٫۰):
   در هر حالت سینمایی، عملِ مناسب همان حالت انجام می‌شود */
$('skipCs').addEventListener('click', () => {
  if (state.mode === 'intro') skipIntro();
  else if (state.mode === 'transition') skipTransition();
  else if (state.mode === 'defeatcine') skipDefeatCine();   /* (۱۲٫۰) */
  else if (state.mode === 'sheltercine') skipShelterCine(); /* (۱۹٫۰) */
  else skipCutscene();
});
