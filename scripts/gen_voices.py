# -*- coding: utf-8 -*-
"""تولید صدای گفتار فارسی برای نسخه‌ی ۱۱ — «سه طبقه تا بقا»
پایپ‌لاین: espeak-ng (صدای فارسی) → ffmpeg پس‌پردازش (EQ/اکو/رادیو/...) → MP3 → base64 → voices_data.js
هر شخصیت پارامتر صوتی خودش را دارد تا از هم تفکیک شوند."""
import subprocess, os, json, base64, sys

ROOT = '/home/z/my-project'
TMP = ROOT + '/scripts/voice_tmp'
os.makedirs(TMP, exist_ok=True)

# ---------- شخصیت‌ها: (سرعت espeak, پیچ espeak 0-99, پروفایل پس‌پردازش) ----------
SPK = {
    'n':  ('narrator', dict(s=132, p=30, a=190)),
    'a':  ('arshan',   dict(s=164, p=62, a=195)),
    'p':  ('player',   dict(s=148, p=42, a=190)),
    'r':  ('radio',    dict(s=144, p=50, a=185)),
    'b':  ('boss',     dict(s=100, p=12, a=200)),
    'd':  ('peddler',  dict(s=138, p=46, a=180)),
}

# ---------- جمله‌ها: (شناسه، شخصیت، متن) ----------
LINES = [
    # --- افتتاحیه (۵ صحنه) ---
    ('i1n1', 'n', 'چند ماه پیش، یک ویروس ناشناخته از حومه‌ی شهر نشت کرد.'),
    ('i1n2', 'n', 'ظرف چند هفته، شهر خالی شد.'),
    ('i2a1', 'a', 'وای... چه قدر ساکت شده. فکر کنم فقط ما دو تا مونده‌ایم.'),
    ('i2p1', 'p', 'شاید. ولی تا وقتی این برج وایساده، ما هم وایساده‌ایم.'),
    ('i3a1', 'a', 'بیار ببین... طبقه‌ی سوم بهترین جاست. از بالا همه جا رو می‌بینیم.'),
    ('i3n1', 'n', 'با هر چیزی که در دستتان رسید، برجی ساختید.'),
    ('i4a1', 'a', 'صداشون رو می‌شنوی؟ دارن میان!'),
    ('i4p1', 'p', 'آره. امشب، اولین شبِ محاصره‌ست. آماده باش!'),
    ('i5r1', 'r', 'به همه‌ی بازمانده‌ها. به سمت پاسگاه شمالی حرکت کنید. این پیام تکرار می‌شود.'),
    ('i5a1', 'a', 'شنیدی؟ یه جای امن هست! باید برسیمش!'),
    ('i5p1', 'p', 'اول باید از این شب زنده بمونیم. بعد حرف می‌زنیم.'),
    ('i5n1', 'n', 'هر شبی که دوام بیاری، یک قدم به پناهگاه نزدیک‌تری.'),
    # --- انتقال ۱: فروریختن برج + ماشین ---
    ('t1a1', 'a', 'برج داره فرو می‌ریزه! بپر! سریع!'),
    ('t1a2', 'a', 'گرفتمت! محکم خودت رو بگیر!'),
    ('t1a3', 'a', 'فرمون با منه! تو فقط شلیک کن!'),
    ('t1a4', 'a', 'رسیدیم! این برج فولادی، مال ماست!'),
    # --- انتقال ۲: تونل تاریک ---
    ('t2p1', 'p', 'همه چی سیاهه... نمی‌تونم چیزی ببینم.'),
    ('t2a1', 'a', 'چراغ‌قوه‌ت رو روشن کن! و موانع رو رد کن!'),
    ('t2a2', 'a', 'تا آخر تونل زیاده! سرعتت رو کم نکن!'),
    ('t2a3', 'a', 'دیدی نور می‌کنه؟ اون پاسگاهه!'),
    # --- انتقال ۳: زیپ‌لاین ---
    ('t3a1', 'a', 'راه زمینی بسته‌ست! باید از روی دره بریم!'),
    ('t3p1', 'p', 'از بالای دره؟ تو دیوونه‌ای!'),
    ('t3a2', 'a', 'دیوونه‌ی زنده! برو! من پشتته!'),
    ('t3a3', 'a', 'اون قله... برج مخابراتیه. آخرین مقصد ماست!'),
    # --- باس آخرین شب ---
    ('bw1',  'b', 'آخریـن شب رسیده... و نگهبان، می‌آید.'),
    ('b1a1', 'a', 'آوارها رو بترکون! نذار بهت بخورن!'),
    ('b1b1', 'b', 'حالا... خشمِ من را ببین!'),
    ('bd1',  'b', 'نمی‌شود... نمی‌شود باخت...'),
    ('v1n',  'n', 'سحر رسیده... و تو هنوز ایستاده‌ای. حالا، به سوی پناهگاه.'),
    # --- لحظه‌های گیم‌پلی ---
    ('bo1',  'p', 'برق رفت! چراغ‌قوه رو روشن کن!'),
    ('pd1',  'd', 'کالای کمیاب دارم... فقط، برای تو.'),
]

# ---------- زنجیره‌ی پس‌پردازش هر شخصیت ----------
def chain(spk):
    # مشترک: حذف سکوت ابتدا/انتها + نرمال بلندی
    trim = ("silenceremove=start_periods=1:start_threshold=-45dB,"
            "areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
            "apad=pad_dur=0.18")
    if spk == 'n':   # راوی: گرم، کمی کلیسایی
        return (f"{trim},highpass=f=95,equalizer=f=210:t=q:w=1.1:g=2.5,"
                "equalizer=f=2800:t=q:w=1:g=3,equalizer=f=6200:t=q:w=1.4:g=-4,"
                "aecho=0.7:0.25:70:0.14,acompressor=threshold=0.32:ratio=3:attack=8:release=140,"
                "loudnorm=I=-17.5:TP=-2:LRA=9")
    if spk == 'a':   # ارشان: روشن و جوان
        return (f"{trim},highpass=f=110,equalizer=f=190:t=q:w=1:g=1.5,"
                "equalizer=f=3200:t=q:w=1:g=4,equalizer=f=7500:t=q:w=1.3:g=-5,"
                "aecho=0.5:0.16:46:0.1,acompressor=threshold=0.3:ratio=2.6:attack=5:release=110,"
                "loudnorm=I=-16.5:TP=-1.8:LRA=11")
    if spk == 'p':   # بازیکن: معقول
        return (f"{trim},highpass=f=105,equalizer=f=250:t=q:w=1:g=1.8,"
                "equalizer=f=3000:t=q:w=1:g=2.5,equalizer=f=6800:t=q:w=1.2:g=-4,"
                "aecho=0.55:0.18:55:0.1,acompressor=threshold=0.3:ratio=2.8:attack=6:release=120,"
                "loudnorm=I=-17:TP=-2:LRA=10")
    if spk == 'r':   # رادیو: باند تلفنی + نویز
        return (f"{trim},highpass=f=380,lowpass=f=2900,equalizer=f=1600:t=q:w=1:g=4,"
                "acompressor=threshold=0.18:ratio=5:attack=4:release=90,"
                "aecho=0.35:0.2:95:0.08,loudnorm=I=-16:TP=-2:LRA=7")
    if spk == 'b':   # غول: بم + کشیده + اکوی سنگین
        return (f"{trim},asetrate=22050*0.82,aresample=22050,atempo=0.94,"
                "highpass=f=70,equalizer=f=150:t=q:w=1:g=4,equalizer=f=900:t=q:w=1.2:g=-3,"
                "equalizer=f=2400:t=q:w=1:g=-5,aecho=0.8:0.35:180|120:0.3|0.22,"
                "acompressor=threshold=0.35:ratio=4:attack=10:release=200,"
                "loudnorm=I=-16:TP=-2:LRA=9")
    if spk == 'd':   # دستفروش: مرموز
        return (f"{trim},highpass=f=100,equalizer=f=600:t=q:w=1.2:g=-3,"
                "equalizer=f=1600:t=q:w=1:g=2.5,aecho=0.75:0.3:150|90:0.26|0.18,"
                "tremolo=f=4.5:d=0.12,acompressor=threshold=0.3:ratio=3:attack=8:release=160,"
                "loudnorm=I=-17:TP=-2:LRA=8")
    return trim + ",loudnorm=I=-17:TP=-2"

def gen_line(lid, spk, text):
    name, par = SPK[spk]
    raw = f"{TMP}/{lid}_raw.wav"
    out = f"{TMP}/{lid}.mp3"
    # ۱) espeak-ng فارسی
    subprocess.run(['espeak-ng', '-v', 'fa', '-s', str(par['s']), '-p', str(par['p']),
                    '-a', str(par['a']), '-z', text, '-w', raw], check=True)
    # ۲) پس‌پردازش + MP3 (رادیو: نویز صورتی سبک زیر صدا)
    if spk == 'r':
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw,
                        '-f', 'lavfi', '-t', '999', '-i', 'anoisesrc=color=pink:amplitude=0.012',
                        '-filter_complex',
                        f"[0:a]{chain(spk)}[v];[1:a]volume=0.5[ns];[v][ns]amix=inputs=2:duration=first:dropout_transition=0",
                        '-codec:a', 'libmp3lame', '-b:a', '40k', '-ar', '22050', '-ac', '1', out], check=True)
    else:
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw,
                        '-af', chain(spk),
                        '-codec:a', 'libmp3lame', '-b:a', '40k', '-ar', '22050', '-ac', '1', out], check=True)
    # ۳) مدت دقیق
    d = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                        '-of', 'csv=p=0', out], capture_output=True, text=True).stdout.strip()
    return out, float(d)

def main():
    meta, clips, total = {}, {}, 0
    for lid, spk, text in LINES:
        out, dur = gen_line(lid, spk, text)
        b = open(out, 'rb').read()
        clips[lid] = 'data:audio/mpeg;base64,' + base64.b64encode(b).decode()
        meta[lid] = {'spk': SPK[spk][0], 'dur': round(dur, 2)}
        total += len(b)
        print(f"  {lid:6s} {SPK[spk][0]:9s} {dur:5.2f}s  {len(b)//1024}KB")
    # خروجی JS
    with open(ROOT + '/scripts/voices_data.js', 'w', encoding='utf-8') as f:
        f.write("/* سه طبقه تا بقا — نسخه‌ی ۱۱٫۰ — داده‌ی صدای گفتار (espeak-ng فارسی + پس‌پردازش)\n")
        f.write(f"   {len(clips)} کلیپ • {total//1024}KB — تولید: scripts/gen_voices.py */\n")
        f.write("const VOICE_CLIPS = {\n")
        for lid, uri in clips.items():
            f.write(f"  {jid(lid)}: '{uri}',\n")
        f.write("};\n")
        f.write("const VOICE_META = " + json.dumps(meta, ensure_ascii=False, indent=1) + ";\n")
    print(f"\nDONE: {len(clips)} clips, raw total {total//1024}KB → scripts/voices_data.js")

def jid(lid):
    """شناسه‌ی امن برای JS (بخش عددی آخر جدا می‌شود)"""
    import re
    m = re.match(r'^([a-z]+)(\d+)$', lid)
    return f"'{m.group(1)}{m.group(2)}'" if m else f"'{lid}'"

if __name__ == '__main__':
    main()
