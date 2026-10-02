#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""مقایسه‌ی پیکسلی دو فریم از نوارِ افقِ فصل ۳ — دودِ متحرک باید
بین دو اسکرین‌شات (۰٫۵۵ ثانیه فاصله) تغییر قابل‌_measurement داشته باشد."""
import sys
from PIL import Image, ImageChops

A = '/home/z/my-project/scripts/shots19/03_ch3_smoke_a.png'
B = '/home/z/my-project/scripts/shots19/04_ch3_smoke_b.png'

ia, ib = Image.open(A).convert('L'), Image.open(B).convert('L')
W, H = ia.size
# نوارِ افق: بالای خط زمین (GROUND_Y=492 از 560) تا نوکِ دود
scale = H / 560.0
y0, y1 = int(180 * scale), int(470 * scale)
box = (0, y0, W, y1)
ra, rb = ia.crop(box), ib.crop(box)
diff = ImageChops.difference(ra, rb)
bbox = diff.getbbox()
hist = diff.histogram()
changed = sum(hist[8:])           # پیکسل‌هایی با تفاوت > 8
total = (box[2] - box[0]) * (box[3] - box[1])
frac = changed / total
sys.stderr.write('smoke_diff: changed=%.4f bbox=%s\n' % (frac, bbox))
sys.exit(0 if (bbox is not None and frac > 0.002) else 1)
