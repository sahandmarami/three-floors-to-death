#!/bin/bash
# ============================================================
# ساخت نسخهٔ ۴۲٫۰ — رفع بازخورد جلسهٔ ۴۲
#   - دکمه‌های صفحهٔ باخت + زامبی‌های رنگی منو/داستان
#   - دستفروش: ضدتکرار منسجم + آیکون‌های تازه
#   - منوی سازنده + پاداش سرنخ‌ها + شب‌نامه + تیزر Z
# معماری: base_v39 + voices40 + voices42 + v40_module + v42_module
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
const voices = fs.readFileSync(process.env.ROOT + '/scripts/voices40_data.js', 'utf8');
const voices42 = fs.readFileSync(process.env.ROOT + '/scripts/voices42_data.js', 'utf8');
const mod = fs.readFileSync(process.env.ROOT + '/scripts/v40_module.js', 'utf8');
const mod42 = fs.readFileSync(process.env.ROOT + '/scripts/v42_module.js', 'utf8');
if (base.split('</body>').length - 1 !== 1) throw new Error('body tag count');
const inject =
  '<script>\n' + voices + '\n</script>\n' +
  '<script>\n' + voices42 + '\n</script>\n' +
  '<script>\n' + mod + '\n</script>\n' +
  '<script>\n' + mod42 + '\n</script>\n';
const out = base.replace('</body>', inject + '</body>', 1);
fs.writeFileSync(process.env.ROOT + '/download/three-floors-to-survival.html', out);
console.log('v42 built:', out.split('\n').length, 'lines,', (Buffer.byteLength(out) / 1048576).toFixed(1), 'MB');
NODEEOF

# چک سینتکس هر بلاک script جداگانه
node -e "
const html = require('fs').readFileSync('$ROOT/download/three-floors-to-survival.html', 'utf8');
const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
let bad = 0;
blocks.forEach((b, i) => { try { new Function(b[1]); } catch (e) { bad++; console.log('BLOCK', i, 'ERR:', e.message.slice(0, 120)); } });
console.log(bad === 0 ? 'all ' + blocks.length + ' script blocks OK' : bad + ' bad blocks');
"
