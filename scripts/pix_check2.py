from PIL import Image

im = Image.open('scripts/shots10/06_blackout_flashlight.png').convert('RGB')
W, H = im.size

def lum(x, y):
    p = im.getpixel((x, y))
    return 0.2126*p[0] + 0.7152*p[1] + 0.0722*p[2]

def band(cx, cy, r0, r1):
    import math
    s = n = 0
    for y in range(0, H, 2):
        for x in range(0, W, 2):
            d = math.hypot(x-cx, y-cy)
            if r0 <= d < r1:
                s += lum(x, y); n += 1
    return s/max(n,1)

# مرکز نور مورد انتظار: world(480,282) → shot(550,322)
for name, cx, cy in [('expected-light(550,322)', 550, 322),
                      ('toast(500,100)', 500, 100)]:
    print(name)
    for r0, r1 in [(0,30),(30,80),(80,150),(150,230),(230,300),(300,380),(380,460)]:
        print(f'  r {r0:3d}-{r1:3d}: {band(cx,cy,r0,r1):6.1f}')

# برش عمودی از مرکز برج برای دیدن ساختار
print()
print('vertical profile at x=550 (through expected light center):')
for y in range(60, 640, 24):
    print(f'  y={y:3d}: {lum(550,y):6.1f}   x=200: {lum(200,y):6.1f}   x=900: {lum(900,y):6.1f}')

# رنگ نقطه روشن‌ترین پیکسل ناحیه (500,100)
print()
print('pixels around (500,100):')
for dy in (-20, 0, 20):
    row = []
    for dx in (-40, -20, 0, 20, 40):
        row.append(str(im.getpixel((500+dx, 100+dy))))
    print('  ', ' | '.join(row))
