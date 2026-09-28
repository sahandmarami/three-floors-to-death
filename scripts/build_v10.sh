#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۱۰٫۰ — تجمیع بخش‌ها به فایل تک‌فایل نهایی
# ترتیب: HTML + منطق + رندر + کات‌سین + اسپرایت‌های فروشگاه
#         + ماژول‌های ۱۰٫۰ (فصل‌ها/بقا/انتقال‌ها/افتتاحیه/آخرین شب)
#         + UI/حلقه (باید آخر باشد چون init() را صدا می‌زند)
# ============================================================
cd /home/z/my-project
cat scripts/v3_part1.html scripts/v3_part2.js scripts/v3_part3.js \
    scripts/v3_part5.js scripts/cube_sprites.js \
    scripts/v4_chapters.js scripts/v4_survival.js scripts/v4_transitions.js \
    scripts/v4_intro_menu.js scripts/v4_final.js scripts/v3_part4.js \
    > download/three-floors-to-survival.html
echo "built: $(wc -l < download/three-floors-to-survival.html) lines, $(du -h download/three-floors-to-survival.html | cut -f1)"
