#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""v25 — ساخت voices25_data.js از کلیپ‌های ElevenLabs v3 + ۳ کلیپ هیولا از v24"""
import json, os, re, base64, subprocess

LINES = json.load(open('/home/z/my-project/scripts/lines25.json'))
VD = '/home/z/my-project/scripts/voice25'
OLD = open('/home/z/my-project/scripts/voices24_data.js', encoding='utf-8').read()
OUT = '/home/z/my-project/scripts/voices25_data.js'

def dur_of(path):
    r = subprocess.run(['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
                        '-of', 'csv=p=0', path], capture_output=True, text=True, timeout=30)
    return round(float(r.stdout.strip()), 2)

# استخراج کلیپ‌های v24 برای هیولا (b)
old_clips = {}
for m in re.finditer(r'([a-z0-9]+):\{d:([0-9.]+),a:"data:audio/mpeg;base64,([A-Za-z0-9+/=]+)"\}', OLD):
    old_clips[m.group(1)] = (float(m.group(2)), m.group(3))

entries, src = [], {}
for key, who, text in LINES:
    mp3 = os.path.join(VD, key + '.mp3')
    if who == 'b':
        if key in old_clips:
            d, b64 = old_clips[key]
            entries.append(f'{key}:{{d:{d},a:"data:audio/mpeg;base64,{b64}"}}')
            src[key] = 'v24-monster'
        continue
    if not os.path.exists(mp3):
        continue
    d = dur_of(mp3)
    b64 = base64.b64encode(open(mp3, 'rb').read()).decode('ascii')
    entries.append(f'{key}:{{d:{d},a:"data:audio/mpeg;base64,{b64}"}}')
    src[key] = 'el-v3'

header = """/* ==================================================================
   «سه طبقه تا مرگ» v25 — صداهای ElevenLabs v3 (فارسی، احساسی)
   بازیگران (ASR-تأییدشده): p سهند=George(گرم) · n راوی=George(رسمی+طنین)
   a ارشان=Roger(خودمانی) · d دستفروش=Roger(شلوغ) · m مریم=Alice(آرام)
   r بی‌سیم=Matilda(+باندپس رادیو) · b هیولا=غرش v24
   پس‌پردازش ffmpeg per-character (گرم/روشن/طنین/رادیو/فشرده) + loudnorm
   ================================================================== */
const VOICES23 = {
"""
with open(OUT, 'w', encoding='utf-8') as f:
    f.write(header)
    f.write(',\n'.join(entries))
    f.write('\n};\n')

n_el = sum(1 for v in src.values() if v == 'el-v3')
n_mo = sum(1 for v in src.values() if v == 'v24-monster')
size = os.path.getsize(OUT) / 1048576
print(f'voices25_data.js: {n_el} ElevenLabs + {n_mo} monster = {len(entries)} clips, {size:.1f}MB')
