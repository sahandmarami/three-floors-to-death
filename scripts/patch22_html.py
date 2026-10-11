#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""وصله‌ی ۲۲٫۰ — فایل ۵: v3_part1.html (UI)
- منوی اصلی: فشرده + پالت طلاییِ ملایم + کنتراست دکمه‌ها (رفع «منو زشت»)
- ریل چپ (توقف/صدا/چراغ): پس‌زمینه روشن‌تر + قاب طلایی (رفع «دکمه‌ها نامرئی»)
- دکمه‌ی «رد کردن»: طلایی روشن
- جعبه‌ی گفتگو: بالاتر + خواناتر + راهنمای لمسی
- دکمه‌های «ادامه دارد»: شروع دوباره + بازگشت به منو
- متن‌های ایستا: نسخه ۲۲٫۰، «از ۳۶»، داستانِ درباره
"""

F = '/home/z/my-project/scripts/v3_part1.html'
src = open(F, encoding='utf-8').read()
n_applied = 0

def rep(a, b, cnt=1):
    global src, n_applied
    if a in src:
        src = src.replace(a, b, cnt)
        n_applied += 1
        return True
    print(f'WARN not found: {a[:60]!r}')
    return False

# ---- ۱) نسخه و متای ایستا ----
rep('content="سه طبقه تا مرگ — نسخه‌ی ۲۱٫۳: تمام‌صفحه‌ی واقعی روی گوشی (بدون نوار سیاه)، نمایش شارپ با DPR بالا، ۳۶ شب، دستفروش مرموز، مینی‌گیم‌ها و پناهگاه — بهینه برای موبایل و اندروید"',
    'content="سه طبقه تا مرگ — نسخه‌ی ۲۲٫۰: داستان کاملِ چهار فصل با صداهای متمایز شخصیت‌ها، پایان سینمایی، ۳۶ شب، تمام‌صفحه روی گوشی، مینی‌گیم‌ها و پناهگاه — بهینه برای موبایل و اندروید"')
rep('<div class="menu-ver">نسخه‌ی ۲۱٫۳</div>', '<div class="menu-ver">نسخه‌ی ۲۲٫۰</div>')
rep('تا شب ۱ از ۲۸ دوام آوردی', 'تا شب ۱ از ۳۶ دوام آوردی')

# ---- ۲) دکمه‌های «ادامه دارد»: شروع دوباره + بازگشت ----
rep('''<div class="btn-row tbc-row" id="tbcRow">
        <button class="btn-main" id="tbcContinue">🏠 بازگشت به منوی اصلی</button>
        <button class="btn-sec btn-tbc-stats" id="tbcStats">🏅 کارنامه‌ی نبرد</button>
      </div>''',
'''<div class="btn-row tbc-row" id="tbcRow">
        <button class="btn-main" id="tbcRestart">🔄 شروع دوباره</button>
        <button class="btn-sec" id="tbcContinue">🏠 بازگشت به منوی اصلی</button>
        <button class="btn-sec btn-tbc-stats" id="tbcStats">🏅 کارنامه‌ی نبرد</button>
      </div>''')

# ---- ۳) متن «درباره» — داستان رسمی ۲۲ ----
about_pat_start = src.find('<div class="howto" style="text-align:right">')
about_pat_end = src.find('</div>', src.find('about-credit', about_pat_start)) if about_pat_start >= 0 else -1
if about_pat_start >= 0 and about_pat_end > about_pat_start:
    end = src.find('</div>', about_pat_end)  # بستن about-credit
    NEW_ABOUT = '''<div class="howto" style="text-align:right">
        <div>همه‌چیز از یک بیماری ناشناخته شروع شد؛ خیابان‌ها یکی‌یکی ساکت شدند و شهرها بی‌صدا از پا درآمدند.</div>
        <div>تویی و <b>ارشان</b> — دو بازمانده‌ای که ساختمان سه‌طبقه‌ای نیمه‌کاره را پیدا کردند و از آن پناهگاهی ساختند: <b>برج سه‌طبقه</b>.</div>
        <div>سی‌وشش شبِ دفاع، پیام‌های ناقصِ بی‌سیم، عبور از کانالِ مه‌گرفته، ایستگاه متروکه و برج مخابراتی...</div>
        <div>و در انتها: پناهگاه جنوبی، دکتر مریم، و موجی که هنوز تمام نشده است.</div>
        <div style="color:#eef3ff;font-style:italic">این داستان ادامه دارد...</div>
        <div class="about-credit">ساخته شده توسط <b>سهند مرامی</b></div>
      </div>'''
    # جایگزینی بلوک قدیمی (از howto تا about-credit بسته)
    block_end = src.find('</div>', src.find('about-credit', about_pat_start))
    block_end = src.find('</div>', block_end + 1) if block_end >= 0 else -1
    if block_end >= 0:
        src = src[:about_pat_start] + NEW_ABOUT + src[block_end + len('</div>'):]
        n_applied += 1

# ---- ۴) بلوک CSS بازطراحی ۲۲ (override در انتهای استایل‌ها) ----
CSS22 = '''
/* ==================================================================
   نسخه‌ی ۲۲٫۰ — بازطراحی بصری (رفع بازخوردهای کاربر از گوشی واقعی)
   · منو: فشرده‌تر، طلاییِ ملایم، دکمه‌ی ادامه پررنگ — بدون فضای خالی
   · ریل چپ: پس‌زمینه/قاب روشن — دکمه‌ها کاملاً مرئی در شب
   · «رد کردن» و جعبه‌ی گفتگو: کنتراست بالا + مناسب لمس
   ================================================================== */
/* --- منوی اصلی --- */
#menuHero{padding:18px 18px 0}
.menu-frame{padding:20px 30px 15px;border-radius:20px;
  border-color:rgba(232,181,74,.52)}
.menu-ver{font-size:9.5px;padding:2px 12px;top:-10px;color:#ffe1a0;
  background:linear-gradient(180deg,rgba(30,22,8,.94),rgba(18,13,5,.94));
  border:1px solid rgba(232,181,74,.55);box-shadow:0 3px 12px rgba(0,0,0,.55)}
.game-title{font-size:50px;line-height:1.24;
  filter:drop-shadow(0 3px 8px rgba(0,0,0,.85))}
.game-title .t-red{color:#ff6a52;text-shadow:0 0 14px rgba(255,80,50,.38),0 2px 6px rgba(0,0,0,.9)}
.menu-tagline{margin-top:5px;font-size:13px;color:#c6d3f0;text-shadow:0 1px 3px #000,0 2px 8px rgba(0,0,0,.95)}
.menu-divider{width:220px;margin:9px auto 4px;opacity:.5}
.menu-btns{margin-top:12px;gap:10px}
.btn-main{font-size:15.5px;padding:11px 30px;border-radius:12px;
  background:linear-gradient(180deg,#f6cd6b,#dea032);
  box-shadow:0 5px 20px rgba(220,150,40,.4),inset 0 1px 0 rgba(255,255,255,.5)}
.btn-big{font-size:17.5px;padding:13px 44px;border-radius:13px;
  box-shadow:0 6px 24px rgba(220,150,40,.45),inset 0 1px 0 rgba(255,255,255,.55)}
@keyframes btnGlow{0%,100%{box-shadow:0 6px 24px rgba(220,150,40,.4),inset 0 1px 0 rgba(255,255,255,.55)}
  50%{box-shadow:0 8px 34px rgba(255,205,90,.62),inset 0 1px 0 rgba(255,255,255,.55)}}
.mbtn{min-width:262px;font-size:14.5px;padding:11px 20px;border-radius:11px;
  background:linear-gradient(180deg,rgba(38,56,100,.96),rgba(24,36,68,.96));
  border:1px solid #5b7ac0;color:#eaf1ff;box-shadow:0 4px 16px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.1)}
.mbtn:not(:disabled):hover{border-color:#ffd873;color:#fff;
  box-shadow:0 5px 22px rgba(232,181,74,.35),inset 0 1px 0 rgba(255,255,255,.14)}
.mbtn:disabled{opacity:.62}
.menu-mini{gap:8px;margin-top:9px}
.mini-btn{background:rgba(26,38,74,.95);border:1px solid #4d6cb4;color:#e6edfc;padding:8px 18px}
.menu-stats{margin-top:10px;gap:7px}
.menu-foot{margin-top:10px;font-size:10px;color:#93a0c0;letter-spacing:.4px;
  background:rgba(6,10,22,.62);border-radius:999px;padding:4px 16px;display:inline-block;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.05)}
#wrap.touch .game-title{font-size:40px}
#wrap.touch .btn-big{font-size:17px;padding:14px 40px}
#wrap.touch .menu-frame{padding:16px 16px 12px}

/* --- ریل چپ: دکمه‌های کاملاً مرئی --- */
.ctl-btn{width:44px;height:44px;border-radius:14px;font-size:19px;
  background:linear-gradient(180deg,rgba(38,55,98,.97),rgba(22,33,62,.97));
  border:1.5px solid #6f8fd4;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.16),0 4px 14px rgba(0,0,0,.6),0 0 0 1px rgba(0,0,0,.35)}
.ctl-btn:hover{background:linear-gradient(180deg,rgba(52,74,128,.98),rgba(32,47,86,.98));
  border-color:#ffd873}
.ctl-btn:active{transform:scale(.93)}
#wrap.touch .ctl-btn{width:50px;height:50px;font-size:21px}

/* --- «رد کردن» کات‌سین: طلایی واضح --- */
#skipCs{font-size:13.5px;color:#241a06;font-weight:900;
  background:linear-gradient(180deg,#f6cd6b,#dea032);border:1.5px solid #ffd873;
  border-radius:999px;padding:9px 22px;
  box-shadow:0 5px 18px rgba(0,0,0,.55),0 0 16px rgba(255,200,90,.28)}
#skipCs:hover{filter:brightness(1.08);color:#1a1206;transform:translateY(-1px)}

/* --- جعبه‌ی گفتگو: بالاتر و خواناتر --- */
#dlgBox{bottom:30px}
#dlgTextWrap{border:1.5px solid #6f8fd4;padding:10px 18px 12px;
  box-shadow:0 12px 38px rgba(0,0,0,.78),0 0 0 1px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.1)}
#dlgPortrait{border:2.5px solid #ffd873}
#dlgWho{font-size:13px}
#dlgText{font-size:16px}
#dlgHint{font-size:10px;color:#b9c8ea}
#wrap.touch #dlgText{font-size:17px}
@media (max-height:430px){
  #dlgBox{bottom:20px}
}

/* --- پنل ساخت‌وساز: قاب مرئی‌تر --- */
#buildPanel{border-color:rgba(111,143,212,.75)}
.bp-tab{border:1.5px solid #4d6cb4}
.bp-tile{border:1.5px solid #46609e}

/* --- «ادامه دارد»: دکمه‌ی اصلی درشت --- */
.tbc-row .btn-main{font-size:15.5px;padding:12px 30px}
.tbc-row{gap:8px}
'''
# درج قبل از </style>
style_end = src.find('</style>')
if style_end < 0:
    print('FAIL: no </style>'); raise SystemExit(1)
src = src[:style_end] + CSS22 + '\n' + src[style_end:]
n_applied += 1

open(F, 'w', encoding='utf-8').write(src)
print(f'OK: v3_part1.html patched ({n_applied} edits)')
