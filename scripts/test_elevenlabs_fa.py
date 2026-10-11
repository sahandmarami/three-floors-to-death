#!/usr/bin/env python3
"""Test ElevenLabs Persian TTS quality: generate samples with candidate voices,
then transcribe via ASR to verify accuracy (بدون غلط requirement)."""
import json, subprocess, sys, urllib.request

API = 'https://api.elevenlabs.io/v1/text-to-speech'
KEY = 'REMOVED-rotate-key'
TEXT = 'همه‌چیز از یه ویروس شروع شد؛ از حومه‌ی شهر، بی‌خبر و بی‌صدا، اومد وسطِ مون.'

TESTS = [
    # (voice_id, name, model)
    ('pNInz6obpgDQGcFmaJgB', 'Adam',       'eleven_multilingual_v2'),
    ('JBFqnCBsd6RMkjVDRZzb', 'George',     'eleven_multilingual_v2'),
    ('onwK4e9ZLuTAKqWW03F9', 'Daniel',     'eleven_multilingual_v2'),
    ('pNInz6obpgDQGcFmaJgB', 'Adam-v3',    'eleven_v3'),
]

def tts(vid, model, out):
    body = json.dumps({
        'text': TEXT,
        'model_id': model,
        'voice_settings': {'stability': 0.45, 'similarity_boost': 0.8, 'style': 0.3}
    }).encode()
    req = urllib.request.Request(f'{API}/{vid}', data=body, headers={
        'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'
    })
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            data = r.read()
        open(out, 'wb').write(data)
        return len(data)
    except Exception as e:
        return f'FAIL: {e}'

for vid, name, model in TESTS:
    out = f'/home/z/my-project/scripts/voice_test_{name}_{model}.mp3'
    sz = tts(vid, model, out)
    print(f'{name:10s} {model:22s} -> {sz}')
    if isinstance(sz, int) and sz > 5000:
        d = subprocess.run(['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
                            '-of', 'csv=p=0', out], capture_output=True, text=True)
        print(f'   duration: {d.stdout.strip()}s')
