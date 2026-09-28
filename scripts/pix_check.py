from PIL import Image
import math

def lum(im, x, y):
    p = im.getpixel((x, y))
    if len(p) >= 3:
        r, g, b = p[0], p[1], p[2]
        return 0.2126*r + 0.7152*g + 0.0722*b
    return p

def region_lum(path, cx, cy, r_in, r_out):
    im = Image.open(path).convert('RGB')
    W, H = im.size
    tin = tout = nin = nout = 0
    step = 2
    for y in range(0, H, step):
        for x in range(0, W, step):
            d = math.hypot(x - cx, y - cy)
            if d <= r_in:
                tin += lum(im, x, y); nin += 1
            elif d <= r_out:
                tout += lum(im, x, y); nout += 1
    return (tin/max(nin,1), tout/max(nout,1))

def overall(path):
    im = Image.open(path).convert('RGB')
    W, H = im.size
    tot = n = 0
    for y in range(0, H, 4):
        for x in range(0, W, 4):
            tot += lum(im, x, y); n += 1
    # گوشه‌های دور از برج
    corners = 0; cn = 0
    for (x0,y0,x1,y1) in [(0,0,150,120),(W-150,0,W,120),(0,H-120,150,H),(W-150,H-120,W,H)]:
        for y in range(y0,y1,4):
            for x in range(x0,x1,4):
                corners += lum(im,x,y); cn += 1
    return tot/n, corners/cn

# مرکز نور تقریبی: برج در x=480 (scale 1100/960?) — تصویر 1100x640، بوم شاید 960x560 با آفست
# از کد: TOWER.x=480, TOWER_TOP_Y≈165. بوم داخل #wrap وسط صفحه است.
# اول کلی تحلیل کنیم، بعد دقیق
for p in ['scripts/shots10/06_blackout_flashlight.png',
          'scripts/shots10/05_ch2_fog_night.png',
          'scripts/shots10/16_boss_finalnight.png',
          'scripts/shots10/13_ch3_day.png']:
    avg, corn = overall(p)
    print(f"{p.split('/')[-1]:35s} overall={avg:6.1f}  corners={corn:6.1f}")

print()
# برای blackout: ناحیه روشن دور برج؟ چند مرکز کاندیدا امتحان کن
im = Image.open('scripts/shots10/06_blackout_flashlight.png').convert('RGB')
W, H = im.size
print('size:', W, H)
# اسکن全网: میانگین روشنایی پنجره‌ای 60px برای پیدا کردن روشن‌ترین ناحیه
best = None
for cy in range(60, H-60, 40):
    for cx in range(60, W-60, 40):
        s = n = 0
        for y in range(cy-30, cy+30, 6):
            for x in range(cx-30, cx+30, 6):
                s += lum(im, x, y); n += 1
        v = s/n
        if best is None or v > best[0]:
            best = (v, cx, cy)
print('brightest window:', best)
v, cx, cy = best
inner, outer = region_lum('scripts/shots10/06_blackout_flashlight.png', cx, cy, 40, 400)
print(f'around brightest: inner={inner:.1f} outer={outer:.1f}  ratio={inner/max(outer,1):.2f}')
