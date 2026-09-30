#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۱۸٫۱ — روان‌سازی ریشه‌ای برای گوشی‌های ضعیف
# تازه‌های ۱۸٫۱ (پاسخ به «بازم هنگه» پس از ۱۸٫۰):
#   - کش ۴ لایه‌ی پس‌زمینه (آسمان/افق/تپه-زمین/جزئیات زمین): پخت یک‌بار
#     + blit هر فریم؛ پختِ دوباره فقط با تغییر کلید (۲۰ گام روزشدگی/
#     فصل/پوسته) و نرم‌شده (حداکثر یک لایه در هر فریم)
#   - اسپرایت‌های زامبی (معمولی/سریع/تانک × فلاش × ۱۰ قاب گام + ۶ قاب
#     حمله) — یک drawImage به‌جای ~۳۵ عملیات + گرادیانِ هر فریم
#   - پخت پوسته‌ی برج (طبقات/در/بنر/ترک‌ها) + پنجره/نور در/پرچم زنده
#   - روکش‌های تمام‌صفحه (وینیت گریدینگ/خون/یخ) با ¼ رزولوشن پخته
#   - ابرها: اسپرایت پخته + دریفت
#   - فرماندار کیفیت ۳ پله‌ای: سنجش در همه‌ی حالت‌ها (PERF.tick از حلقه‌ی
#     اصلی) → DPR→1 + حذف افکت‌های زینتی + نصف لکه‌ها؛ بازیابی خودکار
#   - استخر موجودیت‌های رندر (بدون آبجکت جدید هر فریم)
# ترتیب فایل‌ها مثل ۱۸٫۰ (v3_part4 آخر — init دارد)
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
