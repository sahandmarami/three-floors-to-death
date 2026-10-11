#!/usr/bin/env python3
"""Count dialogue characters across all voice data files (without printing base64)."""
import re, json, os

total_chars = 0
total_clips = 0
per_file = {}
speaker_chars = {}

for fn in ['voices13_data.js', 'voices14_data.js', 'voices17_data.js']:
    path = f'/home/z/my-project/scripts/{fn}'
    if not os.path.exists(path):
        continue
    with open(path, encoding='utf-8') as f:
        src = f.read()
    # text:"..." fields (Persian text, no base64 inside)
    texts = re.findall(r'text:\s*"([^"]{1,500})"', src)
    chars = sum(len(t) for t in texts)
    per_file[fn] = (len(texts), chars)
    total_clips += len(texts)
    total_chars += chars

print('PER FILE (clips, chars):')
for k, v in per_file.items():
    print(f'  {k}: {v[0]} clips, {v[1]} chars')
print(f'TOTAL: {total_clips} clips, {total_chars} chars')
print(f'ElevenLabs free remaining: ~9090 chars -> {"FITS" if total_chars <= 9090 else "DOES NOT FIT (need " + str(total_chars - 9090) + " more)"}')
