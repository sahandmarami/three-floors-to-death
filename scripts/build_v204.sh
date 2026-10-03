#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۲۰٫۴ — اسپرایت‌های تصویری واقعی زامبی‌ها
# تازه‌های ۲۰٫۴:
#   - ۴ اسپرایت تصویری (معمولی/سریع/تانک/باس نگهبان) جایگزین
#     بدنه‌های برداری ساده — ارسال کاربر، برش/آینه/بهینه با
#     gen_spr202.py → spr_z_data.js (۳۹۹KB base64)
#   - ZIMG + ZSPR.bakeImg: پخت قاب‌های متحرک از تصویر
#     (تاب گام/فرود دوگام، لونج کوبشی حمله، تینت قرمز فلاش)
#     با رزولوشن وابسته به مقیاس نوع (boss در ~۳۵۶px)
#   - زامبی‌ها درشت‌تر: نمایش ۸۴/۷۶/۱۰۶/۱۷۸px (توصیه‌ی تحلیل)
#   - سازگاری: fallback برداری اگر تصویر لود نشود؛ چشم‌های
#     تاریکی (فصل ۲+) و هاله/زره‌ترکیده‌ی باس به مقیاس تازه
# ترتیب: spr_z_data.js بعد از v3_part2.js (قبل از v3_part3.js)
# ============================================================
cd /home/z/my-project
cat scripts/v3_part1.html scripts/v3_part2.js scripts/spr_z_data.js \
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
