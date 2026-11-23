#!/bin/bash
# ============================================================
# ساخت نسخهٔ ۴۰٫۰ — «سه طبقه تا مرگ» — داستان کامل پرامپت روی پایهٔ v39
# تازه‌های ۴۰٫۰:
#   - داستان کامل طبق پرامپت: آرش/ارشان + تماس رادیویی مریم + پناهگاه=تله
#     + آژیر + پروندهٔ Z + توقف‌گاه + جدایی + ایستگاه شمالی/دکتر سارا + پایان باز
#   - فصل میانی پلتفرمر (۳ مرحلهٔ کنترا-سبک + چک‌پوینت + دی‌پد لمسی)
#   - دستفروش: بانک دیالوگ مستقل ۵ چهره + شک‌های آرش + اشاره‌های مرموز
#   - ۱۷۵ کلیپ صدای فارسی ElevenLabs با کلیدهای تازه کاربر (۱۵ صدا)
# معماری: پایهٔ HTML تک‌فایل v39 + تزریق voices40_data + v40_module قبل از </body>
# ============================================================
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
BASE="$ROOT/scripts/base_v39.html"
[ -f "$BASE" ] || { echo "ERROR: base v39 HTML not found"; exit 1; }

ROOT="$ROOT" node - <<'NODEEOF'
const fs = require('fs');
let base = fs.readFileSync(process.env.ROOT + '/scripts/base_v39.html', 'utf8');
/* حذف داده‌ی صوتی قدیمی v39 (در زمان اجرا به‌هرحال پاک می‌شود) — ~۲.۶MB صرفه‌جویی */
const i0 = base.indexOf('const VOICES23 = {');
if (i0 >= 0) {
  const i1 = base.indexOf('};\n', i0);
  base = base.slice(0, i0) + 'const VOICES23 = {};   /* (۴۰٫۰) داده‌ی صوتی از ماژول v40 پر می‌شود */\n' + base.slice(i1 + 3);
}
const voices = fs.readFileSync(process.env.ROOT + '/scripts/voices40_data.js', 'utf8');
const mod = fs.readFileSync(process.env.ROOT + '/scripts/v40_module.js', 'utf8');
if (base.split('</body>').length - 1 !== 1) throw new Error('body tag count');
const inject = '<script>\n' + voices + '\n</script>\n<script>\n' + mod + '\n</script>\n';
const out = base.replace('</body>', inject + '</body>', 1);
fs.writeFileSync(process.env.ROOT + '/download/three-floors-to-survival.html', out);
console.log('v40 built:', out.split('\n').length, 'lines,', (Buffer.byteLength(out) / 1048576).toFixed(1), 'MB');
NODEEOF

# چک سینتکس هر بلاک script جداگانه
node -e "
const html = require('fs').readFileSync('$ROOT/download/three-floors-to-survival.html', 'utf8');
const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
let bad = 0;
blocks.forEach((b, i) => { try { new Function(b[1]); } catch (e) { bad++; console.log('BLOCK', i, 'ERR:', e.message.slice(0, 100)); } });
console.log(bad === 0 ? 'all ' + blocks.length + ' script blocks OK' : bad + ' bad blocks');
"
# استقرار: پیش‌نمایش زنده + APK
mkdir -p webserve
cp download/three-floors-to-survival.html webserve/three-floors-to-survival.html
cp download/three-floors-to-survival.html webserve/index.html
mkdir -p download/apk/www
cp download/three-floors-to-survival.html download/apk/www/index.html
echo "deployed: webserve/ + apk/www/"
