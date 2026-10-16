#!/usr/bin/env python3
# find_border.py — یافتن باکس گفتگو از طریق رنگ حاشیه روشن آبی
from PIL import Image

def find_box(path, label):
    img = Image.open(path).convert('RGB')
    w, h = img.size
    px = img.load()
    # حاشیه: #6f8fd4 (111,143,212) یا #4d6aa8 (77,106,168) با تلورانس
    pts = []
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            r, g, b = px[x, y]
            if 90 <= r <= 140 and 120 <= g <= 170 and 190 <= b <= 235 and b > g > r:
                pts.append((x, y))
    if not pts:
        print(f'{label}: no border pixels found')
        return
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    # فیلتر نقاط پرت (چندتا بزرگ‌ترین خوشه)
    from collections import Counter
    # مرزهای باکس = بیشترین تراکم
    print(f'{label}: {len(pts)} border px, x {min(xs)}-{max(xs)} ({min(xs)/w*100:.0f}%-{max(xs)/w*100:.0f}%), y {min(ys)}-{max(ys)} ({min(ys)/h*100:.0f}%-{max(ys)/h*100:.0f}%)')

find_box('/tmp/shot_intro1_v30.png', 'MY BUILD  (780x360)')
find_box('/tmp/feedback_v30/باگ_نوشته_ها_باید_بی.png', 'USER SHOT (2340x1080)')
