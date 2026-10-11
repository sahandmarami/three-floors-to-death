#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""آزمون سه راهبرد ElevenLabs برای فارسی + ASR هر سه."""
import json, urllib.request, subprocess, time

KEY = 'REMOVED-rotate-key'
API = 'https://api.elevenlabs.io/v1'
TXT_FA = 'اون ساختمون رو ببین. سه طبقه داره و هنوز دیوارهاش سر جاشونه.'
TXT_FING = 'oon sakhtemoono bebin. se tabaghe dare o hanooz divvashaa sar jaashoone.'

def tts(vid, model, text, out):
    body = json.dumps({
        'text': text, 'model_id': model,
        'voice_settings': {'stability': 0.35, 'similarity_boost': 0.75, 'style': 0.45}
    }).encode()
    req = urllib.request.Request(f'{API}/text-to-speech/{vid}', data=body, headers={
        'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
    with urllib.request.urlopen(req, timeout=90) as r:
        open(out, 'wb').write(r.read())

tests = [
    ('m2_brian', 'nPczCjzI2devNBz1zQrb', 'eleven_multilingual_v2', TXT_FA),
    ('v3_liam',  'TX3LPaxmHKxFdv7VOQHJ', 'eleven_v3', TXT_FA),
    ('v3_fing',  'nPczCjzI2devNBz1zQrb', 'eleven_v3', TXT_FING),
]
for name, vid, model, txt in tests:
    out = f'/home/z/my-project/scripts/voice_tmp/el_{name}.mp3'
    try:
        tts(vid, model, txt, out)
        d = subprocess.run(['ffprobe','-v','quiet','-show_entries','format=duration','-of','csv=p=0',out],
                           capture_output=True, text=True).stdout.strip()
        print(f'{name}: OK {d}s')
    except Exception as e:
        print(f'{name}: FAIL {e}')
    time.sleep(2)
    subprocess.run(['ffmpeg','-y','-v','quiet','-i',out,'-ar','16000','-ac','1',out.replace('.mp3','.wav')])

def sub():
    req = urllib.request.Request(f'{API}/user/subscription', headers={'xi-api-key': KEY})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)['character_count']
time.sleep(20)
print('chars used total:', sub())
