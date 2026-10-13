#!/usr/bin/env python3
# process_coin27.py — پردازش سکه‌ی #۲: برش خودکار + حذف پس‌زمینه + خروجی data-URI
from PIL import Image, ImageDraw, ImageFilter
import base64, io

im = Image.open('coin_3.img').convert('RGBA')
W, H = im.size
print('src:', im.size)

# ۱) یافتن کادر سکه — پیکسل‌های «طلایی» (R بالا، G متوسط، B پایین)
px = im.load()
xs, ys = [], []
for y in range(0, H, 4):
    for x in range(0, W, 4):
        r, g, b, a = px[x, y]
        if r > 120 and g > 70 and b < 140 and r > b + 40 and (r + g) > 260:
            xs.append(x); ys.append(y)
x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
print('coin bbox:', x0, y0, x1, y1)
# مربع‌سازی کادر + حاشیه
cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
side = max(x1 - x0, y1 - y0) + 30
side = min(side, W, H)
box = (max(0, cx - side // 2), max(0, cy - side // 2), min(W, cx + side // 2), min(H, cy + side // 2))
im = im.crop(box)
print('cropped:', im.size)

# ۲) حذف پس‌زمینه: رنگ گوشه‌ها = پس‌زمینه
px = im.load()
W, H = im.size
corners = [px[2, 2], px[W - 3, 2], px[2, H - 3], px[W - 3, H - 3]]
bg = tuple(sum(c[i] for c in corners) // 4 for i in range(3))
print('bg color:', bg)

def dist(a, b):
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2) ** 0.5

# ماسک: هر چیزی که به پس‌زمینه نزدیک است شفاف می‌شود — فقط بیرون دایره‌ی سکه
cx, cy = W / 2, H / 2
R = min(W, H) / 2 - 2
mask = Image.new('L', (W, H), 0)
mp = mask.load()
for y in range(H):
    for x in range(W):
        d_out = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
        if d_out <= R * 0.98:
            mp[x, y] = 255
        elif d_out <= R * 1.02:
            mp[x, y] = int(255 * (1 - (d_out - R * 0.98) / (R * 0.04)))
im.putalpha(mask)

# ۳) پاک‌سازی لبه: feathery anti-alias — کمی مات کردن لبه
a = im.getchannel('A').filter(ImageFilter.GaussianBlur(0.6))
im.putalpha(a)

# ۴) ریسایز به ۱۲۸ و شارپ
im = im.resize((128, 128), Image.LANCZOS)
im.save('coin_final.png')

# بررسی کیفیت — زمینه شطرنجی برای پیش‌نمایش
bgc = Image.new('RGB', (256, 256), (90, 90, 90))
for yy in range(0, 256, 32):
    for xx in range(0, 256, 32):
        if (xx // 32 + yy // 32) % 2 == 0:
            d = ImageDraw.Draw(bgc)
            d.rectangle([xx, yy, xx + 31, yy + 31], fill=(60, 60, 60))
bgc.paste(im, (64, 64), im)
bgc.save('coin_preview.jpg', quality=90)

buf = io.BytesIO()
im.save(buf, 'PNG', optimize=True)
b64 = base64.b64encode(buf.getvalue()).decode()
open('/home/z/my-project/scripts/coin27/coin_data.txt', 'w').write(f'const COIN27 = "data:image/png;base64,{b64}";\n')
print('final coin:', len(b64), 'b64 chars →', len(b64) * 3 // 4, 'bytes')
