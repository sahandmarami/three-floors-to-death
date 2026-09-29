#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
تولید صداهای گفتار فارسی طبیعی برای نسخه‌ی ۱۷ — با edge-tts (صدای نورال مایکروسافت)

تازه‌های ۱۷:
  - ۱۲ خط افتتاحیه «بازنویسی محاوره‌ای» (کوتاه/مستقیم/ریتم گفت‌وگوی واقعی —
    هم‌لحن با دیالوگ‌های انتقال مثل «برج داره فرو می‌ریزه! بپر! سریع!»)
  - ۶ بارک ارشان روی برج وسط گیم‌پلی (aw1..aw6)
  - ۲ خط ارشان در مینی‌گیم رانندگی (d1a1/d1a2)
  - ۱ خط راوی در کات‌سین فروریختن — منطقِ رسیدن ارشان با ماشین (t1n1)
  - بقیه‌ی کلیپ‌ها از voices14_data.js عیناً منتقل می‌شوند

خروجی: scripts/voices17_data.js  (VOICES17 = { key: {d:مدت, a:'data:audio/mpeg;base64,...'} })
"""
import asyncio, base64, os, re, subprocess, sys
import edge_tts

OUT_DIR = '/home/z/my-project/scripts/voice17'
DATA_JS = '/home/z/my-project/scripts/voices17_data.js'
OLD_JS = '/home/z/my-project/scripts/voices14_data.js'

PROFILE = {
    'n': ('fa-IR-FaridNeural',  '-12%', '-15Hz'),   # راوی — گرم و آرام
    'a': ('fa-IR-FaridNeural',  '+14%', '+18Hz'),   # ارشان — جوان و پرانرژی
    'p': ('fa-IR-FaridNeural',  '+4%',  '-4Hz'),    # بازیکن — خنثی
    'r': ('fa-IR-DilaraNeural', '+3%',  '+5Hz'),    # رادیو (+ باندپس ffmpeg)
    'b': ('fa-IR-FaridNeural',  '-22%', '-40Hz'),   # نگهبان — بم و هولناک
    'd': ('fa-IR-DilaraNeural', '-8%',  '-8Hz'),    # دستفروش — مرموز
}

# ---- خطوط تازه‌ی نسخه‌ی ۱۷ ----
NEW_LINES = [
    # افتتاحیه — بازنویسی محاوره‌ای ۱۷٫۰ (۱۲ خط)
    ('i1n1',  'n', 'همه‌چیز از یه ویروس شروع شد؛ بی‌خبر از حومه‌ی شهر اومد وسطِ مون.'),
    ('i2n1',  'n', 'چند هفته بیشتر طول نکشید؛ کوچه‌ها یکی‌یکی ساکت شدن و شهر خالی موند.'),
    ('i3a1',  'a', 'چه قدر ساکت شده... انگار این شهر فقط برای خودمون مونده.'),
    ('i4p1',  'p', 'ممکنه فقط خودمون باشیم، نمی‌دونم... ولی تا این برج سرپاست، ما هم سرپاییم.'),
    ('i5a1',  'a', 'طبقه‌ی سوم بهترین جای دیده‌بانیه؛ از بالا همه‌جا رو می‌بینیم.'),
    ('i6n1',  'n', 'و اونا با هر چی دم دستشون بود، شب و روز، این برج رو ساختن.'),
    ('i7a1',  'a', 'صداشون رو می‌شنوی؟! دارن میان!'),
    ('i8p1',  'p', 'می‌شنوم... امشب شبِ اوله. آماده باش!'),
    ('i9r1',  'r', 'به همه‌ی بازمانده‌ها: به سمت پاسگاه شمالی حرکت کنید. این پیام تکرار می‌شه.'),
    ('i10a1', 'a', 'شنیدی؟! هنوز یه جای امن هست! باید برسیم بهش.'),
    ('i11p1', 'p', 'اول باید از همین شب زنده بیرون بیایم؛ بقیه‌ش رو بعداً می‌گیم.'),
    ('i12n1', 'n', 'و هر شبی که دوام بیارن، یه قدم به پناهگاه نزدیک‌تر می‌شن.'),
    # منطقِ فرار ارشان — کات‌سین فروریختن برج (فصل ۱)
    ('t1n1',  'n', 'ارشان از قبل رفته بود پایینِ برج تا ماشین رو گرم کنه؛ برای همین همون لحظه رسید!'),
    # بارک‌های ارشان روی برج — وسط گیم‌پلی دفاعی (۱۷٫۰)
    ('aw1',   'a', 'من همین‌جام! دیده‌بانی با من — تو فقط شلیک کن!'),
    ('aw2',   'a', 'حواست باشه! یه گروه بزرگ از اون طرف داره میاد!'),
    ('aw3',   'a', 'دمت گرم! همین‌جوری بزن!'),
    ('aw4',   'a', 'باتری چراغ‌قوه‌ت داره تموم می‌شه!'),
    ('aw5',   'a', 'برج ترک خورده! حواست جمع باشه!'),
    ('aw6',   'a', 'خسته نباشی! موج بعدی رو من رصد می‌کنم.'),
    # ارشان در مینی‌گیم رانندگی شبه‌سه‌بعدی (۱۷٫۰)
    ('d1a1',  'a', 'مواظب باش! تا انبارها یه راه باقی مونده!'),
    ('d1a2',  'a', 'اون طرف یه جعبه دیدم! بگیرش!'),
]

# کلیدهایی که از داده‌ی ۱۴ عیناً منتقل می‌شوند (متن‌شان تغییری نکرده)
KEEP_FROM_14 = ['pd1a', 'pd1b', 'pd1c', 'pd1l',
                't1a1', 't2p1', 't2a1', 't3a1', 't3p1',
                'tb1c', 'tb1s', 'tb1o', 'tb2s', 'tb2o', 'tb3c', 'tb3o',
                'fbw1', 'fbw2', 'fb1b1', 'fbd1', 'sbo1', 'fdf1', 'v1n1', 'v2a1']


def parse_old(path):
    """استخراج {key: (d, b64)} از voices14_data.js"""
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
    missing_old = [k for k in KEEP_FROM_14 if k not in old]
    if missing_old:
        print(f'!! در داده‌ی ۱۴ این کلیدها نیستند: {missing_old}')
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
    for k in KEEP_FROM_14:
        d, a = old[k]
        parts.append((k, d, a.split(',', 1)[1]))   # فقط base64 — پیشوند در نویسنده اضافه می‌شود

    total = sum(len(b) for _, _, b in parts)
    with open(DATA_JS, 'w', encoding='utf-8') as f:
        f.write('/* ==================================================================\n')
        f.write('   سه طبقه تا بقا — نسخه‌ی ۱۷٫۰ — داده‌ی صداهای گفتار (تولید خودکار)\n')
        f.write(f'   {len(parts)} کلیپ MP3 با صدای نورال فارسی (edge-tts) — پایه ۶۴\n')
        f.write('   شخصیت‌ها: n راوی / a ارشان / p بازیکن / r رادیو / b نگهبان / d دستفروش\n')
        f.write('   ۱۷٫۰: افتتاحیه بازنویسی محاوره‌ای + بارک‌های ارشان روی برج (aw) +\n')
        f.write('         رانندگی شبه‌سه‌بعدی (d1) + منطق فرار ارشان (t1n1)\n')
        f.write('   ================================================================== */\n')
        f.write('const VOICES17 = {\n')
        for key, dur, b64 in parts:
            f.write(f'{key}:{{d:{dur},a:"data:audio/mpeg;base64,{b64}"}},\n')
        f.write('};\n')
    print(f'خروجی: {DATA_JS}')
    print(f'کل فایل داده: {total // 1024}KB (base64) — {len(parts)} کلیپ')


asyncio.run(main())
