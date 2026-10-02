#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۲۰٫۰ — سختیِ واقعی + فروشنده‌ی مرموزِ تازه + APK-ready
# تازه‌های ۲۰٫۰ (بازخورد کاربر):
#   - بازی طولانی‌تر: موج‌های ۶/۸/۱۰/۱۲ در فصل‌ها (۳۶ شب)
#   - سختیِ متعادل: جون زامبی‌ها ↑، برجک‌ها ↓ + ضریب فصل‌ها ↑ —
#     دیگر برجک‌ها تنها بازی را نمی‌برند
#   - نگهبانِ سخت‌تر: ۷۰۰۰ جون + «زرهِ ضدِّبرجک» ×۰٫۳۳ + یورش/فراخوان/
#     آوارِ سنگین‌تر + فاز دوم در ۶۲٪
#   - فروشنده‌ی مرموز: ۵ چهره‌ی متفاوت + جهتِ تناوبی + کالای تازه در
#     هر بازدید (حمله‌ی هوایی/بمب یخی/آدرنالین) + نقشه‌های ساختِ
#     برجک‌های ویژه: تسلا (آذرخش زنجیره‌ای) • موشک‌انداز (انفجار
#     محدوده‌ای) • شعله‌افکن (آتش‌گیرندگی)
#   - پیشرفت سلاح: خرید تفنگ تازه = تحویلِ قبلی (کلت→شاتگان→مسلسل)
#   - مینی‌گیم‌ها: امتیاز + کمبوی «نزدک بود!» + بوست + نمایش زنده
#   - داخلِ پناهگاه بازطراحی کامل: پرسپکتیو، لوله‌ها، بخاری، تخت
#     دوطبقه، ۵ بازمانده + نور حجمی
#   - پایان: دکمه‌ی «ادامه دارد» → مستقیم منو (بدون صفحه‌ی برد)
#   - موبایل/APK: safe-area + دکمه‌ی بازگشت اندروید + بسته‌ی کپاسیتور
# ترتیب مثل ۱۹٫۰ (v3_part4 آخر — init دارد)
# ============================================================
cd /home/z/my-project
cat scripts/v3_part1.html scripts/v3_part2.js scripts/v3_part3.js \
    scripts/v3_part5.js scripts/cube_sprites.js scripts/voices17_data.js \
    scripts/v4_chapters.js scripts/v4_audio.js scripts/v4_transitions.js \
    scripts/v4_drive.js scripts/v4_ride.js scripts/v4_arshan.js \
    scripts/v4_survival.js scripts/v4_intro_menu.js scripts/v4_final.js \
    scripts/v4_defeat.js scripts/v4_shelter.js scripts/v4_mobile.js \
    scripts/v3_part4.js \
    > download/three-floors-to-survival.html
echo "built: $(wc -l < download/three-floors-to-survival.html) lines, $(du -h download/three-floors-to-survival.html | cut -f1)"
node -e "new Function(require('fs').readFileSync('download/three-floors-to-survival.html','utf8').replace(/^[\s\S]*?<script>/,'').replace(/<\/script>[\s\S]*$/,'')); console.log('full syntax OK')"
