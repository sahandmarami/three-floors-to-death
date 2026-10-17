/* ==================================================================
   سه طبقه تا مرگ — ماژول ۴۰٫۰ — داستان کامل پرامپت روی پایهٔ v39
   ==================================================================
   اضافه‌شده‌ها (طبق پرامپت کامل کاربر):
     · شخصیت‌ها: آرش(بازیکن)/ارشان/دکتر مریم/دکتر سارا/نگهبان
     · دیالوگ‌های کامل پرامپت (اینترو/پایان فصل‌ها/تماس رادیویی مریم/
       پناهگاه=تله/آژیر/پروندهٔ Z/توقف‌گاه/جدایی/ایستگاه/پایان باز)
     · فصل میانی پلتفرمر — ۳ مرحلهٔ کنترا-سبک + چک‌پوینت + دی‌پد لمسی
     · زنجیرهٔ پایان: arrive→welcome→siren→control→escape→fire→part→
       [پلتفرمر×۳]→station→driveoff→«این داستان ادامه دارد...»
     · دستفروش: بانک دیالوگ مستقل برای ۵ چهره + شک‌های آرش + اشاره‌های مرموز
     · ۱۷۵ کلیپ صدای فارسی ElevenLabs (۱۵ صدای متمایز) با کلیدهای تازه
   معماری: ماژول تزریقی روی HTML تک‌فایل v39 — بازنویسی داده‌ها +
   رپ کردن توابع قابل‌تخصیص (updateVictoryCine/updateShelterCine/
   renderShelterCine/skipShelterCine/finishDefeatCine/updateFx).
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

/* ---------- ۴۰-۳) STORY22 — دیالوگ‌های کامل پرامپت ---------- */
try {
  (function () {
    for (const k of Object.keys(STORY22)) delete STORY22[k];
    Object.assign(STORY22, {
      afterWave: {
        1: [
          { who: 'a', v: 'c1w1a', text: 'رفتن؟ واقعاً رفتن؟' },
          { who: 'p', v: 'c1w1b', text: 'عقب‌نشینی کردن. هنوز امن نیست.' },
        ],
        2: [
          { who: 'a', v: 'c1w2a', text: 'چند تا تخته شکست!' },
          { who: 'p', v: 'c1w2b', text: 'ورودی رو اول تعمیر می‌کنم.' },
        ],
        3: [
          { who: 'a', v: 'c1w3a', text: 'جعبه ابزار پیدا کردم!' },
          { who: 'p', v: 'c1w3b', text: 'نگهش دار. به کار میاد.' },
        ],
        4: [
          { who: 'a', v: 'c1w4a', text: 'صبر کن... این صدا از کجاست؟' },
          { who: 'p', v: 'c1w4b', text: 'بی‌سیمه. هنوز کار می‌کنه.' },
          { who: 'r', v: 'c1w4r', text: 'توجه... ایستگاه شمال... مسیر اصلی مسدود...' },
          { who: 'a', v: 'c1w4c', text: 'شنیدی؟ ممکنه آدم‌های دیگه‌ای باشن!' },
          { who: 'p', v: 'c1w4d', text: 'پیام ناقص بود. فعلاً زنده بمونیم.' },
        ],
        5: [
          { who: 'a', v: 'c1w5a', text: 'این دفعه تعدادشون بیشتر بود.' },
          { who: 'p', v: 'c1w5b', text: 'منابع رو بی‌خودی هدر ندیم.' },
        ],
        /* فصل ۳ — تعمیر فرستنده (پرامپت) */
        18: [
          { who: 'a', v: 'c3ra1', text: 'فرستنده آسیب دیده. باید تعمیرش کنیم.' },
          { who: 'p', v: 'c3ra2', text: 'قطعه‌هاش رو از همین ایستگاه پیدا می‌کنیم.' },
        ],
      },
      preFinalWave: {
        6: [
          { who: 'a', v: 'c4f1', text: 'همه آماده‌ان. ولی این سکوت عادی نیست.' },
          { who: 'p', v: 'c4f2', text: 'همین فکر رو منم می‌کنم.' },
          { who: 'p', v: 'c4f7', text: 'هرچی باشه، آماده‌ایم.' },
        ],
        36: [
          { who: 'a', v: 'c4f1', text: 'همه آماده‌ان. ولی این سکوت عادی نیست.' },
          { who: 'p', v: 'c4f2', text: 'همین فکر رو منم می‌کنم.' },
          { who: 'p', v: 'c4f7', text: 'هرچی باشه، آماده‌ایم.' },
        ],
      },
      chEnd: {
        1: [
          { who: 'p', v: 'c1n1p', text: 'شیش شب گذشت. هنوز زنده‌ایم.' },
          { who: 'a', v: 'c1n2a', text: 'خبر رسیده یه پناهگاه بیرون شهر داره بازمانده قبول می‌کنه.' },
          { who: 'p', v: 'c1n3p', text: 'از کجا معلوم تله نباشه؟' },
          { who: 'a', v: 'c1n4a', text: 'از اینجا موندن که بدتر نیست. ماشین رو آماده کن.' },
        ],
        2: [
          { who: 'a', v: 'c2ea', text: 'اونجا رو ببین! یه قایقه!' },
          { who: 'p', v: 'c2eb', text: 'اول بدنه‌ش رو بررسی می‌کنیم.' },
          { who: 'p', v: 'c2ed', text: 'وسط راه خراب شه، برگشتی نداریم.' },
          { who: 'p', v: 'c2em', text: 'ممکنه همون ایستگاه باشه. مسیر فرعی می‌ریم.' },
        ],
        3: [
          { who: 'q', v: 'c3eq1', text: 'اینجا پناهگاهه. اگه صدام رو می‌شنوید، یعنی زنده‌اید. بیاید سمت ما.' },
          { who: 'p', v: 'c3ep1', text: 'دیدی؟ گفتم تله نیست.' },
        ],
      },
      chEndMsg: {
        1: 'فصل اول به پایان رسید. مقصد بعدی: جادهٔ شمالی.',
        2: 'فصل دوم به پایان رسید. مقصد بعدی: برج مخابراتی.',
        3: 'فصل سوم به پایان رسید. مقصد نهایی: برج دیده‌بانی.',
      },
      chStart: {
        3: [
          { who: 'p', v: 'ch3a', text: 'اون برج مخابراتیه؟' },
          { who: 'a', v: 'ch3b', text: 'آره. اگه فرستنده‌ش سالم باشه، می‌تونیم با پناهگاه حرف بزنیم.' },
        ],
        4: [
          { who: 'q', v: 'ch4q1', text: 'از برج دیده‌بانی شما رو می‌بینم. فقط یه کم مونده. دووم بیارید.' },
        ],
      },
      shelterArrive: [
        { who: 'n', v: 'c4n1', text: 'پس از روزها مبارزه، به پناهگاهی رسیدند با نشانه‌های زندگی.' },
        { who: 'g', v: 'sa1g', text: 'اسلحه‌ها رو تحویل بدید. اینجا امنه.' },
        { who: 'p', v: 'sa2p', text: 'باورم نمی‌شه... واقعاً رسیدیم.' },
        { who: 'm', v: 'sa3m', text: 'خوش اومدید به پناهگاه. من دکتر مریمم.' },
      ],
      afterFinal: [
        { who: 'a', v: 'af1', text: 'تموم شد... رسیدیم.' },
      ],
      radioAlarm: [
        { who: 'a', v: 'si1a', text: 'این دیگه چیه؟!' },
        { who: 'm', v: 'si2m', text: 'این آژیر ما نیست... این پروتکل داخلیه!' },
        { who: 'p', v: 'si3p', text: 'دارن میان تو!' },
      ],
      ending: [],
      preWave1: [
        { who: 'a', v: 'w1a', text: 'آماده‌ست! امیدوارم تخته‌ها دوام بیارن!' },
        { who: 'p', v: 'w1b', text: 'در رو نگه دار. حواست به پنجره‌ها باشه.' },
        { who: 'p', v: 'w1d', text: 'نمی‌دونم. برای بدترین حالت آماده باش.' },
      ],
    });
  })();
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
        '<div>«سه طبقه تا مرگ» — داستان <b>آرش</b> و <b>ارشان</b>. وقتی ویروس <b>Z</b> شهر را به ویرانه تبدیل کرد، آن‌ها به برج اصلی پناه بردند، آن را تعمیر کردند و ۳۶ شب در برابر لشکر زامبی‌ها ایستادند.</div>' +
        '<div>از جاده و رودخانه و برف گذشتند تا به پناهگاهی رسیدند که قرار بود امن باشد... اما نبود. آنجا پرونده‌ای پیدا کردند به نام «پروژهٔ Z» که همه‌چیز را عوض کرد.</div>' +
        '<div>حالا <b>آرش</b>، تنها و پیاده، در دل خرابه‌ها به سمت ایستگاه شمالی می‌رود تا بفهمد چه کسی دنیا را نابود کرد.</div>' +
        '<div style="color:#eef3ff;font-style:italic">این داستان ادامه دارد...</div>' +
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
        startEnding30();
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
  const full = 'این داستان ادامه دارد...';
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
    try { $('tbcSub').classList.add('on'); } catch (e) {}
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
    if (PLAT30.on) { updatePlatformer(dt); return; }
    if (E30.phase) { updateEnding30(dt); return; }
    if (SHEL && SHEL.phase === 'tbc') { updateTbc40(dt); return; }
    _updateShelterCine30(dt);
  };
  const _renderShelterCine30 = renderShelterCine;
  renderShelterCine = function () {
    if (PLAT30.on) { renderPlatformer(); return; }
    if (E30.phase) { renderEnding30(); return; }
    _renderShelterCine30();
  };
  const _skipShelterCine30 = skipShelterCine;
  skipShelterCine = function () {
    if (PLAT30.on) {
      /* رد کردن پلتفرمر: پرش به ایستگاه (پایان مرحلهٔ جاری) */
      SFX.click();
      stopPlatformer();
      startStationCine30();
      return;
    }
    if (E30.phase) { skipEnding30(); return; }
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

/* ---------------------- ۳۰-پ-۱) داده‌ی مراحل ---------------------- */
/* زمین‌ها: {x,y,w,h} — y = بالای سطح. سکوها: kind:'plat' (پرش از پایین آزاد؟
   نه — سکو از بالا قابل فرود است و از پایین برخورد می‌کند = یکطرفه) */
function platBuildLevels() {
  const G = GROUND_Y;
  const L = [];

  /* ---- مرحلهٔ ۱: خرابه‌های شهر — خیابان ویران + ماشین‌ها + سکوهای بتنی ---- */
  {
    const solids = [], props = [], zs = [];
    // زمین پلکانی (پستی‌وبلندی ملایم)
    const segs = [
      [0, 0, 520], [520, -26, 300], [820, 0, 420], [1240, -40, 360],
      [1600, 0, 500], [2100, -22, 340], [2440, 0, 560],
    ];
    for (const [x, dy, w] of segs) solids.push({ x, y: G + dy, w, h: H - (G + dy), kind: 'ground' });
    // سکوهای بتنیِ شکسته
    solids.push({ x: 620, y: G - 118, w: 150, h: 16, kind: 'plat' });
    solids.push({ x: 980, y: G - 96, w: 190, h: 16, kind: 'plat' });
    solids.push({ x: 1360, y: G - 150, w: 170, h: 16, kind: 'plat' });
    solids.push({ x: 1740, y: G - 104, w: 210, h: 16, kind: 'plat' });
    solids.push({ x: 2160, y: G - 128, w: 180, h: 16, kind: 'plat' });
    // ماشین‌های رهاشده (موانع پرشی)
    props.push({ x: 430, kind: 'car', v: 0 }, { x: 1120, kind: 'car', v: 1 }, { x: 1980, kind: 'car', v: 2 }, { x: 2620, kind: 'car', v: 0 });
    // سنگ/آوار
    props.push({ x: 700, kind: 'rock' }, { x: 1520, kind: 'rock' }, { x: 2340, kind: 'rock' });
    // زامبی‌ها
    const spawn = [360, 560, 640, 760, 900, 1050, 1150, 1300, 1480, 1560, 1700, 1900, 2050, 2200, 2350, 2500, 2650];
    spawn.forEach((x, i) => zs.push({ x, ty: i % 7 === 6 ? 'f' : 'n' }));
    L.push({
      name: 'خرابه‌های شهر', sub: 'مرحلهٔ ۱ از ۳',
      len: 3000, cp: 1500, exitX: 2880, solids, props, zs,
      sky: [['#2a1f2e', '#8a5f4a'], ['#3a2836', '#a8765a'], ['#4a3040', '#c99770']],
      sun: { x: 0.78, y: 150, r: 54, c: 'rgba(255,196,120,' },
    });
  }

  /* ---- مرحلهٔ ۲: پل شکسته — چاله‌ها + عرشه‌های مرتفع ---- */
  {
    const solids = [], props = [], zs = [];
    const segs = [
      [0, 0, 430], [430, -30, 260],           // چالهٔ ۶۹۰..۷۶۰
      [760, 0, 240], [1000, -50, 300],        // چاله
      [1300, -30, 260], [1560, 0, 340],       // چالهٔ ۱۵۶۰
      [1900, -46, 420], [2320, 0, 680],
    ];
    for (const [x, dy, w] of segs) solids.push({ x, y: G + dy, w, h: H - (G + dy), kind: 'ground' });
    // سکوهای نجات روی چاله‌ها
    solids.push({ x: 700, y: G - 110, w: 120, h: 14, kind: 'plat' });
    solids.push({ x: 950, y: G - 140, w: 130, h: 14, kind: 'plat' });
    solids.push({ x: 1260, y: G - 120, w: 110, h: 14, kind: 'plat' });
    solids.push({ x: 1530, y: G - 150, w: 120, h: 14, kind: 'plat' });
    solids.push({ x: 1800, y: G - 130, w: 140, h: 14, kind: 'plat' });
    solids.push({ x: 2100, y: G - 170, w: 150, h: 14, kind: 'plat' });
    // نرده‌های پل + ستون‌ها
    props.push({ x: 460, kind: 'rail' }, { x: 1020, kind: 'rail' }, { x: 1580, kind: 'rail' }, { x: 2350, kind: 'rail' });
    props.push({ x: 820, kind: 'rock' }, { x: 1700, kind: 'rock' }, { x: 2560, kind: 'rock' });
    const spawn = [220, 340, 480, 560, 830, 900, 1040, 1120, 1350, 1430, 1620, 1700, 1950, 2050, 2150, 2400, 2520, 2660];
    spawn.forEach((x, i) => zs.push({ x, ty: i % 5 === 4 ? 'f' : 'n' }));
    L.push({
      name: 'پل شکسته', sub: 'مرحلهٔ ۲ از ۳',
      len: 3000, cp: 1480, exitX: 2890, solids, props, zs,
      sky: [['#1c2233', '#5a6a88'], ['#28324a', '#7890ac'], ['#36445e', '#98b4cc']],
      sun: { x: 0.16, y: 130, r: 40, c: 'rgba(200,220,255,' },
    });
  }

  /* ---- مرحلهٔ ۳: راه شمالی — تپه‌ها + سنگ‌ها + تانک‌ها + ایستگاه ---- */
  {
    const solids = [], props = [], zs = [];
    const segs = [
      [0, 0, 380], [380, -52, 300], [680, -104, 320], [1000, -52, 280],
      [1280, 0, 340], [1620, -40, 300], [1920, -88, 340], [2260, -40, 300],
      [2560, 0, 640],
    ];
    for (const [x, dy, w] of segs) solids.push({ x, y: G + dy, w, h: H - (G + dy), kind: 'ground' });
    solids.push({ x: 470, y: G - 160, w: 140, h: 16, kind: 'plat' });
    solids.push({ x: 800, y: G - 205, w: 150, h: 16, kind: 'plat' });
    solids.push({ x: 1130, y: G - 150, w: 160, h: 16, kind: 'plat' });
    solids.push({ x: 1700, y: G - 150, w: 150, h: 16, kind: 'plat' });
    solids.push({ x: 2050, y: G - 190, w: 170, h: 16, kind: 'plat' });
    // طاق ویران + سنگ‌ها + تابلوی راه
    props.push({ x: 300, kind: 'arch' }, { x: 1420, kind: 'arch' }, { x: 2450, kind: 'arch' });
    props.push({ x: 560, kind: 'rock' }, { x: 900, kind: 'rock' }, { x: 1560, kind: 'rock' }, { x: 2160, kind: 'rock' });
    props.push({ x: 2700, kind: 'sign' });
    const spawn = [260, 400, 500, 740, 860, 1000, 1120, 1350, 1500, 1660, 1800, 1980, 2100, 2280, 2400, 2600, 2740];
    spawn.forEach((x, i) => zs.push({ x, ty: i % 6 === 5 ? 't' : (i % 3 === 2 ? 'f' : 'n') }));
    L.push({
      name: 'راه شمالی', sub: 'مرحلهٔ ۳ از ۳',
      len: 3200, cp: 1560, exitX: 3060, solids, props, zs,
      sky: [['#241a2c', '#7a4a3a'], ['#332436', '#9a6248'], ['#45303f', '#c08a60']],
      sun: { x: 0.85, y: 140, r: 46, c: 'rgba(255,180,110,' },
    });
  }
  return L;
}

/* ---------------------- ۳۰-پ-۲) وضعیت ---------------------- */
const PLAT30 = {
  on: false, active: false, level: 1, t: 0, LVL: null, all: null,
  cam: 0, pl: null, zs: [], bullets: [], cpOn: false, exitDone: false,
  bark: {}, card: null, cardT: 0, keys: { l: false, r: false }, fireHeld: false,
  jumpQueued: false, shake: 0, deadT: 0, dying: false,
};

function startPlatformer(level) {
  try { VOICE.stop(); } catch (e) {}
  try { DLG.skip(); } catch (e) {}
  PLAT30.all = PLAT30.all || platBuildLevels();
  PLAT30.level = clamp(level, 1, 3);
  PLAT30.LVL = PLAT30.all[PLAT30.level - 1];
  PLAT30.t = 0;
  PLAT30.cam = 0;
  PLAT30.pl = {
    x: 60, y: GROUND_Y, vx: 0, vy: 0, onG: true, face: 1,
    hp: 3, inv: 0, cd: 0, walk: 0, muzzle: 0, deadT: 0,
  };
  PLAT30.zs = PLAT30.LVL.zs.map(z => ({
    x: z.x, y: GROUND_Y, vx: 0, vy: 0, ty: z.ty, hp: z.ty === 't' ? 6 : z.ty === 'f' ? 2 : 3,
    walk: Math.random() * 6.28, dead: false, deadT: 0, w: z.ty === 't' ? 30 : 20, h: z.ty === 't' ? 46 : 40,
    spd: z.ty === 't' ? 26 : z.ty === 'f' ? 96 : 52,
  }));
  PLAT30.bullets = [];
  PLAT30.cpOn = false;
  PLAT30.exitDone = false;
  PLAT30.bark = {};
  PLAT30.card = 'intro';
  PLAT30.cardT = 0;
  PLAT30.shake = 0; PLAT30.dying = false; PLAT30.deadT = 0;
  PLAT30.on = true;
  state.mode = 'sheltercine';               /* (۴۰٫۰) مسیریابی از کانال sheltercine */
  state.mouse.down = false;
  hideOverlays();
  hideDayPanel(); hidePeddlerPanel(); hideAnnounce(); hideChapterCard();
  try { $('wrap').classList.add('cine-mode'); } catch (e) {}
  try { $('lockBadge').classList.add('hidden'); } catch (e) {}
  try { $('bossBar').style.display = 'none'; bossBarVisible = false; } catch (e) {}
  try { setBuildPanel(true, true); } catch (e) {}
  platPadShow(true);
  try { MUSIC.set('menu'); } catch (e) {}
}

function stopPlatformer() {
  PLAT30.active = false;
  PLAT30.on = false;
  platPadShow(false);
  try { $('wrap').classList.remove('cine-mode'); } catch (e) {}
}

/* ---------------------- ۳۰-پ-۳) کنترل لمسی + کیبورد ---------------------- */
let _platPadMade = false;
function platPadMake() {
  if (_platPadMade) return;
  _platPadMade = true;
  const wrap = $('wrap');
  const pad = document.createElement('div');
  pad.id = 'platPad';
  pad.style.cssText = 'position:absolute;inset:0;z-index:26;pointer-events:none;display:none;';
  const btn = (id, label, css) => {
    const b = document.createElement('div');
    b.id = id;
    b.style.cssText = css;
    b.innerHTML = label;
    pad.appendChild(b);
    return b;
  };
  const u = 'calc(var(--uiz,1) * ';
  // دی‌پد چپ
  btn('platBL', '◀', `${u}68px);height:${u}68px);left:${u}18px);bottom:${u}20px);` +
    'position:absolute;border-radius:18px;background:rgba(18,24,40,.72);border:2px solid rgba(120,150,220,.55);' +
    'display:flex;align-items:center;justify-content:center;color:#cfe0ff;font-size:' + u + '26px);' +
    'pointer-events:auto;touch-action:none;user-select:none;box-shadow:0 4px 14px rgba(0,0,0,.4);');
  btn('platBR', '▶', `${u}68px);height:${u}68px);left:${u}104px);bottom:${u}20px);` +
    'position:absolute;border-radius:18px;background:rgba(18,24,40,.72);border:2px solid rgba(120,150,220,.55);' +
    'display:flex;align-items:center;justify-content:center;color:#cfe0ff;font-size:' + u + '26px);' +
    'pointer-events:auto;touch-action:none;user-select:none;box-shadow:0 4px 14px rgba(0,0,0,.4);');
  // پرش و شلیک راست
  btn('platBJ', 'پرش', `${u}76px);height:${u}76px);right:${u}18px);bottom:${u}20px);` +
    'position:absolute;border-radius:50%;background:rgba(46,58,30,.78);border:2px solid rgba(190,220,120,.6);' +
    'display:flex;align-items:center;justify-content:center;color:#eaf6c8;font-size:' + u + '17px);font-weight:900;' +
    'pointer-events:auto;touch-action:none;user-select:none;box-shadow:0 4px 14px rgba(0,0,0,.4);');
  btn('platBS', 'شلیک', `${u}66px);height:${u}66px);right:${u}112px);bottom:${u}30px);` +
    'position:absolute;border-radius:50%;background:rgba(84,34,30,.78);border:2px solid rgba(255,150,130,.6);' +
    'display:flex;align-items:center;justify-content:center;color:#ffd9c8;font-size:' + u + '15px);font-weight:900;' +
    'pointer-events:auto;touch-action:none;user-select:none;box-shadow:0 4px 14px rgba(0,0,0,.4);');
  wrap.appendChild(pad);

  const bind = (el, key, isJump, isFire) => {
    const set = (v, e) => {
      e.preventDefault();
      if (isJump && v) PLAT30.jumpQueued = true;
      else if (isFire) PLAT30.fireHeld = v;
      else PLAT30.keys[key] = v;
      el.style.filter = v ? 'brightness(1.55)' : 'none';
    };
    el.addEventListener('touchstart', e => set(true, e), { passive: false });
    el.addEventListener('touchend', e => set(false, e), { passive: false });
    el.addEventListener('touchcancel', e => set(false, e), { passive: false });
    el.addEventListener('pointerdown', e => set(true, e));
    el.addEventListener('pointerup', e => set(false, e));
    el.addEventListener('pointerleave', e => set(false, e));
    el.addEventListener('contextmenu', e => e.preventDefault());
  };
  bind($('platBL'), 'l', false, false);
  bind($('platBR'), 'r', false, false);
  bind($('platBJ'), 'j', true, false);
  bind($('platBS'), 's', false, true);

  // کیبورد
  window.addEventListener('keydown', e => {
    if (!PLAT30.on) return;
    if (['ArrowLeft', 'KeyA'].includes(e.code)) PLAT30.keys.l = true;
    if (['ArrowRight', 'KeyD'].includes(e.code)) PLAT30.keys.r = true;
    if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) { PLAT30.jumpQueued = true; e.preventDefault(); }
    if (['KeyJ', 'KeyX', 'Enter'].includes(e.code)) PLAT30.fireHeld = true;
  });
  window.addEventListener('keyup', e => {
    if (!PLAT30.on) return;
    if (['ArrowLeft', 'KeyA'].includes(e.code)) PLAT30.keys.l = false;
    if (['ArrowRight', 'KeyD'].includes(e.code)) PLAT30.keys.r = false;
    if (['KeyJ', 'KeyX', 'Enter'].includes(e.code)) PLAT30.fireHeld = false;
  });
}

function platPadShow(v) {
  platPadMake();
  const p = $('platPad');
  if (p) p.style.display = v ? 'block' : 'none';
}

/* ---------------------- ۳۰-پ-۴) فیزیک ---------------------- */
const PLAT_GRAV = 2000, PLAT_SPD = 250, PLAT_JUMP = 640, PLAT_BSPD = 840;

function platSolidAt(x, y0, y1) {
  for (const s of PLAT30.LVL.solids) {
    if (x >= s.x && x <= s.x + s.w && y1 >= s.y && y0 <= s.y + s.h) return s;
  }
  return null;
}

function platMovePlayer(dt) {
  const p = PLAT30.pl, LV = PLAT30.LVL;
  const dir = (PLAT30.keys.r ? 1 : 0) - (PLAT30.keys.l ? 1 : 0);
  p.vx = dir * PLAT_SPD;
  if (dir !== 0) { p.face = dir; p.walk += dt * 9; } else p.walk = 0;
  if (PLAT30.jumpQueued && p.onG) {
    p.vy = -PLAT_JUMP; p.onG = false;
    try { SFX.click(); } catch (e) {}
  }
  PLAT30.jumpQueued = false;
  p.vy += PLAT_GRAV * dt;
  if (p.vy > 1300) p.vy = 1300;

  /* عمودی */
  let ny = p.y + p.vy * dt;
  let ground = null;
  for (const s of LV.solids) {
    if (p.x + 8 > s.x && p.x - 8 < s.x + s.w) {
      const wasAbove = p.y <= s.y + 2;
      if (wasAbove && ny >= s.y && p.vy >= 0) { ground = s; ny = s.y; break; }
    }
  }
  if (ground) { p.vy = 0; p.onG = true; }
  else p.onG = false;
  p.y = ny;

  /* افقی */
  let nx = p.x + p.vx * dt;
  for (const s of LV.solids) {
    if (s.kind !== 'ground') continue;
    if (p.y > s.y + 4 && p.y - 42 < s.y + s.h) {         // هم‌ارتفاع با بدنه
      if (nx + 8 > s.x && p.x + 8 <= s.x && p.vx > 0) nx = s.x - 8;
      if (nx - 8 < s.x + s.w && p.x - 8 >= s.x + s.w && p.vx < 0) nx = s.x + s.w + 8;
    }
  }
  p.x = clamp(nx, 20, LV.len - 20);

  /* سقوط در چاله */
  if (p.y > H + 80) platHurt(1, true);
}

function platHurt(dmg, pit) {
  const p = PLAT30.pl;
  if (p.inv > 0 || PLAT30.dying) return;
  p.hp -= dmg;
  p.inv = 1.25;
  PLAT30.shake = 7;
  try { SFX.towerHit(); } catch (e) {}
  spawnParticles(p.x, p.y - 24, 8, 'rgba(200,60,50,0.8)', { speed: 90, life: 0.6, size: 2.6, grav: 400 });
  if (p.hp <= 0) {
    PLAT30.dying = true; PLAT30.deadT = 0;
  } else if (pit) {
    p.x = PLAT30.cpOn ? PLAT30.LVL.cp : 60;
    p.y = GROUND_Y - 200; p.vy = 0; p.vx = 0;
  }
}

function platRespawn() {
  const p = PLAT30.pl;
  p.hp = 3;
  p.inv = 2;
  p.x = PLAT30.cpOn ? PLAT30.LVL.cp : 60;
  p.y = GROUND_Y - 60; p.vy = 0;
  PLAT30.dying = false;
  /* زامبی‌های خیلی نزدیک به چک‌پوینت دور می‌شوند */
  for (const z of PLAT30.zs) {
    if (!z.dead && Math.abs(z.x - p.x) < 300) z.x = p.x + (z.x > p.x ? 340 : -260);
  }
}

function platShoot() {
  const p = PLAT30.pl;
  if (p.cd > 0) return;
  p.cd = 0.24;
  p.muzzle = 0.09;
  PLAT30.bullets.push({ x: p.x + p.face * 22, y: p.y - 27, vx: p.face * PLAT_BSPD, life: 1.1 });
  try { SFX.sniperShot(); } catch (e) {}
  spawnParticles(p.x + p.face * 26, p.y - 27, 3, 'rgba(255,220,140,0.9)', { speed: 60, life: 0.22, size: 2, grav: 0 });
}

/* ---------------------- ۳۰-پ-۵) به‌روزرسانی ---------------------- */
function updatePlatformer(dt) {
  if (!PLAT30.on || state.mode !== 'sheltercine') return;
  PLAT30.t += dt;
  try { MUSIC.update(); } catch (e) {}
  try { PERF.update(dt); } catch (e) {}
  updateParticles(dt);
  updateTexts(dt);
  PLAT30.shake = Math.max(0, PLAT30.shake - dt * 16);
  const p = PLAT30.pl, LV = PLAT30.LVL;

  /* کارت شروع/پایان مرحله */
  if (PLAT30.card) {
    PLAT30.cardT += dt;
    const dur = PLAT30.card === 'intro' ? 2.2 : 1.8;
    if (PLAT30.cardT >= dur) {
      const kind = PLAT30.card;
      PLAT30.card = null; PLAT30.cardT = 0;
      if (kind === 'done') {
        /* مرحلهٔ بعد یا ایستگاه */
        stopPlatformer();
        if (PLAT30.level >= 3) { startStationCine30(); return; }
        startPlatformer(PLAT30.level + 1);
        return;
      }
    }
    if (kind === 'intro' && PLAT30.cardT < dur) return;   // در کارت شروع، بازی می‌ایستد
  }

  /* مرگ و ری‌اسپاون */
  if (PLAT30.dying) {
    PLAT30.deadT += dt;
    if (PLAT30.deadT > 1.4) platRespawn();
    return;
  }

  platMovePlayer(dt);
  if (PLAT30.fireHeld) platShoot();
  p.cd = Math.max(0, p.cd - dt);
  p.inv = Math.max(0, p.inv - dt);
  p.muzzle = Math.max(0, p.muzzle - dt);

  /* چک‌پوینت */
  if (!PLAT30.cpOn && p.x >= LV.cp) {
    PLAT30.cpOn = true;
    try { bark('cpOn30', null, '', '🚩 ایستگاه سیو فعال شد', 'اگه بمیری از همین‌جا ادامه می‌دی', 2.2); } catch (e) {}
    try { SFX.buy(); } catch (e) {}
  }

  /* زامبی‌ها */
  for (const z of PLAT30.zs) {
    if (z.dead) { z.deadT += dt; continue; }
    const dx = p.x - z.x;
    if (Math.abs(dx) < 620) {
      z.vx = Math.sign(dx) * z.spd;
      z.walk += dt * (z.ty === 'f' ? 11 : z.ty === 't' ? 3.5 : 6.5);
      z.vy += PLAT_GRAV * dt;
      let ny = z.y + z.vy * dt, ground = null;
      for (const s of LV.solids) {
        if (z.x + z.w / 2 > s.x && z.x - z.w / 2 < s.x + s.w) {
          if (z.y <= s.y + 2 && ny >= s.y && z.vy >= 0) { ground = s; ny = s.y; break; }
        }
      }
      if (!ground) {
        /* (۳۰٫۰) فرو رفته در زمین/سکوی بالاتر؟ به سطح بیرون بیا */
        for (const s of LV.solids) {
          if (z.x + z.w / 2 > s.x && z.x - z.w / 2 < s.x + s.w && z.y > s.y && z.y - z.h < s.y + s.h) {
            ground = s; ny = s.y; z.vy = 0; break;
          }
        }
      }
      if (!ground) {
        /* فرو رفته در زمین/سکوی بالاتر؟ به سطح بیرون بیا */
        for (const s of LV.solids) {
          if (z.x + z.w / 2 > s.x && z.x - z.w / 2 < s.x + s.w && z.y > s.y && z.y - z.h < s.y + s.h) {
            ground = s; ny = s.y; z.vy = 0; break;
          }
        }
      }
      if (ground) { z.vy = 0; }
      z.y = ny;
      /* زمین را رد نکند */
      if (z.y > H + 60) { z.y = GROUND_Y; z.vy = 0; z.x -= Math.sign(dx) * 200; }
      /* برخورد با بازیکن */
      if (Math.abs(z.x - p.x) < z.w / 2 + 9 && Math.abs((z.y - z.h / 2) - (p.y - 24)) < 34) {
        platHurt(1, false);
        p.vx = 0; p.x -= Math.sign(z.x - p.x) * 3;
      }
    }
  }

  /* گلوله‌ها */
  for (let i = PLAT30.bullets.length - 1; i >= 0; i--) {
    const b = PLAT30.bullets[i];
    b.x += b.vx * dt; b.life -= dt;
    let hit = false;
    for (const z of PLAT30.zs) {
      if (z.dead) continue;
      if (b.x > z.x - z.w / 2 && b.x < z.x + z.w / 2 && b.y > z.y - z.h - 8 && b.y < z.y + 6) {
        z.hp--;
        hit = true;
        spawnParticles(b.x, b.y, 4, 'rgba(180,40,40,0.85)', { speed: 70, life: 0.4, size: 2.2, grav: 500 });
        if (z.hp <= 0) {
          z.dead = true; z.deadT = 0;
          spawnParticles(z.x, z.y - z.h / 2, 12, 'rgba(150,30,30,0.8)', { speed: 110, life: 0.7, size: 3, grav: 600 });
          try { SFX.hit(); } catch (e) {}
        }
        break;
      }
    }
    if (hit || b.life <= 0 || b.x < PLAT30.cam - 40 || b.x > PLAT30.cam + W + 40) PLAT30.bullets.splice(i, 1);
  }

  /* دوربین */
  PLAT30.cam = clamp(p.x - W * 0.36, 0, LV.len - W);

  /* بارک‌ها */
  const prog = p.x / LV.exitX;
  if (!PLAT30.bark.p1 && prog > 0.33) {
    PLAT30.bark.p1 = true;
    try { bark('pb1p', 'p', 'فقط یه کم دیگه...', '🥾 [آرش]:', 'فقط یه کم دیگه...', 2); } catch (e) {}
  }
  if (!PLAT30.bark.p2 && PLAT30.zs.filter(z => !z.dead && Math.abs(z.x - p.x) < 300).length >= 3) {
    PLAT30.bark.p2 = true;
    try { bark('pb2p', 'p', 'بیاید! مهماتم تموم نمی‌شه!', '🔫 [آرش]:', 'بیاید! مهماتم تموم نمی‌شه!', 2.4); } catch (e) {}
  }
  if (!PLAT30.bark.p3 && PLAT30.level === 3 && prog > 0.8) {
    PLAT30.bark.p3 = true;
    try { bark('pb3p', 'p', 'ایستگاه... اونجاست.', '📡 [آرش]:', 'ایستگاه... اونجاست.', 2.4); } catch (e) {}
  }

  /* رسیدن به خروجی */
  if (!PLAT30.exitDone && p.x >= LV.exitX) {
    PLAT30.exitDone = true;
    PLAT30.card = 'done'; PLAT30.cardT = 0;
    try { SFX.slowmo(); } catch (e) {}
    spawnParticles(p.x, p.y - 30, 26, 'rgba(255,220,130,0.9)', { speed: 130, life: 1.2, size: 2.8, grav: 300 });
  }
}

/* ---------------------- ۳۰-پ-۶) رندر ---------------------- */
function renderPlatformer() {
  if (!PLAT30.on || !PLAT30.LVL || state.mode !== 'sheltercine') return;
  const LV = PLAT30.LVL, p = PLAT30.pl, t = PLAT30.t;
  ctx.save();
  if (PLAT30.shake > 0.5) ctx.translate((Math.random() - 0.5) * PLAT30.shake, (Math.random() - 0.5) * PLAT30.shake);

  /* --- آسمان (غروبِ گرفته — پرامپت ۶-۱۳) --- */
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, LV.sky[0][0]);
  sky.addColorStop(0.6, LV.sky[1][0]);
  sky.addColorStop(1, LV.sky[2][0]);
  ctx.fillStyle = sky;
  ctx.fillRect(-20, -20, W + 40, GROUND_Y + 40);
  /* خورشیدِ گرفته + غبار نور */
  const sx = W * LV.sun.x, sy = LV.sun.y;
  const sg = ctx.createRadialGradient(sx, sy, 6, sx, sy, LV.sun.r * 3.2);
  sg.addColorStop(0, LV.sun.c + '0.5)');
  sg.addColorStop(0.4, LV.sun.c + '0.16)');
  sg.addColorStop(1, LV.sun.c + '0)');
  ctx.fillStyle = sg; circle(sx, sy, LV.sun.r * 3.2);
  ctx.fillStyle = LV.sun.c + '0.85)'; circle(sx, sy, LV.sun.r);
  /* پرتوهای غروب */
  ctx.fillStyle = 'rgba(255,200,140,0.05)';
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(sx - 520, GROUND_Y); ctx.lineTo(sx + 300, GROUND_Y);
  ctx.closePath(); ctx.fill();

  /* --- افقِ خرابه‌ها (پارالاکس دور) --- */
  let s2 = 91;
  const rd = () => { s2 = (s2 * 1103515245 + 12345) & 0x7fffffff; return s2 / 0x7fffffff; };
  const ruinsLayer = (par, base, hMin, hMax, col) => {
    ctx.fillStyle = col;
    const off = -PLAT30.cam * par;
    const step = 130;
    const i0 = Math.floor((-off) / step) - 1;
    for (let i = i0; i < i0 + Math.ceil(W / step) + 3; i++) {
      const bx = i * step + off;
      const bh = hMin + rd() * hMax;
      const bw = 60 + rd() * 58;
      ctx.fillRect(bx, base - bh, bw, bh);
      /* لبهٔ شکسته */
      ctx.beginPath();
      ctx.moveTo(bx, base - bh);
      ctx.lineTo(bx + bw * 0.3, base - bh - 10 - rd() * 16);
      ctx.lineTo(bx + bw * 0.65, base - bh - 4);
      ctx.lineTo(bx + bw, base - bh - 14 - rd() * 10);
      ctx.lineTo(bx + bw, base - bh + 2);
      ctx.lineTo(bx, base - bh + 2);
      ctx.closePath(); ctx.fill();
      /* چند پنجره */
      if (rd() < 0.5) {
        ctx.fillStyle = 'rgba(30,24,36,0.7)';
        ctx.fillRect(bx + 14 + rd() * 20, base - bh + 16, 5, 7);
        ctx.fillRect(bx + 40 + rd() * 14, base - bh + 30, 5, 7);
        ctx.fillStyle = col;
      }
    }
  };
  ruinsLayer(0.25, GROUND_Y + 6, 120, 190, 'rgba(38,30,44,0.55)');
  ruinsLayer(0.55, GROUND_Y + 10, 60, 120, 'rgba(28,22,34,0.8)');

  /* --- دنیا (با دوربین) --- */
  ctx.save();
  ctx.translate(-Math.round(PLAT30.cam), 0);

  /* زمین و سکوها */
  for (const s of LV.solids) {
    const g1 = ctx.createLinearGradient(0, s.y, 0, s.y + (s.kind === 'plat' ? s.h : 70));
    if (s.kind === 'plat') { g1.addColorStop(0, '#6a6258'); g1.addColorStop(1, '#4a443c'); }
    else { g1.addColorStop(0, '#54493e'); g1.addColorStop(1, '#2e2820'); }
    ctx.fillStyle = g1;
    ctx.fillRect(s.x, s.y, s.w, s.kind === 'plat' ? s.h : H - s.y + 20);
    /* لبهٔ روشنِ بالا + ترک */
    ctx.fillStyle = 'rgba(255,205,150,0.28)';
    ctx.fillRect(s.x, s.y, s.w, 3);
    ctx.fillStyle = 'rgba(20,16,12,0.5)';
    for (let tx = s.x + 24; tx < s.x + s.w - 10; tx += 90) {
      ctx.fillRect(tx, s.y + 4, 2, 10 + ((tx * 7) % 14));
    }
    /* میلگرد از لبه‌ها */
    if (s.kind === 'plat') {
      ctx.strokeStyle = 'rgba(120,90,60,0.8)'; ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(s.x + 3, s.y + 4); ctx.lineTo(s.x - 6, s.y + 16);
      ctx.moveTo(s.x + s.w - 3, s.y + 4); ctx.lineTo(s.x + s.w + 7, s.y + 18);
      ctx.stroke();
    }
  }

  /* پیش‌سازی‌ها (ماشین/سنگ/نرده/طاق/تابلو) */
  for (const pr of LV.props) drawPlatProp(pr);

  /* چک‌پوینت */
  drawPlatCheckpoint(LV.cp, PLAT30.cpOn, t);

  /* خروجی پایان مرحله */
  drawPlatExit(LV.exitX, PLAT30.level, t);

  /* زامبی‌ها */
  for (const z of PLAT30.zs) drawPlatZombie(z, t);

  /* گلوله‌ها */
  ctx.fillStyle = '#ffe9a8';
  for (const b of PLAT30.bullets) {
    ctx.fillRect(b.x - 7, b.y - 1.6, 14, 3.2);
    ctx.fillStyle = 'rgba(255,180,80,0.5)';
    ctx.fillRect(b.x - 13, b.y - 1, 6, 2);
    ctx.fillStyle = '#ffe9a8';
  }

  /* بازیکن — آرش */
  drawPlatPlayer(p, t);

  /* ذرات */
  drawParticles();

  ctx.restore();   // دوربین

  /* --- HUD --- */
  drawPlatHUD();

  /* --- کارت شروع/پایان --- */
  if (PLAT30.card) drawPlatCard();

  /* مرگ */
  if (PLAT30.dying) {
    ctx.fillStyle = `rgba(20,4,4,${clamp(PLAT30.deadT / 1.1, 0, 0.72)})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

function drawPlatProp(pr) {
  const G = GROUND_Y;
  /* زمین زیر پیش‌سازی: نزدیک‌ترین سطح */
  let gy = G;
  for (const s of PLAT30.LVL.solids) {
    if (pr.x >= s.x - 40 && pr.x <= s.x + s.w + 40 && s.y < gy) { if (pr.x >= s.x && pr.x <= s.x + s.w) gy = s.y; }
  }
  ctx.save();
  if (pr.kind === 'car') {
    const cols = ['#4a3a52', '#3a4a5a', '#5a4a3a'];
    const c = cols[pr.v || 0];
    ctx.fillStyle = c;
    rr(pr.x - 34, gy - 30, 68, 16, 5); ctx.fill();          // بدنه
    rr(pr.x - 16, gy - 44, 34, 15, 5); ctx.fill();          // کابین
    ctx.fillStyle = 'rgba(180,220,240,0.35)';
    ctx.fillRect(pr.x - 12, gy - 41, 26, 9);                // شیشه
    ctx.fillStyle = '#1a1a20';
    circle2r(pr.x - 20, gy - 12, 8); circle2r(pr.x + 20, gy - 12, 8);
    ctx.fillStyle = 'rgba(255,190,120,0.25)';
    circle(pr.x + 32, gy - 22, 2);
  } else if (pr.kind === 'rock') {
    ctx.fillStyle = '#4c453e';
    ctx.beginPath();
    ctx.moveTo(pr.x - 22, gy);
    ctx.lineTo(pr.x - 12, gy - 20);
    ctx.lineTo(pr.x + 4, gy - 26);
    ctx.lineTo(pr.x + 20, gy - 12);
    ctx.lineTo(pr.x + 24, gy);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,210,160,0.22)';
    ctx.beginPath();
    ctx.moveTo(pr.x - 12, gy - 20); ctx.lineTo(pr.x + 4, gy - 26); ctx.lineTo(pr.x + 2, gy - 18);
    ctx.closePath(); ctx.fill();
  } else if (pr.kind === 'rail') {
    ctx.strokeStyle = '#5a5148'; ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(pr.x - 60, gy - 34); ctx.lineTo(pr.x + 60, gy - 34);
    ctx.moveTo(pr.x - 52, gy - 34); ctx.lineTo(pr.x - 52, gy);
    ctx.moveTo(pr.x + 52, gy - 34); ctx.lineTo(pr.x + 52, gy);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,205,150,0.25)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(pr.x - 60, gy - 34); ctx.lineTo(pr.x + 60, gy - 34); ctx.stroke();
  } else if (pr.kind === 'arch') {
    ctx.fillStyle = '#463e36';
    ctx.fillRect(pr.x - 46, gy - 88, 16, 88);
    ctx.fillRect(pr.x + 30, gy - 88, 16, 88);
    ctx.beginPath();
    ctx.moveTo(pr.x - 46, gy - 88);
    ctx.quadraticCurveTo(pr.x, gy - 126, pr.x + 46, gy - 88);
    ctx.lineTo(pr.x + 46, gy - 76);
    ctx.quadraticCurveTo(pr.x, gy - 110, pr.x - 46, gy - 76);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(20,14,10,0.5)';
    ctx.fillRect(pr.x - 6, gy - 30, 4, 30);
  } else if (pr.kind === 'sign') {
    ctx.strokeStyle = '#5a5148'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(pr.x, gy); ctx.lineTo(pr.x, gy - 64); ctx.stroke();
    ctx.fillStyle = '#3a5a6a';
    rr(pr.x - 30, gy - 84, 60, 24, 3); ctx.fill();
    ctx.fillStyle = 'rgba(230,240,250,0.85)';
    ctx.font = 'bold 11px Vazirmatn, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('شمال ↑', pr.x, gy - 68);
  }
  ctx.restore();
}
function circle2r(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }

function drawPlatCheckpoint(x, on, t) {
  let gy = GROUND_Y;
  for (const s of PLAT30.LVL.solids) {
    if (x >= s.x && x <= s.x + s.w) { gy = Math.min(gy, s.y); break; }
  }
  ctx.save();
  /* میله */
  ctx.strokeStyle = '#6a6055'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x, gy - 62); ctx.stroke();
  /* فانوس */
  const glow = on ? 0.65 + 0.35 * Math.sin(t * 5) : 0.18;
  const g = ctx.createRadialGradient(x, gy - 46, 2, x, gy - 46, 42);
  g.addColorStop(0, `rgba(255,196,110,${glow})`);
  g.addColorStop(1, 'rgba(255,196,110,0)');
  ctx.fillStyle = g; circle(x, gy - 46, 42);
  ctx.fillStyle = on ? '#ffca6e' : '#7a6a4e';
  rr(x - 5, gy - 52, 10, 13, 2); ctx.fill();
  /* پرچم */
  ctx.fillStyle = on ? '#d8453a' : '#7a5a52';
  ctx.beginPath();
  ctx.moveTo(x + 2, gy - 60);
  ctx.lineTo(x + 26 + Math.sin(t * 4) * 3, gy - 54);
  ctx.lineTo(x + 2, gy - 46);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawPlatExit(x, level, t) {
  let gy = GROUND_Y;
  for (const s of PLAT30.LVL.solids) {
    if (x >= s.x && x <= s.x + s.w) { gy = Math.min(gy, s.y); break; }
  }
  ctx.save();
  if (level === 3) {
    /* ایستگاه شمالی — سیلوئت ساختمان علمی */
    ctx.fillStyle = '#3a3630';
    ctx.fillRect(x - 90, gy - 110, 180, 110);
    ctx.fillStyle = '#2c2a26';
    ctx.fillRect(x - 104, gy - 92, 22, 92);
    ctx.fillRect(x + 82, gy - 92, 22, 92);
    /* آنتن + چراغ چشمک‌زن */
    ctx.strokeStyle = '#5a544c'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(x + 40, gy - 110); ctx.lineTo(x + 40, gy - 168); ctx.stroke();
    const bl = Math.sin(t * 3.4) > 0.25 ? 0.95 : 0.2;
    ctx.fillStyle = `rgba(255,70,60,${bl})`;
    circle(x + 40, gy - 170, 3);
    /* نور سرد آزمایشگاهی از در */
    const dg = ctx.createLinearGradient(x - 20, gy - 52, x + 20, gy);
    dg.addColorStop(0, 'rgba(180,220,255,0.5)');
    dg.addColorStop(1, 'rgba(180,220,255,0.05)');
    ctx.fillStyle = dg;
    ctx.fillRect(x - 20, gy - 52, 40, 52);
    ctx.fillStyle = 'rgba(180,220,255,0.75)';
    ctx.fillRect(x - 20, gy - 52, 40, 3);
  } else {
    /* دروازهٔ مرحله */
    ctx.fillStyle = 'rgba(30,26,22,0.9)';
    rr(x - 34, gy - 76, 68, 76, 6); ctx.fill();
    const g = ctx.createRadialGradient(x, gy - 30, 4, x, gy - 30, 60);
    g.addColorStop(0, 'rgba(255,206,120,0.5)');
    g.addColorStop(1, 'rgba(255,206,120,0)');
    ctx.fillStyle = g; circle(x, gy - 30, 60);
    ctx.fillStyle = `rgba(255,214,130,${0.55 + 0.3 * Math.sin(t * 3)})`;
    ctx.fillRect(x - 22, gy - 54, 44, 4);
    ctx.font = 'bold 13px Vazirmatn, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,224,160,0.95)';
    ctx.fillText(level === 1 ? 'ادامهٔ مسیر ←' : 'پایان پل ←', x, gy - 70);
  }
  ctx.restore();
}

function drawPlatZombie(z, t) {
  if (z.dead && z.deadT > 2.4) return;
  ctx.save();
  const x = z.x, y = z.y;
  const sc = z.ty === 't' ? 1.32 : z.ty === 'f' ? 0.92 : 1.04;
  const C = z.ty === 't' ? 'rgba(52,38,36,0.96)' : z.ty === 'f' ? 'rgba(30,26,40,0.94)' : 'rgba(22,20,30,0.94)';
  if (z.dead) {
    ctx.globalAlpha = clamp(1 - (z.deadT - 1.4) / 1, 0, 1);
    ctx.translate(x, y);
    ctx.rotate(-Math.PI / 2 * clamp(z.deadT / 0.5, 0, 1));
    ctx.translate(-x, -y);
  }
  ctx.translate(x, y);
  ctx.scale(sc, sc);
  /* سایه */
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(0, 1, 12, 3, 0, 0, Math.PI * 2); ctx.fill();
  /* پاها */
  ctx.strokeStyle = C; ctx.lineWidth = 4.6; ctx.lineCap = 'round';
  const st = Math.sin(z.walk);
  ctx.beginPath();
  ctx.moveTo(-1, -13); ctx.lineTo(-2 + st * 5, -1);
  ctx.moveTo(2, -13); ctx.lineTo(3 - st * 5, -1);
  ctx.stroke();
  /* بدن خمیده */
  ctx.fillStyle = C;
  ctx.beginPath();
  ctx.moveTo(-7, -13);
  ctx.quadraticCurveTo(-9.5, -21, -5, -26);
  ctx.quadraticCurveTo(-1, -30, 3.5, -28);
  ctx.quadraticCurveTo(8, -26, 7.5, -20);
  ctx.quadraticCurveTo(7, -15, 4, -13);
  ctx.closePath(); ctx.fill();
  /* دست‌ها به سمت بازیکن */
  ctx.strokeStyle = C; ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(2, -25); ctx.quadraticCurveTo(9, -21, 11, -16);
  ctx.moveTo(-1, -26); ctx.quadraticCurveTo(-8, -22, -9, -17);
  ctx.stroke();
  /* سر */
  ctx.save();
  ctx.translate(4.6, -30.6); ctx.rotate(0.3);
  ctx.fillStyle = C;
  ctx.beginPath();
  ctx.moveTo(-4, 2.6); ctx.quadraticCurveTo(-4.6, -2, -1.2, -4);
  ctx.quadraticCurveTo(2.4, -5.6, 4.6, -3);
  ctx.quadraticCurveTo(6, -0.6, 4.8, 2);
  ctx.quadraticCurveTo(3, 4, 1, 3.8);
  ctx.quadraticCurveTo(-1.8, 4.6, -4, 2.6);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(110,20,16,0.6)';
  ctx.beginPath(); ctx.ellipse(2, 2.2, 2.2, 1.5, 0.2, 0, Math.PI * 2); ctx.fill();
  const er = 0.55 + 0.45 * Math.abs(Math.sin(t * 2.4 + z.x));
  ctx.shadowColor = 'rgba(255,52,36,0.9)'; ctx.shadowBlur = 6 * er;
  ctx.fillStyle = `rgba(255,84,56,${Math.min(1, er + 0.25)})`;
  circle(0.2, -1.4, 1.4); circle(3.4, -1, 1.3);
  ctx.shadowBlur = 0;
  ctx.restore();
  /* نشان جان تانک */
  if (z.ty === 't' && !z.dead) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(-9, -40, 18, 3.4);
    ctx.fillStyle = '#c8483c';
    ctx.fillRect(-9, -40, 18 * clamp(z.hp / 6, 0, 1), 3.4);
  }
  ctx.restore();
}

function drawPlatPlayer(p, t) {
  ctx.save();
  /* چشمکِ آسیب */
  if (p.inv > 0 && Math.floor(p.inv * 14) % 2 === 0) ctx.globalAlpha = 0.35;
  const dy = p.onG ? 0 : 0;
  ctx.translate(p.x, p.y + dy);
  /* سایه */
  if (p.onG) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(0, 1, 13, 3.2, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.scale(p.face, 1);
  /* پاهای دوندگان */
  const run = p.onG ? Math.sin(p.walk) : 0.6;
  ctx.strokeStyle = '#3d4a63'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-1, -14); ctx.lineTo(-3 + run * 8, -1);
  ctx.moveTo(2, -14); ctx.lineTo(4 - run * 8, -1);
  ctx.stroke();
  /* بدن — کاپشن */
  const bg = ctx.createLinearGradient(-8, -30, 8, -12);
  bg.addColorStop(0, '#4a5c74'); bg.addColorStop(1, '#37455c');
  ctx.fillStyle = bg;
  rr(-8, -30, 15, 17, 5); ctx.fill();
  /* کوله‌پشتی */
  ctx.fillStyle = '#6a5636';
  rr(-12, -29, 6, 13, 3); ctx.fill();
  /* سر + مو */
  ctx.fillStyle = '#f0c49a';
  circle(2, -35, 5.6);
  ctx.fillStyle = '#3a2c20';
  ctx.beginPath();
  ctx.arc(2, -36.5, 5.6, Math.PI, Math.PI * 1.95);
  ctx.fill();
  ctx.fillRect(-3.5, -37, 5, 2.6);
  /* تفنگ — به سمت جلو */
  ctx.strokeStyle = '#23262e'; ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, -22); ctx.lineTo(17, -23.5);
  ctx.stroke();
  ctx.strokeStyle = '#5a4a30'; ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.moveTo(-1, -20); ctx.lineTo(3, -18);
  ctx.stroke();
  /* شعلهٔ دهانه */
  if (p.muzzle > 0) {
    const mg = ctx.createRadialGradient(20, -23.5, 1, 20, -23.5, 16);
    mg.addColorStop(0, 'rgba(255,230,150,0.95)');
    mg.addColorStop(1, 'rgba(255,180,80,0)');
    ctx.fillStyle = mg; circle(20, -23.5, 16);
    ctx.fillStyle = '#fff2c0';
    ctx.beginPath();
    ctx.moveTo(17, -23.5); ctx.lineTo(26, -25.5); ctx.lineTo(26, -21.5);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function drawPlatHUD() {
  const p = PLAT30.pl, LV = PLAT30.LVL;
  ctx.save();
  ctx.textAlign = 'left';
  /* قلب‌ها */
  for (let i = 0; i < 3; i++) {
    const x = 16 + i * 26, y = 18;
    const on = i < p.hp;
    ctx.fillStyle = on ? `rgba(226,74,64,${0.8 + 0.2 * Math.sin(PLAT30.t * 6 + i)})` : 'rgba(50,44,54,0.8)';
    ctx.save();
    ctx.translate(x + 9, y + 8);
    ctx.beginPath();
    ctx.moveTo(0, 4.5);
    ctx.bezierCurveTo(-9.5, -3, -5, -10.5, 0, -5);
    ctx.bezierCurveTo(5, -10.5, 9.5, -3, 0, 4.5);
    ctx.fill();
    ctx.restore();
  }
  /* چیپ مرحله */
  ctx.font = 'bold 13px Vazirmatn, sans-serif';
  ctx.fillStyle = 'rgba(12,16,26,0.66)';
  rr(W / 2 - 92, 8, 184, 26, 13); ctx.fill();
  ctx.fillStyle = '#e8eefc';
  ctx.textAlign = 'center';
  ctx.fillText('سفر — ' + LV.name, W / 2, 26);
  /* نوار پیشرفت */
  const bw = Math.min(360, W * 0.4);
  const bx = W / 2 - bw / 2, by = 44;
  ctx.fillStyle = 'rgba(12,16,26,0.6)';
  rr(bx, by, bw, 7, 4); ctx.fill();
  const prog = clamp(p.x / LV.exitX, 0, 1);
  ctx.fillStyle = '#e8b23c';
  rr(bx + bw - bw * prog, by, bw * prog, 7, 4); ctx.fill();
  /* نشان چک‌پوینت */
  if (PLAT30.cpOn) {
    const cx = bx + bw - bw * clamp(LV.cp / LV.exitX, 0, 1);
    ctx.fillStyle = '#d8453a';
    ctx.fillRect(cx - 1.5, by - 3, 3, 13);
  }
  ctx.restore();
}

function drawPlatCard() {
  const k = PLAT30.card, tt = PLAT30.cardT;
  const a = clamp(Math.min(tt * 2.4, (2.2 - tt) * 2.4), 0, 1) * (k === 'intro' ? 0.92 : 0.88);
  ctx.save();
  ctx.fillStyle = `rgba(8,10,18,${a})`;
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  const LV = PLAT30.LVL;
  if (k === 'intro') {
    ctx.fillStyle = '#c8d4ec';
    ctx.font = 'bold 15px Vazirmatn, sans-serif';
    ctx.fillText('فصل میانی — سفر', W / 2, H / 2 - 46);
    ctx.fillStyle = '#ffd98a';
    ctx.font = 'bold 27px Vazirmatn, sans-serif';
    ctx.fillText(LV.name, W / 2, H / 2 - 6);
    ctx.fillStyle = '#93a4c8';
    ctx.font = '14px Vazirmatn, sans-serif';
    ctx.fillText(LV.sub + ' — آرش، تنها و پیاده', W / 2, H / 2 + 26);
    ctx.fillStyle = 'rgba(140,155,190,0.8)';
    ctx.font = '12.5px Vazirmatn, sans-serif';
    ctx.fillText('◀ ▶ حرکت  ·  پرش  ·  شلیک — چک‌پوینت وسط راه', W / 2, H / 2 + 56);
  } else {
    ctx.fillStyle = '#a8f0c0';
    ctx.font = 'bold 24px Vazirmatn, sans-serif';
    ctx.fillText('مرحله تمام شد!', W / 2, H / 2 - 12);
    ctx.fillStyle = '#c8d4ec';
    ctx.font = '14px Vazirmatn, sans-serif';
    ctx.fillText(PLAT30.level >= 3 ? 'ایستگاه شمالی در دید است...' : 'مرحلهٔ بعد: ' + PLAT30.all[PLAT30.level].name, W / 2, H / 2 + 22);
  }
  ctx.restore();
}
/* ==================================================================
   سه طبقه تا مرگ — نسخهٔ ۳۰٫۰ — زنجیرهٔ پایان جدید (طبق پرامپت بخش ۲)
   ==================================================================
   جریان: پیروزی شب ۳۶ → «تموم شد... رسیدیم.»
     arrive  : دروازهٔ پناهگاه + نگهبان «اسلحه‌ها رو تحویل بدید»
     welcome : خوش‌آمد دکتر مریم
     siren   : آژیر نیمه‌شب — «این آژیر ما نیست... این پروتکل داخلیه!»
     control : اتاق کنترل — پروندهٔ «پروژهٔ Z» زیر نور
     escape  : فرار از پناهگاهِ در حال فروپاشی
     fire    : توقف‌گاه امن — کنار آتش + رادیوی دکتر سارا
     part    : تصمیم و جدایی — «می‌رسم. قول می‌دم.»
     [پلتفرمر ۳ مرحله — v4_platformer.js]
     station : ایستگاه شمالی — اعتراف دکتر سارا
     driveoff: ماشین در جاده + نقشهٔ داشبورد → «این داستان ادامه دارد...»
   ================================================================== */

const E30 = {
  phase: '', t: 0, dlgStarted: false, dlgDone: false,
  fade: 0, sub: '', walkK: 0, sirenPulse: 0,
};

const E30_DLG = {
  arrive: [
    { who: 'n', v: 'c4n1', text: 'پس از روزها مبارزه، به پناهگاهی رسیدند با نشانه‌های زندگی.' },
    { who: 'g', v: 'sa1g', text: 'اسلحه‌ها رو تحویل بدید. اینجا امنه.' },
  ],
  welcome: [
    { who: 'p', v: 'sa2p', text: 'باورم نمی‌شه... واقعاً رسیدیم.' },
    { who: 'm', v: 'sa3m', text: 'خوش اومدید به پناهگاه. من دکتر مریمم.' },
  ],
  siren: [
    { who: 'a', v: 'si1a', text: 'این دیگه چیه؟!' },
    { who: 'm', v: 'si2m', text: 'این آژیر ما نیست... این پروتکل داخلیه!' },
    { who: 'p', v: 'si3p', text: 'دارن میان تو!' },
  ],
  control: [
    { who: 'p', v: 'zf1p', text: 'پروژهٔ Z... این چیه؟' },
    { who: 'm', v: 'zf2m', text: 'فقط یه اسم رمزه... و یه جمله: پایان دنیا.' },
    { who: 'a', v: 'zf3a', text: 'یعنی چی؟ کی اینو نوشته؟' },
    { who: 'm', v: 'zf4m', text: 'نمی‌دونم. اینجا جاش نیست — برش دار، باید بریم!' },
    { who: 'a', v: 'zf5a', text: 'فرار! الان!' },
  ],
  fire: [
    { who: 'a', v: 'ss1a', text: 'خب... اون کاغذ چی بود؟ پایان دنیا یعنی چی؟' },
    { who: 'p', v: 'ss2p', text: 'فقط همین دو خطه. نه امضا، نه تاریخ... ولی ببین، یه علامت هم خورده — سمت شمال.' },
    { who: 'm', v: 'ss3m', text: 'Z... توی هیچ مقالهٔ پزشکی همچین چیزی ندیدم. این یه چیز دیگه‌ست.' },
    { who: 'a', v: 'ss4a', text: 'یعنی یکی عمداً این بلا رو سر دنیا آورده؟' },
    { who: 'm', v: 'ss5m', text: 'نمی‌دونم. ولی اگه عمدی باشه... پس پناهگاه...' },
    { who: 'p', v: 'ss6p', text: 'چی؟ بگو.' },
    { who: 'm', v: 'ss7m', text: 'هیچی. فعلاً فقط حدسه. زود قضاوت نکنیم بهتره.' },
    { who: 'k', v: 'ss8k', text: 'اگه کسی این فرکانس رو می‌شنوه... من توی ایستگاه شمالی‌ام... چیزی پیدا کردم که باید ببینید... عجله کنید.' },
    { who: 'p', v: 'ss9p', text: 'ایستگاه شمالی... همون‌جایی که روی کاغذ علامت خورده.' },
    { who: 'a', v: 'ss10a', text: 'پس راه همونه.' },
  ],
  part: [
    { who: 'a', v: 'sp1a', text: 'اعضای پناهگاه با دکتر مریم می‌رن یه جای امن. ما دوتا می‌ریم سمت ایستگاه.' },
    { who: 'm', v: 'sp2m', text: 'مراقب باشید... و اگه فهمیدید Z چیه... بهم بگید.' },
    { who: 'a', v: 'sp3a', text: 'جاده بسته‌ست. من با ماشین از راه فرعی می‌رم، تو پیاده از دل خرابه‌ها. هر کی زودتر رسید، منتظر اون یکی می‌مونه.' },
    { who: 'p', v: 'sp4p', text: 'اگه نرسیدی چی؟' },
    { who: 'a', v: 'sp5a', text: 'می‌رسم. قول می‌دم.' },
  ],
  station: [
    { who: 's', v: 'st1s', text: 'اومدی... پس فرکانس هنوز کار می‌کنه.' },
    { who: 'p', v: 'st2p', text: 'تو کی هستی؟ Z چیه؟' },
    { who: 's', v: 'st3s', text: 'من یکی از اونایی‌ام که Z رو ساختم. و قبل از اینکه بپرسی چرا... چون فکر می‌کردیم دنیا باید از صفر شروع بشه.' },
    { who: 's', v: 'st4s', text: 'Z قرار بود سلاح کنترل‌شده باشه. یه کلید داشت... ولی کلید گم شد. یا شاید هیچ‌وقت نبود.' },
    { who: 's', v: 'st5s', text: 'پناهگاه‌ها تله بودن. می‌خواستیم ببینیم Z توی مقیاس بزرگ چطور رفتار می‌کنه. شما فقط... داده بودید.' },
    { who: 'p', v: 'st6p', text: 'پس الان چی؟' },
    { who: 's', v: 'st7s', text: 'فاز دوم شروع شده. و من می‌دونم کجاست. اگه می‌خوای جلوش رو بگیری، باید باهام بیای.' },
    { who: 'a', v: 'st8a', text: 'سوار شید! زود!' },
    { who: 's', v: 'st9s', text: 'اونی که می‌ریم، دیگه برگشتی نیست.' },
    { who: 'p', v: 'st10p', text: 'برگشتی از اول هم نبود.' },
  ],
};

function startEnding30() {
  E30.phase = 'arrive';
  E30.t = 0;
  E30.dlgStarted = false; E30.dlgDone = false;
  E30.fade = 0; E30.walkK = 0;
  PLAT30.on = false;
  state.mode = 'sheltercine';               /* (۴۰٫۰) مسیریابی از کانال sheltercine */
  state.mouse.down = false;
  state.placing = null;
  state.slowmo = 0;
  state.shake = 0; state.flash = 0;
  hideOverlays();
  hideDayPanel(); hidePeddlerPanel(); hideAnnounce(); hideChapterCard();
  try { $('lockBadge').classList.add('hidden'); } catch (e) {}
  try { $('bossBar').style.display = 'none'; bossBarVisible = false; } catch (e) {}
  try { setBuildPanel(true, true); } catch (e) {}
  $('wrap').classList.add('cine-mode');
  $('skipCs').classList.remove('hidden');
  try { SFX.dusk(); } catch (e) {}
  try { MUSIC.set('menu'); } catch (e) {}
}

/* ورود دوباره از پلتفرمر — سینمایی ایستگاه شمالی */
function startStationCine30() {
  E30.phase = 'station';
  E30.t = 0;
  E30.dlgStarted = false; E30.dlgDone = false;
  E30.fade = 0;
  PLAT30.on = false;
  state.mode = 'sheltercine';
  state.mouse.down = false;
  hideOverlays();
  hideDayPanel(); hidePeddlerPanel(); hideAnnounce();
  try { setBuildPanel(true, true); } catch (e) {}
  platPadShow(false);
  $('wrap').classList.add('cine-mode');
  $('skipCs').classList.remove('hidden');
  try { SFX.dusk(); } catch (e) {}
}

function e30Next(ph) {
  E30.phase = ph;
  E30.t = 0;
  E30.dlgStarted = false; E30.dlgDone = false;
  E30.fade = 0;
  if (ph === 'siren') { try { SFX.alarm(); } catch (e) {} state.shake = 9; }
  if (ph === 'escape') { try { SFX.alarm(); } catch (e) {} state.shake = 12; try { SFX.csRumble(); } catch (e) {} }
  if (ph === 'control') { state.shake = 4; }
  if (ph === 'plati') {
    /* کارت فصل میانی → پلتفرمر */
    E30.dlgStarted = true; E30.dlgDone = true;
  }
}

/* رد کردن: پرش به پلتفرمر (یا اگر در ایستگاه هستیم → پایان) */
function skipEnding30() {
  SFX.click();
  try { VOICE.stop(); } catch (e) {}
  try { DLG.skip(); } catch (e) {}
  if (E30.phase === 'station' || E30.phase === 'driveoff') {
    e30Finish();
    return;
  }
  E30.phase = '';
  $('wrap').classList.remove('cine-mode');
  $('skipCs').classList.add('hidden');
  startPlatformer(1);
}

/* پایان نهایی: پاک‌کردن سیو + صفحهٔ «این داستان ادامه دارد...» */
function e30Finish() {
  E30.phase = '';
  try { wipeSave(); } catch (e) {}
  $('wrap').classList.remove('cine-mode');
  $('skipCs').classList.add('hidden');
  startTbcScreen();
}

/* ---------------------- به‌روزرسانی ---------------------- */
function updateEnding30(dt) {
  if (state.mode !== 'sheltercine' || !E30.phase) return;
  E30.t += dt;
  DLG.update(dt);
  state.shake = Math.max(0, state.shake - dt * 18);
  state.flash = Math.max(0, state.flash - dt * 2.2);
  updateParticles(dt);
  updateTexts(dt);
  const ph = E30.phase;

  const startDlg = () => {
    if (!E30.dlgStarted && E30.t > 0.8) {
      E30.dlgStarted = true;
      const dl = E30_DLG[ph === 'plati' ? 'part' : ph] || [];
      DLG.start(dl, () => { E30.dlgDone = true; });
    }
  };

  if (ph === 'arrive') {
    E30.walkK = clamp(E30.t / 9, 0, 1);
    startDlg();
    if ((E30.dlgDone || E30.t > 30) && E30.t > 4) e30Next('welcome');
  } else if (ph === 'welcome') {
    startDlg();
    if ((E30.dlgDone || E30.t > 24) && E30.t > 3) e30Next('siren');
  } else if (ph === 'siren') {
    state.shake = Math.max(state.shake, 2.2);
    E30.sirenPulse += dt;
    if (Math.sin(E30.sirenPulse * 4.4) > 0.92 && !E30._al2) { E30._al2 = true; try { SFX.alarm(); } catch (e) {} }
    if (Math.sin(E30.sirenPulse * 4.4) < -0.92) E30._al2 = false;
    startDlg();
    if ((E30.dlgDone || E30.t > 30) && E30.t > 4) e30Next('control');
  } else if (ph === 'control') {
    state.shake = Math.max(state.shake, 1.4);
    startDlg();
    if ((E30.dlgDone || E30.t > 40) && E30.t > 4) e30Next('escape');
  } else if (ph === 'escape') {
    state.shake = Math.max(state.shake, 5);
    if (Math.random() < dt * 9) {
      spawnParticles(rand(W * 0.2, W * 0.8), -8, 2, 'rgba(120,110,100,0.7)',
        { speed: 60, life: 1.2, size: 3, grav: 260 });
    }
    E30.fade = clamp((E30.t - 1.2) / 1.8, 0, 1);
    if (E30.t > 3.4) e30Next('fire');
  } else if (ph === 'fire') {
    /* برقِ آتش: ذره‌های جرقه */
    if (Math.random() < dt * 22) {
      spawnParticles(W * 0.5 + rand(-16, 16), GROUND_Y - 46, 1, 'rgba(255,170,80,0.9)',
        { speed: 24, life: 1.4, size: 2, grav: -46 });
    }
    startDlg();
    if ((E30.dlgDone || E30.t > 70) && E30.t > 4) e30Next('part');
  } else if (ph === 'part') {
    startDlg();
    if ((E30.dlgDone || E30.t > 40) && E30.t > 4) e30Next('plati');
  } else if (ph === 'plati') {
    /* کارت ۲.۶ ثانیه‌ای → شروع پلتفرمر */
    if (E30.t > 2.6) {
      E30.phase = '';
      $('wrap').classList.remove('cine-mode');
      $('skipCs').classList.add('hidden');
      startPlatformer(1);
    }
  } else if (ph === 'station') {
    startDlg();
    if ((E30.dlgDone || E30.t > 70) && E30.t > 4) e30Next('driveoff');
  } else if (ph === 'driveoff') {
    E30.fade = clamp((E30.t - 3.6) / 2.2, 0, 1);
    if (E30.t > 6.2) e30Finish();
  }
}

/* ---------------------- رندر ---------------------- */
function renderEnding30() {
  if (state.mode !== 'sheltercine' || !E30.phase) return;
  const t = E30.t, ph = E30.phase;
  ctx.save();
  if (state.shake > 0.5) ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);

  if (ph === 'arrive' || ph === 'welcome') drawE30Shelter(t, ph);
  else if (ph === 'siren') drawE30Siren(t);
  else if (ph === 'control') drawE30Control(t);
  else if (ph === 'escape') drawE30Escape(t);
  else if (ph === 'fire') drawE30Fire(t);
  else if (ph === 'part') drawE30Part(t);
  else if (ph === 'plati') drawE30Plati(t);
  else if (ph === 'station') drawE30Station(t);
  else if (ph === 'driveoff') drawE30Driveoff(t);

  drawShootingStar();
  drawParticles();
  drawTexts();

  /* محوِ کلی */
  if (E30.fade > 0) {
    ctx.fillStyle = `rgba(4,5,10,${E30.fade.toFixed(2)})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

/* انسانِ ساده — سایه‌وار (E30) */
function e30Figure(x, y, opt) {
  const o = opt || {};
  const C = o.c || 'rgba(12,14,22,0.95)';
  const s = o.s || 1;
  const ph = o.ph || 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(o.face < 0 ? -s : s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.32)';
  ctx.beginPath(); ctx.ellipse(0, 1, 12, 3, 0, 0, Math.PI * 2); ctx.fill();
  /* پاها */
  ctx.strokeStyle = C; ctx.lineWidth = 5.4; ctx.lineCap = 'round';
  const st = Math.sin(ph);
  ctx.beginPath();
  ctx.moveTo(-1, -14); ctx.lineTo(-2 + st * 5, -1);
  ctx.moveTo(2, -14); ctx.lineTo(3 - st * 5, -1);
  ctx.stroke();
  /* بدن */
  ctx.fillStyle = C;
  rr(-7.5, -30, 15, 17, 5); ctx.fill();
  /* بازو */
  ctx.strokeStyle = C; ctx.lineWidth = 4.4;
  ctx.beginPath();
  ctx.moveTo(-4, -26); ctx.lineTo(-7 - st * 3, -15);
  ctx.moveTo(4, -26); ctx.lineTo(7 + st * 3, -15);
  ctx.stroke();
  /* سر */
  ctx.fillStyle = C;
  circle(1.6, -34.6, 5.2);
  ctx.restore();
}

/* ---- پناهگاه: دروازهٔ بزرگ + چراغ‌های گرم (پرامپت ۶-۹) ---- */
function drawE30Shelter(t, ph) {
  const welcomed = ph === 'welcome';
  /* آسمان شب */
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, '#070a18');
  sky.addColorStop(0.7, '#0d1228');
  sky.addColorStop(1, '#1a1424');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GROUND_Y + 2);
  /* ستاره‌ها */
  ctx.fillStyle = 'rgba(214,222,255,0.5)';
  for (let i = 0; i < 40; i++) {
    const x = (i * 173.3) % W, y = (i * 97.7) % 240;
    if (Math.sin(t * 1.3 + i) > -0.4) ctx.fillRect(x, y, 1.4, 1.4);
  }
  /* افق کوه */
  ctx.fillStyle = '#0a0d1c';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= W; x += 60) ctx.lineTo(x, GROUND_Y - 40 - Math.sin(x * 0.011) * 30);
  ctx.lineTo(W, GROUND_Y); ctx.closePath(); ctx.fill();
  /* زمین */
  const gr = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  gr.addColorStop(0, '#141826'); gr.addColorStop(1, '#1c1626');
  ctx.fillStyle = gr; ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

  /* دیوار پناهگاه + دروازهٔ بزرگ فلزی (راست) */
  const gx = W * 0.72;
  ctx.fillStyle = '#232838';
  ctx.fillRect(gx - 150, GROUND_Y - 170, 300, 170);
  ctx.fillStyle = '#1c2130';
  ctx.fillRect(gx - 150, GROUND_Y - 170, 300, 12);
  /* برجک‌های نگهبانی */
  ctx.fillStyle = '#1a1f2e';
  ctx.fillRect(gx - 170, GROUND_Y - 210, 26, 210);
  ctx.fillRect(gx + 144, GROUND_Y - 210, 26, 210);
  /* نور گرم پنجره‌ها */
  const winGlow = welcomed ? 0.9 : 0.55 + 0.25 * Math.sin(t * 2);
  for (let i = 0; i < 5; i++) {
    const wx = gx - 120 + i * 52;
    ctx.fillStyle = `rgba(255,196,110,${winGlow * (0.6 + 0.3 * Math.sin(i * 2.4))})`;
    ctx.fillRect(wx, GROUND_Y - 128, 22, 30);
  }
  /* دروازهٔ فلزی */
  ctx.fillStyle = '#333a4e';
  ctx.fillRect(gx - 44, GROUND_Y - 84, 88, 84);
  ctx.strokeStyle = '#4a5470'; ctx.lineWidth = 3;
  ctx.strokeRect(gx - 44, GROUND_Y - 84, 88, 84);
  for (let i = 1; i < 4; i++) {
    ctx.beginPath(); ctx.moveTo(gx - 44 + i * 22, GROUND_Y - 84); ctx.lineTo(gx - 44 + i * 22, GROUND_Y); ctx.stroke();
  }
  /* نور دروازه */
  const dg = ctx.createRadialGradient(gx, GROUND_Y - 30, 6, gx, GROUND_Y - 30, 120);
  dg.addColorStop(0, `rgba(255,190,100,${welcomed ? 0.4 : 0.26})`);
  dg.addColorStop(1, 'rgba(255,190,100,0)');
  ctx.fillStyle = dg; circle(gx, GROUND_Y - 30, 120);

  /* نگهبان کنار دروازه */
  e30Figure(gx + 66, GROUND_Y, { c: 'rgba(16,20,32,0.96)', s: 1.02, ph: Math.sin(t * 1.6) * 0.4 });
  /* هالهٔ چراغ‌قوه نگهبان */
  const gg = ctx.createRadialGradient(gx + 66, GROUND_Y - 40, 3, gx + 66, GROUND_Y - 40, 42);
  gg.addColorStop(0, 'rgba(200,225,255,0.28)');
  gg.addColorStop(1, 'rgba(200,225,255,0)');
  ctx.fillStyle = gg; circle(gx + 66, GROUND_Y - 40, 42);

  /* آدم‌های داخل (بازمانده‌ها) — فقط بعد از خوش‌آمد */
  if (welcomed) {
    for (let i = 0; i < 4; i++) {
      e30Figure(gx - 200 + i * 46, GROUND_Y, { c: 'rgba(20,24,38,0.9)', s: 0.92, ph: Math.sin(t * 1.2 + i * 2) * 0.5 });
    }
    /* دکتر مریم — روپوش روشن */
    e30Figure(gx - 40, GROUND_Y, { c: 'rgba(210,220,236,0.94)', s: 1.0, ph: Math.sin(t * 2.2) * 0.4 });
  }

  /* آرش و ارشان از چپ به سمت دروازه می‌روند */
  const k = welcomed ? 1 : clamp(t / 9, 0, 1);
  const bx = 120 + k * (gx - 300);
  const walkPh = welcomed ? t * 1.2 : t * 6.5;
  e30Figure(bx - 30, GROUND_Y, { c: 'rgba(10,12,20,0.95)', s: 1.05, ph: Math.sin(walkPh) });
  e30Figure(bx, GROUND_Y, { c: 'rgba(26,30,44,0.95)', s: 1.0, ph: Math.sin(walkPh + 2.4) });

  /* نورِ چراغ‌های عمودی */
  for (const lx of [W * 0.2, W * 0.44]) {
    ctx.strokeStyle = '#39405a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(lx, GROUND_Y); ctx.lineTo(lx, GROUND_Y - 96); ctx.stroke();
    const on = 0.5 + 0.3 * Math.sin(t * 9 + lx);
    ctx.fillStyle = `rgba(255,214,150,${on})`;
    circle(lx, GROUND_Y - 98, 3);
    const lg = ctx.createRadialGradient(lx, GROUND_Y - 90, 4, lx, GROUND_Y - 70, 70);
    lg.addColorStop(0, `rgba(255,200,120,${on * 0.3})`);
    lg.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = lg; circle(lx, GROUND_Y - 70, 70);
  }
}

/* ---- آژیر: پوشش قرمز + چراغ‌های اضطراری (پرامپت ۶-۱۰) ---- */
function drawE30Siren(t) {
  drawE30Shelter(t, 'welcome');
  const red = 0.5 + 0.5 * Math.sin(t * 4.4);
  ctx.fillStyle = 'rgba(170,20,10,' + (0.1 + red * 0.11).toFixed(3) + ')';
  ctx.fillRect(0, 0, W, H);
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.78);
  vg.addColorStop(0, 'rgba(120,0,0,0)');
  vg.addColorStop(1, 'rgba(120,0,0,' + (0.26 + red * 0.16).toFixed(3) + ')');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  /* چراغ گردان چشمک‌زن روی برجک */
  const bx = W * 0.72 + 144, by = GROUND_Y - 214;
  ctx.fillStyle = `rgba(255,60,40,${0.6 + red * 0.4})`;
  circle(bx, by, 5);
  const bg2 = ctx.createRadialGradient(bx, by, 3, bx, by, 60);
  bg2.addColorStop(0, `rgba(255,60,40,${0.5 * red})`);
  bg2.addColorStop(1, 'rgba(255,60,40,0)');
  ctx.fillStyle = bg2; circle(bx, by, 60);
  /* دود */
  ctx.fillStyle = 'rgba(60,60,70,0.16)';
  for (let i = 0; i < 3; i++) {
    const sx = W * 0.5 + i * 120 - 130, sw = 60 + i * 24;
    ctx.beginPath(); ctx.ellipse(sx + Math.sin(t + i) * 8, GROUND_Y - 150 - i * 26, sw, 16, 0, 0, Math.PI * 2); ctx.fill();
  }
}

/* ---- اتاق کنترل: میزهای مانیتور + پروندهٔ Z زیر نور (پرامپت ۶-۱۱) ---- */
function drawE30Control(t) {
  /* فضای تیرهٔ سرد */
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#0a0d16');
  sky.addColorStop(1, '#131826');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  const fl = GROUND_Y - 14;
  ctx.fillStyle = '#1a2030';
  ctx.fillRect(0, fl, W, H - fl);

  /* نور سرد از پنجره‌های بالای دیوار */
  for (let i = 0; i < 3; i++) {
    const wx = W * 0.18 + i * W * 0.3;
    ctx.fillStyle = 'rgba(150,190,240,0.10)';
    ctx.beginPath();
    ctx.moveTo(wx - 26, 60); ctx.lineTo(wx + 26, 60);
    ctx.lineTo(wx + 62, fl); ctx.lineTo(wx - 62, fl);
    ctx.closePath(); ctx.fill();
  }

  /* ردیف میزهای مانیتور (عمق دو ردیف) */
  const desk = (x, y, s, glow) => {
    ctx.fillStyle = '#242c3e';
    ctx.fillRect(x - 44 * s, y - 12 * s, 88 * s, 12 * s);
    ctx.fillRect(x - 40 * s, y, 6 * s, 14 * s);
    ctx.fillRect(x + 34 * s, y, 6 * s, 14 * s);
    /* مانیتورها */
    for (const dx of [-26, 6]) {
      ctx.fillStyle = '#11141f';
      ctx.fillRect(x + (dx - 12) * s, y - 34 * s, 26 * s, 20 * s);
      const on = 0.4 + 0.5 * Math.abs(Math.sin(t * 3 + dx + x));
      ctx.fillStyle = `rgba(120,190,235,${on * glow})`;
      ctx.fillRect(x + (dx - 10) * s, y - 32 * s, 22 * s, 16 * s);
      /* متن/داده روی مانیتور */
      ctx.fillStyle = `rgba(200,235,255,${on * glow * 0.7})`;
      for (let r = 0; r < 3; r++) ctx.fillRect(x + (dx - 8) * s, y - 30 * s + r * 5 * s, (8 + ((x + r) % 3) * 5) * s, 1.6 * s);
    }
    /* کاغذهای پخش */
    ctx.fillStyle = 'rgba(220,225,235,0.5)';
    ctx.fillRect(x - 36 * s, y - 8 * s, 10 * s, 6 * s);
    ctx.fillRect(x + 22 * s, y - 9 * s, 12 * s, 7 * s);
  };
  desk(W * 0.2, fl - 70, 0.8, 0.5);
  desk(W * 0.44, fl - 66, 0.8, 0.5);
  desk(W * 0.86, fl - 72, 0.8, 0.5);

  /* میز کانونی: پروندهٔ «پروژهٔ Z» زیر نورِ مشخص */
  const fx = W * 0.62, fy = fl - 26;
  ctx.fillStyle = '#2a3346';
  ctx.fillRect(fx - 60, fy - 12, 120, 12);
  ctx.fillRect(fx - 54, fy, 8, 26);
  ctx.fillRect(fx + 46, fy, 8, 26);
  /* مخروط نور از بالا */
  const cone = ctx.createLinearGradient(0, 40, 0, fy);
  cone.addColorStop(0, 'rgba(255,226,150,0.30)');
  cone.addColorStop(1, 'rgba(255,226,150,0.02)');
  ctx.fillStyle = cone;
  ctx.beginPath();
  ctx.moveTo(fx - 14, 30); ctx.lineTo(fx + 14, 30);
  ctx.lineTo(fx + 58, fy - 8); ctx.lineTo(fx - 58, fy - 8);
  ctx.closePath(); ctx.fill();
  /* پروندهٔ کاغذی */
  const fileGlow = 0.75 + 0.25 * Math.sin(t * 5);
  ctx.fillStyle = `rgba(245,228,180,${fileGlow})`;
  rr(fx - 22, fy - 22, 44, 12, 2); ctx.fill();
  ctx.strokeStyle = 'rgba(120,90,40,0.8)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(fx - 22, fy - 18); ctx.lineTo(fx + 22, fy - 18); ctx.stroke();
  /* حرف Z بزرگ روی پرونده */
  ctx.fillStyle = 'rgba(90,40,30,0.95)';
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Z', fx, fy - 12.5);
  /* هالهٔ پرونده */
  const fg = ctx.createRadialGradient(fx, fy - 16, 4, fx, fy - 16, 66);
  fg.addColorStop(0, `rgba(255,226,150,${0.22 * fileGlow})`);
  fg.addColorStop(1, 'rgba(255,226,150,0)');
  ctx.fillStyle = fg; circle(fx, fy - 16, 66);

  /* آرش نزدیک پرونده (در حال برداشتن) + مریم و ارشان پشت سر */
  const reach = clamp((t - 2) / 3, 0, 1);
  e30Figure(fx - 90 - reach * 20, fl, { c: 'rgba(10,12,20,0.96)', s: 1.02, ph: Math.sin(t * 3) * 0.6 });
  e30Figure(fx - 170, fl, { c: 'rgba(210,220,236,0.9)', s: 0.98, ph: Math.sin(t * 1.5) * 0.3 });
  e30Figure(fx - 210, fl, { c: 'rgba(26,30,44,0.94)', s: 1.0, ph: Math.sin(t * 1.8 + 1) * 0.3 });

  /* ترک سقف + گردوغبار */
  ctx.strokeStyle = 'rgba(10,12,18,0.7)'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W * 0.3, 0);
  ctx.lineTo(W * 0.34, 46); ctx.lineTo(W * 0.31, 92); ctx.lineTo(W * 0.36, 140);
  ctx.stroke();
}

/* ---- فرار: لرزش + قرمز + محو (پرامپت ۶-۱۰) ---- */
function drawE30Escape(t) {
  drawE30Control(t);
  const red = 0.5 + 0.5 * Math.sin(t * 6);
  ctx.fillStyle = 'rgba(170,20,10,' + (0.13 + red * 0.13).toFixed(3) + ')';
  ctx.fillRect(0, 0, W, H);
  /* جرقه */
  if (Math.random() < 0.5) {
    ctx.fillStyle = 'rgba(255,220,140,0.8)';
    ctx.fillRect(rand(W * 0.2, W * 0.8), rand(60, 180), 2, 2);
  }
}

/* ---- توقف‌گاه امن: شب + آتش کوچک (پرامپت ۶-۱۲) ---- */
function drawE30Fire(t) {
  /* آسمان سنگین شب */
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, '#060810');
  sky.addColorStop(0.6, '#0b0e1c');
  sky.addColorStop(1, '#171522');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GROUND_Y + 2);
  ctx.fillStyle = 'rgba(210,218,250,0.4)';
  for (let i = 0; i < 30; i++) {
    const x = (i * 211.7) % W, y = (i * 83.3) % 200;
    if (Math.sin(t * 1.1 + i) > 0) ctx.fillRect(x, y, 1.2, 1.2);
  }
  /* خرابه‌های دور */
  ctx.fillStyle = 'rgba(14,16,26,0.9)';
  for (let i = 0; i < 6; i++) {
    const bx = i * W / 5.4 + 30, bh = 60 + (i * 37) % 70;
    ctx.fillRect(bx, GROUND_Y - bh, 54, bh);
    ctx.beginPath();
    ctx.moveTo(bx, GROUND_Y - bh);
    ctx.lineTo(bx + 20, GROUND_Y - bh - 14);
    ctx.lineTo(bx + 54, GROUND_Y - bh + 4);
    ctx.closePath(); ctx.fill();
  }
  /* زمین */
  const gr = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  gr.addColorStop(0, '#191420'); gr.addColorStop(1, '#100c14');
  ctx.fillStyle = gr; ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

  /* آتش کوچک وسط کادر */
  const fx = W * 0.5, fy = GROUND_Y - 6;
  /* سنگ‌چین */
  ctx.fillStyle = '#2c2824';
  for (let i = -4; i <= 4; i++) circle(fx + i * 9, fy - 2, 5.4 - Math.abs(i) * 0.5);
  /* هالهٔ بزرگ گرم */
  const fl = 0.75 + 0.25 * Math.sin(t * 7.3) * Math.sin(t * 2.1);
  const halo = ctx.createRadialGradient(fx, fy - 22, 8, fx, fy - 22, 240);
  halo.addColorStop(0, `rgba(255,150,60,${0.34 * fl})`);
  halo.addColorStop(0.5, `rgba(255,130,50,${0.13 * fl})`);
  halo.addColorStop(1, 'rgba(255,120,40,0)');
  ctx.fillStyle = halo; circle(fx, fy - 22, 240);
  /* زبانه‌های آتش */
  for (let i = 0; i < 3; i++) {
    const wob = Math.sin(t * (6 + i * 2.4) + i * 2) * 4;
    const hgt = 34 + i * 12 + Math.sin(t * 9 + i) * 7;
    const fg = ctx.createLinearGradient(fx, fy - hgt, fx, fy);
    fg.addColorStop(0, `rgba(255,190,90,0.0)`);
    fg.addColorStop(0.35, `rgba(255,170,70,${0.75 - i * 0.16})`);
    fg.addColorStop(1, `rgba(232,90,40,${0.9 - i * 0.14})`);
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.moveTo(fx - 12 + i * 9 + wob * 0.4, fy - 4);
    ctx.quadraticCurveTo(fx - 16 + i * 10 + wob, fy - hgt * 0.6, fx + i * 7 + wob, fy - hgt);
    ctx.quadraticCurveTo(fx + 16 + i * 9 + wob, fy - hgt * 0.55, fx + 12 + i * 8 + wob * 0.4, fy - 4);
    ctx.closePath(); ctx.fill();
  }
  /* هیزم */
  ctx.strokeStyle = '#3a2c1e'; ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(fx - 16, fy - 2); ctx.lineTo(fx + 14, fy - 12);
  ctx.moveTo(fx - 14, fy - 12); ctx.lineTo(fx + 16, fy - 2);
  ctx.stroke();

  /* سه نفر دور آتش — با نور آتش (سمت آتش روشن‌تر) */
  e30Figure(fx - 110, GROUND_Y, { c: 'rgba(10,12,20,0.95)', s: 1.02, ph: Math.sin(t * 1.3) * 0.35, face: 1 });
  e30Figure(fx + 112, GROUND_Y, { c: 'rgba(26,30,44,0.95)', s: 1.0, ph: Math.sin(t * 1.6 + 2) * 0.35, face: -1 });
  e30Figure(fx - 30, GROUND_Y - 4, { c: 'rgba(200,212,232,0.6)', s: 0.94, ph: Math.sin(t * 1.1) * 0.3, face: 1 });
  /* کاغذ در دست آرش (زیر نور) */
  ctx.save();
  ctx.translate(fx - 96, GROUND_Y - 22);
  ctx.rotate(-0.2 + Math.sin(t * 2) * 0.05);
  ctx.fillStyle = `rgba(245,228,180,${0.8 + 0.2 * fl})`;
  ctx.fillRect(-8, -6, 16, 10);
  ctx.restore();

  /* رادیو روی سنگ (برای خط دکتر سارا) */
  if (t > 36) {
    const rx = fx + 46, ry = GROUND_Y - 8;
    ctx.fillStyle = '#23262e';
    rr(rx - 10, ry - 14, 20, 14, 2); ctx.fill();
    ctx.fillStyle = `rgba(120,200,160,${0.5 + 0.4 * Math.sin(t * 8)})`;
    ctx.fillRect(rx - 7, ry - 11, 5, 4);
    ctx.strokeStyle = '#3a4050'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(rx + 6, ry - 14); ctx.lineTo(rx + 10, ry - 26); ctx.stroke();
    /* موج رادیویی */
    for (let i = 0; i < 3; i++) {
      const rr2 = 14 + i * 10 + (Math.sin(t * 3 - i) * 4 + 4);
      ctx.strokeStyle = `rgba(120,200,160,${0.3 - i * 0.08})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(rx + 8, ry - 26, rr2, -0.9, 0.9); ctx.stroke();
    }
  }
}

/* ---- جدایی: جادهٔ دو شاخه + ماشین (پرامپت ۶-۱۲/۲) ---- */
function drawE30Part(t) {
  /* گرگ و میم سحرگاه */
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, '#1a1a30');
  sky.addColorStop(0.55, '#3a2c3c');
  sky.addColorStop(1, '#6a4440');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GROUND_Y + 2);
  /* خورشیدِ پایین */
  const sg = ctx.createRadialGradient(W * 0.2, GROUND_Y - 20, 6, W * 0.2, GROUND_Y - 20, 150);
  sg.addColorStop(0, 'rgba(255,170,90,0.6)');
  sg.addColorStop(1, 'rgba(255,170,90,0)');
  ctx.fillStyle = sg; circle(W * 0.2, GROUND_Y - 20, 150);
  /* افق خرابه */
  ctx.fillStyle = 'rgba(26,22,30,0.92)';
  for (let i = 0; i < 7; i++) {
    const bx = i * W / 6.2, bh = 40 + (i * 53) % 80;
    ctx.fillRect(bx, GROUND_Y - bh, 60, bh);
  }
  /* زمین */
  const gr = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  gr.addColorStop(0, '#2e2820'); gr.addColorStop(1, '#201a16');
  ctx.fillStyle = gr; ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  /* جادهٔ خاکی + شاخه شدن */
  ctx.fillStyle = '#3c342a';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + 26);
  ctx.lineTo(W * 0.52, GROUND_Y + 14);
  ctx.lineTo(W, GROUND_Y + 30);
  ctx.lineTo(W, GROUND_Y + 60);
  ctx.lineTo(0, GROUND_Y + 60);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(60,52,40,0.9)'; ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(W * 0.52, GROUND_Y + 16);
  ctx.quadraticCurveTo(W * 0.66, GROUND_Y + 2, W, GROUND_Y + 8);
  ctx.stroke();

  /* ماشین (سمت راست) — ارشان بالای آن */
  const cx = W * 0.68, cy = GROUND_Y + 6;
  const driveK = clamp((t - 26) / 6, 0, 1);            // بعد از «قول می‌دم» حرکت می‌کند
  const carX = cx + driveK * (W * 0.5);
  ctx.save();
  ctx.globalAlpha = 1 - driveK * 0.6;
  /* بدنه */
  ctx.fillStyle = '#3d4552';
  rr(carX - 58, cy - 34, 116, 22, 7); ctx.fill();
  rr(carX - 26, cy - 50, 56, 18, 6); ctx.fill();
  ctx.fillStyle = 'rgba(180,220,240,0.4)';
  ctx.fillRect(carX - 20, cy - 46, 20, 11);
  ctx.fillRect(carX + 6, cy - 46, 18, 11);
  /* چرخ‌ها */
  ctx.fillStyle = '#16181e';
  circle(carX - 34, cy - 8, 11); circle(carX + 36, cy - 8, 11);
  ctx.fillStyle = '#3a3e48';
  circle(carX - 34, cy - 8, 4.4); circle(carX + 36, cy - 8, 4.4);
  /* چراغ جلو */
  ctx.fillStyle = `rgba(255,220,140,${0.7 + 0.3 * Math.sin(t * 4)})`;
  circle(carX + 57, cy - 24, 3.4);
  const lg = ctx.createRadialGradient(carX + 57, cy - 24, 3, carX + 57, cy - 24, 70);
  lg.addColorStop(0, 'rgba(255,220,140,0.3)');
  lg.addColorStop(1, 'rgba(255,220,140,0)');
  ctx.fillStyle = lg; circle(carX + 57, cy - 24, 70);
  /* گردوغبار پشت ماشین وقتی حرکت می‌کند */
  if (driveK > 0 && Math.random() < 0.6) {
    ctx.fillStyle = 'rgba(120,104,84,0.3)';
    ctx.beginPath(); ctx.ellipse(carX - 70, cy - 6, 18 + Math.random() * 10, 8, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  /* دکتر مریم + اعضا (سمت چپ دور) */
  e30Figure(W * 0.12, GROUND_Y, { c: 'rgba(200,212,232,0.62)', s: 0.96, ph: Math.sin(t * 1.2) * 0.3 });
  e30Figure(W * 0.08, GROUND_Y, { c: 'rgba(20,24,36,0.9)', s: 0.92, ph: Math.sin(t * 1.5) * 0.3 });

  /* ارشان کنار ماشین (قبل از حرکت) */
  if (driveK <= 0) {
    e30Figure(carX - 84, GROUND_Y + 6, { c: 'rgba(26,30,44,0.95)', s: 1.0, ph: Math.sin(t * 2) * 0.4 });
  }
  /* آرش — پیاده، سمت چپ، رو به خرابه‌ها */
  e30Figure(W * 0.42, GROUND_Y, { c: 'rgba(10,12,20,0.96)', s: 1.02, ph: Math.sin(t * 2.4) * 0.5 });
}

/* ---- کارت فصل میانی ---- */
function drawE30Plati(t) {
  ctx.fillStyle = '#05060c';
  ctx.fillRect(0, 0, W, H);
  const a = clamp(Math.min(t * 2, (2.6 - t) * 2), 0, 1);
  ctx.globalAlpha = a;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#aab8d8';
  ctx.font = 'bold 16px Vazirmatn, sans-serif';
  ctx.fillText('فصل میانی — سفر', W / 2, H / 2 - 44);
  ctx.fillStyle = '#ffd98a';
  ctx.font = 'bold 30px Vazirmatn, sans-serif';
  ctx.fillText('مرحلهٔ ۱ — خرابه‌های شهر', W / 2, H / 2);
  ctx.fillStyle = '#8494b8';
  ctx.font = '14px Vazirmatn, sans-serif';
  ctx.fillText('آرش، تنها و پیاده، در دل خرابه‌ها به سمت ایستگاه شمالی', W / 2, H / 2 + 34);
  ctx.globalAlpha = 1;
}

/* ---- ایستگاه شمالی: آزمایشگاه نیمه‌ویران + دکتر سارا (پرامپت ۶-۱۴) ---- */
function drawE30Station(t) {
  /* نور سرد آزمایشگاه در برابر گرما */
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#0c1018');
  sky.addColorStop(1, '#161c2a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  const fl = GROUND_Y - 10;
  ctx.fillStyle = '#1c2330';
  ctx.fillRect(0, fl, W, H - fl);

  /* پنجره‌های شکسته + نور سرد */
  for (let i = 0; i < 3; i++) {
    const wx = W * 0.2 + i * W * 0.28;
    ctx.fillStyle = 'rgba(160,200,245,0.12)';
    ctx.beginPath();
    ctx.moveTo(wx - 24, 74); ctx.lineTo(wx + 24, 74);
    ctx.lineTo(wx + 52, fl); ctx.lineTo(wx - 52, fl);
    ctx.closePath(); ctx.fill();
    /* قاب پنجره شکسته */
    ctx.strokeStyle = '#39435a'; ctx.lineWidth = 3;
    ctx.strokeRect(wx - 26, 60, 52, 34);
    ctx.beginPath();
    ctx.moveTo(wx - 26, 60); ctx.lineTo(wx - 4, 94);
    ctx.moveTo(wx + 12, 60); ctx.lineTo(wx + 26, 80);
    ctx.stroke();
  }

  /* تجهیزات شکسته */
  const equip = (x, h) => {
    ctx.fillStyle = '#252e40';
    rr(x, fl - h, 46, h, 3); ctx.fill();
    ctx.fillStyle = 'rgba(120,190,235,0.5)';
    ctx.fillRect(x + 8, fl - h + 10, 12, 8);
    ctx.fillRect(x + 26, fl - h + 10, 10, 8);
    ctx.fillStyle = 'rgba(220,225,235,0.4)';
    ctx.fillRect(x + 6, fl - h + 26, 34, 3);
    ctx.fillRect(x + 10, fl - h + 33, 26, 3);
  };
  equip(W * 0.08, 76);
  equip(W * 0.9, 66);

  /* کاغذهای پخش روی زمین */
  ctx.fillStyle = 'rgba(220,224,235,0.35)';
  for (let i = 0; i < 12; i++) {
    const px = (i * 137.7) % (W - 120) + 60;
    ctx.save();
    ctx.translate(px, fl + 8 + (i % 3) * 16);
    ctx.rotate((i * 1.7) % 1.2 - 0.6);
    ctx.fillRect(-9, -6, 18, 12);
    ctx.restore();
  }

  /* میز سارا + نور سرد روشن روی آن */
  const sx = W * 0.66, sy = fl - 24;
  ctx.fillStyle = '#2a3346';
  ctx.fillRect(sx - 62, sy - 12, 124, 12);
  ctx.fillRect(sx - 56, sy, 8, 24);
  ctx.fillRect(sx + 48, sy, 8, 24);
  const cone = ctx.createLinearGradient(0, 46, 0, sy);
  cone.addColorStop(0, 'rgba(170,210,250,0.24)');
  cone.addColorStop(1, 'rgba(170,210,250,0.02)');
  ctx.fillStyle = cone;
  ctx.beginPath();
  ctx.moveTo(sx - 16, 42); ctx.lineTo(sx + 16, 42);
  ctx.lineTo(sx + 60, sy - 10); ctx.lineTo(sx - 60, sy - 10);
  ctx.closePath(); ctx.fill();
  /* پرونده‌ها روی میز */
  ctx.fillStyle = 'rgba(200,205,218,0.6)';
  for (const [dx, dy, w2] of [[-40, -20, 26], [-8, -22, 30], [26, -19, 24]]) {
    ctx.save(); ctx.translate(sx + dx, sy + dy); ctx.rotate(dx / 240);
    ctx.fillRect(-w2 / 2, -5, w2, 10);
    ctx.restore();
  }

  /* دکتر سارا — زخمی، پشت میز، روپوش آزمایشگاهی خاک‌گرفته */
  ctx.save();
  ctx.translate(sx, sy + 4);
  /* بدن نشسته */
  ctx.fillStyle = 'rgba(214,222,238,0.88)';
  rr(-13, -44, 26, 34, 8); ctx.fill();
  /* بانداز بازوی چپ */
  ctx.fillStyle = 'rgba(200,80,70,0.7)';
  ctx.fillRect(-22, -34, 9, 14);
  /* سر خسته */
  ctx.fillStyle = 'rgba(224,196,168,0.95)';
  circle(2, -50, 7);
  /* موی جفیده روشن */
  ctx.fillStyle = 'rgba(120,110,100,0.9)';
  ctx.beginPath();
  ctx.arc(2, -52, 7.2, Math.PI * 0.95, Math.PI * 1.9);
  ctx.fill();
  ctx.fillRect(-5, -53, 7, 3);
  /* سایه‌ی چشم (خستگی) */
  ctx.fillStyle = 'rgba(70,60,60,0.4)';
  ctx.fillRect(-2, -51, 4, 1.6);
  ctx.fillRect(5, -51, 4, 1.6);
  ctx.restore();

  /* نور آتش بیرون از در (چپ) */
  const fireGlow = 0.6 + 0.4 * Math.sin(t * 7);
  const doorX = W * 0.06;
  const fg = ctx.createRadialGradient(doorX, fl - 30, 6, doorX, fl - 30, 110);
  fg.addColorStop(0, `rgba(255,150,60,${0.2 * fireGlow})`);
  fg.addColorStop(1, 'rgba(255,150,60,0)');
  ctx.fillStyle = fg; circle(doorX, fl - 30, 110);

  /* آرش و ارشان وارد از چپ */
  const k = clamp(t / 5, 0, 1);
  const ax = 90 + k * (sx - 220);
  e30Figure(ax, fl, { c: 'rgba(10,12,20,0.96)', s: 1.02, ph: Math.sin(t * 5) });
  e30Figure(ax - 60, fl, { c: 'rgba(26,30,44,0.95)', s: 1.0, ph: Math.sin(t * 5 + 2.4) });

  /* نور چراغ ماشین از دور (انتهای گفتگو) */
  if (t > 40) {
    const hl = ctx.createRadialGradient(W - 40, fl - 20, 4, W - 40, fl - 20, 130);
    const arr = clamp((t - 40) / 4, 0, 1);
    hl.addColorStop(0, `rgba(255,240,190,${0.5 * arr})`);
    hl.addColorStop(1, 'rgba(255,240,190,0)');
    ctx.fillStyle = hl; circle(W - 40, fl - 20, 130);
  }
}

/* ---- ماشین در جاده + نقشهٔ داشبورد → پایان باز (پرامپت بخش ۲ پایان) ---- */
function drawE30Driveoff(t) {
  /* جادهٔ غروب */
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, '#14172a');
  sky.addColorStop(0.5, '#2e2438');
  sky.addColorStop(1, '#583830');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GROUND_Y + 2);
  const sg = ctx.createRadialGradient(W * 0.82, GROUND_Y - 26, 8, W * 0.82, GROUND_Y - 26, 170);
  sg.addColorStop(0, 'rgba(255,160,80,0.55)');
  sg.addColorStop(1, 'rgba(255,160,80,0)');
  ctx.fillStyle = sg; circle(W * 0.82, GROUND_Y - 26, 170);
  /* کوه‌ها */
  ctx.fillStyle = 'rgba(22,20,30,0.9)';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= W; x += 70) ctx.lineTo(x, GROUND_Y - 30 - Math.sin(x * 0.008) * 34);
  ctx.lineTo(W, GROUND_Y); ctx.closePath(); ctx.fill();
  /* زمین */
  const gr = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  gr.addColorStop(0, '#26211c'); gr.addColorStop(1, '#181410');
  ctx.fillStyle = gr; ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  /* جاده */
  ctx.fillStyle = '#332e26';
  ctx.fillRect(0, GROUND_Y + 18, W, 42);
  ctx.strokeStyle = 'rgba(220,200,150,0.25)'; ctx.lineWidth = 3;
  ctx.setLineDash([26, 22]);
  ctx.beginPath(); ctx.moveTo(0, GROUND_Y + 40); ctx.lineTo(W, GROUND_Y + 40); ctx.stroke();
  ctx.setLineDash([]);

  /* ماشین در حال حرکت به راست + سه سرنشین */
  const carX = W * 0.3 + clamp(t / 6, 0, 1) * W * 0.42;
  const cy = GROUND_Y + 24;
  const bump = Math.sin(t * 9) * 1.4;
  ctx.save();
  ctx.translate(0, bump);
  ctx.fillStyle = '#3d4552';
  rr(carX - 58, cy - 36, 116, 22, 7); ctx.fill();
  rr(carX - 26, cy - 52, 56, 18, 6); ctx.fill();
  ctx.fillStyle = 'rgba(190,215,240,0.42)';
  ctx.fillRect(carX - 20, cy - 48, 20, 11);
  ctx.fillRect(carX + 6, cy - 48, 18, 11);
  /* سرهای سه سرنشین */
  ctx.fillStyle = 'rgba(224,196,168,0.95)';
  circle(carX - 12, cy - 50, 4.6);
  circle(carX + 4, cy - 50, 4.6);
  circle(carX + 20, cy - 50, 4.6);
  /* چرخ‌های چرخان */
  ctx.fillStyle = '#16181e';
  circle(carX - 34, cy - 8, 11); circle(carX + 36, cy - 8, 11);
  ctx.strokeStyle = '#3a3e48'; ctx.lineWidth = 2;
  const wr = t * 9;
  for (const wx of [carX - 34, carX + 36]) {
    ctx.beginPath();
    ctx.moveTo(wx - Math.cos(wr) * 8, cy - 8 - Math.sin(wr) * 8);
    ctx.lineTo(wx + Math.cos(wr) * 8, cy - 8 + Math.sin(wr) * 8);
    ctx.stroke();
  }
  /* چراغ جلو + دنبالهٔ نور */
  ctx.fillStyle = `rgba(255,225,150,${0.7 + 0.3 * Math.sin(t * 4)})`;
  circle(carX + 57, cy - 26, 3.4);
  const lg = ctx.createRadialGradient(carX + 57, cy - 26, 3, carX + 57, cy - 26, 90);
  lg.addColorStop(0, 'rgba(255,225,150,0.32)');
  lg.addColorStop(1, 'rgba(255,225,150,0)');
  ctx.fillStyle = lg; circle(carX + 57, cy - 26, 90);
  /* گردوغبار */
  ctx.fillStyle = 'rgba(120,104,84,0.25)';
  ctx.beginPath(); ctx.ellipse(carX - 74, cy - 4, 20 + Math.random() * 12, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  /* نقشهٔ داشبورد با نقاط علامت‌خورده (نزدیک‌نما — پایین چپ) */
  const mapA = clamp(Math.min((t - 1.2) * 0.9, (5.6 - t) * 0.9), 0, 1);
  if (mapA > 0) {
    ctx.save();
    ctx.globalAlpha = mapA;
    const mx = W * 0.2, my = H - 132, mw = 210, mh = 118;
    ctx.fillStyle = 'rgba(24,20,16,0.92)';
    rr(mx - 12, my - 12, mw + 24, mh + 24, 8); ctx.fill();
    ctx.strokeStyle = 'rgba(120,100,70,0.6)'; ctx.lineWidth = 2;
    rr(mx - 12, my - 12, mw + 24, mh + 24, 8); ctx.stroke();
    /* کاغذ نقشه */
    ctx.fillStyle = 'rgba(226,214,186,0.95)';
    rr(mx, my, mw, mh, 3); ctx.fill();
    /* جاده‌ها */
    ctx.strokeStyle = 'rgba(110,90,60,0.7)'; ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(mx + 14, my + mh - 20);
    ctx.quadraticCurveTo(mx + mw * 0.4, my + 26, mx + mw - 20, my + mh - 40);
    ctx.moveTo(mx + 30, my + 12);
    ctx.quadraticCurveTo(mx + mw * 0.6, my + mh * 0.55, mx + mw - 34, my + 20);
    ctx.stroke();
    /* نقاط علامت‌خورده (قرمز) */
    const dots = [[0.22, 0.72], [0.45, 0.38], [0.68, 0.6], [0.86, 0.3]];
    dots.forEach(([fx2, fy2], i) => {
      const dx = mx + mw * fx2, dy2 = my + mh * fy2;
      const pulse = 0.6 + 0.4 * Math.sin(t * 4 + i * 1.5);
      ctx.fillStyle = `rgba(190,50,40,${pulse})`;
      circle(dx, dy2, 4.4);
      ctx.strokeStyle = 'rgba(120,30,24,0.8)'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(dx, dy2, 7.4, 0, Math.PI * 2); ctx.stroke();
      /* خط تا نقطهٔ بعد */
      if (i < dots.length - 1) {
        const nx = mx + mw * dots[i + 1][0], ny = my + mh * dots[i + 1][1];
        ctx.strokeStyle = 'rgba(150,40,30,0.5)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(dx, dy2); ctx.lineTo(nx, ny); ctx.stroke();
        ctx.setLineDash([]);
      }
    });
    /* نوشتهٔ کوچک */
    ctx.fillStyle = 'rgba(80,60,40,0.85)';
    ctx.font = 'bold 10px Vazirmatn, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('مسیر فاز دوم — شمال', mx + 16, my + 14);
    ctx.restore();
  }
}
