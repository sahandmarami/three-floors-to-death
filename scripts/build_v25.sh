#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۲۵٫۰ — «سه طبقه تا مرگ»
# تازه‌های ۲۵٫۰ (بازخورد کاربر):
#   - فونت فارسی «وزیرمتن» تعبیه‌شده (۳۳۱KB base64) — ریشه‌ی
#     «عربی‌نمایی» متن‌ها: fallback به Noto Naskh Arabic در اندروید
#   - همه‌ی متن‌های Canvas هم Vazirmatn (با پیش‌بارگذاری)
#   - حذف اسم سازنده از منوی اصلی (فقط در «درباره» می‌ماند)
#   - جعبه‌ی تأیید اندرویدی متریال (بازی جدید/پاک‌کردن سیو)
#   - استوری‌موشن درشت‌تر: گفتگو 17.5×uiz، پرتره 104×uiz،
#     تیتر کات‌سین 34×uiz، زیرعنوان 16×uiz
#   - نمایش پیشرفت فقط «مرحله X» — بدون فصل/موج/کل
#   - حذف کامل دکمه‌ی تمام‌صفحه
#   - حذف کشیده‌نویسی عربی (آخـریـن شـب → آخرین شب)
#   - پنل‌های اورلی با تایپوگرافی مقیاس‌پذیر اندروید
#   - صداها: edge-tts فارسی بومی می‌مانند (ممیزی ElevenLabs v3:
#     تلفظ فارسی غیرقابل‌اعتماد — مستند در worklog)
# ============================================================
cd /home/z/my-project
cat scripts/v3_part1.html scripts/v3_part2.js \
    scripts/v3_part3.js scripts/v3_part5.js scripts/cube_sprites.js \
    scripts/voices24_data.js \
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
