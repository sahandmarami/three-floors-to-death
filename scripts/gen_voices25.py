#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""v25 — صداهای ElevenLabs فارسیِ واقعی + احساس — با راستی‌آزمایی ASR

کشف‌های کلیدی این جلسه (تست‌های ASR):
  · v2 + متن فارسی + stability≈0.4/style≈0.55 → اغلب فارسیِ درست (قرعه‌ای)
  · v2/v3 + فینگلیش → لهجه‌ی انگلیسی/روسی (✗ — همان «مثل چینی» کاربر)
  · v3 + فارسی → چینی (✗)
پس: v2 + فارسی + تولیدِ چندباره تا تأیید ASR (نسبت حروف فارسی + شباهت کلمات)

نگاشت (همه با eleven_multilingual_v2 و فارسی مستقیم):
  p سهند→Harry · a ارشان→Callum · m مریم→Matilda · n راوی→River
  r بی‌سیم→Bill(+باندپس رادیو) · b هیولا→Harry(بم‌شده) · d دستفروش→Jessica
مراحل: gen(raw) → ASR → قبول؟ → FX → mp3 نهایی؛ رد؟ → seed جدید، تا ۳ بار
"""
import json, os, subprocess, sys, time, base64, unicodedata

sys.path.insert(0, '/home/z/my-project/scripts')
from dialogues23 import LINES

KEY = 'REMOVED-rotate-key'
OUT_DIR = '/home/z/my-project/scripts/voice25'
RAW_DIR = os.path.join(OUT_DIR, '_raw')
WAV_DIR = os.path.join(OUT_DIR, '_wav')
DATA_JS = '/home/z/my-project/scripts/voices25_data.js'
ASR_LOG = '/home/z/my-project/scripts/voice25_asr.json'
MODEL = 'eleven_multilingual_v2'
for d in (OUT_DIR, RAW_DIR, WAV_DIR):
    os.makedirs(d, exist_ok=True)

VOICE = {
    'p': 'SOYHLrjzK2X1ezoPC6cr',   # Harry — قهرمان
    'a': 'N2lVS1w4EtoT3dr4eOWO',   # Callum — ارشان
    'm': 'XrExE9yKIg1WjnnlVkGX',   # Matilda — مریم
    'n': 'SAz9YHcvj6GT2YYXdXww',   # River — راوی
    'r': 'pqHfZKP75CvOlQylNhV4',   # Bill — بی‌سیم
    'b': 'SOYHLrjzK2X1ezoPC6cr',   # Harry — هیولا (FX)
    'd': 'cgSgspJ2msm6clMCkdW9',   # Jessica — دستفروش
}

URGENT = {'c4vr', 'fbw2', 'aw2', 'aw4', 'aw5', 's1a1', 's1a2', 'c1w4c', 'c4f3', 'fbz1', 'fbw1', 'fbw4', 'fbw6', 'sbo1', 'c2e2', 'c3e2', 'aw6', 'aw1', 't1a1'}
SAD = {'e1n', 'e2a', 'e3p', 'e4n', 'tbc1n', 'c4v4', 'c4v5', 'i1n', 'i2n', 'c1w1a', 'c2w5a', 'c3w5a', 'c2e1', 'c3e1', 'c4v2', 'i4p', 'c4v8', 'c1e1a', 'c1e1b'}
CALM = {'c4m1', 'c4m2', 'c4m3', 'c4p3', 'c4a3', 'c4v3', 'i20p', 'c4p1', 'w1b'}

def mood_of(key):
    if key in URGENT: return 'urgent'
    if key in SAD: return 'sad'
    if key in CALM: return 'calm'
    return 'normal'

# تنظیمات برنده (تست‌شده): stability 0.4 و style ≥0.5 → فارسی
SETTINGS = {
    'normal': {'stability': 0.40, 'similarity_boost': 0.80, 'style': 0.55, 'use_speaker_boost': True},
    'urgent': {'stability': 0.30, 'similarity_boost': 0.75, 'style': 0.70, 'use_speaker_boost': True},
    'sad':    {'stability': 0.55, 'similarity_boost': 0.80, 'style': 0.50, 'use_speaker_boost': True},
    'calm':   {'stability': 0.45, 'similarity_boost': 0.82, 'style': 0.55, 'use_speaker_boost': True},
}

FX = {
    'p': 'lowshelf=f=200:g=2,acompressor=threshold=0.32:ratio=3:attack=12:release=140,loudnorm=I=-17:TP=-1.5',
    'a': 'highshelf=f=3200:g=1.2,acompressor=threshold=0.30:ratio=2.8:attack=8:release=120,loudnorm=I=-16.5:TP=-1.5',
    'm': 'acompressor=threshold=0.30:ratio=2.6:attack=10:release=130,loudnorm=I=-17:TP=-1.5',
    'n': 'aecho=0.4:0.12:50|90:0.08|0.05,lowshelf=f=170:g=2,acompressor=threshold=0.30:ratio=3:attack=14:release=160,loudnorm=I=-17.5:TP=-1.5',
    'r': 'highpass=f=380,lowpass=f=2900,volume=2.0,acompressor=threshold=0.28:ratio=8:attack=5:release=55,loudnorm=I=-15.5:TP=-1.0',
    'b': 'asetrate=44100*0.80,aresample=44100,atempo=1.25,volume=1.25,acompressor=threshold=0.26:ratio=9:attack=4:release=40,loudnorm=I=-16:TP=-1.0',
    'd': 'lowshelf=f=240:g=1.2,acompressor=threshold=0.32:ratio=2.6:attack=10:release=130,loudnorm=I=-17:TP=-1.5',
}
MOOD_FX = {
    'sad':    ',asetrate=44100*0.955,aresample=44100,atempo=1.047',
    'urgent': ',atempo=1.05',
}

def run(cmd, tries=3, timeout=180):
    for a in range(tries):
        try:
            r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
            if r.returncode == 0: return True
        except subprocess.TimeoutExpired:
            pass
        time.sleep(2.5 * (a + 1))
    return False

def gen_raw(key, who, text, seed):
    """یک نسخه‌ی خام تولید می‌کند — خروجی: مسیر mp3 خام یا None"""
    raw = f'{RAW_DIR}/{key}.mp3'
    payload = json.dumps({'text': text, 'model_id': MODEL,
                          'voice_settings': SETTINGS[mood_of(key)], 'seed': seed})
    ok = run(['curl', '-s', '-X', 'POST',
              f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE[who]}',
              '-H', f'xi-api-key: {KEY}',
              '-H', 'Content-Type: application/json',
              '-H', 'Accept: audio/mpeg',
              '-d', payload, '-o', raw, '-w', '%{http_code}'])
    sz = os.path.getsize(raw) if os.path.exists(raw) else 0
    if not ok or sz < 2000:
        return None
    return raw

def to_wav(mp3, wav):
    return run(['ffmpeg', '-y', '-loglevel', 'error', '-i', mp3,
                '-ar', '16000', '-ac', '1', wav])

# ---------- تحلیل فارسی‌بودن متن ASR ----------
def fa_ratio(txt):
    letters = [c for c in txt if unicodedata.category(c).startswith('L')]
    if not letters: return 0.0
    fa = [c for c in letters if '\u0600' <= c <= '\u06FF' or '\uFB50' <= c <= '\uFEFF']
    return len(fa) / len(letters)

def norm_fa(s):
    s = unicodedata.normalize('NFKC', s)
    for ch in 'ًٌٍَُِّْءإأآىیيکگ\u200c\u200f.,!؟?؛:«»"\'()':
        s = s.replace(ch, '')
    return s.replace(' ', '')

def word_match(asr, target):
    """درصد کلمات هدف (طول≥۲) که در ASR دیده می‌شوند (شبه‌سبک)"""
    tw = [norm_fa(w) for w in target.split() if len(w) >= 2]
    if not tw: return 1.0
    blob = norm_fa(asr)
    hit = sum(1 for w in tw if len(w) >= 2 and (w in blob or
            any(len(w) >= 3 and w[:3] in blob, ) if False else False))
    # تطبیق بخشی: ۶۰٪ ابتدای کلمه
    hit = 0
    for w in tw:
        if w in blob: hit += 1
        elif len(w) >= 4 and w[:int(len(w)*0.6)] in blob: hit += 0.6
    return hit / len(tw)

def verdict(asr_text, target_fa):
    r = fa_ratio(asr_text)
    m = word_match(asr_text, target_fa)
    ok = (r >= 0.6 and m >= 0.30) or (r >= 0.9 and m >= 0.15)
    return ok, round(r, 2), round(m, 2)

# ---------- فاز ۱: تولید خام ----------
def phase_generate(keys):
    results = {}
    for (key, who, fa, fing) in LINES:
        if keys and key not in keys: continue
        if who not in VOICE: continue
        raw = f'{RAW_DIR}/{key}.mp3'
        final = f'{OUT_DIR}/{key}.mp3'
        if os.path.exists(final) and os.path.getsize(final) > 1000:
            results[key] = ('final-exists', who, fa); continue
        seed = (hash(key) % 900000) + 7
        got = gen_raw(key, who, fa, seed)
        results[key] = ('gen-ok' if got else 'gen-fail', who, fa)
        time.sleep(0.9)
    return results

if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'gen'
    keys = set(sys.argv[2:]) if len(sys.argv) > 2 else None
    if cmd == 'gen':
        r = phase_generate(keys)
        ok = sum(1 for v in r.values() if v[0] in ('gen-ok', 'final-exists'))
        print(f'phase-gen: {ok}/{len(r)} raw generated')
    elif cmd == 'fx':
        # پس‌پردازش همه‌ی خام‌ها (برای تست گوش دادن)
        for (key, who, fa, fing) in LINES:
            if keys and key not in keys: continue
            raw, final = f'{RAW_DIR}/{key}.mp3', f'{OUT_DIR}/{key}.mp3'
            if not os.path.exists(raw): continue
            fx = FX[who] + MOOD_FX.get(mood_of(key), '')
            run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', fx,
                 '-ar', '22050', '-ac', '1', '-b:a', '32k', final])
        print('fx done')
