#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۲۳٫۰ — «سه طبقه تا مرگ»
# تازه‌های ۲۳٫۰:
#   - منوی اصلی جدید از صفر (صحنه‌ی Canvas سینمایی + دکمه‌های بزرگ)
#   - کات‌سین‌های موشن‌گرافیکی + اصلاح داستانی «پیدا کردن ساختمان موجود»
#   - ۱۱۹ کلیپ صدای ElevenLabs v3 با ۷ صدای متمایز شخصیت‌ها
#   - موسیقی: شروع خودکار (اندروید autoplay)
#   - عمق بصری ۲.۵بعدی: نور ماه/مه/AO/باران + گریدینگ
#   - لایه‌ی معما: بی‌سیم/کد درب/فیوز + آرشیو سرنخ
#   - مکانیزم‌های TLOU: حالت شنود، جست‌وجو، کوکتل مولوتوف
# ============================================================
cd /home/z/my-project
cat scripts/v3_part1.html scripts/v3_part2.js \
    scripts/v3_part3.js scripts/v3_part5.js scripts/cube_sprites.js \
    scripts/voices23_data.js \
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
