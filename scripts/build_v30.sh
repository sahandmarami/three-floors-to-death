#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۳۰٫۰ — «سه طبقه تا مرگ»
# تازه‌های ۳۰٫۰ (بازخورد کاربر + اسکرین‌شات‌های باگ):
#   - اختصاص متقابل: شیت ساخت‌وساز ⟷ پنل دستفروش (رفع «همش با هم افتاده»)
#   - go-mode: صفحه‌ی باخت/برد بدون هیچ UI شناور (کوله روی دکمه‌ها نمی‌افتد)
#   - textZoom=100 در APK + text-size-adjust — فونت سیستم متن‌ها را نمی‌پراند
#   - کوله‌پشتی کشویی: قرص کوچک + ردیف باریک با لمس (نه نصف صفحه) + آیکون تازه
#   - دستفروش: پنل پهن‌تر + ردیف‌های جادار؛ پیل بازگشایی بالاتر (top:284)
#   - دکمه‌های منو: SVG تمیز (شمشیر/پلی/چرخ‌دنده/اطلاعات) به‌جای گلیف‌ها
#   - متن «درباره» و زیرعنوان منو: روایتِ رویدادهای داستان (نه تعداد مرحله)
#   - صداهای aw1/aw4 (باقی‌مانده) با کلید جدید ElevenLabs — لحن فوری
# ============================================================
cd /home/z/my-project
VOICES=scripts/voices28_data.js
[ -f scripts/voices30_data.js ] && VOICES=scripts/voices30_data.js
cat scripts/v3_part1.html scripts/v3_part2.js \
    scripts/v3_part3.js scripts/v3_part5.js scripts/cube_sprites.js \
    $VOICES \
    scripts/v4_icons26.js \
    scripts/v4_chapters.js scripts/v4_audio.js scripts/v4_story22.js \
    scripts/v4_transitions.js \
    scripts/v4_drive.js scripts/v4_ride.js scripts/v4_arshan.js \
    scripts/v4_survival.js \
    scripts/v4_menu23.js scripts/v4_cine23.js scripts/v4_depth23.js scripts/v4_mystery23.js \
    scripts/v4_intro_menu.js scripts/v4_final.js \
    scripts/v4_defeat.js scripts/v4_shelter.js scripts/v4_mobile.js \
    scripts/v4_ui27.js scripts/v4_ui28.js scripts/v4_ui29.js scripts/v4_ui30.js \
    scripts/v3_part4.js \
    > download/three-floors-to-survival.html
echo "built: $(wc -l < download/three-floors-to-survival.html) lines, $(du -h download/three-floors-to-survival.html | cut -f1) (voices: $(basename $VOICES))"
node -e "new Function(require('fs').readFileSync('download/three-floors-to-survival.html','utf8').replace(/^[\s\S]*?<script>/,'').replace(/<\/script>[\s\S]*$/,'')); console.log('full syntax OK')"
# استقرار: پیش‌نمایش زنده + APK
mkdir -p webserve
cp download/three-floors-to-survival.html webserve/three-floors-to-survival.html
cp download/three-floors-to-survival.html webserve/index.html
mkdir -p download/apk/www
cp download/three-floors-to-survival.html download/apk/www/index.html
echo "deployed: webserve/ + apk/www/"
