#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""وصله‌ی test_v18.sh — نگاشت دقیق بوم→صفحه با getBoundingClientRect"""

P = '/home/z/my-project/scripts/test_v18.sh'
src = open(P, encoding='utf-8').read()

helper = '''# (۱۸٫۰) نگاشت دقیق بوم → صفحه (بازی در ویوپورت اسکیل می‌شود)
getrect() { agent-browser eval "(()=>{const r=document.getElementById('game').getBoundingClientRect();return [r.left,r.top,r.width,r.height].map(x=>Math.round(x*100)/100).join('|')})()" | tr -d '"'; }

echo "===== ۳) ارشان روی بام برج ====="'''
src = src.replace('echo "===== ۳) ارشان روی بام برج ====="', helper, 1)

old_roof = '''PIX=$(python3 - << 'PYEOF'
from PIL import Image
img = Image.open('/home/z/my-project/scripts/shots18/03_arshan_roof_day.png').convert('RGB')
W, H = img.size
OX, OY = (W - 960) // 2, (H - 560) // 2
n = 0
for dx in range(-16, 17):
    for dy in range(-40, 6):
        sx, sy = OX + 518 + dx, OY + 294 + dy
        if 0 <= sx < W and 0 <= sy < H:
            r, g, b = img.getpixel((sx, sy))
            if 65 < r < 210 and g < 95 and b < 95 and (r - g) > 35:
                n += 1
print('redcap=' + str(n))
PYEOF
)'''
new_roof = '''RECT=$(getrect)
PIX=$(RECT="$RECT" python3 - << 'PYEOF'
import os
from PIL import Image
img = Image.open('/home/z/my-project/scripts/shots18/03_arshan_roof_day.png').convert('RGB')
W, H = img.size
L, T, CW, CH = map(float, os.environ['RECT'].split('|'))
sx0 = L + CW / 960.0
sy0 = T + CH / 560.0
n = 0
for dx in range(-16, 17):
    for dy in range(-40, 6):
        sx, sy = int(sx0 * (518 + dx)), int(sy0 * (294 + dy))
        if 0 <= sx < W and 0 <= sy < H:
            r, g, b = img.getpixel((sx, sy))
            if 65 < r < 210 and g < 95 and b < 95 and (r - g) > 35:
                n += 1
print('redcap=' + str(n))
PYEOF
)'''
assert old_roof in src, 'roof block not found'
src = src.replace(old_roof, new_roof)

old_seat = '''SEAT=$(python3 - << 'PYEOF'
from PIL import Image
img = Image.open('/home/z/my-project/scripts/shots18/04_drive_car.png').convert('RGB')
W, H = img.size
OX, OY = (W - 960) // 2, (H - 560) // 2
# ماشین: cx=480 → سر بازیکن (428, 450) و ارشان (532, 450)
Lred = Rred = Ldark = 0
for dx in range(-8, 9):
    for dy in range(-8, 9):
        for side, x0 in (('L', 428), ('R', 532)):
            sx, sy = OX + x0 + dx, OY + 450 + dy
            if 0 <= sx < W and 0 <= sy < H:
                r, g, b = img.getpixel((sx, sy))
                if 65 < r < 210 and g < 95 and b < 95 and (r - g) > 35:
                    if side == 'L': Lred += 1
                    else: Rred += 1
                if r < 75 and 30 < g < 85 and 60 < b < 130 and b > r:
                    if side == 'L': Ldark += 1
print('Lred=%d Rred=%d Ldark=%d' % (Lred, Rred, Ldark))
PYEOF
)'''
new_seat = '''RECT2=$(getrect)
SEAT=$(RECT="$RECT2" python3 - << 'PYEOF'
import os
from PIL import Image
img = Image.open('/home/z/my-project/scripts/shots18/04_drive_car.png').convert('RGB')
W, H = img.size
L, T, CW, CH = map(float, os.environ['RECT'].split('|'))
sx0 = L + CW / 960.0
sy0 = T + CH / 560.0
# ماشین: cx=480 → سر بازیکن (428, 450) و ارشان (532, 450)
Lred = Rred = Ldark = Lskin = 0
for dx in range(-8, 9):
    for dy in range(-8, 9):
        for side, x0 in (('L', 428), ('R', 532)):
            sx, sy = int(sx0 * (x0 + dx)), int(sy0 * (450 + dy))
            if 0 <= sx < W and 0 <= sy < H:
                r, g, b = img.getpixel((sx, sy))
                if 65 < r < 210 and g < 95 and b < 95 and (r - g) > 35:
                    if side == 'L': Lred += 1
                    else: Rred += 1
                if r < 75 and 30 < g < 85 and 60 < b < 130 and b > r:
                    if side == 'L': Ldark += 1
                if r > 200 and g > 150 and 100 < b < 200:
                    if side == 'L': Lskin += 1
print('Lred=%d Rred=%d Ldark=%d Lskin=%d' % (Lred, Rred, Ldark, Lskin))
PYEOF
)'''
assert old_seat in src, 'seat block not found'
src = src.replace(old_seat, new_seat)

open(P, 'w', encoding='utf-8').write(src)
print('pixel mapping fixed')
