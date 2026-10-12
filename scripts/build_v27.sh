#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۲۷٫۰ — «سه طبقه تا مرگ»
# تازه‌های ۲۷٫۰ (بازخورد کاربر):
#   - صداهای فارسی ElevenLabs v4+fa (۱۱۸ خط، ۷ صدا، ممیزی Scribe)
#   - سکه‌ی «واقعی» (تصویر دانلودشده شفاف) در HUD/قیمت‌ها/دستفروش/سکه‌های پرنده
#   - منوهای توقف/تنظیمات/درباره بازسازی کامل اندرویدی متریال (m27)
#     + حذف «کد سیو/بارگذاری» از تنظیمات + حذف نسخه از منو
#   - نگهبان صدا — رفع «صدا خود به خود قطع می‌شود» (سامسونگ/اندروید)
#   - «شب شود» → دکمه‌ی شناور مستقل پایین-راست با نوشته و آیکن
#   - کوله‌پشتی → نوار افقی وسط-پایین نیمه‌شفاف
#   - پیل دستفروش → شیار ۴ (رفع تصادم با چراغ‌قوه)
#   - چراغ‌قوه → آیکن افقی جدید + برچسب متنی
#   - کلت مستقل (رفع «دو کلنگ») + نشان «در دست» بدون تصادم
#   - چیدن برجک: snap شبکه + پد زمین + حلقه‌ی آرام
#   - دستفروش بعد از گفتگوی استوری صبح می‌آید + صف گفتگو (DLG queue)
#   - استوری‌موشن: ساختمان = برج بازی (۱۳۶/۱۲۴/۱۱۲) + لایه‌های
#     سینمایی (خاکستر/دود آتش/پرتو/غبار)
# ============================================================
cd /home/z/my-project
cat scripts/v3_part1.html scripts/v3_part2.js \
    scripts/v3_part3.js scripts/v3_part5.js scripts/cube_sprites.js \
    scripts/voices27_data.js \
    scripts/v4_icons26.js \
    scripts/v4_chapters.js scripts/v4_audio.js scripts/v4_story22.js \
    scripts/v4_transitions.js \
    scripts/v4_drive.js scripts/v4_ride.js scripts/v4_arshan.js \
    scripts/v4_survival.js \
    scripts/v4_menu23.js scripts/v4_cine23.js scripts/v4_depth23.js scripts/v4_mystery23.js \
    scripts/v4_intro_menu.js scripts/v4_final.js \
    scripts/v4_defeat.js scripts/v4_shelter.js scripts/v4_mobile.js \
    scripts/v4_ui27.js \
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
