#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۱۹٫۰ — پایانِ سینمایی + مینی‌گیم‌های سواره‌ی تازه
# تازه‌های ۱۹٫۰ (بازخورد کاربر):
#   - مینی‌گیم فصل ۲→۳: قایق موتوری در کانالِ مه‌گرفته (تم river)
#     و فصل ۳→۴: اسنوموبیل در توفان برفی (تم snow) — هر دو با همان
#     موتور شبه‌سه‌بعدیِ رانندگی (فرمان/گاز/ترمز + آیتم مخفی)
#   - حذف کامل تم‌های مرده‌ی تونل/زیپ‌لاین/دونده (کد تمیز شد)
#   - دودِ متحرک خانه‌های سوخته (فصل ۳) و دودکش‌های انبار (فصل ۲):
#     لایه‌ی زنده با اسپرایت پیش‌پخته — کش BG دست‌نخورده
#   - نگهبانِ سخت‌تر: ۵۴۰۰ جون، زره ×۰٫۳۶/۰٫۴۵، یورشِ برق‌آسا (قطع
#     با ۱۳۰ دمیج متمرکز)، فاز دوم ۵۵٪، آوار/فراخوان بیشتر
#   - کات‌سین پناهگاه (SHEL): پیاده‌روی سحرگاهی → دروازه → داخل +
#     گفتگو با دکتر مریم → آژیر و خبرِ رادیو (قلاب سری دوم) →
#     «این داستان ادامه دارد...» → صفحه‌ی بردِ سینمایی (مدال +
#     پرتوها + کارت آمار + آتش‌بازی + منوی کامل)
#   - کوله‌پشتی پایین‌تر/جمع‌تر + کلاس sui برای صفحه‌های کوچک
#   - ۱۸ صدای تازه + ۶ بازتولید (۶۳ کلیپ) — دکتر مریم با Dilara
# ترتیب مثل ۱۸٫۱ (v3_part4 آخر — init دارد) + v4_ride و v4_shelter
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
