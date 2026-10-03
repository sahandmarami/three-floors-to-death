#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""نسخه‌ی ۲۰٫۳ — بازتولید صدای ۶ خطِ اصلاح‌شده‌ی کات‌سین افتتاحیه و
وصله‌ی درجا در voices17_data.js (همان روش gen_voices19.py):
  • i1n1: جمله‌بندی نرم شد (بی‌خبر و بی‌صدا)
  • i3a1: «کلِ این شهر مالِ خودمون شده»
  • i4p1: «شاید فقط خودمون موندیم»
  • i6n1: «هر چی که دم دستشون بود»
  • i10a1: «باید بهش برسیم»
  • i11p1: «زنده بیرون بیام»
اجرا: /home/z/.venv/bin/python gen_voices202.py
"""
import asyncio, base64, os, re, subprocess, sys
import edge_tts

OUT_DIR = '/home/z/my-project/scripts/voice202'
DATA_JS = '/home/z/my-project/scripts/voices17_data.js'

PROFILE = {
    'n': ('fa-IR-FaridNeural',  '-12%', '-15Hz'),   # راوی — گرم و آرام
    'a': ('fa-IR-FaridNeural',  '+14%', '+18Hz'),   # ارشان — جوان و پرانرژی
    'p': ('fa-IR-FaridNeural',  '+4%',  '-4Hz'),    # بازیکن — خنثی
    'r': ('fa-IR-DilaraNeural', '+3%',  '+5Hz'),    # رادیو (+ باندپس)
    'm': ('fa-IR-DilaraNeural', '-4%',  '-2Hz'),    # دکتر مریم — آرام و زنانه
}

# (کلید، شخصیت، متن) — همه وصله‌ی درجا (کلید از قبل موجود است)
LINES = [
    ('i1n1',  'n', 'همه‌چیز از یه ویروس شروع شد؛ از حومه‌ی شهر، بی‌خبر و بی‌صدا، اومد وسطِ مون.'),
    ('i3a1',  'a', 'چه قدر ساکت شده... انگار کلِ این شهر مالِ خودمون شده.'),
    ('i4p1',  'p', 'شاید فقط خودمون موندیم، نمی‌دونم... ولی تا این برج سرپاست، ما هم سرپاییم.'),
    ('i6n1',  'n', 'و اونا با هر چی که دم دستشون بود، شب و روز، این برج رو ساختن.'),
    ('i10a1', 'a', 'شنیدی؟! هنوز یه جای امن هست! باید بهش برسیم.'),
    ('i11p1', 'p', 'اول باید از همین شب زنده بیرون بیام؛ بقیه‌ش رو بعداً می‌گیم.'),
]

def ffprobe_dur(path):
    r = subprocess.run(['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
                        '-of', 'csv=p=0', path], capture_output=True, text=True, timeout=20)
    return round(float(r.stdout.strip()), 2)

async def gen_one(key, who, text):
    voice, rate, pitch = PROFILE[who]
    raw = f'{OUT_DIR}/{key}_raw.mp3'
    fin = f'{OUT_DIR}/{key}.mp3'
    for attempt in range(4):
        try:
            tts = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
            await tts.save(raw)
            if os.path.getsize(raw) > 2000:
                break
        except Exception as e:
            if attempt == 3:
                print(f'  !! FAIL {key}: {e}')
                return None
            await asyncio.sleep(2)
    af = 'volume=1.05'          # مثل نسخه‌ی ۱۹ — همان زنجیره‌ی n/a/p
    try:
        subprocess.run(['ffmpeg', '-y', '-v', 'quiet', '-i', raw,
                        '-af', af, '-ar', '24000', '-ac', '1', '-b:a', '32k', fin],
                       check=True, timeout=30)
    except Exception as e:
        print(f'  !! ffmpeg FAIL {key}: {e}')
        return None
    os.remove(raw)
    return fin

async def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    src = open(DATA_JS, encoding='utf-8').read()
    patched = 0
    total_b = 0
    for key, who, text in LINES:
        p = await gen_one(key, who, text)
        if not p:
            sys.exit(1)
        d = ffprobe_dur(p)
        b64 = base64.b64encode(open(p, 'rb').read()).decode()
        total_b += len(b64)
        print(f'  OK {key}: dur={d}s size={len(b64)//1024}KB')
        entry = f'{key}:{{d:{d},a:"data:audio/mpeg;base64,{b64}"}}'
        pat = re.compile(re.escape(key) + r':\{d:[0-9.]+,a:"data:audio/mpeg;base64,[^"]+"\}')
        if pat.search(src):
            src = pat.sub(lambda m: entry, src, count=1)
            patched += 1
        else:
            print(f'  !! KEY NOT FOUND: {key}')
            sys.exit(1)
    open(DATA_JS, 'w', encoding='utf-8').write(src)
    print(f'patched={patched}/{len(LINES)} total_new_base64={total_b//1024}KB')

asyncio.run(main())
