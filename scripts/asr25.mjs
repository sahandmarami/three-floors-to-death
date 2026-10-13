// asr25.mjs — راستی‌آزمایی فارسی‌بودن همه‌ی کلیپ‌های خام v25
// خروجی: scripts/voice25_asr.json = { key: {pass, ratio, match, text} }
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import { execSync } from 'child_process';

const RAW = '/home/z/my-project/scripts/voice25/_raw';
const WAV = '/home/z/my-project/scripts/voice25/_wav';
const OUT = '/home/z/my-project/scripts/voice25_asr.json';
const sleep = ms => new Promise(r => setTimeout(r, ms));

function faRatio(txt) {
  const letters = [...txt].filter(c => /\p{L}/u.test(c));
  if (!letters.length) return 0;
  const fa = letters.filter(c => /[\u0600-\u06FF\uFB50-\uFEFF]/.test(c));
  return fa.length / letters.length;
}
function normFa(s) {
  return s.normalize('NFKC').replace(/[\u064B-\u0652\u0670\u0653-\u0655\u200c\u200f\u0640]/g, '')
    .replace(/[إأآىيک]/g, m => ({ 'إ': 'ا', 'أ': 'ا', 'آ': 'ا', 'ى': 'ی', 'ي': 'ی', 'ک': 'ک' }[m]))
    .replace(/[^\p{L}\p{N}]/gu, '');
}
function wordMatch(asr, target) {
  const tw = target.split(/\s+/).map(normFa).filter(w => w.length >= 2);
  if (!tw.length) return 1;
  const blob = normFa(asr);
  let hit = 0;
  for (const w of tw) {
    if (blob.includes(w)) hit += 1;
    else if (w.length >= 4 && blob.includes(w.slice(0, Math.ceil(w.length * 0.6)))) hit += 0.6;
  }
  return hit / tw.length;
}

async function main() {
  const zai = await ZAI.create();
  const lines = fs.readFileSync('/home/z/my-project/scripts/dialogues23.py', 'utf8');
  // استخراج (key, who, fa) — سبک
  const targets = {};
  for (const m of lines.matchAll(/\('([a-z0-9]+)',\s*'([a-z])',\s*'((?:[^'\\]|\\.)*)',/g)) {
    let fa = m[3].replace(/\\u200c/g, '\u200c').replace(/\\'/g, "'");
    targets[m[1]] = { who: m[2], fa };
  }
  const files = fs.readdirSync(RAW).filter(f => f.endsWith('.mp3'));
  const results = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
  let i = 0;
  for (const f of files) {
    const key = f.replace('.mp3', '');
    if (results[key] && results[key].pass) continue;          // قبلاً قبول شده
    const t = targets[key];
    if (!t) continue;
    const wav = `${WAV}/${key}.wav`;
    try { execSync(`ffmpeg -y -loglevel error -i "${RAW}/${f}" -ar 16000 -ac 1 "${wav}"`); }
    catch (e) { console.log(`[${key}] wav-fail`); continue; }
    for (let a = 1; a <= 6; a++) {
      try {
        const b64 = fs.readFileSync(wav).toString('base64');
        const res = await zai.audio.asr.create({ file_base64: b64 });
        const text = (res.text || '').trim();
        const ratio = faRatio(text);
        const match = wordMatch(text, t.fa);
        const pass = (ratio >= 0.6 && match >= 0.3) || (ratio >= 0.9 && match >= 0.15);
        results[key] = { pass, ratio: +ratio.toFixed(2), match: +match.toFixed(2), text: text.slice(0, 120) };
        console.log(`[${key}] ${pass ? 'PASS' : 'FAIL'} r=${ratio.toFixed(2)} m=${match.toFixed(2)} :: ${text.slice(0, 70)}`);
        break;
      } catch (e) {
        if (a === 6) { console.log(`[${key}] ASR-ERR ${e.message.slice(0, 40)}`); }
        else await sleep(9000 * a);
      }
    }
    fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
    await sleep(6500);
    if (++i % 20 === 0) console.log(`-- ${i}/${files.length} checked`);
  }
  const passN = Object.values(results).filter(r => r.pass).length;
  console.log(`\nTOTAL: ${passN}/${files.length} PASS`);
}
main();
