#!/usr/bin/env python3
# gen_pistol27.py — اسپرایت تپانچه‌ی متمایز برای کاشی فروشگاه (سبک پیکسل‌آرت هماهنگ)
# مشکل: کاشی «کلت» همان اسپرایت «ارتقای اسلحه» (کلنگ‌مانند) بود — دو کلنگ روی هم
from PIL import Image, ImageDraw
import base64, io

S = 140
img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

# ---- قاب تکنیک (هم‌سبک کاشی‌های دیگر) ----
def rr(x0, y0, x1, y1, r, fill=None, outline=None, w=1):
    d.rounded_rectangle([x0, y0, x1, y1], radius=r, fill=fill, outline=outline, width=w)

# پس‌زمینه: کاشی تیره با گرادیان عمودی
rr(4, 4, 136, 136, 18, fill=(24, 33, 58, 255), outline=(77, 106, 168, 255), w=3)
for y in range(6, 134, 2):
    a = int(38 + (y / 134) * 26)
    d.line([(7, y), (133, y)], fill=(a // 2 + 8, a // 2 + 14, a + 22, 255))
# حاشیه داخلی روشن (هایلایت بالا)
d.arc([8, 8, 132, 132], 200, 340, fill=(120, 150, 210, 90), width=3)

# ---- تپانچه‌ی بزرگ نما (سمت-چپ، رو به چپ = جهت RTL شلیک به زامبی‌های سمت چپ) ----
# بدنه اصلی اسلحه — فلز تیره
BODY = (43, 47, 56, 255)      # #2b2f38
BODY_HI = (69, 75, 87, 255)   # #454b57
BARREL = (58, 64, 76, 255)
GRIP = (122, 74, 44, 255)     # چوب گرم
GRIP_D = (94, 55, 30, 255)
GOLD = (201, 162, 78, 255)    # #c9a24e

# متریک: لوله از x=18 تا 78، بدنه 66..104، گریپ 96..122
# سایه زیر اسلحه
d.ellipse([30, 112, 116, 124], fill=(0, 0, 0, 70))

# لوله (slide) — قطعه بلند بالایی
rr(20, 42, 82, 62, 4, fill=BODY)
rr(20, 42, 82, 50, 4, fill=BODY_HI)              # هایلایت لوله
d.rectangle([24, 46, 74, 48], fill=(255, 255, 255, 38))  # برق روی لوله
# سر لوله (muzzle)
rr(16, 46, 22, 58, 2, fill=BARREL)
d.rectangle([17, 48, 18, 56], fill=(255, 255, 255, 50))

# بدنه/قاب پایین لوله
rr(38, 60, 84, 74, 3, fill=BODY)
# ماشه و محافظ ماشه
d.arc([70, 68, 84, 84], 270, 90, fill=(30, 33, 40, 255), width=4)
d.line([(78, 70), (74, 80)], fill=GOLD, width=3)

# گریپ چوبی (دسته) — کج به پایین-راست
d.polygon([(84, 58), (108, 58), (122, 106), (98, 112), (84, 74)], fill=GRIP)
d.polygon([(84, 58), (92, 58), (104, 100), (96, 104), (84, 74)], fill=GRIP_D)  # سایه داخلی گریپ
# خطوط چوب گریپ
for i, yy in enumerate(range(66, 104, 7)):
    d.line([(98 + (yy - 58) * 0.16, yy), (112 + (yy - 58) * 0.15, yy)], fill=(70, 40, 20, 120), width=2)
# گلوبی طلایی (hamer/embellishment)
rr(82, 56, 88, 64, 2, fill=GOLD)
# سخت‌گیر (sights) طلایی
d.rectangle([22, 38, 26, 42], fill=GOLD)
d.rectangle([62, 38, 66, 42], fill=GOLD)

# نشان کوچک روی لوله (علامت سازنده — نقطه‌های طلایی)
d.rectangle([34, 54, 40, 55], fill=GOLD)
d.rectangle([44, 54, 50, 55], fill=GOLD)

# ---- جرقه‌ی شلیک (چپ — جهت شلیک) ----
for (cx, cy, r, a) in [(10, 50, 7, 255), (6, 44, 4, 200), (6, 56, 4, 200)]:
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 224, 120, a))
d.line([(0, 50), (14, 50)], fill=(255, 240, 170, 230), width=3)
d.line([(3, 43), (13, 47)], fill=(255, 240, 170, 180), width=2)
d.line([(3, 57), (13, 53)], fill=(255, 240, 170, 180), width=2)

# ---- برچسب کوچک «کلت» پایین ----
d.rounded_rectangle([44, 118, 96, 132], radius=6, fill=(16, 22, 40, 235), outline=(77, 106, 168, 200), width=1)

buf = io.BytesIO()
img.save(buf, 'PNG', optimize=True)
b64 = base64.b64encode(buf.getvalue()).decode()
out = f"CUBE_SPRITES.pistol = 'data:image/png;base64,{b64}';\n"
with open('/home/z/my-project/scripts/pistol27_data.txt', 'w') as f:
    f.write(out)
print('pistol sprite:', len(b64), 'b64 chars')
img.save('/home/z/my-project/scripts/pistol27_preview.png')
