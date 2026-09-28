# -*- coding: utf-8 -*-
"""ساخت اسپرایت‌های «مکعب پیکسل‌آرت» برای پنل ساخت‌وساز بازی سه طبقه تا بقا (v8).

هر آیتم یک مکعب ایزومتریک با بافت پیکسلی (وجه بالا روشن + وجه چپ تیره +
وجه راست میانه + رگه‌ها/خال‌ها + لبه‌ی تیره) + نشانِ آیتم روی وجه بالا.
خروجی: PNG های ۷۶×۷۶ (شبکه‌ی منطقی ۳۸×۳۸ که ×۲ بزرگ‌نمایی NEAREST شده)
+ فایل JS با data-URI های base64 (scripts/cube_sprites.js).
"""
import hashlib
from PIL import Image

GRID = 38          # شبکه‌ی منطقی پیکسل‌آرت
SCALE = 2          # بزرگ‌نمایی → خروجی ۷۶×۷۶
CX, CTY = 19.0, 11.0   # مرکز x و مرکز وجه بالای مکعب
HW, HH, SD = 15.0, 7.5, 14.0   # نیم‌عرض / نیم‌ارتفاع وجه بالا / عمق دیواره‌ها


def cell_rand(kind, i, j, salt=0):
    """عدد شبه‌تصادفی قطعی برای هر خانه (بافت همیشه یکسان تولید شود)."""
    h = hashlib.md5(f"{kind}:{i}:{j}:{salt}".encode()).digest()
    return (int.from_bytes(h[:4], 'big') % 10000) / 10000.0


def in_top(dx, dy):
    return abs(dx) / HW + abs(dy) / HH <= 1.0


def side_top_edge(dx):
    """مرز بالایی دیواره‌های جانبی در ستون dx (لبه‌ی پایینی وجه بالا)."""
    if dx < 0:
        return CTY + ((dx + HW) / HW) * HH
    return CTY + ((HW - dx) / HW) * HH


def face_of(x, y):
    """وجه مکعب برای مرکز خانه (x, y) → 'top'/'left'/'right' یا None."""
    dx, dyT = x - CX, y - CTY
    if in_top(dx, dyT):
        return 'top'
    if abs(dx) <= HW:
        ye = side_top_edge(dx)
        if ye - 1.0 <= y <= ye + SD:
            return 'left' if dx < 0 else 'right'
    return None


def shade(c, k):
    """روشن/تیره کردن رنگ hex با ضریب k."""
    r, g, b = int(c[1:3], 16), int(c[3:5], 16), int(c[5:7], 16)
    f = lambda v: max(0, min(255, int(v * k)))
    return f"#{f(r):02x}{f(g):02x}{f(b):02x}"


def hex2rgb(c):
    return (int(c[1:3], 16), int(c[3:5], 16), int(c[5:7], 16), 255)


# ---------- نشان‌های آیتم‌ها روی وجه بالا (فضای واحد squashed) ----------
# sx = dx/HW ∈ [-1,1] ، sy = dyT/HH*2 ∈ [-2,2] (فشرده‌گی عمقی باز شده)
def sym_weapon(sx, sy):
    d = (sx * sx + sy * sy) ** 0.5
    return (0.42 < d < 0.62) or d < 0.16


def sym_health(sx, sy):
    return (abs(sx) < 0.21 and abs(sy) < 0.68) or (abs(sy) < 0.21 and abs(sx) < 0.68)


def sym_repair(sx, sy):
    d = (sx * sx + sy * sy) ** 0.5
    on_diag = abs(sx - sy * 0.9) < 0.15 and d < 0.72
    head = 0.2 < ((sx + 0.4) ** 2 + (sy - 0.4) ** 2) ** 0.5 < 0.38
    return on_diag or head


def sym_trap(sx, sy):
    for k in (-1, 0, 1):
        cxp = k * 0.45
        if -0.62 < sy < 0.5 and abs(sx - cxp) < 0.185 * (0.5 - sy):
            return True
    return False


def sym_shotgun(sx, sy):
    # شاتگانِ مورب: قنداق عریض + لوله‌ی باریک + پمپ + سر گلوله
    u = (sx + sy * 0.85) / 1.31
    v = (sy - sx * 0.85) / 1.31
    barrel = abs(v) < 0.11 and -0.42 < u < 0.86
    stock = abs(v) < 0.34 * (1 - max(0, (u + 0.38)) / 0.6) and -0.95 < u < -0.38
    pump = abs(v - 0.19) < 0.085 and 0.1 < u < 0.4
    dot = (u - 0.97) ** 2 + v ** 2 < 0.028
    return barrel or stock or pump or dot


def sym_mg(sx, sy):
    for k in (-1, 0, 1):
        cxp = k * 0.42
        if abs(sx - cxp) < 0.115 and -0.58 < sy < 0.3:
            return True
    return False


def sym_gatling(sx, sy):
    if (sx * sx + (sy - 0.3) ** 2) < 0.045:   # توپی مرکزی
        return True
    for k in (-1, 0, 1):
        cxp = k * 0.34 * (0.55 - sy) / 1.1
        if abs(sx - cxp) < 0.1 and -0.62 < sy < 0.3:
            return True
    return False


def sym_sniper(sx, sy):
    d = (sx * sx + sy * sy) ** 0.5
    if 0.4 < d < 0.58:
        return True
    if (abs(sx) < 0.09 or abs(sy) < 0.09) and 0.6 < d < 0.95:
        return True
    return d < 0.12


def sym_frost(sx, sy):
    d = (sx * sx + sy * sy) ** 0.5
    if d > 0.92 or d < 0.1:
        return False
    import math
    th = math.atan2(sy, sx)
    return abs(math.sin(3 * th)) * d < 0.30


def sym_turret_up(sx, sy):
    # پیکان بالارونده‌ی واضح + شورون کوتاه زیر ساقه
    stem = abs(sx) < 0.17 and 0.02 < sy < 0.74
    head = abs(sx) < 0.88 * (0.06 - sy) / 0.78 and -0.78 < sy < 0.06
    chev = abs(sy - 0.9 - 0.5 * abs(sx)) < 0.15 and abs(sx) < 0.62
    return stem or head or chev


MATERIALS = {
    # kind: (top, top_speck, left, left_streak, right, right_streak, edge, symbol)
    'weapon':   ('#ffd75e', '#e8b93a', '#b07f1c', '#8f6414', '#d8a028', '#b8871f', '#5d3f0e', '#6b4a12'),
    'health':   ('#ff7263', '#e25046', '#a6362d', '#842a24', '#cf4439', '#ad3a30', '#5f1713', '#fff5f2'),
    'repair':   ('#a9c0e2', '#8aa8d2', '#55719e', '#42598a', '#7794c2', '#5f7cad', '#22304f', '#eef3fa'),
    'trap':     ('#dcb671', '#c39c55', '#9a7639', '#7e5f2c', '#b8934c', '#a17d3e', '#4c3a1a', '#3a2c14'),
    'shotgun':  ('#cda175', '#b2855c', '#7d5f3d', '#664b2f', '#a07c50', '#8a6840', '#3a2c18', '#23262e'),
    'mg':       ('#98a4b8', '#7d8ba2', '#55606f', '#434c59', '#6b7689', '#576173', '#20242c', '#f0b53c'),
    'gatling':  ('#9dbb6e', '#83a355', '#5f763c', '#4c5f30', '#75904c', '#63783e', '#2c3a1c', '#22262e'),
    'sniper':   ('#7897cf', '#5d7cb5', '#465b82', '#384a6b', '#58719f', '#495e88', '#1b2740', '#ffe9a8'),
    'frost':    ('#d4eeff', '#b1dcf7', '#7fb8dd', '#69a3c9', '#a5d3f0', '#8dc0e2', '#33637f', '#2e6f9e'),
    'turretUp': ('#ba94dd', '#a17cc6', '#7a5a99', '#64497f', '#9370b5', '#7c5ca0', '#38264c', '#ffd873'),
}

SYMBOLS = {
    'weapon': sym_weapon, 'health': sym_health, 'repair': sym_repair,
    'trap': sym_trap, 'shotgun': sym_shotgun, 'mg': sym_mg,
    'gatling': sym_gatling, 'sniper': sym_sniper, 'frost': sym_frost,
    'turretUp': sym_turret_up,
}


def make_cube(kind):
    top, tsp, lft, lst, rgt, rst, edge, symcol = MATERIALS[kind]
    sym = SYMBOLS[kind]
    img = Image.new('RGBA', (GRID * SCALE, GRID * SCALE), (0, 0, 0, 0))
    px = img.load()
    cells = {}   # (i,j) -> face
    for i in range(GRID):
        for j in range(GRID):
            f = face_of(i + 0.5, j + 0.5)
            if f:
                cells[(i, j)] = f
    # رنگ‌آمیزی هر خانه + بافت
    for (i, j), f in cells.items():
        x, y = i + 0.5, j + 0.5
        dx, dyT = x - CX, y - CTY
        r = cell_rand(kind, i, j)
        if f == 'top':
            # روشنایی شعاعی (سمت شمال روشن‌تر) + خال‌های بافت
            k = 1.0 + 0.10 * (1 - abs(dyT) / HH) + (0.06 if dx < 0 else 0)
            c = shade(top, k)
            if r < 0.16:
                c = tsp
            # برق مورب سطح
            if abs((dx / HW) + (dyT / HH) - 0.55) < 0.16 and r > 0.4:
                c = shade(top, 1.14)
            # نشان آیتم روی وجه بالا
            sx, sy = dx / HW, dyT / HH * 2.0
            if sym(sx, sy) and abs(sx) < 0.95 and abs(sy) < 1.8:
                c = symcol
        elif f == 'left':
            ye = side_top_edge(dx)
            t = (y - ye) / SD          # ۰ بالا … ۱ پایین دیواره
            k = 1.02 - 0.34 * t
            c = shade(lft, k)
            if cell_rand(kind, i, j, 7) < 0.22:
                c = shade(lst, k)
            # درزهای عمودی منظم (بلوک‌چینی)
            if (i % 8) == 0 and t > 0.12:
                c = shade(lst, 0.82)
        else:
            ye = side_top_edge(dx)
            t = (y - ye) / SD
            k = 1.06 - 0.30 * t
            c = shade(rgt, k)
            if cell_rand(kind, i, j, 11) < 0.2:
                c = shade(rst, k)
            if (j % 7) == 0 and t > 0.1:
                c = shade(rst, 0.86)
        px[i * SCALE, j * SCALE] = hex2rgb(c)
        px[i * SCALE + 1, j * SCALE] = hex2rgb(c)
        px[i * SCALE, j * SCALE + 1] = hex2rgb(c)
        px[i * SCALE + 1, j * SCALE + 1] = hex2rgb(c)
    # لبه‌ی تیره‌ی دورتادور (سیلوئت) + هایلایت لبه‌ی شمالی/غربی وجه بالا
    edge_rgb, hi_rgb = hex2rgb(shade(edge, 1.0)), None
    topc = hex2rgb(shade(top, 1.0))
    for (i, j), f in cells.items():
        nb = [(i - 1, j), (i + 1, j), (i, j - 1), (i, j + 1)]
        if any(n not in cells for n in nb):
            for ox in range(SCALE):
                for oy in range(SCALE):
                    px[i * SCALE + ox, j * SCALE + oy] = edge_rgb
    # هایلایت ۱ خانه‌ای لبه‌ی بالایی وجه بالا (جهت نور)
    for (i, j), f in cells.items():
        if f == 'top' and (i, j - 1) not in cells and (i - 1, j) in cells:
            for ox in range(SCALE):
                for oy in range(SCALE):
                    px[i * SCALE + ox, j * SCALE + oy] = topc
    return img


def main():
    import base64, io, os
    os.makedirs('/home/z/my-project/scripts/cubes', exist_ok=True)
    parts = []
    for kind in MATERIALS:
        img = make_cube(kind)
        p = f'/home/z/my-project/scripts/cubes/{kind}.png'
        img.save(p)
        buf = io.BytesIO()
        img.save(buf, format='PNG', optimize=True)
        b64 = base64.b64encode(buf.getvalue()).decode()
        parts.append(f"  {kind}: 'data:image/png;base64,{b64}'")
        print(f'{kind}: {len(b64)} chars b64')
    js = ("/* آیکون‌های مکعبی پنل ساخت‌وساز (۸٫۰) — اسپرایت‌های پیکسل‌آرتِ از پیش\n"
          "   تولیدشده؛ به‌صورت data-URI در فایل تک‌فایل بازی جاسازی شده‌اند. */\n"
          "const CUBE_SPRITES = {\n" + ",\n".join(parts) + "\n};\n\n"
          "/* نسخه‌ی بارگذاری‌شده‌ی تصاویر برای رسم سریع روی کاشی‌ها */\n"
          "const CUBE_IMGS = {};\n"
          "for (const k in CUBE_SPRITES) {\n"
          "  const im = new Image();\n"
          "  im.onload = () => { repaintCubeIcons(k); };\n"
          "  im.src = CUBE_SPRITES[k];\n"
          "  CUBE_IMGS[k] = im;\n"
          "}\n")
    with open('/home/z/my-project/scripts/cube_sprites.js', 'w') as f:
        f.write(js)
    print('\n-> scripts/cube_sprites.js نوشته شد:', len(js), 'chars')


if __name__ == '__main__':
    main()
