#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۳۰٫۱ — «سه طبقه تا مرگ» (ادغام دو خط v30)
# تازه‌های ۳۰٫۰ (بازخورد کاربر):
#   - حذف کامل شیت ساخت‌وساز از پایین → داک افقی بالا-راست که
#     وسط نبرد هم باز می‌ماند (روی نوار آسمان، نه زمین بازی)
#   - آیکون‌های برش‌خورده از شیت کاربر: کلت/شاتگان/مسلسل +
#     جعبه (دکمه ساخت‌وساز) + کوله‌پشتی + چراغ‌قوه + کاشی‌ها/دستفروش
#   - رفع به‌هم‌ریختگی منوی دستفروش (کارت‌های بریده: #pdStock
#     بدون min-height → از الان flex+scroll درست)
#   - متن «درباره» = تیزر کوتاه جذاب با «...»
#   - متن افتتاحیه/انتقال‌ها/پناهگاه/پایانی عیناً از اسکریپت کاربر
#   - لحن جدی آرشان (grim) + بازضبط ۸ خط هیجان‌دار قدیمی
#   - «شب شود» طلایی شناور پایین-راست (حذف FAB آبی)
# ============================================================
cd /home/z/my-project
cat scripts/v3_part1.html scripts/v3_part2.js \
    scripts/v3_part3.js scripts/v3_part5.js scripts/cube_sprites.js \
    scripts/voices30_data.js \
    scripts/v4_icons26.js \
    scripts/v4_chapters.js scripts/v4_audio.js scripts/v4_story22.js \
    scripts/v4_transitions.js \
    scripts/v4_drive.js scripts/v4_ride.js scripts/v4_arshan.js \
    scripts/v4_survival.js \
    scripts/v4_menu23.js scripts/v4_cine23.js scripts/v4_depth23.js scripts/v4_mystery23.js \
    scripts/v4_intro_menu.js scripts/v4_final.js \
    scripts/v4_defeat.js scripts/v4_shelter.js scripts/v4_mobile.js \
    scripts/v4_ui27.js scripts/v4_ui28.js scripts/v4_ui29.js scripts/v4_ui30.js scripts/v4_ui30m.js \
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
