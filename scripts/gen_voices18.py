#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""بازتولید دو کلیپ ۱۸ (متن منطقی‌تر) و وصله‌کردن voices17_data.js درجا:
  t1n1 — منطق فرار ارشان: روی بام بود → ترک‌ها را دید → با طناب پایین رفت و ماشین را گرم کرد
  aw5  — هم‌زمان با پایین‌رفتن تصویری‌اش از بام وقتی برج ترک می‌خورد
"""
import asyncio, base64, os, re, subprocess, sys
sys.path.insert(0, '/home/z/.venv/lib/python3*/site-packages')
import edge_tts

OUT_DIR = '/home/z/my-project/scripts/voice18'
DATA_JS = '/home/z/my-project/scripts/voices17_data.js'

PROFILE = {
    'n': ('fa-IR-FaridNeural',  '-12%', '-15Hz'),
    'a': ('fa-IR-FaridNeural',  '+14%', '+18Hz'),
}

LINES = [
    ('t1n1', 'n', 'ارشان با طناب از برج پایین رفت و ماشین رو گرم کرد — درها بازه، بپر تو!'),
    ('aw5',  'a', 'برج ترک خورده! من می‌رم پایین — تو فقط حواست جمع باشه!'),
]

def ffprobe_dur(path):
    r = subprocess.run(['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
                        '-of', 'csv=p=0', path], capture_output=True, text=True, timeout=20)
    return round(float(r.stdout.strip()), 2)

async def gen_one(key, who, text):
    voice, rate, pitch = PROFILE[who]
    raw = f'{OUT_DIR}/{key}_raw.mp3'
    fin = f'{OUT_DIR}/{key}.mp3'
    for attempt in range(3):
        try:
            tts = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
            await tts.save(raw)
            if os.path.getsize(raw) > 2000:
                break
        except Exception as e:
            if attempt == 2:
                print(f'  !! FAIL {key}: {e}')
                return None
            await asyncio.sleep(1.5)
    try:
        subprocess.run(['ffmpeg', '-y', '-v', 'quiet', '-i', raw,
                        '-af', 'volume=1.05', '-ar', '24000', '-ac', '1', '-b:a', '40k', fin],
                       check=True, timeout=30)
    except Exception as e:
        print(f'  !! ffmpeg FAIL {key}: {e}')
        return None
    os.remove(raw)
    return fin

async def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for key, who, text in LINES:
        p = await gen_one(key, who, text)
        if not p:
            sys.exit(1)
        d = ffprobe_dur(p)
        b64 = base64.b64encode(open(p, 'rb').read()).decode()
        print(f'  OK {key}: dur={d}s size={len(b64)//1024}KB')
        # وصله‌ی درجا در voices17_data.js
        src = open(DATA_JS, encoding='utf-8').read()
        pat = re.compile(r'(' + key + r'):\{d:[0-9.]+,a:"data:audio/mpeg;base64,[^"]+"\}')
        if not pat.search(src):
            print(f'  !! کلید {key} در داده نیست'); sys.exit(1)
        src = pat.sub(lambda m: f'{m.group(1)}:{{d:{d},a:"data:audio/mpeg;base64,{b64}"}}', src, count=1)
        open(DATA_JS, 'w', encoding='utf-8').write(src)
    print('patched voices17_data.js')

asyncio.run(main())
