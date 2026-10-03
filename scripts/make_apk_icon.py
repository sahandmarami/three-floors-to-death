#!/usr/bin/env python3
# آیکون APK «سه طبقه تا بقا» — برج سه‌طبقه + ماه + زامبی روی پس‌زمینه‌ی شب
from PIL import Image, ImageDraw

S = 512
im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(im)

# پس‌زمینه — گرادیان شب (دستی)
top = (8, 14, 34)
bot = (28, 38, 66)
for y in range(S):
    t = y / S
    c = tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3)) + (255,)
    d.line([(0, y), (S, y)], fill=c)

# ماه
d.ellipse([340, 60, 430, 150], fill=(238, 228, 190, 255))
d.ellipse([358, 76, 374, 92], fill=(200, 190, 160, 255))
d.ellipse([396, 110, 408, 122], fill=(200, 190, 160, 255))

# ستاره‌ها
import random
random.seed(7)
for _ in range(26):
    x = random.randint(12, 500)
    y = random.randint(12, 200)
    r = random.randint(1, 3)
    d.ellipse([x - r, y - r, x + r, y + r], fill=(235, 240, 252, 220))

# زمین
d.rectangle([0, 420, S, S], fill=(24, 30, 22, 255))

# برج سه‌طبقه
TW, TX = 190, 250   # مرکز
floors = [
    (300, 405, 150, 90, (128, 84, 58)),   # طبقه‌ی همکف — آجری
    (240, 295, 130, 100, (150, 96, 62)),
    (185, 195, 115, 95, (170, 110, 70)),
]
for i, (fy, fh, fw2, _, col) in enumerate([(f[0], f[1], f[2], f[3], f[4]) for f in floors]):
    pass
# (بازکشیدن ساده)
def rr(x0, y0, x1, y1, r, fill):
    d.rounded_rectangle([x0, y0, x1, y1], radius=r, fill=fill)

rr(TX - 80, 315, TX + 80, 415, 10, (128, 84, 58))      # همکف
rr(TX - 66, 215, TX + 66, 312, 10, (150, 96, 62))      # طبقه ۲
rr(TX - 52, 122, TX + 52, 212, 10, (170, 110, 70))     # طبقه ۳
# پنجره‌های نورانی
win = (255, 214, 120, 255)
rr(TX - 58, 335, TX - 30, 360, 4, win)
rr(TX + 26, 335, TX + 54, 360, 4, win)
rr(TX - 46, 238, TX - 22, 260, 4, win)
rr(TX + 18, 238, TX + 42, 260, 4, (200, 150, 80, 255))
rr(TX - 32, 146, TX - 12, 164, 4, win)
rr(TX + 10, 146, TX + 30, 164, 4, win)
# بام + بازیکن (سیلوئت تیر)
rr(TX - 58, 108, TX + 58, 126, 8, (96, 74, 52))
d.ellipse([TX - 10, 78, TX + 10, 98], fill=(240, 196, 154, 255))
d.polygon([(TX - 12, 84), (TX + 12, 84), (TX + 9, 70), (TX - 9, 70)], fill=(122, 42, 42, 255))
d.line([(TX - 6, 96), (TX - 8, 112)], fill=(240, 196, 154), width=6)
d.line([(TX + 6, 96), (TX + 8, 112)], fill=(240, 196, 154), width=6)
# لوله‌ی تفنگ به بیرون
d.line([(TX + 4, 86), (TX + 40, 74)], fill=(70, 60, 50), width=7)

# زامبی‌های سیلوئت دو طرف
def zombie(x, base, sc, col):
    h = int(52 * sc)
    d.ellipse([x - 7 * sc, base - h - 9 * sc, x + 7 * sc, base - h + 7 * sc], fill=col)
    d.rounded_rectangle([x - 10 * sc, base - h + 4 * sc, x + 10 * sc, base], radius=int(6 * sc), fill=col)
    d.line([(x - 9 * sc, base - h + 10 * sc), (x - 15 * sc, base - h + 26 * sc)], fill=col, width=int(4 * sc))
    d.line([(x + 9 * sc, base - h + 10 * sc), (x + 15 * sc, base - h + 26 * sc)], fill=col, width=int(4 * sc))
    # چشم‌های سرخ
    d.ellipse([x - 4.6 * sc, base - h - 4 * sc, x - 1.4 * sc, base - h - 1 * sc], fill=(255, 70, 60, 255))
    d.ellipse([x + 1.4 * sc, base - h - 4 * sc, x + 4.6 * sc, base - h - 1 * sc], fill=(255, 70, 60, 255))

zcol = (92, 128, 72, 255)
zombie(105, 430, 1.15, zcol)
zombie(150, 432, 0.9, (110, 140, 84, 255))
zombie(390, 431, 1.05, zcol)
zombie(430, 433, 0.8, (110, 140, 84, 255))

im.save('/home/z/my-project/download/apk/icon.png')
print('icon saved')
