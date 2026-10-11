#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۲۲٫۰ — «سه طبقه تا مرگ»
# تازه‌های ۲۲٫۰:
#   - داستان رسمی کامل: دیالوگ‌های جدید در تمام ۳۶ موج + ۴ فصل
#   - ۱۷۰ کلیپ صدای گفتار با ۷ صدای متمایز شخصیت‌ها (edge-tts)
#   - کات‌سین «رسیدن به پناهگاه» در شروع فصل ۴ (دکتر مریم)
#   - پایان سینمایی جدید: هشدار بی‌سیم + دوربین دور + «ادامه دارد»
#   - منوی بازطراحی‌شده + دکمه‌های مرئی (رفع باگ‌های گوشی واقعی)
#   - کش LRU صدا (رم کم) + گرمایش فقط افتتاحیه
# ============================================================
cd /home/z/my-project
cat scripts/v3_part1.html scripts/v3_part2.js \
    scripts/v3_part3.js scripts/v3_part5.js scripts/cube_sprites.js \
    scripts/voices22_data.js \
    scripts/v4_chapters.js scripts/v4_audio.js scripts/v4_story22.js \
    scripts/v4_transitions.js \
    scripts/v4_drive.js scripts/v4_ride.js scripts/v4_arshan.js \
    scripts/v4_survival.js scripts/v4_intro_menu.js scripts/v4_final.js \
    scripts/v4_defeat.js scripts/v4_shelter.js scripts/v4_mobile.js \
    scripts/v3_part4.js \
    > download/three-floors-to-survival.html
echo "built: $(wc -l < download/three-floors-to-survival.html) lines, $(du -h download/three-floors-to-survival.html | cut -f1)"
node -e "new Function(require('fs').readFileSync('download/three-floors-to-survival.html','utf8').replace(/^[\s\S]*?<script>/,'').replace(/<\/script>[\s\S]*$/,'')); console.log('full syntax OK')"
# استقرار: پیش‌نمایش زنده + APK
cp download/three-floors-to-survival.html webserve/three-floors-to-survival.html
cp download/three-floors-to-survival.html webserve/index.html
cp download/three-floors-to-survival.html download/apk/www/index.html
echo "deployed: webserve/ + apk/www/"
