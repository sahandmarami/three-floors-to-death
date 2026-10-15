#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# insert_v33b.py — بخش ۲ ویرایش‌های v33: شنود→کارت اکشن، نام کاشی‌ها، منوی روشن‌تر، زامبی، ماژول v33
import io

P = '/home/z/my-project/download/three-floors-to-survival.html'
s = io.open(P, encoding='utf-8').read()
orig = len(s)
log = []

def rep(old, new, label, n=1):
    global s
    c = s.count(old)
    assert c == n, f'[{label}] انتظار {n}، پیدا شد {c}'
    s = s.replace(old, new)
    log.append(f'  OK  {label}')

def insert_after_line(anchor, addition, label):
    """درج یک خط جدید بعد از خطِ حاویِ anchor (بدون رونویسی متن قدیم)"""
    global s
    i = s.find(anchor)
    assert i >= 0, f'[{label}] anchor پیدا نشد'
    eol = s.find('\n', i)
    assert eol > i
    s = s[:eol + 1] + addition + s[eol + 1:]
    log.append(f'  OK  {label}')

# ---------------------------------------------------------------
# E9) کارت اکشن «گوش بسپار» در پرونده‌ی سرنخ‌ها (به‌جای دکمه‌ی شناور)
# ---------------------------------------------------------------
insert_after_line(
    'data-act="molo"',
    "    h += '<button class=\"myst-act small\" data-act=\"listen\">👂 گوش بسپار<span>۴ ثانیه ضربان دشمن‌ها در مه — ۱۴ ثانیه فرصت دوباره</span></button>';\n",
    'E9: کارت شنود در پرونده سرنخ‌ها')

# ---------------------------------------------------------------
# E10) هندلر کارت شنود
# ---------------------------------------------------------------
insert_after_line(
    "else if (act === 'molo')",
    "        else if (act === 'listen') { if (this.listen.cd > 0) { setAnnounce('گوش خسته است', 'هر ۱۴ ثانیه یک‌بار — کمی صبر کن', 2); } else { this.startListen(); this.closePanel(); } }\n",
    'E10: هندلر کارت شنود')

# ---------------------------------------------------------------
# E11) نام روی کاشی‌های ساخت‌وساز
# ---------------------------------------------------------------
rep("""    const cv = document.createElement('canvas');
    cv.className = 'bp-ic';
    paintIcon(d.kind, cv);
    el.appendChild(cv);""",
    """    const cv = document.createElement('canvas');
    cv.className = 'bp-ic';
    paintIcon(d.kind, cv);
    el.appendChild(cv);
    /* (۳۳) نام کاشی — روی گوشی hover نداریم؛ نام باید همیشه دیده شود */
    const nm = document.createElement('span');
    nm.className = 'bp-name';
    nm.textContent = d.name;
    el.appendChild(nm);""",
    'E11: برچسب نام کاشی‌ها')

# ---------------------------------------------------------------
# E12) منوی اصلی روشن‌تر (پالت آسمان/زمین/افق + ستاره‌ها + پنجره‌ها)
# ---------------------------------------------------------------
rep("sky.addColorStop(0, '#05060f');", "sky.addColorStop(0, '#0c1024');", 'E12a: آسمان-۰')
rep("sky.addColorStop(0.55, '#0a0a1a');", "sky.addColorStop(0.55, '#171833');", 'E12b: آسمان-۵۵')
rep("sky.addColorStop(0.85, '#170b18');", "sky.addColorStop(0.85, '#271424');", 'E12c: آسمان-۸۵')
rep("sky.addColorStop(1, '#24101c');", "sky.addColorStop(1, '#361a29');", 'E12d: آسمان-۱۰۰')
rep("gr.addColorStop(0, '#0c0e17');", "gr.addColorStop(0, '#171b31');", 'E12e: زمین-۰')
rep("gr.addColorStop(0.5, '#12101a');", "gr.addColorStop(0.5, '#201d2b');", 'E12f: زمین-۵۰')
rep("gr.addColorStop(1, '#1a1420');", "gr.addColorStop(1, '#2a2230');", 'E12g: زمین-۱۰۰')
rep("skyline(GROUND_Y + 2, 44, 120, '#0d0f20', 0, par * -7);", "skyline(GROUND_Y + 2, 44, 120, '#1a1e3a', 0, par * -7);", 'E12h: افق-عقب')
rep("skyline(GROUND_Y + 2, 26, 70, '#080a15', 0, par * -14);", "skyline(GROUND_Y + 2, 26, 70, '#12141f', 0, par * -14);", 'E12i: افق-جلو')
rep("'rgba(214,222,255,' + (0.34 * tw).toFixed(2)", "'rgba(214,222,255,' + (0.5 * tw).toFixed(2)", 'E12j: ستاره‌ها')
rep("ctx.fillStyle = 'rgba(255,190,110,0.20)';", "ctx.fillStyle = 'rgba(255,196,120,0.34)';", 'E12k: پنجره‌های افق')

# ---------------------------------------------------------------
# E13) زامبی سایه‌ای منو: نیم‌رخ درست (یک چشم + فک) + بازوهای متضادِ پاها
# ---------------------------------------------------------------
i = s.find('ctx.strokeStyle = bodyC; ctx.lineWidth = 4.6;')
assert i >= 0, 'E13: بازوی زامبی پیدا نشد'
j = s.find('ctx.restore();', i)
assert j > i
NEW_Z = """ctx.strokeStyle = bodyC; ctx.lineWidth = 4.6;
    ctx.beginPath();
    /* (۳۳) بازوها: فاز متضاد پاها — حرکت طبیعی، نه عروسکی */
    ctx.moveTo(-6, -24); ctx.lineTo(-9 - Math.sin(ph + Math.PI) * 4.5, -13);
    ctx.moveTo(6, -24); ctx.lineTo(9 + Math.sin(ph) * 4.5, -13);
    ctx.stroke();
    /* (۳۳) سرِ نیم‌رخ: پیشانی + فکِ افتاده — فقط یک چشم دیده می‌شود */
    ctx.fillStyle = bodyC;
    circle(3.5, -31.5, 5.6);
    ctx.beginPath();
    ctx.moveTo(5.6, -28.6); ctx.lineTo(9.4, -27.3); ctx.lineTo(5.9, -26.6); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(7.2, -33.6); ctx.lineTo(9.8, -32.2); ctx.lineTo(7.4, -31.4); ctx.closePath(); ctx.fill();
    /* چشمِ سرخِ سوسوزن — یک چشم در نمای نیم‌رخ */
    const er = 0.55 + 0.45 * Math.abs(Math.sin(t * 1.8 + ph * 0.6));
    ctx.fillStyle = 'rgba(255,60,40,' + er.toFixed(2) + ')';
    circle(6.1, -32.2, 1.3);
    ctx.fillStyle = 'rgba(255,60,40,' + (er * 0.22).toFixed(2) + ')';
    circle(6.1, -32.2, 4.2);
    """
s = s[:i] + NEW_Z + s[j:]
log.append('  OK  E13: زامبی منو — نیم‌رخ + بازوهای متضاد')

io.open(P, 'w', encoding='utf-8').write(s)
print('\n'.join(log))
print(f'size: {orig} -> {len(s)} bytes')
print('PART 2 DONE — ادامه با insert_v33c.py (ماژول v33)')
