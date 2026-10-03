#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۲۱٫۱ — اصلاح متن‌های فارسی + رفع به‌هم‌ریختگی
# فروشگاه/دستفروش + برگشت تفنگ سوم به تب سلاح‌ها + منوی جذاب
# تازه‌های ۲۱٫۱:
#   - ادبیات فارسی: «جلیقه‌ی ضدّ گازگزش» (به‌جای ضدّ دندان)،
#     «کلت» یکدست (به‌جای تپانچه)، «فقط امروز اینجام»، «برج سالم است»،
#     «دستفروش مرموز» یکدست (به‌جای فروشنده‌ی مرموز)
#   - تب سلاح‌ها: هر سه تفنگ دیده می‌شوند — فعلی (در دست)، بعدی
#     (قیمت)، بعدتر (قفل با 🔒) — برگشت تفنگ حذف‌شده
#   - پنل دستفروش: ۲۲۸px + چیدمان ستونی (نام/توضیح/قیمت زیر هم،
#     فونت درشت‌تر) — دیگر متن‌ها روی هم نمی‌افتند
#   - تولتیپ فروشگاه: پهن‌تر + جداکننده‌های خوانا
#   - کاشی‌ها: برچسب شلوغِ «سطح» حذف شد
#   - منوی اصلی: قاب شیشه‌ای + نشان نسخه + چیپ‌های آمار (شب/زامبی‌کُش/
#     سکه) + عنوان با لهجه‌ی قرمز «بقا» + پانوشت سازنده + جوّ سینمایی
#     Canvas (نور پنجره‌های برج، مه زمین، تاریکی لبه‌ها) + ۴ زامبی منو
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
