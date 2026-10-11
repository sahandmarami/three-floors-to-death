#!/usr/bin/env python3
"""Pixel-level analysis of the two Android bug screenshots (2340x1080)."""
from PIL import Image
import os

D = '/home/z/my-project/download/drive_assets/extracted'
files = ['باگه منو .jpg', 'باگ صفحه با مکان نوشته ها .jpg']

def region_avg(im, box):
    px = im.crop(box)
    w, h = px.size
    data = list(px.getdata())
    n = len(data)
    r = sum(p[0] for p in data) // n
    g = sum(p[1] for p in data) // n
    b = sum(p[2] for p in data) // n
    return (r, g, b)

for f in files:
    im = Image.open(os.path.join(D, f)).convert('RGB')
    W, H = im.size
    print(f'\n===== {f} ({W}x{H}) =====')
    # Detect letterbox: scan a horizontal line in the middle & vertical line center
    # sample rows at various y, columns at various x
    # 1) corners (letterbox areas)
    print('corners (letterbox?):',
          'TL', region_avg(im, (0, 0, 200, 120)),
          'TR', region_avg(im, (W-200, 0, W, 120)),
          'BL', region_avg(im, (0, H-120, 200, H)),
          'BR', region_avg(im, (W-200, H-120, W, H)))
    # 2) edges mid
    print('edges mid: L', region_avg(im, (0, H//2-60, 120, H//2+60)),
          'R', region_avg(im, (W-120, H//2-60, W, H//2+60)),
          'T', region_avg(im, (W//2-100, 0, W//2+100, 100)),
          'B', region_avg(im, (W//2-100, H-100, W//2+100, H)))
    # 3) find actual game rect: scan row H//2 for where content starts/ends (non-black)
    row = [im.getpixel((x, H//2)) for x in range(0, W, 6)]
    def is_dark(p): return p[0] < 12 and p[1] < 12 and p[2] < 16
    first, last = None, None
    for i, p in enumerate(row):
        if not is_dark(p):
            if first is None: first = i * 6
            last = i * 6
    print(f'content span on mid row: x {first}..{last}  (width {last-first if first else 0}px of {W})')
    col = [im.getpixel((W//2, y)) for y in range(0, H, 6)]
    firsty, lasty = None, None
    for i, p in enumerate(col):
        if not is_dark(p):
            if firsty is None: firsty = i * 6
            lasty = i * 6
    print(f'content span on mid col: y {firsty}..{lasty}  (height {lasty-firsty if firsty else 0}px of {H})')
    # 4) sample center-area colors (game world) vs expected palette
    print('center game area avg:', region_avg(im, (W//2-300, H//2-100, W//2+300, H//2+100)))
    print('game top area avg:', region_avg(im, (W//2-300, firsty+30 if firsty else 100, W//2+300, (firsty+30 if firsty else 100)+150)))
    # 5) brightest pixels overall (are there any truly bright/white pixels?)
    small = im.resize((W//4, H//4))
    data = list(small.getdata())
    mx = max(data, key=lambda p: p[0]+p[1]+p[2])
    print('brightest sampled pixel:', mx)
    # 6) histogram of luminance in game area
    game = im.crop((first or 0, firsty or 0, last or W, lasty or H))
    gs = game.convert('L')
    hist = gs.histogram()
    total = sum(hist)
    dark = sum(hist[:40]) / total
    mid = sum(hist[40:120]) / total
    bright = sum(hist[120:]) / total
    print(f'luminance in game area: dark<{40}: {dark:.1%}  mid: {mid:.1%}  bright: {bright:.1%}')
    # 7) saturation check
    hsv = game.convert('HSV')
    s_vals = list(hsv.split()[1].getdata())
    avg_sat = sum(s_vals) / len(s_vals)
    print(f'avg saturation in game area: {avg_sat:.1f}/255')
