#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""v24 — تولید صداهای گفتار با edge-tts (فارسیِ بومی + احساسات)
۷ شخصیت متمایز روی دو صدای عصبی فارسی (Farid/Dilara):
  p سهند  : Farid  · آهسته‌تر · بم‌تر    → قهرمانِ خسته/مسئولیت‌پذیر
  a ارشان : Farid  · سریع‌تر   · زیرتر   → جوان/پرانرژی
  m مریم  : Dilara · آرام      · حرفه‌ای
  n راوی  : Farid  · خیلی آهسته · خیلی بم + طنین → گوینده رسمی
  r بی‌سیم : Farid + باندپس رادیویی + فشرده‌سازی → اطلاع‌رسان رسمی
  b هیولا : Farid  · بسیار بم + پیچ‌شده → هیولا
  d دستفروش: Farid · خودمانی
خروجی: scripts/voice24/*.mp3 + scripts/voices24_data.js (VOICES23 — جایگزین)
هر خط: تنظیم احساسیِ خودش (هشدار=تند، پایان=غمگین...)
"""
import json, os, subprocess, sys, time, base64

sys.path.insert(0, '/home/z/my-project/scripts')
from dialogues23 import LINES

OUT_DIR = '/home/z/my-project/scripts/voice24'
DATA_JS = '/home/z/my-project/scripts/voices24_data.js'
ETTS = os.path.expanduser('~/.local/bin/edge-tts')

VOICE = {
    'p': 'fa-IR-FaridNeural',
    'a': 'fa-IR-FaridNeural',
    'm': 'fa-IR-DilaraNeural',
    'n': 'fa-IR-FaridNeural',
    'r': 'fa-IR-FaridNeural',
    'b': 'fa-IR-FaridNeural',
    'd': 'fa-IR-FaridNeural',
}
# سرعت/پیچ پایه‌ی هر شخصیت — «ناراحت و جدی» طبق خواسته‌ی کاربر
# (۲۴: مقادیر معتدل — تست ASR نشان داد شیفت‌های شدید غیرطبیعی می‌شوند)
PROFILE = {
    'p': {'rate': -10, 'pitch': -8},
    'a': {'rate': +8,  'pitch': +28},
    'm': {'rate': -6,  'pitch': +0},
    'n': {'rate': -14, 'pitch': -16},
    'r': {'rate': -4,  'pitch': -8},
    'b': {'rate': -16, 'pitch': -40},
    'd': {'rate': +4,  'pitch': +12},
}
# تنظیم احساسی خط‌های کلیدی (درصد اضافه روی پروفایل)
MOOD = {
    # هشدار/فوریت — تند و پرتنش
    'urgent': {'rate': +10, 'pitch': +6},
    # غم/پایان — آهسته و بم‌تر
    'sad': {'rate': -8, 'pitch': -6},
    # آرامش/امید — کمی گرم‌تر
    'calm': {'rate': -4, 'pitch': +2},
}
URGENT = {'c4vr', 'fbw2', 'aw2', 'aw4', 'aw5', 's1a1', 's1a2', 'c1w4c', 'c4f3', 'fbz1', 'fbw1', 'fbw4', 'fbw6', 'sbo1', 'c2e2', 'c3e2', 'aw6', 'aw1'}
SAD = {'e1n', 'e2a', 'e3p', 'e4n', 'tbc1n', 'c4v4', 'c4v5', 'i1n', 'i2n', 'c1w1a', 'c2w5a', 'c3w5a', 'c2e1', 'c3e1', 'c4v2', 'i4p', 'c4v8'}
CALM = {'c4m1', 'c4m2', 'c4m3', 'c4p3', 'c4a3', 'c4v3', 'i20p', 'c4p1'}

# پس‌پردازش ffmpeg به تفکیک شخصیت (گزینه‌ها با «:» جدا می‌شوند — نه «,»)
FX = {
    'p': 'lowshelf=f=210:g=2.5,acompressor=threshold=0.32:ratio=3:attack=12:release=140,loudnorm=I=-17:TP=-1.5',
    'a': 'highshelf=f=3400:g=2,acompressor=threshold=0.30:ratio=3:attack=8:release=120,loudnorm=I=-16.5:TP=-1.5',
    'm': 'acompressor=threshold=0.30:ratio=2.6:attack=10:release=130,loudnorm=I=-17:TP=-1.5',
    'n': 'aecho=0.6:0.24:60|110:0.16|0.09,lowshelf=f=180:g=2,acompressor=threshold=0.30:ratio=3.2:attack=14:release=160,loudnorm=I=-17.5:TP=-1.5',
    'r': 'highpass=f=380,lowpass=f=2900,volume=2.1,acompressor=threshold=0.28:ratio=8:attack=5:release=55,loudnorm=I=-15.5:TP=-1.0',
    'b': 'asetrate=24000*0.82,aresample=24000,atempo=1.18,volume=1.35,acompressor=threshold=0.26:ratio=9:attack=4:release=40,loudnorm=I=-16:TP=-1.0',
    'd': 'lowshelf=f=260:g=1.5,volume=1.1,acompressor=threshold=0.32:ratio=2.6:attack=10:release=130,loudnorm=I=-17:TP=-1.5',
}

os.makedirs(OUT_DIR, exist_ok=True)

def mood_of(key):
    if key in URGENT: return MOOD['urgent']
    if key in SAD: return MOOD['sad']
    if key in CALM: return MOOD['calm']
    return {'rate': 0, 'pitch': 0}

def run(cmd, tries=3):
    for a in range(tries):
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if r.returncode == 0: return True
        time.sleep(2.5 * (a + 1))
    return False

def dur_of(path):
    try:
        r = subprocess.run(['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
                            '-of', 'csv=p=0', path], capture_output=True, text=True, timeout=30)
        return round(float(r.stdout.strip()), 2)
    except Exception:
        return 2.0

def gen_one(item):
    """تولید یک کلیپ — برای اجرای موازی"""
    key, who, fa = item[0], item[1], item[2]
    out = os.path.join(OUT_DIR, key + '.mp3')
    if os.path.exists(out) and os.path.getsize(out) > 8000:
        return (key, 'skip')
    prof = PROFILE.get(who, PROFILE['p'])
    mood = mood_of(key)
    rate = prof['rate'] + mood['rate']
    pitch = prof['pitch'] + mood['pitch']
    voice = VOICE.get(who, VOICE['p'])
    tmp = os.path.join(OUT_DIR, '_raw_' + key + '.mp3')
    cmd = [ETTS, '--voice', voice,
           '--rate=' + ('+' if rate >= 0 else '') + str(rate) + '%',
           '--pitch=' + ('+' if pitch >= 0 else '') + str(pitch) + 'Hz',
           '--text', fa, '--write-media', tmp]
    if not run(cmd):
        return (key, 'fail-tts')
    fx = FX.get(who, FX['p'])
    if not run(['ffmpeg', '-y', '-v', 'quiet', '-i', tmp,
                '-af', fx, '-ar', '24000', '-ac', '1',
                '-b:a', '48k', out]):
        return (key, 'fail-ffmpeg')
    try: os.remove(tmp)
    except Exception: pass
    return (key, 'ok')

def main():
    from concurrent.futures import ThreadPoolExecutor
    items = [(k, w, fa) for (k, w, fa, _f) in LINES]
    ok, fail = 0, []
    with ThreadPoolExecutor(max_workers=6) as ex:
        for key, status in ex.map(gen_one, items):
            if status in ('ok', 'skip'):
                ok += 1
                if status == 'ok': print('ok', key, flush=True)
            else:
                fail.append(key)
                print('FAIL', key, status, flush=True)
    print(f'\nGenerated {ok}/{len(LINES)}; failed: {fail}')
    # ساخت داده‌ی JS
    entries = []
    for (key, who, fa, _fing) in LINES:
        out = os.path.join(OUT_DIR, key + '.mp3')
        if not os.path.exists(out):
            continue
        d = dur_of(out)
        b64 = base64.b64encode(open(out, 'rb').read()).decode('ascii')
        entries.append(f"{key}:{{d:{d},a:\"data:audio/mpeg;base64,{b64}\"}}")
    header = """/* ==================================================================
   «سه طبقه تا مرگ» v24 — صداهای فارسیِ بومی (edge-tts عصبی) + احساسات
   ۷ شخصیت: p Farid(-12%/-10Hz بم/مسئول) a Farid(+9%/+42Hz جوان)
   m Dilara(حرفه‌ای) n Farid(راوی/طنین) r Farid(باندپس رادیو)
   b Farid(هیولا/پیچ) d Farid(دستفروش) — تنظیمِ احساسیِ خط‌های کلیدی
   (هشدار=تند · پایان=غمگین · آرامش=گرم) + پس‌پردازش ffmpeg
   ================================================================== */
const VOICES23 = {
"""
    with open(DATA_JS, 'w', encoding='utf-8') as f:
        f.write(header)
        f.write(',\n'.join(entries))
        f.write('\n};\n')
    size = os.path.getsize(DATA_JS) / 1048576
    print(f'data: {len(entries)} clips, {size:.1f}MB -> {DATA_JS}')
    return 0 if not fail else 1

if __name__ == '__main__':
    sys.exit(main())
