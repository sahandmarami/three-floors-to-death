#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۲۶٫۰ — «سه طبقه تا مرگ»
# تازه‌های ۲۶٫۰ (بازخورد کاربر):
#   - سیستم آیکن SVG متریال برای همه‌ی دکمه‌ها (به‌جز منو) —
#     متمایز و یک‌شکل روی همه‌ی اندرویدها (سامسونگ/اندروید خام)
#   - جابه‌جایی شنود/چراغ‌قوه/مولوتوف/سرنخ به ستون لبه‌ی چپ —
#     بیرون از مسیر حمله‌ی زامبی‌ها (دید بازیکن آزاد شد)
#   - کادر خرید دستفروش → دیالوگ مرکزی اندرویدی + دکمه‌ی X +
#     پیل بازگشایی — دیگر روی هیچ دکمه‌ای نمی‌نشیند
#   - استوری‌موشن: ساختمانِ هماهنگ با برج داخل بازی (طبقات
#     مخروطی سنگ/آجر/آبی + کنگره + پرچم + بنر)، زامبی‌های
#     پس‌زمینه‌ی بازطراحی‌شده، شهر با پنجره‌های شبکه‌ای،
#     زمین‌های غنی‌تر (ترک آسفالت/لکه‌آب/آوار/تخته و جعبه‌ابزار)
#   - ناحیه‌ی امن سامسونگ/One UI (دوربینِ حفره‌دار) در fitWrap
#   - تب‌های ساخت‌وساز و «شب شود» با آیکن SVG + بدون شماره موج
# ============================================================
cd /home/z/my-project
cat scripts/v3_part1.html scripts/v3_part2.js \
    scripts/v3_part3.js scripts/v3_part5.js scripts/cube_sprites.js \
    scripts/voices24_data.js \
    scripts/v4_icons26.js \
    scripts/v4_chapters.js scripts/v4_audio.js scripts/v4_story22.js \
    scripts/v4_transitions.js \
    scripts/v4_drive.js scripts/v4_ride.js scripts/v4_arshan.js \
    scripts/v4_survival.js \
    scripts/v4_menu23.js scripts/v4_cine23.js scripts/v4_depth23.js scripts/v4_mystery23.js \
    scripts/v4_intro_menu.js scripts/v4_final.js \
    scripts/v4_defeat.js scripts/v4_shelter.js scripts/v4_mobile.js \
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
