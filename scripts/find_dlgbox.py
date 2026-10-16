#!/usr/bin/env python3
# find_dlgbox.py — یافتن دقیق مرز باکس گفتگو در اسکرین‌شات کاربر
from PIL import Image
img = Image.open('/tmp/feedback_v30/باگ_نوشته_ها_باید_بی.png').convert('RGB')
w, h = img.size
px = img.load()

# باکس: پس‌زمینه تیره آبی (16-8,32-14,60-32) + حاشیه روشن #4d6aa8 (77,106,168)
def is_boxbg(p):
    r,g,b = p
    return 5 <= r <= 40 and 10 <= g <= 45 and 40 <= b <= 90 and b > g+15 > r+15

def is_border(p):
    r,g,b = p
    return 55 <= r <= 110 and 85 <= g <= 140 and 130 <= b <= 200 and b > g > r

# اسکن افقی: برای هر ردیف y تعداد پیکسل‌های باکس‌bg
rows = []
for y in range(0, h, 4):
    cnt = sum(1 for x in range(0, w, 6) if is_boxbg(px[x, y]))
    rows.append((y, cnt))

# ردیف‌های با تعداد بالا = داخل باکس
best = [r for r in rows if r[1] > 30]
if best:
    ys = [r[0] for r in best]
    print(f'box rows y: {min(ys)} .. {max(ys)}  (screen h={h})')
    print(f'box vertical span: {min(ys)/h*100:.1f}% .. {max(ys)/h*100:.1f}%')
else:
    print('no strong box rows')

# اسکن عمودی در ناحیه باکس برای x
if best:
    y0, y1 = min(ys), max(ys)
    cols = []
    for x in range(0, w, 4):
        cnt = sum(1 for y in range(y0, y1, 6) if is_boxbg(px[x, y]))
        cols.append((x, cnt))
    bestc = [c for c in cols if c[1] > 5]
    if bestc:
        xs = [c[0] for c in bestc]
        print(f'box cols x: {min(xs)} .. {max(xs)}  (screen w={w})')
        print(f'box horizontal span: {min(xs)/w*100:.1f}% .. {max(xs)/w*100:.1f}%')

# جستجوی حاشیه روشن (border) هم
brows = []
for y in range(0, h, 3):
    cnt = sum(1 for x in range(0, w, 8) if is_border(px[x, y]))
    if cnt > 25: brows.append((y, cnt))
if brows:
    ys2 = [r[0] for r in brows]
    print(f'light-blue border rows: {min(ys2)}..{max(ys2)} ({min(ys2)/h*100:.0f}%-{max(ys2)/h*100:.0f}%)')
