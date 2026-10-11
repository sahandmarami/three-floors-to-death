#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""v21.4 — بازتولید کل صداهای بازی با ElevenLabs (eleven_v3 — فارسی عالی).
کست اثبات‌شده با ASR: n=Adam a=Liam p=Eric r=Daniel b=Roger d=Charlie m=Sarah
خروجی: patch درجا در voices17_data.js (b64 + duration) — همان الگوی gen_voices19.
"""
import json, subprocess, sys, time, urllib.request, os

API = 'https://api.elevenlabs.io/v1/text-to-speech'
KEY = 'sk_b92a5f370c695025ff6bcfe09a3d66c299c3ad4a706d4581'
DATA_JS = '/home/z/my-project/scripts/voices17_data.js'
OUT_DIR = '/home/z/my-project/scripts/voice21'

CAST = {
    'n': ('pNInz6obpgDQGcFmaJgB', {'stability': 0.5,  'style': 0.2, 'speed': 0.95}),  # راوی — Adam
    'a': ('TX3LPaxmHKxFdv7VOQHJ', {'stability': 0.35, 'style': 0.6, 'speed': 1.05}),  # ارشان — Liam
    'p': ('cjVigY5qzO86Huf0OWal', {'stability': 0.45, 'style': 0.3, 'speed': 1.0}),   # بازیکن — Eric
    'r': ('onwK4e9ZLuTAKqWW03F9', {'stability': 0.55, 'style': 0.1, 'speed': 1.0}),   # رادیو — Daniel
    'b': ('CwhRBWXzGAHq8TQ4Fs17', {'stability': 0.4,  'style': 0.4, 'speed': 0.95}),  # نگهبان — Roger
    'd': ('IKne3meq5aSn9XLyUdCD', {'stability': 0.3,  'style': 0.7, 'speed': 1.0}),   # دستفروش — Charlie
    'm': ('EXAVITQu4vr4xnSDxMaL', {'stability': 0.5,  'style': 0.25, 'speed': 0.97}), # دکتر مریم — Sarah
}

LINES = json.load(open('/home/z/my-project/scripts/all_voice_lines.json', encoding='utf-8'))
print(f'{len(LINES)} clips to generate')

def tts(vid, settings, text, out, retries=4):
    body = json.dumps({'text': text, 'model_id': 'eleven_v3',
                       'voice_settings': {**settings, 'similarity_boost': 0.85, 'use_speaker_boost': True}}).encode()
    for i in range(retries):
        try:
            req = urllib.request.Request(f'{API}/{vid}', data=body, headers={
                'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
            with urllib.request.urlopen(req, timeout=120) as r:
                data = r.read()
            if len(data) > 4000:
                open(out, 'wb').write(data)
                return True
            print(f'    (thin audio {len(data)}b, retry)')
        except Exception as e:
            if i == retries - 1:
                print(f'    FAIL: {str(e)[:110]}')
                return False
            time.sleep(4 + i * 3)
    return False

def ffprobe_dur(path):
    r = subprocess.run(['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
                        '-of', 'csv=p=0', path], capture_output=True, text=True, timeout=20)
    return round(float(r.stdout.strip()), 2)

os.makedirs(OUT_DIR, exist_ok=True)
src = open(DATA_JS, encoding='utf-8').read()
done, failed = 0, []
manifest = []

for key in LINES:
    who = LINES[key]['who']
    text = LINES[key]['text']
    if who not in CAST:
        print(f'  SKIP {key}: unknown speaker {who}')
        continue
    vid, settings = CAST[who]
    raw = f'{OUT_DIR}/{key}_raw.mp3'
    fin = f'{OUT_DIR}/{key}.mp3'
    ok = tts(vid, settings, text, raw)
    if not ok:
        failed.append(key)
        continue
    # پس‌پردازش: همان زنجیره‌ی v19 — رادیو باندپس، بقیه نرمالایز
    af = ('highpass=f=420,lowpass=f=2600,volume=1.3' if who == 'r'
          else 'volume=1.1')
    try:
        subprocess.run(['ffmpeg', '-y', '-v', 'quiet', '-i', raw, '-af', af,
                        '-ar', '24000', '-ac', '1', '-b:a', '32k', fin],
                       check=True, timeout=40)
    except Exception as e:
        print(f'    ffmpeg FAIL {key}: {e}')
        failed.append(key)
        continue
    os.remove(raw)
    d = ffprobe_dur(fin)
    manifest.append({'key': key, 'who': who, 'dur': d, 'mp3': fin})
    done += 1
    print(f'  OK {key} ({who}) dur={d}s')
    time.sleep(0.6)

json.dump(manifest, open(f'{OUT_DIR}/manifest.json', 'w'), ensure_ascii=False, indent=1)
print(f'\nDONE: {done}/{len(LINES)} | FAILED: {failed}')
sys.exit(1 if failed else 0)
