#!/usr/bin/env python3
"""Crop corners of user bug screenshots for close inspection"""
from PIL import Image
import sys

for i in range(1, 5):
    p = f"/home/z/my-project/scripts/bugshot_{i}.jpg"
    img = Image.open(p)
    w, h = img.size
    print(f"bugshot_{i}: {w}x{h}")
    # corners: top-left, top-right, bottom-left, bottom-right + full center
    crops = {
        "tl": (0, 0, w//2, h//3),
        "tr": (w//2, 0, w, h//3),
        "bl": (0, 2*h//3, w//2, h),
        "br": (w//2, 2*h//3, w, h),
    }
    for name, box in crops.items():
        c = img.crop(box)
        c = c.resize((c.width*2, c.height*2), Image.LANCZOS)
        c.save(f"/home/z/my-project/scripts/bug{i}_{name}.png")
