#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""v25 — رفع override های قدیمی گفتگو: قواعد انتهایی و media کوتاه با uiz"""
S = '/home/z/my-project/scripts/'

def patch(fn, pairs):
    path = S + fn
    data = open(path, encoding='utf-8').read()
    for old, new, cnt in pairs:
        n = data.count(old)
        assert n >= cnt, f'{fn}: «{old[:60]}» فقط {n} بار (انتظار ≥{cnt})'
        data = data.replace(old, new)
    open(path, 'w', encoding='utf-8').write(data)
    print(f'{fn}: OK')

# ---------- قواعد انتهایی «جعبه‌ی گفتگو: بالاتر و خواناتر» با uiz ----------
patch('v3_part1.html', [
    ("""/* --- جعبه‌ی گفتگو: بالاتر و خواناتر --- */
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
}""",
     """/* --- جعبه‌ی گفتگو: بالاتر و خواناتر — (۲۵٫۰) همه با مقیاس uiz اندروید --- */
#dlgBox{bottom:calc(26px * var(--uiz,1))}
#dlgTextWrap{border:1.5px solid #6f8fd4;padding:calc(11px * var(--uiz,1)) calc(18px * var(--uiz,1)) calc(13px * var(--uiz,1));
  box-shadow:0 12px 38px rgba(0,0,0,.78),0 0 0 1px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.1)}
#dlgPortrait{border:2.5px solid #ffd873}
#dlgWho{font-size:calc(13.5px * var(--uiz,1))}
#dlgText{font-size:calc(17.5px * var(--uiz,1))}
#dlgHint{font-size:calc(10.5px * var(--uiz,1));color:#b9c8ea}
#wrap.touch #dlgText{font-size:calc(18.5px * var(--uiz,1))}
@media (max-height:430px){
  /* (۲۵٫۰) صفحه‌های کوتاه: فشرده اما باز هم درشت و لمسی */
  #dlgPortrait{width:calc(94px * var(--uiz,1));height:calc(94px * var(--uiz,1))}
  #dlgTextWrap{min-width:calc(270px * var(--uiz,1));max-width:calc(560px * var(--uiz,1));
    padding:calc(9px * var(--uiz,1)) calc(14px * var(--uiz,1)) calc(11px * var(--uiz,1))}
  #dlgText{font-size:calc(15.5px * var(--uiz,1));line-height:1.75;min-height:calc(27px * var(--uiz,1))}
  #dlgBox{bottom:calc(18px * var(--uiz,1))}
}""", 1),
])

# ---------- media کوتاهِ ابتدای فایل هم با uiz ----------
patch('v3_part1.html', [
    ("""@media (max-height:430px){
  #dlgPortrait{width:calc(84px * var(--uiz,1));height:calc(84px * var(--uiz,1))}
  #dlgTextWrap{min-width:200px;max-width:520px;padding:7px 12px 9px}
  #dlgText{font-size:13.5px;line-height:1.6;min-height:22px}
  #dlgBox{bottom:14px}
}""",
     """@media (max-height:430px){
  #dlgPortrait{width:calc(94px * var(--uiz,1));height:calc(94px * var(--uiz,1))}
  #dlgTextWrap{min-width:calc(270px * var(--uiz,1));max-width:calc(560px * var(--uiz,1));
    padding:calc(9px * var(--uiz,1)) calc(14px * var(--uiz,1)) calc(11px * var(--uiz,1))}
  #dlgText{font-size:calc(15.5px * var(--uiz,1));line-height:1.75;min-height:calc(27px * var(--uiz,1))}
  #dlgBox{bottom:calc(18px * var(--uiz,1))}
}""", 1),
])

# ---------- announce کوتاه هم uiz ----------
patch('v3_part1.html', [
    ("""@media (max-height:430px){
  #announce{top:18%}
  #announce .big{font-size:21px}
  #announce .sub{font-size:11px;margin-top:4px}
}""",
     """@media (max-height:430px){
  #announce{top:18%}
  #announce .big{font-size:calc(24px * var(--uiz,1))}
  #announce .sub{font-size:calc(12.5px * var(--uiz,1));margin-top:4px}
}""", 1),
])

print('DLG OVERRIDE FIX OK')
