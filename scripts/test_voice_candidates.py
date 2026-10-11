#!/usr/bin/env python3
"""Test candidate voices for each character with eleven_v3 (short line, then ASR verify).
Each character archetype gets 1-2 candidates. Budget-conscious: short test lines."""
import json, subprocess, sys, time, urllib.request

API = 'https://api.elevenlabs.io/v1/text-to-speech'
KEY = 'sk_b92a5f370c695025ff6bcfe09a3d66c299c3ad4a706d4581'

# character -> candidates (voice_id, name)
CANDIDATES = [
    ('n', 'George',   'JBFqnCBsd6RMkjVDRZzb'),   # راوی — راوی قصه‌گو
    ('n', 'Brian',    'nPczCjzI2devNBz1zQrb'),   # راوی — عمیق و آرام
    ('a', 'Liam',     'TX3LPaxmHKxFdv7VOQHJ'),   # ارشان — پرانرژی جوان
    ('a', 'Charlie',  'IKne3meq5aSn9XLyUdCD'),   # ارشان — پرانرژی عمیق
    ('p', 'River',    'SAz9YHcvj6GT2YYXdXww'),   # بازیکن — خنثی
    ('p', 'Eric',     'cjVigY5qzO86Huf0OWal'),   # بازیکن — صاف
    ('r', 'Daniel',   'onwK4e9ZLuTAKqWW03F9'),   # رادیو — گوینده
    ('b', 'Harry',    'SOYHLrjzK2X1ezoPC6cr'),   # نگهبان — جنگجو
    ('d', 'Callum',   'N2lVS1w4EtoT3dr4eOWO'),   # دستفروش — فریبکار
    ('m', 'Sarah',    'EXAVITQu4vr4xnSDxMaL'),   # دکتر مریم — آرام
]

# very short test lines (~25 chars each) per archetype
TEST_TEXT = {
    'n': 'شب، بر فرازِ برجِ خاموش.',
    'a': 'زود باش! دارن میان!',
    'p': 'باشه، من آماده‌ام.',
    'r': 'تمامِ واحدها گوش کنید!',
    'b': 'هوی! کی اونجاست؟',
    'd': 'کالای کمیاب داری؟',
    'm': 'آروم باش، زخمت رو می‌بندم.',
}

def tts(vid, text, out, retries=3):
    body = json.dumps({
        'text': text,
        'model_id': 'eleven_v3',
        'voice_settings': {'stability': 0.4, 'similarity_boost': 0.85, 'style': 0.35, 'use_speaker_boost': True}
    }).encode()
    for i in range(retries):
        try:
            req = urllib.request.Request(f'{API}/{vid}', data=body, headers={
                'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
            with urllib.request.urlopen(req, timeout=90) as r:
                open(out, 'wb').write(r.read())
            return True
        except Exception as e:
            if i == retries - 1:
                print(f'  FAIL {vid}: {e}')
                return False
            time.sleep(3)

outdir = '/home/z/my-project/scripts/voice_cand'
import os
os.makedirs(outdir, exist_ok=True)

results = []
for who, name, vid in CANDIDATES:
    txt = TEST_TEXT[who]
    out = f'{outdir}/{who}_{name}.mp3'
    if tts(vid, txt, out):
        wav = out.replace('.mp3', '.wav')
        subprocess.run(['ffmpeg', '-y', '-v', 'quiet', '-i', out, '-ar', '16000', '-ac', '1', wav])
        d = subprocess.run(['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
                            '-of', 'csv=p=0', out], capture_output=True, text=True).stdout.strip()
        results.append((who, name, txt, wav, d))
        print(f'OK {who}/{name} dur={d}')
    time.sleep(1)

json.dump([{'who': w, 'name': n, 'text': t, 'wav': v} for w, n, t, v, _ in results],
          open(f'{outdir}/manifest.json', 'w'), ensure_ascii=False)
print(f'\n{len(results)} candidates generated -> ASR next')
