#!/bin/bash
# ============================================================
# ساخت فایل واحد بازی «سه طبقه تا بقا» نسخه‌ی ۷٫۰
# ترتیب: HTML/CSS + منطق۱ + رسم + کات‌سین + UI/حلقه
# (v3_part4 همیشه آخر است چون تگ‌های پایانی را دارد)
# ============================================================
cd /home/z/my-project
cat scripts/v3_part1.html scripts/v3_part2.js scripts/v3_part3.js scripts/v3_part5.js scripts/v3_part4.js \
  > download/three-floors-to-survival.html
echo "built: $(wc -l < download/three-floors-to-survival.html) lines, $(du -h download/three-floors-to-survival.html | cut -f1)"

# بررسی سینتکس بخش جاوااسکریپت (بین <script> و </script>)
sed -n '/^<script>$/,/^<\/script>$/p' download/three-floors-to-survival.html | sed '1d;$d' > /tmp/game_v7.js
node --check /tmp/game_v7.js && echo "JS syntax OK" || echo "JS SYNTAX ERROR"
