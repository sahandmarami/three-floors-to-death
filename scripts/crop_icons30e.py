#!/usr/bin/env python3
# v30 — crop user icons from icons.png with border detection + rounded corners
from PIL import Image, ImageDraw
import numpy as np, os, json

im = Image.open('/home/z/my-project/scripts/icons.png').convert('RGB')
a = np.asarray(im).astype(int)
H, W, _ = a.shape
r, g, b = a[:,:,0], a[:,:,1], a[:,:,2]

# bright blue border mask
border = (b > r + 30) & (b > 110) & (g > 70) & (g < 220)

# expected regions (l%, t%, r%, b%) — generous, from VLM
REGIONS = {
  'pistol':    (11.0, 1.0, 37.0, 36.0),
  'shotgun':   (36.5, 1.0, 62.5, 36.0),
  'rifle':     (62.5, 1.0, 88.5, 36.0),
  'firstaid':  (1.0, 42.5, 19.2, 71.0),
  'ammobox':   (18.0, 42.5, 36.0, 71.0),
  'energy':    (34.5, 42.5, 52.0, 71.0),
  'vest':      (50.5, 42.5, 68.0, 71.0),
  'grenade':   (66.5, 42.5, 84.0, 71.0),
  'landmine':  (81.5, 42.5, 99.0, 73.0),
  'backpack':  (1.0, 69.5, 19.0, 99.0),
  'runner':    (17.8, 69.5, 35.0, 99.0),
  'shield':    (34.5, 69.5, 51.5, 99.0),
  'radar':     (50.8, 69.5, 68.0, 99.0),
  'binoculars':(67.3, 69.5, 84.5, 99.0),
  'flashlight':(83.5, 69.5, 100.0, 99.0),
}

def find_box(name, l, t, rr, bb):
    x0, y0 = int(W * l / 100), int(H * t / 100)
    x1, y1 = int(W * rr / 100), int(H * bb / 100)
    reg = border[y0:y1, x0:x1]
    rh, rw = reg.shape
    # rows/cols with border pixels
    rowsum = reg.sum(axis=1)
    colsum = reg.sum(axis=0)
    def edges(cnt, total, frac):
        # find first and last strong edge
        th = max(6, int(total * frac))
        idx = [i for i, v in enumerate(cnt) if v >= th]
        if not idx: return None
        return idx[0], idx[-1]
    er = edges(rowsum, rw, 0.45)
    ec = edges(colsum, rh, 0.45)
    if er is None or ec is None:
        return None
    top, bot = er[0] + y0, er[1] + y0
    left, right = ec[0] + x0, ec[1] + x0
    return (left, top, right, bot)

OUT = '/home/z/my-project/scripts/icons30'
os.makedirs(OUT, exist_ok=True)
meta = {}
for name, (l, t, rr, bb) in REGIONS.items():
    box = find_box(name, l, t, rr, bb)
    if box is None:
        print(f'{name}: NO BORDER BOX — fallback to region')
        box = (int(W*l/100), int(H*t/100), int(W*rr/100), int(H*bb/100))
    left, top, right, bot = box
    # sanity: reasonable size
    if not (120 < right-left < 400 and 120 < bot-top < 400):
        print(f'{name}: suspicious box {box} — fallback')
        box = (int(W*l/100), int(H*t/100), int(W*rr/100), int(H*bb/100))
        left, top, right, bot = box
    # inset 3px inside border
    L, T, R, B = left+3, top+3, right-3, bot-3
    crop = im.crop((L, T, R, B))
    cw, ch = crop.size
    # rounded-corner mask (radius 13%)
    rad = int(min(cw, ch) * 0.13)
    mask = Image.new('L', (cw, ch), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([0, 0, cw-1, ch-1], radius=rad, fill=255)
    out = crop.convert('RGBA')
    out.putalpha(mask)
    # pad to square + resize 128
    side = max(cw, ch)
    sq = Image.new('RGBA', (side, side), (0,0,0,0))
    sq.paste(out, ((side-cw)//2, (side-ch)//2))
    sq = sq.resize((128, 128), Image.LANCZOS)
    # quantize to shrink: keep RGBA via palette with alpha? use P mode with transparency
    final = sq
    path = f'{OUT}/{name}.png'
    final.save(path, optimize=True)
    meta[name] = {'box': box, 'size': os.path.getsize(path)}
    print(f'{name:12s} box={box} crop={cw}x{ch} -> {os.path.getsize(path)}B')

# contact sheet for VLM verify
sheet = Image.new('RGB', (128*5+24*6, 128*3+24*4), (20,20,30))
from PIL import ImageFont
names = list(REGIONS.keys())
for i, name in enumerate(names):
    col, row = i % 5, i // 5
    ic = Image.open(f'{OUT}/{name}.png').convert('RGBA')
    bg = Image.new('RGBA', (128,128), (30,34,52,255))
    bg.alpha_composite(ic)
    sheet.paste(bg.convert('RGB'), (24+col*(128+24), 24+row*(128+24)))
sheet.save(f'{OUT}/sheet.png')
print('sheet saved')
json.dump(meta, open(f'{OUT}/meta.json','w'))
