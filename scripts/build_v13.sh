#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۱۳٫۰ — تجمیع بخش‌ها به فایل تک‌فایل نهایی
# تازه‌های ۱۳٫۰:
#   - ۳۳ کلیپ صدای نورال فارسی (edge-tts) داخل خود فایل
#     → voices13_data.js (۹۴۲KB پایه۶۴) — گفتگوها روی هر گوشی پخش می‌شوند
#   - ریل کنترل گوشه‌ی چپ (توقف/صدا/چراغ) + حذف چیپ سلاح از HUD
#   - نوار ارتقای درخشان زیر کاشی‌های پنل ساخت‌وساز
#   - منوی بازطراحی‌شده‌ی تمیز (سکریم تیره‌تر + دکمه‌های فشرده)
#   - سیو اطمینانی: لایه‌ی STORE + خودکار دوره‌ای + toast «ذخیره شد»
#     + کد سیو قابل انتقال (خروجی/ورودی) + pagehide
# ترتیب: HTML + منطق + رندر + کات‌سین + اسپرایت‌ها + صداهای نورال
#         + صدا/گفتگو + فصل‌ها + بقا + انتقال‌ها + افتتاحیه
#         + آخرین‌شب + سینماییِ باخت + موبایل + UI/حلقه (آخر — چون init() دارد)
# ============================================================
cd /home/z/my-project
cat scripts/v3_part1.html scripts/v3_part2.js scripts/v3_part3.js \
    scripts/v3_part5.js scripts/cube_sprites.js scripts/voices13_data.js \
    scripts/v4_chapters.js scripts/v4_audio.js scripts/v4_survival.js \
    scripts/v4_transitions.js scripts/v4_intro_menu.js scripts/v4_final.js \
    scripts/v4_defeat.js scripts/v4_mobile.js scripts/v3_part4.js \
    > download/three-floors-to-survival.html
echo "built: $(wc -l < download/three-floors-to-survival.html) lines, $(du -h download/three-floors-to-survival.html | cut -f1)"
