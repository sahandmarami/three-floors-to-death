#!/usr/bin/env python3
"""Crop the build sheet area from clean screenshots"""
from PIL import Image, ImageEnhance

for name in ["clean_wpn", "clean_sur", "clean_up"]:
    p = f"/home/z/my-project/scripts/shots30/{name}.png"
    img = Image.open(p)
    w, h = img.size
    # sheet is at bottom area: y=180..360 of 360 → bottom half
    c = img.crop((0, int(h*0.44), w, h))
    c = c.resize((int(c.width*2.5), int(c.height*2.5)), Image.LANCZOS)
    c = ImageEnhance.Contrast(c).enhance(1.15)
    c.save(f"/home/z/my-project/scripts/shots30/{name}_crop.png")
    print(name, img.size, "->", c.size)
