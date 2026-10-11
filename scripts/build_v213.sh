#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۲۱٫۳ — «سه طبقه تا مرگ»
# تازه‌های ۲۱٫۳:
#   - تمام‌صفحه‌ی واقعی روی اندروید/گوشی: دنیای بازی از نسبت
#     صفحه عرض می‌گیرد (۹۶۰ تا ۱۴۴۰) و قاب با transform دقیقاً
#     تا لبه‌ها کشیده می‌شود — نوار سیاه/کوچک‌شدن صفحه رفع شد
#   - متن‌ها و منوها یک‌نواخت با صحنه بزرگ می‌شوند (له نمی‌شوند)
#   - DPR سقف ۲ → نمایش شارپ (رفع «کم‌رنگ/مات» به‌نظر رسیدن)
#   - تپه/ابر/برکه/چراغ نسبت به عرض دنیا (متقارن روی عریض‌ها)
#   - تغییر نام بازی: «سه طبقه تا مرگ» (title/منو/اسپلش/درباره)
#   - تولتیپ‌ها با مقیاس transform هم‌راستا شدند
# ============================================================
cd /home/z/my-project
cat scripts/v3_part1.html scripts/v3_part2.js \
    scripts/v3_part3.js scripts/v3_part5.js scripts/cube_sprites.js \
    scripts/voices17_data.js \
    scripts/v4_chapters.js scripts/v4_audio.js scripts/v4_transitions.js \
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
