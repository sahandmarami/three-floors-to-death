# -*- coding: utf-8 -*-
"""تولید cube_sprites.js — ۱۱ کاشی فروشگاه (۹ برش واقعی از تصویر کاربر +
۲ ترکیبی هم‌سبک) به‌صورت data-URI برای جاسازی در فایل تک‌فایل بازی."""
import base64
import io
import os
from PIL import Image

OUT_JS = '/home/z/my-project/scripts/cube_sprites.js'
CUBES = '/home/z/my-project/assets/cubes'
SIZE = 96          # اندازه‌ی جاسازی (نمایش ۴۴px در پنل → شارپ در رتینا)

KEYS = ['repair', 'speed', 'health', 'weapon', 'trap', 'shotgun',
        'mg', 'gatling', 'sniper', 'frost', 'turretUp']

parts = []
total = 0
for k in KEYS:
    p = os.path.join(CUBES, k + '.png')
    im = Image.open(p).convert('RGB').resize((SIZE, SIZE), Image.LANCZOS)
    im = im.quantize(colors=96, method=Image.MEDIANCUT, dither=Image.FLOYDSTEINBERG)
    buf = io.BytesIO()
    im.save(buf, 'PNG', optimize=True)
    b = buf.getvalue()
    total += len(b)
    parts.append(f'  {k}: ' + repr('data:image/png;base64,' + base64.b64encode(b).decode()))
    print(f'{k}: {len(b)/1024:.1f} KB')

js = ('/* آیکون‌های فروشگاه (۹٫۰) — برش مستقیم از تصویر مرجع کاربر\n'
      '   (مکعب‌های فروشگاه با قاب تکنیک/گرادیان/نماد) + دو کاشی ترکیبی\n'
      '   هم‌سبک (تله خار و شاتگان). جاسازی‌شده به‌صورت data-URI تا بازی\n'
      '   تک‌فایل و بدون منبع خارجی بماند. */\n'
      'const CUBE_SPRITES = {\n' + ',\n'.join(parts) + '\n};\n\n'
      '/* نسخه‌ی بارگذاری‌شده‌ی تصاویر برای رسم سریع روی کاشی‌ها */\n'
      'const CUBE_IMGS = {};\n'
      'for (const k in CUBE_SPRITES) {\n'
      '  const im = new Image();\n'
      '  im.onload = () => { repaintCubeIcons(k); };\n'
      '  im.src = CUBE_SPRITES[k];\n'
      '  CUBE_IMGS[k] = im;\n'
      '}\n')

with open(OUT_JS, 'w') as f:
    f.write(js)
print(f'--- total raw: {total/1024:.1f} KB, js written: {OUT_JS}')
