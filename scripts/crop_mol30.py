#!/usr/bin/env python3
"""Crop molotov repro screenshot regions"""
from PIL import Image, ImageEnhance

img = Image.open("/home/z/my-project/scripts/shots30/molotov1.png")
w, h = img.size
print("molotov1:", w, h)
# 3x2 grid zoom
for r in range(3):
    for c in range(2):
        box = (c * (w // 2), r * (h // 3), (c + 1) * (w // 2), (r + 1) * (h // 3))
        crop = img.crop(box)
        crop = crop.resize((int(crop.width * 2.5), int(crop.height * 2.5)), Image.LANCZOS)
        crop = ImageEnhance.Contrast(crop).enhance(1.2)
        crop.save(f"/home/z/my-project/scripts/shots30/mol1_g{r}{c}.png")

img3 = Image.open("/home/z/my-project/scripts/shots30/molotov3.png")
for r in range(3):
    for c in range(2):
        box = (c * (w // 2), r * (h // 3), (c + 1) * (w // 2), (r + 1) * (h // 3))
        crop = img3.crop(box)
        crop = crop.resize((int(crop.width * 2.5), int(crop.height * 2.5)), Image.LANCZOS)
        crop.save(f"/home/z/my-project/scripts/shots30/mol3_g{r}{c}.png")
print("done")
