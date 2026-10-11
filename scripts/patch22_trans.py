#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""وصله‌ی ۲۲٫۰ — فایل ۲: v4_transitions.js
- TR_DLGS جدید (قایق = پیش از عبور، اسنوموبیل = مسیر دشوار)
- TR_BARKS با outro آرایه‌ای (دیالوگ چندخطی پایان فرار)
- صبر تا پایان گفتگو در فاز ۳ + DLG.update در فاز ۳
- متن‌های MGCFG هماهنگ با داستان جدید (ایستگاه متروکه به‌جای پاسگاه)
- نام فصل‌ها در v4_chapters.js مطابق داستان رسمی
"""
import re, sys

F = '/home/z/my-project/scripts/v4_transitions.js'
src = open(F, encoding='utf-8').read()

# ---- ۱) TR_DLGS + TR_BARKS ----
pat = re.compile(r'const TR_DLGS = \{.*?\n\};\nconst TR_BARKS = \{.*?\n\};', re.S)
if not pat.search(src):
    print('FAIL: TR blocks not found'); sys.exit(1)

NEW_TR = '''const TR_DLGS = {
  /* (۲۲٫۰) فصل ۱→۲: فروریختن برج و فرار — همان متن فوری */
  1: [ { who: 'a', v: 't1a1', text: 'برج داره فرو می‌ریزه! بپر! سریع!' },
       { who: 'n', v: 't1n1', text: 'ارشان با طناب از برج پایین رفت و ماشین رو گرم کرد — درها بازه، بپر تو!' } ],
  /* (۲۲٫۰) فصل ۲→۳: پیش از عبور از کانال */
  2: [ { who: 'a', v: 'tb2p1', text: 'قایق قدیمیه، ولی هنوز می‌تونه حرکت کنه.' },
       { who: 'p', v: 'tb2p2', text: 'وسایل رو محکم کن. چیزی نباید وسط راه داخل آب بیفته.' },
       { who: 'a', v: 'tb2p3', text: 'آماده‌ای؟' },
       { who: 'p', v: 'tb2p4', text: 'نه کاملاً. ولی دیگه وقت زیادی نداریم. حرکت کن.' } ],
  /* (۲۲٫۰) فصل ۳→۴: در مسیر دشوار — سرد و خسته */
  3: [ { who: 'a', v: 't3h1', text: 'هوا سردتر شده. دستام دیگه درست کار نمی‌کنن.' },
       { who: 'p', v: 't3h2', text: 'کمی استراحت می‌کنیم، اما مدت زیادی نمی‌تونیم اینجا بمونیم.' },
       { who: 'a', v: 't3h3', text: 'فکر می‌کنی هنوز کسی در برج باشه؟' },
       { who: 'p', v: 't3h4', text: 'نمی‌دونم. ولی اگه هیچ‌کس هم نباشه، شاید بتونیم پیام اضطراری بفرستیم.' } ],
};
/* (۲۲٫۰) outro = آرایه‌ی خطوط گفتگو (چندخطی) یا تک‌بارک */
const TR_BARKS = {
  1: { catch: { who: 'a', v: 'tb1c', text: 'گرفتمت! محکم خودت رو بگیر!' },
       start: { who: 'a', v: 'tb1s', text: 'فرمان با توئه! گاز بده!' },
       outro: [ { who: 'n', v: 't2n1', text: 'ساختمان سه‌طبقه دیگر نمی‌توانست امنیت همیشگی آن‌ها باشد. آن‌ها با وسایل باقی‌مانده حرکت کردند؛ بدون اینکه بدانند آن سوی کانال چه چیزی انتظارشان را می‌کشد.' },
                { who: 'a', v: 't2a1', text: 'هنوز باورم نمی‌شه مجبور شدیم اونجا رو ترک کنیم.' },
                { who: 'p', v: 't2p1', text: 'ما اونجا رو برای زنده موندن آماده کردیم، نه برای اینکه تا ابد داخلش زندانی بشیم.' },
                { who: 'a', v: 't2a2', text: 'امیدوارم پیام بی‌سیم درست بوده باشه.' },
                { who: 'p', v: 't2p2', text: 'تا وقتی مسیر رو بررسی نکردیم، به هیچ چیزی اعتماد نمی‌کنیم.' } ] },
  2: { catch: null,
       start: { who: 'a', v: 'tb2s', text: 'فرمان قایق با توئه! گاز بده!' },
       outro: [ { who: 'a', v: 'tb2o1', text: 'بالاخره رسیدیم! از اینجا می‌تونیم به راه ادامه بدیم.' },
                { who: 'p', v: 'tb2o2', text: 'هنوز تموم نشده. باید بفهمیم ایستگاه امدادی کجاست.' },
                { who: 'a', v: 'tb2o3', text: 'حداقل حالا از اون کانال لعنتی رد شدیم.' },
                { who: 'p', v: 'tb2o4', text: 'و فهمیدیم هر قدم جلوتر، یه خطر تازه داره.' } ] },
  3: { catch: null,
       start: { who: 'a', v: 'tb3s', text: 'گاز بده! از برف رد شو!' },
       outro: [ { who: 'a', v: 't3r1', text: 'بالاخره رسیدیم! تجهیزاتش هنوز اینجان.' },
                { who: 'p', v: 't3r2', text: 'باید برق و ارتباط رو بررسی کنیم. دست به چیزی نزن تا مطمئن بشیم.' },
                { who: 'r', v: 't3rr', text: 'اگر کسی این پیام را دریافت می‌کند، پناهگاه جنوبی هنوز فعال است. مسیر دره شرقی را دنبال کنید. از جاده اصلی دور بمانید.' },
                { who: 'a', v: 't3r3', text: 'پناهگاه جنوبی! این همون چیزیه که دنبالش بودیم!' },
                { who: 'p', v: 't3r4', text: 'حالا مسیر داریم. باید قبل از اینکه هوا بدتر بشه حرکت کنیم.' } ] },
};'''

src = pat.sub(lambda m: NEW_TR, src, count=1)

# ---- ۲) mgOutro: پشتیبانی آرایه + محاسبه مدت ----
old_mgOutro = """function mgOutro() {
  TR.phase = 3;
  TR.t = 0;
  TR.ev = {};
  MG.obs = [];
  const sc = Math.round(typeof DRV !== 'undefined' ? (DRV.score || 0) : 0);
  setTransSub(MGCFG[TR.ch].outroSub, 2.2);
  setTimeout(() => { try { setTransSub('\\U0001F3C1 امتیاز فرار: ' + faNum(sc) + (MG.hits ? ' — برخوردها: ' + faNum(MG.hits) : ' — بدون برخورد! ✨'), 2.4); } catch (e) {} }, 2400);
  SFX.clear();
  const b = TR_BARKS[TR.ch];         /* (۱۲٫۰) صدای پایان فرار */
  if (b && b.outro) transBark(b.outro, MGCFG[TR.ch].outroSub, 3.2);
}"""

new_mgOutro = """function mgOutro() {
  TR.phase = 3;
  TR.t = 0;
  TR.ev = {};
  MG.obs = [];
  TR.outroDurEff = MGCFG[TR.ch].outroDur;
  const sc = Math.round(typeof DRV !== 'undefined' ? (DRV.score || 0) : 0);
  setTransSub(MGCFG[TR.ch].outroSub, 2.2);
  setTimeout(() => { try { setTransSub('\\U0001F3C1 امتیاز فرار: ' + faNum(sc) + (MG.hits ? ' — برخوردها: ' + faNum(MG.hits) : ' — بدون برخورد! ✨'), 2.4); } catch (e) {} }, 2400);
  SFX.clear();
  const b = TR_BARKS[TR.ch];         /* (۱۲٫۰) صدای پایان فرار */
  /* (۲۲٫۰) outro آرایه‌ای = گفتگوی چندخطیِ داستانی — تا پایانش صبر می‌کنیم */
  if (b && Array.isArray(b.outro)) {
    try {
      let sum = 0;
      for (const L of b.outro) sum += ((typeof VOICES22 !== 'undefined' && VOICES22[L.v]) ? VOICES22[L.v].d : 3.2) + 0.7;
      TR.outroDurEff = Math.max(TR.outroDurEff, sum + 2.4);
      TR.outroDlgDone = false;
      DLG.start(b.outro, () => { if (TR) TR.outroDlgDone = true; });
    } catch (e) {}
  } else if (b && b.outro) {
    transBark(b.outro, MGCFG[TR.ch].outroSub, 3.2);
  }
}"""

# امتیاز فرار با ایموجی واقعی (نه escape) — دو نسخه ممکن است در فایل باشد
mg_pat = re.compile(r'function mgOutro\(\) \{.*?\n\}', re.S)
if not mg_pat.search(src):
    print('FAIL: mgOutro not found'); sys.exit(1)
src = mg_pat.sub(lambda m: new_mgOutro, src, count=1)

# ---- ۳) mgOutroUpdate: محو با مدت مؤثر ----
src = src.replace(
  "  cfg.outroUpdate && cfg.outroUpdate(dt);\n  TR.fade = Math.max(TR.fade, clamp((TR.t - (cfg.outroDur - 1.15)) / 1.0, 0, 1));",
  "  cfg.outroUpdate && cfg.outroUpdate(dt);\n  const od = TR.outroDurEff || cfg.outroDur;   /* (۲۲٫۰) مدت مؤثر با گفتگو */\n  TR.fade = Math.max(TR.fade, clamp((TR.t - (od - 1.15)) / 1.0, 0, 1));", 1)

# ---- ۴) فاز ۳: DLG.update + شرط پایان با مدت مؤثر ----
src = src.replace(
  "  } else {\n    mgOutroUpdate(dt);\n    if (TR.t >= MG.cfg.outroDur) finishTransition();\n  }",
  "  } else {\n    DLG.update(dt);                                  /* (۲۲٫۰) گفتگوی چندخطی outro */\n    mgOutroUpdate(dt);\n    if (TR.t >= (TR.outroDurEff || MG.cfg.outroDur) && (TR.outroDlgDone !== false || TR.t > 62)) finishTransition();\n  }", 1)

# ---- ۵) متن‌های MGCFG هماهنگ با داستان جدید ----
src = src.replace("outroSub: '— [ارشان]: انبارهای مه‌گرفته جلوته... رسیدیم!',", "outroSub: '— جاده‌ی شمالی... راهِ کانال باز است',", 1)
src = src.replace("outroSub: '— [ارشان]: دروازه‌ی پاسگاه! از مه داره درمیاد!',", "outroSub: '— ساحلِ اون طرفِ کانال... رسیدیم!',", 1)
src = src.replace("outroSub: '— [ارشان]: دکل مخابراتی! آخرین قله!',", "outroSub: '— برج مخابراتی... آخرین قله!',", 1)
src = src.replace("barkV: 'b1a1', barkT: 'گاز بده! از این کانال فقط یه راه به پاسگاه هست!' },", "barkV: 'b1a1', barkT: 'گاز بده! از این کانال فقط یه راه به اون طرف هست!' },", 1)
src = src.replace("txt: '— [ارشان]: رادیو می‌گه پاسگاه نظامی اون طرفِ کاناله...',", "txt: '— [ارشان]: رادیو می‌گه ایستگاهی اون طرفِ کاناله...',", 1)
src = src.replace("txt: '— [ارشان]: چراغ‌های دروازه رو می‌بینی؟ تقریباً رسیدیم!' },", "txt: '— [ارشان]: چراغ‌های اون طرف رو می‌بینی؟ تقریباً رسیدیم!' },", 1)

open(F, 'w', encoding='utf-8').write(src)
print('OK: v4_transitions.js patched')

# ---- ۶) نام فصل‌های داستان رسمی ----
F2 = '/home/z/my-project/scripts/v4_chapters.js'
s2 = open(F2, encoding='utf-8').read()
subs = [
  ("name: 'محله‌ی قدیمی', sub: 'شب‌های آجری',", "name: 'پناهگاه سه‌طبقه', sub: 'شب‌های آجری',"),
  ("name: 'منطقه‌ی انبارها', sub: 'مهِ صنعتی',", "name: 'مسیر مه‌آلود', sub: 'مهِ صنعتی',"),
  ("name: 'پاسگاه نظامی', sub: 'خرابه‌ها',", "name: 'ایستگاه متروکه', sub: 'خرابه‌ها',"),
  ("name: 'برج مخابراتی', sub: 'آخرین قله',", "name: 'آخرین پناهگاه', sub: 'پشتِ دیوارها',"),
]
n = 0
for a, b in subs:
    if a in s2:
        s2 = s2.replace(a, b, 1); n += 1
    else:
        print(f'WARN: chapter name not found: {a[:30]}')
open(F2, 'w', encoding='utf-8').write(s2)
print(f'OK: chapter names updated ({n}/4)')
