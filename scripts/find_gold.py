#!/usr/bin/env python3
# find_gold.py — یافتن دکمه طلایی در اسکرین‌شات کاربر
from PIL import Image

def find_gold(path, label):
    img = Image.open(path).convert('RGB')
    w, h = img.size
    px = img.load()
    pts = []
    for y in range(0, h, 3):
        for x in range(0, w, 3):
            r, g, b = px[x, y]
            # طلایی گرادیان f6cd6b(246,205,107) → dea032(222,160,50)
            if 200 <= r <= 255 and 130 <= g <= 225 and 30 <= b <= 140 and r > g > b and (r - b) > 90:
                pts.append((x, y))
    if not pts:
        print(f'{label}: no gold button found')
        return
    # خوشه‌بندی ساده: بزرگ‌ترین ناحیه پیوسته تقریبی
    xs = sorted(p[0] for p in pts)
    ys = sorted(p[1] for p in pts)
    n = len(pts)
    x_med, y_med = xs[n//2], ys[n//2]
    print(f'{label}: {n} gold px | x {xs[0]}-{xs[-1]} ({xs[0]/w*100:.0f}%-{xs[-1]/w*100:.0f}%), y {ys[0]}-{ys[-1]} ({ys[0]/h*100:.0f}%-{ys[-1]/h*100:.0f}%) | median ({x_med/w*100:.0f}%, {y_med/h*100:.0f}%)')

find_gold('/tmp/shot_intro1_v30.png', 'MY BUILD  780x360')
find_gold('/tmp/feedback_v30/باگ_نوشته_ها_باید_بی.png', 'USER SHOT 2340x1080')
