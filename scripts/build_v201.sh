#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۲۰٫۱ — منوی تمیزتر (درخواست کاربر)
# تازه‌های ۲۰٫۱:
#   - «راهنما» کاملاً حذف شد: دکمه‌ی منو + صفحه‌ی راهنما +
#     سیم‌کشی JS (listener/hideOverlays/Escape/Back اندروید)
#   - «درباره» فقط داستان بازی را می‌گوید — بدون جزئیات
#     گیم‌پلی و بدون متن فنی
#   - پایان «درباره»: «ساخته شده توسط سهند مرامی»
# ترتیب مثل ۲۰٫۰ (v3_part4 آخر — init دارد)
# ============================================================
cd /home/z/my-project
cat scripts/v3_part1.html scripts/v3_part2.js scripts/v3_part3.js \
    scripts/v3_part5.js scripts/cube_sprites.js scripts/voices17_data.js \
    scripts/v4_chapters.js scripts/v4_audio.js scripts/v4_transitions.js \
    scripts/v4_drive.js scripts/v4_ride.js scripts/v4_arshan.js \
    scripts/v4_survival.js scripts/v4_intro_menu.js scripts/v4_final.js \
    scripts/v4_defeat.js scripts/v4_shelter.js scripts/v4_mobile.js \
    scripts/v3_part4.js \
    > download/three-floors-to-survival.html
echo "built: $(wc -l < download/three-floors-to-survival.html) lines, $(du -h download/three-floors-to-survival.html | cut -f1)"
node -e "new Function(require('fs').readFileSync('download/three-floors-to-survival.html','utf8').replace(/^[\s\S]*?<script>/,'').replace(/<\/script>[\s\S]*$/,'')); console.log('full syntax OK')"
