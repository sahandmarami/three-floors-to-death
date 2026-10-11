#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""آزمون فاکتور ElevenLabs v3: فارسی + نسبت هزینه کاراکتر."""
import json, urllib.request

KEY = 'sk_b92a5f370c695025ff6bcfe09a3d66c299c3ad4a706d4581'
API = 'https://api.elevenlabs.io/v1'

def sub():
    req = urllib.request.Request(f'{API}/user/subscription', headers={'xi-api-key': KEY})
    with urllib.request.urlopen(req, timeout=30) as r:
        d = json.load(r)
    return d['character_count'], d['character_limit']

def tts(vid, model, text, out, tags=None):
    t = (tags + ' ' + text) if tags else text
    body = json.dumps({
        'text': t,
        'model_id': model,
        'voice_settings': {'stability': 0.35, 'similarity_boost': 0.75, 'style': 0.45, 'use_speaker_boost': True}
    }).encode()
    req = urllib.request.Request(f'{API}/text-to-speech/{vid}', data=body, headers={
        'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
    try:
        with urllib.request.urlopen(req, timeout=90) as r:
            data = r.read()
        open(out, 'wb').write(data)
        return len(data)
    except Exception as e:
        return f'FAIL: {e}'

before = sub()
print('BEFORE:', before, 'remaining:', before[1]-before[0])

TXT = 'اون ساختمون رو ببین. سه طبقه داره و هنوز دیوارهاش سر جاشونه.'
print('text chars:', len(TXT))

# v3 با صدای Brian (راوی/بازیکن) — شناسه کامل
sz = tts('nPczCjzI2devNBz1zQrb', 'eleven_v3', TXT, '/home/z/my-project/scripts/voice_tmp/eltest_brian_v3.mp3')
print('brian v3:', sz)
after1 = sub()
print('AFTER v3 (60 chars):', after1, 'delta:', after1[0]-before[0])
