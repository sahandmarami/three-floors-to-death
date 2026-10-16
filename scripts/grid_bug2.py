#!/usr/bin/env python3
"""Full-grid zoom of bugshot_2 to find the text flood area"""
from PIL import Image, ImageEnhance

img = Image.open("/home/z/my-project/scripts/bugshot_2.jpg")
w, h = img.size
# split into 3x2 grid, upscale 2.5x, boost contrast
for r in range(3):
    for c in range(2):
        box = (c * (w // 2), r * (h // 3), (c + 1) * (w // 2), (r + 1) * (h // 3))
        crop = img.crop(box)
        crop = crop.resize((int(crop.width * 2.2), int(crop.height * 2.2)), Image.LANCZOS)
        crop = ImageEnhance.Contrast(crop).enhance(1.3)
        crop.save(f"/home/z/my-project/scripts/bug2_g{r}{c}.png")
print("grid saved")
