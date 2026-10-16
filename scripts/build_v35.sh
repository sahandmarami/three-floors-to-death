#!/bin/bash
# ============================================================
# ساخت نسخه‌ی ۳۵٫۰ — «سه طبقه تا مرگ»
# پایه: HTML نسخه‌ی ۳۴ (که همه‌ی ساختارهای v30..v34 را دارد)
# + ماژول v35 (وصله‌ی تکمیلی):
#   - زامبی‌های منوی اصلی: ترسناک و درشت (فک باز/دندان/چنگال/چشم سرخ)
#   - منوی اصلی روشن‌تر (پالت کامل M23 جایگزین شد)
#   - کاشی سلاح‌ها بی‌متن (آیکن + قیمت سکه‌ای + قفل + طلایی)
#   - معماها (رادیو/قفل/فیوز) هم باتن‌شیت اندرویدی شدند
#   - اسنک‌بار خرید مولوتوف + ضد سرریز متن‌ها
# ============================================================
cd /home/z/my-project
BASE=/home/z/my-project/scripts/base_v34.html
if [ ! -f "$BASE" ]; then
  echo "ERROR: $BASE not found"; exit 1
fi
# تزریق ماژول v35 قبل از </body>
python3 - << 'PYEOF'
base = open('/tmp/v34.html', encoding='utf-8').read()
mod = open('/home/z/my-project/scripts/v35_module.js', encoding='utf-8').read()
assert '</body>' in base
out = base.replace('</body>', '<script>\n' + mod + '\n</script>\n</body>', 1)
open('/home/z/my-project/download/three-floors-to-survival.html', 'w', encoding='utf-8').write(out)
print('v35 built:', out.count('\n'), 'lines')
PYEOF
node -e "new Function(require('fs').readFileSync('download/three-floors-to-survival.html','utf8').replace(/^[\s\S]*?<script>/,'').replace(/<\/script>[\s\S]*$/,'')); console.log('full syntax OK')" || node -e "
// چک سخت‌گیرانه‌تر: هر بلاک script جداگانه
const html = require('fs').readFileSync('download/three-floors-to-survival.html','utf8');
const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
let bad = 0;
blocks.forEach((b, i) => { try { new Function(b[1]); } catch (e) { bad++; console.log('BLOCK', i, 'ERR:', e.message.slice(0, 80)); } });
console.log(bad === 0 ? 'all ' + blocks.length + ' script blocks OK' : bad + ' bad blocks');
"
# استقرار: پیش‌نمایش زنده + APK
mkdir -p webserve
cp download/three-floors-to-survival.html webserve/three-floors-to-survival.html
cp download/three-floors-to-survival.html webserve/index.html
mkdir -p download/apk/www
cp download/three-floors-to-survival.html download/apk/www/index.html
echo "deployed: webserve/ + apk/www/"
