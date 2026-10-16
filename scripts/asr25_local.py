#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""asr25_local.py — راستی‌آزمایی محلی با faster-whisper (بدون محدودیت نرخ)
مدل: small (چندزبانه — تشخیص زبان + پیاده‌سازی فارسی)
خروجی: scripts/voice25_asr.json (همان ساختار قبلی)
"""
import json, os, sys, subprocess, unicodedata
sys.path.insert(0, '/home/z/my-project/scripts')

RAW_DIR = '/home/z/my-project/scripts/voice25/_raw'
WAV_DIR = '/home/z/my-project/scripts/voice25/_wav'
ASR_LOG = '/home/z/my-project/scripts/voice25_asr.json'
MODEL_SIZE = os.environ.get('WHISPER_MODEL', 'small')

def fa_ratio(txt):
    letters = [c for c in txt if unicodedata.category(c).startswith('L')]
    if not letters: return 0.0
    fa = [c for c in letters if '\u0600' <= c <= '\u06FF' or '\uFB50' <= c <= '\uFEFF']
    return len(fa) / len(letters)

def norm_fa(s):
    s = unicodedata.normalize('NFKC', s)
    for ch in 'ًٌٍَُِّْءإأآىي\u200c\u200f.,!؟?؛:«»"\'()':
        s = s.replace(ch, '')
    return s.replace(' ', '')

def word_match(asr, target):
    tw = [norm_fa(w) for w in target.split() if len(w) >= 2]
    if not tw: return 1.0
    blob = norm_fa(asr)
    hit = 0
    for w in tw:
        if w in blob: hit += 1
        elif len(w) >= 4 and w[:max(3, int(len(w)*0.6))] in blob: hit += 0.6
    return hit / len(tw)

def main():
    from faster_whisper import WhisperModel
    print(f'loading whisper-{MODEL_SIZE} ...')
    model = WhisperModel(MODEL_SIZE, device='cpu', compute_type='int8')
    # استخراج هدف‌ها از dialogues23.py
    from dialogues23 import LINES
    targets = {k: (w, fa) for (k, w, fa, fg) in LINES}
    results = {}
    if os.path.exists(ASR_LOG):
        results = json.load(open(ASR_LOG))
    files = sorted([f for f in os.listdir(RAW_DIR) if f.endswith('.mp3')])
    for i, f in enumerate(files):
        key = f.replace('.mp3', '')
        if key not in targets: continue
        if key in results and results[key].get('pass'): continue
        who, fa = targets[key]
        wav = os.path.join(WAV_DIR, key + '.wav')
        if not os.path.exists(wav):
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i',
                            os.path.join(RAW_DIR, f), '-ar', '16000', '-ac', '1', wav],
                           capture_output=True, timeout=60)
        if not os.path.exists(wav): continue
        try:
            segments, info = model.transcribe(wav, language='fa', beam_size=1,
                                              vad_filter=False, condition_on_previous_text=False)
            text = ' '.join(s.text for s in segments).strip()
        except Exception as e:
            print(f'[{key}] whisper-err {e}')
            continue
        ratio = fa_ratio(text)
        match = word_match(text, fa)
        ok = (ratio >= 0.6 and match >= 0.30) or (ratio >= 0.9 and match >= 0.15)
        results[key] = {'pass': ok, 'ratio': round(ratio, 2), 'match': round(match, 2),
                        'text': text[:120]}
        flag = 'PASS' if ok else 'FAIL'
        print(f'[{key}] {flag} r={ratio:.2f} m={match:.2f} :: {text[:60]}')
        if (i + 1) % 25 == 0:
            json.dump(results, open(ASR_LOG, 'w'), indent=1, ensure_ascii=False)
    json.dump(results, open(ASR_LOG, 'w'), indent=1, ensure_ascii=False)
    p = sum(1 for v in results.values() if v['pass'])
    print(f'\nTOTAL: {p}/{len(results)} PASS')

if __name__ == '__main__':
    main()
