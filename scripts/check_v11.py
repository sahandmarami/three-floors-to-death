#!/usr/bin/env python3
"""استخراج JS از فایل تک‌فایل ساخته‌شده و بررسی سینتکس با node --check"""
import re, subprocess, sys

src = '/home/z/my-project/download/three-floors-to-survival.html'
html = open(src, encoding='utf-8').read()

# همه‌ی بلوک‌های <script> بدون src
blocks = re.findall(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', html, re.S)
js = '\n;\n'.join(blocks)
open('/tmp/_game_all.js', 'w', encoding='utf-8').write(js)
print(f'script blocks: {len(blocks)}, js chars: {len(js)}')
r = subprocess.run(['node', '--check', '/tmp/_game_all.js'], capture_output=True, text=True)
if r.returncode != 0:
    print('SYNTAX ERROR:')
    print(r.stderr[:3000])
    sys.exit(1)
print('SYNTAX OK')
