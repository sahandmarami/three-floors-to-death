#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""v21.4 — وصله‌ی درجای voices17_data.js با کلیپ‌های الون‌لبز (b64 + dur تازه)."""
import json, re, base64

DATA_JS = '/home/z/my-project/scripts/voices17_data.js'
OUT_DIR = '/home/z/my-project/scripts/voice21'

manifest = json.load(open(f'{OUT_DIR}/manifest.json'))
src = open(DATA_JS, encoding='utf-8').read()

patched, missing = 0, []
total_b = 0
for m in manifest:
    key, dur = m['key'], m['dur']
    mp3 = open(f"{OUT_DIR}/{key}.mp3", 'rb').read()
    b64 = base64.b64encode(mp3).decode()
    total_b += len(b64)
    # الگوی موجود: key:{d:12.34,a:"data:audio/mpeg;base64,...."}
    pat = re.compile(r"(" + re.escape(key) + r"\s*:\s*\{\s*d:\s*)[\d.]+(\s*,\s*a:\s*\")data:audio/mpeg;base64,[^\"]*(\")")
    new, n = pat.subn(lambda mm: mm.group(1) + str(dur) + mm.group(2) + 'data:audio/mpeg;base64,' + b64 + mm.group(3), src, count=1)
    if n:
        src = new
        patched += 1
    else:
        missing.append(key)

open(DATA_JS, 'w', encoding='utf-8').write(src)
print(f'patched: {patched}/{len(manifest)} | missing: {missing}')
print(f'new data size: {len(src)//1024}KB (was 1800KB)')
