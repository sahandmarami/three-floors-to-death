#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۲۰٫۲ — «درباره» به روایتِ ادبی (درخواست کاربر)
# تازه‌های ۲۰٫۲:
#   - متن «درباره» ادبی و خلاصه شد؛ ۶ سطر کوتاهِ روایی
#   - پایان معلق با سه‌نقطه: «اما قصه‌ی واقعی، از همین‌جا
#     آغاز می‌شود...» برای جذب بازیکن (بدون اسپویل)
#   - خط سازنده (ساخته شده توسط سهند مرامی) در انتها ماند
# ترتیب مثل ۲۰٫۱ (v3_part4 آخر — init دارد)
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
