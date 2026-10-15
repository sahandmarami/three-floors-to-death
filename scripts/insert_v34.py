#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# insert_v34.py — v34.0 بازسازی کامل (بخش مستقیم فایل):
# ۱) منوی اصلی روشن‌تر (پالت آسمان/زمین/افق/ستاره/پرده)
# ۲) نام کاشی‌های سلاح‌ها حذف (فقط ارتقا/برجک/بقا نام دارند)
# ۳) رفع سرریز نام «کیت کمک‌های اولیه» (فونت کوچک‌تر + uiz2 + ellipsis)
# ۴) تنظیمات/درباره بدون اسکرول (سربرگ ردیفی + شبکه ۲ستونه + دکمه‌های کنار هم)
# ۵) درج ماژول v34 (ریل یکدست + باتن‌شیت سرنخ‌ها + کوله تعاملی + زامبی ترسناک)
import io, sys

P = '/home/z/my-project/download/three-floors-to-survival.html'
s = io.open(P, encoding='utf-8').read()
orig = len(s)
log = []

def rep(old, new, label, n=1):
    global s
    c = s.count(old)
    if c != n:
        print(f'  FAIL [{label}] انتظار {n}، پیدا شد {c}')
        sys.exit(1)
    s = s.replace(old, new)
    log.append(f'  OK  {label}')

# =========================================================
# R1) منوی اصلی — پالت روشن‌تر (~۳۵٪)
# =========================================================
rep("sky.addColorStop(0, '#0c1024');", "sky.addColorStop(0, '#161c40');", 'R1a آسمان-بالا')
rep("sky.addColorStop(0.55, '#171833');", "sky.addColorStop(0.55, '#252a52');", 'R1b آسمان-وسط')
rep("sky.addColorStop(0.85, '#271424');", "sky.addColorStop(0.85, '#3a2038');", 'R1c آسمان-پایین')
rep("sky.addColorStop(1, '#361a29');", "sky.addColorStop(1, '#4c2740');", 'R1d آسمان-افق')
rep("gr.addColorStop(0, '#171b31');", "gr.addColorStop(0, '#232b4e');", 'R1e زمین-بالا')
rep("gr.addColorStop(0.5, '#201d2b');", "gr.addColorStop(0.5, '#2c2a44');", 'R1f زمین-وسط')
rep("gr.addColorStop(1, '#2a2230');", "gr.addColorStop(1, '#38324c');", 'R1g زمین-پایین')
rep("skyline(GROUND_Y + 2, 44, 120, '#1a1e3a', 0, par * -7);", "skyline(GROUND_Y + 2, 44, 120, '#27305a', 0, par * -7);", 'R1h افق-پشت')
rep("skyline(GROUND_Y + 2, 26, 70, '#12141f', 0, par * -14);", "skyline(GROUND_Y + 2, 26, 70, '#1b2036', 0, par * -14);", 'R1i افق-جلو')
rep("ctx.fillStyle = 'rgba(214,222,255,' + (0.5 * tw).toFixed(2) + ')';",
    "ctx.fillStyle = 'rgba(218,226,255,' + (0.78 * tw).toFixed(2) + ')';", 'R1j ستاره‌ها')
rep("mg.addColorStop(0, 'rgba(255,140,80,0.30)');", "mg.addColorStop(0, 'rgba(255,150,92,0.40)');", 'R1k هاله‌ی ماه')
rep("ctx.fillStyle = 'rgba(255,196,120,0.34)';", "ctx.fillStyle = 'rgba(255,202,132,0.52)';", 'R1l پنجره‌های افق')
rep("#startScreen{background:linear-gradient(180deg,rgba(4,7,18,.92),rgba(4,7,18,.66) 38%,rgba(4,7,18,.18) 62%,rgba(4,7,18,.5) 100%);",
    "#startScreen{background:linear-gradient(180deg,rgba(6,10,26,.56),rgba(6,10,26,.36) 38%,rgba(6,10,26,.10) 62%,rgba(6,10,26,.24) 100%);",
    'R1m پرده‌ی منو روشن‌تر')

# =========================================================
# R2) نام کاشی‌های سلاح‌ها حذف می‌شود
# =========================================================
rep("""    /* (۳۳) نام کاشی — روی گوشی hover نداریم؛ نام باید همیشه دیده شود */
    const nm = document.createElement('span');
    nm.className = 'bp-name';
    nm.textContent = d.name;
    el.appendChild(nm);""",
    """    /* (۳۴) نام کاشی — فقط تب‌های ارتقا/برجک/بقا؛ سلاح‌ها بدون نام (درخواست کاربر) */
    if (d.tab !== 'wpn') {
      const nm = document.createElement('span');
      nm.className = 'bp-name';
      nm.textContent = d.name;
      el.appendChild(nm);
    }""",
    'R2 نام سلاح‌ها حذف')

# =========================================================
# R3) رفع سرریز نام (کیت کمک‌های اولیه) — فونت کوچک‌تر + uiz2 + عرض ۱۰۰٪
# =========================================================
rep(""".bp-tile .bp-name{font-size:calc(10.5px * var(--uiz,1));font-weight:800;color:#e8eeff;line-height:1.15;
  max-width:calc(96px * var(--uiz,1));overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  padding:0 3px;text-shadow:0 1px 2px rgba(0,0,0,.7);pointer-events:none}""",
    """.bp-tile .bp-name{font-size:calc(9.5px * var(--uiz2,1));font-weight:800;color:#e8eeff;line-height:1.25;
  max-width:100%;width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;box-sizing:border-box;
  padding:0 3px;text-shadow:0 1px 2px rgba(0,0,0,.7);pointer-events:none}
.bp-tile{overflow:hidden}""",
    'R3 سرریز نام کاشی')

# =========================================================
# R4) تنظیمات — بدون اسکرول (شبکه ۲ستونه + سربرگ ردیفی)
# =========================================================
OLD_SET = """  <div class="overlay hidden" id="settingsScreen">
    <div class="m27-card">
      <div class="m27-icon"><i class="ic big" data-ico="gear"></i></div>
      <h2 class="m27-title">تنظیمات</h2>
      <p class="m27-sub">صدا و حس بازی</p>
      <div class="m27-list">
        <div class="m27-row"><span><i class="ic" data-ico="sound"></i> جلوه‌های صوتی</span>
          <label class="switch"><input type="checkbox" id="setSfx" checked><span></span></label></div>
        <div class="m27-row"><span><i class="ic" data-ico="music"></i> موسیقی محیطی</span>
          <label class="switch"><input type="checkbox" id="setMusic" checked><span></span></label></div>
        <div class="m27-row"><span><i class="ic" data-ico="vibrate"></i> لرزش صفحه</span>
          <label class="switch"><input type="checkbox" id="setShake" checked><span></span></label></div>
        <div class="m27-row m27-vol"><span><i class="ic" data-ico="volume"></i> بلندی صدا</span>
          <input type="range" id="setVol" min="0" max="100" value="50" class="vol"></div>
        <div class="m27-sep"></div>
        <button class="m27-btn m27-danger" id="btnWipe"><i class="ic" data-ico="trash"></i><span>پاک‌کردن سیو</span></button>
        <button class="m27-btn m27-primary" id="closeSettings"><i class="ic" data-ico="back"></i><span>برگرد</span></button>
      </div>
    </div>
  </div>"""
NEW_SET = """  <div class="overlay hidden" id="settingsScreen">
    <div class="m27-card m27-compact34">
      <div class="m27-headrow34">
        <span class="m27-hic34"><i class="ic" data-ico="gear"></i></span>
        <div class="m27-htx34"><h2 class="m27-title">تنظیمات</h2><p class="m27-sub">صدا و حس بازی</p></div>
      </div>
      <div class="m27-grid34">
        <div class="m27-row"><span><i class="ic" data-ico="sound"></i> جلوه‌های صوتی</span>
          <label class="switch"><input type="checkbox" id="setSfx" checked><span></span></label></div>
        <div class="m27-row"><span><i class="ic" data-ico="music"></i> موسیقی محیطی</span>
          <label class="switch"><input type="checkbox" id="setMusic" checked><span></span></label></div>
        <div class="m27-row"><span><i class="ic" data-ico="vibrate"></i> لرزش صفحه</span>
          <label class="switch"><input type="checkbox" id="setShake" checked><span></span></label></div>
        <div class="m27-row m27-vol"><span><i class="ic" data-ico="volume"></i> بلندی صدا</span>
          <input type="range" id="setVol" min="0" max="100" value="50" class="vol"></div>
      </div>
      <div class="m27-acts34">
        <button class="m27-btn m27-primary" id="closeSettings"><i class="ic" data-ico="back"></i><span>برگرد</span></button>
        <button class="m27-btn m27-danger" id="btnWipe"><i class="ic" data-ico="trash"></i><span>پاک‌کردن سیو</span></button>
      </div>
    </div>
  </div>"""
rep(OLD_SET, NEW_SET, 'R4 تنظیمات فشرده')

# =========================================================
# R5) درباره — بدون اسکرول (متن فشرده‌تر + سربرگ ردیفی)
# =========================================================
OLD_ABOUT = """  <div class="overlay hidden" id="aboutScreen">
    <div class="m27-card">
      <div class="m27-icon"><i class="ic big" data-ico="info"></i></div>
      <h2 class="m27-title">درباره‌ی بازی</h2>
      <p class="m27-sub">سه طبقه تا مرگ</p>
      <div class="m27-text">
        <div>شهر یک‌شبه ساکت شد. نه خبری آمد، نه برقی بود — فقط فریادهایی که کم‌کم قطع می‌شدند.</div>
        <div>تویی و <b>ارشان</b>، تنها بازمانده‌هایی که به ساختمان نیمه‌کاره‌ای پناه بردید و همان‌جا ماندید؛ چون رفتن یعنی مرگ.</div>
        <div>هر شب صدایشان نزدیک‌تر می‌شود؛ تخته‌ها می‌شکنند، باتری چراغ‌قوه ته می‌کشد و کسی در بی‌سیم جواب نمی‌دهد.</div>
        <div>اما <b>برج سه‌طبقه</b> هنوز سرپاست — و باید سرپا بماند، تا فردایی که...</div>
        <div class="about-credit">ساخته شده توسط <b>سهند مرامی</b></div>
      </div>
      <button class="m27-btn m27-primary" id="closeAbout" style="margin-top:calc(12px * var(--uiz,1))"><i class="ic" data-ico="back"></i><span>برگرد</span></button>
    </div>
  </div>"""
NEW_ABOUT = """  <div class="overlay hidden" id="aboutScreen">
    <div class="m27-card m27-compact34">
      <div class="m27-headrow34">
        <span class="m27-hic34"><i class="ic" data-ico="info"></i></span>
        <div class="m27-htx34"><h2 class="m27-title">درباره‌ی بازی</h2><p class="m27-sub">سه طبقه تا مرگ</p></div>
      </div>
      <div class="m27-text m27-text34">
        <div>شهر یک‌شبه ساکت شد؛ نه خبری آمد، نه برقی بود — فقط فریادهایی که کم‌کم قطع می‌شدند.</div>
        <div>تویی و <b>ارشان</b> که به ساختمان نیمه‌کاره‌ای پناه بردید؛ چون رفتن یعنی مرگ. هر شب صدایشان نزدیک‌تر می‌شود و تخته‌ها می‌شکنند.</div>
        <div>اما <b>برج سه‌طبقه</b> هنوز سرپاست — و باید سرپا بماند، تا فردایی که...</div>
        <div class="about-credit">ساخته شده توسط <b>سهند مرامی</b></div>
      </div>
      <div class="m27-acts34">
        <button class="m27-btn m27-primary" id="closeAbout"><i class="ic" data-ico="back"></i><span>برگرد</span></button>
      </div>
    </div>
  </div>"""
rep(OLD_ABOUT, NEW_ABOUT, 'R5 درباره فشرده')

# =========================================================
# R6) ماژول v34 — درج قبل از </body>
# =========================================================
MODULE = "\n<script>\n/* ==================================================================\n   سه طبقه تا مرگ — v34 — ماژول بازسازی کامل (ریل یکدست + باتن‌شیت + زامبی)\n   ================================================================== */\n" + \
    io.open('/home/z/my-project/scripts/v34_module.js', encoding='utf-8').read() + \
    "\n</script>\n"
anchor = '</body>\n</html>'
assert s.count(anchor) == 1, 'anchor انتهای HTML پیدا نشد'
s = s.replace(anchor, MODULE + anchor)
log.append('  OK  R6 ماژول v34 درج شد')

io.open(P, 'w', encoding='utf-8').write(s)
print('\n'.join(log))
print(f'\n  حجم: {orig} -> {len(s)} bytes')
