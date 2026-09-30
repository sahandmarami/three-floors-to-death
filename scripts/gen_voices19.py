#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""نسخه‌ی ۱۹ — تولید ۲۴ کلیپ تازه و وصله/افزودن در voices17_data.js:
  • کات‌سین پناهگاه (sh*): ورود/گفتگو با دکتر مریم (m = Dilara)/آژیر رادیو
  • «این داستان ادامه دارد...» (tbc1n)
  • مینی‌گیم قایق (b1a*) + اسنوموبیل (s1a*) + بارک‌های شروع/پایان (tb2s/tb2o/tb3s)
  • هشدار یورش نگهبان (fbz1)
  • بازتولید t2p1/t2a1/t3a1/t3p1/tb2s/tb2o (متن‌های تازه‌ی قایق/اسنوموبیل)
"""
import asyncio, base64, os, re, subprocess, sys
sys.path.insert(0, '/home/z/.venv/lib/python3*/site-packages')
import edge_tts

OUT_DIR = '/home/z/my-project/scripts/voice19'
DATA_JS = '/home/z/my-project/scripts/voices17_data.js'

PROFILE = {
    'n': ('fa-IR-FaridNeural',  '-12%', '-15Hz'),   # راوی — گرم و آرام
    'a': ('fa-IR-FaridNeural',  '+14%', '+18Hz'),   # ارشان — جوان و پرانرژی
    'p': ('fa-IR-FaridNeural',  '+4%',  '-4Hz'),    # بازیکن — خنثی
    'r': ('fa-IR-DilaraNeural', '+3%',  '+5Hz'),    # رادیو (+ باندپس)
    'm': ('fa-IR-DilaraNeural', '-4%',  '-2Hz'),    # (۱۹) دکتر مریم — آرام و زنانه
}

# (کلید، شخصیت، متن، تازه؟) — تازه=False یعنی وصله‌ی درجا، True یعنی افزودن
LINES = [
    # ---- کات‌سین پناهگاه ----
    ('sh1a',  'a', 'اونجاست! درِ پناهگاه رو می‌بینم! زود باش!', True),
    ('sh2n',  'n', 'دری فولادی در دلِ تپه... و صدایی که می‌گه هنوز جایی برای موندن هست.', True),
    ('sh3m',  'm', 'خوش اومدید... ما شما رو از دیده‌بان دیدیم. شب‌ها زنده موندن کارِ هر کسی نیست.', True),
    ('sh4a',  'a', 'این‌جا واقعاً امنه؟', True),
    ('sh5m',  'm', 'دیوارها هنوز سرِ پانه... ولی آذوقه دو هفته بیشتر نداره و رادیومن نیم‌سوخته‌ست.', True),
    ('sh6p',  'p', 'رادیو رو من درست می‌کنم... فقط یه آنتنِ بلند لازم داریم.', True),
    ('sh7a',  'a', 'و منم دیوارها رو محکم می‌کنم. این بار فقط دوتا نیستیم!', True),
    ('sh8m',  'm', 'خیلی خب... استراحت کنید. فردا روزِ سختیه.', True),
    ('sh9r',  'r', 'تمامِ واحدها گوش کنید! گله‌ی بزرگ از دره‌ی شمالی به سمتِ پناهگاه شما حرکت کرده... زمان ندارید!', True),
    ('sh10a', 'a', 'می‌شنوی زنگِ خطر رو؟... این تازه اولِ کاره.', True),
    ('sh11n', 'n', 'و شب، وقتی همه خواب بودند... داستان هنوز تمام نشده بود.', True),
    ('tbc1n', 'n', 'این داستان ادامه دارد...', True),
    # ---- مینی‌گیم قایق (فصل ۲→۳) ----
    ('b1a1',  'a', 'گاز بده! از این کانال فقط یه راه به پاسگاه هست!', True),
    ('b1a2',  'a', 'اون آخرِ کانال یه چراغ چشمک می‌زنه! نزدیکش شو!', True),
    ('tb2s',  'a', 'فرمان قایق با توئه! گاز بده!', False),
    ('tb2o',  'n', 'به پاسگاه نظامی رسیدید...', False),
    ('t2p1',  'p', 'همه‌چی مه‌ست! رودخانه رو نمی‌بینم!', False),
    ('t2a1',  'a', 'چراغِ قایق روشنه! فرمان با تو — از کانال رد شو!', False),
    # ---- مینی‌گیم اسنوموبیل (فصل ۳→۴) ----
    ('s1a1',  'a', 'توفان برف میاد! تو رگبارش گاز نده!', True),
    ('s1a2',  'a', 'اون بالا یه جعبه دیدم! بهش نزدیک شو!', True),
    ('tb3s',  'a', 'گاز بده! از برف رد شو!', True),
    ('t3a1',  'a', 'راه زمینی پر از گله‌ست! باید از شیب برفی بالا بریم!', False),
    ('t3p1',  'p', 'با این برف و باد؟! تو دیوونه‌ای ارشان!', False),
    # ---- نگهبان: هشدار یورش ----
    ('fbz1',  'a', 'مواظب باش! داره شارژ می‌کنه! بزن بهش!', True),
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
    af = ('highpass=f=420,lowpass=f=2600,volume=1.35' if who == 'r'
          else ('volume=1.0' if who == 'm' else 'volume=1.05'))
    try:
        # (۱۹) بیت‌ریت ۳۲k برای کنترلِ حجمِ فایلِ تک‌فایلِ بزرگ
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
    added = patched = 0
    total_b = 0
    for key, who, text, fresh in LINES:
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
            # کلید تازه — قبل از بستنِ آبجکت اضافه می‌شود
            body = src.rstrip()
            assert body.endswith('};'), 'closing brace of VOICES17 not found'
            src = body[:-2] + '  ' + entry + ',\n};\n'
            added += 1
    open(DATA_JS, 'w', encoding='utf-8').write(src)
    print(f'patched={patched} added={added} total_new_base64={total_b//1024}KB')

asyncio.run(main())
