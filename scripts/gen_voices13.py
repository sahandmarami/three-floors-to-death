#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
تولید صداهای گفتار فارسی طبیعی برای نسخه‌ی ۱۳ — با edge-tts (صدای نورال مایکروسافت)
۶ شخصیت با صدای/زمان/پیچ متمایز:
  n راوی     → FaridNeural   rate -12% pitch -15Hz   (گرم و آرام)
  a ارشان    → FaridNeural   rate +14% pitch +18Hz   (جوان و پرانرژی)
  p بازیکن   → FaridNeural   rate +4%  pitch -4Hz    (خنثی)
  r رادیو    → DilaraNeural  rate +3%  pitch +5Hz  + باندپس 420-2600 (صدای رادیو)
  b نگهبان   → FaridNeural   rate -22% pitch -40Hz   (بم و هولناک)
  d دستفروش  → DilaraNeural  rate -8%  pitch -8Hz    (مرموز)
خروجی: scripts/voices13_data.js  (VOICES13 = { key: {d:مدت, a:'data:audio/mpeg;base64,...'} })
"""
import asyncio, base64, json, os, subprocess, sys
import edge_tts

OUT_DIR = '/home/z/my-project/scripts/voice13'
DATA_JS = '/home/z/my-project/scripts/voices13_data.js'

PROFILE = {
    'n': ('fa-IR-FaridNeural',  '-12%', '-15Hz'),
    'a': ('fa-IR-FaridNeural',  '+14%', '+18Hz'),
    'p': ('fa-IR-FaridNeural',  '+4%',  '-4Hz'),
    'r': ('fa-IR-DilaraNeural', '+3%',  '+5Hz'),
    'b': ('fa-IR-FaridNeural',  '-22%', '-40Hz'),
    'd': ('fa-IR-DilaraNeural', '-8%',  '-8Hz'),
}

# ---- همه‌ی خطوط گفتگوی بازی (هماهنگ با سورس‌ها) ----
LINES = [
    # افتتاحیه (۱۲ خط)
    ('i1n1',  'n', 'همه‌چیز از یه ویروس ناشناخته شروع شد... از حومه‌ی شهر نشت کرد.'),
    ('i2n1',  'n', 'چند هفته بیشتر نکشید؛ شهر یواش‌یواش خالی شد.'),
    ('i3a1',  'a', 'وای... چه قدر ساکت شده! فک کنم فقط ما دوتا مونده‌ایم.'),
    ('i4p1',  'p', 'شاید... ولی تا این برج وایساده، ما هم وایساده‌ایم.'),
    ('i5a1',  'a', 'بیار ببین... طبقه‌ی سوم بهترین جاست؛ از بالا همه‌جا رو می‌بینیم.'),
    ('i6n1',  'n', 'با هر چیزی که دم دستتون بود، برج ساختید.'),
    ('i7a1',  'a', 'صداشون رو می‌شنوی؟ دارن میان!'),
    ('i8p1',  'p', 'آره... امشب اولین شبه. آماده باش!'),
    ('i9r1',  'r', 'به همه‌ی بازمانده‌ها: به سمت پاسگاه شمالی حرکت کنید. این پیام تکرار می‌شود.'),
    ('i10a1', 'a', 'شنیدی؟! یه جای امن هست! باید برسیمش!'),
    ('i11p1', 'p', 'اول باید از این شب زنده بمونیم... بعد حرف می‌زنیم.'),
    ('i12n1', 'n', 'هر شبی که دووم بیاری، یه قدم به پناهگاه نزدیک‌تری.'),
    # گفتگوی فاز ۱ انتقال‌ها (۵ خط)
    ('t1a1',  'a', 'برج داره فرو می‌ریزه! بپر! سریع!'),
    ('t2p1',  'p', 'همه‌چی سیاهه... هیچی نمی‌تونم ببینم!'),
    ('t2a1',  'a', 'چراغ‌قوه‌ت رو روشن کن! موانع رو هم رد کن!'),
    ('t3a1',  'a', 'راه زمینی بسته‌ست! باید از بالای دره بریم!'),
    ('t3p1',  'p', 'از بالای دره؟! تو دیوونه‌ای ارشان!'),
    # بارک‌های انتقال (۷ خط)
    ('tb1c',  'a', 'گرفتمت! محکم خودت رو بگیر!'),
    ('tb1s',  'a', 'فرمان با توئه! گاز بده!'),
    ('tb1o',  'n', 'به انبارهای مه‌گرفته رسیدید...'),
    ('tb2s',  'a', 'بدو! رد شو!'),
    ('tb2o',  'n', 'از تونل تاریک بیرون اومدید...'),
    ('tb3c',  'a', 'بگیرش! زیپ رو بگیر!'),
    ('tb3o',  'n', 'به برج مخابراتی رسیدید...'),
    # باس آخرین شب + بقای روز (۷ خط)
    ('fbw1',  'a', 'آوارها رو بترکون! نذار به برج بخورن!'),
    ('fbw2',  'a', 'نگهبانِ آخرین شب داره میاد!'),
    ('fb1b1', 'b', 'خشم... من!'),
    ('fbd1',  'b', 'نمی‌شه... تمومش کردی...'),
    ('sbo1',  'p', 'وای... برق رفت! چراغ‌قوه رو روشن کن!'),
    ('spd1',  'd', 'کالای کمیاب دارم... فقط، برای تو.'),
    ('fdf1',  'n', 'برج فرو ریخت... زامبی‌ها همه‌جا هستند.'),
    # پیروزی (۲ خط)
    ('v1n1',  'n', 'سحر رسیده... و تو هنوز ایستاده‌ای.'),
    ('v2a1',  'a', 'شنیدی؟! پناهگاه هنوز بازه... فقط چند کیلومتر مونده. بریم!'),
]

def ffprobe_dur(path):
    try:
        out = subprocess.run(['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
                              '-of', 'csv=p=0', path], capture_output=True, text=True, timeout=20)
        return round(float(out.stdout.strip()), 2)
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
    # پس‌پردازش: رادیو = باندپس؛ همه = نرمال‌سازی حجم + مونو ۴۰k
    af = ('highpass=f=420,lowpass=f=2600,volume=1.35' if who == 'r'
          else 'volume=1.05')
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
    # پاک‌سازی اجراهای قبلی
    for f in os.listdir(OUT_DIR):
        os.remove(os.path.join(OUT_DIR, f))
    print(f'تولید {len(LINES)} کلیپ با edge-tts...')
    sem = asyncio.Semaphore(4)

    async def worker(k, w, t):
        async with sem:
            return await gen_one(k, w, t)

    results = await asyncio.gather(*[worker(k, w, t) for k, w, t in LINES])
    ok = [(k, p) for (k, w, t), p in zip(LINES, results) if p]
    failed = [k for (k, w, t), p in zip(LINES, results) if not p]
    print(f'موفق: {len(ok)} / ناموفق: {len(failed)} {failed}')
    if failed:
        sys.exit(1)

    # ساخت فایل داده‌ی JS
    total = 0
    parts = []
    for key, path in ok:
        with open(path, 'rb') as f:
            b64 = base64.b64encode(f.read()).decode('ascii')
        total += len(b64)
        dur = ffprobe_dur(path)
        parts.append((key, dur, b64))
    with open(DATA_JS, 'w', encoding='utf-8') as f:
        f.write('/* ==================================================================\n')
        f.write('   سه طبقه تا بقا — نسخه‌ی ۱۳٫۰ — داده‌ی صداهای گفتار (تولید خودکار)\n')
        f.write('   ' + str(len(parts)) + ' کلیپ MP3 با صدای نورال فارسی (edge-tts) — پایه ۶۴\n')
        f.write('   شخصیت‌ها: n راوی / a ارشان / p بازیکن / r رادیو / b نگهبان / d دستفروش\n')
        f.write('   ================================================================== */\n')
        f.write('const VOICES13 = {\n')
        for key, dur, b64 in parts:
            f.write(f'{key}:{{d:{dur},a:"data:audio/mpeg;base64,{b64}"}},\n')
        f.write('};\n')
    print(f'خروجی: {DATA_JS}')
    print(f'حجم خام MP3: {total*3//4//1024}KB — کل فایل داده: {total//1024}KB (base64)')

asyncio.run(main())
