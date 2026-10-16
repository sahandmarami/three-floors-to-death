#!/usr/bin/env python3
"""Max zoom on the exact top-left corner strip where the text flood was seen"""
from PIL import Image, ImageEnhance, ImageFilter

img = Image.open("/home/z/my-project/scripts/bugshot_2.jpg")
w, h = img.size
# The stacked texts were around x=40-500, y=40-320 (top-left area)
c = img.crop((30, 30, 700, 340))
c = c.resize((c.width * 3, c.height * 3), Image.LANCZOS)
c = ImageEnhance.Contrast(c).enhance(1.4)
c = ImageEnhance.Sharpness(c).enhance(1.5)
c.save("/home/z/my-project/scripts/bug2_maxzoom_tl.png")
print("saved", c.size)

# also the bottom center strip (subtitle area)
c2 = img.crop((500, 850, 1900, 1050))
c2 = c2.resize((c2.width * 2, c2.height * 2), Image.LANCZOS)
c2 = ImageEnhance.Contrast(c2).enhance(1.4)
c2.save("/home/z/my-project/scripts/bug2_maxzoom_sub.png")
