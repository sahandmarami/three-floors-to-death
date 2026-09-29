#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
تولید صداهای گفتار فارسی طبیعی برای نسخه‌ی ۱۴ — با edge-tts (صدای نورال مایکروسافت)

تازه‌های ۱۴:
  - ۱۲ خط افتتاحیه «بازنویسی ادبی» (دستور و نقطه‌گذاری درست، جمله‌بندی روان)
  - ۴ خط داستانِ «دستفروش مرموز» (استوری‌مود: آمدن پایین برج + خداحافظی غروب)
  - بقیه‌ی کلیپ‌ها (انتقال‌ها/باس/پیروزی/قطع برق) از voices13_data.js عیناً منتقل می‌شوند

خروجی: scripts/voices14_data.js  (VOICES14 = { key: {d:مدت, a:'data:audio/mpeg;base64,...'} })
"""
import asyncio, base64, os, re, subprocess, sys
import edge_tts

OUT_DIR = '/home/z/my-project/scripts/voice14'
DATA_JS = '/home/z/my-project/scripts/voices14_data.js'
OLD_JS = '/home/z/my-project/scripts/voices13_data.js'

PROFILE = {
    'n': ('fa-IR-FaridNeural',  '-12%', '-15Hz'),   # راوی — گرم و آرام
    'a': ('fa-IR-FaridNeural',  '+14%', '+18Hz'),   # ارشان — جوان و پرانرژی
    'p': ('fa-IR-FaridNeural',  '+4%',  '-4Hz'),    # بازیکن — خنثی
    'r': ('fa-IR-DilaraNeural', '+3%',  '+5Hz'),    # رادیو (+ باندپس ffmpeg)
    'b': ('fa-IR-FaridNeural',  '-22%', '-40Hz'),   # نگهبان — بم و هولناک
    'd': ('fa-IR-DilaraNeural', '-8%',  '-8Hz'),    # دستفروش — مرموز
}

# ---- خطوط تازه‌ی نسخه‌ی ۱۴ (بازنویسی/جدید) ----
NEW_LINES = [
    # افتتاحیه — بازنویسی ادبی ۱۴٫۰ (۱۲ خط)
    ('i1n1',  'n', 'همه‌چیز از یک ویروس ناشناخته آغاز شد؛ بی‌خبر، از حومه‌ی شهر به درون آمد.'),
    ('i2n1',  'n', 'چند هفته بیشتر نگذاشت؛ کوچه‌ها یکی‌یکی به سکوت نشستند و شهر خالی شد.'),
    ('i3a1',  'a', 'چه قدر ساکت شده... انگار این شهر فقط برای ما دو نفر مانده است.'),
    ('i4p1',  'p', 'تنها هستیم یا نه، نمی‌دانم؛ اما تا این برج سرپا است، ما هم سرپا می‌مانیم.'),
    ('i5a1',  'a', 'طبقه‌ی سوم بهترین جای دیده‌بانی است؛ از آن‌جا همه‌جا را می‌بینیم.'),
    ('i6n1',  'n', 'و آن‌ها با هر چیزی که دم دست داشتند، شب و روز، برج خود را ساختند.'),
    ('i7a1',  'a', 'صدایشان را می‌شنوی؟ دارند می‌آیند!'),
    ('i8p1',  'p', 'می‌شنوم... امشب، شبِ اول است. آماده باش!'),
    ('i9r1',  'r', 'به همه‌ی بازماندگان: به سوی پاسگاه شمالی حرکت کنید. این پیام تکرار می‌شود.'),
    ('i10a1', 'a', 'شنیدی؟ هنوز جای امنی هست! باید به آنجا برسیم.'),
    ('i11p1', 'p', 'اول باید از همین شب زنده بیرون بیاییم؛ بقیه‌اش را بعد می‌گوییم.'),
    ('i12n1', 'n', 'و هر شبی که دوام بیاورند، یک قدم به پناهگاه نزدیک‌تر می‌شوند.'),
    # داستان دستفروش مرموز — استوری‌مود ۱۴٫۰ (۴ خط)
    ('pd1a',  'd', 'شب نزدیک است... و من کالایی کمیاب دارم؛ فقط برای تو.'),
    ('pd1b',  'p', 'کالای کمیاب؟ از کجا معلوم تقلبی نباشد؟'),
    ('pd1c',  'd', 'هیچ‌چیز در این روزها معلوم نیست... اما تا غروب، این‌جا هستم. زود انتخاب کن.'),
    ('pd1l',  'd', 'غروب شد... باید رفت. شاید باز هم یکدیگر را ببینیم.'),
]

# کلیدهایی که از داده‌ی ۱۳ عیناً منتقل می‌شوند (متن‌شان تغییری نکرده)
KEEP_FROM_13 = ['t1a1', 't2p1', 't2a1', 't3a1', 't3p1',
                'tb1c', 'tb1s', 'tb1o', 'tb2s', 'tb2o', 'tb3c', 'tb3o',
                'fbw1', 'fbw2', 'fb1b1', 'fbd1', 'sbo1', 'fdf1', 'v1n1', 'v2a1']


def parse_old(path):
    """استخراج {key: (d, b64)} از voices13_data.js"""
    src = open(path, encoding='utf-8').read()
    out = {}
    for m in re.finditer(r'([a-z0-9]+):\{d:([0-9.]+),a:"(data:audio/mpeg;base64,[^"]+)"\}', src):
        out[m.group(1)] = (float(m.group(2)), m.group(3))
    return out


def ffprobe_dur(path):
    try:
        r = subprocess.run(['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
                            '-of', 'csv=p=0', path], capture_output=True, text=True, timeout=20)
        return round(float(r.stdout.strip()), 2)
    except Exception:
        return 0.0


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
    af = ('highpass=f=420,lowpass=f=2600,volume=1.35' if who == 'r' else 'volume=1.05')
    try:
        subprocess.run(['ffmpeg', '-y', '-v', 'quiet', '-i', raw,
                        '-af', af, '-ar', '24000', '-ac', '1', '-b:a', '40k', fin],
                       check=True, timeout=30)
    except Exception as e:
        print(f'  !! ffmpeg FAIL {key}: {e}')
        return None
    os.remove(raw)
    return fin


async def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for f in os.listdir(OUT_DIR):
        os.remove(os.path.join(OUT_DIR, f))

    old = parse_old(OLD_JS)
    missing_old = [k for k in KEEP_FROM_13 if k not in old]
    if missing_old:
        print(f'!! در داده‌ی ۱۳ این کلیدها نیستند: {missing_old}')
        sys.exit(1)

    print(f'تولید {len(NEW_LINES)} کلیپ تازه با edge-tts...')
    sem = asyncio.Semaphore(4)

    async def worker(k, w, t):
        async with sem:
            return await gen_one(k, w, t)

    results = await asyncio.gather(*[worker(k, w, t) for k, w, t in NEW_LINES])
    failed = [k for (k, w, t), p in zip(NEW_LINES, results) if not p]
    print(f'موفق: {len(NEW_LINES) - len(failed)} / ناموفق: {len(failed)} {failed}')
    if failed:
        sys.exit(1)

    parts = []
    for (k, w, t), p in zip(NEW_LINES, results):
        with open(p, 'rb') as f:
            b64 = base64.b64encode(f.read()).decode('ascii')
        parts.append((k, ffprobe_dur(p), b64))
    for k in KEEP_FROM_13:
        d, a = old[k]
        parts.append((k, d, a.split(',', 1)[1]))   # فقط base64 — پیشوند در نویسنده اضافه می‌شود

    total = sum(len(b) for _, _, b in parts)
    with open(DATA_JS, 'w', encoding='utf-8') as f:
        f.write('/* ==================================================================\n')
        f.write('   سه طبقه تا بقا — نسخه‌ی ۱۴٫۰ — داده‌ی صداهای گفتار (تولید خودکار)\n')
        f.write(f'   {len(parts)} کلیپ MP3 با صدای نورال فارسی (edge-tts) — پایه ۶۴\n')
        f.write('   شخصیت‌ها: n راوی / a ارشان / p بازیکن / r رادیو / b نگهبان / d دستفروش\n')
        f.write('   ۱۴٫۰: افتتاحیه بازنویسی ادبی + داستان صوتی دستفروش مرموز\n')
        f.write('   ================================================================== */\n')
        f.write('const VOICES14 = {\n')
        for key, dur, b64 in parts:
            f.write(f'{key}:{{d:{dur},a:"data:audio/mpeg;base64,{b64}"}},\n')
        f.write('};\n')
    print(f'خروجی: {DATA_JS}')
    print(f'کل فایل داده: {total // 1024}KB (base64) — {len(parts)} کلیپ')


asyncio.run(main())
