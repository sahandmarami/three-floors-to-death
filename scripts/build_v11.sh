#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۱۱٫۰ — تجمیع بخش‌ها به فایل تک‌فایل نهایی
# ترتیب: HTML + منطق + رندر + کات‌سین + اسپرایت‌ها + صداها
#         + ماژول‌های ۱۰ (فصل/بقا/انتقال/افتتاحیه/آخرین‌شب)
#         + موبایل + UI/حلقه (آخر — چون init() دارد)
# ============================================================
cd /home/z/my-project
cat scripts/v3_part1.html scripts/v3_part2.js scripts/v3_part3.js \
    scripts/v3_part5.js scripts/cube_sprites.js scripts/voices_data.js \
    scripts/v4_chapters.js scripts/v4_audio.js scripts/v4_survival.js \
    scripts/v4_transitions.js scripts/v4_intro_menu.js scripts/v4_final.js \
    scripts/v4_mobile.js scripts/v3_part4.js \
    > download/three-floors-to-survival.html
echo "built: $(wc -l < download/three-floors-to-survival.html) lines, $(du -h download/three-floors-to-survival.html | cut -f1)"
