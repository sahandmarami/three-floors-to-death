#!/usr/bin/env python3
"""Build the authoritative clip -> (speaker, text) map from ALL gen_voices*.py scripts.
Handles 3-tuple (k,w,t) and 4-tuple (k,w,t,fresh) formats."""
import re, json, ast

files = ['gen_voices13.py', 'gen_voices14.py', 'gen_voices17.py', 'gen_voices18.py', 'gen_voices19.py', 'gen_voices202.py']
lines = {}   # key -> (who, text, source)

for fn in files:
    path = f'/home/z/my-project/scripts/{fn}'
    src = open(path, encoding='utf-8').read()
    m = re.search(r'LINES\s*=\s*\[(.*?)\n\]', src, re.S)
    if not m:
        print(f'{fn}: no LINES')
        continue
    body = m.group(1)
    # parse each tuple via AST-safe transform: strip comments
    body = re.sub(r'#.*$', '', body, flags=re.M)
    try:
        tup_list = ast.literal_eval('[' + body + ']')
    except Exception as e:
        print(f'{fn}: AST FAIL {e}')
        continue
    for t in tup_list:
        if len(t) >= 3:
            k, w, txt = t[0], t[1], t[2]
            lines[k] = (w, txt, fn)
    print(f'{fn}: {len(tup_list)} tuples')

# Verify against VOICES17 keys
src17 = open('/home/z/my-project/scripts/voices17_data.js', encoding='utf-8').read()
clips17 = re.findall(r"([a-z0-9_]+)\s*:\s*\{\s*d:([\d.]+)\s*,\s*a:", src17)
missing = [k for k, _ in clips17 if k not in lines]
print(f'\nVOICES17 clips: {len(clips17)} | mapped: {len([k for k,_ in clips17 if k in lines])} | missing: {missing}')
total_chars = sum(len(v[1]) for k, v in lines.items() if k in dict(clips17))
print(f'TOTAL SPEECH CHARS (in game): {total_chars}')
json.dump({k: {'who': v[0], 'text': v[1]} for k, v in lines.items()},
          open('/home/z/my-project/scripts/all_voice_lines.json', 'w'), ensure_ascii=False, indent=1)
print('Saved -> scripts/all_voice_lines.json')
# Show speakers distribution
from collections import Counter
c = Counter(v[0] for k, v in lines.items() if k in dict(clips17))
print('SPEAKERS:', dict(c))
