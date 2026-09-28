#!/usr/bin/env python3
# استخراج و سینتکس‌چکِ <script> های فایل تک‌فایل نهایی (نسخه‌ی ۱۲٫۰)
import re, subprocess, sys, tempfile, os

src = open('/home/z/my-project/download/three-floors-to-survival.html', encoding='utf-8').read()
scripts = re.findall(r'<script>(.*?)</script>', src, re.S)
print(f'script blocks: {len(scripts)}')
js = '\n;\n'.join(scripts)
with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f:
    f.write(js)
    path = f.name
r = subprocess.run(['node', '--check', path], capture_output=True, text=True)
os.unlink(path)
if r.returncode != 0:
    print('SYNTAX ERROR:')
    print(r.stderr[:4000])
    sys.exit(1)
print('syntax OK ✓')
