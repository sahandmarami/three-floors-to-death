#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۱۵٫۰ — تجمیع بخش‌ها به فایل تک‌فایل نهایی
# تازه‌های ۱۵٫۰ (بازخورد کاربر روی ۱۴):
#   - دکمه‌ی «شب شود» پایین‌راست — دیگر روی برج نمی‌نشیند
#   - پنل دستفروش بالاتر و کنارِ ریل چپ — گوشه‌اش روی دکمه‌ی
#     توقف نمی‌افتد
#   - با برجک‌ها در سیو: با باخت/ادامه، وسایلی که ساخته‌ای
#     از بین نمی‌رود (سیو در شروع هر موج هم گرفته می‌شود)
#   - باخت: «صدای باخت» به‌جای دیالوگ + بدون دکمه‌ی «رد کردن»
#     + صفحه‌ی باخت ساده (تلاش دوباره / منوی اصلی)
#   - سختیِ ~۱۵٪ ملایم‌تر (ضرایب فصل‌ها، جون/آسیب زامبی‌ها،
#     فاصله‌ی تولدها، جایزه‌ها) — برای گوشی
#   - حذف متن «نسخه» از پایین منو
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
