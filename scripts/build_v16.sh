#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۱۶٫۰ — تجمیع بخش‌ها به فایل تک‌فایل نهایی
# تازه‌های ۱۶٫۰ (بازخورد کاربر روی ۱۵):
#   - «شب شود» دیگر دکمه‌ی شناورِ گوشه‌ی راست نیست — دکمه‌ی
#     طلاییِ خودِ پنل ساخت‌وساز شد (زیر سربرگ؛ باز و جمع)
#   - جاخاله‌های کوله‌پشتی خوشگل‌تر: قاب/هاله‌ی رنگیِ هر وسیله،
#     حذف جعبه‌درون‌جعبه، کی‌چیپ لطیف، «+» وسط جاخالی خالی
#   - تاریکی از فصل ۲ لکه‌ای و متغیر: پایه‌ی ملایم + ۵ ابرِ
#     شناورِ تیره — بعضی جاها کمی، بعضی خیلی، بعضی روشن
# ترتیب: HTML + منطق + رندر + کات‌سین + اسپرایت‌ها + صداهای نورال
#         + صدا/گفتگو + فصل‌ها + بقا + انتقال‌ها + افتتاحیه
#         + آخرین‌شب + سینماییِ باخت + موبایل + UI/حلقه (آخر — چون init() دارد)
# ============================================================
cd /home/z/my-project
cat scripts/v3_part1.html scripts/v3_part2.js scripts/v3_part3.js \
    scripts/v3_part5.js scripts/cube_sprites.js scripts/voices14_data.js \
    scripts/v4_chapters.js scripts/v4_audio.js scripts/v4_survival.js \
    scripts/v4_transitions.js scripts/v4_intro_menu.js scripts/v4_final.js \
    scripts/v4_defeat.js scripts/v4_mobile.js scripts/v3_part4.js \
    > download/three-floors-to-survival.html
echo "built: $(wc -l < download/three-floors-to-survival.html) lines, $(du -h download/three-floors-to-survival.html | cut -f1)"
