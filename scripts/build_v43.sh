#!/bin/bash
# ============================================================
# ساخت نسخهٔ ۴۳٫۰ — بازسازی کامل بازخورد جلسهٔ ۴۳
#   - سینمایی پایان از صفر: کاراکترهای واقعی + ادبیات تازه + ریتم کوتاه
#   - پلتفرمر سبک ماریو: تایل/سکه/بلوک ؟/لوله/پرچم/لگد/سیو/صدا
#   - زامبی‌های داستان پا روی زمین + بج v43
# معماری: base_v39 + voices40 + voices42 + voices43 + v40 + v42 + v43(۴ بخش)
# ============================================================
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ROOT="$ROOT" node - <<'NODEEOF'
const fs = require('fs');
let base = fs.readFileSync(process.env.ROOT + '/scripts/base_v39.html', 'utf8');
/* حذف داده‌ی صوتی قدیمی v39 (در زمان اجرا پاک می‌شود) */
const i0 = base.indexOf('const VOICES23 = {');
if (i0 >= 0) {
  const i1 = base.indexOf('};\n', i0);
  base = base.slice(0, i0) + 'const VOICES23 = {};   /* (۴۰٫۰) داده‌ی صوتی از ماژول‌ها پر می‌شود */\n' + base.slice(i1 + 3);
}
const read = p => fs.readFileSync(process.env.ROOT + '/scripts/' + p, 'utf8');
const voices = read('voices40_data.js');
const voices42 = read('voices42_data.js');
const voices43 = read('voices43_data.js');
const mod = read('v40_module.js');
const mod42 = read('v42_module.js');
const v43cine = read('v43_cine.js');
const v43end = read('v43_ending.js');
const v43plat = read('v43_plat.js');
const v43fix = read('v43_fixes.js');
if (base.split('</body>').length - 1 !== 1) throw new Error('body tag count');
const inject =
  '<script>\n' + voices + '\n</script>\n' +
  '<script>\n' + voices42 + '\n</script>\n' +
  '<script>\n' + voices43 + '\n</script>\n' +
  '<script>\n' + mod + '\n</script>\n' +
  '<script>\n' + mod42 + '\n</script>\n' +
  '<script>\n' + v43cine + '\n</script>\n' +
  '<script>\n' + v43end + '\n</script>\n' +
  '<script>\n' + v43plat + '\n</script>\n' +
  '<script>\n' + v43fix + '\n</script>\n';
const out = base.replace('</body>', inject + '</body>', 1);
fs.writeFileSync(process.env.ROOT + '/download/three-floors-to-survival.html', out);
console.log('v43 built:', out.split('\n').length, 'lines,', (Buffer.byteLength(out) / 1048576).toFixed(1), 'MB');
NODEEOF

# چک سینتکس هر بلاک script جداگانه
node -e "
const html = require('fs').readFileSync('$ROOT/download/three-floors-to-survival.html', 'utf8');
const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
let bad = 0;
blocks.forEach((b, i) => { try { new Function(b[1]); } catch (e) { bad++; console.log('BLOCK', i, 'ERR:', e.message.slice(0, 160)); } });
console.log(bad === 0 ? 'all ' + blocks.length + ' script blocks OK' : bad + ' bad blocks');
"
