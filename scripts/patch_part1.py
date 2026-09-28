# -*- coding: utf-8 -*-
"""پچ v3_part1.html برای نسخه‌ی ۱۱٫۰ — UI گفتگو، ذخیره/خروج، موبایل، نسخه."""
import io, sys

p = '/home/z/my-project/scripts/v3_part1.html'
s = io.open(p, encoding='utf-8').read()
orig = s
Z = '\u200c'

def rep(old, new, cnt=1):
    global s
    if old not in s:
        print('MISS:', old[:70]); sys.exit(1)
    s = s.replace(old, new, cnt)

# ۱) نسخه‌ها
# ۲) CSS: جعبه‌ی گفتگو + راهنمای چرخش گوشی + لمس (بعد از #game)
anchor = '#game{position:absolute;inset:0;width:100%;height:100%;display:block;cursor:crosshair;touch-action:none}'
dlg_css = anchor + '''

/* ---------- (۱۱٫۰) جعبه‌ی گفتگوی داستانی: پرتره + حباب ---------- */
#dlgBox{position:absolute;bottom:22px;left:50%;transform:translateX(-50%);z-index:30;
  display:flex;align-items:flex-end;gap:10px;direction:rtl;max-width:88%;pointer-events:none}
#dlgPortrait{width:92px;height:92px;border-radius:14px;background:rgba(10,14,26,.92);
  border:2px solid #3d548c;flex:none;margin-bottom:5px;transition:box-shadow .3s}
#dlgTextWrap{position:relative;background:rgba(8,12,24,.9);border:1.5px solid #33477c;
  border-radius:14px 14px 4px 14px;padding:9px 16px 11px;min-width:320px;max-width:600px;
  box-shadow:0 8px 30px rgba(0,0,0,.6);backdrop-filter:blur(3px)}
#dlgWho{font-size:12px;font-weight:bold;letter-spacing:.5px;margin-bottom:3px}
#dlgText{font-size:15px;line-height:1.85;min-height:28px;color:#f3f0e4;font-weight:bold}
#dlgText::after{content:'\\258C';color:#ffd873;animation:dlgCaret 1s steps(2) infinite;margin-inline-start:2px}
@keyframes dlgCaret{50%{opacity:0}}
#dlgHint{font-size:9px;color:#7a8cb8;margin-top:4px;text-align:left}
#dlgBox.hidden{display:none}

/* ---------- (۱۱٫۰) چرخاندن گوشی در حالت عمودی ---------- */
#rotateHint{position:absolute;inset:0;z-index:99;background:rgba(6,9,18,.96);
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;
  font-size:20px;font-weight:bold;color:#ffd873;text-align:center;padding:20px}
#rotateHint div{font-size:15px;color:#c3cdea;font-weight:normal;line-height:1.9}
#rotateHint.hidden{display:none}
#wrap.touch #rotateHint{display:flex}
#wrap.touch:not(.portrait) #rotateHint{display:none}
@media (orientation:portrait){#wrap.touch #rotateHint{display:flex}}

/* ---------- (۱۱٫۰) لمس: دکمه‌های بزرگ‌تر و نوارهای مناسب انگشت ---------- */
#wrap.touch .hud-btn{padding:9px 15px;font-size:14px}
#wrap.touch .wslot{width:72px;height:46px}
#wrap.touch .wslot .wname{font-size:10px}
#wrap.touch .bp-tile{min-height:60px}
#wrap.touch #buildPanel{width:190px;top:56px}
#wrap.touch #hud{padding:6px 8px}
#wrap.touch #weaponBar{bottom:8px}
#wrap.touch #dlgText{font-size:16.5px}
#wrap.touch #dlgTextWrap{min-width:260px}
#wrap.touch #bpTip{display:none!important}'''
rep(anchor, dlg_css)

# ۳) HTML: جعبه‌ی گفتگو + rotateHint (قبل از دکمه‌ی رد کردن)
anchor2 = '''  <!-- ============ دکمه‌ی «رد کردن» کات' + Z + 'سین داستانی (۷٫۰) — ۱۰٫۰: افتتاحیه/انتقال' + Z + 'ها هم ============ -->'''
dlg_html = '''  <!-- ============ (۱۱٫۰) جعبه‌ی گفتگوی داستانی: پرتره + حباب متن ============ -->
  <div id="dlgBox" class="hidden">
    <div id="dlgTextWrap">
      <div id="dlgWho">ارشان</div>
      <div id="dlgText"></div>
      <div id="dlgHint">کلیک / Space = ادامه</div>
    </div>
    <canvas id="dlgPortrait" width="96" height="96"></canvas>
  </div>

  <!-- ============ (۱۱٫۰) راهنمای چرخاندن گوشی (حالت عمودی) ============ -->
  <div id="rotateHint" class="hidden">🔄<div>برای بازی، گوشی را <b>افقی</b> بچرخان</div></div>

''' + anchor2
rep(anchor2, dlg_html)

# ۴) دکمه‌ی «ذخیره و خروج» در پنل توقف
rep('''        <button class="btn-main" id="btnResume">▶ ادامه بازی</button>
        <button class="btn-sec" id="btnRestart0">🔄 شروع دوباره</button>''',
    '''        <button class="btn-main" id="btnResume">▶ ادامه بازی</button>
        <button class="btn-sec" id="btnSaveExit">💾 ذخیره و خروج</button>
        <button class="btn-sec" id="btnRestart0">🔄 شروع دوباره</button>''')

io.open(p, 'w', encoding='utf-8').write(s)
print('part1 patched OK —', len(orig), '→', len(s), 'bytes')
