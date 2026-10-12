#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""«سه طبقه تا مرگ» v23 — منبع یکتای دیالوگ‌ها (۱۲۵ خط نهایی)
هر خط: (id, who, fa, fing)
  fa   = متن زیرنویس فارسی (کوتاه، TLOU-سبک)
  fing = فینگلیش آوانگاری دقیق برای ElevenLabs v3
شخصیت‌ها: p سهند a ارشان m دکتر مریم n راوی r بی‌سیم b هیولا d دستفروش
صداهای ElevenLabs: p→Brian a→Liam m→Matilda n→Daniel r→River b→Callum d→Roger
"""

LINES = [
    # ---------- اینترو — صحنه ۱: شهر در حال سقوط (۴ خط) ----------
    ('i1n', 'n', 'یه ویروس، شهر رو بی‌صدا کشت.', 'ye virus, shahr ro be seda kosht.'),
    ('i2n', 'n', 'خیابون‌ها خالی موند.', 'khiyaboonha khaali moond.'),
    ('i3a', 'a', 'چقدر دیگه؟ آب تمومه.', 'cheghadr dige? ab temoome.'),
    ('i4p', 'p', 'تا جای امن پیدا نکنیم، وایسیم نمی‌شه.', 'ta jaye amn peyda nakonim, vaysim nemishe.'),
    # ---------- صحنه ۲: صدای خطر (۲) ----------
    ('i7a', 'a', 'صداش رو شنیدی؟ نزدیکه!', 'sedash ro shenidi? nazdike!'),
    ('i8p', 'p', 'آره. از خیابون اصلی دور بشیم.', 'are. az khiyaboon asli door beshim.'),
    # ---------- صحنه ۳: پیدا کردن ساختمانِ موجودِ نیمه‌کاره (۴) ----------
    ('i9a', 'a', 'اون ساختمون رو ببین! سه طبقه‌ست!', 'oon sakhtemoon ro bebin! se tabagheh!'),
    ('i10p', 'p', 'متروکه‌ست. معلوم نیست داخلش چی هست.', 'metrookeh. maloom nist toojash chi hast.'),
    ('i13a', 'a', 'اول بررسی می‌کنیم.', 'aval barresi mikonim.'),
    ('i14p', 'p', 'باشه. ورودی‌ها رو محکم می‌کنیم.', 'bashe. voroodiha ro mohkam mikonim.'),
    # ---------- صحنه ۴: استحکام‌بخشی ساختمان موجود — نه ساختِ برج (۴) ----------
    ('i15a', 'a', 'تخته‌ها به درد پنجره‌ها می‌خورن.', 'takhteha be dard panjereha mikhoran.'),
    ('i16p', 'p', 'ورق فلزی رو بذار جلوی در.', 'varragh felez ro bezar jolo ye dar.'),
    ('i19a', 'a', 'یه ساختمون نیمه‌کاره، شد خونه‌ی ما!', 'ye sakhtemoon nimekaare, shod khoone maa!'),
    ('i20p', 'p', 'پناهگاهه. مراقبش باشیم.', 'panahgaheh. moraqebash bashim.'),
    # ---------- پیش از موج اول (۳) ----------
    ('w1a', 'a', 'آماده‌ست! امیدوارم تخته‌ها دوام بیارن!', 'aadast! omidvaram takhteha dovam biyaran!'),
    ('w1b', 'p', 'در رو نگه دار. حواست به پنجره‌ها باشه.', 'dar ro negah dar. hoozat be panjereha bashe.'),
    ('w1d', 'p', 'نمی‌دونم. برای بدترین حالت آماده باش.', 'nemidoonam. baraye badtarin halet aadeh bash.'),
    # ---------- فصل ۱ — پس از موج‌ها ----------
    ('c1w1a', 'a', 'رفتن؟ واقعاً رفتن؟', 'raftan? vaghean raftan?'),
    ('c1w1b', 'p', 'عقب‌نشینی کردن. هنوز امن نیست.', 'aqabneshini kardan. hanooz amn nist.'),
    ('c1w2a', 'a', 'چند تا تخته شکست!', 'chand ta takhteh shekast!'),
    ('c1w2b', 'p', 'ورودی رو اول تعمیر می‌کنم.', 'voroodi ro aval taamir mikonam.'),
    ('c1w3a', 'a', 'جعبه ابزار پیدا کردم!', 'jaaqe abzar peyda kardam!'),
    ('c1w3b', 'p', 'نگهش دار. به کار میاد.', 'negahesh dar. be kaar miyad.'),
    # ---------- فاصله آرام: بی‌سیم (۵) ----------
    ('c1w4a', 'a', 'صبر کن... این صدا از کجاست؟', 'sabr kon... in seda az kojast?'),
    ('c1w4b', 'p', 'بی‌سیمه. هنوز کار می‌کنه.', 'bisimeh. hanooz kaar mikoneh.'),
    ('c1w4r', 'r', 'توجه... ایستگاه شمال... مسیر اصلی مسدود...', 'tavajjoh... istgaah shomaal... masir asli masdood...'),
    ('c1w4c', 'a', 'شنیدی؟ ممکنه آدم‌های دیگه‌ای باشن!', 'shenidi? momkene aadamhaye digari bashan!'),
    ('c1w4d', 'p', 'پیام ناقص بود. فعلاً زنده بمونیم.', 'peyaam naaqes bood. felaan zende bemoonim.'),
    ('c1w5a', 'a', 'این دفعه تعدادشون بیشتر بود.', 'in dafe tedadashoon bishtar bood.'),
    ('c1w5b', 'p', 'منابع رو بی‌خودی هدر ندیم.', 'manaabes ro bikhoodi hadar nadim.'),
    # ---------- فصل ۱ — شب آخر (۳) ----------
    ('c1e1a', 'a', 'ساختمون دیگه مثل روز اول نیست.', 'sakhtemoon dige mesl rooz aval nist.'),
    ('c1e1b', 'p', 'ما هم مثل روز اول نیستیم.', 'maa ham mesl rooz aval nistim.'),
    ('c1e1d', 'p', 'اون روز باید راه خروج داشته باشیم.', 'oon rooz bayad raah khoroj dashte bashim.'),
    # ---------- پایان فصل ۱ (۴) ----------
    ('c1er', 'r', 'مسیر کانال هنوز بازه... تکرار می‌کنم...', 'masir kanaal hanooz baaze... tekrar mikonam...'),
    ('c1ea', 'a', 'واضح‌تر شنیدم! از کانال رد می‌شیم!', 'vaazhtar shenidam! az kanaal rad mishim!'),
    ('c1eb', 'p', 'اگه ترکش کنیم، برگشتی نیست.', 'age tarkish konim, bargashti nist.'),
    ('c1ed', 'p', 'وسایل ضروری رو جمع کن. حرکت می‌کنیم.', 'vasayel zaroori ro jam kon. harakat mikonim.'),
    # ---------- انتقال ۱→۲: فروریختن (۵) ----------
    ('t1a1', 'a', 'برج داره فرو می‌ریزه! بپر! سریع!', 'borj daare foo mirize! bepar! sari!'),
    ('t1n1', 'n', 'ارشان پایین رفت و ماشین رو گرم کرد.', 'aarshaan paayin raft o mashin ro garm kard.'),
    ('tb1c', 'a', 'گرفتمت! محکم خودت رو بگیر!', 'gereftamat! mohkam khodet ro begir!'),
    ('tb1s', 'a', 'فرمان با توئه! گاز بده!', 'farmaan baa tooeh! gaaz bedeh!'),
    ('tb1o', 'n', 'جاده شمالی رسیدید. کانال منتظرته.', 'jaade shomaali residid. kanaal montazarteh.'),
    # ---------- اوتروی ماشین — شروع فصل ۲ (۴) ----------
    ('t2n1', 'n', 'رفتند؛ بی‌آنکه بدانند آن‌سوی کانال چیست.', 'raftand; biaanke daanand ansoo kanaal chist.'),
    ('t2a1', 'a', 'باورم نمی‌شه ترکش کردیم.', 'baavaram nemishe tarkish kardim.'),
    ('t2p1', 'p', 'اونجا رو برای زندگی آماده کردیم، نه زندان.', 'oonjaa ro baraye zendegi aadeh kardim, na zendaan.'),
    ('t2p2', 'p', 'تا خودمون نبینیم، اعتماد نمی‌کنیم.', 'ta khodemoon bebinim, eteqaad nemikonim.'),
    # ---------- پایان فصل ۲: قایق (۷) ----------
    ('c2ea', 'a', 'اونجا رو ببین! یه قایقه!', 'oonjaa ro bebin! ye ghaayegheh!'),
    ('c2eb', 'p', 'اول بدنه‌ش رو بررسی می‌کنیم.', 'aval badanash ro barresi mikonim.'),
    ('c2ed', 'p', 'وسط راه خراب شه، برگشتی نداریم.', 'vasat raah kharaab she, bargashti nadarim.'),
    ('c2em', 'p', 'ممکنه همون ایستگاه باشه. مسیر فرعی می‌ریم.', 'momkene hamoon istgaah bashe. masir fareyi mirim.'),
    ('c2eo', 'p', 'به آمادگی تکیه کنیم، نه به امید.', 'be aadehgi takye konim, na be omid.'),
    # ---------- انتقال ۲→۳: قایق (۶) ----------
    ('tb2p1', 'a', 'قایق قدیمیه، ولی حرکت می‌کنه.', 'ghaayegh ghadimie, vali harakat mikoneh.'),
    ('tb2p4', 'p', 'نه. ولی وقت نداریم. حرکت کن.', 'na. vali vaght nadarim. harakat kon.'),
    ('tb2s', 'a', 'فرمان قایق با توئه! گاز بده!', 'farmaan ghaayegh baa tooeh! gaaz bedeh!'),
    ('tb2o1', 'a', 'رسیدیم! از اینجا ادامه می‌دیم.', 'residim! az inja edaame midim.'),
    ('tb2o2', 'p', 'تموم نشده. ایستگاه رو پیدا کنیم.', 'temoo nashode. istgaah ro peyda konim.'),
    ('tb2o4', 'p', 'و هر قدم، یه خطر تازه داره.', 'o har ghadam, ye khatar taaze dareh.'),
    # ---------- بارک‌های قایق و مسیر (۴) ----------
    ('b1a1', 'a', 'گاز بده! تنها راه همینه!', 'gaaz bedeh! tanaa raah hamine!'),
    ('b1a2', 'a', 'آخر کانال یه چراغ چشمک می‌زنه!', 'aakher kanaal ye cheragh chashmak mizaneh!'),
    ('d1a1', 'a', 'مواظب باش! یه راه باقی مونده!', 'moozab bash! ye raah baaghi moondeh!'),
    ('d1a2', 'a', 'اون طرف یه جعبه‌ست! بگیرش!', 'oon taraf ye jaaqeh! begiresh!'),
    # ---------- شروع فصل ۳ (۳) ----------
    ('c3n1', 'n', 'آن‌سوی کانال، ایستگاهی متروک بود؛ نشانه‌هایی از زندگی، بی‌کسی.', 'ansoo kanaal, istgaahi matrook bood; nishaanihaa az zendegi, bikasi.'),
    ('c3a1', 'a', 'انگار یه گروهی اینجا زندگی می‌کرده.', 'angar ye groohi inja zendegi mikardeh.'),
    ('c3p1', 'p', 'آثارش هست. ولی کجا رفتن؟', 'aasaresh hast. vali kojaa raftan?'),
    # ---------- سرنخ ۱۸ (۳) ----------
    ('c3ca', 'a', 'اینجا نوشته برج مخابراتی تو کوهستانه.', 'inja neveshte borj mokhaaberati too kohestaane.'),
    ('c3cb', 'p', 'اگه کار کنه، پیام کامل‌تری می‌گیریم.', 'age kaar kone, peyaam kaameltari migirim.'),
    ('c3cd', 'p', 'زوده. اول باید برسیم.', 'zooreh. aval bayad beresim.'),
    # ---------- پایان فصل ۳ (۳) ----------
    ('c3ea', 'a', 'فکر می‌کنی اونجا واقعاً آدم زنده باشه؟', 'fekr mikoni oonjaa vaghean aadam zende bashe?'),
    ('c3eb', 'p', 'پیام می‌گه پناهگاه فعاله.', 'peyaam mige panahgaah faaaleh.'),
    ('c3ed', 'p', 'پس حرکت کنیم و خودمون ببینیم.', 'pas harakat konim o khodemoon bebinim.'),
    # ---------- انتقال ۳→۴: برف (۷) ----------
    ('t3h1', 'a', 'هوا سردتر شد. دستام یخ زده.', 'havva sardtar shod. dastam yakh zadeh.'),
    ('t3h4', 'p', 'اگه نباشه، پیام اضطراری می‌فرستیم.', 'age nabaashe, peyaam ezteraari mifrestim.'),
    ('tb3s', 'a', 'گاز بده! از برف رد شو!', 'gaaz bedeh! az barf rad shoo!'),
    ('t3r1', 'a', 'رسیدیم! تجهیزات هنوز اینجا هستن!', 'residim! tajhizaat hanooz injaa hastan!'),
    ('t3r2', 'p', 'ارتباط رو چک می‌کنم. دست به چیزی نزن.', 'ertaabaat ro chek mikonam. dast be chizi nazan.'),
    ('t3rr', 'r', 'اگر این را می‌شنوید، پناهگاه جنوبی فعال است. مسیر دره شرقی.', 'agar in ra mishnavid, panahgaah jonoobi faaal ast. masir darre sharghi.'),
    ('t3r4', 'p', 'مسیر داریم. قبل از بدتر شدن هوا بریم.', 'masir daarim. ghabl az badtar shodan havva berim.'),
    # ---------- بارک‌های اسنوموبیل (۳) ----------
    ('s1a1', 'a', 'توفان میاد! تو رگبار گاز نده!', 'toofaan miaad! too ragbaar gaaz nadeh!'),
    ('s1a2', 'a', 'بالا یه جعبه‌ست! نزدیک شو!', 'baalaa ye jaaqeh! nazdik shoo!'),
    ('sbo1', 'p', 'وای... برق رفت! چراغ‌قوه رو روشن کن!', 'vaay... barq raft! cheragh ghooove ro rooshan kon!'),
    # ---------- فصل ۴: رسیدن به پناهگاه (۷) ----------
    ('c4n1', 'n', 'پس از روزها مبارزه، به پناهگاهی رسیدند با نشانه‌های زندگی.', 'pas az roozhaa mobaareze, be panahgaahi residan baa nishaanhaaye zendegi.'),
    ('c4a1', 'a', 'آدم‌ها! بالاخره آدم‌های واقعی!', 'aadamhaa! baalaakhare aadamhaye vaghe!'),
    ('c4p1', 'p', 'آروم باش. اول بفهمیم چه خبره.', 'aaroom bash. aval befahim che khabare.'),
    ('c4m1', 'm', 'پیام برج مخابراتی رو گرفتید؟', 'peyaam borj mokhaaberati ro gereftid?'),
    ('c4m2', 'm', 'اینجا هنوز امنه. ولی دیوارهای شمالی آسیب دیدن.', 'inja hanooz amneh. vali divarhaaye shomaali aasib didan.'),
    ('c4p3', 'p', 'ما دفاع از ساختمون رو بلدیم.', 'maa defaa az sakhtemoon ro baladim.'),
    ('c4a3', 'a', 'این بار تنها نیستیم.', 'in dafe tanaa nistim.'),
    # ---------- شب آخر فصل ۴ (۴) ----------
    ('c4f1', 'a', 'همه آماده‌ان. ولی این سکوت عادی نیست.', 'hame aadaan. vali in sokoot aadi nist.'),
    ('c4f2', 'p', 'همین فکر رو منم می‌کنم.', 'hamin fekr ro manam mikonam.'),
    ('c4f3', 'm', 'از برج خبر رسید. حرکتی در دره شمالیه.', 'az borj khabar resid. harakati dar darre shomaalieh.'),
    ('c4f7', 'p', 'هرچی باشه، آماده‌ایم.', 'har chi bashe, aadaim.'),
    # ---------- پس از موج نهایی (۳) ----------
    ('c4v1', 'a', 'تموم شد؟ واقعاً تموم شد؟', 'temoom shod? vaghean temoom shod?'),
    ('c4v2', 'p', 'فعلاً ساکته. جشن نمی‌گیریم.', 'felaan saaketeh. jashn nemigirim.'),
    ('c4v3', 'm', 'بی‌سیم روشن بمونه. منتظر گزارشم.', 'bisim rooshan bemooneh. montazer gozaaram.'),
    # ---------- هشدار بی‌سیم — اوج داستان (۵) ----------
    ('c4vr', 'r', 'هشدار! حرکت گسترده در دره شمالی. همه به مواضع دفاعی!', 'heshdaar! harakat gosat darre shomaali. hame be mavaghe defaa!'),
    ('c4v4', 'a', 'نه... بعد از همه این‌ها؟', 'na... baad az hame inhaa?'),
    ('c4v5', 'm', 'دیوارها زیاد دووم نمیارن.', 'divarhaa ziyaad dovam nemiyaran.'),
    ('c4v6', 'p', 'همه رو به داخل منتقل کن. آماده تخلیه باشیم.', 'hame ro be daakhel montaqel kon. aadeh takhlie bashim.'),
    ('c4v8', 'p', 'تا یه راه مونده، تسلیم نمی‌شیم.', 'taa ye raah moonde, taslim nemishim.'),
    # ---------- پایان سینمایی (۵) ----------
    ('e1n', 'n', 'گمان می‌کردند کابوس تمام شده؛ اما این آغاز نبردی بزرگ‌تر بود.', 'gomaan mikardan kaaboos tamaam shode; ammaa in aaghaaz nabaradi bozorgtar bood.'),
    ('e2a', 'a', 'سهند... این بارم جون سالم می‌بریم؟', 'sahand... in daafam joon saalem miyaaarim?'),
    ('e3p', 'p', 'نمی‌دونم. ولی تسلیم نمی‌شیم.', 'nemidoonam. vali taslim nemishim.'),
    ('e4n', 'n', 'نبرد هنوز تمام نشده است.', 'nabarad hanooz tamaam nashodeh ast.'),
    ('tbc1n', 'n', 'این داستان ادامه دارد...', 'in daastaan edaameh daaraad...'),
    # ---------- بارک‌های گیم‌پلی — ارشان (۴) ----------
    ('aw1', 'a', 'من همین‌جام! تو فقط شلیک کن!', 'man haminjaam! to faghat shiligh kon!'),
    ('aw2', 'a', 'حواست باشه! گروه بزرگ میاد!', 'hoozat bashe! grooh bozorg miaad!'),
    ('aw4', 'a', 'باتری چراغ‌قوه تموم می‌شه!', 'baatari cheragh ghooove temoom mishe!'),
    ('aw5', 'a', 'برج ترک خورده! می‌رم پایین!', 'borj tarak khord! miram paayin!'),
    # ---------- نبرد نگهبان آخرین شب (۷) ----------
    ('fbw1', 'a', 'آوارها رو بترکون!', 'aavaarha ro betarkoon!'),
    ('fbw2', 'a', 'نگهبان آخرین شب میاد!', 'negahbaan aakhari shab miaad!'),
    ('fbz1', 'a', 'برجک‌ها روی زره‌ش اثر ندارن! خودت بزن!', 'borjhaa roo zereash asar nadaaran! khodet bezan!'),
    ('fbz2', 'a', 'مواظب باش! شارژ می‌کنه! بزن!', 'moozab bash! shaarzh mikoneh! bezan!'),
    ('fb1b1', 'b', 'زره... سنگین... کن!', 'zereh... sangin... kon!'),
    ('fb1b2', 'b', 'خشم... من!', 'khoshm... man!'),
    ('fbd1', 'b', 'تمومش... نکردی... هنوز...', 'temoosh... nakardi... hanooz...'),
    # ---------- دستفروش مرموز (۴) ----------
    ('pd1a1', 'd', 'کالای دست اول! ببین بخری.', 'kaalaa dast aval! bebin bekhari.'),
    ('pd1b', 'p', 'کالای کمیاب؟ تقلبی نیست؟', 'kaalaa kamyaaab? taqlabi nist?'),
    ('pd1c', 'd', 'تا غروب اینجام. زود انتخاب کن.', 'taa ghooroob injam. zood entekhaab kon.'),
    ('pd1l', 'd', 'غروب شد... باید رفت.', 'ghoroob shod... bayad raft.'),
]

if __name__ == '__main__':
    tot = sum(len(l[3]) for l in LINES)
    by = {}
    for _, w, _, f in LINES:
        by[w] = by.get(w, 0) + len(f)
    print('lines:', len(LINES), '| fing chars:', tot)
    for w, c in sorted(by.items()):
        print(f'  {w}: {c}')
