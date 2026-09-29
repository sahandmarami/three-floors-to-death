#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۱۴٫۰ — تجمیع بخش‌ها به فایل تک‌فایل نهایی
# تازه‌های ۱۴٫۰ (بازخورد کاربر):
#   - دکمه‌ی «شب شود» پایین‌وسط + کلاس dlg-on → هیچ متنی روی
#     متن نمی‌افتد (صفحه‌ی سیو/روز در گوشی)
#   - دستفروش مرموز استوری‌مود: از چپ می‌آید، پایین برج با تو
#     حرف می‌زند (صدا+متن)، می‌فروشد و غروب می‌رود
#   - تب «بقا» آیکون واقعی دارد (آیکون‌های Canvas وسایل)
#   - صدای گفتار: پیش‌بارگیری همه‌ی کلیپ‌ها + شروع هم‌زمانِ
#     متن و صدا (clipwait + poll) — دیگر صحبتی بی‌صدا نمی‌ماند
#   - افتتاحیه بازنویسی ادبی + داستان صوتی دستفروش (voices14)
#   - منو/صفحه‌ها بدون متن‌های اضافه + پس‌زمینه‌ی آرام‌تر
#   - fitWrap: کل بازی همیشه بی‌برش در صفحه (گوشی/درون‌اپ)
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
