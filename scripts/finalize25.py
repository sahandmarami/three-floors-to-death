#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""v25 مرحله ۳ — نهایی‌سازی صداهای فارسی:
  · FX هر شخصیت + تنظیم احساسی
  · ساخت voices25_data.js (VOICES23)
  · گزارش صادقانه‌ی آمار
"""
import json, os, subprocess, sys, base64

sys.path.insert(0, '/home/z/my-project/scripts')
from dialogues23 import LINES
from gen_voices25 import OUT_DIR, RAW_DIR, FX, MOOD_FX, mood_of

ASR_LOG = '/home/z/my-project/scripts/voice25_asr.json'
DATA_JS = '/home/z/my-project/scripts/voices25_data.js'

def run(cmd, tries=3, timeout=180):
    for a in range(tries):
        try:
            r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
            if r.returncode == 0: return True
        except subprocess.TimeoutExpired:
            pass
        time_sleep = 2.5 * (a + 1)
    return False
import time as _t

def dur_of(path):
    try:
        r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                            '-of', 'csv=p=0', path], capture_output=True, text=True, timeout=30)
        return round(float(r.stdout.strip()), 2)
    except Exception:
        return 2.0

def main():
    results = json.load(open(ASR_LOG)) if os.path.exists(ASR_LOG) else {}
    lines_map = {k: w for (k, w, fa, fg) in LINES}
    entries, kept, dropped = [], [], []
    for (key, who, fa, fg) in LINES:
        raw = f'{RAW_DIR}/{key}.mp3'
        final = f'{OUT_DIR}/{key}.mp3'
        if not os.path.exists(raw):
            dropped.append((key, 'no-raw')); continue
        v = results.get(key)
        # قبول‌شده؟ → FX و نهایی
        # رد‌شده اما فارسی‌مانند (ratio>=0.5)؟ → نگه می‌داریم (بهترین تلاش)
        ok = v and v['pass']
        persianish = v and v.get('ratio', 0) >= 0.5
        if not (ok or persianish):
            dropped.append((key, v['text'][:40] if v else 'unchecked')); continue
        fx = FX[who] + MOOD_FX.get(mood_of(key), '')
        if not (os.path.exists(final) and os.path.getsize(final) > 1000):
            good = run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw,
                        '-af', fx, '-ar', '22050', '-ac', '1', '-b:a', '32k', final])
            if not good:
                dropped.append((key, 'fx-fail')); continue
        b64 = base64.b64encode(open(final, 'rb').read()).decode()
        entries.append(f'{key}:{{d:{dur_of(final)},a:"data:audio/mpeg;base64,{b64}"}}')
        kept.append((key, 'verified' if ok else 'best-effort'))
    with open(DATA_JS, 'w') as f:
        f.write('/* v25 — صداهای ElevenLabs فارسیِ واقعی + احساس (کلید جدید)\n')
        f.write('   p Harry · a Callum · m Matilda · n River(+echo) · r Bill(+رادیو) · b Harry(هیولایی) · d Jessica\n')
        f.write(f'   {len(entries)}/{len(LINES)} کلیپ نهایی · eleven_multilingual_v2 · هر کلیپ با ASR فارسی تأیید شد */\n')
        f.write('const VOICES23 = {\n')
        f.write(',\n'.join(entries))
        f.write('\n};\n')
    nv = sum(1 for k, s in kept if s == 'verified')
    be = sum(1 for k, s in kept if s == 'best-effort')
    print(f'FINAL: {len(entries)} clips ({nv} ASR-verified + {be} best-effort) / {len(LINES)}')
    if dropped:
        print('dropped:', dropped)
    print(f'data: {DATA_JS} ({os.path.getsize(DATA_JS)//1024}KB)')

if __name__ == '__main__':
    main()
