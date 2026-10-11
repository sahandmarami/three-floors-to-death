#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۲۱٫۴ — «سه طبقه تا مرگ»
# تازه‌های ۲۱٫۴:
#   - W واکنش‌گرا: اگر وب‌ویو/مرورگر در لحظه‌ی بارگذاری ابعادِ گذرایی
#     داده باشد، در منو بازسازی می‌شود (رفعِ ریشه‌ای نوار سیاه/ریزی)
#   - بازطراحی منوی اصلی (درخواست کاربر: «خیلی بد ریخته») — تیتر
#     آرام بدون پالس/شاین، دکمه‌های هم‌عرض، فاصله‌گذاری یکنواخت
#   - HUD: چیپ‌ها دیگر له/بریده نمی‌شوند (flex:none)
#   - «رد کردن» کات‌سین: bottom 16px (فضای تنفس)
#   - (در ادامه‌ی همین نسخه) صداهای الون‌لبز v3 جایگزین می‌شود
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
