#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۲۹٫۰ — «سه طبقه تا مرگ»
# تازه‌های ۲۹٫۰ (بازخورد کاربر):
#   - منوی ساخت‌وساز دیگر خودکار روی صفحه نمی‌افتد (شروع جمع +
#     فقط با FAB) + اسکریم لمس-برای-بستن + کاشی‌های فشرده ۷۶px
#   - آیکون‌های کلت/شاتگان/مسلسل: SVG خطی متریال تمیز در چیپ‌ها
#     و کاشی‌ها + قفل گوشه‌ای SVG + طلایی ملایم
#   - آیکون چراغ‌قوه: مشعل عمودی تمیز با پرتوها
#   - منوی توقف: فقط «ادامه» + «ذخیره و خروج» (ردیف کوچک حذف)
# ============================================================
cd /home/z/my-project
cat scripts/v3_part1.html scripts/v3_part2.js \
    scripts/v3_part3.js scripts/v3_part5.js scripts/cube_sprites.js \
    scripts/voices28_data.js \
    scripts/v4_icons26.js \
    scripts/v4_chapters.js scripts/v4_audio.js scripts/v4_story22.js \
    scripts/v4_transitions.js \
    scripts/v4_drive.js scripts/v4_ride.js scripts/v4_arshan.js \
    scripts/v4_survival.js \
    scripts/v4_menu23.js scripts/v4_cine23.js scripts/v4_depth23.js scripts/v4_mystery23.js \
    scripts/v4_intro_menu.js scripts/v4_final.js \
    scripts/v4_defeat.js scripts/v4_shelter.js scripts/v4_mobile.js \
    scripts/v4_ui27.js scripts/v4_ui28.js scripts/v4_ui29.js \
    scripts/v3_part4.js \
    > download/three-floors-to-survival.html
echo "built: $(wc -l < download/three-floors-to-survival.html) lines, $(du -h download/three-floors-to-survival.html | cut -f1)"
node -e "new Function(require('fs').readFileSync('download/three-floors-to-survival.html','utf8').replace(/^[\s\S]*?<script>/,'').replace(/<\/script>[\s\S]*$/,'')); console.log('full syntax OK')"
# استقرار: پیش‌نمایش زنده + APK
mkdir -p webserve
cp download/three-floors-to-survival.html webserve/three-floors-to-survival.html
cp download/three-floors-to-survival.html webserve/index.html
mkdir -p download/apk/www
cp download/three-floors-to-survival.html download/apk/www/index.html
echo "deployed: webserve/ + apk/www/"
