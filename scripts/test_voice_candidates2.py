#!/usr/bin/env python3
"""Re-test remaining candidates with a LONGER Persian sentence (biases ASR to Persian)."""
import json, subprocess, time, urllib.request, os

API = 'https://api.elevenlabs.io/v1/text-to-speech'
KEY = 'REMOVED-rotate-key'
TEXT = 'شب‌های آخرِ دنیا رسیده؛ با آرشان برج سه‌طبقه رو نگه دار و تا سپیده‌دم دوام بیار.'

TESTS = [
    ('a', 'Liam',    'TX3LPaxmHKxFdv7VOQHJ'),
    ('a', 'Charlie', 'IKne3meq5aSn9XLyUdCD'),
    ('p', 'River',   'SAz9YHcvj6GT2YYXdXww'),
    ('p', 'Eric',    'cjVigY5qzO86Huf0OWal'),
    ('r', 'Daniel',  'onwK4e9ZLuTAKqWW03F9'),
    ('b', 'Harry',   'SOYHLrjzK2X1ezoPC6cr'),
    ('d', 'Callum',  'N2lVS1w4EtoT3dr4eOWO'),
    ('m', 'Sarah',   'EXAVITQu4vr4xnSDxMaL'),
    ('m', 'Lily',    'pFZP5JQG7iQjIQuC4Bku'),
    ('d', 'Roger',   'CwhRBWXzGAHq8TQ4Fs17'),
]

def tts(vid, out, retries=3):
    body = json.dumps({
        'text': TEXT, 'model_id': 'eleven_v3',
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

outdir = '/home/z/my-project/scripts/voice_cand2'
os.makedirs(outdir, exist_ok=True)
manifest = []
for who, name, vid in TESTS:
    out = f'{outdir}/{who}_{name}.mp3'
    if tts(vid, out):
        wav = out.replace('.mp3', '.wav')
        subprocess.run(['ffmpeg', '-y', '-v', 'quiet', '-i', out, '-ar', '16000', '-ac', '1', wav])
        print(f'OK {who}/{name}')
        manifest.append({'who': who, 'name': name, 'wav': wav})
    time.sleep(1)

json.dump(manifest, open(f'{outdir}/manifest.json', 'w'))
print(f'{len(manifest)} done')
