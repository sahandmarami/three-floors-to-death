#!/usr/bin/env python3
"""تحلیل پیکسلی تاریکیِ لکه‌ای v16 — سه طبقه تا بقا
usage: pix_v16.py <screenshot.png> <ch2|blackout|ch3>
نوارهای نمونه‌گیری: زمین (جهان y=430) و میانه (y=250)؛
حاشیه‌ی نورِ بازیکن (x=480±260) کنار گذاشته می‌شود.
wrap 960x560 در viewport 1100x640 وسط است → آفست (70,40)."""
import sys, statistics as st
from PIL import Image

SHOT, MODE = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else 'ch2')
img = Image.open(SHOT).convert('RGB')
W, H = img.size
OX, OY = (W - 960) // 2, (H - 560) // 2

def luma(px):
    return 0.299 * px[0] + 0.587 * px[1] + 0.114 * px[2]

def strip(wy, x0=40, x1=920, step=20, exc_c=480, exc_r=260):
    vals = []
    for wx in range(x0, x1 + 1, step):
        if abs(wx - exc_c) < exc_r:
            continue
        sx, sy = OX + wx, OY + wy
        if 0 <= sx < W and 0 <= sy < H:
            vals.append(luma(img.getpixel((sx, sy))))
    return vals

ground = strip(430)
mid = strip(250)
allv = ground + mid
mean, sd, mn, mx = st.mean(allv), st.pstdev(allv), min(allv), max(allv)

# روشن‌ترین نقطه حول بازیکن (نور محیطی/چراغ‌قوه — جهان ~480,~322)
best = 0.0
for dx in range(-44, 45, 8):
    for dy in range(-44, 45, 8):
        sx, sy = OX + 480 + dx, OY + 322 + dy
        if 0 <= sx < W and 0 <= sy < H:
            best = max(best, luma(img.getpixel((sx, sy))))

print(f"n={len(allv)} mean={mean:.1f} std={sd:.1f} min={mn:.1f} max={mx:.1f} "
      f"range={mx - mn:.1f} light={best:.1f}")

if MODE == 'ch2':
    ok = (mx - mn) >= 20 and sd >= 5.5 and mean >= 27 and best >= 60
elif MODE == 'blackout':
    ok = (mx - mn) >= 12 and sd >= 3.5 and best >= 55
elif MODE == 'ch3':
    ok = (mx - mn) >= 10
else:
    ok = True
print('VERDICT:', 'PASS' if ok else 'FAIL')
