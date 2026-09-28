# -*- coding: utf-8 -*-
"""Build trap & shotgun tiles (v6): keep the REAL frame from the reference
image bases (blue pistol tile -> trap, red rocket tile -> shotgun), repaint
only the inner rectangle (gradient + separator line + stars) and draw the
game symbol. This guarantees frame consistency with the other 9 crops.
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import os

OUT = '/home/z/my-project/assets/cubes'
S = 4
FINAL = 264
BG = (20, 32, 43)

BASES = {
    'trap':    dict(base='_trap_base',    x0=27, x1=237, y0=51, y1=222),
    'shotgun': dict(base='_shotgun_base', x0=38, x1=231, y0=53, y1=208),
}
GRAD = {
    'trap':    dict(c=(0, 150, 250), m=(2, 70, 150), e=(3, 26, 62)),
    'shotgun': dict(c=(255, 96, 60), m=(198, 26, 16), e=(60, 6, 12)),
}


def build_tile(key, symbol_fn, seed):
    rng = np.random.default_rng(seed)
    cfg = BASES[key]
    base = Image.open(os.path.join(OUT, cfg['base'] + '.png')).convert('RGB')
    w, h = base.size
    ix0, iy0, ix1, iy1 = cfg['x0'], cfg['y0'], cfg['x1'], cfg['y1']
    g = GRAD[key]

    # ---- radial gradient of the inner rect ----
    yy, xx = np.mgrid[0:h, 0:w].astype(float)
    ccx, ccy = (ix0 + ix1) / 2, (iy0 + iy1) / 2 + 4
    hw, hh = (ix1 - ix0) / 2, (iy1 - iy0) / 2
    rho = np.clip(np.sqrt(((xx - ccx) / hw) ** 2 + ((yy - ccy) / hh) ** 2), 0, 1)
    img = np.asarray(base).astype(float)
    for c in range(3):
        edge = rho ** 1.4
        val = g['m'][c] + (g['c'][c] - g['m'][c]) * np.clip(1 - rho * 1.6, 0, 1) \
            + (g['e'][c] - g['m'][c]) * edge
        img[..., c] = np.where(rho <= 1.02, val, img[..., c])
    base = Image.fromarray(img.clip(0, 255).astype(np.uint8))

    dr = ImageDraw.Draw(base, 'RGBA')
    # ---- hot core (shotgun) ----
    if key == 'shotgun':
        core = Image.new('L', (w, h), 0)
        ImageDraw.Draw(core).ellipse(
            [w * .34, (iy0 + iy1) * .42, w * .66, (iy0 + iy1) * .66], fill=70)
        core = core.filter(ImageFilter.GaussianBlur(18))
        white = Image.new('RGB', (w, h), (255, 196, 160))
        base.paste(white, (0, 0), core)
        dr = ImageDraw.Draw(base, 'RGBA')

    # ---- separator: dark line between frame and inner + cyan hint ----
    dr.rectangle([ix0 - 2, iy0 - 2, ix1 + 2, iy1 + 2], outline=(6, 10, 20, 255), width=3)
    dr.rectangle([ix0 - 4, iy0 - 4, ix1 + 4, iy1 + 4], outline=(70, 140, 210, 120), width=1)

    # ---- star particles (کمتر — شلوغی کمتر) ----
    for _ in range(9):
        x = int(rng.integers(ix0 + 8, ix1 - 8))
        y = int(rng.integers(iy0 + 8, iy1 - 12))
        sz = int(rng.integers(1, 3))
        a = int(rng.integers(90, 210))
        dr.ellipse([x - sz, y - sz, x + sz, y + sz], fill=(255, 255, 255, a))

    # ---- symbol at supersampled scale ----
    big = base.convert('RGBA').resize((w * S, h * S), Image.LANCZOS)
    r = dict(x0=ix0, x1=ix1, y0=iy0, y1=iy1)
    big = symbol_fn(big, r)
    big.convert('RGB').resize((FINAL, FINAL), Image.LANCZOS).save(
        os.path.join(OUT, key + '.png'))
    print('saved', key + '.png')


def draw_trap_symbol(big, r):
    k = S
    cx = (r['x0'] + r['x1']) / 2 * k
    cy = (r['y0'] + r['y1']) / 2 * k + 6 * k
    iw = (r['x1'] - r['x0']) * k
    ih = (r['y1'] - r['y0']) * k
    glow = Image.new('RGBA', big.size, (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse(
        [cx - iw * .42, cy - ih * .58, cx + iw * .42, cy + ih * .5],
        fill=(110, 215, 255, 140))
    big.alpha_composite(glow.filter(ImageFilter.GaussianBlur(20 * k / 4)))
    dr = ImageDraw.Draw(big, 'RGBA')
    sh = Image.new('RGBA', big.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).ellipse(
        [cx - iw * .4, cy + ih * .28, cx + iw * .4, cy + ih * .44], fill=(2, 8, 16, 150))
    big.alpha_composite(sh.filter(ImageFilter.GaussianBlur(7 * k / 4)))
    dr.polygon([(cx - iw * .44, cy + ih * .34), (cx + iw * .44, cy + ih * .34),
                (cx + iw * .36, cy + ih * .14), (cx - iw * .36, cy + ih * .14)],
               fill=(14, 30, 48, 255), outline=(4, 10, 20, 255), width=int(1.3 * k))
    heights = [1.0, 1.25, 1.5, 1.25, 1.0]
    xs = [-.34, -.17, 0, .17, .34]
    for xi, hgt in zip(xs, heights):
        bx = cx + iw * xi
        base_y = cy + ih * .18
        w_ = iw * .048
        tipy = base_y - ih * .42 * hgt
        dr.polygon([(bx - w_ * 1.7, base_y + ih * .16), (bx + w_ * 1.7, base_y + ih * .16),
                    (bx + w_ * .62, tipy - 3 * k), (bx - w_ * .62, tipy - 3 * k)],
                   fill=(6, 14, 24, 255))
        dr.polygon([(bx - w_, base_y + ih * .12), (bx + w_, base_y + ih * .12),
                    (bx + w_ * .4, tipy), (bx - w_ * .4, tipy)],
                   fill=(190, 204, 218, 255))
        dr.line([(bx - w_ * .42, base_y + ih * .08), (bx - w_ * .13, tipy + 4 * k)],
                fill=(246, 251, 255, 255), width=max(2, int(1.1 * k)))
        dr.polygon([(bx - w_ * .4, tipy), (bx + w_ * .4, tipy), (bx, tipy - 3.5 * k)],
                   fill=(255, 255, 255, 255))
        dr.ellipse([bx - w_ * 1.25, base_y + ih * .1, bx + w_ * 1.25, base_y + ih * .24],
                   fill=(255, 118, 38, 245))

    def bolt(x, y):
        pts = [(x, y), (x - 5 * k, y + 7 * k), (x + 2 * k, y + 8 * k), (x - 3 * k, y + 16 * k)]
        dr.line(pts, fill=(255, 240, 96, 255), width=max(2, int(1.7 * k)), joint='curve')

    bolt(cx - iw * .26, cy - ih * .12)
    bolt(cx + iw * .26, cy - ih * .04)
    bolt(cx + iw * .07, cy - ih * .32)
    return big


def draw_shotgun_symbol(big, r):
    k = S
    cx = (r['x0'] + r['x1']) / 2 * k
    cy = (r['y0'] + r['y1']) / 2 * k + 2 * k
    iw = (r['x1'] - r['x0']) * k
    ih = (r['y1'] - r['y0']) * k
    glow = Image.new('RGBA', big.size, (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse(
        [cx - iw * .44, cy - ih * .4, cx + iw * .44, cy + ih * .34],
        fill=(255, 150, 66, 95))
    big.alpha_composite(glow.filter(ImageFilter.GaussianBlur(18 * k / 4)))
    dr = ImageDraw.Draw(big, 'RGBA')
    ang = -0.15
    ca, sa = np.cos(ang), np.sin(ang)

    def R(px, py):
        dx, dy = px - cx, py - cy
        return (cx + dx * ca - dy * sa, cy + dx * sa + dy * ca)

    def rect(x0, y0, x1, y1, fill, outline, olw):
        dr.polygon([R(x0, y0), R(x1, y0), R(x1, y1), R(x0, y1)],
                   fill=fill, outline=outline, width=max(1, int(olw)))

    L = iw * .45
    bw = iw * .075
    # سایه‌ی قوی زیر اسلحه
    sh_layer = Image.new('RGBA', big.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh_layer)
    sd.polygon([R(cx - L, cy - bw * 1.6 + 10 * k), R(cx + L, cy - bw * 1.6 + 10 * k),
                R(cx + L, cy + bw * 2.4 + 12 * k), R(cx - L, cy + bw * 2.4 + 12 * k)],
               fill=(25, 3, 3, 185))
    big.alpha_composite(sh_layer.filter(ImageFilter.GaussianBlur(10 * k / 4)))
    # دورخط کلی
    rect(cx - L, cy - bw * 1.6, cx + L, cy + bw * 2.4, (24, 9, 6, 255), (24, 9, 6, 255), 0)
    # قنداق چوبی (پایین‌چپ)
    rect(cx - L, cy - bw * 1.2, cx - L * .3, cy + bw * 1.6,
         (150, 86, 40, 255), (20, 8, 5, 255), 2.4 * k)
    dr.polygon([R(cx - L, cy - bw * 1.2), R(cx - L * .3, cy - bw * 1.2),
                R(cx - L * .36, cy - bw * .6)], fill=(196, 130, 70, 255))
    # بدنه‌ی فولادی
    rect(cx - L * .32, cy - bw * .9, cx + L * .5, cy + bw * .9,
         (74, 84, 98, 255), (14, 6, 4, 255), 2.4 * k)
    # دو لوله‌ی موازی (دکلوله — نماد کلاسیک شاتگان)
    rect(cx - L * .06, cy - bw * 1.45, cx + L, cy - bw * .28,
         (58, 66, 78, 255), (14, 6, 4, 255), 2.2 * k)
    rect(cx - L * .06, cy + bw * .12, cx + L, cy + bw * 1.28,
         (48, 55, 66, 255), (14, 6, 4, 255), 2.2 * k)
    # هایلایت لوله‌ها
    dr.line([R(cx, cy - bw * 1.22), R(cx + L * .96, cy - bw * 1.22)],
            fill=(206, 220, 234, 255), width=max(2, int(1.3 * k)))
    dr.line([R(cx, cy + bw * .36), R(cx + L * .96, cy + bw * .36)],
            fill=(150, 162, 178, 255), width=max(2, int(1.1 * k)))
    # پمپ بزرگ زیر لوله‌ها
    rect(cx + L * .16, cy + bw * 1.28, cx + L * .64, cy + bw * 2.2,
         (178, 106, 50, 255), (20, 8, 5, 255), 2.2 * k)
    for i in range(3):
        gx = cx + L * (.25 + i * .13)
        dr.line([R(gx, cy + bw * 1.42), R(gx, cy + bw * 2.05)],
                fill=(122, 68, 30, 255), width=max(2, int(1.1 * k)))
    # دو دهانه‌ی لوله + فلاش
    for oy in (-bw * .86, bw * .54):
        mx, my = cx + L, cy + oy
        dr.ellipse([mx - bw * .34, my - bw * .34, mx + bw * .34, my + bw * .34],
                   fill=(255, 158, 48, 255), outline=(112, 38, 9, 255), width=int(1.4 * k))
    mx, my = cx + L, cy - bw * .86
    fl = [(mx + bw * .35, my), (mx + bw * 1.35, my - bw * .5), (mx + bw * 1.7, my),
          (mx + bw * 1.35, my + bw * .5)]
    dr.polygon(fl, fill=(255, 214, 96, 235))
    # گارد ماشه
    dr.arc([cx - L * .36, cy + bw * .3, cx - L * .08, cy + bw * 1.5], 0, 180,
           fill=(18, 7, 5, 255), width=int(2.2 * k))
    # دو فشنگ در بالا
    for i, (shx, shy) in enumerate([(cx + L * .58, cy - bw * 2.2),
                                     (cx + L * .74, cy - bw * 1.95)]):
        dr.polygon([R(shx, shy), R(shx + 9 * k, shy - 2 * k), R(shx + 11 * k, shy + 3 * k),
                    R(shx + 2 * k, shy + 6 * k)], fill=(255, 206, 62, 255),
                   outline=(140, 70, 10, 255))
    return big


build_tile('trap', draw_trap_symbol, 7)
build_tile('shotgun', draw_shotgun_symbol, 11)

# game-scale check: synthesized pair next to real tiles at 48px + big pair
names = ['repair', 'speed', 'health', 'weapon', 'shotgun', 'mg',
         'gatling', 'sniper', 'frost', 'turretUp', 'trap']
sheet = Image.new('RGB', (6 * 190 + 70, 2 * 190 + 30), (10, 14, 22))
for i, n in enumerate(names):
    im = Image.open(os.path.join(OUT, n + '.png')).resize((180, 180), Image.LANCZOS)
    sheet.paste(im, (10 + (i % 6) * 190, 10 + (i // 6) * 190))
sheet.save(os.path.join(OUT, '_sheet.png'))
# game scale strip (48px icons like the panel)
strip = Image.new('RGB', (11 * 60 + 20, 70), (10, 14, 22))
for i, n in enumerate(names):
    im = Image.open(os.path.join(OUT, n + '.png')).resize((48, 48), Image.LANCZOS)
    strip.paste(im, (10 + i * 60, 12))
strip.save(os.path.join(OUT, '_gamescale.png'))
print('sheets saved')
