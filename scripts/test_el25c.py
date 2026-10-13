#!/usr/bin/env python3
import os, json, subprocess, time
KEY = 'sk_eaf7367e4b56bcfdbac92769cd5b03ee25f4d0921795634e'
OUT = '/home/z/my-project/scripts/el25_test'
TESTS = [
    # صداهای ناشناخته با متن فارسی v2
    ('sc2_Alice',  'eleven_multilingual_v2', 'Xb7hH8MSUJpSbSDYk0k2', 'تا جای امن پیدا نکنیم، وایسیم نمی‌شه.'),
    ('sc2_Bella',  'eleven_multilingual_v2', 'hpp4J3VqNfWAUOO0d1Us', 'تا جای امن پیدا نکنیم، وایسیم نمی‌شه.'),
    ('sc2_Bill',   'eleven_multilingual_v2', 'pqHfZKP75CvOlQylNhV4', 'تا جای امن پیدا نکنیم، وایسیم نمی‌شه.'),
    ('sc2_Callum', 'eleven_multilingual_v2', 'N2lVS1w4EtoT3dr4eOWO', 'تا جای امن پیدا نکنیم، وایسیم نمی‌شه.'),
    ('sc2_Chris',  'eleven_multilingual_v2', 'iP95p4xoKVk53GoZ742B', 'تا جای امن پیدا نکنیم، وایسیم نمی‌شه.'),
    ('sc2_Eric',   'eleven_multilingual_v2', 'cjVigY5qzO86Huf0OWal', 'تا جای امن پیدا نکنیم، وایسیم نمی‌شه.'),
    ('sc2_Will',   'eleven_multilingual_v2', 'bIHbv24MWmeRgasZH58o', 'تا جای امن پیدا نکنیم، وایسیم نمی‌شه.'),
    # v3 با متن فارسی برای صداهای خوب
    ('v3fa_Harry',   'eleven_v3', 'SOYHLrjzK2X1ezoPC6cr', '[sad] یه ویروس، شهر رو بی‌صدا کشت.'),
    ('v3fa_River',   'eleven_v3', 'SAz9YHcvj6GT2YYXdXww', '[sad] یه ویروس، شهر رو بی‌صدا کشت.'),
    ('v3fa_Matilda', 'eleven_v3', 'XrExE9yKIg1WjnnlVkGX', 'اینجا هنوز امنه. ولی دیوارها آسیب دیدن.'),
    ('v3fa_Jessica', 'eleven_v3', 'cgSgspJ2msm6clMCkdW9', '[urgent] صداش رو شنیدی؟ نزدیکه!'),
    # v2 با جمله طولانی‌تر برای Harry/River (تست استقامت)
    ('long_Harry',  'eleven_multilingual_v2', 'SOYHLrjzK2X1ezoPC6cr', 'همه‌چیز از یک بیماری ناشناخته شروع شد؛ خیابان‌ها یکی‌یکی ساکت شدند و شهر بی‌صدا از پا درآمد.'),
    ('long_River',  'eleven_multilingual_v2', 'SAz9YHcvj6GT2YYXdXww', 'همه‌چیز از یک بیماری ناشناخته شروع شد؛ خیابان‌ها یکی‌یکی ساکت شدند و شهر بی‌صدا از پا درآمد.'),
    ('long_Matilda','eleven_multilingual_v2', 'XrExE9yKIg1WjnnlVkGX', 'همه‌چیز از یک بیماری ناشناخته شروع شد؛ خیابان‌ها یکی‌یکی ساکت شدند و شهر بی‌صدا از پا درآمد.'),
]
for name, model, vid, text in TESTS:
    out = f'{OUT}/{name}.mp3'
    if os.path.exists(out) and os.path.getsize(out) > 2000:
        print(f'[{name}] cached'); continue
    payload = json.dumps({'text': text, 'model_id': model,
        'voice_settings': {'stability': 0.4, 'similarity_boost': 0.8, 'style': 0.55, 'use_speaker_boost': True}})
    r = subprocess.run(['curl','-s','-X','POST',f'https://api.elevenlabs.io/v1/text-to-speech/{vid}',
        '-H',f'xi-api-key: {KEY}','-H','Content-Type: application/json','-H','Accept: audio/mpeg',
        '-d',payload,'-o',out,'-w','%{http_code}'],capture_output=True,text=True,timeout=120)
    print(f'[{name}] http={r.stdout.strip()} size={os.path.getsize(out) if os.path.exists(out) else 0}')
    time.sleep(2.5)
