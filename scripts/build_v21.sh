#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۲۱٫۰ — برگشت زامبی‌ها به گرافیک برداری + ارتقای کیفیت
# تازه‌های ۲۱٫۰:
#   - حذف spr_z_data.js از ساخت ← ZIMG غیرفعال؛ زامبی‌ها مثل قبل
#     برداری رسم می‌شوند (درخواست کاربر: تصاویر افتضاح بود)
#   - drawZombieBody کاملاً بازطراحی: آناتومی مفصلی (زانو/آرنج/
#     چنگک/فک/گوش)، سایه‌روشن چندلایه، لبه‌ی تیره، پیراهن پاره با
#     دنده، شنل باس، کلاه‌خود پرچ‌دار تانک، مو‌کاک سریع
#   - جعبه‌ی پخت گشاده‌تر (X0:-26, X1:22) + قاب‌های بیشتر (WF:14, AF:8)
# ============================================================
cd /home/z/my-project
cat scripts/v3_part1.html scripts/v3_part2.js \
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
