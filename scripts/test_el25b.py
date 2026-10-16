#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""تست گسترده: کدام صدای ElevenLabs با متن فارسیِ مستقیم (v2) فارسیِ درست می‌گوید؟"""
import os, json, subprocess, time

KEY = 'sk_eaf7367e4b56bcfdbac92769cd5b03ee25f4d0921795634e'
OUT = '/home/z/my-project/scripts/el25_test'
os.makedirs(OUT, exist_ok=True)

VOICES = {
    'Sarah':  'EXAVITQu4vr4xnSDxMaL', 'Laura': 'FGY2WhTYpPnrIDTdsKH5',
    'George': 'JBFqnCBsd6RMkjVDRZzb', 'River': 'SAz9YHcvj6GT2YYXdXww',
    'Harry':  'SOYHLrjzK2X1ezoPC6cr', 'Liam':  'TX3LPaxmHKxFdv7VOQHJ',
    'Alice':  'Xb7hH8MSUJpSbSDYk0k2', 'Will':  'bIHbv24MWmeRgasZH58o',
    'Jessica':'cgSgspJ2msm6clMCkdW9', 'Eric':  'cjVigY5qzO86Huf0OWal',
    'Bella':  'hpp4J3VqNfWAUOO0d1Us', 'Chris': 'iP95p4xoKVk53GoZ742B',
    'Lily':   'pFZP5JQG7iQjIQuC4Bku', 'Bill':  'pqHfZKP75CvOlQylNhV4',
    'Roger':  'CwhRBWXzGAHq8TQ4Fs17', 'Callum':'N2lVS1w4EtoT3dr4eOWO',
    'Matilda2':'XrExE9yKIg1WjnnlVkGX',
}
TEXT = 'صداش رو شنیدی؟ نزدیکه!'

for name, vid in VOICES.items():
    out = f'{OUT}/sc_{name}.mp3'
    if os.path.exists(out) and os.path.getsize(out) > 2000:
        print(f'[{name}] cached'); continue
    payload = json.dumps({'text': TEXT, 'model_id': 'eleven_multilingual_v2',
        'voice_settings': {'stability': 0.4, 'similarity_boost': 0.8, 'style': 0.5, 'use_speaker_boost': True}})
    r = subprocess.run(['curl', '-s', '-X', 'POST',
        f'https://api.elevenlabs.io/v1/text-to-speech/{vid}',
        '-H', f'xi-api-key: {KEY}', '-H', 'Content-Type: application/json',
        '-H', 'Accept: audio/mpeg', '-d', payload, '-o', out, '-w', '%{http_code}'],
        capture_output=True, text=True, timeout=120)
    print(f'[{name}] http={r.stdout.strip()} size={os.path.getsize(out) if os.path.exists(out) else 0}')
    time.sleep(2.2)
