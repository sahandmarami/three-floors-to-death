#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""v23 — تولید صداهای گفتار با ElevenLabs v3 (فینگلیش) + پس‌پردازش ffmpeg
۷ صدای متمایز:  p Brian · a Liam · m Matilda · n Daniel · r River · b Callum · d Roger
خروجی: scripts/voice23/*.mp3 + scripts/voices23_data.js (VOICES23)
سهمیه: ۴۵۲۰ کاراکتر — مصرف: ۴۴۳۳ (نهایی) — خطر: فقط ۸۷ کاراکتر جا برای تلاش مجدد
"""
import json, os, subprocess, sys, time, urllib.request, urllib.error, base64

sys.path.insert(0, '/home/z/my-project/scripts')
from dialogues23 import LINES

KEY = 'sk_b92a5f370c695025ff6bcfe09a3d66c299c3ad4a706d4581'
API = 'https://api.elevenlabs.io/v1'
OUT_DIR = '/home/z/my-project/scripts/voice23'
DATA_JS = '/home/z/my-project/scripts/voices23_data.js'
MODEL = 'eleven_v3'
OUTFMT = 'mp3_22050_32'   # اگر خطا داد → پیش‌فرض

VOICE_ID = {
    'p': 'nPczCjzI2devNBz1zQrb',  # Brian — بم، آرام، مسئولیت‌پذیر
    'a': 'TX3LPaxmHKxFdv7VOQHJ',  # Liam — جوان، پرانرژی
    'm': 'XrExE9yKIg1WjnnlVkGX',  # Matilda — زن، حرفه‌ای و دقیق
    'n': 'onwK4e9ZLuTAKqWW03F9',  # Daniel — گوینده رسمی/راوی
    'r': 'SAz9YHcvj6GT2YYXdXww',  # River — بی‌طرف اطلاع‌رسان (بی‌سیم)
    'b': 'N2lVS1w4EtoT3dr4eOWO',  # Callum — خشن/خس‌دار (هیولا)
    'd': 'CwhRBWXzGAHq8TQ4Fs17',  # Roger — خودمانی/خونسرد (دستفروش)
}
SETTINGS = {   # stability ↑ = یکنواخت‌تر | style ↑ = احساسی‌تر
    'p': {'stability': 0.50, 'similarity_boost': 0.80, 'style': 0.20, 'use_speaker_boost': True},
    'a': {'stability': 0.30, 'similarity_boost': 0.75, 'style': 0.65, 'use_speaker_boost': True},
    'm': {'stability': 0.60, 'similarity_boost': 0.80, 'style': 0.15, 'use_speaker_boost': True},
    'n': {'stability': 0.75, 'similarity_boost': 0.80, 'style': 0.05, 'use_speaker_boost': True},
    'r': {'stability': 0.80, 'similarity_boost': 0.75, 'style': 0.00, 'use_speaker_boost': True},
    'b': {'stability': 0.35, 'similarity_boost': 0.70, 'style': 0.55, 'use_speaker_boost': True},
    'd': {'stability': 0.45, 'similarity_boost': 0.75, 'style': 0.40, 'use_speaker_boost': True},
}
# زنجیره‌ی پس‌پردازش ffmpeg به تفکیک شخصیت
FX = {
    'p': 'loudnorm=I=-17:TP=-1.5',
    'a': 'loudnorm=I=-16.5:TP=-1.5',
    'm': 'loudnorm=I=-17:TP=-1.5',
    'n': 'aecho=0.6:0.22:55|105:0.18|0.10,loudnorm=I=-17.5:TP=-1.5',
    'r': 'highpass=f=380,lowpass=f=2900,volume=2.0,acompressor=threshold=0.30:ratio=7:attack=6:release=55,loudnorm=I=-16:TP=-1.0',
    'b': 'asetrate=22050*0.76,aresample=22050,atempo=1.22,volume=1.35,acompressor=threshold=0.28:ratio=9:attack=4:release=40,loudnorm=I=-16:TP=-1.0',
    'd': 'volume=1.1,loudnorm=I=-17:TP=-1.5',
}

os.makedirs(OUT_DIR, exist_ok=True)

def sub():
    try:
        req = urllib.request.Request(f'{API}/user/subscription', headers={'xi-api-key': KEY})
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)['character_count']
    except Exception:
        return None

def tts(vid, text, out, fmt):
    body = json.dumps({'text': text, 'model_id': MODEL,
                       'voice_settings': SETTINGS[who]}).encode()
    url = f'{API}/text-to-speech/{vid}?output_format={fmt}'
    req = urllib.request.Request(url, data=body, headers={
        'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
    with urllib.request.urlopen(req, timeout=120) as r:
        data = r.read()
    if len(data) < 2000:
        raise RuntimeError(f'too small: {len(data)}')
    open(out, 'wb').write(data)
    return len(data)

def ffmpeg_proc(src, dst, who):
    cmd = ['ffmpeg', '-y', '-v', 'quiet', '-i', src,
           '-af', "silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.12," + FX[who],
           '-ac', '1', '-ar', '24000', '-b:a', '32k', dst]
    r = subprocess.run(cmd, capture_output=True)
    if r.returncode != 0 or not os.path.exists(dst) or os.path.getsize(dst) < 800:
        raise RuntimeError(f'ffmpeg: {r.stderr.decode()[:200]}')

def dur_of(path):
    r = subprocess.run(['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
                        '-of', 'csv=p=0', path], capture_output=True, text=True)
    try:
        return float(r.stdout.strip())
    except Exception:
        return 0.0

start_used = sub()
print(f'[quota] used at start: {start_used}')

LIMIT = int(os.environ.get('LIMIT', '0'))          # آزمایش: LIMIT=3 فقط ۳ کلیپ
if LIMIT:
    LINES = LINES[:LIMIT]
    print(f'[test mode] only {LIMIT} lines')

results, failures, billed_chars = {}, [], 0
fmt = OUTFMT
for i, (lid, who, fa, fing) in enumerate(LINES):
    raw = f'{OUT_DIR}/{lid}_raw.mp3'
    fin = f'{OUT_DIR}/{lid}.mp3'
    if os.path.exists(fin) and os.path.getsize(fin) > 800:
        results[lid] = dur_of(fin)
        print(f'  [{i+1}/{len(LINES)}] {lid} cached {results[lid]:.1f}s')
        continue
    ok = False
    for attempt in range(1, 4):
        try:
            sz = tts(VOICE_ID[who], fing, raw, fmt)
            ffmpeg_proc(raw, fin, who)
            results[lid] = dur_of(fin)
            billed_chars += len(fing)
            print(f'  [{i+1}/{len(LINES)}] {lid} [{who}] {len(fing)}ch -> {sz}B, {results[lid]:.1f}s')
            ok = True
            break
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(6 * attempt); continue
            if e.code == 400 and 'output_format' in e.read().decode()[:400] and fmt != 'mp3_44100_128':
                fmt = 'mp3_44100_128'; continue
            print(f'  [{i+1}/{len(LINES)}] {lid} HTTP {e.code} attempt {attempt}')
            time.sleep(3 * attempt)
        except Exception as e:
            print(f'  [{i+1}/{len(LINES)}] {lid} ERR {str(e)[:120]} attempt {attempt}')
            time.sleep(3 * attempt)
    if not ok:
        failures.append((lid, who, fa, fing))
    time.sleep(0.7)

print(f'\nGenerated: {len(results)} | Failed: {len(failures)} | billed chars this run: {billed_chars}')
if failures:
    print('FAILED LINES:')
    for lid, who, fa, _ in failures:
        print(f'  {lid} [{who}] {fa}')

# ---------- ساخت voices23_data.js ----------
entries = []
for lid, who, fa, fing in LINES:
    p = f'{OUT_DIR}/{lid}.mp3'
    if lid in results and os.path.exists(p):
        b64 = base64.b64encode(open(p, 'rb').read()).decode()
        entries.append(f'{lid}:{{d:{results[lid]:.2f},a:"data:audio/mpeg;base64,{b64}"}}')

hdr = f'''/* ==================================================================
   سه طبقه تا مرگ — نسخه‌ی ۲۳٫۰ — صداهای ElevenLabs v3 (تولید خودکار)
   {len(entries)} کلیپ · ۷ صدای متمایز · ورودی فینگلیش + پس‌پردازش ffmpeg
   p Brian(بم/آرام) a Liam(جوان/پرانرژی) m Matilda(حرفه‌ای)
   n Daniel(راوی رسمی) r River(بی‌سیم+باندپس) b Callum(هیولا-پیچ)
   d Roger(خودمانی) — مصرف کاراکتر: {billed_chars}
   ================================================================== */
const VOICES23 = {{
'''
with open(DATA_JS, 'w', encoding='utf-8') as f:
    f.write(hdr + ',\n'.join(entries) + '\n};\n')
print(f'wrote {DATA_JS}: {len(entries)} clips, {os.path.getsize(DATA_JS)/1e6:.2f} MB')

time.sleep(15)
end_used = sub()
print(f'[quota] used at end: {end_used} (delta {end_used - start_used if end_used and start_used else "?"})')
