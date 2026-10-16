#!/usr/bin/env python3
from PIL import Image
import os
# Crop key regions of each 2340x1080 screenshot for closer VLM inspection
DIR = '/home/z/my-project/bugs29/'
OUT = '/home/z/my-project/bugs29/crops/'
os.makedirs(OUT, exist_ok=True)
specs = {
    'bug1': [
        ('left',   (0, 0, 700, 1080)),      # left column weapons
        ('bottom', (0, 600, 2340, 1080)),    # bottom area
        ('center', (600, 200, 1800, 800)),   # center
    ],
    'bug2': [
        ('full2x', (0, 0, 2340, 1080)),
        ('left',   (0, 0, 900, 1080)),
        ('right',  (1300, 0, 2340, 1080)),
    ],
    'bug3': [
        ('left',   (0, 0, 800, 1080)),
        ('right',  (1500, 0, 2340, 1080)),
        ('bottom', (0, 500, 2340, 1080)),
    ],
    'bug4': [
        ('left',   (0, 0, 800, 1080)),
        ('right',  (1500, 0, 2340, 1080)),
        ('bottom', (0, 500, 2340, 1080)),
    ],
}
for name, regions in specs.items():
    im = Image.open(DIR + f'{name}.jpg')
    for tag, box in regions:
        crop = im.crop(box)
        # upscale small crops 1.5x for readability
        w, h = crop.size
        crop = crop.resize((int(w*1.5), int(h*1.5)), Image.LANCZOS)
        crop.save(OUT + f'{name}_{tag}.jpg', quality=88)
        print(f'{name}_{tag}.jpg', crop.size)
print('done')
