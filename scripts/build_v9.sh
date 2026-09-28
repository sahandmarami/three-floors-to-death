#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۹٫۰ — تجمیع بخش‌ها به فایل تک‌فایل نهایی
# ترتیب: HTML + منطق + رندر + کات‌سین + اسپرایت‌های فروشگاه + UI/حلقه
# (cube_sprites.js باید قبل از part4 باشد تا paintIcon تصاویر را ببیند)
# ============================================================
cd /home/z/my-project
cat scripts/v3_part1.html scripts/v3_part2.js scripts/v3_part3.js \
    scripts/v3_part5.js scripts/cube_sprites.js scripts/v3_part4.js \
    > download/three-floors-to-survival.html
echo "built: $(wc -l < download/three-floors-to-survival.html) lines, $(du -h download/three-floors-to-survival.html | cut -f1)"
