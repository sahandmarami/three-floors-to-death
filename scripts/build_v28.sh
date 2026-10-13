#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۲۸٫۰ — «سه طبقه تا مرگ»
# تازه‌های ۲۸٫۰ (بازخورد کاربر):
#   - رفع صفحه‌ی سفید/سیاه استوری‌موشن (باگ addColorStop در rays27
#     + زره‌بندی try/catch همه‌ی لایه‌های سینمایی)
#   - رفع «رد کردن با دو ضربه» — شنونده‌ی capture گفتگو دیگر
#     ضربه‌ی روی دکمه‌ها را نمی‌بلعد
#   - سلاح‌ها: مالکیت دائمی — برگشت به کلت همیشه ممکن + چیپ‌های
#     تعویض سریع کنار HUD + پادبان شلیک (هرگز قفل نمی‌شود)
#   - منوی ساخت‌وساز: باتن‌شیت اندرویدی از پایین + FAB شناور
#   - HUD: چیپ‌های پیل متریال (قلب تپنده/نوار جان گرد/مرحله بنفش)
#   - منوی توقف: ادامه + ذخیره و خروج + ردیف کوچک تنظیمات/درباره
#     («شروع دوباره» حذف شد — درخواست کاربر)
#   - صفحه‌ی باخت: کارت متریال m28 با آمار و جمجمه‌ی درخشان
#   - کوله‌پشتی: پایین-چپ جمع + حذف متن «کوله خالی» از وسط صفحه
#   - ۲۲ خط صدا با لحن موقعیت‌دار (فوریت/لرزش/ترس — نه هیجان شاد)
#     با کلید جدید ElevenLabs کاربر
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
    scripts/v4_ui27.js scripts/v4_ui28.js \
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
