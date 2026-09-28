#!/usr/bin/env python3
"""استخراج جاوااسکریپت از HTML نهایی و بررسی سینتکس با node --check"""
import re, subprocess, sys

SRC = '/home/z/my-project/download/three-floors-to-survival.html'
OUT = '/home/z/my-project/scripts/_check_game.js'

html = open(SRC, encoding='utf-8').read()
m = re.search(r'<script>(.*)</script>', html, re.S)
if not m:
    print('ERROR: <script> block not found'); sys.exit(1)
js = m.group(1)
open(OUT, 'w', encoding='utf-8').write(js)
print(f'extracted {js.count(chr(10))} lines of JS')

r = subprocess.run(['node', '--check', OUT], capture_output=True, text=True)
if r.returncode == 0:
    print('SYNTAX OK ✔')
else:
    print('SYNTAX ERROR:')
    print(r.stderr[:3000])
    sys.exit(1)
