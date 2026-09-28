#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۱۲٫۰ — تجمیع بخش‌ها به فایل تک‌فایل نهایی
# تازه‌های ۱۲٫۰:
#   - گفتگو با صدای طبیعی فارسی (Web Speech) + بلیپ شخصیت‌ها
#     → voices_data.js حذف شد (فایل ~۷۰۰KB سبک‌تر)
#   - پنل ساخت‌وساز تب‌دار، حذف نوار سلاح پایین
#   - سینماییِ سقوط برج هنگام باخت + «ادامه از آخرین روز»
#   - موسیقی: کراس‌فید نرم + رفع انباشت نُت + سکوت در توقف
# ترتیب: HTML + منطق + رندر + کات‌سین + اسپرایت‌ها + فصل‌ها
#         + صدا/گفتگو + بقا + انتقال‌ها + افتتاحیه + آخرین‌شب
#         + سینماییِ باخت + موبایل + UI/حلقه (آخر — چون init() دارد)
# ============================================================
cd /home/z/my-project
cat scripts/v3_part1.html scripts/v3_part2.js scripts/v3_part3.js \
    scripts/v3_part5.js scripts/cube_sprites.js \
    scripts/v4_chapters.js scripts/v4_audio.js scripts/v4_survival.js \
    scripts/v4_transitions.js scripts/v4_intro_menu.js scripts/v4_final.js \
    scripts/v4_defeat.js scripts/v4_mobile.js scripts/v3_part4.js \
    > download/three-floors-to-survival.html
echo "built: $(wc -l < download/three-floors-to-survival.html) lines, $(du -h download/three-floors-to-survival.html | cut -f1)"
