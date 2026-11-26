#!/bin/bash
# ============================================================
# ساخت نسخهٔ ۴۴٫۰ — بازسازی داستانی کامل «سه طبقه تا مرگ»
#   - حذف کامل پلتفرمر (سه لایه: v40/v43_plat/v43_ending)
#   - داستان جدید ۳۶ شب با رجیستری دیالوگ و تصمیم‌های واقعی
#   - پنج ملاقات فروشنده + آرشیو مدارک پروژهٔ Z + سه پایان
#   - Assetهای اختصاصی کاربر (پرتره/اسپرایت/مدارک)
# معماری: base_v39 + assets44 + voices(40/42/43/44) + v44_nights +
#          v44_merchant + v44_ending + v40 + v42 + v43_cine + v43_ending + v43_fixes + v44_save
# ============================================================
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ROOT="$ROOT" node - <<'NODEEOF'
const fs = require('fs');
let base = fs.readFileSync(process.env.ROOT + '/scripts/base_v39.html', 'utf8');

const read = p => fs.readFileSync(process.env.ROOT + '/scripts/' + p, 'utf8');

/* حذف دادهٔ صوتی قدیمی v39 درونِ base (در زمان اجرا از ماژول‌ها پر می‌شود) */
const i0 = base.indexOf('const VOICES23 = {');
if (i0 >= 0) {
  const i1 = base.indexOf('};\n', i0);
  base = base.slice(0, i0) + 'const VOICES23 = {};   /* (۴۰٫۰) داده‌ی صوتی از ماژول‌ها پر می‌شود */\n' + base.slice(i1 + 3);
}

/* voices43: حذف کلیدهای p43* (بارک‌های پلتفرمر حذف‌شده) */
let voices43 = read('voices43_data.js')
  .replace(/p43[a-z0-9]+\s*:\s*\{[^{}]*\},?\n?/g, '');

const voices40 = read('voices40_data.js');
const voices42 = read('voices42_data.js');
const has44 = fs.existsSync(process.env.ROOT + '/scripts/voices44_data.js');
const voices44 = has44 ? read('voices44_data.js') : 'const VOICES44_DATA = {};';

const assets44 = read('assets44_data.js');
const v44nights = read('v44_nights.js');
const v44merchant = read('v44_merchant.js');
const v44ending = read('v44_ending.js');
const mod = read('v40_module.js');
const mod42 = read('v42_module.js');
const v43cine = read('v43_cine.js');
const v43end = read('v43_ending.js');
const v43fix = read('v43_fixes.js');
const v44save = read('v44_save.js');

if (base.split('</body>').length - 1 !== 1) throw new Error('body tag count');
const inject =
  '<script>\n' + assets44 + '\n</script>\n' +
  '<script>\n' + voices40 + '\n</script>\n' +
  '<script>\n' + voices42 + '\n</script>\n' +
  '<script>\n' + voices43 + '\n</script>\n' +
  '<script>\n' + voices44 + '\n</script>\n' +
  '<script>\n' + v44nights + '\n</script>\n' +
  '<script>\n' + mod + '\n</script>\n' +
  '<script>\n' + mod42 + '\n</script>\n' +
  '<script>\n' + v44merchant + '\n</script>\n' +
  '<script>\n' + v44ending + '\n</script>\n' +
  '<script>\n' + v43cine + '\n</script>\n' +
  '<script>\n' + v43end + '\n</script>\n' +
  '<script>\n' + v43fix + '\n</script>\n' +
  '<script>\n' + v44save + '\n</script>\n';
const out = base.replace('</body>', inject + '</body>', 1);
fs.writeFileSync(process.env.ROOT + '/download/three-floors-to-survival.html', out);
console.log('v44 built:', out.split('\n').length, 'lines,', (Buffer.byteLength(out) / 1048576).toFixed(1), 'MB', has44 ? '(with voices44)' : '(no voices44 yet)');
NODEEOF

# چک سینتکس هر بلاک script جداگانه
node -e "
const html = require('fs').readFileSync('$ROOT/download/three-floors-to-survival.html', 'utf8');
const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
let bad = 0;
blocks.forEach((b, i) => { try { new Function(b[1]); } catch (e) { bad++; console.log('BLOCK', i, 'ERR:', e.message.slice(0, 160)); } });
console.log(bad === 0 ? 'all ' + blocks.length + ' script blocks OK' : bad + ' bad blocks');
"
