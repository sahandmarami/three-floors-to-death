#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۱۷٫۰ — تجمیع بخش‌ها به فایل تک‌فایل نهایی
# تازه‌های ۱۷٫۰ (بازخورد کاربر):
#   - مینی‌گیم رانندگی شبه‌سه‌بعدی (فصل ۱→۲): جاده‌ی پرسپکتیو،
#     موانع/زامبی‌های روبه‌رو، فرمان/گاز/ترمز، آیتم مخفیِ کنار
#     جاده، ارشان روی صندلی کمکی (v4_drive.js)
#   - ارشان روی لبه‌ی طبقه‌ی دوم برج در گیم‌پلی دفاعی:
#     دیده‌بانی/مهمات‌رسانی + ۶ بارک صوتی وسط موج (v4_arshan.js)
#   - دیالوگ‌های افتتاحیه محاوره‌ای + صداهای بازسازی (voices17)
#   - خط راویِ منطقِ رسیدن ارشان با ماشین در کات‌سین فروریختن
#   - لایه‌ی عمق پرسپکتیو برای تونل و زیپ‌لاین
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
