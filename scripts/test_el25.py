#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""تست ElevenLabs با کلید جدید — مقایسه: فارسی‌نویسی vs فینگلیش، v2 vs v3، تگ احساس"""
import os, json, subprocess, time

KEY = 'REMOVED-rotate-key'
OUT = '/home/z/my-project/scripts/el25_test'
os.makedirs(OUT, exist_ok=True)

TESTS = [
    # (name, model, voice_id, text)
    ('v2_fa_brian',   'eleven_multilingual_v2', 'nPczCjzI2devNBz1zQrb', 'یه ویروس، شهر رو بی‌صدا کشت.'),
    ('v3_fa_brian',   'eleven_v3',              'nPczCjzI2devNBz1zQrb', 'یه ویروس، شهر رو بی‌صدا کشت.'),
    ('v3_fing_brian', 'eleven_v3',              'nPczCjzI2devNBz1zQrb', 'ye virus, shahr ro be seda kosht.'),
    ('v3_fing_sad',   'eleven_v3',              'nPczCjzI2devNBz1zQrb', '[sad] ye virus, shahr ro be seda kosht.'),
    ('v2_fing_brian', 'eleven_multilingual_v2', 'nPczCjzI2devNBz1zQrb', 'ye virus, shahr ro be seda kosht.'),
    ('v2_fa_daniel',  'eleven_multilingual_v2', 'onwK4e9ZLuTAKqWW03F9', 'یه ویروس، شهر رو بی‌صدا کشت.'),
    ('v3_fing_daniel','eleven_v3',              'onwK4e9ZLuTAKqWW03F9', '[sad] ye virus, shahr ro be seda kosht.'),
    ('v2_fa_matilda', 'eleven_multilingual_v2', 'XrExE9yKIg1WjnnlVkGX', 'اینجا هنوز امنه. ولی دیوارها آسیب دیدن.'),
    ('v3_fing_liam',  'eleven_v3',              'TX3LPaxmHKxFdv7VOQHJ', '[urgent] sedash ro shenidi? nazdike!'),
    ('v3_fing_harry', 'eleven_v3',              'SOYHLrjzK2X1ezoPC6cr', '[angry] man nagahban am! roomi kon!'),
]

for name, model, vid, text in TESTS:
    out = f'{OUT}/{name}.mp3'
    if os.path.exists(out) and os.path.getsize(out) > 2000:
        print(f'[{name}] cached, skip'); continue
    payload = json.dumps({
        'text': text, 'model_id': model,
        'voice_settings': {'stability': 0.45, 'similarity_boost': 0.8, 'style': 0.6, 'use_speaker_boost': True},
    })
    cmd = ['curl', '-s', '-X', 'POST',
           f'https://api.elevenlabs.io/v1/text-to-speech/{vid}',
           '-H', f'xi-api-key: {KEY}',
           '-H', 'Content-Type: application/json',
           '-H', 'Accept: audio/mpeg',
           '-d', payload, '-o', out, '-w', '%{http_code}']
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    code = r.stdout.strip()
    sz = os.path.getsize(out) if os.path.exists(out) else 0
    print(f'[{name}] http={code} size={sz}')
    time.sleep(1.5)
