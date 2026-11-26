/* ==================================================================
   سه طبقه تا مرگ — ماژول داستان پایه (v44) — شخصیت‌ها، اینترو، نام فصل‌ها،
   دستفروش، زنجیرهٔ پیروزی و مسیریابی پایان.
   (نسخهٔ ۴۴: پلتفرمر و سیستم E30 قدیمی حذف شد؛ پایانِ رسمی در v43_ending)
   ================================================================== */

/* ---------- ۴۰-۱) صداهای تازه: جایگزینی کامل VOICES23 ---------- */
try {
  (function () {
    for (const k of Object.keys(VOICES23)) delete VOICES23[k];
    Object.assign(VOICES23, VOICES40_DATA);
    if (VOICE && VOICE._warmAll) VOICE._warmAll = false;   /* گرم‌سازی دوباره با کلیپ‌های تازه */
    if (VOICE && VOICE._bufs) { for (const k of Object.keys(VOICE._bufs)) delete VOICES23['_b_' + k]; try { VOICE._bufs = {}; } catch (e) {} }
  })();
} catch (e) {}

/* ---------- ۴۰-۲) گوینده‌های جدید + نام‌گذاری پرامپت ---------- */
try {
  Object.assign(DLG_WHO, {
    p:  { name: 'آرش',               color: '#8fd6ff' },
    b:  { name: 'هیولای آخر',        color: '#c44dff' },
    m:  { name: 'دکتر مریم',          color: '#7be3c8' },
    q:  { name: '📻 دکتر مریم',       color: '#7be3c8' },
    s:  { name: 'دکتر سارا',          color: '#f2a6c0' },
    k:  { name: '📻 دکتر سارا',       color: '#f2a6c0' },
    g:  { name: 'نگهبان',            color: '#b9c4d6' },
    d1: { name: 'دستفروش شنل‌پوش',     color: '#d8a3ff' },
    d2: { name: 'پیرمرد خنده‌رو',      color: '#e8c9a0' },
    d3: { name: 'ماسک گاز',           color: '#a8d8c0' },
    d4: { name: 'جوان بارانی‌زرد',     color: '#ffe86e' },
    d5: { name: 'چرخ‌دسته',            color: '#c8b8e8' },
  });
} catch (e) {}

/* پرتره‌ی سارا/نگهبان + نرمال‌سازی چهره‌های دستفروش و رادیو */
try {
  const _drawPortrait30 = drawPortrait;
  drawPortrait = function (cv, who, talking, t) {
    if (who && who.length > 1 && who[0] === 'd' && /^[1-5]$/.test(who[1])) who = 'd';
    if (who === 'q') who = 'm';
    if (who !== 's' && who !== 'g') return _drawPortrait30(cv, who, talking, t);
    const c = cv.getContext('2d');
    const S = cv.width;
    c.clearRect(0, 0, S, S);
    const bg = c.createRadialGradient(S / 2, S * 0.42, 8, S / 2, S / 2, S * 0.62);
    bg.addColorStop(0, 'rgba(40,46,64,0.95)'); bg.addColorStop(1, 'rgba(12,14,22,0.98)');
    c.fillStyle = bg;
    c.beginPath(); c.arc(S / 2, S / 2, S * 0.48, 0, Math.PI * 2); c.fill();
    c.save();
    c.translate(S / 2, S / 2 + 2 + (talking ? Math.sin(t * 9) * 1.2 : 0));
    const bob = talking ? Math.sin(t * 9) : 0;
    const F = '#f0c49a';
    const mouth = (open) => {
      c.fillStyle = '#3a1f22';
      if (open > 0.15) { c.beginPath(); c.ellipse(0, 13, 4.2, 3.2 * open, 0, 0, Math.PI * 2); c.fill(); }
      else c.fillRect(-3.6, 12, 7.2, 1.8);
    };
    const eyes = (x1, x2, y, r, col) => {
      c.fillStyle = col || '#fff';
      c.beginPath(); c.arc(x1, y, r, 0, Math.PI * 2); c.arc(x2, y, r, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#1a1f2c';
      c.beginPath(); c.arc(x1 + 0.7, y, r * 0.5, 0, Math.PI * 2); c.arc(x2 + 0.7, y, r * 0.5, 0, Math.PI * 2); c.fill();
    };
    const rr2 = (cc, x, y, w2, h2, r2) => { cc.beginPath(); cc.moveTo(x + r2, y); cc.arcTo(x + w2, y, x + w2, y + h2, r2); cc.arcTo(x + w2, y + h2, x, y + h2, r2); cc.arcTo(x, y + h2, x, y, r2); cc.arcTo(x, y, x + w2, y, r2); cc.closePath(); cc.fill(); };
    const circle2 = (cc, x, y, r2) => { cc.beginPath(); cc.arc(x, y, r2, 0, Math.PI * 2); cc.fill(); };
    if (who === 's') {                              /* دکتر سارا — خسته، بانداز، موی روشن */
      const sG = c.createLinearGradient(-17, -6, 17, 20);
      sG.addColorStop(0, '#c4c8ce'); sG.addColorStop(0.55, '#a8adb6'); sG.addColorStop(1, '#8a909a');
      c.fillStyle = sG; rr2(c, -17, -6, 34, 26, 9);
      c.strokeStyle = 'rgba(8,12,20,0.4)'; c.lineWidth = 1.2; rr2(c, -17, -6, 34, 26, 9); c.stroke();
      c.fillStyle = 'rgba(190,90,80,0.85)'; rr2(c, -16, 4, 9, 8, 2);
      c.strokeStyle = 'rgba(140,60,50,0.9)'; c.lineWidth = 0.9;
      c.beginPath(); c.moveTo(-16, 6.5); c.lineTo(-7, 6.5); c.moveTo(-16, 9.5); c.lineTo(-7, 9.5); c.stroke();
      c.fillStyle = F; circle2(c, 0, -2, 14.4);
      c.fillStyle = 'rgba(150,140,130,0.95)';
      c.beginPath(); c.arc(0, -4.5, 14.8, Math.PI * 0.92, Math.PI * 1.98); c.fill();
      c.fillRect(-12.5, -6.5, 9, 3.4);
      eyes(-5.4, 5.4, -3, 2.8, '#e8eef4');
      c.fillStyle = 'rgba(70,60,60,0.4)';
      c.fillRect(-7, -1.4, 5, 1.4); c.fillRect(2.4, -1.4, 5, 1.4);
      c.strokeStyle = 'rgba(100,80,74,0.9)'; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(-8, -7.2); c.lineTo(-3, -6.4); c.moveTo(3, -6.4); c.lineTo(8, -7.2); c.stroke();
      mouth(0.22 + bob * 0.18);
    } else {                                        /* نگهبان — کلاه و یونیفرم */
      const gG = c.createLinearGradient(-17, -6, 17, 20);
      gG.addColorStop(0, '#4a5462'); gG.addColorStop(0.55, '#3c4450'); gG.addColorStop(1, '#2c323c');
      c.fillStyle = gG; rr2(c, -17, -6, 34, 26, 9);
      c.strokeStyle = 'rgba(8,12,20,0.4)'; c.lineWidth = 1.2; rr2(c, -17, -6, 34, 26, 9); c.stroke();
      c.fillStyle = '#c9a24e'; rr2(c, -14, 2, 7, 5, 1);
      c.fillStyle = '#2c323c'; rr2(c, -13, -13, 26, 7, 3);
      c.fillStyle = '#232830'; rr2(c, -15, -10, 30, 3, 1.5);
      c.fillStyle = F; circle2(c, 0, -1.5, 13.5);
      eyes(-5.2, 5.2, -2.5, 2.8, '#e8eef4');
      c.strokeStyle = 'rgba(60,66,80,0.95)'; c.lineWidth = 1.3;
      c.beginPath(); c.moveTo(-8, -6.6); c.lineTo(-3, -7); c.moveTo(3, -7); c.lineTo(8, -6.6); c.stroke();
      c.strokeStyle = 'rgba(90,96,110,0.9)'; c.lineWidth = 1.3;
      c.beginPath(); c.moveTo(-3.4, 10.5); c.lineTo(3.4, 10.5); c.stroke();
      mouth(0.14 + bob * 0.2);
    }
    c.restore();
  };
} catch (e) {}

/* ---------- ۴۰-۴) اینترو — صحنهٔ ۱ پرامپت (شهر سوخته) ---------- */
try {
  (function () {
    INTRO_DLGS.length = 0;
    INTRO_DLGS.push(
      [ { who: 'p', v: 'in1p', text: 'وای... شهر چی شده... دیروز اینجا همه‌چی عادی بود.' },
        { who: 'a', v: 'in2a', text: 'دیگه عادی نیست. ببین... اونا دیگه آدم نیستن.' },
        { who: 'p', v: 'in3p', text: 'این مرض چیکار کرده با مردم...' },
        { who: 'a', v: 'in4a', text: 'غصه خوردن فایده نداره. باید قبل از تاریکی یه جای امن پیدا کنیم.' } ],
      [ { who: 'p', v: 'in7p', text: 'کجا؟ همه‌جا همینه!' },
        { who: 'a', v: 'in8a', text: 'اونجا رو ببین... یه برج... چراغاش هنوز روشنه!' } ],
      [ { who: 'p', v: 'in9p', text: 'اون برج اصلیه؟ یعنی کسی هنوز اون توئه؟' },
        { who: 'a', v: 'in10a', text: 'اگه بریم اون تو، درش رو ببندیم و تعمیرش کنیم، چند شب می‌تونیم دووم بیاریم.' },
        { who: 'p', v: 'in13p', text: 'تعمیر؟ با چی؟' },
        { who: 'a', v: 'in14a', text: 'با هر چی پیدا می‌کنیم — چوب، آهن، سیم...' } ],
      [ { who: 'a', v: 'in17a', text: 'شب اول فقط باید زنده بمونیم؛ بعد کم‌کم قویش می‌کنیم.' },
        { who: 'p', v: 'in18p', text: 'باشه... راه بیفت. داره تاریک می‌شه.' } ],
    );
  })();
} catch (e) {}

/* ---------- ۴۰-۵) نام فصل‌ها + خطوط مینی‌گیم طبق پرامپت ---------- */
try {
  (function () {
    const names = ['برج اصلی', 'حاشیهٔ شهر', 'برج مخابراتی', 'برج دیده‌بانی'];
    const subs = ['شب‌های آجری', 'مهِ صنعتی', 'خرابه‌ها', 'پشتِ دیوارها'];
    for (let i = 0; i < 4 && i < CHAPTERS.length; i++) {
      CHAPTERS[i].name = names[i];
      CHAPTERS[i].sub = subs[i];
    }
    if (typeof TR_BARKS !== 'undefined') {
      if (TR_BARKS[1]) TR_BARKS[1].start = { who: 'a', v: 'drv1', text: 'بگیر بشین! جاده پر از اوناس!' };
      if (TR_BARKS[2]) TR_BARKS[2].start = { who: 'a', v: 'riv1', text: 'قایق رو نگه دار! جریان تنده!' };
      if (TR_BARKS[3]) TR_BARKS[3].start = { who: 'a', v: 'snw1', text: 'برف داره کورمون می‌کنه! آروم برو!' };
      /* پایان انتقال ۱→۲ = خطوط پرامپت فصل ۲ (ضد تکرار — chStart[2] نداریم) */
      if (TR_BARKS[1] && Array.isArray(TR_BARKS[1].outro)) {
        TR_BARKS[1].outro.length = 0;
        TR_BARKS[1].outro.push(
          { who: 'p', v: 'ch2a', text: 'فکر می‌کردم پناهگاه نزدیکه...' },
          { who: 'a', v: 'ch2b', text: 'نزدیک بود، قبل از اینکه جاده‌ها بسته بشن. ادامه بده.' },
        );
      }
    }
  })();
} catch (e) {}

/* ---------- ۴۰-۶) متن‌های بارک ارشان = متن کلیپ‌های تازه ---------- */
try {
  (function () {
    const fix = {
      aw1: { text: 'من همین‌جام! تو فقط شلیک کن!', sub: 'من همین‌جام! تو فقط شلیک کن!' },
      aw2: { text: 'حواست باشه! گروه بزرگ میاد!', sub: 'حواست باشه! گروه بزرگ میاد!' },
      aw3: { text: 'دمت گرم! همین‌جوری بزن!', sub: 'دمت گرم! همین‌جوری بزن!' },
      aw4: { text: 'چراغ‌قوه‌ت داره خاموش می‌شه!', sub: 'چراغ‌قوه‌ت داره خاموش می‌شه!' },
      aw5: { text: 'برج ترک خورده! می‌رم پایین!', sub: 'برج ترک خورده! می‌رم پایین!' },
      aw6: { text: 'خسته نباشی! موج بعدی رو من رصد می‌کنم.', sub: 'خسته نباشی! موج بعدی رو من رصد می‌کنم.' },
    };
    for (const k in fix) {
      if (ARSHAN_BARKS[k]) {
        ARSHAN_BARKS[k].text = fix[k].text;
        ARSHAN_BARKS[k].sub = fix[k].sub;
      }
    }
  })();
} catch (e) {}

/* ---------- ۴۰-۷) «درباره» — متن پرامپت بخش ۵ ---------- */
try {
  (function () {
    const el = document.querySelector('#aboutScreen .m27-text');
    if (el) {
      el.innerHTML =
        '<div>«سه طبقه تا مرگ» — داستان <b>آرش</b> و <b>ارشان</b>. در شهری که شیوعِ «تبِ خاکستری» آن‌را به ویرانه تبدیل کرد، دو نفر به یک برج سه‌طبقه پناه بردند و سی‌وشش شب — در چهار فصل — در برابر لشکر زامبی‌ها ایستادند.</div>' +
        '<div>از جاده و قایق و اسنوموبیل گذشتند؛ فرکانسِ 104.5 را کشف کردند و به رازی رسیدند به نام <b>پروژهٔ Z</b>: شبکه‌ای از فرستنده‌ها که رفتار گله‌ها را هدایت می‌کند — و حالا، بدونِ صاحب، خودش نفس می‌کشد.</div>' +
        '<div>در پناهگاه نهایی، تصمیمِ آخر با آرش است: خاموشی، انحراف، یا پخشِ حقیقت. هر سه، قیمتی دارند.</div>' +
        '<div style="color:#eef3ff;font-style:italic">پایانِ فصلِ اولِ داستان — ادامه دارد...</div>' +
        '<div class="about-credit">ساخته شده توسط <b>سهند مرامی</b></div>';
    }
  })();
} catch (e) {}

/* ---------- ۴۰-۸) دستفروش — بانک پنج چهره (پرامپت بخش ۷) ---------- */
const PED30_BANKS = [
  { /* ۱. شنل‌پوش مرموز — آرام و کشیده */
    intro: [
      { v: 'pd1i1', t: 'کالای دست اول! ببین... بخری.' },
      { v: 'pd1i2', t: 'بازگشتم. مثل همیشه، قبل از تاریکی.' },
      { v: 'pd1i3', t: 'امشب سنگین‌تره. آماده‌ای؟' },
    ],
    ans: [
      { v: 'pd1a1', t: 'تقلبی؟ در این دنیا اصل و تقلبی فرقی نداره... فقط زنده موندن مهمه.' },
      { v: 'pd1a2', t: 'تا غروب اینجام. زود انتخاب کن.' },
    ],
    farewell: [
      { v: 'pd1f1', t: 'غروب شد... باید رفت.' },
      { v: 'pd1f2', t: 'فردا... اگه فردایی باشه.' },
    ],
  },
  { /* ۲. پیرمرد خنده‌رو — گرم و پدربزرگ‌بازاری */
    intro: [
      { v: 'pd2i1', t: 'به‌به! مشتری قدیمی! بیا ببین چی آوردم برات!' },
      { v: 'pd2i2', t: 'این کوله‌پشتی از خودم سنگین‌تره، ولی برای تو می‌ارزه!' },
    ],
    ans: [
      { v: 'pd2a1', t: 'قیمت؟ جون عزیزت! مگه تو این دوره کسی قیمت می‌پرسه؟' },
      { v: 'pd2a2', t: 'بخر جوون، پشیمون نمی‌شی... اکثراً!' },
    ],
    farewell: [
      { v: 'pd2f1', t: 'مواظب خودت باش جوون! فردا می‌بینمت... اگه عمری باشه!' },
    ],
  },
  { /* ۳. ماسک گاز — خفه و خشک */
    intro: [
      { v: 'pd3i1', t: '...کالا. بخر.' },
      { v: 'pd3i2', t: 'هوا سمیه. من نه. کالا بخر.' },
    ],
    ans: [
      { v: 'pd3a1', t: 'حرف زیاد... وقت کم.' },
      { v: 'pd3a2', t: 'سؤال؟ نه.' },
    ],
    farewell: [
      { v: 'pd3f1', t: '...رفتم.' },
    ],
  },
  { /* ۴. جوان بارانی‌زرد — پرحرف و پرانرژی */
    intro: [
      { v: 'pd4i1', t: 'سلام سلام! بهترین جنس شهر اینجاست! البته اگه از شهر چیزی مونده باشه!' },
      { v: 'pd4i2', t: 'امروز تخفیف ویژه دارم! فقط امروز! فردا معلوم نیست زنده باشیم!' },
    ],
    ans: [
      { v: 'pd4a1', t: 'تقلبی؟ داداش، من خودم تستشون کردم! البته نه روی خودم...' },
      { v: 'pd4a2', t: 'بگیرش، ضرر نمی‌کنی. یا می‌کنی. ولی احتمالش کمه!' },
    ],
    farewell: [
      { v: 'pd4f1', t: 'غروب شد! من رفتم! فردا زودتر بیا!' },
    ],
  },
  { /* ۵. چرخ‌دسته — خسته ولی مهربان */
    intro: [
      { v: 'pd5i1', t: 'این چرخ‌دسته رو از سه شهر دورتر هل دادم تا اینجا. یه نگاهی بنداز.' },
      { v: 'pd5i2', t: 'خسته‌ام، ولی جنسام تازه‌ست.' },
    ],
    ans: [
      { v: 'pd5a1', t: 'قیمت‌ها رو خودت می‌دونی... این روزا همه‌چی گرونه، حتی زنده موندن.' },
      { v: 'pd5a2', t: 'انتخاب با توئه. من فقط راه رو نشون می‌دم.' },
    ],
    farewell: [
      { v: 'pd5f1', t: 'راه درازه... باید برم. فردا همین‌جا.' },
    ],
  },
];
const PED30_DOUBTS = [
  { v: 'pdA1', t: 'کالای کمیاب؟ تقلبی نیست؟' },
  { v: 'pdA2', t: 'از کجا میاری اینا رو؟' },
  { v: 'pdA3', t: 'تو کی هستی اصلاً؟ هر بار یه شکلی...' },
  { v: 'pdA4', t: 'امشب چی پیشنهاد می‌کنی؟' },
  { v: 'pdA5', t: 'چطور همیشه قبل از حمله می‌رسی؟' },
];
const PED30_MYSTERY = [
  { v: 'pmh1', t: 'تو هم حسش کردی، نه؟ اینکه یه چیزی سر جاش نیست.' },
  { v: 'pmh2', t: 'پناهگاه؟ هه... همه‌جا همون‌جوریه که باید باشه.' },
  { v: 'pmh3', t: 'Z؟ ...نه، چیزی نگفتم. بخر دیگه.' },
  { v: 'pmh4', t: 'من فقط می‌فروشم. سؤال، گرون‌تره.' },
  { v: 'pmh5', t: 'یه روز می‌فهمی چرا همیشه قبل از غروب می‌رم.' },
];

/* رپ PED.talk / PED.leave — گفتگوی مستقل هر چهره (پرامپت) */
try {
  const _pedOpenShop = PED.openShop.bind(PED);
  PED.talk = function () {
    this.phase = 'talk';
    const who = 'd' + (this.look + 1);
    const visit = Math.max(1, state.peddler.visits | 0);
    const lines = [];
    if (visit === 1) {
      lines.push({ who: 'd1', v: 'pdf1', text: 'تازه‌واردی، نه؟ اولین بار همیشه سخته. بخر، شاید دومی هم باشه.' });
    }
    const B = PED30_BANKS[this.look % PED30_BANKS.length];
    const intro = B.intro[(visit - 1) % B.intro.length];
    lines.push({ who, v: intro.v, text: intro.t });
    const doubt = PED30_DOUBTS[(visit - 1) % PED30_DOUBTS.length];
    lines.push({ who: 'p', v: doubt.v, text: doubt.t });
    const ans = B.ans[(visit - 1) % B.ans.length];
    lines.push({ who, v: ans.v, text: ans.t });
    if (visit >= 3 && visit % 5 === 0) {
      const mh = PED30_MYSTERY[(Math.floor(visit / 5) - 1) % PED30_MYSTERY.length];
      lines.push({ who, v: mh.v, text: mh.t });
    }
    try { if (typeof VOICE !== 'undefined') VOICE.pedTweak = null; } catch (e) {}
    try {
      DLG.start(lines, () => { if (PED.phase === 'talk') _pedOpenShop(); });
    } catch (e) { _pedOpenShop(); }
  };
  PED.leave = function (farewell) {
    if (!this.active) return;
    if (this.phase !== 'leave') {
      this.phase = 'leave';
      this.dir = -this.dirFrom;
      try { DLG.skip(); } catch (e) {}
      hidePeddlerPanel();
      state.peddler.here = false;
      if (farewell !== false) {
        const visit = Math.max(1, state.peddler.visits | 0);
        const B = PED30_BANKS[this.look % PED30_BANKS.length];
        const fw = B.farewell[(visit - 1) % B.farewell.length];
        try { VOICE.speak(fw.t, 'd' + (this.look + 1), fw.v); } catch (e) {}
      }
    }
  };
} catch (e) {}

/* ---------- ۴۰-۹) پیروزی شب ۳۶ → زنجیرهٔ پایان جدید ---------- */
try {
  const _updateVictoryCine30 = updateVictoryCine;
  updateVictoryCine = function (dt) {
    if (!VC) return;
    VC.t += dt;
    DLG.update(dt);
    state.dayness = Math.min(1, state.dayness + dt * 0.55);
    state.shake = Math.max(0, state.shake - dt * 22);
    state.flash = Math.max(0, state.flash - dt * 2.2);
    state.comboPop = Math.max(0, state.comboPop - dt);
    updateParticles(dt);
    updateTexts(dt);
    if (VC.t < 2.4 && Math.random() < dt * 20) {
      spawnParticles(rand(0, W), -8, 1, '#ffd873', { speed: 26, life: 2.4, size: 2.4, grav: 110 });
    }
    if (VC.phase === 'dawn') {
      /* (۴۰٫۰) «تموم شد... رسیدیم.» — پرامپت: پایان شب ۳۶ */
      if (!VC.spoken && VC.t > 1.3) {
        VC.spoken = true;
        const dl = (typeof STORY22 !== 'undefined') ? STORY22.afterFinal : [];
        DLG.start(dl, () => { if (VC) VC.done = true; });
      }
      if (!VC.radio && VC.t > 3.2) { VC.radio = true; try { SFX.peddler(); } catch (e) {} }
      if ((VC.done || VC.t > 26) && VC.t > 8) {
        VOICE.stop();
        DLG.skip();
        VC = null;
        startEnding43();
      }
    }
  };
} catch (e) {}

/* ---------- ۴۰-۱۰) مسیریابی کانال sheltercine → زنجیرهٔ پایان/پلتفرمر ---------- */
/* (۴۰٫۰) تایپ پایانی طبق پرامپت: «این داستان ادامه دارد...» */
function updateTbc40(dt) {
  if (!SHEL) return;
  SHEL.t += dt;
  DLG.update(dt);
  updateParticles(dt);
  updateTexts(dt);
  const full = 'ادامه دارد...';
  if (SHEL.typed < full.length) {
    SHEL.typeAcc = (SHEL.typeAcc || 0) + dt * 7.5;
    while (SHEL.typeAcc >= 1 && SHEL.typed < full.length) {
      SHEL.typeAcc -= 1;
      SHEL.typed++;
      if (SHEL.typed % 3 === 0) SFX.click();
    }
    const el = $('tbcTitle');
    if (el) el.innerHTML = full.slice(0, SHEL.typed) + '<span class="tbccaret">▌</span>';
  } else if (!SHEL.tbcDone) {
    SHEL.tbcDone = true;
    const el = $('tbcTitle');
    if (el) el.textContent = full;
    try { const sub = $('tbcSub'); if (sub) { sub.textContent = 'پایان فصل اول داستان'; sub.classList.add('on'); } } catch (e) {}
    try { $('tbcTease').classList.add('on'); } catch (e) {}
    try { $('tbcRow').classList.add('on'); } catch (e) {}
    try { VOICE.speak(full, 'n', 'tbc1n'); } catch (e) {}
    try { SFX.heartbeat(); } catch (e) {}
  } else {
    SHEL.teaseT = (SHEL.teaseT || 0) + dt;
    if (SHEL.teaseT > 2.2) { SHEL.teaseT = 0; try { SFX.heartbeat(); } catch (e) {} }
  }
}
try {
  const _updateShelterCine30 = updateShelterCine;
  updateShelterCine = function (dt) {
    if (E30.phase) { updateEnding43(dt); return; }
    if (SHEL && SHEL.phase === 'tbc') { updateTbc40(dt); return; }
    _updateShelterCine30(dt);
  };
  const _renderShelterCine30 = renderShelterCine;
  renderShelterCine = function () {
    if (E30.phase) { renderEnding43(); return; }
    _renderShelterCine30();
  };
  const _skipShelterCine30 = skipShelterCine;
  skipShelterCine = function () {
    if (E30.phase) { skipEnding43(); return; }
    _skipShelterCine30();
  };
} catch (e) {}

/* ---------- ۴۰-۱۱) صفحهٔ باخت: دو خط پرامپت + جریان DLG ---------- */
try {
  const _finishDefeatCine30 = finishDefeatCine;
  finishDefeatCine = function () {
    if (!DF || DF.ended) return;
    _finishDefeatCine30();
    setTimeout(() => {
      try {
        if (state.mode === 'gameover' && !DLG.active) {
          DLG.start([
            { who: 'p', v: 'df1p', text: 'نه... هنوز تموم نشده...' },
            { who: 'a', v: 'df2a', text: 'بلند شو! نمی‌ذارم اینجا تمومش کنی! یه شب دیگه... فقط یه شب دیگه!' },
          ], null);
        }
      } catch (e) {}
    }, 900);
  };
  /* DLG.update در صفحهٔ باخت (کانال updateFx) */
  const _updateFx30 = updateFx;
  updateFx = function (dt) {
    if (DLG.active) { try { DLG.update(dt); } catch (e) {} }
    return _updateFx30(dt);
  };
  const _retryFromSave30 = retryFromSave;
  retryFromSave = function () {
    try { DLG.skip(); } catch (e) {}
    _retryFromSave30();
  };
} catch (e) {}
/* ==================================================================
   سه طبقه تا مرگ — نسخهٔ ۳۰٫۰ — فصل میانی: سفر (پلتفرمر کنترا-سبک)
   ==================================================================
   طبق پرامپت (بخش ۲ «فصل میانی» + بخش ۴-۲):
     · آرش پیاده، با تفنگ، در حال دویدن و پریدن بین خرابه‌ها و شلیک
     · ۳ مرحله: خرابه‌های شهر / پل شکسته / راه شمالی — هر کدام حس
       متفاوت: پستی‌وبلندی، سکوها، سنگ‌ها و موانع، چاله‌ها
     · چک‌پوینت وسط هر مرحله — مرگ = ادامه از همان‌جا
     · دی‌پد مجازی (◀ ▶) + دکمهٔ پرش + دکمهٔ شلیک (بخش ۴-۲)
     · مهمات بی‌نهایت («بیاید! مهماتم تموم نمی‌شه!»)
   حالت: state.mode === 'plat' — dispatch در v3_part3/part4.
   ================================================================== */

const E30 = {
  phase: '', t: 0, dlgStarted: false, dlgDone: false,
  fade: 0, sub: '', walkK: 0, sirenPulse: 0,
};
/* ---------- ۴۰-۱۱) ضدتکرار صدا: بارک‌های ارشان + دستفروش متنوع‌تر ----------
   قبلاً هر موج همان یک جمله‌ی «من همین‌جام!» و هر صبح همان «خسته نباشی» پخش می‌شد.
   الان هر بار از استخرِ سه‌گانه یکی انتخاب می‌شود و تا چند نوبت جمله‌ی قبلی برنمی‌گردد. */
try {
  (function () {
    /* استخرِ شروع شب برای aw1 */
    const nightPool = ['aw1', 'aw1b', 'aw1c'];
    const morningPool = ['aw6', 'aw6b', 'aw6c'];
    let lastNight = '', lastMorning = 0;
    function pick(pool, last) {
      const cand = pool.filter(k => k !== last);
      return cand[Math.floor(Math.random() * cand.length)] || pool[0];
    }
    if (typeof ARSHAN_BARKS !== 'undefined') {
      if (!ARSHAN_BARKS.__awOrig) ARSHAN_BARKS.__awOrig = { aw1: ARSHAN_BARKS.aw1, aw6: ARSHAN_BARKS.aw6 };
      /* تعریف واریانت‌های تازه (هم‌شکل بارک‌های پایه) */
      const _mk = (v, text, title) => ({ who: 'a', v, text, title, sub: text });
      if (!ARSHAN_BARKS.aw1b) ARSHAN_BARKS.aw1b = _mk('aw1b', 'شب شروع شد؛ حواست فقط طرفینِ برج باشه.', '🧭 [ارشان]:');
      if (!ARSHAN_BARKS.aw1c) ARSHAN_BARKS.aw1c = _mk('aw1c', 'هر چی می‌بینم بهت می‌گم؛ تو فقط تیر بزن.', '🧭 [ارشان]:');
      if (!ARSHAN_BARKS.aw6b) ARSHAN_BARKS.aw6b = _mk('aw6b', 'بردیمش! امشب هم این برج سرِ پا موند.', '🌤 [ارشان]:');
      if (!ARSHAN_BARKS.aw6c) ARSHAN_BARKS.aw6c = _mk('aw6c', 'خسته نباشی جوون؛ فردا مالِ خودمونه.', '🌤 [ارشان]:');
      const O = ARSHAN_BARKS.__awOrig;
      const mkNight = function () {
        const k = pick(nightPool, lastNight); lastNight = k;
        return k === 'aw1' ? O.aw1 : ARSHAN_BARKS[k];
      };
      const mkMorning = function () {
        let k = pick(morningPool, lastMorning); lastMorning = k;
        return k === 'aw6' ? O.aw6 : ARSHAN_BARKS[k];
      };
      try { delete ARSHAN_BARKS.aw1; } catch (e) {}
      try { delete ARSHAN_BARKS.aw6; } catch (e) {}
      Object.defineProperty(ARSHAN_BARKS, 'aw1', { get: mkNight });
      Object.defineProperty(ARSHAN_BARKS, 'aw6', { get: mkMorning });
    }
    /* صبح‌ها: هر روز از استخر، ولی جمله‌ی دیروز تکرار نشود */
    if (typeof ARSHAN !== 'undefined') { ARSHAN.__lastMorningKey = 0; }
    /* دستفروش: خوش‌آمد و پاسخِ تازه برای هر چهره + دو شکِ تازه‌ی آرش */
    if (typeof PED30_BANKS !== 'undefined') {
      const ADD = {
        0: { i: { v: 'pd1i3', t: 'امشب یه چیزِ کمیاب آوردم... کسی نباید بفهمه.' },
             a: { v: 'pd1a3', t: 'سؤالِ زیاد... اعتمادِ کم میاره. فقط انتخاب کن.' } },
        1: { i: { v: 'pd2i3', t: 'بیا بیا! یه سورپرایز دارم که موهات وانهسته!' },
             a: { v: 'pd2a3', t: 'کار می‌کنه! روی خودم تستش نکردم، ولی کار می‌کنه!' } },
        2: { i: { v: 'pd3i3', t: '...جنسِ تازه رسیده. نگاه کن.' },
             a: { v: 'pd3a3', t: 'تست‌شده. روی اونا.' } },
        3: { i: { v: 'pd4i3', t: 'وایسا! قبل از اینکه بپرسی بگم: تخفیفِ ویژه‌ی امشب!' },
             a: { v: 'pd4a3', t: 'ضمانت؟! تو دنیای زامبی‌ها ضمانت یعنی همین بسته‌ی پلاستیکی!' } },
        4: { i: { v: 'pd5i3', t: 'چرخ‌دسته رو نگاه کن؛ بینِ چرخ‌ها چیزای خوبی گیر کرده.' },
             a: { v: 'pd5a3', t: 'قیمتش منصفانه‌ست؛ مثلِ نفس کشیدن. کسی ممنونت نمی‌شه.' } },
      };
      for (const bi in ADD) {
        const B = PED30_BANKS[+bi]; if (!B) continue;
        if (typeof B.intro === 'object' && B.intro.length >= 1 && !B.intro.some(l => l.v === ADD[bi].i.v)) B.intro.push(ADD[bi].i);
        if (typeof B.ans === 'object' && B.ans.length >= 1 && !B.ans.some(l => l.v === ADD[bi].a.v)) B.ans.push(ADD[bi].a);
      }
    }
    if (typeof PED30_DOUBTS !== 'undefined') {
      const DN = [
        { v: 'pdA6', t: 'اگه امروز بخرم... فردا هم میای؟' },
        { v: 'pdA7', t: 'چیزی داری که برج رو نجات بده؟' },
      ];
      for (const d of DN) if (!PED30_DOUBTS.some(l => l.v === d.v)) PED30_DOUBTS.push(d);
    }
  })();
} catch (e) { /* بی‌خطر */ }

/* ---------- ۴۰-۱۲) رندر اپیلوگ و تیتراژ پایانی (۴۱٫۰) ---------- */
