#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""v21.4 — regen 3 problem clips: tbc1n (odd take), sh9r (softer radio filter), fb1b1 (2nd take)."""
import json, subprocess, time, urllib.request, os

API = 'https://api.elevenlabs.io/v1/text-to-speech'
KEY = 'sk_b92a5f370c695025ff6bcfe09a3d66c299c3ad4a706d4581'
OUT_DIR = '/home/z/my-project/scripts/voice21'

REGEN = [
    # key, voice_id, settings, text, af (post filter)
    ('tbc1n', 'pNInz6obpgDQGcFmaJgB', {'stability': 0.55, 'style': 0.15, 'speed': 0.92},
     'این داستان ادامه دارد...', 'volume=1.1'),
    ('sh9r',  'onwK4e9ZLuTAKqWW03F9', {'stability': 0.55, 'style': 0.1, 'speed': 1.0},
     'تمامِ واحدها گوش کنید! گله‌ی بزرگ از دره‌ی شمالی به سمتِ پناهگاه شما حرکت کرده... زمان ندارید!',
     'highpass=f=300,lowpass=f=3400,volume=1.2'),      # فیلتر نرم‌تر رادیو
    ('fb1b1', 'CwhRBWXzGAHq8TQ4Fs17', {'stability': 0.45, 'style': 0.5, 'speed': 0.95},
     'خشم... من!', 'volume=1.1'),
]

def tts(vid, settings, text, out):
    body = json.dumps({'text': text, 'model_id': 'eleven_v3',
                       'voice_settings': {**settings, 'similarity_boost': 0.85, 'use_speaker_boost': True}}).encode()
    for i in range(4):
        try:
            req = urllib.request.Request(f'{API}/{vid}', data=body, headers={
                'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
            with urllib.request.urlopen(req, timeout=120) as r:
                data = r.read()
            if len(data) > 4000:
                open(out, 'wb').write(data)
                return True
        except Exception as e:
            if i == 3:
                print(f'  FAIL {e}')
                return False
            time.sleep(4)
    return False

def ffprobe_dur(path):
    r = subprocess.run(['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
                        '-of', 'csv=p=0', path], capture_output=True, text=True, timeout=20)
    return round(float(r.stdout.strip()), 2)

manifest = json.load(open(f'{OUT_DIR}/manifest.json'))
for key, vid, settings, text, af in REGEN:
    raw = f'{OUT_DIR}/{key}_raw2.mp3'
    fin = f'{OUT_DIR}/{key}.mp3'
    if not tts(vid, settings, text, raw):
        continue
    subprocess.run(['ffmpeg', '-y', '-v', 'quiet', '-i', raw, '-af', af,
                    '-ar', '24000', '-ac', '1', '-b:a', '32k', fin], check=True, timeout=40)
    os.remove(raw)
    d = ffprobe_dur(fin)
    for m in manifest:
        if m['key'] == key:
            m['dur'] = d
    print(f'  REGEN {key} dur={d}s')
json.dump(manifest, open(f'{OUT_DIR}/manifest.json', 'w'), ensure_ascii=False, indent=1)
print('done')
