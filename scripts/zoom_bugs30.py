#!/usr/bin/env python3
"""Deep zoom into specific regions"""
from PIL import Image

# bugshot_2 top-left area (weapon chips + odd text)
img = Image.open("/home/z/my-project/scripts/bugshot_2.jpg")
w, h = img.size  # 2340x1080

# Top-left region where the stacked Persian text was seen
c = img.crop((0, 0, 900, 400))
c = c.resize((c.width * 3, c.height * 3), Image.LANCZOS)
c.save("/home/z/my-project/scripts/bug2_zoom_tl.png")
print("saved bug2_zoom_tl.png", c.size)

# Center-left area
c2 = img.crop((0, 300, 1100, 800))
c2 = c2.resize((c2.width * 2, c2.height * 2), Image.LANCZOS)
c2.save("/home/z/my-project/scripts/bug2_zoom_ml.png")

# bugshot_1 — peddler shop: find the molotov purchase area (right side where cards are)
img1 = Image.open("/home/z/my-project/scripts/bugshot_1.jpg")
c3 = img1.crop((600, 200, 1800, 900))
c3 = c3.resize((int(c3.width * 1.8), int(c3.height * 1.8)), Image.LANCZOS)
c3.save("/home/z/my-project/scripts/bug1_zoom_shop.png")

# bugshot_3 — build sheet area (right half)
img3 = Image.open("/home/z/my-project/scripts/bugshot_3.jpg")
c4 = img3.crop((1100, 100, 2340, 1080))
c4 = c4.resize((int(c4.width * 1.8), int(c4.height * 1.8)), Image.LANCZOS)
c4.save("/home/z/my-project/scripts/bug3_zoom_sheet.png")

# bugshot_4 — main menu full center (zombies area)
img4 = Image.open("/home/z/my-project/scripts/bugshot_4.jpg")
c5 = img4.crop((0, 300, 2340, 1080))
c5.save("/home/z/my-project/scripts/bug4_zoom_zombies.png")
print("done")
