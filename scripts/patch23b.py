#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""v23 بخش ۲ — منوی DOM جدید (بازسازی کامل) + CSS معماهای MYST + برچسب ادامه"""
import sys

BASE = '/home/z/my-project/scripts/'

def rd(f):
    return open(BASE + f, encoding='utf-8').read()

def wr(f, s):
    open(BASE + f, 'w', encoding='utf-8').write(s)

def rep(src, old, new, f, must=True):
    if old not in src:
        if must:
            print(f'!! ANCHOR MISSING in {f}: {old[:70]!r}')
            sys.exit(1)
        return src
    return src.replace(old, new, 1)

# ================================================================
# ۱) v3_part1.html — منوی جدید
# ================================================================
s = rd('v3_part1.html')

# ۱-الف) جایگزینی HTML منو
old_html = '''  <!-- ============ (۲۱٫۱) منوی اصلی — قاب شیشه‌ای + آمار + نسخه ============ -->
  <div class="overlay" id="startScreen">
    <div id="menuHero">
      <div class="menu-frame">
        <div class="menu-ver">نسخه‌ی ۲۳٫۰</div>
        <h1 class="game-title">سه طبقه تا <span class="t-red">مرگ</span></h1>
        <div class="menu-tagline">شهر ساکت است... و شب‌ها تازه شروع شده‌اند</div>
        <div class="menu-divider"></div>
        <div id="storageWarn" class="hidden">⚠️ این مرورگر اجازه‌ی ذخیره‌شدن نمی‌دهد — از «تنظیمات ← کد سیو» استفاده کن</div>
        <div class="menu-btns">
          <button class="btn-main btn-big" id="btnStart">🎮 بازی جدید</button>
          <button class="btn-sec mbtn" id="btnContinue" disabled>▶ ادامه‌ی بازی</button>
        </div>
        <div class="menu-mini">
          <button class="mini-btn" id="btnSettings">⚙️ تنظیمات</button>
          <button class="mini-btn" id="btnAbout">ℹ️ درباره</button>
        </div>
        <div class="menu-stats" id="menuStats"></div>
      </div>
      <div class="menu-foot">ساخته‌ی سهند مرامی — ۳۶ شبِ سخت تا پناهگاه</div>
    </div>
  </div>'''

new_html = '''  <!-- ============ (۲۳٫۰) منوی اصلی — بازسازی کامل: صحنه‌ی سینمایی Canvas + دکمه‌های بزرگ ============ -->
  <div class="overlay" id="startScreen">
    <div class="m23-wrap">
      <div class="m23-col">
        <div class="m23-eyebrow">🔥 بازی بقا و دفاع از پناهگاه</div>
        <h1 class="m23-title">سه طبقه تا <span class="m23-red">مرگ</span></h1>
        <div class="m23-sub">۳۶ شب &nbsp;·&nbsp; ۴ فصل &nbsp;·&nbsp; یک ساختمانِ نیمه‌کاره</div>
        <div id="storageWarn" class="hidden">⚠️ این مرورگر اجازه‌ی ذخیره‌شدن نمی‌دهد — از «تنظیمات ← کد سیو» استفاده کن</div>
        <div class="m23-btns">
          <button class="m23-btn m23-primary" id="btnStart">
            <b class="m23-ico">⚔</b>
            <span class="m23-lbl">شروع داستان<small>بازی جدید + کات‌سین افتتاحیه</small></span>
          </button>
          <button class="m23-btn m23-cont" id="btnContinue" disabled>
            <b class="m23-ico">▶</b>
            <span class="m23-lbl">ادامه‌ی بازی<small id="m23c">سیوی نیست</small></span>
          </button>
          <div class="m23-row">
            <button class="m23-btn m23-small" id="btnSettings"><b class="m23-ico">⚙️</b><span class="m23-lbl">تنظیمات</span></button>
            <button class="m23-btn m23-small" id="btnAbout"><b class="m23-ico">ℹ️</b><span class="m23-lbl">درباره</span></button>
          </div>
        </div>
        <div class="menu-stats" id="menuStats"></div>
      </div>
    </div>
    <div class="m23-foot">نسخه‌ی ۲۳٫۰ &nbsp;·&nbsp; ساخته‌ی <b>سهند مرامی</b> &nbsp;·&nbsp; صداگذاری شخصیت‌ها: ElevenLabs</div>
  </div>'''

s = rep(s, old_html, new_html, 'v3_part1.html')

# ۱-ب) CSS جدید — انتهای استایل
css_anchor = '</style>'
css_new = '''
/* ==================================================================
   (۲۳٫۰) منوی اصلی جدید — بازسازی کامل: دکمه‌های بزرگ لمسی
   ================================================================== */
#startScreen{background:none!important;align-items:stretch}
.m23-wrap{display:flex;align-items:center;justify-content:flex-start;width:100%;
  padding:26px 7% 30px 0;pointer-events:none;box-sizing:border-box}
.m23-col{max-width:400px;width:100%;pointer-events:none;animation:m23in .7s ease both}
.m23-col>*{pointer-events:auto}
@keyframes m23in{from{opacity:0;transform:translateX(-26px)}to{opacity:1;transform:none}}
.m23-eyebrow{font-size:13px;font-weight:bold;color:#ffb45e;letter-spacing:.5px;
  text-shadow:0 2px 8px rgba(0,0,0,.8);margin-bottom:2px}
.m23-title{margin:0 0 4px;font-size:56px;line-height:1.12;font-weight:900;color:#f4ead0;
  text-shadow:0 3px 0 #20130a,0 6px 26px rgba(0,0,0,.9),0 0 40px rgba(255,120,40,.25)}
.m23-title .m23-red{color:#ff3b2e;text-shadow:0 3px 0 #2a0505,0 6px 30px rgba(255,40,20,.55)}
.m23-sub{font-size:15.5px;font-weight:bold;color:#c9d3ee;text-shadow:0 2px 8px rgba(0,0,0,.9);
  margin-bottom:22px}
#storageWarn{margin:0 0 10px}
.m23-btns{display:flex;flex-direction:column;gap:13px}
.m23-btn{display:flex;align-items:center;gap:14px;width:100%;min-height:78px;
  border-radius:18px;cursor:pointer;font-family:inherit;direction:rtl;text-align:right;
  border:2px solid rgba(255,255,255,.14);box-shadow:0 10px 26px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.18);
  transition:transform .12s,box-shadow .12s,filter .12s;position:relative;overflow:hidden;
  -webkit-tap-highlight-color:transparent;touch-action:manipulation}
.m23-btn:active{transform:scale(.965);filter:brightness(1.15)}
.m23-btn:disabled{opacity:.55;cursor:not-allowed;filter:saturate(.5)}
.m23-ico{flex:none;width:54px;height:54px;border-radius:14px;display:flex;align-items:center;
  justify-content:center;font-size:27px;font-weight:900;
  background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.15)}
.m23-lbl{display:flex;flex-direction:column;gap:3px;min-width:0}
.m23-lbl small{font-size:12px;font-weight:bold;opacity:.75;line-height:1.5}
.m23-primary{background:linear-gradient(180deg,#f7cd4e 0%,#e8a41f 58%,#c77e12 100%);
  color:#221503;font-size:26px;font-weight:900}
.m23-primary .m23-lbl small{color:#4a3005}
.m23-primary .m23-ico{background:rgba(0,0,0,.18);border-color:rgba(60,40,5,.35)}
.m23-primary::after{content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.35) 50%,transparent 60%);
  transform:translateX(120%);animation:m23shine 3.8s infinite}
@keyframes m23shine{0%,72%{transform:translateX(130%)}88%,100%{transform:translateX(-130%)}}
.m23-cont{background:linear-gradient(180deg,#1d2c52 0%,#15203e 100%);color:#eaf0ff;font-size:21px;font-weight:900}
.m23-cont:not(:disabled){border-color:#3f7a4c;box-shadow:0 10px 26px rgba(0,0,0,.55),0 0 18px rgba(80,200,110,.22),inset 0 1px 0 rgba(255,255,255,.14)}
.m23-cont .m23-lbl small{color:#9fc3a8}
.m23-row{display:flex;gap:13px}
.m23-small{min-height:60px;font-size:17px;font-weight:900;color:#e6ecfb;
  background:linear-gradient(180deg,rgba(28,38,66,.92),rgba(15,22,42,.92))}
.m23-small .m23-ico{width:42px;height:42px;font-size:20px;border-radius:11px}
.m23-small .m23-lbl{gap:0}
.m23-foot{position:absolute;bottom:14px;left:0;right:0;text-align:center;font-size:12.5px;
  color:#b9c4e2;text-shadow:0 2px 8px rgba(0,0,0,.9);pointer-events:none}
.m23-foot b{color:#ffd873}
/* چیپ‌های آمار منو */
.menu-stats{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px;justify-content:flex-start}
.ms-chip{font-size:12px;font-weight:bold;color:#ffe9b3;background:rgba(10,16,34,.72);
  border:1px solid #4a3d22;border-radius:999px;padding:6px 13px;text-shadow:0 1px 4px #000}
/* صفحه‌های کوچک — دکمه‌ها جمع‌وجورتر ولی همچنان بزرگ */
#wrap.sui .m23-title{font-size:40px}
#wrap.sui .m23-sub{font-size:13px;margin-bottom:14px}
#wrap.sui .m23-btn{min-height:64px;gap:10px;border-radius:14px}
#wrap.sui .m23-primary{font-size:21px}
#wrap.sui .m23-cont{font-size:17px}
#wrap.sui .m23-small{min-height:50px;font-size:14px}
#wrap.sui .m23-ico{width:44px;height:44px;font-size:22px}
#wrap.sui .m23-row .m23-ico{width:34px;height:34px;font-size:17px}
#wrap.sui .m23-lbl small{font-size:10.5px}
#wrap.sui .menu-stats{margin-top:12px}

/* ==================================================================
   (۲۳٫۰) لایه‌ی معما — دکمه/پنل/شنود/مولوتوف
   ================================================================== */
#mystBtn{position:absolute;bottom:64px;right:14px;z-index:7;display:none;align-items:center;gap:8px;
  font-family:inherit;font-size:15px;font-weight:900;color:#fff3d6;cursor:pointer;
  background:linear-gradient(180deg,#8a5a17,#5c3a0c);border:2px solid #e8b54a;border-radius:14px;
  padding:11px 18px;box-shadow:0 8px 22px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.2);
  -webkit-tap-highlight-color:transparent;touch-action:manipulation;animation:mystIn .3s ease}
#mystBtn:active{transform:scale(.95)}
#mystBtn.glow{animation:mystGlow 1.4s infinite}
@keyframes mystIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes mystGlow{0%,100%{box-shadow:0 8px 22px rgba(0,0,0,.5),0 0 6px rgba(255,190,80,.3)}50%{box-shadow:0 8px 22px rgba(0,0,0,.5),0 0 20px rgba(255,190,80,.75)}}
#listenBtn{position:absolute;bottom:64px;left:14px;z-index:7;display:none;align-items:center;justify-content:center;
  width:58px;height:58px;font-size:26px;cursor:pointer;font-family:inherit;
  background:linear-gradient(180deg,#23355e,#131e38);border:2px solid #4a629c;border-radius:50%;
  box-shadow:0 8px 20px rgba(0,0,0,.5);-webkit-tap-highlight-color:transparent;touch-action:manipulation}
#listenBtn:active{transform:scale(.93)}
#listenBtn.cd{opacity:.4;filter:grayscale(.7)}
#molotovBtn{position:absolute;bottom:128px;left:14px;z-index:7;display:none;align-items:center;justify-content:center;
  width:58px;height:58px;font-size:24px;cursor:pointer;font-family:inherit;color:#ffd9a0;
  background:linear-gradient(180deg,#7c3312,#481e08);border:2px solid #ff9a3c;border-radius:50%;
  box-shadow:0 8px 20px rgba(0,0,0,.5),0 0 14px rgba(255,120,40,.3);-webkit-tap-highlight-color:transparent;touch-action:manipulation}
#molotovBtn:active{transform:scale(.93)}
.myst-panel{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:20;
  width:min(460px,92%);max-height:84%;overflow:auto;background:rgba(10,14,28,.97);
  border:2px solid #c9954a;border-radius:18px;box-shadow:0 24px 60px rgba(0,0,0,.7);
  animation:mystIn .25s ease;font-family:inherit}
.myst-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;
  font-size:18px;font-weight:900;color:#ffd873;border-bottom:1px solid #3a3category0}
.myst-head{border-bottom:1px solid #3a3210}
.myst-x{width:40px;height:40px;border-radius:10px;border:1px solid #5a4a2a;background:rgba(0,0,0,.3);
  color:#ffd873;font-size:17px;cursor:pointer;font-family:inherit}
.myst-body{padding:14px 18px 18px;display:flex;flex-direction:column;gap:11px}
.myst-hint{font-size:13.5px;color:#c8d2ec;line-height:2;text-align:center;
  background:rgba(255,255,255,.04);border-radius:10px;padding:10px 12px}
.myst-hint b{color:#ffd873}
.myst-empty{font-size:14px;color:#9aa8cc;text-align:center;line-height:2.2;padding:18px 8px}
.myst-clue{display:flex;gap:12px;align-items:center;background:rgba(255,255,255,.05);
  border:1px solid #3a4a74;border-radius:12px;padding:11px 14px}
.myst-clue .mc-icon{font-size:24px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;
  background:rgba(0,0,0,.3);border-radius:10px;flex:none}
.myst-clue .mc-name{font-size:15px;font-weight:900;color:#ffe9b3}
.myst-clue .mc-sub{font-size:12px;color:#aeb9d8;margin-top:3px;line-height:1.8}
.myst-sep{text-align:center;font-size:12px;color:#8a94b4;letter-spacing:2px;margin:6px 0 0}
.myst-act{display:flex;flex-direction:column;gap:4px;font-family:inherit;font-size:16.5px;font-weight:900;
  color:#fff;text-align:right;cursor:pointer;padding:13px 16px;border-radius:13px;
  background:linear-gradient(180deg,#2a3a66,#182344);border:1.5px solid #4a629c;
  transition:border-color .15s,transform .15s;-webkit-tap-highlight-color:transparent}
.myst-act:hover{border-color:#ffd873}
.myst-act:active{transform:scale(.97)}
.myst-act span,.myst-act small{font-size:12px;font-weight:bold;color:#aebcdc;line-height:1.8}
.myst-act b{color:#ffd873}
.myst-act.small{font-size:14.5px;padding:10px 14px}
/* --- رادیو --- */
.radio-dial{padding:8px 4px}
.radio-dial input[type=range]{width:100%;height:44px;accent-color:#f0b53c;cursor:pointer;direction:ltr}
.radio-read{font-size:34px;font-weight:900;color:#ffd873;text-align:center;text-shadow:0 0 18px rgba(255,180,60,.4)}
.radio-static{font-size:14px;color:#9fb0d8;text-align:center;min-height:52px;line-height:2;
  background:rgba(0,0,0,.3);border-radius:10px;padding:8px;margin:4px 0}
.radio-static .ok{color:#7be38a}
.radio-static .no{color:#ff8a7a}
/* --- کد درب --- */
.code-disp{font-size:38px;font-weight:900;letter-spacing:10px;color:#ffd873;text-align:center;
  background:rgba(0,0,0,.4);border:1px solid #4a3d22;border-radius:12px;padding:12px;direction:ltr}
.code-disp.shake{animation:codeShake .4s}
@keyframes codeShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
.code-pad{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;direction:ltr}
.code-key{font-family:inherit;font-size:24px;font-weight:900;color:#eaf0ff;cursor:pointer;
  min-height:58px;border-radius:12px;background:linear-gradient(180deg,#26365e,#141f3c);
  border:1.5px solid #4a629c;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.code-key:active{transform:scale(.94);background:#2a3a66}
.code-key.fn{font-size:17px;color:#ffb45e}
/* --- فیوز --- */
.fuse-wires{display:flex;gap:12px;justify-content:center;padding:8px 0}
.fuse-wire{display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;font-family:inherit;
  background:rgba(0,0,0,.3);border:2px solid #3a4a74;border-radius:14px;padding:14px 18px;
  -webkit-tap-highlight-color:transparent;touch-action:manipulation;transition:border-color .15s,transform .15s}
.fuse-wire:active{transform:scale(.95)}
.fuse-wire i{width:34px;height:34px;border-radius:50%;display:block}
.fuse-wire.w-r i{background:radial-gradient(circle at 35% 30%,#ff9a8a,#c22215)}
.fuse-wire.w-y i{background:radial-gradient(circle at 35% 30%,#ffe9a0,#d9a512)}
.fuse-wire.w-b i{background:radial-gradient(circle at 35% 30%,#9ac2ff,#1e4fc2)}
.fuse-wire span{font-size:14px;font-weight:900;color:#dfe6f8}
.fuse-wire.used{opacity:.35;border-style:dashed}
.fuse-log{font-size:14px;color:#aeb9d8;text-align:center;min-height:24px}
#wrap.touch #mystBtn,#wrap.touch #listenBtn,#wrap.touch #molotovBtn{width:auto;height:auto}
</style>'''

s = rep(s, css_anchor, css_new, 'v3_part1.html')
# سطر اضافه‌ی خراب CSS را پاک کن (اگر پیش‌تر تزریق شده باشد)
s = s.replace('border-bottom:1px solid #3a3category0}\n.myst-head{', 'border-bottom:1px solid #3a3210}\n.myst-head{')
s = s.replace('border-bottom:1px solid #3a3category0}', 'border-bottom:1px solid #3a3210}')
wr('v3_part1.html', s)
print('✓ v3_part1.html — menu HTML + CSS')

# ================================================================
# ۲) v4_chapters.js — برچسب ادامه‌ی بازی با ساختار جدید
# ================================================================
s = rd('v4_chapters.js')
old_lbl = """  btn.disabled = !d;
  btn.textContent = d
    ? '▶ ادامه — فصل ' + faNum(d.chapter) + ' • موج ' + faNum(waveInChapter(d.wave))
    : '▶ ادامه‌ی بازی (سیوی نیست)';"""
new_lbl = """  btn.disabled = !d;
  /* (۲۳٫۰) برچسب داخل دکمه‌ی جدید منو */
  const _c = $('m23c');
  if (_c) {
    _c.textContent = d
      ? 'فصل ' + faNum(d.chapter) + ' • موج ' + faNum(waveInChapter(d.wave)) + ' از ۳۶'
      : 'هنوز سیوی نداری';
  }"""
s = rep(s, old_lbl, new_lbl, 'v4_chapters.js')
wr('v4_chapters.js', s)
print('✓ v4_chapters.js — continue label')

print('\n== patch23b done ==')
