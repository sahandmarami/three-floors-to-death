'use strict';
/* ==================================================================
   سه طبقه تا بقا — نسخه‌ی ۶٫۰ — منطق بازی (بخش ۱)
   ساختار کد برای گسترش‌پذیری ماژولار طراحی شده:
     ۱) ثابت‌ها و تنظیمات       ۲) ابزارهای کمکی
     ۳) موتور صدا (Web Audio)   ۴) وضعیت بازی
     ۵) ورودی (ماوس/کیبورد)     ۶) جریان موج‌ها و تولید زامبی
     ۷) شلیک و سلاح‌ها           ۸) زامبی‌ها: محاصره‌ی دسته‌جمعی برج
     ۹) سکه‌ها و قدرت‌های ویژه   ۱۰) اقتصاد و ارتقاها (ساخت‌وساز زنده)
   تازه‌های ۶٫۰:
     - پنل ساخت‌وساز در شب خودکار جمع می‌شود (دید کامل نقشه) و
       در روز باز می‌شود
     - عناصر تازه‌ی صحنه برای گرافیک بهتر: ستاره‌های درشت،
       دکل‌های آنتن با چراغ قرمز، گل‌ها، لبه‌ی چمن و بافت زمین
   ================================================================== */

/* ---------------------- ۱) ثابت‌ها و تنظیمات ---------------------- */
/* (۲۱٫۳) عرض دنیا «تطبیقی» است: ارتفاع همیشه ۵۶۰ ولی عرض از نسبت
   صفحه محاسبه می‌شود (۹۶۰ تا ۱۴۴۰). نتیجه: روی گوشی‌های عریض
   (نسبت ~۲:۱) دنیا خودش بازتر می‌شود و بازی «مستطیل کامل گوشی»
   را می‌پوشاند — بدون نوار سیاهِ چپ و راست. برج وسط (W/2) و
   لبه‌ی زادگاه زامبی‌ها (-۴۰ / W+۴۰) خودکار با آن جابه‌جا می‌شوند. */
const H = 560;
/* (۲۱٫۴) W واکنش‌گرا شد: در لحظه‌ی بارگذاری، مرورگر/وب‌ویو گاهی ابعادِ
   گذرایی (نابالغ) گزارش می‌کند و W برای همیشه غلطِ ۹۶۰ می‌ماند → نوار
   سیاه و ریزشدن صفحه. حالا W با refitWorld() هر بار که هنوز در منو
   هستیم و نسبت صفحه جا افتاده، بازسازی می‌شود (دستیابی به واقعی‌ترین
   نسبت صفحه). در گیم‌پلی برای ایمنی همان W قدیمی با لترباکس می‌ماند. */
let W = Math.max(960, Math.min(1440, Math.round(560 *
  ((window.innerWidth || 960) / Math.max(1, window.innerHeight || 560)))));
const GROUND_Y = 492;                      // خط زمین (پای زامبی‌ها)
const TOWER = { x: W / 2, baseHalf: 68, floorH: 66, floors: 3 };   /* x با refitWorld به‌رو‌ می‌شود */
const TOWER_TOP_Y = GROUND_Y - TOWER.floorH * TOWER.floors; // سقف برج = محل ایستادن بازیکن

const TOTAL_WAVES = 10;                    // تعداد کل موج‌ها
const INTERMISSION_TIME = 5;               // (فقط دیباگ: skipToWave)
const INTERMISSION_FIRST = 3;              // شمارش معکوس کوتاه قبل از موج اول (شروع شب)

/* چهار نوع دشمن — هر کدام جون/سرعت/آسیب/سکه‌ی مخصوص خودشان را دارند:
   normal معمولی سبک | fast سریعِ کم‌جون | tank زره‌پوش سنگین | boss پادشاهِ آخرین شب
   (۲۰٫۰) بازخورد کاربر «برجک‌ها بدونِ من بازی رو می‌برن — خیلی راحته»:
   جون پایه و رشدِ موج زامبی‌ها به‌طور محسوس بالا رفت تا حضور و تیرِ
   خودِ بازیکن دوباره لازم شود (برجک‌ها هم کمی تنزل کردند — پایین‌تر) */
const ZTYPES = {
  normal: { r: 15, hpBase: 11, hpWave: 3.1, spdBase: 27, spdWave: 7.5, bite: 1.0, dmg: 5,  coins: [5, 7],
            skin: '#7fa657', shirt: '#4a5d73', pants: '#333d4d' },
  fast:   { r: 12, hpBase: 7,  hpWave: 2.2, spdBase: 64, spdWave: 9.5, bite: 0.7, dmg: 3,  coins: [4, 5],
            skin: '#c9a35a', shirt: '#7a5a2e', pants: '#4d3d20' },
  tank:   { r: 22, hpBase: 64, hpWave: 13,  spdBase: 14, spdWave: 2.4, bite: 1.5, dmg: 11, coins: [12, 16],
            skin: '#8a8794', shirt: '#565364', pants: '#3a3846' },
  boss:   { r: 50, hpBase: 7000, hpWave: 0, spdBase: 13.5, spdWave: 1, bite: 1.8, dmg: 48, coins: [80, 100],   /* (۲۰٫۰) سختی بیشتر */
            skin: '#9c3546', shirt: '#5e1f2c', pants: '#3f151d' },
};

/* ترکیب موج‌ها: n=معمولی، f=سریع، t=تانک، b=پادشاه — با هر موج فشار بیشتر می‌شود */
const WAVES = [
  { n: 6,  f: 0,  t: 0, b: 0 },
  { n: 9,  f: 0,  t: 0, b: 0 },
  { n: 10, f: 3,  t: 0, b: 0 },
  { n: 12, f: 5,  t: 1, b: 0 },
  { n: 14, f: 7,  t: 2, b: 0 },
  { n: 16, f: 9,  t: 3, b: 0 },
  { n: 19, f: 11, t: 4, b: 0 },
  { n: 22, f: 13, t: 5, b: 0 },
  { n: 26, f: 16, t: 6, b: 0 },
  { n: 16, f: 10, t: 7, b: 1 },
];

/* سه سلاح — knock = میزان پس‌زنیِ زامبی در هر برخورد (حس فیزیکی شلیک)
   (۵٫۰: قیمت شاتگان و مسلسل حدود نصف شد) */
const WEAPONS = {
  pistol:  { name: 'کلت', dmg: 3, rate: 0.30, spd: 720, pellets: 1, spread: 0.02,  ttl: 2,
             price: 0,   owned: true,  barrel: 18, flash: 5, knock: 5,   sfx: 'shootP' },
  shotgun: { name: 'شاتگان', dmg: 2, rate: 0.95, spd: 640, pellets: 6, spread: 0.16,  ttl: 0.5,
             price: 120, owned: false, barrel: 22, flash: 9, knock: 2.6, sfx: 'shootS' },
  mg:      { name: 'مسلسل', dmg: 2, rate: 0.12, spd: 760, pellets: 1, spread: 0.055, ttl: 2,
             price: 260, owned: false, barrel: 24, flash: 6, knock: 1.6, sfx: 'shootM' },
};

/* تنظیمات ساخت‌وساز (۵٫۰: اقتصاد نو — قیمت‌ها حدود نصف و رشد ملایم‌تر):
   قیمت‌های ارتقا تصاعدی‌اند (growth^سطح)؛ سلاح‌ها یک‌بار خریداری می‌شوند */
const UPGRADES = {
  weapon:  { name: 'ارتقای اسلحه',     base: 15, growth: 1.55, max: 8 },
  speed:   { name: 'سرعت شلیک',      base: 18, growth: 1.55, max: 6 },   // (۹٫۰) آیکون کفشِ تصویر مرجع — ۸٪ نرخ شلیک سریع‌تر در هر سطح
  health:  { name: 'افزایش جون برج',   base: 12, growth: 1.45, max: 8, bonus: 30 },
  trap:    { name: 'نصب تله پایه برج', base: 20, growth: 1.55, max: 5,
             dps: 10, dpsPerLvl: 8, radius: 95 },   // آسیب در ثانیه و شعاع مؤثر تله
  turretUp:{ name: 'ارتقای برجک‌ها',   base: 90, growth: 1.55, max: 5 },  /* (۲۰٫۰) +۲۲٪ دمیج و +۹٪ سرعت شلیک در هر سطح */
  shotgun: { price: 120 },                          // خرید یک‌باره
  mg:      { price: 260 },                          // خرید یک‌باره
  repair:  { price: 25, frac: 0.5 },                // ترمیم ۵۰٪ جون بیشینه (۱۵٫۰ ارزان‌تر)
};

/* برجک‌های دفاعی خودکار (۴٫۰) — روی زمین نصب می‌شوند و خودشان به زامبی‌ها شلیک می‌کنند:
   gatling رگبار سریع با برد متوسط | sniper تک‌ضرب کُشنده با برد بلند و شانس کریت
   frost زامبی را کند و یخ‌زده می‌کند (chill = ثانیه‌ی اثر کندشدن) */
const TURRETS = {
  gatling: { name: 'برجک مسلسل',    price: 85,  dmg: 1.6, rate: 0.34, range: 230, spd: 640,
             len: 17, h: 16, knock: 1.2, sub: 'رگبار پیوسته • دمیج ۲ • برد ۲۳۰' },
  sniper:  { name: 'برجک تک‌تیرانداز', price: 200, dmg: 12, rate: 2.15,  range: 400, spd: 950,
             len: 30, h: 19, knock: 6, crit: 0.20, sub: 'تک‌ضرب کُشنده • دمیج ۱۲ • برد ۴۰۰' },
  frost:   { name: 'برجک یخ‌زن',     price: 125, dmg: 2,  rate: 1.05, range: 175, spd: 380,
             len: 13, h: 20, knock: 0, chill: 2, sub: 'کند کردن زامبی • دمیج ۲ • برد ۱۷۵' },
  /* (۲۰٫۰) برجک‌های ویژه‌ی فروشنده‌ی مرموز — فقط با خریدِ «نقشه‌ی ساخت»
     از خودِ او باز می‌شوند (در تب برجک‌ها ظاهر می‌شوند) */
  tesla:   { name: 'برجک تسلا',       price: 240, dmg: 9,  rate: 2.3,  range: 260, spd: 0,
             len: 14, h: 24, knock: 2, chain: 3, rare: true,
             sub: 'آذرخش زنجیره‌ای به ۳ هدف • فقط از دستفروش' },
  missile: { name: 'برجک موشک‌انداز', price: 300, dmg: 26, rate: 3.4,  range: 520, spd: 430,
             len: 16, h: 20, knock: 5, splash: 95, rare: true,
             sub: 'انفجارِ محدوده‌ای • فقط از دستفروش' },
  flame:   { name: 'برجک شعله‌افکن',  price: 210, dmg: 2.4, rate: 0.085, range: 150, spd: 330,
             len: 15, h: 17, knock: 0.4, burn: 2.4, burnDps: 6, rare: true,
             sub: 'شعله‌ی پیوسته + آتشِ‌گیرندگی • فقط از دستفروش' },
};
const MAX_TURRETS = 6;                       // حداکثر تعداد برجک روی نقشه

/* جعبه‌های قدرت (۳٫۰) — از زامبی‌های کشته‌شده می‌افتند و به بازیکن پرو می‌کنند */
const PTYPES = {
  medkit: { name: 'کمک‌های اولیه', color: '#7be389', heal: 24 },
  rapid:  { name: 'شلیک سریع',    color: '#ffd873', dur: 8 },
  freeze: { name: 'انجماد',       color: '#8fd6ff', dur: 5 },
  coin:   { name: 'بار سکه',      color: '#f5c542', bonus: 15 },
};
const POWER_LIFE = 9.5;                    // ثانیه عمر جعبه (اگر زودتر به بازیکن نرسد)

/* رکوردهای کمبو: پیام + جایزه‌ی سکه (۵٫۰: جایزه‌ها پررنگ‌تر شد) */
const COMBO_MILESTONES = {
  3:  { msg: 'سه‌گانه!',        bonus: 3 },
  5:  { msg: 'کشتار مضاعف!',   bonus: 5 },
  8:  { msg: 'توقف‌ناپذیر!',    bonus: 8 },
  12: { msg: 'زمین‌لرزه!',      bonus: 12 },
  18: { msg: 'خدای زامبی‌کُش!', bonus: 18 },
};
const COMBO_WINDOW = 2.2;                  // ثانیه‌ی اعتبار کمبو بین هر دو کشتن

/* ---------------------- ۲) ابزارهای کمکی ---------------------- */
const $ = id => document.getElementById(id);

/* تبدیل ارقام لاتین به فارسی (۰-۹) */
const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
function faNum(n) { return String(n).replace(/\d/g, d => FA_DIGITS[d]); }

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function rand(a, b) { return a + Math.random() * (b - a); }

/* عدد تصادفیِ «Seed دار» — برای تولید ستاره/تپه/ساختمان‌های ثابت (تا در هر فریم عوض نشوند) */
let _seed = 1379;
function srand() { _seed = (_seed * 16807) % 2147483647; return (_seed - 1) / 2147483646; }

/* تبدیل رنگ hex به رشته‌ی rgba با آلفا (برای هاله‌های نور) */
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
}

let STARS, HILLS1, HILLS2, PEBBLES, CLOUDS, FIREFLIES, GRASS, PUDDLES, SKYLINE, SKYLINE_WINS, BIGSTARS, ANTENNAS, FLOWERS, GRASS_EDGE, GROUND_STREAKS;   /* (۲۱٫۴) همه با buildScenery() ساخته می‌شوند تا بعد از جاافتادنِ نسبتِ
   صفحه (منو) بازسازی شوند — بذرِ ثابت ۱۳۷۹ یعنی منظره‌ی همیشگی تغییر نمی‌کند */
function buildScenery() {
  _seed = 1379;
/* عناصر ثابت صحنه: ستاره‌ها، تپه‌ها، سنگ‌ریزه‌ها، ابرها و افق شهر یک بار ساخته می‌شوند */
STARS = Array.from({ length: 80 }, () => ({
  x: srand() * W, y: srand() * (GROUND_Y - 90), r: 0.6 + srand() * 1.4,
  ph: srand() * 6.28, sp: 0.5 + srand() * 1.6,
}));
/* (۲۱٫۳) تپه/ابر/برکه/چراغ نسبت به W تعریف می‌شوند تا روی دنیای عریض‌تر
   (گوشی‌های ~۲:۱) تا لبه‌ی صفحه کشیده و متقارن بیایند */
HILLS1 = Array.from({ length: Math.ceil((W + 90) / 60) }, (_, i) => ({ x: -30 + i * 60, h: 22 + srand() * 36 }));
HILLS2 = Array.from({ length: Math.ceil((W + 125) / 85) }, (_, i) => ({ x: -40 + i * 85, h: 10 + srand() * 18 }));
PEBBLES = Array.from({ length: 26 }, () => ({ x: srand() * W, dy: 2 + srand() * 12, r: 0.8 + srand() * 1.6 }));
/* ابرهای شناور (با سرعت‌های متفاوت برای حس پارالاکس — ۶٫۰: دو ابر دیگر) */
CLOUDS = [
  { x: W * 0.146, y: 58,  s: 1.15, v: 6 },
  { x: W * 0.542, y: 96,  s: 0.8,  v: 9 },
  { x: W * 0.865, y: 44,  s: 1.35, v: 5 },
  { x: W * 0.313, y: 128, s: 0.6,  v: 12 },
  { x: W * 0.688, y: 30,  s: 0.75, v: 10 },
];
/* کرم‌های شب‌تاب (۳٫۰): نقاط نور کوچکی که آرام حول زمین شنا می‌شوند */
FIREFLIES = Array.from({ length: 14 }, () => ({
  cx: srand() * W, cy: GROUND_Y - 8 - srand() * 66,
  rx: 18 + srand() * 40, ry: 6 + srand() * 22,
  ph: srand() * 6.28, sp: 0.35 + srand() * 0.6,
}));
/* دسته‌های چمن کنار جاده (۳٫۰) */
GRASS = Array.from({ length: 40 }, () => ({ x: srand() * W, h: 4 + srand() * 8, ph: srand() * 6.28 }));
/* برکه‌های کوچک بازتابنده‌ی نور ماه (۳٫۰) */
PUDDLES = [{ x: W * 0.156, w: 52 }, { x: W * 0.408, w: 66 }, { x: W * 0.663, w: 46 }];
/* افق شهر در دوردست: ساختمان‌های سیاه‌شکلی با پنجره‌های روشن (پیش‌محاسبه‌شده) */
SKYLINE = [];
SKYLINE_WINS = [];
{
  let x = -12, i = 0;
  while (x < W + 12) {
    const bw = 34 + srand() * 52, bh = 26 + srand() * 95;
    SKYLINE.push({ x, w: bw, h: bh });
    /* پنجره‌های روشنِ همین ساختمان (۶٫۰: هر پنجره فاز سوسوی خودش را دارد) */
    const cols = Math.floor((bw - 8) / 9), rows = Math.floor((bh - 10) / 13);
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
      if (srand() > 0.72) {
        SKYLINE_WINS.push({
          x: x + 5 + c * 9, y: GROUND_Y - bh + 6 + r * 13, ph: srand() * 6.28,
          c: srand() > 0.82 ? 'rgba(127,179,255,0.8)' : 'rgba(255,214,122,0.75)',
        });
      }
    }
    x += bw + 8; i++;
  }
}
/* ---------- عناصر تازه‌ی صحنه (۶٫۰: ارتقای گرافیک) ---------- */
/* ستاره‌های درشت با برقِ چهارپر — روی ستاره‌های ریز قبلی */
BIGSTARS = Array.from({ length: 6 }, () => ({
  x: 30 + srand() * (W - 60), y: 16 + srand() * (GROUND_Y - 210),
  r: 1.5 + srand() * 1.1, ph: srand() * 6.28, sp: 0.6 + srand() * 1.1,
}));
/* دکل‌های آنتن روی بلندترین ساختمان‌ها + چراغ قرمز چشمک‌زنِ هشدار (شب) */
ANTENNAS = [];
for (const b of SKYLINE) {
  if (b.h > 82 && ANTENNAS.length < 7 && srand() > 0.3) {
    ANTENNAS.push({ x: b.x + b.w / 2, top: GROUND_Y - b.h, h: 13 + srand() * 17, ph: srand() * 6.28 });
  }
}
/* گل‌های کوچک کنار زمین: روز باز و رنگی، شب بسته و کم‌رنگ */
FLOWERS = Array.from({ length: 14 }, () => ({
  x: 20 + srand() * (W - 40), dy: 4 + srand() * 12,
  hue: Math.floor(srand() * 360), s: 0.75 + srand() * 0.5, ph: srand() * 6.28,
}));
/* لبه‌ی ناهموار چمنِ خط زمین (تیغه‌های ریز) */
GRASS_EDGE = Array.from({ length: 70 }, () => ({ x: srand() * W, h: 2 + srand() * 4.5, ph: srand() * 6.28 }));
/* رگه‌های افقی بافت خاک (عمق متفاوت برای حجم دادن به زمین) */
GROUND_STREAKS = Array.from({ length: 12 }, () => ({
  x: srand() * W, w: 46 + srand() * 110, dy: 7 + srand() * 36, a: 0.05 + srand() * 0.06,
}));
}
buildScenery();                        /* (۲۱٫۴) ساختِ اولیه — همان مقادیر همیشگی (بذر ۱۳۷۹) */

/* ---------------------- (۲۱٫۴) بازسازی دنیا برای نسبتِ تازه‌ی صفحه ----------------------
   فقط در منو (mode==='start') صدا زده می‌شود — وسط بازی لترباکسِ امن ترجیح داده
   می‌شود. بوم/کش‌ها با setDPR تازه می‌شوند و زامبی‌های منو دوباره چیده می‌شوند. */
function refitWorld(aw, ah) {
  const want = Math.max(960, Math.min(1440, Math.round(560 * (aw / Math.max(1, ah)))));
  if (want === W) return false;
  W = want;
  TOWER.x = W / 2;
  buildScenery();
  try { LAMPS.length = 2; LAMPS[0] = Math.round(W * 0.245); LAMPS[1] = Math.round(W * 0.755); } catch (e) {}
  setDPR(DPR);                       /* بومِ تازه + بی‌اعتبارسازی کش‌های پخته */
  try { if (typeof initMenuZ === 'function' && state.mode === 'start') initMenuZ(); } catch (e) {}
  return true;
}

/* ---------------------- ۳) موتور صدا (Web Audio) ---------------------- */
/* همه‌ی صداها همین‌جا سینتز می‌شوند — هیچ فایل صوتی خارجی وجود ندارد.
   AudioContext فقط بعد از اولین تعامل کاربر ساخته می‌شود (سیاست مرورگرها). */
const Snd = {
  ctx: null, master: null, noiseBuf: null, muted: false, ready: false,
  musicOn: true, musicGain: null,       // (۱۰٫۰) کلید موسیقی محیطی (پد + باد)

  init() {
    if (this.ready) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : (typeof SETT !== 'undefined' ? (SETT.vol / 100) * 0.9 : 0.5);   // (۱۰٫۰) بلندی از تنظیمات
      this.master.connect(this.ctx.destination);
      /* بافر نویز سفید یک‌ثانیه‌ای (برای شلیک/برخورد/باد/رعد) */
      this.noiseBuf = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let j = 0; j < d.length; j++) d[j] = Math.random() * 2 - 1;
      this.ready = true;
      this.startAmbient();
    } catch (e) { /* مرورگر بدون صدا */ }
  },
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },
  /* (۱۰٫۰) روشن/خاموش کردن موسیقی محیطی با رمپ نرم */
  setMusic(on) {
    this.musicOn = on;
    if (this.musicGain && this.ctx) {
      try {
        this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.musicGain.gain.linearRampToValueAtTime(on ? 1 : 0.0001, this.ctx.currentTime + 0.4);
      } catch (e) {}
    }
  },
  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.5;
    return this.muted;
  },

  /* یک نُت: {type,f0,f1,dur,vol,att,delay} */
  tone(o) {
    if (!this.ready || this.muted) return;
    try {
      const t0 = this.ctx.currentTime + (o.delay || 0);
      const osc = this.ctx.createOscillator(), g = this.ctx.createGain();
      osc.type = o.type || 'sine';
      osc.frequency.setValueAtTime(Math.max(1, o.f0), t0);
      if (o.f1) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.f1), t0 + o.dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(o.vol, t0 + (o.att || 0.008));
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
      osc.connect(g); g.connect(this.master);
      osc.start(t0); osc.stop(t0 + o.dur + 0.05);
    } catch (e) {}
  },
  /* نویز فیلترشده: {dur,vol,ftype,freq,q,att,delay} */
  noise(o) {
    if (!this.ready || this.muted) return;
    try {
      const t0 = this.ctx.currentTime + (o.delay || 0);
      const src = this.ctx.createBufferSource(); src.buffer = this.noiseBuf; src.loop = true;
      const f = this.ctx.createBiquadFilter();
      f.type = o.ftype || 'lowpass'; f.frequency.value = o.freq || 1000; f.Q.value = o.q || 0.8;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(o.vol, t0 + (o.att || 0.005));
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
      src.connect(f); f.connect(g); g.connect(this.master);
      src.start(t0); src.stop(t0 + o.dur + 0.05);
    } catch (e) {}
  },

  /* موسیقی محیطیِ شب: درونِ بم + باد + نُت‌های پراکنده‌ی دل‌انگیز */
  startAmbient() {
    try {
      /* (۱۰٫۰) گیت موسیقی: پد و باد از این‌جا رد می‌شوند تا از تنظیمات خاموش شوند */
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicOn === false ? 0.0001 : 1;
      this.musicGain.connect(this.master);
      const dg = this.ctx.createGain(); dg.gain.value = 0.045; dg.connect(this.musicGain);
      const o1 = this.ctx.createOscillator(); o1.type = 'triangle'; o1.frequency.value = 55;
      const o2 = this.ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 110;
      const lfo = this.ctx.createOscillator(); lfo.frequency.value = 0.09;
      const lg = this.ctx.createGain(); lg.gain.value = 0.02;
      lfo.connect(lg); lg.connect(dg.gain);
      o1.connect(dg); o2.connect(dg);
      o1.start(); o2.start(); lfo.start();
      /* صدای باد (نویز لوپِ بسیار بم) */
      const wind = this.ctx.createBufferSource(); wind.buffer = this.noiseBuf; wind.loop = true;
      const wf = this.ctx.createBiquadFilter(); wf.type = 'lowpass'; wf.frequency.value = 260;
      const wg = this.ctx.createGain(); wg.gain.value = 0.02;
      wind.connect(wf); wf.connect(wg); wg.connect(this.musicGain); wind.start();
      /* (۱۱٫۰) ملودی‌های پراکنده‌ی قدیمی حذف شد — آهنگساز MUSIC (بخش ۱۰) جایگزین است */
    } catch (e) {}
  },
  pluck() {
    if (!this.ready || this.musicOn === false) return;   // (۱۰٫۰) با موسیقی خاموش، نت‌ها هم خاموش
    const notes = [220, 246.9, 261.6, 329.6, 392];
    const f = notes[Math.floor(rand(0, notes.length))];
    this.tone({ type: 'sine', f0: f, dur: 2.4, vol: 0.05, att: 0.5 });
    this.tone({ type: 'sine', f0: f * 1.5, dur: 2.8, vol: 0.028, att: 0.7, delay: 0.03 });
    setTimeout(() => this.pluck(), rand(3500, 8000));
  },
};

/* جلوی اسپمِ صداهای پرتکرار (مثل برخورد ۶ ساچمه‌ی شاتگان در یک فریم) */
const _sfxGate = {};
function sfxGate(name, ms) {
  const t = performance.now();
  if ((_sfxGate[name] || 0) + ms > t) return false;
  _sfxGate[name] = t;
  return true;
}

/* کتابخانه‌ی جلوه‌های صوتی بازی (۳٫۰: کریت/کمبو/رعد/قدرت/ضربان/اسلوموشن اضافه شد) */
const SFX = {
  click()    { Snd.tone({ type: 'square',   f0: 1300, f1: 850, dur: 0.05, vol: 0.07 }); },
  shootP()   { Snd.noise({ dur: 0.09, vol: 0.20, ftype: 'highpass', freq: 700 });
               Snd.tone({ type: 'square',   f0: 230,  f1: 70,  dur: 0.08, vol: 0.11 }); },
  shootS()   { Snd.noise({ dur: 0.22, vol: 0.32, freq: 1300 });
               Snd.tone({ type: 'sine',     f0: 105,  f1: 36,  dur: 0.24, vol: 0.28 }); },
  shootM()   { Snd.noise({ dur: 0.05, vol: 0.13, ftype: 'bandpass', freq: 1700, q: 1.1 });
               Snd.tone({ type: 'square',   f0: 300,  f1: 110, dur: 0.05, vol: 0.06 }); },
  hit()      { if (!sfxGate('hit', 60)) return;
               Snd.tone({ type: 'square',   f0: 165,  f1: 90,  dur: 0.06, vol: 0.09 }); },
  crit()     { if (!sfxGate('crit', 60)) return;
               Snd.tone({ type: 'triangle', f0: 1500, f1: 2050, dur: 0.07, vol: 0.10 });
               Snd.tone({ type: 'triangle', f0: 2050, f1: 2650, dur: 0.09, vol: 0.08, delay: 0.05 }); },
  combo(n)   { const f = 420 * Math.pow(1.14, Math.min(n, 18));
               Snd.tone({ type: 'triangle', f0: f, dur: 0.09, vol: 0.12 });
               Snd.tone({ type: 'triangle', f0: f * 1.5, dur: 0.14, vol: 0.10, delay: 0.07 }); },
  death()    { if (!sfxGate('death', 70)) return;
               Snd.tone({ type: 'sawtooth', f0: 180,  f1: 42,  dur: 0.30, vol: 0.14 });
               Snd.noise({ dur: 0.22, vol: 0.12, freq: 650 }); },
  coin()     { if (!sfxGate('coin', 70)) return;
               Snd.tone({ type: 'sine',     f0: 920,  dur: 0.07, vol: 0.12 });
               Snd.tone({ type: 'sine',     f0: 1360, dur: 0.15, vol: 0.12, delay: 0.07 }); },
  towerHit() { if (!sfxGate('towerHit', 90)) return;
               Snd.tone({ type: 'sine',     f0: 78,   f1: 40,  dur: 0.20, vol: 0.32 });
               Snd.noise({ dur: 0.16, vol: 0.20, freq: 260 }); },
  buy()      { Snd.tone({ type: 'triangle', f0: 520,  f1: 760,  dur: 0.09, vol: 0.15 });
               Snd.tone({ type: 'triangle', f0: 760,  f1: 1140, dur: 0.14, vol: 0.15, delay: 0.09 }); },
  deny()     { Snd.tone({ type: 'square',   f0: 130,  dur: 0.09, vol: 0.11 });
               Snd.tone({ type: 'square',   f0: 96,   dur: 0.15, vol: 0.11, delay: 0.10 }); },
  wave()     { Snd.tone({ type: 'sawtooth', f0: 196,  dur: 0.15, vol: 0.11 });
               Snd.tone({ type: 'sawtooth', f0: 262,  dur: 0.20, vol: 0.11, delay: 0.16 }); },
  clear()    { [440, 554, 659].forEach((f, i) => Snd.tone({ type: 'triangle', f0: f, dur: 0.16, vol: 0.11, delay: i * 0.09 })); },
  gameover() { [330, 262, 196, 131].forEach((f, i) => Snd.tone({ type: 'triangle', f0: f, dur: 0.34, vol: 0.15, delay: i * 0.22 })); },
  victory()  { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => Snd.tone({ type: 'triangle', f0: f, dur: 0.20, vol: 0.14, delay: i * 0.13 })); },
  trap()     { if (!sfxGate('trap', 200)) return;
               Snd.tone({ type: 'square',   f0: 420,  f1: 110, dur: 0.06, vol: 0.07 }); },
  roar()     { Snd.tone({ type: 'sawtooth', f0: 72,   f1: 30,  dur: 0.90, vol: 0.26 });
               Snd.noise({ dur: 0.80, vol: 0.18, freq: 300 }); },
  bossDie()  { Snd.tone({ type: 'sawtooth', f0: 160,  f1: 24,  dur: 1.10, vol: 0.24 }); SFX.victory(); },
  thunder()  { if (!sfxGate('thunder', 800)) return;
               Snd.noise({ dur: 1.8, vol: 0.24, freq: 110, q: 0.4, att: 0.12 });
               Snd.tone({ type: 'sine',     f0: 52,   f1: 30,  dur: 1.6, vol: 0.18, att: 0.05 }); },
  power()    { [620, 830, 1240].forEach((f, i) => Snd.tone({ type: 'triangle', f0: f, dur: 0.12, vol: 0.12, delay: i * 0.06 })); },
  freeze()   { Snd.noise({ dur: 0.5, vol: 0.10, ftype: 'highpass', freq: 4000 });
               Snd.tone({ type: 'sine',     f0: 1800, f1: 600,  dur: 0.5,  vol: 0.08 }); },
  heartbeat(){ Snd.tone({ type: 'sine',     f0: 64,   f1: 40,  dur: 0.12, vol: 0.22 });
               Snd.tone({ type: 'sine',     f0: 58,   f1: 36,  dur: 0.14, vol: 0.18, delay: 0.18 }); },
  slowmo()   { Snd.tone({ type: 'sawtooth', f0: 400,  f1: 60,  dur: 0.5,  vol: 0.10 }); },
  /* صداهای چرخه‌ی روز و شب (۵٫۰) */
  morning(){ [1500, 1820, 1500, 2050].forEach((f, i) =>
               Snd.tone({ type: 'sine', f0: f, f1: f * 1.18, dur: 0.13, vol: 0.09, delay: i * 0.15 })); },
  dusk()   { Snd.tone({ type: 'sawtooth', f0: 160, f1: 55, dur: 0.9,  vol: 0.12 });
             Snd.tone({ type: 'sine',     f0: 240, f1: 115, dur: 1.0, vol: 0.07, delay: 0.12 }); },
  /* صداهای برجک‌های دفاعی (۴٫۰) */
  turShot()  { if (!sfxGate('turShot', 110)) return;
               Snd.noise({ dur: 0.06, vol: 0.10, ftype: 'bandpass', freq: 1500, q: 1 });
               Snd.tone({ type: 'square',   f0: 210, f1: 90,  dur: 0.05, vol: 0.05 }); },
  sniperShot(){ if (!sfxGate('sniperShot', 300)) return;
               Snd.noise({ dur: 0.30, vol: 0.26, freq: 900 });
               Snd.tone({ type: 'sine',     f0: 150, f1: 40,  dur: 0.32, vol: 0.24 });
               Snd.tone({ type: 'triangle', f0: 620, f1: 190, dur: 0.30, vol: 0.06, delay: 0.14 }); },
  frostShot(){ if (!sfxGate('frostShot', 150)) return;
               Snd.tone({ type: 'sine',     f0: 1600, f1: 520, dur: 0.22, vol: 0.07 });
               Snd.noise({ dur: 0.14, vol: 0.05, ftype: 'highpass', freq: 5000 }); },
  /* (۲۰٫۰) صداهای برجک‌های ویژه‌ی دستفروش */
  zap()        { if (!sfxGate('zap', 120)) return;
               Snd.tone({ type: 'sawtooth', f0: 2400, f1: 300, dur: 0.10, vol: 0.09 });
               Snd.noise({ dur: 0.10, vol: 0.06, ftype: 'highpass', freq: 3000 }); },
  missileShot(){ if (!sfxGate('missileShot', 250)) return;
               Snd.noise({ dur: 0.4, vol: 0.16, freq: 700 });
               Snd.tone({ type: 'sawtooth', f0: 320, f1: 640, dur: 0.35, vol: 0.07 }); },
  missileBoom(){ if (!sfxGate('missileBoom', 90)) return;
               Snd.noise({ dur: 0.5, vol: 0.24, freq: 200 });
               Snd.tone({ type: 'sine', f0: 90, f1: 34, dur: 0.5, vol: 0.22 }); },
  flameShot()  { if (!sfxGate('flameShot', 70)) return;
               Snd.noise({ dur: 0.12, vol: 0.06, ftype: 'bandpass', freq: 900, q: 0.8 }); },
  placeT()   { Snd.tone({ type: 'sine',     f0: 130, f1: 55,  dur: 0.14, vol: 0.22 });
               Snd.noise({ dur: 0.12, vol: 0.14, freq: 320 }); },
};

/* فعال‌سازی صدا با اولین تعامل کاربر (سیاست autoplay مرورگرها) */
const armAudio = () => { Snd.init(); Snd.resume(); try { VOICE.warmup(); } catch (e) {} };
window.addEventListener('pointerdown', armAudio, { passive: true });
window.addEventListener('keydown', armAudio);

/* ---------------------- ۴) وضعیت بازی ---------------------- */
/* mode (وضعیت‌های بازی):
   start        منوی اصلی (صحنه‌ی زنده: زامبی‌های تزئینی دور برج می‌خزند)
   playing      درگیر موج فعلی (شب)
   intermission شمارش معکوس کوتاه قبل از موج ۱ (فقط شروع بازی)
   day          روزِ بین موج‌ها (۵٫۰): بدون زامبی، خرید آزاد، دکمه‌ی «شب شود»
   paused       توقف دستی
   defeatcine   سینماییِ سقوط برج هنگام باخت (۱۲٫۰)
   gameover     صفحه‌ی باخت (بعد از سینماییِ سقوط)
   victory      برد */
const state = {
  mode: 'start', prevMode: null,
  time: 0,                                 // زمان منطقی بازی (در توقف ثابت می‌ماند)
  wave: 0,                                 // موج فعلی (۰ = هنوز شروع نشده)
  intermission: 0,                         // ثانیه باقی‌مانده تا موج بعد (فقط شروع)
  dayness: 0,                              // میزان روشنایی روز: ۰ = شب، ۱ = روز کامل (۵٫۰)
  dayTarget: 0,                            // هدف گذار روز/شب (۵٫۰)
  goingNight: false,                       // در حال گذار به شب بعد از کلیک دکمه (۵٫۰)
  spawn: { queue: [], timer: 0, interval: 2, bossDelay: false }, // صف تولد زامبی‌های موج
  coins: 0,
  tower: { hp: 100, maxHp: 100 },
  upgrades: { weapon: 0, health: 0, trap: 0 },
  weapon: 'pistol',                        // سلاح انتخاب‌شده
  zombies: [], bullets: [], coinsArr: [], particles: [], texts: [], zaps: [],
  turrets: [],                              // برجک‌های دفاعیِ نصب‌شده (۴٫۰)
  placing: null,                            // نوع برجکی که منتظر کلیک نصب است (۴٫۰)
  tipTurret: false,                         // راهنمای نصب فقط بار اول نشان داده شود
  powerups: [],                            // جعبه‌های قدرتِ روی صحنه
  decals: [],                              // لکه‌های خون روی زمین (۳٫۰)
  powerTimers: { rapid: 0, freeze: 0 },    // زمان‌سنج قدرت‌های فعال
  adren: 0,                                    // (۲۰٫۰) زمان‌سنج آدرنالینِ دستفروش
  combo: 0, comboT: 0, comboPop: 0,        // سیستم کمبو
  killsSinceDrop: 0,                       // شمارش برای «شفقت»: حتماً جعبه بیفتد
  heartT: 0,                               // زمان‌سنج ضربان قلبِ بحران
  mouse: { x: W / 2, y: 120, down: false },
  aimAngle: -Math.PI / 2,                  // زاویه اسلحه بازیکن رو به ماوس
  shake: 0, flash: 0,                      // لرزش دوربین و فلش قرمزِ آسیب برج
  fireFlash: 0, recoil: 0,                 // جلوه شلیک (نور دهانه + عقب‌راندگی اسلحه)
  hitMark: 0, hitMarkCrit: false,          // نشانگر برخورد گلوله (۳٫۰)
  muzzleGlow: 0,                           // نور محیطیِ دهانه‌ی اسلحه (۳٫۰)
  slowmo: 0,                               // ثانیه‌ی اسلوموشن سینمایی (۳٫۰)
  lightning: { t: rand(9, 20), a: 0 },     // رعدوبرق گاه‌به‌گاه (۳٫۰)
  upgrades: { weapon: 0, health: 0, trap: 0, turretUp: 0, speed: 0 },
  weapon: 'pistol',                        // سلاح انتخاب‌شده
  towerVariant: 0,                         // پوسته‌ی برج: ۰=برج اول، ۱=برج دومِ شهر سوخته (۷٫۰)
  cutsceneDone: false,                     // آیا رویداد داستانی فروریختن انجام شده؟ (۷٫۰)
  weaponSpent: 0,                          // جمع پول خرج‌شده برای اسلحه‌ها (۸٫۰ — مبنای غرامت کات‌سین)
  stats: { kills: 0, earned: 0, shots: 0, maxCombo: 0, turKills: 0 },
  /* ---- (۱۰٫۰) فصل‌ها، کوله‌پشتی، چراغ‌قوه، دستفروش، قطع برق، باس ---- */
  chapter: 1,                                        // فصل فعال ۱..۴
  backpack: [null, null, null, null, null, null],    // کوله‌پشتی ۶ جا (وسایل بقا)
  torch: { owned: false, on: false, battery: 0 },     // (۱۰٫۰) چراغ‌قوه — نام torch تا با فلش قرمزِ آسیب (state.flash) قاطی نشود
  buffs: { vest: false, goldAmmo: false, helmet: false },  // آیتم‌های کمیاب فعال‌شده
  regen: 0,                                          // جون باقی‌مانده‌ی شفای تدریجی کنسرو
  peddler: { cd: 0, here: false, stock: [] },         // دستفروش مرموز (دزد شبانه)
  blackout: { on: false, waveT: 0, schedule: [], until: 0 },  // قطع برق وسط موج
  projectiles: [],                                   // آوار پرتابی نگهبانِ آخرین شب
  cardT: 0,                                          // تایمر نمایش کارت فصل جدید
};

let animTime = 0;                          // زمان نمایشی (همیشه جلو می‌رود؛ برای سوسو ستاره‌ها و پرچم)
let fireTimer = 0;                         // کول‌داون شلیک
let announceTimer = 0;                     // مدت نمایش اعلان موقت (مثل «موج ۲»)
let shootStar = null, shootStarT = rand(3, 7);   // شهابِ گاه‌به‌گاه آسمان

/* قاب و بوم — (۱۸٫۱) ctx/DPR دیگر let هستند تا لایه‌های پخته‌شده بتوانند
   بومِ مقصد را موقتاً عوض کنند و فرماندار کیفیت بتواند DPR را در اجرا کم کند */
const canvas = $('game');
let ctx = canvas.getContext('2d');
let DPR = Math.min(window.devicePixelRatio || 1, 2);   // (۲۱٫۳) سقف ۲ — نمایش شارپ روی گوشی؛ فرماندار کیفیت خودش کم می‌کند
const DPR0 = DPR;                              // (۱۸٫۱) مقدار اولیه — برای بازگشت فرماندار کیفیت
function setDPR(v) {                           // (۱۸٫۱) تغییر رزولوشن بوم در اجرا (کاهش بار GPU)
  DPR = Math.min(Math.max(0.75, v), 2);
  canvas.width = Math.round(W * DPR);
  canvas.height = Math.round(H * DPR);
  try { ctx.direction = 'rtl'; } catch (e) { /* مرورگرهای قدیمی */ }
  /* کش‌ها باید دوباره پخته شوند — با try/catch چون در زمانِ تعریفِ این تابع
     هنوز در TDZ هستند (const های v3_part3 بعداً تعریف می‌شوند) */
  try { if (BG) BG.invalidate(); } catch (e) {}
  try { if (TOWER_BAKE) TOWER_BAKE.invalidate(); } catch (e) {}
  try { if (OVSPR) OVSPR.invalidate(); } catch (e) {}
  try { CLOUDSPR.invalidate(); } catch (e) {}
  try { WINSPR.c = null; } catch (e) {}
}
canvas.width = W * DPR;                        // اندازه‌گذاری اولیه (بدون فراخوانی setDPR — TDZ)
canvas.height = H * DPR;
try { ctx.direction = 'rtl'; } catch (e) { /* مرورگرهای قدیمی */ }

/* ---------------------- ۵) ورودی: ماوس/لمس و کیبورد ---------------------- */
/* playing و intermission و day همه «قابل بازی»اند: در روز هم می‌شود
   شلیک کرد، ارتقا خرید و برجک نصب کرد (۵٫۰). */
function canPlay() { return state.mode === 'playing' || state.mode === 'intermission' || state.mode === 'day'; }

/* تبدیل مختصات رویداد ماوس به مختصات منطقی دنیای بازی */
function canvasPos(e) {
  const r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
}

/* به‌روزرسانی زاویه اسلحه بر اساس موقعیت فعلی ماوس */
function updateAim() {
  state.aimAngle = Math.atan2(state.mouse.y - (TOWER_TOP_Y - 17), state.mouse.x - TOWER.x);
}

canvas.addEventListener('pointermove', e => {
  const p = canvasPos(e); state.mouse.x = p.x; state.mouse.y = p.y;
  updateAim();
});
canvas.addEventListener('pointerdown', e => {
  const p = canvasPos(e); state.mouse.x = p.x; state.mouse.y = p.y;
  updateAim();                             // هدف‌گیری قبل از شلیک به‌روز شود
  if (e.button === 2) {                    // راست‌کلیک: لغو نصب برجک (۴٫۰)
    if (state.placing) cancelPlacement(true);
    return;
  }
  if (e.button !== 0) return;
  /* (۱۰٫۰) مینی‌گیم فرار (انتقال بین فصل‌ها): کلیک/لمس = پرش
     (۱۷٫۰) تم رانندگی: یک‌سوم چپ/راست = فرمان، وسط = ترمز (گاز خودکار) */
  if (state.mode === 'transition' && typeof TR !== 'undefined' && TR && TR.phase === 2) {
    if (typeof mgIsRide === 'function' && mgIsRide()) {   /* (۱۹٫۰) هر سه تم سواره */
      if (p.x < W / 3) mgNudge(-1);
      else if (p.x > W * 2 / 3) mgNudge(1);
      else mgBrake(true);
    } else mgJump();
    e.preventDefault();
    return;
  }
  /* (۸٫۰) بخش رانندگی کات‌سین: لمس نیمه‌ی راست = گاز، چپ = ترمز */
  if (CS && CS.drive && !CS.drive.ended) {
    const right = p.x > W / 2;
    CS.drive.touch.a = right;
    CS.drive.touch.b = !right;
    state.mouse.down = false;
    e.preventDefault();
    return;
  }
  state.mouse.down = true;
  if (state.placing && canPlay()) {
    handlePlaceClick();                       // کلیک = نصب برجک
    state.mouse.down = false;                 // شلیک خودکار بلافاصله بعد از نصب فعال نشود
    e.preventDefault();
    return;
  }
  if (canPlay()) tryShoot();               // شلیک فوری در لحظه‌ی کلیک
  e.preventDefault();
});
window.addEventListener('pointerup', () => {
  state.mouse.down = false;
  /* (۸٫۰) رها کردن لمس = قطع گاز/ترمز لمسی */
  if (CS && CS.drive) { CS.drive.touch.a = false; CS.drive.touch.b = false; }
  /* (۱۷٫۰) رها کردن لمس مینی‌گیم رانندگی = قطع فرمان/ترمز */
  if (state.mode === 'transition' && typeof TR !== 'undefined' && TR && TR.phase === 2) {
    mgNudge(0); mgBrake(false);
  }
});
canvas.addEventListener('contextmenu', e => {   // منوی راست‌کلیک باز نشود + لغو نصب
  e.preventDefault();
  if (state.placing) cancelPlacement(true);
});

/* کیبورد: P/Esc توقف، M صدا، ۱/۲/۳ تعویض سلاح، ۴..۹ خرید از ساخت‌وساز، B جمع/باز پنل
   (۸٫۰) حین بخش رانندگی کات‌سین: → / D = گاز و ← / A = ترمز */
window.addEventListener('keydown', e => {
  if (CS && CS.drive && !CS.drive.ended) {
    if (e.code === 'ArrowRight' || e.code === 'KeyD') { CS.drive.keys.a = true; e.preventDefault(); }
    else if (e.code === 'ArrowLeft' || e.code === 'KeyA') { CS.drive.keys.b = true; e.preventDefault(); }
    return;                                   // در رانندگی، کلیدهای دیگر کاری نکنند
  }
  /* (۱۰٫۰) مینی‌گیم فرار در انتقال فصل‌ها: پرش/خم‌شدن/سرعت
     (۱۷٫۰) تم رانندگی: ↑/W/Space = گاز • ↓/S = ترمز • ←/→ = فرمان */
  if (state.mode === 'transition' && typeof TR !== 'undefined' && TR && TR.phase === 2) {
    const isDrive = (typeof mgIsRide === 'function') && mgIsRide();   /* (۱۹٫۰) هر سه تم سواره */
    if (e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') {
      if (isDrive) mgGas(true); else mgJump();
      e.preventDefault();
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      if (isDrive) mgBrake(true); else mgDuck(true);
      e.preventDefault();
    } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') { mgNudge(-1); e.preventDefault(); }
    else if (e.code === 'ArrowRight' || e.code === 'KeyD') { mgNudge(1); e.preventDefault(); }
    return;
  }
  if (e.key === 'Escape') {
    if (state.placing) cancelPlacement(true);      // اول لغو نصب برجک (۴٫۰) — (۲۰٫۱) چکِ راهنما حذف شد
    else if (state.mode === 'paused') resumeGame();
    else if (canPlay()) pauseGame();
  } else if (e.key === 'p' || e.key === 'P') {
    if (state.mode === 'paused') resumeGame();
    else if (canPlay()) pauseGame();
  } else if (e.key === 'm' || e.key === 'M') {
    toggleSound();
  } else if (e.key === 'b' || e.key === 'B') {
    toggleBuildPanel();
  } else if (e.code === 'Digit1' || e.code === 'Numpad1') {
    selectWeapon('pistol');
  } else if (e.code === 'Digit2' || e.code === 'Numpad2') {
    selectWeapon('shotgun');
  } else if (e.code === 'Digit3' || e.code === 'Numpad3') {
    selectWeapon('mg');
  } else if (e.key === 'l' || e.key === 'L') {
    toggleFlashlight();                       // (۱۰٫۰) چراغ‌قوه
  } else if (typeof BPKEYS !== 'undefined' && BPKEYS[e.code]) {
    useItem(BPKEYS[e.code] - 1);              // (۱۰٫۰) مصرف آیتم کوله‌پشتی (Q..U)
  } else {
    /* خرید سریع از پنل ساخت‌وساز — کلید هر آیتم در BUILD_DEFS است (۴-۹، ۰ و T)
       (۱۰٫۰) از مسیر buy(): قفل آخرین شب + سیو بعد از خرید */
    const kind = KEY2KIND[e.code];
    if (kind) buy(kind);
  }
});
/* (۸٫۰) رها کردن کلیدهای گاز/ترمز رانندگی */
window.addEventListener('keyup', e => {
  /* (۱۰٫۰) رها کردن کلیدهای مینی‌گیم فرار (خم‌شدن + سرعت + گاز/ترمزِ ۱۷٫۰) */
  if (state.mode === 'transition' && typeof TR !== 'undefined' && TR && TR.phase === 2) {
    if (e.code === 'ArrowDown' || e.code === 'KeyS') { mgDuck(false); mgBrake(false); return; }
    if (e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') { mgGas(false); return; }
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') { mgNudge(0); return; }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') { mgNudge(0); return; }
  }
  if (!(CS && CS.drive)) return;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') CS.drive.keys.a = false;
  else if (e.code === 'ArrowLeft' || e.code === 'KeyA') CS.drive.keys.b = false;
});
/* اگر تب/پنجره از حالت نمایش خارج شد، بازی خودکار متوقف شود */
window.addEventListener('blur', () => { if (state.mode === 'playing') pauseGame(); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.mode === 'playing') pauseGame();
});

/* ---------------------- ۶) جریان موج‌ها و تولید زامبی ---------------------- */
/* شروع/ریست کامل بازی */
function startGame() {
  state.mode = 'intermission';
  state.prevMode = null;
  state.time = 0; state.wave = 0;
  state.coins = 30;                       // سرمایه‌ی شروع (۵٫۰)
  state.dayness = 0; state.dayTarget = 0; state.goingNight = false;   // شبِ شروع
  state.tower.hp = 100; state.tower.maxHp = 100;
  state.upgrades = { weapon: 0, health: 0, trap: 0, turretUp: 0, speed: 0 };
  state.weapon = 'pistol';
  state.towerVariant = 0;                  // برج اول (۷٫۰)
  state.cutsceneDone = false;
  state.weaponSpent = 0;                   // (۸٫۰) حساب اسلحه‌ها دوباره از صفر
  cutsceneHardReset();                     // اگر کات‌سینی در جریان بود کنسل شود (۷٫۰)
  WEAPONS.shotgun.owned = false; WEAPONS.mg.owned = false;
  state.zombies = []; state.bullets = []; state.coinsArr = [];
  state.turrets = []; state.placing = null; state.tipTurret = false;
  state.particles = []; state.texts = []; state.zaps = [];
  state.powerups = []; state.decals = [];
  state.powerTimers = { rapid: 0, freeze: 0 };
  state.combo = 0; state.comboT = 0; state.comboPop = 0;
  state.killsSinceDrop = 0; state.heartT = 0;
  state.shake = 0; state.flash = 0;
  state.hitMark = 0; state.muzzleGlow = 0; state.slowmo = 0;
  state.lightning = { t: rand(9, 20), a: 0 };
  state.stats = { kills: 0, earned: 0, shots: 0, maxCombo: 0, turKills: 0 };
  state.spawn = { queue: [], timer: 0, interval: 2, bossDelay: false };
  state.mouse.down = false; fireTimer = 0; announceTimer = 0;
  state.intermission = INTERMISSION_FIRST; // شمارش معکوس کوتاه قبل از موج ۱
  hideOverlays();
  hideDayPanel();                          // پنل روز مطمئناً بسته باشد (۵٫۰)
  $('wrap').classList.remove('menu-mode'); // HUD و پنل‌ها برگردند (۵٫۰)
  setBuildPanel(false, true);              // پنل ساخت‌وساز در شروع باز باشد (۶٫۰)
  setPauseIcon(false);   // (۱۳٫۰) ریل چپ
  $('bpHead').classList.remove('attention');
  $('bossBar').style.display = 'none'; bossBarVisible = false;
  updateHUD(); refreshBuildPanel(); refreshWeaponBar();
}

/* آغاز موج n: صف تولد بر اساس ترکیب جدول WAVES ساخته و شافل می‌شود */
function startWave(n) {
  state.wave = n;
  state.mode = 'playing';
  const c = WAVES[n - 1];
  const q = [];
  for (let i = 0; i < c.n; i++) q.push('normal');
  for (let i = 0; i < c.f; i++) q.push('fast');
  for (let i = 0; i < c.t; i++) q.push('tank');
  for (let i = q.length - 1; i > 0; i--) {          // شافل فیشر–ییتس
    const j = Math.floor(rand(0, i + 1));
    const tmp = q[i]; q[i] = q[j]; q[j] = tmp;
  }
  if (c.b) q.push('boss');                           // پادشاه همیشه آخرِ صف می‌ایستد
  state.spawn = {
    queue: q,
    timer: 1.2,
    interval: Math.max(2.0 - n * 0.14, 0.5),        // فاصله بین تولدها (کم‌تر هر موج)
    bossDelay: false,
  };
  setAnnounce('موج ' + faNum(n),
    n === TOTAL_WAVES ? 'موج آخر! پادشاه زامبی‌ها پشتِ کاره...' : 'دفاع کن! 🧟', 2);
  SFX.wave();
  setBuildPanel(true, true);               // شب شد: پنل خودکار جمع شود تا نقشه آزاد باشد (۶٫۰)
  $('bpHead').classList.remove('attention');
  updateHUD();
}

/* پایان موج فعلی (۵٫۰): جایزه‌ی سکه + «صبح می‌شود»؛
   در روز زامبی نمی‌آید و بازیکن با دکمه‌ی «شب شود» موج بعد را شروع می‌کند. */
function waveComplete() {
  if (state.wave >= TOTAL_WAVES) { victory(); return; }
  /* پادشایی موج: جایزه‌ی نقدی صبح (۱۲ + ۶×شماره موج) */
  const bonus = 12 + state.wave * 6;
  state.coins += bonus;
  state.stats.earned += bonus;
  addText(TOWER.x, TOWER_TOP_Y - 56, 'جایزه‌ی موج: +' + faNum(bonus) + ' 💰', '#ffd873', 16);
  pulseCoins();
  /* صحنه پاک شود و صبح طلوع کند */
  state.zombies = []; state.bullets = [];
  /* (۷٫۰) رویداد داستانی: پایان موج ۵ = فروریختن برج و مهاجرت به برج بعدی؛
     جون/سکه/سلاح/ارتقاها همه حفظ می‌شوند و موج ۶ روی برج جدید ادامه می‌یابد */
  if (state.wave === CUTSCENE_AFTER_WAVE && state.towerVariant === 0 && !state.cutsceneDone) {
    playTowerCollapseCutscene({
      afterWave: CUTSCENE_AFTER_WAVE,
      variant: 1,                             // پوسته‌ی برج دوم + شهر سوخته
      /* (۸٫۰) هدیه‌ی راننده جای خود را به «غرامت اسلحه‌های سوخته» داده است:
         سلاح‌ها زیر آوار از بین می‌روند و به‌جایش سکه‌ی اضافه می‌رسد */
    });
    return;
  }
  state.mode = 'day';
  state.dayTarget = 1;                     // گذار نرم به روز
  state.goingNight = false;
  state.slowmo = Math.max(state.slowmo, 0.45);   // لحظه‌ی سینمایی پاک‌سازی موج
  $('bossBar').style.display = 'none'; bossBarVisible = false;
  setAnnounce('☀️ صبح شد!', 'موج ' + faNum(state.wave) + ' پاک شد — ارتقا بخر و شب را شروع کن', 3);
  SFX.clear();
  SFX.morning();                           // چرپ‌چرپ صبحگاهی
  showDayPanel();                          // دکمه‌ی «شب شود» (۵٫۰)
  setBuildPanel(false, true);              // روز شد: پنل خودکار باز شود برای خرید/نصب (۶٫۰)
  $('bpHead').classList.add('attention');   // راهنمایی بصری: فرصت خرید رسید
  updateHUD();
}

/* پنل روز (۱۶٫۰): «شب شود» حالا دکمه‌ی طلاییِ داخل پنل ساخت‌وساز است
   (زیر سربرگ) — برچسب موج درون‌فصلی/آخرین شب (۱۰٫۰) */
function showDayPanel() {
  $('bpNight').innerHTML = (state.wave + 1 >= FINAL_WAVE)
    ? '🌑 آخرین شب'
    : '🌙 شب شود — موج ' + faNum(waveInChapter(state.wave + 1));
  $('bpNight').classList.remove('hidden');
}
function hideDayPanel() { $('bpNight').classList.add('hidden'); }

/* کلیک «شب شود»: گذار گرگ‌ومیش و بعد شروع موج بعد (۵٫۰) */
function startNight() {
  if (state.mode !== 'day' || state.goingNight) return;
  state.goingNight = true;
  hideDayPanel();
  state.dayTarget = 0;                     // آسمان آرام تاریک می‌شود
  setAnnounce('🌙 شب می‌شود...', 'موج ' + faNum(state.wave + 1) + ' در راه است — آماده باش!', 1.8);
  SFX.dusk();
}

/* تولید یک زامبی از نوع دلخواه از لبه چپ یا راست */
function spawnZombie(type) {
  const T = ZTYPES[type || 'normal'];
  const side = Math.random() < 0.5 ? -1 : 1;
  const hp = Math.round(T.hpBase + T.hpWave * state.wave);
  state.zombies.push({
    type: type || 'normal',
    x: side < 0 ? -30 : W + 30,
    y: GROUND_Y + rand(-3, 3),             // کمی پراکندگی عمودی برای خوانایی دسته‌جمعی
    yJit: rand(-3, 3),                     // جیترِ ردیف هجوم (۳٫۰)
    dir: side < 0 ? 1 : -1,                // جهت گام (به سمت برج)
    hp, maxHp: hp,
    speed: (T.spdBase + T.spdWave * state.wave) * rand(0.85, 1.15),
    radius: T.r,
    biteInt: T.bite, biteTimer: rand(0.2, 0.6),   // اولین گاز کمی زودتر/دیرتر
    dmg: T.dmg,
    walkPhase: Math.random() * Math.PI * 2,
    attackAnim: 0,
    attacking: false, attackSide: 0,       // سمتِ دیواری که به آن می‌کوبد
    lane: 0, depth: 1,                     // ردیف هجوم و مقیاس عمق (۳٫۰)
    stagger: 0,                            // سرخوردن بعد از گلوله (۳٫۰)
    chill: 0,                              // ثانیه‌ی باقی‌مانده‌ی یخ‌زدگی برجک یخ‌زن (۴٫۰)
    hitFlash: 0, dead: false, deathT: 0,
  });
  /* غبارِ ورود از لبه‌ی صفحه (۳٫۰) */
  spawnParticles(side < 0 ? 8 : W - 8, GROUND_Y - 4, 5, '#5a4a33',
    { speed: 55, life: 0.4, size: 2.2, grav: 180, up: true });
  updateHUD();
}

/* ---------------------- ۷) شلیک و سلاح‌ها ---------------------- */
/* آسیب هر گلوله/ساچمه بر اساس سلاح + سطح ارتقای اسلحه
   (سلاح‌های ساچمه‌ای به‌ازای هر سطح +۱ می‌گیرند و تک‌گلوله‌ای +۲) */
function weaponDmg(w, extra) {
  const L = state.upgrades.weapon + (extra || 0);
  let d = w.dmg + L * (w.pellets > 1 ? 1 : 2);
  if (state.buffs && state.buffs.goldAmmo) d = Math.round(d * 1.25);   // (۱۰٫۰) فشنگ‌های طلایی
  if (state.adren > 0) d = Math.round(d * 2);                          // (۲۰٫۰) آدرنالینِ دستفروش
  return d;
}

/* محل دهانه‌ی اسلحه (نوک لوله در بالای برج) — طول لوله به سلاح بستگی دارد */
function gunMuzzle(len) {
  const gx = TOWER.x, gy = TOWER_TOP_Y - 17;
  return { x: gx + Math.cos(state.aimAngle) * (len + 6), y: gy + Math.sin(state.aimAngle) * (len + 6) };
}

function tryShoot() {
  if (fireTimer > 0) return;
  const w = WEAPONS[state.weapon];
  /* قدرت «شلیک سریع» نرخ شلیک را تقریباً دوبرابر می‌کند +
     ارتقای «سرعت شلیک» (۹٫۰) هر سطح ۸٪ فاصله‌ی شلیک را کم می‌کند */
  fireTimer = w.rate * (state.powerTimers.rapid > 0 ? 0.55 : 1)
            * (1 - 0.08 * (state.upgrades.speed || 0));
  updateAim();                             // اطمینان از جهت صحیح گلوله
  const m = gunMuzzle(w.barrel);
  for (let i = 0; i < w.pellets; i++) {
    const a = state.aimAngle + (Math.random() - 0.5) * 2 * w.spread;
    const sp = w.spd * rand(0.92, 1.08);
    state.bullets.push({
      x: m.x, y: m.y,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      dmg: weaponDmg(w), r: w.pellets > 1 ? 3 : 4, life: w.ttl,
      knock: w.knock,                      // پس‌زنی سلاح (۳٫۰)
      dead: false, pellet: w.pellets > 1,  // ساچمه‌های شاتگان ریزترند
    });
  }
  state.stats.shots++;
  state.fireFlash = 0.07;
  state.muzzleGlow = 0.07;                 // نور دهانه روی محیط (۳٫۰)
  state.recoil = w.pellets > 1 ? 1.6 : 1;  // لگد شاتکن محسوس‌تر است
  SFX[w.sfx]();
  spawnParticles(m.x, m.y, 3, '#ffe9a8', { speed: 90, life: 0.18, size: 2, grav: 0,
    dir: state.aimAngle, spread: Math.PI / 3 });
  spawnShell(state.aimAngle);              // پوکه‌ی پرتاب‌شده
  if (w.pellets > 1) state.shake = Math.min(8, state.shake + 2);
}

/* پوکه‌ی براقی که بعد از هر شلیک به عقب پرتاب می‌شود و روی بام می‌غلتد */
function spawnShell(ang) {
  const gx = TOWER.x + Math.cos(ang) * 8, gy = TOWER_TOP_Y - 17 + Math.sin(ang) * 8;
  const a = ang + rand(1.6, 2.2);          // زاویه‌ی پرتاب به عقب/بالا
  state.particles.push({
    x: gx, y: gy,
    vx: Math.cos(a) * rand(60, 130), vy: Math.sin(a) * rand(60, 130) - 70,
    age: 0, life: rand(0.5, 0.8), size: 2.6, color: '#d9a441', grav: 900,
    shell: true, rot: rand(0, 6.28), vr: rand(-9, 9),
  });
}

/* برخورد گلوله با زامبی‌ها + خروج گلوله از صحنه
   (۳٫۰: اول دایره‌ی سر بررسی می‌شود — برخورد سر = ضربه‌ی بحرانی ×۲)
   (۲۰٫۰) موشک با هر برخورد/پایان عمر منفجر می‌شود (آسیب محدوده‌ای) و
   گلوله‌ی شعله زامبی را «می‌آفتزند» */
function updateBullets(dt) {
  for (const b of state.bullets) {
    if (b.dead) continue;
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    /* رد برفیِ گلوله‌ی یخی برجک (۴٫۰) */
    if (b.frost && Math.random() < dt * 34) {
      state.particles.push({ x: b.x, y: b.y, vx: rand(-12, 12), vy: rand(-12, 12),
        age: 0, life: 0.3, size: 1.3, color: 'rgba(205,240,255,0.9)', grav: 30 });
    }
    /* (۲۰٫۰) دنباله‌ی دودِ موشک */
    if (b.missile && Math.random() < dt * 55) {
      state.particles.push({ x: b.x, y: b.y, vx: rand(-9, 9), vy: rand(-9, 9),
        age: 0, life: rand(0.25, 0.5), size: rand(2, 3.4),
        color: 'rgba(190,170,150,0.5)', grav: -14 });
    }
    /* (۲۰٫۰) رگبارِ ریزِ شعله */
    if (b.flame && Math.random() < dt * 30) {
      state.particles.push({ x: b.x, y: b.y, vx: rand(-8, 8), vy: rand(-12, 2),
        age: 0, life: rand(0.12, 0.26), size: rand(2.2, 3.8),
        color: Math.random() < 0.6 ? 'rgba(255,150,60,0.85)' : 'rgba(255,220,120,0.8)', grav: -40, glow: true });
    }
    if (b.y > GROUND_Y + 4) {              // گلوله به زمین خورد
      b.dead = true;
      if (b.missile) { missileBurst(b); continue; }
      if (b.flame) {
        spawnParticles(b.x, GROUND_Y, 3, 'rgba(255,140,60,0.8)', { speed: 40, life: 0.25, size: 2.6, grav: -30 });
        continue;
      }
      spawnParticles(b.x, GROUND_Y, 4, '#6a5a43', { speed: 70, life: 0.3, size: 2, grav: 300, up: true });
      continue;
    }
    if (b.x < -40 || b.x > W + 40 || b.y < -40 || b.life <= 0) {
      b.dead = true;
      if (b.missile) missileBurst(b);      // موشکِ رسیده به آخرِ عمر = انفجار هوایی
      continue;
    }
    const dir = Math.sign(b.vx) || 1;      // جهت پس‌زنی = جهت حرکت گلوله
    const src = b.tur || 'player';         // منبع گلوله: بازیکن یا برجک (۴٫۰)
    for (const z of state.zombies) {
      if (z.dead) continue;
      const s = (z.radius / 15) * (z.depth || 1);   // مرکز بدن بر اساس اندازه‌ی نوع و عمق
      /* --- سر: ضربه‌ی بحرانی --- */
      const hx = z.x + z.dir * 3 * s, hy = z.y - 36 * s, hr = 7 * s + b.r;
      if ((b.x - hx) * (b.x - hx) + (b.y - hy) * (b.y - hy) < hr * hr) {
        b.dead = true;
        if (b.missile) { missileBurst(b); break; }
        hitZombie(z, b.dmg, b.x, b.y, dir, true, b.knock, src);
        if (b.frost) chillZombie(z);
        if (b.flame) burnZombie(z);
        break;
      }
      /* --- بدن --- */
      const dx = z.x - b.x, dy = (z.y - 20 * s) - b.y;
      const rr2 = z.radius * (z.depth || 1) + b.r + 3;
      if (dx * dx + dy * dy < rr2 * rr2) {
        b.dead = true;
        if (b.missile) { missileBurst(b); break; }
        hitZombie(z, b.dmg, b.x, b.y, dir, !!b.crit, b.knock, src);
        if (b.frost) chillZombie(z);
        if (b.flame) burnZombie(z);
        break;
      }
    }
  }
  state.bullets = state.bullets.filter(b => !b.dead);
}

/* (۲۰٫۰) انفجار موشک: آسیبِ محدوده‌ای + موج انفجار + لرزش */
function missileBurst(b) {
  const R = TURRETS.missile.splash;
  SFX.missileBoom();
  state.shake = Math.max(state.shake, 7);
  spawnParticles(b.x, b.y, 16, '#ffb26e', { speed: 240, life: 0.5, size: 3.2, grav: 240 });
  spawnParticles(b.x, b.y, 10, 'rgba(255,240,200,0.95)', { speed: 170, life: 0.35, size: 2.4, grav: 120 });
  spawnParticles(b.x, b.y, 8, 'rgba(120,110,100,0.6)', { speed: 110, life: 0.7, size: 3.4, grav: -20 });
  /* حلقه‌ی موج انفجار */
  state.zaps.push({ pts: [{ x: b.x, y: b.y }], age: 0, life: 0.28, ring: true, rr: R });
  for (const z of state.zombies) {
    if (z.dead) continue;
    const d = Math.hypot(z.x - b.x, (z.y - 20) - b.y);
    if (d < R) {
      const f = 1 - d / R * 0.55;                 // مرکز انفجار کامل‌تر
      hitZombie(z, Math.max(2, Math.round(b.dmg * f)), b.x, b.y,
        Math.sign(z.x - b.x) || 1, false, TURRETS.missile.knock, 'missile');
    }
  }
}

/* (۲۰٫۰) آتش‌گیرندگی زامبی از گلوله‌ی شعله‌افکن */
function burnZombie(z) {
  if (z.dead) return;
  z.burn = Math.max(z.burn || 0, TURRETS.flame.burn);
}

/* ---------------------- ۸) زامبی‌ها: محاصره‌ی دسته‌جمعی برج ----------------------
   در ۳٫۰ زامبی‌ها دیگر در یک خط نمی‌ایستند: هر طرفِ برج تا ۵ ردیف
   «دیوارِ زامبی» می‌سازند؛ نزدیک‌ترین مهاجم ردیفِ چسبیده به دیوار را می‌گیرد و
   بقیه پشت سرش ردیف می‌شوند. ردیف‌های عقب بالاتر و کوچک‌تر رسم می‌شوند و
   با کشته‌شدنِ ردیف جلو، بقیه فشرده شده و جلو می‌خزند. */
function updateZombies(dt) {
  /* رتبه‌بندی مهاجم‌های فعلی بر اساس نزدیکی به دیوار (هر طرف جداگانه):
     نزدیک‌ترین = ردیف ۰؛ با مرگ ردیف جلو، رتبه‌ها فشرده می‌شوند */
  const rank = { '-1': 0, '1': 0 };
  const attackers = state.zombies.filter(z => !z.dead && z.attacking);
  attackers.sort((a, b) => Math.abs(TOWER.x - a.x) - Math.abs(TOWER.x - b.x));
  for (const z of attackers) {
    z.attackSide = z.x < TOWER.x ? -1 : 1;
    z.lane = Math.min(rank[z.attackSide]++, 4);
  }

  for (const z of state.zombies) {
    if (z.dead) { z.deathT += dt; continue; }   // انیمیشن مرگ ادامه پیدا کند
    z.hitFlash = Math.max(0, z.hitFlash - dt);
    z.stagger = Math.max(0, z.stagger - dt);    // سرخوردن بعد از ضربه
    z.chill = Math.max(0, (z.chill || 0) - dt); // یخ‌زدگی برجک یخ‌زن (۴٫۰)

    /* (۲۰٫۰) آتش‌گیرندگی برجک شعله‌افکن: دمیج پیوسته + شعله روی بدن */
    if (z.burn && z.burn > 0) {
      z.burn -= dt;
      z.hp -= (TURRETS.flame.burnDps || 6) * dt;
      if (Math.random() < dt * 14) {
        state.particles.push({
          x: z.x + rand(-8, 8), y: z.y - rand(10, 38),
          vx: rand(-7, 7), vy: -rand(26, 44), age: 0, life: rand(0.3, 0.55),
          size: rand(1.8, 3), color: Math.random() < 0.5 ? 'rgba(255,150,60,0.9)' : 'rgba(255,90,40,0.8)',
          grav: -60, glow: true,
        });
      }
      if (z.hp <= 0) { z.killedBy = 'flame'; killZombie(z); continue; }
    }

    const dx = TOWER.x - z.x;
    const side = z.x < TOWER.x ? -1 : 1;        // کدام دیوار برج؟
    const lane = z.attacking ? z.lane : Math.min(rank[side], 4);
    const stop = TOWER.baseHalf + z.radius * 0.55 + lane * 15;

    /* انجماد: همه کُند می‌شوند (پادشاه مقاوم‌تر است) — یخ‌زدگی برجک هم جداگانه اثر می‌کند */
    const slow = state.powerTimers.freeze > 0 ? (z.type === 'boss' ? 0.6 : 0.32) : 1;
    const spd = z.speed * slow * (z.chill > 0 ? 0.55 : 1) * (z.stagger > 0 ? 0.25 : 1);

    if (Math.abs(dx) > stop) {
      /* راه رفتن به سمت برج (مهاجمِ پس‌زده‌شده هم برمی‌گردد) */
      z.attacking = false;
      z.lane = Math.min(rank[side], 4);
      z.x += Math.sign(dx) * spd * dt;
      z.walkPhase += dt * (4 + spd * 0.06);
    } else {
      /* رسید به دیوار برج: کوبیدن پایه با فاصله‌ی زمانیِ نوعِ خودش */
      z.attacking = true;
      z.attackSide = side;
      z.attackAnim += dt * 5;
      z.biteTimer -= dt;
      if (z.biteTimer <= 0) {
        z.biteTimer = z.biteInt;
        damageTower(z.dmg, z.x);
      }
    }

    /* عمق تصویری: ردیف‌های عقب‌تر کمی بالاتر ایستاده و کوچک‌تر دیده می‌شوند */
    const yTarget = GROUND_Y - z.lane * 9 + z.yJit;
    z.y += (yTarget - z.y) * Math.min(1, dt * 6);
    z.depth = 1 - z.lane * 0.07;

    /* غبار گام‌ها (۶٫۰): ذره‌ی ریز پشت پای زامبیِ در حال راه رفتن */
    if (!z.dead && Math.abs(dx) > stop && Math.random() < dt * 2.2) {
      state.particles.push({
        x: z.x - z.dir * 7, y: z.y + 1,
        vx: -z.dir * rand(5, 15), vy: rand(-20, -7),
        age: 0, life: rand(0.25, 0.42), size: rand(1.2, 1.9),
        color: 'rgba(96,84,58,0.45)', grav: 60,
      });
    }
  }
  state.zombies = state.zombies.filter(z => !z.dead || z.deathT < 0.55);
}

/* آسیب گلوله به زامبی (۳٫۰: کریت ×۲ + پس‌زنی + سرخوردن + نشانگر برخورد) */
function hitZombie(z, dmg, bx, by, dir, crit, knock, src) {
  if (z.dead) return;
  if (src) z.killedBy = src;                 // منبع ضربه — برای آمار کشتار برجک‌ها (۴٫۰)
  const total = crit ? dmg * 2 : dmg;
  z.hp -= total;
  z.hitFlash = 0.15;
  z.stagger = 0.15;                         // چند لحظه از می‌افتد
  z.x += dir * (knock || 0) * (crit ? 1.7 : 1);   // پس‌زنی فیزیکی
  /* (۱۱٫۰) ضدشلوغی: عدد دمیج فقط برای کریت/باس — ضربات معمولی بی‌عدد
     (۲۱٫۲) ارتفاعِ متن وابسته به اندازه‌ی زامبی — برای باسِ غول‌آسا
     بالای سرش می‌نشیند، نه وسطِ بدنش (درخواست کاربر) */
  hitZombie._n = (hitZombie._n || 0) + 1;
  const _s = (z.radius || 15) / 15;
  const _ty = z.y - (52 + (_s > 1.6 ? 14 : 0)) * _s - (z.type === 'boss' ? 16 : 0);
  if (crit) {
    addText(z.x, _ty, faNum(total), '#ffb347', 16);
    spawnParticles(bx, by, 4, '#ffd873', { speed: 150, life: 0.35, size: 2.2, grav: 300 });
  } else if (z.type === 'boss' || hitZombie._n % 4 === 0) {
    addText(z.x, _ty, faNum(total), 'rgba(255,255,255,0.85)', 11);
  }
  spawnParticles(bx, by, 2, '#8fd06a', { speed: 110, life: 0.3, size: 2, grav: 400 });
  spawnParticles(bx, by, 2, '#7a2f2f', { speed: 90,  life: 0.35, size: 2, grav: 500 });
  if (Math.random() < 0.3) addDecal(z.x, false);   // چکه‌ی خون روی زمین
  state.hitMark = 0.14; state.hitMarkCrit = !!crit; // نشانگر برخورد روی نشان
  if (crit) SFX.crit(); else SFX.hit();
  if (z.hp <= 0) killZombie(z);
}

/* مرگ زامبی: انیمیشن افتادن + خون + سکه + روح + جعبه‌ی قدرت + کمبو (۳٫۰) */
function killZombie(z) {
  if (z.dead) return;
  z.dead = true; z.deathT = 0;
  state.stats.kills++;
  if (z.killedBy && z.killedBy !== 'player') state.stats.turKills++;   // کشتار دفاع‌های خودکار (۴٫۰)
  spawnParticles(z.x, z.y - 18, 12, '#5f8f3e', { speed: 170, life: 0.55, size: 3, grav: 500 });
  spawnParticles(z.x, z.y - 18, 8, '#7a2f2f', { speed: 130, life: 0.5, size: 2.6, grav: 500 });
  addDecal(z.x, true);                     // لکه‌ی خون بزرگ زیر جسد
  /* روحِ سبزِ کوچکی که آرام به آسمان می‌رود */
  state.particles.push({
    x: z.x, y: z.y - 26, vx: rand(-6, 6), vy: -38,
    age: 0, life: 1.3, size: 3, color: 'rgba(190,255,200,0.5)', grav: -26, glow: true,
  });
  SFX.death();
  dropCoins(z);
  maybeDropPowerup(z);
  bumpCombo();
  updateHUD();
  if (z.type === 'boss') {
    state.shake = 16; state.flash = 0.8;
    state.slowmo = 0.9;                    // لحظه‌ی سینمایی مرگ پادشاه
    SFX.slowmo();
    spawnParticles(z.x, z.y - 60, 40, '#ffd873', { speed: 300, life: 1.0, size: 3.5, grav: 400 });
    spawnParticles(z.x, z.y - 60, 24, '#e8563f', { speed: 240, life: 0.8, size: 3, grav: 400 });
    setAnnounce(state.wave >= FINAL_WAVE ? '🌑 نگهبان از پا درآمد!' : '👑 پادشاه کشته شد!', 'برج پابرجایی!', 2.2);
    SFX.bossDie();
    /* (۱۲٫۰) آخرین کلمه‌ی نگهبان — فقط در «آخرین شب»، با صدای خودش */
    if (state.wave >= FINAL_WAVE) { try { VOICE.speak('نمی‌شه... تمومش کردی...', 'b', 'fbd1'); } catch (e) {} }
  }
}

/* سیستم کمبو (۳٫۰): هر کشتنِ تازه، پنجره را باز نگه می‌دارد؛
   در رکوردهای مشخص پیام + سکه‌ی جایزه می‌گیری. */
function bumpCombo() {
  state.combo++;
  state.comboT = COMBO_WINDOW;
  state.comboPop = 0.25;
  state.stats.maxCombo = Math.max(state.stats.maxCombo, state.combo);
  const m = COMBO_MILESTONES[state.combo];
  if (m) {
    state.coins += m.bonus;
    state.stats.earned += m.bonus;
    addText(TOWER.x, TOWER_TOP_Y - 46, '+' + faNum(m.bonus) + ' 💰', '#ffd873', 15);
    setAnnounce('🔥 ' + m.msg, 'جایزه‌ی کمبو: +' + faNum(m.bonus) + ' سکه', 1.6);
    SFX.combo(state.combo);
    pulseCoins();
  }
}

/* کاهش جون برج (کوبیدن پایه توسط زامبی‌ها) */
function damageTower(amount, srcX) {
  if (state.mode !== 'playing') return;
  /* (۱۰٫۰) جلیقه‌ی ضدّ دندان: آسیب به برج ۲۵٪ کمتر */
  if (state.buffs && state.buffs.vest) amount = Math.max(1, Math.round(amount * 0.75));
  state.tower.hp = Math.max(0, state.tower.hp - amount);
  state.flash = 1;
  state.shake = Math.min(10, state.shake + 3);
  const side = srcX < TOWER.x ? -1 : 1;
  addText(TOWER.x + side * (TOWER.baseHalf + 6), GROUND_Y - 60, faNum(amount), '#ff6b5e', 16);
  /* تراشه‌های سنگ از پایه‌ی برج می‌پارد (۳٫۰: بیشتر و پررنگ‌تر) */
  spawnParticles(TOWER.x + side * TOWER.baseHalf, GROUND_Y - rand(10, 55), 7, '#8a6f52',
    { speed: 130, life: 0.45, size: 2.6, grav: 500 });
  spawnParticles(TOWER.x + side * TOWER.baseHalf, GROUND_Y - rand(8, 40), 3, '#c9b38a',
    { speed: 100, life: 0.35, size: 2, grav: 500 });
  SFX.towerHit();
  updateHUD();
  if (state.tower.hp <= 0) gameOver();
}

/* تله پایه برج: آسیب خودکار و پیوسته به زامبی‌های نزدیک */
function updateTrap(dt) {
  const lvl = state.upgrades.trap;
  if (lvl <= 0) return;
  const dps = UPGRADES.trap.dps + UPGRADES.trap.dpsPerLvl * (lvl - 1);
  for (const z of state.zombies) {
    if (z.dead) continue;
    if (Math.abs(z.x - TOWER.x) < UPGRADES.trap.radius) {
      /* (۲۰٫۰) زرهِ نگهبان تله را هم پس می‌زند — مگر در پنجره‌ی ترکیدن زره */
      let d = dps * dt;
      if (z.type === 'boss' && state.wave >= FINAL_WAVE && !(z.ai && z.ai.staggerT > 0)) d *= 0.33;
      z.hp -= d;
      z.hitFlash = Math.max(z.hitFlash, 0.06);
      if (Math.random() < dt * 6) { addZap(z.x, z.y - 18); SFX.trap(); }  // قوس برق نمایشی
      if (z.hp <= 0) { z.killedBy = 'trap'; killZombie(z); }
    }
  }
}

/* ---------------------- ۸٫۵) برجک‌های دفاعی خودکار (۴٫۰) ----------------------
   بازیکن برجک می‌خرد → شبحِ نصب دنبال ماوس می‌آید → کلیک روی زمین = نصب.
   هر برجک نزدیک‌ترین زامبیِ در برد را نشانه می‌رود و خودکار شلیک می‌کند. */

/* آیا نقطه‌ی (x,y) جای نصب مناسبی است؟ (نوار زمین، دوری از برج/برجک‌ها/مانع‌های صحنه) */
function placementValid(x, y) {
  if (y < GROUND_Y - 34 || y > GROUND_Y + 16) return false;    // فقط نوار زمین
  if (x < 26 || x > W - 200) return false;                      // داخل کادر و دور از پنل ساخت‌وساز
  if (Math.abs(x - TOWER.x) < TOWER.baseHalf + 34) return false; // چسبیده به پایه‌ی برج نه
  for (const t of state.turrets) if (Math.hypot(t.x - x, t.y - y) < 36) return false;
  for (const lx of LAMPS) if (Math.abs(x - lx) < 18) return false;
  for (const tx of [88, 874]) if (Math.abs(x - tx) < 22) return false;   // درخت‌های خشک
  for (const p of PUDDLES) if (Math.abs(x - p.x) < p.w / 2 + 8) return false;
  return true;
}

/* شروع حالت نصب: پول هنوز کنار نمی‌رود — موقع نصبِ موفق کم می‌شود */
function startPlacement(kind) {
  if (state.placing) {
    if (state.placing.type === kind) cancelPlacement(true);   // کلیک دوباره = لغو
    else { state.placing = { type: kind }; SFX.click(); refreshBuildPanel(); }
    return;
  }
  if (state.turrets.length >= MAX_TURRETS) { denyBPItem(kind); return; }
  if (state.coins < TURRETS[kind].price) { denyBPItem(kind); return; }
  state.placing = { type: kind };
  SFX.click();
  if (!state.tipTurret) {
    state.tipTurret = true;
    setAnnounce('🛠 نصب ' + TURRETS[kind].name, 'روی زمینِ سبز کلیک کن — راست‌کلیک: لغو', 2.4);
  }
  refreshBuildPanel();
}

/* لغو حالت نصب (Esc یا راست‌کلیک) — هنوز چیزی خرج نشده است */
function cancelPlacement(notify) {
  if (!state.placing) return;
  state.placing = null;
  if (notify) SFX.click();
  refreshBuildPanel();
}

/* کلیک چپ در حالت نصب: اگر جای‌ درست بود برجک ساخته می‌شود */
function handlePlaceClick() {
  const pl = state.placing;
  if (!pl) return;
  const def = TURRETS[pl.type];
  const mx = state.mouse.x, my = state.mouse.y;
  if (!placementValid(mx, my)) { SFX.deny(); return; }
  if (state.turrets.length >= MAX_TURRETS) { cancelPlacement(); return; }
  if (state.coins < def.price) { denyBPItem(pl.type); cancelPlacement(); return; }
  state.coins -= def.price;
  state.turrets.push({
    type: pl.type, x: mx, y: my,
    cd: 0.45,                                // کمی تأخیر اولیه (حسِ نصب)
    aim: mx < TOWER.x ? 0 : Math.PI,         // اول رو به برج
    spin: 0, flash: 0, recoil: 0, hover: false, bob: rand(0, 6.28),
  });
  /* جلوه‌ی نصب: گردوخاک + کوبیدن + متن */
  spawnParticles(mx, my + 2, 14, '#7a6a4c', { speed: 110, life: 0.5, size: 2.6, grav: 380, up: true });
  spawnParticles(mx, my - 4, 8, '#c9b38a', { speed: 90, life: 0.4, size: 2, grav: 300, up: true });
  state.shake = Math.min(6, state.shake + 3);
  addText(mx, my - 40, def.name, '#9fe08a', 13);
  SFX.placeT();
  state.placing = null;
  updateHUD();
}

/* یخ‌زدگی زامبی با گلوله‌ی برجک یخ‌زن */
function chillZombie(z) {
  if (z.dead) return;
  z.chill = Math.max(z.chill || 0, TURRETS.frost.chill);
  spawnParticles(z.x, z.y - 20, 4, '#cfeaff', { speed: 60, life: 0.4, size: 1.6, grav: 150 });
}

/* حلقه‌ی برجک‌ها: هدف‌گیری نزدیک‌ترین زامبی در برد + چرخش لوله + شلیک خودکار
   (۲۰٫۰) سه برجک ویژه‌ی دستفروش: تسلا (آذرخش زنجیره‌ای فوری)،
   موشک‌انداز (گلوله‌ی منحنی با انفجار محدوده‌ای) و شعله‌افکن
   (رگبار کوتاه‌برد + آتش‌گیرندگی زامبی) */
function updateTurrets(dt) {
  for (const t of state.turrets) {
    const def = TURRETS[t.type];
    t.cd = Math.max(0, t.cd - dt);
    t.flash = Math.max(0, t.flash - dt);
    t.recoil = Math.max(0, t.recoil - dt * 5);
    t.hover = !state.placing && Math.abs(state.mouse.x - t.x) < 26 && Math.abs(state.mouse.y - (t.y - 14)) < 30;

    /* نزدیک‌ترین زامبیِ زنده در شعاع برد */
    let best = null, bd = Infinity;
    for (const z of state.zombies) {
      if (z.dead) continue;
      const d = Math.abs(z.x - t.x);
      if (d <= def.range && d < bd) { bd = d; best = z; }
    }
    if (best) {
      const s = (best.radius / 15) * (best.depth || 1);
      const want = Math.atan2((best.y - 20 * s) - (t.y - def.h), best.x - t.x);
      let diff = want - t.aim;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      t.aim += diff * Math.min(1, dt * 8);   // چرخش نرم لوله به سمت هدف
      /* (۲۰٫۰) تسلا: شلیک نیست — تخلیه‌ی فوریِ زنجیره‌ای */
      if (t.type === 'tesla') {
        if (t.cd <= 0) teslaDischarge(t);
      } else if (t.cd <= 0 && Math.abs(diff) < 0.35) {
        turretFire(t);
      }
    }
    if (t.type === 'gatling') t.spin += dt * (best ? 16 : 3);   // چرخش لوله‌های مسلسل
    /* برفک‌های محیطی برجک یخ‌زن */
    if (t.type === 'frost' && Math.random() < dt * 2.5) {
      state.particles.push({ x: t.x + rand(-13, 13), y: t.y - rand(14, 30),
        vx: rand(-6, 6), vy: rand(8, 20), age: 0, life: rand(0.6, 1.2),
        size: rand(1, 1.8), color: 'rgba(200,235,255,0.8)', grav: 10 });
    }
    /* (۲۰٫۰) جرقه‌های دوره‌ای گویِ تسلا */
    if (t.type === 'tesla' && Math.random() < dt * 5) {
      addZap(t.x + rand(-9, 9), t.y - def.h - rand(0, 9));
    }
    /* (۲۰٫۰) شعله‌ی فتیله‌ی شعله‌افکن (همیشه روشن) */
    if (t.type === 'flame' && Math.random() < dt * 9) {
      state.particles.push({ x: t.x + Math.cos(t.aim) * 15, y: t.y - def.h + Math.sin(t.aim) * 15,
        vx: rand(-8, 8), vy: -18, age: 0, life: 0.3, size: 1.6,
        color: 'rgba(255,170,70,0.9)', grav: -30 });
    }
  }
}

/* (۲۰٫۰) تخلیه‌ی تسلا: آذرخش زنجیره‌ای — تا def.chain هدفِ نزدیک */
function teslaDischarge(t) {
  const def = TURRETS.tesla;
  const lvl = state.upgrades.turretUp;
  const dmg = Math.round(def.dmg * (1 + 0.22 * lvl));
  let px = t.x, py = t.y - def.h;
  const hitSet = new Set();
  let n = 0;
  for (let link = 0; link < def.chain; link++) {
    let best = null, bd = Infinity;
    for (const z of state.zombies) {
      if (z.dead || hitSet.has(z)) continue;
      const d = Math.hypot(z.x - px, (z.y - 20) - py);
      if (d < (link === 0 ? def.range : 190) && d < bd) { bd = d; best = z; }
    }
    if (!best) break;
    hitSet.add(best);
    /* قوس آذرخش نمایشی */
    addTeslaArc(px, py, best.x, best.y - 22);
    hitZombie(best, dmg, best.x, best.y - 22, Math.sign(best.x - t.x) || 1, false, def.knock, 'tesla');
    px = best.x; py = best.y - 22;
    n++;
  }
  if (n > 0) {
    t.cd = def.rate / (1 + 0.09 * lvl);
    t.flash = 0.12;
    t.recoil = 1;
    state.shake = Math.max(state.shake, 2);
    SFX.zap();
  }
}

/* قوس آذرخش تسلا — زیگزاگِ بنفشِ لرزان */
function addTeslaArc(x0, y0, x1, y1) {
  const pts = [{ x: x0, y: y0 }];
  for (let i = 1; i < 5; i++) {
    const t = i / 5;
    pts.push({ x: x0 + (x1 - x0) * t + rand(-9, 9), y: y0 + (y1 - y0) * t + rand(-9, 9) });
  }
  pts.push({ x: x1, y: y1 });
  state.zaps.push({ pts, age: 0, life: 0.16, tesla: true });
  spawnParticles(x1, y1, 4, '#c04dff', { speed: 90, life: 0.3, size: 2, grav: 120 });
}

/* شلیک برجک: گلوله با پرچم‌های مخصوص (tur/frost/tracer/crit) به صف گلوله‌ها اضافه می‌شود
   (۲۰٫۰) موشک‌انداز: گلوله‌ی موشک با دنباله + انفجار محدوده‌ای؛
   شعله‌افکن: گلوله‌های آتشینِ کوتاه‌برد با پراکندگی و «آتش‌گیرندگی» */
function turretFire(t) {
  const def = TURRETS[t.type];
  const lvl = state.upgrades.turretUp;
  const dmg = Math.round(def.dmg * (1 + 0.22 * lvl));
  const mx = t.x + Math.cos(t.aim) * (def.len + 4);
  const my = t.y - def.h + Math.sin(t.aim) * (def.len + 4);
  if (t.type === 'flame') {
    /* رگبار شعله: دو گلوله‌ی آتشین با پراکندگی زیاد */
    for (let k = 0; k < 2; k++) {
      const a = t.aim + rand(-0.16, 0.16);
      state.bullets.push({
        x: mx, y: my,
        vx: Math.cos(a) * def.spd, vy: Math.sin(a) * def.spd,
        dmg, r: 5.5, life: def.range / def.spd + 0.12,
        knock: def.knock, dead: false,
        tur: t.type, flame: true,
      });
    }
    t.cd = def.rate / (1 + 0.09 * lvl);
    t.flash = 0.06;
    t.recoil = 0.5;
    SFX.flameShot();
    return;
  }
  const a = t.aim + rand(-0.03, 0.03);
  state.bullets.push({
    x: mx, y: my,
    vx: Math.cos(a) * def.spd, vy: Math.sin(a) * def.spd,
    dmg, r: t.type === 'sniper' ? 4 : (t.type === 'missile' ? 6 : (t.type === 'frost' ? 4.5 : 2.8)),
    life: t.type === 'sniper' ? 1.4 : (t.type === 'missile' ? 2.2 : 1.1),
    knock: def.knock, dead: false,
    pellet: t.type === 'gatling',          // گلوله‌های ریز مسلسل
    tur: t.type,                           // منبع شلیک (برای آمار)
    frost: t.type === 'frost',             // گلوله‌ی یخی
    missile: t.type === 'missile',         // (۲۰٫۰) موشک — انفجار محدوده‌ای
    tracer: t.type === 'sniper',           // رد بلند تک‌تیرانداز
    crit: t.type === 'sniper' && Math.random() < (def.crit || 0),
  });
  t.cd = def.rate / (1 + 0.09 * lvl);
  t.flash = t.type === 'sniper' ? 0.09 : (t.type === 'missile' ? 0.14 : 0.07);
  t.recoil = 1;
  if (t.type === 'gatling') {
    SFX.turShot();
    spawnParticles(mx, my, 2, '#ffd88a', { speed: 70, life: 0.12, size: 1.6, grav: 0, dir: t.aim, spread: 0.6 });
  } else if (t.type === 'sniper') {
    SFX.sniperShot();
    state.shake = Math.min(5, state.shake + 1.2);
    spawnParticles(mx, my, 5, '#fff3c4', { speed: 160, life: 0.22, size: 2.2, grav: 0, dir: t.aim, spread: 0.9 });
  } else if (t.type === 'missile') {
    SFX.missileShot();
    spawnParticles(mx, my, 8, '#ffb26e', { speed: 130, life: 0.35, size: 2.6, grav: 0, dir: t.aim, spread: 0.8 });
  } else {
    SFX.frostShot();
    spawnParticles(mx, my, 4, '#bfe6ff', { speed: 60, life: 0.4, size: 1.8, grav: 60, dir: t.aim, spread: 1.2 });
  }
}

/* ---------------------- ۹) سکه‌ها و جعبه‌های قدرت ---------------------- */
/* با مرگ هر زامبی چند سکه می‌پرد بیرون (تعدادش به نوع دشمن بستگی دارد) */
function dropCoins(z) {
  const range = ZTYPES[z.type].coins;
  const n = Math.round(rand(range[0], range[1]));
  for (let i = 0; i < n; i++) {
    state.coinsArr.push({
      x: z.x, y: z.y - 18, vx: rand(-100, 100), vy: rand(-280, -140),
      phase: 'drop', t: 0, bounces: 0, flySpeed: 420, dead: false,
    });
  }
}

/* محل شمارنده سکه در HUD (تبدیل مختصات صفحه به مختصات بوم تا سکه‌ها دقیقاً به آن پرو کنند) */
function coinTarget() {
  try {
    const r = canvas.getBoundingClientRect();
    const c = $('coinItem').getBoundingClientRect();
    return {
      x: (c.left + c.width / 2 - r.left) / r.width * W,
      y: (c.top + c.height / 2 - r.top) / r.height * H,
    };
  } catch (e) { return { x: W - 150, y: 26 }; }
}

function updateCoins(dt) {
  const target = coinTarget(); // یک بار در هر فریم محاسبه می‌شود
  for (const c of state.coinsArr) {
    if (c.dead) continue;
    c.t += dt;
    if (c.phase === 'drop') {
      /* پرتاب اولیه + جاذبه + وایراستن روی زمین */
      c.vy += 900 * dt;
      c.x += c.vx * dt; c.y += c.vy * dt;
      if (c.y > GROUND_Y - 6) {
        c.y = GROUND_Y - 6;
        c.vy *= -0.45; c.vx *= 0.7; c.bounces++;
        if (Math.abs(c.vy) < 40 || c.bounces >= 2 || c.t > 0.9) c.phase = 'fly';
      }
    } else {
      /* پرو شتاب‌دار به سمت شمارنده سکه در HUD */
      const dx = target.x - c.x, dy = target.y - c.y;
      const d = Math.hypot(dx, dy) || 1;
      c.flySpeed += 1400 * dt;
      const step = Math.min(d, c.flySpeed * dt);
      c.x += dx / d * step; c.y += dy / d * step;
      if (d < 18) { collectCoin(c); continue; }
    }
    /* برق کوچکی که گاهی از سکه می‌پرد (۳٫۰) */
    if (Math.random() < dt * 2.2) {
      state.particles.push({ x: c.x + rand(-5, 5), y: c.y + rand(-5, 5), vx: 0, vy: -14,
        age: 0, life: 0.35, size: 1.2, color: '#ffe98a', grav: 0 });
    }
    if (c.t > 4) collectCoin(c); // بیمه: سکه گم‌نشده جمع شود
  }
  state.coinsArr = state.coinsArr.filter(c => !c.dead);
}

function collectCoin(c) {
  if (c.dead) return;
  c.dead = true;
  state.coins++;
  state.stats.earned++;
  updateHUD();
  pulseCoins();
}

/* پالس بصری شمارنده سکه در HUD */
function pulseCoins() {
  const el = $('coinItem');
  el.classList.remove('pulse');
  void el.offsetWidth;                     // ریست انیمیشن
  el.classList.add('pulse');
}

/* ---------- جعبه‌های قدرت (۳٫۰) ----------
   از زامبی‌ها می‌افتند، روی زمین وای می‌دارند، بعد خودشان به
   بازیکن پرو می‌کنند و اثرشان فعال می‌شود. */
function pickPowerType() {
  const r = Math.random();
  return r < 0.30 ? 'medkit' : r < 0.57 ? 'rapid' : r < 0.80 ? 'freeze' : 'coin';
}

function spawnPowerupObj(type, x, y) {
  state.powerups.push({
    type, x, y, vx: rand(-70, 70), vy: rand(-260, -150),
    phase: 'drop', t: 0, fs: 260, dead: false, bob: rand(0, 6.28),
  });
}

function maybeDropPowerup(z) {
  if (z.type === 'boss') {                 // پادشاه همیشه دو جعبه می‌ریزد
    spawnPowerupObj(pickPowerType(), z.x - 24, z.y - 40);
    spawnPowerupObj(pickPowerType(), z.x + 24, z.y - 40);
    state.killsSinceDrop = 0;
    return;
  }
  state.killsSinceDrop++;
  /* شانس پایه ۸٫۵٪ + «شفقت»: اگر خیلی وقت است یکی نیفتاده باشد حتماً می‌افتد */
  if (state.killsSinceDrop > 24 || Math.random() < 0.085) {
    state.killsSinceDrop = 0;
    spawnPowerupObj(pickPowerType(), z.x, z.y - 20);
  }
}

function updatePowerups(dt) {
  const tx = TOWER.x, ty = TOWER_TOP_Y - 24;   // مقصد: بازیکن روی بام
  for (const p of state.powerups) {
    if (p.dead) continue;
    p.t += dt;
    if (p.phase === 'drop') {
      p.vy += 800 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.y > GROUND_Y - 10) {
        p.y = GROUND_Y - 10;
        p.vy *= -0.42; p.vx *= 0.65;
        if (Math.abs(p.vy) < 30 || p.t > 0.8) p.phase = 'wait';
      }
    } else if (p.phase === 'wait') {
      if (p.t > 1.15) p.phase = 'fly';    // مکث کوتاه روی زمین، بعد پرو به بازیکن
    } else {
      const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy) || 1;
      p.fs += 900 * dt;
      const step = Math.min(d, p.fs * dt);
      p.x += dx / d * step; p.y += dy / d * step;
      if (d < 18) { applyPowerup(p); p.dead = true; continue; }
    }
    if (p.t > POWER_LIFE) p.dead = true;  // اگر کسی نگرفت محو شود
  }
  state.powerups = state.powerups.filter(p => !p.dead);
}

/* اعمال اثر جعبه‌ی قدرت */
function applyPowerup(p) {
  const def = PTYPES[p.type];
  SFX.power();
  switch (p.type) {
    case 'medkit': {
      const heal = Math.min(def.heal, state.tower.maxHp - state.tower.hp);
      state.tower.hp = Math.min(state.tower.maxHp, state.tower.hp + def.heal);
      addText(TOWER.x, TOWER_TOP_Y - 44, '+' + faNum(Math.round(heal)) + ' ❤️', '#7be389', 15);
      spawnParticles(TOWER.x, TOWER_TOP_Y - 30, 14, '#7be389', { speed: 150, life: 0.55, size: 2.5, grav: 250, up: true });
      break;
    }
    case 'rapid':
      state.powerTimers.rapid = def.dur;
      addText(TOWER.x, TOWER_TOP_Y - 44, 'شلیک سریع ⚡', '#ffd873', 15);
      spawnParticles(TOWER.x, TOWER_TOP_Y - 30, 14, '#ffd873', { speed: 160, life: 0.5, size: 2.4, grav: 250, up: true });
      break;
    case 'freeze':
      state.powerTimers.freeze = def.dur;
      SFX.freeze();
      addText(TOWER.x, TOWER_TOP_Y - 44, 'انجماد ❄', '#8fd6ff', 15);
      spawnParticles(TOWER.x, TOWER_TOP_Y - 30, 18, '#bfe6ff', { speed: 180, life: 0.7, size: 2.4, grav: 120 });
      break;
    case 'coin': {
      state.coins += def.bonus;
      state.stats.earned += def.bonus;
      for (const c of state.coinsArr) c.phase = 'fly';   // همه‌ی سکه‌های زمین هم جمع شود
      addText(TOWER.x, TOWER_TOP_Y - 44, '+' + faNum(def.bonus) + ' 💰', '#f5c542', 15);
      pulseCoins();
      break;
    }
  }
  updateHUD();
}

/* ---------------------- ۱۰) اقتصاد و ارتقاها (ساخت‌وساز زنده) ---------------------- */
/* قیمت ارتقای kind در سطح فعلی (گردشده به مضرب ۵) */
function priceOf(kind) {
  const u = UPGRADES[kind], lvl = state.upgrades[kind];
  return Math.round(u.base * Math.pow(u.growth, lvl) / 5) * 5;
}

/* لرزش آیتم پنل + صدای «نه» وقتی سکه کافی نیست */
function denyBPItem(kind) {
  const item = $('bp-' + kind);
  if (item) { item.classList.remove('deny'); void item.offsetWidth; item.classList.add('deny'); }
  SFX.deny();
}

/* انتخاب سلاح (کلید ۱/۲/۳ یا کلیک روی کاشیِ سلاح در پنل ساخت‌وساز — ۱۲٫۰)
   (۲۰٫۰) سلاح‌های «تحویل‌شده به فروشنده» دیگر انتخاب نمی‌شوند */
function selectWeapon(id) {
  if (!WEAPONS[id] || !WEAPONS[id].owned) { SFX.deny(); try { denyBPItem(id); } catch (e) {} return; }
  if (state.weapon === id) return;
  state.weapon = id;
  SFX.click();
  try { addText(TOWER.x, TOWER_TOP_Y - 52, '🔫 ' + WEAPONS[id].name, '#8fd6ff', 14); } catch (e) {}
  updateHUD();
}

/* خرید ارتقا — در ۳٫۰ وسط مبارزه هم مجاز است (پنل زنده‌ی کنار نقشه) */
function attemptBuy(kind) {
  if (!canPlay()) return;                  // فقط وقتی بازی جریان دارد
  const u = UPGRADES[kind];

  /* --- (۲۰٫۰) کلت: سلاحِ شروع — کلیک فقط انتخابش می‌کند --- */
  if (kind === 'pistol') { selectWeapon('pistol'); return; }

  /* --- برجک‌های دفاعی: به حالت انتخاب محل نصب می‌رود (۴٫۰)
       (۲۰٫۰) برجک‌های ویژه فقط با «نقشه‌ی ساخت»ِ خریداری‌شده از دستفروش --- */
  if (TURRETS[kind]) {
    if (TURRETS[kind].rare && !(state.bps && state.bps[kind])) {
      SFX.deny();
      setAnnounce('🔒 نقشه‌ی ساخت نداری!', 'این برجک ویژه فقط از «دستفروش مرموز» باز می‌شود', 2.2);
      return;
    }
    startPlacement(kind);
    return;
  }

  /* --- سلاح‌های یک‌بار خرید (شاتگان/مسلسل) — ۲۰٫۰: خریدِ تازه =
       تحویلِ سلاحِ قبلی به فروشنده؛ تب ساخت‌وساز فقط سلاحِ فعلی +
       بعدی را نشان می‌دهد (پیشرفتِ تک‌خطی: کلت ← شاتگان ← مسلسل) --- */
  if (kind === 'shotgun' || kind === 'mg') {
    if (WEAPONS[kind].owned) { selectWeapon(kind); return; }
    if (state.coins < u.price) { denyBPItem(kind); return; }
    state.coins -= u.price;
    state.weaponSpent += u.price;               // مبنای غرامتِ «زیر آوار ماندن»
    /* سلاحِ قبلی تحویل می‌شود (دیگر در ساخت‌وساز/انتخاب نیست) */
    const prev = kind === 'shotgun' ? 'pistol' : 'shotgun';
    if (WEAPONS[prev].owned) {
      WEAPONS[prev].owned = false;
      addText(TOWER.x, TOWER_TOP_Y - 70, WEAPONS[prev].name + ' تحویل شد 🔁', '#c3cdea', 13);
    }
    WEAPONS[kind].owned = true;
    selectWeapon(kind);                    // بلافاصله دستِ کاربر می‌افتد
    setBPTab('wpn', true);                 // (۱۲٫۰) تب سلاح‌ها جلوی چشم باشد
    SFX.buy();
    spawnParticles(TOWER.x, TOWER_TOP_Y - 20, 18, '#ffd873', { speed: 170, life: 0.6, size: 2.6, grav: 300, up: true });
    updateHUD(); refreshBuildPanel();
    return;
  }

  /* --- تعمیر سریع --- */
  if (kind === 'repair') {
    if (state.tower.hp >= state.tower.maxHp - 0.5) return;
    if (state.coins < u.price) { denyBPItem(kind); return; }
    state.coins -= u.price;
    const heal = Math.round(state.tower.maxHp * u.frac);
    state.tower.hp = Math.min(state.tower.maxHp, state.tower.hp + heal);
    addText(TOWER.x, TOWER_TOP_Y - 40, '+' + faNum(heal), '#6fce62', 16);
    spawnParticles(TOWER.x, TOWER_TOP_Y - 30, 14, '#6fce62', { speed: 150, life: 0.55, size: 2.5, grav: 250, up: true });
    SFX.buy();
    updateHUD(); refreshBuildPanel();
    return;
  }

  /* --- ارتقاهای سطح‌دار (اسلحه/جون/تله) --- */
  const lvl = state.upgrades[kind];
  if (lvl >= u.max) return;
  const price = priceOf(kind);
  if (state.coins < price) { denyBPItem(kind); return; }
  state.coins -= price;
  state.upgrades[kind] = lvl + 1;
  if (kind === 'weapon' || kind === 'speed') state.weaponSpent += price;   // (۸/۹٫۰) مبنای غرامت
  if (kind === 'health') {
    /* هم حداکثر جون زیاد می‌شود هم همین الان ترمیم می‌شود */
    state.tower.maxHp += u.bonus;
    state.tower.hp = Math.min(state.tower.maxHp, state.tower.hp + u.bonus);
    addText(TOWER.x, TOWER_TOP_Y - 40, '+' + faNum(u.bonus), '#6fce62', 15);
  }
  if (kind === 'turretUp') {
    /* جلوه‌ی ارتقای برجک‌ها: جرقه‌ی طلایی روی همه‌ی برجک‌های نصب‌شده (۴٫۰) */
    for (const t of state.turrets) spawnParticles(t.x, t.y - 18, 10, '#ffd873',
      { speed: 130, life: 0.5, size: 2.2, grav: 250, up: true });
    if (state.turrets.length) addText(TOWER.x, TOWER_TOP_Y - 40, 'برجک‌ها قوی‌تر شدند! ⬆', '#ffd873', 14);
  }
  if (kind === 'trap' && lvl === 0) {
    /* نصب اول تله: جلوه بصری نصب */
    spawnParticles(TOWER.x, GROUND_Y - 8, 16, '#ffcf6e', { speed: 150, life: 0.5, size: 2.5, grav: 300, up: true });
    state.shake = Math.min(8, state.shake + 4);
  }
  SFX.buy();
  updateHUD(); refreshBuildPanel();
}

/* آسیب فعلی تله (برای نمایش در پنل) */
function trapDps(lvl) { return lvl <= 0 ? 0 : UPGRADES.trap.dps + UPGRADES.trap.dpsPerLvl * (lvl - 1); }
