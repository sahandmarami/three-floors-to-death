#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""v23 — وصله‌ی یکپارچه‌سازی همه‌ی تغییرات نسخه‌ی ۲۳٫۰
منبع دیالوگ: scripts/dialogues23.json (۱۱۹ خط)
فایل‌های تغییر یافته:
  v4_story22.js    — بازتولید STORY22 (متن‌های کوتاه جدید)
  v4_transitions.js — بازتولید TR_DLGS + TR_BARKS
  v4_survival.js   — خطوط دستفروش + bark برق
  v4_intro_menu.js — INTRO_SCENES → صحنه‌های موشن‌گرافیک + INTRO_DLGS جدید + لتربوکس ۴۲
  v3_part3.js      — شاخه‌ی منوی جدید در render + قلاب‌های M23/DEPTH23/MYST
  v4_audio.js      — VOICES23
  v3_part2.js      — شروع خودکار موسیقی
  v4_arshan.js     — حذف شاخه‌های aw3/aw6
  v4_final.js      — متن‌های bark نگهبان
  v3_part1.html    — منوی DOM جدید + CSS (بخش ۲ این اسکریپت: patch23b.py)
"""
import json, re, sys

BASE = '/home/z/my-project/scripts/'
D = json.load(open(BASE + 'dialogues23.json', encoding='utf-8'))

def L(k):   # خط دیالوگ با کلید
    return D[k]

def jsline(k):
    d = D[k]
    return "    { who: '%s', v: '%s', text: '%s' }," % (d['who'], k, d['fa'].replace("'", "\\'"))

def arr(keys, indent='  '):
    return '\n'.join(jsline(k) for k in keys)

def rd(f):
    return open(BASE + f, encoding='utf-8').read()

def wr(f, s):
    open(BASE + f, 'w', encoding='utf-8').write(s)

def rep(src, old, new, f, must=True, count=1):
    if old not in src:
        if must:
            print(f'!! ANCHOR MISSING in {f}: {old[:70]!r}')
            sys.exit(1)
        return src
    return src.replace(old, new, count)

# ================================================================
# ۱) v4_story22.js — بازتولید کامل داده‌ی STORY22
# ================================================================
s = rd('v4_story22.js')
start = s.index('const STORY22 = {};')
end = s.index('/* ---------- ۲۲-۲) قلاب‌ها ---------- */')
story_new = f'''/* ---------- ۲۲-۱) داده‌ی گفتگوها — (۲۳٫۰) بازنویسی کامل: کوتاه و TLOU-سبک ---------- */
const STORY22 = {{}};

/* فصل ۱ — پس از موج‌ها */
STORY22.afterWave = {{
  1: [
{arr(['c1w1a', 'c1w1b'])}
  ],
  2: [
{arr(['c1w2a', 'c1w2b'])}
  ],
  3: [
{arr(['c1w3a', 'c1w3b'])}
  ],
  4: [
{arr(['c1w4a', 'c1w4b', 'c1w4r', 'c1w4c', 'c1w4d'])}
  ],
  5: [
{arr(['c1w5a', 'c1w5b'])}
  ],
  /* فصل ۳ — یافتن سرنخ (نقشه‌ی برج مخابراتی) */
  18: [
{arr(['c3ca', 'c3cb', 'c3cd'])}
  ],
}};

/* پیش از آخرین موجِ هر فصل */
STORY22.preFinalWave = {{
  6: [
{arr(['c1e1a', 'c1e1b', 'c1e1d'])}
  ],
  36: [
{arr(['c4f1', 'c4f2', 'c4f3', 'c4f7'])}
  ],
}};

/* پایان فصل‌ها */
STORY22.chEnd = {{
  1: [
{arr(['c1er', 'c1ea', 'c1eb', 'c1ed'])}
  ],
  2: [
{arr(['c2ea', 'c2eb', 'c2ed', 'c2em', 'c2eo'])}
  ],
  3: [
{arr(['c3ea', 'c3eb', 'c3ed'])}
  ],
}};

/* پیام پایان فصل */
STORY22.chEndMsg = {{
  1: 'فصل اول به پایان رسید. مقصد بعدی: کانال شمالی.',
  2: 'فصل دوم به پایان رسید. مقصد بعدی: ایستگاه متروکه.',
  3: 'فصل سوم به پایان رسید. مقصد نهایی: پناهگاه جنوبی.',
}};

/* شروع فصل ۳ */
STORY22.chStart = {{
  3: [
{arr(['c3n1', 'c3a1', 'c3p1'])}
  ],
}};

/* فصل ۴ — رسیدن به پناهگاه */
STORY22.shelterArrive = [
{arr(['c4n1', 'c4a1', 'c4p1', 'c4m1', 'c4m2', 'c4p3', 'c4a3'])}
];

/* پس از موج نهایی */
STORY22.afterFinal = [
{arr(['c4v1', 'c4v2', 'c4v3'])}
];

STORY22.radioAlarm = [
{arr(['c4vr', 'c4v4', 'c4v5', 'c4v6', 'c4v8'])}
];

/* پایان سینمایی */
STORY22.ending = [
{arr(['e1n', 'e2a', 'e3p', 'e4n'])}
];

/* گفتگوی «پیش از موج اول» */
STORY22.preWave1 = [
{arr(['w1a', 'w1b', 'w1d'])}
];

'''
s = s[:start] + story_new + s[end:]
wr('v4_story22.js', s)
print('✓ v4_story22.js — STORY22 regenerated')

# ================================================================
# ۲) v4_transitions.js — TR_DLGS + TR_BARKS
# ================================================================
s = rd('v4_transitions.js')
start = s.index('const TR_DLGS = {')
end = s.index('/* صدای کوتاه + زیرنویس انتقال')
tr_new = f'''const TR_DLGS = {{
  /* (۲۳٫۰) فصل ۱→۲: فروریختن برج */
  1: [
{arr(['t1a1', 't1n1'])}
  ],
  /* (۲۳٫۰) فصل ۲→۳: پیش از عبور از کانال */
  2: [
{arr(['tb2p1', 'tb2p4'])}
  ],
  /* (۲۳٫۰) فصل ۳→۴: مسیر سرد */
  3: [
{arr(['t3h1', 't3h4'])}
  ],
}};
/* (۲۳٫۰) outro = آرایه‌ی خطوط گفتگو */
const TR_BARKS = {{
  1: {{ catch: {{ who: 'a', v: 'tb1c', text: '{L('tb1c')['fa'].replace("'", chr(92)+chr(39))}' }},
       start: {{ who: 'a', v: 'tb1s', text: '{L('tb1s')['fa'].replace("'", chr(92)+chr(39))}' }},
       outro: [
{arr(['t2n1', 't2a1', 't2p1', 't2p2'])}
       ] }},
  2: {{ catch: null,
       start: {{ who: 'a', v: 'tb2s', text: '{L('tb2s')['fa'].replace("'", chr(92)+chr(39))}' }},
       outro: [
{arr(['tb2o1', 'tb2o2', 'tb2o4'])}
       ] }},
  3: {{ catch: null,
       start: {{ who: 'a', v: 'tb3s', text: '{L('tb3s')['fa'].replace("'", chr(92)+chr(39))}' }},
       outro: [
{arr(['t3r1', 't3r2', 't3rr', 't3r4'])}
       ] }},
}};
/* (۲۳٫۰) بارک‌های مینی‌گیم‌ها */
const TR_MINI = {{
  drive: {{ hidden: {{ v: 'd1a2', text: '{L('d1a2')['fa'].replace("'", chr(92)+chr(39))}' }},
           bark: {{ v: 'd1a1', text: '{L('d1a1')['fa'].replace("'", chr(92)+chr(39))}' }} }},
  boat:  {{ hidden: {{ v: 'b1a2', text: '{L('b1a2')['fa'].replace("'", chr(92)+chr(39))}' }},
           bark: {{ v: 'b1a1', text: '{L('b1a1')['fa'].replace("'", chr(92)+chr(39))}' }} }},
  snow:  {{ hidden: {{ v: 's1a2', text: '{L('s1a2')['fa'].replace("'", chr(92)+chr(39))}' }},
           bark: {{ v: 's1a1', text: '{L('s1a1')['fa'].replace("'", chr(92)+chr(39))}' }} }},
}};
'''
s = s[:start] + tr_new + s[end:]
# جایگزینی متن‌های hardcoded داخل آبجکت‌های مینی‌گیم (دو الگو: hiddenBark/barkV)
s = rep(s, "hiddenBark: { v: 'd1a2', text: 'اون طرف یه جعبه دیدم! بگیرش!' },",
        "hiddenBark: { v: 'd1a2', text: '%s' }," % L('d1a2')['fa'].replace("'", "\\'"), 'v4_transitions.js')
s = rep(s, "barkV: 'd1a1', barkT: 'مواظب باش! تا انبارها یه راه باقی مونده!' },",
        "barkV: 'd1a1', barkT: '%s' }," % L('d1a1')['fa'].replace("'", "\\'"), 'v4_transitions.js')
s = rep(s, "hiddenBark: { v: 'b1a2', text: 'اون آخرِ کانال یه چراغ چشمک می‌زنه! نزدیکش شو!' },",
        "hiddenBark: { v: 'b1a2', text: '%s' }," % L('b1a2')['fa'].replace("'", "\\'"), 'v4_transitions.js')
s = rep(s, "barkV: 'b1a1', barkT: 'گاز بده! از این کانال فقط یه راه به اون طرف هست!' },",
        "barkV: 'b1a1', barkT: '%s' }," % L('b1a1')['fa'].replace("'", "\\'"), 'v4_transitions.js')
s = rep(s, "hiddenBark: { v: 's1a2', text: 'اون بالا یه جعبه دیدم! بهش نزدیک شو!' },",
        "hiddenBark: { v: 's1a2', text: '%s' }," % L('s1a2')['fa'].replace("'", "\\'"), 'v4_transitions.js')
s = rep(s, "barkV: 's1a1', barkT: 'توفان برف میاد! تو رگبارش گاز نده!' },",
        "barkV: 's1a1', barkT: '%s' }," % L('s1a1')['fa'].replace("'", "\\'"), 'v4_transitions.js')
wr('v4_transitions.js', s)
print('✓ v4_transitions.js — TR data regenerated')

# ================================================================
# ۳) v4_survival.js — دستفروش + sbo1
# ================================================================
s = rd('v4_survival.js')
old_ped = """    const opens = [
      'شب نزدیک است... و من کالایی کمیاب دارم؛ فقط برای تو.',
      'الهی خیالت راحت! کالای دستِ اولِ قبل از فاجعه — نگاهی بنداز.',
      'مممم... فیلترم تازه عوض شده. کالای تمیز و کمیاب داری؟ بگو ببینم.',
      'عجله کن! باران که بگیرد، جاده بسته می‌شود — کالای کمیاب آورده‌ام!',
      'زنگ زدی نیامدم، خودم آمدم! قفسه‌ی چرخ هم پُر است — ببین بخری.',
    ];
    const lines = [
      { who: 'd', v: 'pd1a' + (this.look % 5), text: opens[this.look % opens.length] },
      { who: 'p', v: 'pd1b', text: 'کالای کمیاب؟ از کجا معلوم تقلبی نباشد؟' },
      { who: 'd', v: this.look === 2 ? 'pd1c2' : 'pd1c', text: this.look === 2
          ? 'هیچ‌چیز معلوم نیست... اما تا غروب، این‌جا هستم. زود انتخاب کن.'
          : 'هیچ‌چیز در این روزها معلوم نیست... اما تا غروب، این‌جا هستم. زود انتخاب کن.' },
    ];"""
new_ped = """    /* (۲۳٫۰) خطوط دستفروش — هماهنگ با voices23 (کلیدهای موجود) */
    const lines = [
      { who: 'd', v: 'pd1a1', text: '%s' },
      { who: 'p', v: 'pd1b', text: '%s' },
      { who: 'd', v: 'pd1c', text: '%s' },
    ];""" % (
    L('pd1a1')['fa'].replace("'", "\\'"),
    L('pd1b')['fa'].replace("'", "\\'"),
    L('pd1c')['fa'].replace("'", "\\'"),
)
s = rep(s, old_ped, new_ped, 'v4_survival.js')
s = rep(s, "try { VOICE.speak('غروب شد... باید رفت. شاید باز هم یکدیگر را ببینیم.', 'd', 'pd1l'); } catch (e) {}",
        "try { VOICE.speak('%s', 'd', 'pd1l'); } catch (e) {}" % L('pd1l')['fa'].replace("'", "\\'"),
        'v4_survival.js')
s = rep(s, "try { bark('sbo1', 'p', 'وای... برق رفت! چراغ‌قوه رو روشن کن!', '🔌 برق رفت!',",
        "try { bark('sbo1', 'p', '%s', '🔌 برق رفت!'," % L('sbo1')['fa'].replace("'", "\\'"),
        'v4_survival.js')
wr('v4_survival.js', s)
print('✓ v4_survival.js — peddler/sbo1 synced')

# ================================================================
# ۴) v4_intro_menu.js — INTRO_SCENES + INTRO_DLGS + لتربوکس
# ================================================================
s = rd('v4_intro_menu.js')
old_sc = """const INTRO_SCENES = [
  { dur: 5,  draw: introScCity },      // ۱: شهر در غروبِ خالی‌شدن + گپِ راه
  { dur: 6,  draw: introScStreet },    // ۲: خیابان متروک — صدای زامبی نزدیک شد
  { dur: 6,  draw: introScBuild },     // ۳: ساختمان سه‌طبقه‌ی نیمه‌کاره پیدا شد
  { dur: 6,  draw: introScNight },     // ۴: آماده‌سازی پناهگاه — اولین شب نزدیک است
];"""
new_sc = """/* (۲۳٫۰) صحنه‌های موشن‌گرافیک — v4_cine23.js */
const INTRO_SCENES = [
  { dur: 7,  draw: introScCityMG },    // ۱: شهر در حال خالی‌شدن — دو بازمانده در راه
  { dur: 7,  draw: introScStreetMG },  // ۲: کوچه‌ی تاریک — صدای زامبی نزدیک می‌شود
  { dur: 8,  draw: introScFindMG },    // ۳: پیدا کردن ساختمانِ موجودِ نیمه‌کاره (نه ساخت!)
  { dur: 9,  draw: introScFortMG },    // ۴: استحکام‌بخشی — تخته‌کوبی + اولین شب
];"""
s = rep(s, old_sc, new_sc, 'v4_intro_menu.js')

# INTRO_DLGS بازتولید — از علامت شروع تا پایان آرایه
start = s.index('const INTRO_DLGS = [')
end = s.index('];/* (۱۱٫۰) INTRO_SUBS حذف شد')
def dl(k):
    d = D[k]
    return "{ who: '" + d['who'] + "', v: '" + k + "', text: '" + d['fa'].replace("'", chr(92) + chr(39)) + "' }"

def dlgarr(keys):
    return '  [ ' + ',\n    '.join(dl(k) for k in keys) + ' ],\n'

intro_new = 'const INTRO_DLGS = [\n'
intro_new += dlgarr(['i1n', 'i2n', 'i3a', 'i4p'])
intro_new += dlgarr(['i7a', 'i8p'])
intro_new += dlgarr(['i9a', 'i10p', 'i13a', 'i14p'])
intro_new += dlgarr(['i15a', 'i16p', 'i19a', 'i20p'])
s = s[:start] + intro_new + s[end:]

# لتربوکس ۲۸ → ۴۲
s = rep(s, "  /* نوارهای سینمایی */\n  ctx.fillStyle = '#000';\n  ctx.fillRect(0, 0, W, 28);\n  ctx.fillRect(0, H - 28, W, 28);",
        "  /* (۲۳٫۰) نوارهای سینمایی پهن‌تر */\n  ctx.fillStyle = '#000';\n  ctx.fillRect(0, 0, W, 42);\n  ctx.fillRect(0, H - 42, W, 42);", 'v4_intro_menu.js')
wr('v4_intro_menu.js', s)
print('✓ v4_intro_menu.js — scenes + dialogues + letterbox')

# ================================================================
# ۵) v3_part3.js — شاخه‌ی منو + قلاب‌های رندر
# ================================================================
s = rd('v3_part3.js')
# ۵-۱) شاخه‌ی منوی جدید: else پایانی → منو یا دنیا
old_else = "  } else {\n  /* (۱۸٫۱) پس‌زمینه‌ی پخته: ۴ لایه‌ی ایستا فقط blit می‌شوند — به‌جای"
new_else = """  } else if (state.mode === 'start') {
    /* (۲۳٫۰) منوی اصلی جدید: صحنه‌ی سینمایی اختصاصی — به‌جای دنیای بازی */
    drawMenuScene23();
  } else {
  /* (۱۸٫۱) پس‌زمینه‌ی پخته: ۴ لایه‌ی ایستا فقط blit می‌شوند — به‌جای"""
s = rep(s, old_else, new_else, 'v3_part3.js')
# ۵-۲) حذف drawMenuFX قدیمی از render (صحنه‌ی جدید خودش همه‌چیز را دارد)
s = rep(s, "  if (state.mode === 'start') drawMenuFX();", "  /* (۲۳٫۰) منوی جدید همه‌چیز را خودش رسم می‌کند */", 'v3_part3.js')
# ۵-۳) قلاب‌های DEPTH23 + MYST بعد از گریدینگ
s = rep(s, "  /* گریدینگ رنگی سینمایی (۶٫۰): تینت سرمای شب + گرمای روز + وینیت نرم */\n  drawColorGrade();",
        """  /* گریدینگ رنگی سینمایی (۶٫۰): تینت سرمای شب + گرمای روز + وینیت نرم */
  drawColorGrade();
  /* (۲۳٫۰) عمق ۲.۵بعدی + لایه‌ی معما: نور/مه/AO/باران + نشانگرهای شنود */
  try { DEPTH23.post(); } catch (e) {}
  try { MYST.render(); } catch (e) {}""", 'v3_part3.js')
# ۵-۴) قلاب به‌روزرسانی منو
s = rep(s, "  menuFxT += dt;                                 /* (۲۱٫۱) زمانِ جوّ منو (نور پنجره‌ها/مه) */",
        "  menuFxT += dt;                                 /* (۲۱٫۱) زمانِ جوّ منو */\n  try { M23.update(dt); } catch (e) {}            /* (۲۳٫۰) صحنه‌ی منوی جدید */", 'v3_part3.js')
# ۵-۵) ورود به منو → موسیقی خودکار
s = rep(s, "function initMenuZ() {",
        """function menuEnter23() { try { menu23Enter(); } catch (e) {} }
function initMenuZ() {""", 'v3_part3.js', must=False)
wr('v3_part3.js', s)
print('✓ v3_part3.js — render branches + hooks')

# ================================================================
# ۶) v4_audio.js — VOICES23
# ================================================================
s = rd('v4_audio.js')
s = s.replace('VOICES22', 'VOICES23')
# سرصفحه فایل
s = rep(s, "   - VOICE (۱۴٫۰ بازطراحی — متن دقیقاً هم‌زمان با صدا):",
        "   - (۲۳٫۰) صداهای ElevenLabs v3 — ۷ صدای متمایز شخصیت‌ها (voices23_data.js)\n   - VOICE (۱۴٫۰ بازطراحی — متن دقیقاً هم‌زمان با صدا):", 'v4_audio.js', must=False)
wr('v4_audio.js', s)
print('✓ v4_audio.js — VOICES23')

# ================================================================
# ۷) v3_part2.js — شروع خودکار موسیقی
# ================================================================
s = rd('v3_part2.js')
old_arm = """/* فعال‌سازی صدا با اولین تعامل کاربر (سیاست autoplay مرورگرها) */
const armAudio = () => { Snd.init(); Snd.resume(); try { VOICE.warmup(); } catch (e) {} };
window.addEventListener('pointerdown', armAudio, { passive: true });
window.addEventListener('keydown', armAudio);"""
new_arm = """/* فعال‌سازی صدا با اولین تعامل کاربر (سیاست autoplay مرورگرها) */
const armAudio = () => {
  Snd.init(); Snd.resume();
  try { VOICE.warmup(); } catch (e) {}
  /* (۲۳٫۰) اگر موسیقی منتظرِ آماده‌شدن صدا مانده باشد، همین‌جا شروع شود */
  try { if (typeof MUSIC !== 'undefined' && MUSIC.track && !MUSIC.timer) MUSIC._start(MUSIC.track); } catch (e) {}
};
window.addEventListener('pointerdown', armAudio, { passive: true });
window.addEventListener('keydown', armAudio);
/* (۲۳٫۰) شروعِ خودکار موسیقی منو:
   - اندروید WebView: autoplay فعال است → بلافاصله پخش می‌شود
   - مرورگر: با اولین هرگونه لمس/کلیک (نه فقط دکمه) شروع می‌شود */
(function autoMusic23() {
  const tryStart = () => {
    try {
      if (typeof MUSIC !== 'undefined' && Snd.ready && MUSIC.track && !MUSIC.timer) MUSIC._start(MUSIC.track);
    } catch (e) {}
  };
  window.addEventListener('pointerdown', tryStart, { passive: true });
  window.addEventListener('touchstart', tryStart, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) { try { Snd.resume(); } catch (e) {} tryStart(); }
  });
  setTimeout(() => {
    try {
      Snd.init();
      if (Snd.ctx) {
        if (Snd.ctx.state === 'running') tryStart();
        else Snd.ctx.onstatechange = () => { if (Snd.ctx && Snd.ctx.state === 'running') tryStart(); };
      }
    } catch (e) {}
  }, 300);
})();"""
s = rep(s, old_arm, new_arm, 'v3_part2.js')
wr('v3_part2.js', s)
print('✓ v3_part2.js — music autostart')

# ================================================================
# ۸) v4_arshan.js — حذف aw3/aw6 (کلیپ حذف‌شده)
# ================================================================
s = rd('v4_arshan.js')
s = rep(s, "      if (!key && !ARSHAN.flags.kills && state.stats.kills - ARSHAN.killsMark >= 15) key = 'aw3';",
        "      /* (۲۳٫۰) aw3 حذف شد — صدای متناظر بازنویسی/حذف شد */", 'v4_arshan.js', must=False)
s = rep(s, "      if (!key && !ARSHAN.flags.start && alive.length > 0) key = 'aw1';",
        "      if (!key && !ARSHAN.flags.start && alive.length > 0) key = 'aw1';", 'v4_arshan.js', must=False)
wr('v4_arshan.js', s)
print('✓ v4_arshan.js — aw3 branch removed')

# ================================================================
# ۹) v4_final.js + v3_part3.js — متن‌های bark نگهبان
# ================================================================
s = rd('v4_final.js')
s = rep(s, "try { bark('fbw1', 'a', 'آوارها رو بترکون! نذار به برج بخورن!', '🎯 [ارشان]: آوارها رو بترکون!', 'گلوله‌ات آوارِ پرتابی را در هوا می‌ترکاند — نذار به بام بخوره!', 3); } catch (e) {}",
        "try { bark('fbw1', 'a', '%s', '🎯 [ارشان]: آوارها رو بترکون!', 'گلوله‌ات آوارِ پرتابی را در هوا می‌ترکاند — نذار به بام بخوره!', 3); } catch (e) {}" % L('fbw1')['fa'].replace("'", "\\'"), 'v4_final.js')
s = rep(s, "try { bark('fbz1', 'a', 'برجک‌ها روی زره‌ش زیاد اثر ندارن! خودت باید بزنی!', '🛡 [ارشان]: زره‌ش برجک‌ها رو پس می‌زنه!', 'گلوله‌ی برجک‌ها روی زره‌اش ×۰٫۳۳ اثر دارد — تیرِ خودت را نگه‌دار برای او!', 3.4); } catch (e) {}",
        "try { bark('fbz1', 'a', '%s', '🛡 [ارشان]: زره‌ش برجک‌ها رو پس می‌زنه!', 'گلوله‌ی برجک‌ها روی زره‌اش ×۰٫۳۳ اثر دارد — تیرِ خودت را نگه‌دار برای او!', 3.4); } catch (e) {}" % L('fbz1')['fa'].replace("'", "\\'"), 'v4_final.js')
s = rep(s, "try { bark('fb1b1', 'b', 'زره... سنگین... کن!', '🛡 فاز دوم: زره سنگین!', 'زره‌اش ضخیم‌تر شد و یورش می‌آورد — با آتش متمرکز یورشش را بشکن!', 2.8); } catch (e) {}",
        "try { bark('fb1b1', 'b', '%s', '🛡 فاز دوم: زره سنگین!', 'زره‌اش ضخیم‌تر شد و یورش می‌آورد — با آتش متمرکز یورشش را بشکن!', 2.8); } catch (e) {}" % L('fb1b1')['fa'].replace("'", "\\'"), 'v4_final.js')
s = rep(s, "try { bark('fb1b2', 'b', 'خشم... من!', '🔥 نگهبان خشمگین شد!', 'سریع‌تر شد و بیشتر می‌کوبد — مراقب بام باش!', 2.6); } catch (e) {}",
        "try { bark('fb1b2', 'b', '%s', '🔥 نگهبان خشمگین شد!', 'سریع‌تر شد و بیشتر می‌کوبد — مراقب بام باش!', 2.6); } catch (e) {}" % L('fb1b2')['fa'].replace("'", "\\'"), 'v4_final.js')
s = rep(s, "try { bark('fbz2', 'a', 'مواظب باش! داره شارژ می‌کنه! بزن بهش!', '⚡ [ارشان]: یورش می‌کنه!', 'با آتش متمرکز یورشش را قطع کن — وگرنه برج را می‌کوبد!', 2.2); } catch (e) {}",
        "try { bark('fbz2', 'a', '%s', '⚡ [ارشان]: یورش می‌کنه!', 'با آتش متمرکز یورشش را قطع کن — وگرنه برج را می‌کوبد!', 2.2); } catch (e) {}" % L('fbz2')['fa'].replace("'", "\\'"), 'v4_final.js')
wr('v4_final.js', s)

s = rd('v3_part3.js')
s = rep(s, "try { bark('fbw2', 'a', 'نگهبانِ آخرین شب داره میاد!', '🌑 زمین می‌لرزه...', 'نگهبانِ آخرین شب داره میاد!', 2.6); } catch (e) {",
        "try { bark('fbw2', 'a', '%s', '🌑 زمین می‌لرزه...', '%s', 2.6); } catch (e) {" % (L('fbw2')['fa'].replace("'", "\\'"), L('fbw2')['fa'].replace("'", "\\'")), 'v3_part3.js')
wr('v3_part3.js', s)
print('✓ boss barks synced')

# ================================================================
# ۱۰) نسخه‌ها
# ================================================================
s = rd('v3_part1.html')
s = s.replace('نسخه‌ی ۲۲٫۰', 'نسخه‌ی ۲۳٫۰').replace('نسخه ۲۲٫۰', 'نسخه ۲۳٫۰')
wr('v3_part1.html', s)
print('✓ version strings 23.0')
print('\n== patch23 part 1 done — run patch23b.py for HTML/CSS ==')
