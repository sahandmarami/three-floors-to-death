#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۱۸٫۰ — تجمیع بخش‌ها به فایل تک‌فایل نهایی
# تازه‌های ۱۸٫۰ (بازخورد کاربر):
#   - روان‌سازی: حذف همه‌ی backdrop-filter های روی بوم (لگ/هنگ گوشی)
#     + اسپرایت پیش‌پخته برای هاله‌ی فانوس ارشان و چراغ‌های ماشین/جاده
#   - ارشان روی بام برج پشت کنگره‌ها (جای منطقی دیده‌بان) + پایین‌رفتن
#     با طناب وقتی برج ترک می‌خورد (هم‌زمان با بارک aw5)
#   - راننده = بازیکن سمت چپ (ایران)، ارشان صندلی کمکی راست + پلاک ۲۸
#   - موج‌های فصل‌به‌فصل بیشتر: ۴/۶/۸/۱۰ = ۲۸ شب (سختی انتهای فصل‌ها
#     مثل قبل با wvEff) + سازگاری سیوهای ۳۳موجی
#   - t1n1 و aw5 با متن منطقی‌تر بازتولید شدند (voices17_data وصله شد)
# ترتیب: HTML + منطق + رندر + کات‌سین + اسپرایت‌ها + صداهای نورال
#         + صدا/گفتگو + انتقال‌ها + رانندگی + ارشان + بقا
#         + افتتاحیه + آخرین‌شب + باخت + موبایل + UI/حلقه (آخر — init دارد)
# ============================================================
cd /home/z/my-project
cat scripts/v3_part1.html scripts/v3_part2.js scripts/v3_part3.js \
    scripts/v3_part5.js scripts/cube_sprites.js scripts/voices17_data.js \
    scripts/v4_chapters.js scripts/v4_audio.js scripts/v4_transitions.js \
    scripts/v4_drive.js scripts/v4_arshan.js scripts/v4_survival.js \
    scripts/v4_intro_menu.js scripts/v4_final.js scripts/v4_defeat.js \
    scripts/v4_mobile.js scripts/v3_part4.js \
    > download/three-floors-to-survival.html
echo "built: $(wc -l < download/three-floors-to-survival.html) lines, $(du -h download/three-floors-to-survival.html | cut -f1)"
