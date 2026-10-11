#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""پیش‌پردازش نهایی: ۱) fallback کلیپ pd1a1 با edge-tts ۲) بازسازی voices23_data.js"""
import asyncio, base64, os, subprocess, sys

sys.path.insert(0, '/home/z/my-project/scripts')
from dialogues23 import LINES

OUT_DIR = '/home/z/my-project/scripts/voice23'
DATA_JS = '/home/z/my-project/scripts/voices23_data.js'

def dur_of(path):
    r = subprocess.run(['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
                        '-of', 'csv=p=0', path], capture_output=True, text=True)
    try:
        return float(r.stdout.strip())
    except Exception:
        return 0.0

# ---------- ۱) fallback pd1a1 ----------
fin = f'{OUT_DIR}/pd1a1.mp3'
if not (os.path.exists(fin) and os.path.getsize(fin) > 800):
    import edge_tts
    async def mk():
        c = edge_tts.Communicate('کالای تمیز! ببین.', 'fa-IR-FaridNeural', rate='+8%', pitch='+14Hz')
        await c.save(f'{OUT_DIR}/pd1a1_edge.mp3')
    asyncio.run(mk())
    subprocess.run(['ffmpeg', '-y', '-v', 'quiet', '-i', f'{OUT_DIR}/pd1a1_edge.mp3',
                    '-af', 'volume=1.1,loudnorm=I=-17:TP=-1.5',
                    '-ac', '1', '-ar', '24000', '-b:a', '32k', fin], check=True)
    print('pd1a1 fallback (edge-tts) OK:', os.path.getsize(fin))

# ---------- ۲) بازسازی voices23_data.js ----------
entries = []
missing = []
for lid, who, fa, fing in LINES:
    p = f'{OUT_DIR}/{lid}.mp3'
    if os.path.exists(p) and os.path.getsize(p) > 800:
        d = dur_of(p)
        b64 = base64.b64encode(open(p, 'rb').read()).decode()
        entries.append(f'{lid}:{{d:{d:.2f},a:"data:audio/mpeg;base64,{b64}"}}')
    else:
        missing.append(lid)

hdr = '''/* ==================================================================
   سه طبقه تا مرگ — نسخه‌ی ۲۳٫۰ — صداهای ElevenLabs v3 (تولید خودکار)
   ۱۱۹ کلیپ · ۷ صدای متمایز · ورودی فینگلیش + پس‌پردازش ffmpeg
   p Brian(بم/آرام) a Liam(جوان/پرانرژی) m Matilda(حرفه‌ای)
   n Daniel(راوی رسمی) r River(بی‌سیم+باندپس) b Callum(هیولا-پیچ)
   d Roger→fallback(خودمانی) — سهمیه‌ی رایگان الون‌لبز کامل شد
   ================================================================== */
const VOICES23 = {
'''
with open(DATA_JS, 'w', encoding='utf-8') as f:
    f.write(hdr + ',\n'.join(entries) + '\n};\n')
print(f'wrote {DATA_JS}: {len(entries)} clips, {os.path.getsize(DATA_JS)/1e6:.2f} MB')
if missing:
    print('MISSING:', missing)
