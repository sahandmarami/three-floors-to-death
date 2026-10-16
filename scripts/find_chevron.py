#!/usr/bin/env python3
# find_chevron.py — یافتن علامت طلایی در ردیف‌های پنل کاربر
from PIL import Image

img = Image.open('/tmp/feedback_v30/باگ.jpg').convert('RGB')
w, h = img.size
px = img.load()

# کل ناحیه پنل رو اسکن کن برای خوشه‌های طلایی کوچک (غیر آیکون اصلی)
# طلایی: r>200, g>150, b<120, r>g>b
points = []
for y in range(0, h, 2):
    for x in range(0, w, 2):
        r, g, b = px[x, y]
        if r > 195 and g > 145 and b < 130 and r > g > b:
            points.append((x, y))

print(f'total gold points: {len(points)}')

# خوشه‌بندی ساده با گرید
from collections import defaultdict
clusters = defaultdict(list)
for (x, y) in points:
    clusters[(x // 60, y // 40)].append((x, y))

# خوشه‌های بزرگ را نشان بده
for k in sorted(clusters.keys()):
    pts = clusters[k]
    if len(pts) < 4:
        continue
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    cx, cy = sum(xs)//len(pts), sum(ys)//len(pts)
    print(f'cluster @ ({cx},{cy}) = ({cx/w*100:.0f}%,{cy/h*100:.0f}%) — {len(pts)} pts, span x{min(xs)}-{max(xs)} y{min(ys)}-{max(ys)}')
