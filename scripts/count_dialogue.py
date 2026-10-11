#!/usr/bin/env python3
"""Find all voiced dialogue lines (who/v/text objects) — robust field-order parsing."""
import re, glob

LINE_RE = re.compile(r"\[[^\[\]]*\{[^\[\]]*\}[^\[\]]*\]")  # array containing an object
total, clips = 0, 0
per_file = {}
samples = []

for fn in sorted(glob.glob('/home/z/my-project/scripts/v4_*.js') + glob.glob('/home/z/my-project/scripts/v3_*.js')):
    src = open(fn, encoding='utf-8').read()
    n, ch = 0, 0
    # Match dialogue objects with who + text (+ optional v) in any order
    for m in re.finditer(r"\{([^{}]*)\}", src):
        s = m.group(1)
        if not re.search(r"who\s*:", s) or not re.search(r"text\s*:", s):
            continue
        if 'base64' in s or len(s) > 1200:
            continue
        tm = re.search(r"text\s*:\s*(['\"])(.*?)\1", s)
        vm = re.search(r"\bv\s*:\s*(['\"])([a-z0-9_]+)\1", s)
        wm = re.search(r"who\s*:\s*(['\"])([a-z]+)\1", s)
        if tm and vm:
            n += 1
            ch += len(tm.group(2))
            if len(samples) < 5:
                samples.append((vm.group(2), wm.group(1) if wm else '?', tm.group(2)[:60]))
    if n:
        per_file[fn.split('/')[-1]] = (n, ch)
        total += ch
        clips += n

for k, v in per_file.items():
    print(f'{k}: {v[0]} lines, {v[1]} chars')
print(f'TOTAL: {clips} lines, {total} chars')
print('SAMPLES:')
for s in samples:
    print('  ', s)
