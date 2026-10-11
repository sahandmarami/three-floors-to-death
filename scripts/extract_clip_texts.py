#!/usr/bin/env python3
"""Extract ALL voice clip keys from VOICES17 data + find their texts anywhere in scripts."""
import re, glob

# 1. Get all clip keys + durations from the data file
src17 = open('/home/z/my-project/scripts/voices17_data.js', encoding='utf-8').read()
clips = re.findall(r"([a-z0-9_]+)\s*:\s*\{\s*d:([\d.]+)\s*,\s*a:", src17)
print(f'VOICES17: {len(clips)} clips')

# 2. Find texts: search all script files for each key
all_src = {}
for fn in sorted(glob.glob('/home/z/my-project/scripts/*.js')):
    if 'voices' in fn or '_check' in fn: continue
    all_src[fn] = open(fn, encoding='utf-8').read()

found, missing = {}, []
for key, dur in clips:
    hit = None
    for fn, src in all_src.items():
        # text before or after v:'key'
        for m in re.finditer(r"v:\s*['\"]" + re.escape(key) + r"['\"]", src):
            # look in surrounding 600 chars for text:
            ctx = src[max(0, m.start()-500):m.end()+500]
            tm = re.search(r"text\s*:\s*(['\"])(.*?)\1", ctx)
            if tm:
                hit = tm.group(2)
                break
            # reversed: text first, v later
        if hit: break
    if hit:
        found[key] = hit
    else:
        missing.append(key)

total_chars = sum(len(t) for t in found.values())
print(f'Found texts: {len(found)} clips ({total_chars} chars)')
print(f'Missing texts: {len(missing)} -> {missing}')
# speakers per key: prefix conventions n/a/p/r/b/d/m + special
print('\nPER CLIP:')
for key, dur in clips:
    t = found.get(key, '???')
    print(f'  {key:8s} d={dur:>5s}  {t[:80]}')
