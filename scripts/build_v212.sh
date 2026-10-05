#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۲۱٫۲ — ارتقای گرافیک شخصیت‌ها + رفع ایستادن
# تازه‌های ۲۱٫۲:
#   - شخصیت‌ها با کیفیت بالا: بازیکن (بام + پناهگاه)، ارشان
#     (بام + پایان)، دکتر مریم، ۴ بازمانده‌ی پناهگاه — گرادیان،
#     سایه‌روشن، لبه‌ی تیره، جزئیات لباس (کوله/زیپ/سگک/کلاه)
#   - رفع باگ: بازیکن داخل پناهگاه دیگر «ایستاده راه نمی‌رود» —
#     پارامتر idle با نفس‌کشیدن آرام
#   - فضای پناهگاه منطقی‌تر: بخاری کنج دیوار، گلدان روی قفسه،
#     ایستگاه پزشکی چسبیده به دیوار، نگهبان کنار در، قالیچه‌ی
#     گفتگو، بازیکن وسط جمعیت
#   - متن دمیج روی بدن باس رفع شد — بالای سرش می‌نشیند؛ نوار جونِ
#     کوچک باس حذف شد (نوار بزرگ صفحه هست)
#   - دستفروش: ۵ پرتره‌ی کاملاً متفاوت (پنل + گفتگو)، لباس‌های
#     حاشیه‌دار فاخر، خطِ آغازِ متفاوت، صدای متفاوت در هر بازدید
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
